'use client'

// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — BANCO DETALLE PANEL PREMIUM
// Panel individual de banco con 4 tabs: Ingresos, Gastos, Transferencias, Cortes
// Diseño ultra-premium con glassmorphism y animaciones avanzadas
// Los colores del panel cambian según el banco seleccionado
// ═══════════════════════════════════════════════════════════════════════════════

import { GastoModal } from '@/app/_components/modals/GastoModal'
import { IngresoModal } from '@/app/_components/modals/IngresoModal'
import { TransferenciaModal } from '@/app/_components/modals/TransferenciaModal'
import { cn, formatCurrency } from '@/app/_lib/utils'
import { BANCOS_CONFIG } from '@/app/lib/config/bancos.config'
import { useChronosStore } from '@/app/lib/store'
import type { BancoId } from '@/app/types'
import type { CorteData } from '@/app/types/cortes'
import type { Banco, Movimiento as DbMovimiento } from '@/database/schema'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRightLeft,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Minus,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

// Tipo simplificado de movimiento desde database
type Movimiento = DbMovimiento

interface BancoDetalleClientProps {
  banco: Banco
  movimientos: Movimiento[]
}

type TabId = 'ingresos' | 'gastos' | 'transferencias' | 'cortes'

interface TabConfig {
  id: TabId
  label: string
  icon: typeof TrendingUp
  gradient: string
  description: string
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER: Generar variantes de color para cada banco
// ═══════════════════════════════════════════════════════════════════════════════

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1] ?? '8b', 16),
        g: parseInt(result[2] ?? '5c', 16),
        b: parseInt(result[3] ?? 'f6', 16),
      }
    : { r: 139, g: 92, b: 246 } // Default violet
}

