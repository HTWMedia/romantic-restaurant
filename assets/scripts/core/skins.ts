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

export interface SkinBonus {
  wait: number;  // 顾客耐心档位：等待时间 +档位×10%
  coin: number;  // 收入档位：每单收入 +档位×10%
  cook: number;  // 烹饪档位：烹饪耗时 -档位×10%
}

export interface Skin {
  id: string;
  name: string;
  icon: string;        // 列表里的小图标（回退用）
  iconArtKey: string;  // 列表小图标的美术 key
  cost: number;        // 0 = 默认拥有
  bg: RGB;             // 背景底色（避免 core 层依赖 cc）
  decor: SkinDecor[];  // 摆放在餐厅里的装饰
  bonus: SkinBonus;    // 装修带来的经营加成
}

export const SKINS: Skin[] = [
  {
    id: 'classic', name: '暖柒初开', icon: '🍳', iconArtKey: 'skin-classic', cost: 0,
    bg: { r: 255, g: 248, b: 240 },
    decor: [{ emoji: '🪴', artKey: 'decor-classic-1', x: -120, y: 92 }],
    bonus: { wait: 0, coin: 0, cook: 0 },
  },
  {
    id: 'garden', name: '小院清风', icon: '🌿', iconArtKey: 'skin-garden', cost: 200,
    bg: { r: 238, g: 248, b: 232 },
    bonus: { wait: 2, coin: 0, cook: 0 },
    decor: [
      { emoji: '🪴', artKey: 'decor-garden-1', x: -235, y: 84 },
      { emoji: '🌸', artKey: 'decor-garden-2', x: 10, y: 84 },
      { emoji: '🍃', artKey: 'decor-garden-3', x: -120, y: 98 },
    ],
  },
  {
    id: 'retro', name: '复古档口', icon: '📻', iconArtKey: 'skin-retro', cost: 400,
    bg: { r: 252, g: 242, b: 228 },
    bonus: { wait: 0, coin: 2, cook: 0 },
    decor: [
      { emoji: '📻', artKey: 'decor-retro-1', x: -120, y: 98 },
      { emoji: '🍭', artKey: 'decor-retro-2', x: -235, y: 84 },
      { emoji: '🎞', artKey: 'decor-retro-3', x: 10, y: 84 },
    ],
  },
  {
    id: 'ocean', name: '海边小馆', icon: '🐚', iconArtKey: 'skin-ocean', cost: 600,
    bg: { r: 230, g: 244, b: 250 },
    bonus: { wait: 0, coin: 0, cook: 2 },
    decor: [
      { emoji: '🐚', artKey: 'decor-ocean-1', x: -235, y: 84 },
      { emoji: '⛱', artKey: 'decor-ocean-2', x: 10, y: 84 },
      { emoji: '🌊', artKey: 'decor-ocean-3', x: -120, y: 98 },
    ],
  },
  {
    id: 'festival', name: '节日暖光', icon: '🏮', iconArtKey: 'skin-festival', cost: 800,
    bg: { r: 252, g: 236, b: 242 },
    bonus: { wait: 1, coin: 1, cook: 1 },
    decor: [
      { emoji: '🏮', artKey: 'decor-festival-1', x: -235, y: 84 },
      { emoji: '🎏', artKey: 'decor-festival-2', x: 10, y: 84 },
      { emoji: '✨', artKey: 'decor-festival-3', x: -120, y: 98 },
    ],
  },
];

export function skinById(id: string): Skin {
  return SKINS.find(s => s.id === id) ?? SKINS[0];
}
