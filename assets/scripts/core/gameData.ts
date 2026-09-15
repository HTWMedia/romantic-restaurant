import { DISHES } from './dishes';
import { SKINS } from './skins';
import { MergeSlot } from './merge';
import { decorById, DecorBonusType } from './decor';
import { SaveData } from './types';

export const SAVE_VERSION = 1;
export const TABLE_LEVEL_MAX = 5;
export const KITCHEN_LEVEL_MAX = 5;
export const TABLE_BASE_COST = 100;
export const KITCHEN_BASE_COST = 150;
export const KITCHEN_TIME_REDUCTION = 0.85;
export const COOK_TIME_FLOOR = 1;
export const ENERGY_MAX = 12;
export const ENERGY_REGEN_SEC = 5;

export function tableUpgradeCost(level: number): number {
  return TABLE_BASE_COST * level * level;
}

export function kitchenUpgradeCost(level: number): number {
  return KITCHEN_BASE_COST * level * level;
}

export function cookTimeAtLevel(baseTime: number, kitchenLevel: number): number {
  let t = baseTime;
  for (let i = 1; i < kitchenLevel; i++) t *= KITCHEN_TIME_REDUCTION;
  return Math.max(COOK_TIME_FLOOR, Math.round(t));
}

export function tableCountAtLevel(level: number): number {
  return Math.max(1, level);
}

export function kitchenSlotCount(level: number): number {
  return Math.max(1, level);
}

export function createDefaultSave(): SaveData {
  return {
    version: SAVE_VERSION,
    coins: 100,
    unlockedDishIds: DISHES.filter(d => d.unlockCost === 0).map(d => d.id),
    tableLevel: 1,
    kitchenLevel: 1,
    totalRevenue: 0,
    chapterIndex: 0,
    servedTotal: 0,
    happyTotal: 0,
    introPlayed: false,
    energy: ENERGY_MAX,
    ownedSkinIds: ['classic'],
    activeSkinId: 'classic',
    mergeGrid: [],
    ownedDecorIds: [],
  };
}

export class GameData {
  coins: number;
  unlockedDishIds: string[];
  tableLevel: number;
  kitchenLevel: number;
  totalRevenue: number;
  chapterIndex: number;
  servedTotal: number;
  happyTotal: number;
  introPlayed: boolean;
  energy: number;
  ownedSkinIds: string[];
  activeSkinId: string;
  mergeGrid: MergeSlot[] = [];
  bestCombo: number = 0;
  questBoardJson: string = '';
  ownedDecorIds: string[] = [];

  constructor(save?: SaveData | null) {
    const base = save ?? createDefaultSave();
    this.coins = base.coins;
    this.unlockedDishIds = [...base.unlockedDishIds];
    this.tableLevel = base.tableLevel;
    this.kitchenLevel = base.kitchenLevel;
    this.totalRevenue = base.totalRevenue;
    this.chapterIndex = (base as any).chapterIndex ?? 0;
    this.servedTotal = (base as any).servedTotal ?? 0;
    this.happyTotal = (base as any).happyTotal ?? 0;
    this.introPlayed = (base as any).introPlayed ?? false;
    this.energy = (base as any).energy ?? ENERGY_MAX;
    this.ownedSkinIds = (base as any).ownedSkinIds ?? ['classic'];
    this.activeSkinId = (base as any).activeSkinId ?? 'classic';
    this.mergeGrid = (base as any).mergeGrid ?? [];
    // 旧存档兼容：全部是 string|null，直接可用；如果有 object 说明已是新格式
    this.bestCombo = (base as any).bestCombo ?? 0;
    this.questBoardJson = (base as any).questBoardJson ?? '';
    this.ownedDecorIds = (base as any).ownedDecorIds ?? [];
  }

  get availableDishes(): typeof DISHES {
    return DISHES.filter(d => this.unlockedDishIds.indexOf(d.id) !== -1);
  }

  dishUnlocked(id: string): boolean {
    return this.unlockedDishIds.indexOf(id) !== -1;
  }

  earn(amount: number): void {
    this.coins += Math.max(0, Math.round(amount));
    this.totalRevenue += Math.max(0, Math.round(amount));
  }

  canSpend(amount: number): boolean {
    return this.coins >= amount;
  }

  spend(amount: number): boolean {
    if (!this.canSpend(amount)) return false;
    this.coins -= amount;
    return true;
  }

  canUnlockDish(id: string): boolean {
    const dish = DISHES.find(d => d.id === id);
    if (!dish || dish.unlockCost === 0) return false;
    return !this.dishUnlocked(id) && this.canSpend(dish.unlockCost);
  }

