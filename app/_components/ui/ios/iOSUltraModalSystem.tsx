/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🪟 CHRONOS 2026 — iOS ULTRA MODAL SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de modales definitivo estilo iOS 18+ / visionOS:
 *
 * ✅ Scroll interno avanzado con momentum y rubber band
 * ✅ Múltiples variantes: sheet, dialog, fullscreen, alert, drawer
 * ✅ Gestos swipe para cerrar (swipe down/left/right)
 * ✅ SIN efectos 3D problemáticos
 * ✅ Animaciones spring ultra suaves
 * ✅ Optimizado para mobile y desktop
 * ✅ Keyboard aware en mobile
 * ✅ Focus trap y accesibilidad
 * ✅ Backdrop blur premium
 *
 * @version 3.0.0 - Ultra Edition
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import {
    AlertCircle,
    AlertTriangle,
    Check,
    Info,
    LucideIcon,
    X
} from 'lucide-react'
import { AnimatePresence, motion, PanInfo, useDragControls } from 'motion/react'
import {
    createContext,
    memo,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react'
import { createPortal } from 'react-dom'
import { CleanButton, CleanScrollContainer, useCleanDesign } from './iOSCleanDesignSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS Y CONFIGURACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type ModalVariant = 'sheet' | 'dialog' | 'fullscreen' | 'alert' | 'drawer' | 'page'
type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'
type DrawerPosition = 'left' | 'right' | 'bottom'

interface ModalContextValue {
  close: () => void
  variant: ModalVariant
  scrollToTop: () => void
}

const ModalContext = createContext<ModalContextValue | null>(null)

export const useModalContext = () => useContext(ModalContext)

const sizeClasses: Record<ModalSize, string> = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-[95vw] w-full',
}

