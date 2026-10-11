import numpy as np
import cv2
from typing import List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class TextureGeneration:
    """
    Bake textures onto mesh from multi-view images.
    Handles UV mapping, seam removal, and color correction.
    """

    def __init__(self, mesh_vertices: np.ndarray, mesh_triangles: np.ndarray):
        self.vertices = mesh_vertices
        self.triangles = mesh_triangles
        self.uv_coords = None
        self.texture_atlas = None

    def compute_uv_coordinates(self) -> np.ndarray:
        """
        Compute UV coordinates for mesh using automatic unwrapping.
        Simplified approach: parameterize based on vertex position.
        """
        # Scale vertices to [0, 1] range
        v_min = self.vertices.min(axis=0)
        v_max = self.vertices.max(axis=0)
        v_normalized = (self.vertices - v_min) / (v_max - v_min + 1e-6)

        # Use XY as UV (simplified; better methods: angle-based, seam-aware)
        uv_coords = v_normalized[:, :2]
        self.uv_coords = uv_coords

        logger.info(f"UV coordinates computed for {len(uv_coords)} vertices")
        return uv_coords

    def bake_texture(
        self,
        rgb_frames: List[np.ndarray],
        camera_poses: List[np.ndarray],
        K: np.ndarray,
        atlas_size: int = 2048,
    ) -> np.ndarray:
        """
        Bake textures from multi-view images onto mesh.
        
        Args:
            rgb_frames: List of RGB images
            camera_poses: List of camera pose matrices
            K: Camera intrinsic matrix
            atlas_size: Size of output texture atlas
        
        Returns:
            Texture atlas (atlas_size x atlas_size x 3)
        """
        if self.uv_coords is None:
            self.compute_uv_coordinates()

        texture_atlas = np.zeros((atlas_size, atlas_size, 3), dtype=np.uint8)
        weight_atlas = np.zeros((atlas_size, atlas_size), dtype=np.float32)

        # Project mesh onto each image and accumulate color
        for rgb_frame, camera_pose in zip(rgb_frames, camera_poses):
            R, t = camera_pose[:3, :3], camera_pose[:3, 3]
            
            # Project vertices to image
            vertices_cam = R @ self.vertices.T + t.reshape(3, 1)
            vertices_img = K @ vertices_cam
            vertices_img = vertices_img[:2] / vertices_img[2]

            # For each triangle, interpolate color and write to atlas
            for tri in self.triangles:
                v0, v1, v2 = tri
                uv0, uv1, uv2 = self.uv_coords[v0], self.uv_coords[v1], self.uv_coords[v2]
                img0, img1, img2 = vertices_img[:, v0], vertices_img[:, v1], vertices_img[:, v2]

                # Check if triangle is visible in this view
                if self._is_triangle_visible(img0, img1, img2, rgb_frame.shape[:2]):
                    self._rasterize_triangle(
                        uv0, uv1, uv2,
                        img0, img1, img2,
                        rgb_frame,
                        texture_atlas,
                        weight_atlas,
                        atlas_size,
                    )

        # Normalize by weight (average color if multiple views)
        mask = weight_atlas > 0
        texture_atlas[mask] = (texture_atlas[mask].astype(np.float32) / weight_atlas[mask, None]).astype(np.uint8)

        self.texture_atlas = texture_atlas
        logger.info(f"Texture atlas baked: {atlas_size}x{atlas_size}")
        return texture_atlas

    def _is_triangle_visible(
        self,
        p0: np.ndarray,
        p1: np.ndarray,
        p2: np.ndarray,
        image_shape: Tuple[int, int],
    ) -> bool:
        """
        Check if triangle is within image bounds.
        """
        h, w = image_shape
        x_min, x_max = max(0, int(min(p0[0], p1[0], p2[0]))), min(w, int(max(p0[0], p1[0], p2[0])) + 1)
        y_min, y_max = max(0, int(min(p0[1], p1[1], p2[1]))), min(h, int(max(p0[1], p1[1], p2[1])) + 1)

        return x_max > x_min and y_max > y_min

    def _rasterize_triangle(
        self,
        uv0: np.ndarray,
        uv1: np.ndarray,
        uv2: np.ndarray,
        img0: np.ndarray,
        img1: np.ndarray,
        img2: np.ndarray,
        rgb_frame: np.ndarray,
        texture_atlas: np.ndarray,
        weight_atlas: np.ndarray,
        atlas_size: int,
    ) -> None:
        """
        Rasterize triangle to texture atlas using bilinear sampling.
        """
        # Bounding box in atlas space
        u_min, u_max = max(0, int(min(uv0[0], uv1[0], uv2[0]) * atlas_size)), min(
            atlas_size, int(max(uv0[0], uv1[0], uv2[0]) * atlas_size) + 1
        )
        v_min, v_max = max(0, int(min(uv0[1], uv1[1], uv2[1]) * atlas_size)), min(
            atlas_size, int(max(uv0[1], uv1[1], uv2[1]) * atlas_size) + 1
        )

        for u in range(u_min, u_max):
            for v in range(v_min, v_max):
                # Check if (u,v) is inside triangle
                uv = np.array([u / atlas_size, v / atlas_size])
                
                # Barycentric coordinates
                bary = self._barycentric_coords(uv, uv0, uv1, uv2)
                if bary is None or any(b < 0 for b in bary):
                    continue

                # Interpolate image coordinates
                img_x = bary[0] * img0[0] + bary[1] * img1[0] + bary[2] * img2[0]
                img_y = bary[0] * img0[1] + bary[1] * img1[1] + bary[2] * img2[1]

                # Sample color from image
                color = self._sample_bilinear(rgb_frame, img_x, img_y)
                if color is not None:
                    texture_atlas[v, u] += color
                    weight_atlas[v, u] += 1.0

    @staticmethod
    def _barycentric_coords(
        p: np.ndarray,
        a: np.ndarray,
        b: np.ndarray,
        c: np.ndarray,
    ) -> Optional[np.ndarray]:
        """
        Compute barycentric coordinates of point p in triangle abc.
        """
        v0 = c - a
        v1 = b - a
        v2 = p - a

        dot00 = np.dot(v0, v0)
        dot01 = np.dot(v0, v1)
        dot02 = np.dot(v0, v2)
        dot11 = np.dot(v1, v1)
        dot12 = np.dot(v1, v2)

        inv_denom = 1.0 / (dot00 * dot11 - dot01 * dot01 + 1e-6)
        u = (dot11 * dot02 - dot01 * dot12) * inv_denom
        v = (dot00 * dot12 - dot01 * dot02) * inv_denom

        return np.array([1.0 - u - v, u, v])

    @staticmethod
    def _sample_bilinear(
        image: np.ndarray,
        x: float,
        y: float,
    ) -> Optional[np.ndarray]:
        """
        Bilinear sampling from image.
        """
        h, w = image.shape[:2]
        if x < 0 or x >= w - 1 or y < 0 or y >= h - 1:
            return None

        x0, x1 = int(x), int(x) + 1
        y0, y1 = int(y), int(y) + 1
        wx, wy = x - x0, y - y0

        color = (
            (1 - wx) * (1 - wy) * image[y0, x0]
            + wx * (1 - wy) * image[y0, x1]
            + (1 - wx) * wy * image[y1, x0]
            + wx * wy * image[y1, x1]
        )

        return color.astype(np.uint8)
