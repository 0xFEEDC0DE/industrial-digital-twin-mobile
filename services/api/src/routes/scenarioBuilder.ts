import { Router } from 'express';
import type { TrainingScenario } from '@industrial-digital-twin/shared';

export const scenarioBuilderRoutes = Router();

interface TrainingStep {
  id: string;
  label: string;
  description: string;
  duration: number;
  assetTagRefs?: string[];
  hazardMarkers?: Array<{ position: [number, number, number]; label: string }>;
  inspectionPoints?: Array<{ position: [number, number, number]; name: string; expected: string }>;
}

interface EnhancedTrainingScenario extends TrainingScenario {
  sceneId: string;
  steps: TrainingStep[];
  hazardZones: Array<{ position: [number, number, number]; radius: number; label: string }>;
  equipmentHighlights: Array<{ assetId: string; label: string; safetyNotes: string }>;
  historianPlayback?: {
    measurement: string;
    from: string;
    to: string;
  };
}

const scenarios: Record<string, EnhancedTrainingScenario> = {
  'scenario_compressor_room_inspection': {
    id: 'scenario_compressor_room_inspection',
    sceneId: 'compressor-hall-a',
    title: 'Compressor room inspection',
    description: 'Step-by-step operator walkthrough for compressor maintenance and safety inspection',
    environment: 'factory-floor',
    type: 'ar-training',
    createdAt: new Date().toISOString(),
    steps: [
      {
        id: 'step_1',
        label: 'Pre-inspection safety check',
        description: 'Confirm all safety equipment is in place and compressor is depressurized',
        duration: 120,
        hazardMarkers: [
          { position: [2.8, 0.9, 2.2], label: 'High-pressure zone' },
        ],
        assetTagRefs: ['tag-compressor-1'],
      },
      {
        id: 'step_2',
        label: 'Visual inspection',
        description: 'Inspect for leaks, corrosion, and damage',
        duration: 180,
        inspectionPoints: [
          { position: [0.2, 1.4, 3.1], name: 'Compressor body', expected: 'No visible cracks or corrosion' },
          { position: [2.8, 0.9, 2.2], name: 'Pressure relief valve', expected: 'Clean and operational' },
        ],
        assetTagRefs: ['tag-compressor-1'],
      },
      {
        id: 'step_3',
        label: 'Measurement and documentation',
        description: 'Record pressure, temperature, and vibration readings',
        duration: 240,
      },
    ],
    hazardZones: [
      { position: [2.8, 0.9, 2.2], radius: 1.5, label: 'High-pressure discharge area' },
      { position: [1.2, 2.1, 1.8], radius: 1.0, label: 'Hot surfaces' },
    ],
    equipmentHighlights: [
      {
        assetId: 'tag-compressor-1',
        label: 'Main compressor unit',
        safetyNotes: 'Always depressurize before inspection. Wear gloves and eye protection.',
      },
    ],
    historianPlayback: {
      measurement: 'compressor_pressure',
      from: '2026-10-10T09:00:00Z',
      to: '2026-10-10T10:00:00Z',
    },
  },
};

scenariosRoutes.post('/scenarios', (req, res) => {
  const payload = req.body as Partial<EnhancedTrainingScenario>;

  const scenario: EnhancedTrainingScenario = {
    id: `scenario_${Date.now()}`,
    sceneId: payload.sceneId ?? 'compressor-hall-a',
    title: payload.title ?? 'New training scenario',
    description: payload.description ?? 'Operator training scenario',
    environment: payload.environment ?? 'factory-floor',
    type: payload.type ?? 'ar-training',
    steps: payload.steps ?? [],
    hazardZones: payload.hazardZones ?? [],
    equipmentHighlights: payload.equipmentHighlights ?? [],
    createdAt: new Date().toISOString(),
  };

  scenarios[scenario.id] = scenario;

  res.status(201).json({
    message: 'Training scenario created',
    scenario,
  });
});

scenariosRoutes.get('/scenarios/:id', (req, res) => {
  const scenario = scenarios[req.params.id];
  if (!scenario) {
    res.status(404).json({ message: 'Scenario not found' });
    return;
  }
  res.json({ scenario });
});

scenariosRoutes.get('/scenarios', (_req, res) => {
  res.json({ scenarios: Object.values(scenarios) });
});

scenariosRoutes.get('/scenes/:sceneId/scenarios', (req, res) => {
  const sceneId = req.params.sceneId;
  const sceneScenarios = Object.values(scenarios).filter((s) => s.sceneId === sceneId);
  res.json({ scenarios: sceneScenarios });
});
