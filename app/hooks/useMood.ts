/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎭 USE MOOD — ADAPTIVE MOOD STATE HOOK 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hook para gestión de estado de ánimo adaptativo en Chronos.
 * Controla transiciones visuales calm→euphoric basadas en:
 * - Datos financieros (ganancias/pérdidas)
 * - Eventos del sistema (celebraciones, alertas)
 * - Interacciones del usuario
 * - Tiempo del día
 *
 * @version 1.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { logger } from "@/app/lib/utils/logger"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type MoodLevel = "calm" | "neutral" | "engaged" | "excited" | "euphoric"

export interface MoodConfig {
  /** Valor inicial 0-1 (default 0.3) */
  initialMood?: number
  /** Transición suave en ms (default 2000) */
  transitionDuration?: number
  /** Decay automático hacia neutral (default true) */
  autoDecay?: boolean
  /** Velocidad de decay 0-1 (default 0.01) */
  decayRate?: number
  /** Callback cuando cambia el mood */
  onMoodChange?: (mood: number, level: MoodLevel) => void
}

export interface MoodReturn {
  /** Valor del mood 0-1 (0=calm violeta, 1=euphoric oro) */
  mood: number
  /** Nivel discreto del mood */
  moodLevel: MoodLevel
  /** Color actual basado en mood (hex) */
  moodColor: string
  /** Colores del gradiente actual */
  moodGradient: { start: string; end: string }
  /** Intensidad de efectos visuales 0-1 */
  visualIntensity: number
  /** Setear mood manualmente */
  setMood: (value: number) => void
  /** Incrementar mood (eventos positivos) */
  boost: (amount?: number) => void
  /** Decrementar mood (eventos negativos) */
  dampen: (amount?: number) => void
  /** Trigger celebración (euphoric temporal) */
  celebrate: () => void
  /** Trigger alerta (cambio dramático temporal) */
  alert: () => void
  /** Reset a neutral */
  reset: () => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES — Paleta de colores Chronos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MOOD_COLORS = {
  calm: {
    primary: "#8B00FF", // Violeta profundo
    secondary: "#4B0082", // Índigo
    gradient: { start: "#2D0066", end: "#8B00FF" },
  },
  neutral: {
    primary: "#9D4EDD", // Violeta medio
    secondary: "#7B2CBF", // Violeta oscuro
    gradient: { start: "#4B0082", end: "#9D4EDD" },
  },
  engaged: {
    primary: "#C77DFF", // Violeta claro
    secondary: "#E0AAFF", // Lavanda
    gradient: { start: "#7B2CBF", end: "#E0AAFF" },
  },
  excited: {
    primary: "#FFAA00", // Naranja dorado
    secondary: "#FF8800", // Naranja
    gradient: { start: "#C77DFF", end: "#FFAA00" },
  },
  euphoric: {
    primary: "#FFD700", // Oro
    secondary: "#FFA500", // Naranja intenso
    gradient: { start: "#FFD700", end: "#FF6B00" },
  },
}

const MOOD_THRESHOLDS = {
  calm: 0.2,
  neutral: 0.4,
  engaged: 0.6,
  excited: 0.8,
  euphoric: 1.0,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function getMoodLevel(value: number): MoodLevel {
  if (value < MOOD_THRESHOLDS.calm) return "calm"
  if (value < MOOD_THRESHOLDS.neutral) return "neutral"
  if (value < MOOD_THRESHOLDS.engaged) return "engaged"
  if (value < MOOD_THRESHOLDS.excited) return "excited"
  return "euphoric"
}

function lerpColor(color1: string, color2: string, t: number): string {
  // Parse hex colors
  const c1 = parseInt(color1.slice(1), 16)
  const c2 = parseInt(color2.slice(1), 16)

  const r1 = (c1 >> 16) & 255
  const g1 = (c1 >> 8) & 255
  const b1 = c1 & 255

  const r2 = (c2 >> 16) & 255
  const g2 = (c2 >> 8) & 255
  const b2 = c2 & 255

  const r = Math.round(r1 + (r2 - r1) * t)
  const g = Math.round(g1 + (g2 - g1) * t)
  const b = Math.round(b1 + (b2 - b1) * t)

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useMood(config: MoodConfig = {}): MoodReturn {
  const {
    initialMood = 0.3,
    transitionDuration = 2000,
    autoDecay = true,
    decayRate = 0.01,
    onMoodChange,
  } = config

  // Estado
  const [mood, setMoodInternal] = useState(initialMood)
  const [targetMood, setTargetMood] = useState(initialMood)

  // Refs
  const animationRef = useRef<number | null>(null)
  const lastUpdateRef = useRef<number>(Date.now())

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // VALORES COMPUTADOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  const moodLevel = useMemo(() => getMoodLevel(mood), [mood])

  const moodColor = useMemo(() => {
    // Interpolación de colores basada en mood
    if (mood < 0.5) {
      // Calm → Neutral → Engaged (violetas)
      const t = mood / 0.5
      return lerpColor(MOOD_COLORS.calm.primary, MOOD_COLORS.engaged.primary, t)
    } else {
      // Engaged → Excited → Euphoric (violeta → oro)
      const t = (mood - 0.5) / 0.5
      return lerpColor(MOOD_COLORS.engaged.primary, MOOD_COLORS.euphoric.primary, t)
    }
  }, [mood])

  const moodGradient = useMemo(() => {
    const colors = MOOD_COLORS[moodLevel]
    return colors.gradient
  }, [moodLevel])

  const visualIntensity = useMemo(() => {
    // Intensidad visual aumenta con mood
    return 0.5 + mood * 0.5
  }, [mood])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ANIMACIÓN DE TRANSICIÓN
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  const animateMood = useCallback(() => {
    const now = Date.now()
    const delta = (now - lastUpdateRef.current) / transitionDuration
    lastUpdateRef.current = now

    setMoodInternal((current) => {
      const diff = targetMood - current

      // Si estamos cerca del target, snap
      if (Math.abs(diff) < 0.001) {
        return targetMood
      }

      // Interpolación suave (easing)
      const newMood = current + diff * Math.min(delta * 5, 0.1)
      return Math.max(0, Math.min(1, newMood))
    })

    animationRef.current = requestAnimationFrame(animateMood)
  }, [targetMood, transitionDuration])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // DECAY AUTOMÁTICO
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!autoDecay) return

    const decayInterval = setInterval(() => {
      setTargetMood((current) => {
        const neutral = 0.3
        const diff = neutral - current

        if (Math.abs(diff) < 0.01) return current

        // Decay hacia neutral más lento
        return current + diff * decayRate
      })
    }, 100)

    return () => clearInterval(decayInterval)
  }, [autoDecay, decayRate])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // EFECTOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  // Start animation loop
  useEffect(() => {
    lastUpdateRef.current = Date.now()
    animationRef.current = requestAnimationFrame(animateMood)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [animateMood])

  // Notify on mood change
  useEffect(() => {
    onMoodChange?.(mood, moodLevel)
  }, [mood, moodLevel, onMoodChange])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ACCIONES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  const setMood = useCallback((value: number) => {
    const clamped = Math.max(0, Math.min(1, value))
    setTargetMood(clamped)
    logger.info(`Mood set to ${clamped.toFixed(2)}`, { context: "useMood" })
  }, [])

  const boost = useCallback((amount: number = 0.1) => {
    setTargetMood((current) => Math.min(1, current + amount))
    logger.info(`Mood boosted by ${amount}`, { context: "useMood" })
  }, [])

  const dampen = useCallback((amount: number = 0.1) => {
    setTargetMood((current) => Math.max(0, current - amount))
    logger.info(`Mood dampened by ${amount}`, { context: "useMood" })
  }, [])

  const celebrate = useCallback(() => {
    // Spike a euphoric, luego decay natural
    setTargetMood(1.0)
    setMoodInternal(0.9) // Salto instantáneo parcial para impacto

    logger.info("🎉 Celebration triggered!", { context: "useMood" })

    // Auto decay después de 3 segundos
    setTimeout(() => {
      setTargetMood(0.6) // Bajar a engaged tras celebración
    }, 3000)
  }, [])

  const alert = useCallback(() => {
    // Cambio dramático para alertas
    const currentMood = mood
    setMoodInternal(0.1) // Spike bajo

    logger.warn("⚠️ Alert triggered!", { context: "useMood" })

    setTimeout(() => {
      setTargetMood(currentMood) // Volver al estado anterior
    }, 1000)
  }, [mood])

  const reset = useCallback(() => {
    setTargetMood(0.3)
    logger.info("Mood reset to neutral", { context: "useMood" })
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  return {
    mood,
    moodLevel,
    moodColor,
    moodGradient,
    visualIntensity,
    setMood,
    boost,
    dampen,
    celebrate,
    alert,
    reset,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORT DEFAULT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default useMood
