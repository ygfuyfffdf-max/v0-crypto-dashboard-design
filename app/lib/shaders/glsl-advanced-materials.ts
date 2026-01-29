/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — GLSL ADVANCED MATERIAL SHADERS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Shaders de materiales ultra-avanzados:
 * - PBR Physically Based Rendering
 * - Liquid Metal / Chrome
 * - Holographic Iridescent
 * - Volumetric Fog & God Rays
 * - Subsurface Scattering
 * - Fresnel Glass Ultra
 *
 * @version HYPER-INFINITY 2026.1
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LIQUID METAL — GGX/TROWBRIDGE-REITZ BRDF
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const GLSL_LIQUID_METAL_VERTEX = /* glsl */ `
precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uTime;
uniform float uRippleStrength;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

// Simplex noise for liquid motion
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+10.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

  vec3 i  = floor(v + dot(v, C.yyy));
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

  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vUv = uv;
  
  // Liquid displacement
  vec3 displacedPosition = position;
  float noiseScale = 2.0;
  float noiseSpeed = 0.5;
  
  vec3 noiseCoord = position * noiseScale + vec3(uTime * noiseSpeed);
  float displacement = snoise(noiseCoord) * uRippleStrength;
  
  // Multi-octave displacement for more organic feel
  displacement += snoise(noiseCoord * 2.0 + 100.0) * uRippleStrength * 0.5;
  displacement += snoise(noiseCoord * 4.0 + 200.0) * uRippleStrength * 0.25;
  
  displacedPosition += normal * displacement;
  
  // Calculate displaced normal
  float epsilon = 0.001;
  vec3 tangent = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
  if (length(tangent) < 0.001) {
    tangent = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
  }
  vec3 bitangent = normalize(cross(normal, tangent));
  
  vec3 neighborT = position + tangent * epsilon;
  vec3 neighborB = position + bitangent * epsilon;
  
  float dispT = snoise((neighborT * noiseScale + vec3(uTime * noiseSpeed))) * uRippleStrength;
  float dispB = snoise((neighborB * noiseScale + vec3(uTime * noiseSpeed))) * uRippleStrength;
  
  vec3 displacedNeighborT = neighborT + normal * dispT;
  vec3 displacedNeighborB = neighborB + normal * dispB;
  
  vec3 newTangent = normalize(displacedNeighborT - displacedPosition);
  vec3 newBitangent = normalize(displacedNeighborB - displacedPosition);
  vec3 newNormal = normalize(cross(newTangent, newBitangent));
  
  vNormal = normalMatrix * newNormal;
  vPosition = displacedPosition;
  vWorldPosition = (modelMatrix * vec4(displacedPosition, 1.0)).xyz;
  
  gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(displacedPosition, 1.0);
}
`

export const GLSL_LIQUID_METAL_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uCameraPosition;
uniform float uTime;
uniform float uRoughness;
uniform float uMetalness;
uniform vec3 uBaseColor;
uniform vec3 uSpecularColor;
uniform samplerCube uEnvMap;
uniform float uEnvMapIntensity;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;

const float PI = 3.14159265359;

// ═══════════════════════════════════════════════════════════════════════════════
// PBR FUNCTIONS — Cook-Torrance BRDF
// ═══════════════════════════════════════════════════════════════════════════════

// GGX/Trowbridge-Reitz Normal Distribution Function
float DistributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;
  
  float nom = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;
  
  return nom / denom;
}

// Schlick-GGX Geometry Function
float GeometrySchlickGGX(float NdotV, float roughness) {
  float r = (roughness + 1.0);
  float k = (r * r) / 8.0;
  
  float nom = NdotV;
  float denom = NdotV * (1.0 - k) + k;
  
  return nom / denom;
}

// Smith's Geometry Function
float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float ggx2 = GeometrySchlickGGX(NdotV, roughness);
  float ggx1 = GeometrySchlickGGX(NdotL, roughness);
  
  return ggx1 * ggx2;
}

// Fresnel-Schlick with roughness
vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
  return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// Standard Fresnel-Schlick
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// IRIDESCENCE — Thin-film interference
// ═══════════════════════════════════════════════════════════════════════════════

