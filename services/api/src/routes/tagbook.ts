import { Router } from 'express';
import { runtimeStore } from '../store/runtimeStore.js';

export const tagbookRoutes = Router();

// Accept tag updates coming from Tagbook (IDE plugin) for quick in-IDE annotation
// Expected payload: { sceneId: string, tag: { id?: string, label: string, type?: string, position?: [number,number,number], meta?: any } }

tagbookRoutes.post('/tagbook/tag', (req, res) => {
  const payload = req.body as {
    sceneId?: string;
    tag?: {
      id?: string;
      label: string;
      type?: string;
      position?: [number, number, number];
      meta?: Record<string, any>;
    };
  };

  if (!payload?.sceneId || !payload?.tag) {
    res.status(400).json({ message: 'sceneId and tag are required' });
    return;
  }

  const state = runtimeStore.getSceneState(payload.sceneId);
  if (!state) {
    res.status(404).json({ message: 'Scene not found in runtime store' });
    return;
  }

  // Upsert into scene metadata.assetTags if available otherwise place into artifacts as a lightweight tag list
  const tag = {
    id: payload.tag.id ?? `tag_${Date.now()}`,
    label: payload.tag.label,
    type: payload.tag.type ?? 'annotation',
    position: payload.tag.position ?? null,
    meta: payload.tag.meta ?? {},
    createdAt: new Date().toISOString(),
  } as any;

  // Try to update scene metadata if present
  const sceneState = state;
  // best-effort: if the runtime state has an associated scene metadata, append there
  try {
    // mutate metadata if exists
    // NOTE: runtimeStore stores SceneArtifact[] but we used Scene metadata originally on initialization; keep this flexible
    // We'll append a simple tag collection on the runtime state for quick access
    (sceneState as any).tags = Array.isArray((sceneState as any).tags) ? (sceneState as any).tags : [];
    (sceneState as any).tags.push(tag);
    runtimeStore.updateSceneState(payload.sceneId, { ...(sceneState as any) });
  } catch (e) {
    // fallback: ignore
  }

  res.status(201).json({ tag });
});

tagbookRoutes.get('/tagbook/scene/:sceneId/tags', (req, res) => {
  const state = runtimeStore.getSceneState(req.params.sceneId);
  if (!state) {
    res.status(404).json({ message: 'Scene not found' });
    return;
  }

  res.json({ tags: (state as any).tags ?? [] });
});
