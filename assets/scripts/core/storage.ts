import { SaveData } from './types';

export const STORAGE_KEY = 'romantic-restaurant-save';

export interface KVStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export class BrowserKVStore implements KVStore {
  getItem(key: string): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  }
  setItem(key: string, value: string): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
  }
}

export class MemoryKVStore implements KVStore {
  private map = new Map<string, string>();
  getItem(key: string): string | null { return this.map.get(key) ?? null; }
  setItem(key: string, value: string): void { this.map.set(key, value); }
}

export class StorageService {
  constructor(private kv: KVStore) {}

  load(): SaveData | null {
    const raw = this.kv.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SaveData;
    } catch {
      return null;
    }
  }

  save(data: SaveData): void {
    try {
      this.kv.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // 存储满等异常：静默降级，不阻塞游玩（符合 spec §6.3）
    }
  }
}
