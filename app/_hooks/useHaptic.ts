/**
 * 📳 HAPTIC FEEDBACK HOOK — CHRONOS 2026
 * ═══════════════════════════════════════════════════════════════════════════
 * Hook para feedback háptico en dispositivos móviles
 * Usa Web Vibration API para microinteracciones táctiles
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useCallback } from 'react'

type HapticIntensity = 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'warning'

/**
 * Patrones de vibración en milisegundos
 * - light: Toque suave (tap)
 * - medium: Confirmación
 * - heavy: Alerta
 * - success: Operación exitosa
 * - error: Error
 * - warning: Advertencia
 */
const HAPTIC_PATTERNS: Record<HapticIntensity, number[]> = {
  light: [10],
  medium: [20, 10, 20],
  heavy: [50, 30, 50],
  success: [10, 50, 10, 50, 100],
  error: [100, 50, 100, 50, 100],
  warning: [30, 20, 30],
}

/**
 * Hook para feedback háptico usando Web Vibration API
 * @returns Objeto con métodos de vibración categorizados
 *
 * @example
 * ```tsx
 * const { onTap, onSuccess, onError } = useHaptic()
 *
 * <button onClick={() => { onTap(); handleClick(); }}>
 *   Transferir
 * </button>
 * ```
 */
export function useHaptic() {
  /**
   * Verifica si el dispositivo soporta vibración
   */
  const isSupported = useCallback((): boolean => {
    return typeof navigator !== 'undefined' && 'vibrate' in navigator
  }, [])

  /**
   * Ejecuta vibración con intensidad específica
   */
  const vibrate = useCallback(
    (intensity: HapticIntensity = 'light') => {
      if (!isSupported()) return false

      try {
        const pattern = HAPTIC_PATTERNS[intensity]
        return navigator.vibrate(pattern)
      } catch {
        return false
      }
    },
    [isSupported],
  )

  /**
   * Cancela cualquier vibración en curso
   */
  const cancel = useCallback(() => {
    if (!isSupported()) return
    navigator.vibrate(0)
  }, [isSupported])

  // Métodos de conveniencia
  const onTap = useCallback(() => vibrate('light'), [vibrate])
  const onPress = useCallback(() => vibrate('medium'), [vibrate])
  const onSuccess = useCallback(() => vibrate('success'), [vibrate])
  const onError = useCallback(() => vibrate('error'), [vibrate])
  const onWarning = useCallback(() => vibrate('warning'), [vibrate])
  const onHeavy = useCallback(() => vibrate('heavy'), [vibrate])

  return {
    // Estado
    isSupported: isSupported(),

    // Métodos base
    vibrate,
    cancel,

    // Métodos de conveniencia
    onTap,
    onPress,
    onSuccess,
    onError,
    onWarning,
    onHeavy,
  }
}
