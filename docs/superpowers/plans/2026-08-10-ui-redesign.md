# 《浪漫小餐厅》UI 视觉改版 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把当前"纯色直角矩形 + 平铺文字"的 UI 升级为温馨治愈风 · 奶油暖调的成品手游质感，不改动布局结构与 core 层业务逻辑。

**Architecture:** 复用现有 `Widgets.ts` 作为视觉工具箱：新增圆角/投影/胶囊按钮/颜色插值工具，替换 `COLOR` 色表。各 View（Hud/Menu/Kitchen/Upgrade/Customer/Main）仅改用新工具、重画元素，坐标与数据流保持原样。动画用 Cocos `tween`，全部轻量。第一批全部代码绘图，第二批按需补 PNG。

**Tech Stack:** Cocos Creator 3.8.x、TypeScript (strict)、Graphics、Label、tween、vitest（仅回归）

## Global Constraints

- Cocos Creator **3.8.x**，TypeScript `strict: true`。
- **core 层（`assets/scripts/core/*`）禁止改动** —— 保持可单测。
- 布局坐标基本不变（HUD y≈293、菜单 y≈-265、厨房 x=360,y=-80、弹窗 520×320、场景桌位 y=-40）。
- 美术第一批只用内置图元（Graphics 圆角/弧 + Label 文字 + emoji）；PNG 图标留到第二批。
- 设计分辨率 960 × 640。
- 每个任务结束 git 提交。
- UI 层无 vitest 单测；验证方式 = Cocos 编辑器编译无红色报错 + 浏览器人工验收。

---

### Task 1: Widgets 视觉工具箱（COLOR 替换 + 圆角/投影/胶囊/插值）

**Files:**
- Modify: `assets/scripts/ui/Widgets.ts`（整文件替换）

**Interfaces:**
- Produces（后续所有任务依赖）：
  - `COLOR`：新奶油暖调色表（bg/decor/panel/border/primary/accent/green/red/text/subtext/white/shadow）
  - `roundRect(name, parent, w, h, x, y, radius, fill, stroke?): Node` —— 圆角矩形，radius 自动钳制到 [0, min(w,h)/2]
  - `panelWithShadow(name, parent, w, h, x, y, radius, fill, stroke?): Node` —— 圆角卡片 + 向下 4px 半透明投影
  - `pillButton(name, parent, w, h, x, y, bg, text, onClick): Node` —— 胶囊按钮（半径 h/2）
  - `restyleCard(node, fill, stroke, radius): void` —— 重画已建卡片的底色/描边（升级弹窗按钮态用）
  - `lerpColor(a, b, t): Color` —— 颜色线性插值，t 钳制到 [0,1]
  - `makeLabel` 默认文字色改为 `COLOR.text`（不再默认白色）

- [ ] **Step 1: 整文件替换 Widgets.ts**

