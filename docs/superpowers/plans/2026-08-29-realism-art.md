# 写实美术替换实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把游戏全界面由 emoji/矢量色块绘制的「人 / 物 / 背景 / 面板 / 小图标」替换为写实美术图，缺图自动回退原渲染，可分阶段预览。

**Architecture:** 新增两条数据/工具链路：(1) `assets/scripts/core/art.ts`（不 import `cc`，可 vitest）维护全量清单 `ART_MANIFEST` 与「已加载 key」注册表；(2) `assets/scripts/ui/ArtView.ts` 封装 `cc`：`ArtService` 启动时 `resources.load` 预载 → 注册进 core 注册表，`makeSprite`/`makePanel`(9-slice)/`attachIconSprite` 等渲染助手，缺图返回 null 由调用方走旧路径。`Main.onLoad` 先 `await ArtService.preload()` 再建全部 UI（`update` 用 `ready` 守卫）。数据层给 `Dish`/`DialogueLine`/`SkinDecor`/`Skin` 增加 `artKey` 字段，原 emoji 字段全部保留做回退。

**Tech Stack:** Cocos Creator 3.8.8（TypeScript，编辑器 tsc 走 `temp/tsconfig.cocos.json`：`target: ES2015`、`strict: true`、`isolatedModules: true`）；vitest 4.1.10（`npm test` = `vitest run`）；Node（占位图生成脚本经 vitest 跑）。预览地址 `http://localhost:7456/`。

## Global Constraints

- 编辑代码禁用 `Array.prototype.includes`（lib 仅到 ES2015；create 菜单、菜单都可编译期拦截）。`?.`/`??` 允许（TS 会降级编译，且现有 `Widgets.ts` 已使用 `??`）。
- `assets/scripts/core/*` 不得 `import 'cc'`（保持 vitest 可跑）；`ui/*` 可 import `cc`。
- 回退铁律：任何 `artKey` 缺图时该处必须渲染回退内容（原 emoji / 矢量），**游戏永不因缺图中断**。
- 语言：界面与 commit message 用中性表述（"美术资源 / art assets"），不出现内部实现名。
- commit message 简洁高层，英文 conventional-style，每任务一个 commit。
- 编辑器脚本改动后，若预览 chunk 未更新（预览里行为仍是旧代码），需「资源管理器里右键该 .ts → Reimport」。
- 编辑器 tsc 校验命令（每任务跑）：
  `node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json`
  预期输出：项目脚本 0 错误（99 条 `cc.d.ts` 环境噪音可忽略）。
- 单测命令：`npm test`（vitest run，全部通过，含既有 19 条不回归）。

---

### Task 1: `core/art.ts` 清单与回退注册表 + 单测

**Files:**
- Create: `assets/scripts/core/art.ts`
- Create: `tests/core/art.test.ts`

**Interfaces:**
- Consumes: 无
- Produces: 本任务产出（后续所有任务依赖，签名为准）：
  - `type ArtCategory = 'bg' | 'panel' | 'customer' | 'character' | 'dish' | 'icon' | 'decor'`
  - `interface ArtEntry { key: string; category: ArtCategory; w: number; h: number }`
  - `const ART_MANIFEST: ArtEntry[]`（51 项）
  - `function entry(key: string): ArtEntry | undefined`
  - `const CUSTOMER_ART: string[]`（`['cust-1'..'cust-6']`）
  - `function hasArt(key: string): boolean`
  - `function markLoaded(key: string): void`

- [ ] **Step 1: 写失败测试**

`tests/core/art.test.ts`：

```ts
import { describe, it, expect } from 'vitest';
import { ART_MANIFEST, CUSTOMER_ART, entry, hasArt, markLoaded } from '../../assets/scripts/core/art';

describe('ART_MANIFEST', () => {
  it('条目不少于 50 且 key 唯一', () => {
    expect(ART_MANIFEST.length).toBeGreaterThanOrEqual(50);
    const keys = ART_MANIFEST.map(e => e.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('每项都有正数尺寸与合法类别', () => {
    const cats = ['bg', 'panel', 'customer', 'character', 'dish', 'icon', 'decor'];
    for (const e of ART_MANIFEST) {
      expect(e.w).toBeGreaterThan(0);
      expect(e.h).toBeGreaterThan(0);
      expect(cats).toContain(e.category);
    }
  });
  it('CUSTOMER_ART 全部在清单中', () => {
    for (const k of CUSTOMER_ART) expect(entry(k)).toBeDefined();
  });
});

describe('core hasArt 注册表（回退决策源）', () => {
  it('未注册时 hasArt 为 false（缺图回退）', () => {
    expect(hasArt('bg')).toBe(false);
  });
  it('注册后可被识别', () => {
    markLoaded('cust-1');
    expect(hasArt('cust-1')).toBe(true);
    expect(hasArt('cust-2')).toBe(false);
  });
});
```

> TDD 说明：执行者可按「先写红 → 实现 → 转绿」：第一遍先把 `expect(hasArt('bg')).toBe(false)` 临时写成 `.toBe(true)` 运行确认红，实现 core/art.ts 后改回 `false` 即绿；实现代码一步到位时直接写最终断言即可。

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL —— `art.ts` 不存在（模块找不到）。

- [ ] **Step 3: 实现 `core/art.ts`**

`assets/scripts/core/art.ts`（完整，不 import `cc`；注意 `hasArt('bg')` 初始应为 `false`）：

```ts
export type ArtCategory = 'bg' | 'panel' | 'customer' | 'character' | 'dish' | 'icon' | 'decor';

export interface ArtEntry {
  key: string;
  category: ArtCategory;
  w: number; // UI 显示尺寸（宽），占位图与对位参考
  h: number; // UI 显示尺寸（高）
}

// 全量美术清单：key = PNG 文件名（不放 .png），resources 路径 art/<key>
export const ART_MANIFEST: ArtEntry[] = [
  { key: 'bg',              category: 'bg',        w: 960, h: 640 },

  // 顾客 6 形象
  { key: 'cust-1',          category: 'customer',  w: 160, h: 220 },
  { key: 'cust-2',          category: 'customer',  w: 160, h: 220 },
  { key: 'cust-3',          category: 'customer',  w: 160, h: 220 },
  { key: 'cust-4',          category: 'customer',  w: 160, h: 220 },
  { key: 'cust-5',          category: 'customer',  w: 160, h: 220 },
  { key: 'cust-6',          category: 'customer',  w: 160, h: 220 },

  // 角色头像 + 旁白
  { key: 'char-xiaoqi',     category: 'character', w: 150, h: 150 },
  { key: 'char-tangtang',   category: 'character', w: 150, h: 150 },
  { key: 'char-laozhou',    category: 'character', w: 150, h: 150 },
  { key: 'char-ashen',      category: 'character', w: 150, h: 150 },
  { key: 'icon-narrator',   category: 'character', w: 150, h: 150 },

  // 5 张面板（9-slice）
  { key: 'panel-hud',       category: 'panel',     w: 960, h: 64 },
  { key: 'panel-orderboard',category: 'panel',     w: 920, h: 46 },
  { key: 'panel-menu',      category: 'panel',     w: 920, h: 110 },
  { key: 'panel-dialogue',  category: 'panel',     w: 760, h: 200 },
  { key: 'panel-popup',     category: 'panel',     w: 560, h: 520 },

  // 6 道菜
  { key: 'dish-fries',      category: 'dish',      w: 96,  h: 96 },
  { key: 'dish-burger',     category: 'dish',      w: 96,  h: 96 },
  { key: 'dish-pizza',      category: 'dish',      w: 96,  h: 96 },
  { key: 'dish-pasta',      category: 'dish',      w: 96,  h: 96 },
  { key: 'dish-steak',      category: 'dish',      w: 96,  h: 96 },
  { key: 'dish-dessert',    category: 'dish',      w: 96,  h: 96 },

  // P1 小图标（仅列实际有消费点的）
  { key: 'icon-coin',       category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-energy',     category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-customer',   category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-chapter',    category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-lock',       category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-replay',     category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-ad',         category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-brush',      category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-chair',      category: 'icon',      w: 32,  h: 32 },
  { key: 'icon-kitchen',    category: 'icon',      w: 32,  h: 32 },

  // P2 皮肤装饰道具
  { key: 'decor-classic-1', category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-garden-1',  category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-garden-2',  category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-garden-3',  category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-retro-1',   category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-retro-2',   category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-retro-3',   category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-ocean-1',   category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-ocean-2',   category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-ocean-3',   category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-festival-1',category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-festival-2',category: 'decor',     w: 88,  h: 88 },
  { key: 'decor-festival-3',category: 'decor',     w: 88,  h: 88 },

  // 皮肤列表小图标
  { key: 'skin-classic',    category: 'icon',      w: 40,  h: 40 },
  { key: 'skin-garden',     category: 'icon',      w: 40,  h: 40 },
  { key: 'skin-retro',      category: 'icon',      w: 40,  h: 40 },
  { key: 'skin-ocean',      category: 'icon',      w: 40,  h: 40 },
  { key: 'skin-festival',   category: 'icon',      w: 40,  h: 40 },
];

export function entry(key: string): ArtEntry | undefined {
  return ART_MANIFEST.find(e => e.key === key);
}

export const CUSTOMER_ART: string[] = ['cust-1', 'cust-2', 'cust-3', 'cust-4', 'cust-5', 'cust-6'];

// —— 已加载 key 注册表（cc-free，vitest 可测；ArtView.preload 完成后填充）——
const loadedKeys: string[] = [];

export function markLoaded(key: string): void {
  if (loadedKeys.indexOf(key) < 0) loadedKeys.push(key);
}

export function hasArt(key: string): boolean {
  return loadedKeys.indexOf(key) >= 0;
}
```

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: 全部通过（含 Step1 红尾测试改正后完整通过）。

