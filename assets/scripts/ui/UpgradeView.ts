import { Button, Color, Label, Node, ScrollView, tween, Vec3 } from 'cc';
import { kitchenSlotCount, tableCountAtLevel } from '../core/gameData';
import { bonusText, DECOR_ITEMS, DECOR_SLOT_LABELS, decorById, DecorItem } from '../core/decor';
import { COLOR, makeLabel, makeNode, makeRect, panelWithShadow, pillButton, restyleCard, roundRect } from './Widgets';
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

  // 装饰品商店
  private decorPanel!: Node;
  private bonusLabel!: Label;
  private decorContent!: Node;
  private ownedDecorIds: string[] = [];
  private onBuyDecor?: (id: string) => void;

  // 标签页
  private tabUpgrade!: Node;
  private tabDecor!: Node;
  private upgradePage!: Node;
  private decorPage!: Node;

  constructor(
    private parent: Node,
    private cb: { onUpgradeTable: () => void; onUpgradeKitchen: () => void; onSkins: () => void },
  ) {
    this.overlay = makeRect('upgrade-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 90));
    this.overlay.active = false;

    this.panel = ArtService.panelWithArt('upgrade-panel', parent, 'panel-popup', 520, 460, 0, 0);
    this.panel.active = false;
    makeLabel('up-title', this.panel, '✨ 餐厅升级', 24, 0, 195, COLOR.text);

    // 标签页按钮
    this.tabUpgrade = roundRect('tab-up', this.panel, 120, 34, -80, 162, 10, COLOR.panel, COLOR.primary);
    this.tabUpgrade.addComponent(Button);
    makeLabel('tab-up-lbl', this.tabUpgrade, '🔧 升级', 14, 0, 0, COLOR.text);
    this.tabUpgrade.on(Button.EventType.CLICK, () => this.switchTab('upgrade'));

    this.tabDecor = roundRect('tab-dc', this.panel, 120, 34, 80, 162, 10, COLOR.panel, COLOR.border);
    this.tabDecor.addComponent(Button);
    makeLabel('tab-dc-lbl', this.tabDecor, '🎨 装饰', 14, 0, 0, COLOR.subtext);
    this.tabDecor.on(Button.EventType.CLICK, () => this.switchTab('decor'));

    // —— 升级页面 ——
    this.upgradePage = makeNode('upgrade-page', this.panel, 480, 300, 0, 10);
    this.upgradePage.active = true;
    this.infoLabel = makeLabel('info', this.upgradePage, '', 15, 0, 120, COLOR.subtext);

    this.tableBtn = roundRect('tb', this.upgradePage, 220, 80, -110, 20, 14, COLOR.panel, COLOR.border);
    this.tableBtn.addComponent(Button);
    if (!ArtService.attachIconSprite(this.tableBtn, 'icon-chair', -80, 0, 30))
      makeLabel('tb-icon', this.tableBtn, '🪑', 28, -80, 0, COLOR.text);
    this.tableLabel = makeLabel('tb-info', this.tableBtn, '', 14, 10, 0, COLOR.text);
    this.tableBtn.on(Button.EventType.CLICK, () => {
      if (this.tableDisabled) { this.warnInsufficient(this.tableDiff, this.tableBtn, this.tableMaxed); return; }
      this.cb.onUpgradeTable();
    });

    this.kitchenBtn = roundRect('kb', this.upgradePage, 220, 80, 110, 20, 14, COLOR.panel, COLOR.border);
    this.kitchenBtn.addComponent(Button);
    if (!ArtService.attachIconSprite(this.kitchenBtn, 'icon-kitchen', -80, 0, 30))
      makeLabel('kb-icon', this.kitchenBtn, '⚡', 28, -80, 0, COLOR.text);
    this.kitchenLabel = makeLabel('kb-info', this.kitchenBtn, '', 14, 10, 0, COLOR.text);
    this.kitchenBtn.on(Button.EventType.CLICK, () => {
      if (this.kitchenDisabled) { this.warnInsufficient(this.kitchenDiff, this.kitchenBtn, this.kitchenMaxed); return; }
      this.cb.onUpgradeKitchen();
    });

    const entry = pillButton('skin-entry', this.upgradePage, 440, 36, 0, -60, COLOR.accent,
      '🎨 装修小店（整套风格）', () => this.cb.onSkins());
    const brushIcon = ArtService.attachIconSprite(entry, 'icon-brush', -160, 0, 24);
    if (brushIcon) {
      const lbl = entry.getComponentInChildren(Label);
      if (lbl) lbl.string = '装修小店（整套风格）';
    }

    this.msgLabel = makeLabel('up-msg', this.upgradePage, '', 14, 0, -100, COLOR.red);

    // —— 装饰品页面 ——
    this.decorPage = makeNode('decor-page', this.panel, 480, 340, 0, 10);
    this.decorPage.active = false;
    this.bonusLabel = makeLabel('bonus-summary', this.decorPage, '', 13, 0, 145, COLOR.subtext);
    makeLabel('decor-hint', this.decorPage, '购买装饰品摆进餐厅 · 每件有独立加成 · 可自由搭配', 12, 0, 125, COLOR.subtext);

    // 装饰品列表（可滚动）
    const scrollArea = makeNode('scroll-area', this.decorPage, 480, 280, 0, -20);
    const clip = makeRect('scroll-clip', scrollArea, 480, 280, 0, 0, new Color(0, 0, 0, 0));
    clip.getComponent('cc.UITransform')?.['setClipEnabled']?.(true);
    this.decorContent = makeNode('decor-content', scrollArea, 480, 600, 0, 0);
    this.renderDecorList();

    // 右上角 ✕ 关闭
    const closeBtn = makeRect('close-btn', this.panel, 40, 40, 230, 200, COLOR.panel);
    closeBtn.addComponent(Button);
    makeLabel('close-x', closeBtn, '✕', 24, 0, 0, COLOR.subtext);
    closeBtn.on(Button.EventType.CLICK, () => this.close());
  }

  private switchTab(tab: 'upgrade' | 'decor'): void {
    if (tab === 'upgrade') {
      this.upgradePage.active = true;
      this.decorPage.active = false;
      restyleCard(this.tabUpgrade, COLOR.panel, COLOR.primary, 10);
      restyleCard(this.tabDecor, COLOR.panel, COLOR.border, 10);
      const upLbl = this.tabUpgrade.getChildByName('tab-up-lbl')?.getComponent(Label);
      const dcLbl = this.tabDecor.getChildByName('tab-dc-lbl')?.getComponent(Label);
      if (upLbl) upLbl.color = COLOR.text;
      if (dcLbl) dcLbl.color = COLOR.subtext;
    } else {
      this.upgradePage.active = false;
      this.decorPage.active = true;
      restyleCard(this.tabUpgrade, COLOR.panel, COLOR.border, 10);
      restyleCard(this.tabDecor, COLOR.panel, COLOR.primary, 10);
      const upLbl = this.tabUpgrade.getChildByName('tab-up-lbl')?.getComponent(Label);
      const dcLbl = this.tabDecor.getChildByName('tab-dc-lbl')?.getComponent(Label);
      if (upLbl) upLbl.color = COLOR.subtext;
      if (dcLbl) dcLbl.color = COLOR.text;
      this.renderDecorList();
    }
  }

  private renderDecorList(): void {
    if (!this.decorContent) return;
    this.decorContent.removeAllChildren();

    // 按槽位分组
    const slots: ('wall' | 'table' | 'floor' | 'ceiling')[] = ['wall', 'table', 'floor', 'ceiling'];
    let yOff = 120;
    for (const slot of slots) {
      makeLabel(`slot-${slot}`, this.decorContent, DECOR_SLOT_LABELS[slot], 14, -180, yOff, COLOR.accent);
      const items = DECOR_ITEMS.filter(d => d.slot === slot);
      items.forEach((item, i) => {
        const y = yOff - 22 - i * 58;
        this.makeDecorCard(item, -180 + (i % 2) * 200, y);
      });
      yOff -= 22 + items.length * 58 + 10;
    }

    // 更新加成汇总
    this.updateBonusSummary();
  }

  private makeDecorCard(item: DecorItem, x: number, y: number): void {
    const owned = this.ownedDecorIds.indexOf(item.id) !== -1;
    const card = roundRect(`dc-${item.id}`, this.decorContent, 180, 50, x + 90, y, 10,
      owned ? new Color(126, 217, 167, 60) : COLOR.panel, owned ? COLOR.green : COLOR.border);
    card.addComponent(Button);

    // 图标
    const icon = ArtService.attachIconSprite(card, item.artKey ?? '', -60, 0, 28);
    if (!icon) makeLabel(`dc-ic-${item.id}`, card, item.emoji, 20, -60, 0, COLOR.text);

    // 名称 + 加成
    makeLabel(`dc-nm-${item.id}`, card, item.name, 12, -20, 8, COLOR.text);
    const bText = bonusText(item.bonus);
    makeLabel(`dc-bn-${item.id}`, card, bText, 11, -20, -8,
      item.bonus.type === 'cook' || item.bonus.type === 'energy' ? COLOR.green : COLOR.accent);

    // 价格/已拥有
    if (owned) {
      makeLabel(`dc-pr-${item.id}`, card, '✓ 已拥有', 11, 60, 0, COLOR.green);
    } else {
      makeLabel(`dc-pr-${item.id}`, card, `${item.cost}🪙`, 12, 60, 0, COLOR.accent);
      card.on(Button.EventType.CLICK, () => this.onBuyDecor?.(item.id));
    }
  }

  private updateBonusSummary(): void {
    const totals: Record<string, number> = { coin: 0, patience: 0, cook: 0, tip: 0, energy: 0 };
    for (const id of this.ownedDecorIds) {
      const d = decorById(id);
      if (d) totals[d.bonus.type] += d.bonus.value;
    }
    const parts: string[] = [];
    if (totals.coin) parts.push(`+${totals.coin}% 收入`);
    if (totals.patience) parts.push(`+${totals.patience}% 耐心`);
    if (totals.cook) parts.push(`-${totals.cook}% 烹饪`);
    if (totals.tip) parts.push(`+${totals.tip}% 小费`);
    if (totals.energy) parts.push(`-${totals.energy}s 体力`);
    this.bonusLabel.string = parts.length ? `当前加成：${parts.join(' · ')}` : '暂无装饰品加成';
  }

  open(): void {
    this.isOpen = true;
    this.overlay.active = true;
    this.panel.active = true;
    this.panel.scale = new Vec3(0.9, 0.9, 1);
    tween(this.panel).to(0.12, { scale: new Vec3(1, 1, 1) }).start();
    this.switchTab('upgrade');
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

  /** 更新装饰品页面数据 */
  refreshDecor(ownedDecorIds: string[], coins: number, onBuy: (id: string) => void): void {
    this.ownedDecorIds = [...ownedDecorIds];
    this.onBuyDecor = onBuy;
    this.renderDecorList();
  }

  private styleCard(btn: Node, label: Label, text: string, disabled: boolean): void {
    label.string = text;
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
