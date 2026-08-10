import { _decorator, Component, Color, Graphics } from 'cc';
import { GameData } from '../core/gameData';
import { StorageService, BrowserKVStore } from '../core/storage';
import { dishById, DISHES } from '../core/dishes';
import { Dish } from '../core/types';
import {
  cookTimeAtLevel, tableCountAtLevel, tableUpgradeCost, kitchenUpgradeCost,
} from '../core/gameData';
import { CustomerView } from './CustomerView';
import { Kitchen } from './Kitchen';
import { HudView } from './HudView';
import { MenuView } from './MenuView';
import { UpgradeView } from './UpgradeView';
import { COLOR, makeLabel, makeNode, makeRect, roundRect } from './Widgets';

const { ccclass } = _decorator;

@ccclass('Main')
export class Main extends Component {
  private data!: GameData;
  private storage!: StorageService;

  private hud!: HudView;
  private menu!: MenuView;
  private kitchen!: Kitchen;
  private upgrade!: UpgradeView;

  private tables: { node: import('cc').Node; x: number }[] = [];
  private customers: CustomerView[] = [];
  private spawnTimer = 2;

  onLoad(): void {
    this.storage = new StorageService(new BrowserKVStore());
    this.data = new GameData(this.storage.load());

    makeRect('bg', this.node, 960, 640, 0, 0, COLOR.bg);
    this.buildDecor();

    this.buildTables();
    this.kitchen = new Kitchen(this.node, 360, -80, d => cookTimeAtLevel(d.cookTime, this.data.kitchenLevel));
    this.hud = new HudView(this.node, () => this.upgrade.open());
    this.menu = new MenuView(this.node,
      id => this.kitchen.selectDish(dishById(id) ?? null),
      id => { if (this.data.unlockDish(id)) this.refreshAll(); },
    );
    this.upgrade = new UpgradeView(this.node, {
      onUpgradeTable: () => { if (this.data.upgradeTable()) this.refreshAll(); },
      onUpgradeKitchen: () => { if (this.data.upgradeKitchen()) this.refreshAll(); },
    });

    this.refreshAll();
  }

  update(dt: number): void {
    this.updateSpawn(dt);
    this.kitchen.update(dt);
    this.serveIfReady();
    this.updateCustomers(dt);
  }

  private buildTables(): void {
    for (const t of this.tables) t.node.destroy();
    const count = tableCountAtLevel(this.data.tableLevel);
    this.tables = [];
    const startX = -((count - 1) * 130) / 2;
    for (let i = 0; i < count; i++) {
      const x = startX + i * 130;
      const node = makeNode(`table-${i}`, this.node, 90, 40, x, -40);
      const g = node.addComponent(Graphics);
      // 桌面
      g.fillColor = COLOR.panel;
      g.roundRect(-45, -18, 90, 18, 8);
      g.fill();
      g.lineWidth = 2;
      g.strokeColor = COLOR.border;
      g.stroke();
      // 桌面高光
      g.fillColor = new Color(255, 255, 255, 60);
      g.roundRect(-40, -14, 80, 4, 2);
      g.fill();
      // 桌腿
      g.fillColor = COLOR.decor;
      g.rect(-38, -22, 8, 10);
      g.fill();
      g.rect(30, -22, 8, 10);
      g.fill();
      this.tables.push({ node, x });
    }
  }

  private buildDecor(): void {
    // 地板线
    const floor = makeNode('floor', this.node, 960, 4, 0, -60);
    const fg = floor.addComponent(Graphics);
    fg.fillColor = COLOR.decor;
    fg.rect(-480, -2, 960, 4);
    fg.fill();

    // 挂画
    const pic = roundRect('pic', this.node, 60, 50, -420, 200, 8, COLOR.panel, COLOR.border);
    makeLabel('pic-content', pic, '🌻', 30, 0, 0);

    // 两侧绿植
    makeLabel('plant-l', this.node, '🪴', 44, -450, -30, COLOR.text);
    makeLabel('plant-r', this.node, '🪴', 44, 450, -30, COLOR.text);
  }

  private updateSpawn(dt: number): void {
    const maxCustomers = this.tables.length;
    if (this.customers.length >= maxCustomers) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = 3 + Math.random() * 4;

    const avail = this.data.availableDishes;
    const dish = avail[Math.floor(Math.random() * avail.length)];
    // 找一个还没有顾客占用的桌位
    let tableIndex = -1;
    for (let i = 0; i < this.tables.length; i++) {
      if (!this.customers.some(c => c.tableIndex === i)) { tableIndex = i; break; }
    }
    if (tableIndex < 0) return;
    const table = this.tables[tableIndex];
    const c = new CustomerView(
      this.node, table.x + 220, 40, dish, tableIndex,
      c2 => this.onCustomerLeave(c2),
    );
    this.customers.push(c);
    this.refreshHud();
  }

  private updateCustomers(dt: number): void {
    for (const c of this.customers) c.update(dt);
    this.customers = this.customers.filter(c => !c.isGone);
    this.refreshHud();
  }

  private serveIfReady(): void {
    if (!this.kitchen.ready) return;
    const dish = this.kitchen.currentDish;
    if (!dish) return;
    const waiting = this.customers.find(c => c.state === 'ORDERING' && c.dish.id === dish.id);
    if (waiting) {
      waiting.serve();
      this.kitchen.collect();
    } else {
      // 没有顾客点这道菜：菜被浪费，清空厨房，提示一下
      this.kitchen.collect();
    }
  }

  private onCustomerLeave(c: CustomerView): void {
    this.data.earn(c.wantsLeavesUpset ? 0 : c.paid);
    c.markGone();
    this.refreshAll();
  }

  private refreshAll(): void {
    this.buildTables();
    this.menu.rebuild(
      this.data.availableDishes,
      DISHES.filter(d => !this.data.dishUnlocked(d.id)),
      this.data.coins,
    );
    this.kitchen.selectDish(this.kitchen.currentDish);
    this.refreshHud();
    if (this.upgrade.isOpen) this.refreshUpgrade();
  }

  private refreshHud(): void {
    this.hud.refresh({
      coins: this.data.coins,
      customers: this.customers.filter(c => !c.isGone).length,
      tableLevel: this.data.tableLevel,
      kitchenLevel: this.data.kitchenLevel,
    });
    this.saveGame();
  }

  private refreshUpgrade(): void {
    this.upgrade.refresh({
      coins: this.data.coins,
      tableLevel: this.data.tableLevel,
      kitchenLevel: this.data.kitchenLevel,
      tableCost: tableUpgradeCost(this.data.tableLevel),
      kitchenCost: kitchenUpgradeCost(this.data.kitchenLevel),
      tableMaxed: this.data.tableLevel >= 5,
      kitchenMaxed: this.data.kitchenLevel >= 5,
    });
  }

  private saveGame(): void {
    this.storage.save(this.data.toSave());
  }
}
