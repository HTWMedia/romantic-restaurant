import { describe, it, expect } from 'vitest';
import { ART_MANIFEST, CUSTOMER_ART, entry, hasArt, markLoaded } from '../../assets/scripts/core/art';

describe('ART_MANIFEST', () => {
  it('条目不少于 50 且 key 唯一', () => {
    expect(ART_MANIFEST.length).toBeGreaterThanOrEqual(50);
    const keys = ART_MANIFEST.map(e => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('每项都有正数尺寸与合法类别', () => {
    const cats = ['bg', 'panel', 'customer', 'character', 'dish', 'icon', 'decor'];
    for (const e of ART_MANIFEST) {
      expect(e.w).toBeGreaterThan(0);
      expect(e.h).toBeGreaterThan(0);
      expect(cats).toContain(e.category);
    }
  });
  it('CUSTOMER_ART 全部在清单中', () => {
    for (const k of CUSTOMER_ART) expect(entry(k)).toBeDefined();
  });
});

describe('core hasArt 注册表（回退决策源）', () => {
  it('未注册时 hasArt 为 false（缺图回退）', () => {
    expect(hasArt('bg')).toBe(false);
  });
  it('注册后可被识别', () => {
    markLoaded('cust-1');
    expect(hasArt('cust-1')).toBe(true);
    expect(hasArt('cust-2')).toBe(false);
  });
});