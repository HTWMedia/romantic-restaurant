import { Button, Label, Node } from 'cc';
import { COLOR, makeButton, makeLabel, makeRect } from './Widgets';

export interface UpgradeData {
  coins: number;
  tableLevel: number;
  kitchenLevel: number;
  tableCost: number;
  kitchenCost: number;
  tableMaxed: boolean;
  kitchenMaxed: boolean;
}

export class UpgradeView {
  private panel!: Node;
  private infoLabel!: Label;
  private tableBtn!: Node;
  private kitchenBtn!: Node;
  isOpen = false;

  constructor(
    private parent: Node,
    private cb: { onUpgradeTable: () => void; onUpgradeKitchen: () => void },
  ) {
    this.panel = makeRect('upgrade-panel', parent, 520, 320, 0, 0, COLOR.panel);
    this.panel.active = false;
    makeLabel('up-title', this.panel, '餐厅升级', 24, 0, 120, COLOR.text);
    this.infoLabel = makeLabel('info', this.panel, '', 16, 0, 60, COLOR.text);
    this.tableBtn = makeButton('tb', this.panel, 200, 56, -110, -20, COLOR.primary, '加桌位', () => this.cb.onUpgradeTable());
    this.kitchenBtn = makeButton('kb', this.panel, 200, 56, 110, -20, COLOR.primary, '厨房提速', () => this.cb.onUpgradeKitchen());
    makeButton('close', this.panel, 80, 36, 200, 130, COLOR.red, '关闭', () => this.close());
  }

  open(): void { this.isOpen = true; this.panel.active = true; }
  close(): void { this.isOpen = false; this.panel.active = false; }

  refresh(d: UpgradeData): void {
    this.infoLabel.string =
      `金币 ${d.coins}\n桌位等级 ${d.tableLevel}（当前 ${d.tableLevel} 桌）\n厨房等级 ${d.kitchenLevel}`;
    this.styleBtn(this.tableBtn, d.tableMaxed ? '已满级' : `加桌位 ${d.tableCost}💰`, d.tableMaxed || d.coins < d.tableCost);
    this.styleBtn(this.kitchenBtn, d.kitchenMaxed ? '已满级' : `厨房提速 ${d.kitchenCost}💰`, d.kitchenMaxed || d.coins < d.kitchenCost);
  }

  private styleBtn(btn: Node, text: string, disabled: boolean): void {
    const label = btn.getComponentInChildren(Label);
    if (label) label.string = text;
    btn.getComponent(Button)!.interactable = !disabled;
  }
}