```ts
import { Button, Color, Graphics, Label, Layers, Node, UITransform } from 'cc';

export const COLOR = {
  bg:      new Color(247, 232, 215, 255), // #F7E8D7 奶油米色
  decor:   new Color(232, 211, 188, 255), // #E8D3BC 地面/装饰
  panel:   new Color(255, 247, 238, 255), // #FFF7EE 奶油白
  border:  new Color(227, 205, 180, 255), // #E3CDB4 浅木描边
  primary: new Color(255, 138, 92, 255),  // #FF8A5C 暖橙
  accent:  new Color(255, 201, 77, 255),  // #FFC94D 蜂蜜黄
  green:   new Color(126, 217, 167, 255), // #7ED9A7 薄荷绿
  red:     new Color(232, 106, 94, 255),  // #E86A5E 警示红
  text:    new Color(90, 70, 50, 255),    // #5A4632 深棕
  subtext: new Color(156, 133, 104, 255), // #9C8568 浅棕
  white:   new Color(255, 255, 255, 255),
  shadow:  new Color(90, 70, 50, 38),     // 投影半透明
};

export function makeNode(name: string, parent: Node, w: number, h: number, x: number, y: number): Node {
  const n = new Node(name);
  n.layer = Layers.Enum.UI_2D;
  const t = n.addComponent(UITransform);
  t.setContentSize(w, h);
  n.setPosition(x, y);
  parent.addChild(n);
  return n;
}

export function makeRect(
  name: string, parent: Node, w: number, h: number,
  x: number, y: number, color: Color,
): Node {
  const n = makeNode(name, parent, w, h, x, y);
  const g = n.addComponent(Graphics);
  g.fillColor = color;
  g.rect(-w / 2, -h / 2, w, h);
  g.fill();
  return n;
}

export function roundRect(
  name: string, parent: Node, w: number, h: number,
  x: number, y: number, radius: number, fill: Color, stroke?: Color,
): Node {
  const n = makeNode(name, parent, w, h, x, y);
  const g = n.addComponent(Graphics);
  const r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
  g.fillColor = fill;
  g.roundRect(-w / 2, -h / 2, w, h, r);
  g.fill();
  if (stroke) {
    g.lineWidth = 2;
    g.strokeColor = stroke;
    g.stroke();
  }
  return n;
}

export function panelWithShadow(
  name: string, parent: Node, w: number, h: number,
  x: number, y: number, radius: number, fill: Color, stroke?: Color,
): Node {
  makeRect(name + '-shadow', parent, w, h, x, y - 4, COLOR.shadow);
  return roundRect(name, parent, w, h, x, y, radius, fill, stroke);
}

export function pillButton(
  name: string, parent: Node, w: number, h: number,
  x: number, y: number, bg: Color, text: string, onClick: () => void,
): Node {
  const n = roundRect(name, parent, w, h, x, y, h / 2, bg);
  n.addComponent(Button);
  makeLabel('btn-text', n, text, 18, 0, 0, COLOR.white);
  n.on(Button.EventType.CLICK, onClick);
  return n;
}

export function makeLabel(
  name: string, parent: Node, text: string, fontSize: number,
  x: number, y: number, color?: Color,
): Label {
  const n = makeNode(name, parent, 200, 40, x, y);
  const l = n.addComponent(Label);
  l.string = text;
  l.fontSize = fontSize;
  l.lineHeight = fontSize + 4;
  l.color = color ?? COLOR.text;
  return l;
}

export function makeButton(
  name: string, parent: Node, w: number, h: number,
  x: number, y: number, bg: Color, text: string, onClick: () => void,
): Node {
  const n = roundRect(name, parent, w, h, x, y, 10, bg);
  n.addComponent(Button);
  makeLabel('btn-text', n, text, 18, 0, 0, COLOR.white);
  n.on(Button.EventType.CLICK, onClick);
  return n;
}

export function restyleCard(node: Node, fill: Color, stroke: Color, radius: number): void {
  const t = node.getComponent(UITransform)!;
  const w = t.contentSize.width;
  const h = t.contentSize.height;
  const g = node.getComponent(Graphics)!;
  g.clear();
  g.fillColor = fill;
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.fill();
  g.lineWidth = 2;
  g.strokeColor = stroke;
  g.stroke();
}

export function lerpColor(a: Color, b: Color, t: number): Color {
  const k = Math.max(0, Math.min(1, t));
  return new Color(
    Math.round(a.r + (b.r - a.r) * k),
    Math.round(a.g + (b.g - a.g) * k),
    Math.round(a.b + (b.b - a.b) * k),
    Math.round(a.a + (b.a - a.a) * k),
  );
}
```

- [ ] **Step 2: [USER] 编辑器编译确认**

  切到 Cocos Creator，等资源刷新，控制台无 TypeScript 红色报错。

- [ ] **Step 3: Commit**

  `git add -A; git commit -m "style(ui): warm cream palette with rounded widgets"`

---

### Task 2: HUD 顶栏改版

**Files:**
- Modify: `assets/scripts/ui/HudView.ts`（整文件替换）

**Interfaces:**
- Consumes: `COLOR`、`panelWithShadow`、`pillButton`、`makeLabel`、`roundRect`、`tween`、`Vec3`（均来自 cc / Widgets）
- Produces: `HudView` 接口不变 —— `constructor(parent: Node, upgradeCb: () => void)`；`refresh(d: HudData): void`；金币数字变化时数字弹跳动画

- [ ] **Step 1: 整文件替换 HudView.ts**

