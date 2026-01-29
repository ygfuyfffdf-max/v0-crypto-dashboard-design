/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — QUANTUM SHADERS WEBGPU SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de shaders WebGPU supremo con:
 * - Liquid Metal Shader con distorsión realista
 * - Volumetric Fog con ray marching
 * - Particle System GPU-accelerated (1M+ partículas)
 * - PBR Materials con fresnel avanzado
 * - Iridescence y refracción
 * - Animaciones 120fps
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 COLORES QUANTUM (convertidos a vec3/vec4 para shaders)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SHADER_COLORS = {
  violet: 'vec3(0.545, 0.0, 1.0)', // #8B00FF
  gold: 'vec3(1.0, 0.843, 0.0)', // #FFD700
  plasma: 'vec3(1.0, 0.078, 0.576)', // #FF1493
  void: 'vec3(0.0, 0.0, 0.0)', // #000000
  white: 'vec3(1.0, 1.0, 1.0)', // #FFFFFF
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 LIQUID METAL SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const LIQUID_METAL_VERTEX_SHADER = /* wgsl */ `
struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) worldPosition: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
  @location(3) viewDirection: vec3<f32>,
}

struct Uniforms {
  modelMatrix: mat4x4<f32>,
  viewMatrix: mat4x4<f32>,
  projectionMatrix: mat4x4<f32>,
  cameraPosition: vec3<f32>,
  time: f32,
  mousePosition: vec2<f32>,
  distortionStrength: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// Simplex noise 3D
fn mod289_3(x: vec3<f32>) -> vec3<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289_4(x: vec4<f32>) -> vec4<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn permute(x: vec4<f32>) -> vec4<f32> {
  return mod289_4(((x * 34.0) + 1.0) * x);
}

fn taylorInvSqrt(r: vec4<f32>) -> vec4<f32> {
  return 1.79284291400159 - 0.85373472095314 * r;
}

fn snoise(v: vec3<f32>) -> f32 {
  let C = vec2<f32>(1.0 / 6.0, 1.0 / 3.0);
  let D = vec4<f32>(0.0, 0.5, 1.0, 2.0);

  var i = floor(v + dot(v, vec3<f32>(C.y, C.y, C.y)));
  let x0 = v - i + dot(i, vec3<f32>(C.x, C.x, C.x));

  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min(g.xyz, l.zxy);
  let i2 = max(g.xyz, l.zxy);

  let x1 = x0 - i1 + C.x;
  let x2 = x0 - i2 + C.y;
  let x3 = x0 - D.yyy;

  i = mod289_3(i);
  let p = permute(permute(permute(
    i.z + vec4<f32>(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4<f32>(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4<f32>(0.0, i1.x, i2.x, 1.0));

  let n_ = 0.142857142857;
  let ns = n_ * D.wyz - D.xzx;

  let j = p - 49.0 * floor(p * ns.z * ns.z);

  let x_ = floor(j * ns.z);
  let y_ = floor(j - 7.0 * x_);

  let x = x_ * ns.x + ns.yyyy.x;
  let y = y_ * ns.x + ns.yyyy.x;
  let h = 1.0 - abs(x) - abs(y);

  let b0 = vec4<f32>(x.xy, y.xy);
  let b1 = vec4<f32>(x.zw, y.zw);

  let s0 = floor(b0) * 2.0 + 1.0;
  let s1 = floor(b1) * 2.0 + 1.0;
  let sh = -step(h, vec4<f32>(0.0, 0.0, 0.0, 0.0));

  let a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  let a1 = b1.xzyw + s1.xzyw * sh.zzww;

  var p0 = vec3<f32>(a0.xy, h.x);
  var p1 = vec3<f32>(a0.zw, h.y);
  var p2 = vec3<f32>(a1.xy, h.z);
  var p3 = vec3<f32>(a1.zw, h.w);

  let norm = taylorInvSqrt(vec4<f32>(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  var m = max(0.6 - vec4<f32>(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), vec4<f32>(0.0));
  m = m * m;
  return 42.0 * dot(m * m, vec4<f32>(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

@vertex
fn main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  
  // Calcular distorsión basada en noise y tiempo
  let noiseScale = 2.0;
  let noisePos = input.position * noiseScale + vec3<f32>(uniforms.time * 0.5, 0.0, 0.0);
  let noise = snoise(noisePos) * uniforms.distortionStrength;
  
  // Aplicar distorsión al vertex
  var distortedPosition = input.position;
  distortedPosition += input.normal * noise * 0.1;
  
  // Transformaciones
  let worldPos = uniforms.modelMatrix * vec4<f32>(distortedPosition, 1.0);
  output.worldPosition = worldPos.xyz;
  output.normal = normalize((uniforms.modelMatrix * vec4<f32>(input.normal, 0.0)).xyz);
  output.uv = input.uv;
  output.viewDirection = normalize(uniforms.cameraPosition - worldPos.xyz);
  output.position = uniforms.projectionMatrix * uniforms.viewMatrix * worldPos;
  
  return output;
}
`

export const LIQUID_METAL_FRAGMENT_SHADER = /* wgsl */ `
struct FragmentInput {
  @location(0) worldPosition: vec3<f32>,
  @location(1) normal: vec3<f32>,
  @location(2) uv: vec2<f32>,
  @location(3) viewDirection: vec3<f32>,
}

struct Uniforms {
  modelMatrix: mat4x4<f32>,
  viewMatrix: mat4x4<f32>,
  projectionMatrix: mat4x4<f32>,
  cameraPosition: vec3<f32>,
  time: f32,
  mousePosition: vec2<f32>,
  distortionStrength: f32,
  baseColor: vec3<f32>,
  accentColor: vec3<f32>,
  metalness: f32,
  roughness: f32,
  emissiveIntensity: f32,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

// Fresnel Schlick
fn fresnelSchlick(cosTheta: f32, F0: vec3<f32>) -> vec3<f32> {
  return F0 + (1.0 - F0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

// GGX Distribution
fn distributionGGX(N: vec3<f32>, H: vec3<f32>, roughness: f32) -> f32 {
  let a = roughness * roughness;
  let a2 = a * a;
  let NdotH = max(dot(N, H), 0.0);
  let NdotH2 = NdotH * NdotH;
  
  let num = a2;
  var denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = 3.14159265359 * denom * denom;
  
  return num / denom;
}

// Smith's GGX
fn geometrySchlickGGX(NdotV: f32, roughness: f32) -> f32 {
  let r = roughness + 1.0;
  let k = (r * r) / 8.0;
  
  let num = NdotV;
  let denom = NdotV * (1.0 - k) + k;
  
  return num / denom;
}

fn geometrySmith(N: vec3<f32>, V: vec3<f32>, L: vec3<f32>, roughness: f32) -> f32 {
  let NdotV = max(dot(N, V), 0.0);
  let NdotL = max(dot(N, L), 0.0);
  let ggx2 = geometrySchlickGGX(NdotV, roughness);
  let ggx1 = geometrySchlickGGX(NdotL, roughness);
  
  return ggx1 * ggx2;
}

// Iridescence
fn iridescence(viewAngle: f32, time: f32) -> vec3<f32> {
  let t = viewAngle * 6.0 + time * 0.5;
  return vec3<f32>(
    0.5 + 0.5 * sin(t),
    0.5 + 0.5 * sin(t + 2.094),
    0.5 + 0.5 * sin(t + 4.188)
  );
}

@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
  let N = normalize(input.normal);
  let V = normalize(input.viewDirection);
  
  // PBR Setup
  let F0 = mix(vec3<f32>(0.04), uniforms.baseColor, uniforms.metalness);
  
  // Luz principal (simulada)
  let lightDir = normalize(vec3<f32>(1.0, 1.0, 1.0));
  let L = lightDir;
  let H = normalize(V + L);
  
  // Cook-Torrance BRDF
  let NDF = distributionGGX(N, H, uniforms.roughness);
  let G = geometrySmith(N, V, L, uniforms.roughness);
  let F = fresnelSchlick(max(dot(H, V), 0.0), F0);
  
  let numerator = NDF * G * F;
  let denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0) + 0.0001;
  let specular = numerator / denominator;
  
  // Fresnel para reflexiones
  let fresnel = fresnelSchlick(dot(N, V), F0);
  
  // Iridescencia
  let viewAngle = 1.0 - dot(N, V);
  let irid = iridescence(viewAngle, uniforms.time);
  
  // Color base con metalness
  let albedo = mix(uniforms.baseColor, uniforms.accentColor, sin(uniforms.time) * 0.5 + 0.5);
  let diffuse = albedo * (1.0 - uniforms.metalness);
  
  // Combinar
  let NdotL = max(dot(N, L), 0.0);
  var color = (diffuse / 3.14159265359 + specular) * NdotL;
  
  // Agregar iridescencia basada en ángulo de vista
  color += irid * viewAngle * 0.3 * uniforms.metalness;
  
  // Reflexión del entorno (simplificada)
  let reflection = reflect(-V, N);
  let envColor = mix(uniforms.accentColor, uniforms.baseColor, reflection.y * 0.5 + 0.5);
  color += envColor * fresnel * uniforms.metalness * 0.5;
  
  // Emisivo
  color += uniforms.baseColor * uniforms.emissiveIntensity;
  
  // Tone mapping (ACES)
  let a = 2.51;
  let b = 0.03;
  let c = 2.43;
  let d = 0.59;
  let e = 0.14;
  color = saturate((color * (a * color + b)) / (color * (c * color + d) + e));
  
  // Gamma correction
  color = pow(color, vec3<f32>(1.0 / 2.2));
  
  return vec4<f32>(color, 1.0);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌫️ VOLUMETRIC FOG SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const VOLUMETRIC_FOG_COMPUTE_SHADER = /* wgsl */ `
struct Params {
  resolution: vec2<u32>,
  time: f32,
  density: f32,
  lightPosition: vec3<f32>,
  lightColor: vec3<f32>,
  fogColor: vec3<f32>,
  absorption: f32,
  scattering: f32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var outputTexture: texture_storage_2d<rgba8unorm, write>;

fn hash(p: vec3<f32>) -> f32 {
  var p3 = fract(p * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}

fn noise(x: vec3<f32>) -> f32 {
  let p = floor(x);
  let f = fract(x);
  let u = f * f * (3.0 - 2.0 * f);
  
  return mix(
    mix(
      mix(hash(p + vec3<f32>(0.0, 0.0, 0.0)), hash(p + vec3<f32>(1.0, 0.0, 0.0)), u.x),
      mix(hash(p + vec3<f32>(0.0, 1.0, 0.0)), hash(p + vec3<f32>(1.0, 1.0, 0.0)), u.x),
      u.y
    ),
    mix(
      mix(hash(p + vec3<f32>(0.0, 0.0, 1.0)), hash(p + vec3<f32>(1.0, 0.0, 1.0)), u.x),
      mix(hash(p + vec3<f32>(0.0, 1.0, 1.0)), hash(p + vec3<f32>(1.0, 1.0, 1.0)), u.x),
      u.y
    ),
    u.z
  );
}

fn fbm(p: vec3<f32>) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var frequency = 1.0;
  var pos = p;
  
  for (var i = 0; i < 5; i++) {
    value += amplitude * noise(pos * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
    pos += vec3<f32>(params.time * 0.1);
  }
  
  return value;
}

fn rayMarch(origin: vec3<f32>, direction: vec3<f32>) -> vec4<f32> {
  var transmittance = 1.0;
  var color = vec3<f32>(0.0);
  let stepSize = 0.05;
  let maxSteps = 64u;
  
  var pos = origin;
  
  for (var i = 0u; i < maxSteps; i++) {
    let density = fbm(pos * 2.0) * params.density;
    
    if (density > 0.01) {
      let lightDir = normalize(params.lightPosition - pos);
      let lightDistance = length(params.lightPosition - pos);
      let attenuation = 1.0 / (1.0 + lightDistance * lightDistance * 0.1);
      
      let scatteredLight = params.lightColor * attenuation * params.scattering;
      
      let absorption = exp(-density * stepSize * params.absorption);
      transmittance *= absorption;
      
      color += transmittance * density * (params.fogColor + scatteredLight) * stepSize;
    }
    
    if (transmittance < 0.01) {
      break;
    }
    
    pos += direction * stepSize;
  }
  
  return vec4<f32>(color, 1.0 - transmittance);
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let resolution = vec2<f32>(f32(params.resolution.x), f32(params.resolution.y));
  let uv = (vec2<f32>(f32(globalId.x), f32(globalId.y)) / resolution) * 2.0 - 1.0;
  
  // Configurar ray
  let origin = vec3<f32>(0.0, 0.0, -3.0);
  let direction = normalize(vec3<f32>(uv.x, uv.y, 1.0));
  
  let result = rayMarch(origin, direction);
  
  textureStore(outputTexture, vec2<i32>(i32(globalId.x), i32(globalId.y)), result);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ PARTICLE SYSTEM SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PARTICLE_COMPUTE_SHADER = /* wgsl */ `
struct Particle {
  position: vec3<f32>,
  velocity: vec3<f32>,
  color: vec4<f32>,
  life: f32,
  size: f32,
}

struct Params {
  deltaTime: f32,
  time: f32,
  emitterPosition: vec3<f32>,
  gravity: vec3<f32>,
  turbulence: f32,
  maxLife: f32,
  particleCount: u32,
}

@group(0) @binding(0) var<uniform> params: Params;
@group(0) @binding(1) var<storage, read_write> particles: array<Particle>;

fn hash31(p: f32) -> vec3<f32> {
  var p3 = fract(vec3<f32>(p) * vec3<f32>(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.xxy + p3.yzz) * p3.zyx);
}

fn curl(p: vec3<f32>) -> vec3<f32> {
  let e = 0.1;
  var dx = vec3<f32>(e, 0.0, 0.0);
  var dy = vec3<f32>(0.0, e, 0.0);
  var dz = vec3<f32>(0.0, 0.0, e);
  
  let p_x0 = length(p - dx);
  let p_x1 = length(p + dx);
  let p_y0 = length(p - dy);
  let p_y1 = length(p + dy);
  let p_z0 = length(p - dz);
  let p_z1 = length(p + dz);
  
  let x = (p_y1 - p_y0) - (p_z1 - p_z0);
  let y = (p_z1 - p_z0) - (p_x1 - p_x0);
  let z = (p_x1 - p_x0) - (p_y1 - p_y0);
  
  return normalize(vec3<f32>(x, y, z));
}

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let index = globalId.x;
  if (index >= params.particleCount) {
    return;
  }
  
  var p = particles[index];
  
  // Actualizar vida
  p.life -= params.deltaTime;
  
  // Respawn si la partícula muere
  if (p.life <= 0.0) {
    let rand = hash31(f32(index) + params.time);
    p.position = params.emitterPosition + (rand - 0.5) * 0.5;
    p.velocity = normalize(rand - 0.5) * (1.0 + rand.x);
    p.life = params.maxLife * (0.5 + rand.y * 0.5);
    p.size = 0.01 + rand.z * 0.02;
    
    // Color basado en la paleta quantum
    let colorChoice = fract(rand.x * 3.0);
    if (colorChoice < 0.33) {
      p.color = vec4<f32>(0.545, 0.0, 1.0, 1.0); // Violet
    } else if (colorChoice < 0.66) {
      p.color = vec4<f32>(1.0, 0.843, 0.0, 1.0); // Gold
    } else {
      p.color = vec4<f32>(1.0, 0.078, 0.576, 1.0); // Plasma
    }
  }
  
  // Aplicar fuerzas
  let turbulenceForce = curl(p.position * 3.0 + params.time * 0.2) * params.turbulence;
  p.velocity += params.gravity * params.deltaTime;
  p.velocity += turbulenceForce * params.deltaTime;
  
  // Fricción
  p.velocity *= 0.99;
  
  // Actualizar posición
  p.position += p.velocity * params.deltaTime;
  
  // Fade alpha basado en vida
  p.color.a = smoothstep(0.0, 0.3, p.life / params.maxLife);
  
  particles[index] = p;
}
`

export const PARTICLE_VERTEX_SHADER = /* wgsl */ `
struct Particle {
  position: vec3<f32>,
  velocity: vec3<f32>,
  color: vec4<f32>,
  life: f32,
  size: f32,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) uv: vec2<f32>,
}

struct Uniforms {
  viewProjection: mat4x4<f32>,
  cameraRight: vec3<f32>,
  cameraUp: vec3<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var<storage, read> particles: array<Particle>;

@vertex
fn main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> VertexOutput {
  var output: VertexOutput;
  
  let particle = particles[instanceIndex];
  
  // Billboard quad vertices
  let quadVertices = array<vec2<f32>, 6>(
    vec2<f32>(-0.5, -0.5),
    vec2<f32>(0.5, -0.5),
    vec2<f32>(0.5, 0.5),
    vec2<f32>(-0.5, -0.5),
    vec2<f32>(0.5, 0.5),
    vec2<f32>(-0.5, 0.5)
  );
  
  let vertexPos = quadVertices[vertexIndex];
  
  // Billboard hacia la cámara
  let worldPos = particle.position + 
    uniforms.cameraRight * vertexPos.x * particle.size +
    uniforms.cameraUp * vertexPos.y * particle.size;
  
  output.position = uniforms.viewProjection * vec4<f32>(worldPos, 1.0);
  output.color = particle.color;
  output.uv = vertexPos + 0.5;
  
  return output;
}
`

export const PARTICLE_FRAGMENT_SHADER = /* wgsl */ `
struct FragmentInput {
  @location(0) color: vec4<f32>,
  @location(1) uv: vec2<f32>,
}

@fragment
fn main(input: FragmentInput) -> @location(0) vec4<f32> {
  // Partícula circular con glow
  let dist = length(input.uv - 0.5);
  let alpha = 1.0 - smoothstep(0.0, 0.5, dist);
  
  // Glow effect
  let glow = exp(-dist * 4.0);
  
  var color = input.color.rgb;
  color += color * glow * 0.5;
  
  return vec4<f32>(color, alpha * input.color.a);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌀 PORTAL SHADER (para transiciones)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PORTAL_FRAGMENT_SHADER = /* wgsl */ `
struct Uniforms {
  resolution: vec2<f32>,
  time: f32,
  progress: f32,
  centerColor: vec3<f32>,
  edgeColor: vec3<f32>,
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;

fn hash(p: vec2<f32>) -> f32 {
  return fract(sin(dot(p, vec2<f32>(127.1, 311.7))) * 43758.5453);
}

@fragment
fn main(@builtin(position) fragCoord: vec4<f32>) -> @location(0) vec4<f32> {
  let uv = (fragCoord.xy / uniforms.resolution) * 2.0 - 1.0;
  let aspect = uniforms.resolution.x / uniforms.resolution.y;
  var p = vec2<f32>(uv.x * aspect, uv.y);
  
  let dist = length(p);
  let angle = atan2(p.y, p.x);
  
  // Espiral
  let spiral = sin(angle * 8.0 - uniforms.time * 4.0 + dist * 10.0);
  let distortion = spiral * 0.1 * (1.0 - dist);
  
  // Anillos
  let rings = sin(dist * 20.0 - uniforms.time * 3.0) * 0.5 + 0.5;
  
  // Portal center
  let portalRadius = uniforms.progress * 2.0;
  let portalEdge = smoothstep(portalRadius - 0.1, portalRadius, dist);
  let portalInner = smoothstep(portalRadius + 0.1, portalRadius, dist);
  
  // Color
  var color = mix(uniforms.centerColor, uniforms.edgeColor, dist);
  color += vec3<f32>(rings * 0.2) * (1.0 - dist);
  color += vec3<f32>(spiral * 0.1 + 0.1);
  
  // Glow en el borde del portal
  let edgeGlow = exp(-abs(dist - portalRadius) * 10.0) * 2.0;
  color += uniforms.centerColor * edgeGlow;
  
  let alpha = portalInner * (1.0 - portalEdge) + edgeGlow * 0.5;
  
  return vec4<f32>(color, alpha);
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 UTILIDADES DE SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ShaderProgram {
  vertex: string
  fragment: string
  compute?: string
}

export const QUANTUM_SHADER_PROGRAMS: Record<string, ShaderProgram> = {
  liquidMetal: {
    vertex: LIQUID_METAL_VERTEX_SHADER,
    fragment: LIQUID_METAL_FRAGMENT_SHADER,
  },
  volumetricFog: {
    vertex: '',
    fragment: '',
    compute: VOLUMETRIC_FOG_COMPUTE_SHADER,
  },
  particles: {
    vertex: PARTICLE_VERTEX_SHADER,
    fragment: PARTICLE_FRAGMENT_SHADER,
    compute: PARTICLE_COMPUTE_SHADER,
  },
  portal: {
    vertex: '',
    fragment: PORTAL_FRAGMENT_SHADER,
  },
}

// Helper para crear uniforms buffer
export const createUniformBuffer = (device: GPUDevice, data: ArrayBuffer): GPUBuffer => {
  const buffer = device.createBuffer({
    size: data.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  })
  device.queue.writeBuffer(buffer, 0, data)
  return buffer
}

// Helper para actualizar uniforms
export const updateUniformBuffer = (device: GPUDevice, buffer: GPUBuffer, data: ArrayBuffer) => {
  device.queue.writeBuffer(buffer, 0, data)
}
