/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧬 USE BIO FEEDBACK — Hook de Detección Bio-Emocional
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hook para detectar estado emocional del usuario mediante:
 * - Análisis de movimiento del mouse (agitación = stress)
 * - Velocidad de escritura
 * - Patrones de interacción
 * - Tiempo de inactividad
 *
 * Estados detectables:
 * - neutral: Estado base
 * - calm: Movimientos suaves, interacción pausada
 * - focused: Interacción consistente, sin pausa
 * - stressed: Movimientos rápidos/erráticos
 * - euphoric: Clics frecuentes, movimientos amplios
 * - tired: Inactividad prolongada, movimientos lentos
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type MoodState = 'neutral' | 'calm' | 'focused' | 'stressed' | 'euphoric' | 'tired'

export interface BioMetrics {
  mouseVelocity: number // pixels/second
  mouseAcceleration: number // rate of velocity change
  clickFrequency: number // clicks per minute
  typingSpeed: number // chars per minute
  idleTime: number // seconds since last interaction
  scrollIntensity: number // scroll speed
  interactionCount: number // total interactions in window
}

export interface BioFeedbackState {
  mood: MoodState
  stressLevel: number // 0-100
  focusLevel: number // 0-100
  energyLevel: number // 0-100
  confidence: number // detection confidence 0-1
  metrics: BioMetrics
  lastUpdate: Date
}

export interface UseBioFeedbackOptions {
  enabled?: boolean
  sampleWindow?: number // ms for metric calculation
  updateInterval?: number // ms between state updates
  onMoodChange?: (_mood: MoodState, _prev: MoodState) => void
}

