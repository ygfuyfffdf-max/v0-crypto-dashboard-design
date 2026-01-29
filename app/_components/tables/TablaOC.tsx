'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📦 TABLA ORDENES DE COMPRA — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Tabla de órdenes de compra premium con:
 * ✅ Métricas de lote completas (ROI, rotación, velocidad)
 * ✅ Drill-down detallado de rentabilidad
 * ✅ Indicadores de stock y estado
 * ✅ Real-time sync via Drizzle + React Query
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import {
    AlertTriangle,
    BadgeCheck,
    BarChart3,
    Boxes,
    Building2,
    ChevronDown,
    ChevronRight,
    Clock,
    Eye,
    Gauge,
    MoreHorizontal,
    Package,
    Pencil,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { QuantumTable } from './QuantumTable'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

interface OrdenCompraRow {
  id: string
  fecha: Date | number | null
  distribuidorId: string
  distribuidor?: { nombre: string; saldoPendiente?: number }
  producto: string | null
  cantidad: number
  stockActual: number
  stockVendido: number
  precioUnitario: number
  fleteUnitario: number
  total: number
  montoPagado: number
  montoRestante: number
  porcentajePagado: number
  estado: 'pendiente' | 'parcial' | 'completo' | 'cancelado'
  estadoStock: 'disponible' | 'bajo' | 'agotado'
  // Métricas de rentabilidad
  gananciaTotal: number
  gananciaRealizada: number
  gananciaPotencial: number
  margenBruto: number
  margenSobreCosto: number
  roi: number
  // Métricas de rotación
  rotacionDias: number | null
  velocidadVenta: number
  porcentajeVendido: number
  eficienciaRotacion: 'excelente' | 'buena' | 'normal' | 'lenta' | 'muy_lenta'
  diasDesdeCompra: number
}

interface TablaOCProps {
  distribuidorId?: string
  onEditOC?: (oc: OrdenCompraRow) => void
  onViewOC?: (oc: OrdenCompraRow) => void
  onPagar?: (oc: OrdenCompraRow) => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BADGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════

function EstadoPagoBadge({ estado }: { estado: string }) {
  const config = {
    pendiente: {
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: <AlertTriangle className="h-3 w-3" />,
      label: 'Pendiente',
    },
    parcial: {
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: <Clock className="h-3 w-3" />,
      label: 'Parcial',
    },
    completo: {
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: <BadgeCheck className="h-3 w-3" />,
      label: 'Pagado',
    },
    cancelado: {
      color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
      icon: null,
      label: 'Cancelado',
    },
  }[estado] || {
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    icon: null,
    label: estado,
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        config.color,
      )}
    >
      {config.icon}
      {config.label}
    </span>
  )
}

function StockBadge({ stock, total, estado }: { stock: number; total: number; estado: string }) {
  const percentage = (stock / total) * 100
  const color =
    estado === 'agotado'
      ? 'text-gray-400'
      : estado === 'bajo' || percentage < 20
        ? 'text-red-400'
        : percentage < 50
          ? 'text-amber-400'
          : 'text-emerald-400'

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Boxes className={cn('h-4 w-4', color)} />
        <span className={cn('font-medium tabular-nums', color)}>{stock}</span>
        <span className="text-white/30">/ {total}</span>
      </div>
    </div>
  )
}

