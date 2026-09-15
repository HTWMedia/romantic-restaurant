import { describe, it, expect } from 'vitest';
import { DECOR_ITEMS, decorById, bonusText, totalBonus, DECOR_SLOT_LABELS } from '../../assets/scripts/core/decor';
import { GameData } from '../../assets/scripts/core/gameData';

describe('decor system', () => {
  it('所有装饰品有唯一 id 且字段完整', () => {
    const ids = new Set<string>();
    for (const d of DECOR_ITEMS) {
      expect(d.id).toBeTruthy();
      expect(ids.has(d.id)).toBe(false);
      ids.add(d.id);
      expect(d.name).toBeTruthy();
      expect(d.emoji).toBeTruthy();
      expect(d.cost).toBeGreaterThan(0);
      expect(d.bonus.value).toBeGreaterThan(0);
      expect(d.x).toBeDefined();
      expect(d.y).toBeDefined();
    }
  });

  it('decorById 命中/未命中', () => {
    expect(decorById('d-painting')!.name).toBe('油画');
    expect(decorById('nope')).toBeUndefined();
  });

  it('bonusText 格式化正确', () => {
    expect(bonusText({ type: 'coin', value: 5 })).toBe('+5% 收入');
    expect(bonusText({ type: 'cook', value: 10 })).toBe('-10% 烹饪');
    expect(bonusText({ type: 'energy', value: 1 })).toBe('恢复 -1秒');
  });

  it('totalBonus 汇总已拥有装饰品', () => {
    const totals = totalBonus(['d-painting', 'd-sign', 'd-plant']);
    // d-painting: coin+5, d-sign: coin+10, d-plant: patience+6
    expect(totals.coin).toBe(15);
    expect(totals.patience).toBe(6);
    expect(totals.cook).toBe(0);
  });

  it('GameData 装饰品购买与加成', () => {
    const g = new GameData();
    g.earn(500);
    expect(g.decorOwned('d-painting')).toBe(false);
    expect(g.canBuyDecor('d-painting')).toBe(true);
    expect(g.buyDecor('d-painting')).toBe(true);
    expect(g.decorOwned('d-painting')).toBe(true);
    expect(g.canBuyDecor('d-painting')).toBe(false); // 已拥有
    expect(g.buyDecor('d-painting')).toBe(false);   // 重复购买失败
    // coin 加成 5%
    expect(g.coinMultiplier).toBe(1.05);
  });

  it('GameData 多件装饰品加成叠加', () => {
    const g = new GameData();
    g.earn(1000);
    g.buyDecor('d-painting');  // coin +5
    g.buyDecor('d-sign');      // coin +10
    g.buyDecor('d-clock');     // patience +8
    g.buyDecor('d-lamp');      // cook -5
    expect(g.coinMultiplier).toBe(1.15);
    expect(g.patienceBonusPct).toBe(8);
    expect(g.cookTimeMultiplier).toBeCloseTo(0.95, 2);
  });

  it('金币不足时购买失败', () => {
    const g = new GameData();
    expect(g.canBuyDecor('d-sign')).toBe(false); // 200 > 100
    expect(g.buyDecor('d-sign')).toBe(false);
  });

  it('装饰品存档往返', () => {
    const g = new GameData();
    g.earn(1000);
    g.buyDecor('d-painting');
    g.buyDecor('d-plant');
    const g2 = new GameData(g.toSave());
    expect(g2.decorOwned('d-painting')).toBe(true);
    expect(g2.decorOwned('d-plant')).toBe(true);
    expect(g2.decorOwned('d-sign')).toBe(false);
    expect(g2.coinMultiplier).toBe(1.05);
  });
});
