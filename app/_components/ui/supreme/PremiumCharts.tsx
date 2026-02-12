/**
 * 📊 PREMIUM CHARTS SYSTEM — Sistema de Gráficas Ultra-Premium
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Charts animados con glassmorphism y efectos cinematográficos
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion } from 'motion/react'
import React, { useMemo } from 'react'
import { GlassCard } from './ChronosDesignSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════
// BAR CHART — Gráfica de barras animada
// ═══════════════════════════════════════════════════════════════════════════════════════

interface BarData {
  label: string
  value: number
  color?: string
}

interface PremiumBarChartProps {
  data: BarData[]
  title?: string
  subtitle?: string
  height?: number
  showValues?: boolean
  animate?: boolean
  gradient?: boolean
  className?: string
}

export const PremiumBarChart: React.FC<PremiumBarChartProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  showValues = true,
  animate = true,
  gradient = true,
  className = '',
}) => {
  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <GlassCard className={className}>
      <div className="p-6">
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
          </div>
        )}

        {/* Chart */}
        <div className="relative" style={{ height }}>
          <div className="flex h-full items-end justify-around gap-2">
            {data.map((item, index) => {
              const percentage = (item.value / maxValue) * 100
              const color = item.color || '#8b5cf6'

              return (
                <div key={index} className="group relative flex flex-1 flex-col items-center">
                  {/* Value label */}
                  {showValues && (
                    <motion.div
                      className="mb-2 rounded-lg bg-black/40 px-2 py-1 text-xs font-semibold text-white opacity-0 backdrop-blur-xl group-hover:opacity-100"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {item.value.toLocaleString()}
                    </motion.div>
                  )}

                  {/* Bar */}
                  <motion.div
                    className="relative w-full overflow-hidden rounded-t-lg"
                    style={{
                      height: `${percentage}%`,
                      background: gradient
                        ? `linear-gradient(to top, ${color}, ${color}cc)`
                        : color,
                      boxShadow: `0 0 20px ${color}40`,
                    }}
                    initial={animate ? { height: 0, opacity: 0 } : {}}
                    animate={{ height: `${percentage}%`, opacity: 1 }}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: `0 0 30px ${color}60`,
                    }}
                    transition={{
                      delay: index * 0.1,
                      type: 'spring',
                      stiffness: 100,
                      damping: 15,
                    }}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 opacity-40"
                      style={{
                        background:
                          'linear-gradient(to top, transparent, rgba(255,255,255,0.2), transparent)',
                      }}
                      animate={{
                        y: ['100%', '-100%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2,
                      }}
                    />
                  </motion.div>

                  {/* Label */}
                  <p className="mt-2 text-xs font-medium text-white/70">{item.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </GlassCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// LINE CHART — Gráfica de líneas animada
// ═══════════════════════════════════════════════════════════════════════════════════════

interface LineData {
  x: number | string
  y: number
}

interface PremiumLineChartProps {
  data: LineData[]
  title?: string
  subtitle?: string
  height?: number
  color?: string
  showDots?: boolean
  showGradient?: boolean
  smooth?: boolean
  className?: string
}

export const PremiumLineChart: React.FC<PremiumLineChartProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  color = '#8b5cf6',
  showDots = true,
  showGradient = true,
  smooth = true,
  className = '',
}) => {
  const maxY = Math.max(...data.map((d) => d.y))
  const minY = Math.min(...data.map((d) => d.y))
  const range = maxY - minY

  // Generar puntos del path
  const points = useMemo(() => {
    const width = 100 // percentage
    const step = width / (data.length - 1)

    return data.map((point, index) => {
      const x = index * step
      const y = ((maxY - point.y) / range) * 100
      return { x, y }
    })
  }, [data, maxY, minY, range])

  // Generar path SVG
  const pathD = useMemo(() => {
    if (points.length === 0) return ''

    const firstPoint = points[0]
    if (!firstPoint) return ''

    let path = `M ${firstPoint.x} ${firstPoint.y}`

    if (smooth && points.length > 2) {
      // Curva suave con curvas Bézier
      for (let i = 0; i < points.length - 1; i++) {
        const curr = points[i]
        const next = points[i + 1]
        if (!curr || !next) continue
        const controlX = (curr.x + next.x) / 2
        path += ` Q ${controlX} ${curr.y}, ${next.x} ${next.y}`
      }
    } else {
      // Líneas rectas
      points.slice(1).forEach((point) => {
        path += ` L ${point.x} ${point.y}`
      })
    }

    return path
  }, [points, smooth])

  // Area path para gradiente
  const areaPathD = useMemo(() => {
    if (!showGradient || !pathD) return ''
    return `${pathD} L 100 100 L 0 100 Z`
  }, [pathD, showGradient])

  return (
    <GlassCard className={className}>
      <div className="p-6">
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
          </div>
        )}

        {/* Chart */}
        <div className="relative" style={{ height }}>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            <defs>
              <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Gradient fill */}
            {showGradient && (
              <motion.path
                d={areaPathD}
                fill={`url(#gradient-${color})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            )}

            {/* Line */}
            <motion.path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                filter: `drop-shadow(0 0 8px ${color}80)`,
              }}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut' }}
            />

            {/* Dots */}
            {showDots &&
              points.map((point, index) => (
                <motion.circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r="1.5"
                  fill={color}
                  style={{
                    filter: `drop-shadow(0 0 4px ${color})`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 2, opacity: 1 }}
                  transition={{
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 400,
                  }}
                />
              ))}
          </svg>
        </div>
      </div>
    </GlassCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DONUT CHART — Gráfica de dona animada
// ═══════════════════════════════════════════════════════════════════════════════════════

interface DonutData {
  label: string
  value: number
  color: string
}

interface PremiumDonutChartProps {
  data: DonutData[]
  title?: string
  subtitle?: string
  size?: number
  thickness?: number
  showLabels?: boolean
  showLegend?: boolean
  className?: string
}

export const PremiumDonutChart: React.FC<PremiumDonutChartProps> = ({
  data,
  title,
  subtitle,
  size = 200,
  thickness = 30,
  showLabels = true,
  showLegend = true,
  className = '',
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius

  let accumulatedValue = 0

  return (
    <GlassCard className={className}>
      <div className="p-6">
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-6">
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
          </div>
        )}

        <div className="flex items-center justify-center gap-8">
          {/* Chart */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="rotate-[-90deg]">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
                const strokeDashoffset = -(accumulatedValue / 100) * circumference

                const segment = (
                  <motion.circle
                    key={index}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={item.color}
                    strokeWidth={thickness}
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{
                      filter: `drop-shadow(0 0 8px ${item.color}80)`,
                    }}
                    initial={{ strokeDasharray: `0 ${circumference}` }}
                    animate={{ strokeDasharray }}
                    transition={{
                      delay: index * 0.2,
                      duration: 1,
                      ease: 'easeOut',
                    }}
                    whileHover={{
                      filter: `drop-shadow(0 0 12px ${item.color})`,
                      strokeWidth: thickness + 2,
                    }}
                  />
                )

                accumulatedValue += percentage
                return segment
              })}
            </svg>

            {/* Center label */}
            {showLabels && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-2xl font-bold text-white">{total.toLocaleString()}</p>
                <p className="text-xs text-white/60">Total</p>
              </div>
            )}
          </div>

          {/* Legend */}
          {showLegend && (
            <div className="space-y-2">
              {data.map((item, index) => {
                const percentage = ((item.value / total) * 100).toFixed(1)
                return (
                  <motion.div
                    key={index}
                    className="flex items-center gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{
                        background: item.color,
                        boxShadow: `0 0 8px ${item.color}60`,
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-white/60">
                        {item.value.toLocaleString()} ({percentage}%)
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  )
}

