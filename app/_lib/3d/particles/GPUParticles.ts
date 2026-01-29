// @ts-nocheck - TODO: Fix TypeScript strict mode issues
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 GPU PARTICLES - Partículas Aceleradas por GPU (WebGPU/Compute Shaders)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { GPUParticleConfig } from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 GPU PARTICLE SHADERS (WGSL)
// ═══════════════════════════════════════════════════════════════════════════════

export const GPUParticleComputeShader = /* wgsl */ `
struct Particle {
  position: vec4f,
  velocity: vec4f,
  color: vec4f,
  life: f32,
  maxLife: f32,
  size: f32,
  pad: f32,
}

struct Uniforms {
  deltaTime: f32,
  time: f32,
  particleCount: u32,
  gravity: vec3f,
  wind: vec3f,
  turbulence: f32,
  mousePosition: vec3f,
  mouseInfluence: f32,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

// Simplex noise for turbulence
fn mod289_3(x: vec3f) -> vec3f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn mod289_4(x: vec4f) -> vec4f { return x - floor(x * (1.0 / 289.0)) * 289.0; }
fn permute(x: vec4f) -> vec4f { return mod289_4(((x * 34.0) + 1.0) * x); }
fn taylorInvSqrt(r: vec4f) -> vec4f { return 1.79284291400159 - 0.85373472095314 * r; }

fn snoise(v: vec3f) -> f32 {
  let C = vec2f(1.0/6.0, 1.0/3.0);
  let D = vec4f(0.0, 0.5, 1.0, 2.0);

  var i = floor(v + dot(v, C.yyy));
  let x0 = v - i + dot(i, C.xxx);

  let g = step(x0.yzx, x0.xyz);
  let l = 1.0 - g;
  let i1 = min(g.xyz, l.zxy);
  let i2 = max(g.xyz, l.zxy);

  let x1 = x0 - i1 + C.xxx;
  let x2 = x0 - i2 + C.yyy;
  let x3 = x0 - D.yyy;

  i = mod289_3(i);
  let p = permute(permute(permute(
    i.z + vec4f(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4f(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4f(0.0, i1.x, i2.x, 1.0));

  let n_ = 0.142857142857;
  let ns = n_ * D.wyz - D.xzx;

  let j = p - 49.0 * floor(p * ns.z * ns.z);

  let x_ = floor(j * ns.z);
  let y_ = floor(j - 7.0 * x_);

  let x = x_ * ns.x + ns.yyyy;
  let y = y_ * ns.x + ns.yyyy;
  let h = 1.0 - abs(x) - abs(y);

  let b0 = vec4f(x.xy, y.xy);
  let b1 = vec4f(x.zw, y.zw);

  let s0 = floor(b0) * 2.0 + 1.0;
  let s1 = floor(b1) * 2.0 + 1.0;
  let sh = -step(h, vec4f(0.0));

  let a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  let a1 = b1.xzyw + s1.xzyw * sh.zzww;

  var p0 = vec3f(a0.xy, h.x);
  var p1 = vec3f(a0.zw, h.y);
  var p2 = vec3f(a1.xy, h.z);
  var p3 = vec3f(a1.zw, h.w);

  let norm = taylorInvSqrt(vec4f(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  var m = max(0.6 - vec4f(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), vec4f(0.0));
  m = m * m;
  return 42.0 * dot(m * m, vec4f(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

fn random(seed: vec2f) -> f32 {
  return fract(sin(dot(seed, vec2f(12.9898, 78.233))) * 43758.5453);
}

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) global_id: vec3u) {
  let idx = global_id.x;
  if (idx >= uniforms.particleCount) {
    return;
  }

  var particle = particles[idx];

  // Update life
  particle.life -= uniforms.deltaTime;

  // Respawn dead particles
  if (particle.life <= 0.0) {
    // Reset position
    let seed = vec2f(f32(idx), uniforms.time);
    let theta = random(seed) * 6.28318;
    let phi = acos(2.0 * random(seed + 0.1) - 1.0);
    let r = pow(random(seed + 0.2), 0.333) * 2.0;

    particle.position = vec4f(
      r * sin(phi) * cos(theta),
      r * sin(phi) * sin(theta),
      r * cos(phi),
      1.0
    );

    // Reset velocity
    let speed = 0.5 + random(seed + 0.3) * 1.0;
    particle.velocity = vec4f(
      (random(seed + 0.4) - 0.5) * speed,
      random(seed + 0.5) * speed,
      (random(seed + 0.6) - 0.5) * speed,
      0.0
    );

    // Reset life
    particle.life = particle.maxLife;

    particles[idx] = particle;
    return;
  }

  // Apply gravity
  particle.velocity += vec4f(uniforms.gravity * uniforms.deltaTime, 0.0);

  // Apply wind
  particle.velocity += vec4f(uniforms.wind * uniforms.deltaTime, 0.0);

  // Apply turbulence
  if (uniforms.turbulence > 0.0) {
    let noisePos = particle.position.xyz * 0.5 + uniforms.time * 0.3;
    let turbulence = vec3f(
      snoise(noisePos),
      snoise(noisePos + 100.0),
      snoise(noisePos + 200.0)
    ) * uniforms.turbulence * uniforms.deltaTime;
    particle.velocity += vec4f(turbulence, 0.0);
  }

  // Mouse influence
  if (uniforms.mouseInfluence > 0.0) {
    let toMouse = uniforms.mousePosition - particle.position.xyz;
    let dist = length(toMouse);
    let influence = 1.0 - smoothstep(0.0, 3.0, dist);
    if (influence > 0.0) {
      let dir = normalize(toMouse);
      particle.velocity += vec4f(dir * influence * uniforms.mouseInfluence * uniforms.deltaTime, 0.0);
    }
  }

  // Update position
  particle.position += particle.velocity * uniforms.deltaTime;

  // Damping
  particle.velocity *= 0.99;

  particles[idx] = particle;
}
`

