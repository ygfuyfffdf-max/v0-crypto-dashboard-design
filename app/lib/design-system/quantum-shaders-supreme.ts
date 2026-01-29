/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — WEBGPU SHADERS SUPREMOS CINEMATOGRÁFICOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Shaders de última generación para efectos visuales cinematográficos:
 * - Liquid Distortion con ondas violeta/oro
 * - Volumetric Fog con profundidad real
 * - Quantum Particles (1M+ reactivas)
 * - Ray Marching SDF para orbs
 * - Frosted Glass Refraction
 *
 * PALETA: #8B00FF / #FFD700 / #FF1493 / #000000 / #FFFFFF
 * ⛔ PROHIBIDO: cyan, turquesa, azul frío
 *
 * @version 3.0.0 SUPREME CINEMATIC
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 LIQUID DISTORTION SHADER — VERTEX
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const liquidDistortionVertex = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDistortion;
varying vec3 vViewPosition;

uniform float uTime;
uniform float uDistortionIntensity;
uniform float uMood; // -1 stress, 0 flow, +1 euphoric
uniform vec2 uMouse;
uniform float uScroll;

// ═══ SIMPLEX NOISE 3D ═══
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
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
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// ═══ FBM (Fractal Brownian Motion) ═══
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 5; i++) {
    value += amplitude * snoise(p * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  return value;
}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  // Calculate distortion based on noise and mouse
  vec3 noisePos = position + vec3(uTime * 0.1, uTime * 0.05, 0.0);
  float noise = fbm(noisePos * 0.5) * uDistortionIntensity;
  
  // Mouse influence (magnetic attraction)
  vec2 mouseInfluence = (uMouse - 0.5) * 2.0;
  float mouseDist = length(uv - uMouse);
  float mouseForce = smoothstep(0.5, 0.0, mouseDist) * 0.2;
  
  // Mood-based intensity
  float moodMultiplier = 1.0 + uMood * 0.3;
  
  // Apply distortion
  vec3 distortedPosition = position;
  distortedPosition.z += noise * moodMultiplier;
  distortedPosition.xy += mouseInfluence * mouseForce;
  
  // Scroll parallax
  distortedPosition.y -= uScroll * 0.1;
  
  vDistortion = noise;
  vPosition = distortedPosition;
  
  vec4 mvPosition = modelViewMatrix * vec4(distortedPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 LIQUID DISTORTION SHADER — FRAGMENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const liquidDistortionFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDistortion;
varying vec3 vViewPosition;

uniform float uTime;
uniform float uMood;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

// CHRONOS Color palette (sin cyan!)
const vec3 VIOLET = vec3(0.545, 0.0, 1.0);       // #8B00FF
const vec3 GOLD = vec3(1.0, 0.843, 0.0);         // #FFD700
const vec3 PLASMA = vec3(1.0, 0.078, 0.576);     // #FF1493
const vec3 VOID = vec3(0.0, 0.0, 0.0);           // #000000
const vec3 WHITE = vec3(1.0, 1.0, 1.0);          // #FFFFFF

// ═══ NOISE FUNCTIONS ═══
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
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
    i.z + vec4(0.0, i1.z, i2.z, 1.0)) +
    i.y + vec4(0.0, i1.y, i2.y, 1.0)) +
    i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 6; i++) {
    value += amplitude * snoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec2 uv = vUv;
  
  // Time-based animation
  float t = uTime * 0.2;
  
  // Create liquid waves
  float wave1 = snoise(vec3(uv * 3.0, t)) * 0.5 + 0.5;
  float wave2 = snoise(vec3(uv * 5.0 + 100.0, t * 1.5)) * 0.5 + 0.5;
  float wave3 = snoise(vec3(uv * 2.0 + 200.0, t * 0.7)) * 0.5 + 0.5;
  
  // Combine waves for liquid effect
  float liquid = (wave1 + wave2 * 0.5 + wave3 * 0.3) / 1.8;
  
  // Color mixing based on mood
  vec3 color1 = VIOLET;
  vec3 color2 = GOLD;
  vec3 color3 = PLASMA;
  
  if (uMood < 0.0) {
    // Stress mode - more plasma
    color1 = mix(VIOLET, PLASMA, abs(uMood));
  } else if (uMood > 0.0) {
    // Euphoric mode - more gold
    color2 = mix(GOLD, WHITE * 0.9 + GOLD * 0.1, uMood);
  }
  
  // Create gradient based on position and liquid
  vec3 baseColor = mix(color1, color2, liquid);
  baseColor = mix(baseColor, color3, wave3 * 0.2);
  
  // Add volumetric fog effect
  float fog = fbm(vec3(uv * 2.0, t * 0.3)) * 0.3;
  baseColor = mix(baseColor, VOID, fog);
  
  // Mouse glow
  float mouseDist = length(uv - uMouse);
  float mouseGlow = smoothstep(0.4, 0.0, mouseDist) * 0.3;
  baseColor += color2 * mouseGlow;
  
  // Fresnel-like edge glow
  float fresnel = pow(1.0 - abs(dot(normalize(vViewPosition), vNormal)), 3.0);
  baseColor += color1 * fresnel * 0.2;
  
  // Vignette
  vec2 vignetteUv = uv * (1.0 - uv);
  float vignette = vignetteUv.x * vignetteUv.y * 15.0;
  vignette = pow(vignette, 0.3);
  baseColor *= vignette;
  
  // Output with slight transparency
  gl_FragColor = vec4(baseColor, 0.95);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔮 VOLUMETRIC ORB SHADER — RAY MARCHING SDF
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const volumetricOrbVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const volumetricOrbFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform float uPulse; // 0-1 synchronized with heartbeat/capital
uniform float uHealth; // 0-1 capital health
uniform float uMood; // -1 to 1
uniform vec2 uResolution;
uniform vec3 uCameraPos;

const vec3 VIOLET = vec3(0.545, 0.0, 1.0);
const vec3 GOLD = vec3(1.0, 0.843, 0.0);
const vec3 PLASMA = vec3(1.0, 0.078, 0.576);

const int MAX_STEPS = 100;
const float MAX_DIST = 100.0;
const float SURF_DIST = 0.001;

// SDF for sphere
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

// SDF for torus (rings)
float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

// Smooth minimum for blending shapes
float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Noise for distortion
float noise(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.543))) * 43758.5453);
}

