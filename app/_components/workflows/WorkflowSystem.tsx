/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS INFINITY 2026 — SISTEMA DE WORKFLOWS MULTI-NIVEL
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de aprobaciones y workflows con:
 * - Workflows multi-nivel configurables
 * - Estados y transiciones personalizables
 * - Aprobaciones en paralelo y secuencial
 * - Historial completo de acciones
 * - Notificaciones en tiempo real
 * - Reglas de escalamiento
 * - SLA tracking
 * - Delegación de aprobaciones
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import {
    AlertCircle,
    ArrowRight,
    Calendar,
    CheckCircle2,
    Clock,
    FileText,
    User,
    Users,
    XCircle
} from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export enum WorkflowStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

export enum ApprovalType {
  SEQUENTIAL = 'sequential', // Uno después del otro
  PARALLEL = 'parallel',     // Todos al mismo tiempo
  QUORUM = 'quorum',         // X de N aprobaciones
}

export interface WorkflowStage {
  id: string
  name: string
  description?: string
  approvers: string[]
  approvalType: ApprovalType
  requiredApprovals?: number // Para QUORUM
  slaHours?: number
  allowDelegation?: boolean
  allowSkip?: boolean
  autoApproveConditions?: Record<string, any>
}

export interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  stages: WorkflowStage[]
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export interface WorkflowApproval {
  stageId: string
  approverId: string
  status: 'pending' | 'approved' | 'rejected'
  comment?: string
  timestamp?: number
  delegatedTo?: string
}

export interface WorkflowInstance {
  id: string
  templateId: string
  title: string
  description?: string
  requestedBy: string
  requestedAt: number
  status: WorkflowStatus
  currentStageIndex: number
  approvals: WorkflowApproval[]
  metadata?: Record<string, any>
  attachments?: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: WorkflowStageCard
// ═══════════════════════════════════════════════════════════════════════════════════════

interface WorkflowStageCardProps {
  stage: WorkflowStage
  index: number
  isActive: boolean
  isCompleted: boolean
  approvals: WorkflowApproval[]
}

function WorkflowStageCard({
  stage,
  index,
  isActive,
  isCompleted,
  approvals,
}: WorkflowStageCardProps) {
  const stageApprovals = approvals.filter((a) => a.stageId === stage.id)
  const approvedCount = stageApprovals.filter((a) => a.status === 'approved').length
  const rejectedCount = stageApprovals.filter((a) => a.status === 'rejected').length
  const pendingCount = stageApprovals.filter((a) => a.status === 'pending').length

  const statusIcon = isCompleted ? (
    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
  ) : rejectedCount > 0 ? (
    <XCircle className="h-5 w-5 text-red-400" />
  ) : isActive ? (
    <Clock className="h-5 w-5 text-amber-400" />
  ) : (
    <AlertCircle className="h-5 w-5 text-white/30" />
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'relative rounded-xl border p-4 transition-all',
        isActive
          ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20'
          : isCompleted
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : rejectedCount > 0
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-white/10 bg-white/[0.02]'
      )}
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-white/5">
            {statusIcon}
          </div>
          <div>
            <h4 className="font-semibold text-white">{stage.name}</h4>
            <p className="text-xs text-white/60">{stage.description}</p>
          </div>
        </div>
        
        <div className="rounded-full bg-white/10 px-2 py-1 text-xs text-white/80">
          Nivel {index + 1}
        </div>
      </div>

