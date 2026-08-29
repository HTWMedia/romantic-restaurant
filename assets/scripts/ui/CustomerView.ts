import { Color, Graphics, Label, Node, tween, Tween, UITransform, Vec3 } from 'cc';
import { CustomerState, Dish } from '../core/types';
import {
  DEFAULT_MAX_WAIT, MAX_SATISFACTION, paidAmount, satisfactionAfterWaiting,
} from '../core/satisfaction';
import { COLOR, lerpColor, makeLabel, makeNode, makeRect, roundRect } from './Widgets';
import { ArtService } from './ArtView';

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
  private floatNode: Node | null = null;
  private floatTween: Tween<Node> | null = null;
  private plateNode: Node | null = null;

  constructor(
    parent: Node, x: number, y: number,
    readonly dish: Dish,
    readonly tableIndex: number,
    readonly artKey: string,
    private tableX: number,
    private tableY: number,
    private onLeave: (c: CustomerView) => void,
  ) {
    this.price = dish.price;
    const hasArt = ArtService.hasArt(this.artKey);

    this.node = hasArt
      ? makeNode('customer', parent, 60, 80, x, y)
      : roundRect('customer', parent, 60, 80, x, y, 20, COLOR.panel, COLOR.border);

    if (hasArt) {
      const float = makeNode('float', this.node, 60, 80, 0, 0);
      const sp = ArtService.makeSprite(float, this.artKey, 64, 88, 0, 0, 'cust-art');
      if (sp) {
        this.node.setPosition(x, y);
        this.floatNode = float;
        this.floatTween = tween(float)
          .repeatForever(
            tween(float).to(1.2, { position: new Vec3(0, 4, 0) })
              .to(1.2, { position: new Vec3(0, -4, 0) }),
          ).start();
      }
    } else {
      const head = roundRect('head', this.node, 30, 30, 0, 22, 10, COLOR.primary, new Color(235, 120, 80, 255));
      head;
      makeLabel('face', this.node, '🙂', 18, 0, 4, COLOR.white);
    }

    // 气泡（圆角 + 小三角），显示所点菜名（有菜图加缩略图）
    const hasDishArt = ArtService.hasArt(dish.artKey);
    const bw = hasDishArt ? 104 : 70;
    const bubble = makeNode('bubble', this.node, bw, 30, 55, 30);
    const b = bubble.addComponent(Graphics);
    b.fillColor = COLOR.white;
    b.roundRect(-bw / 2, -15, bw, 30, 10);
    b.fill();
    b.moveTo(-18, -15);
    b.lineTo(-26, -25);
    b.lineTo(-10, -15);
    b.close();
    b.fill();
    if (hasDishArt) {
      ArtService.makeSprite(bubble, dish.artKey, 26, 26, -bw / 2 + 16, 0, 'bubble-dish');
      makeLabel('want', bubble, `${dish.name}`, 13, -bw / 2 + 38, 0, COLOR.text);
    } else {
      makeLabel('want', bubble, dish.name, 14, 0, 0, COLOR.text);
    }

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
      if (this.floatTween) {
        this.floatTween.stop();
        this.floatTween = null;
        if (this.floatNode) this.floatNode.setPosition(0, 0);
      }
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
    if (ArtService.hasArt(this.dish.artKey) && this.node.parent) {
      this.plateNode = ArtService.makeSprite(
        this.node.parent, this.dish.artKey, 48, 48, this.tableX, this.tableY + 14, 'served-plate',
      );
    }
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
    if (this.floatTween) {
      this.floatTween.stop();
      this.floatTween = null;
    }
    if (this.plateNode) {
      this.plateNode.destroy();
      this.plateNode = null;
    }
    this.node.destroy();
  }

  /** 上菜收款时的飘字演出：上方弹出 +金额 */
  showPay(amount: number): void {
    const lab = makeLabel('pay', this.node, `+${amount}🪙`, 18, 0, 42, COLOR.accent);
    lab.isBold = true;
    tween(lab.node)
      .to(0.7, { position: new Vec3(0, 95, 0) })
      .call(() => lab.node.destroy())
      .start();
    tween(this.node)
      .to(0.1, { scale: new Vec3(1.12, 1.12, 1) })
      .to(0.1, { scale: new Vec3(1, 1, 1) })
      .start();
  }
}
