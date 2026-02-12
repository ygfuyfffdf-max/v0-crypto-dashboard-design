'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎯 NEU-GLASS-GEN5 DESIGN SYSTEM — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de diseño ultra-premium con:
 * ✅ GLASSMORPHISM GEN5 (blur 40px, reflectividad adaptativa)
 * ✅ GRADIENTES CÓSMICOS (violeta-cyan-magenta-emerald)
 * ✅ MICRO-INTERACCIONES PREMIUM en todos los elementos
 * ✅ ANIMACIONES CINEMATOGRÁFICAS (glitch, hologram, energy)
 * ✅ EFECTOS 3D CON DEPTH PERCEPTION
 * ✅ RESPONSIVE DESIGN FLUID
 *
 * @version 5.0.0 - NEU-GLASS-GEN5
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { animated, useSpring } from '@react-spring/web'
import { motion, useMotionValue, useSpring as useMotionSpring, useTransform } from 'motion/react'
import React, { forwardRef, ReactNode, useCallback, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 NEU-GLASS-GEN5 COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const NEU_GLASS_COLORS = {
  // Primary Cosmic Colors
  cosmic: {
    violet: {
      primary: '#8B5CF6',
      light: '#A78BFA',
      dark: '#6D28D9',
      glow: 'rgba(139, 92, 246, 0.6)',
    },
    cyan: { primary: '#06B6D4', light: '#22D3EE', dark: '#0891B2', glow: 'rgba(6, 182, 212, 0.6)' },
    magenta: {
      primary: '#EC4899',
      light: '#F472B6',
      dark: '#DB2777',
      glow: 'rgba(236, 72, 153, 0.6)',
    },
    emerald: {
      primary: '#10B981',
      light: '#34D399',
      dark: '#059669',
      glow: 'rgba(16, 185, 129, 0.6)',
    },
    gold: {
      primary: '#FBBF24',
      light: '#FCD34D',
      dark: '#F59E0B',
      glow: 'rgba(251, 191, 36, 0.6)',
    },
  },
  // Glass Effects Gen5
  glass: {
    background: 'rgba(255, 255, 255, 0.02)',
    backgroundHover: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.12)',
    shine: 'rgba(255, 255, 255, 0.08)',
    shineStrong: 'rgba(255, 255, 255, 0.15)',
  },
  // Depth shadows
  depth: {
    soft: '0 8px 32px rgba(0, 0, 0, 0.4)',
    medium: '0 12px 48px rgba(0, 0, 0, 0.5)',
    strong: '0 20px 60px rgba(0, 0, 0, 0.6)',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 NEU-GLASS CARD — Card Premium con efectos Gen5
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NeuGlassCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  intensity?: 'low' | 'medium' | 'high'
  interactive?: boolean
  depth?: 'flat' | 'raised' | 'floating'
  borderGradient?: boolean
  shimmer?: boolean
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const NeuGlassCard = forwardRef<HTMLDivElement, NeuGlassCardProps>(
  (
    {
      children,
      className,
      glowColor = 'violet',
      intensity = 'medium',
      interactive = true,
      depth = 'raised',
      borderGradient = false,
      shimmer = true,
      onClick,
      onMouseEnter,
      onMouseLeave,
    },
    ref,
  ) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)
    const mouseX = useMotionValue(0.5)
    const mouseY = useMotionValue(0.5)

    const springConfig = { stiffness: 150, damping: 20 }
    const smoothX = useMotionSpring(mouseX, springConfig)
    const smoothY = useMotionSpring(mouseY, springConfig)

    // 3D tilt effect
    const rotateX = useTransform(smoothY, [0, 1], [5, -5])
    const rotateY = useTransform(smoothX, [0, 1], [-5, 5])

    // Dynamic glow position
    const glowX = useTransform(smoothX, [0, 1], ['0%', '100%'])
    const glowY = useTransform(smoothY, [0, 1], ['0%', '100%'])

    const color = NEU_GLASS_COLORS.cosmic[glowColor]

    const handleMouseMove = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current || !interactive) return
        const rect = cardRef.current.getBoundingClientRect()
        mouseX.set((e.clientX - rect.left) / rect.width)
        mouseY.set((e.clientY - rect.top) / rect.height)
      },
      [interactive, mouseX, mouseY],
    )

    const intensityMultiplier = { low: 0.5, medium: 1, high: 1.5 }[intensity]
    const depthShadow = {
      flat: 'none',
      raised: NEU_GLASS_COLORS.depth.soft,
      floating: NEU_GLASS_COLORS.depth.medium,
    }[depth]

    return (
      <motion.div
        ref={ref || cardRef}
        className={cn(
          'relative overflow-hidden rounded-2xl',
          // GLASSMORPHISM ULTRA TRANSPARENTE - Para ver shaders de fondo
          'backdrop-blur-sm',
          'transition-all duration-500',
          interactive && 'cursor-pointer',
          className,
        )}
        style={{
          background: isHovered
            ? NEU_GLASS_COLORS.glass.backgroundHover
            : NEU_GLASS_COLORS.glass.background,
          border: `1px solid ${isHovered ? NEU_GLASS_COLORS.glass.borderHover : NEU_GLASS_COLORS.glass.border}`,
          boxShadow: isHovered
            ? `${depthShadow}, 0 0 ${60 * intensityMultiplier}px ${color.glow}`
            : depthShadow,
          rotateX: interactive ? rotateX : 0,
          rotateY: interactive ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        onMouseEnter={() => {
          setIsHovered(true)
          onMouseEnter?.()
        }}
        onMouseLeave={() => {
          setIsHovered(false)
          onMouseLeave?.()
        }}
        onMouseMove={handleMouseMove}
        onClick={onClick}
        whileHover={interactive ? { scale: 1.02 } : {}}
        whileTap={interactive ? { scale: 0.98 } : {}}
      >
        {/* Border Gradient */}
        {borderGradient && (
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background: `linear-gradient(135deg, ${color.primary}20, transparent 50%, ${color.light}20)`,
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              padding: '1px',
            }}
          />
        )}

        {/* Dynamic Glow Follow */}
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(600px circle at ${glowX} ${glowY}, ${color.glow}, transparent 40%)`,
            opacity: isHovered ? 0.3 * intensityMultiplier : 0,
          }}
        />

        {/* Shimmer Effect */}
        {shimmer && (
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
        )}

        {/* Inner Reflection */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl"
          style={{
            background: `linear-gradient(180deg, ${NEU_GLASS_COLORS.glass.shine} 0%, transparent 100%)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    )
  },
)

