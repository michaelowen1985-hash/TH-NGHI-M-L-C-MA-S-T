export type MaterialType = 'wood' | 'concrete' | 'marble' | 'rubber';

export interface MaterialData {
  id: MaterialType;
  name: string;
  coefficient: number; // Theoretical coefficient of friction
  color: string;
  texturePattern: string;
}

export interface ExperimentRecord {
  id: number;
  mass: number;
  materialName: string;
  weightP: number | string; // Measured Weight
  frictionF: number | string; // Measured Friction
  isWet: boolean; // Surface condition
  orientation: 'wide' | 'narrow'; // Contact area (Wide = Large area, Narrow = Small area)
}

export enum ExperimentMode {
  WEIGHING = 'WEIGHING',
  PULLING = 'PULLING',
}

// shelf: start, weighing: scale 1, pulling: scale 2
export type BlockPlacement = 'shelf' | 'weighing_station' | 'sliding_station';