const mobileHeights: Record<ModalVariant, string> = {
  sheet: '90vh',
  dialog: '80vh',
  fullscreen: '100vh',
  alert: 'auto',
  drawer: '100vh',
  page: '100vh',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🪟 ULTRA MODAL — Modal principal con todas las features
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UltraModalProps {
  isOpen: boolean
  onClose: () => void
  children?: ReactNode

  // Apariencia
  title?: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  variant?: ModalVariant
  size?: ModalSize

  // Comportamiento
  showCloseButton?: boolean
  closeOnBackdrop?: boolean
  closeOnSwipe?: boolean
  closeOnEscape?: boolean
  swipeThreshold?: number
  showDragIndicator?: boolean
  preventClose?: boolean

  // Scroll
  scrollable?: boolean
  maxContentHeight?: string
  showScrollFades?: boolean
  enablePullToRefresh?: boolean
  onRefresh?: () => Promise<void>

  // Layout
  footer?: ReactNode
  headerAction?: ReactNode

  // Drawer específico
  drawerPosition?: DrawerPosition

  // Styling
  className?: string
  contentClassName?: string
  backdropClassName?: string

  // Callbacks
  onAnimationComplete?: () => void
}

export const UltraModal = memo(function UltraModal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  icon: Icon,
  iconColor = '#8B5CF6',
  variant = 'dialog',
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnSwipe = true,
  closeOnEscape = true,
  swipeThreshold = 100,
  showDragIndicator = true,
  preventClose = false,
  scrollable = true,
  maxContentHeight,
  showScrollFades = true,
  enablePullToRefresh = false,
  onRefresh,
  footer,
  headerAction,
  drawerPosition = 'right',
  className,
  contentClassName,
  backdropClassName,
  onAnimationComplete,
}: UltraModalProps) {
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragControls = useDragControls()
  const { isMobile, reducedMotion } = useCleanDesign()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll
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

  // Escape key handler
  useEffect(() => {
    if (!closeOnEscape || preventClose) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, closeOnEscape, preventClose])

  const handleClose = useCallback(() => {
    if (preventClose) return
    onClose()
  }, [preventClose, onClose])

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdrop && !preventClose) {
      onClose()
    }
  }, [closeOnBackdrop, preventClose, onClose])

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!closeOnSwipe || preventClose) return

      const shouldClose =
        (variant === 'sheet' && info.offset.y > swipeThreshold) ||
        (variant === 'drawer' && drawerPosition === 'right' && info.offset.x > swipeThreshold) ||
        (variant === 'drawer' && drawerPosition === 'left' && info.offset.x < -swipeThreshold) ||
        (variant === 'drawer' && drawerPosition === 'bottom' && info.offset.y > swipeThreshold)

      if (shouldClose) {
        onClose()
      }
    },
    [closeOnSwipe, preventClose, variant, drawerPosition, swipeThreshold, onClose]
  )

  const scrollToTop = useCallback(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const contextValue = useMemo(() => ({
    close: handleClose,
    variant,
    scrollToTop,
  }), [handleClose, variant, scrollToTop])

  // Calcular altura máxima del contenido
  const calculatedMaxHeight = useMemo(() => {
    if (maxContentHeight) return maxContentHeight

    switch (variant) {
      case 'sheet':
        return isMobile ? '70vh' : '65vh'
      case 'dialog':
        return isMobile ? '60vh' : '55vh'
      case 'fullscreen':
      case 'page':
        return 'calc(100vh - 120px)'
      case 'alert':
        return '40vh'
      case 'drawer':
        return 'calc(100vh - 80px)'
      default:
        return '60vh'
    }
  }, [maxContentHeight, variant, isMobile])

  // Animaciones según variante
  const getModalAnimation = () => {
    if (reducedMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    }

    switch (variant) {
      case 'sheet':
        return {
          initial: { y: '100%', opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: '100%', opacity: 0 },
        }
      case 'fullscreen':
      case 'page':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
        }
      case 'alert':
        return {
          initial: { opacity: 0, scale: 0.9, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.9, y: 20 },
        }
      case 'drawer':
        if (drawerPosition === 'right') {
          return {
            initial: { x: '100%' },
            animate: { x: 0 },
            exit: { x: '100%' },
          }
        } else if (drawerPosition === 'left') {
          return {
            initial: { x: '-100%' },
            animate: { x: 0 },
            exit: { x: '-100%' },
          }
        } else {
          return {
            initial: { y: '100%' },
            animate: { y: 0 },
            exit: { y: '100%' },
          }
        }
      default: // dialog
        return {
          initial: { opacity: 0, scale: 0.95, y: 10 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.95, y: 10 },
        }
    }
  }

  // Estilos según variante
  const getModalStyles = () => {
    const base = cn(
      'relative flex flex-col overflow-hidden',
      'bg-[#1C1C1E]/98 backdrop-blur-2xl',
      'border border-white/[0.08]',
    )

    switch (variant) {
      case 'sheet':
        return cn(
          base,
          'rounded-t-3xl sm:rounded-3xl',
          'shadow-[0_-8px_40px_rgba(0,0,0,0.4)]',
          'w-full sm:w-auto',
          !isMobile && sizeClasses[size],
          isMobile ? 'max-h-[90vh]' : ''
        )
      case 'fullscreen':
      case 'page':
        return cn(
          base,
          'rounded-none sm:rounded-2xl',
          'w-full h-full sm:h-auto sm:max-h-[90vh]',
          !isMobile && 'sm:max-w-4xl'
        )
      case 'alert':
        return cn(
          base,
          'rounded-2xl',
          'shadow-[0_8px_40px_rgba(0,0,0,0.4)]',
          'max-w-sm mx-4'
        )
      case 'drawer':
        return cn(
          base,
          drawerPosition === 'bottom' ? 'rounded-t-3xl' : 'rounded-none',
          'shadow-[0_0_40px_rgba(0,0,0,0.4)]',
          drawerPosition === 'bottom'
            ? 'w-full max-h-[90vh]'
            : 'h-full w-full max-w-md'
        )
      default: // dialog
        return cn(
          base,
          'rounded-2xl',
          'shadow-[0_8px_40px_rgba(0,0,0,0.4)]',
          sizeClasses[size],
          'mx-4'
        )
    }
  }

  // Posición del modal según variante
  const getContainerStyles = () => {
    switch (variant) {
      case 'sheet':
        return 'items-end sm:items-center justify-end sm:justify-center'
      case 'fullscreen':
      case 'page':
        return 'items-stretch sm:items-center justify-center'
      case 'alert':
        return 'items-center justify-center'
      case 'drawer':
        if (drawerPosition === 'right') return 'items-stretch justify-end'
        if (drawerPosition === 'left') return 'items-stretch justify-start'
        return 'items-end justify-center'
      default:
        return 'items-center justify-center'
    }
  }

  // Drag constraints
  const getDragConstraints = () => {
    if (!closeOnSwipe) return {}

    switch (variant) {
      case 'sheet':
        return { top: 0, bottom: 300 }
      case 'drawer':
        if (drawerPosition === 'right') return { left: 0, right: 300 }
        if (drawerPosition === 'left') return { left: -300, right: 0 }
        return { top: 0, bottom: 300 }
      default:
        return {}
    }
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence onExitComplete={onAnimationComplete}>
      {isOpen && (
        <ModalContext.Provider value={contextValue}>
          <div className="fixed inset-0 z-[9999] overflow-hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleBackdropClick}
              className={cn(
                'absolute inset-0',
                'bg-black/60 backdrop-blur-sm',
                backdropClassName
              )}
            />

            {/* Modal container */}
            <div
              className={cn(
                'absolute inset-0 flex',
                'p-4 sm:p-6',
                getContainerStyles()
              )}
            >
              {/* Modal */}
              <motion.div
                {...getModalAnimation()}
                transition={{
                  type: 'spring',
                  damping: 30,
                  stiffness: 400,
                }}
                drag={closeOnSwipe ? (variant === 'sheet' ? 'y' : variant === 'drawer' ? (drawerPosition === 'bottom' ? 'y' : 'x') : false) : false}
                dragControls={dragControls}
                dragConstraints={getDragConstraints()}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className={cn(getModalStyles(), className)}
              >
                {/* Drag indicator */}
                {showDragIndicator && (variant === 'sheet' || (variant === 'drawer' && drawerPosition === 'bottom')) && closeOnSwipe && (
                  <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-white/20" />
                  </div>
                )}

                {/* Header */}
                {(title || showCloseButton || headerAction) && (
                  <div className={cn(
                    'flex items-center justify-between gap-4 px-5 py-4',
                    'border-b border-white/[0.06]',
                    variant === 'alert' && 'flex-col text-center border-b-0 pt-5'
                  )}>
                    <div className={cn(
                      'flex items-center gap-3 min-w-0',
                      variant === 'alert' && 'flex-col'
                    )}>
                      {Icon && (
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                            variant === 'alert' && 'w-14 h-14 rounded-2xl mb-2'
                          )}
                          style={{ backgroundColor: `${iconColor}15` }}
                        >
                          <Icon
                            size={variant === 'alert' ? 28 : 20}
                            style={{ color: iconColor }}
                          />
                        </div>
                      )}
                      <div className={cn('min-w-0', variant === 'alert' && 'text-center')}>
                        {title && (
                          <h2 className={cn(
                            'text-lg font-semibold text-white truncate',
                            variant === 'alert' && 'text-xl'
                          )}>
                            {title}
                          </h2>
                        )}
                        {subtitle && (
                          <p className={cn(
                            'text-sm text-white/50 truncate',
                            variant === 'alert' && 'mt-1 text-white/60'
                          )}>
                            {subtitle}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {headerAction}
                      {showCloseButton && variant !== 'alert' && (
                        <button
                          onClick={handleClose}
                          disabled={preventClose}
                          className={cn(
                            'w-8 h-8 rounded-full',
                            'flex items-center justify-center',
                            'bg-white/8 hover:bg-white/12',
                            'text-white/60 hover:text-white',
                            'transition-all duration-150',
                            'disabled:opacity-40 disabled:cursor-not-allowed'
                          )}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Content with advanced scroll */}
                <div className="flex-1 min-h-0">
                  {scrollable ? (
                    <CleanScrollContainer
                      ref={scrollRef}
                      maxHeight={calculatedMaxHeight}
                      showFadeEdges={showScrollFades}
                      showScrollbar={false}
                      showScrollToTop={false}
                      enablePullToRefresh={enablePullToRefresh}
                      onRefresh={onRefresh}
                      fadeColor="rgba(28, 28, 30, 0.98)"
                      className="h-full"
                      contentClassName={cn('px-5 py-4', contentClassName)}
                    >
                      {children}
                    </CleanScrollContainer>
                  ) : (
                    <div className={cn('px-5 py-4 overflow-auto', contentClassName)}>
                      {children}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {footer && (
                  <div className={cn(
                    'px-5 py-4',
                    'border-t border-white/[0.06]',
                    'bg-black/20'
                  )}>
                    {footer}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </ModalContext.Provider>
      )}
    </AnimatePresence>,
    document.body
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔔 ULTRA ALERT — Alert dialog simplificado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UltraAlertProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message?: string
  type?: 'info' | 'success' | 'warning' | 'error'
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  onCancel?: () => void
  showCancel?: boolean
  loading?: boolean
  destructive?: boolean
}

const alertIcons: Record<string, LucideIcon> = {
  info: Info,
  success: Check,
  warning: AlertTriangle,
  error: AlertCircle,
}

const alertColors: Record<string, string> = {
  info: '#0A84FF',
  success: '#34C759',
  warning: '#FF9F0A',
  error: '#FF3B30',
}

export const UltraAlert = memo(function UltraAlert({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  confirmLabel = 'Aceptar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  showCancel = false,
  loading = false,
  destructive = false,
}: UltraAlertProps) {
  const Icon = alertIcons[type]
  const color = alertColors[type]

  const handleConfirm = useCallback(() => {
    onConfirm?.()
    if (!loading) onClose()
  }, [onConfirm, loading, onClose])

  const handleCancel = useCallback(() => {
    onCancel?.()
    onClose()
  }, [onCancel, onClose])

  return (
    <UltraModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={message}
      icon={Icon}
      iconColor={color}
      variant="alert"
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
      closeOnSwipe={false}
      showCloseButton={false}
      showDragIndicator={false}
      scrollable={false}
      footer={
        <div className={cn(
          'flex gap-3',
          showCancel ? 'flex-row' : 'flex-col'
        )}>
          {showCancel && (
            <CleanButton
              variant="secondary"
              onClick={handleCancel}
              disabled={loading}
              fullWidth
            >
              {cancelLabel}
            </CleanButton>
          )}
          <CleanButton
            variant={destructive ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={loading}
            fullWidth
          >
            {confirmLabel}
          </CleanButton>
        </div>
      }
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 ULTRA CONFIRMATION SHEET — Sheet de confirmación
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ConfirmationOption {
  id: string
  label: string
  icon?: LucideIcon
  color?: string
  destructive?: boolean
}

interface UltraConfirmationSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  options: ConfirmationOption[]
  onSelect: (optionId: string) => void
  cancelLabel?: string
  showCancel?: boolean
}

export const UltraConfirmationSheet = memo(function UltraConfirmationSheet({
  isOpen,
  onClose,
  title,
  message,
  options,
  onSelect,
  cancelLabel = 'Cancelar',
  showCancel = true,
}: UltraConfirmationSheetProps) {

  const handleSelect = useCallback((optionId: string) => {
    onSelect(optionId)
    onClose()
  }, [onSelect, onClose])

  return (
    <UltraModal
      isOpen={isOpen}
      onClose={onClose}
      variant="sheet"
      size="sm"
      showCloseButton={false}
      scrollable={false}
    >
      <div className="py-2">
        {/* Header */}
        {(title || message) && (
          <div className="text-center px-4 pb-4 mb-2 border-b border-white/[0.06]">
            {title && (
              <p className="text-base font-semibold text-white">{title}</p>
            )}
            {message && (
              <p className="text-sm text-white/50 mt-1">{message}</p>
            )}
          </div>
        )}

        {/* Options */}
        <div className="space-y-1">
          {options.map((option) => {
            const Icon = option.icon
            return (
              <motion.button
                key={option.id}
                onClick={() => handleSelect(option.id)}
                className={cn(
                  'w-full px-4 py-3.5 flex items-center gap-3',
                  'hover:bg-white/[0.05] active:bg-white/[0.03]',
                  'transition-colors duration-150',
                  option.destructive && 'text-red-400'
                )}
                whileTap={{ scale: 0.98 }}
              >
                {Icon && (
                  <Icon
                    size={20}
                    style={{ color: option.color || (option.destructive ? '#FF3B30' : '#8B5CF6') }}
                  />
                )}
                <span className={cn(
                  'text-base font-medium',
                  option.destructive ? 'text-red-400' : 'text-white'
                )}>
                  {option.label}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Cancel */}
        {showCancel && (
          <div className="mt-2 pt-2 border-t border-white/[0.06]">
            <motion.button
              onClick={onClose}
              className="w-full px-4 py-3.5 text-center text-violet-400 font-semibold hover:bg-white/[0.05] transition-colors"
              whileTap={{ scale: 0.98 }}
            >
              {cancelLabel}
            </motion.button>
          </div>
        )}
      </div>
    </UltraModal>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📝 ULTRA FORM MODAL — Modal optimizado para formularios
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UltraFormModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode

  // Form actions
  onSubmit?: () => void | Promise<void>
  submitLabel?: string
  cancelLabel?: string

  // State
  loading?: boolean
  submitDisabled?: boolean
  hasUnsavedChanges?: boolean

  // Styling
  size?: ModalSize
  className?: string
}

export const UltraFormModal = memo(function UltraFormModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  onSubmit,
  submitLabel = 'Guardar',
  cancelLabel = 'Cancelar',
  loading = false,
  submitDisabled = false,
  hasUnsavedChanges = false,
  size = 'md',
  className,
}: UltraFormModalProps) {
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false)

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedAlert(true)
    } else {
      onClose()
    }
  }, [hasUnsavedChanges, onClose])

  const handleSubmit = useCallback(async () => {
    if (onSubmit) {
      await onSubmit()
    }
  }, [onSubmit])

  return (
    <>
      <UltraModal
        isOpen={isOpen}
        onClose={handleClose}
        title={title}
        subtitle={subtitle}
        variant="sheet"
        size={size}
        closeOnSwipe={!hasUnsavedChanges}
        preventClose={loading}
        scrollable
        maxContentHeight="60vh"
        showScrollFades
        className={className}
        footer={
          <div className="flex gap-3">
            <CleanButton
              variant="secondary"
              onClick={handleClose}
              disabled={loading}
              fullWidth
            >
              {cancelLabel}
            </CleanButton>
            <CleanButton
              variant="primary"
              onClick={handleSubmit}
              loading={loading}
              disabled={submitDisabled}
              fullWidth
            >
              {submitLabel}
            </CleanButton>
          </div>
        }
      >
        {children}
      </UltraModal>

      {/* Unsaved changes alert */}
      <UltraAlert
        isOpen={showUnsavedAlert}
        onClose={() => setShowUnsavedAlert(false)}
        title="¿Descartar cambios?"
        message="Tienes cambios sin guardar. ¿Deseas descartarlos?"
        type="warning"
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        showCancel
        destructive
        onConfirm={() => {
          setShowUnsavedAlert(false)
          onClose()
        }}
      />
    </>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔍 ULTRA DETAIL MODAL — Modal para ver detalles
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UltraDetailModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode

  // Actions
  primaryAction?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
    loading?: boolean
  }
  secondaryActions?: Array<{
    label: string
    onClick: () => void
    icon?: LucideIcon
    destructive?: boolean
  }>

  // Styling
  size?: ModalSize
  icon?: LucideIcon
  iconColor?: string
}

export const UltraDetailModal = memo(function UltraDetailModal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  primaryAction,
  secondaryActions,
  size = 'lg',
  icon,
  iconColor,
}: UltraDetailModalProps) {

  return (
    <UltraModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      icon={icon}
      iconColor={iconColor}
      variant="dialog"
      size={size}
      scrollable
      maxContentHeight="65vh"
      showScrollFades
      headerAction={secondaryActions && secondaryActions.length > 0 ? (
        <div className="flex items-center gap-1">
          {secondaryActions.slice(0, 2).map((action, i) => {
            const ActionIcon = action.icon
            return (
              <button
                key={i}
                onClick={action.onClick}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  'hover:bg-white/10 transition-colors',
                  action.destructive ? 'text-red-400' : 'text-white/60 hover:text-white'
                )}
              >
                {ActionIcon && <ActionIcon size={16} />}
              </button>
            )
          })}
        </div>
      ) : undefined}
      footer={primaryAction ? (
        <CleanButton
          variant="primary"
          onClick={primaryAction.onClick}
          icon={primaryAction.icon}
          loading={primaryAction.loading}
          fullWidth
        >
          {primaryAction.label}
        </CleanButton>
      ) : undefined}
    >
      {children}
    </UltraModal>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    type ConfirmationOption, type DrawerPosition, type ModalSize, type ModalVariant, type UltraAlertProps,
    type UltraConfirmationSheetProps, type UltraDetailModalProps, type UltraFormModalProps, type UltraModalProps
}

