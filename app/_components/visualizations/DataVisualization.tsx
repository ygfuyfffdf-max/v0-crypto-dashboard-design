/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS INFINITY 2030 — COMPONENTES DE VISUALIZACIÓN DE DATOS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Componentes de visualización ultra-premium con:
 * - Gráficos animados con Motion
 * - KPI Cards con animación de números
 * - Progress bars premium
 * - Sparklines
 * - Gauge charts
 * - Mini charts para tablas
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { motion, useReducedMotion, useSpring } from 'motion/react'
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATED NUMBER — Número con animación de conteo
// ═══════════════════════════════════════════════════════════════════════════════════════

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
  formatOptions?: Intl.NumberFormatOptions
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1000,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
  formatOptions,
}) => {
  const prefersReducedMotion = useReducedMotion()
  const [displayValue, setDisplayValue] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value)
      return
    }

    const startValue = prevValue.current
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startValue + (value - startValue) * eased
      
      setDisplayValue(current)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        prevValue.current = value
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration, prefersReducedMotion])

  const formatted = useMemo(() => {
    const options: Intl.NumberFormatOptions = formatOptions || {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }
    return new Intl.NumberFormat('es-MX', options).format(displayValue)
  }, [displayValue, decimals, formatOptions])

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// KPI CARD — Tarjeta de KPI premium
// ═══════════════════════════════════════════════════════════════════════════════════════

interface KPICardProps {
  title: string
  value: number
  previousValue?: number
  prefix?: string
  suffix?: string
  decimals?: number
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendLabel?: string
  sparklineData?: number[]
  loading?: boolean
  onClick?: () => void
  className?: string
  variant?: 'default' | 'compact' | 'large'
  color?: 'violet' | 'gold' | 'emerald' | 'rose' | 'blue'
}

const colorVariants = {
  violet: {
    gradient: 'from-violet-500/20 to-purple-500/10',
    icon: 'bg-violet-500/20 text-violet-400',
    trend: { up: 'text-emerald-400', down: 'text-red-400', neutral: 'text-white/50' },
  },
  gold: {
    gradient: 'from-amber-500/20 to-yellow-500/10',
    icon: 'bg-amber-500/20 text-amber-400',
    trend: { up: 'text-emerald-400', down: 'text-red-400', neutral: 'text-white/50' },
  },
  emerald: {
    gradient: 'from-emerald-500/20 to-green-500/10',
    icon: 'bg-emerald-500/20 text-emerald-400',
    trend: { up: 'text-emerald-400', down: 'text-red-400', neutral: 'text-white/50' },
  },
  rose: {
    gradient: 'from-rose-500/20 to-pink-500/10',
    icon: 'bg-rose-500/20 text-rose-400',
    trend: { up: 'text-emerald-400', down: 'text-red-400', neutral: 'text-white/50' },
  },
  blue: {
    gradient: 'from-blue-500/20 to-cyan-500/10',
    icon: 'bg-blue-500/20 text-blue-400',
    trend: { up: 'text-emerald-400', down: 'text-red-400', neutral: 'text-white/50' },
  },
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  previousValue,
  prefix = '',
  suffix = '',
  decimals = 0,
  icon,
  trend,
  trendLabel,
  sparklineData,
  loading = false,
  onClick,
  className,
  variant = 'default',
  color = 'violet',
}) => {
  const prefersReducedMotion = useReducedMotion()
  const colors = colorVariants[color]

  // Calcular cambio porcentual
  const percentChange = useMemo(() => {
    if (previousValue === undefined || previousValue === 0) return null
    return ((value - previousValue) / previousValue) * 100
  }, [value, previousValue])

  const calculatedTrend = trend || (percentChange !== null
    ? percentChange > 0 ? 'up' : percentChange < 0 ? 'down' : 'neutral'
    : 'neutral')

  const trendIcon = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  const variantStyles = {
    default: 'p-5',
    compact: 'p-3',
    large: 'p-6',
  }

  const valueStyles = {
    default: 'text-2xl sm:text-3xl',
    compact: 'text-xl',
    large: 'text-3xl sm:text-4xl',
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl',
        'bg-white/[0.03] border border-white/[0.08]',
        'backdrop-blur-xl',
        onClick && 'cursor-pointer',
        variantStyles[variant],
        className
      )}
      onClick={onClick}
      whileHover={onClick && !prefersReducedMotion ? { 
        scale: 1.02, 
        y: -2,
        borderColor: 'rgba(255, 255, 255, 0.15)',
      } : {}}
      whileTap={onClick && !prefersReducedMotion ? { scale: 0.99 } : {}}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {/* Background gradient */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-50',
        colors.gradient
      )} />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-white/60">{title}</p>
          {icon && (
            <div className={cn('p-2 rounded-xl', colors.icon)}>
              {icon}
            </div>
          )}
        </div>

        {loading ? (
          <div className={cn('h-8 w-32 bg-white/10 rounded animate-pulse', valueStyles[variant])} />
        ) : (
          <p className={cn('font-bold text-white tracking-tight', valueStyles[variant])}>
            <AnimatedNumber
              value={value}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
            />
          </p>
        )}

        {/* Trend indicator */}
        {(percentChange !== null || trendLabel) && (
          <div className="flex items-center gap-2 mt-2">
            {percentChange !== null && (
              <span className={cn('text-sm font-medium', colors.trend[calculatedTrend])}>
                {trendIcon[calculatedTrend]} {Math.abs(percentChange).toFixed(1)}%
              </span>
            )}
            {trendLabel && (
              <span className="text-xs text-white/40">{trendLabel}</span>
            )}
          </div>
        )}

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-3">
            <Sparkline data={sparklineData} color={color} height={40} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SPARKLINE — Mini gráfico de línea
