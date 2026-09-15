import { describe, it, expect } from 'vitest';
import {
  GameData, createDefaultSave,
  tableUpgradeCost, kitchenUpgradeCost, cookTimeAtLevel, tableCountAtLevel,
  TABLE_LEVEL_MAX,
} from '../../assets/scripts/core/gameData';

describe('GameData', () => {
  it('默认存档：100 金币、2 道初始菜、1 级桌位和厨房', () => {
    const d = new GameData();
    expect(d.coins).toBe(100);
    expect(d.availableDishes).toHaveLength(2);
    expect(d.tableLevel).toBe(1);
    expect(d.kitchenLevel).toBe(1);
  });

  it('从存档恢复并 round-trip toSave', () => {
    const s = createDefaultSave();
    s.coins = 999; s.unlockedDishIds = ['fries', 'burger', 'pizza'];
    const d = new GameData(s);
    expect(d.coins).toBe(999);
    // toSave 会补充新字段，所以对比关键字段而非全等
    const saved = d.toSave();
    expect(saved.coins).toBe(s.coins);
    expect(saved.unlockedDishIds).toEqual(s.unlockedDishIds);
    expect(saved.bestCombo).toBe(0);
    expect(saved.questBoardJson).toBe('');
  });

  it('解锁菜谱：金币不足失败，足够成功并扣款', () => {
    const d = new GameData();
    expect(d.canUnlockDish('pasta')).toBe(false); // 200 > 100，金币不足
    d.earn(100);
    expect(d.canUnlockDish('pizza')).toBe(true);  // 80 <= 200
    expect(d.unlockDish('pizza')).toBe(true);
    expect(d.availableDishes).toHaveLength(3);
    expect(d.coins).toBe(120); // 100 + 100 - 80
  });

  it('重复解锁返回 false', () => {
    const d = new GameData();
    d.earn(100);
    expect(d.unlockDish('pizza')).toBe(true);
    expect(d.unlockDish('pizza')).toBe(false);
  });

  it('桌位升级：升到上限后不可再升', () => {
    const d = new GameData();
    d.earn(10000);
    let ok = true; let guard = 0;
    while (ok && guard < 20) { ok = d.upgradeTable(); guard++; }
    expect(d.tableLevel).toBe(TABLE_LEVEL_MAX);
    expect(d.upgradeTable()).toBe(false);
  });

  it('厨房等级降低做菜时长，且不低于 1 秒', () => {
    expect(cookTimeAtLevel(4, 1)).toBe(4);
    expect(cookTimeAtLevel(4, 5)).toBeGreaterThanOrEqual(1);
    expect(cookTimeAtLevel(4, 5)).toBeLessThan(4);
    expect(cookTimeAtLevel(1, 5)).toBe(1);
  });

  it('桌位数量 = 等级', () => {
    expect(tableCountAtLevel(1)).toBe(1);
    expect(tableCountAtLevel(3)).toBe(3);
  });

  it('升级成本随等级平方增长', () => {
    expect(tableUpgradeCost(1)).toBe(100);
    expect(tableUpgradeCost(2)).toBe(400);
    expect(kitchenUpgradeCost(1)).toBe(150);
  });
});

describe('merge unlock + grid persistence', () => {
  it('mergeUnlockDish 免费解锁且不扣金币', () => {
    const g = new GameData();
    const before = g.coins;
    expect(g.dishUnlocked('pizza')).toBe(false);
    expect(g.mergeUnlockDish('pizza')).toBe(true);
    expect(g.dishUnlocked('pizza')).toBe(true);
    expect(g.coins).toBe(before);
    expect(g.mergeUnlockDish('pizza')).toBe(false);
  });
  it('mergeGrid 持久化往返', () => {
    const g = new GameData();
    g.mergeGrid = ['m-veg', null, 'm-pizza', null];
    const g2 = new GameData(g.toSave());
    expect(g2.mergeGrid).toEqual(['m-veg', null, 'm-pizza', null]);
  });
});
