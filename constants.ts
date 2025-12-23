import { MaterialData } from './types';

export const GRAVITY = 9.81; // m/s^2

export const SCALE_MAX_LOAD = 100; // Newtons (Updated from 10 to 100)
export const SCALE_DIVISION = 0.5; // Newtons

export const MATERIALS: Record<string, MaterialData> = {
  wood: {
    id: 'wood',
    name: 'Gỗ',
    coefficient: 0.35,
    color: '#eab308', // Yellow-600 ish
    texturePattern: 'repeating-linear-gradient(45deg, #ca8a04 0, #ca8a04 1px, #eab308 0, #eab308 50%)'
  },
  concrete: {
    id: 'concrete',
    name: 'Bê tông',
    coefficient: 0.6,
    color: '#94a3b8', // Slate-400
    texturePattern: 'radial-gradient(#64748b 15%, transparent 16%) 0 0, radial-gradient(#64748b 15%, transparent 16%) 8px 8px'
  },
  marble: {
    id: 'marble',
    name: 'Đá hoa',
    coefficient: 0.15,
    color: '#cffafe', // Cyan-100
    texturePattern: 'linear-gradient(135deg, #a5f3fc 25%, transparent 25%) -50px 0, linear-gradient(225deg, #a5f3fc 25%, transparent 25%) -50px 0'
  },
  rubber: {
    id: 'rubber',
    name: 'Cao su',
    coefficient: 0.85,
    color: '#1e293b', // Slate-800
    texturePattern: 'repeating-radial-gradient(circle, #334155, #334155 10px, #1e293b 10px, #1e293b 20px)'
  }
};
