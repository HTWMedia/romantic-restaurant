# -*- coding: utf-8 -*-
"""生成 12 件独立装饰品程序占位图（decor-*.png，88×88，透明底）。

画风沿用 tools/make_merge_art.py 的占位风格：暖色水彩色板 + 软边明暗 + 暖棕描边 +
纸纹颗粒，与 assets/resources/art 下已有水彩图协调。
注意：这是程序占位图，正式水彩素材可按 docs/ai-art-prompts.md 重新出图后
同名覆盖 assets/resources/art/decor-*.png 即可，代码无需改动。
"""
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

S = 88           # 输出尺寸
SS = 2           # 超采样倍数
C = S * SS       # 画布尺寸 = 176
OUTLINE = (138, 90, 43)  # 暖棕描边
rng = np.random.default_rng(13)


def shift_mask(m: np.ndarray, dy: int, dx: int = 0) -> np.ndarray:
    out = np.zeros_like(m)
    ys = slice(max(dy, 0), m.shape[0] + min(dy, 0))
    yd = slice(max(-dy, 0), m.shape[0] + min(-dy, 0))
    xs = slice(max(dx, 0), m.shape[1] + min(dx, 0))
    xd = slice(max(-dx, 0), m.shape[1] + min(-dx, 0))
    out[ys, xs] = m[yd, xd]
    return out


