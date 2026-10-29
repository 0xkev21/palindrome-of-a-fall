#!/usr/bin/env python3
"""
Gallery-minimal social assets for Palindrome of a Fall.

The screenshots are treated as framed plates: warm paper, generous margins,
small tracked labels, one restrained serif line. No device mockups, no pills,
no feature badges.

Outputs 1080x1350 (4:5), 1080x1080 (1:1) and 1080x1920 (9:16) JPEGs.
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SCREENSHOT_DIR = "marketing/screenshots"
OUTPUT_DIR = "public/social"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------------------------------------------------------- palette
PAPER = (238, 234, 225)
PAPER_LIGHT = (246, 243, 236)
INK = (24, 23, 20)
MUTED = (112, 107, 96)
HAIR = (198, 191, 177)
GOLD = (150, 106, 34)
SLATE = (64, 77, 96)
SHADOW = (39, 35, 28)

# ---------------------------------------------------------------- type
SERIF = "/usr/share/fonts/urw-base35/C059-Roman.otf"
SERIF_ITALIC = "/usr/share/fonts/urw-base35/C059-Italic.otf"
SERIF_BOLD = "/usr/share/fonts/urw-base35/C059-Bold.otf"
MONO = "/usr/share/fonts/adobe-source-code-pro-fonts/SourceCodePro-Regular.otf"
MONO_BOLD = "/usr/share/fonts/adobe-source-code-pro-fonts/SourceCodePro-Bold.otf"
SANS = "/usr/share/fonts/adwaita-sans-fonts/AdwaitaSans-Regular.ttf"
SANS_BOLD = "/usr/share/fonts/adwaita-sans-fonts/AdwaitaSans-Bold.ttf"

_font_cache = {}


def font(path, size):
    key = (path, size)
    if key not in _font_cache:
        _font_cache[key] = ImageFont.truetype(path, size)
    return _font_cache[key]


# ---------------------------------------------------------------- canvas
def canvas(w, h, bg=PAPER, grain=0.030):
    base = Image.new("RGB", (w, h), bg)
    if grain:
        noise = Image.effect_noise((w, h), 22).convert("L")
        grain_img = Image.merge("RGB", (noise, noise, noise))
        base = Image.blend(base, grain_img, grain)
    return base


def tracked_width(draw, text, f, tracking):
    return sum(draw.textlength(ch, font=f) for ch in text) + tracking * max(0, len(text) - 1)


def tracked(draw, xy, text, f, fill, tracking=0):
    x, y = xy
    if tracking == 0:
        draw.text((x, y), text, font=f, fill=fill)
        return
    for ch in text:
        draw.text((x, y), ch, font=f, fill=fill)
        x += draw.textlength(ch, font=f) + tracking


def tracked_right(draw, xy_right, text, f, fill, tracking=0):
    x, y = xy_right
    tracked(draw, (x - tracked_width(draw, text, f, tracking), y), text, f, fill, tracking)


def tracked_center(draw, xy_center, text, f, fill, tracking=0):
    cx, y = xy_center
    tracked(draw, (cx - tracked_width(draw, text, f, tracking) / 2, y), text, f, fill, tracking)


def line_height(f):
    b = f.getbbox("Hg")
    return b[3] - b[1]


def wrap(draw, text, f, max_w):
    words = text.split()
    lines, current = [], ""
    for word in words:
        trial = f"{current} {word}".strip()
        if draw.textlength(trial, font=f) <= max_w or not current:
            current = trial
        else:
            lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def paragraph(draw, xy, text, f, fill, max_w, leading=1.55):
    x, y = xy
    for line in wrap(draw, text, f, max_w):
        draw.text((x, y), line, font=f, fill=fill)
        y += int(f.size * leading)
    return y


# ---------------------------------------------------------------- imagery
def crop_ratio(img, ratio, focus_x=0.5, focus_y=0.5):
    w, h = img.size
    if w / h > ratio:
        nw = int(h * ratio)
        x = int((w - nw) * focus_x)
        return img.crop((x, 0, x + nw, h))
    nh = int(w / ratio)
    y = int((h - nh) * focus_y)
    return img.crop((0, y, w, y + nh))


def plate(base, img, box, shadow=True, border=True):
    """Paste a screenshot as a framed print with a soft shadow."""
    x, y, w, h = box
    img = img.convert("RGB").resize((w, h), Image.Resampling.LANCZOS)

    if shadow:
        pad = 48
        mask = Image.new("L", (w + 2 * pad, h + 2 * pad), 0)
        ImageDraw.Draw(mask).rectangle(
            [pad, pad + 8, pad + w, pad + h + 8], fill=58
        )
        mask = mask.filter(ImageFilter.GaussianBlur(20))
        base.paste(SHADOW, (x - pad, y - pad), mask)

    base.paste(img, (x, y))

    if border:
        ImageDraw.Draw(base).rectangle(
            [x - 1, y - 1, x + w, y + h], outline=HAIR, width=1
        )
    return img


# ---------------------------------------------------------------- furniture
def header(draw, W, margin, y, left, right, color_left=INK, color_right=MUTED,
           hair_color=HAIR):
    f = font(MONO, 15)
    tracked(draw, (margin, y), left.upper(), f, color_left, tracking=3.2)
    tracked_right(draw, (W - margin, y), right.upper(), f, color_right, tracking=3.2)
    rule_y = y + int(f.size * 1.9)
    draw.line([(margin, rule_y), (W - margin, rule_y)], fill=hair_color, width=1)
    return rule_y


def footer(draw, W, H, margin, left, right, color_left=MUTED, color_right=INK):
    f = font(MONO, 13)
    y = H - margin - int(f.size * 1.1)
    tracked(draw, (margin, y), left.upper(), f, color_left, tracking=2.6)
    tracked_right(draw, (W - margin, y), right.upper(), f, color_right, tracking=2.6)
    return y


def plate_label(draw, xy, index, name, color=INK, accent=GOLD, right=False):
    """Small 'I — FALLING' label with a gold tick."""
    x, y = xy
    f = font(MONO, 15)
    label = f"{index} — {name}".upper()
    if right:
        width = tracked_width(draw, label, f, 3.0)
        draw.rectangle([x - width - 14, y + 4, x - width - 6, y + 12], fill=accent)
        tracked_right(draw, (x, y), label, f, color, tracking=3.0)
        return
    draw.rectangle([x, y + 4, x + 8, y + 12], fill=accent)
    tracked(draw, (x + 22, y), label, f, color, tracking=3.0)


def small_rule(draw, xy, width=64, color=GOLD):
    x, y = xy
    draw.line([(x, y), (x + width, y)], fill=color, width=2)


def fit_font(draw, text, path, start_size, max_width):
    size = start_size
    while size > 12 and draw.textlength(text, font=font(path, size)) > max_width:
        size -= 1
    return font(path, size)


# ---------------------------------------------------------------- feed 4:5
def feed_plate(is_ascent):
    W, H = 1080, 1350
    M = 84
    base = canvas(W, H)
    draw = ImageDraw.Draw(base)

    if is_ascent:
        source = f"{SCREENSHOT_DIR}/real_desktop_act7_gold.png"
        index, name = "II", "ASCENT"
        title, accent = "Flying", GOLD
        body = ("The same seven acts, run backwards. The fractures are welded "
                "with gold and the ground lets go.")
        footer_left = "SCROLL UP TO FLY"
        footer_right = "44,800 PARTICLES"
        align_right = True
    else:
        source = f"{SCREENSHOT_DIR}/real_desktop_act1_ash.png"
        index, name = "I", "DESCENT"
        title, accent = "Falling", INK
        body = ("Seven acts of collapse: concrete walls, the verdicts of other "
                "people, and a boy in freefall toward an obsidian mirror.")
        footer_left = "SCROLL DOWN TO FALL"
        footer_right = "44,800 PARTICLES"
        align_right = False

    header(draw, W, M, 58, "Palindrome of a Fall", f"{name} / IV")

    img = Image.open(source).convert("RGB")
    img = crop_ratio(img, 16 / 9)
    plate(base, img, (M, 168, W - 2 * M, int((W - 2 * M) * 9 / 16)))

    # caption block
    plate_label(draw, (W - M if align_right else M, 742), index, name,
                color=MUTED, right=align_right)
    tf = font(SERIF, 96)
    tx = W - M if align_right else M
    if align_right:
        draw.text((tx - draw.textlength(title, font=tf), 774), title, font=tf, fill=accent)
    else:
        draw.text((tx, 774), title, font=tf, fill=accent)

    small_rule(draw, ((W - M - 64) if align_right else M, 904))
    bf = font(SANS, 24)
    body_x = W - M - 560 if align_right else M
    paragraph(draw, (body_x, 940), body, bf, MUTED, 560, leading=1.6)

    footer(draw, W, H, M, footer_left, footer_right,
           color_left=GOLD if is_ascent else MUTED)

    fname = "feed-02-flying-4x5.jpg" if is_ascent else "feed-01-falling-4x5.jpg"
    base.save(f"{OUTPUT_DIR}/{fname}", "JPEG", quality=94, subsampling=1)
    print("wrote", fname)


# ---------------------------------------------------------------- feed 1:1 diptych
def feed_diptych():
    S = 1080
    M = 84
    base = canvas(S, S)
    draw = ImageDraw.Draw(base)

    header(draw, S, M, 52, "Palindrome of a Fall", "Diptych / IV")

    desc = crop_ratio(Image.open(f"{SCREENSHOT_DIR}/real_desktop_act1_ash.png").convert("RGB"), 1)
    asc = crop_ratio(Image.open(f"{SCREENSHOT_DIR}/real_desktop_act7_gold.png").convert("RGB"), 1)

    size = 428
    gutter = 56
    left_x = M
    right_x = left_x + size + gutter
    top = 170

    lf = font(MONO, 14)
    tracked(draw, (left_x, 138), "↓  DESCENT", lf, SLATE, tracking=2.6)
    tracked_right(draw, (right_x + size, 138), "ASCENT  ↑", lf, GOLD, tracking=2.6)

    plate(base, desc, (left_x, top, size, size), shadow=False)
    plate(base, asc, (right_x, top, size, size), shadow=False)

    draw.text((M, 650), "Same story.", font=font(SERIF, 66), fill=INK)
    draw.text((M, 718), "Opposite direction.", font=font(SERIF, 66), fill=GOLD)

    small_rule(draw, (M, 830), width=64)
    paragraph(draw, (M, 862),
              "Scroll one way and it is a fall. Scroll back and it is flight. "
              "Nothing is rewritten — only the direction changes.",
              font(SANS, 22), MUTED, 660, leading=1.55)

    footer(draw, S, S, M, "An interactive scroll narrative", "Seven acts")

    base.save(f"{OUTPUT_DIR}/feed-03-diptych-1x1.jpg", "JPEG", quality=94, subsampling=1)
    print("wrote feed-03-diptych-1x1.jpg")


# ---------------------------------------------------------------- feed 1:1 ink poster
def feed_poster():
    S = 1080
    M = 84
    base = canvas(S, S, bg=INK, grain=0.022)
    draw = ImageDraw.Draw(base)

    header(draw, S, M, 52, "Palindrome of a Fall", "Light / IV",
           color_left=PAPER, color_right=GOLD, hair_color=(74, 68, 54))

    quote = ["what shatters", "can reform", "in light"]
    qf = font(SERIF, 66)
    y = 242
    for line in quote:
        draw.text((M, y), line, font=qf, fill=PAPER)
        y += 74

    small_rule(draw, (M, y + 22), width=56, color=GOLD)
    tracked(draw, (M, y + 48), "ACT VII — FLIGHT", font(MONO, 14), GOLD, tracking=3.0)

    paragraph(draw, (M, y + 96),
              "A scroll poem in seven lines. Falling is not the opposite of "
              "flying — it is the same story read in the other direction.",
              font(SANS, 22), (176, 170, 158), 430, leading=1.6)

    img = crop_ratio(Image.open(f"{SCREENSHOT_DIR}/real_mobile_act7_gold.png").convert("RGB"),
                     2 / 3, focus_y=0.18)
    plate(base, img, (596, 242, 400, 600), shadow=False, border=False)
    draw.rectangle([595, 241, 995, 841], outline=(90, 80, 58), width=1)

    tracked(draw, (596, 858), "REAL IN-ENGINE CAPTURE", font(MONO, 12), MUTED, tracking=2.4)

    draw.line([(M, 998), (S - M, 998)], fill=(74, 68, 54), width=1)
    tracked(draw, (M, 1018), "PALINDROME OF A FALL", font(MONO, 13), PAPER, tracking=2.6)
    tracked_right(draw, (S - M, 1018), "WEBGL · SOUND ON", font(MONO, 13), MUTED, tracking=2.6)

    base.save(f"{OUTPUT_DIR}/feed-04-light-1x1.jpg", "JPEG", quality=94, subsampling=1)
    print("wrote feed-04-light-1x1.jpg")


# ---------------------------------------------------------------- stories
def story_plate(is_ascent):
    W, H = 1080, 1920
    M = 84
    base = canvas(W, H)
    draw = ImageDraw.Draw(base)

    if is_ascent:
        source = f"{SCREENSHOT_DIR}/real_mobile_act7_gold.png"
        index, name = "II", "ASCENT"
        title, accent = "Flying", GOLD
        body = "The same acts, reversed. Gold where the fractures were."
        cta = "SCROLL UP  ↑"
        page = "II / IV"
    else:
        source = f"{SCREENSHOT_DIR}/real_mobile_act1_ash.png"
        index, name = "I", "DESCENT"
        title, accent = "Falling", INK
        body = "Seven acts of collapse, and a boy falling toward the mirror."
        cta = "SCROLL DOWN  ↓"
        page = "I / IV"

    header(draw, W, M, 200, "Palindrome of a Fall", f"{name} · {page}")

    img = Image.open(source).convert("RGB")
    img = crop_ratio(img, 0.903, focus_y=0.5)
    plate(base, img, (M, 280, W - 2 * M, 1010))

    plate_label(draw, (M, 1358), index, name, color=MUTED)
    draw.text((M, 1390), title, font=font(SERIF, 88), fill=accent)

    paragraph(draw, (M, 1500), body, font(SANS, 24), MUTED, 720, leading=1.55)

    cta_f = font(MONO_BOLD, 15)
    tracked(draw, (M, 1620), cta, cta_f, INK, tracking=3.4)
    tracked_right(draw, (W - M, 1620), "LINK IN BIO  ↗", font(MONO, 13), GOLD, tracking=2.8)

    fname = "story-02-flying-9x16.jpg" if is_ascent else "story-01-falling-9x16.jpg"
    base.save(f"{OUTPUT_DIR}/{fname}", "JPEG", quality=94, subsampling=1)
    print("wrote", fname)


def story_diptych():
    W, H = 1080, 1920
    M = 84
    base = canvas(W, H)
    draw = ImageDraw.Draw(base)

    header(draw, W, M, 200, "Palindrome of a Fall", "Diptych / IV")

    desc = crop_ratio(Image.open(f"{SCREENSHOT_DIR}/real_mobile_act1_ash.png").convert("RGB"), 1.9)
    asc = crop_ratio(Image.open(f"{SCREENSHOT_DIR}/real_mobile_act7_gold.png").convert("RGB"), 1.9)

    w = W - 2 * M
    h = 480

    lf = font(MONO, 14)
    tracked(draw, (M, 274), "↓  THE DESCENT", lf, SLATE, tracking=2.6)
    plate(base, desc, (M, 306, w, h), shadow=False)

    tracked(draw, (M, 824), "↑  THE ASCENT", lf, GOLD, tracking=2.6)
    plate(base, asc, (M, 856, w, h), shadow=False)

    y = 1408
    draw.text((M, y), "Scroll down to fall.", font=font(SERIF, 58), fill=INK)
    draw.text((M, y + 70), "Scroll up to fly.", font=font(SERIF, 58), fill=GOLD)

    paragraph(draw, (M, 1560),
              "One scroll. Two meanings. The page is built as a palindrome.",
              font(SANS, 22), MUTED, 720, leading=1.55)

    cta_f = font(MONO_BOLD, 15)
    tracked(draw, (M, 1628), "TAP TO EXPERIENCE", cta_f, INK, tracking=3.4)
    tracked_right(draw, (W - M, 1628), "LINK IN BIO  ↗", font(MONO, 13), GOLD, tracking=2.8)

    base.save(f"{OUTPUT_DIR}/story-03-diptych-9x16.jpg", "JPEG", quality=94, subsampling=1)
    print("wrote story-03-diptych-9x16.jpg")


def story_quote():
    W, H = 1080, 1920
    M = 84
    base = canvas(W, H, bg=INK, grain=0.022)
    draw = ImageDraw.Draw(base)

    header(draw, W, M, 200, "Palindrome of a Fall", "Light / IV",
           color_left=PAPER, color_right=GOLD, hair_color=(74, 68, 54))

    quote = ["what shatters", "can reform", "in light"]
    qf = font(SERIF, 96)
    y = 330
    for line in quote:
        draw.text((M, y), line, font=qf, fill=PAPER)
        y += 108

    small_rule(draw, (M, y + 18), width=64, color=GOLD)
    tracked(draw, (M, y + 44), "ACT VII — FLIGHT", font(MONO, 14), GOLD, tracking=3.0)

    paragraph(draw, (M, y + 92),
              "Seven acts of collapse, seven acts of flight. The same film, run "
              "in reverse — the fractures welded with gold.",
              font(SANS, 24), (176, 170, 158), 780, leading=1.6)

    img = crop_ratio(Image.open(f"{SCREENSHOT_DIR}/real_desktop_act7_gold.png").convert("RGB"), 2.17)
    plate(base, img, (M, 1092, W - 2 * M, 420), shadow=False)
    tracked(draw, (M, 1528), "REAL IN-ENGINE CAPTURE · ACT VII", font(MONO, 12), MUTED, tracking=2.4)

    cta_f = font(MONO_BOLD, 15)
    tracked(draw, (M, 1618), "SCROLL TO THE BOTTOM", cta_f, PAPER, tracking=3.4)
    tracked_right(draw, (W - M, 1618), "LINK IN BIO  ↗", font(MONO, 13), GOLD, tracking=2.8)

    base.save(f"{OUTPUT_DIR}/story-04-light-9x16.jpg", "JPEG", quality=94, subsampling=1)
    print("wrote story-04-light-9x16.jpg")


# ---------------------------------------------------------------- link preview
def og_card():
    W, H = 1200, 630
    M = 64
    base = canvas(W, H)
    draw = ImageDraw.Draw(base)

    tracked(draw, (M, 46), "A SCROLL POEM IN SEVEN LINES", font(MONO, 13), MUTED, tracking=3.0)
    tracked_right(draw, (W - M, 46), "WEBGL · SOUND ON", font(MONO, 13), MUTED, tracking=3.0)
    draw.line([(M, 80), (W - M, 80)], fill=HAIR)

    col_w = 430
    brand = fit_font(draw, "PALINDROME", SERIF, 74, col_w)
    draw.text((M, 122), "PALINDROME", font=brand, fill=INK)
    second_y = 122 + int(brand.size * 1.02)
    draw.text((M, second_y), "OF A FALL", font=brand, fill=GOLD)

    rule_y = second_y + int(brand.size * 1.02) + 18
    small_rule(draw, (M, rule_y), width=56)
    paragraph(draw, (M, rule_y + 26),
              "Seven acts of collapse on the way down. Seven acts of flight on "
              "the way up.",
              font(SANS, 20), MUTED, col_w, leading=1.55)

    img = crop_ratio(Image.open(f"{SCREENSHOT_DIR}/real_desktop_act7_gold.png").convert("RGB"), 16 / 9)
    plate(base, img, (530, 122, 606, 341), shadow=False)
    tracked(draw, (530, 480), "REAL IN-ENGINE CAPTURE · ACT VII", font(MONO, 12), MUTED, tracking=2.4)

    draw.line([(M, 556), (W - M, 556)], fill=HAIR)
    tracked(draw, (M, 576), "44,800 PARTICLES · SEVEN ACTS · ONE SCROLL", font(MONO, 12), MUTED, tracking=2.4)
    tracked_right(draw, (W - M, 576), "0XKEV21", font(MONO, 12), INK, tracking=2.4)

    base.save(f"{OUTPUT_DIR}/og-1200x630.jpg", "JPEG", quality=94, subsampling=1)
    print("wrote og-1200x630.jpg")


if __name__ == "__main__":
    # remove the previous app-store style set so the folder holds one direction
    for old in os.listdir(OUTPUT_DIR):
        if old.endswith(".jpg") and not old.startswith(("feed-", "story-", "og-")):
            os.remove(os.path.join(OUTPUT_DIR, old))
    feed_plate(False)
    feed_plate(True)
    feed_diptych()
    feed_poster()
    story_plate(False)
    story_plate(True)
    story_diptych()
    story_quote()
    og_card()
    print("Gallery set written to", OUTPUT_DIR)
