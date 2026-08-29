# 场景与视觉修正 设计文档

日期：2026-08-29
范围：仅视觉/站位修正，不改玩法循环（做菜→上菜不变）。
关联代码：`assets/scripts/ui/Main.ts`、`assets/scripts/ui/CustomerView.ts`、`assets/scripts/ui/MenuView.ts`、`assets/scripts/ui/ArtView.ts`。

## 背景（现状问题）

预览后反馈，以下视觉问题需修正：

1. **盘子没在桌面上**：当前成菜只在 UI 面板出现（订单板缩略图、菜单卡、厨房槽、顾客气泡），上菜后顾客进入 EATING 但桌上从无摆盘。
2. **人物没在餐桌旁**：`Main.ts:262` 顾客生成在 `table.x + 200, 40`，而餐桌在 `y=-40`，顾客浮在画面右上、与桌分离。
3. **同屏重复形象**：`CustomerView.ts:30` 随机从 `CUSTOMER_ART` 取形象，多人同场时同一角色出现两次。
4. **菜单图案太大**：刚落地的菜单卡主视觉 64×64，用户觉得偏大。
5. **背景太大**：`bg` 以 960×640 铺满整屏，房间观感过满。

## 改动

### 1. 上菜后桌上摆盘
- `CustomerView` 构造函数新增 `tableX: number`、`tableY: number` 参数（由 `Main` 传入对应餐桌坐标）。
- `CustomerView.serve()` 中：若 `ArtService.hasArt(this.dish.artKey)`，在 `parent` 上 `(tableX, tableY + 14)` 处用 `ArtService.makeSprite(parent, artKey, 48, 48, tableX, tableY+14, 'served-plate')` 渲染摆盘，并保存引用 `this.plateNode`；取不到图则回退不渲染（铁律：缺图不中断）。
- `CustomerView.markGone()` 中 `this.plateNode?.destroy()`。
- `Main.updateSpawn` 调用处传入 `table.x, -40`。

### 2. 顾客贴近餐桌
- `Main.ts:262` 生成坐标由 `table.x + 200, 40` 改为 `table.x + 64, -6`（站桌右侧，贴近桌面高度）。离场动画（`x - 200*dt`）保持不变。

### 3. 同屏形象不重复
- `CustomerView` 构造函数新增 `artKey: string` 参数（由 `Main` 选定后传入），取代内部随机；保留旧随机逻辑作为兜底（仅当未传时）。`CustomerView` 暴露 `readonly artKey`。
- `Main.updateSpawn` 生成前计算 `used = this.customers.map(c => c.artKey)`；从 `CUSTOMER_ART` 中过滤掉 `used` 后随机取一个；若全部占用则回退随机。

### 4. 菜单主视觉缩小
- `MenuView.ts` 卡片主视觉精灵尺寸 `64→52`（位置 `(0,8)` 可微调为 `(0,6)` 以居中）；其余卡片布局、菜名/价签字号与坐标不变。

### 5. 背景观感收小
- `Main.buildBackground`：`bg` 显示尺寸由 `960×640` 改为 `900×600`（art 与回退 rect 同步），居中 `(0,0)`。
- `Main.applySkin` 中皮肤染色层 `960×640` 同步改为 `900×600`。
- 新增全屏暗底：在 `buildBackground` 最底层（`siblingIndex -1`）放置 `960×640` 矩形，颜色取 `new Color(20,16,24,255)`（比 `COLOR.bg` 更深），使 900×600 的背景四周留出干净暗边。

## 验收标准

- 预览中：上菜后对应餐桌上出现该菜摆盘，顾客离开即消失。
- 顾客站在餐桌右侧、与桌同高，不再浮于右上角。
- 同一时刻在场的顾客形象互不重复（人数超过 `CUSTOMER_ART` 数量时允许重复）。
- 菜单卡主视觉明显小于此前（52×52），文字仍清晰。
- 背景四周有暗边、房间观感不再顶满全屏。

## 测试

- 本批次均为 UI 渲染（依赖 `cc`），vitest 无法加载，按仓库惯例不新增单测。
- 验收方式：`npm test`（回归 29/29）+ 编辑器 tsc `assets/**` 0 错误 + 预览人工目检。

## 不在范围内

- 不改做菜/上菜/收费循环。
- 不新增美术资源（背景如需更优构图，留作后续按需重生成，不在本 spec）。
- 合成台玩法见另一份 spec（`2026-08-29-merge-board-design.md`）。
