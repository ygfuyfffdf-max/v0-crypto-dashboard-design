'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌟 PREMIUM ELEVATED SYSTEM — CHRONOS INFINITY 2026 SUPREME EDITION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de componentes premium elevados que EXTIENDEN los existentes sin romper lógica.
 *
 * FEATURES:
 * ✅ Formularios con labels flotantes y validación visual
 * ✅ Inputs premium con animaciones de enfoque
 * ✅ Botones con micro-interacciones cinematográficas
 * ✅ Cards con efectos parallax 3D
 * ✅ Transiciones entre paneles
 * ✅ Tablas con infinite scroll y sparklines
 * ✅ 100% responsive con breakpoints adaptativos
 *
 * @version 2.0.0 - SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AlertCircle, Check, ChevronDown, Eye, EyeOff, Loader2, Search } from 'lucide-react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import React, {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 DESIGN TOKENS PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PREMIUM_COLORS = {
  violet: {
    primary: '#8B5CF6',
    light: '#A78BFA',
    dark: '#6D28D9',
    glow: 'rgba(139, 92, 246, 0.5)',
    surface: 'rgba(139, 92, 246, 0.1)',
  },
  success: {
    primary: '#10B981',
    light: '#34D399',
    glow: 'rgba(16, 185, 129, 0.5)',
  },
  error: {
    primary: '#EF4444',
    light: '#F87171',
    glow: 'rgba(239, 68, 68, 0.5)',
  },
  warning: {
    primary: '#F59E0B',
    light: '#FBBF24',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
}

const SPRING_CONFIG = { stiffness: 400, damping: 30 }
const SMOOTH_SPRING = { stiffness: 200, damping: 25 }

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📝 PREMIUM FLOATING INPUT — Input con label flotante premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumFloatingInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  error?: string
  success?: boolean
  hint?: string
  icon?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
  showPasswordToggle?: boolean
}

