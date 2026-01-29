/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — R3F MATERIALES PBR SUPREMOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Materiales personalizados para React Three Fiber:
 * - QuantumGlassMaterial: Vidrio con chromatic aberration
 * - HolographicMaterial: Efecto holográfico iridiscente
 * - LiquidMetalMaterial: Metal líquido con fresnel
 * - PlasmaOrbMaterial: Orbe de energía con ruido
 * - VolumetricGlowMaterial: Glow volumétrico
 *
 * @version HYPER-INFINITY 2026.1
 */

import * as THREE from 'three'
import { shaderMaterial } from '@react-three/drei'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🪟 QUANTUM GLASS MATERIAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QuantumGlassMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#8B00FF'),
    uOpacity: 0.5,
    uIOR: 1.5,
    uThickness: 0.2,
    uChromaticAberration: 0.03,
    uRoughness: 0.1,
    uEnvMapIntensity: 1.0,
    uFresnelPower: 3.0,
  },
  // Vertex Shader
  /* glsl */ `
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
  `,
  // Fragment Shader
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uOpacity;
    uniform float uIOR;
    uniform float uThickness;
    uniform float uChromaticAberration;
    uniform float uRoughness;
    uniform float uEnvMapIntensity;
    uniform float uFresnelPower;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Fresnel effect
      float fresnel = pow(1.0 - abs(dot(normal, viewDir)), uFresnelPower);
      
      // Edge glow with time animation
      float edgeGlow = fresnel * (0.8 + 0.2 * sin(uTime * 2.0));
      
      // Base color with gradient
      vec3 baseColor = uColor * (0.5 + 0.5 * fresnel);
      
      // Chromatic aberration simulation
      vec3 refractedColor = vec3(
        uColor.r * (1.0 + uChromaticAberration),
        uColor.g,
        uColor.b * (1.0 - uChromaticAberration)
      );
      
      // Mix based on viewing angle
      vec3 finalColor = mix(baseColor, refractedColor, fresnel * 0.5);
      
      // Add edge highlight
      finalColor += vec3(1.0) * edgeGlow * 0.3;
      
      // Alpha based on fresnel and opacity
      float alpha = mix(uOpacity * 0.5, uOpacity, fresnel);
      
      gl_FragColor = vec4(finalColor, alpha);
    }
  `,
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌈 HOLOGRAPHIC MATERIAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const HolographicMaterial = shaderMaterial(
  {
    uTime: 0,
    uIntensity: 1.0,
    uScanlineSpeed: 1.0,
    uRainbowScale: 5.0,
    uGlitchIntensity: 0.1,
    uBaseColor: new THREE.Color('#000000'),
  },
  // Vertex
  /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldNormal;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vWorldNormal = normalize((modelMatrix * vec4(normal, 0.0)).xyz);
      
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment
  /* glsl */ `
    uniform float uTime;
    uniform float uIntensity;
    uniform float uScanlineSpeed;
    uniform float uRainbowScale;
    uniform float uGlitchIntensity;
    uniform vec3 uBaseColor;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    varying vec3 vWorldNormal;

    // CHRONOS palette rainbow
    vec3 rainbow(float t) {
      vec3 violet = vec3(0.545, 0.0, 1.0);
      vec3 gold = vec3(1.0, 0.843, 0.0);
      vec3 plasma = vec3(1.0, 0.078, 0.576);
      vec3 cyan = vec3(0.0, 1.0, 1.0);
      
      t = fract(t);
      if (t < 0.25) return mix(violet, gold, t * 4.0);
      else if (t < 0.5) return mix(gold, plasma, (t - 0.25) * 4.0);
      else if (t < 0.75) return mix(plasma, cyan, (t - 0.5) * 4.0);
      else return mix(cyan, violet, (t - 0.75) * 4.0);
    }

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // View angle for diffraction
      float NdotV = dot(normal, viewDir);
      float angle = acos(abs(NdotV));
      
      // Rainbow diffraction
      float phase = angle * uRainbowScale + uTime * 0.3;
      phase += (vUv.x + vUv.y) * 3.0;
      vec3 rainbowColor = rainbow(phase);
      
      // Scanlines
      float scanline = sin((vUv.y + uTime * uScanlineSpeed) * 100.0);
      scanline = smoothstep(0.3, 0.7, scanline * 0.5 + 0.5);
      
      // Fresnel rim
      float fresnel = pow(1.0 - abs(NdotV), 4.0);
      
      // Glitch effect
      float glitch = step(0.98, hash(vec2(floor(vUv.y * 50.0), floor(uTime * 20.0))));
      vec3 glitchColor = glitch > 0.5 ? vec3(1.0, 0.078, 0.576) : vec3(0.0);
      
      // Combine
      vec3 color = uBaseColor + rainbowColor * uIntensity;
      color += vec3(0.545, 0.0, 1.0) * fresnel * 0.5; // Violet rim
      color *= 0.8 + scanline * 0.2;
      color = mix(color, glitchColor, glitch * uGlitchIntensity);
      
      float alpha = 0.7 + fresnel * 0.3;
      
      gl_FragColor = vec4(color, alpha * uIntensity);
    }
  `,
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚙️ LIQUID METAL MATERIAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const LiquidMetalMaterial = shaderMaterial(
  {
    uTime: 0,
    uRoughness: 0.15,
    uMetalness: 1.0,
    uColor: new THREE.Color('#8B00FF'),
    uRippleStrength: 0.1,
    uEnvMapIntensity: 1.0,
  },
  // Vertex
  /* glsl */ `
    uniform float uTime;
    uniform float uRippleStrength;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    // Simplex noise
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
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
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    void main() {
      vUv = uv;
      
      // Liquid displacement
      vec3 noiseCoord = position * 2.0 + vec3(uTime * 0.5);
      float displacement = snoise(noiseCoord) * uRippleStrength;
      displacement += snoise(noiseCoord * 2.0 + 100.0) * uRippleStrength * 0.5;
      
      vec3 newPosition = position + normal * displacement;
      
      vNormal = normalize(normalMatrix * normal);
      
      vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
      vWorldPosition = worldPosition.xyz;
      
      vec4 mvPosition = viewMatrix * worldPosition;
      vViewPosition = -mvPosition.xyz;
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment
  /* glsl */ `
    uniform float uTime;
    uniform float uRoughness;
    uniform float uMetalness;
    uniform vec3 uColor;
    uniform float uEnvMapIntensity;

    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    const float PI = 3.14159265359;

    // PBR functions
    float DistributionGGX(vec3 N, vec3 H, float roughness) {
      float a = roughness * roughness;
      float a2 = a * a;
      float NdotH = max(dot(N, H), 0.0);
      float NdotH2 = NdotH * NdotH;
      float denom = (NdotH2 * (a2 - 1.0) + 1.0);
      return a2 / (PI * denom * denom);
    }

    vec3 fresnelSchlick(float cosTheta, vec3 F0) {
      return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
    }

    void main() {
      vec3 N = normalize(vNormal);
      vec3 V = normalize(vViewPosition);
      
      vec3 F0 = mix(vec3(0.04), uColor, uMetalness);
      
      // Multiple light sources
      vec3 lightPositions[3];
      lightPositions[0] = vec3(5.0, 5.0, 5.0);
      lightPositions[1] = vec3(-5.0, 3.0, -3.0);
      lightPositions[2] = vec3(0.0, -5.0, 5.0);
      
      vec3 lightColors[3];
      lightColors[0] = vec3(0.545, 0.0, 1.0) * 300.0;
      lightColors[1] = vec3(1.0, 0.843, 0.0) * 250.0;
      lightColors[2] = vec3(1.0, 0.078, 0.576) * 200.0;
      
      vec3 Lo = vec3(0.0);
      
      for (int i = 0; i < 3; i++) {
        vec3 L = normalize(lightPositions[i] - vWorldPosition);
        vec3 H = normalize(V + L);
        float distance = length(lightPositions[i] - vWorldPosition);
        float attenuation = 1.0 / (distance * distance);
        vec3 radiance = lightColors[i] * attenuation;
        
        float NDF = DistributionGGX(N, H, uRoughness);
        vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
        
        vec3 specular = NDF * F / 4.0;
        float NdotL = max(dot(N, L), 0.0);
        Lo += specular * radiance * NdotL;
      }
      
      // Fresnel rim
      float fresnel = pow(1.0 - max(dot(N, V), 0.0), 4.0);
      vec3 rimColor = uColor * fresnel * 0.5;
      
      vec3 ambient = vec3(0.03) * uColor;
      vec3 color = ambient + Lo + rimColor;
      
      // Tonemapping
      color = color / (color + vec3(1.0));
      color = pow(color, vec3(1.0/2.2));
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ PLASMA ORB MATERIAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PlasmaOrbMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color('#8B00FF'),
    uColor2: new THREE.Color('#FFD700'),
    uColor3: new THREE.Color('#FF1493'),
    uIntensity: 1.5,
    uSpeed: 1.0,
    uNoiseScale: 3.0,
    uPulseSpeed: 2.0,
  },
  // Vertex
  /* glsl */ `
    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    void main() {
      vUv = uv;
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uIntensity;
    uniform float uSpeed;
    uniform float uNoiseScale;
    uniform float uPulseSpeed;

    varying vec2 vUv;
    varying vec3 vPosition;
    varying vec3 vNormal;

    // Noise functions
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
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
      p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
      vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
    }

    float fbm(vec3 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 5; i++) {
        value += amplitude * snoise(p);
        p *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      float time = uTime * uSpeed;
      
      // Multiple noise layers
      vec3 noiseCoord = vPosition * uNoiseScale + vec3(time * 0.3);
      float noise1 = fbm(noiseCoord);
      float noise2 = fbm(noiseCoord * 1.5 + vec3(100.0, 0.0, 0.0));
      float noise3 = fbm(noiseCoord * 2.0 + vec3(0.0, 100.0, 0.0));
      
      // Color mixing based on noise
      vec3 color = uColor1 * (noise1 * 0.5 + 0.5);
      color = mix(color, uColor2, noise2 * 0.5 + 0.5);
      color = mix(color, uColor3, noise3 * 0.3);
      
      // Pulse effect
      float pulse = sin(uTime * uPulseSpeed) * 0.2 + 0.8;
      color *= pulse;
      
      // Fresnel glow
      vec3 viewDir = normalize(cameraPosition - vPosition);
      float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.0);
      color += uColor1 * fresnel * 0.5;
      
      // Core glow
      float coreGlow = 1.0 - length(vPosition) * 0.3;
      coreGlow = max(coreGlow, 0.0);
      color += uColor2 * coreGlow * 0.3;
      
      // Intensity
      color *= uIntensity;
      
      // Alpha with fresnel
      float alpha = 0.8 + fresnel * 0.2;
      
      gl_FragColor = vec4(color, alpha);
    }
  `,
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💫 VOLUMETRIC GLOW MATERIAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const VolumetricGlowMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color('#8B00FF'),
    uIntensity: 1.0,
    uFalloff: 2.0,
    uGlowRadius: 1.0,
  },
  // Vertex
  /* glsl */ `
    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vPosition = position;
      vNormal = normalize(normalMatrix * normal);
      vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment
  /* glsl */ `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uIntensity;
    uniform float uFalloff;
    uniform float uGlowRadius;

    varying vec3 vPosition;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vec3 viewDir = normalize(cameraPosition - vWorldPosition);
      
      // Fresnel-based glow
      float fresnel = 1.0 - max(dot(vNormal, viewDir), 0.0);
      fresnel = pow(fresnel, uFalloff);
      
      // Distance-based falloff
      float dist = length(vPosition);
      float distFalloff = 1.0 - smoothstep(0.0, uGlowRadius, dist);
      
      // Combine
      float glow = fresnel * distFalloff * uIntensity;
      
      // Pulse
      glow *= 0.8 + 0.2 * sin(uTime * 2.0);
      
      // Color
      vec3 color = uColor * glow;
      
      // Add core brightness
      color += uColor * distFalloff * 0.3;
      
      gl_FragColor = vec4(color, glow);
    }
  `,
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QuantumMaterials = {
  QuantumGlassMaterial,
  HolographicMaterial,
  LiquidMetalMaterial,
  PlasmaOrbMaterial,
  VolumetricGlowMaterial,
}

export default QuantumMaterials
