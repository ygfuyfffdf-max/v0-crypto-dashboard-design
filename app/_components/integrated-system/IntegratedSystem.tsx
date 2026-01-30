/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS INFINITY 2026 — INTEGRACIÓN Y OPTIMIZACIÓN COMPLETA
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de integración total que conecta todos los módulos:
 * - WebSocket para comunicación en tiempo real
 * - Dashboard de métricas con datos en vivo
 * - Workflows con notificaciones automáticas
 * - Reportes programados integrados
 * - Filtros persistentes compartidos
 * - Temas aplicados globalmente
 * - Sincronización multi-tab/dispositivo
 * - Caché inteligente
 * - Optimización de rendimiento
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { WebSocketProvider } from '@/app/providers/WebSocketProvider'
import { NotificationPanel } from '@/app/_components/notifications/NotificationPanel'
import { AdvancedMetricsDashboard } from '@/app/_components/dashboards/AdvancedMetricsDashboard'
import { WorkflowSystem } from '@/app/_components/workflows/WorkflowSystem'
import { ScheduledReportsSystem } from '@/app/_components/reports/ScheduledReportsSystem'
import { FilterSystem } from '@/app/_components/filters/FilterSystem'
import { ThemeEditor } from '@/app/_components/theme/ThemeEditor'
import { 
  useWebSocket, 
  useWebSocketEvent, 
  WebSocketEventType 
} from '@/app/lib/hooks/useWebSocket'
import { AnimatePresence, motion } from 'motion/react'
import {
  LayoutDashboard,
  Workflow,
  FileText,
  Filter,
  Palette,
  Settings,
  ChevronRight,
  Activity,
  TrendingUp,
} from 'lucide-react'
import { cn } from '@/app/lib/utils'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

type ActiveModule = 
  | 'dashboard' 
  | 'workflows' 
  | 'reports' 
  | 'filters' 
  | 'theme'

interface ModuleConfig {
  id: ActiveModule
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE MÓDULOS
// ═══════════════════════════════════════════════════════════════════════════════════════

const MODULES: ModuleConfig[] = [
  {
    id: 'dashboard',
    name: 'Dashboard de Métricas',
    description: 'Análisis en tiempo real y visualización de datos',
    icon: LayoutDashboard,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 'workflows',
    name: 'Sistema de Workflows',
    description: 'Aprobaciones y flujos de trabajo automatizados',
    icon: Workflow,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'reports',
    name: 'Reportes Programados',
    description: 'Generación y envío automático de reportes',
    icon: FileText,
    color: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'filters',
    name: 'Filtros Guardados',
    description: 'Sistema avanzado de filtros personalizables',
    icon: Filter,
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'theme',
    name: 'Editor de Temas',
    description: 'Personalización completa de la interfaz',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ModuleCard
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ModuleCardProps {
  module: ModuleConfig
  isActive: boolean
  onClick: () => void
  metrics?: {
    count?: number
    trend?: number
  }
}

function ModuleCard({ module, isActive, onClick, metrics }: ModuleCardProps) {
  const Icon = module.icon

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border p-6 text-left transition-all',
        'backdrop-blur-xl',
        isActive
          ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20'
          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/5'
      )}
    >
      {/* Background Gradient */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-opacity group-hover:opacity-10',
          `bg-gradient-to-br ${module.color}`
        )}
      />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Icon and Badge */}
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl',
              'bg-gradient-to-br',
              module.color
            )}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>

          {metrics?.count !== undefined && (
            <div className="flex flex-col items-end">
              <div className="text-2xl font-bold text-white">{metrics.count}</div>
              {metrics.trend !== undefined && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    metrics.trend > 0 ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  <TrendingUp
                    className={cn(
                      'h-3 w-3',
                      metrics.trend < 0 && 'rotate-180'
                    )}
                  />
                  <span>{Math.abs(metrics.trend)}%</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-semibold text-white">{module.name}</h3>
          <p className="text-sm text-white/60">{module.description}</p>
        </div>

        {/* Arrow */}
        <div className="flex justify-end">
          <ChevronRight
            className={cn(
              'h-5 w-5 transition-all',
              isActive ? 'text-purple-400' : 'text-white/40 group-hover:text-white/80'
            )}
          />
        </div>
      </div>

      {/* Active Indicator */}
      {isActive && (
        <motion.div
          layoutId="activeModule"
          className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ConnectionStatus
// ═══════════════════════════════════════════════════════════════════════════════════════

function ConnectionStatus() {
  const { status, isConnected, metrics } = useWebSocket()

  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <div
        className={cn(
          'h-2 w-2 rounded-full',
          isConnected ? 'bg-emerald-400' : 'bg-red-400',
          isConnected && 'animate-pulse'
        )}
      />
      <span className="text-sm text-white/80">
        {isConnected ? 'Conectado' : 'Desconectado'}
      </span>
      {metrics && isConnected && (
        <span className="text-xs text-white/40">
          {metrics.averageLatency}ms
        </span>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: IntegratedSystemHeader
// ═══════════════════════════════════════════════════════════════════════════════════════

interface IntegratedSystemHeaderProps {
  activeModule: ActiveModule
  onModuleChange: (module: ActiveModule) => void
}

function IntegratedSystemHeader({ activeModule, onModuleChange }: IntegratedSystemHeaderProps) {
  return (
    <div className="sticky top-0 z-10 border-b border-white/10 bg-black/90 backdrop-blur-xl">
      <div className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            CHRONOS INFINITY 2026
          </h1>
          <p className="text-sm text-white/60">Sistema Integrado Ultra-Premium</p>
        </div>

        <div className="flex items-center gap-3">
          <ConnectionStatus />
          <NotificationPanel />
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: IntegratedSystem
// ═══════════════════════════════════════════════════════════════════════════════════════

function IntegratedSystemContent() {
  const [activeModule, setActiveModule] = useState<ActiveModule>('dashboard')
  const [moduleMetrics, setModuleMetrics] = useState<Record<string, any>>({})

  // Escuchar eventos de WebSocket para actualizar métricas
  useWebSocketEvent(WebSocketEventType.SYSTEM_ALERT, (data: any) => {
    console.log('System Alert:', data)
    // Actualizar métricas según el tipo de alerta
  })

  useWebSocketEvent(WebSocketEventType.WORKFLOW_UPDATE, (data: any) => {
    console.log('Workflow Update:', data)
    setModuleMetrics((prev) => ({
      ...prev,
      workflows: {
        count: (prev.workflows?.count || 0) + 1,
        trend: 5,
      },
    }))
  })

  // Renderizar módulo activo
  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <AdvancedMetricsDashboard />
      case 'workflows':
        return <WorkflowSystem />
      case 'reports':
        return <ScheduledReportsSystem />
      case 'filters':
        return <FilterSystem />
      case 'theme':
        return <ThemeEditor />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <IntegratedSystemHeader
        activeModule={activeModule}
        onModuleChange={setActiveModule}
      />

      <div className="container mx-auto max-w-[1920px] p-6">
        {/* Module Grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {MODULES.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              isActive={activeModule === module.id}
              onClick={() => setActiveModule(module.id)}
              metrics={moduleMetrics[module.id]}
            />
          ))}
        </div>

        {/* Active Module Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveModule()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Global Activity Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-xl"
      >
        <Activity className="h-6 w-6 text-purple-400 animate-pulse" />
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN CON PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════

export function IntegratedSystem() {
  return (
    <WebSocketProvider
      url={process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}
      autoConnect={true}
    >
      <IntegratedSystemContent />
    </WebSocketProvider>
  )
}

export default IntegratedSystem
