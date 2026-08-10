import { Button, Label, Node } from 'cc';
import { Dish } from '../core/types';
import { COLOR, makeButton, makeLabel, makeRect } from './Widgets';

export class MenuView {
  private root!: Node;
  private selectedId: string | null = null;

  constructor(
    private parent: Node,
    private onSelect: (id: string) => void,
    private onTryUnlock: (id: string) => void,
  ) {
    this.root = makeRect('menu-panel', parent, 920, 110, 0, -265, COLOR.panel);
    makeLabel('title', parent, '菜谱', 18, -420, -300, COLOR.text);
  }

  rebuild(available: Dish[], locked: Dish[], coins: number): void {
    this.root.removeAllChildren();
    available.forEach((d, i) => {
      const btn = makeButton(
        `dish-${d.id}`, this.root, 130, 64,
        -360 + i * 150, 0, COLOR.primary, `${d.name}\n${d.price}💰`,
        () => this.pick(d.id),
      );
      if (d.id === this.selectedId) this.highlight(btn, true);
    });
    locked.forEach((d, i) => {
      const btn = makeButton(
        `lock-${d.id}`, this.root, 130, 64,
        -360 + (available.length + i) * 150, 0, coins >= d.unlockCost ? COLOR.accent : COLOR.gray,
        `${d.name}\n🔒${d.unlockCost}`,
        () => this.onTryUnlock(d.id),
      );
    });
  }

  setSelected(id: string | null): void {
    this.selectedId = id;
  }

  private pick(id: string): void {
    this.selectedId = id;
    this.onSelect(id);
  }

  private highlight(btn: Node, on: boolean): void {
    const l = btn.getComponentInChildren(Label);
    if (l) l.color = on ? COLOR.accent : COLOR.white;
  }
}
