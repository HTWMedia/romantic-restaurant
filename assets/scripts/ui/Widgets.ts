import { Button, Color, Graphics, Label, Layers, Node, UITransform } from 'cc';

export const COLOR = {
  bg:       new Color(38, 38, 51, 255),
  panel:    new Color(60, 60, 80, 255),
  primary:  new Color(255, 105, 97, 255),
  accent:   new Color(255, 179, 71, 255),
  green:    new Color(90, 200, 140, 255),
  red:      new Color(235, 90, 90, 255),
  gray:     new Color(110, 110, 125, 255),
  text:     new Color(235, 235, 240, 255),
  white:    new Color(255, 255, 255, 255),
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

export function makeLabel(
  name: string, parent: Node, text: string, fontSize: number,
  x: number, y: number, color?: Color,
): Label {
  const n = makeNode(name, parent, 200, 40, x, y);
  const l = n.addComponent(Label);
  l.string = text;
  l.fontSize = fontSize;
  l.lineHeight = fontSize + 4;
  if (color) l.color = color;
  return l;
}

export function makeButton(
  name: string, parent: Node, w: number, h: number,
  x: number, y: number, bg: Color, text: string, onClick: () => void,
): Node {
  const n = makeRect(name, parent, w, h, x, y, bg);
  n.addComponent(Button);
  makeLabel('btn-text', n, text, 18, 0, 0, COLOR.white);
  n.on(Button.EventType.CLICK, onClick);
  return n;
}
