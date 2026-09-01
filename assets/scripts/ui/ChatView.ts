import { Button, Color, EditBox, Graphics, Label, Mask, Node, Vec3, tween } from 'cc';
import { COLOR, makeLabel, makeNode, makeRect, pillButton, roundRect } from './Widgets';
import { ArtService } from './ArtView';
import { supportsSpeechRecognition, supportsSpeechSynthesis } from '../core/platform';
import { ChatService, ChatReply, ChatMsg } from '../core/chat';

const WELCOME_LINES = [
  '嗨，我是小柒！欢迎来我的小店里坐坐～',
  '今天想聊聊生活、做饭，还是带娃那些事儿？',
];
const FALLBACK_AVATAR = 'char-xiaoqi';
const MSG_WINDOW_H = 280;
const MSG_MAX = 9;

type Mood = 'idle' | 'say' | 'happy';

export class ChatView {
  isOpen = false;
  private overlay!: Node;
  private panel!: Node;
  private avatar!: Node;
  private avatarFallback!: Label;
  private mood = 'idle' as Mood;
  private floatT = 0;
  private sayT = 0;
  private msgList!: Node;
  private input!: EditBox;
  private micBtn!: Node;
  private sendBtn!: Node;
  private rec: any = null;
  private listening = false;
  private talking = false;
  private pulsing = false;
  private pending = false;
  private hasFetch: boolean;
  private curKey = '';
  // 欢迎语只做本地展示，不进 service.history，避免伪历史发给 LLM
  private readonly welcomeMsgs: ChatMsg[] = WELCOME_LINES.map(w => ({ role: 'assistant' as const, content: w }));

  constructor(private parent: Node, private service: ChatService, hasFetch: boolean) {
    this.hasFetch = hasFetch;
    this.overlay = makeRect('chat-overlay', parent, 960, 640, 0, 0, new Color(0, 0, 0, 110));
    this.overlay.active = false;
    this.overlay.on(Node.EventType.TOUCH_START, () => this.close());

    this.panel = ArtService.panelWithArt('chat-panel', parent, 'panel-popup', 720, 520, 0, 0);
    this.panel.active = false;

    this.buildHeader();
    roundRect('chat-msgs-bg', this.panel, 640, MSG_WINDOW_H, 0, 30, 12, COLOR.panel, COLOR.border);
    this.msgList = makeNode('chat-msgs', this.panel, 640, MSG_WINDOW_H, 0, 30);
    this.clipMessages();
    this.buildInputBar();

    this.pushWelcome();
    this.rebuildMessages();
  }

  private buildHeader(): void {
    makeLabel('chat-title', this.panel, '🔴 LIVE · 小柒', 20, 0, 232, COLOR.text);
    const topic = roundRect('chat-topics', this.panel, 300, 30, 0, 196, 15, COLOR.panel, COLOR.border);
    makeLabel('chat-topic-text', topic, '生活 · 做饭 · 育儿', 13, 0, 0, COLOR.subtext);

    this.avatar = makeNode('chat-avatar', this.panel, 120, 120, -270, 150);
    const g = this.avatar.addComponent(Graphics);
    g.fillColor = COLOR.panel;
    g.circle(0, 0, 60);
    g.fill();
    this.avatarFallback = makeLabel('chat-avatar-fallback', this.avatar, '🙋‍♀️', 40, 0, -10, COLOR.text);
  }

  private buildInputBar(): void {
    const bar = roundRect('chat-input-bar', this.panel, 640, 54, 0, -216, 16, COLOR.panel, COLOR.border);
    const box = makeNode('chat-edit', bar, 440, 38, -60, 0);
    this.input = box.addComponent(EditBox);
    this.input.placeholder = '和小柒说点什么…';
    this.input.maxLength = 200;
    this.input.string = '';

    if (supportsSpeechRecognition() && this.hasFetch) {
      this.micBtn = pillButton('chat-mic', bar, 46, 38, 220, 0, COLOR.accent, '🎙', () => this.toggleMic());
    }
    this.sendBtn = roundRect('chat-send', bar, 64, 38, 285, 0, 19, COLOR.primary);
    this.sendBtn.addComponent(Button);
    makeLabel('chat-send-text', this.sendBtn, '发送', 16, 0, 0, COLOR.white);
    this.sendBtn.on(Button.EventType.CLICK, () => this.onSend());
  }

  private clipMessages(): void {
    // GRAPHICS_STENCIL 遮罩裁剪子节点（气泡）；窗口底色由 chat-msgs-bg 提供
    const g = this.msgList.addComponent(Graphics);
    g.roundRect(-320, -MSG_WINDOW_H / 2, 640, MSG_WINDOW_H, 12);
    g.fill();
    const mask = this.msgList.addComponent(Mask);
    mask.type = Mask.Type.GRAPHICS_STENCIL;
  }

  private pushWelcome(): void {
    this.mood = 'happy';
  }

  private onSend(): void {
    const text = this.input.string.trim();
    if (!text || this.pending) return;
    this.input.string = '';
    void this.dispatch(text);
  }

