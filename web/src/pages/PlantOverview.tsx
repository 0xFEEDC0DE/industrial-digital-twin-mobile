import React, { useEffect, useState } from 'react';
import { fetchOverview } from '../api/dashboard';
import { subscribeRuntimeEvents } from '../api/sse';
import SceneEditDrawer, { SceneEditState } from '../components/SceneEditDrawer';

export default function PlantOverview() {
  const [overview, setOverview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);
  const [editingScene, setEditingScene] = useState<SceneEditState | null>(null);
  const [scenesMeta, setScenesMeta] = useState<Record<string, Partial<SceneEditState>>>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchOverview();
        if (!cancelled) {
          setOverview(data);
          setSelectedPlantId((current) => current ?? data.plants?.[0]?.plantId ?? null);
        }
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    const unsub = subscribeRuntimeEvents(
      () => {
        load();
      },
      (err) => {
        console.warn('SSE unavailable; falling back to polling', err);
      }
    );

    return () => {
      cancelled = true;
      unsub();
    };
  }, []);

  if (loading) {
    return <div className="status-panel status-panel--loading">Loading plant overview…</div>;
  }

  if (error) {
    return <div className="status-panel status-panel--error">{error}</div>;
  }

  if (!overview || !overview.plants?.length) {
    return <div className="status-panel">No plant data available.</div>;
  }

  const selectedPlant =
    overview.plants.find((plant: any) => plant.plantId === selectedPlantId) ?? overview.plants[0];

  // Build a lightweight scene model from recentLifecycle for the strip; allow overrides from scenesMeta
  const sceneCards = (selectedPlant.recentLifecycle ?? []).slice(0, 8).map((event: any, idx: number) => {
    const id = `${event.sceneId ?? 'scene'}-${idx}`;
    const baseId = event.sceneId ?? `Scene ${idx + 1}`;
    const meta = scenesMeta[baseId] ?? {};
    return {
      id,
      sceneId: baseId,
      name: meta.name ?? baseId,
      status: idx % 2 === 0 ? 'online' : 'unknown',
      sims: meta.tags ? meta.tags.length : idx === 0 ? 3 : idx === 1 ? 1 : 2,
      evalScore: idx % 2 === 0 ? 96 : 82,
      evalPass: idx % 2 === 0,
      meta,
    };
  });

  function handleOpenEdit(sceneId: string) {
    const existing = scenesMeta[sceneId] ?? { sceneId, name: sceneId, description: '', tags: [] };
    setEditingScene({
      sceneId,
      name: existing.name ?? sceneId,
      description: existing.description ?? '',
      tags: (existing.tags as string[]) ?? [],
    });
  }

  function handleSaveEdit(next: SceneEditState) {
    setScenesMeta((prev) => ({ ...prev, [next.sceneId]: next }));
    // optimistic UI only; a future pass can persist to API
  }

  return (
    <div className="industrial-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">IDT</div>
          <div>
            <div className="eyebrow">Operations</div>
            <h1>Plant dashboard</h1>
          </div>
        </div>

        <div className="status-cluster">
          <span className="status-pill status-pill--online">Online</span>
          <span className="status-pill status-pill--neutral">{overview.summary.onlinePlantCount} online</span>
        </div>
      </header>

      <div className="layout-grid">
        <aside className="plant-rail">
          <div className="rail-header">
            <span className="eyebrow">Plants</span>
            <button className="ghost-btn">+ New</button>
          </div>

          {overview.plants.map((plant: any) => (
            <button
              key={plant.plantId}
              className={`plant-rail-item ${selectedPlant.plantId === plant.plantId ? 'selected' : ''}`}
              onClick={() => setSelectedPlantId(plant.plantId)}
            >
              <div className="plant-rail-item__topline">
                <strong>{plant.plantId}</strong>
                <span className={`status-pill ${plant.status === 'online' ? 'status-pill--online' : plant.status === 'degraded' ? 'status-pill--warning' : 'status-pill--neutral'}`}>
                  {plant.status}
                </span>
              </div>
              <div className="plant-rail-item__meta">
                <span>{plant.sceneCount} scenes</span>
                <span>{plant.activeSimulations} live</span>
              </div>
            </button>
          ))}
        </aside>

        <main className="dashboard-surface">
          <section className="summary-grid">
            <div className="summary-card">
              <span className="summary-card__label">Plants</span>
              <strong>{overview.summary.plantCount}</strong>
            </div>
            <div className="summary-card">
              <span className="summary-card__label">Online</span>
              <strong>{overview.summary.onlinePlantCount}</strong>
            </div>
            <div className="summary-card">
              <span className="summary-card__label">Simulations</span>
              <strong>{overview.summary.totalActiveSimulations}</strong>
            </div>
            <div className="summary-card">
              <span className="summary-card__label">Eval runs</span>
              <strong>{overview.summary.totalEvaluationCount}</strong>
            </div>
          </section>

          <section className="detail-panel">
            <div className="detail-panel__header">
              <div>
                <div className="eyebrow">Selected plant</div>
                <h2>{selectedPlant.plantId}</h2>
              </div>
              <div className="inline-actions">
                <button className="ghost-btn">Refresh</button>
                <button className="primary-btn">Open plant</button>
              </div>
            </div>

            <div className="detail-panel__body">
              <div className="card card--wide">
                <div className="card__header">
                  <h3>Recent activity</h3>
                </div>
                <ul className="timeline-list">
                  {(selectedPlant.recentLifecycle ?? []).slice(0, 5).map((event: any, index: number) => (
                    <li key={`${event.sceneId ?? 'scene'}-${index}`}>
                      <span className="timeline-dot" />
                      <div className="timeline-copy">
                        <strong>{event.sceneId ?? 'Scene'}</strong>
                        <span>{event.eventType ?? 'Runtime update'}</span>
                      </div>
                      <time>{event.timestamp ?? 'now'}</time>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <div className="card__header">
                  <h3>Quick actions</h3>
                </div>
                <div className="quick-actions">
                  <button className="action-btn">New scene</button>
                  <button className="action-btn">Run evaluation</button>
                  <button className="action-btn">Open training</button>
                </div>
              </div>
            </div>
          </section>

          <section className="scene-strip">
            <div className="section-header">
              <h3>Scenes</h3>
              <button className="ghost-btn">Manage</button>
            </div>

            <div className="scene-grid">
              {sceneCards.map((scene) => (
                <article key={scene.id} className="scene-card">
                  <div className="scene-card__topline">
                    <strong>{scene.name}</strong>
                    <span className={`status-pill ${scene.status === 'online' ? 'status-pill--online' : 'status-pill--neutral'}`}>
                      {scene.status}
                    </span>
                  </div>

                  <div className="scene-card__meta">
                    <span>{scene.sims} active sims</span>
                    <span>{scene.evalPass ? 'Pass' : 'Watch'}</span>
                  </div>

                  <div className="scene-card__score">
                    <strong>{scene.evalScore}</strong>
                    <span>score</span>
                  </div>

                  <div className="scene-card__actions">
                    <button className="mini-btn">Open</button>
                    <button className="mini-btn mini-btn--ghost" onClick={() => handleOpenEdit(scene.sceneId)}>Edit</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>

      {editingScene && (
        <SceneEditDrawer
          initial={editingScene}
          onSave={(next) => handleSaveEdit(next)}
          onClose={() => setEditingScene(null)}
        />
      )}
    </div>
  );
}