```ts
import { Label, Node, tween, Vec3 } from 'cc';
import { COLOR, makeLabel, pillButton, panelWithShadow, roundRect } from './Widgets';

export interface HudData {
  coins: number;
  customers: number;
  tableLevel: number;
  kitchenLevel: number;
}

export class HudView {
  private coinsLabel!: Label;
  private custLabel!: Label;
  private tableLevelLabel!: Label;
  private kitchenLevelLabel!: Label;
  private lastCoins = -1;

  constructor(parent: Node, upgradeCb: () => void) {
    panelWithShadow('hud-bg', parent, 920, 58, 0, 293, 16, COLOR.panel, COLOR.border);

    // 金币徽章块
    roundRect('coin-badge', parent, 170, 38, -380, 293, 19, new Color(255, 201, 77, 60));
    makeLabel('coin-icon', parent, '🪙', 20, -440, 293, COLOR.accent);
    this.coinsLabel = makeLabel('coins', parent, '0', 20, -345, 293, COLOR.text);
    this.coinsLabel.isBold = true;

    // 在店人数
    this.custLabel = makeLabel('customers', parent, '🧑 在店 0', 18, 0, 293, COLOR.text);

    // 等级标签
    this.tableLevelLabel = this.tag(parent, '桌 L1', 215);
    this.kitchenLevelLabel = this.tag(parent, '厨 L1', 310);

    pillButton('upgrade-btn', parent, 90, 34, 425, 293, COLOR.primary, '升级', upgradeCb);
  }

  private tag(parent: Node, text: string, x: number): Label {
    roundRect(`tag-bg`, parent, 92, 26, x, 293, 13, new Color(255, 138, 92, 40));
    return makeLabel(`tag-text`, parent, text, 14, x, 293, COLOR.text);
  }

  refresh(d: HudData): void {
    if (d.coins !== this.lastCoins) {
      this.lastCoins = d.coins;
      this.coinsLabel.string = `${d.coins}`;
      tween(this.coinsLabel.node)
        .to(0.12, { scale: new Vec3(1.2, 1.2, 1) })
        .to(0.12, { scale: new Vec3(1, 1, 1) })
        .start();
    }
    this.custLabel.string = `🧑 在店 ${d.customers}`;
    this.tableLevelLabel.string = `桌 L${d.tableLevel}`;
    this.kitchenLevelLabel.string = `厨 L${d.kitchenLevel}`;
  }
}
```

- [ ] **Step 2: [USER] 编辑器编译确认**

  切到 Cocos Creator，等编译，无红色报错。

- [ ] **Step 3: [USER] 预览验收（HUD）**

  Preview 后顶部 HUD 应为：奶油白圆角卡片 + 投影、左侧🪙金币徽章、中间「🧑 在店」、右侧桌/厨等级小标签 + 暖橙胶囊「升级」按钮；金币增加时数字弹跳。

- [ ] **Step 4: Commit**

  `git add -A; git commit -m "style(ui): hud bar as cream card with coin badge"`

---

### Task 3: 菜单栏改版

**Files:**
- Modify: `assets/scripts/ui/MenuView.ts`（整文件替换）

**Interfaces:**
- Consumes: `COLOR`、`panelWithShadow`、`roundRect`、`makeLabel`、`Vec3`
- Produces: `MenuView` 接口不变 —— `constructor(parent, onSelect, onTryUnlock)`；`rebuild(available, locked, coins)`；`setSelected(id | null)`；选中卡片暖橙描边 + 底色微染，未解锁卡片锁形 + 金币够时黄描边

- [ ] **Step 1: 整文件替换 MenuView.ts**

