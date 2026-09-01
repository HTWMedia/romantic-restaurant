import { Button, Color, Label, Node, tween, Vec3 } from 'cc';
import { COLOR, makeLabel, pillButton, panelWithShadow, roundRect } from './Widgets';
import { ArtService } from './ArtView';

export interface HudData {
  coins: number;
  customers: number;
  tableLevel: number;
  kitchenLevel: number;
}

export class HudView {
  private coinsLabel!: Label;
  private custLabel!: Label;
  private tableLevelLabel!: Label;
  private kitchenLevelLabel!: Label;
  private comboLabel!: Label;
  private chapterBtn!: Node;
  private energyBtn!: Node;
  private energyLabel!: Label;
  private lastCoins = -1;
  private energyHasIcon = false;
  private custHasIcon = false;

  constructor(parent: Node, upgradeCb: () => void, chapterCb: () => void, adCb: () => void, mergeCb: () => void, chatCb: () => void) {
    ArtService.panelWithArt('hud-bg', parent, 'panel-hud', 920, 58, 0, 293);

    // —— 左组：金币 / 体力 / 在店 / 合成台 ——
    roundRect('coin-badge', parent, 110, 38, -395, 293, 19, new Color(255, 201, 77, 60));
    const coinIcon = ArtService.attachIconSprite(parent, 'icon-coin', -432, 293, 26);
    if (!coinIcon) makeLabel('coin-icon', parent, '🪙', 20, -432, 293, COLOR.accent);
    this.coinsLabel = makeLabel('coins', parent, '0', 20, -378, 293, COLOR.text);
    this.coinsLabel.isBold = true;

    const energy = this.iconPill('energy-btn', parent, 96, -282, COLOR.primary, 'icon-energy', '⚡', adCb);
    this.energyBtn = energy.node;
    this.energyLabel = energy.label;
    this.energyHasIcon = energy.hasIcon;

    const cust = this.iconPill('cust-pill', parent, 96, -174, new Color(255, 201, 77, 60), 'icon-customer', '🧑', null);
    this.custHasIcon = cust.hasIcon;
    this.custLabel = cust.label;

    pillButton('merge-btn', parent, 88, 34, -74, 293, COLOR.accent, '合成台', mergeCb);
    this.comboLabel = makeLabel('combo', parent, '', 15, 17, 293, COLOR.accent);
    this.comboLabel.isBold = true;
    this.comboLabel.node.active = false;

    // —— 右组：桌等级 / 厨等级 / 章节 / 升级 ——
    this.tableLevelLabel = this.tag(parent, '桌 L1', 100);
    this.kitchenLevelLabel = this.tag(parent, '厨 L1', 184);
    this.chapterBtn = pillButton('chapter-btn', parent, 100, 34, 288, 293, COLOR.accent, '第1章', chapterCb);
    pillButton('chat-btn', parent, 60, 34, 372, 293, COLOR.primary, '💬 聊天', chatCb);
    pillButton('upgrade-btn', parent, 56, 34, 432, 293, COLOR.primary, '升级', upgradeCb);
  }

  /** 图标 + 数字的药丸：图标固定在左侧，文字在剩余空间居中，互不重叠 */
  private iconPill(
    name: string, parent: Node, w: number, x: number,
    bg: Color, iconKey: string, fallbackIcon: string, cb: (() => void) | null,
  ): { node: Node; label: Label; hasIcon: boolean } {
    const y = 293;
    const h = 34;
    const n = roundRect(name, parent, w, h, x, y, h / 2, bg);
    if (cb) {
      n.addComponent(Button);
      n.on(Button.EventType.CLICK, cb);
    }
    const hasIcon = ArtService.attachIconSprite(n, iconKey, -w / 2 + 22, 0, 26) !== null;
    if (!hasIcon) makeLabel(name + '-ic', n, fallbackIcon, 18, -w / 2 + 22, 0, COLOR.accent);
    const label = makeLabel(name + '-text', n, '', 16, 16, 0, COLOR.text);
    return { node: n, label, hasIcon };
  }

  setChapter(index: number, total: number, stars: number): void {
    const label = this.chapterBtn.getComponentInChildren(Label)!;
    label.string = `第${index + 1}/${total}章 ⭐${stars}`;
    label.fontSize = 15;
  }

  setEnergy(cur: number, max: number): void {
    this.energyLabel.string = cur <= 0 ? '看广告' : `${cur}/${max}`;
  }

  setCombo(combo: number, mult: number): void {
    if (combo <= 1) {
      this.comboLabel.node.active = false;
      return;
    }
    this.comboLabel.node.active = true;
    this.comboLabel.string = `x${combo} · ${mult.toFixed(1)}倍`;
    tween(this.comboLabel.node)
      .to(0.12, { scale: new Vec3(1.2, 1.2, 1) })
      .to(0.12, { scale: new Vec3(1, 1, 1) })
      .start();
  }

  private tag(parent: Node, text: string, x: number): Label {
    roundRect(`tag-bg`, parent, 72, 26, x, 293, 13, new Color(255, 138, 92, 40));
    return makeLabel(`tag-text`, parent, text, 14, x, 293, COLOR.text);
  }

  refresh(d: HudData): void {
    if (d.coins !== this.lastCoins) {
      this.lastCoins = d.coins;
      this.coinsLabel.string = `${d.coins}`;
      tween(this.coinsLabel.node)
        .to(0.12, { scale: new Vec3(1.2, 1.2, 1) })
        .to(0.12, { scale: new Vec3(1, 1, 1) })
        .start();
    }
    this.custLabel.string = `在店 ${d.customers}`;
    this.tableLevelLabel.string = `桌 L${d.tableLevel}`;
    this.kitchenLevelLabel.string = `厨 L${d.kitchenLevel}`;
  }
}
