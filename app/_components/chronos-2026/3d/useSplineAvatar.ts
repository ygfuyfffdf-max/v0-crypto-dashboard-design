/**
 * 🤖🎣 USE SPLINE AVATAR HOOK — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hook de React para controlar el avatar Spline con:
 * - Mouse tracking automático
 * - Detección de mood basado en contexto
 * - Integración con servicios de voz
 * - Gestos automáticos por acciones
 * - Bio-feedback integration
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useMotionValue, useSpring } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  AvatarEmotion,
  AvatarGesture,
  SplineAvatarControllerRef,
} from './SplineAvatarController'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type MoodState = 'calm' | 'flow' | 'euphoric' | 'stress' | 'alert'

export interface UseSplineAvatarConfig {
  enableMouseTracking?: boolean
  enableBioFeedback?: boolean
  enableAutoGestures?: boolean
  wakeWord?: string
  defaultEmotion?: AvatarEmotion
  onWakeWordDetected?: () => void
  onEmotionChange?: (emotion: AvatarEmotion) => void
}

export interface UseSplineAvatarReturn {
  // State
  emotion: AvatarEmotion
  mood: MoodState
  isListening: boolean
  isSpeaking: boolean
  audioLevel: number
  lookAtTarget: { x: number; y: number }
  currentGesture: AvatarGesture | null

  // Setters
  setEmotion: (emotion: AvatarEmotion) => void
  setMood: (mood: MoodState) => void
  setIsListening: (listening: boolean) => void
  setIsSpeaking: (speaking: boolean) => void
  setAudioLevel: (level: number) => void

  // Actions
  triggerGesture: (gesture: AvatarGesture) => void
  startListening: () => void
  stopListening: () => void
  speak: (text: string) => Promise<void>
  celebrate: () => void
  showAlert: () => void

  // Ref for SplineAvatarController
  avatarRef: React.RefObject<SplineAvatarControllerRef | null>

  // Mouse tracking
  mousePosition: { x: number; y: number }
  normalizedMousePosition: { x: number; y: number }

  // Bio-feedback
  bioFeedback: {
    heartRate: number
    stressLevel: number
  } | null
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MOOD_TO_EMOTION: Record<MoodState, AvatarEmotion> = {
  calm: 'idle',
  flow: 'thinking',
  euphoric: 'euphoric',
  stress: 'stress',
  alert: 'alert',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useSplineAvatar(config: UseSplineAvatarConfig = {}): UseSplineAvatarReturn {
  const {
    enableMouseTracking = true,
    enableBioFeedback = false,
    enableAutoGestures = true,
    defaultEmotion = 'idle',
    onEmotionChange,
  } = config

  // State
  const [emotion, setEmotionState] = useState<AvatarEmotion>(defaultEmotion)
  const [mood, setMoodState] = useState<MoodState>('calm')
  const [isListening, setIsListeningState] = useState(false)
  const [isSpeaking, setIsSpeakingState] = useState(false)
  const [audioLevel, setAudioLevelState] = useState(0)
  const [currentGesture, setCurrentGesture] = useState<AvatarGesture | null>(null)
  const [bioFeedback, setBioFeedback] = useState<{ heartRate: number; stressLevel: number } | null>(
    null,
  )

  // Mouse tracking
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20 })
  const smoothY = useSpring(mouseY, { stiffness: 100, damping: 20 })

  // Normalized mouse position (-1 to 1)
  const normalizedMousePosition = useMemo(
    () => ({
      x: (mousePosition.x / (typeof window !== 'undefined' ? window.innerWidth : 1)) * 2 - 1,
      y: -((mousePosition.y / (typeof window !== 'undefined' ? window.innerHeight : 1)) * 2 - 1),
    }),
    [mousePosition],
  )

  // Avatar ref
  const avatarRef = useRef<SplineAvatarControllerRef | null>(null)

  // Audio analyzer for speaking
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioAnimationRef = useRef<number>(0)

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // MOUSE TRACKING
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!enableMouseTracking) return

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [enableMouseTracking, mouseX, mouseY])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // SETTERS WITH SIDE EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  const setEmotion = useCallback(
    (newEmotion: AvatarEmotion) => {
      setEmotionState(newEmotion)
      onEmotionChange?.(newEmotion)
      avatarRef.current?.setEmotion(newEmotion)
    },
    [onEmotionChange],
  )

  const setMood = useCallback(
    (newMood: MoodState) => {
      setMoodState(newMood)
      // Auto-set emotion based on mood
      const correspondingEmotion = MOOD_TO_EMOTION[newMood]
      if (correspondingEmotion) {
        setEmotion(correspondingEmotion)
      }
    },
    [setEmotion],
  )

  const setIsListening = useCallback((listening: boolean) => {
    setIsListeningState(listening)
    if (listening) {
      setEmotionState('listening')
    }
  }, [])

  const setIsSpeaking = useCallback((speaking: boolean) => {
    setIsSpeakingState(speaking)
    if (speaking) {
      setEmotionState('speaking')
    }
  }, [])

  const setAudioLevel = useCallback((level: number) => {
    setAudioLevelState(Math.min(1, Math.max(0, level)))
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  const triggerGesture = useCallback((gesture: AvatarGesture) => {
    setCurrentGesture(gesture)
    avatarRef.current?.triggerGesture(gesture)

    // Clear gesture after animation
    setTimeout(() => {
      setCurrentGesture(null)
    }, 2000)
  }, [])

  const startListening = useCallback(() => {
    setIsListening(true)
  }, [setIsListening])

  const stopListening = useCallback(() => {
    setIsListening(false)
    setEmotionState('idle')
  }, [setIsListening])

  const speak = useCallback(
    async (text: string) => {
      setIsSpeaking(true)
      setEmotion('speaking')

      // Simulate speaking with varying audio levels
      const words = text.split(' ')
      const avgWordDuration = 200 // ms per word

      for (let i = 0; i < words.length; i++) {
        const word = words[i] ?? ''
        const wordLevel = 0.3 + (word.length / 10) * 0.5 + Math.random() * 0.2
        setAudioLevel(wordLevel)
        await new Promise((resolve) => setTimeout(resolve, avgWordDuration))
      }

      setAudioLevel(0)
      setIsSpeaking(false)
      setEmotion('idle')
    },
    [setEmotion, setIsSpeaking, setAudioLevel],
  )

  const celebrate = useCallback(() => {
    setEmotion('euphoric')
    triggerGesture('celebrate')

    if (enableAutoGestures) {
      setTimeout(() => {
        setEmotion('success')
        triggerGesture('thumbsUp')
      }, 1500)
    }
  }, [setEmotion, triggerGesture, enableAutoGestures])

  const showAlert = useCallback(() => {
    setEmotion('alert')
    triggerGesture('wave')
  }, [setEmotion, triggerGesture])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // BIO-FEEDBACK SIMULATION
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!enableBioFeedback) return

    // Simulate bio-feedback data (in real implementation, connect to sensors)
    const interval = setInterval(() => {
      setBioFeedback({
        heartRate: 60 + Math.random() * 40,
        stressLevel: Math.random(),
      })
    }, 2000)

    return () => clearInterval(interval)
  }, [enableBioFeedback])

  // Adjust mood based on bio-feedback
  useEffect(() => {
    if (!bioFeedback) return

    const { heartRate, stressLevel } = bioFeedback

    if (heartRate > 90 || stressLevel > 0.7) {
      setMood('stress')
    } else if (heartRate > 80 || stressLevel > 0.5) {
      setMood('alert')
    } else if (heartRate < 65 && stressLevel < 0.3) {
      setMood('calm')
    } else {
      setMood('flow')
    }
  }, [bioFeedback, setMood])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // LOOK AT TARGET
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  const lookAtTarget = useMemo(
    () => ({
      x: smoothX.get() / (typeof window !== 'undefined' ? window.innerWidth : 1),
      y: smoothY.get() / (typeof window !== 'undefined' ? window.innerHeight : 1),
    }),
    [smoothX, smoothY],
  )

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  return {
    // State
    emotion,
    mood,
    isListening,
    isSpeaking,
    audioLevel,
    lookAtTarget,
    currentGesture,

    // Setters
    setEmotion,
    setMood,
    setIsListening,
    setIsSpeaking,
    setAudioLevel,

    // Actions
    triggerGesture,
    startListening,
    stopListening,
    speak,
    celebrate,
    showAlert,

    // Ref
    avatarRef,

    // Mouse tracking
    mousePosition,
    normalizedMousePosition,

    // Bio-feedback
    bioFeedback,
  }
}

export default useSplineAvatar
