/**
 * 🌌📊 PREMIUM CHARTS ULTRA — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Charts ultra-avanzados con:
 * - Gradientes cinematográficos
 * - Animaciones spring physics
 * - Glow volumétrico
 * - Multi-style responsive
 * - Interactividad premium
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PREMIUM PALETTE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CHART_PALETTE = {
  violet: { main: '#8B5CF6', light: '#A78BFA', dark: '#7C3AED', glow: 'rgba(139,92,246,0.4)' },
  gold: { main: '#F59E0B', light: '#FBBF24', dark: '#D97706', glow: 'rgba(245,158,11,0.4)' },
  emerald: { main: '#10B981', light: '#34D399', dark: '#059669', glow: 'rgba(16,185,129,0.4)' },
  plasma: { main: '#EC4899', light: '#F472B6', dark: '#DB2777', glow: 'rgba(236,72,153,0.4)' },
  azure: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB', glow: 'rgba(59,130,246,0.4)' },
  rose: { main: '#EF4444', light: '#F87171', dark: '#DC2626', glow: 'rgba(239,68,68,0.4)' },
}

const GRADIENTS = {
  violet: ['#8B5CF6', '#A855F7', '#C084FC'],
  gold: ['#F59E0B', '#FBBF24', '#FCD34D'],
  emerald: ['#10B981', '#34D399', '#6EE7B7'],
  plasma: ['#EC4899', '#F472B6', '#FBCFE8'],
  azure: ['#3B82F6', '#60A5FA', '#93C5FD'],
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CUSTOM TOOLTIP
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TooltipData {
  name: string
  value: number
  color?: string
}

function PremiumTooltip({
  active,
  payload,
  label,
  formatter = (v: number) => `$${v.toLocaleString()}`,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
  formatter?: (value: number) => string
}) {
  if (!active || !payload?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className="relative overflow-hidden rounded-xl border border-white/15 px-4 py-3 backdrop-blur-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(20,0,40,0.85) 100%)',
        boxShadow: '0 20px 40px -10px rgba(139,92,246,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      {/* Rotating glow accent */}
      <motion.div
        className="pointer-events-none absolute -top-4 -right-4 h-8 w-8 rounded-full opacity-60"
        style={{
          background: 'conic-gradient(from 0deg, #8B5CF6, transparent, #06B6D4, transparent)',
          filter: 'blur(8px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
      />

      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 h-px w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)',
        }}
      />

      <p className="mb-2 text-xs font-semibold tracking-wider text-white/50 uppercase">{label}</p>
      <div className="space-y-2">
        {payload.map((entry, index) => (
          <motion.div
            key={index}
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-0.5 rounded-full opacity-60"
                style={{ background: entry.color, filter: 'blur(3px)' }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div
                className="relative h-2.5 w-2.5 rounded-full"
                style={{ background: entry.color }}
              />
            </div>
            <span className="text-xs text-white/70">{entry.name}:</span>
            <span className="text-sm font-bold text-white">{formatter(entry.value)}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// AREA CHART PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface AreaChartPremiumProps {
  data: Array<{ name: string; value: number; value2?: number }>
  color?: keyof typeof CHART_PALETTE
  secondaryColor?: keyof typeof CHART_PALETTE
  height?: number
  showGrid?: boolean
  showLegend?: boolean
  animated?: boolean
  title?: string
  subtitle?: string
  className?: string
  /** @deprecated Always shows gradient */
  showGradient?: boolean
}

export function AreaChartPremium({
  data,
  color = 'violet',
  secondaryColor = 'emerald',
  height = 300,
  showGrid = true,
  showLegend = false,
  animated = true,
  title,
  subtitle,
  className,
  showGradient: _showGradient, // ignored, always true
}: AreaChartPremiumProps) {
  const [isHovered, setIsHovered] = useState(false)
  const palette = CHART_PALETTE[color]
  const secondaryPalette = CHART_PALETTE[secondaryColor]
  const hasSecondary = data.some((d) => d.value2 !== undefined)

  return (
    <motion.div
      className={cn('relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h4 className="text-lg font-bold text-white">{title}</h4>}
          {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.main} stopOpacity={0.4} />
              <stop offset="50%" stopColor={palette.main} stopOpacity={0.15} />
              <stop offset="100%" stopColor={palette.main} stopOpacity={0} />
            </linearGradient>
            {hasSecondary && (
              <linearGradient id={`gradient-${secondaryColor}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={secondaryPalette.main} stopOpacity={0.4} />
                <stop offset="50%" stopColor={secondaryPalette.main} stopOpacity={0.15} />
                <stop offset="100%" stopColor={secondaryPalette.main} stopOpacity={0} />
              </linearGradient>
            )}
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          )}

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={50}
          />

          <Tooltip content={<PremiumTooltip />} />

          {showLegend && <Legend />}

          <Area
            type="monotone"
            dataKey="value"
            name="Valor"
            stroke={palette.main}
            strokeWidth={2.5}
            fill={`url(#gradient-${color})`}
            filter={isHovered ? 'url(#glow)' : undefined}
            animationDuration={animated ? 1500 : 0}
            animationEasing="ease-out"
          />

          {hasSecondary && (
            <Area
              type="monotone"
              dataKey="value2"
              name="Comparativo"
              stroke={secondaryPalette.main}
              strokeWidth={2}
              strokeDasharray="5 5"
              fill={`url(#gradient-${secondaryColor})`}
              animationDuration={animated ? 1800 : 0}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BAR CHART PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface BarChartPremiumProps {
  data: Array<{ name: string; ingresos?: number; gastos?: number; value?: number }>
  variant?: 'single' | 'grouped' | 'stacked'
  color?: keyof typeof CHART_PALETTE
  height?: number
  showGrid?: boolean
  animated?: boolean
  title?: string
  subtitle?: string
  className?: string
}

export function BarChartPremium({
  data,
  variant = 'grouped',
  color = 'violet',
  height = 300,
  showGrid = true,
  animated = true,
  title,
  subtitle,
  className,
}: BarChartPremiumProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const palette = CHART_PALETTE[color]

  return (
    <motion.div className={cn('relative', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h4 className="text-lg font-bold text-white">{title}</h4>}
          {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
        </div>
      )}

      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradientIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_PALETTE.emerald.light} />
              <stop offset="100%" stopColor={CHART_PALETTE.emerald.dark} />
            </linearGradient>
            <linearGradient id="barGradientGastos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_PALETTE.rose.light} />
              <stop offset="100%" stopColor={CHART_PALETTE.rose.dark} />
            </linearGradient>
            <linearGradient id="barGradientSingle" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={palette.light} />
              <stop offset="100%" stopColor={palette.dark} />
            </linearGradient>
          </defs>

          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          )}

          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            width={50}
          />

          <Tooltip content={<PremiumTooltip />} />

          {variant === 'single' ? (
            <Bar
              dataKey="value"
              fill="url(#barGradientSingle)"
              radius={[6, 6, 0, 0]}
              animationDuration={animated ? 1200 : 0}
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            />
          ) : (
            <>
              <Bar
                dataKey="ingresos"
                name="Ingresos"
                fill="url(#barGradientIngresos)"
                radius={[6, 6, 0, 0]}
                animationDuration={animated ? 1200 : 0}
              />
              <Bar
                dataKey="gastos"
                name="Gastos"
                fill="url(#barGradientGastos)"
                radius={[6, 6, 0, 0]}
                animationDuration={animated ? 1400 : 0}
              />
            </>
          )}
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DONUT CHART PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface DonutChartPremiumProps {
  data: Array<{ name: string; value: number; color: string }>
  size?: number
  innerRadius?: number
  outerRadius?: number
  centerLabel?: string
  centerValue?: string | number
  animated?: boolean
  className?: string
}

export function DonutChartPremium({
  data,
  size = 250,
  innerRadius = 60,
  outerRadius = 90,
  centerLabel,
  centerValue,
  animated = true,
  className,
}: DonutChartPremiumProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  // Validar que data sea un array
  const safeData = Array.isArray(data) ? data : []
  const total = safeData.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <ResponsiveContainer width={size} height={size}>
        <PieChart>
          <defs>
            {safeData.map((entry, index) => (
              <filter
                key={`glow-${index}`}
                id={`pieGlow-${index}`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={activeIndex !== null ? outerRadius + 8 : outerRadius}
            paddingAngle={2}
            dataKey="value"
            animationDuration={animated ? 1500 : 0}
            animationEasing="ease-out"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {safeData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
                filter={activeIndex === index ? `url(#pieGlow-${index})` : undefined}
                style={{
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Pie>

          <Tooltip
            content={<PremiumTooltip formatter={(v) => `${((v / total) * 100).toFixed(1)}%`} />}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Content with Ultra Premium Effects */}
      {(centerLabel || centerValue) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {/* Rotating glow ring */}
          <motion.div
            className="absolute rounded-full opacity-40"
            style={{
              width: innerRadius * 2 - 10,
              height: innerRadius * 2 - 10,
              background:
                'conic-gradient(from 0deg, rgba(139,92,246,0.6), transparent, rgba(6,182,212,0.5), transparent, rgba(139,92,246,0.6))',
              filter: 'blur(8px)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />

          {/* Glassmorphism background */}
          <motion.div
            className="absolute rounded-full"
            style={{
              width: innerRadius * 2 - 20,
              height: innerRadius * 2 - 20,
              background: 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          />

          <motion.div
            className="relative z-10 flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {centerValue !== undefined && (
              <motion.span
                className="text-2xl font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FFFFFF 0%, #A78BFA 50%, #FFFFFF 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
                animate={activeIndex !== null ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                {typeof centerValue === 'number' ? `$${centerValue.toLocaleString()}` : centerValue}
              </motion.span>
            )}
            {centerLabel && (
              <span className="text-xs tracking-wider text-white/50 uppercase">{centerLabel}</span>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SPARKLINE MINI CHART
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface SparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
  showDot?: boolean
  animated?: boolean
  className?: string
}

export function Sparkline({
  data,
  color = '#8B5CF6',
  width = 100,
  height = 32,
  showDot = true,
  animated = true,
  className,
}: SparklineProps) {
  // Protección contra datos vacíos o inválidos
  if (!data || data.length === 0) {
    return (
      <div className={cn('relative', className)}>
        <svg width={width} height={height} className="overflow-visible">
          <line
            x1={0}
            y1={height / 2}
            x2={width}
            y2={height / 2}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        </svg>
      </div>
    )
  }

  // Filtrar NaN e Infinity
  const safeData = data.map((v) => (Number.isFinite(v) ? v : 0))

  const max = Math.max(...safeData)
  const min = Math.min(...safeData)
  const range = max - min || 1

  const points = safeData.map((value, index) => {
    const x = (index / (safeData.length - 1 || 1)) * width
    const y = height - ((value - min) / range) * (height - 8) - 4
    return { x, y, value }
  })

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`
  const lastPoint = points[points.length - 1]
  const firstVal = safeData[0] ?? 0
  const lastVal = safeData[safeData.length - 1] ?? 0
  const trend = lastVal > firstVal

  return (
    <div className={cn('relative', className)}>
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient
            id={`sparkGradient-${color.replace('#', '')}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <motion.path
          d={areaD}
          fill={`url(#sparkGradient-${color.replace('#', '')})`}
          initial={animated ? { opacity: 0 } : undefined}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        />

        {/* Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animated ? { pathLength: 0 } : undefined}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Last point dot */}
        {showDot && lastPoint && (
          <motion.circle
            cx={lastPoint.x}
            cy={lastPoint.y}
            r={4}
            fill={color}
            stroke="rgba(0,0,0,0.5)"
            strokeWidth={2}
            initial={animated ? { scale: 0 } : undefined}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
          />
        )}
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FLOW SANKEY CHART (Simplified)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface FlowData {
  from: string
  to: string
  value: number
  color?: string
}

export interface FlowChartProps {
  data: FlowData[]
  height?: number
  className?: string
}

export function FlowChart({ data, height = 200, className }: FlowChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(300)

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) setContainerWidth(entry.contentRect.width)
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const sources = [...new Set(data.map((d) => d.from))]
  const targets = [...new Set(data.map((d) => d.to))]
  const maxValue = Math.max(...data.map((d) => d.value), 1) // Evitar división por 0

  // Posiciones calculadas en pixels
  const rightEdge = containerWidth - 8
  const rightTextX = containerWidth - 15
  const midX = containerWidth / 2

  return (
    <div ref={containerRef} className={cn('relative', className)} style={{ height }}>
      <svg width="100%" height="100%" className="overflow-visible">
        <defs>
          {data.map((d, i) => (
            <linearGradient key={i} id={`flow-${i}`} x1="0" y1="0" x2="1" y2="0">
              <stop
                offset="0%"
                stopColor={d.color || CHART_PALETTE.violet.main}
                stopOpacity={0.8}
              />
              <stop
                offset="100%"
                stopColor={d.color || CHART_PALETTE.gold.main}
                stopOpacity={0.6}
              />
            </linearGradient>
          ))}
        </defs>

        {/* Source nodes */}
        {sources.map((source, i) => {
          const total = data.filter((d) => d.from === source).reduce((sum, d) => sum + d.value, 0)
          const h = Math.max((total / maxValue) * (height - 40), 20)
          const y = 20 + i * (height / Math.max(sources.length, 1))

          return (
            <g key={`source-${i}`}>
              <rect x={0} y={y} width={8} height={h} rx={4} fill={CHART_PALETTE.violet.main} />
              <text x={15} y={y + 12} fill="rgba(255,255,255,0.7)" fontSize={11}>
                {source}
              </text>
            </g>
          )
        })}

        {/* Target nodes */}
        {targets.map((target, i) => {
          const total = data.filter((d) => d.to === target).reduce((sum, d) => sum + d.value, 0)
          const h = Math.max((total / maxValue) * (height - 40), 20)
          const y = 20 + i * (height / Math.max(targets.length, 1))

          return (
            <g key={`target-${i}`}>
              <rect
                x={rightEdge}
                y={y}
                width={8}
                height={h}
                rx={4}
                fill={CHART_PALETTE.gold.main}
              />
              <text
                x={rightTextX}
                y={y + 12}
                fill="rgba(255,255,255,0.7)"
                fontSize={11}
                textAnchor="end"
              >
                {target}
              </text>
            </g>
          )
        })}

        {/* Flow paths */}
        {data.map((d, i) => {
          const sourceIndex = sources.indexOf(d.from)
          const targetIndex = targets.indexOf(d.to)
          const thickness = Math.max((d.value / maxValue) * 30 + 5, 5)
          const sy = 30 + sourceIndex * (height / Math.max(sources.length, 1))
          const ty = 30 + targetIndex * (height / Math.max(targets.length, 1))

          return (
            <motion.path
              key={i}
              d={`M 15 ${sy} C ${midX} ${sy}, ${midX} ${ty}, ${rightTextX} ${ty}`}
              fill="none"
              stroke={`url(#flow-${i})`}
              strokeWidth={thickness}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.6 }}
              transition={{ duration: 1.5, delay: i * 0.1 }}
              whileHover={{ opacity: 1, strokeWidth: thickness + 5 }}
            />
          )
        })}
      </svg>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// RADIAL PROGRESS CHART
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface RadialProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  color?: string
  label?: string
  showValue?: boolean
  animated?: boolean
  className?: string
}

export function RadialProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 10,
  color = CHART_PALETTE.violet.main,
  label,
  showValue = true,
  animated = true,
  className,
}: RadialProgressProps) {
  const percentage = Math.min((value / max) * 100, 100)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={`radialGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor={color} stopOpacity={0.5} />
          </linearGradient>
          <filter id="radialGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#radialGrad-${color.replace('#', '')})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          filter="url(#radialGlow)"
          initial={animated ? { strokeDashoffset: circumference } : undefined}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <motion.span
            className="text-xl font-bold text-white"
            initial={animated ? { opacity: 0 } : undefined}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {percentage.toFixed(0)}%
          </motion.span>
        )}
        {label && <span className="mt-0.5 text-xs text-white/50">{label}</span>}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { CHART_PALETTE, GRADIENTS }
