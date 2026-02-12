'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔮 CHRONOS INFINITY 2030 — GLASS MORPHISM BUTTONS 3D
// ═══════════════════════════════════════════════════════════════════════════════════════
// Colección de botones premium con efectos de cristal:
// - Efecto glassmorphism con refracción 3D
// - Partículas internas reactivas
// - Estados hover/pressed con física
// - Variantes: primary, secondary, ghost, danger
// Paleta: #8B00FF / #FFD700 / #FF1493 (CYAN PROHIBIDO)
// ═══════════════════════════════════════════════════════════════════════════════════════

import { HTMLMotionProps, motion } from 'motion/react'
import { LucideIcon } from 'lucide-react'
import React, { forwardRef, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface GlassButton3DProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  glow?: boolean
  particles?: boolean
  children: React.ReactNode
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// STYLE CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

const variantStyles: Record<
  ButtonVariant,
  {
    background: string
    border: string
    glow: string
    text: string
    hoverBg: string
  }
> = {
  primary: {
    background: 'linear-gradient(135deg, rgba(139, 0, 255, 0.3), rgba(139, 0, 255, 0.1))',
    border: 'rgba(139, 0, 255, 0.5)',
    glow: 'rgba(139, 0, 255, 0.4)',
    text: '#FFFFFF',
    hoverBg: 'linear-gradient(135deg, rgba(139, 0, 255, 0.5), rgba(139, 0, 255, 0.2))',
  },
  secondary: {
    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
    border: 'rgba(255, 255, 255, 0.2)',
    glow: 'rgba(255, 255, 255, 0.2)',
    text: '#FFFFFF',
    hoverBg: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
  },
  ghost: {
    background: 'transparent',
    border: 'transparent',
    glow: 'transparent',
    text: 'rgba(255, 255, 255, 0.7)',
    hoverBg: 'rgba(255, 255, 255, 0.08)',
  },
  danger: {
    background: 'linear-gradient(135deg, rgba(255, 20, 147, 0.3), rgba(255, 20, 147, 0.1))',
    border: 'rgba(255, 20, 147, 0.5)',
    glow: 'rgba(255, 20, 147, 0.4)',
    text: '#FFFFFF',
    hoverBg: 'linear-gradient(135deg, rgba(255, 20, 147, 0.5), rgba(255, 20, 147, 0.2))',
  },
  gold: {
    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 215, 0, 0.1))',
    border: 'rgba(255, 215, 0, 0.5)',
    glow: 'rgba(255, 215, 0, 0.4)',
    text: '#FFD700',
    hoverBg: 'linear-gradient(135deg, rgba(255, 215, 0, 0.5), rgba(255, 215, 0, 0.2))',
  },
}

const sizeStyles: Record<
  ButtonSize,
  {
    padding: string
    fontSize: string
    iconSize: number
    gap: string
  }
> = {
  sm: { padding: '0.5rem 1rem', fontSize: '0.75rem', iconSize: 14, gap: '0.375rem' },
  md: { padding: '0.75rem 1.5rem', fontSize: '0.875rem', iconSize: 16, gap: '0.5rem' },
  lg: { padding: '1rem 2rem', fontSize: '1rem', iconSize: 20, gap: '0.625rem' },
  xl: { padding: '1.25rem 2.5rem', fontSize: '1.125rem', iconSize: 24, gap: '0.75rem' },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// LOADING SPINNER
// ═══════════════════════════════════════════════════════════════════════════════════════

function LoadingSpinner({ size = 16 }: { size?: number }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="60"
          strokeDashoffset="20"
          className="opacity-100"
        />
      </svg>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PARTICLE EFFECT
// ═══════════════════════════════════════════════════════════════════════════════════════

function ParticleEffect({ color, active }: { color: string; active: boolean }) {
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    delay: i * 0.1,
    angle: i * 45 * (Math.PI / 180),
  }))

  if (!active) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute h-1 w-1 rounded-full"
          initial={{
            x: '50%',
            y: '50%',
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: `${50 + Math.cos(p.angle) * 100}%`,
            y: `${50 + Math.sin(p.angle) * 100}%`,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 0.6,
            delay: p.delay,
            ease: 'easeOut',
          }}
          style={{ background: color }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN GLASS BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export const GlassButton3D = forwardRef<HTMLButtonElement, GlassButton3DProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      loading = false,
      glow = true,
      particles = true,
      children,
      disabled,
      className = '',
      onClick,
      ...props
    },
    ref,
  ) => {
    const [isPressed, setIsPressed] = useState(false)
    const [showParticles, setShowParticles] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const styles = variantStyles[variant]
    const sizing = sizeStyles[size]

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (particles) {
        setShowParticles(true)
        setTimeout(() => setShowParticles(false), 600)
      }
      onClick?.(e)
    }

    return (
      <motion.button
        ref={ref || buttonRef}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={`relative overflow-hidden rounded-xl font-semibold tracking-wide transition-spring disabled:cursor-not-allowed disabled:opacity-50 ${className} `}
        style={{
          padding: sizing.padding,
          fontSize: sizing.fontSize,
          color: styles.text,
          background: styles.background,
          border: `1px solid ${styles.border}`,
          backdropFilter: 'blur(20px)',
          boxShadow: glow ? `0 0 25px ${styles.glow}, 0 8px 32px rgba(0, 0, 0, 0.3)` : undefined,
        }}
        whileHover={{
          scale: 1.01,
        }}
        whileTap={{
          scale: 0.98,
        }}
        {...props}
      >
        {/* Glass reflection */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.05) 100%)',
          }}
        />

        {/* Shine effect on hover */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ x: '-100%', opacity: 0 }}
          whileHover={{ x: '100%', opacity: 0.3 }}
          transition={{ duration: 0.5 }}
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          }}
        />

        {/* Particle effect */}
        <ParticleEffect color={styles.border} active={showParticles} />

        {/* Content */}
        <span className="relative flex items-center justify-center" style={{ gap: sizing.gap }}>
          {loading ? (
            <LoadingSpinner size={sizing.iconSize} />
          ) : (
            <>
              {Icon && iconPosition === 'left' && <Icon size={sizing.iconSize} />}
              <span>{children}</span>
              {Icon && iconPosition === 'right' && <Icon size={sizing.iconSize} />}
            </>
          )}
        </span>
      </motion.button>
    )
  },
)

