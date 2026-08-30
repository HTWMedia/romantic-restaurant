# -*- coding: utf-8 -*-
"""去掉 panel-*.png 里烙死的假透明棋盘格背景。

原理：棋盘格是高亮度、低饱和的平色（近白/浅灰），且与图像边缘连通；
面板本体由饱和橙色边框包裹，泛洪填充不会漏进面板内部。
处理：从四角与四边中点向内 floodfill（阈值匹配棋盘格色），命中像素置 alpha=0，
再对透明区邻接的浅色抗锯齿光晕做一次收缩。
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageDraw

MAGIC = (255, 0, 255, 255)   # floodfill 标记色
THRESH = 34                  # 与种子色的最大色差（覆盖两种棋盘格色及噪声）
SEEDS_RATIO = [(0, 0), (1, 0), (0, 1), (1, 1), (0.5, 0), (0.5, 1), (0, 0.5), (1, 0.5)]


def edge_seeds(w: int, h: int, step: int = 32) -> list[tuple[int, int]]:
    """沿四边每 step 像素取一个种子点（用于背景满铺、色块多样的图）。"""
    pts: list[tuple[int, int]] = []
    for x in range(0, w, step):
        pts += [(x, 0), (x, h - 1)]
    for y in range(0, h, step):
        pts += [(0, y), (w - 1, y)]
    return pts


def process(path: str, dense: bool = False) -> None:
    im = Image.open(path).convert('RGBA')
    w, h = im.size
    seeds = edge_seeds(w, h) if dense else [
        (int((w - 1) * rx), int((h - 1) * ry)) for rx, ry in SEEDS_RATIO]
    for seed in seeds:
        # 已是标记色的种子跳过，避免二次扩散出错
        if im.getpixel(seed) == MAGIC:
            continue
        ImageDraw.floodfill(im, seed, MAGIC, thresh=THRESH)

    arr = np.array(im)
    magic = np.all(arr == np.array(MAGIC, dtype=np.uint8), axis=-1)
    arr[magic] = (0, 0, 0, 0)

    # 光晕收缩：与透明区相邻、且接近棋盘格亮色的像素一并置透明
    transparent = arr[..., 3] == 0
    for _ in range(2):
        neighbor = np.zeros_like(transparent)
        neighbor[1:, :] |= transparent[:-1, :]
        neighbor[:-1, :] |= transparent[1:, :]
        neighbor[:, 1:] |= transparent[:, :-1]
        neighbor[:, :-1] |= transparent[:, 1:]
        rgb = arr[..., :3].astype(np.int16)
        bright = rgb.min(axis=-1) >= 225
        neutral = (rgb.max(axis=-1) - rgb.min(axis=-1)) <= 45
        halo = neighbor & ~transparent & bright & neutral
        arr[halo] = (0, 0, 0, 0)
        transparent |= halo

    # 残留噪点清理：保留最大连通域（面板本体），域外的高亮近中性像素全部置透明
    from scipy import ndimage
    labels, n = ndimage.label(arr[..., 3] > 0)
    if n > 1:
        sizes = np.bincount(labels.ravel())
        sizes[0] = 0
        main = labels == sizes.argmax()
        rgb = arr[..., :3].astype(np.int16)
        speckle = ~main & (rgb.min(axis=-1) >= 220) & ((rgb.max(axis=-1) - rgb.min(axis=-1)) <= 45)
        arr[speckle] = (0, 0, 0, 0)

    Image.fromarray(arr).save(path)
    opaque_corners = all(arr[y, x][3] != 0 for y in (0, h - 1) for x in (0, w - 1))
    print(f'{path}: 透明像素占比 {(arr[..., 3] == 0).mean():.1%}, 四角不透明={opaque_corners}')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if a != '--dense-seeds']
    dense = '--dense-seeds' in sys.argv
    for p in args:
        process(p, dense)
