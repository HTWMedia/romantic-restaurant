import { Button, Color, Label, Node, tween } from 'cc';
import { GameData } from '../core/gameData';
import { MERGE_BASE_IDS, mergeItemById, mergeNext } from '../core/merge';import { COLOR, makeLabel, makeNode, makeRect, pillButton, roundRect } from './Widgets';
import { ArtService } from './ArtView';

const COLS = 4;
const ROWS = 4;
const CELLS = COLS * ROWS;
const CELL_W = 110;
const CELL_H = 74;

// 基础素材商店：花金币定向买入，替代旧的随机产出（随机会让玩家凑不齐配对而卡死）
const BASE_OFFERS: { id: string; cost: number }[] =
  MERGE_BASE_IDS.map(id => ({ id, cost: mergeItemById(id)?.cost ?? 0 }));

export class MergeView {
  private root!: Node;
  private contents: Node[] = [];
  private itemIds: (string | null)[] = [];
  private selected = -1;
  private chainStrip: Node | null = null;
  private genLabel!: Label;
  private genCdEnd = 0;

  constructor(
    private parent: Node, private data: GameData, private save: () => void,
    private onUnlock?: (dishId: string) => void,
  ) {
    this.itemIds = (this.data.mergeGrid && this.data.mergeGrid.length === CELLS)
      ? [...this.data.mergeGrid]
      : new Array(CELLS).fill(null);
    this.build();
  }

  open(): void { this.root.active = true; }

  private build(): void {
    // 布局自上而下：标题 → 合成链路图 → 素材商店 → 规则提示 → 4×4 格子
    this.root = makeNode('merge-root', this.parent, 960, 640, 0, 0);
    this.root.active = false;
    makeRect('merge-shade', this.root, 960, 640, 0, 0, new Color(0, 0, 0, 150))
      .on(Node.EventType.TOUCH_END, () => this.close());
    roundRect('merge-panel', this.root, 560, 470, 0, -75, 18, COLOR.panel, COLOR.border);
    makeLabel('merge-title', this.root, '🧩 合成台 · 研发新菜', 20, -30, 210, COLOR.text);
    pillButton('merge-close', this.root, 80, 34, 235, 210, COLOR.border, '关闭', () => this.close());
    this.renderChains();

    // 素材行：免费生成器（带冷却）+ 四种金币购买
    const genCard = roundRect('gen-card', this.root, 102, 46, -216, 120, 12,
      new Color(126, 217, 167, 70), COLOR.green);
    genCard.addComponent(Button);
    genCard.on(Button.EventType.CLICK, () => this.gen());
    const genIcon = makeLabel('gen-icon', genCard, '🤖', 20, -26, 0, COLOR.text);
    genIcon;
    this.genLabel = makeLabel('gen-label', genCard, '免费生成', 13, 12, 0, COLOR.text);
    tween(this.genLabel.node).repeatForever(
      tween(this.genLabel.node).delay(0.5).call(() => {
        const remain = this.genCdEnd - Date.now();
        this.genLabel.string = remain > 0 ? `冷却 ${Math.ceil(remain / 1000)}s` : '免费生成';
      }),
    ).start();

    BASE_OFFERS.forEach((offer, i) => {
      const x = -106 + i * 110;
      const btn = roundRect(`buy-${offer.id}`, this.root, 102, 46, x, 120, 12, COLOR.panel, COLOR.accent);
      btn.addComponent(Button);
      btn.on(Button.EventType.CLICK, () => this.buy(offer.id));
      const it = mergeItemById(offer.id);
      const icon = ArtService.attachIconSprite(btn, it?.artKey ?? '', -26, 0, 26);
      if (!icon) makeLabel(`buy-ic-${i}`, btn, it?.glyph ?? '❓', 20, -26, 0, COLOR.text);
      makeLabel(`buy-price-${i}`, btn, `${offer.cost}🪙`, 13, 12, 0, COLOR.accent);
    });
    makeLabel('merge-hint', this.root, '买素材放入格子 · 两两相同合成升阶 · 最高阶解锁新菜', 12, 0, 70, COLOR.subtext);

    const grid = makeNode('merge-grid', this.root, COLS * CELL_W, ROWS * CELL_H, 0, -80);
    const startX = -((COLS - 1) * CELL_W) / 2;
    const startY = ((ROWS - 1) * CELL_H) / 2;
    for (let i = 0; i < CELLS; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const x = startX + col * CELL_W;
      const y = startY - row * CELL_H;
      const cell = makeNode(`cell-${i}`, grid, CELL_W - 10, CELL_H - 10, x, y);
      roundRect(`cell-bg-${i}`, cell, CELL_W - 10, CELL_H - 10, 0, 0, 8, COLOR.panel, COLOR.border);
      const content = makeNode(`cell-content-${i}`, cell, CELL_W - 10, CELL_H - 10, 0, 0);
      this.contents.push(content);
      cell.on(Node.EventType.TOUCH_END, () => this.onCellTap(i));
    }
    this.renderGrid();
  }

