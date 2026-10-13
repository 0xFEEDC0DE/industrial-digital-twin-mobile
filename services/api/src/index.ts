import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { scanRoutes } from './routes/scan.js';
import { trainingRoutes } from './routes/training.js';
import { reconstructionRoutes } from './routes/reconstruction.js';
import { exportRoutes } from './routes/export.js';
import { scenesRoutes } from './routes/scenes.js';
import { sceneTagsRoutes } from './routes/sceneTags.js';
import { debugRoutes } from './routes/debug.js';
import { runtimeRoutes } from './routes/runtime.js';
import { operationalRuntimeRoutes } from './routes/operationalRuntime.js';
import { modularIoRoutes } from './routes/modularIo.js';
import { tagbookRoutes } from './routes/tagbook.js';
import { trainingIoRoutes } from './routes/trainingIo.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'industrial-digital-twin-api',
    timestamp: new Date().toISOString(),
    version: '0.6.0',
  });
});

app.use('/api', scanRoutes);
app.use('/api', trainingRoutes);
app.use('/api', reconstructionRoutes);
app.use('/api', exportRoutes);
app.use('/api', scenesRoutes);
app.use('/api', sceneTagsRoutes);
app.use('/api', debugRoutes);
app.use('/api', runtimeRoutes);
app.use('/api', operationalRuntimeRoutes);
app.use('/api', modularIoRoutes);
app.use('/api', tagbookRoutes);
app.use('/api', trainingIoRoutes);

app.listen(port, () => {
  console.log(`Industrial digital twin API running on http://localhost:${port}`);
});
