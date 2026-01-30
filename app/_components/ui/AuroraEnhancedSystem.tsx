/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * ✨ AURORA ENHANCED SYSTEM — Componentes Aurora con Feedback Premium integrado
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Wrappers y componentes mejorados que añaden:
 * ▸ 🔊 Sound Effects automáticos
 * ▸ 📳 Haptic Feedback
 * ▸ 🤌 Gesture Support
 * ▸ 🎨 Theme Integration
 * 
 * @version 1.0.0 — OMEGA SUPREME EDITION
 */

'use client'

import React, { forwardRef, useCallback, useState, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/app/_lib/utils'
import { useFeedback } from '@/app/hooks/useSupremeSystems'
import { Loader2 } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COLORES AURORA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const AURORA_COLORS = {
  violet: {
    primary: '#8B5CF6',
    light: '#A78BFA',
    dark: '#6D28D9',
    glow: 'rgba(139, 92, 246, 0.5)',
    aurora: 'rgba(139, 92, 246, 0.25)',
  },
  cyan: {
    primary: '#06B6D4',
    light: '#22D3EE',
    dark: '#0891B2',
    glow: 'rgba(6, 182, 212, 0.5)',
    aurora: 'rgba(6, 182, 212, 0.25)',
  },
  magenta: {
    primary: '#EC4899',
    light: '#F472B6',
    dark: '#DB2777',
    glow: 'rgba(236, 72, 153, 0.5)',
    aurora: 'rgba(236, 72, 153, 0.25)',
  },
  emerald: {
    primary: '#10B981',
    light: '#34D399',
    dark: '#059669',
    glow: 'rgba(16, 185, 129, 0.5)',
    aurora: 'rgba(16, 185, 129, 0.25)',
  },
  gold: {
    primary: '#FBBF24',
    light: '#FCD34D',
    dark: '#F59E0B',
    glow: 'rgba(251, 191, 36, 0.5)',
    aurora: 'rgba(251, 191, 36, 0.25)',
  },
  red: {
    primary: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    glow: 'rgba(239, 68, 68, 0.5)',
    aurora: 'rgba(239, 68, 68, 0.25)',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔘 AURORA BUTTON ENHANCED — Con feedback completo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type FeedbackType = 'click' | 'success' | 'error' | 'warning' | 'create' | 'delete' | 'transfer' | 'cash' | 'refresh'
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glow' | 'danger' | 'success'
type ButtonColor = 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold' | 'red'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AuroraButtonEnhancedProps {
  children: ReactNode
  onClick?: () => void | Promise<void>
  variant?: ButtonVariant
  color?: ButtonColor
  size?: ButtonSize
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  loading?: boolean
  feedbackType?: FeedbackType
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const SIZE_STYLES: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs gap-1',
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-base gap-2',
  lg: 'px-7 py-3.5 text-lg gap-2',
  xl: 'px-9 py-4 text-xl gap-3',
}

export const AuroraButtonEnhanced = forwardRef<HTMLButtonElement, AuroraButtonEnhancedProps>(
  ({
    children,
    onClick,
    variant = 'primary',
    color = 'violet',
    size = 'md',
    icon,
    iconPosition = 'left',
    disabled = false,
    loading = false,
    feedbackType = 'click',
    className,
    type = 'button',
  }, ref) => {
    const feedback = useFeedback()
    const colorConfig = AURORA_COLORS[color]
    const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])
    const [isPressed, setIsPressed] = useState(false)

    // Variant styles
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return 'bg-gradient-to-r text-white shadow-lg'
        case 'secondary':
          return 'bg-white/10 text-white border border-white/20 hover:bg-white/15'
        case 'ghost':
          return 'bg-transparent text-white/80 hover:text-white hover:bg-white/5'
        case 'glow':
          return 'bg-transparent border-2 text-white'
        case 'danger':
          return 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/25'
        case 'success':
          return 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25'
        default:
          return ''
      }
    }

    // Get gradient based on color
    const getGradient = () => {
      if (variant === 'danger') return 'from-red-600 to-rose-600'
      if (variant === 'success') return 'from-emerald-600 to-green-600'
      
      const gradients: Record<ButtonColor, string> = {
        violet: 'from-violet-600 to-purple-600',
        cyan: 'from-cyan-600 to-blue-600',
        magenta: 'from-pink-600 to-rose-600',
        emerald: 'from-emerald-600 to-teal-600',
        gold: 'from-amber-500 to-yellow-500',
        red: 'from-red-600 to-rose-600',
      }
      return gradients[color]
    }

    // Handle click with feedback
    const handleClick = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return

      // Ripple effect
      const button = e.currentTarget
      const rect = button.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = Date.now()

      setRipples((prev) => [...prev, { x, y, id }])
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id))
      }, 600)

      // Trigger feedback based on type
      switch (feedbackType) {
        case 'success':
          feedback.success()
          break
        case 'error':
          feedback.error()
          break
        case 'warning':
          feedback.warning()
          break
        case 'create':
          feedback.create()
          break
        case 'delete':
          feedback.delete()
          break
        case 'transfer':
          feedback.transfer()
          break
        case 'cash':
          feedback.cash()
          break
        case 'refresh':
          feedback.refresh()
          break
        default:
          feedback.click()
      }

      // Call original onClick
      if (onClick) {
        await onClick()
      }
    }, [disabled, loading, feedbackType, feedback, onClick])

    // Hover feedback
    const handleMouseEnter = useCallback(() => {
      if (!disabled && !loading) {
        feedback.hover()
      }
    }, [disabled, loading, feedback])

    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        disabled={isDisabled}
        className={cn(
          'relative overflow-hidden rounded-xl font-medium',
          'flex items-center justify-center',
          'transition-all duration-200 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
          SIZE_STYLES[size],
          getVariantStyles(),
          variant === 'primary' && getGradient(),
          isDisabled && 'cursor-not-allowed opacity-50',
          className,
        )}
        style={{
          borderColor: variant === 'glow' ? colorConfig.primary : undefined,
          boxShadow: variant === 'glow' ? `0 0 20px ${colorConfig.glow}` : undefined,
        }}
        whileHover={isDisabled ? undefined : {
          scale: 1.03,
          boxShadow: `0 8px 30px ${colorConfig.glow}`,
        }}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {/* Rotating border glow for glow variant */}
        {variant === 'glow' && (
          <motion.div
            className="pointer-events-none absolute -inset-[2px] rounded-xl opacity-70"
            style={{
              background: `conic-gradient(from 0deg, ${colorConfig.glow}, transparent, ${colorConfig.primary}, transparent, ${colorConfig.glow})`,
              filter: 'blur(3px)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
        )}

        {/* Inner background for glow variant */}
        {variant === 'glow' && <div className="absolute inset-[2px] rounded-[10px] bg-black/80" />}

        {/* Ripple effects */}
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="pointer-events-none absolute rounded-full"
            style={{
              left: ripple.x,
              top: ripple.y,
              background: `radial-gradient(circle, ${colorConfig.light}60, transparent 70%)`,
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.6 }}
            animate={{ width: 200, height: 200, x: -100, y: -100, opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        ))}

        {/* Shimmer effect on hover */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
            transform: 'translateX(-100%)',
          }}
          whileHover={isDisabled ? undefined : {
            opacity: 1,
            transform: 'translateX(100%)',
            transition: { duration: 0.5 },
          }}
        />

        {/* Loading spinner */}
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin absolute" />
        )}

        {/* Content */}
        <span className={cn(
          'relative z-10 flex items-center gap-2',
          loading && 'invisible'
        )}>
          {icon && iconPosition === 'left' && (
            <motion.span
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {icon}
            </motion.span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <motion.span
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {icon}
            </motion.span>
          )}
        </span>
      </motion.button>
    )
  }
)

