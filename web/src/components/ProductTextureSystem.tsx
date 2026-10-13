import React from 'react';

export function ProductTextureSystem() {
  return (
    <div className="design-system-preview">
      <div className="design-system-preview__block">
        <div className="swatch swatch--surface" />
        <div className="swatch swatch--panel" />
        <div className="swatch swatch--accent" />
        <div className="swatch swatch--alert" />
      </div>

      <div className="design-system-preview__block design-system-preview__text">
        <h4>Industrial UI tone</h4>
        <p>Clean surfaces, compact spacing, strong information hierarchy, neutral industrial palette.</p>
      </div>
    </div>
  );
}

export default ProductTextureSystem;
