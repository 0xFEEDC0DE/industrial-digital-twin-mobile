import React, { useEffect, useState } from 'react';

export type PlantStatus = 'online' | 'degraded' | 'offline';

export type SceneRuntime = {
  sceneId: string;
  status: 'online' | 'offline' | 'unknown';
  activeSimulations: number;
  evaluations: Array<{ score: number; passed: boolean; completedAt: string }>;
  tags: Array<Record<string, any>>;
  lifecycle: Array<{ eventType?: string; timestamp?: string; source?: string }>;
};

export type PlantRuntime = {
  plantId: string;
  status: PlantStatus;
  sceneCount: number;
  onlineScenes: number;
  activeSimulations: number;
  evaluationCount: number;
  tags: number;
  recentLifecycle: Array<{ sceneId: string; eventType?: string; timestamp?: string; source?: string }>;
  scenes: SceneRuntime[];
};

export function PlantDetail({ plant }: { plant: PlantRuntime }) {
  const [selectedScene, setSelectedScene] = useState<SceneRuntime | null>(plant.scenes[0] ?? null);

  useEffect(() => {
    setSelectedScene(plant.scenes[0] ?? null);
  }, [plant]);

  return (
    <div className="plant-detail-shell">
      <section className="scene-list-panel">
        <div className="panel-header">
          <h3>Scenes</h3>
          <button className="small-btn small-btn--primary">New scenario</button>
        </div>

        <div className="scene-list">
          {plant.scenes.map((scene) => (
            <button
              key={scene.sceneId}
              className={`scene-row ${selectedScene?.sceneId === scene.sceneId ? 'selected' : ''}`}
              onClick={() => setSelectedScene(scene)}
            >
              <div className="scene-row__name-wrap">
                <strong>{scene.sceneId}</strong>
                <span className={`status-pill status-pill--${scene.status === 'online' ? 'online' : scene.status === 'offline' ? 'offline' : 'degraded'}`}>
                  {scene.status}
                </span>
              </div>
              <div className="scene-row__meta">
                <span>{scene.activeSimulations} sim(s)</span>
                <span>{scene.evaluations.length} evals</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="scene-detail-panel">
        {selectedScene ? (
          <>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Scene</p>
                <h3>{selectedScene.sceneId}</h3>
              </div>
              <div className="action-row">
                <button className="small-btn">Edit</button>
                <button className="small-btn small-btn--primary">Run</button>
              </div>
            </div>

            <div className="detail-stack">
              <div className="detail-surface">
                <div className="detail-surface__header">Summary</div>
                <div className="detail-grid two-up">
                  <div>
                    <span className="metric-label">Status</span>
                    <strong>{selectedScene.status}</strong>
                  </div>
                  <div>
                    <span className="metric-label">Simulations</span>
                    <strong>{selectedScene.activeSimulations}</strong>
                  </div>
                </div>
              </div>

              <div className="detail-surface">
                <div className="detail-surface__header">Latest evaluation</div>
                {selectedScene.evaluations.length ? (
                  <div className="evaluation-block">
                    <div className="score-row">
                      <strong>{selectedScene.evaluations[0].score}</strong>
                      <span className={`status-pill status-pill--${selectedScene.evaluations[0].passed ? 'online' : 'offline'}`}>
                        {selectedScene.evaluations[0].passed ? 'Pass' : 'Fail'}
                      </span>
                    </div>
                    <div className="muted">{selectedScene.evaluations[0].completedAt}</div>
                  </div>
                ) : (
                  <div className="muted">No evaluations</div>
                )}
              </div>

              <div className="detail-surface">
                <div className="detail-surface__header">Lifecycle</div>
                <ul className="timeline-list compact">
                  {selectedScene.lifecycle.slice(0, 6).map((event, index) => (
                    <li key={`${event.eventType}-${event.timestamp ?? index}`}>
                      <span className="dot" />
                      <div>
                        <strong>{event.eventType ?? 'event'}</strong>
                        <div className="muted">{event.source ?? 'system'}</div>
                      </div>
                      <time>{event.timestamp ?? 'now'}</time>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">No scene selected</div>
        )}
      </section>
    </div>
  );
}

export default PlantDetail;
