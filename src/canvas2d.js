import { ParticleImageEngine } from "./particleImageEngine.js";
import { POEM, ROMAN } from "./poem.js";

/**
 * 2D Canvas Cinematic Story Engine
 * Texts are carved directly into brutalist concrete walls in the environment.
 * As the boy falls past, he physically impacts and shatters the walls!
 * Stone shards, chiseled words, and concrete dust fracture apart into the abyss.
 * In Ascent mode, golden kintsugi lightning welds the fractured slabs back together.
 */
export class CanvasStoryEngine {
  constructor(canvas, { reduceMotion = false } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.reduceMotion = reduceMotion;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.time = 0;
    this.scrollProgress = 0;
    this.scrollVelocity = 0;
    this.truthMode = 0;

    this.mouse = { x: this.width / 2, y: this.height / 2, normX: 0, normY: 0 };

    // Water shockwaves
    this.shockwaves = [];

    // Ambient Particles (Slipstream embers)
    this.particleCount = 180;
    this.particles = [];
    this.initParticles();

    // Stone Debris Chips from wall impacts
    this.debrisChips = [];

    // Sound callback
    this.onWallHit = null;

    // Camera shake (wall impacts), full-frame flash and kintsugi crack burst (inversion)
    this.shake = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.flash = 0;
    this.cracks = [];
    this.crackStart = -1;

    // Procedural Speed Streaks (Replacing clouds with high-speed vertical slipstream lines)
    this.streaks = [];
    this.initSlipstream();

    // Floating Brutalist Background Monoliths (Atmospheric depth pillars)
    this.monoliths = [];
    this.initMonoliths();

    // Full-Screen Image-to-Particles Physics Engine (Images themselves ARE the particles)
    this.particleImageEngine = new ParticleImageEngine();
    // (reduced motion keeps the artwork but stops the ambient flutter/scatter)
    this.particleImageEngine.motionScale = this.reduceMotion ? 0 : 1;

    // 7 Expanded Monumental Environmental Walls with Chiseled Poetry
    this.walls = [];
    this.initWalls();

    this.resize();
    window.addEventListener("resize", () => {
      this.resize();
      this.initWalls();
      this.initMonoliths();
      this.initSlipstream();
    });
    window.addEventListener("mousemove", (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.normX = (e.clientX / this.width) * 2 - 1;
      this.mouse.normY = (e.clientY / this.height) * 2 - 1;
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.ctx.scale(this.dpr, this.dpr);
  }

  initMonoliths() {
    this.monoliths = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      const depth = 0.2 + (i / count) * 0.8; // 0.2 (distant) to 1.0 (foreground)
      const width = (45 + Math.random() * 85) * depth;
      const height = (180 + Math.random() * 320) * depth;
      const progress = (i / count) * 0.95 + (Math.random() - 0.5) * 0.08;
      const side = Math.random() < 0.5 ? -1 : 1;
      const lateralDist = 0.25 + Math.random() * 0.28; // placed on left & right sides
      this.monoliths.push({
        depth,
        width,
        height,
        progress,
        side,
        lateralDist,
        tilt: (Math.random() - 0.5) * 0.12,
        rotSpeed: (Math.random() - 0.5) * 0.03,
      });
    }
  }

  initWalls() {
    const w = this.width;
    const isMobile = w < 640;
    const slabW = isMobile
      ? Math.min(460, Math.max(280, w * 0.9))
      : Math.min(980, Math.max(360, w * 0.82));
    const slabH = isMobile
      ? Math.min(185, Math.max(130, slabW * 0.28))
      : Math.min(210, Math.max(165, slabW * 0.22));

    // The seven lines of the palindrome poem. The words never change between
    // modes — only the reading direction (and therefore the meaning) does.
    const wallDefs = POEM.map((entry, i) => ({
      progress: entry.progress,
      text: entry.line.toUpperCase(),
      numeral: ROMAN[i],
      sub: `ACT ${ROMAN[i]} // ${entry.act.toUpperCase()}`,
      subAsc: `READ RISING // LINE ${ROMAN[POEM.length - 1 - i]} OF VII`,
      side: entry.side,
    }));

    this.walls = wallDefs.map((def) => {
      // Split each slab into 10 polygonal fracture chunks (3 cols x 3 rows with jittered vertices)
      const chunks = [];
      const cols = 4;
      const rows = 2;
      const cellW = slabW / cols;
      const cellH = slabH / rows;

      // Generate jittered grid points
      const points = [];
      for (let r = 0; r <= rows; r++) {
        points[r] = [];
        for (let c = 0; c <= cols; c++) {
          const jitterX =
            c === 0 || c === cols ? 0 : (Math.random() - 0.5) * cellW * 0.45;
          const jitterY =
            r === 0 || r === rows ? 0 : (Math.random() - 0.5) * cellH * 0.45;
          points[r][c] = {
            x: -slabW / 2 + c * cellW + jitterX,
            y: -slabH / 2 + r * cellH + jitterY,
          };
        }
      }

      // Create polygonal chunks
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const poly = [
            points[r][c],
            points[r][c + 1],
            points[r + 1][c + 1],
            points[r + 1][c],
          ];
          const cx = (poly[0].x + poly[1].x + poly[2].x + poly[3].x) / 4;
          const cy = (poly[0].y + poly[1].y + poly[2].y + poly[3].y) / 4;
          const dist = Math.hypot(cx, cy) || 1;
          const dirX = cx / dist;
          const dirY = cy / dist;

          chunks.push({
            poly,
            cx,
            cy,
            dirX,
            dirY,
            rotSpeed: (Math.random() - 0.5) * 0.6,
            scatterDist: 80 + Math.random() * 120,
          });
        }
      }

      return {
        ...def,
        width: slabW,
        height: slabH,
        chunks,
        hasTriggeredCrack: false,
      };
    });
  }

  initSlipstream() {
    this.streaks = [];
    const count = 42;
    for (let i = 0; i < count; i++) {
      this.streaks.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        len: 30 + Math.random() * 85,
        speed: 2.2 + Math.random() * 4.5,
        alpha: 0.08 + Math.random() * 0.22,
      });
    }
  }

  initParticles() {
    this.particles = [];
    for (let i = 0; i < this.particleCount; i++) {
      // Spread across the boy's entire freefall body (-170px shoes to +160px hair)
      const bodyX = (Math.random() - 0.5) * 340;
      const bodyY =
        Math.sin((bodyX / 170) * 1.5) * 20 + (Math.random() - 0.5) * 45;
      this.particles.push({
        x: bodyX,
        y: bodyY,
        baseX: bodyX,
        baseY: bodyY,
        vx: (Math.random() - 0.5) * 2.2,
        vy: 1.2 + Math.random() * 2.8,
        size: 1.6 + Math.random() * 2.2,
        life: Math.random(),
        maxLife: 0.6 + Math.random() * 0.8,
        speed: 0.007 + Math.random() * 0.015,
        wingT: Math.random(),
        side: Math.random() < 0.5 ? -1 : 1,
      });
    }
  }

  /**
   * The moment of inversion at bedrock: a gold flash, a shockwave through the
   * particle artwork, and kintsugi seams racing outward from the boy as if the
   * frame itself cracked — and was immediately mended in gold.
   */
  triggerInversion() {
    this.flash = this.reduceMotion ? 0.35 : 0.85;
    this.particleImageEngine.pulse(1.0);
    this.cracks = [];
    const branches = this.width < 640 ? 9 : 14;
    const reach = Math.hypot(this.width, this.height) * 0.62;
    for (let b = 0; b < branches; b++) {
      let angle = (b / branches) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const pts = [{ x: 0, y: 0 }];
      let x = 0,
        y = 0;
      const steps = 9 + Math.floor(Math.random() * 6);
      for (let i = 0; i < steps; i++) {
        angle += (Math.random() - 0.5) * 0.7;
        const len = (reach / steps) * (0.6 + Math.random() * 0.8);
        x += Math.cos(angle) * len;
        y += Math.sin(angle) * len;
        pts.push({ x, y });
      }
      this.cracks.push({
        pts,
        width: 0.8 + Math.random() * 1.8,
        delay: Math.random() * 0.25,
      });
    }
    this.crackStart = this.time;
  }

  triggerImpact() {
    this.particleImageEngine.pulse(0.7);
    this.shake = Math.max(this.shake, this.reduceMotion ? 0 : 1);

    this.shockwaves.push({
      radius: 6,
      maxRadius: Math.max(this.width, this.height) * 0.75,
      alpha: 1.0,
    });
  }

  spawnDebris(x, y, count = 16) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      this.debrisChips.push({
        x: x + (Math.random() - 0.5) * 80,
        y: y + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + 2,
        size: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.2,
        alpha: 1.0,
      });
    }
  }

  update(time, scrollProgress, scrollVelocity, truthMode) {
    this.time = time;
    this.scrollProgress = scrollProgress;
    this.scrollVelocity = scrollVelocity;
    this.truthMode = truthMode;

    const figX = this.width * 0.5 + this.mouse.normX * 18;
    const figY = this.height * 0.48 + Math.sin(time * 1.5) * 6;

    this.particleImageEngine.update(
      time,
      scrollProgress,
      scrollVelocity,
      truthMode,
      this.mouse.x,
      this.mouse.y,
      figX,
      figY,
      this.width,
      this.height,
    );
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const t = this.time;
    const p = this.scrollProgress;
    const truth = this.truthMode;

    ctx.save();

    // Camera shake: decaying random offset applied to the whole frame
    this.shake *= 0.88;
    if (this.shake < 0.01) this.shake = 0;
    this.shakeX = (Math.random() - 0.5) * 18 * this.shake;
    this.shakeY = (Math.random() - 0.5) * 14 * this.shake;
    ctx.translate(this.shakeX, this.shakeY);

    // 1. Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (truth > 0.01) {
      skyGrad.addColorStop(0, "#1c150c");
      skyGrad.addColorStop(0.35, "#2e1e0d");
      skyGrad.addColorStop(0.7, "#182030");
      skyGrad.addColorStop(1, "#0c1018");
    } else {
      skyGrad.addColorStop(0, "#040711");
      skyGrad.addColorStop(0.35, "#0b1324");
      skyGrad.addColorStop(0.7, "#131e36");
      skyGrad.addColorStop(1, "#050810");
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Central Directional Arrow Light Shaft (Inverted between Descent and Ascent)
    // DESCENT (truth = 0): Points DOWNWARDS (wide at top, tapering down to arrow tip into abyss)
    // ASCENT (truth = 1): Points UPWARDS (wide at bottom, tapering up to arrow tip into zenith sky)
    const shaftCenterX = w * 0.5 + this.mouse.normX * 14;

    const topHalfW = (1 - truth) * (w * 0.4) + truth * 28;
    const botHalfW = (1 - truth) * 28 + truth * (w * 0.4);
    // In ascent the shaft keeps widening to the bottom edge of the frame and fades
    // into the mirror floor — otherwise its wide base ends on a hard, truncated edge.
    const beamBottomY = truth > 0.05 ? h : h * 0.88;

    ctx.save();

    let beamGrad;
    if (truth > 0.05) {
      beamGrad = ctx.createLinearGradient(0, h, 0, 0);
      beamGrad.addColorStop(0, "rgba(245, 158, 11, 0)");
      beamGrad.addColorStop(0.18, `rgba(245, 158, 11, ${truth * 0.05})`);
      beamGrad.addColorStop(0.55, `rgba(251, 191, 36, ${truth * 0.12})`);
      beamGrad.addColorStop(1, `rgba(254, 240, 138, ${truth * 0.28})`);
    } else {
      beamGrad = ctx.createLinearGradient(0, 0, 0, h * 0.88);
      beamGrad.addColorStop(0, "rgba(215, 235, 255, 0.17)");
      beamGrad.addColorStop(0.5, "rgba(125, 160, 215, 0.06)");
      beamGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
    }
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(shaftCenterX - topHalfW, 0);
    ctx.lineTo(shaftCenterX + topHalfW, 0);
    ctx.lineTo(shaftCenterX + botHalfW, beamBottomY);
    ctx.lineTo(shaftCenterX - botHalfW, beamBottomY);
    ctx.closePath();
    ctx.fill();

    // Architectural Vector Chevron Lines
    if (truth > 0.05) {
      // Fade the legs out just above the mirror so they dissolve into the floor
      const legBase = 0.15 + truth * 0.25;
      const legGrad = ctx.createLinearGradient(0, h * 0.8, 0, 0);
      legGrad.addColorStop(0, "rgba(251, 191, 36, 0)");
      legGrad.addColorStop(0.35, `rgba(251, 191, 36, ${legBase * 0.4})`);
      legGrad.addColorStop(1, `rgba(251, 191, 36, ${legBase})`);
      ctx.strokeStyle = legGrad;
    } else {
      ctx.strokeStyle = "rgba(147, 165, 207, 0.2)";
    }
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(shaftCenterX - topHalfW, 0);
    ctx.lineTo(shaftCenterX - botHalfW, beamBottomY);
    ctx.moveTo(shaftCenterX + topHalfW, 0);
    ctx.lineTo(shaftCenterX + botHalfW, beamBottomY);
    ctx.stroke();

    // Directional chevron indicator (arrowhead) in slipstream:
    // Points DOWN in descent, inverts to UP in ascent!
    const chevronY = (1 - truth) * (h * 0.68) + truth * (h * 0.24);
    const chevronW = 46;
    const chevronH = (1 - truth) * 22 - truth * 22; // Inverted!
    ctx.strokeStyle =
      truth > 0.05 ? "rgba(251, 191, 36, 0.45)" : "rgba(215, 235, 255, 0.3)";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.moveTo(shaftCenterX - chevronW, chevronY - chevronH);
    ctx.lineTo(shaftCenterX, chevronY);
    ctx.lineTo(shaftCenterX + chevronW, chevronY - chevronH);
    ctx.stroke();
    ctx.restore();

    // Boy's screen focal center for wake collision & focal drift
    const figX = w * 0.5 + this.mouse.normX * 18;
    const figY = h * 0.48 + Math.sin(t * 1.5) * 6;

    // 3. High-Speed Vertical Slipstream Streaks (Clean editorial motion)
    this.renderSlipstreamStreaks(ctx, w, h, truth);

    // 3b. Monumental outlined act numerals drifting at half parallax behind everything
    this.renderActNumerals(ctx, w, h, p, truth);

    // 4. Distant Brutalist Monolith Pillars (Multi-layered atmospheric architecture)
    this.renderMonoliths(ctx, w, h, p, truth, t, false);

    // 5. 7 Monumental Environmental Chapters with Chiseled Poetry (Text boxes / slabs in environment)
    this.renderFracturingWalls(ctx, w, h, p, truth);

    // 6. Near-Field Foreground Monoliths (Framing the descent)
    this.renderMonoliths(ctx, w, h, p, truth, t, true);

    // 7. Full-Screen Image-to-Particles Scene (Rendered ABOVE the text boxes so particles are completely visible!)
    this.particleImageEngine.render(ctx, w, h, truth);

    // 8. Water Mirror Floor at 100% descent
    this.renderWaterMirror(ctx, w, h, p, truth);

    // 9. Flying Debris & Stone Dust
    this.renderDebris(ctx);

    // 10. Dynamic Slipstream Particles on the Boy
    this.renderParticles(ctx, figX, figY, truth, t);

    // 11. Shockwaves on Mirror Impact
    this.renderShockwaves(ctx, w, h);

    // 12. Kintsugi crack burst + inversion flash
    this.renderKintsugiBurst(ctx, figX, figY, t);
    if (this.flash > 0.005) {
      ctx.fillStyle = `rgba(255, 238, 190, ${this.flash})`;
      ctx.fillRect(-20, -20, w + 40, h + 40);
      this.flash *= 0.9;
    }

    ctx.restore();
  }

  renderActNumerals(ctx, w, h, p, truth) {
    const boyY = h * 0.48;
    const totalTravel = h * 11.0;
    const size = Math.min(w * 0.42, h * 0.62);

    ctx.save();
    ctx.font = `400 ${size}px "Cinzel", serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.letterSpacing = "0em";
    ctx.lineWidth = 1;

    this.walls.forEach((wall) => {
      // Numerals travel at 55% of the walls' speed so they lag behind like distant signage
      const y = boyY + (wall.progress - p) * totalTravel * 0.55;
      if (y < -size || y > h + size) return;
      const focus = 1 - Math.min(1, Math.abs(y - boyY) / (h * 0.9));
      const alpha = 0.05 + focus * 0.13;
      ctx.strokeStyle =
        truth > 0.05
          ? `rgba(251, 191, 36, ${alpha * 1.2})`
          : `rgba(170, 190, 230, ${alpha})`;
      ctx.strokeText(wall.numeral, w * 0.5 + this.mouse.normX * -30, y);
    });
    ctx.restore();
  }

  renderKintsugiBurst(ctx, cx, cy, t) {
    if (this.crackStart < 0 || this.cracks.length === 0) return;
    const age = t - this.crackStart;
    const grow = Math.min(1, age / 1.1);
    const fade = age < 1.6 ? 1 : Math.max(0, 1 - (age - 1.6) / 2.2);
    if (fade <= 0) {
      this.cracks = [];
      this.crackStart = -1;
      return;
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(251, 191, 36, 0.9)";
    ctx.shadowBlur = 14;

    for (const crack of this.cracks) {
      const local = Math.max(
        0,
        Math.min(1, (grow - crack.delay) / (1 - crack.delay)),
      );
      if (local <= 0) continue;
      const eased = 1 - Math.pow(1 - local, 3);
      const segs = crack.pts.length - 1;
      const reach = eased * segs;

      ctx.strokeStyle = `rgba(254, 222, 120, ${0.85 * fade})`;
      ctx.lineWidth = crack.width;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let i = 1; i <= segs; i++) {
        const a = crack.pts[i - 1];
        const b = crack.pts[i];
        if (i <= reach) {
          ctx.lineTo(b.x, b.y);
        } else {
          const f = reach - (i - 1);
          if (f > 0) ctx.lineTo(a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f);
          break;
        }
      }
      ctx.stroke();
    }
    ctx.restore();
  }

  renderMonoliths(ctx, w, h, p, truth, t, isForeground) {
    const boyY = h * 0.48;
    const totalTravel = h * 11.0;

    ctx.save();
    for (let i = 0; i < this.monoliths.length; i++) {
      const m = this.monoliths[i];
      // Foreground monoliths have depth > 0.65; background have depth <= 0.65
      const matchesLayer = isForeground ? m.depth > 0.65 : m.depth <= 0.65;
      if (!matchesLayer) continue;

      // Parallax screen Y based on depth
      const scrollY = (m.progress - p) * totalTravel * (0.6 + m.depth * 0.4);
      const monoY = boyY + scrollY;

      // Skip if offscreen
      if (monoY < -m.height - 100 || monoY > h + m.height + 100) continue;

      const monoX =
        w * 0.5 +
        m.side * (w * m.lateralDist) +
        this.mouse.normX * (15 * m.depth);

      ctx.save();
      ctx.translate(monoX, monoY);
      ctx.rotate(m.tilt + Math.sin(t * 0.5 + i) * m.rotSpeed);

      // Brutalist Concrete Pillar Shading with Ambient Volumetric Occlusion
      const pillarGrad = ctx.createLinearGradient(
        -m.width / 2,
        -m.height / 2,
        m.width / 2,
        m.height / 2,
      );
      if (truth > 0.05) {
        // Ascent: Warm golden obsidian monoliths with sunlight rims
        const darkAlpha = 0.4 + m.depth * 0.5;
        pillarGrad.addColorStop(0, `rgba(45, 34, 22, ${darkAlpha})`);
        pillarGrad.addColorStop(0.5, `rgba(28, 20, 12, ${darkAlpha})`);
        pillarGrad.addColorStop(1, `rgba(16, 11, 7, ${darkAlpha})`);
      } else {
        // Descent: Brutalist cold monolithic concrete pillars
        const darkAlpha = 0.35 + m.depth * 0.55;
        pillarGrad.addColorStop(0, `rgba(32, 38, 48, ${darkAlpha})`);
        pillarGrad.addColorStop(0.5, `rgba(18, 22, 30, ${darkAlpha})`);
        pillarGrad.addColorStop(1, `rgba(8, 11, 16, ${darkAlpha})`);
      }

      ctx.fillStyle = pillarGrad;
      ctx.fillRect(-m.width / 2, -m.height / 2, m.width, m.height);

      // Concrete Formwork Hairline Edges & Seams
      ctx.strokeStyle =
        truth > 0.05
          ? `rgba(251, 191, 36, ${0.12 * m.depth + truth * 0.2})`
          : `rgba(147, 165, 207, ${0.12 * m.depth})`;
      ctx.lineWidth = 1.0;
      ctx.strokeRect(-m.width / 2, -m.height / 2, m.width, m.height);

      // Architectural Cast Joints across monolith height
      const joints = 3;
      for (let j = 1; j < joints; j++) {
        const jointY = -m.height / 2 + (m.height / joints) * j;
        ctx.beginPath();
        ctx.moveTo(-m.width / 2, jointY);
        ctx.lineTo(m.width / 2, jointY);
        ctx.stroke();
      }

      // Minimal Navigational Altitude Markers (matching HUD Zenith / Mirror Floor scale)
      if (m.depth > 0.55) {
        const altK = Math.max(0, Math.min(10, (1 - m.progress) * 10)).toFixed(
          1,
        );
        const label = m.width > 55 ? `${altK}K FT` : `${altK}K`;
        ctx.font = '700 8.5px "Space Mono", monospace';
        ctx.textAlign = "center";
        ctx.letterSpacing = "0.2em";
        ctx.fillStyle =
          truth > 0.05
            ? "rgba(251, 191, 36, 0.4)"
            : "rgba(255, 255, 255, 0.22)";
        ctx.fillText(label, 0, -m.height / 2 + 22);
      }

      ctx.restore();
    }
    ctx.restore();
  }

  renderFracturingWalls(ctx, w, h, p, truth) {
    const boyY = h * 0.48; // Boy's screen position
    const totalTravel = h * 11.0; // Paced cinematic scroll journey for 7 chapters

    this.walls.forEach((wall) => {
      // Calculate current vertical screen position of this wall based on scroll
      const wallScreenY = boyY + (wall.progress - p) * totalTravel;

      // If offscreen by large margin, skip rendering
      if (wallScreenY < -300 || wallScreenY > h + 300) return;

      const wallCenterX = w * 0.5 + wall.side * w + this.mouse.normX * 10;

      // Distance from boy (0 = direct physical impact)
      const distFromBoy = wallScreenY - boyY;

      // Shatter factor:
      // ZERO before touching! Only begins the instant the boy physically hits the wall (distFromBoy <= 0)
      let shatter = 0;
      if (distFromBoy <= 0) {
        shatter = Math.min(1.0, -distFromBoy / 220);
        shatter = Math.pow(shatter, 1.4); // accelerates outward upon collision
      }

      // Sound & debris on impact: triggers exactly when boy contacts the wall
      if (distFromBoy <= 0 && distFromBoy >= -35 && !wall.hasTriggeredCrack) {
        wall.hasTriggeredCrack = true;
        this.spawnDebris(wallCenterX, boyY, 22);
        if (!this.reduceMotion) this.shake = Math.max(this.shake, 0.55);
        this.particleImageEngine.pulse(0.35);
        if (this.onWallHit) this.onWallHit(wall);
      } else if (distFromBoy > 50 && wall.hasTriggeredCrack) {
        wall.hasTriggeredCrack = false;
      }

      // In Ascent mode: Golden kintsugi magnetic pull pulls the shards back together!
      if (truth > 0.05) {
        shatter *= 1.0 - truth * 0.85; // shards realign
      }

      // Shard dissolution: In descent, shattered stone shards gracefully dissolve into dust
      // so broken fragments don't linger permanently at the screen edges.
      // In ascent, shards remain 100% visible and weld back together!
      const wallAlpha =
        truth > 0.05 ? 1.0 : Math.max(0, 1.0 - Math.pow(shatter, 1.5) * 0.94);
      if (wallAlpha < 0.02) return;

      ctx.save();
      ctx.globalAlpha = wallAlpha;
      ctx.translate(wallCenterX, wallScreenY);

      // Render each fractured chunk of the stone slab
      wall.chunks.forEach((chunk) => {
        ctx.save();

        // Displace and tumble chunk based on shatter impact
        const offsetX = chunk.dirX * chunk.scatterDist * shatter;
        const offsetY =
          chunk.dirY * chunk.scatterDist * 0.6 * shatter + shatter * 45;
        const rot = chunk.rotSpeed * shatter;

        ctx.translate(chunk.cx + offsetX, chunk.cy + offsetY);
        ctx.rotate(rot);
        ctx.translate(-chunk.cx, -chunk.cy);

        // Define clipping path for this polygon chunk
        ctx.beginPath();
        chunk.poly.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();
        ctx.clip();

        // 1. Draw Concrete Stone Slab Background
        const slabGrad = ctx.createLinearGradient(
          -wall.width / 2,
          -wall.height / 2,
          wall.width / 2,
          wall.height / 2,
        );
        if (truth > 0.05) {
          slabGrad.addColorStop(0, "#2a2218");
          slabGrad.addColorStop(0.5, "#1e1810");
          slabGrad.addColorStop(1, "#140f0a");
        } else {
          slabGrad.addColorStop(0, "#1c1f26");
          slabGrad.addColorStop(0.5, "#15171d");
          slabGrad.addColorStop(1, "#0e1014");
        }
        ctx.fillStyle = slabGrad;
        ctx.fillRect(
          -wall.width / 2,
          -wall.height / 2,
          wall.width,
          wall.height,
        );

        // 2. Chiseled Architectural Formwork Lines
        ctx.strokeStyle =
          truth > 0.05
            ? "rgba(251, 191, 36, 0.2)"
            : "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(
          -wall.width / 2 + 14,
          -wall.height / 2 + 14,
          wall.width - 28,
          wall.height - 28,
        );

        // Maximum available width inside the architectural slab box
        const maxTextW = wall.width - 70;

        // 3. Subtitle Chiseled into Stone (Fitted cleanly)
        let subSize = Math.round(Math.min(12, Math.max(9, wall.width * 0.014)));
        ctx.font = `700 ${subSize}px "Space Mono", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.letterSpacing = "0.3em";
        const subText = truth > 0.05 ? wall.subAsc : wall.sub;
        const measuredSubW = ctx.measureText(subText).width;

        if (measuredSubW > maxTextW) {
          subSize = Math.max(
            8,
            Math.floor(subSize * (maxTextW / measuredSubW)),
          );
          ctx.font = `700 ${subSize}px "Space Mono", monospace`;
        }
        ctx.fillStyle =
          truth > 0.05
            ? "rgba(251, 191, 36, 0.7)"
            : "rgba(147, 165, 207, 0.65)";
        ctx.fillText(subText, 0, -wall.height * 0.24);

        // 4. Primary Chiseled Poetry Text — identical in both modes (it's a palindrome)
        const displayText = wall.text;
        let targetFontSize = Math.round(
          Math.min(42, Math.max(20, wall.width * 0.046)),
        );
        ctx.font = `700 ${targetFontSize}px "Cinzel", serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.letterSpacing = "0.03em";

        // Measure text and automatically scale down so it never spills outside the slab box!
        const measuredHeadlineW = ctx.measureText(displayText).width;
        if (measuredHeadlineW > maxTextW) {
          targetFontSize = Math.floor(
            targetFontSize * (maxTextW / measuredHeadlineW),
          );
          ctx.font = `700 ${Math.max(14, targetFontSize)}px "Cinzel", serif`;
        }

        if (truth > 0.05) {
          // Ascent Mode: Golden Sunlight Glow on stone
          ctx.fillStyle = "#fef08a";
          ctx.fillText(displayText, 0, wall.height * 0.1);
        } else {
          // Descent Mode: High-fashion silver-white chiseled in relief
          ctx.fillStyle = "#ffffff";
          ctx.fillText(displayText, 0, wall.height * 0.1);
        }

        ctx.restore(); // Undo chunk clip & transform

        // 5. Physically Matched Fracture Edges for Every Chunk
        // All fracture lines are locked directly to each chunk's real polygon boundary
        ctx.save();
        ctx.translate(chunk.cx + offsetX, chunk.cy + offsetY);
        ctx.rotate(rot);
        ctx.translate(-chunk.cx, -chunk.cy);

        ctx.beginPath();
        chunk.poly.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.closePath();

        if (truth > 0.05) {
          // Ascent Mode: Golden kintsugi lightning seams along chunk joints
          ctx.strokeStyle = `rgba(251, 191, 36, ${truth * 0.85})`;
          ctx.lineWidth = 2.0;
          ctx.stroke();
        } else if (shatter > 0.01) {
          // Descent Mode: Broken concrete fracture perimeter
          // ONLY drawn when the boy has physically touched and shattered the wall!
          const crackAlpha = Math.max(0.1, 0.85 - shatter * 0.7);
          ctx.strokeStyle = `rgba(230, 238, 250, ${crackAlpha * 0.55})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
        ctx.restore();
      });

      ctx.restore();
    });
  }

  renderSlipstreamStreaks(ctx, w, h, truth) {
    ctx.save();
    const vel = Math.max(1.2, Math.abs(this.scrollVelocity * 2.2));
    ctx.lineWidth = 1.0;

    for (let i = 0; i < this.streaks.length; i++) {
      const s = this.streaks[i];
      // In descent: streaks travel upward to simulate falling down!
      // In ascent: streaks travel downward to simulate flying up!
      const dir = truth > 0.05 ? 1 : -1;
      s.y += s.speed * vel * dir;

      if (s.y < -120) s.y = h + 120;
      if (s.y > h + 120) s.y = -120;

      ctx.strokeStyle =
        truth > 0.05
          ? `rgba(251, 191, 36, ${s.alpha * (0.4 + truth * 0.5)})`
          : `rgba(215, 235, 255, ${s.alpha * 0.9})`;

      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x, s.y + s.len * (dir * -1));
      ctx.stroke();
    }
    ctx.restore();
  }

  renderWaterMirror(ctx, w, h, p, truth) {
    const waterAlpha = Math.max(0, Math.min(1, (p - 0.75) / 0.2));
    if (waterAlpha <= 0.01) return;

    ctx.save();
    const waterY = h * 0.82;

    const waterGrad = ctx.createLinearGradient(0, waterY, 0, h);
    if (truth > 0.01) {
      waterGrad.addColorStop(0, `rgba(251, 191, 36, ${waterAlpha * 0.32})`);
      waterGrad.addColorStop(1, `rgba(160, 75, 8, ${waterAlpha * 0.8})`);
    } else {
      waterGrad.addColorStop(0, `rgba(147, 185, 235, ${waterAlpha * 0.25})`);
      waterGrad.addColorStop(1, `rgba(6, 10, 20, ${waterAlpha * 0.95})`);
    }
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, waterY, w, h - waterY);

    ctx.strokeStyle =
      truth > 0.01
        ? `rgba(251, 191, 36, ${waterAlpha * 0.7})`
        : `rgba(255, 255, 255, ${waterAlpha * 0.4})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, waterY);
    ctx.lineTo(w, waterY);
    ctx.stroke();

    for (let i = 0; i < 3; i++) {
      const r = (this.time * 24 + i * 45) % 190;
      const rAlpha = Math.max(0, (1 - r / 190) * waterAlpha * 0.35);
      ctx.strokeStyle =
        truth > 0.01
          ? `rgba(251, 191, 36, ${rAlpha})`
          : `rgba(200, 225, 255, ${rAlpha})`;
      ctx.beginPath();
      ctx.ellipse(w / 2, waterY + 22, r * 1.7, r * 0.24, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  renderDebris(ctx) {
    ctx.save();
    for (let i = this.debrisChips.length - 1; i >= 0; i--) {
      const d = this.debrisChips[i];
      d.x += d.vx;
      d.y += d.vy;
      d.rot += d.rotSpeed;
      d.alpha *= 0.96;

      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      ctx.fillStyle = `rgba(220, 225, 235, ${d.alpha})`;
      ctx.fillRect(-d.size / 2, -d.size / 2, d.size, d.size);
      ctx.restore();

      if (d.alpha < 0.02) {
        this.debrisChips.splice(i, 1);
      }
    }
    ctx.restore();
  }

  renderParticles(ctx, figX, figY, truth, t) {
    ctx.save();

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.life += p.speed;
      if (p.life > p.maxLife) {
        p.life = 0;
        // Re-spawn spread widely across the boy's freefall body (-170px to +160px)
        const bodyX = (Math.random() - 0.5) * 340;
        const bodyY =
          Math.sin((bodyX / 170) * 1.5) * 20 + (Math.random() - 0.5) * 45;
        p.x = bodyX;
        p.y = bodyY;
        p.vx = (Math.random() - 0.5) * 2.2;
      }

      let drawX, drawY, color, alpha;
      const descColors = ["#00f0ff", "#38bdf8", "#7dd3fc", "#e0f2fe"];
      const ascColors = ["#fbbf24", "#ffd700", "#f59e0b", "#fffbeb"];

      if (truth > 0.5) {
        const span = 40 + p.wingT * 180;
        const arch = Math.sin(p.wingT * Math.PI * 0.85) * 75;
        const flapOffset = Math.sin(t * 3.2 + p.wingT * 2.0) * 16;

        drawX = figX + p.side * span + Math.sin(t * 5 + i) * 6;
        drawY = figY - 20 - arch + flapOffset + p.y * 0.5;

        color = ascColors[i % ascColors.length];
        alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.85 * truth;
      } else {
        // Disperse outward and float upward in the wake of the fall
        p.y -= p.vy * 0.9;
        p.x += p.vx + Math.sin(t * 2.2 + i * 0.4) * 0.9;

        drawX = figX + p.x;
        drawY = figY + p.y;

        color = descColors[i % descColors.length];
        // Smooth sine fade-in and fade-out matching background stardust
        const progress = Math.min(1, Math.max(0, p.life / p.maxLife));
        alpha = Math.sin(progress * Math.PI) * 0.75;
      }

      ctx.fillStyle = color;
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.beginPath();
      ctx.arc(drawX, drawY, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 1.0;
    ctx.restore();
  }

  renderShockwaves(ctx, w, h) {
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 20;
      sw.alpha *= 0.93;

      ctx.save();
      ctx.strokeStyle = `rgba(251, 191, 36, ${sw.alpha * 0.75})`;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.ellipse(
        w / 2,
        h * 0.82,
        sw.radius,
        sw.radius * 0.3,
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
      ctx.restore();

      if (sw.alpha < 0.01) {
        this.shockwaves.splice(i, 1);
      }
    }
  }
}
