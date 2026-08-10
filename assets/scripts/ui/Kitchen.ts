import { Button, Graphics, Label, Node } from 'cc';
import { Dish } from '../core/types';
import { COLOR, makeLabel, makeNode, panelWithShadow, pillButton } from './Widgets';

export class Kitchen {
  private _currentDish: Dish | null = null;
  private remain = 0;
  private total = 0;
  private _ready = false;
  private statusLabel!: Label;
  private timeLabel!: Label;
  private ring!: Graphics;
  private cookBtn!: Node;

  constructor(
    parent: Node, x: number, y: number,
    private cookTimeOf: (dish: Dish) => number,
  ) {
    panelWithShadow('kitchen-panel', parent, 230, 170, x, y, 16, COLOR.panel, COLOR.border);
    makeLabel('title', parent, '🍳 厨房', 18, x, y + 60, COLOR.text);

    const ringNode = makeNode('ring', parent, 60, 60, x, y + 5);
    this.ring = ringNode.addComponent(Graphics);
    this.timeLabel = makeLabel('time', parent, '', 16, x, y + 5, COLOR.text);

    this.statusLabel = makeLabel('status', parent, '空闲（先在菜单选菜）', 14, x, y - 35, COLOR.subtext);
    this.cookBtn = pillButton('cook-btn', parent, 140, 36, x, y - 65, COLOR.primary, '开始做菜', () => this.startCooking());
    this.drawRing(0);
  }

  get busy(): boolean { return this._currentDish !== null && !this._ready; }
  get ready(): boolean { return this._ready; }
  get currentDish(): Dish | null { return this._currentDish; }

  selectDish(dish: Dish | null): void {
    if (this.busy || this._ready) return;
    this._currentDish = dish;
    this._ready = false;
    this.remain = dish ? this.cookTimeOf(dish) : 0;
    this.total = this.remain;
    this.render();
  }

  startCooking(): void {
    if (!this._currentDish || this.busy || this._ready) return;
    this.remain = this.cookTimeOf(this._currentDish);
    this.total = this.remain;
    this.render();
  }

  update(dt: number): void {
    if (!this.busy) return;
    this.remain -= dt;
    if (this.remain <= 0) {
      this.remain = 0;
      this._ready = true;
    }
    this.render();
  }

  collect(): Dish | null {
    if (!this._ready || !this._currentDish) return null;
    const d = this._currentDish;
    this._currentDish = null;
    this._ready = false;
    this.remain = 0;
    this.total = 0;
    this.render();
    return d;
  }

  private render(): void {
    const btnLabel = this.cookBtn.getComponentInChildren(Label)!;
    if (!this._currentDish) {
      this.statusLabel.string = '空闲（先在菜单选菜）';
      this.timeLabel.string = '';
      this.drawRing(0);
      btnLabel.string = '开始做菜';
      this.cookBtn.getComponent(Button)!.interactable = true;
    } else if (this._ready) {
      this.statusLabel.string = `${this._currentDish.name} 做好了！`;
      this.timeLabel.string = '✓';
      this.drawRing(1);
      btnLabel.string = '上菜';
      this.cookBtn.getComponent(Button)!.interactable = true;
    } else {
      this.statusLabel.string = `制作 ${this._currentDish.name}…`;
      this.timeLabel.string = `${Math.max(0, Math.ceil(this.remain))}`;
      this.drawRing(this.total > 0 ? 1 - this.remain / this.total : 0);
      btnLabel.string = '制作中…';
      this.cookBtn.getComponent(Button)!.interactable = false;
    }
  }

  private drawRing(progress: number): void {
    const g = this.ring;
    g.clear();
    const r = 24;
    g.lineWidth = 6;
    g.strokeColor = COLOR.border;
    g.circle(0, 0, r);
    g.stroke();
    const p = Math.max(0, Math.min(1, progress));
    if (p > 0) {
      g.strokeColor = this._ready ? COLOR.green : COLOR.primary;
      g.arc(0, 0, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p, false);
      g.stroke();
    }
  }
}
