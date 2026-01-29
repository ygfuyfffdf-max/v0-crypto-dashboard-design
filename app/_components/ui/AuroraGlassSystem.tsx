'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ✨ AURORA GLASS SYSTEM — CHRONOS INFINITY 2026 PREMIUM EDITION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de diseño AURORA GLASS con:
 * - Efectos de aurora boreal interactivos
 * - Glassmorphism translúcido con shaders
 * - Hover + scroll effects avanzados creativos
 * - Animaciones fluidas de luz y color
 * - Partículas y ondas de energía
 * - Reflejos holográficos dinámicos
 *
 * PALETA: Violeta/Cyan/Magenta/Emerald con transiciones suaves
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import React, { forwardRef, ReactNode, useCallback, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 AURORA COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const AURORA_COLORS = {
  // Core Aurora Colors
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
  // Glass effects
  glass: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
    shine: 'rgba(255, 255, 255, 0.1)',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 AURORA BACKGROUND — Animated Aurora Borealis Effect
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraBackgroundProps {
  children?: ReactNode
  className?: string
  intensity?: 'low' | 'medium' | 'high'
  colors?: ('violet' | 'cyan' | 'magenta' | 'emerald' | 'gold')[]
  interactive?: boolean
  blur?: number
}

export function AuroraBackground({
  children,
  className,
  intensity = 'medium',
  colors = ['violet', 'cyan', 'magenta'],
  interactive = true,
  blur = 150,
}: AuroraBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)

  const springConfig = { stiffness: 50, damping: 20 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  // Pre-compute blob transforms to avoid hooks inside JSX map
  const blobX = useTransform(smoothX, [0, 1], [-50, 50])
  const blobY = useTransform(smoothY, [0, 1], [-50, 50])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      mouseX.set(x)
      mouseY.set(y)
    },
    [interactive, mouseX, mouseY],
  )

  const opacityMap = { low: 0.3, medium: 0.5, high: 0.7 }
  const baseOpacity = opacityMap[intensity]

  const colorConfigs = useMemo(
    () =>
      colors.map((color, i) => ({
        color: AURORA_COLORS[color].primary,
        glow: AURORA_COLORS[color].glow,
        delay: i * 2,
        duration: 8 + i * 2,
        size: 40 + i * 10,
        position: {
          x: (100 / (colors.length + 1)) * (i + 1),
          y: 20 + i * 15,
        },
      })),
    [colors],
  )

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden bg-transparent', className)}
      onMouseMove={handleMouseMove}
    >
      {/* Aurora Blobs - z-index positivo para verse sobre el fondo */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        {colorConfigs.map((config, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${config.size}%`,
              height: `${config.size}%`,
              background: `radial-gradient(circle, ${config.glow} 0%, transparent 70%)`,
              filter: `blur(${blur}px)`,
              opacity: baseOpacity,
              x: blobX,
              y: blobY,
            }}
            animate={{
              left: [
                `${config.position.x - 10}%`,
                `${config.position.x + 10}%`,
                `${config.position.x - 10}%`,
              ],
              top: [
                `${config.position.y - 10}%`,
                `${config.position.y + 10}%`,
                `${config.position.y - 10}%`,
              ],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: config.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: config.delay,
            }}
          />
        ))}

        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              135deg,
              transparent 0%,
              rgba(255, 255, 255, 0.02) 50%,
              transparent 100%
            )`,
          }}
          animate={{
            backgroundPosition: ['0% 0%', '200% 200%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💎 AURORA GLASS CARD — Premium Translucent Card with Effects
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface AuroraGlassCardProps {
  children: ReactNode
  className?: string
  glowColor?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  enableHover?: boolean
  enableTilt?: boolean
  enableGlow?: boolean
  enableShimmer?: boolean
  variant?: 'standard' | 'elevated' | 'floating'
  onClick?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const AuroraGlassCard = forwardRef<HTMLDivElement, AuroraGlassCardProps>(
  (
    {
      children,
      className,
      glowColor = 'violet',
      enableHover = true,
      enableTilt = true,
      enableGlow = true,
      enableShimmer = true,
      variant = 'standard',
      onClick,
      onMouseEnter: onMouseEnterProp,
      onMouseLeave: onMouseLeaveProp,
    },
    ref,
  ) => {
    const cardRef = useRef<HTMLDivElement>(null)
    const [isHovered, setIsHovered] = useState(false)

    // Tilt effect
    const rotateX = useMotionValue(0)
    const rotateY = useMotionValue(0)
    const springConfig = { stiffness: 300, damping: 20 }
    const smoothRotateX = useSpring(rotateX, springConfig)
    const smoothRotateY = useSpring(rotateY, springConfig)

    // Shine position
    const shineX = useMotionValue(50)
    const shineY = useMotionValue(50)

    // Pre-compute shine gradient to avoid hooks inside JSX
    const shineGradient = useTransform(
      [shineX, shineY],
      ([x, y]) =>
        `radial-gradient(circle at ${x}% ${y}%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)`,
    )

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!enableTilt || !cardRef.current) return
        const rect = cardRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        rotateX.set(y * 10)
        rotateY.set(-x * 10)
        shineX.set((x + 0.5) * 100)
        shineY.set((y + 0.5) * 100)
      },
      [enableTilt, rotateX, rotateY, shineX, shineY],
    )

    const handleMouseLeave = useCallback(() => {
      rotateX.set(0)
      rotateY.set(0)
      setIsHovered(false)
      onMouseLeaveProp?.()
    }, [rotateX, rotateY, onMouseLeaveProp])

    const handleMouseEnter = useCallback(() => {
      setIsHovered(true)
      onMouseEnterProp?.()
    }, [onMouseEnterProp])

    const color = AURORA_COLORS[glowColor]

    const variantStyles = {
      // GLASSMORPHISM GEN5 ULTRA - Máxima transparencia para ver shaders de fondo
      standard: 'bg-white/[0.02] backdrop-blur-sm',
      elevated: 'bg-white/[0.03] backdrop-blur-md',
      floating: 'bg-white/[0.015] backdrop-blur-sm shadow-2xl shadow-black/30',
    }

    return (
      <motion.div
        ref={cardRef}
        className={cn(
          // GLASSMORPHISM AVANZADO - Bordes sutiles con gradiente
          'transition-spring hover-elevate relative overflow-hidden rounded-2xl',
          'border border-white/[0.06]',
          variantStyles[variant],
          enableHover && 'cursor-pointer hover:border-white/[0.12] hover:bg-white/[0.04]',
          className,
        )}
        style={{
          rotateX: enableTilt ? smoothRotateX : 0,
          rotateY: enableTilt ? smoothRotateY : 0,
          transformPerspective: 1000,
          transformStyle: 'preserve-3d',
          boxShadow: isHovered ? `0 8px 32px ${color.aurora}, 0 0 0 1px ${color.glow}` : undefined,
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={onClick}
        whileHover={enableHover ? { scale: 1.02, y: -4 } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
      >
        {/* Glow effect */}
        {enableGlow && (
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{
              background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${color.glow} 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 50% 100%, ${color.aurora} 0%, transparent 50%)`,
            }}
            animate={{ opacity: isHovered ? 0.7 : 0 }}
            transition={{ duration: 0.4 }}
          />
        )}

        {/* Animated border glow */}
        {enableGlow && isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0 rounded-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: `linear-gradient(90deg, transparent, ${color.glow}, transparent)`,
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'exclude',
              WebkitMaskComposite: 'xor',
              padding: '1px',
            }}
          />
        )}

        {/* Shimmer effect */}
        {enableShimmer && isHovered && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            style={{
              background: `linear-gradient(
                135deg,
                transparent 0%,
                rgba(255, 255, 255, 0.1) 50%,
                transparent 100%
              )`,
              backgroundSize: '200% 200%',
            }}
            animate={{
              backgroundPosition: ['0% 0%', '200% 200%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Shine reflection */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{
            background: shineGradient,
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        />

        {/* Border glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow: `inset 0 0 30px ${color.aurora}`,
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </motion.div>
    )
  },
)

AuroraGlassCard.displayName = 'AuroraGlassCard'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ AURORA STAT WIDGET — Premium Stats Display
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraStatWidgetProps {
  label: string
  value: number | string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  prefix?: string
  suffix?: string
  sparklineData?: number[]
  className?: string
}

export function AuroraStatWidget({
  label,
  value,
  change,
  trend = 'neutral',
  icon,
  color = 'violet',
  prefix = '',
  suffix = '',
  sparklineData,
  className,
}: AuroraStatWidgetProps) {
  const colorConfig = AURORA_COLORS[color]
  const [isHovered, setIsHovered] = useState(false)

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

  const trendBgColors = {
    up: 'rgba(16, 185, 129, 0.15)',
    down: 'rgba(239, 68, 68, 0.15)',
    neutral: 'rgba(255,255,255,0.05)',
  }

  return (
    <AuroraGlassCard
      glowColor={color}
      enableTilt
      enableGlow
      className={cn('group relative p-6', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium corner accent */}
      <motion.div
        className="absolute top-0 right-0 h-16 w-16 overflow-hidden rounded-tr-xl rounded-bl-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 0.4 : 0.2 }}
      >
        <div
          className="absolute -top-8 -right-8 h-16 w-16 rotate-45"
          style={{
            background: `linear-gradient(135deg, ${colorConfig.glow}, transparent)`,
          }}
        />
      </motion.div>

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        {icon && (
          <div className="relative">
            {/* Rotating glow ring */}
            <motion.div
              className="absolute -inset-1 rounded-xl opacity-60"
              style={{
                background: `conic-gradient(from 0deg, ${colorConfig.glow}, transparent, ${colorConfig.aurora}, transparent, ${colorConfig.glow})`,
                filter: 'blur(4px)',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="relative flex h-12 w-12 items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${colorConfig.aurora}, rgba(0,0,0,0.3))`,
                border: `1px solid ${colorConfig.glow}`,
                boxShadow: `0 4px 20px ${colorConfig.aurora}`,
              }}
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              {icon}
            </motion.div>
          </div>
        )}

        {change !== undefined && (
          <motion.div
            className={cn(
              'relative flex items-center gap-1 overflow-hidden rounded-full px-2.5 py-1 text-sm font-semibold',
              trendColors[trend],
            )}
            style={{ background: trendBgColors[trend] }}
            whileHover={{ scale: 1.08 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            {/* Shine sweep on hover */}
            <motion.div
              className="absolute inset-0 -translate-x-full"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
              }}
              animate={isHovered ? { translateX: '200%' } : {}}
              transition={{ duration: 0.6 }}
            />
            <motion.span
              animate={
                trend === 'up' ? { y: [0, -2, 0] } : trend === 'down' ? { y: [0, 2, 0] } : {}
              }
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {trendIcons[trend]}
            </motion.span>
            <span>{Math.abs(change)}%</span>
          </motion.div>
        )}
      </div>

      {/* Value with counter animation */}
      <div className="relative mb-2">
        {/* Value glow on hover */}
        <motion.div
          className="absolute -inset-2 rounded-lg opacity-0"
          style={{
            background: `radial-gradient(ellipse at center, ${colorConfig.glow}40, transparent 70%)`,
          }}
          animate={{ opacity: isHovered ? 0.6 : 0 }}
          transition={{ duration: 0.3 }}
        />
        <motion.span
          className="relative text-3xl font-bold"
          style={{
            background: `linear-gradient(135deg, #FFFFFF 0%, ${colorConfig.light} 50%, #FFFFFF 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: isHovered ? `0 0 30px ${colorConfig.glow}` : 'none',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {prefix}
          {typeof value === 'number' ? value.toLocaleString() : value}
          {suffix}
        </motion.span>
      </div>

      {/* Label with subtle underline animation */}
      <div className="relative">
        <p className="text-sm font-medium text-white/60 transition-colors group-hover:text-white/80">
          {label}
        </p>
        <motion.div
          className="absolute -bottom-1 left-0 h-px"
          style={{ background: `linear-gradient(90deg, ${colorConfig.primary}, transparent)` }}
          initial={{ width: 0 }}
          animate={{ width: isHovered ? '50%' : 0 }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Sparkline */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="relative mt-4 h-12">
          <svg className="h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`sparkline-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={colorConfig.primary} stopOpacity="0.6" />
                <stop offset="100%" stopColor={colorConfig.primary} stopOpacity="0" />
              </linearGradient>
              <filter id={`glow-${color}`}>
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d={generateSparklinePath(sparklineData)}
              fill="none"
              stroke={colorConfig.primary}
              strokeWidth="2.5"
              strokeLinecap="round"
              filter={`url(#glow-${color})`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />
            <motion.path
              d={generateSparklineAreaPath(sparklineData)}
              fill={`url(#sparkline-${color})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 }}
            />
            {/* Animated end dot */}
            <motion.circle
              cx="100"
              cy={(() => {
                const lastValue = sparklineData[sparklineData.length - 1] ?? 0
                const minVal = Math.min(...sparklineData)
                const maxVal = Math.max(...sparklineData)
                const range = maxVal - minVal || 1
                return 40 - ((lastValue - minVal) / range) * 35
              })()}
              r="4"
              fill={colorConfig.light}
              filter={`url(#glow-${color})`}
              initial={{ scale: 0 }}
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            />
          </svg>
        </div>
      )}
    </AuroraGlassCard>
  )
}

// Helper functions for sparkline
function generateSparklinePath(data: number[]): string {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const step = 100 / (data.length - 1)

  return data
    .map((value, i) => {
      const x = i * step
      const y = 40 - ((value - min) / range) * 35
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

function generateSparklineAreaPath(data: number[]): string {
  const linePath = generateSparklinePath(data)
  const lastX = 100
  return `${linePath} L ${lastX} 40 L 0 40 Z`
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 AURORA BUTTON — Premium Interactive Button
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface AuroraButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'glow'
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function AuroraButton({
  children,
  onClick,
  variant = 'primary',
  color = 'violet',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  className,
}: AuroraButtonProps) {
  const colorConfig = AURORA_COLORS[color]
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([])

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  }

  const variantStyles = {
    primary: `bg-gradient-to-r from-${color === 'violet' ? 'violet-600' : color === 'cyan' ? 'cyan-600' : color === 'magenta' ? 'pink-600' : color === 'emerald' ? 'emerald-600' : 'amber-600'} to-${color === 'violet' ? 'purple-600' : color === 'cyan' ? 'blue-600' : color === 'magenta' ? 'rose-600' : color === 'emerald' ? 'teal-600' : 'yellow-600'} text-white`,
    secondary: 'bg-white/10 text-white border border-white/20',
    ghost: 'bg-transparent text-white/80 hover:text-white hover:bg-white/5',
    glow: 'bg-transparent border-2 text-white',
  }

  // Ripple effect handler
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return

    const button = e.currentTarget
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples((prev) => [...prev, { x, y, id }])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 600)

    onClick?.()
  }

  return (
    <motion.button
      onClick={handleClick}
      disabled={disabled || loading}
      className={cn(
        'transition-spring relative overflow-hidden rounded-xl font-medium hover:scale-105',
        'flex items-center justify-center gap-2',
        sizeStyles[size],
        variantStyles[variant],
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
      style={{
        borderColor: variant === 'glow' ? colorConfig.primary : undefined,
        boxShadow: variant === 'glow' ? `0 0 20px ${colorConfig.glow}` : undefined,
      }}
      whileHover={{
        scale: disabled ? 1 : 1.03,
        boxShadow: disabled ? undefined : `0 8px 30px ${colorConfig.glow}`,
      }}
      whileTap={{ scale: disabled ? 1 : 0.97 }}
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
        whileHover={{
          opacity: 1,
          transform: 'translateX(100%)',
          transition: { duration: 0.5 },
        }}
      />

      {/* Loading spinner with glow */}
      {loading && (
        <motion.div
          className="relative h-4 w-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <div
            className="absolute inset-0 rounded-full border-2 border-white/30 border-t-white"
            style={{ boxShadow: `0 0 10px ${colorConfig.light}` }}
          />
        </motion.div>
      )}

      {/* Icon + Text */}
      {!loading && icon && iconPosition === 'left' && (
        <motion.span
          className="relative z-10"
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          {icon}
        </motion.span>
      )}
      <span className="relative z-10">{children}</span>
      {!loading && icon && iconPosition === 'right' && (
        <motion.span
          className="relative z-10"
          whileHover={{ scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          {icon}
        </motion.span>
      )}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 AURORA PROGRESS — Animated Progress Bar
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraProgressProps {
  value: number
  max?: number
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

export function AuroraProgress({
  value,
  max = 100,
  color = 'violet',
  label,
  showValue = true,
  size = 'md',
  animated = true,
  className,
}: AuroraProgressProps) {
  const colorConfig = AURORA_COLORS[color]
  const percentage = Math.min((value / max) * 100, 100)

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-2 flex items-center justify-between">
          {label && <span className="text-sm text-white/70">{label}</span>}
          {showValue && (
            <span className="text-sm font-medium text-white">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={cn('relative overflow-hidden rounded-full bg-white/10', heights[size])}>
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${colorConfig.dark}, ${colorConfig.primary}, ${colorConfig.light})`,
            boxShadow: `0 0 10px ${colorConfig.glow}`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 1 : 0, ease: 'easeOut' }}
        >
          {/* Shimmer */}
          {animated && (
            <motion.div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🏷️ AURORA BADGE — Status Indicator
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraBadgeProps {
  children: ReactNode
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  variant?: 'solid' | 'outline' | 'glow'
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
  className?: string
}

export function AuroraBadge({
  children,
  color = 'violet',
  variant = 'solid',
  size = 'md',
  pulse = false,
  className,
}: AuroraBadgeProps) {
  const colorConfig = AURORA_COLORS[color]

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const variantStyles = {
    solid: {
      background: `linear-gradient(135deg, ${colorConfig.dark}, ${colorConfig.primary}, ${colorConfig.light})`,
      color: 'white',
      boxShadow: `0 2px 8px ${colorConfig.aurora}, inset 0 1px 0 rgba(255,255,255,0.2)`,
    },
    outline: {
      background: `linear-gradient(135deg, ${colorConfig.aurora}, transparent)`,
      border: `1px solid ${colorConfig.primary}`,
      color: colorConfig.light,
    },
    glow: {
      background: `linear-gradient(135deg, ${colorConfig.aurora}, ${colorConfig.glow})`,
      color: 'white',
      boxShadow: `0 0 20px ${colorConfig.glow}, 0 0 40px ${colorConfig.aurora}`,
    },
  }

  return (
    <motion.span
      className={cn(
        'relative inline-flex items-center overflow-hidden rounded-full font-semibold',
        sizeStyles[size],
        className,
      )}
      style={variantStyles[variant]}
      animate={pulse ? { scale: [1, 1.05, 1] } : undefined}
      transition={pulse ? { duration: 2, repeat: Infinity } : undefined}
      whileHover={{ scale: 1.05, y: -1 }}
    >
      {/* Shine sweep */}
      <motion.span
        className="absolute inset-0 opacity-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        }}
        whileHover={{
          opacity: 1,
          x: ['0%', '200%'],
          transition: { duration: 0.6 },
        }}
      />
      {pulse && (
        <span
          className="relative mr-1.5 h-2 w-2 rounded-full"
          style={{
            background: variant === 'outline' ? colorConfig.primary : 'white',
            boxShadow: `0 0 8px ${variant === 'outline' ? colorConfig.primary : 'white'}`,
            animation: 'pulse 2s infinite',
          }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </motion.span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔄 AURORA TABS — Premium Tab Navigation
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraTabsProps {
  tabs: { id: string; label: string; icon?: ReactNode }[]
  activeTab: string
  onTabChange: (tabId: string) => void
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  variant?: 'pills' | 'underline' | 'glass'
  className?: string
}

export function AuroraTabs({
  tabs,
  activeTab,
  onTabChange,
  color = 'violet',
  variant = 'glass',
  className,
}: AuroraTabsProps) {
  const colorConfig = AURORA_COLORS[color]

  return (
    <div
      className={cn(
        'inline-flex gap-1 rounded-xl p-1',
        variant === 'glass' && 'border border-white/10 bg-white/5 backdrop-blur-xl',
        className,
      )}
    >
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'relative rounded-lg px-4 py-2 font-medium transition-colors',
            'flex items-center gap-2',
            activeTab === tab.id ? 'text-white' : 'text-white/50 hover:text-white/80',
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {activeTab === tab.id && (
            <motion.div
              className="absolute inset-0 rounded-lg"
              layoutId="activeTab"
              style={{
                background: `linear-gradient(135deg, ${colorConfig.aurora}, ${colorConfig.glow})`,
                boxShadow: `0 0 20px ${colorConfig.glow}`,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
          </span>
        </motion.button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔍 AURORA SEARCH — Premium Search Input
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraSearchProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  className?: string
}

export function AuroraSearch({
  value,
  onChange,
  placeholder = 'Buscar...',
  color = 'violet',
  className,
}: AuroraSearchProps) {
  const [isFocused, setIsFocused] = useState(false)
  const colorConfig = AURORA_COLORS[color]

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl',
        'border border-white/10 bg-white/5 backdrop-blur-xl',
        className,
      )}
      animate={{
        borderColor: isFocused ? colorConfig.glow : 'rgba(255,255,255,0.1)',
        boxShadow: isFocused ? `0 0 20px ${colorConfig.aurora}` : 'none',
      }}
    >
      <div className="flex items-center gap-3 px-4">
        <svg
          className="h-5 w-5 text-white/50"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent py-3 text-white placeholder-white/40 outline-none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => onChange('')}
            className="text-white/50 hover:text-white"
          >
            ✕
          </motion.button>
        )}
      </div>
    </motion.div>
  )
}

export { AURORA_COLORS as AuroraColors }
