# 写实美术替换设计

日期：2026-08-29
项目：romantic-restaurant（Cocos Creator 3.8.8）

## 一、目标

把游戏中目前用 emoji 字符绘制的「人 / 物 / 背景 / UI 小图标」替换为写实美术图。

素材由使用者用 AI 图片生成工具产出，按约定命名放入 `assets/resources/art/`，代码负责接入。**任何图片缺失时回退到现有的 emoji / 矢量色块，游戏永不因缺图而中断**，可分批补图、随时预览。

## 二、已确认的范围

- 替换层级：全换（人、物、背景、UI 小图标）
- 背景：一整张 960×640「餐厅内景」写实插图，前景只叠加动态元素
- 顾客：6 个不同的顾客形象随机出现
- 面板：4 张专属贴图（HUD 顶栏 / 订单牌 / 对话弹窗 / 通用弹窗），9-slice 拉伸
- 文字：中文对话 / 数字 / 菜名保留系统字体 Label（不做文字贴图）

## 三、美术资源层（新增）

- 新目录 `assets/resources/art/`：PNG 直接放入，Cocos 自动导入为 SpriteFrame
- `assets/scripts/core/art.ts`（**不 import `cc`**，保证 vitest 可测）：
  - `ART_MANIFEST`：全部 key + 类别 + 显示尺寸
  - `ArtService`：`preload()`（启动时加载 P0+P1）、`hasArt(key): boolean`、`getSpriteFrame(key): SpriteFrame | null`
- `assets/scripts/ui/ArtView.ts`（封装 `cc.Sprite`）：
  - `makeSprite(key, w, h, x, y): Node | null`（缺图返回 null，调用方走回退）
  - `makePanel(key, w, h, x, y)`：9-slice，内边距用代码常量 `PANEL_INSETS` 控制，文字区不变形
  - `makeIconText(spriteKey, text, …)`：把「图标+文字」拆成「Sprite + Label」横排

## 四、数据模型接入（原字段全部保留作回退）

| 模型 | 新增字段 | 取值 |
|---|---|---|
| `Dish` | `artKey` | `dish-fries` … `dish-dessert` |
| 顾客 | — | `CUSTOMER_ART = ['cust-1'..'cust-6']` 随机抽取 |
| 对话台词 | `artKey` | `char-xiaoqi` / `char-tangtang` / `char-laozhou` / `char-ashen` / `icon-narrator`（旁白=书本） |
| 皮肤 | `decor[].artKey`、皮肤图标 `artKey` | `decor-<skin>-<n>` / `skin-<id>` |

回退规则：`hasArt(key)` 为 false → 用原有的 `emoji` 字段 / 矢量色块渲染。

## 五、背景与对位

- `bg` 存在 → 一张整幅 Sprite 铺底（960×640，Z 序最底），替换现在的矢量 `bg` / `floor` / `skin-tint`（无图时回退矢量）
- 对位契约：动态元素坐标固定，背景插图按此构图生成（不要求像素级精确，暖色 3/4 俯视小馆构图即可）：
  - 画面中部：就餐区，顾客/餐桌活动空间
  - 画面右侧（x≈330 一带）：开放式小厨房 / 吧台
  - 画面顶部：留出 HUD 顶栏（y≈293 以上）
  - 细节：墙面小挂画、绿植点缀

## 六、呈现细节

- 顾客：坐姿形象 ~160×220，朝向画面中心，头顶点餐泡；被服务后轻微点头/淡出；加一个 ±4px 的轻浮动 Tween
- 菜品图共享同一张 SpriteFrame（无额外显存）：
  - 厨房卡槽：菜品照片居中 + 外层烹饪进度环（环保持矢量）
  - 点餐泡：小号缩略图 ~40px + 菜名
  - 订单牌：小缩略图 + 菜名 + 份数
- 对话弹窗：面板底（`panel-dialogue`）+ 左侧角色大头像 + 右侧台词
- 皮肤装饰：按各套皮肤的实际装饰件数（1~3 件）生成写实道具，按现有坐标摆位
- 层级沿用现状：背景 → 地面 → 桌椅 / 顾客 → 厨房 → HUD → 弹窗（Sprite 与现有 Graphics 一一对应，z 序不变）

## 七、保持矢量的状态类元素（不换图）

烹饪进度环、卡槽底环、顾客气泡、能量条填充、星级填充、投影、遮罩。这些是「状态」不是「美术」。

## 八、错误处理

- 缺图：`hasArt` 为 false → 该处回退 emoji / 色块；`console.warn` 经集合去重，每个缺失 key 只告警一次
- 拼错 key：dev 启动时校验代码引用的所有 artKey 都在 `ART_MANIFEST`，汇总打印；单测同步拦截
- 加载慢：`preload()` 完成前按回退渲染，完成后替换为 Sprite（本地加载极快）
- 尺寸/比例不符：Sprite 一律 `sizeMode = CUSTOM` + 固定 `contentSize`，按显示尺寸缩放，不撑爆布局

## 九、测试

