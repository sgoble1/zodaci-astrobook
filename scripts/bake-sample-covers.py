"""Bakes the public sample readers' names and birth details onto the flat AstroBook shop covers.

The readers are invented; their placements are calculated (see src/content/coverSamples.ts and its test).
Run from the project root: python3 scripts/bake-sample-covers.py
"""
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

FONTS = 'node_modules/@fontsource'
BEBAS = f'{FONTS}/bebas-neue/files/bebas-neue-latin-400-normal.woff'
SLAB = f'{FONTS}/alfa-slab-one/files/alfa-slab-one-latin-400-normal.woff'
NAVY, RED, GOLD = (24, 36, 66), (178, 62, 44), (190, 142, 44)

COVERS = [
    # flat cover, output, name, born line, placements line, blank area (top, bottom), paint over existing text
    ('taurus-cover-flat', 'astrobook-collector-taurus-sample', 'Rosalind Vance',
     'Born 3 May 1987  ·  6:42 a.m.  ·  Asheville, North Carolina', 'Sun Taurus 12°  ·  Moon Cancer 13°  ·  Rising Taurus 12°', (1240, 1494), True),
    ('gemini-signature-cover-flat', 'astrobook-signature-gemini-sample', 'Theo Lindqvist',
     'Born 9 June 1991  ·  11:18 p.m.  ·  Duluth, Minnesota', 'Sun Gemini 18°  ·  Moon Taurus 16°  ·  Rising Capricorn 24°', (1218, 1494), False),
    ('gemini-pocket-cover-flat', 'astrobook-pocket-gemini-sample', 'Calvin Okafor',
     'Born 2 June 1984  ·  4:05 p.m.  ·  Savannah, Georgia', 'Sun Gemini 12°  ·  Moon Cancer 21°  ·  Rising Libra 18°', (1238, 1498), False),
]

def fit(path, text, size, max_w, tracking=0):
    while size > 10:
        f = ImageFont.truetype(path, size)
        w = f.getlength(text) + tracking * (len(text) - 1)
        if w <= max_w: return f, w
        size -= 1
    return ImageFont.truetype(path, size), max_w

def draw_tracked(d, x, y, text, font, fill, tracking):
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + tracking

def bake(src, out, name, born, placements, area, paint):
    im = Image.open(f'src/assets/products/{src}.jpg').convert('RGB')
    W, H = im.size
    top, bottom = area
    if paint:
        a = np.asarray(im).astype(float)
        # Paper colour per column from the clean strip under the old tagline, smoothed, plus matching grain.
        strip = a[1478:1494, 37:987]
        base = np.median(strip, 0)
        k = np.ones(61) / 61
        base = np.stack([np.convolve(np.pad(base[:, c], 30, mode='edge'), k, mode='valid') for c in range(3)], 1)
        std = strip.std(0).mean(0).clip(0, 5)
        noise = np.random.default_rng(7).normal(0, 1, (bottom - top, 950, 1)) * std
        a[top:bottom, 37:987] = (base[None, :, :] + noise).clip(0, 255)
        im = Image.fromarray(a.astype('uint8'))
    d = ImageDraw.Draw(im)
    cx, inner = W / 2, 860
    h = bottom - top
    y = top + h * 0.03
    small, sw = fit(BEBAS, 'PREPARED FOR', 34, inner, 7)
    draw_tracked(d, cx - sw / 2, y, 'PREPARED FOR', small, RED, 7)
    y += 44
    nf, nw = fit(SLAB, name.upper(), 80, inner)
    d.text((cx - nw / 2, y), name.upper(), font=nf, fill=NAVY)
    y += nf.getbbox(name.upper())[3] + 22
    # Rule with a small four-point star.
    d.line([(cx - 300, y), (cx - 22, y)], fill=GOLD, width=3)
    d.line([(cx + 22, y), (cx + 300, y)], fill=GOLD, width=3)
    d.polygon([(cx, y - 13), (cx + 5, y - 4), (cx + 14, y), (cx + 5, y + 4), (cx, y + 13), (cx - 5, y + 4), (cx - 14, y), (cx - 5, y - 4)], fill=GOLD)
    y += 18
    bf, bw = fit(BEBAS, born.upper(), 44, inner, 2)
    draw_tracked(d, cx - bw / 2, y, born.upper(), bf, NAVY, 2)
    y += bf.size * 1.0
    pf, pw = fit(BEBAS, placements.upper(), 38, inner, 2)
    draw_tracked(d, cx - pw / 2, y, placements.upper(), pf, RED, 2)
    # A touch of print softness so the type sits in the paper like the artwork.
    im = im.filter(ImageFilter.UnsharpMask(radius=1, percent=20, threshold=3))
    im.save(f'src/assets/products/{out}.jpg', quality=86, optimize=True, progressive=True)
    print('saved', out, 'last line ends at', round(y + pf.size), 'of', bottom)

for c in COVERS: bake(*c)
