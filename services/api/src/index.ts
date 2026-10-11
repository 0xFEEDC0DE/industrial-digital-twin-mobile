import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { scanRoutes } from './routes/scan.js';
import { trainingRoutes } from './routes/training.js';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'industrial-digital-twin-api', timestamp: new Date().toISOString() });
});

app.use('/api', scanRoutes);
app.use('/api', trainingRoutes);

app.listen(port, () => {
  console.log(`Industrial digital twin API running on http://localhost:${port}`);
});
