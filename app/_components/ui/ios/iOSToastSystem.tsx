/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🍞 CHRONOS 2026 — iOS TOAST & NOTIFICATIONS SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de notificaciones y toasts estilo iOS 18+:
 * - Toasts animados con spring physics
 * - Notificaciones push-style
 * - Action sheets
 * - Confirmaciones
 * - Alertas elegantes
 * - Haptic feedback visual
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, PanInfo } from 'motion/react'
import {
  memo,
  ReactNode,
  useCallback,
  useState,
  createContext,
  useContext,
  useEffect,
} from 'react'
import { createPortal } from 'react-dom'
import {
  LucideIcon,
  Check,
  X,
  AlertTriangle,
  Info,
  AlertCircle,
  Bell,
  Sparkles,
  CheckCircle2,
  XCircle,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type ToastVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'premium'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  icon?: LucideIcon
  duration?: number
  dismissible?: boolean
  action?: {
    label: string
    onClick: () => void
  }
  onDismiss?: () => void
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  removeAllToasts: () => void
  // Shorthand methods
  success: (title: string, description?: string) => string
  error: (title: string, description?: string) => string
  warning: (title: string, description?: string) => string
  info: (title: string, description?: string) => string
  promise: <T>(
    promise: Promise<T>,
    opts: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((err: Error) => string)
    }
  ) => Promise<T>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ToastContext = createContext<ToastContextType | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within iOSToastProvider')
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSToastProviderProps {
  children: ReactNode
  position?: 'top' | 'bottom' | 'top-right' | 'bottom-right'
  maxToasts?: number
}

export const iOSToastProvider = memo(function iOSToastProvider({
  children,
  position = 'top',
  maxToasts = 5,
}: iOSToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId()
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
      dismissible: toast.dismissible ?? true,
    }

    setToasts(prev => {
      const updated = [newToast, ...prev]
      if (updated.length > maxToasts) {
        return updated.slice(0, maxToasts)
      }
      return updated
    })

    // Auto dismiss
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
        newToast.onDismiss?.()
      }, newToast.duration)
    }

    return id
  }, [generateId, maxToasts])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => {
      const toast = prev.find(t => t.id === id)
      toast?.onDismiss?.()
      return prev.filter(t => t.id !== id)
    })
  }, [])

  const removeAllToasts = useCallback(() => {
    toasts.forEach(t => t.onDismiss?.())
    setToasts([])
  }, [toasts])

  // Shorthand methods
  const success = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: 'success' })
  }, [addToast])

  const error = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: 'error' })
  }, [addToast])

  const warning = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: 'warning' })
  }, [addToast])

  const info = useCallback((title: string, description?: string) => {
    return addToast({ title, description, variant: 'info' })
  }, [addToast])

  const promiseToast = useCallback(async <T,>(
    promise: Promise<T>,
    opts: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((err: Error) => string)
    }
  ): Promise<T> => {
    const loadingId = addToast({
      title: opts.loading,
      variant: 'default',
      duration: 0, // Don't auto dismiss
      dismissible: false,
    })

    try {
      const result = await promise
      removeToast(loadingId)
      const successMsg = typeof opts.success === 'function' ? opts.success(result) : opts.success
      addToast({ title: successMsg, variant: 'success' })
      return result
    } catch (err) {
      removeToast(loadingId)
      const errorMsg = typeof opts.error === 'function' ? opts.error(err as Error) : opts.error
      addToast({ title: errorMsg, variant: 'error' })
      throw err
    }
  }, [addToast, removeToast])

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        removeAllToasts,
        success,
        error,
        warning,
        info,
        promise: promiseToast,
      }}
    >
      {children}
      <ToastContainer toasts={toasts} position={position} onRemove={removeToast} />
    </ToastContext.Provider>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TOAST CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ToastContainerProps {
  toasts: Toast[]
  position: 'top' | 'bottom' | 'top-right' | 'bottom-right'
  onRemove: (id: string) => void
}

