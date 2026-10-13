import React from 'react';

export function FinalIndustrialLayoutGuide() {
  return (
    <div className="final-layout-guide">
      <div className="final-layout-guide__topbar">
        <div className="brand-mark">IDT</div>
        <div className="status-cluster">
          <span className="status-pill online">Online</span>
          <span className="status-pill degraded">2 degraded</span>
        </div>
      </div>

      <div className="final-layout-guide__body">
        <aside className="rail">
          <div className="rail-item selected">Plant A</div>
          <div className="rail-item">Plant B</div>
          <div className="rail-item">Training</div>
        </aside>

        <main className="surface-area">
          <div className="summary-grid">
            <div className="summary-box"><strong>12</strong><span>Scenes</span></div>
            <div className="summary-box"><strong>8</strong><span>Online</span></div>
            <div className="summary-box"><strong>62</strong><span>Active sims</span></div>
            <div className="summary-box"><strong>14</strong><span>Runs</span></div>
          </div>

          <div className="detail-panel-grid">
            <section className="panel panel--wide">
              <h4>Recent activity</h4>
              <ul>
                <li>Compressor Hall B · evaluation complete</li>
                <li>Boiler Room 1 · sim cycle refreshed</li>
                <li>Scene 3 · tags updated</li>
              </ul>
            </section>
            <section className="panel">
              <h4>Quick actions</h4>
              <button className="action">Open scene</button>
              <button className="action">Run evaluation</button>
              <button className="action">Edit tags</button>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default FinalIndustrialLayoutGuide;
