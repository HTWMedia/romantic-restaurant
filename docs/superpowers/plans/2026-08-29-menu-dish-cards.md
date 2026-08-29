# 菜单菜品卡片图化实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把底部菜单条内纯文字菜品卡片改为「96×96 圆角方卡 + 菜品写实摆盘图」形态，保留选中/锁定/未解锁动态与缺图回退。

**Architecture:** 只改 `MenuView.rebuild()`：卡片由 130×72 横卡改为 96×96 圆角方卡；主视觉用 `ArtService.makeSprite(dish.artKey)` 放菜品透明图，下方叠菜名/价格；锁定卡在主视觉上叠变暗罩 + `icon-lock`；所有 sprite 缺图回退现有文字渲染。数据层 `Dish.artKey`、`ArtService` 能力均已就位，无需改动其他文件。

**Tech Stack:** Cocos Creator 3.8.8（TypeScript，editor tsc `temp/tsconfig.cocos.json`：`target: ES2015`、`strict: true`、`isolatedModules: true`）；vitest 4.1.10。预览 `http://localhost:7456/`。

## Global Constraints

- 编辑代码禁用 `Array.prototype.includes`（lib 仅到 ES2015）。`?.`/`??` 允许。
- 回退铁律：任何 `artKey` 缺图时该处必须渲染回退内容（原 emoji / 矢量），游戏永不因缺图中断。
- 界面与 commit message 用中性表述（"美术资源 / art assets"），不出现内部实现名。
- commit message 简洁高层，英文 conventional-style。
- 编辑器脚本改动后，若预览 chunk 未更新（预览里行为仍是旧代码），需「资源管理器里右键该 .ts → Reimport」。
- 编辑器 tsc 校验命令：
  `node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json`
  预期：`assets/**` 0 错误（cc.d.ts / vitest / storage.test 的既有工程外噪声可忽略）。
- 单测命令：`npm test`（vitest run，全部通过，既有 29 条不回归）。

---

### Task 1: `MenuView` 菜品卡片图化

**Files:**
- Modify: `assets/scripts/ui/MenuView.ts`
- Test: `tests/core/art.test.ts`（不新增 UI 测试——MenuView 依赖 `cc`，无法被现有 vitest 环境跑；本项目既有惯例为 UI 不写单测，靠 tsc + 预览验证）

**Interfaces:**
- Consumes: `ArtService.makeSprite(parent, key, w, h, x, y, name?): Node | null`、`ArtService.attachIconSprite(parent, key, x, y, size): Node | null`、`ArtService.hasArt(key): boolean`（均来自 `./ArtView`，签名见 `ArtView.ts`）；`roundRect`/`makeLabel`/`makeRect`/`COLOR`（`./Widgets`）；`Dish.artKey: string`（`../core/types`）。
- Produces: 本任务为末任务，MenuView 渲染形态变更；外部调用方（`Main.ts` 的 `rebuild(available, locked, coins)` 签名与 `setSelected`）保持不变。

- [ ] **Step 1: 备份并通读当前实现**

读 `assets/scripts/ui/MenuView.ts`（59 行），确认现有行为：`rebuild` 里两个 `forEach`（available / locked），各建 130×72 横卡。此步无需改动。

- [ ] **Step 2: 改写 `MenuView.ts` 为图化卡片**

整体替换类实现如下（imports 行不变，仅改 `rebuild` 及其中的卡片构建逻辑）：

