export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface SkinDecor {
  emoji: string;
  x: number;
  y: number;
}

export interface Skin {
  id: string;
  name: string;
  icon: string;        // 列表里的小图标
  cost: number;        // 0 = 默认拥有
  bg: RGB;             // 背景底色（避免 core 层依赖 cc）
  decor: SkinDecor[];  // 摆放在餐厅里的装饰
}

export const SKINS: Skin[] = [
  {
    id: 'classic', name: '暖柒初开', icon: '🍳', cost: 0,
    bg: { r: 255, g: 248, b: 240 },
    decor: [{ emoji: '🪴', x: 0, y: -70 }],
  },
  {
    id: 'garden', name: '小院清风', icon: '🌿', cost: 200,
    bg: { r: 238, g: 248, b: 232 },
    decor: [
      { emoji: '🪴', x: -260, y: -40 },
      { emoji: '🌸', x: 260, y: -40 },
      { emoji: '🍃', x: 0, y: -80 },
    ],
  },
  {
    id: 'retro', name: '复古档口', icon: '📻', cost: 400,
    bg: { r: 252, g: 242, b: 228 },
    decor: [
      { emoji: '📻', x: 0, y: -60 },
      { emoji: '🍭', x: -300, y: -40 },
      { emoji: '🎞', x: 300, y: -40 },
    ],
  },
  {
    id: 'ocean', name: '海边小馆', icon: '🐚', cost: 600,
    bg: { r: 230, g: 244, b: 250 },
    decor: [
      { emoji: '🐚', x: -260, y: -40 },
      { emoji: '⛱', x: 260, y: -40 },
      { emoji: '🌊', x: 0, y: -80 },
    ],
  },
  {
    id: 'festival', name: '节日暖光', icon: '🏮', cost: 800,
    bg: { r: 252, g: 236, b: 242 },
    decor: [
      { emoji: '🏮', x: -300, y: -40 },
      { emoji: '🎏', x: 300, y: -40 },
      { emoji: '✨', x: 0, y: -90 },
    ],
  },
];

export function skinById(id: string): Skin {
  return SKINS.find(s => s.id === id) ?? SKINS[0];
}