export const GPUParticleRenderShader = /* wgsl */ `
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) pointCoord: vec2f,
  @location(2) life: f32,
}

struct Uniforms {
  viewProjection: mat4x4f,
  cameraPosition: vec3f,
  pointSize: f32,
}

struct Particle {
  position: vec4f,
  velocity: vec4f,
  color: vec4f,
  life: f32,
  maxLife: f32,
  size: f32,
  pad: f32,
}

@group(0) @binding(0) var<storage, read> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

@vertex
fn vertexMain(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> VertexOutput {
  var output: VertexOutput;

  let particle = particles[instanceIndex];
  let lifeRatio = particle.life / particle.maxLife;

  // Billboard quad vertices
  let quadPositions = array<vec2f, 6>(
    vec2f(-1.0, -1.0),
    vec2f(1.0, -1.0),
    vec2f(-1.0, 1.0),
    vec2f(-1.0, 1.0),
    vec2f(1.0, -1.0),
    vec2f(1.0, 1.0)
  );

  let quadUVs = array<vec2f, 6>(
    vec2f(0.0, 0.0),
    vec2f(1.0, 0.0),
    vec2f(0.0, 1.0),
    vec2f(0.0, 1.0),
    vec2f(1.0, 0.0),
    vec2f(1.0, 1.0)
  );

  let quadPos = quadPositions[vertexIndex];
  output.pointCoord = quadUVs[vertexIndex];

  // Calculate billboard orientation
  let toCamera = normalize(uniforms.cameraPosition - particle.position.xyz);
  let right = normalize(cross(vec3f(0.0, 1.0, 0.0), toCamera));
  let up = cross(toCamera, right);

  // Scale by particle size
  let size = particle.size * uniforms.pointSize * (0.5 + lifeRatio * 0.5);
  let offset = right * quadPos.x * size + up * quadPos.y * size;

  let worldPosition = particle.position.xyz + offset;
  output.position = uniforms.viewProjection * vec4f(worldPosition, 1.0);

  // Fade alpha based on life
  let fadeIn = smoothstep(0.0, 0.1, lifeRatio);
  let fadeOut = 1.0 - smoothstep(0.8, 1.0, lifeRatio);
  let alpha = fadeIn * fadeOut;

  output.color = vec4f(particle.color.rgb, particle.color.a * alpha);
  output.life = lifeRatio;

  return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {
  let dist = length(input.pointCoord - 0.5) * 2.0;
  let alpha = 1.0 - smoothstep(0.0, 1.0, dist);

  // Core glow
  let coreGlow = 1.0 - smoothstep(0.0, 0.3, dist);
  var color = input.color.rgb + vec3f(1.0) * coreGlow * 0.3;

  if (alpha * input.color.a < 0.01) {
    discard;
  }

  return vec4f(color, alpha * input.color.a);
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// 🎮 GPU PARTICLE SYSTEM CLASS (WebGPU)
// ═══════════════════════════════════════════════════════════════════════════════

export class GPUParticles {
  private device: GPUDevice | null = null
  private computePipeline: GPUComputePipeline | null = null
  private renderPipeline: GPURenderPipeline | null = null
  private particleBuffer: GPUBuffer | null = null
  private uniformBuffer: GPUBuffer | null = null
  private bindGroup: GPUBindGroup | null = null

  private config: GPUParticleConfig
  private particleCount: number
  private isInitialized = false

  constructor(config: Partial<GPUParticleConfig> = {}) {
    this.config = {
      count: config.count ?? 100000,
      size: config.size ?? 0.05,
      color: config.color ?? '#00ffff',
      lifetime: config.lifetime ?? 5,
      emissionRate: config.emissionRate ?? 1000,
      emissionShape: config.emissionShape ?? 'sphere',
      emissionRadius: config.emissionRadius ?? 2,
      gravity: config.gravity ?? [0, -0.5, 0],
      wind: config.wind ?? [0, 0, 0],
      turbulence: config.turbulence ?? 0.5,
      workgroupSize: config.workgroupSize ?? 256,
      opacity: config.opacity ?? 1,
      speed: config.speed ?? 1,
      blending: config.blending ?? 'additive',
    }

    this.particleCount = this.config.count
  }

  async initialize(device: GPUDevice): Promise<boolean> {
    this.device = device

    try {
      // Create particle buffer
      const particleSize = 16 * 4 // 16 floats per particle
      this.particleBuffer = device.createBuffer({
        size: this.particleCount * particleSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      })

      // Initialize particles
      await this.initializeParticles()

      // Create uniform buffer
      this.uniformBuffer = device.createBuffer({
        size: 64, // Enough for our uniforms
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      })

      // Create compute pipeline
      const computeModule = device.createShaderModule({
        code: GPUParticleComputeShader,
      })

      const bindGroupLayout = device.createBindGroupLayout({
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: 'storage' },
          },
          {
            binding: 1,
            visibility: GPUShaderStage.COMPUTE,
            buffer: { type: 'uniform' },
          },
        ],
      })

      this.computePipeline = device.createComputePipeline({
        layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
        compute: {
          module: computeModule,
          entryPoint: 'main',
        },
      })

      // Create bind group
      this.bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
          { binding: 0, resource: { buffer: this.particleBuffer } },
          { binding: 1, resource: { buffer: this.uniformBuffer } },
        ],
      })

      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Failed to initialize GPU particles:', error)
      return false
    }
  }

  private async initializeParticles(): Promise<void> {
    if (!this.device || !this.particleBuffer) return

    const particleData = new Float32Array(this.particleCount * 16)
    const color =
      typeof this.config.color === 'string' ? this.hexToRGB(this.config.color) : [1, 1, 1]

    for (let i = 0; i < this.particleCount; i++) {
      const offset = i * 16

      // Position (randomized in sphere)
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const r = this.config.emissionRadius! * Math.cbrt(Math.random())

      particleData[offset + 0] = r * Math.sin(phi) * Math.cos(theta)
      particleData[offset + 1] = r * Math.sin(phi) * Math.sin(theta)
      particleData[offset + 2] = r * Math.cos(phi)
      particleData[offset + 3] = 1

      // Velocity
      const speed = (0.5 + Math.random()) * this.config.speed!
      particleData[offset + 4] = (Math.random() - 0.5) * speed
      particleData[offset + 5] = Math.random() * speed
      particleData[offset + 6] = (Math.random() - 0.5) * speed
      particleData[offset + 7] = 0

      // Color
      particleData[offset + 8] = color[0] ?? 1
      particleData[offset + 9] = color[1] ?? 1
      particleData[offset + 10] = color[2] ?? 1
      particleData[offset + 11] = this.config.opacity ?? 1

      // Life
      const lifetime = this.config.lifetime! * (0.5 + Math.random())
      particleData[offset + 12] = Math.random() * lifetime // Current life (staggered)
      particleData[offset + 13] = lifetime // Max life
      particleData[offset + 14] = this.config.size! * (0.5 + Math.random())
      particleData[offset + 15] = 0 // Padding
    }

    this.device.queue.writeBuffer(this.particleBuffer, 0, particleData)
  }

  private hexToRGB(hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (result && result[1] && result[2] && result[3]) {
      return [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255,
      ]
    }
    return [1, 1, 1]
  }

  update(
    deltaTime: number,
    time: number,
    mousePosition?: [number, number, number],
    mouseInfluence?: number,
  ): void {
    if (!this.device || !this.uniformBuffer || !this.computePipeline || !this.bindGroup) {
      return
    }

    // Update uniforms
    const uniformData = new Float32Array([
      deltaTime,
      time,
      this.particleCount,
      0, // Padding
      ...this.config.gravity!,
      0, // Padding
      ...this.config.wind!,
      this.config.turbulence!,
      ...(mousePosition || [0, 0, 0]),
      mouseInfluence || 0,
    ])

    this.device.queue.writeBuffer(this.uniformBuffer, 0, uniformData)

    // Run compute shader
    const commandEncoder = this.device.createCommandEncoder()
    const passEncoder = commandEncoder.beginComputePass()
    passEncoder.setPipeline(this.computePipeline)
    passEncoder.setBindGroup(0, this.bindGroup)
    passEncoder.dispatchWorkgroups(Math.ceil(this.particleCount / this.config.workgroupSize!))
    passEncoder.end()

    this.device.queue.submit([commandEncoder.finish()])
  }

  getParticleBuffer(): GPUBuffer | null {
    return this.particleBuffer
  }

  dispose(): void {
    this.particleBuffer?.destroy()
    this.uniformBuffer?.destroy()
    this.particleBuffer = null
    this.uniformBuffer = null
    this.computePipeline = null
    this.renderPipeline = null
    this.bindGroup = null
    this.device = null
    this.isInitialized = false
  }

  get initialized(): boolean {
    return this.isInitialized
  }

  get count(): number {
    return this.particleCount
  }
}

export default GPUParticles
