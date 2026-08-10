import { Button, Color, Graphics, Label, Layers, Node, UITransform } from 'cc';

export const COLOR = {
  bg:      new Color(247, 232, 215, 255), // #F7E8D7 奶油米色
  decor:   new Color(232, 211, 188, 255), // #E8D3BC 地面/装饰
  panel:   new Color(255, 247, 238, 255), // #FFF7EE 奶油白
  border:  new Color(227, 205, 180, 255), // #E3CDB4 浅木描边
  primary: new Color(255, 138, 92, 255),  // #FF8A5C 暖橙
  accent:  new Color(255, 201, 77, 255),  // #FFC94D 蜂蜜黄
  green:   new Color(126, 217, 167, 255), // #7ED9A7 薄荷绿
  red:     new Color(232, 106, 94, 255),  // #E86A5E 警示红
  text:    new Color(90, 70, 50, 255),    // #5A4632 深棕
  subtext: new Color(156, 133, 104, 255), // #9C8568 浅棕
  white:   new Color(255, 255, 255, 255),
  shadow:  new Color(90, 70, 50, 38),     // 投影半透明
};

export function makeNode(name: string, parent: Node, w: number, h: number, x: number, y: number): Node {
  const n = new Node(name);
  n.layer = Layers.Enum.UI_2D;
  const t = n.addComponent(UITransform);
  t.setContentSize(w, h);
  n.setPosition(x, y);
  parent.addChild(n);
  return n;
}

export function makeRect(
  name: string, parent: Node, w: number, h: number,
  x: number, y: number, color: Color,
): Node {
  const n = makeNode(name, parent, w, h, x, y);
  const g = n.addComponent(Graphics);
  g.fillColor = color;
  g.rect(-w / 2, -h / 2, w, h);
  g.fill();
  return n;
}

export function roundRect(
  name: string, parent: Node, w: number, h: number,
  x: number, y: number, radius: number, fill: Color, stroke?: Color,
): Node {
  const n = makeNode(name, parent, w, h, x, y);
  const g = n.addComponent(Graphics);
  const r = Math.max(0, Math.min(radius, Math.min(w, h) / 2));
  g.fillColor = fill;
  g.roundRect(-w / 2, -h / 2, w, h, r);
  g.fill();
  if (stroke) {
    g.lineWidth = 2;
    g.strokeColor = stroke;
    g.stroke();
  }
  return n;
}

export function panelWithShadow(
  name: string, parent: Node, w: number, h: number,
  x: number, y: number, radius: number, fill: Color, stroke?: Color,
): Node {
  makeRect(name + '-shadow', parent, w, h, x, y - 4, COLOR.shadow);
  return roundRect(name, parent, w, h, x, y, radius, fill, stroke);
}

export function pillButton(
  name: string, parent: Node, w: number, h: number,
  x: number, y: number, bg: Color, text: string, onClick: () => void,
): Node {
  const n = roundRect(name, parent, w, h, x, y, h / 2, bg);
  n.addComponent(Button);
  makeLabel('btn-text', n, text, 18, 0, 0, COLOR.white);
  n.on(Button.EventType.CLICK, onClick);
  return n;
}

export function makeLabel(
  name: string, parent: Node, text: string, fontSize: number,
  x: number, y: number, color?: Color,
): Label {
  const n = makeNode(name, parent, 200, 40, x, y);
  const l = n.addComponent(Label);
  l.string = text;
  l.fontSize = fontSize;
  l.lineHeight = fontSize + 4;
  l.color = color ?? COLOR.text;
  return l;
}

export function makeButton(
  name: string, parent: Node, w: number, h: number,
  x: number, y: number, bg: Color, text: string, onClick: () => void,
): Node {
  const n = roundRect(name, parent, w, h, x, y, 10, bg);
  n.addComponent(Button);
  makeLabel('btn-text', n, text, 18, 0, 0, COLOR.white);
  n.on(Button.EventType.CLICK, onClick);
  return n;
}

export function restyleCard(node: Node, fill: Color, stroke: Color, radius: number): void {
  const t = node.getComponent(UITransform)!;
  const w = t.contentSize.width;
  const h = t.contentSize.height;
  const g = node.getComponent(Graphics)!;
  g.clear();
  g.fillColor = fill;
  g.roundRect(-w / 2, -h / 2, w, h, radius);
  g.fill();
  g.lineWidth = 2;
  g.strokeColor = stroke;
  g.stroke();
}

export function lerpColor(a: Color, b: Color, t: number, out?: Color): Color {
  const k = Math.max(0, Math.min(1, t));
  const result = out ?? new Color();
  result.r = Math.round(a.r + (b.r - a.r) * k);
  result.g = Math.round(a.g + (b.g - a.g) * k);
  result.b = Math.round(a.b + (b.b - a.b) * k);
  result.a = Math.round(a.a + (b.a - a.a) * k);
  return result;
}
