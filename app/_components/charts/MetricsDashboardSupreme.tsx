/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS INFINITY 2026 — DASHBOARD DE MÉTRICAS SUPREMO CON RECHARTS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Dashboard de métricas avanzado con:
 * - Gráficos interactivos con Recharts
 * - Múltiples tipos de visualización
 * - Datos en tiempo real
 * - Tooltips personalizados
 * - Animaciones fluidas
 * - Responsive design
 * - Modo oscuro optimizado
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Treemap,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Users,
  ShoppingCart,
  Package,
  CreditCard,
  RefreshCw,
  Filter,
  Download,
  Maximize2,
  Settings,
  Calendar,
  BarChart3,
  PieChartIcon,
  LineChartIcon,
  Layers,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type TipoGrafico = 'area' | 'bar' | 'line' | 'pie' | 'composed' | 'radial' | 'treemap'
export type PeriodoTiempo = 'hoy' | 'semana' | 'mes' | 'trimestre' | 'año' | 'personalizado'

export interface DatoMetrica {
  fecha: string
  valor: number
  valorAnterior?: number
  categoria?: string
  desglose?: Record<string, number>
}

export interface ConfiguracionGrafico {
  tipo: TipoGrafico
  titulo: string
  subtitulo?: string
  colores?: string[]
  mostrarLeyenda?: boolean
  mostrarGrid?: boolean
  animado?: boolean
  interactivo?: boolean
  altura?: number
}

