"""Letters the public sample AstroComic cover (fictional reader Rosalind Vance; placements calculated, see
src/content/sampleComic.ts and its test). Run from the project root: python3 scripts/bake-sample-comic-cover.py
"""
from PIL import Image, ImageDraw, ImageFont

FONTS = 'node_modules/@fontsource'
BEBAS = f'{FONTS}/bebas-neue/files/bebas-neue-latin-400-normal.woff'
SLAB = f'{FONTS}/alfa-slab-one/files/alfa-slab-one-latin-400-normal.woff'
CREAM, NAVY, RED, GOLD = (239, 227, 200), (20, 22, 52), (196, 52, 52), (255, 198, 26)

im = Image.open('src/assets/comic-sample/cover-art.jpg').convert('RGB')
W, H = im.size
d = ImageDraw.Draw(im)

def tracked(text, font, tracking):
    return sum(font.getlength(c) for c in text) + tracking * (len(text) - 1)

def draw_tracked(x, y, text, font, fill, tracking, stroke=0, stroke_fill=None):
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill, stroke_width=stroke, stroke_fill=stroke_fill)
        x += font.getlength(ch) + tracking

# Masthead: red banner with the AstroComic name, issue line beneath.
d.rectangle([0, 0, W, 132], fill=RED)
d.rectangle([0, 132, W, 140], fill=NAVY)
mast = ImageFont.truetype(SLAB, 92)
mw = tracked('ASTROCOMIC', mast, 6)
draw_tracked((W - mw) / 2, 14, 'ASTROCOMIC', mast, CREAM, 6, stroke=4, stroke_fill=NAVY)
small = ImageFont.truetype(BEBAS, 34)
line = 'ISSUE 01  ·  SAMPLE ISSUE  ·  BY ZODACI'
sw = tracked(line, small, 5)
draw_tracked((W - sw) / 2, 158, line, small, GOLD, 5)

# Title on the open sky.
title = ImageFont.truetype(SLAB, 78)
for i, word in enumerate(['THE GARDEN', 'GATE']):
    tw = title.getlength(word)
    d.text(((W - tw) / 2 - 150 if False else 56, 206 + i * 86), word, font=title, fill=CREAM, stroke_width=5, stroke_fill=NAVY)

# Bottom strip: who the issue is for and the calculated Big Three.
d.rectangle([0, H - 118, W, H], fill=NAVY)
d.rectangle([0, H - 124, W, H - 118], fill=GOLD)
star = ImageFont.truetype(BEBAS, 40)
s1 = 'STARRING ROSALIND VANCE'
w1 = tracked(s1, star, 4)
draw_tracked((W - w1) / 2, H - 108, s1, star, CREAM, 4)
s2 = 'SUN TAURUS 12°  ·  MOON CANCER 13°  ·  RISING TAURUS 12°'
f2 = ImageFont.truetype(BEBAS, 30)
w2 = tracked(s2, f2, 3)
draw_tracked((W - w2) / 2, H - 58, s2, f2, GOLD, 3)

im.save('src/assets/comic-sample/cover.jpg', quality=88)
print('saved', im.size)
