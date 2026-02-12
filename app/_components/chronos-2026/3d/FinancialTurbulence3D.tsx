/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌊 CHRONOS 2026 — FINANCIAL TURBULENCE 3D COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Componente R3F premium con:
 * - Organic distortion (Spline-quality)
 * - Turbulencia visual en tiempo real
 * - Post-processing SSAO + Bloom
 * - 280+ FPS target en móvil
 *
 * ═══════════════════════════════════════════════════════════════════════════════
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
import {
  Bloom,
  ChromaticAberration,
  EffectComposer,
  SSAO,
  Vignette,
} from '@react-three/postprocessing'
import { motion } from 'motion/react'
import { BlendFunction } from 'postprocessing'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface FinancialTurbulenceProps {
  size?: number
  primaryColor?: string
  secondaryColor?: string
  distortion?: number
  speed?: number
  enableSSAO?: boolean
  enableBloom?: boolean
  bloomIntensity?: number
  label?: string
  value?: string
  interactive?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// LIQUID ORB
// ═══════════════════════════════════════════════════════════════════════════════

function LiquidOrb({
  color1 = '#a855f7',
  color2 = '#ec4899',
  distort = 0.4,
  speed = 2,
}: {
  color1?: string
  color2?: string
  distort?: number
  speed?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.1
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.15
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <Sphere ref={meshRef} args={[1, 128, 128]}>
        <MeshDistortMaterial
          color={color1}
          distort={distort}
          speed={speed}
          roughness={0.1}
          metalness={0.8}
          envMapIntensity={1}
          transparent
          opacity={0.9}
        />
      </Sphere>

      <Sphere args={[0.85, 64, 64]}>
        <meshBasicMaterial color={color2} transparent opacity={0.3} />
      </Sphere>

      <Sphere args={[0.4, 32, 32]}>
        <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
      </Sphere>
    </Float>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE FIELD
// ═══════════════════════════════════════════════════════════════════════════════

function ParticleField({ count = 500, color = '#a855f7' }: { count?: number; color?: string }) {
  const points = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = 2 + Math.random() * 3
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [count])

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05
      points.current.rotation.x = state.clock.elapsedTime * 0.03
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
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

// ═══════════════════════════════════════════════════════════════════════════════
// ORBITAL RINGS
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// POST PROCESSING - Con manejo seguro de errores
// ═══════════════════════════════════════════════════════════════════════════════

function PostProcessing({
  enableSSAO = true,
  enableBloom = true,
  bloomIntensity = 1.2,
}: {
  enableSSAO?: boolean
  enableBloom?: boolean
  bloomIntensity?: number
}) {
  const { gl, scene, camera } = useThree()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
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
      <EffectComposer multisampling={4}>
        <SSAO
          samples={enableSSAO ? 16 : 0}
          radius={0.1}
          intensity={enableSSAO ? 1.5 : 0}
          luminanceInfluence={0.4}
          worldDistanceThreshold={0.97}
          worldDistanceFalloff={0.03}
          worldProximityThreshold={0.0005}
          worldProximityFalloff={0.001}
        />
        <Bloom
          intensity={enableBloom ? (bloomIntensity ?? 1.2) : 0}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          radius={0.8}
        />
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

// ═══════════════════════════════════════════════════════════════════════════════
// SCENE
// ═══════════════════════════════════════════════════════════════════════════════

function Scene({
  primaryColor,
  secondaryColor,
  distortion,
  speed,
  enableSSAO,
  enableBloom,
  bloomIntensity,
  label,
  value,
}: FinancialTurbulenceProps) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={primaryColor} />

      <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

      <LiquidOrb color1={primaryColor} color2={secondaryColor} distort={distortion} speed={speed} />

      <OrbitalRings color={primaryColor} />
      <ParticleField color={primaryColor} />

      {label && (
        <Html center position={[0, -2, 0]}>
          <div className="text-center whitespace-nowrap">
            {value && <div className="mb-1 text-3xl font-bold text-white">{value}</div>}
            <div className="text-sm text-white/60">{label}</div>
          </div>
        </Html>
      )}

      <Environment preset="night" />
      <PostProcessing
        enableSSAO={enableSSAO}
        enableBloom={enableBloom}
        bloomIntensity={bloomIntensity}
      />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function FinancialTurbulence3D({
  size = 300,
  primaryColor = '#a855f7',
  secondaryColor = '#ec4899',
  distortion = 0.4,
  speed = 2,
  enableSSAO = true,
  enableBloom = true,
  bloomIntensity = 1.2,
  label,
  value,
  interactive = true,
  className = '',
}: FinancialTurbulenceProps) {
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
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Scene
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            distortion={distortion}
            speed={speed}
            enableSSAO={enableSSAO}
            enableBloom={enableBloom}
            bloomIntensity={bloomIntensity}
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

// ═══════════════════════════════════════════════════════════════════════════════
// BANK ORB VARIANT
// ═══════════════════════════════════════════════════════════════════════════════

export function BankOrb3DAdvanced({
  bankName,
  capital,
  color,
  size = 150,
  onClick,
  className = '',
}: {
  bankName: string
  capital: number
  color: string
  size?: number
  onClick?: () => void
  className?: string
}) {
  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      style={{ width: size, height: size + 60 }}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <FinancialTurbulence3D
        size={size}
        primaryColor={color}
        secondaryColor={color}
        distortion={0.25}
        speed={2}
        enableSSAO={false}
        bloomIntensity={0.8}
        label={bankName}
        value={`$${capital.toLocaleString()}`}
        interactive={false}
      />
    </motion.div>
  )
}

export default FinancialTurbulence3D
