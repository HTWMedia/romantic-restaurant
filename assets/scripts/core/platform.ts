// 平台适配层：浏览器预览与微信小游戏共用的环境差异封装。
// 游戏逻辑只依赖接口（KVStore / AdStrategy），平台实现由工厂按运行环境选择。
import { BrowserKVStore, KVStore } from './storage';

export type PlatformName = 'browser' | 'wechat';

// 微信小游戏全局对象（仅在微信环境存在，浏览器预览中为 undefined）
const wxAny = (): any => (globalThis as any).wx;

export function currentPlatform(): PlatformName {
  const wx = wxAny();
  return wx && typeof wx.getStorageSync === 'function' ? 'wechat' : 'browser';
}

export function createKVStore(): KVStore {
  if (currentPlatform() === 'wechat') {
    return {
      getItem: (key: string) => {
        try { return wxAny().getStorageSync(key) || null; } catch { return null; }
      },
      setItem: (key: string, value: string) => {
        try { wxAny().setStorageSync(key, value); } catch { /* 存储异常静默降级 */ }
      },
    };
  }
  return new BrowserKVStore();
}

export interface AdStrategy {
  /** true = 平台自带广告 UI（游戏内不再显示模拟倒计时面板） */
  native: boolean;
  /** 播放激励视频；onDone(rewarded) 在广告关闭后回调，rewarded 表示是否完整观看 */
  play(sec: number, onDone: (rewarded: boolean) => void): void;
}

export class SimulatedAdStrategy implements AdStrategy {
  native = false;
  /** 浏览器预览：倒计时面板由 AdView 驱动，这里只负责立即回调解锁 */
  play(_sec: number, onDone: (rewarded: boolean) => void): void {
    onDone(true);
  }
}

const WECHAT_AD_UNIT_ID = ''; // TODO: 上线时填入微信激励视频广告位 ID

export class WeChatAdStrategy implements AdStrategy {
  native = true;
  private ad: any = null;

  play(_sec: number, onDone: (rewarded: boolean) => void): void {
    const wx = wxAny();
    if (!this.ad) this.ad = wx.createRewardedVideoAd({ adUnitId: WECHAT_AD_UNIT_ID });
    const onClose = (res: any) => {
      this.ad.offClose(onClose);
      onDone(!!(res && res.isEnded));
    };
    this.ad.onClose(onClose);
    this.ad.show().catch(() => {
      // 首次拉取失败：重载一次再试；仍失败按未完成处理，不发放奖励
      this.ad.load()
        .then(() => this.ad.show())
        .catch(() => onDone(false));
    });
  }
}

let adStrategy: AdStrategy | null = null;

export function createAdStrategy(): AdStrategy {
  if (!adStrategy) {
    adStrategy = currentPlatform() === 'wechat' ? new WeChatAdStrategy() : new SimulatedAdStrategy();
  }
  return adStrategy;
}

export function supportsSpeechRecognition(): boolean {
  const w = globalThis as any;
  return typeof (w.SpeechRecognition ?? w.webkitSpeechRecognition) === 'function';
}

export function supportsSpeechSynthesis(): boolean {
  const w = globalThis as any;
  return typeof w.speechSynthesis === 'object' && w.speechSynthesis !== null &&
    typeof w.speechSynthesis.speak === 'function';
}
