/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎛️ CHRONOS 2026 — GLOBAL MOTION SETTINGS PROVIDER
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema centralizado para controlar efectos de movimiento y 3D en toda la aplicación:
 * - Reducir efectos 3D tilt inmersivos (tedious cursor tracking)
 * - Controlar intensidad de animaciones
 * - Respeto a preferencias de accesibilidad
 * - Guardar preferencias en localStorage
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface MotionSettings {
  // 3D Effects Control
  enable3DTilt: boolean
  tiltIntensity: number // 0-100, donde 0 = deshabilitado
  enablePerspective: boolean

  // Mouse tracking effects
  enableMouseTracking: boolean
  mouseTrackingIntensity: number // 0-100

  // Animation preferences
  animationSpeed: 'slow' | 'normal' | 'fast' | 'instant'
  enableParallax: boolean
  parallaxIntensity: number // 0-100

  // Glows and visual effects
  enableGlowEffects: boolean
  glowIntensity: number // 0-100

  // Particles and shaders
  enableParticles: boolean
  enableShaderBackgrounds: boolean

  // Accessibility
  reducedMotion: boolean
  prefersHighContrast: boolean

  // Mobile specific
  enableHapticFeedback: boolean
  enableMobileOptimizations: boolean
}

interface MotionSettingsContextType extends MotionSettings {
  updateSettings: (updates: Partial<MotionSettings>) => void
  resetToDefaults: () => void
  isLoaded: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DEFAULTS - Optimizados para experiencia limpia iOS-style
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_SETTINGS: MotionSettings = {
  // 3D Effects - REDUCIDOS por defecto para evitar tracking tedioso
  enable3DTilt: false, // ← DESHABILITADO por defecto
  tiltIntensity: 0, // ← Sin tilt
  enablePerspective: false,

  // Mouse tracking - REDUCIDO
  enableMouseTracking: false, // ← DESHABILITADO
  mouseTrackingIntensity: 0,

  // Animations - Normales pero sutiles
  animationSpeed: 'normal',
  enableParallax: true,
  parallaxIntensity: 30, // Sutil

  // Glows - Moderados
  enableGlowEffects: true,
  glowIntensity: 50,

  // Particles and shaders - Habilitados pero optimizados
  enableParticles: true,
  enableShaderBackgrounds: true,

  // Accessibility
  reducedMotion: false,
  prefersHighContrast: false,

  // Mobile
  enableHapticFeedback: true,
  enableMobileOptimizations: true,
}

const STORAGE_KEY = 'chronos-motion-settings-v2'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MotionSettingsContext = createContext<MotionSettingsContextType | null>(null)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useMotionSettings(): MotionSettingsContextType {
  const context = useContext(MotionSettingsContext)
  if (!context) {
    // Return defaults if no provider (for SSR or testing)
    return {
      ...DEFAULT_SETTINGS,
      updateSettings: () => {},
      resetToDefaults: () => {},
      isLoaded: false,
    }
  }
  return context
}

// Helper hook for common use case
export function useShouldAnimate() {
  const { reducedMotion, animationSpeed } = useMotionSettings()
  return !reducedMotion && animationSpeed !== 'instant'
}

export function use3DEffects() {
  const { enable3DTilt, tiltIntensity, enablePerspective, enableMouseTracking, mouseTrackingIntensity } = useMotionSettings()
  return {
    shouldUseTilt: enable3DTilt && tiltIntensity > 0,
    tiltIntensity: tiltIntensity / 100, // Normalizado 0-1
    shouldUsePerspective: enablePerspective,
    shouldTrackMouse: enableMouseTracking && mouseTrackingIntensity > 0,
    mouseIntensity: mouseTrackingIntensity / 100,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MotionSettingsProviderProps {
  children: ReactNode
  initialSettings?: Partial<MotionSettings>
}

export function MotionSettingsProvider({
  children,
  initialSettings
}: MotionSettingsProviderProps) {
  const [settings, setSettings] = useState<MotionSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  })
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings(prev => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.warn('Failed to load motion settings:', error)
    }

    // Check system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches

    if (prefersReducedMotion) {
      setSettings(prev => ({
        ...prev,
        reducedMotion: true,
        enable3DTilt: false,
        enableMouseTracking: false,
        enableParallax: false,
        enableParticles: false,
        animationSpeed: 'instant',
      }))
    }

    if (prefersHighContrast) {
      setSettings(prev => ({
        ...prev,
        prefersHighContrast: true,
        glowIntensity: 100,
      }))
    }

    setIsLoaded(true)
  }, [])

  // Save to localStorage when settings change
  useEffect(() => {
    if (!isLoaded) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch (error) {
      console.warn('Failed to save motion settings:', error)
    }
  }, [settings, isLoaded])

  const updateSettings = useCallback((updates: Partial<MotionSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear motion settings:', error)
    }
  }, [])

  const value = useMemo<MotionSettingsContextType>(() => ({
    ...settings,
    updateSettings,
    resetToDefaults,
    isLoaded,
  }), [settings, updateSettings, resetToDefaults, isLoaded])

  return (
    <MotionSettingsContext.Provider value={value}>
      {children}
    </MotionSettingsContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { MotionSettingsContext, DEFAULT_SETTINGS }
