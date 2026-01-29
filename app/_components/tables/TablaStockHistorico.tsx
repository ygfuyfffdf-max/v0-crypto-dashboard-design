'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📦 TABLA STOCK HISTORICO — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Tabla con historial de entradas y salidas del almacén:
 * ✅ Tabs para Entradas/Salidas
 * ✅ Trazabilidad de lotes en salidas
 * ✅ Indicadores de ganancia y margen por salida
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Boxes,
    Calendar,
    Eye,
    Package,
    ShoppingCart,
    TrendingUp,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { QuantumTable } from './QuantumTable'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

interface OrigenLote {
  ocId: string
  cantidad: number
}

interface EntradaRow {
  id: string
  ordenCompraId: string | null
  ordenCompra?: { producto: string; distribuidor?: { nombre: string } }
  productoId: string | null
  producto?: { nombre: string }
  cantidad: number
  costoTotal: number
  fecha: Date | number | null
  observaciones: string | null
}

interface SalidaRow {
  id: string
  ventaId: string | null
  venta?: { cliente?: { nombre: string }; gananciaTotal: number; margenBruto: number }
  productoId: string | null
  producto?: { nombre: string }
  cantidad: number
  origenLotes: string | OrigenLote[] | null
  fecha: Date | number | null
  observaciones: string | null
}

