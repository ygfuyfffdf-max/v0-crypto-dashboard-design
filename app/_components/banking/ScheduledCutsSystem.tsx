'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🗓️ SCHEDULED CUTS SYSTEM — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de cortes programados con:
 * - Programación de cortes diarios, semanales, mensuales
 * - Generación automática de reportes
 * - Notificaciones y alertas
 * - Historial de cortes
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Calendar,
  CalendarClock,
  Check,
  ChevronRight,
  Clock,
  Download,
  FileBarChart,
  History,
  Loader2,
  Mail,
  Play,
  Plus,
  RefreshCw,
  Settings,
  Trash2,
  X,
  Bell,
  Repeat,
  CalendarDays,
  FileText,
  Building2,
  AlertCircle,
  CheckCircle2,
  Timer,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type ScheduleFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom'
type CutStatus = 'pending' | 'processing' | 'completed' | 'failed'
type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json'

interface ScheduledCut {
  id: string
  nombre: string
  descripcion?: string
  frecuencia: ScheduleFrequency
  hora: string // HH:mm format
  diasSemana?: number[] // 0-6 for weekly
  diaDelMes?: number // 1-31 for monthly
  bancosIncluidos: string[]
  incluirVentas: boolean
  incluirGastos: boolean
  incluirTransferencias: boolean
  incluirAbonos: boolean
  formatoReporte: ReportFormat
  enviarPorEmail: boolean
  emailDestino?: string
  activo: boolean
  ultimaEjecucion?: Date
  proximaEjecucion?: Date
  createdAt: Date
}

