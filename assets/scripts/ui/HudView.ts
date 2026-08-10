import { Label, Node } from 'cc';
import { COLOR, makeButton, makeLabel, makeRect } from './Widgets';

export interface HudData {
  coins: number;
  customers: number;
  tableLevel: number;
  kitchenLevel: number;
}

export class HudView {
  private coinsLabel!: Label;
  private custLabel!: Label;
  private levelLabel!: Label;

  constructor(parent: Node, upgradeCb: () => void) {
    makeRect('hud-bg', parent, 920, 54, 0, 293, COLOR.panel);
    this.coinsLabel = makeLabel('coins', parent, '金币 0', 20, -400, 293, COLOR.accent);
    this.custLabel = makeLabel('customers', parent, '在店 0', 18, 0, 293, COLOR.text);
    this.levelLabel = makeLabel('levels', parent, '桌 L1 · 厨 L1', 16, 250, 293, COLOR.text);
    makeButton('upgrade-btn', parent, 90, 34, 420, 293, COLOR.primary, '升级', upgradeCb);
  }

  refresh(d: HudData): void {
    this.coinsLabel.string = `金币 ${d.coins}`;
    this.custLabel.string = `在店 ${d.customers}`;
    this.levelLabel.string = `桌 L${d.tableLevel} · 厨 L${d.kitchenLevel}`;
  }
}
