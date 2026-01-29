'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2030 — QUANTUM ELEVATED UI COMPONENTS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Componentes UI ultra-elevados con:
 * - Glassmorphism Gen-5 (frosted, liquid metal)
 * - Bordes con luz viajando (traveling light)
 * - Magnetic cursor attract
 * - Ripple shaders oro/violeta
 * - Spring physics en todas las interacciones
 * - 3D Tilt sutil con parallax interno
 *
 * PALETA: #000000 / #8B00FF / #FFD700 / #FF1493 / #FFFFFF
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { Check, ChevronDown, Loader2 } from 'lucide-react'
import React, { forwardRef, ReactNode, useCallback, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🎨 DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════════════════

const QUANTUM_COLORS = {
  violet: {
    pure: '#8B00FF',
    glow: 'rgba(139, 0, 255, 0.4)',
    border: 'rgba(139, 0, 255, 0.3)',
    surface: 'rgba(139, 0, 255, 0.1)',
  },
  gold: {
    pure: '#FFD700',
    glow: 'rgba(255, 215, 0, 0.4)',
    border: 'rgba(255, 215, 0, 0.3)',
    surface: 'rgba(255, 215, 0, 0.1)',
  },
  plasma: {
    pure: '#FF1493',
    glow: 'rgba(255, 20, 147, 0.4)',
    border: 'rgba(255, 20, 147, 0.3)',
    surface: 'rgba(255, 20, 147, 0.1)',
  },
  success: {
    pure: '#00FF87',
    glow: 'rgba(0, 255, 135, 0.4)',
  },
  danger: {
    pure: '#FF3366',
    glow: 'rgba(255, 51, 102, 0.4)',
  },
}

const SPRING_CONFIG = {
  stiffness: 400,
  damping: 30,
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔮 QUANTUM GLASS CARD - Tarjeta con Glassmorphism Gen-5
// ═══════════════════════════════════════════════════════════════════════════════════════

type GlassVariant =
  | 'default'
  | 'violet'
  | 'gold'
  | 'plasma'
  | 'frosted'
  | 'liquidMetal'
  | 'elevated'
  | 'ghost'
  | 'surface'

interface QuantumGlassCardProps {
  variant?: GlassVariant
  children: ReactNode
  className?: string
  onClick?: () => void
  enableTilt?: boolean
  enableGlow?: boolean
  enableRipple?: boolean
  tiltIntensity?: number
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const GLASS_STYLES: Record<GlassVariant, { bg: string; border: string; glow: string }> = {
  default: {
    bg: 'rgba(20, 15, 30, 0.85)',
    border: 'rgba(255, 255, 255, 0.1)',
    glow: 'rgba(139, 0, 255, 0.2)',
  },
  violet: {
    bg: 'linear-gradient(135deg, rgba(139, 0, 255, 0.15) 0%, rgba(20, 10, 40, 0.9) 100%)',
    border: 'rgba(139, 0, 255, 0.3)',
    glow: 'rgba(139, 0, 255, 0.4)',
  },
  gold: {
    bg: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(30, 25, 15, 0.9) 100%)',
    border: 'rgba(255, 215, 0, 0.3)',
    glow: 'rgba(255, 215, 0, 0.3)',
  },
  plasma: {
    bg: 'linear-gradient(135deg, rgba(255, 20, 147, 0.12) 0%, rgba(30, 10, 25, 0.9) 100%)',
    border: 'rgba(255, 20, 147, 0.3)',
    glow: 'rgba(255, 20, 147, 0.35)',
  },
  frosted: {
    bg: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.15)',
    glow: 'rgba(255, 255, 255, 0.1)',
  },
  liquidMetal: {
    bg: 'linear-gradient(135deg, rgba(192, 192, 192, 0.15) 0%, rgba(139, 0, 255, 0.1) 50%, rgba(30, 20, 45, 0.95) 100%)',
    border: 'rgba(192, 192, 192, 0.25)',
    glow: 'rgba(192, 192, 192, 0.2)',
  },
  ghost: {
    bg: 'transparent',
    border: 'rgba(255, 255, 255, 0.05)',
    glow: 'rgba(139, 0, 255, 0.1)',
  },
  elevated: {
    bg: 'rgba(25, 20, 35, 0.95)',
    border: 'rgba(139, 0, 255, 0.2)',
    glow: 'rgba(139, 0, 255, 0.3)',
  },
  surface: {
    bg: 'rgba(15, 12, 25, 0.9)',
    border: 'rgba(255, 255, 255, 0.08)',
    glow: 'rgba(139, 0, 255, 0.15)',
  },
}

const PADDING_MAP = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
}

