import { Router } from 'express';
import type {
  Scene,
  SceneArtifact,
  SceneMetadata,
  ReconstructionJob,
  SimulationJob,
  SimulationResult,
  TrainingEvaluation,
  TrainingProgressStep,
  HistorianWindow,
  SimulationMode,
  SceneStatus,
} from '@industrial-digital-twin/shared';

export const runtimeRoutes = Router();

const sceneCatalog: Record<string, Scene> = {
  'compressor-hall-a': {
    id: 'compressor-hall-a',
    name: 'Compressor hall A',
    area: 'Plant floor / compressor room',
    status: 'ready',
    progress: 100,
    exportReady: true,
    textureScore: 94,
    gaussianReady: true,
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
    artifacts: [
      {
        id: 'art_mesh_1',
        sceneId: 'compressor-hall-a',
        kind: 'mesh',
        path: '/data/scenes/compressor-hall-a/mesh.ply',
        checksum: 'sha256:mesh-abc123',
        sizeBytes: 1843200,
        ready: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'art_texture_1',
        sceneId: 'compressor-hall-a',
        kind: 'texture',
        path: '/data/scenes/compressor-hall-a/texture.png',
        checksum: 'sha256:texture-xyz789',
        sizeBytes: 254000,
        ready: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'art_gltf_1',
        sceneId: 'compressor-hall-a',
        kind: 'gltf',
        path: '/data/scenes/compressor-hall-a/scene.gltf',
        checksum: 'sha256:gltf-qrs456',
        sizeBytes: 351920,
        ready: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: 'art_splat_1',
        sceneId: 'compressor-hall-a',
        kind: 'splat',
        path: '/data/scenes/compressor-hall-a/scene.splat.json',
        checksum: 'sha256:splat-tuv012',
        sizeBytes: 701400,
        ready: true,
        createdAt: new Date().toISOString(),
      },
    ],
  },
};

const reconstructionJobs: Record<string, ReconstructionJob> = {};
const simulationJobs: Record<string, SimulationJob> = {};
const evaluations: Record<string, TrainingEvaluation> = {};

