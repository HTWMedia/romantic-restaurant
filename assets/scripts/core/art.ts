export type ArtCategory = 'bg' | 'panel' | 'customer' | 'character' | 'dish' | 'icon' | 'decor';

export interface ArtEntry {
  key: string;
  category: ArtCategory;
  w: number; // UI 显示尺寸（宽），占位图与对位参考
  h: number; // UI 显示尺寸（高）
}

// 全量美术清单：key = PNG 文件名（不放 .png），resources 路径 art/<key>
export const ART_MANIFEST: ArtEntry[] = [
  { key: 'bg',              category: 'bg',        w: 960, h: 640 },

  // 顾客 6 形象
  { key: 'cust-1',          category: 'customer',  w: 160, h: 220 },
  { key: 'cust-2',          category: 'customer',  w: 160, h: 220 },
  { key: 'cust-3',          category: 'customer',  w: 160, h: 220 },
  { key: 'cust-4',          category: 'customer',  w: 160, h: 220 },
  { key: 'cust-5',          category: 'customer',  w: 160, h: 220 },
  { key: 'cust-6',          category: 'customer',  w: 160, h: 220 },

  // 角色头像 + 旁白
  { key: 'char-xiaoqi',     category: 'character', w: 150, h: 150 },
  { key: 'char-tangtang',   category: 'character', w: 150, h: 150 },
  { key: 'char-laozhou',    category: 'character', w: 150, h: 150 },
  { key: 'char-ashen',      category: 'character', w: 150, h: 150 },
  { key: 'char-xiaoqi-idle',   category: 'character', w: 150, h: 150 },
  { key: 'char-xiaoqi-say',    category: 'character', w: 150, h: 150 },
  { key: 'char-xiaoqi-happy',  category: 'character', w: 150, h: 150 },
  { key: 'icon-narrator',   category: 'character', w: 150, h: 150 },

  // 5 张面板（9-slice）
  { key: 'panel-hud',       category: 'panel',     w: 960, h: 64 },
  { key: 'panel-orderboard',category: 'panel',     w: 920, h: 46 },
  { key: 'panel-menu',      category: 'panel',     w: 920, h: 110 },
  { key: 'panel-dialogue',  category: 'panel',     w: 760, h: 200 },
  { key: 'panel-popup',     category: 'panel',     w: 560, h: 520 },

  // 6 道菜
  { key: 'dish-fries',      category: 'dish',      w: 96,  h: 96 },
  { key: 'dish-burger',     category: 'dish',      w: 96,  h: 96 },
  { key: 'dish-pizza',      category: 'dish',      w: 96,  h: 96 },
  { key: 'dish-pasta',      category: 'dish',      w: 96,  h: 96 },
  { key: 'dish-steak',      category: 'dish',      w: 96,  h: 96 },
  { key: 'dish-dessert',    category: 'dish',      w: 96,  h: 96 },

  // 合成链中间项（tools/make_merge_art.py 生成的程序占位图，可按 docs/ai-art-prompts.md 重出）
  { key: 'ing-veg',         category: 'dish',      w: 72,  h: 72 },
  { key: 'ing-salad',       category: 'dish',      w: 72,  h: 72 },
  { key: 'ing-meat',        category: 'dish',      w: 72,  h: 72 },
  { key: 'ing-stew',        category: 'dish',      w: 72,  h: 72 },
  { key: 'ing-dough',       category: 'dish',      w: 72,  h: 72 },
  { key: 'ing-cake',        category: 'dish',      w: 72,  h: 72 },
  { key: 'ing-cheese',      category: 'dish',      w: 72,  h: 72 },
  { key: 'ing-pasta-dough', category: 'dish',      w: 72,  h: 72 },

  // P1 小图标（仅列实际有消费点的）
  { key: 'icon-coin',       category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-energy',     category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-customer',   category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-chapter',    category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-lock',       category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-replay',     category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-ad',         category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-brush',      category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-chair',      category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-kitchen',    category: 'icon',      w: 32,  h: 32 },

  // P2 皮肤装饰道具
  { key: 'decor-classic-1', category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-garden-1',  category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-garden-2',  category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-garden-3',  category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-retro-1',   category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-retro-2',   category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-retro-3',   category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-ocean-1',   category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-ocean-2',   category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-ocean-3',   category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-festival-1',category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-festival-2',category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-festival-3',category: 'decor',     w: 88,  h: 88 },

  // 皮肤列表小图标
  { key: 'skin-classic',    category: 'icon',      w: 40,  h: 40 },
  { key: 'skin-garden',     category: 'icon',      w: 40,  h: 40 },
  { key: 'skin-retro',      category: 'icon',      w: 40,  h: 40 },
  { key: 'skin-ocean',      category: 'icon',      w: 40,  h: 40 },
  { key: 'skin-festival',   category: 'icon',      w: 40,  h: 40 },
];

export function entry(key: string): ArtEntry | undefined {
  return ART_MANIFEST.find(e => e.key === key);
}

export const CUSTOMER_ART: string[] = ['cust-1', 'cust-2', 'cust-3', 'cust-4', 'cust-5', 'cust-6'];

// —— 已加载 key 注册表（cc-free，vitest 可测；ArtView.preload 完成后填充）——
const loadedKeys: string[] = [];

export function markLoaded(key: string): void {
  if (loadedKeys.indexOf(key) < 0) loadedKeys.push(key);
}

export function hasArt(key: string): boolean {
  return loadedKeys.indexOf(key) >= 0;
}