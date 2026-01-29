/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS SUPREME SHADER SYSTEM 2026 — ELITE PARTICLE ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de shaders GLSL ultra-premium con:
 * - Paleta de colores moderna y sofisticada (violeta/oro/plasma)
 * - Animaciones fluidas con curvas de easing cinematográficas
 * - Efectos de iluminación volumétricos y subsurface scattering
 * - Interactividad hover/scroll con física realista
 * - Sistema de personalización dinámico
 * - Optimización multi-dispositivo y multi-navegador
 *
 * PALETA OFICIAL CHRONOS:
 * - Primary:   #8B00FF (Violeta Eléctrico)
 * - Secondary: #FFD700 (Oro Premium)
 * - Accent:    #FF1493 (Plasma/Fucsia)
 * - Void:      #0A0A0F (Negro Profundo)
 * - Glow:      #C084FC (Violeta Suave)
 *
 * ⛔ PROHIBIDO: Cyan, turquesa, azul frío puro
 *
 * @version 4.0.0 SUPREME ELITE
 * @author CHRONOS AI SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 SUPREME VERTEX SHADER — PARTÍCULAS CON FÍSICA AVANZADA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const supremeParticleVertex = /* glsl */ `
precision highp float;

// ═══ BUILT-IN ATTRIBUTES (WebGL puro) ═══
attribute vec3 position;
attribute vec2 uv;

// ═══ CUSTOM ATTRIBUTES ═══
attribute vec3 aVelocity;
attribute float aSize;
attribute float aColorMix;
attribute float aDelay;
attribute float aLifetime;
attribute float aPhase;
attribute float aOrbit;
attribute vec3 aRandomSeed;

// ═══ VARYINGS ═══
varying vec3 vColor;
varying float vOpacity;
varying float vGlow;
varying vec2 vUv;
varying float vDepth;
varying float vEnergy;
varying vec3 vWorldPosition;

// ═══ UNIFORMS ═══
uniform float uTime;
uniform float uDeltaTime;
uniform float uMood; // -1 stress, 0 flow, +1 euphoric
uniform vec2 uMouse;
uniform vec2 uMouseVelocity;
uniform float uMousePressed;
uniform float uScroll;
uniform float uScrollVelocity;
uniform float uSpeed;
uniform float uTurbulence;
uniform float uAttraction;
uniform float uPulseIntensity;
uniform float uWaveAmplitude;
uniform vec2 uResolution;
uniform vec3 uColorPrimary;
uniform vec3 uColorSecondary;
uniform vec3 uColorAccent;
uniform float uInteractionRadius;
uniform float uDepthOfField;
uniform float uParticleScale;

// ═══ TRANSFORMATION MATRICES (WebGL puro) ═══
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

// ═══ CHRONOS COLOR PALETTE (sin cyan!) ═══
const vec3 VIOLET_ELECTRIC = vec3(0.545, 0.0, 1.0);       // #8B00FF
const vec3 GOLD_PREMIUM = vec3(1.0, 0.843, 0.0);          // #FFD700
const vec3 PLASMA_PINK = vec3(1.0, 0.078, 0.576);         // #FF1493
const vec3 VOID_BLACK = vec3(0.039, 0.039, 0.059);        // #0A0A0F
const vec3 GLOW_VIOLET = vec3(0.753, 0.518, 0.988);       // #C084FC
const vec3 ROSE_SOFT = vec3(0.984, 0.471, 0.659);         // #FB7185
const vec3 AMBER_WARM = vec3(0.996, 0.682, 0.259);        // #FEAE42

// ═══ NOISE FUNCTIONS — Simplex 3D Optimizado ═══
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
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
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;

  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// ═══ FBM (Fractal Brownian Motion) para turbulencia ═══
float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  float lacunarity = 2.0;
  float persistence = 0.5;

  for (int i = 0; i < 6; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p * frequency);
    frequency *= lacunarity;
    amplitude *= persistence;
  }
  return value;
}

// ═══ CURL NOISE para movimiento fluido ═══
vec3 curlNoise(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0);
  vec3 dy = vec3(0.0, e, 0.0);
  vec3 dz = vec3(0.0, 0.0, e);

  float n1 = snoise(p + dy) - snoise(p - dy);
  float n2 = snoise(p + dz) - snoise(p - dz);
  float n3 = snoise(p + dx) - snoise(p - dx);
  float n4 = snoise(p + dz) - snoise(p - dz);
  float n5 = snoise(p + dx) - snoise(p - dx);
  float n6 = snoise(p + dy) - snoise(p - dy);

  return vec3(n1 - n2, n3 - n4, n5 - n6) / (2.0 * e);
}

// ═══ EASING FUNCTIONS cinematográficas ═══
float easeOutExpo(float x) { return x == 1.0 ? 1.0 : 1.0 - pow(2.0, -10.0 * x); }
float easeInOutCubic(float x) { return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }
float easeOutElastic(float x) {
  const float c4 = (2.0 * 3.14159265359) / 3.0;
  return x == 0.0 ? 0.0 : x == 1.0 ? 1.0 : pow(2.0, -10.0 * x) * sin((x * 10.0 - 0.75) * c4) + 1.0;
}
float easeOutBack(float x) {
  const float c1 = 1.70158;
  const float c3 = c1 + 1.0;
  return 1.0 + c3 * pow(x - 1.0, 3.0) + c1 * pow(x - 1.0, 2.0);
}

void main() {
  vUv = uv;

  // ═══ TIEMPO CON DELAY PERSONALIZADO ═══
  float t = (uTime + aDelay) * uSpeed;
  float lifeProgress = mod(t / aLifetime, 1.0);

  // ═══ POSICIÓN BASE CON FÍSICA ═══
  vec3 pos = position;

  // Aplicar velocidad inicial
  pos += aVelocity * sin(t * 0.5 + aPhase) * 0.5;

  // ═══ TURBULENCIA PROCEDURAL (Curl Noise) ═══
  vec3 turbulencePos = pos + vec3(uTime * 0.1);
  vec3 curl = curlNoise(turbulencePos * 0.3) * uTurbulence;
  pos += curl * 0.5;

  // ═══ MOVIMIENTO ORBITAL ═══
  float orbitAngle = t * aOrbit + aPhase * 6.28318;
  float orbitRadius = aRandomSeed.x * 0.5;
  pos.x += cos(orbitAngle) * orbitRadius;
  pos.y += sin(orbitAngle) * orbitRadius * 0.6;

  // ═══ ONDAS SINUSOIDALES MULTICAPA ═══
  float wave1 = sin(pos.x * 2.0 + t * 1.2) * uWaveAmplitude;
  float wave2 = cos(pos.y * 3.0 + t * 0.8) * uWaveAmplitude * 0.5;
  float wave3 = sin((pos.x + pos.y) * 1.5 + t * 1.5) * uWaveAmplitude * 0.3;
  pos.z += (wave1 + wave2 + wave3);

  // ═══ INTERACCIÓN CON MOUSE (Atracción Magnética) ═══
  vec3 mousePos3D = vec3((uMouse - 0.5) * 2.0, 0.0);
  vec3 toMouse = mousePos3D - pos;
  float mouseDistance = length(toMouse);

  // Atracción suave con easing
  float attractionStrength = smoothstep(uInteractionRadius, 0.0, mouseDistance) * uAttraction;
  attractionStrength *= easeOutExpo(1.0 - mouseDistance / uInteractionRadius);

  // Efecto de repulsión cuando está presionado
  float repulsion = uMousePressed * -0.5;
  attractionStrength += repulsion * smoothstep(uInteractionRadius * 0.5, 0.0, mouseDistance);

  // Agregar velocidad del mouse para efecto de arrastre
  vec3 mouseVel3D = vec3(uMouseVelocity, 0.0);
  pos += mouseVel3D * attractionStrength * 0.3;

  // Atracción/repulsión final
  pos += normalize(toMouse + 0.001) * attractionStrength * 0.4;

  // ═══ EFECTO DE SCROLL PARALLAX 3D ═══
  float scrollParallax = uScroll * (0.5 + aRandomSeed.y * 0.5);
  pos.y -= scrollParallax * 0.1;
  pos.z += scrollParallax * 0.05 * (aRandomSeed.z - 0.5);

  // Efecto de velocidad de scroll
  pos.y += uScrollVelocity * aRandomSeed.z * 0.05;

  // ═══ PULSACIÓN GLOBAL (Heartbeat) ═══
  float pulse = sin(t * 3.14159 * uPulseIntensity) * 0.5 + 0.5;
  float pulseEffect = easeOutElastic(pulse) * 0.1;
  pos *= 1.0 + pulseEffect;

  // ═══ COLORES BASADOS EN MOOD Y POSICIÓN ═══
  vec3 colorA = uColorPrimary;   // Violeta
  vec3 colorB = uColorSecondary; // Oro
  vec3 colorC = uColorAccent;    // Plasma

  // Mood modifica la mezcla de colores
  float moodFactor = uMood * 0.5 + 0.5; // 0-1

  // Color base mezclado por posición
  float colorPhase = aColorMix + snoise(pos * 0.5 + uTime * 0.1) * 0.3;
  colorPhase = fract(colorPhase);

  // Mezcla de tres colores suave
  vec3 finalColor;
  if (colorPhase < 0.33) {
    finalColor = mix(colorA, colorB, colorPhase * 3.0);
  } else if (colorPhase < 0.66) {
    finalColor = mix(colorB, colorC, (colorPhase - 0.33) * 3.0);
  } else {
    finalColor = mix(colorC, colorA, (colorPhase - 0.66) * 3.0);
  }

  // Mood influence en color
  if (uMood < 0.0) {
    // Stress: más plasma/rojo
    finalColor = mix(finalColor, colorC, abs(uMood) * 0.4);
  } else if (uMood > 0.0) {
    // Euphoric: más oro/dorado
    finalColor = mix(finalColor, colorB, uMood * 0.4);
  }

  // Agregar brillo cerca del mouse
  finalColor += colorB * attractionStrength * 0.5;

  vColor = finalColor;

  // ═══ OPACIDAD Y GLOW ═══
  // Base opacity from life cycle
  float lifeOpacity = sin(lifeProgress * 3.14159);
  lifeOpacity = easeOutExpo(lifeOpacity);

  // Distance fade
  float distanceFade = smoothstep(3.0, 0.0, length(pos));

  // Mouse proximity glow
  float mouseGlow = smoothstep(uInteractionRadius, 0.0, mouseDistance);

  vOpacity = lifeOpacity * distanceFade * (0.6 + aRandomSeed.x * 0.4);
  vGlow = mouseGlow * 0.5 + pulse * 0.3;

  // ═══ ENERGÍA (para efectos adicionales en fragment) ═══
  vEnergy = attractionStrength + pulse * 0.5;

  // ═══ POSICIÓN FINAL ═══
  vWorldPosition = pos;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vDepth = -mvPosition.z;

  // ═══ TAMAÑO DE PARTÍCULA ADAPTATIVO ═══
  float baseSize = aSize * uParticleScale;

  // Size varies with life
  baseSize *= 0.5 + lifeOpacity * 0.5;

  // Size boost near mouse
  baseSize *= 1.0 + mouseGlow * 0.3;

  // Depth of field effect
  float dofBlur = abs(vDepth - uDepthOfField) * 0.1;
  baseSize *= 1.0 + dofBlur * 0.2;

  // Perspective size
  gl_PointSize = baseSize * (300.0 / -mvPosition.z);
  gl_PointSize = clamp(gl_PointSize, 1.0, 64.0);

  gl_Position = projectionMatrix * mvPosition;
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 SUPREME FRAGMENT SHADER — PARTÍCULAS CON ILUMINACIÓN VOLUMÉTRICA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const supremeParticleFragment = /* glsl */ `
precision highp float;

