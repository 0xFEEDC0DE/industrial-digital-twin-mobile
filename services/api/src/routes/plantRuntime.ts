import { Router } from 'express';
import { runtimeStore } from '../store/runtimeStore.js';

export const plantRuntimeRoutes = Router();

// Plant-oriented orchestration layer for the runtime.
// Groups scenes by plant and exposes aggregate operational state for the dashboard.

const plantRegistry: Record<string, string[]> = {
  'plant-alpha': ['compressor-hall-a', 'compressor-hall-b'],
  'plant-beta': ['boiler-room-1'],
};

plantRuntimeRoutes.get('/plants', (_req, res) => {
  res.json({
    plants: Object.entries(plantRegistry).map(([plantId, sceneIds]) => ({
      plantId,
      sceneIds,
      sceneCount: sceneIds.length,
      status: 'online',
    })),
  });
});

plantRuntimeRoutes.get('/plants/:plantId/summary', (req, res) => {
  const plantId = req.params.plantId;
  const sceneIds = plantRegistry[plantId] ?? [];

  const scenes = sceneIds.map((sceneId) => {
    const state = runtimeStore.getSceneState(sceneId);
    return {
      sceneId,
      status: state?.status ?? 'unknown',
      activeSimulations: state?.activeSimulations?.length ?? 0,
      trainingEvaluations: (state?.evaluations ?? []).length,
      tags: (state as any)?.tags?.length ?? 0,
    };
  });

  res.json({
    plantId,
    scenes,
    overview: {
      sceneCount: scenes.length,
      onlineSceneCount: scenes.filter((s) => s.status === 'online').length,
      activeSimulationCount: scenes.reduce((acc, s) => acc + s.activeSimulations, 0),
      evaluationCount: scenes.reduce((acc, s) => acc + s.trainingEvaluations, 0),
    },
  });
});

plantRuntimeRoutes.post('/plants/:plantId/scene/:sceneId', (req, res) => {
  const { plantId, sceneId } = req.params;
  const sceneIds = plantRegistry[plantId] ?? [];
  if (!sceneIds.includes(sceneId)) {
    plantRegistry[plantId] = [...sceneIds, sceneId];
  }

  res.status(201).json({ plantId, sceneId, registered: true });
});
