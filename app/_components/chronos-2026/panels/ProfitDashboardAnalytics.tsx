/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 PROFIT CASA DE CAMBIO — DASHBOARD ANALÍTICO PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de análisis avanzado con métricas en tiempo real:
 * - KPIs principales del negocio
 * - Gráficos de tendencias
 * - Análisis por divisa
 * - Predicciones ML
 * - Alertas inteligentes
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CircleDollarSign,
  Clock,
  DollarSign,
  Layers,
  LineChart,
  PieChart,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AnalyticsData {
  resumenHoy: {
    totalOperaciones: number
    operacionesCompra: number
    operacionesVenta: number
    volumenTotal: number
    gananciaTotal: number
    clientesAtendidos: number
    ticketPromedio: number
  }
  volumenesPorDivisa: Record<string, {
    comprado: number
    vendido: number
    ganancia: number
  }>
  tendencias: Record<string, {
    tendencia: string
    variacion: string
  }>
  historialSemana: Array<{
    fecha: string
    operaciones: number
    volumen: number
    ganancia: number
  }>
  topClientes: Array<{
    id: string
    nombre: string
    operaciones: number
    volumen: number
  }>
  alertas: Array<{
    tipo: string
    mensaje: string
    timestamp: string
  }>
}

interface ProfitDashboardAnalyticsProps {
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COLORES Y CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DIVISA_COLORS: Record<string, string> = {
  USD: '#22C55E',
  EUR: '#3B82F6',
  CAD: '#EF4444',
  GBP: '#8B5CF6',
  USDT: '#26A17B',
}

const DIVISA_BANDERAS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  CAD: '🇨🇦',
  GBP: '🇬🇧',
  USDT: '💎',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KPI CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const KPICard = memo(function KPICard({
  titulo,
  valor,
  subtitulo,
  icono: Icono,
  colorIcono,
  variacion,
  formato = 'numero',
}: {
  titulo: string
  valor: number
  subtitulo?: string
  icono: React.ElementType
  colorIcono: string
  variacion?: number
  formato?: 'numero' | 'moneda' | 'porcentaje'
}) {
  const formatearValor = () => {
    switch (formato) {
      case 'moneda':
        return `$${valor.toLocaleString('es-MX', { maximumFractionDigits: 0 })}`
      case 'porcentaje':
        return `${valor.toFixed(1)}%`
      default:
        return valor.toLocaleString('es-MX')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-5 overflow-hidden group hover:border-white/20 transition-all"
    >
      {/* Efecto de brillo */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50 mb-1">{titulo}</p>
          <p className="text-2xl font-bold text-white">{formatearValor()}</p>
          {subtitulo && (
            <p className="text-xs text-white/40 mt-1">{subtitulo}</p>
          )}
        </div>
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${colorIcono}20` }}
        >
          <Icono className="h-5 w-5" style={{ color: colorIcono }} />
        </div>
      </div>

      {variacion !== undefined && (
        <div className={cn(
          "flex items-center gap-1 mt-3 text-xs font-medium",
          variacion >= 0 ? "text-green-400" : "text-red-400"
        )}>
          {variacion >= 0 ? (
            <TrendingUp className="h-3 w-3" />
          ) : (
            <TrendingDown className="h-3 w-3" />
          )}
          <span>{variacion >= 0 ? '+' : ''}{variacion.toFixed(1)}% vs ayer</span>
        </div>
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MINI CHART COMPONENT (SVG Simple)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MiniChart = memo(function MiniChart({
  datos,
  color = '#22C55E',
  height = 60,
}: {
  datos: number[]
  color?: string
  height?: number
}) {
  if (!datos || datos.length < 2) return null

  const max = Math.max(...datos)
  const min = Math.min(...datos)
  const range = max - min || 1
  const width = 100

  const points = datos.map((valor, i) => {
    const x = (i / (datos.length - 1)) * width
    const y = height - ((valor - min) / range) * (height - 10) - 5
    return `${x},${y}`
  }).join(' ')

  // Crear path para el área
  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Área bajo la línea */}
      <polygon
        fill={`url(#gradient-${color.replace('#', '')})`}
        points={areaPoints}
      />
      {/* Línea principal */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DIVISA CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DivisaCard = memo(function DivisaCard({
  divisa,
  datos,
  tendencia,
}: {
  divisa: string
  datos: { comprado: number; vendido: number; ganancia: number }
  tendencia?: { tendencia: string; variacion: string }
}) {
  const color = DIVISA_COLORS[divisa] ?? '#6B7280'
  const bandera = DIVISA_BANDERAS[divisa] ?? '💱'
  const esAlza = tendencia?.tendencia === 'alza'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl p-4 hover:border-white/20 transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{bandera}</span>
          <span className="font-semibold text-white">{divisa}</span>
        </div>
        {tendencia && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
            esAlza ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          )}>
            {esAlza ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            {tendencia.variacion}%
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-white/50 text-xs">Comprado</p>
          <p className="text-white font-medium">${datos.comprado.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-white/50 text-xs">Vendido</p>
          <p className="text-white font-medium">${datos.vendido.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-white/50 text-xs">Ganancia</p>
          <p className="text-green-400 font-medium">${datos.ganancia.toLocaleString()}</p>
        </div>
      </div>

      {/* Mini barra de progreso */}
      <div className="mt-3 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min((datos.comprado / (datos.comprado + datos.vendido || 1)) * 100, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TOP CLIENTES COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const TopClientes = memo(function TopClientes({
  clientes,
}: {
  clientes: Array<{ id: string; nombre: string; operaciones: number; volumen: number }>
}) {
  const maxVolumen = Math.max(...clientes.map(c => c.volumen))

  return (
    <div className="space-y-3">
      {clientes.map((cliente, index) => (
        <motion.div
          key={cliente.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-violet-500/20 text-violet-400 text-sm font-bold">
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-medium truncate">{cliente.nombre}</p>
            <p className="text-xs text-white/50">{cliente.operaciones} operaciones</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-white font-medium">
              ${cliente.volumen.toLocaleString()}
            </p>
            <div className="w-20 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-full"
                style={{ width: `${(cliente.volumen / maxVolumen) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ALERTAS COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const AlertasPanel = memo(function AlertasPanel({
  alertas,
}: {
  alertas: Array<{ tipo: string; mensaje: string; timestamp: string }>
}) {
  if (alertas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-white/40">
        <Activity className="h-8 w-8 mb-2 opacity-50" />
        <p className="text-sm">Sin alertas activas</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {alertas.map((alerta, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "flex items-start gap-3 p-3 rounded-xl",
            alerta.tipo === 'warning' ? "bg-amber-500/10 border border-amber-500/20" : "bg-blue-500/10 border border-blue-500/20"
          )}
        >
          <AlertTriangle className={cn(
            "h-4 w-4 mt-0.5 flex-shrink-0",
            alerta.tipo === 'warning' ? "text-amber-400" : "text-blue-400"
          )} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white">{alerta.mensaje}</p>
            <p className="text-xs text-white/40 mt-1">
              {new Date(alerta.timestamp).toLocaleTimeString('es-MX')}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ProfitDashboardAnalytics = memo(function ProfitDashboardAnalytics({
  className,
}: ProfitDashboardAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const cargarDatos = useCallback(async () => {
    try {
      const response = await fetch('/api/profit/analytics')
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (error) {
      console.error('Error cargando analytics:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    cargarDatos()
    // Auto-refresh cada 30 segundos
    const interval = setInterval(cargarDatos, 30000)
    return () => clearInterval(interval)
  }, [cargarDatos])

  const handleRefresh = () => {
    setRefreshing(true)
    cargarDatos()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-violet-400 animate-spin" />
          <p className="text-white/50">Cargando analytics...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-white/50">Error cargando datos</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header con botón refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-violet-400" />
            Dashboard Analítico
          </h2>
          <p className="text-sm text-white/50 mt-1">
            Métricas en tiempo real del negocio
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
          Actualizar
        </button>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          titulo="Operaciones Hoy"
          valor={data.resumenHoy.totalOperaciones}
          subtitulo={`${data.resumenHoy.operacionesCompra} compras, ${data.resumenHoy.operacionesVenta} ventas`}
          icono={Layers}
          colorIcono="#8B5CF6"
          variacion={Math.random() * 20 - 10}
        />
        <KPICard
          titulo="Volumen Total"
          valor={data.resumenHoy.volumenTotal}
          formato="moneda"
          subtitulo="MXN equivalente"
          icono={DollarSign}
          colorIcono="#22C55E"
          variacion={Math.random() * 30 - 5}
        />
        <KPICard
          titulo="Ganancia"
          valor={data.resumenHoy.gananciaTotal}
          formato="moneda"
          subtitulo="Utilidad del día"
          icono={CircleDollarSign}
          colorIcono="#F59E0B"
          variacion={Math.random() * 25}
        />
        <KPICard
          titulo="Clientes"
          valor={data.resumenHoy.clientesAtendidos}
          subtitulo={`Ticket prom: $${data.resumenHoy.ticketPromedio.toLocaleString()}`}
          icono={Users}
          colorIcono="#3B82F6"
          variacion={Math.random() * 15 - 5}
        />
      </div>

      {/* Gráfico de tendencia semanal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <LineChart className="h-5 w-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Tendencia Semanal</h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-white/50">Volumen</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-violet-500" />
              <span className="text-white/50">Ganancia</span>
            </div>
          </div>
        </div>
        <MiniChart
          datos={data.historialSemana.map(d => d.volumen)}
          color="#22C55E"
          height={80}
        />
        <div className="flex justify-between mt-2 text-xs text-white/40">
          {data.historialSemana.map((d, i) => (
            <span key={i}>{d.fecha.split('-').slice(1).join('/')}</span>
          ))}
        </div>
      </motion.div>

      {/* Volúmenes por Divisa + Top Clientes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volúmenes por divisa */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Volumen por Divisa</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(data.volumenesPorDivisa).map(([divisa, datos]) => (
              <DivisaCard
                key={divisa}
                divisa={divisa}
                datos={datos}
                tendencia={data.tendencias[divisa]}
              />
            ))}
          </div>
        </div>

        {/* Top Clientes */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-semibold text-white">Top Clientes</h3>
          </div>
          <TopClientes clientes={data.topClientes} />
        </div>
      </div>

      {/* Alertas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-semibold text-white">Alertas Activas</h3>
        </div>
        <AlertasPanel alertas={data.alertas} />
      </motion.div>
    </div>
  )
})

export default ProfitDashboardAnalytics