interface Ripple {
  id: number
  x: number
  y: number
}

export function QuantumGlassCard({
  variant = 'default',
  children,
  className = '',
  onClick,
  enableTilt = true,
  enableGlow = true,
  enableRipple = true,
  tiltIntensity = 8,
  padding = 'lg',
}: QuantumGlassCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [ripples, setRipples] = useState<Ripple[]>([])

  const styles = GLASS_STYLES[variant]

  // Motion values for tilt
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const scale = useMotionValue(1)

  // Springs
  const springRotateX = useSpring(rotateX, SPRING_CONFIG)
  const springRotateY = useSpring(rotateY, SPRING_CONFIG)
  const springScale = useSpring(scale, { stiffness: 300, damping: 25 })

  // Glare position
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)
  const springGlareX = useSpring(glareX, { stiffness: 200, damping: 25 })
  const springGlareY = useSpring(glareY, { stiffness: 200, damping: 25 })

  // Pre-compute glare gradient to avoid hooks inside JSX
  const glareGradient = useTransform(
    [springGlareX, springGlareY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || !enableTilt) return

      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      rotateX.set((y - 0.5) * tiltIntensity * -1)
      rotateY.set((x - 0.5) * tiltIntensity)

      glareX.set(x * 100)
      glareY.set(y * 100)

      scale.set(1.02)
    },
    [enableTilt, tiltIntensity, rotateX, rotateY, glareX, glareY, scale],
  )

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
    glareX.set(50)
    glareY.set(50)
    setIsHovered(false)
  }, [rotateX, rotateY, scale, glareX, glareY])

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!enableRipple || !ref.current) {
        onClick?.()
        return
      }

      const rect = ref.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const newRipple: Ripple = {
        id: Date.now(),
        x,
        y,
      }

      setRipples((prev) => [...prev, newRipple])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
      }, 600)

      onClick?.()
    },
    [enableRipple, onClick],
  )

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-2xl',
        PADDING_MAP[padding],
        onClick && 'cursor-pointer',
        className,
      )}
      style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        rotateX: springRotateX,
        rotateY: springRotateY,
        scale: springScale,
        transformPerspective: 1000,
        boxShadow:
          isHovered && enableGlow
            ? `0 20px 60px -20px ${styles.glow}, 0 0 40px ${styles.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`
            : '0 10px 40px -15px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
    >
      {/* Traveling light border effect */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-[-1px] rounded-2xl"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${styles.glow}, transparent 30%)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}

      {/* Glare effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background: glareGradient,
        }}
      />

      {/* Ripple effects */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full"
            initial={{
              width: 0,
              height: 0,
              x: ripple.x,
              y: ripple.y,
              opacity: 0.6,
            }}
            animate={{
              width: 400,
              height: 400,
              x: ripple.x - 200,
              y: ripple.y - 200,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{
              background: `radial-gradient(circle, ${styles.glow} 0%, transparent 70%)`,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ⚡ QUANTUM BUTTON - Botón con Magnetic + Ripple + Haptic Visual
// ═══════════════════════════════════════════════════════════════════════════════════════

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'gradient'
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

interface QuantumButtonProps {
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  enableMagnetic?: boolean
  enableRipple?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const BUTTON_VARIANTS: Record<
  ButtonVariant,
  {
    bg: string
    bgHover: string
    border: string
    shadow: string
    text: string
    ripple: string
  }
> = {
  primary: {
    bg: 'linear-gradient(135deg, #8B00FF 0%, #6B00CC 100%)',
    bgHover: 'linear-gradient(135deg, #9E33FF 0%, #7B00DD 100%)',
    border: 'rgba(139, 0, 255, 0.5)',
    shadow: '0 10px 40px -10px rgba(139, 0, 255, 0.5)',
    text: '#FFFFFF',
    ripple: 'rgba(255, 255, 255, 0.3)',
  },
  secondary: {
    bg: 'rgba(139, 0, 255, 0.15)',
    bgHover: 'rgba(139, 0, 255, 0.25)',
    border: 'rgba(139, 0, 255, 0.3)',
    shadow: 'none',
    text: '#B24BFF',
    ripple: 'rgba(139, 0, 255, 0.3)',
  },
  ghost: {
    bg: 'transparent',
    bgHover: 'rgba(255, 255, 255, 0.1)',
    border: 'transparent',
    shadow: 'none',
    text: 'rgba(255, 255, 255, 0.8)',
    ripple: 'rgba(255, 255, 255, 0.2)',
  },
  danger: {
    bg: 'linear-gradient(135deg, #FF1493 0%, #D40078 100%)',
    bgHover: 'linear-gradient(135deg, #FF4DB8 0%, #E5008C 100%)',
    border: 'rgba(255, 20, 147, 0.5)',
    shadow: '0 10px 40px -10px rgba(255, 20, 147, 0.5)',
    text: '#FFFFFF',
    ripple: 'rgba(255, 255, 255, 0.3)',
  },
  gold: {
    bg: 'linear-gradient(135deg, #FFD700 0%, #D4B000 100%)',
    bgHover: 'linear-gradient(135deg, #FFE44D 0%, #E5C700 100%)',
    border: 'rgba(255, 215, 0, 0.5)',
    shadow: '0 10px 40px -10px rgba(255, 215, 0, 0.5)',
    text: '#000000',
    ripple: 'rgba(0, 0, 0, 0.2)',
  },
  gradient: {
    bg: 'linear-gradient(135deg, #8B00FF 0%, #FFD700 50%, #FF1493 100%)',
    bgHover: 'linear-gradient(135deg, #9E33FF 0%, #FFE44D 50%, #FF4DB8 100%)',
    border: 'rgba(255, 255, 255, 0.2)',
    shadow: '0 10px 40px -10px rgba(139, 0, 255, 0.4)',
    text: '#FFFFFF',
    ripple: 'rgba(255, 255, 255, 0.3)',
  },
}

const BUTTON_SIZES: Record<
  ButtonSize,
  { height: string; px: string; text: string; iconSize: number }
> = {
  sm: { height: 'h-8', px: 'px-3', text: 'text-xs', iconSize: 14 },
  md: { height: 'h-10', px: 'px-4', text: 'text-sm', iconSize: 16 },
  lg: { height: 'h-12', px: 'px-6', text: 'text-base', iconSize: 18 },
  xl: { height: 'h-14', px: 'px-8', text: 'text-lg', iconSize: 20 },
}

export const QuantumButton = forwardRef<HTMLButtonElement, QuantumButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading = false,
      disabled = false,
      fullWidth = false,
      enableMagnetic = true,
      enableRipple = true,
      className = '',
      onClick,
      type = 'button',
    },
    ref,
  ) => {
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [ripples, setRipples] = useState<Ripple[]>([])
    const [isPressed, setIsPressed] = useState(false)

    const styles = BUTTON_VARIANTS[variant]
    const sizeStyles = BUTTON_SIZES[size]

    // Magnetic effect
    const magneticX = useMotionValue(0)
    const magneticY = useMotionValue(0)
    const springX = useSpring(magneticX, { stiffness: 300, damping: 20 })
    const springY = useSpring(magneticY, { stiffness: 300, damping: 20 })

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!enableMagnetic || !buttonRef.current || disabled) return

        const rect = buttonRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const distanceX = (e.clientX - centerX) * 0.15
        const distanceY = (e.clientY - centerY) * 0.15

        magneticX.set(distanceX)
        magneticY.set(distanceY)
      },
      [enableMagnetic, disabled, magneticX, magneticY],
    )

    const handleMouseLeave = useCallback(() => {
      magneticX.set(0)
      magneticY.set(0)
    }, [magneticX, magneticY])

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        if (disabled || loading) return

        if (enableRipple && buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect()
          const x = e.clientX - rect.left
          const y = e.clientY - rect.top

          const newRipple: Ripple = { id: Date.now(), x, y }
          setRipples((prev) => [...prev, newRipple])
          setTimeout(() => {
            setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
          }, 600)
        }

        // Haptic visual feedback
        setIsPressed(true)
        setTimeout(() => setIsPressed(false), 150)

        // Solo llamar onClick si es type="button", NO para submit
        // El submit se maneja por el evento nativo del form
        if (type === 'button' && onClick) {
          onClick()
        }
      },
      [disabled, loading, enableRipple, onClick, type],
    )

    return (
      <motion.button
        ref={buttonRef}
        type={type}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn(
          'relative overflow-hidden rounded-xl font-semibold',
          'flex items-center justify-center gap-2',
          'transition-all duration-300',
          'disabled:cursor-not-allowed disabled:opacity-50',
          sizeStyles.height,
          sizeStyles.px,
          sizeStyles.text,
          fullWidth && 'w-full',
          className,
        )}
        style={{
          background: styles.bg,
          border: `1px solid ${styles.border}`,
          color: styles.text,
          boxShadow: !disabled ? styles.shadow : 'none',
          x: springX,
          y: springY,
        }}
        whileHover={!disabled ? { scale: 1.03 } : {}}
        whileTap={!disabled ? { scale: 0.97 } : {}}
        animate={{
          scale: isPressed ? 0.95 : 1,
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {/* Shine effect */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }}
        />

        {/* Ripples */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="pointer-events-none absolute rounded-full"
              initial={{
                width: 0,
                height: 0,
                x: ripple.x,
                y: ripple.y,
                opacity: 0.6,
              }}
              animate={{
                width: 300,
                height: 300,
                x: ripple.x - 150,
                y: ripple.y - 150,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              style={{
                background: `radial-gradient(circle, ${styles.ripple} 0%, transparent 70%)`,
              }}
            />
          ))}
        </AnimatePresence>

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <Loader2
              className="animate-spin"
              style={{ width: sizeStyles.iconSize, height: sizeStyles.iconSize }}
            />
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <span style={{ width: sizeStyles.iconSize, height: sizeStyles.iconSize }}>
                  {icon}
                </span>
              )}
              {children}
              {icon && iconPosition === 'right' && (
                <span style={{ width: sizeStyles.iconSize, height: sizeStyles.iconSize }}>
                  {icon}
                </span>
              )}
            </>
          )}
        </span>
      </motion.button>
    )
  },
)

