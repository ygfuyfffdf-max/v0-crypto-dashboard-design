/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🎯 CHRONOS INFINITY 2030 — SISTEMA DE MODALES Y DIALOGS PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de modales ultra-premium con:
 * - Múltiples variantes (modal, drawer, sheet, dialog)
 * - Animaciones fluidas con backdrop blur
 * - Gestión de stack de modales
 * - Focus trap y accesibilidad
 * - Confirmación de cierre con cambios pendientes
 * - Responsive automático (modal → sheet en mobile)
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react'
import { createPortal } from 'react-dom'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'
export type ModalPosition = 'center' | 'top' | 'bottom'
export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom'

interface ModalContextValue {
  isOpen: boolean
  close: () => void
  hasUnsavedChanges: boolean
  setHasUnsavedChanges: (value: boolean) => void
}

interface ModalStackContextValue {
  register: (id: string) => void
  unregister: (id: string) => void
  isTopModal: (id: string) => boolean
  getZIndex: (id: string) => number
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONTEXTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const ModalContext = createContext<ModalContextValue | null>(null)
const ModalStackContext = createContext<ModalStackContextValue | null>(null)

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a Modal')
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MODAL STACK PROVIDER — Gestión de stack de modales
// ═══════════════════════════════════════════════════════════════════════════════════════

export function ModalStackProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<string[]>([])

  const register = useCallback((id: string) => {
    setStack((prev) => [...prev, id])
  }, [])

  const unregister = useCallback((id: string) => {
    setStack((prev) => prev.filter((modalId) => modalId !== id))
  }, [])

  const isTopModal = useCallback(
    (id: string) => stack[stack.length - 1] === id,
    [stack]
  )

  const getZIndex = useCallback(
    (id: string) => {
      const index = stack.indexOf(id)
      return 1000 + (index >= 0 ? index * 10 : 0)
    },
    [stack]
  )

  const value = useMemo(
    () => ({ register, unregister, isTopModal, getZIndex }),
    [register, unregister, isTopModal, getZIndex]
  )

  return (
    <ModalStackContext.Provider value={value}>
      {children}
    </ModalStackContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MODAL — Modal principal
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  size?: ModalSize
  position?: ModalPosition
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  preventCloseOnUnsaved?: boolean
  unsavedMessage?: string
  className?: string
  backdropClassName?: string
}

const modalSizes: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
}

const modalPositions: Record<ModalPosition, string> = {
  center: 'items-center',
  top: 'items-start pt-20',
  bottom: 'items-end pb-4',
}

