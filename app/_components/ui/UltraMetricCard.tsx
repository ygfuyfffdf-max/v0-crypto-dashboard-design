'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 💎 CHRONOS INFINITY 2030 — ULTRA PREMIUM METRICS CARD
// ═══════════════════════════════════════════════════════════════════════════════════════
// Tarjeta de métricas con:
// - Canvas 2D animado a 60fps con gráfico de área
// - Glassmorphism Gen 5 con múltiples capas
// - Tilt 3D con parallax interno
// - Contador animado con spring physics
// - Micro-interacciones y ripples
// - Indicadores de tendencia con partículas
// Paleta: #8B00FF / #FFD700 / #FF1493 (CYAN PROHIBIDO)
// ═══════════════════════════════════════════════════════════════════════════════════════

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type MetricVariant =
  | 'violet'
  | 'gold'
  | 'pink'
  | 'success'
  | 'error'
  | 'neutral'
  | 'warning'
  | 'danger'

interface UltraMetricCardProps {
  title: string
  value: number
  previousValue?: number
  format?: 'currency' | 'number' | 'percent' | 'compact'
  prefix?: string
  suffix?: string
  subtitle?: string
  icon?: React.ReactNode
  variant?: MetricVariant
  sparklineData?: number[]
  trend?: { value: number; label?: string }
  target?: { value: number; label?: string }
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VARIANT CONFIGS
// ═══════════════════════════════════════════════════════════════════════════════════════

const VARIANTS: Record<
  MetricVariant,
  {
    primary: string
    secondary: string
    glow: string
    gradient: string
    border: string
  }
> = {
  violet: {
    primary: '#8B00FF',
    secondary: '#BB86FC',
    glow: 'rgba(139, 0, 255, 0.4)',
    gradient: 'from-violet-900/40 via-purple-900/30 to-indigo-900/20',
    border: 'border-violet-500/30',
  },
  gold: {
    primary: '#FFD700',
    secondary: '#FFA500',
    glow: 'rgba(255, 215, 0, 0.4)',
    gradient: 'from-yellow-900/40 via-amber-900/30 to-orange-900/20',
    border: 'border-yellow-500/30',
  },
  pink: {
    primary: '#FF1493',
    secondary: '#FF69B4',
    glow: 'rgba(255, 20, 147, 0.4)',
    gradient: 'from-pink-900/40 via-rose-900/30 to-fuchsia-900/20',
    border: 'border-pink-500/30',
  },
  success: {
    primary: '#00FF87',
    secondary: '#22C55E',
    glow: 'rgba(0, 255, 135, 0.4)',
    gradient: 'from-green-900/40 via-emerald-900/30 to-emerald-900/20',
    border: 'border-green-500/30',
  },
  error: {
    primary: '#FF3366',
    secondary: '#EF4444',
    glow: 'rgba(255, 51, 102, 0.4)',
    gradient: 'from-red-900/40 via-rose-900/30 to-pink-900/20',
    border: 'border-red-500/30',
  },
  warning: {
    primary: '#FFA500',
    secondary: '#FF8C00',
    glow: 'rgba(255, 165, 0, 0.4)',
    gradient: 'from-orange-900/40 via-amber-900/30 to-yellow-900/20',
    border: 'border-orange-500/30',
  },
  danger: {
    primary: '#FF3366',
    secondary: '#DC2626',
    glow: 'rgba(255, 51, 102, 0.5)',
    gradient: 'from-red-900/50 via-rose-900/40 to-pink-900/30',
    border: 'border-red-500/40',
  },
  neutral: {
    primary: '#A78BFA',
    secondary: '#8B5CF6',
    glow: 'rgba(167, 139, 250, 0.4)',
    gradient: 'from-slate-800/40 via-gray-800/30 to-zinc-800/20',
    border: 'border-white/10',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATED CANVAS SPARKLINE
// ═══════════════════════════════════════════════════════════════════════════════════════

interface CanvasSparklineProps {
  data: number[]
  color: string
  secondaryColor: string
  width: number
  height: number
}

function CanvasSparkline({ data, color, secondaryColor, width, height }: CanvasSparklineProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const progressRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const padding = 4

    const animate = () => {
      progressRef.current = Math.min(progressRef.current + 0.03, 1)
      const progress = progressRef.current

      ctx.clearRect(0, 0, width, height)

      // Calculate points
      const points: { x: number; y: number }[] = data.map((value, i) => ({
        x: padding + (i / (data.length - 1)) * (width - padding * 2),
        y: padding + (1 - (value - min) / range) * (height - padding * 2),
      }))

      // Draw gradient fill
      const gradient = ctx.createLinearGradient(0, 0, 0, height)
      gradient.addColorStop(0, `${color}40`)
      gradient.addColorStop(1, `${color}00`)

      ctx.beginPath()
      const firstPoint = points[0]
      if (firstPoint) {
        ctx.moveTo(firstPoint.x, height)
      }

      const visiblePoints = Math.floor(points.length * progress)
      for (let i = 0; i <= visiblePoints && i < points.length; i++) {
        const currentPoint = points[i]
        const prevPoint = points[i - 1]

        if (!currentPoint) continue

        if (i === 0) {
          ctx.lineTo(currentPoint.x, currentPoint.y)
        } else if (prevPoint) {
          // Smooth curve
          const xc = (prevPoint.x + currentPoint.x) / 2
          const yc = (prevPoint.y + currentPoint.y) / 2
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, xc, yc)
        }
      }

      const visiblePoint = points[visiblePoints]
      if (visiblePoints > 0 && visiblePoints < points.length && visiblePoint) {
        ctx.lineTo(visiblePoint.x, height)
      } else if (visiblePoints >= points.length) {
        const lastPoint = points[points.length - 1]
        if (lastPoint) {
          ctx.lineTo(lastPoint.x, height)
        }
      }

      ctx.closePath()
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw line
      ctx.beginPath()
      for (let i = 0; i <= visiblePoints && i < points.length; i++) {
        const currentPoint = points[i]
        const prevPoint = points[i - 1]

        if (!currentPoint) continue

        if (i === 0) {
          ctx.moveTo(currentPoint.x, currentPoint.y)
        } else if (prevPoint) {
          const xc = (prevPoint.x + currentPoint.x) / 2
          const yc = (prevPoint.y + currentPoint.y) / 2
          ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, xc, yc)
        }
      }

      const lineGradient = ctx.createLinearGradient(0, 0, width, 0)
      lineGradient.addColorStop(0, secondaryColor)
      lineGradient.addColorStop(1, color)

      ctx.strokeStyle = lineGradient
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()

      // Draw glow on last visible point
      if (visiblePoints > 0 && visiblePoints <= points.length) {
        const lastPoint = points[Math.min(visiblePoints, points.length - 1)]

        if (lastPoint) {
          // Outer glow
          const glowGradient = ctx.createRadialGradient(
            lastPoint.x,
            lastPoint.y,
            0,
            lastPoint.x,
            lastPoint.y,
            8,
          )
          glowGradient.addColorStop(0, `${color}80`)
          glowGradient.addColorStop(1, `${color}00`)

          ctx.beginPath()
          ctx.arc(lastPoint.x, lastPoint.y, 8, 0, Math.PI * 2)
          ctx.fillStyle = glowGradient
          ctx.fill()

          // Inner dot
          ctx.beginPath()
          ctx.arc(lastPoint.x, lastPoint.y, 3, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    progressRef.current = 0
    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [data, color, secondaryColor, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute right-0 bottom-0 left-0"
      style={{ width, height }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATED COUNTER
// ═══════════════════════════════════════════════════════════════════════════════════════

interface AnimatedCounterProps {
  value: number
  format: 'currency' | 'number' | 'percent' | 'compact'
  prefix?: string
  suffix?: string
  color: string
}

function AnimatedCounter({ value, format, prefix = '', suffix = '', color }: AnimatedCounterProps) {
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { stiffness: 100, damping: 30 })
  const [displayValue, setDisplayValue] = useState('0')

  useEffect(() => {
    motionValue.set(value)
  }, [value, motionValue])

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      let formatted: string

      switch (format) {
        case 'currency':
          if (latest >= 1000000) {
            formatted = `$${(latest / 1000000).toFixed(2)}M`
          } else if (latest >= 1000) {
            formatted = `$${(latest / 1000).toFixed(1)}K`
          } else {
            formatted = `$${latest.toFixed(0)}`
          }
          break
        case 'percent':
          formatted = `${latest.toFixed(1)}%`
          break
        case 'compact':
          if (latest >= 1000000) {
            formatted = `${(latest / 1000000).toFixed(1)}M`
          } else if (latest >= 1000) {
            formatted = `${(latest / 1000).toFixed(1)}K`
          } else {
            formatted = latest.toFixed(0)
          }
          break
        default:
          formatted = latest.toFixed(0)
      }

      setDisplayValue(formatted)
    })

    return () => unsubscribe()
  }, [springValue, format])

  return (
    <span
      className="font-bold tracking-tight"
      style={{
        color,
        textShadow: `0 0 20px ${color}50`,
      }}
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TREND INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════════════

function TrendIndicator({ value, label }: { value: number; label?: string }) {
  const isPositive = value >= 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
        isPositive
          ? 'border border-green-500/30 bg-green-500/20 text-green-400'
          : 'border border-red-500/30 bg-red-500/20 text-red-400'
      } `}
    >
      <motion.span
        animate={{ y: isPositive ? [0, -2, 0] : [0, 2, 0] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
      >
        {isPositive ? '↑' : '↓'}
      </motion.span>
      <span>{Math.abs(value).toFixed(1)}%</span>
      {label && <span className="ml-1 text-white/40">{label}</span>}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════════════════

function ProgressBar({
  current,
  target,
  color,
}: {
  current: number
  target: number
  color: string
}) {
  const percentage = Math.min((current / target) * 100, 100)

  return (
    <div className="relative h-1.5 overflow-hidden rounded-full bg-white/10">
      <motion.div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
        initial={{ width: '0%' }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
      <motion.div
        className="absolute inset-y-0 rounded-full"
        style={{
          width: '20px',
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
        animate={{
          left: ['0%', `${percentage}%`],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export function UltraMetricCard({
  title,
  value,
  previousValue,
  format = 'number',
  prefix,
  suffix,
  subtitle,
  icon,
  variant = 'violet',
  sparklineData,
  trend,
  target,
  onClick,
  className = '',
  size = 'md',
}: UltraMetricCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  const styles = VARIANTS[variant]

  // Tilt effect
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const scale = useMotionValue(1)

  const springRotateX = useSpring(rotateX, { stiffness: 300, damping: 30 })
  const springRotateY = useSpring(rotateY, { stiffness: 300, damping: 30 })
  const springScale = useSpring(scale, { stiffness: 300, damping: 30 })

  // Glare effect
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)
  const springGlareX = useSpring(glareX, { stiffness: 200, damping: 25 })
  const springGlareY = useSpring(glareY, { stiffness: 200, damping: 25 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height

      rotateX.set((y - 0.5) * -8)
      rotateY.set((x - 0.5) * 8)
      glareX.set(x * 100)
      glareY.set(y * 100)
      scale.set(1.02)
    },
    [rotateX, rotateY, glareX, glareY, scale],
  )

  const handleMouseLeave = useCallback(() => {
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
    glareX.set(50)
    glareY.set(50)
    setIsHovered(false)
  }, [rotateX, rotateY, scale, glareX, glareY])

  // Auto-calculate trend if previousValue is provided
  const calculatedTrend = useMemo(() => {
    if (trend) return trend
    if (previousValue && previousValue !== 0) {
      return { value: ((value - previousValue) / previousValue) * 100 }
    }
    return undefined
  }, [trend, value, previousValue])

  // Size classes
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const valueSizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }

  const sparklineHeight = size === 'sm' ? 40 : size === 'md' ? 60 : 80

  return (
    <motion.div
      ref={ref}
      className={`relative cursor-pointer overflow-hidden rounded-2xl ${sizeClasses[size]} ${className} `}
      style={{
        rotateX: springRotateX,
        rotateY: springRotateY,
        scale: springScale,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Multi-layer background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient}`} />
      <div
        className="absolute inset-0"
        style={{
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
        }}
      />

      {/* Border glow */}
      <div
        className={`absolute inset-0 rounded-2xl border ${styles.border}`}
        style={{
          boxShadow: isHovered
            ? `0 0 30px ${styles.glow}, inset 0 0 20px ${styles.glow}`
            : `0 0 15px ${styles.glow}`,
          transition: 'box-shadow 0.3s ease',
        }}
      />

      {/* Animated border light */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
          >
            <motion.div
              className="absolute h-24 w-24"
              style={{
                background: `radial-gradient(circle, ${styles.primary} 0%, transparent 70%)`,
                filter: 'blur(10px)',
              }}
              animate={{
                left: ['0%', '100%', '100%', '0%', '0%'],
                top: ['0%', '0%', '100%', '100%', '0%'],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glare effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background: useTransform(
            [springGlareX, springGlareY],
            ([x, y]) =>
              `radial-gradient(circle at ${x}% ${y}%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)`,
          ),
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div
                className="rounded-xl p-2.5"
                style={{
                  background: `${styles.primary}20`,
                  border: `1px solid ${styles.primary}30`,
                }}
              >
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-white/80">{title}</h3>
              {subtitle && <p className="mt-0.5 text-xs text-white/40">{subtitle}</p>}
            </div>
          </div>

          {calculatedTrend && (
            <TrendIndicator value={calculatedTrend.value} label={calculatedTrend.label} />
          )}
        </div>

        {/* Value */}
        <div className={`${valueSizeClasses[size]} mb-4`}>
          <AnimatedCounter
            value={value}
            format={format}
            prefix={prefix}
            suffix={suffix}
            color={styles.primary}
          />
        </div>

        {/* Target progress */}
        {target && (
          <div className="mb-4">
            <div className="mb-2 flex justify-between text-xs text-white/50">
              <span>Progreso hacia meta</span>
              <span>{Math.round((value / target.value) * 100)}%</span>
            </div>
            <ProgressBar current={value} target={target.value} color={styles.primary} />
            {target.label && <p className="mt-1 text-xs text-white/40">Meta: {target.label}</p>}
          </div>
        )}
      </div>

      {/* Sparkline chart */}
      {sparklineData && sparklineData.length > 0 && (
        <div className="absolute right-0 bottom-0 left-0 opacity-80">
          <CanvasSparkline
            data={sparklineData}
            color={styles.primary}
            secondaryColor={styles.secondary}
            width={ref.current?.offsetWidth || 300}
            height={sparklineHeight}
          />
        </div>
      )}

      {/* Decorative elements */}
      <div
        className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full blur-3xl"
        style={{ background: `${styles.primary}15` }}
      />
      <div
        className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 rounded-full blur-2xl"
        style={{ background: `${styles.secondary}10` }}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PRESET VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export function RevenueMetricCard(props: Omit<UltraMetricCardProps, 'variant' | 'format'>) {
  return <UltraMetricCard variant="gold" format="currency" {...props} />
}

export function ExpenseMetricCard(props: Omit<UltraMetricCardProps, 'variant' | 'format'>) {
  return <UltraMetricCard variant="pink" format="currency" {...props} />
}

export function GrowthMetricCard(props: Omit<UltraMetricCardProps, 'variant' | 'format'>) {
  return <UltraMetricCard variant="success" format="percent" {...props} />
}

export function CountMetricCard(props: Omit<UltraMetricCardProps, 'variant' | 'format'>) {
  return <UltraMetricCard variant="violet" format="compact" {...props} />
}

export default UltraMetricCard
