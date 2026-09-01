export const XIAOQI_PERSONA =
  '你是一位名叫小柒的餐厅老板娘，离异后带着女儿糖糖重新经营一家名叫"暖柒餐厅"的小店。' +
  '你性格温暖坚韧、乐观爱笑，喜欢做饭，也喜欢和人聊生活、分享经历、交流育儿心得。' +
  '请始终用第一人称、口语化、带温度地回应；回答保持简洁（一般 2-4 句）。' +
  '玩家可能和你聊：生活经历、食物制作、育儿经验。你可以自然地接话、反问，让对话像朋友闲聊。';

export interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatReply {
  text: string;
  ok: boolean;
}

export interface ChatOptions {
  baseUrl: string;
  fetchImpl?: typeof fetch;
  timeoutMs?: number;
  maxHistory?: number;
}

const DEFAULT_TIMEOUT = 20_000;
const DEFAULT_MAX_HISTORY = 6;

function fallbackText(): string {
  return '哎呀，店里信号不太好，我这边暂时没听清。你过会儿再找我聊呀～';
}

export class ChatService {
  history: ChatMsg[] = [];
  private baseUrl: string;
  private fetchImpl: typeof fetch;
  private timeoutMs: number;
  private maxHistory: number;

  constructor(opts: ChatOptions) {
    this.baseUrl = opts.baseUrl.replace(/\/$/, '');
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch.bind(globalThis);
    this.timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT;
    this.maxHistory = opts.maxHistory ?? DEFAULT_MAX_HISTORY;
  }

  buildPrompt(input: string): string {
    const lines: string[] = [XIAOQI_PERSONA];
    for (const m of this.history) {
      lines.push(`${m.role === 'user' ? '玩家' : '小柒'}：${m.content}`);
    }
    lines.push(`玩家：${input}`);
    lines.push('小柒：');
    return lines.join('\n');
  }

  async send(input: string): Promise<ChatReply> {
    const trimmed = input.trim();
    if (trimmed) this.history.push({ role: 'user', content: trimmed });
    if (this.history.length > this.maxHistory * 2) {
      this.history = this.history.slice(this.history.length - this.maxHistory * 2);
    }

    const prompt = this.buildPrompt(trimmed);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);

    try {
      const res = await this.fetchImpl(`${this.baseUrl}/api/backend/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: ctrl.signal,
      });
      let result = '';
      try {
        const json = (await res.json()) as { result?: string };
        result = (json.result ?? '').trim();
      } catch { }
      if (result) {
        this.history.push({ role: 'assistant', content: result });
        return { text: result, ok: true };
      }
      // 失败时弹出刚入历史的用户消息，避免历史里出现没有回复的断裂轮次
      if (trimmed) this.history.pop();
      return { text: fallbackText(), ok: false };
    } catch {
      if (trimmed) this.history.pop();
      return { text: fallbackText(), ok: false };
    } finally {
      clearTimeout(timer);
    }
  }

  clear(): void {
    this.history = [];
  }
}
