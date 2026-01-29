'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 💸 TABLA GASTOS Y ABONOS — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Tabla con tabs para gestión de gastos y abonos:
 * ✅ Tabs separados para Gastos/Abonos
 * ✅ Filtros por banco, cliente/distribuidor
 * ✅ Real-time sync via Drizzle + React Query
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { useQuery } from '@tanstack/react-query'
import { type ColumnDef } from '@tanstack/react-table'
import {
    ArrowDownLeft,
    ArrowUpRight,
    Calendar,
    CreditCard,
    Eye,
    Receipt,
    User,
    Wallet,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { QuantumTable } from './QuantumTable'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

interface GastoRow {
  id: string
  bancoId: string
  banco?: { nombre: string; color: string }
  monto: number
  concepto: string
  categoria: string | null
  fecha: Date | number | null
  referencia: string | null
  observaciones: string | null
}

interface AbonoRow {
  id: string
  ventaId: string
  clienteId: string
  cliente?: { nombre: string; saldoPendiente?: number }
  monto: number
  fecha: Date | number | null
  proporcion: number
  montoBovedaMonte: number
  montoFletes: number
  montoUtilidades: number
  estadoPagoResultante: 'pendiente' | 'parcial' | 'completo'
  concepto: string | null
}

interface TablaGastosAbonosProps {
  onViewGasto?: (gasto: GastoRow) => void
  onViewAbono?: (abono: AbonoRow) => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// TAB COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

type TabType = 'gastos' | 'abonos'

interface TabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  gastosCount?: number
  abonosCount?: number
}

function Tabs({ activeTab, onTabChange, gastosCount, abonosCount }: TabsProps) {
  return (
    <div className="flex gap-1 rounded-xl bg-white/5 p-1">
      <motion.button
        onClick={() => onTabChange('gastos')}
        className={cn(
          'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          activeTab === 'gastos' ? 'text-white' : 'text-white/50 hover:text-white/70',
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {activeTab === 'gastos' && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-red-500/20"
            layoutId="activeTab"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <ArrowUpRight className="relative z-10 h-4 w-4" />
        <span className="relative z-10">Gastos</span>
        {gastosCount !== undefined && (
          <span className="relative z-10 rounded-full bg-white/10 px-2 py-0.5 text-xs">
            {gastosCount}
          </span>
        )}
      </motion.button>

      <motion.button
        onClick={() => onTabChange('abonos')}
        className={cn(
          'relative flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
          activeTab === 'abonos' ? 'text-white' : 'text-white/50 hover:text-white/70',
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {activeTab === 'abonos' && (
          <motion.div
            className="absolute inset-0 rounded-lg bg-emerald-500/20"
            layoutId="activeTab"
            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          />
        )}
        <ArrowDownLeft className="relative z-10 h-4 w-4" />
        <span className="relative z-10">Abonos</span>
        {abonosCount !== undefined && (
          <span className="relative z-10 rounded-full bg-white/10 px-2 py-0.5 text-xs">
            {abonosCount}
          </span>
        )}
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GASTOS TABLE
// ═══════════════════════════════════════════════════════════════════════════════════════

interface TablaGastosInnerProps {
  onViewGasto?: (gasto: GastoRow) => void
}

function TablaGastosInner({ onViewGasto }: TablaGastosInnerProps) {
  const { data: gastosData, isLoading, error } = useQuery({
    queryKey: ['gastos'],
    queryFn: async () => {
      const { getMovimientos } = await import('@/app/_actions/movimientos')
      const result = await getMovimientos({ tipo: 'gasto', limit: 200 })
      if (!result.success) throw new Error(result.error)
      return result.data as GastoRow[]
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

  const columns: ColumnDef<GastoRow>[] = useMemo(
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
        accessorKey: 'banco',
        header: 'Banco',
        size: 150,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: row.original.banco?.color || '#8B5CF6' }}
            />
            <span className="text-white">{row.original.banco?.nombre || '-'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'monto',
        header: 'Monto',
        size: 120,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums text-red-400">
            -${row.original.monto.toLocaleString()}
          </span>
        ),
      },
      {
        accessorKey: 'concepto',
        header: 'Concepto',
        size: 200,
        cell: ({ row }) => (
          <div>
            <p className="text-white">{row.original.concepto}</p>
            {row.original.categoria && (
              <p className="text-xs text-white/40">{row.original.categoria}</p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'referencia',
        header: 'Referencia',
        size: 100,
        cell: ({ row }) =>
          row.original.referencia ? (
            <span className="font-mono text-xs text-white/50">{row.original.referencia}</span>
          ) : (
            <span className="text-white/20">-</span>
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
              onViewGasto?.(row.original)
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
    [onViewGasto],
  )

  return (
    <QuantumTable
      data={gastosData || []}
      columns={columns}
      isLoading={isLoading}
      error={error as Error | null}
      enableSearch
      enableSorting
      enablePagination
      pageSize={10}
      emptyMessage="No hay gastos registrados"
      emptyIcon={<Receipt className="h-12 w-12 text-white/20" />}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ABONOS TABLE
// ═══════════════════════════════════════════════════════════════════════════════════════

interface TablaAbonosInnerProps {
  onViewAbono?: (abono: AbonoRow) => void
}

function TablaAbonosInner({ onViewAbono }: TablaAbonosInnerProps) {
  const { data: abonosData, isLoading, error } = useQuery({
    queryKey: ['abonos'],
    queryFn: async () => {
      const { getAbonos } = await import('@/app/_actions/movimientos')
      const result = await getAbonos(200)
      if (!result.success) throw new Error(result.error)
      return result.data as AbonoRow[]
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

  const columns: ColumnDef<AbonoRow>[] = useMemo(
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
        accessorKey: 'cliente',
        header: 'Cliente',
        size: 180,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-400">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-white">{row.original.cliente?.nombre || '-'}</p>
              {row.original.cliente?.saldoPendiente && row.original.cliente.saldoPendiente > 0 && (
                <p className="text-xs text-amber-400">
                  Debe: ${row.original.cliente.saldoPendiente.toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'monto',
        header: 'Monto',
        size: 120,
        cell: ({ row }) => (
          <span className="font-semibold tabular-nums text-emerald-400">
            +${row.original.monto.toLocaleString()}
          </span>
        ),
      },
      {
        id: 'distribucion',
        header: 'Distribución GYA',
        size: 200,
        cell: ({ row }) => (
          <div className="flex gap-1 text-xs">
            <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-amber-400">
              B: ${row.original.montoBovedaMonte.toLocaleString()}
            </span>
            <span className="rounded bg-cyan-500/20 px-1.5 py-0.5 text-cyan-400">
              F: ${row.original.montoFletes.toLocaleString()}
            </span>
            <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-emerald-400">
              U: ${row.original.montoUtilidades.toLocaleString()}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'proporcion',
        header: '% Pagado',
        size: 100,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${row.original.proporcion * 100}%` }}
              />
            </div>
            <span className="text-xs text-white/60">{(row.original.proporcion * 100).toFixed(0)}%</span>
          </div>
        ),
      },
      {
        accessorKey: 'estadoPagoResultante',
        header: 'Estado',
        size: 100,
        cell: ({ row }) => {
          const estado = row.original.estadoPagoResultante
          const config = {
            completo: 'bg-emerald-500/20 text-emerald-400',
            parcial: 'bg-amber-500/20 text-amber-400',
            pendiente: 'bg-red-500/20 text-red-400',
          }[estado]
          return (
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', config)}>
              {estado}
            </span>
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
              onViewAbono?.(row.original)
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
    [onViewAbono],
  )

  return (
    <QuantumTable
      data={abonosData || []}
      columns={columns}
      isLoading={isLoading}
      error={error as Error | null}
      enableSearch
      enableSorting
      enablePagination
      pageSize={10}
      emptyMessage="No hay abonos registrados"
      emptyIcon={<Wallet className="h-12 w-12 text-white/20" />}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export function TablaGastosAbonos({
  onViewGasto,
  onViewAbono,
  className,
}: TablaGastosAbonosProps) {
  const [activeTab, setActiveTab] = useState<TabType>('gastos')

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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
            <CreditCard className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Gastos & Abonos</h3>
            <p className="text-sm text-white/50">Gestión de flujo de efectivo</p>
          </div>
        </div>

        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'gastos' ? (
            <motion.div
              key="gastos"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <TablaGastosInner onViewGasto={onViewGasto} />
            </motion.div>
          ) : (
            <motion.div
              key="abonos"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <TablaAbonosInner onViewAbono={onViewAbono} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default TablaGastosAbonos
