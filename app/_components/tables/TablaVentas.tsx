'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📊 TABLA VENTAS — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Tabla de ventas premium con:
 * ✅ Paginación infinita TanStack Table
 * ✅ Filtros semánticos AI-ready
 * ✅ Sort multi-columna
 * ✅ Drill-down trazabilidad de lotes
 * ✅ Real-time sync via Drizzle + React Query
 * ✅ Animaciones 3D premium
 * ✅ Error handling + loading states
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
    ChevronDown,
    ChevronRight,
    Clock,
    Eye,
    MoreHorizontal,
    Package,
    Pencil,
    ShoppingCart,
    User,
    Wallet,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useMemo, useState } from 'react'
import { QuantumTable } from './QuantumTable'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

interface OrigenLote {
  ocId: string
  cantidad: number
  costoUnidad?: number
}

interface VentaRow {
  id: string
  fecha: Date | number | null
  clienteId: string
  cliente?: { nombre: string; saldoPendiente?: number }
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete: number
  precioTotalVenta: number
  estadoPago: 'pendiente' | 'parcial' | 'completo'
  montoPagado: number
  montoRestante: number
  porcentajePagado: number
  origenLotes: string | OrigenLote[] | null
  gananciaTotal: number
  margenBruto: number
  estado: string
}