NeuGlassCard.displayName = 'NeuGlassCard'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 NEU-GLASS KPI CARD — Card de métricas con animaciones premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NeuGlassKPIProps {
  label: string
  value: string | number
  icon?: ReactNode
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  subvalue?: string
  sparkline?: number[]
  animated?: boolean
  className?: string
}

export function NeuGlassKPI({
  label,
  value,
  icon,
  change,
  trend = 'neutral',
  color = 'cyan',
  subvalue,
  sparkline,
  animated = true,
  className,
}: NeuGlassKPIProps) {
  const [isHovered, setIsHovered] = useState(false)
  const colorPalette = NEU_GLASS_COLORS.cosmic[color]

  // Animated value
  const numericValue =
    typeof value === 'number' ? value : parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
  const displayPrefix = typeof value === 'string' ? value.replace(/[0-9.,]/g, '').trim() : ''

  const springValue = useSpring({
    val: animated ? numericValue : numericValue,
    from: { val: 0 },
    config: { tension: 120, friction: 20 },
  })

  return (
    <NeuGlassCard
      className={cn('p-5', className)}
      glowColor={color}
      intensity={isHovered ? 'high' : 'medium'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon && (
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: `${colorPalette.primary}20` }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <span style={{ color: colorPalette.primary }}>{icon}</span>
            </motion.div>
          )}
          <span className="text-sm font-medium text-white/60">{label}</span>
        </div>

        {/* Trend Badge */}
        {change !== undefined && (
          <motion.div
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
              trend === 'up' && 'bg-emerald-500/20 text-emerald-400',
              trend === 'down' && 'bg-red-500/20 text-red-400',
              trend === 'neutral' && 'bg-white/10 text-white/60',
            )}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}</span>
            <span>{Math.abs(change).toFixed(1)}%</span>
          </motion.div>
        )}
      </div>

      {/* Value */}
      <motion.div
        className="mb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.span
          className="text-3xl font-bold tracking-tight text-white"
          style={{
            textShadow: isHovered ? `0 0 20px ${colorPalette.glow}` : 'none',
          }}
        >
          {displayPrefix}
          {Math.round(numericValue).toLocaleString()}
        </motion.span>
      </motion.div>

      {/* Subvalue */}
      {subvalue && <p className="text-xs text-white/40">{subvalue}</p>}

      {/* Mini Sparkline */}
      {sparkline && sparkline.length > 0 && (
        <div className="mt-3 flex h-8 items-end gap-0.5">
          {sparkline.map((val, i) => {
            const max = Math.max(...sparkline)
            const height = max > 0 ? (val / max) * 100 : 0
            return (
              <motion.div
                key={i}
                className="flex-1 rounded-t"
                style={{
                  background: `linear-gradient(to top, ${colorPalette.primary}40, ${colorPalette.light}60)`,
                  height: `${height}%`,
                }}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
              />
            )
          })}
        </div>
      )}
    </NeuGlassCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔘 NEU-GLASS BUTTON — Botón premium con micro-interacciones
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NeuGlassButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'glow'
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  className?: string
  onClick?: () => void
}

