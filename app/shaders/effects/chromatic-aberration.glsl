// Chromatic Aberration - Aberración cromática para efectos cinematográficos
precision highp float;

uniform sampler2D tDiffuse;
uniform float amount;
uniform vec2 direction;
varying vec2 vUv;

void main() {
  vec2 offset = direction * amount;

  // Separar canales RGB
  float r = texture2D(tDiffuse, vUv + offset).r;
  float g = texture2D(tDiffuse, vUv).g;
  float b = texture2D(tDiffuse, vUv - offset).b;

  gl_FragColor = vec4(r, g, b, 1.0);
}
