import { Color, Label, Node, UITransform, Graphics } from 'cc';
import { CustomerState, Dish } from '../core/types';
import {
  DEFAULT_MAX_WAIT, MAX_SATISFACTION, paidAmount, satisfactionAfterWaiting,
} from '../core/satisfaction';
import { COLOR, makeLabel, makeNode, makeRect } from './Widgets';

export class CustomerView {
  node: Node;
  private _state: CustomerState = CustomerState.ORDERING;
  private waitTimer = 0;
  private eatTimer = 0;
  private satBar!: Node;
  private satBarScaleX = 1;
  private price = 0;
  private maxWait = DEFAULT_MAX_WAIT;

  constructor(
    parent: Node, x: number, y: number,
    readonly dish: Dish,
    private onLeave: (c: CustomerView) => void,
  ) {
    this.node = makeRect('customer', parent, 60, 80, x, y, COLOR.accent);
    this.price = dish.price;

    const head = makeRect('head', this.node, 30, 30, 0, 25, COLOR.primary);
    head;

    makeLabel('body', this.node, '🧑', 24, 0, 0);

    const bubble = makeNode('bubble', this.node, 70, 30, 55, 30);
    makeLabel('want', bubble, dish.name, 14, 0, 0, COLOR.text);

    this.satBar = makeRect('sat', this.node, 60, 6, 0, -48, COLOR.green);
  }

  get state(): CustomerState { return this._state; }
  get satisfaction(): number {
    return Math.max(0, Math.round(MAX_SATISFACTION - (MAX_SATISFACTION / this.maxWait) * this.waitTimer));
  }
  get paid(): number { return paidAmount(this.price, this.satisfaction); }
  get wantsLeavesUpset(): boolean { return this.satisfaction <= 0 && this._state === CustomerState.ORDERING; }
  get isGone(): boolean { return this._state === CustomerState.GONE; }

  update(dt: number): void {
    if (this._state === CustomerState.ORDERING) {
      this.waitTimer += dt;
      if (this.wantsLeavesUpset) {
        this._state = CustomerState.LEAVING;
        this.node.setPosition(this.node.position.x - 200 * dt, this.node.position.y);
      }
    } else if (this._state === CustomerState.EATING) {
      this.eatTimer += dt;
      if (this.eatTimer >= 3) {
        this._state = CustomerState.LEAVING;
        this.node.setPosition(this.node.position.x - 200 * dt, this.node.position.y);
      }
    } else if (this._state === CustomerState.LEAVING) {
      this.node.setPosition(this.node.position.x - 200 * dt, this.node.position.y);
      // 走出屏幕左侧后通知 Main 收钱并移除
      if (this.node.position.x < -500) {
        this.onLeave(this);
      }
    }
    this.updateSatBar();
  }

  serve(): void {
    if (this._state !== CustomerState.ORDERING) return;
    this._state = CustomerState.EATING;
    this.eatTimer = 0;
  }

  private updateSatBar(): void {
    if (!this.satBar.isValid) return;
    const g = this.satBar.getComponent(Graphics)!;
    g.clear();
    g.fillColor = this.satisfaction > 50 ? COLOR.green : this.satisfaction > 25 ? COLOR.accent : COLOR.red;
    const w = (this.satisfaction / MAX_SATISFACTION) * 60;
    g.rect(-w / 2, -3, w, 6);
    g.fill();
  }

  markGone(): void {
    if (this._state === CustomerState.GONE) return;
    this._state = CustomerState.GONE;
    this.node.destroy();
  }
}
