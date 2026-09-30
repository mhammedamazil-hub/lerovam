#!/usr/bin/env python3
"""Generate LEROVAM raster assets (favicons, app icons, OG cover) with Pillow.

The mark geometry mirrors assets/img/logo-mark.svg exactly:
  - white angular "L" (stem + foot)
  - electric-blue forward slash (#1B7FFF)
Source viewBox: x 50..196, y 18..188  (146 x 170 units)

Usage:  python3 tools/generate-assets.py
"""
from PIL import Image, ImageDraw, ImageFont

BG = (7, 9, 12, 255)
WHITE = (255, 255, 255, 255)
BLUE = (27, 127, 255, 255)
MUTED = (167, 173, 183, 255)

# Mark polygons in SVG viewBox units (viewBox 50 18 146 170)
VB_X, VB_Y, VB_W, VB_H = 50, 18, 146, 170
STEM = [(72, 58), (112, 26), (112, 96), (72, 121)]
FOOT = [(64, 144), (166, 144), (188, 180), (86, 180)]
SLASH = [(58, 132), (158, 70), (158, 102), (74, 154)]

DEJAVU_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
DEJAVU = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def draw_mark(draw: ImageDraw.ImageDraw, box, pad_ratio=0.16):
    """Draw the LEROVAM mark centred inside `box` = (x0, y0, x1, y1)."""
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    scale = min(bw / VB_W, bh / VB_H) * (1 - 2 * pad_ratio)
    ox = x0 + (bw - VB_W * scale) / 2 - VB_X * scale
    oy = y0 + (bh - VB_H * scale) / 2 - VB_Y * scale

    def tx(poly):
        return [(ox + x * scale, oy + y * scale) for x, y in poly]

    draw.polygon(tx(STEM), fill=WHITE)
    draw.polygon(tx(FOOT), fill=WHITE)
    draw.polygon(tx(SLASH), fill=BLUE)


def rounded_bg(size, radius_ratio=0.19):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=int(size * radius_ratio), fill=BG)
    return img


def save_icon(path, size):
    img = rounded_bg(size)
    d = ImageDraw.Draw(img)
    draw_mark(d, (0, 0, size, size), pad_ratio=0.17)
    img.save(path, optimize=True)
    print(f"wrote {path} ({size}x{size})")


def save_apple_touch(path, size=180):
    # Apple masks the icon itself: full-bleed square, no transparency.
    img = Image.new("RGBA", (size, size), BG)
    d = ImageDraw.Draw(img)
    draw_mark(d, (0, 0, size, size), pad_ratio=0.19)
    img.convert("RGB").save(path, optimize=True)
    print(f"wrote {path} ({size}x{size})")


def tracked_text(draw, xy, text, font, fill, tracking=0):
    """Draw text with letter-spacing; returns total width."""
    x, y = xy
    widths = [draw.textlength(ch, font=font) for ch in text]
    for ch, w in zip(text, widths):
        draw.text((x, y), ch, font=font, fill=fill)
        x += w + tracking
    return x - xy[0] - (tracking if text else 0)


def fit_font(draw, text, path, start_size, max_width, tracking=0):
    size = start_size
    while size > 10:
        font = ImageFont.truetype(path, size)
        w = sum(draw.textlength(ch, font=font) for ch in text) + tracking * max(len(text) - 1, 0)
        if w <= max_width:
            return font
        size -= 2
    return ImageFont.truetype(path, 10)


def save_og_cover(path):
    W, H = 1200, 630
    img = Image.new("RGBA", (W, H), BG)
    d = ImageDraw.Draw(img)

    # Faint flat hairline grid (echoes the hero; no gradients, no glow).
    grid = (255, 255, 255, 5)
    for gx in range(0, W + 1, 72):
        d.line([(gx, 0), (gx, H)], fill=grid)
    for gy in range(0, H + 1, 72):
        d.line([(0, gy), (W, gy)], fill=grid)

    # Mark on the left.
    draw_mark(d, (80, 125, 420, 505), pad_ratio=0.10)

    # Wordmark + tagline on the right (shrink-to-fit so nothing clips).
    tx, max_w = 500, 1200 - 500 - 70
    brand = "LEROVAM"
    tag = "We build brands that move forward."
    sub = "Websites  ·  Ads  ·  Creative"
    f_brand = fit_font(d, brand, DEJAVU_BOLD, 96, max_w, tracking=12)
    f_tag = fit_font(d, tag, DEJAVU, 36, max_w)
    f_sub = fit_font(d, sub, DEJAVU_BOLD, 30, max_w)
    tracked_text(d, (tx, 178), brand, f_brand, WHITE, tracking=12)
    d.text((tx + 4, 332), tag, font=f_tag, fill=MUTED)
    d.text((tx + 4, 420), sub, font=f_sub, fill=BLUE)
    img.convert("RGB").save(path, optimize=True)
    print(f"wrote {path} ({W}x{H})")


def main():
    out = "assets/img"
    save_icon(f"{out}/favicon-32x32.png", 32)
    save_icon(f"{out}/favicon-16x16.png", 16)
    save_apple_touch(f"{out}/apple-touch-icon.png", 180)
    save_icon(f"{out}/icon-192.png", 192)
    save_icon(f"{out}/icon-512.png", 512)
    save_og_cover(f"{out}/og-cover.png")


if __name__ == "__main__":
    main()
