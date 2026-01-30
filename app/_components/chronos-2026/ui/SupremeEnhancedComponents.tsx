/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎯 SUPREME ENHANCED COMPONENTS — Componentes UI con feedback premium integrado
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Componentes de alto nivel que integran:
 * ▸ Sound Effects automáticos
 * ▸ Haptic Feedback
 * ▸ Micro-animaciones premium
 * ▸ Estados visuales avanzados
 * ▸ Accesibilidad completa
 * 
 * @version 1.0.0 — OMEGA SUPREME EDITION
 */

'use client'

import React, { forwardRef, useCallback, useState } from 'react'
import { motion, type HTMLMotionProps, type MotionValue, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/app/_lib/utils'
import { useFeedback } from '@/app/hooks/useSupremeSystems'
import { Loader2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS COMUNES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gold' | 'aurora'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔘 SUPREME BUTTON — Botón premium con todos los sistemas integrados
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremeButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  disabled?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  magnetic?: boolean
  glow?: boolean
  ripple?: boolean
  children: React.ReactNode
  feedbackType?: 'click' | 'success' | 'error' | 'create' | 'delete' | 'transfer'
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/10 hover:border-white/20',
  ghost: 'bg-transparent hover:bg-white/5 text-white/80 hover:text-white',
  danger: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-500/25',
  success: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-lg shadow-emerald-500/25',
  gold: 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black shadow-lg shadow-amber-500/25',
  aurora: 'bg-gradient-to-r from-violet-600 via-cyan-500 to-emerald-500 hover:from-violet-500 hover:via-cyan-400 hover:to-emerald-400 text-white shadow-lg shadow-cyan-500/25',
}

const BUTTON_SIZES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2 text-xs gap-1',
  sm: 'h-8 px-3 text-sm gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-base gap-2',
  xl: 'h-12 px-6 text-base gap-2.5',
}

const GLOW_COLORS: Record<ButtonVariant, string> = {
  primary: 'rgba(139, 92, 246, 0.4)',
  secondary: 'rgba(255, 255, 255, 0.1)',
  ghost: 'transparent',
  danger: 'rgba(239, 68, 68, 0.4)',
  success: 'rgba(16, 185, 129, 0.4)',
  gold: 'rgba(245, 158, 11, 0.4)',
  aurora: 'rgba(6, 182, 212, 0.4)',
}

