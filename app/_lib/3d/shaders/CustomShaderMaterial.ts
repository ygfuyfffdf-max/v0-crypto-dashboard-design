// @ts-nocheck - TODO: Fix TypeScript strict mode issues
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎭 CUSTOM SHADER MATERIAL - Sistema de Materiales Shader Personalizados
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sistema avanzado para crear materiales con shaders personalizados
 * basado en Three.js ShaderMaterial con extensiones premium.
 */

import * as THREE from 'three'
import type { ShaderConfig, ShaderUniforms } from '../types'
import { ShaderLibrary } from './ShaderLibrary'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 PRESET SHADERS
// ═══════════════════════════════════════════════════════════════════════════════

export const ShaderPresets = {
  // Holográfico premium
  holographic: {
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uScanlineIntensity;
      uniform float uFresnelPower;

      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec3 viewDir = normalize(vViewPosition);

        // Fresnel
        float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), uFresnelPower);

        // Scanlines
        float scanline = sin(vUv.y * 400.0 + uTime * 5.0) * uScanlineIntensity;

        // Flicker
        float flicker = sin(uTime * 20.0) * 0.02 + 0.98;

        // Color shifts
        vec3 color = uColor;
        color.r += sin(vUv.y * 200.0 + uTime * 3.0) * 0.1;
        color.b += cos(vUv.y * 200.0 + uTime * 2.0) * 0.1;

        // Combine
        float alpha = fresnel * 0.8 + 0.2;
        alpha *= (1.0 + scanline);
        alpha *= flicker;

        gl_FragColor = vec4(color, alpha);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x00ffff) },
      uScanlineIntensity: { value: 0.04 },
      uFresnelPower: { value: 2.0 },
    },
  },

  // Energía plasma
  plasma: {
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform float uSpeed;
      uniform float uScale;

      varying vec2 vUv;
      varying vec3 vPosition;

      void main() {
        float t = uTime * uSpeed;

        float v1 = sin(vUv.x * uScale * 10.0 + t);
        float v2 = sin(vUv.y * uScale * 10.0 + t);
        float v3 = sin((vUv.x + vUv.y) * uScale * 10.0 + t);
        float v4 = sin(sqrt(vUv.x * vUv.x + vUv.y * vUv.y) * uScale * 10.0 + t);

        float v = (v1 + v2 + v3 + v4) * 0.25;

        vec3 color = mix(uColor1, uColor2, v * 0.5 + 0.5);

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(0x6600ff) },
      uColor2: { value: new THREE.Color(0xff0066) },
      uSpeed: { value: 1.0 },
      uScale: { value: 1.0 },
    },
  },

  // Gradiente animado
  gradientFlow: {
    vertexShader: /* glsl */ `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;
      uniform vec3 uColor3;
      uniform float uAngle;

      varying vec2 vUv;

      void main() {
        float angle = uAngle + uTime * 0.5;
        vec2 dir = vec2(cos(angle), sin(angle));
        float t = dot(vUv - 0.5, dir) + 0.5;

        vec3 color;
        if(t < 0.5) {
          color = mix(uColor1, uColor2, t * 2.0);
        } else {
          color = mix(uColor2, uColor3, (t - 0.5) * 2.0);
        }

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new THREE.Color(0x6600ff) },
      uColor2: { value: new THREE.Color(0xff0066) },
      uColor3: { value: new THREE.Color(0x00ffff) },
      uAngle: { value: 0 },
    },
  },

  // Glass/Vidrio refractivo
  glass: {
    vertexShader: /* glsl */ `
      varying vec3 vReflect;
      varying vec3 vRefract;
      varying float vReflectionFactor;
      varying vec2 vUv;

      uniform float uRefractionRatio;
      uniform float uFresnelBias;
      uniform float uFresnelScale;
      uniform float uFresnelPower;

      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);

        vec3 worldNormal = normalize(mat3(modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz) * normal);
        vec3 I = worldPosition.xyz - cameraPosition;

        vReflect = reflect(I, worldNormal);
        vRefract = refract(normalize(I), worldNormal, uRefractionRatio);
        vReflectionFactor = uFresnelBias + uFresnelScale * pow(1.0 + dot(normalize(I), worldNormal), uFresnelPower);

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform samplerCube uEnvMap;
      uniform vec3 uTint;
      uniform float uOpacity;

      varying vec3 vReflect;
      varying vec3 vRefract;
      varying float vReflectionFactor;
      varying vec2 vUv;

      void main() {
        vec4 reflectedColor = textureCube(uEnvMap, vec3(-vReflect.x, vReflect.yz));
        vec4 refractedColor = textureCube(uEnvMap, vec3(-vRefract.x, vRefract.yz));

        vec3 color = mix(refractedColor.rgb, reflectedColor.rgb, clamp(vReflectionFactor, 0.0, 1.0));
        color *= uTint;

        gl_FragColor = vec4(color, uOpacity);
      }
    `,
    uniforms: {
      uEnvMap: { value: null },
      uTint: { value: new THREE.Color(0xffffff) },
      uOpacity: { value: 0.9 },
      uRefractionRatio: { value: 0.98 },
      uFresnelBias: { value: 0.1 },
      uFresnelScale: { value: 1.0 },
      uFresnelPower: { value: 2.0 },
    },
  },

  // Noise distortion
  noiseDistortion: {
    vertexShader: /* glsl */ `
      uniform float uTime;
      uniform float uAmplitude;
      uniform float uFrequency;

      varying vec2 vUv;
      varying vec3 vNormal;

      ${ShaderLibrary.noise}

      void main() {
        vUv = uv;
        vNormal = normal;

        vec3 pos = position;
        float noise = snoise(vec3(position.xy * uFrequency, uTime * 0.5)) * uAmplitude;
        pos += normal * noise;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor1;
      uniform vec3 uColor2;

      varying vec2 vUv;
      varying vec3 vNormal;

      ${ShaderLibrary.noise}

      void main() {
        float noise = snoise(vec3(vUv * 5.0, uTime * 0.3)) * 0.5 + 0.5;
        vec3 color = mix(uColor1, uColor2, noise);

        // Rim lighting
        float rim = 1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0);
        rim = pow(rim, 2.0);
        color += rim * 0.3;

        gl_FragColor = vec4(color, 1.0);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uAmplitude: { value: 0.1 },
      uFrequency: { value: 3.0 },
      uColor1: { value: new THREE.Color(0x6600ff) },
      uColor2: { value: new THREE.Color(0x00ffff) },
    },
  },

  // Wireframe glow
  wireframeGlow: {
    vertexShader: /* glsl */ `
      varying vec3 vBarycentric;

      void main() {
        // Asignar coordenadas baricéntricas basadas en el índice del vértice
        int vertexIndex = gl_VertexID % 3;
        if(vertexIndex == 0) {
          vBarycentric = vec3(1.0, 0.0, 0.0);
        } else if(vertexIndex == 1) {
          vBarycentric = vec3(0.0, 1.0, 0.0);
        } else {
          vBarycentric = vec3(0.0, 0.0, 1.0);
        }

        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uThickness;
      uniform float uGlowIntensity;

      varying vec3 vBarycentric;

      float edgeFactor() {
        vec3 d = fwidth(vBarycentric);
        vec3 a3 = smoothstep(vec3(0.0), d * uThickness, vBarycentric);
        return min(min(a3.x, a3.y), a3.z);
      }

      void main() {
        float edge = 1.0 - edgeFactor();
        float glow = edge * uGlowIntensity;

        vec3 color = uColor * glow;
        float alpha = edge;

        // Pulse effect
        float pulse = sin(uTime * 2.0) * 0.2 + 0.8;
        color *= pulse;

        gl_FragColor = vec4(color, alpha);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x00ffff) },
      uThickness: { value: 1.5 },
      uGlowIntensity: { value: 2.0 },
    },
  },

  // Data stream effect (Matrix-like)
  dataStream: {
    vertexShader: /* glsl */ `
      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform vec3 uColor;
      uniform float uDensity;
      uniform float uSpeed;

      varying vec2 vUv;

      float random(vec2 co) {
        return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
      }

      float character(float index, vec2 uv) {
        // Simple character representation
        return step(0.5, random(floor(uv * 8.0) + index));
      }

      void main() {
        vec2 uv = vUv * uDensity;
        vec2 cell = floor(uv);
        vec2 local = fract(uv);

        float rand = random(cell);
        float speed = (rand * 2.0 + 1.0) * uSpeed;
        float offset = rand * 10.0;

        float y = fract(vUv.y * uDensity + uTime * speed + offset);

        // Trail effect
        float trail = smoothstep(0.0, 0.4, y) * smoothstep(1.0, 0.6, y);

        // Character flicker
        float char = step(0.5, random(cell + floor(uTime * 10.0)));

        vec3 color = uColor * trail * char;

        // Glow on leading edge
        float glow = smoothstep(0.9, 1.0, y) * 2.0;
        color += uColor * glow;

        gl_FragColor = vec4(color, trail);
      }
    `,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(0x00ff00) },
      uDensity: { value: 30.0 },
      uSpeed: { value: 0.5 },
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 MATERIAL FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

export function createShaderMaterial(config: ShaderConfig): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: config.vertexShader,
    fragmentShader: config.fragmentShader,
    uniforms: config.uniforms || {},
    transparent: config.transparent ?? true,
    depthWrite: config.depthWrite ?? true,
    depthTest: config.depthTest ?? true,
    blending: config.blending ?? THREE.NormalBlending,
    side: config.side ?? THREE.FrontSide,
  })
}

export function createPresetMaterial(
  preset: keyof typeof ShaderPresets,
  overrides?: Partial<ShaderUniforms>,
): THREE.ShaderMaterial {
  const presetConfig = ShaderPresets[preset]
  const uniforms = { ...presetConfig.uniforms }

  // Apply overrides
  if (overrides) {
    Object.keys(overrides).forEach((key) => {
      if (uniforms[key]) {
        uniforms[key].value = overrides[key]?.value ?? uniforms[key].value
      }
    })
  }

  return new THREE.ShaderMaterial({
    vertexShader: presetConfig.vertexShader,
    fragmentShader: presetConfig.fragmentShader,
    uniforms,
    transparent: true,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔄 UNIFORM UPDATER
// ═══════════════════════════════════════════════════════════════════════════════

export function updateShaderUniforms(
  material: THREE.ShaderMaterial,
  updates: Partial<Record<string, unknown>>,
): void {
  Object.keys(updates).forEach((key) => {
    if (material.uniforms[key]) {
      material.uniforms[key].value = updates[key]
    }
  })
}

export function updateTime(material: THREE.ShaderMaterial, time: number): void {
  if (material.uniforms.uTime) {
    material.uniforms.uTime.value = time
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  ShaderPresets,
  createShaderMaterial,
  createPresetMaterial,
  updateShaderUniforms,
  updateTime,
}
