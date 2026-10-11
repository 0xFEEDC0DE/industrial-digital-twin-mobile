import { Router } from 'express';
import { createSceneExportJob } from '../services/export.js';

export const exportRoutes = Router();

exportRoutes.post('/exports', (req, res) => {
  const payload = req.body as { sceneId?: string; format?: string };

  const sceneId = payload.sceneId ?? 'scene_unknown';
  const format = (payload.format as 'gltf' | 'usdz' | 'obj' | 'ply' | 'gaussian-splat' | 'webxr') ?? 'gltf';

  const exportJob = createSceneExportJob({ sceneId, format });

  res.status(201).json({
    exportJob,
    message: 'Scene export requested and queued.',
  });
});

exportRoutes.get('/exports/:id', (req, res) => {
  res.json({
    id: req.params.id,
    status: 'ready',
    artifactUrl: 'https://example.com/assets/industrial-twin-export.gltf',
    notes: ['Export finalized', 'AR training package ready for publishing'],
  });
});
