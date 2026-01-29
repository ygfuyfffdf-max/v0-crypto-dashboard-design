/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 SHADER LIBRARY - Biblioteca de Shaders GLSL Premium
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Colección de shaders GLSL de alta calidad para efectos visuales premium:
 * - Noise functions (Simplex, Perlin, Worley)
 * - Color manipulation
 * - Lighting models (PBR, NPR, Toon)
 * - Post-processing effects
 * - Procedural textures
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 🔊 NOISE FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

export const noiseGLSL = /* glsl */ `
// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLEX NOISE 2D/3D/4D
// ═══════════════════════════════════════════════════════════════════════════════

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

// FBM (Fractal Brownian Motion)
float fbm(vec3 p, int octaves, float lacunarity, float gain) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for(int i = 0; i < octaves; i++) {
    value += amplitude * snoise(p * frequency);
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return value;
}

// Turbulence
float turbulence(vec3 p, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;

  for(int i = 0; i < octaves; i++) {
    value += amplitude * abs(snoise(p * frequency));
    frequency *= 2.0;
    amplitude *= 0.5;
  }

  return value;
}

// Worley/Cellular Noise
vec2 worley(vec3 p) {
  vec3 n = floor(p);
  vec3 f = fract(p);

  float dist1 = 1.0;
  float dist2 = 1.0;

  for(int k = -1; k <= 1; k++) {
    for(int j = -1; j <= 1; j++) {
      for(int i = -1; i <= 1; i++) {
        vec3 g = vec3(float(i), float(j), float(k));
        vec3 o = vec3(
          fract(sin(dot(n + g, vec3(127.1, 311.7, 74.7))) * 43758.5453),
          fract(sin(dot(n + g, vec3(269.5, 183.3, 246.1))) * 43758.5453),
          fract(sin(dot(n + g, vec3(113.5, 271.9, 124.6))) * 43758.5453)
        );

        vec3 r = g + o - f;
        float d = dot(r, r);

        if(d < dist1) {
          dist2 = dist1;
          dist1 = d;
        } else if(d < dist2) {
          dist2 = d;
        }
      }
    }
  }

  return vec2(sqrt(dist1), sqrt(dist2));
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 COLOR UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

export const colorGLSL = /* glsl */ `
// RGB to HSL
vec3 rgb2hsl(vec3 c) {
  float maxC = max(c.r, max(c.g, c.b));
  float minC = min(c.r, min(c.g, c.b));
  float l = (maxC + minC) * 0.5;

  if(maxC == minC) {
    return vec3(0.0, 0.0, l);
  }

  float d = maxC - minC;
  float s = l > 0.5 ? d / (2.0 - maxC - minC) : d / (maxC + minC);

  float h;
  if(maxC == c.r) {
    h = (c.g - c.b) / d + (c.g < c.b ? 6.0 : 0.0);
  } else if(maxC == c.g) {
    h = (c.b - c.r) / d + 2.0;
  } else {
    h = (c.r - c.g) / d + 4.0;
  }
  h /= 6.0;

  return vec3(h, s, l);
}

// HSL to RGB
vec3 hsl2rgb(vec3 c) {
  if(c.y == 0.0) {
    return vec3(c.z);
  }

  float q = c.z < 0.5 ? c.z * (1.0 + c.y) : c.z + c.y - c.z * c.y;
  float p = 2.0 * c.z - q;

  vec3 rgb;
  rgb.r = abs(c.x * 6.0 - 3.0) - 1.0;
  rgb.g = 2.0 - abs(c.x * 6.0 - 2.0);
  rgb.b = 2.0 - abs(c.x * 6.0 - 4.0);
  rgb = clamp(rgb, 0.0, 1.0);

  return mix(vec3(p), vec3(q), rgb);
}

// Color temperature to RGB
vec3 temperatureToRGB(float kelvin) {
  float temp = kelvin / 100.0;
  vec3 color;

  if(temp <= 66.0) {
    color.r = 255.0;
    color.g = 99.4708025861 * log(temp) - 161.1195681661;
    if(temp <= 19.0) {
      color.b = 0.0;
    } else {
      color.b = 138.5177312231 * log(temp - 10.0) - 305.0447927307;
    }
  } else {
    color.r = 329.698727446 * pow(temp - 60.0, -0.1332047592);
    color.g = 288.1221695283 * pow(temp - 60.0, -0.0755148492);
    color.b = 255.0;
  }

  return clamp(color / 255.0, 0.0, 1.0);
}

