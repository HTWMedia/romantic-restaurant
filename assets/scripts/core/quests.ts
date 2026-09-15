// 每日任务系统：每3分钟刷新一组小任务，完成给金币奖励。
// 纯数据层，不依赖 cc，可单元测试。

export type QuestKind = 'serve' | 'earn' | 'combo' | 'happy' | 'cook_dish';

export interface QuestDef {
  id: string;
  kind: QuestKind;
  target: number;
  reward: number;
  label: string;
  dishId?: string; // cook_dish 类用
}

export interface QuestProgress {
  def: QuestDef;
  progress: number;
  claimed: boolean;
}

export interface QuestBoard {
  quests: QuestProgress[];
  refreshAt: number; // 下次刷新时间戳 ms
}

export const QUEST_POOL: QuestDef[] = [
  { id: 'q-serve-3',  kind: 'serve',     target: 3,  reward: 20, label: '招待 3 位顾客' },
  { id: 'q-serve-6',  kind: 'serve',     target: 6,  reward: 40, label: '招待 6 位顾客' },
  { id: 'q-earn-50',  kind: 'earn',      target: 50, reward: 15, label: '赚取 50 🪙' },
  { id: 'q-earn-120', kind: 'earn',      target: 120, reward: 30, label: '赚取 120 🪙' },
  { id: 'q-combo-3',  kind: 'combo',     target: 3,  reward: 25, label: '达成 3 连击' },
  { id: 'q-combo-6',  kind: 'combo',     target: 6,  reward: 50, label: '达成 6 连击' },
  { id: 'q-happy-2',  kind: 'happy',     target: 2,  reward: 30, label: '让 2 位顾客满意离店' },
  { id: 'q-happy-5',  kind: 'happy',     target: 5,  reward: 60, label: '让 5 位顾客满意离店' },
  { id: 'q-cook-fries',  kind: 'cook_dish', target: 2, reward: 20, label: '做 2 份薯条', dishId: 'fries' },
  { id: 'q-cook-burger', kind: 'cook_dish', target: 2, reward: 25, label: '做 2 份汉堡', dishId: 'burger' },
  { id: 'q-cook-pizza',  kind: 'cook_dish', target: 1, reward: 35, label: '做 1 份披萨', dishId: 'pizza' },
  { id: 'q-cook-pasta',  kind: 'cook_dish', target: 1, reward: 50, label: '做 1 份意面', dishId: 'pasta' },
];

export const QUEST_REFRESH_SEC = 180; // 3 分钟刷新
export const QUEST_COUNT = 3;          // 同时展示 3 个任务

/** 从池中随机抽 N 个不重复任务 */
export function rollQuests(): QuestProgress[] {
  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, QUEST_COUNT).map(def => ({
    def,
    progress: 0,
    claimed: false,
  }));
}

export function createBoard(now: number = Date.now()): QuestBoard {
  return {
    quests: rollQuests(),
    refreshAt: now + QUEST_REFRESH_SEC * 1000,
  };
}

/** 检查是否到了刷新时间，返回新面板（或原样） */
export function maybeRefresh(board: QuestBoard, now: number = Date.now()): QuestBoard {
  if (now >= board.refreshAt) {
    return createBoard(now);
  }
  return board;
}

/** 上报一个事件，推进所有匹配的任务进度 */
export function reportEvent(
  board: QuestBoard,
  kind: QuestKind,
  amount: number = 1,
  dishId?: string,
): QuestBoard {
  const quests = board.quests.map(q => {
    if (q.claimed) return q;
    const matches =
      q.def.kind === kind &&
      (kind !== 'cook_dish' || q.def.dishId === dishId);
    if (!matches) return q;
    return { ...q, progress: Math.min(q.def.target, q.progress + amount) };
  });
  return { ...board, quests };
}

/** 领取已完成任务奖励 */
export function claimReward(board: QuestBoard, questId: string): { board: QuestBoard; reward: number } {
  const q = board.quests.find(x => x.def.id === questId);
  if (!q || q.claimed || q.progress < q.def.target) {
    return { board, reward: 0 };
  }
  return {
    board: {
      ...board,
      quests: board.quests.map(x =>
        x.def.id === questId ? { ...x, claimed: true } : x,
      ),
    },
    reward: q.def.reward,
  };
}

/** 是否有可领取的任务 */
export function hasClaimable(board: QuestBoard): boolean {
  return board.quests.some(q => !q.claimed && q.progress >= q.def.target);
}