export const PremiumFloatingInput = forwardRef<HTMLInputElement, PremiumFloatingInputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      icon,
      size = 'md',
      variant = 'default',
      className,
      type = 'text',
      showPasswordToggle,
      value,
      onChange,
      onFocus,
      onBlur,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false)
    const [hasValue, setHasValue] = useState(!!value)
    const [showPassword, setShowPassword] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    const isFloating = isFocused || hasValue

    // Animación de la línea de foco
    const lineWidth = useMotionValue(0)
    const springLineWidth = useSpring(lineWidth, SMOOTH_SPRING)

    useEffect(() => {
      lineWidth.set(isFocused ? 100 : 0)
    }, [isFocused, lineWidth])

    // Glow animation
    const glowOpacity = useMotionValue(0)
    const springGlow = useSpring(glowOpacity, SMOOTH_SPRING)

    useEffect(() => {
      glowOpacity.set(isFocused ? 1 : 0)
    }, [isFocused, glowOpacity])

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value)
      onChange?.(e)
    }

    const sizeClasses = {
      sm: 'h-12 text-sm',
      md: 'h-14 text-base',
      lg: 'h-16 text-lg',
    }

    const labelSizeClasses = {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    }

    const inputType =
      showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type

    const borderColor = error
      ? 'border-red-500/50'
      : success
        ? 'border-emerald-500/50'
        : isFocused
          ? 'border-violet-500/50'
          : 'border-white/10'

    const glowColor = error
      ? PREMIUM_COLORS.error.glow
      : success
        ? PREMIUM_COLORS.success.glow
        : PREMIUM_COLORS.violet.glow

    return (
      <div className={cn('relative w-full', className)}>
        {/* Container principal */}
        <div className="relative">
          {/* Glow effect */}
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-xl opacity-0"
            style={{
              background: `radial-gradient(ellipse at center, ${glowColor}, transparent 70%)`,
              opacity: springGlow,
              filter: 'blur(8px)',
            }}
          />

          {/* Input container */}
          <div
            className={cn(
              'relative overflow-hidden rounded-xl border transition-all duration-300',
              'bg-white/[0.03] backdrop-blur-xl',
              'hover:border-white/20 hover:bg-white/[0.05]',
              borderColor,
              sizeClasses[size],
              disabled && 'cursor-not-allowed opacity-50',
            )}
          >
            {/* Icon */}
            {icon && (
              <div className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">{icon}</div>
            )}

            {/* Floating label */}
            <motion.label
              className={cn(
                'pointer-events-none absolute left-4 transition-colors duration-200',
                icon && 'left-12',
                isFloating ? 'text-violet-400' : 'text-gray-500',
                labelSizeClasses[size],
              )}
              initial={false}
              animate={{
                y: isFloating ? -20 : 0,
                scale: isFloating ? 0.85 : 1,
                x: isFloating ? -4 : 0,
              }}
              transition={{ type: 'spring', ...SPRING_CONFIG }}
              style={{ top: '50%', transform: 'translateY(-50%)' }}
            >
              {label}
            </motion.label>

            {/* Input */}
            <input
              ref={ref || inputRef}
              type={inputType}
              value={value}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              disabled={disabled}
              className={cn(
                'h-full w-full bg-transparent text-white',
                'focus:outline-none',
                'placeholder-transparent',
                'pt-4 pb-1',
                icon ? 'pr-4 pl-12' : 'px-4',
                showPasswordToggle && 'pr-12',
              )}
              {...props}
            />

            {/* Password toggle */}
            {showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition-colors hover:text-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            )}

            {/* Success/Error icons */}
            {(success || error) && !showPasswordToggle && (
              <div className="absolute top-1/2 right-4 -translate-y-1/2">
                {success && <Check className="h-5 w-5 text-emerald-400" />}
                {error && <AlertCircle className="h-5 w-5 text-red-400" />}
              </div>
            )}

            {/* Animated focus line */}
            <motion.div
              className="absolute bottom-0 left-1/2 h-[2px] -translate-x-1/2"
              style={{
                width: springLineWidth.get() + '%',
                background: error
                  ? `linear-gradient(90deg, transparent, ${PREMIUM_COLORS.error.primary}, transparent)`
                  : success
                    ? `linear-gradient(90deg, transparent, ${PREMIUM_COLORS.success.primary}, transparent)`
                    : `linear-gradient(90deg, transparent, ${PREMIUM_COLORS.violet.primary}, transparent)`,
              }}
            />
          </div>
        </div>

        {/* Error/Hint message */}
        <AnimatePresence mode="wait">
          {(error || hint) && (
            <motion.p
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              className={cn('mt-2 px-1 text-sm', error ? 'text-red-400' : 'text-gray-500')}
            >
              {error || hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  },
)

PremiumFloatingInput.displayName = 'PremiumFloatingInput'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔽 PREMIUM SELECT — Select con animaciones premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SelectOption {
  value: string
  label: string
  icon?: ReactNode
  disabled?: boolean
}

interface PremiumSelectProps {
  label: string
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  placeholder?: string
  disabled?: boolean
  className?: string
  searchable?: boolean
}

export function PremiumSelect({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = 'Seleccionar...',
  disabled,
  className,
  searchable = false,
}: PremiumSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = searchable
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    switch (e.key) {
      case 'Enter':
        e.preventDefault()
        if (isOpen && filteredOptions[highlightedIndex]) {
          onChange?.(filteredOptions[highlightedIndex].value)
          setIsOpen(false)
        } else {
          setIsOpen(true)
        }
        break
      case 'Escape':
        setIsOpen(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) {
          setIsOpen(true)
        } else {
          setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev))
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev))
        break
    }
  }

  const handleSelect = (optValue: string) => {
    onChange?.(optValue)
    setIsOpen(false)
    setSearchTerm('')
  }

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Label */}
      <motion.label
        className={cn(
          'pointer-events-none absolute left-4 z-10 text-sm transition-colors duration-200',
          isOpen || value ? 'text-violet-400' : 'text-gray-500',
        )}
        initial={false}
        animate={{
          y: isOpen || value ? -28 : 0,
          scale: isOpen || value ? 0.85 : 1,
        }}
        transition={{ type: 'spring', ...SPRING_CONFIG }}
        style={{ top: '50%', transform: 'translateY(-50%)' }}
      >
        {label}
      </motion.label>

      {/* Select trigger */}
      <motion.button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'h-14 w-full rounded-xl border px-4 text-left',
          'bg-white/[0.03] backdrop-blur-xl',
          'transition-all duration-300',
          'hover:border-white/20 hover:bg-white/[0.05]',
          'focus:border-violet-500/50 focus:outline-none',
          error ? 'border-red-500/50' : isOpen ? 'border-violet-500/50' : 'border-white/10',
          disabled && 'cursor-not-allowed opacity-50',
        )}
        whileTap={{ scale: 0.99 }}
      >
        <span className={cn('block truncate pt-3', !value && 'text-gray-500')}>
          {selectedOption?.label || placeholder}
        </span>
        <motion.div
          className="absolute top-1/2 right-4 -translate-y-1/2"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'absolute z-50 mt-2 w-full overflow-hidden rounded-xl',
              'bg-gray-900/95 backdrop-blur-2xl',
              'border border-white/10',
              'shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(139,92,246,0.1)]',
            )}
          >
            {/* Search input */}
            {searchable && (
              <div className="border-b border-white/10 p-2">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value)
                      setHighlightedIndex(0)
                    }}
                    placeholder="Buscar..."
                    className="h-10 w-full rounded-lg bg-white/5 pr-4 pl-9 text-sm text-white focus:bg-white/10 focus:outline-none"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="scrollbar-thin scrollbar-thumb-white/10 max-h-64 overflow-y-auto py-1">
              {filteredOptions.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">No hay opciones</p>
              ) : (
                filteredOptions.map((option, index) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      'flex w-full items-center gap-3 px-4 py-3 text-left',
                      'transition-colors duration-150',
                      option.disabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-violet-500/10',
                      highlightedIndex === index && 'bg-violet-500/10',
                      value === option.value && 'bg-violet-500/20 text-violet-300',
                    )}
                    whileHover={{ x: 4 }}
                  >
                    {option.icon && <span className="text-gray-400">{option.icon}</span>}
                    <span className="text-sm">{option.label}</span>
                    {value === option.value && (
                      <Check className="ml-auto h-4 w-4 text-violet-400" />
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-2 px-1 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ PREMIUM BUTTON — Botón con micro-interacciones cinematográficas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gold'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  className?: string
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

const BUTTON_VARIANTS = {
  primary: {
    bg: 'bg-gradient-to-r from-violet-600 to-indigo-600',
    hover: 'hover:from-violet-500 hover:to-indigo-500',
    shadow: 'shadow-[0_10px_40px_-10px_rgba(139,92,246,0.5)]',
    hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(139,92,246,0.6)]',
    text: 'text-white',
    ripple: 'rgba(255,255,255,0.3)',
  },
  secondary: {
    bg: 'bg-violet-500/10',
    hover: 'hover:bg-violet-500/20',
    shadow: '',
    hoverShadow: 'hover:shadow-[0_10px_40px_-10px_rgba(139,92,246,0.3)]',
    text: 'text-violet-300',
    ripple: 'rgba(139,92,246,0.3)',
  },
  ghost: {
    bg: 'bg-transparent',
    hover: 'hover:bg-white/5',
    shadow: '',
    hoverShadow: '',
    text: 'text-gray-300',
    ripple: 'rgba(255,255,255,0.2)',
  },
  danger: {
    bg: 'bg-gradient-to-r from-red-600 to-pink-600',
    hover: 'hover:from-red-500 hover:to-pink-500',
    shadow: 'shadow-[0_10px_40px_-10px_rgba(239,68,68,0.5)]',
    hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(239,68,68,0.6)]',
    text: 'text-white',
    ripple: 'rgba(255,255,255,0.3)',
  },
  success: {
    bg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
    hover: 'hover:from-emerald-500 hover:to-teal-500',
    shadow: 'shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)]',
    hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(16,185,129,0.6)]',
    text: 'text-white',
    ripple: 'rgba(255,255,255,0.3)',
  },
  gold: {
    bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
    hover: 'hover:from-amber-400 hover:to-orange-400',
    shadow: 'shadow-[0_10px_40px_-10px_rgba(245,158,11,0.5)]',
    hoverShadow: 'hover:shadow-[0_20px_60px_-15px_rgba(245,158,11,0.6)]',
    text: 'text-white',
    ripple: 'rgba(255,255,255,0.3)',
  },
}

