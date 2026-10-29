import * as THREE from "three";

const COUNT = 28000;
const SIZE = 768;

const vertexShader = `
  uniform vec2 uResolution;
  uniform vec2 uCenter;
  uniform vec2 uSize;
  uniform float uTime;
  uniform float uTruth;
  uniform float uVelocity;
  uniform float uPixelRatio;
  uniform vec2 uMouse;
  uniform float uWaveT;
  uniform float uWaveAmp;

  attribute vec3 aBasePosDescent;
  attribute vec3 aBasePosAscent;
  attribute vec3 aColorDescent;
  attribute vec3 aColorAscent;
  attribute float aDepthDescent;
  attribute float aDepthAscent;
  attribute float aEdgeDescent;
  attribute float aEdgeAscent;
  attribute float aSeed;

  varying vec3 vColor;
  varying float vDepth;
  varying float vEdge;
  varying float vAlpha;

  void main() {
    float morph = smoothstep(0.08, 0.92, uTruth);

    // Smooth GPU morph between falling zero-G pose and soaring winged flight.
    // The ascending winged model has an intentional 1.52x scale boost so his body,
    // head, and wingspan have an epic, heroic presence matching the descending figure.
    vec3 pDesc = aBasePosDescent;
    vec3 pAsc = aBasePosAscent * 1.52;
    pAsc.y += 0.035; // poise head and wings uplifted towards zenith light

    vec3 pos = mix(pDesc, pAsc, morph);
    vec3 col = mix(aColorDescent, aColorAscent, morph);
    float depth = mix(aDepthDescent, aDepthAscent, morph);
    float edge = mix(aEdgeDescent, aEdgeAscent, morph);

    // 1. Organic Zero-G Floating Flutter & Breathing
    float flutterSpeed = 1.4 + aSeed * 1.6;
    float waveX = sin(uTime * flutterSpeed + pos.y * 6.0 + aSeed * 6.28) * 0.012;
    float waveY = cos(uTime * (flutterSpeed * 0.9) + pos.x * 6.0 + aSeed * 6.28) * 0.015;
    float waveZ = sin(uTime * 1.8 + aSeed * 8.0) * 0.025;

    pos.x += waveX;
    pos.y += waveY;
    pos.z += waveZ + (depth - 0.5) * 0.12;

    // 2. Slipstream Velocity Stretch
    float slip = uVelocity * (0.0025 + aSeed * 0.0018);
    pos.y += slip;

    // 3. Stardust Edge Dissipation: outer particles peel off softly into the airflow
    float trailDir = mix(1.0, -1.0, morph);
    float trailAmount = pow(edge, 1.4) * (0.018 + aSeed * 0.03) * (0.5 + abs(uVelocity) * 0.0015);
    pos.y += trailDir * trailAmount;
    pos.x += (aSeed - 0.5) * edge * 0.018;

    // Convert normalized model coords (-0.5 to 0.5) to screen pixels
    vec2 screen = uCenter + pos.xy * uSize;

    // 4. Interactive Mouse Dispersion (particles part gently when hovered)
    vec2 mouseDist = screen - uMouse;
    float d = length(mouseDist);
    float disperseRadius = 150.0;
    if (d < disperseRadius && d > 0.0) {
      float push = pow(1.0 - d / disperseRadius, 2.0) * 32.0;
      screen += (mouseDist / d) * push;
      pos.z += push * 0.003;
    }

    // 5. Environmental Shockwave Ripple
    if (uWaveT >= 0.0) {
      float ringRadius = uWaveT * 650.0;
      float od = length(pos.xy * uSize);
      float band = (od - ringRadius) / 55.0;
      float ring = exp(-band * band) * uWaveAmp * max(0.0, 1.0 - uWaveT / 1.6);
      pos.z += ring * 0.08;
      col += ring * mix(vec3(0.45, 0.72, 1.0), vec3(1.0, 0.85, 0.45), morph) * 0.5;
    }

    // Project to clip space
    vec2 clip = screen / uResolution * 2.0 - 1.0;
    gl_Position = vec4(clip.x, clip.y, pos.z * 0.001, 1.0);

    // Delicate stardust particle sizing (anti-aliased stardust, matches background image)
    // Sizing slightly blooms in Ascent (1.22x) to keep particle density dense and brilliant across the wingspan
    gl_PointSize = mix(2.2, 4.0, depth) * uPixelRatio * (1.0 + edge * 0.25) * (1.0 + morph * 0.22);

    // Color lighting harmony:
    // Descent: crisp cool skylight; Ascent: radiant warm sunlight
    vec3 ambientIndigo = vec3(0.85, 0.94, 1.08);
    vec3 radiantGold = vec3(1.18, 1.02, 0.82);
    vec3 lightWash = mix(ambientIndigo, radiantGold, morph);
    vColor = col * lightWash;

    // Outer stardust rim glow (atmospheric, harmonious blend)
    vColor += edge * mix(vec3(0.18, 0.28, 0.45), vec3(0.55, 0.42, 0.15), morph) * 0.25;

    vDepth = depth;
    vEdge = edge;
    vAlpha = 1.0;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vDepth;
  varying float vEdge;
  varying float vAlpha;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    // Delicate, anti-aliased circular Gaussian stardust particle
    float soft = 1.0 - smoothstep(0.28, 0.5, dist);

    // Crisp core with gentle outer edge dissipation that smoothly dissolves into the background
    float alpha = soft * mix(0.95, 0.25, vEdge);

    gl_FragColor = vec4(vColor, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load ${source}`));
    image.src = source;
  });
}

