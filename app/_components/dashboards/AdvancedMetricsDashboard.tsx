/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS INFINITY 2026 — DASHBOARD DE MÉTRICAS AVANZADO
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Dashboard de métricas ultra-interactivo con:
 * - Gráficos Recharts personalizados
 * - Actualización en tiempo real via WebSocket
 * - Métricas calculadas avanzadas
 * - Comparativas temporales
 * - Exportación de datos
 * - Filtros dinámicos
 * - Responsive y optimizado
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import {
    Activity,
    BarChart3,
    DollarSign,
    Download,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Users
} from 'lucide-react'
import { motion } from 'motion/react'
import React, { useMemo, useState } from 'react'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  subtitle?: string
}

interface ChartData {
  timestamp: number
  value?: number
  label?: string
  [key: string]: any
}

type TimeRange = '1h' | '24h' | '7d' | '30d' | '1y' | 'all'

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: MetricCard
// ═══════════════════════════════════════════════════════════════════════════════════════

function MetricCard({ title, value, change, icon, trend = 'neutral', subtitle }: MetricCardProps) {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-white/60',
  }

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10',
        'bg-gradient-to-br from-white/[0.05] to-white/[0.02]',
        'backdrop-blur-xl p-6 transition-all',
        'hover:border-white/20 hover:shadow-lg hover:shadow-purple-500/10'
      )}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-purple-400">
            {icon}
          </div>
          {change !== undefined && (
            <div className={cn('flex items-center gap-1 text-sm font-semibold', trendColors[trend])}>
              <TrendIcon className="h-4 w-4" />
              <span>{change > 0 ? '+' : ''}{change}%</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/60">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-white/40">{subtitle}</p>}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: CustomTooltip
// ═══════════════════════════════════════════════════════════════════════════════════════

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-lg border border-white/10 bg-black/90 p-3 backdrop-blur-xl shadow-xl"
    >
      <p className="mb-2 text-xs text-white/60">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/80">{entry.name}:</span>
          <span className="font-semibold text-white">{entry.value.toLocaleString()}</span>
        </div>
      ))}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: RealtimeLineChart
// ═══════════════════════════════════════════════════════════════════════════════════════

interface RealtimeLineChartProps {
  title: string
  data: ChartData[]
  dataKey: string
  color?: string
  height?: number
}

function RealtimeLineChart({
  title,
  data,
  dataKey,
  color = '#a855f7',
  height = 300,
}: RealtimeLineChartProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <Activity className="h-5 w-5 text-purple-400" />
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="label"
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#gradient-${dataKey})`}
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: AdvancedBarChart
// ═══════════════════════════════════════════════════════════════════════════════════════

interface AdvancedBarChartProps {
  title: string
  data: ChartData[]
  dataKeys: { key: string; color: string; name: string }[]
  height?: number
}

function AdvancedBarChart({ title, data, dataKeys, height = 300 }: AdvancedBarChartProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <BarChart3 className="h-5 w-5 text-purple-400" />
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="label"
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="rgba(255,255,255,0.3)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}
          />
          {dataKeys.map((key) => (
            <Bar
              key={key.key}
              dataKey={key.key}
              name={key.name}
              fill={key.color}
              radius={[8, 8, 0, 0]}
              animationDuration={300}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: DonutChart
// ═══════════════════════════════════════════════════════════════════════════════════════

interface DonutChartProps {
  title: string
  data: { name: string; value: number; color: string }[]
  height?: number
}

function DonutChart({ title, data, height = 300 }: DonutChartProps) {
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data])

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      
      <div className="flex items-center gap-8">
        <ResponsiveContainer width="50%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="80%"
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-white/80">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{item.value.toLocaleString()}</p>
                <p className="text-xs text-white/40">
                  {((item.value / total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: AdvancedMetricsDashboard
// ═══════════════════════════════════════════════════════════════════════════════════════

export function AdvancedMetricsDashboard() {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Datos simulados (reemplazar con datos reales)
  const revenueData = useMemo(() => {
    const data: ChartData[] = []
    for (let i = 0; i < 24; i++) {
      data.push({
        timestamp: Date.now() - (24 - i) * 3600000,
        value: Math.random() * 10000 + 5000,
        label: `${i}:00`,
      })
    }
    return data
  }, [timeRange])

  const transactionData = useMemo(() => [
    { name: 'Compras', value: 4567, color: '#a855f7' },
    { name: 'Ventas', value: 3245, color: '#ec4899' },
    { name: 'Transfers', value: 2134, color: '#3b82f6' },
    { name: 'Otros', value: 876, color: '#f59e0b' },
  ], [])

  const performanceData = useMemo(() => {
    const data: ChartData[] = []
    const categories = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
    for (const cat of categories) {
      data.push({
        timestamp: Date.now(),
        label: cat,
        ingresos: Math.random() * 50000 + 20000,
        gastos: Math.random() * 30000 + 10000,
        utilidad: Math.random() * 20000 + 5000,
      })
    }
    return data
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard de Métricas</h2>
          <p className="text-sm text-white/60">Análisis en tiempo real de tu negocio</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Selector */}
          <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
            {(['1h', '24h', '7d', '30d', '1y'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                  timeRange === range
                    ? 'bg-white/10 text-white'
                    : 'text-white/60 hover:text-white/80'
                )}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:border-white/20 disabled:opacity-50"
          >
            <RefreshCw className={cn('h-5 w-5', isRefreshing && 'animate-spin')} />
          </button>

          <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition-all hover:bg-white/10 hover:border-white/20">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ingresos Totales"
          value="$125,430"
          change={12.5}
          trend="up"
          subtitle="vs. mes anterior"
          icon={<DollarSign className="h-6 w-6" />}
        />
        <MetricCard
          title="Usuarios Activos"
          value="8,234"
          change={8.2}
          trend="up"
          subtitle="+324 esta semana"
          icon={<Users className="h-6 w-6" />}
        />
        <MetricCard
          title="Transacciones"
          value="10,892"
          change={-3.1}
          trend="down"
          subtitle="últimas 24h"
          icon={<Activity className="h-6 w-6" />}
        />
        <MetricCard
          title="Tasa de Conversión"
          value="4.32%"
          change={1.8}
          trend="up"
          subtitle="objetivo: 5%"
          icon={<TrendingUp className="h-6 w-6" />}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RealtimeLineChart
          title="Ingresos en Tiempo Real"
          data={revenueData}
          dataKey="value"
          color="#a855f7"
        />

        <DonutChart
          title="Distribución de Transacciones"
          data={transactionData}
        />
      </div>

      {/* Full Width Chart */}
      <AdvancedBarChart
        title="Rendimiento Mensual"
        data={performanceData}
        dataKeys={[
          { key: 'ingresos', color: '#10b981', name: 'Ingresos' },
          { key: 'gastos', color: '#ef4444', name: 'Gastos' },
          { key: 'utilidad', color: '#a855f7', name: 'Utilidad' },
        ]}
        height={350}
      />
    </div>
  )
}
