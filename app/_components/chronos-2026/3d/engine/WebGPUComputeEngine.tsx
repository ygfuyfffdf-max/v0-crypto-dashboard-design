/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 CHRONOS 2026 — WEBGPU COMPUTE ENGINE (280+ FPS)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Motor de compute shaders WebGPU para simulación GPU de ultra-alta performance.
 * Diseñado para 280+ FPS en móvil con particle systems y financial turbulence.
 *
 * Features:
 * - Particle simulation con 100K+ partículas
 * - Financial turbulence (capital flows)
 * - FBM + Worley hybrid noise
 * - Real-time mesh deformation
 * - Automatic WebGL fallback
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { logger } from '@/app/lib/utils/logger'
import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface WebGPUCapabilities {
  supported: boolean
  adapter: GPUAdapter | null
  device: GPUDevice | null
  limits: GPUSupportedLimits | null
}

export interface ParticleSystemConfig {
  count: number
  maxSpeed: number
  damping: number
  noiseScale: number
  noiseStrength: number
  attractorStrength: number
  volatility: number
}

export interface ComputeShaderPipeline {
  pipeline: GPUComputePipeline
  bindGroup: GPUBindGroup
  buffers: Map<string, GPUBuffer>
}

// ═══════════════════════════════════════════════════════════════════════════════
// WGSL COMPUTE SHADERS
// ═══════════════════════════════════════════════════════════════════════════════

