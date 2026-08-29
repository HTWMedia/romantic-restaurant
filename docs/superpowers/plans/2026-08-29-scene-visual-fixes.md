# Scene Visual Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修正预览反馈的视觉/站位问题（桌上摆盘、顾客贴桌、同屏形象不重复、菜单图缩小、背景收小留暗边），不改做菜→上菜玩法循环。

**Architecture:** 仅改 UI 渲染层（`CustomerView` / `Main` / `MenuView`），不触动厨房、收费、章节逻辑。上菜后的桌上摆盘由 `CustomerView` 自身生命周期管理（进入 EATING 时渲染、离开时销毁），与顾客节点解耦到主场景坐标。

**Tech Stack:** Cocos Creator 3.8.8 TypeScript；复用现有 `ArtService`（`makeSprite` / `hasArt`）、`Widgets`（`makeRect` / `roundRect` / `makeLabel`）。

## Global Constraints

- 编辑代码禁用 `Array.prototype.includes`（lib 仅到 ES2015）；`?.` / `??` 允许。（`ui/*` 文件可 import `cc`，此约束仅针对 `core/*`）
- 回退铁律：任何 `artKey` 缺图时该处必须回退（emoji / 矢量 / 不渲染），游戏永不因缺图中断。
- 提交用英文 conventional-style 中性表述（如 "fix scene layout" / "render served plate on table"），不出现内部实现名。
- UI 依赖 `cc`，vitest 无法加载；本计划不新增单测。验证用：`npm test`（回归）+ 编辑器 tsc `assets/**` 0 错误（引擎 `cc.d.ts` / `vitest` / `storage.test` 噪声忽略）。

---

### Task 1: 上菜后桌上摆盘（CustomerView）

**Files:**
- Modify: `assets/scripts/ui/CustomerView.ts`（构造函数、`serve()`、`markGone()`，新增字段）

**Interfaces:**
- Consumes: `ArtService.makeSprite(parent, key, w, h, x, y, name?)`、`ArtService.hasArt(key)`（来自 `ArtService`，`ArtView.ts`）
- Produces: `CustomerView` 新构造签名 `(parent, x, y, dish, tableIndex, artKey, tableX, tableY, onLeave)`；`readonly artKey`（供 Task 2 去重）；其余外部行为不变。

- [ ] **Step 1: 新增 plate 字段**
  在 `private floatTween: Tween<Node> | null = null;` 下方加一行：
  ```ts
  private plateNode: Node | null = null;
  ```

- [ ] **Step 2: 改构造函数签名与 artKey 取值**
  将构造函数签名改为接收 `artKey`、`tableX`、`tableY`，并直接用传入的 `artKey`（去掉内部随机）：
  ```ts
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
  ```
  （其余构造函数体保持不变：节点创建、float 动画、气泡、满意度条均原样保留，仅首行 `const artKey = CUSTOMER_ART[...]` 删除，改用上方 `this.artKey`。）

- [ ] **Step 3: `serve()` 渲染桌上摆盘**
  用以下方法替换原 `serve()`：
  ```ts
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
  ```
  （缺 `dish.artKey` 图时 `plateNode` 保持 `null`，不渲染——满足回退铁律。）

- [ ] **Step 4: `markGone()` 销毁摆盘**
  在 `markGone()` 的 `this.node.destroy();` 之前插入：
  ```ts
  if (this.plateNode) {
    this.plateNode.destroy();
    this.plateNode = null;
  }
  ```

- [ ] **Step 5: 验证**
  运行编辑器 tsc（`node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json`），确认 `assets/` 下 0 错误。
  运行 `npm test`，预期 `Tests 29 passed`。
  预期：无新增单测，仅类型/回归。

- [ ] **Step 6: 提交**
  ```bash
  git add assets/scripts/ui/CustomerView.ts
  git commit -m "feat: render served dish on table when customer eats"
  ```

---

### Task 2: 顾客贴桌 + 同屏形象不重复（Main）

**Files:**
- Modify: `assets/scripts/ui/Main.ts`（新增 `CUSTOMER_ART` 导入；替换 `updateSpawn()`）

**Interfaces:**
- Consumes: `CustomerView` 新构造签名（Task 1 产出）；`CUSTOMER_ART`（来自 `core/art`）
- Produces: `updateSpawn` 现在传入 `artKey`（去重）与 `table.x, -40`（桌面坐标）。

- [ ] **Step 1: 导入 CUSTOMER_ART**
  在 `Main.ts` 顶部 import 区加入：
  ```ts
  import { CUSTOMER_ART } from '../core/art';
  ```
  （放在 `import { ArtService } from './ArtView';` 附近。）

- [ ] **Step 2: 替换 updateSpawn（贴桌站位 + 形象去重）**
  用以下方法替换原 `updateSpawn`（原方法约 246–267 行）：
  ```ts
  private updateSpawn(dt: number): void {
    const maxCustomers = this.tables.length;
    if (this.customers.length >= maxCustomers) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = 3 + Math.random() * 4;

    const avail = this.data.availableDishes;
    const dish = avail[Math.floor(Math.random() * avail.length)];
    let tableIndex = -1;
    for (let i = 0; i < this.tables.length; i++) {
      if (!this.customers.some(c => c.tableIndex === i)) { tableIndex = i; break; }
    }
    if (tableIndex < 0) return;
    const table = this.tables[tableIndex];
    // 同屏形象去重：排除当前在场角色
    const used = this.customers.map(c => c.artKey);
    const pool = CUSTOMER_ART.filter(a => used.indexOf(a) === -1);
    const artKey = pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : CUSTOMER_ART[Math.floor(Math.random() * CUSTOMER_ART.length)];
    const c = new CustomerView(
      this.node, table.x + 64, -6, dish, tableIndex, artKey, table.x, -40,
      c2 => this.onCustomerLeave(c2),
    );
    this.customers.push(c);
    this.refreshHud();
  }
  ```
  说明：站位从 `table.x + 200, 40` 改为 `table.x + 64, -6`（站桌右侧、贴近桌面高度）；`CUSTOMER_ART.filter(... used.indexOf(a) === -1)` 仅用 `indexOf`（不用 `includes`，遵守约束）。

