export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface SkinDecor {
  emoji: string;
  artKey: string;
  x: number;
  y: number;
}

export interface Skin {
  id: string;
  name: string;
  icon: string;        // 列表里的小图标（回退用）
  iconArtKey: string;  // 列表小图标的美术 key
  cost: number;        // 0 = 默认拥有
  bg: RGB;             // 背景底色（避免 core 层依赖 cc）
  decor: SkinDecor[];  // 摆放在餐厅里的装饰
}

export const SKINS: Skin[] = [
  {
    id: 'classic', name: '暖柒初开', icon: '🍳', iconArtKey: 'skin-classic', cost: 0,
    bg: { r: 255, g: 248, b: 240 },
    decor: [{ emoji: '🪴', artKey: 'decor-classic-1', x: 0, y: -70 }],
  },
  {
    id: 'garden', name: '小院清风', icon: '🌿', iconArtKey: 'skin-garden', cost: 200,
    bg: { r: 238, g: 248, b: 232 },
    decor: [
      { emoji: '🪴', artKey: 'decor-garden-1', x: -260, y: -40 },
      { emoji: '🌸', artKey: 'decor-garden-2', x: 260, y: -40 },
      { emoji: '🍃', artKey: 'decor-garden-3', x: 0, y: -80 },
    ],
  },
  {
    id: 'retro', name: '复古档口', icon: '📻', iconArtKey: 'skin-retro', cost: 400,
    bg: { r: 252, g: 242, b: 228 },
    decor: [
      { emoji: '📻', artKey: 'decor-retro-1', x: 0, y: -60 },
      { emoji: '🍭', artKey: 'decor-retro-2', x: -300, y: -40 },
      { emoji: '🎞', artKey: 'decor-retro-3', x: 300, y: -40 },
    ],
  },
  {
    id: 'ocean', name: '海边小馆', icon: '🐚', iconArtKey: 'skin-ocean', cost: 600,
    bg: { r: 230, g: 244, b: 250 },
    decor: [
      { emoji: '🐚', artKey: 'decor-ocean-1', x: -260, y: -40 },
      { emoji: '⛱', artKey: 'decor-ocean-2', x: 260, y: -40 },
      { emoji: '🌊', artKey: 'decor-ocean-3', x: 0, y: -80 },
    ],
  },
  {
    id: 'festival', name: '节日暖光', icon: '🏮', iconArtKey: 'skin-festival', cost: 800,
    bg: { r: 252, g: 236, b: 242 },
    decor: [
      { emoji: '🏮', artKey: 'decor-festival-1', x: -300, y: -40 },
      { emoji: '🎏', artKey: 'decor-festival-2', x: 300, y: -40 },
      { emoji: '✨', artKey: 'decor-festival-3', x: 0, y: -90 },
    ],
  },
];

export function skinById(id: string): Skin {
  return SKINS.find(s => s.id === id) ?? SKINS[0];
}
