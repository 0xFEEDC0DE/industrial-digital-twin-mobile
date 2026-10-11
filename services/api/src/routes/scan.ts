import { Router } from 'express';
import type { ScanSourceType, ScanRequest } from '@industrial-digital-twin/shared';

export const scanRoutes = Router();

scanRoutes.post('/scans', (req, res) => {
  const payload = req.body as Partial<ScanRequest>;

  const request: ScanRequest = {
    id: `scan_${Date.now()}`,
    projectName: payload.projectName ?? 'unknown-project',
    sceneName: payload.sceneName ?? 'new-scene',
    sourceType: (payload.sourceType as ScanSourceType) ?? 'camera',
    deviceType: payload.deviceType ?? 'mobile',
    captureMode: payload.captureMode ?? 'guided',
    status: 'queued',
    createdAt: new Date().toISOString(),
  };

  res.status(202).json({
    message: 'Scan job accepted',
    scan: request,
  });
});

scanRoutes.get('/scans/:id', (req, res) => {
  res.json({
    id: req.params.id,
    status: 'processing',
    progress: 42,
    message: 'Creating textured mesh from captured media.',
  });
});