  private toggleMic(): void {
    if (this.pending) return;
    if (this.listening) { this.stopRec(); return; }
    const w = globalThis as any;
    const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Ctor) return;
    this.rec = new Ctor();
    this.rec.lang = 'zh-CN';
    this.rec.interimResults = false;
    this.rec.onresult = (e: any) => {
      const t = e.results && e.results[0] && e.results[0][0] && e.results[0][0].transcript;
      if (t) {
        const hasText = this.input.string.length === 0;
        if (hasText) this.input.string = t;
        void this.dispatch(t);
      }
      this.stopRec();
    };
    this.rec.onerror = () => this.stopRec();
    this.rec.onend = () => this.stopRec();
    try {
      this.rec.start();
      this.listening = true;
      if (this.micBtn) this.micBtn.getComponentInChildren(Label)!.string = '⏹';
    } catch { this.stopRec(); }
  }

  private stopRec(): void {
    this.listening = false;
    try { this.rec?.stop(); } catch { }
    this.rec = null;
    if (this.micBtn) this.micBtn.getComponentInChildren(Label)!.string = '🎙';
  }

  private async dispatch(text: string): Promise<void> {
    if (!this.hasFetch) {
      this.service.history.push({ role: 'user', content: text });
      this.service.history.push({ role: 'assistant', content: '当前环境暂不支持联网聊天，我先陪你说句话吧～' });
      this.rebuildMessages();
      return;
    }
    this.pending = true;
    this.setSendEnabled(false);
    this.mood = 'idle';
    this.rebuildMessages();
    const reply: ChatReply = await this.service.send(text);
    this.pending = false;
    this.setSendEnabled(true);
    this.applyMoodByReply(reply);
    this.rebuildMessages();
    if (reply.ok) {
      this.stopRec();
      this.playVoice(reply.text);
    }
  }

  private applyMoodByReply(reply: ChatReply): void {
    if (reply.ok) {
      const pos = /开心|哈哈|真好|喜欢|棒|不错|谢谢|好呀|欢迎|加油|甜/i.test(reply.text);
      this.mood = pos ? 'happy' : 'say';
      this.sayT = 1.6;
    } else {
      this.mood = 'idle';
    }
  }

  private playVoice(text: string): void {
    if (!supportsSpeechSynthesis()) return;
    const synth = (globalThis as any).speechSynthesis;
    let voice: SpeechSynthesisVoice | null = null;
    for (const v of synth.getVoices()) {
      if (/zh/i.test(v.lang) && /female|woman|xiaoyi|tingting|huihui/i.test(v.name)) { voice = v; break; }
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'zh-CN';
    if (voice) u.voice = voice;
    this.talking = true;
    this.mood = 'say';
    u.onend = () => { this.talking = false; };
    u.onerror = () => { this.talking = false; };
    synth.speak(u);
  }

  private setSendEnabled(on: boolean): void {
    const send = this.sendBtn.getComponent(Button);
    if (send) send.interactable = on;
  }

  private rebuildMessages(): void {
    this.msgList.removeAllChildren();
    const msgs = [...this.welcomeMsgs, ...this.service.history].slice(-MSG_MAX);
    const chunkSize = 22;
    let y = MSG_WINDOW_H / 2 - 20;
    msgs.forEach((m, i) => {
      const isUser = m.role === 'user';
      const wrapped = m.content.match(new RegExp(`.{1,${chunkSize}}`, 'g')) ?? [m.content];
      const lines = wrapped.length;
      const h = 24 + lines * 18;
      const width = Math.min(360, 24 + m.content.length * 17);
      const x = isUser ? 210 : -210;
      const bubble = roundRect(`m-${i}`, this.msgList, width, h, x, y, 12,
        isUser ? COLOR.primary : COLOR.panel, isUser ? undefined : COLOR.border);
      const label = makeLabel(`mt-${i}`, bubble, m.content, 14, 0, 0,
        isUser ? COLOR.white : COLOR.text);
      label.overflow = Label.Overflow.NONE;
      if (lines > 1) label.string = wrapped.join('\n');
      y -= h + 10;
    });
    if (this.pending) {
      const bubble = roundRect('m-typing', this.msgList, 150, 32, -210, y, 12, COLOR.panel, COLOR.border);
      makeLabel('mt-typing', bubble, '小柒正在输入…', 14, 0, 0, COLOR.subtext);
    }
  }

  private applyAvatar(mood: Mood): void {
    this.mood = mood;
    const key = (mood === 'say' && (this.talking || this.sayT > 0))
      ? 'char-xiaoqi-say'
      : mood === 'happy' ? 'char-xiaoqi-happy' : 'char-xiaoqi-idle';
    if (this.curKey === key) return;
    this.curKey = key;
    this.avatar.removeAllChildren();
    let used = false;
    if (ArtService.hasArt(key)) {
      ArtService.makeSprite(this.avatar, key, 120, 120, 0, 0, 'avatar-frame');
      used = true;
    } else if (ArtService.hasArt(FALLBACK_AVATAR)) {
      ArtService.makeSprite(this.avatar, FALLBACK_AVATAR, 120, 120, 0, 0, 'avatar-frame');
      used = true;
    }
    this.avatarFallback.node.active = !used;
  }

  update(dt: number): void {
    if (!this.isOpen) return;
    this.floatT += dt;
    const dy = Math.sin(this.floatT * 2) * 4;
    this.avatar.setPosition(-270, 150 + dy, 0);
    if (this.sayT > 0) this.sayT -= dt;
    this.applyAvatar(this.mood);
    if (this.mood === 'happy' && !this.pulsing) {
      this.pulsing = true;
      tween(this.avatar)
        .to(0.2, { scale: new Vec3(1.08, 1.08, 1) })
        .to(0.2, { scale: new Vec3(1, 1, 1) })
        .call(() => { this.pulsing = false; })
        .start();
    }
  }

  open(): void {
    this.isOpen = true;
    this.overlay.active = true;
    this.panel.active = true;
    this.mood = 'happy';
  }

  close(): void {
    this.isOpen = false;
    this.stopRec();
    const synth = (globalThis as any).speechSynthesis;
    if (synth && typeof synth.cancel === 'function') synth.cancel();
    this.talking = false;
    this.pulsing = false;
    this.overlay.active = false;
    this.panel.active = false;
  }
}
