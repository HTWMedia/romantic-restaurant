import { Button, Color, Label, Node } from 'cc';
import { CHAPTERS } from '../core/chapters';
import { GameData } from '../core/gameData';
import { COLOR, makeLabel, makeNode, makeRect, panelWithShadow, pillButton } from './Widgets';

export class ChapterView {
  private overlay!: Node;
  private panel!: Node;
  private subL!: Label;
  private goalsBox!: Node;
  private rewardL!: Label;
  isOpen = false;

  constructor(parent: Node, private onReplayIntro: () => void) {
    this.overlay = makeRect('ch-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 90));
    this.overlay.active = false;
    this.overlay.on(Node.EventType.TOUCH_START, () => this.close());

    this.panel = panelWithShadow('ch-panel', parent, 560, 400, 0, 0, 20, COLOR.panel, COLOR.border);
    this.panel.active = false;
    makeLabel('ch-title', this.panel, '📖 经营目标', 24, 0, 160, COLOR.text);
    this.subL = makeLabel('ch-sub', this.panel, '', 18, 0, 120, COLOR.primary);
    this.goalsBox = makeNode('ch-goals', this.panel, 500, 200, 0, 10);
    this.rewardL = makeLabel('ch-reward', this.panel, '', 16, 0, -110, COLOR.accent);
    pillButton('ch-replay', this.panel, 200, 40, 0, -160, COLOR.primary, '重看剧情 ▶', () => this.onReplayIntro());

    const close = makeRect('ch-close', this.panel, 40, 40, 260, 175, COLOR.panel);
    close.addComponent(Button);
    makeLabel('ch-x', close, '✕', 24, 0, 0, COLOR.subtext);
    close.on(Button.EventType.CLICK, () => this.close());
  }

  open(data: GameData): void {
    const idx = data.chapterIndex;
    const ch = CHAPTERS[idx];
    this.isOpen = true;
    this.overlay.active = true;
    this.panel.active = true;
    this.goalsBox.removeAllChildren();

    if (!ch) {
      this.subL.string = '🎉 全部章节完成！';
      this.rewardL.string = '你已把"暖柒餐厅"开成了想要的样子。';
      return;
    }

    this.subL.string = `第 ${idx + 1} 章：${ch.title}`;
    ch.goals.forEach((g, i) => {
      const cur =
        g.kind === 'revenue' ? data.totalRevenue :
        g.kind === 'served' ? data.servedTotal :
        data.happyTotal;
      const done = cur >= g.target;
      const line = `${done ? '✔' : '◻'} ${g.label}（${Math.min(cur, g.target)}/${g.target}）`;
      const lab = makeLabel(`g-${i}`, this.goalsBox, line, 17, 0, 75 - i * 40, done ? COLOR.green : COLOR.text);
      lab.isBold = done;
    });
    this.rewardL.string = `通关奖励：+${ch.reward.coins} 🪙`;
  }

  close(): void {
    this.isOpen = false;
    this.overlay.active = false;
    this.panel.active = false;
  }
}