- [ ] **Step 5: 编辑器 tsc 校验**

Run: `node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json`
Expected: 项目脚本 0 错误（忽略 cc.d.ts 噪音）。

- [ ] **Step 6: Commit**

```bash
git add assets/scripts/core/art.ts tests/core/art.test.ts
git commit -m "feat: add art asset manifest and fallback registry"
```

---

### Task 2: 占位图生成器（端到端预览用）

生成每张占位 PNG（数量=清单条目数）到 `assets/resources/art/`，让后续任务即使没有真实美术也能在预览里看到「哪里会被美术接管」。真实图到位后同名覆盖即可。

**Files:**
- Create: `tools/make-placeholder-art.test.ts`（vitest 驱动，避免 TS 的 Node 直跑问题）

**Interfaces:**
- Consumes: Task1 `ART_MANIFEST`、`ArtEntry`
- Produces: `assets/resources/art/<key>.png`（每清单条目一张）

- [ ] **Step 1: 实现生成器脚本**

`tools/make-placeholder-art.test.ts`（完整；**首行必须是 `// @ts-nocheck`**——该文件 import `fs`/`zlib` 并读 `process.env`，而工程 tsconfig 是 Cocos ES2015 + 无 `@types/node`，编辑器 tsc 会把 `tools/` 纳入检查，必须在文件级关掉类型检查。此文件只被 vitest 实际运行）：

```ts
// @ts-nocheck  // 生成器依赖 Node 内置模块与 process.env，Cocos tsconfig 无 node 类型，跳过 tsc
import { describe, it, expect } from 'vitest';
import { deflateSync } from 'zlib';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { ART_MANIFEST, ArtEntry } from '../assets/scripts/core/art';

// crate 校验表（PNG 需要）
const CRC_TABLE: number[] = (() => {
  const t: number[] = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Uint8Array): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Uint8Array): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), Buffer.from(data)]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([len, typeAndData, crc]);
}

function solidPng(w: number, h: number, rgb: [number, number, number]): Buffer {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type RGB
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    const row = y * (1 + w * 3);
    raw[row] = 0; // filter none
    for (let x = 0; x < w; x++) {
      raw[row + 1 + x * 3] = rgb[0];
      raw[row + 1 + x * 3 + 1] = rgb[1];
      raw[row + 1 + x * 3 + 2] = rgb[2];
    }
  }
  const idat = deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// 每类别给不同底色，方便肉眼区分接管区域
const CAT_COLOR: Record<string, [number, number, number]> = {
  bg:       [255, 244, 226],
  panel:    [255, 224, 178],
  customer: [255, 205, 210],
  character:[189, 224, 254],
  dish:     [198, 228, 199],
  icon:     [224, 224, 224],
  decor:    [255, 232, 176],
};

function colorOf(e: ArtEntry): [number, number, number] {
  return CAT_COLOR[e.category] ?? [230, 230, 230];
}

describe('placeholder art generator (opt-in, GEN_ART=1)', () => {
  it('写入全部占位图（缺省跳过，normal test run 保持绿色）', () => {
    if (process.env.GEN_ART !== '1') {
      expect(true).toBe(true);
      return;
    }
    const dir = 'assets/resources/art';
    mkdirSync(dir, { recursive: true });
    let wrote = 0;
    for (const e of ART_MANIFEST) {
      // 占位图用 manifest 显示尺寸的 2 倍（与真实出图规格一致）
      writeFileSync(`${dir}/${e.key}.png`, solidPng(e.w * 2, e.h * 2, colorOf(e)));
      wrote++;
    }
    expect(wrote).toBe(ART_MANIFEST.length);
  });

  it('已生成文件与清单一致（缺省跳过）', () => {
    if (process.env.GEN_ART !== '1') {
      expect(true).toBe(true);
      return;
    }
    for (const e of ART_MANIFEST) {
      expect(existsSync(`assets/resources/art/${e.key}.png`)).toBe(true);
    }
  });
});
```

- [ ] **Step 2: 运行生成**

Run（PowerShell）:
```powershell
$env:GEN_ART='1'; npx vitest run tools/make-placeholder-art.test.ts
```
Expected: 2 个用例通过，`assets/resources/art/` 下生成与清单条目数一致的 `*.png`。

- [ ] **Step 3: 清环境变量并跑全量单测（兼容性确认）**

Run: `Remove-Item Env:GEN_ART; npm test`
Expected: 全部通过（无 GEN_ART 时不写文件）。

- [ ] **Step 4: 让编辑器导入这批图**

在 CocosCreator 已打开本工程的情况下，「资源管理器」会观察到 `assets/resources/art/` 新文件并自动导入。若未自动刷出，右键 `assets/resources` → Refresh。确认 `library/` 出现对应 `spriteFrame` 头（不必逐一核对）。

- [ ] **Step 5: 编辑器 tsc 校验（只要求工程脚本级干净）**

Run: `node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json`
Expected: `assets/**` 下 0 错误。`tools/**`、`tests/**` 与 `node_modules` 内的既有错误（vitest 类型噪音、`tests/core/storage.test.ts` 既有 SaveData 不全）属工程外噪声，不因本任务新增即可（`@ts-nocheck` 保证本文件不被 tsc 检查）。

- [ ] **Step 6: Commit（不提交生成的 PNG，占位图应被 gitignore）**

提交前先确认 `assets/resources/art/*.png` 不进入 git：

```bash
git add tools/make-placeholder-art.test.ts
git commit -m "feat: add placeholder art generator for preview"
```

> 说明：`assets/resources/art/*.png` 属于用户手工生成的素材，若用户希望纳入 git 可自行 add；本计划约定占位图不进版本库（不改 .gitignore，由提交时手工控制）。

---

### Task 3: 数据模型加 `artKey`（Dish / DialogueLine / SkinDecor / Skin）+ 覆盖测试

**Files:**
- Modify: `assets/scripts/core/types.ts`
- Modify: `assets/scripts/core/dishes.ts`
- Modify: `assets/scripts/core/chapters.ts`
- Modify: `assets/scripts/core/skins.ts`
- Modify: `tests/core/art.test.ts`

**Interfaces:**
- Consumes: Task1 `ART_MANIFEST`
- Produces（后续任务依赖的字段，签名为准）：
  - `Dish.artKey: string`（如 `'dish-fries'`）
  - `DialogueLine.artKey: string`（旁白='icon-narrator'，其余='char-xiaoqi'|'char-tangtang'|'char-laozhou'|'char-ashen'）
  - `SkinDecor.artKey: string`（如 `'decor-classic-1'`）
  - `Skin.iconArtKey: string`（如 `'skin-classic'`）