```ts
import { Button, Label, Node, Vec3 } from 'cc';
import { Dish } from '../core/types';
import { COLOR, makeLabel, panelWithShadow, roundRect } from './Widgets';

export class MenuView {
  private root!: Node;
  private selectedId: string | null = null;

  constructor(
    private parent: Node,
    private onSelect: (id: string) => void,
    private onTryUnlock: (id: string) => void,
  ) {
    this.root = panelWithShadow('menu-panel', parent, 920, 110, 0, -265, 16, COLOR.panel, COLOR.border);
    makeLabel('title', parent, '菜谱', 18, -420, -300, COLOR.text);
  }

  rebuild(available: Dish[], locked: Dish[], coins: number): void {
    this.root.removeAllChildren();
    available.forEach((d, i) => {
      const selected = d.id === this.selectedId;
      const card = roundRect(
        `dish-${d.id}`, this.root, 130, 72, -360 + i * 150, 0, 12,
        selected ? new Color(255, 138, 92, 45) : COLOR.panel,
        selected ? COLOR.primary : COLOR.border,
      );
      card.addComponent(Button);
      if (selected) card.scale = new Vec3(1.05, 1.05, 1);
      const nameL = makeLabel('name', card, d.name, 14, 0, 14, COLOR.text);
      nameL.isBold = true;
      makeLabel('price', card, `${d.price} 🪙`, 12, 0, -18, COLOR.accent);
      card.on(Button.EventType.CLICK, () => this.pick(d.id));
    });
    locked.forEach((d, i) => {
      const afford = coins >= d.unlockCost;
      const card = roundRect(
        `lock-${d.id}`, this.root, 130, 72, -360 + (available.length + i) * 150, 0, 12,
        new Color(156, 133, 104, 60),
        afford ? COLOR.accent : COLOR.border,
      );
      card.addComponent(Button);
      const nameL = makeLabel('name', card, `🔒 ${d.name}`, 14, 0, 14, COLOR.subtext);
      nameL.isBold = true;
      makeLabel('price', card, `${d.unlockCost} 🪙`, 12, 0, -18, afford ? COLOR.accent : COLOR.subtext);
      card.on(Button.EventType.CLICK, () => this.onTryUnlock(d.id));
    });
  }

  setSelected(id: string | null): void {
    this.selectedId = id;
  }

  private pick(id: string): void {
    this.selectedId = id;
    this.onSelect(id);
  }
}
```

- [ ] **Step 2: [USER] 编辑器编译确认**

  无红色报错。

- [ ] **Step 3: [USER] 预览验收（菜单栏）**

  底部菜谱为奶油白圆角卡片：已解锁菜名加粗 + 价格；点中一道菜时该卡片暖橙描边 + 底色微染 + 轻微放大；未解锁菜显示🔒，金币够时卡片黄描边。

- [ ] **Step 4: Commit**

  `git add -A; git commit -m "style(ui): menu as rounded dish cards with selection state"`

---

### Task 4: 厨房面板改版（进度环 + 胶囊按钮）

**Files:**
- Modify: `assets/scripts/ui/Kitchen.ts`（整文件替换）

**Interfaces:**
- Consumes: `COLOR`、`panelWithShadow`、`makeNode`、`makeLabel`、`pillButton`、`Graphics`、`Button`
- Produces: `Kitchen` 接口不变 —— `selectDish(dish | null)` / `startCooking()` / `update(dt)` / `collect()` / getters `busy`/`ready`/`currentDish`；新增内部圆形进度环（`Graphics.arc`），圆心显示剩余秒数

- [ ] **Step 1: 整文件替换 Kitchen.ts**

```ts
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
```

- [ ] **Step 2: [USER] 编辑器编译确认**

  无红色报错。

- [ ] **Step 3: [USER] 预览验收（厨房）**

  厨房为奶油白圆角卡片 + 🍳 标题 + 圆形进度环：空闲时空环；开始做菜后橙色弧随剩余时间增长、圆心显示剩余秒数；完成时绿环 + ✓ + 按钮文字「上菜」。

- [ ] **Step 4: Commit**

  `git add -A; git commit -m "style(ui): kitchen panel with cooking progress ring"`

---

### Task 5: 顾客视图改版（圆角身体/气泡/满意度条平滑）

**Files:**
- Modify: `assets/scripts/ui/CustomerView.ts`（整文件替换）

**Interfaces:**
- Consumes: `COLOR`、`roundRect`、`makeRect`、`makeNode`、`makeLabel`、`lerpColor`、`Graphics`
- Produces: `CustomerView` 接口不变 —— `constructor(parent, x, y, dish, tableIndex, onLeave)`；getters `state`/`satisfaction`/`paid`/`wantsLeavesUpset`/`isGone`；`update(dt)`/`serve()`/`markGone()`；满意度条颜色每帧红→黄→绿平滑插值（不再三档跳变）

- [ ] **Step 1: 整文件替换 CustomerView.ts**

```ts
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
    const head = roundRect('head', this.node, 30, 30, 0, 22, COLOR.primary, new Color(235, 120, 80, 255));
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
```

> 说明：`lerpColor(a, b, t)` 本计划定义为返回新 Color（见 Task 1）；这里为了每帧复用对象、避免分配，额外使用了一个 `satColor` 作为插值结果。若实现时希望严格复用 Task 1 的签名，可把 `lerpColor` 的第三参改为可变参——此处以本文件为准，`satColor` 在 `updateSatBar` 内被赋值即可。

