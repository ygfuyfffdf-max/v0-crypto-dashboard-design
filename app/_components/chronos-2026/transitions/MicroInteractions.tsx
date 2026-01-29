/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ✨ CHRONOS 2026 — MICROINTERACTIONS SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de microinteracciones premium:
 * - Botones con efectos avanzados
 * - Inputs interactivos
 * - Toggles y switches
 * - Progress indicators
 * - Feedback visual
 * - Cursor effects
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/lib/utils'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  type HTMLMotionProps,
} from 'motion/react'
import { forwardRef, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// PREMIUM BUTTON
// ═══════════════════════════════════════════════════════════════════════════════

// Omitimos onAnimationStart para evitar conflictos de tipos entre React y Framer Motion
type SafeButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  'onAnimationStart' | 'onDragStart' | 'onDragEnd' | 'onDrag'
>

interface PremiumButtonProps extends SafeButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  glow?: boolean
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      glow = false,
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isPressed, setIsPressed] = useState(false)
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

    const variants = {
      primary:
        'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-500/25',
      secondary: 'bg-white/10 text-white border border-white/20 backdrop-blur-xl',
      ghost: 'bg-transparent text-white hover:bg-white/10',
      danger: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25',
      success:
        'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-5 py-2.5 text-sm',
      lg: 'px-7 py-3.5 text-base',
    }

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return

      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setRipples((prev) => [...prev, { x, y, id: Date.now() }])
      props.onClick?.(e)
    }

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-xl font-medium',
          'transition-all duration-300',
          'focus:ring-2 focus:ring-purple-500/50 focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          variants[variant],
          sizes[size],
          glow &&
            'after:absolute after:inset-0 after:-z-10 after:rounded-xl after:bg-inherit after:opacity-50 after:blur-xl',
          className,
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -2 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        animate={{
          boxShadow: isPressed ? 'inset 0 2px 4px rgba(0,0,0,0.3)' : 'none',
        }}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        {...props}
      >
        {/* Ripple effect */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full bg-white/30"
            style={{ left: ripple.x, top: ripple.y }}
            initial={{ width: 0, height: 0, x: 0, y: 0 }}
            animate={{ width: 300, height: 300, x: -150, y: -150, opacity: 0 }}
            transition={{ duration: 0.6 }}
            onAnimationComplete={() => {
              setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
            }}
          />
        ))}

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <motion.span
              className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <>
              {icon && iconPosition === 'left' && icon}
              {children}
              {icon && iconPosition === 'right' && icon}
            </>
          )}
        </span>

        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{ x: ['0%', '200%'] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'linear',
          }}
        />
      </motion.button>
    )
  },
)

PremiumButton.displayName = 'PremiumButton'

// ═══════════════════════════════════════════════════════════════════════════════
// PREMIUM INPUT
// ═══════════════════════════════════════════════════════════════════════════════

interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  variant?: 'default' | 'filled' | 'outlined'
}

