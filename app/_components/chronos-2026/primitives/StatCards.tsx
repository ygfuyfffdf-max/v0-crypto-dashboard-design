/**
 * 📊 STAT CARDS 2026 - TARJETAS DE ESTADÍSTICAS HERO
 * ═══════════════════════════════════════════════════════════════════════════
 * Componentes para mostrar KPIs y estadísticas con estilo Year Wrapped
 * - Hero stat con número grande
 * - Stat con cambio porcentual
 * - Mini stats grid
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════
// HERO STAT CARD - Para números grandes como "1,492" o "84.5k"
// ═══════════════════════════════════════════════════════════════════════════

export interface HeroStatCardProps {
  label: string
  value: string | number
  subtitle?: string
  change?: {
    value: number
    label?: string
  }
  color?: 'rose' | 'purple' | 'gold' | 'lime' | 'orange' | 'white'
  className?: string
}

const colorStyles = {
  rose: {
    value: 'text-rose-400',
    label: 'text-rose-500/80',
    badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  },
  purple: {
    value: 'text-purple-400',
    label: 'text-purple-500/80',
    badge: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  gold: {
    value: 'text-amber-400',
    label: 'text-amber-500/80',
    badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  },
  lime: {
    value: 'text-lime-400',
    label: 'text-lime-500/80',
    badge: 'bg-lime-500/20 text-lime-400 border-lime-500/30',
  },
  orange: {
    value: 'text-orange-400',
    label: 'text-orange-500/80',
    badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  white: {
    value: 'text-white',
    label: 'text-white/60',
    badge: 'bg-white/10 text-white border-white/20',
  },
}

export function HeroStatCard({
  label,
  value,
  subtitle,
  change,
  color = 'rose',
  className = '',
}: HeroStatCardProps) {
  const styles = colorStyles[color]
  const isPositive = change && change.value > 0
  const isNegative = change && change.value < 0

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Label superior */}
      <span className={`text-xs font-semibold tracking-widest uppercase ${styles.label}`}>
        {label}
      </span>

      {/* Valor principal */}
      <motion.div
        className={`text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl ${styles.value}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        {typeof value === 'number' ? value.toLocaleString() : value}
      </motion.div>

      {/* Cambio porcentual */}
      {change && (
        <motion.div
          className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${isPositive ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400' : ''} ${isNegative ? 'border-red-500/30 bg-red-500/20 text-red-400' : ''} ${!isPositive && !isNegative ? 'border-white/20 bg-white/10 text-white/70' : ''} `}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          {isPositive && <TrendingUp className="h-3.5 w-3.5" />}
          {isNegative && <TrendingDown className="h-3.5 w-3.5" />}
          {!isPositive && !isNegative && <Minus className="h-3.5 w-3.5" />}
          <span>
            {isPositive ? '+' : ''}
            {change.value}%{change.label && ` ${change.label}`}
          </span>
        </motion.div>
      )}

      {/* Subtítulo */}
      {subtitle && <p className="mt-1 text-sm text-white/50">{subtitle}</p>}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPACT STAT - Para stats más pequeños en línea
// ═══════════════════════════════════════════════════════════════════════════

export interface CompactStatProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  className?: string
}

export function CompactStat({
  label,
  value,
  icon,
  trend,
  trendValue,
  className = '',
}: CompactStatProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/70">
          {icon}
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-xs tracking-wide text-white/50 uppercase">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {trend && trendValue && (
            <span
              className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-400' : ''} ${trend === 'down' ? 'text-red-400' : ''} ${trend === 'neutral' ? 'text-white/50' : ''} `}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '−'} {trendValue}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// CURRENCY STAT - Para valores monetarios
// ═══════════════════════════════════════════════════════════════════════════

export interface CurrencyStatProps {
  label: string
  amount: number
  currency?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'green' | 'red' | 'gold' | 'white' | 'purple'
  showSign?: boolean
  className?: string
}

export function CurrencyStat({
  label,
  amount,
  currency = '$',
  size = 'lg',
  color = 'white',
  showSign = false,
  className = '',
}: CurrencyStatProps) {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl md:text-4xl',
    xl: 'text-4xl md:text-5xl',
  }

  const colorClasses = {
    green: 'text-emerald-400',
    red: 'text-red-400',
    gold: 'text-amber-400',
    white: 'text-white',
    purple: 'text-purple-400',
  }

  const formattedAmount = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  const sign = showSign && amount !== 0 ? (amount > 0 ? '+' : '-') : ''

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium tracking-wider text-white/50 uppercase">{label}</span>
      <motion.div
        className={`${sizeClasses[size]} font-bold tracking-tight ${colorClasses[color]}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {sign}
        {currency}
        {formattedAmount}
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED COUNTER - Contador animado
// ═══════════════════════════════════════════════════════════════════════════

export interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
  className?: string
}

export function AnimatedCounter({
  value,
  duration = 2,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(0)

  React.useEffect(() => {
    const startTime = Date.now()
    const endTime = startTime + duration * 1000

    const updateValue = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / (duration * 1000), 1)

      // Easing: ease-out-expo
      const eased = 1 - Math.pow(1 - progress, 4)
      const currentValue = eased * value

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(updateValue)
      }
    }

    requestAnimationFrame(updateValue)
  }, [value, duration])

  return (
    <span className={className}>
      {prefix}
      {displayValue.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// STATS ROW - Fila de stats compactos
// ═══════════════════════════════════════════════════════════════════════════

export interface StatsRowProps {
  stats: Array<{
    label: string
    value: string | number
    color?: 'white' | 'rose' | 'purple' | 'gold' | 'lime' | 'red'
  }>
  className?: string
}

export function StatsRow({ stats, className = '' }: StatsRowProps) {
  const colorMap = {
    white: 'text-white',
    rose: 'text-rose-400',
    purple: 'text-purple-400',
    gold: 'text-amber-400',
    lime: 'text-lime-400',
    red: 'text-red-400',
  }

  return (
    <div className={`flex items-center gap-6 ${className}`}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.label}>
          <div className="flex flex-col">
            <span className="text-xs tracking-wide text-white/40 uppercase">{stat.label}</span>
            <span className={`text-xl font-semibold ${colorMap[stat.color || 'white']}`}>
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </span>
          </div>
          {index < stats.length - 1 && <div className="h-8 w-px bg-white/10" />}
        </React.Fragment>
      ))}
    </div>
  )
}
