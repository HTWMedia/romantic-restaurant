# 合成台（Merge）玩法 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 新增「放置合成」小游戏：HUD「合成台」按钮打开模态面板，产出基础食材、点两格相同合成升阶，首次合成到终阶免费解锁对应菜单菜（pizza/steak/dessert/pasta），与做菜→上菜主循环解耦。

**Architecture:** 纯逻辑放 `core/merge.ts`（链定义 + `mergeNext`）+ `core/gameData.ts`（`mergeUnlockDish` 免费解锁 + `mergeGrid` 存档）；UI 放新文件 `ui/MergeView.ts`（网格/产出/合成交互），经 `HudView` 按钮与 `Main` 接线。终阶复用既有 `dish-*` 美术，基础/中间用 emoji，零新增素材。

**Tech Stack:** Cocos Creator 3.8.8 TypeScript；`Widgets`（`makeRect`/`roundRect`/`makeLabel`/`pillButton`/`makeNode`）、`ArtService`（`makeSprite`/`hasArt`）；vitest 测纯逻辑。

## Global Constraints

- 编辑代码禁用 `Array.prototype.includes`（lib 仅到 ES2015）；`?.` / `??` 允许。（此约束仅针对 `core/*`；`ui/*` 可 import `cc`）
- 回退铁律：任何 `artKey` 缺图必须回退（emoji / 不渲染），游戏永不因缺图中断。
- 提交用英文 conventional-style 中性表述（如 "feat: add merge board"），不出现内部实现名。
- 纯逻辑（Task 1/2）用 vitest TDD；UI（Task 3/4）验证用 `npm test` 回归 + 编辑器 tsc `assets/**` 0 错误（引擎 `cc.d.ts` / `vitest` / `storage.test` 噪声忽略）。
- 测试导入路径约定：`'../../assets/scripts/core/<file>'`（见 `tests/core/art.test.ts`）。

---

### Task 1: 合成链数据 + 纯函数（TDD）

**Files:**
- Create: `assets/scripts/core/merge.ts`
- Test: `tests/core/merge.test.ts`

**Interfaces:**
- Produces: `MERGE_ITEMS: MergeItem[]`、`MERGE_BASE_IDS: string[]`、`mergeItemById(id): MergeItem | undefined`、`mergeNext(id): string | null`（Task 3/4 消费）
- `MergeItem` 形状：`{ id; name; glyph?; artKey?; tier; nextId: string | null; unlocksDishId? }`

- [ ] **Step 1: 写失败测试**
  新建 `tests/core/merge.test.ts`：
  ```ts
  import { describe, it, expect } from 'vitest';
  import { MERGE_ITEMS, MERGE_BASE_IDS, mergeNext, mergeItemById } from '../../assets/scripts/core/merge';

  describe('merge chain', () => {
    it('mergeNext 返回下一阶 id，终点为 null', () => {
      expect(mergeNext('m-veg')).toBe('m-salad');
      expect(mergeNext('m-salad')).toBe('m-pizza');
      expect(mergeNext('m-pizza')).toBeNull();
    });
    it('mergeItemById 命中定义项', () => {
      expect(mergeItemById('m-steak')!.name).toBe('牛排');
      expect(mergeItemById('nope')).toBeUndefined();
    });
    it('基础项均为 tier0 且存在于清单', () => {
      for (const id of MERGE_BASE_IDS) {
        const it = mergeItemById(id)!;
        expect(it.tier).toBe(0);
        expect(MERGE_ITEMS).toContain(it);
      }
    });
    it('每个非基础项都有唯一前驱', () => {
      const bases = new Set(MERGE_BASE_IDS);
      for (const it of MERGE_ITEMS) {
        if (bases.has(it.id)) continue;
        const preds = MERGE_ITEMS.filter(p => p.nextId === it.id);
        expect(preds.length).toBe(1);
      }
    });
    it('每个终点项都解锁一道菜', () => {
      const terminals = MERGE_ITEMS.filter(i => i.nextId === null);
      expect(terminals.length).toBeGreaterThan(0);
      for (const t of terminals) expect(t.unlocksDishId).toBeTruthy();
    });
  });
  ```

