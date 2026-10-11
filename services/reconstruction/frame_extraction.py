import cv2
import numpy as np
from typing import List, Tuple
import logging

logger = logging.getLogger(__name__)

class FrameExtractor:
    """
    Extract frames from video with quality filtering and keyframe selection.
    """

    @staticmethod
    def extract_from_video(video_path: str, target_fps: int = 5) -> List[np.ndarray]:
        """
        Extract frames from video file at target FPS.
        Returns list of BGR frames.
        """
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_interval = max(1, int(fps / target_fps))
        
        frames = []
        frame_idx = 0
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            if frame_idx % frame_interval == 0:
                frames.append(frame)
            frame_idx += 1
        
        cap.release()
        logger.info(f"Extracted {len(frames)} frames from video at {target_fps} fps")
        return frames

    @staticmethod
    def select_keyframes(frames: List[np.ndarray], min_overlap: float = 0.3) -> List[int]:
        """
        Select keyframes based on feature overlap with previous frame.
        Removes highly redundant frames.
        Returns list of selected frame indices.
        """
        if len(frames) == 0:
            return []
        
        selected = [0]  # Always include first frame
        orb = cv2.ORB_create(nfeatures=500)
        
        prev_descriptors = None
        
        for idx, frame in enumerate(frames[1:], start=1):
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            _, descriptors = orb.detectAndCompute(gray, None)
            
            if prev_descriptors is None:
                selected.append(idx)
                prev_descriptors = descriptors
                continue
            
            # Match features
            bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=True)
            try:
                matches = bf.match(prev_descriptors, descriptors)
                overlap_ratio = len(matches) / max(len(prev_descriptors), len(descriptors))
            except:
                overlap_ratio = 0.0
            
            # Select if sufficient difference from previous selected frame
            if overlap_ratio < min_overlap:
                selected.append(idx)
                prev_descriptors = descriptors
        
        logger.info(f"Selected {len(selected)} keyframes from {len(frames)} total")
        return selected

    @staticmethod
    def resize_frames(frames: List[np.ndarray], target_size: Tuple[int, int] = (640, 480)) -> List[np.ndarray]:
        """
        Resize frames to target size for processing efficiency.
        """
        resized = []
        for frame in frames:
            h, w = frame.shape[:2]
            scale = min(target_size[0] / w, target_size[1] / h)
            new_w, new_h = int(w * scale), int(h * scale)
            resized_frame = cv2.resize(frame, (new_w, new_h))
            resized.append(resized_frame)
        return resized
