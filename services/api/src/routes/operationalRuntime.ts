import { Router } from 'express';
import type {
  HistorianWindow,
  SimulationJob,
  SimulationMode,
  TrainingEvaluation,
  TrainingProgressStep,
  Scene,
} from '@industrial-digital-twin/shared';
import { runtimeStore } from '../store/runtimeStore.js';

export const operationalRuntimeRoutes = Router();

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

// Initialize all scenes in the runtime store on module load
Object.values(sceneCatalog).forEach((scene) => {
  runtimeStore.initializeScene(scene);
});

operationalRuntimeRoutes.get('/runtime/scenes', (_req, res) => {
  const states = runtimeStore.getAllSceneStates();
  res.json({ scenes: states });
});

operationalRuntimeRoutes.get('/runtime/scene/:sceneId', (req, res) => {
  const state = runtimeStore.getSceneState(req.params.sceneId);
  if (!state) {
    res.status(404).json({ message: 'Scene not found' });
    return;
  }
  const scene = sceneCatalog[req.params.sceneId];
  res.json({ state, scene });
});

operationalRuntimeRoutes.post('/runtime/scene/:sceneId/reconstruction', (req, res) => {
  const scene = sceneCatalog[req.params.sceneId];
  if (!scene) {
    res.status(404).json({ message: 'Scene not found' });
    return;
  }

  const job = {
    id: `job_${Date.now()}`,
    sceneId: req.params.sceneId,
    captureId: `capture_${Date.now()}`,
    status: 'ready' as const,
    progress: 100,
    phase: 'export' as const,
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    metadata: scene.metadata,
    outputPaths: {
      mesh: `/data/scenes/${req.params.sceneId}/mesh.ply`,
      texture: `/data/scenes/${req.params.sceneId}/texture.png`,
      gltf: `/data/scenes/${req.params.sceneId}/scene.gltf`,
      splat: `/data/scenes/${req.params.sceneId}/scene.splat.json`,
    },
  };

  runtimeStore.addReconstructionJob(req.params.sceneId, job);
  runtimeStore.updateArtifacts(req.params.sceneId, scene.artifacts ?? []);

  res.status(202).json({ job, artifacts: scene.artifacts });
});

operationalRuntimeRoutes.post('/runtime/scene/:sceneId/simulate', (req, res) => {
  const scene = sceneCatalog[req.params.sceneId];
  if (!scene) {
    res.status(404).json({ message: 'Scene not found' });
    return;
  }

  const payload = req.body as {
    scenarioId?: string;
    mode?: SimulationMode;
    historianWindow?: HistorianWindow;
    logicControllers?: string[];
  };

  const job: SimulationJob = {
    id: `sim_${Date.now()}`,
    sceneId: req.params.sceneId,
    scenarioId: payload.scenarioId ?? 'scenario_compressor_room_inspection',
    status: 'queued',
    progress: 0,
    mode: payload.mode ?? 'historian-replay',
    startedAt: new Date().toISOString(),
    historianWindow: payload.historianWindow ?? scene.metadata.historian,
    logicControllers: payload.logicControllers ?? ['controller_pressure_relief'],
    events: [
      { timestamp: '2026-10-10T09:15:00Z', type: 'sensor', label: 'Pressure baseline', value: 4.1 },
      { timestamp: '2026-10-10T09:15:45Z', type: 'hazard', label: 'Pressure spike detected' },
      { timestamp: '2026-10-10T09:16:20Z', type: 'operator', label: 'Operator checked relief valve' },
    ],
  };

  runtimeStore.addSimulation(req.params.sceneId, job);
  res.status(202).json({ job });
});

