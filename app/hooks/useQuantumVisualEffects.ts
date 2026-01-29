/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 USE QUANTUM VISUAL EFFECTS — CHRONOS INTEGRATION HOOK 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hook maestro que integra todos los efectos visuales premium:
 * - Mood state (calm → euphoric)
 * - MediaPipe pulse sync
 * - PostProcessing config
 * - Particle system control
 * - Color palette
 *
 * @version 1.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

"use client"

import { useCallback, useMemo } from "react"

import useMediaPipePulse from "@/app/hooks/useMediaPipePulse"
import useMood, { type MoodLevel } from "@/app/hooks/useMood"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface QuantumVisualConfig {
  /** Intensidad general de efectos 0-1 */
  intensity: number
  /** Habilitar particles */
  enableParticles: boolean
  /** Conteo de partículas */
  particleCount: number
  /** Habilitar post-processing */
  enablePostProcessing: boolean
  /** Habilitar god rays */
  enableGodRays: boolean
  /** Habilitar parallax */
  enableParallax: boolean
  /** Velocidad de animación base */
  animationSpeed: number
  /** Bloom intensity */
  bloomIntensity: number
  /** Chromatic aberration */
  chromaticAberration: number
}

export interface QuantumVisualReturn {
  // Mood state
  mood: number
  moodLevel: MoodLevel
  moodColor: string
  moodGradient: { start: string; end: string }

  // Pulse state
  pulse: number
  bpm: number
  isPulseActive: boolean

  // Visual config
  config: QuantumVisualConfig

  // Colores calculados
  primaryColor: string
  secondaryColor: string
  accentColor: string

  // Acciones
  setMood: (value: number) => void
  boostMood: (amount?: number) => void
  dampenMood: (amount?: number) => void
  triggerCelebration: () => void
  triggerAlert: () => void
  triggerPulseBeat: () => void
  resetMood: () => void
  updateConfig: (partial: Partial<QuantumVisualConfig>) => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES — Configuración por defecto
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: QuantumVisualConfig = {
  intensity: 1.0,
  enableParticles: true,
  particleCount: 500000,
  enablePostProcessing: true,
  enableGodRays: false,
  enableParallax: true,
  animationSpeed: 1.0,
  bloomIntensity: 1.5,
  chromaticAberration: 0.002,
}

// Paleta de colores Chronos
const COLORS = {
  calm: {
    primary: "#8B00FF",
    secondary: "#4B0082",
    accent: "#E040FB",
  },
  neutral: {
    primary: "#9D4EDD",
    secondary: "#7B2CBF",
    accent: "#BA68C8",
  },
  engaged: {
    primary: "#C77DFF",
    secondary: "#9D4EDD",
    accent: "#E1BEE7",
  },
  excited: {
    primary: "#FFAA00",
    secondary: "#FF8800",
    accent: "#FFD54F",
  },
  euphoric: {
    primary: "#FFD700",
    secondary: "#FFA500",
    accent: "#FFEB3B",
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function lerpColor(color1: string, color2: string, t: number): string {
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

export function useQuantumVisualEffects(
  initialConfig: Partial<QuantumVisualConfig> = {}
): QuantumVisualReturn {
  // Combinar config con defaults
  const configRef = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...initialConfig }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  // Hooks de estado
  const {
    mood,
    moodLevel,
    moodColor,
    moodGradient,
    setMood,
    boost: boostMood,
    dampen: dampenMood,
    celebrate: triggerCelebration,
    alert: triggerAlert,
    reset: resetMood,
  } = useMood()

  const { pulse, bpm, isActive: isPulseActive, triggerBeat: triggerPulseBeat } = useMediaPipePulse()

  // Colores calculados basados en mood
  const { primaryColor, secondaryColor, accentColor } = useMemo(() => {
    const colors = COLORS[moodLevel]
    return {
      primaryColor: lerpColor(COLORS.calm.primary, COLORS.euphoric.primary, mood),
      secondaryColor: colors.secondary,
      accentColor: colors.accent,
    }
  }, [mood, moodLevel])

  // Config actualizable
  const updateConfig = useCallback(
    (partial: Partial<QuantumVisualConfig>) => {
      Object.assign(configRef, partial)
    },
    [configRef]
  )

  return {
    // Mood
    mood,
    moodLevel,
    moodColor,
    moodGradient,

    // Pulse
    pulse,
    bpm,
    isPulseActive,

    // Config
    config: configRef,

    // Colores
    primaryColor,
    secondaryColor,
    accentColor,

    // Acciones
    setMood,
    boostMood,
    dampenMood,
    triggerCelebration,
    triggerAlert,
    triggerPulseBeat,
    resetMood,
    updateConfig,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESETS DE CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const VISUAL_PRESETS = {
  /** Performance mode - menos efectos, más FPS */
  performance: {
    intensity: 0.7,
    enableParticles: false,
    particleCount: 50000,
    enablePostProcessing: false,
    enableGodRays: false,
    enableParallax: false,
    animationSpeed: 1.0,
    bloomIntensity: 1.0,
    chromaticAberration: 0,
  } as QuantumVisualConfig,

  /** Balanced - equilibrio calidad/rendimiento */
  balanced: {
    intensity: 0.9,
    enableParticles: true,
    particleCount: 200000,
    enablePostProcessing: true,
    enableGodRays: false,
    enableParallax: true,
    animationSpeed: 1.0,
    bloomIntensity: 1.2,
    chromaticAberration: 0.001,
  } as QuantumVisualConfig,

  /** Cinematico - máxima calidad visual */
  cinematic: {
    intensity: 1.0,
    enableParticles: true,
    particleCount: 1000000,
    enablePostProcessing: true,
    enableGodRays: true,
    enableParallax: true,
    animationSpeed: 1.0,
    bloomIntensity: 2.0,
    chromaticAberration: 0.003,
  } as QuantumVisualConfig,

  /** Ultra - para GPUs potentes */
  ultra: {
    intensity: 1.0,
    enableParticles: true,
    particleCount: 2000000,
    enablePostProcessing: true,
    enableGodRays: true,
    enableParallax: true,
    animationSpeed: 1.0,
    bloomIntensity: 2.5,
    chromaticAberration: 0.004,
  } as QuantumVisualConfig,
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type { MoodLevel }
export default useQuantumVisualEffects
