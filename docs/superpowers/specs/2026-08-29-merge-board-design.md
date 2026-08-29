# 合成台（Merge）玩法 设计文档

日期：2026-08-29
范围：新增「放置合成」小游戏，作为解锁新菜的叠加层；不改做菜→上菜主循环。
决策（已与用户确认）：放置合成（Merge 类） / 解锁新菜（叠加） / 独立产出+合成。

## 概述

新增一个**合成台**面板（HUD 按钮打开，模态，类似 UpgradeView）。面板内有网格，「产出素材」按钮在空格生成基础食材；点选两格相同素材即合并为下一阶，经典 merge 手感。合成到某阶首次达成时，**免费解锁**对应菜单菜（`unlockDish` 的免费版），之后该菜照常在厨房做、客人会点单。合成台与厨房/上菜循环完全解耦。

## 数据模型（`core/merge.ts`，新增）

```ts
export interface MergeItem {
  id: string;
  name: string;
  glyph?: string;        // 无 artKey 时用 emoji
  artKey?: string;       // 有则渲染写实图（终阶复用现有 dish art）
  tier: number;          // 0=基础
  nextId: string | null; // 两个相同合成后的产物 id；null=终点
  unlocksDishId?: string;// 首次合成到该项时免费解锁的菜单菜
}

export const MERGE_ITEMS: MergeItem[] = [ ... ];
export const MERGE_BASE_IDS: string[];   // 产出按钮随机产出的 tier0 项
export function mergeNext(id: string): string | null;
```

MVP 链（4 条，每条 2 次合成到菜，终阶复用现有 `dish-*` 美术，零新增素材）：

| 链 | t0 | t1 | t2（终阶·解锁菜） |
|----|----|----|----|
| A | 🥬 蔬菜 | 🥗 沙拉 | 🍕 pizza（`dish-pizza`，解锁 `pizza`） |
| B | 🥩 生肉 | 🍲 炖肉 | 🥩 steak（`dish-steak`，解锁 `steak`） |
| C | 🍞 面团 | 🍰 蛋糕胚 | 🍰 dessert（`dish-dessert`，解锁 `dessert`） |
| D | 🧀 奶酪 | 🍝 意面坯 | 🍝 pasta（`dish-pasta`，解锁 `pasta`） |

> 终阶解锁的 `pizza/pasta/steak/dessert` 原本也靠金币解锁；合成提供**免费**捷径，两者并存。如需「真正新菜」，后续可在 `dishes.ts` 加 `mergeOnly` 菜品，本 spec 不强制。

## 游戏数据改动（`core/gameData.ts` + `core/types.ts`）

- `GameData` 新增方法 `mergeUnlockDish(id)`：若 `!dishUnlocked(id)` 则 `unlockedDishIds.push(id)` 并返回 `true`（**不扣金币**，区别于 `unlockDish`）。
- `SaveData` 新增可选字段 `mergeGrid?: (string | null)[]`：合成台各格当前物品 id（按格序）；`toSave()` / 构造器补全，缺省为空网格。
- `DISH` 接口无需改动（终阶复用既有 `artKey`）。

## UI（`ui/MergeView.ts`，新增）

- 面板：复用 `Widgets.roundRect` + 标题「🧩 合成台」自建（本 spec 不新增面板美术）；尺寸约 `560×420`，居中偏上 `(0, 40)`，模态（带半透暗底遮罩，点击遮罩外不关闭，参考 `UpgradeView`）。
- 网格：4 列 × 4 行 = 16 格，每格 `120×90` 圆角格；空格显示空，有物显示 `glyph` 或 `ArtService.makeSprite(artKey, 84, 84)`。
- 「产出素材」按钮：在随机空格生成 `MERGE_BASE_IDS` 随机一项；满格时提示「格子已满」。
- 交互：点一格→高亮选中；再点**相同 id 且不同格**→目标格升级为 `mergeNext(id)`，源格清空；点空白/不同项→改选或取消。
- 解锁反馈：合成后若产物的 `unlocksDishId` 存在且 `!dishUnlocked`，调用 `data.mergeUnlockDish(id)` 并弹 `DialogueView`/飘字提示「解锁新菜：<名>」。
- 打开即按 `data.mergeGrid` 重建；每次变动后写回 `data.mergeGrid` 并 `saveGame()`。
- 关闭：按钮或点遮罩关闭，回主场景。

## 接入（`ui/Main.ts`）

- `HUD` 新增「合成台」按钮（`HudView` 增加一个回调 `onMerge`），点击 `this.merge.open()`。
- `buildGame` 中 `new MergeView(this.node, this.data, () => this.saveGame())`。
- 合成解锁的菜进入 `availableDishes` 后，既有 `updateSpawn` 随机点单自然包含它们；上菜走既有 `kitchen`/`onServed`，无需改动。

## 存档与兼容

- `mergeGrid` 缺省 `[]`；旧存档（无该字段）构造为 16 格空数组，向后兼容。
- 不破坏任何既有字段。

## 验收标准

- 点「产出素材」在空格出现基础食材；点两相同格合成出下一阶并出现占位/图。
- 某链合成到终阶时，对应菜进入菜单（菜单卡出现、客人可能点单），且不扣金币。
- 面板关闭重开，网格状态与已解锁菜保持一致（持久化）。
- 格子满时产出按钮给出提示而不崩。
- `npm test` 29/29 通过、tsc `assets/**` 0 错误；预览中合成台可正常开合与操作。

## 测试

- 纯 UI（依赖 `cc`），不新增 vitest 单测（仓库惯例）。
- 关键逻辑（合成链查找 `mergeNext`、免费解锁去重）可放 `core/merge.ts` 纯函数，便于后续补 `tests/core/merge.test.ts`（可选，本 spec 不强制，但鼓励）。
- 回归：`npm test` + tsc。

## 不在范围内

- 不改做菜/上菜/收费循环与数值。
- 不新增写实美术（终阶复用现有 dish art，基础/中间用 emoji）。
- 场景视觉修正见 `2026-08-29-scene-visual-fixes-design.md`。
