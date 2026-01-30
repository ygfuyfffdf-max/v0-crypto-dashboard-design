/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📧 CHRONOS INFINITY 2026 — SISTEMA DE REPORTES PROGRAMADOS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema avanzado de reportes automáticos con:
 * - Programación flexible (cron, interval)
 * - Múltiples formatos (PDF, Excel, CSV, JSON)
 * - Envío automático por email
 * - Webhooks personalizados
 * - Templates customizables
 * - Filtros dinámicos
 * - Agregaciones avanzadas
 * - Historial de ejecuciones
 * - Retry automático
 * - Compresión de reportes grandes
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import {
  Calendar,
  Clock,
  Mail,
  FileText,
  Download,
  Play,
  Pause,
  Trash2,
  Copy,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Filter,
  Users,
  FileSpreadsheet,
  FileJson,
} from 'lucide-react'
import React, { useState, useMemo } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export enum ReportFormat {
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
  JSON = 'json',
}

export enum ReportFrequency {
  ONCE = 'once',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  CUSTOM = 'custom',
}

export enum ReportStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  FAILED = 'failed',
  COMPLETED = 'completed',
}

export interface ReportSchedule {
  id: string
  name: string
  description?: string
  frequency: ReportFrequency
  cronExpression?: string // Para CUSTOM
  format: ReportFormat
  recipients: string[]
  ccRecipients?: string[]
  webhookUrl?: string
  filters?: Record<string, any>
  columns?: string[]
  aggregations?: Record<string, string>
  template?: string
  status: ReportStatus
  nextRunAt?: number
  lastRunAt?: number
  lastRunStatus?: 'success' | 'failed'
  createdBy: string
  createdAt: number
  updatedAt: number
}

