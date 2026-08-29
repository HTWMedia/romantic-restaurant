import { Button, Color, Graphics, Label, Node } from 'cc';
import { DialogueLine } from '../core/chapters';
import { COLOR, makeLabel, makeRect, panelWithShadow } from './Widgets';
import { ArtService } from './ArtView';

export class DialogueView {
  private overlay!: Node;
  private panel!: Node;
  private avatar!: Label;
  private nameL!: Label;
  private textL!: Label;
  private lines: DialogueLine[] = [];
  private idx = 0;
  private onDone?: () => void;

  constructor(parent: Node) {
    this.overlay = makeRect('dlg-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 120));
    this.overlay.active = false;
    this.overlay.on(Node.EventType.TOUCH_START, () => this.next());

    this.panel = ArtService.panelWithArt('dlg-panel', parent, 'panel-dialogue', 760, 200, 0, -200);
    this.panel.active = false;
    this.avatar = makeLabel('dlg-avatar', this.panel, '🙂', 54, -300, 0, COLOR.text);
    this.nameL = makeLabel('dlg-name', this.panel, '', 20, -170, 60, COLOR.primary);
    this.nameL.isBold = true;
    this.textL = makeLabel('dlg-text', this.panel, '', 18, -170, 0, COLOR.text);
    this.panel.on(Node.EventType.TOUCH_START, () => this.next());
  }

  play(lines: DialogueLine[], onDone?: () => void): void {
    if (!lines || lines.length === 0) { onDone?.(); return; }
    this.lines = lines;
    this.idx = 0;
    this.onDone = onDone;
    this.overlay.active = true;
    this.panel.active = true;
    this.render();
  }

  private render(): void {
    const l = this.lines[this.idx];
    this.avatar.string = l.emoji;
    this.nameL.string = l.who;
    this.textL.string = l.text;
  }

  private next(): void {
    if (!this.panel.active) return;
    this.idx++;
    if (this.idx >= this.lines.length) {
      this.overlay.active = false;
      this.panel.active = false;
      const cb = this.onDone;
      this.onDone = undefined;
      cb?.();
      return;
    }
    this.render();
  }
}