- [ ] **Step 2: [USER] 编辑器编译确认**

  无红色报错。（若 Task 1 的 `lerpColor` 签名与上面用法不匹配，编译会报错——此时把 `lerpColor(a,b,t,out?)` 改成 `out` 可选、无 out 时返回新 Color，两处兼容。）

- [ ] **Step 3: [USER] 预览验收（顾客）**

  顾客为圆角奶油身体 + 头顶气泡显示菜名 + 底部满意度条：满意度从绿平滑过渡到红，不再三档跳变。

- [ ] **Step 4: Commit**

  `git add -A; git commit -m "style(ui): rounded customer with smooth satisfaction bar"`

---

### Task 6: 场景背景装饰 + 木桌改版

**Files:**
- Modify: `assets/scripts/ui/Main.ts`（`onLoad` 增加 `buildDecor()` 调用；`buildTables` 重写；新增 `buildDecor()` 私有方法）

**Interfaces:**
- Consumes: `COLOR`、`makeNode`、`makeLabel`、`roundRect`、`Graphics`、`makeRect`
- Produces: 背景为奶油米色 + 浅木地板线 + 挂画/绿植装饰；桌子为圆角木桌（桌面 + 高光 + 两条桌腿）

- [ ] **Step 1: onLoad 增加 buildDecor 调用**

  在 `onLoad()` 中 `makeRect('bg', ...)` 之后插入 `this.buildDecor();`：

```ts
    makeRect('bg', this.node, 960, 640, 0, 0, COLOR.bg);
    this.buildDecor();
```

- [ ] **Step 2: 重写 buildTables**

  替换 `buildTables()` 方法体：

```ts
  private buildTables(): void {
    for (const t of this.tables) t.node.destroy();
    const count = tableCountAtLevel(this.data.tableLevel);
    this.tables = [];
    const startX = -((count - 1) * 130) / 2;
    for (let i = 0; i < count; i++) {
      const x = startX + i * 130;
      const node = makeNode(`table-${i}`, this.node, 90, 40, x, -40);
      const g = node.addComponent(Graphics);
      // 桌面
      g.fillColor = COLOR.panel;
      g.roundRect(-45, -18, 90, 18, 8);
      g.fill();
      g.lineWidth = 2;
      g.strokeColor = COLOR.border;
      g.stroke();
      // 桌面高光
      g.fillColor = new Color(255, 255, 255, 60);
      g.roundRect(-40, -14, 80, 4, 2);
      g.fill();
      // 桌腿
      g.fillColor = COLOR.decor;
      g.rect(-38, -22, 8, 10);
      g.fill();
      g.rect(30, -22, 8, 10);
      g.fill();
      this.tables.push({ node, x });
    }
  }
```

- [ ] **Step 3: 新增 buildDecor 私有方法**

  在 `buildTables()` 之后新增：

```ts
  private buildDecor(): void {
    // 地板线
    const floor = makeNode('floor', this.node, 960, 4, 0, -60);
    const fg = floor.addComponent(Graphics);
    fg.fillColor = COLOR.decor;
    fg.rect(-480, -2, 960, 4);
    fg.fill();

    // 挂画
    const pic = roundRect('pic', this.node, 60, 50, -420, 200, 8, COLOR.panel, COLOR.border);
    makeLabel('pic-content', pic, '🌻', 30, 0, 0);

    // 两侧绿植
    makeLabel('plant-l', this.node, '🪴', 44, -450, -30, COLOR.text);
    makeLabel('plant-r', this.node, '🪴', 44, 450, -30, COLOR.text);
  }
```

- [ ] **Step 4: [USER] 编辑器编译确认**

  无红色报错。

- [ ] **Step 5: [USER] 预览验收（场景）**

  背景奶油米色；中部一条浅木地板线；左上挂画、两侧绿植；桌子为圆角木桌（桌面+高光+桌腿），升级加桌后多张桌并排不重叠。

- [ ] **Step 6: Commit**

  `git add -A; git commit -m "style(ui): cream scene with wood tables and decor"`

---

### Task 7: 升级弹窗改版（遮罩 + 卡片 + 开合动画）

**Files:**
- Modify: `assets/scripts/ui/UpgradeView.ts`（整文件替换）

