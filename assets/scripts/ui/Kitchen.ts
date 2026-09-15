import { Color, Graphics, Label, Node, tween, Vec3 } from 'cc';
import { Dish } from '../core/types';
import { COLOR, makeLabel, makeNode, roundRect } from './Widgets';
import { ArtService } from './ArtView';
import { ParticleFx } from './ParticleFx';
interface Slot {
  dish: Dish | null;
  remain: number;
  total: number;
  ready: boolean;
  plated: number;   // 做好后未被取走（plated）的计时，超时丢弃
  root: Node;
  ring: Graphics;
  center: Label;
  name: Label;
  dishArt: Node | null;
}

const PLATED_MAX = 18; // 做好的菜最多摆 18 秒，没人要就浪费

export class Kitchen {
  onSlotReady?: (dish: Dish) => void;

  private slots: Slot[] = [];
  private slotLayer!: Node;
  private slotCount = 1;

  constructor(
    parent: Node, x: number, y: number,
    private cookTimeOf: (dish: Dish) => number,
    slotCount: number,
  ) {
    // 无面板：只渲染一排小灶位图标，挂在顶部订单条下方，不遮挡场景
    this.slotLayer = makeNode('kitchen-slots', parent, 220, 50, x, y);
    this.setSlotCount(slotCount);
  }

  get freeSlot(): boolean { return this.slots.some(s => s.dish === null); }

  setSlotCount(n: number): void {
    this.slotCount = n;
    this.slotLayer.removeAllChildren();
    this.slots = [];
    const gap = 42;
    const startX = -((n - 1) * gap) / 2;
    for (let i = 0; i < n; i++) {
      const root = makeNode(`slot-${i}`, this.slotLayer, 44, 52, startX + i * gap, 0);
      // 深色底衬让白色灶位圈和文字在浅色背景上可读
      const back = roundRect('back', root, 42, 50, 0, 0, 10, new Color(60, 45, 30, 100));
      back;
      const ring = roundRect('ring', root, 34, 34, 0, 8, 17, COLOR.white, COLOR.border).getComponent(Graphics)!;
      const center = makeLabel('center', root, '', 14, 0, 8, COLOR.text);
      center.isBold = true;
      const name = makeLabel('name', root, '', 11, 0, -18, COLOR.white);
      this.slots.push({ dish: null, remain: 0, total: 0, ready: false, plated: 0, root, ring, center, name, dishArt: null });
    }
  }

  /** 把一道菜放进空闲槽开始做；满槽返回 false */
  cookDish(dish: Dish): boolean {
    const slot = this.slots.find(s => s.dish === null);
    if (!slot) return false;
    slot.dish = dish;
    slot.total = this.cookTimeOf(dish);
    slot.remain = slot.total;
    slot.ready = false;
    slot.plated = 0;
    this.render(slot);
    return true;
  }

  update(dt: number): void {
    for (const s of this.slots) {
      if (s.dish === null) continue;
      if (!s.ready) {
        s.remain -= dt;
        if (s.remain <= 0) {
          s.remain = 0;
          s.ready = true;
          this.onSlotReady?.(s.dish);
          // 蒸汽特效
          const pos = s.root.getPosition();
          ParticleFx.steamPuff(pos.x, pos.y + 20);
        }
        this.render(s);
      } else {
        s.plated += dt;
        if (s.plated >= PLATED_MAX) {
          s.dish = null;
          s.ready = false;
          s.plated = 0;
          this.render(s);
        }
      }
    }
  }

  /** 当前已做好、等待上菜的槽 */
  readySlots(): Slot[] { return this.slots.filter(s => s.ready && s.dish !== null); }

  takeSlot(slot: Slot): void {
    slot.dish = null;
    slot.ready = false;
    slot.plated = 0;
    slot.remain = 0;
    slot.total = 0;
    this.render(slot);
  }

  private render(s: Slot): void {
    const hasDishArt = s.dish !== null && ArtService.hasArt(s.dish.artKey);
    if (!hasDishArt && s.dishArt) { s.dishArt.destroy(); s.dishArt = null; }
    if (hasDishArt && !s.dishArt) {
      s.dishArt = ArtService.makeSprite(s.root, s.dish!.artKey, 26, 26, 0, 8, 'dish-art');
    }
    const g = s.ring;
    g.clear();
    const r = 15;
    g.lineWidth = 5;
    g.strokeColor = COLOR.border;
    g.circle(0, 8, r);
    g.stroke();
    if (s.dish === null) {
      s.center.string = '空';
      s.center.color = COLOR.subtext;
      s.name.string = '空闲';
      s.name.color = COLOR.white;
      s.center.node.setPosition(0, 8);
      return;
    }
    s.center.node.setPosition(0, 8);
    if (s.ready) {
      s.center.string = '✓';
      s.center.color = COLOR.green;
      g.strokeColor = COLOR.green;
      g.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2, false);
      g.stroke();
      s.name.string = `${s.dish.name} ✓`;
      s.name.color = COLOR.green;
    } else {
      const p = s.total > 0 ? 1 - s.remain / s.total : 0;
      s.center.string = `${Math.ceil(s.remain)}s`;
      s.center.color = COLOR.text;
      g.strokeColor = COLOR.primary;
      g.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p, false);
      g.stroke();
      s.name.string = s.dish.name;
      s.name.color = COLOR.white;
    }
  }
}