- [ ] **Step 2: 运行测试确认失败**
  运行：`npm test`
  预期：FAIL（`Cannot find module '../../assets/scripts/core/merge'`）。

- [ ] **Step 3: 写最小实现**
  新建 `assets/scripts/core/merge.ts`：
  ```ts
  export interface MergeItem {
    id: string;
    name: string;
    glyph?: string;
    artKey?: string;
    tier: number;
    nextId: string | null;
    unlocksDishId?: string;
  }

  export const MERGE_ITEMS: MergeItem[] = [
    // 链 A → pizza
    { id: 'm-veg',    name: '蔬菜',   glyph: '🥬', tier: 0, nextId: 'm-salad' },
    { id: 'm-salad',  name: '沙拉',   glyph: '🥗', tier: 1, nextId: 'm-pizza' },
    { id: 'm-pizza',  name: '披萨',   artKey: 'dish-pizza', tier: 2, nextId: null, unlocksDishId: 'pizza' },
    // 链 B → steak
    { id: 'm-meat',   name: '生肉',   glyph: '🥩', tier: 0, nextId: 'm-stew' },
    { id: 'm-stew',   name: '炖肉',   glyph: '🍲', tier: 1, nextId: 'm-steak' },
    { id: 'm-steak',  name: '牛排',   artKey: 'dish-steak', tier: 2, nextId: null, unlocksDishId: 'steak' },
    // 链 C → dessert
    { id: 'm-dough',  name: '面团',   glyph: '🍞', tier: 0, nextId: 'm-cake' },
    { id: 'm-cake',   name: '蛋糕胚', glyph: '🍰', tier: 1, nextId: 'm-dessert' },
    { id: 'm-dessert',name: '甜品',   artKey: 'dish-dessert', tier: 2, nextId: null, unlocksDishId: 'dessert' },
    // 链 D → pasta
    { id: 'm-cheese', name: '奶酪',   glyph: '🧀', tier: 0, nextId: 'm-pastadough' },
    { id: 'm-pastadough', name: '面坯', glyph: '🥟', tier: 1, nextId: 'm-pasta' },
    { id: 'm-pasta',  name: '意面',   artKey: 'dish-pasta', tier: 2, nextId: null, unlocksDishId: 'pasta' },
  ];

  export const MERGE_BASE_IDS: string[] = ['m-veg', 'm-meat', 'm-dough', 'm-cheese'];

  const BY_ID: Record<string, MergeItem> = {};
  for (const it of MERGE_ITEMS) BY_ID[it.id] = it;

  export function mergeItemById(id: string): MergeItem | undefined {
    return BY_ID[id];
  }

  export function mergeNext(id: string): string | null {
    const it = BY_ID[id];
    return it ? it.nextId : null;
  }
  ```

- [ ] **Step 4: 运行测试确认通过**
  运行：`npm test`
  预期：`Tests 33 passed`（原 29 + 本任务 4）。

- [ ] **Step 5: 提交**
  ```bash
  git add assets/scripts/core/merge.ts tests/core/merge.test.ts
  git commit -m "feat: add merge chain data and lookup"
  ```

---

### Task 2: 免费解锁 + 网格存档（TDD）

**Files:**
- Modify: `assets/scripts/core/types.ts`（`SaveData` 加 `mergeGrid`）
- Modify: `assets/scripts/core/gameData.ts`（字段、`mergeUnlockDish`、`toSave`、构造器）
- Test: `tests/core/gameData.test.ts`（追加 describe）

**Interfaces:**
- Consumes: `MERGE_ITEMS` 的 `unlocksDishId`（Task 1）；`DISHES`（既有）
- Produces: `GameData.mergeUnlockDish(id): boolean`、`GameData.mergeGrid: (string|null)[]`（Task 3/4 消费）