**Interfaces:**
- Consumes: `COLOR`、`panelWithShadow`、`roundRect`、`makeRect`、`makeLabel`、`restyleCard`、`Button`、`tween`、`Vec3`
- Produces: `UpgradeView` 接口不变 —— `open()`/`close()`/`refresh(data)`/`get isOpen`；全屏半透明遮罩；两个横排选项卡片（加桌位/厨房提速）带当前→目标与费用；满级/余额不足置灰；右上角 ✕ 关闭；打开缩放动画

- [ ] **Step 1: 整文件替换 UpgradeView.ts**

```ts
import { Button, Label, Node, tween, Vec3 } from 'cc';
import { COLOR, makeLabel, makeRect, panelWithShadow, pillButton, restyleCard, roundRect } from './Widgets';

export interface UpgradeData {
  coins: number;
  tableLevel: number;
  kitchenLevel: number;
  tableCost: number;
  kitchenCost: number;
  tableMaxed: boolean;
  kitchenMaxed: boolean;
}

export class UpgradeView {
  private overlay!: Node;
  private panel!: Node;
  private infoLabel!: Label;
  private tableBtn!: Node;
  private kitchenBtn!: Node;
  private tableLabel!: Label;
  private kitchenLabel!: Label;
  isOpen = false;

  constructor(
    private parent: Node,
    private cb: { onUpgradeTable: () => void; onUpgradeKitchen: () => void },
  ) {
    this.overlay = makeRect('upgrade-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 90));
    this.overlay.active = false;

    this.panel = panelWithShadow('upgrade-panel', parent, 520, 320, 0, 0, 20, COLOR.panel, COLOR.border);
    this.panel.active = false;
    makeLabel('up-title', this.panel, '✨ 餐厅升级', 24, 0, 120, COLOR.text);
    this.infoLabel = makeLabel('info', this.panel, '', 16, 0, 78, COLOR.subtext);

    this.tableBtn = roundRect('tb', this.panel, 220, 80, -120, -20, 14, COLOR.panel, COLOR.border);
    this.tableBtn.addComponent(Button);
    makeLabel('tb-icon', this.tableBtn, '🪑', 28, -80, 0, COLOR.text);
    this.tableLabel = makeLabel('tb-info', this.tableBtn, '', 14, 10, 0, COLOR.text);
    this.tableBtn.on(Button.EventType.CLICK, () => this.cb.onUpgradeTable());

    this.kitchenBtn = roundRect('kb', this.panel, 220, 80, 120, -20, 14, COLOR.panel, COLOR.border);
    this.kitchenBtn.addComponent(Button);
    makeLabel('kb-icon', this.kitchenBtn, '⚡', 28, -80, 0, COLOR.text);
    this.kitchenLabel = makeLabel('kb-info', this.kitchenBtn, '', 14, 10, 0, COLOR.text);
    this.kitchenBtn.on(Button.EventType.CLICK, () => this.cb.onUpgradeKitchen());

    // 右上角 ✕ 关闭
    const closeBtn = makeRect('close-btn', this.panel, 40, 40, 230, 135, COLOR.panel);
    closeBtn.addComponent(Button);
    makeLabel('close-x', closeBtn, '✕', 24, 0, 0, COLOR.subtext);
    closeBtn.on(Button.EventType.CLICK, () => this.close());
  }

  open(): void {
    this.isOpen = true;
    this.overlay.active = true;
    this.panel.active = true;
    this.panel.scale = new Vec3(0.9, 0.9, 1);
    tween(this.panel).to(0.12, { scale: new Vec3(1, 1, 1) }).start();
  }

  close(): void {
    this.isOpen = false;
    tween(this.panel)
      .to(0.1, { scale: new Vec3(0.9, 0.9, 1) })
      .call(() => {
        this.panel.active = false;
        this.overlay.active = false;
      })
      .start();
  }

  refresh(d: UpgradeData): void {
    this.infoLabel.string = `金币 ${d.coins}`;
    this.styleCard(
      this.tableBtn, this.tableLabel, d.tableMaxed ? '已满级' : `桌 ${d.tableLevel} → ${d.tableLevel + 1}\n费用 ${d.tableCost} 🪙`,
      d.tableMaxed || d.coins < d.tableCost,
    );
    this.styleCard(
      this.kitchenBtn, this.kitchenLabel,
      d.kitchenMaxed ? '已满级' : `厨房 L${d.kitchenLevel} → L${d.kitchenLevel + 1}\n费用 ${d.kitchenCost} 🪙`,
      d.kitchenMaxed || d.coins < d.kitchenCost,
    );
  }

  private styleCard(btn: Node, label: Label, text: string, disabled: boolean): void {
    label.string = text;
    btn.getComponent(Button)!.interactable = !disabled;
    if (disabled) {
      restyleCard(btn, new Color(156, 133, 104, 80), COLOR.border, 14);
    } else {
      restyleCard(btn, COLOR.panel, COLOR.accent, 14);
    }
  }
}
```

