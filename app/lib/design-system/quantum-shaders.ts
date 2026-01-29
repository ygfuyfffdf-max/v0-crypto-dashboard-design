/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — ULTRA ADVANCED WEBGPU SHADERS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Shaders cinematográficos de última generación.
 * Liquid distortion, volumetric fog, fractal mandelbulb, quantum particles.
 *
 * PALETA: #8B00FF / #FFD700 / #FF1493 / #000000 / #FFFFFF
 * ⛔ CYAN PROHIBIDO ETERNAMENTE
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// VERTEX SHADER — QUANTUM DISTORTION
// ═══════════════════════════════════════════════════════════════════════════════

export const quantumDistortionVertex = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDistortion;

uniform float uTime;
uniform float uDistortionIntensity;
uniform float uMood; // -1 stress to +1 euphoric
uniform vec2 uMouse;

// Simplex noise helper
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
  vNormal = normal;
  
  vec3 pos = position;
  
  // Multi-layer distortion
  float noise1 = snoise(pos * 2.0 + uTime * 0.3);
  float noise2 = snoise(pos * 4.0 - uTime * 0.2);
  float noise3 = snoise(pos * 8.0 + uTime * 0.1);
  
  // Mood affects distortion intensity
  float moodFactor = 1.0 + uMood * 0.5;
  
  // Mouse attraction
  float mouseInfluence = 1.0 - smoothstep(0.0, 0.5, length(uv - uMouse));
  
  // Combined distortion
  float distortion = (noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2) * uDistortionIntensity * moodFactor;
  distortion += mouseInfluence * 0.1;
  
  pos += normal * distortion;
  
  vDistortion = distortion;
  vPosition = pos;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// FRAGMENT SHADER — LIQUID METAL VOID
// ═══════════════════════════════════════════════════════════════════════════════

export const liquidMetalVoidFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDistortion;

uniform float uTime;
uniform float uMood;
uniform float uCapitalHealth; // 0-1
uniform float uIntensity;
uniform vec2 uResolution;
uniform vec2 uMouse;

// CHRONOS 2026 Palette (normalized)
const vec3 VIOLET = vec3(0.545, 0.0, 1.0);      // #8B00FF
const vec3 GOLD = vec3(1.0, 0.843, 0.0);         // #FFD700
const vec3 PLASMA = vec3(1.0, 0.078, 0.576);     // #FF1493
const vec3 VOID = vec3(0.0, 0.0, 0.0);           // #000000

// ═══════════════════════════════════════════════════════════════════════════════
// NOISE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * noise(p * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIQUID DISTORTION
// ═══════════════════════════════════════════════════════════════════════════════

