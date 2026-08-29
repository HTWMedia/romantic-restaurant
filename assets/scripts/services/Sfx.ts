// 轻量音效：用浏览器 WebAudio 直接合成，无需任何音频资源文件。
// 浏览器要求音频在用户手势后才能播放，首次点击（选菜/升级）即会触发，之后正常出声。
export class Sfx {
  private static ctx: AudioContext | null = null;

  private static get c(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const Ctor = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctor) return null;
    if (!this.ctx) this.ctx = new Ctor();
    const ctx = this.ctx;
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  private static blip(freq: number, dur: number, type: any = 'sine', gain = 0.04, delay = 0): void {
    const ctx = this.c;
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur);
  }

  static cook(): void { this.blip(520, 0.12, 'sine'); }
  static serve(): void { this.blip(700, 0.1, 'triangle'); }
  static coin(): void {
    this.blip(880, 0.07, 'square', 0.05);
    this.blip(1320, 0.09, 'square', 0.05, 0.07);
  }
  static fail(): void { this.blip(180, 0.3, 'sawtooth', 0.05); }
}
