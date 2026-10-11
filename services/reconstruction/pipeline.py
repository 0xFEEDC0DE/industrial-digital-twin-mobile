from typing import List, Dict, Optional, Tuple
import logging
import os
import numpy as np

logger = logging.getLogger(__name__)

class ReconstructionPipeline:
    """
    End-to-end 3D reconstruction pipeline.
    Input: video/image sequence
    Output: mesh + texture + Gaussian splat + metadata
    """

    def __init__(self, output_dir: str = './output'):
        self.output_dir = output_dir
        os.makedirs(output_dir, exist_ok=True)

    def reconstruct(
        self,
        video_path: str,
        device_type: str = 'iphone-15-pro',
        modular_io_context: Optional[Dict] = None,
        historian_context: Optional[Dict] = None,
    ) -> Dict:
        """
        Full reconstruction pipeline.
        
        Args:
            video_path: Path to video file or image directory
            device_type: Mobile device type for calibration
            modular_io_context: Metadata for tag integration
            historian_context: Metadata for time-series integration
        
        Returns:
            Scene output dictionary with paths and metadata
        """
        logger.info(f"Starting reconstruction: {video_path}")

        try:
            # Step 1: Extract and filter frames
            from frame_extraction import FrameExtractor
            from frame_quality import FrameQualityScorer

            logger.info("Step 1: Extracting frames...")
            frames = FrameExtractor.extract_from_video(video_path, target_fps=5)
            keyframe_indices = FrameExtractor.select_keyframes(frames, min_overlap=0.3)
            keyframes = [frames[i] for i in keyframe_indices]
            logger.info(f"Selected {len(keyframes)} keyframes from {len(frames)} total")

            # Step 2: Feature detection and SfM
            from feature_detection import FeatureDetector
            from sfm_pipeline import StructureFromMotion, CameraCalibration

            logger.info("Step 2: Feature detection and SfM...")
            calibration = CameraCalibration(device_type)
            K = calibration.K
            detector = FeatureDetector(feature_type='orb', max_features=1000)

            kp_list = []
            des_list = []
            for frame in keyframes:
                kp, des = detector.detect_and_compute(frame)
                kp_list.append(kp)
                des_list.append(des)

            # Initialize SfM with first two frames
            matches_init = detector.match_frames(kp_list[0], des_list[0], kp_list[1], des_list[1])
            matches_init, _ = detector.filter_matches_ransac(kp_list[0], kp_list[1], matches_init)

            sfm = StructureFromMotion(K)
            success, points_3d = sfm.initialize_from_two_frames(
                keyframes[0],
                keyframes[1],
                kp_list[0],
                kp_list[1],
                matches_init,
            )

            if not success:
                logger.error("SfM initialization failed")
                return {'status': 'failed', 'error': 'SfM initialization failed'}

            logger.info(f"SfM initialized with {len(points_3d)} points")

            # Step 3: Depth estimation (simplified plane-sweep)
            logger.info("Step 3: Depth estimation...")
            # For MVP, use simple depth from SfM point cloud
            # Full version would use MVS depth estimation

            # Step 4: Mesh reconstruction
            from mesh_reconstruction import MeshReconstruction

            logger.info("Step 4: Mesh reconstruction...")
            points_filtered = MeshReconstruction.remove_outliers(points_3d)
            vertices, triangles = MeshReconstruction.poisson_mesh(points_filtered, depth=8)

            if vertices is None:
                logger.error("Mesh reconstruction failed")
                return {'status': 'failed', 'error': 'Mesh reconstruction failed'}

            logger.info(f"Mesh: {len(vertices)} vertices, {len(triangles)} triangles")

            # Step 5: Texture generation
            from texture_generation import TextureGeneration

            logger.info("Step 5: Texture generation...")
            texture_gen = TextureGeneration(vertices, triangles)
            texture_gen.compute_uv_coordinates()
            # Simplified texture baking (would need proper camera poses)
            texture_atlas = np.ones((512, 512, 3), dtype=np.uint8) * 200  # Placeholder

            # Step 6: Gaussian splat generation
            from gaussian_splat import GaussianSplatGenerator

            logger.info("Step 6: Gaussian splat generation...")
            colors = np.random.rand(len(points_3d), 3)
            camera_poses = [np.eye(4) for _ in range(len(keyframes))]
            splat_gen = GaussianSplatGenerator(points_3d, colors, camera_poses)
            splat_gen.compute_gaussians()

            # Step 7: Save outputs
            logger.info("Step 7: Saving outputs...")
            mesh_path = os.path.join(self.output_dir, 'mesh.ply')
            texture_path = os.path.join(self.output_dir, 'texture.png')
            splat_path = os.path.join(self.output_dir, 'scene.splat.json')
            gltf_path = os.path.join(self.output_dir, 'scene.gltf')

            # Save mesh as PLY
            self._save_ply(mesh_path, vertices, triangles)
            logger.info(f"Mesh saved: {mesh_path}")

            # Save texture
            import cv2
            cv2.imwrite(texture_path, texture_atlas)
            logger.info(f"Texture saved: {texture_path}")

            # Save Gaussian splat
            splat_gen.export_splat_json(splat_path)
            logger.info(f"Splat saved: {splat_path}")

            # Prepare output
            output = {
                'status': 'success',
                'mesh_path': mesh_path,
                'texture_path': texture_path,
                'splat_path': splat_path,
                'gltf_path': gltf_path,
                'vertices_count': len(vertices),
                'triangles_count': len(triangles),
                'modular_io_context': modular_io_context,
                'historian_context': historian_context,
            }

            logger.info("Reconstruction complete!")
            return output

        except Exception as e:
            logger.error(f"Reconstruction failed: {e}")
            return {'status': 'failed', 'error': str(e)}

    @staticmethod
    def _save_ply(path: str, vertices: np.ndarray, triangles: np.ndarray) -> None:
        """
        Save mesh as PLY file.
        """
        with open(path, 'w') as f:
            f.write('ply\n')
            f.write('format ascii 1.0\n')
            f.write(f'element vertex {len(vertices)}\n')
            f.write('property float x\n')
            f.write('property float y\n')
            f.write('property float z\n')
            f.write(f'element face {len(triangles)}\n')
            f.write('property list uchar int vertex_indices\n')
            f.write('end_header\n')

            for v in vertices:
                f.write(f'{v[0]} {v[1]} {v[2]}\n')

            for t in triangles:
                f.write(f'3 {t[0]} {t[1]} {t[2]}\n')