const BUTTON_SIZES = {
  sm: 'h-9 px-4 text-sm gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  xl: 'h-14 px-8 text-lg gap-3',
}

interface ButtonRipple {
  id: number
  x: number
  y: number
}

export const PremiumButton = forwardRef<HTMLButtonElement, PremiumButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon,
      iconPosition = 'left',
      loading,
      disabled,
      fullWidth,
      className,
      onClick,
      type = 'button',
    },
    ref,
  ) => {
    const [ripples, setRipples] = useState<ButtonRipple[]>([])
    const [isHovered, setIsHovered] = useState(false)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const variantStyles = BUTTON_VARIANTS[variant]

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return

      const rect = buttonRef.current?.getBoundingClientRect()
      if (rect) {
        const ripple: ButtonRipple = {
          id: Date.now(),
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        }
        setRipples((prev) => [...prev, ripple])
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
        }, 600)
      }

      onClick?.()
    }

    return (
      <motion.button
        ref={ref || buttonRef}
        type={type}
        disabled={disabled || loading}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'relative overflow-hidden rounded-xl font-medium',
          'flex items-center justify-center',
          'transition-all duration-300',
          'focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-transparent focus:outline-none',
          variantStyles.bg,
          variantStyles.hover,
          variantStyles.shadow,
          variantStyles.hoverShadow,
          variantStyles.text,
          BUTTON_SIZES[size],
          fullWidth && 'w-full',
          (disabled || loading) && 'cursor-not-allowed opacity-50',
          className,
        )}
        whileHover={{ scale: disabled || loading ? 1 : 1.02, y: disabled || loading ? 0 : -2 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      >
        {/* Shine sweep effect */}
        <motion.div
          className="absolute inset-0 -translate-x-full"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
          }}
          animate={isHovered ? { translateX: '200%' } : { translateX: '-100%' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
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
                width: 300,
                height: 300,
                x: ripple.x - 150,
                y: ripple.y - 150,
                opacity: 0,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{
                background: `radial-gradient(circle, ${variantStyles.ripple} 0%, transparent 70%)`,
              }}
            />
          ))}
        </AnimatePresence>

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {icon && iconPosition === 'left' && (
                <motion.span
                  animate={isHovered ? { x: -2 } : { x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {icon}
                </motion.span>
              )}
              {children}
              {icon && iconPosition === 'right' && (
                <motion.span
                  animate={isHovered ? { x: 2 } : { x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {icon}
                </motion.span>
              )}
            </>
          )}
        </span>
      </motion.button>
    )
  },
)

