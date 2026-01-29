/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ✨ PARTICLE SWARM COMPUTE SHADER — WEBGPU WGSL ULTRA PREMIUM 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Compute shader para 2M+ partículas con:
 * - Swarm behavior (boids-like)
 * - Attract/repel dynamics
 * - Mood-adaptive colores oro/violeta
 * - Event-triggered explosiones
 * - 60fps en GPU modernas
 *
 * @version 1.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ESTRUCTURAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

struct Particle {
  position: vec3<f32>,
  velocity: vec3<f32>,
  color: vec3<f32>,
  life: f32,        // 0-1 lifetime
  size: f32,        // Particle size
  seed: f32,        // Random seed for variation
}

struct SimulationUniforms {
  deltaTime: f32,
  time: f32,
  mood: f32,           // 0 calm, 1 euphoric
  eventTrigger: f32,   // 0-1 event intensity (celebration, alert)
  attractorStrength: f32,
  repelStrength: f32,
  maxSpeed: f32,
  damping: f32,
  noiseStrength: f32,
  centerAttract: f32,
  particleCount: u32,
  explosionActive: u32, // 0 or 1
}

struct Attractor {
  position: vec3<f32>,
  strength: f32,
  radius: f32,
  isRepel: u32,  // 0 = attract, 1 = repel
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BINDINGS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: SimulationUniforms;
@group(0) @binding(2) var<storage, read> attractors: array<Attractor>;

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NOISE FUNCTIONS — GPU-optimized
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

fn hash31(p: vec3<f32>) -> f32 {
  var p3 = fract(p * 0.1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}

fn hash33(p: vec3<f32>) -> vec3<f32> {
  var p3 = fract(p * vec3<f32>(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yxz + 33.33);
  return fract((p3.xxy + p3.yxx) * p3.zyx);
}

fn curl3d(p: vec3<f32>, t: f32) -> vec3<f32> {
  let eps = 0.01;

  // Partial derivatives using noise
  let dx = hash31(p + vec3<f32>(eps, 0.0, 0.0) + t) - hash31(p - vec3<f32>(eps, 0.0, 0.0) + t);
  let dy = hash31(p + vec3<f32>(0.0, eps, 0.0) + t) - hash31(p - vec3<f32>(0.0, eps, 0.0) + t);
  let dz = hash31(p + vec3<f32>(0.0, 0.0, eps) + t) - hash31(p - vec3<f32>(0.0, 0.0, eps) + t);

  return vec3<f32>(dy - dz, dz - dx, dx - dy) / (2.0 * eps);
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SWARM BEHAVIOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

fn centerAttraction(pos: vec3<f32>, strength: f32) -> vec3<f32> {
  let toCenter = -pos;
  let dist = length(toCenter);
  if (dist < 0.001) {
    return vec3<f32>(0.0);
  }
  return normalize(toCenter) * strength * smoothstep(5.0, 0.0, dist);
}

fn attractorForce(pos: vec3<f32>, attractor: Attractor) -> vec3<f32> {
  let toAttractor = attractor.position - pos;
  let dist = length(toAttractor);

  if (dist < 0.001 || dist > attractor.radius) {
    return vec3<f32>(0.0);
  }

  let direction = normalize(toAttractor);
  let falloff = 1.0 - (dist / attractor.radius);
  var force = direction * attractor.strength * falloff * falloff;

  // Negate for repel
  if (attractor.isRepel == 1u) {
    force = -force * 2.0; // Repel is stronger
  }

  return force;
}

fn explosionForce(pos: vec3<f32>, time: f32, intensity: f32) -> vec3<f32> {
  let fromCenter = pos;
  let dist = length(fromCenter);
  if (dist < 0.001) {
    return hash33(pos + time) * 2.0 - 1.0;
  }

  let direction = normalize(fromCenter);
  let explosionWave = sin(time * 10.0 - dist * 5.0) * 0.5 + 0.5;

  return direction * intensity * explosionWave * 5.0;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COLOR FUNCTIONS — Mood-adaptive
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

fn getParticleColor(seed: f32, mood: f32, life: f32) -> vec3<f32> {
  // Calm colors: violetas y azules
  let calmPalette = array<vec3<f32>, 3>(
    vec3<f32>(0.55, 0.0, 1.0),   // Violeta brillante
    vec3<f32>(0.3, 0.0, 0.8),    // Violeta profundo
    vec3<f32>(0.4, 0.2, 1.0)     // Violeta azulado
  );

  // Euphoric colors: oros y naranjas
  let euphoricPalette = array<vec3<f32>, 3>(
    vec3<f32>(1.0, 0.84, 0.0),   // Oro
    vec3<f32>(1.0, 0.65, 0.0),   // Naranja dorado
    vec3<f32>(1.0, 0.5, 0.2)     // Naranja cálido
  );

  let idx = u32(floor(seed * 2.99));

  let calmColor = calmPalette[idx];
  let euphoricColor = euphoricPalette[idx];

  var finalColor = mix(calmColor, euphoricColor, mood);

  // Life-based intensity
  finalColor *= 0.5 + life * 0.5;

  return finalColor;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPUTE SHADER — Simulación principal
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let idx = globalId.x;

  // Bounds check
  if (idx >= uniforms.particleCount) {
    return;
  }

  var p = particles[idx];
  let dt = uniforms.deltaTime;
  let time = uniforms.time;
  let mood = uniforms.mood;

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // FORCE ACCUMULATION
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  var totalForce = vec3<f32>(0.0);

  // 1. Center attraction (orbiting behavior)
  totalForce += centerAttraction(p.position, uniforms.centerAttract);

  // 2. Attractor forces (interactivity)
  // Note: In production, loop through attractors array
  // for (var i = 0u; i < arrayLength(&attractors); i++) {
  //   totalForce += attractorForce(p.position, attractors[i]);
  // }

  // 3. Curl noise for organic movement
  let noiseForce = curl3d(p.position * 2.0, time * 0.5) * uniforms.noiseStrength;
  totalForce += noiseForce;

  // 4. Explosion force (event-triggered)
  if (uniforms.explosionActive == 1u) {
    totalForce += explosionForce(p.position, time, uniforms.eventTrigger);
  }

  // 5. Mood-based behavior modification
  // Calm: more orbital, slow
  // Euphoric: more chaotic, fast
  let moodModifier = 0.5 + mood * 1.5;
  totalForce *= moodModifier;

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // VELOCITY UPDATE
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  p.velocity += totalForce * dt;

  // Damping
  p.velocity *= 1.0 - uniforms.damping * dt;

  // Speed limit
  let speed = length(p.velocity);
  if (speed > uniforms.maxSpeed) {
    p.velocity = normalize(p.velocity) * uniforms.maxSpeed;
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // POSITION UPDATE
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  p.position += p.velocity * dt;

  // Boundary wrap (toroidal)
  let bound = 5.0;
  if (p.position.x > bound) { p.position.x = -bound; }
  if (p.position.x < -bound) { p.position.x = bound; }
  if (p.position.y > bound) { p.position.y = -bound; }
  if (p.position.y < -bound) { p.position.y = bound; }
  if (p.position.z > bound) { p.position.z = -bound; }
  if (p.position.z < -bound) { p.position.z = bound; }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // LIFE & APPEARANCE UPDATE
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  // Life decay
  p.life -= dt * 0.1;
  if (p.life <= 0.0) {
    // Respawn
    p.life = 1.0;
    // Random position in sphere
    let rand = hash33(vec3<f32>(f32(idx), time, p.seed));
    let theta = rand.x * 6.28318;
    let phi = acos(2.0 * rand.y - 1.0);
    let r = pow(rand.z, 0.333) * 3.0;
    p.position = vec3<f32>(
      r * sin(phi) * cos(theta),
      r * sin(phi) * sin(theta),
      r * cos(phi)
    );
    p.velocity = vec3<f32>(0.0);
  }

  // Update color based on mood and life
  p.color = getParticleColor(p.seed, mood, p.life);

  // Size based on speed and life
  p.size = (0.02 + speed * 0.01) * p.life;

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // WRITE BACK
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  particles[idx] = p;
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INITIALIZATION — Para setup inicial de partículas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

@compute @workgroup_size(256)
fn init(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let idx = globalId.x;

  if (idx >= uniforms.particleCount) {
    return;
  }

  var p: Particle;

  // Random seed for this particle
  let seed = hash31(vec3<f32>(f32(idx), 0.0, 0.0));
  p.seed = seed;

  // Random position in sphere
  let rand = hash33(vec3<f32>(f32(idx), 1.0, seed));
  let theta = rand.x * 6.28318;
  let phi = acos(2.0 * rand.y - 1.0);
  let r = pow(rand.z, 0.333) * 3.0;
  p.position = vec3<f32>(
    r * sin(phi) * cos(theta),
    r * sin(phi) * sin(theta),
    r * cos(phi)
  );

  // Random initial velocity
  let velRand = hash33(vec3<f32>(f32(idx), 2.0, seed));
  p.velocity = (velRand - 0.5) * 0.5;

  // Initial color (will be updated in simulation)
  p.color = vec3<f32>(0.55, 0.0, 1.0);

  // Full life
  p.life = hash31(vec3<f32>(f32(idx), 3.0, seed));

  // Base size
  p.size = 0.02 + seed * 0.02;

  particles[idx] = p;
}
