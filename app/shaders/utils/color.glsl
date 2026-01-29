// Utilidades de color para shaders GLSL
#ifndef COLOR_UTILS_GLSL
#define COLOR_UTILS_GLSL

// Conversión RGB a HSV
vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

// Conversión HSV a RGB
vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

// Conversión RGB a escala de grises (luminosidad perceptual)
float luminance(vec3 color) {
  return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

// Aplicar contraste
vec3 contrast(vec3 color, float amount) {
  return (color - 0.5) * amount + 0.5;
}

// Aplicar saturación
vec3 saturate(vec3 color, float amount) {
  float lum = luminance(color);
  return mix(vec3(lum), color, amount);
}

// Tone mapping ACES Filmic
vec3 acesFilmic(vec3 x) {
  float a = 2.51;
  float b = 0.03;
  float c = 2.43;
  float d = 0.59;
  float e = 0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e), 0.0, 1.0);
}

// Tone mapping Reinhard
vec3 reinhard(vec3 color, float exposure) {
  color *= exposure;
  return color / (1.0 + color);
}

// Conversión sRGB a Linear
vec3 srgbToLinear(vec3 srgb) {
  return pow(srgb, vec3(2.2));
}

// Conversión Linear a sRGB
vec3 linearToSrgb(vec3 linear) {
  return pow(linear, vec3(1.0 / 2.2));
}

// Mezcla de colores con modos de blend
vec3 blendScreen(vec3 base, vec3 blend) {
  return 1.0 - (1.0 - base) * (1.0 - blend);
}

vec3 blendMultiply(vec3 base, vec3 blend) {
  return base * blend;
}

vec3 blendOverlay(vec3 base, vec3 blend) {
  return mix(
    2.0 * base * blend,
    1.0 - 2.0 * (1.0 - base) * (1.0 - blend),
    step(0.5, base)
  );
}

// Corrección de color con curvas
vec3 colorGrade(vec3 color, float shadows, float midtones, float highlights) {
  float lum = luminance(color);
  float shadowMask = 1.0 - smoothstep(0.0, 0.5, lum);
  float highlightMask = smoothstep(0.5, 1.0, lum);
  float midtoneMask = 1.0 - shadowMask - highlightMask;

  return color * (
    shadowMask * shadows +
    midtoneMask * midtones +
    highlightMask * highlights
  );
}

// Paleta de colores procedural (Inigo Quilez method)
vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(6.28318 * (c * t + d));
}

#endif