- [ ] **Step 1: 写失败测试（数据层 artKey 完整性）**

在 `tests/core/art.test.ts` 末尾追加：

```ts
import { DISHES } from '../../assets/scripts/core/dishes';
import { CHAPTERS, DialogueLine } from '../../assets/scripts/core/chapters';
import { SKINS } from '../../assets/scripts/core/skins';

describe('数据层 artKey 覆盖', () => {
  it('每道菜 artKey 在清单中', () => {
    for (const d of DISHES) expect(entry(d.artKey)).toBeDefined();
  });
  it('每句剧情 artKey 在清单中，且旁白用 icon-narrator', () => {
    const lines: DialogueLine[] = [];
    for (const ch of CHAPTERS) {
      lines.push(...ch.intro, ...ch.outro);
    }
    expect(lines.length).toBeGreaterThan(10);
    for (const l of lines) expect(entry(l.artKey)).toBeDefined();
    expect(lines.find(l => l.who === '旁白')!.artKey).toBe('icon-narrator');
  });
  it('每套皮肤 iconArtKey 与每个装饰 artKey 在清单中', () => {
    for (const s of SKINS) {
      expect(entry(s.iconArtKey)).toBeDefined();
      for (const p of s.decor) expect(entry(p.artKey)).toBeDefined();
    }
  });
});
```

- [ ] **Step 2: 运行确认失败**

Run: `npm test`
Expected: FAIL —— `d.artKey` / `l.artKey` / `s.iconArtKey` / `p.artKey` 类型不存在。

- [ ] **Step 3: 修改数据文件**

`assets/scripts/core/types.ts` 的 `Dish` 增加 `artKey: string;`（第 11 行后）：

```ts
export interface Dish {
  id: string;
  name: string;
  price: number;       // 金币
  cookTime: number;    // 做菜所需秒数
  unlockCost: number;  // 解锁所需金币，0 = 初始解锁
  artKey: string;      // 美术 key（缺图回退 emoji）
}
```

`assets/scripts/core/dishes.ts` 每项补 `artKey`：

```ts
export const DISHES: Dish[] = [
  { id: 'fries',   name: '薯条', price: 10,  cookTime: 4,  unlockCost: 0,   artKey: 'dish-fries' },
  { id: 'burger',  name: '汉堡', price: 15,  cookTime: 6,  unlockCost: 0,   artKey: 'dish-burger' },
  { id: 'pizza',   name: '披萨', price: 30,  cookTime: 9,  unlockCost: 80,  artKey: 'dish-pizza' },
  { id: 'pasta',   name: '意面', price: 45,  cookTime: 12, unlockCost: 200, artKey: 'dish-pasta' },
  { id: 'steak',   name: '牛排', price: 70,  cookTime: 16, unlockCost: 450, artKey: 'dish-steak' },
  { id: 'dessert', name: '甜品', price: 100, cookTime: 20, unlockCost: 800, artKey: 'dish-dessert' },
];
```

`assets/scripts/core/chapters.ts` `DialogueLine` 增加 `artKey: string;`，并把**每一条**剧情补上 `artKey`（映射：旁白→`icon-narrator`，小柒→`char-xiaoqi`，糖糖→`char-tangtang`，老周→`char-laozhou`，阿婶→`char-ashen`）。例（第 30–32 行原样修改）：

```ts
    intro: [
      { who: '旁白', emoji: '📖', artKey: 'icon-narrator', text: '你叫小柒…' },
      { who: '小柒', emoji: '🙋‍♀️', artKey: 'char-xiaoqi', text: '…' },
      { who: '糖糖', emoji: '👧', artKey: 'char-tangtang', text: '…' },
    ],
```

> 共 5 章 ×（intro + outro），共 18 句，逐句按上述映射补 `artKey`。

`assets/scripts/core/skins.ts`：

```ts
export interface SkinDecor {
  emoji: string;
  artKey: string;
  x: number;
  y: number;
}

export interface Skin {
  id: string;
  name: string;
  icon: string;        // 列表里的小图标（回退用）
  iconArtKey: string;  // 列表小图标的美术 key
  cost: number;        // 0 = 默认拥有
  bg: RGB;             // 背景底色（避免 core 层依赖 cc）
  decor: SkinDecor[];
}
```

SKINS 数据补全（classic 只有 1 件装饰，其余 3 件）：

```ts
export const SKINS: Skin[] = [
  {
    id: 'classic', name: '暖柒初开', icon: '🍳', iconArtKey: 'skin-classic', cost: 0,
    bg: { r: 255, g: 248, b: 240 },
    decor: [{ emoji: '🪴', artKey: 'decor-classic-1', x: 0, y: -70 }],
  },
  {
    id: 'garden', name: '小院清风', icon: '🌿', iconArtKey: 'skin-garden', cost: 200,
    bg: { r: 238, g: 248, b: 232 },
    decor: [
      { emoji: '🪴', artKey: 'decor-garden-1', x: -260, y: -40 },
      { emoji: '🌸', artKey: 'decor-garden-2', x: 260, y: -40 },
      { emoji: '🍃', artKey: 'decor-garden-3', x: 0, y: -80 },
    ],
  },
  {
    id: 'retro', name: '复古档口', icon: '📻', iconArtKey: 'skin-retro', cost: 400,
    bg: { r: 252, g: 242, b: 228 },
    decor: [
      { emoji: '📻', artKey: 'decor-retro-1', x: 0, y: -60 },
      { emoji: '🍭', artKey: 'decor-retro-2', x: -300, y: -40 },
      { emoji: '🎞', artKey: 'decor-retro-3', x: 300, y: -40 },
    ],
  },
  {
    id: 'ocean', name: '海边小馆', icon: '🐚', iconArtKey: 'skin-ocean', cost: 600,
    bg: { r: 230, g: 244, b: 250 },
    decor: [
      { emoji: '🐚', artKey: 'decor-ocean-1', x: -260, y: -40 },
      { emoji: '⛱', artKey: 'decor-ocean-2', x: 260, y: -40 },
      { emoji: '🌊', artKey: 'decor-ocean-3', x: 0, y: -80 },
    ],
  },
  {
    id: 'festival', name: '节日暖光', icon: '🏮', iconArtKey: 'skin-festival', cost: 800,
    bg: { r: 252, g: 236, b: 242 },
    decor: [
      { emoji: '🏮', artKey: 'decor-festival-1', x: -300, y: -40 },
      { emoji: '🎏', artKey: 'decor-festival-2', x: 300, y: -40 },
      { emoji: '✨', artKey: 'decor-festival-3', x: 0, y: -90 },
    ],
  },
];
```

- [ ] **Step 4: 运行确认通过**

Run: `npm test`
Expected: 全部通过（含新增覆盖用例与既有 19 条）。

- [ ] **Step 5: 预览里人工确认剧情可连续点击播放（数据没破坏）**

用浏览器打开 `http://localhost:7456/`，点开章节「重看剧情」，确认对话逐句可点。占位图尚未接入，画面应无变化。

- [ ] **Step 6: 编辑器 tsc 校验**

Run: `node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json`
Expected: 项目脚本 0 错误。

- [ ] **Step 7: Commit**

```bash
git add assets/scripts/core/types.ts assets/scripts/core/dishes.ts assets/scripts/core/chapters.ts assets/scripts/core/skins.ts tests/core/art.test.ts
git commit -m "feat: add art keys to game data model"
```

---

### Task 4: `ui/ArtView.ts`（runtime 加载 + 渲染助手）+ Main 预载改造

**Files:**
- Create: `assets/scripts/ui/ArtView.ts`
- Modify: `assets/scripts/ui/Main.ts`

