# 暖柒餐厅 (Romantic Restaurant) — Cocos Creator 研发 Demo

一个用 **Cocos Creator + TypeScript** 写的中式餐厅经营小游戏 demo。
目标不是复刻某个具体产品，而是用最少的代码，把"好看的小游戏为什么让人停不下来"这件事，
按 **决策 → 反馈 → 目标 → 元系统** 四层拆开实现一遍，方便在此基础上二次开发。

## 运行

1. 用 **Cocos Creator 3.x** 打开 `D:\explore\romantic-restaurant`（即本目录）。
2. 打开 `assets/scripts/ui/Main.ts` 所在的场景（或项目默认场景），预览/构建即可。
3. 所有 UI 都用代码（Graphics / Label）即时绘制，**没有外部图片/音频资源依赖**，克隆即可跑。

> 本机若无 Cocos 编译环境，逻辑按现有代码风格编写（tsconfig 为 `strict: false`），请在 Cocos Creator 内实跑验证。

## 玩法循环

1. 顾客上门，头顶显示想点的菜（订单）。
2. 在下方菜单点菜 → 进入厨房排队烹饪（多槽位，可并行）。
3. 菜做好后自动上给对应顾客；顾客满意离店给金币，气走则断连击。
4. 攒金币升级桌位 / 厨房，解锁新菜；攒营业额 / 招待数推进章节剧情。
5. 体力限制出餐频率，没体力看广告回满，形成"体力闸口 + 广告变现"留存骨架。

## 已实现的四层（对应"为什么好玩"的公式）

- **Tier 1 · 决策感**：多槽位厨房、订单预览看板、连击倍率（最高 3 倍）。
- **Tier 2 · 目标与叙事**：5 章主线剧情 + 章节目标（营业额 / 招待数 / 满意数），通关触发对白与奖励。
- **Tier 3 · 反馈（juice）**：上菜飘金币、WebAudio 音效（烹饪/上菜/金币/失败），连击弹跳。
- **Tier 4 · 元系统**：体力闸口 + 看广告（含模拟广告浮层）；可收集/装备的**装修皮肤**。

## 目录结构

```
assets/scripts/
  core/
    types.ts      数据类型 / 存档结构 SaveData
    dishes.ts     菜单（菜品、价格、烹饪时长、解锁价）
    chapters.ts   章节剧情与目标（纯数据，改文案只动这里）
    skins.ts      装修皮肤数据（颜色 + 摆件）
    gameData.ts   存档读写、金币/体力/章节/皮肤状态与升级规则
    satisfaction.ts  顾客满意度计算
    storage.ts    本地存档（浏览器 localStorage 封装）
  services/
    Sfx.ts        无资源的 WebAudio 音效
  ui/
    Main.ts       游戏主循环、所有系统的装配点
    Kitchen.ts    多槽位厨房
    CustomerView.ts 顾客（点单/上菜/满意）
    HudView.ts    顶部 HUD（金币/体力/连击/章节）
    MenuView.ts   菜单
    UpgradeView.ts 升级面板（含"装修小店"入口）
    DialogueView.ts 剧情对话播放器
    ChapterView.ts  章节目标面板
    AdView.ts     模拟"看广告"浮层
    SkinView.ts   装修/皮肤收集面板
    Widgets.ts    通用绘制助手（圆角面板、按钮、标签…）
```

## 二次开发指引

- **改剧情/章节目标**：只编辑 `core/chapters.ts`（`CHAPTERS` 数组）。
- **加菜 / 调价 / 调烹饪时长**：编辑 `core/dishes.ts`。
- **加装修皮肤**：编辑 `core/skins.ts`（`SKINS` 数组，填 `bg` 底色与 `decor` 摆件）。
- **接真实广告 SDK（重点）**：
  当前 `AdView.play(duration, reward, title)` 是一个**模拟广告**——弹出浮层、3 秒倒计时后发奖。
  上线到微信小游戏 / 抖音小游戏时，把 `AdView.play` 内部换成平台广告 API 的回调即可，例如：

  ```ts
  // 微信小游戏：wx.createRewardedVideoAd
  // 抖音小游戏：tt.createRewardedVideoAd
  play(durationSec: number, reward: () => void, title: string) {
    const ad = wx.createRewardedVideoAd({ adUnitId: 'adunit-xxxx' });
    ad.onClose((res) => { if (res && res.isEnded) reward(); });
    ad.show().catch(() => ad.load().then(() => ad.show()));
  }
  ```

  调用方（`Main.onAdButton` / `watchAd`）无需改动，奖励逻辑已与播放解耦。

- **存档兼容**：`GameData` 构造函数对新字段都做了 `?? 默认值` 兜底，旧版本存档不会崩。

## 备注

- 所有文字均为中性文案，未涉及任何第三方服务的内部实现名。
- 这是用于研发/教学目的的 demo，不含真实支付或真实广告变现。
