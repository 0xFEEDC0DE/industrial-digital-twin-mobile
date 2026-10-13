import React, { useMemo, useState } from 'react';

export type PlantStatus = 'online' | 'degraded' | 'offline';

export type SceneSummary = {
  sceneId: string;
  status: 'online' | 'offline' | 'unknown';
  activeSimulations: number;
  evaluations: Array<{ score: number; passed: boolean; completedAt: string }>;
  tags: Array<Record<string, any>>;
  lifecycle: Array<{ eventType?: string; timestamp?: string; source?: string }>;
};

export type PlantSummary = {
  plantId: string;
  status: PlantStatus;
  sceneCount: number;
  onlineScenes: number;
  activeSimulations: number;
  evaluationCount: number;
  tags: number;
  recentLifecycle: Array<{ sceneId: string; eventType?: string; timestamp?: string; source?: string }>;
};

export type PlantOverviewData = {
  plants: PlantSummary[];
  summary: {
    plantCount: number;
    onlinePlantCount: number;
    totalActiveSimulations: number;
    totalEvaluationCount: number;
  };
};

export function PlantOverview({ data }: { data: PlantOverviewData }) {
  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(data.plants[0]?.plantId ?? null);

  const selectedPlant = useMemo(
    () => data.plants.find((plant) => plant.plantId === selectedPlantId) ?? data.plants[0],
    [data.plants, selectedPlantId]
  );

  return (
    <div className="plant-overview-shell">
      <aside className="plant-list-pane">
        <div className="pane-header">
          <span className="eyebrow">Plants</span>
          <button className="small-btn">+ Add</button>
        </div>

        {data.plants.map((plant) => (
          <button
            key={plant.plantId}
            className={`plant-selector ${selectedPlant?.plantId === plant.plantId ? 'selected' : ''}`}
            onClick={() => setSelectedPlantId(plant.plantId)}
          >
            <div className="plant-selector__title-row">
              <span>{plant.plantId}</span>
              <span className={`status-pill status-pill--${plant.status}`}>{plant.status}</span>
            </div>
            <div className="plant-selector__meta">
              <span>{plant.sceneCount} scenes</span>
              <span>{plant.onlineScenes} online</span>
            </div>
          </button>
        ))}
      </aside>

      <section className="plant-detail-pane">
        {selectedPlant && (
          <>
            <header className="detail-header">
              <div>
                <p className="eyebrow">Selected plant</p>
                <h2>{selectedPlant.plantId}</h2>
              </div>
              <div className="action-row">
                <button className="small-btn">Refresh</button>
                <button className="small-btn small-btn--primary">Open</button>
              </div>
            </header>

            <div className="metric-grid">
              <div className="metric-card">
                <span className="metric-label">Online scenes</span>
                <strong>{selectedPlant.onlineScenes}</strong>
              </div>
              <div className="metric-card">
                <span className="metric-label">Simulations</span>
                <strong>{selectedPlant.activeSimulations}</strong>
              </div>
              <div className="metric-card">
                <span className="metric-label">Evaluation count</span>
                <strong>{selectedPlant.evaluationCount}</strong>
              </div>
              <div className="metric-card">
                <span className="metric-label">Tags</span>
                <strong>{selectedPlant.tags}</strong>
              </div>
            </div>

            <div className="content-grid">
              <div className="panel">
                <div className="panel-header">
                  <h3>Recent activity</h3>
                </div>
                <ul className="timeline-list">
                  {selectedPlant.recentLifecycle.slice(0, 5).map((event, index) => (
                    <li key={`${event.sceneId}-${event.eventType}-${index}`}>
                      <span className="dot" />
                      <div>
                        <strong>{event.sceneId}</strong>
                        <div>{event.eventType}</div>
                      </div>
                      <time>{event.timestamp ?? 'now'}</time>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3>Quick actions</h3>
                </div>
                <div className="quick-actions">
                  <button className="action-btn">Create scene</button>
                  <button className="action-btn">Run evaluation</button>
                  <button className="action-btn">Open training</button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default PlantOverview;
