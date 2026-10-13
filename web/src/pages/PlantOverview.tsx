:root {
  --bg: #eff3f5;
  --bg-strong: #dfe6ea;
  --surface: rgba(255, 255, 255, 0.9);
  --surface-strong: #ffffff;
  --panel: #f7fafb;
  --panel-border: rgba(20, 35, 45, 0.08);
  --text: #16212a;
  --muted: #5d6f7b;
  --muted-alt: #7c8d9c;
  --accent: #1c7d7a;
  --accent-soft: rgba(28, 125, 122, 0.12);
  --success: #2a9d66;
  --warning: #d68d2e;
  --neutral: #6b7b88;
  --shadow: 0 10px 24px rgba(20, 31, 41, 0.08);
  --radius-xl: 24px;
  --radius-lg: 18px;
  --radius-md: 14px;
  --radius-sm: 10px;
}

* {
  box-sizing: border-box;
}

html, body, #root {
  min-height: 100%;
  height: 100%;
}

body {
  margin: 0;
  font-family: Inter, 'Segoe UI', system-ui, -apple-system, sans-serif;
  background:
    radial-gradient(circle at top, rgba(28, 125, 122, 0.06), transparent 25%),
    var(--bg);
  color: var(--text);
}

button, input, textarea {
  font: inherit;
}

button {
  border: none;
  cursor: pointer;
}

.app-root {
  min-height: 100vh;
  padding: 24px;
}

.industrial-shell {
  max-width: 1440px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.42);
  border: 1px solid rgba(26, 40, 52, 0.06);
  border-radius: 28px;
  box-shadow: var(--shadow);
  overflow: hidden;
  backdrop-filter: blur(12px);
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--panel-border);
  background: rgba(255, 255, 255, 0.5);
}

.brand-block {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  font-weight: 700;
  background: linear-gradient(135deg, var(--accent), #7cc6be);
  color: white;
  letter-spacing: 0.08em;
}

.eyebrow {
  margin: 0 0 4px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted-alt);
}

.topbar h1 {
  margin: 0;
  font-size: clamp(1.3rem, 2vw, 2rem);
  font-weight: 700;
}

.status-cluster {
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.status-pill--online {
  background: rgba(42, 157, 102, 0.12);
  color: var(--success);
}

.status-pill--warning {
  background: rgba(214, 141, 46, 0.12);
  color: var(--warning);
}

.status-pill--neutral {
  background: rgba(107, 123, 136, 0.12);
  color: var(--neutral);
}

.layout-grid {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: 820px;
}

.plant-rail {
  padding: 22px 18px 20px;
  background: rgba(247, 250, 251, 0.8);
  border-right: 1px solid var(--panel-border);
}

.rail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.rail-header .eyebrow {
  margin: 0;
}

.plant-rail-item {
  width: 100%;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  padding: 14px 12px;
  margin-bottom: 10px;
  text-align: left;
  transition: all 120ms ease;
}

.plant-rail-item:hover,
.plant-rail-item.selected {
  background: rgba(255, 255, 255, 0.92);
  border-color: rgba(28, 125, 122, 0.2);
  box-shadow: 0 10px 24px rgba(20, 31, 41, 0.06);
}

.plant-rail-item__topline,
.plant-rail-item__meta,
.inline-actions,
.scene-card__topline,
.scene-card__meta,
.scene-card__actions,
.card__header,
.detail-panel__header,
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.plant-rail-item__meta {
  margin-top: 10px;
  color: var(--muted);
  font-size: 12px;
}

.dashboard-surface {
  padding: 24px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 14px;
}

.summary-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 116px;
  background: linear-gradient(180deg, rgba(255,255,255,0.8), rgba(255,255,255,0.98));
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-lg);
  padding: 18px 16px;
  box-shadow: 0 6px 18px rgba(17, 26, 34, 0.04);
}

.summary-card__label {
  font-size: 12px;
  color: var(--muted-alt);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.summary-card strong {
  font-size: clamp(1.8rem, 2.5vw, 2.2rem);
}

.detail-panel {
  margin-top: 24px;
  background: rgba(255,255,255,0.5);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-xl);
  padding: 18px;
}

.detail-panel__header {
  margin-bottom: 18px;
}

.detail-panel__header h2 {
  margin: 0;
  font-size: clamp(1.5rem, 2vw, 2rem);
}

.detail-panel__body {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) minmax(280px, 0.75fr);
  gap: 18px;
}

.card {
  background: var(--surface-strong);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-lg);
  padding: 18px;
}

.card--wide {
  min-height: 240px;
}

.card__header h3,
.section-header h3 {
  margin: 0;
  font-size: 1.05rem;
}

.timeline-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 12px;
}

.timeline-list li {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding-top: 6px;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 0 5px rgba(28, 125, 122, 0.12);
}

.timeline-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-copy span,
.scene-card__meta,
.scene-card__score span,
.mini-btn,
.ghost-btn,
.primary-btn,
.action-btn {
  color: var(--muted);
  font-size: 12px;
}

.timeline-list time {
  color: var(--muted-alt);
  font-size: 12px;
}

.quick-actions {
  display: grid;
  gap: 10px;
  margin-top: 18px;
}

.action-btn,
.primary-btn,
.ghost-btn,
.mini-btn {
  border-radius: 12px;
  transition: all 120ms ease;
}

.primary-btn,
.action-btn {
  background: linear-gradient(135deg, var(--accent), #4ca69f);
  color: white;
  padding: 10px 14px;
  font-weight: 600;
}

.ghost-btn,
.mini-btn {
  background: rgba(10, 21, 29, 0.03);
  color: var(--text);
  padding: 9px 12px;
}

.mini-btn--ghost {
  background: transparent;
  border: 1px solid var(--panel-border);
}

.scene-strip {
  margin-top: 26px;
  background: rgba(255,255,255,0.45);
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-xl);
  padding: 18px;
}

.section-header {
  margin-bottom: 16px;
}

.scene-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(180px, 1fr));
  gap: 16px;
}

.scene-card {
  background: linear-gradient(180deg, rgba(255,255,255,0.94), rgba(247,250,251,0.96));
  border: 1px solid var(--panel-border);
  border-radius: var(--radius-lg);
  padding: 16px;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 8px 18px rgba(18, 22, 28, 0.04);
}

.scene-card__score {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
}

.scene-card__score strong {
  font-size: 2rem;
  line-height: 1;
}

.scene-card__actions {
  margin-top: auto;
}

.status-panel {
  display: grid;
  place-items: center;
  min-height: 280px;
  background: rgba(255,255,255,0.8);
  border: 1px solid var(--panel-border);
  border-radius: 22px;
  color: var(--muted);
}

.status-panel--loading {
  color: var(--text);
}

.status-panel--error {
  color: #9a2d2d;
}

@media (max-width: 900px) {
  .layout-grid {
    grid-template-columns: 1fr;
  }

  .plant-rail {
    border-right: none;
    border-bottom: 1px solid var(--panel-border);
  }

  .summary-grid,
  .scene-grid {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }

  .detail-panel__body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 620px) {
  .app-root {
    padding: 12px;
  }

  .topbar,
  .dashboard-surface,
  .plant-rail {
    padding-left: 14px;
    padding-right: 14px;
  }

  .summary-grid,
  .scene-grid {
    grid-template-columns: 1fr;
  }

  .status-cluster,
  .detail-panel__header,
  .inline-actions,
  .scene-card__topline,
  .scene-card__actions,
  .section-header,
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}