export interface MetricaDashboard {
  id: string
  nombre: string
  valor: number
  valorAnterior: number
  unidad: 'moneda' | 'numero' | 'porcentaje'
  tendencia: 'up' | 'down' | 'neutral'
  icono: React.ElementType
  color: string
  datos: DatoMetrica[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COLORES Y ESTILOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const COLORES_PRIMARIOS = [
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#6366F1', // Indigo
]

const COLORES_GRADIENTE = {
  violet: ['#8B5CF6', '#7C3AED', '#6D28D9'],
  emerald: ['#10B981', '#059669', '#047857'],
  cyan: ['#06B6D4', '#0891B2', '#0E7490'],
  amber: ['#F59E0B', '#D97706', '#B45309'],
  red: ['#EF4444', '#DC2626', '#B91C1C'],
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TOOLTIP PERSONALIZADO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    name: string
    color: string
    dataKey: string
  }>
  label?: string
  unidad?: 'moneda' | 'numero' | 'porcentaje'
}

function CustomTooltip({ active, payload, label, unidad = 'numero' }: CustomTooltipProps) {
  if (!active || !payload?.length) return null

  const formatearValor = (valor: number) => {
    switch (unidad) {
      case 'moneda':
        return `$${valor.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
      case 'porcentaje':
        return `${valor.toFixed(1)}%`
      default:
        return valor.toLocaleString('es-MX')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 shadow-2xl"
    >
      <p className="text-slate-400 text-sm mb-2">{label}</p>
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-white font-medium">{formatearValor(item.value)}</span>
          {item.name && <span className="text-slate-500 text-xs">({item.name})</span>}
        </div>
      ))}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES DE GRÁFICOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface GraficoAreaProps {
  datos: DatoMetrica[]
  colores?: string[]
  altura?: number
  mostrarGrid?: boolean
  unidad?: 'moneda' | 'numero' | 'porcentaje'
  gradiente?: boolean
}

function GraficoArea({
  datos,
  colores = COLORES_PRIMARIOS,
  altura = 300,
  mostrarGrid = true,
  unidad = 'numero',
  gradiente = true,
}: GraficoAreaProps) {
  const gradientId = useMemo(() => `gradient-${Math.random().toString(36).substr(2, 9)}`, [])

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <AreaChart data={datos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={colores[0]} stopOpacity={0.3} />
            <stop offset="95%" stopColor={colores[0]} stopOpacity={0} />
          </linearGradient>
        </defs>
        {mostrarGrid && (
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
        )}
        <XAxis
          dataKey="fecha"
          stroke="#6B7280"
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          axisLine={{ stroke: '#374151' }}
        />
        <YAxis
          stroke="#6B7280"
          tick={{ fill: '#9CA3AF', fontSize: 12 }}
          axisLine={{ stroke: '#374151' }}
          tickFormatter={(value) =>
            unidad === 'moneda'
              ? `$${(value / 1000).toFixed(0)}k`
              : value.toLocaleString()
          }
        />
        <Tooltip content={<CustomTooltip unidad={unidad} />} />
        <Area
          type="monotone"
          dataKey="valor"
          stroke={colores[0]}
          strokeWidth={2}
          fill={gradiente ? `url(#${gradientId})` : colores[0]}
          fillOpacity={gradiente ? 1 : 0.2}
          animationDuration={1000}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface GraficoBarrasProps {
  datos: DatoMetrica[]
  colores?: string[]
  altura?: number
  apilado?: boolean
  horizontal?: boolean
  unidad?: 'moneda' | 'numero' | 'porcentaje'
}

function GraficoBarras({
  datos,
  colores = COLORES_PRIMARIOS,
  altura = 300,
  apilado = false,
  horizontal = false,
  unidad = 'numero',
}: GraficoBarrasProps) {
  const Chart = horizontal ? BarChart : BarChart

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <Chart
        data={datos}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 10, right: 10, left: horizontal ? 60 : 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        {horizontal ? (
          <>
            <XAxis type="number" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis
              dataKey="fecha"
              type="category"
              stroke="#6B7280"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
          </>
        ) : (
          <>
            <XAxis dataKey="fecha" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
            <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
          </>
        )}
        <Tooltip content={<CustomTooltip unidad={unidad} />} />
        <Bar
          dataKey="valor"
          fill={colores[0]}
          radius={[4, 4, 0, 0]}
          animationDuration={800}
        />
        {apilado && datos[0]?.valorAnterior !== undefined && (
          <Bar
            dataKey="valorAnterior"
            fill={colores[1]}
            radius={[4, 4, 0, 0]}
            animationDuration={800}
          />
        )}
      </Chart>
    </ResponsiveContainer>
  )
}

interface GraficoLineaProps {
  datos: DatoMetrica[]
  colores?: string[]
  altura?: number
  multiLinea?: boolean
  unidad?: 'moneda' | 'numero' | 'porcentaje'
}

function GraficoLinea({
  datos,
  colores = COLORES_PRIMARIOS,
  altura = 300,
  multiLinea = false,
  unidad = 'numero',
}: GraficoLineaProps) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <LineChart data={datos} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis dataKey="fecha" stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
        <YAxis stroke="#6B7280" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
        <Tooltip content={<CustomTooltip unidad={unidad} />} />
        <Line
          type="monotone"
          dataKey="valor"
          stroke={colores[0]}
          strokeWidth={2}
          dot={{ fill: colores[0], strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, fill: colores[0] }}
          animationDuration={1000}
        />
        {multiLinea && datos[0]?.valorAnterior !== undefined && (
          <Line
            type="monotone"
            dataKey="valorAnterior"
            stroke={colores[1]}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ fill: colores[1], strokeWidth: 2, r: 3 }}
            animationDuration={1000}
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}

interface GraficoPieProps {
  datos: { nombre: string; valor: number; color?: string }[]
  altura?: number
  donut?: boolean
  mostrarLabels?: boolean
}

function GraficoPie({
  datos,
  altura = 300,
  donut = true,
  mostrarLabels = true,
}: GraficoPieProps) {
  const datosConColor = datos.map((d, i) => ({
    ...d,
    color: d.color || COLORES_PRIMARIOS[i % COLORES_PRIMARIOS.length],
  }))

  return (
    <ResponsiveContainer width="100%" height={altura}>
      <PieChart>
        <Pie
          data={datosConColor}
          cx="50%"
          cy="50%"
          innerRadius={donut ? 60 : 0}
          outerRadius={80}
          paddingAngle={2}
          dataKey="valor"
          animationDuration={800}
          label={
            mostrarLabels
              ? ({ nombre, percent }) => `${nombre} (${(percent * 100).toFixed(0)}%)`
              : undefined
          }
          labelLine={mostrarLabels}
        >
          {datosConColor.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3">
                <p className="text-white font-medium">
                  {payload[0].name}: {payload[0].value?.toLocaleString()}
                </p>
              </div>
            ) : null
          }
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface GraficoRadialProps {
  datos: { nombre: string; valor: number; fill: string }[]
  altura?: number
}

function GraficoRadial({ datos, altura = 300 }: GraficoRadialProps) {
  return (
    <ResponsiveContainer width="100%" height={altura}>
      <RadialBarChart
        cx="50%"
        cy="50%"
        innerRadius="20%"
        outerRadius="90%"
        data={datos}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar
          background
          dataKey="valor"
          cornerRadius={10}
          animationDuration={1000}
        />
        <Legend
          iconSize={10}
          layout="horizontal"
          verticalAlign="bottom"
          formatter={(value) => <span className="text-slate-300 text-sm">{value}</span>}
        />
        <Tooltip
          content={({ active, payload }) =>
            active && payload?.length ? (
              <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-xl p-3">
                <p className="text-white font-medium">
                  {payload[0].payload.nombre}: {payload[0].value}%
                </p>
              </div>
            ) : null
          }
        />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MetricsDashboardSupremeProps {
  metricas?: MetricaDashboard[]
  titulo?: string
  periodo?: PeriodoTiempo
  onPeriodoChange?: (periodo: PeriodoTiempo) => void
  cargando?: boolean
  className?: string
}

export default function MetricsDashboardSupreme({
  metricas: metricasExternas,
  titulo = 'Dashboard de Métricas',
  periodo: periodoExterno,
  onPeriodoChange,
  cargando = false,
  className,
}: MetricsDashboardSupremeProps) {
  const [periodo, setPeriodo] = useState<PeriodoTiempo>(periodoExterno || 'mes')
  const [vistaActiva, setVistaActiva] = useState<'general' | 'detalle'>('general')

  // Datos de ejemplo si no se proporcionan
  const metricas: MetricaDashboard[] = useMemo(() => {
    if (metricasExternas) return metricasExternas

    const generarDatos = (base: number, varianza: number) => {
      return Array.from({ length: 12 }, (_, i) => ({
        fecha: new Date(2026, i, 1).toLocaleDateString('es-MX', { month: 'short' }),
        valor: base + Math.random() * varianza - varianza / 2,
        valorAnterior: base * 0.9 + Math.random() * varianza - varianza / 2,
      }))
    }

    return [
      {
        id: 'ventas',
        nombre: 'Ventas Totales',
        valor: 1250000,
        valorAnterior: 1150000,
        unidad: 'moneda',
        tendencia: 'up',
        icono: ShoppingCart,
        color: '#10B981',
        datos: generarDatos(100000, 30000),
      },
      {
        id: 'clientes',
        nombre: 'Clientes Activos',
        valor: 847,
        valorAnterior: 792,
        unidad: 'numero',
        tendencia: 'up',
        icono: Users,
        color: '#8B5CF6',
        datos: generarDatos(70, 15),
      },
      {
        id: 'ordenes',
        nombre: 'Órdenes',
        valor: 1234,
        valorAnterior: 1189,
        unidad: 'numero',
        tendencia: 'up',
        icono: Package,
        color: '#06B6D4',
        datos: generarDatos(100, 25),
      },
      {
        id: 'rentabilidad',
        nombre: 'Rentabilidad',
        valor: 23.5,
        valorAnterior: 21.8,
        unidad: 'porcentaje',
        tendencia: 'up',
        icono: TrendingUp,
        color: '#F59E0B',
        datos: generarDatos(22, 5),
      },
    ]
  }, [metricasExternas])

  const datosPie = useMemo(
    () => [
      { nombre: 'Ventas Online', valor: 45, color: '#8B5CF6' },
      { nombre: 'Ventas Presencial', valor: 30, color: '#10B981' },
      { nombre: 'Distribuidores', valor: 15, color: '#06B6D4' },
      { nombre: 'Otros', valor: 10, color: '#F59E0B' },
    ],
    []
  )

  const datosRadial = useMemo(
    () => [
      { nombre: 'Meta Ventas', valor: 85, fill: '#10B981' },
      { nombre: 'Meta Clientes', valor: 72, fill: '#8B5CF6' },
      { nombre: 'Meta Rentabilidad', valor: 95, fill: '#06B6D4' },
    ],
    []
  )

  const handlePeriodoChange = useCallback(
    (nuevoPeriodo: PeriodoTiempo) => {
      setPeriodo(nuevoPeriodo)
      onPeriodoChange?.(nuevoPeriodo)
    },
    [onPeriodoChange]
  )

  const formatearValor = (valor: number, unidad: MetricaDashboard['unidad']) => {
    switch (unidad) {
      case 'moneda':
        return `$${valor.toLocaleString('es-MX')}`
      case 'porcentaje':
        return `${valor.toFixed(1)}%`
      default:
        return valor.toLocaleString('es-MX')
    }
  }

  const calcularCambio = (actual: number, anterior: number) => {
    if (anterior === 0) return 0
    return ((actual - anterior) / anterior) * 100
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-violet-400" />
            {titulo}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Análisis detallado de métricas y rendimiento
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={periodo} onValueChange={(v) => handlePeriodoChange(v as PeriodoTiempo)}>
            <SelectTrigger className="w-40 bg-slate-800 border-slate-700">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mes</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="año">Este Año</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="icon" className="border-slate-700">
            <RefreshCw className={cn('w-4 h-4', cargando && 'animate-spin')} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-slate-700">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-900 border-slate-700">
              <DropdownMenuItem>PDF</DropdownMenuItem>
              <DropdownMenuItem>Excel</DropdownMenuItem>
              <DropdownMenuItem>CSV</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((metrica, idx) => {
          const cambio = calcularCambio(metrica.valor, metrica.valorAnterior)
          const IconoMetrica = metrica.icono

          return (
            <motion.div
              key={metrica.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-400">{metrica.nombre}</p>
                      <p className="text-2xl font-bold text-white">
                        {formatearValor(metrica.valor, metrica.unidad)}
                      </p>
                      <Badge
                        className={cn(
                          'text-xs',
                          cambio >= 0
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/20 text-red-400'
                        )}
                      >
                        {cambio >= 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {cambio >= 0 ? '+' : ''}
                        {cambio.toFixed(1)}%
                      </Badge>
                    </div>
                    <div
                      className="p-3 rounded-xl"
                      style={{ backgroundColor: `${metrica.color}20` }}
                    >
                      <IconoMetrica className="w-6 h-6" style={{ color: metrica.color }} />
                    </div>
                  </div>

                  {/* Mini Sparkline */}
                  <div className="mt-4 h-12">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={metrica.datos.slice(-7)}>
                        <defs>
                          <linearGradient
                            id={`mini-gradient-${metrica.id}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="5%" stopColor={metrica.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={metrica.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="valor"
                          stroke={metrica.color}
                          strokeWidth={2}
                          fill={`url(#mini-gradient-${metrica.id})`}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* Gráficos Principales */}
      <Tabs defaultValue="tendencias" className="space-y-4">
        <TabsList className="bg-slate-800/50 p-1">
          <TabsTrigger value="tendencias" className="data-[state=active]:bg-violet-600">
            <LineChartIcon className="w-4 h-4 mr-2" />
            Tendencias
          </TabsTrigger>
          <TabsTrigger value="comparativas" className="data-[state=active]:bg-violet-600">
            <BarChart3 className="w-4 h-4 mr-2" />
            Comparativas
          </TabsTrigger>
          <TabsTrigger value="distribucion" className="data-[state=active]:bg-violet-600">
            <PieChartIcon className="w-4 h-4 mr-2" />
            Distribución
          </TabsTrigger>
          <TabsTrigger value="objetivos" className="data-[state=active]:bg-violet-600">
            <Layers className="w-4 h-4 mr-2" />
            Objetivos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tendencias">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Evolución de Ventas</CardTitle>
                <CardDescription>Comparativa con período anterior</CardDescription>
              </CardHeader>
              <CardContent>
                <GraficoArea
                  datos={metricas[0]?.datos || []}
                  colores={['#10B981', '#06B6D4']}
                  unidad="moneda"
                />
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Crecimiento de Clientes</CardTitle>
                <CardDescription>Nuevos clientes por mes</CardDescription>
              </CardHeader>
              <CardContent>
                <GraficoLinea
                  datos={metricas[1]?.datos || []}
                  colores={['#8B5CF6', '#EC4899']}
                  multiLinea
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparativas">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Órdenes por Categoría</CardTitle>
                <CardDescription>Distribución mensual</CardDescription>
              </CardHeader>
              <CardContent>
                <GraficoBarras
                  datos={metricas[2]?.datos || []}
                  colores={['#06B6D4', '#F59E0B']}
                  apilado
                />
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Rentabilidad Mensual</CardTitle>
                <CardDescription>Margen de ganancia</CardDescription>
              </CardHeader>
              <CardContent>
                <GraficoBarras
                  datos={metricas[3]?.datos || []}
                  colores={['#F59E0B']}
                  unidad="porcentaje"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="distribucion">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Canales de Venta</CardTitle>
                <CardDescription>Distribución de ingresos</CardDescription>
              </CardHeader>
              <CardContent>
                <GraficoPie datos={datosPie} donut />
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Top Productos</CardTitle>
                <CardDescription>Por volumen de ventas</CardDescription>
              </CardHeader>
              <CardContent>
                <GraficoBarras
                  datos={[
                    { fecha: 'Producto A', valor: 450 },
                    { fecha: 'Producto B', valor: 380 },
                    { fecha: 'Producto C', valor: 290 },
                    { fecha: 'Producto D', valor: 220 },
                    { fecha: 'Producto E', valor: 180 },
                  ]}
                  colores={['#8B5CF6']}
                  horizontal
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="objetivos">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Progreso de Metas</CardTitle>
                <CardDescription>Cumplimiento de objetivos</CardDescription>
              </CardHeader>
              <CardContent>
                <GraficoRadial datos={datosRadial} altura={350} />
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Proyección Anual</CardTitle>
                <CardDescription>Estimación basada en tendencias</CardDescription>
              </CardHeader>
              <CardContent>
                <GraficoArea
                  datos={[
                    { fecha: 'Ene', valor: 120000 },
                    { fecha: 'Feb', valor: 135000 },
                    { fecha: 'Mar', valor: 148000 },
                    { fecha: 'Abr', valor: 162000 },
                    { fecha: 'May', valor: 175000 },
                    { fecha: 'Jun', valor: 185000 },
                    { fecha: 'Jul', valor: 198000 },
                    { fecha: 'Ago', valor: 210000 },
                    { fecha: 'Sep', valor: 225000 },
                    { fecha: 'Oct', valor: 240000 },
                    { fecha: 'Nov', valor: 255000 },
                    { fecha: 'Dic', valor: 275000 },
                  ]}
                  colores={['#8B5CF6']}
                  unidad="moneda"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Export sub-components
export {
  GraficoArea,
  GraficoBarras,
  GraficoLinea,
  GraficoPie,
  GraficoRadial,
  CustomTooltip,
  COLORES_PRIMARIOS,
  COLORES_GRADIENTE,
}
