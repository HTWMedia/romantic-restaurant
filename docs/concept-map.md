# 游戏开发核心概念地图（《浪漫小餐厅》复盘）

## 1. 场景 / 节点 / 组件
- 场景是"关卡容器"，节点是树形结构的"物体"，组件是挂在节点上的行为。
- 我们的做法：所有节点用代码创建（Widgets 的 makeRect/makeLabel），省去编辑器拖拽，
  概念不变——编辑器只是节点树的"可视化编辑面板"。

## 2. 组件生命周期
- Main 挂在 Canvas 上：onLoad() 初始化一次，update(dt) 每帧调用。
- dt 是上一帧到本帧的秒数——游戏里所有"随时间变化"都靠累加 dt（如做菜剩余秒数）。

## 3. 状态机（顾客）
- CustomerView 用枚举 CustomerState 管理：ORDERING → EATING → LEAVING → GONE。
- 好处：每个状态下行为独立、边界清晰，杜绝"布尔变量满天飞"。

## 4. 游戏循环与计时
- update(dt) 累加 waitTimer/eatTimer/remain；归零触发状态迁移。

## 5. 数据层与 UI 解耦
- core 层（GameData）不 import 引擎、可单测；UI 层只读数据、调方法。
- earn/spend 是金币的唯一入口（数据守门员）。

## 6. 存档
- StorageService 抽象了 KVStore：网页用 localStorage，抖音发布换成 tt.setStorageSync 即可。
- 本地存储（进度）vs 服务端数据库（跨端同步/排行/联机）的分层认知。

## 7. 事件与解耦（进阶）
- 本项目视图间用回调直接连线；规模变大后可换 EventBus 广播。

## 8. 资源管理与对象生命周期（实战踩坑）
- 动态创建的节点必须记得销毁：Main 的 buildTables 曾漏掉销毁旧桌位节点，
  导致每次刷新都残留一张旧桌子、多张桌子叠在一起——"create 和 destroy 要成对"。
- 数据驱动的占位要按"是否真的空闲"判断，而不是按数组长度取模：
  customers 离开后数组变短，按 length 取模会把新顾客分到已占用的位置造成重叠。
