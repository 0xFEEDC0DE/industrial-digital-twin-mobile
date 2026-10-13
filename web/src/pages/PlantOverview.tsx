import React, { useEffect, useState } from 'react'
import { fetchOverview } from '../api/dashboard'
import { subscribeRuntimeEvents } from '../api/sse'
import SceneCard from '../components/SceneCard'

export default function PlantOverview() {
  const [overview, setOverview] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchOverview()
      .then((d) => {
        if (!cancelled) setOverview(d)
      })
      .catch((err) => setError(String(err)))
      .finally(() => !cancelled && setLoading(false))

    const unsub = subscribeRuntimeEvents((evt) => {
      try {
        const data = JSON.parse(evt.data)
        // For simplicity, when runtime events arrive we refetch overview.
        fetchOverview().then((d) => setOverview(d))
      } catch (e) {
        // ignore
      }
    }, (err) => {
      // SSE not available or errored — we keep using polling/fetch
      console.warn('SSE error', err)
    })

    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  if (loading) return <div className="center">Loading overview…</div>
  if (error) return <div className="center error">Error: {error}</div>
  if (!overview) return <div className="center">No plants</div>

  return (
    <section className="plant-overview">
      <div className="plant-summary-row">
        <div className="summary-card">
          <div className="summary-title">Plants</div>
          <div className="summary-value">{overview.summary.plantCount}</div>
        </div>
        <div className="summary-card">
          <div className="summary-title">Online</div>
          <div className="summary-value">{overview.summary.onlinePlantCount}</div>
        </div>
        <div className="summary-card">
          <div className="summary-title">Active simulations</div>
          <div className="summary-value">{overview.summary.totalActiveSimulations}</div>
        </div>
        <div className="summary-card">
          <div className="summary-title">Evaluations</div>
          <div className="summary-value">{overview.summary.totalEvaluationCount}</div>
        </div>
      </div>

      <div className="plants-list">
        {overview.plants.map((p: any) => (
          <div key={p.plantId} className="plant-card">
            <header className="plant-card__header">
              <h2>{p.plantId}</h2>
              <span className={`badge badge--${p.status === 'online' ? 'green' : 'orange'}`}>{p.status}</span>
            </header>

            <div className="plant-card__body">
              <div className="muted">Scenes: {p.sceneCount} · Online: {p.onlineScenes}</div>
              <div className="muted">Active sims: {p.activeSimulations} · Evaluations: {p.evaluationCount}</div>

              <div className="scenes-grid">
                {p.recentLifecycle && p.recentLifecycle.length > 0 && (
                  <div className="lifecycle-list">
                    <strong>Recent activity</strong>
                    <ul>
                      {p.recentLifecycle.slice().reverse().map((l: any, idx: number) => (
                        <li key={idx}>{l.sceneId}: {l.eventType} <span className="muted">{new Date(l.timestamp).toLocaleTimeString()}</span></li>
                      ))}
                    </ul>
                  </div>
                )}

                {p.sceneCount > 0 && (
                  <div className="scene-cards">
                    {p.sceneCount > 0 && p.sceneIds && p.sceneIds.length > 0 ? (
                      p.sceneIds.map((sid: string) => {
                        // try pulling scene details from the overview's scenes if available
                        const sceneSummary = null
                        const state = null
                        return (
                          <SceneCard key={sid} sceneId={sid} status={"unknown"} activeSimulations={0} />
                        )
                      })
                    ) : (
                      <div className="muted">No scenes</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <footer className="plant-card__footer">
              <button className="btn">Open plant</button>
            </footer>
          </div>
        ))}
      </div>
    </section>
  )
}
