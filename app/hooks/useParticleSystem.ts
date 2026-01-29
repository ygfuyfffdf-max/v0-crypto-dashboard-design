'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

export interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  acceleration: THREE.Vector3
  color: THREE.Color
  size: number
  life: number
  maxLife: number
  rotation: number
  rotationSpeed: number
}

export interface ParticleSystemOptions {
  maxParticles: number
  emissionRate: number
  lifetime: number
  startSize: number
  endSize: number
  startColor: THREE.Color
  endColor: THREE.Color
  velocity: THREE.Vector3
  velocityVariation: number
  gravity: THREE.Vector3
  useGPU?: boolean
}

export interface UseParticleSystemReturn {
  particles: Particle[]
  mesh: THREE.Points | null
  emit: (count: number) => void
  update: (deltaTime: number) => void
  clear: () => void
  setEmissionRate: (rate: number) => void
}

/**
 * Hook para sistema de partículas 3D avanzado
 * Soporta física, colores gradiente, y rendering eficiente
 */
export function useParticleSystem(options: ParticleSystemOptions): UseParticleSystemReturn {
  const [particles, setParticles] = useState<Particle[]>([])
  const [mesh, setMesh] = useState<THREE.Points | null>(null)

  const particlesRef = useRef<Particle[]>([])
  const emissionRateRef = useRef(options.emissionRate)
  const emissionAccumulator = useRef(0)

  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const materialRef = useRef<THREE.PointsMaterial | null>(null)

  // Crear partícula nueva
  const createParticle = useCallback((): Particle => {
    const variation = options.velocityVariation

    return {
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(
        options.velocity.x + (Math.random() - 0.5) * variation,
        options.velocity.y + (Math.random() - 0.5) * variation,
        options.velocity.z + (Math.random() - 0.5) * variation,
      ),
      acceleration: options.gravity.clone(),
      color: options.startColor.clone(),
      size: options.startSize,
      life: 0,
      maxLife: options.lifetime * (0.8 + Math.random() * 0.4),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
    }
  }, [options])

  // Emitir partículas
  const emit = useCallback(
    (count: number) => {
      const newParticles: Particle[] = []

      for (let i = 0; i < count; i++) {
        if (particlesRef.current.length < options.maxParticles) {
          newParticles.push(createParticle())
        }
      }

      particlesRef.current = [...particlesRef.current, ...newParticles]
      setParticles(particlesRef.current)
    },
    [options.maxParticles, createParticle],
  )

  // Actualizar partículas
  const update = useCallback(
    (deltaTime: number) => {
      // Emisión automática
      emissionAccumulator.current += deltaTime
      const emitCount = Math.floor(emissionAccumulator.current * emissionRateRef.current)

      if (emitCount > 0) {
        emit(emitCount)
        emissionAccumulator.current = 0
      }

      // Actualizar física de cada partícula
      particlesRef.current = particlesRef.current.filter((particle) => {
        particle.life += deltaTime

        // Remover partículas muertas
        if (particle.life > particle.maxLife) {
          return false
        }

        // Actualizar física
        particle.velocity.add(particle.acceleration.clone().multiplyScalar(deltaTime))
        particle.position.add(particle.velocity.clone().multiplyScalar(deltaTime))
        particle.rotation += particle.rotationSpeed * deltaTime

        // Interpolación de color y tamaño
        const t = particle.life / particle.maxLife
        particle.color.lerpColors(options.startColor, options.endColor, t)
        particle.size = options.startSize + (options.endSize - options.startSize) * t

        return true
      })

      setParticles([...particlesRef.current])

      // Actualizar geometría si existe
      if (geometryRef.current && particlesRef.current.length > 0) {
        const positions = new Float32Array(particlesRef.current.length * 3)
        const colors = new Float32Array(particlesRef.current.length * 3)
        const sizes = new Float32Array(particlesRef.current.length)

        particlesRef.current.forEach((particle, i) => {
          positions[i * 3] = particle.position.x
          positions[i * 3 + 1] = particle.position.y
          positions[i * 3 + 2] = particle.position.z

          colors[i * 3] = particle.color.r
          colors[i * 3 + 1] = particle.color.g
          colors[i * 3 + 2] = particle.color.b

          sizes[i] = particle.size
        })

        geometryRef.current.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        geometryRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3))
        geometryRef.current.setAttribute('size', new THREE.BufferAttribute(sizes, 1))

        const posAttr = geometryRef.current.attributes.position
        const colorAttr = geometryRef.current.attributes.color
        const sizeAttr = geometryRef.current.attributes.size

        if (posAttr) posAttr.needsUpdate = true
        if (colorAttr) colorAttr.needsUpdate = true
        if (sizeAttr) sizeAttr.needsUpdate = true
      }
    },
    [emit, options],
  )

  const clear = useCallback(() => {
    particlesRef.current = []
    setParticles([])
  }, [])

  const setEmissionRate = useCallback((rate: number) => {
    emissionRateRef.current = rate
  }, [])

  // Inicializar geometría y material
  useEffect(() => {
    const geometry = new THREE.BufferGeometry()
    const material = new THREE.PointsMaterial({
      size: options.startSize,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    })

    geometryRef.current = geometry
    materialRef.current = material

    const points = new THREE.Points(geometry, material)
    setMesh(points)

    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [options.startSize])

  return {
    particles,
    mesh,
    emit,
    update,
    clear,
    setEmissionRate,
  }
}
