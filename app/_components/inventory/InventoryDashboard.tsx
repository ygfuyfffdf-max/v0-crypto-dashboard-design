'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📦 INVENTORY & PURCHASE ORDER SYSTEM — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de inventario y órdenes de compra:
 * - Dashboard de inventario con stock en tiempo real
 * - Control de órdenes de compra
 * - Trazabilidad de lotes
 * - Contabilización de productos disponibles
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  Box,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Clock,
  DollarSign,
  Eye,
  FileText,
  Filter,
  Hash,
  Layers,
  Loader2,
  Package,
  Percent,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart,
  Sparkles,
  Tag,
  TrendingDown,
  TrendingUp,
  Truck,
  X,
  Activity,
  AlertCircle,
  CheckCircle2,
  Archive,
  RotateCcw,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useMemo, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ProductStats {
  stockTotal: number
  stockDisponible: number
  stockReservado: number
  stockMinimo: number
  stockMaximo: number
  valorInventario: number
  costoPromedio: number
  precioVentaPromedio: number
  rotacionDias: number
  margenPromedio: number
  unidadesVendidas30d: number
  ordenesActivas: number
}

interface OrdenCompra {
  id: string
  folio: string
  distribuidorId: string
  distribuidor: { nombre: string }
  fecha: Date
  cantidad: number
  stockActual: number
  stockVendido: number
  precioCompra: number
  precioVenta: number
  costoTotal: number
  ventasTotales: number
  gananciaNeta: number
  margenPorcentaje: number
  rotacionDias: number | null
  estado: 'activa' | 'agotada' | 'parcial' | 'devuelta'
  estadoPago: 'pendiente' | 'parcial' | 'pagada'
  saldoPendiente: number
}

interface InventoryMovement {
  id: string
  tipo: 'entrada' | 'salida' | 'ajuste' | 'devolucion'
  cantidad: number
  fecha: Date
  ordenCompraId?: string
  ventaId?: string
  concepto: string
  stockResultante: number
}

