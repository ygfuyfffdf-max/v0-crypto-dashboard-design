'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🍎 iOS GLASSMORPHISM DESIGN SYSTEM — CHRONOS 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componentes con diseño inspirado en iOS 18 / visionOS 2.0:
 * - Glassmorphism avanzado con blur dinámico
 * - Cards sin efectos de parallax problemáticos
 * - Interacciones sutiles y elegantes
 * - Diseño limpio, minimalista y premium
 * - Optimizado para desktop y mobile
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { motion, AnimatePresence, type Variants } from 'motion/react'
import {
  type ReactNode,
  forwardRef,
  type ComponentPropsWithoutRef,
  useState,
  type MouseEvent,
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VARIANTES DE ANIMACIÓN — SUTILES Y ELEGANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2 }
  }
}

const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30 }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS CARD — SIN EFECTOS 3D PROBLEMÁTICOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassCardProps extends ComponentPropsWithoutRef<'div'> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'inset' | 'prominent'
  interactive?: boolean
  glow?: boolean
  accentColor?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  border?: boolean
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
}

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    {
      children,
      variant = 'default',
      interactive = false,
      glow = false,
      accentColor = '#8B5CF6',
      padding = 'md',
      rounded = 'xl',
      border = true,
      blur = 'md',
      animate = true,
      className,
      onClick,
      ...props
    },
    ref
  ) {
    const [isPressed, setIsPressed] = useState(false)

    // Variant styles mapping
    const variantStyles = {
      default: {
        bg: 'bg-white/[0.03]',
        hover: 'hover:bg-white/[0.05]',
        border: 'border-white/[0.06]',
        hoverBorder: 'hover:border-white/[0.10]',
      },
      elevated: {
        bg: 'bg-white/[0.05]',
        hover: 'hover:bg-white/[0.08]',
        border: 'border-white/[0.08]',
        hoverBorder: 'hover:border-white/[0.15]',
        shadow: 'shadow-lg shadow-black/20',
      },
      inset: {
        bg: 'bg-black/[0.2]',
        hover: 'hover:bg-black/[0.25]',
        border: 'border-white/[0.04]',
        hoverBorder: 'hover:border-white/[0.08]',
        inset: 'shadow-inner shadow-black/30',
      },
      prominent: {
        bg: 'bg-gradient-to-br from-white/[0.08] to-white/[0.02]',
        hover: 'hover:from-white/[0.12] hover:to-white/[0.04]',
        border: 'border-white/[0.12]',
        hoverBorder: 'hover:border-white/[0.20]',
        shadow: 'shadow-xl shadow-black/30',
      },
    }

    const paddingStyles = {
      none: '',
      sm: 'p-3',
      md: 'p-4 sm:p-5',
      lg: 'p-5 sm:p-6 lg:p-8',
    }

    const roundedStyles = {
      sm: 'rounded-lg',
      md: 'rounded-xl',
      lg: 'rounded-2xl',
      xl: 'rounded-3xl',
      '2xl': 'rounded-[2rem]',
      full: 'rounded-full',
    }

    const blurStyles = {
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl',
    }

    const style = variantStyles[variant]

    const BaseComponent = animate ? motion.div : 'div'
    const animationProps = animate
      ? {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
          whileTap: interactive ? { scale: 0.98 } : undefined,
        }
      : {}

    return (
      <BaseComponent
        ref={ref}
        className={cn(
          // Base styles
          'relative transition-all duration-300 ease-out',
          style.bg,
          blurStyles[blur],
          paddingStyles[padding],
          roundedStyles[rounded],

          // Border
          border && 'border',
          border && style.border,

          // Shadow
          'shadow' in style && style.shadow,
          'inset' in style && style.inset,

          // Interactive states
          interactive && [
            'cursor-pointer',
            style.hover,
            style.hoverBorder,
            'active:scale-[0.98]',
          ],

          // Glow effect on hover (subtle)
          glow && 'group',

          className
        )}
        onClick={onClick}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        style={{
          // Subtle glow on hover - no annoying 3D effects
          ...(glow && {
            boxShadow: isPressed
              ? `0 0 20px ${accentColor}30, inset 0 1px 0 rgba(255,255,255,0.05)`
              : undefined,
          }),
        }}
        {...animationProps}
        {...props}
      >
        {/* Subtle top highlight */}
        <div className={cn(
          'absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent',
          roundedStyles[rounded],
        )} />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Subtle glow indicator on hover */}
        {glow && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-inherit"
            style={{
              background: `radial-gradient(circle at 50% 0%, ${accentColor}15, transparent 60%)`,
              borderRadius: 'inherit',
            }}
          />
        )}
      </BaseComponent>
    )
  }
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS BUTTON — ESTILO iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassButtonProps extends ComponentPropsWithoutRef<'button'> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  function GlassButton(
    {
      children,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      icon,
      iconPosition = 'left',
      disabled,
      className,
      ...props
    },
    ref
  ) {
    const variantStyles = {
      primary: {
        bg: 'bg-white/10',
        hover: 'hover:bg-white/15',
        active: 'active:bg-white/20',
        text: 'text-white',
        border: 'border-white/10',
        glow: 'hover:shadow-lg hover:shadow-violet-500/10',
      },
      secondary: {
        bg: 'bg-white/5',
        hover: 'hover:bg-white/8',
        active: 'active:bg-white/12',
        text: 'text-white/80',
        border: 'border-white/5',
        glow: '',
      },
      ghost: {
        bg: 'bg-transparent',
        hover: 'hover:bg-white/5',
        active: 'active:bg-white/10',
        text: 'text-white/70',
        border: 'border-transparent',
        glow: '',
      },
      danger: {
        bg: 'bg-red-500/10',
        hover: 'hover:bg-red-500/20',
        active: 'active:bg-red-500/30',
        text: 'text-red-400',
        border: 'border-red-500/20',
        glow: 'hover:shadow-lg hover:shadow-red-500/10',
      },
      success: {
        bg: 'bg-emerald-500/10',
        hover: 'hover:bg-emerald-500/20',
        active: 'active:bg-emerald-500/30',
        text: 'text-emerald-400',
        border: 'border-emerald-500/20',
        glow: 'hover:shadow-lg hover:shadow-emerald-500/10',
      },
    }

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    }

    const style = variantStyles[variant]

    return (
      <motion.button
        ref={ref}
        className={cn(
          // Base
          'relative inline-flex items-center justify-center',
          'font-medium rounded-xl',
          'border backdrop-blur-sm',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent',

          // Variant
          style.bg,
          style.hover,
          style.active,
          style.text,
          style.border,
          style.glow,

          // Size
          sizeStyles[size],

          // States
          fullWidth && 'w-full',
          disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          loading && 'cursor-wait',

          className
        )}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        disabled={disabled || loading}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}

        {/* Content */}
        <span className={cn(
          'flex items-center justify-center',
          sizeStyles[size],
          loading && 'invisible'
        )}>
          {icon && iconPosition === 'left' && (
            <span className="shrink-0">{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="shrink-0">{icon}</span>
          )}
        </span>
      </motion.button>
    )
  }
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS INPUT — INPUT CON ESTILO iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassInputProps extends Omit<ComponentPropsWithoutRef<'input'>, 'size'> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  function GlassInput(
    {
      label,
      error,
      hint,
      icon,
      size = 'md',
      className,
      disabled,
      ...props
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false)

    const sizeStyles = {
      sm: 'py-2 px-3 text-sm',
      md: 'py-2.5 px-4 text-sm',
      lg: 'py-3 px-5 text-base',
    }

    return (
      <div className="space-y-1.5">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-white/70">
            {label}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Icon */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              {icon}
            </div>
          )}

          <motion.input
            ref={ref}
            className={cn(
              // Base
              'w-full rounded-xl',
              'bg-white/5 backdrop-blur-sm',
              'border border-white/10',
              'text-white placeholder:text-white/30',
              'transition-all duration-200',

              // Focus
              'focus:outline-none focus:bg-white/8 focus:border-white/20',
              'focus:ring-2 focus:ring-white/10',

              // Size
              sizeStyles[size],
              icon && 'pl-10',

              // Error
              error && 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20',

              // Disabled
              disabled && 'opacity-50 cursor-not-allowed',

              className
            )}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            {...props}
          />

          {/* Focus glow */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: isFocused ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            style={{
              boxShadow: '0 0 20px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          />
        </div>

        {/* Error / Hint */}
        <AnimatePresence>
          {(error || hint) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={cn(
                'text-xs',
                error ? 'text-red-400' : 'text-white/50'
              )}
            >
              {error || hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS SELECT — SELECT CON ESTILO iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassSelectProps extends ComponentPropsWithoutRef<'select'> {
  label?: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export const GlassSelect = forwardRef<HTMLSelectElement, GlassSelectProps>(
  function GlassSelect(
    {
      label,
      error,
      options,
      placeholder,
      className,
      ...props
    },
    ref
  ) {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-white/70">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={cn(
              'w-full py-2.5 px-4 pr-10',
              'rounded-xl appearance-none',
              'bg-white/5 backdrop-blur-sm',
              'border border-white/10',
              'text-white',
              'transition-all duration-200',
              'focus:outline-none focus:bg-white/8 focus:border-white/20',
              'focus:ring-2 focus:ring-white/10',
              error && 'border-red-500/50',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} className="bg-zinc-900">
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS BADGE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassBadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium'
  size?: 'sm' | 'md'
  icon?: ReactNode
  pulse?: boolean
  className?: string
}

export function GlassBadge({
  children,
  variant = 'default',
  size = 'sm',
  icon,
  pulse = false,
  className,
}: GlassBadgeProps) {
  const variantStyles = {
    default: 'bg-white/10 text-white/80 border-white/10',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/15 text-red-400 border-red-500/20',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    premium: 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300 border-violet-500/30',
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5',
        'rounded-full border backdrop-blur-sm',
        'font-medium',
        variantStyles[variant],
        sizeStyles[size],
        pulse && 'animate-pulse',
        className
      )}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS DIVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassDividerProps {
  label?: string
  className?: string
}

export function GlassDivider({ label, className }: GlassDividerProps) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="text-xs text-white/40 font-medium uppercase tracking-wider">{label}</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>
    )
  }

  return (
    <div className={cn('h-px bg-gradient-to-r from-transparent via-white/10 to-transparent', className)} />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS TOOLTIP
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassTooltipProps {
  content: ReactNode
  children: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export function GlassTooltip({
  content,
  children,
  position = 'top',
  className,
}: GlassTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 pointer-events-none',
              'px-3 py-1.5 rounded-lg',
              'bg-black/80 backdrop-blur-xl border border-white/10',
              'text-xs text-white whitespace-nowrap',
              positionStyles[position]
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS SKELETON (LOADING STATE)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassSkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function GlassSkeleton({
  className,
  variant = 'text',
  width,
  height,
}: GlassSkeletonProps) {
  const variantStyles = {
    text: 'h-4 rounded',
    circular: 'rounded-full aspect-square',
    rectangular: 'rounded-xl',
  }

  return (
    <div
      className={cn(
        'bg-white/5 animate-pulse',
        variantStyles[variant],
        className
      )}
      style={{ width, height }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASS PROGRESS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GlassProgressProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  color?: string
  className?: string
}

export function GlassProgress({
  value,
  max = 100,
  size = 'md',
  showLabel = false,
  color = '#8B5CF6',
  className,
}: GlassProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        'w-full bg-white/5 rounded-full overflow-hidden',
        sizeStyles[size]
      )}>
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          style={{
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 10px ${color}50`,
          }}
        />
      </div>

      {showLabel && (
        <p className="mt-1 text-xs text-white/50 text-right">{percentage.toFixed(0)}%</p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { fadeInVariants, scaleVariants }
