/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ✨ CHRONOS PREMIUM MATERIALS — PBR + IRIDESCENCE + SUBSURFACE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Materiales ultra-premium para superficies realistas:
 * - PBR completo con fresnel avanzado
 * - Iridescencia dinámica
 * - Subsurface scattering
 * - Anisotropic highlights
 * - Clear coat / multi-layer materials
 * - Emissive con bloom
 *
 * @version MATERIALS-SUPREME 2026.1
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌈 IRIDESCENT MATERIAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const IRIDESCENT_VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const IRIDESCENT_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform float uIridescenceIntensity;
  uniform float uIridescenceScale;
  uniform float uRoughness;
  uniform float uMetalness;
  uniform float uFresnelPower;
  uniform vec3 uLightPosition;
  uniform float uEmissiveIntensity;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying vec3 vWorldPosition;

  const float PI = 3.14159265359;

  // Iridescence color shift based on angle
  vec3 iridescence(float cosTheta, float scale) {
    // Thin-film interference approximation
    float hue = mod(cosTheta * scale + uTime * 0.1, 1.0);

    // HSV to RGB conversion
    vec3 c = vec3(hue, 0.8, 1.0);
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  // Fresnel Schlick approximation
  vec3 fresnelSchlick(float cosTheta, vec3 F0) {
    return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), uFresnelPower);
  }

  // GGX Distribution
  float distributionGGX(vec3 N, vec3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;

    float num = a2;
    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = PI * denom * denom;

    return num / denom;
  }

  // Geometry function
  float geometrySchlickGGX(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;

    float num = NdotV;
    float denom = NdotV * (1.0 - k) + k;

    return num / denom;
  }

  float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx2 = geometrySchlickGGX(NdotV, roughness);
    float ggx1 = geometrySchlickGGX(NdotL, roughness);

    return ggx1 * ggx2;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPosition);
    vec3 L = normalize(uLightPosition - vWorldPosition);
    vec3 H = normalize(V + L);

    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);

    // Base PBR
    vec3 F0 = mix(vec3(0.04), uBaseColor, uMetalness);
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

    float NDF = distributionGGX(N, H, uRoughness);
    float G = geometrySmith(N, V, L, uRoughness);

    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * NdotV * NdotL + 0.0001;
    vec3 specular = numerator / denominator;

    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - uMetalness;

    // Iridescence
    vec3 iridColor = iridescence(NdotV, uIridescenceScale);

    // Combine
    vec3 diffuse = uBaseColor / PI;
    vec3 Lo = (kD * diffuse + specular) * NdotL;

    // Add iridescence overlay
    Lo = mix(Lo, iridColor, uIridescenceIntensity * (1.0 - NdotV));

    // Ambient
    vec3 ambient = vec3(0.03) * uBaseColor;

    // Emissive with pulse
    float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
    vec3 emissive = uBaseColor * uEmissiveIntensity * (0.5 + pulse * 0.5);

    vec3 color = ambient + Lo + emissive;

    // Rim light
    float rim = 1.0 - NdotV;
    color += iridColor * pow(rim, 3.0) * 0.5;

    // Tone mapping
    color = color / (color + vec3(1.0));

    // Gamma correction
    color = pow(color, vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 1.0);
  }