- [ ] **Step 1: 写失败测试（追加到 gameData.test.ts）**
  在 `tests/core/gameData.test.ts` 末尾追加：
  ```ts
  describe('merge unlock + grid persistence', () => {
    it('mergeUnlockDish 免费解锁且不扣金币', () => {
      const g = new GameData();
      const before = g.coins;
      expect(g.dishUnlocked('pizza')).toBe(false);
      expect(g.mergeUnlockDish('pizza')).toBe(true);
      expect(g.dishUnlocked('pizza')).toBe(true);
      expect(g.coins).toBe(before);
      expect(g.mergeUnlockDish('pizza')).toBe(false);
    });
    it('mergeGrid 持久化往返', () => {
      const g = new GameData();
      g.mergeGrid = ['m-veg', null, 'm-pizza', null];
      const g2 = new GameData(g.toSave());
      expect(g2.mergeGrid).toEqual(['m-veg', null, 'm-pizza', null]);
    });
  });
  ```

- [ ] **Step 2: 运行测试确认失败**
  运行：`npm test`
  预期：FAIL（`mergeUnlockDish` / `mergeGrid` 不存在）。

- [ ] **Step 3: 改 types.ts**
  在 `SaveData` 接口（`assets/scripts/core/types.ts`）的 `activeSkinId: string;` 后加：
  ```ts
  mergeGrid?: (string | null)[];   // 合成台各格物品 id，按格序
  ```

- [ ] **Step 4: 改 gameData.ts**
  在类字段区（`ownedSkinIds` / `activeSkinId` 附近）加：
  ```ts
  mergeGrid: (string | null)[] = [];
  ```
  在构造器 `this.activeSkinId = ...` 之后加：
  ```ts
  this.mergeGrid = (base as any).mergeGrid ?? [];
  ```
  在 `toSave()` 返回对象中加一项：
  ```ts
  mergeGrid: this.mergeGrid,
  ```
  在 `unlockDish` 方法之后加：
  ```ts
  mergeUnlockDish(id: string): boolean {
    const dish = DISHES.find(d => d.id === id);
    if (!dish || this.dishUnlocked(id)) return false;
    this.unlockedDishIds.push(id);
    return true;
  }
  ```

- [ ] **Step 5: 运行测试确认通过**
  运行：`npm test`
  预期：`Tests 36 passed`（33 + 本任务 3）。

- [ ] **Step 6: 提交**
  ```bash
  git add assets/scripts/core/types.ts assets/scripts/core/gameData.ts tests/core/gameData.test.ts
  git commit -m "feat: free dish unlock and merge grid persistence"
  ```

---

### Task 3: 合成台面板（MergeView，新文件）

**Files:**
- Create: `assets/scripts/ui/MergeView.ts`

**Interfaces:**
- Consumes: `GameData.mergeUnlockDish` / `dishUnlocked` / `mergeGrid`（Task 2）；`mergeItemById` / `mergeNext` / `MERGE_BASE_IDS`（Task 1）；`ArtService.makeSprite` / `hasArt`；`Widgets`（见下）
- Produces: `new MergeView(parent, data, save)`；`open()`；`close()`

