'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏦 BANKING DASHBOARD PREMIUM — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Dashboard bancario completo con:
 * - Cards de métricas financieras (ingresos, egresos, abonos, gastos)
 * - Visualización de transferencias y pagos a distribuidores
 * - Gráficos de tendencias y análisis
 * - Sistema de alertas y notificaciones
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Building2,
  CreditCard,
  DollarSign,
  Receipt,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Truck,
  Wallet,
  Activity,
  PiggyBank,
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { memo, useCallback, useMemo, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FinancialMetrics {
  totalIngresos: number
  totalEgresos: number
  totalAbonos: number
  totalGastos: number
  totalTransferencias: number
  pagoDistribuidores: number
  balanceGeneral: number
  cambioIngresos: number
  cambioEgresos: number
  cambioAbonos: number
  flujoNeto: number
}

interface BancoStats {
  id: string
  nombre: string
  capitalActual: number
  ingresosMes: number
  egresosMes: number
  tendencia: 'up' | 'down' | 'neutral'
  cambio: number
}

interface TransaccionReciente {
  id: string
  tipo: 'ingreso' | 'egreso' | 'abono' | 'gasto' | 'transferencia' | 'pago_distribuidor'
  monto: number
  concepto: string
  fecha: Date
  banco?: string
  origen?: string
  destino?: string
  estado: 'completado' | 'pendiente' | 'fallido'
}

interface BankingDashboardProps {
  className?: string
  compact?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// METRIC CARD COMPONENT — Card animada para métricas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  title: string
  value: number
  change?: number
  icon: React.ReactNode
  colorScheme: 'gold' | 'violet' | 'emerald' | 'rose' | 'blue' | 'orange'
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  onClick?: () => void
  isLoading?: boolean
}

const colorSchemes = {
  gold: {
    bg: 'from-amber-500/20 to-yellow-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    text: 'text-amber-400',
  },
  violet: {
    bg: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/30',
    icon: 'text-violet-400',
    glow: 'shadow-violet-500/20',
    text: 'text-violet-400',
  },
  emerald: {
    bg: 'from-emerald-500/20 to-green-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    text: 'text-emerald-400',
  },
  rose: {
    bg: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-500/30',
    icon: 'text-rose-400',
    glow: 'shadow-rose-500/20',
    text: 'text-rose-400',
  },
  blue: {
    bg: 'from-blue-500/20 to-sky-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    text: 'text-blue-400',
  },
  orange: {
    bg: 'from-orange-500/20 to-amber-500/10',
    border: 'border-orange-500/30',
    icon: 'text-orange-400',
    glow: 'shadow-orange-500/20',
    text: 'text-orange-400',
  },
}

const MetricCard = memo(function MetricCard({
  title,
  value,
  change = 0,
  icon,
  colorScheme,
  subtitle,
  trend = 'neutral',
  onClick,
  isLoading,
}: MetricCardProps) {
  const scheme = colorSchemes[colorScheme]
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }, [mouseX, mouseY])

  const spotlightX = useSpring(mouseX, { stiffness: 400, damping: 30 })
  const spotlightY = useSpring(mouseY, { stiffness: 400, damping: 30 })

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border backdrop-blur-xl',
        'bg-gradient-to-br',
        scheme.bg,
        scheme.border,
        'cursor-pointer transition-all duration-300',
        'hover:shadow-lg hover:shadow-current/10',
        onClick && 'hover:scale-[1.02]'
      )}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Spotlight effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useTransform(
            [spotlightX, spotlightY],
            ([x, y]) => `radial-gradient(200px circle at ${x}px ${y}px, rgba(139, 92, 246, 0.15), transparent 80%)`
          ),
        }}
      />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className={cn('rounded-xl bg-black/30 p-2.5', scheme.icon)}>
            {icon}
          </div>
          {change !== 0 && (
            <motion.div
              className={cn(
                'flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium',
                change > 0
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              )}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {change > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(change).toFixed(1)}%
            </motion.div>
          )}
        </div>

        {/* Value */}
        <div className="mt-4">
          {isLoading ? (
            <div className="h-8 w-32 animate-pulse rounded bg-white/10" />
          ) : (
            <motion.p
              className="text-2xl font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {formatCurrency(value)}
            </motion.p>
          )}
          <p className="mt-1 text-sm text-white/60">{title}</p>
          {subtitle && (
            <p className={cn('mt-0.5 text-xs', scheme.text)}>{subtitle}</p>
          )}
        </div>

        {/* Trend indicator */}
        <div className="mt-3 flex items-center gap-2">
          <div className={cn(
            'h-1 flex-1 rounded-full bg-white/10 overflow-hidden'
          )}>
            <motion.div
              className={cn(
                'h-full rounded-full',
                trend === 'up' ? 'bg-emerald-500' : trend === 'down' ? 'bg-rose-500' : 'bg-amber-500'
              )}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.abs(change) * 2, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          ) : trend === 'down' ? (
            <TrendingDown className="h-3 w-3 text-rose-400" />
          ) : (
            <Activity className="h-3 w-3 text-amber-400" />
          )}
        </div>
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TRANSACTION ITEM — Item de transacción reciente
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TransactionItemProps {
  transaction: TransaccionReciente
  onClick?: () => void
}

