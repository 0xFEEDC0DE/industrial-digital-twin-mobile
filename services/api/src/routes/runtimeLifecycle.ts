import { Router } from 'express';
import { runtimeStore } from '../store/runtimeStore.js';

export const runtimeLifecycleRoutes = Router();

// Contract for the desktop training platform and runtime integration.
// This is a normalized event model for training and operational lifecycle updates.

runtimeLifecycleRoutes.post('/runtime/lifecycle', (req, res) => {
  const payload = req.body as {
    sceneId?: string;
    source?: 'modular-io' | 'tagbook' | 'training-io' | 'io-training';
    eventType?:
      | 'scene_initialized'
      | 'scene_ready'
      | 'task_started'
      | 'task_progress'
      | 'task_completed'
      | 'tag_created'
      | 'device_measurement'
      | 'training_eval_completed'
      | 'runtime_error';
    payload?: Record<string, any>;
    timestamp?: string;
  };

  if (!payload?.sceneId || !payload?.eventType) {
    res.status(400).json({ message: 'sceneId and eventType are required' });
    return;
  }

  const state = runtimeStore.getSceneState(payload.sceneId);
  if (!state) {
    res.status(404).json({ message: 'Scene not found' });
    return;
  }

  const lifecycle = {
    sceneId: payload.sceneId,
    source: payload.source ?? 'training-io',
    eventType: payload.eventType,
    payload: payload.payload ?? {},
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };

  // Append lifecycle events to a runtime-specific stream
  const list = ((state as any).lifecycle ?? []) as any[];
  list.push(lifecycle);
  (state as any).lifecycle = list;
  runtimeStore.updateSceneState(payload.sceneId, { ...(state as any) });

  // For known training completions, persist evaluation details in the runtime store
  if (payload.eventType === 'training_eval_completed') {
    const evaluation = payload.payload?.evaluation;
    if (evaluation) {
      runtimeStore.addEvaluation(payload.sceneId, {
        scenarioId: evaluation.scenarioId ?? 'training_eval_completed',
        sceneId: payload.sceneId,
        passed: evaluation.passed ?? false,
        score: evaluation.score ?? 0,
        completedAt: evaluation.completedAt ?? new Date().toISOString(),
        steps: evaluation.steps ?? [],
      });
    }
  }

  res.status(202).json({ accepted: true, lifecycle });
});

runtimeLifecycleRoutes.get('/runtime/lifecycle/:sceneId', (req, res) => {
  const state = runtimeStore.getSceneState(req.params.sceneId);
  if (!state) {
    res.status(404).json({ message: 'Scene not found' });
    return;
  }

  res.json({ sceneId: req.params.sceneId, lifecycle: (state as any).lifecycle ?? [] });
});