- [ ] **Step 1: 写 MergeView.ts**
  新建 `assets/scripts/ui/MergeView.ts`：
  ```ts
  import { Color, EventType, Node } from 'cc';
  import { GameData } from '../core/gameData';
  import { MERGE_BASE_IDS, mergeItemById, mergeNext } from '../core/merge';
  import { COLOR, makeLabel, makeNode, makeRect, pillButton, roundRect } from './Widgets';
  import { ArtService } from './ArtView';

  const COLS = 4;
  const ROWS = 4;
  const CELLS = COLS * ROWS;
  const CELL_W = 120;
  const CELL_H = 90;

  export class MergeView {
    private root!: Node;
    private contents: Node[] = [];
    private itemIds: (string | null)[] = [];
    private selected = -1;

    constructor(private parent: Node, private data: GameData, private save: () => void) {
      this.itemIds = (this.data.mergeGrid && this.data.mergeGrid.length === CELLS)
        ? [...this.data.mergeGrid]
        : new Array(CELLS).fill(null);
      this.build();
    }

    open(): void { this.root.active = true; }

    private build(): void {
      this.root = makeNode('merge-root', this.parent, 960, 640, 0, 0);
      this.root.active = false;
      makeRect('merge-shade', this.root, 960, 640, 0, 0, new Color(0, 0, 0, 150))
        .on(EventType.TOUCH_END, () => this.close());
      roundRect('merge-panel', this.root, 560, 460, 0, 40, 18, COLOR.panel, COLOR.border);
      makeLabel('merge-title', this.root, '🧩 合成台', 22, 0, 225, COLOR.text);
      makeLabel('merge-hint', this.root, '点两格相同素材即可合成升阶；产出素材放入空格', 13, 0, 195, COLOR.subtext);
      pillButton('merge-produce', this.root, 160, 38, -150, 150, COLOR.primary, '产出素材', () => this.produce());
      pillButton('merge-close', this.root, 90, 38, 150, 150, COLOR.border, '关闭', () => this.close());
      const grid = makeNode('merge-grid', this.root, COLS * CELL_W, ROWS * CELL_H, 0, -20);
      const startX = -((COLS - 1) * CELL_W) / 2;
      const startY = ((ROWS - 1) * CELL_H) / 2;
      for (let i = 0; i < CELLS; i++) {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = startX + col * CELL_W;
        const y = startY - row * CELL_H;
        const cell = makeNode(`cell-${i}`, grid, CELL_W - 10, CELL_H - 10, x, y);
        roundRect(`cell-bg-${i}`, cell, CELL_W - 10, CELL_H - 10, 0, 0, 8, COLOR.panel, COLOR.border);
        const content = makeNode(`cell-content-${i}`, cell, CELL_W - 10, CELL_H - 10, 0, 0);
        this.contents.push(content);
        cell.on(EventType.TOUCH_END, () => this.onCellTap(i));
      }
      this.renderGrid();
    }

    private renderGrid(): void {
      for (let i = 0; i < CELLS; i++) this.renderCell(i);
    }

    private renderCell(i: number): void {
      const content = this.contents[i];
      if (!content) return;
      content.removeAllChildren();
      const id = this.itemIds[i];
      if (id) {
        const it = mergeItemById(id);
        if (it && it.artKey) {
          ArtService.makeSprite(content, it.artKey, 72, 72, 0, 0, 'mi');
        } else if (it) {
          makeLabel('mi', content, it.glyph ?? '?', 36, 0, 0, COLOR.text);
        }
      }
      if (i === this.selected) {
        roundRect('sel', content, CELL_W - 4, CELL_H - 4, 0, 0, 10, new Color(0, 0, 0, 0), COLOR.primary);
      }
    }

    private produce(): void {
      const empties: number[] = [];
      for (let i = 0; i < CELLS; i++) if (!this.itemIds[i]) empties.push(i);
      if (empties.length === 0) {
        makeLabel('merge-toast', this.root, '格子已满', 16, 0, -200, COLOR.subtext);
        return;
      }
      const idx = empties[Math.floor(Math.random() * empties.length)];
      const base = MERGE_BASE_IDS[Math.floor(Math.random() * MERGE_BASE_IDS.length)];
      this.itemIds[idx] = base;
      this.persist();
      this.renderGrid();
    }

    private onCellTap(i: number): void {
      const id = this.itemIds[i];
      if (this.selected === -1) {
        if (id) this.selected = i;
      } else if (this.selected === i) {
        this.selected = -1;
      } else {
        const selId = this.itemIds[this.selected];
        if (id && selId && id === selId) {
          const next = mergeNext(id);
          if (next) {
            this.itemIds[i] = next;
            this.itemIds[this.selected] = null;
            this.selected = -1;
            this.maybeUnlock(next);
          } else {
            this.selected = -1;
          }
        } else {
          this.selected = id ? i : -1;
        }
      }
      this.persist();
      this.renderGrid();
    }

    private maybeUnlock(id: string): void {
      const it = mergeItemById(id);
      if (it && it.unlocksDishId && !this.data.dishUnlocked(it.unlocksDishId)) {
        this.data.mergeUnlockDish(it.unlocksDishId);
        makeLabel('merge-toast', this.root, `解锁新菜：${it.name}`, 18, 0, -200, COLOR.accent);
      }
    }

    private persist(): void {
      this.data.mergeGrid = [...this.itemIds];
      this.save();
    }

    private close(): void {
      this.persist();
      this.root.active = false;
    }
  }
  ```

