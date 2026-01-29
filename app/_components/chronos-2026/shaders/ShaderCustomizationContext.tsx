'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎛️ SHADER CUSTOMIZATION SYSTEM — CHRONOS ELITE 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de personalización de shaders con:
 * - Context global para configuración compartida
 * - Presets temáticos (Aurora, Cosmic, Minimal, etc.)
 * - Persistencia en localStorage
 * - Hook useShaderCustomization para acceso fácil
 * - Componente de UI para controles visuales
 *
 * @version 4.0.0 SUPREME ELITE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ShaderCustomization {
  // General
  enabled: boolean
  intensity: number // 0-1
  quality: 'low' | 'medium' | 'high' | 'ultra'

  // Colors
  colorPrimary: [number, number, number] // RGB normalized 0-1
  colorSecondary: [number, number, number]
  colorAccent: [number, number, number]

  // Particles
  particleCount: number
  particleSize: number
  particleSpeed: number
  particleShape: 0 | 1 | 2 | 3 // circle, star, diamond, glow

  // Effects
  turbulence: number
  waveAmplitude: number
  pulseIntensity: number
  bloomIntensity: number
  chromaticAberration: number

  // Interaction
  mouseAttraction: number
  mouseRadius: number
  scrollParallax: boolean

  // Mood (affects color mixing)
  mood: number // -1 to 1 (stress to euphoric)

  // Performance
  autoReduceQuality: boolean
  pauseWhenHidden: boolean
}

export interface ShaderThemePreset {
  name: string
  description: string
  icon: string
  config: Partial<ShaderCustomization>
}

type ShaderAction =
  | { type: 'SET_ENABLED'; payload: boolean }
  | { type: 'SET_INTENSITY'; payload: number }
  | { type: 'SET_QUALITY'; payload: ShaderCustomization['quality'] }
  | { type: 'SET_COLOR_PRIMARY'; payload: [number, number, number] }
  | { type: 'SET_COLOR_SECONDARY'; payload: [number, number, number] }
  | { type: 'SET_COLOR_ACCENT'; payload: [number, number, number] }
  | { type: 'SET_PARTICLE_COUNT'; payload: number }
  | { type: 'SET_PARTICLE_SIZE'; payload: number }
  | { type: 'SET_PARTICLE_SPEED'; payload: number }
  | { type: 'SET_PARTICLE_SHAPE'; payload: 0 | 1 | 2 | 3 }
  | { type: 'SET_TURBULENCE'; payload: number }
  | { type: 'SET_WAVE_AMPLITUDE'; payload: number }
  | { type: 'SET_PULSE_INTENSITY'; payload: number }
  | { type: 'SET_BLOOM_INTENSITY'; payload: number }
  | { type: 'SET_CHROMATIC_ABERRATION'; payload: number }
  | { type: 'SET_MOUSE_ATTRACTION'; payload: number }
  | { type: 'SET_MOUSE_RADIUS'; payload: number }
  | { type: 'SET_SCROLL_PARALLAX'; payload: boolean }
  | { type: 'SET_MOOD'; payload: number }
  | { type: 'SET_AUTO_REDUCE_QUALITY'; payload: boolean }
  | { type: 'SET_PAUSE_WHEN_HIDDEN'; payload: boolean }
  | { type: 'APPLY_PRESET'; payload: Partial<ShaderCustomization> }
  | { type: 'RESET_TO_DEFAULT' }

