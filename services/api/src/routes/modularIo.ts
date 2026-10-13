import { Router } from 'express';
import { runtimeStore } from '../store/runtimeStore.js';

export const modularIoRoutes = Router();

// Simple device -> scene mapping for test integration with modular-io.
// In a full integration this would be discovered from scene metadata or a registry.
const deviceToScene: Record<string, string> = {
  'sensor-01': 'compressor-hall-a',
  'sensor-02': 'compressor-hall-a',
};

modularIoRoutes.post('/modular-io/event', (req, res) => {
  const payload = req.body as {
    deviceId: string;
    timestamp?: string;
    measurement?: number;
    type?: string;
    meta?: Record<string, any>;
  };

  if (!payload?.deviceId) {
    res.status(400).json({ message: 'deviceId is required' });
    return;
  }

  const sceneId = deviceToScene[payload.deviceId];
  if (!sceneId) {
    res.status(404).json({ message: `Unknown device ${payload.deviceId}` });
    return;
  }

  // Look for an existing live-io simulation for the scene
  const state = runtimeStore.getSceneState(sceneId);
  if (!state) {
    res.status(500).json({ message: 'Scene not initialized in runtime store' });
    return;
  }

  let sim = state.activeSimulations.find((s) => s.mode === 'live-io');
  if (!sim) {
    sim = {
      id: `liveio_${Date.now()}`,
      sceneId,
      scenarioId: 'live_io_ingest',
      status: 'running',
      progress: 0,
      mode: 'live-io',
      startedAt: new Date().toISOString(),
      historianWindow: null,
      logicControllers: [],
      events: [],
    } as any; // keep flexible for test harness

    runtimeStore.addSimulation(sceneId, sim);
  }

  const event = {
    timestamp: payload.timestamp ?? new Date().toISOString(),
    type: payload.type ?? 'measurement',
    deviceId: payload.deviceId,
    value: payload.measurement,
    meta: payload.meta ?? {},
  };

  // Append event to the simulation in-place
  const updated = runtimeStore.updateSimulation(sceneId, sim.id, {
    progress: Math.min(100, (sim.progress ?? 0) + 5),
    events: [...(sim.events ?? []), event],
  } as any);

  res.status(202).json({ sceneId, simulation: updated ?? sim });
});

modularIoRoutes.get('/modular-io/devices', (_req, res) => {
  res.json({ mapping: deviceToScene });
});

modularIoRoutes.get('/modular-io/scene/:sceneId/events', (req, res) => {
  const state = runtimeStore.getSceneState(req.params.sceneId);
  if (!state) {
    res.status(404).json({ message: 'Scene not found' });
    return;
  }

  const live = state.activeSimulations.find((s) => s.mode === 'live-io');
  res.json({ events: live?.events ?? [] });
});