// Scene SDF
float sceneSDF(vec3 p) {
  // Animated pulse
  float pulse = 1.0 + sin(uTime * 3.14159 * uPulse * 2.0) * 0.1;
  
  // Core orb with distortion
  float distort = noise(p * 5.0 + uTime) * 0.1;
  float core = sdSphere(p, 0.8 * pulse + distort);
  
  // Inner energy
  float inner = sdSphere(p, 0.3 + sin(uTime * 2.0) * 0.05);
  
  // Orbital rings
  mat3 rot1 = mat3(
    cos(uTime * 0.5), 0.0, sin(uTime * 0.5),
    0.0, 1.0, 0.0,
    -sin(uTime * 0.5), 0.0, cos(uTime * 0.5)
  );
  
  mat3 rot2 = mat3(
    1.0, 0.0, 0.0,
    0.0, cos(uTime * 0.3), -sin(uTime * 0.3),
    0.0, sin(uTime * 0.3), cos(uTime * 0.3)
  );
  
  float ring1 = sdTorus(rot1 * p, vec2(1.2, 0.02));
  float ring2 = sdTorus(rot2 * p, vec2(1.4, 0.015));
  
  // Combine with smooth blending
  float d = smin(core, inner, 0.2);
  d = min(d, ring1);
  d = min(d, ring2);
  
  return d;
}

// Ray marching
float rayMarch(vec3 ro, vec3 rd) {
  float dO = 0.0;
  
  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * dO;
    float dS = sceneSDF(p);
    dO += dS;
    if (dO > MAX_DIST || dS < SURF_DIST) break;
  }
  
  return dO;
}

// Normal calculation
vec3 getNormal(vec3 p) {
  float d = sceneSDF(p);
  vec2 e = vec2(0.001, 0.0);
  vec3 n = d - vec3(
    sceneSDF(p - e.xyy),
    sceneSDF(p - e.yxy),
    sceneSDF(p - e.yyx)
  );
  return normalize(n);
}

