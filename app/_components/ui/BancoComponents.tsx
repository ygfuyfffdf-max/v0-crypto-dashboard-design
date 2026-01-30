'use client'

import { memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/app/_lib/utils'
import { Money } from './Money'
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CreditCard,
  PiggyBank,
  Building2,
  ArrowRightLeft,
  Receipt,
  DollarSign,
  Calendar,
  Clock,
  ChevronRight,
  Sparkles,
  Activity,
} from 'lucide-react'

// ============================================
// BANCO CARD PREMIUM
// ============================================

interface BancoCardPremiumProps {
  banco: {
    id: string
    nombre: string
    saldo: number
    color: string
    icono?: string
    ingresosMes?: number
    egresosMes?: number
    movimientosHoy?: number
    ultimoMovimiento?: {
      tipo: 'ingreso' | 'egreso'
      monto: number
      concepto: string
      fecha: string
    }
  }
  onClick?: () => void
  selected?: boolean
  className?: string
}

export const BancoCardPremium = memo(function BancoCardPremium({
  banco,
  onClick,
  selected = false,
  className,
}: BancoCardPremiumProps) {
  const flujoNeto = (banco.ingresosMes || 0) - (banco.egresosMes || 0)
  const tendencia = flujoNeto >= 0 ? 'positivo' : 'negativo'

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'relative p-5 rounded-2xl cursor-pointer overflow-hidden',
        'bg-gradient-to-br from-gray-900/90 to-gray-950/90',
        'border-2 transition-all duration-300',
        selected
          ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/20'
          : 'border-white/10 hover:border-white/20',
        className
      )}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 opacity-20 blur-3xl"
        style={{ background: `radial-gradient(circle at 30% 30%, ${banco.color}, transparent 70%)` }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${banco.color}20` }}
          >
            <Wallet className="w-6 h-6" style={{ color: banco.color }} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{banco.nombre}</h3>
            <p className="text-xs text-gray-500">
              {banco.movimientosHoy || 0} movimientos hoy
            </p>
          </div>
        </div>

        {/* Tendencia badge */}
        <div className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
          tendencia === 'positivo'
            ? 'bg-emerald-500/20 text-emerald-400'
            : 'bg-red-500/20 text-red-400'
        )}>
          {tendencia === 'positivo' ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{Math.abs(flujoNeto / (banco.ingresosMes || 1) * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Saldo principal */}
      <div className="relative mb-4">
        <p className="text-xs text-gray-500 mb-1">Saldo actual</p>
        <Money amount={banco.saldo} size="xl" className="text-white" />
      </div>

      {/* Flujo del mes */}
      <div className="relative grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-gray-400">Ingresos</span>
          </div>
          <Money amount={banco.ingresosMes || 0} size="sm" className="text-emerald-400" />
        </div>
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-2 mb-1">
            <ArrowDownRight className="w-4 h-4 text-red-400" />
            <span className="text-xs text-gray-400">Egresos</span>
          </div>
          <Money amount={banco.egresosMes || 0} size="sm" className="text-red-400" />
        </div>
      </div>

      {/* Último movimiento */}
      {banco.ultimoMovimiento && (
        <div className="relative p-3 rounded-xl bg-white/5 border border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center',
                banco.ultimoMovimiento.tipo === 'ingreso'
                  ? 'bg-emerald-500/20'
                  : 'bg-red-500/20'
              )}>
                {banco.ultimoMovimiento.tipo === 'ingreso' ? (
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-white truncate max-w-[120px]">
                  {banco.ultimoMovimiento.concepto}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(banco.ultimoMovimiento.fecha).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <Money
              amount={banco.ultimoMovimiento.monto}
              size="sm"
              colorize
              className={banco.ultimoMovimiento.tipo === 'ingreso' ? '' : ''}
            />
          </div>
        </div>
      )}
    </motion.div>
  )
})

// ============================================
// RESUMEN FINANCIERO CARD
// ============================================

interface ResumenFinancieroProps {
  titulo: string
  monto: number
  variacion?: number
  periodo?: string
  icono: React.ReactNode
  tipo: 'ingreso' | 'egreso' | 'neutro'
  detalles?: Array<{ label: string; valor: number }>
  onClick?: () => void
  className?: string
}

export const ResumenFinancieroCard = memo(function ResumenFinancieroCard({
  titulo,
  monto,
  variacion,
  periodo = 'Este mes',
  icono,
  tipo,
  detalles,
  onClick,
  className,
}: ResumenFinancieroProps) {
  const colorConfig = {
    ingreso: {
      bg: 'from-emerald-500/10 to-teal-500/5',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      icon: 'bg-emerald-500/20 text-emerald-400',
      text: 'text-emerald-400',
    },
    egreso: {
      bg: 'from-red-500/10 to-orange-500/5',
      border: 'border-red-500/20 hover:border-red-500/40',
      icon: 'bg-red-500/20 text-red-400',
      text: 'text-red-400',
    },
    neutro: {
      bg: 'from-blue-500/10 to-violet-500/5',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      icon: 'bg-blue-500/20 text-blue-400',
      text: 'text-blue-400',
    },
  }

  const config = colorConfig[tipo]

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'p-5 rounded-2xl cursor-pointer',
        `bg-gradient-to-br ${config.bg}`,
        `border ${config.border}`,
        'transition-all duration-300',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', config.icon)}>
          {icono}
        </div>
        {variacion !== undefined && (
          <div className={cn(
            'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
            variacion >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          )}>
            {variacion >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(variacion).toFixed(1)}%
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="mb-3">
        <p className="text-sm text-gray-400 mb-1">{titulo}</p>
        <Money amount={monto} size="xl" className="text-white" />
        <p className="text-xs text-gray-500 mt-1">{periodo}</p>
      </div>

      {/* Detalles */}
      {detalles && detalles.length > 0 && (
        <div className="pt-3 border-t border-white/5 space-y-2">
          {detalles.map((detalle, i) => (
            <div key={i} className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{detalle.label}</span>
              <Money amount={detalle.valor} size="xs" className="text-gray-300" />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
})

// ============================================
// TIPO MOVIMIENTO CARD (Abonos, Gastos, etc)
// ============================================

interface TipoMovimientoCardProps {
  tipo: 'abono' | 'gasto' | 'pago_distribuidor' | 'transferencia' | 'venta' | 'compra'
  cantidad: number
  monto: number
  tendencia?: 'up' | 'down' | 'neutral'
  onClick?: () => void
  className?: string
}

const tipoMovimientoConfig = {
  abono: {
    label: 'Abonos Recibidos',
    icon: CreditCard,
    color: 'emerald',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  gasto: {
    label: 'Gastos Operativos',
    icon: Receipt,
    color: 'red',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
  },
  pago_distribuidor: {
    label: 'Pagos a Distribuidores',
    icon: Building2,
    color: 'amber',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    iconBg: 'bg-amber-500/20',
    iconColor: 'text-amber-400',
  },
  transferencia: {
    label: 'Transferencias',
    icon: ArrowRightLeft,
    color: 'blue',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  venta: {
    label: 'Ventas',
    icon: DollarSign,
    color: 'teal',
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/20',
    iconBg: 'bg-teal-500/20',
    iconColor: 'text-teal-400',
  },
  compra: {
    label: 'Órdenes de Compra',
    icon: PiggyBank,
    color: 'violet',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
  },
}

export const TipoMovimientoCard = memo(function TipoMovimientoCard({
  tipo,
  cantidad,
  monto,
  tendencia = 'neutral',
  onClick,
  className,
}: TipoMovimientoCardProps) {
  const config = tipoMovimientoConfig[tipo]
  const Icon = config.icon

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl cursor-pointer',
        config.bg,
        `border ${config.border}`,
        'hover:shadow-lg transition-all duration-200',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.iconBg)}>
          <Icon className={cn('w-5 h-5', config.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-400 truncate">{config.label}</p>
          <div className="flex items-baseline gap-2">
            <Money amount={monto} size="md" className="text-white" />
            <span className="text-xs text-gray-500">({cantidad})</span>
          </div>
        </div>
        {tendencia !== 'neutral' && (
          <div className={cn(
            'p-1.5 rounded-lg',
            tendencia === 'up' ? 'bg-emerald-500/20' : 'bg-red-500/20'
          )}>
            {tendencia === 'up' ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
})

// ============================================
// FLUJO DE CAJA VISUAL
// ============================================

interface FlujoCajaProps {
  ingresos: number
  egresos: number
  periodo?: string
  className?: string
}

export const FlujoCajaVisual = memo(function FlujoCajaVisual({
  ingresos,
  egresos,
  periodo = 'Este mes',
  className,
}: FlujoCajaProps) {
  const total = ingresos + egresos
  const porcentajeIngresos = total > 0 ? (ingresos / total) * 100 : 50
  const flujoNeto = ingresos - egresos

  return (
    <div className={cn('p-5 rounded-2xl bg-gray-900/50 border border-white/10', className)}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-white">Flujo de Caja</h3>
          <p className="text-xs text-gray-500">{periodo}</p>
        </div>
        <div className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
          flujoNeto >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        )}>
          {flujoNeto >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <Money amount={flujoNeto} size="sm" />
        </div>
      </div>

      {/* Barra visual */}
      <div className="relative h-4 rounded-full bg-gray-800 overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${porcentajeIngresos}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
        />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${100 - porcentajeIngresos}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute right-0 top-0 h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
        />
      </div>

      {/* Leyenda */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <div>
            <p className="text-xs text-gray-500">Ingresos</p>
            <Money amount={ingresos} size="sm" className="text-emerald-400" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div>
            <p className="text-xs text-gray-500">Egresos</p>
            <Money amount={egresos} size="sm" className="text-red-400" />
          </div>
        </div>
      </div>
    </div>
  )
})

// ============================================
// ACTIVIDAD RECIENTE
// ============================================

interface ActividadRecienteProps {
  actividades: Array<{
    id: string
    tipo: 'ingreso' | 'egreso' | 'transferencia' | 'abono' | 'gasto'
    concepto: string
    monto: number
    banco: string
    fecha: string
  }>
  maxItems?: number
  onVerTodas?: () => void
  className?: string
}

const actividadIconos = {
  ingreso: { icon: ArrowUpRight, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
  egreso: { icon: ArrowDownRight, color: 'text-red-400', bg: 'bg-red-500/20' },
  transferencia: { icon: ArrowRightLeft, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  abono: { icon: CreditCard, color: 'text-teal-400', bg: 'bg-teal-500/20' },
  gasto: { icon: Receipt, color: 'text-orange-400', bg: 'bg-orange-500/20' },
}

export const ActividadReciente = memo(function ActividadReciente({
  actividades,
  maxItems = 5,
  onVerTodas,
  className,
}: ActividadRecienteProps) {
  const items = actividades.slice(0, maxItems)

  return (
    <div className={cn('p-5 rounded-2xl bg-gray-900/50 border border-white/10', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-violet-400" />
          <h3 className="font-semibold text-white">Actividad Reciente</h3>
        </div>
        {onVerTodas && (
          <button
            onClick={onVerTodas}
            className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
          >
            Ver todas <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {items.map((actividad, index) => {
            const config = actividadIconos[actividad.tipo]
            const Icon = config.icon
            const esIngreso = actividad.tipo === 'ingreso' || actividad.tipo === 'abono'

            return (
              <motion.div
                key={actividad.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', config.bg)}>
                  <Icon className={cn('w-5 h-5', config.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">{actividad.concepto}</p>
                  <p className="text-xs text-gray-500">
                    {actividad.banco} • {new Date(actividad.fecha).toLocaleString('es-MX', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <Money
                  amount={esIngreso ? actividad.monto : -actividad.monto}
                  size="sm"
                  colorize
                />
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
})

// ============================================
// MINI STATS CARD
// ============================================

interface MiniStatsProps {
  label: string
  valor: number | string
  icono: React.ReactNode
  color?: 'emerald' | 'blue' | 'amber' | 'red' | 'violet'
  className?: string
}

const miniStatsColors = {
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  red: 'bg-red-500/10 border-red-500/20 text-red-400',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
}

export const MiniStatsCard = memo(function MiniStatsCard({
  label,
  valor,
  icono,
  color = 'blue',
  className,
}: MiniStatsProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl border',
      miniStatsColors[color],
      className
    )}>
      <div className="flex-shrink-0">{icono}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-white">
          {typeof valor === 'number' ? <Money amount={valor} size="md" /> : valor}
        </p>
      </div>
    </div>
  )
})
