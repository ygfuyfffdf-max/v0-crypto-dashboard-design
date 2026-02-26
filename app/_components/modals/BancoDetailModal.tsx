'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏦✨ BANCO DETAIL MODAL PREMIUM iOS — CHRONOS INFINITY 2026
 * ════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Modal ultra premium con diseño iOS para mostrar detalles completos de un banco:
 * - Gráficos animados de ingresos/gastos
 * - Timeline de movimientos recientes
 * - Estadísticas avanzadas con glassmorphism iOS
 */

import { Activity, ArrowDownLeft, ArrowUpRight, Calendar, TrendingDown, TrendingUp, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useState } from 'react'
import { EnhancedAuroraCard as AuroraGlassCard } from '../ui/EnhancedAuroraSystem'

// Lazy load charts
const AuroraLineChart = dynamic(
  () => import('../charts/AuroraPremiumCharts').then((mod) => mod.AuroraAreaChart),
  { ssr: false, loading: () => <div className="h-[200px] animate-pulse rounded-xl bg-white/5" /> },
)

const AuroraAreaChart = dynamic(
  () => import('../charts/AuroraPremiumCharts').then((mod) => mod.AuroraAreaChart),
  { ssr: false, loading: () => <div className="h-[180px] animate-pulse rounded-xl bg-white/5" /> },
)

interface BancoData {
  id: string
  nombre: string
  color: string
  capitalActual: number
  historicoIngresos: number
  historicoGastos: number
  ultimoMovimiento?: string
  cambio: number
  icono?: string
}

interface Movimiento {
  id: string
  tipo: 'ingreso' | 'gasto'
  concepto: string
  monto: number
  fecha: string
  origen?: string
}

interface BancoDetailModalProps {
  banco: BancoData | null
  isOpen: boolean
  onClose: () => void
}

