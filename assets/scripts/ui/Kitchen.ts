import { Label } from 'cc';
import { Dish } from '../core/types';
import { COLOR, makeLabel, makeNode, makeRect, makeButton } from './Widgets';

export class Kitchen {
  private _currentDish: Dish | null = null;
  private remain = 0;
  private _ready = false;
  private statusLabel!: Label;
  private progressLabel!: Label;

  constructor(
    parent: import('cc').Node, x: number, y: number,
    private cookTimeOf: (dish: Dish) => number,
  ) {
    makeRect('kitchen-panel', parent, 220, 150, x, y, COLOR.panel);
    makeLabel('title', parent, '厨房', 18, x, y + 55, COLOR.text);
    this.statusLabel = makeLabel('status', parent, '空闲', 16, x, y + 10, COLOR.text);
    this.progressLabel = makeLabel('progress', parent, '', 14, x, y - 30, COLOR.text);
    makeButton('cook-btn', parent, 140, 40, x, y - 55, COLOR.primary, '开始做菜', () => this.startCooking());
  }

  get busy(): boolean { return this._currentDish !== null && !this._ready; }
  get ready(): boolean { return this._ready; }
  get currentDish(): Dish | null { return this._currentDish; }

  selectDish(dish: Dish | null): void {
    if (this.busy || this._ready) return;
    this._currentDish = dish;
    this._ready = false;
    this.remain = dish ? this.cookTimeOf(dish) : 0;
    this.render();
  }

  startCooking(): void {
    if (!this._currentDish || this.busy || this._ready) return;
    this.remain = this.cookTimeOf(this._currentDish);
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
    this.render();
    return d;
  }

  private render(): void {
    if (!this._currentDish) {
      this.statusLabel.string = '空闲（先在菜单选菜）';
      this.progressLabel.string = '';
    } else if (this._ready) {
      this.statusLabel.string = `${this._currentDish.name} 做好了！`;
      this.progressLabel.string = '点「上菜」给顾客';
    } else {
      this.statusLabel.string = `制作 ${this._currentDish.name}...`;
      this.progressLabel.string = `剩余 ${Math.max(0, Math.ceil(this.remain))} 秒`;
    }
  }
}