operationalRuntimeRoutes.get('/runtime/scene/:sceneId/simulation/:simId', (req, res) => {
  const state = runtimeStore.getSceneState(req.params.sceneId);
  if (!state) {
    res.status(404).json({ message: 'Scene not found' });
    return;
  }

  const sim = state.activeSimulations.find((s) => s.id === req.params.simId);
  if (!sim) {
    res.status(404).json({ message: 'Simulation not found' });
    return;
  }

  if (sim.status === 'queued') {
    const updated = runtimeStore.updateSimulation(req.params.sceneId, sim.id, {
      status: 'running',
      progress: 30,
    });
    if (updated) {
      res.json({ simulation: updated });
      return;
    }
  } else if (sim.status === 'running') {
    const updated = runtimeStore.updateSimulation(req.params.sceneId, sim.id, {
      progress: Math.min(100, sim.progress + 30),
    });
    if (updated && updated.progress >= 100) {
      const withResults = runtimeStore.updateSimulation(req.params.sceneId, sim.id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        results: {
          id: `result_${Date.now()}`,
          simulationId: sim.id,
          sceneId: req.params.sceneId,
          scenarioId: sim.scenarioId,
          operatorActions: ['Inspect compressor', 'Check pressure gauge', 'Confirm valve position'],
          sensorEvents: [
            { timestamp: '2026-10-10T09:15:30Z', value: 4.2 },
            { timestamp: '2026-10-10T09:16:00Z', value: 4.5 },
            { timestamp: '2026-10-10T09:16:30Z', value: 4.8 },
          ],
          anomalies: ['Pressure spike detected at 09:16:15', 'Vibration threshold exceeded'],
          completedAt: new Date().toISOString(),
          success: true,
        },
      });
      res.json({ simulation: withResults });
      return;
    }
    res.json({ simulation: updated });
    return;
  }

  res.json({ simulation: sim });
});

operationalRuntimeRoutes.post('/runtime/scene/:sceneId/evaluate', (req, res) => {
  const scene = sceneCatalog[req.params.sceneId];
  if (!scene) {
    res.status(404).json({ message: 'Scene not found' });
    return;
  }

  const payload = req.body as {
    scenarioId?: string;
    steps?: TrainingProgressStep[];
  };

  const steps = payload.steps ?? [
    { id: 'step_1', label: 'Pre-inspection safety check', completed: true, completedAt: new Date().toISOString(), score: 100 },
    { id: 'step_2', label: 'Visual inspection', completed: true, completedAt: new Date().toISOString(), score: 96 },
    { id: 'step_3', label: 'Measurement and documentation', completed: true, completedAt: new Date().toISOString(), score: 90 },
  ];

  const average = steps.reduce((sum, step) => sum + (step.score ?? 0), 0) / steps.length;

  const evaluation: TrainingEvaluation = {
    scenarioId: payload.scenarioId ?? 'scenario_compressor_room_inspection',
    sceneId: req.params.sceneId,
    passed: average >= 85,
    score: Math.round(average),
    completedAt: new Date().toISOString(),
    steps,
  };

  runtimeStore.addEvaluation(req.params.sceneId, evaluation);
  res.status(201).json({ evaluation });
});

operationalRuntimeRoutes.get('/runtime/metrics', (_req, res) => {
  const metrics = runtimeStore.getOperationalMetrics();
  res.json(metrics);
});

operationalRuntimeRoutes.get('/runtime/scene/:sceneId/history', (req, res) => {
  const history = runtimeStore.getJobHistory(req.params.sceneId);
  res.json({ sceneId: req.params.sceneId, jobHistory: history });
});

operationalRuntimeRoutes.get('/runtime/operational-health', (_req, res) => {
  const states = runtimeStore.getAllSceneStates();
  const metrics = runtimeStore.getOperationalMetrics();

  res.json({
    ok: true,
    service: 'industrial-digital-twin-operational-runtime',
    metrics,
    sceneStatus: states.map((state) => ({
      sceneId: state.sceneId,
      status: state.status,
      artifactsReady: state.artifacts.every((a) => a.ready),
      activeSimulations: state.activeSimulations.length,
      totalEvaluations: state.evaluations.length,
    })),
    timestamp: new Date().toISOString(),
  });
});
