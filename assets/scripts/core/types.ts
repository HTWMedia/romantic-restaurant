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
}

export interface SaveData {
  version: number;
  coins: number;
  unlockedDishIds: string[];
  tableLevel: number;     // 桌位等级 1..5
  kitchenLevel: number;   // 厨房等级 1..5
  totalRevenue: number;   // 累计营业额
}
