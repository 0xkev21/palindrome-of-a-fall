import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import os
import math

WIDTH = 1920
HEIGHT = 1080

def create_base(bg_color=(2, 3, 6)):
    return Image.new('RGB', (WIDTH, HEIGHT), bg_color)

def add_glow_circle(img, cx, cy, radius, color, intensity=1.0):
    overlay = Image.new('RGBA', (WIDTH, HEIGHT), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    r, g, b = color
    # Draw multiple concentric circles with increasing blur
    for factor in [1.0, 0.7, 0.4, 0.2]:
        rad = int(radius * factor)
        alpha = int(min(255, 255 * intensity * (1.2 - factor)))
        draw.ellipse([cx - rad, cy - rad, cx + rad, cy + rad], fill=(r, g, b, alpha))
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=int(radius * 0.4)))
    img.paste(Image.alpha_composite(img.convert('RGBA'), overlay).convert('RGB'))

def add_radial_gradient(img, cx, cy, max_radius, inner_color, outer_color):
    arr = np.array(img).astype(np.float32)
    y, x = np.ogrid[:HEIGHT, :WIDTH]
    dist = np.sqrt((x - cx)**2 + (y - cy)**2)
    t = np.clip(dist / max_radius, 0.0, 1.0)
    
    r_grad = inner_color[0] * (1.0 - t) + outer_color[0] * t
    g_grad = inner_color[1] * (1.0 - t) + outer_color[1] * t
    b_grad = inner_color[2] * (1.0 - t) + outer_color[2] * t
    
    grad = np.stack([r_grad, g_grad, b_grad], axis=2)
    blended = np.maximum(arr, grad)
    return Image.fromarray(np.clip(blended, 0, 255).astype(np.uint8))

def add_light_shafts(draw, cx, cy, angles, length, color, width=4):
    for ang in angles:
        rad = math.radians(ang)
        ex = cx + math.cos(rad) * length
        ey = cy + math.sin(rad) * length
        draw.line([(cx, cy), (ex, ey)], fill=color, width=width)