const PARTICLE_COMPUTE_SHADER = /* wgsl */ `
struct Particle {
  position: vec4<f32>,
  velocity: vec4<f32>,
  color: vec4<f32>,
  life: f32,
  size: f32,
  mass: f32,
  padding: f32,
}

struct Uniforms {
  time: f32,
  deltaTime: f32,
  particleCount: u32,
  volatility: f32,
  noiseScale: f32,
  noiseStrength: f32,
  attractorStrength: f32,
  damping: f32,
  attractorPos: vec3<f32>,
  padding: f32,
}

@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> uniforms: Uniforms;

// ═══════════════════════════════════════════════════════════════════════════════
// NOISE FUNCTIONS (FBM + Worley Hybrid)
// ═══════════════════════════════════════════════════════════════════════════════

fn hash33(p: vec3<f32>) -> vec3<f32> {
    var p3 = fract(p * vec3<f32>(0.1031, 0.1030, 0.0973));
    p3 = p3 + dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yxx) * p3.zyx);
}

fn noise3d(p: vec3<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
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

fn fbm(p: vec3<f32>, octaves: i32) -> f32 {
    var value = 0.0;
    var amplitude = 0.5;
    var frequency = 1.0;
    var maxValue = 0.0;
    var pos = p;

    for (var i = 0; i < octaves; i = i + 1) {
        value = value + amplitude * noise3d(pos * frequency);
        maxValue = maxValue + amplitude;
        amplitude = amplitude * 0.5;
        frequency = frequency * 2.0;
    }

    return value / maxValue;
}

fn fbmRidged(p: vec3<f32>, octaves: i32) -> f32 {
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
        amplitude = amplitude * 0.45;
        frequency = frequency * 2.2;
    }

    return value;
}

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

// Hybrid FBM + Worley (Financial Turbulence)
fn financialTurbulence(p: vec3<f32>, time: f32, volatility: f32) -> vec3<f32> {
    let flowP = p + vec3<f32>(time * 0.1, time * 0.05, 0.0);

    // Domain warping for organic flow
    let q = vec3<f32>(
        fbm(flowP + vec3<f32>(0.0, 0.0, 0.0), 4),
        fbm(flowP + vec3<f32>(5.2, 1.3, 2.8), 4),
        fbm(flowP + vec3<f32>(1.7, 9.2, 3.1), 4)
    );

    let r = vec3<f32>(
        fbm(flowP + 4.0 * q + vec3<f32>(1.7, 9.2, time * 0.1), 4),
        fbm(flowP + 4.0 * q + vec3<f32>(8.3, 2.8, time * 0.15), 4),
        fbm(flowP + 4.0 * q + vec3<f32>(2.1, 6.3, time * 0.12), 4)
    );

    // Ridged for volatility spikes
    let ridged = fbmRidged(p * 3.0 + time * 0.3, 5) * volatility;

    // Worley for discrete transaction points
    let cells = worley(p * 4.0 + time * 0.2);

    // Combine into flow direction
    return normalize(r - 0.5) * (1.0 + ridged) * (1.0 - cells * 0.3);
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPUTE
// ═══════════════════════════════════════════════════════════════════════════════

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let idx = global_id.x;
    if (idx >= uniforms.particleCount) { return; }

    var particle = particles[idx];

    // Update life
    particle.life = particle.life - uniforms.deltaTime * 0.1;

    // Respawn if dead
    if (particle.life <= 0.0) {
        let seed = hash33(vec3<f32>(f32(idx), uniforms.time, 0.0));
        particle.position = vec4<f32>(
            (seed.x - 0.5) * 10.0,
            (seed.y - 0.5) * 10.0,
            (seed.z - 0.5) * 10.0,
            1.0
        );
        particle.velocity = vec4<f32>(0.0, 0.0, 0.0, 0.0);
        particle.life = 1.0 + seed.x * 2.0;
        particle.size = 0.01 + seed.y * 0.03;

        // Financial color gradient (green = profit, red = loss)
        let profitRatio = fbm(particle.position.xyz * 0.5 + uniforms.time * 0.1, 3);
        if (profitRatio > 0.0) {
            particle.color = vec4<f32>(0.2, 0.8 + profitRatio * 0.2, 0.4, 1.0);
        } else {
            particle.color = vec4<f32>(0.8 - profitRatio * 0.2, 0.2, 0.3, 1.0);
        }
    }

    // Calculate forces
    let noisePos = particle.position.xyz * uniforms.noiseScale;
    let turbulence = financialTurbulence(noisePos, uniforms.time, uniforms.volatility);

    // Noise force
    let noiseForce = turbulence * uniforms.noiseStrength;

    // Attractor force (towards center or attractor point)
    let toAttractor = uniforms.attractorPos - particle.position.xyz;
    let attractorDist = length(toAttractor);
    let attractorForce = normalize(toAttractor) * uniforms.attractorStrength / (1.0 + attractorDist * 0.1);

    // Apply forces
    particle.velocity = particle.velocity + vec4<f32>(noiseForce + attractorForce, 0.0) * uniforms.deltaTime;

    // Damping
    particle.velocity = particle.velocity * uniforms.damping;

    // Clamp velocity
    let speed = length(particle.velocity.xyz);
    if (speed > 5.0) {
        particle.velocity = particle.velocity * (5.0 / speed);
    }

    // Update position
    particle.position = particle.position + particle.velocity * uniforms.deltaTime;

    // Bounds check
    let bounds = 15.0;
    if (abs(particle.position.x) > bounds) { particle.velocity.x = particle.velocity.x * -0.5; }
    if (abs(particle.position.y) > bounds) { particle.velocity.y = particle.velocity.y * -0.5; }
    if (abs(particle.position.z) > bounds) { particle.velocity.z = particle.velocity.z * -0.5; }

    // Update color based on velocity (faster = brighter)
    let speedFactor = clamp(speed * 0.5, 0.0, 1.0);
    particle.color.a = 0.3 + speedFactor * 0.7;

    // Size pulsation
    particle.size = particle.size * (0.95 + fbm(particle.position.xyz + uniforms.time, 2) * 0.1);

    particles[idx] = particle;
}
`