function RotacionBadge({ eficiencia }: { eficiencia: string }) {
  const config = {
    excelente: { color: 'text-emerald-400', icon: <TrendingUp className="h-3 w-3" /> },
    buena: { color: 'text-cyan-400', icon: <TrendingUp className="h-3 w-3" /> },
    normal: { color: 'text-white/60', icon: <Gauge className="h-3 w-3" /> },
    lenta: { color: 'text-amber-400', icon: <TrendingDown className="h-3 w-3" /> },
    muy_lenta: { color: 'text-red-400', icon: <TrendingDown className="h-3 w-3" /> },
  }[eficiencia] || { color: 'text-white/40', icon: null }

  return (
    <span className={cn('flex items-center gap-1 text-xs font-medium', config.color)}>
      {config.icon}
      {eficiencia.replace('_', ' ')}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MINI CHART — Stacked bar for stock
// ═══════════════════════════════════════════════════════════════════════════════════════

function StockMiniChart({ vendido, actual, total }: { vendido: number; actual: number; total: number }) {
  const vendidoPct = (vendido / total) * 100
  const actualPct = (actual / total) * 100

  return (
    <div className="w-24">
      <div className="mb-1 flex h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="bg-emerald-500 transition-all duration-500"
          style={{ width: `${vendidoPct}%` }}
        />
        <div
          className="bg-violet-500 transition-all duration-500"
          style={{ width: `${actualPct}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-white/40">
        <span>{vendido} vendido</span>
        <span>{actual} stock</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DRILL-DOWN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

function OCDrillDown({ oc }: { oc: OrdenCompraRow }) {
  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Métricas principales */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/50">Costo Unitario</p>
          <p className="mt-1 text-lg font-semibold text-white">
            ${oc.precioUnitario.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/50">Flete Unitario</p>
          <p className="mt-1 text-lg font-semibold text-white">
            ${oc.fleteUnitario.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
          <p className="text-xs text-emerald-400/70">Ganancia Realizada</p>
          <p className="mt-1 text-lg font-semibold text-emerald-400">
            ${oc.gananciaRealizada.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-3">
          <p className="text-xs text-violet-400/70">Ganancia Potencial</p>
          <p className="mt-1 text-lg font-semibold text-violet-400">
            ${oc.gananciaPotencial.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
          <p className="text-xs text-cyan-400/70">ROI</p>
          <p className="mt-1 text-lg font-semibold text-cyan-400">
            {oc.roi.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Stock visual */}
      <div>
        <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70">
          <BarChart3 className="h-4 w-4" />
          Distribución de Stock
        </h4>
        <div className="h-4 overflow-hidden rounded-full bg-white/10">
          <div className="flex h-full">
            <motion.div
              className="bg-emerald-500"
              initial={{ width: 0 }}
              animate={{ width: `${oc.porcentajeVendido}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            <motion.div
              className="bg-violet-500"
              initial={{ width: 0 }}
              animate={{ width: `${(oc.stockActual / oc.cantidad) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            />
          </div>
        </div>
        <div className="mt-2 flex justify-between text-xs text-white/50">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Vendido: {oc.stockVendido} ({oc.porcentajeVendido.toFixed(1)}%)
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            Stock: {oc.stockActual}
          </span>
        </div>
      </div>

      {/* Métricas de rotación */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/50">Días desde compra</p>
          <p className="mt-1 text-lg font-semibold text-white">{oc.diasDesdeCompra}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/50">Rotación (días)</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {oc.rotacionDias?.toFixed(1) ?? '-'}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/50">Velocidad (pz/día)</p>
          <p className="mt-1 text-lg font-semibold text-white">
            {oc.velocidadVenta.toFixed(2)}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/50">Eficiencia</p>
          <div className="mt-1">
            <RotacionBadge eficiencia={oc.eficienciaRotacion} />
          </div>
        </div>
      </div>

      {/* Payment progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-white/50">Progreso de pago al distribuidor</span>
          <span className="font-medium text-white">
            ${oc.montoPagado.toLocaleString()} / ${oc.total.toLocaleString()}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className={cn(
              'h-full rounded-full',
              oc.estado === 'completo'
                ? 'bg-emerald-500'
                : oc.estado === 'parcial'
                  ? 'bg-amber-500'
                  : 'bg-red-500',
            )}
            initial={{ width: 0 }}
            animate={{ width: `${oc.porcentajePagado}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ACTION MENU
// ═══════════════════════════════════════════════════════════════════════════════════════

function ActionMenu({
  oc,
  onEdit,
  onView,
  onPagar,
}: {
  oc: OrdenCompraRow
  onEdit?: () => void
  onView?: () => void
  onPagar?: () => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <motion.button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <MoreHorizontal className="h-4 w-4" />
      </motion.button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation()
              setIsOpen(false)
            }}
          />
          <motion.div
            className="absolute right-0 z-20 mt-1 w-40 overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 shadow-xl backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onView?.()
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Eye className="h-4 w-4" />
              Ver detalles
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit?.()
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            {oc.estado !== 'completo' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onPagar?.()
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10"
              >
                <Wallet className="h-4 w-4" />
                Pagar
              </button>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export function TablaOC({
  distribuidorId,
  onEditOC,
  onViewOC,
  onPagar,
  className,
}: TablaOCProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Fetch OC data
  const { data: ocData, isLoading, error } = useQuery({
    queryKey: ['ordenes-compra', distribuidorId],
    queryFn: async () => {
      const { getOrdenesCompra } = await import('@/app/_actions/ordenes')
      const result = await getOrdenesCompra(distribuidorId, 200)
      if (!result.success) throw new Error(result.error)
      return result.data as OrdenCompraRow[]
    },
    staleTime: 5 * 60 * 1000,
  })

  // Toggle row expansion
  const toggleExpand = useCallback((id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Format date helper
  const formatDate = (fecha: Date | number | null) => {
    if (!fecha) return '-'
    const date = fecha instanceof Date ? fecha : new Date(fecha * 1000)
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  // Define columns
  const columns: ColumnDef<OrdenCompraRow>[] = useMemo(
    () => [
      // Expand
      {
        id: 'expand',
        header: '',
        size: 40,
        cell: ({ row }) => (
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              toggleExpand(row.original.id)
            }}
            className="rounded p-1 text-white/40 hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {expandedRows.has(row.original.id) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </motion.button>
        ),
      },
      // Fecha
      {
        accessorKey: 'fecha',
        header: 'Fecha',
        size: 110,
        cell: ({ row }) => (
          <span className="text-white/80">{formatDate(row.original.fecha)}</span>
        ),
      },
      // Distribuidor
      {
        accessorKey: 'distribuidor',
        header: 'Distribuidor',
        size: 160,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400">
              <Building2 className="h-4 w-4" />
            </div>
            <p className="font-medium text-white">
              {row.original.distribuidor?.nombre || 'Desconocido'}
            </p>
          </div>
        ),
      },
      // Producto
      {
        accessorKey: 'producto',
        header: 'Producto',
        size: 150,
        cell: ({ row }) => (
          <span className="text-white/80">{row.original.producto || '-'}</span>
        ),
      },
      // Stock
      {
        id: 'stock',
        header: 'Stock',
        size: 140,
        cell: ({ row }) => (
          <StockMiniChart
            vendido={row.original.stockVendido}
            actual={row.original.stockActual}
            total={row.original.cantidad}
          />
        ),
      },
      // Total
      {
        accessorKey: 'total',
        header: 'Total',
        size: 110,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums text-white">
            ${row.original.total.toLocaleString()}
          </span>
        ),
      },
      // Estado
      {
        accessorKey: 'estado',
        header: 'Pago',
        size: 100,
        cell: ({ row }) => <EstadoPagoBadge estado={row.original.estado} />,
      },
      // Ganancia
      {
        accessorKey: 'gananciaTotal',
        header: 'Ganancia',
        size: 110,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-emerald-400">
            ${row.original.gananciaTotal.toLocaleString()}
          </span>
        ),
      },
      // ROI
      {
        accessorKey: 'roi',
        header: 'ROI',
        size: 70,
        cell: ({ row }) => {
          const roi = row.original.roi
          const color = roi >= 50 ? 'text-emerald-400' : roi >= 20 ? 'text-amber-400' : 'text-red-400'
          return <span className={cn('font-semibold tabular-nums', color)}>{roi.toFixed(1)}%</span>
        },
      },
      // Rotación
      {
        accessorKey: 'eficienciaRotacion',
        header: 'Rotación',
        size: 90,
        cell: ({ row }) => <RotacionBadge eficiencia={row.original.eficienciaRotacion} />,
      },
      // Actions
      {
        id: 'actions',
        header: '',
        size: 50,
        cell: ({ row }) => (
          <ActionMenu
            oc={row.original}
            onEdit={() => onEditOC?.(row.original)}
            onView={() => onViewOC?.(row.original)}
            onPagar={() => onPagar?.(row.original)}
          />
        ),
      },
    ],
    [expandedRows, toggleExpand, onEditOC, onViewOC, onPagar],
  )

  return (
    <QuantumTable
      data={ocData || []}
      columns={columns}
      isLoading={isLoading}
      error={error as Error | null}
      title="Órdenes de Compra"
      subtitle="Gestión de lotes con métricas de rentabilidad y rotación"
      icon={<Package className="h-5 w-5" />}
      enableSearch
      enableSorting
      enablePagination
      pageSize={10}
      pageSizeOptions={[10, 25, 50, 100]}
      onRowClick={(row) => toggleExpand(row.id)}
      renderExpandedRow={(row) =>
        expandedRows.has(row.id) ? <OCDrillDown oc={row} /> : null
      }
      emptyMessage="No hay órdenes de compra registradas"
      className={className}
    />
  )
}

export default TablaOC
