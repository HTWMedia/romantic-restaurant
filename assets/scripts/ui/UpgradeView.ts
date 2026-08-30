import { Button, Color, Label, Node, tween, Vec3 } from 'cc';
import { kitchenSlotCount, tableCountAtLevel } from '../core/gameData';
import { COLOR, makeLabel, makeRect, panelWithShadow, pillButton, restyleCard, roundRect } from './Widgets';
import { ArtService } from './ArtView';

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
  private msgLabel!: Label;
  private tableDiff = 0;
  private kitchenDiff = 0;
  private tableDisabled = true;
  private kitchenDisabled = true;
  private tableMaxed = false;
  private kitchenMaxed = false;
  isOpen = false;

  constructor(
    private parent: Node,
    private cb: { onUpgradeTable: () => void; onUpgradeKitchen: () => void; onSkins: () => void },
  ) {
    this.overlay = makeRect('upgrade-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 90));
    this.overlay.active = false;

    this.panel = ArtService.panelWithArt('upgrade-panel', parent, 'panel-popup', 520, 320, 0, 0);
    this.panel.active = false;
    makeLabel('up-title', this.panel, '✨ 餐厅升级', 24, 0, 120, COLOR.text);
    this.infoLabel = makeLabel('info', this.panel, '', 16, 0, 78, COLOR.subtext);
    this.msgLabel = makeLabel('up-msg', this.panel, '', 15, 0, -75, COLOR.red);

    this.tableBtn = roundRect('tb', this.panel, 220, 80, -120, -20, 14, COLOR.panel, COLOR.border);
    this.tableBtn.addComponent(Button);
    if (!ArtService.attachIconSprite(this.tableBtn, 'icon-chair', -80, 0, 30))
      makeLabel('tb-icon', this.tableBtn, '🪑', 28, -80, 0, COLOR.text);
    this.tableLabel = makeLabel('tb-info', this.tableBtn, '', 14, 10, 0, COLOR.text);
    this.tableBtn.on(Button.EventType.CLICK, () => {
      if (this.tableDisabled) { this.warnInsufficient(this.tableDiff, this.tableBtn, this.tableMaxed); return; }
      this.cb.onUpgradeTable();
    });

    this.kitchenBtn = roundRect('kb', this.panel, 220, 80, 120, -20, 14, COLOR.panel, COLOR.border);
    this.kitchenBtn.addComponent(Button);
    if (!ArtService.attachIconSprite(this.kitchenBtn, 'icon-kitchen', -80, 0, 30))
      makeLabel('kb-icon', this.kitchenBtn, '⚡', 28, -80, 0, COLOR.text);
    this.kitchenLabel = makeLabel('kb-info', this.kitchenBtn, '', 14, 10, 0, COLOR.text);
    this.kitchenBtn.on(Button.EventType.CLICK, () => {
      if (this.kitchenDisabled) { this.warnInsufficient(this.kitchenDiff, this.kitchenBtn, this.kitchenMaxed); return; }
      this.cb.onUpgradeKitchen();
    });

    const entry = pillButton('skin-entry', this.panel, 440, 40, 0, -120, COLOR.accent,
      '🎨 装修小店', () => this.cb.onSkins());
    const brushIcon = ArtService.attachIconSprite(entry, 'icon-brush', -120, 0, 26);
    if (brushIcon) {
      const lbl = entry.getComponentInChildren(Label);
      if (lbl) lbl.string = '装修小店';
    }

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
    // 下一级奖励预告：让玩家升级前知道能得到什么（借鉴《浪漫餐厅》等级福利预览）
    const nextTables = d.tableMaxed ? d.tableLevel : d.tableLevel + 1;
    const nextSlots = d.kitchenMaxed ? d.kitchenLevel : d.kitchenLevel + 1;
    const preview = d.tableMaxed && d.kitchenMaxed
      ? '全部满级啦！'
      : `下一级：${tableCountAtLevel(nextTables)} 张桌 · ${kitchenSlotCount(nextSlots)} 个灶位`;
    this.infoLabel.string = `金币 ${d.coins} ｜ ${preview}`;
    this.tableDiff = Math.max(0, d.tableCost - d.coins);
    this.kitchenDiff = Math.max(0, d.kitchenCost - d.coins);
    this.tableMaxed = d.tableMaxed;
    this.kitchenMaxed = d.kitchenMaxed;
    this.tableDisabled = d.tableMaxed || d.coins < d.tableCost;
    this.kitchenDisabled = d.kitchenMaxed || d.coins < d.kitchenCost;
    this.styleCard(
      this.tableBtn, this.tableLabel, d.tableMaxed ? '已满级' : `桌 ${d.tableLevel} → ${d.tableLevel + 1}\n费用 ${d.tableCost} 🪙`,
      this.tableDisabled,
    );
    this.styleCard(
      this.kitchenBtn, this.kitchenLabel,
      d.kitchenMaxed ? '已满级' : `厨房 L${d.kitchenLevel} → L${d.kitchenLevel + 1}\n费用 ${d.kitchenCost} 🪙`,
      this.kitchenDisabled,
    );
  }

  private styleCard(btn: Node, label: Label, text: string, disabled: boolean): void {
    label.string = text;
    // 按钮保持可点（点击时给出"金币不足"反馈），只做视觉置灰
    btn.getComponent(Button)!.interactable = true;
    if (disabled) {
      restyleCard(btn, new Color(156, 133, 104, 80), COLOR.border, 14);
    } else {
      restyleCard(btn, COLOR.panel, COLOR.accent, 14);
    }
  }

  /** 金币不足反馈：面板红字提示差额 + 目标按钮左右抖动 */
  private warnInsufficient(diff: number, node: Node, maxed: boolean): void {
    this.msgLabel.string = maxed ? '已满级，无需升级' : `金币不足，还差 ${diff}🪙`;
    this.msgLabel.color = maxed ? COLOR.subtext : COLOR.red;
    tween(this.msgLabel.node)
      .delay(1.6)
      .call(() => { this.msgLabel.string = ''; })
      .start();
    const p = node.position;
    tween(node)
      .to(0.05, { position: new Vec3(p.x + 8, p.y, 0) })
      .to(0.05, { position: new Vec3(p.x - 8, p.y, 0) })
      .to(0.05, { position: new Vec3(p.x + 4, p.y, 0) })
      .to(0.05, { position: new Vec3(p.x, p.y, 0) })
      .start();
  }
}