// ═══════════════════════════════════════════════════════════════════════════════════════

interface SparklineProps {
  data: number[]
  color?: 'violet' | 'gold' | 'emerald' | 'rose' | 'blue'
  height?: number
  showArea?: boolean
  className?: string
}

const sparklineColors = {
  violet: { stroke: '#8B5CF6', fill: 'rgba(139, 92, 246, 0.2)' },
  gold: { stroke: '#F59E0B', fill: 'rgba(245, 158, 11, 0.2)' },
  emerald: { stroke: '#10B981', fill: 'rgba(16, 185, 129, 0.2)' },
  rose: { stroke: '#F43F5E', fill: 'rgba(244, 63, 94, 0.2)' },
  blue: { stroke: '#3B82F6', fill: 'rgba(59, 130, 246, 0.2)' },
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  color = 'violet',
  height = 40,
  showArea = true,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion()
  const colors = sparklineColors[color]

  const { path, areaPath, viewBox } = useMemo(() => {
    if (data.length < 2) return { path: '', areaPath: '', viewBox: '0 0 100 40' }

    const width = 100
    const padding = 2
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2)
      const y = height - padding - ((value - min) / range) * (height - padding * 2)
      return { x, y }
    })

    const pathD = points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ')

    const areaPathD = `${pathD} L ${points.at(-1)?.x ?? 0} ${height - padding} L ${points[0]?.x ?? 0} ${height - padding} Z`

    return {
      path: pathD,
      areaPath: areaPathD,
      viewBox: `0 0 ${width} ${height}`,
    }
  }, [data, height])

  if (data.length < 2) return null

  return (
    <svg
      viewBox={viewBox}
      className={cn('w-full', className)}
      style={{ height }}
      preserveAspectRatio="none"
    >
      {/* Area fill */}
      {showArea && (
        <motion.path
          d={areaPath}
          fill={colors.fill}
          initial={!prefersReducedMotion ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      )}

      {/* Line */}
      <motion.path
        d={path}
        fill="none"
        stroke={colors.stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={!prefersReducedMotion ? { pathLength: 0, opacity: 0 } : { pathLength: 1, opacity: 1 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR — Barra de progreso premium
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'violet' | 'gold' | 'emerald' | 'rose' | 'blue' | 'gradient'
  animated?: boolean
  className?: string
}

const progressColors = {
  violet: 'bg-violet-500',
  gold: 'bg-amber-500',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  blue: 'bg-blue-500',
  gradient: 'bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500',
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  color = 'violet',
  animated = true,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion()
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="text-white/70">{label}</span>}
          {showValue && <span className="text-white/50">{percentage.toFixed(0)}%</span>}
        </div>
      )}

      <div className={cn('w-full bg-white/10 rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          className={cn('h-full rounded-full', progressColors[color])}
          initial={!prefersReducedMotion && animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CIRCULAR PROGRESS — Progreso circular / Gauge
// ═══════════════════════════════════════════════════════════════════════════════════════

interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  label?: string
  showValue?: boolean
  color?: 'violet' | 'gold' | 'emerald' | 'rose' | 'blue'
  className?: string
}

const circularColors = {
  violet: '#8B5CF6',
  gold: '#F59E0B',
  emerald: '#10B981',
  rose: '#F43F5E',
  blue: '#3B82F6',
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  label,
  showValue = true,
  color = 'violet',
  className,
}) => {
  const prefersReducedMotion = useReducedMotion()
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const springConfig = { stiffness: 100, damping: 30 }
  const animatedOffset = useSpring(circumference, springConfig)

  useEffect(() => {
    if (!prefersReducedMotion) {
      animatedOffset.set(strokeDashoffset)
    }
  }, [strokeDashoffset, animatedOffset, prefersReducedMotion])

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/10"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={circularColors[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: prefersReducedMotion ? strokeDashoffset : animatedOffset }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span className="text-xl font-bold text-white">
            <AnimatedNumber value={percentage} suffix="%" decimals={0} />
          </span>
        )}
        {label && (
          <span className="text-xs text-white/50 mt-0.5">{label}</span>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// STAT COMPARISON — Comparación de estadísticas
// ═══════════════════════════════════════════════════════════════════════════════════════

interface StatComparisonProps {
  items: Array<{
    label: string
    value: number
    color?: string
  }>
  total?: number
  showPercentage?: boolean
  className?: string
}

export const StatComparison: React.FC<StatComparisonProps> = ({
  items,
  total,
  showPercentage = true,
  className,
}) => {
  const calculatedTotal = total ?? items.reduce((acc, item) => acc + item.value, 0)

  const defaultColors = [
    '#8B5CF6', // violet
    '#F59E0B', // amber
    '#10B981', // emerald
    '#3B82F6', // blue
    '#F43F5E', // rose
    '#6366F1', // indigo
  ]

  return (
    <div className={cn('space-y-3', className)}>
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-white/10">
        {items.map((item, index) => {
          const percentage = calculatedTotal > 0 ? (item.value / calculatedTotal) * 100 : 0
          return (
            <motion.div
              key={item.label}
              className="h-full"
              style={{ backgroundColor: item.color || defaultColors[index % defaultColors.length] }}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {items.map((item, index) => {
          const percentage = calculatedTotal > 0 ? (item.value / calculatedTotal) * 100 : 0
          return (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color || defaultColors[index % defaultColors.length] }}
              />
              <span className="text-sm text-white/70">{item.label}</span>
              {showPercentage && (
                <span className="text-sm text-white/40">
                  {percentage.toFixed(1)}%
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MINI BAR CHART — Chart compacto para tablas
// ═══════════════════════════════════════════════════════════════════════════════════════

interface MiniBarChartProps {
  data: number[]
  maxValue?: number
  height?: number
  color?: 'violet' | 'gold' | 'emerald' | 'rose' | 'blue'
  className?: string
}

export const MiniBarChart: React.FC<MiniBarChartProps> = ({
  data,
  maxValue,
  height = 32,
  color = 'violet',
  className,
}) => {
  const prefersReducedMotion = useReducedMotion()
  const max = maxValue ?? Math.max(...data)
  const barWidth = 100 / data.length

  return (
    <div 
      className={cn('flex items-end gap-0.5', className)}
      style={{ height }}
    >
      {data.map((value, index) => {
        const barHeight = max > 0 ? (value / max) * 100 : 0
        return (
          <motion.div
            key={index}
            className={cn('rounded-t', sparklineColors[color].stroke.replace('#', 'bg-[#') + ']')}
            style={{ 
              width: `${barWidth}%`,
              backgroundColor: sparklineColors[color].stroke,
            }}
            initial={!prefersReducedMotion ? { height: 0 } : { height: `${barHeight}%` }}
            animate={{ height: `${barHeight}%` }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
          />
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TREND INDICATOR — Indicador de tendencia
// ═══════════════════════════════════════════════════════════════════════════════════════

interface TrendIndicatorProps {
  value: number
  inverted?: boolean // true si valor negativo es bueno
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  value,
  inverted = false,
  showValue = true,
  size = 'md',
  className,
}) => {
  const isPositive = inverted ? value < 0 : value > 0
  const isNeutral = value === 0

  const colors = isNeutral
    ? 'text-white/50 bg-white/10'
    : isPositive
    ? 'text-emerald-400 bg-emerald-500/20'
    : 'text-red-400 bg-red-500/20'

  const sizes = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const icon = isNeutral ? '→' : isPositive ? '↑' : '↓'

  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full font-medium', colors, sizes[size], className)}>
      <span>{icon}</span>
      {showValue && <span>{Math.abs(value).toFixed(1)}%</span>}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export type {
    AnimatedNumberProps, CircularProgressProps, KPICardProps, MiniBarChartProps, ProgressBarProps, SparklineProps, StatComparisonProps, TrendIndicatorProps
}

