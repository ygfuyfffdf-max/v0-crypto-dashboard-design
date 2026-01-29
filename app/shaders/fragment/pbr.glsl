// Fragment Shader con iluminación PBR básica
precision highp float;

uniform vec3 lightPosition;
uniform vec3 cameraPosition;
uniform vec3 baseColor;
uniform float metalness;
uniform float roughness;
uniform float time;

varying vec3 vNormal;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vWorldPosition;

const float PI = 3.14159265359;

// Función de distribución normal (GGX)
float distributionGGX(vec3 N, vec3 H, float roughness) {
  float a = roughness * roughness;
  float a2 = a * a;
  float NdotH = max(dot(N, H), 0.0);
  float NdotH2 = NdotH * NdotH;

  float nom = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;

  return nom / denom;
}

// Función de geometría (Schlick-GGX)
float geometrySchlickGGX(float NdotV, float roughness) {
  float r = (roughness + 1.0);
  float k = (r * r) / 8.0;

  float nom = NdotV;
  float denom = NdotV * (1.0 - k) + k;

  return nom / denom;
}

float geometrySmith(vec3 N, vec3 V, vec3 L, float roughness) {
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float ggx2 = geometrySchlickGGX(NdotV, roughness);
  float ggx1 = geometrySchlickGGX(NdotL, roughness);

  return ggx1 * ggx2;
}

// Ecuación de Fresnel (Schlick aproximation)
vec3 fresnelSchlick(float cosTheta, vec3 F0) {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(cameraPosition - vWorldPosition);
  vec3 L = normalize(lightPosition - vWorldPosition);
  vec3 H = normalize(V + L);

  // Calcular reflectancia en incidencia normal
  vec3 F0 = vec3(0.04);
  F0 = mix(F0, baseColor, metalness);

  // BRDF
  float NDF = distributionGGX(N, H, roughness);
  float G = geometrySmith(N, V, L, roughness);
  vec3 F = fresnelSchlick(max(dot(H, V), 0.0), F0);

  vec3 kS = F;
  vec3 kD = vec3(1.0) - kS;
  kD *= 1.0 - metalness;

  float NdotL = max(dot(N, L), 0.0);

  vec3 numerator = NDF * G * F;
  float denominator = 4.0 * max(dot(N, V), 0.0) * NdotL + 0.0001;
  vec3 specular = numerator / denominator;

  // Radiancia
  vec3 radiance = vec3(1.0); // Luz blanca
  vec3 Lo = (kD * baseColor / PI + specular) * radiance * NdotL;

  // Luz ambiente
  vec3 ambient = vec3(0.03) * baseColor;
  vec3 color = ambient + Lo;

  // Tone mapping
  color = color / (color + vec3(1.0));

  // Gamma correction
  color = pow(color, vec3(1.0/2.2));

  gl_FragColor = vec4(color, 1.0);
}