**Interfaces:**
- Consumes: Task1 `ART_MANIFEST`、`hasArt`、`markLoaded`；`./Widgets` 的 `makeNode/makeRect/roundRect/panelWithShadow/COLOR/makeLabel`
- Produces（后续任务依赖，签名为准）：
  - `class ArtService`（static）：
    - `static async preload(): Promise<void>`
    - `static hasArt(key: string): boolean`
    - `static getSpriteFrame(key: string): SpriteFrame | null`（加载成功返回共享 SpriteFrame，否则 null）
    - `static makeSprite(parent: Node, key: string, w: number, h: number, x: number, y: number, name?: string): Node | null`（缺图返回 null）
    - `static makePanel(parent: Node, key: string, w: number, h: number, x: number, y: number, name?: string): Node | null`（9-slice；缺图返回 null）
    - `static panelWithArt(name: string, parent: Node, key: string, w: number, h: number, x: number, y: number): Node`（有图→图面板+阴影；无图→`panelWithShadow` 回退）
  - `static attachIconSprite(parent: Node, key: string, x: number, y: number, size: number): Node | null`（给既有按钮/面板补图标，缺图返回 null）

> 设计文档里的 `makeIconText` 在此实现中被「`attachIconSprite` + 文本去 emoji 前缀」取代（更贴合现有 pillButton/文本布局），故未实现，避免死代码。

- [ ] **Step 1: 实现 `ArtView.ts`**

`assets/scripts/ui/ArtView.ts`（完整）：

```ts
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
```

- [ ] **Step 2: 改造 `Main.ts` 预载时序 + ready 守卫**

`assets/scripts/ui/Main.ts`：
1) imports 加 `import { ArtService } from './ArtView';`（在 `import { Sfx } ...` 之前）。
2) 加私有字段 `private ready = false;`
3) `onLoad` 改为「先预载，再建全部 UI」——把现在 onLoad 的**整个函数体**（第 50–117 行）搬进新的 `private buildGame(): void`，onLoad 改为：

```ts
  onLoad(): void {
    this.storage = new StorageService(new BrowserKVStore());
    this.data = new GameData(this.storage.load());
    void ArtService.preload().then(() => {
      if (!this.isValid || !this.node.isValid) return;
      this.buildGame();
      this.ready = true;
    });
  }

  private buildGame(): void {
    makeRect('bg', this.node, 960, 640, 0, 0, COLOR.bg);
    this.buildDecor();
    this.buildTables();
    this.kitchen = new Kitchen(
      this.node, 330, -80,
      d => cookTimeAtLevel(d.cookTime, this.data.kitchenLevel),
      kitchenSlotCount(this.data.kitchenLevel),
    );
    this.kitchen.onSlotReady = () => Sfx.cook();
    this.hud = new HudView(this.node,
      () => { this.upgrade.open(); this.refreshUpgrade(); },
      () => this.openChapters(),
      () => this.onAdButton(),
    );
    this.hud.setCombo(0, 1);
    this.menu = new MenuView(this.node,
      id => { this.cookSelected(id); },
      id => { if (this.data.unlockDish(id)) this.refreshAll(); },
    );
    this.upgrade = new UpgradeView(this.node, {
      onUpgradeTable: () => { if (this.data.upgradeTable()) this.refreshAll(); },
      onUpgradeKitchen: () => {
        if (this.data.upgradeKitchen()) {
          this.kitchen.setSlotCount(kitchenSlotCount(this.data.kitchenLevel));
          this.refreshAll();
        }
      },
      onSkins: () => this.skinView.open(this.data),
    });
    this.chapterView = new ChapterView(this.node, () => {
      const ch = CHAPTERS[this.data.chapterIndex];
      if (ch) this.dialogue.play(ch.intro, () => {});
    });
    this.dialogue = new DialogueView(this.node);
    this.adView = new AdView(this.node);
    this.skinView = new SkinView(
      this.node,
      () => this.applySkin(),
      () => { this.refreshHud(); this.saveGame(); },
    );
    this.applySkin();
    if (!this.data.introPlayed) {
      this.data.introPlayed = true;
      this.saveGame();
      const first = CHAPTERS[0];
      if (first) this.dialogue.play(first.intro, () => {});
    }
    this.orderBoard = makeNode('order-board', this.node, 920, 40, 0, 235);
    this.refreshAll();
  }
```

4) `update(dt)`（当前第 119 行）开头加守卫：

```ts
  update(dt: number): void {
    if (!this.ready) return;
    this.updateSpawn(dt);
    ...
  }
```

> `onLoad` 改为 async 预载后，首帧无 UI。本地资源加载为毫秒级，用户无感知；`ready=false` 期间 `update` 空转，避免访问未初始化成员。

- [ ] **Step 3: 编辑器 tsc 校验**

Run: `node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json`
Expected: 项目脚本 0 错误。

- [ ] **Step 4: 预览验证（画面应与改造前一致）**

用浏览器打开 `http://localhost:7456/` 并刷新。预期：
- 控制台 0 错误；出现若干 `[art] 缺少美术资源: xxx（已回退）` warn（占位图已生成，应只有少量缺项——有占位图时不应出现）。
- 游戏正常进入，渲染与改动前一致（本任务未开始消费 sprite）。

> 若预览仍显示旧行为（对话框/UI 未出现），在编辑器里对 `assets/scripts/ui/Main.ts` 右键 → Reimport，再刷新预览。

- [ ] **Step 5: 单测回归**

Run: `npm test`
Expected: 全部通过。

- [ ] **Step 6: Commit**

```bash
git add assets/scripts/ui/ArtView.ts assets/scripts/ui/Main.ts
git commit -m "feat: add runtime art loading and sprite helpers"
```

---

### Task 5: 背景大图 + 皮肤底色分层（M1 前半）

**Files:**
- Modify: `assets/scripts/ui/Main.ts`（`onLoad`/`buildGame` 内的 bg、`buildDecor`、`applySkin`）

**Interfaces:**
- Consumes: Task4 `ArtService.hasArt / makeSprite`

- [ ] **Step 1: 背景铺底（buildGame 顶层改）**

`Main.ts` 的 `buildGame()` 第一行 `makeRect('bg', ...)` 替换为：

```ts
    this.buildBackground();
    this.buildDecor();
    this.buildTables();
```

新增私有方法（`buildGame` 之后、`buildTables` 之前）：

```ts
  private buildBackground(): void {
    const art = ArtService.makeSprite(this.node, 'bg', 960, 640, 0, 0, 'bg');
    if (art) {
      art.setSiblingIndex(0);
      return;
    }
    const rect = makeRect('bg', this.node, 960, 640, 0, 0, COLOR.bg);
    rect.setSiblingIndex(0);
  }
```

> 层级约定：bg 永远 index 0；后续 skin-tint 设 index 1；装饰设 index 2；其余 UI 依次 append。

- [ ] **Step 2: 有背景图时跳过矢量装饰**

`buildDecor()`（当前第 209–221 行）整体改为：有 `bg` 美术时整段跳过（挂画/绿植已画进插图），无图时维持原矢量：

```ts
  private buildDecor(): void {
    if (ArtService.hasArt('bg')) return;
    const floor = makeNode('floor', this.node, 960, 4, 0, -60);
    const fg = floor.addComponent(Graphics);
    fg.fillColor = COLOR.decor;
    fg.rect(-480, -2, 960, 4);
    fg.fill();

    const pic = roundRect('pic', this.node, 60, 50, -420, 200, 8, COLOR.panel, COLOR.border);
    makeLabel('pic-content', pic, '🌻', 30, 0, 0);

    makeLabel('plant-l', this.node, '🪴', 44, -450, -30, COLOR.text);
    makeLabel('plant-r', this.node, '🪴', 44, 450, -30, COLOR.text);
  }
```

- [ ] **Step 3: 皮肤底色在有背景图时降为半透明、分层固定**

`applySkin()`（当前第 351–366 行）改为：

```ts
  private applySkin(): void {
    const skin = skinById(this.data.activeSkinId);
    let tint = this.node.getChildByName('skin-tint');
    if (tint) tint.destroy();
    const hasBg = ArtService.hasArt('bg');
    const alpha = hasBg ? 40 : 255;
    const bg = new Color(skin.bg.r, skin.bg.g, skin.bg.b, alpha);
    tint = makeRect('skin-tint', this.node, 960, 640, 0, 0, bg);
    tint.setSiblingIndex(1);
    for (const d of this.decorNodes) d.destroy();
    this.decorNodes = [];
    for (const p of skin.decor) {
      const art = ArtService.makeSprite(this.node, p.artKey, 88, 88, p.x, p.y, `decor-art-${p.artKey}`);
      if (art) {
        art.setSiblingIndex(2);
        this.decorNodes.push(art);
        continue;
      }
      const l = makeLabel(`decor-${p.emoji}`, this.node, p.emoji, 40, p.x, p.y, COLOR.text);
      l.node.setSiblingIndex(2);
      this.decorNodes.push(l.node);
    }
  }
```

