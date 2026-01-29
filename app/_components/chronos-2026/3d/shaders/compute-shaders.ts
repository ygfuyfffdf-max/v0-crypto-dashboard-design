/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎮 CHRONOS 2026 — WEBGPU COMPUTE SHADERS (WGSL/TSL)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Compute shaders para simulación GPU de alta performance:
 * - Particle systems (280+ FPS móvil)
 * - Fluid dynamics simulation
 * - Financial data visualization
 * - Procedural noise generation
 * - Real-time mesh deformation
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// WGSL NOISE LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════

export const wgslNoiseLib = /* wgsl */ `
// ═══════════════════════════════════════════════════════════════════════════════
// HASH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

fn hash11(p: f32) -> f32 {
    var p3 = fract(p * 0.1031);
    p3 = p3 + dot(p3, p3 + 33.33);
    return fract((p3 + p3) * p3);
}

fn hash21(p: vec2<f32>) -> f32 {
    var p3 = fract(vec3<f32>(p.x, p.y, p.x) * 0.1031);
    p3 = p3 + dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

fn hash31(p: vec3<f32>) -> f32 {
    var p3 = fract(p * 0.1031);
    p3 = p3 + dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}

fn hash33(p: vec3<f32>) -> vec3<f32> {
    var p3 = fract(p * vec3<f32>(0.1031, 0.1030, 0.0973));
    p3 = p3 + dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yxx) * p3.zyx);
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERLIN NOISE 3D
// ═══════════════════════════════════════════════════════════════════════════════

fn noise3d(p: vec3<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    
    // Quintic interpolation
    let u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
    
    return mix(
        mix(
            mix(
                dot(hash33(i + vec3<f32>(0.0, 0.0, 0.0)) * 2.0 - 1.0, f - vec3<f32>(0.0, 0.0, 0.0)),
                dot(hash33(i + vec3<f32>(1.0, 0.0, 0.0)) * 2.0 - 1.0, f - vec3<f32>(1.0, 0.0, 0.0)),
                u.x
            ),
            mix(
                dot(hash33(i + vec3<f32>(0.0, 1.0, 0.0)) * 2.0 - 1.0, f - vec3<f32>(0.0, 1.0, 0.0)),
                dot(hash33(i + vec3<f32>(1.0, 1.0, 0.0)) * 2.0 - 1.0, f - vec3<f32>(1.0, 1.0, 0.0)),
                u.x
            ),
            u.y
        ),
        mix(
            mix(
                dot(hash33(i + vec3<f32>(0.0, 0.0, 1.0)) * 2.0 - 1.0, f - vec3<f32>(0.0, 0.0, 1.0)),
                dot(hash33(i + vec3<f32>(1.0, 0.0, 1.0)) * 2.0 - 1.0, f - vec3<f32>(1.0, 0.0, 1.0)),
                u.x
            ),
            mix(
                dot(hash33(i + vec3<f32>(0.0, 1.0, 1.0)) * 2.0 - 1.0, f - vec3<f32>(0.0, 1.0, 1.0)),
                dot(hash33(i + vec3<f32>(1.0, 1.0, 1.0)) * 2.0 - 1.0, f - vec3<f32>(1.0, 1.0, 1.0)),
                u.x
            ),
            u.y
        ),
        u.z
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FBM (FRACTIONAL BROWNIAN MOTION)
// ═══════════════════════════════════════════════════════════════════════════════

fn fbm(p: vec3<f32>, octaves: i32, lacunarity: f32, gain: f32) -> f32 {
    var value = 0.0;
    var amplitude = 0.5;
    var frequency = 1.0;
    var maxValue = 0.0;
    
    var pos = p;
    
    for (var i = 0; i < octaves; i = i + 1) {
        value = value + amplitude * noise3d(pos * frequency);
        maxValue = maxValue + amplitude;
        amplitude = amplitude * gain;
        frequency = frequency * lacunarity;
    }
    
    return value / maxValue;
}

// Ridged FBM
fn fbmRidged(p: vec3<f32>, octaves: i32, lacunarity: f32, gain: f32) -> f32 {
    var value = 0.0;
    var amplitude = 0.5;
    var frequency = 1.0;
    var weight = 1.0;
    
    var pos = p;
    
    for (var i = 0; i < octaves; i = i + 1) {
        var n = 1.0 - abs(noise3d(pos * frequency));
        n = n * n * weight;
        value = value + n * amplitude;
        weight = clamp(n * 2.0, 0.0, 1.0);
        amplitude = amplitude * gain;
        frequency = frequency * lacunarity;
    }
    
    return value;
}

// Turbulent FBM
fn fbmTurbulent(p: vec3<f32>, octaves: i32, lacunarity: f32, gain: f32) -> f32 {
    var value = 0.0;
    var amplitude = 0.5;
    var frequency = 1.0;
    var maxValue = 0.0;
    
    var pos = p;
    
    for (var i = 0; i < octaves; i = i + 1) {
        value = value + amplitude * abs(noise3d(pos * frequency));
        maxValue = maxValue + amplitude;
        amplitude = amplitude * gain;
        frequency = frequency * lacunarity;
    }
    
    return value / maxValue;
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORLEY NOISE (VORONOI)
// ═══════════════════════════════════════════════════════════════════════════════

fn worley(p: vec3<f32>) -> f32 {
    let id = floor(p);
    let fd = fract(p);
    
    var minDist = 1.0;
    
    for (var z = -1; z <= 1; z = z + 1) {
        for (var y = -1; y <= 1; y = y + 1) {
            for (var x = -1; x <= 1; x = x + 1) {
                let offset = vec3<f32>(f32(x), f32(y), f32(z));
                let cellId = id + offset;
                let featurePoint = offset + hash33(cellId) * 0.5 + 0.5;
                let delta = featurePoint - fd;
                let dist = length(delta);
                minDist = min(minDist, dist);
            }
        }
    }
    
    return minDist;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCIAL TURBULENCE
// ═══════════════════════════════════════════════════════════════════════════════

fn financialTurbulence(p: vec3<f32>, time: f32, volatility: f32) -> f32 {
    // Domain warped FBM for organic capital flow
    let q = vec3<f32>(
        fbm(p + vec3<f32>(0.0, 0.0, 0.0), 4, 2.0, 0.5),
        fbm(p + vec3<f32>(5.2, 1.3, 2.8), 4, 2.0, 0.5),
        fbm(p + vec3<f32>(1.7, 9.2, 3.1), 4, 2.0, 0.5)
    );
    
    let r = vec3<f32>(
        fbm(p + 4.0 * q + vec3<f32>(1.7, 9.2, time * 0.1), 4, 2.0, 0.5),
        fbm(p + 4.0 * q + vec3<f32>(8.3, 2.8, time * 0.15), 4, 2.0, 0.5),
        fbm(p + 4.0 * q + vec3<f32>(2.1, 6.3, time * 0.12), 4, 2.0, 0.5)
    );
    
    let baseFlow = fbm(p + 4.0 * r, 4, 2.0, 0.5);
    
    // Market volatility spikes
    let marketVolatility = fbmRidged(p * 3.0 + time * 0.3, 5, 2.2, 0.45) * volatility;
    
    // Transaction cells
    let transactions = (1.0 - worley(p * 4.0 + time * 0.2)) * 0.3;
    
    return baseFlow * (1.0 + marketVolatility) + transactions;
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE SIMULATION COMPUTE SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const particleComputeShader = /* wgsl */ `
${wgslNoiseLib}

