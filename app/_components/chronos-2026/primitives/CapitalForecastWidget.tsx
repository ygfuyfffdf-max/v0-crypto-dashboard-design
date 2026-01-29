/**
 * 📈 CAPITAL FORECAST WIDGET
 * ═══════════════════════════════════════════════════════════════════════════
 * Widget de predicción de capital con análisis de tendencia y Canvas
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/lib/utils'
import { motion, useSpring, useTransform } from 'motion/react'
import { ArrowRight, Calendar, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react'
import React, { useEffect, useMemo, useRef } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface CapitalForecastWidgetProps {
  currentCapital: number
  historicalData?: number[]
  forecastDays?: number
  targetCapital?: number
  className?: string
}

export interface ForecastResult {
  predictedValue: number
  trend: 'up' | 'down' | 'stable'
  confidence: number
  dailyChange: number
  projectedData: number[]
}

// ═══════════════════════════════════════════════════════════════════════════
// FORECAST CALCULATION
// ═══════════════════════════════════════════════════════════════════════════

function calculateForecast(historicalData: number[], forecastDays: number): ForecastResult {
  if (historicalData.length < 2) {
    return {
      predictedValue: historicalData[0] || 0,
      trend: 'stable',
      confidence: 0,
      dailyChange: 0,
      projectedData: [],
    }
  }

  // Linear regression
  const n = historicalData.length
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0

  for (let i = 0; i < n; i++) {
    const value = historicalData[i] ?? 0
    sumX += i
    sumY += value
    sumXY += i * value
    sumX2 += i * i
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Generate projections
  const projectedData: number[] = []
  for (let i = 0; i <= forecastDays; i++) {
    projectedData.push(intercept + slope * (n + i))
  }

  const predictedValue = projectedData[forecastDays] ?? intercept + slope * (n + forecastDays)
  const dailyChange = slope

  // Trend determination
  let trend: 'up' | 'down' | 'stable' = 'stable'
  const lastValue = historicalData[n - 1] ?? 1
  const percentChange = (dailyChange / lastValue) * 100
  if (percentChange > 0.5) trend = 'up'
  else if (percentChange < -0.5) trend = 'down'

  // Confidence based on R-squared
  const mean = sumY / n
  let ssTotal = 0,
    ssResidual = 0
  for (let i = 0; i < n; i++) {
    const value = historicalData[i] ?? 0
    const predicted = intercept + slope * i
    ssTotal += Math.pow(value - mean, 2)
    ssResidual += Math.pow(value - predicted, 2)
  }
  const rSquared = 1 - ssResidual / ssTotal
  const confidence = Math.max(0, Math.min(100, rSquared * 100))

  return {
    predictedValue,
    trend,
    confidence,
    dailyChange,
    projectedData,
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// FORECAST SPARKLINE
// ═══════════════════════════════════════════════════════════════════════════

const ForecastSparkline: React.FC<{
  historicalData: number[]
  projectedData: number[]
  width?: number
  height?: number
  className?: string
}> = ({ historicalData, projectedData, width = 200, height = 80, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const allData = [...historicalData, ...projectedData]
    const min = Math.min(...allData) * 0.95
    const max = Math.max(...allData) * 1.05
    const range = max - min || 1

    const padding = 4
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    ctx.clearRect(0, 0, width, height)

    // Draw historical line
    ctx.beginPath()
    ctx.strokeStyle = '#10b981'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    historicalData.forEach((value, i) => {
      const x = padding + (i / (allData.length - 1)) * chartWidth
      const y = padding + (1 - (value - min) / range) * chartHeight

      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Draw projected line (dashed)
    if (projectedData.length > 0) {
      ctx.beginPath()
      ctx.strokeStyle = '#6366f1'
      ctx.setLineDash([4, 4])
      ctx.lineWidth = 2

      projectedData.forEach((value, i) => {
        const dataIndex = historicalData.length + i
        const x = padding + (dataIndex / (allData.length - 1)) * chartWidth
        const y = padding + (1 - (value - min) / range) * chartHeight

        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.setLineDash([])

      // Draw transition point
      const transX = padding + ((historicalData.length - 1) / (allData.length - 1)) * chartWidth
      const lastHistorical = historicalData[historicalData.length - 1] ?? min
      const transY = padding + (1 - (lastHistorical - min) / range) * chartHeight

      ctx.beginPath()
      ctx.arc(transX, transY, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.fill()
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw end point
      const endValue = projectedData[projectedData.length - 1] ?? min
      const endX = padding + chartWidth
      const endY = padding + (1 - (endValue - min) / range) * chartHeight

      ctx.beginPath()
      ctx.arc(endX, endY, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#6366f1'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
    }

    // Gradient fill for historical
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.2)')
    gradient.addColorStop(1, 'transparent')

    ctx.beginPath()
    ctx.moveTo(padding, height)
    historicalData.forEach((value, i) => {
      const x = padding + (i / (allData.length - 1)) * chartWidth
      const y = padding + (1 - (value - min) / range) * chartHeight
      ctx.lineTo(x, y)
    })
    ctx.lineTo(padding + ((historicalData.length - 1) / (allData.length - 1)) * chartWidth, height)
    ctx.closePath()
    ctx.fillStyle = gradient
    ctx.fill()
  }, [historicalData, projectedData, width, height])

  return <canvas ref={canvasRef} style={{ width, height }} className={className} />
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED CURRENCY
// ═══════════════════════════════════════════════════════════════════════════

const AnimatedCurrency: React.FC<{
  value: number
  className?: string
}> = ({ value, className }) => {
  const springValue = useSpring(0, { stiffness: 50, damping: 20 })

  const displayValue = useTransform(springValue, (v) => {
    if (v >= 1000000) return `$${(v / 1000000).toFixed(2)}M`
    if (v >= 1000) return `$${(v / 1000).toFixed(1)}K`
    return `$${v.toFixed(0)}`
  })

  useEffect(() => {
    springValue.set(value)
  }, [value, springValue])

  return <motion.span className={className}>{displayValue}</motion.span>
}

// ═══════════════════════════════════════════════════════════════════════════
// CAPITAL FORECAST WIDGET
// ═══════════════════════════════════════════════════════════════════════════

export const CapitalForecastWidget: React.FC<CapitalForecastWidgetProps> = ({
  currentCapital,
  historicalData = [],
  forecastDays = 30,
  targetCapital,
  className,
}) => {
  // Generate mock historical data if not provided
  const mockData = useMemo(() => {
    if (historicalData.length > 0) return historicalData

    const data: number[] = []
    let value = currentCapital * 0.85
    for (let i = 0; i < 30; i++) {
      value += (Math.random() - 0.4) * (currentCapital * 0.02)
      data.push(value)
    }
    data.push(currentCapital) // End at current
    return data
  }, [historicalData, currentCapital])

  const forecast = useMemo(
    () => calculateForecast(mockData, forecastDays),
    [mockData, forecastDays],
  )

  const progressToTarget = targetCapital
    ? Math.min(100, (currentCapital / targetCapital) * 100)
    : null

  const TrendIcon =
    forecast.trend === 'up' ? TrendingUp : forecast.trend === 'down' ? TrendingDown : ArrowRight
  const trendColor =
    forecast.trend === 'up' ? '#10b981' : forecast.trend === 'down' ? '#ef4444' : '#6b7280'

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        'bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent',
        'border border-white/10 backdrop-blur-xl',
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background glow */}
      <div className="absolute -top-20 -right-20 h-60 w-60 rounded-full bg-indigo-500/20 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 mb-4 flex items-start justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm text-white/60">
            <Zap className="h-4 w-4 text-indigo-400" />
            Pronóstico de Capital
          </div>
          <h3 className="text-sm text-white/50">Próximos {forecastDays} días</h3>
        </div>

        <div
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1"
          style={{ backgroundColor: `${trendColor}20` }}
        >
          <TrendIcon className="h-4 w-4" style={{ color: trendColor }} />
          <span className="text-xs font-medium" style={{ color: trendColor }}>
            {forecast.confidence.toFixed(0)}% conf.
          </span>
        </div>
      </div>

      {/* Current vs Predicted */}
      <div className="relative z-10 mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-1 text-xs text-white/40">Capital Actual</p>
          <p className="text-2xl font-bold text-white">
            <AnimatedCurrency value={currentCapital} />
          </p>
        </div>

        <div>
          <p className="mb-1 text-xs text-white/40">Proyección</p>
          <p className="text-2xl font-bold" style={{ color: trendColor }}>
            <AnimatedCurrency value={forecast.predictedValue} />
          </p>
        </div>
      </div>

      {/* Sparkline */}
      <div className="relative z-10 mb-4">
        <ForecastSparkline
          historicalData={mockData}
          projectedData={forecast.projectedData}
          width={280}
          height={80}
        />

        {/* Labels */}
        <div className="mt-2 flex justify-between text-xs text-white/40">
          <span>Hace 30 días</span>
          <span className="text-emerald-400">Hoy</span>
          <span className="text-indigo-400">+{forecastDays}d</span>
        </div>
      </div>

      {/* Daily change */}
      <div className="relative z-10 flex items-center justify-between rounded-xl bg-white/5 p-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-white/40" />
          <span className="text-sm text-white/60">Cambio diario promedio</span>
        </div>
        <span
          className="text-sm font-bold"
          style={{ color: forecast.dailyChange >= 0 ? '#10b981' : '#ef4444' }}
        >
          {forecast.dailyChange >= 0 ? '+' : ''}${Math.abs(forecast.dailyChange).toFixed(0)}/día
        </span>
      </div>

      {/* Target progress */}
      {targetCapital && progressToTarget !== null && (
        <div className="relative z-10 mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-400" />
              <span className="text-white/60">Meta</span>
            </div>
            <span className="font-medium text-white">${(targetCapital / 1000).toFixed(0)}K</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressToTarget}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          <p className="mt-1 text-right text-xs text-white/40">
            {progressToTarget.toFixed(1)}% completado
          </p>
        </div>
      )}
    </motion.div>
  )
}

export default CapitalForecastWidget