> 说明：本任务已提前消费 P2 装饰 artKey，但因皮肤列表默认 `classic`（1 件装饰）且占位图在场，预览即可看到 88×88 色块装饰。若不想在本任务引入装饰逻辑，可把该方法里装饰部分推迟到 Task 10（此处保留完整实现，方便一次对位）。

- [ ] **Step 4: 预览验证**

刷新 `http://localhost:7456/`。预期：
- 背景显示整幅占位大图（米黄）+ 皮肤底色半透明叠层；
- 矢量挂画/绿植/地面消失；
- 桌面、顾客、厨房、HUD 全部仍在。

- [ ] **Step 5: 编辑器 tsc 校验 + 单测回归**

Run:
```powershell
node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json
npm test
```
Expected: tsc 0 错误；npm test 全绿。

- [ ] **Step 6: Commit**

```bash
git add assets/scripts/ui/Main.ts
git commit -m "feat: render restaurant background from art"
```

---

### Task 6: 四类面板接入（M1 后半）

把 8 处 `panelWithShadow(...)` 与 1 处订单牌包图换成 `panelWithArt(...)`。

**Files:**
- Modify: `assets/scripts/ui/HudView.ts`
- Modify: `assets/scripts/ui/Kitchen.ts`
- Modify: `assets/scripts/ui/MenuView.ts`
- Modify: `assets/scripts/ui/DialogueView.ts`
- Modify: `assets/scripts/ui/UpgradeView.ts`
- Modify: `assets/scripts/ui/SkinView.ts`
- Modify: `assets/scripts/ui/AdView.ts`
- Modify: `assets/scripts/ui/ChapterView.ts`
- Modify: `assets/scripts/ui/Main.ts`（订单牌）

**Interfaces:**
- Consumes: Task4 `ArtService.panelWithArt`

注意：面板 art 只在占位图/真实图在场时启用，缺图自动回退原 `panelWithShadow` 表现。

- [ ] **Step 1: 各文件 import 与首个改动（HudView 示范）**

`assets/scripts/ui/HudView.ts`：imports 加 `import { ArtService } from './ArtView';`，把 `panelWithShadow('hud-bg', parent, 920, 58, 0, 293, 16, COLOR.panel, COLOR.border);` 替换为：

```ts
    ArtService.panelWithArt('hud-bg', parent, 'panel-hud', 920, 58, 0, 293);
```

- [ ] **Step 2: Kitchen 面板**

`assets/scripts/ui/Kitchen.ts`：imports 加 `ArtService`；构造函数里 `panelWithShadow('kitchen-panel', parent, 300, 200, x, y, 16, COLOR.panel, COLOR.border);` 替换为：

```ts
    ArtService.panelWithArt('kitchen-panel', parent, 'panel-popup', 300, 200, x, y);
```

- [ ] **Step 3: Menu 面板**

`assets/scripts/ui/MenuView.ts`：imports 加 `ArtService`；构造函数里 `panelWithShadow('menu-panel', parent, 920, 110, 0, -265, 16, COLOR.panel, COLOR.border);` 替换为：

```ts
    this.root = ArtService.panelWithArt('menu-panel', parent, 'panel-menu', 920, 110, 0, -265);
```
> 设计文档的 4 张面板之外新增 `panel-menu`：底部菜单条 920×110 若复用 `panel-popup`（insets 100 源像素）会在高度方向塌陷，故单独一张水平条形面板图（insets 160/160/16/16）。

- [ ] **Step 4: Dialogue 面板**

`assets/scripts/ui/DialogueView.ts`：imports 加 `ArtService`；构造函数里 `panelWithShadow('dlg-panel', parent, 760, 200, 0, -200, 20, COLOR.panel, COLOR.border);` 替换为：

```ts
    this.panel = ArtService.panelWithArt('dlg-panel', parent, 'panel-dialogue', 760, 200, 0, -200);
```

- [ ] **Step 5: Upgrade / Skin / Ad / Chapter 面板**

`assets/scripts/ui/UpgradeView.ts`（imports 加 `ArtService`）：
```ts
    this.panel = ArtService.panelWithArt('upgrade-panel', parent, 'panel-popup', 520, 320, 0, 0);
```

`assets/scripts/ui/SkinView.ts`（imports 加 `ArtService`）：
```ts
    this.panel = ArtService.panelWithArt('skin-panel', parent, 'panel-popup', 560, 420, 0, 0);
```

`assets/scripts/ui/AdView.ts`（imports 加 `ArtService`）：
```ts
    this.panel = ArtService.panelWithArt('ad-panel', parent, 'panel-popup', 480, 280, 0, 0);
```

`assets/scripts/ui/ChapterView.ts`（imports 加 `ArtService`）：
```ts
    this.panel = ArtService.panelWithArt('ch-panel', parent, 'panel-popup', 560, 400, 0, 0);
```

- [ ] **Step 6: 订单牌包图（Main.ts）**

`Main.ts` 里 `this.orderBoard = makeNode('order-board', this.node, 920, 40, 0, 235);`（buildGame 内）替换为：

```ts
    this.orderBoard = ArtService.panelWithArt('order-board', this.node, 'panel-orderboard', 920, 40, 0, 235);
```

> 说明：原代码订单牌为横向长条（920×40），故 `panel-orderboard` 出图为横向 920×46 条形，非设计文档里误标的"320×460 竖卡"。既有实现与本文档为准。

> 注意：`refreshOrderBoard()` 每次 `this.orderBoard.removeAllChildren()` 会连底部面板 Sprite 一起清掉。本任务顺带把它改为只清「内容层」：在 buildGame 的 `orderBoard` 创建后追加一行 `this.orderList = makeNode('order-list', this.orderBoard, 920, 40, 0, 0);`，`refreshOrderBoard` 里把 `this.orderBoard.removeAllChildren()` 换成 `this.orderList.removeAllChildren()`，并把标题与泡片的父节点从 `orderBoard` 换成 `orderList`。声明字段 `private orderList!: Node;`。

- [ ] **Step 7: 预览验证**

刷新 `http://localhost:7456/`。预期：
- 顶栏 HUD、厨房、底部菜单、订单牌、对话弹窗、升级/皮肤/广告/章节弹窗均显示对应占位面板色块（`panel-popup` 多个复用同色块），9-slice 拉伸正常（边角不撕裂）；
- 缺图回退无变化（本任务全由占位图驱动）。

- [ ] **Step 8: 编辑器 tsc 校验 + 单测回归**

Run:
```powershell
node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json
npm test
```
Expected: tsc 0 错误；npm test 全绿。

- [ ] **Step 9: Commit**

```bash
git add assets/scripts/ui/HudView.ts assets/scripts/ui/Kitchen.ts assets/scripts/ui/MenuView.ts assets/scripts/ui/DialogueView.ts assets/scripts/ui/UpgradeView.ts assets/scripts/ui/SkinView.ts assets/scripts/ui/AdView.ts assets/scripts/ui/ChapterView.ts assets/scripts/ui/Main.ts
git commit -m "feat: render UI panels from art"
```

---

### Task 7: 顾客 + 菜品三处复用（M2 前半）

**Files:**
- Modify: `assets/scripts/ui/CustomerView.ts`
- Modify: `assets/scripts/ui/Kitchen.ts`
- Modify: `assets/scripts/ui/Main.ts`（refreshOrderBoard 加菜品缩略图）

**Interfaces:**
- Consumes: Task1 `CUSTOMER_ART`；Task4 `ArtService.makeSprite / hasArt`；Task3 `dish.artKey`

- [ ] **Step 1: 顾客形象替换 + 轻浮动**

`assets/scripts/ui/CustomerView.ts`：

