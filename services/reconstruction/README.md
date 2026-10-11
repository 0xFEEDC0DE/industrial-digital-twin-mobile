# 3D Reconstruction Pipeline

Python service for:
- Frame extraction and quality scoring
- Feature detection and matching
- Structure from Motion (SfM) camera pose estimation
- Dense multi-view stereo (MVS) depth estimation
- Point cloud generation and mesh reconstruction
- Texture baking and UV atlas generation
- Gaussian splat generation
- Integration with modular-io tags and historian data

## Installation

```bash
pip install -r requirements.txt
```

## Core modules

- `frame_quality.py`: Frame quality scoring (sharpness, exposure, overlap)
- `frame_extraction.py`: Video/image extraction and keyframe selection
- `feature_detection.py`: ORB/SIFT feature detection and matching
- `sfm_pipeline.py`: Structure from Motion camera pose estimation
- `depth_estimation.py`: Dense depth from multi-view images
- `mesh_reconstruction.py`: Poisson mesh generation
- `texture_generation.py`: Texture baking and atlas generation
- `gaussian_splat.py`: Gaussian splat scene generation
- `modular_io_integration.py`: Tag and historian data integration

## Usage

### Basic reconstruction

```python
from reconstruction_pipeline import ReconstructionPipeline

pipeline = ReconstructionPipeline()
scene = pipeline.reconstruct(
    video_path='scan_001.mp4',
    output_dir='scene_output'
)

print(scene.mesh_path)
print(scene.texture_path)
print(scene.splat_path)
```

### With modular-io integration

```python
from reconstruction_pipeline import ReconstructionPipeline
from modular_io_integration import ModularIOIntegration

pipeline = ReconstructionPipeline()
modular_io = ModularIOIntegration("http://modular-io-host:8000")

scene = pipeline.reconstruct(
    video_path='scan_001.mp4',
    output_dir='scene_output',
    modular_io_context={
        'project_id': 'plant-a',
        'device_ids': ['sensor_001', 'sensor_002'],
        'time_range': ['2026-10-11T10:00:00Z', '2026-10-11T10:05:00Z']
    }
)

# Attach historian data to scene
scene = modular_io.attach_historian_data(scene)
scene = modular_io.attach_tags(scene)

scene.save()
```

## API

See `api/reconstruction_service.py` for REST endpoints.

## Performance notes

- Optimization for GPU acceleration (CUDA recommended)
- On-device frame quality scoring for mobile app feedback
- Streaming depth estimation for real-time preview
- Modular design for easy swapping of components (e.g., different depth models)
