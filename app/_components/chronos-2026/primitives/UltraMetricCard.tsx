/**
 * 📊 ULTRA METRIC CARD COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * Tarjetas métricas premium con sparklines animados y valores animados
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/lib/utils'
import { motion, useSpring, useTransform } from 'motion/react'
import { Minus, TrendingDown, TrendingUp } from 'lucide-react'
import React, { useEffect, useMemo, useRef } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UltraMetricCardProps {
  title: string
  value: number
  previousValue?: number
  format?: 'currency' | 'number' | 'percentage'
  sparklineData?: number[]
  icon?: React.ReactNode
  color?: string
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// MINI SPARKLINE - Canvas-based sparkline
// ═══════════════════════════════════════════════════════════════════════════

export const MiniSparkline: React.FC<{
  data: number[]
  color?: string
  width?: number
  height?: number
  className?: string
}> = ({ data, color = '#10b981', width = 80, height = 32, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const padding = 2
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1

    ctx.clearRect(0, 0, width, height)

    // Draw gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, color + '40')
    gradient.addColorStop(1, 'transparent')

    ctx.beginPath()
    ctx.moveTo(padding, height)

    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = padding + (1 - (value - min) / range) * chartHeight

      if (index === 0) {
        ctx.lineTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.lineTo(padding + chartWidth, height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw line
    ctx.beginPath()
    data.forEach((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth
      const y = padding + (1 - (value - min) / range) * chartHeight

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()

    // Draw end dot
    const lastX = padding + chartWidth
    const lastDataValue = data[data.length - 1] ?? min
    const lastY = padding + (1 - (lastDataValue - min) / range) * chartHeight

    ctx.beginPath()
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2)
    ctx.fillStyle = color
    ctx.fill()
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1
    ctx.stroke()
  }, [data, color, width, height])

  return <canvas ref={canvasRef} style={{ width, height }} className={className} />
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED VALUE - Smooth counter animation
// ═══════════════════════════════════════════════════════════════════════════

export const AnimatedValue: React.FC<{
  value: number
  format?: 'currency' | 'number' | 'percentage'
  className?: string
}> = ({ value, format = 'number', className }) => {
  const springValue = useSpring(0, {
    stiffness: 100,
    damping: 30,
    mass: 1,
  })

  const displayValue = useTransform(springValue, (v) => {
    if (format === 'currency') {
      if (v >= 1000000) return `$${(v / 1000000).toFixed(1)}M`
      if (v >= 1000) return `$${(v / 1000).toFixed(0)}K`
      return `$${v.toFixed(0)}`
    }
    if (format === 'percentage') {
      return `${v.toFixed(1)}%`
    }
    return v.toFixed(0)
  })

  useEffect(() => {
    springValue.set(value)
  }, [value, springValue])

  return <motion.span className={className}>{displayValue}</motion.span>
}

// ═══════════════════════════════════════════════════════════════════════════
// ULTRA METRIC CARD
// ═══════════════════════════════════════════════════════════════════════════

export const UltraMetricCard: React.FC<UltraMetricCardProps> = ({
  title,
  value,
  previousValue,
  format = 'currency',
  sparklineData,
  icon,
  color = '#6366f1',
  trend: providedTrend,
  subtitle,
  className,
}) => {
  const trend = useMemo(() => {
    if (providedTrend) return providedTrend
    if (previousValue === undefined) return 'neutral'
    if (value > previousValue) return 'up'
    if (value < previousValue) return 'down'
    return 'neutral'
  }, [value, previousValue, providedTrend])

  const percentageChange = useMemo(() => {
    if (previousValue === undefined || previousValue === 0) return 0
    return ((value - previousValue) / previousValue) * 100
  }, [value, previousValue])

  const trendColor = trend === 'up' ? '#10b981' : trend === 'down' ? '#ef4444' : '#6b7280'
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl p-5',
        'bg-gradient-to-br from-white/10 via-white/5 to-transparent',
        'border border-white/10 backdrop-blur-xl',
        'transition-all duration-300 hover:border-white/20',
        className,
      )}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Background glow */}
      <div
        className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: color }}
      />

      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: color + '20' }}
            >
              <div style={{ color }}>{icon}</div>
            </div>
          )}
          <div>
            <p className="text-sm text-white/60">{title}</p>
            {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
          </div>
        </div>

        {/* Trend badge */}
        <div
          className="flex items-center gap-1 rounded-lg px-2 py-1"
          style={{ backgroundColor: trendColor + '20' }}
        >
          <TrendIcon className="h-3 w-3" style={{ color: trendColor }} />
          <span className="text-xs font-medium" style={{ color: trendColor }}>
            {Math.abs(percentageChange).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Value */}
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-white">
          <AnimatedValue value={value} format={format} />
        </div>

        {/* Sparkline */}
        {sparklineData && sparklineData.length > 0 && (
          <MiniSparkline data={sparklineData} color={trendColor} width={80} height={32} />
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// PRESET METRIC CARDS
// ═══════════════════════════════════════════════════════════════════════════

export const RevenueMetricCard: React.FC<Omit<UltraMetricCardProps, 'color'>> = (props) => (
  <UltraMetricCard {...props} color="#10b981" />
)

export const ExpenseMetricCard: React.FC<Omit<UltraMetricCardProps, 'color'>> = (props) => (
  <UltraMetricCard {...props} color="#ef4444" />
)

export const ProfitMetricCard: React.FC<Omit<UltraMetricCardProps, 'color'>> = (props) => (
  <UltraMetricCard {...props} color="#6366f1" />
)

export default UltraMetricCard
