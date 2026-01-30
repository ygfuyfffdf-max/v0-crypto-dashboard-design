/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎛️ CHRONOS 2026 — MOTION PREFERENCES HOOK
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hook para controlar las preferencias de movimiento y efectos visuales:
 * - Detectar prefers-reduced-motion del sistema
 * - Deshabilitar efectos 3D/parallax problemáticos
 * - Controlar intensidad de animaciones
 * - Persistir preferencias del usuario
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useCallback, useEffect, useMemo, useState, createContext, useContext, ReactNode } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface MotionPreferences {
  /** Si se debe reducir el movimiento (sistema o usuario) */
  reducedMotion: boolean
  /** Si el usuario prefiere reducir (override del sistema) */
  userPrefersReduced: boolean | null
  /** Si se deben deshabilitar efectos 3D (tilt, parallax con cursor) */
  disable3DEffects: boolean
  /** Si se deben deshabilitar efectos parallax */
  disableParallax: boolean
  /** Si se deben deshabilitar efectos de hover inmersivos */
  disableImmersiveHover: boolean
  /** Intensidad de las animaciones (0-1) */
  animationIntensity: number
  /** Duración multiplicador (1 = normal, 0.5 = rápido, 2 = lento) */
  durationMultiplier: number
  /** Si se deben deshabilitar partículas y efectos decorativos */
  disableDecorativeEffects: boolean
  /** Si el dispositivo es móvil */
  isMobile: boolean
  /** Si el dispositivo soporta hover real */
  supportsHover: boolean
}

export interface MotionPreferencesActions {
  /** Toggle reducción de movimiento manual */
  toggleReducedMotion: () => void
  /** Establecer intensidad de animaciones */
  setAnimationIntensity: (intensity: number) => void
  /** Toggle efectos 3D */
  toggle3DEffects: () => void
  /** Toggle efectos parallax */
  toggleParallax: () => void
  /** Toggle efectos decorativos */
  toggleDecorativeEffects: () => void
  /** Resetear a valores por defecto */
  resetToDefaults: () => void
  /** Aplicar preset de accesibilidad */
  applyAccessibilityPreset: () => void
  /** Aplicar preset de rendimiento */
  applyPerformancePreset: () => void
}

export interface UseMotionPreferencesReturn extends MotionPreferences, MotionPreferencesActions {}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'chronos-motion-preferences'