interface TablaVentasProps {
  onEditVenta?: (venta: VentaRow) => void
  onViewVenta?: (venta: VentaRow) => void
  onAbonar?: (venta: VentaRow) => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BADGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════

function EstadoPagoBadge({ estado }: { estado: 'pendiente' | 'parcial' | 'completo' }) {
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

function MargenBadge({ margen }: { margen: number }) {
  const color =
    margen >= 30
      ? 'text-emerald-400'
      : margen >= 15
        ? 'text-amber-400'
        : 'text-red-400'

  return (
    <span className={cn('font-semibold tabular-nums', color)}>
      {margen.toFixed(1)}%
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DRILL-DOWN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

function VentaDrillDown({ venta }: { venta: VentaRow }) {
  // Parse origenLotes
  let lotes: OrigenLote[] = []
  try {
    if (typeof venta.origenLotes === 'string') {
      lotes = JSON.parse(venta.origenLotes)
    } else if (Array.isArray(venta.origenLotes)) {
      lotes = venta.origenLotes
    }
  } catch {
    lotes = []
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/50">Precio Compra/u</p>
          <p className="mt-1 text-lg font-semibold text-white">
            ${venta.precioCompraUnidad.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/50">Precio Venta/u</p>
          <p className="mt-1 text-lg font-semibold text-white">
            ${venta.precioVentaUnidad.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-white/50">Flete/u</p>
          <p className="mt-1 text-lg font-semibold text-white">
            ${venta.precioFlete.toLocaleString()}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3">
          <p className="text-xs text-emerald-400/70">Ganancia Neta</p>
          <p className="mt-1 text-lg font-semibold text-emerald-400">
            ${venta.gananciaTotal.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Lotes trazability */}
      {lotes.length > 0 && (
        <div>
          <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-white/70">
            <Package className="h-4 w-4" />
            Trazabilidad de Lotes ({lotes.length})
          </h4>
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="px-3 py-2 text-left text-xs font-medium text-white/50">
                    OC ID
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-white/50">
                    Cantidad
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium text-white/50">
                    Costo/u
                  </th>
                </tr>
              </thead>
              <tbody>
                {lotes.map((lote, index) => (
                  <tr key={index} className="border-b border-white/5">
                    <td className="px-3 py-2 font-mono text-xs text-violet-400">
                      {lote.ocId.slice(0, 8)}...
                    </td>
                    <td className="px-3 py-2 text-right text-white">
                      {lote.cantidad}
                    </td>
                    <td className="px-3 py-2 text-right text-white/70">
                      ${lote.costoUnidad?.toLocaleString() ?? '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment progress */}
      <div>
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-white/50">Progreso de pago</span>
          <span className="font-medium text-white">
            ${venta.montoPagado.toLocaleString()} / ${venta.precioTotalVenta.toLocaleString()}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className={cn(
              'h-full rounded-full',
              venta.estadoPago === 'completo'
                ? 'bg-emerald-500'
                : venta.estadoPago === 'parcial'
                  ? 'bg-amber-500'
                  : 'bg-red-500',
            )}
            initial={{ width: 0 }}
            animate={{ width: `${venta.porcentajePagado}%` }}
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
  venta,
  onEdit,
  onView,
  onAbonar,
}: {
  venta: VentaRow
  onEdit?: () => void
  onView?: () => void
  onAbonar?: () => void
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
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation()
                onView?.()
                setIsOpen(false)
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
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
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Pencil className="h-4 w-4" />
              Editar
            </button>
            {venta.estadoPago !== 'completo' && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onAbonar?.()
                  setIsOpen(false)
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-emerald-400 transition-colors hover:bg-emerald-500/10"
              >
                <Wallet className="h-4 w-4" />
                Abonar
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

export function TablaVentas({
  onEditVenta,
  onViewVenta,
  onAbonar,
  className,
}: TablaVentasProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Fetch ventas data
  const { data: ventasData, isLoading, error } = useQuery({
    queryKey: ['ventas'],
    queryFn: async () => {
      const { getVentas } = await import('@/app/_actions/ventas')
      const result = await getVentas(200)
      if (!result.success) throw new Error(result.error)
      return result.data as VentaRow[]
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  const columns: ColumnDef<VentaRow>[] = useMemo(
    () => [
      // Expand column
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
            className="rounded p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
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
        size: 120,
        cell: ({ row }) => (
          <span className="text-white/80">{formatDate(row.original.fecha)}</span>
        ),
      },
      // Cliente
      {
        accessorKey: 'cliente',
        header: 'Cliente',
        size: 180,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-white">
                {row.original.cliente?.nombre || 'Cliente desconocido'}
              </p>
              {row.original.cliente?.saldoPendiente && row.original.cliente.saldoPendiente > 0 && (
                <p className="text-xs text-amber-400">
                  Debe: ${row.original.cliente.saldoPendiente.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ),
      },
      // Cantidad
      {
        accessorKey: 'cantidad',
        header: 'Cant.',
        size: 80,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-white">
            {row.original.cantidad}
          </span>
        ),
      },
      // Total
      {
        accessorKey: 'precioTotalVenta',
        header: 'Total',
        size: 120,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums text-white">
            ${row.original.precioTotalVenta.toLocaleString()}
          </span>
        ),
      },
      // Estado de pago
      {
        accessorKey: 'estadoPago',
        header: 'Estado',
        size: 120,
        cell: ({ row }) => <EstadoPagoBadge estado={row.original.estadoPago} />,
      },
      // Pagado / Restante
      {
        id: 'pagos',
        header: 'Pagado / Restante',
        size: 160,
        cell: ({ row }) => (
          <div className="text-xs">
            <span className="text-emerald-400">
              ${row.original.montoPagado.toLocaleString()}
            </span>
            <span className="text-white/30"> / </span>
            <span className="text-red-400">
              ${row.original.montoRestante.toLocaleString()}
            </span>
          </div>
        ),
      },
      // Ganancia
      {
        accessorKey: 'gananciaTotal',
        header: 'Ganancia',
        size: 120,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-emerald-400">
            ${row.original.gananciaTotal.toLocaleString()}
          </span>
        ),
      },
      // Margen
      {
        accessorKey: 'margenBruto',
        header: 'Margen',
        size: 80,
        cell: ({ row }) => <MargenBadge margen={row.original.margenBruto} />,
      },
      // Actions
      {
        id: 'actions',
        header: '',
        size: 50,
        cell: ({ row }) => (
          <ActionMenu
            venta={row.original}
            onEdit={() => onEditVenta?.(row.original)}
            onView={() => onViewVenta?.(row.original)}
            onAbonar={() => onAbonar?.(row.original)}
          />
        ),
      },
    ],
    [expandedRows, toggleExpand, onEditVenta, onViewVenta, onAbonar],
  )

  // Data with expansion tracking
  const dataWithExpansion = useMemo(() => {
    if (!ventasData) return []
    return ventasData.map((venta) => ({
      ...venta,
      _isExpanded: expandedRows.has(venta.id),
    }))
  }, [ventasData, expandedRows])

  return (
    <QuantumTable
      data={dataWithExpansion}
      columns={columns}
      isLoading={isLoading}
      error={error as Error | null}
      title="Ventas"
      subtitle="Gestión completa de ventas con trazabilidad de lotes"
      icon={<ShoppingCart className="h-5 w-5" />}
      enableSearch
      enableSorting
      enablePagination
      pageSize={10}
      pageSizeOptions={[10, 25, 50, 100]}
      onRowClick={(row) => toggleExpand(row.id)}
      renderExpandedRow={(row) =>
        expandedRows.has(row.id) ? <VentaDrillDown venta={row} /> : null
      }
      emptyMessage="No hay ventas registradas"
      className={className}
    />
  )
}

export default TablaVentas