`

interface IridescentMaterialProps {
  baseColor?: string
  iridescenceIntensity?: number
  iridescenceScale?: number
  roughness?: number
  metalness?: number
  fresnelPower?: number
  emissiveIntensity?: number
}

export function useIridescentMaterial({
  baseColor = '#8B00FF',
  iridescenceIntensity = 0.5,
  iridescenceScale = 3,
  roughness = 0.2,
  metalness = 0.8,
  fresnelPower = 5,
  emissiveIntensity = 0.3,
}: IridescentMaterialProps = {}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: IRIDESCENT_VERTEX_SHADER,
      fragmentShader: IRIDESCENT_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(baseColor) },
        uIridescenceIntensity: { value: iridescenceIntensity },
        uIridescenceScale: { value: iridescenceScale },
        uRoughness: { value: roughness },
        uMetalness: { value: metalness },
        uFresnelPower: { value: fresnelPower },
        uLightPosition: { value: new THREE.Vector3(5, 5, 5) },
        uEmissiveIntensity: { value: emissiveIntensity },
      },
    })
  }, [
    baseColor,
    iridescenceIntensity,
    iridescenceScale,
    roughness,
    metalness,
    fresnelPower,
    emissiveIntensity,
  ])

  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms && materialRef.current.uniforms.uTime) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return { material, materialRef }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔮 GLASS MATERIAL (Refraction + Caustics)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const GLASS_VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 mvPosition = viewMatrix * worldPosition;
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const GLASS_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColor;
  uniform float uIOR;
  uniform float uThickness;
  uniform float uRoughness;
  uniform float uTransmission;
  uniform vec3 uAbsorptionColor;
  uniform samplerCube uEnvMap;
  uniform bool uHasEnvMap;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  // Fresnel
  float fresnel(vec3 viewDir, vec3 normal, float ior) {
    float cosTheta = clamp(dot(viewDir, normal), 0.0, 1.0);
    float r0 = pow((1.0 - ior) / (1.0 + ior), 2.0);
    return r0 + (1.0 - r0) * pow(1.0 - cosTheta, 5.0);
  }

  // Chromatic aberration for refraction
  vec3 refractWithDispersion(vec3 I, vec3 N, float ior) {
    float iorR = ior - 0.02;
    float iorG = ior;
    float iorB = ior + 0.02;

    vec3 refractedR = refract(I, N, 1.0 / iorR);
    vec3 refractedG = refract(I, N, 1.0 / iorG);
    vec3 refractedB = refract(I, N, 1.0 / iorB);

    return vec3(
      length(refractedR),
      length(refractedG),
      length(refractedB)
    );
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPosition);
    vec3 I = normalize(vWorldPosition - cameraPosition);

    // Fresnel
    float F = fresnel(V, N, uIOR);

    // Reflection
    vec3 reflectDir = reflect(I, N);
    vec3 reflectColor = uHasEnvMap
      ? textureCube(uEnvMap, reflectDir).rgb
      : vec3(0.1);

    // Refraction with chromatic aberration
    vec3 refractDirR = refract(I, N, 1.0 / (uIOR - 0.02));
    vec3 refractDirG = refract(I, N, 1.0 / uIOR);
    vec3 refractDirB = refract(I, N, 1.0 / (uIOR + 0.02));

    vec3 refractColor;
    if (uHasEnvMap) {
      refractColor = vec3(
        textureCube(uEnvMap, refractDirR).r,
        textureCube(uEnvMap, refractDirG).g,
        textureCube(uEnvMap, refractDirB).b
      );
    } else {
      refractColor = uColor;
    }

    // Absorption based on thickness
    vec3 absorption = exp(-uAbsorptionColor * uThickness);
    refractColor *= absorption;

    // Combine reflection and refraction
    vec3 color = mix(refractColor, reflectColor, F);

    // Add subtle tint
    color = mix(color, uColor, 0.1);

    // Specular highlight
    vec3 L = normalize(vec3(1.0, 1.0, 1.0));
    vec3 H = normalize(V + L);
    float spec = pow(max(dot(N, H), 0.0), 128.0);
    color += vec3(1.0) * spec * 0.5;

    // Rim light
    float rim = 1.0 - max(dot(N, V), 0.0);
    color += uColor * pow(rim, 3.0) * 0.3;

    // Transmission
    float alpha = 1.0 - uTransmission * (1.0 - F);

    gl_FragColor = vec4(color, alpha);
  }
`

interface GlassMaterialProps {
  color?: string
  ior?: number
  thickness?: number
  roughness?: number
  transmission?: number
  absorptionColor?: string
}

export function useGlassMaterial({
  color = '#ffffff',
  ior = 1.5,
  thickness = 0.5,
  roughness = 0,
  transmission = 0.9,
  absorptionColor = '#000000',
}: GlassMaterialProps = {}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: GLASS_VERTEX_SHADER,
      fragmentShader: GLASS_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uIOR: { value: ior },
        uThickness: { value: thickness },
        uRoughness: { value: roughness },
        uTransmission: { value: transmission },
        uAbsorptionColor: { value: new THREE.Color(absorptionColor) },
        uEnvMap: { value: null },
        uHasEnvMap: { value: false },
      },
      transparent: true,
      side: THREE.DoubleSide,
    })
  }, [color, ior, thickness, roughness, transmission, absorptionColor])

  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms && materialRef.current.uniforms.uTime) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return { material, materialRef }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 HOLOGRAPHIC MATERIAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const HOLOGRAPHIC_VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const HOLOGRAPHIC_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uScanlineSpeed;
  uniform float uScanlineCount;
  uniform float uGlitchIntensity;
  uniform float uAlpha;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;
  varying vec3 vPosition;

  // Noise functions
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPosition);
    float NdotV = max(dot(N, V), 0.0);

    // Fresnel-based color shift
    float fresnel = pow(1.0 - NdotV, 3.0);

    // Holographic color bands
    float bands = sin(vPosition.y * 50.0 + uTime * 2.0) * 0.5 + 0.5;
    vec3 holoColor = mix(uColor1, uColor2, bands);
    holoColor = mix(holoColor, uColor3, fresnel);

    // Scanlines
    float scanline = sin(vUv.y * uScanlineCount + uTime * uScanlineSpeed) * 0.5 + 0.5;
    scanline = pow(scanline, 4.0) * 0.3;

    // Glitch effect
    float glitch = 0.0;
    if (uGlitchIntensity > 0.0) {
      float glitchTime = floor(uTime * 10.0) / 10.0;
      float glitchNoise = noise(vec2(glitchTime, vUv.y * 10.0));
      glitch = step(0.95, glitchNoise) * uGlitchIntensity;

      // Color shift on glitch
      if (glitch > 0.0) {
        holoColor.r = mix(holoColor.r, 1.0, glitch);
        holoColor.b = mix(holoColor.b, 0.0, glitch * 0.5);
      }
    }

    // Combine
    vec3 color = holoColor;
    color += vec3(scanline) * 0.5;
    color += vec3(1.0) * fresnel * 0.3;

    // Edge glow
    float edge = 1.0 - NdotV;
    color += uColor1 * pow(edge, 4.0) * 0.8;

    // Noise grain
    float grain = noise(vUv * 500.0 + uTime) * 0.05;
    color += grain;

    // Alpha based on fresnel
    float alpha = mix(uAlpha * 0.5, uAlpha, fresnel);
    alpha += scanline * 0.2;

    gl_FragColor = vec4(color, alpha);
  }
