'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊✨ AURORA PREMIUM CHARTS — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Charts premium con:
 * - Glassmorphism y efectos aurora
 * - Filtros interactivos avanzados
 * - Animaciones fluidas 60fps
 * - Tooltips premium
 * - Múltiples variantes de visualización
 * - Canvas para rendimiento óptimo
 *
 * Basado en las referencias de diseño premium
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react'
import { AURORA_COLORS } from '../ui/AuroraGlassSystem'
import { EnhancedAuroraCard as AuroraGlassCard } from '../ui/EnhancedAuroraSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ChartDataPoint {
  name?: string
  value: number
  value2?: number
  value3?: number
  color?: string
  date?: string
}

interface ChartFilter {
  id: string
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (_value: string) => void
}

interface BaseChartProps {
  title?: string
  subtitle?: string
  data: ChartDataPoint[]
  className?: string
  height?: number
  showLegend?: boolean
  showGrid?: boolean
  showTooltip?: boolean
  animated?: boolean
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  filters?: ChartFilter[]
  onFilterChange?: (_filterId: string, _value: string) => void
  headerActions?: ReactNode
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 CHART FILTER BAR — Premium filter controls
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ChartFilterBarProps {
  filters: ChartFilter[]
  onFilterChange: (_filterId: string, _value: string) => void
  className?: string
}

export function ChartFilterBar({ filters, onFilterChange, className }: ChartFilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {filters.map((filter) => (
        <div key={filter.id} className="relative">
          <label className="mb-1 block text-xs text-white/50">{filter.label}</label>
          <select
            value={filter.value}
            onChange={(e) => {
              filter.onChange(e.target.value)
              onFilterChange(filter.id, e.target.value)
            }}
            className={cn(
              'appearance-none rounded-xl px-4 py-2 pr-8 text-sm',
              'border border-white/10 bg-white/5 backdrop-blur-xl',
              'text-white focus:border-violet-500/50 focus:outline-none',
              'cursor-pointer transition-all hover:bg-white/10',
            )}
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-gray-900">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute top-[calc(50%+0.5rem)] right-3 -translate-y-1/2">
            <svg
              className="h-4 w-4 text-white/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 CHART WRAPPER — Base container for all charts
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ChartWrapperProps {
  title?: string
  subtitle?: string
  children: ReactNode
  filters?: ChartFilter[]
  onFilterChange?: (_filterId: string, _value: string) => void
  headerActions?: ReactNode
  showExpandButton?: boolean
  className?: string
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
}

export function ChartWrapper({
  title,
  subtitle,
  children,
  filters,
  onFilterChange,
  headerActions,
  showExpandButton = false,
  className,
  color = 'violet',
}: ChartWrapperProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <AuroraGlassCard glowColor={color} enableTilt={false} className={cn('p-6', className)}>
      {/* Header */}
      {(title || filters || headerActions) && (
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            {filters && onFilterChange && (
              <ChartFilterBar filters={filters} onFilterChange={onFilterChange} />
            )}
            {headerActions}
            {showExpandButton && (
              <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                className="rounded-lg bg-white/5 p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isExpanded
                        ? 'M6 18L18 6M6 6l12 12'
                        : 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4'
                    }
                  />
                </svg>
              </motion.button>
            )}
          </div>
        </div>
      )}

      {/* Chart Content */}
      <div className="relative">{children}</div>
    </AuroraGlassCard>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📈 AURORA AREA CHART — Premium area/line chart
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraAreaChartProps extends BaseChartProps {
  showArea?: boolean
  showLine?: boolean
  showDots?: boolean
  gradient?: boolean
  comparison?: boolean
}

export function AuroraAreaChart({
  title,
  subtitle,
  data,
  className,
  height = 250,
  showLegend = true,
  showGrid = true,
  showTooltip = true,
  animated = true,
  color = 'violet',
  filters,
  onFilterChange,
  headerActions,
  showArea = true,
  showLine = true,
  showDots = true,
  // gradient not currently used
  comparison = false,
}: AuroraAreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  const colorConfig = AURORA_COLORS[color]
  const comparisonColor = AURORA_COLORS['cyan']

  // Calculate chart dimensions and scales
  const padding = { top: 20, right: 20, bottom: 40, left: 60 }
  const _chartWidth = 100 // percentage-based
  const chartHeight = height - padding.top - padding.bottom

  const maxValue = useMemo(
    () => Math.max(...data.flatMap((d) => [d.value, d.value2 || 0])) * 1.1,
    [data],
  )
  const _minValue = useMemo(
    () => Math.min(...data.flatMap((d) => [d.value, d.value2 || 0])) * 0.9,
    [data],
  )
  const valueRange = maxValue - _minValue || 1

  // Generate path - SVG path data requires numbers, not percentages
  const generatePath = useCallback(
    (values: number[], smooth = true) => {
      if (values.length === 0) return ''

      const points = values.map((value, i) => ({
        x: (i / Math.max(values.length - 1, 1)) * 100,
        y: ((maxValue - value) / valueRange) * chartHeight + padding.top,
      }))

      if (!smooth || points.length < 3) {
        return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
      }

      // Bezier curve smoothing
      const firstPoint = points[0]
      if (!firstPoint) return ''
      let path = `M ${firstPoint.x} ${firstPoint.y}`
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        if (!prev || !curr) continue
        const cpX = (prev.x + curr.x) / 2
        path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`
      }
      return path
    },
    [maxValue, valueRange, chartHeight, padding.top],
  )

  const mainPath = useMemo(() => generatePath(data.map((d) => d.value)), [data, generatePath])
  const comparisonPath = useMemo(
    () =>
      comparison && data.some((d) => d.value2)
        ? generatePath(data.map((d) => d.value2 || 0))
        : null,
    [data, comparison, generatePath],
  )

  // Generate area path - SVG paths require numbers not percentages
  const generateAreaPath = useCallback(
    (values: number[]) => {
      const linePath = generatePath(values)
      if (!linePath) return ''
      return `${linePath} L 100 ${chartHeight + padding.top} L 0 ${chartHeight + padding.top} Z`
    },
    [generatePath, chartHeight, padding.top],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!svgRef.current) return
      const rect = svgRef.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const index = Math.round(x * (data.length - 1))
      setHoveredIndex(Math.max(0, Math.min(index, data.length - 1)))
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    },
    [data.length],
  )

  return (
    <ChartWrapper
      title={title}
      subtitle={subtitle}
      filters={filters}
      onFilterChange={onFilterChange}
      headerActions={headerActions}
      color={color}
      className={className}
    >
      <div className="relative" style={{ height }}>
        <svg
          ref={svgRef}
          className="h-full w-full"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id={`areaGradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colorConfig.primary} stopOpacity="0.5" />
              <stop offset="100%" stopColor={colorConfig.primary} stopOpacity="0" />
            </linearGradient>
            {comparison && (
              <linearGradient id="areaGradient-comparison" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={comparisonColor.primary} stopOpacity="0.3" />
                <stop offset="100%" stopColor={comparisonColor.primary} stopOpacity="0" />
              </linearGradient>
            )}
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          {showGrid && (
            <g className="opacity-20">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
                <line
                  key={ratio}
                  x1="0%"
                  y1={padding.top + chartHeight * ratio}
                  x2="100%"
                  y2={padding.top + chartHeight * ratio}
                  stroke="white"
                  strokeDasharray="2,4"
                />
              ))}
            </g>
          )}

          {/* Comparison area and line */}
          {comparison && comparisonPath && (
            <>
              {showArea && (
                <motion.path
                  d={generateAreaPath(data.map((d) => d.value2 || 0))}
                  fill="url(#areaGradient-comparison)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              {showLine && (
                <motion.path
                  d={comparisonPath}
                  fill="none"
                  stroke={comparisonColor.primary}
                  strokeWidth="2"
                  strokeDasharray="4,4"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              )}
            </>
          )}

          {/* Main area */}
          {showArea && (
            <motion.path
              d={generateAreaPath(data.map((d) => d.value))}
              fill={`url(#areaGradient-${color})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          )}

          {/* Main line */}
          {showLine && (
            <motion.path
              d={mainPath}
              fill="none"
              stroke={colorConfig.primary}
              strokeWidth="2.5"
              filter="url(#glow)"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: animated ? 1.5 : 0, ease: 'easeOut' }}
            />
          )}

          {/* Data points */}
          {showDots &&
            data.map((point, i) => {
              const x = (i / (data.length - 1)) * 100
              const y = ((maxValue - point.value) / valueRange) * chartHeight + padding.top
              const isHovered = hoveredIndex === i

              return (
                <motion.circle
                  key={i}
                  cx={`${x}%`}
                  cy={y}
                  r={isHovered ? 6 : 4}
                  fill={colorConfig.primary}
                  stroke="white"
                  strokeWidth="2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: animated ? 0.5 + i * 0.05 : 0 }}
                  style={{
                    filter: isHovered ? `drop-shadow(0 0 8px ${colorConfig.glow})` : undefined,
                  }}
                />
              )
            })}

          {/* Hover line */}
          {hoveredIndex !== null && (
            <motion.line
              x1={`${(hoveredIndex / (data.length - 1)) * 100}%`}
              y1={padding.top}
              x2={`${(hoveredIndex / (data.length - 1)) * 100}%`}
              y2={chartHeight + padding.top}
              stroke={colorConfig.primary}
              strokeWidth="1"
              strokeDasharray="4,4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
            />
          )}
        </svg>

        {/* X-axis labels */}
        <div className="absolute right-0 bottom-0 left-0 flex justify-between px-2">
          {data.map((point, i) => (
            <span key={i} className="text-xs text-white/40">
              {point.name}
            </span>
          ))}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && hoveredIndex !== null && (
            <motion.div
              className="pointer-events-none absolute z-50"
              style={{
                left: mousePos.x,
                top: mousePos.y - 60,
                transform: 'translateX(-50%)',
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <div className="rounded-lg border border-white/10 bg-gray-900/95 px-3 py-2 shadow-xl backdrop-blur-xl">
                <p className="mb-1 text-xs text-white/60">{data[hoveredIndex]?.name}</p>
                <p className="text-sm font-semibold text-white">
                  ${data[hoveredIndex]?.value.toLocaleString()}
                </p>
                {comparison && data[hoveredIndex]?.value2 && (
                  <p className="text-xs text-cyan-400">
                    Anterior: ${data[hoveredIndex]?.value2?.toLocaleString()}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      {showLegend && comparison && (
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full" style={{ background: colorConfig.primary }} />
            <span className="text-xs text-white/60">Actual</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full border-2 border-dashed"
              style={{ borderColor: comparisonColor.primary }}
            />
            <span className="text-xs text-white/60">Comparativo</span>
          </div>
        </div>
      )}
    </ChartWrapper>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 AURORA BAR CHART — Premium bar chart with animations
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraBarChartProps extends BaseChartProps {
  orientation?: 'vertical' | 'horizontal'
  stacked?: boolean
  grouped?: boolean
  showValues?: boolean
}

export function AuroraBarChart({
  title,
  subtitle,
  data,
  className,
  height = 250,
  // showLegend not currently used in this implementation
  showGrid = true,
  showTooltip = true,
  animated = true,
  color = 'violet',
  filters,
  onFilterChange,
  headerActions,
  // orientation, stacked, grouped not currently used
  showValues = true,
}: AuroraBarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const colorConfig = AURORA_COLORS[color]
  const maxValue = Math.max(...data.map((d) => d.value)) * 1.1

  return (
    <ChartWrapper
      title={title}
      subtitle={subtitle}
      filters={filters}
      onFilterChange={onFilterChange}
      headerActions={headerActions}
      color={color}
      className={className}
    >
      <div className="relative" style={{ height }}>
        {/* Grid background */}
        {showGrid && (
          <div className="absolute inset-0 flex flex-col justify-between py-4 opacity-10">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="border-t border-dashed border-white" />
            ))}
          </div>
        )}

        {/* Bars */}
        <div className="relative flex h-full items-end justify-around gap-2 px-4 pb-8">
          {data.map((item, i) => {
            const barHeight = (item.value / maxValue) * 100
            const isHovered = hoveredIndex === i

            return (
              <div
                key={i}
                className="relative flex max-w-20 flex-1 flex-col items-center"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Value label */}
                {showValues && (
                  <motion.span
                    className="mb-2 text-xs font-medium text-white/80"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isHovered ? 1 : 0.6, y: 0 }}
                  >
                    ${(item.value / 1000).toFixed(0)}k
                  </motion.span>
                )}

                {/* Bar */}
                <motion.div
                  className="relative w-full cursor-pointer overflow-hidden rounded-t-lg"
                  style={{
                    height: `${barHeight}%`,
                    minHeight: 8,
                    background: `linear-gradient(180deg, ${colorConfig.primary} 0%, ${colorConfig.dark} 100%)`,
                    boxShadow: isHovered ? `0 0 20px ${colorConfig.glow}` : undefined,
                  }}
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{
                    duration: animated ? 0.6 : 0,
                    delay: animated ? i * 0.1 : 0,
                    ease: 'easeOut',
                  }}
                  whileHover={{ scale: 1.02 }}
                >
                  {/* Shine effect */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    }}
                    animate={isHovered ? { x: ['-100%', '200%'] } : { x: '-100%' }}
                    transition={{ duration: 1, ease: 'linear' }}
                  />

                  {/* Dot indicator */}
                  <motion.div
                    className="absolute top-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-white/80"
                    animate={{ scale: isHovered ? [1, 1.2, 1] : 1 }}
                    transition={{ duration: 0.5, repeat: isHovered ? Infinity : 0 }}
                  />
                </motion.div>

                {/* Label */}
                <span className="mt-2 w-full truncate text-center text-xs text-white/50">
                  {item.name}
                </span>
              </div>
            )
          })}
        </div>

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && hoveredIndex !== null && (
            <motion.div
              className="absolute top-4 left-1/2 z-50 -translate-x-1/2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="rounded-xl border border-white/10 bg-gray-900/95 px-4 py-2 shadow-2xl backdrop-blur-xl">
                <p className="text-sm font-semibold text-white">
                  {data[hoveredIndex]?.name}: ${data[hoveredIndex]?.value.toLocaleString()}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ChartWrapper>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🍩 AURORA DONUT CHART — Premium donut/pie chart
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraDonutChartProps extends BaseChartProps {
  innerRadius?: number
  showCenter?: boolean
  centerLabel?: string
  centerValue?: string | number
}

export function AuroraDonutChart({
  title,
  subtitle,
  data,
  className,
  height = 280,
  showLegend = true,
  animated = true,
  color = 'violet',
  filters,
  onFilterChange,
  headerActions,
  innerRadius = 60,
  showCenter = true,
  centerLabel,
  centerValue,
}: AuroraDonutChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  // Validar que data sea un array
  const safeData = Array.isArray(data) ? data : []
  const total = useMemo(() => safeData.reduce((sum, d) => sum + d.value, 0), [safeData])

  const defaultColors = useMemo(
    () => ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981', '#FBBF24', '#F97316', '#EF4444'],
    [],
  )

  // Generate pie segments
  const segments = useMemo(() => {
    if (safeData.length === 0 || total === 0) return []
    let startAngle = -90 // Start from top
    return safeData.map((item, i) => {
      const angle = (item.value / total) * 360
      const segment = {
        ...item,
        startAngle,
        endAngle: startAngle + angle,
        color: item.color || defaultColors[i % defaultColors.length],
        percentage: ((item.value / total) * 100).toFixed(1),
      }
      startAngle += angle
      return segment
    })
  }, [safeData, total, defaultColors])

  // Generate SVG arc path
  const generateArc = (startAngle: number, endAngle: number, outerR: number, innerR: number) => {
    const startOuter = polarToCartesian(50, 50, outerR, startAngle)
    const endOuter = polarToCartesian(50, 50, outerR, endAngle)
    const startInner = polarToCartesian(50, 50, innerR, endAngle)
    const endInner = polarToCartesian(50, 50, innerR, startAngle)
    const largeArc = endAngle - startAngle > 180 ? 1 : 0

    return [
      `M ${startOuter.x} ${startOuter.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
      `L ${startInner.x} ${startInner.y}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
      'Z',
    ].join(' ')
  }

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = (angle * Math.PI) / 180
    // Redondear a 6 decimales para evitar hydration mismatch entre servidor y cliente
    return {
      x: Math.round((cx + r * Math.cos(rad)) * 1000000) / 1000000,
      y: Math.round((cy + r * Math.sin(rad)) * 1000000) / 1000000,
    }
  }

  return (
    <ChartWrapper
      title={title}
      subtitle={subtitle}
      filters={filters}
      onFilterChange={onFilterChange}
      headerActions={headerActions}
      color={color}
      className={className}
    >
      <div className="flex items-center gap-8" style={{ minHeight: height }}>
        {/* Chart */}
        <div className="relative flex-shrink-0" style={{ width: height, height }}>
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              {segments.map((seg, i) => (
                <filter key={i} id={`glow-${i}`}>
                  <feGaussianBlur stdDeviation="1" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
            </defs>

            {segments.map((seg, i) => {
              const isHovered = hoveredIndex === i
              const outerR = isHovered ? 44 : 42
              const innerR = innerRadius / 2.5

              return (
                <motion.path
                  key={i}
                  d={generateArc(seg.startAngle, seg.endAngle - 1, outerR, innerR)}
                  fill={seg.color}
                  filter={isHovered ? `url(#glow-${i})` : undefined}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    cursor: 'pointer',
                    opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: hoveredIndex !== null && !isHovered ? 0.5 : 1 }}
                  transition={{
                    duration: animated ? 0.5 : 0,
                    delay: animated ? i * 0.1 : 0,
                    ease: 'backOut',
                  }}
                  whileHover={{ scale: 1.02 }}
                />
              )
            })}
          </svg>

          {/* Center content */}
          {showCenter && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <motion.p
                  className="text-2xl font-bold text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  {centerValue ?? `$${(total / 1000).toFixed(0)}k`}
                </motion.p>
                <p className="text-xs text-white/50">{centerLabel ?? 'Total'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        {showLegend && (
          <div className="flex-1 space-y-3">
            {segments.map((seg, i) => {
              const isHovered = hoveredIndex === i
              return (
                <motion.div
                  key={i}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors',
                    isHovered ? 'bg-white/10' : 'hover:bg-white/5',
                  )}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: animated ? 0.3 + i * 0.1 : 0 }}
                >
                  <div
                    className="h-3 w-3 flex-shrink-0 rounded-full"
                    style={{
                      background: seg.color,
                      boxShadow: isHovered ? `0 0 10px ${seg.color}` : undefined,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-white">{seg.name}</p>
                    <p className="text-xs text-white/50">
                      ${seg.value.toLocaleString()} ({seg.percentage}%)
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </ChartWrapper>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌡️ AURORA GAUGE CHART — Premium radial gauge
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AuroraGaugeChartProps {
  value: number
  max?: number
  title?: string
  label?: string
  color?: 'violet' | 'cyan' | 'magenta' | 'emerald' | 'gold'
  size?: number
  className?: string
}

export function AuroraGaugeChart({
  value,
  max = 100,
  title,
  label,
  color = 'violet',
  size = 200,
  className,
}: AuroraGaugeChartProps) {
  const colorConfig = AURORA_COLORS[color]
  const percentage = Math.min((value / max) * 100, 100)
  const angle = (percentage / 100) * 270 - 135 // -135 to 135 degrees

  return (
    <AuroraGlassCard glowColor={color} enableTilt className={cn('p-6', className)}>
      {title && <h3 className="mb-4 text-center text-lg font-semibold text-white">{title}</h3>}

      <div className="relative mx-auto" style={{ width: size, height: size * 0.7 }}>
        <svg viewBox="0 0 100 60" className="h-full w-full">
          <defs>
            <linearGradient id={`gauge-gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorConfig.dark} />
              <stop offset="50%" stopColor={colorConfig.primary} />
              <stop offset="100%" stopColor={colorConfig.light} />
            </linearGradient>
          </defs>

          {/* Background arc */}
          <path
            d="M 10 55 A 40 40 0 1 1 90 55"
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Value arc */}
          <motion.path
            d="M 10 55 A 40 40 0 1 1 90 55"
            fill="none"
            stroke={`url(#gauge-gradient-${color})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="188.5"
            initial={{ strokeDashoffset: 188.5 }}
            animate={{ strokeDashoffset: 188.5 - (percentage / 100) * 188.5 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ filter: `drop-shadow(0 0 6px ${colorConfig.glow})` }}
          />

          {/* Indicator dot */}
          <motion.circle
            cx="50"
            cy="50"
            r="4"
            fill={colorConfig.primary}
            style={{
              transformOrigin: '50px 50px',
              filter: `drop-shadow(0 0 8px ${colorConfig.glow})`,
            }}
            animate={{ rotate: angle }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0 -35"
              dur="0s"
              fill="freeze"
            />
          </motion.circle>
        </svg>

        {/* Center value */}
        <div className="absolute inset-0 flex items-end justify-center pb-4">
          <div className="text-center">
            <motion.span
              className="text-3xl font-bold"
              style={{ color: colorConfig.primary }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {Math.round(value)}
            </motion.span>
            {label && <p className="mt-1 text-xs text-white/50">{label}</p>}
          </div>
        </div>
      </div>
    </AuroraGlassCard>
  )
}
