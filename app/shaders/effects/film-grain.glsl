// Film Grain - Grano de película cinematográfico
precision highp float;

uniform sampler2D tDiffuse;
uniform float time;
uniform float amount;
uniform float grainSize;
varying vec2 vUv;

// Función de ruido pseudo-random
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

void main() {
  vec4 color = texture2D(tDiffuse, vUv);

  // Generar grano
  vec2 grainCoord = vUv * grainSize;
  float grain = random(grainCoord + time) * 2.0 - 1.0;
  grain *= amount;

  // Aplicar grano con preservación de luminosidad
  vec3 result = color.rgb + grain;

  gl_FragColor = vec4(result, color.a);
}
