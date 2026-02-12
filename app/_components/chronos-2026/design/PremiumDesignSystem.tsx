'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ✨ CHRONOS PREMIUM DESIGN SYSTEM — REFINED ELEGANCE 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de diseño premium con:
 * - Hover effects sutiles y elegantes (NO exagerados)
 * - Scroll animations premium
 * - Interactividad refinada
 * - Shaders animados sutiles
 * - Micro-interacciones satisfactorias
 *
 * Inspiración: Linear, Stripe, Vercel, Raycast, Apple
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from 'motion/react'
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 DESIGN TOKENS — REFINED PALETTE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PREMIUM_COLORS = {
  // Backgrounds
  void: '#06060a',
  surface: {
    primary: '#0d0d12',
    secondary: '#121218',
    elevated: '#18181f',
    overlay: 'rgba(6, 6, 10, 0.85)',
  },

  // Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.08)',
    hover: 'rgba(255, 255, 255, 0.12)',
    active: 'rgba(139, 92, 246, 0.4)',
  },

  // Text
  text: {
    primary: '#fafafa',
    secondary: '#a1a1aa',
    muted: '#71717a',
    disabled: '#52525b',
  },

  // Accents
  accent: {
    violet: '#8b5cf6',
    violetLight: '#a78bfa',
    violetGlow: 'rgba(139, 92, 246, 0.15)',
    emerald: '#10b981',
    emeraldGlow: 'rgba(16, 185, 129, 0.15)',
    rose: '#f43f5e',
    roseGlow: 'rgba(244, 63, 94, 0.15)',
    gold: '#f59e0b',
    goldGlow: 'rgba(245, 158, 11, 0.15)',
    blue: '#3b82f6',
    blueGlow: 'rgba(59, 130, 246, 0.15)',
    cyan: '#06b6d4',
    cyanGlow: 'rgba(6, 182, 212, 0.15)',
  },

  // Bank Colors
  banks: {
    boveda_monte: {
      accent: '#8b5cf6',
      bg: 'rgba(139, 92, 246, 0.08)',
      glow: 'rgba(139, 92, 246, 0.2)',
    },
    boveda_usa: {
      accent: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.08)',
      glow: 'rgba(59, 130, 246, 0.2)',
    },
    profit: { accent: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', glow: 'rgba(16, 185, 129, 0.2)' },
    leftie: { accent: '#ec4899', bg: 'rgba(236, 72, 153, 0.08)', glow: 'rgba(236, 72, 153, 0.2)' },
    azteca: { accent: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', glow: 'rgba(245, 158, 11, 0.2)' },
    flete_sur: { accent: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)', glow: 'rgba(6, 182, 212, 0.2)' },
    utilidades: {
      accent: '#f97316',
      bg: 'rgba(249, 115, 22, 0.08)',
      glow: 'rgba(249, 115, 22, 0.2)',
    },
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 SPRING PHYSICS — SMOOTH & NATURAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PREMIUM_SPRINGS = {
  instant: { type: 'spring' as const, stiffness: 600, damping: 40, mass: 0.5 },
  snappy: { type: 'spring' as const, stiffness: 400, damping: 30, mass: 0.8 },
  smooth: { type: 'spring' as const, stiffness: 200, damping: 25, mass: 1 },
  gentle: { type: 'spring' as const, stiffness: 120, damping: 20, mass: 1.2 },
  bounce: { type: 'spring' as const, stiffness: 350, damping: 15, mass: 0.9 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const PREMIUM_VARIANTS = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  } satisfies Variants,

  fadeInUp: {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: PREMIUM_SPRINGS.smooth },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
  } satisfies Variants,

  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: PREMIUM_SPRINGS.snappy },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.15 } },
  } satisfies Variants,

  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06, delayChildren: 0.08 },
    },
  } satisfies Variants,

  staggerItem: {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: PREMIUM_SPRINGS.smooth },
  } satisfies Variants,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🪟 PREMIUM GLASS CARD — Refined Hover Effects
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'interactive' | 'glow'
  glowColor?: string
  onClick?: () => void
  disabled?: boolean
}

