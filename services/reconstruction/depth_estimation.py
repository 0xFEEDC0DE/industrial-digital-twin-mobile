import numpy as np
import cv2
from typing import List, Tuple, Optional, Dict
import logging

logger = logging.getLogger(__name__)

class DepthEstimation:
    """
    Dense depth estimation from multi-view stereo (MVS).
    Uses cost volume or plane-sweep for depth prediction.
    """

    def __init__(self, camera_matrix: np.ndarray, depth_range: Tuple[float, float] = (0.1, 100.0)):
        self.camera_matrix = camera_matrix
        self.near_plane, self.far_plane = depth_range

    def plane_sweep(
        self,
        reference_frame: np.ndarray,
        source_frames: List[np.ndarray],
        reference_pose: np.ndarray,
        source_poses: List[np.ndarray],
        num_planes: int = 32,
    ) -> np.ndarray:
        """
        Plane-sweep depth estimation.
        For each depth plane, warp source frames to reference and compute cost.
        Returns depth map.
        """
        h, w = reference_frame.shape[:2]
        depth_map = np.zeros((h, w), dtype=np.float32)
        cost_map = np.full((h, w), 1e6, dtype=np.float32)

        # Generate depth planes
        depth_planes = np.linspace(self.near_plane, self.far_plane, num_planes)

        for depth in depth_planes:
            cost = 0.0

            for source_frame, source_pose in zip(source_frames, source_poses):
                # Warp source frame to reference using homography
                H = self._compute_homography(
                    reference_pose,
                    source_pose,
                    depth,
                    self.camera_matrix,
                )

                warped = cv2.warpPerspective(source_frame, H, (w, h))
                
                # Compute photometric error
                diff = cv2.absdiff(reference_frame, warped)
                cost += np.sum(diff)

            # Update depth map where cost is lower
            mask = cost < cost_map
            depth_map[mask] = depth
            cost_map[mask] = cost

        return depth_map

    def _compute_homography(
        self,
        P1: np.ndarray,
        P2: np.ndarray,
        depth_value: float,
        K: np.ndarray,
    ) -> np.ndarray:
        """
        Compute homography for plane-sweep based on camera poses and depth.
        """
        # Simplified: assumes planar scene at given depth
        R1, t1 = P1[:3, :3], P1[:3, 3]
        R2, t2 = P2[:3, :3], P2[:3, 3]

        # Relative rotation and translation
        R = R2 @ R1.T
        t = t2 - R @ t1

        # Homography for planar scene
        normal = np.array([0, 0, 1])  # Plane normal in reference frame
        H = K @ (R - np.outer(t, normal) / depth_value) @ np.linalg.inv(K)

        return H / H[2, 2]

    def regularize_depth_map(
        self,
        depth_map: np.ndarray,
        sigma_spatial: float = 5.0,
        sigma_range: float = 0.1,
    ) -> np.ndarray:
        """
        Smooth depth map using bilateral filtering to preserve edges.
        """
        return cv2.bilateralFilter(
            depth_map,
            d=9,
            sigmaColor=sigma_range,
            sigmaSpace=sigma_spatial,
        )

    def depth_maps_to_point_cloud(
        self,
        depth_maps: List[np.ndarray],
        camera_poses: List[np.ndarray],
        rgb_frames: List[np.ndarray],
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Convert depth maps from multiple views into a unified point cloud.
        
        Returns:
            (points_3d, colors)
        """
        points = []
        colors = []

        for depth_map, pose, rgb_frame in zip(depth_maps, camera_poses, rgb_frames):
            points_view, colors_view = self._depth_to_points(depth_map, pose, rgb_frame)
            points.extend(points_view)
            colors.extend(colors_view)

        return np.array(points), np.array(colors)

    def _depth_to_points(
        self,
        depth_map: np.ndarray,
        camera_pose: np.ndarray,
        rgb_frame: np.ndarray,
    ) -> Tuple[List[np.ndarray], List[np.ndarray]]:
        """
        Convert single depth map to 3D points in world coordinates.
        """
        h, w = depth_map.shape
        R, t = camera_pose[:3, :3], camera_pose[:3, 3]

        points_3d = []
        colors_rgb = []

        # Create pixel grid
        x, y = np.meshgrid(np.arange(w), np.arange(h))
        z = depth_map

        # Unproject to 3D (camera coordinates)
        K_inv = np.linalg.inv(self.camera_matrix)
        fx, fy, cx, cy = self.camera_matrix[0, 0], self.camera_matrix[1, 1], self.camera_matrix[0, 2], self.camera_matrix[1, 2]

        X = (x - cx) * z / fx
        Y = (y - cy) * z / fy
        Z = z

        # Transform to world coordinates
        for i in range(h):
            for j in range(w):
                if Z[i, j] > 0:
                    p_cam = np.array([X[i, j], Y[i, j], Z[i, j]])
                    p_world = R.T @ (p_cam - t)
                    points_3d.append(p_world)
                    colors_rgb.append(rgb_frame[i, j, :] / 255.0)

        return points_3d, colors_rgb