PremiumButton.displayName = 'PremiumButton'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎴 PREMIUM CARD — Card con parallax 3D y efectos premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'glass' | 'gradient'
  enableTilt?: boolean
  enableGlow?: boolean
  glowColor?: 'violet' | 'cyan' | 'pink' | 'gold' | 'emerald'
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const CARD_GLOW_COLORS = {
  violet: 'rgba(139, 92, 246, 0.3)',
  cyan: 'rgba(6, 182, 212, 0.3)',
  pink: 'rgba(236, 72, 153, 0.3)',
  gold: 'rgba(245, 158, 11, 0.3)',
  emerald: 'rgba(16, 185, 129, 0.3)',
}

const CARD_PADDING = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
}

export function PremiumCard({
  children,
  className,
  variant = 'default',
  enableTilt = true,
  enableGlow = true,
  glowColor = 'violet',
  onClick,
  padding = 'lg',
}: PremiumCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Tilt values
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRotateX = useSpring(rotateX, SPRING_CONFIG)
  const springRotateY = useSpring(rotateY, SPRING_CONFIG)

  // Glare position
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)
  const springGlareX = useSpring(glareX, SMOOTH_SPRING)
  const springGlareY = useSpring(glareY, SMOOTH_SPRING)

  const glareGradient = useTransform(
    [springGlareX, springGlareY],
    ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.12) 0%, transparent 50%)`,
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!enableTilt || !cardRef.current) return

      const rect = cardRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      rotateX.set((y - 0.5) * -8)
      rotateY.set((x - 0.5) * 8)
      glareX.set(x * 100)
      glareY.set(y * 100)
    },
    [enableTilt, rotateX, rotateY, glareX, glareY],
  )

  const handleMouseLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
    glareX.set(50)
    glareY.set(50)
    setIsHovered(false)
  }

  const variantClasses = {
    default: 'bg-white/[0.03] border-white/10',
    elevated: 'bg-white/[0.05] border-white/15 shadow-depth-2',
    glass: 'bg-white/[0.02] border-white/5 backdrop-blur-2xl',
    gradient: 'bg-gradient-to-br from-violet-500/10 via-transparent to-pink-500/10 border-white/10',
  }

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        'relative overflow-hidden rounded-2xl border backdrop-blur-xl',
        'transition-all duration-300',
        variantClasses[variant],
        CARD_PADDING[padding],
        onClick && 'cursor-pointer',
        className,
      )}
      style={{
        rotateX: enableTilt ? springRotateX : 0,
        rotateY: enableTilt ? springRotateY : 0,
        transformPerspective: 1000,
        transformStyle: 'preserve-3d',
        boxShadow:
          isHovered && enableGlow
            ? `0 20px 60px -20px ${CARD_GLOW_COLORS[glowColor]}, 0 0 40px ${CARD_GLOW_COLORS[glowColor]}`
            : '0 10px 40px -15px rgba(0,0,0,0.5)',
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: onClick ? 1.02 : 1 }}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
    >
      {/* Traveling light border */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-[-1px] rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `conic-gradient(from 0deg, transparent, ${CARD_GLOW_COLORS[glowColor]}, transparent 30%)`,
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        </motion.div>
      )}

      {/* Glare effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
        style={{
          background: glareGradient,
          opacity: isHovered ? 1 : 0,
        }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 PREMIUM SPARKLINE — Mini gráfico inline para tablas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  showArea?: boolean
  className?: string
}

export function PremiumSparkline({
  data,
  width = 80,
  height = 24,
  color = '#8B5CF6',
  showArea = true,
  className,
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  })

  const pathD = `M ${points.join(' L ')}`
  const areaD = `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
        <filter id="sparkline-glow">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {showArea && (
        <motion.path
          d={areaD}
          fill={`url(#sparkline-gradient-${color})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#sparkline-glow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* End point dot */}
      <motion.circle
        cx={width}
        cy={height - ((data[data.length - 1] - min) / range) * height}
        r="3"
        fill={color}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6 }}
      />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔄 PREMIUM PAGE TRANSITION — Transición cinematográfica entre páginas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PageTransitionProps {
  children: ReactNode
  className?: string
  variant?: 'fade' | 'slide' | 'scale' | 'blur'
}

const pageVariants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slide: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.02 },
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(10px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(10px)' },
  },
}

export function PremiumPageTransition({
  children,
  className,
  variant = 'slide',
}: PageTransitionProps) {
  const variants = pageVariants[variant]

  return (
    <motion.div
      initial={variants.initial}
      animate={variants.animate}
      exit={variants.exit}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📱 PREMIUM RESPONSIVE CONTAINER — Container adaptativo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
}

const MAX_WIDTH_CLASSES = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
}

export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'xl',
  padding = true,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        MAX_WIDTH_CLASSES[maxWidth],
        padding && 'px-4 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 PREMIUM BADGE — Badge con animaciones
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PremiumBadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'violet'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  className?: string
}

const BADGE_VARIANTS = {
  default: 'bg-white/10 text-white border-white/20',
  success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  danger: 'bg-red-500/15 text-red-400 border-red-500/30',
  info: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  violet: 'bg-violet-500/15 text-violet-400 border-violet-500/30',
}

const BADGE_SIZES = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
}

export function PremiumBadge({
  children,
  variant = 'default',
  size = 'md',
  pulse,
  className,
}: PremiumBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        'transition-all duration-200',
        BADGE_VARIANTS[variant],
        BADGE_SIZES[size],
        className,
      )}
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
              variant === 'violet' && 'bg-violet-400',
              variant === 'default' && 'bg-white',
            )}
          />
          <span
            className={cn(
              'relative inline-flex h-2 w-2 rounded-full',
              variant === 'success' && 'bg-emerald-400',
              variant === 'warning' && 'bg-amber-400',
              variant === 'danger' && 'bg-red-400',
              variant === 'info' && 'bg-blue-400',
              variant === 'violet' && 'bg-violet-400',
              variant === 'default' && 'bg-white',
            )}
          />
        </span>
      )}
      {children}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { PREMIUM_COLORS, SMOOTH_SPRING, SPRING_CONFIG }

