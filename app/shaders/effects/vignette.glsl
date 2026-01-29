// Vignette - Viñeta dinámica cinematográfica
precision highp float;

uniform sampler2D tDiffuse;
uniform float intensity;
uniform float smoothness;
uniform vec2 center;
varying vec2 vUv;

void main() {
  vec4 color = texture2D(tDiffuse, vUv);

  // Calcular distancia desde el centro
  vec2 uv = vUv - center;
  float dist = length(uv);

  // Aplicar suavizado
  float vignette = smoothstep(intensity, intensity - smoothness, dist);

  gl_FragColor = vec4(color.rgb * vignette, color.a);
}
