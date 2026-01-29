// @ts-nocheck - TODO: Fix TypeScript strict mode issues
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🖱️ INTERACTIVE PARTICLES - Partículas Interactivas con Mouse/Touch
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import * as THREE from 'three'
import type { InteractiveParticleConfig } from '../types'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 INTERACTIVE PARTICLE SHADERS
// ═══════════════════════════════════════════════════════════════════════════════

const interactiveVertexShader = /* glsl */ `
  attribute vec3 velocity;
  attribute float life;
  attribute float maxLife;
  attribute vec3 particleColor;
  attribute float particleSize;

  uniform float uTime;
  uniform float uPointSize;
  uniform vec3 uMouse;
  uniform float uInteractionRadius;
  uniform float uInteractionStrength;
  uniform int uInteractionType; // 0=attract, 1=repel, 2=orbit, 3=follow

  varying float vLife;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vInteraction;

  void main() {
    vLife = life / maxLife;
    vColor = particleColor;

    vec3 pos = position;

    // Mouse interaction
    vec3 toMouse = uMouse - pos;
    float dist = length(toMouse);
    float influence = 1.0 - smoothstep(0.0, uInteractionRadius, dist);
    vInteraction = influence;

    if(influence > 0.0) {
      vec3 dir = normalize(toMouse);
      float strength = uInteractionStrength * influence;

      if(uInteractionType == 0) {
        // Attract
        pos += dir * strength * 0.1;
      } else if(uInteractionType == 1) {
        // Repel
        pos -= dir * strength * 0.1;
      } else if(uInteractionType == 2) {
        // Orbit
        vec3 tangent = normalize(cross(dir, vec3(0.0, 1.0, 0.0)));
        pos += tangent * strength * 0.1;
      } else if(uInteractionType == 3) {
        // Follow (lerp towards mouse)
        pos = mix(pos, uMouse, strength * 0.01);
      }
    }

    // Life-based fade
    float fadeIn = smoothstep(0.0, 0.1, vLife);
    float fadeOut = 1.0 - smoothstep(0.8, 1.0, vLife);
    vAlpha = fadeIn * fadeOut;

    // Interaction glow
    vAlpha += influence * 0.5;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Size with interaction boost
    float sizeBoost = 1.0 + influence * 0.5;
    float sizeAttenuation = 300.0 / -mvPosition.z;
    gl_PointSize = particleSize * uPointSize * sizeAttenuation * sizeBoost;

    gl_Position = projectionMatrix * mvPosition;
  }
`