export function BancoDetailModal({ banco, isOpen, onClose }: BancoDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'movimientos' | 'estadisticas'>('overview')

  // Simular datos de movimientos recientes (en producción vendrían de la API)
  const movimientos = useMemo<Movimiento[]>(() => {
    if (!banco) return []
    return [
      {
        id: '1',
        tipo: 'ingreso',
        concepto: 'Venta #1234',
        monto: 5000,
        fecha: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        origen: 'Ventas',
      },
      {
        id: '2',
        tipo: 'gasto',
        concepto: 'Pago a proveedor',
        monto: 2500,
        fecha: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        origen: 'Compras',
      },
      {
        id: '3',
        tipo: 'ingreso',
        concepto: 'Abono cliente',
        monto: 3200,
        fecha: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        origen: 'Clientes',
      },
      {
        id: '4',
        tipo: 'gasto',
        concepto: 'Flete',
        monto: 800,
        fecha: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        origen: 'Fletes',
      },
      {
        id: '5',
        tipo: 'ingreso',
        concepto: 'Venta #1235',
        monto: 7500,
        fecha: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        origen: 'Ventas',
      },
    ]
  }, [banco])

  // Datos para gráfico de tendencia (últimos 7 días)
  const trendData = useMemo(() => {
    const days = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    return days.map((day, i) => ({
      name: day,
      ingresos: Math.floor(Math.random() * 8000) + 2000,
      gastos: Math.floor(Math.random() * 4000) + 1000,
    }))
  }, [banco])

  // Datos para gráfico de área acumulativa
  const cumulativeData = useMemo(() => {
    const days = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
    let accumulated = banco?.capitalActual || 0
    return days.map((week) => {
      accumulated += Math.floor(Math.random() * 5000) - 2000
      return { name: week, value: accumulated }
    })
  }, [banco])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!banco) return null

  const cambioPositivo = banco.cambio >= 0
  const margen = banco.historicoIngresos > 0
    ? ((banco.historicoIngresos - banco.historicoGastos) / banco.historicoIngresos * 100).toFixed(1)
    : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-full max-w-5xl my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <AuroraGlassCard className="relative overflow-hidden p-0">
                {/* Animated Background Orb */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <motion.div
                    className="absolute -top-1/2 -right-1/2 h-[600px] w-[600px] rounded-full opacity-20"
                    style={{
                      background: `radial-gradient(circle, ${banco.color}, transparent 70%)`,
                      filter: 'blur(80px)',
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </div>

                {/* Header */}
                <div className="relative border-b border-white/10 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {/* Bank Icon */}
                      <motion.div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-xl"
                        style={{
                          background: `linear-gradient(135deg, ${banco.color}, ${banco.color}CC)`,
                          boxShadow: `0 8px 32px ${banco.color}40`,
                        }}
                        whileHover={{ scale: 1.02, rotate: 5 }}
                      >
                        <span className="text-2xl font-bold">
                          {banco.icono || banco.nombre[0]}
                        </span>
                      </motion.div>

                      {/* Bank Info */}
                      <div>
                        <h2 className="text-2xl font-bold text-white">{banco.nombre}</h2>
                        <p className="mt-1 text-sm text-white/50">
                          Banco operativo · Última actualización hace 2 minutos
                        </p>
                      </div>
                    </div>

                    {/* Close Button */}
                    <motion.button
                      onClick={onClose}
                      className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X size={20} />
                    </motion.button>
                  </div>

                  {/* Quick Stats */}
                  <div className="mt-6 grid grid-cols-3 gap-4">
                    <motion.div
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                      whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                      <p className="text-xs text-white/50">Capital Actual</p>
                      <p className="mt-1 text-2xl font-bold text-white">
                        ${(banco.capitalActual / 1000).toFixed(1)}K
                      </p>
                      <div className={`mt-2 flex items-center gap-1 text-xs ${cambioPositivo ? 'text-emerald-400' : 'text-red-400'}`}>
                        {cambioPositivo ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(banco.cambio).toFixed(1)}% vs ayer
                      </div>
                    </motion.div>

                    <motion.div
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                      whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                      <p className="text-xs text-white/50">Total Ingresos</p>
                      <p className="mt-1 text-2xl font-bold text-emerald-400">
                        ${(banco.historicoIngresos / 1000).toFixed(1)}K
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
                        <ArrowUpRight size={14} />
                        Histórico acumulado
                      </div>
                    </motion.div>

                    <motion.div
                      className="rounded-xl border border-white/10 bg-white/5 p-4"
                      whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.2)' }}
                    >
                      <p className="text-xs text-white/50">Total Gastos</p>
                      <p className="mt-1 text-2xl font-bold text-red-400">
                        ${(banco.historicoGastos / 1000).toFixed(1)}K
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-white/40">
                        <ArrowDownLeft size={14} />
                        Histórico acumulado
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="relative border-b border-white/10 bg-white/[0.02] px-6">
                  <div className="flex gap-1">
                    {[
                      { id: 'overview', label: 'Resumen', icon: <Activity size={16} /> },
                      { id: 'movimientos', label: 'Movimientos', icon: <ArrowUpRight size={16} /> },
                      { id: 'estadisticas', label: 'Estadísticas', icon: <TrendingUp size={16} /> },
                    ].map((tab) => (
                      <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`relative flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                          activeTab === tab.id ? 'text-white' : 'text-white/50 hover:text-white/80'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {activeTab === tab.id && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                            style={{ background: banco.color }}
                            layoutId="activeTabIndicator"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        {tab.icon}
                        {tab.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="relative p-6">
                  <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                      <motion.div
                        key="overview"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        {/* Charts Grid */}
                        <div className="grid gap-6 lg:grid-cols-2">
                          <AuroraGlassCard className="p-4">
                            <h3 className="mb-4 text-sm font-medium text-white/70">Tendencia Semanal</h3>
                            <AuroraLineChart
                              data={trendData as any}
                              height={200}
                              color={'violet'}
                              showGrid
                              showTooltip
                            />
                          </AuroraGlassCard>

                          <AuroraGlassCard className="p-4">
                            <h3 className="mb-4 text-sm font-medium text-white/70">Capital Acumulado</h3>
                            <AuroraAreaChart
                              data={cumulativeData}
                              height={200}
                              color={'violet'}
                              showGrid
                            />
                          </AuroraGlassCard>
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid gap-4 md:grid-cols-3">
                          <motion.div
                            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
                            whileHover={{ scale: 1.02, borderColor: 'rgba(16,185,129,0.3)' }}
                          >
                            <p className="text-xs text-emerald-400/70">Margen de Utilidad</p>
                            <p className="mt-2 text-3xl font-bold text-emerald-400">{margen}%</p>
                            <p className="mt-1 text-xs text-white/40">Sobre total de ingresos</p>
                          </motion.div>

                          <motion.div
                            className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4"
                            whileHover={{ scale: 1.02, borderColor: 'rgba(6,182,212,0.3)' }}
                          >
                            <p className="text-xs text-cyan-400/70">Transacciones</p>
                            <p className="mt-2 text-3xl font-bold text-cyan-400">{movimientos.length}</p>
                            <p className="mt-1 text-xs text-white/40">Últimas 24 horas</p>
                          </motion.div>

                          <motion.div
                            className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4"
                            whileHover={{ scale: 1.02, borderColor: 'rgba(139,92,246,0.3)' }}
                          >
                            <p className="text-xs text-violet-400/70">Promedio Diario</p>
                            <p className="mt-2 text-3xl font-bold text-violet-400">
                              ${((banco.historicoIngresos - banco.historicoGastos) / 30 / 1000).toFixed(1)}K
                            </p>
                            <p className="mt-1 text-xs text-white/40">Últimos 30 días</p>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'movimientos' && (
                      <motion.div
                        key="movimientos"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-3"
                      >
                        <h3 className="mb-4 text-sm font-medium text-white/70">Movimientos Recientes</h3>
                        {movimientos.map((mov, index) => (
                          <motion.div
                            key={mov.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10"
                            whileHover={{ scale: 1.01 }}
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                                  mov.tipo === 'ingreso'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/20 text-red-400'
                                }`}
                              >
                                {mov.tipo === 'ingreso' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                              </div>
                              <div>
                                <p className="font-medium text-white">{mov.concepto}</p>
                                <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                                  <Calendar size={12} />
                                  {new Date(mov.fecha).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  {mov.origen && (
                                    <>
                                      <span>·</span>
                                      <span>{mov.origen}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <p
                              className={`text-lg font-bold ${
                                mov.tipo === 'ingreso' ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {mov.tipo === 'ingreso' ? '+' : '-'}${(mov.monto / 1000).toFixed(1)}K
                            </p>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}

                    {activeTab === 'estadisticas' && (
                      <motion.div
                        key="estadisticas"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                      >
                        <h3 className="mb-4 text-sm font-medium text-white/70">Estadísticas Avanzadas</h3>

                        {/* Stats Grid */}
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/60">Velocidad de Crecimiento</span>
                              <span className="text-sm font-bold text-emerald-400">+12.5%/mes</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                              />
                            </div>
                          </div>

                          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/60">Eficiencia Operativa</span>
                              <span className="text-sm font-bold text-cyan-400">87.3%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-violet-500"
                                initial={{ width: 0 }}
                                animate={{ width: '87%' }}
                                transition={{ duration: 1, delay: 0.6 }}
                              />
                            </div>
                          </div>

                          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/60">Liquidez</span>
                              <span className="text-sm font-bold text-violet-400">Excelente</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
                                initial={{ width: 0 }}
                                animate={{ width: '92%' }}
                                transition={{ duration: 1, delay: 0.7 }}
                              />
                            </div>
                          </div>

                          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white/60">Salud Financiera</span>
                              <span className="text-sm font-bold text-emerald-400">Óptima</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-white/10">
                              <motion.div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                                initial={{ width: 0 }}
                                animate={{ width: '94%' }}
                                transition={{ duration: 1, delay: 0.8 }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Projection */}
                        <AuroraGlassCard className="p-4">
                          <h4 className="mb-4 text-sm font-medium text-white/70">Proyección a 30 días</h4>
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-3xl font-bold text-white">
                                ${((banco.capitalActual * 1.15) / 1000).toFixed(1)}K
                              </p>
                              <p className="mt-1 text-xs text-white/40">Capital estimado</p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-emerald-400">+15%</p>
                              <p className="mt-1 text-xs text-white/40">Crecimiento esperado</p>
                            </div>
                          </div>
                        </AuroraGlassCard>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AuroraGlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

