'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💱 EXCHANGE RATE WIDGET — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Widget premium de tipo de cambio:
 * - Actualización en tiempo real
 * - Histórico y tendencias
 * - Calculadora de conversión
 * - Alertas de variación
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { useQuery } from '@tanstack/react-query'
import {
    Activity,
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Bell,
    Calculator,
    DollarSign,
    History,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    X
} from 'lucide-react'
import { motion } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ExchangeRateData {
  rate: number
  previousRate: number
  change: number
  changePercent: number
  updatedAt: Date
  source: string
}

interface ExchangeRateHistory {
  date: Date
  rate: number
  high: number
  low: number
}

interface ExchangeRateAlert {
  id: string
  type: 'above' | 'below'
  threshold: number
  enabled: boolean
  notified: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// RATE DISPLAY COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface RateDisplayProps {
  rate: number
  change: number
  changePercent: number
  updatedAt: Date
  isLoading?: boolean
  onRefresh?: () => void
}

const RateDisplay = memo(function RateDisplay({
  rate,
  change,
  changePercent,
  updatedAt,
  isLoading,
  onRefresh,
}: RateDisplayProps) {
  const isPositive = change >= 0

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-amber-600/10 p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Background glow */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-amber-500/20 p-2">
              <DollarSign className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">USD / MXN</h3>
              <p className="text-xs text-white/50">Tipo de Cambio</p>
            </div>
          </div>
          <motion.button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
          </motion.button>
        </div>

        {/* Main Rate */}
        <div className="flex items-end gap-4 mb-4">
          {isLoading ? (
            <div className="h-12 w-40 bg-white/10 rounded animate-pulse" />
          ) : (
            <motion.p
              className="text-4xl font-bold text-amber-400"
              key={rate}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              ${rate.toFixed(4)}
            </motion.p>
          )}

          <motion.div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-medium',
              isPositive
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-rose-500/20 text-rose-400'
            )}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {isPositive ? (
              <TrendingUp className="h-4 w-4" />
            ) : (
              <TrendingDown className="h-4 w-4" />
            )}
            {isPositive ? '+' : ''}{change.toFixed(4)} ({changePercent.toFixed(2)}%)
          </motion.div>
        </div>

        {/* Last Update */}
        <div className="flex items-center gap-2 text-xs text-white/50">
          <Activity className="h-3 w-3" />
          <span>
            Actualizado: {new Date(updatedAt).toLocaleString('es-MX', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </span>
        </div>
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONVERTER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ConverterProps {
  rate: number
}

const Converter = memo(function Converter({ rate }: ConverterProps) {
  const [usdAmount, setUsdAmount] = useState<string>('')
  const [mxnAmount, setMxnAmount] = useState<string>('')
  const [direction, setDirection] = useState<'usd_to_mxn' | 'mxn_to_usd'>('usd_to_mxn')

  const handleUsdChange = useCallback((value: string) => {
    setUsdAmount(value)
    if (value && !isNaN(parseFloat(value))) {
      setMxnAmount((parseFloat(value) * rate).toFixed(2))
    } else {
      setMxnAmount('')
    }
    setDirection('usd_to_mxn')
  }, [rate])

  const handleMxnChange = useCallback((value: string) => {
    setMxnAmount(value)
    if (value && !isNaN(parseFloat(value))) {
      setUsdAmount((parseFloat(value) / rate).toFixed(2))
    } else {
      setUsdAmount('')
    }
    setDirection('mxn_to_usd')
  }, [rate])

  const swapCurrencies = useCallback(() => {
    const tempUsd = usdAmount
    const tempMxn = mxnAmount

    if (direction === 'usd_to_mxn') {
      setDirection('mxn_to_usd')
      setMxnAmount(tempUsd)
      setUsdAmount(tempMxn)
    } else {
      setDirection('usd_to_mxn')
      setUsdAmount(tempMxn)
      setMxnAmount(tempUsd)
    }
  }, [usdAmount, mxnAmount, direction])

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-violet-400" />
        <h3 className="font-semibold text-white">Calculadora</h3>
      </div>

      <div className="space-y-3">
        {/* USD Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-xs font-bold text-emerald-400">USD</span>
            </div>
          </div>
          <input
            type="number"
            value={usdAmount}
            onChange={(e) => handleUsdChange(e.target.value)}
            placeholder="0.00"
            className="w-full pl-14 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-right text-lg font-semibold placeholder-white/30 focus:border-violet-500 focus:outline-none"
          />
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <motion.button
            onClick={swapCurrencies}
            className="p-2 rounded-full bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
          >
            <ArrowUpDown className="h-5 w-5" />
          </motion.button>
        </div>

        {/* MXN Input */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <span className="text-xs font-bold text-amber-400">MXN</span>
            </div>
          </div>
          <input
            type="number"
            value={mxnAmount}
            onChange={(e) => handleMxnChange(e.target.value)}
            placeholder="0.00"
            className="w-full pl-14 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-right text-lg font-semibold placeholder-white/30 focus:border-violet-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Rate Reference */}
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
        <span className="text-white/50">Tasa aplicada:</span>
        <span className="text-amber-400 font-semibold">1 USD = {rate.toFixed(4)} MXN</span>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HISTORY CHART MINI
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HistoryChartMiniProps {
  history: ExchangeRateHistory[]
}

const HistoryChartMini = memo(function HistoryChartMini({ history }: HistoryChartMiniProps) {
  const { minRate, maxRate, points } = useMemo(() => {
    if (!history.length) return { minRate: 0, maxRate: 0, points: '' }

    const rates = history.map((h) => h.rate)
    const min = Math.min(...rates) * 0.999
    const max = Math.max(...rates) * 1.001
    const range = max - min

    const pts = history.map((h, i) => {
      const x = (i / (history.length - 1)) * 100
      const y = 100 - ((h.rate - min) / range) * 100
      return `${x},${y}`
    }).join(' ')

    return { minRate: min, maxRate: max, points: pts }
  }, [history])

  if (!history.length) return null

  const lastRate = history.at(-1)?.rate ?? 0
  const firstRate = history[0]!.rate
  const trendUp = lastRate >= firstRate

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-blue-400" />
          <h3 className="font-semibold text-white">Histórico (7 días)</h3>
        </div>
        <div className={cn(
          'flex items-center gap-1 text-sm',
          trendUp ? 'text-emerald-400' : 'text-rose-400'
        )}>
          {trendUp ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {((lastRate - firstRate) / firstRate * 100).toFixed(2)}%
        </div>
      </div>

      {/* SVG Chart */}
      <div className="relative h-32">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="100"
              y2={y}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="0.5"
            />
          ))}

          {/* Gradient fill */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendUp ? '#10B981' : '#F43F5E'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={trendUp ? '#10B981' : '#F43F5E'} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#chartGradient)"
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={trendUp ? '#10B981' : '#F43F5E'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Rate labels */}
        <div className="absolute right-0 top-0 text-xs text-white/40">
          ${maxRate.toFixed(2)}
        </div>
        <div className="absolute right-0 bottom-0 text-xs text-white/40">
          ${minRate.toFixed(2)}
        </div>
      </div>

      {/* Date range */}
      <div className="flex items-center justify-between mt-2 text-xs text-white/40">
        <span>{new Date(history[0]!.date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
        <span>{new Date(history.at(-1)?.date ?? Date.now()).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</span>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ALERT SETTINGS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AlertSettingsProps {
  alerts: ExchangeRateAlert[]
  currentRate: number
  onAddAlert: (type: 'above' | 'below', threshold: number) => void
  onToggleAlert: (id: string) => void
  onDeleteAlert: (id: string) => void
}

const AlertSettings = memo(function AlertSettings({
  alerts,
  currentRate,
  onAddAlert,
  onToggleAlert,
  onDeleteAlert,
}: AlertSettingsProps) {
  const [newThreshold, setNewThreshold] = useState('')
  const [newType, setNewType] = useState<'above' | 'below'>('above')

  const handleAdd = () => {
    const threshold = parseFloat(newThreshold)
    if (!isNaN(threshold) && threshold > 0) {
      onAddAlert(newType, threshold)
      setNewThreshold('')
      toast.success('Alerta creada')
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-amber-400" />
        <h3 className="font-semibold text-white">Alertas de Precio</h3>
      </div>

      {/* Current alerts */}
      <div className="space-y-2 mb-4">
        {alerts.length > 0 ? (
          alerts.map((alert) => {
            const isTriggered = alert.type === 'above'
              ? currentRate >= alert.threshold
              : currentRate <= alert.threshold

            return (
              <motion.div
                key={alert.id}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border transition-colors',
                  alert.enabled
                    ? isTriggered
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white/5 border-white/10'
                    : 'bg-white/[0.02] border-white/5 opacity-50'
                )}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-2">
                  {alert.type === 'above' ? (
                    <ArrowUp className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <ArrowDown className="h-4 w-4 text-rose-400" />
                  )}
                  <span className="text-sm text-white">
                    {alert.type === 'above' ? 'Mayor a' : 'Menor a'} ${alert.threshold.toFixed(4)}
                  </span>
                  {isTriggered && alert.enabled && (
                    <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">
                      Activa
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleAlert(alert.id)}
                    className={cn(
                      'h-5 w-9 rounded-full p-0.5 transition-colors',
                      alert.enabled ? 'bg-violet-500' : 'bg-white/20'
                    )}
                  >
                    <motion.div
                      className="h-4 w-4 rounded-full bg-white shadow-sm"
                      animate={{ x: alert.enabled ? 16 : 0 }}
                    />
                  </button>
                  <button
                    onClick={() => onDeleteAlert(alert.id)}
                    className="p-1 text-white/30 hover:text-rose-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )
          })
        ) : (
          <p className="text-center text-white/50 py-4 text-sm">
            Sin alertas configuradas
          </p>
        )}
      </div>

      {/* Add new alert */}
      <div className="flex items-center gap-2">
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as 'above' | 'below')}
          className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-violet-500 focus:outline-none"
        >
          <option value="above">Mayor a</option>
          <option value="below">Menor a</option>
        </select>
        <input
          type="number"
          value={newThreshold}
          onChange={(e) => setNewThreshold(e.target.value)}
          placeholder={currentRate.toFixed(2)}
          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:border-violet-500 focus:outline-none"
        />
        <motion.button
          onClick={handleAdd}
          className="px-3 py-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
        >
          Agregar
        </motion.button>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ExchangeRateWidgetProps {
  className?: string
  compact?: boolean
}

export function ExchangeRateWidget({ className, compact = false }: ExchangeRateWidgetProps) {
  const [alerts, setAlerts] = useState<ExchangeRateAlert[]>([])

  // Fetch current rate
  const { data: rateData, isLoading, refetch, isRefetching } = useQuery<ExchangeRateData>({
    queryKey: ['exchange-rate'],
    queryFn: async () => {
      const res = await fetch('/api/tipo-cambio')
      if (!res.ok) throw new Error('Failed to fetch rate')
      return res.json()
    },
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  })

  // Fetch history
  const { data: history } = useQuery<ExchangeRateHistory[]>({
    queryKey: ['exchange-rate-history'],
    queryFn: async () => {
      const res = await fetch('/api/tipo-cambio/historial?days=7')
      if (!res.ok) throw new Error('Failed to fetch history')
      return res.json()
    },
    staleTime: 3600000, // 1 hour
    enabled: !compact,
  })

  // Default values
  const defaultRate: ExchangeRateData = {
    rate: 17.0,
    previousRate: 17.0,
    change: 0,
    changePercent: 0,
    updatedAt: new Date(),
    source: 'default',
  }

  const currentRate = rateData || defaultRate

  // Alert handlers
  const handleAddAlert = useCallback((type: 'above' | 'below', threshold: number) => {
    const newAlert: ExchangeRateAlert = {
      id: Date.now().toString(),
      type,
      threshold,
      enabled: true,
      notified: false,
    }
    setAlerts((prev) => [...prev, newAlert])
  }, [])

  const handleToggleAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    )
  }, [])

  const handleDeleteAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id))
  }, [])

  // Check alerts on rate change
  useEffect(() => {
    if (!rateData) return

    alerts.forEach((alert) => {
      if (!alert.enabled || alert.notified) return

      const triggered =
        alert.type === 'above'
          ? rateData.rate >= alert.threshold
          : rateData.rate <= alert.threshold

      if (triggered) {
        toast.info(
          `Tipo de cambio ${alert.type === 'above' ? 'supera' : 'bajo de'} $${alert.threshold.toFixed(4)}`,
          {
            description: `Actual: $${rateData.rate.toFixed(4)}`,
            duration: 10000,
          }
        )
        setAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? { ...a, notified: true } : a))
        )
      }
    })
  }, [rateData, alerts])

  if (compact) {
    // Compact version for sidebar/header
    return (
      <motion.div
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20',
          className
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <DollarSign className="h-5 w-5 text-amber-400" />
        <div>
          <p className="text-sm font-semibold text-white">
            ${currentRate.rate.toFixed(4)}
          </p>
          <p className="text-xs text-white/50">USD/MXN</p>
        </div>
        <div className={cn(
          'flex items-center gap-0.5 text-xs ml-auto',
          currentRate.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
        )}>
          {currentRate.change >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          {currentRate.changePercent.toFixed(2)}%
        </div>
      </motion.div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Rate Display */}
      <RateDisplay
        rate={currentRate.rate}
        change={currentRate.change}
        changePercent={currentRate.changePercent}
        updatedAt={currentRate.updatedAt}
        isLoading={isLoading || isRefetching}
        onRefresh={() => refetch()}
      />

      {/* Converter */}
      <Converter rate={currentRate.rate} />

      {/* History Chart */}
      {history && history.length > 0 && (
        <HistoryChartMini history={history} />
      )}

      {/* Alert Settings */}
      <AlertSettings
        alerts={alerts}
        currentRate={currentRate.rate}
        onAddAlert={handleAddAlert}
        onToggleAlert={handleToggleAlert}
        onDeleteAlert={handleDeleteAlert}
      />
    </div>
  )
}

export default ExchangeRateWidget
export { AlertSettings, Converter, HistoryChartMini, RateDisplay }

