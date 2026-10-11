import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { scanRoutes } from './routes/scan.js';
import { trainingRoutes } from './routes/training.js';
import { reconstructionRoutes } from './routes/reconstruction.js';
import { exportRoutes } from './routes/export.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'industrial-digital-twin-api',
    timestamp: new Date().toISOString(),
    version: '0.2.0',
  });
});

app.use('/api', scanRoutes);
app.use('/api', trainingRoutes);
app.use('/api', reconstructionRoutes);
app.use('/api', exportRoutes);

app.listen(port, () => {
  console.log(`Industrial digital twin API running on http://localhost:${port}`);
});
