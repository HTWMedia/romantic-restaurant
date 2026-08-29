import { _decorator, Component, Color, Graphics, Node } from 'cc';
import { GameData } from '../core/gameData';
import { StorageService, BrowserKVStore } from '../core/storage';
import { dishById, DISHES } from '../core/dishes';
import { CustomerState, Dish } from '../core/types';
import {
  cookTimeAtLevel, tableCountAtLevel, tableUpgradeCost, kitchenUpgradeCost, kitchenSlotCount,
} from '../core/gameData';
import { CustomerView } from './CustomerView';
import { Kitchen } from './Kitchen';
import { HudView } from './HudView';
import { MenuView } from './MenuView';
import { UpgradeView } from './UpgradeView';
import { DialogueView } from './DialogueView';
import { ChapterView } from './ChapterView';
import { AdView } from './AdView';
import { SkinView } from './SkinView';
import { CHAPTERS } from '../core/chapters';
import { skinById } from '../core/skins';
import { ENERGY_MAX, ENERGY_REGEN_SEC } from '../core/gameData';
import { COLOR, makeLabel, makeNode, makeRect, roundRect } from './Widgets';
import { ArtService } from './ArtView';
import { CUSTOMER_ART } from '../core/art';
import { Sfx } from '../services/Sfx';

const { ccclass } = _decorator;

@ccclass('Main')
export class Main extends Component {
  private data!: GameData;
  private storage!: StorageService;
  private ready = false;

  private hud!: HudView;
  private menu!: MenuView;
  private kitchen!: Kitchen;
  private upgrade!: UpgradeView;

  private tables: { node: Node; x: number }[] = [];
  private customers: CustomerView[] = [];
  private spawnTimer = 2;

  private combo = 0;
  private dialogue!: DialogueView;
  private chapterView!: ChapterView;
  private adView!: AdView;
  private skinView!: SkinView;
  private decorNodes: Node[] = [];
  private energyTimer = 0;
  private orderBoard!: Node;
  private orderList!: Node;
  private orderSig = '';

  onLoad(): void {
    this.storage = new StorageService(new BrowserKVStore());
    this.data = new GameData(this.storage.load());
    void ArtService.preload().then(() => {
      if (!this.isValid || !this.node.isValid) return;
      this.buildGame();
      this.ready = true;
    });
  }

  private buildGame(): void {
    this.buildBackground();
    this.buildDecor();
    this.buildTables();

    this.kitchen = new Kitchen(
      this.node, 330, -80,
      d => cookTimeAtLevel(d.cookTime, this.data.kitchenLevel),
      kitchenSlotCount(this.data.kitchenLevel),
    );
    this.kitchen.onSlotReady = () => Sfx.cook();

    this.hud = new HudView(this.node,
      () => {
        this.upgrade.open();
        this.refreshUpgrade();
      },
      () => this.openChapters(),
      () => this.onAdButton(),
    );
    this.hud.setCombo(0, 1);

    this.menu = new MenuView(this.node,
      id => { this.cookSelected(id); },
      id => { if (this.data.unlockDish(id)) this.refreshAll(); },
    );

    this.upgrade = new UpgradeView(this.node, {
      onUpgradeTable: () => { if (this.data.upgradeTable()) this.refreshAll(); },
      onUpgradeKitchen: () => {
        if (this.data.upgradeKitchen()) {
          this.kitchen.setSlotCount(kitchenSlotCount(this.data.kitchenLevel));
          this.refreshAll();
        }
      },
      onSkins: () => this.skinView.open(this.data),
    });

    this.chapterView = new ChapterView(this.node, () => {
      const ch = CHAPTERS[this.data.chapterIndex];
      if (ch) this.dialogue.play(ch.intro, () => {});
    });

    this.dialogue = new DialogueView(this.node);

    this.adView = new AdView(this.node);

    this.skinView = new SkinView(
      this.node,
      () => this.applySkin(),
      () => { this.refreshHud(); this.saveGame(); },
    );
    this.applySkin();

    // 首次进入播放开场剧情
    if (!this.data.introPlayed) {
      this.data.introPlayed = true;
      this.saveGame();
      const first = CHAPTERS[0];
      if (first) this.dialogue.play(first.intro, () => {});
    }

    this.orderBoard = ArtService.panelWithArt('order-board', this.node, 'panel-orderboard', 920, 40, 0, 235);
    this.orderList = makeNode('order-list', this.orderBoard, 920, 40, 0, 0);
    this.refreshAll();
  }

