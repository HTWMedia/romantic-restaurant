# 直播聊天（数字人·小柒）设计文档

日期：2026-09-01
范围：为游戏新增「直播聊天」功能——主角小柒以 2D 多表情帧动画的数字人形象，通过**文字**与**语音**双通道与玩家对话，话题覆盖生活经历、食物制作、育儿经验。
决策（已与用户确认）：接真实智能后端（现有 `twmedia.dpdns.org` 的 DeepSeek chat）/ 2D 多表情帧动画 / 语音+文字双通道（浏览器原生 Web Speech）/ 顶部 HUD 按钮 + 弹层面板 / 前端拼装人设与历史。

## 概述

在 HUD 顶部新增「聊天」按钮，点击弹出模态面板。面板上方是小柒的数字人形象（待机/说话/开心三套表情帧，说话时切换+呼吸浮动，模拟“活人”感），中间是滚动消息列表，底部是文字输入框 + 麦克风按钮。玩家发送文字或语音后，前端把「小柒人设 + 对话历史 + 玩家输入」拼成一个 prompt 发给后端，后端返回小柒的回复文字，前端以气泡展示并可语音合成朗读。整个功能与现有经营/合成主循环解耦，不影响核心玩法。

## 数据与核心逻辑（`core/chat.ts`，新增）

```ts
export interface ChatMsg { role: 'assistant' | 'user'; content: string; }
export interface ChatReply { text: string; ok: boolean; }
export class ChatService {
  constructor(baseUrl: string, opts?: { maxHistory?: number });
  history: ChatMsg[];                  // 已展开的对话，最多保留 maxHistory 轮
  async send(input: string): Promise<ChatReply>;
  clear(): void;
}
```

- **人设固定段**（`XIAOQI_PERSONA` 常量）：一段中文系统设定，描述小柒离异后带女儿糖糖重开“暖柒餐厅”、性格温暖坚韧、爱做饭、爱聊生活/做饭/育儿；约束其用第一人称、口语化、带温度地回应，可主动开启上一话题。
- **多轮处理**：后端无状态（单条 prompt→回复），故前端维护 `history`，每回合把 `[人设] + [最近 maxHistory 轮的 user/assistant 交替记录] + [当前用户输入]` 拼进 prompt。
- **发送**：`fetch(\`${baseUrl}/api/backend/chat\`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ prompt }) })` → 读 `{ result }`。
- **降级**：请求失败/结果为空/超时（设合理 AbortSignal，如 60s）时返回本地友好兜底文案（`ok:false`），面板不卡死；`ok` 供 UI 决定是否切开心表情/语音。
- **话题引导**：人设中引导小柒在收到简短或寒暄输入时可自然延伸到生活/做饭/育儿话题。

## 数字人形象（美术 + 动画）

- **新增素材**：3 张小柒姿势立绘帧（沿用现有水彩 `char-xiaoqi` 同人设风格）：
  - `char-xiaoqi-idle`（待机）
  - `char-xiaoqi-say`（说话，微张嘴）
  - `char-xiaoqi-happy`（开心微笑）
- **接入美术清单**：在 `ART_MANIFEST`/`art.ts` 加入三个 key（category: `character`，尺寸沿用 150×150）。缺图回退：fallback 到现有 `char-xiaoqi`，再没有则用 emoji。
- **动画**（`ChatView` 内实现）：
  - 待机：`idle` 帧 + 轻微上下呼吸浮动（`tween`/`update` 正弦位移）。
  - 回复中：`idle ↔ say` 按固定节奏交错切换，同时语音合成时同步口型，头轻微缩放。
  - 收到开心回复（`ok` 且文案含正向信号，或简单启发式）：短暂切 `happy` 再回待机。