export interface MoodColors {
  primary: string
  secondary: string
  glow: string
  blur: number
  particleSpeed: number
  animationDuration: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_SAMPLE_WINDOW = 5000 // 5 seconds
const DEFAULT_UPDATE_INTERVAL = 1000 // 1 second

const MOOD_COLORS: Record<MoodState, MoodColors> = {
  neutral: {
    primary: '#8B5CF6',
    secondary: '#EC4899',
    glow: 'rgba(139, 92, 246, 0.4)',
    blur: 50,
    particleSpeed: 1,
    animationDuration: 1,
  },
  calm: {
    primary: '#06B6D4',
    secondary: '#0891B2',
    glow: 'rgba(6, 182, 212, 0.3)',
    blur: 60,
    particleSpeed: 0.6,
    animationDuration: 1.5,
  },
  focused: {
    primary: '#10B981',
    secondary: '#059669',
    glow: 'rgba(16, 185, 129, 0.4)',
    blur: 45,
    particleSpeed: 0.8,
    animationDuration: 0.8,
  },
  stressed: {
    primary: '#EF4444',
    secondary: '#DC2626',
    glow: 'rgba(239, 68, 68, 0.5)',
    blur: 35,
    particleSpeed: 1.5,
    animationDuration: 0.5,
  },
  euphoric: {
    primary: '#FFD700',
    secondary: '#F59E0B',
    glow: 'rgba(255, 215, 0, 0.5)',
    blur: 40,
    particleSpeed: 1.3,
    animationDuration: 0.6,
  },
  tired: {
    primary: '#6366F1',
    secondary: '#4F46E5',
    glow: 'rgba(99, 102, 241, 0.3)',
    blur: 70,
    particleSpeed: 0.4,
    animationDuration: 2,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useBioFeedback(options: UseBioFeedbackOptions = {}) {
  const {
    enabled = true,
    sampleWindow = DEFAULT_SAMPLE_WINDOW,
    updateInterval = DEFAULT_UPDATE_INTERVAL,
    onMoodChange,
  } = options

  const [state, setState] = useState<BioFeedbackState>({
    mood: 'neutral',
    stressLevel: 30,
    focusLevel: 70,
    energyLevel: 60,
    confidence: 0.5,
    metrics: {
      mouseVelocity: 0,
      mouseAcceleration: 0,
      clickFrequency: 0,
      typingSpeed: 0,
      idleTime: 0,
      scrollIntensity: 0,
      interactionCount: 0,
    },
    lastUpdate: new Date(),
  })

  // Refs para tracking
  const mousePositionsRef = useRef<{ x: number; y: number; t: number }[]>([])
  const clickTimesRef = useRef<number[]>([])
  const keyTimesRef = useRef<number[]>([])
  const scrollEventsRef = useRef<{ delta: number; t: number }[]>([])
  const lastInteractionRef = useRef<number>(Date.now())
  const prevMoodRef = useRef<MoodState>('neutral')

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // EVENT HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const now = Date.now()
      lastInteractionRef.current = now

      mousePositionsRef.current.push({ x: e.clientX, y: e.clientY, t: now })

      // Limpiar datos antiguos
      const cutoff = now - sampleWindow
      mousePositionsRef.current = mousePositionsRef.current.filter((p) => p.t > cutoff)
    },
    [sampleWindow],
  )

  const handleClick = useCallback(() => {
    const now = Date.now()
    lastInteractionRef.current = now
    clickTimesRef.current.push(now)

    // Limpiar datos antiguos
    const cutoff = now - sampleWindow
    clickTimesRef.current = clickTimesRef.current.filter((t) => t > cutoff)
  }, [sampleWindow])

  const handleKeyPress = useCallback(() => {
    const now = Date.now()
    lastInteractionRef.current = now
    keyTimesRef.current.push(now)

    // Limpiar datos antiguos
    const cutoff = now - sampleWindow
    keyTimesRef.current = keyTimesRef.current.filter((t) => t > cutoff)
  }, [sampleWindow])

  const handleScroll = useCallback(
    (e: Event) => {
      const now = Date.now()
      lastInteractionRef.current = now

      const target = e.target as HTMLElement
      const delta = Math.abs(target.scrollTop || 0)

      scrollEventsRef.current.push({ delta, t: now })

      // Limpiar datos antiguos
      const cutoff = now - sampleWindow
      scrollEventsRef.current = scrollEventsRef.current.filter((s) => s.t > cutoff)
    },
    [sampleWindow],
  )

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // METRICS CALCULATION
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  const calculateMetrics = useCallback((): BioMetrics => {
    const now = Date.now()
    const positions = mousePositionsRef.current
    const clicks = clickTimesRef.current
    const keys = keyTimesRef.current
    const scrolls = scrollEventsRef.current

    // Mouse velocity (pixels/second)
    let mouseVelocity = 0
    let mouseAcceleration = 0

    if (positions.length >= 2) {
      const velocities: number[] = []

      for (let i = 1; i < positions.length; i++) {
        const current = positions[i]
        const previous = positions[i - 1]
        if (!current || !previous) continue

        const dx = current.x - previous.x
        const dy = current.y - previous.y
        const dt = (current.t - previous.t) / 1000 // seconds

        if (dt > 0) {
          const dist = Math.sqrt(dx * dx + dy * dy)
          velocities.push(dist / dt)
        }
      }

      if (velocities.length > 0) {
        mouseVelocity = velocities.reduce((a, b) => a + b, 0) / velocities.length
      }

      // Acceleration (rate of velocity change)
      if (velocities.length >= 2) {
        const accels: number[] = []
        for (let i = 1; i < velocities.length; i++) {
          const curr = velocities[i]
          const prev = velocities[i - 1]
          if (curr !== undefined && prev !== undefined) {
            accels.push(Math.abs(curr - prev))
          }
        }
        mouseAcceleration = accels.reduce((a, b) => a + b, 0) / accels.length
      }
    }

    // Click frequency (clicks per minute)
    const clickFrequency = clicks.length * (60000 / sampleWindow)

    // Typing speed (chars per minute)
    const typingSpeed = keys.length * (60000 / sampleWindow)

    // Idle time
    const idleTime = (now - lastInteractionRef.current) / 1000

    // Scroll intensity
    const scrollIntensity =
      scrolls.reduce((sum, s) => sum + s.delta, 0) / Math.max(scrolls.length, 1)

    // Total interactions
    const interactionCount = positions.length + clicks.length + keys.length + scrolls.length

    return {
      mouseVelocity,
      mouseAcceleration,
      clickFrequency,
      typingSpeed,
      idleTime,
      scrollIntensity,
      interactionCount,
    }
  }, [sampleWindow])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // MOOD DETECTION
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  const detectMood = useCallback(
    (
      metrics: BioMetrics,
    ): {
      mood: MoodState
      stressLevel: number
      focusLevel: number
      energyLevel: number
      confidence: number
    } => {
      const {
        mouseVelocity,
        mouseAcceleration,
        clickFrequency,
        typingSpeed,
        idleTime,
        interactionCount,
      } = metrics

      // Calcular niveles
      let stressLevel = 30 // Base
      let focusLevel = 50
      let energyLevel = 50
      let confidence = 0.5

      // Análisis de stress basado en velocidad/aceleración del mouse
      if (mouseVelocity > 1500 || mouseAcceleration > 500) {
        stressLevel += 30
      } else if (mouseVelocity > 800) {
        stressLevel += 15
      } else if (mouseVelocity < 200) {
        stressLevel -= 10
      }

      // Análisis de focus basado en consistencia de interacción
      if (typingSpeed > 100 && clickFrequency < 30) {
        focusLevel += 25
      }

      if (interactionCount > 50 && mouseAcceleration < 200) {
        focusLevel += 15
      }

      // Análisis de energía
      if (idleTime > 30) {
        energyLevel -= 30
      } else if (idleTime > 10) {
        energyLevel -= 15
      }

      if (clickFrequency > 60) {
        energyLevel += 20
      }

      // Clamp values
      stressLevel = Math.max(0, Math.min(100, stressLevel))
      focusLevel = Math.max(0, Math.min(100, focusLevel))
      energyLevel = Math.max(0, Math.min(100, energyLevel))

      // Determinar mood
      let mood: MoodState = 'neutral'

      if (idleTime > 60) {
        mood = 'tired'
        confidence = 0.8
      } else if (stressLevel > 60) {
        mood = 'stressed'
        confidence = 0.75
      } else if (focusLevel > 70 && stressLevel < 40) {
        mood = 'focused'
        confidence = 0.7
      } else if (energyLevel > 70 && clickFrequency > 40) {
        mood = 'euphoric'
        confidence = 0.65
      } else if (stressLevel < 30 && mouseVelocity < 400) {
        mood = 'calm'
        confidence = 0.7
      } else {
        mood = 'neutral'
        confidence = 0.5
      }

      return { mood, stressLevel, focusLevel, energyLevel, confidence }
    },
    [],
  )

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // UPDATE LOOP
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    window.addEventListener('keypress', handleKeyPress)
    window.addEventListener('scroll', handleScroll, true)

    // Update interval
    const intervalId = setInterval(() => {
      const metrics = calculateMetrics()
      const { mood, stressLevel, focusLevel, energyLevel, confidence } = detectMood(metrics)

      setState((prev) => {
        // Notificar cambio de mood
        if (mood !== prev.mood && onMoodChange) {
          onMoodChange(mood, prev.mood)
        }
        prevMoodRef.current = mood

        return {
          mood,
          stressLevel,
          focusLevel,
          energyLevel,
          confidence,
          metrics,
          lastUpdate: new Date(),
        }
      })
    }, updateInterval)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      window.removeEventListener('keypress', handleKeyPress)
      window.removeEventListener('scroll', handleScroll, true)
      clearInterval(intervalId)
    }
  }, [
    enabled,
    handleMouseMove,
    handleClick,
    handleKeyPress,
    handleScroll,
    calculateMetrics,
    detectMood,
    updateInterval,
    onMoodChange,
  ])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  const getMoodColors = useCallback((): MoodColors => {
    return MOOD_COLORS[state.mood]
  }, [state.mood])

  const getUIAdaptations = useCallback(() => {
    const colors = MOOD_COLORS[state.mood]

    return {
      // Blur más alto cuando stressed para "suavizar" la UI
      backdropBlur: colors.blur,
      // Animaciones más lentas cuando tired/calm
      animationSpeed: colors.animationDuration,
      // Partículas más rápidas cuando euphoric/stressed
      particleSpeed: colors.particleSpeed,
      // Glow color
      glowColor: colors.glow,
      // Colores principales
      primaryColor: colors.primary,
      secondaryColor: colors.secondary,
      // Sugerencias de UX
      shouldReduceAnimations: state.mood === 'tired' || state.stressLevel > 70,
      shouldShowCalmElements: state.mood === 'stressed',
      shouldBoostPositivity: state.mood === 'tired' || state.energyLevel < 40,
    }
  }, [state])

  const resetMetrics = useCallback(() => {
    mousePositionsRef.current = []
    clickTimesRef.current = []
    keyTimesRef.current = []
    scrollEventsRef.current = []
    lastInteractionRef.current = Date.now()
  }, [])

  return {
    state,
    getMoodColors,
    getUIAdaptations,
    resetMetrics,
    moodColors: MOOD_COLORS,
  }
}

export { MOOD_COLORS }
