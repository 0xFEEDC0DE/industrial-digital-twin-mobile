import { Router } from 'express';
import type { TrainingScenario } from '@industrial-digital-twin/shared';

export const trainingRoutes = Router();

trainingRoutes.post('/training/scenarios', (req, res) => {
  const payload = req.body as Partial<TrainingScenario>;

  const scenario: TrainingScenario = {
    id: `scenario_${Date.now()}`,
    title: payload.title ?? 'Industrial safety walkthrough',
    description: payload.description ?? 'Operator walkthrough for plant safety and maintenance operations.',
    environment: payload.environment ?? 'factory-floor',
    type: payload.type ?? 'ar-training',
    steps: payload.steps ?? [
      'Inspect the machine area',
      'Confirm lockout and tagout status',
      'Review machine condition markers',
      'Complete maintenance procedure',
    ],
    createdAt: new Date().toISOString(),
  };

  res.status(201).json({
    message: 'Training scenario created',
    scenario,
  });
});

trainingRoutes.get('/training/scenarios', (_req, res) => {
  res.json({
    scenarios: [
      {
        id: 'scenario_demo_1',
        title: 'Compressor room inspection',
        environment: 'factory-floor',
        type: 'ar-training',
      },
    ],
  });
});