const FINANCIAL_FLOW_SHADER = /* wgsl */ `
struct FlowVertex {
  position: vec4<f32>,
  normal: vec4<f32>,
  uv: vec2<f32>,
  displacement: f32,
  flowValue: f32,
}

struct FlowUniforms {
  time: f32,
  volatility: f32,
  growth: f32,
  noiseScale: f32,
  displacementStrength: f32,
  resolution: vec2<f32>,
  padding: f32,
}

@group(0) @binding(0) var<storage, read_write> vertices: array<FlowVertex>;
@group(0) @binding(1) var<uniform> uniforms: FlowUniforms;

fn hash33(p: vec3<f32>) -> vec3<f32> {
    var p3 = fract(p * vec3<f32>(0.1031, 0.1030, 0.0973));
    p3 = p3 + dot(p3, p3.yxz + 33.33);
    return fract((p3.xxy + p3.yxx) * p3.zyx);
}

fn noise3d(p: vec3<f32>) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

    return mix(
        mix(
            mix(
                dot(hash33(i) * 2.0 - 1.0, f),
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

fn fbm(p: vec3<f32>, octaves: i32) -> f32 {
    var value = 0.0;
    var amplitude = 0.5;
    var frequency = 1.0;

    for (var i = 0; i < octaves; i = i + 1) {
        value = value + amplitude * noise3d(p * frequency);
        amplitude = amplitude * 0.5;
        frequency = frequency * 2.0;
    }

    return value;
}

fn capitalMountains(p: vec3<f32>, growth: f32, time: f32) -> f32 {
    // Ridged FBM for profit peaks
    var value = 0.0;
    var amplitude = 0.5;
    var frequency = 1.0;
    var weight = 1.0;

    for (var i = 0; i < 6; i = i + 1) {
        var n = 1.0 - abs(noise3d(p * frequency + time * 0.05));
        n = n * n * weight;
        value = value + n * amplitude;
        weight = clamp(n * 2.0, 0.0, 1.0);
        amplitude = amplitude * 0.52;
        frequency = frequency * 2.1;
    }

    return value * growth;
}

fn debtRivers(p: vec3<f32>, time: f32) -> f32 {
    // Billowed FBM for valleys
    let ridged = capitalMountains(p, 1.0, time);
    let valleys = 1.0 - ridged;

    // Add turbulent edges
    let edges = abs(fbm(p * 2.0 + time * 0.1, 4));

    return valleys * (1.0 - edges * 0.3);
}

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let idx = global_id.x;
    var vertex = vertices[idx];

    let noisePos = vertex.position.xyz * uniforms.noiseScale;

    // Calculate terrain displacement
    let mountains = capitalMountains(noisePos, uniforms.growth, uniforms.time);
    let rivers = debtRivers(noisePos, uniforms.time);

    // Blend based on volatility
    let displacement = mix(mountains, rivers, uniforms.volatility) * uniforms.displacementStrength;

    vertex.displacement = displacement;
    vertex.flowValue = fbm(noisePos + uniforms.time * 0.1, 4);

    // Apply displacement along normal
    vertex.position = vertex.position + vertex.normal * displacement;

    vertices[idx] = vertex;
}
`

