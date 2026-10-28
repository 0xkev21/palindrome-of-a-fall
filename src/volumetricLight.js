import * as THREE from 'three';

/**
 * Volumetric Light Shaft & Atmospheric Dust Motes
 * Concentric soft light beams with Rayleigh falloff and animated god rays.
 */
export function createVolumetricLight() {
  const group = new THREE.Group();
  group.name = 'VolumetricLightGroup';

  // 1. Concentric Volumetric Light Beam
  const beamGeo = new THREE.CylinderGeometry(2.4, 7.0, 52, 32, 1, true);
  beamGeo.translate(0, -10, 0);

  const beamMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTruthMode: { value: 0 }
    },
    vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uTruthMode;
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        // Vertical gradient: brightest at the apex (y = 16.0), fading down into the abyss (-36.0)
        float vertFade = smoothstep(-34.0, 14.0, vPosition.y);

        // Subtle rotating god rays
        float angle = atan(vPosition.z, vPosition.x);
        float rays = sin(angle * 6.0 + uTime * 0.35) * 0.2
                   + sin(angle * 11.0 - uTime * 0.25) * 0.15 
                   + 0.65;

        // Rim grazing intensity on the beam edges
        float rim = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);

        // Core colors
        vec3 descentColor = vec3(0.85, 0.90, 1.0);
        vec3 ascentColor = vec3(1.0, 0.92, 0.75);
        vec3 col = mix(descentColor, ascentColor, uTruthMode);

        float alpha = vertFade * (0.12 + rim * 0.18) * rays * (0.8 + uTruthMode * 0.4);

        gl_FragColor = vec4(col, alpha);
      }
    `,
    side: THREE.DoubleSide,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const beamMesh = new THREE.Mesh(beamGeo, beamMaterial);
  group.add(beamMesh);

  // Inner core beam for central density
  const innerGeo = new THREE.CylinderGeometry(1.2, 4.0, 50, 24, 1, true);
  innerGeo.translate(0, -10, 0);
  const innerMesh = new THREE.Mesh(innerGeo, beamMaterial);
  group.add(innerMesh);

  // 2. Apex Luminous Disk
  const apexGeo = new THREE.RingGeometry(0.1, 3.2, 32);
  const apexMat = new THREE.ShaderMaterial({
    uniforms: {
      uTruthMode: { value: 0 },
      uTime: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTruthMode;
      uniform float uTime;
      varying vec2 vUv;
      void main() {
        float dist = length(vUv - vec2(0.5)) * 2.0;
        float alpha = exp(-dist * dist * 3.5) * (0.7 + uTruthMode * 0.5);
        vec3 col = mix(vec3(0.88, 0.94, 1.0), vec3(1.0, 0.92, 0.72), uTruthMode);
        gl_FragColor = vec4(col, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide
  });

  const apexMesh = new THREE.Mesh(apexGeo, apexMat);
  apexMesh.position.set(0, 16.0, 0);
  apexMesh.rotation.x = Math.PI / 2;
  group.add(apexMesh);

  // 3. Floating Micro Dust Motes
  const moteCount = 300;
  const moteGeo = new THREE.BufferGeometry();
  const motePos = new Float32Array(moteCount * 3);
  const moteSpeed = new Float32Array(moteCount);

  for (let i = 0; i < moteCount; i++) {
    const i3 = i * 3;
    const r = Math.random() * 4.0;
    const theta = Math.random() * Math.PI * 2;
    motePos[i3] = Math.cos(theta) * r;
    motePos[i3 + 1] = -28 + Math.random() * 42;
    motePos[i3 + 2] = Math.sin(theta) * r;
    moteSpeed[i] = 0.4 + Math.random() * 1.2;
  }

  moteGeo.setAttribute('position', new THREE.BufferAttribute(motePos, 3));

  const moteMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2.5,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending
  });

  const motePoints = new THREE.Points(moteGeo, moteMat);
  group.add(motePoints);

  return {
    mesh: group,
    beamMaterial,
    apexMat,
    update: (time, truthMode) => {
      beamMaterial.uniforms.uTime.value = time;
      beamMaterial.uniforms.uTruthMode.value = truthMode;
      apexMat.uniforms.uTime.value = time;
      apexMat.uniforms.uTruthMode.value = truthMode;

      const positions = moteGeo.attributes.position.array;
      for (let i = 0; i < moteCount; i++) {
        const i3 = i * 3;
        const dir = truthMode > 0.5 ? 0.035 : -0.015;
        positions[i3 + 1] += dir * moteSpeed[i];
        if (positions[i3 + 1] > 15) positions[i3 + 1] = -27;
        if (positions[i3 + 1] < -28) positions[i3 + 1] = 14;
      }
      moteGeo.attributes.position.needsUpdate = true;
    }
  };
}
