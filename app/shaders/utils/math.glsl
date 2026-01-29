// Utilidades matemáticas para shaders GLSL
#ifndef MATH_UTILS_GLSL
#define MATH_UTILS_GLSL

const float PI = 3.14159265359;
const float TAU = 6.28318530718;
const float HALF_PI = 1.57079632679;

// Mapeo de valores
float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

// Clamp mejorado
float clamp01(float x) {
  return clamp(x, 0.0, 1.0);
}

// Smoothstep mejorado
float smootherstep(float edge0, float edge1, float x) {
  float t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// Easing functions
float easeInQuad(float t) {
  return t * t;
}

float easeOutQuad(float t) {
  return t * (2.0 - t);
}

float easeInOutQuad(float t) {
  return t < 0.5 ? 2.0 * t * t : -1.0 + (4.0 - 2.0 * t) * t;
}

float easeInCubic(float t) {
  return t * t * t;
}

float easeOutCubic(float t) {
  float f = t - 1.0;
  return f * f * f + 1.0;
}

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : (t - 1.0) * (2.0 * t - 2.0) * (2.0 * t - 2.0) + 1.0;
}

// Rotación 2D
vec2 rotate2D(vec2 v, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  mat2 m = mat2(c, -s, s, c);
  return m * v;
}

// Rotación 3D en eje Y
vec3 rotateY(vec3 v, float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return vec3(
    v.x * c - v.z * s,
    v.y,
    v.x * s + v.z * c
  );
}

// Función de paso suave
float smoothPulse(float x, float center, float width) {
  float edge0 = center - width * 0.5;
  float edge1 = center + width * 0.5;
  return smoothstep(edge0, center, x) - smoothstep(center, edge1, x);
}

// Remapeo exponencial
float expMap(float value, float power) {
  return pow(abs(value), power) * sign(value);
}

// Interpolación cúbica Hermite
float cubicHermite(float t) {
  return t * t * (3.0 - 2.0 * t);
}

// Quintic interpolation para smoothness extra
float quintic(float t) {
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

#endif