```ts
import { Button, Color, Label, Node, Vec3 } from 'cc';
import { Dish } from '../core/types';
import { COLOR, makeLabel, makeRect, panelWithShadow, roundRect } from './Widgets';
// 注：原 import 为 { COLOR, makeLabel, panelWithShadow, roundRect }，
// 本任务新增 makeRect 用于锁定卡的暗化罩。若已是全量可保持不变。
import { ArtService } from './ArtView';

export class MenuView {
  private root!: Node;
  private selectedId: string | null = null;

  constructor(
    private parent: Node,
    private onSelect: (id: string) => void,
    private onTryUnlock: (id: string) => void,
  ) {
    this.root = ArtService.panelWithArt('menu-panel', parent, 'panel-menu', 920, 110, 0, -265);
    makeLabel('title', parent, '菜谱', 18, -420, -300, COLOR.text);
  }

  rebuild(available: Dish[], locked: Dish[], coins: number): void {
    this.root.removeAllChildren();
    available.forEach((d, i) => {
      const selected = d.id === this.selectedId;
      const card = roundRect(
        `dish-${d.id}`, this.root, 96, 96, -330 + i * 118, 0, 12,
        selected ? new Color(255, 138, 92, 45) : COLOR.panel,
        selected ? COLOR.primary : COLOR.border,
      );
      card.addComponent(Button);
      if (selected) card.scale = new Vec3(1.05, 1.05, 1);
      const art = ArtService.makeSprite(card, d.artKey, 64, 64, 0, 8, 'dish-art');
      if (!art) {
        makeLabel('name', card, d.name, 14, 0, 0, COLOR.text);
        card.on(Button.EventType.CLICK, () => this.pick(d.id));
        return;
      }
      const nameL = makeLabel('name', card, d.name, 14, 0, -30, COLOR.text);
      nameL.isBold = true;
      makeLabel('price', card, `${d.price} 🪙`, 11, 0, -44, COLOR.accent);
      card.on(Button.EventType.CLICK, () => this.pick(d.id));
    });
    locked.forEach((d, i) => {
      const afford = coins >= d.unlockCost;
      const card = roundRect(
        `lock-${d.id}`, this.root, 96, 96, -330 + (available.length + i) * 118, 0, 12,
        new Color(156, 133, 104, 60),
        afford ? COLOR.accent : COLOR.border,
      );
      card.addComponent(Button);
      const art = ArtService.makeSprite(card, d.artKey, 64, 64, 0, 8, 'dish-art');
      if (!art) {
        const lockIcon = ArtService.attachIconSprite(card, 'icon-lock', -46, -4, 18);
        const nameL = makeLabel('name', card, `${lockIcon ? '' : '🔒 '}${d.name}`, 14, lockIcon ? 8 : 0, 14, COLOR.subtext);
        nameL.isBold = true;
        makeLabel('price', card, `${d.unlockCost} 🪙`, 12, 0, -18, afford ? COLOR.accent : COLOR.subtext);
        card.on(Button.EventType.CLICK, () => this.onTryUnlock(d.id));
        return;
      }
      // 菜品图变暗 + 锁图标
      this.darken(card);
      ArtService.attachIconSprite(card, 'icon-lock', 0, 8, 20);
      const nameL = makeLabel('name', card, d.name, 14, 0, -30, COLOR.subtext);
      nameL.isBold = true;
      makeLabel('price', card, `${d.unlockCost} 🪙`, 11, 0, -44, afford ? COLOR.accent : COLOR.subtext);
      card.on(Button.EventType.CLICK, () => this.onTryUnlock(d.id));
    });
  }

  /** 在主视觉菜品图位置叠一层半透明深灰罩（圆角），表达锁定态 */
  private darken(card: Node): void {
    makeRect('lock-veil', card, 64, 64, 0, 8, new Color(90, 70, 50, 90));
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

要点：
- 卡片 96×96，x 起点 `-330`、间隔 `118`（6 张可用菜最右 `-330+5*118=260`，卡半宽 48 → 右缘 308，仍在 920 面板内）。
- 主视觉 sprite 尺寸 64×64 于 `(0, 8)`；菜名 `(0,-30)`、价格 `(0,-44)`，与 sprite 不重叠（sprite 底缘 `8-32=-24`）。
- 锁定态：`darken()` 叠 64×64 半透明罩（`makeRect` 方罩，圆角视觉由上层卡片圆角遮罩近似即可，无需 Graphics 圆角）+ `attachIconSprite` 锁图标于 `(0, 8)`。
- 缺图回退：available 无 dish 图 → 文字横卡（菜名居中，不带价格图标逻辑与现有一致）；locked 无 dish 图 → 现「🔒+名+价格」灰卡。
- 原 `panelWithShadow` 保留（`Main.ts` 或其它处未用），import 中仍引用则无须删。
- `Label`/`Node`/`Vec3`/`Color` 均继续使用，import 保持。

- [ ] **Step 3: 编辑器 tsc 校验**

Run: `node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json`
Expected: `assets/**` 0 错误（工程外噪声忽略）。

- [ ] **Step 4: 单测回归**

Run: `npm test`
Expected: 全部通过（既有 29 条）。

- [ ] **Step 5: 预览验证**

浏览器打开 `http://localhost:7456/`（若编辑器开着，改动后对 `assets/scripts/ui/MenuView.ts` 右键 → Reimport 再刷预览）。
预期：
- 菜单显示 96×96 圆角卡，主视觉为菜品写实摆盘图；菜名/价格排下缘；
- 点击可用菜 → 卡片描边高亮 `COLOR.primary` + 微放大 1.05 → 开始做菜；
- 锁定卡菜品图变暗 + 锁图标叠加，点击触发解锁尝试；
- 临时删 `assets/resources/art/dish-burger.png` + Reimport → 汉堡卡回退文字卡，游戏不崩；恢复文件。
- 控制台 0 error。

- [ ] **Step 6: Commit**

```bash
git add assets/scripts/ui/MenuView.ts
git commit -m "feat: render menu dish cards from art"
```

---

## 收尾与验收清单

- [ ] 全量单测绿：`npm test`（既有 29 条）
- [ ] 编辑器 tsc `assets/**` 0 错（忽略工程外噪声）
- [ ] 预览 `http://localhost:7456/` 无 console error
- [ ] 菜单卡片图化三态（选中/锁定/缺图回退）人工验证通过
- [ ] commit 保持简短高层，无内部实现名

## 风险与注意

- **9-slice 面板不变**：`panel-menu` 维持 920×110 与既有 `PANEL_INSETS`（160/160/16/16），无需重新出图。
- **暗化罩圆角**：`makeRect` 为方罩，覆盖于 roundRect 卡片内、卡片底下仍是圆角底；罩自身直角边缘在 96 卡内视觉可接受。若预览发现直角穿帮，再改 `darken()` 用 `Graphics.roundRect` 描角（本计划不预置）。
- **不新增 UI 单测**：MenuView 依赖 `cc`，vitest 无法引入；沿用项目既有惯例（UI 只靠 tsc + 预览验证），不破坏现有 29 条测试。
- **`-330 + i*118` 布局**：当 available 不满 6 张时区间右移以空出锁定卡位，与现有横卡逻辑一致。