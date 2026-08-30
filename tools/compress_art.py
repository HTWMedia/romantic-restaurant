# -*- coding: utf-8 -*-
"""美术 PNG 交稿压缩：256 色量化 + 抖动（与项目现有素材同一流程）。

用法：
    python tools/compress_art.py <png 或目录> [更多路径...]

注意：有损。只在 AI 出图/重出图后的新文件上运行，勿对项目里已压缩的素材反复执行
（会累积量化损失）。背景图 bg 用 JPG，不走本脚本。
"""
import sys
from pathlib import Path

from PIL import Image


def compress(path: Path) -> None:
    before = path.stat().st_size
    im = Image.open(path).convert('RGBA')
    q = im.quantize(colors=256, method=Image.Quantize.FASTOCTREE,
                    dither=Image.Dither.FLOYDSTEINBERG)
    q.save(path, optimize=True)
    after = path.stat().st_size
    print(f'{path.name}: {before // 1024}KB -> {after // 1024}KB')


if __name__ == '__main__':
    targets: list[Path] = []
    for arg in sys.argv[1:]:
        p = Path(arg)
        if p.is_dir():
            targets += sorted(p.glob('*.png'))
        elif p.suffix.lower() == '.png':
            targets.append(p)
    if not targets:
        print('用法: python tools/compress_art.py <png 或目录>')
        sys.exit(1)
    for t in targets:
        compress(t)