interface TablaStockHistoricoProps {
  type?: 'entradas' | 'salidas'
  productoId?: string
  onViewEntrada?: (entrada: EntradaRow) => void
  onViewSalida?: (salida: SalidaRow) => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TAB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

type TabType = 'entradas' | 'salidas'

interface TabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

function Tabs({ activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-white/5 p-1">
      <motion.button
        onClick={() => onTabChange('entradas')}
        className={cn(
          'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          activeTab === 'entradas' ? 'text-white' : 'text-white/50 hover:text-white/70',
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {activeTab === 'entradas' && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-emerald-500/20"
            layoutId="activeStockTab"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <ArrowDownToLine className="relative z-10 h-4 w-4" />
        <span className="relative z-10">Entradas</span>
      </motion.button>

      <motion.button
        onClick={() => onTabChange('salidas')}
        className={cn(
          'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          activeTab === 'salidas' ? 'text-white' : 'text-white/50 hover:text-white/70',
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {activeTab === 'salidas' && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-cyan-500/20"
            layoutId="activeStockTab"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <ArrowUpFromLine className="relative z-10 h-4 w-4" />
        <span className="relative z-10">Salidas</span>
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ENTRADAS TABLE
// ═══════════════════════════════════════════════════════════════════════════════════════

interface TablaEntradasInnerProps {
  productoId?: string
  onViewEntrada?: (entrada: EntradaRow) => void
}

function TablaEntradasInner({ productoId, onViewEntrada }: TablaEntradasInnerProps) {
  const { data: entradasData, isLoading, error } = useQuery({
    queryKey: ['entradas-almacen', productoId],
    queryFn: async () => {
      // Simulated API call - replace with actual action
      const { getEntradasAlmacen } = await import('@/app/_actions/almacen')
      const result = await getEntradasAlmacen(productoId, 200)
      if (!result.success) throw new Error(result.error)
      return result.data as EntradaRow[]
    },
    staleTime: 5 * 60 * 1000,
  })

  const formatDate = (fecha: Date | number | null) => {
    if (!fecha) return '-'
    const date = fecha instanceof Date ? fecha : new Date(fecha * 1000)
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const columns: ColumnDef<EntradaRow>[] = useMemo(
    () => [
      {
        accessorKey: 'fecha',
        header: 'Fecha',
        size: 120,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-white/40" />
            <span className="text-white/80">{formatDate(row.original.fecha)}</span>
          </div>
        ),
      },
      {
        id: 'origen',
        header: 'OC Origen',
        size: 150,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
              <Package className="h-4 w-4" />
            </div>
            <div>
              <p className="text-white">
                {row.original.ordenCompra?.producto || 'OC'}
              </p>
              {row.original.ordenCompra?.distribuidor && (
                <p className="text-xs text-white/40">
                  {row.original.ordenCompra.distribuidor.nombre}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        id: 'producto',
        header: 'Producto',
        size: 180,
        cell: ({ row }) => (
          <span className="text-white">{row.original.producto?.nombre || '-'}</span>
        ),
      },
      {
        accessorKey: 'cantidad',
        header: 'Cantidad',
        size: 100,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-emerald-400" />
            <span className="font-medium tabular-nums text-emerald-400">
              +{row.original.cantidad}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'costoTotal',
        header: 'Costo Total',
        size: 120,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-white">
            ${row.original.costoTotal.toLocaleString()}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 50,
        cell: ({ row }) => (
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onViewEntrada?.(row.original)
            }}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="h-4 w-4" />
          </motion.button>
        ),
      },
    ],
    [onViewEntrada],
  )

  return (
    <QuantumTable
      data={entradasData || []}
      columns={columns}
      isLoading={isLoading}
      error={error as Error | null}
      enableSearch
      enableSorting
      enablePagination
      pageSize={10}
      emptyMessage="No hay entradas registradas"
      emptyIcon={<ArrowDownToLine className="h-12 w-12 text-white/20" />}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SALIDAS TABLE
// ═══════════════════════════════════════════════════════════════════════════════════════

interface TablaSalidasInnerProps {
  productoId?: string
  onViewSalida?: (salida: SalidaRow) => void
}

function TablaSalidasInner({ productoId, onViewSalida }: TablaSalidasInnerProps) {
  const { data: salidasData, isLoading, error } = useQuery({
    queryKey: ['salidas-almacen', productoId],
    queryFn: async () => {
      const { getSalidasAlmacen } = await import('@/app/_actions/almacen')
      const result = await getSalidasAlmacen(productoId, 200)
      if (!result.success) throw new Error(result.error)
      return result.data as SalidaRow[]
    },
    staleTime: 5 * 60 * 1000,
  })

  const formatDate = (fecha: Date | number | null) => {
    if (!fecha) return '-'
    const date = fecha instanceof Date ? fecha : new Date(fecha * 1000)
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const columns: ColumnDef<SalidaRow>[] = useMemo(
    () => [
      {
        accessorKey: 'fecha',
        header: 'Fecha',
        size: 120,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-white/40" />
            <span className="text-white/80">{formatDate(row.original.fecha)}</span>
          </div>
        ),
      },
      {
        id: 'destino',
        header: 'Venta Destino',
        size: 180,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <p className="text-white">
              {row.original.venta?.cliente?.nombre || 'Venta'}
            </p>
          </div>
        ),
      },
      {
        id: 'producto',
        header: 'Producto',
        size: 180,
        cell: ({ row }) => (
          <span className="text-white">{row.original.producto?.nombre || '-'}</span>
        ),
      },
      {
        accessorKey: 'cantidad',
        header: 'Cantidad',
        size: 100,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Boxes className="h-4 w-4 text-cyan-400" />
            <span className="font-medium tabular-nums text-cyan-400">
              -{row.original.cantidad}
            </span>
          </div>
        ),
      },
      {
        id: 'origenLotes',
        header: 'Lotes Origen',
        size: 150,
        cell: ({ row }) => {
          let lotes: OrigenLote[] = []
          try {
            if (typeof row.original.origenLotes === 'string') {
              lotes = JSON.parse(row.original.origenLotes)
            } else if (Array.isArray(row.original.origenLotes)) {
              lotes = row.original.origenLotes
            }
          } catch {
            lotes = []
          }

          if (lotes.length === 0) return <span className="text-white/30">-</span>

          return (
            <div className="flex flex-wrap gap-1">
              {lotes.slice(0, 2).map((lote, i) => (
                <span
                  key={i}
                  className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/60"
                >
                  {lote.ocId.slice(0, 6)}:{lote.cantidad}
                </span>
              ))}
              {lotes.length > 2 && (
                <span className="text-xs text-white/40">+{lotes.length - 2}</span>
              )}
            </div>
          )
        },
      },
      {
        id: 'ganancia',
        header: 'Ganancia',
        size: 100,
        cell: ({ row }) => (
          <span className="font-medium tabular-nums text-emerald-400">
            ${row.original.venta?.gananciaTotal?.toLocaleString() || '0'}
          </span>
        ),
      },
      {
        id: 'margen',
        header: 'Margen',
        size: 80,
        cell: ({ row }) => {
          const margen = row.original.venta?.margenBruto || 0
          const color = margen >= 30 ? 'text-emerald-400' : margen >= 15 ? 'text-amber-400' : 'text-red-400'
          return (
            <div className="flex items-center gap-1">
              <TrendingUp className={cn('h-3 w-3', color)} />
              <span className={cn('font-semibold tabular-nums', color)}>{margen.toFixed(1)}%</span>
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: '',
        size: 50,
        cell: ({ row }) => (
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onViewSalida?.(row.original)
            }}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Eye className="h-4 w-4" />
          </motion.button>
        ),
      },
    ],
    [onViewSalida],
  )

  return (
    <QuantumTable
      data={salidasData || []}
      columns={columns}
      isLoading={isLoading}
      error={error as Error | null}
      enableSearch
      enableSorting
      enablePagination
      pageSize={10}
      emptyMessage="No hay salidas registradas"
      emptyIcon={<ArrowUpFromLine className="h-12 w-12 text-white/20" />}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export function TablaStockHistorico({
  type: initialType,
  productoId,
  onViewEntrada,
  onViewSalida,
  className,
}: TablaStockHistoricoProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialType || 'entradas')

  return (
    <motion.div
      className={cn(
        'overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl',
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header with tabs */}
      <div className="flex flex-col gap-4 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20">
            <Boxes className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Historial de Stock</h3>
            <p className="text-sm text-white/50">Entradas y salidas del almacén</p>
          </div>
        </div>

        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'entradas' ? (
            <motion.div
              key="entradas"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <TablaEntradasInner productoId={productoId} onViewEntrada={onViewEntrada} />
            </motion.div>
          ) : (
            <motion.div
              key="salidas"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TablaSalidasInner productoId={productoId} onViewSalida={onViewSalida} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default TablaStockHistorico
