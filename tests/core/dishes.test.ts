import { describe, it, expect } from 'vitest';
import { DISHES } from '../../assets/scripts/core/dishes';

describe('DISHES', () => {
  it('有 6 道菜且 id 唯一', () => {
    expect(DISHES).toHaveLength(6);
    expect(new Set(DISHES.map(d => d.id)).size).toBe(6);
  });
  it('恰好前 2 道菜初始解锁（unlockCost === 0）', () => {
    const initial = DISHES.filter(d => d.unlockCost === 0);
    expect(initial).toHaveLength(2);
    expect(initial.map(d => d.name)).toEqual(['薯条', '汉堡']);
  });
  it('价格与制作时长都为正数', () => {
    for (const d of DISHES) {
      expect(d.price).toBeGreaterThan(0);
      expect(d.cookTime).toBeGreaterThan(0);
    }
  });
});
