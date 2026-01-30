'use client'

import { memo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/app/_lib/utils'
import { Money } from './Money'
import {
  Calendar,
  Clock,
  FileText,
  Download,
  Mail,
  Bell,
  Settings,
  Play,
  Pause,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  ChevronDown,
  Repeat,
  CalendarDays,
  CalendarCheck,
  BarChart3,
  PieChart,
  TrendingUp,
  Wallet,
  Building2,
  Users,
  Package,
  AlertCircle,
} from 'lucide-react'

// ============================================
// TIPOS
// ============================================

type FrecuenciaCorte = 'diario' | 'semanal' | 'quincenal' | 'mensual' | 'personalizado'
type TipoReporte = 'general' | 'bancos' | 'ventas' | 'compras' | 'movimientos' | 'utilidades' | 'inventario'
type FormatoExport = 'pdf' | 'excel' | 'csv'

interface CorteProgramado {
  id: string
  nombre: string
  frecuencia: FrecuenciaCorte
  tipoReporte: TipoReporte
  formato: FormatoExport
  hora: string
  diasSemana?: number[]
  diaMes?: number
  bancos?: string[]
  enviarEmail: boolean
  emailDestino?: string
  notificar: boolean
  activo: boolean
  ultimoCorte?: string
  proximoCorte?: string
}

// ============================================
// CORTE PROGRAMADO CARD
// ============================================

interface CorteProgramadoCardProps {
  corte: CorteProgramado
  onToggle: (id: string) => void
  onEdit: (corte: CorteProgramado) => void
  onDelete: (id: string) => void
  onEjecutar: (id: string) => void
  className?: string
}

const frecuenciaLabels = {
  diario: 'Diario',
  semanal: 'Semanal',
  quincenal: 'Quincenal',
  mensual: 'Mensual',
  personalizado: 'Personalizado',
}

const tipoReporteConfig = {
  general: { icon: BarChart3, color: 'violet', label: 'General' },
  bancos: { icon: Wallet, color: 'emerald', label: 'Bancos' },
  ventas: { icon: TrendingUp, color: 'teal', label: 'Ventas' },
  compras: { icon: Package, color: 'blue', label: 'Compras' },
  movimientos: { icon: Repeat, color: 'amber', label: 'Movimientos' },
  utilidades: { icon: PieChart, color: 'green', label: 'Utilidades' },
  inventario: { icon: Package, color: 'orange', label: 'Inventario' },
}

export const CorteProgramadoCard = memo(function CorteProgramadoCard({
  corte,
  onToggle,
  onEdit,
  onDelete,
  onEjecutar,
  className,
}: CorteProgramadoCardProps) {
  const config = tipoReporteConfig[corte.tipoReporte]
  const Icon = config.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'p-4 rounded-xl border transition-all duration-300',
        corte.activo
          ? 'bg-gray-900/80 border-white/10'
          : 'bg-gray-900/40 border-white/5 opacity-60',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            `bg-${config.color}-500/20`
          )}>
            <Icon className={`w-5 h-5 text-${config.color}-400`} />
          </div>
          <div>
            <h4 className="font-medium text-white">{corte.nombre}</h4>
            <p className="text-xs text-gray-500">{config.label} • {corte.formato.toUpperCase()}</p>
          </div>
        </div>

        {/* Toggle */}
        <button
          onClick={() => onToggle(corte.id)}
          className={cn(
            'relative w-12 h-6 rounded-full transition-colors',
            corte.activo ? 'bg-emerald-500' : 'bg-gray-700'
          )}
        >
          <motion.div
            animate={{ x: corte.activo ? 24 : 2 }}
            className="absolute top-1 w-4 h-4 rounded-full bg-white"
          />
        </button>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Repeat className="w-4 h-4 text-gray-500" />
          <span className="text-gray-400">{frecuenciaLabels[corte.frecuencia]}</span>
          <span className="text-gray-600">•</span>
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-gray-400">{corte.hora}</span>
        </div>

        {corte.proximoCorte && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-gray-400">Próximo:</span>
            <span className="text-emerald-400">
              {new Date(corte.proximoCorte).toLocaleString('es-MX', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        )}

        {corte.enviarEmail && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-blue-500" />
            <span className="text-gray-400 truncate">{corte.emailDestino}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-white/5">
        <button
          onClick={() => onEjecutar(corte.id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
        >
          <Play className="w-4 h-4" />
          Ejecutar ahora
        </button>
        <button
          onClick={() => onEdit(corte)}
          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(corte.id)}
          className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
})

// ============================================
// PANEL PROGRAMAR CORTE
// ============================================

interface ProgramarCorteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (corte: Partial<CorteProgramado>) => void
  corteExistente?: CorteProgramado
}

export const ProgramarCorteModal = memo(function ProgramarCorteModal({
  isOpen,
  onClose,
  onSave,
  corteExistente,
}: ProgramarCorteModalProps) {
  const [formData, setFormData] = useState<Partial<CorteProgramado>>(
    corteExistente || {
      nombre: '',
      frecuencia: 'diario',
      tipoReporte: 'general',
      formato: 'pdf',
      hora: '08:00',
      enviarEmail: false,
      notificar: true,
      activo: true,
    }
  )

  const handleSave = () => {
    onSave(formData)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[500px] md:max-h-[80vh] overflow-auto z-50"
          >
            <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {corteExistente ? 'Editar Corte' : 'Programar Corte'}
                    </h3>
                    <p className="text-xs text-gray-500">Configura reportes automáticos</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="p-4 space-y-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nombre del corte</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej: Corte diario bancos"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                {/* Tipo de reporte */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Tipo de reporte</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(tipoReporteConfig).map(([key, cfg]) => {
                      const Icon = cfg.icon
                      return (
                        <button
                          key={key}
                          onClick={() => setFormData({ ...formData, tipoReporte: key as TipoReporte })}
                          className={cn(
                            'flex items-center gap-2 p-3 rounded-xl border transition-all',
                            formData.tipoReporte === key
                              ? 'bg-violet-500/20 border-violet-500/50 text-violet-400'
                              : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm">{cfg.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Frecuencia */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Frecuencia</label>
                  <select
                    value={formData.frecuencia}
                    onChange={(e) => setFormData({ ...formData, frecuencia: e.target.value as FrecuenciaCorte })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                  >
                    {Object.entries(frecuenciaLabels).map(([key, label]) => (
                      <option key={key} value={key} className="bg-gray-900">{label}</option>
                    ))}
                  </select>
                </div>

                {/* Hora */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Hora de ejecución</label>
                  <input
                    type="time"
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>

                {/* Formato */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Formato de exportación</label>
                  <div className="flex gap-2">
                    {(['pdf', 'excel', 'csv'] as FormatoExport[]).map((fmt) => (
                      <button
                        key={fmt}
                        onClick={() => setFormData({ ...formData, formato: fmt })}
                        className={cn(
                          'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                          formData.formato === fmt
                            ? 'bg-violet-500 text-white'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                        )}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Enviar por email */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-sm text-white">Enviar por correo</p>
                      <p className="text-xs text-gray-500">Recibe el reporte automáticamente</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, enviarEmail: !formData.enviarEmail })}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      formData.enviarEmail ? 'bg-blue-500' : 'bg-gray-700'
                    )}
                  >
                    <motion.div
                      animate={{ x: formData.enviarEmail ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white"
                    />
                  </button>
                </div>

                {formData.enviarEmail && (
                  <input
                    type="email"
                    value={formData.emailDestino || ''}
                    onChange={(e) => setFormData({ ...formData, emailDestino: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                  />
                )}

                {/* Notificaciones */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-amber-400" />
                    <div>
                      <p className="text-sm text-white">Notificaciones</p>
                      <p className="text-xs text-gray-500">Recibe alertas en la app</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, notificar: !formData.notificar })}
                    className={cn(
                      'relative w-12 h-6 rounded-full transition-colors',
                      formData.notificar ? 'bg-amber-500' : 'bg-gray-700'
                    )}
                  >
                    <motion.div
                      animate={{ x: formData.notificar ? 24 : 2 }}
                      className="absolute top-1 w-4 h-4 rounded-full bg-white"
                    />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-4 border-t border-white/10">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 text-gray-400 font-medium hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.nombre}
                  className="flex-1 py-2.5 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {corteExistente ? 'Guardar cambios' : 'Programar corte'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

// ============================================
// HISTORIAL DE CORTES
// ============================================

interface HistorialCorte {
  id: string
  nombre: string
  tipoReporte: TipoReporte
  fecha: string
  formato: FormatoExport
  estado: 'completado' | 'fallido' | 'pendiente'
  archivoUrl?: string
}

interface HistorialCortesProps {
  cortes: HistorialCorte[]
  onDescargar: (corte: HistorialCorte) => void
  className?: string
}

export const HistorialCortes = memo(function HistorialCortes({
  cortes,
  onDescargar,
  className,
}: HistorialCortesProps) {
  return (
    <div className={cn('p-5 rounded-2xl bg-gray-900/50 border border-white/10', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-violet-400" />
          <h3 className="font-semibold text-white">Historial de Cortes</h3>
        </div>
        <span className="text-xs text-gray-500">{cortes.length} reportes</span>
      </div>

      <div className="space-y-2">
        {cortes.map((corte) => {
          const config = tipoReporteConfig[corte.tipoReporte]
          const Icon = config.icon

          return (
            <div
              key={corte.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
            >
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', `bg-${config.color}-500/20`)}>
                <Icon className={`w-5 h-5 text-${config.color}-400`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{corte.nombre}</p>
                <p className="text-xs text-gray-500">
                  {new Date(corte.fecha).toLocaleString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'px-2 py-0.5 rounded text-xs font-medium',
                  corte.estado === 'completado' && 'bg-emerald-500/20 text-emerald-400',
                  corte.estado === 'fallido' && 'bg-red-500/20 text-red-400',
                  corte.estado === 'pendiente' && 'bg-amber-500/20 text-amber-400'
                )}>
                  {corte.estado}
                </span>
                {corte.estado === 'completado' && (
                  <button
                    onClick={() => onDescargar(corte)}
                    className="p-2 rounded-lg bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
})
