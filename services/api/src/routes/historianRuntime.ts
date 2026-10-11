import { Router } from 'express';
import type {
  HistorianWindow,
  SimulationJob,
  SimulationMode,
  TrainingEvaluation,
  TrainingProgressStep,
  Scene,
  ReconstructionJob,
} from '@industrial-digital-twin/shared';

export const historianRuntimeRoutes = Router();

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

const historianSeries = {
  compressor_pressure: [
    { timestamp: '2026-10-10T09:00:00Z', value: 3.8 },
    { timestamp: '2026-10-10T09:05:00Z', value: 4.1 },
    { timestamp: '2026-10-10T09:10:00Z', value: 4.2 },
    { timestamp: '2026-10-10T09:15:00Z', value: 4.4 },
    { timestamp: '2026-10-10T09:15:45Z', value: 4.8 },
    { timestamp: '2026-10-10T09:16:15Z', value: 5.2 },
    { timestamp: '2026-10-10T09:16:30Z', value: 4.9 },
    { timestamp: '2026-10-10T09:20:00Z', value: 4.5 },
  ],
  vibration: [
    { timestamp: '2026-10-10T09:15:00Z', value: 1.1 },
    { timestamp: '2026-10-10T09:15:45Z', value: 1.4 },
    { timestamp: '2026-10-10T09:16:15Z', value: 2.1 },
    { timestamp: '2026-10-10T09:16:30Z', value: 1.9 },
  ],
};

historianRuntimeRoutes.get('/runtime/historian/:sceneId', (req, res) => {
  const scene = sceneCatalog[req.params.sceneId] ?? sceneCatalog['compressor-hall-a'];
  const measurement = scene.metadata.historian?.measurement ?? 'compressor_pressure';

  const data = historianSeries[measurement] ?? historianSeries.compressor_pressure;

  res.json({
    sceneId: scene.id,
    measurement,
    timeWindow: scene.metadata.historian,
    samples: data,
  });
});

historianRuntimeRoutes.get('/runtime/historian/:sceneId/query', (req, res) => {
  const scene = sceneCatalog[req.params.sceneId] ?? sceneCatalog['compressor-hall-a'];
  const measurement = req.query.measurement as string | undefined ?? scene.metadata.historian?.measurement ?? 'compressor_pressure';
  const from = req.query.from as string | undefined ?? scene.metadata.historian?.from ?? '2026-10-10T09:00:00Z';
  const to = req.query.to as string | undefined ?? scene.metadata.historian?.to ?? '2026-10-10T10:00:00Z';

  const data = (historianSeries[measurement as keyof typeof historianSeries] ?? historianSeries.compressor_pressure)
    .filter((point) => point.timestamp >= from && point.timestamp <= to);

  res.json({
    sceneId: scene.id,
    measurement,
    from,
    to,
    samples: data,
    anomalyCount: data.filter((point) => point.value > 4.5).length,
  });
});

historianRuntimeRoutes.post('/runtime/simulations', (req, res) => {
  const payload = req.body as {
    sceneId?: string;
    scenarioId?: string;
    mode?: SimulationMode;
    historianWindow?: HistorianWindow;
    logicControllers?: string[];
  };

  const sceneId = payload.sceneId ?? 'compressor-hall-a';
  const scene = sceneCatalog[sceneId] ?? sceneCatalog['compressor-hall-a'];

  const job: SimulationJob = {
    id: `sim_${Date.now()}`,
    sceneId,
    scenarioId: payload.scenarioId ?? 'scenario_compressor_room_inspection',
    status: 'queued',
    progress: 0,
    mode: payload.mode ?? 'historian-replay',
    startedAt: new Date().toISOString(),
    historianWindow: payload.historianWindow ?? scene.metadata.historian ?? {
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

  res.status(202).json({ job, scene });
});

historianRuntimeRoutes.get('/runtime/simulations/:id', (req, res) => {
  const job = simulationJobs[req.params.id];
  if (!job) {
    res.status(404).json({ message: 'Simulation not found' });
    return;
  }

  if (job.status === 'queued') {
    job.status = 'running';
    job.progress = 30;
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

  const scene = sceneCatalog[job.sceneId] ?? sceneCatalog['compressor-hall-a'];
  res.json({ job, scene, correlation: {
    historianWindow: job.historianWindow,
    sampleCount: (historianSeries[job.historianWindow?.measurement ?? 'compressor_pressure'] ?? historianSeries.compressor_pressure).length,
    anomalyCount: ((historianSeries[job.historianWindow?.measurement ?? 'compressor_pressure'] ?? historianSeries.compressor_pressure).filter((point) => point.value > 4.5)).length,
  }});
});

historianRuntimeRoutes.post('/runtime/training/evaluations', (req, res) => {
  const payload = req.body as {
    scenarioId?: string;
    sceneId?: string;
    steps?: TrainingProgressStep[];
  };

  const scenarioId = payload.scenarioId ?? 'scenario_compressor_room_inspection';
  const sceneId = payload.sceneId ?? 'compressor-hall-a';

  const steps = payload.steps ?? [
    { id: 'step_1', label: 'Pre-inspection safety check', completed: true, completedAt: new Date().toISOString(), score: 100 },
    { id: 'step_2', label: 'Visual inspection', completed: true, completedAt: new Date().toISOString(), score: 96 },
    { id: 'step_3', label: 'Measurement and documentation', completed: true, completedAt: new Date().toISOString(), score: 90 },
  ];

  const average = steps.reduce((sum, step) => sum + (step.score ?? 0), 0) / steps.length;

  const evaluation: TrainingEvaluation = {
    scenarioId,
    sceneId,
    passed: average >= 85,
    score: Math.round(average),
    completedAt: new Date().toISOString(),
    steps,
  };

  evaluations[`${scenarioId}:${sceneId}`] = evaluation;

  res.status(201).json({ evaluation });
});

historianRuntimeRoutes.get('/runtime/logic/test', (req, res) => {
  const controllers = (req.query.controllers as string | undefined)?.split(',') ?? ['controller_pressure_relief'];
  const sceneId = (req.query.sceneId as string | undefined) ?? 'compressor-hall-a';
  const scene = sceneCatalog[sceneId] ?? sceneCatalog['compressor-hall-a'];

  const sensorData = historianSeries.compressor_pressure;
  const logicResult = {
    sceneId: scene.id,
    controllers,
    passed: sensorData.filter((point) => point.value > 4.5).length > 0,
    check: 'pressure_relief_logic_ok',
    details: {
      triggerThreshold: 4.5,
      observedMax: Math.max(...sensorData.map((point) => point.value)),
      timestamp: '2026-10-10T09:16:15Z',
      action: 'Relief valve opened and pressure reduced',
    },
  };

  res.json({ logicResult, scene });
});

historianRuntimeRoutes.get('/runtime/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'industrial-digital-twin-historian-runtime',
    registeredScenes: Object.keys(sceneCatalog).length,
    simulations: Object.keys(simulationJobs).length,
    evaluations: Object.keys(evaluations).length,
    timestamp: new Date().toISOString(),
  });
});
