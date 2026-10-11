export type ScanSourceType = 'camera' | 'video' | 'images';
export type CaptureMode = 'guided' | 'freeform' | 'automated';
export type SceneStatus = 'queued' | 'processing' | 'ready' | 'failed';

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

export type TrainingType = 'ar-training' | 'vr-training' | 'hybrid-training';

export interface TrainingScenario {
  id: string;
  title: string;
  description: string;
  environment: string;
  type: TrainingType;
  steps: string[];
  createdAt: string;
}