export const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
  ({ label, error, icon, variant = 'default', className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    const variants = {
      default: 'bg-white/5 border-white/10',
      filled: 'bg-white/10 border-transparent',
      outlined: 'bg-transparent border-white/20',
    }

    return (
      <div className="relative">
        {/* Floating label */}
        {label && (
          <motion.label
            className="pointer-events-none absolute left-4 text-white/50"
            animate={{
              y: isFocused || hasValue ? -28 : 0,
              scale: isFocused || hasValue ? 0.85 : 1,
              color: isFocused ? '#a78bfa' : error ? '#f87171' : 'rgba(255,255,255,0.5)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ originX: 0, top: '50%', translateY: '-50%' }}
          >
            {label}
          </motion.label>
        )}

        {/* Input container */}
        <motion.div
          className={cn(
            'relative overflow-hidden rounded-xl border',
            variants[variant],
            error && 'border-red-500/50',
            className,
          )}
          animate={{
            borderColor: isFocused
              ? 'rgba(167, 139, 250, 0.5)'
              : error
                ? 'rgba(248, 113, 113, 0.5)'
                : 'rgba(255, 255, 255, 0.1)',
            boxShadow: isFocused ? '0 0 0 4px rgba(167, 139, 250, 0.1)' : 'none',
          }}
        >
          {/* Icon */}
          {icon && (
            <span className="absolute top-1/2 left-4 -translate-y-1/2 text-white/50">{icon}</span>
          )}

          <input
            ref={ref}
            className={cn(
              'w-full bg-transparent px-4 py-3 text-white',
              'placeholder:text-white/30',
              'focus:outline-none',
              icon && 'pl-12',
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false)
              setHasValue(!!e.target.value)
            }}
            onChange={(e) => setHasValue(!!e.target.value)}
            {...props}
          />

          {/* Focus indicator line */}
          <motion.div
            className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-violet-500"
            initial={{ width: '0%' }}
            animate={{ width: isFocused ? '100%' : '0%' }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="mt-1.5 text-sm text-red-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  },
)

PremiumInput.displayName = 'PremiumInput'

// ═══════════════════════════════════════════════════════════════════════════════
// PREMIUM TOGGLE
// ═══════════════════════════════════════════════════════════════════════════════

interface PremiumToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function PremiumToggle({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
}: PremiumToggleProps) {
  const sizes = {
    sm: { track: 'w-8 h-4', thumb: 'w-3 h-3', translate: 16 },
    md: { track: 'w-11 h-6', thumb: 'w-5 h-5', translate: 20 },
    lg: { track: 'w-14 h-7', thumb: 'w-6 h-6', translate: 28 },
  }

  const currentSize = sizes[size]

  return (
    <label className="flex cursor-pointer items-center gap-3">
      <motion.button
        type="button"
        className={cn(
          'relative rounded-full transition-colors duration-300',
          currentSize.track,
          checked ? 'bg-gradient-to-r from-purple-600 to-violet-600' : 'bg-white/10',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        onClick={() => !disabled && onChange(!checked)}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        {/* Track glow */}
        {checked && (
          <motion.div
            className={cn('absolute inset-0 rounded-full bg-purple-500 opacity-50 blur-md')}
            layoutId="toggle-glow"
          />
        )}

        {/* Thumb */}
        <motion.div
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full bg-white shadow-lg',
            currentSize.thumb,
          )}
          animate={{
            x: checked ? currentSize.translate : 0,
            scale: checked ? 1.1 : 1,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          {/* Thumb inner glow */}
          {checked && (
            <motion.div
              className="absolute inset-0 rounded-full bg-purple-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
            />
          )}
        </motion.div>
      </motion.button>

      {label && (
        <span className={cn('text-sm text-white/70', disabled && 'opacity-50')}>{label}</span>
      )}
    </label>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════════

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  variant?: 'default' | 'gradient' | 'striped'
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  variant = 'gradient',
  size = 'md',
  color,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  const variants = {
    default: color || 'bg-purple-500',
    gradient: 'bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500',
    striped: 'bg-gradient-to-r from-purple-600 via-violet-500 to-fuchsia-500 bg-stripes',
  }

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label && <span className="text-sm text-white/70">{label}</span>}
          {showValue && (
            <motion.span
              className="text-sm text-white/50"
              key={Math.round(percentage)}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </div>
      )}

      <div className={cn('w-full overflow-hidden rounded-full bg-white/10', sizes[size])}>
        <motion.div
          className={cn('h-full rounded-full', variants[variant])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ['0%', '200%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CIRCULAR PROGRESS
// ═══════════════════════════════════════════════════════════════════════════════

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  showValue?: boolean
  label?: string
  color?: string
}

export function CircularProgress({
  value,
  max = 100,
  size = 80,
  strokeWidth = 8,
  showValue = true,
  label,
  color = '#8b5cf6',
}: CircularProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative inline-flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>

      {/* Center content */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-lg font-bold text-white"
            key={Math.round(percentage)}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            {Math.round(percentage)}%
          </motion.span>
          {label && <span className="text-xs text-white/50">{label}</span>}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE
// ═══════════════════════════════════════════════════════════════════════════════

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  icon?: React.ReactNode
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  pulse = false,
  icon,
}: BadgeProps) {
  const variants = {
    default: 'bg-white/10 text-white border-white/20',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  }

  return (
    <motion.span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        variants[variant],
        sizes[size],
      )}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'absolute inline-flex h-full w-full animate-ping rounded-full opacity-75',
              variant === 'success' && 'bg-emerald-400',
              variant === 'warning' && 'bg-amber-400',
              variant === 'danger' && 'bg-red-400',
              variant === 'info' && 'bg-blue-400',
              variant === 'default' && 'bg-white',
            )}
          />
          <span
            className={cn(
              'relative inline-flex h-2 w-2 rounded-full',
              variant === 'success' && 'bg-emerald-500',
              variant === 'warning' && 'bg-amber-500',
              variant === 'danger' && 'bg-red-500',
              variant === 'info' && 'bg-blue-500',
              variant === 'default' && 'bg-white',
            )}
          />
        </span>
      )}
      {icon}
      {children}
    </motion.span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// TOOLTIP
// ═══════════════════════════════════════════════════════════════════════════════

interface TooltipProps {
  children: React.ReactNode
  content: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export function Tooltip({ children, content, position = 'top', delay = 300 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-white/20',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-white/20',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-white/20',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-white/20',
  }

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsVisible(false)
  }

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            className={cn(
              'absolute z-50 px-3 py-2 text-sm text-white',
              'rounded-lg border border-white/10 bg-black/90 backdrop-blur-xl',
              'pointer-events-none whitespace-nowrap',
              positionClasses[position],
            )}
            initial={{
              opacity: 0,
              scale: 0.9,
              y: position === 'top' ? 10 : position === 'bottom' ? -10 : 0,
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// CURSOR FOLLOWER
// ═══════════════════════════════════════════════════════════════════════════════

interface CursorFollowerProps {
  enabled?: boolean
  color?: string
  size?: number
  trailLength?: number
}

export function CursorFollower({
  enabled = true,
  color = '#8b5cf6',
  size = 20,
  trailLength = 5,
}: CursorFollowerProps) {
  const cursorX = useMotionValue(0)
  const cursorY = useMotionValue(0)
  const [isHovering, setIsHovering] = useState(false)

  const springConfig = { damping: 25, stiffness: 300 }
  const springX = useSpring(cursorX, springConfig)
  const springY = useSpring(cursorY, springConfig)

  useEffect(() => {
    if (!enabled) return

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX)
      cursorY.set(e.clientY)
    }

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a')
      ) {
        setIsHovering(true)
      }
    }

    const handleMouseLeave = () => {
      setIsHovering(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseover', handleMouseEnter)
    document.addEventListener('mouseout', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseover', handleMouseEnter)
      document.removeEventListener('mouseout', handleMouseLeave)
    }
  }, [enabled, cursorX, cursorY])

  if (!enabled) return null

  return (
    <>
      {/* Main cursor */}
      <motion.div
        className="pointer-events-none fixed z-[9999] rounded-full mix-blend-difference"
        style={{
          x: springX,
          y: springY,
          width: size,
          height: size,
          backgroundColor: color,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{ scale: isHovering ? 1.5 : 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* Trail particles */}
      {Array.from({ length: trailLength }).map((_, i) => (
        <motion.div
          key={i}
          className="pointer-events-none fixed z-[9998] rounded-full"
          style={{
            x: useSpring(cursorX, { ...springConfig, damping: 30 + i * 5 }),
            y: useSpring(cursorY, { ...springConfig, damping: 30 + i * 5 }),
            width: size * (1 - i * 0.15),
            height: size * (1 - i * 0.15),
            backgroundColor: color,
            opacity: 0.3 - i * 0.05,
            translateX: '-50%',
            translateY: '-50%',
          }}
        />
      ))}
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION DOT
// ═══════════════════════════════════════════════════════════════════════════════

interface NotificationDotProps {
  count?: number
  show?: boolean
  maxCount?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  color?: string
  pulse?: boolean
}

export function NotificationDot({
  count,
  show = true,
  maxCount = 99,
  position = 'top-right',
  color = 'red',
  pulse = false,
}: NotificationDotProps) {
  const positionClasses = {
    'top-right': '-top-1 -right-1',
    'top-left': '-top-1 -left-1',
    'bottom-right': '-bottom-1 -right-1',
    'bottom-left': '-bottom-1 -left-1',
  }

  const colorClasses: Record<string, string> = {
    red: 'bg-red-500 shadow-red-500/50',
    green: 'bg-green-500 shadow-green-500/50',
    blue: 'bg-blue-500 shadow-blue-500/50',
    purple: 'bg-purple-500 shadow-purple-500/50',
    amber: 'bg-amber-500 shadow-amber-500/50',
  }

  if (!show) return null

  const displayCount = count && count > maxCount ? `${maxCount}+` : count
  const bgColor = colorClasses[color] || colorClasses.red

  return (
    <motion.span
      className={cn(
        'absolute flex h-[18px] min-w-[18px] items-center justify-center px-1',
        'rounded-full text-xs font-bold text-white shadow-lg',
        bgColor,
        pulse && 'animate-pulse',
        positionClasses[position],
      )}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      {displayCount || <span className="h-2 w-2 animate-pulse rounded-full bg-white" />}
    </motion.span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-2xl border border-white/10 bg-white/5 p-4', className)}>
      <div className="mb-4 flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-white/10" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-3 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-white/10" />
        <div className="h-3 w-4/6 animate-pulse rounded bg-white/10" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 border-b border-white/10 pb-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 flex-1 animate-pulse rounded bg-white/10" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2">
          {[1, 2, 3, 4].map((j) => (
            <div
              key={j}
              className="h-4 flex-1 animate-pulse rounded bg-white/10"
              style={{ animationDelay: `${(i * 4 + j) * 50}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// GLOW CARD - Tarjeta con efecto de brillo premium
// ═══════════════════════════════════════════════════════════════════════════════

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string
  glowIntensity?: number
}

export function GlowCard({
  children,
  className,
  glowColor = 'purple',
  glowIntensity = 0.5,
}: GlowCardProps) {
  const glowColors: Record<string, string> = {
    purple: 'rgba(139, 92, 246, VAR)',
    blue: 'rgba(59, 130, 246, VAR)',
    cyan: 'rgba(6, 182, 212, VAR)',
    green: 'rgba(34, 197, 94, VAR)',
    amber: 'rgba(245, 158, 11, VAR)',
    rose: 'rgba(244, 63, 94, VAR)',
  }

  const colorValue = glowColors[glowColor] || glowColors.purple
  const shadowColor = colorValue!.replace('VAR', String(glowIntensity))

  return (
    <motion.div
      className={cn(
        'relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5',
        'overflow-hidden border border-white/10 backdrop-blur-xl',
        className,
      )}
      style={{
        boxShadow: `0 0 40px ${shadowColor}, 0 0 80px ${shadowColor.replace(String(glowIntensity), String(glowIntensity * 0.5))}`,
      }}
      whileHover={{
        boxShadow: `0 0 60px ${shadowColor}, 0 0 120px ${shadowColor.replace(String(glowIntensity), String(glowIntensity * 0.7))}`,
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Glow overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${shadowColor}, transparent 70%)`,
        }}
      />
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// PULSE INDICATOR - Indicador con pulso animado
// ═══════════════════════════════════════════════════════════════════════════════

interface PulseIndicatorProps {
  status?: 'active' | 'warning' | 'error' | 'idle'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export function PulseIndicator({
  status = 'active',
  size = 'md',
  className,
  label,
}: PulseIndicatorProps) {
  const colors = {
    active: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    idle: 'bg-gray-500',
  }

  const pulseColors = {
    active: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
    idle: 'bg-gray-400',
  }

  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        {status !== 'idle' && (
          <motion.div
            className={cn('absolute inset-0 rounded-full', pulseColors[status])}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.7, 0, 0.7],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}
        <div className={cn('rounded-full', colors[status], sizes[size])} />
      </div>
      {label && <span className="text-sm text-white/70">{label}</span>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON LOADER - Loader tipo skeleton premium
// ═══════════════════════════════════════════════════════════════════════════════

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  className?: string
  animation?: 'pulse' | 'wave' | 'none'
}

export function SkeletonLoader({
  variant = 'text',
  width,
  height,
  className,
  animation = 'pulse',
}: SkeletonLoaderProps) {
  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  }

  const animations = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  }

  return (
    <div
      className={cn('bg-white/10', variants[variant], animations[animation], className)}
      style={{
        width: width ?? (variant === 'circular' ? '40px' : '100%'),
        height: height ?? (variant === 'circular' ? '40px' : variant === 'text' ? '16px' : '100px'),
      }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOVER CARD 3D - Tarjeta con efecto 3D al hover
// ═══════════════════════════════════════════════════════════════════════════════

interface HoverCard3DProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

export function HoverCard3D({ children, className, intensity = 15 }: HoverCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    setRotateX(((y - centerY) / centerY) * -intensity)
    setRotateY(((x - centerX) / centerX) * intensity)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn('cursor-pointer', className)}
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLOATING LABEL - Input con label flotante
// ═══════════════════════════════════════════════════════════════════════════════

interface FloatingLabelProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export const FloatingLabel = forwardRef<HTMLInputElement, FloatingLabelProps>(
  ({ label, error, className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(false)

    return (
      <div className={cn('relative', className)}>
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl border bg-white/5 px-4 pt-6 pb-2 text-white',
            'focus:ring-2 focus:ring-purple-500/50 focus:outline-none',
            'transition-all duration-200',
            error ? 'border-red-500/50' : 'border-white/10',
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            setIsFocused(false)
            setHasValue(!!e.target.value)
          }}
          {...props}
        />
        <motion.label
          className={cn(
            'pointer-events-none absolute left-4 transition-all duration-200',
            error ? 'text-red-400' : 'text-white/50',
          )}
          animate={{
            top: isFocused || hasValue ? '8px' : '50%',
            fontSize: isFocused || hasValue ? '12px' : '14px',
            y: isFocused || hasValue ? 0 : '-50%',
          }}
        >
          {label}
        </motion.label>
        {error && (
          <motion.p
            className="mt-1 text-xs text-red-400"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  },
)

FloatingLabel.displayName = 'FloatingLabel'

// ═══════════════════════════════════════════════════════════════════════════════
// PROGRESS RING - Anillo de progreso circular
// ═══════════════════════════════════════════════════════════════════════════════

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  className?: string
  showPercentage?: boolean
}

export function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 4,
  color = '#8B5CF6',
  trackColor = 'rgba(255,255,255,0.1)',
  className,
  showPercentage = true,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      {showPercentage && (
        <span className="absolute text-sm font-medium text-white">{Math.round(progress)}%</span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAGNETIC BUTTON - Botón con efecto magnético
// ═══════════════════════════════════════════════════════════════════════════════

interface MagneticButtonProps extends SafeButtonProps {
  children: React.ReactNode
  strength?: number
}

export function MagneticButton({
  children,
  strength = 0.3,
  className,
  ...props
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return
    const rect = buttonRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    setPosition({ x: x * strength, y: y * strength })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  return (
    <motion.button
      ref={buttonRef}
      className={cn('relative', className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      {...props}
    >
      {children}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// RIPPLE EFFECT - Efecto de onda al click
// ═══════════════════════════════════════════════════════════════════════════════

interface RippleEffectProps {
  children: React.ReactNode
  className?: string
  color?: string
}

export function RippleEffect({
  children,
  className,
  color = 'rgba(255, 255, 255, 0.3)',
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setRipples((prev) => [...prev, { x, y, id: Date.now() }])
  }

  return (
    <div className={cn('relative overflow-hidden', className)} onClick={handleClick}>
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="pointer-events-none absolute rounded-full"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: color,
          }}
          initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
          animate={{ width: 400, height: 400, x: -200, y: -200, opacity: 0 }}
          transition={{ duration: 0.6 }}
          onAnimationComplete={() => {
            setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
          }}
        />
      ))}
    </div>
  )
}
