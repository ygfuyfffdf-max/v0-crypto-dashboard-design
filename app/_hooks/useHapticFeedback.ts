/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎮 CHRONOS 2026 — HAPTIC FEEDBACK HOOK
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de retroalimentación háptica premium para interacciones del usuario.
 * Utiliza navigator.vibrate() para feedback táctil en dispositivos compatibles.
 *
 * Patrones de vibración diseñados para cada tipo de interacción:
 * - Tap: Feedback sutil y rápido
 * - Success: Celebración de éxito
 * - Error: Alerta de error
 * - Warning: Notificación de advertencia
 * - Selection: Cambio de selección
 * - Impact: Impacto fuerte (transacciones grandes)
 *
 * Paleta: #8B00FF / #FFD700 / #FF1493 (⛔ CYAN PROHIBIDO)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export type HapticPattern =
  | 'tap' // Click suave
  | 'double-tap' // Doble click
  | 'success' // Éxito en operación
  | 'error' // Error
  | 'warning' // Advertencia
  | 'selection' // Cambio de selección
  | 'impact-light' // Impacto ligero
  | 'impact-medium' // Impacto medio
  | 'impact-heavy' // Impacto fuerte (ventas grandes)
  | 'notification' // Notificación
  | 'ecstasy' // Modo éxtasis financiero 🎉
  | 'heartbeat' // Latido del capital

export interface HapticConfig {
  enabled: boolean
  intensity: 'low' | 'medium' | 'high'
}

export interface UseHapticFeedbackReturn {
  /** Si el dispositivo soporta vibración */
  isSupported: boolean
  /** Si el haptic está habilitado */
  isEnabled: boolean
  /** Disparar un patrón háptico */
  trigger: (pattern: HapticPattern) => void
  /** Habilitar/deshabilitar haptic */
  setEnabled: (enabled: boolean) => void
  /** Configurar intensidad */
  setIntensity: (intensity: 'low' | 'medium' | 'high') => void
  /** Configuración actual */
  config: HapticConfig
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATRONES DE VIBRACIÓN (en milisegundos)
// ═══════════════════════════════════════════════════════════════════════════════

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  // Interacciones básicas
  tap: 10,
  'double-tap': [10, 50, 10],
  selection: 15,

  // Feedback de estado
  success: [10, 30, 10, 30, 50], // Patrón ascendente celebratorio
  error: [50, 50, 50, 50, 100], // Patrón de alerta
  warning: [30, 50, 30], // Patrón de advertencia
  notification: [20, 100, 20], // Notificación suave

  // Impactos físicos
  'impact-light': 15,
  'impact-medium': 30,
  'impact-heavy': [50, 30, 100], // Impacto fuerte para ventas grandes

  // Patrones especiales CHRONOS
  ecstasy: [20, 30, 20, 30, 20, 30, 50, 100, 50], // Patrón de éxtasis financiero
  heartbeat: [100, 100, 100, 300], // Latido del capital (lub-dub)
}

// Multiplicadores de intensidad
const INTENSITY_MULTIPLIERS = {
  low: 0.5,
  medium: 1.0,
  high: 1.5,
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function useHapticFeedback(
  initialConfig: Partial<HapticConfig> = {},
): UseHapticFeedbackReturn {
  const [isSupported, setIsSupported] = useState(false)
  const [config, setConfig] = useState<HapticConfig>({
    enabled: initialConfig.enabled ?? true,
    intensity: initialConfig.intensity ?? 'medium',
  })

  // Detectar soporte de vibración
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator
    setIsSupported(supported)
  }, [])

  // Disparar patrón háptico
  const trigger = useCallback(
    (pattern: HapticPattern) => {
      if (!isSupported || !config.enabled) return

      const basePattern = HAPTIC_PATTERNS[pattern]
      const multiplier = INTENSITY_MULTIPLIERS[config.intensity]

      try {
        if (typeof basePattern === 'number') {
          // Patrón simple
          navigator.vibrate(Math.round(basePattern * multiplier))
        } else {
          // Patrón complejo - multiplicar cada valor
          const scaledPattern = basePattern.map((v) => Math.round(v * multiplier))
          navigator.vibrate(scaledPattern)
        }
      } catch {
        // Silenciar errores si el dispositivo no soporta vibración
        console.debug('[Haptic] Vibration not available')
      }
    },
    [isSupported, config.enabled, config.intensity],
  )

  // Setters
  const setEnabled = useCallback((enabled: boolean) => {
    setConfig((prev) => ({ ...prev, enabled }))
  }, [])

  const setIntensity = useCallback((intensity: 'low' | 'medium' | 'high') => {
    setConfig((prev) => ({ ...prev, intensity }))
  }, [])

  return {
    isSupported,
    isEnabled: config.enabled,
    trigger,
    setEnabled,
    setIntensity,
    config,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILIDADES HELPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook simplificado que solo expone la función trigger
 */
export function useHaptic() {
  const { trigger, isSupported } = useHapticFeedback()
  return { haptic: trigger, isSupported }
}

/**
 * Trigger háptico standalone (para usar fuera de React)
 */
export function triggerHaptic(
  pattern: HapticPattern,
  intensity: 'low' | 'medium' | 'high' = 'medium',
) {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return

  const basePattern = HAPTIC_PATTERNS[pattern]
  const multiplier = INTENSITY_MULTIPLIERS[intensity]

  try {
    if (typeof basePattern === 'number') {
      navigator.vibrate(Math.round(basePattern * multiplier))
    } else {
      const scaledPattern = basePattern.map((v) => Math.round(v * multiplier))
      navigator.vibrate(scaledPattern)
    }
  } catch {
    // Silenciar
  }
}

export default useHapticFeedback