export const SupremeButton = forwardRef<HTMLButtonElement, SupremeButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    icon,
    iconPosition = 'left',
    magnetic = true,
    glow = true,
    ripple = true,
    children,
    feedbackType = 'click',
    className,
    onClick,
    onMouseEnter,
    onMouseLeave,
    ...props
  }, ref) => {
    const feedback = useFeedback()
    const [isHovered, setIsHovered] = useState(false)
    const [rippleState, setRippleState] = useState<{ x: number; y: number; key: number } | null>(null)
    
    // Magnetic effect values
    const x = useMotionValue(0)
    const y = useMotionValue(0)
    
    const springConfig = { damping: 20, stiffness: 300 }
    const xSpring = useSpring(x, springConfig)
    const ySpring = useSpring(y, springConfig)
    
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (!magnetic || disabled) return
      
      const rect = e.currentTarget.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const deltaX = (e.clientX - centerX) * 0.2
      const deltaY = (e.clientY - centerY) * 0.2
      
      x.set(deltaX)
      y.set(deltaY)
    }, [magnetic, disabled, x, y])
    
    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(true)
      feedback.hover()
      onMouseEnter?.(e)
    }, [feedback, onMouseEnter])
    
    const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      setIsHovered(false)
      x.set(0)
      y.set(0)
      onMouseLeave?.(e)
    }, [x, y, onMouseLeave])
    
    const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return
      
      // Trigger feedback based on type
      if (feedbackType === 'success') {
        feedback.success()
      } else if (feedbackType === 'error') {
        feedback.error()
      } else if (feedbackType === 'create') {
        feedback.create()
      } else if (feedbackType === 'delete') {
        feedback.delete()
      } else if (feedbackType === 'transfer') {
        feedback.transfer()
      } else {
        feedback.click()
      }
      
      // Ripple effect
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect()
        setRippleState({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          key: Date.now(),
        })
      }
      
      onClick?.(e)
    }, [disabled, loading, feedbackType, feedback, ripple, onClick])
    
    const isDisabled = disabled || loading
    
    return (
      <motion.button
        ref={ref}
        disabled={isDisabled}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          x: xSpring,
          y: ySpring,
        }}
        whileTap={{ scale: isDisabled ? 1 : 0.97 }}
        className={cn(
          // Base styles
          'relative inline-flex items-center justify-center font-medium rounded-lg',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          'overflow-hidden select-none',
          
          // Variant
          BUTTON_VARIANTS[variant],
          
          // Size
          BUTTON_SIZES[size],
          
          // Disabled state
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          
          className
        )}
        {...props}
      >
        {/* Glow effect */}
        {glow && isHovered && (
          <motion.div
            className="absolute inset-0 -z-10 blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: GLOW_COLORS[variant],
            }}
          />
        )}
        
        {/* Ripple effect */}
        {ripple && rippleState && (
          <motion.span
            key={rippleState.key}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="absolute w-8 h-8 rounded-full bg-white/30 pointer-events-none"
            style={{
              left: rippleState.x - 16,
              top: rippleState.y - 16,
            }}
            onAnimationComplete={() => setRippleState(null)}
          />
        )}
        
        {/* Loading spinner */}
        {loading && (
          <Loader2 className="absolute w-4 h-4 animate-spin" />
        )}
        
        {/* Content */}
        <span className={cn(
          'flex items-center gap-2',
          loading && 'invisible'
        )}>
          {icon && iconPosition === 'left' && icon}
          {children}
          {icon && iconPosition === 'right' && icon}
        </span>
      </motion.button>
    )
  }
)

SupremeButton.displayName = 'SupremeButton'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎴 SUPREME CARD — Card premium con efectos avanzados
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremeCardProps extends HTMLMotionProps<'div'> {
  variant?: 'glass' | 'solid' | 'gradient' | 'aurora' | 'glow'
  interactive?: boolean
  hoverLift?: boolean
  glow?: boolean
  glowColor?: string
  children: React.ReactNode
}