export function NeuGlassButton({
  children,
  variant = 'primary',
  color = 'violet',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  className,
  onClick,
}: NeuGlassButtonProps) {
  const [isHovered, setIsHovered] = useState(false)
  const colorPalette = NEU_GLASS_COLORS.cosmic[color]

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }

  const variantStyles = {
    primary: {
      background: `linear-gradient(135deg, ${colorPalette.primary}, ${colorPalette.dark})`,
      border: `1px solid ${colorPalette.light}30`,
      color: 'white',
    },
    secondary: {
      background: `${colorPalette.primary}15`,
      border: `1px solid ${colorPalette.primary}30`,
      color: colorPalette.light,
    },
    ghost: {
      background: 'transparent',
      border: '1px solid transparent',
      color: 'rgba(255,255,255,0.7)',
    },
    glow: {
      background: `linear-gradient(135deg, ${colorPalette.primary}, ${colorPalette.dark})`,
      border: `1px solid ${colorPalette.light}50`,
      color: 'white',
      boxShadow: `0 0 30px ${colorPalette.glow}`,
    },
  }

  const style = variantStyles[variant]

  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-xl font-medium transition-all',
        sizeClasses[size],
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {/* Shimmer on hover */}
      {isHovered && !disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}

      {/* Loading spinner */}
      {loading ? (
        <motion.div
          className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && <span>{icon}</span>}
          <span className="relative z-10">{children}</span>
          {icon && iconPosition === 'right' && <span>{icon}</span>}
        </>
      )}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📝 NEU-GLASS INPUT — Input premium con efectos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NeuGlassInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'number' | 'email' | 'password' | 'search'
  icon?: ReactNode
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  error?: string
  className?: string
}

export function NeuGlassInput({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  icon,
  color = 'cyan',
  error,
  className,
}: NeuGlassInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const colorPalette = NEU_GLASS_COLORS.cosmic[color]

  return (
    <div className={cn('relative', className)}>
      <motion.div
        className={cn(
          'flex items-center gap-3 rounded-xl px-4 py-3 transition-all',
          'bg-white/[0.03] backdrop-blur-xl',
          error ? 'border-red-500/50' : isFocused ? 'border-white/20' : 'border-white/10',
          'border',
        )}
        style={{
          boxShadow: isFocused ? `0 0 20px ${colorPalette.glow}` : 'none',
        }}
      >
        {icon && <span className="text-white/40">{icon}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            'flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30',
          )}
        />
      </motion.div>
      {error && (
        <motion.p
          className="mt-1 text-xs text-red-400"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 NEU-GLASS TABS — Tabs con animaciones premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NeuGlassTabsProps {
  tabs: Array<{ id: string; label: string; icon?: ReactNode }>
  activeTab: string
  onTabChange: (id: string) => void
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  className?: string
}

export function NeuGlassTabs({
  tabs,
  activeTab,
  onTabChange,
  color = 'cyan',
  className,
}: NeuGlassTabsProps) {
  const colorPalette = NEU_GLASS_COLORS.cosmic[color]

  return (
    <div className={cn('inline-flex rounded-xl bg-white/[0.03] p-1 backdrop-blur-xl', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab
        return (
          <motion.button
            key={tab.id}
            className={cn(
              'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              isActive ? 'text-white' : 'text-white/50 hover:text-white/70',
            )}
            onClick={() => onTabChange(tab.id)}
            whileHover={!isActive ? { scale: 1.02 } : {}}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{ background: `${colorPalette.primary}30` }}
                layoutId="activeTab"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            {tab.icon && <span className="relative z-10">{tab.icon}</span>}
            <span className="relative z-10">{tab.label}</span>
          </motion.button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🏷️ NEU-GLASS BADGE — Badge con efectos premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NeuGlassBadgeProps {
  children: ReactNode
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  variant?: 'solid' | 'outline' | 'glow'
  size?: 'sm' | 'md'
  pulse?: boolean
  className?: string
}

export function NeuGlassBadge({
  children,
  color = 'cyan',
  variant = 'solid',
  size = 'sm',
  pulse = false,
  className,
}: NeuGlassBadgeProps) {
  const colorPalette = NEU_GLASS_COLORS.cosmic[color]

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
  }

  const variantStyles = {
    solid: {
      background: `${colorPalette.primary}20`,
      border: 'none',
      color: colorPalette.light,
    },
    outline: {
      background: 'transparent',
      border: `1px solid ${colorPalette.primary}50`,
      color: colorPalette.primary,
    },
    glow: {
      background: `${colorPalette.primary}30`,
      border: `1px solid ${colorPalette.light}50`,
      color: colorPalette.light,
      boxShadow: `0 0 10px ${colorPalette.glow}`,
    },
  }

  const style = variantStyles[variant]

  return (
    <motion.span
      className={cn(
        'relative inline-flex items-center justify-center rounded-full font-medium',
        sizeClasses[size],
        className,
      )}
      style={style}
      whileHover={{ scale: 1.02 }}
    >
      {pulse && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ background: colorPalette.primary }}
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      <span className="relative">{children}</span>
    </motion.span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { NEU_GLASS_COLORS as COLORS }

