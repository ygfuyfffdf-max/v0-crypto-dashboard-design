// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔄 CHRONOS INFINITY 2026 — API ROUTE: WORKFLOWS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Endpoints CRUD completos para el sistema de workflows
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

enum WorkflowStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
}

enum ApprovalType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  QUORUM = 'quorum',
}

interface WorkflowStage {
  id: string
  name: string
  description?: string
  approvers: string[]
  approvalType: ApprovalType
  requiredApprovals?: number
  slaHours?: number
  allowDelegation?: boolean
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  stages: WorkflowStage[]
  isActive: boolean
  createdAt: number
  updatedAt: number
}

interface WorkflowApproval {
  stageId: string
  approverId: string
  status: 'pending' | 'approved' | 'rejected'
  comment?: string
  timestamp?: number
}

interface WorkflowInstance {
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
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DATOS EN MEMORIA (Simular DB)
// ═══════════════════════════════════════════════════════════════════════════════════════

const templates: Map<string, WorkflowTemplate> = new Map([
  ['tpl-expenses', {
    id: 'tpl-expenses',
    name: 'Aprobación de Gastos',
    description: 'Proceso de aprobación para gastos corporativos',
    category: 'finance',
    isActive: true,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000,
    stages: [
      {
        id: 'stage-1',
        name: 'Supervisor Directo',
        description: 'Primera aprobación por supervisor inmediato',
        approvers: ['supervisor'],
        approvalType: ApprovalType.SEQUENTIAL,
        slaHours: 24,
        allowDelegation: true,
      },
      {
        id: 'stage-2',
        name: 'Gerencia',
        description: 'Aprobación de gerencia de área',
        approvers: ['manager-1', 'manager-2'],
        approvalType: ApprovalType.PARALLEL,
        slaHours: 48,
        allowDelegation: true,
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
      },
    ],
  }],
  ['tpl-vacation', {
    id: 'tpl-vacation',
    name: 'Solicitud de Vacaciones',
    description: 'Proceso para solicitar días de vacaciones',
    category: 'hr',
    isActive: true,
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now() - 86400000 * 10,
    stages: [
      {
        id: 'stage-1',
        name: 'Jefe Directo',
        description: 'Aprobación del jefe inmediato',
        approvers: ['supervisor'],
        approvalType: ApprovalType.SEQUENTIAL,
        slaHours: 48,
        allowDelegation: true,
      },
      {
        id: 'stage-2',
        name: 'Recursos Humanos',
        description: 'Validación de días disponibles',
        approvers: ['hr-admin'],
        approvalType: ApprovalType.SEQUENTIAL,
        slaHours: 24,
        allowDelegation: false,
      },
    ],
  }],
])

const instances: Map<string, WorkflowInstance> = new Map([
  ['wf-1', {
    id: 'wf-1',
    templateId: 'tpl-expenses',
    title: 'Gastos de Viaje - Conferencia Tech 2026',
    description: 'Gastos de viaje para asistir a conferencia',
    requestedBy: 'Juan Pérez',
    requestedAt: Date.now() - 86400000,
    status: WorkflowStatus.IN_REVIEW,
    currentStageIndex: 1,
    approvals: [
      {
        stageId: 'stage-1',
        approverId: 'supervisor',
        status: 'approved',
        comment: 'Gastos justificados correctamente',
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
    metadata: { amount: 15000, currency: 'MXN' },
  }],
])

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GET: Listar/Obtener workflows
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') || 'instances'
  const id = searchParams.get('id')
  const status = searchParams.get('status')
  const templateId = searchParams.get('templateId')

  try {
    // Obtener un workflow específico
    if (id) {
      if (type === 'template') {
        const template = templates.get(id)
        if (!template) {
          return NextResponse.json(
            { success: false, error: 'Template not found' },
            { status: 404 }
          )
        }
        return NextResponse.json({ success: true, data: template })
      } else {
        const instance = instances.get(id)
        if (!instance) {
          return NextResponse.json(
            { success: false, error: 'Workflow not found' },
            { status: 404 }
          )
        }
        // Incluir el template también
        const template = templates.get(instance.templateId)
        return NextResponse.json({
          success: true,
          data: { instance, template },
        })
      }
    }

    // Listar templates
    if (type === 'templates') {
      const allTemplates = Array.from(templates.values())
      return NextResponse.json({
        success: true,
        data: allTemplates,
        total: allTemplates.length,
      })
    }

    // Listar instances con filtros
    let allInstances = Array.from(instances.values())
    
    if (status) {
      allInstances = allInstances.filter(i => i.status === status)
    }
    
    if (templateId) {
      allInstances = allInstances.filter(i => i.templateId === templateId)
    }

    return NextResponse.json({
      success: true,
      data: allInstances,
      total: allInstances.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch workflows' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// POST: Crear nuevo workflow
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { templateId, title, description, requestedBy, metadata } = body

    // Validar template
    const template = templates.get(templateId)
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Crear instance
    const id = generateId('wf')
    const newInstance: WorkflowInstance = {
      id,
      templateId,
      title,
      description,
      requestedBy,
      requestedAt: Date.now(),
      status: WorkflowStatus.PENDING,
      currentStageIndex: 0,
      approvals: template.stages[0].approvers.map(approverId => ({
        stageId: template.stages[0].id,
        approverId,
        status: 'pending' as const,
      })),
      metadata,
    }

    instances.set(id, newInstance)

    return NextResponse.json({
      success: true,
      data: newInstance,
      message: 'Workflow created successfully',
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create workflow' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PATCH: Actualizar workflow (aprobar/rechazar)
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { workflowId, action, approverId, comment, delegateTo } = body

    const instance = instances.get(workflowId)
    if (!instance) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      )
    }

    const template = templates.get(instance.templateId)
    if (!template) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    const currentStage = template.stages[instance.currentStageIndex]

    switch (action) {
      case 'approve': {
        // Encontrar la aprobación pendiente
        const approvalIndex = instance.approvals.findIndex(
          a => a.stageId === currentStage.id && a.approverId === approverId && a.status === 'pending'
        )

        if (approvalIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'No pending approval found for this user' },
            { status: 400 }
          )
        }

        instance.approvals[approvalIndex] = {
          ...instance.approvals[approvalIndex],
          status: 'approved',
          comment,
          timestamp: Date.now(),
        }

        // Verificar si el stage está completo
        const stageApprovals = instance.approvals.filter(a => a.stageId === currentStage.id)
        const approvedCount = stageApprovals.filter(a => a.status === 'approved').length
        
        let stageComplete = false
        if (currentStage.approvalType === ApprovalType.SEQUENTIAL) {
          stageComplete = approvedCount === stageApprovals.length
        } else if (currentStage.approvalType === ApprovalType.PARALLEL) {
          stageComplete = approvedCount === stageApprovals.length
        } else if (currentStage.approvalType === ApprovalType.QUORUM) {
          stageComplete = approvedCount >= (currentStage.requiredApprovals || 1)
        }

        if (stageComplete) {
          // Avanzar al siguiente stage
          if (instance.currentStageIndex < template.stages.length - 1) {
            instance.currentStageIndex++
            const nextStage = template.stages[instance.currentStageIndex]
            
            // Crear aprobaciones para el siguiente stage
            instance.approvals.push(
              ...nextStage.approvers.map(approverId => ({
                stageId: nextStage.id,
                approverId,
                status: 'pending' as const,
              }))
            )
            instance.status = WorkflowStatus.IN_REVIEW
          } else {
            // Workflow completado
            instance.status = WorkflowStatus.APPROVED
          }
        }
        break
      }

      case 'reject': {
        const approvalIndex = instance.approvals.findIndex(
          a => a.stageId === currentStage.id && a.approverId === approverId && a.status === 'pending'
        )

        if (approvalIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'No pending approval found for this user' },
            { status: 400 }
          )
        }

        instance.approvals[approvalIndex] = {
          ...instance.approvals[approvalIndex],
          status: 'rejected',
          comment,
          timestamp: Date.now(),
        }

        instance.status = WorkflowStatus.REJECTED
        break
      }

      case 'delegate': {
        if (!delegateTo) {
          return NextResponse.json(
            { success: false, error: 'delegateTo is required' },
            { status: 400 }
          )
        }

        const approvalIndex = instance.approvals.findIndex(
          a => a.stageId === currentStage.id && a.approverId === approverId && a.status === 'pending'
        )

        if (approvalIndex === -1) {
          return NextResponse.json(
            { success: false, error: 'No pending approval found for this user' },
            { status: 400 }
          )
        }

        instance.approvals[approvalIndex].approverId = delegateTo
        break
      }

      case 'cancel': {
        instance.status = WorkflowStatus.CANCELLED
        break
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        )
    }

    instances.set(workflowId, instance)

    return NextResponse.json({
      success: true,
      data: instance,
      message: `Workflow ${action}ed successfully`,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update workflow' },
      { status: 500 }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DELETE: Eliminar workflow
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'ID is required' },
      { status: 400 }
    )
  }

  try {
    if (!instances.has(id)) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      )
    }

    instances.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete workflow' },
      { status: 500 }
    )
  }
}