imports 加：
```ts
import { CUSTOMER_ART } from '../core/art';
import { ArtService } from './ArtView';
```
imports 里 `tween` 保留。

构造器改造（当前 19–50 行）：随机选一个顾客形象；有图时用 Sprite 代替「roundRect 身体 + 头部 + 脸」，并把 Sprite 放进一个 `float` 子节点做 ±4px 浮动（不动 this.node，避免与 LEAVING 平移冲突）：

```ts
  constructor(
    parent: Node, x: number, y: number,
    readonly dish: Dish,
    readonly tableIndex: number,
    private onLeave: (c: CustomerView) => void,
  ) {
    this.price = dish.price;
    const artKey = CUSTOMER_ART[Math.floor(Math.random() * CUSTOMER_ART.length)];
    const hasArt = ArtService.hasArt(artKey);

    this.node = hasArt
      ? makeNode('customer', parent, 60, 80, x, y)
      : roundRect('customer', parent, 60, 80, x, y, 20, COLOR.panel, COLOR.border);

    if (hasArt) {
      const float = makeNode('float', this.node, 60, 80, 0, 0);
      const sp = ArtService.makeSprite(float, artKey, 64, 88, 0, 0, 'cust-art');
      if (sp) {
        this.node.setPosition(x, y);
        this.floatNode = float;
        this.floatTween = tween(float)
          .repeatForever(
            tween(float).to(1.2, { position: new Vec3(0, 4, 0) })
              .to(1.2, { position: new Vec3(0, -4, 0) }),
          ).start();
      }
    } else {
      const head = roundRect('head', this.node, 30, 30, 0, 22, 10, COLOR.primary, new Color(235, 120, 80, 255));
      head;
      makeLabel('face', this.node, '🙂', 18, 0, 4, COLOR.white);
    }

    // 气泡（圆角 + 小三角），显示所点菜名（有菜图加缩略图）
    const hasDishArt = ArtService.hasArt(dish.artKey);
    const bw = hasDishArt ? 104 : 70;
    const bubble = makeNode('bubble', this.node, bw, 30, 55, 30);
    const b = bubble.addComponent(Graphics);
    b.fillColor = COLOR.white;
    b.roundRect(-bw / 2, -15, bw, 30, 10);
    b.fill();
    b.moveTo(-18, -15);
    b.lineTo(-26, -25);
    b.lineTo(-10, -15);
    b.close();
    b.fill();
    if (hasDishArt) {
      ArtService.makeSprite(bubble, dish.artKey, 26, 26, -bw / 2 + 16, 0, 'bubble-dish');
      makeLabel('want', bubble, `${dish.name}`, 13, -bw / 2 + 38, 0, COLOR.text);
    } else {
      makeLabel('want', bubble, dish.name, 14, 0, 0, COLOR.text);
    }

    // 满意度条：背景 + 动态前景
    this.satBg = makeRect('sat-bg', this.node, 60, 6, 0, -48, COLOR.border);
    const fg = makeNode('sat', this.node, 60, 6, 0, -48);
    this.satBar = fg.addComponent(Graphics);
  }
```

类里新增字段与离开停止浮动（在 `update` 的 `LEAVING` 分支或在 `markGone` 前停）：

```ts
  private floatNode: Node | null = null;
  private floatTween: Tween<Node> | null = null;
```

`update()` 里切到 `LEAVING` 的两处（ORDERING 超时、EATING 结束）后追加停止浮动（共两处 `this._state = CustomerState.LEAVING;` 后各自加一行，或集中到状态机出口）。在 `update()` 内 `LEAVING` 状态首次进入时：

```ts
      } else if (this._state === CustomerState.LEAVING) {
        if (this.floatTween) {
          this.floatTween.stop();
          this.floatTween = null;
          if (this.floatNode) this.floatNode.setPosition(0, 0);
        }
        this.node.setPosition(this.node.position.x - 200 * dt, this.node.position.y);
        // 走出屏幕左侧后通知 Main 收钱并移除
        if (this.node.position.x < -500) {
          this.onLeave(this);
        }
      }
```

`markGone()` 兜底：若浮动仍存在再 stop（防泄漏）。

类型说明：顶部 cc import 需为 `import { Color, Graphics, Label, Node, tween, Tween, UITransform, Vec3 } from 'cc';`（新增 `Tween`），字段类型 `private floatTween: Tween<Node> | null = null;`。

- [ ] **Step 2: 厨房卡槽菜图**

`assets/scripts/ui/Kitchen.ts`：imports 加 `import { ArtService } from './ArtView';`。区别三个改动点：

1) `interface Slot` 增加字段：`dishArt: Node | null;`（当前 5–15 行的接口追加一行）。

2) `setSlotCount()` 创建 slot 的 push 对象补 `dishArt: null`（当前 52 行 `this.slots.push({ ... })` 内，`name,` 之后追加 `dishArt: null,`）。

3) `render(s)` 顶部维护菜图子节点（有图且未建 → 创建；无图且已建 → 销毁）：

```ts
    const hasDishArt = s.dish !== null && ArtService.hasArt(s.dish.artKey);
    if (!hasDishArt && s.dishArt) { s.dishArt.destroy(); s.dishArt = null; }
    if (hasDishArt && !s.dishArt) {
      s.dishArt = ArtService.makeSprite(s.root, s.dish!.artKey, 34, 34, 0, 10, 'dish-art');
    }
```

> `s.dish!` 断言安全：`hasDishArt` 为 true 时才走到该行，已保证非空。

顺带把有菜图时的 `center` 计数文本移到环上方（`s.center.node.setPosition(0, 30)`）、无菜图时恢复 `(0, 10)`（在 `render` 末尾按 `s.dish !== null && hasDishArt` 分支设置）。菜式名 `s.name` 保持在 `(0, -32)` 不变。

- [ ] **Step 3: 订单牌菜品缩略图 + 份数**

`assets/scripts/ui/Main.ts` `refreshOrderBoard()`（当前 315–326 行）换成按菜品分组、带缩略图与份数：

```ts
  private refreshOrderBoard(): void {
    const pending = this.customers.filter(c => c.state === CustomerState.ORDERING);
    const sig = pending.map(c => c.dish.id).join(',');
    if (sig === this.orderSig) return;
    this.orderSig = sig;
    this.orderList.removeAllChildren();
    makeLabel('ob-title', this.orderList, '📋 待办订单', 14, -430, 0, COLOR.subtext);
    // 按菜品合并，显示缩略图 + 菜名 + 份数
    const counts: { dish: Dish; n: number }[] = [];
    for (const c of pending) {
      const it = counts.find(x => x.dish.id === c.dish.id);
      if (it) it.n++;
      else counts.push({ dish: c.dish, n: 1 });
    }
    counts.slice(0, 6).forEach((it, i) => {
      const t = roundRect(`ob-${i}`, this.orderList, 110, 30, -330 + i * 116, 0, 8, COLOR.panel, COLOR.border);
      if (ArtService.hasArt(it.dish.artKey)) {
        ArtService.makeSprite(t, it.dish.artKey, 20, 20, -40, 0, 'ob-dish');
        makeLabel(`obt-${i}`, t, `${it.dish.name}${it.n > 1 ? ` ×${it.n}` : ''}`, 13, -18, 0, COLOR.text);
      } else {
        makeLabel(`obt-${i}`, t, it.dish.name, 13, 0, 0, COLOR.text);
      }
    });
  }
```

> 字段 `private orderList!: Node;` 已在 Task 6 Step 6 声明过，本任务**不要重复声明**。

- [ ] **Step 4: 预览验证**

刷新 `http://localhost:7456/`：
- 顾客出现为对应的 6 色块形象之一（随机），带轻微浮动；点餐泡有菜缩略图 + 菜名；
- 厨房槽烹煮时显示菜块 + 环 + 倒计时；订单牌块带菜图与份数；
- 全部回退逻辑：临时删除某张占位图（如 `assets/resources/art/cust-1.png`，编辑器 Reimport 后刷新）应自动回到矢量形态。

- [ ] **Step 5: 编辑器 tsc 校验 + 单测回归**

Run:
```powershell
node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json
npm test
```
Expected: tsc 0 错误；npm test 全绿。

- [ ] **Step 6: Commit**