vec3 iridescence(float angle, float thickness) {
  // Thin-film interference simulation
  float d = thickness * 2.0;
  
  // Different wavelengths
  float r = 0.5 + 0.5 * cos(2.0 * PI * d / 0.650); // Red ~650nm
  float g = 0.5 + 0.5 * cos(2.0 * PI * d / 0.510); // Green ~510nm
  float b = 0.5 + 0.5 * cos(2.0 * PI * d / 0.475); // Blue ~475nm
  
  // Angle-based phase shift
  float phase = angle * thickness * 10.0;
  r = 0.5 + 0.5 * cos(phase);
  g = 0.5 + 0.5 * cos(phase + 2.094); // +120°
  b = 0.5 + 0.5 * cos(phase + 4.189); // +240°
  
  return vec3(r, g, b);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCameraPosition - vWorldPosition);
  vec3 R = reflect(-V, N);
  
  // Base metallic properties
  vec3 F0 = mix(vec3(0.04), uBaseColor, uMetalness);
  
  // Multiple light sources (violet, gold, plasma)
  vec3 lightPositions[3];
  lightPositions[0] = vec3(5.0, 5.0, 5.0);
  lightPositions[1] = vec3(-5.0, 3.0, -3.0);
  lightPositions[2] = vec3(0.0, -5.0, 5.0);
  
  vec3 lightColors[3];
  lightColors[0] = vec3(0.545, 0.0, 1.0) * 300.0;   // Violet
  lightColors[1] = vec3(1.0, 0.843, 0.0) * 250.0;   // Gold
  lightColors[2] = vec3(1.0, 0.078, 0.576) * 200.0; // Plasma
  
  vec3 Lo = vec3(0.0);
  
  for (int i = 0; i < 3; i++) {
    vec3 L = normalize(lightPositions[i] - vWorldPosition);
    vec3 H = normalize(V + L);
    
    float distance = length(lightPositions[i] - vWorldPosition);
    float attenuation = 1.0 / (distance * distance);
    vec3 radiance = lightColors[i] * attenuation;
    
    // Cook-Torrance BRDF
    float NDF = DistributionGGX(N, H, uRoughness);
    float G = GeometrySmith(N, V, L, uRoughness);
    vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);
    
    vec3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
    vec3 specular = numerator / denominator;
    
    vec3 kS = F;
    vec3 kD = vec3(1.0) - kS;
    kD *= 1.0 - uMetalness;
    
    float NdotL = max(dot(N, L), 0.0);
    Lo += (kD * uBaseColor / PI + specular) * radiance * NdotL;
  }
  
  // Environment reflection
  vec3 F = fresnelSchlickRoughness(max(dot(N, V), 0.0), F0, uRoughness);
  vec3 envColor = textureCube(uEnvMap, R).rgb * uEnvMapIntensity;
  vec3 specularEnv = envColor * F;
  
  // Iridescence effect
  float angle = acos(dot(N, V));
  float thickness = 0.3 + 0.2 * sin(uTime * 0.5 + vUv.x * 10.0 + vUv.y * 10.0);
  vec3 iridescentColor = iridescence(angle, thickness);
  
  // Combine
  vec3 ambient = vec3(0.03) * uBaseColor;
  vec3 color = ambient + Lo + specularEnv * 0.5;
  
  // Add iridescence
  float iridescentStrength = (1.0 - uRoughness) * uMetalness * 0.3;
  color = mix(color, color * iridescentColor, iridescentStrength);
  
  // Fresnel rim
  float fresnel = pow(1.0 - max(dot(N, V), 0.0), 4.0);
  color += vec3(0.545, 0.0, 1.0) * fresnel * 0.5;
  
  // HDR tonemapping
  color = color / (color + vec3(1.0));
  
  // Gamma correction
  color = pow(color, vec3(1.0 / 2.2));
  
  gl_FragColor = vec4(color, 1.0);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOLOGRAPHIC IRIDESCENT SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const GLSL_HOLOGRAPHIC_VERTEX = /* glsl */ `
precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec3 vViewPosition;

void main() {
  vUv = uv;
  vNormal = normalMatrix * normal;
  vPosition = position;
  
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  
  vec4 mvPosition = viewMatrix * worldPosition;
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`

export const GLSL_HOLOGRAPHIC_FRAGMENT = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uCameraPosition;
uniform float uHoloIntensity;
uniform float uScanlineSpeed;
uniform float uRainbowScale;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec3 vViewPosition;

const float PI = 3.14159265359;

// ═══════════════════════════════════════════════════════════════════════════════
// RAINBOW / SPECTRUM FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

vec3 hsl2rgb(vec3 c) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
}