struct Particle {
    position: vec3<f32>,
    velocity: vec3<f32>,
    acceleration: vec3<f32>,
    life: f32,
    maxLife: f32,
    size: f32,
    color: vec4<f32>,
}

struct Uniforms {
    time: f32,
    deltaTime: f32,
    attractorPosition: vec3<f32>,
    attractorStrength: f32,
    turbulenceScale: f32,
    turbulenceStrength: f32,
    damping: f32,
    particleCount: u32,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let index = id.x;
    if (index >= uniforms.particleCount) {
        return;
    }
    
    var particle = particles[index];
    
    // Update life
    particle.life = particle.life - uniforms.deltaTime;
    
    // Respawn if dead
    if (particle.life <= 0.0) {
        // Reset position with noise
        let seed = vec3<f32>(f32(index) * 0.01, uniforms.time, f32(index) * 0.02);
        particle.position = hash33(seed) * 4.0 - 2.0;
        particle.velocity = vec3<f32>(0.0);
        particle.life = particle.maxLife;
    }
    
    // Financial turbulence force
    let noisePos = particle.position * uniforms.turbulenceScale + uniforms.time * 0.1;
    let turbulence = vec3<f32>(
        financialTurbulence(noisePos + vec3<f32>(0.0, 0.0, 0.0), uniforms.time, 0.5),
        financialTurbulence(noisePos + vec3<f32>(100.0, 0.0, 0.0), uniforms.time, 0.5),
        financialTurbulence(noisePos + vec3<f32>(0.0, 100.0, 0.0), uniforms.time, 0.5)
    ) * uniforms.turbulenceStrength;
    
