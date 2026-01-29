'use client'

import { memo, useMemo } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/app/_lib/utils'
import { Money } from './Money'
import {
  Package,
  Truck,
  User,
  Building2,
  Calendar,
  Hash,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
} from 'lucide-react'

// ============================================
// TRAZABILIDAD BADGE
// ============================================

interface TrazabilidadBadgeProps {
  tipo: 'oc' | 'venta' | 'abono' | 'gasto' | 'transferencia'
  id: string
  className?: string
}

const tipoConfig = {
  oc: { label: 'OC', color: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  venta: { label: 'VTA', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  abono: { label: 'ABN', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  gasto: { label: 'GST', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  transferencia: { label: 'TRF', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
}

export const TrazabilidadBadge = memo(function TrazabilidadBadge({
  tipo,
  id,
  className,
}: TrazabilidadBadgeProps) {
  const config = tipoConfig[tipo]
  const shortId = id.slice(-6).toUpperCase()

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono border',
        config.color,
        className
      )}
    >
      <Hash className="w-3 h-3" />
      {config.label}-{shortId}
    </span>
  )
})

// ============================================
// ESTADO BADGE
// ============================================

interface EstadoBadgeProps {
  estado: 'pendiente' | 'parcial' | 'completo' | 'pagado' | 'cancelado' | 'entregado'
  size?: 'sm' | 'md'
  className?: string
}

const estadoConfig = {
  pendiente: { icon: Clock, color: 'bg-yellow-500/20 text-yellow-400', label: 'Pendiente' },
  parcial: { icon: AlertCircle, color: 'bg-orange-500/20 text-orange-400', label: 'Parcial' },
  completo: { icon: CheckCircle2, color: 'bg-emerald-500/20 text-emerald-400', label: 'Completo' },
  pagado: { icon: CheckCircle2, color: 'bg-emerald-500/20 text-emerald-400', label: 'Pagado' },
  cancelado: { icon: AlertCircle, color: 'bg-red-500/20 text-red-400', label: 'Cancelado' },
  entregado: { icon: Package, color: 'bg-blue-500/20 text-blue-400', label: 'Entregado' },
}

export const EstadoBadge = memo(function EstadoBadge({
  estado,
  size = 'md',
  className,
}: EstadoBadgeProps) {
  const config = estadoConfig[estado]
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        config.color,
        className
      )}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
      {config.label}
    </span>
  )
})

// ============================================
// ORDEN COMPRA CARD OPTIMIZADA
// ============================================

interface OrdenCompraCardProps {
  orden: {
    id: string
    producto: string
    cantidad: number
    costoTotal: number
    distribuidor?: string
    fecha: string
    estadoPago: 'pendiente' | 'parcial' | 'completo'
    saldoPendiente?: number
    pagoInicial?: number
  }
  onClick?: () => void
  className?: string
}