```bash
git add assets/scripts/ui/CustomerView.ts assets/scripts/ui/Kitchen.ts assets/scripts/ui/Main.ts
git commit -m "feat: render customers and dishes from art"
```

---

### Task 8: 对话头像（M2 后半）

**Files:**
- Modify: `assets/scripts/ui/DialogueView.ts`

**Interfaces:**
- Consumes: Task3 `DialogueLine.artKey`；Task4 `ArtService.makeSprite`

- [ ] **Step 1: 头像由 Label 改为「Sprite or Label」**

`assets/scripts/ui/DialogueView.ts`：imports 加 `import { ArtService } from './ArtView';`。

构造器里把 `this.avatar = makeLabel('dlg-avatar', this.panel, '🙂', 54, -300, 0, COLOR.text);` 保留为兜底 label，另存节点引用，并新增 `private avatarFrameRef: Node | null = null;`。改为：

```ts
    this.avatar = makeLabel('dlg-avatar', this.panel, '🙂', 54, -300, 0, COLOR.text);
```

`render()`（当前 39–44 行）改为：

```ts
  private render(): void {
    const l = this.lines[this.idx];
    this.nameL.string = l.who;
    this.textL.string = l.text;
    if (this.avatarFrameRef) {
      this.avatarFrameRef.destroy();
      this.avatarFrameRef = null;
    }
    const head = ArtService.makeSprite(this.panel, l.artKey, 120, 120, -300, 0, 'dlg-avatar-art');
    if (head) {
      this.avatar.node.active = false;
      this.avatarFrameRef = head;
    } else {
      this.avatar.node.active = true;
      this.avatar.string = l.emoji;
    }
  }
```

- [ ] **Step 2: 预览验证**

刷新 `http://localhost:7456/`，点「重看剧情」：
- 左侧头像按发言人显示不同占位色块（旁白=书本色块）；逐句切换正确；
- 缺图时回退原 emoji 头像。

- [ ] **Step 3: 编辑器 tsc 校验 + 单测回归**

Run:
```powershell
node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json
npm test
```
Expected: tsc 0 错误；npm test 全绿。

- [ ] **Step 4: Commit**

```bash
git add assets/scripts/ui/DialogueView.ts
git commit -m "feat: render dialogue avatars from art"
```

---

### Task 9: P1 小图标（M3）

**Files:**
- Modify: `assets/scripts/ui/HudView.ts`（金币/能量/在店/章节图标）
- Modify: `assets/scripts/ui/MenuView.ts`（锁定）
- Modify: `assets/scripts/ui/UpgradeView.ts`（凳子/灶台/装修）
- Modify: `assets/scripts/ui/AdView.ts`（广告电视）
- Modify: `assets/scripts/ui/ChapterView.ts`（标题书/重看）
- Modify: `assets/scripts/ui/SkinView.ts`（装修标题）

**Interfaces:**
- Consumes: Task4 `ArtService.attachIconSprite`

规则：有图 → 加 Sprite 图标且文本去除对应 emoji；缺图 → 维持原 emoji 文本。动态文本统一通过「格式化函数」决定是否带头 emoji。

- [ ] **Step 1: HudView**

`assets/scripts/ui/HudView.ts`：imports 加 `import { ArtService } from './ArtView';`，字段区新增 `private energyHasIcon = false; private custHasIcon = false;`。

1) 硬币徽章：把 `makeLabel('coin-icon', parent, '🪙', 20, -460, 293, COLOR.accent);` 改为：

```ts
    const coinIcon = ArtService.attachIconSprite(parent, 'icon-coin', -460, 293, 26);
    if (!coinIcon) makeLabel('coin-icon', parent, '🪙', 20, -460, 293, COLOR.accent);
```

2) 体力按钮图标：`pillButton('energy-btn', parent, 120, 34, -270, 293, COLOR.primary, '⚡ 12/12', adCb)` 的文本参数改为 `'12/12'`，并加：

```ts
    const energyIcon = ArtService.attachIconSprite(this.energyBtn!, 'icon-energy', -38, 0, 26);
    this.energyHasIcon = energyIcon !== null;
```
（`this.energyBtn` 已赋值，直接引用。）

3) `setEnergy`：前缀 emoji 接图标显隐决定：

```ts
  setEnergy(cur: number, max: number): void {
    const base = cur <= 0 ? '看广告恢复' : `${cur}/${max}`;
    this.energyLabel.string = this.energyHasIcon ? base : `⚡ ${base}`;
  }
```

4) 在店人数：`this.custLabel = makeLabel('customers', parent, '🧑 在店 0', 18, -100, 293, COLOR.text);` 改为：

```ts
    const custIcon = ArtService.attachIconSprite(parent, 'icon-customer', -128, 293, 24);
    this.custHasIcon = custIcon !== null;
    this.custLabel = makeLabel('customers', parent, '在店 0', 18, -112, 293, COLOR.text);
```
（有图标时文本左移；`refresh` 里 `this.custLabel.string = \`${this.custHasIcon ? '' : '🧑 '}在店 ${d.customers}\`;`）

5) 章节按钮：`pillButton('chapter-btn', parent, 100, 34, 335, 293, COLOR.accent, '📖 第1章', chapterCb)` 文本参数改 `'第1章'`，加：

```ts
    ArtService.attachIconSprite(this.chapterBtn, 'icon-chapter', -30, 0, 24);
```
4b) `setChapter`（当前第 51–54 行）也会写 `📖 第X章` 前缀，必须同步去掉（否则每次 refreshHud 又把 emoji 前缀加回来、盖住图标）：

```ts
  setChapter(index: number, total: number, stars: number): void {
    const label = this.chapterBtn.getComponentInChildren(Label)!;
    label.string = `${ArtService.hasArt('icon-chapter') ? '' : '📖 '}第${index + 1}/${total}章 ⭐${stars}`;
  }
```
（`this.energyHasIcon`/`this.custHasIcon` 字段已在 Step 1 开头声明。）

- [ ] **Step 2: MenuView（锁定图标）**

`menu-view.ts`（`MenuView.ts`）锁定卡片：把 `makeLabel('name', card, \`🔒 ${d.name}\`, 14, 0, 14, COLOR.subtext);` 改为：

```ts
      const lockIcon = ArtService.attachIconSprite(card, 'icon-lock', -46, -4, 18);
      makeLabel('name', card, `${lockIcon ? '' : '🔒 '}${d.name}`, 14, lockIcon ? 8 : 0, 14, COLOR.subtext);
```
imports 加 `ArtService`。

- [ ] **Step 3: UpgradeView（凳子/灶台/装修入口）**

`assets/scripts/ui/UpgradeView.ts`（imports 加 `ArtService`）：

`makeLabel('tb-icon', this.tableBtn, '🪑', 28, -80, 0, COLOR.text);` 改为：
```ts
    if (!ArtService.attachIconSprite(this.tableBtn, 'icon-chair', -80, 0, 30))
      makeLabel('tb-icon', this.tableBtn, '🪑', 28, -80, 0, COLOR.text);
```

`makeLabel('kb-icon', this.kitchenBtn, '⚡', 28, -80, 0, COLOR.text);` 改为：
```ts
    if (!ArtService.attachIconSprite(this.kitchenBtn, 'icon-kitchen', -80, 0, 30))
      makeLabel('kb-icon', this.kitchenBtn, '⚡', 28, -80, 0, COLOR.text);
```

`pillButton('skin-entry', this.panel, 440, 40, 0, -120, COLOR.accent, '🎨 装修小店', () => this.cb.onSkins());` 改为：
```ts
    const entry = pillButton('skin-entry', this.panel, 440, 40, 0, -120, COLOR.accent,
      '🎨 装修小店', () => this.cb.onSkins());
    const brushIcon = ArtService.attachIconSprite(entry, 'icon-brush', -120, 0, 26);
    if (brushIcon) {
      const lbl = entry.getComponentInChildren(Label);
      if (lbl) lbl.string = '装修小店';
    }
```

> `getComponentInChildren(Label)` 类型为 `Label | null`，`lbl` 在按钮文本存在时非空；`if (lbl)` 仅为类型收窄，不空不执行。

