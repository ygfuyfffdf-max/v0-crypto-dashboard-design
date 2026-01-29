/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — WEBGPU COMPUTE SHADERS SUPREMOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Shaders de computación GPU para:
 * - Simulación de partículas masiva (100K+ partículas)
 * - Física de fluidos Navier-Stokes
 * - Campos de fuerza y atractores
 * - Turbulencia procedural 3D
 * - Colisiones y boundings
 *
 * @version HYPER-INFINITY 2026.1
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM COMPUTE SHADER — GPU-ACCELERATED PHYSICS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const WGSL_PARTICLE_SYSTEM = /* wgsl */ `
// ═══════════════════════════════════════════════════════════════════════════════
// STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════════

struct Particle {
  position: vec4<f32>,      // xyz = position, w = life
  velocity: vec4<f32>,      // xyz = velocity, w = mass
  color: vec4<f32>,         // rgba
  attributes: vec4<f32>,    // x = size, y = rotation, z = age, w = type
}

struct Attractor {
  position: vec3<f32>,
  strength: f32,
  radius: f32,
  falloff: f32,
  _padding: vec2<f32>,
}

struct SimulationParams {
  deltaTime: f32,
  time: f32,
  particleCount: u32,
  attractorCount: u32,
  
  gravity: vec3<f32>,
  damping: f32,
  
  turbulenceScale: f32,
  turbulenceStrength: f32,
  turbulenceSpeed: f32,
  noiseOctaves: u32,
  
  bounds: vec3<f32>,
  bounceRestitution: f32,
  
  emitterPosition: vec3<f32>,
  emitterRadius: f32,
  
  emitRate: f32,
  initialSpeed: f32,
  lifeMin: f32,
  lifeMax: f32,
  
  sizeMin: f32,
  sizeMax: f32,
  colorStart: vec4<f32>,
  colorEnd: vec4<f32>,
}

// ═══════════════════════════════════════════════════════════════════════════════
// BINDINGS
// ═══════════════════════════════════════════════════════════════════════════════

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<storage, read> attractors: array<Attractor>;
@group(0) @binding(2) var<uniform> params: SimulationParams;

// ═══════════════════════════════════════════════════════════════════════════════
// NOISE FUNCTIONS — Simplex 3D & 4D
// ═══════════════════════════════════════════════════════════════════════════════

fn mod289_3(x: vec3<f32>) -> vec3<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289_4(x: vec4<f32>) -> vec4<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn permute_4(x: vec4<f32>) -> vec4<f32> {
  return mod289_4(((x * 34.0) + 10.0) * x);
}

fn taylorInvSqrt_4(r: vec4<f32>) -> vec4<f32> {
  return 1.79284291400159 - 0.85373472095314 * r;
}

fn snoise3D(v: vec3<f32>) -> f32 {
  let C = vec2<f32>(1.0/6.0, 1.0/3.0);
  let D = vec4<f32>(0.0, 0.5, 1.0, 2.0);

  // First corner
  var i = floor(v + dot(v, C.yyy));
  let x0 = v - i + dot(i, C.xxx);

  // Other corners
  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min(g.xyz, l.zxy);
  let i2 = max(g.xyz, l.zxy);

  let x1 = x0 - i1 + C.xxx;
  let x2 = x0 - i2 + C.yyy;
  let x3 = x0 - D.yyy;

  // Permutations
  i = mod289_3(i);
  let p = permute_4(permute_4(permute_4(
    i.z + vec4<f32>(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4<f32>(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4<f32>(0.0, i1.x, i2.x, 1.0));

  // Gradients
  let n_ = 0.142857142857;
  let ns = n_ * D.wyz - D.xzx;

  let j = p - 49.0 * floor(p * ns.z * ns.z);

  let x_ = floor(j * ns.z);
  let y_ = floor(j - 7.0 * x_);

  let x = x_ * ns.x + ns.yyyy;
  let y = y_ * ns.x + ns.yyyy;
  let h = 1.0 - abs(x) - abs(y);

  let b0 = vec4<f32>(x.xy, y.xy);
  let b1 = vec4<f32>(x.zw, y.zw);

  let s0 = floor(b0) * 2.0 + 1.0;
  let s1 = floor(b1) * 2.0 + 1.0;
  let sh = -step(h, vec4<f32>(0.0));

  let a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  let a1 = b1.xzyw + s1.xzyw * sh.zzww;

  var p0 = vec3<f32>(a0.xy, h.x);
  var p1 = vec3<f32>(a0.zw, h.y);
  var p2 = vec3<f32>(a1.xy, h.z);
  var p3 = vec3<f32>(a1.zw, h.w);

  // Normalise gradients
  let norm = taylorInvSqrt_4(vec4<f32>(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  var m = max(0.5 - vec4<f32>(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), vec4<f32>(0.0));
  m = m * m;
  return 105.0 * dot(m*m, vec4<f32>(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

// Fractal Brownian Motion
fn fbm3D(p: vec3<f32>, octaves: u32) -> f32 {
  var value = 0.0;
  var amplitude = 0.5;
  var frequency = 1.0;
  var pos = p;
  
  for (var i = 0u; i < octaves; i++) {
    value += amplitude * snoise3D(pos * frequency);
    amplitude *= 0.5;
    frequency *= 2.0;
  }
  
  return value;
}

// Curl noise for divergence-free flow
fn curlNoise(p: vec3<f32>) -> vec3<f32> {
  let e = 0.0001;
  let dx = vec3<f32>(e, 0.0, 0.0);
  let dy = vec3<f32>(0.0, e, 0.0);
  let dz = vec3<f32>(0.0, 0.0, e);
  
  let p_x0 = fbm3D(p - dx, 4u);
  let p_x1 = fbm3D(p + dx, 4u);
  let p_y0 = fbm3D(p - dy, 4u);
  let p_y1 = fbm3D(p + dy, 4u);
  let p_z0 = fbm3D(p - dz, 4u);
  let p_z1 = fbm3D(p + dz, 4u);
  
  let x = (p_y1 - p_y0) - (p_z1 - p_z0);
  let y = (p_z1 - p_z0) - (p_x1 - p_x0);
  let z = (p_x1 - p_x0) - (p_y1 - p_y0);
  
  return normalize(vec3<f32>(x, y, z)) * 0.5;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHYSICS FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

fn calculateAttractorForce(position: vec3<f32>, attractor: Attractor) -> vec3<f32> {
  let toAttractor = attractor.position - position;
  let dist = length(toAttractor);
  
  if (dist < 0.001) {
    return vec3<f32>(0.0);
  }
  
  // Inverse square falloff with smooth cutoff
  let normalizedDist = dist / attractor.radius;
  let falloffFactor = 1.0 / (1.0 + pow(normalizedDist, attractor.falloff));
  
  let forceMagnitude = attractor.strength * falloffFactor / (dist * dist + 0.01);
  
  return normalize(toAttractor) * forceMagnitude;
}

fn applyBoundaryCollision(position: ptr<function, vec3<f32>>, velocity: ptr<function, vec3<f32>>) {
  let bounds = params.bounds;
  let restitution = params.bounceRestitution;
  
  // X bounds
  if ((*position).x < -bounds.x) {
    (*position).x = -bounds.x;
    (*velocity).x *= -restitution;
  } else if ((*position).x > bounds.x) {
    (*position).x = bounds.x;
    (*velocity).x *= -restitution;
  }
  
  // Y bounds
  if ((*position).y < -bounds.y) {
    (*position).y = -bounds.y;
    (*velocity).y *= -restitution;
  } else if ((*position).y > bounds.y) {
    (*position).y = bounds.y;
    (*velocity).y *= -restitution;
  }
  
  // Z bounds
  if ((*position).z < -bounds.z) {
    (*position).z = -bounds.z;
    (*velocity).z *= -restitution;
  } else if ((*position).z > bounds.z) {
    (*position).z = bounds.z;
    (*velocity).z *= -restitution;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PSEUDO-RANDOM NUMBER GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

fn hash(n: f32) -> f32 {
  return fract(sin(n) * 43758.5453123);
}

fn hash3(p: vec3<f32>) -> vec3<f32> {
  let q = vec3<f32>(
    dot(p, vec3<f32>(127.1, 311.7, 74.7)),
    dot(p, vec3<f32>(269.5, 183.3, 246.1)),
    dot(p, vec3<f32>(113.5, 271.9, 124.6))
  );
  return fract(sin(q) * 43758.5453);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPUTE SHADER
// ═══════════════════════════════════════════════════════════════════════════════

@compute @workgroup_size(256)
fn updateParticles(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  
  if (idx >= params.particleCount) {
    return;
  }
  
  var p = particles[idx];
  var position = p.position.xyz;
  var velocity = p.velocity.xyz;
  var life = p.position.w;
  let mass = p.velocity.w;
  var age = p.attributes.z;
  
  // Update age and life
  age += params.deltaTime;
  life -= params.deltaTime;
  
  // Respawn dead particles
  if (life <= 0.0) {
    // Random position around emitter
    let seed = vec3<f32>(f32(idx), params.time, f32(idx) * 0.1);
    let randomOffset = (hash3(seed) - 0.5) * 2.0 * params.emitterRadius;
    position = params.emitterPosition + randomOffset;
    
    // Random initial velocity
    let velSeed = seed + vec3<f32>(100.0, 200.0, 300.0);
    velocity = normalize(hash3(velSeed) - 0.5) * params.initialSpeed;
    
    // Reset life and age
    life = mix(params.lifeMin, params.lifeMax, hash(f32(idx) + params.time));
    age = 0.0;
    
    // Reset color
    p.color = params.colorStart;
    
    // Reset size
    p.attributes.x = mix(params.sizeMin, params.sizeMax, hash(f32(idx) * 3.14159));
  }
  
  // ═══ FORCE ACCUMULATION ═══
  var totalForce = vec3<f32>(0.0);
  
  // Gravity
  totalForce += params.gravity;
  
  // Attractor forces
  for (var i = 0u; i < params.attractorCount; i++) {
    totalForce += calculateAttractorForce(position, attractors[i]);
  }
  
  // Turbulence (curl noise for nice swirling motion)
  let turbulencePos = position * params.turbulenceScale + vec3<f32>(params.time * params.turbulenceSpeed);
  let turbulence = curlNoise(turbulencePos) * params.turbulenceStrength;
  totalForce += turbulence;
  
  // ═══ INTEGRATION (Velocity Verlet) ═══
  let acceleration = totalForce / mass;
  velocity += acceleration * params.deltaTime;
  velocity *= params.damping;
  position += velocity * params.deltaTime;
  
  // ═══ BOUNDARY COLLISION ═══
  applyBoundaryCollision(&position, &velocity);
  
  // ═══ COLOR INTERPOLATION ═══
  let lifeRatio = 1.0 - (life / params.lifeMax);
  p.color = mix(params.colorStart, params.colorEnd, lifeRatio);
  p.color.a *= smoothstep(0.0, 0.1, life) * smoothstep(0.0, 0.1, life / params.lifeMax);
  
  // ═══ SIZE ANIMATION ═══
  let sizeMultiplier = sin(lifeRatio * 3.14159) * 0.5 + 0.5;
  p.attributes.x = mix(params.sizeMin, params.sizeMax, sizeMultiplier);
  
  // ═══ ROTATION ═══
  p.attributes.y += length(velocity) * params.deltaTime * 2.0;
  
  // ═══ WRITE BACK ═══
  p.position = vec4<f32>(position, life);
  p.velocity = vec4<f32>(velocity, mass);
  p.attributes.z = age;
  
  particles[idx] = p;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SORT PARTICLES BY DEPTH (for alpha blending)
// ═══════════════════════════════════════════════════════════════════════════════

struct SortParams {
  cameraPosition: vec3<f32>,
  _padding: f32,
}

@group(1) @binding(0) var<uniform> sortParams: SortParams;
@group(1) @binding(1) var<storage, read_write> sortKeys: array<f32>;
@group(1) @binding(2) var<storage, read_write> sortIndices: array<u32>;

@compute @workgroup_size(256)
fn computeSortKeys(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let idx = global_id.x;
  
  if (idx >= params.particleCount) {
    return;
  }
  
  let p = particles[idx];
  let dist = distance(p.position.xyz, sortParams.cameraPosition);
  
  sortKeys[idx] = -dist; // Negative for back-to-front
  sortIndices[idx] = idx;
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FLUID SIMULATION — NAVIER-STOKES 2D
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const WGSL_FLUID_SIMULATION = /* wgsl */ `
// ═══════════════════════════════════════════════════════════════════════════════
// STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════════

