export enum CustomerState {
  ORDERING = 'ORDERING',   // 已点单，等待上菜（满意度随时间下降）
  EATING = 'EATING',       // 上菜后用 3 秒吃完
  LEAVING = 'LEAVING',     // 离开动画
  GONE = 'GONE',           // 已移除
}

export interface Dish {
  id: string;
  name: string;
  price: number;       // 金币
  cookTime: number;    // 做菜所需秒数
  unlockCost: number;  // 解锁所需金币，0 = 初始解锁
  artKey: string;      // 美术 key（缺图回退 emoji）
}

export interface SaveData {
  version: number;
  coins: number;
  unlockedDishIds: string[];
  tableLevel: number;     // 桌位等级 1..5
  kitchenLevel: number;  // 厨房等级 1..5
  totalRevenue: number;   // 累计营业额
  chapterIndex: number;   // 当前章节（已完成章节数）
  servedTotal: number;    // 累计成功招待人数
  happyTotal: number;     // 累计满意离店人数
  introPlayed: boolean;   // 是否已播过开场剧情
  energy: number;         // 当前体力
  ownedSkinIds: string[]; // 已拥有的皮肤
  activeSkinId: string;   // 当前使用的皮肤
  mergeGrid?: import('./merge').MergeSlot[];   // 合成台各格物品（id / 合成中对象 / null）
  bestCombo?: number;           // 历史最高连击
  totalServedAllTime?: number;  // 史上总招待（含读档前）
  questBoardJson?: string;      // 任务面板 JSON
  ownedDecorIds?: string[];     // 已拥有的装饰品 id
}