  update(dt: number): void {
    if (!this.ready) return;
    this.updateSpawn(dt);
    this.kitchen.update(dt);
    this.serveIfReady();
    this.updateCustomers(dt);
    this.refreshOrderBoard();
    if (this.data.energy < ENERGY_MAX) {
      this.energyTimer += dt;
      if (this.energyTimer >= ENERGY_REGEN_SEC) {
        this.energyTimer = 0;
        this.data.energy++;
        this.refreshHud();
        this.saveGame();
      }
    }
    this.adView.update(dt);
  }

  private cookSelected(id: string): void {
    const dish = dishById(id);
    if (!dish) return;
    if (this.data.energy <= 0) {
      this.onAdButton();
      return;
    }
    if (!this.kitchen.cookDish(dish)) {
      Sfx.fail();
      return;
    }
    this.data.energy--;
    this.menu.setSelected(id);
    this.menu.rebuild(
      this.data.availableDishes,
      DISHES.filter(d => !this.data.dishUnlocked(d.id)),
      this.data.coins,
    );
    this.refreshHud();
    this.saveGame();
  }

  private onAdButton(): void {
    if (this.data.energy < ENERGY_MAX) {
      this.watchAd(() => {
        this.data.energy = ENERGY_MAX;
        this.energyTimer = 0;
        this.refreshHud();
        this.saveGame();
      }, '看广告恢复体力');
    } else {
      this.watchAd(() => {
        this.data.earn(30);
        Sfx.coin();
        this.refreshHud();
        this.saveGame();
      }, '看广告领 30 🪙');
    }
  }

  private watchAd(reward: () => void, title: string): void {
    if (this.adView.isPlaying) return;
    this.adView.play(3, reward, title);
  }

