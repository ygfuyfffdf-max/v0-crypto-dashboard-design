/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — R3F HOOKS & UTILS HYPER-AVANZADOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hooks y utilidades para React Three Fiber:
 * - useQuantumParticles: Sistema de partículas GPU
 * - useFluidSimulation: Simulación Navier-Stokes
 * - useMagneticCursor: Cursor magnético avanzado
 * - useParallaxScroll: Parallax con física
 * - useSpring3D: Springs para 3D
 *
 * @version HYPER-INFINITY 2026.1
 */

'use client'

import { useRef, useEffect, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ParticleConfig {
  count: number
  size: number
  speed: number
  spread: number
  color: string | string[]
  opacity: number
  turbulence: number
  attractors?: Attractor[]
  bounds?: THREE.Vector3
  lifespan?: number
}

export interface Attractor {
  position: THREE.Vector3
  strength: number
  radius: number
}

export interface FluidConfig {
  resolution: number
  viscosity: number
  diffusion: number
  dissipation: number
  vorticityStrength: number
}

export interface MagneticConfig {
  strength: number
  radius: number
  smoothing: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚛️ useQuantumParticles — Sistema de Partículas GPU-Accelerated
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useQuantumParticles(config: ParticleConfig) {
  const {
    count = 10000,
    size = 2,
    speed = 1,
    spread = 10,
    color = '#8B00FF',
    opacity = 0.8,
    turbulence = 0.5,
    attractors = [],
    bounds = new THREE.Vector3(20, 20, 20),
    lifespan = 5,
  } = config

  const particlesRef = useRef<THREE.Points>(null)
  const velocitiesRef = useRef<Float32Array | null>(null)
  const lifesRef = useRef<Float32Array | null>(null)
  const initialPositionsRef = useRef<Float32Array | null>(null)

  // Inicializar partículas
  const { positions, colors, velocities, lifes, initialPositions, geometry, material } =
    useMemo(() => {
      const pos = new Float32Array(count * 3)
      const cols = new Float32Array(count * 4)
      const vels = new Float32Array(count * 3)
      const lfs = new Float32Array(count)
      const initPos = new Float32Array(count * 3)

      // Parsear colores
      const colorArray = Array.isArray(color) ? color : [color]
      const threeColors = colorArray.map((c) => new THREE.Color(c))

      for (let i = 0; i < count; i++) {
        const i3 = i * 3
        const i4 = i * 4

        // Posición inicial aleatoria
        pos[i3] = (Math.random() - 0.5) * spread
        pos[i3 + 1] = (Math.random() - 0.5) * spread
        pos[i3 + 2] = (Math.random() - 0.5) * spread

        // Guardar posición inicial
        initPos[i3] = pos[i3]!
        initPos[i3 + 1] = pos[i3 + 1]!
        initPos[i3 + 2] = pos[i3 + 2]!

        // Velocidad inicial
        vels[i3] = (Math.random() - 0.5) * speed
        vels[i3 + 1] = (Math.random() - 0.5) * speed
        vels[i3 + 2] = (Math.random() - 0.5) * speed

        // Color aleatorio del array
        const c = threeColors[Math.floor(Math.random() * threeColors.length)]!
        cols[i4] = c.r
        cols[i4 + 1] = c.g
        cols[i4 + 2] = c.b
        cols[i4 + 3] = opacity

        // Vida aleatoria
        lfs[i] = Math.random() * lifespan
      }

      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      geo.setAttribute('color', new THREE.BufferAttribute(cols, 4))

      const mat = new THREE.PointsMaterial({
        size,
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      })

      return {
        positions: pos,
        colors: cols,
        velocities: vels,
        lifes: lfs,
        initialPositions: initPos,
        geometry: geo,
        material: mat,
      }
    }, [count, size, spread, color, opacity, lifespan, speed])

  // Guardar refs
  useEffect(() => {
    velocitiesRef.current = velocities
    lifesRef.current = lifes
    initialPositionsRef.current = initialPositions
  }, [velocities, lifes, initialPositions])

  // Simplex noise 3D
  const noise3D = useCallback((x: number, y: number, z: number, time: number) => {
    // Simplified noise
    return (
      Math.sin(x * 0.5 + time) * 0.5 +
      Math.sin(y * 0.7 + time * 1.3) * 0.3 +
      Math.sin(z * 0.3 + time * 0.7) * 0.2
    )
  }, [])

  // Actualizar partículas cada frame
  useFrame((state, delta) => {
    if (!particlesRef.current || !velocitiesRef.current || !lifesRef.current) return

    const positionAttribute = particlesRef.current.geometry.getAttribute(
      'position',
    ) as THREE.BufferAttribute
    const colorAttribute = particlesRef.current.geometry.getAttribute(
      'color',
    ) as THREE.BufferAttribute
    const positions = positionAttribute.array as Float32Array
    const colors = colorAttribute.array as Float32Array
    const vels = velocitiesRef.current
    const lfs = lifesRef.current
    const initPos = initialPositionsRef.current!
    const time = state.clock.elapsedTime

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const i4 = i * 4

      // Actualizar vida
      lfs[i]! -= delta

      // Respawn si murió
      if (lfs[i]! <= 0) {
        positions[i3] = initPos[i3]!
        positions[i3 + 1] = initPos[i3 + 1]!
        positions[i3 + 2] = initPos[i3 + 2]!
        vels[i3] = (Math.random() - 0.5) * speed
        vels[i3 + 1] = (Math.random() - 0.5) * speed
        vels[i3 + 2] = (Math.random() - 0.5) * speed
        lfs[i] = lifespan
        colors[i4 + 3] = opacity
        continue
      }

      // Turbulencia (curl noise simplificado)
      const turb = turbulence * delta
      const nx = noise3D(
        positions[i3]! * 0.1,
        positions[i3 + 1]! * 0.1,
        positions[i3 + 2]! * 0.1,
        time,
      )
      const ny = noise3D(
        positions[i3]! * 0.1 + 100,
        positions[i3 + 1]! * 0.1,
        positions[i3 + 2]! * 0.1,
        time,
      )
      const nz = noise3D(
        positions[i3]! * 0.1,
        positions[i3 + 1]! * 0.1 + 100,
        positions[i3 + 2]! * 0.1,
        time,
      )

      vels[i3]! += nx * turb
      vels[i3 + 1]! += ny * turb
      vels[i3 + 2]! += nz * turb

      // Fuerzas de atractores
      for (const attractor of attractors) {
        const dx = attractor.position.x - positions[i3]!
        const dy = attractor.position.y - positions[i3 + 1]!
        const dz = attractor.position.z - positions[i3 + 2]!
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (dist < attractor.radius && dist > 0.01) {
          const force = (attractor.strength / (dist * dist + 0.1)) * delta
          vels[i3]! += (dx / dist) * force
          vels[i3 + 1]! += (dy / dist) * force
          vels[i3 + 2]! += (dz / dist) * force
        }
      }

      // Damping
      vels[i3]! *= 0.99
      vels[i3 + 1]! *= 0.99
      vels[i3 + 2]! *= 0.99

      // Integración
      positions[i3]! += vels[i3]! * delta * 60
      positions[i3 + 1]! += vels[i3 + 1]! * delta * 60
      positions[i3 + 2]! += vels[i3 + 2]! * delta * 60

      // Bounds checking
      if (Math.abs(positions[i3]!) > bounds.x) {
        positions[i3] = Math.sign(positions[i3]!) * bounds.x
        vels[i3]! *= -0.5
      }
      if (Math.abs(positions[i3 + 1]!) > bounds.y) {
        positions[i3 + 1] = Math.sign(positions[i3 + 1]!) * bounds.y
        vels[i3 + 1]! *= -0.5
      }
      if (Math.abs(positions[i3 + 2]!) > bounds.z) {
        positions[i3 + 2] = Math.sign(positions[i3 + 2]!) * bounds.z
        vels[i3 + 2]! *= -0.5
      }

      // Fade out basado en vida
      const lifeRatio = lfs[i]! / lifespan
      colors[i4 + 3] = opacity * lifeRatio
    }

    positionAttribute.needsUpdate = true
    colorAttribute.needsUpdate = true
  })

  return {
    ref: particlesRef,
    geometry,
    material,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 useFluidSimulation — Simulación 2D Navier-Stokes (simplificada)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useFluidSimulation(
  config: FluidConfig = {
    resolution: 128,
    viscosity: 0.5,
    diffusion: 0.1,
    dissipation: 0.98,
    vorticityStrength: 0.5,
  },
) {
  const { resolution, viscosity, diffusion, dissipation, vorticityStrength } = config

  // Estado del fluido
  const velocityXRef = useRef<Float32Array>(new Float32Array(resolution * resolution))
  const velocityYRef = useRef<Float32Array>(new Float32Array(resolution * resolution))
  const densityRef = useRef<Float32Array>(new Float32Array(resolution * resolution))
  const pressureRef = useRef<Float32Array>(new Float32Array(resolution * resolution))
  const divergenceRef = useRef<Float32Array>(new Float32Array(resolution * resolution))

  // Textura de salida
  const outputTexture = useMemo(() => {
    const data = new Uint8Array(resolution * resolution * 4)
    const texture = new THREE.DataTexture(data, resolution, resolution, THREE.RGBAFormat)
    texture.needsUpdate = true
    return texture
  }, [resolution])

  // Añadir impulso
  const addImpulse = useCallback(
    (x: number, y: number, vx: number, vy: number, density: number) => {
      const gridX = Math.floor((x + 0.5) * resolution)
      const gridY = Math.floor((y + 0.5) * resolution)
      const radius = 5

      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const gx = gridX + dx
          const gy = gridY + dy
          if (gx >= 0 && gx < resolution && gy >= 0 && gy < resolution) {
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist <= radius) {
              const factor = 1 - dist / radius
              const idx = gy * resolution + gx
              velocityXRef.current[idx]! += vx * factor
              velocityYRef.current[idx]! += vy * factor
              densityRef.current[idx]! += density * factor
            }
          }
        }
      }
    },
    [resolution],
  )

  // Paso de simulación
  const step = useCallback(
    (deltaTime: number) => {
      const velX = velocityXRef.current
      const velY = velocityYRef.current
      const density = densityRef.current
      const pressure = pressureRef.current
      const div = divergenceRef.current
      const N = resolution

      // Helper para acceso seguro a array (non-null assertion con fallback)
      const safeGet = (arr: Float32Array, idx: number): number => arr[idx] ?? 0

      // Advección
      const advect = (field: Float32Array, vX: Float32Array, vY: Float32Array) => {
        const newField = new Float32Array(N * N)
        for (let y = 1; y < N - 1; y++) {
          for (let x = 1; x < N - 1; x++) {
            const idx = y * N + x
            const px = x - safeGet(vX, idx) * deltaTime * N
            const py = y - safeGet(vY, idx) * deltaTime * N

            const x0 = Math.max(0, Math.min(N - 2, Math.floor(px)))
            const y0 = Math.max(0, Math.min(N - 2, Math.floor(py)))
            const x1 = x0 + 1
            const y1 = y0 + 1

            const fx = px - x0
            const fy = py - y0

            newField[idx] =
              (1 - fx) * (1 - fy) * safeGet(field, y0 * N + x0) +
              fx * (1 - fy) * safeGet(field, y0 * N + x1) +
              (1 - fx) * fy * safeGet(field, y1 * N + x0) +
              fx * fy * safeGet(field, y1 * N + x1)
          }
        }
        return newField
      }

      // Advectar velocidad y densidad
      const newVelX = advect(velX, velX, velY)
      const newVelY = advect(velY, velX, velY)
      const newDensity = advect(density, velX, velY)

      // Difusión
      const diffuse = (field: Float32Array, diff: number) => {
        const a = deltaTime * diff * N * N
        for (let k = 0; k < 4; k++) {
          for (let y = 1; y < N - 1; y++) {
            for (let x = 1; x < N - 1; x++) {
              const idx = y * N + x
              field[idx] =
                (safeGet(field, idx) +
                  a *
                    (safeGet(field, (y - 1) * N + x) +
                      safeGet(field, (y + 1) * N + x) +
                      safeGet(field, y * N + x - 1) +
                      safeGet(field, y * N + x + 1))) /
                (1 + 4 * a)
            }
          }
        }
      }

      // Aplicar difusión
      diffuse(newVelX, viscosity)
      diffuse(newVelY, viscosity)

      // Proyección (hacer divergence-free)
      // Calcular divergencia
      for (let y = 1; y < N - 1; y++) {
        for (let x = 1; x < N - 1; x++) {
          const idx = y * N + x
          div[idx] =
            (-0.5 *
              (safeGet(newVelX, y * N + x + 1) -
                safeGet(newVelX, y * N + x - 1) +
                safeGet(newVelY, (y + 1) * N + x) -
                safeGet(newVelY, (y - 1) * N + x))) /
            N
          pressure[idx] = 0
        }
      }

      // Resolver presión (Gauss-Seidel)
      for (let k = 0; k < 20; k++) {
        for (let y = 1; y < N - 1; y++) {
          for (let x = 1; x < N - 1; x++) {
            const idx = y * N + x
            pressure[idx] =
              (safeGet(div, idx) +
                safeGet(pressure, (y - 1) * N + x) +
                safeGet(pressure, (y + 1) * N + x) +
                safeGet(pressure, y * N + x - 1) +
                safeGet(pressure, y * N + x + 1)) /
              4
          }
        }
      }

      // Restar gradiente de presión
      for (let y = 1; y < N - 1; y++) {
        for (let x = 1; x < N - 1; x++) {
          const idx = y * N + x
          newVelX[idx] =
            safeGet(newVelX, idx) -
            0.5 * N * (safeGet(pressure, y * N + x + 1) - safeGet(pressure, y * N + x - 1))
          newVelY[idx] =
            safeGet(newVelY, idx) -
            0.5 * N * (safeGet(pressure, (y + 1) * N + x) - safeGet(pressure, (y - 1) * N + x))
        }
      }

      // Copiar resultados
      velocityXRef.current = newVelX
      velocityYRef.current = newVelY

      // Disipación
      for (let i = 0; i < N * N; i++) {
        newDensity[i] = safeGet(newDensity, i) * dissipation
        velocityXRef.current[i] = safeGet(velocityXRef.current, i) * dissipation
        velocityYRef.current[i] = safeGet(velocityYRef.current, i) * dissipation
      }
      densityRef.current = newDensity

      // Actualizar textura
      const data = outputTexture.image.data as unknown as Uint8Array
      for (let i = 0; i < N * N; i++) {
        const d = Math.min(255, Math.abs(safeGet(newDensity, i)) * 255)
        const vx = Math.min(255, (safeGet(velocityXRef.current, i) + 1) * 127)
        const vy = Math.min(255, (safeGet(velocityYRef.current, i) + 1) * 127)
        data[i * 4] = d // R - density
        data[i * 4 + 1] = vx // G - velocity X
        data[i * 4 + 2] = vy // B - velocity Y
        data[i * 4 + 3] = 255
      }
      outputTexture.needsUpdate = true
    },
    [resolution, viscosity, diffusion, dissipation, outputTexture],
  )

  return {
    texture: outputTexture,
    addImpulse,
    step,
    velocityX: velocityXRef,
    velocityY: velocityYRef,
    density: densityRef,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧲 useMagneticCursor — Cursor con efecto magnético
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useMagneticCursor(
  config: MagneticConfig = {
    strength: 0.3,
    radius: 100,
    smoothing: 0.15,
  },
) {
  const { strength, radius, smoothing } = config
  const targetRef = useRef({ x: 0, y: 0 })
  const currentRef = useRef({ x: 0, y: 0 })
  const elementRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!elementRef.current) return

      const rect = elementRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const distance = Math.sqrt(distX * distX + distY * distY)

      if (distance < radius) {
        const factor = (1 - distance / radius) * strength
        targetRef.current = {
          x: distX * factor,
          y: distY * factor,
        }
      } else {
        targetRef.current = { x: 0, y: 0 }
      }
    }

    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * smoothing
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * smoothing

      if (elementRef.current) {
        elementRef.current.style.transform = `translate(${currentRef.current.x}px, ${currentRef.current.y}px)`
      }

      requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    const animationFrame = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrame)
    }
  }, [strength, radius, smoothing])

  return elementRef
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📜 useParallaxScroll — Parallax con física
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useParallaxScroll(factor: number = 0.5, smoothing: number = 0.1) {
  const elementRef = useRef<HTMLElement | null>(null)
  const targetY = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      targetY.current = window.scrollY * factor
    }

    const animate = () => {
      currentY.current += (targetY.current - currentY.current) * smoothing

      if (elementRef.current) {
        elementRef.current.style.transform = `translateY(${-currentY.current}px)`
      }

      requestAnimationFrame(animate)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    const animationFrame = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(animationFrame)
    }
  }, [factor, smoothing])

  return elementRef
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔄 useSpring3D — Spring physics para Three.js
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useSpring3D(
  initialValue: THREE.Vector3,
  config: { stiffness?: number; damping?: number; mass?: number } = {},
) {
  const { stiffness = 300, damping = 25, mass = 1 } = config

  const current = useRef(initialValue.clone())
  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  const target = useRef(initialValue.clone())

  const setTarget = useCallback((newTarget: THREE.Vector3) => {
    target.current.copy(newTarget)
  }, [])

  useFrame((_, delta) => {
    // Spring physics (Hooke's law + damping)
    const displacement = new THREE.Vector3().subVectors(target.current, current.current)
    const springForce = displacement.multiplyScalar(stiffness)
    const dampingForce = velocity.current.clone().multiplyScalar(-damping)

    const acceleration = new THREE.Vector3()
      .addVectors(springForce, dampingForce)
      .divideScalar(mass)

    velocity.current.add(acceleration.multiplyScalar(delta))
    current.current.add(velocity.current.clone().multiplyScalar(delta))
  })

  return {
    value: current,
    velocity: velocity,
    setTarget,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 useGradientTexture — Textura de gradiente dinámica
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useGradientTexture(
  colors: string[],
  size: number = 512,
  direction: 'horizontal' | 'vertical' | 'radial' = 'horizontal',
) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    let gradient: CanvasGradient

    switch (direction) {
      case 'horizontal':
        gradient = ctx.createLinearGradient(0, 0, size, 0)
        break
      case 'vertical':
        gradient = ctx.createLinearGradient(0, 0, 0, size)
        break
      case 'radial':
        gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
        break
    }

    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color)
    })

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [colors, size, direction])

  return texture
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default {
  useQuantumParticles,
  useFluidSimulation,
  useMagneticCursor,
  useParallaxScroll,
  useSpring3D,
  useGradientTexture,
}
