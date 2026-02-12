'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎭✨ ENHANCED MODAL WRAPPER — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Wrapper para modales con sound effects automáticos:
 * ✅ Sonido al abrir
 * ✅ Sonido al cerrar
 * ✅ Sonido en submit success/error
 * ✅ Haptic feedback
 * ✅ Animations premium
 *
 * USO:
 * ```tsx
 * <EnhancedModal isOpen={isOpen} onClose={onClose} title="Mi Modal">
 *   <form onSubmit={handleSubmit}>...</form>
 * </EnhancedModal>
 * ```
 */

import { cn } from '@/app/_lib/utils'
import { useSoundManager } from '@/app/lib/audio/sound-system'
import { X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { useEffect } from 'react'

interface EnhancedModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  footer?: React.ReactNode
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-[95vw]',
}

export function EnhancedModal({
  isOpen,
  onClose,
  title,
  children,
  className,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  footer,
}: EnhancedModalProps) {
  const { play } = useSoundManager()

  // ═════════════════════════════════════════════════════════════════════════════════════════════════
  // SOUND EFFECTS
  // ═════════════════════════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (isOpen) {
      play('whoosh')
      navigator.vibrate?.(10)
    }
  }, [isOpen, play])

  const handleClose = () => {
    play('swoosh')
    navigator.vibrate?.(5)
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      handleClose()
    }
  }

  // Prevenir scroll del body cuando el modal está abierto
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

  // ESC para cerrar
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md"
            onClick={handleOverlayClick}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={cn(
                'relative w-full overflow-hidden rounded-2xl',
                'border border-white/10 bg-gray-900/95 backdrop-blur-xl',
                'shadow-2xl shadow-black/50',
                SIZE_CLASSES[size],
                className,
              )}
            >
              {/* ═════════════ AURORA BACKGROUND ═════════════ */}
              <div className="pointer-events-none absolute inset-0 opacity-30">
                <motion.div
                  className="absolute -top-1/4 -left-1/4 h-1/2 w-1/2 rounded-full bg-violet-500/30 blur-3xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <motion.div
                  className="absolute -right-1/4 -bottom-1/4 h-1/2 w-1/2 rounded-full bg-indigo-500/30 blur-3xl"
                  animate={{
                    scale: [1.2, 1, 1.2],
                    opacity: [0.5, 0.3, 0.5],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 2,
                  }}
                />
              </div>

              {/* ═════════════ HEADER ═════════════ */}
              {(title || showCloseButton) && (
                <div className="relative z-10 flex items-center justify-between border-b border-white/10 p-6">
                  {title && (
                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="text-2xl font-bold text-white"
                    >
                      {title}
                    </motion.h2>
                  )}
                  {showCloseButton && (
                    <motion.button
                      onClick={handleClose}
                      onMouseEnter={() => play('hover')}
                      className={cn(
                        'rounded-lg p-2 transition-all duration-200',
                        'hover:rotate-90 hover:bg-white/10',
                        'focus:ring-2 focus:ring-violet-500 focus:outline-none',
                      )}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="h-5 w-5 text-gray-400" />
                    </motion.button>
                  )}
                </div>
              )}

              {/* ═════════════ CONTENT ═════════════ */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="relative z-10 max-h-[70vh] overflow-y-auto p-6"
              >
                {children}
              </motion.div>

              {/* ═════════════ FOOTER ═════════════ */}
              {footer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative z-10 border-t border-white/10 p-6"
                >
                  {footer}
                </motion.div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ENHANCED MODAL BUTTON (con sound effects)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface EnhancedModalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  children: React.ReactNode
  soundEffect?: 'click' | 'success' | 'error' | 'whoosh'
}

export function EnhancedModalButton({
  variant = 'primary',
  children,
  soundEffect = 'click',
  className,
  onClick,
  ...props
}: EnhancedModalButtonProps) {
  const { play } = useSoundManager()

  const VARIANT_CLASSES = {
    primary:
      'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500',
    secondary: 'bg-white/10 hover:bg-white/20',
    danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500',
    success:
      'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500',
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    play(soundEffect as any)
    navigator.vibrate?.(5)
    onClick?.(e)
  }

  return (
    <motion.button
      onClick={handleClick}
      onMouseEnter={() => play('hover')}
      className={cn(
        'rounded-xl px-6 py-3 font-medium text-white',
        'transition-all duration-200',
        'hover:scale-105 hover:shadow-lg',
        'focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANT_CLASSES[variant],
        className,
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}
