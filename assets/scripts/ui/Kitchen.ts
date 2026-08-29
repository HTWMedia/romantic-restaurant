import { Color, Graphics, Label, Node, tween, Vec3 } from 'cc';
import { Dish } from '../core/types';
import { COLOR, makeLabel, makeNode, panelWithShadow, roundRect } from './Widgets';

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
}

const PLATED_MAX = 18; // 做好的菜最多摆 18 秒，没人要就浪费

export class Kitchen {
  onSlotReady?: (dish: Dish) => void;

  private slots: Slot[] = [];
  private slotLayer!: Node;
  private hintLabel!: Label;
  private slotCount = 1;

  constructor(
    parent: Node, x: number, y: number,
    private cookTimeOf: (dish: Dish) => number,
    slotCount: number,
  ) {
    panelWithShadow('kitchen-panel', parent, 300, 200, x, y, 16, COLOR.panel, COLOR.border);
    makeLabel('title', parent, '🍳 厨房', 18, x, y + 78, COLOR.text);
    this.hintLabel = makeLabel('kitchen-hint', parent, '', 13, x, y - 88, COLOR.subtext);
    this.slotLayer = makeNode('kitchen-slots', parent, 300, 140, x, y + 6);
    this.setSlotCount(slotCount);
  }

  get freeSlot(): boolean { return this.slots.some(s => s.dish === null); }

  setSlotCount(n: number): void {
    this.slotCount = n;
    this.slotLayer.removeAllChildren();
    this.slots = [];
    const gap = 58;
    const startX = -((n - 1) * gap) / 2;
    for (let i = 0; i < n; i++) {
      const root = makeNode(`slot-${i}`, this.slotLayer, 56, 92, startX + i * gap, 0);
      const ring = roundRect('ring', root, 50, 50, 0, 10, 25, COLOR.panel, COLOR.border).getComponent(Graphics)!;
      const center = makeLabel('center', root, '', 16, 0, 10, COLOR.text);
      const name = makeLabel('name', root, '', 11, 0, -32, COLOR.subtext);
      this.slots.push({ dish: null, remain: 0, total: 0, ready: false, plated: 0, root, ring, center, name });
    }
    this.hintLabel.string = `可同时烹饪 ${n} 道菜`;
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
    const g = s.ring;
    g.clear();
    const r = 23;
    g.lineWidth = 6;
    g.strokeColor = COLOR.border;
    g.circle(0, 0, r);
    g.stroke();
    if (s.dish === null) {
      s.center.string = '·';
      s.center.color = COLOR.subtext;
      s.name.string = '空闲';
      return;
    }
    if (s.ready) {
      s.center.string = '✓';
      s.center.color = COLOR.green;
      g.strokeColor = COLOR.green;
      g.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2, false);
      g.stroke();
      s.name.string = s.dish.name;
    } else {
      const p = s.total > 0 ? 1 - s.remain / s.total : 0;
      s.center.string = `${Math.ceil(s.remain)}`;
      s.center.color = COLOR.text;
      g.strokeColor = COLOR.primary;
      g.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p, false);
      g.stroke();
      s.name.string = s.dish.name;
    }
  }
}
