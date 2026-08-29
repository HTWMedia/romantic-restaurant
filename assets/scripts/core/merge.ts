export interface MergeItem {
  id: string;
  name: string;
  glyph?: string;
  artKey?: string;
  tier: number;
  nextId: string | null;
  unlocksDishId?: string;
}

export const MERGE_ITEMS: MergeItem[] = [
  // 链 A → pizza
  { id: 'm-veg',    name: '蔬菜',   glyph: '🥬', tier: 0, nextId: 'm-salad' },
  { id: 'm-salad',  name: '沙拉',   glyph: '🥗', tier: 1, nextId: 'm-pizza' },
  { id: 'm-pizza',  name: '披萨',   artKey: 'dish-pizza', tier: 2, nextId: null, unlocksDishId: 'pizza' },
  // 链 B → steak
  { id: 'm-meat',   name: '生肉',   glyph: '🥩', tier: 0, nextId: 'm-stew' },
  { id: 'm-stew',   name: '炖肉',   glyph: '🍲', tier: 1, nextId: 'm-steak' },
  { id: 'm-steak',  name: '牛排',   artKey: 'dish-steak', tier: 2, nextId: null, unlocksDishId: 'steak' },
  // 链 C → dessert
  { id: 'm-dough',  name: '面团',   glyph: '🍞', tier: 0, nextId: 'm-cake' },
  { id: 'm-cake',   name: '蛋糕胚', glyph: '🍰', tier: 1, nextId: 'm-dessert' },
  { id: 'm-dessert',name: '甜品',   artKey: 'dish-dessert', tier: 2, nextId: null, unlocksDishId: 'dessert' },
  // 链 D → pasta
  { id: 'm-cheese', name: '奶酪',   glyph: '🧀', tier: 0, nextId: 'm-pastadough' },
  { id: 'm-pastadough', name: '面坯', glyph: '🥟', tier: 1, nextId: 'm-pasta' },
  { id: 'm-pasta',  name: '意面',   artKey: 'dish-pasta', tier: 2, nextId: null, unlocksDishId: 'pasta' },
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
