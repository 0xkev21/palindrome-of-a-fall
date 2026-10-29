import * as THREE from 'three';

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
    this.gridX = 280;
    this.gridY = 160;
    this.particleCount = this.gridX * this.gridY; // 44,800 points

    this.scenes = [
      {
        act: 1,
        progress: 0.10,
        descSrc: '/scenes/act1_desc.jpg',
        ascSrc: '/scenes/act1_asc.jpg',
        title: 'ACT I // ROOFTOP VIGIL',
        subDesc: 'A lone vigil under the suffocating rain.',
        subAsc: 'Golden dawn breaks through the tempest.'
      },
      {
        act: 2,
        progress: 0.24,
        descSrc: '/scenes/act2_desc.jpg',
        ascSrc: '/scenes/act2_asc.jpg',
        title: 'ACT II // MONOLITHIC CHASM',
        subDesc: 'Towering concrete canyons pull downward.',
        subAsc: 'Sunlight carves paths through the abyss.'
      },
      {
        act: 3,
        progress: 0.38,
        descSrc: '/scenes/act3_desc.jpg',
        ascSrc: '/scenes/act3_asc.jpg',
        title: 'ACT III // THE SUSPENDED CAGE',
        subDesc: 'Trapped inside the iron cage of fear.',
        subAsc: 'Shattered bars transform into golden flight.'
      },
      {
        act: 4,
        progress: 0.52,
        descSrc: '/scenes/act4_desc.jpg',
        ascSrc: '/scenes/act4_asc.jpg',
        title: 'ACT IV // COSMIC SILENCE',
        subDesc: 'Silent freefall in the infinite cold void.',
        subAsc: 'A solar nebula shockwave ignites the dark.'
      },
      {
        act: 5,
        progress: 0.66,
        descSrc: '/scenes/act5_desc.jpg',
        ascSrc: '/scenes/act5_asc.jpg',
        title: 'ACT V // STRESS FRACTURES',
        subDesc: 'Concrete and spirit splintering on impact.',
        subAsc: 'Kintsugi seams weld every fracture in gold.'
      },
      {
        act: 6,
        progress: 0.80,
        descSrc: '/scenes/act6_desc.jpg',
        ascSrc: '/scenes/act6_asc.jpg',
        title: 'ACT VI // OBSIDIAN HORIZON',
        subDesc: 'Submerged deep in the freezing ocean abyss.',
        subAsc: 'Bursting through the surface into blinding light.'
      },
      {
        act: 7,
        progress: 0.93,
        descSrc: '/scenes/act7_desc.jpg',
        ascSrc: '/scenes/act7_asc.jpg',
        title: 'ACT VII // INVERTED BEDROCK',
        subDesc: 'The dark mirror bedrock of the fall.',
        subAsc: 'The bedrock erupts as a luminous launchpad.'
      }
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
    this.canvas = document.createElement('canvas');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setPixelRatio(1);
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    this.camera.position.z = 1;

    // Build Point Cloud Geometry & Shader Material
    this.initPointCloud();

    this.currentActIdx = 0;
    this.nextActIdx = 0;
    this.transitionWeight = 0;
    this.truth = 0;
    this.scrollVelocity = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.motionScale = 1; // 0 disables ambient motion (prefers-reduced-motion)
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

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aUv', new THREE.BufferAttribute(uvs, 2));
    geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    // Custom Vertex & Fragment Shaders for Pure Particle Image
    this.uniforms = {
      uTexCurrent: { value: this.textures['desc_1'] || null },
      uTexNext: { value: this.textures['desc_1'] || null },
      uTransition: { value: 0.0 },
      uTruth: { value: 0.0 },
      uTime: { value: 0.0 },
      uMouse: { value: new THREE.Vector2(-999, -999) },
      uScrollVelocity: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      uGlobalAlpha: { value: 1.0 },
      uMotion: { value: 1.0 }
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

      attribute vec2 aUv;
      attribute float aSeed;

      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // Sample texture colors
        vec4 colCurr = texture2D(uTexCurrent, aUv);
        vec4 colNext = texture2D(uTexNext, aUv);
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

        // 3. Interactive Mouse Dispersion (Particles scatter under cursor & spring back)
        vec2 mouseDist = pos.xy - uMouse;
        float d = length(mouseDist);
        if (d < 140.0 && d > 0.0) {
          float push = (1.0 - d / 140.0) * 32.0 * uMotion;
          pos.xy += (mouseDist / d) * push;
          pos.z += push * 1.5;
        }

        // 4. Subtle Chapter Shift Dispersal
        float scatterAmount = sin(uTransition * 3.14159);
        pos.x += sin(aSeed * 25.0) * 45.0 * scatterAmount;
        pos.y += cos(aSeed * 25.0) * 45.0 * scatterAmount;

        // Orthographic Screen-Space Projection
        vec2 norm = pos.xy / uResolution;
        vec2 clip = norm * 2.0 - 1.0;
        gl_Position = vec4(clip.x, clip.y, pos.z * 0.001, 1.0);

        // 5. Crisp, Delicate Particle Size (2.2px to 4.2px circles - NOT mosaic blocks!)
        gl_PointSize = 2.2 + lum * 2.2 + aSeed * 0.6;

        // Alpha calculation
        vAlpha = (0.28 + lum * 0.72) * (1.0 - scatterAmount * 0.35);
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uGlobalAlpha;

      void main() {
        // Soft Anti-Aliased Circular Particle (No ugly square blocks!)
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);
        if (dist > 0.5) discard;

        // Soft radial glowing edge for atmospheric stardust feel
        float edgeStrength = 1.0 - smoothstep(0.32, 0.5, dist);
        gl_FragColor = vec4(vColor, vAlpha * uGlobalAlpha * edgeStrength);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    this.points = new THREE.Points(geometry, this.material);
    this.scene.add(this.points);
  }

  update(dt, progress, scrollVelocity, truth, mouseX, mouseY, boyX, boyY, w, h) {
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
    const prefix = isAscent ? 'asc_' : 'desc_';

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
      ctx.globalAlpha = 0.40;
      ctx.font = '700 9px "Space Mono", monospace';
      ctx.letterSpacing = '0.35em';
      ctx.textAlign = 'left';
      ctx.fillStyle = truth > 0.05 ? 'rgba(251, 191, 36, 0.8)' : 'rgba(147, 197, 253, 0.7)';
      ctx.fillText(currentScene.title, 45, h - 45);

      ctx.font = 'italic 400 11px "Plus Jakarta Sans", sans-serif';
      ctx.letterSpacing = '0.05em';
      ctx.fillStyle = truth > 0.05 ? 'rgba(254, 240, 138, 0.65)' : 'rgba(226, 232, 240, 0.55)';
      const sub = truth > 0.05 ? currentScene.subAsc : currentScene.subDesc;
      ctx.fillText(sub, 45, h - 28);
    }

    ctx.restore();
  }
}