vec3 rainbow(float t) {
  // CHRONOS palette rainbow: void → violet → gold → plasma → void
  vec3 colors[5];
  colors[0] = vec3(0.0, 0.0, 0.0);       // void
  colors[1] = vec3(0.545, 0.0, 1.0);     // violet
  colors[2] = vec3(1.0, 0.843, 0.0);     // gold
  colors[3] = vec3(1.0, 0.078, 0.576);   // plasma
  colors[4] = vec3(0.545, 0.0, 1.0);     // violet (loop)
  
  t = fract(t) * 4.0;
  int idx = int(floor(t));
  float f = fract(t);
  
  // Smooth interpolation
  f = f * f * (3.0 - 2.0 * f);
  
  if (idx == 0) return mix(colors[0], colors[1], f);
  if (idx == 1) return mix(colors[1], colors[2], f);
  if (idx == 2) return mix(colors[2], colors[3], f);
  return mix(colors[3], colors[4], f);
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOISE
// ═══════════════════════════════════════════════════════════════════════════════

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
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

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCameraPosition - vWorldPosition);
  
  // View-dependent angle for holographic effect
  float NdotV = dot(N, V);
  float angle = acos(abs(NdotV));
  
  // ═══ RAINBOW DIFFRACTION ═══
  float diffractionPhase = angle * uRainbowScale + uTime * 0.2;
  diffractionPhase += (vUv.x + vUv.y) * 2.0;
  diffractionPhase += fbm(vUv * 10.0 + uTime * 0.1) * 0.5;
  vec3 diffractionColor = rainbow(diffractionPhase);
  
  // ═══ SCANLINES ═══
  float scanline = sin((vWorldPosition.y + uTime * uScanlineSpeed) * 50.0);
  scanline = smoothstep(0.3, 0.7, scanline * 0.5 + 0.5);
  
  // ═══ FRESNEL ═══
  float fresnel = pow(1.0 - abs(NdotV), 3.0);
  
  // ═══ GLITCH EFFECT ═══
  float glitchNoise = noise(vec2(floor(vUv.y * 100.0), floor(uTime * 10.0)));
  float glitch = step(0.98, glitchNoise);
  vec2 glitchOffset = vec2(glitch * 0.1, 0.0);
  
  // ═══ COMBINE ═══
  vec3 baseColor = vec3(0.0, 0.0, 0.0); // void base
  
  // Add holographic rainbow
  vec3 holoColor = diffractionColor * uHoloIntensity;
  
  // Add fresnel glow
  vec3 fresnelColor = vec3(0.545, 0.0, 1.0) * fresnel; // violet rim
  
  // Final color
  vec3 color = baseColor + holoColor + fresnelColor;
  
  // Apply scanlines
  color *= 0.8 + scanline * 0.2;
  
  // Glitch color shift
  if (glitch > 0.5) {
    color = vec3(1.0, 0.078, 0.576); // plasma flash
  }
  
  // Edge glow
  float edge = 1.0 - smoothstep(0.0, 0.3, abs(NdotV));
  color += vec3(1.0, 0.843, 0.0) * edge * 0.3; // gold edge
  
  // Alpha based on angle
  float alpha = 0.6 + fresnel * 0.4;
  alpha *= uHoloIntensity;
  
  gl_FragColor = vec4(color, alpha);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VOLUMETRIC FOG / GOD RAYS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const GLSL_VOLUMETRIC_FOG_VERTEX = /* glsl */ `
precision highp float;

attribute vec3 position;
attribute vec2 uv;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = vec4(position, 1.0);
}
`

