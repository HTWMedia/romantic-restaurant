import { Color, Label, Node, tween, Vec3 } from 'cc';
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

  constructor(parent: Node, upgradeCb: () => void, chapterCb: () => void, adCb: () => void, mergeCb: () => void) {
    ArtService.panelWithArt('hud-bg', parent, 'panel-hud', 920, 58, 0, 293);

    // 金币徽章块
    roundRect('coin-badge', parent, 150, 38, -410, 293, 19, new Color(255, 201, 77, 60));
    const coinIcon = ArtService.attachIconSprite(parent, 'icon-coin', -460, 293, 26);
    if (!coinIcon) makeLabel('coin-icon', parent, '🪙', 20, -460, 293, COLOR.accent);
    this.coinsLabel = makeLabel('coins', parent, '0', 20, -370, 293, COLOR.text);
    this.coinsLabel.isBold = true;

    // 体力按钮（点=看广告恢复）
    this.energyBtn = pillButton('energy-btn', parent, 120, 34, -300, 293, COLOR.primary, '12/12', adCb);
    this.energyLabel = this.energyBtn.getComponentInChildren(Label)!;
    const energyIcon = ArtService.attachIconSprite(this.energyBtn, 'icon-energy', -38, 0, 26);
    this.energyHasIcon = energyIcon !== null;

    // 在店人数
    const custIcon = ArtService.attachIconSprite(parent, 'icon-customer', -128, 293, 24);
    this.custHasIcon = custIcon !== null;
    this.custLabel = makeLabel('customers', parent, '在店 0', 18, -112, 293, COLOR.text);

    // 等级标签
    this.tableLevelLabel = this.tag(parent, '桌 L1', 170);
    this.kitchenLevelLabel = this.tag(parent, '厨 L1', 250);

    this.comboLabel = makeLabel('combo', parent, '', 18, 70, 293, COLOR.accent);
    this.comboLabel.isBold = true;
    this.comboLabel.node.active = false;

    this.chapterBtn = pillButton('chapter-btn', parent, 100, 34, 335, 293, COLOR.accent, '第1章', chapterCb);
    ArtService.attachIconSprite(this.chapterBtn, 'icon-chapter', -30, 0, 24);

    pillButton('merge-btn', parent, 80, 34, -195, 293, COLOR.accent, '合成台', mergeCb);
    pillButton('upgrade-btn', parent, 90, 34, 435, 293, COLOR.primary, '升级', upgradeCb);
  }

  setChapter(index: number, total: number, stars: number): void {
    const label = this.chapterBtn.getComponentInChildren(Label)!;
    label.string = `${ArtService.hasArt('icon-chapter') ? '' : '📖 '}第${index + 1}/${total}章 ⭐${stars}`;
  }

  setEnergy(cur: number, max: number): void {
    const base = cur <= 0 ? '看广告恢复' : `${cur}/${max}`;
    this.energyLabel.string = this.energyHasIcon ? base : `⚡ ${base}`;
  }

  setCombo(combo: number, mult: number): void {
    if (combo <= 1) {
      this.comboLabel.node.active = false;
      return;
    }
    this.comboLabel.node.active = true;
    this.comboLabel.string = `连击 x${combo}（${mult.toFixed(1)}倍）`;
    tween(this.comboLabel.node)
      .to(0.12, { scale: new Vec3(1.2, 1.2, 1) })
      .to(0.12, { scale: new Vec3(1, 1, 1) })
      .start();
  }

  private tag(parent: Node, text: string, x: number): Label {
    roundRect(`tag-bg`, parent, 92, 26, x, 293, 13, new Color(255, 138, 92, 40));
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
    this.custLabel.string = `${this.custHasIcon ? '' : '🧑 '}在店 ${d.customers}`;
    this.tableLevelLabel.string = `桌 L${d.tableLevel}`;
    this.kitchenLevelLabel.string = `厨 L${d.kitchenLevel}`;
  }
}