const ToastContainer = memo(function ToastContainer({
  toasts,
  position,
  onRemove,
}: ToastContainerProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const positionClasses = {
    top: 'top-4 left-1/2 -translate-x-1/2 items-center',
    bottom: 'bottom-4 left-1/2 -translate-x-1/2 items-center',
    'top-right': 'top-4 right-4 items-end',
    'bottom-right': 'bottom-4 right-4 items-end',
  }

  return createPortal(
    <div
      className={cn(
        'fixed z-[9999] flex flex-col gap-2 pointer-events-none',
        'max-w-[420px] w-full px-4 md:px-0',
        positionClasses[position]
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onRemove={onRemove}
            position={position}
          />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TOAST ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
  position: 'top' | 'bottom' | 'top-right' | 'bottom-right'
}

const ToastItem = memo(function ToastItem({
  toast,
  onRemove,
  position,
}: ToastItemProps) {
  const variantStyles: Record<ToastVariant, {
    bg: string
    border: string
    icon: LucideIcon
    iconColor: string
  }> = {
    default: {
      bg: 'bg-zinc-800/95',
      border: 'border-white/[0.1]',
      icon: Bell,
      iconColor: 'text-white/70',
    },
    success: {
      bg: 'bg-emerald-900/90',
      border: 'border-emerald-500/30',
      icon: CheckCircle2,
      iconColor: 'text-emerald-400',
    },
    error: {
      bg: 'bg-red-900/90',
      border: 'border-red-500/30',
      icon: XCircle,
      iconColor: 'text-red-400',
    },
    warning: {
      bg: 'bg-amber-900/90',
      border: 'border-amber-500/30',
      icon: AlertTriangle,
      iconColor: 'text-amber-400',
    },
    info: {
      bg: 'bg-blue-900/90',
      border: 'border-blue-500/30',
      icon: Info,
      iconColor: 'text-blue-400',
    },
    premium: {
      bg: 'bg-gradient-to-r from-violet-900/90 to-fuchsia-900/90',
      border: 'border-violet-500/30',
      icon: Sparkles,
      iconColor: 'text-violet-400',
    },
  }

  const styles = variantStyles[toast.variant || 'default']
  const Icon = toast.icon || styles.icon

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const threshold = 100
    if (Math.abs(info.offset.x) > threshold) {
      onRemove(toast.id)
    }
  }, [onRemove, toast.id])

  const isTop = position === 'top' || position === 'top-right'

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        y: isTop ? -20 : 20,
        scale: 0.95,
      }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: isTop ? -20 : 20,
        scale: 0.95,
        transition: { duration: 0.15 }
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={handleDragEnd}
      className={cn(
        'pointer-events-auto w-full',
        'rounded-2xl backdrop-blur-xl border',
        'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
        'overflow-hidden',
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className="shrink-0 mt-0.5">
          <Icon size={20} className={styles.iconColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-white/60 mt-0.5 line-clamp-2">{toast.description}</p>
          )}
          {toast.action && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); toast.action?.onClick() }}
              className="mt-2 text-xs font-medium text-violet-400 hover:text-violet-300"
              whileTap={{ scale: 0.95 }}
            >
              {toast.action.label}
            </motion.button>
          )}
        </div>

        {/* Dismiss button */}
        {toast.dismissible && (
          <motion.button
            onClick={() => onRemove(toast.id)}
            className="shrink-0 p-1 rounded-full text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <X size={14} />
          </motion.button>
        )}
      </div>

      {/* Progress bar (if duration) */}
      {toast.duration && toast.duration > 0 && (
        <motion.div
          className="h-0.5 bg-white/20 origin-left"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS ALERT DIALOG - Diálogo de alerta estilo iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSAlertProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message?: string
  icon?: LucideIcon
  variant?: 'default' | 'destructive' | 'success'
  primaryAction?: {
    label: string
    onClick: () => void
    loading?: boolean
  }
  secondaryAction?: {
    label: string
    onClick: () => void
  }
}

export const iOSAlert = memo(function iOSAlert({
  isOpen,
  onClose,
  title,
  message,
  icon: Icon,
  variant = 'default',
  primaryAction,
  secondaryAction,
}: iOSAlertProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const iconColors = {
    default: 'text-violet-400',
    destructive: 'text-red-400',
    success: 'text-emerald-400',
  }

  const primaryColors = {
    default: 'bg-violet-500 hover:bg-violet-400',
    destructive: 'bg-red-500 hover:bg-red-400',
    success: 'bg-emerald-500 hover:bg-emerald-400',
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Alert */}
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={cn(
                'w-full max-w-[300px]',
                'bg-zinc-800/95 backdrop-blur-2xl rounded-2xl',
                'border border-white/[0.1]',
                'shadow-2xl overflow-hidden'
              )}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Content */}
              <div className="px-5 pt-6 pb-4 text-center">
                {Icon && (
                  <div className="flex justify-center mb-3">
                    <div className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center',
                      variant === 'destructive' ? 'bg-red-500/20' : variant === 'success' ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                    )}>
                      <Icon size={24} className={iconColors[variant]} />
                    </div>
                  </div>
                )}
                <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
                {message && (
                  <p className="text-sm text-white/60">{message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-white/[0.06]">
                <div className={cn(
                  'flex',
                  secondaryAction ? 'divide-x divide-white/[0.06]' : ''
                )}>
                  {secondaryAction && (
                    <motion.button
                      onClick={secondaryAction.onClick}
                      className="flex-1 py-3 text-sm font-medium text-white/70 hover:bg-white/[0.05] transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      {secondaryAction.label}
                    </motion.button>
                  )}
                  {primaryAction && (
                    <motion.button
                      onClick={primaryAction.onClick}
                      disabled={primaryAction.loading}
                      className={cn(
                        'flex-1 py-3 text-sm font-semibold text-white transition-colors',
                        'disabled:opacity-50',
                        variant === 'destructive' ? 'text-red-400 hover:bg-red-500/10' :
                        variant === 'success' ? 'text-emerald-400 hover:bg-emerald-500/10' :
                        'text-violet-400 hover:bg-violet-500/10'
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      {primaryAction.loading ? 'Cargando...' : primaryAction.label}
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS CONFIRM DIALOG - Diálogo de confirmación
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSConfirmProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'destructive'
}

export const iOSConfirm = memo(function iOSConfirm({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
}: iOSConfirmProps) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = useCallback(async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setLoading(false)
    }
  }, [onConfirm, onClose])

  return (
    <iOSAlert
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      message={message}
      icon={variant === 'destructive' ? AlertTriangle : undefined}
      variant={variant === 'destructive' ? 'destructive' : 'default'}
      primaryAction={{
        label: confirmLabel,
        onClick: handleConfirm,
        loading,
      }}
      secondaryAction={{
        label: cancelLabel,
        onClick: onClose,
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  Toast,
  ToastVariant,
  ToastContextType,
  iOSAlertProps,
  iOSConfirmProps,
  iOSToastProviderProps,
}