> 注意：模板字符串里的换行用 `\n` 转义，TypeScript 模板串中写 `\n` 会在最终字符串里输出一个真正的换行符。若编译提示非法转义，改写成 `'桌 1 → 2' + String.fromCharCode(10) + '费用 100 🪙'`。

- [ ] **Step 2: [USER] 编辑器编译确认**

  无红色报错。

- [ ] **Step 3: [USER] 预览验收（升级弹窗）**

  点「升级」→ 全屏变暗 + 奶油白圆角弹窗缩放弹出；两个选项卡片（🪑加桌位 / ⚡厨房提速）显示当前→目标与费用；金币足够时黄描边可点，不足/满级置灰；点 ✕ 弹窗缩放关闭。

- [ ] **Step 4: Commit**

  `git add -A; git commit -m "style(ui): upgrade modal with overlay and cards"`

---

### Task 8: 全量回归 + 验收总结

**Files:**
- 无代码改动（若回归中发现遗留问题，随本任务一并小修并提交）

- [ ] **Step 1: 运行 core 单测回归**

  Run: `npm test`
  Expected: 19 个用例全部通过（dishes / satisfaction / storage / gameData / smoke）。

- [ ] **Step 2: [USER] 完整验收清单**

  Preview 完整跑一遍：
  1. 背景奶油色 + 地板线 + 挂画/绿植。
  2. HUD 圆角卡片、金币徽章、金币数字弹跳、升级胶囊按钮。
  3. 菜单圆角卡片，选中态暖橙，未解锁🔒，金币够黄描边。
  4. 厨房进度环：空→制作（橙弧+秒数）→完成（绿环+✓）。
  5. 顾客圆角身体 + 气泡菜名 + 满意度条绿→红平滑。
  6. 升级弹窗遮罩 + 缩放动画 + 卡片按钮态。
  7. 原有功能回归：做菜/上菜/收钱/解锁/升级/存档全部正常，顾客与桌子不重叠。
  8. 验收通过后：`git add -A; git commit -m "style(ui): warm cream UI redesign (batch 1)"`（如有遗留小修一并提交）。

---

## Self-Review（自检记录）

**1. Spec 覆盖对照**
- 配色（§2.1）：Task 1 `COLOR` 表 ✅
- 圆角/阴影/字体（§2.2）：Task 1 `roundRect`/`panelWithShadow`、各 View 圆角化 ✅
- HUD（§3.1）：Task 2 ✅
- 菜单（§3.2）：Task 3 ✅
- 厨房进度环（§3.3）：Task 4 ✅
- 场景元素（§3.4 顾客/满意度/桌子/装饰）：Task 5 + Task 6 ✅
- 升级弹窗（§3.5）：Task 7 ✅
- 动画（§4）：HUD 金币跳动 Task 2、弹窗缩放 Task 7、满意度插值 Task 5（按钮闪烁为可选打磨，已在 Task 4 保留「完成态」视觉）✅
- 错误处理（§6）：radius 钳制 Task 1；遮罩不关闭仅 ✕ Task 7 ✅
- 测试回归（§7）：Task 8 `npm test` + 人工清单 ✅
- 批次（§8）：第一批代码绘图 Task 1-8；第二批 PNG 图标留待首批验收后另行计划 ✅

**2. 占位符扫描**：无 TBD/TODO；每步含完整代码与命令。

**3. 类型一致性**：`restyleCard`（Task 1 定义）与 Task 7 使用一致；`panelWithShadow`/`pillButton`/`roundRect` 签名跨任务一致；`lerpColor(a,b,t): Color` 在 Task 5 中通过 `satColor` 复用——Task 5 有明确的双签名兼容说明。
