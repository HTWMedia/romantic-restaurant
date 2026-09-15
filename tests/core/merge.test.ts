import { describe, it, expect } from 'vitest';
import { MERGE_ITEMS, MERGE_BASE_IDS, mergeNext, mergeItemById, mergeTimeFor, rushCost, isPending, isReady } from '../../assets/scripts/core/merge';

describe('merge chain', () => {
  it('mergeNext 返回下一阶 id，终点为 null', () => {
    expect(mergeNext('m-veg')).toBe('m-salad');
    expect(mergeNext('m-salad')).toBe('m-pizza');
    expect(mergeNext('m-pizza')).toBeNull();
  });
  it('mergeItemById 命中定义项', () => {
    expect(mergeItemById('m-steak')!.name).toBe('牛排');
    expect(mergeItemById('nope')).toBeUndefined();
  });
  it('基础项均为 tier0 且存在于清单', () => {
    for (const id of MERGE_BASE_IDS) {
      const it = mergeItemById(id)!;
      expect(it.tier).toBe(0);
      expect(MERGE_ITEMS).toContain(it);
    }
  });
  it('每个非基础项都有唯一前驱', () => {
    const bases = new Set(MERGE_BASE_IDS);
    for (const it of MERGE_ITEMS) {
      if (bases.has(it.id)) continue;
      const preds = MERGE_ITEMS.filter(p => p.nextId === it.id);
      expect(preds.length).toBe(1);
    }
  });
  it('每个终点项都解锁一道菜', () => {
    const terminals = MERGE_ITEMS.filter(i => i.nextId === null);
    expect(terminals.length).toBeGreaterThan(0);
    for (const t of terminals) expect(t.unlocksDishId).toBeTruthy();
  });
  it('每个合成项都有图源（glyph 或 artKey），回退不会空白', () => {
    for (const it of MERGE_ITEMS) {
      expect(it.glyph || it.artKey).toBeTruthy();
    }
  });
  it('合成时间：基础→中间 5秒，中间→成品 15秒，终点 0', () => {
    expect(mergeTimeFor('m-veg')).toBe(5);     // tier0 → tier1
    expect(mergeTimeFor('m-salad')).toBe(15);   // tier1 → tier2
    expect(mergeTimeFor('m-pizza')).toBe(0);    // 终点
    expect(mergeTimeFor('m-meat')).toBe(5);
    expect(mergeTimeFor('m-stew')).toBe(15);
  });
  it('rushCost：每秒 2 金币，最低 1', () => {
    expect(rushCost(0)).toBe(1);
    expect(rushCost(1)).toBe(2);
    expect(rushCost(10)).toBe(20);
    expect(rushCost(7.5)).toBe(15);
  });
  it('isPending / isReady 类型守卫', () => {
    expect(isPending(null)).toBe(false);
    expect(isPending('m-veg')).toBe(false);
    expect(isPending({ resultId: 'm-salad', finishAt: 0 })).toBe(true);
    expect(isReady(null)).toBe(false);
    expect(isReady('m-veg')).toBe(true);
    expect(isReady({ resultId: 'm-salad', finishAt: 0 })).toBe(false);
  });
});