  /** 四条合成链一览：基础 → 中间 → 最终菜；最终阶已解锁描绿框、未解锁描灰框 */
  private renderChains(): void {
    if (this.chainStrip) this.chainStrip.destroy();
    this.chainStrip = makeNode('chain-strip', this.root, 560, 34, 0, 170);
    BASE_OFFERS.forEach((offer, i) => {
      const cx = -210 + i * 140;
      const ids: string[] = [];
      let cur: string | null = offer.id;
      while (cur) { ids.push(cur); cur = mergeNext(cur); }
      ids.forEach((id, j) => {
        const it = mergeItemById(id);
        if (!it) return;
        const x = cx - 30 + j * 30;
        const icon = ArtService.attachIconSprite(this.chainStrip!, it.artKey ?? '', x, 0, 26);
        if (!icon) makeLabel(`chain-${i}-${j}`, this.chainStrip!, it.glyph ?? '?', 17, x, 0, COLOR.text);
        if (it.unlocksDishId) {
          const unlocked = this.data.dishUnlocked(it.unlocksDishId);
          roundRect(`chain-ring-${i}`, this.chainStrip!, 32, 32, x, 0, 8,
            new Color(0, 0, 0, 0), unlocked ? COLOR.green : COLOR.subtext);
        } else if (j < ids.length - 1) {
          makeLabel(`chain-arrow-${i}-${j}`, this.chainStrip!, '→', 11, x + 15, 0, COLOR.subtext);
        }
      });
    });
  }

  private renderGrid(): void {
    for (let i = 0; i < CELLS; i++) this.renderCell(i);
  }

  private renderCell(i: number): void {
    const content = this.contents[i];
    if (!content) return;
    content.removeAllChildren();
    const id = this.itemIds[i];
    if (id) {
      const it = mergeItemById(id);
      if (it) {
        const drew = it.artKey ? ArtService.makeSprite(content, it.artKey, 58, 58, 0, 0, 'mi') !== null : false;
        if (!drew && it.glyph) makeLabel('mi', content, it.glyph, 32, 0, 0, COLOR.text);
      }
    }
    if (i === this.selected) {
      roundRect('sel', content, CELL_W - 4, CELL_H - 4, 0, 0, 10, new Color(0, 0, 0, 0), COLOR.primary);
    }
    // 最高阶成品：橙框 + 💰 角标，提示可出售
    if (id && this.isFinal(id)) {
      roundRect(`fin-ring-${i}`, content, CELL_W - 8, CELL_H - 8, 0, 0, 8,
        new Color(0, 0, 0, 0), COLOR.accent);
      makeLabel(`fin-tag-${i}`, content, '💰', 13, CELL_W / 2 - 16, -CELL_H / 2 + 13, COLOR.accent);
    }
  }

  /** 花金币买一个基础素材放入第一个空格；金币不足或格子已满时不扣钱 */
  private buy(baseId: string): void {
    const offer = BASE_OFFERS.find(o => o.id === baseId);
    if (!offer) return;
    const idx = this.itemIds.findIndex(id => id === null);
    if (idx === -1) {
      this.toast('格子已满，先合成腾出空格', COLOR.subtext);
      return;
    }
    if (!this.data.spend(offer.cost)) {
      this.toast('金币不足，先招待几位客人吧', COLOR.red);
      return;
    }
    this.itemIds[idx] = baseId;
    this.persist();
    this.renderGrid();
  }

  /** 免费生成器：30 秒冷却，随机产出一种基础素材（金币购买是即时加速项） */
  private gen(): void {
    const now = Date.now();
    if (now < this.genCdEnd) {
      this.toast(`生成器冷却中 ${Math.ceil((this.genCdEnd - now) / 1000)}s`, COLOR.subtext);
      return;
    }
    const idx = this.itemIds.findIndex(id => id === null);
    if (idx === -1) {
      this.toast('格子已满，先合成腾出空格', COLOR.subtext);
      return;
    }
    const baseId = MERGE_BASE_IDS[Math.floor(Math.random() * MERGE_BASE_IDS.length)];
    this.itemIds[idx] = baseId;
    this.genCdEnd = now + 30000;
    this.persist();
    this.renderGrid();
  }

  private toast(text: string, color: Color): void {
    const lab = makeLabel('merge-toast', this.root, text, 15, 0, -80, color);
    lab.isBold = true;
    tween(lab.node)
      .delay(1.2)
      .call(() => lab.node.destroy())
      .start();
  }

  private isFinal(id: string | null): boolean {
    return !!id && mergeNext(id) === null;
  }

  private sellValue(id: string): number {
    return mergeItemById(id)?.sell ?? 0;
  }

  private onCellTap(i: number): void {
    const id = this.itemIds[i];
    if (this.selected === -1) {
      if (id) {
        this.selected = i;
        // 最高阶成品不能再合成：提示并进入出售流程（再点一次卖出）
        if (this.isFinal(id)) {
          this.toast(`已研发完成 · 再点一次出售 +${this.sellValue(id)}🪙`, COLOR.accent);
        }
      }
    } else if (this.selected === i) {
      if (this.isFinal(id)) {
        const v = this.sellValue(id);
        this.data.coins += v;
        this.itemIds[i] = null;
        this.selected = -1;
        this.toast(`成品售出 +${v}🪙`, COLOR.accent);
      } else {
        this.selected = -1;
      }
    } else {
      const selId = this.itemIds[this.selected];
      if (id && selId && id === selId && !this.isFinal(id)) {
        const next = mergeNext(id);
        if (next) {
          this.itemIds[i] = next;
          this.itemIds[this.selected] = null;
          this.selected = -1;
          this.maybeUnlock(next);
        } else {
          this.selected = -1;
        }
      } else {
        this.selected = id ? i : -1;
      }
    }
    this.persist();
    this.renderGrid();
  }

  private maybeUnlock(id: string): void {
    const it = mergeItemById(id);
    if (it && it.unlocksDishId && !this.data.dishUnlocked(it.unlocksDishId)) {
      this.data.mergeUnlockDish(it.unlocksDishId);
      this.renderChains();
      // 解锁即"新菜研发成功"：收起合成台，播放店里人的剧情反应
      const dishId = it.unlocksDishId;
      this.close();
      this.onUnlock?.(dishId);
    }
  }

  private persist(): void {
    this.data.mergeGrid = [...this.itemIds];
    this.save();
  }

  private close(): void {
    this.persist();
    this.root.active = false;
  }
}