  unlockDish(id: string): boolean {
    const dish = DISHES.find(d => d.id === id);
    if (!dish || !this.canUnlockDish(id)) return false;
    this.spend(dish.unlockCost);
    this.unlockedDishIds.push(id);
    return true;
  }

  mergeUnlockDish(id: string): boolean {
    const dish = DISHES.find(d => d.id === id);
    if (!dish || this.dishUnlocked(id)) return false;
    this.unlockedDishIds.push(id);
    return true;
  }

  skinOwned(id: string): boolean {
    return this.ownedSkinIds.indexOf(id) !== -1;
  }

  unlockSkin(id: string): boolean {
    const skin = SKINS.find(s => s.id === id);
    if (!skin || this.skinOwned(id)) return false;
    if (!this.canSpend(skin.cost)) return false;
    this.spend(skin.cost);
    this.ownedSkinIds.push(id);
    this.activeSkinId = id;
    return true;
  }

  setSkin(id: string): boolean {
    if (!this.skinOwned(id)) return false;
    this.activeSkinId = id;
    return true;
  }

  // —— 装饰品系统 ——
  decorOwned(id: string): boolean {
    return this.ownedDecorIds.indexOf(id) !== -1;
  }

  canBuyDecor(id: string): boolean {
    const d = decorById(id);
    if (!d || this.decorOwned(id)) return false;
    return this.canSpend(d.cost);
  }

  buyDecor(id: string): boolean {
    const d = decorById(id);
    if (!d || !this.canBuyDecor(id)) return false;
    this.spend(d.cost);
    this.ownedDecorIds.push(id);
    return true;
  }

  /** 所有已拥有装饰品的加成汇总 */
  decorBonus(): Record<DecorBonusType, number> {
    const totals: Record<DecorBonusType, number> = {
      coin: 0, patience: 0, cook: 0, tip: 0, energy: 0,
    };
    for (const id of this.ownedDecorIds) {
      const d = decorById(id);
      if (d) totals[d.bonus.type] += d.bonus.value;
    }
    return totals;
  }

  /** 收入加成乘数（如 +15% 返回 1.15） */
  get coinMultiplier(): number {
    return 1 + this.decorBonus().coin / 100;
  }

  /** 顾客耐心加成百分比 */
  get patienceBonusPct(): number {
    return this.decorBonus().patience;
  }

  /** 烹饪时间减免乘数（如 -10% 返回 0.90） */
  get cookTimeMultiplier(): number {
    return Math.max(0.5, 1 - this.decorBonus().cook / 100);
  }

  /** 小费概率加成百分比 */
  get tipBonusPct(): number {
    return this.decorBonus().tip;
  }

  /** 体力恢复减少秒数 */
  get energyRegenReduction(): number {
    return this.decorBonus().energy;
  }

  canUpgradeTable(): boolean {
    return this.tableLevel < TABLE_LEVEL_MAX && this.canSpend(tableUpgradeCost(this.tableLevel));
  }

  upgradeTable(): boolean {
    if (!this.canUpgradeTable()) return false;
    this.spend(tableUpgradeCost(this.tableLevel));
    this.tableLevel++;
    return true;
  }

  canUpgradeKitchen(): boolean {
    return this.kitchenLevel < KITCHEN_LEVEL_MAX && this.canSpend(kitchenUpgradeCost(this.kitchenLevel));
  }

  upgradeKitchen(): boolean {
    if (!this.canUpgradeKitchen()) return false;
    this.spend(kitchenUpgradeCost(this.kitchenLevel));
    this.kitchenLevel++;
    return true;
  }

  toSave(): SaveData {
    return {
      version: SAVE_VERSION,
      coins: this.coins,
      unlockedDishIds: [...this.unlockedDishIds],
      tableLevel: this.tableLevel,
      kitchenLevel: this.kitchenLevel,
      totalRevenue: this.totalRevenue,
      chapterIndex: this.chapterIndex,
      servedTotal: this.servedTotal,
      happyTotal: this.happyTotal,
      introPlayed: this.introPlayed,
      energy: this.energy,
      ownedSkinIds: [...this.ownedSkinIds],
      activeSkinId: this.activeSkinId,
      mergeGrid: this.mergeGrid,
      bestCombo: this.bestCombo,
      questBoardJson: this.questBoardJson,
      ownedDecorIds: [...this.ownedDecorIds],
    };
  }
}
