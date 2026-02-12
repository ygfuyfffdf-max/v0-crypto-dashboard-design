/**
 * 🤖🌌 SPLINE AVATAR CONTROLLER — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Controlador avanzado para el avatar Nexbot con:
 * - Control programático de partes (Head, Eyes, Mouth, Body, Hands)
 * - Eye tracking (ojos siguen cursor)
 * - Lip sync con análisis de audio
 * - Gestos corporales por emotion state
 * - Animaciones idle (respiración, parpadeo)
 * - Integración con Spline Runtime
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import Spline from '@splinetool/react-spline'
import type { SPEObject, Application as SplineApplication } from '@splinetool/runtime'
import { AnimatePresence, motion } from 'motion/react'
import { Loader2 } from 'lucide-react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type AvatarEmotion =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'success'
  | 'euphoric'
  | 'stress'
  | 'alert'
  | 'concerned'

export type AvatarGesture =
  | 'wave'
  | 'thumbsUp'
  | 'point'
  | 'celebrate'
  | 'calm'
  | 'think'
  | 'openArms'

interface AvatarPartRefs {
  head: SPEObject | null
  eyeLeft: SPEObject | null
  eyeRight: SPEObject | null
  mouth: SPEObject | null
  body: SPEObject | null
  leftHand: SPEObject | null
  rightHand: SPEObject | null
  antenna: SPEObject | null
}

export interface SplineAvatarControllerProps {
  scene?: string
  emotion?: AvatarEmotion
  isSpeaking?: boolean
  isListening?: boolean
  audioLevel?: number
  lookAtTarget?: { x: number; y: number } // Normalized -1 to 1
  gesture?: AvatarGesture | null
  enableIdleAnimations?: boolean
  enableEyeTracking?: boolean
  enableLipSync?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
  className?: string
}

export interface SplineAvatarControllerRef {
  triggerGesture: (gesture: AvatarGesture) => void
  setEmotion: (emotion: AvatarEmotion) => void
  lookAt: (x: number, y: number) => void
  setMouthOpen: (value: number) => void // 0-1
  playAnimation: (name: string) => void
  getSplineInstance: () => SplineApplication | null
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const EMOTION_CONFIGS: Record<
  AvatarEmotion,
  {
    eyeGlow: string
    eyeScale: number
    bodyTilt: number
    breathingSpeed: number
    blinkRate: number
    antennaGlow: number
  }
> = {
  idle: {
    eyeGlow: '#8B5CF6',
    eyeScale: 1,
    bodyTilt: 0,
    breathingSpeed: 1,
    blinkRate: 3000,
    antennaGlow: 0.5,
  },
  listening: {
    eyeGlow: '#10B981',
    eyeScale: 1.1,
    bodyTilt: 5,
    breathingSpeed: 0.8,
    blinkRate: 4000,
    antennaGlow: 0.8,
  },
  thinking: {
    eyeGlow: '#F59E0B',
    eyeScale: 0.9,
    bodyTilt: -5,
    breathingSpeed: 0.6,
    blinkRate: 5000,
    antennaGlow: 1,
  },
  speaking: {
    eyeGlow: '#3B82F6',
    eyeScale: 1,
    bodyTilt: 0,
    breathingSpeed: 1.2,
    blinkRate: 2500,
    antennaGlow: 0.7,
  },
  success: {
    eyeGlow: '#FFD700',
    eyeScale: 1.2,
    bodyTilt: 10,
    breathingSpeed: 1.5,
    blinkRate: 2000,
    antennaGlow: 1,
  },
  euphoric: {
    eyeGlow: '#EC4899',
    eyeScale: 1.3,
    bodyTilt: 15,
    breathingSpeed: 2,
    blinkRate: 1500,
    antennaGlow: 1.2,
  },
  stress: {
    eyeGlow: '#EF4444',
    eyescale: 1.02,
    bodyTilt: -3,
    breathingSpeed: 1.8,
    blinkRate: 1000,
    antennaGlow: 0.9,
  },
  alert: {
    eyeGlow: '#F97316',
    eyeScale: 1.2,
    bodyTilt: 0,
    breathingSpeed: 1.4,
    blinkRate: 800,
    antennaGlow: 1.1,
  },
  concerned: {
    eyeGlow: '#6366F1',
    eyeScale: 0.95,
    bodyTilt: -8,
    breathingSpeed: 0.9,
    blinkRate: 3500,
    antennaGlow: 0.6,
  },
}

const GESTURE_ANIMATIONS: Record<
  AvatarGesture,
  {
    duration: number
    keyframes: {
      leftHand?: { x: number; y: number; z: number; rotation: number }[]
      rightHand?: { x: number; y: number; z: number; rotation: number }[]
      head?: { tilt: number; rotation: number }[]
      body?: { scale: number; tilt: number }[]
    }
  }
> = {
  wave: {
    duration: 1200,
    keyframes: {
      rightHand: [
        { x: 0.5, y: 0.8, z: 0, rotation: 0 },
        { x: 0.5, y: 0.9, z: 0, rotation: 15 },
        { x: 0.5, y: 0.8, z: 0, rotation: -15 },
        { x: 0.5, y: 0.9, z: 0, rotation: 15 },
        { x: 0.5, y: 0.8, z: 0, rotation: 0 },
      ],
    },
  },
  thumbsUp: {
    duration: 800,
    keyframes: {
      rightHand: [
        { x: 0.3, y: 0.4, z: 0, rotation: 0 },
        { x: 0.4, y: 0.7, z: 0.1, rotation: 90 },
        { x: 0.4, y: 0.7, z: 0.1, rotation: 90 },
        { x: 0.3, y: 0.4, z: 0, rotation: 0 },
      ],
    },
  },
  point: {
    duration: 600,
    keyframes: {
      rightHand: [
        { x: 0.3, y: 0.4, z: 0, rotation: 0 },
        { x: 0.6, y: 0.5, z: 0.2, rotation: 45 },
      ],
    },
  },
  celebrate: {
    duration: 1500,
    keyframes: {
      leftHand: [
        { x: -0.3, y: 0.4, z: 0, rotation: 0 },
        { x: -0.5, y: 1, z: 0, rotation: -30 },
        { x: -0.5, y: 1.1, z: 0, rotation: -45 },
        { x: -0.5, y: 1, z: 0, rotation: -30 },
        { x: -0.3, y: 0.4, z: 0, rotation: 0 },
      ],
      rightHand: [
        { x: 0.3, y: 0.4, z: 0, rotation: 0 },
        { x: 0.5, y: 1, z: 0, rotation: 30 },
        { x: 0.5, y: 1.1, z: 0, rotation: 45 },
        { x: 0.5, y: 1, z: 0, rotation: 30 },
        { x: 0.3, y: 0.4, z: 0, rotation: 0 },
      ],
      body: [
        { scale: 1, tilt: 0 },
        { scale: 1.02, tilt: 5 },
        { scale: 1.1, tilt: -5 },
        { scale: 1.02, tilt: 5 },
        { scale: 1, tilt: 0 },
      ],
    },
  },
  calm: {
    duration: 1000,
    keyframes: {
      leftHand: [
        { x: -0.3, y: 0.4, z: 0, rotation: 0 },
        { x: -0.2, y: 0.3, z: 0.1, rotation: -10 },
      ],
      rightHand: [
        { x: 0.3, y: 0.4, z: 0, rotation: 0 },
        { x: 0.2, y: 0.3, z: 0.1, rotation: 10 },
      ],
    },
  },
  think: {
    duration: 800,
    keyframes: {
      rightHand: [
        { x: 0.3, y: 0.4, z: 0, rotation: 0 },
        { x: 0.15, y: 0.6, z: 0.2, rotation: 45 },
      ],
      head: [
        { tilt: 0, rotation: 0 },
        { tilt: -10, rotation: 10 },
      ],
    },
  },
  openArms: {
    duration: 1000,
    keyframes: {
      leftHand: [
        { x: -0.3, y: 0.4, z: 0, rotation: 0 },
        { x: -0.8, y: 0.5, z: 0, rotation: -30 },
      ],
      rightHand: [
        { x: 0.3, y: 0.4, z: 0, rotation: 0 },
        { x: 0.8, y: 0.5, z: 0, rotation: 30 },
      ],
    },
  },
}

// Part name mappings for Spline objects
const PART_NAMES = {
  head: ['Head', 'head', 'HEAD', 'Cabeza'],
  eyeLeft: ['Eye_L', 'EyeLeft', 'eye_left', 'LeftEye', 'Ojo_L'],
  eyeRight: ['Eye_R', 'EyeRight', 'eye_right', 'RightEye', 'Ojo_R'],
  mouth: ['Mouth', 'mouth', 'MOUTH', 'Boca'],
  body: ['Body', 'body', 'BODY', 'Torso', 'Cuerpo'],
  leftHand: ['Hand_L', 'LeftHand', 'hand_left', 'Mano_L'],
  rightHand: ['Hand_R', 'RightHand', 'hand_right', 'Mano_R'],
  antenna: ['Antenna', 'antenna', 'ANTENNA', 'Antena'],
}

// Default Spline scene URL
const DEFAULT_SCENE = '/spline/nexbot.splinecode'

// Utility function
function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const SplineAvatarController = forwardRef<SplineAvatarControllerRef, SplineAvatarControllerProps>(
  (
    {
      scene = DEFAULT_SCENE,
      emotion = 'idle',
      isSpeaking = false,
      isListening = false,
      audioLevel = 0,
      lookAtTarget,
      gesture = null,
      enableIdleAnimations = true,
      enableEyeTracking = true,
      enableLipSync = true,
      onLoad,
      onError,
      className = '',
    },
    ref,
  ) => {
    // ═══════════════════════════════════════════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════════════════════════════════════════

    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // Refs
    const splineRef = useRef<SplineApplication | null>(null)
    const partsRef = useRef<AvatarPartRefs>({
      head: null,
      eyeLeft: null,
      eyeRight: null,
      mouth: null,
      body: null,
      leftHand: null,
      rightHand: null,
      antenna: null,
    })

    // Animation frames
    const breathingFrameRef = useRef<number>(0)
    const blinkFrameRef = useRef<number>(0)
    const gestureTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════
    // SPLINE LOAD HANDLER
    // ═══════════════════════════════════════════════════════════════════════════════════════════════════

    const findObjectByNames = useCallback(
      (spline: SplineApplication, names: string[]): SPEObject | null => {
        for (const name of names) {
          try {
            const obj = spline.findObjectByName(name)
            if (obj) return obj
          } catch {
            // Continue searching
          }
        }
        return null
      },
      [],
    )

    const handleSplineLoad = useCallback(
      (spline: SplineApplication) => {
        splineRef.current = spline

        // Find all avatar parts
        partsRef.current = {
          head: findObjectByNames(spline, PART_NAMES.head),
          eyeLeft: findObjectByNames(spline, PART_NAMES.eyeLeft),
          eyeRight: findObjectByNames(spline, PART_NAMES.eyeRight),
          mouth: findObjectByNames(spline, PART_NAMES.mouth),
          body: findObjectByNames(spline, PART_NAMES.body),
          leftHand: findObjectByNames(spline, PART_NAMES.leftHand),
          rightHand: findObjectByNames(spline, PART_NAMES.rightHand),
          antenna: findObjectByNames(spline, PART_NAMES.antenna),
        }

        setIsLoading(false)
        onLoad?.()
      },
      [findObjectByNames, onLoad],
    )

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════
    // EYE TRACKING
    // ═══════════════════════════════════════════════════════════════════════════════════════════════════

    const updateEyeTracking = useCallback(
      (target: { x: number; y: number }) => {
        if (!enableEyeTracking) return

        const { eyeLeft, eyeRight, head } = partsRef.current
        const maxRotation = 20 // degrees

        // Calculate rotation based on target position
        const rotY = target.x * maxRotation
        const rotX = -target.y * maxRotation * 0.5

        // Apply to eyes
        if (eyeLeft) {
          try {
            eyeLeft.rotation.y = degToRad(rotY)
            eyeLeft.rotation.x = degToRad(rotX)
          } catch {
            // Silent fail
          }
        }

        if (eyeRight) {
          try {
            eyeRight.rotation.y = degToRad(rotY)
            eyeRight.rotation.x = degToRad(rotX)
          } catch {
            // Silent fail
          }
        }

        // Subtle head follow
        if (head) {
          try {
            const headRotY = target.x * 10
            const headRotX = -target.y * 5
            head.rotation.y = degToRad(headRotY)
            head.rotation.x = degToRad(headRotX)
          } catch {
            // Silent fail
          }
        }
      },
      [enableEyeTracking],
    )

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════
    // LIP SYNC
    // ═══════════════════════════════════════════════════════════════════════════════════════════════════

    const updateLipSync = useCallback(
      (level: number) => {
        if (!enableLipSync) return

        const { mouth } = partsRef.current
        if (!mouth) return

        // Scale mouth based on audio level
        const baseScale = 1
        const maxOpenScale = 1.5
        const targetScale = baseScale + level * (maxOpenScale - baseScale)

        try {
          mouth.scale.y = targetScale
        } catch {
          // Silent fail
        }
      },
      [enableLipSync],
    )

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════
    // GESTURE SYSTEM
    // ═══════════════════════════════════════════════════════════════════════════════════════════════════

    const triggerGesture = useCallback((gestureType: AvatarGesture) => {
      const animation = GESTURE_ANIMATIONS[gestureType]
      if (!animation) return

      // Clear any existing gesture animation
      if (gestureTimeoutRef.current) {
        clearTimeout(gestureTimeoutRef.current)
      }

      const { keyframes, duration } = animation
      const frameCount = Math.max(
        ...[
          keyframes.leftHand?.length ?? 0,
          keyframes.rightHand?.length ?? 0,
          keyframes.head?.length ?? 0,
          keyframes.body?.length ?? 0,
        ],
      )

      if (frameCount === 0) return

      const frameDuration = duration / frameCount
      let currentFrame = 0

      const animateFrame = () => {
        if (currentFrame >= frameCount) return

        // Animate hands
        if (keyframes.leftHand && partsRef.current.leftHand) {
          const kf = keyframes.leftHand[currentFrame]
          if (kf) {
            try {
              partsRef.current.leftHand.position.x = kf.x
              partsRef.current.leftHand.position.y = kf.y
              partsRef.current.leftHand.position.z = kf.z
              partsRef.current.leftHand.rotation.z = degToRad(kf.rotation)
            } catch {
              // Silent fail
            }
          }
        }

        if (keyframes.rightHand && partsRef.current.rightHand) {
          const kf = keyframes.rightHand[currentFrame]
          if (kf) {
            try {
              partsRef.current.rightHand.position.x = kf.x
              partsRef.current.rightHand.position.y = kf.y
              partsRef.current.rightHand.position.z = kf.z
              partsRef.current.rightHand.rotation.z = degToRad(kf.rotation)
            } catch {
              // Silent fail
            }
          }
        }

        if (keyframes.head && partsRef.current.head) {
          const kf = keyframes.head[currentFrame]
          if (kf) {
            try {
              partsRef.current.head.rotation.z = degToRad(kf.tilt)
              partsRef.current.head.rotation.y = degToRad(kf.rotation)
            } catch {
              // Silent fail
            }
          }
        }

        if (keyframes.body && partsRef.current.body) {
          const kf = keyframes.body[currentFrame]
          if (kf) {
            try {
              partsRef.current.body.scale.x = kf.scale
              partsRef.current.body.scale.y = kf.scale
              partsRef.current.body.scale.z = kf.scale
              partsRef.current.body.rotation.z = degToRad(kf.tilt)
            } catch {
              // Silent fail
            }
          }
        }

        currentFrame++
        if (currentFrame < frameCount) {
          gestureTimeoutRef.current = setTimeout(animateFrame, frameDuration)
        }
      }

      animateFrame()
    }, [])

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════
    // IDLE ANIMATIONS
    // ═══════════════════════════════════════════════════════════════════════════════════════════════════

    // Breathing animation
    useEffect(() => {
      if (!enableIdleAnimations) return

      const config = EMOTION_CONFIGS[emotion]
      const startTime = Date.now()

      const animate = () => {
        const elapsed = (Date.now() - startTime) / 1000
        const breathCycle = Math.sin(elapsed * config.breathingSpeed * 2) * 0.02

        if (partsRef.current.body) {
          try {
            partsRef.current.body.scale.y = 1 + breathCycle
          } catch {
            // Silent fail
          }
        }

        breathingFrameRef.current = requestAnimationFrame(animate)
      }

      breathingFrameRef.current = requestAnimationFrame(animate)

      return () => {
        cancelAnimationFrame(breathingFrameRef.current)
      }
    }, [enableIdleAnimations, emotion])

    // Blinking animation
    useEffect(() => {
      if (!enableIdleAnimations) return

      const config = EMOTION_CONFIGS[emotion]

      const blink = () => {
        const { eyeLeft, eyeRight } = partsRef.current

        // Close eyes
        if (eyeLeft) {
          try {
            eyeLeft.scale.y = 0.1
          } catch {
            // Silent fail
          }
        }
        if (eyeRight) {
          try {
            eyeRight.scale.y = 0.1
          } catch {
            // Silent fail
          }
        }

        // Open eyes after 150ms
        setTimeout(() => {
          if (eyeLeft) {
            try {
              eyeLeft.scale.y = config.eyeScale
            } catch {
              // Silent fail
            }
          }
          if (eyeRight) {
            try {
              eyeRight.scale.y = config.eyeScale
            } catch {
              // Silent fail
            }
          }
        }, 150)
      }

      const interval = setInterval(blink, config.blinkRate)

      return () => clearInterval(interval)
    }, [enableIdleAnimations, emotion])

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════
    // IMPERATIVE HANDLE
    // ═══════════════════════════════════════════════════════════════════════════════════════════════════

    useImperativeHandle(
      ref,
      () => ({
        triggerGesture,
        setEmotion: (newEmotion: AvatarEmotion) => {
          const config = EMOTION_CONFIGS[newEmotion]
          const { eyeLeft, eyeRight } = partsRef.current

          if (eyeLeft && eyeRight) {
            try {
              eyeLeft.scale.x = config.eyeScale
              eyeLeft.scale.y = config.eyeScale
              eyeLeft.scale.z = config.eyeScale
              eyeRight.scale.x = config.eyeScale
              eyeRight.scale.y = config.eyeScale
              eyeRight.scale.z = config.eyeScale
            } catch {
              // Silent fail
            }
          }
        },
        lookAt: (x: number, y: number) => {
          updateEyeTracking({ x, y })
        },
        setMouthOpen: (value: number) => {
          updateLipSync(value)
        },
        playAnimation: (name: string) => {
          if (splineRef.current) {
            try {
              splineRef.current.emitEvent('mouseDown', name)
            } catch {
              // Silent fail
            }
          }
        },
        getSplineInstance: () => splineRef.current,
      }),
      [triggerGesture, updateEyeTracking, updateLipSync],
    )

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════
    // EFFECTS
    // ═══════════════════════════════════════════════════════════════════════════════════════════════════

    // Update eye tracking when lookAtTarget changes
    useEffect(() => {
      if (lookAtTarget) {
        updateEyeTracking(lookAtTarget)
      }
    }, [lookAtTarget, updateEyeTracking])

    // Update lip sync when speaking
    useEffect(() => {
      if (isSpeaking) {
        updateLipSync(audioLevel)
      } else {
        updateLipSync(0)
      }
    }, [isSpeaking, audioLevel, updateLipSync])

    // Trigger gesture when gesture prop changes
    useEffect(() => {
      if (gesture) {
        triggerGesture(gesture)
      }
    }, [gesture, triggerGesture])

    // Auto-trigger gestures based on emotion
    useEffect(() => {
      if (emotion === 'euphoric') {
        triggerGesture('celebrate')
      } else if (emotion === 'success') {
        triggerGesture('thumbsUp')
      }
    }, [emotion, triggerGesture])

    // Handle errors
    const handleError = useCallback(
      (err: Error) => {
        setError(err)
        onError?.(err)
      },
      [onError],
    )

    // ═══════════════════════════════════════════════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════════════════════════════════════════════

    return (
      <div className={`relative h-full w-full ${className}`}>
        {/* Loading State */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                <Loader2 className="h-16 w-16 text-violet-500" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/80">
            <div className="p-6 text-center">
              <p className="mb-2 text-red-400">Error cargando avatar</p>
              <p className="text-sm text-white/50">{error.message}</p>
            </div>
          </div>
        )}

        {/* Spline Scene */}
        <Spline scene={scene} onLoad={handleSplineLoad} style={{ width: '100%', height: '100%' }} />

        {/* Emotion Glow Overlay */}
        <div
          className="pointer-events-none absolute inset-0 rounded-full opacity-30"
          style={{
            background: `radial-gradient(circle at center, ${EMOTION_CONFIGS[emotion].eyeGlow}40 0%, transparent 60%)`,
            filter: `blur(${emotion === 'euphoric' ? '20px' : '40px'})`,
          }}
        />

        {/* Speaking Indicator */}
        {isSpeaking && (
          <motion.div
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 rounded-full bg-cyan-400"
                  animate={{
                    height: [8, 20 + audioLevel * 30, 8],
                  }}
                  transition={{
                    duration: 0.3,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Listening Indicator */}
        {isListening && (
          <motion.div
            className="absolute top-4 left-1/2 -translate-x-1/2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className="h-4 w-4 rounded-full bg-green-500"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </motion.div>
        )}
      </div>
    )
  },
)

SplineAvatarController.displayName = 'SplineAvatarController'

export default SplineAvatarController


