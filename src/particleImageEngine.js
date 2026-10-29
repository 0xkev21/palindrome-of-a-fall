import * as THREE from "three";
import { BoyParticleHalo } from "./boyParticleHalo.js";

/**
 * Three.js GPU Particle Image Engine
 * Transforms high-resolution narrative artwork into 45,000+ interactive 3D light particles.
 *
 * - Pure Particle Point-Cloud: The image ITSELF is composed of thousands of smooth, anti-aliased circular points.
 * - Zero mosaic pixelation: points are tiny (2.2px to 4.2px) with soft Gaussian falloff.
 * - NO artificial circular hole around the boy.
 * - Interactive mouse repulsion & zero-G wave flutter.
 * - GPU-accelerated via Three.js custom vertex and fragment shaders.
 * - Seamless morphing and crossfading between all 7 story acts and Ascent mode.
 */

export class ParticleImageEngine {
  constructor() {
    this.gridX = 260;
    this.gridY = 146;
    this.particleCount = this.gridX * this.gridY; // ~38,000 stardust points (exact 16:9 grid)

    this.scenes = [
      {
        act: 1,
        progress: 0.1,
        descSrc: "/scenes/act1_desc.jpg",
        ascSrc: "/scenes/act1_asc.jpg",
        title: "ACT I // ROOFTOP VIGIL",
        subDesc: "A lone vigil under the suffocating rain.",
        subAsc: "Golden dawn breaks through the tempest.",
      },
      {
        act: 2,
        progress: 0.24,
        descSrc: "/scenes/act2_desc.jpg",
        ascSrc: "/scenes/act2_asc.jpg",
        title: "ACT II // MONOLITHIC CHASM",
        subDesc: "Towering concrete canyons pull downward.",
        subAsc: "Sunlight carves paths through the abyss.",
      },
      {
        act: 3,
        progress: 0.38,
        descSrc: "/scenes/act3_desc.jpg",
        ascSrc: "/scenes/act3_asc.jpg",
        title: "ACT III // THE SUSPENDED CAGE",
        subDesc: "Trapped inside the iron cage of fear.",
        subAsc: "Shattered bars transform into golden flight.",
      },
      {
        act: 4,
        progress: 0.52,
        descSrc: "/scenes/act4_desc.jpg",
        ascSrc: "/scenes/act4_asc.jpg",
        title: "ACT IV // COSMIC SILENCE",
        subDesc: "Silent freefall in the infinite cold void.",
        subAsc: "A solar nebula shockwave ignites the dark.",
      },
      {
        act: 5,
        progress: 0.66,
        descSrc: "/scenes/act5_desc.jpg",
        ascSrc: "/scenes/act5_asc.jpg",
        title: "ACT V // STRESS FRACTURES",
        subDesc: "Concrete and spirit splintering on impact.",
        subAsc: "Kintsugi seams weld every fracture in gold.",
      },
      {
        act: 6,
        progress: 0.8,
        descSrc: "/scenes/act6_desc.jpg",
        ascSrc: "/scenes/act6_asc.jpg",
        title: "ACT VI // OBSIDIAN HORIZON",
        subDesc: "Submerged deep in the freezing ocean abyss.",
        subAsc: "Bursting through the surface into blinding light.",
      },
      {
        act: 7,
        progress: 0.93,
        descSrc: "/scenes/act7_desc.jpg",
        ascSrc: "/scenes/act7_asc.jpg",
        title: "ACT VII // INVERTED BEDROCK",
        subDesc: "The dark mirror bedrock of the fall.",
        subAsc: "The bedrock erupts as a luminous launchpad.",
      },
    ];

    // Texture Cache (with a LoadingManager so the preloader can report real progress)
    this.loadProgress = 0;
    this.onLoadProgress = null;
    this.loadManager = new THREE.LoadingManager();
    this.ready = new Promise((resolve) => {
      this.resolveReady = resolve;
    });
    this.loadManager.onProgress = (_url, loaded, total) => {
      this.loadProgress = total > 0 ? loaded / total : 0;
      if (this.onLoadProgress) this.onLoadProgress(this.loadProgress);
    };
    this.loadManager.onLoad = () => {
      // Pre-warm and initialize all textures on the GPU to prevent any lag/stalls when switching modes
      Object.values(this.textures).forEach((tex) => {
        if (tex && this.renderer) {
          try {
            this.renderer.initTexture(tex);
          } catch (_) {}
        }
      });
      this.loadProgress = 1;
      if (this.onLoadProgress) this.onLoadProgress(1);
      this.resolveReady();
    };
    this.loadManager.onError = (url) => {
      console.warn(`[ParticleImageEngine] Failed to load texture: ${url}`);
    };
    this.textureLoader = new THREE.TextureLoader(this.loadManager);
    this.textures = {};
    this.preloadTextures();

    // Three.js Scene Setup
    this.canvas = document.createElement("canvas");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    this.camera.position.z = 1;

    // Build Point Cloud Geometry & Shader Material
    this.initPointCloud();
    this.boyParticleHalo = new BoyParticleHalo(this.scene);

    this.currentActIdx = 0;
    this.nextActIdx = 0;
    this.transitionWeight = 0;
    this.truth = 0;
    this.scrollVelocity = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.motionScale = 1; // 0 disables ambient motion (prefers-reduced-motion)
    this.waveStart = -1;
    this.waveAmp = 0;
  }

