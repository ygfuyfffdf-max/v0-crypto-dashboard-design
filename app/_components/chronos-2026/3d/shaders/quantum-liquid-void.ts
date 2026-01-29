/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS 2026 — QUANTUM LIQUID VOID SHADER
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Shader cinematográfico ultra-premium para el fondo del sistema CHRONOS.
 * Combina FBM noise, liquid distortion, y efectos de void cuántico.
 *
 * Características:
 * - Noise FBM de 8 octavas para textura orgánica
 * - Distorsión líquida con turbulencia
 * - Efecto de "void" con gradientes radiales
 * - Reactividad al mood financiero
 * - Partículas de energía cuántica
 *
 * Paleta: #8B00FF / #FFD700 / #FF1493 (⛔ CYAN PROHIBIDO)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// GLSL VERTEX SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const quantumLiquidVoidVertex = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;
varying float vTime;

uniform float uTime;
uniform float uDistortion;

void main() {
  vUv = uv;
  vPosition = position;
  vTime = uTime;
  
  // Distorsión sutil del mesh
  vec3 pos = position;
  float distortAmount = sin(position.x * 3.0 + uTime) * cos(position.y * 2.0 + uTime * 0.5) * uDistortion;
  pos.z += distortAmount * 0.1;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// GLSL FRAGMENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const quantumLiquidVoidFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;
varying float vTime;

uniform float uTime;
uniform float uMood;          // -1 (crisis) to +1 (ecstasy)
uniform float uIntensity;     // 0-1 overall intensity
uniform float uVoidRadius;    // 0-1 void effect radius
uniform vec3 uColor1;         // Primary color (purple)
uniform vec3 uColor2;         // Secondary color (magenta)
uniform vec3 uColor3;         // Accent color (gold)
uniform vec2 uResolution;
uniform float uCapitalRatio;  // 0-1 capital health

// ═══════════════════════════════════════════════════════════════════════════════
// NOISE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// Simple hash
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// 2D Noise
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  
  // Quintic interpolation
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// FBM (Fractal Brownian Motion) - 8 octaves
float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float lacunarity = 2.0;
  float persistence = 0.5;
  
  for (int i = 0; i < 8; i++) {
    value += amplitude * noise(p * frequency);
    frequency *= lacunarity;
    amplitude *= persistence;
  }
  
  return value;
}

// Turbulence (absolute FBM)
float turbulence(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  
  for (int i = 0; i < 6; i++) {
    value += amplitude * abs(noise(p * frequency) * 2.0 - 1.0);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}

// Worley noise (cellular)
float worley(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  
  float minDist = 1.0;
  
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 neighbor = vec2(float(x), float(y));
      vec2 point = hash(i + neighbor) * vec2(0.5) + 0.25 + neighbor;
      float dist = length(point - f);
      minDist = min(minDist, dist);
    }
  }
  
  return minDist;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIQUID DISTORTION
// ═══════════════════════════════════════════════════════════════════════════════

