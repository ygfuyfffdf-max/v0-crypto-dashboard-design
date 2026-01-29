'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 💰 TABLA MOVIMIENTOS — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Tabla de movimientos bancarios premium con:
 * ✅ Filtros por banco, tipo, fecha
 * ✅ Visualización de flujo (waterfall style)
 * ✅ Indicadores de origen/referencia
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
    ArrowLeftRight,
    ArrowUpRight,
    Building2,
    CircleDollarSign,
    CreditCard,
    DollarSign,
    Filter,
    Package,
    ShoppingCart,
    User,
    Wallet,
} from 'lucide-react'
import { motion } from 'motion/react'
import React, { useMemo, useState } from 'react'
import { QuantumTable } from './QuantumTable'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

type TipoMovimiento =
  | 'ingreso'
  | 'gasto'
  | 'transferencia_entrada'
  | 'transferencia_salida'
  | 'abono'
  | 'pago'
  | 'distribucion_gya'

interface MovimientoRow {
  id: string
  bancoId: string
  banco?: { nombre: string; color: string }
  tipo: TipoMovimiento
  monto: number
  fecha: Date | number | null
  concepto: string
  referencia: string | null
  categoria: string | null
  // Referencias
  bancoOrigenId: string | null
  bancoDestinoId: string | null
  clienteId: string | null
  cliente?: { nombre: string }
  distribuidorId: string | null
  distribuidor?: { nombre: string }
  ventaId: string | null
  ordenCompraId: string | null
  observaciones: string | null
}

interface TablaMovimientosProps {
  bancoId?: string
  tipo?: TipoMovimiento
  onViewMovimiento?: (mov: MovimientoRow) => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// BADGE COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════

function TipoMovimientoBadge({ tipo }: { tipo: TipoMovimiento }) {
  const config: Record<TipoMovimiento, { color: string; icon: React.ReactNode; label: string }> = {
    ingreso: {
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: <ArrowDownLeft className="h-3 w-3" />,
      label: 'Ingreso',
    },
    gasto: {
      color: 'bg-red-500/20 text-red-400 border-red-500/30',
      icon: <ArrowUpRight className="h-3 w-3" />,
      label: 'Gasto',
    },
    transferencia_entrada: {
      color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      icon: <ArrowLeftRight className="h-3 w-3" />,
      label: 'Transfer +',
    },
    transferencia_salida: {
      color: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
      icon: <ArrowLeftRight className="h-3 w-3" />,
      label: 'Transfer -',
    },
    abono: {
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: <Wallet className="h-3 w-3" />,
      label: 'Abono',
    },
    pago: {
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      icon: <CreditCard className="h-3 w-3" />,
      label: 'Pago',
    },
    distribucion_gya: {
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      icon: <CircleDollarSign className="h-3 w-3" />,
      label: 'GYA',
    },
  }

  const { color, icon, label } = config[tipo] || {
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    icon: null,
    label: tipo,
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        color,
      )}
    >
      {icon}
      {label}
    </span>
  )
}

function MontoDisplay({ monto, tipo }: { monto: number; tipo: TipoMovimiento }) {
  const isPositive = ['ingreso', 'transferencia_entrada', 'abono', 'distribucion_gya'].includes(tipo)
  const isNegative = ['gasto', 'transferencia_salida', 'pago'].includes(tipo)

  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        isPositive && 'text-emerald-400',
        isNegative && 'text-red-400',
        !isPositive && !isNegative && 'text-white',
      )}
    >
      {isPositive && '+'}
      {isNegative && '-'}
      ${Math.abs(monto).toLocaleString()}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ORIGEN INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════════════

function OrigenIndicator({ mov }: { mov: MovimientoRow }) {
  if (mov.cliente) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-white/60">
        <User className="h-3 w-3 text-violet-400" />
        {mov.cliente.nombre}
      </div>
    )
  }
  if (mov.distribuidor) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-white/60">
        <Building2 className="h-3 w-3 text-cyan-400" />
        {mov.distribuidor.nombre}
      </div>
    )
  }
  if (mov.ventaId) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-white/60">
        <ShoppingCart className="h-3 w-3 text-emerald-400" />
        Venta
      </div>
    )
  }
  if (mov.ordenCompraId) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-white/60">
        <Package className="h-3 w-3 text-amber-400" />
        OC
      </div>
    )
  }
  return <span className="text-xs text-white/30">-</span>
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FILTER TABS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface FilterTabsProps {
  selectedTipo: TipoMovimiento | 'todos'
  onSelect: (tipo: TipoMovimiento | 'todos') => void
}