- `core/art.ts` 无 `cc` 依赖，vitest 覆盖：
  - manifest 完整性：代码引用的 artKey 全部存在于 `ART_MANIFEST`（防拼写错误）
  - 回退路径：`hasArt` 为 false 时走 emoji/矢量分支
  - 现有 19 条游戏逻辑单测不回归（美术为表现层，不触碰玩法逻辑）

## 十、实施顺序（每步可独立预览、缺图回退）

- **M0** 美术基础设施：manifest + ArtService + makeSprite/makePanel + 单测（画面无变化）
- **M1** 背景大图 + 4 张面板（画面开始写实）
- **M2** P0 内容：6 顾客 + 5 角色头像 + 6 菜品
- **M3** P1 小图标
- **M4** P2 皮肤道具 + 图标

## 十一、美术清单

**规格**：PNG；角色 / 菜品 / 道具 / 图标 = 透明背景；尺寸 = UI 显示尺寸的 2 倍（保证清晰度）；统一「暖色温馨小馆」氛围（奶油米 `#F7E8D7` + 暖橙 `#FF8A5C` + 蜂蜜黄 `#FFC94D` 色系，柔光光影）。

### P0 核心（22 张）

| key | 内容 | 显示尺寸 | 出图尺寸(2×) |
|---|---|---|---|
| `bg` | 整幅餐厅内景 | 960×640 | 1920×1280 |
| `cust-1` | 顾客：年轻女生 | 160×220 | 320×440 |
| `cust-2` | 顾客：上班族大叔 | 160×220 | 320×440 |
| `cust-3` | 顾客：老奶奶 | 160×220 | 320×440 |
| `cust-4` | 顾客：母亲带小女孩 | 160×220 | 320×440 |
| `cust-5` | 顾客：学生 | 160×220 | 320×440 |
| `cust-6` | 顾客：情侣 / 朋友 | 160×220 | 320×440 |
| `char-xiaoqi` | 老板娘小柒头像 | ~150×150 | 300×300 |
| `char-tangtang` | 女儿糖糖头像 | ~150×150 | 300×300 |
| `char-laozhou` | 熟客老周头像 | ~150×150 | 300×300 |
| `char-ashen` | 阿婶头像 | ~150×150 | 300×300 |
| `icon-narrator` | 旁白：摊开的书本 | ~150×150 | 300×300 |
| `dish-fries` | 薯条 | 96×96 | 192×192 |
| `dish-burger` | 汉堡 | 96×96 | 192×192 |
| `dish-pizza` | 披萨 | 96×96 | 192×192 |
| `dish-pasta` | 意面 | 96×96 | 192×192 |
| `dish-steak` | 牛排 | 96×96 | 192×192 |
| `dish-dessert` | 甜品 | 96×96 | 192×192 |
| `panel-hud` | HUD 顶栏底板 | 960×64 | 1920×128 |
| `panel-orderboard` | 订单牌 | 320×460 | 640×920 |
| `panel-dialogue` | 对话弹窗 | 760×260 | 1520×520 |
| `panel-popup` | 通用弹窗（升级/皮肤/广告/菜单/章节） | 560×520 | 1120×1040 |

### P1 UI 小图标（约 13 张，显示 ~32×32，出图 64×64）

金币 `icon-coin`、闪电能量 `icon-energy`、在店小人 `icon-customer`、章节书 `icon-chapter`、星星 `icon-star`、锁 `icon-lock`、播放 `icon-play`、重看 `icon-replay`、广告电视 `icon-ad`、装修刷 `icon-brush`、凳子 `icon-chair`、灶台 `icon-kitchen`、钱袋 `icon-money`。

### P2 皮肤（约 18 张，可后补；显示 ~88×88，出图 176×176）

- 装饰道具 ×13：`decor-classic-1`、`decor-garden-1/2/3`、`decor-retro-1/2/3`、`decor-ocean-1/2/3`、`decor-festival-1/2/3`
- 皮肤图标 ×5：`skin-classic`、`skin-garden`、`skin-retro`、`skin-ocean`、`skin-festival`

### AI 提示词模板（出图时统一加）

通用画风词：「柔光手绘写实风格，温暖治愈的温馨小饭馆氛围，奶油米 + 暖橙 + 蜂蜜黄配色，柔和光影，无文字无水印，透明背景 PNG」

- 背景：在通用词后加「温馨小餐厅内景全景，木质小圆桌餐椅，右侧开放式小厨房吧台，墙面挂画与绿植，柔和自然光，3/4 俯视构图，中部与左侧留出活动空间，无人物，1920×1280」
- 角色：在通用词后加「[形象描述：年轻女生 / 上班族大叔 / 老奶奶 / 母亲带小女孩 / 学生 / 情侣]，半身全身皆可，正面朝前，坐姿或立姿」
- 菜品：在通用词后加「[菜名]特写，盛放在白色圆盘中，俯拍」
- 面板：在通用词后加「木质圆角餐牌/木板，四周留出可安全拉伸的边框区（中间区域尽量留白）」

## 十二、交付物

- 本设计文档
- `ART-MANIFEST.md`：出图清单 + 提示词模板（用户开刷前打印用）