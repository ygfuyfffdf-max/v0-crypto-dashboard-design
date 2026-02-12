/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎬 CHRONOS 2026 — ULTRA CINEMATIC OPENING
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Secuencia de apertura cinematográfica de nivel AAA con:
 * - Particle nebula con FBM + Worley noise
 * - Logo 3D animado con efectos de luz volumétrica
 * - Transiciones fluidas con easing cinematográfico
 * - Audio reactivo (opcional)
 * - Skip con progreso visual
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import {
  Center,
  Environment,
  Float,
  MeshTransmissionMaterial,
  Sparkles,
  Stars,
  Text3D,
} from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { AnimatePresence, motion, useAnimation } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { ChronosPostProcessing } from '../3d/effects/ChronosPostProcessing'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface UltraCinematicOpeningProps {
  onComplete?: () => void
  duration?: number
  skipEnabled?: boolean
  showProgress?: boolean
  logoText?: string
  tagline?: string
  theme?: 'dark' | 'cosmic' | 'financial'
}

type Phase = 'void' | 'nebula' | 'convergence' | 'logo-reveal' | 'tagline' | 'ready' | 'complete'

// ═══════════════════════════════════════════════════════════════════════════════
// SHADERS
// ═══════════════════════════════════════════════════════════════════════════════

const NebulaVertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vPosition;
  
  void main() {
    vUv = uv;
    vPosition = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const NebulaFragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform float uPhase;
  
  varying vec2 vUv;
  varying vec3 vPosition;
  
  // Hash functions
  vec3 hash33(vec3 p) {
    p = fract(p * vec3(0.1031, 0.1030, 0.0973));
    p += dot(p, p.yxz + 33.33);
    return fract((p.xxy + p.yxx) * p.zyx);
  }
  
  float noise3d(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    
    return mix(
      mix(
        mix(dot(hash33(i) * 2.0 - 1.0, f),
            dot(hash33(i + vec3(1,0,0)) * 2.0 - 1.0, f - vec3(1,0,0)), u.x),
        mix(dot(hash33(i + vec3(0,1,0)) * 2.0 - 1.0, f - vec3(0,1,0)),
            dot(hash33(i + vec3(1,1,0)) * 2.0 - 1.0, f - vec3(1,1,0)), u.x), u.y),
      mix(
        mix(dot(hash33(i + vec3(0,0,1)) * 2.0 - 1.0, f - vec3(0,0,1)),
            dot(hash33(i + vec3(1,0,1)) * 2.0 - 1.0, f - vec3(1,0,1)), u.x),
        mix(dot(hash33(i + vec3(0,1,1)) * 2.0 - 1.0, f - vec3(0,1,1)),
            dot(hash33(i + vec3(1,1,1)) * 2.0 - 1.0, f - vec3(1,1,1)), u.x), u.y), u.z);
  }
  
  float fbm(vec3 p, int octaves) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      value += amplitude * noise3d(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    
    return value;
  }
  
  float worley(vec3 p) {
    vec3 id = floor(p);
    vec3 fd = fract(p);
    float minDist = 1.0;
    
    for (int z = -1; z <= 1; z++) {
      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec3 offset = vec3(float(x), float(y), float(z));
          vec3 featurePoint = offset + hash33(id + offset) * 0.5 + 0.5;
          minDist = min(minDist, length(featurePoint - fd));
        }
      }
    }
    
    return minDist;
  }
  
  void main() {
    vec2 uv = vUv - 0.5;
    float dist = length(uv);
    
    // Domain warping for organic nebula
    vec3 p = vec3(uv * 3.0, uTime * 0.1);
    
    vec3 q = vec3(
      fbm(p + vec3(0.0), 4),
      fbm(p + vec3(5.2, 1.3, 0.0), 4),
      fbm(p + vec3(1.7, 9.2, 0.0), 4)
    );
    
    vec3 r = vec3(
      fbm(p + 4.0 * q + vec3(1.7, 9.2, uTime * 0.05), 4),
      fbm(p + 4.0 * q + vec3(8.3, 2.8, uTime * 0.03), 4),
      fbm(p + 4.0 * q + vec3(2.1, 6.3, uTime * 0.04), 4)
    );
    
    float f = fbm(p + 4.0 * r, 5);
    
    // Worley for cell structure
    float w = worley(p * 2.0 + uTime * 0.1);
    
    // Combine
    float nebula = f * (1.0 - w * 0.5);
    
    // Color gradient
    vec3 color = mix(uColor1, uColor2, nebula + 0.5);
    color = mix(color, uColor3, w * 0.5);
    
    // Radial fade
    float fade = 1.0 - smoothstep(0.3, 0.8, dist);
    
    // Phase-based intensity
    float phaseIntensity = smoothstep(0.0, 0.3, uPhase) * (1.0 - smoothstep(0.7, 1.0, uPhase));
    
    // Convergence effect
    float convergence = 1.0 - smoothstep(0.3, 0.5, uPhase);
    float convergeDist = length(uv) * (1.0 + convergence * 2.0);
    fade *= 1.0 - smoothstep(0.2 * (1.0 - uPhase * 0.5), 0.6, convergeDist) * uPhase;
    
    float alpha = nebula * fade * uIntensity * phaseIntensity;
    
    gl_FragColor = vec4(color, alpha);
  }