export class BoyParticleHalo {
  constructor(scene) {
    this.scene = scene;
    this.canvas = document.createElement("canvas");
    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
    this.context = this.canvas.getContext("2d", { willReadFrequently: true });

    this.isLoaded = false;

    // Buffer attributes for both poses
    const posDesc = new Float32Array(COUNT * 3);
    const posAsc = new Float32Array(COUNT * 3);
    const colDesc = new Float32Array(COUNT * 3);
    const colAsc = new Float32Array(COUNT * 3);
    const depthDesc = new Float32Array(COUNT);
    const depthAsc = new Float32Array(COUNT);
    const edgeDesc = new Float32Array(COUNT);
    const edgeAsc = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      seeds[i] = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(posDesc, 3));
    this.geometry.setAttribute("aBasePosDescent", new THREE.BufferAttribute(posDesc, 3));
    this.geometry.setAttribute("aBasePosAscent", new THREE.BufferAttribute(posAsc, 3));
    this.geometry.setAttribute("aColorDescent", new THREE.BufferAttribute(colDesc, 3));
    this.geometry.setAttribute("aColorAscent", new THREE.BufferAttribute(colAsc, 3));
    this.geometry.setAttribute("aDepthDescent", new THREE.BufferAttribute(depthDesc, 1));
    this.geometry.setAttribute("aDepthAscent", new THREE.BufferAttribute(depthAsc, 1));
    this.geometry.setAttribute("aEdgeDescent", new THREE.BufferAttribute(edgeDesc, 1));
    this.geometry.setAttribute("aEdgeAscent", new THREE.BufferAttribute(edgeAsc, 1));
    this.geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    this.uniforms = {
      uResolution: { value: new THREE.Vector2() },
      uCenter: { value: new THREE.Vector2() },
      uSize: { value: new THREE.Vector2() },
      uTime: { value: 0 },
      uTruth: { value: 0 },
      uVelocity: { value: 0 },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector2(-999, -999) },
      uWaveT: { value: -1 },
      uWaveAmp: { value: 0 },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 2; // Render directly on top of background particles
    scene.add(this.points);