function getBancoColorVariants(color: string) {
  const rgb = hexToRgb(color)
  return {
    // Color principal
    primary: color,
    // Fondos con opacidad
    bgSubtle: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.05)`,
    bgLight: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`,
    bgMedium: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`,
    bgStrong: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.25)`,
    // Bordes
    border: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
    borderHover: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)`,
    // Sombras y glows
    glow: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`,
    glowStrong: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`,
    // Texto
    text: color,
    textMuted: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const TABS: TabConfig[] = [
  {
    id: 'ingresos',
    label: 'Ingresos',
    icon: TrendingUp,
    gradient: 'from-emerald-500 to-green-600',
    description: 'Entradas de capital al banco',
  },
  {
    id: 'gastos',
    label: 'Gastos',
    icon: TrendingDown,
    gradient: 'from-red-500 to-rose-600',
    description: 'Salidas y pagos desde el banco',
  },
  {
    id: 'transferencias',
    label: 'Transferencias',
    icon: ArrowRightLeft,
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Movimientos entre bancos',
  },
  {
    id: 'cortes',
    label: 'Cortes RF',
    icon: FileText,
    gradient: 'from-purple-500 to-violet-600',
    description: 'Reportes y balance de cuenta',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function BancoDetalleClient({
  banco: initialBanco,
  movimientos: initialMovimientos,
}: BancoDetalleClientProps) {
  const [activeTab, setActiveTab] = useState<TabId>('ingresos')
  const [searchQuery, setSearchQuery] = useState('')
  const [_dateFilter, _setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('all')
  const [isRefreshing, startRefresh] = useTransition()

  // Estados de modales
  const [isIngresoModalOpen, setIsIngresoModalOpen] = useState(false)
  const [isGastoModalOpen, setIsGastoModalOpen] = useState(false)
  const [isTransferenciaModalOpen, setIsTransferenciaModalOpen] = useState(false)

  // Conectar al store para datos reactivos del banco
  const storeBancos = useChronosStore((state) => state.bancos)

  // Usar capital del store si está disponible (más actualizado)
  const banco = useMemo(() => {
    const storeBanco = storeBancos[initialBanco.id as keyof typeof storeBancos]
    if (storeBanco) {
      return {
        ...initialBanco,
        capitalActual: storeBanco.capitalActual,
        historicoIngresos: storeBanco.historicoIngresos,
        historicoGastos: storeBanco.historicoGastos,
      }
    }
    return initialBanco
  }, [storeBancos, initialBanco])

  // Movimientos vienen del servidor (schema diferente al store)
  const movimientos = initialMovimientos

  const config = BANCOS_CONFIG[banco.id as keyof typeof BANCOS_CONFIG]

  // 🎨 Obtener variantes de color del banco seleccionado
  const bancoColor = config?.color || '#8B5CF6'
  const colorVariants = useMemo(() => getBancoColorVariants(bancoColor), [bancoColor])

  // Filtrar movimientos por tipo
  const ingresos = useMemo(
    () =>
      movimientos.filter(
        (m) => m.tipo === 'ingreso' || m.tipo === 'transferencia_entrada' || m.tipo === 'abono',
      ),
    [movimientos],
  )

  const gastos = useMemo(
    () => movimientos.filter((m) => m.tipo === 'gasto' || m.tipo === 'pago'),
    [movimientos],
  )

  const transferencias = useMemo(
    () =>
      movimientos.filter(
        (m) => m.tipo === 'transferencia_entrada' || m.tipo === 'transferencia_salida',
      ),
    [movimientos],
  )

  // Margen calculado
  const margen =
    banco.historicoIngresos > 0
      ? (
          ((banco.historicoIngresos - banco.historicoGastos) / banco.historicoIngresos) *
          100
        ).toFixed(1)
      : '0'

  return (
    <div
      className="space-y-6 rounded-3xl p-6 transition-all duration-500"
      style={{
        background: `linear-gradient(135deg, ${colorVariants.bgSubtle} 0%, rgba(0,0,0,0.3) 100%)`,
        border: `1px solid ${colorVariants.border}`,
        boxShadow: `0 0 60px ${colorVariants.glow}, inset 0 1px 0 ${colorVariants.border}`,
      }}
    >
      {/* Header con info del banco */}
      <motion.div
        className="flex items-center justify-between rounded-2xl p-5"
        style={{
          background: colorVariants.bgLight,
          border: `1px solid ${colorVariants.border}`,
        }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
            style={{
              background: colorVariants.bgMedium,
              boxShadow: `0 0 20px ${colorVariants.glow}`,
            }}
          >
            {config?.icon || '🏦'}
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: colorVariants.text }}>
              {config?.nombre || 'Banco'}
            </h2>
            <p className="text-sm text-gray-400">ID: {banco.id}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs tracking-wider text-gray-500 uppercase">Capital Actual</p>
          <p className="font-mono text-3xl font-bold" style={{ color: colorVariants.text }}>
            {formatCurrency(banco.capitalActual)}
          </p>
        </div>
      </motion.div>

      {/* KPI Cards con colores del banco */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Histórico Ingresos */}
        <motion.div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <p className="mb-1 text-xs tracking-wider text-gray-400 uppercase">Histórico Ingresos</p>
          <p className="font-mono text-2xl font-bold text-emerald-400">
            +{formatCurrency(banco.historicoIngresos)}
          </p>
        </motion.div>

        {/* Histórico Gastos */}
        <motion.div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="mb-1 text-xs tracking-wider text-gray-400 uppercase">Histórico Gastos</p>
          <p className="font-mono text-2xl font-bold text-red-400">
            -{formatCurrency(banco.historicoGastos)}
          </p>
        </motion.div>

        {/* Margen */}
        <motion.div
          className="rounded-2xl p-5"
          style={{
            background: colorVariants.bgLight,
            border: `1px solid ${colorVariants.border}`,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="mb-1 text-xs tracking-wider text-gray-400 uppercase">Margen</p>
          <p className="font-mono text-2xl font-bold" style={{ color: colorVariants.text }}>
            {margen}%
          </p>
        </motion.div>
      </div>

      {/* Tabs Navigation con colores del banco */}
      <div
        className="flex flex-col items-start justify-between gap-4 rounded-xl p-3 md:flex-row md:items-center"
        style={{
          background: colorVariants.bgSubtle,
          border: `1px solid ${colorVariants.border}`,
        }}
      >
        <div
          className="flex items-center gap-1 rounded-xl p-1"
          style={{
            background: colorVariants.bgLight,
            border: `1px solid ${colorVariants.border}`,
          }}
        >
          {TABS.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
                activeTab === tab.id ? 'text-white' : 'text-gray-400 hover:text-white',
              )}
              style={
                activeTab === tab.id
                  ? {
                      background: colorVariants.bgStrong,
                      boxShadow: `0 0 15px ${colorVariants.glow}`,
                    }
                  : {}
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <tab.icon
                className="h-4 w-4"
                style={activeTab === tab.id ? { color: colorVariants.text } : {}}
              />
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              startRefresh(() => {
                toast.success('Datos actualizados')
              })
            }
            disabled={isRefreshing}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors disabled:opacity-50"
            style={{
              background: colorVariants.bgLight,
              border: `1px solid ${colorVariants.border}`,
            }}
          >
            <RefreshCw
              className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              style={{ color: colorVariants.text }}
            />
          </button>

          {/* Botón Ingreso */}
          <button
            onClick={() => setIsIngresoModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-4 text-sm font-medium transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Ingreso
          </button>

          {/* Botón Gasto */}
          <button
            onClick={() => setIsGastoModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 px-4 text-sm font-medium transition-opacity hover:opacity-90"
          >
            <Minus className="h-4 w-4" />
            Gasto
          </button>

          {/* Botón Transferencia */}
          <button
            onClick={() => setIsTransferenciaModalOpen(true)}
            className="flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 text-sm font-medium transition-opacity hover:opacity-90"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Transferir
          </button>
        </div>
      </div>

      {/* Search Bar con colores del banco */}
      <div className="relative">
        <Search
          className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2"
          style={{ color: colorVariants.textMuted }}
        />
        <input
          type="text"
          placeholder="Buscar por concepto, referencia, monto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 w-full rounded-xl pr-4 pl-11 text-white placeholder-gray-400 transition-colors focus:outline-none"
          style={{
            background: colorVariants.bgSubtle,
            border: `1px solid ${colorVariants.border}`,
          }}
        />
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="rounded-2xl p-4"
          style={{
            background: colorVariants.bgSubtle,
            border: `1px solid ${colorVariants.border}`,
          }}
        >
          {activeTab === 'ingresos' && (
            <TablaMovimientos
              titulo="Ingresos"
              movimientos={ingresos}
              tipo="ingreso"
              searchQuery={searchQuery}
              bancoColor={config?.color || '#8B5CF6'}
            />
          )}
          {activeTab === 'gastos' && (
            <TablaMovimientos
              titulo="Gastos"
              movimientos={gastos}
              tipo="gasto"
              searchQuery={searchQuery}
              bancoColor={config?.color || '#8B5CF6'}
            />
          )}
          {activeTab === 'transferencias' && (
            <TablaTransferencias
              transferencias={transferencias}
              searchQuery={searchQuery}
              bancoId={banco.id as BancoId}
              bancoColor={config?.color || '#8B5CF6'}
            />
          )}
          {activeTab === 'cortes' && (
            <PanelCortes
              banco={banco}
              movimientos={movimientos}
              bancoColor={config?.color || '#8B5CF6'}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Modales */}
      <IngresoModal
        isOpen={isIngresoModalOpen}
        onClose={() => setIsIngresoModalOpen(false)}
        bancoPreseleccionado={banco.id as BancoId}
      />
      <GastoModal
        isOpen={isGastoModalOpen}
        onClose={() => setIsGastoModalOpen(false)}
        bancoPreseleccionado={banco.id as BancoId}
      />
      <TransferenciaModal
        isOpen={isTransferenciaModalOpen}
        onClose={() => setIsTransferenciaModalOpen(false)}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

interface TablaMovimientosProps {
  titulo: string
  movimientos: Movimiento[]
  tipo: 'ingreso' | 'gasto'
  searchQuery: string
  bancoColor?: string
}

function TablaMovimientos({
  titulo,
  movimientos,
  tipo,
  searchQuery,
  bancoColor = '#8B5CF6',
}: TablaMovimientosProps) {
  const colorVariants = getBancoColorVariants(bancoColor)

  const filteredMovimientos = movimientos.filter((m) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      m.concepto?.toLowerCase().includes(query) ||
      m.referencia?.toLowerCase().includes(query) ||
      m.monto.toString().includes(query)
    )
  })

  const isIngreso = tipo === 'ingreso'
  const totalMonto = filteredMovimientos.reduce((sum, m) => sum + Math.abs(m.monto), 0)

  return (
    <div className="space-y-4">
      {/* Header con total */}
      <div
        className="flex items-center justify-between rounded-xl p-4"
        style={{
          background: colorVariants.bgSubtle,
          border: `1px solid ${colorVariants.border}`,
        }}
      >
        <div className="flex items-center gap-3">
          {isIngreso ? (
            <TrendingUp className="h-5 w-5 text-emerald-400" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-400" />
          )}
          <div>
            <p className="text-sm text-gray-400">Total {titulo}</p>
            <p
              className={cn(
                'font-mono text-xl font-bold',
                isIngreso ? 'text-emerald-400' : 'text-red-400',
              )}
            >
              {isIngreso ? '+' : '-'}
              {formatCurrency(totalMonto)}
            </p>
          </div>
        </div>
        <span
          className="rounded-full px-3 py-1 text-sm"
          style={{
            background: colorVariants.bgLight,
            color: colorVariants.text,
            border: `1px solid ${colorVariants.border}`,
          }}
        >
          {filteredMovimientos.length} movimientos
        </span>
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-xl"
        style={{
          background: colorVariants.bgSubtle,
          border: `1px solid ${colorVariants.border}`,
        }}
      >
        <table className="w-full">
          <thead>
            <tr
              style={{
                background: colorVariants.bgLight,
                borderBottom: `1px solid ${colorVariants.border}`,
              }}
            >
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                Concepto
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                Referencia
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                TC
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-400 uppercase">
                Monto
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-400 uppercase">
                Estado
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-400 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: colorVariants.border }}>
            {filteredMovimientos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <AlertCircle className="h-8 w-8 opacity-50" />
                    <p>No hay movimientos para mostrar</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredMovimientos.slice(0, 20).map((mov, index) => (
                <motion.tr
                  key={mov.id || index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group transition-colors"
                  style={{
                    borderBottom: `1px solid ${colorVariants.border}`,
                  }}
                  whileHover={{
                    backgroundColor: colorVariants.bgLight,
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      <span className="text-sm text-gray-300">
                        {new Date(mov.fecha).toLocaleDateString('es-MX', {
                          day: '2-digit',
                          month: 'short',
                          year: '2-digit',
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-xs truncate text-sm font-medium text-white">
                      {mov.concepto || 'Sin concepto'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <code
                      className="rounded px-2 py-1 font-mono text-xs"
                      style={{
                        background: colorVariants.bgLight,
                        color: colorVariants.text,
                      }}
                    >
                      {mov.referencia || '—'}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">—</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        'font-mono text-sm font-bold',
                        isIngreso ? 'text-emerald-400' : 'text-red-400',
                      )}
                    >
                      {isIngreso ? '+' : '-'}
                      {formatCurrency(Math.abs(mov.monto))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Aplicado
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button className="rounded-lg p-1.5 opacity-0 transition-all group-hover:opacity-100 hover:bg-white/10">
                      <MoreHorizontal className="h-4 w-4 text-gray-400" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>

        {filteredMovimientos.length > 20 && (
          <div
            className="px-4 py-3 text-center"
            style={{
              background: colorVariants.bgLight,
              borderTop: `1px solid ${colorVariants.border}`,
            }}
          >
            <button
              className="text-sm font-medium transition-opacity hover:opacity-80"
              style={{ color: colorVariants.text }}
            >
              Ver todos los {filteredMovimientos.length} movimientos →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface TablaTransferenciasProps {
  transferencias: Movimiento[]
  searchQuery: string
  bancoId: BancoId
  bancoColor?: string
}

function TablaTransferencias({
  transferencias,
  searchQuery,
  bancoId,
  bancoColor = '#8B5CF6',
}: TablaTransferenciasProps) {
  const colorVariants = getBancoColorVariants(bancoColor)

  const filteredTransferencias = transferencias.filter((t) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return t.concepto?.toLowerCase().includes(query) || t.referencia?.toLowerCase().includes(query)
  })

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <div className="mb-2 flex items-center gap-2 text-blue-400">
            <ArrowUpRight className="h-4 w-4" />
            <span className="text-sm">Transferencias Salientes</span>
          </div>
          <p className="font-mono text-xl font-bold text-white">
            {filteredTransferencias.filter((t) => t.bancoOrigenId === bancoId).length}
          </p>
        </div>
        <div
          className="rounded-xl p-4"
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
          }}
        >
          <div className="mb-2 flex items-center gap-2 text-green-400">
            <ArrowDownRight className="h-4 w-4" />
            <span className="text-sm">Transferencias Entrantes</span>
          </div>
          <p className="font-mono text-xl font-bold text-white">
            {filteredTransferencias.filter((t) => t.bancoDestinoId === bancoId).length}
          </p>
        </div>
        <div
          className="rounded-xl p-4"
          style={{
            background: colorVariants.bgLight,
            border: `1px solid ${colorVariants.border}`,
          }}
        >
          <div className="mb-2 flex items-center gap-2" style={{ color: colorVariants.text }}>
            <ArrowRightLeft className="h-4 w-4" />
            <span className="text-sm">Total Transferencias</span>
          </div>
          <p className="font-mono text-xl font-bold text-white">{filteredTransferencias.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                Origen
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-400 uppercase"></th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                Destino
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-400 uppercase">
                Concepto
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-gray-400 uppercase">
                Monto
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-gray-400 uppercase">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredTransferencias.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <ArrowRightLeft className="h-8 w-8 opacity-50" />
                    <p>No hay transferencias registradas</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransferencias.slice(0, 15).map((trans, index) => {
                const isOutgoing = trans.bancoOrigenId === bancoId
                const origenConfig = trans.bancoOrigenId
                  ? BANCOS_CONFIG[trans.bancoOrigenId as keyof typeof BANCOS_CONFIG]
                  : null
                const destinoConfig = trans.bancoDestinoId
                  ? BANCOS_CONFIG[trans.bancoDestinoId as keyof typeof BANCOS_CONFIG]
                  : null

                return (
                  <motion.tr
                    key={trans.id || index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3 text-sm text-gray-300">
                      {new Date(trans.fecha).toLocaleDateString('es-MX')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{origenConfig?.icon || '🏦'}</span>
                        <span className="text-sm text-white">
                          {origenConfig?.nombre || trans.bancoOrigenId || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ChevronRight
                        className={cn(
                          'mx-auto h-4 w-4',
                          isOutgoing ? 'text-red-400' : 'text-green-400',
                        )}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{destinoConfig?.icon || '🏦'}</span>
                        <span className="text-sm text-white">
                          {destinoConfig?.nombre || trans.bancoDestinoId || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="max-w-xs truncate px-4 py-3 text-sm text-gray-400">
                      {trans.concepto || 'Transferencia entre bancos'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          'font-mono text-sm font-bold',
                          isOutgoing ? 'text-red-400' : 'text-green-400',
                        )}
                      >
                        {isOutgoing ? '-' : '+'}
                        {formatCurrency(Math.abs(trans.monto))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        Completada
                      </span>
                    </td>
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

interface PanelCortesProps {
  banco: Banco
  movimientos: Movimiento[]
  bancoColor?: string
}

function PanelCortes({ banco, movimientos, bancoColor = '#8B5CF6' }: PanelCortesProps) {
  const colorVariants = getBancoColorVariants(bancoColor)
  const [isGeneratingCorte, setIsGeneratingCorte] = useState(false)
  const [corteData, setCorteData] = useState<CorteData | null>(null)

  // Generar cortes automáticos por mes
  const cortesMensuales = useMemo(() => {
    const meses: Record<string, { ingresos: number; gastos: number; movimientos: number }> = {}

    movimientos.forEach((m) => {
      const fecha = new Date(m.fecha)
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`

      if (!meses[key]) {
        meses[key] = { ingresos: 0, gastos: 0, movimientos: 0 }
      }

      if (m.tipo === 'ingreso' || m.monto > 0) {
        meses[key].ingresos += Math.abs(m.monto)
      } else {
        meses[key].gastos += Math.abs(m.monto)
      }
      meses[key].movimientos++
    })

    return Object.entries(meses)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([periodo, data]) => ({
        periodo,
        ...data,
        balance: data.ingresos - data.gastos,
      }))
  }, [movimientos])

  return (
    <div className="space-y-6">
      {/* Estado Actual del Banco */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: `linear-gradient(135deg, ${colorVariants.bgLight} 0%, ${colorVariants.bgSubtle} 100%)`,
          border: `1px solid ${colorVariants.border}`,
        }}
      >
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          <FileText className="h-5 w-5" style={{ color: colorVariants.text }} />
          Estado Actual de Cuenta
        </h3>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div
            className="rounded-xl p-4"
            style={{
              background: colorVariants.bgLight,
              border: `1px solid ${colorVariants.border}`,
            }}
          >
            <p className="mb-1 text-sm text-gray-400">Capital Actual</p>
            <p className="font-mono text-2xl font-bold" style={{ color: colorVariants.text }}>
              {formatCurrency(banco.capitalActual)}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="mb-1 text-sm text-gray-400">Total Ingresos</p>
            <p className="font-mono text-2xl font-bold text-emerald-400">
              +{formatCurrency(banco.historicoIngresos)}
            </p>
          </div>
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
            <p className="mb-1 text-sm text-gray-400">Total Gastos</p>
            <p className="font-mono text-2xl font-bold text-red-400">
              -{formatCurrency(banco.historicoGastos)}
            </p>
          </div>
          <div
            className="rounded-xl p-4"
            style={{
              background: colorVariants.bgLight,
              border: `1px solid ${colorVariants.border}`,
            }}
          >
            <p className="mb-1 text-sm text-gray-400">Balance</p>
            <p
              className={cn(
                'font-mono text-2xl font-bold',
                banco.historicoIngresos - banco.historicoGastos >= 0
                  ? 'text-blue-400'
                  : 'text-orange-400',
              )}
            >
              {formatCurrency(banco.historicoIngresos - banco.historicoGastos)}
            </p>
          </div>
        </div>
      </div>

      {/* Cortes Mensuales */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-white">Cortes Mensuales</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cortesMensuales.slice(0, 6).map((corte, index) => {
            const [year = '2024', month = '01'] = corte.periodo.split('-')
            const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
              'es-MX',
              { month: 'long', year: 'numeric' },
            )

            return (
              <motion.div
                key={corte.periodo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer rounded-xl p-4 transition-all duration-300"
                style={{
                  background: colorVariants.bgSubtle,
                  border: `1px solid ${colorVariants.border}`,
                }}
                whileHover={{
                  scale: 1.02,
                  boxShadow: `0 8px 32px ${colorVariants.glow}`,
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium text-white capitalize">{monthName}</h4>
                  <span
                    className="rounded-full px-2 py-1 text-xs"
                    style={{ background: colorVariants.bgLight, color: colorVariants.text }}
                  >
                    {corte.movimientos} mov
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Ingresos</span>
                    <span className="font-mono text-emerald-400">
                      +{formatCurrency(corte.ingresos)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Gastos</span>
                    <span className="font-mono text-red-400">-{formatCurrency(corte.gastos)}</span>
                  </div>
                  <div className="my-2 h-px" style={{ background: colorVariants.border }} />
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-white">Balance</span>
                    <span
                      className={cn(
                        'font-mono font-bold',
                        corte.balance >= 0 ? 'text-blue-400' : 'text-orange-400',
                      )}
                    >
                      {formatCurrency(corte.balance)}
                    </span>
                  </div>
                </div>

                <button
                  className="mt-3 w-full rounded-lg py-2 text-sm font-medium opacity-0 transition-all duration-300 group-hover:opacity-100"
                  style={{
                    background: colorVariants.bgLight,
                    color: colorVariants.text,
                    border: `1px solid ${colorVariants.border}`,
                  }}
                >
                  Ver detalle →
                </button>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-3">
        <button
          onClick={async () => {
            setIsGeneratingCorte(true)
            try {
              const response = await fetch(`/api/bancos/${banco.id}/corte`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tipo: 'mensual' }),
              })
              const data = await response.json()
              setCorteData(data)
              toast.success('✅ Corte generado exitosamente')
            } catch (error) {
              toast.error('Error al generar corte')
            } finally {
              setIsGeneratingCorte(false)
            }
          }}
          disabled={isGeneratingCorte}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{
            background: `linear-gradient(135deg, ${bancoColor} 0%, ${colorVariants.text} 100%)`,
            boxShadow: `0 4px 16px ${colorVariants.glow}`,
          }}
        >
          <FileText className="h-4 w-4" />
          {isGeneratingCorte ? 'Generando...' : 'Generar Corte Actual'}
        </button>
        <button
          className="flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: colorVariants.bgLight,
            border: `1px solid ${colorVariants.border}`,
            color: colorVariants.text,
          }}
        >
          <Download className="h-4 w-4" />
          Exportar PDF
        </button>
      </div>
    </div>
  )
}
