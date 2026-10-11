import { Router } from 'express';

export const debugRoutes = Router();

debugRoutes.get('/debug/summary', (_req, res) => {
  res.json({
    service: 'industrial-digital-twin-mobile',
    phase: 'prototype',
    version: '0.4.0',
    features: [
      'mobile scan capture',
      'textured scene reconstruction',
      'AR/VR training',
      'gaussian splat preview',
      'industrial tagging',
      'export orchestration',
      'scene detail flow',
    ],
  });
});