const TransactionItem = memo(function TransactionItem({
  transaction,
  onClick
}: TransactionItemProps) {
  const iconMap = {
    ingreso: <ArrowDownLeft className="h-4 w-4" />,
    egreso: <ArrowUpRight className="h-4 w-4" />,
    abono: <CreditCard className="h-4 w-4" />,
    gasto: <Receipt className="h-4 w-4" />,
    transferencia: <ArrowLeftRight className="h-4 w-4" />,
    pago_distribuidor: <Truck className="h-4 w-4" />,
  }

  const colorMap = {
    ingreso: 'text-emerald-400 bg-emerald-500/20',
    egreso: 'text-rose-400 bg-rose-500/20',
    abono: 'text-blue-400 bg-blue-500/20',
    gasto: 'text-orange-400 bg-orange-500/20',
    transferencia: 'text-violet-400 bg-violet-500/20',
    pago_distribuidor: 'text-amber-400 bg-amber-500/20',
  }

  const statusIcon = {
    completado: <CheckCircle2 className="h-3 w-3 text-emerald-400" />,
    pendiente: <Clock className="h-3 w-3 text-amber-400" />,
    fallido: <AlertTriangle className="h-3 w-3 text-rose-400" />,
  }

  return (
    <motion.div
      className="group flex items-center gap-4 rounded-xl bg-white/5 p-3 transition-all hover:bg-white/10 cursor-pointer"
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn('rounded-lg p-2', colorMap[transaction.tipo])}>
        {iconMap[transaction.tipo]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-white">
          {transaction.concepto}
        </p>
        <div className="flex items-center gap-2 text-xs text-white/50">
          {transaction.banco && <span>{transaction.banco}</span>}
          {transaction.origen && transaction.destino && (
            <>
              <span>{transaction.origen}</span>
              <ArrowLeftRight className="h-3 w-3" />
              <span>{transaction.destino}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <p className={cn(
          'text-sm font-semibold',
          transaction.tipo === 'ingreso' || transaction.tipo === 'abono'
            ? 'text-emerald-400'
            : 'text-rose-400'
        )}>
          {transaction.tipo === 'ingreso' || transaction.tipo === 'abono' ? '+' : '-'}
          {formatCurrency(transaction.monto)}
        </p>
        <div className="flex items-center gap-1">
          {statusIcon[transaction.estado]}
          <span className="text-xs text-white/40">
            {new Date(transaction.fecha).toLocaleTimeString('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BANCO MINI CARD — Mini card de estado de banco
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface BancoMiniCardProps {
  banco: BancoStats
  onClick?: () => void
}

const BancoMiniCard = memo(function BancoMiniCard({ banco, onClick }: BancoMiniCardProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-4 cursor-pointer transition-all hover:border-violet-500/30"
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider">{banco.nombre}</p>
          <p className="mt-1 text-lg font-bold text-white">
            {formatCurrency(banco.capitalActual)}
          </p>
        </div>
        <div className={cn(
          'rounded-full p-1.5',
          banco.tendencia === 'up' ? 'bg-emerald-500/20' :
          banco.tendencia === 'down' ? 'bg-rose-500/20' : 'bg-amber-500/20'
        )}>
          {banco.tendencia === 'up' ? (
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          ) : banco.tendencia === 'down' ? (
            <TrendingDown className="h-3 w-3 text-rose-400" />
          ) : (
            <Activity className="h-3 w-3 text-amber-400" />
          )}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-white/40">Ingresos</span>
          <p className="text-emerald-400 font-medium">
            +{formatCurrency(banco.ingresosMes)}
          </p>
        </div>
        <div>
          <span className="text-white/40">Egresos</span>
          <p className="text-rose-400 font-medium">
            -{formatCurrency(banco.egresosMes)}
          </p>
        </div>
      </div>
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-violet-500/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUICK ACTION BUTTON — Botón de acción rápida
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuickActionButtonProps {
  icon: React.ReactNode
  label: string
  color: string
  onClick: () => void
}

const QuickActionButton = memo(function QuickActionButton({
  icon,
  label,
  color,
  onClick,
}: QuickActionButtonProps) {
  return (
    <motion.button
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4',
        'transition-all hover:bg-white/10 hover:border-white/20',
        color
      )}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
      <span className="text-xs font-medium text-white/70">{label}</span>
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function BankingDashboard({ className, compact = false }: BankingDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month'>('month')

  // Fetch financial metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<FinancialMetrics>({
    queryKey: ['financial-metrics', selectedPeriod],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/metrics?period=${selectedPeriod}`)
      if (!res.ok) throw new Error('Failed to fetch metrics')
      return res.json()
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  // Fetch bank stats
  const { data: bancoStats, isLoading: bancosLoading } = useQuery<BancoStats[]>({
    queryKey: ['banco-stats', selectedPeriod],
    queryFn: async () => {
      const res = await fetch(`/api/bancos/stats?period=${selectedPeriod}`)
      if (!res.ok) throw new Error('Failed to fetch banco stats')
      return res.json()
    },
    staleTime: 30000,
  })

  // Fetch recent transactions
  const { data: transactions, isLoading: transactionsLoading } = useQuery<TransaccionReciente[]>({
    queryKey: ['recent-transactions'],
    queryFn: async () => {
      const res = await fetch('/api/movimientos/recientes?limit=10')
      if (!res.ok) throw new Error('Failed to fetch transactions')
      return res.json()
    },
    staleTime: 10000,
    refetchInterval: 30000,
  })

  const defaultMetrics: FinancialMetrics = useMemo(() => ({
    totalIngresos: 0,
    totalEgresos: 0,
    totalAbonos: 0,
    totalGastos: 0,
    totalTransferencias: 0,
    pagoDistribuidores: 0,
    balanceGeneral: 0,
    cambioIngresos: 0,
    cambioEgresos: 0,
    cambioAbonos: 0,
    flujoNeto: 0,
  }), [])

  const currentMetrics = metrics || defaultMetrics

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" />
            Dashboard Financiero
          </h2>
          <p className="text-sm text-white/50">
            Resumen de métricas bancarias en tiempo real
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white/5 p-1">
          {(['day', 'week', 'month'] as const).map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                selectedPeriod === period
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-white/50 hover:text-white/70'
              )}
            >
              {period === 'day' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          title="Total Ingresos"
          value={currentMetrics.totalIngresos}
          change={currentMetrics.cambioIngresos}
          icon={<ArrowDownLeft className="h-5 w-5" />}
          colorScheme="emerald"
          subtitle="Ventas + Abonos"
          trend={currentMetrics.cambioIngresos > 0 ? 'up' : 'down'}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Total Egresos"
          value={currentMetrics.totalEgresos}
          change={currentMetrics.cambioEgresos}
          icon={<ArrowUpRight className="h-5 w-5" />}
          colorScheme="rose"
          subtitle="Gastos + Pagos"
          trend={currentMetrics.cambioEgresos > 0 ? 'up' : 'down'}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Abonos Recibidos"
          value={currentMetrics.totalAbonos}
          change={currentMetrics.cambioAbonos}
          icon={<CreditCard className="h-5 w-5" />}
          colorScheme="blue"
          subtitle="De clientes"
          trend={currentMetrics.cambioAbonos > 0 ? 'up' : 'down'}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Gastos Operativos"
          value={currentMetrics.totalGastos}
          icon={<Receipt className="h-5 w-5" />}
          colorScheme="orange"
          subtitle="De todos los bancos"
          trend="neutral"
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Transferencias"
          value={currentMetrics.totalTransferencias}
          icon={<ArrowLeftRight className="h-5 w-5" />}
          colorScheme="violet"
          subtitle="Entre bancos"
          trend="neutral"
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Pago Distribuidores"
          value={currentMetrics.pagoDistribuidores}
          icon={<Truck className="h-5 w-5" />}
          colorScheme="gold"
          subtitle="Deudas pagadas"
          trend="neutral"
          isLoading={metricsLoading}
        />
      </div>

      {/* Balance Overview */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Balance General Card */}
        <motion.div
          className="col-span-2 relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-amber-500/20 p-3">
                <Wallet className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Balance General</h3>
                <p className="text-sm text-white/50">Capital total en todas las bóvedas</p>
              </div>
            </div>

            <div className="flex items-end gap-4">
              <p className="text-4xl font-bold text-amber-400">
                {formatCurrency(currentMetrics.balanceGeneral)}
              </p>
              <div className={cn(
                'flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium mb-1',
                currentMetrics.flujoNeto >= 0
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/20 text-rose-400'
              )}>
                {currentMetrics.flujoNeto >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                {currentMetrics.flujoNeto >= 0 ? '+' : ''}{formatCurrency(currentMetrics.flujoNeto)}
              </div>
            </div>

            {/* Mini stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-xs text-white/40 mb-1">Flujo Positivo</p>
                <p className="text-sm font-semibold text-emerald-400">
                  +{formatCurrency(currentMetrics.totalIngresos)}
                </p>
              </div>
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-xs text-white/40 mb-1">Flujo Negativo</p>
                <p className="text-sm font-semibold text-rose-400">
                  -{formatCurrency(currentMetrics.totalEgresos)}
                </p>
              </div>
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-xs text-white/40 mb-1">Flujo Neto</p>
                <p className={cn(
                  'text-sm font-semibold',
                  currentMetrics.flujoNeto >= 0 ? 'text-emerald-400' : 'text-rose-400'
                )}>
                  {currentMetrics.flujoNeto >= 0 ? '+' : ''}{formatCurrency(currentMetrics.flujoNeto)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-violet-400" />
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionButton
              icon={<ArrowDownLeft className="h-5 w-5 text-emerald-400" />}
              label="Registrar Abono"
              color="hover:border-emerald-500/30"
              onClick={() => {}}
            />
            <QuickActionButton
              icon={<Receipt className="h-5 w-5 text-rose-400" />}
              label="Registrar Gasto"
              color="hover:border-rose-500/30"
              onClick={() => {}}
            />
            <QuickActionButton
              icon={<ArrowLeftRight className="h-5 w-5 text-violet-400" />}
              label="Transferir"
              color="hover:border-violet-500/30"
              onClick={() => {}}
            />
            <QuickActionButton
              icon={<Truck className="h-5 w-5 text-amber-400" />}
              label="Pagar Distribuidor"
              color="hover:border-amber-500/30"
              onClick={() => {}}
            />
          </div>
        </div>
      </div>

      {/* Banks Grid */}
      {!compact && bancoStats && bancoStats.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-amber-400" />
            Estado de Bóvedas
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
            {bancoStats.map((banco) => (
              <BancoMiniCard key={banco.id} banco={banco} />
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      {!compact && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-violet-400" />
              Transacciones Recientes
            </h3>
            <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
              Ver todas
            </button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            <AnimatePresence mode="popLayout">
              {transactionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                transactions.map((tx, index) => (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TransactionItem transaction={tx} />
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-white/50 py-8">
                  No hay transacciones recientes
                </p>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  )
}

export default BankingDashboard
