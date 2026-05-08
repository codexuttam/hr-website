"""
EduAI Favicon Generator — Luminary Gradient
Produces 512px, 192px, and 32px PNG favicons.
Renders at 4x then downsamples for crisp anti-aliasing.
"""

from PIL import Image, ImageDraw, ImageFilter
import math, os

OUT = "D:/hr-website/graphify-out"

INDIGO = (99,  102, 241)
PURPLE = (147,  51, 234)
WHITE  = (255, 255, 255)
TRANS  = (0, 0, 0, 0)


def lerp_color(c1, c2, t):
    return tuple(int(c1[i] + (c2[i] - c1[i]) * t) for i in range(3))


def make_gradient(size, c1, c2):
    img = Image.new("RGBA", (size, size))
    pix = img.load()
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * (size - 1))
            r, g, b = lerp_color(c1, c2, t)
            pix[x, y] = (r, g, b, 255)
    return img


def rounded_mask(size, radius_frac=0.225):
    ss = size * 4
    r  = int(ss * radius_frac)
    hi = Image.new("L", (ss, ss), 0)
    ImageDraw.Draw(hi).rounded_rectangle([0, 0, ss-1, ss-1], radius=r, fill=255)
    return hi.resize((size, size), Image.LANCZOS)


def cubic_bezier_pts(p0, p1, p2, p3, steps=80):
    pts = []
    for i in range(steps + 1):
        t  = i / steps
        mt = 1 - t
        x  = mt**3*p0[0] + 3*mt**2*t*p1[0] + 3*mt*t**2*p2[0] + t**3*p3[0]
        y  = mt**3*p0[1] + 3*mt**2*t*p1[1] + 3*mt*t**2*p2[1] + t**3*p3[1]
        pts.append((x, y))
    return pts


def draw_cap(draw, offset, scale, sw):
    """
    Draw the Lucide GraduationCap in coordinate-space 0..24,
    translated by `offset` and scaled by `scale`.
    Uses filled shapes for clean rendering.
    """
    def p(x, y):
        return (offset + x * scale, offset + y * scale)

    col = WHITE + (255,)

    # ── Cap board (diamond/rhombus) filled polygon ──────────────────────────
    # Points: M2,10  12,5  22,10  12,15
    board = [p(2,10), p(12,5), p(22,10), p(12,15)]
    # Draw as filled polygon then redraw outline at correct stroke weight
    draw.polygon(board, fill=col)

    # ── Cap brim / body ──────────────────────────────────────────────────────
    # M6,12  v5  → (6,17)
    # cubic bezier (6,17)→(9,20)→(15,20)→(18,17)
    # v-5 → (18,12)
    # We fill a closed shape for crisp look

    brim_pts = cubic_bezier_pts((6,17),(9,20),(15,20),(18,17), steps=120)
    # Scale all to canvas coordinates
    brim_canvas = [(offset + x*scale, offset + y*scale) for x,y in brim_pts]

    # Left side line from (6,12) to (6,17) — build full closed polygon
    left_top    = p(6, 12)
    left_bot    = p(6, 17)
    right_bot   = p(18, 17)
    right_top   = p(18, 12)

    # Build closed brim shape:
    # top-left → top-right → down-right → brim curve (reverse) → down-left
    brim_poly = [left_top, right_top, right_bot] + list(reversed(brim_canvas)) + [left_bot]
    draw.polygon(brim_poly, fill=col)

    # ── Tassel cord ─────────────────────────────────────────────────────────
    # M22,10  v6  →  line from (22,10) to (22,16) with ball at end
    x1, y1 = p(22, 10)
    x2, y2 = p(22, 16)
    draw.line([(x1, y1), (x2, y2)], fill=col, width=max(1, int(sw * 0.85)))

    # Tassel ball
    br = sw * 0.9
    draw.ellipse([x2-br, y2-br, x2+br, y2+br], fill=col)


def make_favicon_at_size(render_size, out_path):
    """Renders at `render_size`, saves to `out_path`."""
    pad   = 0.14          # fraction of canvas left as padding each side
    inner = render_size * (1 - 2 * pad)
    scale = inner / 24.0
    off   = render_size * pad
    sw    = max(2, inner * 0.065)

    # 1. Gradient
    gradient = make_gradient(render_size, INDIGO, PURPLE)

    # 2. Rounded mask
    mask = rounded_mask(render_size)

    # 3. Composite gradient onto transparent base
    base = Image.new("RGBA", (render_size, render_size), TRANS)
    base.paste(gradient, mask=mask)

    # 4. Cap layer
    cap_layer = Image.new("RGBA", (render_size, render_size), TRANS)
    draw_cap(ImageDraw.Draw(cap_layer), off, scale, sw)

    # 5. Subtle highlight (top-left specular)
    if render_size >= 128:
        glow = Image.new("RGBA", (render_size, render_size), TRANS)
        gd   = ImageDraw.Draw(glow)
        gr   = int(render_size * 0.30)
        gcx  = int(render_size * 0.30)
        gcy  = int(render_size * 0.25)
        gd.ellipse([gcx-gr, gcy-gr, gcx+gr, gcy+gr], fill=(255, 255, 255, 20))
        glow = glow.filter(ImageFilter.GaussianBlur(radius=render_size * 0.14))
        base = Image.alpha_composite(base, glow)

    result = Image.alpha_composite(base, cap_layer)
    result.save(out_path, "PNG", optimize=True)
    return result


def make_at_target(render_size, target_size, name):
    tmp = f"{OUT}/_tmp_{render_size}.png"
    make_favicon_at_size(render_size, tmp)
    img = Image.open(tmp).resize((target_size, target_size), Image.LANCZOS)
    dest = f"{OUT}/{name}"
    img.save(dest, "PNG", optimize=True)
    os.remove(tmp)
    print(f"  {target_size}x{target_size}  ->  {dest}")


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("Generating EduAI favicons...")

    # 512px: render at 2048, downsample 4x
    make_at_target(2048, 512, "favicon.png")

    # 192px: render at 768, downsample 4x
    make_at_target(768, 192, "favicon-192.png")

    # 32px: render at 256, downsample 8x
    make_at_target(256, 32, "favicon-32.png")

    print("Done.")