- **面板布局**（沿用 `Widgets.ts` 代码构建 UI 与 `panel-popup` 面板美术，尺寸约 720×520，居中，模态带半透明遮罩）：
  - 顶部：小柒头像（约 150×150）+ 「🔴 LIVE 直播中」角标 + 话题标签（生活 · 做饭 · 育儿）。
  - 中部：可滚动消息列表（玩家右对齐、小柒左对齐气泡）。
  - 底部：文字输入框 + 发送按钮 + 麦克风按钮。

## 语音（浏览器原生 Web Speech，经 `platform.ts` 特性探测）

- **特性探测**：新增 `platform.ts` 辅助 `supportsSpeechRecognition()` / `supportsSpeechSynthesis()`；仅在浏览器 Web 版且能力可用时启用，微信小游戏/无能力环境自动降级为纯文字。
- **玩家语音输入（识别）**：麦克风按钮 → `(window as any).webkitSpeechRecognition ?? SpeechRecognition`，`lang='zh-CN'`；`onresult` 取 `transcript` 填入输入框；期间按钮显示录音态；识别失败/拒绝授权给出轻提示，不阻塞文字输入。
- **小柒语音输出（合成）**：回复达到后 `speechSynthesis.speak(new SpeechSynthesisUtterance(text))`，优先匹配 `lang` 含 `zh` 的女声 `voice`；播放结束/取消时动画回待机；不支持则静默只显示文字。
- **会话/页面生命周期**：面板关闭时 `cancel()` 语音；组件销毁时清理识别器与合成队列，避免残留。

## 接入（`ui/Main.ts` + `ui/HudView.ts`）

- `HudView` 新增一个「聊天」按钮回调（构造签名追加 `chatCb`，复用 `pillButton` 布局到顶部栏空闲位）。
- `Main.buildGame` 中 `new ChatView(this.node, ...)`，`options` 里传入后端 base URL（`const CHAT_BASE = 'https://twmedia.dpdns.org'`，集中在一处便于环境切换）。
- 平台相关：`ChatService` 依赖 `globalThis.fetch`（Web/部分微信可用）；若微信环境无 `fetch`，视图层按 `platform.ts` 判断是否显示聊天按钮。
- 聊天面板为模态，打开时暂停/屏蔽其下点击（与现有 `UpgradeView` 等一致），关闭恢复。

## 后端改动（`HTWCore.Web`，仅 CORS）

- `Startup.ConfigureServices`：`services.AddCors(o => o.AddPolicy("GameCors", p => p.WithOrigins("https://htwmedia.github.io").AllowAnyHeader().AllowAnyMethod()))`，并允许本机预览端口（`http://localhost:*`、`http://127.0.0.1:*`）便于本地联调。
- `Startup.Configure` 的 `UseRouting()` 之后、`UseAuthentication()` 之前 `app.UseCors("GameCors")`。
- 现有 `POST /api/backend/chat`（匿名 `{prompt}`→`{result}`）无需改动。
- 需重新构建并部署到 `twmedia.dpdns.org` 使跨域生效。

## 测试

- `tests/core/chat.test.ts`：
  - `ChatService.send` 用注入的假 `fetch`：断言发往正确 URL、body 含 `prompt` 且 prompt 内包含人设段、最近一轮输入与历史拼接正确。
  - 历史裁剪：超过 `maxHistory` 时只保留最近 N 轮。
  - 降级：fetch 抛错 / 返回 `{result:''}` / 超时 → 返回 `ok:false` 与兜底文案，且不抛异常。
  - `clear()` 清空历史。
- 已有平台类测试保持通过；`platform.ts` 新增探测函数补最小单测（mock `globalThis` 能力）。

## 备注 / 边界

- 首次打开可有 1-2 句欢迎语（本地常量），立即有反馈、不依赖后端。
- 后端 DeepSeek 靠 cookie/token 配置驱动，若某时刻后端无有效配置会返回错误文案——前端降级已覆盖，不影响原有游戏。
- 生成人设文案与欢迎语时避免内部实现细节，统一用「智能创作」等中性表述。