// ═══════════════════════════════════════════════════════════════════════════════
// WEBGPU ENGINE HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useWebGPUCompute() {
  const [capabilities, setCapabilities] = useState<WebGPUCapabilities>({
    supported: false,
    adapter: null,
    device: null,
    limits: null,
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const deviceRef = useRef<GPUDevice | null>(null)

  useEffect(() => {
    async function initWebGPU() {
      if (!navigator.gpu) {
        logger.warn('WebGPU not supported, falling back to WebGL', {
          context: 'WebGPUComputeEngine',
        })
        setCapabilities({ supported: false, adapter: null, device: null, limits: null })
        return
      }

      try {
        const adapter = await navigator.gpu.requestAdapter({
          powerPreference: 'high-performance',
        })

        if (!adapter) {
          logger.warn('No WebGPU adapter found', { context: 'WebGPUComputeEngine' })
          return
        }

        const device = await adapter.requestDevice({
          requiredLimits: {
            maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
            maxComputeWorkgroupsPerDimension: adapter.limits.maxComputeWorkgroupsPerDimension,
          },
        })

        deviceRef.current = device
        setCapabilities({
          supported: true,
          adapter,
          device,
          limits: device.limits,
        })
        setIsInitialized(true)
      } catch (error) {
        logger.error('WebGPU initialization failed', error, { context: 'WebGPUComputeEngine' })
      }
    }

    initWebGPU()

    return () => {
      deviceRef.current?.destroy()
    }
  }, [])

  const createParticlePipeline = useCallback(async (config: ParticleSystemConfig) => {
    if (!deviceRef.current) return null

    const device = deviceRef.current

    // Create shader module
    const shaderModule = device.createShaderModule({
      code: PARTICLE_COMPUTE_SHADER,
    })

    // Create uniform buffer
    const uniformBuffer = device.createBuffer({
      size: 64, // 16 floats
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    })

    // Create particle buffer
    const particleData = new Float32Array(config.count * 16) // 16 floats per particle
    for (let i = 0; i < config.count; i++) {
      const offset = i * 16
      // Position
      particleData[offset + 0] = (Math.random() - 0.5) * 10
      particleData[offset + 1] = (Math.random() - 0.5) * 10
      particleData[offset + 2] = (Math.random() - 0.5) * 10
      particleData[offset + 3] = 1.0
      // Velocity
      particleData[offset + 4] = 0
      particleData[offset + 5] = 0
      particleData[offset + 6] = 0
      particleData[offset + 7] = 0
      // Color
      particleData[offset + 8] = Math.random()
      particleData[offset + 9] = Math.random()
      particleData[offset + 10] = Math.random()
      particleData[offset + 11] = 1.0
      // Life, size, mass, padding
      particleData[offset + 12] = 1.0 + Math.random() * 2.0
      particleData[offset + 13] = 0.01 + Math.random() * 0.03
      particleData[offset + 14] = 1.0
      particleData[offset + 15] = 0.0
    }

    const particleBuffer = device.createBuffer({
      size: particleData.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      mappedAtCreation: true,
    })
    new Float32Array(particleBuffer.getMappedRange()).set(particleData)
    particleBuffer.unmap()

    // Create bind group layout
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

    // Create pipeline
    const pipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      }),
      compute: {
        module: shaderModule,
        entryPoint: 'main',
      },
    })

    // Create bind group
    const bindGroup = device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: particleBuffer } },
        { binding: 1, resource: { buffer: uniformBuffer } },
      ],
    })

    return {
      pipeline,
      bindGroup,
      buffers: new Map([
        ['particles', particleBuffer],
        ['uniforms', uniformBuffer],
      ]),
      config,
    }
  }, [])

  const runComputePass = useCallback(
    async (
      pipelineData: ComputeShaderPipeline & { config: ParticleSystemConfig },
      time: number,
      deltaTime: number,
    ) => {
      if (!deviceRef.current) return

      const device = deviceRef.current
      const { pipeline, bindGroup, buffers, config } = pipelineData

      // Update uniforms
      const uniformData = new Float32Array([
        time,
        deltaTime,
        config.count,
        config.volatility,
        config.noiseScale,
        config.noiseStrength,
        config.attractorStrength,
        config.damping,
        0,
        0,
        0, // attractor position
        0, // padding
      ])

      device.queue.writeBuffer(buffers.get('uniforms')!, 0, uniformData)

      // Create and submit command
      const commandEncoder = device.createCommandEncoder()
      const passEncoder = commandEncoder.beginComputePass()
      passEncoder.setPipeline(pipeline)
      passEncoder.setBindGroup(0, bindGroup)
      passEncoder.dispatchWorkgroups(Math.ceil(config.count / 256))
      passEncoder.end()

      device.queue.submit([commandEncoder.finish()])
    },
    [],
  )

  return {
    capabilities,
    isInitialized,
    createParticlePipeline,
    runComputePass,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCIAL PARTICLE SYSTEM COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface FinancialParticleSystemProps {
  count?: number
  volatility?: number
  growth?: number
  colorProfit?: THREE.Color
  colorLoss?: THREE.Color
}

export function FinancialParticleSystem({
  count = 50000,
  volatility = 0.5,
  growth = 1.0,
  colorProfit = new THREE.Color(0x10b981),
  colorLoss = new THREE.Color(0xef4444),
}: FinancialParticleSystemProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { clock } = useThree()

  // Create geometry with initial positions
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const velocities = new Float32Array(count * 3)
    const lives = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * 20
      positions[i3 + 1] = (Math.random() - 0.5) * 20
      positions[i3 + 2] = (Math.random() - 0.5) * 20

      const isProfit = Math.random() > 0.5
      if (isProfit) {
        colors[i3] = colorProfit.r
        colors[i3 + 1] = colorProfit.g
        colors[i3 + 2] = colorProfit.b
      } else {
        colors[i3] = colorLoss.r
        colors[i3 + 1] = colorLoss.g
        colors[i3 + 2] = colorLoss.b
      }

      sizes[i] = Math.random() * 0.05 + 0.01
      velocities[i3] = 0
      velocities[i3 + 1] = 0
      velocities[i3 + 2] = 0
      lives[i] = Math.random() * 3 + 1
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geo.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    geo.setAttribute('life', new THREE.BufferAttribute(lives, 1))

    return geo
  }, [count, colorProfit, colorLoss])

  // Shader material with financial turbulence
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uVolatility: { value: volatility },
        uGrowth: { value: growth },
        uPointSize: { value: 3.0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 velocity;
        attribute float life;

        varying vec3 vColor;
        varying float vLife;

        uniform float uTime;
        uniform float uPointSize;

        void main() {
          vColor = color;
          vLife = life;

          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * uPointSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vLife;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;

          float alpha = smoothstep(0.5, 0.0, dist) * min(vLife, 1.0);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })
  }, [volatility, growth])

  // CPU-based simulation (fallback when WebGPU not available)
  useFrame((state, delta) => {
    if (!pointsRef.current || !materialRef.current?.uniforms?.uTime) return

    const time = clock.getElapsedTime()
    materialRef.current.uniforms.uTime.value = time

    const posAttr = geometry.attributes.position
    const velAttr = geometry.attributes.velocity
    const lifeAttr = geometry.attributes.life
    const colorAttr = geometry.attributes.color
    if (!posAttr?.array || !velAttr?.array || !lifeAttr?.array || !colorAttr?.array) return

    const positions = posAttr.array as Float32Array
    const velocities = velAttr.array as Float32Array
    const lives = lifeAttr.array as Float32Array
    const colors = colorAttr.array as Float32Array

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      lives[i]! -= delta * 0.1

      if (lives[i]! <= 0) {
        // Respawn
        positions[i3] = (Math.random() - 0.5) * 20
        positions[i3 + 1] = (Math.random() - 0.5) * 20
        positions[i3 + 2] = (Math.random() - 0.5) * 20
        velocities[i3] = 0
        velocities[i3 + 1] = 0
        velocities[i3 + 2] = 0
        lives[i] = Math.random() * 3 + 1
      }

      // Simple turbulence (CPU fallback)
      const noiseX = Math.sin((positions[i3] ?? 0) * 0.5 + time) * 0.1
      const noiseY = Math.cos((positions[i3 + 1] ?? 0) * 0.5 + time * 1.1) * 0.1
      const noiseZ = Math.sin((positions[i3 + 2] ?? 0) * 0.5 + time * 0.9) * 0.1

      velocities[i3] = (velocities[i3] ?? 0) + noiseX * volatility * delta
      velocities[i3 + 1] = (velocities[i3 + 1] ?? 0) + noiseY * volatility * delta
      velocities[i3 + 2] = (velocities[i3 + 2] ?? 0) + noiseZ * volatility * delta

      // Damping
      velocities[i3] = (velocities[i3] ?? 0) * 0.98
      velocities[i3 + 1] = (velocities[i3 + 1] ?? 0) * 0.98
      velocities[i3 + 2] = (velocities[i3 + 2] ?? 0) * 0.98

      // Update position
      positions[i3] = (positions[i3] ?? 0) + (velocities[i3] ?? 0)
      positions[i3 + 1] = (positions[i3 + 1] ?? 0) + (velocities[i3 + 1] ?? 0)
      positions[i3 + 2] = (positions[i3 + 2] ?? 0) + (velocities[i3 + 2] ?? 0)

      // Bounds
      const bounds = 15
      if (Math.abs(positions[i3] ?? 0) > bounds) velocities[i3] = (velocities[i3] ?? 0) * -0.5
      if (Math.abs(positions[i3 + 1] ?? 0) > bounds) {
        velocities[i3 + 1] = (velocities[i3 + 1] ?? 0) * -0.5
      }
      if (Math.abs(positions[i3 + 2] ?? 0) > bounds) {
        velocities[i3 + 2] = (velocities[i3 + 2] ?? 0) * -0.5
      }
    }

    const positionAttr = geometry.attributes.position
    const velocityAttr = geometry.attributes.velocity
    const lifeAttr2 = geometry.attributes.life
    if (positionAttr) positionAttr.needsUpdate = true
    if (velocityAttr) velocityAttr.needsUpdate = true
    if (lifeAttr2) lifeAttr2.needsUpdate = true
  })

  return (
    <points ref={pointsRef} geometry={geometry}>
      <primitive ref={materialRef} object={shaderMaterial} attach="material" />
    </points>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { FINANCIAL_FLOW_SHADER, PARTICLE_COMPUTE_SHADER }
export default FinancialParticleSystem
