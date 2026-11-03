#!/usr/bin/env python3
"""Use Tan's authored photo crop, rather than the background placeholder.

Figma 3421:2582 clips photo 3421:2583. Both layers mirror X, cancelling
each other. These are copied native image-paint values from the locked
2026-11-03 source, not a crop inferred from a screenshot.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PHOTO = ROOT / 'public/images/figma/dental-pages-20261103/image-3d917ce08391a294490b64fe755d5643e23f6093.webp'
TARGET = ROOT / 'public/images/dental-physicians/tan-zhaolin.webp'
paint = {'m00': 0.10117435455322266, 'm02': 0.45695263147354126,
         'm11': 0.1571623831987381, 'm12': 0.3168397843837738}
image = Image.open(PHOTO).convert('RGB')
width, height = image.size
# Photo layer is 110x114 at y=-2, clipped by the 110x110 avatar frame.
crop = image.transform((240, 240), Image.Transform.AFFINE, (
    width * paint['m00'] / 240, 0, width * paint['m02'],
    0, height * paint['m11'] * 110 / 114 / 240,
    height * (paint['m12'] + paint['m11'] * 2 / 114),
), resample=Image.Resampling.BICUBIC)
crop.save(TARGET, 'WEBP', quality=86, method=6)
print(f'{TARGET.relative_to(ROOT)}: {TARGET.stat().st_size} bytes')
