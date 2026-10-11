import numpy as np
from typing import List, Tuple, Optional
import logging

try:
    from open3d import open3d as o3d
    HAS_OPEN3D = True
except ImportError:
    HAS_OPEN3D = False
    logging.warning("Open3D not available; mesh reconstruction will be limited")

logger = logging.getLogger(__name__)

class MeshReconstruction:
    """
    Generate mesh from point cloud using Poisson reconstruction.
    """

    @staticmethod
    def poisson_mesh(
        points: np.ndarray,
        colors: Optional[np.ndarray] = None,
        depth: int = 9,
    ) -> Optional[Tuple[np.ndarray, np.ndarray]]:
        """
        Reconstruct mesh from point cloud using Poisson surface reconstruction.
        
        Args:
            points: Nx3 array of 3D points
            colors: Nx3 array of RGB colors (optional)
            depth: Octree depth for reconstruction (higher = more detail)
        
        Returns:
            (vertices, triangles) or None if Open3D not available
        """
        if not HAS_OPEN3D:
            logger.error("Open3D required for Poisson reconstruction")
            return None

        # Create point cloud
        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(points)

        if colors is not None:
            pcd.colors = o3d.utility.Vector3dVector(colors)

        # Estimate normals
        pcd.estimate_normals(
            search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30)
        )

        # Poisson reconstruction
        mesh, _ = o3d.geometry.TriangleMesh.create_from_point_cloud_poisson(
            pcd, depth=depth
        )

        vertices = np.asarray(mesh.vertices)
        triangles = np.asarray(mesh.triangles)

        logger.info(
            f"Poisson reconstruction: {len(vertices)} vertices, {len(triangles)} triangles"
        )

        return vertices, triangles

    @staticmethod
    def ball_pivoting(
        points: np.ndarray,
        colors: Optional[np.ndarray] = None,
        radii: Optional[List[float]] = None,
    ) -> Optional[Tuple[np.ndarray, np.ndarray]]:
        """
        Reconstruct mesh using Ball Pivoting Algorithm (faster alternative to Poisson).
        """
        if not HAS_OPEN3D:
            logger.error("Open3D required for Ball Pivoting")
            return None

        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(points)

        if colors is not None:
            pcd.colors = o3d.utility.Vector3dVector(colors)

        pcd.estimate_normals(
            search_param=o3d.geometry.KDTreeSearchParamHybrid(radius=0.1, max_nn=30)
        )

        if radii is None:
            radii = [0.005, 0.01, 0.02, 0.04]

        mesh = o3d.geometry.TriangleMesh.create_from_point_cloud_ball_pivoting(
            pcd, o3d.geometry.KDTreeSearchParamKNN(knn=30), radii=radii
        )

        vertices = np.asarray(mesh.vertices)
        triangles = np.asarray(mesh.triangles)

        logger.info(f"Ball Pivoting: {len(vertices)} vertices, {len(triangles)} triangles")

        return vertices, triangles

    @staticmethod
    def simplify_mesh(
        vertices: np.ndarray,
        triangles: np.ndarray,
        target_count: int = 50000,
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Simplify mesh to reduce polygon count (for faster rendering).
        """
        if not HAS_OPEN3D:
            logger.warning("Open3D not available; returning original mesh")
            return vertices, triangles

        mesh = o3d.geometry.TriangleMesh()
        mesh.vertices = o3d.utility.Vector3dVector(vertices)
        mesh.triangles = o3d.utility.Vector3iVector(triangles)

        mesh_simplified = mesh.simplify_vertex_clustering(
            voxel_size=0.05,  # Adjust based on scene scale
        )

        vertices_simplified = np.asarray(mesh_simplified.vertices)
        triangles_simplified = np.asarray(mesh_simplified.triangles)

        logger.info(
            f"Mesh simplified: {len(triangles)} -> {len(triangles_simplified)} triangles"
        )

        return vertices_simplified, triangles_simplified

    @staticmethod
    def remove_outliers(
        points: np.ndarray,
        nb_neighbors: int = 20,
        std_ratio: float = 2.0,
    ) -> np.ndarray:
        """
        Remove outlier points from point cloud before meshing.
        """
        if not HAS_OPEN3D:
            logger.warning("Open3D not available; returning original points")
            return points

        pcd = o3d.geometry.PointCloud()
        pcd.points = o3d.utility.Vector3dVector(points)

        pcd_filtered, _ = pcd.remove_statistical_outlier(
            nb_neighbors=nb_neighbors, std_ratio=std_ratio
        )

        points_filtered = np.asarray(pcd_filtered.points)
        logger.info(f"Outlier removal: {len(points)} -> {len(points_filtered)} points")

        return points_filtered
