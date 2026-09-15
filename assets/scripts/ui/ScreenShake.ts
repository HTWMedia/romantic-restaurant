import { Node, tween, Vec3 } from 'cc';

// 屏幕震动反馈：轻度（金币）、中度（上菜）、重度（连击/VIP）

export class ScreenShake {
  private static target: Node | null = null;
  private static originalPos: Vec3 = new Vec3(0, 0, 0);

  static setTarget(node: Node): void {
    ScreenShake.target = node;
    ScreenShake.originalPos = node.position.clone();
  }

  static shake(intensity: number = 4, duration: number = 0.2): void {
    if (!ScreenShake.target) return;
    const node = ScreenShake.target;
    const base = ScreenShake.originalPos.clone();

    tween(node)
      .to(duration * 0.2, { position: new Vec3(base.x + intensity, base.y + intensity * 0.5, 0) })
      .to(duration * 0.2, { position: new Vec3(base.x - intensity, base.y - intensity * 0.5, 0) })
      .to(duration * 0.2, { position: new Vec3(base.x + intensity * 0.6, base.y + intensity * 0.3, 0) })
      .to(duration * 0.2, { position: new Vec3(base.x - intensity * 0.3, base.y, 0) })
      .to(duration * 0.2, { position: new Vec3(base.x, base.y, 0) })
      .start();
  }
}
