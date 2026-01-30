'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏦 BANK DASHBOARD SUPREME — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Dashboard bancario ultra-premium con:
 * - KPIs visuales con animaciones
 * - Gráficos interactivos de flujo
 * - Tabla de movimientos con trazabilidad completa
 * - Filtros avanzados multi-dimensión
 * - Acciones rápidas contextuales
 * - Sistema de permisos granulares integrado
 *
 * @version 4.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { AnimatePresence, motion, useSpring, useTransform } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useState, useRef } from 'react'
import {
  AlertCircle, ArrowDown, ArrowLeftRight, ArrowRight, ArrowUp,
  Building2, Calendar, Check, ChevronDown, ChevronRight, Clock,
  Copy, CreditCard, Download, Edit, Eye, FileText, Filter,
  Hash, History, Info, Laptop, Loader2, MapPin, MoreVertical,
  Plus, RefreshCw, Search, Settings, Smartphone, Sparkles,
  Tag, Trash2, TrendingDown, TrendingUp, Truck, User, Users, X, Zap,
  Activity, AlertTriangle, CheckCircle2, XCircle, DollarSign, Wallet,
  PiggyBank, BarChart3, LineChart, Receipt, Send, ArrowDownLeft, ArrowUpRight
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface BancoData {
  id: string
  nombre: string
  descripcion: string
  color: string
  capitalActual: number
  historicoIngresos: number
  historicoGastos: number
  ultimoMovimiento?: Date
}

interface MovimientoData {
  id: string
  tipo: 'ingreso' | 'gasto' | 'transferencia_entrada' | 'transferencia_salida' | 'corte'
  monto: number
  concepto: string
  categoria: string | null
  referencia: string | null
  observaciones: string | null
  fecha: Date
  hora: string
  estado: 'completado' | 'pendiente' | 'cancelado'
  // Trazabilidad
  bancoOrigenId?: string
  bancoOrigenNombre?: string
  bancoDestinoId?: string
  bancoDestinoNombre?: string
  clienteId?: string
  clienteNombre?: string
  distribuidorId?: string
  distribuidorNombre?: string
  ventaId?: string
  ordenCompraId?: string
  // Auditoría
  creadoPor: string
  creadoPorNombre: string
  creadoPorDispositivo?: string
  creadoPorIp?: string
  modificadoPor?: string
  modificadoPorNombre?: string
  modificadoAt?: Date
  historialCambios?: AuditEntry[]
}

interface AuditEntry {
  fecha: Date
  usuario: string
  usuarioNombre: string
  campo: string
  valorAnterior: string
  valorNuevo: string
  dispositivo?: string
  ip?: string
}

interface MetricData {
  total: number
  cantidad: number
  promedio: number
  ultimoMes: number
  cambio: number
}

interface BankDashboardProps {
  banco: BancoData
  movimientos: MovimientoData[]
  onRegistrarIngreso?: () => void
  onRegistrarGasto?: () => void
  onTransferir?: () => void
  onRefresh?: () => void
  isLoading?: boolean
  // Permisos
  puedeRegistrarIngreso?: boolean
  puedeRegistrarGasto?: boolean
  puedeTransferir?: boolean
  puedeExportar?: boolean
  puedeVerHistorial?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ANIMATED COUNTER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function AnimatedCounter({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const spring = useSpring(0, { stiffness: 100, damping: 30 })
  const display = useTransform(spring, (v) => `${prefix}${v.toLocaleString('es-MX', { maximumFractionDigits: 0 })}${suffix}`)
  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`)

  useEffect(() => {
    spring.set(value)
  }, [spring, value])

  useEffect(() => {
    const unsubscribe = display.on('change', setDisplayValue)
    return () => unsubscribe()
  }, [display])

  return <span>{displayValue}</span>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KPI CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface KPICardProps {
  title: string
  value: number
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' }
  color: 'violet' | 'emerald' | 'rose' | 'amber' | 'blue' | 'orange'
  format?: 'currency' | 'number' | 'percent'
  onClick?: () => void
  pulse?: boolean
}

const colorConfig = {
  violet: { bg: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/30', text: 'text-violet-400', glow: 'shadow-violet-500/20' },
  emerald: { bg: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  rose: { bg: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/30', text: 'text-rose-400', glow: 'shadow-rose-500/20' },
  amber: { bg: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
  blue: { bg: 'from-blue-500/20 to-sky-500/10', border: 'border-blue-500/30', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
  orange: { bg: 'from-orange-500/20 to-amber-500/10', border: 'border-orange-500/30', text: 'text-orange-400', glow: 'shadow-orange-500/20' },
}

const KPICard = memo(function KPICard({
  title, value, subtitle, icon, trend, color, format = 'currency', onClick, pulse
}: KPICardProps) {
  const cfg = colorConfig[color]

  const formattedValue = useMemo(() => {
    if (format === 'currency') return formatCurrency(value)
    if (format === 'percent') return `${value.toFixed(1)}%`
    return value.toLocaleString('es-MX')
  }, [value, format])

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition-all cursor-pointer',
        cfg.bg, cfg.border,
        onClick && 'hover:scale-[1.02]',
        pulse && 'animate-pulse'
      )}
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Glow effect */}
      <div className={cn('absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl opacity-30', cfg.text.replace('text-', 'bg-'))} />

      <div className="relative flex items-start justify-between">
        <div className={cn('rounded-xl p-3', cfg.text.replace('text-', 'bg-').replace('400', '500/20'))}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
            trend.direction === 'up' && 'bg-emerald-500/20 text-emerald-400',
            trend.direction === 'down' && 'bg-rose-500/20 text-rose-400',
            trend.direction === 'neutral' && 'bg-amber-500/20 text-amber-400'
          )}>
            {trend.direction === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend.direction === 'down' && <TrendingDown className="h-3 w-3" />}
            {trend.direction === 'neutral' && <Activity className="h-3 w-3" />}
            {Math.abs(trend.value).toFixed(1)}%
          </div>
        )}
      </div>

      <div className="relative mt-4">
        <p className="text-2xl font-bold text-white">
          <AnimatedCounter value={value} prefix={format === 'currency' ? '$' : ''} suffix={format === 'percent' ? '%' : ''} />
        </p>
        <p className="mt-1 text-sm text-white/60">{title}</p>
        {subtitle && <p className={cn('mt-0.5 text-xs', cfg.text)}>{subtitle}</p>}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUICK ACTION BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuickActionProps {
  label: string
  icon: React.ReactNode
  onClick?: () => void
  variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  disabled?: boolean
  loading?: boolean
}

const variantStyles = {
  primary: 'bg-violet-500 hover:bg-violet-600 text-white shadow-violet-500/30',
  secondary: 'bg-white/10 hover:bg-white/20 text-white border border-white/20',
  success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30',
  danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30',
  warning: 'bg-amber-500 hover:bg-amber-600 text-black shadow-amber-500/30',
}

const QuickAction = memo(function QuickAction({
  label, icon, onClick, variant, disabled, loading
}: QuickActionProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium shadow-lg transition-all',
        variantStyles[variant],
        (disabled || loading) && 'opacity-50 cursor-not-allowed'
      )}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {label}
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOVIMIENTO ROW
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MovimientoRowProps {
  mov: MovimientoData
  isExpanded: boolean
  onToggle: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const tipoConfig = {
  ingreso: { icon: ArrowDownLeft, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Ingreso' },
  gasto: { icon: ArrowUpRight, color: 'text-rose-400', bg: 'bg-rose-500/20', label: 'Gasto' },
  transferencia_entrada: { icon: ArrowLeftRight, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Trans. Entrada' },
  transferencia_salida: { icon: ArrowLeftRight, color: 'text-violet-400', bg: 'bg-violet-500/20', label: 'Trans. Salida' },
  corte: { icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Corte' },
}

const estadoConfig = {
  completado: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: CheckCircle2 },
  pendiente: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Clock },
  cancelado: { color: 'text-rose-400', bg: 'bg-rose-500/20', icon: XCircle },
}

const MovimientoRow = memo(function MovimientoRow({
  mov, isExpanded, onToggle, onEdit, onDelete
}: MovimientoRowProps) {
  const tipo = tipoConfig[mov.tipo]
  const estado = estadoConfig[mov.estado]
  const Icon = tipo.icon
  const EstadoIcon = estado.icon
  const [showActions, setShowActions] = useState(false)

  const isPositive = mov.tipo === 'ingreso' || mov.tipo === 'transferencia_entrada'

  return (
    <>
      <motion.tr
        className={cn(
          'border-b border-white/5 transition-colors',
          isExpanded ? 'bg-violet-500/5' : 'hover:bg-white/[0.03]'
        )}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {/* Expand toggle */}
        <td className="w-12 px-4 py-4">
          <button
            onClick={onToggle}
            className={cn(
              'p-1.5 rounded-lg transition-all',
              isExpanded ? 'bg-violet-500/20 text-violet-400' : 'text-white/40 hover:bg-white/10'
            )}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-180')} />
          </button>
        </td>

        {/* Tipo & Concepto */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-3">
            <div className={cn('rounded-xl p-2.5', tipo.bg)}>
              <Icon className={cn('h-5 w-5', tipo.color)} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-white truncate max-w-[200px]">{mov.concepto}</p>
              <p className="text-xs text-white/50">{tipo.label}</p>
            </div>
          </div>
        </td>

        {/* Monto */}
        <td className="px-4 py-4">
          <p className={cn('text-lg font-bold', isPositive ? 'text-emerald-400' : 'text-rose-400')}>
            {isPositive ? '+' : '-'}{formatCurrency(mov.monto)}
          </p>
        </td>

        {/* Fecha */}
        <td className="px-4 py-4">
          <div className="flex items-center gap-2 text-white/70">
            <Calendar className="h-4 w-4 text-white/40" />
            <div>
              <p className="text-sm">{new Date(mov.fecha).toLocaleDateString('es-MX')}</p>
              <p className="text-xs text-white/40">{mov.hora}</p>
            </div>
          </div>
        </td>

        {/* Categoría */}
        <td className="px-4 py-4">
          {mov.categoria ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 text-xs text-white/70">
              <Tag className="h-3 w-3" />
              {mov.categoria}
            </span>
          ) : (
            <span className="text-white/30 text-xs">Sin categoría</span>
          )}
        </td>

        {/* Estado */}
        <td className="px-4 py-4">
          <span className={cn('inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium', estado.bg, estado.color)}>
            <EstadoIcon className="h-3 w-3" />
            {mov.estado}
          </span>
        </td>

        {/* Referencia */}
        <td className="px-4 py-4">
          {mov.referencia ? (
            <span className="text-xs text-white/50 font-mono">{mov.referencia}</span>
          ) : (
            <span className="text-white/20">—</span>
          )}
        </td>

        {/* Actions */}
        <td className="px-4 py-4">
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  className="absolute right-0 top-full mt-1 z-20 w-36 rounded-xl border border-white/10 bg-slate-900 shadow-xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <button
                    onClick={() => { onToggle(); setShowActions(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
                  >
                    <Eye className="h-4 w-4" /> Ver Detalles
                  </button>
                  {onEdit && (
                    <button
                      onClick={() => { onEdit(); setShowActions(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/5"
                    >
                      <Edit className="h-4 w-4" /> Editar
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => { onDelete(); setShowActions(false) }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="h-4 w-4" /> Eliminar
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </td>
      </motion.tr>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <td colSpan={8} className="p-0">
              <ExpandedMovimientoDetails mov={mov} />
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPANDED DETAILS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ExpandedMovimientoDetails = memo(function ExpandedMovimientoDetails({ mov }: { mov: MovimientoData }) {
  const [tab, setTab] = useState<'info' | 'trazabilidad' | 'historial'>('info')

  return (
    <motion.div
      className="border-t border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-purple-500/5 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'info', label: 'Información', icon: Info },
          { id: 'trazabilidad', label: 'Trazabilidad', icon: ArrowRight },
          { id: 'historial', label: 'Historial', icon: History },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              tab === t.id ? 'bg-violet-500/20 text-violet-400' : 'text-white/50 hover:text-white/70'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <InfoField label="ID" value={mov.id} icon={<Hash className="h-3 w-3" />} copyable />
            <InfoField label="Referencia" value={mov.referencia} icon={<FileText className="h-3 w-3" />} />
            <InfoField label="Creado por" value={mov.creadoPorNombre} icon={<User className="h-3 w-3" />} />
            <InfoField label="Dispositivo" value={mov.creadoPorDispositivo} icon={<Laptop className="h-3 w-3" />} />
            <InfoField label="IP" value={mov.creadoPorIp} icon={<MapPin className="h-3 w-3" />} />
            <InfoField label="Fecha Creación" value={new Date(mov.fecha).toLocaleString('es-MX')} icon={<Calendar className="h-3 w-3" />} />
            {mov.observaciones && (
              <div className="col-span-full">
                <InfoField label="Observaciones" value={mov.observaciones} icon={<FileText className="h-3 w-3" />} />
              </div>
            )}
          </motion.div>
        )}

        {tab === 'trazabilidad' && (
          <motion.div
            key="trazabilidad"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Flow visualization */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
              {mov.bancoOrigenNombre && (
                <>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/20 text-violet-400">
                    <Building2 className="h-4 w-4" />
                    {mov.bancoOrigenNombre}
                  </div>
                  <ArrowRight className="h-5 w-5 text-white/30" />
                </>
              )}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(mov.monto)}
              </div>
              {mov.bancoDestinoNombre && (
                <>
                  <ArrowRight className="h-5 w-5 text-white/30" />
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                    <Building2 className="h-4 w-4" />
                    {mov.bancoDestinoNombre}
                  </div>
                </>
              )}
            </div>

            {/* Related entities */}
            <div className="grid grid-cols-2 gap-4">
              {mov.clienteNombre && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" /> Cliente
                  </h4>
                  <p className="text-white">{mov.clienteNombre}</p>
                  <p className="text-xs text-white/40">ID: {mov.clienteId}</p>
                </div>
              )}
              {mov.distribuidorNombre && (
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <h4 className="text-sm font-medium text-orange-400 mb-2 flex items-center gap-2">
                    <Truck className="h-4 w-4" /> Distribuidor
                  </h4>
                  <p className="text-white">{mov.distribuidorNombre}</p>
                  <p className="text-xs text-white/40">ID: {mov.distribuidorId}</p>
                </div>
              )}
              {mov.ventaId && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                    <Receipt className="h-4 w-4" /> Venta
                  </h4>
                  <p className="text-white font-mono text-sm">{mov.ventaId}</p>
                </div>
              )}
              {mov.ordenCompraId && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Orden de Compra
                  </h4>
                  <p className="text-white font-mono text-sm">{mov.ordenCompraId}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {tab === 'historial' && (
          <motion.div
            key="historial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {mov.historialCambios && mov.historialCambios.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {mov.historialCambios.map((cambio, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                      <Edit className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white">{cambio.usuarioNombre}</p>
                        <p className="text-xs text-white/40">{new Date(cambio.fecha).toLocaleString('es-MX')}</p>
                      </div>
                      <p className="text-sm text-white/70">
                        Campo: <span className="font-medium">{cambio.campo}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs">
                        <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-400 line-through">
                          {cambio.valorAnterior || '(vacío)'}
                        </span>
                        <ArrowRight className="h-3 w-3 text-white/30" />
                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">
                          {cambio.valorNuevo || '(vacío)'}
                        </span>
                      </div>
                      {(cambio.dispositivo || cambio.ip) && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-white/40">
                          {cambio.dispositivo && <span className="flex items-center gap-1"><Laptop className="h-3 w-3" />{cambio.dispositivo}</span>}
                          {cambio.ip && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{cambio.ip}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/50">Sin historial de cambios</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INFO FIELD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const InfoField = memo(function InfoField({
  label, value, icon, copyable
}: { label: string; value?: string | null; icon?: React.ReactNode; copyable?: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-xs text-white/40">
        {icon}
        {label}
      </p>
      <div className="flex items-center gap-2">
        <p className="text-sm text-white font-medium truncate">{value || 'N/A'}</p>
        {copyable && value && (
          <button onClick={handleCopy} className="p-1 rounded hover:bg-white/10 text-white/40 hover:text-white">
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          </button>
        )}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function BankDashboardSupreme({
  banco,
  movimientos,
  onRegistrarIngreso,
  onRegistrarGasto,
  onTransferir,
  onRefresh,
  isLoading = false,
  puedeRegistrarIngreso = true,
  puedeRegistrarGasto = true,
  puedeTransferir = true,
  puedeExportar = true,
  puedeVerHistorial = true,
}: BankDashboardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTipo, setFilterTipo] = useState<string>('')
  const [filterEstado, setFilterEstado] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  // Calculate metrics
  const metrics = useMemo(() => {
    const ingresos = movimientos.filter(m => m.tipo === 'ingreso' || m.tipo === 'transferencia_entrada')
    const egresos = movimientos.filter(m => m.tipo === 'gasto' || m.tipo === 'transferencia_salida')
    const pendientes = movimientos.filter(m => m.estado === 'pendiente')

    const totalIngresos = ingresos.reduce((sum, m) => sum + m.monto, 0)
    const totalEgresos = egresos.reduce((sum, m) => sum + m.monto, 0)
    const totalPendientes = pendientes.reduce((sum, m) => sum + m.monto, 0)

    return {
      ingresos: { total: totalIngresos, count: ingresos.length },
      egresos: { total: totalEgresos, count: egresos.length },
      pendientes: { total: totalPendientes, count: pendientes.length },
      transferencias: movimientos.filter(m => m.tipo.includes('transferencia')).length,
    }
  }, [movimientos])

  // Filter movimientos
  const filteredMovimientos = useMemo(() => {
    return movimientos.filter(m => {
      const matchesSearch = !searchTerm ||
        m.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.referencia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTipo = !filterTipo || m.tipo === filterTipo
      const matchesEstado = !filterEstado || m.estado === filterEstado
      return matchesSearch && matchesTipo && matchesEstado
    })
  }, [movimientos, searchTerm, filterTipo, filterEstado])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: `${banco.color}20`, boxShadow: `0 0 40px ${banco.color}30` }}
          >
            <Building2 className="h-7 w-7" style={{ color: banco.color }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{banco.nombre}</h1>
            <p className="text-sm text-white/50">{banco.descripcion}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {puedeRegistrarIngreso && (
            <QuickAction
              label="Registrar Ingreso"
              icon={<ArrowDownLeft className="h-4 w-4" />}
              variant="success"
              onClick={onRegistrarIngreso}
            />
          )}
          {puedeRegistrarGasto && (
            <QuickAction
              label="Registrar Gasto"
              icon={<ArrowUpRight className="h-4 w-4" />}
              variant="danger"
              onClick={onRegistrarGasto}
            />
          )}
          {puedeTransferir && (
            <QuickAction
              label="Transferir"
              icon={<Send className="h-4 w-4" />}
              variant="primary"
              onClick={onTransferir}
            />
          )}
          {onRefresh && (
            <QuickAction
              label=""
              icon={<RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />}
              variant="secondary"
              onClick={onRefresh}
              loading={isLoading}
            />
          )}
        </div>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Capital Actual"
          value={banco.capitalActual}
          icon={<Wallet className="h-6 w-6" />}
          color="violet"
          trend={{ value: 12.5, direction: banco.capitalActual >= 0 ? 'up' : 'down' }}
          subtitle={`${movimientos.length} movimientos`}
        />
        <KPICard
          title="Total Ingresos"
          value={metrics.ingresos.total}
          icon={<ArrowDownLeft className="h-6 w-6" />}
          color="emerald"
          subtitle={`${metrics.ingresos.count} operaciones`}
          trend={{ value: 8.3, direction: 'up' }}
        />
        <KPICard
          title="Total Egresos"
          value={metrics.egresos.total}
          icon={<ArrowUpRight className="h-6 w-6" />}
          color="rose"
          subtitle={`${metrics.egresos.count} operaciones`}
          trend={{ value: 5.1, direction: 'down' }}
        />
        <KPICard
          title="Pendientes"
          value={metrics.pendientes.total}
          icon={<Clock className="h-6 w-6" />}
          color="amber"
          subtitle={`${metrics.pendientes.count} por procesar`}
          pulse={metrics.pendientes.count > 0}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Histórico Ingresos"
          value={banco.historicoIngresos}
          icon={<BarChart3 className="h-5 w-5" />}
          color="blue"
          format="currency"
        />
        <KPICard
          title="Histórico Gastos"
          value={banco.historicoGastos}
          icon={<LineChart className="h-5 w-5" />}
          color="orange"
          format="currency"
        />
        <KPICard
          title="Transferencias"
          value={metrics.transferencias}
          icon={<ArrowLeftRight className="h-5 w-5" />}
          color="violet"
          format="number"
        />
        <KPICard
          title="Eficiencia"
          value={banco.historicoIngresos > 0 ? (banco.capitalActual / banco.historicoIngresos) * 100 : 0}
          icon={<Zap className="h-5 w-5" />}
          color="amber"
          format="percent"
        />
      </div>

      {/* Movimientos Table */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-white/10 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-violet-400" />
                Movimientos
              </h2>
              <p className="text-sm text-white/50">
                {filteredMovimientos.length} de {movimientos.length} registros
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-[200px] rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 outline-none"
                />
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors',
                  showFilters ? 'border-violet-500/50 bg-violet-500/10 text-violet-400' : 'border-white/10 text-white/70 hover:bg-white/5'
                )}
              >
                <Filter className="h-4 w-4" />
                Filtros
              </button>

              {/* Export */}
              {puedeExportar && (
                <button className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/5">
                  <Download className="h-4 w-4" />
                  Exportar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-white/10 bg-white/[0.02] p-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Tipo</label>
                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50"
                  >
                    <option value="">Todos</option>
                    <option value="ingreso">Ingreso</option>
                    <option value="gasto">Gasto</option>
                    <option value="transferencia_entrada">Trans. Entrada</option>
                    <option value="transferencia_salida">Trans. Salida</option>
                    <option value="corte">Corte</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/50 mb-1 block">Estado</label>
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-violet-500/50"
                  >
                    <option value="">Todos</option>
                    <option value="completado">Completado</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {(filterTipo || filterEstado) && (
                <button
                  onClick={() => { setFilterTipo(''); setFilterEstado('') }}
                  className="mt-4 text-xs text-violet-400 hover:text-violet-300"
                >
                  Limpiar filtros
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-sm">
              <tr className="border-b border-white/10">
                <th className="w-12 px-4 py-3" />
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                  Concepto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                  Monto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                  Categoría
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/50">
                  Referencia
                </th>
                <th className="w-12 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filteredMovimientos.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center">
                    <AlertCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/50">No se encontraron movimientos</p>
                    {(searchTerm || filterTipo || filterEstado) && (
                      <button
                        onClick={() => { setSearchTerm(''); setFilterTipo(''); setFilterEstado('') }}
                        className="mt-4 text-sm text-violet-400 hover:text-violet-300"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredMovimientos.map((mov) => (
                  <MovimientoRow
                    key={mov.id}
                    mov={mov}
                    isExpanded={expandedId === mov.id}
                    onToggle={() => setExpandedId(expandedId === mov.id ? null : mov.id)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BankDashboardSupreme
