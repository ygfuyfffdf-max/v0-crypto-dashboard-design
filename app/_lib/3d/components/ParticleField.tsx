'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💫 PARTICLE FIELD - Campo de Partículas Reactivo para React Three Fiber
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useFrame, useThree } from '@react-three/fiber'
import { useCallback, useMemo, useRef } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface ParticleFieldProps {
  count?: number
  size?: number
  color?: string | string[]
  spread?: number
  speed?: number
  mouseInfluence?: number
  depth?: number
  opacity?: number
  shape?: 'sphere' | 'cube' | 'cylinder' | 'plane'
  animated?: boolean
  interactive?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 SHADERS
// ═══════════════════════════════════════════════════════════════════════════════

const particleFieldVertexShader = /* glsl */ `
  attribute float aScale;
  attribute vec3 aVelocity;
  attribute vec3 aColor;

  uniform float uTime;
  uniform float uSpeed;
  uniform vec3 uMouse;
  uniform float uMouseInfluence;
  uniform float uPointSize;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vColor = aColor;

    vec3 pos = position;

    // Animated movement
    pos += aVelocity * sin(uTime * uSpeed + position.x * 0.1) * 0.5;

    // Mouse influence
    if(uMouseInfluence > 0.0) {
      vec3 toMouse = uMouse - pos;
      float dist = length(toMouse);
      float influence = 1.0 - smoothstep(0.0, 3.0, dist);
      pos += normalize(toMouse) * influence * uMouseInfluence * 0.5;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Fade based on depth
    float depth = -mvPosition.z;
    vAlpha = smoothstep(50.0, 5.0, depth);

    // Size attenuation
    gl_PointSize = uPointSize * aScale * (300.0 / depth);
    gl_PointSize = clamp(gl_PointSize, 1.0, 50.0);

    gl_Position = projectionMatrix * mvPosition;
  }
`

const particleFieldFragmentShader = /* glsl */ `
  uniform float uTime;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Circular particle
    float dist = length(gl_PointCoord - 0.5) * 2.0;
    float alpha = 1.0 - smoothstep(0.0, 1.0, dist);

    // Core glow
    float core = 1.0 - smoothstep(0.0, 0.3, dist);
    vec3 color = vColor + vec3(1.0) * core * 0.3;

    // Twinkle effect
    float twinkle = sin(uTime * 3.0 + vColor.r * 10.0) * 0.2 + 0.8;

    alpha *= vAlpha * twinkle;

    if(alpha < 0.01) discard;

    gl_FragColor = vec4(color, alpha);
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// 💫 PARTICLE FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ParticleField({
  count = 5000,
  size = 0.1,
  color = ['#00ffff', '#8844ff', '#ff4488'],
  spread = 10,
  speed = 1,
  mouseInfluence = 0.5,
  depth = 20,
  opacity = 1,
  shape = 'sphere',
  animated = true,
  interactive = true,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const mouse = useRef(new THREE.Vector3())
  const { pointer, viewport, camera } = useThree()

  // Generate particle data
  const { positions, velocities, scales, colors } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const scales = new Float32Array(count)
    const colors = new Float32Array(count * 3)

    const colorArray = Array.isArray(color) ? color : [color]
    const threeColors = colorArray.map((c) => new THREE.Color(c))

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Position based on shape
      switch (shape) {
        case 'sphere': {
          const phi = Math.acos(2 * Math.random() - 1)
          const theta = Math.random() * Math.PI * 2
          const r = spread * Math.cbrt(Math.random())
          positions[i3] = r * Math.sin(phi) * Math.cos(theta)
          positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
          positions[i3 + 2] = r * Math.cos(phi) - depth / 2
          break
        }
        case 'cube': {
          positions[i3] = (Math.random() - 0.5) * spread * 2
          positions[i3 + 1] = (Math.random() - 0.5) * spread * 2
          positions[i3 + 2] = (Math.random() - 0.5) * depth - depth / 2
          break
        }
        case 'cylinder': {
          const angle = Math.random() * Math.PI * 2
          const r = spread * Math.sqrt(Math.random())
          positions[i3] = r * Math.cos(angle)
          positions[i3 + 1] = (Math.random() - 0.5) * depth
          positions[i3 + 2] = r * Math.sin(angle) - depth / 2
          break
        }
        case 'plane': {
          positions[i3] = (Math.random() - 0.5) * spread * 2
          positions[i3 + 1] = (Math.random() - 0.5) * spread * 2
          positions[i3 + 2] = (Math.random() - 0.5) * 2 - depth / 2
          break
        }
      }

      // Velocity
      velocities[i3] = (Math.random() - 0.5) * 0.5
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.5
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.5

      // Scale
      scales[i] = 0.5 + Math.random() * 1.5

      // Color
      const colorIndex = Math.floor(Math.random() * threeColors.length)
      const c = threeColors[colorIndex] ?? threeColors[0]
      if (c) {
        colors[i3] = c.r
        colors[i3 + 1] = c.g
        colors[i3 + 2] = c.b
      }
    }

    return { positions, velocities, scales, colors }
  }, [count, spread, depth, shape, color])

  // Uniforms
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSpeed: { value: speed },
      uMouse: { value: mouse.current },
      uMouseInfluence: { value: interactive ? mouseInfluence : 0 },
      uPointSize: { value: size * 100 },
    }),
    [speed, mouseInfluence, size, interactive],
  )

  // Update mouse position
  const updateMouse = useCallback(() => {
    if (!interactive) return

    // Project mouse to 3D space
    const x = (pointer.x * viewport.width) / 2
    const y = (pointer.y * viewport.height) / 2
    const z = 0

    mouse.current.set(x, y, z)
    uniforms.uMouse.value = mouse.current
  }, [pointer, viewport, interactive, uniforms])

  // Animation loop
  useFrame((state) => {
    if (!animated && !interactive) return

    if (animated) {
      uniforms.uTime.value = state.clock.elapsedTime
    }

    if (interactive) {
      updateMouse()
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aVelocity" args={[velocities, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aColor" args={[colors, 3]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={particleFieldVertexShader}
        fragmentShader={particleFieldFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

export const ParticleFieldPresets = {
  starfield: {
    count: 3000,
    size: 0.08,
    color: ['#ffffff', '#aaccff', '#ffddaa'],
    spread: 30,
    speed: 0.3,
    mouseInfluence: 0.2,
    depth: 50,
    shape: 'sphere' as const,
  },
  aurora: {
    count: 8000,
    size: 0.05,
    color: ['#00ffaa', '#00aaff', '#aa00ff'],
    spread: 15,
    speed: 0.5,
    mouseInfluence: 0.8,
    depth: 10,
    shape: 'plane' as const,
  },
  cosmic: {
    count: 5000,
    size: 0.1,
    color: ['#8844ff', '#ff4488', '#44ffff'],
    spread: 20,
    speed: 0.8,
    mouseInfluence: 1.0,
    depth: 30,
    shape: 'sphere' as const,
  },
  matrix: {
    count: 6000,
    size: 0.04,
    color: ['#00ff00', '#00aa00', '#004400'],
    spread: 20,
    speed: 2,
    mouseInfluence: 0.3,
    depth: 40,
    shape: 'cylinder' as const,
  },
  minimal: {
    count: 1000,
    size: 0.15,
    color: ['#ffffff'],
    spread: 10,
    speed: 0.2,
    mouseInfluence: 0.5,
    depth: 20,
    shape: 'cube' as const,
  },
}

export default ParticleField