const DEFAULT_PREFERENCES: Omit<MotionPreferences, 'reducedMotion' | 'isMobile' | 'supportsHover'> = {
  userPrefersReduced: null,
  disable3DEffects: true, // Por defecto deshabilitado por problemas con cursor
  disableParallax: true,  // Por defecto deshabilitado
  disableImmersiveHover: true, // Por defecto deshabilitado
  animationIntensity: 1,
  durationMultiplier: 1,
  disableDecorativeEffects: false,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXTO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MotionPreferencesContext = createContext<UseMotionPreferencesReturn | null>(null)

export const useMotionPreferences = () => {
  const context = useContext(MotionPreferencesContext)
  if (!context) {
    throw new Error('useMotionPreferences must be used within MotionPreferencesProvider')
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MotionPreferencesProviderProps {
  children: ReactNode
  /** Forzar preferencias iniciales */
  initialPreferences?: Partial<MotionPreferences>
}

export function MotionPreferencesProvider({
  children,
  initialPreferences,
}: MotionPreferencesProviderProps) {
  const value = useMotionPreferencesInternal(initialPreferences)

  return (
    <MotionPreferencesContext.Provider value={value}>
      {children}
    </MotionPreferencesContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK INTERNO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function useMotionPreferencesInternal(
  initialPreferences?: Partial<MotionPreferences>
): UseMotionPreferencesReturn {
  // Detectar prefers-reduced-motion del sistema
  const [systemReduced, setSystemReduced] = useState(false)

  // Detectar dispositivo móvil
  const [isMobile, setIsMobile] = useState(false)

  // Detectar soporte de hover
  const [supportsHover, setSupportsHover] = useState(true)

  // Preferencias del usuario
  const [preferences, setPreferences] = useState<Omit<MotionPreferences, 'reducedMotion' | 'isMobile' | 'supportsHover'>>(() => {
    // Intentar cargar de localStorage
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored), ...initialPreferences }
        }
      } catch {}
    }
    return { ...DEFAULT_PREFERENCES, ...initialPreferences }
  })

  // Detectar preferencias del sistema
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setSystemReduced(motionQuery.matches)

    const handleMotionChange = (e: MediaQueryListEvent) => setSystemReduced(e.matches)
    motionQuery.addEventListener('change', handleMotionChange)

    // Check mobile
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
    setIsMobile(isMobileDevice)

    // Check hover support
    const hoverQuery = window.matchMedia('(hover: hover)')
    setSupportsHover(hoverQuery.matches)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
    }
  }, [])

  // Persistir preferencias
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences))
    } catch {}
  }, [preferences])

  // Calcular reducedMotion final
  const reducedMotion = preferences.userPrefersReduced ?? systemReduced

  // Acciones
  const toggleReducedMotion = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      userPrefersReduced: prev.userPrefersReduced === null
        ? !systemReduced
        : !prev.userPrefersReduced,
    }))
  }, [systemReduced])

  const setAnimationIntensity = useCallback((intensity: number) => {
    setPreferences(prev => ({
      ...prev,
      animationIntensity: Math.max(0, Math.min(1, intensity)),
    }))
  }, [])

  const toggle3DEffects = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      disable3DEffects: !prev.disable3DEffects,
    }))
  }, [])

  const toggleParallax = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      disableParallax: !prev.disableParallax,
    }))
  }, [])

  const toggleDecorativeEffects = useCallback(() => {
    setPreferences(prev => ({
      ...prev,
      disableDecorativeEffects: !prev.disableDecorativeEffects,
    }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES)
  }, [])

  const applyAccessibilityPreset = useCallback(() => {
    setPreferences({
      userPrefersReduced: true,
      disable3DEffects: true,
      disableParallax: true,
      disableImmersiveHover: true,
      animationIntensity: 0.3,
      durationMultiplier: 1.5,
      disableDecorativeEffects: true,
    })
  }, [])

  const applyPerformancePreset = useCallback(() => {
    setPreferences({
      userPrefersReduced: false,
      disable3DEffects: true,
      disableParallax: true,
      disableImmersiveHover: true,
      animationIntensity: 0.7,
      durationMultiplier: 0.8,
      disableDecorativeEffects: true,
    })
  }, [])

  return {
    // State
    reducedMotion,
    userPrefersReduced: preferences.userPrefersReduced,
    disable3DEffects: preferences.disable3DEffects,
    disableParallax: preferences.disableParallax,
    disableImmersiveHover: preferences.disableImmersiveHover,
    animationIntensity: preferences.animationIntensity,
    durationMultiplier: preferences.durationMultiplier,
    disableDecorativeEffects: preferences.disableDecorativeEffects,
    isMobile,
    supportsHover,
    // Actions
    toggleReducedMotion,
    setAnimationIntensity,
    toggle3DEffects,
    toggleParallax,
    toggleDecorativeEffects,
    resetToDefaults,
    applyAccessibilityPreset,
    applyPerformancePreset,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK STANDALONE (sin contexto)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useMotionPreferencesStandalone(
  initialPreferences?: Partial<MotionPreferences>
): UseMotionPreferencesReturn {
  return useMotionPreferencesInternal(initialPreferences)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK SIMPLIFICADO PARA CHECKS RÁPIDOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook simplificado que solo detecta preferencias del sistema
 * Sin persistencia ni controles avanzados
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(query.matches)

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    query.addEventListener('change', handler)
    return () => query.removeEventListener('change', handler)
  }, [])

  return reduced
}

/**
 * Hook para detectar si es dispositivo móvil
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsMobile(
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    )
  }, [])

  return isMobile
}

/**
 * Helper para obtener configuración de animación según preferencias
 */
export function getAnimationConfig(preferences: Pick<MotionPreferences, 'reducedMotion' | 'animationIntensity' | 'durationMultiplier'>) {
  const { reducedMotion, animationIntensity, durationMultiplier } = preferences

  if (reducedMotion) {
    return {
      duration: 0,
      animate: false,
      transition: { duration: 0 },
    }
  }

  return {
    duration: 0.3 * durationMultiplier,
    animate: true,
    transition: {
      type: 'spring' as const,
      stiffness: 400 * animationIntensity,
      damping: 30,
    },
  }
}

export default useMotionPreferences
