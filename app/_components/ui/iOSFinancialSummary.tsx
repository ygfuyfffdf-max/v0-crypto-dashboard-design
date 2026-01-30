/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💰 CHRONOS 2026 — iOS FINANCIAL SUMMARY WIDGET
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Widget de resumen financiero con:
 * - Cards de métricas estilo iOS
 * - Scroll horizontal suave
 * - Animaciones Premium sin efectos 3D
 * - Diseño limpio y minimalista
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { motion, AnimatePresence } from 'motion/react'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ChevronRight,
  Sparkles,
  DollarSign,
  PiggyBank,
  CreditCard,
  Building2,
  LucideIcon,
} from 'lucide-react'
import { memo, useMemo, useState } from 'react'
import { iOSHorizontalScroll, iOSCarouselItem } from './iOSScrollContainers'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FinancialMetric {
  id: string
  label: string
  value: number
  previousValue?: number
  icon: LucideIcon
  color: 'violet' | 'emerald' | 'rose' | 'amber' | 'blue'
  format?: 'currency' | 'number' | 'percentage'
}

interface iOSFinancialSummaryProps {
  capitalTotal: number
  capitalPrevious?: number
  ingresos: number
  ingresosPrevious?: number
  gastos: number
  gastosPrevious?: number
  utilidades: number
  utilidadesPrevious?: number
  deudas?: number
  pendientes?: number
  isLoading?: boolean
  onRefresh?: () => void
  onMetricClick?: (metricId: string) => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COLORES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const colorMap = {
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
    icon: 'bg-violet-500/20',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.15)]',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
    icon: 'bg-emerald-500/20',
    glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
    icon: 'bg-rose-500/20',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.15)]',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-400',
    icon: 'bg-amber-500/20',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
  },
  blue: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
    icon: 'bg-blue-500/20',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// METRIC CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  metric: FinancialMetric
  onClick?: () => void
  isHighlighted?: boolean
}

