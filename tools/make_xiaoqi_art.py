# -*- coding: utf-8 -*-
"""生成小柒三张表情帧程序占位图（char-xiaoqi-idle/say/happy.png，300×300，透明底）。

画风沿用 tools/make_merge_art.py 的占位风格：暖色水彩色板 + 软边明暗 + 暖棕描边 +
纸纹颗粒，与 assets/resources/art 下已有的水彩图协调。
注意：这是程序占位图，正式水彩素材可按 docs/ai-art-prompts.md 重出三张表情后
同名覆盖 assets/resources/art/char-xiaoqi-<exp>.png 即可，代码无需改动。
"""
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

S = 300          # 输出尺寸
SS = 2           # 超采样倍数
C = S * SS       # 画布尺寸
OUTLINE = (120, 74, 46)  # 暖棕描边
rng = np.random.default_rng(11)

# 色彩板
SKIN = ((246, 214, 186), (216, 174, 140), (252, 231, 209))     # base/shade/hi
HAIR = ((104, 66, 42), (74, 44, 27), (138, 94, 62))            # 暖棕发色
HAIR_DARK = ((84, 54, 36), (58, 36, 22), (112, 76, 52))        # 侧发/发髻
EYE = ((79, 52, 36), (58, 36, 24), (108, 76, 56))
BROW = ((120, 74, 46), (96, 58, 34), (146, 96, 62))
MOUTH = ((196, 96, 84), (164, 72, 62), (224, 128, 112))        # 嘴唇/说话
MOUTH_IN = ((150, 74, 66), (124, 58, 50), (178, 100, 90))      # 张嘴内里
BLUSH = ((242, 168, 150), (230, 142, 122), (250, 196, 180))
TONGUE = ((228, 140, 128), (206, 112, 100), (240, 168, 156))


def shift_mask(m: np.ndarray, dy: int, dx: int = 0) -> np.ndarray:
    out = np.zeros_like(m)
    ys = slice(max(dy, 0), m.shape[0] + min(dy, 0))
    yd = slice(max(-dy, 0), m.shape[0] + min(-dy, 0))
    xs = slice(max(dx, 0), m.shape[1] + min(dx, 0))
    xd = slice(max(-dx, 0), m.shape[1] + min(-dx, 0))
    out[ys, xs] = m[yd, xd]
    return out


