/**
 * 🌀 KOCMOC PORTAL - PORTAL INTERDIMENSIONAL 3D
 * ═══════════════════════════════════════════════════════════════════════════
 * Portal 3D interactivo basado en el logo KOCMOC
 * - Animación de apertura/cierre fluida
 * - Efecto de "viaje en el tiempo"
 * - Partículas y distorsión espacial
 * - Integración con sistema de navegación
 * - Transiciones cinematográficas
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { Environment, MeshDistortMaterial, OrbitControls, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bloom, ChromaticAberration, EffectComposer, Vignette } from '@react-three/postprocessing'
import { AnimatePresence, motion } from 'motion/react'
import { BlendFunction } from 'postprocessing'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface KocmocPortalProps {
  isOpen?: boolean
  onNavigate?: (destination: string) => void
  destination?: string
  className?: string
  size?: number
  intensity?: number
  interactive?: boolean
}

type PortalState = 'closed' | 'opening' | 'open' | 'closing' | 'traveling'

// ═══════════════════════════════════════════════════════════════════════════
// PORTAL RING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function PortalRing({
  state,
  size = 5,
  intensity = 1,
}: {
  state: PortalState
  size?: number
  intensity?: number
}) {
  const ringRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)

  useFrame((frameState) => {
    if (!ringRef.current || !innerRef.current) return

    const time = frameState.clock.getElapsedTime()

    // Rotación continua del anillo
    ringRef.current.rotation.z = time * 0.3

    // Efecto de pulsación basado en estado
    let scale = 1
    let distortion = 0.2

    switch (state) {
      case 'opening':
        scale = Math.min(1, (time % 2) * 0.5 + 0.5)
        distortion = 0.5
        break
      case 'open':
        scale = 1 + Math.sin(time * 2) * 0.05
        distortion = 0.3
        break
      case 'closing':
        scale = Math.max(0, 1 - (time % 2) * 0.5)
        distortion = 0.5
        break
      case 'traveling':
        scale = 1 + Math.sin(time * 5) * 0.2
        distortion = 0.8
        break
      default:
        scale = 0.01
        distortion = 0.1
    }

    ringRef.current.scale.set(scale, scale, scale)

    // Distorsión del portal interior
    if (innerRef.current.material instanceof THREE.Material) {
      const material = innerRef.current.material as any
      if (material.distort !== undefined) {
        material.distort = distortion
      }
    }
  })

  const portalColor = useMemo(() => {
    const colors = {
      closed: '#1a1a2e',
      opening: '#4a90e2',
      open: '#00d4ff',
      closing: '#4a90e2',
      traveling: '#ff00ff',
    }
    return colors[state]
  }, [state])

  return (
    <group>
      {/* Anillo exterior */}
      <mesh ref={ringRef}>
        <torusGeometry args={[size, 0.3, 32, 100]} />
        <meshStandardMaterial
          color={portalColor}
          emissive={portalColor}
          emissiveIntensity={intensity * 2}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Portal interior con distorsión */}
      <mesh ref={innerRef} position={[0, 0, -0.1]}>
        <circleGeometry args={[size * 0.9, 64]} />
        <MeshDistortMaterial
          color={portalColor}
          emissive={portalColor}
          emissiveIntensity={intensity}
          speed={state === 'traveling' ? 10 : 2}
          distort={0.3}
          radius={1}
        />
      </mesh>

      {/* Partículas orbitales */}
      <PortalParticles
        count={state === 'open' || state === 'traveling' ? 200 : 0}
        radius={size * 1.2}
        speed={state === 'traveling' ? 3 : 1}
      />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PORTAL PARTICLES
// ═══════════════════════════════════════════════════════════════════════════

function PortalParticles({
  count,
  radius,
  speed = 1,
}: {
  count: number
  radius: number
  speed?: number
}) {
  const particlesRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const r = radius + (Math.random() - 0.5) * 0.5
      pos[i * 3] = Math.cos(angle) * r
      pos[i * 3 + 1] = Math.sin(angle) * r
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2
    }
    return pos
  }, [count, radius])

  useFrame((state) => {
    if (!particlesRef.current) return

    const time = state.clock.getElapsedTime()
    particlesRef.current.rotation.z = time * speed * 0.5

    // Animación de profundidad
    const posAttr = particlesRef.current.geometry.attributes.position
    if (!posAttr) return
    const positions = posAttr.array as Float32Array
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 2] = Math.sin(time * speed + i * 0.1) * 2
    }
    posAttr.needsUpdate = true
  })

  if (count === 0) return null

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#00d4ff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// TIME TUNNEL EFFECT
// ═══════════════════════════════════════════════════════════════════════════

