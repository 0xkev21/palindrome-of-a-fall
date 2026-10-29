import * as THREE from "three";
import { getCharacterSvgMarkup } from "./characterSvg.js";

const COUNT = 12000;
const SIZE = 512;

const vertexShader = `
  uniform vec2 uResolution;
  uniform vec2 uCenter;
  uniform vec2 uSize;
  uniform float uTime;
  uniform float uTruth;
  uniform float uVelocity;

  attribute vec3 aBasePos;
  attribute float aDepth;
  attribute float aEdge;
  attribute float aSeed;
  attribute vec3 aColor;

  varying vec3 vColor;
  varying float vDepth;
  varying float vEdge;

  vec3 hash(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.yzx + 33.33);
    return fract((p.xxy + p.yzz) * p.zyx);
  }

  float noise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f *= f * (3.0 - 2.0 * f);
    float a = hash(i).x;
    float b = hash(i + vec3(1.0, 0.0, 0.0)).x;
    float c = hash(i + vec3(0.0, 1.0, 0.0)).x;
    float d = hash(i + vec3(1.0, 1.0, 0.0)).x;
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y) * 2.0 - 1.0;
  }

  void main() {
    vec3 pos = aBasePos;
    vec3 npos = vec3(pos.xy * 5.0, uTime * 0.12 + aSeed * 4.0);
    float n = noise(npos);
    float nx = noise(npos + vec3(7.0, 2.0, 0.0));
    float ny = noise(npos + vec3(2.0, 9.0, 0.0));
    float drift = aEdge * (0.004 + abs(uVelocity) * 0.0012);
    pos.xy += vec2(nx, ny) * drift;
    pos.z += aDepth * 0.16 + n * aEdge * 0.04;

    vec2 screen = uCenter + pos.xy * uSize;
    vec2 clip = screen / uResolution * 2.0 - 1.0;
    gl_Position = vec4(clip, pos.z * 0.001, 1.0);
    gl_PointSize = mix(0.7, 1.75, aDepth) * (1.0 + uTruth * 0.15);

    vColor = aColor;
    vDepth = aDepth;
    vEdge = aEdge;
  }
`;

const fragmentShader = `
  uniform float uTruth;
  varying vec3 vColor;
  varying float vDepth;
  varying float vEdge;

  void main() {
    float radius = length(gl_PointCoord - 0.5);
    float soft = 1.0 - smoothstep(0.22, 0.5, radius);
    if (soft < 0.01) discard;

    vec3 indigo = vec3(0.26, 0.36, 0.95);
    vec3 rose = vec3(1.0, 0.42, 0.25);
    vec3 tint = mix(indigo, rose, uTruth);
    vec3 color = mix(vColor, tint, 0.18 + vEdge * 0.2);
    float alpha = soft * (0.08 + vEdge * 0.22 + vDepth * 0.08);
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function getSvgSource(id) {
  const holder = document.createElement("div");
  holder.innerHTML = getCharacterSvgMarkup();
  const svg = holder.querySelector(id);
  if (!svg) throw new Error(`Character source ${id} was not found`);
  svg.removeAttribute("class");
  return new XMLSerializer().serializeToString(svg);
}

function loadImage(source) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Character particle source failed to load"));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
  });
}

export class BoyParticleHalo {
  constructor(scene) {
    this.scene = scene;
    this.canvas = document.createElement("canvas");
    this.canvas.width = SIZE;
    this.canvas.height = SIZE;
    this.context = this.canvas.getContext("2d", { willReadFrequently: true });
    this.mode = "";
    this.sources = {};
    this.ready = this.loadSources();

    const positions = new Float32Array(COUNT * 3);
    const depths = new Float32Array(COUNT);
    const edges = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);
    const colors = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      seeds[i] = Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1;
    }

    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("aBasePos", new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute("aDepth", new THREE.BufferAttribute(depths, 1));
    this.geometry.setAttribute("aEdge", new THREE.BufferAttribute(edges, 1));
    this.geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    this.geometry.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

    this.uniforms = {
      uResolution: { value: new THREE.Vector2() },
      uCenter: { value: new THREE.Vector2() },
      uSize: { value: new THREE.Vector2() },
      uTime: { value: 0 },
      uTruth: { value: 0 },
      uVelocity: { value: 0 },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 1;
    scene.add(this.points);
  }

  async loadSources() {
    this.sources.descent = await loadImage(getSvgSource("#hero-svg-descent"));
    this.sources.truth = await loadImage(getSvgSource("#hero-svg-ascent"));
    await this.rasterize("descent");
  }

  async rasterize(mode) {
    const image = this.sources[mode];
    const sourceSize = mode === "truth" ? [540, 460] : [500, 350];
    const scale = Math.min((SIZE * 0.82) / sourceSize[0], (SIZE * 0.82) / sourceSize[1]);
    const width = sourceSize[0] * scale;
    const height = sourceSize[1] * scale;
    this.context.clearRect(0, 0, SIZE, SIZE);
    this.context.drawImage(image, (SIZE - width) / 2, (SIZE - height) / 2, width, height);

    const pixels = this.context.getImageData(0, 0, SIZE, SIZE).data;
    const candidates = [];
    for (let y = 2; y < SIZE - 2; y += 1) {
      for (let x = 2; x < SIZE - 2; x += 1) {
        const index = (y * SIZE + x) * 4;
        const alpha = pixels[index + 3] / 255;
        if (alpha < 0.08) continue;
        const neighbourAlpha = Math.min(
          pixels[index - SIZE * 4 + 3],
          pixels[index + SIZE * 4 + 3],
          pixels[index - 4 + 3],
          pixels[index + 4 + 3],
        ) / 255;
        candidates.push({
          x,
          y,
          depth: 0.3 + (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 765 * 0.7,
          edge: Math.max(0, 1 - neighbourAlpha),
          color: [pixels[index] / 255, pixels[index + 1] / 255, pixels[index + 2] / 255],
        });
      }
    }

    if (!candidates.length) return;
    const base = this.geometry.attributes.aBasePos.array;
    const depths = this.geometry.attributes.aDepth.array;
    const edges = this.geometry.attributes.aEdge.array;
    const colors = this.geometry.attributes.aColor.array;

    for (let i = 0; i < COUNT; i++) {
      const sample = candidates[(i * 104729) % candidates.length];
      const offset = i * 3;
      base[offset] = sample.x / SIZE - 0.5;
      base[offset + 1] = -(sample.y / SIZE - 0.5);
      depths[i] = sample.depth;
      edges[i] = sample.edge;
      colors[offset] = sample.color[0];
      colors[offset + 1] = sample.color[1];
      colors[offset + 2] = sample.color[2];
    }

    this.geometry.attributes.aBasePos.needsUpdate = true;
    this.geometry.attributes.aDepth.needsUpdate = true;
    this.geometry.attributes.aEdge.needsUpdate = true;
    this.geometry.attributes.aColor.needsUpdate = true;
    this.mode = mode;
  }

  update(time, velocity, truth, width, height, centerX, centerY) {
    const mode = truth > 0.5 ? "truth" : "descent";
    if (this.sources[mode] && this.mode !== mode) this.rasterize(mode);

    const size = Math.min(width * (width < 640 ? 0.7 : 0.5), 560);
    this.uniforms.uResolution.value.set(width, height);
    this.uniforms.uCenter.value.set(centerX, height - centerY);
    this.uniforms.uSize.value.set(size, size * (mode === "truth" ? 0.85 : 0.7));
    this.uniforms.uTime.value = time;
    this.uniforms.uTruth.value = truth;
    this.uniforms.uVelocity.value = velocity;
  }
}
