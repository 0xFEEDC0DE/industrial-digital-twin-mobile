import { Router } from 'express';

export const scenesRoutes = Router();

const sceneCatalog = {
  'compressor-hall-a': {
    id: 'compressor-hall-a',
    name: 'Compressor hall A',
    area: 'Plant floor / compressor room',
    status: 'texturing active',
    progress: 82,
    exportReady: true,
    textureScore: 92,
    gaussianReady: true,
    tags: ['compressor', 'safety zone', 'pipe run', 'valve stack'],
  },
  'packaging-line-3': {
    id: 'packaging-line-3',
    name: 'Packaging line 3',
    area: 'Assembly / packaging',
    status: 'scan in progress',
    progress: 48,
    exportReady: false,
    textureScore: 71,
    gaussianReady: false,
    tags: ['conveyor', 'inspection point', 'guard rail'],
  },
  'water-treatment-intake': {
    id: 'water-treatment-intake',
    name: 'Water treatment intake',
    area: 'Utility / treatment',
    status: 'training export ready',
    progress: 96,
    exportReady: true,
    textureScore: 95,
    gaussianReady: true,
    tags: ['intake manifold', 'risk zone', 'utility corridor'],
  },
};

scenesRoutes.get('/scenes/:id', (req, res) => {
  const scene = sceneCatalog[(req.params.id as keyof typeof sceneCatalog)] ?? sceneCatalog['compressor-hall-a'];

  res.json({
    scene,
    trainingScenarioId: 'scenario_compressor_room_inspection',
    exportFormats: ['gltf', 'usdz', 'ply', 'gaussian-splat', 'webxr'],
  });
});

scenesRoutes.get('/scenes', (_req, res) => {
  res.json({ scenes: Object.values(sceneCatalog) });
});