- [ ] **Step 3: 验证**
  编辑器 tsc，确认 `assets/` 下 0 错误；`npm test` 预期 `Tests 29 passed`。

- [ ] **Step 4: 提交**
  ```bash
  git add assets/scripts/ui/Main.ts
  git commit -m "fix: seat customers beside table and avoid duplicate avatars"
  ```

---

### Task 3: 菜单主视觉缩小（MenuView）

**Files:**
- Modify: `assets/scripts/ui/MenuView.ts`（`rebuild` 内两处菜品图尺寸、`darken` 尺寸）

**Interfaces:**
- Consumes: `ArtService.makeSprite`、`ArtService.attachIconSprite`（既有）
- Produces: 菜单卡主视觉由 64×64 改为 52×52，其余布局/字号不变。

- [ ] **Step 1: 可用卡主视觉 64→52**
  `rebuild` 中可用卡分支（约第 30 行）：
  ```ts
  const art = ArtService.makeSprite(card, d.artKey, 64, 64, 0, 8, 'dish-art');
  ```
  改为：
  ```ts
  const art = ArtService.makeSprite(card, d.artKey, 52, 52, 0, 6, 'dish-art');
  ```

- [ ] **Step 2: 锁定卡主视觉 64→52**
  锁定卡分支（约第 49 行）同样：
  ```ts
  const art = ArtService.makeSprite(card, d.artKey, 64, 64, 0, 8, 'dish-art');
  ```
  改为：
  ```ts
  const art = ArtService.makeSprite(card, d.artKey, 52, 52, 0, 6, 'dish-art');
  ```

- [ ] **Step 3: darken 罩同步 64→52**
  `darken` 方法（约第 70 行）：
  ```ts
  makeRect('lock-veil', card, 64, 64, 0, 8, new Color(90, 70, 50, 90));
  ```
  改为：
  ```ts
  makeRect('lock-veil', card, 52, 52, 0, 6, new Color(90, 70, 50, 90));
  ```

- [ ] **Step 4: 验证**
  编辑器 tsc，确认 `assets/` 下 0 错误；`npm test` 预期 `Tests 29 passed`。

- [ ] **Step 5: 提交**
  ```bash
  git add assets/scripts/ui/MenuView.ts
  git commit -m "fix: shrink menu dish art to 52x52"
  ```

---

### Task 4: 背景收小留暗边（Main）

**Files:**
- Modify: `assets/scripts/ui/Main.ts`（`buildBackground`、`applySkin` 皮肤染色层尺寸/层级）

**Interfaces:**
- Consumes: `makeRect`、`COLOR`、`ArtService.makeSprite`（既有）
- Produces: `bg` 显示 900×600 居中；新增全屏暗底 960×640 置于最底层；染色层随之调整尺寸与层级。

- [ ] **Step 1: 重写 buildBackground（缩小 + 暗底）**
  用以下方法替换原 `buildBackground`（约 194–202 行）：
  ```ts
  private buildBackground(): void {
    const frame = makeRect('bg-frame', this.node, 960, 640, 0, 0, new Color(20, 16, 24, 255));
    frame.setSiblingIndex(0);
    const art = ArtService.makeSprite(this.node, 'bg', 900, 600, 0, 0, 'bg');
    if (art) {
      art.setSiblingIndex(1);
      return;
    }
    const rect = makeRect('bg', this.node, 900, 600, 0, 0, COLOR.bg);
    rect.setSiblingIndex(1);
  }
  ```

- [ ] **Step 2: applySkin 染色层尺寸与层级**
  在 `applySkin` 内，将（约第 393 行）：
  ```ts
  tint = makeRect('skin-tint', this.node, 960, 640, 0, 0, bg);
  tint.setSiblingIndex(1);
  ```
  改为：
  ```ts
  tint = makeRect('skin-tint', this.node, 900, 600, 0, 0, bg);
  tint.setSiblingIndex(2);
  ```
  并将 `applySkin` 内装饰节点 `setSiblingIndex(2)`（约 401、406 行）改为 `setSiblingIndex(3)`，使层级顺序为 `frame(0) < bg(1) < tint(2) < decor(3)`，装饰仍在染色层之上。

- [ ] **Step 3: 验证**
  编辑器 tsc，确认 `assets/` 下 0 错误；`npm test` 预期 `Tests 29 passed`。

- [ ] **Step 4: 提交**
  ```bash
  git add assets/scripts/ui/Main.ts
  git commit -m "fix: shrink background and add dark frame"
  ```

---

## Self-Review Notes

- 四个任务各自独立可测（tsc + 回归），互不阻塞；Task 2 依赖 Task 1 的新构造签名，顺序执行即可。
- 回退铁律在 Task 1（`serve()` 缺图不渲染摆盘）与既有逻辑中均满足。
- 未使用 `Array.prototype.includes`（Task 2 用 `indexOf`）。
- 预览人工目检项（桌上摆盘出现/消失、站位、去重、菜单图大小、暗边）在实现后由用户在 `http://localhost:7456/` 确认。
