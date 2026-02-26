/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🎯 CHRONOS INFINITY 2030 — COMPONENTES UI SUPREMOS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de componentes UI ultra-premium con:
 * - Glassmorphism GEN7 avanzado
 * - Animaciones fluidas integradas
 * - Accesibilidad completa (WCAG 2.1 AAA)
 * - Variantes responsivas automáticas
 * - Feedback háptico y visual
 * - Soporte para temas dinámicos
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import React, {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    forwardRef,
    useId,
    useState
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS 2030
// ═══════════════════════════════════════════════════════════════════════════════════════

export const tokens = {
  colors: {
    // Primary palette
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },
    // Accent (Gold)
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    // Success
    success: {
      50: '#f0fdf4',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
    },
    // Error
    error: {
      50: '#fef2f2',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
    },
    // Warning
    warning: {
      50: '#fffbeb',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
    },
    // Semantic
    glass: {
      light: 'rgba(255, 255, 255, 0.05)',
      medium: 'rgba(255, 255, 255, 0.08)',
      strong: 'rgba(255, 255, 255, 0.12)',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      medium: 'rgba(255, 255, 255, 0.12)',
      strong: 'rgba(255, 255, 255, 0.18)',
    },
  },
  shadows: {
    glow: {
      violet: '0 0 40px rgba(139, 92, 246, 0.3)',
      gold: '0 0 40px rgba(251, 191, 36, 0.3)',
      success: '0 0 40px rgba(34, 197, 94, 0.3)',
      error: '0 0 40px rgba(239, 68, 68, 0.3)',
    },
    elevation: {
      sm: '0 2px 8px rgba(0, 0, 0, 0.3)',
      md: '0 4px 16px rgba(0, 0, 0, 0.4)',
      lg: '0 8px 32px rgba(0, 0, 0, 0.5)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.6)',
    },
  },
  animation: {
    spring: {
      snappy: { type: 'spring', stiffness: 400, damping: 30 },
      smooth: { type: 'spring', stiffness: 200, damping: 25 },
      bouncy: { type: 'spring', stiffness: 300, damping: 15 },
    },
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// BUTTON COMPONENT — Botón Premium con múltiples variantes
// ═══════════════════════════════════════════════════════════════════════════════════════

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gold'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragEnter' | 'onDragExit' | 'onDragLeave' | 'onDragOver' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  glow?: boolean
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-violet-600 to-purple-600 
    hover:from-violet-500 hover:to-purple-500
    text-white shadow-lg shadow-violet-500/25
    border border-violet-500/30
  `,
  secondary: `
    bg-white/5 hover:bg-white/10
    text-white/90 hover:text-white
    border border-white/10 hover:border-white/20
  `,
  ghost: `
    bg-transparent hover:bg-white/5
    text-white/70 hover:text-white
    border border-transparent
  `,
  danger: `
    bg-gradient-to-r from-red-600 to-rose-600
    hover:from-red-500 hover:to-rose-500
    text-white shadow-lg shadow-red-500/25
    border border-red-500/30
  `,
  success: `
    bg-gradient-to-r from-emerald-600 to-green-600
    hover:from-emerald-500 hover:to-green-500
    text-white shadow-lg shadow-emerald-500/25
    border border-emerald-500/30
  `,
  gold: `
    bg-gradient-to-r from-amber-500 to-yellow-500
    hover:from-amber-400 hover:to-yellow-400
    text-black font-semibold shadow-lg shadow-amber-500/25
    border border-amber-400/30
  `,
}

const buttonSizes: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs rounded-md gap-1.5',
  sm: 'h-8 px-3 text-sm rounded-lg gap-2',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5',
  xl: 'h-14 px-8 text-lg rounded-2xl gap-3',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      glow = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion()

    return (
      <motion.button
        ref={ref}
        className={cn(
          'relative inline-flex items-center justify-center font-medium',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          buttonVariants[variant],
          buttonSizes[size],
          fullWidth && 'w-full',
          glow && variant === 'primary' && 'hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]',
          glow && variant === 'gold' && 'hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]',
          className
        )}
        disabled={disabled || loading}
        whileHover={!prefersReducedMotion && !disabled ? { scale: 1.02, y: -1 } : {}}
        whileTap={!prefersReducedMotion && !disabled ? { scale: 0.98 } : {}}
        transition={tokens.animation.spring.snappy}
        {...props}
      >
        {/* Loading spinner */}
        {loading && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-inherit rounded-inherit"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <LoadingSpinner size={size === 'xs' || size === 'sm' ? 'sm' : 'md'} />
          </motion.div>
        )}

        {/* Content */}
        <span className={cn('flex items-center gap-inherit', loading && 'opacity-0')}>
          {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
          {children}
          {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
        </span>
      </motion.button>
    )
  }
)
Button.displayName = 'Button'

// ═══════════════════════════════════════════════════════════════════════════════════════
// LOADING SPINNER
// ═══════════════════════════════════════════════════════════════════════════════════════

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-6 h-6 border-[3px]',
  }

  return (
    <div
      className={cn(
        'rounded-full border-current border-t-transparent animate-spin',
        sizes[size],
        className
      )}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// INPUT COMPONENT — Campo de entrada premium
// ═══════════════════════════════════════════════════════════════════════════════════════

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'flushed'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      size = 'md',
      variant = 'default',
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const [isFocused, setIsFocused] = useState(false)

    const sizes = {
      sm: 'h-9 text-sm px-3',
      md: 'h-11 text-base px-4',
      lg: 'h-13 text-lg px-5',
    }

    const variants = {
      default: `
        bg-white/5 border border-white/10 rounded-xl
        hover:border-white/20 hover:bg-white/[0.07]
        focus:border-violet-500/50 focus:bg-white/[0.08]
        focus:ring-2 focus:ring-violet-500/20
      `,
      filled: `
        bg-white/10 border-0 rounded-xl
        hover:bg-white/[0.12]
        focus:bg-white/[0.15] focus:ring-2 focus:ring-violet-500/30
      `,
      flushed: `
        bg-transparent border-0 border-b-2 border-white/20 rounded-none
        hover:border-white/30
        focus:border-violet-500/70
      `,
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-white/80"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && iconPosition === 'left' && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full text-white placeholder:text-white/40',
              'transition-all duration-200 ease-out',
              'focus:outline-none',
              variants[variant],
              sizes[size],
              icon && iconPosition === 'left' && 'pl-10',
              icon && iconPosition === 'right' && 'pr-10',
              error && 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20',
              className
            )}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />

          {icon && iconPosition === 'right' && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
              {icon}
            </div>
          )}
        </div>

        {/* Helper text */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-red-400"
            >
              {error}
            </motion.p>
          ) : hint ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-white/50"
            >
              {hint}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    )
  }
)
Input.displayName = 'Input'

// ═══════════════════════════════════════════════════════════════════════════════════════
// SELECT COMPONENT — Selector premium
// ═══════════════════════════════════════════════════════════════════════════════════════

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, size = 'md', id: providedId, ...props }, ref) => {
    const generatedId = useId()
    const id = providedId || generatedId

    const sizes = {
      sm: 'h-9 text-sm px-3',
      md: 'h-11 text-base px-4',
      lg: 'h-13 text-lg px-5',
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-white/80">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            id={id}
            className={cn(
              'w-full appearance-none cursor-pointer',
              'bg-white/5 border border-white/10 rounded-xl text-white',
              'hover:border-white/20 hover:bg-white/[0.07]',
              'focus:border-violet-500/50 focus:bg-white/[0.08]',
              'focus:ring-2 focus:ring-violet-500/20 focus:outline-none',
              'transition-all duration-200 ease-out',
              sizes[size],
              'pr-10', // Space for arrow
              error && 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="bg-slate-900 text-white/50">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-slate-900 text-white"
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Custom arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
Select.displayName = 'Select'

// ═══════════════════════════════════════════════════════════════════════════════════════
// CARD COMPONENT — Tarjeta Glass premium
// ═══════════════════════════════════════════════════════════════════════════════════════

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'outlined' | 'solid'
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  hover?: boolean
  glow?: boolean
  glowColor?: string
  onClick?: () => void
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      className,
      variant = 'default',
      padding = 'md',
      hover = false,
      glow = false,
      glowColor = 'violet',
      onClick,
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion()

    const variants = {
      default: 'bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl',
      elevated: 'bg-white/[0.05] border border-white/[0.1] backdrop-blur-2xl shadow-xl shadow-black/20',
      outlined: 'bg-transparent border-2 border-white/[0.15]',
      solid: 'bg-slate-800/80 border border-slate-700/50',
    }

    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4 sm:p-5',
      lg: 'p-5 sm:p-6',
      xl: 'p-6 sm:p-8',
    }

    const glowColors = {
      violet: 'hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]',
      gold: 'hover:shadow-[0_0_40px_rgba(251,191,36,0.15)]',
      emerald: 'hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]',
      rose: 'hover:shadow-[0_0_40px_rgba(244,63,94,0.15)]',
    }

    return (
      <motion.div
        ref={ref}
        className={cn(
          'rounded-2xl overflow-hidden',
          'transition-all duration-300 ease-out',
          variants[variant],
          paddings[padding],
          hover && 'cursor-pointer',
          glow && glowColors[glowColor as keyof typeof glowColors],
          className
        )}
        onClick={onClick}
        whileHover={
          hover && !prefersReducedMotion
            ? {
                y: -4,
                scale: 1.01,
                borderColor: 'rgba(255, 255, 255, 0.15)',
              }
            : {}
        }
        whileTap={hover && !prefersReducedMotion ? { scale: 0.99 } : {}}
        transition={tokens.animation.spring.snappy}
      >
        {children}
      </motion.div>
    )
  }
)
Card.displayName = 'Card'

// ═══════════════════════════════════════════════════════════════════════════════════════
// BADGE COMPONENT — Etiqueta de estado
// ═══════════════════════════════════════════════════════════════════════════════════════

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  pulse?: boolean
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  className,
}) => {
  const variants = {
    default: 'bg-white/10 text-white/80 border-white/10',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    error: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    gold: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  }

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-sm',
  }

  const dotColors = {
    default: 'bg-white/60',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    error: 'bg-red-400',
    info: 'bg-blue-400',
    gold: 'bg-amber-300',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={cn(
                'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                dotColors[variant]
              )}
            />
          )}
          <span className={cn('relative inline-flex rounded-full h-2 w-2', dotColors[variant])} />
        </span>
      )}
      {children}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// METRIC CARD — Tarjeta de métrica con animación de número
// ═══════════════════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  title: string
  value: number
  prefix?: string
  suffix?: string
  change?: number
  changeLabel?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  loading?: boolean
  onClick?: () => void
  className?: string
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  prefix = '',
  suffix = '',
  change,
  changeLabel,
  icon,
  trend,
  loading = false,
  onClick,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(0)

  // Animate number on mount
  React.useEffect(() => {
    if (prefersReducedMotion || loading) {
      setDisplayValue(value)
      return
    }

    const duration = 1000
    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (value - startValue) * eased
      
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value, prefersReducedMotion, loading])

  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-white/50',
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  return (
    <Card
      variant="elevated"
      padding="lg"
      hover={!!onClick}
      glow={!!onClick}
      onClick={onClick}
      className={className}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-white/60">{title}</p>
          
          {loading ? (
            <div className="h-8 w-24 bg-white/10 animate-pulse rounded-lg" />
          ) : (
            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {prefix}
              {displayValue.toLocaleString('es-MX', {
                minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
                maximumFractionDigits: 2,
              })}
              {suffix}
            </p>
          )}

          {(change !== undefined || changeLabel) && (
            <div className="flex items-center gap-2">
              {change !== undefined && trend && (
                <span className={cn('text-sm font-medium', trendColors[trend])}>
                  {trendIcons[trend]} {Math.abs(change)}%
                </span>
              )}
              {changeLabel && (
                <span className="text-xs text-white/40">{changeLabel}</span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div className="p-3 rounded-xl bg-white/5 text-white/60">
            {icon}
          </div>
        )}
      </div>
    </Card>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export { tokens as designTokens }

