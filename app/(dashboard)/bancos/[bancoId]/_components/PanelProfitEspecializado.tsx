'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💱 CHRONOS INFINITY 2030 — PANEL PROFIT ESPECIALIZADO
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Panel ultra-premium para el banco PROFIT con funcionalidades especiales:
 * - Capital actual MXN/USD
 * - Gestión de tipo de cambio
 * - Operaciones de compra/venta USD
 * - Historial de operaciones de cambio
 * - Estadísticas de rentabilidad
 * - Proyecciones de ganancia
 * - Transferencias a otros bancos
 *
 * Paleta CHRONOS: #8B00FF (Violeta) / #FFD700 (Oro) / #FF1493 (Rosa)
 *
 * @version 2.0.0 — Infinity 2030
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { GastoModal } from '@/app/_components/modals/GastoModal'
import { IngresoModal } from '@/app/_components/modals/IngresoModal'
import { TransferenciaModal } from '@/app/_components/modals/TransferenciaModal'
import { BANCOS_CONFIG } from '@/app/_lib/constants/bancos'
import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { useChronosStore } from '@/app/lib/store'
import type { Banco, Movimiento } from '@/database/schema'
import { AnimatePresence, motion } from 'motion/react'
import {
  Activity,
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  BarChart3,
  Calculator,
  DollarSign,
  History,
  Minus,
  PiggyBank,
  Plus,
  RefreshCw,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

type TabActiva = 'overview' | 'operaciones' | 'historial' | 'estadisticas' | 'proyecciones'

interface PanelProfitEspecializadoProps {
  banco: Banco
  movimientos: Movimiento[]
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES DE ESTILO
// ═══════════════════════════════════════════════════════════════════════════════

const COLORS = {
  profit: '#8B00FF', // Violeta imperial
  gold: '#FFD700',
  pink: '#FF1493',
  positive: '#10B981',
  negative: '#EF4444',
  usd: '#22C55E',
}

const glassStyle = {
  background: 'rgba(139, 0, 255, 0.05)',
  backdropFilter: 'blur(40px)',
  border: '1px solid rgba(139, 0, 255, 0.2)',
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTES
// ═══════════════════════════════════════════════════════════════════════════════

function KPICard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  subtitle,
}: {
  title: string
  value: string | number
  icon: typeof TrendingUp
  color: string
  trend?: { value: number; positive: boolean }
  subtitle?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-5"
      style={{
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        border: `1px solid ${color}30`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="mb-1 text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ background: `${color}20` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
      {trend && (
        <div
          className={cn(
            'mt-3 flex items-center gap-1 text-sm',
            trend.positive ? 'text-emerald-400' : 'text-red-400',
          )}
        >
          {trend.positive ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
          <span>{Math.abs(trend.value)}%</span>
          <span className="text-gray-500">vs mes anterior</span>
        </div>
      )}

      {/* Glow effect */}
      <div
        className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-20 blur-3xl"
        style={{ background: color }}
      />
    </motion.div>
  )
}

function QuickActionButton({
  icon: Icon,
  label,
  color,
  onClick,
}: {
  icon: typeof Plus
  label: string
  color: string
  onClick: () => void
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex flex-col items-center gap-2 rounded-xl p-4 transition-all"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}20`,
      }}
    >
      <Icon className="h-6 w-6" style={{ color }} />
      <span className="text-xs text-white/70">{label}</span>
    </motion.button>
  )
}

function MovimientoRow({ movimiento }: { movimiento: Movimiento }) {
  const isIngreso =
    movimiento.tipo === 'ingreso' ||
    movimiento.tipo === 'transferencia_entrada' ||
    movimiento.tipo === 'abono'

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/8"
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            isIngreso ? 'bg-emerald-500/20' : 'bg-red-500/20',
          )}
        >
          {isIngreso ? (
            <ArrowDownRight className="h-5 w-5 text-emerald-400" />
          ) : (
            <ArrowUpRight className="h-5 w-5 text-red-400" />
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{movimiento.concepto}</p>
          <p className="text-xs text-gray-500">
            {new Date(movimiento.fecha).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
      <p className={cn('text-lg font-bold', isIngreso ? 'text-emerald-400' : 'text-red-400')}>
        {isIngreso ? '+' : '-'}
        {formatCurrency(Math.abs(movimiento.monto))}
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function PanelProfitEspecializado({
  banco,
  movimientos: initialMovimientos,
  className,
}: PanelProfitEspecializadoProps) {
  const [tabActiva, setTabActiva] = useState<TabActiva>('overview')

  // Modales
  const [isIngresoModalOpen, setIsIngresoModalOpen] = useState(false)
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false)
  const [isTransferenciaModalOpen, setIsTransferenciaModalOpen] = useState(false)

  // Store
  const storeBancos = useChronosStore((state) => state.bancos)

  // Datos reactivos
  const profit = storeBancos.profit || banco

  // Movimientos de Profit ordenados
  const movimientosProfit = useMemo(
    () =>
      [...initialMovimientos]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 50),
    [initialMovimientos],
  )

  // Estadísticas
  const estadisticas = useMemo(() => {
    const ingresos = movimientosProfit.filter(
      (m) => m.tipo === 'ingreso' || m.tipo === 'transferencia_entrada' || m.tipo === 'abono',
    )
    const gastos = movimientosProfit.filter(
      (m) => m.tipo === 'gasto' || m.tipo === 'transferencia_salida' || m.tipo === 'pago',
    )

    const totalIngresos = ingresos.reduce((sum, m) => sum + Math.abs(m.monto), 0)
    const totalGastos = gastos.reduce((sum, m) => sum + Math.abs(m.monto), 0)

    // Calcular tendencia (comparar última semana vs anterior)
    const ahora = new Date()
    const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)
    const hace14Dias = new Date(ahora.getTime() - 14 * 24 * 60 * 60 * 1000)

    const ingresosUltimaSemana = ingresos
      .filter((m) => new Date(m.fecha) >= hace7Dias)
      .reduce((sum, m) => sum + Math.abs(m.monto), 0)

    const ingresosSemanaAnterior = ingresos
      .filter((m) => new Date(m.fecha) >= hace14Dias && new Date(m.fecha) < hace7Dias)
      .reduce((sum, m) => sum + Math.abs(m.monto), 0)

    const tendencia =
      ingresosSemanaAnterior > 0
        ? ((ingresosUltimaSemana - ingresosSemanaAnterior) / ingresosSemanaAnterior) * 100
        : 0

    return {
      totalIngresos,
      totalGastos,
      balanceNeto: totalIngresos - totalGastos,
      numeroOperaciones: movimientosProfit.length,
      tendencia,
      promedioIngreso: ingresos.length > 0 ? totalIngresos / ingresos.length : 0,
      promedioGasto: gastos.length > 0 ? totalGastos / gastos.length : 0,
    }
  }, [movimientosProfit])

  // Tipo de cambio simulado (en producción vendría de API)
  const tipoCambioActual = useMemo(
    () => ({
      compra: 17.25,
      venta: 17.85,
      spread: 0.6,
    }),
    [],
  )

  const config = BANCOS_CONFIG.profit

  const tabs = [
    { id: 'overview' as const, label: 'Vista General', icon: BarChart3 },
    { id: 'operaciones' as const, label: 'Operaciones', icon: Activity },
    { id: 'historial' as const, label: 'Historial', icon: History },
    { id: 'estadisticas' as const, label: 'Estadísticas', icon: TrendingUp },
    { id: 'proyecciones' as const, label: 'Proyecciones', icon: Sparkles },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header con Capital */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl"
        style={glassStyle}
      >
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                style={{
                  background: `linear-gradient(135deg, ${COLORS.profit}30, ${COLORS.gold}20)`,
                  boxShadow: `0 0 40px ${COLORS.profit}40`,
                }}
              >
                📈
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-3xl font-bold text-transparent">
                  {config?.nombre || 'Profit'}
                </h1>
                <p className="text-gray-400">
                  {config?.personality?.descripcion || 'El Visionario — Ganancias para reinversión'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400">Capital Actual</p>
              <p className="text-4xl font-bold" style={{ color: COLORS.profit }}>
                {formatCurrency(profit.capitalActual)}
              </p>
              <p className="text-sm text-gray-500">
                {profit.historicoIngresos > 0 && (
                  <span className="text-emerald-400">
                    +{formatCurrency(profit.historicoIngresos)} histórico
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <KPICard
              title="Capital Disponible"
              value={profit.capitalActual}
              icon={Wallet}
              color={COLORS.profit}
              trend={{ value: estadisticas.tendencia, positive: estadisticas.tendencia > 0 }}
            />
            <KPICard
              title="Ingresos Históricos"
              value={profit.historicoIngresos}
              icon={TrendingUp}
              color={COLORS.positive}
              subtitle={`${estadisticas.numeroOperaciones} operaciones`}
            />
            <KPICard
              title="Gastos Históricos"
              value={profit.historicoGastos}
              icon={TrendingDown}
              color={COLORS.negative}
            />
            <KPICard
              title="Balance Neto"
              value={profit.historicoIngresos - profit.historicoGastos}
              icon={Calculator}
              color={
                profit.historicoIngresos >= profit.historicoGastos
                  ? COLORS.positive
                  : COLORS.negative
              }
            />
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="border-t border-white/5 px-6 py-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <QuickActionButton
              icon={Plus}
              label="Ingreso"
              color={COLORS.positive}
              onClick={() => setIsIngresoModalOpen(true)}
            />
            <QuickActionButton
              icon={Minus}
              label="Gasto"
              color={COLORS.negative}
              onClick={() => setIsGastoModalOpen(true)}
            />
            <QuickActionButton
              icon={Send}
              label="Transferir"
              color={COLORS.profit}
              onClick={() => setIsTransferenciaModalOpen(true)}
            />
            <QuickActionButton
              icon={ArrowDownRight}
              label="Comprar USD"
              color={COLORS.usd}
              onClick={() => {
                toast.info('Próximamente', { description: 'Casa de cambio en desarrollo' })
              }}
            />
            <QuickActionButton
              icon={ArrowUpRight}
              label="Vender USD"
              color={COLORS.gold}
              onClick={() => {
                toast.info('Próximamente', { description: 'Casa de cambio en desarrollo' })
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-sm">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setTabActiva(tab.id)}
            className={cn(
              'relative flex flex-1 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
              tabActiva === tab.id
                ? 'text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white',
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {tabActiva === tab.id && (
              <motion.div
                layoutId="profitActiveTab"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600"
                transition={{ type: 'spring', duration: 0.5 }}
              />
            )}
            <tab.icon className="relative z-10 h-4 w-4" />
            <span className="relative z-10 hidden md:inline">{tab.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Contenido de Tabs */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tabActiva}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tabActiva === 'overview' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Tipo de Cambio */}
              <motion.div className="rounded-2xl p-6" style={glassStyle}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                    <DollarSign className="h-5 w-5 text-emerald-400" />
                    Tipo de Cambio USD/MXN
                  </h3>
                  <button className="rounded-lg bg-white/5 p-2 transition-colors hover:bg-white/10">
                    <RefreshCw className="h-4 w-4 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-gray-400">Compra</p>
                    <p className="text-2xl font-bold text-white">
                      ${tipoCambioActual.compra.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-gray-400">Venta</p>
                    <p className="text-2xl font-bold text-white">
                      ${tipoCambioActual.venta.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-xs text-gray-400">Spread</p>
                    <p className="text-2xl font-bold" style={{ color: COLORS.gold }}>
                      ${tipoCambioActual.spread.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-violet-500/20 bg-violet-500/10 p-3">
                  <p className="text-sm text-violet-300">
                    💡 Ganancia por spread:{' '}
                    <strong>${tipoCambioActual.spread.toFixed(2)} MXN</strong> por cada USD operado
                  </p>
                </div>
              </motion.div>

              {/* Últimos Movimientos */}
              <motion.div className="rounded-2xl p-6" style={glassStyle}>
                <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
                  <History className="h-5 w-5 text-violet-400" />
                  Últimos Movimientos
                </h3>

                <div className="max-h-[300px] space-y-2 overflow-y-auto pr-2">
                  {movimientosProfit.length === 0 ? (
                    <div className="py-8 text-center">
                      <PiggyBank className="mx-auto mb-2 h-12 w-12 text-gray-600" />
                      <p className="text-gray-400">No hay movimientos aún</p>
                      <p className="text-sm text-gray-500">Los ingresos y gastos aparecerán aquí</p>
                    </div>
                  ) : (
                    movimientosProfit
                      .slice(0, 5)
                      .map((mov) => <MovimientoRow key={mov.id} movimiento={mov} />)
                  )}
                </div>

                {movimientosProfit.length > 5 && (
                  <button
                    onClick={() => setTabActiva('historial')}
                    className="mt-4 w-full py-2 text-sm text-violet-400 transition-colors hover:text-violet-300"
                  >
                    Ver todos los movimientos →
                  </button>
                )}
              </motion.div>
            </div>
          )}

          {tabActiva === 'historial' && (
            <motion.div className="rounded-2xl p-6" style={glassStyle}>
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Historial Completo</h3>
                <span className="text-sm text-gray-400">
                  {movimientosProfit.length} movimientos
                </span>
              </div>

              <div className="max-h-[500px] space-y-2 overflow-y-auto pr-2">
                {movimientosProfit.length === 0 ? (
                  <div className="py-12 text-center">
                    <History className="mx-auto mb-4 h-16 w-16 text-gray-600" />
                    <p className="text-lg text-gray-400">Sin movimientos registrados</p>
                  </div>
                ) : (
                  movimientosProfit.map((mov) => <MovimientoRow key={mov.id} movimiento={mov} />)
                )}
              </div>
            </motion.div>
          )}

          {tabActiva === 'estadisticas' && (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <motion.div className="rounded-2xl p-6" style={glassStyle}>
                <h3 className="mb-6 text-lg font-bold text-white">Resumen de Operaciones</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                    <span className="text-gray-400">Total Ingresos</span>
                    <span className="text-xl font-bold text-emerald-400">
                      {formatCurrency(estadisticas.totalIngresos)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-4">
                    <span className="text-gray-400">Total Gastos</span>
                    <span className="text-xl font-bold text-red-400">
                      {formatCurrency(estadisticas.totalGastos)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-violet-500/20 bg-violet-500/10 p-4">
                    <span className="text-violet-300">Balance Neto</span>
                    <span
                      className={cn(
                        'text-xl font-bold',
                        estadisticas.balanceNeto >= 0 ? 'text-emerald-400' : 'text-red-400',
                      )}
                    >
                      {formatCurrency(estadisticas.balanceNeto)}
                    </span>
                  </div>
                </div>
              </motion.div>

              <motion.div className="rounded-2xl p-6" style={glassStyle}>
                <h3 className="mb-6 text-lg font-bold text-white">Promedios</h3>

                <div className="space-y-4">
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-sm text-gray-400">Promedio por Ingreso</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(estadisticas.promedioIngreso)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-sm text-gray-400">Promedio por Gasto</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(estadisticas.promedioGasto)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4">
                    <p className="text-sm text-gray-400">Total de Operaciones</p>
                    <p className="text-2xl font-bold text-violet-400">
                      {estadisticas.numeroOperaciones}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {tabActiva === 'proyecciones' && (
            <motion.div className="rounded-2xl p-6" style={glassStyle}>
              <div className="mb-6 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-violet-400" />
                <h3 className="text-lg font-bold text-white">Proyecciones Inteligentes</h3>
              </div>

              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 p-4">
                  <p className="text-sm text-gray-400">Proyección 30 días</p>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(
                      profit.capitalActual +
                        (estadisticas.promedioIngreso * 30) / 7 -
                        (estadisticas.promedioGasto * 30) / 7,
                    )}
                  </p>
                  <p className="mt-1 text-xs text-violet-300">Basado en tendencia actual</p>
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 to-green-500/10 p-4">
                  <p className="text-sm text-gray-400">Mejor escenario</p>
                  <p className="text-2xl font-bold text-emerald-400">
                    {formatCurrency(profit.capitalActual * 1.25)}
                  </p>
                  <p className="mt-1 text-xs text-emerald-300">+25% crecimiento</p>
                </div>
                <div className="rounded-xl border border-amber-500/20 bg-gradient-to-br from-amber-500/20 to-yellow-500/10 p-4">
                  <p className="text-sm text-gray-400">Meta recomendada</p>
                  <p className="text-2xl font-bold text-amber-400">
                    {formatCurrency(profit.capitalActual * 1.5)}
                  </p>
                  <p className="mt-1 text-xs text-amber-300">Objetivo 90 días</p>
                </div>
              </div>

              <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 p-4">
                <h4 className="mb-2 flex items-center gap-2 font-medium text-white">
                  <Sparkles className="h-4 w-4 text-violet-400" />
                  Recomendación IA
                </h4>
                <p className="text-sm text-gray-300">
                  Basado en tu historial de operaciones, te recomendamos mantener un balance mínimo
                  de{' '}
                  <strong className="text-violet-400">
                    {formatCurrency(estadisticas.promedioGasto * 3)}
                  </strong>{' '}
                  para cubrir 3 meses de gastos promedio.
                  {profit.capitalActual >= estadisticas.promedioGasto * 3 ? (
                    <span className="text-emerald-400"> ✅ Ya cumples con este objetivo.</span>
                  ) : (
                    <span className="text-amber-400"> ⚠️ Considera incrementar tu reserva.</span>
                  )}
                </p>
              </div>
            </motion.div>
          )}

          {tabActiva === 'operaciones' && (
            <motion.div className="rounded-2xl p-6" style={glassStyle}>
              <h3 className="mb-6 text-lg font-bold text-white">Centro de Operaciones</h3>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <button
                  onClick={() => setIsIngresoModalOpen(true)}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center transition-all hover:bg-emerald-500/20"
                >
                  <Plus className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                  <p className="font-medium text-white">Registrar Ingreso</p>
                  <p className="mt-1 text-xs text-gray-400">Agregar capital</p>
                </button>

                <button
                  onClick={() => setIsGastoModalOpen(true)}
                  className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center transition-all hover:bg-red-500/20"
                >
                  <Minus className="mx-auto mb-2 h-8 w-8 text-red-400" />
                  <p className="font-medium text-white">Registrar Gasto</p>
                  <p className="mt-1 text-xs text-gray-400">Salida de capital</p>
                </button>

                <button
                  onClick={() => setIsTransferenciaModalOpen(true)}
                  className="rounded-xl border border-violet-500/20 bg-violet-500/10 p-6 text-center transition-all hover:bg-violet-500/20"
                >
                  <ArrowRightLeft className="mx-auto mb-2 h-8 w-8 text-violet-400" />
                  <p className="font-medium text-white">Transferir</p>
                  <p className="mt-1 text-xs text-gray-400">Entre bancos</p>
                </button>

                <button
                  onClick={() => {
                    toast.info('Próximamente', {
                      description: 'Operaciones de cambio USD en desarrollo',
                    })
                  }}
                  className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-6 text-center transition-all hover:bg-amber-500/20"
                >
                  <DollarSign className="mx-auto mb-2 h-8 w-8 text-amber-400" />
                  <p className="font-medium text-white">Casa de Cambio</p>
                  <p className="mt-1 text-xs text-gray-400">Compra/Venta USD</p>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modales */}
      <IngresoModal
        isOpen={isIngresoModalOpen}
        onClose={() => setIsIngresoModalOpen(false)}
        bancoPreseleccionado="profit"
      />
      <GastoModal
        isOpen={isGastoModalOpen}
        onClose={() => setIsGastoModalOpen(false)}
        bancoPreseleccionado="profit"
      />
      <TransferenciaModal
        isOpen={isTransferenciaModalOpen}
        onClose={() => setIsTransferenciaModalOpen(false)}
      />
    </div>
  )
}

export default PanelProfitEspecializado