struct FluidParams {
  gridWidth: u32,
  gridHeight: u32,
  deltaTime: f32,
  viscosity: f32,
  
  diffusion: f32,
  dissipation: f32,
  vorticityStrength: f32,
  pressureIterations: u32,
  
  dyeColor: vec4<f32>,
  impulsePosition: vec2<f32>,
  impulseVelocity: vec2<f32>,
  impulseRadius: f32,
  _padding: vec3<f32>,
}

// Velocity field (vec2 per cell)
@group(0) @binding(0) var<storage, read_write> velocityRead: array<vec2<f32>>;
@group(0) @binding(1) var<storage, read_write> velocityWrite: array<vec2<f32>>;

// Pressure field
@group(0) @binding(2) var<storage, read_write> pressureRead: array<f32>;
@group(0) @binding(3) var<storage, read_write> pressureWrite: array<f32>;

// Divergence field
@group(0) @binding(4) var<storage, read_write> divergence: array<f32>;

// Dye/density field for visualization
@group(0) @binding(5) var<storage, read_write> dyeRead: array<vec4<f32>>;
@group(0) @binding(6) var<storage, read_write> dyeWrite: array<vec4<f32>>;

// Vorticity field
@group(0) @binding(7) var<storage, read_write> vorticity: array<f32>;