export const PremiumCard = forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ children, className, variant = 'default', glowColor, onClick, disabled }, ref) => {
    const [isHovered, setIsHovered] = useState(false)
    const cardRef = useRef<HTMLDivElement>(null)

    // Magnetic tilt effect (sutil)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const rotateX = useSpring(useTransform(mouseY, [0, 0], [0, 0]), PREMIUM_SPRINGS.gentle)
    const rotateY = useSpring(useTransform(mouseX, [0, 0], [0, 0]), PREMIUM_SPRINGS.gentle)

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || variant !== 'interactive') return
        const rect = cardRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        mouseX.set(x)
        mouseY.set(y)
      },
      [mouseX, mouseY, variant],
    )

    const handleMouseLeave = useCallback(() => {
      mouseX.set(0)
      mouseY.set(0)
      setIsHovered(false)
    }, [mouseX, mouseY])

    const baseStyles = useMemo(
      () => ({
        default: {
          background: PREMIUM_COLORS.surface.secondary,
          border: `1px solid ${PREMIUM_COLORS.border.subtle}`,
        },
        elevated: {
          background: PREMIUM_COLORS.surface.elevated,
          border: `1px solid ${PREMIUM_COLORS.border.default}`,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
        },
        interactive: {
          background: PREMIUM_COLORS.surface.secondary,
          border: `1px solid ${isHovered ? PREMIUM_COLORS.border.hover : PREMIUM_COLORS.border.subtle}`,
          boxShadow: isHovered ? '0 8px 32px rgba(0, 0, 0, 0.5)' : 'none',
        },
        glow: {
          background: PREMIUM_COLORS.surface.secondary,
          border: `1px solid ${isHovered ? PREMIUM_COLORS.border.active : PREMIUM_COLORS.border.subtle}`,
          boxShadow: isHovered && glowColor ? `0 0 24px ${glowColor}` : 'none',
        },
      }),
      [isHovered, glowColor],
    )

    return (
      <motion.div
        ref={cardRef}
        className={cn(
          'overflow-hidden rounded-xl transition-all duration-300',
          onClick && !disabled && 'cursor-pointer',
          disabled && 'pointer-events-none opacity-50',
          className,
        )}
        style={{
          ...baseStyles[variant],
          rotateX: variant === 'interactive' ? rotateX : 0,
          rotateY: variant === 'interactive' ? rotateY : 0,
          transformPerspective: 1200,
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        whileTap={onClick ? { scale: 0.99 } : undefined}
      >
        {children}
      </motion.div>
    )
  },
)

PremiumCard.displayName = 'PremiumCard'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔘 PREMIUM BUTTON — Refined Interactions
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  iconRight?: ReactNode
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      children,
      variant = 'secondary',
      size = 'md',
      icon,
      iconRight,
      onClick,
      disabled,
      loading,
      className,
    },
    ref,
  ) => {
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    }

    const variantStyles = {
      primary: {
        background: `linear-gradient(135deg, ${PREMIUM_COLORS.accent.violet} 0%, ${PREMIUM_COLORS.accent.violetLight} 100%)`,
        color: '#fff',
        border: 'none',
        boxShadow: `0 2px 12px ${PREMIUM_COLORS.accent.violetGlow}`,
      },
      secondary: {
        background: PREMIUM_COLORS.surface.elevated,
        color: PREMIUM_COLORS.text.secondary,
        border: `1px solid ${PREMIUM_COLORS.border.default}`,
        boxShadow: 'none',
      },
      ghost: {
        background: 'transparent',
        color: PREMIUM_COLORS.text.muted,
        border: 'none',
        boxShadow: 'none',
      },
      danger: {
        background: PREMIUM_COLORS.accent.rose,
        color: '#fff',
        border: 'none',
        boxShadow: `0 2px 12px ${PREMIUM_COLORS.accent.roseGlow}`,
      },
    }

    return (
      <motion.button
        ref={ref}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-all',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2',
          sizeStyles[size],
          (disabled || loading) && 'cursor-not-allowed opacity-50',
          className,
        )}
        style={variantStyles[variant]}
        whileHover={
          !disabled && !loading
            ? {
                scale: 1.02,
                filter: variant === 'primary' ? 'brightness(1.1)' : undefined,
              }
            : undefined
        }
        whileTap={!disabled && !loading ? { scale: 0.98 } : undefined}
        transition={PREMIUM_SPRINGS.snappy}
      >
        {loading ? (
          <motion.div
            className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          icon
        )}
        {children}
        {iconRight}
      </motion.button>
    )
  },
)

PremiumButton.displayName = 'PremiumButton'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 ANIMATED STAT DISPLAY
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AnimatedStatProps {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}

export function AnimatedStat({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1500,
  className,
}: AnimatedStatProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })

  useEffect(() => {
    if (!inView) return

    const startTime = performance.now()
    const startValue = 0

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing: easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      const current = startValue + (value - startValue) * eased

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration, inView])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 SCROLL REVEAL — Premium Scroll Animations
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  className?: string
}

export function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const directionOffset = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { y: 0, x: 24 },
    right: { y: 0, x: -24 },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...directionOffset[direction] }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : undefined}
      transition={{ ...PREMIUM_SPRINGS.smooth, delay }}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✨ SUBTLE GLOW EFFECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SubtleGlowProps {
  children: ReactNode
  color?: string
  intensity?: 'low' | 'medium' | 'high'
  className?: string
}