QuantumButton.displayName = 'QuantumButton'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📝 QUANTUM INPUT - Input con Glow Focus + Floating Label
// ═══════════════════════════════════════════════════════════════════════════════════════

interface QuantumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  variant?: 'default' | 'violet' | 'gold'
}

export const QuantumInput = forwardRef<HTMLInputElement, QuantumInputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      variant = 'default',
      className = '',
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false)

    const focusColors = {
      default: { border: 'rgba(139, 0, 255, 0.6)', glow: 'rgba(139, 0, 255, 0.2)' },
      violet: { border: 'rgba(139, 0, 255, 0.8)', glow: 'rgba(139, 0, 255, 0.3)' },
      gold: { border: 'rgba(255, 215, 0, 0.8)', glow: 'rgba(255, 215, 0, 0.2)' },
    }

    const colors = focusColors[variant]

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label className="text-sm font-medium text-white/70">
            {label}
            {props.required && <span className="ml-1 text-red-400">*</span>}
          </label>
        )}

        <motion.div
          className="relative"
          animate={{
            scale: focused ? 1.01 : 1,
          }}
          transition={SPRING_CONFIG}
        >
          {icon && iconPosition === 'left' && (
            <div className="absolute top-1/2 left-4 -translate-y-1/2 text-white/40">{icon}</div>
          )}

          <input
            ref={ref}
            onFocus={(e) => {
              setFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              onBlur?.(e)
            }}
            className={cn(
              'w-full rounded-xl px-4 py-3.5',
              'bg-white/5 backdrop-blur-sm',
              'text-white placeholder:text-white/30',
              'transition-all duration-300 outline-none',
              icon && iconPosition === 'left' && 'pl-12',
              icon && iconPosition === 'right' && 'pr-12',
              error && 'border-red-500/50 bg-red-500/5',
            )}
            style={{
              border: `1px solid ${error ? 'rgba(255, 51, 102, 0.5)' : focused ? colors.border : 'rgba(255, 255, 255, 0.1)'}`,
              boxShadow:
                focused && !error
                  ? `0 0 30px ${colors.glow}, inset 0 0 20px ${colors.glow}`
                  : error
                    ? '0 0 20px rgba(255, 51, 102, 0.15)'
                    : 'none',
            }}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute top-1/2 right-4 -translate-y-1/2 text-white/40">{icon}</div>
          )}
        </motion.div>

        {error && <p className="text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="text-xs text-white/40">{hint}</p>}
      </div>
    )
  },
)

