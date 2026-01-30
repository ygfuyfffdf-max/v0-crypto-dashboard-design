/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏦✨ BANCO DASHBOARD SUPREME — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Dashboard individual por banco con todas las variables primordiales:
 * - Gastos totales y desglose por categoría
 * - Pago a distribuidores
 * - Ingresos (completados y pendientes)
 * - Transferencias (entradas/salidas)
 * - Egresos totales
 * - Cortes de caja
 * - Filtros avanzados por fecha, categoría, estado
 * - KPIs con tendencias y comparativas
 * - Gráficos de flujo temporal
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowRight,
  ArrowUpLeft,
  ArrowUpRight,
  Banknote,
  BarChart3,
  Calendar,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileBarChart,
  Filter,
  History,
  Info,
  Landmark,
  Layers,
  LineChart,
  Loader2,
  MoreHorizontal,
  PieChart,
  Plus,
  Receipt,
  RefreshCw,
  Scissors,
  Send,
  Settings,
  Sparkles,
  Tag,
  Target,
  TrendingDown,
  TrendingUp,
  Truck,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy load charts
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
)
const AreaChart = dynamic(() => import('recharts').then((mod) => mod.AreaChart), { ssr: false })
const Area = dynamic(() => import('recharts').then((mod) => mod.Area), { ssr: false })
const BarChart = dynamic(() => import('recharts').then((mod) => mod.BarChart), { ssr: false })
const Bar = dynamic(() => import('recharts').then((mod) => mod.Bar), { ssr: false })
const XAxis = dynamic(() => import('recharts').then((mod) => mod.XAxis), { ssr: false })
const YAxis = dynamic(() => import('recharts').then((mod) => mod.YAxis), { ssr: false })
const CartesianGrid = dynamic(() => import('recharts').then((mod) => mod.CartesianGrid), { ssr: false })
const Tooltip = dynamic(() => import('recharts').then((mod) => mod.Tooltip), { ssr: false })

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type BancoId =
  | 'boveda_monte'
  | 'boveda_usa'
  | 'profit'
  | 'leftie'
  | 'azteca'
  | 'flete_sur'
  | 'utilidades'

type PeriodoFiltro = 'hoy' | 'semana' | 'mes' | 'trimestre' | 'año' | 'personalizado'
type CategoriaTransaccion =
  | 'ventas'
  | 'pagos_distribuidores'
  | 'gastos_operativos'
  | 'nomina'
  | 'servicios'
  | 'transferencias'
  | 'retiros'
  | 'depositos'
  | 'ajustes'
  | 'otros'

interface MetricaBanco {
  titulo: string
  valor: number
  valorAnterior?: number
  tendencia: 'up' | 'down' | 'neutral'
  porcentajeCambio: number
  icono: React.ReactNode
  color: string
  descripcion?: string
}

interface FlujoTemporal {
  fecha: string
  ingresos: number
  gastos: number
  transferencias: number
  balance: number
}

interface DesglosePorCategoria {
  categoria: CategoriaTransaccion
  monto: number
  porcentaje: number
  cantidad: number
  color: string
}

interface MovimientoResumen {
  id: string
  tipo: 'ingreso' | 'gasto' | 'transferencia_entrada' | 'transferencia_salida' | 'corte'
  monto: number
  concepto: string
  categoria: CategoriaTransaccion
  fecha: string
  hora: string
  estado: 'completado' | 'pendiente' | 'cancelado'
  cliente?: string
  distribuidor?: string
  referencia?: string
}

interface BancoDashboardProps {
  bancoId: BancoId
  nombreBanco: string
  colorBanco: string

  // Métricas principales
  capitalActual: number
  historicoIngresos: number
  historicoGastos: number
  historicoTransferenciasEntrada: number
  historicoTransferenciasSalida: number

  // Métricas del período
  metricas: {
    ingresosPeriodo: number
    gastosPeriodo: number
    transferenciasPeriodo: number
    egresosPeriodo: number
    ingresosPendientes: number // Deudas por cobrar
    pagoDistribuidores: number
    cortesRealizados: number
  }

  // Datos comparativos
  flujoTemporal: FlujoTemporal[]
  desglosePorCategoria: DesglosePorCategoria[]
  ultimosMovimientos: MovimientoResumen[]