function TimeTunnel({ active }: { active: boolean }) {
  const tunnelRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!tunnelRef.current || !active) return

    const time = state.clock.getElapsedTime()
    tunnelRef.current.rotation.z = time * 2
    tunnelRef.current.position.z = Math.sin(time * 3) * 5
  })

  if (!active) return null

  return (
    <mesh ref={tunnelRef} position={[0, 0, -10]}>
      <cylinderGeometry args={[15, 0.1, 50, 32, 1, true]} />
      <meshStandardMaterial
        color="#8000ff"
        emissive="#8000ff"
        emissiveIntensity={2}
        side={THREE.DoubleSide}
        transparent
        opacity={0.3}
        wireframe
      />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// SAFE EFFECT COMPOSER - Wrapper para evitar errores de contexto
// ═══════════════════════════════════════════════════════════════════════════

function SafeEffectComposer({ state }: { state: PortalState }) {
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
      <EffectComposer>
        <Bloom
          intensity={state === 'traveling' ? 2 : 1}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
        />
        <ChromaticAberration
          offset={
            state === 'traveling'
              ? ([0.02, 0.02] as [number, number])
              : ([0.001, 0.001] as [number, number])
          }
          blendFunction={BlendFunction.NORMAL}
        />
        <Vignette offset={0.3} darkness={0.5} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    )
  } catch {
    return null
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PORTAL SCENE
// ═══════════════════════════════════════════════════════════════════════════

function PortalScene({
  state,
  destination,
  size,
  intensity,
  interactive,
}: {
  state: PortalState
  destination?: string
  size?: number
  intensity?: number
  interactive?: boolean
}) {
  const safeIntensity = intensity ?? 2
  return (
    <>
      <color attach="background" args={['#0a0a0a']} />

      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 10]} intensity={safeIntensity} color="#00d4ff" />
      <pointLight position={[0, 0, -10]} intensity={safeIntensity * 0.5} color="#8000ff" />

      {/* Portal principal */}
      <PortalRing state={state} size={size} intensity={safeIntensity} />

      {/* Time Tunnel cuando está viajando */}
      <TimeTunnel active={state === 'traveling'} />

      {/* Texto de destino */}
      {destination && state !== 'closed' && (
        <Text position={[0, 0, 1]} fontSize={0.5} color="#00d4ff" anchorX="center" anchorY="middle">
          {destination.toUpperCase()}
        </Text>
      )}

      {/* Environment */}
      <Environment preset="night" />

      {/* Post-processing */}
      <SafeEffectComposer state={state} />

      {/* Controls */}
      {interactive && (
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// LOADING FALLBACK
// ═══════════════════════════════════════════════════════════════════════════

function LoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-black">
      <motion.div
        className="h-32 w-32 rounded-full border-4 border-cyan-400 border-t-transparent"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function KocmocPortal({
  isOpen = false,
  onNavigate,
  destination = 'Dashboard',
  className = '',
  size = 5,
  intensity = 1,
  interactive = true,
}: KocmocPortalProps) {
  const [portalState, setPortalState] = useState<PortalState>('closed')
  const [isTraveling, setIsTraveling] = useState(false)

  // Manejar transiciones de estado
  useEffect(() => {
    if (isOpen && portalState === 'closed') {
      setPortalState('opening')
      setTimeout(() => setPortalState('open'), 1000)
    } else if (!isOpen && (portalState === 'open' || portalState === 'opening')) {
      setPortalState('closing')
      setTimeout(() => setPortalState('closed'), 1000)
    }
  }, [isOpen, portalState])

  // Handler de navegación
  const handleNavigate = () => {
    if (portalState === 'open' && onNavigate && !isTraveling) {
      setIsTraveling(true)
      setPortalState('traveling')

      // Simular viaje temporal
      setTimeout(() => {
        onNavigate(destination)
        setPortalState('closing')
        setIsTraveling(false)

        setTimeout(() => {
          setPortalState('closed')
        }, 1000)
      }, 2000)
    }
  }

  return (
    <div className={`relative h-full w-full ${className}`}>
      {/* Status indicator */}
      <AnimatePresence>
        {portalState !== 'closed' && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 z-10 rounded-lg border border-cyan-500/30 bg-black/50 px-4 py-2 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  portalState === 'open'
                    ? 'animate-pulse bg-green-400'
                    : portalState === 'traveling'
                      ? 'animate-ping bg-purple-400'
                      : 'bg-cyan-400'
                }`}
              />
              <span className="text-sm font-medium text-cyan-400">
                {portalState === 'opening' && 'Abriendo Portal...'}
                {portalState === 'open' && 'Portal Listo'}
                {portalState === 'closing' && 'Cerrando Portal...'}
                {portalState === 'traveling' && `Viajando a ${destination}...`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enter button cuando está abierto */}
      <AnimatePresence>
        {portalState === 'open' && !isTraveling && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleNavigate}
            className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 rounded-full bg-cyan-500 px-6 py-3 font-bold text-white shadow-lg shadow-cyan-500/50 transition-all hover:scale-105 hover:bg-cyan-400"
          >
            Entrar al Portal
          </motion.button>
        )}
      </AnimatePresence>

      {/* 3D Canvas */}
      <Suspense fallback={<LoadingFallback />}>
        <Canvas
          camera={{ position: [0, 0, 15], fov: 60 }}
          dpr={[1, 2]}
          gl={{ alpha: true, antialias: true }}
        >
          <PortalScene
            state={portalState}
            destination={destination}
            size={size}
            intensity={intensity}
            interactive={interactive}
          />
        </Canvas>
      </Suspense>
    </div>
  )
}

export default KocmocPortal