// Chromatic aberration
vec3 chromaticAberration(sampler2D tex, vec2 uv, vec2 offset) {
  float r = texture2D(tex, uv + offset).r;
  float g = texture2D(tex, uv).g;
  float b = texture2D(tex, uv - offset).b;
  return vec3(r, g, b);
}

// Film grain
float filmGrain(vec2 uv, float time, float strength) {
  return fract(sin(dot(uv + time, vec2(12.9898, 78.233))) * 43758.5453) * strength;
}

// Vignette
float vignette(vec2 uv, float intensity, float smoothness) {
  vec2 center = uv - 0.5;
  float dist = length(center);
  return smoothstep(0.5, 0.5 - smoothness, dist * intensity);
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// 💡 LIGHTING MODELS
// ═══════════════════════════════════════════════════════════════════════════════

export const lightingGLSL = /* glsl */ `
// PBR Functions
float DistributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;

  float nom = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = 3.14159265359 * denom * denom;

  return nom / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness) {
  float r = (roughness + 1.0);
  float k = (r * r) / 8.0;

  float nom = NdotV;
  float denom = NdotV * (1.0 - k) + k;

  return nom / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float ggx2 = GeometrySchlickGGX(NdotV, roughness);
  float ggx1 = GeometrySchlickGGX(NdotL, roughness);

  return ggx1 * ggx2;
}

vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

vec3 fresnelSchlickRoughness(float cosTheta, vec3 F0, float roughness) {
  return F0 + (max(vec3(1.0 - roughness), F0) - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// Toon shading
float toonShading(float intensity, float levels) {
  return floor(intensity * levels) / levels;
}

// Fresnel rim
float fresnelRim(vec3 N, vec3 V, float power) {
  return pow(1.0 - max(dot(N, V), 0.0), power);
}

// Subsurface scattering approximation
vec3 subsurfaceScattering(vec3 lightDir, vec3 viewDir, vec3 normal, vec3 sssColor, float thickness) {
  vec3 scatterDir = lightDir + normal * 0.5;
  float scatterDot = pow(clamp(dot(viewDir, -scatterDir), 0.0, 1.0), 2.0) * thickness;
  return sssColor * scatterDot;
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// ✨ SPECIAL EFFECTS
// ═══════════════════════════════════════════════════════════════════════════════

export const effectsGLSL = /* glsl */ `
// Holographic effect
vec3 holographic(vec2 uv, float time, vec3 baseColor) {
  float scanline = sin(uv.y * 400.0 + time * 5.0) * 0.04;
  float flicker = sin(time * 10.0) * 0.02 + 0.98;

  vec3 color = baseColor;
  color.r += sin(uv.y * 200.0 + time * 3.0) * 0.1;
  color.b += cos(uv.y * 200.0 + time * 2.0) * 0.1;

  color *= 1.0 + scanline;
  color *= flicker;

  // Edge glow
  float edge = pow(abs(uv.x - 0.5) * 2.0, 3.0);
  color += vec3(0.0, 1.0, 1.0) * edge * 0.3;

  return color;
}

// Glitch effect
vec3 glitch(sampler2D tex, vec2 uv, float time, float intensity) {
  vec2 offset = vec2(0.0);

  float glitchStrength = step(0.99, fract(time * 0.5)) * intensity;
  offset.x = (fract(sin(floor(uv.y * 20.0) + time) * 43758.5453) - 0.5) * glitchStrength * 0.1;

  vec3 color;
  color.r = texture2D(tex, uv + offset + vec2(0.01, 0.0) * glitchStrength).r;
  color.g = texture2D(tex, uv + offset).g;
  color.b = texture2D(tex, uv + offset - vec2(0.01, 0.0) * glitchStrength).b;

  return color;
}

// Matrix rain effect
float matrixRain(vec2 uv, float time) {
  vec2 cell = floor(uv * vec2(40.0, 80.0));
  float random = fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453);
  float speed = random * 2.0 + 1.0;
  float offset = random * 10.0;

  float y = fract(uv.y + time * speed * 0.1 + offset);
  float trail = smoothstep(0.0, 0.3, y) * smoothstep(1.0, 0.7, y);

  return trail * step(0.5, random);
}

