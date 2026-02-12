'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 TRACEABILITY DETAIL CARDS — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Cards premium para visualización de detalles y trazabilidad:
 * - Información completa de cada registro
 * - Timeline de movimientos relacionados
 * - Métricas y análisis visual
 * - Estados y alertas
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  FileText,
  Hash,
  History,
  Info,
  Layers,
  Link2,
  MapPin,
  Package,
  Percent,
  Receipt,
  RefreshCw,
  ShoppingCart,
  Tag,
  Truck,
  User,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Eye,
  Copy,
  Sparkles,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useState } from 'react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface DetailField {
  label: string
  value: string | number | null
  type?: 'text' | 'currency' | 'date' | 'percentage' | 'badge' | 'link'
  icon?: React.ReactNode
  copyable?: boolean
  highlight?: boolean
  color?: 'default' | 'green' | 'red' | 'amber' | 'blue' | 'violet'
}

interface TimelineEvent {
  id: string
  date: Date
  title: string
  description?: string
  type: 'create' | 'update' | 'payment' | 'transfer' | 'status_change' | 'note'
  metadata?: Record<string, unknown>
}

interface RelatedRecord {
  id: string
  type: 'venta' | 'orden_compra' | 'gasto' | 'abono' | 'transferencia' | 'cliente' | 'distribuidor' | 'banco'
  title: string
  subtitle?: string
  value?: number
  status?: string
  onClick?: () => void
}

