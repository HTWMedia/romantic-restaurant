import { Color, Graphics, Label, Node, tween, Vec3, UIOpacity } from 'cc';
import { makeNode } from './Widgets';

// 轻量粒子系统：用 Graphics 画圆 + tween 动画，无需贴图。
// 支持金币飞溅、星星弹跳、爱心升起、烟雾扩散等效果。

export class ParticleFx {
  private static root: Node | null = null;

  static setRoot(node: Node): void {
    ParticleFx.root = node;
  }

  static update(_dt: number): void {
    // 粒子通过 tween 自行销毁，这里保留接口供 Main.update 调用
    // 未来如需帧驱动粒子可在此扩展
  }

  /** 金币飞溅特效 */
  static coinBurst(x: number, y: number, count: number = 8): void {
    if (!ParticleFx.root) return;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
      const dist = 60 + Math.random() * 60;
      const tx = x + Math.cos(angle) * dist;
      const ty = y + Math.sin(angle) * dist - 40;
      const size = 8 + Math.random() * 6;
      const n = makeNode(`p-coin-${i}`, ParticleFx.root, size, size, x, y);
      const g = n.addComponent(Graphics);
      g.fillColor = new Color(255, 201, 77, 255);
      g.circle(0, 0, size / 2);
      g.fill();
      g.strokeColor = new Color(227, 180, 50, 255);
      g.lineWidth = 1.5;
      g.stroke();
      tween(n)
        .to(0.5, { position: new Vec3(tx, ty, 0) })
        .to(0.3, { position: new Vec3(tx, ty - 30, 0) })
        .call(() => { if (n.isValid) n.destroy(); })
        .start();
      const op = n.addComponent(UIOpacity);
      op.opacity = 255;
      tween(op)
        .delay(0.4)
        .to(0.4, { opacity: 0 })
        .start();
    }
  }

  /** 星星弹跳特效（满意顾客） */
  static starBurst(x: number, y: number, count: number = 5): void {
    if (!ParticleFx.root) return;
    const stars = ['⭐', '✨', '🌟'];
    for (let i = 0; i < count; i++) {
      const label = stars[Math.floor(Math.random() * stars.length)];
      const n = makeNode(`p-star-${i}`, ParticleFx.root, 30, 30, x, y);
      const op = n.addComponent(UIOpacity);
      op.opacity = 255;
      const lbl = n.addComponent(Label);
      lbl.string = label;
      lbl.fontSize = 20 + Math.random() * 12;
      lbl.color = new Color(255, 220, 100, 255);
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
      const dist = 50 + Math.random() * 80;
      const tx = x + Math.cos(angle) * dist;
      const ty = y + Math.sin(angle) * dist;
      tween(n)
        .to(0.15, { scale: new Vec3(1.5, 1.5, 1) })
        .to(0.3, { scale: new Vec3(1, 1, 1), position: new Vec3(tx, ty, 0) })
        .call(() => { if (n.isValid) n.destroy(); })
        .start();
      tween(op)
        .delay(0.3)
        .to(0.2, { opacity: 0 })
        .start();
    }
  }

  /** 爱心升起（满意顾客离店） */
  static heartsUp(x: number, y: number, count: number = 3): void {
    if (!ParticleFx.root) return;
    for (let i = 0; i < count; i++) {
      const ox = (Math.random() - 0.5) * 40;
      const n = makeNode(`p-heart-${i}`, ParticleFx.root, 24, 24, x + ox, y);
      const op = n.addComponent(UIOpacity);
      op.opacity = 255;
      const lbl = n.addComponent(Label);
      lbl.string = '❤';
      lbl.fontSize = 16 + Math.random() * 10;
      lbl.color = new Color(232, 106, 94, 255);
      tween(n)
        .to(0.8, { position: new Vec3(
          x + ox + (Math.random() - 0.5) * 30,
          y + 80 + Math.random() * 40,
          0,
        )})
        .call(() => { if (n.isValid) n.destroy(); })
        .start();
      tween(op)
        .delay(0.5)
        .to(0.3, { opacity: 0 })
        .start();
    }
  }

  /** 烟雾扩散（做菜完成） */
  static steamPuff(x: number, y: number): void {
    if (!ParticleFx.root) return;
    for (let i = 0; i < 4; i++) {
      const size = 10 + Math.random() * 10;
      const ox = (Math.random() - 0.5) * 20;
      const n = makeNode(`p-steam-${i}`, ParticleFx.root, size, size, x + ox, y);
      const g = n.addComponent(Graphics);
      g.fillColor = new Color(220, 220, 220, 80);
      g.circle(0, 0, size / 2);
      g.fill();
      const op = n.addComponent(UIOpacity);
      op.opacity = 120;
      tween(n)
        .to(0.6, {
          position: new Vec3(x + ox + (Math.random() - 0.5) * 20, y + 40 + Math.random() * 20, 0),
          scale: new Vec3(1.5, 1.5, 1),
        })
        .call(() => { if (n.isValid) n.destroy(); })
        .start();
      tween(op)
        .to(0.6, { opacity: 0 })
        .start();
    }
  }

  /** 闪光环（连击达成） */
  static flashRing(x: number, y: number, color: Color = new Color(255, 201, 77, 255)): void {
    if (!ParticleFx.root) return;
    const n = makeNode('p-ring', ParticleFx.root, 80, 80, x, y);
    const g = n.addComponent(Graphics);
    g.strokeColor = color;
    g.lineWidth = 3;
    g.circle(0, 0, 10);
    g.stroke();
    const op = n.addComponent(UIOpacity);
    op.opacity = 200;
    tween(n)
      .to(0.3, { scale: new Vec3(3, 3, 1) })
      .call(() => { if (n.isValid) n.destroy(); })
      .start();
    tween(op)
      .to(0.3, { opacity: 0 })
      .start();
  }

  /** 清理所有粒子 */
  static clear(): void {
    // 粒子通过 tween 自行销毁，暂无需主动清理
  }
}
