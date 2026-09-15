import { Button, Color, Graphics, Label, Node, tween, Tween, UIOpacity, UITransform, Vec3 } from 'cc';
import { CustomerState, Dish } from '../core/types';
import {
  DEFAULT_MAX_WAIT, MAX_SATISFACTION, paidAmount, satisfactionAfterWaiting,
} from '../core/satisfaction';
import { COLOR, lerpColor, makeLabel, makeNode, makeRect, roundRect } from './Widgets';
import { VipType } from '../core/specialCustomer';

const EAT_SEC = 8; // 用餐时长（秒）：吃完即离场
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
  private plateShadow: Node | null = null;
  private leaving = false;
  vipType: VipType | null = null;
  private vipBadge: Node | null = null;

  constructor(
    parent: Node, x: number, y: number,
    readonly dish: Dish,
    readonly tableIndex: number,
    readonly artKey: string,
    private tableX: number,
    private tableY: number,
    private onLeave: (c: CustomerView) => void,
    private onShowRecipe?: (dish: Dish) => void,
  ) {
    this.price = dish.price;
    const hasArt = ArtService.hasArt(this.artKey);

    this.node = hasArt
      ? makeNode('customer', parent, 110, 151, x, y)
      : roundRect('customer', parent, 110, 151, x, y, 20, COLOR.panel, COLOR.border);

    if (hasArt) {
      const float = makeNode('float', this.node, 110, 151, 0, 0);
      const sp = ArtService.makeSprite(float, this.artKey, 110, 151, 0, 0, 'cust-art');
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
    // y 偏移要让人像坐桌后时气泡完全露在桌带上方
    const hasDishArt = ArtService.hasArt(dish.artKey);
    const bw = hasDishArt ? 104 : 70;
    const bubble = makeNode('bubble', this.node, bw, 30, 52, 112);
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
    // 点订单气泡弹出研发链路卡；角标提示可点
    bubble.addComponent(Button);
    bubble.on(Button.EventType.CLICK, () => this.onShowRecipe?.(dish));
    makeLabel('bubble-info', bubble, 'ℹ', 13, bw / 2 - 12, 9, COLOR.subtext);

    // 满意度条：深色底衬 + 高亮前景，放在头顶上方（浅色背景上才看得清）
    this.satBg = makeNode('sat-bg', this.node, 64, 10, 0, 72);
    const bg = this.satBg.addComponent(Graphics);
    bg.fillColor = new Color(60, 45, 30, 150);
    bg.roundRect(-32, -5, 64, 10, 5);
    bg.fill();
    const fg = makeNode('sat', this.node, 60, 7, 0, 72);
    this.satBar = fg.addComponent(Graphics);
  }

  get state(): CustomerState { return this._state; }
  get satisfaction(): number {
    return Math.max(0, Math.round(MAX_SATISFACTION - (MAX_SATISFACTION / this.maxWait) * this.waitTimer));
  }
  get paid(): number {
    const mult = this.vipType ? this.vipType.payMult : 1;
    return Math.round(paidAmount(this.price, this.satisfaction) * mult);
  }
  get wantsLeavesUpset(): boolean { return this.satisfaction <= 0 && this._state === CustomerState.ORDERING; }
  get isGone(): boolean { return this._state === CustomerState.GONE; }

  update(dt: number): void {
    if (this.isGone || !this.node.isValid) return;
    if (this._state === CustomerState.ORDERING) {
      this.waitTimer += dt;
      if (this.wantsLeavesUpset) {
        this.startLeave();
      }
    } else if (this._state === CustomerState.EATING) {
      this.eatTimer += dt;
      if (this.eatTimer >= EAT_SEC) {
        this.startLeave();
      }
    } else if (this._state === CustomerState.LEAVING) {
      // 离场动画由 startLeave 的补间驱动（原地渐隐），这里只等回调
    }
    this.updateSatBar();
  }

  /** 离场：原地渐隐 + 轻微左移，避免横穿整个场景与其他顾客叠在一起 */
  private startLeave(): void {
    if (this.leaving || this._state === CustomerState.LEAVING) return;
    this._state = CustomerState.LEAVING;
    if (this.floatTween) {
      this.floatTween.stop();
      this.floatTween = null;
      if (this.floatNode) this.floatNode.setPosition(0, 0);
    }
    const op = this.node.addComponent(UIOpacity);
    op.opacity = 255;
    tween(this.node).by(0.9, { position: new Vec3(-50, 0, 0) }).start();
    tween(op)
      .to(0.9, { opacity: 0 })
      .call(() => this.onLeave(this))
      .start();
  }

  /** 装修加成：调整顾客耐心（等待时长倍率） */
  setPatience(mult: number): void {
    this.maxWait = DEFAULT_MAX_WAIT * mult;
  }

  /** VIP 顾客设置：调整耐心倍率 + 头顶金光角标 */
  setVip(vip: VipType): void {
    this.vipType = vip;
    this.maxWait = DEFAULT_MAX_WAIT * vip.patienceMult;
    // 金色光圈角标
    this.vipBadge = makeNode('vip-badge', this.node, 40, 40, -48, 100);
    const ring = roundRect('vip-ring', this.vipBadge, 28, 28, 0, 0, 14,
      new Color(255, 201, 77, 80), new Color(255, 201, 77, 255));
    ring;
    const lbl = makeLabel('vip-tag', this.vipBadge, vip.glyph, 16, 0, 0, new Color(255, 140, 0, 255));
    lbl.isBold = true;
    // 脉动闪烁
    tween(this.vipBadge)
      .to(0.6, { scale: new Vec3(1.15, 1.15, 1) })
      .to(0.6, { scale: new Vec3(1, 1, 1) })
      .union()
      .repeatForever()
      .start();
  }

  /** 桌位重建（升级）后同步位置：顾客搬到新桌，已上的盘子/投影跟随 */
  syncTable(x: number, tableY: number): void {
    this.tableX = x;
    this.tableY = tableY;
    this.node.setPosition(x, tableY + 52);
    if (this.plateNode) this.plateNode.setPosition(x, this.tableY + 10);
    if (this.plateShadow) this.plateShadow.setPosition(x, this.tableY + 36);
  }

  serve(): void {
    if (this._state !== CustomerState.ORDERING) return;
    this._state = CustomerState.EATING;
    this.eatTimer = 0;
    if (ArtService.hasArt(this.dish.artKey) && this.node.parent) {
      // 投影垫底 + 盘子落在桌面上（桌面 abs 约 -178~-156），盘子在桌沿前、人像之下
      this.plateShadow = makeNode('plate-shadow', this.node.parent, 52, 12, this.tableX, this.tableY + 36);
      const g = this.plateShadow.addComponent(Graphics);
      g.fillColor = COLOR.shadow;
      g.ellipse(0, 0, 26, 6);
      g.fill();
      this.plateNode = ArtService.makeSprite(
        this.node.parent, this.dish.artKey, 44, 44, this.tableX, this.tableY + 10, 'served-plate',
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
    const w = ratio * 58;
    g.fillColor = this.satColor;
    g.roundRect(-w / 2, -3.5, w, 7, 3.5);
    g.fill();
  }

  markGone(): void {
    if (this._state === CustomerState.GONE) return;
    this._state = CustomerState.GONE;
    if (this.floatTween) {
      this.floatTween.stop();
      this.floatTween = null;
    }
    if (this.vipBadge) {
      this.vipBadge.destroy();
      this.vipBadge = null;
    }
    if (this.plateNode) {
      this.plateNode.destroy();
      this.plateNode = null;
    }
    if (this.plateShadow) {
      this.plateShadow.destroy();
      this.plateShadow = null;
    }
    this.node.destroy();
  }

  /** 上菜收款时的飘字演出：上方弹出 +金额，VIP 额外金色弹跳 */
  showPay(amount: number): void {
    const isVip = !!this.vipType;
    const lab = makeLabel('pay', this.node,
      isVip ? `✨+${amount}🪙✨` : `+${amount}🪙`, isVip ? 22 : 18,
      0, 140, isVip ? new Color(255, 180, 0, 255) : COLOR.accent);
    lab.isBold = true;
    tween(lab.node)
      .to(0.7, { position: new Vec3(0, 200, 0) })
      .call(() => lab.node.destroy())
      .start();
    // 弹跳缩放：VIP 更大
    const peak = isVip ? 1.25 : 1.12;
    tween(this.node)
      .to(0.1, { scale: new Vec3(peak, peak, 1) })
      .to(0.15, { scale: new Vec3(0.95, 0.95, 1) })
      .to(0.1, { scale: new Vec3(1, 1, 1) })
      .start();
  }
}