@group(1) @binding(0) var<uniform> params: FluidParams;

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

fn idx(x: u32, y: u32) -> u32 {
  return y * params.gridWidth + x;
}

fn clampCoord(x: i32, y: i32) -> vec2<u32> {
  return vec2<u32>(
    u32(clamp(x, 0, i32(params.gridWidth) - 1)),
    u32(clamp(y, 0, i32(params.gridHeight) - 1))
  );
}

fn sampleVelocity(x: f32, y: f32) -> vec2<f32> {
  let x0 = u32(floor(x));
  let y0 = u32(floor(y));
  let x1 = min(x0 + 1u, params.gridWidth - 1u);
  let y1 = min(y0 + 1u, params.gridHeight - 1u);
  
  let fx = fract(x);
  let fy = fract(y);
  
  let v00 = velocityRead[idx(x0, y0)];
  let v10 = velocityRead[idx(x1, y0)];
  let v01 = velocityRead[idx(x0, y1)];
  let v11 = velocityRead[idx(x1, y1)];
  
  let v0 = mix(v00, v10, fx);
  let v1 = mix(v01, v11, fx);
  
  return mix(v0, v1, fy);
}

fn sampleDye(x: f32, y: f32) -> vec4<f32> {
  let x0 = u32(floor(x));
  let y0 = u32(floor(y));
  let x1 = min(x0 + 1u, params.gridWidth - 1u);
  let y1 = min(y0 + 1u, params.gridHeight - 1u);
  
  let fx = fract(x);
  let fy = fract(y);
  
  let d00 = dyeRead[idx(x0, y0)];
  let d10 = dyeRead[idx(x1, y0)];
  let d01 = dyeRead[idx(x0, y1)];
  let d11 = dyeRead[idx(x1, y1)];
  
  let d0 = mix(d00, d10, fx);
  let d1 = mix(d01, d11, fx);
  
  return mix(d0, d1, fy);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADVECTION — Semi-Lagrangian method
// ═══════════════════════════════════════════════════════════════════════════════

@compute @workgroup_size(16, 16)
fn advectVelocity(@builtin(global_invocation_id) id: vec3<u32>) {
  let x = id.x;
  let y = id.y;
  
  if (x >= params.gridWidth || y >= params.gridHeight) {
    return;
  }
  
  // Backtrace
  let vel = velocityRead[idx(x, y)];
  let pos = vec2<f32>(f32(x), f32(y)) - vel * params.deltaTime;
  
  // Sample at backtraced position
  let clampedPos = clamp(pos, vec2<f32>(0.5), vec2<f32>(f32(params.gridWidth) - 1.5, f32(params.gridHeight) - 1.5));
  let newVel = sampleVelocity(clampedPos.x, clampedPos.y);
  
  // Apply dissipation
  velocityWrite[idx(x, y)] = newVel * (1.0 - params.dissipation * params.deltaTime);
}

@compute @workgroup_size(16, 16)
fn advectDye(@builtin(global_invocation_id) id: vec3<u32>) {
  let x = id.x;
  let y = id.y;
  
  if (x >= params.gridWidth || y >= params.gridHeight) {
    return;
  }
  
  let vel = velocityRead[idx(x, y)];
  let pos = vec2<f32>(f32(x), f32(y)) - vel * params.deltaTime;
  
  let clampedPos = clamp(pos, vec2<f32>(0.5), vec2<f32>(f32(params.gridWidth) - 1.5, f32(params.gridHeight) - 1.5));
  var newDye = sampleDye(clampedPos.x, clampedPos.y);
  
  // Dye dissipation
  newDye *= (1.0 - params.dissipation * params.deltaTime * 0.5);
  
  dyeWrite[idx(x, y)] = newDye;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIFFUSION — Jacobi iteration
// ═══════════════════════════════════════════════════════════════════════════════

@compute @workgroup_size(16, 16)
fn diffuse(@builtin(global_invocation_id) id: vec3<u32>) {
  let x = id.x;
  let y = id.y;
  
  if (x == 0u || y == 0u || x >= params.gridWidth - 1u || y >= params.gridHeight - 1u) {
    return;
  }
  
  let alpha = params.deltaTime * params.viscosity * f32(params.gridWidth * params.gridHeight);
  let rBeta = 1.0 / (4.0 + alpha);
  
  let center = velocityRead[idx(x, y)];
  let left = velocityRead[idx(x - 1u, y)];
  let right = velocityRead[idx(x + 1u, y)];
  let up = velocityRead[idx(x, y - 1u)];
  let down = velocityRead[idx(x, y + 1u)];
  
  velocityWrite[idx(x, y)] = (left + right + up + down + alpha * center) * rBeta;
}

// ═══════════════════════════════════════════════════════════════════════════════
// VORTICITY CONFINEMENT
// ═══════════════════════════════════════════════════════════════════════════════

@compute @workgroup_size(16, 16)
fn computeVorticity(@builtin(global_invocation_id) id: vec3<u32>) {
  let x = id.x;
  let y = id.y;
  
  if (x == 0u || y == 0u || x >= params.gridWidth - 1u || y >= params.gridHeight - 1u) {
    return;
  }
  
  let left = velocityRead[idx(x - 1u, y)];
  let right = velocityRead[idx(x + 1u, y)];
  let up = velocityRead[idx(x, y - 1u)];
  let down = velocityRead[idx(x, y + 1u)];
  
  // Curl in 2D
  vorticity[idx(x, y)] = (right.y - left.y) - (down.x - up.x);
}

@compute @workgroup_size(16, 16)
fn applyVorticity(@builtin(global_invocation_id) id: vec3<u32>) {
  let x = id.x;
  let y = id.y;
  
  if (x <= 1u || y <= 1u || x >= params.gridWidth - 2u || y >= params.gridHeight - 2u) {
    return;
  }
  
  let vL = abs(vorticity[idx(x - 1u, y)]);
  let vR = abs(vorticity[idx(x + 1u, y)]);
  let vU = abs(vorticity[idx(x, y - 1u)]);
  let vD = abs(vorticity[idx(x, y + 1u)]);
  let vC = vorticity[idx(x, y)];
  
  var force = vec2<f32>(vD - vU, vL - vR);
  let len = length(force);
  
  if (len > 0.0001) {
    force = force / len;
    force *= params.vorticityStrength * vC;
    
    velocityWrite[idx(x, y)] = velocityRead[idx(x, y)] + force * params.deltaTime;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRESSURE PROJECTION — Make velocity divergence-free
// ═══════════════════════════════════════════════════════════════════════════════

@compute @workgroup_size(16, 16)
fn computeDivergence(@builtin(global_invocation_id) id: vec3<u32>) {
  let x = id.x;
  let y = id.y;
  
  if (x == 0u || y == 0u || x >= params.gridWidth - 1u || y >= params.gridHeight - 1u) {
    return;
  }
  
  let left = velocityRead[idx(x - 1u, y)].x;
  let right = velocityRead[idx(x + 1u, y)].x;
  let up = velocityRead[idx(x, y - 1u)].y;
  let down = velocityRead[idx(x, y + 1u)].y;
  
  divergence[idx(x, y)] = -0.5 * (right - left + down - up);
}

@compute @workgroup_size(16, 16)
fn pressureSolve(@builtin(global_invocation_id) id: vec3<u32>) {
  let x = id.x;
  let y = id.y;
  
  if (x == 0u || y == 0u || x >= params.gridWidth - 1u || y >= params.gridHeight - 1u) {
    return;
  }
  
  let pL = pressureRead[idx(x - 1u, y)];
  let pR = pressureRead[idx(x + 1u, y)];
  let pU = pressureRead[idx(x, y - 1u)];
  let pD = pressureRead[idx(x, y + 1u)];
  let div = divergence[idx(x, y)];
  
  pressureWrite[idx(x, y)] = (pL + pR + pU + pD + div) * 0.25;
}

@compute @workgroup_size(16, 16)
fn subtractGradient(@builtin(global_invocation_id) id: vec3<u32>) {
  let x = id.x;
  let y = id.y;
  
  if (x == 0u || y == 0u || x >= params.gridWidth - 1u || y >= params.gridHeight - 1u) {
    return;
  }
  
  let pL = pressureRead[idx(x - 1u, y)];
  let pR = pressureRead[idx(x + 1u, y)];
  let pU = pressureRead[idx(x, y - 1u)];
  let pD = pressureRead[idx(x, y + 1u)];
  
  var vel = velocityRead[idx(x, y)];
  vel.x -= 0.5 * (pR - pL);
  vel.y -= 0.5 * (pD - pU);
  
  velocityWrite[idx(x, y)] = vel;
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL FORCES — Mouse/Touch impulse
// ═══════════════════════════════════════════════════════════════════════════════

@compute @workgroup_size(16, 16)
fn applyImpulse(@builtin(global_invocation_id) id: vec3<u32>) {
  let x = id.x;
  let y = id.y;
  
  if (x >= params.gridWidth || y >= params.gridHeight) {
    return;
  }
  
  let pos = vec2<f32>(f32(x), f32(y));
  let dist = distance(pos, params.impulsePosition);
  
  if (dist < params.impulseRadius) {
    let factor = 1.0 - (dist / params.impulseRadius);
    let gaussian = exp(-dist * dist / (params.impulseRadius * params.impulseRadius * 0.5));
    
    // Add velocity
    let currentVel = velocityRead[idx(x, y)];
    velocityWrite[idx(x, y)] = currentVel + params.impulseVelocity * gaussian;
    
    // Add dye
    let currentDye = dyeRead[idx(x, y)];
    dyeWrite[idx(x, y)] = currentDye + params.dyeColor * gaussian;
  }
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SIGNED DISTANCE FIELDS — RAY MARCHING
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const WGSL_SDF_RAYMARCHING = /* wgsl */ `
struct RayMarchParams {
  resolution: vec2<f32>,
  time: f32,
  cameraPosition: vec3<f32>,
  cameraTarget: vec3<f32>,
  _padding: f32,
}

@group(0) @binding(0) var outputTexture: texture_storage_2d<rgba8unorm, write>;
@group(0) @binding(1) var<uniform> params: RayMarchParams;

const MAX_STEPS: i32 = 128;
const MAX_DIST: f32 = 100.0;
const SURF_DIST: f32 = 0.001;
const PI: f32 = 3.14159265359;

// ═══════════════════════════════════════════════════════════════════════════════
// SDF PRIMITIVES
// ═══════════════════════════════════════════════════════════════════════════════

fn sdSphere(p: vec3<f32>, r: f32) -> f32 {
  return length(p) - r;
}

fn sdBox(p: vec3<f32>, b: vec3<f32>) -> f32 {
  let q = abs(p) - b;
  return length(max(q, vec3<f32>(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
}

fn sdTorus(p: vec3<f32>, t: vec2<f32>) -> f32 {
  let q = vec2<f32>(length(p.xz) - t.x, p.y);
  return length(q) - t.y;
}

fn sdCapsule(p: vec3<f32>, a: vec3<f32>, b: vec3<f32>, r: f32) -> f32 {
  let pa = p - a;
  let ba = b - a;
  let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SDF OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════

fn opUnion(d1: f32, d2: f32) -> f32 {
  return min(d1, d2);
}

fn opSmoothUnion(d1: f32, d2: f32, k: f32) -> f32 {
  let h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  return mix(d2, d1, h) - k * h * (1.0 - h);
}

fn opSubtraction(d1: f32, d2: f32) -> f32 {
  return max(-d1, d2);
}

fn opIntersection(d1: f32, d2: f32) -> f32 {
  return max(d1, d2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════════════════════════════

fn sceneSDF(p: vec3<f32>) -> f32 {
  let time = params.time;
  
  // Animated orb
  let orbPos = vec3<f32>(0.0, sin(time * 0.5) * 0.5, 0.0);
  let orb = sdSphere(p - orbPos, 1.0);
  
  // Orbiting smaller spheres
  var scene = orb;
  for (var i = 0; i < 3; i++) {
    let angle = time + f32(i) * PI * 2.0 / 3.0;
    let orbitRadius = 2.0;
    let smallOrbPos = vec3<f32>(
      cos(angle) * orbitRadius,
      sin(time * 2.0 + f32(i)) * 0.3,
      sin(angle) * orbitRadius
    );
    let smallOrb = sdSphere(p - smallOrbPos, 0.3);
    scene = opSmoothUnion(scene, smallOrb, 0.3);
  }
  
  // Torus ring
  let torusPos = p - vec3<f32>(0.0, 0.0, 0.0);
  let rotatedP = vec3<f32>(
    torusPos.x * cos(time * 0.2) - torusPos.z * sin(time * 0.2),
    torusPos.y,
    torusPos.x * sin(time * 0.2) + torusPos.z * cos(time * 0.2)
  );
  let torus = sdTorus(rotatedP, vec2<f32>(2.5, 0.1));
  scene = opSmoothUnion(scene, torus, 0.2);
  
  return scene;
}

fn getNormal(p: vec3<f32>) -> vec3<f32> {
  let e = vec2<f32>(0.001, 0.0);
  return normalize(vec3<f32>(
    sceneSDF(p + e.xyy) - sceneSDF(p - e.xyy),
    sceneSDF(p + e.yxy) - sceneSDF(p - e.yxy),
    sceneSDF(p + e.yyx) - sceneSDF(p - e.yyx)
  ));
}

// ═══════════════════════════════════════════════════════════════════════════════
// RAY MARCHING
// ═══════════════════════════════════════════════════════════════════════════════

fn rayMarch(ro: vec3<f32>, rd: vec3<f32>) -> f32 {
  var dO = 0.0;
  
  for (var i = 0; i < MAX_STEPS; i++) {
    let p = ro + rd * dO;
    let dS = sceneSDF(p);
    dO += dS;
    
    if (dO > MAX_DIST || abs(dS) < SURF_DIST) {
      break;
    }
  }
  
  return dO;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIGHTING
// ═══════════════════════════════════════════════════════════════════════════════

fn getLight(p: vec3<f32>, rd: vec3<f32>) -> vec3<f32> {
  // Multiple colored lights
  let light1Pos = vec3<f32>(3.0, 4.0, 2.0);
  let light2Pos = vec3<f32>(-3.0, 2.0, -2.0);
  let light3Pos = vec3<f32>(0.0, -3.0, 3.0);
  
  let light1Color = vec3<f32>(0.545, 0.0, 1.0);  // Violet
  let light2Color = vec3<f32>(1.0, 0.843, 0.0);  // Gold
  let light3Color = vec3<f32>(1.0, 0.078, 0.576); // Plasma
  
  let normal = getNormal(p);
  
  // Diffuse
  let diff1 = max(dot(normal, normalize(light1Pos - p)), 0.0);
  let diff2 = max(dot(normal, normalize(light2Pos - p)), 0.0);
  let diff3 = max(dot(normal, normalize(light3Pos - p)), 0.0);
  
  // Specular (Blinn-Phong)
  let viewDir = -rd;
  let halfDir1 = normalize(normalize(light1Pos - p) + viewDir);
  let halfDir2 = normalize(normalize(light2Pos - p) + viewDir);
  let halfDir3 = normalize(normalize(light3Pos - p) + viewDir);
  
  let spec1 = pow(max(dot(normal, halfDir1), 0.0), 64.0);
  let spec2 = pow(max(dot(normal, halfDir2), 0.0), 64.0);
  let spec3 = pow(max(dot(normal, halfDir3), 0.0), 64.0);
  
  // Fresnel
  let fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
  
  // Combine
  var color = vec3<f32>(0.02); // Ambient
  color += light1Color * (diff1 * 0.6 + spec1 * 0.8);
  color += light2Color * (diff2 * 0.5 + spec2 * 0.6);
  color += light3Color * (diff3 * 0.4 + spec3 * 0.5);
  color += vec3<f32>(0.545, 0.0, 1.0) * fresnel * 0.5; // Violet fresnel rim
  
  return color;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

@compute @workgroup_size(16, 16)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
  let resolution = params.resolution;
  
  if (f32(id.x) >= resolution.x || f32(id.y) >= resolution.y) {
    return;
  }
  
  // UV coordinates
  let uv = (vec2<f32>(f32(id.x), f32(id.y)) - 0.5 * resolution) / resolution.y;
  
  // Camera
  let ro = params.cameraPosition;
  let ta = params.cameraTarget;
  
  // Camera matrix
  let ww = normalize(ta - ro);
  let uu = normalize(cross(ww, vec3<f32>(0.0, 1.0, 0.0)));
  let vv = normalize(cross(uu, ww));
  
  let rd = normalize(uv.x * uu + uv.y * vv + 1.5 * ww);
  
  // Ray march
  let d = rayMarch(ro, rd);
  
  var color = vec3<f32>(0.0);
  
  if (d < MAX_DIST) {
    let p = ro + rd * d;
    color = getLight(p, rd);
    
    // Fog
    let fog = 1.0 - exp(-d * 0.05);
    color = mix(color, vec3<f32>(0.0), fog);
  }
  
  // Gamma correction
  color = pow(color, vec3<f32>(0.4545));
  
  textureStore(outputTexture, vec2<i32>(i32(id.x), i32(id.y)), vec4<f32>(color, 1.0));
}
`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const WEBGPU_SHADERS = {
  particleSystem: WGSL_PARTICLE_SYSTEM,
  fluidSimulation: WGSL_FLUID_SIMULATION,
  sdfRaymarching: WGSL_SDF_RAYMARCHING,
} as const

export default WEBGPU_SHADERS
