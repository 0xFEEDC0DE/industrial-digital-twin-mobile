import numpy as np
from typing import List, Tuple, Dict, Optional
import json
import logging

logger = logging.getLogger(__name__)

class GaussianSplatGenerator:
    """
    Generate Gaussian splat scene from multi-view images and camera poses.
    Simplified version: stores point cloud with per-point Gaussians.
    Full version would use neural field optimization.
    """

    def __init__(self, points_3d: np.ndarray, colors: np.ndarray, camera_poses: List[np.ndarray]):
        """
        Args:
            points_3d: Nx3 array of 3D point positions
            colors: Nx3 array of RGB colors [0, 1]
            camera_poses: List of camera pose matrices (4x4)
        """
        self.points_3d = points_3d
        self.colors = colors
        self.camera_poses = camera_poses
        self.gaussians = None

    def compute_gaussians(
        self,
        use_pca: bool = True,
    ) -> np.ndarray:
        """
        Compute Gaussian parameters (position, covariance, opacity, color) for each point.
        Simplified approach: use isotropic Gaussians with estimated radius.
        
        Returns:
            Array of Gaussian parameters
        """
        gaussians = []

        for i, point in enumerate(self.points_3d):
            # Estimate local radius from nearest neighbors
            dists = np.linalg.norm(self.points_3d - point, axis=1)
            radius = np.median(dists[dists > 0]) / 2.0

            # Anisotropic covariance (simplified: isotropic for now)
            covariance = np.eye(3) * (radius ** 2)

            # Compute opacity based on visibility
            opacity = min(1.0, 0.8 + 0.2 * (i % 10) / 10.0)  # Dummy; would be learned

            gaussian = {
                'position': self.points_3d[i].tolist(),
                'covariance': covariance.tolist(),
                'color': self.colors[i].tolist(),
                'opacity': opacity,
                'radius': float(radius),
            }
            gaussians.append(gaussian)

        self.gaussians = gaussians
        logger.info(f"Computed {len(gaussians)} Gaussians")
        return np.array(gaussians)

    def export_splat_json(self, output_path: str) -> None:
        """
        Export Gaussian splat scene as JSON for three.js or Babylon.js viewer.
        """
        if self.gaussians is None:
            self.compute_gaussians()

        scene_data = {
            'version': '1.0',
            'type': 'gaussian-splat',
            'pointCount': len(self.gaussians),
            'gaussians': self.gaussians,
            'cameras': [
                {
                    'position': pose[:3, 3].tolist(),
                    'rotation': pose[:3, :3].tolist(),
                }
                for pose in self.camera_poses
            ],
        }

        with open(output_path, 'w') as f:
            json.dump(scene_data, f, indent=2)

        logger.info(f"Gaussian splat exported to {output_path}")

    def export_splat_binary(self, output_path: str) -> None:
        """
        Export Gaussian splat as binary format (PLY-like) for efficient storage.
        Format: position (3x float32) + color (3x uint8) + covariance (6x float16) + opacity (float16)
        """
        if self.gaussians is None:
            self.compute_gaussians()

        data = []
        for g in self.gaussians:
            pos = np.array(g['position'], dtype=np.float32)
            col = (np.array(g['color']) * 255).astype(np.uint8)
            cov_flat = np.array(g['covariance']).flatten().astype(np.float16)
            opa = np.array([g['opacity']], dtype=np.float16)
            data.append(np.concatenate([pos, col, cov_flat, opa]))

        data_array = np.array(data)
        data_array.tofile(output_path)

        logger.info(f"Gaussian splat binary exported to {output_path}")