vec2 liquidDistort(vec2 uv, float time, float intensity) {
  float n1 = fbm(uv * 3.0 + time * 0.15, 6);
  float n2 = fbm(uv * 5.0 - time * 0.1, 6);
  
  return uv + vec2(
    sin(n1 * 6.28318) * cos(n2 * 3.14159),
    cos(n1 * 3.14159) * sin(n2 * 6.28318)
  ) * intensity * 0.08;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOLUMETRIC FOG
// ═══════════════════════════════════════════════════════════════════════════════

float volumetricFog(vec2 uv, float time) {
  vec2 p = uv * 2.0 - 1.0;
  float fog = 0.0;
  
  for (float i = 1.0; i < 5.0; i++) {
    vec2 offset = vec2(
      sin(time * 0.1 * i + i * 1.5) * 0.3,
      cos(time * 0.08 * i + i * 2.0) * 0.3
    );
    
    float dist = length(p - offset);
    fog += 0.05 / (dist + 0.1) * (1.0 / i);
  }
  
  return fog * 0.3;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENERGY PARTICLES
// ═══════════════════════════════════════════════════════════════════════════════

float quantumParticles(vec2 uv, float time) {
  float particles = 0.0;
  
  for (float i = 0.0; i < 20.0; i++) {
    float seed = i * 17.31;
    vec2 particlePos = vec2(
      fract(sin(seed) * 43758.5453 + time * (0.05 + i * 0.01)),
      fract(cos(seed * 1.7) * 23421.631 + time * (0.03 + i * 0.008))
    );
    
    float dist = length(uv - particlePos);
    float size = 0.002 + sin(time * 2.0 + i) * 0.001;
    float glow = size / (dist + 0.001);
    
    particles += glow * 0.01;
  }
  
  return clamp(particles, 0.0, 1.0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// RADIAL VOID GRADIENT
// ═══════════════════════════════════════════════════════════════════════════════

float voidGradient(vec2 uv) {
  vec2 center = vec2(0.5);
  float dist = length(uv - center);
  
  return smoothstep(0.0, 0.8, dist);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN FRAGMENT
// ═══════════════════════════════════════════════════════════════════════════════

void main() {
  vec2 uv = vUv;
  
  // Apply liquid distortion
  float distortIntensity = 0.5 + uMood * 0.3;
  uv = liquidDistort(uv, uTime, distortIntensity);
  
  // Mouse influence
  float mouseGlow = 1.0 - smoothstep(0.0, 0.3, length(vUv - uMouse));
  
  // Base void gradient
  float voidMask = voidGradient(uv);
  
  // Layered noise
  float n1 = fbm(uv * 3.0 + uTime * 0.1, 8);
  float n2 = fbm(uv * 6.0 - uTime * 0.08, 6);
  float n3 = fbm(uv * 12.0 + uTime * 0.05, 4);
  
  // Combined noise
  float combinedNoise = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
  
  // Color mixing based on mood and capital
  vec3 color1 = mix(VIOLET, GOLD, uCapitalHealth);
  vec3 color2 = mix(PLASMA, VIOLET, 0.5 + uMood * 0.5);
  
  // Base color with noise influence
  vec3 baseColor = mix(color1, color2, combinedNoise);
  
  // Add volumetric fog
  float fog = volumetricFog(uv, uTime);
  baseColor += VIOLET * fog * 0.5;
  
  // Add quantum particles
  float particles = quantumParticles(uv, uTime);
  baseColor += GOLD * particles * (0.3 + uCapitalHealth * 0.7);
  
  // Mouse glow effect
  baseColor += (VIOLET * 0.5 + GOLD * 0.5) * mouseGlow * 0.3;
  
  // Apply void gradient (darker toward edges)
  baseColor = mix(baseColor, VOID, voidMask * 0.7);
  
  // Intensity control
  baseColor *= uIntensity;
  
  // Final vignette
  float vignette = 1.0 - smoothstep(0.3, 0.9, length(vUv - 0.5));
  baseColor *= vignette;
  
  // Output with alpha
  gl_FragColor = vec4(baseColor, 1.0);
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// RIPPLE SHADER FOR BUTTONS
// ═══════════════════════════════════════════════════════════════════════════════

export const rippleButtonFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uRippleOrigin;
uniform float uRippleProgress;
uniform vec3 uBaseColor;
uniform vec3 uRippleColor;

void main() {
  float dist = length(vUv - uRippleOrigin);
  
  // Ripple wave
  float ripple = sin(dist * 30.0 - uRippleProgress * 10.0) * 0.5 + 0.5;
  ripple *= smoothstep(uRippleProgress, 0.0, dist);
  ripple *= 1.0 - uRippleProgress;
  
  // Base glow
  float glow = 0.02 / (dist + 0.02);
  
  vec3 color = mix(uBaseColor, uRippleColor, ripple * 0.5 + glow * 0.3);
  
  gl_FragColor = vec4(color, 1.0);
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// GLASS REFLECTION SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const glassReflectionFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

uniform float uTime;
uniform vec2 uMouse;
uniform float uBlur;
uniform vec3 uBorderColor;
uniform float uBorderGlow;

const vec3 VIOLET = vec3(0.545, 0.0, 1.0);
const vec3 GOLD = vec3(1.0, 0.843, 0.0);

// Fresnel effect
float fresnel(vec3 viewDir, vec3 normal, float power) {
  return pow(1.0 - max(dot(viewDir, normal), 0.0), power);
}

void main() {
  // Base glass color (very dark)
  vec3 glassColor = vec3(0.04, 0.04, 0.05);
  
  // Simulated view direction
  vec3 viewDir = normalize(vec3(vUv - 0.5, 1.0));
  vec3 normal = normalize(vNormal);
  
  // Fresnel for edge glow
  float fresnelFactor = fresnel(viewDir, normal, 3.0);
  
  // Border glow
  float borderDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
  float borderGlow = smoothstep(0.05, 0.0, borderDist) * uBorderGlow;
  
  // Mouse proximity glow
  float mouseGlow = 1.0 - smoothstep(0.0, 0.4, length(vUv - uMouse));
  
  // Animated reflection
  float reflection = sin(vUv.x * 20.0 + uTime) * cos(vUv.y * 20.0 - uTime) * 0.02;
  
  // Combine effects
  vec3 finalColor = glassColor;
  finalColor += VIOLET * fresnelFactor * 0.3;
  finalColor += uBorderColor * borderGlow;
  finalColor += mix(VIOLET, GOLD, mouseGlow) * mouseGlow * 0.2;
  finalColor += vec3(reflection);
  
  // Output with transparency
  float alpha = 0.7 + fresnelFactor * 0.2 + borderGlow * 0.1;
  
  gl_FragColor = vec4(finalColor, alpha);
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE FORMATION SHADER (Logo)
// ═══════════════════════════════════════════════════════════════════════════════

export const particleFormationVertex = /* glsl */ `
precision highp float;

attribute vec3 targetPosition;
attribute float particleIndex;

uniform float uTime;
uniform float uFormProgress; // 0 = scattered, 1 = formed
uniform float uDisperse;
uniform vec2 uMouse;

varying vec3 vColor;
varying float vAlpha;

const vec3 VIOLET = vec3(0.545, 0.0, 1.0);
const vec3 GOLD = vec3(1.0, 0.843, 0.0);
const vec3 PLASMA = vec3(1.0, 0.078, 0.576);

// Hash function
float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {
  // Random scattered position
  vec3 scattered = vec3(
    (hash(particleIndex) - 0.5) * 10.0,
    (hash(particleIndex * 2.0) - 0.5) * 10.0,
    (hash(particleIndex * 3.0) - 0.5) * 5.0
  );
  
  // Interpolate between scattered and target
  float progress = uFormProgress * (1.0 - uDisperse);
  vec3 pos = mix(scattered, targetPosition, progress);
  
  // Add subtle movement
  pos.x += sin(uTime + particleIndex) * 0.02 * (1.0 - progress);
  pos.y += cos(uTime * 1.3 + particleIndex * 0.5) * 0.02 * (1.0 - progress);
  
  // Mouse dispersion
  vec4 projected = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  vec2 screenPos = projected.xy / projected.w;
  float mouseDistance = length(screenPos - uMouse);
  float mousePush = smoothstep(0.3, 0.0, mouseDistance) * uDisperse;
  pos += normalize(pos) * mousePush;
  
  // Color based on particle index
  float colorMix = hash(particleIndex * 7.0);
  if (colorMix < 0.33) {
    vColor = VIOLET;
  } else if (colorMix < 0.66) {
    vColor = GOLD;
  } else {
    vColor = PLASMA;
  }
  
  // Alpha based on formation progress
  vAlpha = 0.3 + progress * 0.7;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = (3.0 + progress * 2.0) * (300.0 / length(gl_Position.xyz));
}
`

export const particleFormationFragment = /* glsl */ `
precision highp float;

varying vec3 vColor;
varying float vAlpha;

void main() {
  // Circular particle with soft edges
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  float alpha = smoothstep(0.5, 0.2, dist) * vAlpha;
  
  // Glow effect
  float glow = 0.1 / (dist + 0.1);
  
  vec3 finalColor = vColor + vColor * glow * 0.5;
  
  gl_FragColor = vec4(finalColor, alpha);
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const quantumShaders = {
  vertex: {
    quantumDistortion: quantumDistortionVertex,
    particleFormation: particleFormationVertex,
  },
  fragment: {
    liquidMetalVoid: liquidMetalVoidFragment,
    rippleButton: rippleButtonFragment,
    glassReflection: glassReflectionFragment,
    particleFormation: particleFormationFragment,
  },
}

export default quantumShaders
