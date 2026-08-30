import { Color, Node } from 'cc';
import { Dish } from '../core/types';
import { chainFor, mergeItemById } from '../core/merge';
import { GameData } from '../core/gameData';
import { COLOR, makeLabel, makeNode, makeRect, roundRect } from './Widgets';
import { ArtService } from './ArtView';

/**
 * 菜品研发链路卡：点顾客订单弹出，展示 基础素材 → 中间成品 → 最终菜 的完整链路，
 * 以及在合成台的研发成本。借鉴《浪漫餐厅》"点订单查看合成线"的设计。
 */
export class RecipeCard {
  static show(parent: Node, dish: Dish, data: GameData): void {
    RecipeCard.hide(parent);
    const root = makeNode('recipe-card', parent, 960, 640, 0, 0);
    makeRect('rc-shade', root, 960, 640, 0, 0, new Color(0, 0, 0, 150))
      .on(Node.EventType.TOUCH_END, () => RecipeCard.hide(parent));
    const panel = roundRect('rc-panel', root, 500, 330, 0, 30, 18, COLOR.panel, COLOR.accent);

    const icon = ArtService.makeSprite(panel, dish.artKey, 56, 56, -190, 110);
    if (!icon) makeLabel('rc-icon', panel, dish.name.slice(0, 1), 28, -190, 110, COLOR.primary);
    makeLabel('rc-title', panel, `${dish.name} · 研发链路`, 22, 40, 110, COLOR.text);
    makeLabel('rc-price', panel, `售价 ${dish.price}🪙/单`, 15, 40, 76, COLOR.accent);

    const chain = chainFor(dish.id);
    if (chain.length === 0) {
      makeLabel('rc-empty', panel, '这道菜暂无合成链，直接解锁即可', 14, 0, -10, COLOR.subtext);
      return;
    }

    const spacing = 130;
    const startX = -((chain.length - 1) * spacing) / 2;
    chain.forEach((it, j) => {
      const x = startX + j * spacing;
      const isFinal = j === chain.length - 1;
      const unlocked = it.unlocksDishId ? data.dishUnlocked(it.unlocksDishId) : false;
      if (isFinal) {
        roundRect(`rc-ring-${j}`, panel, 62, 62, x, 20, 10, new Color(0, 0, 0, 0),
          unlocked ? COLOR.green : COLOR.subtext);
      }
      const ic = ArtService.makeSprite(panel, it.artKey ?? '', 48, 48, x, 20);
      if (!ic) makeLabel(`rc-node-${j}`, panel, it.glyph ?? '?', 26, x, 20, COLOR.text);
      makeLabel(`rc-name-${j}`, panel, it.name, 13, x, -22, COLOR.text);
      if (isFinal) {
        makeLabel(`rc-state-${j}`, panel, unlocked ? '已上菜单' : '未解锁', 12, x, -44,
          unlocked ? COLOR.green : COLOR.subtext);
      } else {
        makeLabel(`rc-arrow-${j}`, panel, '→', 20, x + spacing / 2, 20, COLOR.subtext);
      }
    });

    const base = chain[0] ? mergeItemById(chain[0].id) : undefined;
    if (base?.cost) {
      makeLabel('rc-cost', panel,
        `合成台配方：2 × ${base.name} = ${base.cost * 2}🪙`, 14, 0, -95, COLOR.text);
    }
    makeLabel('rc-tip', panel, '点击空白处关闭', 12, 0, -130, COLOR.subtext);
  }

  static hide(parent: Node): void {
    parent.getChildByName('recipe-card')?.destroy();
  }
}
