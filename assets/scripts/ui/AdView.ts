import { Color, Label, Node } from 'cc';
import { COLOR, makeLabel, makeRect, panelWithShadow } from './Widgets';
import { ArtService } from './ArtView';

// 模拟"看广告"：真实接入时把 play() 内部换成微信/抖音广告 SDK 的回调即可。
export class AdView {
  private overlay!: Node;
  private panel!: Node;
  private titleL!: Label;
  private countL!: Label;
  private remain = 0;
  private reward?: () => void;
  private playing = false;

  constructor(parent: Node) {
    this.overlay = makeRect('ad-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 175));
    this.overlay.active = false;
    this.overlay.on(Node.EventType.TOUCH_START, () => {});
    this.panel = ArtService.panelWithArt('ad-panel', parent, 'panel-popup', 480, 280, 0, 0);
    this.panel.active = false;
    if (!ArtService.attachIconSprite(this.panel, 'icon-ad', 0, 70, 64))
      makeLabel('ad-icon', this.panel, '📺', 60, 0, 70, COLOR.text);
    this.titleL = makeLabel('ad-title', this.panel, '', 22, 0, 10, COLOR.text);
    this.titleL.isBold = true;
    this.countL = makeLabel('ad-count', this.panel, '', 44, 0, -50, COLOR.primary);
    this.countL.isBold = true;
    makeLabel('ad-tip', this.panel, '广告播放中，请稍候…', 14, 0, -105, COLOR.subtext);
  }

  get isPlaying(): boolean {
    return this.playing;
  }

  play(durationSec: number, reward: () => void, title: string): void {
    this.remain = durationSec;
    this.reward = reward;
    this.playing = true;
    this.titleL.string = title;
    this.countL.string = `${Math.ceil(this.remain)}`;
    this.overlay.active = true;
    this.panel.active = true;
  }

  update(dt: number): void {
    if (!this.playing) return;
    this.remain -= dt;
    this.countL.string = `${Math.max(0, Math.ceil(this.remain))}`;
    if (this.remain <= 0) {
      this.playing = false;
      this.overlay.active = false;
      this.panel.active = false;
      const r = this.reward;
      this.reward = undefined;
      r?.();
    }
  }
}