      {/* Approvers */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-white/60">
          {stage.approvalType === ApprovalType.PARALLEL ? (
            <Users className="h-3 w-3" />
          ) : (
            <User className="h-3 w-3" />
          )}
          <span>
            {stage.approvalType === ApprovalType.QUORUM
              ? `${stage.requiredApprovals} de ${stage.approvers.length} aprobaciones requeridas`
              : stage.approvalType === ApprovalType.PARALLEL
              ? 'Todos deben aprobar'
              : 'Aprobación secuencial'}
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          {stage.approvers.map((approver) => {
            const approval = stageApprovals.find((a) => a.approverId === approver)
            return (
              <div
                key={approver}
                className={cn(
                  'flex items-center gap-1 rounded-full px-2 py-1 text-xs',
                  approval?.status === 'approved'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : approval?.status === 'rejected'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-white/10 text-white/80'
                )}
              >
                <User className="h-3 w-3" />
                <span>{approver}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-white/60">Progreso</span>
          <span className="text-white/80">
            {approvedCount}/{stage.approvers.length}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${(approvedCount / stage.approvers.length) * 100}%`,
            }}
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* SLA Warning */}
      {stage.slaHours && isActive && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-500/10 p-2 text-xs text-amber-400">
          <Clock className="h-3 w-3" />
          <span>SLA: {stage.slaHours}h restantes</span>
        </div>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: WorkflowTimeline
// ═══════════════════════════════════════════════════════════════════════════════════════

interface WorkflowTimelineProps {
  instance: WorkflowInstance
  template: WorkflowTemplate
}

function WorkflowTimeline({ instance, template }: WorkflowTimelineProps) {
  return (
    <div className="relative space-y-4">
      {/* Timeline Line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-white/10" />

      {template.stages.map((stage, index) => {
        const isActive = index === instance.currentStageIndex
        const isCompleted = index < instance.currentStageIndex
        
        return (
          <div key={stage.id} className="relative">
            <WorkflowStageCard
              stage={stage}
              index={index}
              isActive={isActive}
              isCompleted={isCompleted}
              approvals={instance.approvals}
            />
            
            {index < template.stages.length - 1 && (
              <div className="ml-4 flex h-8 items-center">
                <ArrowRight className="h-4 w-4 text-white/30" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: WorkflowApprovalActions
// ═══════════════════════════════════════════════════════════════════════════════════════

interface WorkflowApprovalActionsProps {
  instance: WorkflowInstance
  template: WorkflowTemplate
  currentUserId: string
  onApprove: (stageId: string, comment?: string) => void
  onReject: (stageId: string, comment: string) => void
  onDelegate: (stageId: string, delegateTo: string) => void
}

function WorkflowApprovalActions({
  instance,
  template,
  currentUserId,
  onApprove,
  onReject,
  onDelegate,
}: WorkflowApprovalActionsProps) {
  const [comment, setComment] = useState('')
  const [showDelegation, setShowDelegation] = useState(false)

  const currentStage = template.stages[instance.currentStageIndex]
  if (!currentStage) return null
  const canApprove = currentStage?.approvers.includes(currentUserId)
  const hasApproved = instance.approvals.some(
    (a) => a.stageId === currentStage?.id && a.approverId === currentUserId && a.status !== 'pending'
  )

  if (!canApprove || hasApproved || instance.status !== WorkflowStatus.IN_REVIEW) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl"
    >
      <h3 className="mb-4 text-lg font-semibold text-white">Acciones de Aprobación</h3>

      {/* Comment */}
      <div className="mb-4">
        <label className="mb-2 block text-sm text-white/80">
          Comentario <span className="text-white/40">(opcional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-white/40 transition-colors focus:border-purple-500/50 focus:outline-none"
          placeholder="Agrega un comentario sobre tu decisión..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onApprove(currentStage.id, comment || undefined)}
          className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-2.5 font-semibold text-white transition-all hover:from-emerald-600 hover:to-emerald-700"
        >
          <CheckCircle2 className="mr-2 inline h-5 w-5" />
          Aprobar
        </button>
        
        <button
          onClick={() => onReject(currentStage.id, comment || 'Rechazado')}
          className="flex-1 rounded-lg bg-white/5 px-4 py-2.5 font-semibold text-red-400 transition-all hover:bg-red-500/20"
        >
          <XCircle className="mr-2 inline h-5 w-5" />
          Rechazar
        </button>

        {currentStage.allowDelegation && (
          <button
            onClick={() => setShowDelegation(!showDelegation)}
            className="rounded-lg bg-white/5 px-4 py-2.5 text-white/80 transition-all hover:bg-white/10"
          >
            <Users className="h-5 w-5" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: WorkflowList
// ═══════════════════════════════════════════════════════════════════════════════════════

interface WorkflowListProps {
  workflows: WorkflowInstance[]
  onSelectWorkflow: (id: string) => void
}

function WorkflowList({ workflows, onSelectWorkflow }: WorkflowListProps) {
  const [filter, setFilter] = useState<WorkflowStatus | 'all'>('all')

  const filteredWorkflows = useMemo(() => {
    if (filter === 'all') return workflows
    return workflows.filter((w) => w.status === filter)
  }, [workflows, filter])

  const statusCounts = useMemo(() => {
    return {
      all: workflows.length,
      pending: workflows.filter((w) => w.status === WorkflowStatus.PENDING).length,
      in_review: workflows.filter((w) => w.status === WorkflowStatus.IN_REVIEW).length,
      approved: workflows.filter((w) => w.status === WorkflowStatus.APPROVED).length,
      rejected: workflows.filter((w) => w.status === WorkflowStatus.REJECTED).length,
    }
  }, [workflows])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: 'Todos', count: statusCounts.all },
          { key: WorkflowStatus.PENDING, label: 'Pendientes', count: statusCounts.pending },
          { key: WorkflowStatus.IN_REVIEW, label: 'En Revisión', count: statusCounts.in_review },
          { key: WorkflowStatus.APPROVED, label: 'Aprobados', count: statusCounts.approved },
          { key: WorkflowStatus.REJECTED, label: 'Rechazados', count: statusCounts.rejected },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as any)}
            className={cn(
              'whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all',
              filter === item.key
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
            )}
          >
            {item.label}
            <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-xs">
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Workflow Items */}
      <div className="space-y-3">
        {filteredWorkflows.map((workflow) => (
          <motion.button
            key={workflow.id}
            onClick={() => onSelectWorkflow(workflow.id)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition-all hover:border-white/20 hover:bg-white/5"
          >
            <div className="mb-2 flex items-start justify-between">
              <h4 className="font-semibold text-white">{workflow.title}</h4>
              <StatusBadge status={workflow.status} />
            </div>
            <p className="mb-3 text-sm text-white/60">{workflow.description}</p>
            <div className="flex items-center gap-4 text-xs text-white/40">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{workflow.requestedBy}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(workflow.requestedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </motion.button>
        ))}

        {filteredWorkflows.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <FileText className="mx-auto mb-3 h-12 w-12 text-white/20" />
            <p className="text-sm text-white/60">No hay workflows en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: StatusBadge
// ═══════════════════════════════════════════════════════════════════════════════════════

function StatusBadge({ status }: { status: WorkflowStatus }) {
  const config = {
    [WorkflowStatus.DRAFT]: { label: 'Borrador', color: 'text-gray-400 bg-gray-500/20' },
    [WorkflowStatus.PENDING]: { label: 'Pendiente', color: 'text-amber-400 bg-amber-500/20' },
    [WorkflowStatus.IN_REVIEW]: { label: 'En Revisión', color: 'text-blue-400 bg-blue-500/20' },
    [WorkflowStatus.APPROVED]: { label: 'Aprobado', color: 'text-emerald-400 bg-emerald-500/20' },
    [WorkflowStatus.REJECTED]: { label: 'Rechazado', color: 'text-red-400 bg-red-500/20' },
    [WorkflowStatus.CANCELLED]: { label: 'Cancelado', color: 'text-white/40 bg-white/10' },
  }

  const { label, color } = config[status]

  return (
    <div className={cn('rounded-full px-2 py-1 text-xs font-medium', color)}>
      {label}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL: WorkflowSystem
// ═══════════════════════════════════════════════════════════════════════════════════════

export function WorkflowSystem() {
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string | null>(null)

  // Datos simulados (reemplazar con datos reales)
  const mockTemplate: WorkflowTemplate = {
    id: 'tpl-1',
    name: 'Aprobación de Gastos',
    description: 'Proceso de aprobación para gastos corporativos',
    category: 'finance',
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    stages: [
      {
        id: 'stage-1',
        name: 'Supervisor Directo',
        description: 'Primera aprobación por supervisor inmediato',
        approvers: ['supervisor-1'],
        approvalType: ApprovalType.SEQUENTIAL,
        slaHours: 24,
        allowDelegation: true,
        allowSkip: false,
      },
      {
        id: 'stage-2',
        name: 'Gerencia',
        description: 'Aprobación de gerencia de área',
        approvers: ['manager-1', 'manager-2'],
        approvalType: ApprovalType.PARALLEL,
        slaHours: 48,
        allowDelegation: true,
        allowSkip: false,
      },
      {
        id: 'stage-3',
        name: 'Finanzas',
        description: 'Validación final de finanzas',
        approvers: ['finance-1', 'finance-2', 'finance-3'],
        approvalType: ApprovalType.QUORUM,
        requiredApprovals: 2,
        slaHours: 72,
        allowDelegation: false,
        allowSkip: false,
      },
    ],
  }

  const mockWorkflows: WorkflowInstance[] = [
    {
      id: 'wf-1',
      templateId: 'tpl-1',
      title: 'Gastos de Viaje - Conferencia Tech 2026',
      description: 'Gastos de viaje para asistir a conferencia',
      requestedBy: 'Juan Pérez',
      requestedAt: Date.now() - 86400000,
      status: WorkflowStatus.IN_REVIEW,
      currentStageIndex: 1,
      approvals: [
        {
          stageId: 'stage-1',
          approverId: 'supervisor-1',
          status: 'approved',
          comment: 'Aprobado, gastos justificados',
          timestamp: Date.now() - 43200000,
        },
        {
          stageId: 'stage-2',
          approverId: 'manager-1',
          status: 'pending',
        },
        {
          stageId: 'stage-2',
          approverId: 'manager-2',
          status: 'pending',
        },
      ],
    },
  ]

  const selectedWorkflow = selectedWorkflowId
    ? mockWorkflows.find((w) => w.id === selectedWorkflowId)
    : null

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* List Panel */}
      <div className="lg:col-span-1">
        <WorkflowList
          workflows={mockWorkflows}
          onSelectWorkflow={setSelectedWorkflowId}
        />
      </div>

      {/* Detail Panel */}
      <div className="lg:col-span-2">
        {selectedWorkflow ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur-xl">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedWorkflow.title}</h2>
                  <p className="text-sm text-white/60">{selectedWorkflow.description}</p>
                </div>
                <StatusBadge status={selectedWorkflow.status} />
              </div>
              <div className="flex gap-4 text-sm text-white/60">
                <div>
                  <span className="font-medium">Solicitado por:</span> {selectedWorkflow.requestedBy}
                </div>
                <div>
                  <span className="font-medium">Fecha:</span>{' '}
                  {new Date(selectedWorkflow.requestedAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <WorkflowTimeline instance={selectedWorkflow} template={mockTemplate} />

            {/* Actions */}
            <WorkflowApprovalActions
              instance={selectedWorkflow}
              template={mockTemplate}
              currentUserId="manager-1"
              onApprove={(stageId, comment) => console.log('Approve', stageId, comment)}
              onReject={(stageId, comment) => console.log('Reject', stageId, comment)}
              onDelegate={(stageId, delegateTo) => console.log('Delegate', stageId, delegateTo)}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.02] p-12 backdrop-blur-xl">
            <div className="text-center">
              <FileText className="mx-auto mb-4 h-16 w-16 text-white/20" />
              <h3 className="mb-2 text-lg font-semibold text-white">Selecciona un Workflow</h3>
              <p className="text-sm text-white/60">
                Elige un workflow de la lista para ver sus detalles
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
