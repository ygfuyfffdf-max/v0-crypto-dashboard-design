'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — GLTF 3D MODELS INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Integración de modelos GLTF con React Three Fiber:
 * - nexbot_robot_character_concept.gltf → Avatar humanoide robot para IA
 * - ai_voice_assistance_orb.gltf → Orb con anillos orbitales
 *
 * Características:
 * - Rigging de boca/ojos/cabeza sincronizado
 * - Anillos orbitales rotando según mood
 * - Luces pulsantes sincronizadas con pulso usuario
 * - Gestures según emotion state
 */

import { useRef, useEffect, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  useGLTF,
  OrbitControls,
  Environment,
  Float,
  PresentationControls,
  Center,
  useAnimations,
} from '@react-three/drei'
import * as THREE from 'three'
import type { GLTF } from 'three-stdlib'
import { QUANTUM_PALETTE, type QuantumMood } from '@/app/lib/design-system/quantum-infinity-2026'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type NexbotEmotion = 'idle' | 'listening' | 'thinking' | 'speaking' | 'excited' | 'concerned'

interface NexbotProps {
  emotion?: NexbotEmotion
  isSpeaking?: boolean
  lookAtMouse?: boolean
  scale?: number
}

interface VoiceOrbProps {
  mood?: QuantumMood
  pulso?: number
  isActive?: boolean
  scale?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🤖 NEXBOT AVATAR (nexbot_robot_character_concept.gltf)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const NexbotModel = ({
  emotion = 'idle',
  isSpeaking = false,
  lookAtMouse = true,
  scale = 1,
}: NexbotProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Object3D>(null)
  const eyeLeftRef = useRef<THREE.Object3D>(null)
  const eyeRightRef = useRef<THREE.Object3D>(null)
  const mouthRef = useRef<THREE.Object3D>(null)

  const { viewport, mouse } = useThree()

  // Cargar modelo GLTF
  const { scene, animations } = useGLTF('/models/nexbot_robot_character_concept.gltf') as GLTF & {
    scene: THREE.Group
  }
  const { actions } = useAnimations(animations, groupRef)

  // Configuración de colores por emotion
  const emotionConfig = useMemo(
    () => ({
      idle: {
        emissiveIntensity: 0.3,
        color: new THREE.Color(QUANTUM_PALETTE.violet.pure),
        eyeColor: new THREE.Color(QUANTUM_PALETTE.violet.neon),
      },
      listening: {
        emissiveIntensity: 0.5,
        color: new THREE.Color(QUANTUM_PALETTE.gold.pure),
        eyeColor: new THREE.Color(QUANTUM_PALETTE.gold.pure),
      },
      thinking: {
        emissiveIntensity: 0.4,
        color: new THREE.Color(QUANTUM_PALETTE.violet.soft),
        eyeColor: new THREE.Color(QUANTUM_PALETTE.violet.pure),
      },
      speaking: {
        emissiveIntensity: 0.6,
        color: new THREE.Color(QUANTUM_PALETTE.violet.neon),
        eyeColor: new THREE.Color(QUANTUM_PALETTE.gold.pure),
      },
      excited: {
        emissiveIntensity: 0.8,
        color: new THREE.Color(QUANTUM_PALETTE.gold.pure),
        eyeColor: new THREE.Color(QUANTUM_PALETTE.gold.pure),
      },
      concerned: {
        emissiveIntensity: 0.4,
        color: new THREE.Color(QUANTUM_PALETTE.plasma.pure),
        eyeColor: new THREE.Color(QUANTUM_PALETTE.plasma.pure),
      },
    }),
    [],
  )

  // Clonar escena para evitar problemas
  const clonedScene = useMemo(() => scene.clone(), [scene])

  // Buscar bones/objetos para animación
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.name.toLowerCase().includes('head')) {
        headRef.current = child
      }
      if (
        child.name.toLowerCase().includes('eye_l') ||
        child.name.toLowerCase().includes('lefteye')
      ) {
        eyeLeftRef.current = child
      }
      if (
        child.name.toLowerCase().includes('eye_r') ||
        child.name.toLowerCase().includes('righteye')
      ) {
        eyeRightRef.current = child
      }
      if (child.name.toLowerCase().includes('mouth') || child.name.toLowerCase().includes('jaw')) {
        mouthRef.current = child
      }

