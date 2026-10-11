# Reconstruction Pipeline

## Overview

The reconstruction pipeline is the core of the product. It takes camera frames, video, or images and produces:
- geometry (point cloud → mesh)
- texture (UV atlas + color)
- Gaussian splat scene for photorealistic rendering
- industrial metadata integration with modular-io tags and historian data

## Architecture

```
Input (video/images/live camera)
    ↓
[Frame Extraction & Preprocessing]
    ↓ (grayscale, undistort, exposure normalize)
[Feature Detection & Matching] (SIFT/ORB)
    ↓
[SfM: Camera Pose Estimation] (COLMAP-style)
    ↓
[Dense Reconstruction] (MVS: multi-view stereo)
    ↓ (point cloud with 100k-1M points)
[Mesh Generation] (Poisson / Delaunay)
    ↓
[Texture Baking] (UV atlas, color fusion)
    ↓
[Gaussian Splat Generation]
    ↓ (view-dependent radiance fields)
[Scene Graph + Historian Integration]
    ↓ (attach modular-io tags, time-series data)
[Export] (glTF + metadata, USDZ, PLY, splat.json)
```

## Key technical components

### 1. Feature Detection & Matching
- Use ORB or AKAZE for speed (mobile-friendly)
- Fallback to SIFT for higher quality
- Match keypoints across frames
- Outlier rejection via RANSAC

### 2. Structure from Motion (SfM)
- Estimate camera intrinsics (or use known mobile phone calibration)
- Bundle adjustment to refine camera poses
- Triangulation of matched features
- Incremental SfM for online/streaming capture

### 3. Dense Multi-View Stereo (MVS)
- For each camera pose, estimate depth using:
  - Photometric stereo methods
  - Plane-sweep or cost volume approaches
  - Deep learning depth estimation (if fast enough)
- Fuse depth maps into unified point cloud
- Normal estimation and smoothing

### 4. Mesh Reconstruction
- Poisson surface reconstruction for quality output
- Or screened Poisson for speed
- Mesh simplification / decimation if too dense

### 5. Texture Generation
- Project original images onto mesh
- Seam removal and color correction
- Bake into UV atlas
- Handle reflections and specular surfaces

### 6. Gaussian Splat Rendering
- Train anisotropic 3D Gaussians from multiview images
- Learn per-pixel opacity, color, covariance
- View-dependent rendering for photorealism
- Compatible with three.js / Babylon.js

### 7. Scene Integration
- Parse modular-io tags from captured area
- Attach historian data (InfluxDB / TimescaleDB) to mesh
- Link training procedures from io-training
- Annotate hazard zones, equipment, routes

## Implementation strategy

### MVP reconstruction pipeline

For a working demo, focus on:
1. Feature detection + SfM (most critical)
2. Dense depth estimation (depth from camera + deep learning)
3. Point cloud fusion
4. Poisson mesh reconstruction
5. Simple texture baking
6. Gaussian splat generation (via third-party library)

### Tech stack

- **Python backend**: OpenCV, COLMAP bindings, Open3D, PyTorch (for depth)
- **SfM library**: COLMAP (via subprocess or Python API), or lightweight alternatives
- **Depth estimation**: MiDaS or newer depth models (quantized for speed)
- **Mesh**: Open3D Poisson, or Screened Poisson
- **Gaussian splat**: tiny-cuda-nn or lightweight Gaussian splat library
- **Mobile-side**: Expo capture with JPEG/MP4 upload, metadata streaming
- **Integration**: REST API to modular-io and io-training instances

## Production workflow

1. Mobile device captures frames (guided scanning mode)
2. Video/images uploaded to API with:
   - Timestamp range
   - Location / plant area ID
   - modular-io context (tags, historian references)
3. Backend queues reconstruction job on GPU worker
4. Reconstruction runs:
   - Feature extraction
   - SfM camera alignment
   - Depth estimation per view
   - Dense point cloud
   - Mesh + texture
   - Gaussian splat baking
5. Scene exported with:
   - glTF mesh + textures
   - USDZ for AR
   - Gaussian splat JSON for web viewer
   - Metadata linking to modular-io tags and historian queries
6. Training modules created via io-training
   - Step-by-step procedures attached to mesh zones
   - Hazard markers and safety overlays
   - AR/VR playback using reconstructed scene

## Next implementation: Capturing System

The capturing system is critical for guiding users to capture high-quality scans:

- Guided scanning cues (orbit, walk-around, top-down)
- Real-time SfM feedback during capture
- Frame quality scoring (blur, exposure, overlap)
- Depth preview from on-device depth sensor (if available)
- Metadata capture (area ID, equipment tags, historian context)

## Notes

This is the actual hard work. The UI is secondary to getting reconstruction right.