varying vec3 vColor;
varying float vOpacity;
varying float vGlow;
varying vec2 vUv;
varying float vDepth;
varying float vEnergy;
varying vec3 vWorldPosition;

uniform float uTime;
uniform float uBloomIntensity;
uniform float uCoreIntensity;
uniform float uSoftEdge;
uniform int uParticleShape; // 0: circle, 1: star, 2: diamond, 3: glow orb
uniform vec3 uAmbientColor;
uniform float uChromaticAberration;

// ═══ SHAPE FUNCTIONS ═══

// Círculo suave con glow
float circleShape(vec2 uv, float softness) {
  float dist = length(uv);
  return smoothstep(0.5, 0.5 - softness, dist);
}

// Estrella de N puntas
float starShape(vec2 uv, float points, float innerRadius) {
  float angle = atan(uv.y, uv.x);
  float dist = length(uv);

  float star = cos(angle * points) * 0.5 + 0.5;
  star = mix(innerRadius, 1.0, star);

  return smoothstep(star * 0.5, star * 0.5 - 0.1, dist);
}

// Diamante/Rombo
float diamondShape(vec2 uv) {
  float dist = abs(uv.x) + abs(uv.y);
  return smoothstep(0.7, 0.5, dist);
}

// Orbe con glow volumétrico
float glowOrbShape(vec2 uv) {
  float dist = length(uv);

  // Core brillante
  float core = smoothstep(0.3, 0.0, dist);

  // Glow exterior
  float glow = exp(-dist * 3.0);

  // Anillos sutiles
  float rings = sin(dist * 20.0 - uTime * 2.0) * 0.1 + 0.9;

  return core + glow * 0.5 * rings;
}

