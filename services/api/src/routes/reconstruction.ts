import { Router } from 'express';
import type {
  ReconstructionJob,
  Scene,
  SceneMetadata,
  ScanSourceType,
} from '@industrial-digital-twin/shared';

export const reconstructionRoutes = Router();

const sceneCatalog: Record<string, Scene> = {
  'compressor-hall-a': {
    id: 'compressor-hall-a',
    name: 'Compressor hall A',
    area: 'Plant floor / compressor room',
    status: 'processing',
    progress: 62,
    exportReady: false,
    textureScore: 88,
    gaussianReady: false,
    tags: ['compressor', 'safety-zone', 'pipe-run', 'valve-stack'],
    metadata: {
      sceneId: 'compressor-hall-a',
      projectId: 'plant-a',
      areaId: 'compressor-hall-a',
      areaName: 'Compressor hall A',
      plantZone: 'utility-west',
      tags: ['compressor', 'safety-zone', 'pipe-run', 'valve-stack'],
      assetTags: [
        {
          id: 'tag-compressor-1',
          label: 'Compressor 1',
          type: 'equipment',
          position: [0.2, 1.4, 3.1],
        },
        {
          id: 'tag-hazard-1',
          label: 'High-pressure zone',
          type: 'hazard',
          position: [2.8, 0.9, 2.2],
        },
      ],
      historian: {
        database: 'timescaledb',
        measurement: 'compressor_pressure',
        from: '2026-10-10T09:00:00Z',
        to: '2026-10-10T10:00:00Z',
      },
      modularIoContext: {
        deviceIds: ['sensor-01', 'sensor-02'],
        assetRefs: ['compressor-1', 'vibration-sensor-42'],
      },
    },
  },
};

const jobs: Record<string, ReconstructionJob> = {};

reconstructionRoutes.post('/reconstruction/jobs', (req, res) => {
  const payload = req.body as {
    captureId?: string;
    sceneId?: string;
    projectId?: string;
    areaId?: string;
    sourceType?: ScanSourceType;
    deviceType?: string;
  };

  const sceneId = payload.sceneId ?? 'compressor-hall-a';
  const scene = sceneCatalog[sceneId] ?? sceneCatalog['compressor-hall-a'];
  const captureId = payload.captureId ?? `capture_${Date.now()}`;

  const job: ReconstructionJob = {
    id: `job_${Date.now()}`,
    sceneId,
    captureId,
    status: 'processing',
    progress: 18,
    phase: 'frames',
    startedAt: new Date().toISOString(),
    metadata: {
      ...scene.metadata,
      projectId: payload.projectId ?? scene.metadata.projectId,
      areaId: payload.areaId ?? scene.metadata.areaId,
      sceneId,
    },
    outputPaths: {
      mesh: `/data/scenes/${sceneId}/mesh.ply`,
      texture: `/data/scenes/${sceneId}/texture.png`,
      gltf: `/data/scenes/${sceneId}/scene.gltf`,
      splat: `/data/scenes/${sceneId}/scene.splat.json`,
    },
  };

  jobs[job.id] = job;

  res.status(202).json({
    message: 'Reconstruction job accepted',
    job,
  });
});

reconstructionRoutes.get('/reconstruction/jobs/:id', (req, res) => {
  const job = jobs[req.params.id];

  if (!job) {
    res.status(404).json({ message: 'Job not found' });
    return;
  }

  const progress = Math.min(100, job.progress + 12);
  job.progress = progress;
  job.phase = progress >= 100 ? 'export' : progress >= 80 ? 'splat' : progress >= 60 ? 'texture' : progress >= 40 ? 'mesh' : progress >= 25 ? 'depth' : 'sfm';
  job.status = progress >= 100 ? 'ready' : 'processing';
  job.completedAt = progress >= 100 ? new Date().toISOString() : undefined;

  res.json({ job });
});

reconstructionRoutes.get('/reconstruction/jobs', (_req, res) => {
  res.json({ jobs: Object.values(jobs) });
});

reconstructionRoutes.get('/scenes/:id', (req, res) => {
  const scene = sceneCatalog[req.params.id] ?? sceneCatalog['compressor-hall-a'];
  res.json({
    scene,
    trainingScenarioId: 'scenario_compressor_room_inspection',
    exportFormats: ['gltf', 'usdz', 'ply', 'gaussian-splat', 'webxr'],
  });
});

reconstructionRoutes.get('/scenes', (_req, res) => {
  res.json({ scenes: Object.values(sceneCatalog) });
});
