'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🚀 ULTRA PREMIUM BUTTON - CHRONOS INFINITY 2026 ELEVATED
// ═══════════════════════════════════════════════════════════════════════════════════════
// Botón con animaciones cinematográficas de nivel supremo:
// - Ripple effect real con física mejorada
// - Shimmer sweep animado premium
// - Energy pulse en hover optimizado
// - Micro-interacciones avanzadas refinadas
// - Chromatic aberration opcional
// - Magnetic cursor attraction
// - Liquid glass morphism effects
// ═══════════════════════════════════════════════════════════════════════════════════════

import { cn } from '@/app/_lib/utils'
import { HTMLMotionProps, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { LucideIcon } from 'lucide-react'
import React, { useCallback, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'success'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface UltraPremiumButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  ripple?: boolean
  shimmer?: boolean
  energyPulse?: boolean
  chromatic?: boolean
  magnetic?: boolean
  children: React.ReactNode
}

interface Ripple {
  x: number
  y: number
  id: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// STYLE CONFIGURATIONS — ELEVATED
// ═══════════════════════════════════════════════════════════════════════════════════════

const variantStyles: Record<ButtonVariant, { className: string; glow: string; rippleColor: string }> = {
  primary: {
    className: 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white border-violet-500/30 bg-[length:200%_auto]',
    glow: 'rgba(139, 92, 246, 0.5)',
    rippleColor: 'rgba(255, 255, 255, 0.4)',
  },
  secondary: {
    className: 'bg-white/[0.06] backdrop-blur-2xl text-white border-white/[0.12] hover:bg-white/[0.1] hover:border-white/20',
    glow: 'rgba(255, 255, 255, 0.15)',
    rippleColor: 'rgba(139, 92, 246, 0.3)',
  },
  ghost: {
    className: 'bg-transparent text-white/70 border-transparent hover:bg-white/[0.08] hover:text-white',
    glow: 'transparent',
    rippleColor: 'rgba(255, 255, 255, 0.2)',
  },
  danger: {
    className: 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white border-red-500/30 bg-[length:200%_auto]',
    glow: 'rgba(239, 68, 68, 0.5)',
    rippleColor: 'rgba(255, 255, 255, 0.4)',
  },
  gold: {
    className: 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 text-gray-900 border-amber-500/30 bg-[length:200%_auto]',
    glow: 'rgba(245, 158, 11, 0.5)',
    rippleColor: 'rgba(0, 0, 0, 0.2)',
  },
  success: {
    className: 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 text-white border-emerald-500/30 bg-[length:200%_auto]',
    glow: 'rgba(16, 185, 129, 0.5)',
    rippleColor: 'rgba(255, 255, 255, 0.4)',
  },
}

const sizeStyles: Record<ButtonSize, { className: string; iconSize: number }> = {
  sm: { className: 'px-4 py-2 text-sm h-9 rounded-lg', iconSize: 14 },
  md: { className: 'px-6 py-3 text-base h-11 rounded-xl', iconSize: 16 },
  lg: { className: 'px-8 py-4 text-lg h-14 rounded-xl', iconSize: 20 },
  xl: { className: 'px-10 py-5 text-xl h-16 rounded-2xl', iconSize: 24 },
}

// Spring config for smooth animations
const SPRING_CONFIG = { stiffness: 400, damping: 25, mass: 0.5 }

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export const UltraPremiumButton = React.forwardRef<HTMLButtonElement, UltraPremiumButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      loading = false,
      ripple = true,
      shimmer = true,
      energyPulse = false,
      chromatic = false,
      magnetic = true,
      children,
      className,
      onClick,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [ripples, setRipples] = useState<Ripple[]>([])
    const [isHovered, setIsHovered] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const styles = variantStyles[variant]

    // Magnetic effect values
    const magneticX = useMotionValue(0)
    const magneticY = useMotionValue(0)
    const springX = useSpring(magneticX, SPRING_CONFIG)
    const springY = useSpring(magneticY, SPRING_CONFIG)

    // Glare effect
    const glareX = useMotionValue(50)
    const glareY = useMotionValue(50)
    const glareOpacity = useMotionValue(0)

    const glareGradient = useTransform(
      [glareX, glareY],
      ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
    )

    // ═══════════════════ MAGNETIC HOVER ═══════════════════
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
      if (!magnetic || !buttonRef.current || disabled) return

      const rect = buttonRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distanceX = (e.clientX - centerX) * 0.12
      const distanceY = (e.clientY - centerY) * 0.12

      magneticX.set(distanceX)
      magneticY.set(distanceY)

      // Update glare position
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      glareX.set(x)
      glareY.set(y)
      glareOpacity.set(0.5)
    }, [magnetic, disabled, magneticX, magneticY, glareX, glareY, glareOpacity])

    const handleMouseLeave = useCallback(() => {
      magneticX.set(0)
      magneticY.set(0)
      glareOpacity.set(0)
      setIsHovered(false)
    }, [magneticX, magneticY, glareOpacity])

    // ═══════════════════ RIPPLE EFFECT ═══════════════════
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (!ripple || disabled) {
        onClick?.(e)
        return
      }

      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newRipple: Ripple = { x, y, id: Date.now() }
      setRipples((prev) => [...prev, newRipple])

      // Cleanup ripple after animation
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 700)

      onClick?.(e)
    }, [ripple, disabled, onClick])

    return (
      <motion.button
        ref={buttonRef}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          x: springX,
          y: springY,
        }}
        whileHover={{
          scale: disabled ? 1 : 1.03,
          backgroundPosition: 'right center',
        }}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        transition={{ type: 'spring', ...SPRING_CONFIG }}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center gap-2',
          'border font-semibold',
          'transition-all duration-500 ease-out',
          'overflow-hidden',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950',

          // Variant styles
          styles.className,

          // Size styles
          sizeStyles[size].className,

          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',

          // Energy pulse animation
          energyPulse && !disabled && 'animate-pulse-premium',

          // Chromatic aberration
          chromatic && !disabled && 'hover:animate-chromatic',

          className,
        )}
        {...props}
      >
        {/* ═══════════════════ SHIMMER EFFECT — ELEVATED ═══════════════════ */}
        {shimmer && !disabled && variant !== 'ghost' && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent"
              initial={{ x: '-100%' }}
              animate={isHovered ? { x: '200%' } : { x: '-100%' }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </motion.div>
        )}

        {/* ═══════════════════ GLARE EFFECT ═══════════════════ */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-inherit"
          style={{
            background: glareGradient,
            opacity: glareOpacity,
          }}
        />

        {/* ═══════════════════ RIPPLE CONTAINER — ELEVATED ═══════════════════ */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full"
            initial={{
              width: 0,
              height: 0,
              x: ripple.x,
              y: ripple.y,
              opacity: 0.7,
            }}
            animate={{
              width: 400,
              height: 400,
              x: ripple.x - 200,
              y: ripple.y - 200,
              opacity: 0,
            }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              background: `radial-gradient(circle, ${styles.rippleColor} 0%, transparent 70%)`,
            }}
          />
        ))}

        {/* ═══════════════════ GLOW EFFECT — ELEVATED ═══════════════════ */}
        <motion.div
          className="pointer-events-none absolute -inset-1 -z-10 rounded-inherit blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered && !disabled && variant !== 'ghost' ? 0.6 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ background: styles.glow }}
        />

        {/* ═══════════════════ CONTENT ═══════════════════ */}
        <span className="relative z-10 flex items-center gap-2">
          {Icon && iconPosition === 'left' && (
            <Icon
              size={sizeStyles[size].iconSize}
              className={loading ? 'animate-spin' : ''}
            />
          )}

          {loading ? (
            <svg
              className="h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ) : (
            children
          )}

          {Icon && iconPosition === 'right' && (
            <Icon
              size={sizeStyles[size].iconSize}
              className={loading ? 'animate-spin' : ''}
            />
          )}
        </span>
      </motion.button>
    )
  },
)

UltraPremiumButton.displayName = 'UltraPremiumButton'

// ═══════════════════════════════════════════════════════════════════════════════════════
// KEYFRAMES CSS (agregar a globals.css si no existe)
// ═══════════════════════════════════════════════════════════════════════════════════════
/*
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes ripple {
  to {
    width: 500px;
    height: 500px;
    opacity: 0;
  }
}
*/
