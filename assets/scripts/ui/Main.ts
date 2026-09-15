import { _decorator, Component, Color, Graphics, Node } from 'cc';
import { GameData } from '../core/gameData';
import { StorageService } from '../core/storage';
import { createAdStrategy, createKVStore } from '../core/platform';
import { dishById, DISHES } from '../core/dishes';

const AD_SEC = 15; // 模拟广告时长（秒）
const CHAT_BASE = 'https://twmedia.dpdns.org';
import { CustomerState, Dish } from '../core/types';
import {
  cookTimeAtLevel, tableCountAtLevel, tableUpgradeCost, kitchenUpgradeCost, kitchenSlotCount,
} from '../core/gameData';
import { CustomerView } from './CustomerView';
import { Kitchen } from './Kitchen';
import { HudView } from './HudView';
import { MergeView } from './MergeView';
import { RecipeCard } from './RecipeCard';
import { MenuView } from './MenuView';
import { UpgradeView } from './UpgradeView';
import { DialogueView } from './DialogueView';
import { ChapterView } from './ChapterView';
import { AdView } from './AdView';
import { SkinView } from './SkinView';
import { CHAPTERS, DISH_UNLOCK_SCRIPT } from '../core/chapters';
import { ChatService } from '../core/chat';
import { ChatView } from './ChatView';
import { skinById } from '../core/skins';
import { decorById } from '../core/decor';
import { ENERGY_MAX, ENERGY_REGEN_SEC } from '../core/gameData';
import { COLOR, makeLabel, makeNode, makeRect, roundRect } from './Widgets';
import { ArtService } from './ArtView';
import { CUSTOMER_ART } from '../core/art';
import { Sfx } from '../services/Sfx';
import { ParticleFx } from './ParticleFx';
import { ScreenShake } from './ScreenShake';
import { QuestView } from './QuestView';
import { shouldSpawnVip, rollVip } from '../core/specialCustomer';
import { QuestBoard, createBoard, maybeRefresh, reportEvent, claimReward, hasClaimable } from '../core/quests';

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
  private merge!: MergeView;
  private chatView!: ChatView;

  private tables: { node: Node; x: number }[] = [];
  private customers: CustomerView[] = [];
  private spawnTimer = 2;
  // 玩法层：桌椅/顾客/餐盘都装这里，面板弹窗在其上，动态节点再多也不会盖住弹窗
  private gameLayer!: Node;

  private combo = 0;
  private adBusy = false; // 平台广告播放中（微信原生广告没有 isPlaying 可查）
  private dialogue!: DialogueView;
  private chapterView!: ChapterView;
  private adView!: AdView;
  private skinView!: SkinView;
  private decorNodes: Node[] = [];
  private energyTimer = 0;
  private orderBoard!: Node;
  private orderList!: Node;
  private orderSig = '';
  private questView!: QuestView;
  private questBoard!: QuestBoard;
  private fxLayer!: Node;

  onLoad(): void {
    this.storage = new StorageService(createKVStore());
    this.data = new GameData(this.storage.load());
    void ArtService.preload().then(() => {
      if (!this.isValid || !this.node.isValid) return;
      this.buildGame();
      this.ready = true;
    });
  }

  private buildGame(): void {
    this.buildBackground();
    this.gameLayer = makeNode('game-layer', this.node, 960, 640, 0, 0);
    this.fxLayer = makeNode('fx-layer', this.node, 960, 640, 0, 0);
    ParticleFx.setRoot(this.fxLayer);
    ScreenShake.setTarget(this.gameLayer);
    this.buildDecor();
    this.buildTables();

    this.kitchen = new Kitchen(
      this.node, 340, -70,
      d => cookTimeAtLevel(d.cookTime, this.data.kitchenLevel) *
        (1 - skinById(this.data.activeSkinId).bonus.cook * 0.1) *
        this.data.cookTimeMultiplier,
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
      () => this.merge.open(),
      () => this.chatView.open(),
      () => this.openQuests(),
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
    this.applyDecor();

    const chatService = new ChatService({ baseUrl: CHAT_BASE });
    this.chatView = new ChatView(this.node, chatService, typeof fetch === 'function');

    this.merge = new MergeView(this.node, this.data, () => {
      this.saveGame();
      this.refreshHud();
    }, dishId => {
      const lines = DISH_UNLOCK_SCRIPT[dishId];
      if (lines) this.dialogue.play(lines);
    });

    // 首次进入播放开场剧情
    if (!this.data.introPlayed) {
      this.data.introPlayed = true;
      this.saveGame();
      const first = CHAPTERS[0];
      if (first) this.dialogue.play(first.intro, () => {});
    }

    this.orderBoard = ArtService.panelWithArt('order-board', this.node, 'panel-orderboard', 920, 40, 0, 235);
    this.orderList = makeNode('order-list', this.orderBoard, 920, 40, 0, 0);

    // 任务系统：从存档恢复或新建
    this.questView = new QuestView(this.node);
    if (this.data.questBoardJson) {
      try {
        const saved = JSON.parse(this.data.questBoardJson);
        this.questBoard = maybeRefresh(saved);
      } catch {
        this.questBoard = createBoard();
      }
    } else {
      this.questBoard = createBoard();
    }
    this.questView.updateBadge(this.questBoard);

    this.refreshAll();
  }

  update(dt: number): void {
    if (!this.ready) return;
    this.chatView.update(dt);
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
    ParticleFx.update(dt);
    // 任务面板定时刷新
    const refreshed = maybeRefresh(this.questBoard);
    if (refreshed !== this.questBoard) {
      this.questBoard = refreshed;
      this.questView.updateBadge(this.questBoard);
      this.saveQuests();
    }
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
    // 任务：做特定菜
    this.questBoard = reportEvent(this.questBoard, 'cook_dish', 1, id);
    this.questView.updateBadge(this.questBoard);
    this.saveQuests();
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
    if (this.adView.isPlaying || this.adBusy) return;
    // 微信小游戏：平台自带广告 UI，直接播放；浏览器预览：走游戏内模拟倒计时面板
    const strategy = createAdStrategy();
    if (strategy.native) {
      this.adBusy = true;
      strategy.play(AD_SEC, rewarded => {
        this.adBusy = false;
        if (rewarded) reward();
      });
      return;
    }
    this.adView.play(AD_SEC, reward, title);
  }

  private buildBackground(): void {
    const frame = makeRect('bg-frame', this.node, 960, 640, 0, 0, new Color(20, 16, 24, 255));
    frame.setSiblingIndex(0);
    const art = ArtService.makeSprite(this.node, 'bg', 960, 640, 0, 0, 'bg');
    if (art) {
      art.setSiblingIndex(1);
      return;
    }
    const rect = makeRect('bg', this.node, 960, 640, 0, 0, COLOR.bg);
    rect.setSiblingIndex(1);
  }

  private buildTables(): void {
    for (const t of this.tables) t.node.destroy();
    const count = tableCountAtLevel(this.data.tableLevel);
    this.tables = [];
    const startX = -((count - 1) * 200) / 2;
    for (let i = 0; i < count; i++) {
      const x = startX + i * 200;
      const node = makeNode(`table-${i}`, this.gameLayer, 140, 100, x, -176);
      const g = node.addComponent(Graphics);
      // 自上而下：地面投影 → 桌腿 → 前缘 → 桌面（rel 值越小越靠屏幕下方）
      g.fillColor = COLOR.shadow;
      g.roundRect(-70, -48, 140, 14, 7);
      g.fill();
      g.fillColor = new Color(214, 170, 122, 255);
      g.roundRect(-52, -42, 12, 30, 3);
      g.fill();
      g.roundRect(40, -42, 12, 30, 3);
      g.fill();
      g.fillColor = new Color(226, 180, 130, 255);
      g.roundRect(-70, -22, 140, 18, 6);
      g.fill();
      g.fillColor = new Color(247, 230, 205, 255);
      g.roundRect(-70, -2, 140, 22, 10);
      g.fill();
      g.lineWidth = 2;
      g.strokeColor = COLOR.border;
      g.stroke();
      g.fillColor = new Color(255, 255, 255, 70);
      g.roundRect(-60, 2, 120, 6, 3);
      g.fill();
      this.tables.push({ node, x });
    }
    // 桌位重建后让已入座顾客搬到新坐标（跳过已销毁/已离场的）
    for (const c of this.customers) {
      if (c.isGone || !c.node.isValid) continue;
      const t = this.tables[c.tableIndex];
      if (t) c.syncTable(t.x, -176);
    }
  }

  private buildDecor(): void {
    if (ArtService.hasArt('bg')) return;
    const floor = makeNode('floor', this.gameLayer, 960, 4, 0, -60);
    const fg = floor.addComponent(Graphics);
    fg.fillColor = COLOR.decor;
    fg.rect(-480, -2, 960, 4);
    fg.fill();

    const pic = roundRect('pic', this.gameLayer, 60, 50, -420, 200, 8, COLOR.panel, COLOR.border);
    makeLabel('pic-content', pic, '🌻', 30, 0, 0);

    makeLabel('plant-l', this.gameLayer, '🪴', 44, -450, -30, COLOR.text);
    makeLabel('plant-r', this.gameLayer, '🪴', 44, 450, -30, COLOR.text);
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
    try {
    const c = new CustomerView(
      this.gameLayer, table.x, -124, dish, tableIndex, artKey, table.x, -176,
      c2 => this.onCustomerLeave(c2),
      d => RecipeCard.show(this.node, d, this.data),
    );
    // 装修加成：顾客更有耐心（等待时间更长）
    c.setPatience(
      (1 + skinById(this.data.activeSkinId).bonus.wait * 0.1) *
      (1 + this.data.patienceBonusPct / 100)
    );
    // VIP 顾客：概率出现，更高收入但耐心更短
    if (shouldSpawnVip()) {
      const vip = rollVip();
      c.setVip(vip);
    }
      // 顾客坐桌后：插到桌子节点之下，桌沿遮挡其下半身，形成前后纵深
      c.node.setSiblingIndex(table.node.getSiblingIndex());
      this.customers.push(c);
    } catch (e) {
      console.error('[spawn] 顾客生成失败', e);
      return;
    }
    this.refreshHud();
  }

  private updateCustomers(dt: number): void {
    // 先跳过已离场的再更新，防止销毁节点引发的异常中断后续顾客
    for (const c of this.customers) {
      if (!c.isGone && c.node.isValid) c.update(dt);
    }
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
    const bonus = skinById(this.data.activeSkinId).bonus;
    const pay = Math.round(c.paid * mult * (1 + bonus.coin * 0.1) * this.data.coinMultiplier);
    this.data.earn(pay);
    this.data.servedTotal++;
    if (c.satisfaction >= 70) this.data.happyTotal++;
    // 历史最高连击
    if (this.combo > this.data.bestCombo) this.data.bestCombo = this.combo;
    Sfx.coin();
    c.showPay(pay);
    this.hud.setCombo(this.combo, mult);
    // 粒子特效 + 屏幕震动
    const cx = c.node.position.x;
    const cy = c.node.position.y + 50;
    ParticleFx.coinBurst(cx, cy, c.vipType ? 12 : 6);
    if (c.satisfaction >= 70) {
      ParticleFx.starBurst(cx, cy + 40, 4);
      ParticleFx.heartsUp(cx, cy + 30, 3);
    }
    if (this.combo >= 3) {
      ParticleFx.flashRing(cx, cy);
      ScreenShake.shake(this.combo >= 6 ? 6 : 3, 0.2);
    } else {
      ScreenShake.shake(2, 0.12);
    }
    // VIP 顾客额外特效
    if (c.vipType) {
      ParticleFx.flashRing(cx, cy, new Color(255, 201, 77, 255));
      ScreenShake.shake(8, 0.3);
    }
    // 任务上报
    this.questBoard = reportEvent(this.questBoard, 'serve', 1);
    this.questBoard = reportEvent(this.questBoard, 'earn', pay);
    this.questBoard = reportEvent(this.questBoard, 'combo', this.combo);
    if (c.satisfaction >= 70) {
      this.questBoard = reportEvent(this.questBoard, 'happy', 1);
    }
    this.questView.updateBadge(this.questBoard);
    this.saveQuests();
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
    // 离场只刷新菜单可点性和 HUD；重建桌子会打断在场顾客（对已销毁节点操作会抛错）
    this.menu.rebuild(
      this.data.availableDishes,
      DISHES.filter(d => !this.data.dishUnlocked(d.id)),
      this.data.coins,
    );
    this.refreshHud();
  }

  private openQuests(): void {
    this.questView.open(this.questBoard,
      reward => {
        this.data.earn(reward);
        Sfx.coin();
        ParticleFx.coinBurst(0, 0, 16);
        this.refreshHud();
        this.saveGame();
      },
      () => { this.saveQuests(); },
    );
  }

  private saveQuests(): void {
    this.data.questBoardJson = JSON.stringify(this.questBoard);
    this.saveGame();
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
    tint.setSiblingIndex(2);
    for (const d of this.decorNodes) d.destroy();
    this.decorNodes = [];
    for (const p of skin.decor) {
      const art = ArtService.makeSprite(this.node, p.artKey, 88, 88, p.x, p.y, `decor-art-${p.artKey}`);
      if (art) {
        art.setSiblingIndex(3);
        this.decorNodes.push(art);
        continue;
      }
      const l = makeLabel(`decor-${p.emoji}`, this.node, p.emoji, 40, p.x, p.y, COLOR.text);
      l.node.setSiblingIndex(3);
      this.decorNodes.push(l.node);
    }
  }

  /** 在皮肤装饰之上叠加玩家购买的独立装饰品 */
  private applyDecor(): void {
    // 先移除旧装饰品节点（保留皮肤本身的 decorNodes）
    for (const n of this.decorNodes) {
      if (n.name?.startsWith('idecor-')) n.destroy();
    }
    this.decorNodes = this.decorNodes.filter(n => !n.name?.startsWith('idecor-'));
    // 放入已购买的独立装饰品
    for (const id of this.data.ownedDecorIds) {
      const d = decorById(id);
      if (!d) continue;
      const l = makeLabel(`idecor-${d.id}`, this.node, d.emoji, 36, d.x, d.y, COLOR.text);
      l.node.setSiblingIndex(3);
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
    this.upgrade.refreshDecor(
      this.data.ownedDecorIds,
      this.data.coins,
      (id: string) => {
        if (this.data.buyDecor(id)) {
          this.applyDecor();
          this.refreshAll();
          if (this.upgrade.isOpen) this.refreshUpgrade();
        }
      },
    );
  }

  private saveGame(): void {
    this.storage.save(this.data.toSave());
  }
}
