import { Color, Node } from 'cc';
import { GameData } from '../core/gameData';
import { MERGE_BASE_IDS, mergeItemById, mergeNext } from '../core/merge';
import { COLOR, makeLabel, makeNode, makeRect, pillButton, roundRect } from './Widgets';
import { ArtService } from './ArtView';

const COLS = 4;
const ROWS = 4;
const CELLS = COLS * ROWS;
const CELL_W = 120;
const CELL_H = 90;

export class MergeView {
  private root!: Node;
  private contents: Node[] = [];
  private itemIds: (string | null)[] = [];
  private selected = -1;

  constructor(private parent: Node, private data: GameData, private save: () => void) {
    this.itemIds = (this.data.mergeGrid && this.data.mergeGrid.length === CELLS)
      ? [...this.data.mergeGrid]
      : new Array(CELLS).fill(null);
    this.build();
  }

  open(): void { this.root.active = true; }

  private build(): void {
    this.root = makeNode('merge-root', this.parent, 960, 640, 0, 0);
    this.root.active = false;
    makeRect('merge-shade', this.root, 960, 640, 0, 0, new Color(0, 0, 0, 150))
      .on(Node.EventType.TOUCH_END, () => this.close());
    roundRect('merge-panel', this.root, 560, 460, 0, 40, 18, COLOR.panel, COLOR.border);
    makeLabel('merge-title', this.root, '🧩 合成台', 22, 0, 225, COLOR.text);
    makeLabel('merge-hint', this.root, '点两格相同素材即可合成升阶；产出素材放入空格', 13, 0, 195, COLOR.subtext);
    pillButton('merge-produce', this.root, 160, 38, -150, 150, COLOR.primary, '产出素材', () => this.produce());
    pillButton('merge-close', this.root, 90, 38, 150, 150, COLOR.border, '关闭', () => this.close());
    const grid = makeNode('merge-grid', this.root, COLS * CELL_W, ROWS * CELL_H, 0, -20);
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
        const drew = it.artKey ? ArtService.makeSprite(content, it.artKey, 72, 72, 0, 0, 'mi') !== null : false;
        if (!drew && it.glyph) makeLabel('mi', content, it.glyph, 36, 0, 0, COLOR.text);
      }
    }
    if (i === this.selected) {
      roundRect('sel', content, CELL_W - 4, CELL_H - 4, 0, 0, 10, new Color(0, 0, 0, 0), COLOR.primary);
    }
  }

  private produce(): void {
    const empties: number[] = [];
    for (let i = 0; i < CELLS; i++) if (!this.itemIds[i]) empties.push(i);
    if (empties.length === 0) {
      makeLabel('merge-toast', this.root, '格子已满', 16, 0, -200, COLOR.subtext);
      return;
    }
    const idx = empties[Math.floor(Math.random() * empties.length)];
    const base = MERGE_BASE_IDS[Math.floor(Math.random() * MERGE_BASE_IDS.length)];
    this.itemIds[idx] = base;
    this.persist();
    this.renderGrid();
  }

  private onCellTap(i: number): void {
    const id = this.itemIds[i];
    if (this.selected === -1) {
      if (id) this.selected = i;
    } else if (this.selected === i) {
      this.selected = -1;
    } else {
      const selId = this.itemIds[this.selected];
      if (id && selId && id === selId) {
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
      makeLabel('merge-toast', this.root, `解锁新菜：${it.name}`, 18, 0, -200, COLOR.accent);
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