export const GLSL_VOLUMETRIC_FOG_FRAGMENT = /* glsl */ `
precision highp float;

uniform sampler2D uSceneTexture;
uniform sampler2D uDepthTexture;
uniform vec3 uLightPosition;
uniform vec3 uLightColor;
uniform float uDensity;
uniform float uDecay;
uniform float uWeight;
uniform float uExposure;
uniform int uSamples;
uniform float uTime;
uniform vec2 uResolution;
uniform mat4 uViewProjectionInverse;

varying vec2 vUv;

const int MAX_SAMPLES = 100;

// ═══════════════════════════════════════════════════════════════════════════════
// NOISE FOR VOLUMETRIC VARIATION
// ═══════════════════════════════════════════════════════════════════════════════

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise3D(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z
  );
}

float fbm3D(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise3D(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  
  return value;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RAY MARCHING VOLUMETRIC
// ═══════════════════════════════════════════════════════════════════════════════

float getVolumetricDensity(vec3 pos) {
  // Base density with noise
  float density = fbm3D(pos * 0.5 + vec3(uTime * 0.1, 0.0, uTime * 0.05));
  
  // Height falloff
  density *= exp(-max(pos.y, 0.0) * 0.3);
  
  // Distance from light falloff
  float distToLight = length(pos - uLightPosition);
  density *= exp(-distToLight * 0.1);
  
  return max(density, 0.0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOD RAYS (Screen-space radial blur)
// ═══════════════════════════════════════════════════════════════════════════════

vec3 godRays(vec2 uv, vec2 lightScreenPos) {
  vec2 deltaTextCoord = (uv - lightScreenPos) * (1.0 / float(uSamples)) * uDensity;
  
  vec2 coord = uv;
  float illuminationDecay = 1.0;
  vec3 accumulatedLight = vec3(0.0);
  
  for (int i = 0; i < MAX_SAMPLES; i++) {
    if (i >= uSamples) break;
    
    coord -= deltaTextCoord;
    
    vec4 sampleColor = texture2D(uSceneTexture, coord);
    
    // Extract bright areas
    float brightness = dot(sampleColor.rgb, vec3(0.2126, 0.7152, 0.0722));
    vec3 lightSample = sampleColor.rgb * step(0.8, brightness);
    
    lightSample *= illuminationDecay * uWeight;
    accumulatedLight += lightSample;
    
    illuminationDecay *= uDecay;
  }
  
  return accumulatedLight * uExposure * uLightColor;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

void main() {
  // Original scene
  vec4 sceneColor = texture2D(uSceneTexture, vUv);
  
  // Light screen position (transform 3D light pos to screen space)
  vec4 lightClip = vec4(uLightPosition, 1.0); // Simplified - should use view-proj matrix
  vec2 lightScreen = vec2(0.5 + uLightPosition.x * 0.1, 0.5 + uLightPosition.y * 0.1);
  lightScreen = clamp(lightScreen, 0.0, 1.0);
  
  // Compute god rays
  vec3 rays = godRays(vUv, lightScreen);
  
  // Multiple colored light sources for CHRONOS palette
  vec3 violetRays = godRays(vUv, vec2(0.7, 0.6)) * vec3(0.545, 0.0, 1.0);
  vec3 goldRays = godRays(vUv, vec2(0.3, 0.7)) * vec3(1.0, 0.843, 0.0);
  
  // Combine
  vec3 totalRays = rays + violetRays * 0.5 + goldRays * 0.3;
  
  // Add to scene
  vec3 finalColor = sceneColor.rgb + totalRays;
  
  // Tone mapping
  finalColor = 1.0 - exp(-finalColor * 1.5);
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS ULTRA — Advanced Glass with Refraction & Dispersion
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const GLSL_GLASS_ULTRA_VERTEX = /* glsl */ `
precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec4 vClipPosition;

