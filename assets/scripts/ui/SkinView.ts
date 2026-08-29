import { Button, Color, Label, Node } from 'cc';
import { GameData } from '../core/gameData';
import { SKINS } from '../core/skins';
import { COLOR, makeLabel, makeNode, makeRect, panelWithShadow, pillButton, roundRect } from './Widgets';
import { ArtService } from './ArtView';

export class SkinView {
  private overlay!: Node;
  private panel!: Node;
  private list!: Node;
  isOpen = false;

  constructor(
    parent: Node,
    private onApply: () => void,
    private onChange: () => void,
  ) {
    this.overlay = makeRect('skin-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 90));
    this.overlay.active = false;
    this.overlay.on(Node.EventType.TOUCH_START, () => this.close());

    this.panel = ArtService.panelWithArt('skin-panel', parent, 'panel-popup', 560, 420, 0, 0);
    this.panel.active = false;
    const skinTitleIcon = ArtService.attachIconSprite(this.panel, 'icon-brush', -86, 175, 28);
    makeLabel('skin-title', this.panel, `${skinTitleIcon ? '' : '🎨 '}装修小店`, 24, skinTitleIcon ? -12 : 0, 175, COLOR.text);
    this.list = makeNode('skin-list', this.panel, 500, 300, 0, -10);

    const close = makeRect('skin-close', this.panel, 40, 40, 260, 190, COLOR.panel);
    close.addComponent(Button);
    makeLabel('skin-x', close, '✕', 24, 0, 0, COLOR.subtext);
    close.on(Button.EventType.CLICK, () => this.close());
  }

  open(data: GameData): void {
    this.isOpen = true;
    this.overlay.active = true;
    this.panel.active = true;
    this.render(data);
  }

  private render(data: GameData): void {
    this.list.removeAllChildren();
    SKINS.forEach((s, i) => {
      const y = 120 - i * 64;
      const row = roundRect(`skin-row-${i}`, this.list, 480, 54, 0, y, 12, COLOR.panel, COLOR.border);
      row.addComponent(Button);
      const skinIcon = ArtService.attachIconSprite(row, s.iconArtKey, -200, 0, 40);
      if (!skinIcon) makeLabel(`skin-ic-${i}`, row, s.icon, 28, -200, 0, COLOR.text);
      makeLabel(`skin-nm-${i}`, row, s.name, 18, -150, 8, COLOR.text);
      const owned = data.skinOwned(s.id);
      const active = data.activeSkinId === s.id;
      const right = makeLabel(`skin-st-${i}`, row, '', 16, 150, 0, COLOR.subtext);
      if (active) {
        right.string = '使用中';
        right.color = COLOR.green;
      } else if (owned) {
        right.string = '装备';
        right.color = COLOR.primary;
      } else {
        right.string = `💰 ${s.cost}`;
        right.color = data.coins >= s.cost ? COLOR.accent : COLOR.subtext;
      }
      row.getComponent(Button)!.interactable = !active;
      row.on(Button.EventType.CLICK, () => {
        if (active) return;
        if (owned) {
          data.setSkin(s.id);
        } else {
          if (!data.unlockSkin(s.id)) return;
        }
        this.onApply();
        this.onChange();
        this.render(data);
      });
    });
  }

  close(): void {
    this.isOpen = false;
    this.overlay.active = false;
    this.panel.active = false;
  }
}
