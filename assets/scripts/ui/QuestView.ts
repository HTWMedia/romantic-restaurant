import { Button, Color, Graphics, Label, Node, tween, Vec3 } from 'cc';
import { COLOR, makeLabel, makeNode, makeRect, pillButton, roundRect } from './Widgets';
import { QuestBoard, claimReward, hasClaimable } from '../core/quests';

// 每日任务面板：底部弹出的小窗，展示3条任务进度和领取按钮

export class QuestView {
  private root!: Node;
  private panel!: Node;
  private list!: Node;
  private badge!: Node;
  private onClose?: () => void;
  private onClaim?: (reward: number) => void;

  constructor(parent: Node) {
    this.root = makeNode('quest-root', parent, 960, 640, 0, 0);
    this.root.active = false;

    makeRect('quest-shade', this.root, 960, 640, 0, 0, new Color(0, 0, 0, 120))
      .on(Node.EventType.TOUCH_END, () => this.close());

    this.panel = roundRect('quest-panel', this.root, 420, 360, 0, 0, 18, COLOR.panel, COLOR.border);
    makeLabel('quest-title', this.panel, '📋 每日任务', 22, 0, 140, COLOR.text);
    pillButton('quest-close', this.panel, 70, 32, 165, 140, COLOR.border, '关闭', () => this.close());

    this.list = makeNode('quest-list', this.panel, 400, 220, 0, 0);

    // 角标（有可领取时闪烁）
    this.badge = makeNode('quest-badge', parent, 18, 18, -118, 293);
    const bg = roundRect('badge-bg', this.badge, 18, 18, 0, 0, 9, COLOR.red);
    bg;
    const num = makeLabel('badge-num', this.badge, '!', 12, 0, 0, COLOR.white);
    num.isBold = true;
    this.badge.active = false;
  }

  get hasBadge(): boolean { return this.badge.active; }

  open(board: QuestBoard, onClaim: (reward: number) => void, onClose: () => void): void {
    this.onClaim = onClaim;
    this.onClose = onClose;
    this.render(board);
    this.root.active = true;
    this.panel.scale = new Vec3(0.9, 0.9, 1);
    tween(this.panel).to(0.12, { scale: new Vec3(1, 1, 1) }).start();
  }

  close(): void {
    tween(this.panel)
      .to(0.1, { scale: new Vec3(0.9, 0.9, 1) })
      .call(() => { this.root.active = false; this.onClose?.(); })
      .start();
  }

  private render(board: QuestBoard): void {
    this.list.removeAllChildren();
    board.quests.forEach((q, i) => {
      const y = 90 - i * 70;
      const card = roundRect(`q-card-${i}`, this.list, 380, 58, 0, y, 10,
        q.claimed ? new Color(126, 217, 167, 60) : COLOR.panel,
        q.progress >= q.def.target ? COLOR.green : COLOR.border);
      // 标签
      const progText = `${q.progress}/${q.def.target}`;
      const nameL = makeLabel(`q-name-${i}`, card, q.def.label, 15, -60, 8, COLOR.text);
      nameL.isBold = true;
      makeLabel(`q-prog-${i}`, card, progText, 14, 120, 8, COLOR.subtext);
      makeLabel(`q-reward-${i}`, card, `+${q.def.reward}🪙`, 13, -60, -14, COLOR.accent);
      // 进度条
      const barW = 200;
      const barBg = makeNode(`q-barbg-${i}`, card, barW, 8, 60, -14);
      const bgG = barBg.addComponent(Graphics);
      bgG.fillColor = new Color(60, 45, 30, 60);
      bgG.roundRect(-barW / 2, -4, barW, 8, 4);
      bgG.fill();
      const ratio = Math.min(1, q.progress / q.def.target);
      if (ratio > 0) {
        const barFg = makeNode(`q-barfg-${i}`, card, barW, 8, 60, -14);
        const fgG = barFg.addComponent(Graphics);
        fgG.fillColor = q.progress >= q.def.target ? COLOR.green : COLOR.primary;
        fgG.roundRect(-barW / 2, -4, barW * ratio, 8, 4);
        fgG.fill();
      }
      // 领取按钮
      if (!q.claimed && q.progress >= q.def.target) {
        const btn = pillButton(`q-claim-${i}`, card, 56, 28, 150, -10,
          COLOR.green, '领取', () => {
            const result = claimReward(board, q.def.id);
            if (result.reward > 0) {
              this.onClaim?.(result.reward);
              this.render(result.board);
            }
          });
        // 闪烁提示
        tween(btn)
          .to(0.3, { scale: new Vec3(1.08, 1.08, 1) })
          .to(0.3, { scale: new Vec3(1, 1, 1) })
          .union()
          .repeatForever()
          .start();
      } else if (q.claimed) {
        makeLabel(`q-done-${i}`, card, '✅', 20, 150, -10, COLOR.green);
      }
    });
  }

  /** 更新角标 */
  updateBadge(board: QuestBoard): void {
    const show = hasClaimable(board);
    if (show && !this.badge.active) {
      this.badge.active = true;
      tween(this.badge)
        .to(0.3, { scale: new Vec3(1.3, 1.3, 1) })
        .to(0.3, { scale: new Vec3(1, 1, 1) })
        .union()
        .repeatForever()
        .start();
    } else if (!show) {
      this.badge.active = false;
    }
  }
}