runtimeRoutes.post('/runtime/reconstruction/jobs', (req, res) => {
  const payload = req.body as {
    sceneId?: string;
    captureId?: string;
    projectId?: string;
    areaId?: string;
  };

  const sceneId = payload.sceneId ?? 'compressor-hall-a';
  const scene = sceneCatalog[sceneId] ?? sceneCatalog['compressor-hall-a'];

  const job: ReconstructionJob = {
    id: `job_${Date.now()}`,
    sceneId,
    captureId: payload.captureId ?? `capture_${Date.now()}`,
    status: 'ready',
    progress: 100,
    phase: 'export',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
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

  reconstructionJobs[job.id] = job;

  res.status(202).json({
    message: 'Reconstruction job completed and artifacts validated.',
    job,
    validatedArtifacts: scene.artifacts ?? [],
  });
});

runtimeRoutes.get('/runtime/reconstruction/jobs/:id', (req, res) => {
  const job = reconstructionJobs[req.params.id];
  if (!job) {
    res.status(404).json({ message: 'Reconstruction job not found' });
    return;
  }

  const scene = sceneCatalog[job.sceneId] ?? sceneCatalog['compressor-hall-a'];
  res.json({
    job,
    artifacts: scene.artifacts ?? [],
    artifactReady: (scene.artifacts ?? []).every((artifact) => artifact.ready),
  });
});

runtimeRoutes.post('/runtime/simulations', (req, res) => {
  const payload = req.body as {
    sceneId?: string;
    scenarioId?: string;
    mode?: SimulationMode;
    historianWindow?: HistorianWindow;
    logicControllers?: string[];
  };

  const sceneId = payload.sceneId ?? 'compressor-hall-a';
  const simulationId = `sim_${Date.now()}`;

  const job: SimulationJob = {
    id: simulationId,
    sceneId,
    scenarioId: payload.scenarioId ?? 'scenario_compressor_room_inspection',
    status: 'queued',
    progress: 0,
    mode: payload.mode ?? 'historian-replay',
    startedAt: new Date().toISOString(),
    historianWindow: payload.historianWindow ?? {
      database: 'timescaledb',
      measurement: 'compressor_pressure',
      from: '2026-10-10T09:00:00Z',
      to: '2026-10-10T10:00:00Z',
    },
    logicControllers: payload.logicControllers ?? ['controller_pressure_relief'],
    events: [
      { timestamp: '2026-10-10T09:15:00Z', type: 'sensor', label: 'Pressure baseline', value: 4.1 },
      { timestamp: '2026-10-10T09:15:45Z', type: 'hazard', label: 'Pressure spike detected' },
      { timestamp: '2026-10-10T09:16:20Z', type: 'operator', label: 'Operator checked relief valve' },
    ],
  };

  simulationJobs[job.id] = job;

  res.status(202).json({
    message: 'Simulation job accepted',
    job,
  });
});

runtimeRoutes.get('/runtime/simulations/:id', (req, res) => {
  const job = simulationJobs[req.params.id];
  if (!job) {
    res.status(404).json({ message: 'Simulation job not found' });
    return;
  }

  if (job.status === 'queued') {
    job.status = 'running';
    job.progress = 45;
  } else if (job.status === 'running') {
    job.progress = Math.min(100, job.progress + 30);
    if (job.progress >= 100) {
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.results = {
        id: `result_${Date.now()}`,
        simulationId: job.id,
        sceneId: job.sceneId,
        scenarioId: job.scenarioId,
        operatorActions: ['Inspect compressor', 'Check pressure gauge', 'Confirm valve position'],
        sensorEvents: [
          { timestamp: '2026-10-10T09:15:30Z', value: 4.2 },
          { timestamp: '2026-10-10T09:16:00Z', value: 4.5 },
          { timestamp: '2026-10-10T09:16:30Z', value: 4.8 },
        ],
        anomalies: ['Pressure spike detected at 09:16:15', 'Vibration threshold exceeded'],
        completedAt: new Date().toISOString(),
        success: true,
      };
    }
  }

  res.json({ job });
});

runtimeRoutes.get('/runtime/simulations', (_req, res) => {
  res.json({ simulations: Object.values(simulationJobs) });
});

runtimeRoutes.post('/runtime/training/evaluations', (req, res) => {
  const payload = req.body as {
    scenarioId?: string;
    sceneId?: string;
    steps?: TrainingProgressStep[];
  };

  const scenarioId = payload.scenarioId ?? 'scenario_compressor_room_inspection';
  const sceneId = payload.sceneId ?? 'compressor-hall-a';

  const steps = payload.steps ?? [
    { id: 'step_1', label: 'Pre-inspection safety check', completed: true, completedAt: new Date().toISOString(), score: 100 },
    { id: 'step_2', label: 'Visual inspection', completed: true, completedAt: new Date().toISOString(), score: 95 },
    { id: 'step_3', label: 'Measurement and documentation', completed: false, score: 60 },
  ];

  const average = steps.reduce((sum, step) => sum + (step.score ?? 0), 0) / Math.max(steps.length, 1);

  const evaluation: TrainingEvaluation = {
    scenarioId,
    sceneId,
    passed: average >= 70,
    score: Math.round(average),
    completedAt: new Date().toISOString(),
    steps,
  };

  evaluations[`${scenarioId}:${sceneId}`] = evaluation;

  res.status(201).json({
    message: 'Training evaluation generated',
    evaluation,
  });
});

runtimeRoutes.get('/runtime/training/evaluations/:scenarioId', (req, res) => {
  const key = Object.keys(evaluations).find((entry) => entry.startsWith(`${req.params.scenarioId}:`));

  if (!key) {
    res.status(404).json({ message: 'Training evaluation not found' });
    return;
  }

  res.json({ evaluation: evaluations[key] });
});

runtimeRoutes.get('/runtime/scene-artifacts/:sceneId', (req, res) => {
  const scene = sceneCatalog[req.params.sceneId] ?? sceneCatalog['compressor-hall-a'];
  const artifacts = scene.artifacts ?? [];

  res.json({
    sceneId: scene.id,
    ready: artifacts.every((artifact) => artifact.ready),
    artifacts,
  });
});

runtimeRoutes.get('/runtime/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'industrial-digital-twin-runtime',
    timestamp: new Date().toISOString(),
    registeredScenes: Object.keys(sceneCatalog).length,
    activeSimulations: Object.keys(simulationJobs).length,
    activeEvaluations: Object.keys(evaluations).length,
  });
});