      // Aplicar materiales emissivos
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial
          if (material.emissive) {
            material.emissive = emotionConfig[emotion].color
            material.emissiveIntensity = emotionConfig[emotion].emissiveIntensity
          }
        }
      }
    })
  }, [clonedScene, emotion, emotionConfig])

  // Animación de frame
  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.getElapsedTime()

    // Look at mouse (cabeza y ojos)
    if (lookAtMouse && headRef.current) {
      const targetX = ((mouse.x * viewport.width) / 2) * 0.3
      const targetY = ((mouse.y * viewport.height) / 2) * 0.2

      headRef.current.rotation.y = THREE.MathUtils.lerp(
        headRef.current.rotation.y,
        targetX * 0.3,
        0.1,
      )
      headRef.current.rotation.x = THREE.MathUtils.lerp(
        headRef.current.rotation.x,
        -targetY * 0.2,
        0.1,
      )
    }

    // Mouth animation when speaking
    if (mouthRef.current && isSpeaking) {
      const mouthOpen = Math.sin(time * 15) * 0.1 + 0.05
      mouthRef.current.scale.y = 1 + mouthOpen
    }

    // Idle breathing animation
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(time * 2) * 0.02
    }

    // Eye glow pulsing
    if (eyeLeftRef.current && eyeRightRef.current) {
      const pulse = Math.sin(time * 3) * 0.2 + 0.8
      ;[eyeLeftRef.current, eyeRightRef.current].forEach((eye) => {
        if ((eye as THREE.Mesh).material) {
          const material = (eye as THREE.Mesh).material as THREE.MeshStandardMaterial
          if (material.emissiveIntensity !== undefined) {
            material.emissiveIntensity = emotionConfig[emotion].emissiveIntensity * pulse
          }
        }
      })
    }
  })

  return (
    <group ref={groupRef} scale={scale}>
      <primitive object={clonedScene} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔮 VOICE ORB (ai_voice_assistance_orb.gltf)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const VoiceOrbModel = ({
  mood = 'flow',
  pulso = 72,
  isActive = false,
  scale = 1,
}: VoiceOrbProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const ringsRef = useRef<THREE.Object3D[]>([])

  // Cargar modelo GLTF
  const { scene } = useGLTF('/models/ai_voice_assistance_orb.gltf') as GLTF & {
    scene: THREE.Group
  }

  // Configuración por mood
  const moodConfig = useMemo(
    () => ({
      calm: { rotationSpeed: 0.2, pulseIntensity: 0.3, color: QUANTUM_PALETTE.violet.soft },
      flow: { rotationSpeed: 0.5, pulseIntensity: 0.5, color: QUANTUM_PALETTE.violet.pure },
      stress: { rotationSpeed: 0.8, pulseIntensity: 0.6, color: QUANTUM_PALETTE.plasma.pure },
      euphoric: { rotationSpeed: 1.2, pulseIntensity: 0.9, color: QUANTUM_PALETTE.gold.pure },
      neutral: { rotationSpeed: 0.4, pulseIntensity: 0.4, color: QUANTUM_PALETTE.violet.soft },
      focus: { rotationSpeed: 0.6, pulseIntensity: 0.55, color: QUANTUM_PALETTE.violet.electric },
      night: { rotationSpeed: 0.15, pulseIntensity: 0.2, color: QUANTUM_PALETTE.violet.dark },
    }),
    [],
  )

  // Clonar escena
  const clonedScene = useMemo(() => scene.clone(), [scene])

  // Encontrar anillos
  useEffect(() => {
    ringsRef.current = []
    clonedScene.traverse((child) => {
      if (child.name.toLowerCase().includes('ring') || child.name.toLowerCase().includes('orbit')) {
        ringsRef.current.push(child)
      }

      // Aplicar colores
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh
        if (mesh.material) {
          const material = mesh.material as THREE.MeshStandardMaterial
          if (material.emissive) {
            material.emissive = new THREE.Color(moodConfig[mood].color)
            material.emissiveIntensity = moodConfig[mood].pulseIntensity
          }
        }
      }
    })
  }, [clonedScene, mood, moodConfig])

  // Animación
  useFrame((state) => {
    if (!groupRef.current) return
    const time = state.clock.getElapsedTime()
    const config = moodConfig[mood]

    // Pulso basado en BPM
    const pulseDuration = 60 / pulso
    const pulse = Math.sin((time / pulseDuration) * Math.PI * 2) * 0.1 + 1

    groupRef.current.scale.setScalar(scale * pulse)

    // Rotar anillos
    ringsRef.current.forEach((ring, i) => {
      ring.rotation.y += config.rotationSpeed * 0.01 * (i % 2 === 0 ? 1 : -1)
      ring.rotation.x += config.rotationSpeed * 0.005 * (i % 2 === 0 ? -1 : 1)
    })

    // Glow cuando activo
    if (isActive) {
      clonedScene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh
          if (mesh.material) {
            const material = mesh.material as THREE.MeshStandardMaterial
            if (material.emissiveIntensity !== undefined) {
              material.emissiveIntensity = config.pulseIntensity * (0.8 + Math.sin(time * 5) * 0.2)
            }
          }
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} />
    </group>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 CANVAS WRAPPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NexbotCanvasProps extends NexbotProps {
  className?: string
}

export const NexbotCanvas = ({ className = '', ...props }: NexbotCanvasProps) => {
  return (
    <div className={`h-full w-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 50 }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <spotLight
            position={[5, 5, 5]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            color={QUANTUM_PALETTE.violet.pure}
          />
          <spotLight
            position={[-5, 5, -5]}
            angle={0.3}
            penumbra={1}
            intensity={0.5}
            color={QUANTUM_PALETTE.gold.pure}
          />
          <PresentationControls
            global
            rotation={[0, 0, 0]}
            polar={[-0.2, 0.2]}
            azimuth={[-0.5, 0.5]}
            speed={2}
          >
            <Float rotationIntensity={0.2} floatIntensity={0.5}>
              <Center>
                <NexbotModel {...props} />
              </Center>
            </Float>
          </PresentationControls>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}

interface VoiceOrbCanvasProps extends VoiceOrbProps {
  className?: string
}

export const VoiceOrbCanvas = ({ className = '', ...props }: VoiceOrbCanvasProps) => {
  return (
    <div className={`h-full w-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 4], fov: 45 }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[0, 0, 3]} intensity={2} color={QUANTUM_PALETTE.violet.pure} />
          <pointLight position={[3, 3, 0]} intensity={1} color={QUANTUM_PALETTE.gold.pure} />
          <PresentationControls
            global
            rotation={[0.1, 0, 0]}
            polar={[-0.3, 0.3]}
            azimuth={[-0.5, 0.5]}
            speed={2}
          >
            <Float rotationIntensity={0.3} floatIntensity={0.6}>
              <Center>
                <VoiceOrbModel {...props} />
              </Center>
            </Float>
          </PresentationControls>
          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 COMBINED: NEXBOT INSIDE ORB
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NexbotInOrbProps {
  emotion?: NexbotEmotion
  isSpeaking?: boolean
  mood?: QuantumMood
  pulso?: number
  isActive?: boolean
  className?: string
}

export const NexbotInOrbCanvas = ({
  emotion = 'idle',
  isSpeaking = false,
  mood = 'flow',
  pulso = 72,
  isActive = false,
  className = '',
}: NexbotInOrbProps) => {
  return (
    <div className={`h-full w-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.4} />
          <spotLight
            position={[5, 5, 5]}
            angle={0.3}
            penumbra={1}
            intensity={1}
            color={QUANTUM_PALETTE.violet.pure}
          />
          <spotLight
            position={[-5, 3, -5]}
            angle={0.3}
            penumbra={1}
            intensity={0.8}
            color={QUANTUM_PALETTE.gold.pure}
          />
          <PresentationControls
            global
            rotation={[0, 0, 0]}
            polar={[-0.3, 0.3]}
            azimuth={[-0.6, 0.6]}
            speed={2}
          >
            <Float rotationIntensity={0.2} floatIntensity={0.4}>
              <group>
                {/* Orb exterior */}
                <VoiceOrbModel mood={mood} pulso={pulso} isActive={isActive} scale={1.5} />
                {/* Nexbot interior */}
                <Center>
                  <NexbotModel emotion={emotion} isSpeaking={isSpeaking} scale={0.6} />
                </Center>
              </group>
            </Float>
          </PresentationControls>
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  )
}

// Preload de modelos
useGLTF.preload('/models/nexbot_robot_character_concept.gltf')
useGLTF.preload('/models/ai_voice_assistance_orb.gltf')

export { NexbotModel, VoiceOrbModel }
