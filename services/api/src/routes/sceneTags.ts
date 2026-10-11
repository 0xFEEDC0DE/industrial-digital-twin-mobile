import { Router } from 'express';
import { createSceneAssetTag } from '../services/sceneTags.js';

export const sceneTagsRoutes = Router();

sceneTagsRoutes.post('/scene-tags', (req, res) => {
  const payload = req.body as {
    label?: string;
    type?: 'equipment' | 'hazard' | 'route' | 'safety' | 'annotation';
    position?: [number, number, number];
  };

  const tag = createSceneAssetTag({
    label: payload.label ?? 'Machine zone',
    type: payload.type ?? 'equipment',
    position: payload.position ?? [0, 0, 0],
  });

  res.status(201).json({ tag, message: 'Scene asset tag created.' });
});
