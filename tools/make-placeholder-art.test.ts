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