export type ScanSourceType = 'camera' | 'video' | 'images';
export type CaptureMode = 'guided' | 'freeform' | 'automated';
export type SceneStatus = 'queued' | 'processing' | 'ready' | 'failed';
export type TrainingType = 'ar-training' | 'vr-training' | 'hybrid-training';
export type ReconstructionPhase = 'capture' | 'frames' | 'sfm' | 'depth' | 'mesh' | 'texture' | 'splat' | 'export';
export type SimulationMode = 'live' | 'historian-replay' | 'logic-test';
export type SimulationStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface ScanRequest {
  id: string;
  projectName: string;
  sceneName: string;
  sourceType: ScanSourceType;
  deviceType: string;
  captureMode: CaptureMode;
  status: SceneStatus;
  createdAt: string;
}

export interface HistorianWindow {
  database: 'influxdb' | 'timescaledb';
  measurement: string;
  from: string;
  to: string;
}

export interface AssetTag {
  id: string;
  label: string;
  type: 'equipment' | 'hazard' | 'route' | 'safety' | 'annotation';
  position: [number, number, number];
}

export interface SceneMetadata {
  sceneId: string;
  projectId: string;
  areaId: string;
  areaName: string;
  plantZone: string;
  tags: string[];
  assetTags: AssetTag[];
  historian: HistorianWindow | null;
  modularIoContext: {
    deviceIds: string[];
    assetRefs: string[];
  } | null;
}

export interface SceneArtifact {
  id: string;
  sceneId: string;
  kind: 'mesh' | 'texture' | 'gltf' | 'splat' | 'thumbnail';
  path: string;
  checksum?: string;
  sizeBytes?: number;
  ready: boolean;
  createdAt: string;
}

export interface Scene {
  id: string;
  name: string;
  area: string;
  status: SceneStatus;
  progress: number;
  exportReady: boolean;
  textureScore: number;
  gaussianReady: boolean;
  tags: string[];
  metadata: SceneMetadata;
  artifacts?: SceneArtifact[];
}

export interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  environment: string;
  type: TrainingType;
  sceneId?: string;
  steps: string[];
  createdAt: string;
}

export interface ReconstructionJob {
  id: string;
  sceneId: string;
  captureId: string;
  status: SceneStatus;
  progress: number;
  phase: ReconstructionPhase;
  startedAt: string;
  completedAt?: string;
  outputPaths?: {
    mesh?: string;
    texture?: string;
    gltf?: string;
    splat?: string;
  };
  metadata?: Partial<SceneMetadata>;
}

export interface SimulationEvent {
  timestamp: string;
  type: 'sensor' | 'operator' | 'hazard' | 'system';
  label: string;
  value?: number;
}

export interface SimulationResult {
  id: string;
  simulationId: string;
  sceneId: string;
  scenarioId: string;
  operatorActions: string[];
  sensorEvents: Array<{ timestamp: string; value: number }>;
  anomalies: string[];
  completedAt: string;
  success: boolean;
}

export interface SimulationJob {
  id: string;
  sceneId: string;
  scenarioId: string;
  status: SimulationStatus;
  progress: number;
  mode: SimulationMode;
  startedAt: string;
  completedAt?: string;
  historianWindow?: HistorianWindow;
  logicControllers?: string[];
  events?: SimulationEvent[];
  results?: SimulationResult;
}

export interface TrainingProgressStep {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string;
  score?: number;
}

export interface TrainingEvaluation {
  scenarioId: string;
  sceneId: string;
  passed: boolean;
  score: number;
  completedAt: string;
  steps: TrainingProgressStep[];
}