interface AlertInfo {
  type: 'info' | 'warning' | 'error' | 'success'
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const colorClasses = {
  default: 'text-white/70',
  green: 'text-emerald-400',
  red: 'text-rose-400',
  amber: 'text-amber-400',
  blue: 'text-blue-400',
  violet: 'text-violet-400',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DETAIL FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface DetailFieldItemProps {
  field: DetailField
}

const DetailFieldItem = memo(function DetailFieldItem({ field }: DetailFieldItemProps) {
  const handleCopy = useCallback(() => {
    if (field.value !== null) {
      navigator.clipboard.writeText(String(field.value))
      toast.success('Copiado al portapapeles')
    }
  }, [field.value])

  const formatValue = () => {
    if (field.value === null || field.value === undefined) {
      return <span className="text-white/30">—</span>
    }

    switch (field.type) {
      case 'currency':
        return (
          <span className={cn('font-semibold', colorClasses[field.color || 'default'])}>
            {formatCurrency(Number(field.value))}
          </span>
        )
      case 'date':
        return (
          <span className="text-white/80">
            {new Date(field.value).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )
      case 'percentage':
        return (
          <span className={cn('font-semibold', colorClasses[field.color || 'default'])}>
            {Number(field.value).toFixed(1)}%
          </span>
        )
      case 'badge':
        return (
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              field.color === 'green' && 'bg-emerald-500/20 text-emerald-400',
              field.color === 'red' && 'bg-rose-500/20 text-rose-400',
              field.color === 'amber' && 'bg-amber-500/20 text-amber-400',
              field.color === 'blue' && 'bg-blue-500/20 text-blue-400',
              field.color === 'violet' && 'bg-violet-500/20 text-violet-400',
              (!field.color || field.color === 'default') && 'bg-white/10 text-white/70'
            )}
          >
            {field.value}
          </span>
        )
      case 'link':
        return (
          <a
            href={String(field.value)}
            className="text-violet-400 hover:text-violet-300 flex items-center gap-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            {field.value}
            <ExternalLink className="h-3 w-3" />
          </a>
        )
      default:
        return <span className="text-white/80">{field.value}</span>
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-4 py-2 px-3 rounded-lg transition-colors',
        field.highlight
          ? 'bg-violet-500/10 border border-violet-500/20'
          : 'hover:bg-white/5'
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {field.icon && <span className="text-white/40 flex-shrink-0">{field.icon}</span>}
        <span className="text-sm text-white/50 truncate">{field.label}</span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {formatValue()}
        {field.copyable && field.value !== null && (
          <motion.button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Copy className="h-3 w-3" />
          </motion.button>
        )}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIMELINE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TraceabilityTimelineProps {
  events: TimelineEvent[]
  maxItems?: number
}

const TraceabilityTimeline = memo(function TraceabilityTimeline({
  events,
  maxItems = 5,
}: TraceabilityTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayedEvents = isExpanded ? events : events.slice(0, maxItems)

  const eventIcons = {
    create: <CircleDot className="h-3 w-3" />,
    update: <RefreshCw className="h-3 w-3" />,
    payment: <CreditCard className="h-3 w-3" />,
    transfer: <ArrowLeftRight className="h-3 w-3" />,
    status_change: <Activity className="h-3 w-3" />,
    note: <FileText className="h-3 w-3" />,
  }

  const eventColors = {
    create: 'bg-emerald-500/20 text-emerald-400',
    update: 'bg-blue-500/20 text-blue-400',
    payment: 'bg-amber-500/20 text-amber-400',
    transfer: 'bg-violet-500/20 text-violet-400',
    status_change: 'bg-orange-500/20 text-orange-400',
    note: 'bg-white/10 text-white/50',
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-white/70">
        <History className="h-4 w-4 text-violet-400" />
        Historial de Actividad
      </div>

      <div className="relative pl-5">
        {/* Timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-white/10" />

        <div className="space-y-3">
          {displayedEvents.map((event, index) => (
            <motion.div
              key={event.id}
              className="relative flex gap-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Timeline dot */}
              <div
                className={cn(
                  'relative z-10 flex h-4 w-4 items-center justify-center rounded-full',
                  eventColors[event.type]
                )}
              >
                {eventIcons[event.type]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-white">{event.title}</p>
                  <span className="text-xs text-white/40 flex-shrink-0">
                    {new Date(event.date).toLocaleDateString('es-MX', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {event.description && (
                  <p className="text-xs text-white/50 mt-0.5">{event.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {events.length > maxItems && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 ml-5"
        >
          {isExpanded ? 'Ver menos' : `Ver ${events.length - maxItems} más`}
          <ChevronDown
            className={cn('h-3 w-3 transition-transform', isExpanded && 'rotate-180')}
          />
        </button>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// RELATED RECORDS LIST
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface RelatedRecordsListProps {
  records: RelatedRecord[]
  title?: string
}

const RelatedRecordsList = memo(function RelatedRecordsList({
  records,
  title = 'Registros Relacionados',
}: RelatedRecordsListProps) {
  const recordIcons = {
    venta: <ShoppingCart className="h-4 w-4" />,
    orden_compra: <Package className="h-4 w-4" />,
    gasto: <Receipt className="h-4 w-4" />,
    abono: <CreditCard className="h-4 w-4" />,
    transferencia: <ArrowLeftRight className="h-4 w-4" />,
    cliente: <User className="h-4 w-4" />,
    distribuidor: <Truck className="h-4 w-4" />,
    banco: <Building2 className="h-4 w-4" />,
  }

  const recordColors = {
    venta: 'bg-emerald-500/20 text-emerald-400',
    orden_compra: 'bg-amber-500/20 text-amber-400',
    gasto: 'bg-rose-500/20 text-rose-400',
    abono: 'bg-blue-500/20 text-blue-400',
    transferencia: 'bg-violet-500/20 text-violet-400',
    cliente: 'bg-sky-500/20 text-sky-400',
    distribuidor: 'bg-orange-500/20 text-orange-400',
    banco: 'bg-yellow-500/20 text-yellow-400',
  }

  if (records.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-white/70">
        <Link2 className="h-4 w-4 text-violet-400" />
        {title}
      </div>

      <div className="space-y-2">
        {records.map((record) => (
          <motion.div
            key={record.id}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors group"
            onClick={record.onClick}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={cn('rounded-lg p-2', recordColors[record.type])}>
              {recordIcons[record.type]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{record.title}</p>
              {record.subtitle && (
                <p className="text-xs text-white/50 truncate">{record.subtitle}</p>
              )}
            </div>
            {record.value !== undefined && (
              <span className="text-sm font-semibold text-white">
                {formatCurrency(record.value)}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-white/30 group-hover:text-white/70 transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ALERT BANNER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AlertBannerProps {
  alert: AlertInfo
}

const AlertBanner = memo(function AlertBanner({ alert }: AlertBannerProps) {
  const alertConfig = {
    info: {
      icon: <Info className="h-5 w-5" />,
      bg: 'bg-blue-500/10 border-blue-500/20',
      iconColor: 'text-blue-400',
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5" />,
      bg: 'bg-amber-500/10 border-amber-500/20',
      iconColor: 'text-amber-400',
    },
    error: {
      icon: <AlertCircle className="h-5 w-5" />,
      bg: 'bg-rose-500/10 border-rose-500/20',
      iconColor: 'text-rose-400',
    },
    success: {
      icon: <CheckCircle2 className="h-5 w-5" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      iconColor: 'text-emerald-400',
    },
  }

  const config = alertConfig[alert.type]

  return (
    <motion.div
      className={cn('flex items-start gap-3 p-4 rounded-xl border', config.bg)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className={config.iconColor}>{config.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{alert.title}</p>
        <p className="text-xs text-white/60 mt-0.5">{alert.message}</p>
        {alert.action && (
          <button
            onClick={alert.action.onClick}
            className={cn('text-xs font-medium mt-2', config.iconColor)}
          >
            {alert.action.label} →
          </button>
        )}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STATS MINI CARDS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface StatMiniCard {
  label: string
  value: number
  type: 'currency' | 'number' | 'percentage'
  trend?: 'up' | 'down' | 'neutral'
  color?: 'default' | 'green' | 'red' | 'amber' | 'blue'
}

interface StatsMiniCardsProps {
  stats: StatMiniCard[]
}

const StatsMiniCards = memo(function StatsMiniCards({ stats }: StatsMiniCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          className="p-3 rounded-xl bg-white/5 border border-white/5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-white/50">{stat.label}</span>
            {stat.trend && (
              <span
                className={cn(
                  'text-xs',
                  stat.trend === 'up' && 'text-emerald-400',
                  stat.trend === 'down' && 'text-rose-400',
                  stat.trend === 'neutral' && 'text-white/40'
                )}
              >
                {stat.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                {stat.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                {stat.trend === 'neutral' && <Activity className="h-3 w-3" />}
              </span>
            )}
          </div>
          <p
            className={cn(
              'text-lg font-bold',
              colorClasses[stat.color || 'default']
            )}
          >
            {stat.type === 'currency'
              ? formatCurrency(stat.value)
              : stat.type === 'percentage'
              ? `${stat.value.toFixed(1)}%`
              : stat.value.toLocaleString()}
          </p>
        </motion.div>
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN DETAIL CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TraceabilityDetailCardProps {
  className?: string
  title: string
  subtitle?: string
  icon?: React.ReactNode
  status?: {
    label: string
    type: 'success' | 'warning' | 'error' | 'info' | 'default'
  }
  headerActions?: React.ReactNode
  fields?: DetailField[]
  timeline?: TimelineEvent[]
  relatedRecords?: RelatedRecord[]
  stats?: StatMiniCard[]
  alerts?: AlertInfo[]
  onClose?: () => void
  isOpen?: boolean
  children?: React.ReactNode
}

export function TraceabilityDetailCard({
  className,
  title,
  subtitle,
  icon,
  status,
  headerActions,
  fields = [],
  timeline = [],
  relatedRecords = [],
  stats = [],
  alerts = [],
  onClose,
  isOpen = true,
  children,
}: TraceabilityDetailCardProps) {
  const statusColors = {
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    error: 'bg-rose-500/20 text-rose-400',
    info: 'bg-blue-500/20 text-blue-400',
    default: 'bg-white/10 text-white/70',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={cn(
            'rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-800/95',
            'backdrop-blur-xl shadow-2xl shadow-violet-500/5',
            'overflow-hidden',
            className
          )}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 p-5 border-b border-white/10">
            <div className="flex items-start gap-4">
              {icon && (
                <div className="flex-shrink-0 p-3 rounded-xl bg-violet-500/20 text-violet-400">
                  {icon}
                </div>
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">{title}</h3>
                  {status && (
                    <span
                      className={cn(
                        'px-2 py-0.5 rounded-full text-xs font-medium',
                        statusColors[status.type]
                      )}
                    >
                      {status.label}
                    </span>
                  )}
                </div>
                {subtitle && (
                  <p className="text-sm text-white/50 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {headerActions}
              {onClose && (
                <motion.button
                  onClick={onClose}
                  className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Eye className="h-5 w-5" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-5 space-y-6 max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {/* Alerts */}
            {alerts.length > 0 && (
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <AlertBanner key={index} alert={alert} />
                ))}
              </div>
            )}

            {/* Stats */}
            {stats.length > 0 && <StatsMiniCards stats={stats} />}

            {/* Fields */}
            {fields.length > 0 && (
              <div className="space-y-1 bg-white/[0.02] rounded-xl p-2">
                {fields.map((field, index) => (
                  <DetailFieldItem key={index} field={field} />
                ))}
              </div>
            )}

            {/* Custom children */}
            {children}

            {/* Related Records */}
            {relatedRecords.length > 0 && (
              <RelatedRecordsList records={relatedRecords} />
            )}

            {/* Timeline */}
            {timeline.length > 0 && <TraceabilityTimeline events={timeline} />}
          </div>

          {/* Footer gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VENTA DETAIL CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VentaDetailData {
  id: string
  folio: string
  fecha: Date
  cliente: { nombre: string; id: string }
  ordenCompra: { id: string; folio: string }
  cantidad: number
  precioCompra: number
  precioVenta: number
  precioTotal: number
  costoTotal: number
  gananciaTotal: number
  margenPorcentaje: number
  estadoPago: 'pendiente' | 'parcial' | 'completo'
  totalPagado: number
  saldoPendiente: number
  abonos: Array<{ id: string; fecha: Date; monto: number }>
}

interface VentaDetailCardProps {
  venta: VentaDetailData
  onClose?: () => void
  onViewCliente?: () => void
  onViewOrden?: () => void
  onAddAbono?: () => void
}

export function VentaDetailCard({
  venta,
  onClose,
  onViewCliente,
  onViewOrden,
  onAddAbono,
}: VentaDetailCardProps) {
  const estadoConfig = {
    pendiente: { label: 'Pendiente', type: 'warning' as const },
    parcial: { label: 'Parcial', type: 'info' as const },
    completo: { label: 'Pagado', type: 'success' as const },
  }

  const fields: DetailField[] = [
    {
      label: 'Folio',
      value: venta.folio,
      icon: <Hash className="h-4 w-4" />,
      copyable: true,
      highlight: true,
    },
    {
      label: 'Fecha',
      value: venta.fecha.toISOString(),
      type: 'date',
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      label: 'Cliente',
      value: venta.cliente.nombre,
      icon: <User className="h-4 w-4" />,
    },
    {
      label: 'Cantidad',
      value: `${venta.cantidad} unidades`,
      icon: <Package className="h-4 w-4" />,
    },
    {
      label: 'Precio Compra (u.)',
      value: venta.precioCompra,
      type: 'currency',
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      label: 'Precio Venta (u.)',
      value: venta.precioVenta,
      type: 'currency',
      icon: <DollarSign className="h-4 w-4" />,
    },
  ]

  const stats: StatMiniCard[] = [
    {
      label: 'Total Venta',
      value: venta.precioTotal,
      type: 'currency',
      color: 'default',
    },
    {
      label: 'Costo Total',
      value: venta.costoTotal,
      type: 'currency',
      color: 'red',
    },
    {
      label: 'Ganancia',
      value: venta.gananciaTotal,
      type: 'currency',
      color: 'green',
      trend: venta.gananciaTotal > 0 ? 'up' : 'down',
    },
    {
      label: 'Margen',
      value: venta.margenPorcentaje,
      type: 'percentage',
      color: venta.margenPorcentaje > 20 ? 'green' : 'amber',
    },
  ]

  const relatedRecords: RelatedRecord[] = [
    {
      id: venta.cliente.id,
      type: 'cliente',
      title: venta.cliente.nombre,
      subtitle: 'Ver perfil del cliente',
      onClick: onViewCliente,
    },
    {
      id: venta.ordenCompra.id,
      type: 'orden_compra',
      title: `OC ${venta.ordenCompra.folio}`,
      subtitle: 'Ver orden de compra origen',
      onClick: onViewOrden,
    },
  ]

  const timeline: TimelineEvent[] = [
    {
      id: '1',
      date: venta.fecha,
      title: 'Venta creada',
      description: `${venta.cantidad} unidades a ${venta.cliente.nombre}`,
      type: 'create',
    },
    ...venta.abonos.map((abono) => ({
      id: abono.id,
      date: abono.fecha,
      title: `Abono recibido`,
      description: formatCurrency(abono.monto),
      type: 'payment' as const,
    })),
  ]

  const alerts: AlertInfo[] = venta.estadoPago === 'pendiente' || venta.estadoPago === 'parcial'
    ? [
        {
          type: 'warning',
          title: 'Saldo Pendiente',
          message: `El cliente debe ${formatCurrency(venta.saldoPendiente)} de esta venta`,
          action: onAddAbono
            ? { label: 'Registrar abono', onClick: onAddAbono }
            : undefined,
        },
      ]
    : []

  return (
    <TraceabilityDetailCard
      title={`Venta ${venta.folio}`}
      subtitle={`${venta.cantidad} unidades • ${venta.cliente.nombre}`}
      icon={<ShoppingCart className="h-5 w-5" />}
      status={estadoConfig[venta.estadoPago]}
      fields={fields}
      stats={stats}
      timeline={timeline}
      relatedRecords={relatedRecords}
      alerts={alerts}
      onClose={onClose}
    >
      {/* Payment progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Progreso de Pago</span>
          <span className="text-white/70">
            {formatCurrency(venta.totalPagado)} / {formatCurrency(venta.precioTotal)}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              venta.estadoPago === 'completo'
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            )}
            initial={{ width: 0 }}
            animate={{
              width: `${(venta.totalPagado / venta.precioTotal) * 100}%`,
            }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    </TraceabilityDetailCard>
  )
}

// Export named components
export {
  DetailFieldItem,
  TraceabilityTimeline,
  RelatedRecordsList,
  AlertBanner,
  StatsMiniCards,
}

export default TraceabilityDetailCard
