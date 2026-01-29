// Bloom Effect - Efecto de brillo cinematográfico
// Parámetros: textura, intensidad, threshold, radius

precision highp float;

uniform sampler2D tDiffuse;
uniform float intensity;
uniform float threshold;
uniform vec2 resolution;
varying vec2 vUv;

// Función para extraer áreas brillantes
vec3 brightnessThreshold(vec3 color, float threshold) {
  float brightness = max(max(color.r, color.g), color.b);
  return color * smoothstep(threshold, threshold + 0.1, brightness);
}

// Gaussian blur en una dirección
vec3 gaussianBlur(sampler2D tex, vec2 uv, vec2 direction, float radius) {
  vec3 color = vec3(0.0);
  float total = 0.0;

  const int samples = 9;
  float sigma = radius / 3.0;

  for(int i = -samples/2; i <= samples/2; i++) {
    float weight = exp(-float(i*i) / (2.0 * sigma * sigma));
    vec2 offset = direction * float(i) / resolution;
    color += texture2D(tex, uv + offset).rgb * weight;
    total += weight;
  }

  return color / total;
}

void main() {
  vec4 texel = texture2D(tDiffuse, vUv);
  vec3 color = texel.rgb;

  // Extraer áreas brillantes
  vec3 bright = brightnessThreshold(color, threshold);

  // Aplicar blur horizontal y vertical
  vec3 blurred = gaussianBlur(tDiffuse, vUv, vec2(1.0, 0.0), 5.0);
  blurred = gaussianBlur(tDiffuse, vUv, vec2(0.0, 1.0), 5.0);

  // Combinar original con bloom
  vec3 result = color + blurred * intensity;

  gl_FragColor = vec4(result, texel.a);
}
