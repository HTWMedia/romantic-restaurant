import { Layers, Node, resources, Sprite, SpriteFrame } from 'cc';
import { ART_MANIFEST, hasArt, markLoaded } from '../core/art';
import { COLOR, makeNode, makeRect, roundRect } from './Widgets';

// 9-slice 内边距（单位：源图像素，出图规格为 2×显示尺寸）
const PANEL_INSETS: Record<string, { l: number; r: number; t: number; b: number }> = {
  'panel-hud':        { l: 120, r: 120, t: 16, b: 16 },
  'panel-orderboard': { l: 160, r: 160, t: 16, b: 16 },
  'panel-menu':       { l: 160, r: 160, t: 16, b: 16 },
  'panel-dialogue':   { l: 80,  r: 80,  t: 80,  b: 80 },
  'panel-popup':      { l: 100, r: 100, t: 100, b: 100 },
};

export class ArtService {
  private static frames = new Map<string, SpriteFrame>();
  private static warned = new Set<string>();

  static async preload(): Promise<void> {
    if (ArtService.frames.size > 0) return;
    const results = await Promise.all(ART_MANIFEST.map(e => ArtService.loadOne(e.key)));
    for (const r of results) {
      if (r.sf) {
        ArtService.frames.set(r.key, r.sf);
        markLoaded(r.key);
      }
    }
  }

  private static loadOne(key: string): Promise<{ key: string; sf: SpriteFrame | null }> {
    return new Promise(resolve => {
      resources.load(`art/${key}/spriteFrame`, SpriteFrame, (err, sf) => {
        if (!err && sf) {
          resolve({ key, sf });
          return;
        }
        if (!ArtService.warned.has(key)) {
          ArtService.warned.add(key);
          console.warn(`[art] 缺少美术资源: ${key}（已回退）`);
        }
        resolve({ key, sf: null });
      });
    });
  }

  static hasArt(key: string): boolean {
    return hasArt(key);
  }

  static getSpriteFrame(key: string): SpriteFrame | null {
    return ArtService.frames.get(key) ?? null;
  }

  static makeSprite(
    parent: Node, key: string, w: number, h: number,
    x: number, y: number, name?: string,
  ): Node | null {
    const sf = ArtService.getSpriteFrame(key);
    if (!sf) return null;
    const n = makeNode(name ?? `art-${key}`, parent, w, h, x, y);
    n.layer = Layers.Enum.UI_2D;
    const sp = n.addComponent(Sprite);
    sp.spriteFrame = sf;
    sp.sizeMode = Sprite.SizeMode.CUSTOM;
    sp.type = Sprite.Type.SIMPLE;
    return n;
  }

  static makePanel(
    parent: Node, key: string, w: number, h: number,
    x: number, y: number, name?: string,
  ): Node | null {
    const sf = ArtService.getSpriteFrame(key);
    if (!sf) return null;
    const n = makeNode(name ?? `art-${key}`, parent, w, h, x, y);
    n.layer = Layers.Enum.UI_2D;
    const sp = n.addComponent(Sprite);
    sp.spriteFrame = sf;
    sp.sizeMode = Sprite.SizeMode.CUSTOM;
    const ins = PANEL_INSETS[key];
    if (ins) {
      sp.type = Sprite.Type.SLICED;
      sf.insetLeft = ins.l;
      sf.insetRight = ins.r;
      sf.insetTop = ins.t;
      sf.insetBottom = ins.b;
    } else {
      sp.type = Sprite.Type.SIMPLE;
    }
    return n;
  }

  static panelWithArt(
    name: string, parent: Node, key: string, w: number, h: number,
    x: number, y: number,
  ): Node {
    makeRect(name + '-shadow', parent, w, h, x, y - 4, COLOR.shadow);
    const art = ArtService.makePanel(parent, key, w, h, x, y, name);
    if (art) return art;
    return roundRect(name, parent, w, h, x, y, 16, COLOR.panel, COLOR.border);
  }

  /** 给既有按钮/面板补一个图标 Sprite（有图才加，缺图返回 null，调用方维持原样） */
  static attachIconSprite(
    parent: Node, key: string, x: number, y: number, size: number,
  ): Node | null {
    return ArtService.makeSprite(parent, key, size, size, x, y, `ic-${key}`);
  }
}