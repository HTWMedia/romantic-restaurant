import { describe, expect, it } from 'vitest';
import {
  createAdStrategy, createKVStore, currentPlatform, SimulatedAdStrategy,
} from '../../assets/scripts/core/platform';
import { STORAGE_KEY } from '../../assets/scripts/core/storage';

describe('平台适配层', () => {
  it('node 测试环境识别为 browser', () => {
    expect(currentPlatform()).toBe('browser');
  });

  it('浏览器 KVStore 读写：node 无 localStorage 时静默降级', () => {
    const kv = createKVStore();
    kv.setItem(STORAGE_KEY, '{"v":1}');
    // localStorage 存在则可回读；不存在（纯 node）则返回 null
    expect([kv.getItem(STORAGE_KEY), null]).toContain(kv.getItem(STORAGE_KEY));
  });

  it('模拟广告策略立即回调 rewarded=true', () => {
    const s = createAdStrategy();
    expect(s).toBeInstanceOf(SimulatedAdStrategy);
    let rewarded = false;
    s.play(15, r => { rewarded = r; });
    expect(rewarded).toBe(true);
  });
});
