/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🍎 CHRONOS 2026 — iOS CLEAN DESIGN SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de diseño definitivo inspirado en iOS 18+ / visionOS 2.0:
 *
 * ✅ SIN EFECTOS 3D inmersivos problemáticos (eliminado tilt con cursor)
 * ✅ Glassmorphism Gen6 ultra limpio y elegante
 * ✅ Scroll avanzado con momentum physics para forms/modals
 * ✅ Micro-interacciones sutiles tipo Apple
 * ✅ Diseño minimalista premium
 * ✅ Optimizado para mobile y desktop
 * ✅ Haptic feedback visual sutil
 * ✅ Navegación fluida y natural
 * ✅ Reducción de complejidad visual
 * ✅ Focus en UX y usabilidad
 *
 * @version 4.0.0 - Clean Edition (Sin efectos problemáticos)
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, PanInfo, useMotionValue, useSpring, useTransform } from 'motion/react'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Loader2,
  LucideIcon,
  MoreHorizontal,
  Search,
  X,
  ArrowUp,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import {
  createContext,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useMemo,
} from 'react'
import { createPortal } from 'react-dom'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 DESIGN TOKENS iOS 18+ Clean Edition
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const CleanDesignTokens = {
  colors: {
    // Backgrounds - Más profundos y elegantes
    bgPrimary: 'rgba(0, 0, 0, 0.92)',
    bgSecondary: 'rgba(18, 18, 20, 0.95)',
    bgTertiary: 'rgba(28, 28, 32, 0.9)',
    bgElevated: 'rgba(38, 38, 42, 0.85)',
    bgSheet: 'rgba(22, 22, 24, 0.98)',

    // Glass Gen6 - Ultra limpio
    glassBg: 'rgba(255, 255, 255, 0.04)',
    glassHover: 'rgba(255, 255, 255, 0.08)',
    glassActive: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassBorderHover: 'rgba(255, 255, 255, 0.14)',
    glassBorderFocus: 'rgba(139, 92, 246, 0.4)',

    // Text Hierarchy - WCAG AAA
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.75)',
    textTertiary: 'rgba(255, 255, 255, 0.55)',
    textMuted: 'rgba(255, 255, 255, 0.35)',
    textDisabled: 'rgba(255, 255, 255, 0.2)',

    // Accents - Apple Style
    accent: '#8B5CF6',
    accentHover: '#7C3AED',
    accentLight: 'rgba(139, 92, 246, 0.15)',
    accentMuted: 'rgba(139, 92, 246, 0.08)',

    // Semantic
    success: '#34C759',
    successMuted: 'rgba(52, 199, 89, 0.12)',
    warning: '#FF9F0A',
    warningMuted: 'rgba(255, 159, 10, 0.12)',
    danger: '#FF3B30',
    dangerMuted: 'rgba(255, 59, 48, 0.12)',
    info: '#0A84FF',
    infoMuted: 'rgba(10, 132, 255, 0.12)',
  },

  blur: {
    none: '',
    sm: 'backdrop-blur-[8px]',
    md: 'backdrop-blur-[16px]',
    lg: 'backdrop-blur-[24px]',
    xl: 'backdrop-blur-[32px]',
    '2xl': 'backdrop-blur-[48px]',
  },

  radius: {
    none: 'rounded-none',
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  },

  shadows: {
    none: 'shadow-none',
    sm: '0 2px 8px rgba(0,0,0,0.12)',
    md: '0 4px 16px rgba(0,0,0,0.18)',
    lg: '0 8px 32px rgba(0,0,0,0.22)',
    xl: '0 16px 48px rgba(0,0,0,0.28)',
    inner: 'inset 0 1px 2px rgba(255,255,255,0.04)',
    glow: '0 0 20px rgba(139, 92, 246, 0.15)',
  },

  // Animaciones suaves, sin tilt/3D problemático
  transitions: {
    instant: { duration: 0.1, ease: [0.25, 0.1, 0.25, 1] },
    fast: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
    normal: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
    slow: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    spring: { type: 'spring' as const, stiffness: 400, damping: 30 },
    springGentle: { type: 'spring' as const, stiffness: 300, damping: 35 },
    springBouncy: { type: 'spring' as const, stiffness: 500, damping: 25 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📱 CLEAN CONTEXT PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CleanContextType {
  isMobile: boolean
  isTablet: boolean
  reducedMotion: boolean
  hapticEnabled: boolean
  accentColor: string
  blurIntensity: 'low' | 'medium' | 'high'
  theme: 'dark' | 'light'
}

const CleanContext = createContext<CleanContextType>({
  isMobile: false,
  isTablet: false,
  reducedMotion: false,
  hapticEnabled: true,
  accentColor: CleanDesignTokens.colors.accent,
  blurIntensity: 'high',
  theme: 'dark',
})

export const useCleanDesign = () => useContext(CleanContext)

export const CleanDesignProvider = memo(function CleanDesignProvider({
  children,
  accentColor = CleanDesignTokens.colors.accent,
  blurIntensity = 'high',
  theme = 'dark',
}: {
  children: ReactNode
  accentColor?: string
  blurIntensity?: 'low' | 'medium' | 'high'
  theme?: 'dark' | 'light'
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024)
    }
    const checkMotion = () => {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    }

    checkDevice()
    checkMotion()

    window.addEventListener('resize', checkDevice)
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', checkMotion)

    return () => {
      window.removeEventListener('resize', checkDevice)
      mediaQuery.removeEventListener('change', checkMotion)
    }
  }, [])

  const value = useMemo(() => ({
    isMobile,
    isTablet,
    reducedMotion,
    hapticEnabled: true,
    accentColor,
    blurIntensity,
    theme,
  }), [isMobile, isTablet, reducedMotion, accentColor, blurIntensity, theme])

  return (
    <CleanContext.Provider value={value}>
      {children}
    </CleanContext.Provider>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🪟 CLEAN GLASS CARD — Ultra limpio, SIN efectos 3D/tilt
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CleanGlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'glass' | 'solid' | 'outlined' | 'elevated' | 'inset' | 'sheet'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  interactive?: boolean
  selected?: boolean
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  onLongPress?: () => void
  glowOnHover?: boolean
  glowColor?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
  xl: 'p-6',
}

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export const CleanGlassCard = memo(forwardRef<HTMLDivElement, CleanGlassCardProps>(
  function CleanGlassCard(
    {
      children,
      className,
      variant = 'glass',
      size = 'md',
      interactive = false,
      selected = false,
      disabled = false,
      loading = false,
      onClick,
      onLongPress,
      glowOnHover = false,
      glowColor,
      padding,
    },
    ref
  ) {
    const { reducedMotion, accentColor, isMobile } = useCleanDesign()
    const [isPressed, setIsPressed] = useState(false)
    const longPressTimer = useRef<NodeJS.Timeout | null>(null)

    const isInteractive = interactive || !!onClick

    const handlePointerDown = useCallback(() => {
      if (!isInteractive || disabled) return
      setIsPressed(true)

      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          onLongPress()
          setIsPressed(false)
        }, 500)
      }
    }, [isInteractive, disabled, onLongPress])

    const handlePointerUp = useCallback(() => {
      setIsPressed(false)
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }, [])

    const handleClick = useCallback(() => {
      if (disabled || loading) return
      onClick?.()
    }, [disabled, loading, onClick])

    // Variantes de estilo
    const variantStyles = useMemo(() => ({
      glass: cn(
        'bg-white/[0.04] backdrop-blur-xl',
        'border border-white/[0.08]',
        isInteractive && !disabled && 'hover:bg-white/[0.07] hover:border-white/[0.12]',
        selected && 'border-violet-500/40 bg-violet-500/[0.08]'
      ),
      solid: cn(
        'bg-[#1C1C1E]',
        'border border-white/[0.06]',
        isInteractive && !disabled && 'hover:bg-[#2C2C2E]',
        selected && 'border-violet-500/40 bg-violet-500/10'
      ),
      outlined: cn(
        'bg-transparent',
        'border border-white/[0.12]',
        isInteractive && !disabled && 'hover:bg-white/[0.04] hover:border-white/[0.18]',
        selected && 'border-violet-500/50'
      ),
      elevated: cn(
        'bg-[#2C2C2E]/90 backdrop-blur-xl',
        'border border-white/[0.1]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.25)]',
        isInteractive && !disabled && 'hover:bg-[#3C3C3E]/90 hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]',
        selected && 'border-violet-500/40'
      ),
      inset: cn(
        'bg-black/30',
        'border border-white/[0.04]',
        'shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]',
        isInteractive && !disabled && 'hover:bg-black/25',
        selected && 'border-violet-500/30'
      ),
      sheet: cn(
        'bg-[#1C1C1E]/98 backdrop-blur-2xl',
        'border border-white/[0.08]',
        'shadow-[0_-4px_32px_rgba(0,0,0,0.4)]'
      ),
    }), [isInteractive, disabled, selected])

    // Animación de hover/press suave (SIN 3D/tilt)
    const hoverAnimation = useMemo(() => {
      if (reducedMotion || !isInteractive || disabled) return {}
      return {
        scale: isPressed ? 0.98 : 1,
        y: isPressed ? 1 : 0,
      }
    }, [reducedMotion, isInteractive, disabled, isPressed])

    const glowStyle = useMemo(() => {
      if (!glowOnHover) return {}
      const color = glowColor || accentColor
      return {
        boxShadow: `0 0 30px ${color}20, 0 0 60px ${color}10`,
      }
    }, [glowOnHover, glowColor, accentColor])

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl',
          'transition-colors duration-200',
          padding ? paddingClasses[padding] : sizeClasses[size],
          variantStyles[variant],
          isInteractive && !disabled && 'cursor-pointer',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        animate={hoverAnimation}
        whileHover={glowOnHover && !disabled ? glowStyle : undefined}
        transition={CleanDesignTokens.transitions.spring}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        role={isInteractive ? 'button' : undefined}
        tabIndex={isInteractive && !disabled ? 0 : undefined}
        aria-disabled={disabled}
      >
        {/* Shimmer line superior */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>

        {/* Loading overlay */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-2xl z-20"
            >
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 CLEAN METRIC CARD — Para KPIs sin efectos tediosos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CleanMetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  description?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  icon?: LucideIcon
  iconColor?: string
  footer?: ReactNode
  action?: ReactNode
  onClick?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'featured' | 'minimal'
  loading?: boolean
}

export const CleanMetricCard = memo(function CleanMetricCard({
  title,
  value,
  subtitle,
  description,
  trend,
  icon: Icon,
  iconColor = '#8B5CF6',
  footer,
  action,
  onClick,
  className,
  variant = 'default',
  loading = false,
}: CleanMetricCardProps) {
  const { reducedMotion } = useCleanDesign()

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : trend?.direction === 'down' ? TrendingDown : Minus
  const trendColors = {
    up: { text: 'text-emerald-400', bg: 'bg-emerald-500/12' },
    down: { text: 'text-red-400', bg: 'bg-red-500/12' },
    neutral: { text: 'text-white/40', bg: 'bg-white/8' },
  }
  const trendStyle = trend ? trendColors[trend.direction] : null

  if (loading) {
    return (
      <CleanGlassCard className={cn('animate-pulse', className)}>
        <div className="space-y-3">
          <div className="h-4 w-24 bg-white/10 rounded" />
          <div className="h-8 w-32 bg-white/10 rounded" />
          <div className="h-3 w-20 bg-white/5 rounded" />
        </div>
      </CleanGlassCard>
    )
  }

  // Minimal variant
  if (variant === 'minimal') {
    return (
      <motion.div
        className={cn(
          'flex items-center justify-between py-3 px-4',
          'border-b border-white/[0.06] last:border-b-0',
          onClick && 'cursor-pointer hover:bg-white/[0.03] transition-colors',
          className
        )}
        onClick={onClick}
        whileTap={onClick && !reducedMotion ? { scale: 0.99 } : undefined}
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${iconColor}15` }}
            >
              <Icon size={16} style={{ color: iconColor }} />
            </div>
          )}
          <div>
            <p className="text-sm text-white/60">{title}</p>
            <p className="text-lg font-semibold text-white">{value}</p>
          </div>
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1 text-sm', trendStyle?.text)}>
            <TrendIcon size={14} />
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
        {onClick && <ChevronRight size={18} className="text-white/30" />}
      </motion.div>
    )
  }

  // Compact variant
  if (variant === 'compact') {
    return (
      <CleanGlassCard
        className={cn('!p-3', className)}
        onClick={onClick}
        interactive={!!onClick}
        size="sm"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${iconColor}12` }}
            >
              <Icon size={18} style={{ color: iconColor }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white/50 truncate">{title}</p>
            <p className="text-base font-semibold text-white truncate">{value}</p>
          </div>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              trendStyle?.text, trendStyle?.bg
            )}>
              <TrendIcon size={12} />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </CleanGlassCard>
    )
  }

  // Featured variant
  if (variant === 'featured') {
    return (
      <CleanGlassCard
        className={className}
        onClick={onClick}
        interactive={!!onClick}
        variant="elevated"
        size="lg"
        glowOnHover
        glowColor={iconColor}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            {Icon && (
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  backgroundColor: `${iconColor}12`,
                  boxShadow: `0 4px 20px ${iconColor}20`
                }}
              >
                <Icon size={26} style={{ color: iconColor }} />
              </div>
            )}
            {trend && (
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
                trendStyle?.text, trendStyle?.bg
              )}>
                <TrendIcon size={14} />
                <span>{Math.abs(trend.value)}%</span>
                {trend.label && <span className="text-white/40 ml-1">{trend.label}</span>}
              </div>
            )}
          </div>

          {/* Value */}
          <div>
            <motion.p
              className="text-4xl font-bold text-white tracking-tight"
              initial={!reducedMotion ? { opacity: 0, y: 10 } : undefined}
              animate={{ opacity: 1, y: 0 }}
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className="text-base text-white/40 mt-1">{subtitle}</p>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <p className="text-sm font-medium text-white/70">{title}</p>
            {description && (
              <p className="text-xs text-white/40 mt-1">{description}</p>
            )}
          </div>

          {/* Footer / Action */}
          {(footer || action) && (
            <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
              {footer}
              {action}
            </div>
          )}
        </div>
      </CleanGlassCard>
    )
  }

  // Default variant
  return (
    <CleanGlassCard
      className={className}
      onClick={onClick}
      interactive={!!onClick}
    >
      <div className="space-y-3">
        {/* Header con icon y trend */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {Icon && (
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${iconColor}12` }}
              >
                <Icon size={20} style={{ color: iconColor }} />
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-white/60">{title}</p>
              {subtitle && (
                <p className="text-xs text-white/35">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
              trendStyle?.text, trendStyle?.bg
            )}>
              <TrendIcon size={12} />
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        {/* Value */}
        <p className="text-2xl font-bold text-white">{value}</p>

        {/* Footer */}
        {footer && (
          <div className="pt-3 border-t border-white/[0.05]">
            {footer}
          </div>
        )}
      </div>
    </CleanGlassCard>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔘 CLEAN BUTTON — Botones estilo iOS sin efectos complejos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CleanButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const buttonSizes = {
  xs: 'h-7 px-2.5 text-xs gap-1.5',
  sm: 'h-9 px-3.5 text-sm gap-2',
  md: 'h-11 px-4.5 text-sm gap-2',
  lg: 'h-13 px-6 text-base gap-2.5',
}

const buttonVariants = {
  primary: cn(
    'bg-violet-500 text-white',
    'hover:bg-violet-600 active:bg-violet-700',
    'shadow-[0_2px_12px_rgba(139,92,246,0.25)]',
    'hover:shadow-[0_4px_16px_rgba(139,92,246,0.35)]'
  ),
  secondary: cn(
    'bg-white/8 text-white',
    'hover:bg-white/12 active:bg-white/6',
    'border border-white/10'
  ),
  ghost: cn(
    'bg-transparent text-white/70',
    'hover:bg-white/8 hover:text-white active:bg-white/5'
  ),
  danger: cn(
    'bg-red-500/15 text-red-400',
    'hover:bg-red-500/25 active:bg-red-500/10',
    'border border-red-500/20'
  ),
  success: cn(
    'bg-emerald-500/15 text-emerald-400',
    'hover:bg-emerald-500/25 active:bg-emerald-500/10',
    'border border-emerald-500/20'
  ),
  outline: cn(
    'bg-transparent text-white',
    'border border-white/20',
    'hover:bg-white/5 hover:border-white/30 active:bg-white/3'
  ),
}

export const CleanButton = memo(forwardRef<HTMLButtonElement, CleanButtonProps>(
  function CleanButton(
    {
      children,
      onClick,
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      loading = false,
      disabled = false,
      fullWidth = false,
      className,
      type = 'button',
    },
    ref
  ) {
    const { reducedMotion } = useCleanDesign()

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center',
          'font-medium rounded-xl',
          'transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-transparent',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          buttonSizes[size],
          buttonVariants[variant],
          fullWidth && 'w-full',
          className
        )}
        whileHover={!reducedMotion && !disabled ? { scale: 1.005 } : undefined}
        whileTap={!reducedMotion && !disabled ? { scale: 0.98 } : undefined}
        transition={CleanDesignTokens.transitions.spring}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
            <span>{children}</span>
            {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
          </>
        )}
      </motion.button>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📜 CLEAN SCROLL CONTAINER — Scroll avanzado para forms/modals
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CleanScrollContainerProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  maxHeight?: string | number
  showFadeEdges?: boolean
  showScrollbar?: boolean
  showScrollToTop?: boolean
  scrollToTopThreshold?: number
  enablePullToRefresh?: boolean
  onRefresh?: () => Promise<void>
  onScroll?: (scrollTop: number, progress: number) => void
  onReachBottom?: () => void
  fadeColor?: string
}

export const CleanScrollContainer = memo(forwardRef<HTMLDivElement, CleanScrollContainerProps>(
  function CleanScrollContainer(
    {
      children,
      className,
      contentClassName,
      maxHeight = '100%',
      showFadeEdges = true,
      showScrollbar = false,
      showScrollToTop = true,
      scrollToTopThreshold = 200,
      enablePullToRefresh = false,
      onRefresh,
      onScroll,
      onReachBottom,
      fadeColor = 'rgba(0,0,0,0.95)',
    },
    ref
  ) {
    const internalRef = useRef<HTMLDivElement>(null)
    const scrollRef = (ref as React.RefObject<HTMLDivElement>) || internalRef

    const [scrollState, setScrollState] = useState({
      isAtTop: true,
      isAtBottom: false,
      showTopButton: false,
      progress: 0,
    })
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)

    const touchStartY = useRef(0)
    const isPulling = useRef(false)
    const reachBottomTriggered = useRef(false)

    const handleScroll = useCallback(() => {
      const container = scrollRef.current
      if (!container) return

      const { scrollTop, scrollHeight, clientHeight } = container
      const maxScroll = scrollHeight - clientHeight
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0

      const isAtTop = scrollTop <= 5
      const isAtBottom = scrollTop >= maxScroll - 5

      setScrollState({
        isAtTop,
        isAtBottom,
        showTopButton: scrollTop > scrollToTopThreshold,
        progress,
      })

      onScroll?.(scrollTop, progress)

      // Reach bottom detection
      if (onReachBottom && isAtBottom && !reachBottomTriggered.current) {
        reachBottomTriggered.current = true
        onReachBottom()
      } else if (!isAtBottom) {
        reachBottomTriggered.current = false
      }
    }, [scrollRef, scrollToTopThreshold, onScroll, onReachBottom])

    // Pull to refresh
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      if (!enablePullToRefresh || !scrollState.isAtTop) return
      touchStartY.current = e.touches[0].clientY
      isPulling.current = true
    }, [enablePullToRefresh, scrollState.isAtTop])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!isPulling.current || isRefreshing) return

      const touchY = e.touches[0].clientY
      const distance = Math.max(0, (touchY - touchStartY.current) * 0.4)

      if (distance > 0 && scrollState.isAtTop) {
        setPullDistance(Math.min(distance, 100))
      }
    }, [isRefreshing, scrollState.isAtTop])

    const handleTouchEnd = useCallback(async () => {
      if (!isPulling.current) return
      isPulling.current = false

      if (pullDistance >= 60 && onRefresh && !isRefreshing) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }
      setPullDistance(0)
    }, [pullDistance, onRefresh, isRefreshing])

    const scrollToTop = useCallback(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }, [scrollRef])

    useEffect(() => {
      const container = scrollRef.current
      if (!container) return

      container.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll() // Initial check

      return () => container.removeEventListener('scroll', handleScroll)
    }, [scrollRef, handleScroll])

    return (
      <div className={cn('relative', className)} style={{ maxHeight }}>
        {/* Pull to refresh indicator */}
        <AnimatePresence>
          {pullDistance > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: pullDistance }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute top-0 inset-x-0 z-20 flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: fadeColor }}
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : pullDistance * 3 }}
                transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : undefined}
              >
                {isRefreshing ? (
                  <Loader2 className="w-5 h-5 text-violet-400" />
                ) : (
                  <RefreshCw
                    className={cn(
                      'w-5 h-5 transition-colors',
                      pullDistance >= 60 ? 'text-violet-400' : 'text-white/40'
                    )}
                  />
                )}
              </motion.div>
              {pullDistance >= 60 && !isRefreshing && (
                <span className="ml-2 text-xs text-violet-400">Suelta para actualizar</span>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top fade edge */}
        {showFadeEdges && !scrollState.isAtTop && (
          <div
            className="absolute top-0 inset-x-0 h-12 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to bottom, ${fadeColor}, transparent)`,
            }}
          />
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className={cn(
            'overflow-y-auto overflow-x-hidden h-full',
            !showScrollbar && 'scrollbar-hide',
            showScrollbar && 'scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent',
            contentClassName
          )}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
          }}
        >
          <motion.div
            animate={{ y: pullDistance > 0 ? pullDistance : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Bottom fade edge */}
        {showFadeEdges && !scrollState.isAtBottom && (
          <div
            className="absolute bottom-0 inset-x-0 h-12 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to top, ${fadeColor}, transparent)`,
            }}
          />
        )}

        {/* Scroll to top button */}
        <AnimatePresence>
          {showScrollToTop && scrollState.showTopButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              onClick={scrollToTop}
              className={cn(
                'absolute bottom-4 right-4 z-20',
                'w-10 h-10 rounded-full',
                'bg-violet-500/90 backdrop-blur-lg',
                'flex items-center justify-center',
                'shadow-lg shadow-violet-500/25',
                'hover:bg-violet-500 transition-colors'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
            >
              <ArrowUp className="w-5 h-5 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📝 CLEAN INPUT — Input estilo iOS limpio
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CleanInputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  disabled?: boolean
  error?: string
  hint?: string
  icon?: LucideIcon
  suffix?: ReactNode
  maxLength?: number
  showCharCount?: boolean
  className?: string
  inputClassName?: string
  autoFocus?: boolean
  required?: boolean
}

export const CleanInput = memo(forwardRef<HTMLInputElement, CleanInputProps>(
  function CleanInput(
    {
      label,
      placeholder,
      value,
      onChange,
      type = 'text',
      disabled = false,
      error,
      hint,
      icon: Icon,
      suffix,
      maxLength,
      showCharCount = false,
      className,
      inputClassName,
      autoFocus = false,
      required = false,
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const combinedRef = ref || inputRef

    const hasError = Boolean(error)
    const actualType = type === 'password' && showPassword ? 'text' : type

    return (
      <div className={cn('w-full space-y-1.5', className)}>
        {/* Label */}
        {label && (
          <label className={cn(
            'block text-sm font-medium',
            hasError ? 'text-red-400' : 'text-white/60'
          )}>
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {/* Input container */}
        <div
          className={cn(
            'relative flex items-center rounded-xl',
            'bg-white/[0.04] border transition-all duration-200',
            isFocused
              ? 'border-violet-500/50 bg-white/[0.06] ring-2 ring-violet-500/20'
              : 'border-white/[0.08] hover:border-white/[0.12]',
            hasError && 'border-red-500/50 bg-red-500/[0.04]',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {/* Icon */}
          {Icon && (
            <div className="pl-3.5 flex items-center">
              <Icon
                size={18}
                className={cn(
                  'transition-colors',
                  isFocused ? 'text-violet-400' : 'text-white/40'
                )}
              />
            </div>
          )}

          {/* Input */}
          <input
            ref={combinedRef as React.RefObject<HTMLInputElement>}
            type={actualType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            autoFocus={autoFocus}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'flex-1 h-11 px-3.5 bg-transparent',
              'text-white placeholder:text-white/30',
              'focus:outline-none',
              'disabled:cursor-not-allowed',
              !Icon && 'pl-4',
              inputClassName
            )}
          />

          {/* Password toggle */}
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pr-3.5 text-white/40 hover:text-white/60 transition-colors"
            >
              {showPassword ? <X size={18} /> : <Search size={18} />}
            </button>
          )}

          {/* Suffix */}
          {suffix && (
            <div className="pr-3.5 flex items-center">
              {suffix}
            </div>
          )}
        </div>

        {/* Error / Hint / Char count */}
        <div className="flex items-center justify-between text-xs">
          <div>
            {hasError && (
              <p className="text-red-400">{error}</p>
            )}
            {!hasError && hint && (
              <p className="text-white/40">{hint}</p>
            )}
          </div>
          {showCharCount && maxLength && (
            <span className={cn(
              'text-white/40',
              value.length >= maxLength && 'text-amber-400'
            )}>
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      </div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  CleanDesignTokens as tokens,
  type CleanGlassCardProps,
  type CleanMetricCardProps,
  type CleanButtonProps,
  type CleanScrollContainerProps,
  type CleanInputProps,
}
