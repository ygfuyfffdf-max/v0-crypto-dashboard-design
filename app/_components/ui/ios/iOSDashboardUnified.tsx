'use client'

import { 
  iOSPageLayout, 
  iOSGrid, 
  iOSSection, 
  iOSLoading,
  iOSEmptyState 
} from './iOSIntegrationWrapper'
import { 
  iOSMetricCard, 
  iOSInfoCard, 
  iOSActionCard 
} from './iOSPremiumCards'
import { useDashboardData } from '@/app/hooks/useDashboardData'
import { useBancosData, useMovimientosData } from '@/app/hooks/useDataHooks'
import { 
  SankeyChart,
  HeatmapChart,
  GaugeDualChart
} from '../../charts/Cosmic3DCharts'
import { 
  DollarSign, 
  Users, 
  Package, 
  ShoppingCart, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Wallet,
  ArrowRight,
  RefreshCw,
  Landmark,
  Truck
} from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

export function iOSDashboardUnified() {
  const router = useRouter()
  const { stats, activities, modules, loading, error, refetch } = useDashboardData()
  const { data: bancos } = useBancosData()
  const { data: movimientos } = useMovimientosData()

  // ═══════════════════════════════════════════════════════════════
  // CHART DATA PREPARATION
  // ═══════════════════════════════════════════════════════════════

  // 1. Sankey Data (Flows)
  const sankeyData = useMemo(() => {
    if (!bancos || !bancos.length) return { nodes: [], links: [] }

    const nodes = [
      { id: 'ingresos', label: 'Ingresos', value: 0, color: '#10B981' },
      ...bancos.map(b => ({ id: b.id, label: b.nombre, value: b.capitalActual, color: b.color || '#3B82F6' })),
      { id: 'gastos', label: 'Gastos', value: 0, color: '#EF4444' }
    ]

    const links: { source: string; target: string; value: number }[] = []

    bancos.forEach(b => {
      // Ingresos -> Banco (Mocked based on historical for now)
      if (b.historicoIngresos > 0) {
        links.push({ source: 'ingresos', target: b.id, value: b.historicoIngresos })
        nodes[0].value += b.historicoIngresos
      }
      // Banco -> Gastos
      if (b.historicoGastos > 0) {
        links.push({ source: b.id, target: 'gastos', value: b.historicoGastos })
        nodes[nodes.length - 1].value += b.historicoGastos
      }
    })

    return { nodes, links }
  }, [bancos])

  // 2. Heatmap Data (Activity)
  const heatmapData = useMemo(() => {
    // Mock heatmap data based on bancos for now (as we don't have historical daily breakdown in simple hooks)
    const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
    const banks = bancos ? bancos.slice(0, 5).map(b => b.nombre) : []
    const data: { x: number; y: number; value: number }[] = []

    banks.forEach((_, y) => {
      days.forEach((_, x) => {
        data.push({
          x,
          y,
          value: Math.floor(Math.random() * 5000) // Mock value
        })
      })
    })

    return { data, xLabels: days, yLabels: banks }
  }, [bancos])

  // Sparklines para Dashboard (Mock)
  const sparklines = useMemo(() => ({
    capital: Array.from({ length: 20 }, (_, i) => 100000 + i * 1000 + Math.random() * 5000),
    ventas: Array.from({ length: 20 }, () => 5000 + Math.random() * 2000),
    ganancia: Array.from({ length: 20 }, () => 1000 + Math.random() * 500)
  }), [])

  if (loading && !stats) {
    return (
      <iOSPageLayout title="Dashboard" showHeader={false}>
        <div className="h-[80vh] flex items-center justify-center">
          <iOSLoading text="Sincronizando datos financieros..." size="lg" variant="pulse" />
        </div>
      </iOSPageLayout>
    )
  }

  if (error) {
    return (
      <iOSPageLayout title="Error" showHeader={false}>
        <iOSEmptyState
          title="Error de sincronización"
          description="No se pudieron cargar los datos del dashboard. Verifique su conexión."
          action={{ label: 'Reintentar', onClick: refetch }}
          icon={AlertTriangle}
        />
      </iOSPageLayout>
    )
  }

  // Mapeo de iconos para módulos
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingCart': return ShoppingCart
      case 'Users': return Users
      case 'Truck': return Truck
      case 'Package': return Package
      case 'Landmark': return Landmark
      case 'Activity': return Activity
      default: return Activity
    }
  }

  return (
    <iOSPageLayout 
      title="Resumen" 
      subtitle="Visión general financiera"
      showHeader={false} // El wrapper ya tiene header en mobile
      contentClassName="space-y-8"
    >
      {/* KPI Section */}
      <iOSSection title="Métricas Clave">
        <iOSGrid cols={2} gap="md">
          <iOSMetricCard
            title="Capital Total"
            value={`$${stats.capitalTotal.toLocaleString()}`}
            icon={Wallet}
            iconColor="#10B981"
            trend={{
              value: stats.cambioCapital,
              direction: stats.cambioCapital >= 0 ? 'up' : 'down'
            }}
            variant="featured"
            className="col-span-2"
            sparklineData={sparklines.capital}
          />
          <iOSMetricCard
            title="Ventas Mes"
            value={`$${stats.ventasMes.toLocaleString()}`}
            icon={DollarSign}
            iconColor="#8B5CF6"
            trend={{
              value: stats.cambioVentas,
              direction: stats.cambioVentas >= 0 ? 'up' : 'down'
            }}
            sparklineData={sparklines.ventas}
          />
          <iOSMetricCard
            title="Ganancia Neta"
            value={`$${stats.gananciaNeta.toLocaleString()}`}
            icon={TrendingUp}
            iconColor="#F59E0B"
            trend={{
              value: 12.5, // Simulado o derivado
              direction: 'up'
            }}
            sparklineData={sparklines.ganancia}
          />
        </iOSGrid>
      </iOSSection>

      {/* Financial Charts Section - PREMIUM */}
      <iOSSection title="Análisis Financiero">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Capital Gauge */}
          <GaugeDualChart 
            historico={stats.capitalTotal * 1.5} // Mock historical high
            capital={stats.capitalTotal}
            label="Rendimiento de Capital"
            height={250}
            className="w-full"
          />
          
          {/* Flow Analysis */}
          <SankeyChart 
            nodes={sankeyData.nodes}
            links={sankeyData.links}
            height={250}
            title="Flujo de Capital"
            className="w-full"
          />

          {/* Activity Heatmap */}
          <HeatmapChart
            data={heatmapData.data}
            xLabels={heatmapData.xLabels}
            yLabels={heatmapData.yLabels}
            title="Actividad Financiera Semanal"
            className="col-span-1 lg:col-span-2 w-full"
            height={200}
          />
        </div>
      </iOSSection>

      {/* Modules Grid */}
      <iOSSection title="Módulos Operativos">
        <iOSGrid cols={2} gap="md">
          {modules.map((mod) => {
            const Icon = getIcon(mod.iconName)
            return (
              <iOSActionCard
                key={mod.id}
                title={mod.nombre}
                description={mod.descripcion}
                icon={Icon}
                iconColor={mod.color}
                primaryAction={{
                  label: 'Abrir',
                  onClick: () => router.push(mod.path)
                }}
              />
            )
          })}
        </iOSGrid>
      </iOSSection>

      {/* Alerts Section */}
      {stats.alertasActivas > 0 && (
        <iOSSection title="Requiere Atención">
          <div className="space-y-3">
            {activities
              .filter(a => a.tipo === 'alerta')
              .slice(0, 3)
              .map(alerta => (
                <iOSInfoCard
                  key={alerta.id}
                  title={alerta.titulo}
                  description={alerta.descripcion}
                  variant="warning"
                  icon={AlertTriangle}
                  onClick={() => {}}
                />
              ))}
          </div>
        </iOSSection>
      )}

      {/* Recent Activity */}
      <iOSSection 
        title="Actividad Reciente" 
        action={
          <button 
            onClick={() => router.push('/movimientos')}
            className="text-sm text-violet-400 font-medium flex items-center gap-1"
          >
            Ver todo <ArrowRight size={14} />
          </button>
        }
      >
        <div className="space-y-3">
          {activities
            .filter(a => a.tipo !== 'alerta')
            .slice(0, 5)
            .map((activity) => (
              <iOSInfoCard
                key={activity.id}
                title={activity.titulo}
                description={activity.descripcion}
                badge={activity.timestamp}
                icon={
                  activity.tipo === 'venta' ? DollarSign :
                  activity.tipo === 'compra' ? ShoppingCart :
                  activity.tipo === 'cliente' ? Users : Activity
                }
                variant="default"
              />
            ))}
        </div>
      </iOSSection>

    </iOSPageLayout>
  )
}