void main() {
  vUv = uv;
  vNormal = normalMatrix * normal;
  vPosition = position;
  
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  
  vClipPosition = projectionMatrix * viewMatrix * worldPosition;
  gl_Position = vClipPosition;
}
`

export const GLSL_GLASS_ULTRA_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uCameraPosition;
uniform sampler2D uBackgroundTexture;
uniform samplerCube uEnvMap;
uniform float uIOR; // Index of refraction
uniform float uThickness;
uniform float uRoughness;
uniform vec3 uTint;
uniform float uTransmission;
uniform float uChromaticAberration;
uniform vec2 uResolution;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vWorldPosition;
varying vec2 vUv;
varying vec4 vClipPosition;

const float PI = 3.14159265359;

// ═══════════════════════════════════════════════════════════════════════════════
// REFRACTION WITH CHROMATIC ABERRATION
// ═══════════════════════════════════════════════════════════════════════════════

vec3 refractWithDispersion(vec3 I, vec3 N, float ior, float aberration) {
  // Slightly different IOR for each color channel
  float iorR = ior - aberration;
  float iorG = ior;
  float iorB = ior + aberration;
  
  vec3 refractedR = refract(I, N, 1.0 / iorR);
  vec3 refractedG = refract(I, N, 1.0 / iorG);
  vec3 refractedB = refract(I, N, 1.0 / iorB);
  
  // Return average direction for sampling, but we'll sample each channel separately
  return refractedG;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FRESNEL
// ═══════════════════════════════════════════════════════════════════════════════

float fresnelSchlick(float cosTheta, float F0) {
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(uCameraPosition - vWorldPosition);
  vec3 I = -V;
  
  // Screen UV for background sampling
  vec2 screenUV = (vClipPosition.xy / vClipPosition.w) * 0.5 + 0.5;
  
  // ═══ FRESNEL ═══
  float NdotV = max(dot(N, V), 0.0);
  float F0 = pow((uIOR - 1.0) / (uIOR + 1.0), 2.0);
  float fresnel = fresnelSchlick(NdotV, F0);
  
  // ═══ REFRACTION WITH CHROMATIC ABERRATION ═══
  float iorR = uIOR - uChromaticAberration;
  float iorG = uIOR;
  float iorB = uIOR + uChromaticAberration;
  
  vec3 refractedR = refract(I, N, 1.0 / iorR);
  vec3 refractedG = refract(I, N, 1.0 / iorG);
  vec3 refractedB = refract(I, N, 1.0 / iorB);
  
  // Offset UVs based on refraction
  float refractionStrength = uThickness * 0.1;
  vec2 uvOffsetR = refractedR.xy * refractionStrength;
  vec2 uvOffsetG = refractedG.xy * refractionStrength;
  vec2 uvOffsetB = refractedB.xy * refractionStrength;
  
  // Sample background with chromatic aberration
  float bgR = texture2D(uBackgroundTexture, screenUV + uvOffsetR).r;
  float bgG = texture2D(uBackgroundTexture, screenUV + uvOffsetG).g;
  float bgB = texture2D(uBackgroundTexture, screenUV + uvOffsetB).b;
  vec3 refractedColor = vec3(bgR, bgG, bgB);
  
  // ═══ REFLECTION ═══
  vec3 R = reflect(-V, N);
  vec3 reflectedColor = textureCube(uEnvMap, R).rgb;
  
  // ═══ ENVIRONMENT BLUR BASED ON ROUGHNESS ═══
  // Simplified - in production use mip levels
  reflectedColor = mix(reflectedColor, vec3(0.5), uRoughness * 0.5);
  
  // ═══ COMBINE REFLECTION & REFRACTION ═══
  vec3 transmittedColor = refractedColor * uTint * uTransmission;
  vec3 glassColor = mix(transmittedColor, reflectedColor, fresnel);
  
  // ═══ ABSORPTION (Beer's Law) ═══
  vec3 absorption = exp(-uTint * uThickness * 0.5);
  glassColor *= absorption;
  
  // ═══ EDGE GLOW (CHRONOS style) ═══
  float edgeGlow = pow(1.0 - NdotV, 4.0);
  vec3 edgeColor = mix(
    vec3(0.545, 0.0, 1.0),  // violet
    vec3(1.0, 0.843, 0.0),   // gold
    sin(vUv.x * 10.0 + vUv.y * 10.0) * 0.5 + 0.5
  );
  glassColor += edgeColor * edgeGlow * 0.3;
  
  // ═══ SPECULAR HIGHLIGHTS ═══
  vec3 H = normalize(V + vec3(0.5, 1.0, 0.5)); // Simple light direction
  float specular = pow(max(dot(N, H), 0.0), 128.0 / (uRoughness + 0.01));
  glassColor += vec3(1.0) * specular * 0.5;
  
  // Alpha based on fresnel and transmission
  float alpha = mix(uTransmission, 1.0, fresnel);
  alpha = clamp(alpha, 0.3, 0.95);
  
  gl_FragColor = vec4(glassColor, alpha);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const GLSL_MATERIALS = {
  liquidMetal: {
    vertex: GLSL_LIQUID_METAL_VERTEX,
    fragment: GLSL_LIQUID_METAL_FRAGMENT,
  },
  holographic: {
    vertex: GLSL_HOLOGRAPHIC_VERTEX,
    fragment: GLSL_HOLOGRAPHIC_FRAGMENT,
  },
  volumetricFog: {
    vertex: GLSL_VOLUMETRIC_FOG_VERTEX,
    fragment: GLSL_VOLUMETRIC_FOG_FRAGMENT,
  },
  glassUltra: {
    vertex: GLSL_GLASS_ULTRA_VERTEX,
    fragment: GLSL_GLASS_ULTRA_FRAGMENT,
  },
} as const

export default GLSL_MATERIALS