    this.ready = this.loadBothCharacters();
  }

  async loadBothCharacters() {
    try {
      const [descImg, ascImg] = await Promise.all([
        loadImage("/character/descent.png"),
        loadImage("/character/ascent.png"),
      ]);

      const descSamples = this.sampleImage(descImg);
      const ascSamples = this.sampleImage(ascImg);

      const pDesc = this.geometry.attributes.aBasePosDescent.array;
      const pAsc = this.geometry.attributes.aBasePosAscent.array;
      const cDesc = this.geometry.attributes.aColorDescent.array;
      const cAsc = this.geometry.attributes.aColorAscent.array;
      const dDesc = this.geometry.attributes.aDepthDescent.array;
      const dAsc = this.geometry.attributes.aDepthAscent.array;
      const eDesc = this.geometry.attributes.aEdgeDescent.array;
      const eAsc = this.geometry.attributes.aEdgeAscent.array;

      for (let i = 0; i < COUNT; i++) {
        const sDesc = descSamples[(i * 104729) % descSamples.length];
        const sAsc = ascSamples[(i * 104729) % ascSamples.length];
        const idx = i * 3;

        pDesc[idx] = sDesc.x / SIZE - 0.5;
        pDesc[idx + 1] = -(sDesc.y / SIZE - 0.5);
        pDesc[idx + 2] = (sDesc.depth - 0.5) * 0.05;

        cDesc[idx] = sDesc.color[0];
        cDesc[idx + 1] = sDesc.color[1];
        cDesc[idx + 2] = sDesc.color[2];

        dDesc[i] = sDesc.depth;
        eDesc[i] = sDesc.edge;

        pAsc[idx] = sAsc.x / SIZE - 0.5;
        pAsc[idx + 1] = -(sAsc.y / SIZE - 0.5);
        pAsc[idx + 2] = (sAsc.depth - 0.5) * 0.05;

        cAsc[idx] = sAsc.color[0];
        cAsc[idx + 1] = sAsc.color[1];
        cAsc[idx + 2] = sAsc.color[2];

        dAsc[i] = sAsc.depth;
        eAsc[i] = sAsc.edge;
      }

      this.geometry.attributes.aBasePosDescent.needsUpdate = true;
      this.geometry.attributes.aBasePosAscent.needsUpdate = true;
      this.geometry.attributes.aColorDescent.needsUpdate = true;
      this.geometry.attributes.aColorAscent.needsUpdate = true;
      this.geometry.attributes.aDepthDescent.needsUpdate = true;
      this.geometry.attributes.aDepthAscent.needsUpdate = true;
      this.geometry.attributes.aEdgeDescent.needsUpdate = true;
      this.geometry.attributes.aEdgeAscent.needsUpdate = true;

      this.isLoaded = true;
    } catch (err) {
      console.warn("Could not load character particle images:", err);
    }
  }

  sampleImage(image) {
    this.context.clearRect(0, 0, SIZE, SIZE);
    this.context.drawImage(image, 0, 0, SIZE, SIZE);

    const pixels = this.context.getImageData(0, 0, SIZE, SIZE).data;
    const candidates = [];

    // Dense grid sampling with 1px step
    for (let y = 1; y < SIZE - 1; y += 1) {
      for (let x = 1; x < SIZE - 1; x += 1) {
        const index = (y * SIZE + x) * 4;
        const alpha = pixels[index + 3] / 255;
        if (alpha < 0.12) continue;

        // Detect silhouette edge falloff
        const nAlpha =
          Math.min(
            pixels[index - SIZE * 4 + 3],
            pixels[index + SIZE * 4 + 3],
            pixels[index - 4 + 3],
            pixels[index + 4 + 3]
          ) / 255;

        const lum =
          (pixels[index] * 0.299 +
            pixels[index + 1] * 0.587 +
            pixels[index + 2] * 0.114) /
          255;

        candidates.push({
          x,
          y,
          depth: 0.35 + lum * 0.65,
          edge: Math.max(0, 1 - nAlpha),
          color: [
            pixels[index] / 255,
            pixels[index + 1] / 255,
            pixels[index + 2] / 255,
          ],
        });
      }
    }

    if (!candidates.length) {
      // Fallback point if image is empty
      return [{ x: SIZE / 2, y: SIZE / 2, depth: 0.5, edge: 0, color: [1, 1, 1] }];
    }

    return candidates;
  }

  update(
    time,
    velocity,
    truth,
    width,
    height,
    centerX,
    centerY,
    figureSize,
    pixelRatio = 1,
    mouseX = -999,
    mouseY = -999,
    waveT = -1,
    waveAmp = 0
  ) {
    this.uniforms.uResolution.value.set(width, height);
    this.uniforms.uCenter.value.set(centerX, height - centerY);
    this.uniforms.uSize.value.set(figureSize, figureSize);
    this.uniforms.uTime.value = time;
    this.uniforms.uTruth.value = truth;
    this.uniforms.uVelocity.value = velocity;
    this.uniforms.uPixelRatio.value = pixelRatio;
    this.uniforms.uMouse.value.set(mouseX, height - mouseY);
    this.uniforms.uWaveT.value = waveT;
    this.uniforms.uWaveAmp.value = waveAmp;
  }
}
