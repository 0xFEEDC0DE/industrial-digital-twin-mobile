import React, { useState } from 'react';

export type SceneEditState = {
  sceneId: string;
  name: string;
  description: string;
  tags: string[];
};

export function SceneEditDrawer({
  initial,
  onSave,
  onClose,
}: {
  initial: SceneEditState;
  onSave: (next: SceneEditState) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<SceneEditState>(initial);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer__header">
          <h3>Edit scene</h3>
          <button className="small-btn" onClick={onClose}>Close</button>
        </div>

        <div className="drawer__body">
          <label>
            <span>Name</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label>
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
            />
          </label>

          <label>
            <span>Tags</span>
            <input
              value={form.tags.join(', ')}
              onChange={(e) => setForm({ ...form, tags: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })}
            />
          </label>
        </div>

        <div className="drawer__footer">
          <button className="small-btn" onClick={onClose}>Cancel</button>
          <button
            className="small-btn small-btn--primary"
            onClick={() => {
              onSave(form);
              onClose();
            }}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default SceneEditDrawer;
