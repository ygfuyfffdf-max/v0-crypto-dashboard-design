/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🪟 CHRONOS 2026 — iOS CLEAN MODAL SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de modales estilo iOS 18+ con:
 * - Scroll interno avanzado con fade edges
 * - Múltiples tamaños y variantes
 * - Gestos de deslizamiento para cerrar (swipe down)
 * - Diseño limpio sin efectos 3D problemáticos
 * - Animaciones suaves spring-based
 * - Optimización para mobile
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, PanInfo, useDragControls } from 'motion/react'
import { X, Loader2, Check, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import { memo, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { FormScrollContainer } from './EnhancedScrollSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CleanModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  variant?: 'sheet' | 'dialog' | 'fullscreen' | 'alert'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnSwipe?: boolean
  swipeThreshold?: number
  showDragIndicator?: boolean
  footer?: ReactNode
  headerAction?: ReactNode
  className?: string
  contentClassName?: string
  scrollable?: boolean
  maxContentHeight?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const sizeClasses = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-[95vw] md:max-w-5xl w-full',
}

const mobileHeights = {
  sheet: '85vh',
  dialog: '70vh',
  fullscreen: '100vh',
  alert: 'auto',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CLEAN MODAL - Modal principal
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const CleanModal = memo(function CleanModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  variant = 'dialog',
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnSwipe = true,
  swipeThreshold = 100,
  showDragIndicator = true,
  footer,
  headerAction,
  className,
  contentClassName,
  scrollable = true,
  maxContentHeight = '60vh',
}: CleanModalProps) {
  const [mounted, setMounted] = useState(false)
  const dragY = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!mounted) return

    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [isOpen, mounted])

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (closeOnSwipe && info.offset.y > swipeThreshold) {
        onClose()
      }
    },
    [closeOnSwipe, swipeThreshold, onClose]
  )

  const getAnimation = () => {
    switch (variant) {
      case 'sheet':
        return {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
        }
      case 'fullscreen':
        return {
          initial: { y: '100%', opacity: 0.5 },
          animate: { y: 0, opacity: 1 },
          exit: { y: '100%', opacity: 0 },
        }
      case 'alert':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.9 },
        }
      default: // dialog
        return {
          initial: { opacity: 0, scale: 0.95, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.95, y: 20 },
        }
    }
  }

  if (!mounted) return null

  const content = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            className={cn(
              'fixed inset-0 z-50',
              'bg-black/60 backdrop-blur-sm',
              closeOnBackdrop && 'cursor-pointer'
            )}
          />

          {/* Modal Container */}
          <div
            className={cn(
              'fixed inset-0 z-50 flex items-end md:items-center justify-center',
              variant === 'fullscreen' && 'items-stretch',
              'pointer-events-none'
            )}
          >
            {/* Modal */}
            <motion.div
              {...getAnimation()}
              transition={{
                type: 'spring',
                damping: 30,
                stiffness: 300,
              }}
              drag={closeOnSwipe && variant !== 'alert' ? 'y' : false}
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={handleDragEnd}
              className={cn(
                'pointer-events-auto relative flex flex-col',
                'bg-zinc-900/95 backdrop-blur-2xl',
                'border border-white/[0.08]',
                'shadow-[0_-8px_40px_rgba(0,0,0,0.4),0_8px_40px_rgba(0,0,0,0.4)]',
                // Rounded corners
                variant === 'sheet' && 'rounded-t-3xl md:rounded-3xl',
                variant === 'dialog' && 'rounded-2xl md:rounded-3xl',
                variant === 'alert' && 'rounded-2xl',
                variant === 'fullscreen' && 'rounded-none',
                // Size
                variant !== 'fullscreen' && sizeClasses[size],
                variant !== 'fullscreen' && 'w-full mx-4 md:mx-auto',
                // Max height
                variant !== 'fullscreen' && `max-h-[${mobileHeights[variant]}] md:max-h-[85vh]`,
                variant === 'fullscreen' && 'w-full h-full',
                className
              )}
            >
              {/* Drag indicator */}
              {showDragIndicator && closeOnSwipe && variant !== 'alert' && (
                <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
                  <div className="w-10 h-1 rounded-full bg-white/20" />
                </div>
              )}

              {/* Header */}
              {(title || showCloseButton || headerAction) && (
                <div className={cn(
                  'flex items-center justify-between gap-4 px-5 py-4',
                  'border-b border-white/[0.06]',
                  !showDragIndicator && 'pt-5'
                )}>
                  <div className="flex-1 min-w-0">
                    {title && (
                      <h2 className="text-lg font-semibold text-white truncate">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-sm text-white/50 truncate mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {headerAction}
                    {showCloseButton && (
                      <button
                        onClick={onClose}
                        className={cn(
                          'w-8 h-8 rounded-full',
                          'bg-white/[0.06] hover:bg-white/[0.1]',
                          'flex items-center justify-center',
                          'transition-colors duration-150'
                        )}
                      >
                        <X className="w-4 h-4 text-white/60" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Content */}
              <div className={cn('flex-1 min-h-0', contentClassName)}>
                {scrollable ? (
                  <FormScrollContainer maxHeight={variant === 'fullscreen' ? '100%' : maxContentHeight}>
                    <div className="px-5 py-4">
                      {children}
                    </div>
                  </FormScrollContainer>
                ) : (
                  <div className="px-5 py-4">
                    {children}
                  </div>
                )}
              </div>

              {/* Footer */}
              {footer && (
                <div className="flex-shrink-0 px-5 py-4 border-t border-white/[0.06]">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(content, document.body)
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CLEAN ALERT - Alertas tipo iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CleanAlertProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  title: string
  message?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  loading?: boolean
  destructive?: boolean
}

export const CleanAlert = memo(function CleanAlert({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'info',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  showCancel = false,
  loading = false,
  destructive = false,
}: CleanAlertProps) {
  const typeConfig = {
    info: { icon: Info, color: '#3B82F6' },
    success: { icon: Check, color: '#10B981' },
    warning: { icon: AlertTriangle, color: '#F59E0B' },
    error: { icon: AlertCircle, color: '#EF4444' },
  }

  const { icon: Icon, color } = typeConfig[type]

  const footer = (
    <div className={cn(
      'flex gap-3',
      showCancel ? 'flex-col-reverse sm:flex-row' : 'flex-col'
    )}>
      {showCancel && (
        <button
          onClick={onClose}
          disabled={loading}
          className={cn(
            'flex-1 px-4 py-3 rounded-xl',
            'bg-white/[0.06] hover:bg-white/[0.1]',
            'text-white font-medium text-sm',
            'transition-colors duration-150',
            'disabled:opacity-50'
          )}
        >
          {cancelText}
        </button>
      )}
      <button
        onClick={() => {
          onConfirm?.()
          if (!loading) onClose()
        }}
        disabled={loading}
        className={cn(
          'flex-1 px-4 py-3 rounded-xl',
          'font-semibold text-sm',
          'flex items-center justify-center gap-2',
          'transition-all duration-150',
          'disabled:opacity-50',
          destructive
            ? 'bg-red-500/90 hover:bg-red-500 text-white'
            : 'bg-white/90 hover:bg-white text-black'
        )}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {confirmText}
      </button>
    </div>
  )

  return (
    <CleanModal
      isOpen={isOpen}
      onClose={onClose}
      variant="alert"
      size="xs"
      showCloseButton={false}
      closeOnSwipe={false}
      showDragIndicator={false}
      scrollable={false}
      footer={footer}
    >
      <div className="text-center py-2">
        {/* Icon */}
        <div
          className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon size={28} style={{ color }} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

        {/* Message */}
        {message && (
          <p className="text-sm text-white/60 leading-relaxed">{message}</p>
        )}
      </div>
    </CleanModal>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CLEAN CONFIRMATION SHEET - Confirmación tipo iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ConfirmationAction {
  label: string
  onClick: () => void
  variant?: 'default' | 'primary' | 'destructive'
  loading?: boolean
}

interface CleanConfirmationSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  actions: ConfirmationAction[]
  cancelLabel?: string
}

export const CleanConfirmationSheet = memo(function CleanConfirmationSheet({
  isOpen,
  onClose,
  title,
  message,
  actions,
  cancelLabel = 'Cancelar',
}: CleanConfirmationSheetProps) {
  return (
    <CleanModal
      isOpen={isOpen}
      onClose={onClose}
      variant="sheet"
      size="sm"
      showCloseButton={false}
      showDragIndicator={true}
      scrollable={false}
    >
      <div className="space-y-4 pb-2">
        {/* Header */}
        {(title || message) && (
          <div className="text-center px-4 pb-2">
            {title && (
              <h3 className="text-base font-semibold text-white mb-1">{title}</h3>
            )}
            {message && (
              <p className="text-sm text-white/50">{message}</p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.loading}
              className={cn(
                'w-full px-4 py-4 rounded-xl',
                'font-semibold text-sm',
                'flex items-center justify-center gap-2',
                'transition-all duration-150',
                'active:scale-[0.98]',
                action.variant === 'destructive' && 'bg-red-500/15 text-red-400 hover:bg-red-500/25',
                action.variant === 'primary' && 'bg-violet-500/90 text-white hover:bg-violet-500',
                action.variant === 'default' && 'bg-white/[0.06] text-white hover:bg-white/[0.1]',
                !action.variant && 'bg-white/[0.06] text-white hover:bg-white/[0.1]',
                action.loading && 'opacity-50'
              )}
            >
              {action.loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {action.label}
            </button>
          ))}
        </div>

        {/* Cancel */}
        <button
          onClick={onClose}
          className={cn(
            'w-full px-4 py-4 rounded-xl',
            'bg-white/[0.1] hover:bg-white/[0.15]',
            'text-white font-semibold text-sm',
            'transition-colors duration-150',
            'active:scale-[0.98]'
          )}
        >
          {cancelLabel}
        </button>
      </div>
    </CleanModal>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  CleanModalProps,
  CleanAlertProps,
  CleanConfirmationSheetProps,
  ConfirmationAction,
}
