import { Router } from 'express';
import { runtimeStore } from '../store/runtimeStore.js';

export const trainingIoRoutes = Router();

// Minimal training-io adapter for desktop training platform integration.
// This test harness accepts job creation and completion callbacks and records evaluations into the runtime store.

const jobs: Record<string, any> = {};

trainingIoRoutes.post('/training-io/job', (req, res) => {
  const payload = req.body as {
    sceneId: string;
    scenarioId?: string;
    trainerId?: string;
    params?: Record<string, any>;
  };

  if (!payload?.sceneId) {
    res.status(400).json({ message: 'sceneId is required' });
    return;
  }

  const jobId = `train_${Date.now()}`;
  const job = {
    id: jobId,
    sceneId: payload.sceneId,
    scenarioId: payload.scenarioId ?? 'scenario_compressor_room_inspection',
    trainerId: payload.trainerId ?? 'training-io-desktop',
    params: payload.params ?? {},
    status: 'queued',
    createdAt: new Date().toISOString(),
  };

  jobs[jobId] = job;

  res.status(201).json({ job });
});

trainingIoRoutes.post('/training-io/job/:jobId/update', (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) {
    res.status(404).json({ message: 'Job not found' });
    return;
  }

  const payload = req.body as { status?: string; progress?: number; result?: any };
  job.status = payload.status ?? job.status;
  job.progress = payload.progress ?? job.progress;
  job.updatedAt = new Date().toISOString();
  job.result = payload.result ?? job.result;

  // If the job reports completion and includes a result summary, record an evaluation
  if (job.status === 'completed' && job.result?.evaluation) {
    const evalSummary = job.result.evaluation as {
      passed: boolean;
      score: number;
      steps?: any[];
    };

    const evaluation = {
      scenarioId: job.scenarioId,
      sceneId: job.sceneId,
      passed: evalSummary.passed,
      score: evalSummary.score,
      completedAt: new Date().toISOString(),
      steps: evalSummary.steps ?? [],
    };

    runtimeStore.addEvaluation(job.sceneId, evaluation);
  }

  res.json({ job });
});

trainingIoRoutes.get('/training-io/job/:jobId', (req, res) => {
  const job = jobs[req.params.jobId];
  if (!job) {
    res.status(404).json({ message: 'Job not found' });
    return;
  }
  res.json({ job });
});
