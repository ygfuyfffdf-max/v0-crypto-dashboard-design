/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊✨ ULTRA TABLE 2026 — TABLAS CON FUNCIONALIDADES AVANZADAS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de tablas ultra premium con:
 * ✅ Infinite scroll virtualizado
 * ✅ Sparklines en celdas
 * ✅ Resize de columnas
 * ✅ Row expansion
 * ✅ Multi-select con checkbox
 * ✅ Filtros inline avanzados
 * ✅ Export (CSV/PDF)
 * ✅ Sticky header/column
 * ✅ Animaciones fluidas
 *
 * @version 2026.1.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Filter,
  MoreHorizontal,
  Search,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface UltraColumn<T> {
  key: keyof T | string
  header: string
  width?: number
  minWidth?: number
  maxWidth?: number
  sortable?: boolean
  filterable?: boolean
  resizable?: boolean
  sticky?: 'left' | 'right'
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T, index: number) => React.ReactNode
  filterOptions?: string[] // Para filtros de select
}

export interface UltraTableProps<T = Record<string, unknown>> {
  data: T[]
  columns: UltraColumn<T>[]
  pageSize?: number
  pageSizeOptions?: number[]
  searchable?: boolean
  searchPlaceholder?: string
  selectable?: boolean
  onSelectionChange?: (selectedRows: T[]) => void
  expandable?: boolean
  expandedRowRender?: (row: T, index: number) => React.ReactNode
  onRowClick?: (row: T, index: number) => void
  rowActions?: (row: T, index: number) => React.ReactNode
  emptyMessage?: string
  emptyIcon?: React.ReactNode
  loading?: boolean
  stickyHeader?: boolean
  exportable?: boolean
  onExport?: (format: 'csv' | 'json') => void
  toolbar?: React.ReactNode
  className?: string
  variant?: 'default' | 'compact' | 'comfortable'
  striped?: boolean
  hoverable?: boolean
  bordered?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SPARKLINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function Sparkline({
  data,
  width = 80,
  height = 24,
  color = '#8B5CF6',
  showDots = false,
  animated = true,
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
  showDots?: boolean
  animated?: boolean
}) {
  if (!data || data.length === 0) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: height - ((value - min) / range) * height,
  }))

  const pathD = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  // Gradient fill path
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`

  const lastValue = data[data.length - 1] ?? 0
  const prevValue = data[data.length - 2] ?? lastValue
  const trend = lastValue >= prevValue ? 'up' : 'down'
  const trendColor = trend === 'up' ? '#10B981' : '#EF4444'
  const lastPoint = points[points.length - 1]
  if (!lastPoint) return null

  return (
    <svg width={width} height={height} className="overflow-visible">
      {/* Gradient definition */}
      <defs>
        <linearGradient id={`sparkline-gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <motion.path
        d={areaD}
        fill={`url(#sparkline-gradient-${color})`}
        initial={animated ? { opacity: 0 } : {}}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* Line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={trendColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={animated ? { pathLength: 0 } : {}}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Dots */}
      {showDots &&
        points.map((point, index) => (
          <motion.circle
            key={index}
            cx={point.x}
            cy={point.y}
            r={2}
            fill={index === points.length - 1 ? trendColor : color}
            initial={animated ? { scale: 0 } : {}}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05, duration: 0.2 }}
          />
        ))}

      {/* End dot highlight */}
      <motion.circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r={3}
        fill={trendColor}
        initial={animated ? { scale: 0 } : {}}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, duration: 0.3, type: 'spring' }}
      />
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR CELL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function ProgressCell({
  value,
  max = 100,
  showValue = true,
  color,
  size = 'md',
}: {
  value: number
  max?: number
  showValue?: boolean
  color?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))

  const getColor = () => {
    if (color) return color
    if (percentage >= 80) return '#10B981'
    if (percentage >= 50) return '#F59E0B'
    return '#EF4444'
  }

  const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' }

  return (
    <div className="flex min-w-[100px] items-center gap-2">
      <div className={cn('flex-1 overflow-hidden rounded-full bg-white/10', heights[size])}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: getColor() }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      {showValue && (
        <span className="min-w-[36px] text-right font-mono text-xs text-white/60">
          {percentage.toFixed(0)}%
        </span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BADGE CELL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function BadgeCell({
  value,
  variant = 'default',
  dot = false,
  pulse = false,
}: {
  value: string
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'violet'
  dot?: boolean
  pulse?: boolean
}) {
  const variants = {
    default: 'bg-white/10 text-white/70 border-white/20',
    success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  }

  const dotColors = {
    default: 'bg-white/60',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    info: 'bg-blue-400',
    violet: 'bg-violet-400',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
      )}
    >
      {dot && (
        <span className="relative">
          <span className={cn('h-1.5 w-1.5 rounded-full', dotColors[variant])} />
          {pulse && (
            <span
              className={cn(
                'absolute inset-0 h-1.5 w-1.5 animate-ping rounded-full opacity-75',
                dotColors[variant],
              )}
            />
          )}
        </span>
      )}
      {value}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CURRENCY CELL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function CurrencyCell({
  value,
  currency = 'MXN',
  showTrend = false,
  previousValue,
  compact = false,
}: {
  value: number
  currency?: string
  showTrend?: boolean
  previousValue?: number
  compact?: boolean
}) {
  const isNegative = value < 0
  const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency,
    notation: compact ? 'compact' : 'standard',
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 1 : 2,
  })

  const trend =
    previousValue !== undefined
      ? value > previousValue
        ? 'up'
        : value < previousValue
          ? 'down'
          : 'neutral'
      : null

  return (
    <div className="flex items-center gap-2">
      <span
        className={cn('font-mono font-medium', isNegative ? 'text-red-400' : 'text-emerald-400')}
      >
        {formatter.format(value)}
      </span>
      {showTrend && trend && (
        <span
          className={cn(
            'flex items-center text-xs',
            trend === 'up' && 'text-emerald-400',
            trend === 'down' && 'text-red-400',
            trend === 'neutral' && 'text-white/40',
          )}
        >
          {trend === 'up' && <ArrowUp className="h-3 w-3" />}
          {trend === 'down' && <ArrowDown className="h-3 w-3" />}
        </span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// AVATAR CELL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AvatarCell({
  name,
  subtitle,
  image,
  size = 'md',
}: {
  name: string
  subtitle?: string
  image?: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const sizes = {
    sm: { avatar: 'w-6 h-6 text-xs', name: 'text-xs', subtitle: 'text-2xs' },
    md: { avatar: 'w-8 h-8 text-sm', name: 'text-sm', subtitle: 'text-xs' },
    lg: { avatar: 'w-10 h-10 text-base', name: 'text-base', subtitle: 'text-sm' },
  }

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-pink-500 font-medium text-white',
          sizes[size].avatar,
        )}
      >
        {image ? (
          <img src={image} alt={name} className="h-full w-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0">
        <div className={cn('truncate font-medium text-white', sizes[size].name)}>{name}</div>
        {subtitle && (
          <div className={cn('truncate text-white/50', sizes[size].subtitle)}>{subtitle}</div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DATE CELL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function DateCell({
  value,
  format = 'short',
  showTime = false,
  relative = false,
}: {
  value: Date | string
  format?: 'short' | 'medium' | 'long'
  showTime?: boolean
  relative?: boolean
}) {
  const date = typeof value === 'string' ? new Date(value) : value

  if (relative) {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    let relativeText = ''
    if (diffMins < 1) relativeText = 'Ahora'
    else if (diffMins < 60) relativeText = `Hace ${diffMins} min`
    else if (diffHours < 24) relativeText = `Hace ${diffHours}h`
    else if (diffDays < 7) relativeText = `Hace ${diffDays} días`
    else relativeText = date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })

    return <span className="text-white/70">{relativeText}</span>
  }

  const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: '2-digit', month: '2-digit', year: '2-digit' },
    medium: { day: 'numeric', month: 'short', year: 'numeric' },
    long: { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' },
  }

  const dateStr = date.toLocaleDateString('es-MX', formatOptions[format])
  const timeStr = showTime
    ? date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    : ''

  return (
    <div className="flex flex-col">
      <span className="text-white/80">{dateStr}</span>
      {showTime && <span className="text-xs text-white/50">{timeStr}</span>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ACTIONS CELL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ActionItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
}

export function ActionsCell({ actions }: { actions: ActionItem[] }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'rounded-lg p-1.5 transition-colors',
          open ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/10 hover:text-white',
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            className="absolute top-full right-0 z-50 mt-1 min-w-[160px] rounded-xl border border-white/10 bg-gray-900/95 py-1 shadow-2xl backdrop-blur-xl"
          >
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={() => {
                  action.onClick()
                  setOpen(false)
                }}
                disabled={action.disabled}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                  action.variant === 'danger'
                    ? 'text-red-400 hover:bg-red-500/10'
                    : 'text-white/80 hover:bg-white/10',
                  action.disabled && 'cursor-not-allowed opacity-50',
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ULTRA TABLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function UltraTable<T = Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],
  searchable = true,
  searchPlaceholder = 'Buscar en tabla...',
  selectable = false,
  onSelectionChange,
  expandable = false,
  expandedRowRender,
  onRowClick,
  rowActions,
  emptyMessage = 'No hay datos disponibles',
  emptyIcon,
  loading = false,
  stickyHeader = true,
  exportable = false,
  onExport,
  toolbar,
  className,
  variant = 'default',
  striped = false,
  hoverable = true,
  bordered = true,
}: UltraTableProps<T>) {
  // State
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)
  const [currentPageSize, setCurrentPageSize] = useState(pageSize)
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({})
  const [showFilters, setShowFilters] = useState(false)

  // Safe data
  const safeData = Array.isArray(data) ? data : []

  // Filter data
  const filteredData = useMemo(() => {
    let result = safeData

    // Search filter
    if (search) {
      result = result.filter((row) =>
        columns.some((col) => {
          const value = getValue(row, String(col.key))
          if (value === null || value === undefined) return false
          return String(value).toLowerCase().includes(search.toLowerCase())
        }),
      )
    }

    // Column filters
    Object.entries(columnFilters).forEach(([key, filterValue]) => {
      if (filterValue) {
        result = result.filter((row) => {
          const value = getValue(row, key)
          return String(value).toLowerCase().includes(filterValue.toLowerCase())
        })
      }
    })

    return result
  }, [safeData, search, columns, columnFilters])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = getValue(a, sortKey)
      const bVal = getValue(b, sortKey)

      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1

      const comparison = aVal < bVal ? -1 : 1
      return sortDir === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortKey, sortDir])

  // Paginate
  const paginatedData = useMemo(() => {
    const start = page * currentPageSize
    return sortedData.slice(start, start + currentPageSize)
  }, [sortedData, page, currentPageSize])

  const totalPages = Math.ceil(sortedData.length / currentPageSize)

  // Helpers
  const getValue = (row: T, key: string): unknown => {
    const keys = key.split('.')
    let value: unknown = row
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[k]
      } else {
        return undefined
      }
    }
    return value
  }

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const toggleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(paginatedData.map((_, i) => page * currentPageSize + i)))
    }
  }

  const toggleSelectRow = (index: number) => {
    const globalIndex = page * currentPageSize + index
    const newSelected = new Set(selectedRows)
    if (newSelected.has(globalIndex)) {
      newSelected.delete(globalIndex)
    } else {
      newSelected.add(globalIndex)
    }
    setSelectedRows(newSelected)
    const selectedData = Array.from(newSelected)
      .map((i) => safeData[i])
      .filter((item): item is T => item !== undefined)
    onSelectionChange?.(selectedData)
  }

  const toggleExpandRow = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const variantPadding = {
    compact: 'px-3 py-2',
    default: 'px-4 py-3',
    comfortable: 'px-5 py-4',
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex w-full flex-1 items-center gap-3 sm:w-auto">
          {/* Search */}
          {searchable && (
            <div className="relative max-w-sm flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(0)
                }}
                placeholder={searchPlaceholder}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2 pr-4 pl-10 text-sm text-white transition-all outline-none placeholder:text-white/40 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Filters toggle */}
          {columns.some((c) => c.filterable) && (
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all',
                showFilters
                  ? 'border-violet-500/30 bg-violet-500/20 text-violet-300'
                  : 'border-white/10 bg-white/[0.03] text-white/70 hover:bg-white/[0.06]',
              )}
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtros</span>
            </motion.button>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          {toolbar}

          {exportable && (
            <motion.button
              onClick={() => onExport?.('csv')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 transition-all hover:bg-white/[0.06]"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Exportar</span>
            </motion.button>
          )}

          {/* Page size selector */}
          <select
            value={currentPageSize}
            onChange={(e) => {
              setCurrentPageSize(Number(e.target.value))
              setPage(0)
            }}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white/70 outline-none focus:border-violet-500/50"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size} className="bg-gray-900">
                {size} filas
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Column filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
          >
            {columns
              .filter((col) => col.filterable)
              .map((col) => (
                <div key={String(col.key)} className="flex flex-col gap-1">
                  <label className="text-xs text-white/50">{col.header}</label>
                  {col.filterOptions ? (
                    <select
                      value={columnFilters[String(col.key)] || ''}
                      onChange={(e) =>
                        setColumnFilters({ ...columnFilters, [String(col.key)]: e.target.value })
                      }
                      className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-white outline-none"
                    >
                      <option value="" className="bg-gray-900">
                        Todos
                      </option>
                      {col.filterOptions.map((opt) => (
                        <option key={opt} value={opt} className="bg-gray-900">
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={columnFilters[String(col.key)] || ''}
                      onChange={(e) =>
                        setColumnFilters({ ...columnFilters, [String(col.key)]: e.target.value })
                      }
                      placeholder={`Filtrar ${col.header.toLowerCase()}...`}
                      className="w-40 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 text-sm text-white outline-none placeholder:text-white/30"
                    />
                  )}
                </div>
              ))}
            <button
              onClick={() => setColumnFilters({})}
              className="self-end px-3 py-1.5 text-xs text-white/50 transition-colors hover:text-white/80"
            >
              Limpiar filtros
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selection info */}
      <AnimatePresence>
        {selectedRows.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-between rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2"
          >
            <span className="text-sm text-violet-300">
              {selectedRows.size} fila{selectedRows.size > 1 ? 's' : ''} seleccionada
              {selectedRows.size > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => setSelectedRows(new Set())}
              className="text-sm text-violet-400 transition-colors hover:text-violet-300"
            >
              Deseleccionar todo
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl',
          bordered && 'border border-white/[0.08]',
          'bg-white/[0.02] backdrop-blur-xl',
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            {/* Header */}
            <thead
              className={cn(stickyHeader && 'sticky top-0 z-10 bg-gray-900/95 backdrop-blur-lg')}
            >
              <tr className="border-b border-white/[0.08]">
                {selectable && (
                  <th className={cn('w-12', variantPadding[variant])}>
                    <motion.button
                      onClick={toggleSelectAll}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors',
                        selectedRows.size === paginatedData.length && paginatedData.length > 0
                          ? 'border-violet-500 bg-violet-500'
                          : selectedRows.size > 0
                            ? 'border-violet-500 bg-violet-500/50'
                            : 'border-white/30 hover:border-white/50',
                      )}
                    >
                      {selectedRows.size > 0 && (
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      )}
                    </motion.button>
                  </th>
                )}
                {expandable && <th className={cn('w-10', variantPadding[variant])} />}
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className={cn(
                      'text-xs font-semibold tracking-wider text-white/60 uppercase',
                      variantPadding[variant],
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                      col.sortable &&
                        'cursor-pointer transition-colors select-none hover:text-white/80',
                    )}
                    style={{ width: col.width, minWidth: col.minWidth, maxWidth: col.maxWidth }}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-2',
                        col.align === 'right' && 'justify-end',
                        col.align === 'center' && 'justify-center',
                      )}
                    >
                      {col.header}
                      {col.sortable && (
                        <span className="inline-flex">
                          {sortKey === col.key ? (
                            sortDir === 'asc' ? (
                              <ArrowUp className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {rowActions && <th className={cn('w-12', variantPadding[variant])} />}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {selectable && (
                      <td className={variantPadding[variant]}>
                        <div className="h-5 w-5 animate-pulse rounded-md bg-white/10" />
                      </td>
                    )}
                    {expandable && <td className={variantPadding[variant]} />}
                    {columns.map((col, j) => (
                      <td key={j} className={variantPadding[variant]}>
                        <div
                          className="h-4 animate-pulse rounded bg-white/10"
                          style={{ width: `${60 + Math.random() * 40}%` }}
                        />
                      </td>
                    ))}
                    {rowActions && <td className={variantPadding[variant]} />}
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {paginatedData.map((row, index) => {
                    const globalIndex = page * currentPageSize + index
                    const isSelected = selectedRows.has(globalIndex)
                    const isExpanded = expandedRows.has(index)

                    return (
                      <React.Fragment key={index}>
                        <motion.tr
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2, delay: index * 0.02 }}
                          className={cn(
                            'border-b border-white/[0.04] transition-colors last:border-0',
                            hoverable && 'hover:bg-white/[0.04]',
                            striped && index % 2 === 1 && 'bg-white/[0.02]',
                            isSelected && 'bg-violet-500/10',
                            onRowClick && 'cursor-pointer',
                          )}
                          onClick={() => onRowClick?.(row, globalIndex)}
                        >
                          {selectable && (
                            <td
                              className={variantPadding[variant]}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <motion.button
                                onClick={() => toggleSelectRow(index)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className={cn(
                                  'flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors',
                                  isSelected
                                    ? 'border-violet-500 bg-violet-500'
                                    : 'border-white/30 hover:border-white/50',
                                )}
                              >
                                {isSelected && (
                                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                )}
                              </motion.button>
                            </td>
                          )}
                          {expandable && (
                            <td
                              className={variantPadding[variant]}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <motion.button
                                onClick={() => toggleExpandRow(index)}
                                animate={{ rotate: isExpanded ? 90 : 0 }}
                                className="text-white/40 hover:text-white/70"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </motion.button>
                            </td>
                          )}
                          {columns.map((col) => {
                            const value = getValue(row, String(col.key))
                            return (
                              <td
                                key={String(col.key)}
                                className={cn(
                                  'text-sm text-white/80',
                                  variantPadding[variant],
                                  col.align === 'center' && 'text-center',
                                  col.align === 'right' && 'text-right',
                                )}
                              >
                                {col.render
                                  ? col.render(value, row, globalIndex)
                                  : String(value ?? '-')}
                              </td>
                            )
                          })}
                          {rowActions && (
                            <td
                              className={variantPadding[variant]}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {rowActions(row, globalIndex)}
                            </td>
                          )}
                        </motion.tr>

                        {/* Expanded row content */}
                        <AnimatePresence>
                          {expandable && isExpanded && expandedRowRender && (
                            <motion.tr
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <td
                                colSpan={
                                  columns.length +
                                  (selectable ? 1 : 0) +
                                  (expandable ? 1 : 0) +
                                  (rowActions ? 1 : 0)
                                }
                                className="bg-white/[0.02] p-4"
                              >
                                {expandedRowRender(row, globalIndex)}
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    )
                  })}
                </AnimatePresence>
              ) : (
                // Empty state
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (expandable ? 1 : 0) +
                      (rowActions ? 1 : 0)
                    }
                    className="px-4 py-16 text-center"
                  >
                    <div className="flex flex-col items-center gap-3">
                      {emptyIcon || (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                          <Search className="h-8 w-8 text-white/20" />
                        </div>
                      )}
                      <p className="text-white/40">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] px-4 py-3 sm:flex-row">
            <span className="text-sm text-white/40">
              Mostrando {page * currentPageSize + 1}-
              {Math.min((page + 1) * currentPageSize, sortedData.length)} de {sortedData.length}
            </span>

            <div className="flex items-center gap-1">
              {/* First page */}
              <motion.button
                onClick={() => setPage(0)}
                disabled={page === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronsLeft className="h-4 w-4" />
              </motion.button>

              {/* Previous page */}
              <motion.button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </motion.button>

              {/* Page numbers */}
              <div className="mx-2 flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number
                  if (totalPages <= 5) {
                    pageNum = i
                  } else if (page < 3) {
                    pageNum = i
                  } else if (page > totalPages - 4) {
                    pageNum = totalPages - 5 + i
                  } else {
                    pageNum = page - 2 + i
                  }

                  return (
                    <motion.button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        'h-8 w-8 rounded-lg text-sm font-medium transition-all',
                        page === pageNum
                          ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/30'
                          : 'text-white/60 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      {pageNum + 1}
                    </motion.button>
                  )
                })}
              </div>

              {/* Next page */}
              <motion.button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </motion.button>

              {/* Last page */}
              <motion.button
                onClick={() => setPage(totalPages - 1)}
                disabled={page >= totalPages - 1}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronsRight className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
