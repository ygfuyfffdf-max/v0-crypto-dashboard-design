/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 👔🤖 DIGITAL EMPLOYEES SYSTEM — EQUIPO CUÁNTICO DE BOTS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de empleados digitales que gestionan operaciones:
 * - CFO Bot: Gestión de abonos predictivos y flujo de caja
 * - Auditor Bot: Detección de anomalías y utilidades negativas
 * - Analyst Bot: Análisis de tendencias y predicciones
 * - Collector Bot: Cobranza automatizada e inteligente
 * - Inventory Bot: Gestión predictiva de stock
 * - Risk Bot: Evaluación continua de riesgos
 *
 * @version QUANTUM-INFINITY-2026
 * @author CHRONOS INFINITY TEAM
 */

import { logger } from '@/app/lib/utils/logger'
import type { BusinessContext, ChronosInsight, NexBotEmotion } from '../nexus/types'
import type {
  BotPersonality,
  CollaborationMessage,
  CollaborationOutcome,
  DigitalEmployee,
  DigitalEmployeeRole,
  EmployeeCollaboration,
} from './types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 CONFIGURACIÓN DE EMPLEADOS DIGITALES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

const EMPLOYEE_TEMPLATES: Record<
  DigitalEmployeeRole,
  Omit<DigitalEmployee, 'id' | 'status' | 'currentTask' | 'workload' | 'performance'>
