import { _decorator, Component } from 'cc';
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
import { COLOR, makeRect } from './Widgets';

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
  private occupiedTables = 0;

  onLoad(): void {
    this.storage = new StorageService(new BrowserKVStore());
    this.data = new GameData(this.storage.load());

    makeRect('bg', this.node, 960, 640, 0, 0, COLOR.bg);

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
    const count = tableCountAtLevel(this.data.tableLevel);
    this.tables = [];
    const startX = -((count - 1) * 130) / 2;
    for (let i = 0; i < count; i++) {
      const x = startX + i * 130;
      const node = makeRect(`table-${i}`, this.node, 90, 40, x, -40, COLOR.panel);
      this.tables.push({ node, x });
    }
  }

  private updateSpawn(dt: number): void {
    const maxCustomers = this.tables.length;
    if (this.customers.length >= maxCustomers) return;
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;
    this.spawnTimer = 3 + Math.random() * 4;

    const avail = this.data.availableDishes;
    const dish = avail[Math.floor(Math.random() * avail.length)];
    const table = this.tables[this.customers.length % this.tables.length];
    const c = new CustomerView(
      this.node, table.x + 220, 40, dish,
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