void main() {
  vec2 uv = gl_PointCoord - 0.5;

  // ═══ SELECCIÓN DE FORMA ═══
  float shape;
  if (uParticleShape == 0) {
    shape = circleShape(uv, uSoftEdge);
  } else if (uParticleShape == 1) {
    shape = starShape(uv, 5.0, 0.3);
  } else if (uParticleShape == 2) {
    shape = diamondShape(uv);
  } else {
    shape = glowOrbShape(uv);
  }

  if (shape < 0.01) discard;

  // ═══ COLOR CON NÚCLEO BRILLANTE ═══
  float dist = length(uv);
  float coreBrightness = smoothstep(0.3, 0.0, dist) * uCoreIntensity;

  vec3 color = vColor;

  // Núcleo más brillante (blanco cálido)
  vec3 coreColor = mix(vColor, vec3(1.0, 0.95, 0.9), coreBrightness);
  color = mix(color, coreColor, coreBrightness);

  // ═══ ABERRACIÓN CROMÁTICA (sutil) ═══
  if (uChromaticAberration > 0.0) {
    float aberration = uChromaticAberration * (0.5 + vEnergy * 0.5);
    vec2 redOffset = uv * (1.0 + aberration * 0.02);
    vec2 blueOffset = uv * (1.0 - aberration * 0.02);

    float redShape = circleShape(redOffset, uSoftEdge);
    float blueShape = circleShape(blueOffset, uSoftEdge);

    color.r *= 1.0 + (redShape - shape) * 0.3;
    color.b *= 1.0 + (blueShape - shape) * 0.3;
  }

  // ═══ GLOW DINÁMICO ═══
  float glowAmount = vGlow * uBloomIntensity;
  color += vColor * glowAmount * 0.3;

  // ═══ AMBIENT LIGHT ═══
  color += uAmbientColor * 0.1;

  // ═══ ENERGÍA VISUAL ═══
  // Pulso de energía cuando hay interacción
  float energyPulse = sin(uTime * 10.0) * 0.5 + 0.5;
  color += vColor * vEnergy * energyPulse * 0.2;

  // ═══ ALPHA FINAL ═══
  float alpha = shape * vOpacity;
  alpha *= 1.0 + glowAmount * 0.3;

  // Depth fade (partículas lejanas más transparentes)
  float depthFade = smoothstep(5.0, 0.0, vDepth);
  alpha *= depthFade;

  gl_FragColor = vec4(color, alpha);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 SUPREME LIQUID DISTORTION SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const supremeLiquidVertex = /* glsl */ `
precision highp float;

// ═══ BUILT-IN ATTRIBUTES (WebGL puro) ═══
attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;

// ═══ TRANSFORMATION MATRICES (WebGL puro) ═══
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDistortion;
varying vec3 vViewPosition;
varying float vFresnel;

uniform float uTime;
uniform float uDistortionIntensity;
uniform float uMood;
uniform vec2 uMouse;
uniform float uScroll;
uniform float uWaveSpeed;
uniform float uWaveComplexity;

// Noise functions (same as particle shader)
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
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
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  // Multi-layer wave distortion
  float t = uTime * uWaveSpeed;
  vec3 noisePos = position + vec3(t * 0.1, t * 0.05, 0.0);

  // Complex wave pattern
  float noise1 = fbm(noisePos * 0.5, int(uWaveComplexity));
  float noise2 = fbm(noisePos * 1.0 + 100.0, int(uWaveComplexity));
  float noise3 = snoise(noisePos * 2.0 + 200.0);

  float totalNoise = (noise1 + noise2 * 0.5 + noise3 * 0.25) * uDistortionIntensity;

  // Mouse magnetic attraction
  vec2 mouseInfluence = (uMouse - 0.5) * 2.0;
  float mouseDist = length(uv - uMouse);
  float mouseForce = smoothstep(0.6, 0.0, mouseDist) * 0.3;

  // Mood-based intensity
  float moodMultiplier = 1.0 + uMood * 0.4;

  // Apply distortion
  vec3 distortedPosition = position;
  distortedPosition.z += totalNoise * moodMultiplier;
  distortedPosition.xy += mouseInfluence * mouseForce;

  // Scroll parallax
  distortedPosition.y -= uScroll * 0.15;
  distortedPosition.z += uScroll * 0.05;

  vDistortion = totalNoise;
  vPosition = distortedPosition;

  vec4 mvPosition = modelViewMatrix * vec4(distortedPosition, 1.0);
  vViewPosition = -mvPosition.xyz;

  // Fresnel calculation for edge glow
  vec3 viewDir = normalize(vViewPosition);
  vFresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 3.0);

  gl_Position = projectionMatrix * mvPosition;
}
`

export const supremeLiquidFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float vDistortion;
varying vec3 vViewPosition;
varying float vFresnel;

uniform float uTime;
uniform float uMood;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform float uRefractionStrength;
uniform float uBlurAmount;
uniform vec3 uColorPrimary;
uniform vec3 uColorSecondary;
uniform vec3 uColorAccent;
uniform float uVignetteIntensity;
uniform float uNoiseOverlay;

// CHRONOS Color palette
const vec3 VIOLET = vec3(0.545, 0.0, 1.0);
const vec3 GOLD = vec3(1.0, 0.843, 0.0);
const vec3 PLASMA = vec3(1.0, 0.078, 0.576);
const vec3 VOID = vec3(0.0, 0.0, 0.0);

// Noise function
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
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
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
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
  float t = uTime * 0.2;

  // ═══ LIQUID WAVES ═══
  float wave1 = snoise(vec3(uv * 3.0, t)) * 0.5 + 0.5;
  float wave2 = snoise(vec3(uv * 5.0 + 100.0, t * 1.5)) * 0.5 + 0.5;
  float wave3 = snoise(vec3(uv * 2.0 + 200.0, t * 0.7)) * 0.5 + 0.5;

  float liquid = (wave1 + wave2 * 0.5 + wave3 * 0.3) / 1.8;

  // ═══ COLOR MIXING BASED ON MOOD ═══
  vec3 color1 = uColorPrimary;   // Violeta
  vec3 color2 = uColorSecondary; // Oro
  vec3 color3 = uColorAccent;    // Plasma

  // Mood influence
  if (uMood < 0.0) {
    color1 = mix(uColorPrimary, uColorAccent, abs(uMood) * 0.5);
    color3 = mix(uColorAccent, vec3(0.8, 0.0, 0.2), abs(uMood) * 0.3);
  } else if (uMood > 0.0) {
    color2 = mix(uColorSecondary, vec3(1.0, 0.95, 0.8), uMood * 0.4);
  }

  // ═══ GRADIENT CREATION ═══
  vec3 baseColor = mix(color1, color2, liquid);
  baseColor = mix(baseColor, color3, wave3 * 0.25);

  // ═══ VOLUMETRIC FOG ═══
  float fog = fbm(vec3(uv * 2.0, t * 0.3)) * 0.25;
  baseColor = mix(baseColor, VOID, fog);

  // ═══ MOUSE GLOW ═══
  float mouseDist = length(uv - uMouse);
  float mouseGlow = smoothstep(0.5, 0.0, mouseDist) * 0.4;
  baseColor += color2 * mouseGlow;

  // ═══ FRESNEL EDGE GLOW ═══
  baseColor += color1 * vFresnel * 0.3;

  // ═══ NOISE OVERLAY ═══
  if (uNoiseOverlay > 0.0) {
    float noise = snoise(vec3(uv * 100.0, uTime * 0.5)) * 0.5 + 0.5;
    baseColor = mix(baseColor, baseColor * (0.9 + noise * 0.2), uNoiseOverlay);
  }

  // ═══ VIGNETTE ═══
  vec2 vignetteUv = uv * (1.0 - uv);
  float vignette = vignetteUv.x * vignetteUv.y * 15.0;
  vignette = pow(vignette, uVignetteIntensity);
  baseColor *= vignette;

  // ═══ OUTPUT ═══
  gl_FragColor = vec4(baseColor, 0.95);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ SUPREME RIPPLE INTERACTION SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const supremeRippleFragment = /* glsl */ `
precision highp float;

uniform vec2 uResolution;
uniform vec2 uRippleOrigin;
uniform float uRippleTime;
uniform float uRippleStrength;
uniform vec3 uRippleColor;
uniform float uRippleCount;
uniform float uRippleSpeed;
uniform float uRippleDecay;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec2 center = uRippleOrigin;

  float dist = length(uv - center);

  // Multiple concentric ripples
  float ripple = 0.0;
  for (float i = 0.0; i < 3.0; i++) {
    float offset = i * 0.1;
    float wavePhase = dist * 30.0 * uRippleCount - (uRippleTime - offset) * uRippleSpeed;
    float wave = sin(wavePhase) * 0.5 + 0.5;

    // Fade with distance and time
    float timeFade = exp(-uRippleTime * uRippleDecay * (1.0 + i * 0.3));
    float distFade = smoothstep(uRippleTime * 0.8, 0.0, dist);

    ripple += wave * timeFade * distFade * (1.0 - i * 0.2);
  }

  ripple *= uRippleStrength;

  // Color with slight chromatic shift
  vec3 color = uRippleColor;
  color.r *= 1.0 + ripple * 0.1;
  color.b *= 1.0 - ripple * 0.1;

  gl_FragColor = vec4(color * ripple, ripple * 0.6);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 SUPREME GLOW ORB SHADER (Ray Marching)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const supremeGlowOrbVertex = /* glsl */ `
precision highp float;

// ═══ BUILT-IN ATTRIBUTES (WebGL puro) ═══
attribute vec3 position;
attribute vec2 uv;

// ═══ TRANSFORMATION MATRICES (WebGL puro) ═══
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const supremeGlowOrbFragment = /* glsl */ `
precision highp float;

varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform float uPulse;
uniform float uHealth;
uniform float uMood;
uniform vec2 uResolution;
uniform vec3 uColorPrimary;
uniform vec3 uColorSecondary;
uniform vec3 uColorAccent;
uniform float uOrbSize;
uniform float uGlowIntensity;
uniform float uRingCount;

const int MAX_STEPS = 64;
const float MAX_DIST = 50.0;
const float SURF_DIST = 0.002;

// SDF primitives
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

float sdTorus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

// Rotation matrix
mat3 rotateY(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat3(c, 0, s, 0, 1, 0, -s, 0, c);
}

mat3 rotateX(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat3(1, 0, 0, 0, c, -s, 0, s, c);
}

// Scene SDF
float sceneSDF(vec3 p) {
  float pulse = 1.0 + sin(uTime * 3.14159 * uPulse) * 0.08;

  // Core orb
  float core = sdSphere(p, uOrbSize * pulse);

  // Inner energy sphere
  float inner = sdSphere(p, uOrbSize * 0.4 + sin(uTime * 2.0) * 0.05);

  // Orbital rings
  float rings = MAX_DIST;
  for (float i = 0.0; i < 3.0; i++) {
    if (i >= uRingCount) break;

    float angle1 = uTime * (0.3 + i * 0.1) + i * 2.094;
    float angle2 = uTime * (0.2 + i * 0.15) + i * 1.047;

    mat3 rot = rotateY(angle1) * rotateX(angle2);
    vec3 rotatedP = rot * p;

    float ringSize = uOrbSize * (1.3 + i * 0.3);
    float ringThickness = 0.015 - i * 0.003;
    float ring = sdTorus(rotatedP, vec2(ringSize, ringThickness));

    rings = min(rings, ring);
  }

  // Combine with smooth blending
  float d = smin(core, inner, 0.15);
  d = min(d, rings);

  return d;
}

// Ray marching
float rayMarch(vec3 ro, vec3 rd) {
  float dO = 0.0;

  for (int i = 0; i < MAX_STEPS; i++) {
    vec3 p = ro + rd * dO;
    float dS = sceneSDF(p);
    dO += dS;
    if (dO > MAX_DIST || abs(dS) < SURF_DIST) break;
  }

  return dO;
}

// Normal calculation
vec3 getNormal(vec3 p) {
  vec2 e = vec2(0.001, 0.0);
  return normalize(vec3(
    sceneSDF(p + e.xyy) - sceneSDF(p - e.xyy),
    sceneSDF(p + e.yxy) - sceneSDF(p - e.yxy),
    sceneSDF(p + e.yyx) - sceneSDF(p - e.yyx)
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);

  // Camera
  vec3 ro = vec3(0.0, 0.0, 3.5);
  vec3 rd = normalize(vec3(uv, -1.0));

  // Ray march
  float d = rayMarch(ro, rd);

  vec3 color = vec3(0.0);

  if (d < MAX_DIST) {
    vec3 p = ro + rd * d;
    vec3 n = getNormal(p);

    // Lighting
    vec3 lightPos = vec3(2.0, 3.0, 2.0);
    vec3 l = normalize(lightPos - p);

    float diff = max(dot(n, l), 0.0);
    float spec = pow(max(dot(reflect(-l, n), -rd), 0.0), 32.0);
    float fresnel = pow(1.0 - max(dot(-rd, n), 0.0), 3.0);

    // Color based on health and mood
    vec3 coreColor = mix(uColorAccent, uColorSecondary, uHealth);
    if (uMood < 0.0) {
      coreColor = mix(coreColor, uColorAccent, abs(uMood) * 0.5);
    }

    color = coreColor * diff * 0.6;
    color += uColorSecondary * spec * 0.4;
    color += uColorPrimary * fresnel * 0.5;

    // Glow
    float glow = exp(-d * 0.4) * uGlowIntensity;
    color += uColorPrimary * glow * 0.4;
  }

  // Background glow
  float bgGlow = 1.0 - length(uv);
  bgGlow = pow(max(bgGlow, 0.0), 2.0);
  color += uColorPrimary * bgGlow * 0.15;

  // Pulsing emissive
  float emissive = sin(uTime * 3.14159 * uPulse) * 0.5 + 0.5;
  color += mix(uColorPrimary, uColorSecondary, emissive) * emissive * 0.15;

  gl_FragColor = vec4(color, 1.0);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 SUPREME SHADER COLLECTION EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SUPREME_SHADERS = {
  particle: {
    vertex: supremeParticleVertex,
    fragment: supremeParticleFragment,
    defaultUniforms: {
      uTime: 0,
      uDeltaTime: 0.016,
      uMood: 0,
      uMouse: [0.5, 0.5],
      uMouseVelocity: [0, 0],
      uMousePressed: 0,
      uScroll: 0,
      uScrollVelocity: 0,
      uSpeed: 1,
      uTurbulence: 0.5,
      uAttraction: 0.3,
      uPulseIntensity: 1,
      uWaveAmplitude: 0.1,
      uResolution: [1920, 1080],
      uColorPrimary: [0.545, 0.0, 1.0], // Violeta
      uColorSecondary: [1.0, 0.843, 0.0], // Oro
      uColorAccent: [1.0, 0.078, 0.576], // Plasma
      uInteractionRadius: 0.5,
      uDepthOfField: 2.0,
      uParticleScale: 1.0,
      uBloomIntensity: 1.0,
      uCoreIntensity: 1.5,
      uSoftEdge: 0.2,
      uParticleShape: 0,
      uAmbientColor: [0.1, 0.05, 0.15],
      uChromaticAberration: 0.2,
    },
  },

  liquid: {
    vertex: supremeLiquidVertex,
    fragment: supremeLiquidFragment,
    defaultUniforms: {
      uTime: 0,
      uDistortionIntensity: 0.3,
      uMood: 0,
      uMouse: [0.5, 0.5],
      uScroll: 0,
      uWaveSpeed: 1.0,
      uWaveComplexity: 5,
      uResolution: [1920, 1080],
      uRefractionStrength: 0.02,
      uBlurAmount: 40,
      uColorPrimary: [0.545, 0.0, 1.0],
      uColorSecondary: [1.0, 0.843, 0.0],
      uColorAccent: [1.0, 0.078, 0.576],
      uVignetteIntensity: 0.3,
      uNoiseOverlay: 0.1,
    },
  },

  ripple: {
    vertex: null, // Uses fullscreen quad
    fragment: supremeRippleFragment,
    defaultUniforms: {
      uResolution: [1920, 1080],
      uRippleOrigin: [0.5, 0.5],
      uRippleTime: 0,
      uRippleStrength: 1,
      uRippleColor: [1.0, 0.843, 0.0],
      uRippleCount: 1,
      uRippleSpeed: 5,
      uRippleDecay: 2,
    },
  },

  glowOrb: {
    vertex: supremeGlowOrbVertex,
    fragment: supremeGlowOrbFragment,
    defaultUniforms: {
      uTime: 0,
      uPulse: 1,
      uHealth: 1,
      uMood: 0,
      uResolution: [1920, 1080],
      uColorPrimary: [0.545, 0.0, 1.0],
      uColorSecondary: [1.0, 0.843, 0.0],
      uColorAccent: [1.0, 0.078, 0.576],
      uOrbSize: 0.8,
      uGlowIntensity: 1.0,
      uRingCount: 3,
    },
  },
} as const

export type SupremeShaderType = keyof typeof SUPREME_SHADERS

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎛️ SHADER PRESETS PARA DIFERENTES PANELES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PANEL_SHADER_PRESETS = {
  dashboard: {
    shader: 'particle',
    config: {
      uSpeed: 0.8,
      uTurbulence: 0.4,
      uPulseIntensity: 0.8,
      uParticleShape: 3, // Glow orb
      uAttraction: 0.25,
    },
  },
  ventas: {
    shader: 'particle',
    config: {
      uSpeed: 1.0,
      uTurbulence: 0.6,
      uColorSecondary: [0.0, 0.8, 0.4], // Verde éxito
      uParticleShape: 0,
      uAttraction: 0.3,
    },
  },
  bancos: {
    shader: 'glowOrb',
    config: {
      uOrbSize: 0.6,
      uRingCount: 2,
      uGlowIntensity: 0.8,
    },
  },
  clientes: {
    shader: 'particle',
    config: {
      uSpeed: 0.7,
      uParticleShape: 1, // Stars
      uTurbulence: 0.3,
      uColorPrimary: [0.6, 0.2, 0.9],
    },
  },
  almacen: {
    shader: 'liquid',
    config: {
      uDistortionIntensity: 0.2,
      uWaveSpeed: 0.6,
      uWaveComplexity: 4,
    },
  },
  distribuidores: {
    shader: 'particle',
    config: {
      uSpeed: 1.2,
      uTurbulence: 0.7,
      uParticleShape: 2, // Diamond
      uColorAccent: [1.0, 0.5, 0.0], // Orange
    },
  },
  compras: {
    shader: 'particle',
    config: {
      uSpeed: 0.9,
      uColorPrimary: [0.3, 0.4, 0.9],
      uParticleShape: 0,
    },
  },
  gastos: {
    shader: 'liquid',
    config: {
      uDistortionIntensity: 0.25,
      uMood: -0.3,
      uColorAccent: [0.9, 0.2, 0.3],
    },
  },
  movimientos: {
    shader: 'particle',
    config: {
      uSpeed: 1.5,
      uTurbulence: 0.8,
      uWaveAmplitude: 0.15,
      uParticleShape: 0,
    },
  },
  ai: {
    shader: 'glowOrb',
    config: {
      uOrbSize: 0.7,
      uPulse: 1.5,
      uRingCount: 3,
      uColorPrimary: [0.6, 0.0, 1.0],
      uColorSecondary: [0.0, 1.0, 0.8],
    },
  },
} as const

export type PanelShaderPreset = keyof typeof PANEL_SHADER_PRESETS