AuroraButtonEnhanced.displayName = 'AuroraButtonEnhanced'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎴 AURORA CARD ENHANCED — Card con feedback
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraCardEnhancedProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  interactive?: boolean
  glow?: boolean
  glowColor?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function AuroraCardEnhanced({
  children,
  className,
  onClick,
  interactive = false,
  glow = false,
  glowColor = 'rgba(139, 92, 246, 0.3)',
  padding = 'md',
}: AuroraCardEnhancedProps) {
  const feedback = useFeedback()
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-5',
    lg: 'p-7',
  }

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [interactive])

  const handleClick = useCallback(() => {
    if (interactive && onClick) {
      feedback.click()
      onClick()
    }
  }, [interactive, onClick, feedback])

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovered(true)
        if (interactive) feedback.hover()
      }}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={interactive ? { y: -4, scale: 1.01 } : undefined}
      transition={{ type: 'spring', damping: 25, stiffness: 400 }}
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-white/5 backdrop-blur-xl border border-white/10',
        interactive && 'cursor-pointer',
        paddingStyles[padding],
        className,
      )}
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

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📱 AURORA TABS ENHANCED — Tabs con feedback
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraTab {
  id: string
  label: string
  icon?: ReactNode
  badge?: number | string
}

interface AuroraTabsEnhancedProps {
  tabs: AuroraTab[]
  activeTab: string
  onChange: (id: string) => void
  variant?: 'pills' | 'underline' | 'cards'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AuroraTabsEnhanced({
  tabs,
  activeTab,
  onChange,
  variant = 'pills',
  size = 'md',
  className,
}: AuroraTabsEnhancedProps) {
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
              variant === 'pills' && 'rounded-lg',
              variant === 'underline' && 'rounded-none border-b-2 border-transparent',
              variant === 'cards' && 'rounded-t-lg',
              isActive ? 'text-white' : 'text-gray-400 hover:text-white/80',
            )}
          >
            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId={`activeTab-${tabs.map(t => t.id).join('-')}`}
                className={cn(
                  'absolute inset-0 -z-10',
                  variant === 'pills' && 'bg-white/10 rounded-lg',
                  variant === 'underline' && 'bottom-0 h-0.5 bg-violet-500',
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

export type {
  FeedbackType,
  ButtonVariant,
  ButtonColor,
  ButtonSize,
  AuroraButtonEnhancedProps,
  AuroraCardEnhancedProps,
  AuroraTab,
  AuroraTabsEnhancedProps,
}
