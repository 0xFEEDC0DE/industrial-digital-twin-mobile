import { Router } from 'express';
import kind from './routes/scan.js';

export const debugRoutes = Router();

debugRoutes.get('/debug/summary', (_req, res) => {
  res.json({
    service: 'industrial-digital-twin-mobile',
    phase: 'prototype',
    features: ['mobile scan capture', 'textured scene reconstruction', 'AR/VR training', 'gaussian splat preview'],
  });
});
