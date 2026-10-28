import * as THREE from 'three';

/**
 * Dark Mirror Floor / Obsidian Waters
 * Situated at the abyss floor (100% descent).
 * Features concentric ripple physics and shockwave impact on climax contact.
 */
export function createWaterMirror() {
  const geometry = new THREE.PlaneGeometry(60, 60, 128, 128);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uImpactTime: { value: -100.0 },
      uTruthMode: { value: 0 },
      uNearContact: { value: 0 }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uImpactTime;
      uniform float uTruthMode;
      uniform float uNearContact;

      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;
      varying float vRippleHeight;

      void main() {
        vUv = uv;
        vec3 pos = position;

        float dist = length(pos.xy);

        // Ambient fluid undulation
        float wave = sin(dist * 1.5 - uTime * 2.0) * 0.08 
                   + cos(pos.x * 2.0 + uTime) * 0.04;

        // Shockwave ring on impact
        float dt = uTime - uImpactTime;
        float shock = 0.0;
        if (dt >= 0.0 && dt < 6.0) {
          float waveFront = dt * 8.0;
          float ringDist = abs(dist - waveFront);
          float ringFalloff = exp(-ringDist * 1.8) * exp(-dt * 0.5);
          shock = sin(ringDist * 4.0 - dt * 10.0) * ringFalloff * 0.9;
        }

        // Contact distortion when figure is close to surface
        float contactRipple = sin(dist * 3.0 - uTime * 4.0) * exp(-dist * 0.5) * uNearContact * 0.35;

        pos.z += wave + shock + contactRipple;
        vRippleHeight = pos.z;

        vec4 worldPos = modelMatrix * vec4(pos, 1.0);
        vWorldPos = worldPos.xyz;

        // Calculate analytical normal perturbation for ripple highlights
        vec3 norm = vec3(-pos.x * 0.02 * sin(dist - uTime), -pos.y * 0.02 * sin(dist - uTime), 1.0);
        vNormal = normalize(normalMatrix * norm);

        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uTruthMode;
      uniform float uImpactTime;
      varying vec3 vNormal;
      varying vec3 vWorldPos;
      varying vec2 vUv;
      varying float vRippleHeight;

      void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(cameraPosition - vWorldPos);

        // Dark obsidian fluid base during descent
        vec3 darkWater = vec3(0.015, 0.02, 0.035);
        // Liquid gold / mercury mirror during ascent
        vec3 truthWater = vec3(0.95, 0.85, 0.65);
        vec3 waterBase = mix(darkWater, truthWater, uTruthMode * 0.7);

        // Razor Fresnel rim reflection
        float fresnel = 1.0 - max(dot(viewDir, normal), 0.0);
        fresnel = pow(fresnel, 3.0);

        // Center light shaft reflection
        float centerDist = length(vWorldPos.xz);
        float shaftReflection = exp(-pow(centerDist / 4.5, 2.0));

        // Concentric ripple glint
        float glint = pow(max(dot(normal, vec3(0.0, 1.0, 0.0)), 0.0), 32.0);

        vec3 reflectionColor = mix(
          vec3(0.6, 0.7, 0.9), // Silver moonlight reflection
          vec3(1.0, 0.9, 0.6), // Golden radiance
          uTruthMode
        );

        vec3 finalColor = waterBase 
                        + fresnel * reflectionColor * 1.5 
                        + shaftReflection * reflectionColor * (0.8 + uTruthMode * 1.2) 
                        + vRippleHeight * 0.8;

        // Vignette fade at edges
        float edgeFade = 1.0 - smoothstep(18.0, 28.0, centerDist);

        gl_FragColor = vec4(finalColor, edgeFade * 0.95);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.set(0, -25.5, 0); // At the floor of the descent

  return {
    mesh,
    material,
    triggerImpact: (time) => {
      material.uniforms.uImpactTime.value = time;
    },
    update: (time, truthMode, scrollProgress) => {
      material.uniforms.uTime.value = time;
      material.uniforms.uTruthMode.value = truthMode;

      // Contact proximity when approaching 100% scroll
      const near = Math.max(0, (scrollProgress - 0.85) / 0.15);
      material.uniforms.uNearContact.value = near;
    }
  };
}
