import { Button, Color, Label, Node, tween, Vec3 } from 'cc';
import { COLOR, makeLabel, makeRect, panelWithShadow, pillButton, restyleCard, roundRect } from './Widgets';

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
  private overlay!: Node;
  private panel!: Node;
  private infoLabel!: Label;
  private tableBtn!: Node;
  private kitchenBtn!: Node;
  private tableLabel!: Label;
  private kitchenLabel!: Label;
  isOpen = false;

  constructor(
    private parent: Node,
    private cb: { onUpgradeTable: () => void; onUpgradeKitchen: () => void },
  ) {
    this.overlay = makeRect('upgrade-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 90));
    this.overlay.active = false;

    this.panel = panelWithShadow('upgrade-panel', parent, 520, 320, 0, 0, 20, COLOR.panel, COLOR.border);
    this.panel.active = false;
    makeLabel('up-title', this.panel, '✨ 餐厅升级', 24, 0, 120, COLOR.text);
    this.infoLabel = makeLabel('info', this.panel, '', 16, 0, 78, COLOR.subtext);

    this.tableBtn = roundRect('tb', this.panel, 220, 80, -120, -20, 14, COLOR.panel, COLOR.border);
    this.tableBtn.addComponent(Button);
    makeLabel('tb-icon', this.tableBtn, '🪑', 28, -80, 0, COLOR.text);
    this.tableLabel = makeLabel('tb-info', this.tableBtn, '', 14, 10, 0, COLOR.text);
    this.tableBtn.on(Button.EventType.CLICK, () => this.cb.onUpgradeTable());

    this.kitchenBtn = roundRect('kb', this.panel, 220, 80, 120, -20, 14, COLOR.panel, COLOR.border);
    this.kitchenBtn.addComponent(Button);
    makeLabel('kb-icon', this.kitchenBtn, '⚡', 28, -80, 0, COLOR.text);
    this.kitchenLabel = makeLabel('kb-info', this.kitchenBtn, '', 14, 10, 0, COLOR.text);
    this.kitchenBtn.on(Button.EventType.CLICK, () => this.cb.onUpgradeKitchen());

    // 右上角 ✕ 关闭
    const closeBtn = makeRect('close-btn', this.panel, 40, 40, 230, 135, COLOR.panel);
    closeBtn.addComponent(Button);
    makeLabel('close-x', closeBtn, '✕', 24, 0, 0, COLOR.subtext);
    closeBtn.on(Button.EventType.CLICK, () => this.close());
  }

  open(): void {
    this.isOpen = true;
    this.overlay.active = true;
    this.panel.active = true;
    this.panel.scale = new Vec3(0.9, 0.9, 1);
    tween(this.panel).to(0.12, { scale: new Vec3(1, 1, 1) }).start();
  }

  close(): void {
    this.isOpen = false;
    tween(this.panel)
      .to(0.1, { scale: new Vec3(0.9, 0.9, 1) })
      .call(() => {
        this.panel.active = false;
        this.overlay.active = false;
      })
      .start();
  }

  refresh(d: UpgradeData): void {
    this.infoLabel.string = `金币 ${d.coins}`;
    this.styleCard(
      this.tableBtn, this.tableLabel, d.tableMaxed ? '已满级' : `桌 ${d.tableLevel} → ${d.tableLevel + 1}\n费用 ${d.tableCost} 🪙`,
      d.tableMaxed || d.coins < d.tableCost,
    );
    this.styleCard(
      this.kitchenBtn, this.kitchenLabel,
      d.kitchenMaxed ? '已满级' : `厨房 L${d.kitchenLevel} → L${d.kitchenLevel + 1}\n费用 ${d.kitchenCost} 🪙`,
      d.kitchenMaxed || d.coins < d.kitchenCost,
    );
  }

  private styleCard(btn: Node, label: Label, text: string, disabled: boolean): void {
    label.string = text;
    btn.getComponent(Button)!.interactable = !disabled;
    if (disabled) {
      restyleCard(btn, new Color(156, 133, 104, 80), COLOR.border, 14);
    } else {
      restyleCard(btn, COLOR.panel, COLOR.accent, 14);
    }
  }
}
