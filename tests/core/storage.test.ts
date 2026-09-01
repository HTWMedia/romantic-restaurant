import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService, MemoryKVStore } from '../../assets/scripts/core/storage';
import { SaveData } from '../../assets/scripts/core/types';

describe('StorageService', () => {
  let kv: MemoryKVStore;
  let svc: StorageService;

  beforeEach(() => {
    kv = new MemoryKVStore();
    svc = new StorageService(kv);
  });

  it('无存档时 load 返回 null', () => {
    expect(svc.load()).toBeNull();
  });

  it('save 后 load 能还原（round-trip）', () => {
    const data: SaveData = {
      version: 1, coins: 120, unlockedDishIds: ['fries'],
      tableLevel: 2, kitchenLevel: 1, totalRevenue: 500,
      chapterIndex: 0, servedTotal: 0, happyTotal: 0,
      introPlayed: false, energy: 100,
      ownedSkinIds: ['default'], activeSkinId: 'default',
    };
    svc.save(data);
    expect(svc.load()).toEqual(data);
  });

  it('损坏的 JSON 返回 null 而不抛异常', () => {
    kv.setItem('romantic-restaurant-save', '{oops');
    expect(svc.load()).toBeNull();
  });
});
