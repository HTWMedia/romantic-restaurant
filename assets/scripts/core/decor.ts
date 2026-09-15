/**
 * 独立装饰品系统：玩家可单独购买/摆放装饰品，每件有独立加成。
 * 与 Skin（整套装修风格）互补：Skin 改变整体背景+大风格，Decor 改变单个摆件+细粒度加成。
 */

export type DecorSlot =
  | 'wall'    // 墙面：挂画、时钟、招牌
  | 'table'   // 桌面：花瓶、蜡烛、桌旗
  | 'floor'   // 地面：绿植、地毯、伞架
  | 'ceiling'; // 吊顶：灯饰、风铃、彩带

export type DecorBonusType =
  | 'coin'    // 每单收入 +X%
  | 'patience' // 顾客耐心 +X%
  | 'cook'    // 烹饪时间 -X%
  | 'tip'     // 小费概率 +X%
  | 'energy'; // 体力恢复 -X秒

export interface DecorBonus {
  type: DecorBonusType;
  value: number;  // 百分比，如 5 = +5%
}

export interface DecorItem {
  id: string;
  name: string;
  emoji: string;
  artKey?: string;
  slot: DecorSlot;
  cost: number;
  bonus: DecorBonus;
  /** 装饰品在场景中的默认位置（相对餐厅中心） */
  x: number;
  y: number;
}

export const DECOR_ITEMS: DecorItem[] = [
  // —— 墙面 ——
  { id: 'd-painting',  name: '油画',     emoji: '🖼️', artKey: 'decor-painting',  slot: 'wall',    cost: 80,  bonus: { type: 'coin',     value: 5  }, x: -200, y: 90 },
  { id: 'd-clock',     name: '复古时钟',  emoji: '🕐', artKey: 'decor-clock',     slot: 'wall',    cost: 120, bonus: { type: 'patience', value: 8  }, x: 60,   y: 90 },
  { id: 'd-sign',      name: '霓虹招牌',  emoji: '🪧', artKey: 'decor-sign',      slot: 'wall',    cost: 200, bonus: { type: 'coin',     value: 10 }, x: 180,  y: 90 },
  // —— 桌面 ——
  { id: 'd-vase',      name: '花瓶',     emoji: '💐', artKey: 'decor-vase',      slot: 'table',   cost: 60,  bonus: { type: 'patience', value: 5  }, x: -80,  y: -20 },
  { id: 'd-candle',   name: '烛台',     emoji: '🕯️', artKey: 'decor-candle',    slot: 'table',   cost: 100, bonus: { type: 'tip',      value: 10 }, x: 80,   y: -20 },
  { id: 'd-cloth',    name: '桌旗',     emoji: '🎀', artKey: 'decor-cloth',     slot: 'table',   cost: 150, bonus: { type: 'coin',     value: 8  }, x: 0,    y: -30 },
  // —— 地面 ——
  { id: 'd-plant',     name: '绿植',     emoji: '🪴', artKey: 'decor-plant',     slot: 'floor',   cost: 70,  bonus: { type: 'patience', value: 6  }, x: -230, y: 80 },
  { id: 'd-rug',      name: '地毯',     emoji: '🟥', artKey: 'decor-rug',       slot: 'floor',   cost: 130, bonus: { type: 'energy',   value: 1  }, x: 0,    y: -80 },
  { id: 'd-umbrella', name: '伞架',     emoji: '☂️', artKey: 'decor-umbrella',  slot: 'floor',   cost: 110, bonus: { type: 'patience', value: 10 }, x: 220,  y: 80 },
  // —— 吊顶 ——
  { id: 'd-lamp',      name: '吊灯',     emoji: '💡', artKey: 'decor-lamp',      slot: 'ceiling', cost: 90,  bonus: { type: 'cook',    value: 5  }, x: -120, y: 100 },
  { id: 'd-chime',    name: '风铃',     emoji: '🎐', artKey: 'decor-chime',     slot: 'ceiling', cost: 140, bonus: { type: 'tip',      value: 15 }, x: 0,    y: 110 },
  { id: 'd-ribbon',   name: '彩带',     emoji: '🎊', artKey: 'decor-ribbon',    slot: 'ceiling', cost: 180, bonus: { type: 'coin',     value: 12 }, x: 120,  y: 100 },
];

const BY_ID: Record<string, DecorItem> = {};
for (const d of DECOR_ITEMS) BY_ID[d.id] = d;

export function decorById(id: string): DecorItem | undefined {
  return BY_ID[id];
}

export const DECOR_SLOT_LABELS: Record<DecorSlot, string> = {
  wall: '墙面',
  table: '桌面',
  floor: '地面',
  ceiling: '吊顶',
};

export const DECOR_BONUS_LABELS: Record<DecorBonusType, string> = {
  coin: '收入',
  patience: '耐心',
  cook: '烹饪',
  tip: '小费',
  energy: '体力恢复',
};

export const DECOR_BONUS_ICONS: Record<DecorBonusType, string> = {
  coin: '🪙',
  patience: '⏳',
  cook: '🔥',
  tip: '💌',
  energy: '⚡',
};

/** 格式化加成文本，如 "+5% 收入" */
export function bonusText(b: DecorBonus): string {
  const label = DECOR_BONUS_LABELS[b.type];
  if (b.type === 'energy') {
    return `恢复 -${b.value}秒`;
  }
  const sign = b.type === 'cook' ? '-' : '+';
  return `${sign}${b.value}% ${label}`;
}

/** 计算已拥有装饰品的总加成 */
export function totalBonus(ownedIds: string[]): Record<DecorBonusType, number> {
  const totals: Record<DecorBonusType, number> = {
    coin: 0, patience: 0, cook: 0, tip: 0, energy: 0,
  };
  for (const id of ownedIds) {
    const d = BY_ID[id];
    if (d) totals[d.bonus.type] += d.bonus.value;
  }
  return totals;
}