// Plasma effect
vec3 plasma(vec2 uv, float time) {
  float v1 = sin(uv.x * 10.0 + time);
  float v2 = sin(uv.y * 10.0 + time);
  float v3 = sin((uv.x + uv.y) * 10.0 + time);
  float v4 = sin(sqrt(uv.x * uv.x + uv.y * uv.y) * 10.0 + time);

  float v = (v1 + v2 + v3 + v4) * 0.25;

  vec3 color;
  color.r = sin(v * 3.14159 + time) * 0.5 + 0.5;
  color.g = sin(v * 3.14159 + time + 2.094) * 0.5 + 0.5;
  color.b = sin(v * 3.14159 + time + 4.188) * 0.5 + 0.5;

  return color;
}

// Energy shield effect
vec3 energyShield(vec2 uv, vec3 normal, vec3 viewDir, float time, vec3 color) {
  float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
  float pattern = sin(uv.x * 50.0 + time * 2.0) * sin(uv.y * 50.0 + time * 2.0);
  float pulse = sin(time * 3.0) * 0.3 + 0.7;

  return color * (fresnel + pattern * 0.1) * pulse;
}

// Aurora borealis
vec3 aurora(vec2 uv, float time) {
  float wave1 = sin(uv.x * 3.0 + time * 0.5) * 0.5;
  float wave2 = sin(uv.x * 5.0 - time * 0.3) * 0.3;
  float wave3 = sin(uv.x * 7.0 + time * 0.7) * 0.2;

  float y = wave1 + wave2 + wave3;
  float dist = abs(uv.y - 0.5 - y * 0.2);

  float intensity = smoothstep(0.3, 0.0, dist);

  vec3 color1 = vec3(0.0, 1.0, 0.5);
  vec3 color2 = vec3(0.0, 0.5, 1.0);
  vec3 color3 = vec3(0.5, 0.0, 1.0);

  float blend = sin(uv.x * 2.0 + time * 0.2) * 0.5 + 0.5;
  vec3 color = mix(mix(color1, color2, blend), color3, sin(time * 0.1) * 0.5 + 0.5);

  return color * intensity;
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// 🌊 VERTEX EFFECTS
// ═══════════════════════════════════════════════════════════════════════════════

export const vertexGLSL = /* glsl */ `
// Wave displacement
vec3 waveDisplacement(vec3 position, float time, float amplitude, float frequency) {
  float wave = sin(position.x * frequency + time) * amplitude;
  wave += sin(position.z * frequency * 0.8 + time * 1.1) * amplitude * 0.5;
  return vec3(position.x, position.y + wave, position.z);
}

// Twist deformation
vec3 twist(vec3 position, float angle) {
  float s = sin(angle * position.y);
  float c = cos(angle * position.y);
  mat2 rotation = mat2(c, -s, s, c);
  vec2 xz = rotation * position.xz;
  return vec3(xz.x, position.y, xz.y);
}

// Bend deformation
vec3 bend(vec3 position, float curvature) {
  float angle = position.y * curvature;
  float s = sin(angle);
  float c = cos(angle);
  return vec3(
    position.x,
    c * position.y - s * position.z,
    s * position.y + c * position.z
  );
}

// Explosion displacement
vec3 explode(vec3 position, vec3 normal, float time, float intensity) {
  float noise = snoise(position * 5.0 + time) * 0.5 + 0.5;
  return position + normal * noise * intensity;
}

// Jelly/soft body effect
vec3 jelly(vec3 position, float time, float amplitude) {
  float phase = length(position.xz) * 2.0;
  float wave = sin(time * 5.0 + phase) * amplitude;
  return position * (1.0 + wave * 0.1);
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 SHADER LIBRARY OBJECT
// ═══════════════════════════════════════════════════════════════════════════════

export const ShaderLibrary = {
  noise: noiseGLSL,
  color: colorGLSL,
  lighting: lightingGLSL,
  effects: effectsGLSL,
  vertex: vertexGLSL,

  // Combinar todos los shaders
  getCommonChunk(): string {
    return `
      ${noiseGLSL}
      ${colorGLSL}
      ${lightingGLSL}
    `
  },

  // Shader completo para efectos premium
  getPremiumFragment(): string {
    return `
      ${noiseGLSL}
      ${colorGLSL}
      ${effectsGLSL}
    `
  },

  // Shader completo para vértices
  getPremiumVertex(): string {
    return `
      ${noiseGLSL}
      ${vertexGLSL}
    `
  },
}

export default ShaderLibrary
