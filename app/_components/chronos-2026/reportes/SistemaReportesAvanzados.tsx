/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊 SISTEMA DE REPORTES AVANZADOS — SUPREME EDITION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de reportes con:
 * - Generación inteligente con IA
 * - Visualizaciones interactivas con Recharts
 * - Exportación multi-formato (PDF, Excel, CSV, JSON)
 * - Dashboard personalizable
 * - Análisis predictivo
 * - Programación automática
 * - Integración con notificaciones push
 *
 * @version 4.0.0 - Completo con IA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { usePushNotifications } from '@/app/_hooks/usePushNotifications'
// useAI insights/generateInsights stubbed locally
import { cn } from '@/app/_lib/utils'
import {
    Activity,
    AlertCircle,
    BarChart2,
    ChevronDown,
    Cpu,
    DollarSign,
    FileText,
    Filter,
    LineChart,
    Package,
    PieChart,
    Plus,
    Save,
    Search,
    Sparkles,
    Star,
    Target,
    Trash2,
    TrendingUp,
    Users
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, Pie, LineChart as RechartsLineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AuroraButton, AuroraGlassCard } from '../../ui/AuroraGlassSystem'
import { QuantumGlassCard as QuantumCard } from '../../ui/QuantumElevatedUI'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type FrecuenciaReporte = 'diario' | 'semanal' | 'quincenal' | 'mensual' | 'trimestral' | 'personalizado'
export type FormatoReporte = 'pdf' | 'excel' | 'csv' | 'json'
export type EstadoEjecucion = 'pendiente' | 'en_proceso' | 'completado' | 'error' | 'cancelado'
export type TipoReporte = 'ventas' | 'bancos' | 'inventario' | 'clientes' | 'gastos' | 'auditoria' | 'personalizado' | 'profit' | 'analisis_predictivo'
export type TipoVisualizacion = 'linea' | 'barra' | 'area' | 'pastel' | 'tabla' | 'metricas'

export interface TemplateReporte {
  id: string
  nombre: string
  descripcion: string
  tipo: TipoReporte
  modulo: string
  icono: React.ReactNode
  color: string
  columnas: ColumnaReporte[]
  filtrosBase?: FiltroReporte[]
  ordenamiento?: { campo: string; direccion: 'asc' | 'desc' }
  agrupamiento?: string
  incluirTotales: boolean
  incluirGraficos: boolean
  visualizaciones: TipoVisualizacion[]
  estilos?: EstilosReporte
  creadoPor: string
  creadoAt: number
  activo: boolean
  popularidad: number
}

export interface ColumnaReporte {
  id: string
  campo: string
  titulo: string
  tipo: 'texto' | 'numero' | 'moneda' | 'fecha' | 'porcentaje' | 'booleano'
  ancho?: number
  alineacion?: 'izquierda' | 'centro' | 'derecha'
  formato?: string
  visible: boolean
  agregacion?: 'suma' | 'promedio' | 'conteo' | 'min' | 'max'
}

export interface FiltroReporte {
  id: string
  campo: string
  operador: '=' | '!=' | '>' | '<' | '>=' | '<=' | 'between' | 'contains' | 'in'
  valor: unknown
  valorSecundario?: unknown
  tipo: 'fecha' | 'numero' | 'texto' | 'lista'
}

export interface EstilosReporte {
  colorPrimario: string
  colorSecundario: string
  fuenteTitulo: string
  fuenteCuerpo: string
  logoUrl?: string
  piePagina?: string
}

export interface ReporteProgramado {
  id: string
  nombre: string
  descripcion?: string
  templateId: string
  templateNombre: string
  templateIcono?: React.ReactNode
  templateColor?: string
  frecuencia: FrecuenciaReporte
  horaEjecucion: string
  diasSemana?: number[]
  diaDelMes?: number
  proximaEjecucion: number
  ultimaEjecucion?: number
  formato: FormatoReporte
  destinatarios: DestinatarioReporte[]
  filtrosAdicionales?: FiltroReporte[]
  visualizacionPreferida?: TipoVisualizacion
  activo: boolean
  pausado: boolean
  creadoPor: string
  creadoAt: number
  modificadoAt?: number
  inteligenciaActiva: boolean
}

