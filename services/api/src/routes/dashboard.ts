import { Router } from 'express';
import { runtimeStore } from '../store/runtimeStore.js';

export const operationalDashboardRoutes = Router();

// UI-facing operational summary payload for the dashboard.
// This is intentionally aggregated and normalized for frontend consumers.

const plantRegistry: Record<string, string[]> = {
  'plant-alpha': ['compressor-hall-a', 'compressor-hall-b'],
  'plant-beta': ['boiler-room-1'],
};

operationalDashboardRoutes.get('/dashboard/overview', (_req, res) => {
  const plants = Object.entries(plantRegistry).map(([plantId, sceneIds]) => {
    const scenes = sceneIds.map((sceneId) => {
      const state = runtimeStore.getSceneState(sceneId);
      return {
        sceneId,
        status: state?.status ?? 'unknown',
        activeSimulations: state?.activeSimulations?.length ?? 0,
        evaluations: state?.evaluations ?? [],
        tags: (state as any)?.tags ?? [],
        lifecycle: (state as any)?.lifecycle ?? [],
      };
    });

    return {
      plantId,
      status: scenes.some((scene) => scene.status === 'online') ? 'online' : 'degraded',
      sceneCount: scenes.length,
      onlineScenes: scenes.filter((scene) => scene.status === 'online').length,
      activeSimulations: scenes.reduce((acc, scene) => acc + scene.activeSimulations, 0),
      evaluationCount: scenes.reduce((acc, scene) => acc + scene.evaluations.length, 0),
      tags: scenes.reduce((acc, scene) => acc + scene.tags.length, 0),
      recentLifecycle: scenes.flatMap((scene) => scene.lifecycle).slice(-10),
    };
  });

  res.json({
    plants,
    summary: {
      plantCount: plants.length,
      onlinePlantCount: plants.filter((plant) => plant.status === 'online').length,
      totalActiveSimulations: plants.reduce((acc, plant) => acc + plant.activeSimulations, 0),
      totalEvaluationCount: plants.reduce((acc, plant) => acc + plant.evaluationCount, 0),
    },
  });
});

operationalDashboardRoutes.get('/dashboard/plant/:plantId', (req, res) => {
  const { plantId } = req.params;
  const sceneIds = plantRegistry[plantId] ?? [];

  const scenes = sceneIds.map((sceneId) => {
    const state = runtimeStore.getSceneState(sceneId);
    return {
      sceneId,
      status: state?.status ?? 'unknown',
      activeSimulations: state?.activeSimulations?.length ?? 0,
      evaluations: state?.evaluations ?? [],
      tags: (state as any)?.tags ?? [],
      lifecycle: (state as any)?.lifecycle ?? [],
    };
  });

  res.json({
    plantId,
    scenes,
    summary: {
      sceneCount: scenes.length,
      onlineScenes: scenes.filter((scene) => scene.status === 'online').length,
      activeSimulations: scenes.reduce((acc, scene) => acc + scene.activeSimulations, 0),
      evaluationCount: scenes.reduce((acc, scene) => acc + scene.evaluations.length, 0),
    },
  });
});
