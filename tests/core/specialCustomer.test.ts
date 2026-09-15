import { describe, it, expect } from 'vitest';
import { VIP_TYPES, VIP_SPAWN_CHANCE, rollVip, shouldSpawnVip } from '../../assets/scripts/core/specialCustomer';

describe('specialCustomer', () => {
  it('VIP_TYPES 非空且每种属性合理', () => {
    expect(VIP_TYPES.length).toBeGreaterThan(0);
    for (const v of VIP_TYPES) {
      expect(v.id).toBeTruthy();
      expect(v.payMult).toBeGreaterThanOrEqual(1);
      expect(v.patienceMult).toBeGreaterThan(0);
      expect(v.spawnWeight).toBeGreaterThan(0);
      expect(v.greetText).toBeTruthy();
    }
  });

  it('rollVip 返回池中某一种', () => {
    for (let i = 0; i < 20; i++) {
      const v = rollVip();
      expect(VIP_TYPES.some(x => x.id === v.id)).toBe(true);
    }
  });

  it('VIP_SPAWN_CHANCE 在合理范围', () => {
    expect(VIP_SPAWN_CHANCE).toBeGreaterThan(0);
    expect(VIP_SPAWN_CHANCE).toBeLessThan(1);
  });

  it('shouldSpawnVip 多次调用返回 true/false', () => {
    let gotTrue = false;
    let gotFalse = false;
    for (let i = 0; i < 100; i++) {
      if (shouldSpawnVip()) gotTrue = true;
      else gotFalse = true;
    }
    expect(gotTrue).toBe(true);
    expect(gotFalse).toBe(true);
  });
});
