/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🪟 CHRONOS 2026 — iOS PREMIUM MODAL SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de modales premium con:
 * - Scroll interno avanzado con rubber band
 * - Diseño iOS-style limpio y elegante
 * - Múltiples variantes (sheet, fullscreen, popup)
 * - Gestos de deslizamiento para cerrar
 * - Sin efectos 3D inmersivos problemáticos
 * - Optimización para mobile
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import {
  AnimatePresence,
  motion,
  PanInfo,
  useMotionValue,
  useSpring,
  useTransform,
} from 'motion/react'
import { Loader2, X } from 'lucide-react'
import {
  createContext,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  variant?: 'sheet' | 'popup' | 'fullscreen' | 'pageSheet'
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnSwipe?: boolean
  swipeThreshold?: number
  showDragIndicator?: boolean
  footer?: ReactNode
  headerAction?: ReactNode
  className?: string
  contentClassName?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-[95vw] w-full',
}

const variantConfig = {
  sheet: {
    position: 'bottom' as const,
    roundedTop: true,
    roundedBottom: false,
    maxHeight: '90vh',
    animation: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
  },
  popup: {
    position: 'center' as const,
    roundedTop: true,
    roundedBottom: true,
    maxHeight: '85vh',
    animation: {
      initial: { opacity: 0, scale: 0.95, y: 10 },
      animate: { opacity: 1, scale: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95, y: 10 },
    },
  },
  fullscreen: {
    position: 'fullscreen' as const,
    roundedTop: false,
    roundedBottom: false,
    maxHeight: '100vh',
    animation: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
  },
  pageSheet: {
    position: 'center' as const,
    roundedTop: true,
    roundedBottom: true,
    maxHeight: '92vh',
    animation: {
      initial: { y: 50, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: 50, opacity: 0 },
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCROLL CONTAINER INTERNO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ModalScrollContainerProps {
  children: ReactNode
  className?: string
  maxHeight?: string
}

const ModalScrollContainer = memo(function ModalScrollContainer({
  children,
  className,
  maxHeight = 'calc(90vh - 160px)',
}: ModalScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showTopShadow, setShowTopShadow] = useState(false)
  const [showBottomShadow, setShowBottomShadow] = useState(false)

  const handleScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    setShowTopShadow(scrollTop > 10)
    setShowBottomShadow(scrollTop < scrollHeight - clientHeight - 10)
  }, [])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    // Check initial state
    handleScroll()

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div className="relative">
      {/* Top shadow indicator */}
      <motion.div
        className="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-black/20 to-transparent pointer-events-none z-10"
        initial={false}
        animate={{ opacity: showTopShadow ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className={cn(
          'overflow-y-auto overscroll-contain',
          // Custom scrollbar styling
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
          'hover:scrollbar-thumb-white/20',
          className
        )}
        style={{
          maxHeight,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>

      {/* Bottom shadow indicator */}
      <motion.div
        className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10"
        initial={false}
        animate={{ opacity: showBottomShadow ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const iOSModal = memo(function iOSModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  variant = 'popup',
  size = 'lg',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnSwipe = true,
  swipeThreshold = 100,
  showDragIndicator = true,
  footer,
  headerAction,
  className,
  contentClassName,
}: iOSModalProps) {
  const [isMounted, setIsMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Drag controls
  const dragY = useMotionValue(0)
  const smoothDragY = useSpring(dragY, { stiffness: 300, damping: 30 })
  const backdropOpacity = useTransform(smoothDragY, [0, 300], [1, 0])

  const config = variantConfig[variant]

  // Mount state for portal
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Drag handlers
  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (closeOnSwipe && info.offset.y > swipeThreshold) {
        onClose()
      } else {
        dragY.set(0)
      }
    },
    [closeOnSwipe, swipeThreshold, onClose, dragY]
  )

  if (!isMounted || typeof window === 'undefined') return null

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[100]"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              opacity: backdropOpacity,
            }}
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Modal container */}
          <div
            className={cn(
              'fixed inset-0 z-[101] overflow-hidden',
              config.position === 'bottom' && 'flex flex-col justify-end',
              config.position === 'center' && 'flex items-center justify-center p-4',
              config.position === 'fullscreen' && 'flex'
            )}
          >
            <motion.div
              ref={modalRef}
              {...config.animation}
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 35,
                mass: 0.8,
              }}
              drag={closeOnSwipe && variant === 'sheet' ? 'y' : false}
              dragConstraints={{ top: 0 }}
              dragElastic={0.3}
              onDragEnd={handleDragEnd}
              style={{ y: smoothDragY }}
              className={cn(
                'relative w-full overflow-hidden',
                'bg-[#1C1C1E]/98 backdrop-blur-xl',
                'border border-white/[0.08]',
                config.roundedTop && 'rounded-t-3xl',
                config.roundedBottom && 'rounded-b-3xl',
                config.position === 'center' && 'rounded-3xl',
                config.position !== 'fullscreen' && sizeClasses[size],
                variant === 'fullscreen' && 'h-full',
                className
              )}
              style={{ maxHeight: config.maxHeight }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drag indicator for sheets */}
              {showDragIndicator && (variant === 'sheet' || variant === 'pageSheet') && (
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-9 h-1 rounded-full bg-white/30" />
                </div>
              )}

              {/* Header */}
              {(title || showCloseButton || headerAction) && (
                <div
                  className={cn(
                    'sticky top-0 z-20 flex items-center justify-between px-5 py-4',
                    'bg-[#1C1C1E]/90 backdrop-blur-xl',
                    'border-b border-white/[0.08]'
                  )}
                >
                  {/* Left section */}
                  <div className="flex-1 min-w-[60px]">
                    {showCloseButton && variant !== 'sheet' && (
                      <motion.button
                        onClick={onClose}
                        className={cn(
                          'p-2 -ml-2 rounded-full',
                          'text-white/60 hover:text-white',
                          'hover:bg-white/[0.08] active:bg-white/[0.12]',
                          'transition-colors duration-150'
                        )}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    )}
                  </div>

                  {/* Center - Title */}
                  <div className="flex-[2] text-center">
                    {title && (
                      <h2 className="text-[17px] font-semibold text-white truncate">
                        {title}
                      </h2>
                    )}
                    {subtitle && (
                      <p className="text-[13px] text-white/50 truncate mt-0.5">
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {/* Right section */}
                  <div className="flex-1 flex justify-end min-w-[60px]">
                    {headerAction}
                    {showCloseButton && variant === 'sheet' && (
                      <motion.button
                        onClick={onClose}
                        className={cn(
                          'p-2 rounded-full',
                          'bg-white/[0.08] text-white/60 hover:text-white',
                          'hover:bg-white/[0.12] active:bg-white/[0.16]',
                          'transition-colors duration-150'
                        )}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    )}
                  </div>
                </div>
              )}

              {/* Content with scroll */}
              <ModalScrollContainer
                className={cn('px-5', contentClassName)}
                maxHeight={
                  footer
                    ? 'calc(90vh - 200px)'
                    : title
                    ? 'calc(90vh - 120px)'
                    : 'calc(90vh - 60px)'
                }
              >
                <div className="py-4">{children}</div>
              </ModalScrollContainer>

              {/* Footer */}
              {footer && (
                <div
                  className={cn(
                    'sticky bottom-0 z-20 px-5 py-4',
                    'bg-[#1C1C1E]/90 backdrop-blur-xl',
                    'border-t border-white/[0.08]',
                    'safe-area-inset-bottom'
                  )}
                >
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS ALERT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSAlertProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message?: string
  primaryAction?: {
    label: string
    onClick: () => void
    destructive?: boolean
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
  primaryAction,
  secondaryAction,
}: iOSAlertProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted || typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Alert */}
          <div className="fixed inset-0 z-[111] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="w-full max-w-[270px] bg-[#2C2C2E]/95 backdrop-blur-xl rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Content */}
              <div className="px-4 pt-5 pb-4 text-center">
                <h2 className="text-[17px] font-semibold text-white">
                  {title}
                </h2>
                {message && (
                  <p className="mt-2 text-[13px] text-white/70 leading-relaxed">
                    {message}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="border-t border-white/[0.15] flex">
                {secondaryAction && (
                  <>
                    <motion.button
                      onClick={() => {
                        secondaryAction.onClick()
                        onClose()
                      }}
                      className="flex-1 py-3 text-[17px] text-violet-400 font-medium hover:bg-white/[0.05] active:bg-white/[0.1] transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      {secondaryAction.label}
                    </motion.button>
                    <div className="w-px bg-white/[0.15]" />
                  </>
                )}
                <motion.button
                  onClick={() => {
                    primaryAction?.onClick()
                    onClose()
                  }}
                  className={cn(
                    'flex-1 py-3 text-[17px] font-semibold',
                    'hover:bg-white/[0.05] active:bg-white/[0.1] transition-colors',
                    primaryAction?.destructive ? 'text-red-400' : 'text-violet-400'
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  {primaryAction?.label || 'OK'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS CONFIRMATION SHEET
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSConfirmationSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void | Promise<void>
  variant?: 'default' | 'destructive'
  loading?: boolean
}

export const iOSConfirmationSheet = memo(function iOSConfirmationSheet({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  variant = 'default',
  loading = false,
}: iOSConfirmationSheetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleConfirm = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }, [onConfirm, onClose])

  return (
    <iOSModal
      isOpen={isOpen}
      onClose={onClose}
      variant="sheet"
      size="md"
      showCloseButton={false}
      showDragIndicator={true}
      closeOnSwipe={!isSubmitting}
      footer={
        <div className="flex flex-col gap-2">
          <motion.button
            onClick={handleConfirm}
            disabled={isSubmitting || loading}
            className={cn(
              'w-full py-3.5 rounded-xl text-[17px] font-semibold',
              'transition-colors duration-150',
              variant === 'destructive'
                ? 'bg-red-500 text-white hover:bg-red-400 active:bg-red-600'
                : 'bg-violet-500 text-white hover:bg-violet-400 active:bg-violet-600',
              (isSubmitting || loading) && 'opacity-50 cursor-not-allowed'
            )}
            whileTap={!isSubmitting && !loading ? { scale: 0.98 } : undefined}
          >
            {isSubmitting || loading ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
            ) : (
              confirmLabel
            )}
          </motion.button>
          <motion.button
            onClick={onClose}
            disabled={isSubmitting}
            className={cn(
              'w-full py-3.5 rounded-xl text-[17px] font-medium',
              'bg-white/[0.08] text-white/80 hover:bg-white/[0.12] active:bg-white/[0.16]',
              'transition-colors duration-150',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
            whileTap={!isSubmitting ? { scale: 0.98 } : undefined}
          >
            {cancelLabel}
          </motion.button>
        </div>
      }
    >
      <div className="text-center py-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {message && (
          <p className="mt-3 text-[15px] text-white/60 leading-relaxed">
            {message}
          </p>
        )}
      </div>
    </iOSModal>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { ModalScrollContainer }

export type {
  iOSModalProps,
  iOSAlertProps,
  iOSConfirmationSheetProps,
}