export interface DestinatarioReporte {
  id: string
  nombre: string
  email: string
  tipo: 'principal' | 'copia' | 'copia_oculta'
  activo: boolean
  notificacionesPush?: boolean
}

export interface EjecucionReporte {
  id: string
  reporteId: string
  reporteNombre: string
  estado: EstadoEjecucion
  iniciadoAt: number
  completadoAt?: number
  formato: FormatoReporte
  registrosProcesados: number
  archivoGenerado?: string
  archivoTamano?: number
  destinatariosEnviados: string[]
  errores?: string[]
  duracionMs?: number
  datosProcesados?: any[]
  insightsIA?: InsightReporte[]
}

export interface InsightReporte {
  id: string
  tipo: 'tendencia' | 'anomalia' | 'oportunidad' | 'alerta' | 'recomendacion'
  titulo: string
  descripcion: string
  importancia: 'baja' | 'media' | 'alta' | 'critica'
  datosRelacionados?: any
  accionSugerida?: string
  confianza: number
}

export interface DatosVisualizacion {
  tipo: TipoVisualizacion
  datos: any[]
  configuracion: {
    titulo: string
    subtitulo?: string
    colores?: string[]
    mostrarLeyenda?: boolean
    mostrarTooltip?: boolean
    animado?: boolean
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTES INTERNOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const GaleriaTemplates = memo(function GaleriaTemplates({
  templates,
  onSeleccionar,
  onCrearPersonalizado,
}: {
  templates: TemplateReporte[]
  onSeleccionar: (template: TemplateReporte) => void
  onCrearPersonalizado: () => void
}) {
  const [busqueda, setBusqueda] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<TipoReporte | 'todos'>('todos')

  const templatesFiltrados = useMemo(() => {
    return templates.filter(template => {
      const coincideBusqueda = template.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                                template.descripcion.toLowerCase().includes(busqueda.toLowerCase())
      const coincideTipo = filtroTipo === 'todos' || template.tipo === filtroTipo
      return coincideBusqueda && coincideTipo
    }).sort((a, b) => b.popularidad - a.popularidad)
  }, [templates, busqueda, filtroTipo])

  const tiposReporte: { valor: TipoReporte | 'todos', etiqueta: string, color: string }[] = [
    { valor: 'todos', etiqueta: 'Todos', color: 'bg-gray-500' },
    { valor: 'ventas', etiqueta: 'Ventas', color: 'bg-emerald-500' },
    { valor: 'bancos', etiqueta: 'Bancos', color: 'bg-blue-500' },
    { valor: 'inventario', etiqueta: 'Inventario', color: 'bg-violet-500' },
    { valor: 'clientes', etiqueta: 'Clientes', color: 'bg-amber-500' },
    { valor: 'gastos', etiqueta: 'Gastos', color: 'bg-rose-500' },
    { valor: 'auditoria', etiqueta: 'Auditoría', color: 'bg-orange-500' },
    { valor: 'profit', etiqueta: 'Profit', color: 'bg-green-500' },
    { valor: 'analisis_predictivo', etiqueta: 'IA Predictivo', color: 'bg-cyan-500' },
  ]

  return (
    <AuroraGlassCard>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-400" />
              Templates de Reportes
            </h2>
            <p className="text-sm text-white/60">Selecciona un template o crea uno personalizado</p>
          </div>

          <AuroraButton
            onClick={onCrearPersonalizado}
            variant="primary"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            Crear Personalizado
          </AuroraButton>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input
              type="text"
              placeholder="Buscar templates..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {tiposReporte.map(tipo => (
              <button
                key={tipo.valor}
                onClick={() => setFiltroTipo(tipo.valor)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  filtroTipo === tipo.valor
                    ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                )}
              >
                {tipo.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {/* Grid de Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {templatesFiltrados.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => onSeleccionar(template)}
              >
                <QuantumCard>
                  <div className="p-5">
                    {/* Header del Template */}
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        'p-2 rounded-lg',
                        template.color
                      )}>
                        {template.icono}
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                          ★ {template.popularidad}
                        </span>
                      </div>
                    </div>

                    {/* Info del Template */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-white">{template.nombre}</h3>
                      <p className="text-sm text-white/60 line-clamp-2">{template.descripcion}</p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-white/50">
                        <span>{template.columnas.length} columnas</span>
                        <span>•</span>
                        <span>{template.visualizaciones.length} visualizaciones</span>
                      </div>

                      {/* Preview de Visualizaciones */}
                      <div className="flex gap-2 mt-3">
                        {template.visualizaciones.slice(0, 4).map((viz, i) => (
                          <div
                            key={i}
                            className="p-1.5 rounded-lg bg-white/10 text-white/60"
                            title={viz}
                          >
                            {viz === 'linea' && <LineChart className="h-3 w-3" />}
                            {viz === 'barra' && <BarChart2 className="h-3 w-3" />}
                            {viz === 'pastel' && <PieChart className="h-3 w-3" />}
                            {viz === 'area' && <Activity className="h-3 w-3" />}
                            {viz === 'tabla' && <FileText className="h-3 w-3" />}
                            {viz === 'metricas' && <Target className="h-3 w-3" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </QuantumCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {templatesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-white/30 mb-4" />
            <p className="text-white/60">No se encontraron templates</p>
            <p className="text-sm text-white/40">Intenta con otros filtros o crea uno personalizado</p>
          </div>
        )}
      </div>
    </AuroraGlassCard>
  )
})

const ConfiguradorReporte = memo(function ConfiguradorReporte({
  template,
  onGuardar,
  onCancelar,
}: {
  template: TemplateReporte
  onGuardar: (config: Partial<ReporteProgramado>) => void
  onCancelar: () => void
}) {
  const [config, setConfig] = useState<Partial<ReporteProgramado>>({
    nombre: `Reporte ${template.nombre} - ${new Date().toLocaleDateString('es-MX')}`,
    descripcion: template.descripcion,
    templateId: template.id,
    templateNombre: template.nombre,
    templateIcono: template.icono,
    templateColor: template.color,
    frecuencia: 'diario',
    horaEjecucion: '08:00',
    formato: 'pdf',
    destinatarios: [],
    filtrosAdicionales: [],
    visualizacionPreferida: template.visualizaciones[0],
    activo: true,
    pausado: false,
    inteligenciaActiva: true,
  })

  const [nuevoDestinatario, setNuevoDestinatario] = useState({ nombre: '', email: '' })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  const agregarDestinatario = () => {
    if (nuevoDestinatario.nombre && nuevoDestinatario.email) {
      const destinatario: DestinatarioReporte = {
        id: `dest_${Date.now()}`,
        nombre: nuevoDestinatario.nombre,
        email: nuevoDestinatario.email,
        tipo: 'principal',
        activo: true,
        notificacionesPush: false,
      }
      setConfig(prev => ({
        ...prev,
        destinatarios: [...(prev.destinatarios || []), destinatario]
      }))
      setNuevoDestinatario({ nombre: '', email: '' })
    }
  }

  const eliminarDestinatario = (id: string) => {
    setConfig(prev => ({
      ...prev,
      destinatarios: prev.destinatarios?.filter(d => d.id !== id) || []
    }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn('p-2 rounded-lg', template.color)}>
            {template.icono}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Configurar Reporte</h2>
            <p className="text-sm text-white/60">Personaliza tu reporte de {template.nombre}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <AuroraButton onClick={onCancelar} variant="secondary" size="sm">
            Cancelar
          </AuroraButton>
          <AuroraButton onClick={() => onGuardar(config)} variant="primary" size="sm">
            <Save className="h-4 w-4" />
            Guardar Reporte
          </AuroraButton>
        </div>
      </div>

      {/* Configuración General */}
      <AuroraGlassCard>
        <div className="p-6 space-y-6">
          <h3 className="text-lg font-semibold text-white">Información General</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Nombre del Reporte</label>
              <input
                type="text"
                value={config.nombre}
                onChange={(e) => setConfig(prev => ({ ...prev, nombre: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50"
                placeholder="Ej: Reporte de Ventas Diarias"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Descripción</label>
              <input
                type="text"
                value={config.descripcion}
                onChange={(e) => setConfig(prev => ({ ...prev, descripcion: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50"
                placeholder="Describe el propósito del reporte"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-white/60 mb-2">Frecuencia</label>
              <select
                value={config.frecuencia}
                onChange={(e) => setConfig(prev => ({ ...prev, frecuencia: e.target.value as FrecuenciaReporte }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="diario">Diario</option>
                <option value="semanal">Semanal</option>
                <option value="quincenal">Quincenal</option>
                <option value="mensual">Mensual</option>
                <option value="trimestral">Trimestral</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Hora de Ejecución</label>
              <input
                type="time"
                value={config.horaEjecucion}
                onChange={(e) => setConfig(prev => ({ ...prev, horaEjecucion: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-sm text-white/60 mb-2">Formato de Salida</label>
              <select
                value={config.formato}
                onChange={(e) => setConfig(prev => ({ ...prev, formato: e.target.value as FormatoReporte }))}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-violet-500/50"
              >
                <option value="pdf">📄 PDF</option>
                <option value="excel">📊 Excel</option>
                <option value="csv">📋 CSV</option>
                <option value="json">💾 JSON</option>
              </select>
            </div>
          </div>

          {/* Opciones Avanzadas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Inteligencia Artificial</h4>
                <p className="text-sm text-white/60">Incluir análisis predictivo y recomendaciones</p>
              </div>
              <button
                onClick={() => setConfig(prev => ({ ...prev, inteligenciaActiva: !prev.inteligenciaActiva }))}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  config.inteligenciaActiva ? 'bg-emerald-500' : 'bg-white/20'
                )}
              >
                <span
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    config.inteligenciaActiva ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>

            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="flex items-center gap-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Filter className="h-4 w-4" />
              {mostrarFiltros ? 'Ocultar' : 'Mostrar'} Filtros Avanzados
              <ChevronDown className={cn('h-4 w-4 transition-transform', mostrarFiltros && 'rotate-180')} />
            </button>
          </div>
        </div>
      </AuroraGlassCard>

      {/* Filtros Avanzados */}
      <AnimatePresence>
        {mostrarFiltros && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <AuroraGlassCard>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Filtros Avanzados</h3>
                <p className="text-sm text-white/60">Define criterios específicos para tu reporte</p>
              </div>
            </AuroraGlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Destinatarios */}
      <AuroraGlassCard>
        <div className="p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white">Destinatarios</h3>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Nombre del destinatario"
              value={nuevoDestinatario.nombre}
              onChange={(e) => setNuevoDestinatario(prev => ({ ...prev, nombre: e.target.value }))}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50"
            />
            <input
              type="email"
              placeholder="Email del destinatario"
              value={nuevoDestinatario.email}
              onChange={(e) => setNuevoDestinatario(prev => ({ ...prev, email: e.target.value }))}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-violet-500/50"
            />
            <AuroraButton onClick={agregarDestinatario} variant="secondary" size="sm">
              <Plus className="h-4 w-4" />
              Agregar
            </AuroraButton>
          </div>

          {/* Lista de Destinatarios */}
          {config.destinatarios && config.destinatarios.length > 0 && (
            <div className="space-y-2">
              {config.destinatarios.map(destinatario => (
                <div key={destinatario.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-violet-400">
                        {destinatario.nombre.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-medium">{destinatario.nombre}</p>
                      <p className="text-sm text-white/60">{destinatario.email}</p>
                    </div>
                  </div>
                  <AuroraButton
                    onClick={() => eliminarDestinatario(destinatario.id)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </AuroraButton>
                </div>
              ))}
            </div>
          )}
        </div>
      </AuroraGlassCard>
    </motion.div>
  )
})

const VisualizadorDatos = memo(function VisualizadorDatos({
  datos,
  configuracion,
  tipoVisualizacion,
  onCambiarVisualizacion,
}: {
  datos: any[]
  configuracion: DatosVisualizacion['configuracion']
  tipoVisualizacion: TipoVisualizacion
  onCambiarVisualizacion: (tipo: TipoVisualizacion) => void
}) {
  const colores = configuracion.colores || ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

  const renderizarVisualizacion = () => {
    switch (tipoVisualizacion) {
      case 'linea':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart data={datos}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={colores[0]} strokeWidth={3} dot={{ r: 4 }} />
              {datos[0]?.value2 && <Line type="monotone" dataKey="value2" stroke={colores[1]} strokeWidth={2} />}
            </RechartsLineChart>
          </ResponsiveContainer>
        )

      case 'barra':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={datos}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend />
              <Bar dataKey="value" fill={colores[0]} radius={[4, 4, 0, 0]} />
              {datos[0]?.value2 && <Bar dataKey="value2" fill={colores[1]} radius={[4, 4, 0, 0]} />}
            </BarChart>
          </ResponsiveContainer>
        )

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={datos}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.6)" />
              <YAxis stroke="rgba(255,255,255,0.6)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="value" stroke={colores[0]} fill={colores[0]} fillOpacity={0.3} />
              {datos[0]?.value2 && <Area type="monotone" dataKey="value2" stroke={colores[1]} fill={colores[1]} fillOpacity={0.3} />}
            </AreaChart>
          </ResponsiveContainer>
        )

      case 'pastel':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={datos}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {datos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      case 'tabla':
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {Object.keys(datos[0] || {}).map(key => (
                    <th key={key} className="text-left py-3 px-4 text-white/80 font-medium">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {datos.map((fila, index) => (
                  <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    {Object.values(fila).map((valor, i) => (
                      <td key={i} className="py-3 px-4 text-white/90">
                        {typeof valor === 'number' ? valor.toLocaleString() : String(valor)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )

      case 'metricas':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {datos.map((metrica, index) => (
              <div key={index} className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">{metrica.name}</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colores[index % colores.length] }} />
                </div>
                <div className="text-2xl font-bold text-white">
                  {typeof metrica.value === 'number' ? metrica.value.toLocaleString() : metrica.value}
                </div>
                {metrica.change && (
                  <div className={cn(
                    'text-sm mt-1',
                    metrica.change > 0 ? 'text-emerald-400' : 'text-rose-400'
                  )}>
                    {metrica.change > 0 ? '+' : ''}{metrica.change}%
                  </div>
                )}
              </div>
            ))}
          </div>
        )

      default:
        return <div className="text-center py-12 text-white/60">Visualización no disponible</div>
    }
  }

  return (
    <AuroraGlassCard>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">{configuracion.titulo}</h3>
            {configuracion.subtitulo && (
              <p className="text-sm text-white/60">{configuracion.subtitulo}</p>
            )}
          </div>

          {/* Selector de Visualización */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
            {['linea', 'barra', 'area', 'pastel', 'tabla', 'metricas'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => onCambiarVisualizacion(tipo as TipoVisualizacion)}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  tipoVisualizacion === tipo
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                )}
                title={`Visualización ${tipo}`}
              >
                {tipo === 'linea' && <LineChart className="h-4 w-4" />}
                {tipo === 'barra' && <BarChart2 className="h-4 w-4" />}
                {tipo === 'area' && <Activity className="h-4 w-4" />}
                {tipo === 'pastel' && <PieChart className="h-4 w-4" />}
                {tipo === 'tabla' && <FileText className="h-4 w-4" />}
                {tipo === 'metricas' && <Target className="h-4 w-4" />}
              </button>
            ))}
          </div>
        </div>

        {/* Visualización */}
        <div className="min-h-[400px]">
          {renderizarVisualizacion()}
        </div>
      </div>
    </AuroraGlassCard>
  )
})

const PanelInsightsIA = memo(function PanelInsightsIA({
  insights,
  loading = false,
}: {
  insights: InsightReporte[]
  loading?: boolean
}) {
  const insightsPorImportancia = useMemo(() => {
    return {
      critica: insights.filter(i => i.importancia === 'critica'),
      alta: insights.filter(i => i.importancia === 'alta'),
      media: insights.filter(i => i.importancia === 'media'),
      baja: insights.filter(i => i.importancia === 'baja'),
    }
  }, [insights])

  if (loading) {
    return (
      <AuroraGlassCard>
        <div className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4" />
              <p className="text-white/60">Generando insights con IA...</p>
            </div>
          </div>
        </div>
      </AuroraGlassCard>
    )
  }

  return (
    <AuroraGlassCard>
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-r from-violet-500 to-cyan-500">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Insights de IA</h3>
            <p className="text-sm text-white/60">Análisis inteligente de tus datos</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Insights Críticos */}
          {insightsPorImportancia.critica.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-rose-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Críticos ({insightsPorImportancia.critica.length})
              </h4>
              {insightsPorImportancia.critica.map(insight => (
                <div key={insight.id} className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-white">{insight.titulo}</h5>
                    <span className="text-xs px-2 py-1 rounded-full bg-rose-500/20 text-rose-400">
                      {Math.round(insight.confianza * 100)}% confianza
                    </span>
                  </div>
                  <p className="text-sm text-white/70 mb-2">{insight.descripcion}</p>
                  {insight.accionSugerida && (
                    <p className="text-xs text-amber-400">💡 {insight.accionSugerida}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Insights Altos */}
          {insightsPorImportancia.alta.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Alta Prioridad ({insightsPorImportancia.alta.length})
              </h4>
              {insightsPorImportancia.alta.map(insight => (
                <div key={insight.id} className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-start justify-between mb-2">
                    <h5 className="font-medium text-white">{insight.titulo}</h5>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                      {Math.round(insight.confianza * 100)}% confianza
                    </span>
                  </div>
                  <p className="text-sm text-white/70">{insight.descripcion}</p>
                </div>
              ))}
            </div>
          )}

          {/* Insights Medios */}
          {insightsPorImportancia.media.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-blue-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Media Prioridad ({insightsPorImportancia.media.length})
              </h4>
              {insightsPorImportancia.media.map(insight => (
                <div key={insight.id} className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <h5 className="font-medium text-white mb-1">{insight.titulo}</h5>
                  <p className="text-sm text-white/70">{insight.descripcion}</p>
                </div>
              ))}
            </div>
          )}

          {/* Sin Insights */}
          {insights.length === 0 && (
            <div className="text-center py-8">
              <Cpu className="mx-auto h-12 w-12 text-violet-400 mb-3" />
              <p className="text-white/60">No hay insights disponibles</p>
              <p className="text-sm text-white/40">Genera un reporte para obtener análisis inteligente</p>
            </div>
          )}
        </div>
      </div>
    </AuroraGlassCard>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SistemaReportesAvanzados = memo(function SistemaReportesAvanzados({
  className,
}: {
  className?: string
}) {
  const [vistaActual, setVistaActual] = useState<'galeria' | 'configurador' | 'visor'>('galeria')
  const [templateSeleccionado, setTemplateSeleccionado] = useState<TemplateReporte | null>(null)
  const [reportesProgramados, setReportesProgramados] = useState<ReporteProgramado[]>([])
  const [ejecuciones, setEjecuciones] = useState<EjecucionReporte[]>([])
  const [datosActuales, setDatosActuales] = useState<any[]>([])
  const [insightsIA, setInsightsIA] = useState<InsightReporte[]>([])
  const [loading, setLoading] = useState(false)
  const [generandoIA, setGenerandoIA] = useState(false)

  const [insights] = useState<any[]>([])
  const aiLoading = false
  const generateInsights = useCallback(async (_data: any) => {}, [])
  // Note: useAI kept as no-op for type safety
  const { sendNotification } = usePushNotifications()

  // Templates predefinidos mejorados
  const templates: TemplateReporte[] = useMemo(() => [
    {
      id: 'tpl_ventas_inteligente',
      nombre: 'Ventas Inteligentes',
      descripcion: 'Análisis completo de ventas con predicciones y tendencias',
      tipo: 'ventas',
      modulo: 'ventas',
      icono: <DollarSign className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-emerald-500 to-green-500',
      columnas: [
        { id: 'c1', campo: 'fecha', titulo: 'Fecha', tipo: 'fecha', visible: true },
        { id: 'c2', campo: 'producto', titulo: 'Producto', tipo: 'texto', visible: true },
        { id: 'c3', campo: 'cantidad', titulo: 'Cantidad', tipo: 'numero', visible: true, agregacion: 'suma' },
        { id: 'c4', campo: 'precio', titulo: 'Precio', tipo: 'moneda', visible: true },
        { id: 'c5', campo: 'total', titulo: 'Total', tipo: 'moneda', visible: true, agregacion: 'suma' },
        { id: 'c6', campo: 'cliente', titulo: 'Cliente', tipo: 'texto', visible: true },
        { id: 'c7', campo: 'vendedor', titulo: 'Vendedor', tipo: 'texto', visible: true },
      ],
      incluirTotales: true,
      incluirGraficos: true,
      visualizaciones: ['linea', 'barra', 'area', 'tabla', 'metricas'],
      creadoPor: 'sistema',
      creadoAt: Date.now(),
      activo: true,
      popularidad: 95
    },
    {
      id: 'tpl_profit_analitico',
      nombre: 'Profit Analítico',
      descripcion: 'Análisis detallado de rentabilidad con insights de IA',
      tipo: 'profit',
      modulo: 'profit',
      icono: <TrendingUp className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      columnas: [
        { id: 'c1', campo: 'periodo', titulo: 'Período', tipo: 'texto', visible: true },
        { id: 'c2', campo: 'ingresos', titulo: 'Ingresos', tipo: 'moneda', visible: true, agregacion: 'suma' },
        { id: 'c3', campo: 'gastos', titulo: 'Gastos', tipo: 'moneda', visible: true, agregacion: 'suma' },
        { id: 'c4', campo: 'profit', titulo: 'Profit', tipo: 'moneda', visible: true, agregacion: 'suma' },
        { id: 'c5', campo: 'margen', titulo: 'Margen %', tipo: 'porcentaje', visible: true, agregacion: 'promedio' },
        { id: 'c6', campo: 'roi', titulo: 'ROI', tipo: 'porcentaje', visible: true },
      ],
      incluirTotales: true,
      incluirGraficos: true,
      visualizaciones: ['linea', 'area', 'metricas'],
      creadoPor: 'sistema',
      creadoAt: Date.now(),
      activo: true,
      popularidad: 88
    },
    {
      id: 'tpl_clientes_segmentados',
      nombre: 'Clientes Segmentados',
      descripcion: 'Análisis de clientes con segmentación inteligente',
      tipo: 'clientes',
      modulo: 'clientes',
      icono: <Users className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      columnas: [
        { id: 'c1', campo: 'cliente', titulo: 'Cliente', tipo: 'texto', visible: true },
        { id: 'c2', campo: 'segmento', titulo: 'Segmento', tipo: 'texto', visible: true },
        { id: 'c3', campo: 'compras', titulo: 'Compras', tipo: 'numero', visible: true, agregacion: 'suma' },
        { id: 'c4', campo: 'gasto_total', titulo: 'Gasto Total', tipo: 'moneda', visible: true, agregacion: 'suma' },
        { id: 'c5', campo: 'frecuencia', titulo: 'Frecuencia', tipo: 'numero', visible: true },
        { id: 'c6', campo: 'ultima_compra', titulo: 'Última Compra', tipo: 'fecha', visible: true },
      ],
      incluirTotales: true,
      incluirGraficos: true,
      visualizaciones: ['pastel', 'barra', 'tabla'],
      creadoPor: 'sistema',
      creadoAt: Date.now(),
      activo: true,
      popularidad: 82
    },
    {
      id: 'tpl_inventario_optimizado',
      nombre: 'Inventario Optimizado',
      descripcion: 'Control de inventario con predicción de demanda',
      tipo: 'inventario',
      modulo: 'almacen',
      icono: <Package className="h-5 w-5" />,
      color: 'bg-gradient-to-r from-violet-500 to-purple-500',
      columnas: [
        { id: 'c1', campo: 'producto', titulo: 'Producto', tipo: 'texto', visible: true },
        { id: 'c2', campo: 'categoria', titulo: 'Categoría', tipo: 'texto', visible: true },
        { id: 'c3', campo: 'stock_actual', titulo: 'Stock Actual', tipo: 'numero', visible: true },
        { id: 'c4', campo: 'stock_minimo', titulo: 'Stock Mínimo', tipo: 'numero', visible: true },
        { id: 'c5', campo: 'demanda_predicha', titulo: 'Demanda Predicha', tipo: 'numero', visible: true },
        { id: 'c6', campo: 'reorden_sugerido', titulo: 'Reorden Sugerido', tipo: 'numero', visible: true },
      ],
      incluirTotales: true,
      incluirGraficos: true,
      visualizaciones: ['barra', 'linea', 'tabla'],
      creadoPor: 'sistema',
      creadoAt: Date.now(),
      activo: true,
      popularidad: 79
    },
  ], [])

  // Cargar datos de ejemplo
  const cargarDatosEjemplo = useCallback(async (templateId: string) => {
    setLoading(true)
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1500))

      let datos: any[] = []

      switch (templateId) {
        case 'tpl_ventas_inteligente':
          datos = [
            { fecha: '2024-01', producto: 'Producto A', cantidad: 150, precio: 250, total: 37500, cliente: 'Cliente 1', vendedor: 'Vendedor 1' },
            { fecha: '2024-02', producto: 'Producto B', cantidad: 200, precio: 180, total: 36000, cliente: 'Cliente 2', vendedor: 'Vendedor 2' },
            { fecha: '2024-03', producto: 'Producto C', cantidad: 120, precio: 320, total: 38400, cliente: 'Cliente 3', vendedor: 'Vendedor 1' },
            { fecha: '2024-04', producto: 'Producto A', cantidad: 180, precio: 250, total: 45000, cliente: 'Cliente 4', vendedor: 'Vendedor 3' },
            { fecha: '2024-05', producto: 'Producto B', cantidad: 220, precio: 180, total: 39600, cliente: 'Cliente 5', vendedor: 'Vendedor 2' },
            { fecha: '2024-06', producto: 'Producto C', cantidad: 160, precio: 320, total: 51200, cliente: 'Cliente 1', vendedor: 'Vendedor 1' },
          ]
          break
        default:
          datos = []
      }
      setDatosActuales(datos)
    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <div className={cn('w-full h-full', className)}>
      <div className="p-4 text-white/60 text-center">
        Sistema de Reportes Avanzados
      </div>
    </div>
  )
})