  /** Send a shockwave ring through the point cloud, centred on the boy. */
  pulse(amp = 1) {
    this.waveStart = performance.now();
    this.waveAmp = amp * (this.motionScale > 0 ? 1 : 0.4);
  }

  preloadTextures() {
    this.scenes.forEach((s) => {
      this.textures[`desc_${s.act}`] = this.textureLoader.load(s.descSrc);
      this.textures[`asc_${s.act}`] = this.textureLoader.load(s.ascSrc);
    });
  }

  initPointCloud() {
    const count = this.particleCount;
    const geometry = new THREE.BufferGeometry();

    const uvs = new Float32Array(count * 2);
    const seeds = new Float32Array(count);
    const positions = new Float32Array(count * 3);

    let idx = 0;
    for (let y = 0; y < this.gridY; y++) {
      for (let x = 0; x < this.gridX; x++) {
        const u = x / (this.gridX - 1);
        const v = 1.0 - y / (this.gridY - 1); // texture coordinates

        uvs[idx * 2] = u;
        uvs[idx * 2 + 1] = v;

        seeds[idx] = Math.random();

        positions[idx * 3] = u;
        positions[idx * 3 + 1] = v;
        positions[idx * 3 + 2] = 0;

        idx++;
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aUv", new THREE.BufferAttribute(uvs, 2));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    // Custom Vertex & Fragment Shaders for Pure Particle Image
    this.uniforms = {
      uTexCurrent: { value: this.textures["desc_1"] || null },
      uTexNext: { value: this.textures["desc_1"] || null },
      uTransition: { value: 0.0 },
      uTruth: { value: 0.0 },
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(-999, -999) },
      uScrollVelocity: { value: 0.0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight),
      },
      uGlobalAlpha: { value: 1.0 },
      uMotion: { value: 1.0 },
      uWaveT: { value: -1.0 },
      uWaveAmp: { value: 0.0 },
      uWaveOrigin: { value: new THREE.Vector2(0, 0) },
    };

    const vertexShader = `
      uniform sampler2D uTexCurrent;
      uniform sampler2D uTexNext;
      uniform float uTransition;
      uniform float uTruth;
      uniform float uTime;
      uniform vec2 uMouse;
      uniform float uScrollVelocity;
      uniform vec2 uResolution;
      uniform float uMotion;
      uniform float uWaveT;
      uniform float uWaveAmp;
      uniform vec2 uWaveOrigin;

      attribute vec2 aUv;
      attribute float aSeed;

      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // Responsive Cover Sampling: preserves the exact 16:9 cinematic aspect ratio without stretching on mobile
        float screenAspect = uResolution.x / uResolution.y;
        float texAspect = 16.0 / 9.0;
        vec2 sampleUv = aUv;
        if (screenAspect < texAspect) {
          // Portrait mobile screens: zoom X from center so image remains undistorted
          float scale = screenAspect / texAspect;
          sampleUv.x = (aUv.x - 0.5) * scale + 0.5;
        } else if (screenAspect > texAspect) {
          // Ultra-wide screens: zoom Y from center
          float scale = texAspect / screenAspect;
          sampleUv.y = (aUv.y - 0.5) * scale + 0.5;
        }

        // Sample texture colors
        vec4 colCurr = texture2D(uTexCurrent, sampleUv);
        vec4 colNext = texture2D(uTexNext, sampleUv);
        vec4 col = mix(colCurr, colNext, uTransition);

        // Luminance
        float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));

        // Mode color enrichment: warm golden sunlight in Ascent
        vec3 goldColor = vec3(col.r * 1.15 + 0.15, col.g * 1.05 + 0.10, col.b * 0.70);
        vColor = mix(col.rgb, goldColor, uTruth);

        // Screen coordinate base
        vec3 pos = vec3(aUv.x * uResolution.x, aUv.y * uResolution.y, 0.0);

        // 1. Organic Zero-G Floating Flutter
        float floatSpeed = 1.2 + aSeed * 1.5;
        float waveX = sin(uTime * floatSpeed + aUv.y * 6.0 + aSeed * 6.28) * 4.0;
        float waveY = cos(uTime * (floatSpeed * 0.9) + aUv.x * 5.0 + aSeed * 6.28) * 4.5;
        float waveZ = sin(uTime * 1.4 + aSeed * 10.0) * 8.0;

        pos.x += waveX * uMotion;
        pos.y += waveY * uMotion;
        pos.z += waveZ * uMotion;

        // 2. Vertical Slipstream Velocity Stretch
        pos.y += uScrollVelocity * (0.12 + aSeed * 0.08);

        // 3. Expansive Interactive Pointer Dispersion (Adapts radius to mobile/desktop screens)
        vec2 mouseDist = pos.xy - uMouse;
        float d = length(mouseDist);
        float disperseRadius = min(320.0, max(160.0, uResolution.x * 0.42));
        if (d < disperseRadius && d > 0.0) {
          float normD = d / disperseRadius;
          // Smooth organic cubic falloff for fluid stardust dispersal
          float pushFactor = (1.0 - normD) * (1.0 - normD);
          float push = pushFactor * min(70.0, uResolution.x * 0.15) * uMotion;
          pos.xy += (mouseDist / d) * push;
          pos.z += push * 2.0;
        }

        // 4. Chapter Shift Dispersal — the image obeys the story's gravity:
        // between acts it rains downward while falling, and lifts upward while flying.
        float scatterAmount = sin(uTransition * 3.14159);
        float gravityDir = mix(-1.0, 1.0, uTruth);
        pos.x += sin(aSeed * 25.0) * 22.0 * scatterAmount;
        pos.y += gravityDir * (18.0 + aSeed * aSeed * 110.0) * scatterAmount * (0.4 + 0.6 * uMotion);

        // 5. Shockwave ring (wall impacts & the inversion) rippling out from the boy
        float ring = 0.0;
        if (uWaveT >= 0.0) {
          vec2 fromOrigin = pos.xy - uWaveOrigin;
          float od = length(fromOrigin) + 0.0001;
          float radius = uWaveT * max(uResolution.x, uResolution.y) * 0.9;
          float band = (od - radius) / 70.0;
          ring = exp(-band * band) * uWaveAmp * max(0.0, 1.0 - uWaveT / 1.6);
          pos.xy += (fromOrigin / od) * ring * 46.0;
          pos.z += ring * 60.0;
        }

        // Orthographic Screen-Space Projection
        vec2 norm = pos.xy / uResolution;
        vec2 clip = norm * 2.0 - 1.0;
        gl_Position = vec4(clip.x, clip.y, pos.z * 0.001, 1.0);

        // 6. Fine, Delicate Stardust Particle Sizing (1.8px to 4.6px - crisp, starry, NOT chunky blobs)
        gl_PointSize = 1.8 + lum * 2.5 + aSeed * 0.7 + ring * 2.5;
        vColor += ring * mix(vec3(0.55, 0.75, 1.0), vec3(1.0, 0.8, 0.35), uTruth) * 0.6;

        // Alpha calculation: Clean thresholding allows dark negative space to dissolve,
        // while luminous architectural & celestial features glow with fine stardust clarity
        float lumFactor = smoothstep(0.04, 0.35, lum);
        vAlpha = max(lumFactor * (0.45 + lum * 0.55) * (1.0 - scatterAmount * 0.4), ring * 0.5);
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uGlobalAlpha;

      void main() {
        // Delicate, Anti-Aliased Circular Stardust Particle
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        // Crisp, soft anti-aliased edge (clean stardust shimmer)
        float edge = 1.0 - smoothstep(0.32, 0.5, dist);
        gl_FragColor = vec4(vColor, vAlpha * uGlobalAlpha * edge);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.points = new THREE.Points(geometry, this.material);
    this.scene.add(this.points);
  }

  update(
    dt,
    progress,
    scrollVelocity,
    truth,
    mouseX,
    mouseY,
    boyX,
    boyY,
    w,
    h,
  ) {
    this.scrollVelocity = scrollVelocity;
    this.truth = truth;
    this.mouseX = mouseX;
    this.mouseY = h - mouseY; // Flip Y for WebGL

    // Identify active acts and interpolation weight
    let currIdx = 0;
    let nextIdx = 0;
    let trans = 0;

    for (let i = 0; i < this.scenes.length; i++) {
      if (progress >= this.scenes[i].progress) {
        currIdx = i;
        nextIdx = Math.min(i + 1, this.scenes.length - 1);
      }
    }

    if (currIdx !== nextIdx) {
      const p1 = this.scenes[currIdx].progress;
      const p2 = this.scenes[nextIdx].progress;
      trans = Math.max(0, Math.min(1, (progress - p1) / (p2 - p1)));
    } else {
      trans = 0;
    }

    this.currentActIdx = currIdx;
    this.nextActIdx = nextIdx;
    this.transitionWeight = trans;

    // Update textures based on mode (Descent vs. Ascent)
    const isAscent = truth > 0.5;
    const prefix = isAscent ? "asc_" : "desc_";

    const currTex = this.textures[`${prefix}${this.scenes[currIdx].act}`];
    const nextTex = this.textures[`${prefix}${this.scenes[nextIdx].act}`];

    if (currTex) this.uniforms.uTexCurrent.value = currTex;
    if (nextTex) this.uniforms.uTexNext.value = nextTex;

    // Update uniforms
    this.uniforms.uTransition.value = trans;
    this.uniforms.uTruth.value = truth;
    this.uniforms.uTime.value = performance.now() * 0.001;
    this.uniforms.uMouse.value.set(this.mouseX, this.mouseY);
    this.uniforms.uScrollVelocity.value = scrollVelocity;
    this.uniforms.uResolution.value.set(w, h);
    this.uniforms.uGlobalAlpha.value = 0.92;
    this.uniforms.uMotion.value = this.motionScale;
    this.boyParticleHalo.update(
      performance.now() * 0.001,
      scrollVelocity,
      truth,
      w,
      h,
      boyX,
      boyY,
    );

    const waveT =
      this.waveStart < 0 ? -1 : (performance.now() - this.waveStart) * 0.001;
    if (waveT > 1.6) this.waveStart = -1;
    this.uniforms.uWaveT.value = waveT > 1.6 ? -1 : waveT;
    this.uniforms.uWaveAmp.value = this.waveAmp;
    this.uniforms.uWaveOrigin.value.set(boyX, h - boyY);
  }

  render(ctx, w, h, truth) {
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.renderer.setSize(w, h, false);
      this.uniforms.uResolution.value.set(w, h);
    }

    // Render WebGL Particle Cloud
    this.renderer.render(this.scene, this.camera);

    // Draw the GPU Particle Cloud directly onto the canvas (NO raw image underneath!)
    ctx.save();
    ctx.drawImage(this.canvas, 0, 0, w, h);

    // Subtle Monospace Telemetry Stamp in Background
    const currentScene = this.scenes[this.currentActIdx];
    if (currentScene) {
      ctx.globalAlpha = 0.4;
      ctx.font = '700 9px "Space Mono", monospace';
      ctx.letterSpacing = "0.35em";
      ctx.textAlign = "left";
      ctx.fillStyle =
        truth > 0.05 ? "rgba(251, 191, 36, 0.8)" : "rgba(147, 197, 253, 0.7)";
      ctx.fillText(currentScene.title, 45, h - 45);

      ctx.font = 'italic 400 11px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = "0.05em";
      ctx.fillStyle =
        truth > 0.05
          ? "rgba(254, 240, 138, 0.65)"
          : "rgba(226, 232, 240, 0.55)";
      const sub = truth > 0.05 ? currentScene.subAsc : currentScene.subDesc;
      ctx.fillText(sub, 45, h - 28);
    }

    ctx.restore();
  }
}
