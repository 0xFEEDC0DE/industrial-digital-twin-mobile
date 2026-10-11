import numpy as np
import cv2
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)

class FeatureDetector:
    """
    Detect and match features across frames for SfM.
    """

    def __init__(self, feature_type: str = 'orb', max_features: int = 1000):
        self.feature_type = feature_type
        self.max_features = max_features
        
        if feature_type == 'orb':
            self.detector = cv2.ORB_create(nfeatures=max_features)
        elif feature_type == 'sift':
            self.detector = cv2.SIFT_create()
        else:
            raise ValueError(f"Unknown feature type: {feature_type}")

    def detect_and_compute(self, frame: np.ndarray) -> Tuple[List, np.ndarray]:
        """
        Detect keypoints and compute descriptors for a single frame.
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        keypoints, descriptors = self.detector.detectAndCompute(gray, None)
        return keypoints, descriptors

    def match_frames(self, kp1: List, des1: np.ndarray, kp2: List, des2: np.ndarray) -> List:
        """
        Match features between two frames.
        Returns list of cv2.DMatch objects.
        """
        if des1 is None or des2 is None:
            return []
        
        bf = cv2.BFMatcher(cv2.NORM_HAMMING if self.feature_type == 'orb' else cv2.NORM_L2, crossCheck=True)
        matches = bf.match(des1, des2)
        matches = sorted(matches, key=lambda x: x.distance)
        return matches

    def filter_matches_ransac(self, kp1: List, kp2: List, matches: List, threshold: float = 1.0) -> Tuple[List, np.ndarray]:
        """
        Filter matches using RANSAC to remove outliers.
        Returns filtered matches and fundamental matrix.
        """
        if len(matches) < 8:
            return matches, None
        
        src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
        dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)
        
        F, mask = cv2.findFundamentalMat(src_pts, dst_pts, cv2.FM_RANSAC, threshold, 0.99)
        
        if mask is None:
            return matches, F
        
        filtered_matches = [m for m, msk in zip(matches, mask) if msk[0]]
        return filtered_matches, F
