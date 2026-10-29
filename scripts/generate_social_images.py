#!/usr/bin/env python3
"""
Generate social media assets (stories and posts) for Palindrome of a Fall.
Outputs:
  - public/social/story-01-main.jpg        (1080x1920, 9:16 Instagram/TikTok Story)
  - public/social/story-02-palindrome.jpg  (1080x1920, 9:16 Story - Concept & Poem)
  - public/social/post-01-square.jpg       (1080x1080, 1:1 Square Feed Post)
  - public/social/post-02-duality.jpg      (1080x1080, 1:1 Duality / Split Comparison)
  - public/social/landscape-twitter-og.jpg (1200x630,  1.91:1 Twitter / OG Preview)
"""

import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

# Paths
SERIF_FONT_PATH = "/usr/share/fonts/urw-base35/C059-Bold.otf"
SERIF_REG_PATH = "/usr/share/fonts/urw-base35/C059-Roman.otf"
MONO_FONT_PATH = "/usr/share/fonts/adobe-source-code-pro-fonts/SourceCodePro-Bold.otf"
SANS_FONT_PATH = "/usr/share/fonts/adwaita-sans-fonts/AdwaitaSans-Regular.ttf"

BG_COLOR = (3, 3, 6) # #030306
GOLD_COLOR = (251, 191, 36) # #fbbf24
AMBER_COLOR = (245, 158, 11) # #f59e0b
CYAN_COLOR = (147, 165, 207) # #93a5cf
WHITE_COLOR = (234, 235, 238) # #eaebee
MUTED_COLOR = (160, 165, 175)

os.makedirs("public/social", exist_ok=True)

def create_gradient_mask(width, height, top_stop=0.3, bottom_stop=0.7):
    """Generates a vertical alpha gradient to darken top and bottom for text."""
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    for y in range(height):
        progress = y / height
        if progress < top_stop:
            alpha = int(240 * (1.0 - progress / top_stop))
        elif progress > bottom_stop:
            alpha = int(240 * ((progress - bottom_stop) / (1.0 - bottom_stop)))
        else:
            alpha = 0
        draw.line([(0, y), (width, y)], fill=alpha)
    return mask

def draw_centered_text(draw, y, text, font, fill, width, tracking=0):
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    x = (width - text_w) // 2
    draw.text((x, y), text, font=font, fill=fill)
    return y + (bbox[3] - bbox[1])

def draw_pill(draw, x, y, text, font, bg_fill, text_fill, pad_x=24, pad_y=10, border=None):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    box = [x - pad_x, y - pad_y, x + tw + pad_x, y + th + pad_y]
    draw.rounded_rectangle(box, radius=16, fill=bg_fill, outline=border, width=1 if border else 0)
    draw.text((x, y), text, font=font, fill=text_fill)
    return box