interface ShaderContextValue {
  config: ShaderCustomization
  dispatch: React.Dispatch<ShaderAction>
  applyPreset: (preset: ShaderThemePreset) => void
  resetToDefault: () => void
  getUniformValues: () => Record<string, unknown>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: ShaderCustomization = {
  enabled: true,
  intensity: 0.8,
  quality: 'high',

  colorPrimary: [0.545, 0.0, 1.0], // Violeta eléctrico #8B00FF
  colorSecondary: [1.0, 0.843, 0.0], // Oro premium #FFD700
  colorAccent: [1.0, 0.078, 0.576], // Plasma fucsia #FF1493

  particleCount: 5000,
  particleSize: 1.0,
  particleSpeed: 1.0,
  particleShape: 0,

  turbulence: 0.5,
  waveAmplitude: 0.1,
  pulseIntensity: 0.8,
  bloomIntensity: 1.0,
  chromaticAberration: 0.2,

  mouseAttraction: 0.3,
  mouseRadius: 0.5,
  scrollParallax: true,

  mood: 0,

  autoReduceQuality: true,
  pauseWhenHidden: true,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// THEME PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SHADER_PRESETS: Record<string, ShaderThemePreset> = {
  aurora: {
    name: 'Aurora Boreal',
    description: 'Efectos etéreos con colores violeta y fucsia',
    icon: '🌌',
    config: {
      colorPrimary: [0.545, 0.0, 1.0],
      colorSecondary: [0.753, 0.518, 0.988],
      colorAccent: [1.0, 0.078, 0.576],
      turbulence: 0.4,
      waveAmplitude: 0.12,
      particleShape: 3,
      bloomIntensity: 1.2,
    },
  },

  goldRush: {
    name: 'Gold Rush',
    description: 'Partículas doradas con destellos premium',
    icon: '✨',
    config: {
      colorPrimary: [1.0, 0.843, 0.0],
      colorSecondary: [0.996, 0.682, 0.259],
      colorAccent: [1.0, 0.95, 0.8],
      turbulence: 0.3,
      particleShape: 1,
      bloomIntensity: 1.5,
      mood: 0.5,
    },
  },

  plasma: {
    name: 'Plasma Storm',
    description: 'Energía intensa con colores vibrantes',
    icon: '⚡',
    config: {
      colorPrimary: [1.0, 0.078, 0.576],
      colorSecondary: [0.545, 0.0, 1.0],
      colorAccent: [1.0, 0.3, 0.4],
      turbulence: 0.8,
      waveAmplitude: 0.18,
      particleSpeed: 1.4,
      particleShape: 2,
      mood: -0.3,
    },
  },

  cosmic: {
    name: 'Cosmic Void',
    description: 'Profundidad espacial con partículas sutiles',
    icon: '🌠',
    config: {
      colorPrimary: [0.3, 0.2, 0.5],
      colorSecondary: [0.545, 0.0, 1.0],
      colorAccent: [0.753, 0.518, 0.988],
      intensity: 0.6,
      turbulence: 0.2,
      particleCount: 8000,
      particleSize: 0.7,
      bloomIntensity: 0.8,
    },
  },

  minimal: {
    name: 'Minimal',
    description: 'Efectos sutiles para máximo rendimiento',
    icon: '🔘',
    config: {
      intensity: 0.4,
      particleCount: 2000,
      particleSize: 0.8,
      turbulence: 0.2,
      waveAmplitude: 0.05,
      bloomIntensity: 0.5,
      chromaticAberration: 0,
    },
  },

  neon: {
    name: 'Neon Nights',
    description: 'Estilo cyberpunk con colores neón',
    icon: '🌃',
    config: {
      colorPrimary: [0.545, 0.0, 1.0],
      colorSecondary: [1.0, 0.078, 0.576],
      colorAccent: [1.0, 0.843, 0.0],
      turbulence: 0.6,
      bloomIntensity: 1.8,
      chromaticAberration: 0.4,
      particleShape: 0,
    },
  },

  rose: {
    name: 'Rose Gold',
    description: 'Elegancia suave con tonos rosados',
    icon: '🌸',
    config: {
      colorPrimary: [0.984, 0.471, 0.659],
      colorSecondary: [1.0, 0.843, 0.0],
      colorAccent: [0.753, 0.518, 0.988],
      turbulence: 0.3,
      waveAmplitude: 0.08,
      particleShape: 3,
      mood: 0.3,
    },
  },

  performance: {
    name: 'Performance Mode',
    description: 'Optimizado para dispositivos de bajo rendimiento',
    icon: '🚀',
    config: {
      quality: 'low',
      particleCount: 1000,
      particleSize: 1.0,
      turbulence: 0.1,
      waveAmplitude: 0,
      bloomIntensity: 0.3,
      chromaticAberration: 0,
      autoReduceQuality: true,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function shaderReducer(state: ShaderCustomization, action: ShaderAction): ShaderCustomization {
  switch (action.type) {
    case 'SET_ENABLED':
      return { ...state, enabled: action.payload }
    case 'SET_INTENSITY':
      return { ...state, intensity: Math.max(0, Math.min(1, action.payload)) }
    case 'SET_QUALITY':
      return { ...state, quality: action.payload }
    case 'SET_COLOR_PRIMARY':
      return { ...state, colorPrimary: action.payload }
    case 'SET_COLOR_SECONDARY':
      return { ...state, colorSecondary: action.payload }
    case 'SET_COLOR_ACCENT':
      return { ...state, colorAccent: action.payload }
    case 'SET_PARTICLE_COUNT':
      return { ...state, particleCount: Math.max(100, Math.min(20000, action.payload)) }
    case 'SET_PARTICLE_SIZE':
      return { ...state, particleSize: Math.max(0.1, Math.min(3, action.payload)) }
    case 'SET_PARTICLE_SPEED':
      return { ...state, particleSpeed: Math.max(0, Math.min(3, action.payload)) }
    case 'SET_PARTICLE_SHAPE':
      return { ...state, particleShape: action.payload }
    case 'SET_TURBULENCE':
      return { ...state, turbulence: Math.max(0, Math.min(1, action.payload)) }
    case 'SET_WAVE_AMPLITUDE':
      return { ...state, waveAmplitude: Math.max(0, Math.min(0.5, action.payload)) }
    case 'SET_PULSE_INTENSITY':
      return { ...state, pulseIntensity: Math.max(0, Math.min(2, action.payload)) }
    case 'SET_BLOOM_INTENSITY':
      return { ...state, bloomIntensity: Math.max(0, Math.min(3, action.payload)) }
    case 'SET_CHROMATIC_ABERRATION':
      return { ...state, chromaticAberration: Math.max(0, Math.min(1, action.payload)) }
    case 'SET_MOUSE_ATTRACTION':
      return { ...state, mouseAttraction: Math.max(0, Math.min(1, action.payload)) }
    case 'SET_MOUSE_RADIUS':
      return { ...state, mouseRadius: Math.max(0.1, Math.min(2, action.payload)) }
    case 'SET_SCROLL_PARALLAX':
      return { ...state, scrollParallax: action.payload }
    case 'SET_MOOD':
      return { ...state, mood: Math.max(-1, Math.min(1, action.payload)) }
    case 'SET_AUTO_REDUCE_QUALITY':
      return { ...state, autoReduceQuality: action.payload }
    case 'SET_PAUSE_WHEN_HIDDEN':
      return { ...state, pauseWhenHidden: action.payload }
    case 'APPLY_PRESET':
      return { ...state, ...action.payload }
    case 'RESET_TO_DEFAULT':
      return { ...DEFAULT_CONFIG }
    default:
      return state
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ShaderContext = createContext<ShaderContextValue | null>(null)

const STORAGE_KEY = 'chronos-shader-config'

export function ShaderCustomizationProvider({ children }: { children: React.ReactNode }) {
  // Load initial state from localStorage
  const [config, dispatch] = useReducer(shaderReducer, DEFAULT_CONFIG, (initial) => {
    if (typeof window === 'undefined') return initial

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return { ...initial, ...JSON.parse(saved) }
      }
    } catch {
      // Ignore errors
    }
    return initial
  })

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      // Ignore errors
    }
  }, [config])

  // Auto-reduce quality based on device
  useEffect(() => {
    if (!config.autoReduceQuality) return

    // Check for low-end devices
    const isLowEnd =
      (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

    if (isLowEnd && config.quality !== 'low') {
      dispatch({ type: 'SET_QUALITY', payload: 'low' })
      dispatch({ type: 'SET_PARTICLE_COUNT', payload: 2000 })
    }
  }, [config.autoReduceQuality, config.quality])

  // Apply preset
  const applyPreset = useCallback((preset: ShaderThemePreset) => {
    dispatch({ type: 'APPLY_PRESET', payload: preset.config })
  }, [])

  // Reset to default
  const resetToDefault = useCallback(() => {
    dispatch({ type: 'RESET_TO_DEFAULT' })
  }, [])

  // Get uniform values for shaders
  const getUniformValues = useCallback(() => {
    const qualityMultipliers = {
      low: 0.5,
      medium: 0.75,
      high: 1.0,
      ultra: 1.25,
    }
    const qm = qualityMultipliers[config.quality]

    return {
      uSpeed: config.particleSpeed,
      uTurbulence: config.turbulence * qm,
      uAttraction: config.mouseAttraction,
      uPulseIntensity: config.pulseIntensity,
      uWaveAmplitude: config.waveAmplitude,
      uMood: config.mood,
      uColorPrimary: config.colorPrimary,
      uColorSecondary: config.colorSecondary,
      uColorAccent: config.colorAccent,
      uInteractionRadius: config.mouseRadius,
      uParticleScale: config.particleSize * qm,
      uParticleShape: config.particleShape,
      uBloomIntensity: config.bloomIntensity * qm,
      uCoreIntensity: 1.5,
      uSoftEdge: 0.2,
      uChromaticAberration: config.chromaticAberration,
    }
  }, [config])

  const value = useMemo(
    () => ({
      config,
      dispatch,
      applyPreset,
      resetToDefault,
      getUniformValues,
    }),
    [config, applyPreset, resetToDefault, getUniformValues],
  )

  return <ShaderContext.Provider value={value}>{children}</ShaderContext.Provider>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useShaderCustomization() {
  const context = useContext(ShaderContext)

  if (!context) {
    throw new Error('useShaderCustomization must be used within ShaderCustomizationProvider')
  }

  const { config, dispatch, applyPreset, resetToDefault, getUniformValues } = context

  // Convenience setters
  const setEnabled = useCallback(
    (enabled: boolean) => {
      dispatch({ type: 'SET_ENABLED', payload: enabled })
    },
    [dispatch],
  )

  const setIntensity = useCallback(
    (intensity: number) => {
      dispatch({ type: 'SET_INTENSITY', payload: intensity })
    },
    [dispatch],
  )

  const setQuality = useCallback(
    (quality: ShaderCustomization['quality']) => {
      dispatch({ type: 'SET_QUALITY', payload: quality })
    },
    [dispatch],
  )

  const setColorPrimary = useCallback(
    (color: [number, number, number]) => {
      dispatch({ type: 'SET_COLOR_PRIMARY', payload: color })
    },
    [dispatch],
  )

  const setColorSecondary = useCallback(
    (color: [number, number, number]) => {
      dispatch({ type: 'SET_COLOR_SECONDARY', payload: color })
    },
    [dispatch],
  )

  const setColorAccent = useCallback(
    (color: [number, number, number]) => {
      dispatch({ type: 'SET_COLOR_ACCENT', payload: color })
    },
    [dispatch],
  )

  const setParticleCount = useCallback(
    (count: number) => {
      dispatch({ type: 'SET_PARTICLE_COUNT', payload: count })
    },
    [dispatch],
  )

  const setParticleSize = useCallback(
    (size: number) => {
      dispatch({ type: 'SET_PARTICLE_SIZE', payload: size })
    },
    [dispatch],
  )

  const setParticleSpeed = useCallback(
    (speed: number) => {
      dispatch({ type: 'SET_PARTICLE_SPEED', payload: speed })
    },
    [dispatch],
  )

  const setParticleShape = useCallback(
    (shape: 0 | 1 | 2 | 3) => {
      dispatch({ type: 'SET_PARTICLE_SHAPE', payload: shape })
    },
    [dispatch],
  )

  const setTurbulence = useCallback(
    (turbulence: number) => {
      dispatch({ type: 'SET_TURBULENCE', payload: turbulence })
    },
    [dispatch],
  )

  const setWaveAmplitude = useCallback(
    (amplitude: number) => {
      dispatch({ type: 'SET_WAVE_AMPLITUDE', payload: amplitude })
    },
    [dispatch],
  )

  const setPulseIntensity = useCallback(
    (intensity: number) => {
      dispatch({ type: 'SET_PULSE_INTENSITY', payload: intensity })
    },
    [dispatch],
  )

  const setBloomIntensity = useCallback(
    (intensity: number) => {
      dispatch({ type: 'SET_BLOOM_INTENSITY', payload: intensity })
    },
    [dispatch],
  )

  const setChromaticAberration = useCallback(
    (aberration: number) => {
      dispatch({ type: 'SET_CHROMATIC_ABERRATION', payload: aberration })
    },
    [dispatch],
  )

  const setMouseAttraction = useCallback(
    (attraction: number) => {
      dispatch({ type: 'SET_MOUSE_ATTRACTION', payload: attraction })
    },
    [dispatch],
  )

  const setMouseRadius = useCallback(
    (radius: number) => {
      dispatch({ type: 'SET_MOUSE_RADIUS', payload: radius })
    },
    [dispatch],
  )

  const setScrollParallax = useCallback(
    (enabled: boolean) => {
      dispatch({ type: 'SET_SCROLL_PARALLAX', payload: enabled })
    },
    [dispatch],
  )

  const setMood = useCallback(
    (mood: number) => {
      dispatch({ type: 'SET_MOOD', payload: mood })
    },
    [dispatch],
  )

  return {
    // Config
    config,
    enabled: config.enabled,

    // Setters
    setEnabled,
    setIntensity,
    setQuality,
    setColorPrimary,
    setColorSecondary,
    setColorAccent,
    setParticleCount,
    setParticleSize,
    setParticleSpeed,
    setParticleShape,
    setTurbulence,
    setWaveAmplitude,
    setPulseIntensity,
    setBloomIntensity,
    setChromaticAberration,
    setMouseAttraction,
    setMouseRadius,
    setScrollParallax,
    setMood,

    // Utilities
    applyPreset,
    resetToDefault,
    getUniformValues,

    // Presets
    presets: SHADER_PRESETS,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COLOR UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return [0, 0, 0]
  return [
    parseInt(result[1] ?? '0', 16) / 255,
    parseInt(result[2] ?? '0', 16) / 255,
    parseInt(result[3] ?? '0', 16) / 255,
  ]
}

export function rgbToHex(rgb: [number, number, number]): string {
  const toHex = (n: number) => {
    const hex = Math.round(n * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`
}

export default useShaderCustomization