export const SupremeCard = forwardRef<HTMLDivElement, SupremeCardProps>(
  ({
    variant = 'glass',
    interactive = false,
    hoverLift = true,
    glow = false,
    glowColor = 'rgba(139, 92, 246, 0.3)',
    children,
    className,
    onMouseEnter,
    onMouseLeave,
    ...props
  }, ref) => {
    const feedback = useFeedback()
    const [isHovered, setIsHovered] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (!interactive) return
      const rect = e.currentTarget.getBoundingClientRect()
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    }, [interactive])
    
    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(true)
      if (interactive) {
        feedback.hover()
      }
      onMouseEnter?.(e)
    }, [interactive, feedback, onMouseEnter])
    
    const handleMouseLeave = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      setIsHovered(false)
      onMouseLeave?.(e)
    }, [onMouseLeave])
    
    const cardVariants = {
      glass: 'bg-white/5 backdrop-blur-xl border border-white/10',
      solid: 'bg-slate-900 border border-slate-800',
      gradient: 'bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 border border-purple-500/20',
      aurora: 'bg-gradient-to-br from-violet-900/20 via-cyan-900/20 to-emerald-900/20 backdrop-blur-xl border border-violet-500/20',
      glow: 'bg-slate-900/80 backdrop-blur-xl border border-violet-500/30',
    }
    
    return (
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        whileHover={hoverLift ? { y: -4, scale: 1.01 } : undefined}
        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
        className={cn(
          'relative rounded-xl overflow-hidden',
          cardVariants[variant],
          interactive && 'cursor-pointer',
          className
        )}
        {...props}
      >
        {/* Spotlight effect */}
        {interactive && isHovered && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.08) 0%, transparent 50%)`,
            }}
          />
        )}
        
        {/* Glow effect */}
        {glow && isHovered && (
          <motion.div
            className="absolute inset-0 -z-10 blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            style={{ background: glowColor }}
          />
        )}
        
        {children}
      </motion.div>
    )
  }
)

SupremeCard.displayName = 'SupremeCard'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 SUPREME STAT — Estadística animada con feedback
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremeStatProps {
  label: string
  value: number | string
  prefix?: string
  suffix?: string
  icon?: React.ReactNode
  trend?: number
  trendLabel?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
  animate?: boolean
  className?: string
}

export function SupremeStat({
  label,
  value,
  prefix = '',
  suffix = '',
  icon,
  trend,
  trendLabel,
  variant = 'default',
  animate = true,
  className,
}: SupremeStatProps) {
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 })
  
  React.useEffect(() => {
    if (typeof value === 'number' && animate) {
      motionValue.set(value)
    }
  }, [value, motionValue, animate])
  
  const displayValue = typeof value === 'number' && animate
    ? useTransform(springValue, (v) => Math.round(v).toLocaleString())
    : value
  
  const variantColors = {
    default: 'text-white',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    danger: 'text-red-400',
  }
  
  const trendColor = trend && trend > 0 ? 'text-emerald-400' : trend && trend < 0 ? 'text-red-400' : 'text-gray-400'
  
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2 text-sm text-gray-400">
        {icon && <span className="w-4 h-4">{icon}</span>}
        <span>{label}</span>
      </div>
      
      <div className={cn('text-2xl font-bold', variantColors[variant])}>
        {prefix}
        {typeof displayValue === 'object' ? (
          <motion.span>{displayValue}</motion.span>
        ) : (
          displayValue
        )}
        {suffix}
      </div>
      
      {trend !== undefined && (
        <div className={cn('text-xs flex items-center gap-1', trendColor)}>
          <span>{trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}</span>
          <span>{Math.abs(trend)}%</span>
          {trendLabel && <span className="text-gray-500">{trendLabel}</span>}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📱 SUPREME TABS — Tabs con feedback y animaciones
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SupremeTabsProps {
  tabs: Array<{
    id: string
    label: string
    icon?: React.ReactNode
    badge?: number | string
  }>
  activeTab: string
  onChange: (id: string) => void
  variant?: 'pills' | 'underline' | 'cards'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function SupremeTabs({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  size = 'md',
  className,
}: SupremeTabsProps) {
  const feedback = useFeedback()
  
  const handleTabChange = useCallback((id: string) => {
    if (id !== activeTab) {
      feedback.tabSwitch()
      onChange(id)
    }
  }, [activeTab, feedback, onChange])
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-5 text-base',
  }
  
  const variantClasses = {
    pills: 'rounded-lg',
    underline: 'rounded-none border-b-2 border-transparent',
    cards: 'rounded-t-lg',
  }
  
  return (
    <div className={cn(
      'flex gap-1',
      variant === 'pills' && 'bg-white/5 p-1 rounded-xl',
      variant === 'underline' && 'border-b border-white/10',
      className
    )}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        
        return (
          <motion.button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'relative flex items-center justify-center gap-2 font-medium transition-all duration-200',
              sizeClasses[size],
              variantClasses[variant],
              isActive ? 'text-white' : 'text-gray-400 hover:text-white/80',
            )}
          >
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className={cn(
                  'absolute inset-0 -z-10',
                  variant === 'pills' && 'bg-white/10 rounded-lg',
                  variant === 'underline' && 'border-b-2 border-violet-500 bottom-0 h-0.5',
                  variant === 'cards' && 'bg-slate-800 rounded-t-lg',
                )}
                transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              />
            )}
            
            {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
            <span>{tab.label}</span>
            
            {tab.badge !== undefined && (
              <span className={cn(
                'px-1.5 py-0.5 text-xs rounded-full',
                isActive ? 'bg-violet-500/30 text-violet-200' : 'bg-white/10 text-gray-300'
              )}>
                {tab.badge}
              </span>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { type ButtonVariant, type ButtonSize }
