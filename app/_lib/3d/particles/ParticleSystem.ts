// @ts-nocheck - TODO: Fix TypeScript strict mode issues
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💫 PARTICLE SYSTEM - Sistema de Partículas de Alto Rendimiento
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de partículas optimizado para WebGL con soporte para:
 * - Millones de partículas con instanced rendering
 * - Física básica (gravedad, viento, turbulencia)
 * - Emisores configurables
 * - Texturas y sprites
 * - Blending modes
 */

import * as THREE from 'three'
import type { ParticleConfig } from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 PARTICLE SHADERS
// ═══════════════════════════════════════════════════════════════════════════════

const particleVertexShader = /* glsl */ `
  attribute vec3 velocity;
  attribute float life;
  attribute float maxLife;
  attribute vec3 particleColor;
  attribute float particleSize;

  uniform float uTime;
  uniform float uPointSize;
  uniform vec3 uGravity;
  uniform vec3 uWind;
  uniform float uTurbulence;

  varying float vLife;
  varying vec3 vColor;
  varying float vAlpha;

  // Simplex noise for turbulence
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vLife = life / maxLife;
    vColor = particleColor;

    // Calculate age-based alpha
    float fadeIn = smoothstep(0.0, 0.1, vLife);
    float fadeOut = 1.0 - smoothstep(0.8, 1.0, vLife);
    vAlpha = fadeIn * fadeOut;

    // Apply physics
    vec3 pos = position;
    float t = (1.0 - vLife) * maxLife;

    // Velocity
    pos += velocity * t;

    // Gravity
    pos += 0.5 * uGravity * t * t;

    // Wind
    pos += uWind * t;

    // Turbulence
    if(uTurbulence > 0.0) {
      vec3 turbulence = vec3(
        snoise(pos * 0.5 + uTime * 0.3),
        snoise(pos * 0.5 + uTime * 0.3 + 100.0),
        snoise(pos * 0.5 + uTime * 0.3 + 200.0)
      ) * uTurbulence;
      pos += turbulence;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Size based on life and distance
    float sizeAttenuation = 300.0 / -mvPosition.z;
    gl_PointSize = particleSize * uPointSize * sizeAttenuation * (0.5 + vLife * 0.5);

    gl_Position = projectionMatrix * mvPosition;
  }
`

const particleFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform bool uUseTexture;
  uniform int uBlendMode;

  varying float vLife;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 uv = gl_PointCoord;

    vec4 color;
    if(uUseTexture) {
      color = texture2D(uTexture, uv);
      color.rgb *= vColor;
    } else {
      // Circular particle with soft edges
      float dist = length(uv - 0.5) * 2.0;
      float alpha = 1.0 - smoothstep(0.0, 1.0, dist);
      color = vec4(vColor, alpha);
    }

    color.a *= vAlpha;

    // Discard if too transparent
    if(color.a < 0.01) discard;

    gl_FragColor = color;
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// 💫 PARTICLE SYSTEM CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class ParticleSystem {
  private geometry: THREE.BufferGeometry
  private material: THREE.ShaderMaterial
  public mesh: THREE.Points

  private config: ParticleConfig
  private particleCount: number

  // Attribute arrays
  private positions: Float32Array
  private velocities: Float32Array
  private lives: Float32Array
  private maxLives: Float32Array
  private colors: Float32Array
  private sizes: Float32Array

  // State
  private isRunning = false
  private time = 0

  constructor(config: Partial<ParticleConfig> = {}) {
    this.config = {
      count: config.count ?? 10000,
      size: config.size ?? 0.1,
      sizeRange: config.sizeRange ?? [0.05, 0.15],
      color: config.color ?? '#ffffff',
      colorMode: config.colorMode ?? 'solid',
      opacity: config.opacity ?? 1,
      opacityRange: config.opacityRange ?? [0.5, 1],
      speed: config.speed ?? 1,
      speedRange: config.speedRange ?? [0.5, 1.5],
      lifetime: config.lifetime ?? 3,
      lifetimeRange: config.lifetimeRange ?? [2, 4],
      emissionRate: config.emissionRate ?? 100,
      emissionShape: config.emissionShape ?? 'point',
      emissionRadius: config.emissionRadius ?? 1,
      emissionSize: config.emissionSize ?? [1, 1, 1],
      gravity: config.gravity ?? [0, -0.5, 0],
      wind: config.wind ?? [0, 0, 0],
      turbulence: config.turbulence ?? 0.5,
      blending: config.blending ?? 'additive',
    }

    this.particleCount = this.config.count

    // Initialize arrays
    this.positions = new Float32Array(this.particleCount * 3)
    this.velocities = new Float32Array(this.particleCount * 3)
    this.lives = new Float32Array(this.particleCount)
    this.maxLives = new Float32Array(this.particleCount)
    this.colors = new Float32Array(this.particleCount * 3)
    this.sizes = new Float32Array(this.particleCount)

    // Create geometry
    this.geometry = new THREE.BufferGeometry()
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3))
    this.geometry.setAttribute('velocity', new THREE.BufferAttribute(this.velocities, 3))
    this.geometry.setAttribute('life', new THREE.BufferAttribute(this.lives, 1))
    this.geometry.setAttribute('maxLife', new THREE.BufferAttribute(this.maxLives, 1))
    this.geometry.setAttribute('particleColor', new THREE.BufferAttribute(this.colors, 3))
    this.geometry.setAttribute('particleSize', new THREE.BufferAttribute(this.sizes, 1))

    // Create material
    this.material = new THREE.ShaderMaterial({
      vertexShader: particleVertexShader,
      fragmentShader: particleFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPointSize: { value: this.config.size },
        uGravity: { value: new THREE.Vector3(...this.config.gravity!) },
        uWind: { value: new THREE.Vector3(...this.config.wind!) },
        uTurbulence: { value: this.config.turbulence },
        uTexture: { value: null },
        uUseTexture: { value: false },
        uBlendMode: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: this.getBlendingMode(),
    })

    // Create mesh
    this.mesh = new THREE.Points(this.geometry, this.material)

    // Initialize particles
    this.initializeParticles()
  }

  private getBlendingMode(): THREE.Blending {
    switch (this.config.blending) {
      case 'additive':
        return THREE.AdditiveBlending
      case 'multiply':
        return THREE.MultiplyBlending
      case 'screen':
        return THREE.CustomBlending
      default:
        return THREE.NormalBlending
    }
  }

  private initializeParticles(): void {
    for (let i = 0; i < this.particleCount; i++) {
      this.resetParticle(i)
    }
    this.updateAttributes()
  }

  private resetParticle(index: number): void {
    const i3 = index * 3

    // Position based on emission shape
    const [px, py, pz] = this.getEmissionPosition()
    this.positions[i3] = px
    this.positions[i3 + 1] = py
    this.positions[i3 + 2] = pz

    // Velocity
    const speed = this.randomInRange(this.config.speedRange!)
    const theta = Math.random() * Math.PI * 2
    const phi = Math.random() * Math.PI
    this.velocities[i3] = Math.sin(phi) * Math.cos(theta) * speed
    this.velocities[i3 + 1] = Math.cos(phi) * speed
    this.velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speed

    // Life
    const lifetime = this.randomInRange(this.config.lifetimeRange!)
    this.lives[index] = lifetime
    this.maxLives[index] = lifetime

    // Color
    const color = this.getParticleColor()
    this.colors[i3] = color.r
    this.colors[i3 + 1] = color.g
    this.colors[i3 + 2] = color.b

    // Size
    this.sizes[index] = this.randomInRange(this.config.sizeRange!)
  }

  private getEmissionPosition(): [number, number, number] {
    switch (this.config.emissionShape) {
      case 'sphere': {
        const r = this.config.emissionRadius! * Math.cbrt(Math.random())
        const theta = Math.random() * Math.PI * 2
        const phi = Math.acos(2 * Math.random() - 1)
        return [
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi),
        ]
      }
      case 'box': {
        const [sx, sy, sz] = this.config.emissionSize!
        return [(Math.random() - 0.5) * sx, (Math.random() - 0.5) * sy, (Math.random() - 0.5) * sz]
      }
      case 'disk': {
        const r = this.config.emissionRadius! * Math.sqrt(Math.random())
        const theta = Math.random() * Math.PI * 2
        return [r * Math.cos(theta), 0, r * Math.sin(theta)]
      }
      case 'cone': {
        const r = this.config.emissionRadius! * Math.random()
        const theta = Math.random() * Math.PI * 2
        const h = Math.random()
        return [r * h * Math.cos(theta), h, r * h * Math.sin(theta)]
      }
      case 'ring': {
        const r = this.config.emissionRadius!
        const theta = Math.random() * Math.PI * 2
        return [r * Math.cos(theta), 0, r * Math.sin(theta)]
      }
      default:
        return [0, 0, 0]
    }
  }

  private getParticleColor(): THREE.Color {
    if (typeof this.config.color === 'string') {
      return new THREE.Color(this.config.color)
    }

    if (Array.isArray(this.config.color)) {
      if (this.config.colorMode === 'random') {
        return new THREE.Color(
          this.config.color[Math.floor(Math.random() * this.config.color.length)],
        )
      }
      // Gradient - interpolate based on random value
      const t = Math.random()
      const idx = t * (this.config.color.length - 1)
      const i1 = Math.floor(idx)
      const i2 = Math.min(i1 + 1, this.config.color.length - 1)
      const color1 = new THREE.Color(this.config.color[i1])
      const color2 = new THREE.Color(this.config.color[i2])
      return color1.lerp(color2, idx - i1)
    }

    return new THREE.Color(0xffffff)
  }

  private randomInRange(range: [number, number]): number {
    return range[0] + Math.random() * (range[1] - range[0])
  }

  private updateAttributes(): void {
    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute
    const velAttr = this.geometry.getAttribute('velocity') as THREE.BufferAttribute
    const lifeAttr = this.geometry.getAttribute('life') as THREE.BufferAttribute
    const maxLifeAttr = this.geometry.getAttribute('maxLife') as THREE.BufferAttribute
    const colorAttr = this.geometry.getAttribute('particleColor') as THREE.BufferAttribute
    const sizeAttr = this.geometry.getAttribute('particleSize') as THREE.BufferAttribute

    posAttr.needsUpdate = true
    velAttr.needsUpdate = true
    lifeAttr.needsUpdate = true
    maxLifeAttr.needsUpdate = true
    colorAttr.needsUpdate = true
    sizeAttr.needsUpdate = true
  }

  update(deltaTime: number): void {
    if (!this.isRunning) return

    this.time += deltaTime
    this.material.uniforms.uTime.value = this.time

    // Update particle lives
    for (let i = 0; i < this.particleCount; i++) {
      this.lives[i] -= deltaTime

      // Respawn dead particles
      if (this.lives[i] <= 0) {
        this.resetParticle(i)
      }
    }

    // Update attributes
    const lifeAttr = this.geometry.getAttribute('life') as THREE.BufferAttribute
    lifeAttr.needsUpdate = true
  }

  start(): void {
    this.isRunning = true
  }

  stop(): void {
    this.isRunning = false
  }

  reset(): void {
    this.time = 0
    this.initializeParticles()
  }

  setConfig(config: Partial<ParticleConfig>): void {
    Object.assign(this.config, config)

    // Update uniforms
    if (config.gravity) {
      this.material.uniforms.uGravity.value.set(...config.gravity)
    }
    if (config.wind) {
      this.material.uniforms.uWind.value.set(...config.wind)
    }
    if (config.turbulence !== undefined) {
      this.material.uniforms.uTurbulence.value = config.turbulence
    }
    if (config.size !== undefined) {
      this.material.uniforms.uPointSize.value = config.size
    }
  }

  setTexture(texture: THREE.Texture): void {
    this.material.uniforms.uTexture.value = texture
    this.material.uniforms.uUseTexture.value = true
  }

  dispose(): void {
    this.geometry.dispose()
    this.material.dispose()
  }

  // Getters
  get running(): boolean {
    return this.isRunning
  }

  get count(): number {
    return this.particleCount
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 PARTICLE PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

export const ParticlePresets: Record<string, Partial<ParticleConfig>> = {
  fire: {
    count: 5000,
    size: 0.15,
    sizeRange: [0.1, 0.2],
    color: ['#ff4400', '#ff8800', '#ffcc00'],
    colorMode: 'gradient',
    lifetime: 2,
    lifetimeRange: [1, 3],
    emissionShape: 'cone',
    emissionRadius: 0.3,
    gravity: [0, 1, 0],
    turbulence: 0.8,
    blending: 'additive',
  },

  snow: {
    count: 10000,
    size: 0.05,
    sizeRange: [0.03, 0.08],
    color: '#ffffff',
    lifetime: 8,
    lifetimeRange: [6, 10],
    emissionShape: 'box',
    emissionSize: [20, 0, 20],
    gravity: [0, -0.5, 0],
    wind: [0.2, 0, 0.1],
    turbulence: 0.3,
    blending: 'normal',
  },

  stars: {
    count: 2000,
    size: 0.08,
    sizeRange: [0.05, 0.12],
    color: ['#ffffff', '#aaccff', '#ffddaa'],
    colorMode: 'random',
    lifetime: 999,
    emissionShape: 'sphere',
    emissionRadius: 50,
    gravity: [0, 0, 0],
    turbulence: 0,
    blending: 'additive',
  },

  sparkles: {
    count: 3000,
    size: 0.06,
    sizeRange: [0.03, 0.1],
    color: ['#6600ff', '#ff00ff', '#00ffff'],
    colorMode: 'random',
    lifetime: 2,
    lifetimeRange: [1, 3],
    emissionShape: 'sphere',
    emissionRadius: 2,
    gravity: [0, -0.2, 0],
    turbulence: 1.0,
    blending: 'additive',
  },

  dust: {
    count: 8000,
    size: 0.02,
    sizeRange: [0.01, 0.03],
    color: '#888888',
    lifetime: 10,
    lifetimeRange: [8, 12],
    emissionShape: 'box',
    emissionSize: [10, 5, 10],
    gravity: [0, 0.05, 0],
    wind: [0.1, 0, 0.05],
    turbulence: 0.5,
    blending: 'normal',
  },

  confetti: {
    count: 5000,
    size: 0.1,
    sizeRange: [0.08, 0.15],
    color: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
    colorMode: 'random',
    lifetime: 5,
    lifetimeRange: [4, 6],
    emissionShape: 'point',
    gravity: [0, -2, 0],
    turbulence: 0.5,
    blending: 'normal',
  },

  magic: {
    count: 4000,
    size: 0.08,
    sizeRange: [0.05, 0.12],
    color: ['#8844ff', '#ff44aa', '#44ffff'],
    colorMode: 'gradient',
    lifetime: 3,
    lifetimeRange: [2, 4],
    emissionShape: 'ring',
    emissionRadius: 1,
    gravity: [0, 0.5, 0],
    turbulence: 1.2,
    blending: 'additive',
  },

  energy: {
    count: 6000,
    size: 0.05,
    sizeRange: [0.03, 0.08],
    color: ['#00ffff', '#0088ff', '#ffffff'],
    colorMode: 'gradient',
    lifetime: 1.5,
    lifetimeRange: [1, 2],
    emissionShape: 'sphere',
    emissionRadius: 0.5,
    gravity: [0, 0, 0],
    turbulence: 2.0,
    blending: 'additive',
  },
}

export function createParticleSystem(
  preset: keyof typeof ParticlePresets,
  overrides?: Partial<ParticleConfig>,
): ParticleSystem {
  const config = {
    ...ParticlePresets[preset],
    ...overrides,
  }
  return new ParticleSystem(config)
}

export default ParticleSystem
