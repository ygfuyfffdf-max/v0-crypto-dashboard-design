/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🤖 CHRONOS 2026 — NEXBOT 3D AVATAR
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Avatar 3D del asistente IA NexBot con:
 * - Modelo 3D animado del robot character
 * - Estados visuales (idle, listening, thinking, responding, error)
 * - Reacción a audio (lip sync simulado)
 * - Animaciones procedurales (flotación, glow, partículas)
 * - Integración con Spline scene
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import {
  Environment,
  Float,
  Html,
  MeshDistortMaterial,
  Sparkles,
  useProgress,
} from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import Spline from '@splinetool/react-spline'
import type { Application as SplineApplication } from '@splinetool/runtime'
import { motion } from 'motion/react'
import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export type NexBotState = 'idle' | 'listening' | 'thinking' | 'responding' | 'success' | 'error'

export interface NexBot3DAvatarProps {
  state?: NexBotState
  audioLevel?: number
  size?: number
  onClick?: () => void
  showStatusIndicator?: boolean
  enableSpline?: boolean
  splineScene?: string
  className?: string
}

interface CoreOrbProps {
  state: NexBotState
  audioLevel: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE COLORS
// ═══════════════════════════════════════════════════════════════════════════════

const stateColors: Record<NexBotState, { primary: string; secondary: string; glow: string }> = {
  idle: { primary: '#8b5cf6', secondary: '#3b82f6', glow: '#8b5cf6' },
  listening: { primary: '#10b981', secondary: '#34d399', glow: '#10b981' },
  thinking: { primary: '#f59e0b', secondary: '#fbbf24', glow: '#f59e0b' },
  responding: { primary: '#ec4899', secondary: '#f472b6', glow: '#ec4899' },
  success: { primary: '#22c55e', secondary: '#4ade80', glow: '#22c55e' },
  error: { primary: '#ef4444', secondary: '#f87171', glow: '#ef4444' },
}

// ═══════════════════════════════════════════════════════════════════════════════
// CORE ORB (Energy Core)
// ═══════════════════════════════════════════════════════════════════════════════

function CoreOrb({ state, audioLevel }: CoreOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const colors = stateColors[state]

  const primaryColor = useMemo(() => new THREE.Color(colors.primary), [colors.primary])
  const secondaryColor = useMemo(() => new THREE.Color(colors.secondary), [colors.secondary])

  useFrame((frameState) => {
    if (meshRef.current) {
      const time = frameState.clock.elapsedTime

      // Base rotation
      meshRef.current.rotation.y = time * 0.5
      meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.1

      // Scale based on state and audio
      const baseScale = state === 'responding' ? 1.1 : 1
      const audioScale = 1 + audioLevel * 0.3
      const pulseScale = state === 'thinking' ? 1 + Math.sin(time * 4) * 0.1 : 1

      const finalScale = baseScale * audioScale * pulseScale
      meshRef.current.scale.setScalar(finalScale)
    }

    if (glowRef.current) {
      const time = frameState.clock.elapsedTime
      const glowPulse = 1 + Math.sin(time * 2) * 0.2 + audioLevel * 0.5
      glowRef.current.scale.setScalar(1.5 * glowPulse)
    }
  })

  return (
    <group>
      {/* Inner core */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[0.4, 4]} />
        <MeshDistortMaterial
          color={primaryColor}
          emissive={primaryColor}
          emissiveIntensity={0.8 + audioLevel * 0.5}
          metalness={0.8}
          roughness={0.2}
          distort={0.3 + audioLevel * 0.2}
          speed={state === 'thinking' ? 5 : 2}
        />
      </mesh>

      {/* Outer glow shell */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshBasicMaterial
          color={secondaryColor}
          transparent
          opacity={0.15 + audioLevel * 0.1}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Energy rings */}
      <EnergyRings state={state} audioLevel={audioLevel} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENERGY RINGS
// ═══════════════════════════════════════════════════════════════════════════════

function EnergyRings({ state, audioLevel }: { state: NexBotState; audioLevel: number }) {
  const ring1Ref = useRef<THREE.Mesh>(null)
  const ring2Ref = useRef<THREE.Mesh>(null)
  const ring3Ref = useRef<THREE.Mesh>(null)
  const colors = stateColors[state]

  useFrame((frameState) => {
    const time = frameState.clock.elapsedTime

    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = time * 0.8
      ring1Ref.current.rotation.z = time * 0.3
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y = time * 0.6
      ring2Ref.current.rotation.x = time * 0.2
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z = time * 0.5
      ring3Ref.current.rotation.y = time * 0.4
    }
  })

  const ringMaterial = useMemo(
    () => (
      <meshBasicMaterial
        color={colors.primary}
        transparent
        opacity={0.6 + audioLevel * 0.3}
        side={THREE.DoubleSide}
      />
    ),
    [colors.primary, audioLevel],
  )

  return (
    <group>
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.6, 0.02, 8, 64]} />
        {ringMaterial}
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[0.7, 0.015, 8, 64]} />
        {ringMaterial}
      </mesh>
      <mesh ref={ring3Ref}>
        <torusGeometry args={[0.8, 0.01, 8, 64]} />
        {ringMaterial}
      </mesh>
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEXBOT BODY
// ═══════════════════════════════════════════════════════════════════════════════

function NexBotBody({ state, audioLevel }: { state: NexBotState; audioLevel: number }) {
  const groupRef = useRef<THREE.Group>(null)
  const colors = stateColors[state]

  useFrame((frameState) => {
    if (groupRef.current) {
      const time = frameState.clock.elapsedTime
      // Gentle floating
      groupRef.current.position.y = Math.sin(time * 0.8) * 0.05
      // Subtle rotation
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {/* Main body */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Head sphere */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial
            color="#1a1a2e"
            metalness={0.9}
            roughness={0.1}
            envMapIntensity={1}
          />
        </mesh>

        {/* Face visor */}
        <mesh position={[0, 0.3, 0.2]}>
          <capsuleGeometry args={[0.15, 0.2, 8, 16]} />
          <meshStandardMaterial
            color={colors.primary}
            emissive={colors.primary}
            emissiveIntensity={0.5 + audioLevel * 0.5}
            transparent
            opacity={0.8}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>

        {/* Eye indicators */}
        <group position={[0, 0.35, 0.28]}>
          <mesh position={[-0.08, 0, 0]}>
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial color={colors.glow} />
          </mesh>
          <mesh position={[0.08, 0, 0]}>
            <circleGeometry args={[0.04, 16]} />
            <meshBasicMaterial color={colors.glow} />
          </mesh>
        </group>

        {/* Neck */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.15, 0.15, 16]} />
          <meshStandardMaterial color="#2a2a4e" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, -0.25, 0]}>
          <capsuleGeometry args={[0.25, 0.3, 8, 16]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Core energy orb */}
        <group position={[0, -0.15, 0.15]}>
          <CoreOrb state={state} audioLevel={audioLevel} />
        </group>

        {/* Shoulder pads */}
        <mesh position={[-0.35, -0.1, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#2a2a4e" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.35, -0.1, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#2a2a4e" metalness={0.8} roughness={0.2} />
        </mesh>
      </Float>

      {/* Particle effects */}
      <Sparkles count={50} scale={2} size={2} speed={0.5} opacity={0.5} color={colors.primary} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════

function StatusIndicator({ state }: { state: NexBotState }) {
  const colors = stateColors[state]
  const statusLabels: Record<NexBotState, string> = {
    idle: 'Listo',
    listening: 'Escuchando...',
    thinking: 'Analizando...',
    responding: 'Respondiendo',
    success: '¡Completado!',
    error: 'Error',
  }

  return (
    <Html position={[0, -1, 0]} center>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1 backdrop-blur-sm"
      >
        <motion.div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: colors.primary }}
          animate={{
            scale: state === 'listening' || state === 'thinking' ? [1, 1.5, 1] : 1,
            opacity: state === 'error' ? [1, 0.5, 1] : 1,
          }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
        <span className="text-xs font-medium text-white/80">{statusLabels[state]}</span>
      </motion.div>
    </Html>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-purple-500/30 border-t-purple-500" />
        <span className="text-xs text-white/50">{progress.toFixed(0)}%</span>
      </div>
    </Html>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPLINE NEXBOT (Alternative with Spline)
// ═══════════════════════════════════════════════════════════════════════════════

interface SplineNexBotProps {
  scene: string
  state: NexBotState
  audioLevel: number
}

function SplineNexBot({ scene, state, audioLevel }: SplineNexBotProps) {
  const splineRef = useRef<SplineApplication | null>(null)

  const onLoad = useCallback((spline: SplineApplication) => {
    splineRef.current = spline
  }, [])

  // Update Spline based on state
  useEffect(() => {
    if (splineRef.current) {
      // Trigger Spline events based on state
      try {
        switch (state) {
          case 'listening':
            splineRef.current.emitEvent('mouseDown', 'listen')
            break
          case 'thinking':
            splineRef.current.emitEvent('mouseDown', 'think')
            break
          case 'responding':
            splineRef.current.emitEvent('mouseDown', 'respond')
            break
          case 'idle':
          default:
            splineRef.current.emitEvent('mouseUp', 'idle')
            break
        }
      } catch {
        // Spline events may not be configured
      }
    }
  }, [state])

  return <Spline scene={scene} onLoad={onLoad} style={{ width: '100%', height: '100%' }} />
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function NexBot3DAvatar({
  state = 'idle',
  audioLevel = 0,
  size = 200,
  onClick,
  showStatusIndicator = true,
  enableSpline = false,
  splineScene = '/spline-scenes/nexbot-robot-character-concept.splinecode',
  className = '',
}: NexBot3DAvatarProps) {
  const colors = stateColors[state]

  // Use Spline if enabled and scene provided
  if (enableSpline && splineScene) {
    return (
      <div
        className={`relative ${className}`}
        style={{ width: size, height: size }}
        onClick={onClick}
      >
        <SplineNexBot scene={splineScene} state={state} audioLevel={audioLevel} />

        {showStatusIndicator && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
            <motion.div
              className="flex items-center gap-2 rounded-full border border-white/10 bg-black/50 px-3 py-1 backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: colors.primary }}
                animate={{
                  scale: state === 'listening' || state === 'thinking' ? [1, 1.5, 1] : 1,
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
              <span className="text-xs font-medium text-white/80">
                {state === 'idle'
                  ? 'Listo'
                  : state === 'listening'
                    ? 'Escuchando...'
                    : state === 'thinking'
                      ? 'Analizando...'
                      : state === 'responding'
                        ? 'Respondiendo'
                        : state === 'success'
                          ? '¡Completado!'
                          : 'Error'}
              </span>
            </motion.div>
          </div>
        )}
      </div>
    )
  }

  // R3F implementation
  return (
    <div
      className={`relative cursor-pointer ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={<Loader />}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <pointLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
          <pointLight position={[-5, -5, 5]} intensity={0.5} color={colors.primary} />
          <spotLight
            position={[0, 3, 3]}
            angle={0.4}
            penumbra={1}
            intensity={1}
            color={colors.secondary}
          />

          {/* Environment */}
          <Environment preset="night" />

          {/* NexBot */}
          <NexBotBody state={state} audioLevel={audioLevel} />

          {/* Status */}
          {showStatusIndicator && <StatusIndicator state={state} />}
        </Suspense>
      </Canvas>

      {/* Glow effect behind canvas */}
      <motion.div
        className="absolute inset-0 -z-10 rounded-full blur-3xl"
        style={{ backgroundColor: colors.glow }}
        animate={{
          opacity: [0.1, 0.2, 0.1],
          scale: [0.8, 1, 0.8],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI VERSION
// ═══════════════════════════════════════════════════════════════════════════════

export function NexBot3DAvatarMini({
  state = 'idle',
  audioLevel = 0,
  size = 48,
  onClick,
}: Omit<NexBot3DAvatarProps, 'showStatusIndicator' | 'enableSpline' | 'splineScene'>) {
  const colors = stateColors[state]

  return (
    <motion.div
      className="relative cursor-pointer"
      style={{ width: size, height: size }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <Canvas
        camera={{ position: [0, 0, 2], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[3, 3, 3]} intensity={1} />

        <Float speed={3} rotationIntensity={0.5} floatIntensity={0.3}>
          <mesh>
            <icosahedronGeometry args={[0.5, 3]} />
            <MeshDistortMaterial
              color={colors.primary}
              emissive={colors.primary}
              emissiveIntensity={0.5 + audioLevel * 0.5}
              metalness={0.7}
              roughness={0.3}
              distort={0.2 + audioLevel * 0.1}
              speed={state === 'thinking' ? 4 : 1.5}
            />
          </mesh>
        </Float>
      </Canvas>

      {/* Status pulse */}
      <motion.div
        className="absolute -top-1 -right-1 h-3 w-3 rounded-full"
        style={{ backgroundColor: colors.primary }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [1, 0.7, 1],
        }}
        transition={{ duration: 1, repeat: Infinity }}
      />
    </motion.div>
  )
}

export default NexBot3DAvatar