export const OrdenCompraCard = memo(function OrdenCompraCard({
  orden,
  onClick,
  className,
}: OrdenCompraCardProps) {
  const porcentajePagado = orden.costoTotal > 0
    ? ((orden.costoTotal - (orden.saldoPendiente || 0)) / orden.costoTotal) * 100
    : 100

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl cursor-pointer',
        'bg-gradient-to-br from-violet-500/10 to-purple-500/5',
        'border border-violet-500/20 hover:border-violet-500/40',
        'transition-colors duration-200',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <TrazabilidadBadge tipo="oc" id={orden.id} />
          <h3 className="mt-2 font-medium text-white">{orden.producto}</h3>
        </div>
        <EstadoBadge estado={orden.estadoPago} size="sm" />
      </div>

      {/* Datos principales */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Package className="w-4 h-4" />
          <span>{orden.cantidad} uds</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date(orden.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
        </div>
        {orden.distribuidor && (
          <div className="col-span-2 flex items-center gap-2 text-sm text-gray-400">
            <Truck className="w-4 h-4" />
            <span>{orden.distribuidor}</span>
          </div>
        )}
      </div>

      {/* Financieros */}
      <div className="pt-3 border-t border-white/5 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Total</span>
          <Money amount={orden.costoTotal} size="sm" className="text-white" />
        </div>
        {orden.saldoPendiente !== undefined && orden.saldoPendiente > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Pendiente</span>
            <Money amount={orden.saldoPendiente} size="sm" className="text-amber-400" />
          </div>
        )}

        {/* Progress bar */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${porcentajePagado}%` }}
            transition={{ duration: 0.5 }}
            className={cn(
              'h-full rounded-full',
              porcentajePagado >= 100 ? 'bg-emerald-500' : 'bg-violet-500'
            )}
          />
        </div>
      </div>
    </motion.div>
  )
})

// ============================================
// VENTA CARD OPTIMIZADA
// ============================================

interface VentaCardProps {
  venta: {
    id: string
    cliente: string
    producto?: string
    cantidad: number
    precioTotal: number
    utilidadNeta?: number
    fecha: string
    estadoPago: 'pendiente' | 'parcial' | 'completo'
    montoPagado?: number
    montoRestante?: number
    ocRelacionada?: string
  }
  onClick?: () => void
  className?: string
}

export const VentaCard = memo(function VentaCard({
  venta,
  onClick,
  className,
}: VentaCardProps) {
  const margen = venta.utilidadNeta && venta.precioTotal > 0
    ? (venta.utilidadNeta / venta.precioTotal) * 100
    : 0

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl cursor-pointer',
        'bg-gradient-to-br from-emerald-500/10 to-teal-500/5',
        'border border-emerald-500/20 hover:border-emerald-500/40',
        'transition-colors duration-200',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <TrazabilidadBadge tipo="venta" id={venta.id} />
            {venta.ocRelacionada && (
              <>
                <ArrowRight className="w-3 h-3 text-gray-500" />
                <TrazabilidadBadge tipo="oc" id={venta.ocRelacionada} />
              </>
            )}
          </div>
          <h3 className="mt-2 font-medium text-white flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400" />
            {venta.cliente}
          </h3>
        </div>
        <EstadoBadge estado={venta.estadoPago} size="sm" />
      </div>

      {/* Datos principales */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Package className="w-4 h-4" />
          <span>{venta.cantidad} uds</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{new Date(venta.fecha).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
        </div>
      </div>

      {/* Financieros */}
      <div className="pt-3 border-t border-white/5 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Total Venta</span>
          <Money amount={venta.precioTotal} size="sm" className="text-white" />
        </div>

        {venta.utilidadNeta !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Utilidad</span>
            <div className="flex items-center gap-2">
              <Money amount={venta.utilidadNeta} size="sm" colorize />
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded',
                margen > 20 ? 'bg-emerald-500/20 text-emerald-400' :
                margen > 10 ? 'bg-amber-500/20 text-amber-400' :
                'bg-red-500/20 text-red-400'
              )}>
                {margen.toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        {venta.montoRestante !== undefined && venta.montoRestante > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Por cobrar</span>
            <Money amount={venta.montoRestante} size="sm" className="text-amber-400" />
          </div>
        )}
      </div>
    </motion.div>
  )
})

// ============================================
// MOVIMIENTO ROW OPTIMIZADA
// ============================================

interface MovimientoRowProps {
  movimiento: {
    id: string
    tipo: 'ingreso' | 'egreso' | 'transferencia'
    concepto: string
    monto: number
    bancoId: string
    bancoNombre?: string
    fecha: string
    referencia?: string
  }
  onClick?: () => void
  className?: string
}

export const MovimientoRow = memo(function MovimientoRow({
  movimiento,
  onClick,
  className,
}: MovimientoRowProps) {
  const isIngreso = movimiento.tipo === 'ingreso'
  const isTransferencia = movimiento.tipo === 'transferencia'

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-4 p-3 rounded-lg cursor-pointer',
        'bg-white/[0.02] hover:bg-white/[0.05]',
        'border border-transparent hover:border-white/10',
        'transition-all duration-150',
        className
      )}
    >
      {/* Icono tipo */}
      <div className={cn(
        'w-10 h-10 rounded-full flex items-center justify-center',
        isIngreso ? 'bg-emerald-500/20' :
        isTransferencia ? 'bg-amber-500/20' :
        'bg-red-500/20'
      )}>
        {isIngreso ? <TrendingUp className="w-5 h-5 text-emerald-400" /> :
         isTransferencia ? <ArrowRight className="w-5 h-5 text-amber-400" /> :
         <TrendingDown className="w-5 h-5 text-red-400" />}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{movimiento.concepto}</p>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Wallet className="w-3 h-3" />
          <span>{movimiento.bancoNombre || movimiento.bancoId}</span>
          <span>•</span>
          <span>{new Date(movimiento.fecha).toLocaleDateString('es-MX')}</span>
        </div>
      </div>

      {/* Monto */}
      <div className="text-right">
        <Money
          amount={isIngreso ? movimiento.monto : -movimiento.monto}
          size="sm"
          colorize
        />
        {movimiento.referencia && (
          <p className="text-xs text-gray-500 font-mono">{movimiento.referencia}</p>
        )}
      </div>
    </div>
  )
})

// ============================================
// DISTRIBUIDOR CARD OPTIMIZADA
// ============================================

interface DistribuidorCardProps {
  distribuidor: {
    id: string
    nombre: string
    empresa?: string
    telefono?: string
    saldoPendiente: number
    totalCompras?: number
    ordenesActivas?: number
  }
  onClick?: () => void
  className?: string
}

export const DistribuidorCard = memo(function DistribuidorCard({
  distribuidor,
  onClick,
  className,
}: DistribuidorCardProps) {
  const tieneSaldo = distribuidor.saldoPendiente > 0

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl cursor-pointer',
        'bg-gradient-to-br from-blue-500/10 to-cyan-500/5',
        'border',
        tieneSaldo ? 'border-amber-500/30' : 'border-blue-500/20',
        'hover:border-blue-500/40',
        'transition-colors duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-white flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-400" />
            {distribuidor.nombre}
          </h3>
          {distribuidor.empresa && (
            <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
              <Building2 className="w-3 h-3" />
              {distribuidor.empresa}
            </p>
          )}
        </div>
        {tieneSaldo && (
          <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">
            Deuda activa
          </span>
        )}
      </div>

      <div className="pt-3 border-t border-white/5 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Saldo pendiente</span>
          <Money
            amount={distribuidor.saldoPendiente}
            size="sm"
            className={tieneSaldo ? 'text-amber-400' : 'text-emerald-400'}
          />
        </div>
        {distribuidor.totalCompras !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Total compras</span>
            <Money amount={distribuidor.totalCompras} size="sm" className="text-gray-300" />
          </div>
        )}
        {distribuidor.ordenesActivas !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Órdenes activas</span>
            <span className="text-sm text-white">{distribuidor.ordenesActivas}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
})

// ============================================
// CLIENTE CARD OPTIMIZADA
// ============================================

interface ClienteCardProps {
  cliente: {
    id: string
    nombre: string
    telefono?: string
    email?: string
    saldoPendiente: number
    totalCompras?: number
    ventasActivas?: number
  }
  onClick?: () => void
  className?: string
}

export const ClienteCard = memo(function ClienteCard({
  cliente,
  onClick,
  className,
}: ClienteCardProps) {
  const tieneSaldo = cliente.saldoPendiente > 0

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl cursor-pointer',
        'bg-gradient-to-br from-cyan-500/10 to-teal-500/5',
        'border',
        tieneSaldo ? 'border-amber-500/30' : 'border-cyan-500/20',
        'hover:border-cyan-500/40',
        'transition-colors duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            {cliente.nombre}
          </h3>
          {cliente.telefono && (
            <p className="text-sm text-gray-400 mt-1">{cliente.telefono}</p>
          )}
        </div>
        {tieneSaldo && (
          <span className="px-2 py-0.5 rounded text-xs bg-amber-500/20 text-amber-400">
            Por cobrar
          </span>
        )}
      </div>

      <div className="pt-3 border-t border-white/5 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Por cobrar</span>
          <Money
            amount={cliente.saldoPendiente}
            size="sm"
            className={tieneSaldo ? 'text-amber-400' : 'text-emerald-400'}
          />
        </div>
        {cliente.totalCompras !== undefined && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Total compras</span>
            <Money amount={cliente.totalCompras} size="sm" className="text-gray-300" />
          </div>
        )}
      </div>
    </motion.div>
  )
})
