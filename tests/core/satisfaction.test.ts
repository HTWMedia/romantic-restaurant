import { describe, it, expect } from 'vitest';
import {
  MAX_SATISFACTION, DEFAULT_MAX_WAIT,
  satisfactionAfterWaiting, payRatio, paidAmount,
} from '../../assets/scripts/core/satisfaction';

describe('satisfaction', () => {
  it('等待一半时长掉一半满意度', () => {
    expect(satisfactionAfterWaiting(100, DEFAULT_MAX_WAIT / 2)).toBe(50);
  });
  it('等待超过耐心时长降为 0 且不为负', () => {
    expect(satisfactionAfterWaiting(100, DEFAULT_MAX_WAIT * 2)).toBe(0);
  });
  it('payRatio 在 0..1 之间', () => {
    expect(payRatio(0)).toBe(0);
    expect(payRatio(100)).toBe(1);
    expect(payRatio(50)).toBe(0.5);
  });
  it('paidAmount 按满意度打折并取整', () => {
    expect(paidAmount(10, 100)).toBe(10);
    expect(paidAmount(10, 50)).toBe(5);
    expect(paidAmount(15, 50)).toBe(8);   // 15*0.5=7.5 → round → 8
  });
});
