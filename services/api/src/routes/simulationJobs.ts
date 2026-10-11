import { Router } from 'express';
import type { Scene, ReconstructionJob } from '@industrial-digital-twin/shared';

export const simulationRoutes = Router();

interface SimulationJob {
  id: string;
  sceneId: string;
  scenarioId: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  playbackMode: 'live' | 'historian-replay' | 'logic-test';
  historianWindow?: {
    from: string;
    to: string;
  };
  logicControllers?: string[];
  results?: {
    operatorActions: string[];
    sensorEvents: Array<{ timestamp: string; value: number }>;
    anomalies: string[];
  };
}

const jobs: Record<string, SimulationJob> = {};

simulationRoutes.post('/simulations', (req, res) => {
  const payload = req.body as {
    sceneId?: string;
    scenarioId?: string;
    playbackMode?: 'live' | 'historian-replay' | 'logic-test';
    historianWindow?: { from: string; to: string };
    logicControllers?: string[];
  };

  const sceneId = payload.sceneId ?? 'compressor-hall-a';
  const scenarioId = payload.scenarioId ?? 'scenario_default';
  const playbackMode = payload.playbackMode ?? 'live';

  const job: SimulationJob = {
    id: `sim_${Date.now()}`,
    sceneId,
    scenarioId,
    status: 'queued',
    progress: 0,
    startedAt: new Date().toISOString(),
    playbackMode,
    historianWindow: payload.historianWindow,
    logicControllers: payload.logicControllers,
  };

  jobs[job.id] = job;

  res.status(202).json({
    message: 'Simulation job accepted',
    job,
  });
});

simulationRoutes.get('/simulations/:id', (req, res) => {
  const job = jobs[req.params.id];

  if (!job) {
    res.status(404).json({ message: 'Simulation job not found' });
    return;
  }

  // Simulate progress
  if (job.status === 'queued') {
    job.status = 'running';
    job.progress = 5;
  } else if (job.status === 'running' && job.progress < 100) {
    job.progress = Math.min(100, job.progress + 20);
    if (job.progress >= 100) {
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      job.results = {
        operatorActions: ['Inspect compressor', 'Check pressure gauge', 'Confirm valve position'],
        sensorEvents: [
          { timestamp: '2026-10-10T09:15:30Z', value: 4.2 },
          { timestamp: '2026-10-10T09:16:00Z', value: 4.5 },
          { timestamp: '2026-10-10T09:16:30Z', value: 4.8 },
        ],
        anomalies: ['Pressure spike detected at 09:16:15', 'Vibration threshold exceeded'],
      };
    }
  }

  res.json({ job });
});

simulationRoutes.get('/simulations', (_req, res) => {
  res.json({ simulations: Object.values(jobs) });
});
