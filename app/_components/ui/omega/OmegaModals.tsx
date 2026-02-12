'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 OMEGA DESIGN SYSTEM — MODAL & DIALOG COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react'
import React, { forwardRef, ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { OMEGA, OmegaButton } from './OmegaDesignSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🪟 OMEGA MODAL — CINEMATIC GLASS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OmegaModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  subtitle?: string
  palette?: keyof typeof OMEGA.palettes
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  enableParallax?: boolean
  className?: string
}

export function OmegaModal({
  isOpen,
  onClose,
  children,
  title,
  subtitle,
  palette = 'dashboard',
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  enableParallax = true,
  className,
}: OmegaModalProps) {
  const colors = OMEGA.palettes[palette]
  const modalRef = useRef<HTMLDivElement>(null)

  // Parallax effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useTransform(mouseY, [0, 0], [0, 0]), OMEGA.springs.ultraSmooth)
  const rotateY = useSpring(useTransform(mouseX, [0, 0], [0, 0]), OMEGA.springs.ultraSmooth)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enableParallax || !modalRef.current) return
      const rect = modalRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set(e.clientX - centerX)
      mouseY.set(e.clientY - centerY)
    },
    [enableParallax, mouseX, mouseY],
  )

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-[95vw] max-h-[95vh]',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onMouseMove={handleMouseMove}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
            onClick={closeOnOverlayClick ? onClose : undefined}
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(16px)',
            }}
          />

          {/* Aurora effects in backdrop */}
          <motion.div
            className="pointer-events-none absolute h-[600px] w-[600px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.primary}20 0%, transparent 70%)`,
              filter: 'blur(100px)',
              top: '20%',
              left: '10%',
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="pointer-events-none absolute h-[400px] w-[400px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${colors.secondary}15 0%, transparent 70%)`,
              filter: 'blur(80px)',
              bottom: '10%',
              right: '15%',
            }}
            animate={{
              x: [0, -80, 0],
              y: [0, 60, 0],
              scale: [1, 0.9, 1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Modal container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            transition={OMEGA.springs.cinematic}
            style={{
              rotateX: enableParallax ? rotateX : 0,
              rotateY: enableParallax ? rotateY : 0,
              transformStyle: 'preserve-3d',
              perspective: 1000,
            }}
            className={cn(
              'relative w-full overflow-hidden rounded-3xl',
              sizeClasses[size],
              className,
            )}
          >
            {/* Glass background */}
            <div
              className="absolute inset-0"
              style={{
                background: 'rgba(15, 15, 25, 0.85)',
                backdropFilter: 'blur(60px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: `
                  0 50px 100px -20px rgba(0, 0, 0, 0.8),
                  0 0 100px ${colors.glow},
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `,
              }}
            />

            {/* Top reflection */}
            <div
              className="pointer-events-none absolute top-0 right-0 left-0 h-40"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%)',
              }}
            />

            {/* Content wrapper */}
            <div className="relative z-10">
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between p-6 pb-0">
                  <div>
                    {title && (
                      <motion.h2
                        className="text-2xl font-bold text-white"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        {title}
                      </motion.h2>
                    )}
                    {subtitle && (
                      <motion.p
                        className="mt-1 text-sm text-white/40"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        {subtitle}
                      </motion.p>
                    )}
                  </div>
                  {showCloseButton && (
                    <motion.button
                      onClick={onClose}
                      className="rounded-xl p-2 transition-all duration-300"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      }}
                      whileHover={{
                        scale: 1.1,
                        background: 'rgba(239, 68, 68, 0.2)',
                        borderColor: 'rgba(239, 68, 68, 0.4)',
                      }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <X className="h-5 w-5 text-white/60" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* Body */}
              <motion.div
                className="overflow-auto p-6"
                style={{ maxHeight: 'calc(95vh - 200px)' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {children}
              </motion.div>
            </div>

            {/* Bottom edge glow */}
            <div
              className="absolute bottom-0 left-1/2 h-px w-3/4 -translate-x-1/2"
              style={{
                background: `linear-gradient(90deg, transparent, ${colors.primary}60, transparent)`,
              }}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚠️ OMEGA ALERT DIALOG — CONFIRMATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OmegaAlertDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  variant?: 'danger' | 'warning' | 'info' | 'success'
  confirmText?: string
  cancelText?: string
  isLoading?: boolean
}

export function OmegaAlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant = 'danger',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
}: OmegaAlertDialogProps) {
  const variants = {
    danger: {
      icon: XCircle,
      color: '#EF4444',
      glow: 'rgba(239, 68, 68, 0.4)',
      palette: 'gastos' as const,
    },
    warning: {
      icon: AlertTriangle,
      color: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.4)',
      palette: 'ordenes' as const,
    },
    info: {
      icon: Info,
      color: '#3B82F6',
      glow: 'rgba(59, 130, 246, 0.4)',
      palette: 'clientes' as const,
    },
    success: {
      icon: CheckCircle,
      color: '#10B981',
      glow: 'rgba(16, 185, 129, 0.4)',
      palette: 'bancos' as const,
    },
  }

  const config = variants[variant]
  const Icon = config.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={OMEGA.springs.smooth}
            className="relative w-full max-w-md overflow-hidden rounded-3xl"
            style={{
              background: 'rgba(15, 15, 25, 0.95)',
              backdropFilter: 'blur(60px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: `0 50px 100px -20px rgba(0, 0, 0, 0.8), 0 0 80px ${config.glow}`,
            }}
          >
            {/* Icon */}
            <div className="flex justify-center pt-8">
              <motion.div
                className="relative flex h-20 w-20 items-center justify-center rounded-full"
                style={{
                  background: `${config.color}15`,
                  boxShadow: `0 0 60px ${config.glow}`,
                }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...OMEGA.springs.bouncy, delay: 0.1 }}
              >
                <Icon className="h-10 w-10" style={{ color: config.color }} />
                {/* Pulse ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${config.color}` }}
                  animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </div>

            {/* Content */}
            <div className="p-8 text-center">
              <motion.h3
                className="mb-2 text-xl font-bold text-white"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {title}
              </motion.h3>
              <motion.p
                className="text-white/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {description}
              </motion.p>

              {/* Actions */}
              <motion.div
                className="mt-8 flex gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <OmegaButton
                  variant="glass"
                  palette={config.palette}
                  className="flex-1"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  {cancelText}
                </OmegaButton>
                <OmegaButton
                  variant="solid"
                  palette={config.palette}
                  className="flex-1"
                  onClick={onConfirm}
                  isLoading={isLoading}
                >
                  {confirmText}
                </OmegaButton>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔔 OMEGA TOAST — NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OmegaToast {
  id: string
  title: string
  description?: string
  variant?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface OmegaToastContainerProps {
  toasts: OmegaToast[]
  onDismiss: (id: string) => void
}

export function OmegaToastContainer({ toasts, onDismiss }: OmegaToastContainerProps) {
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <OmegaToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function OmegaToastItem({
  toast,
  onDismiss,
}: {
  toast: OmegaToast
  onDismiss: (id: string) => void
}) {
  const variants = {
    success: {
      icon: CheckCircle,
      color: '#10B981',
      glow: 'rgba(16, 185, 129, 0.4)',
    },
    error: {
      icon: XCircle,
      color: '#EF4444',
      glow: 'rgba(239, 68, 68, 0.4)',
    },
    warning: {
      icon: AlertTriangle,
      color: '#F59E0B',
      glow: 'rgba(245, 158, 11, 0.4)',
    },
    info: {
      icon: Info,
      color: '#3B82F6',
      glow: 'rgba(59, 130, 246, 0.4)',
    },
  }

  const config = variants[toast.variant || 'info']
  const Icon = config.icon

  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, toast.duration || 5000)
    return () => clearTimeout(timer)
  }, [toast.id, toast.duration, onDismiss])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={OMEGA.springs.smooth}
      className="relative w-80 overflow-hidden rounded-2xl"
      style={{
        background: 'rgba(20, 20, 30, 0.95)',
        backdropFilter: 'blur(40px)',
        border: `1px solid ${config.color}40`,
        boxShadow: `0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 40px ${config.glow}`,
      }}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: `${config.color}20` }}
        >
          <Icon className="h-5 w-5" style={{ color: config.color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-white">{toast.title}</p>
          {toast.description && <p className="mt-0.5 text-sm text-white/50">{toast.description}</p>}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="rounded-lg p-1 transition-colors hover:bg-white/10"
        >
          <X className="h-4 w-4 text-white/40" />
        </button>
      </div>

      {/* Progress bar */}
      <motion.div
        className="h-0.5"
        style={{ background: config.color }}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: (toast.duration || 5000) / 1000, ease: 'linear' }}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type { OmegaToast }

