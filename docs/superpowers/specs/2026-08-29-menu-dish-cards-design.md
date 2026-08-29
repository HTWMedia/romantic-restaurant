# 菜单菜品卡片图化设计

日期：2026-08-29
项目：romantic-restaurant（Cocos Creator 3.8.8）

## 一、目标

把底部菜单条（`MenuView`）内纯文字的菜品卡片，改为「圆角方卡 + 菜品写实大摆盘」形态：卡片主视觉使用已生成的 `<key>.png` 透明菜品图（`dish-*`，出图 192×192），保留选中 / 锁定 / 未解锁的交互动态与回退铁律。

## 二、现状

`assets/scripts/ui/MenuView.ts`（59 行）：

- 根节点：`ArtService.panelWithArt('menu-panel', parent, 'panel-menu', 920, 110, 0, -265)` —— 9-slice 木条 + 投影，缺图回退矢量。
- `rebuild(available, locked, coins)`：可用菜 → `roundRect` 130×72 横卡（菜名 + `价格 🪙`）；锁定菜 → 同尺寸灰卡 + `icon-lock` sprite（或 🔒 文本）+ 价格灰字。均有 `Button`。
- 卡片内容全部是文字，未使用任何 `dish-*` sprite（虽然数据层 `Dish.artKey` 已就位，ArtService 已具备 makeSprite / attachIconSprite / hasArt）。

## 三、改造方案

### 卡片形态（单行横条保持不变）

- 卡片尺寸：`roundRect` **96×96** 圆角方卡（radius 12）。
- 布局：6 张单行居中排布，x = `-330 + i * 118`（可用菜在前，锁定菜随后，与现有一致）。
- 卡片仍全部挂 `Button`：可用菜 → `pick(id)`；锁定菜 → `onTryUnlock(id)`。

### 卡片内容

- **主视觉**：`ArtService.makeSprite(card, d.artKey, 64, 64, 0, 8)` —— 菜品摆盘透明图，居中偏上。有图才建 sprite。
- **菜名**：14px bold，`(0, -30)`，`COLOR.text`（锁定卡 `COLOR.subtext`）。
- **价格**：11px，`(0, -44)`，可用 `COLOR.accent`，锁定 `COLOR.subtext`（`${unlockCost} 🪙`）。
- 缺图回退：主视觉 sprite 为 null 时，该卡片整体回退为现有「文字横卡」渲染（菜名可带 🔒 前缀），不中断游戏。

### 选中态（沿用现有逻辑）

- `selectedId === d.id`：卡片 fill 色 `new Color(255, 138, 92, 45)`，描边 `COLOR.primary`，scale `1.05`。
- 未被选中保持 `COLOR.panel` fill + `COLOR.border` 描边。

### 锁定态（未解锁）

- 在主视觉 sprite 上叠加一层半透明灰罩（`makeRect` 深色 alpha，如 `new Color(90,70,50,90)`）+ 居中 `icon-lock` sprite（20px，`attachIconSprite`），实现「菜品图变暗 + 锁图标」。
- 有 `icon-lock` 图 → 用 sprite；缺图 → 沿用现有 🔒 文本前缀。
- 价格灰字 `COLOR.subtext`，金额 `unlockCost`（可负担时文案不变，仅颜色可继续用 accent）。与现有 `afford` 判断保持一致。

## 四、回退铁律（沿用项目约束）

任何 `artKey`（`dish-*` 或 `icon-lock`）缺图时，该处必须渲染回退内容（现有文字 / 🔒 / 矢量卡片），游戏永不因缺图中断。`ArtService` 的 hasArt / return-null 语义天然满足，无需新增告警。

## 五、不改动范围

- 数据层：`Dish.artKey` 已存在。
- `ArtService` / `ArtView`：已具备全部所需能力。
- 面板图 `panel-menu`：维持 920×110 显示尺寸，无需重新出图。
- `Main.ts` 调用 `menu.rebuild(...)` 的签名为空，不变。

## 六、测试与校验

- 单测：`npm test` 全量绿（既有 29 条不回归；菜单为 UI 表现层，无逻辑测试污染）。
- 编辑器 tsc：`node "...\tsc" --noEmit -p tsconfig.json`，`assets/**` 0 错误。
- 预览 `http://localhost:7456/`：
  - 菜单显示 96×96 圆角卡 + 菜品写实摆盘图；
  - 选中卡片描边高亮 + 微放大，可正常做菜；
  - 锁定卡菜品暗化 + 锁图标，点击可尝试解锁（消费金币 / 提示）；
  - 缺图回退验证：临时删 `dish-burger.png` + Reimport → 该卡回退文字卡，游戏不崩。
- commit：`feat: render menu dish cards from art`（English conventional，中性表述，不涉及内部实现名）。

## 七、涉及文件

- Modify: `assets/scripts/ui/MenuView.ts`