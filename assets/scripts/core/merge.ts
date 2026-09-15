export interface MergeItem {
  id: string;
  name: string;
  glyph?: string;
  artKey?: string;
  tier: number;
  nextId: string | null;
  unlocksDishId?: string;
  sell?: number;  // 最高阶成品可直接出售回收金币（外卖/熟客收购）
  cost?: number;  // 基础素材的购入价格（合成台商店）
}

/** 合成所需秒数：tier 越高越慢，模拟"烹饪等待" */
export function mergeTimeFor(id: string): number {
  const it = BY_ID[id];
  if (!it || !it.nextId) return 0;
  // 基础→中间：5秒；中间→成品：15秒
  if (it.tier === 0) return 5;
  if (it.tier === 1) return 15;
  return 10;
}

/** 加速费：每剩余秒 2 金币，最低 1 */
export function rushCost(remainSec: number): number {
  return Math.max(1, Math.ceil(remainSec * 2));
}

/** 合成中的格子状态：记录产出 id + 完成时间戳 */
export interface MergeSlotPending {
  resultId: string;
  finishAt: number;  // Date.now() 时间戳
}

/** 合成台格子：空闲(null) | 已就绪(id 字符串) | 合成中(对象) */
export type MergeSlot = string | MergeSlotPending | null;

/** 判断某格是否合成中 */
export function isPending(slot: MergeSlot): slot is MergeSlotPending {
  return slot !== null && typeof slot === 'object';
}

/** 判断某格是否就绪（非 null 非 pending） */
export function isReady(slot: MergeSlot): slot is string {
  return slot !== null && typeof slot === 'string';
}

export const MERGE_ITEMS: MergeItem[] = [
  // 链 A → pizza（ing-* 为程序占位图，正式素材按 docs/ai-art-prompts.md 重出）
  { id: 'm-veg',    name: '蔬菜',   glyph: '🥬', artKey: 'ing-veg', tier: 0, nextId: 'm-salad', cost: 12 },
  { id: 'm-salad',  name: '沙拉',   glyph: '🥗', artKey: 'ing-salad', tier: 1, nextId: 'm-pizza' },
  { id: 'm-pizza',  name: '披萨',   glyph: '🍕', artKey: 'dish-pizza', tier: 2, nextId: null, unlocksDishId: 'pizza', sell: 36 },
  // 链 B → steak
  { id: 'm-meat',   name: '生肉',   glyph: '🥩', artKey: 'ing-meat', tier: 0, nextId: 'm-stew', cost: 16 },
  { id: 'm-stew',   name: '炖肉',   glyph: '🍲', artKey: 'ing-stew', tier: 1, nextId: 'm-steak' },
  { id: 'm-steak',  name: '牛排',   glyph: '🥩', artKey: 'dish-steak', tier: 2, nextId: null, unlocksDishId: 'steak', sell: 46 },
  // 链 C → dessert
  { id: 'm-dough',  name: '面团',   glyph: '🍞', artKey: 'ing-dough', tier: 0, nextId: 'm-cake', cost: 14 },
  { id: 'm-cake',   name: '蛋糕胚', glyph: '🍰', artKey: 'ing-cake', tier: 1, nextId: 'm-dessert' },
  { id: 'm-dessert',name: '甜品',   glyph: '🍰', artKey: 'dish-dessert', tier: 2, nextId: null, unlocksDishId: 'dessert', sell: 42 },
  // 链 D → pasta
  { id: 'm-cheese', name: '奶酪',   glyph: '🧀', artKey: 'ing-cheese', tier: 0, nextId: 'm-pastadough', cost: 18 },
  { id: 'm-pastadough', name: '面坯', glyph: '🥟', artKey: 'ing-pasta-dough', tier: 1, nextId: 'm-pasta' },
  { id: 'm-pasta',  name: '意面',   glyph: '🍝', artKey: 'dish-pasta', tier: 2, nextId: null, unlocksDishId: 'pasta', sell: 50 },
];

export const MERGE_BASE_IDS: string[] = ['m-veg', 'm-meat', 'm-dough', 'm-cheese'];

const BY_ID: Record<string, MergeItem> = {};
for (const it of MERGE_ITEMS) BY_ID[it.id] = it;

export function mergeItemById(id: string): MergeItem | undefined {
  return BY_ID[id];
}

export function mergeNext(id: string): string | null {
  const it = BY_ID[id];
  return it ? it.nextId : null;
}

/** 按菜品 id 找到它的研发链（基础 → 中间 → 最终）；找不到返回空数组 */
export function chainFor(dishId: string): MergeItem[] {
  for (const base of MERGE_BASE_IDS) {
    const chain: MergeItem[] = [];
    let cur: string | null = base;
    while (cur) {
      const it = BY_ID[cur];
      if (!it) break;
      chain.push(it);
      if (it.unlocksDishId === dishId) return chain;
      cur = it.nextId;
    }
  }
  return [];
}
