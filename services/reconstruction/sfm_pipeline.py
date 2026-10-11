import numpy as np
import cv2
from typing import List, Tuple, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class CameraCalibration:
    """
    Handle camera intrinsics for mobile devices.
    For mobile phones, use standard calibration or load from device metadata.
    """

    # Standard mobile phone calibration (iPhone 15 Pro example)
    STANDARD_CALIBRATIONS = {
        'iphone-15-pro': {
            'fx': 2532.0,
            'fy': 2532.0,
            'cx': 1170.0,
            'cy': 2532.0 / 2,
            'width': 1170,
            'height': 2532,
        },
        'pixel-8-pro': {
            'fx': 1920.0,
            'fy': 1920.0,
            'cx': 960.0,
            'cy': 1440.0 / 2,
            'width': 1440,
            'height': 1920,
        },
        'ipad-pro': {
            'fx': 3264.0,
            'fy': 3264.0,
            'cx': 2448.0 / 2,
            'cy': 3264.0 / 2,
            'width': 2448,
            'height': 3264,
        },
    }

    def __init__(self, device_type: str = 'iphone-15-pro', custom_K: Optional[np.ndarray] = None):
        if custom_K is not None:
            self.K = custom_K
        else:
            cal = self.STANDARD_CALIBRATIONS.get(device_type)
            if cal is None:
                raise ValueError(f"Unknown device type: {device_type}")
            
            self.K = np.array([
                [cal['fx'], 0, cal['cx']],
                [0, cal['fy'], cal['cy']],
                [0, 0, 1],
            ])
            self.device_type = device_type

    def undistort_frame(self, frame: np.ndarray, distortion_coeffs: Optional[np.ndarray] = None) -> np.ndarray:
        """
        Undistort frame using camera matrix and distortion coefficients.
        """
        if distortion_coeffs is None:
            return frame
        return cv2.undistort(frame, self.K, distortion_coeffs)


class StructureFromMotion:
    """
    Core SfM pipeline: camera pose estimation and triangulation.
    """

    def __init__(self, camera_matrix: np.ndarray, max_iterations: int = 100):
        self.camera_matrix = camera_matrix
        self.max_iterations = max_iterations
        self.keyframes = []  # List of (frame_idx, keypoints, descriptors, pose)
        self.point_cloud = []  # List of 3D points
        self.point_colors = []  # RGB colors for each point

    def initialize_from_two_frames(
        self,
        frame1: np.ndarray,
        frame2: np.ndarray,
        kp1: List,
        kp2: List,
        matches: List,
    ) -> Tuple[bool, Optional[np.ndarray]]:
        """
        Initialize SfM using two-frame geometry (epipolar geometry).
        Computes fundamental matrix and recovers camera pose.
        
        Returns:
            (success, points_3d)
        """
        if len(matches) < 8:
            logger.warning("Not enough matches for two-frame initialization")
            return False, None

        # Extract matched points
        src_pts = np.float32([kp1[m.queryIdx].pt for m in matches]).reshape(-1, 1, 2)
        dst_pts = np.float32([kp2[m.trainIdx].pt for m in matches]).reshape(-1, 1, 2)

        # Compute fundamental matrix
        F, mask = cv2.findFundamentalMat(src_pts, dst_pts, cv2.FM_RANSAC, 1.0, 0.99)
        if F is None:
            logger.error("Failed to compute fundamental matrix")
            return False, None

        # Compute essential matrix from fundamental matrix
        E = self.camera_matrix.T @ F @ self.camera_matrix

        # Recover camera pose from essential matrix
        _, R, t, mask = cv2.recoverPose(E, src_pts, dst_pts, self.camera_matrix, mask=mask)

        # Triangulate points
        P1 = self.camera_matrix @ np.hstack([np.eye(3), np.zeros((3, 1))])
        P2 = self.camera_matrix @ np.hstack([R, t])

        points_4d = cv2.triangulatePoints(P1, P2, src_pts, dst_pts)
        points_3d = (points_4d[:3] / points_4d[3]).T

        # Filter points (keep those in front of both cameras)
        valid_points = []
        for p in points_3d:
            if p[2] > 0 and np.linalg.norm(p) < 1000:  # Reasonable depth range
                valid_points.append(p)

        if len(valid_points) < 20:
            logger.warning(f"Only {len(valid_points)} valid 3D points, likely insufficient geometry")
            return False, None

        self.point_cloud = valid_points
        logger.info(f"SfM initialization: recovered {len(valid_points)} 3D points")
        return True, np.array(valid_points)

    def add_frame_incremental(
        self,
        frame: np.ndarray,
        kp: List,
        des: np.ndarray,
        matches_to_cloud: List,
    ) -> Tuple[bool, Optional[np.ndarray]]:
        """
        Add a new frame to the reconstruction incrementally.
        Solves PnP to estimate camera pose, then triangulates new points.
        
        Returns:
            (success, camera_pose)
        """
        if len(self.point_cloud) == 0:
            logger.warning("Point cloud not initialized")
            return False, None

        if len(matches_to_cloud) < 4:
            logger.warning("Not enough matches to established point cloud")
            return False, None

        # Extract 3D points and 2D image points
        object_points = np.array([self.point_cloud[m.trainIdx] for m in matches_to_cloud])
        image_points = np.array([kp[m.queryIdx].pt for m in matches_to_cloud])

        # Solve PnP
        success, rvec, tvec = cv2.solvePnP(
            object_points,
            image_points,
            self.camera_matrix,
            None,
            useExtrinsicGuess=False,
            flags=cv2.SOLVEPNP_ITERATIVE,
        )

        if not success:
            logger.warning("PnP failed")
            return False, None

        # Convert rotation vector to rotation matrix
        R, _ = cv2.Rodrigues(rvec)
        pose = np.hstack([R, tvec])

        logger.info(f"Frame added: camera pose estimated")
        return True, pose

    def get_point_cloud(self) -> np.ndarray:
        """
        Return current point cloud as Nx3 array.
        """
        return np.array(self.point_cloud)
