import { describe, it, expect } from 'vitest';
import {
  createBoard, maybeRefresh, reportEvent, claimReward, hasClaimable,
  QUEST_POOL, QUEST_COUNT, QUEST_REFRESH_SEC,
} from '../../assets/scripts/core/quests';

describe('quests', () => {
  it('createBoard 返回 QUEST_COUNT 个任务', () => {
    const b = createBoard(1000);
    expect(b.quests).toHaveLength(QUEST_COUNT);
    expect(b.refreshAt).toBe(1000 + QUEST_REFRESH_SEC * 1000);
  });

  it('maybeRefresh 未到期不刷新', () => {
    const b = createBoard(1000);
    const b2 = maybeRefresh(b, 1500);
    expect(b2).toBe(b);
  });

  it('maybeRefresh 到期刷新', () => {
    const b = createBoard(1000);
    const b2 = maybeRefresh(b, 1000 + QUEST_REFRESH_SEC * 1000 + 1);
    expect(b2).not.toBe(b);
    expect(b2.quests).toHaveLength(QUEST_COUNT);
  });

  it('reportEvent 推进匹配任务', () => {
    let b = createBoard(0);
    b.quests[0] = { def: QUEST_POOL.find(q => q.kind === 'serve')!, progress: 0, claimed: false };
    b = reportEvent(b, 'serve', 1);
    expect(b.quests[0].progress).toBe(1);
    // earn 不应推进 serve
    b = reportEvent(b, 'earn', 10);
    expect(b.quests[0].progress).toBe(1);
  });

  it('reportEvent cook_dish 需匹配 dishId', () => {
    let b = createBoard(0);
    b.quests[0] = {
      def: QUEST_POOL.find(q => q.kind === 'cook_dish' && q.dishId === 'fries')!,
      progress: 0, claimed: false,
    };
    b = reportEvent(b, 'cook_dish', 1, 'fries');
    expect(b.quests[0].progress).toBe(1);
    b = reportEvent(b, 'cook_dish', 1, 'burger');
    expect(b.quests[0].progress).toBe(1);
  });

  it('claimReward 未完成返回0', () => {
    let b = createBoard(0);
    b.quests[0] = {
      def: QUEST_POOL.find(q => q.kind === 'serve')!,
      progress: 0, claimed: false,
    };
    const r = claimReward(b, b.quests[0].def.id);
    expect(r.reward).toBe(0);
  });

  it('claimReward 完成后可领取', () => {
    let b = createBoard(0);
    const def = QUEST_POOL.find(q => q.kind === 'serve')!;
    b.quests[0] = { def, progress: def.target, claimed: false };
    const r = claimReward(b, def.id);
    expect(r.reward).toBe(def.reward);
    expect(r.board.quests[0].claimed).toBe(true);
    // 二次领取返回0
    const r2 = claimReward(r.board, def.id);
    expect(r2.reward).toBe(0);
  });

  it('hasClaimable 正确检测', () => {
    let b = createBoard(0);
    expect(hasClaimable(b)).toBe(false);
    const def = QUEST_POOL.find(q => q.kind === 'serve')!;
    b.quests[0] = { def, progress: def.target, claimed: false };
    expect(hasClaimable(b)).toBe(true);
  });

  it('progress 不超过 target', () => {
    let b = createBoard(0);
    const def = QUEST_POOL.find(q => q.kind === 'serve')!;
    b.quests[0] = { def, progress: 0, claimed: false };
    b = reportEvent(b, 'serve', 999);
    expect(b.quests[0].progress).toBe(def.target);
  });
});
