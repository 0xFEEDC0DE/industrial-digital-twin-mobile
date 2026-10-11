export type ExportFormat = 'gltf' | 'usdz' | 'obj' | 'ply' | 'gaussian-splat' | 'webxr';

export interface SceneExportJob {
  id: string;
  sceneId: string;
  format: ExportFormat;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  createdAt: string;
  artifactUrl?: string;
  notes: string[];
}

export function createSceneExportJob(input: {
  sceneId: string;
  format: ExportFormat;
}): SceneExportJob {
  return {
    id: `export_${Date.now()}`,
    sceneId: input.sceneId,
    format: input.format,
    status: 'queued',
    createdAt: new Date().toISOString(),
    notes: [
      'Packaging the digital twin for downstream training or visualization use.',
      'Checking scene metadata and asset hierarchy before final export.',
    ],
  };
}
