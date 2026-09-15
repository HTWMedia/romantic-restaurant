// 特殊顾客（VIP）系统：偶尔出现高价值顾客，收入翻倍但耐心更短。
// 数据驱动，加新类型只需在 VIP_TYPES 里追加一条。

export interface VipType {
  id: string;
  name: string;
  glyph: string;
  payMult: number;     // 收入倍率
  patienceMult: number; // 耐心倍率（<1 = 更急躁）
  spawnWeight: number;  // 出现权重
  greetText: string;
}

export const VIP_TYPES: VipType[] = [
  {
    id: 'foodie', name: '美食博主', glyph: '📸',
    payMult: 2.0, patienceMult: 0.7, spawnWeight: 30,
    greetText: '帮你拍张照，发到我的探店号上吧！',
  },
  {
    id: 'celeb', name: '神秘明星', glyph: '😎',
    payMult: 3.0, patienceMult: 0.5, spawnWeight: 15,
    greetText: '低调来吃个饭，别声张哦。',
  },
  {
    id: 'elder', name: '街角老伯', glyph: '👴',
    payMult: 1.5, patienceMult: 1.3, spawnWeight: 25,
    greetText: '小伙子，给你多给点，慢慢做不急。',
  },
  {
    id: 'critic', name: '美食品鉴家', glyph: '🎩',
    payMult: 2.5, patienceMult: 0.6, spawnWeight: 20,
    greetText: '我可是要写进专栏的，拿出真本事来。',
  },
];

const TOTAL_WEIGHT = VIP_TYPES.reduce((s, v) => s + v.spawnWeight, 0);

/** VIP 出现概率（每次生成顾客时掷骰） */
export const VIP_SPAWN_CHANCE = 0.15;

/** 随机选一种 VIP 类型（按权重） */
export function rollVip(): VipType {
  let r = Math.random() * TOTAL_WEIGHT;
  for (const v of VIP_TYPES) {
    r -= v.spawnWeight;
    if (r <= 0) return v;
  }
  return VIP_TYPES[0];
}

/** 是否触发 VIP 生成 */
export function shouldSpawnVip(): boolean {
  return Math.random() < VIP_SPAWN_CHANCE;
}
