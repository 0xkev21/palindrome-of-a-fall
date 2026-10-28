import * as THREE from 'three';

/**
 * Feathers & Sparks / Morphing Wings Particle System
 * Feathers and sparks peel off the figure's spine during descent;
 * Igniting from monoliths and bursting into glowing wings during ascent.
 */
export function createWingsParticleSystem(count = 3800) {
  const geometry = new THREE.BufferGeometry();

  const origins = new Float32Array(count * 3);
  const wingTargets = new Float32Array(count * 3);
  const abyssTargets = new Float32Array(count * 3);
  const monolithAnchors = new Float32Array(count * 3);
  const randoms = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const i3 = i * 3;

    // 1. Origin: Spine & Scapulae of figure (relative to figure center)
    const spineY = 0.2 + (Math.random() - 0.5) * 1.0;
    const spineX = (Math.random() - 0.5) * 0.35;
    const spineZ = -0.28 + (Math.random() - 0.5) * 0.12;
    origins[i3] = spineX;
    origins[i3 + 1] = spineY;
    origins[i3 + 2] = spineZ;

    // 2. Wing Target: Swept-back aerodynamic wings
    const isLeft = Math.random() < 0.5;
    const side = isLeft ? -1.0 : 1.0;
    const t = Math.random(); // 0 at root, 1 at tip
    const span = 0.6 + t * 4.2;
    const featherSpread = (Math.random() - 0.5) * (0.6 + t * 1.4);
    const arch = Math.sin(t * Math.PI * 0.85) * 2.4 - t * 0.8;

    wingTargets[i3] = side * span;
    wingTargets[i3 + 1] = 0.5 + arch + featherSpread * 0.4;
    wingTargets[i3 + 2] = -0.4 - Math.pow(t, 1.3) * 1.2 + (Math.random() - 0.5) * 0.3;

    // 3. Abyss Target (Swallowed into the abyss monoliths below)
    const abyssAngle = Math.random() * Math.PI * 2;
    const abyssRadius = 3.0 + Math.random() * 10.0;
    const abyssDepth = -16.0 - Math.random() * 20.0;
    abyssTargets[i3] = Math.cos(abyssAngle) * abyssRadius;
    abyssTargets[i3 + 1] = abyssDepth;
    abyssTargets[i3 + 2] = Math.sin(abyssAngle) * abyssRadius;

    // 4. Monolith Anchor (Positions on surrounding floating slabs)
    const monoAngle = Math.random() * Math.PI * 2;
    const monoRadius = 6.0 + Math.random() * 6.0;
    const monoY = -18.0 + (Math.random() - 0.5) * 24.0;
    monolithAnchors[i3] = Math.cos(monoAngle) * monoRadius;
    monolithAnchors[i3 + 1] = monoY;
    monolithAnchors[i3 + 2] = Math.sin(monoAngle) * monoRadius - 2.0;

    // 5. Random noise factors
    randoms[i3] = Math.random();
    randoms[i3 + 1] = Math.random();
    randoms[i3 + 2] = Math.random();

    // 6. Sizes
    sizes[i] = 14.0 + Math.random() * 22.0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(origins, 3));
  geometry.setAttribute('aWingTarget', new THREE.BufferAttribute(wingTargets, 3));
  geometry.setAttribute('aAbyssTarget', new THREE.BufferAttribute(abyssTargets, 3));
  geometry.setAttribute('aMonolithAnchor', new THREE.BufferAttribute(monolithAnchors, 3));
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTruthMode: { value: 0 },
      uScrollProgress: { value: 0 },
      uFigurePos: { value: new THREE.Vector3(0, 0, 0) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uTruthMode;
      uniform float uScrollProgress;
      uniform vec3 uFigurePos;
      uniform float uPixelRatio;

      attribute vec3 aWingTarget;
      attribute vec3 aAbyssTarget;
      attribute vec3 aMonolithAnchor;
      attribute vec3 aRandom;
      attribute float aSize;

      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        // --- DESCENT BEHAVIOR (Peeling away from spine, falling into abyss) ---
        float stripPhase = fract(uTime * (0.35 + aRandom.y * 0.4) + aRandom.z);
        vec3 fallPos = mix(position + uFigurePos, aAbyssTarget + vec3(0.0, uFigurePos.y, 0.0), pow(stripPhase, 1.6));

        // Drag turbulence
        fallPos.x += sin(uTime * 2.2 + aRandom.y * 8.0) * 0.35;
        fallPos.z += cos(uTime * 1.8 + aRandom.z * 8.0) * 0.35;

        vec3 emberColor = mix(vec3(0.95, 0.4, 0.15), vec3(0.25, 0.22, 0.28), stripPhase);
        float emberAlpha = (1.0 - stripPhase) * 0.8;

        // --- ASCENT BEHAVIOR (Wings Ignited, harmonic flapping) ---
        vec3 wingBase = aWingTarget + uFigurePos;
        float flap = sin(uTime * 3.5 + abs(aWingTarget.x) * 0.7) * 0.3;
        wingBase.z += flap * (abs(aWingTarget.x) * 0.25);
        wingBase.y += flap * 0.15;

        // Micro sparkle vibration
        wingBase.x += sin(uTime * 7.0 + aRandom.x * 15.0) * 0.06;
        wingBase.y += cos(uTime * 8.0 + aRandom.y * 15.0) * 0.06;

        // Monolith sparks streaming into wings
        float streamPhase = fract(uTime * 0.5 + aRandom.x);
        vec3 streamPos = mix(aMonolithAnchor, wingBase, pow(streamPhase, 0.7));
        vec3 wingFinalPos = mix(streamPos, wingBase, smoothstep(0.0, 0.35, aRandom.z));

        vec3 goldColor = vec3(1.0, 0.84, 0.45);
        vec3 whiteColor = vec3(0.96, 0.98, 1.0);
        vec3 ascentColor = mix(goldColor, whiteColor, sin(uTime * 4.0 + aRandom.y * 6.28) * 0.5 + 0.5);
        float ascentAlpha = 0.85 + sin(uTime * 5.0 + aRandom.x * 8.0) * 0.15;

        // Interpolate between descent and ascent
        vec3 finalPos = mix(fallPos, wingFinalPos, uTruthMode);
        vColor = mix(emberColor, ascentColor, uTruthMode);
        vAlpha = mix(emberAlpha, ascentAlpha, uTruthMode);

        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        gl_PointSize = (aSize * uPixelRatio * (1.0 + uTruthMode * 0.5)) / (-mvPosition.z);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard;

        float intensity = pow(1.0 - (dist * 2.0), 2.0);
        vec3 core = mix(vColor, vec3(1.0, 1.0, 1.0), intensity * 0.65);

        gl_FragColor = vec4(core, vAlpha * intensity);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const points = new THREE.Points(geometry, material);

  return {
    mesh: points,
    material,
    update: (time, truthMode, scrollProgress, figureWorldPos) => {
      material.uniforms.uTime.value = time;
      material.uniforms.uTruthMode.value = truthMode;
      material.uniforms.uScrollProgress.value = scrollProgress;
      if (figureWorldPos) {
        material.uniforms.uFigurePos.value.copy(figureWorldPos);
      }
    }
  };
}