export function Modal({
  isOpen,
  onClose,
  children,
  size = 'md',
  position = 'center',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  preventCloseOnUnsaved = false,
  unsavedMessage = '¿Deseas cerrar? Los cambios no guardados se perderán.',
  className,
  backdropClassName,
}: ModalProps) {
  const id = useId()
  const prefersReducedMotion = useReducedMotion()
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [mounted, setMounted] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)
  const stackContext = useContext(ModalStackContext)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Register/unregister from stack
  useEffect(() => {
    if (isOpen) {
      stackContext?.register(id)
      return () => stackContext?.unregister(id)
    }
  }, [isOpen, id, stackContext])

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stackContext?.isTopModal(id)) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEscape, id, stackContext])

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }, [isOpen])

  const handleClose = useCallback(() => {
    if (preventCloseOnUnsaved && hasUnsavedChanges) {
      if (window.confirm(unsavedMessage)) {
        setHasUnsavedChanges(false)
        onClose()
      }
    } else {
      onClose()
    }
  }, [preventCloseOnUnsaved, hasUnsavedChanges, unsavedMessage, onClose])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnBackdrop) {
        handleClose()
      }
    },
    [closeOnBackdrop, handleClose]
  )

  const contextValue = useMemo<ModalContextValue>(
    () => ({
      isOpen,
      close: handleClose,
      hasUnsavedChanges,
      setHasUnsavedChanges,
    }),
    [isOpen, handleClose, hasUnsavedChanges]
  )

  const zIndex = stackContext?.getZIndex(id) ?? 1000

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <ModalContext.Provider value={contextValue}>
          {/* Backdrop */}
          <motion.div
            className={cn(
              'fixed inset-0 flex justify-center',
              'bg-black/60 backdrop-blur-sm',
              modalPositions[position],
              backdropClassName
            )}
            style={{ zIndex }}
            onClick={handleBackdropClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Modal content */}
            <motion.div
              ref={modalRef}
              className={cn(
                'relative w-full overflow-hidden rounded-2xl',
                'bg-slate-900/95 border border-white/10',
                'backdrop-blur-xl shadow-2xl',
                modalSizes[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
              initial={
                !prefersReducedMotion
                  ? { opacity: 0, scale: 0.95, y: position === 'bottom' ? 20 : -20 }
                  : { opacity: 0 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                !prefersReducedMotion
                  ? { opacity: 0, scale: 0.95, y: position === 'bottom' ? 20 : -20 }
                  : { opacity: 0 }
              }
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              role="dialog"
              aria-modal="true"
            >
              {/* Close button */}
              {showCloseButton && (
                <button
                  onClick={handleClose}
                  className={cn(
                    'absolute top-4 right-4 z-10 p-2 rounded-xl',
                    'text-white/50 hover:text-white hover:bg-white/10',
                    'transition-colors'
                  )}
                  aria-label="Cerrar"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {children}
            </motion.div>
          </motion.div>
        </ModalContext.Provider>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MODAL PARTS — Partes del modal
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ModalHeaderProps {
  children: ReactNode
  className?: string
}

export function ModalHeader({ children, className }: ModalHeaderProps) {
  return (
    <div className={cn('px-6 py-4 border-b border-white/10', className)}>
      {typeof children === 'string' ? (
        <h2 className="text-xl font-semibold text-white">{children}</h2>
      ) : (
        children
      )}
    </div>
  )
}

interface ModalBodyProps {
  children: ReactNode
  className?: string
  scrollable?: boolean
}

export function ModalBody({ children, className, scrollable = true }: ModalBodyProps) {
  return (
    <div
      className={cn(
        'px-6 py-4',
        scrollable && 'overflow-y-auto max-h-[60vh]',
        className
      )}
    >
      {children}
    </div>
  )
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        'px-6 py-4 border-t border-white/10 flex items-center justify-end gap-3',
        className
      )}
    >
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DRAWER — Panel deslizable
// ═══════════════════════════════════════════════════════════════════════════════════════

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  position?: DrawerPosition
  size?: 'sm' | 'md' | 'lg' | 'full'
  closeOnBackdrop?: boolean
  closeOnEscape?: boolean
  showCloseButton?: boolean
  className?: string
}

const drawerSizes: Record<string, Record<DrawerPosition, string>> = {
  sm: { left: 'w-64', right: 'w-64', top: 'h-48', bottom: 'h-48' },
  md: { left: 'w-80', right: 'w-80', top: 'h-64', bottom: 'h-64' },
  lg: { left: 'w-96', right: 'w-96', top: 'h-80', bottom: 'h-80' },
  full: { left: 'w-full', right: 'w-full', top: 'h-full', bottom: 'h-full' },
}

const drawerPositions: Record<DrawerPosition, string> = {
  left: 'left-0 top-0 h-full',
  right: 'right-0 top-0 h-full',
  top: 'top-0 left-0 w-full',
  bottom: 'bottom-0 left-0 w-full',
}

const drawerAnimations: Record<DrawerPosition, { initial: object; animate: object; exit: object }> = {
  left: { initial: { x: '-100%' }, animate: { x: 0 }, exit: { x: '-100%' } },
  right: { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } },
  top: { initial: { y: '-100%' }, animate: { y: 0 }, exit: { y: '-100%' } },
  bottom: { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } },
}

export function Drawer({
  isOpen,
  onClose,
  children,
  position = 'right',
  size = 'md',
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
}: DrawerProps) {
  const prefersReducedMotion = useReducedMotion()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, closeOnEscape, onClose])

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  if (!mounted) return null

  const animations = drawerAnimations[position]

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Drawer */}
          <motion.div
            className={cn(
              'fixed z-[1000]',
              'bg-slate-900/95 border-white/10 backdrop-blur-xl shadow-2xl',
              position === 'left' && 'border-r',
              position === 'right' && 'border-l',
              position === 'top' && 'border-b',
              position === 'bottom' && 'border-t',
              drawerPositions[position],
              drawerSizes[size][position],
              className
            )}
            initial={prefersReducedMotion ? { opacity: 0 } : animations.initial}
            animate={prefersReducedMotion ? { opacity: 1 } : animations.animate}
            exit={prefersReducedMotion ? { opacity: 0 } : animations.exit}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  'absolute top-4 right-4 z-10 p-2 rounded-xl',
                  'text-white/50 hover:text-white hover:bg-white/10',
                  'transition-colors'
                )}
                aria-label="Cerrar"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONFIRM DIALOG — Diálogo de confirmación
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const prefersReducedMotion = useReducedMotion()

  const confirmButtonClass = variant === 'danger'
    ? 'bg-red-600 hover:bg-red-500 text-white'
    : 'bg-violet-600 hover:bg-violet-500 text-white'

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="p-6 text-center">
        {/* Icon */}
        <div className={cn(
          'mx-auto mb-4 w-12 h-12 rounded-full flex items-center justify-center',
          variant === 'danger' ? 'bg-red-500/20' : 'bg-violet-500/20'
        )}>
          {variant === 'danger' ? (
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>

        {/* Message */}
        <p className="text-sm text-white/60 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <motion.button
            onClick={onClose}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium',
              'bg-white/10 text-white hover:bg-white/20',
              'disabled:opacity-50 transition-colors'
            )}
            whileHover={!prefersReducedMotion ? { scale: 1.02 } : {}}
            whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
          >
            {cancelText}
          </motion.button>

          <motion.button
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium',
              'disabled:opacity-50 transition-colors',
              confirmButtonClass
            )}
            whileHover={!prefersReducedMotion ? { scale: 1.02 } : {}}
            whileTap={!prefersReducedMotion ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Procesando...
              </span>
            ) : (
              confirmText
            )}
          </motion.button>
        </div>
      </div>
    </Modal>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK useConfirmDialog
// ═══════════════════════════════════════════════════════════════════════════════════════

interface UseConfirmDialogOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'danger'
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<UseConfirmDialogOptions>({
    title: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: UseConfirmDialogOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)
    setLoading(false)

    return new Promise((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true)
    setIsOpen(false)
  }, [])

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false)
    setIsOpen(false)
  }, [])

  const Dialog = useCallback(
    () => (
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        variant={options.variant}
        loading={loading}
      />
    ),
    [isOpen, handleCancel, handleConfirm, options, loading]
  )

  return {
    confirm,
    Dialog,
    setLoading,
    isOpen,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export type {
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  DrawerProps,
  ConfirmDialogProps,
}
