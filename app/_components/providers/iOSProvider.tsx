/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🍎 CHRONOS 2026 — iOS PREMIUM PROVIDERS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Provider wrapper que integra todos los sistemas iOS Premium:
 * - MotionPreferencesProvider (accesibilidad y efectos)
 * - ToastProvider (notificaciones)
 * - MobileLayoutProvider (layout móvil)
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { ReactNode, memo } from 'react'
import { MotionPreferencesProvider } from '@/app/_hooks/useMotionPreferences'
import { ToastProvider } from '@/app/_components/ui/iOSToastSystem'
import { MobileLayoutProvider } from '@/app/_components/ui/iOSMobileLayout'

interface iOSProviderProps {
  children: ReactNode
  /** Posición de los toasts */
  toastPosition?: 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right'
  /** Duración por defecto de los toasts en ms */
  toastDuration?: number
  /** Deshabilitar efectos 3D por defecto */
  disable3DEffects?: boolean
  /** Deshabilitar parallax por defecto */
  disableParallax?: boolean
}

export const iOSProvider = memo(function iOSProvider({
  children,
  toastPosition = 'top',
  toastDuration = 4000,
  disable3DEffects = true,
  disableParallax = true,
}: iOSProviderProps) {
  return (
    <MotionPreferencesProvider
      initialPreferences={{
        disable3DEffects,
        disableParallax,
        disableImmersiveHover: true,
      }}
    >
      <MobileLayoutProvider>
        <ToastProvider position={toastPosition} defaultDuration={toastDuration}>
          {children}
        </ToastProvider>
      </MobileLayoutProvider>
    </MotionPreferencesProvider>
  )
})

export default iOSProvider
