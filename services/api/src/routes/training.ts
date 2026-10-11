import { Router } from 'express';
import type { TrainingScenario } from '@industrial-digital-twin/shared';

export const trainingRoutes = Router();

const scenarios: TrainingScenario[] = [
  {
    id: 'scenario_compressor_room_inspection',
    title: 'Compressor room inspection',
    description: 'Inspect the compressor room for safety and maintenance readiness before startup.',
    environment: 'factory-floor',
    type: 'ar-training',
    steps: [
      'Inspect the room and identify equipment tags',
      'Verify lockout / tagout status and PPE compliance',
      'Check pipe condition and pressure indicators',
      'Complete the startup checklist and confirm controls',
    ],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'scenario_equipment_inspection',
    title: 'Equipment inspection drill',
    description: 'Review a maintenance bay scene and identify the next required inspection actions.',
    environment: 'maintenance-bay',
    type: 'vr-training',
    steps: [
      'Scan the production line and inspect guard conditions',
      'Review vibration and temperature readings',
      'Confirm maintenance record alignment',
      'Escalate any unsafe condition to the supervisor',
    ],
    createdAt: new Date().toISOString(),
  },
];

trainingRoutes.post('/training/scenarios', (req, res) => {
  const payload = req.body as Partial<TrainingScenario>;

  const scenario: TrainingScenario = {
    id: `scenario_${Date.now()}`,
    title: payload.title ?? 'Industrial safety walkthrough',
    description:
      payload.description ?? 'Operator walkthrough for plant safety and maintenance operations.',
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

  scenarios.unshift(scenario);

  res.status(201).json({
    message: 'Training scenario created',
    scenario,
  });
});

trainingRoutes.get('/training/scenarios', (_req, res) => {
  res.json({ scenarios });
});

trainingRoutes.get('/training/scenarios/:id', (req, res) => {
  const scenario = scenarios.find((item) => item.id === req.params.id) ?? scenarios[0];

  res.json({
    scenario,
    status: 'ready',
    progress: 75,
    trainingSession: {
      id: `session_${Date.now()}`,
      startedAt: new Date().toISOString(),
      mode: scenario.type,
      steps: scenario.steps.map((label, index) => ({
        id: `step_${index + 1}`,
        label,
        complete: index < 2,
      })),
    },
  });
});
