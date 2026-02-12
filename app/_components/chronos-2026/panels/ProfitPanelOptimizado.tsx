/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💰 PROFIT PANEL OPTIMIZADO — SUPREME EDITION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de rentabilidad optimizado con:
 * - Análisis predictivo con IA
 * - Alertas inteligentes de profit
 * - Dashboard de métricas en tiempo real
 * - Gestión de riesgos avanzada
 * - Integración con sistema de notificaciones
 * - Optimización para móviles
 *
 * @version 2.0.0 - Optimizado con IA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { motion, AnimatePresence } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Bell,
  Zap,
  Shield,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Star,
  Award,
  Brain,
  Bot,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAI } from '@/app/_hooks/useAI'
import { usePushNotifications } from '@/app/_hooks/usePushNotifications'
import { AuroraGlassCard, AuroraButton } from '../../ui/AuroraGlassSystem'
import { QuantumCard } from '../../ui/QuantumElevatedUI'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MetricaProfit {
  id: string
  titulo: string
  valor: number
  cambio: number
  tendencia: 'subiendo' | 'bajando' | 'estable'
  icono: React.ReactNode
  color: string
  descripcion: string
}

interface AlertaProfit {
  id: string
  tipo: 'info' | 'advertencia' | 'critico' | 'oportunidad'
  titulo: string
  mensaje: string
  valor: number
  umbral: number
  fecha: Date
  leida: boolean
  accion?: string
}

interface PrediccionProfit {
  periodo: string
  profitEstimado: number
  confianza: number
  factores: string[]
  recomendaciones: string[]
}

interface ConfiguracionAlertas {
  profitMinimo: number
  profitMaximo: number
  variacionDiaria: number
  variacionSemanal: number
  notificacionesActivas: boolean
  frecuenciaAnalisis: '15min' | '30min' | '1h' | '2h' | '4h'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES INTERNOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MetricasProfitReales = memo(function MetricasProfitReales({
  metricas,
  onRefresh,
  loading = false,
}: {
  metricas: MetricaProfit[]
  onRefresh: () => void
  loading?: boolean
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metricas.map((metrica, index) => (
        <motion.div
          key={metrica.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <QuantumCard elevation="lg" interactive>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  'p-2 rounded-lg',
                  metrica.color
                )}>
                  {metrica.icono}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full',
                    metrica.tendencia === 'subiendo' && 'bg-emerald-500/20 text-emerald-400',
                    metrica.tendencia === 'bajando' && 'bg-rose-500/20 text-rose-400',
                    metrica.tendencia === 'estable' && 'bg-amber-500/20 text-amber-400'
                  )}>
                    {metrica.tendencia === 'subiendo' && <ArrowUpRight className="h-3 w-3 inline" />}
                    {metrica.tendencia === 'bajando' && <ArrowDownRight className="h-3 w-3 inline" />}
                    {metrica.tendencia === 'estable' && <div className="h-3 w-3 inline rounded-full bg-current" />}
                    {metrica.cambio.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-2xl font-bold text-white">
                  {metrica.valor >= 1000000 
                    ? `$${(metrica.valor / 1000000).toFixed(1)}M` 
                    : metrica.valor >= 1000 
                    ? `$${(metrica.valor / 1000).toFixed(1)}K`
                    : `$${metrica.valor.toLocaleString()}`
                  }
                </p>
                <p className="text-sm text-white/60">{metrica.titulo}</p>
                <p className="text-xs text-white/40">{metrica.descripcion}</p>
              </div>
            </div>
          </QuantumCard>
        </motion.div>
      ))}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: metricas.length * 0.1 }}
      >
        <QuantumCard elevation="lg" interactive>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500">
                <RefreshCw className="h-5 w-5 text-white" />
              </div>
            </div>
            
            <AuroraButton
              onClick={onRefresh}
              variant="secondary"
              size="sm"
              loading={loading}
              className="w-full"
            >
              Actualizar Datos
            </AuroraButton>
            
            <p className="text-xs text-white/40 mt-2 text-center">
              Última actualización: {new Date().toLocaleTimeString('es-MX')}
            </p>
          </div>
        </QuantumCard>
      </motion.div>
    </div>
  )
})