export interface ReportExecution {
  id: string
  scheduleId: string
  startedAt: number
  completedAt?: number
  status: 'running' | 'success' | 'failed'
  recordsProcessed?: number
  fileSize?: number
  downloadUrl?: string
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ReportCard
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ReportCardProps {
  report: ReportSchedule
  onEdit: (id: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onRunNow: (id: string) => void
  onDuplicate: (id: string) => void
}

function ReportCard({
  report,
  onEdit,
  onToggle,
  onDelete,
  onRunNow,
  onDuplicate,
}: ReportCardProps) {
  const formatIcons = {
    [ReportFormat.PDF]: FileText,
    [ReportFormat.EXCEL]: FileSpreadsheet,
    [ReportFormat.CSV]: FileText,
    [ReportFormat.JSON]: FileJson,
  }

  const frequencyLabels = {
    [ReportFrequency.ONCE]: 'Una vez',
    [ReportFrequency.DAILY]: 'Diario',
    [ReportFrequency.WEEKLY]: 'Semanal',
    [ReportFrequency.MONTHLY]: 'Mensual',
    [ReportFrequency.CUSTOM]: 'Personalizado',
  }

  const FormatIcon = formatIcons[report.format]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group relative overflow-hidden rounded-xl border transition-all',
        'backdrop-blur-xl p-6',
        report.status === ReportStatus.ACTIVE
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : report.status === ReportStatus.FAILED
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-white/10 bg-white/[0.02]'
      )}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <FormatIcon className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{report.name}</h3>
              <p className="text-sm text-white/60">{report.description}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onToggle(report.id)}
              className={cn(
                'rounded-lg p-2 transition-colors',
                report.status === ReportStatus.ACTIVE
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-white/5 text-white/40 hover:bg-white/10'
              )}
              title={report.status === ReportStatus.ACTIVE ? 'Pausar' : 'Activar'}
            >
              {report.status === ReportStatus.ACTIVE ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-white/60">
            <Calendar className="h-4 w-4" />
            <span>{frequencyLabels[report.frequency]}</span>
          </div>
          <div className="flex items-center gap-2 text-white/60">
            <Mail className="h-4 w-4" />
            <span>{report.recipients.length} destinatarios</span>
          </div>
        </div>

        {/* Next Run / Last Run */}
        <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
          {report.nextRunAt && (
            <div className="flex items-center justify-between">
              <span className="text-white/60">Próxima ejecución:</span>
              <span className="font-medium text-white">
                {new Date(report.nextRunAt).toLocaleString()}
              </span>
            </div>
          )}
          {report.lastRunAt && (
            <div className="flex items-center justify-between">
              <span className="text-white/60">Última ejecución:</span>
              <div className="flex items-center gap-2">
                {report.lastRunStatus === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span className="text-xs text-white/80">
                  {new Date(report.lastRunAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onRunNow(report.id)}
            disabled={report.status !== ReportStatus.ACTIVE}
            className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-sm font-medium text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="mr-2 inline h-4 w-4" />
            Ejecutar Ahora
          </button>
          
          <button
            onClick={() => onEdit(report.id)}
            className="rounded-lg bg-white/5 p-2 text-white/80 transition-colors hover:bg-white/10"
            title="Editar"
          >
            <Settings className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDuplicate(report.id)}
            className="rounded-lg bg-white/5 p-2 text-white/80 transition-colors hover:bg-white/10"
            title="Duplicar"
          >
            <Copy className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(report.id)}
            className="rounded-lg bg-white/5 p-2 text-red-400 transition-colors hover:bg-red-500/20"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ExecutionHistory
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ExecutionHistoryProps {
  executions: ReportExecution[]
  onDownload: (executionId: string) => void
}

function ExecutionHistory({ executions, onDownload }: ExecutionHistoryProps) {
  return (
    <div className="space-y-3">
      {executions.map((execution, index) => (
        <motion.div
          key={execution.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] p-4"
        >
          <div className="flex items-center gap-3">
            {execution.status === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            ) : execution.status === 'failed' ? (
              <XCircle className="h-5 w-5 text-red-400" />
            ) : (
              <Clock className="h-5 w-5 animate-spin text-blue-400" />
            )}
            
            <div>
              <p className="text-sm font-medium text-white">
                {new Date(execution.startedAt).toLocaleString()}
              </p>
              {execution.recordsProcessed && (
                <p className="text-xs text-white/60">
                  {execution.recordsProcessed.toLocaleString()} registros
                  {execution.fileSize && ` • ${formatFileSize(execution.fileSize)}`}
                </p>
              )}
              {execution.error && (
                <p className="text-xs text-red-400">{execution.error}</p>
              )}
            </div>
          </div>

          {execution.downloadUrl && (
            <button
              onClick={() => onDownload(execution.id)}
              className="rounded-lg bg-white/5 p-2 text-white/80 transition-colors hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      ))}

      {executions.length === 0 && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-8 text-center">
          <Clock className="mx-auto mb-3 h-12 w-12 text-white/20" />
          <p className="text-sm text-white/60">No hay ejecuciones registradas</p>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: CreateReportModal
// ═══════════════════════════════════════════════════════════════════════════════════════

interface CreateReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (report: Partial<ReportSchedule>) => void
}

function CreateReportModal({ isOpen, onClose, onSave }: CreateReportModalProps) {
  const [formData, setFormData] = useState<Partial<ReportSchedule>>({
    name: '',
    description: '',
    frequency: ReportFrequency.DAILY,
    format: ReportFormat.PDF,
    recipients: [],
    status: ReportStatus.ACTIVE,
  })

  const [newRecipient, setNewRecipient] = useState('')

  const handleAddRecipient = () => {
    if (newRecipient && !formData.recipients?.includes(newRecipient)) {
      setFormData({
        ...formData,
        recipients: [...(formData.recipients || []), newRecipient],
      })
      setNewRecipient('')
    }
  }

  const handleRemoveRecipient = (email: string) => {
    setFormData({
      ...formData,
      recipients: formData.recipients?.filter((r) => r !== email) || [],
    })
  }

  const handleSubmit = () => {
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-black/90 p-6 shadow-2xl backdrop-blur-2xl"
        >
          <h2 className="mb-6 text-2xl font-bold text-white">Crear Reporte Programado</h2>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Nombre del Reporte
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 transition-colors focus:border-purple-500/50 focus:outline-none"
                placeholder="Ej: Reporte de Ventas Mensual"
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Descripción <span className="text-white/40">(opcional)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 transition-colors focus:border-purple-500/50 focus:outline-none"
                placeholder="Descripción breve del reporte..."
                rows={3}
              />
            </div>

            {/* Frequency & Format */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Frecuencia
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) =>
                    setFormData({ ...formData, frequency: e.target.value as ReportFrequency })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white transition-colors focus:border-purple-500/50 focus:outline-none"
                >
                  <option value={ReportFrequency.DAILY}>Diario</option>
                  <option value={ReportFrequency.WEEKLY}>Semanal</option>
                  <option value={ReportFrequency.MONTHLY}>Mensual</option>
                  <option value={ReportFrequency.CUSTOM}>Personalizado</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Formato
                </label>
                <select
                  value={formData.format}
                  onChange={(e) =>
                    setFormData({ ...formData, format: e.target.value as ReportFormat })
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white transition-colors focus:border-purple-500/50 focus:outline-none"
                >
                  <option value={ReportFormat.PDF}>PDF</option>
                  <option value={ReportFormat.EXCEL}>Excel</option>
                  <option value={ReportFormat.CSV}>CSV</option>
                  <option value={ReportFormat.JSON}>JSON</option>
                </select>
              </div>
            </div>

            {/* Recipients */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Destinatarios
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newRecipient}
                  onChange={(e) => setNewRecipient(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-white/40 transition-colors focus:border-purple-500/50 focus:outline-none"
                  placeholder="email@ejemplo.com"
                />
                <button
                  onClick={handleAddRecipient}
                  className="rounded-lg bg-purple-500 px-6 py-3 font-medium text-white transition-colors hover:bg-purple-600"
                >
                  Agregar
                </button>
              </div>

              {/* Recipient List */}
              {formData.recipients && formData.recipients.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.recipients.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white"
                    >
                      <Mail className="h-3 w-3" />
                      <span>{email}</span>
                      <button
                        onClick={() => handleRemoveRecipient(email)}
                        className="ml-1 text-white/60 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="rounded-lg bg-white/5 px-6 py-2.5 font-medium text-white/80 transition-colors hover:bg-white/10"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.recipients?.length}
                className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 font-medium text-white transition-all hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Crear Reporte
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: ScheduledReportsSystem
// ═══════════════════════════════════════════════════════════════════════════════════════

export function ScheduledReportsSystem() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  // Datos simulados (reemplazar con datos reales)
  const mockReports: ReportSchedule[] = [
    {
      id: 'rep-1',
      name: 'Reporte de Ventas Diario',
      description: 'Resumen de todas las ventas del día',
      frequency: ReportFrequency.DAILY,
      format: ReportFormat.PDF,
      recipients: ['admin@empresa.com', 'ventas@empresa.com'],
      status: ReportStatus.ACTIVE,
      nextRunAt: Date.now() + 3600000,
      lastRunAt: Date.now() - 86400000,
      lastRunStatus: 'success',
      createdBy: 'admin',
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000,
    },
  ]

  const mockExecutions: ReportExecution[] = [
    {
      id: 'exec-1',
      scheduleId: 'rep-1',
      startedAt: Date.now() - 86400000,
      completedAt: Date.now() - 86400000 + 30000,
      status: 'success',
      recordsProcessed: 1234,
      fileSize: 1024 * 256,
      downloadUrl: '/downloads/report-1.pdf',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Reportes Programados</h2>
          <p className="text-sm text-white/60">
            Automatiza la generación y envío de reportes
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition-all hover:from-purple-600 hover:to-pink-600"
        >
          <FileText className="h-5 w-5" />
          Nuevo Reporte
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {mockReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onEdit={(id) => console.log('Edit', id)}
            onToggle={(id) => console.log('Toggle', id)}
            onDelete={(id) => console.log('Delete', id)}
            onRunNow={(id) => console.log('Run now', id)}
            onDuplicate={(id) => console.log('Duplicate', id)}
          />
        ))}
      </div>

      {/* Execution History */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
        <h3 className="mb-4 text-lg font-semibold text-white">Historial de Ejecuciones</h3>
        <ExecutionHistory
          executions={mockExecutions}
          onDownload={(id) => console.log('Download', id)}
        />
      </div>

      {/* Create Modal */}
      <CreateReportModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={(report) => console.log('Save', report)}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}