export function SubtleGlow({
  children,
  color = PREMIUM_COLORS.accent.violet,
  intensity = 'low',
  className,
}: SubtleGlowProps) {
  const intensityMap = {
    low: '0.1',
    medium: '0.2',
    high: '0.3',
  }

  return (
    <div className={cn('relative', className)}>
      <div
        className="absolute inset-0 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: color,
          opacity: intensityMap[intensity],
        }}
      />
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAGNETIC HOVER — Subtle Pull Effect
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MagneticProps {
  children: ReactNode
  strength?: number
  className?: string
}

export function Magnetic({ children, strength = 0.3, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, PREMIUM_SPRINGS.gentle)
  const springY = useSpring(y, PREMIUM_SPRINGS.gentle)

  const handleMouse = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      x.set((e.clientX - centerX) * strength)
      y.set((e.clientY - centerY) * strength)
    },
    [x, y, strength],
  )

  const handleLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📑 PREMIUM TABS — Elegant Tab Navigation
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TabItem {
  id: string
  label: string
  icon?: ReactNode
  badge?: number
}

interface PremiumTabsProps {
  items: TabItem[]
  activeId: string
  onChange: (id: string) => void
  accentColor?: string
  className?: string
}

export function PremiumTabs({
  items,
  activeId,
  onChange,
  accentColor = PREMIUM_COLORS.accent.violet,
  className,
}: PremiumTabsProps) {
  return (
    <div
      className={cn('flex items-center gap-1 rounded-lg p-1', className)}
      style={{ background: PREMIUM_COLORS.surface.primary }}
    >
      {items.map((item) => {
        const isActive = item.id === activeId
        return (
          <motion.button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              isActive ? 'text-white' : 'text-gray-400 hover:text-gray-300',
            )}
            style={{ color: isActive ? '#fff' : undefined }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-md"
                style={{ background: accentColor }}
                transition={PREMIUM_SPRINGS.snappy}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {item.icon}
              {item.label}
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className="ml-1 rounded-full px-1.5 py-0.5 text-xs"
                  style={{
                    background: isActive
                      ? 'rgba(255,255,255,0.2)'
                      : PREMIUM_COLORS.surface.elevated,
                    color: isActive ? '#fff' : PREMIUM_COLORS.text.muted,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔲 SHIMMER LOADER — Elegant Loading State
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ShimmerProps {
  className?: string
  width?: string | number
  height?: string | number
}

export function Shimmer({ className, width, height }: ShimmerProps) {
  return (
    <div
      className={cn('relative overflow-hidden rounded-lg', className)}
      style={{
        width,
        height,
        background: PREMIUM_COLORS.surface.secondary,
      }}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(
            90deg,
            transparent 0%,
            ${PREMIUM_COLORS.surface.elevated} 50%,
            transparent 100%
          )`,
        }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 GRADIENT BORDER CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GradientBorderCardProps {
  children: ReactNode
  gradient?: string
  className?: string
  onClick?: () => void
}

export function GradientBorderCard({
  children,
  gradient = `linear-gradient(135deg, ${PREMIUM_COLORS.accent.violet}40, ${PREMIUM_COLORS.accent.blue}40)`,
  className,
  onClick,
}: GradientBorderCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl p-[1px]',
        onClick && 'cursor-pointer',
        className,
      )}
      style={{ background: isHovered ? gradient : PREMIUM_COLORS.border.subtle }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileTap={onClick ? { scale: 0.995 } : undefined}
    >
      <div
        className="h-full rounded-[11px]"
        style={{ background: PREMIUM_COLORS.surface.secondary }}
      >
        {children}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💫 AURORA BACKGROUND — Subtle Animated Background
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraBackgroundProps {
  className?: string
  intensity?: 'subtle' | 'normal' | 'strong'
}

export function AuroraBackground({ className, intensity = 'subtle' }: AuroraBackgroundProps) {
  const opacityMap = { subtle: 0.15, normal: 0.25, strong: 0.4 }
  const opacity = opacityMap[intensity]

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <motion.div
        className="absolute h-[600px] w-[600px] rounded-full blur-[120px]"
        style={{
          background: PREMIUM_COLORS.accent.violet,
          opacity,
          top: '-20%',
          left: '-10%',
        }}
        animate={{
          x: [0, 100, 50, 0],
          y: [0, 50, 100, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute h-[500px] w-[500px] rounded-full blur-[100px]"
        style={{
          background: PREMIUM_COLORS.accent.blue,
          opacity: opacity * 0.7,
          bottom: '-15%',
          right: '-10%',
        }}
        animate={{
          x: [0, -80, -40, 0],
          y: [0, -60, -30, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute h-[400px] w-[400px] rounded-full blur-[80px]"
        style={{
          background: PREMIUM_COLORS.accent.emerald,
          opacity: opacity * 0.5,
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        animate={{
          scale: [1, 1.2, 0.9, 1],
          opacity: [opacity * 0.5, opacity * 0.3, opacity * 0.6, opacity * 0.5],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// Todos los componentes y constantes ya están exportados individualmente arriba

