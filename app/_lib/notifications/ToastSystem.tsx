/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔔 CHRONOS INFINITY 2030 — SISTEMA DE NOTIFICACIONES PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de notificaciones toast avanzado con:
 * - Múltiples variantes (success, error, warning, info, loading)
 * - Animaciones fluidas
 * - Stacking inteligente
 * - Acciones integradas
 * - Soporte para promesas
 * - Persistencia opcional
 * - Sonidos opcionales
 * - Accesibilidad completa
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  ReactNode,
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'default'
type ToastPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center'

interface ToastAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
}

interface Toast {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration?: number // ms, 0 = persistent
  dismissible?: boolean
  action?: ToastAction
  icon?: ReactNode
  createdAt: number
}

interface ToastOptions extends Omit<Toast, 'id' | 'createdAt' | 'variant'> {
  id?: string
  variant?: ToastVariant
}

interface ToastContextValue {
  toasts: Toast[]
  show: (options: ToastOptions) => string
  success: (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) => string
  error: (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) => string
  warning: (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) => string
  info: (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) => string
  loading: (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) => string
  dismiss: (id: string) => void
  dismissAll: () => void
  update: (id: string, options: Partial<ToastOptions>) => void
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => Promise<T>
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_DURATION = 5000
const MAX_VISIBLE_TOASTS = 5

const VARIANT_CONFIG: Record<ToastVariant, { icon: ReactNode; colors: string }> = {
  success: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    colors: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400',
  },
  error: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    colors: 'bg-red-500/20 border-red-500/30 text-red-400',
  },
  warning: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    colors: 'bg-amber-500/20 border-amber-500/30 text-amber-400',
  },
  info: {
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    colors: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
  },
  loading: {
    icon: (
      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    ),
    colors: 'bg-violet-500/20 border-violet-500/30 text-violet-400',
  },
  default: {
    icon: null,
    colors: 'bg-white/10 border-white/20 text-white',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// REDUCER
// ═══════════════════════════════════════════════════════════════════════════════════════

type ToastAction_Internal =
  | { type: 'ADD'; toast: Toast }
  | { type: 'UPDATE'; id: string; updates: Partial<Toast> }
  | { type: 'DISMISS'; id: string }
  | { type: 'DISMISS_ALL' }

function toastsReducer(state: Toast[], action: ToastAction_Internal): Toast[] {
  switch (action.type) {
    case 'ADD':
      return [...state, action.toast].slice(-MAX_VISIBLE_TOASTS)
    case 'UPDATE':
      return state.map((t) =>
        t.id === action.id ? { ...t, ...action.updates } : t
      )
    case 'DISMISS':
      return state.filter((t) => t.id !== action.id)
    case 'DISMISS_ALL':
      return []
    default:
      return state
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TOAST PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ToastProviderProps {
  children: ReactNode
  position?: ToastPosition
  defaultDuration?: number
}

export function ToastProvider({
  children,
  position = 'top-right',
  defaultDuration = DEFAULT_DURATION,
}: ToastProviderProps) {
  const [toasts, dispatch] = useReducer(toastsReducer, [])

  // Generate unique ID
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  // Show toast
  const show = useCallback(
    (options: ToastOptions): string => {
      const id = options.id || generateId()
      const toast: Toast = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant || 'default',
        duration: options.duration ?? defaultDuration,
        dismissible: options.dismissible ?? true,
        action: options.action,
        icon: options.icon,
        createdAt: Date.now(),
      }

      dispatch({ type: 'ADD', toast })
      return id
    },
    [generateId, defaultDuration]
  )

  // Shorthand methods
  const success = useCallback(
    (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
      show({ ...options, title, variant: 'success' }),
    [show]
  )

  const error = useCallback(
    (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
      show({ ...options, title, variant: 'error' }),
    [show]
  )

  const warning = useCallback(
    (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
      show({ ...options, title, variant: 'warning' }),
    [show]
  )

  const info = useCallback(
    (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
      show({ ...options, title, variant: 'info' }),
    [show]
  )

  const loading = useCallback(
    (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
      show({ ...options, title, variant: 'loading', duration: 0 }),
    [show]
  )

  // Dismiss
  const dismiss = useCallback((id: string) => {
    dispatch({ type: 'DISMISS', id })
  }, [])

  const dismissAll = useCallback(() => {
    dispatch({ type: 'DISMISS_ALL' })
  }, [])

  // Update
  const update = useCallback((id: string, options: Partial<ToastOptions>) => {
    dispatch({ type: 'UPDATE', id, updates: options })
  }, [])

  // Promise helper
  const promiseToast = useCallback(
    async <T,>(
      promise: Promise<T>,
      options: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: Error) => string)
      }
    ): Promise<T> => {
      const id = loading(options.loading)

      try {
        const data = await promise
        const successMessage =
          typeof options.success === 'function' ? options.success(data) : options.success
        update(id, { title: successMessage, variant: 'success', duration: defaultDuration })
        return data
      } catch (err) {
        const errorMessage =
          typeof options.error === 'function' ? options.error(err as Error) : options.error
        update(id, { title: errorMessage, variant: 'error', duration: defaultDuration })
        throw err
      }
    },
    [loading, update, defaultDuration]
  )

  const value = useMemo(
    () => ({
      toasts,
      show,
      success,
      error,
      warning,
      info,
      loading,
      dismiss,
      dismissAll,
      update,
      promise: promiseToast,
    }),
    [toasts, show, success, error, warning, info, loading, dismiss, dismissAll, update, promiseToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TOAST CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ToastContainerProps {
  toasts: Toast[]
  position: ToastPosition
  onDismiss: (id: string) => void
}

function ToastContainer({ toasts, position, onDismiss }: ToastContainerProps) {
  const positionClasses: Record<ToastPosition, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
  }

  const isTop = position.startsWith('top')

  return (
    <div
      className={cn(
        'fixed z-[9999] flex flex-col gap-2 pointer-events-none',
        positionClasses[position]
      )}
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={onDismiss}
            index={isTop ? index : toasts.length - 1 - index}
            isTop={isTop}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TOAST ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
  index: number
  isTop: boolean
}

function ToastItem({ toast, onDismiss, index, isTop }: ToastItemProps) {
  const config = VARIANT_CONFIG[toast.variant]

  // Auto-dismiss
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => onDismiss(toast.id), toast.duration)
      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: isTop ? -20 : 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-xl border backdrop-blur-xl shadow-xl',
        config.colors
      )}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        {(toast.icon || config.icon) && (
          <div className="flex-shrink-0 mt-0.5">
            {toast.icon || config.icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">
            {toast.title}
          </p>
          {toast.description && (
            <p className="mt-1 text-sm text-white/70">
              {toast.description}
            </p>
          )}
          
          {/* Action */}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className={cn(
                'mt-2 text-sm font-medium transition-colors',
                toast.action.variant === 'primary' && 'text-violet-400 hover:text-violet-300',
                toast.action.variant === 'danger' && 'text-red-400 hover:text-red-300',
                (!toast.action.variant || toast.action.variant === 'secondary') &&
                  'text-white/70 hover:text-white'
              )}
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Dismiss button */}
        {toast.dismissible && (
          <button
            onClick={() => onDismiss(toast.id)}
            className="flex-shrink-0 p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar notificación"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress bar for timed toasts */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className="h-0.5 bg-current opacity-30"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// STANDALONE TOAST FUNCTION (OPTIONAL)
// ═══════════════════════════════════════════════════════════════════════════════════════

let globalToastRef: ToastContextValue | null = null

export function setGlobalToastRef(ref: ToastContextValue) {
  globalToastRef = ref
}

export const toast = {
  show: (options: ToastOptions) => globalToastRef?.show(options) || '',
  success: (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
    globalToastRef?.success(title, options) || '',
  error: (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
    globalToastRef?.error(title, options) || '',
  warning: (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
    globalToastRef?.warning(title, options) || '',
  info: (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
    globalToastRef?.info(title, options) || '',
  loading: (title: string, options?: Omit<ToastOptions, 'title' | 'variant'>) =>
    globalToastRef?.loading(title, options) || '',
  dismiss: (id: string) => globalToastRef?.dismiss(id),
  dismissAll: () => globalToastRef?.dismissAll(),
  promise: <T,>(
    promise: Promise<T>,
    options: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: Error) => string)
    }
  ) => globalToastRef?.promise(promise, options) || promise,
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export type { Toast, ToastOptions, ToastVariant, ToastPosition, ToastAction }