- [ ] **Step 2: 验证**
  编辑器 tsc，确认 `assets/` 下 0 错误；`npm test` 预期 `Tests 36 passed`（本任务无新测试）。

- [ ] **Step 3: 提交**
  ```bash
  git add assets/scripts/ui/MergeView.ts
  git commit -m "feat: add merge board panel UI"
  ```

---

### Task 4: HUD 按钮 + Main 接线

**Files:**
- Modify: `assets/scripts/ui/HudView.ts`（构造函数加 `mergeCb`、能量按钮左移、加「合成台」按钮）
- Modify: `assets/scripts/ui/Main.ts`（导入 `MergeView`、加字段、实例化、HUD 回调传入 `mergeCb`）

**Interfaces:**
- Consumes: `MergeView`（Task 3，`open()` / `close()`）
- Produces: HUD 出现「合成台」按钮，点击打开合成台。

- [ ] **Step 1: HudView 加合成台按钮**
  将 `HudView` 构造函数签名改为：
  ```ts
  constructor(parent: Node, upgradeCb: () => void, chapterCb: () => void, adCb: () => void, mergeCb: () => void) {
  ```
  将能量按钮（原 `this.energyBtn = pillButton('energy-btn', parent, 120, 34, -270, 293, COLOR.primary, '12/12', adCb);`）x 由 `-270` 改为 `-300`：
  ```ts
  this.energyBtn = pillButton('energy-btn', parent, 120, 34, -300, 293, COLOR.primary, '12/12', adCb);
  ```
  在升级按钮之前（`pillButton('upgrade-btn', ...)` 那行前）加：
  ```ts
  pillButton('merge-btn', parent, 80, 34, -195, 293, COLOR.accent, '合成台', mergeCb);
  ```

- [ ] **Step 2: Main 接线**
  在 `Main.ts` 顶部 import 区加：
  ```ts
  import { MergeView } from './MergeView';
  ```
  （若 `CUSTOMER_ART` 已因视觉计划导入则保留；本任务不重复添加。）
  在字段声明区（`private upgrade!: UpgradeView;` 附近）加：
  ```ts
  private merge!: MergeView;
  ```
  在 `buildGame` 内 `this.hud = new HudView(...)` 调用处，改为传入第 5 个回调：
  ```ts
  this.hud = new HudView(this.node,
    () => { this.upgrade.open(); this.refreshUpgrade(); },
    () => this.openChapters(),
    () => this.onAdButton(),
    () => this.merge.open(),
  );
  ```
  在 `buildGame` 内 `this.applySkin();`（约 115 行）之后加：
  ```ts
  this.merge = new MergeView(this.node, this.data, () => this.saveGame());
  ```

- [ ] **Step 3: 验证**
  编辑器 tsc，确认 `assets/` 下 0 错误；`npm test` 预期 `Tests 36 passed`。

- [ ] **Step 4: 提交**
  ```bash
  git add assets/scripts/ui/HudView.ts assets/scripts/ui/Main.ts
  git commit -m "feat: wire merge board into HUD button"
  ```

---

## Self-Review Notes

- 四个任务顺序：Task1→2（纯逻辑，可单测）→3（MergeView，编译依赖 1/2）→4（接线，依赖 3）。每任务结束均可独立 tsc + 回归。
- `mergeUnlockDish` 不扣金币、已解锁幂等返回 false；`mergeGrid` 缺省 `[]` 向后兼容旧档。
- 未使用 `Array.prototype.includes`（用 `indexOf`/直接比较）。
- 预览人工目检项（合成台开合、产出/合成/解锁、网格持久化、与做菜上菜循环解耦）在实现后由用户在 `http://localhost:7456/` 确认。