interface StockAlert {
  type: 'low' | 'out' | 'overstock' | 'slow_rotation'
  ordenId: string
  ordenFolio: string
  message: string
  severity: 'warning' | 'error' | 'info'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STOCK STATS CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface StockStatsCardProps {
  title: string
  value: number | string
  subtitle?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  change?: number
  colorScheme: 'gold' | 'violet' | 'emerald' | 'rose' | 'blue' | 'orange'
}

const colorSchemes = {
  gold: {
    bg: 'from-amber-500/20 to-yellow-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    text: 'text-amber-400',
  },
  violet: {
    bg: 'from-violet-500/20 to-purple-500/10',
    border: 'border-violet-500/30',
    icon: 'text-violet-400',
    text: 'text-violet-400',
  },
  emerald: {
    bg: 'from-emerald-500/20 to-green-500/10',
    border: 'border-emerald-500/30',
    icon: 'text-emerald-400',
    text: 'text-emerald-400',
  },
  rose: {
    bg: 'from-rose-500/20 to-pink-500/10',
    border: 'border-rose-500/30',
    icon: 'text-rose-400',
    text: 'text-rose-400',
  },
  blue: {
    bg: 'from-blue-500/20 to-sky-500/10',
    border: 'border-blue-500/30',
    icon: 'text-blue-400',
    text: 'text-blue-400',
  },
  orange: {
    bg: 'from-orange-500/20 to-amber-500/10',
    border: 'border-orange-500/30',
    icon: 'text-orange-400',
    text: 'text-orange-400',
  },
}

const StockStatsCard = memo(function StockStatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  change,
  colorScheme,
}: StockStatsCardProps) {
  const scheme = colorSchemes[colorScheme]

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border backdrop-blur-xl p-5',
        'bg-gradient-to-br',
        scheme.bg,
        scheme.border
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
    >
      <div className="flex items-start justify-between">
        <div className={cn('rounded-xl bg-black/30 p-2.5', scheme.icon)}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium',
            change >= 0
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'bg-rose-500/20 text-rose-400'
          )}>
            {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-2xl font-bold text-white">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="mt-1 text-sm text-white/60">{title}</p>
        {subtitle && (
          <p className={cn('mt-0.5 text-xs', scheme.text)}>{subtitle}</p>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-2">
          {trend === 'up' ? (
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          ) : trend === 'down' ? (
            <TrendingDown className="h-3 w-3 text-rose-400" />
          ) : (
            <Activity className="h-3 w-3 text-amber-400" />
          )}
          <span className="text-xs text-white/50">vs mes anterior</span>
        </div>
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ORDEN COMPRA CARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OrdenCompraCardProps {
  orden: OrdenCompra
  onClick?: () => void
}

const OrdenCompraCard = memo(function OrdenCompraCard({
  orden,
  onClick,
}: OrdenCompraCardProps) {
  const stockProgress = (orden.stockActual / orden.cantidad) * 100
  const isLowStock = orden.stockActual < orden.cantidad * 0.2
  const isCritical = orden.stockActual <= 0

  const estadoConfig = {
    activa: { label: 'Activa', color: 'bg-emerald-500/20 text-emerald-400' },
    agotada: { label: 'Agotada', color: 'bg-rose-500/20 text-rose-400' },
    parcial: { label: 'Parcial', color: 'bg-amber-500/20 text-amber-400' },
    devuelta: { label: 'Devuelta', color: 'bg-gray-500/20 text-gray-400' },
  }

  const pagoConfig = {
    pendiente: { label: 'Por Pagar', color: 'text-rose-400' },
    parcial: { label: 'Pago Parcial', color: 'text-amber-400' },
    pagada: { label: 'Pagada', color: 'text-emerald-400' },
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 cursor-pointer transition-all',
        isCritical
          ? 'border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-rose-600/5'
          : isLowStock
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5'
          : 'border-white/10 bg-white/5 hover:bg-white/10'
      )}
      onClick={onClick}
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Alert badge */}
      {(isLowStock || isCritical) && (
        <div className="absolute top-3 right-3">
          <motion.div
            className={cn(
              'rounded-full p-1',
              isCritical ? 'bg-rose-500/20' : 'bg-amber-500/20'
            )}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <AlertTriangle className={cn(
              'h-4 w-4',
              isCritical ? 'text-rose-400' : 'text-amber-400'
            )} />
          </motion.div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-violet-500/20 p-2.5 text-violet-400">
          <Package className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white">OC {orden.folio}</h3>
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              estadoConfig[orden.estado].color
            )}>
              {estadoConfig[orden.estado].label}
            </span>
          </div>
          <p className="text-sm text-white/50 flex items-center gap-1">
            <Truck className="h-3 w-3" />
            {orden.distribuidor.nombre}
          </p>
        </div>
      </div>

      {/* Stock Progress */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/50">Stock Disponible</span>
          <span className="font-semibold text-white">
            {orden.stockActual} / {orden.cantidad}
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'h-full rounded-full',
              isCritical
                ? 'bg-rose-500'
                : isLowStock
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${stockProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-white/40">
          <span>Vendidos: {orden.stockVendido}</span>
          <span className={pagoConfig[orden.estadoPago].color}>
            {pagoConfig[orden.estadoPago].label}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="text-center p-2 rounded-lg bg-white/5">
          <p className="text-xs text-white/40">P. Compra</p>
          <p className="text-sm font-semibold text-white">
            {formatCurrency(orden.precioCompra)}
          </p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/5">
          <p className="text-xs text-white/40">P. Venta</p>
          <p className="text-sm font-semibold text-white">
            {formatCurrency(orden.precioVenta)}
          </p>
        </div>
        <div className="text-center p-2 rounded-lg bg-white/5">
          <p className="text-xs text-white/40">Margen</p>
          <p className={cn(
            'text-sm font-semibold',
            orden.margenPorcentaje >= 20 ? 'text-emerald-400' : 'text-amber-400'
          )}>
            {orden.margenPorcentaje.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/10">
        <div>
          <p className="text-xs text-white/40">Ganancia Neta</p>
          <p className={cn(
            'text-lg font-bold',
            orden.gananciaNeta >= 0 ? 'text-emerald-400' : 'text-rose-400'
          )}>
            {orden.gananciaNeta >= 0 ? '+' : ''}{formatCurrency(orden.gananciaNeta)}
          </p>
        </div>
        {orden.rotacionDias && (
          <div className="text-right">
            <p className="text-xs text-white/40">Rotación</p>
            <p className="text-sm font-medium text-white">
              {orden.rotacionDias} días
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOVEMENT ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MovementItemProps {
  movement: InventoryMovement
  onClick?: () => void
}

const MovementItem = memo(function MovementItem({
  movement,
  onClick,
}: MovementItemProps) {
  const typeConfig = {
    entrada: {
      icon: <ArrowDown className="h-4 w-4" />,
      color: 'bg-emerald-500/20 text-emerald-400',
      label: 'Entrada',
    },
    salida: {
      icon: <ArrowUp className="h-4 w-4" />,
      color: 'bg-rose-500/20 text-rose-400',
      label: 'Salida',
    },
    ajuste: {
      icon: <Settings className="h-4 w-4" />,
      color: 'bg-amber-500/20 text-amber-400',
      label: 'Ajuste',
    },
    devolucion: {
      icon: <RotateCcw className="h-4 w-4" />,
      color: 'bg-blue-500/20 text-blue-400',
      label: 'Devolución',
    },
  }

  const config = typeConfig[movement.tipo]

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn('rounded-lg p-2', config.color)}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {movement.concepto}
        </p>
        <p className="text-xs text-white/50">
          {new Date(movement.fecha).toLocaleString('es-MX', {
            dateStyle: 'short',
            timeStyle: 'short',
          })}
        </p>
      </div>
      <div className="text-right">
        <p className={cn(
          'text-sm font-semibold',
          movement.tipo === 'entrada' || movement.tipo === 'devolucion'
            ? 'text-emerald-400'
            : 'text-rose-400'
        )}>
          {movement.tipo === 'entrada' || movement.tipo === 'devolucion' ? '+' : '-'}
          {movement.cantidad}
        </p>
        <p className="text-xs text-white/40">
          Stock: {movement.stockResultante}
        </p>
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ALERTS PANEL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AlertsPanelProps {
  alerts: StockAlert[]
  onAlertClick?: (alert: StockAlert) => void
}

const AlertsPanel = memo(function AlertsPanel({
  alerts,
  onAlertClick,
}: AlertsPanelProps) {
  if (alerts.length === 0) return null

  const severityConfig = {
    error: {
      icon: <AlertCircle className="h-4 w-4" />,
      color: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4" />,
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
    },
    info: {
      icon: <Activity className="h-4 w-4" />,
      color: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
    },
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        Alertas de Inventario ({alerts.length})
      </h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.map((alert, index) => {
          const config = severityConfig[alert.severity]
          return (
            <motion.div
              key={`${alert.ordenId}-${index}`}
              className={cn(
                'p-3 rounded-xl border cursor-pointer transition-colors',
                config.color,
                'hover:brightness-110'
              )}
              onClick={() => onAlertClick?.(alert)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-start gap-2">
                {config.icon}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.ordenFolio}</p>
                  <p className="text-xs opacity-80">{alert.message}</p>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface InventoryDashboardProps {
  className?: string
}

export function InventoryDashboard({ className }: InventoryDashboardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterEstado, setFilterEstado] = useState<string | null>(null)
  const [selectedOrden, setSelectedOrden] = useState<OrdenCompra | null>(null)
  const queryClient = useQueryClient()

  // Fetch product stats
  const { data: stats, isLoading: statsLoading } = useQuery<ProductStats>({
    queryKey: ['product-stats'],
    queryFn: async () => {
      const res = await fetch('/api/inventario/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  // Fetch orders
  const { data: ordenes, isLoading: ordenesLoading } = useQuery<OrdenCompra[]>({
    queryKey: ['ordenes-compra', filterEstado, searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filterEstado) params.set('estado', filterEstado)
      if (searchQuery) params.set('search', searchQuery)
      const res = await fetch(`/api/ordenes?${params}`)
      if (!res.ok) throw new Error('Failed to fetch orders')
      return res.json()
    },
    staleTime: 30000,
  })

  // Fetch stock alerts
  const { data: alerts } = useQuery<StockAlert[]>({
    queryKey: ['stock-alerts'],
    queryFn: async () => {
      const res = await fetch('/api/inventario/alertas')
      if (!res.ok) throw new Error('Failed to fetch alerts')
      return res.json()
    },
    staleTime: 60000,
  })

  // Fetch movements
  const { data: movements } = useQuery<InventoryMovement[]>({
    queryKey: ['inventory-movements'],
    queryFn: async () => {
      const res = await fetch('/api/inventario/movimientos?limit=10')
      if (!res.ok) throw new Error('Failed to fetch movements')
      return res.json()
    },
    staleTime: 30000,
  })

  const defaultStats: ProductStats = useMemo(() => ({
    stockTotal: 0,
    stockDisponible: 0,
    stockReservado: 0,
    stockMinimo: 0,
    stockMaximo: 0,
    valorInventario: 0,
    costoPromedio: 0,
    precioVentaPromedio: 0,
    rotacionDias: 0,
    margenPromedio: 0,
    unidadesVendidas30d: 0,
    ordenesActivas: 0,
  }), [])

  const currentStats = stats || defaultStats

  // Filter estados
  const estados = [
    { value: null, label: 'Todos' },
    { value: 'activa', label: 'Activas' },
    { value: 'parcial', label: 'Stock Bajo' },
    { value: 'agotada', label: 'Agotadas' },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-violet-400" />
            Inventario & Órdenes de Compra
          </h2>
          <p className="text-sm text-white/50">
            Control de stock y trazabilidad de productos
          </p>
        </div>
        <motion.button
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" />
          Nueva Orden
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StockStatsCard
          title="Stock Total"
          value={currentStats.stockTotal}
          subtitle="Unidades en inventario"
          icon={<Box className="h-5 w-5" />}
          colorScheme="violet"
        />
        <StockStatsCard
          title="Stock Disponible"
          value={currentStats.stockDisponible}
          subtitle="Listo para venta"
          icon={<Package className="h-5 w-5" />}
          colorScheme="emerald"
          trend={currentStats.stockDisponible > currentStats.stockTotal * 0.3 ? 'up' : 'down'}
        />
        <StockStatsCard
          title="Valor Inventario"
          value={formatCurrency(currentStats.valorInventario)}
          subtitle="Al costo"
          icon={<DollarSign className="h-5 w-5" />}
          colorScheme="gold"
        />
        <StockStatsCard
          title="Ventas (30d)"
          value={currentStats.unidadesVendidas30d}
          subtitle="Unidades vendidas"
          icon={<ShoppingCart className="h-5 w-5" />}
          colorScheme="blue"
        />
        <StockStatsCard
          title="Rotación"
          value={`${currentStats.rotacionDias} días`}
          subtitle="Promedio"
          icon={<RefreshCw className="h-5 w-5" />}
          colorScheme="orange"
          trend={currentStats.rotacionDias < 60 ? 'up' : 'down'}
        />
        <StockStatsCard
          title="Margen Promedio"
          value={`${currentStats.margenPromedio.toFixed(1)}%`}
          subtitle="Rentabilidad"
          icon={<Percent className="h-5 w-5" />}
          colorScheme={currentStats.margenPromedio >= 20 ? 'emerald' : 'rose'}
        />
      </div>

      {/* Alerts Section */}
      {alerts && alerts.length > 0 && (
        <AlertsPanel alerts={alerts} onAlertClick={(alert) => {
          // Navigate to order
        }} />
      )}

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por folio o distribuidor..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-violet-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-2 bg-white/5 rounded-xl p-1">
          {estados.map((estado) => (
            <button
              key={estado.label}
              onClick={() => setFilterEstado(estado.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                filterEstado === estado.value
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-white/50 hover:text-white/70'
              )}
            >
              {estado.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Orders Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold text-white">
            Órdenes de Compra
          </h3>

          {ordenesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
            </div>
          ) : ordenes && ordenes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {ordenes.map((orden) => (
                <OrdenCompraCard
                  key={orden.id}
                  orden={orden}
                  onClick={() => setSelectedOrden(orden)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-violet-500/10 p-4 mb-4">
                <Package className="h-8 w-8 text-violet-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Sin órdenes de compra
              </h3>
              <p className="text-sm text-white/50">
                Crea tu primera orden para empezar a gestionar inventario
              </p>
            </div>
          )}
        </div>

        {/* Movements Sidebar */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-violet-400" />
            Movimientos Recientes
          </h3>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3 max-h-[500px] overflow-y-auto">
            {movements && movements.length > 0 ? (
              movements.map((movement) => (
                <MovementItem key={movement.id} movement={movement} />
              ))
            ) : (
              <p className="text-center text-white/50 py-8">
                Sin movimientos recientes
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryDashboard
export { StockStatsCard, OrdenCompraCard, MovementItem, AlertsPanel }
