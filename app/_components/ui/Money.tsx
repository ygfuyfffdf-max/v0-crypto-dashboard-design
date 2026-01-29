'use client'

import { memo } from 'react'
import { useCurrency } from '@/app/hooks/useCurrency'
import { cn } from '@/app/_lib/utils'

// ============================================
// COMPONENTE MONEY - Muestra valores con tipo de cambio
// ============================================

interface MoneyProps {
  /** Cantidad en USD (moneda base) */
  amount: number
  /** Forzar moneda específica */
  currency?: 'USD' | 'MXN'
  /** Mostrar dual USD + MXN */
  dual?: boolean
  /** Formato compacto (1K, 1M) */
  compact?: boolean
  /** Clases CSS adicionales */
  className?: string
  /** Tamaño del texto */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  /** Color según valor positivo/negativo */
  colorize?: boolean
}

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl font-semibold',
}

export const Money = memo(function Money({
  amount,
  currency,
  dual = false,
  compact = false,
  className,
  size = 'md',
  colorize = false,
}: MoneyProps) {
  const { format, formatCompact, formatDual, formatUSD, formatMXN, displayCurrency } = useCurrency()

  let displayValue: string

  if (dual) {
    displayValue = formatDual(amount)
  } else if (compact) {
    displayValue = formatCompact(amount)
  } else if (currency === 'USD') {
    displayValue = formatUSD(amount)
  } else if (currency === 'MXN') {
    displayValue = formatMXN(amount)
  } else {
    displayValue = format(amount)
  }

  const colorClass = colorize
    ? amount > 0
      ? 'text-emerald-400'
      : amount < 0
        ? 'text-red-400'
        : 'text-gray-400'
    : ''

  return (
    <span
      className={cn(
        'font-mono tabular-nums tracking-tight',
        sizeClasses[size],
        colorClass,
        className
      )}
    >
      {displayValue}
    </span>
  )
})

// ============================================
// COMPONENTE MONEY CARD - Para dashboards
// ============================================

interface MoneyCardProps {
  label: string
  amount: number
  icon?: React.ReactNode
  trend?: number
  className?: string
}

export const MoneyCard = memo(function MoneyCard({
  label,
  amount,
  icon,
  trend,
  className,
}: MoneyCardProps) {
  const { format, formatDual } = useCurrency()

  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-br from-white/5 to-white/[0.02] p-4',
        'border border-white/10 backdrop-blur-sm',
        'transition-all duration-300 hover:border-white/20 hover:shadow-lg',
        className
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-400">{label}</span>
        {icon && <span className="text-gray-500">{icon}</span>}
      </div>

      <div className="space-y-1">
        <Money amount={amount} size="xl" className="block" />
        <span className="text-xs text-gray-500">
          {formatDual(amount)}
        </span>
      </div>

      {trend !== undefined && (
        <div
          className={cn(
            'mt-2 text-xs flex items-center gap-1',
            trend > 0 ? 'text-emerald-400' : trend < 0 ? 'text-red-400' : 'text-gray-400'
          )}
        >
          <span>{trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}</span>
          <span>{Math.abs(trend).toFixed(1)}%</span>
        </div>
      )}
    </div>
  )
})

// ============================================
// COMPONENTE EXCHANGE RATE DISPLAY
// ============================================

export const ExchangeRateDisplay = memo(function ExchangeRateDisplay({
  className,
}: {
  className?: string
}) {
  const { exchangeRate, displayCurrency, setDisplayCurrency } = useCurrency()

  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      <span className="text-gray-400">1 USD =</span>
      <span className="font-mono text-emerald-400">{exchangeRate.toFixed(2)} MXN</span>
      <button
        onClick={() => setDisplayCurrency(displayCurrency === 'USD' ? 'MXN' : 'USD')}
        className="ml-2 px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-xs"
      >
        {displayCurrency}
      </button>
    </div>
  )
})