def render_part(draw_fn, base, shade, hi, rotate=0.0, outline=OUTLINE, outline_a=140):
    m = Image.new('L', (C, C), 0)
    draw_fn(ImageDraw.Draw(m))
    a = np.array(m) > 0

    rgb = np.zeros((C, C, 3), np.float32)
    rgb[:] = base
    band = a & ~shift_mask(a, 8 * SS)
    band = ndimage.gaussian_filter(band.astype(np.float32), 4 * SS // 2)
    rgb = rgb * (1 - band[..., None] * 0.45) + np.array(shade, np.float32) * (band[..., None] * 0.45)
    band = a & ~shift_mask(a, -8 * SS)
    band = ndimage.gaussian_filter(band.astype(np.float32), 4 * SS // 2)
    rgb = rgb * (1 - band[..., None] * 0.4) + np.array(hi, np.float32) * (band[..., None] * 0.4)
    ring = a.astype(np.uint8) * 255 - ndimage.minimum_filter((a * 255).astype(np.uint8), 3 * SS)
    ring = ndimage.gaussian_filter(ring.astype(np.float32), 1.2)
    rgb = rgb * (1 - (ring / 255)[..., None]) + np.array(outline, np.float32) * (ring / 255)[..., None] * (outline_a / 255)

    alpha = ndimage.gaussian_filter((a * 255).astype(np.float32), 1.0)
    layer = np.dstack([rgb.clip(0, 255), alpha.clip(0, 255)]).astype(np.uint8)
    img = Image.fromarray(layer, 'RGBA')
    if rotate:
        img = img.rotate(rotate, expand=True, resample=Image.BICUBIC)
    return img


def grain(canvas: Image.Image) -> Image.Image:
    a = np.array(canvas)
    mask = a[..., 3] > 0
    noise = rng.normal(0, 5, (C, C, 1)).repeat(3, axis=2)
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


# ---- 辅助形状 ----
def ellipse(x0, y0, x1, y1):
    return lambda d: d.ellipse([x0, y0, x1, y1], fill=255)

def rrect(x0, y0, x1, y1, r):
    return lambda d: d.rounded_rectangle([x0, y0, x1, y1], radius=r * SS, fill=255)

def poly(pts):
    return lambda d: d.polygon(pts, fill=255)

def line(x0, y0, x1, y1, w):
    return lambda d: d.line([x0, y0, x1, y1], fill=255, width=max(1, int(w * SS)))

def rect(x0, y0, x1, y1):
    return lambda d: d.rectangle([x0, y0, x1, y1], fill=255)

def union(*fns):
    def go(d):
        for f in fns:
            f(d)
    return go


# ---- 色板 ----
WOOD = ((180, 130, 80), (140, 96, 54), (210, 162, 110))
WOOD_D = ((150, 100, 56), (116, 74, 40), (180, 132, 82))
GOLD = ((230, 185, 80), (190, 148, 52), (246, 214, 120))
GREEN = ((127, 176, 105), (91, 140, 74), (168, 201, 138))
RED = ((200, 90, 74), (160, 62, 52), (226, 130, 110))
BLUE = ((100, 160, 210), (72, 124, 176), (142, 196, 230))
PINK = ((232, 152, 168), (200, 120, 138), (246, 188, 200))
CREAM = ((251, 241, 220), (226, 205, 170), (255, 250, 238))
WHITE = ((245, 245, 240), (210, 210, 200), (255, 255, 252))
YELLOW = ((240, 210, 80), (206, 174, 48), (252, 228, 120))


# ---- 12 件装饰品 ----

def painting():
    """油画：木框 + 画布"""
    frame = union(rrect(30, 30, 146, 146, 8), rect(30, 30, 146, 146))
    canvas = rect(44, 44, 132, 132)
    sky = rect(44, 44, 132, 88)
    ground = rect(44, 88, 132, 132)
    sun = ellipse(100, 56, 124, 80)
    return parts_canvas([
        render_part(frame, *WOOD),
        render_part(canvas, *CREAM),
        render_part(sky, *BLUE),
        render_part(ground, *GREEN),
        render_part(sun, *YELLOW),
    ])


def clock():
    """复古时钟：圆壳 + 表盘 + 指针"""
    case = ellipse(30, 30, 146, 146)
    face = ellipse(42, 42, 134, 134)
    h1 = line(88, 56, 88, 62, 2)  # 12点刻度
    h2 = line(118, 88, 112, 88, 2)  # 3点
    h3 = line(88, 118, 88, 112, 2)  # 6点
    h4 = line(56, 88, 62, 88, 2)   # 9点
    hour_hand = line(88, 88, 88, 62, 2.5)
    min_hand = line(88, 88, 110, 88, 2)
    center = ellipse(84, 84, 92, 92)
    return parts_canvas([
        render_part(case, *WOOD_D),
        render_part(face, *CREAM),
        render_part(union(h1, h2, h3, h4), *WOOD_D),
        render_part(hour_hand, *WOOD_D),
        render_part(min_hand, *WOOD_D),
        render_part(center, *GOLD),
    ])


def sign():
    """霓虹招牌：长方形板 + 发光字"""
    board = rrect(24, 50, 152, 126, 10)
    glow = rrect(32, 58, 144, 118, 8)
    text = union(
        rect(50, 70, 60, 80),   # 字1
        rect(70, 70, 80, 80),   # 字2
        rect(90, 70, 100, 80),  # 字3
        rect(110, 70, 120, 80), # 字4
        rect(50, 90, 70, 100),
        rect(80, 90, 100, 100),
        rect(110, 90, 130, 100),
    )
    chain = union(line(60, 30, 60, 50, 1.5), line(116, 30, 116, 50, 1.5))
    return parts_canvas([
        render_part(chain, *WOOD_D),
        render_part(board, *WOOD_D),
        render_part(glow, *BLUE),
        render_part(text, *YELLOW),
    ])


def vase():
    """花瓶：瓶身 + 花"""
    body = union(
        ellipse(52, 80, 124, 140),
        rrect(66, 60, 110, 90, 8),
    )
    rim = ellipse(64, 56, 112, 70)
    flower1 = ellipse(70, 30, 94, 54)
    flower2 = ellipse(96, 24, 120, 48)
    flower3 = ellipse(82, 38, 106, 62)
    stem = union(line(88, 56, 88, 80, 1.5), line(104, 50, 100, 80, 1.5))
    return parts_canvas([
        render_part(body, *BLUE),
        render_part(rim, *BLUE),
        render_part(stem, *GREEN),
        render_part(flower1, *PINK),
        render_part(flower2, *RED),
        render_part(flower3, *YELLOW),
    ])


def candle():
    """烛台：底座 + 蜡烛 + 火焰"""
    base = union(rrect(56, 120, 120, 136, 6), ellipse(52, 116, 124, 132))
    stick = rrect(74, 60, 102, 124, 6)
    flame = poly([(88, 30), (78, 56), (88, 52), (98, 56)])
    wick = line(88, 56, 88, 62, 1)
    return parts_canvas([
        render_part(base, *GOLD),
        render_part(stick, *CREAM),
        render_part(wick, *WOOD_D),
        render_part(flame, *YELLOW),
    ])


def cloth():
    """桌旗：长条布带 + 流苏"""
    cloth = rrect(24, 70, 152, 110, 6)
    pattern = union(
        *[ellipse(40 + i * 24, 84, 50 + i * 24, 94, ) for i in range(5)]
    )
    fringe_l = union(*[line(28, 110, 28, 124 + i * 2, 1) for i in range(5)])
    fringe_r = union(*[line(148, 110, 148, 124 + i * 2, 1) for i in range(5)])
    return parts_canvas([
        render_part(cloth, *RED),
        render_part(pattern, *GOLD),
        render_part(union(fringe_l, fringe_r), *RED),
    ])


def plant():
    """绿植：花盆 + 叶子"""
    pot = union(
        rrect(56, 96, 120, 134, 8),
        ellipse(52, 92, 124, 108),
    )
    rim = ellipse(54, 88, 122, 102)
    leaves = union(
        ellipse(60, 40, 96, 80),
        ellipse(84, 30, 120, 70),
        ellipse(72, 50, 108, 90),
        ellipse(56, 56, 88, 88),
        ellipse(92, 44, 124, 76),
    )
    return parts_canvas([
        render_part(pot, *WOOD_D),
        render_part(rim, *WOOD),
        render_part(leaves, *GREEN),
    ])


def rug():
    """地毯：椭圆 + 花纹"""
    rug_shape = ellipse(28, 60, 148, 120)
    border = union(
        ellipse(34, 66, 142, 114),
        ellipse(28, 60, 148, 120),
    )
    inner = ellipse(44, 72, 132, 108)
    dot = union(*[ellipse(64 + i * 24, 86, 72 + i * 24, 94) for i in range(4)])
    return parts_canvas([
        render_part(rug_shape, *RED),
        render_part(border, *GOLD),
        render_part(inner, *CREAM),
        render_part(dot, *BLUE),
    ])


def umbrella():
    """伞架：杆 + 伞面"""
    pole = line(88, 70, 88, 140, 2.5)
    canopy = union(
        ellipse(40, 30, 136, 80),
        rect(40, 50, 136, 80),
    )
    tip = line(88, 24, 88, 34, 1.5)
    handle = line(88, 140, 100, 136, 2.5)
    return parts_canvas([
        render_part(canopy, *RED),
        render_part(pole, *WOOD_D),
        render_part(tip, *WOOD_D),
        render_part(handle, *WOOD_D),
    ])


def lamp():
    """吊灯：线 + 灯罩 + 光"""
    cord = line(88, 20, 88, 50, 1.5)
    shade = union(
        poly([(50, 50), (126, 50), (140, 88), (36, 88)]),
    )
    glow = ellipse(60, 80, 116, 110)
    bulb = ellipse(80, 84, 96, 100)
    return parts_canvas([
        render_part(cord, *WOOD_D),
        render_part(shade, *GOLD),
        render_part(glow, *YELLOW),
        render_part(bulb, *WHITE),
    ])


def chime():
    """风铃：顶帽 + 铃管"""
    top = rrect(52, 34, 124, 52, 8)
    cord = union(
        line(64, 52, 64, 120, 1),
        line(88, 52, 88, 130, 1),
        line(112, 52, 112, 120, 1),
    )
    tube1 = rrect(58, 118, 70, 140, 3)
    tube2 = rrect(82, 128, 94, 150, 3)
    tube3 = rrect(106, 118, 118, 140, 3)
    leaf = poly([(88, 152), (82, 164), (94, 164)])
    return parts_canvas([
        render_part(top, *BLUE),
        render_part(cord, *WOOD_D),
        render_part(tube1, *BLUE),
        render_part(tube2, *BLUE),
        render_part(tube3, *BLUE),
        render_part(leaf, *GREEN),
    ])


def ribbon():
    """彩带：飘带 + 蝴蝶结"""
    strand1 = poly([(40, 40), (50, 36), (60, 100), (50, 104)])
    strand2 = poly([(120, 40), (130, 36), (140, 100), (130, 104)])
    bow_l = poly([(88, 60), (56, 50), (56, 90), (88, 80)])
    bow_r = poly([(88, 60), (120, 50), (120, 90), (88, 80)])
    knot = ellipse(82, 64, 94, 76)
    return parts_canvas([
        render_part(strand1, *PINK),
        render_part(strand2, *PINK),
        render_part(bow_l, *RED),
        render_part(bow_r, *RED),
        render_part(knot, *GOLD),
    ])


if __name__ == '__main__':
    import sys
    out_dir = sys.argv[1] if len(sys.argv) > 1 else 'assets/resources/art'
    items = [
        ('decor-painting',  painting),
        ('decor-clock',     clock),
        ('decor-sign',      sign),
        ('decor-vase',      vase),
        ('decor-candle',    candle),
        ('decor-cloth',     cloth),
        ('decor-plant',     plant),
        ('decor-rug',       rug),
        ('decor-umbrella',  umbrella),
        ('decor-lamp',      lamp),
        ('decor-chime',     chime),
        ('decor-ribbon',    ribbon),
    ]
    for name, fn in items:
        finish(fn(), f'{out_dir}/{name}.png')