vec2 liquidDistort(vec2 uv, float time, float intensity) {
  // Multi-layer distortion
  float n1 = fbm(uv * 3.0 + time * 0.1);
  float n2 = fbm(uv * 5.0 - time * 0.15);
  float n3 = turbulence(uv * 2.0 + time * 0.05);
  
  vec2 offset = vec2(
    sin(n1 * 6.28) * cos(n2 * 3.14),
    cos(n1 * 3.14) * sin(n3 * 6.28)
  ) * intensity * 0.1;
  
  return uv + offset;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUANTUM VOID EFFECT
// ═══════════════════════════════════════════════════════════════════════════════

float voidEffect(vec2 uv, float radius) {
  vec2 center = vec2(0.5);
  float dist = length(uv - center);
  
  // Soft radial gradient
  float void_mask = smoothstep(radius, radius * 0.3, dist);
  
  // Add quantum fluctuations
  float fluctuation = fbm(uv * 10.0 + uTime * 0.5) * 0.1;
  
  return void_mask + fluctuation * (1.0 - void_mask);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENERGY PARTICLES
// ═══════════════════════════════════════════════════════════════════════════════

float particles(vec2 uv, float time) {
  float p = 0.0;
  
  for (float i = 0.0; i < 5.0; i++) {
    vec2 pos = vec2(
      hash(vec2(i, 0.0)) + sin(time * (0.5 + i * 0.1)) * 0.3,
      hash(vec2(0.0, i)) + cos(time * (0.3 + i * 0.15)) * 0.3
    );
    
    float dist = length(uv - pos);
    float glow = 0.01 / (dist * dist + 0.001);
    p += glow * hash(vec2(i * 17.0, i * 31.0));
  }
  
  return clamp(p, 0.0, 1.0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

void main() {
  vec2 uv = vUv;
  
  // Apply liquid distortion
  float distortIntensity = 0.5 + uMood * 0.3; // More distortion in crisis
  vec2 distortedUv = liquidDistort(uv, uTime, distortIntensity);
  
  // Base noise layers
  float n1 = fbm(distortedUv * 4.0 + uTime * 0.1);
  float n2 = turbulence(distortedUv * 3.0 - uTime * 0.05);
  float n3 = worley(distortedUv * 6.0 + uTime * 0.02);
  
  // Combine noises
  float combined = n1 * 0.5 + n2 * 0.3 + (1.0 - n3) * 0.2;
  
  // Void effect
  float voidMask = voidEffect(uv, uVoidRadius);
  
  // Color mixing based on mood
  // Crisis: more red/orange, Ecstasy: more gold/purple
  float moodFactor = uMood * 0.5 + 0.5; // 0-1 range
  
  vec3 crisisColor = vec3(0.9, 0.2, 0.1);    // Red-orange
  vec3 neutralColor = uColor1;                // Purple
  vec3 flowColor = uColor2;                   // Magenta  
  vec3 ecstasyColor = uColor3;                // Gold
  
  vec3 baseColor;
  if (uMood < 0.0) {
    baseColor = mix(crisisColor, neutralColor, moodFactor * 2.0);
  } else {
    baseColor = mix(neutralColor, ecstasyColor, moodFactor * 2.0 - 1.0);
  }
  
  // Apply noise to color
  vec3 color = mix(baseColor * 0.3, baseColor, combined);
  
  // Add secondary color highlights
  color = mix(color, uColor2, n2 * 0.3);
  
  // Void darkening
  color *= voidMask;
  
  // Energy particles
  float particleGlow = particles(uv, uTime) * uIntensity;
  vec3 particleColor = mix(uColor3, vec3(1.0), 0.5);
  color += particleColor * particleGlow * 0.5;
  
  // Capital-based brightness
  float brightness = 0.5 + uCapitalRatio * 0.5;
  color *= brightness;
  
  // Vignette
  float vignette = 1.0 - length((uv - 0.5) * 1.5);
  vignette = smoothstep(0.0, 0.7, vignette);
  color *= vignette;
  
  // Final output
  gl_FragColor = vec4(color, 1.0);
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFORMS CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

export const quantumLiquidVoidUniforms = {
  uTime: { value: 0 },
  uMood: { value: 0 }, // -1 to +1
  uIntensity: { value: 1.0 },
  uVoidRadius: { value: 0.8 },
  uDistortion: { value: 0.5 },
  uCapitalRatio: { value: 0.5 },
  uColor1: { value: [0.545, 0.361, 0.965] }, // #8B5CF6 Purple
  uColor2: { value: [0.925, 0.286, 0.6] }, // #EC4899 Magenta
  uColor3: { value: [0.984, 0.749, 0.141] }, // #FBBF24 Gold
  uResolution: { value: [1920, 1080] },
}

// ═══════════════════════════════════════════════════════════════════════════════
// WGSL VERSION (WebGPU)
// ═══════════════════════════════════════════════════════════════════════════════

export const quantumLiquidVoidWGSL = /* wgsl */ `
struct Uniforms {
  time: f32,
  mood: f32,
  intensity: f32,
  voidRadius: f32,
  distortion: f32,
  capitalRatio: f32,
  color1: vec3<f32>,
  color2: vec3<f32>,
  color3: vec3<f32>,
  resolution: vec2<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// Hash function
fn hash22(p: vec2<f32>) -> f32 {
  return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453123);
}

// 2D Noise
fn noise2d(p: vec2<f32>) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  
  let a = hash22(i);
  let b = hash22(i + vec2<f32>(1.0, 0.0));
  let c = hash22(i + vec2<f32>(0.0, 1.0));
  let d = hash22(i + vec2<f32>(1.0, 1.0));
  
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// FBM 8 octaves
fn fbm8(p: vec2<f32>) -> f32 {
  var value: f32 = 0.0;
  var amplitude: f32 = 0.5;
  var frequency: f32 = 1.0;
  var pos = p;
  
  for (var i: i32 = 0; i < 8; i = i + 1) {
    value = value + amplitude * noise2d(pos * frequency);
    frequency = frequency * 2.0;
    amplitude = amplitude * 0.5;
  }
  
  return value;
}

// Turbulence
fn turbulence(p: vec2<f32>) -> f32 {
  var value: f32 = 0.0;
  var amplitude: f32 = 0.5;
  var frequency: f32 = 1.0;
  
  for (var i: i32 = 0; i < 6; i = i + 1) {
    value = value + amplitude * abs(noise2d(p * frequency) * 2.0 - 1.0);
    frequency = frequency * 2.0;
    amplitude = amplitude * 0.5;
  }
  
  return value;
}

// Liquid distortion
fn liquidDistort(uv: vec2<f32>, time: f32, intensity: f32) -> vec2<f32> {
  let n1 = fbm8(uv * 3.0 + time * 0.1);
  let n2 = fbm8(uv * 5.0 - time * 0.15);
  let n3 = turbulence(uv * 2.0 + time * 0.05);
  
  let offset = vec2<f32>(
    sin(n1 * 6.28) * cos(n2 * 3.14),
    cos(n1 * 3.14) * sin(n3 * 6.28)
  ) * intensity * 0.1;
  
  return uv + offset;
}

// Void effect
fn voidEffect(uv: vec2<f32>, radius: f32, time: f32) -> f32 {
  let center = vec2<f32>(0.5);
  let dist = length(uv - center);
  let void_mask = smoothstep(radius, radius * 0.3, dist);
  let fluctuation = fbm8(uv * 10.0 + time * 0.5) * 0.1;
  return void_mask + fluctuation * (1.0 - void_mask);
}

@fragment
fn fragmentMain(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
  let distortIntensity = 0.5 + uniforms.mood * 0.3;
  let distortedUv = liquidDistort(uv, uniforms.time, distortIntensity);
  
  let n1 = fbm8(distortedUv * 4.0 + uniforms.time * 0.1);
  let n2 = turbulence(distortedUv * 3.0 - uniforms.time * 0.05);
  let combined = n1 * 0.6 + n2 * 0.4;
  
  let voidMask = voidEffect(uv, uniforms.voidRadius, uniforms.time);
  
  let moodFactor = uniforms.mood * 0.5 + 0.5;
  let baseColor = mix(uniforms.color1, uniforms.color3, moodFactor);
  
  var color = mix(baseColor * 0.3, baseColor, combined);
  color = color * voidMask;
  color = color * (0.5 + uniforms.capitalRatio * 0.5);
  
  let vignette = 1.0 - length((uv - 0.5) * 1.5);
  color = color * smoothstep(0.0, 0.7, vignette);
  
  return vec4<f32>(color, 1.0);
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const quantumLiquidVoidShaders = {
  vertex: quantumLiquidVoidVertex,
  fragment: quantumLiquidVoidFragment,
  uniforms: quantumLiquidVoidUniforms,
  wgsl: quantumLiquidVoidWGSL,
}

export default quantumLiquidVoidShaders