interface CutHistory {
  id: string
  scheduledCutId: string
  nombreCorte: string
  fechaEjecucion: Date
  estado: CutStatus
  resumen: {
    totalIngresos: number
    totalEgresos: number
    totalAbonos: number
    totalGastos: number
    balanceFinal: number
    movimientosProcesados: number
  }
  reporteUrl?: string
  errorMensaje?: string
  duracionMs?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ScheduledCutSchema = z.object({
  nombre: z.string().min(1, 'Nombre requerido'),
  descripcion: z.string().optional(),
  frecuencia: z.enum(['daily', 'weekly', 'biweekly', 'monthly', 'custom']),
  hora: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Hora inválida'),
  diasSemana: z.array(z.number().min(0).max(6)).optional(),
  diaDelMes: z.number().min(1).max(31).optional(),
  bancosIncluidos: z.array(z.string()).min(1, 'Selecciona al menos un banco'),
  incluirVentas: z.boolean().default(true),
  incluirGastos: z.boolean().default(true),
  incluirTransferencias: z.boolean().default(true),
  incluirAbonos: z.boolean().default(true),
  formatoReporte: z.enum(['pdf', 'excel', 'csv', 'json']).default('pdf'),
  enviarPorEmail: z.boolean().default(false),
  emailDestino: z.string().email().optional().or(z.literal('')),
  activo: z.boolean().default(true),
})

type ScheduledCutInput = z.infer<typeof ScheduledCutSchema>

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ScheduleCardProps {
  schedule: ScheduledCut
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
  onRunNow: () => void
}

const ScheduleCard = memo(function ScheduleCard({
  schedule,
  onEdit,
  onDelete,
  onToggle,
  onRunNow,
}: ScheduleCardProps) {
  const frequencyLabels = {
    daily: 'Diario',
    weekly: 'Semanal',
    biweekly: 'Quincenal',
    monthly: 'Mensual',
    custom: 'Personalizado',
  }

  const diasSemanaLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 transition-all',
        schedule.activo
          ? 'border-violet-500/30 bg-gradient-to-br from-violet-500/10 to-purple-500/5'
          : 'border-white/10 bg-white/5 opacity-60'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <motion.button
          onClick={onToggle}
          className={cn(
            'h-6 w-11 rounded-full p-0.5 transition-colors',
            schedule.activo ? 'bg-violet-500' : 'bg-white/20'
          )}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="h-5 w-5 rounded-full bg-white shadow-sm"
            animate={{ x: schedule.activo ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </motion.button>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={cn(
          'rounded-xl p-2.5',
          schedule.activo ? 'bg-violet-500/20 text-violet-400' : 'bg-white/10 text-white/50'
        )}>
          <CalendarClock className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{schedule.nombre}</h3>
          {schedule.descripcion && (
            <p className="text-sm text-white/50 truncate">{schedule.descripcion}</p>
          )}
        </div>
      </div>

      {/* Schedule Info */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Repeat className="h-4 w-4 text-amber-400" />
          <span className="text-white/70">{frequencyLabels[schedule.frecuencia]}</span>
          <span className="text-white/40">•</span>
          <Clock className="h-4 w-4 text-blue-400" />
          <span className="text-white/70">{schedule.hora}</span>
        </div>

        {schedule.frecuencia === 'weekly' && schedule.diasSemana && (
          <div className="flex gap-1">
            {[0, 1, 2, 3, 4, 5, 6].map((dia) => (
              <span
                key={dia}
                className={cn(
                  'px-2 py-0.5 text-xs rounded',
                  schedule.diasSemana?.includes(dia)
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'bg-white/5 text-white/30'
                )}
              >
                {diasSemanaLabels[dia]}
              </span>
            ))}
          </div>
        )}

        {schedule.frecuencia === 'monthly' && schedule.diaDelMes && (
          <div className="text-sm text-white/50">
            Día {schedule.diaDelMes} de cada mes
          </div>
        )}
      </div>

      {/* Banks included */}
      <div className="mt-4 flex items-center gap-2">
        <Building2 className="h-4 w-4 text-amber-400" />
        <span className="text-sm text-white/50">
          {schedule.bancosIncluidos.length} {schedule.bancosIncluidos.length === 1 ? 'banco' : 'bancos'}
        </span>
      </div>

      {/* Next execution */}
      {schedule.proximaEjecucion && schedule.activo && (
        <div className="mt-3 flex items-center gap-2 text-sm">
          <Timer className="h-4 w-4 text-emerald-400" />
          <span className="text-white/50">Próximo:</span>
          <span className="text-emerald-400">
            {new Date(schedule.proximaEjecucion).toLocaleString('es-MX', {
              dateStyle: 'short',
              timeStyle: 'short',
            })}
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 pt-4 border-t border-white/10">
        <motion.button
          onClick={onRunNow}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500/30 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Play className="h-3.5 w-3.5" />
          Ejecutar
        </motion.button>
        <motion.button
          onClick={onEdit}
          className="rounded-lg bg-white/10 p-1.5 text-white/50 hover:text-white hover:bg-white/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Settings className="h-4 w-4" />
        </motion.button>
        <motion.button
          onClick={onDelete}
          className="rounded-lg bg-white/10 p-1.5 text-rose-400/50 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HISTORY ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HistoryItemProps {
  item: CutHistory
  onViewDetails: () => void
  onDownload: () => void
}

const HistoryItem = memo(function HistoryItem({
  item,
  onViewDetails,
  onDownload,
}: HistoryItemProps) {
  const statusConfig = {
    pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Pendiente' },
    processing: { icon: RefreshCw, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Procesando' },
    completed: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Completado' },
    failed: { icon: AlertCircle, color: 'text-rose-400', bg: 'bg-rose-500/20', label: 'Fallido' },
  }

  const status = statusConfig[item.estado]
  const StatusIcon = status.icon

  return (
    <motion.div
      className="flex items-center gap-4 rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors cursor-pointer"
      onClick={onViewDetails}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className={cn('rounded-lg p-2', status.bg)}>
        <StatusIcon className={cn('h-4 w-4', status.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{item.nombreCorte}</p>
        <p className="text-sm text-white/50">
          {new Date(item.fechaEjecucion).toLocaleString('es-MX', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-medium text-white">
          {formatCurrency(item.resumen.balanceFinal)}
        </p>
        <p className="text-xs text-white/40">
          {item.resumen.movimientosProcesados} movimientos
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className={cn(
          'px-2 py-1 rounded text-xs font-medium',
          status.bg_, status.color
        )}>
          {status.label}
        </span>

        {item.reporteUrl && (
          <motion.button
            onClick={(e) => {
              e.stopPropagation()
              onDownload()
            }}
            className="rounded-lg bg-violet-500/20 p-2 text-violet-400 hover:bg-violet-500/30 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CREATE/EDIT MODAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  schedule?: ScheduledCut
  bancos: Array<{ id: string; nombre: string }>
  onSave: (data: ScheduledCutInput) => void
}

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
]

function ScheduleModal({ isOpen, onClose, schedule, bancos, onSave }: ScheduleModalProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<ScheduledCutInput>({
    resolver: zodResolver(ScheduledCutSchema),
    defaultValues: schedule
      ? {
          nombre: schedule.nombre,
          descripcion: schedule.descripcion || '',
          frecuencia: schedule.frecuencia,
          hora: schedule.hora,
          diasSemana: schedule.diasSemana || [],
          diaDelMes: schedule.diaDelMes || 1,
          bancosIncluidos: schedule.bancosIncluidos,
          incluirVentas: schedule.incluirVentas,
          incluirGastos: schedule.incluirGastos,
          incluirTransferencias: schedule.incluirTransferencias,
          incluirAbonos: schedule.incluirAbonos,
          formatoReporte: schedule.formatoReporte,
          enviarPorEmail: schedule.enviarPorEmail,
          emailDestino: schedule.emailDestino || '',
          activo: schedule.activo,
        }
      : {
          nombre: '',
          descripcion: '',
          frecuencia: 'daily',
          hora: '23:59',
          diasSemana: [],
          diaDelMes: 1,
          bancosIncluidos: bancos.map((b) => b.id),
          incluirVentas: true,
          incluirGastos: true,
          incluirTransferencias: true,
          incluirAbonos: true,
          formatoReporte: 'pdf',
          enviarPorEmail: false,
          emailDestino: '',
          activo: true,
        },
  })

  const watchedFrequency = form.watch('frecuencia')
  const watchedEnviarEmail = form.watch('enviarPorEmail')

  const handleSubmit = form.handleSubmit((data) => {
    startTransition(() => {
      onSave(data)
    })
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-violet-500/20 bg-gradient-to-br from-slate-900 to-slate-800 p-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-violet-500/20 p-2.5">
                  <CalendarClock className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {schedule ? 'Editar Corte Programado' : 'Nuevo Corte Programado'}
                  </h2>
                  <p className="text-sm text-white/50">
                    Configura la automatización del corte
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Nombre del Corte
                  </label>
                  <input
                    {...form.register('nombre')}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder="Ej: Corte diario nocturno"
                  />
                  {form.formState.errors.nombre && (
                    <p className="mt-1 text-sm text-rose-400">
                      {form.formState.errors.nombre.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Descripción (opcional)
                  </label>
                  <input
                    {...form.register('descripcion')}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                    placeholder="Descripción breve..."
                  />
                </div>
              </div>

              {/* Schedule Config */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Programación
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm text-white/50 mb-2">Frecuencia</label>
                    <select
                      {...form.register('frecuencia')}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                    >
                      <option value="daily">Diario</option>
                      <option value="weekly">Semanal</option>
                      <option value="biweekly">Quincenal</option>
                      <option value="monthly">Mensual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-white/50 mb-2">Hora de ejecución</label>
                    <input
                      type="time"
                      {...form.register('hora')}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Weekly days */}
                {watchedFrequency === 'weekly' && (
                  <div>
                    <label className="block text-sm text-white/50 mb-2">Días de la semana</label>
                    <div className="flex flex-wrap gap-2">
                      {DIAS_SEMANA.map((dia) => {
                        const diasSeleccionados = form.watch('diasSemana') || []
                        const isSelected = diasSeleccionados.includes(dia.value)
                        return (
                          <button
                            key={dia.value}
                            type="button"
                            onClick={() => {
                              const current = form.getValues('diasSemana') || []
                              if (isSelected) {
                                form.setValue('diasSemana', current.filter((d) => d !== dia.value))
                              } else {
                                form.setValue('diasSemana', [...current, dia.value])
                              }
                            }}
                            className={cn(
                              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                              isSelected
                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                            )}
                          >
                            {dia.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Monthly day */}
                {watchedFrequency === 'monthly' && (
                  <div>
                    <label className="block text-sm text-white/50 mb-2">Día del mes</label>
                    <input
                      type="number"
                      min={1}
                      max={31}
                      {...form.register('diaDelMes', { valueAsNumber: true })}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Banks Selection */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Bancos a incluir
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {bancos.map((banco) => {
                    const bancosSeleccionados = form.watch('bancosIncluidos') || []
                    const isSelected = bancosSeleccionados.includes(banco.id)
                    return (
                      <button
                        key={banco.id}
                        type="button"
                        onClick={() => {
                          const current = form.getValues('bancosIncluidos') || []
                          if (isSelected) {
                            form.setValue('bancosIncluidos', current.filter((id) => id !== banco.id))
                          } else {
                            form.setValue('bancosIncluidos', [...current, banco.id])
                          }
                        }}
                        className={cn(
                          'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                          isSelected
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'
                        )}
                      >
                        {banco.nombre}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Include Options */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Incluir en el corte
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { name: 'incluirVentas', label: 'Ventas' },
                    { name: 'incluirGastos', label: 'Gastos' },
                    { name: 'incluirTransferencias', label: 'Transferencias' },
                    { name: 'incluirAbonos', label: 'Abonos' },
                  ].map((option) => (
                    <label
                      key={option.name}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        {...form.register(option.name as keyof ScheduledCutInput)}
                        className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
                      />
                      <span className="text-sm text-white/70">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Report Format */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-white/50 mb-2">Formato del reporte</label>
                  <select
                    {...form.register('formatoReporte')}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-violet-500 focus:outline-none"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      {...form.register('enviarPorEmail')}
                      className="rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
                    />
                    <span className="text-sm text-white/70">Enviar por email</span>
                  </label>
                  {watchedEnviarEmail && (
                    <input
                      type="email"
                      {...form.register('emailDestino')}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none"
                      placeholder="email@ejemplo.com"
                    />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 px-6 py-2 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {schedule ? 'Guardar Cambios' : 'Crear Corte'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ScheduledCutsSystemProps {
  className?: string
  bancos: Array<{ id: string; nombre: string }>
}

export function ScheduledCutsSystem({ className, bancos }: ScheduledCutsSystemProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<ScheduledCut | undefined>()
  const [activeTab, setActiveTab] = useState<'schedules' | 'history'>('schedules')
  const queryClient = useQueryClient()

  // Fetch scheduled cuts
  const { data: schedules, isLoading: schedulesLoading } = useQuery<ScheduledCut[]>({
    queryKey: ['scheduled-cuts'],
    queryFn: async () => {
      const res = await fetch('/api/cortes/programados')
      if (!res.ok) throw new Error('Failed to fetch schedules')
      return res.json()
    },
  })

  // Fetch history
  const { data: history, isLoading: historyLoading } = useQuery<CutHistory[]>({
    queryKey: ['cut-history'],
    queryFn: async () => {
      const res = await fetch('/api/cortes/historial?limit=20')
      if (!res.ok) throw new Error('Failed to fetch history')
      return res.json()
    },
    enabled: activeTab === 'history',
  })

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: ScheduledCutInput) => {
      const res = await fetch('/api/cortes/programados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create schedule')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled-cuts'] })
      toast.success('Corte programado creado')
      setIsModalOpen(false)
    },
    onError: () => {
      toast.error('Error al crear corte programado')
    },
  })

  const handleOpenCreate = useCallback(() => {
    setEditingSchedule(undefined)
    setIsModalOpen(true)
  }, [])

  const handleOpenEdit = useCallback((schedule: ScheduledCut) => {
    setEditingSchedule(schedule)
    setIsModalOpen(true)
  }, [])

  const handleSave = useCallback((data: ScheduledCutInput) => {
    createMutation.mutate(data)
  }, [createMutation])

  const handleRunNow = useCallback(async (scheduleId: string) => {
    try {
      const res = await fetch(`/api/cortes/ejecutar/${scheduleId}`, { method: 'POST' })
      if (!res.ok) throw new Error()
      toast.success('Corte ejecutado correctamente')
      queryClient.invalidateQueries({ queryKey: ['cut-history'] })
    } catch {
      toast.error('Error al ejecutar corte')
    }
  }, [queryClient])

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarClock className="h-6 w-6 text-violet-400" />
            Sistema de Cortes
          </h2>
          <p className="text-sm text-white/50">
            Programa cortes automáticos y genera reportes
          </p>
        </div>
        <motion.button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500 text-white font-medium hover:bg-violet-600 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-4 w-4" />
          Nuevo Corte
        </motion.button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 rounded-xl bg-white/5 p-1">
        <button
          onClick={() => setActiveTab('schedules')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'schedules'
              ? 'bg-violet-500/20 text-violet-400'
              : 'text-white/50 hover:text-white/70'
          )}
        >
          <CalendarDays className="h-4 w-4" />
          Programados
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            activeTab === 'history'
              ? 'bg-violet-500/20 text-violet-400'
              : 'text-white/50 hover:text-white/70'
          )}
        >
          <History className="h-4 w-4" />
          Historial
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'schedules' ? (
          <motion.div
            key="schedules"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {schedulesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
              </div>
            ) : schedules && schedules.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {schedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onEdit={() => handleOpenEdit(schedule)}
                    onDelete={() => {}}
                    onToggle={() => {}}
                    onRunNow={() => handleRunNow(schedule.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-violet-500/10 p-4 mb-4">
                  <CalendarClock className="h-8 w-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Sin cortes programados
                </h3>
                <p className="text-sm text-white/50 mb-4">
                  Crea tu primer corte programado para automatizar tus reportes
                </p>
                <button
                  onClick={handleOpenCreate}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Crear primer corte
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-2"
          >
            {historyLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
              </div>
            ) : history && history.length > 0 ? (
              history.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onViewDetails={() => {}}
                  onDownload={() => {}}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-violet-500/10 p-4 mb-4">
                  <History className="h-8 w-8 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Sin historial
                </h3>
                <p className="text-sm text-white/50">
                  Los cortes ejecutados aparecerán aquí
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        schedule={editingSchedule}
        bancos={bancos}
        onSave={handleSave}
      />
    </div>
  )
}

export default ScheduledCutsSystem
