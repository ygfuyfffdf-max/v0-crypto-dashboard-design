/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔔 CHRONOS 2026 — TOAST COMPATIBILITY HOOK
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hook que proporciona una API compatible con sonner pero usa el sistema iOS Toast.
 * Permite migración gradual de sonner al nuevo sistema.
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useToast } from '@/app/_components/ui/iOSToastSystem'
import { useCallback } from 'react'

interface ToastOptions {
  description?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Hook que proporciona una API similar a sonner pero usa el sistema iOS
 * Compatible para migración gradual
 */
export function useIOSToast() {
  const toast = useToast()

  const success = useCallback((message: string, options?: ToastOptions) => {
    return toast.success(message, options?.description, {
      duration: options?.duration,
      action: options?.action,
    })
  }, [toast])

  const error = useCallback((message: string, options?: ToastOptions) => {
    return toast.error(message, options?.description, {
      duration: options?.duration,
      action: options?.action,
    })
  }, [toast])

  const warning = useCallback((message: string, options?: ToastOptions) => {
    return toast.warning(message, options?.description, {
      duration: options?.duration,
      action: options?.action,
    })
  }, [toast])

  const info = useCallback((message: string, options?: ToastOptions) => {
    return toast.info(message, options?.description, {
      duration: options?.duration,
      action: options?.action,
    })
  }, [toast])

  const loading = useCallback((message: string, options?: ToastOptions) => {
    return toast.loading(message, options?.description)
  }, [toast])

  const dismiss = useCallback((id: string) => {
    toast.dismiss(id)
  }, [toast])

  const promise = useCallback(<T,>(
    promiseArg: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((err: unknown) => string)
    }
  ) => {
    return toast.promise(promiseArg, {
      loading: options.loading,
      success: options.success,
      error: options.error,
    })
  }, [toast])

  return {
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    promise,
    // También exponer el toast original para casos avanzados
    raw: toast,
  }
}

/**
 * API global para usar en server actions o fuera de componentes React
 * Nota: Requiere que el contexto esté disponible
 */
export const iosToast = {
  success: (message: string, description?: string) => {
    console.log('[iOS Toast] Success:', message, description)
    // Se implementará con un event emitter cuando sea necesario
  },
  error: (message: string, description?: string) => {
    console.log('[iOS Toast] Error:', message, description)
  },
  warning: (message: string, description?: string) => {
    console.log('[iOS Toast] Warning:', message, description)
  },
  info: (message: string, description?: string) => {
    console.log('[iOS Toast] Info:', message, description)
  },
}

export default useIOSToast
