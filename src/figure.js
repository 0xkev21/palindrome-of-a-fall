import * as THREE from 'three';

/**
 * Procedural High-Fashion Stylized Human Mannequin
 * Inspired by Balenciaga, Inside, and haute-couture minimalism.
 * Uses smooth anatomical capsules, articulated spine vertebrae,
 * and a high-fashion polished cybernetic visor.
 */
export function createHumanFigure() {
  const figureGroup = new THREE.Group();
  figureGroup.name = 'HumanFigure';

  // Custom PBR-Style Fresnel Shader Material
  const figureMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTruthMode: { value: 0 },
      uRimIntensity: { value: 2.4 },
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uTruthMode;
      uniform float uRimIntensity;

      varying vec3 vNormal;
      varying vec3 vWorldPosition;
      varying vec3 vViewPosition;
      varying vec2 vUv;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);

        // Core tone: Haute-couture obsidian charcoal during descent,
        // radiant alabaster pearl during ascent
        vec3 descentBase = vec3(0.045, 0.048, 0.055);
        vec3 ascentBase = vec3(0.92, 0.90, 0.85);
        vec3 baseColor = mix(descentBase, ascentBase, uTruthMode * 0.65);

        // Diffuse key light from overhead volumetric shaft
        vec3 lightDir = normalize(vec3(0.0, 1.0, 0.5));
        float diff = max(dot(normal, lightDir), 0.0);
        diff = pow(diff, 1.3);

        // Razor-sharp grazing Fresnel rim light
        float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
        float rim = pow(fresnel, 2.8) * uRimIntensity;

        // Rim coloration: Cold moonlit silver in descent, blazing solar gold in ascent
        vec3 descentRim = vec3(0.75, 0.82, 0.95);
        vec3 ascentRim = vec3(1.0, 0.85, 0.50);
        vec3 rimColor = mix(descentRim, ascentRim, uTruthMode);

        // Spine energy line pulsing in ascent mode
        float spineGlow = 0.0;
        if (abs(normal.x) < 0.25 && normal.z < -0.3) {
          float pulse = sin(vWorldPosition.y * 5.0 - uTime * 4.0) * 0.5 + 0.5;
          spineGlow = pulse * uTruthMode * 2.0;
        }

        vec3 color = baseColor * (0.35 + diff * 0.65) + rim * rimColor + spineGlow * vec3(1.0, 0.75, 0.3);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.FrontSide
  });

  // Mirror Visor Material
  const visorMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    reflectivity: 0.9
  });

  // 1. HEAD & VISOR
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 1.85, 0.05);
  headGroup.rotation.x = -0.22; // Tilted back gazing up into light shaft

  // Smooth sculpted aerodynamic mannequin head
  const headGeo = new THREE.CapsuleGeometry(0.24, 0.32, 16, 24);
  headGeo.scale(0.88, 1.0, 0.96);
  const headMesh = new THREE.Mesh(headGeo, figureMaterial);
  headGroup.add(headMesh);

  // High-fashion sleek curved visor band
  const visorGeo = new THREE.CylinderGeometry(0.245, 0.245, 0.09, 32, 1, false, 0, Math.PI * 1.1);
  visorGeo.rotateY(-Math.PI * 0.55);
  const visorMesh = new THREE.Mesh(visorGeo, visorMaterial);
  visorMesh.position.set(0, 0.06, 0.04);
  headGroup.add(visorMesh);

  figureGroup.add(headGroup);

  // 2. NECK
  const neckGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.35, 16);
  const neckMesh = new THREE.Mesh(neckGeo, figureMaterial);
  neckMesh.position.set(0, 1.55, 0.02);
  neckMesh.rotation.x = -0.1;
  figureGroup.add(neckMesh);

  // 3. CHEST & RIBCAGE
  const chestGroup = new THREE.Group();
  chestGroup.position.set(0, 1.15, 0);

  const chestGeo = new THREE.CapsuleGeometry(0.36, 0.45, 16, 24);
  chestGeo.scale(1.15, 1.0, 0.72);
  const chestMesh = new THREE.Mesh(chestGeo, figureMaterial);
  chestMesh.rotation.x = 0.08;
  chestGroup.add(chestMesh);

  // Articulated Spine Vertebrae (5 sleek geometric discs on the back)
  const spineGroup = new THREE.Group();
  for (let i = 0; i < 5; i++) {
    const vGeo = new THREE.CylinderGeometry(0.14 - i * 0.015, 0.16 - i * 0.015, 0.05, 16);
    const vMesh = new THREE.Mesh(vGeo, figureMaterial);
    vMesh.rotation.x = Math.PI / 2 + 0.1 * i;
    vMesh.position.set(0, 0.2 - i * 0.14, -0.22 - i * 0.02);
    spineGroup.add(vMesh);
  }
  chestGroup.add(spineGroup);
  figureGroup.add(chestGroup);

  // 4. PELVIS & ABDOMEN
  const pelvisGeo = new THREE.CapsuleGeometry(0.28, 0.32, 16, 24);
  pelvisGeo.scale(1.12, 0.95, 0.75);
  const pelvisMesh = new THREE.Mesh(pelvisGeo, figureMaterial);
  pelvisMesh.position.set(0, 0.42, -0.04);
  figureGroup.add(pelvisMesh);

  // 5. SHOULDERS & ARMS (Zero-G suspended weightless pose)
  const leftArmGroup = new THREE.Group();
  leftArmGroup.position.set(-0.52, 1.25, 0);

  const rightArmGroup = new THREE.Group();
  rightArmGroup.position.set(0.52, 1.25, 0);

  function createSmoothLimb(isLeft = true) {
    const limb = new THREE.Group();
    const sign = isLeft ? -1 : 1;

    // Shoulder deltoid joint
    const deltoidGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const deltoidMesh = new THREE.Mesh(deltoidGeo, figureMaterial);
    limb.add(deltoidMesh);

    // Upper arm
    const upperGeo = new THREE.CapsuleGeometry(0.10, 0.65, 8, 16);
    const upperMesh = new THREE.Mesh(upperGeo, figureMaterial);
    upperMesh.position.set(sign * 0.16, -0.38, -0.06);
    upperMesh.rotation.z = sign * 0.35;
    upperMesh.rotation.x = -0.15;
    limb.add(upperMesh);

    // Elbow joint
    const elbowGeo = new THREE.SphereGeometry(0.09, 12, 12);
    const elbowMesh = new THREE.Mesh(elbowGeo, figureMaterial);
    elbowMesh.position.set(sign * 0.32, -0.78, -0.02);
    limb.add(elbowMesh);

    // Forearm
    const lowerGeo = new THREE.CapsuleGeometry(0.08, 0.65, 8, 16);
    const lowerMesh = new THREE.Mesh(lowerGeo, figureMaterial);
    lowerMesh.position.set(sign * 0.48, -1.18, 0.12);
    lowerMesh.rotation.z = sign * 0.45;
    lowerMesh.rotation.x = 0.25;
    limb.add(lowerMesh);

    // Stylized weightless palm
    const palmGeo = new THREE.CapsuleGeometry(0.06, 0.24, 8, 16);
    palmGeo.scale(1.0, 1.0, 0.45);
    const palmMesh = new THREE.Mesh(palmGeo, figureMaterial);
    palmMesh.position.set(sign * 0.65, -1.60, 0.25);
    palmMesh.rotation.z = sign * 0.55;
    palmMesh.rotation.x = -0.3;
    limb.add(palmMesh);

    return limb;
  }

  const leftArm = createSmoothLimb(true);
  const rightArm = createSmoothLimb(false);
  leftArmGroup.add(leftArm);
  rightArmGroup.add(rightArm);
  figureGroup.add(leftArmGroup);
  figureGroup.add(rightArmGroup);

  // 6. LEGS & FEET (Graceful pointed diving/floating suspension)
  function createSmoothLeg(isLeft = true) {
    const leg = new THREE.Group();
    const sign = isLeft ? -1 : 1;

    leg.position.set(sign * 0.24, 0.25, -0.02);

    // Hip joint
    const hipGeo = new THREE.SphereGeometry(0.14, 14, 14);
    const hipMesh = new THREE.Mesh(hipGeo, figureMaterial);
    leg.add(hipMesh);

    // Thigh
    const thighGeo = new THREE.CapsuleGeometry(0.15, 0.95, 10, 20);
    const thighMesh = new THREE.Mesh(thighGeo, figureMaterial);
    thighMesh.position.set(sign * 0.04, -0.56, isLeft ? 0.08 : -0.06);
    thighMesh.rotation.x = isLeft ? -0.12 : 0.08;
    thighMesh.rotation.z = sign * 0.06;
    leg.add(thighMesh);

    // Knee joint
    const kneeGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const kneeMesh = new THREE.Mesh(kneeGeo, figureMaterial);
    kneeMesh.position.set(sign * 0.06, -1.14, isLeft ? 0.16 : -0.12);
    leg.add(kneeMesh);

    // Shin / Calf
    const shinGeo = new THREE.CapsuleGeometry(0.11, 0.95, 10, 20);
    const shinMesh = new THREE.Mesh(shinGeo, figureMaterial);
    shinMesh.position.set(sign * 0.06, -1.72, isLeft ? 0.26 : -0.22);
    shinMesh.rotation.x = isLeft ? 0.22 : -0.10;
    leg.add(shinMesh);

    // Pointed ballerina/freefall foot
    const footGeo = new THREE.CapsuleGeometry(0.08, 0.42, 8, 16);
    footGeo.scale(0.85, 1.0, 0.45);
    const footMesh = new THREE.Mesh(footGeo, figureMaterial);
    footMesh.position.set(sign * 0.06, -2.35, isLeft ? 0.42 : -0.32);
    footMesh.rotation.x = isLeft ? 0.65 : 0.35;
    leg.add(footMesh);

    return leg;
  }

  const leftLeg = createSmoothLeg(true);
  const rightLeg = createSmoothLeg(false);
  figureGroup.add(leftLeg);
  figureGroup.add(rightLeg);

  // Overall scale & centering
  figureGroup.scale.set(1.3, 1.3, 1.3);
  figureGroup.position.set(0, -0.65, 0);

  return {
    mesh: figureGroup,
    material: figureMaterial,
    visorMaterial,
    update: (time, truthMode, velocity = 0) => {
      figureMaterial.uniforms.uTime.value = time;
      figureMaterial.uniforms.uTruthMode.value = truthMode;

      // Gentle organic zero-G breathing & drift relative to parent rig
      const breathY = Math.sin(time * 1.4) * 0.1 - velocity * 0.15;
      const swayZ = Math.sin(time * 0.9) * 0.03;
      const swayX = Math.cos(time * 1.1) * 0.02;

      figureGroup.position.y = -0.65 + breathY;
      figureGroup.rotation.z = swayZ;
      figureGroup.rotation.x = swayX;

      // Subtle arm floating wave
      leftArmGroup.rotation.z = Math.sin(time * 1.1) * 0.06;
      rightArmGroup.rotation.z = -Math.sin(time * 1.1 + 0.4) * 0.06;
      headGroup.rotation.y = Math.sin(time * 0.6) * 0.05;

      // Visor color transition
      if (truthMode > 0.01) {
        visorMaterial.color.setRGB(1.0, 0.85 + (1 - truthMode) * 0.15, 0.4 + (1 - truthMode) * 0.6);
      } else {
        visorMaterial.color.setRGB(1, 1, 1);
      }
    }
  };
}
