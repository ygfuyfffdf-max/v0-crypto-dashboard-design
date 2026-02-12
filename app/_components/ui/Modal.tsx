'use client'

// ═══════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — MODAL ULTRA-PREMIUM ELEVATED
// Diseño Apple Vision Pro + Tesla 2025 + Glassmorphism Gen-5
// Centrado automático + scroll interno + premium effects
// Features: Rotating glow border, floating particles, shine sweep
// ELEVATED: Enhanced transitions, magnetic cursor, liquid glass
// ═══════════════════════════════════════════════════════════════════════════

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { Sparkles, X } from 'lucide-react'
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showCloseButton?: boolean
  className?: string
  variant?: 'default' | 'premium' | 'danger'
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] w-full',
}

const variantGlows = {
  default: {
    border: 'rgba(139, 92, 246, 0.35)',
    shadow: 'rgba(139, 92, 246, 0.18)',
    accent: '#8B5CF6',
    gradient: 'from-violet-600/20 via-indigo-600/10 to-violet-600/20',
  },
  premium: {
    border: 'rgba(255, 215, 0, 0.35)',
    shadow: 'rgba(255, 215, 0, 0.18)',
    accent: '#FFD700',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-amber-500/20',
  },
  danger: {
    border: 'rgba(255, 51, 102, 0.35)',
    shadow: 'rgba(255, 51, 102, 0.18)',
    accent: '#FF3366',
    gradient: 'from-red-500/20 via-pink-500/10 to-red-500/20',
  },
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'lg',
  showCloseButton = true,
  className,
  variant = 'default',
}: ModalProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const glowConfig = variantGlows[variant]

  // Mount state for client-only rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Cerrar con ESC
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose],
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  // SSR safe portal
  if (typeof window === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay con blur premium - ELEVATED */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100]"
            onClick={onClose}
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(0, 0, 0, 0.75) 0%, rgba(0, 0, 0, 0.92) 100%)',
              backdropFilter: 'blur(16px) saturate(180%)',
            }}
          />

          {/* Floating ambient particles - render only on client */}
          {isMounted && (
            <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-2 w-2 rounded-full"
                  style={{
                    background: glowConfig.accent,
                    filter: 'blur(2px)',
                  }}
                  initial={{
                    x: (i + 1) * (window.innerWidth / 7),
                    y: window.innerHeight + 20,
                    opacity: 0.3,
                  }}
                  animate={{
                    y: -20,
                    opacity: [0.3, 0.7, 0.3],
                  }}
                  transition={{
                    duration: 8 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.8,
                    ease: 'linear',
                  }}
                />
              ))}
            </div>
          )}

          {/* Container centrado */}
          <div className="fixed inset-0 z-[101] overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94, y: 24 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                  mass: 0.8,
                }}
                className={cn(
                  'relative w-full transform rounded-3xl',
                  'max-h-[90vh] overflow-hidden',
                  sizeClasses[size],
                  className,
                )}
                onClick={(e) => e.stopPropagation()}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  background:
                    'linear-gradient(145deg, rgba(22, 18, 35, 0.96) 0%, rgba(10, 8, 18, 0.98) 100%)',
                  border: `1px solid ${isHovered ? glowConfig.border : 'rgba(255, 255, 255, 0.06)'}`,
                  boxShadow: `
                    0 32px 64px -16px rgba(0, 0, 0, 0.75),
                    0 0 100px ${glowConfig.shadow},
                    inset 0 1px 0 rgba(255, 255, 255, 0.06),
                    inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                  `,
                  backdropFilter: 'blur(48px) saturate(200%)',
                }}
              >
                {/* Rotating glow border effect - always render, control visibility */}
                <motion.div
                  className="pointer-events-none absolute inset-[-2px] rounded-[26px]"
                  style={{
                    background: `conic-gradient(from 0deg, transparent, ${glowConfig.border}, transparent 30%)`,
                    opacity: isHovered ? 1 : 0,
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                />

                {/* Inner container */}
                <div
                  className="relative rounded-[22px]"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(20, 15, 30, 0.98) 0%, rgba(8, 6, 15, 0.99) 100%)',
                  }}
                >
                  {/* Static elegant glow - NO mouse tracking for better UX */}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-3xl opacity-30"
                    style={{
                      background: `radial-gradient(600px circle at 50% 30%, ${glowConfig.shadow}, transparent 60%)`,
                    }}
                  />

                  {/* Top glow line */}
                  <div
                    className="absolute top-0 right-[10%] left-[10%] h-px"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${glowConfig.accent}50, transparent)`,
                    }}
                  />

                  {/* Header */}
                  {(title || showCloseButton) && (
                    <div
                      className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 px-6 py-4"
                      style={{ background: 'rgba(15, 12, 25, 0.8)', backdropFilter: 'blur(20px)' }}
                    >
                      <div className="flex items-center gap-3">
                        {variant === 'premium' && (
                          <motion.div
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Sparkles className="h-5 w-5 text-amber-400" />
                          </motion.div>
                        )}
                        <div>
                          {title && <h2 className="text-xl font-bold text-white">{title}</h2>}
                          {subtitle && <p className="mt-0.5 text-sm text-gray-400">{subtitle}</p>}
                        </div>
                      </div>

                      {showCloseButton && (
                        <motion.button
                          onClick={onClose}
                          className="group relative rounded-xl p-2.5 text-gray-400 transition-spring hover:text-white hover:scale-110"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        >
                          {/* Hover glow */}
                          <span className="absolute inset-0 rounded-xl bg-red-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
                          <X className="relative h-5 w-5 transition-colors group-hover:text-red-400" />
                        </motion.button>
                      )}
                    </div>
                  )}

                  {/* Content con scroll interno premium */}
                  <div
                    className="max-h-[calc(90vh-80px)] overflow-y-auto p-6"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: `${glowConfig.accent}40 transparent`,
                    }}
                  >
                    {children}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MODAL FOOTER COMPONENT — Premium styled footer
// ═══════════════════════════════════════════════════════════════════════════

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('relative mt-6 flex items-center justify-end gap-3 pt-6', className)}>
      {/* Top border with gradient */}
      <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// BUTTON COMPONENT — Premium glassmorphism button
// ═══════════════════════════════════════════════════════════════════════════

interface ButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'
> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  icon?: ReactNode
}

const variantStyles = {
  primary: {
    base: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-500/50',
    hover: 'hover:from-violet-500 hover:to-purple-500',
    glow: 'rgba(139, 0, 255, 0.4)',
  },
  secondary: {
    base: 'bg-white/5 text-white border-white/10',
    hover: 'hover:bg-white/10 hover:border-white/20',
    glow: 'rgba(255, 255, 255, 0.1)',
  },
  ghost: {
    base: 'bg-transparent text-gray-400 border-transparent',
    hover: 'hover:text-white hover:bg-white/5',
    glow: 'transparent',
  },
  danger: {
    base: 'bg-gradient-to-r from-red-600 to-pink-600 text-white border-red-500/50',
    hover: 'hover:from-red-500 hover:to-pink-500',
    glow: 'rgba(255, 51, 102, 0.4)',
  },
  success: {
    base: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white border-emerald-500/50',
    hover: 'hover:from-emerald-500 hover:to-green-500',
    glow: 'rgba(0, 255, 135, 0.4)',
  },
  gold: {
    base: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black border-amber-500/50',
    hover: 'hover:from-amber-400 hover:to-yellow-400',
    glow: 'rgba(255, 215, 0, 0.4)',
  },
}

const sizeButtonClasses = {
  sm: 'h-9 px-4 text-xs gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-13 px-7 text-base gap-2.5',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading,
  icon,
  children,
  className,
  disabled,
  type = 'button', // Default to 'button' to prevent accidental submits
  ...props
}: ButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const styles = variantStyles[variant]

  return (
    <motion.button
      type={type}
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-xl font-semibold transition-spring hover-elevate',
        'border',
        styles.base,
        styles.hover,
        sizeButtonClasses[size],
        (disabled || isLoading) && 'cursor-not-allowed opacity-50',
        className,
      )}
      disabled={disabled || isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.005 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      style={{
        boxShadow:
          isHovered && !disabled
            ? `0 10px 30px -10px ${styles.glow}, 0 0 20px ${styles.glow}`
            : 'none',
      }}
      {...props}
    >
      {/* Shine sweep effect on hover */}
      <motion.span
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={false}
        animate={isHovered ? { translateX: '100%' } : { translateX: '-100%' }}
        transition={{ duration: 0.5 }}
      />

      {/* Loading spinner */}
      {isLoading ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        icon && <span className="relative">{icon}</span>
      )}

      <span className="relative">{children}</span>
    </motion.button>
  )
}
