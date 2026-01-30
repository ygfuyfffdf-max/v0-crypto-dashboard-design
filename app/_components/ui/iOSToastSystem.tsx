/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔔 CHRONOS 2026 — iOS PREMIUM TOAST SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de notificaciones toast estilo iOS con:
 * - Animaciones suaves de entrada/salida
 * - Múltiples posiciones
 * - Auto-dismiss configurable
 * - Acciones integradas
 * - Stack management
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  LucideIcon,
  Loader2,
} from 'lucide-react'
import { createContext, memo, ReactNode, useCallback, useContext, useState, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading'
type ToastPosition = 'top' | 'top-left' | 'top-right' | 'bottom' | 'bottom-left' | 'bottom-right'

interface Toast {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
  dismissible?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  icon?: LucideIcon
  onDismiss?: () => void
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  clearAll: () => void
  // Convenience methods
  success: (title: string, description?: string, options?: Partial<Toast>) => string
  error: (title: string, description?: string, options?: Partial<Toast>) => string
  warning: (title: string, description?: string, options?: Partial<Toast>) => string
  info: (title: string, description?: string, options?: Partial<Toast>) => string
  loading: (title: string, description?: string, options?: Partial<Toast>) => string
  dismiss: (id: string) => void
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((err: unknown) => string)
    }
  ) => Promise<T>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_DURATION = 4000
const MAX_VISIBLE_TOASTS = 5

const typeConfig: Record<ToastType, { icon: LucideIcon; color: string; bg: string }> = {
  success: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
  error: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10 border-red-500/20',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  loading: {
    icon: Loader2,
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
}

const positionClasses: Record<ToastPosition, string> = {
  'top': 'top-4 left-1/2 -translate-x-1/2',
  'top-left': 'top-4 left-4',
  'top-right': 'top-4 right-4',
  'bottom': 'bottom-4 left-1/2 -translate-x-1/2',
  'bottom-left': 'bottom-4 left-4',
  'bottom-right': 'bottom-4 right-4',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXTO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ToastContext = createContext<ToastContextValue | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE DE TOAST INDIVIDUAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
  index: number
  total: number
}

const ToastItem = memo(function ToastItem({
  toast,
  onDismiss,
  index,
  total,
}: ToastItemProps) {
  const config = typeConfig[toast.type]
  const Icon = toast.icon || config.icon
  const isLoading = toast.type === 'loading'

  // Calculate offset for stacking effect
  const offset = Math.min(index, 2) * 8
  const scale = 1 - Math.min(index, 2) * 0.05
  const opacity = 1 - Math.min(index, 2) * 0.15

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{
        opacity: index >= MAX_VISIBLE_TOASTS ? 0 : opacity,
        y: offset,
        scale,
      }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      className={cn(
        'relative w-full max-w-sm rounded-2xl border p-4',
        'backdrop-blur-xl shadow-lg',
        'bg-[#1C1C1E]/95',
        'border-white/[0.08]',
        index > 0 && 'absolute'
      )}
      style={{
        zIndex: total - index,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0 mt-0.5', config.color)}>
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Icon className="h-5 w-5" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-semibold text-white">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-1 text-[13px] text-white/60 leading-relaxed">
              {toast.description}
            </p>
          )}

          {/* Action */}
          {toast.action && (
            <button
              onClick={() => {
                toast.action?.onClick()
                onDismiss(toast.id)
              }}
              className={cn(
                'mt-2 text-[13px] font-semibold',
                config.color,
                'hover:underline'
              )}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss button */}
        {toast.dismissible !== false && !isLoading && (
          <motion.button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 p-1 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-4 w-4" />
          </motion.button>
        )}
      </div>

      {/* Progress bar for auto-dismiss */}
      {toast.duration && toast.duration > 0 && !isLoading && (
        <motion.div
          className={cn('absolute bottom-0 left-0 h-0.5 rounded-full', config.color.replace('text-', 'bg-'))}
          initial={{ width: '100%' }}
          animate={{ width: 0 }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTAINER DE TOASTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ToastContainerProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
  position: ToastPosition
}

const ToastContainer = memo(function ToastContainer({
  toasts,
  onDismiss,
  position,
}: ToastContainerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      className={cn(
        'fixed z-[200] pointer-events-none',
        'px-4 safe-area-inset-top',
        positionClasses[position]
      )}
    >
      <div className="relative">
        <AnimatePresence mode="popLayout">
          {toasts.slice(0, MAX_VISIBLE_TOASTS).map((toast, index) => (
            <div key={toast.id} className="pointer-events-auto mb-2">
              <ToastItem
                toast={toast}
                onDismiss={onDismiss}
                index={index}
                total={toasts.length}
              />
            </div>
          ))}
        </AnimatePresence>

        {/* Counter for hidden toasts */}
        {toasts.length > MAX_VISIBLE_TOASTS && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-[12px] text-white/40 mt-2"
          >
            +{toasts.length - MAX_VISIBLE_TOASTS} más
          </motion.div>
        )}
      </div>
    </div>,
    document.body
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ToastProviderProps {
  children: ReactNode
  position?: ToastPosition
  maxToasts?: number
  defaultDuration?: number
}

export const ToastProvider = memo(function ToastProvider({
  children,
  position = 'top',
  defaultDuration = DEFAULT_DURATION,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const generateId = () => Math.random().toString(36).substring(2, 9)

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = generateId()
    const duration = toast.duration ?? (toast.type === 'loading' ? 0 : defaultDuration)

    setToasts(prev => [{
      ...toast,
      id,
      duration,
    }, ...prev])

    // Auto dismiss
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
        toast.onDismiss?.()
      }, duration)
    }

    return id
  }, [defaultDuration])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id)
      toast?.onDismiss?.()
      return prev.filter(t => t.id !== id)
    })
  }, [])

  const clearAll = useCallback(() => {
    setToasts([])
  }, [])

  // Convenience methods
  const success = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'success', title, description, ...options })
  }, [addToast])

  const error = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'error', title, description, ...options })
  }, [addToast])

  const warning = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'warning', title, description, ...options })
  }, [addToast])

  const info = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'info', title, description, ...options })
  }, [addToast])

  const loading = useCallback((title: string, description?: string, options?: Partial<Toast>) => {
    return addToast({ type: 'loading', title, description, duration: 0, dismissible: false, ...options })
  }, [addToast])

  const dismiss = useCallback((id: string) => {
    removeToast(id)
  }, [removeToast])

  const promiseHandler = useCallback(async <T,>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((err: unknown) => string)
    }
  ): Promise<T> => {
    const loadingId = loading(options.loading)

    try {
      const result = await promise
      dismiss(loadingId)
      const successMessage = typeof options.success === 'function'
        ? options.success(result)
        : options.success
      success(successMessage)
      return result
    } catch (err) {
      dismiss(loadingId)
      const errorMessage = typeof options.error === 'function'
        ? options.error(err)
        : options.error
      error(errorMessage)
      throw err
    }
  }, [loading, dismiss, success, error])

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    promise: promiseHandler,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  Toast,
  ToastType,
  ToastPosition,
  ToastContextValue,
  ToastProviderProps,
}
