/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 SISTEMA DE REPORTES AVANZADOS — SUPREME EDITION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de reportes con:
 * - Generación de reportes con IA
 * - Análisis predictivo de datos
 * - Visualizaciones interactivas
 * - Exportación multi-formato
 * - Programación inteligente
 * - Dashboard de métricas en tiempo real
 *
 * @version 4.0.0 - IA Enhanced
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import type {
    FormatoReporte,
    FrecuenciaReporte,
    ReporteProgramado,
    TemplateReporte
} from '@/app/_lib/services/reportes-supreme.service'
import { cn } from '@/app/_lib/utils'
import {
    Calendar,
    Clock,
    Cpu,
    Edit,
    File,
    FileJson,
    FileSpreadsheet,
    FileText,
    Mail,
    Pause,
    Play,
    Settings,
    Sparkles,
    Trash2,
    TrendingDown,
    TrendingUp,
    X,
    Zap
} from 'lucide-react'
import { motion } from 'motion/react'
import { memo, useEffect, useState } from 'react'
import { AuroraButton, AuroraGlassCard } from '../../ui/AuroraGlassSystem'
import { QuantumCard } from '../../ui/QuantumElevatedUI'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES EXTENDIDOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MetricaReporte {
  id: string
  titulo: string
  valor: number
  cambio: number
  tendencia: 'subiendo' | 'bajando' | 'estable'
  icono: React.ReactNode
  color: string
}

interface InsightReporte {
  id: string
  titulo: string
  descripcion: string
  importancia: 'alta' | 'media' | 'baja'
  accionRecomendada?: string
  confianza: number
}

interface ConfiguracionAvanzada {
  generarInsights: boolean
  prediccionesActivas: boolean
  alertasAnomalias: boolean
  frecuenciaActualizacion: '15min' | '30min' | '1h' | '2h' | '4h'
  profundidadAnalisis: 'basico' | 'intermedio' | 'avanzado'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES INTERNOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const MetricasReportes = memo(function MetricasReportes({
  metricas,
  loading = false,
}: {
  metricas: MetricaReporte[]
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
          <QuantumCard elevation="lg" interactive className="p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={cn('p-2 rounded-lg', metrica.color)}>
                  {metrica.icono}
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs font-medium px-2 py-1 rounded-full',
                    metrica.tendencia === 'subiendo' && 'bg-emerald-500/20 text-emerald-400',
                    metrica.tendencia === 'bajando' && 'bg-rose-500/20 text-rose-400',
                    metrica.tendencia === 'estable' && 'bg-amber-500/20 text-amber-400'
                  )}>
                    {metrica.tendencia === 'subiendo' && <TrendingUp className="h-3 w-3 inline" />}
                    {metrica.tendencia === 'bajando' && <TrendingDown className="h-3 w-3 inline" />}
                    {metrica.cambio.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-2xl font-bold text-white">
                  {metrica.valor >= 1000000
                    ? `${(metrica.valor / 1000000).toFixed(1)}M`
                    : metrica.valor >= 1000
                    ? `${(metrica.valor / 1000).toFixed(1)}K`
                    : metrica.valor.toLocaleString()
                  }
                </p>
                <p className="text-sm text-white/60">{metrica.titulo}</p>
              </div>
          </QuantumCard>
        </motion.div>
      ))}

      {loading && (
        <div className="col-span-full flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-2" />
            <p className="text-white/60">Cargando métricas...</p>
          </div>
        </div>
      )}
    </div>
  )
})

