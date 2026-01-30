'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏦 BANK DETAIL DASHBOARD iOS PREMIUM — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Dashboard detallado para cada banco con diseño iOS glassmorphism:
 * - Métricas completas con cards iOS
 * - Tabla de movimientos con scroll avanzado
 * - Filtros avanzados con componentes iOS
 * - Diseño limpio y minimalista sin efectos 3D problemáticos
 *
 * @version 4.0.0 - iOS Premium Edition
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { useQuery } from '@tanstack/react-query'
import { useToast } from '@/app/_components/ui/iOSToastSystem'
import { useFormScroll } from '@/app/_hooks/useAdvancedScroll'
import {
  iOSGlassCard,
  iOSButton,
  iOSInput,
  iOSSearchBar,
  iOSSegmentedControl,
  iOSScrollView,
  iOSMetricCard,
  iOSListItem,
  iOSListGroup,
  iOSPill,
  iOSSkeleton,
  iOSPullToRefresh,
} from '../ui/ios'
import {
  ArrowDown,
  ArrowLeftRight,
  ArrowRight,
  ArrowUp,
  Building2,
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  Edit,
  Eye,
  Filter,
  History,
  Info,
  Laptop,
  Loader2,
  MapPin,
  MoreVertical,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  User,
  Users,
  X,
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  Tag,
  Hash,
  Calendar as CalendarIcon,
  Activity,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useMemo, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface BancoInfo {
  id: string
  nombre: string
  descripcion: string
  color: string
  capitalActual: number
  historicoIngresos: number
  historicoGastos: number
}

interface BancoMetrics {
  ingresos: {
    total: number
    cantidad: number
    promedio: number
    ultimoMes: number
    cambio: number
  }
  egresos: {
    total: number
    cantidad: number
    promedio: number
    ultimoMes: number
    cambio: number
  }
  transferenciasEntrada: {
    total: number
    cantidad: number
  }
  transferenciasSalida: {
    total: number
    cantidad: number
  }
  pagoDistribuidores: {
    total: number
    cantidad: number
    pendiente: number
  }
  deudasPorCobrar: {
    total: number
    cantidad: number
    vencidas: number
  }
  cortes: {
    ultimo: Date | null
    totalCortes: number
    proximo: Date | null
  }
}

interface Movimiento {
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
  historialCambios?: Array<{
    fecha: Date
    usuario: string
    usuarioNombre: string
    campo: string
    valorAnterior: string
    valorNuevo: string
    dispositivo?: string
    ip?: string
  }>
}

interface FiltersState {
  search: string
  tipo: string | null
  categoria: string | null
  estado: string | null
  fechaInicio: Date | null
  fechaFin: Date | null
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// METRIC CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ReactNode
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' }
  color: 'violet' | 'emerald' | 'rose' | 'amber' | 'blue' | 'orange'
  onClick?: () => void
}

const colorClasses = {
  violet: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400',
  emerald: 'from-emerald-500/20 to-green-500/10 border-emerald-500/30 text-emerald-400',
  rose: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
  amber: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
  blue: 'from-blue-500/20 to-sky-500/10 border-blue-500/30 text-blue-400',
  orange: 'from-orange-500/20 to-amber-500/10 border-orange-500/30 text-orange-400',
}

const MetricCard = memo(function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color,
  onClick,
}: MetricCardProps) {
  const colors = colorClasses[color]

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 cursor-pointer',
        'backdrop-blur-sm transition-colors duration-200',
        colors,
        onClick && 'hover:bg-white/[0.08] active:scale-[0.98]'
      )}
      onClick={onClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div className={cn('rounded-xl bg-black/30 p-2.5', colors.split(' ').pop())}>
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
            {trend.value}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-white">
          {typeof value === 'number' ? formatCurrency(value) : value}
        </p>
        <p className="mt-1 text-sm text-white/60">{title}</p>
        {subtitle && (
          <p className={cn('mt-0.5 text-xs', colors.split(' ').pop())}>{subtitle}</p>
        )}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPANDED ROW DETAILS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ExpandedRowProps {
  movimiento: Movimiento
  onClose: () => void
}

const ExpandedRowDetails = memo(function ExpandedRowDetails({
  movimiento,
  onClose,
}: ExpandedRowProps) {
  const [activeTab, setActiveTab] = useState<'detalles' | 'trazabilidad' | 'historial'>('detalles')

  const tipoConfig = {
    ingreso: { icon: ArrowDown, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    gasto: { icon: ArrowUp, color: 'text-rose-400', bg: 'bg-rose-500/20' },
    transferencia_entrada: { icon: ArrowLeftRight, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    transferencia_salida: { icon: ArrowLeftRight, color: 'text-violet-400', bg: 'bg-violet-500/20' },
    corte: { icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  }

  const config = tipoConfig[movimiento.tipo]
  const Icon = config.icon

  return (
    <motion.div
      className="border-t border-white/10 bg-white/[0.02]"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={cn('rounded-xl p-3', config.bg)}>
              <Icon className={cn('h-6 w-6', config.color)} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{movimiento.concepto}</h3>
              <p className="text-sm text-white/50">
                {movimiento.referencia && `Ref: ${movimiento.referencia} • `}
                {new Date(movimiento.fecha).toLocaleDateString('es-MX', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })} a las {movimiento.hora}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className={cn('text-2xl font-bold', config.color)}>
              {movimiento.tipo === 'ingreso' || movimiento.tipo === 'transferencia_entrada' ? '+' : '-'}
              {formatCurrency(movimiento.monto)}
            </p>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
          {[
            { id: 'detalles', label: 'Detalles', icon: Info },
            { id: 'trazabilidad', label: 'Trazabilidad', icon: ArrowRight },
            { id: 'historial', label: 'Historial de Cambios', icon: History },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-white/50 hover:text-white/70'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'detalles' && (
            <motion.div
              key="detalles"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <InfoField label="ID" value={movimiento.id} icon={<Hash className="h-4 w-4" />} copyable />
              <InfoField label="Estado" value={movimiento.estado} icon={<CheckCircle2 className="h-4 w-4" />} badge
                badgeColor={movimiento.estado === 'completado' ? 'emerald' : movimiento.estado === 'pendiente' ? 'amber' : 'rose'} />
              <InfoField label="Categoría" value={movimiento.categoria || 'Sin categoría'} icon={<Tag className="h-4 w-4" />} />
              <InfoField label="Fecha Creación" value={new Date(movimiento.fecha).toLocaleString('es-MX')} icon={<CalendarIcon className="h-4 w-4" />} />

              {movimiento.observaciones && (
                <div className="col-span-full">
                  <InfoField label="Observaciones" value={movimiento.observaciones} icon={<FileText className="h-4 w-4" />} />
                </div>
              )}

              {/* Creación info */}
              <div className="col-span-full mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-sm font-medium text-white/70 mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Creado por
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoField label="Usuario" value={movimiento.creadoPorNombre} icon={<User className="h-4 w-4" />} />
                  <InfoField label="Dispositivo" value={movimiento.creadoPorDispositivo || 'Desconocido'}
                    icon={movimiento.creadoPorDispositivo?.includes('Mobile') ? <Smartphone className="h-4 w-4" /> : <Laptop className="h-4 w-4" />} />
                  <InfoField label="IP" value={movimiento.creadoPorIp || 'N/A'} icon={<MapPin className="h-4 w-4" />} />
                  <InfoField label="Fecha" value={new Date(movimiento.fecha).toLocaleString('es-MX')} icon={<Clock className="h-4 w-4" />} />
                </div>
              </div>

              {/* Última modificación */}
              {movimiento.modificadoPor && (
                <div className="col-span-full p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                  <h4 className="text-sm font-medium text-amber-400 mb-3 flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Última Modificación
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <InfoField label="Usuario" value={movimiento.modificadoPorNombre || 'Desconocido'} icon={<User className="h-4 w-4" />} />
                    <InfoField label="Fecha" value={movimiento.modificadoAt ? new Date(movimiento.modificadoAt).toLocaleString('es-MX') : 'N/A'} icon={<Clock className="h-4 w-4" />} />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'trazabilidad' && (
            <motion.div
              key="trazabilidad"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {/* Flujo visual */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5">
                {movimiento.bancoOrigenNombre && (
                  <>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/20 text-violet-400">
                      <Building2 className="h-4 w-4" />
                      {movimiento.bancoOrigenNombre}
                    </div>
                    <ArrowRight className="h-5 w-5 text-white/30" />
                  </>
                )}

                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400">
                  <Building2 className="h-4 w-4" />
                  Banco Actual
                </div>

                {movimiento.bancoDestinoNombre && (
                  <>
                    <ArrowRight className="h-5 w-5 text-white/30" />
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Building2 className="h-4 w-4" />
                      {movimiento.bancoDestinoNombre}
                    </div>
                  </>
                )}
              </div>

              {/* Entidades relacionadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {movimiento.clienteNombre && (
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <h4 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Cliente Relacionado
                    </h4>
                    <p className="text-white">{movimiento.clienteNombre}</p>
                    <p className="text-xs text-white/50 mt-1">ID: {movimiento.clienteId}</p>
                  </div>
                )}

                {movimiento.distribuidorNombre && (
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <h4 className="text-sm font-medium text-orange-400 mb-2 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Distribuidor Relacionado
                    </h4>
                    <p className="text-white">{movimiento.distribuidorNombre}</p>
                    <p className="text-xs text-white/50 mt-1">ID: {movimiento.distribuidorId}</p>
                  </div>
                )}

                {movimiento.ventaId && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <h4 className="text-sm font-medium text-emerald-400 mb-2 flex items-center gap-2">
                      <Receipt className="h-4 w-4" />
                      Venta Relacionada
                    </h4>
                    <p className="text-white">ID: {movimiento.ventaId}</p>
                  </div>
                )}

                {movimiento.ordenCompraId && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <h4 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Orden de Compra Relacionada
                    </h4>
                    <p className="text-white">ID: {movimiento.ordenCompraId}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'historial' && (
            <motion.div
              key="historial"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {movimiento.historialCambios && movimiento.historialCambios.length > 0 ? (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {movimiento.historialCambios.map((cambio, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex-shrink-0 p-2 rounded-lg bg-violet-500/20 text-violet-400">
                        <Edit className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-white">
                            {cambio.usuarioNombre}
                          </p>
                          <span className="text-xs text-white/40">
                            {new Date(cambio.fecha).toLocaleString('es-MX')}
                          </span>
                        </div>
                        <p className="text-sm text-white/70 mt-1">
                          Cambió <span className="text-amber-400">{cambio.campo}</span>
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
                          <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                            {cambio.dispositivo && (
                              <span className="flex items-center gap-1">
                                <Laptop className="h-3 w-3" />
                                {cambio.dispositivo}
                              </span>
                            )}
                            {cambio.ip && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {cambio.ip}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <History className="h-12 w-12 text-white/20 mb-4" />
                  <p className="text-white/50">Sin cambios registrados</p>
                  <p className="text-xs text-white/30 mt-1">Este registro no ha sido modificado</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INFO FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface InfoFieldProps {
  label: string
  value: string
  icon?: React.ReactNode
  copyable?: boolean
  badge?: boolean
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'blue' | 'violet'
}

const InfoField = memo(function InfoField({
  label,
  value,
  icon,
  copyable,
  badge,
  badgeColor = 'violet',
}: InfoFieldProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [value])

  const badgeColors = {
    emerald: 'bg-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/20 text-amber-400',
    rose: 'bg-rose-500/20 text-rose-400',
    blue: 'bg-blue-500/20 text-blue-400',
    violet: 'bg-violet-500/20 text-violet-400',
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-white/50 flex items-center gap-1">
        {icon}
        {label}
      </p>
      {badge ? (
        <span className={cn('px-2 py-0.5 rounded text-xs font-medium', badgeColors[badgeColor])}>
          {value}
        </span>
      ) : (
        <p
          className={cn(
            'text-sm text-white truncate',
            copyable && 'cursor-pointer hover:text-violet-400 transition-colors'
          )}
          onClick={copyable ? handleCopy : undefined}
          title={copyable ? (copied ? 'Copiado!' : 'Click para copiar') : undefined}
        >
          {copied ? '✓ Copiado!' : value}
        </p>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOVIMIENTOS TABLE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MovimientosTableProps {
  movimientos: Movimiento[]
  isLoading?: boolean
}

const MovimientosTable = memo(function MovimientosTable({
  movimientos,
  isLoading,
}: MovimientosTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<'fecha' | 'monto'>('fecha')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const sortedMovimientos = useMemo(() => {
    return [...movimientos].sort((a, b) => {
      const aVal = sortField === 'fecha' ? new Date(a.fecha).getTime() : a.monto
      const bVal = sortField === 'fecha' ? new Date(b.fecha).getTime() : b.monto
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [movimientos, sortField, sortDir])

  const tipoConfig = {
    ingreso: { icon: ArrowDown, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Ingreso' },
    gasto: { icon: ArrowUp, color: 'text-rose-400', bg: 'bg-rose-500/20', label: 'Gasto' },
    transferencia_entrada: { icon: ArrowLeftRight, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Transf. Entrada' },
    transferencia_salida: { icon: ArrowLeftRight, color: 'text-violet-400', bg: 'bg-violet-500/20', label: 'Transf. Salida' },
    corte: { icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Corte' },
  }

  const estadoConfig = {
    completado: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: CheckCircle2 },
    pendiente: { color: 'text-amber-400', bg: 'bg-amber-500/20', icon: Clock3 },
    cancelado: { color: 'text-rose-400', bg: 'bg-rose-500/20', icon: AlertCircle },
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 border-b border-white/10 text-xs font-medium text-white/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="col-span-1">Tipo</div>
        <div className="col-span-3">Concepto</div>
        <div
          className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-white/70 transition-colors"
          onClick={() => {
            if (sortField === 'monto') setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
            else setSortField('monto')
          }}
        >
          Monto
          {sortField === 'monto' && (
            <ChevronDown className={cn('h-3 w-3 transition-transform', sortDir === 'asc' && 'rotate-180')} />
          )}
        </div>
        <div className="col-span-2">Categoría</div>
        <div
          className="col-span-2 flex items-center gap-1 cursor-pointer hover:text-white/70 transition-colors"
          onClick={() => {
            if (sortField === 'fecha') setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
            else setSortField('fecha')
          }}
        >
          Fecha
          {sortField === 'fecha' && (
            <ChevronDown className={cn('h-3 w-3 transition-transform', sortDir === 'asc' && 'rotate-180')} />
          )}
        </div>
        <div className="col-span-1">Estado</div>
        <div className="col-span-1"></div>
      </div>

      {/* Table Body with iOS scroll */}
      <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        {sortedMovimientos.length > 0 ? (
          sortedMovimientos.map((mov) => {
            const tipo = tipoConfig[mov.tipo]
            const estado = estadoConfig[mov.estado]
            const isExpanded = expandedId === mov.id

            return (
              <div key={mov.id}>
                <div
                  className={cn(
                    'grid grid-cols-12 gap-4 px-4 py-3 cursor-pointer transition-colors',
                    isExpanded ? 'bg-violet-500/10' : 'hover:bg-white/5'
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : mov.id)}
                >
                  {/* Tipo */}
                  <div className="col-span-1 flex items-center">
                    <div className={cn('rounded-lg p-1.5', tipo.bg)}>
                      <tipo.icon className={cn('h-4 w-4', tipo.color)} />
                    </div>
                  </div>

                  {/* Concepto */}
                  <div className="col-span-3 flex flex-col justify-center min-w-0">
                    <p className="text-sm font-medium text-white truncate">{mov.concepto}</p>
                    {mov.referencia && (
                      <p className="text-xs text-white/40 truncate">Ref: {mov.referencia}</p>
                    )}
                  </div>

                  {/* Monto */}
                  <div className="col-span-2 flex items-center">
                    <span className={cn(
                      'font-semibold',
                      mov.tipo === 'ingreso' || mov.tipo === 'transferencia_entrada'
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    )}>
                      {mov.tipo === 'ingreso' || mov.tipo === 'transferencia_entrada' ? '+' : '-'}
                      {formatCurrency(mov.monto)}
                    </span>
                  </div>

                  {/* Categoría */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-white/70 truncate">
                      {mov.categoria || '-'}
                    </span>
                  </div>

                  {/* Fecha */}
                  <div className="col-span-2 flex flex-col justify-center">
                    <p className="text-sm text-white/70">
                      {new Date(mov.fecha).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </p>
                    <p className="text-xs text-white/40">{mov.hora}</p>
                  </div>

                  {/* Estado */}
                  <div className="col-span-1 flex items-center">
                    <span className={cn(
                      'flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                      estado.bg,
                      estado.color
                    )}>
                      <estado.icon className="h-3 w-3" />
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-end">
                    <ChevronRight className={cn(
                      'h-5 w-5 text-white/30 transition-transform',
                      isExpanded && 'rotate-90'
                    )} />
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {isExpanded && (
                    <ExpandedRowDetails
                      movimiento={mov}
                      onClose={() => setExpandedId(null)}
                    />
                  )}
                </AnimatePresence>
              </div>
            )
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <Receipt className="h-12 w-12 text-white/20 mb-4" />
            <p className="text-white/50">Sin movimientos</p>
          </div>
        )}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface BankDetailDashboardProps {
  bancoId: string
  className?: string
}

export function BankDetailDashboard({ bancoId, className }: BankDetailDashboardProps) {
  const { success, error: showError } = useToast()
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    tipo: null,
    categoria: null,
    estado: null,
    fechaInicio: null,
    fechaFin: null,
  })
  const [showFilters, setShowFilters] = useState(false)

  // Fetch bank info
  const { data: banco, isLoading: bancoLoading } = useQuery<BancoInfo>({
    queryKey: ['banco', bancoId],
    queryFn: async () => {
      const res = await fetch(`/api/bancos/${bancoId}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  // Fetch metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery<BancoMetrics>({
    queryKey: ['banco-metrics', bancoId],
    queryFn: async () => {
      const res = await fetch(`/api/bancos/${bancoId}/metrics`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  // Fetch movimientos
  const { data: movimientos, isLoading: movimientosLoading } = useQuery<Movimiento[]>({
    queryKey: ['banco-movimientos', bancoId, filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.tipo) params.set('tipo', filters.tipo)
      if (filters.categoria) params.set('categoria', filters.categoria)
      if (filters.estado) params.set('estado', filters.estado)
      const res = await fetch(`/api/bancos/${bancoId}/movimientos?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      return res.json()
    },
  })

  const categorias = ['Operaciones', 'Nómina', 'Servicios', 'Impuestos', 'Otros']

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-amber-500/20 p-4">
            <Building2 className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              {banco?.nombre || 'Cargando...'}
            </h1>
            <p className="text-sm text-white/50">{banco?.descripcion}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] text-white/70 hover:bg-white/[0.12] active:scale-[0.98] transition-all duration-200 border border-white/[0.08]"
            whileTap={{ scale: 0.97 }}
            onClick={() => success('Exportando datos...', 'Se descargará el archivo en breve')}
          >
            <Download className="h-4 w-4" />
            Exportar
          </motion.button>
          <motion.button
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500 text-white font-semibold hover:bg-violet-400 active:scale-[0.98] transition-all duration-200 shadow-[0_4px_16px_rgba(139,92,246,0.3)]"
            whileTap={{ scale: 0.97 }}
          >
            <Plus className="h-4 w-4" />
            Nuevo Movimiento
          </motion.button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          title="Ingresos del Mes"
          value={metrics?.ingresos.ultimoMes || 0}
          subtitle={`${metrics?.ingresos.cantidad || 0} operaciones`}
          icon={<ArrowDown className="h-5 w-5" />}
          trend={metrics?.ingresos.cambio ? { value: Math.abs(metrics.ingresos.cambio), direction: metrics.ingresos.cambio >= 0 ? 'up' : 'down' } : undefined}
          color="emerald"
        />
        <MetricCard
          title="Egresos del Mes"
          value={metrics?.egresos.ultimoMes || 0}
          subtitle={`${metrics?.egresos.cantidad || 0} operaciones`}
          icon={<ArrowUp className="h-5 w-5" />}
          trend={metrics?.egresos.cambio ? { value: Math.abs(metrics.egresos.cambio), direction: metrics.egresos.cambio >= 0 ? 'up' : 'down' } : undefined}
          color="rose"
        />
        <MetricCard
          title="Pago Distribuidores"
          value={metrics?.pagoDistribuidores.total || 0}
          subtitle={`${metrics?.pagoDistribuidores.cantidad || 0} pagos`}
          icon={<Truck className="h-5 w-5" />}
          color="orange"
        />
        <MetricCard
          title="Deudas por Cobrar"
          value={metrics?.deudasPorCobrar.total || 0}
          subtitle={`${metrics?.deudasPorCobrar.vencidas || 0} vencidas`}
          icon={<CreditCard className="h-5 w-5" />}
          color="amber"
        />
        <MetricCard
          title="Transferencias Entrada"
          value={metrics?.transferenciasEntrada.total || 0}
          subtitle={`${metrics?.transferenciasEntrada.cantidad || 0} recibidas`}
          icon={<ArrowLeftRight className="h-5 w-5" />}
          color="blue"
        />
        <MetricCard
          title="Transferencias Salida"
          value={metrics?.transferenciasSalida.total || 0}
          subtitle={`${metrics?.transferenciasSalida.cantidad || 0} enviadas`}
          icon={<ArrowLeftRight className="h-5 w-5" />}
          color="violet"
        />
      </div>

      {/* Filters - iOS Style */}
      <div className="flex items-center gap-4 overflow-x-auto scrollbar-none pb-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Buscar por concepto, referencia..."
            className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.06] border border-white/[0.1] text-[15px] text-white placeholder-white/30 focus:border-violet-500/60 focus:bg-white/[0.08] focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all duration-200"
          />
        </div>

        <select
          value={filters.tipo || ''}
          onChange={(e) => setFilters({ ...filters, tipo: e.target.value || null })}
          className="h-11 px-4 rounded-xl bg-white/[0.06] border border-white/[0.1] text-[14px] text-white focus:border-violet-500/60 focus:outline-none transition-all cursor-pointer appearance-none min-w-[160px]"
        >
          <option value="">Todos los tipos</option>
          <option value="ingreso">Ingresos</option>
          <option value="gasto">Gastos</option>
          <option value="transferencia_entrada">Transf. Entrada</option>
          <option value="transferencia_salida">Transf. Salida</option>
        </select>

        <select
          value={filters.categoria || ''}
          onChange={(e) => setFilters({ ...filters, categoria: e.target.value || null })}
          className="h-11 px-4 rounded-xl bg-white/[0.06] border border-white/[0.1] text-[14px] text-white focus:border-violet-500/60 focus:outline-none transition-all cursor-pointer appearance-none min-w-[180px]"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <motion.button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 h-11 px-4 rounded-xl border transition-all duration-200',
            showFilters
              ? 'bg-violet-500/20 border-violet-500/30 text-violet-400'
              : 'bg-white/[0.06] border-white/[0.1] text-white/70 hover:bg-white/[0.1]'
          )}
          whileTap={{ scale: 0.97 }}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Más filtros
        </motion.button>
      </div>

      {/* Movimientos Table */}
      <MovimientosTable
        movimientos={movimientos || []}
        isLoading={movimientosLoading}
      />
    </div>
  )
}

export default BankDetailDashboard