def render_part(draw_fn, base, shade, hi, rotate=0.0, outline=OUTLINE, outline_a=150):
    m = Image.new('L', (C, C), 0)
    draw_fn(ImageDraw.Draw(m))
    a = np.array(m) > 0

    rgb = np.zeros((C, C, 3), np.float32)
    rgb[:] = base
    band = a & ~shift_mask(a, 14 * SS)
    band = ndimage.gaussian_filter(band.astype(np.float32), 8 * SS // 2)
    rgb = rgb * (1 - band[..., None] * 0.45) + np.array(shade, np.float32) * (band[..., None] * 0.45)
    band = a & ~shift_mask(a, -14 * SS)
    band = ndimage.gaussian_filter(band.astype(np.float32), 8 * SS // 2)
    rgb = rgb * (1 - band[..., None] * 0.4) + np.array(hi, np.float32) * (band[..., None] * 0.4)
    ring = a.astype(np.uint8) * 255 - ndimage.minimum_filter((a * 255).astype(np.uint8), 5 * SS)
    ring = ndimage.gaussian_filter(ring.astype(np.float32), 1.5)
    rgb = rgb * (1 - (ring / 255)[..., None]) + np.array(outline, np.float32) * (ring / 255)[..., None] * (outline_a / 255)

    alpha = ndimage.gaussian_filter((a * 255).astype(np.float32), 1.2)
    layer = np.dstack([rgb.clip(0, 255), alpha.clip(0, 255)]).astype(np.uint8)
    img = Image.fromarray(layer, 'RGBA')
    if rotate:
        img = img.rotate(rotate, expand=True, resample=Image.BICUBIC)
    return img


def grain(canvas: Image.Image) -> Image.Image:
    a = np.array(canvas)
    mask = a[..., 3] > 0
    noise = rng.normal(0, 7, (C, C, 1)).repeat(3, axis=2)
    a[..., :3] = np.where(mask[..., None], a[..., :3] + noise, a[..., :3])
    return Image.fromarray(a.clip(0, 255), 'RGBA')


def finish(canvas: Image.Image, path: str) -> None:
    img = canvas.resize((S, S), Image.LANCZOS)
    q = img.quantize(colors=256, method=Image.Quantize.FASTOCTREE,
                     dither=Image.Dither.FLOYDSTEINBERG)
    q.save(path, optimize=True)
    print('wrote', path)


def parts_canvas(parts):
    cv = Image.new('RGBA', (C, C), (0, 0, 0, 0))
    for p in parts:
        cv.alpha_composite(p)
    return grain(cv)


# ---- 基础形状（坐标基于 600 画布，中心 300）----

def ellipse(x0, y0, x1, y1):
    return lambda d: d.ellipse([x0, y0, x1, y1], fill=255)


def rrect(x0, y0, x1, y1, r):
    return lambda d: d.rounded_rectangle([x0, y0, x1, y1], radius=r * SS, fill=255)


def poly(pts):
    return lambda d: d.polygon(pts, fill=255)


def union(*fns):
    def go(d):
        for f in fns:
            f(d)
    return go


def top_half(cx, cy, rx, ry):
    """上半圆（向上拱的弧），用于 happy 闭眼。PIL 中 180..360 居中偏上。"""
    def go(d):
        d.pieslice([cx - rx, cy - ry, cx + rx, cy + ry],
                   180, 360, fill=255)
    return go


def bottom_half(cx, cy, rx, ry):
    """下半圆（向上弯的弧 = 微笑碗）。PIL 中 0..180 居中偏下。"""
    def go(d):
        d.pieslice([cx - rx, cy - ry, cx + rx, cy + ry],
                   0, 180, fill=255)
    return go


def neck():
    neck = rrect(246, 448, 354, 520, 26)
    return render_part(neck, *SKIN)


def head():
    face = ellipse(150, 150, 450, 458)
    return render_part(face, *SKIN)


def hair():
    # 顶部发冠：在眼线（y=282）之上，避免遮住眼睛
    cap = rrect(168, 76, 432, 250, 62)
    locks = union(rrect(150, 246, 182, 430, 16), rrect(418, 246, 450, 430, 16))
    bun = ellipse(262, 38, 338, 106)
    return [
        render_part(union(bun), *HAIR_DARK),
        render_part(union(cap, locks), *HAIR),
    ]


def eyes_open():
    """通常开眼：圆眼 + 高光。"""
    l = union(ellipse(212, 282, 246, 316), ellipse(218, 286, 238, 302))
    r = union(ellipse(354, 282, 388, 316), ellipse(360, 286, 380, 302))
    hl_l = union(ellipse(222, 288, 232, 298))
    hl_r = union(ellipse(364, 288, 374, 298))
    return [
        render_part(l, *EYE),
        render_part(r, *EYE),
        render_part(hl_l, *((255, 252, 248), (240, 234, 226), (255, 255, 255))),
        render_part(hl_r, *((255, 252, 248), (240, 234, 226), (255, 255, 255))),
    ]


def eyes_happy():
    """happy 闭眼：向上拱的弧线。"""
    return [
        render_part(top_half(230, 302, 22, 15), *EYE),
        render_part(top_half(370, 302, 22, 15), *EYE),
    ]


def brows_say():
    """说话时眉毛略抬。"""
    l = union(rrect(206, 262, 252, 276, 7))
    r = union(rrect(348, 262, 394, 276, 7))
    return [render_part(l, *BROW), render_part(r, *BROW)]


def mouth_smile():
    """温柔微笑。"""
    return [render_part(bottom_half(300, 388, 26, 16), *MOUTH)]


def mouth_say():
    """说话：张嘴（椭圆内里 + 上唇）。"""
    inner = union(ellipse(272, 372, 328, 408))
    lip = union(ellipse(268, 366, 332, 392))
    return [
        render_part(inner, *MOUTH_IN),
        render_part(lip, *MOUTH),
    ]


def mouth_happy():
    """开心：大张嘴 + 舌头。"""
    inner = union(ellipse(262, 366, 338, 416))
    tongue = union(ellipse(278, 396, 322, 420))
    lip = union(ellipse(258, 360, 342, 392))
    return [
        render_part(inner, *MOUTH_IN),
        render_part(tongue, *TONGUE),
        render_part(lip, *MOUTH),
    ]


def blush_happy():
    return [
        render_part(ellipse(196, 356, 236, 396), *BLUSH),
        render_part(ellipse(364, 356, 404, 396), *BLUSH),
    ]


EXPRESSIONS = {
    'idle':  eyes_open() + mouth_smile(),
    'say':   eyes_open() + brows_say() + mouth_say(),
    'happy': eyes_happy() + blush_happy() + mouth_happy(),
}


def build(expr: str) -> Image.Image:
    layers = [neck(), head()] + EXPRESSIONS[expr] + hair()
    return parts_canvas(layers)


if __name__ == '__main__':
    import sys
    out_dir = sys.argv[1] if len(sys.argv) > 1 else 'assets/resources/art'
    for expr in ('idle', 'say', 'happy'):
        finish(build(expr), f'{out_dir}/char-xiaoqi-{expr}.png')