const interactiveFragmentShader = /* glsl */ `
  uniform vec3 uGlowColor;
  uniform float uGlowIntensity;

  varying float vLife;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vInteraction;

  void main() {
    vec2 uv = gl_PointCoord;
    float dist = length(uv - 0.5) * 2.0;
    float alpha = 1.0 - smoothstep(0.0, 1.0, dist);

    // Base color
    vec3 color = vColor;

    // Interaction glow
    vec3 glowColor = mix(vColor, uGlowColor, vInteraction);
    color = mix(color, glowColor, vInteraction * uGlowIntensity);

    // Core glow
    float coreGlow = 1.0 - smoothstep(0.0, 0.3, dist);
    color += vec3(1.0) * coreGlow * 0.3 * (1.0 + vInteraction);

    alpha *= vAlpha;

    if(alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// 🖱️ INTERACTIVE PARTICLE SYSTEM CLASS
// ═══════════════════════════════════════════════════════════════════════════════

export class InteractiveParticles {
  private geometry: THREE.BufferGeometry
  private material: THREE.ShaderMaterial
  public mesh: THREE.Points

  private config: InteractiveParticleConfig
  private particleCount: number

  // Attribute arrays
  private positions: Float32Array
  private velocities: Float32Array
  private originalPositions: Float32Array
  private lives: Float32Array
  private maxLives: Float32Array
  private colors: Float32Array
  private sizes: Float32Array

  // Mouse tracking
  private mouse: THREE.Vector3 = new THREE.Vector3(0, 0, 0)
  private raycaster: THREE.Raycaster = new THREE.Raycaster()
  private mouseNDC: THREE.Vector2 = new THREE.Vector2()

  // State
  private time = 0

  constructor(config: Partial<InteractiveParticleConfig> = {}) {
    this.config = {
      count: config.count ?? 5000,
      size: config.size ?? 0.1,
      sizeRange: config.sizeRange ?? [0.05, 0.15],
      color: config.color ?? '#00ffff',
      colorMode: config.colorMode ?? 'solid',
      opacity: config.opacity ?? 1,
      speed: config.speed ?? 0.5,
      lifetime: config.lifetime ?? 999,
      emissionRate: config.emissionRate ?? 0,
      emissionShape: config.emissionShape ?? 'sphere',
      emissionRadius: config.emissionRadius ?? 3,
      interactionRadius: config.interactionRadius ?? 2,
      interactionStrength: config.interactionStrength ?? 1,
      interactionType: config.interactionType ?? 'attract',
      mouseInfluence: config.mouseInfluence ?? true,
      touchInfluence: config.touchInfluence ?? true,
      blending: config.blending ?? 'additive',
    }

    this.particleCount = this.config.count

    // Initialize arrays
    this.positions = new Float32Array(this.particleCount * 3)
    this.velocities = new Float32Array(this.particleCount * 3)
    this.originalPositions = new Float32Array(this.particleCount * 3)
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
      vertexShader: interactiveVertexShader,
      fragmentShader: interactiveFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uPointSize: { value: this.config.size },
        uMouse: { value: this.mouse },
        uInteractionRadius: { value: this.config.interactionRadius },
        uInteractionStrength: { value: this.config.interactionStrength },
        uInteractionType: { value: this.getInteractionTypeValue() },
        uGlowColor: { value: new THREE.Color(0xffffff) },
        uGlowIntensity: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    // Create mesh
    this.mesh = new THREE.Points(this.geometry, this.material)

    // Initialize particles
    this.initializeParticles()
  }

  private getInteractionTypeValue(): number {
    switch (this.config.interactionType) {
      case 'attract':
        return 0
      case 'repel':
        return 1
      case 'orbit':
        return 2
      case 'follow':
        return 3
      default:
        return 0
    }
  }

  private initializeParticles(): void {
    const color = new THREE.Color(
      typeof this.config.color === 'string' ? this.config.color : '#00ffff',
    )

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3

      // Position in sphere
      const phi = Math.acos(2 * Math.random() - 1)
      const theta = Math.random() * Math.PI * 2
      const r = this.config.emissionRadius! * Math.cbrt(Math.random())

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      this.positions[i3] = x
      this.positions[i3 + 1] = y
      this.positions[i3 + 2] = z

      this.originalPositions[i3] = x
      this.originalPositions[i3 + 1] = y
      this.originalPositions[i3 + 2] = z

      // Velocity
      this.velocities[i3] = (Math.random() - 0.5) * 0.1
      this.velocities[i3 + 1] = (Math.random() - 0.5) * 0.1
      this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.1

      // Life
      this.lives[i] = this.config.lifetime!
      this.maxLives[i] = this.config.lifetime!

      // Color with variation
      const hsl = { h: 0, s: 0, l: 0 }
      color.getHSL(hsl)
      const variedColor = new THREE.Color().setHSL(
        hsl.h + (Math.random() - 0.5) * 0.1,
        hsl.s,
        hsl.l + (Math.random() - 0.5) * 0.2,
      )
      this.colors[i3] = variedColor.r
      this.colors[i3 + 1] = variedColor.g
      this.colors[i3 + 2] = variedColor.b

      // Size
      const [minSize, maxSize] = this.config.sizeRange!
      this.sizes[i] = minSize + Math.random() * (maxSize - minSize)
    }

    this.updateAttributes()
  }

  private updateAttributes(): void {
    ;(this.geometry.getAttribute('position') as THREE.BufferAttribute).needsUpdate = true
    ;(this.geometry.getAttribute('velocity') as THREE.BufferAttribute).needsUpdate = true
    ;(this.geometry.getAttribute('life') as THREE.BufferAttribute).needsUpdate = true
    ;(this.geometry.getAttribute('particleColor') as THREE.BufferAttribute).needsUpdate = true
    ;(this.geometry.getAttribute('particleSize') as THREE.BufferAttribute).needsUpdate = true
  }

  update(deltaTime: number): void {
    this.time += deltaTime
    if (this.material.uniforms?.uTime) {
      this.material.uniforms.uTime.value = this.time
    }

    // Subtle ambient motion
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3

      // Add slight drift
      this.positions[i3] +=
        Math.sin(this.time * 0.5 + i * 0.1) * 0.001 + this.velocities[i3] * deltaTime
      this.positions[i3 + 1] +=
        Math.cos(this.time * 0.3 + i * 0.2) * 0.001 + this.velocities[i3 + 1] * deltaTime
      this.positions[i3 + 2] +=
        Math.sin(this.time * 0.4 + i * 0.15) * 0.001 + this.velocities[i3 + 2] * deltaTime

      // Softly return to original position
      const returnStrength = 0.01
      this.positions[i3] += (this.originalPositions[i3] - this.positions[i3]) * returnStrength
      this.positions[i3 + 1] +=
        (this.originalPositions[i3 + 1] - this.positions[i3 + 1]) * returnStrength
      this.positions[i3 + 2] +=
        (this.originalPositions[i3 + 2] - this.positions[i3 + 2]) * returnStrength
    }

    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute
    posAttr.needsUpdate = true
  }

  updateMouse(camera: THREE.Camera, x: number, y: number): void {
    this.mouseNDC.set(x, y)
    this.raycaster.setFromCamera(this.mouseNDC, camera)

    // Project mouse to a plane at z=0
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0)
    const intersection = new THREE.Vector3()
    this.raycaster.ray.intersectPlane(plane, intersection)

    if (intersection) {
      this.mouse.copy(intersection)
      this.material.uniforms.uMouse.value = this.mouse
    }
  }

  setInteractionType(type: InteractiveParticleConfig['interactionType']): void {
    this.config.interactionType = type
    this.material.uniforms.uInteractionType.value = this.getInteractionTypeValue()
  }

  setInteractionStrength(strength: number): void {
    this.config.interactionStrength = strength
    this.material.uniforms.uInteractionStrength.value = strength
  }

  setInteractionRadius(radius: number): void {
    this.config.interactionRadius = radius
    this.material.uniforms.uInteractionRadius.value = radius
  }

  setColor(color: string): void {
    const c = new THREE.Color(color)
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3
      this.colors[i3] = c.r
      this.colors[i3 + 1] = c.g
      this.colors[i3 + 2] = c.b
    }
    ;(this.geometry.getAttribute('particleColor') as THREE.BufferAttribute).needsUpdate = true
  }

  setGlowColor(color: string): void {
    this.material.uniforms.uGlowColor.value = new THREE.Color(color)
  }

  dispose(): void {
    this.geometry.dispose()
    this.material.dispose()
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

export const InteractiveParticlePresets: Record<string, Partial<InteractiveParticleConfig>> = {
  magnetic: {
    count: 5000,
    size: 0.08,
    color: '#00ffff',
    emissionRadius: 4,
    interactionRadius: 3,
    interactionStrength: 2,
    interactionType: 'attract',
  },

  repulsive: {
    count: 5000,
    size: 0.08,
    color: '#ff4444',
    emissionRadius: 4,
    interactionRadius: 3,
    interactionStrength: 3,
    interactionType: 'repel',
  },

  swirl: {
    count: 8000,
    size: 0.06,
    color: '#8844ff',
    emissionRadius: 5,
    interactionRadius: 4,
    interactionStrength: 5,
    interactionType: 'orbit',
  },

  follower: {
    count: 3000,
    size: 0.1,
    color: '#44ff88',
    emissionRadius: 3,
    interactionRadius: 5,
    interactionStrength: 1,
    interactionType: 'follow',
  },
}

export function createInteractiveParticles(
  preset: keyof typeof InteractiveParticlePresets,
  overrides?: Partial<InteractiveParticleConfig>,
): InteractiveParticles {
  return new InteractiveParticles({
    ...InteractiveParticlePresets[preset],
    ...overrides,
  })
}

export default InteractiveParticles
