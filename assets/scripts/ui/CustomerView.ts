import { Color, Graphics, Label, Node, UITransform } from 'cc';
import { CustomerState, Dish } from '../core/types';
import {
  DEFAULT_MAX_WAIT, MAX_SATISFACTION, paidAmount, satisfactionAfterWaiting,
} from '../core/satisfaction';
import { COLOR, lerpColor, makeLabel, makeNode, makeRect, roundRect } from './Widgets';

export class CustomerView {
  node: Node;
  private _state: CustomerState = CustomerState.ORDERING;
  private waitTimer = 0;
  private eatTimer = 0;
  private satBar!: Graphics;
  private satBg!: Node;
  private satColor = new Color();
  private price = 0;
  private maxWait = DEFAULT_MAX_WAIT;

  constructor(
    parent: Node, x: number, y: number,
    readonly dish: Dish,
    readonly tableIndex: number,
    private onLeave: (c: CustomerView) => void,
  ) {
    this.node = roundRect('customer', parent, 60, 80, x, y, 20, COLOR.panel, COLOR.border);
    this.price = dish.price;

    // 头部
    const head = roundRect('head', this.node, 30, 30, 0, 22, 10, COLOR.primary, new Color(235, 120, 80, 255));
    head;
    makeLabel('face', this.node, '🙂', 18, 0, 4, COLOR.white);

    // 气泡（圆角 + 小三角），显示所点菜名
    const bubble = makeNode('bubble', this.node, 70, 30, 55, 30);
    const b = bubble.addComponent(Graphics);
    b.fillColor = COLOR.white;
    b.roundRect(-35, -15, 70, 30, 10);
    b.fill();
    b.moveTo(-18, -15);
    b.lineTo(-26, -25);
    b.lineTo(-10, -15);
    b.close();
    b.fill();
    makeLabel('want', bubble, dish.name, 14, 0, 0, COLOR.text);

    // 满意度条：背景 + 动态前景
    this.satBg = makeRect('sat-bg', this.node, 60, 6, 0, -48, COLOR.border);
    const fg = makeNode('sat', this.node, 60, 6, 0, -48);
    this.satBar = fg.addComponent(Graphics);
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
    if (!this.satBg.isValid) return;
    const ratio = this.satisfaction / MAX_SATISFACTION;
    const g = this.satBar;
    g.clear();
    if (ratio <= 0.5) {
      lerpColor(COLOR.red, COLOR.accent, ratio * 2, this.satColor);
    } else {
      lerpColor(COLOR.accent, COLOR.green, (ratio - 0.5) * 2, this.satColor);
    }
    const w = ratio * 60;
    g.fillColor = this.satColor;
    g.roundRect(-w / 2, -3, w, 6, 3);
    g.fill();
  }

  markGone(): void {
    if (this._state === CustomerState.GONE) return;
    this._state = CustomerState.GONE;
    this.node.destroy();
  }
}
