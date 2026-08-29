import { Button, Color, Label, Node, Vec3 } from 'cc';
import { Dish } from '../core/types';
import { COLOR, makeLabel, makeRect, panelWithShadow, roundRect } from './Widgets';
import { ArtService } from './ArtView';

export class MenuView {
  private root!: Node;
  private selectedId: string | null = null;

  constructor(
    private parent: Node,
    private onSelect: (id: string) => void,
    private onTryUnlock: (id: string) => void,
  ) {
    this.root = ArtService.panelWithArt('menu-panel', parent, 'panel-menu', 920, 110, 0, -265);
    makeLabel('title', parent, '菜谱', 18, -420, -300, COLOR.text);
  }

  rebuild(available: Dish[], locked: Dish[], coins: number): void {
    this.root.removeAllChildren();
    available.forEach((d, i) => {
      const selected = d.id === this.selectedId;
      const card = roundRect(
        `dish-${d.id}`, this.root, 96, 96, -330 + i * 118, 0, 12,
        selected ? new Color(255, 138, 92, 45) : COLOR.panel,
        selected ? COLOR.primary : COLOR.border,
      );
      card.addComponent(Button);
      if (selected) card.scale = new Vec3(1.05, 1.05, 1);
      const art = ArtService.makeSprite(card, d.artKey, 64, 64, 0, 8, 'dish-art');
      if (!art) {
        makeLabel('name', card, d.name, 14, 0, 0, COLOR.text);
        card.on(Button.EventType.CLICK, () => this.pick(d.id));
        return;
      }
      const nameL = makeLabel('name', card, d.name, 14, 0, -30, COLOR.text);
      nameL.isBold = true;
      makeLabel('price', card, `${d.price} 🪙`, 11, 0, -44, COLOR.accent);
      card.on(Button.EventType.CLICK, () => this.pick(d.id));
    });
    locked.forEach((d, i) => {
      const afford = coins >= d.unlockCost;
      const card = roundRect(
        `lock-${d.id}`, this.root, 96, 96, -330 + (available.length + i) * 118, 0, 12,
        new Color(156, 133, 104, 60),
        afford ? COLOR.accent : COLOR.border,
      );
      card.addComponent(Button);
      const art = ArtService.makeSprite(card, d.artKey, 64, 64, 0, 8, 'dish-art');
      if (!art) {
        const lockIcon = ArtService.attachIconSprite(card, 'icon-lock', -46, -4, 18);
        const nameL = makeLabel('name', card, `${lockIcon ? '' : '🔒 '}${d.name}`, 14, lockIcon ? 8 : 0, 14, COLOR.subtext);
        nameL.isBold = true;
        makeLabel('price', card, `${d.unlockCost} 🪙`, 12, 0, -18, afford ? COLOR.accent : COLOR.subtext);
        card.on(Button.EventType.CLICK, () => this.onTryUnlock(d.id));
        return;
      }
      // 菜品图变暗 + 锁图标
      this.darken(card);
      ArtService.attachIconSprite(card, 'icon-lock', 0, 8, 20);
      const nameL = makeLabel('name', card, d.name, 14, 0, -30, COLOR.subtext);
      nameL.isBold = true;
      makeLabel('price', card, `${d.unlockCost} 🪙`, 11, 0, -44, afford ? COLOR.accent : COLOR.subtext);
      card.on(Button.EventType.CLICK, () => this.onTryUnlock(d.id));
    });
  }

  /** 在主视觉菜品图位置叠一层半透明深灰罩（圆角），表达锁定态 */
  private darken(card: Node): void {
    makeRect('lock-veil', card, 64, 64, 0, 8, new Color(90, 70, 50, 90));
  }

  setSelected(id: string | null): void {
    this.selectedId = id;
  }

  private pick(id: string): void {
    this.selectedId = id;
    this.onSelect(id);
  }
}