const PanelInsightsIA = memo(function PanelInsightsIA({
  insights,
  loading = false,
  onGenerarNuevos,
}: {
  insights: InsightReporte[]
  loading?: boolean
  onGenerarNuevos: () => void
}) {
  return (
    <AuroraGlassCard>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500">
              <Cpu className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Insights con IA</h3>
              <p className="text-sm text-white/60">Análisis inteligente de datos</p>
            </div>
          </div>

          <AuroraButton
            onClick={onGenerarNuevos}
            variant="secondary"
            size="sm"
            loading={loading}
          >
            <Zap className="h-4 w-4" />
            Generar Nuevos
          </AuroraButton>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4" />
              <p className="text-white/60">Generando insights con IA...</p>
            </div>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8">
            <Sparkles className="mx-auto h-12 w-12 text-violet-400 mb-3" />
            <p className="text-white/60">No hay insights disponibles</p>
            <p className="text-sm text-white/40">Haz clic en "Generar Nuevos" para crear análisis</p>
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'p-4 rounded-xl border transition-all',
                  insight.importancia === 'alta' && 'bg-rose-500/10 border-rose-500/30',
                  insight.importancia === 'media' && 'bg-amber-500/10 border-amber-500/30',
                  insight.importancia === 'baja' && 'bg-blue-500/10 border-blue-500/30'
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-white">{insight.titulo}</h4>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      insight.importancia === 'alta' && 'bg-rose-500/20 text-rose-400',
                      insight.importancia === 'media' && 'bg-amber-500/20 text-amber-400',
                      insight.importancia === 'baja' && 'bg-blue-500/20 text-blue-400'
                    )}>
                      {insight.importancia}
                    </span>
                  </div>
                  <span className="text-xs text-white/50">
                    {Math.round(insight.confianza * 100)}% confianza
                  </span>
                </div>

                <p className="text-sm text-white/70 mb-3">{insight.descripcion}</p>

                {insight.accionRecomendada && (
                  <div className="flex justify-end">
                    <AuroraButton size="sm" variant="outline">
                      {insight.accionRecomendada}
                    </AuroraButton>
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

const ListaReportesProgramados = memo(function ListaReportesProgramados({
  reportes,
  onEjecutar,
  onPausar,
  onEditar,
  onEliminar,
}: {
  reportes: ReporteProgramado[]
  onEjecutar: (id: string) => void
  onPausar: (id: string) => void
  onEditar: (id: string) => void
  onEliminar: (id: string) => void
}) {
  const getEstadoColor = (reporte: ReporteProgramado) => {
    if (!reporte.activo) return 'bg-gray-500/20 text-gray-400'
    if (reporte.pausado) return 'bg-amber-500/20 text-amber-400'
    return 'bg-emerald-500/20 text-emerald-400'
  }

  const getFormatoIcono = (formato: FormatoReporte) => {
    switch (formato) {
      case 'pdf': return <File className="h-4 w-4" />
      case 'excel': return <FileSpreadsheet className="h-4 w-4" />
      case 'csv': return <FileText className="h-4 w-4" />
      case 'json': return <FileJson className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-4">
      {reportes.length === 0 ? (
        <div className="text-center py-8">
          <FileText className="mx-auto h-12 w-12 text-white/40 mb-3" />
          <p className="text-white/60">No hay reportes programados</p>
          <p className="text-sm text-white/40">Crea tu primer reporte para comenzar</p>
        </div>
      ) : (
        reportes.map((reporte) => (
          <motion.div
            key={reporte.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className={cn('p-2 rounded-lg', getEstadoColor(reporte))}>
                  {getFormatoIcono(reporte.formato)}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-white">{reporte.nombre}</h4>
                    <span className={cn(
                      'text-xs px-2 py-1 rounded-full',
                      getEstadoColor(reporte)
                    )}>
                      {reporte.pausado ? 'Pausado' : reporte.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {reporte.frecuencia}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {reporte.horaEjecucion}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {reporte.destinatarios.filter(d => d.activo).length} destinatarios
                    </span>
                  </div>

                  {reporte.descripcion && (
                    <p className="text-sm text-white/60 mt-1">{reporte.descripcion}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AuroraButton
                  onClick={() => onEjecutar(reporte.id)}
                  variant="ghost"
                  size="sm"
                  disabled={!reporte.activo || reporte.pausado}
                >
                  <Play className="h-4 w-4" />
                </AuroraButton>

                <AuroraButton
                  onClick={() => onPausar(reporte.id)}
                  variant="ghost"
                  size="sm"
                >
                  {reporte.pausado ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </AuroraButton>

                <AuroraButton
                  onClick={() => onEditar(reporte.id)}
                  variant="ghost"
                  size="sm"
                >
                  <Edit className="h-4 w-4" />
                </AuroraButton>

                <AuroraButton
                  onClick={() => onEliminar(reporte.id)}
                  variant="ghost"
                  size="sm"
                  className="text-rose-400 hover:text-rose-300"
                >
                  <Trash2 className="h-4 w-4" />
                </AuroraButton>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
})

const ModalConfiguracionReporte = memo(function ModalConfiguracionReporte({
  abierto,
  onCerrar,
  reporte,
  templates,
}: {
  abierto: boolean
  onCerrar: () => void
  reporte?: ReporteProgramado
  templates: TemplateReporte[]
}) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    templateId: '',
    frecuencia: 'diario' as FrecuenciaReporte,
    horaEjecucion: '08:00',
    formato: 'pdf' as FormatoReporte,
    destinatarios: [] as string[],
    activo: true,
  })

  useEffect(() => {
    if (reporte) {
      setFormData({
        nombre: reporte.nombre,
        descripcion: reporte.descripcion || '',
        templateId: reporte.templateId,
        frecuencia: reporte.frecuencia,
        horaEjecucion: reporte.horaEjecucion,
        formato: reporte.formato,
        destinatarios: reporte.destinatarios.map(d => d.email),
        activo: reporte.activo,
      })
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        templateId: '',
        frecuencia: 'diario',
        horaEjecucion: '08:00',
        formato: 'pdf',
        destinatarios: [],
        activo: true,
      })
    }
  }, [reporte])

  if (!abierto) return null

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
              <h2 className="text-xl font-bold text-white">
                {reporte ? 'Editar Reporte' : 'Nuevo Reporte'}
              </h2>
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
          <div>
            <label className="block text-sm text-white/60 mb-2">Nombre del Reporte</label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50"
              placeholder="Ej: Reporte Diario de Ventas"
            />
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50 h-24 resize-none"
              placeholder="Descripción del reporte..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Template</label>
              <select
                value={formData.templateId}
                onChange={(e) => setFormData(prev => ({ ...prev, templateId: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="" className="bg-slate-800">Seleccionar template</option>
                {templates.map(template => (
                  <option key={template.id} value={template.id} className="bg-slate-800">
                    {template.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div
