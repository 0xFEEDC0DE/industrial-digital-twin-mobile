import cv2
import numpy as np
from typing import List, Tuple, Dict
import logging

logger = logging.getLogger(__name__)

class FrameQualityScorer:
    """
    Scores individual frames for reconstruction quality.
    Metrics: sharpness, exposure, feature count, overlap with previous.
    """

    def __init__(self, blur_threshold: float = 100.0):
        self.blur_threshold = blur_threshold
        self.previous_frame = None
        self.previous_keypoints = None

    def score_sharpness(self, frame: np.ndarray) -> float:
        """
        Compute Laplacian variance (Laplacian blur detection).
        Higher = sharper.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
        return float(laplacian_var)

    def score_exposure(self, frame: np.ndarray) -> float:
        """
        Score based on histogram spread and brightness.
        Penalize over/under-exposure.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        
        # Ideal brightness range: 30-200 (out of 255)
        lower_bound = np.sum(hist[:30]) / hist.sum()
        upper_bound = np.sum(hist[200:]) / hist.sum()
        
        exposure_score = 1.0 - (lower_bound + upper_bound) / 2.0
        return float(np.clip(exposure_score, 0.0, 1.0))

    def score_overlap(self, frame: np.ndarray) -> Tuple[float, int]:
        """
        Detect features and compare with previous frame.
        Returns overlap percentage and feature count.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        orb = cv2.ORB_create(nfeatures=1000)
        keypoints, descriptors = orb.detectAndCompute(gray, None)
        
        feature_count = len(keypoints)
        
        if self.previous_keypoints is None or descriptors is None:
            self.previous_keypoints = keypoints
            return 1.0, feature_count
        
        # Match features with previous frame
        bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
        try:
            matches = bf.match(self.previous_keypoints[1], descriptors)
            matches = sorted(matches, key=lambda x: x.distance)
            
            # Overlap ratio: matched features / total features
            overlap = len(matches) / max(len(self.previous_keypoints), feature_count)
        except:
            overlap = 0.0
        
        self.previous_keypoints = (keypoints, descriptors)
        return float(np.clip(overlap, 0.0, 1.0)), feature_count

    def score_frame(self, frame: np.ndarray) -> Dict[str, float]:
        """
        Compute composite quality score.
        Returns: {
            'overall': 0-100,
            'sharpness': 0-1,
            'exposure': 0-1,
            'overlap': 0-1,
            'features': int
        }
        """
        sharpness_raw = self.score_sharpness(frame)
        sharpness = float(np.clip(sharpness_raw / self.blur_threshold, 0.0, 1.0))
        
        exposure = self.score_exposure(frame)
        overlap, features = self.score_overlap(frame)
        
        # Composite score
        overall = (sharpness * 0.4 + exposure * 0.3 + overlap * 0.3) * 100
        
        return {
            'overall': float(overall),
            'sharpness': sharpness,
            'exposure': exposure,
            'overlap': overlap,
            'features': features,
        }