`

// ═══════════════════════════════════════════════════════════════════════════════
// NEBULA COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function CosmicNebula({ phase, theme }: { phase: number; theme: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  const colors = useMemo(() => {
    switch (theme) {
      case 'cosmic':
        return {
          color1: new THREE.Color(0x1a0a2e),
          color2: new THREE.Color(0x4a148c),
          color3: new THREE.Color(0x7c4dff),
        }
      case 'financial':
        return {
          color1: new THREE.Color(0x0a1628),
          color2: new THREE.Color(0x10b981),
          color3: new THREE.Color(0x3b82f6),
        }
      default:
        return {
          color1: new THREE.Color(0x0a0a0f),
          color2: new THREE.Color(0x1a1a2e),
          color3: new THREE.Color(0x4a4a6a),
        }
    }
  }, [theme])

  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uIntensity: { value: 1.0 },
        uColor1: { value: colors.color1 },
        uColor2: { value: colors.color2 },
        uColor3: { value: colors.color3 },
        uPhase: { value: 0 },
      },
      vertexShader: NebulaVertexShader,
      fragmentShader: NebulaFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  }, [colors])

  useFrame((state) => {
    if (materialRef.current) {
      if (materialRef.current.uniforms.uTime) {
        materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
      }
      if (materialRef.current.uniforms.uPhase) {
        materialRef.current.uniforms.uPhase.value = phase
      }
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, -5]}>
      <planeGeometry args={[20, 20, 1, 1]} />
      <primitive ref={materialRef} object={shaderMaterial} attach="material" />
    </mesh>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGO 3D COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ChronosLogo3D({ visible, text }: { visible: boolean; text: string }) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (groupRef.current && visible) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.1
    }
  })

  return (
    <group ref={groupRef} visible={visible}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        <Center>
          {/* Main logo text */}
          <Text3D
            font="/fonts/inter-bold.json"
            size={0.8}
            height={0.2}
            curveSegments={32}
            bevelEnabled
            bevelThickness={0.02}
            bevelSize={0.02}
            bevelOffset={0}
            bevelSegments={8}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
          >
            {text}
            <MeshTransmissionMaterial
              backside
              samples={16}
              thickness={0.2}
              chromaticAberration={0.1}
              anisotropy={0.3}
              distortion={0.1}
              distortionScale={0.2}
              temporalDistortion={0.1}
              iridescence={1}
              iridescenceIOR={1}
              iridescenceThicknessRange={[0, 1400]}
              color={hovered ? '#8b5cf6' : '#ffffff'}
            />
          </Text3D>
        </Center>
      </Float>

      {/* Glow orbs */}
      <Sparkles count={100} scale={4} size={3} speed={0.4} opacity={0.5} color="#8b5cf6" />

      {/* Ambient particles */}
      <Stars radius={10} depth={50} count={1000} factor={2} saturation={0} fade speed={0.5} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARTICLE CONVERGENCE
// ═══════════════════════════════════════════════════════════════════════════════

function ParticleConvergence({ phase }: { phase: number }) {
  const pointsRef = useRef<THREE.Points>(null)
  const count = 5000

  const [positions, velocities, initialPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const init = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      const angle = Math.random() * Math.PI * 2
      const radius = 5 + Math.random() * 10

      pos[i3] = (Math.cos(angle) * radius) as number
      pos[i3 + 1] = ((Math.random() - 0.5) * 10) as number
      pos[i3 + 2] = (Math.sin(angle) * radius) as number

      init[i3] = pos[i3] as number
      init[i3 + 1] = pos[i3 + 1] as number
      init[i3 + 2] = pos[i3 + 2] as number

      vel[i3] = 0
      vel[i3 + 1] = 0
      vel[i3 + 2] = 0
    }

    return [pos, vel, init]
  }, [])

  useFrame((state, delta) => {
    if (!pointsRef.current) return

    const posAttr = pointsRef.current.geometry.attributes.position
    if (!posAttr) return

    const positions = posAttr.array as Float32Array
    const convergeFactor = Math.min(phase * 2, 1)

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Target: center during convergence, spiral during nebula
      const ix = initialPositions[i3]
      const iy = initialPositions[i3 + 1]
      const iz = initialPositions[i3 + 2]

      if (ix === undefined || iy === undefined || iz === undefined) continue

      const targetX = ix * (1 - convergeFactor)
      const targetY = iy * (1 - convergeFactor)
      const targetZ = iz * (1 - convergeFactor)

      // Smooth interpolation
      const px = positions[i3]
      const py = positions[i3 + 1]
      const pz = positions[i3 + 2]

      if (px !== undefined) positions[i3] = px + (targetX - px) * delta * 2
      if (py !== undefined) positions[i3 + 1] = py + (targetY - py) * delta * 2
      if (pz !== undefined) positions[i3 + 2] = pz + (targetZ - pz) * delta * 2

      // Add orbital motion
      if (phase < 0.5 && px !== undefined && pz !== undefined) {
        const angle = state.clock.elapsedTime * 0.2 + i * 0.01
        positions[i3] = px + Math.cos(angle) * 0.01
        positions[i3 + 2] = pz + Math.sin(angle) * 0.01
      }
    }

    if (posAttr) {
      posAttr.needsUpdate = true
    }
  })

  return (
    <points ref={pointsRef}>
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
        size={0.05}
        color="#8b5cf6"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3D SCENE
// ═══════════════════════════════════════════════════════════════════════════════

function CinematicScene({
  phase,
  logoText,
  theme,
  showLogo,
}: {
  phase: number
  logoText: string
  theme: string
  showLogo: boolean
}) {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#8b5cf6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
      <spotLight
        position={[0, 5, 5]}
        angle={0.3}
        penumbra={1}
        intensity={2}
        color="#ffffff"
        castShadow
      />

      {/* Environment */}
      <Environment preset="night" />

      {/* Cosmic nebula background */}
      <CosmicNebula phase={phase} theme={theme} />

      {/* Converging particles */}
      <ParticleConvergence phase={phase} />

      {/* Logo */}
      <ChronosLogo3D visible={showLogo} text={logoText} />

      {/* Post-processing */}
      <ChronosPostProcessing
        enabled
        quality="ultra"
        bloom={{ enabled: true, intensity: 1.5, luminanceThreshold: 0.3, luminanceSmoothing: 0.4 }}
        chromatic={{ enabled: true, offset: 0.002 }}
        vignette={{ enabled: true, darkness: 0.6, offset: 0.4 }}
        filmGrain={{ enabled: true, intensity: 0.04 }}
      />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function UltraCinematicOpening({
  onComplete,
  duration = 7000,
  skipEnabled = true,
  showProgress = true,
  logoText = 'CHRONOS',
  tagline = 'FlowDistributor Ultra Premium',
  theme = 'cosmic',
}: UltraCinematicOpeningProps) {
  const [phase, setPhase] = useState<Phase>('void')
  const [progress, setProgress] = useState(0)
  const [showSkip, setShowSkip] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const startTimeRef = useRef<number>(0)
  const animationRef = useRef<number | null>(null)
  const controls = useAnimation()

  // Phase timing
  const phaseTimings = useMemo(
    () => ({
      void: 0,
      nebula: 0.1,
      convergence: 0.3,
      'logo-reveal': 0.5,
      tagline: 0.7,
      ready: 0.9,
      complete: 1.0,
    }),
    [],
  )

  // Animation loop
  useEffect(() => {
    startTimeRef.current = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current
      const progressValue = Math.min(elapsed / duration, 1)
      setProgress(progressValue)

      // Determine phase
      if (progressValue < phaseTimings.nebula) {
        setPhase('void')
      } else if (progressValue < phaseTimings.convergence) {
        setPhase('nebula')
      } else if (progressValue < phaseTimings['logo-reveal']) {
        setPhase('convergence')
      } else if (progressValue < phaseTimings.tagline) {
        setPhase('logo-reveal')
      } else if (progressValue < phaseTimings.ready) {
        setPhase('tagline')
      } else if (progressValue < phaseTimings.complete) {
        setPhase('ready')
      } else {
        setPhase('complete')
        setIsComplete(true)
        onComplete?.()
        return
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    // Show skip button after delay
    const skipTimer = setTimeout(() => setShowSkip(true), 1000)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      clearTimeout(skipTimer)
    }
  }, [duration, onComplete, phaseTimings])

  // Skip handler
  const handleSkip = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    setIsComplete(true)
    setProgress(1)
    setPhase('complete')
    onComplete?.()
  }, [onComplete])

  if (isComplete) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] bg-black"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* 3D Canvas */}
        <Canvas
          camera={{ position: [0, 0, 5], fov: 60 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: '#000000' }}
        >
          <CinematicScene
            phase={progress}
            logoText={logoText}
            theme={theme}
            showLogo={phase === 'logo-reveal' || phase === 'tagline' || phase === 'ready'}
          />
        </Canvas>

        {/* Tagline overlay */}
        <AnimatePresence>
          {(phase === 'tagline' || phase === 'ready') && (
            <motion.div
              className="pointer-events-none absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="mt-32 text-center">
                <motion.p
                  className="text-xl font-light tracking-[0.3em] text-white/80 uppercase md:text-2xl"
                  initial={{ opacity: 0, letterSpacing: '0.5em' }}
                  animate={{ opacity: 1, letterSpacing: '0.3em' }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  {tagline}
                </motion.p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        {showProgress && (
          <div className="absolute bottom-8 left-1/2 w-64 -translate-x-1/2">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                style={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <p className="mt-2 text-center font-mono text-xs text-white/30">
              {Math.round(progress * 100)}%
            </p>
          </div>
        )}

        {/* Skip button */}
        <AnimatePresence>
          {skipEnabled && showSkip && (
            <motion.button
              onClick={handleSkip}
              className="absolute right-8 bottom-8 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white/60 backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:text-white"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              Saltar intro →
            </motion.button>
          )}
        </AnimatePresence>

        {/* Phase indicator (debug) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="absolute top-4 left-4 font-mono text-xs text-white/30">
            Phase: {phase} | Progress: {(progress * 100).toFixed(1)}%
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default UltraCinematicOpening