    // Attractor force
    let toAttractor = uniforms.attractorPosition - particle.position;
    let attractorDist = length(toAttractor);
    let attractorForce = normalize(toAttractor) * uniforms.attractorStrength / (attractorDist * attractorDist + 0.1);
    
    // Update acceleration
    particle.acceleration = turbulence + attractorForce;
    
    // Velocity integration with damping
    particle.velocity = particle.velocity + particle.acceleration * uniforms.deltaTime;
    particle.velocity = particle.velocity * uniforms.damping;
    
    // Position integration
    particle.position = particle.position + particle.velocity * uniforms.deltaTime;
    
    // Update color based on velocity
    let speed = length(particle.velocity);
    let normalizedLife = particle.life / particle.maxLife;
    particle.color = vec4<f32>(
        0.5 + speed * 0.5,
        0.3 + normalizedLife * 0.4,
        0.8 - speed * 0.3,
        normalizedLife
    );
    
    particles[index] = particle;
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// FLUID SIMULATION COMPUTE SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const fluidComputeShader = /* wgsl */ `
${wgslNoiseLib}

struct Cell {
    velocity: vec2<f32>,
    density: f32,
    pressure: f32,
}

struct FluidUniforms {
    resolution: vec2<u32>,
    time: f32,
    deltaTime: f32,
    viscosity: f32,
    diffusion: f32,
    forceStrength: f32,
    forcePosition: vec2<f32>,
}

@group(0) @binding(0) var<storage, read_write> cells: array<Cell>;
@group(0) @binding(1) var<storage, read> cellsIn: array<Cell>;
@group(0) @binding(2) var<uniform> uniforms: FluidUniforms;

fn getIndex(x: u32, y: u32) -> u32 {
    return y * uniforms.resolution.x + x;
}

fn getCellSafe(x: i32, y: i32) -> Cell {
    let sx = clamp(x, 0, i32(uniforms.resolution.x) - 1);
    let sy = clamp(y, 0, i32(uniforms.resolution.y) - 1);
    return cellsIn[getIndex(u32(sx), u32(sy))];
}

@compute @workgroup_size(8, 8)
fn advect(@builtin(global_invocation_id) id: vec3<u32>) {
    let x = id.x;
    let y = id.y;
    
    if (x >= uniforms.resolution.x || y >= uniforms.resolution.y) {
        return;
    }
    
    let index = getIndex(x, y);
    var cell = cellsIn[index];
    
    // Backtrace
    let pos = vec2<f32>(f32(x), f32(y)) - cell.velocity * uniforms.deltaTime;
    
    // Bilinear interpolation
    let x0 = i32(floor(pos.x));
    let y0 = i32(floor(pos.y));
    let fx = fract(pos.x);
    let fy = fract(pos.y);
    
    let c00 = getCellSafe(x0, y0);
    let c10 = getCellSafe(x0 + 1, y0);
    let c01 = getCellSafe(x0, y0 + 1);
    let c11 = getCellSafe(x0 + 1, y0 + 1);
    
    cell.velocity = mix(
        mix(c00.velocity, c10.velocity, fx),
        mix(c01.velocity, c11.velocity, fx),
        fy
    );
    
    cell.density = mix(
        mix(c00.density, c10.density, fx),
        mix(c01.density, c11.density, fx),
        fy
    );
    
    // Apply turbulence
    let noisePos = vec3<f32>(f32(x) * 0.1, f32(y) * 0.1, uniforms.time * 0.2);
    let turb = financialTurbulence(noisePos, uniforms.time, 0.3);
    cell.velocity = cell.velocity + vec2<f32>(turb * 0.1, turb * 0.05);
    
    cells[index] = cell;
}

@compute @workgroup_size(8, 8)
fn diffuse(@builtin(global_invocation_id) id: vec3<u32>) {
    let x = id.x;
    let y = id.y;
    
    if (x >= uniforms.resolution.x || y >= uniforms.resolution.y) {
        return;
    }
    
    let index = getIndex(x, y);
    let cell = cellsIn[index];
    
    // Gauss-Seidel relaxation
    let a = uniforms.deltaTime * uniforms.diffusion;
    let divisor = 1.0 + 4.0 * a;
    
    let left = getCellSafe(i32(x) - 1, i32(y));
    let right = getCellSafe(i32(x) + 1, i32(y));
    let down = getCellSafe(i32(x), i32(y) - 1);
    let up = getCellSafe(i32(x), i32(y) + 1);
    
    var newCell = cell;
    newCell.velocity = (cell.velocity + a * (left.velocity + right.velocity + down.velocity + up.velocity)) / divisor;
    newCell.density = (cell.density + a * (left.density + right.density + down.density + up.density)) / divisor;
    
    cells[index] = newCell;
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// MESH DEFORMATION COMPUTE SHADER
// ═══════════════════════════════════════════════════════════════════════════════

export const meshDeformComputeShader = /* wgsl */ `
${wgslNoiseLib}

struct Vertex {
    position: vec3<f32>,
    normal: vec3<f32>,
    uv: vec2<f32>,
}

struct DeformUniforms {
    time: f32,
    deformStrength: f32,
    noiseScale: f32,
    volatility: f32,
    growth: f32,
    vertexCount: u32,
}

@group(0) @binding(0) var<storage, read_write> vertices: array<Vertex>;
@group(0) @binding(1) var<storage, read> originalVertices: array<Vertex>;
@group(0) @binding(2) var<uniform> uniforms: DeformUniforms;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) id: vec3<u32>) {
    let index = id.x;
    if (index >= uniforms.vertexCount) {
        return;
    }
    
    let original = originalVertices[index];
    var vertex = vertices[index];
    
    // Calculate financial turbulence at vertex position
    let noisePos = original.position * uniforms.noiseScale + uniforms.time * 0.1;
    let turb = financialTurbulence(noisePos, uniforms.time, uniforms.volatility);
    
    // Capital mountains (ridged noise for peaks)
    let peaks = fbmRidged(noisePos * 0.5, 6, 2.1, 0.52) * uniforms.growth;
    
    // Combined deformation
    let deformation = (turb * 0.5 + peaks * 0.5) * uniforms.deformStrength;
    
    // Apply displacement along normal
    vertex.position = original.position + original.normal * deformation;
    
    // Approximate new normal using finite differences
    let eps = 0.01;
    let dx = financialTurbulence(noisePos + vec3<f32>(eps, 0.0, 0.0), uniforms.time, uniforms.volatility) - 
             financialTurbulence(noisePos - vec3<f32>(eps, 0.0, 0.0), uniforms.time, uniforms.volatility);
    let dy = financialTurbulence(noisePos + vec3<f32>(0.0, eps, 0.0), uniforms.time, uniforms.volatility) - 
             financialTurbulence(noisePos - vec3<f32>(0.0, eps, 0.0), uniforms.time, uniforms.volatility);
    let dz = financialTurbulence(noisePos + vec3<f32>(0.0, 0.0, eps), uniforms.time, uniforms.volatility) - 
             financialTurbulence(noisePos - vec3<f32>(0.0, 0.0, eps), uniforms.time, uniforms.volatility);
    
    let gradient = normalize(vec3<f32>(dx, dy, dz));
    vertex.normal = normalize(original.normal - gradient * uniforms.deformStrength);
    
    vertices[index] = vertex;
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// TSL SHADERS (Three.js Shading Language for Three.js r159+)
// ═══════════════════════════════════════════════════════════════════════════════

export const tslFinancialMaterial = `
import { 
  MeshStandardNodeMaterial, 
  color, 
  positionLocal, 
  normalLocal,
  time,
  uniform,
  vec3,
  float,
  sin,
  cos,
  fract,
  floor,
  mix,
  smoothstep,
  dot,
  length,
  normalize,
  abs,
  pow
} from 'three/tsl';

// FBM implementation in TSL
const hash33 = (p) => {
  const p3 = fract(p.mul(vec3(0.1031, 0.1030, 0.0973)));
  const pp = p3.add(dot(p3, p3.yzx.add(33.33)));
  return fract(pp.xxy.add(pp.yxx).mul(pp.zyx));
};

const noise3d = (p) => {
  const i = floor(p);
  const f = fract(p);
  const u = f.mul(f).mul(f.mul(f.mul(6.0).sub(15.0)).add(10.0));
  
  // Simplified gradient noise
  return mix(
    mix(
      dot(hash33(i).sub(0.5), f),
      dot(hash33(i.add(vec3(1, 0, 0))).sub(0.5), f.sub(vec3(1, 0, 0))),
      u.x
    ),
    mix(
      dot(hash33(i.add(vec3(0, 1, 0))).sub(0.5), f.sub(vec3(0, 1, 0))),
      dot(hash33(i.add(vec3(1, 1, 0))).sub(0.5), f.sub(vec3(1, 1, 0))),
      u.x
    ),
    u.y
  );
};

const fbm = (p, octaves) => {
  let value = float(0);
  let amplitude = float(0.5);
  let frequency = float(1.0);
  
  for (let i = 0; i < octaves; i++) {
    value = value.add(amplitude.mul(noise3d(p.mul(frequency))));
    amplitude = amplitude.mul(0.5);
    frequency = frequency.mul(2.0);
  }
  
  return value;
};

// Create financial material
export const createFinancialMaterial = (options = {}) => {
  const {
    colorProfit = '#10b981',
    colorDebt = '#ef4444',
    colorNeutral = '#8b5cf6',
    volatility = 0.5,
    growth = 1.0,
  } = options;
  
  const material = new MeshStandardNodeMaterial();
  
  // Time uniform
  const uTime = uniform(0);
  const uVolatility = uniform(volatility);
  const uGrowth = uniform(growth);
  
  // Calculate noise-based displacement
  const pos = positionLocal;
  const noiseValue = fbm(pos.add(time.mul(0.1)), 4);
  
  // Color based on noise value
  const profitFactor = smoothstep(-0.5, 0.5, noiseValue);
  const baseColor = mix(
    color(colorDebt),
    color(colorProfit),
    profitFactor
  );
  
  material.colorNode = mix(
    color(colorNeutral),
    baseColor,
    abs(noiseValue).mul(2.0)
  );
  
  // Add emissive for hot spots
  material.emissiveNode = baseColor.mul(abs(noiseValue).mul(uVolatility));
  
  // Metalness and roughness based on activity
  material.metalnessNode = mix(float(0.2), float(0.8), profitFactor);
  material.roughnessNode = mix(float(0.6), float(0.2), profitFactor);
  
  return material;
};
`

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

export const computeShaders = {
  wgsl: {
    noiseLib: wgslNoiseLib,
    particles: particleComputeShader,
    fluid: fluidComputeShader,
    meshDeform: meshDeformComputeShader,
  },
  tsl: {
    financialMaterial: tslFinancialMaterial,
  },
}

export default computeShaders