# =========================================================================
# 1. STORY 01: MAIN TEASER (1080x1920)
# =========================================================================
def generate_story_01():
    print("Generating Story 01: Main Teaser...")
    W, H = 1080, 1920
    base = Image.new("RGB", (W, H), BG_COLOR)
    
    # Load story background artwork
    art = Image.open("public/social/story_clean.jpg").convert("RGB")
    # Resize artwork to cover canvas nicely
    art_ratio = art.width / art.height
    target_ratio = W / H
    if art_ratio > target_ratio:
        new_h = H
        new_w = int(H * art_ratio)
    else:
        new_w = W
        new_h = int(W / art_ratio)
    art_resized = art.resize((new_w, new_h), Image.Resampling.LANCZOS)
    # Center crop
    crop_x = (new_w - W) // 2
    crop_y = (new_h - H) // 2
    art_cropped = art_resized.crop((crop_x, crop_y, crop_x + W, crop_y + H))
    
    # Apply soft dark vignette at top and bottom for typography
    vignette = Image.new("RGBA", (W, H), (3, 3, 6, 0))
    vdraw = ImageDraw.Draw(vignette)
    
    # Top gradient (0 -> 550)
    for y in range(550):
        a = int(255 * (1.0 - (y / 550) ** 1.3))
        vdraw.line([(0, y), (W, y)], fill=(3, 3, 6, a))
        
    # Bottom gradient (1300 -> 1920)
    for y in range(1300, H):
        a = int(255 * (((y - 1300) / 620) ** 1.1))
        vdraw.line([(0, y), (W, y)], fill=(3, 3, 6, a))
        
    base.paste(art_cropped, (0, 0))
    base.paste(vignette, (0, 0), vignette)
    
    draw = ImageDraw.Draw(base)
    
    font_badge = ImageFont.truetype(MONO_FONT_PATH, 22)
    font_subhead = ImageFont.truetype(MONO_FONT_PATH, 28)
    font_title = ImageFont.truetype(SERIF_FONT_PATH, 74)
    font_quote = ImageFont.truetype(SERIF_REG_PATH, 34)
    font_desc = ImageFont.truetype(SANS_FONT_PATH, 28)
    font_cta = ImageFont.truetype(MONO_FONT_PATH, 26)
    
    # Top: Subtle badge
    badge_text = "WEBGL  •  44.8K PARTICLES  •  SOUND DESIGN"
    bbox = draw.textbbox((0, 0), badge_text, font=font_badge)
    bw = bbox[2] - bbox[0]
    bx = (W - bw) // 2
    draw_pill(draw, bx, 130, badge_text, font_badge, (15, 17, 24, 220), CYAN_COLOR, pad_x=28, pad_y=12, border=(50, 60, 80))
    
    # Main Header
    y = 230
    y = draw_centered_text(draw, y, "PALINDROME", font_title, WHITE_COLOR, W) + 10
    y = draw_centered_text(draw, y, "OF A FALL", font_title, GOLD_COLOR, W) + 20
    draw_centered_text(draw, y, "—  FALLING  VS.  FLYING  —", font_subhead, CYAN_COLOR, W)
    
    # Center decorative frame corners
    cw, ch = 880, 800
    cx1 = (W - cw) // 2
    cy1 = 520
    cx2 = cx1 + cw
    cy2 = cy1 + ch
    # Subtle corner brackets
    c_len = 30
    # Gold corners
    draw.line([(cx1, cy1), (cx1 + c_len, cy1)], fill=GOLD_COLOR, width=2)
    draw.line([(cx1, cy1), (cx1, cy1 + c_len)], fill=GOLD_COLOR, width=2)
    draw.line([(cx2, cy1), (cx2 - c_len, cy1)], fill=GOLD_COLOR, width=2)
    draw.line([(cx2, cy1), (cx2, cy1 + c_len)], fill=GOLD_COLOR, width=2)
    draw.line([(cx1, cy2), (cx1 + c_len, cy2)], fill=CYAN_COLOR, width=2)
    draw.line([(cx1, cy2), (cx1, cy2 - c_len)], fill=CYAN_COLOR, width=2)
    draw.line([(cx2, cy2), (cx2 - c_len, cy2)], fill=CYAN_COLOR, width=2)
    draw.line([(cx2, cy2), (cx2, cy2 - c_len)], fill=CYAN_COLOR, width=2)
    
    # Bottom Content
    by = 1430
    draw_centered_text(draw, by, "Scroll down to collapse into ash.", font_quote, WHITE_COLOR, W)
    draw_centered_text(draw, by + 52, "Scroll up to mend the fracture in gold.", font_quote, GOLD_COLOR, W)
    
    # Divider line
    div_y = by + 125
    draw.line([(W//2 - 120, div_y), (W//2 + 120, div_y)], fill=(80, 75, 70), width=1)
    # Gold diamond in center
    draw.polygon([(W//2, div_y - 6), (W//2 + 6, div_y), (W//2, div_y + 6), (W//2 - 6, div_y)], fill=GOLD_COLOR)
    
    draw_centered_text(draw, by + 155, "Same seven acts. Opposite meaning.", font_desc, MUTED_COLOR, W)
    
    # CTA pill at bottom
    cta_text = "EXPERIENCE THE ASCENT  →"
    bbox = draw.textbbox((0, 0), cta_text, font=font_cta)
    cw = bbox[2] - bbox[0]
    draw_pill(draw, (W - cw) // 2, 1720, cta_text, font_cta, (251, 191, 36, 255), (10, 10, 14), pad_x=40, pad_y=18)
    
    base.save("public/social/story-01-main.jpg", "JPEG", quality=95)
    print("Saved public/social/story-01-main.jpg")

# =========================================================================
# 2. STORY 02: THE PALINDROME POEM / MECHANIC (1080x1920)
# =========================================================================
def generate_story_02():
    print("Generating Story 02: Palindrome Concept & Poem...")
    W, H = 1080, 1920
    base = Image.new("RGB", (W, H), BG_COLOR)
    
    # Load background subtly blended
    art = Image.open("public/social/post_clean.jpg").convert("RGB")
    art_blurred = art.resize((W, W), Image.Resampling.LANCZOS).filter(ImageFilter.GaussianBlur(15))
    enhancer = ImageEnhance.Brightness(art_blurred)
    art_dimmed = enhancer.enhance(0.4)
    base.paste(art_dimmed, (0, (H - W) // 2))
    
    # Dark vignette
    overlay = Image.new("RGBA", (W, H), (3, 3, 6, 180))
    base.paste(overlay, (0, 0), overlay)
    
    draw = ImageDraw.Draw(base)
    
    font_badge = ImageFont.truetype(MONO_FONT_PATH, 20)
    font_label = ImageFont.truetype(MONO_FONT_PATH, 24)
    font_title = ImageFont.truetype(SERIF_FONT_PATH, 58)
    font_sub = ImageFont.truetype(MONO_FONT_PATH, 26)
    font_verse = ImageFont.truetype(SERIF_REG_PATH, 34)
    font_impact = ImageFont.truetype(MONO_FONT_PATH, 24)
    
    # Header
    draw_pill(draw, W//2 - 170, 110, "THE PALINDROME FORM", font_badge, (20, 24, 34), CYAN_COLOR, pad_x=24, pad_y=10, border=(45, 55, 75))
    y = 190
    y = draw_centered_text(draw, y, "ONE POEM. TWO SENSES.", font_title, WHITE_COLOR, W) + 15
    draw_centered_text(draw, y, "READ DOWN: COLLAPSE  |  READ UP: FLIGHT", font_sub, GOLD_COLOR, W)
    
    # Top Card: Descent
    top_box = [80, 340, W - 80, 880]
    draw.rounded_rectangle(top_box, radius=20, fill=(10, 12, 18), outline=(40, 50, 70), width=1)
    draw.text((120, 370), "↓  SCROLLING DOWN  //  ACTS I → VII  [THE BURNOUT]", font=font_label, fill=CYAN_COLOR)
    
    descent_lines = [
        "Everything scatters into ash",
        "and I refuse to believe",
        "the spark outlives the collapse",
        "The drift reveals",
        "we are only dust in motion",
        "It is a lie that",
        "what shatters can reform in light"
    ]
    py = 430
    for l in descent_lines:
        draw.text((120, py), f"“ {l} ”", font=font_verse, fill=(200, 210, 225))
        py += 58
        
    # Center Impact / Inversion Gate
    iy = 940
    draw.line([(80, iy), (W - 80, iy)], fill=GOLD_COLOR, width=2)
    impact_text = "— BEDROCK IMPACT POINT: GRAVITY INVERTS —"
    bbox = draw.textbbox((0, 0), impact_text, font=font_impact)
    iw = bbox[2] - bbox[0]
    draw_pill(draw, (W - iw)//2, iy - 20, impact_text, font_impact, (3, 3, 6), GOLD_COLOR, pad_x=24, pad_y=8, border=AMBER_COLOR)
    
    # Bottom Card: Ascent
    bot_box = [80, 1020, W - 80, 1560]
    draw.rounded_rectangle(bot_box, radius=20, fill=(16, 14, 10), outline=(90, 75, 40), width=1)
    draw.text((120, 1050), "↑  SCROLLING UP  //  ACTS VII → I  [THE ASCENT]", font=font_label, fill=GOLD_COLOR)
    
    ascent_lines = [
        "what shatters can reform in light",
        "It is a lie that",
        "we are only dust in motion",
        "The drift reveals",
        "the spark outlives the collapse",
        "and I refuse to believe",
        "Everything scatters into ash"
    ]
    py = 1110
    for l in ascent_lines:
        draw.text((120, py), f"“ {l} ”", font=font_verse, fill=(253, 230, 138))
        py += 58

    # Bottom Call to Action
    draw_centered_text(draw, 1630, "“Nothing is rewritten. Only direction changes.”", font_verse, WHITE_COLOR, W)
    cta_text = "SCROLL THE PALINDROME  •  LINK IN BIO"
    bbox = draw.textbbox((0, 0), cta_text, font=font_sub)
    draw_pill(draw, (W - (bbox[2]-bbox[0]))//2, 1730, cta_text, font_sub, GOLD_COLOR, (10, 10, 14), pad_x=36, pad_y=16)

    base.save("public/social/story-02-palindrome.jpg", "JPEG", quality=95)
    print("Saved public/social/story-02-palindrome.jpg")

# =========================================================================
# 3. POST 01: SQUARE FEED COVER (1080x1080)
# =========================================================================
def generate_post_01():
    print("Generating Post 01: Square Feed Cover...")
    S = 1080
    base = Image.new("RGB", (S, S), BG_COLOR)
    
    art = Image.open("public/social/post_clean.jpg").convert("RGB")
    art_resized = art.resize((S, S), Image.Resampling.LANCZOS)
    
    # Subtle vignette overlay
    vignette = Image.new("RGBA", (S, S), (3, 3, 6, 0))
    vdraw = ImageDraw.Draw(vignette)
    
    # Top vignette
    for y in range(250):
        a = int(220 * (1.0 - (y / 250) ** 1.2))
        vdraw.line([(0, y), (S, y)], fill=(3, 3, 6, a))
    # Bottom vignette
    for y in range(650, S):
        a = int(240 * (((y - 650) / 430) ** 1.2))
        vdraw.line([(0, y), (S, y)], fill=(3, 3, 6, a))
        
    base.paste(art_resized, (0, 0))
    base.paste(vignette, (0, 0), vignette)
    
    draw = ImageDraw.Draw(base)
    
    font_badge = ImageFont.truetype(MONO_FONT_PATH, 20)
    font_title = ImageFont.truetype(SERIF_FONT_PATH, 66)
    font_sub = ImageFont.truetype(MONO_FONT_PATH, 24)
    font_desc = ImageFont.truetype(SANS_FONT_PATH, 24)
    
    # Outer frame
    pad = 40
    draw.rectangle([pad, pad, S - pad, S - pad], outline=(100, 90, 70), width=1)
    
    # Top Tag
    tag_text = "INTERACTIVE DIGITAL POEM"
    bbox = draw.textbbox((0, 0), tag_text, font=font_badge)
    tw = bbox[2] - bbox[0]
    draw_pill(draw, (S - tw)//2, 70, tag_text, font_badge, (15, 17, 24, 230), CYAN_COLOR, pad_x=22, pad_y=10, border=(60, 70, 90))
    
    # Bottom Section
    by = 780
    by = draw_centered_text(draw, by, "PALINDROME OF A FALL", font_title, WHITE_COLOR, S) + 12
    draw_centered_text(draw, by, "FALLING  VS.  FLYING", font_sub, GOLD_COLOR, S)
    
    div_y = by + 65
    draw.line([(S//2 - 140, div_y), (S//2 + 140, div_y)], fill=(120, 100, 70), width=1)
    draw.polygon([(S//2, div_y - 5), (S//2 + 5, div_y), (S//2, div_y + 5), (S//2 - 5, div_y)], fill=GOLD_COLOR)
    
    draw_centered_text(draw, div_y + 25, "An interactive, palindrome-shaped descent & ascent.", font_desc, WHITE_COLOR, S)
    draw_centered_text(draw, div_y + 60, "44,800 Three.js Particles  •  Spatial Audio  •  Zero Frameworks", font_badge, MUTED_COLOR, S)
    
    base.save("public/social/post-01-square.jpg", "JPEG", quality=95)
    print("Saved public/social/post-01-square.jpg")

# =========================================================================
# 4. POST 02: DUALITY / SPLIT COMPARISON (1080x1080)
# =========================================================================
def generate_post_02():
    print("Generating Post 02: Split Duality Comparison...")
    S = 1080
    base = Image.new("RGB", (S, S), BG_COLOR)
    
    # Left: Act 1 descent (cold/cyan), Right: Act 7 ascent (gold)
    desc_img = Image.open("public/scenes/act1_desc.jpg").convert("RGB")
    asc_img = Image.open("public/scenes/act7_asc.jpg").convert("RGB")
    
    # Crop half-width strips (540 x S)
    def crop_half(img, target_w, target_h):
        # Resize preserving height
        ratio = target_h / img.height
        new_w = int(img.width * ratio)
        res = img.resize((new_w, target_h), Image.Resampling.LANCZOS)
        # Center crop target_w
        cx = (new_w - target_w) // 2
        return res.crop((cx, 0, cx + target_w, target_h))
        
    left_side = crop_half(desc_img, S // 2, S)
    right_side = crop_half(asc_img, S // 2, S)
    
    base.paste(left_side, (0, 0))
    base.paste(right_side, (S // 2, 0))
    
    # Overlay silhouette characters if available
    try:
        boy_desc = Image.open("public/character/descent_clean.png").convert("RGBA")
        boy_asc = Image.open("public/character/ascent_clean.png").convert("RGBA")
        
        # Resize characters
        cw = 280
        ratio = cw / boy_desc.width
        ch = int(boy_desc.height * ratio)
        boy_desc_r = boy_desc.resize((cw, ch), Image.Resampling.LANCZOS)
        boy_asc_r = boy_asc.resize((cw, ch), Image.Resampling.LANCZOS)
        
        # Paste boy falling on left, boy rising on right
        base.paste(boy_desc_r, (S//4 - cw//2, 380), boy_desc_r)
        base.paste(boy_asc_r, (3*S//4 - cw//2, 380), boy_asc_r)
    except Exception as e:
        print("Note: Character overlay skipped:", e)
        
    # Vertical golden seam in the center
    draw = ImageDraw.Draw(base)
    draw.line([(S // 2, 0), (S // 2, S)], fill=GOLD_COLOR, width=3)
    
    # Vignettes top and bottom
    vig = Image.new("RGBA", (S, S), (3, 3, 6, 0))
    vdraw = ImageDraw.Draw(vig)
    for y in range(200):
        a = int(230 * (1.0 - (y / 200) ** 1.2))
        vdraw.line([(0, y), (S, y)], fill=(3, 3, 6, a))
    for y in range(780, S):
        a = int(240 * (((y - 780) / 300) ** 1.2))
        vdraw.line([(0, y), (S, y)], fill=(3, 3, 6, a))
    base.paste(vig, (0, 0), vig)
    
    draw = ImageDraw.Draw(base)
    
    font_badge = ImageFont.truetype(MONO_FONT_PATH, 20)
    font_col = ImageFont.truetype(MONO_FONT_PATH, 26)
    font_title = ImageFont.truetype(SERIF_FONT_PATH, 44)
    font_sub = ImageFont.truetype(SERIF_REG_PATH, 26)
    
    # Column Labels
    draw_pill(draw, S//4 - 130, 80, "↓  THE DESCENT", font_col, (10, 14, 22), CYAN_COLOR, pad_x=22, pad_y=10, border=(45, 60, 85))
    draw_pill(draw, 3*S//4 - 110, 80, "↑  THE ASCENT", font_col, (24, 20, 10), GOLD_COLOR, pad_x=22, pad_y=10, border=(100, 80, 40))
    
    # Bottom banner
    by = 840
    draw_centered_text(draw, by, "SEVEN ACTS OF COLLAPSE.  SEVEN ACTS OF FLIGHT.", font_title, WHITE_COLOR, S)
    draw_centered_text(draw, by + 65, "“what shatters can reform in light”", font_sub, GOLD_COLOR, S)
    draw_centered_text(draw, by + 120, "Reverses gravity, palette, soundtrack, and story meaning.", font_badge, MUTED_COLOR, S)
    
    base.save("public/social/post-02-duality.jpg", "JPEG", quality=95)
    print("Saved public/social/post-02-duality.jpg")

# =========================================================================
# 5. LANDSCAPE TWITTER / OPEN GRAPH BANNER (1200x630)
# =========================================================================
def generate_landscape_og():
    print("Generating Landscape Twitter / OG Preview (1200x630)...")
    W, H = 1200, 630
    base = Image.new("RGB", (W, H), BG_COLOR)
    
    # Load square art on the right with soft blend to dark left
    art = Image.open("public/social/post_clean.jpg").convert("RGB")
    art_h = H
    art_w = H # 630x630
    art_res = art.resize((art_w, art_h), Image.Resampling.LANCZOS)
    
    base.paste(art_res, (W - art_w, 0))
    
    # Gradient fade from right to left
    fade = Image.new("RGBA", (W, H), (3, 3, 6, 0))
    fdraw = ImageDraw.Draw(fade)
    fade_start = W - art_w - 60
    fade_end = W - 150
    for x in range(fade_start, fade_end):
        progress = (x - fade_start) / (fade_end - fade_start)
        a = int(255 * (1.0 - progress))
        fdraw.line([(x, 0), (x, H)], fill=(3, 3, 6, a))
    fdraw.rectangle([0, 0, fade_start, H], fill=(3, 3, 6, 255))
    base.paste(fade, (0, 0), fade)
    
    draw = ImageDraw.Draw(base)
    
    font_badge = ImageFont.truetype(MONO_FONT_PATH, 16)
    font_title = ImageFont.truetype(SERIF_FONT_PATH, 50)
    font_sub = ImageFont.truetype(MONO_FONT_PATH, 20)
    font_desc = ImageFont.truetype(SANS_FONT_PATH, 20)
    font_quote = ImageFont.truetype(SERIF_REG_PATH, 22)
    
    # Left Content
    lx = 80
    # Pill
    draw_pill(draw, lx, 75, "INTERACTIVE WEB STORY", font_badge, (15, 18, 26), CYAN_COLOR, pad_x=18, pad_y=8, border=(50, 60, 80))
    
    # Title
    draw.text((lx, 140), "PALINDROME", font=font_title, fill=WHITE_COLOR)
    draw.text((lx, 200), "OF A FALL", font=font_title, fill=GOLD_COLOR)
    draw.text((lx, 275), "FALLING  VS.  FLYING", font=font_sub, fill=CYAN_COLOR)
    
    # Description
    draw.text((lx, 330), "Scroll down through seven acts of collapse.", font=font_desc, fill=WHITE_COLOR)
    draw.text((lx, 362), "Scroll back up to watch the same story turn to gold.", font=font_desc, fill=GOLD_COLOR)
    draw.text((lx, 415), "“what shatters can reform in light”", font=font_quote, fill=MUTED_COLOR)
    
    # Footer badges
    by = 505
    b1 = draw_pill(draw, lx, by, "44.8K PARTICLES", font_badge, (20, 20, 26), WHITE_COLOR, pad_x=16, pad_y=8)
    b2 = draw_pill(draw, b1[2] + 20, by, "SOUND DESIGN", font_badge, (20, 20, 26), GOLD_COLOR, pad_x=16, pad_y=8)
    draw_pill(draw, b2[2] + 20, by, "LENIS + GSAP", font_badge, (20, 20, 26), CYAN_COLOR, pad_x=16, pad_y=8)
    
    base.save("public/social/landscape-twitter-og.jpg", "JPEG", quality=95)
    print("Saved public/social/landscape-twitter-og.jpg")

if __name__ == "__main__":
    generate_story_01()
    generate_story_02()
    generate_post_01()
    generate_post_02()
    generate_landscape_og()
    print("All social media assets generated successfully!")
