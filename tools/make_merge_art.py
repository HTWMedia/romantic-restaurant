# -*- coding: utf-8 -*-
"""生成合成板 8 张程序小图（ing-*.png，192×192，透明底）。

画风：暖色水彩色板 + 软边明暗 + 暖棕描边 + 纸纹颗粒，
与 assets/resources/art 下 AI 水彩菜品图协调。
提示：这些是程序占位图，正式素材可按 docs/ai-art-prompts.md 重新出图替换。
"""
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

S = 192          # 输出尺寸
SS = 2           # 超采样倍数
C = S * SS       # 画布尺寸
OUTLINE = (138, 90, 43)  # 暖棕描边
rng = np.random.default_rng(7)


def shift_mask(m: np.ndarray, dy: int, dx: int = 0) -> np.ndarray:
    out = np.zeros_like(m)
    ys = slice(max(dy, 0), m.shape[0] + min(dy, 0))
    yd = slice(max(-dy, 0), m.shape[0] + min(-dy, 0))
    xs = slice(max(dx, 0), m.shape[1] + min(dx, 0))
    xd = slice(max(-dx, 0), m.shape[1] + min(-dx, 0))
    out[ys, xs] = m[yd, xd]
    return out


def render_part(draw_fn, base, shade, hi, rotate=0.0, outline=OUTLINE, outline_a=140):
    """画一个部件：底色 + 下缘阴影 + 上缘高光 + 描边，返回 RGBA 层。"""
    m = Image.new('L', (C, C), 0)
    draw_fn(ImageDraw.Draw(m))
    a = np.array(m) > 0

    rgb = np.zeros((C, C, 3), np.float32)
    rgb[:] = base
    # 下缘暗部
    band = a & ~shift_mask(a, 14 * SS)
    band = ndimage.gaussian_filter(band.astype(np.float32), 8 * SS // 2)
    rgb = rgb * (1 - band[..., None] * 0.45) + np.array(shade, np.float32) * (band[..., None] * 0.45)
    # 上缘亮部
    band = a & ~shift_mask(a, -14 * SS)
    band = ndimage.gaussian_filter(band.astype(np.float32), 8 * SS // 2)
    rgb = rgb * (1 - band[..., None] * 0.4) + np.array(hi, np.float32) * (band[..., None] * 0.4)
    # 描边（外圈）
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
    """给整图加纸纹颗粒，统一各部件质感。"""
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


# ---- 各部件绘制（坐标基于 384 画布，中心 192）----

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


GREEN = ((127, 176, 105), (91, 140, 74), (168, 201, 138))
GREEN_D = ((96, 148, 84), (66, 110, 58), (140, 180, 115))
CREAM = ((251, 241, 220), (226, 205, 170), (255, 250, 238))


def veg():
    leaves = union(*[ellipse(192 + dx - 84, 192 + dy - 84, 192 + dx + 84, 192 + dy + 84)
                     for dx, dy in [(-70, 12), (70, 12), (0, -62), (-40, 58), (40, 58), (0, 8)]])
    heart = ellipse(192 - 56, 192 - 84, 192 + 56, 192 + 32)
    return parts_canvas([
        render_part(leaves, *GREEN_D),
        render_part(heart, *(GREEN[2], GREEN[1], (208, 226, 168))),
    ])


def salad():
    greens = union(*[ellipse(192 + dx - 34, 152 + dy - 34, 192 + dx + 34, 152 + dy + 34)
                     for dx, dy in [(-46, -4), (0, -18), (46, -4), (-26, 12), (28, 12)]])
    tomato = ellipse(148, 138, 186, 170)
    bowl = union(
        lambda d: d.pieslice([96, 150, 288, 380], 0, 180, fill=255),
        rrect(96, 150, 288, 200, 24),
    )
    rim = ellipse(88, 138, 296, 176)
    return parts_canvas([
        render_part(greens, *GREEN),
        render_part(tomato, *((200, 90, 74), (160, 62, 52), (226, 130, 110))),
        render_part(bowl, *((206, 118, 74), (164, 88, 52), (228, 152, 104))),
        render_part(rim, *((178, 96, 58), (140, 72, 44), (206, 132, 86))),
    ])


def meat():
    slab = ellipse(62, 122, 322, 262)
    fat = ellipse(92, 132, 268, 200)
    return parts_canvas([
        render_part(slab, *((192, 82, 72), (150, 56, 50), (222, 122, 108)), rotate=-8),
        render_part(fat, *CREAM, rotate=-8),
    ])


def stew():
    body = rrect(84, 148, 300, 292, 42)
    handles = union(rrect(48, 186, 96, 224, 14), rrect(288, 186, 336, 224, 14))
    rim = ellipse(76, 128, 308, 176)
    soup = ellipse(104, 136, 280, 168)
    chunk = union(*[ellipse(192 + dx - 18, 140 + dy - 12, 192 + dx + 18, 140 + dy + 14)
                    for dx, dy in [(-52, 0), (0, -4), (54, 2), (-24, 6), (28, 8)]])
    return parts_canvas([
        render_part(handles, *((166, 96, 48), (128, 70, 34), (196, 128, 76))),
        render_part(body, *((201, 124, 63), (158, 90, 42), (228, 158, 96))),
        render_part(rim, *((176, 100, 48), (138, 74, 36), (204, 134, 78))),
        render_part(soup, *((217, 142, 58), (178, 108, 42), (240, 172, 92))),
        render_part(chunk, *((150, 84, 52), (118, 62, 38), (184, 118, 80))),
    ])


def dough():
    blob = union(ellipse(72, 122, 312, 268), ellipse(112, 96, 272, 160))
    flour = union(*[ellipse(150 + dx - 8, 130 + dy - 6, 150 + dx + 8, 130 + dy + 6)
                    for dx, dy in [(-30, -6), (10, -18), (48, 0), (-6, 8), (30, 14)]])
    return parts_canvas([
        render_part(blob, *((240, 220, 168), (208, 182, 122), (250, 236, 196))),
        render_part(flour, *((252, 248, 236), (232, 224, 200), (255, 255, 250))),
    ])


def cake():
    bottom = union(rrect(72, 190, 312, 250, 20), ellipse(72, 214, 312, 262))
    cream = union(rrect(84, 158, 300, 214, 18), ellipse(84, 188, 300, 228))
    top = union(ellipse(84, 108, 300, 176))
    return parts_canvas([
        render_part(bottom, *((233, 188, 114), (196, 150, 80), (246, 210, 146))),
        render_part(cream, *CREAM),
        render_part(top, *((233, 188, 114), (196, 150, 80), (246, 210, 146))),
    ])


def cheese():
    wedge = poly([(66, 268), (150, 108), (330, 148), (330, 268)])
    rind = poly([(150, 108), (330, 148), (330, 178), (156, 140)])
    holes = union(*[ellipse(192 + dx - r, 226 + dy - r, 192 + dx + r, 226 + dy + r)
                    for dx, dy, r in [(-70, 10, 16), (10, 22, 12), (76, 2, 18), (-6, -22, 8)]])
    return parts_canvas([
        render_part(wedge, *((243, 198, 78), (206, 158, 52), (250, 220, 120))),
        render_part(holes, *((206, 158, 52), (176, 128, 42), (226, 182, 88))),
        render_part(rind, *((224, 176, 62), (192, 142, 48), (240, 200, 100))),
    ])


def pasta_dough():
    disc = ellipse(62, 128, 322, 262)
    speckle = union(*[ellipse(150 + dx - 5, 176 + dy - 4, 150 + dx + 5, 176 + dy + 4)
                      for dx, dy in [(-60, -18), (-18, 10), (24, -14), (66, 12), (0, 26), (-40, 26), (44, 30)]])
    return parts_canvas([
        render_part(disc, *((241, 228, 194), (208, 190, 146), (250, 240, 214)), rotate=-6),
        render_part(speckle, *((217, 188, 126), (186, 156, 96), (234, 210, 156)), rotate=-6),
    ])


if __name__ == '__main__':
    import sys
    out_dir = sys.argv[1] if len(sys.argv) > 1 else 'assets/resources/art'
    for name, fn in [('ing-veg', veg), ('ing-salad', salad), ('ing-meat', meat),
                     ('ing-stew', stew), ('ing-dough', dough), ('ing-cake', cake),
                     ('ing-cheese', cheese), ('ing-pasta-dough', pasta_dough)]:
        finish(fn(), f'{out_dir}/{name}.png')