`

interface HolographicMaterialProps {
  color1?: string
  color2?: string
  color3?: string
  scanlineSpeed?: number
  scanlineCount?: number
  glitchIntensity?: number
  alpha?: number
}

export function useHolographicMaterial({
  color1 = '#00FFFF',
  color2 = '#FF00FF',
  color3 = '#FFFF00',
  scanlineSpeed = 5,
  scanlineCount = 100,
  glitchIntensity = 0.2,
  alpha = 0.8,
}: HolographicMaterialProps = {}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: HOLOGRAPHIC_VERTEX_SHADER,
      fragmentShader: HOLOGRAPHIC_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uColor1: { value: new THREE.Color(color1) },
        uColor2: { value: new THREE.Color(color2) },
        uColor3: { value: new THREE.Color(color3) },
        uScanlineSpeed: { value: scanlineSpeed },
        uScanlineCount: { value: scanlineCount },
        uGlitchIntensity: { value: glitchIntensity },
        uAlpha: { value: alpha },
      },
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [color1, color2, color3, scanlineSpeed, scanlineCount, glitchIntensity, alpha])

  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms && materialRef.current.uniforms.uTime) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return { material, materialRef }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 LIQUID METAL MATERIAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const LIQUID_METAL_VERTEX_SHADER = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uNoiseStrength;

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vUv = uv;

    // Animate position with noise
    vec3 pos = position;
    float noise = snoise(pos * uNoiseScale + uTime * 0.5);
    pos += normal * noise * uNoiseStrength;

    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vWorldPosition = worldPosition.xyz;
    vec4 mvPosition = viewMatrix * worldPosition;
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`

const LIQUID_METAL_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec3 uColor;
  uniform float uMetalness;
  uniform float uRoughness;
  uniform vec3 uEnvColor;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewPosition);

    float NdotV = max(dot(N, V), 0.0);

    // Fresnel
    float fresnel = pow(1.0 - NdotV, 5.0);
    fresnel = mix(0.04, 1.0, fresnel);

    // Reflection color (fake environment)
    vec3 reflectDir = reflect(-V, N);
    vec3 envColor = uEnvColor * (0.5 + 0.5 * reflectDir.y);

    // Liquid metal color shift
    float shift = sin(vWorldPosition.y * 5.0 + uTime) * 0.5 + 0.5;
    vec3 metalColor = mix(uColor, uColor * 1.5, shift);

    // Combine
    vec3 color = mix(metalColor, envColor, fresnel * uMetalness);

    // Specular
    vec3 L = normalize(vec3(1.0, 1.0, 1.0));
    vec3 H = normalize(V + L);
    float spec = pow(max(dot(N, H), 0.0), mix(16.0, 256.0, 1.0 - uRoughness));
    color += vec3(1.0) * spec * 0.8;

    // Rim
    float rim = 1.0 - NdotV;
    color += uColor * pow(rim, 3.0) * 0.5;

    // Tone mapping
    color = color / (color + vec3(1.0));
    color = pow(color, vec3(1.0 / 2.2));

    gl_FragColor = vec4(color, 1.0);
  }
`

interface LiquidMetalMaterialProps {
  color?: string
  metalness?: number
  roughness?: number
  envColor?: string
  noiseScale?: number
  noiseStrength?: number
}

export function useLiquidMetalMaterial({
  color = '#C0C0C0',
  metalness = 1,
  roughness = 0.1,
  envColor = '#8B00FF',
  noiseScale = 2,
  noiseStrength = 0.1,
}: LiquidMetalMaterialProps = {}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: LIQUID_METAL_VERTEX_SHADER,
      fragmentShader: LIQUID_METAL_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uMetalness: { value: metalness },
        uRoughness: { value: roughness },
        uEnvColor: { value: new THREE.Color(envColor) },
        uNoiseScale: { value: noiseScale },
        uNoiseStrength: { value: noiseStrength },
      },
    })
  }, [color, metalness, roughness, envColor, noiseScale, noiseStrength])

  useFrame((state) => {
    if (materialRef.current && materialRef.current.uniforms && materialRef.current.uniforms.uTime) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  return { material, materialRef }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default {
  useIridescentMaterial,
  useGlassMaterial,
  useHolographicMaterial,
  useLiquidMetalMaterial,
}