  private buildBackground(): void {
    const art = ArtService.makeSprite(this.node, 'bg', 960, 640, 0, 0, 'bg');
    if (art) {
      art.setSiblingIndex(0);
      return;
    }
    const rect = makeRect('bg', this.node, 960, 640, 0, 0, COLOR.bg);
    rect.setSiblingIndex(0);
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
      g.fillColor = COLOR.panel;
      g.roundRect(-45, -18, 90, 18, 8);
      g.fill();
      g.lineWidth = 2;
      g.strokeColor = COLOR.border;
      g.stroke();
      g.fillColor = new Color(255, 255, 255, 60);
      g.roundRect(-40, -14, 80, 4, 2);
      g.fill();
      g.fillColor = COLOR.decor;
      g.rect(-38, -22, 8, 10);
      g.fill();
      g.rect(30, -22, 8, 10);
      g.fill();
      this.tables.push({ node, x });
    }
  }

  private buildDecor(): void {
    if (ArtService.hasArt('bg')) return;
    const floor = makeNode('floor', this.node, 960, 4, 0, -60);
    const fg = floor.addComponent(Graphics);
    fg.fillColor = COLOR.decor;
    fg.rect(-480, -2, 960, 4);
    fg.fill();

    const pic = roundRect('pic', this.node, 60, 50, -420, 200, 8, COLOR.panel, COLOR.border);
    makeLabel('pic-content', pic, '🌻', 30, 0, 0);

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
    let tableIndex = -1;
    for (let i = 0; i < this.tables.length; i++) {
      if (!this.customers.some(c => c.tableIndex === i)) { tableIndex = i; break; }
    }
    if (tableIndex < 0) return;
    const table = this.tables[tableIndex];
    // 同屏形象去重：排除当前在场角色
    const used = this.customers.map(c => c.artKey);
    const pool = CUSTOMER_ART.filter(a => used.indexOf(a) === -1);
    const artKey = pool.length > 0
      ? pool[Math.floor(Math.random() * pool.length)]
      : CUSTOMER_ART[Math.floor(Math.random() * CUSTOMER_ART.length)];
    const c = new CustomerView(
      this.node, table.x + 64, -6, dish, tableIndex, artKey, table.x, -40,
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
    for (const slot of this.kitchen.readySlots()) {
      const dish = slot.dish!;
      const waiting = this.customers.find(c => c.state === CustomerState.ORDERING && c.dish.id === dish.id);
      if (waiting) {
        waiting.serve();
        this.kitchen.takeSlot(slot);
        this.onServed(waiting, dish);
      }
    }
  }

  private onServed(c: CustomerView, _dish: Dish): void {
    this.combo++;
    const mult = this.comboMultiplier();
    const pay = Math.round(c.paid * mult);
    this.data.earn(pay);
    this.data.servedTotal++;
    if (c.satisfaction >= 70) this.data.happyTotal++;
    Sfx.coin();
    c.showPay(pay);
    this.hud.setCombo(this.combo, mult);
    this.refreshHud();
    this.saveGame();
    this.checkChapter();
  }

  private checkChapter(): void {
    const ch = CHAPTERS[this.data.chapterIndex];
    if (!ch) return;
    const met = ch.goals.every(g => {
      if (g.kind === 'revenue') return this.data.totalRevenue >= g.target;
      if (g.kind === 'served') return this.data.servedTotal >= g.target;
      if (g.kind === 'happy') return this.data.happyTotal >= g.target;
      return false;
    });
    if (!met) return;
    this.data.earn(ch.reward.coins);
    this.data.chapterIndex++;
    this.saveGame();
    this.hud.setChapter(this.data.chapterIndex, CHAPTERS.length, this.data.chapterIndex);
    Sfx.coin();
    this.dialogue.play(ch.outro, () => this.openChapters());
  }

  private openChapters(): void {
    this.chapterView.open(this.data);
  }

  private comboMultiplier(): number {
    return Math.min(3, 1 + Math.floor(this.combo / 3) * 0.5);
  }

  private onCustomerLeave(c: CustomerView): void {
    if (c.wantsLeavesUpset) {
      this.combo = 0;
      Sfx.fail();
      this.hud.setCombo(0, 1);
    }
    c.markGone();
    this.refreshAll();
  }

  private refreshOrderBoard(): void {
    const pending = this.customers.filter(c => c.state === CustomerState.ORDERING);
    const sig = pending.map(c => c.dish.id).join(',');
    if (sig === this.orderSig) return;
    this.orderSig = sig;
    this.orderList.removeAllChildren();
    makeLabel('ob-title', this.orderList, '📋 待办订单', 14, -430, 0, COLOR.subtext);
    // 按菜品合并，显示缩略图 + 菜名 + 份数
    const counts: { dish: Dish; n: number }[] = [];
    for (const c of pending) {
      const it = counts.find(x => x.dish.id === c.dish.id);
      if (it) it.n++;
      else counts.push({ dish: c.dish, n: 1 });
    }
    counts.slice(0, 6).forEach((it, i) => {
      const t = roundRect(`ob-${i}`, this.orderList, 110, 30, -330 + i * 116, 0, 8, COLOR.panel, COLOR.border);
      if (ArtService.hasArt(it.dish.artKey)) {
        ArtService.makeSprite(t, it.dish.artKey, 20, 20, -40, 0, 'ob-dish');
        makeLabel(`obt-${i}`, t, `${it.dish.name}${it.n > 1 ? ` ×${it.n}` : ''}`, 13, -18, 0, COLOR.text);
      } else {
        makeLabel(`obt-${i}`, t, it.dish.name, 13, 0, 0, COLOR.text);
      }
    });
  }

  private refreshAll(): void {
    this.buildTables();
    this.menu.rebuild(
      this.data.availableDishes,
      DISHES.filter(d => !this.data.dishUnlocked(d.id)),
      this.data.coins,
    );
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
    this.hud.setChapter(this.data.chapterIndex, CHAPTERS.length, this.data.chapterIndex);
    this.hud.setEnergy(this.data.energy, ENERGY_MAX);
    this.saveGame();
  }

  private applySkin(): void {
    const skin = skinById(this.data.activeSkinId);
    let tint = this.node.getChildByName('skin-tint');
    if (tint) tint.destroy();
    const hasBg = ArtService.hasArt('bg');
    const alpha = hasBg ? 40 : 255;
    const bg = new Color(skin.bg.r, skin.bg.g, skin.bg.b, alpha);
    tint = makeRect('skin-tint', this.node, 960, 640, 0, 0, bg);
    tint.setSiblingIndex(1);
    for (const d of this.decorNodes) d.destroy();
    this.decorNodes = [];
    for (const p of skin.decor) {
      const art = ArtService.makeSprite(this.node, p.artKey, 88, 88, p.x, p.y, `decor-art-${p.artKey}`);
      if (art) {
        art.setSiblingIndex(2);
        this.decorNodes.push(art);
        continue;
      }
      const l = makeLabel(`decor-${p.emoji}`, this.node, p.emoji, 40, p.x, p.y, COLOR.text);
      l.node.setSiblingIndex(2);
      this.decorNodes.push(l.node);
    }
  }

  private refreshUpgrade(): void {
    this.upgrade.refresh({
      coins: this.data.coins,
      tableLevel: this.data.tableLevel,
      kitchenLevel: this.data.kitchenLevel,
      tableCost: tableUpgradeCost(this.data.tableLevel),
      kitchenCost: kitchenUpgradeCost(this.data.tableLevel),
      tableMaxed: this.data.tableLevel >= 5,
      kitchenMaxed: this.data.kitchenLevel >= 5,
    });
  }

  private saveGame(): void {
    this.storage.save(this.data.toSave());
  }
}
