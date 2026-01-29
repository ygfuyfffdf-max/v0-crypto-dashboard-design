// Vertex Shader con desplazamiento de ruido
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform float time;
uniform float displacement;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying float vDisplacement;

// Simplex noise (incluir desde noise/simplex.glsl en producción)
float snoise(vec3 v);

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);

  // Calcular desplazamiento con ruido
  vec3 pos = position;
  float noise = snoise(pos * 2.0 + time * 0.5);
  vDisplacement = noise;

  // Aplicar desplazamiento en dirección de la normal
  pos += normal * noise * displacement;

  vPosition = pos;

  vec4 worldPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * worldPosition;
}