> = {
  cfo_bot: {
    role: 'cfo_bot',
    name: 'CHRONOS CFO',
    avatar: '💼',
    personality: 'professional',
    capabilities: [
      { name: 'cash_flow_management', type: 'execution', proficiency: 95, lastUsed: new Date() },
      { name: 'predictive_payments', type: 'prediction', proficiency: 90, lastUsed: new Date() },
      { name: 'budget_optimization', type: 'analysis', proficiency: 92, lastUsed: new Date() },
      { name: 'financial_reporting', type: 'analysis', proficiency: 98, lastUsed: new Date() },
    ],
    permissions: [
      {
        action: 'transfer',
        resource: 'bancos',
        level: 'execute',
        conditions: { maxAmount: 100000 },
      },
      { action: 'approve', resource: 'pagos', level: 'execute', conditions: { maxAmount: 50000 } },
      { action: 'read', resource: 'all_financial', level: 'read' },
      { action: 'generate', resource: 'reports', level: 'execute' },
    ],
    expertise: {
      domains: ['cash_management', 'forecasting', 'budgeting', 'risk_assessment'],
      certifications: ['CFA_SIMULATION', 'FINANCIAL_MODELING'],
      trainingLevel: 'master',
      lastTraining: new Date(),
    },
    communication: {
      preferredChannels: ['chat', 'report'],
      responseStyle: 'detailed',
      language: 'es-MX',
      emotionalIntelligence: 85,
    },
  },

  auditor_bot: {
    role: 'auditor_bot',
    name: 'CHRONOS Auditor',
    avatar: '🔍',
    personality: 'analytical',
    capabilities: [
      { name: 'anomaly_detection', type: 'monitoring', proficiency: 98, lastUsed: new Date() },
      { name: 'compliance_check', type: 'analysis', proficiency: 95, lastUsed: new Date() },
      { name: 'fraud_prevention', type: 'monitoring', proficiency: 97, lastUsed: new Date() },
      { name: 'audit_reporting', type: 'communication', proficiency: 90, lastUsed: new Date() },
    ],
    permissions: [
      { action: 'read', resource: 'all', level: 'read' },
      { action: 'flag', resource: 'transactions', level: 'execute' },
      { action: 'alert', resource: 'security', level: 'execute' },
      { action: 'block', resource: 'suspicious_activity', level: 'execute' },
    ],
    expertise: {
      domains: ['internal_audit', 'compliance', 'risk_detection', 'data_integrity'],
      certifications: ['SOC2_COMPLIANCE', 'FRAUD_DETECTION'],
      trainingLevel: 'expert',
      lastTraining: new Date(),
    },
    communication: {
      preferredChannels: ['notification', 'report'],
      responseStyle: 'concise',
      language: 'es-MX',
      emotionalIntelligence: 70,
    },
  },

  analyst_bot: {
    role: 'analyst_bot',
    name: 'CHRONOS Analyst',
    avatar: '📊',
    personality: 'analytical',
    capabilities: [
      { name: 'trend_analysis', type: 'analysis', proficiency: 95, lastUsed: new Date() },
      { name: 'predictive_modeling', type: 'prediction', proficiency: 92, lastUsed: new Date() },
      { name: 'data_visualization', type: 'communication', proficiency: 88, lastUsed: new Date() },
      { name: 'report_generation', type: 'communication', proficiency: 94, lastUsed: new Date() },
    ],
    permissions: [
      { action: 'read', resource: 'all_data', level: 'read' },
      { action: 'generate', resource: 'insights', level: 'execute' },
      { action: 'create', resource: 'visualizations', level: 'execute' },
    ],
    expertise: {
      domains: ['business_intelligence', 'statistical_analysis', 'market_research'],
      certifications: ['DATA_SCIENCE', 'BUSINESS_ANALYTICS'],
      trainingLevel: 'senior',
      lastTraining: new Date(),
    },
    communication: {
      preferredChannels: ['chat', 'report'],
      responseStyle: 'detailed',
      language: 'es-MX',
      emotionalIntelligence: 75,
    },
  },

  collector_bot: {
    role: 'collector_bot',
    name: 'CHRONOS Collector',
    avatar: '💰',
    personality: 'empathetic',
    capabilities: [
      { name: 'payment_reminders', type: 'communication', proficiency: 92, lastUsed: new Date() },
      { name: 'negotiation', type: 'communication', proficiency: 85, lastUsed: new Date() },
      { name: 'payment_scheduling', type: 'execution', proficiency: 90, lastUsed: new Date() },
      { name: 'debt_analysis', type: 'analysis', proficiency: 88, lastUsed: new Date() },
    ],
    permissions: [
      { action: 'read', resource: 'clientes', level: 'read' },
      { action: 'send', resource: 'reminders', level: 'execute' },
      { action: 'schedule', resource: 'payments', level: 'execute' },
      { action: 'apply', resource: 'discounts', level: 'execute', conditions: { maxDiscount: 10 } },
    ],
    expertise: {
      domains: ['accounts_receivable', 'customer_relations', 'negotiation'],
      certifications: ['CREDIT_MANAGEMENT'],
      trainingLevel: 'senior',
      lastTraining: new Date(),
    },
    communication: {
      preferredChannels: ['notification', 'chat'],
      responseStyle: 'adaptive',
      language: 'es-MX',
      emotionalIntelligence: 95,
    },
  },

  inventory_bot: {
    role: 'inventory_bot',
    name: 'CHRONOS Inventory',
    avatar: '📦',
    personality: 'professional',
    capabilities: [
      { name: 'stock_monitoring', type: 'monitoring', proficiency: 96, lastUsed: new Date() },
      { name: 'demand_forecasting', type: 'prediction', proficiency: 90, lastUsed: new Date() },
      { name: 'reorder_automation', type: 'execution', proficiency: 88, lastUsed: new Date() },
      { name: 'supplier_selection', type: 'analysis', proficiency: 85, lastUsed: new Date() },
    ],
    permissions: [
      { action: 'read', resource: 'almacen', level: 'read' },
      { action: 'read', resource: 'distribuidores', level: 'read' },
      { action: 'suggest', resource: 'ordenes_compra', level: 'execute' },
      { action: 'alert', resource: 'stock_levels', level: 'execute' },
    ],
    expertise: {
      domains: ['inventory_management', 'supply_chain', 'demand_planning'],
      certifications: ['SUPPLY_CHAIN_MGMT'],
      trainingLevel: 'senior',
      lastTraining: new Date(),
    },
    communication: {
      preferredChannels: ['notification', 'report'],
      responseStyle: 'concise',
      language: 'es-MX',
      emotionalIntelligence: 65,
    },
  },

  risk_bot: {
    role: 'risk_bot',
    name: 'CHRONOS Risk',
    avatar: '⚠️',
    personality: 'urgent',
    capabilities: [
      { name: 'risk_assessment', type: 'analysis', proficiency: 94, lastUsed: new Date() },
      { name: 'credit_scoring', type: 'analysis', proficiency: 92, lastUsed: new Date() },
      { name: 'exposure_monitoring', type: 'monitoring', proficiency: 96, lastUsed: new Date() },
      { name: 'mitigation_planning', type: 'prediction', proficiency: 88, lastUsed: new Date() },
    ],
    permissions: [
      { action: 'read', resource: 'all', level: 'read' },
      { action: 'flag', resource: 'high_risk', level: 'execute' },
      { action: 'recommend', resource: 'credit_limits', level: 'execute' },
      { action: 'alert', resource: 'risk_events', level: 'execute' },
    ],
    expertise: {
      domains: ['risk_management', 'credit_analysis', 'financial_modeling'],
      certifications: ['FRM_SIMULATION', 'CREDIT_RISK'],
      trainingLevel: 'expert',
      lastTraining: new Date(),
    },
    communication: {
      preferredChannels: ['notification', 'chat'],
      responseStyle: 'concise',
      language: 'es-MX',
      emotionalIntelligence: 80,
    },
  },

  sales_bot: {
    role: 'sales_bot',
    name: 'CHRONOS Sales',
    avatar: '🎯',
    personality: 'motivational',
    capabilities: [
      { name: 'sales_tracking', type: 'monitoring', proficiency: 94, lastUsed: new Date() },
      { name: 'opportunity_detection', type: 'analysis', proficiency: 88, lastUsed: new Date() },
      { name: 'quote_generation', type: 'execution', proficiency: 92, lastUsed: new Date() },
      { name: 'customer_insights', type: 'analysis', proficiency: 90, lastUsed: new Date() },
    ],
    permissions: [
      { action: 'read', resource: 'ventas', level: 'read' },
      { action: 'read', resource: 'clientes', level: 'read' },
      { action: 'suggest', resource: 'discounts', level: 'execute' },
      { action: 'create', resource: 'quotes', level: 'execute' },
    ],
    expertise: {
      domains: ['sales_strategy', 'customer_success', 'pricing'],
      certifications: ['SALES_EXCELLENCE'],
      trainingLevel: 'senior',
      lastTraining: new Date(),
    },
    communication: {
      preferredChannels: ['chat', 'notification'],
      responseStyle: 'adaptive',
      language: 'es-MX',
      emotionalIntelligence: 90,
    },
  },

  compliance_bot: {
    role: 'compliance_bot',
    name: 'CHRONOS Compliance',
    avatar: '📋',
    personality: 'professional',
    capabilities: [
      { name: 'regulatory_monitoring', type: 'monitoring', proficiency: 95, lastUsed: new Date() },
      { name: 'policy_enforcement', type: 'execution', proficiency: 92, lastUsed: new Date() },
      { name: 'documentation', type: 'communication', proficiency: 94, lastUsed: new Date() },
      { name: 'training_delivery', type: 'communication', proficiency: 85, lastUsed: new Date() },
    ],
    permissions: [
      { action: 'read', resource: 'all', level: 'read' },
      { action: 'enforce', resource: 'policies', level: 'execute' },
      { action: 'generate', resource: 'compliance_reports', level: 'execute' },
    ],
    expertise: {
      domains: ['regulatory_compliance', 'internal_controls', 'documentation'],
      certifications: ['COMPLIANCE_MGMT'],
      trainingLevel: 'expert',
      lastTraining: new Date(),
    },
    communication: {
      preferredChannels: ['report', 'notification'],
      responseStyle: 'detailed',
      language: 'es-MX',
      emotionalIntelligence: 70,
    },
  },

  forecaster_bot: {
    role: 'forecaster_bot',
    name: 'CHRONOS Forecaster',
    avatar: '🔮',
    personality: 'analytical',
    capabilities: [
      { name: 'time_series_analysis', type: 'prediction', proficiency: 96, lastUsed: new Date() },
      { name: 'scenario_modeling', type: 'prediction', proficiency: 94, lastUsed: new Date() },
      { name: 'market_prediction', type: 'prediction', proficiency: 88, lastUsed: new Date() },
      { name: 'variance_analysis', type: 'analysis', proficiency: 92, lastUsed: new Date() },
    ],
    permissions: [
      { action: 'read', resource: 'all_data', level: 'read' },
      { action: 'generate', resource: 'forecasts', level: 'execute' },
      { action: 'create', resource: 'scenarios', level: 'execute' },
    ],
    expertise: {
      domains: ['forecasting', 'econometrics', 'machine_learning'],
      certifications: ['ML_FORECASTING', 'TIME_SERIES'],
      trainingLevel: 'master',
      lastTraining: new Date(),
    },
    communication: {
      preferredChannels: ['report', 'chat'],
      responseStyle: 'detailed',
      language: 'es-MX',
      emotionalIntelligence: 72,
    },
  },

  optimizer_bot: {
    role: 'optimizer_bot',
    name: 'CHRONOS Optimizer',
    avatar: '⚡',
    personality: 'professional',
    capabilities: [
      { name: 'process_optimization', type: 'analysis', proficiency: 94, lastUsed: new Date() },
      { name: 'resource_allocation', type: 'execution', proficiency: 90, lastUsed: new Date() },
      { name: 'efficiency_analysis', type: 'analysis', proficiency: 92, lastUsed: new Date() },
      { name: 'automation_design', type: 'execution', proficiency: 88, lastUsed: new Date() },
    ],
    permissions: [
      { action: 'read', resource: 'all', level: 'read' },
      { action: 'suggest', resource: 'optimizations', level: 'execute' },
      { action: 'automate', resource: 'workflows', level: 'execute' },
    ],
    expertise: {
      domains: ['operations_research', 'process_improvement', 'automation'],
      certifications: ['LEAN_SIX_SIGMA', 'AUTOMATION'],
      trainingLevel: 'expert',
      lastTraining: new Date(),
    },
    communication: {
      preferredChannels: ['notification', 'report'],
      responseStyle: 'concise',
      language: 'es-MX',
      emotionalIntelligence: 68,
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🧠 CLASE PRINCIPAL: DIGITAL EMPLOYEES SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export class DigitalEmployeesSystem {
  private employees: Map<string, DigitalEmployee> = new Map()
  private collaborations: Map<string, EmployeeCollaboration> = new Map()
  private taskQueue: EmployeeTask[] = []
  private businessContext: BusinessContext | null = null
  private userMood: NexBotEmotion = 'neutral'
  private callbacks: DigitalEmployeeCallbacks

  constructor(callbacks?: Partial<DigitalEmployeeCallbacks>) {
    this.callbacks = {
      onTaskAssigned: callbacks?.onTaskAssigned ?? (() => {}),
      onTaskCompleted: callbacks?.onTaskCompleted ?? (() => {}),
      onCollaborationStarted: callbacks?.onCollaborationStarted ?? (() => {}),
      onInsightGenerated: callbacks?.onInsightGenerated ?? (() => {}),
      onEmployeeMessage: callbacks?.onEmployeeMessage ?? (() => {}),
    }

    this.initializeEmployees()
    logger.info('[DigitalEmployees] System initialized', { context: 'DigitalEmployees' })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🚀 INICIALIZACIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  private initializeEmployees(): void {
    const roles: DigitalEmployeeRole[] = [
      'cfo_bot',
      'auditor_bot',
      'analyst_bot',
      'collector_bot',
      'inventory_bot',
      'risk_bot',
      'sales_bot',
      'forecaster_bot',
    ]

    for (const role of roles) {
      const template = EMPLOYEE_TEMPLATES[role]
      const employee: DigitalEmployee = {
        ...template,
        id: `emp_${role}_${Date.now()}`,
        status: 'active',
        currentTask: undefined,
        workload: 0,
        performance: {
          tasksCompleted: 0,
          accuracy: 100,
          avgResponseTime: 0,
          userSatisfaction: 5,
          errorsLast30Days: 0,
          improvements: [],
        },
      }

      this.employees.set(employee.id, employee)
    }

    logger.info('[DigitalEmployees] Employees initialized', {
      context: 'DigitalEmployees',
      data: { count: this.employees.size },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 👔 GESTIÓN DE EMPLEADOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Obtiene un empleado por rol
   */
  getEmployeeByRole(role: DigitalEmployeeRole): DigitalEmployee | undefined {
    return Array.from(this.employees.values()).find((e) => e.role === role)
  }

  /**
   * Obtiene todos los empleados activos
   */
  getActiveEmployees(): DigitalEmployee[] {
    return Array.from(this.employees.values()).filter((e) => e.status === 'active')
  }

  /**
   * Asigna una tarea a un empleado
   */
  async assignTask(task: EmployeeTask): Promise<TaskAssignment> {
    const bestEmployee = this.findBestEmployeeForTask(task)

    if (!bestEmployee) {
      return {
        success: false,
        employeeId: null,
        reason: 'No hay empleados disponibles con las capacidades requeridas',
      }
    }

    bestEmployee.status = 'busy'
    bestEmployee.currentTask = task.description
    bestEmployee.workload += task.estimatedWorkload

    this.taskQueue.push({
      ...task,
      assignedTo: bestEmployee.id,
      startedAt: new Date(),
    })

    this.callbacks.onTaskAssigned?.(task, bestEmployee)

    logger.info('[DigitalEmployees] Task assigned', {
      context: 'DigitalEmployees',
      data: { taskId: task.id, employeeId: bestEmployee.id },
    })

    // Simular ejecución de tarea
    const result = await this.executeTask(task, bestEmployee)

    return {
      success: true,
      employeeId: bestEmployee.id,
      result,
    }
  }

  /**
   * Encuentra el mejor empleado para una tarea
   */
  private findBestEmployeeForTask(task: EmployeeTask): DigitalEmployee | undefined {
    const candidates = Array.from(this.employees.values())
      .filter((e) => e.status !== 'offline' && e.status !== 'maintenance')
      .filter((e) => this.hasRequiredCapabilities(e, task.requiredCapabilities))
      .filter((e) => this.hasPermissions(e, task.requiredPermissions))
      .sort((a, b) => {
        // Ordenar por workload (menor es mejor) y proficiency (mayor es mejor)
        const workloadDiff = a.workload - b.workload
        const proficiencyA = this.getAverageCapabilityProficiency(a, task.requiredCapabilities)
        const proficiencyB = this.getAverageCapabilityProficiency(b, task.requiredCapabilities)
        return workloadDiff !== 0 ? workloadDiff : proficiencyB - proficiencyA
      })

    return candidates[0]
  }

  private hasRequiredCapabilities(employee: DigitalEmployee, required: string[]): boolean {
    return required.every((cap) =>
      employee.capabilities.some((c) => c.name === cap && c.proficiency >= 70),
    )
  }

  private hasPermissions(employee: DigitalEmployee, required: string[]): boolean {
    return required.every((perm) =>
      employee.permissions.some((p) => p.action === perm || p.resource === perm),
    )
  }

  private getAverageCapabilityProficiency(
    employee: DigitalEmployee,
    capabilities: string[],
  ): number {
    const relevant = employee.capabilities.filter((c) => capabilities.includes(c.name))
    if (relevant.length === 0) return 0
    return relevant.reduce((sum, c) => sum + c.proficiency, 0) / relevant.length
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ⚡ EJECUCIÓN DE TAREAS
  // ─────────────────────────────────────────────────────────────────────────────

  private async executeTask(task: EmployeeTask, employee: DigitalEmployee): Promise<TaskResult> {
    const startTime = Date.now()

    try {
      let result: unknown

      switch (task.type) {
        case 'analysis':
          result = await this.performAnalysis(task, employee)
          break
        case 'monitoring':
          result = await this.performMonitoring(task, employee)
          break
        case 'execution':
          result = await this.performExecution(task, employee)
          break
        case 'prediction':
          result = await this.performPrediction(task, employee)
          break
        case 'communication':
          result = await this.performCommunication(task, employee)
          break
        default:
          result = { message: 'Task type not supported' }
      }

      // Actualizar estado del empleado
      employee.status = 'active'
      employee.currentTask = undefined
      employee.workload = Math.max(0, employee.workload - task.estimatedWorkload)
      employee.performance.tasksCompleted++
      employee.performance.avgResponseTime =
        (employee.performance.avgResponseTime + (Date.now() - startTime)) / 2

      const taskResult: TaskResult = {
        success: true,
        employeeId: employee.id,
        taskId: task.id,
        result,
        duration: Date.now() - startTime,
        insights: [],
      }

      this.callbacks.onTaskCompleted?.(task, taskResult)

      return taskResult
    } catch (error) {
      employee.status = 'active'
      employee.currentTask = undefined
      employee.performance.errorsLast30Days++

      logger.error('[DigitalEmployees] Task execution failed', error as Error, {
        context: 'DigitalEmployees',
        data: { taskId: task.id },
      })

      return {
        success: false,
        employeeId: employee.id,
        taskId: task.id,
        result: null,
        duration: Date.now() - startTime,
        error: (error as Error).message,
        insights: [],
      }
    }
  }

  private async performAnalysis(task: EmployeeTask, employee: DigitalEmployee): Promise<unknown> {
    // Simular análisis
    const insights: ChronosInsight[] = []

    if (employee.role === 'auditor_bot' && this.businessContext) {
      // Auditor analiza anomalías
      if (this.businessContext.utilidadesMes < 0) {
        insights.push({
          id: `insight_${Date.now()}`,
          type: 'danger',
          priority: 'critical',
          title: '⚠️ Utilidad Negativa Detectada',
          description: `El Auditor Bot ha detectado utilidades negativas de $${this.businessContext.utilidadesMes.toLocaleString()}. Se requiere revisión inmediata.`,
          metric: 'utilidadesMes',
          value: this.businessContext.utilidadesMes,
          trend: 'down',
          confidence: 100,
          emotionalTone: 'alert',
        })
      }

      // Detectar rotación lenta
      if (this.businessContext.productosBajoStock > 10) {
        insights.push({
          id: `insight_${Date.now()}_2`,
          type: 'warning',
          priority: 'high',
          title: 'Rotación Lenta Detectada',
          description: `${this.businessContext.productosBajoStock} productos con rotación lenta. CFO sugiere venta prioritaria o promoción.`,
          confidence: 85,
          emotionalTone: 'concerned',
        })
      }
    }

    insights.forEach((insight) => this.callbacks.onInsightGenerated?.(insight))

    return { analysisType: task.parameters?.type, insights, timestamp: new Date() }
  }

  private async performMonitoring(task: EmployeeTask, employee: DigitalEmployee): Promise<unknown> {
    const alerts: string[] = []

    if (this.businessContext) {
      // Risk Bot monitorea exposición
      if (employee.role === 'risk_bot') {
        if (this.businessContext.deudaTotalClientes > this.businessContext.capitalTotal * 0.4) {
          alerts.push('Exposición de crédito elevada: deuda clientes supera 40% del capital')
        }
        if (this.businessContext.adeudoTotalDistribuidores > 100000) {
          alerts.push('Adeudo a distribuidores crítico: supera $100,000')
        }
      }

      // Inventory Bot monitorea stock
      if (employee.role === 'inventory_bot') {
        if (this.businessContext.productosBajoStock > 0) {
          alerts.push(`${this.businessContext.productosBajoStock} productos requieren reposición`)
        }
      }
    }

    return { monitored: true, alerts, timestamp: new Date() }
  }

  private async performExecution(task: EmployeeTask, employee: DigitalEmployee): Promise<unknown> {
    // Collector Bot ejecuta recordatorios
    if (employee.role === 'collector_bot') {
      return {
        action: 'payment_reminder_sent',
        target: task.parameters?.clienteId,
        message: this.generateCollectionMessage(employee.personality),
        timestamp: new Date(),
      }
    }

    // CFO Bot ejecuta pagos
    if (employee.role === 'cfo_bot') {
      return {
        action: 'payment_processed',
        amount: task.parameters?.amount,
        approved: true,
        timestamp: new Date(),
      }
    }

    return { executed: true, timestamp: new Date() }
  }

  private async performPrediction(task: EmployeeTask, employee: DigitalEmployee): Promise<unknown> {
    if (employee.role === 'forecaster_bot' && this.businessContext) {
      const prediction = {
        metric: task.parameters?.metric ?? 'ventas',
        period: task.parameters?.period ?? '30d',
        currentValue: this.businessContext.ventasMes,
        predictedValue: this.businessContext.ventasMes * (1 + Math.random() * 0.2 - 0.1),
        confidence: 75 + Math.random() * 20,
        trend: this.businessContext.tendenciaVentas,
        factors: ['seasonality', 'market_conditions', 'historical_patterns'],
      }

      return prediction
    }

    return { prediction: null, reason: 'Insufficient data' }
  }

  private async performCommunication(
    task: EmployeeTask,
    employee: DigitalEmployee,
  ): Promise<unknown> {
    const message = this.generateEmployeeMessage(employee, task)

    this.callbacks.onEmployeeMessage?.(employee, message)

    return { messageSent: true, content: message, timestamp: new Date() }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🤝 COLABORACIÓN ENTRE EMPLEADOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Inicia una colaboración entre múltiples empleados
   */
  async startCollaboration(
    participantRoles: DigitalEmployeeRole[],
    task: string,
  ): Promise<EmployeeCollaboration> {
    const participants = participantRoles
      .map((role) => this.getEmployeeByRole(role))
      .filter((e): e is DigitalEmployee => e !== undefined)

    if (participants.length < 2) {
      throw new Error('Se requieren al menos 2 empleados para colaboración')
    }

    const collaboration: EmployeeCollaboration = {
      id: `collab_${Date.now()}`,
      participants,
      task,
      status: 'planning',
      messages: [],
      outcome: undefined,
    }

    this.collaborations.set(collaboration.id, collaboration)
    this.callbacks.onCollaborationStarted?.(collaboration)

    // Simular conversación
    await this.runCollaboration(collaboration)

    return collaboration
  }

  private async runCollaboration(collaboration: EmployeeCollaboration): Promise<void> {
    collaboration.status = 'executing'

    // Cada participante contribuye
    for (const participant of collaboration.participants) {
      const message: CollaborationMessage = {
        from: participant.id,
        to: 'all',
        content: this.generateCollaborationContribution(participant, collaboration.task),
        timestamp: new Date(),
        type: 'suggestion',
      }
      collaboration.messages.push(message)
    }

    // Generar resultado
    collaboration.status = 'reviewing'
    collaboration.outcome = this.generateCollaborationOutcome(collaboration)
    collaboration.status = 'completed'
  }

  private generateCollaborationContribution(employee: DigitalEmployee, task: string): string {
    const contributions: Record<DigitalEmployeeRole, string> = {
      cfo_bot: `Desde perspectiva financiera, para "${task}" sugiero optimizar el flujo de caja priorizando cobros pendientes.`,
      auditor_bot: `He verificado compliance para "${task}". No detecto anomalías pero recomiendo monitoreo continuo.`,
      analyst_bot: `Análisis de datos para "${task}": tendencia positiva, proyección favorable si se mantienen condiciones actuales.`,
      collector_bot: `Para "${task}", puedo acelerar cobranza con descuentos por pronto pago del 3-5%.`,
      inventory_bot: `Stock necesario para "${task}": niveles óptimos, sugiero reposición preventiva de 20%.`,
      risk_bot: `Evaluación de riesgo para "${task}": nivel medio. Mitigación: diversificar proveedores.`,
      sales_bot: `Oportunidad de venta en "${task}": 3 clientes potenciales identificados.`,
      forecaster_bot: `Proyección para "${task}": crecimiento 15% próximo trimestre con 80% confianza.`,
      compliance_bot: `"${task}" cumple con políticas internas. Documentación actualizada.`,
      optimizer_bot: `Optimización para "${task}": automatizar 3 pasos manuales, ahorro 2h/semana.`,
    }

    return contributions[employee.role] ?? `Contribución de ${employee.name} para "${task}".`
  }

  private generateCollaborationOutcome(collaboration: EmployeeCollaboration): CollaborationOutcome {
    return {
      success: true,
      summary: `Colaboración completada entre ${collaboration.participants.map((p) => p.name).join(', ')}. Se generaron ${collaboration.messages.length} contribuciones.`,
      actionsExecuted: [],
      insightsGenerated: [],
      recommendationsForUser: [
        'Revisar sugerencias del equipo digital',
        'Aprobar acciones automáticas pendientes',
        'Programar seguimiento en 7 días',
      ],
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🎭 ADAPTACIÓN EMOCIONAL
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Actualiza el mood del usuario para adaptar personalidad de bots
   */
  updateUserMood(mood: NexBotEmotion): void {
    this.userMood = mood

    // Adaptar personalidad de bots según mood
    this.employees.forEach((employee) => {
      employee.personality = this.adaptPersonality(employee.role, mood)
    })
  }

  private adaptPersonality(role: DigitalEmployeeRole, mood: NexBotEmotion): BotPersonality {
    // Si usuario está estresado, todos los bots son más calmantes
    if (['stressed', 'worried', 'angry'].includes(mood)) {
      return 'calming'
    }

    // Si usuario está celebrando, bots son más motivacionales
    if (['celebrating', 'euphoric', 'happy', 'excited'].includes(mood)) {
      return 'motivational'
    }

    // Default por rol
    return EMPLOYEE_TEMPLATES[role].personality
  }

  private generateCollectionMessage(personality: BotPersonality): string {
    const messages: Record<BotPersonality, string> = {
      professional:
        'Estimado cliente, le recordamos que tiene un saldo pendiente. Agradecemos su pronto pago.',
      friendly:
        '¡Hola! Solo un recordatorio amigable sobre tu saldo pendiente. ¿Hay algo en que podamos ayudarte?',
      empathetic:
        'Entendemos que a veces surgen imprevistos. Queremos ayudarte a poner tu cuenta al corriente. ¿Conversamos sobre opciones?',
      motivational:
        '¡Estás a un paso de tener tu cuenta al día! Aprovecha nuestro descuento por pronto pago.',
      urgent:
        'IMPORTANTE: Su cuenta requiere atención inmediata. Por favor contacte a nuestro equipo.',
      calming:
        'No te preocupes, todo tiene solución. Veamos juntos las opciones para tu saldo pendiente.',
      analytical:
        'Según nuestro análisis, liquidar su saldo ahora le ahorraría $X en intereses proyectados.',
    }

    return messages[personality]
  }

  private generateEmployeeMessage(employee: DigitalEmployee, task: EmployeeTask): string {
    return `[${employee.avatar} ${employee.name}] Tarea "${task.description}" completada. ${
      employee.personality === 'motivational' ? '¡Excelente progreso!' : 'Resultado disponible.'
    }`
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔧 MÉTODOS PÚBLICOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Actualiza el contexto de negocio
   */
  updateBusinessContext(context: BusinessContext): void {
    this.businessContext = context
  }

  /**
   * Obtiene estado del sistema
   */
  getSystemStatus(): DigitalEmployeeSystemStatus {
    const employees = Array.from(this.employees.values())

    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e) => e.status === 'active').length,
      busyEmployees: employees.filter((e) => e.status === 'busy').length,
      totalTasksCompleted: employees.reduce((sum, e) => sum + e.performance.tasksCompleted, 0),
      avgAccuracy: employees.reduce((sum, e) => sum + e.performance.accuracy, 0) / employees.length,
      activeCollaborations: Array.from(this.collaborations.values()).filter(
        (c) => c.status !== 'completed',
      ).length,
      pendingTasks: this.taskQueue.filter((t) => !t.completedAt).length,
    }
  }

  /**
   * Solicita ayuda específica a un rol
   */
  async askEmployee(role: DigitalEmployeeRole, question: string): Promise<string> {
    const employee = this.getEmployeeByRole(role)
    if (!employee) {
      return 'Empleado no disponible'
    }

    const task: EmployeeTask = {
      id: `q_${Date.now()}`,
      type: 'communication',
      description: question,
      requiredCapabilities: [],
      requiredPermissions: [],
      estimatedWorkload: 5,
      priority: 'medium',
      parameters: { question },
    }

    const result = await this.assignTask(task)

    return result.success
      ? `[${employee.avatar} ${employee.name}]: ${this.generateAnswerForRole(role, question)}`
      : 'No pude procesar tu pregunta en este momento.'
  }

  private generateAnswerForRole(role: DigitalEmployeeRole, question: string): string {
    // Respuestas contextuales por rol
    const answers: Partial<Record<DigitalEmployeeRole, string>> = {
      cfo_bot: `Analizando la situación financiera... ${
        this.businessContext
          ? `Capital actual: $${this.businessContext.capitalTotal.toLocaleString()}, flujo del mes: $${this.businessContext.flujoCajaMes.toLocaleString()}.`
          : 'Necesito más datos para un análisis completo.'
      }`,
      analyst_bot: `Basado en los datos disponibles, la tendencia es ${this.businessContext?.tendenciaVentas ?? 'estable'}. ¿Deseas un análisis más detallado?`,
      risk_bot: `Nivel de riesgo actual: ${
        this.businessContext && this.businessContext.deudaTotalClientes > 50000
          ? 'MEDIO-ALTO'
          : 'BAJO'
      }. Monitoreo activo de exposiciones.`,
    }

    return (
      answers[role] ??
      `He procesado tu consulta sobre "${question}". ¿Necesitas información adicional?`
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 TIPOS ADICIONALES Y EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export interface EmployeeTask {
  id: string
  type: 'analysis' | 'monitoring' | 'execution' | 'prediction' | 'communication'
  description: string
  requiredCapabilities: string[]
  requiredPermissions: string[]
  estimatedWorkload: number // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical'
  parameters?: Record<string, unknown>
  assignedTo?: string
  startedAt?: Date
  completedAt?: Date
}

export interface TaskAssignment {
  success: boolean
  employeeId: string | null
  reason?: string
  result?: TaskResult
}

export interface TaskResult {
  success: boolean
  employeeId: string
  taskId: string
  result: unknown
  duration: number
  error?: string
  insights: ChronosInsight[]
}

export interface DigitalEmployeeCallbacks {
  onTaskAssigned?: (task: EmployeeTask, employee: DigitalEmployee) => void
  onTaskCompleted?: (task: EmployeeTask, result: TaskResult) => void
  onCollaborationStarted?: (collaboration: EmployeeCollaboration) => void
  onInsightGenerated?: (insight: ChronosInsight) => void
  onEmployeeMessage?: (employee: DigitalEmployee, message: string) => void
}

export interface DigitalEmployeeSystemStatus {
  totalEmployees: number
  activeEmployees: number
  busyEmployees: number
  totalTasksCompleted: number
  avgAccuracy: number
  activeCollaborations: number
  pendingTasks: number
}

// Singleton
let digitalEmployeesInstance: DigitalEmployeesSystem | null = null

export function getDigitalEmployeesSystem(
  callbacks?: Partial<DigitalEmployeeCallbacks>,
): DigitalEmployeesSystem {
  if (!digitalEmployeesInstance) {
    digitalEmployeesInstance = new DigitalEmployeesSystem(callbacks)
  }
  return digitalEmployeesInstance
}

export function resetDigitalEmployeesSystem(): void {
  digitalEmployeesInstance = null
}
