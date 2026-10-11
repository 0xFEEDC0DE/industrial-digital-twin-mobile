# Industrial Digital Twin Mobile

A mobile-first digital twin capture and training platform for industrial sites, manufacturing plants, and facilities. It turns camera footage, preset videos, or image sets into textured 3D scenes and exports them for AR/VR-based training.

## Product vision

This project is intended to let field technicians, operators, safety teams, and training designers scan physical environments using everyday mobile devices and transform them into realistic digital twins.

The application supports:

- live camera capture from mobile devices
- imported videos and images
- textured 3D reconstruction from multiview imagery
- Gaussian splat scene generation for photorealistic walkthroughs
- industrial metadata overlays and annotations
- scene export for AR / VR / web viewers
- training workflows for maintenance and safety operations

## Key capabilities

### Capture
- live scan from phone camera or tablet camera
- video import from preset media sources
- image-based scan workflows
- guided scanning cues for industrial spaces
- optional depth or LiDAR when available

### Reconstruction
- photogrammetry and multiview alignment
- mesh generation
- textured atlas / UV baking
- Gaussian splat scene generation for realism
- scene scale-aware calibration

### Digital twin
- machine and asset tagging
- layout and route annotations
- maintenance / safety metadata
- versioned exports for each scene iteration

### Training
- augmented training overlays
- virtual walkthroughs
- operator onboarding scenarios
- safety procedure playback
- maintenance training in AR/VR

## Technology direction

This repo is structured as a starter monorepo for the product stack:

- mobile app: Expo + React Native for camera capture and field workflows
- shared types: cross-platform model definitions
- backend API: Express service for scene orchestration and training integration
- reconstruction pipeline: cloud GPU worker / Python pipeline (planned)

## Repo structure

```text
industrial-digital-twin-mobile/
├─ apps/
│  └─ mobile/
├─ services/
│  └─ api/
├─ packages/
│  └─ shared/
├─ package.json
├─ tsconfig.base.json
├─ .gitignore
└─ README.md
```

## Available starter apps

- mobile app skeleton for capture flows and training entry points
- API layer for scan intake, scene generation, training scenarios, and exports
- integration stubs for `io-training` and `notebookIO`

## Integration plan

This project can be connected to your existing systems:

- `io-training`: training scenario and curriculum synchronization
- `notebookIO`: notebook-style project management, asset notes, and training records

The starter API includes adaptors for these system integrations so you can plug in the real connectors later.

## MVP roadmap

### Phase 1
- guided capture flows
- image/video import
- scene metadata capture
- scan request API

### Phase 2
- textured 3D reconstruction
- Gaussian splat preview
- export to glTF / USDZ / PLY / OBJ

### Phase 3
- industrial asset tagging
- safety and training overlays
- AR training playback

### Phase 4
- external system integration
- site intelligence and asset history
- multi-project digital twin library

## Quick start

```bash
npm install
npm run dev:api
npm run dev:mobile
```

Then open the Expo app or use the API endpoints described by the backend starter.

## Example API

- POST `/api/scans` to create a scan request
- POST `/api/training/scenarios` to create a training scenario
- GET `/api/health` for health checks

## Notes

This is intentionally a product starter and not a full production 3D reconstruction engine. The first milestone is to establish the mobile capture workflow, API integration points, and scene management model in a clean, extensible way.