// Lighting
vec3 getLight(vec3 p, vec3 rd, vec3 n) {
  // Main light
  vec3 lightPos = vec3(2.0, 3.0, -2.0);
  vec3 l = normalize(lightPos - p);
  
  // Diffuse
  float diff = max(dot(n, l), 0.0);
  
  // Specular
  vec3 r = reflect(-l, n);
  float spec = pow(max(dot(-rd, r), 0.0), 32.0);
  
  // Fresnel
  float fresnel = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);
  
  // Color based on health
  vec3 coreColor = mix(PLASMA, GOLD, uHealth);
  vec3 rimColor = VIOLET;
  
  vec3 color = coreColor * diff * 0.6;
  color += GOLD * spec * 0.4;
  color += rimColor * fresnel * 0.5;
  
  return color;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;
  
  // Camera setup
  vec3 ro = vec3(0.0, 0.0, 3.0);
  vec3 rd = normalize(vec3(uv, -1.0));
  
  // Ray march
  float d = rayMarch(ro, rd);
  
  vec3 color = vec3(0.0);
  
  if (d < MAX_DIST) {
    vec3 p = ro + rd * d;
    vec3 n = getNormal(p);
    color = getLight(p, rd, n);
    
    // Glow effect
    float glow = exp(-d * 0.5);
    color += VIOLET * glow * 0.3;
  }
  
  // Background glow
  float bgGlow = length(uv);
  color += VIOLET * 0.1 * (1.0 - bgGlow);
  
  // Pulsing emissive
  float emissive = sin(uTime * 3.14159 * uPulse * 2.0) * 0.5 + 0.5;
  color += mix(VIOLET, GOLD, emissive) * emissive * 0.2;
  
  gl_FragColor = vec4(color, 1.0);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ QUANTUM PARTICLES SHADER (1M+ PARTICLES)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const quantumParticlesVertex = /* glsl */ `
attribute vec3 velocity;
attribute float size;
attribute float colorMix;
attribute float delay;

varying vec3 vColor;
varying float vOpacity;

uniform float uTime;
uniform float uMood;
uniform vec2 uMouse;
uniform float uSpeed;

const vec3 VIOLET = vec3(0.545, 0.0, 1.0);
const vec3 GOLD = vec3(1.0, 0.843, 0.0);
const vec3 PLASMA = vec3(1.0, 0.078, 0.576);

void main() {
  float t = uTime * uSpeed + delay;
  
  // Animated position
  vec3 pos = position;
  pos += velocity * sin(t) * 0.5;
  pos.x += sin(t * 0.7 + pos.y) * 0.1;
  pos.y += cos(t * 0.5 + pos.x) * 0.1;
  pos.z += sin(t * 0.3 + pos.z) * 0.1;
  
  // Mouse attraction
  vec3 mousePos = vec3((uMouse - 0.5) * 2.0, 0.0);
  vec3 toMouse = mousePos - pos;
  float mouseInfluence = 1.0 / (1.0 + length(toMouse) * 5.0);
  pos += normalize(toMouse) * mouseInfluence * 0.3;
  
  // Color based on position and mood
  vec3 color1 = uMood > 0.0 ? GOLD : VIOLET;
  vec3 color2 = uMood < 0.0 ? PLASMA : VIOLET;
  vColor = mix(color1, color2, colorMix);
  
  // Opacity based on distance and time
  vOpacity = 0.5 + 0.5 * sin(t * 2.0 + colorMix * 6.28);
  vOpacity *= smoothstep(2.0, 0.0, length(pos));
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * (300.0 / -mvPosition.z);
}
`

export const quantumParticlesFragment = /* glsl */ `
varying vec3 vColor;
varying float vOpacity;

void main() {
  // Circular particle with soft edge
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  
  if (dist > 0.5) discard;
  
  // Soft glow
  float alpha = smoothstep(0.5, 0.0, dist) * vOpacity;
  
  // Core brightness
  float core = smoothstep(0.3, 0.0, dist);
  vec3 color = vColor + vec3(1.0) * core * 0.3;
  
  gl_FragColor = vec4(color, alpha);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌫️ FROSTED GLASS REFRACTION SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const frostedGlassVertex = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`

export const frostedGlassFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;
varying vec3 vWorldPosition;

uniform sampler2D uBackgroundTexture;
uniform vec2 uResolution;
uniform float uBlurAmount;
uniform float uRefractAmount;
uniform float uTime;
uniform vec3 uTint;

const vec3 VIOLET = vec3(0.545, 0.0, 1.0);

// Simple blur approximation
vec4 blur(sampler2D tex, vec2 uv, vec2 resolution, float amount) {
  vec4 color = vec4(0.0);
  vec2 texelSize = 1.0 / resolution;
  
  for (float x = -2.0; x <= 2.0; x += 1.0) {
    for (float y = -2.0; y <= 2.0; y += 1.0) {
      vec2 offset = vec2(x, y) * texelSize * amount;
      color += texture2D(tex, uv + offset);
    }
  }
  
  return color / 25.0;
}

