#!/usr/bin/env python3
"""
Generate professional, studio-grade social media assets for Palindrome of a Fall
using REAL in-engine screenshots captured from the live WebGL application.
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance, ImageOps

SCREENSHOT_DIR = "marketing/screenshots"
OUTPUT_DIR = "public/social"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Fonts
SERIF_BOLD = "/usr/share/fonts/urw-base35/C059-Bold.otf"
SERIF_REG = "/usr/share/fonts/urw-base35/C059-Roman.otf"
MONO_BOLD = "/usr/share/fonts/adobe-source-code-pro-fonts/SourceCodePro-Bold.otf"
SANS_REG = "/usr/share/fonts/adwaita-sans-fonts/AdwaitaSans-Regular.ttf"

# Colors
BG_DARK = (3, 3, 6)
GOLD = (251, 191, 36)
AMBER = (245, 158, 11)
CYAN = (147, 165, 207)
CYAN_COLOR = (147, 165, 207)
WHITE = (234, 235, 238)
MUTED = (165, 170, 185)
SLATE_BORDER = (45, 50, 65)

def draw_pill(draw, x, y, text, font, bg_fill, text_fill, pad_x=22, pad_y=10, border=None):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    box = [x - pad_x, y - pad_y, x + tw + pad_x, y + th + pad_y]
    draw.rounded_rectangle(box, radius=16, fill=bg_fill, outline=border, width=1 if border else 0)
    draw.text((x, y), text, font=font, fill=text_fill)
    return box

def draw_centered_text(draw, y, text, font, fill, canvas_width):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (canvas_width - tw) // 2
    draw.text((x, y), text, font=font, fill=fill)
    return y + (bbox[3] - bbox[1])

def make_phone_mockup(screen_img, target_w=540, target_h=1140):
    """Creates a high-end, sleek smartphone frame around a real mobile screenshot."""
    bezel = 18
    total_w = target_w + bezel * 2
    total_h = target_h + bezel * 2
    corner_radius = 54
    
    mockup = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
    mdraw = ImageDraw.Draw(mockup)
    
    # Outer dark titanium bezel
    mdraw.rounded_rectangle([0, 0, total_w, total_h], radius=corner_radius, fill=(28, 30, 36), outline=(70, 75, 88), width=2)
    # Inner rim highlight
    mdraw.rounded_rectangle([3, 3, total_w - 3, total_h - 3], radius=corner_radius - 2, outline=(15, 16, 20), width=2)
    
    # Resize screen
    screen_resized = screen_img.resize((target_w, target_h), Image.Resampling.LANCZOS).convert("RGBA")
    
    # Mask screen with rounded corners
    screen_mask = Image.new("L", (target_w, target_h), 0)
    sm_draw = ImageDraw.Draw(screen_mask)
    sm_draw.rounded_rectangle([0, 0, target_w, target_h], radius=corner_radius - bezel, fill=255)
    
    mockup.paste(screen_resized, (bezel, bezel), screen_mask)
    
    # Dynamic Island / Camera pill at top
    island_w, island_h = 130, 32
    ix = (total_w - island_w) // 2
    iy = bezel + 12
    mdraw.rounded_rectangle([ix, iy, ix + island_w, iy + island_h], radius=16, fill=(5, 5, 8))
    
    # Subtle screen gloss reflection
    gloss = Image.new("RGBA", (target_w, target_h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(gloss)
    gdraw.polygon([(0, 0), (target_w, 0), (0, int(target_h * 0.45))], fill=(255, 255, 255, 12))
    mockup.paste(gloss, (bezel, bezel), screen_mask)
    
    return mockup

def make_laptop_mockup(screen_img, target_w=840, target_h=472):
    """Creates a sleek MacBook Pro style display mockup around a desktop screenshot."""
    bezel = 14
    screen_w = target_w
    screen_h = target_h
    top_w = screen_w + bezel * 2
    top_h = screen_h + bezel * 2
    
    base_h = 24
    base_w = top_w + 100
    total_w = base_w
    total_h = top_h + base_h + 10
    
    mockup = Image.new("RGBA", (total_w, total_h), (0, 0, 0, 0))
    mdraw = ImageDraw.Draw(mockup)
    
    # Display Lid
    lid_x = (total_w - top_w) // 2
    lid_y = 0
    mdraw.rounded_rectangle([lid_x, lid_y, lid_x + top_w, lid_y + top_h], radius=16, fill=(22, 24, 28), outline=(65, 70, 82), width=1)
    
    # Screen
    screen_resized = screen_img.resize((screen_w, screen_h), Image.Resampling.LANCZOS).convert("RGBA")
    mockup.paste(screen_resized, (lid_x + bezel, lid_y + bezel))
    
    # Notch / Camera dot
    mdraw.ellipse([total_w//2 - 4, lid_y + 4, total_w//2 + 4, lid_y + 12], fill=(10, 10, 14))
    
    # Base / Keyboard Deck
    bx = 0
    by = lid_y + top_h - 4
    mdraw.rounded_rectangle([bx, by, bx + base_w, by + base_h], radius=10, fill=(38, 42, 50), outline=(80, 85, 100), width=1)
    # Notch opening groove
    gw = 120
    mdraw.rounded_rectangle([(total_w - gw)//2, by, (total_w + gw)//2, by + 6], radius=4, fill=(18, 20, 24))
    
    return mockup

# =========================================================================
# 1. STORY 01: REAL MOBILE IN-HAND SHOWCASE (1080x1920)
# =========================================================================
def generate_real_story_01():
    print("Generating Real Story 01: Mobile In-Situ Showcase...")
    W, H = 1080, 1920
    base = Image.new("RGB", (W, H), BG_DARK)
    
    # Background: Soft atmospheric ambient blur from real gold ascent screen
    bg_source = Image.open(f"{SCREENSHOT_DIR}/real_mobile_act7_gold.png").convert("RGB")
    bg_blurred = bg_source.resize((W, H), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(50))
    enhancer = ImageEnhance.Brightness(bg_blurred)
    base.paste(enhancer.enhance(0.28), (0, 0))
    
    draw = ImageDraw.Draw(base)
    
    # Header Typography
    font_badge = ImageFont.truetype(MONO_BOLD, 22)
    font_title = ImageFont.truetype(SERIF_BOLD, 68)
    font_sub = ImageFont.truetype(MONO_BOLD, 26)
    font_body = ImageFont.truetype(SANS_REG, 26)
    font_cta = ImageFont.truetype(MONO_BOLD, 26)
    
    draw_pill(draw, W//2 - 190, 100, "REAL-TIME WEBGL EXPERIENCE", font_badge, (15, 18, 26), CYAN_COLOR, pad_x=24, pad_y=10, border=SLATE_BORDER)
    y = 175
    y = draw_centered_text(draw, y, "PALINDROME", font_title, WHITE, W) + 8
    y = draw_centered_text(draw, y, "OF A FALL", font_title, GOLD, W) + 16
    draw_centered_text(draw, y, "—  FALLING  VS.  FLYING  —", font_sub, CYAN_COLOR, W)
    
    # Phone Mockup in Center
    phone_w, phone_h = 560, 1180
    mockup = make_phone_mockup(bg_source, phone_w, phone_h)
    
    # Create soft glowing drop shadow
    shadow = Image.new("RGBA", (mockup.width + 120, mockup.height + 120), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    # Warm golden/amber rim glow behind phone
    sdraw.rounded_rectangle([60, 60, mockup.width + 60, mockup.height + 60], radius=60, fill=(245, 158, 11, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(35))
    
    mx = (W - mockup.width) // 2
    my = 440
    base.paste(shadow, (mx - 60, my - 60), shadow)
    base.paste(mockup, (mx, my), mockup)
    
    # Bottom callout
    by = 1710
    draw_centered_text(draw, by, "Scroll Down to Collapse  •  Scroll Up to Fly", font_body, WHITE, W)
    
    cta_text = "EXPERIENCE LIVE IN BROWSER  →"
    bbox = draw.textbbox((0, 0), cta_text, font=font_cta)
    draw_pill(draw, (W - (bbox[2] - bbox[0])) // 2, by + 50, cta_text, font_cta, GOLD, (10, 10, 14), pad_x=34, pad_y=16)
    
    base.save(f"{OUTPUT_DIR}/real-story-01-mobile.jpg", "JPEG", quality=95)
    print("Saved public/social/real-story-01-mobile.jpg")

# =========================================================================
# 2. STORY 02: REAL DUALITY INVERSION (9:16 — 1080x1920)
# =========================================================================
def generate_real_story_02():
    print("Generating Real Story 02: Real Duality Inversion...")
    W, H = 1080, 1920
    base = Image.new("RGB", (W, H), BG_DARK)
    
    # Load Real Desktop Screens
    screen_desc = Image.open(f"{SCREENSHOT_DIR}/real_desktop_act1_ash.png").convert("RGB")
    screen_asc = Image.open(f"{SCREENSHOT_DIR}/real_desktop_act7_gold.png").convert("RGB")
    
    card_w = 960
    card_h = 580
    
    def crop_center(img, w, h):
        ratio = max(w / img.width, h / img.height)
        rw, rh = int(img.width * ratio), int(img.height * ratio)
        res = img.resize((rw, rh), Image.Resampling.LANCZOS)
        cx, cy = (rw - w) // 2, (rh - h) // 2
        return res.crop((cx, cy, cx + w, cy + h))
        
    card_desc = crop_center(screen_desc, card_w, card_h)
    card_asc = crop_center(screen_asc, card_w, card_h)
    
    # Header
    draw = ImageDraw.Draw(base)
    font_badge = ImageFont.truetype(MONO_BOLD, 20)
    font_title = ImageFont.truetype(SERIF_BOLD, 54)
    font_sub = ImageFont.truetype(MONO_BOLD, 24)
    font_hud = ImageFont.truetype(MONO_BOLD, 22)
    font_quote = ImageFont.truetype(SERIF_REG, 28)
    
    draw_pill(draw, W//2 - 160, 90, "DUAL-STATE NARRATIVE", font_badge, (18, 20, 28), CYAN_COLOR, pad_x=22, pad_y=10, border=SLATE_BORDER)
    y = 160
    y = draw_centered_text(draw, y, "THE INVERSION MOMENT", font_title, WHITE, W) + 10
    draw_centered_text(draw, y, "REAL IN-ENGINE CAPTURE // DESCENT VS. ASCENT", font_sub, GOLD, W)
    
    # Top Card: Descent
    cx = (W - card_w) // 2
    y_desc = 290
    base.paste(card_desc, (cx, y_desc))
    draw.rectangle([cx, y_desc, cx + card_w, y_desc + card_h], outline=(70, 85, 110), width=2)
    # Overlay badge on card
    draw_pill(draw, cx + 24, y_desc + 24, "↓  ACT I: BURNOUT  [GRAVITY: +9.81 m/s²]", font_hud, (10, 14, 22, 230), CYAN_COLOR, pad_x=18, pad_y=8)
    
    # Center Inversion Divider
    div_y = y_desc + card_h + 80
    draw.line([(80, div_y), (W - 80, div_y)], fill=GOLD, width=3)
    inv_text = "— BEDROCK (p > 0.94): GRAVITY INVERTS —"
    bbox = draw.textbbox((0, 0), inv_text, font=font_sub)
    draw_pill(draw, (W - (bbox[2] - bbox[0])) // 2, div_y - 20, inv_text, font_sub, BG_DARK, GOLD, pad_x=26, pad_y=8, border=AMBER)
    
    # Bottom Card: Ascent
    y_asc = div_y + 80
    base.paste(card_asc, (cx, y_asc))
    draw.rectangle([cx, y_asc, cx + card_w, y_asc + card_h], outline=(150, 120, 50), width=2)
    draw_pill(draw, cx + 24, y_asc + 24, "↑  ACT VII: FLIGHT  [GRAVITY: -19.6 m/s²]", font_hud, (24, 20, 12, 230), GOLD, pad_x=18, pad_y=8)
    
    # Footer
    draw_centered_text(draw, 1690, "“what shatters can reform in light”", font_quote, WHITE, W)
    draw_centered_text(draw, 1740, "Nothing is rewritten. Only direction changes.", font_sub, MUTED, W)
    
    base.save(f"{OUTPUT_DIR}/real-story-02-inversion.jpg", "JPEG", quality=95)
    print("Saved public/social/real-story-02-inversion.jpg")

# =========================================================================
# 3. POST 01: DESKTOP STUDIO DISPLAY MOCKUP (1:1 — 1080x1080)
# =========================================================================
def generate_real_post_01():
    print("Generating Real Post 01: Desktop Display Mockup...")
    S = 1080
    base = Image.new("RGB", (S, S), BG_DARK)
    
    screen = Image.open(f"{SCREENSHOT_DIR}/real_desktop_act7_gold.png").convert("RGB")
    
    # Ambient background from screen
    ambient = screen.resize((S, S), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(60))
    base.paste(ImageEnhance.Brightness(ambient).enhance(0.24), (0, 0))
    
    draw = ImageDraw.Draw(base)
    
    font_badge = ImageFont.truetype(MONO_BOLD, 18)
    font_title = ImageFont.truetype(SERIF_BOLD, 46)
    font_sub = ImageFont.truetype(MONO_BOLD, 22)
    font_tags = ImageFont.truetype(MONO_BOLD, 18)
    
    # Header
    draw_pill(draw, S//2 - 170, 50, "LIVE WEBGL THREE.JS ENGINE", font_badge, (15, 18, 25), CYAN_COLOR, pad_x=20, pad_y=8, border=SLATE_BORDER)
    y = 110
    y = draw_centered_text(draw, y, "PALINDROME OF A FALL", font_title, WHITE, S) + 8
    draw_centered_text(draw, y, "FALLING  VS.  FLYING", font_sub, GOLD, S)
    
    # Laptop Mockup
    mockup = make_laptop_mockup(screen, target_w=860, target_h=484)
    
    # Shadow under laptop
    shadow = Image.new("RGBA", (mockup.width + 100, mockup.height + 80), (0, 0, 0, 0))
    sdraw = ImageDraw.Draw(shadow)
    sdraw.ellipse([50, mockup.height - 20, mockup.width + 50, mockup.height + 60], fill=(0, 0, 0, 160))
    # Golden glow under laptop
    sdraw.ellipse([100, mockup.height - 40, mockup.width, mockup.height + 30], fill=(245, 158, 11, 45))
    shadow = shadow.filter(ImageFilter.GaussianBlur(25))
    
    lx = (S - mockup.width) // 2
    ly = 240
    base.paste(shadow, (lx - 50, ly), shadow)
    base.paste(mockup, (lx, ly), mockup)
    
    # Bottom specs
    by = 890
    draw_centered_text(draw, by, "An interactive, palindrome-shaped descent & ascent in 44,800 particles.", font_sub, WHITE, S)
    
    tag_y = by + 65
    b1 = draw_pill(draw, 140, tag_y, "44.8K PARTICLES", font_tags, (20, 22, 30), WHITE, pad_x=16, pad_y=8)
    b2 = draw_pill(draw, b1[2] + 20, tag_y, "SPATIAL AUDIO", font_tags, (20, 22, 30), GOLD, pad_x=16, pad_y=8)
    b3 = draw_pill(draw, b2[2] + 20, tag_y, "LENIS + GSAP", font_tags, (20, 22, 30), CYAN, pad_x=16, pad_y=8)
    draw_pill(draw, b3[2] + 20, tag_y, "NO FRAMEWORKS", font_tags, (20, 22, 30), MUTED, pad_x=16, pad_y=8)
    
    base.save(f"{OUTPUT_DIR}/real-post-01-desktop.jpg", "JPEG", quality=95)
    print("Saved public/social/real-post-01-desktop.jpg")

# =========================================================================
# 4. POST 02: REAL DUALITY SPLIT FEED POST (1:1 — 1080x1080)
# =========================================================================
def generate_real_post_02():
    print("Generating Real Post 02: Real Duality Split...")
    S = 1080
    base = Image.new("RGB", (S, S), BG_DARK)
    
    desc_screen = Image.open(f"{SCREENSHOT_DIR}/real_desktop_act1_ash.png").convert("RGB")
    asc_screen = Image.open(f"{SCREENSHOT_DIR}/real_desktop_act7_gold.png").convert("RGB")
    
    # Crop central strips (540xS)
    def crop_strip(img, w, h):
        ratio = h / img.height
        new_w = int(img.width * ratio)
        res = img.resize((new_w, h), Image.Resampling.LANCZOS)
        cx = (new_w - w) // 2
        return res.crop((cx, 0, cx + w, h))
        
    left_side = crop_strip(desc_screen, S // 2, S)
    right_side = crop_strip(asc_screen, S // 2, S)
    
    base.paste(left_side, (0, 0))
    base.paste(right_side, (S // 2, 0))
    
    # Center golden fracture divider
    draw = ImageDraw.Draw(base)
    draw.line([(S // 2, 0), (S // 2, S)], fill=GOLD, width=3)
    
    # Top and bottom dark vignettes for crisp typography
    vig = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vig)
    for y in range(240):
        a = int(240 * (1.0 - (y / 240) ** 1.3))
        vdraw.line([(0, y), (S, y)], fill=(3, 3, 6, a))
    for y in range(780, S):
        a = int(240 * (((y - 780) / 300) ** 1.2))
        vdraw.line([(0, y), (S, y)], fill=(3, 3, 6, a))
    base.paste(vig, (0, 0), vig)
    
    draw = ImageDraw.Draw(base)
    
    font_col = ImageFont.truetype(MONO_BOLD, 22)
    font_title = ImageFont.truetype(SERIF_BOLD, 42)
    font_quote = ImageFont.truetype(SERIF_REG, 26)
    font_sub = ImageFont.truetype(MONO_BOLD, 20)
    
    # Column Labels
    draw_pill(draw, S//4 - 120, 80, "↓  THE DESCENT", font_col, (10, 14, 22, 230), CYAN_COLOR, pad_x=20, pad_y=10, border=(45, 60, 85))
    draw_pill(draw, 3*S//4 - 100, 80, "↑  THE ASCENT", font_col, (24, 20, 10, 230), GOLD, pad_x=20, pad_y=10, border=(100, 80, 40))
    
    # Bottom section
    by = 830
    draw_centered_text(draw, by, "SEVEN ACTS OF COLLAPSE.  SEVEN ACTS OF FLIGHT.", font_title, WHITE, S)
    draw_centered_text(draw, by + 60, "“what shatters can reform in light”", font_quote, GOLD, S)
    draw_centered_text(draw, by + 115, "REAL IN-ENGINE RENDERS  •  ONE SCROLL DRIVES BOTH SENSES", font_sub, MUTED, S)
    
    base.save(f"{OUTPUT_DIR}/real-post-02-split.jpg", "JPEG", quality=95)
    print("Saved public/social/real-post-02-split.jpg")

# =========================================================================
# 5. LANDSCAPE TWITTER / OG PREVIEW (1.91:1 — 1200x630)
# =========================================================================
def generate_real_landscape_og():
    print("Generating Real Landscape OG Card (1200x630)...")
    W, H = 1200, 630
    base = Image.new("RGB", (W, H), BG_DARK)
    
    screen = Image.open(f"{SCREENSHOT_DIR}/real_desktop_act7_gold.png").convert("RGB")
    
    # Place live screenshot on right half with angled/smooth fade to dark on left
    screen_w = 780
    screen_h = H
    screen_res = screen.resize((int(screen.width * (H / screen.height)), H), Image.Resampling.LANCZOS)
    screen_cropped = screen_res.crop((screen_res.width - screen_w, 0, screen_res.width, H))
    
    base.paste(screen_cropped, (W - screen_w, 0))
    
    # Smooth dark gradient fade to blend screenshot into branding
    fade = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fdraw = ImageDraw.Draw(fade)
    fstart = W - screen_w - 50
    fend = W - screen_w + 320
    for x in range(fstart, fend):
        prog = (x - fstart) / (fend - fstart)
        a = int(255 * (1.0 - prog))
        fdraw.line([(x, 0), (x, H)], fill=(3, 3, 6, a))
    fdraw.rectangle([0, 0, fstart, H], fill=(3, 3, 6, 255))
    base.paste(fade, (0, 0), fade)
    
    draw = ImageDraw.Draw(base)
    
    font_badge = ImageFont.truetype(MONO_BOLD, 16)
    font_title = ImageFont.truetype(SERIF_BOLD, 52)
    font_sub = ImageFont.truetype(MONO_BOLD, 20)
    font_desc = ImageFont.truetype(SANS_REG, 21)
    font_quote = ImageFont.truetype(SERIF_REG, 22)
    
    # Branding text on left
    lx = 80
    draw_pill(draw, lx, 70, "INTERACTIVE WEBGL STORY", font_badge, (15, 18, 25), CYAN_COLOR, pad_x=18, pad_y=8, border=SLATE_BORDER)
    
    draw.text((lx, 135), "PALINDROME", font=font_title, fill=WHITE)
    draw.text((lx, 195), "OF A FALL", font=font_title, fill=GOLD)
    draw.text((lx, 270), "FALLING  VS.  FLYING", font=font_sub, fill=CYAN_COLOR)
    
    draw.text((lx, 325), "Scroll down through seven acts of collapse.", font=font_desc, fill=WHITE)
    draw.text((lx, 358), "Scroll back up to watch the same story turn to gold.", font=font_desc, fill=GOLD)
    draw.text((lx, 410), "“what shatters can reform in light”", font=font_quote, fill=MUTED)
    
    # Footer badges
    by = 510
    b1 = draw_pill(draw, lx, by, "44.8K PARTICLES", font_badge, (20, 22, 28), WHITE, pad_x=16, pad_y=8)
    b2 = draw_pill(draw, b1[2] + 16, by, "SPATIAL AUDIO", font_badge, (20, 22, 28), GOLD, pad_x=16, pad_y=8)
    draw_pill(draw, b2[2] + 16, by, "LENIS + GSAP", font_badge, (20, 22, 28), CYAN_COLOR, pad_x=16, pad_y=8)
    
    base.save(f"{OUTPUT_DIR}/real-landscape-twitter-og.jpg", "JPEG", quality=95)
    print("Saved public/social/real-landscape-twitter-og.jpg")

if __name__ == "__main__":
    generate_real_story_01()
    generate_real_story_02()
    generate_real_post_01()
    generate_real_post_02()
    generate_real_landscape_og()
    print("All professional social media assets from real screenshots generated successfully!")
