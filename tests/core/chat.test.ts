import { describe, expect, it } from 'vitest';
import { ChatService, XIAOQI_PERSONA, ChatReply } from '../../assets/scripts/core/chat';

function fakeFetch(resolveWith?: object, rejectWith?: Error, abortOnSignal?: boolean) {
  return ((_url: unknown, init?: RequestInit) => {
    return new Promise<Response>((resolve, reject) => {
      const ctrl = (init as any)?.signal as AbortSignal | undefined;
      if (abortOnSignal && ctrl) {
        ctrl.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      }
      if (rejectWith) { reject(rejectWith); return; }
      const body = { result: '你好呀，今天店里忙吗？' };
      resolve({
        ok: true,
        status: 200,
        json: async () => resolveWith ?? body,
      } as Response);
    });
  }) as typeof fetch;
}

describe('ChatService', () => {
  it('send 访问正确 URL 且 body 含 prompt，prompt 含人设与历史', async () => {
    let url = '';
    let prompt = '';
    const svc = new ChatService({
      baseUrl: 'https://example.com',
      fetchImpl: (async (u: unknown, init?: RequestInit) => {
        url = String(u);
        prompt = JSON.parse(String(init?.body)).prompt;
        return { ok: true, status: 200, json: async () => ({ result: '你好呀' }) } as Response;
      }) as typeof fetch,
    });

    svc.send('今天聊点什么');
    // 人设应已注入首条用户消息的历史
    const firstUser = svc.history.find(m => m.role === 'user');
    expect(firstUser).toBeDefined();

    const reply = await svc.send('我们聊聊开店吧');
    expect(url).toBe('https://example.com/api/backend/chat');
    expect(prompt).toContain(XIAOQI_PERSONA);
    expect(prompt).toContain('玩家：我们聊聊开店吧');
    expect(prompt).toContain('玩家：今天聊点什么');
    expect(reply.ok).toBe(true);
    expect(reply.text).toBe('你好呀');
    expect(svc.history[svc.history.length - 1]).toEqual({ role: 'assistant', content: '你好呀' });
  });

  it('历史裁剪：超过 maxHistory 轮只保留最近', async () => {
    let prompt = '';
    const svc = new ChatService({
      baseUrl: 'https://example.com',
      maxHistory: 2,
      fetchImpl: (async (_u: unknown, init?: RequestInit) => {
        prompt = JSON.parse(String(init?.body)).prompt;
        return { ok: true, status: 200, json: async () => ({ result: 'ok' }) } as Response;
      }) as typeof fetch,
    });
    const push = (role: 'user' | 'assistant') => svc.history.push({ role, content: 'x' });
    for (let i = 0; i < 6; i++) { push('user'); push('assistant'); }
    const before = svc.history.length;
    // 再次 send 触发裁剪
    await svc.send('触发裁剪');
    // maxHistory=2 轮 → 最多保留 2*2 + 新 user + assistant = 6 条
    expect(before).toBeGreaterThanOrEqual(6);
    expect(svc.history.length).toBeLessThanOrEqual(6);
    expect(prompt).toContain('触发裁剪');
  });

  it('后端失败时降级：ok=false 且返回兜底文案，不抛异常', async () => {
    const svc = new ChatService({
      baseUrl: 'https://example.com',
      timeoutMs: 500,
      fetchImpl: (async () => { throw new Error('network down'); }) as typeof fetch,
    });
    const reply = await svc.send('在吗');
    expect(reply.ok).toBe(false);
    expect(reply.text.length).toBeGreaterThan(0);
    // 失败不应留下没有回复的用户消息
    expect(svc.history.some(m => m.role === 'user' && m.content === '在吗')).toBe(false);
  });

  it('后端返回空 result 时降级', async () => {
    const svc = new ChatService({
      baseUrl: 'https://example.com',
      fetchImpl: (async () => ({ ok: true, status: 200, json: async () => ({ result: '' }) }) as Response) as typeof fetch,
    });
    const reply = await svc.send('在吗');
    expect(reply.ok).toBe(false);
    expect(svc.history.some(m => m.role === 'user' && m.content === '在吗')).toBe(false);
  });

  it('clear 清空历史', () => {
    const svc = new ChatService({ baseUrl: 'https://example.com' });
    svc.history.push({ role: 'user', content: 'a' });
    svc.clear();
    expect(svc.history.length).toBe(0);
  });

  it('超时触发降级', async () => {
    const svc = new ChatService({
      baseUrl: 'https://example.com',
      timeoutMs: 40,
      fetchImpl: (async (_u: unknown, init?: RequestInit) => {
        return await new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
        });
      }) as typeof fetch,
    });
    const reply = await svc.send('喂');
    expect(reply.ok).toBe(false);
  });
});