# ==============================================================
# ACT 1: ROOFTOP VIGIL
# ==============================================================
def gen_act1_desc():
    img = create_base((2, 3, 8))
    # Ambient volumetric city glow from bottom
    img = add_radial_gradient(img, WIDTH // 2, HEIGHT + 200, HEIGHT * 1.2, (10, 45, 90), (0, 2, 6))
    draw = ImageDraw.Draw(img)

    # Dystopian skyscraper silhouettes with glowing neon rim lines
    np.random.seed(42)
    # Background skyscrapers
    for x in range(0, WIDTH, 75):
        w = np.random.randint(50, 110)
        h = np.random.randint(350, 750)
        top = HEIGHT - h
        draw.rectangle([x, top, x + w, HEIGHT], fill=(4, 8, 16))
        # Cyan / Blue rim light
        draw.line([(x, top), (x + w, top)], fill=(0, 210, 255), width=2)
        draw.line([(x, top), (x, HEIGHT)], fill=(0, 140, 220), width=1)
        draw.line([(x + w, top), (x + w, HEIGHT)], fill=(0, 90, 180), width=1)
        # Windows
        for wy in range(top + 30, HEIGHT - 50, 25):
            for wx in range(x + 10, x + w - 10, 16):
                if np.random.rand() > 0.4:
                    col = (0, 220, 255) if np.random.rand() > 0.3 else (255, 200, 100)
                    draw.rectangle([wx, wy, wx + 4, wy + 8], fill=col)

    # Foreground massive rooftop ledge
    draw.polygon([(0, HEIGHT - 180), (WIDTH * 0.45, HEIGHT - 240), (WIDTH * 0.55, HEIGHT - 240), (WIDTH, HEIGHT - 180), (WIDTH, HEIGHT), (0, HEIGHT)], fill=(8, 12, 22))
    draw.line([(0, HEIGHT - 180), (WIDTH * 0.45, HEIGHT - 240)], fill=(0, 240, 255), width=4)
    draw.line([(WIDTH * 0.45, HEIGHT - 240), (WIDTH * 0.55, HEIGHT - 240)], fill=(0, 255, 255), width=5)
    draw.line([(WIDTH * 0.55, HEIGHT - 240), (WIDTH, HEIGHT - 180)], fill=(0, 240, 255), width=4)

    # Solitary figure silhouette on the ledge center
    bx, by = WIDTH // 2, HEIGHT - 240
    draw.ellipse([bx - 12, by - 65, bx + 12, by - 41], fill=(2, 4, 8), outline=(0, 230, 255), width=2)
    draw.polygon([(bx - 18, by - 40), (bx + 18, by - 40), (bx + 12, by), (bx - 12, by)], fill=(2, 4, 8), outline=(0, 230, 255), width=2)

    # Falling luminous neon rain
    for _ in range(400):
        rx = np.random.randint(0, WIDTH)
        ry = np.random.randint(0, HEIGHT)
        rlen = np.random.randint(15, 45)
        draw.line([(rx, ry), (rx - 4, ry + rlen)], fill=(0, 180, 255), width=1)

    return img

def gen_act1_asc():
    img = create_base((6, 4, 2))
    # Brilliant golden sunrise glow at horizon
    img = add_radial_gradient(img, WIDTH // 2, HEIGHT - 220, WIDTH * 0.85, (255, 220, 110), (12, 8, 4))
    draw = ImageDraw.Draw(img)

    # Golden light rays erupting across the sky
    cx, cy = WIDTH // 2, HEIGHT - 220
    for ang in range(195, 345, 8):
        rad = math.radians(ang)
        ex = cx + math.cos(rad) * 1200
        ey = cy + math.sin(rad) * 1200
        draw.line([(cx, cy), (ex, ey)], fill=(255, 200, 70), width=3)

    # Spires & city bathed in gold
    np.random.seed(42)
    for x in range(0, WIDTH, 80):
        w = np.random.randint(55, 120)
        h = np.random.randint(300, 680)
        top = HEIGHT - h
        draw.rectangle([x, top, x + w, HEIGHT], fill=(22, 16, 8))
        draw.line([(x, top), (x + w, top)], fill=(255, 215, 0), width=3)
        draw.line([(x, top), (x, HEIGHT)], fill=(245, 160, 20), width=2)
        draw.line([(x + w, top), (x + w, HEIGHT)], fill=(245, 160, 20), width=2)

    # Rooftop platform
    draw.polygon([(0, HEIGHT - 180), (WIDTH * 0.45, HEIGHT - 240), (WIDTH * 0.55, HEIGHT - 240), (WIDTH, HEIGHT - 180), (WIDTH, HEIGHT), (0, HEIGHT)], fill=(32, 22, 10))
    draw.line([(0, HEIGHT - 180), (WIDTH * 0.45, HEIGHT - 240)], fill=(255, 235, 150), width=5)
    draw.line([(WIDTH * 0.45, HEIGHT - 240), (WIDTH * 0.55, HEIGHT - 240)], fill=(255, 255, 200), width=6)
    draw.line([(WIDTH * 0.55, HEIGHT - 240), (WIDTH, HEIGHT - 180)], fill=(255, 235, 150), width=5)

    # Ascending figure silhouette with glowing golden wings
    bx, by = WIDTH // 2, HEIGHT - 260
    # Wing feathers in gold
    draw.polygon([(bx, by - 30), (bx - 120, by - 120), (bx - 40, by - 20)], fill=(255, 215, 0), outline=(255, 255, 220), width=2)
    draw.polygon([(bx, by - 30), (bx + 120, by - 120), (bx + 40, by - 20)], fill=(255, 215, 0), outline=(255, 255, 220), width=2)
    draw.ellipse([bx - 14, by - 70, bx + 14, by - 42], fill=(255, 240, 180))

    # Floating golden stardust
    for _ in range(350):
        sx = np.random.randint(0, WIDTH)
        sy = np.random.randint(0, HEIGHT)
        srad = np.random.randint(2, 5)
        draw.ellipse([sx - srad, sy - srad, sx + srad, sy + srad], fill=(255, 225, 90))

    return img

# ==============================================================
# ACT 2: MONOLITHIC CHASM
# ==============================================================
def gen_act2_desc():
    img = create_base((1, 2, 5))
    draw = ImageDraw.Draw(img)

    # Huge vertical towering monolithic canyon walls on left and right
    # Deep vertical perspective plunging downward
    canyon_top_w = 400
    canyon_bot_w = 180

    # Left brutalist monoliths
    draw.polygon([(0, 0), (canyon_top_w, 0), (canyon_bot_w, HEIGHT), (0, HEIGHT)], fill=(6, 10, 20))
    # Vertical cyan circuit lines
    for i in range(1, 6):
        t = i / 6.0
        x1 = int(canyon_top_w * t)
        x2 = int(canyon_bot_w * t)
        draw.line([(x1, 0), (x2, HEIGHT)], fill=(0, 210, 255), width=2)

    # Right brutalist monoliths
    draw.polygon([(WIDTH, 0), (WIDTH - canyon_top_w, 0), (WIDTH - canyon_bot_w, HEIGHT), (WIDTH, HEIGHT)], fill=(6, 10, 20))
    for i in range(1, 6):
        t = i / 6.0
        x1 = int(WIDTH - canyon_top_w * t)
        x2 = int(WIDTH - canyon_bot_w * t)
        draw.line([(x1, 0), (x2, HEIGHT)], fill=(0, 210, 255), width=2)

    # Central chasm abyss with falling data / light beams
    cx = WIDTH // 2
    for offset in range(-120, 130, 30):
        draw.line([(cx + offset, 0), (cx + offset * 0.4, HEIGHT)], fill=(0, 160, 255), width=1)

    # Horizontal architectural ribs
    for y in range(80, HEIGHT, 110):
        lx = int(canyon_top_w * (1 - y / HEIGHT) + canyon_bot_w * (y / HEIGHT))
        rx = int((WIDTH - canyon_top_w) * (1 - y / HEIGHT) + (WIDTH - canyon_bot_w) * (y / HEIGHT))
        draw.line([(0, y), (lx, y)], fill=(0, 240, 255), width=2)
        draw.line([(rx, y), (WIDTH, y)], fill=(0, 240, 255), width=2)

    return img

def gen_act2_asc():
    img = create_base((4, 3, 1))
    img = add_radial_gradient(img, WIDTH // 2, 0, HEIGHT * 1.1, (255, 230, 130), (10, 6, 2))
    draw = ImageDraw.Draw(img)

    # Golden vertical shafts of sunlight piercing down
    canyon_top_w = 400
    canyon_bot_w = 180

    cx = WIDTH // 2
    for offset in range(-250, 260, 35):
        draw.line([(cx + offset * 0.3, 0), (cx + offset, HEIGHT)], fill=(255, 215, 70), width=4)

    # Left & right canyon walls glowing warm gold on their edges
    draw.polygon([(0, 0), (canyon_top_w, 0), (canyon_bot_w, HEIGHT), (0, HEIGHT)], fill=(20, 14, 6))
    draw.line([(canyon_top_w, 0), (canyon_bot_w, HEIGHT)], fill=(255, 235, 140), width=6)

    draw.polygon([(WIDTH, 0), (WIDTH - canyon_top_w, 0), (WIDTH - canyon_bot_w, HEIGHT), (WIDTH, HEIGHT)], fill=(20, 14, 6))
    draw.line([(WIDTH - canyon_top_w, 0), (WIDTH - canyon_bot_w, HEIGHT)], fill=(255, 235, 140), width=6)

    # Horizontal golden strata lines
    for y in range(80, HEIGHT, 110):
        lx = int(canyon_top_w * (1 - y / HEIGHT) + canyon_bot_w * (y / HEIGHT))
        rx = int((WIDTH - canyon_top_w) * (1 - y / HEIGHT) + (WIDTH - canyon_bot_w) * (y / HEIGHT))
        draw.line([(0, y), (lx, y)], fill=(255, 200, 50), width=3)
        draw.line([(rx, y), (WIDTH, y)], fill=(255, 200, 50), width=3)

    return img

# ==============================================================
# ACT 3: THE SUSPENDED CAGE
# ==============================================================
def gen_act3_desc():
    img = create_base((2, 2, 5))
    draw = ImageDraw.Draw(img)

    # Giant gothic iron birdcage hanging in pitch-black space
    cx, cy = WIDTH // 2, HEIGHT // 2 - 20
    cw, ch = 380, 520

    # Hanging chain from top
    draw.line([(cx, 0), (cx, cy - ch // 2)], fill=(0, 200, 240), width=6)

    # Cage dome
    draw.arc([cx - cw // 2, cy - ch // 2, cx + cw // 2, cy - ch // 2 + 180], 180, 360, fill=(0, 230, 255), width=5)

    # Cage vertical bars
    for x in range(cx - cw // 2, cx + cw // 2 + 1, 38):
        draw.line([(x, cy - ch // 2 + 90), (x, cy + ch // 2)], fill=(0, 210, 255), width=3)

    # Cage horizontal rims
    draw.ellipse([cx - cw // 2, cy + ch // 2 - 30, cx + cw // 2, cy + ch // 2 + 30], outline=(0, 240, 255), width=5)
    draw.ellipse([cx - cw // 2, cy - 30, cx + cw // 2, cy + 30], outline=(0, 180, 230), width=3)

    # Trapped figure silhouette clutching bars inside
    draw.ellipse([cx - 16, cy - 30, cx + 16, cy], fill=(0, 160, 220))
    draw.rectangle([cx - 12, cy, cx + 12, cy + 80], fill=(0, 140, 200))

    return img

def gen_act3_asc():
    img = create_base((5, 3, 1))
    img = add_radial_gradient(img, WIDTH // 2, HEIGHT // 2, 600, (255, 225, 120), (12, 6, 2))
    draw = ImageDraw.Draw(img)

    # Exploding shattered cage with brilliant golden shards radiating outward
    cx, cy = WIDTH // 2, HEIGHT // 2
    np.random.seed(99)

    for ang in range(0, 360, 12):
        rad = math.radians(ang)
        dist = np.random.randint(180, 550)
        ex = cx + math.cos(rad) * dist
        ey = cy + math.sin(rad) * dist
        draw.line([(cx, cy), (ex, ey)], fill=(255, 220, 60), width=3)
        # Broken bar segment
        bx1 = ex + math.cos(rad + 0.5) * 40
        by1 = ey + math.sin(rad + 0.5) * 40
        draw.line([(ex, ey), (bx1, by1)], fill=(255, 245, 180), width=5)

    # Triumphant golden soaring figure at the core
    draw.polygon([(cx, cy - 40), (cx - 160, cy - 140), (cx - 50, cy - 20)], fill=(255, 220, 50), outline=(255, 255, 220), width=3)
    draw.polygon([(cx, cy - 40), (cx + 160, cy - 140), (cx + 50, cy - 20)], fill=(255, 220, 50), outline=(255, 255, 220), width=3)
    draw.ellipse([cx - 20, cy - 80, cx + 20, cy - 40], fill=(255, 255, 200))

    return img

# ==============================================================
# ACT 4: COSMIC SILENCE
# ==============================================================
def gen_act4_desc():
    img = create_base((1, 1, 4))
    draw = ImageDraw.Draw(img)

    # Crescent Moon & Constellations in deep black space
    cx, cy = WIDTH * 0.75, HEIGHT * 0.35
    moon_r = 130
    draw.ellipse([cx - moon_r, cy - moon_r, cx + moon_r, cy + moon_r], fill=(0, 210, 255))
    draw.ellipse([cx - moon_r + 45, cy - moon_r - 20, cx + moon_r + 45, cy + moon_r + 20], fill=(1, 1, 4))

    # Constellation geometric nodes & connecting lines
    np.random.seed(77)
    stars = []
    for _ in range(40):
        sx = np.random.randint(80, WIDTH - 80)
        sy = np.random.randint(60, HEIGHT - 60)
        stars.append((sx, sy))
        draw.ellipse([sx - 3, sy - 3, sx + 3, sy + 3], fill=(0, 240, 255))

    for i in range(len(stars) - 1):
        d = math.hypot(stars[i][0] - stars[i+1][0], stars[i][1] - stars[i+1][1])
        if d < 280:
            draw.line([stars[i], stars[i+1]], fill=(0, 140, 220), width=1)

    return img

def gen_act4_asc():
    img = create_base((6, 3, 1))
    img = add_radial_gradient(img, WIDTH // 2, HEIGHT // 2, 750, (255, 220, 90), (14, 8, 2))
    draw = ImageDraw.Draw(img)

    # Supernova solar mandala rings & radiant spiral rays
    cx, cy = WIDTH // 2, HEIGHT // 2
    for r in range(80, 550, 50):
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(255, 215, 60), width=2)

    for ang in range(0, 360, 6):
        rad = math.radians(ang)
        r_out = 650 + math.sin(ang * 4) * 80
        ex = cx + math.cos(rad) * r_out
        ey = cy + math.sin(rad) * r_out
        draw.line([(cx, cy), (ex, ey)], fill=(255, 235, 140), width=2)

    return img

# ==============================================================
# ACT 5: STRESS FRACTURES
# ==============================================================
def gen_act5_desc():
    img = create_base((2, 2, 4))
    draw = ImageDraw.Draw(img)

    # Giant shattering monolithic slabs with glowing electric cyan jagged fissures
    cx, cy = WIDTH // 2, HEIGHT // 2

    # Draw jagged fracture lines across the screen
    np.random.seed(33)
    for _ in range(12):
        cur_x, cur_y = cx + np.random.randint(-150, 150), cy + np.random.randint(-150, 150)
        ang = np.random.uniform(0, math.pi * 2)
        for _ in range(8):
            step = np.random.randint(40, 110)
            ang += np.random.uniform(-0.6, 0.6)
            nx = cur_x + math.cos(ang) * step
            ny = cur_y + math.sin(ang) * step
            draw.line([(cur_x, cur_y), (nx, ny)], fill=(0, 240, 255), width=3)
            # Fracture sparks
            draw.ellipse([nx - 4, ny - 4, nx + 4, ny + 4], fill=(0, 200, 255))
            cur_x, cur_y = nx, ny

    return img

def gen_act5_asc():
    img = create_base((5, 3, 1))
    draw = ImageDraw.Draw(img)

    # Japanese Kintsugi golden veins fusing every fracture together
    cx, cy = WIDTH // 2, HEIGHT // 2
    np.random.seed(33)
    for _ in range(14):
        cur_x, cur_y = cx + np.random.randint(-180, 180), cy + np.random.randint(-180, 180)
        ang = np.random.uniform(0, math.pi * 2)
        for _ in range(9):
            step = np.random.randint(45, 120)
            ang += np.random.uniform(-0.5, 0.5)
            nx = cur_x + math.cos(ang) * step
            ny = cur_y + math.sin(ang) * step
            # Molten 24k gold line with thick inner core
            draw.line([(cur_x, cur_y), (nx, ny)], fill=(255, 190, 30), width=6)
            draw.line([(cur_x, cur_y), (nx, ny)], fill=(255, 255, 200), width=2)
            draw.ellipse([nx - 6, ny - 6, nx + 6, ny + 6], fill=(255, 230, 80))
            cur_x, cur_y = nx, ny

    return img

# ==============================================================
# ACT 6: OBSIDIAN HORIZON
# ==============================================================
def gen_act6_desc():
    img = create_base((1, 2, 6))
    img = add_radial_gradient(img, WIDTH // 2, HEIGHT, 800, (0, 70, 140), (0, 3, 10))
    draw = ImageDraw.Draw(img)

    # Underwater abyssal light tendrils & bioluminescent aquatic waves
    for y in range(HEIGHT // 2, HEIGHT, 45):
        pts = []
        for x in range(0, WIDTH + 40, 40):
            wave_y = y + math.sin(x * 0.01 + y * 0.05) * 35
            pts.append((x, wave_y))
        draw.line(pts, fill=(0, 210, 255), width=2)

    # Bioluminescent jellyfish-like ascending tendrils
    np.random.seed(55)
    for jx in [WIDTH * 0.25, WIDTH * 0.5, WIDTH * 0.75]:
        draw.arc([jx - 60, HEIGHT * 0.4, jx + 60, HEIGHT * 0.4 + 90], 180, 360, fill=(0, 240, 255), width=3)
        for tx in range(int(jx - 45), int(jx + 50), 15):
            draw.line([(tx, HEIGHT * 0.4 + 45), (tx + np.random.randint(-20, 20), HEIGHT * 0.75)], fill=(0, 180, 240), width=1)

    return img

def gen_act6_asc():
    img = create_base((5, 3, 1))
    img = add_radial_gradient(img, WIDTH // 2, 0, HEIGHT * 1.1, (255, 235, 130), (8, 4, 1))
    draw = ImageDraw.Draw(img)

    # Golden ocean surface breach with exploding radiant water spray
    water_y = HEIGHT * 0.4
    draw.line([(0, water_y), (WIDTH, water_y)], fill=(255, 235, 120), width=4)

    # Droplet explosion in gold
    np.random.seed(88)
    for _ in range(400):
        dx = np.random.randint(WIDTH // 4, WIDTH * 3 // 4)
        dy = np.random.randint(80, int(water_y) + 120)
        drad = np.random.randint(2, 6)
        draw.ellipse([dx - drad, dy - drad, dx + drad, dy + drad], fill=(255, 225, 70))

    # Upward shafts of blinding golden daylight
    cx = WIDTH // 2
    for offset in range(-350, 360, 40):
        draw.line([(cx + offset * 0.4, 0), (cx + offset, HEIGHT)], fill=(255, 240, 160), width=4)

    return img

# ==============================================================
# ACT 7: INVERTED BEDROCK
# ==============================================================
def gen_act7_desc():
    img = create_base((1, 2, 4))
    draw = ImageDraw.Draw(img)

    # Obsidian mirror floor with sharp hexagonal crystal monoliths
    bedrock_y = HEIGHT * 0.72
    draw.line([(0, bedrock_y), (WIDTH, bedrock_y)], fill=(0, 220, 255), width=3)

    # Hexagonal obsidian crystal structures
    np.random.seed(66)
    for x in range(80, WIDTH, 130):
        w = np.random.randint(60, 110)
        h = np.random.randint(180, 420)
        top = bedrock_y - h
        draw.polygon([(x, bedrock_y), (x - w//2, bedrock_y - h//3), (x - w//2, top), (x, top - 30), (x + w//2, top), (x + w//2, bedrock_y - h//3)], fill=(4, 8, 16), outline=(0, 220, 255), width=2)
        draw.line([(x, top - 30), (x, bedrock_y)], fill=(0, 240, 255), width=2)

    # Mirror floor grid
    for gx in range(0, WIDTH, 80):
        draw.line([(gx, bedrock_y), (gx + (gx - WIDTH//2) * 0.8, HEIGHT)], fill=(0, 160, 220), width=1)
    for gy in range(int(bedrock_y), HEIGHT, 35):
        draw.line([(0, gy), (WIDTH, gy)], fill=(0, 180, 240), width=1)

    return img

def gen_act7_asc():
    img = create_base((6, 4, 1))
    img = add_radial_gradient(img, WIDTH // 2, HEIGHT * 0.75, 800, (255, 230, 100), (12, 6, 2))
    draw = ImageDraw.Draw(img)

    # Luminous golden launchpad rings erupting upward into the sky
    cx, cy = WIDTH // 2, HEIGHT * 0.75

    # Concentric launchpad ellipses
    for r in range(40, 520, 45):
        draw.ellipse([cx - r * 1.6, cy - r * 0.4, cx + r * 1.6, cy + r * 0.4], outline=(255, 220, 60), width=3)

    # Ascending golden light column
    draw.polygon([(cx - 160, cy), (cx + 160, cy), (cx + 280, 0), (cx - 280, 0)], fill=(255, 215, 60), outline=(255, 255, 200), width=4)

    # Starburst ignition rays
    for ang in range(200, 345, 6):
        rad = math.radians(ang)
        ex = cx + math.cos(rad) * 1100
        ey = cy + math.sin(rad) * 1100
        draw.line([(cx, cy), (ex, ey)], fill=(255, 240, 170), width=3)

    return img

# ==============================================================
# BATCH EXECUTION & SAVING
# ==============================================================
os.makedirs('public/scenes', exist_ok=True)
os.makedirs('dist/scenes', exist_ok=True)

generators = {
    'act1_desc.jpg': gen_act1_desc,
    'act1_asc.jpg': gen_act1_asc,
    'act2_desc.jpg': gen_act2_desc,
    'act2_asc.jpg': gen_act2_asc,
    'act3_desc.jpg': gen_act3_desc,
    'act3_asc.jpg': gen_act3_asc,
    'act4_desc.jpg': gen_act4_desc,
    'act4_asc.jpg': gen_act4_asc,
    'act5_desc.jpg': gen_act5_desc,
    'act5_asc.jpg': gen_act5_asc,
    'act6_desc.jpg': gen_act6_desc,
    'act6_asc.jpg': gen_act6_asc,
    'act7_desc.jpg': gen_act7_desc,
    'act7_asc.jpg': gen_act7_asc,
}

for name, gen in generators.items():
    print(f'Generating {name}...')
    img = gen()
    # Save optimized JPEG
    pub_path = os.path.join('public/scenes', name)
    dist_path = os.path.join('dist/scenes', name)
    img.save(pub_path, 'JPEG', quality=94)
    img.save(dist_path, 'JPEG', quality=94)
    print(f'Saved {pub_path}')

print('All 14 particle-optimized scene textures generated successfully!')
