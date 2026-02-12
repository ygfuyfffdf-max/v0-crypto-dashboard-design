/**
 * 🌌 QUANTUM ORB 3D 2026 - ORB HOLOGRÁFICO PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════
 * Orb 3D con shaders avanzados usando React Three Fiber
 * - Efectos de plasma líquido
 * - Partículas orbitales
 * - Respuesta a interacción del mouse
 * - Post-processing cinematográfico
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import {
  Environment,
  Float,
  Html,
  MeshDistortMaterial,
  OrbitControls,
  Sphere,
  Stars,
} from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import { motion } from 'motion/react'
import { BlendFunction } from 'postprocessing'
import React, { Suspense, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface QuantumOrbProps {
  color?: string
  secondaryColor?: string
  size?: number
  distort?: number
  speed?: number
  className?: string
  label?: string
  value?: string
  showParticles?: boolean
  interactive?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// ORB MESH COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function OrbMesh({
  color = '#a855f7',
  secondaryColor = '#ec4899',
  distort = 0.4,
  speed = 2,
}: {
  color?: string
  secondaryColor?: string
  distort?: number
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const { mouse } = useThree()

  useFrame((state) => {
    if (meshRef.current) {
      // Rotación suave
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15

      // Respuesta al mouse
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        mouse.x * 0.3,
        0.05,
      )
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        mouse.y * 0.3,
        0.05,
      )
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 128, 128]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={distort}
          speed={speed}
          roughness={0.1}
          metalness={0.8}
          envMapIntensity={1}
          transparent
          opacity={0.9}
        />
      </Sphere>

      {/* Inner glow sphere */}
      <Sphere args={[0.85, 64, 64]}>
        <meshBasicMaterial color={secondaryColor} transparent opacity={0.3} />
      </Sphere>

      {/* Core glow */}
      <Sphere args={[0.4, 32, 32]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </Sphere>
    </Float>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

function ParticleField({ count = 500, color = '#a855f7' }: { count?: number; color?: string }) {
  const points = useRef<THREE.Points>(null)

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const scales = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2 + Math.random() * 3

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)

      scales[i] = Math.random()
    }

    return { positions, scales }
  }, [count])

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05
      points.current.rotation.x = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3] as const}
          count={particles.positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ORBITAL RINGS
// ═══════════════════════════════════════════════════════════════════════════

function OrbitalRings({ color = '#a855f7' }: { color?: string }) {
  const ring1 = useRef<THREE.Mesh>(null)
  const ring2 = useRef<THREE.Mesh>(null)
  const ring3 = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ring1.current) ring1.current.rotation.z = t * 0.3
    if (ring2.current) ring2.current.rotation.x = t * 0.2
    if (ring3.current) ring3.current.rotation.y = t * 0.25
  })

  return (
    <group>
      <mesh ref={ring1} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.5, 0.01, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      <mesh ref={ring2} rotation={[Math.PI / 3, Math.PI / 4, 0]}>
        <torusGeometry args={[1.7, 0.008, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <mesh ref={ring3} rotation={[Math.PI / 4, Math.PI / 6, Math.PI / 5]}>
        <torusGeometry args={[1.9, 0.006, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.15} />
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// POST PROCESSING - Con manejo seguro de errores
// ═══════════════════════════════════════════════════════════════════════════

function PostProcessing() {
  const { gl, scene, camera } = useThree()
  const [isReady, setIsReady] = useState(false)

  React.useEffect(() => {
    // Esperar a que el renderer esté completamente inicializado
    const checkReady = () => {
      if (gl && scene && camera && gl.getContext()) {
        setIsReady(true)
      }
    }
    const timer = setTimeout(checkReady, 100)
    return () => clearTimeout(timer)
  }, [gl, scene, camera])

  // No renderizar si el contexto Three.js no está listo
  if (!isReady || !gl || !scene || !camera) return null

  try {
    return (
      <EffectComposer>
        <Bloom intensity={1.5} luminanceThreshold={0.2} luminanceSmoothing={0.9} radius={0.8} />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={new THREE.Vector2(0.001, 0.001)}
        />
        <Vignette offset={0.3} darkness={0.5} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    )
  } catch {
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SCENE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function Scene({
  color,
  secondaryColor,
  distort,
  speed,
  showParticles,
  label,
  value,
}: QuantumOrbProps) {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={color} />

      {/* Stars background */}
      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

      {/* Main orb */}
      <OrbMesh color={color} secondaryColor={secondaryColor} distort={distort} speed={speed} />

      {/* Orbital rings */}
      <OrbitalRings color={color} />

      {/* Particles */}
      {showParticles && <ParticleField color={color} />}

      {/* HTML label */}
      {label && (
        <Html center position={[0, -2, 0]}>
          <div className="text-center whitespace-nowrap">
            {value && <div className="mb-1 text-3xl font-bold text-white">{value}</div>}
            <div className="text-sm text-white/60">{label}</div>
          </div>
        </Html>
      )}

      {/* Environment */}
      <Environment preset="night" />

      {/* Post processing */}
      <PostProcessing />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function QuantumOrb3D({
  color = '#a855f7',
  secondaryColor = '#ec4899',
  size = 300,
  distort = 0.4,
  speed = 2,
  className = '',
  label,
  value,
  showParticles = false, // DESHABILITADO - Evitar errores de shader
  interactive = true,
}: QuantumOrbProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
    >
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <Scene
            color={color}
            secondaryColor={secondaryColor}
            distort={distort}
            speed={speed}
            showParticles={showParticles}
            label={label}
            value={value}
          />
        </Suspense>

        {interactive && (
          <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
        )}
      </Canvas>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MINI ORB (versión más ligera para múltiples instancias)
// ═══════════════════════════════════════════════════════════════════════════

export function MiniOrb3D({
  color = '#a855f7',
  size = 80,
  className = '',
}: {
  color?: string
  size?: number
  className?: string
}) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} />

        <Float speed={3} rotationIntensity={1} floatIntensity={0.5}>
          <Sphere args={[1, 32, 32]}>
            <MeshDistortMaterial
              color={color}
              distort={0.3}
              speed={3}
              roughness={0.2}
              metalness={0.7}
            />
          </Sphere>
        </Float>

        <EffectComposer>
          <Bloom intensity={0.8} luminanceThreshold={0.3} radius={0.6} />
        </EffectComposer>
      </Canvas>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// BANK ORB (orb para representar bancos)
// ═══════════════════════════════════════════════════════════════════════════

export interface BankOrbProps {
  bankName: string
  capital: number
  color: string
  size?: number
  onClick?: () => void
  className?: string
}

export function BankOrb3D({
  bankName,
  capital,
  color,
  size = 150,
  onClick,
  className = '',
}: BankOrbProps) {
  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      style={{ width: size, height: size + 60 }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} color={color} />

        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
          <Sphere args={[1, 64, 64]}>
            <MeshDistortMaterial
              color={color}
              distort={0.25}
              speed={2}
              roughness={0.15}
              metalness={0.85}
            />
          </Sphere>
          <Sphere args={[0.8, 32, 32]}>
            <meshBasicMaterial color={color} transparent opacity={0.2} />
          </Sphere>
        </Float>

        <EffectComposer>
          <Bloom intensity={1} luminanceThreshold={0.2} radius={0.7} />
        </EffectComposer>
      </Canvas>

      {/* Labels */}
      <div className="absolute right-0 bottom-0 left-0 text-center">
        <div className="text-lg font-bold text-white">${capital.toLocaleString()}</div>
        <div className="text-xs text-white/60">{bankName}</div>
      </div>
    </motion.div>
  )
}