  // Callbacks
  onPeriodoChange?: (periodo: PeriodoFiltro, fechaInicio?: Date, fechaFin?: Date) => void
  onCategoriaFilter?: (categoria: CategoriaTransaccion | null) => void
  onVerMovimiento?: (movimiento: MovimientoResumen) => void
  onNuevoMovimiento?: (tipo: 'ingreso' | 'gasto' | 'transferencia') => void
  onExportar?: () => void
  onRefresh?: () => void

  // Estados
  loading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PERIODOS: { id: PeriodoFiltro; label: string; icono: React.ReactNode }[] = [
  { id: 'hoy', label: 'Hoy', icono: <Calendar className="h-4 w-4" /> },
  { id: 'semana', label: 'Semana', icono: <CalendarDays className="h-4 w-4" /> },
  { id: 'mes', label: 'Mes', icono: <CalendarRange className="h-4 w-4" /> },
  { id: 'trimestre', label: 'Trimestre', icono: <BarChart3 className="h-4 w-4" /> },
  { id: 'año', label: 'Año', icono: <LineChart className="h-4 w-4" /> },
]

const CATEGORIAS_INFO: Record<CategoriaTransaccion, { nombre: string; color: string; icono: React.ReactNode }> = {
  ventas: { nombre: 'Ventas', color: '#10B981', icono: <DollarSign className="h-4 w-4" /> },
  pagos_distribuidores: { nombre: 'Pagos Distribuidores', color: '#F59E0B', icono: <Truck className="h-4 w-4" /> },
  gastos_operativos: { nombre: 'Gastos Operativos', color: '#EF4444', icono: <Receipt className="h-4 w-4" /> },
  nomina: { nombre: 'Nómina', color: '#8B5CF6', icono: <CreditCard className="h-4 w-4" /> },
  servicios: { nombre: 'Servicios', color: '#06B6D4', icono: <Settings className="h-4 w-4" /> },
  transferencias: { nombre: 'Transferencias', color: '#3B82F6', icono: <Send className="h-4 w-4" /> },
  retiros: { nombre: 'Retiros', color: '#EC4899', icono: <ArrowUpRight className="h-4 w-4" /> },
  depositos: { nombre: 'Depósitos', color: '#22C55E', icono: <ArrowDownLeft className="h-4 w-4" /> },
  ajustes: { nombre: 'Ajustes', color: '#64748B', icono: <Edit className="h-4 w-4" /> },
  otros: { nombre: 'Otros', color: '#94A3B8', icono: <MoreHorizontal className="h-4 w-4" /> },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// METRIC CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  titulo: string
  valor: number
  valorAnterior?: number
  tendencia: 'up' | 'down' | 'neutral'
  porcentajeCambio: number
  icono: React.ReactNode
  color: string
  descripcion?: string
  destacado?: boolean
  onClick?: () => void
}

const MetricCard = memo(function MetricCard({
  titulo,
  valor,
  tendencia,
  porcentajeCambio,
  icono,
  color,
  descripcion,
  destacado = false,
  onClick,
}: MetricCardProps) {
  const TrendIcon = tendencia === 'up' ? TrendingUp : tendencia === 'down' ? TrendingDown : Activity
  const trendColor = tendencia === 'up' ? 'text-emerald-400' : tendencia === 'down' ? 'text-rose-400' : 'text-slate-400'

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 transition-all cursor-pointer',
        destacado
          ? 'border-violet-500/30 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-transparent'
          : 'border-white/10 bg-white/5',
        'hover:border-white/20 hover:bg-white/8'
      )}
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-5"
        style={{ background: `radial-gradient(circle at 20% 20%, ${color}, transparent 60%)` }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-4">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ backgroundColor: `${color}20` }}
        >
          <div style={{ color }}>{icono}</div>
        </div>
        <div className={cn('flex items-center gap-1 text-sm font-semibold', trendColor)}>
          <TrendIcon className="h-4 w-4" />
          <span>{porcentajeCambio > 0 ? '+' : ''}{porcentajeCambio.toFixed(1)}%</span>
        </div>
      </div>

      {/* Value */}
      <div className="relative">
        <p className="text-sm text-white/60 mb-1">{titulo}</p>
        <p className="text-2xl font-bold text-white">{formatCurrency(valor)}</p>
        {descripcion && (
          <p className="text-xs text-white/40 mt-1">{descripcion}</p>
        )}
      </div>

      {/* Sparkle effect for highlighted cards */}
      {destacado && (
        <motion.div
          className="absolute top-3 right-3"
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Sparkles className="h-4 w-4 text-violet-400/60" />
        </motion.div>
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUICK STATS ROW
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuickStatProps {
  label: string
  valor: number
  icono: React.ReactNode
  color: string
  highlight?: boolean
}

const QuickStat = memo(function QuickStat({ label, valor, icono, color, highlight }: QuickStatProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border transition-all',
        highlight
          ? 'border-amber-500/30 bg-amber-500/10'
          : 'border-white/10 bg-white/5 hover:bg-white/8'
      )}
    >
      <div
        className="flex items-center justify-center w-8 h-8 rounded-lg"
        style={{ backgroundColor: `${color}20` }}
      >
        <div style={{ color }}>{icono}</div>
      </div>
      <div>
        <p className="text-xs text-white/50">{label}</p>
        <p className="text-sm font-semibold text-white">{formatCurrency(valor)}</p>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CATEGORY BREAKDOWN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CategoryBreakdownProps {
  data: DesglosePorCategoria[]
  onCategoriaClick?: (categoria: CategoriaTransaccion) => void
}

const CategoryBreakdown = memo(function CategoryBreakdown({ data, onCategoriaClick }: CategoryBreakdownProps) {
  const total = data.reduce((sum, d) => sum + d.monto, 0)

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const info = CATEGORIAS_INFO[item.categoria]
        const porcentaje = total > 0 ? (item.monto / total) * 100 : 0

        return (
          <motion.div
            key={item.categoria}
            className="group cursor-pointer"
            onClick={() => onCategoriaClick?.(item.categoria)}
            whileHover={{ x: 4 }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: info.color }}
                />
                <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                  {info.nombre}
                </span>
                <span className="text-xs text-white/40">({item.cantidad})</span>
              </div>
              <span className="text-sm font-medium text-white">
                {formatCurrency(item.monto)}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: info.color }}
                initial={{ width: 0 }}
                animate={{ width: `${porcentaje}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// RECENT MOVEMENTS LIST
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface RecentMovementsProps {
  movimientos: MovimientoResumen[]
  onVerDetalle: (movimiento: MovimientoResumen) => void
}

const RecentMovements = memo(function RecentMovements({ movimientos, onVerDetalle }: RecentMovementsProps) {
  const tipoConfig = {
    ingreso: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ArrowDownLeft },
    gasto: { color: 'text-rose-400', bg: 'bg-rose-500/10', icon: ArrowUpRight },
    transferencia_entrada: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: ArrowDownRight },
    transferencia_salida: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: ArrowUpLeft },
    corte: { color: 'text-violet-400', bg: 'bg-violet-500/10', icon: Scissors },
  }

  const estadoConfig = {
    completado: { color: 'text-emerald-400', icon: CheckCircle2 },
    pendiente: { color: 'text-amber-400', icon: Clock },
    cancelado: { color: 'text-rose-400', icon: X },
  }

  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
      {movimientos.map((mov, index) => {
        const tipo = tipoConfig[mov.tipo]
        const estado = estadoConfig[mov.estado]
        const TipoIcon = tipo.icon
        const EstadoIcon = estado.icon

        return (
          <motion.div
            key={mov.id}
            className="group flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20 transition-all cursor-pointer"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onVerDetalle(mov)}
          >
            {/* Icon */}
            <div className={cn('p-2 rounded-lg', tipo.bg)}>
              <TipoIcon className={cn('h-4 w-4', tipo.color)} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white truncate">
                  {mov.concepto}
                </span>
                <EstadoIcon className={cn('h-3 w-3 shrink-0', estado.color)} />
              </div>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <span>{mov.fecha}</span>
                <span>•</span>
                <span>{mov.hora}</span>
                {mov.cliente && (
                  <>
                    <span>•</span>
                    <span>{mov.cliente}</span>
                  </>
                )}
              </div>
            </div>

            {/* Amount */}
            <div className="text-right">
              <span
                className={cn(
                  'text-sm font-semibold',
                  mov.tipo === 'ingreso' || mov.tipo === 'transferencia_entrada'
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                )}
              >
                {mov.tipo === 'ingreso' || mov.tipo === 'transferencia_entrada' ? '+' : '-'}
                {formatCurrency(mov.monto)}
              </span>
            </div>

            {/* Hover arrow */}
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/60 transition-colors" />
          </motion.div>
        )
      })}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FLOW CHART
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FlowChartProps {
  data: FlujoTemporal[]
}

const FlowChart = memo(function FlowChart({ data }: FlowChartProps) {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="fecha" stroke="rgba(255,255,255,0.3)" fontSize={12} />
          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0,0,0,0.9)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              backdropFilter: 'blur(12px)',
            }}
            labelStyle={{ color: 'white' }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke="#10B981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorIngresos)"
            name="Ingresos"
          />
          <Area
            type="monotone"
            dataKey="gastos"
            stroke="#EF4444"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorGastos)"
            name="Gastos"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const BancoDashboardSupreme = memo(function BancoDashboardSupreme({
  bancoId,
  nombreBanco,
  colorBanco,
  capitalActual,
  historicoIngresos,
  historicoGastos,
  historicoTransferenciasEntrada,
  historicoTransferenciasSalida,
  metricas,
  flujoTemporal,
  desglosePorCategoria,
  ultimosMovimientos,
  onPeriodoChange,
  onCategoriaFilter,
  onVerMovimiento,
  onNuevoMovimiento,
  onExportar,
  onRefresh,
  loading = false,
  className,
}: BancoDashboardProps) {
  const [periodoActivo, setPeriodoActivo] = useState<PeriodoFiltro>('mes')
  const [showFilters, setShowFilters] = useState(false)
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaTransaccion | null>(null)

  // Calculate trends
  const flujoNeto = metricas.ingresosPeriodo - metricas.gastosPeriodo
  const flujoNetoTendencia = flujoNeto > 0 ? 'up' : flujoNeto < 0 ? 'down' : 'neutral'

  const handlePeriodoChange = useCallback((periodo: PeriodoFiltro) => {
    setPeriodoActivo(periodo)
    onPeriodoChange?.(periodo)
  }, [onPeriodoChange])

  const handleCategoriaFilter = useCallback((categoria: CategoriaTransaccion | null) => {
    setCategoriaFiltro(categoria)
    onCategoriaFilter?.(categoria)
  }, [onCategoriaFilter])

  // Main metrics
  const metricasPrincipales: MetricCardProps[] = useMemo(() => [
    {
      titulo: 'Capital Actual',
      valor: capitalActual,
      tendencia: capitalActual > 0 ? 'up' : capitalActual < 0 ? 'down' : 'neutral',
      porcentajeCambio: historicoIngresos > 0 ? ((capitalActual / historicoIngresos) * 100) - 100 : 0,
      icono: <Wallet className="h-5 w-5" />,
      color: colorBanco,
      descripcion: 'Balance actual de la bóveda',
      destacado: true,
    },
    {
      titulo: 'Ingresos del Período',
      valor: metricas.ingresosPeriodo,
      tendencia: 'up',
      porcentajeCambio: 12.5, // TODO: Calculate from historical
      icono: <ArrowDownLeft className="h-5 w-5" />,
      color: '#10B981',
      descripcion: 'Total ingresos recibidos',
    },
    {
      titulo: 'Gastos del Período',
      valor: metricas.gastosPeriodo,
      tendencia: 'down',
      porcentajeCambio: -8.3,
      icono: <ArrowUpRight className="h-5 w-5" />,
      color: '#EF4444',
      descripcion: 'Total gastos realizados',
    },
    {
      titulo: 'Flujo Neto',
      valor: flujoNeto,
      tendencia: flujoNetoTendencia,
      porcentajeCambio: flujoNeto > 0 ? 15.2 : -7.8,
      icono: <Activity className="h-5 w-5" />,
      color: flujoNeto >= 0 ? '#8B5CF6' : '#EC4899',
      descripcion: 'Diferencia ingresos - gastos',
    },
  ], [capitalActual, metricas, flujoNeto, flujoNetoTendencia, colorBanco, historicoIngresos])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-12 h-12 rounded-xl"
            style={{ backgroundColor: `${colorBanco}20` }}
          >
            <Landmark className="h-6 w-6" style={{ color: colorBanco }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{nombreBanco}</h2>
            <p className="text-sm text-white/50">Dashboard de {periodoActivo}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period filter */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            {PERIODOS.map((periodo) => (
              <button
                key={periodo.id}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all',
                  periodoActivo === periodo.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
                onClick={() => handlePeriodoChange(periodo.id)}
              >
                {periodo.icono}
                <span className="hidden sm:inline">{periodo.label}</span>
              </button>
            ))}
          </div>

          {/* Filter button */}
          <button
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all',
              showFilters
                ? 'border-violet-500/50 bg-violet-500/10 text-violet-400'
                : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/8'
            )}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtros</span>
          </button>

          {/* Export */}
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/8 transition-all"
            onClick={onExportar}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {/* Refresh */}
          <button
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:bg-white/8 transition-all"
            onClick={onRefresh}
          >
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Filtros Avanzados</h3>
                <button
                  className="text-xs text-white/50 hover:text-white"
                  onClick={() => handleCategoriaFilter(null)}
                >
                  Limpiar filtros
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {Object.entries(CATEGORIAS_INFO).map(([key, info]) => (
                  <button
                    key={key}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
                      categoriaFiltro === key
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    )}
                    onClick={() => handleCategoriaFilter(key as CategoriaTransaccion)}
                  >
                    {info.icono}
                    {info.nombre}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <QuickStat
          label="Ingresos Pendientes"
          valor={metricas.ingresosPendientes}
          icono={<Clock className="h-4 w-4" />}
          color="#F59E0B"
          highlight={metricas.ingresosPendientes > 10000}
        />
        <QuickStat
          label="Pagos Distribuidores"
          valor={metricas.pagoDistribuidores}
          icono={<Truck className="h-4 w-4" />}
          color="#8B5CF6"
        />
        <QuickStat
          label="Transferencias"
          valor={metricas.transferenciasPeriodo}
          icono={<Send className="h-4 w-4" />}
          color="#3B82F6"
        />
        <QuickStat
          label="Cortes Realizados"
          valor={metricas.cortesRealizados}
          icono={<Scissors className="h-4 w-4" />}
          color="#10B981"
        />
      </div>

      {/* Main metrics grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricasPrincipales.map((metrica, index) => (
          <MetricCard key={index} {...metrica} />
        ))}
      </div>

      {/* Charts and breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flow chart - 2 columns */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Flujo de Capital</h3>
              <p className="text-sm text-white/50">Ingresos vs Gastos en el tiempo</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-white/60">Ingresos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <span className="text-white/60">Gastos</span>
              </div>
            </div>
          </div>
          <FlowChart data={flujoTemporal} />
        </div>

        {/* Category breakdown - 1 column */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Por Categoría</h3>
              <p className="text-sm text-white/50">Desglose de movimientos</p>
            </div>
            <PieChart className="h-5 w-5 text-white/30" />
          </div>
          <CategoryBreakdown
            data={desglosePorCategoria}
            onCategoriaClick={handleCategoriaFilter}
          />
        </div>
      </div>

      {/* Recent movements */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Últimos Movimientos</h3>
            <p className="text-sm text-white/50">{ultimosMovimientos.length} movimientos recientes</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-sm hover:bg-emerald-500/20 transition-colors"
              onClick={() => onNuevoMovimiento?.('ingreso')}
            >
              <Plus className="h-4 w-4" />
              Ingreso
            </button>
            <button
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 text-sm hover:bg-rose-500/20 transition-colors"
              onClick={() => onNuevoMovimiento?.('gasto')}
            >
              <Plus className="h-4 w-4" />
              Gasto
            </button>
          </div>
        </div>
        <RecentMovements
          movimientos={ultimosMovimientos}
          onVerDetalle={(mov) => onVerMovimiento?.(mov)}
        />
      </div>

      {/* Historic totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-xs text-white/50 mb-1">Histórico Ingresos</p>
          <p className="text-lg font-semibold text-emerald-400">{formatCurrency(historicoIngresos)}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-xs text-white/50 mb-1">Histórico Gastos</p>
          <p className="text-lg font-semibold text-rose-400">{formatCurrency(historicoGastos)}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-xs text-white/50 mb-1">Transferencias Entrada</p>
          <p className="text-lg font-semibold text-blue-400">{formatCurrency(historicoTransferenciasEntrada)}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-xs text-white/50 mb-1">Transferencias Salida</p>
          <p className="text-lg font-semibold text-amber-400">{formatCurrency(historicoTransferenciasSalida)}</p>
        </div>
      </div>
    </div>
  )
})

export default BancoDashboardSupreme