const PanelAlertasInteligentes = memo(function PanelAlertasInteligentes({
  alertas,
  onMarcarLeida,
  onConfigurar,
}: {
  alertas: AlertaProfit[]
  onMarcarLeida: (id: string) => void
  onConfigurar: () => void
}) {
  const alertasNoLeidas = alertas.filter(a => !a.leida)
  
  return (
    <AuroraGlassCard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-rose-500 to-orange-500">
              <Bell className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Alertas Inteligentes</h3>
              <p className="text-sm text-white/60">
                {alertasNoLeidas.length} alertas pendientes
              </p>
            </div>
          </div>
          
          <AuroraButton
            onClick={onConfigurar}
            variant="ghost"
            size="sm"
          >
            <Settings className="h-4 w-4" />
          </AuroraButton>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {alertas.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8"
              >
                <Shield className="mx-auto h-12 w-12 text-emerald-400 mb-3" />
                <p className="text-white/60">No hay alertas activas</p>
                <p className="text-sm text-white/40">Todo está funcionando correctamente</p>
              </motion.div>
            ) : (
              alertas.map((alerta, index) => (
                <motion.div
                  key={alerta.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'p-4 rounded-xl border transition-all',
                    alerta.tipo === 'info' && 'bg-blue-500/10 border-blue-500/30',
                    alerta.tipo === 'advertencia' && 'bg-amber-500/10 border-amber-500/30',
                    alerta.tipo === 'critico' && 'bg-rose-500/10 border-rose-500/30',
                    alerta.tipo === 'oportunidad' && 'bg-emerald-500/10 border-emerald-500/30',
                    !alerta.leida && 'ring-2 ring-white/20'
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        'p-1.5 rounded-lg mt-0.5',
                        alerta.tipo === 'info' && 'bg-blue-500/20 text-blue-400',
                        alerta.tipo === 'advertencia' && 'bg-amber-500/20 text-amber-400',
                        alerta.tipo === 'critico' && 'bg-rose-500/20 text-rose-400',
                        alerta.tipo === 'oportunidad' && 'bg-emerald-500/20 text-emerald-400'
                      )}>
                        {alerta.tipo === 'info' && <Info className="h-4 w-4" />}
                        {alerta.tipo === 'advertencia' && <AlertTriangle className="h-4 w-4" />}
                        {alerta.tipo === 'critico' && <AlertTriangle className="h-4 w-4" />}
                        {alerta.tipo === 'oportunidad' && <TrendingUp className="h-4 w-4" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-white">{alerta.titulo}</h4>
                          {!alerta.leida && (
                            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                          )}
                        </div>
                        <p className="text-sm text-white/70 mb-2">{alerta.mensaje}</p>
                        <div className="flex items-center gap-4 text-xs text-white/50">
                          <span>Valor: ${alerta.valor.toLocaleString()}</span>
                          <span>Umbral: ${alerta.umbral.toLocaleString()}</span>
                          <span>{alerta.fecha.toLocaleTimeString('es-MX')}</span>
                        </div>
                      </div>
                    </div>
                    
                    {!alerta.leida && (
                      <button
                        onClick={() => onMarcarLeida(alerta.id)}
                        className="p-1.5 rounded-lg bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  
                  {alerta.accion && (
                    <div className="mt-3 flex justify-end">
                      <AuroraButton
                        size="sm"
                        variant="outline"
                        onClick={() => {/* Implementar acción */}}
                      >
                        {alerta.accion}
                      </AuroraButton>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </AuroraGlassCard>
  )
})

const PanelAnalisisPredictivo = memo(function PanelAnalisisPredictivo({
  predicciones,
  loading = false,
  onGenerarNuevas,
}: {
  predicciones: PrediccionProfit[]
  loading?: boolean
  onGenerarNuevas: () => void
}) {
  return (
    <AuroraGlassCard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Análisis Predictivo</h3>
              <p className="text-sm text-white/60">Predicciones basadas en IA</p>
            </div>
          </div>
          
          <AuroraButton
            onClick={onGenerarNuevas}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            <Zap className="h-4 w-4" />
            Generar Nuevas
          </AuroraButton>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4" />
              <p className="text-white/60">Generando predicciones con IA...</p>
            </div>
          </div>
        ) : predicciones.length === 0 ? (
          <div className="text-center py-8">
            <Bot className="mx-auto h-12 w-12 text-violet-400 mb-3" />
            <p className="text-white/60">No hay predicciones disponibles</p>
            <p className="text-sm text-white/40">Haz clic en "Generar Nuevas" para crear análisis</p>
          </div>
        ) : (
          <div className="space-y-4">
            {predicciones.map((prediccion, index) => (
              <motion.div
                key={prediccion.periodo}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-white/60" />
                    <span className="font-medium text-white">{prediccion.periodo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-emerald-400">
                      ${prediccion.profitEstimado.toLocaleString()}
                    </span>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      prediccion.confianza >= 0.8 && 'bg-emerald-500/20 text-emerald-400',
                      prediccion.confianza >= 0.6 && prediccion.confianza < 0.8 && 'bg-amber-500/20 text-amber-400',
                      prediccion.confianza < 0.6 && 'bg-rose-500/20 text-rose-400'
                    )}>
                      {Math.round(prediccion.confianza * 100)}% confianza
                    </span>
                  </div>
                </div>

                {prediccion.factores.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-white/60 mb-2">Factores clave:</p>
                    <div className="flex flex-wrap gap-2">
                      {prediccion.factores.map((factor, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-lg bg-violet-500/20 text-violet-300"
                        >
                          {factor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {prediccion.recomendaciones.length > 0 && (
                  <div>
                    <p className="text-xs text-white/60 mb-2">Recomendaciones:</p>
                    <ul className="space-y-1">
                      {prediccion.recomendaciones.map((rec, i) => (
                        <li key={i} className="text-xs text-white/80 flex items-start gap-2">
                          <Sparkles className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </AuroraGlassCard>
  )
})

const ConfiguracionAlertasModal = memo(function ConfiguracionAlertasModal({
  configuracion,
  onGuardar,
  onCerrar,
}: {
  configuracion: ConfiguracionAlertas
  onGuardar: (config: ConfiguracionAlertas) => void
  onCerrar: () => void
}) {
  const [tempConfig, setTempConfig] = useState(configuracion)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCerrar}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-white/20 backdrop-blur-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Configuración de Alertas</h2>
            </div>
            <button
              onClick={onCerrar}
              className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Umbrales de Profit */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Umbrales de Profit</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Profit Mínimo ($)</label>
                <input
                  type="number"
                  value={tempConfig.profitMinimo}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, profitMinimo: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">Profit Máximo ($)</label>
                <input
                  type="number"
                  value={tempConfig.profitMaximo}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, profitMaximo: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
          </div>

          {/* Variaciones */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Variaciones Permitidas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Variación Diaria Máxima (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tempConfig.variacionDiaria}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, variacionDiaria: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">Variación Semanal Máxima (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={tempConfig.variacionSemanal}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, variacionSemanal: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50"
                />
              </div>
            </div>
          </div>

          {/* Configuración de Análisis */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Análisis Automático</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm text-white/60">Notificaciones Activas</label>
                <button
                  onClick={() => setTempConfig(prev => ({ ...prev, notificacionesActivas: !prev.notificacionesActivas }))}
                  className={cn(
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    tempConfig.notificacionesActivas ? 'bg-emerald-500' : 'bg-white/20'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      tempConfig.notificacionesActivas ? 'translate-x-6' : 'translate-x-1'
                    )}
                  />
                </button>
              </div>
              
              <div>
                <label className="block text-sm text-white/60 mb-2">Frecuencia de Análisis</label>
                <select
                  value={tempConfig.frecuenciaAnalisis}
                  onChange={(e) => setTempConfig(prev => ({ ...prev, frecuenciaAnalisis: e.target.value as any }))}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50"
                >
                  <option value="15min" className="bg-slate-800">Cada 15 minutos</option>
                  <option value="30min" className="bg-slate-800">Cada 30 minutos</option>
                  <option value="1h" className="bg-slate-800">Cada hora</option>
                  <option value="2h" className="bg-slate-800">Cada 2 horas</option>
                  <option value="4h" className="bg-slate-800">Cada 4 horas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 flex gap-3">
          <AuroraButton
            onClick={onCerrar}
            variant="secondary"
            className="flex-1"
          >
            Cancelar
          </AuroraButton>
          <AuroraButton
            onClick={() => {
              onGuardar(tempConfig)
              onCerrar()
            }}
            variant="primary"
            className="flex-1"
          >
            Guardar Cambios
          </AuroraButton>
        </div>
      </motion.div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ProfitPanelOptimizado = memo(function ProfitPanelOptimizado({
  className,
}: {
  className?: string
}) {
  const [loading, setLoading] = useState(false)
  const [metricas, setMetricas] = useState<MetricaProfit[]>([])
  const [alertas, setAlertas] = useState<AlertaProfit[]>([])
  const [predicciones, setPredicciones] = useState<PrediccionProfit[]>([])
  const [configuracion, setConfiguracion] = useState<ConfiguracionAlertas>({
    profitMinimo: 1000,
    profitMaximo: 50000,
    variacionDiaria: 5,
    variacionSemanal: 15,
    notificacionesActivas: true,
    frecuenciaAnalisis: '30min'
  })
  const [mostrarConfig, setMostrarConfig] = useState(false)
  const [vistaExpandida, setVistaExpandida] = useState(false)

  const { insights, loading: aiLoading, generateInsights } = useAI()
  const { 
    isSupported, 
    permission, 
    subscribeToNotifications, 
    unsubscribeFromNotifications 
  } = usePushNotifications()

  // Cargar datos iniciales
  const cargarDatos = useCallback(async () => {
    setLoading(true)
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockMetricas: MetricaProfit[] = [
        {
          id: 'profit-diario',
          titulo: 'Profit Diario',
          valor: 25430.50,
          cambio: 12.5,
          tendencia: 'subiendo',
          icono: <TrendingUp className="h-5 w-5" />,
          color: 'bg-gradient-to-r from-emerald-500 to-green-500',
          descripcion: 'Ganancia neta del día'
        },
        {
          id: 'profit-semanal',
          titulo: 'Profit Semanal',
          valor: 145680.25,
          cambio: 8.3,
          tendencia: 'subiendo',
          icono: <DollarSign className="h-5 w-5" />,
          color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
          descripcion: 'Acumulado de la semana'
        },
        {
          id: 'profit-mensual',
          titulo: 'Profit Mensual',
          valor: 523450.80,
          cambio: -2.1,
          tendencia: 'bajando',
          icono: <Target className="h-5 w-5" />,
          color: 'bg-gradient-to-r from-violet-500 to-purple-500',
          descripcion: 'Meta mensual vs actual'
        },
        {
          id: 'roi-promedio',
          titulo: 'ROI Promedio',
          valor: 18.7,
          cambio: 5.2,
          tendencia: 'subiendo',
          icono: <Award className="h-5 w-5" />,
          color: 'bg-gradient-to-r from-amber-500 to-orange-500',
          descripcion: 'Retorno sobre inversión'
        }
      ]

      const mockAlertas: AlertaProfit[] = [
        {
          id: 'alerta-1',
          tipo: 'advertencia',
          titulo: 'Profit Diario Bajo',
          mensaje: 'El profit diario está 15% por debajo del promedio',
          valor: 25430.50,
          umbral: 30000,
          fecha: new Date(),
          leida: false,
          accion: 'Ver Detalles'
        },
        {
          id: 'alerta-2',
          tipo: 'oportunidad',
          titulo: 'Oportunidad de Inversión',
          mensaje: 'Sector tecnológico muestra potencial de crecimiento del 25%',
          valor: 125000,
          umbral: 100000,
          fecha: new Date(Date.now() - 3600000),
          leida: false,
          accion: 'Explorar'
        },
        {
          id: 'alerta-3',
          tipo: 'info',
          titulo: 'Análisis Completado',
          mensaje: 'El análisis mensual de tendencias está disponible',
          valor: 523450.80,
          umbral: 500000,
          fecha: new Date(Date.now() - 7200000),
          leida: true
        }
      ]

      setMetricas(mockMetricas)
      setAlertas(mockAlertas)
      
      // Generar predicciones con IA
      if (insights.length > 0) {
        const nuevasPredicciones: PrediccionProfit[] = insights.map(insight => ({
          periodo: insight.title.includes('mensual') ? 'Próximo Mes' : 
                   insight.title.includes('semanal') ? 'Próxima Semana' : 'Próximos 7 Días',
          profitEstimado: insight.data?.percentage ? 500000 * (1 + insight.data.percentage / 100) : 450000,
          confianza: insight.confidence,
          factores: insight.description.split('.').filter(f => f.trim()),
          recomendaciones: [
            'Diversificar inversiones',
            'Monitorear tendencias del mercado',
            'Ajustar estrategia según resultados'
          ]
        }))
        setPredicciones(nuevasPredicciones)
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar datos de profit')
    } finally {
      setLoading(false)
    }
  }, [insights])

  // Generar análisis con IA
  const generarAnalisisIA = useCallback(async () => {
    try {
      await generateInsights({
        metricas: metricas.map(m => ({
          nombre: m.titulo,
          valor: m.valor,
          tendencia: m.tendencia,
          cambio: m.cambio
        })),
        alertas: alertas.length,
        periodo: 'mensual'
      })
    } catch (error) {
      console.error('Error al generar análisis:', error)
    }
  }, [generateInsights, metricas, alertas])

  // Suscribirse a notificaciones push
  const suscribirNotificaciones = useCallback(async () => {
    if (configuracion.notificacionesActivas && isSupported && permission === 'granted') {
      try {
        await subscribeToNotifications('profit-alerts', {
          tag: 'profit-panel',
          actions: [
            { action: 'ver', title: 'Ver Detalles' },
            { action: 'ignorar', title: 'Ignorar' }
          ]
        })
        toast.success('Notificaciones activadas')
      } catch (error) {
        console.error('Error al suscribirse:', error)
      }
    }
  }, [configuracion.notificacionesActivas, isSupported, permission, subscribeToNotifications])

  // Marcar alerta como leída
  const marcarAlertaLeida = useCallback((id: string) => {
    setAlertas(prev => prev.map(alerta => 
      alerta.id === id ? { ...alerta, leida: true } : alerta
    ))
  }, [])

  // Guardar configuración
  const guardarConfiguracion = useCallback((nuevaConfig: ConfiguracionAlertas) => {
    setConfiguracion(nuevaConfig)
    toast.success('Configuración guardada')
    
    // Actualizar suscripción a notificaciones
    if (nuevaConfig.notificacionesActivas) {
      suscribirNotificaciones()
    } else {
      unsubscribeFromNotifications('profit-alerts')
    }
  }, [suscribirNotificaciones, unsubscribeFromNotifications])

  // Efectos iniciales
  useEffect(() => {
    cargarDatos()
    suscribirNotificaciones()
  }, [])

  // Programar análisis automático
  useEffect(() => {
    const intervalos = {
      '15min': 15 * 60 * 1000,
      '30min': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '2h': 2 * 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000
    }

    const interval = setInterval(() => {
      if (configuracion.notificacionesActivas) {
        generarAnalisisIA()
      }
    }, intervalos[configuracion.frecuenciaAnalisis])

    return () => clearInterval(interval)
  }, [configuracion.frecuenciaAnalisis, configuracion.notificacionesActivas, generarAnalisisIA])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header con controles */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
            <TrendingUp className="h-8 w-8 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Profit Analytics
              <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                IA Optimizado
              </span>
            </h1>
            <p className="text-sm text-white/50">Análisis predictivo de rentabilidad</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AuroraButton
            onClick={() => setVistaExpandida(!vistaExpandida)}
            variant="ghost"
            size="sm"
          >
            {vistaExpandida ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </AuroraButton>
          
          <AuroraButton
            onClick={() => setMostrarConfig(true)}
            variant="secondary"
            size="sm"
          >
            <Settings className="h-4 w-4" />
            Configurar
          </AuroraButton>
          
          <AuroraButton
            onClick={cargarDatos}
            variant="primary"
            size="sm"
            loading={loading}
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </AuroraButton>
        </div>
      </div>

      {/* Métricas principales */}
      <MetricasProfitReales
        metricas={metricas}
        onRefresh={cargarDatos}
        loading={loading}
      />

      {/* Vista expandida con IA y alertas */}
      {vistaExpandida && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PanelAlertasInteligentes
            alertas={alertas}
            onMarcarLeida={marcarAlertaLeida}
            onConfigurar={() => setMostrarConfig(true)}
          />
          
          <PanelAnalisisPredictivo
            predicciones={predicciones}
            loading={aiLoading}
            onGenerarNuevas={generarAnalisisIA}
          />
        </div>
      )}

      {/* Modal de configuración */}
      <AnimatePresence>
        {mostrarConfig && (
          <ConfiguracionAlertasModal
            configuracion={configuracion}
            onGuardar={guardarConfiguracion}
            onCerrar={() => setMostrarConfig(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
})

export default ProfitPanelOptimizado