void main() {
  vec3 viewDir = normalize(vViewPosition);
  vec3 normal = normalize(vNormal);
  
  // Refraction offset
  vec2 refractOffset = normal.xy * uRefractAmount;
  
  // Screen UV
  vec2 screenUV = gl_FragCoord.xy / uResolution;
  screenUV += refractOffset;
  
  // Blurred background
  vec4 background = blur(uBackgroundTexture, screenUV, uResolution, uBlurAmount);
  
  // Fresnel effect
  float fresnel = pow(1.0 - abs(dot(viewDir, normal)), 3.0);
  
  // Edge highlight
  vec3 edgeColor = VIOLET * fresnel * 0.5;
  
  // Tint
  vec3 tintedBg = mix(background.rgb, uTint, 0.1);
  
  // Final color with glass effect
  vec3 finalColor = tintedBg + edgeColor;
  
  // Slight transparency variation
  float alpha = 0.7 + fresnel * 0.2;
  
  gl_FragColor = vec4(finalColor, alpha);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎆 PARTICLE EXPLOSION SHADER (For celebrations)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const particleExplosionVertex = /* glsl */ `
attribute vec3 velocity;
attribute float size;
attribute float life;
attribute vec3 color;

varying vec3 vColor;
varying float vOpacity;

uniform float uTime;
uniform float uTrigger; // 0-1, triggers explosion
uniform vec3 uOrigin;

void main() {
  float t = uTime * uTrigger;
  
  // Explosion physics
  vec3 pos = uOrigin + position;
  pos += velocity * t;
  pos.y -= 4.9 * t * t; // Gravity
  
  // Life fade
  float lifeRemaining = max(0.0, 1.0 - t / life);
  vOpacity = lifeRemaining * lifeRemaining;
  
  vColor = color;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * lifeRemaining * (200.0 / -mvPosition.z);
}
`

export const particleExplosionFragment = /* glsl */ `
varying vec3 vColor;
varying float vOpacity;

void main() {
  vec2 center = gl_PointCoord - 0.5;
  float dist = length(center);
  
  if (dist > 0.5) discard;
  
  float alpha = smoothstep(0.5, 0.0, dist) * vOpacity;
  float core = smoothstep(0.3, 0.0, dist);
  
  vec3 color = vColor + vec3(1.0) * core * 0.5;
  
  gl_FragColor = vec4(color, alpha);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 RIPPLE SHADER (For buttons and interactions)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const rippleFragment = /* glsl */ `
precision highp float;

uniform vec2 uResolution;
uniform vec2 uRippleOrigin;
uniform float uRippleTime;
uniform float uRippleStrength;
uniform vec3 uRippleColor;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 center = uRippleOrigin;
  
  float dist = length(uv - center);
  float ripple = sin(dist * 30.0 - uRippleTime * 5.0) * 0.5 + 0.5;
  
  // Fade with distance and time
  float fade = smoothstep(1.0, 0.0, dist / (uRippleTime * 2.0));
  fade *= smoothstep(2.0, 0.0, uRippleTime);
  
  ripple *= fade * uRippleStrength;
  
  vec3 color = uRippleColor * ripple;
  
  gl_FragColor = vec4(color, ripple * 0.5);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 SHADER COLLECTIONS FOR EASY IMPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const QUANTUM_SHADERS = {
  liquidDistortion: {
    vertex: liquidDistortionVertex,
    fragment: liquidDistortionFragment,
    uniforms: {
      uTime: { value: 0 },
      uDistortionIntensity: { value: 0.3 },
      uMood: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
      uScroll: { value: 0 },
      uResolution: { value: [1920, 1080] },
    },
  },

  volumetricOrb: {
    vertex: volumetricOrbVertex,
    fragment: volumetricOrbFragment,
    uniforms: {
      uTime: { value: 0 },
      uPulse: { value: 1 },
      uHealth: { value: 1 },
      uMood: { value: 0 },
      uResolution: { value: [1920, 1080] },
      uCameraPos: { value: [0, 0, 3] },
    },
  },

  quantumParticles: {
    vertex: quantumParticlesVertex,
    fragment: quantumParticlesFragment,
    uniforms: {
      uTime: { value: 0 },
      uMood: { value: 0 },
      uMouse: { value: [0.5, 0.5] },
      uSpeed: { value: 1 },
    },
  },

  frostedGlass: {
    vertex: frostedGlassVertex,
    fragment: frostedGlassFragment,
    uniforms: {
      uResolution: { value: [1920, 1080] },
      uBlurAmount: { value: 40 },
      uRefractAmount: { value: 0.02 },
      uTime: { value: 0 },
      uTint: { value: [0.545, 0, 1] },
    },
  },

  particleExplosion: {
    vertex: particleExplosionVertex,
    fragment: particleExplosionFragment,
    uniforms: {
      uTime: { value: 0 },
      uTrigger: { value: 0 },
      uOrigin: { value: [0, 0, 0] },
    },
  },

  ripple: {
    fragment: rippleFragment,
    uniforms: {
      uResolution: { value: [1920, 1080] },
      uRippleOrigin: { value: [0.5, 0.5] },
      uRippleTime: { value: 0 },
      uRippleStrength: { value: 1 },
      uRippleColor: { value: [1, 0.843, 0] },
    },
  },
} as const

export type QuantumShaderType = keyof typeof QUANTUM_SHADERS