const MetricCard = memo(function MetricCard({
  metric,
  onClick,
  isHighlighted = false,
}: MetricCardProps) {
  const colors = colorMap[metric.color]
  const Icon = metric.icon

  // Calculate trend
  const trend = useMemo(() => {
    if (!metric.previousValue || metric.previousValue === 0) return null
    const change = ((metric.value - metric.previousValue) / metric.previousValue) * 100
    return {
      value: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'up' : 'down',
    }
  }, [metric.value, metric.previousValue])

  // Format value
  const formattedValue = useMemo(() => {
    switch (metric.format) {
      case 'percentage':
        return `${metric.value.toFixed(1)}%`
      case 'number':
        return metric.value.toLocaleString()
      default:
        return formatCurrency(metric.value)
    }
  }, [metric.value, metric.format])

  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative w-full p-5 rounded-2xl border text-left',
        'backdrop-blur-sm transition-all duration-200',
        colors.bg,
        colors.border,
        isHighlighted && colors.glow,
        onClick && 'hover:bg-white/[0.08] active:scale-[0.98]'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl', colors.icon)}>
          <Icon className={cn('h-5 w-5', colors.text)} />
        </div>

        {trend && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold',
            trend.direction === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
          )}>
            {trend.direction === 'up' ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {trend.value}%
          </div>
        )}
      </div>

      {/* Value */}
      <p className="text-2xl font-bold text-white mb-1">
        {formattedValue}
      </p>

      {/* Label */}
      <p className="text-[13px] text-white/50">{metric.label}</p>

      {/* Decorative shine */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HERO CARD (Capital Total)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HeroCardProps {
  value: number
  previousValue?: number
  isLoading?: boolean
  onRefresh?: () => void
}

const HeroCard = memo(function HeroCard({
  value,
  previousValue,
  isLoading,
  onRefresh,
}: HeroCardProps) {
  const trend = useMemo(() => {
    if (!previousValue || previousValue === 0) return null
    const change = ((value - previousValue) / previousValue) * 100
    return {
      value: Math.abs(change).toFixed(1),
      direction: change >= 0 ? 'up' : 'down',
    }
  }, [value, previousValue])

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-3xl p-6',
        'bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-fuchsia-500/10',
        'border border-violet-500/20',
        'backdrop-blur-xl'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-fuchsia-500/10 rounded-full blur-2xl" />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-violet-500/30 backdrop-blur-sm">
              <Wallet className="h-6 w-6 text-violet-300" />
            </div>
            <div>
              <p className="text-[13px] text-white/50 font-medium">Capital Total</p>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-[11px] text-amber-400 font-medium">En tiempo real</span>
              </div>
            </div>
          </div>

          {onRefresh && (
            <motion.button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-50"
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={cn('h-4 w-4 text-white/70', isLoading && 'animate-spin')} />
            </motion.button>
          )}
        </div>

        {/* Value */}
        <div className="mb-4">
          <motion.p
            className="text-4xl font-bold text-white"
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {formatCurrency(value)}
          </motion.p>
        </div>

        {/* Trend */}
        {trend && (
          <div className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
            trend.direction === 'up' ? 'bg-emerald-500/20' : 'bg-rose-500/20'
          )}>
            {trend.direction === 'up' ? (
              <TrendingUp className="h-4 w-4 text-emerald-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-400" />
            )}
            <span className={cn(
              'text-[13px] font-semibold',
              trend.direction === 'up' ? 'text-emerald-400' : 'text-rose-400'
            )}>
              {trend.value}% vs período anterior
            </span>
          </div>
        )}
      </div>

      {/* Shine line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const iOSFinancialSummary = memo(function iOSFinancialSummary({
  capitalTotal,
  capitalPrevious,
  ingresos,
  ingresosPrevious,
  gastos,
  gastosPrevious,
  utilidades,
  utilidadesPrevious,
  deudas = 0,
  pendientes = 0,
  isLoading = false,
  onRefresh,
  onMetricClick,
  className,
}: iOSFinancialSummaryProps) {
  const metrics: FinancialMetric[] = useMemo(() => [
    {
      id: 'ingresos',
      label: 'Ingresos del Mes',
      value: ingresos,
      previousValue: ingresosPrevious,
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      id: 'gastos',
      label: 'Gastos del Mes',
      value: gastos,
      previousValue: gastosPrevious,
      icon: TrendingDown,
      color: 'rose',
    },
    {
      id: 'utilidades',
      label: 'Utilidades',
      value: utilidades,
      previousValue: utilidadesPrevious,
      icon: PiggyBank,
      color: 'amber',
    },
    {
      id: 'deudas',
      label: 'Deudas por Cobrar',
      value: deudas,
      icon: CreditCard,
      color: 'blue',
    },
  ], [ingresos, ingresosPrevious, gastos, gastosPrevious, utilidades, utilidadesPrevious, deudas])

  return (
    <div className={cn('space-y-4', className)}>
      {/* Hero Card - Capital Total */}
      <HeroCard
        value={capitalTotal}
        previousValue={capitalPrevious}
        isLoading={isLoading}
        onRefresh={onRefresh}
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <MetricCard
            key={metric.id}
            metric={metric}
            onClick={onMetricClick ? () => onMetricClick(metric.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPACT VARIANT (Horizontal scroll)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSFinancialSummaryCompactProps {
  metrics: {
    label: string
    value: number
    trend?: number
    color: 'violet' | 'emerald' | 'rose' | 'amber' | 'blue'
  }[]
  className?: string
}

export const iOSFinancialSummaryCompact = memo(function iOSFinancialSummaryCompact({
  metrics,
  className,
}: iOSFinancialSummaryCompactProps) {
  return (
    <div className={cn('overflow-x-auto scrollbar-none', className)}>
      <div className="flex gap-3 pb-2">
        {metrics.map((metric, index) => {
          const colors = colorMap[metric.color]

          return (
            <motion.div
              key={index}
              className={cn(
                'flex-shrink-0 px-4 py-3 rounded-xl border backdrop-blur-sm min-w-[140px]',
                colors.bg,
                colors.border
              )}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <p className="text-lg font-bold text-white">
                {formatCurrency(metric.value)}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[12px] text-white/50">{metric.label}</p>
                {metric.trend !== undefined && (
                  <span className={cn(
                    'text-[10px] font-semibold',
                    metric.trend >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  )}>
                    {metric.trend >= 0 ? '+' : ''}{metric.trend}%
                  </span>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  FinancialMetric,
  iOSFinancialSummaryProps,
  iOSFinancialSummaryCompactProps,
}

export default iOSFinancialSummary
