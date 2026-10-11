# Simulator and Digital Twin Architecture

## Overview

The simulator layer allows:
- operator training playback against reconstructed scenes
- control logic testing and validation
- historian data replay to reproduce and diagnose issues
- AR/VR visualization of procedures and hazards

## System Flow

```
Reconstruction Output (Scene)
    ↓
[Scene Metadata + Assets + Historian Context]
    ↓
[Training Scenario Definition]
    (linked to specific assets, hazard zones, inspection points)
    ↓
[Simulator Job]
    (playback mode: live, historian-replay, logic-test)
    ↓
[Results]
    (operator actions, sensor events, anomalies)
```

## Simulation Modes

### 1. Live Mode
- Real-time operator walkthrough
- AR overlay of procedure steps
- Geofencing to guide operator through scene
- Real-time sensor data linked to scene position
- Safety enforcement (cannot enter hazard zones without acknowledgment)

### 2. Historian Replay Mode
- Replay past events using historian time-series data
- Reproduce equipment failures or anomalies
- View sensor state at specific timestamps
- Correlate operator actions with system events
- Diagnostic and root cause analysis

### 3. Logic Test Mode
- Test PLC or control logic against scene data
- Mock sensor inputs and verify controller outputs
- Validate safety interlocks
- Test edge cases and fault conditions
- Pre-deployment validation

## Training Scenario Structure

```typescript
scenario {
  id
  sceneId          // Links to reconstructed scene
  title
  description
  steps []
    ├─ label
    ├─ duration
    ├─ assetTagRefs[]      // Equipment to inspect
    ├─ hazardMarkers[]     // Zones to avoid or acknowledge
    └─ inspectionPoints[]  // Measurements to take
  hazardZones[]
    ├─ position
    ├─ radius
    └─ label
  equipmentHighlights[]
    ├─ assetId
    ├─ label
    └─ safetyNotes
  historianPlayback
    ├─ measurement
    ├─ from
    └─ to
}
```

## Simulation Job

```typescript
job {
  id
  sceneId
  scenarioId
  playbackMode: 'live' | 'historian-replay' | 'logic-test'
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: 0-100
  historianWindow   // For replay: what time range to playback
  logicControllers[]  // For logic-test: which controllers to validate
  results {
    operatorActions[]   // Sequence of actions taken
    sensorEvents[]      // Sensor readings during playback
    anomalies[]         // Issues detected
  }
}
```

## Scene Integration

Each scene has:
- 3D mesh + texture + Gaussian splat (for rendering)
- Asset tags (equipment IDs, positions)
- Hazard markers (positions, radius, labels)
- Historian context (time window for data queries)
- Modular-io references (device IDs, asset links)

Training scenarios and simulations reference the same scene:
- Step hazards align to scene hazard zones
- Inspection points map to asset positions
- Historian playback queries the time window from scene metadata
- Control logic receives sensor data from that time window

## API Contracts

### Create Simulation Job

```bash
POST /api/simulations
{
  "sceneId": "compressor-hall-a",
  "scenarioId": "scenario_compressor_room_inspection",
  "playbackMode": "historian-replay",
  "historianWindow": {
    "from": "2026-10-10T09:00:00Z",
    "to": "2026-10-10T10:00:00Z"
  },
  "logicControllers": ["controller_pressure_relief"]
}

RESPONSE 202
{
  "job": {
    "id": "sim_1728661234567",
    "sceneId": "compressor-hall-a",
    "scenarioId": "scenario_compressor_room_inspection",
    "status": "queued",
    "progress": 0,
    "playbackMode": "historian-replay"
  }
}
```

### Poll Simulation Progress

```bash
GET /api/simulations/:id

RESPONSE 200
{
  "job": {
    "id": "sim_1728661234567",
    "status": "completed",
    "progress": 100,
    "results": {
      "operatorActions": ["Inspect compressor", "Check pressure gauge"],
      "sensorEvents": [
        { "timestamp": "2026-10-10T09:15:30Z", "value": 4.2 },
        { "timestamp": "2026-10-10T09:16:00Z", "value": 4.5 }
      ],
      "anomalies": ["Pressure spike detected at 09:16:15"]
    }
  }
}
```

### Create Training Scenario (Linked to Scene)

```bash
POST /api/scenarios
{
  "sceneId": "compressor-hall-a",
  "title": "Compressor room inspection",
  "environment": "factory-floor",
  "type": "ar-training",
  "steps": [
    {
      "label": "Pre-inspection safety check",
      "duration": 120,
      "assetTagRefs": ["tag-compressor-1"],
      "hazardMarkers": [
        { "position": [2.8, 0.9, 2.2], "label": "High-pressure zone" }
      ]
    }
  ],
  "hazardZones": [...],
  "equipmentHighlights": [...],
  "historianPlayback": {
    "measurement": "compressor_pressure",
    "from": "2026-10-10T09:00:00Z",
    "to": "2026-10-10T10:00:00Z"
  }
}
```

## Implementation Next Steps

1. **Scene Rendering**
   - Load mesh + texture from reconstruction output
   - Render hazard zones as overlays
   - Highlight asset tags in AR/VR

2. **Simulation Engine**
   - Playback historian data frame-by-frame
   - Track operator position in scene
   - Validate step completion
   - Detect anomalies from sensor data

3. **Control Logic Test**
   - Connect to logic controller (PLC/IEC61131)
   - Mock sensor inputs from historian or scenario definition
   - Verify controller outputs
   - Log all events and state changes

4. **AR/VR UI**
   - Display procedure steps as AR overlays
   - Highlight next steps and hazards
   - Show real-time sensor readings
   - Geofence operator within safe zones
