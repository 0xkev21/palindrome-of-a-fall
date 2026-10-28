import * as THREE from 'three';

/**
 * Brutalist Concrete Monoliths Canyon
 * Monumental architectural pillars and cantilevers framing the descent shaft.
 * Strictly positioned to maintain safe camera clearances (no clipping through viewport).
 */
export function createBrutalistMonoliths() {
  const group = new THREE.Group();
  group.name = 'MonolithCanyonGroup';

  // Procedural Concrete Shader Material
  const concreteMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uScrollProgress: { value: 0 },
      uTruthMode: { value: 0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uTruthMode;
      uniform float uScrollProgress;

      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec2 vUv;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      void main() {
        vec3 normal = normalize(vNormal);

        // Concrete texture aggregate grain
        float grain = noise(vWorldPosition.xy * 2.0) * 0.4 + noise(vWorldPosition.yz * 3.5) * 0.2;

        // Architectural horizontal formwork seams every 5 units
        float seam = smoothstep(0.03, 0.0, abs(fract(vWorldPosition.y * 0.2) - 0.5));

        // Base Tadao Ando architectural concrete tone
        vec3 concreteColor = vec3(0.10, 0.105, 0.115) + grain * 0.03 - seam * 0.02;

        // Key light from overhead center light shaft
        vec3 lightDir = normalize(vec3(-vWorldPosition.x * 0.3, 18.0 - vWorldPosition.y, -vWorldPosition.z * 0.3));
        float diff = max(dot(normal, lightDir), 0.0);

        // Vertical ambient falloff
        float ao = clamp((vWorldPosition.y + 32.0) / 44.0, 0.25, 1.0);

        vec3 color = concreteColor * (0.35 + diff * 0.65) * ao;

        // Ascent Mode: Golden Kintsugi Veins along architectural fractures
        float fracture = sin(vWorldPosition.y * 2.5 + vWorldPosition.x * 1.8) * cos(vWorldPosition.z * 2.0 - uTime * 0.8);
        float vein = smoothstep(0.85, 0.98, fracture) * uTruthMode;
        vec3 goldVeinColor = vec3(1.0, 0.82, 0.42) * 2.2;

        color = mix(color, goldVeinColor, vein);

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  const monoliths = [];

  // Define structured architectural configurations (Pillars, Cantilevers, Slabs)
  const configs = [
    // --- LEFT COLONNADE (x: -12 to -5.5, z: -8 to 0) ---
    { pos: [-7.0, 8.0, -2.0], size: [2.2, 14.0, 2.2], rot: [0, 0.15, 0] },
    { pos: [-9.5, 2.0, -5.0], size: [3.5, 12.0, 2.8], rot: [0.05, -0.2, 0] },
    { pos: [-6.5, -4.0, -1.0], size: [2.0, 16.0, 2.0], rot: [0, 0.1, 0] },
    { pos: [-10.0, -10.0, -4.0], size: [4.0, 10.0, 3.0], rot: [-0.05, 0.25, 0] },
    { pos: [-7.2, -18.0, -1.5], size: [2.4, 18.0, 2.4], rot: [0, -0.15, 0] },
    { pos: [-11.0, -24.0, -5.5], size: [5.0, 12.0, 3.5], rot: [0.08, 0.12, 0] },

    // --- RIGHT COLONNADE (x: 5.5 to 12, z: -8 to 0) ---
    { pos: [7.0, 9.0, -2.5], size: [2.4, 15.0, 2.4], rot: [0, -0.18, 0] },
    { pos: [10.0, 1.0, -5.5], size: [3.8, 11.0, 3.0], rot: [-0.06, 0.22, 0] },
    { pos: [6.8, -5.0, -1.2], size: [2.2, 17.0, 2.2], rot: [0, -0.12, 0] },
    { pos: [9.8, -11.0, -4.5], size: [4.2, 10.0, 3.2], rot: [0.04, -0.28, 0] },
    { pos: [7.5, -19.0, -1.8], size: [2.5, 18.0, 2.5], rot: [0, 0.16, 0] },
    { pos: [10.5, -25.0, -5.0], size: [4.8, 12.0, 3.6], rot: [-0.07, -0.15, 0] },

    // --- REAR MONUMENTAL WALLS & LINTELS (z: -14 to -8) ---
    { pos: [0.0, 10.0, -11.0], size: [12.0, 2.5, 3.0], rot: [0, 0, 0] },
    { pos: [-2.0, 0.0, -12.0], size: [6.0, 14.0, 2.5], rot: [0, 0.05, 0] },
    { pos: [2.5, -12.0, -11.5], size: [8.0, 16.0, 2.8], rot: [0, -0.05, 0] },
    { pos: [0.0, -22.0, -13.0], size: [14.0, 3.0, 3.5], rot: [0, 0, 0] }
  ];

  configs.forEach((cfg, idx) => {
    const geo = new THREE.BoxGeometry(cfg.size[0], cfg.size[1], cfg.size[2]);
    const mesh = new THREE.Mesh(geo, concreteMaterial);

    const restPos = new THREE.Vector3(...cfg.pos);
    const restRot = new THREE.Euler(...cfg.rot);

    mesh.position.copy(restPos);
    mesh.rotation.copy(restRot);

    group.add(mesh);

    // Crumble vectors: tilt and slide outwards during descent
    const signX = cfg.pos[0] >= 0 ? 1 : -1;
    const crumbleOffset = new THREE.Vector3(
      signX * (2.5 + Math.random() * 3.5),
      (Math.random() - 0.5) * 3.0,
      -Math.random() * 4.0
    );
    const crumbleRot = new THREE.Euler(
      (Math.random() - 0.5) * 0.35,
      (Math.random() - 0.5) * 0.45,
      signX * (0.15 + Math.random() * 0.25)
    );

    monoliths.push({
      mesh,
      restPos,
      restRot,
      crumbleOffset,
      crumbleRot,
      driftSpeed: 0.3 + (idx % 5) * 0.1,
      driftPhase: (idx / configs.length) * Math.PI * 2
    });
  });

  return {
    mesh: group,
    material: concreteMaterial,
    update: (time, truthMode, scrollProgress) => {
      concreteMaterial.uniforms.uTime.value = time;
      concreteMaterial.uniforms.uScrollProgress.value = scrollProgress;
      concreteMaterial.uniforms.uTruthMode.value = truthMode;

      // Collapse factor: increases as scroll descends (burnout/crumble)
      // When truthMode (Ascent) activates, collapse factor is reversed and aligned into pristine order!
      const collapseFactor = (1.0 - truthMode) * Math.pow(scrollProgress, 1.2);

      for (let i = 0; i < monoliths.length; i++) {
        const m = monoliths[i];
        const drift = Math.sin(time * m.driftSpeed + m.driftPhase) * 0.15;

        m.mesh.position.x = m.restPos.x + m.crumbleOffset.x * collapseFactor;
        m.mesh.position.y = m.restPos.y + drift + m.crumbleOffset.y * collapseFactor;
        m.mesh.position.z = m.restPos.z + m.crumbleOffset.z * collapseFactor;

        m.mesh.rotation.x = m.restRot.x + m.crumbleRot.x * collapseFactor;
        m.mesh.rotation.y = m.restRot.y + m.crumbleRot.y * collapseFactor;
        m.mesh.rotation.z = m.restRot.z + m.crumbleRot.z * collapseFactor;
      }
    }
  };
}