GlassButton3D.displayName = 'GlassButton3D'

// ═══════════════════════════════════════════════════════════════════════════════════════
// ICON BUTTON VARIANT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface GlassIconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: LucideIcon
  variant?: ButtonVariant
  size?: ButtonSize
  glow?: boolean
  tooltip?: string
}

export const GlassIconButton = forwardRef<HTMLButtonElement, GlassIconButtonProps>(
  (
    {
      icon: Icon,
      variant = 'secondary',
      size = 'md',
      glow = true,
      tooltip,
      className = '',
      ...props
    },
    ref,
  ) => {
    const styles = variantStyles[variant]
    const sizing = sizeStyles[size]

    const sizeMap: Record<ButtonSize, string> = {
      sm: 'w-8 h-8',
      md: 'w-10 h-10',
      lg: 'w-12 h-12',
      xl: 'w-14 h-14',
    }

    return (
      <motion.button
        ref={ref}
        className={`relative flex items-center justify-center rounded-full transition-spring ${sizeMap[size]} ${className} `}
        style={{
          color: styles.text,
          background: styles.background,
          border: `1px solid ${styles.border}`,
          backdropFilter: 'blur(20px)',
          boxShadow: glow ? `0 0 20px ${styles.glow}` : undefined,
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        title={tooltip}
        {...props}
      >
        <Icon size={sizing.iconSize} />
      </motion.button>
    )
  },
)

GlassIconButton.displayName = 'GlassIconButton'

// ═══════════════════════════════════════════════════════════════════════════════════════
// BUTTON GROUP
// ═══════════════════════════════════════════════════════════════════════════════════════

interface GlassButtonGroupProps {
  children: React.ReactNode
  className?: string
  direction?: 'horizontal' | 'vertical'
}

export function GlassButtonGroup({
  children,
  className = '',
  direction = 'horizontal',
}: GlassButtonGroupProps) {
  return (
    <div
      className={`flex ${direction === 'horizontal' ? 'flex-row' : 'flex-col'} ${className} `}
      style={{ gap: '0.5rem' }}
    >
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FLOATING ACTION BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════

interface GlassFABProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: LucideIcon
  label?: string
  variant?: 'primary' | 'gold'
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
}

export function GlassFAB({
  icon: Icon,
  label,
  variant = 'primary',
  position = 'bottom-right',
  className = '',
  ...props
}: GlassFABProps) {
  const styles = variantStyles[variant]

  const positionClasses: Record<string, string> = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  }

  return (
    <motion.button
      className={`fixed z-50 flex items-center gap-2 rounded-full px-4 py-3 font-semibold ${positionClasses[position]} ${className} `}
      style={{
        background: styles.background,
        border: `1px solid ${styles.border}`,
        color: styles.text,
        backdropFilter: 'blur(20px)',
        boxShadow: `0 0 30px ${styles.glow}, 0 10px 40px rgba(0, 0, 0, 0.4)`,
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      <Icon size={20} />
      {label && <span>{label}</span>}
    </motion.button>
  )
}

export default GlassButton3D