QuantumInput.displayName = 'QuantumInput'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📋 QUANTUM SELECT - Select con Glassmorphism
// ═══════════════════════════════════════════════════════════════════════════════════════

interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
}

interface QuantumSelectProps {
  label?: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  className?: string
}

export function QuantumSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  error,
  className = '',
}: QuantumSelectProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.value === value)

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label className="text-sm font-medium text-white/70">{label}</label>}

      <div className="relative">
        <motion.button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            'w-full rounded-xl px-4 py-3.5',
            'bg-white/5 backdrop-blur-sm',
            'flex items-center justify-between text-left',
            'transition-all duration-300',
          )}
          style={{
            border: `1px solid ${error ? 'rgba(255, 51, 102, 0.5)' : open ? 'rgba(139, 0, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
            boxShadow: open ? '0 0 30px rgba(139, 0, 255, 0.2)' : 'none',
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <span className={selected ? 'text-white' : 'text-white/40'}>
            {selected ? (
              <span className="flex items-center gap-2">
                {selected.icon}
                {selected.label}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-white/40" />
          </motion.span>
        </motion.button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'absolute z-50 mt-2 w-full rounded-xl py-2',
                'bg-zinc-900/95 backdrop-blur-2xl',
                'border border-white/10',
                'shadow-2xl shadow-purple-500/10',
              )}
            >
              {options.map((option) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange?.(option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left',
                    'transition-colors',
                    value === option.value
                      ? 'bg-purple-500/15 text-purple-400'
                      : 'text-white/80 hover:bg-white/10',
                  )}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                >
                  {option.icon}
                  <span>{option.label}</span>
                  {value === option.value && <Check className="ml-auto h-4 w-4 text-purple-400" />}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 📊 QUANTUM METRIC CARD - Card para métricas con sparkline visual
// ═══════════════════════════════════════════════════════════════════════════════════════

interface QuantumMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: { value: number; positive: boolean }
  variant?: 'violet' | 'gold' | 'plasma' | 'success' | 'default'
  className?: string
  onClick?: () => void
}

export function QuantumMetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'default',
  className = '',
  onClick,
}: QuantumMetricCardProps) {
  const colors = {
    default: { accent: '#8B00FF', glow: 'rgba(139, 0, 255, 0.3)' },
    violet: { accent: '#8B00FF', glow: 'rgba(139, 0, 255, 0.4)' },
    gold: { accent: '#FFD700', glow: 'rgba(255, 215, 0, 0.4)' },
    plasma: { accent: '#FF1493', glow: 'rgba(255, 20, 147, 0.4)' },
    success: { accent: '#00FF87', glow: 'rgba(0, 255, 135, 0.4)' },
  }

  const c = colors[variant]

  return (
    <QuantumGlassCard
      variant={variant === 'default' ? 'default' : variant === 'success' ? 'frosted' : variant}
      onClick={onClick}
      enableTilt
      enableGlow
      padding="lg"
      className={className}
    >
      <div className="flex items-start justify-between">
        {icon && (
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${c.accent}25 0%, ${c.accent}10 100%)`,
              boxShadow: `0 0 20px ${c.glow}`,
            }}
          >
            <span style={{ color: c.accent }}>{icon}</span>
          </div>
        )}

        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              trend.positive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400',
            )}
          >
            <span>{trend.positive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs tracking-wider text-white/50 uppercase">{title}</p>
        <p className="mt-1 text-3xl font-bold text-white">{value}</p>
        {subtitle && <p className="mt-1 text-sm text-white/40">{subtitle}</p>}
      </div>
    </QuantumGlassCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🏷️ EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export {
    BUTTON_VARIANTS,
    GLASS_STYLES,
    QUANTUM_COLORS,
    type ButtonSize,
    type ButtonVariant,
    type GlassVariant,
}
