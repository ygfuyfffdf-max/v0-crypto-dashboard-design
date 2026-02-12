'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 QUANTUM CHARTS — CHRONOS INFINITY 2026 PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de charts premium con:
 * ✅ Recharts para gráficos 2D optimizados
 * ✅ TanStack Query para data fetching
 * ✅ Framer Motion para animaciones
 * ✅ Glassmorphism GEN5 styling
 * ✅ Tooltips premium informativos
 * ✅ Responsive y mobile-ready
 * ✅ Error handling con fallbacks
 *
 * Incluye:
 * - LineChartPremium: Ventas vs tiempo con forecast
 * - BarChartPremium: Top productos/distribuidores
 * - AreaChartPremium: Evolución de capital
 * - PieChartPremium: Distribución de ingresos
 * - GaugePremium: Stock crítico / KPIs
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { useQuery } from '@tanstack/react-query'
import {
    AlertCircle,
    BarChart3,
    Loader2,
    TrendingUp,
} from 'lucide-react'
import { motion } from 'motion/react'
import React, { useMemo } from 'react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    RadialBar,
    RadialBarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ChartContainerProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  isLoading?: boolean
  error?: Error | null
  children: React.ReactNode
  className?: string
}

function ChartContainer({ title, subtitle, icon, isLoading, error, children, className }: ChartContainerProps) {
  if (error) {
    return (
      <div className={cn('rounded-2xl border border-red-500/20 bg-red-500/5 p-6', className)}>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="mb-3 h-10 w-10 text-red-400" />
          <p className="text-sm text-red-400">Error al cargar datos</p>
          <p className="text-xs text-red-400/60">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl',
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.005 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20">
              {icon}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
      ) : (
        children
      )}
    </motion.div>
  )
}

// Custom tooltip
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>
  label?: string
  formatter?: (value: number) => string
}

function CustomTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-white/10 bg-gray-900/95 p-3 shadow-xl backdrop-blur-xl"
    >
      {label && <p className="mb-2 text-xs font-medium text-white/70">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-xs text-white/60">{entry.name}:</span>
            <span className="text-xs font-semibold text-white">
              {formatter ? formatter(entry.value) : `$${entry.value.toLocaleString()}`}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LINE CHART — Ventas vs Tiempo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LineChartData {
  fecha: string
  ventas: number
  forecast?: number
  margen?: number
}

interface LineChartVentasProps {
  className?: string
}

export function LineChartVentas({ className }: LineChartVentasProps) {
  const { data, isLoading, error } = useQuery<LineChartData[]>({
    queryKey: ['chart-ventas-tiempo'],
    queryFn: async () => {
      const { getVentas } = await import('@/app/_actions/ventas')
      const result = await getVentas(100)
      if (!result.success) throw new Error(result.error)

      // Agregar por fecha
      const ventasByDate: Record<string, { ventas: number; count: number }> = {}

      for (const venta of result.data as Array<{ fecha: Date | number; precioTotalVenta: number }>) {
        const fecha = venta.fecha instanceof Date
          ? venta.fecha.toISOString().slice(0, 10)
          : new Date(typeof venta.fecha === 'number' ? venta.fecha * 1000 : 0).toISOString().slice(0, 10)

        if (!ventasByDate[fecha]) {
          ventasByDate[fecha] = { ventas: 0, count: 0 }
        }
        ventasByDate[fecha].ventas += venta.precioTotalVenta
        ventasByDate[fecha].count++
      }

      // Convertir a array ordenado
      const chartData = Object.entries(ventasByDate)
        .map(([fecha, data]) => ({
          fecha: fecha.slice(5), // MM-DD
          ventas: Math.round(data.ventas),
        }))
        .sort((a, b) => a.fecha.localeCompare(b.fecha))
        .slice(-14) // Últimos 14 días

      // Agregar forecast simple (promedio + tendencia)
      if (chartData.length > 3) {
        const lastThree = chartData.slice(-3)
        const avg = lastThree.reduce((s, d) => s + d.ventas, 0) / 3
        const first = lastThree[0]
        const last = lastThree[2]
        let trendValue = 0
        if (first && last) {
          const firstVal = Number(first.ventas)
          const lastVal = Number(last.ventas)
          trendValue = (lastVal - firstVal) / 2
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (chartData as any[]).push({
          fecha: 'Proyec.',
          ventas: 0,
          forecast: Math.round(avg + trendValue),
        })
      }

      return chartData
    },
    staleTime: 5 * 60 * 1000,
  })

  return (
    <ChartContainer
      title="Ventas vs Tiempo"
      subtitle="Últimos 14 días + proyección"
      icon={<TrendingUp className="h-5 w-5 text-emerald-400" />}
      isLoading={isLoading}
      error={error as Error | null}
      className={className}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data || []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="fecha"
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="ventas"
              name="Ventas"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', r: 4 }}
              activeDot={{ r: 6, fill: '#A78BFA' }}
            />
            <Line
              type="monotone"
              dataKey="forecast"
              name="Proyección"
              stroke="#FBBF24"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ fill: '#FBBF24', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BAR CHART — Top Productos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface BarChartData {
  nombre: string
  ventas: number
  ganancia: number
  margen: number
}

interface BarChartTopProductosProps {
  className?: string
}

export function BarChartTopProductos({ className }: BarChartTopProductosProps) {
  const { data, isLoading, error } = useQuery<BarChartData[]>({
    queryKey: ['chart-top-productos'],
    queryFn: async () => {
      const { getProductos } = await import('@/app/_actions/almacen')
      const result = await getProductos(20)
      if (!result.success) throw new Error(result.error)

      return (result.data as Array<{ nombre: string; ventasTotales: number; gananciaTotal: number; margenBruto: number }>)
        .map(p => ({
          nombre: p.nombre.slice(0, 15) + (p.nombre.length > 15 ? '...' : ''),
          ventas: p.ventasTotales || 0,
          ganancia: p.gananciaTotal || 0,
          margen: p.margenBruto || 0,
        }))
        .sort((a, b) => b.ventas - a.ventas)
        .slice(0, 5)
    },
    staleTime: 5 * 60 * 1000,
  })

  return (
    <ChartContainer
      title="Top Productos"
      subtitle="Por volumen de ventas"
      icon={<BarChart3 className="h-5 w-5 text-cyan-400" />}
      isLoading={isLoading}
      error={error as Error | null}
      className={className}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data || []} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              type="number"
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              type="category"
              dataKey="nombre"
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="ventas" name="Ventas" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
            <Bar dataKey="ganancia" name="Ganancia" fill="#10B981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// AREA CHART — Evolución Capital
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AreaChartData {
  fecha: string
  capital: number
  ingresos: number
  gastos: number
}

interface AreaChartCapitalProps {
  bancoId?: string
  className?: string
}

export function AreaChartCapital({ bancoId, className }: AreaChartCapitalProps) {
  const { data, isLoading, error } = useQuery<AreaChartData[]>({
    queryKey: ['chart-capital-evolucion', bancoId],
    queryFn: async () => {
      const { getMovimientos } = await import('@/app/_actions/movimientos')
      const result = await getMovimientos({ bancoId, limit: 100 })
      if (!result.success) throw new Error(result.error)

      // Agrupar por fecha
      const byDate: Record<string, { ingresos: number; gastos: number }> = {}

      for (const mov of result.data as Array<{ fecha: Date | number; tipo: string; monto: number }>) {
        const fecha = mov.fecha instanceof Date
          ? mov.fecha.toISOString().slice(0, 10)
          : new Date(typeof mov.fecha === 'number' ? mov.fecha * 1000 : 0).toISOString().slice(0, 10)

        if (!byDate[fecha]) {
          byDate[fecha] = { ingresos: 0, gastos: 0 }
        }

        if (['ingreso', 'abono', 'transferencia_entrada'].includes(mov.tipo)) {
          byDate[fecha].ingresos += mov.monto
        } else {
          byDate[fecha].gastos += mov.monto
        }
      }

      // Calcular capital acumulado
      let capital = 0
      return Object.entries(byDate)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .slice(-14)
        .map(([fecha, data]) => {
          capital += data.ingresos - data.gastos
          return {
            fecha: fecha.slice(5),
            capital: Math.round(capital),
            ingresos: Math.round(data.ingresos),
            gastos: Math.round(data.gastos),
          }
        })
    },
    staleTime: 5 * 60 * 1000,
  })

  return (
    <ChartContainer
      title="Evolución de Capital"
      subtitle="Últimos 14 días"
      icon={<TrendingUp className="h-5 w-5 text-violet-400" />}
      isLoading={isLoading}
      error={error as Error | null}
      className={className}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data || []} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorCapital" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="fecha"
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.4)"
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="capital"
              name="Capital"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="url(#colorCapital)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PIE CHART — Distribución Bancos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface PieChartData {
  name: string
  value: number
  color: string
}

interface PieChartBancosProps {
  className?: string
}

export function PieChartBancos({ className }: PieChartBancosProps) {
  const { data, isLoading, error } = useQuery<PieChartData[]>({
    queryKey: ['chart-bancos-distribucion'],
    queryFn: async () => {
      const { getBancos } = await import('@/app/_actions/bancos')
      const result = await getBancos()
      if (!result.success) throw new Error(result.error)

      return (result.data as Array<{ nombre: string; capitalActual: number; color: string }>)
        .filter(b => b.capitalActual > 0)
        .map(b => ({
          name: b.nombre,
          value: b.capitalActual,
          color: b.color || '#8B5CF6',
        }))
    },
    staleTime: 5 * 60 * 1000,
  })

  const total = useMemo(() =>
    (data || []).reduce((s, d) => s + d.value, 0)
  , [data])

  return (
    <ChartContainer
      title="Distribución por Banco"
      subtitle={`Total: $${total.toLocaleString()}`}
      isLoading={isLoading}
      error={error as Error | null}
      className={className}
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data || []}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={{ stroke: 'rgba(255,255,255,0.3)' }}
            >
              {(data || []).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => `$${value.toLocaleString()}`}
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GAUGE — Stock Crítico / KPI
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GaugeProps {
  value: number
  max: number
  title: string
  subtitle?: string
  color?: string
  warningThreshold?: number
  criticalThreshold?: number
  className?: string
}

export function GaugeChart({
  value,
  max,
  title,
  subtitle,
  color = '#8B5CF6',
  warningThreshold = 30,
  criticalThreshold = 15,
  className,
}: GaugeProps) {
  const percentage = (value / max) * 100

  const gaugeColor = percentage <= criticalThreshold
    ? '#EF4444'
    : percentage <= warningThreshold
    ? '#FBBF24'
    : color

  const data = [
    { name: 'value', value: percentage, fill: gaugeColor },
    { name: 'rest', value: 100 - percentage, fill: 'rgba(255,255,255,0.05)' },
  ]

  return (
    <motion.div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl',
        className,
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="relative h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="80%"
            innerRadius="80%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            data={data}
          >
            <RadialBar dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center value */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
          <span className="text-3xl font-bold tabular-nums" style={{ color: gaugeColor }}>
            {percentage.toFixed(0)}%
          </span>
          <span className="text-xs text-white/50">
            {value.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <h4 className="font-medium text-white">{title}</h4>
        {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    ChartContainer,
    CustomTooltip,
}