- [ ] **Step 4: AdView（电视图标）**

`assets/scripts/ui/AdView.ts`（imports 加 `ArtService`）：`makeLabel('ad-icon', this.panel, '📺', 60, 0, 70, COLOR.text);` 改为：

```ts
    if (!ArtService.attachIconSprite(this.panel, 'icon-ad', 0, 70, 64))
      makeLabel('ad-icon', this.panel, '📺', 60, 0, 70, COLOR.text);
```

- [ ] **Step 5: ChapterView（标题/重看）**

`assets/scripts/ui/ChapterView.ts`（imports 加 `ArtService`）：

标题 `makeLabel('ch-title', this.panel, '📖 经营目标', 24, 0, 160, COLOR.text);` 改为：
```ts
    const chTitleIcon = ArtService.attachIconSprite(this.panel, 'icon-chapter', -86, 160, 28);
    makeLabel('ch-title', this.panel, `${chTitleIcon ? '' : '📖 '}经营目标`, 24, chTitleIcon ? -12 : 0, 160, COLOR.text);
```

重看按钮 `pillButton('ch-replay', this.panel, 200, 40, 0, -160, COLOR.primary, '重看剧情 ▶', () => this.onReplayIntro());` 改为：
```ts
    const replay = pillButton('ch-replay', this.panel, 200, 40, 0, -160, COLOR.primary,
      '重看剧情 ▶', () => this.onReplayIntro());
    if (ArtService.attachIconSprite(replay, 'icon-replay', -62, 0, 22)) {
      const lbl = replay.getComponentInChildren(Label);
      if (lbl) lbl.string = '重看剧情';
    }
```

- [ ] **Step 6: SkinView（装修标题）**

`assets/scripts/ui/SkinView.ts`（imports 加 `ArtService`）：`makeLabel('skin-title', this.panel, '🎨 装修小店', 24, 0, 175, COLOR.text);` 改为：

```ts
    const skinTitleIcon = ArtService.attachIconSprite(this.panel, 'icon-brush', -86, 175, 28);
    makeLabel('skin-title', this.panel, `${skinTitleIcon ? '' : '🎨 '}装修小店`, 24, skinTitleIcon ? -12 : 0, 175, COLOR.text);
```

- [ ] **Step 7: 预览验证**

刷新 `http://localhost:7456/`：
- 顶栏金币、能量、在店、章节、升级面板的凳子/灶台、装修入口、广告电视、章节标题/重看、皮肤标题、菜单锁定卡均出现图标占位块；对应文本不带 emoji 前缀；
- 图标全屏不爆炸（sizeMode CUSTOM 固定 24~30px）。

- [ ] **Step 8: 编辑器 tsc 校验 + 单测回归**

Run:
```powershell
node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json
npm test
```
Expected: tsc 0 错误；npm test 全绿。

- [ ] **Step 9: Commit**

```bash
git add assets/scripts/ui/HudView.ts assets/scripts/ui/MenuView.ts assets/scripts/ui/UpgradeView.ts assets/scripts/ui/AdView.ts assets/scripts/ui/ChapterView.ts assets/scripts/ui/SkinView.ts
git commit -m "feat: render UI icons from art"
```

---

### Task 10: 皮肤装饰 + 图标（M4 收尾）

**Files:**
- Modify: `assets/scripts/ui/SkinView.ts`
- Modify: `assets/scripts/ui/Main.ts`（如 Task5 已实现则跳过此行）

**Interfaces:**
- Consumes: Task3 `Skin.iconArtKey / SkinDecor.artKey`；Task4 `ArtService.makeSprite / attachIconSprite`

- [ ] **Step 1: 皮肤列表行图标**

`assets/scripts/ui/SkinView.ts`（`render` 内，当前 45 行）把 `makeLabel(\`skin-ic-${i}\`, row, s.icon, 28, -200, 0, COLOR.text);` 改为：

```ts
      const skinIcon = ArtService.attachIconSprite(row, s.iconArtKey, -200, 0, 40);
      if (!skinIcon) makeLabel(`skin-ic-${i}`, row, s.icon, 28, -200, 0, COLOR.text);
```

- [ ] **Step 2: 确认装饰已接入**

Task 5 已把 `applySkin()` 的装饰改为 `ArtService.makeSprite(..., p.artKey, 88, 88, p.x, p.y, ...)`。若当时未实现（回看 Task5 Step3），补齐即可。此处不重复。

- [ ] **Step 3: 预览验证**

刷新 `http://localhost:7456/`，打开「升级 → 装修小店」：
- 5 行皮肤各显示 40×40 图标占位块，装备/价格状态不变；
- 切到 garden/ocean 等皮肤，场景中出现 88×88 装饰色块（classic 只有 1 件）；
- 皮肤背景色叠加在背景大图上（alpha 40）可辨。

- [ ] **Step 4: 编辑器 tsc 校验 + 单测回归**

Run:
```powershell
node "D:\CocoEditor\Creator\3.8.8\resources\resources\3d\engine\node_modules\typescript\bin\tsc" --noEmit -p tsconfig.json
npm test
```
Expected: tsc 0 错误；npm test 全绿。

- [ ] **Step 5: Commit**

```bash
git add assets/scripts/ui/SkinView.ts
git commit -m "feat: render skin decor and icons from art"
```

---

## 收尾与验收清单

- [ ] 全量单测绿：`npm test`
- [ ] 编辑器 tsc 0 错（忽略 cc.d.ts 噪音）
- [ ] 预览 `http://localhost:7456/` 无 console error
- [ ] 缺图回退验证：删一张占位图（如 `cust-2.png`）、编辑器 Reimport → 该处回到 emoji/矢量；游戏不崩
- [ ] 真实美术交互：把用户生成的 PNG 按 key 放置并用生成器同名规格（2×）检查尺寸，`git add` 覆盖占位图
- [ ] 交付 `ART-MANIFEST.md`（从 Task1 清单 + 设计文档第十一节提示词模板导出），供用户打印出图
- [ ] 提交说明：每个 commit 保持简短高层，不涉及内部实现名

## 风险与注意

- **对设计文档 P1 图标的裁剪**：设计稿列了 13 个 P1 图标（含 icon-star/play/money），但它们在现有界面上无对应消费点（星星/播放/钱袋已由其它 emoji 承担或文本内联）。本计划清单只保留 10 个实际被攻克的图标，避免让用户空绘、占位图白白占用包体；若后续界面需要再补 key 即可。
- **9-slice insets 运行时设置**：`sf.insetLeft/Right/Top/Bottom` 在 CC 3.8 上可直接赋值（读自 SpriteFrame 导入元数据）。若个别面板边角被拉伸（预览可见），备选：在该 PNG 导入后在资源面板配置「9-slice 边框」，并把 `PANEL_INSETS` 内对应值删除（避免与导入值再叠加）。Task6 验证时优先检查 hud 与 popup 边角。
- **占位图 = 开发期替身**：真实图命名、尺寸规则与 placeholder 完全一致（`<key>.png`、2×显示尺寸），直接覆盖即替换，无需改代码。
- **Reimport 触发器**：本计划所有脚本改动后若预览仍跑旧代码，请对改动 .ts（及其 import 链）右键 → Reimport。chunk 目录 `temp/programming/packer-driver/targets/preview/chunks/` 内文件 mtime 是判断是否重编译的依据。
- **面板叠放顺序**：背景(0) → skin-tint(1) → 装饰(2) → 其余 UI；弹窗面板与 overlay 由各 View 自建，整屏 overlay 会盖住背景面板，符合弹窗层级预期。
- **面板显示尺寸以实际代码为准**：设计文档尺寸表（如 `panel-dialogue 760×260`）与现有实现（760×200）不一致时，按实际代码与本文档清单为准（清单里 `panel-dialogue 760×200`）。出图统一 = 显示尺寸 × 2。
- **顾客浮动 Tween**：`Tween<Node>` 类型 + `stop()` 后若顾客马上被 destroy，`markGone()` 里再次 stop 防泄漏；`floatNode` 复位到 (0,0)。
- **`resources` bundle**：仅在 `assets/resources/` 下有资源时预览才打包该 bundle；占位图（Task2）落库即满足条件。