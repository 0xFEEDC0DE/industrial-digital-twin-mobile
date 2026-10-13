import React from 'react'

type Props = {
  sceneId: string
  status: 'online' | 'offline' | 'unknown'
  activeSimulations: number
  latestEvaluation?: { score: number; passed: boolean; completedAt: string } | null
  onEdit?: (sceneId: string) => void
  onOpen?: (sceneId: string) => void
}

export const SceneCard: React.FC<Props> = ({ sceneId, status, activeSimulations, latestEvaluation, onEdit, onOpen }) => {
  const statusColor = status === 'online' ? 'green' : status === 'offline' ? 'gray' : 'orange'

  return (
    <article className="scene-card" role="article" aria-labelledby={`scene-${sceneId}-title`}>
      <header className="scene-card__header">
        <h3 id={`scene-${sceneId}-title`}>{sceneId}</h3>
        <span className={`badge badge--${statusColor}`}>{status}</span>
      </header>

      <div className="scene-card__body">
        <div className="muted">Active sims: {activeSimulations}</div>
        {latestEvaluation ? (
          <div className="evaluation">
            <strong className="eval-score">{latestEvaluation.score}</strong>
            <span className={`eval-badge ${latestEvaluation.passed ? 'pass' : 'fail'}`}>
              {latestEvaluation.passed ? 'PASS' : 'FAIL'}
            </span>
          </div>
        ) : (
          <div className="muted">No evaluations</div>
        )}
      </div>

      <footer className="scene-card__actions">
        <button className="btn" onClick={() => onOpen?.(sceneId)} aria-label={`Open ${sceneId}`}>
          Open
        </button>
        <button className="btn btn--ghost" onClick={() => onEdit?.(sceneId)} aria-label={`Edit ${sceneId}`}>
          Edit
        </button>
      </footer>
    </article>
  )
}

export default SceneCard