function FilterTabs({ selectedTipo, onSelect }: FilterTabsProps) {
  const tabs: Array<{ value: TipoMovimiento | 'todos'; label: string; color: string }> = [
    { value: 'todos', label: 'Todos', color: 'bg-white/10' },
    { value: 'ingreso', label: 'Ingresos', color: 'bg-emerald-500/20' },
    { value: 'gasto', label: 'Gastos', color: 'bg-red-500/20' },
    { value: 'abono', label: 'Abonos', color: 'bg-emerald-500/20' },
    { value: 'pago', label: 'Pagos', color: 'bg-amber-500/20' },
    { value: 'distribucion_gya', label: 'GYA', color: 'bg-purple-500/20' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <motion.button
          key={tab.value}
          onClick={() => onSelect(tab.value)}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium transition-all',
            selectedTipo === tab.value
              ? `${tab.color} text-white`
              : 'text-white/50 hover:bg-white/5 hover:text-white',
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {tab.label}
        </motion.button>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export function TablaMovimientos({
  bancoId,
  tipo: initialTipo,
  onViewMovimiento,
  className,
}: TablaMovimientosProps) {
  const [tipoFilter, setTipoFilter] = useState<TipoMovimiento | 'todos'>(initialTipo || 'todos')

  // Fetch movimientos
  const { data: movimientosData, isLoading, error } = useQuery({
    queryKey: ['movimientos', bancoId, tipoFilter],
    queryFn: async () => {
      const { getMovimientos } = await import('@/app/_actions/movimientos')
      const result = await getMovimientos({
        bancoId,
        tipo: tipoFilter === 'todos' ? undefined : tipoFilter,
        limit: 200,
      })
      if (!result.success) throw new Error(result.error)
      return result.data as MovimientoRow[]
    },
    staleTime: 2 * 60 * 1000,
  })

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

  const formatTime = (fecha: Date | number | null) => {
    if (!fecha) return ''
    const date = fecha instanceof Date ? fecha : new Date(fecha * 1000)
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Define columns
  const columns: ColumnDef<MovimientoRow>[] = useMemo(
    () => [
      // Fecha
      {
        accessorKey: 'fecha',
        header: 'Fecha',
        size: 130,
        cell: ({ row }) => (
          <div>
            <p className="text-white/80">{formatDate(row.original.fecha)}</p>
            <p className="text-xs text-white/40">{formatTime(row.original.fecha)}</p>
          </div>
        ),
      },
      // Tipo
      {
        accessorKey: 'tipo',
        header: 'Tipo',
        size: 120,
        cell: ({ row }) => <TipoMovimientoBadge tipo={row.original.tipo} />,
      },
      // Monto
      {
        accessorKey: 'monto',
        header: 'Monto',
        size: 130,
        cell: ({ row }) => <MontoDisplay monto={row.original.monto} tipo={row.original.tipo} />,
      },
      // Concepto
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
      // Origen/Referencia
      {
        id: 'origen',
        header: 'Origen',
        size: 150,
        cell: ({ row }) => <OrigenIndicator mov={row.original} />,
      },
      // Banco
      {
        accessorKey: 'banco',
        header: 'Banco',
        size: 140,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: row.original.banco?.color || '#8B5CF6' }}
            />
            <span className="text-white/80">{row.original.banco?.nombre || '-'}</span>
          </div>
        ),
      },
      // Referencia
      {
        accessorKey: 'referencia',
        header: 'Ref.',
        size: 100,
        cell: ({ row }) =>
          row.original.referencia ? (
            <span className="font-mono text-xs text-white/50">{row.original.referencia}</span>
          ) : (
            <span className="text-white/20">-</span>
          ),
      },
    ],
    [],
  )

  return (
    <div className={cn('space-y-4', className)}>
      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <FilterTabs selectedTipo={tipoFilter} onSelect={setTipoFilter} />
      </div>

      {/* Table */}
      <QuantumTable
        data={movimientosData || []}
        columns={columns}
        isLoading={isLoading}
        error={error as Error | null}
        title="Movimientos"
        subtitle={bancoId ? 'Historial de movimientos del banco' : 'Todos los movimientos financieros'}
        icon={<DollarSign className="h-5 w-5" />}
        enableSearch
        enableSorting
        enablePagination
        pageSize={15}
        pageSizeOptions={[15, 30, 50, 100]}
        onRowClick={(row) => onViewMovimiento?.(row)}
        emptyMessage="No hay movimientos registrados"
        emptyIcon={<Filter className="h-12 w-12 text-white/20" />}
      />
    </div>
  )
}

export default TablaMovimientos
