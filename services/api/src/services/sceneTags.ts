export type AssetTagType = 'equipment' | 'hazard' | 'route' | 'safety' | 'annotation';

export interface SceneAssetTag {
  id: string;
  label: string;
  type: AssetTagType;
  x: number;
  y: number;
  z: number;
}

export function createSceneAssetTag(input: {
  label: string;
  type: AssetTagType;
  position: [number, number, number];
}): SceneAssetTag {
  return {
    id: `tag_${Date.now()}`,
    label: input.label,
    type: input.type,
    x: input.position[0],
    y: input.position[1],
    z: input.position[2],
  };
}
