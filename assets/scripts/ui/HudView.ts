import { Color, Label, Node, tween, Vec3 } from 'cc';
import { COLOR, makeLabel, pillButton, panelWithShadow, roundRect } from './Widgets';

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
  private lastCoins = -1;

  constructor(parent: Node, upgradeCb: () => void) {
    panelWithShadow('hud-bg', parent, 920, 58, 0, 293, 16, COLOR.panel, COLOR.border);

    // 金币徽章块
    roundRect('coin-badge', parent, 170, 38, -380, 293, 19, new Color(255, 201, 77, 60));
    makeLabel('coin-icon', parent, '🪙', 20, -440, 293, COLOR.accent);
    this.coinsLabel = makeLabel('coins', parent, '0', 20, -345, 293, COLOR.text);
    this.coinsLabel.isBold = true;

    // 在店人数
    this.custLabel = makeLabel('customers', parent, '🧑 在店 0', 18, 0, 293, COLOR.text);

    // 等级标签
    this.tableLevelLabel = this.tag(parent, '桌 L1', 215);
    this.kitchenLevelLabel = this.tag(parent, '厨 L1', 310);

    pillButton('upgrade-btn', parent, 90, 34, 425, 293, COLOR.primary, '升级', upgradeCb);
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
    this.custLabel.string = `🧑 在店 ${d.customers}`;
    this.tableLevelLabel.string = `桌 L${d.tableLevel}`;
    this.kitchenLevelLabel.string = `厨 L${d.kitchenLevel}`;
  }
}
