# Capturing System Design

The capturing system guides users to capture high-quality input for reconstruction.

## Capture Modes

### 1. Live Camera Scanning
- Real-time frame capture with guided cues
- On-device pose estimation feedback
- Frame quality scoring (sharpness, exposure, overlap)
- Optional depth sensor feedback (LiDAR / ToF)
- Metadata: area ID, equipment tags, start time

### 2. Video Import
- Video file upload (MP4, MOV, etc.)
- Automatic keyframe extraction
- Frame quality filtering
- Optional manual frame selection UI

### 3. Image Set Import
- Batch image upload
- Metadata association (shot sequence, timestamps)
- Auto-ordering by timestamp or manual sequencing

## Guided Scanning Patterns

For industrial environments, we recommend:

1. **Orbit pattern** (best for machinery)
   - Circle the target at fixed distance
   - Maintain overlap (60-80%)
   - Duration: 30-60 seconds
   - Frames: 60-150

2. **Walk-around pattern** (best for large areas)
   - Walk slowly around the perimeter
   - Stop every 2-3 meters for key frames
   - Duration: 2-5 minutes
   - Frames: 100-400

3. **Top-down pattern** (best for flat areas like conveyor lines)
   - Move along the length while tilting camera
   - Capture from multiple angles
   - Duration: 1-2 minutes per section
   - Frames: 50-100 per section

## Frame Quality Scoring

```
Frame Quality Score = (sharpness * 0.4) + (exposure * 0.3) + (overlap * 0.3)

- Sharpness: Laplacian variance (reject blurry frames)
- Exposure: Histogram analysis (avoid over/under exposed)
- Overlap: Feature match count with previous frame (minimum 30% overlap)
```

## On-Device SfM Feedback

While capturing:
- Show camera pose relative to previous frames
- Display estimated point cloud preview (decimated for speed)
- Alert if insufficient overlap
- Count total frames and estimated coverage
- Estimate geometry quality in real-time

## Metadata Capture

Associate with each scan:
- Area/plant ID (from modular-io)
- Equipment tags (manual or auto-detected from proximity)
- Start/end timestamp
- Operator ID
- Weather/lighting conditions (for industrial outdoor sites)
- Optional audio notes or observations
- Historian context (InfluxDB/TimescaleDB query range)

## Mobile App Integration

The Expo app should:
1. Request camera permissions
2. Show guided scanning overlay (grid, orbit guide, etc.)
3. Capture frames to local queue
4. Show real-time quality feedback
5. Allow manual frame review and rejection
6. Batch upload to backend when done
7. Monitor reconstruction job status

## API Contract for Capture

```
POST /api/captures
{
  "projectName": "Plant A",
  "areaId": "compressor-hall-a",
  "scanMode": "live-camera" | "video-import" | "image-set",
  "guidedPattern": "orbit" | "walk-around" | "top-down",
  "frameCount": 145,
  "frameDuration": 65,
  "metadata": {
    "operatorId": "technician_001",
    "equipmentTags": ["compressor_1", "valve_stack_a"],
    "modularIOContext": {
      "projectId": "io-codes-plant-a",
      "deviceIds": ["sensor_001", "sensor_002"]
    },
    "historianContext": {
      "database": "influxdb",
      "measurement": "plant_sensor_data",
      "timeRange": ["2026-10-11T10:00:00Z", "2026-10-11T10:05:00Z"]
    }
  },
  "mediaUrl": "s3://bucket/captures/scan_12345.mp4"
}

RESPONSE 202 Accepted
{
  "captureId": "capture_12345",
  "reconstructionJobId": "job_12345",
  "status": "queued",
  "estimatedProcessingTime": 120
}
```

## Quality Assurance

Before reconstruction starts:
1. Check frame count (minimum 60 frames)
2. Verify overlap distribution
3. Estimate coverage (should be >70% for good results)
4. Check for motion blur or exposure issues
5. Validate metadata completeness
6. If any check fails, ask user to re-capture

## Next Steps

1. Implement frame extraction from video (FFmpeg integration)
2. Add feature detection and real-time SfM preview
3. Implement on-device depth sensor integration
4. Build the capturing UI with guided overlays
5. Implement quality scoring and feedback
6. Connect to backend reconstruction pipeline
