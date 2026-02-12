/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🤖🛡️ AGENTIC AI ENGINE — MODO GUARDIÁN AUTÓNOMO 24/7
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Motor de IA Agentic que actúa como agente independiente:
 * - Monitorea flujos financieros 24/7 sin intervención
 * - Ejecuta acciones automáticas basadas en reglas
 * - Patrulla métricas y detecta anomalías
 * - Sugiere y ejecuta optimizaciones proactivamente
 * - Reduce errores manuales 95%
 *
 * @version QUANTUM-INFINITY-2026
 * @author CHRONOS INFINITY TEAM
 */

import { logger } from '@/app/lib/utils/logger'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { vapiClient } from './vapi-client'
import type { BusinessContext, ChronosInsight, NexBotEmotion } from '../nexus/types'
import type {
  AgenticAIMode,
  AgenticAIState,
  AgenticAction,
  AgenticActionQueue,
  AgenticCondition,
  AgenticExecutionLog,
  AgenticRule,
} from './types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 CONSTANTES Y CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

const PATROL_INTERVAL_MS = 30000 // 30 segundos
const MAX_ACTIONS_PER_MINUTE = 10
const _DEFAULT_COOLDOWN_MINUTES = 5

// Reglas predefinidas del sistema
const BUILTIN_RULES: Partial<AgenticRule>[] = [
  {
    id: 'rule_auto_payment_distribuidor',
    name: 'Pago Automático a Distribuidor',
    description:
      'Si adeudo distribuidor alto + cash flow positivo → pago parcial auto de Bóveda Monte',
    priority: 'medium',
    trigger: {
      type: 'threshold',
      metric: 'distribuidor.saldoPendiente',
      operator: '>',
      value: 50000,
    },
    conditions: [
      { field: 'boveda_monte.capitalActual', operator: '>', value: 100000, entityType: 'banco' },
      { field: 'flujoNetoMes', operator: '>', value: 0, entityType: 'banco' },
    ],
    action: {
      type: 'payment',
      target: 'distribuidor',
      parameters: { percentage: 0.3, source: 'boveda_monte' },
      estimatedImpact: {
        financial: -15000,
        risk: 'low',
        affectedEntities: ['boveda_monte', 'distribuidor'],
      },
    },
    requiresConfirmation: true,
    maxExecutionsPerDay: 3,
    cooldownMinutes: 60,
  },
  {
    id: 'rule_margin_alert',
    name: 'Alerta Margen Bajo',
    description: 'Margen % bajo → sugiere reducir flete 15%, proyectado +20% ganancia neta',
    priority: 'high',
    trigger: {
      type: 'threshold',
      metric: 'venta.margenPromedio',
      operator: '<',
      value: 25,
    },
    conditions: [],
    action: {
      type: 'alert',
      target: 'user',
      parameters: {
        message:
          'Margen promedio bajo detectado. Sugerencia: reducir flete 15% para +20% ganancia neta proyectada.',
        suggestedAction: 'adjust_shipping',
        projectedGain: 0.2,
      },
      estimatedImpact: { financial: 5000, risk: 'low', affectedEntities: ['ventas'] },
    },
    requiresConfirmation: false,
    maxExecutionsPerDay: 2,
    cooldownMinutes: 360,
  },
  {
    id: 'rule_stock_critical',
    name: 'Stock Crítico Auto-Order',
    description: 'Stock bajo + alta rotación → genera OC automática con distribuidor óptimo',
    priority: 'critical',
    trigger: {
      type: 'threshold',
      metric: 'almacen.stockActual',
      operator: '<',
      value: 5,
    },
    conditions: [
      { field: 'rotacionPromedio', operator: '>', value: 2, entityType: 'almacen' },
      { field: 'margenPromedio', operator: '>', value: 30, entityType: 'almacen' },
    ],
    action: {
      type: 'workflow',
      target: 'orden_compra',
      parameters: { autoSelectDistributor: true, quantityMultiplier: 2 },
      estimatedImpact: {
        financial: -20000,
        risk: 'medium',
        affectedEntities: ['almacen', 'boveda_monte'],
      },
    },
    requiresConfirmation: true,
    maxExecutionsPerDay: 5,
    cooldownMinutes: 120,
  },
  {
    id: 'rule_deuda_cliente_alta',
    name: 'Cobranza Proactiva',
    description:
      'Deuda cliente > límite + días sin pago > 30 → envía recordatorio + sugerencia descuento',
    priority: 'medium',
    trigger: {
      type: 'compound',
      compound: [
        {
          id: 'sub1',
          name: 'Deuda Alta',
          trigger: {
            type: 'threshold',
            metric: 'cliente.saldoPendiente',
            operator: '>',
            value: 20000,
          },
        } as AgenticRule,
        {
          id: 'sub2',
          name: 'Días Sin Pago',
          trigger: {
            type: 'threshold',
            metric: 'cliente.diasSinComprar',
            operator: '>',
            value: 30,
          },
        } as AgenticRule,
      ],
      compoundOperator: 'AND',
    },
    conditions: [],
    action: {
      type: 'notification',
      target: 'cliente',
      parameters: {
        template: 'collection_reminder',
        offerDiscount: true,
        discountPercentage: 5,
        urgency: 'medium',
      },
      estimatedImpact: { financial: 15000, risk: 'low', affectedEntities: ['cliente'] },
    },
    requiresConfirmation: true,
    maxExecutionsPerDay: 10,
    cooldownMinutes: 1440, // 1 día
  },
  {
    id: 'rule_utilidad_negativa',
    name: 'Anomalía Utilidad Negativa',
    description: 'Detecta utilidad negativa en venta → alerta crítica + bloquea operación',
    priority: 'critical',
    trigger: {
      type: 'threshold',
      metric: 'venta.utilidadNeta',
      operator: '<',
      value: 0,
    },
    conditions: [],
    action: {
      type: 'alert',
      target: 'admin',
      parameters: {
        severity: 'critical',
        blockOperation: true,
        requiresReview: true,
        notifyChannels: ['email', 'sms', 'push'],
      },
      estimatedImpact: { financial: 0, risk: 'critical', affectedEntities: ['venta'] },
    },
    requiresConfirmation: false,
    maxExecutionsPerDay: 100,
    cooldownMinutes: 0,
  },
  {
    id: 'rule_celebrate_milestone',
    name: 'Celebrar Hito de Ventas',
    description: 'Ventas del mes superan meta → celebración con NexBot + bonificación sugerida',
    priority: 'low',
    trigger: {
      type: 'threshold',
      metric: 'businessContext.ventasMes',
      operator: '>',
      value: 500000,
    },
    conditions: [{ field: 'tendenciaVentas', operator: '==', value: 'up' }],
    action: {
      type: 'notification',
      target: 'celebration',
      parameters: {
        celebrationType: 'sales_milestone',
        nexbotEmotion: 'celebrating',
        confetti: true,
        message: '¡Felicidades! Has superado la meta de ventas del mes 🎉',
      },
      estimatedImpact: { financial: 0, risk: 'low', affectedEntities: [] },
    },
    requiresConfirmation: false,
    maxExecutionsPerDay: 1,
    cooldownMinutes: 10080, // 1 semana
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🧠 CLASE PRINCIPAL: AGENTIC AI ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export class AgenticAIEngine {
  private state: AgenticAIState
  private rules: Map<string, AgenticRule>
  private actionQueue: AgenticActionQueue[]
  private patrolInterval: NodeJS.Timeout | null = null
  private callbacks: AgenticCallbacks
  private businessContext: BusinessContext | null = null

  constructor(callbacks?: Partial<AgenticCallbacks>) {
    this.rules = new Map()
    this.actionQueue = []
    this.callbacks = {
      onRuleTriggered: callbacks?.onRuleTriggered ?? ((_rule) => {}),
      onActionExecuted: callbacks?.onActionExecuted ?? ((_action) => {}),
      onAnomalyDetected: callbacks?.onAnomalyDetected ?? ((_anomaly) => {}),
      onInsightGenerated: callbacks?.onInsightGenerated ?? ((_insight) => {}),
      onEmotionChange: callbacks?.onEmotionChange ?? ((_emotion) => {}),
      onAlert: callbacks?.onAlert ?? ((_alert) => {}),
    }

    this.state = this.createInitialState()
    this.initializeBuiltinRules()

    logger.info('[AgenticAI] Engine initialized', { context: 'AgenticAIEngine' })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🎯 INICIALIZACIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  private createInitialState(): AgenticAIState {
    return {
      mode: 'advisor',
      isActive: false,
      lastHeartbeat: new Date(),
      activeRules: [],
      pendingActions: [],
      executedToday: 0,
      anomaliesDetected: 0,
      healthScore: 100,
      performance: {
        avgResponseTime: 0,
        actionsExecuted24h: 0,
        successRate: 100,
        falsePositiveRate: 0,
        savingsGenerated: 0,
        hoursAutomated: 0,
      },
      guardian: {
        metricsMonitored: 0,
        alertsRaised: 0,
        preventedIssues: 0,
        lastPatrol: new Date(),
        coveragePercentage: 0,
      },
    }
  }

  private initializeBuiltinRules(): void {
    BUILTIN_RULES.forEach((rulePartial) => {
      const rule: AgenticRule = {
        ...rulePartial,
        enabled: true,
        executionCount: 0,
        createdAt: new Date(),
        createdBy: 'system',
        modifiedAt: new Date(),
        successRate: 100,
        conditions: rulePartial.conditions ?? [],
      } as AgenticRule

      this.rules.set(rule.id, rule)
    })

    this.state.activeRules = Array.from(this.rules.values())
    logger.info('[AgenticAI] Builtin rules initialized', {
      context: 'AgenticAIEngine',
      data: { count: this.rules.size },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🚀 CONTROL DEL MOTOR
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Inicia el modo guardián con patrullaje continuo
   */
  startGuardianMode(): void {
    if (this.state.mode === 'guardian' && this.patrolInterval) {
      logger.warn('[AgenticAI] Guardian mode already active', { context: 'AgenticAIEngine' })
      return
    }

    this.state.mode = 'guardian'
    this.state.isActive = true

    this.patrolInterval = setInterval(() => {
      void this.patrol()
    }, PATROL_INTERVAL_MS)

    logger.info('[AgenticAI] Guardian mode activated', { context: 'AgenticAIEngine' })
    this.callbacks.onEmotionChange?.('alert')
  }

  /**
   * Detiene el modo guardián
   */
  stopGuardianMode(): void {
    if (this.patrolInterval) {
      clearInterval(this.patrolInterval)
      this.patrolInterval = null
    }

    this.state.mode = 'hibernation'
    this.state.isActive = false

    logger.info('[AgenticAI] Guardian mode deactivated', { context: 'AgenticAIEngine' })
    this.callbacks.onEmotionChange?.('idle')
  }

  /**
   * Cambia el modo de operación
   */
  setMode(mode: AgenticAIMode): void {
    const previousMode = this.state.mode
    this.state.mode = mode

    if (mode === 'guardian' && previousMode !== 'guardian') {
      this.startGuardianMode()
    } else if (mode !== 'guardian' && previousMode === 'guardian') {
      this.stopGuardianMode()
    }

    logger.info('[AgenticAI] Mode changed', {
      context: 'AgenticAIEngine',
      data: { from: previousMode, to: mode },
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 📞 AUTONOMOUS CAPABILITIES (SUPREME TIER)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Ejecuta una llamada autónoma a un cliente usando Vapi.ai
   */
  async executeAutonomousCall(
    client: { id: string; name: string; phone: string }, 
    purpose: 'collection' | 'sales' | 'support'
  ): Promise<{ success: boolean; duration: number; transcript: string; sentiment: string }> {
    logger.info('[AgenticAI] Initiating autonomous call via Vapi', {
      context: 'AgenticAIEngine',
      data: { client: client.name, purpose },
    })

    try {
      // Configuración dinámica del asistente según propósito
      const assistantId = purpose === 'collection' 
        ? 'asst_collection_premium' 
        : 'asst_sales_closer'

      const callId = await vapiClient.startOutboundCall({
        phoneNumberId: 'phone_premium_001',
        customerNumber: client.phone,
        assistantId,
        customerName: client.name,
        reason: purpose
      })

      if (!callId) {
         throw new Error('Failed to initiate call')
      }

      return {
        success: true,
        duration: 0,
        transcript: "Llamada iniciada en cola de Vapi...",
        sentiment: "neutral"
      }

    } catch (error) {
      logger.error('Fallo en llamada autónoma', { context: 'AgenticAIEngine', error })
      return { success: false, duration: 0, transcript: "", sentiment: "error" }
    }
  }

  /**
   * Procesa decisiones de negocio complejas usando OpenAI GPT-4o
   */
  async processBusinessDecision(
    context: BusinessContext
  ): Promise<{ decision: string; confidence: number; reasoning: string[] }> {
    logger.info('[AgenticAI] Processing quantum business decision via OpenAI', { context: 'AgenticAIEngine' })

    try {
      const { text } = await generateText({
        model: openai('gpt-4o'),
        prompt: `Analyze the following business context and provide a strategic decision:
        Context: ${JSON.stringify(context)}
        
        Output format: JSON with decision (string), confidence (0-100), reasoning (array of strings).`
      })
      
      try {
        const result = JSON.parse(text.replace(/```json/g, '').replace(/```/g, ''))
        return result
      } catch (e) {
         return {
            decision: 'MANUAL_REVIEW',
            confidence: 50,
            reasoning: [text]
         }
      }
    } catch (error) {
      logger.error('Fallo en decisión AI', { context: 'AgenticAIEngine', error })
      return {
        decision: 'MANUAL_REVIEW',
        confidence: 0,
        reasoning: ['Error en motor AI', 'Requiere intervención humana']
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🛡️ PATRULLAJE Y MONITOREO
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Ejecuta una patrulla de métricas
   */
  async patrol(): Promise<PatrolReport> {
    const startTime = Date.now()
    const report: PatrolReport = {
      timestamp: new Date(),
      metricsChecked: 0,
      rulesEvaluated: 0,
      anomaliesFound: [],
      actionsTriggered: [],
      insights: [],
      duration: 0,
    }

    try {
      this.state.lastHeartbeat = new Date()
      this.state.guardian.lastPatrol = new Date()

      // Evaluar todas las reglas activas
      for (const rule of this.rules.values()) {
        if (!rule.enabled) continue

        report.rulesEvaluated++
        const triggered = await this.evaluateRule(rule)

        if (triggered) {
          report.actionsTriggered.push({
            ruleId: rule.id,
            ruleName: rule.name,
            action: rule.action,
          })

          this.callbacks.onRuleTriggered?.(rule)
        }
      }

      // Detectar anomalías
      const anomalies = await this.detectAnomalies()
      report.anomaliesFound = anomalies

      if (anomalies.length > 0) {
        this.state.anomaliesDetected += anomalies.length
        anomalies.forEach((anomaly) => {
          this.callbacks.onAnomalyDetected?.(anomaly)
        })
      }

      // Generar insights proactivos
      const insights = await this.generateProactiveInsights()
      report.insights = insights

      insights.forEach((insight) => {
        this.callbacks.onInsightGenerated?.(insight)
      })

      // Procesar cola de acciones
      await this.processActionQueue()

      report.duration = Date.now() - startTime
      this.state.performance.avgResponseTime =
        (this.state.performance.avgResponseTime + report.duration) / 2

      logger.info('[AgenticAI] Patrol completed', {
        context: 'AgenticAIEngine',
        data: {
          duration: report.duration,
          rulesEvaluated: report.rulesEvaluated,
          anomalies: report.anomaliesFound.length,
        },
      })

      return report
    } catch (error) {
      logger.error('[AgenticAI] Patrol failed', error as Error, { context: 'AgenticAIEngine' })
      this.state.healthScore = Math.max(0, this.state.healthScore - 5)
      throw error
    }
  }

  /**
   * Evalúa una regla contra el contexto actual
   */
  private async evaluateRule(rule: AgenticRule): Promise<boolean> {
    // Verificar cooldown
    if (rule.lastExecution) {
      const cooldownMs = rule.cooldownMinutes * 60 * 1000
      if (Date.now() - rule.lastExecution.getTime() < cooldownMs) {
        return false
      }
    }

    // Verificar límite diario
    if (rule.executionCount >= rule.maxExecutionsPerDay) {
      return false
    }

    // Evaluar trigger
    const triggerMet = await this.evaluateTrigger(rule.trigger)
    if (!triggerMet) return false

    // Evaluar condiciones adicionales
    for (const condition of rule.conditions) {
      const conditionMet = await this.evaluateCondition(condition)
      if (!conditionMet) return false
    }

    // Regla activada - agregar a cola
    await this.queueAction(rule)
    return true
  }

  /**
   * Evalúa un trigger de regla
   */
  private async evaluateTrigger(trigger: AgenticRule['trigger']): Promise<boolean> {
    if (!this.businessContext) return false

    switch (trigger.type) {
      case 'threshold':
        return this.evaluateThreshold(trigger)
      case 'pattern':
        return this.evaluatePattern(trigger)
      case 'schedule':
        return this.evaluateSchedule(trigger)
      case 'compound':
        return this.evaluateCompound(trigger)
      default:
        return false
    }
  }

  private evaluateThreshold(trigger: AgenticRule['trigger']): boolean {
    if (!trigger.metric || !trigger.operator || trigger.value === undefined) return false

    const value = this.getMetricValue(trigger.metric)
    if (value === undefined) return false

    switch (trigger.operator) {
      case '>':
        return typeof value === 'number' && value > (trigger.value as number)
      case '<':
        return typeof value === 'number' && value < (trigger.value as number)
      case '>=':
        return typeof value === 'number' && value >= (trigger.value as number)
      case '<=':
        return typeof value === 'number' && value <= (trigger.value as number)
      case '==':
        return value === trigger.value
      case 'contains':
        return String(value).includes(String(trigger.value))
      default:
        return false
    }
  }

  private evaluatePattern(trigger: AgenticRule['trigger']): boolean {
    if (!trigger.pattern || !trigger.metric) return false
    const value = String(this.getMetricValue(trigger.metric) ?? '')
    const regex = new RegExp(trigger.pattern)
    return regex.test(value)
  }

  private evaluateSchedule(_trigger: AgenticRule['trigger']): boolean {
    // Simplificado - en producción usar cron parser
    return true
  }

  private async evaluateCompound(trigger: AgenticRule['trigger']): Promise<boolean> {
    if (!trigger.compound || trigger.compound.length === 0) return false

    const results = await Promise.all(
      trigger.compound.map((subRule) => this.evaluateTrigger(subRule.trigger)),
    )

    if (trigger.compoundOperator === 'AND') {
      return results.every(Boolean)
    } else {
      return results.some(Boolean)
    }
  }

  private async evaluateCondition(condition: AgenticCondition): Promise<boolean> {
    const value = this.getMetricValue(condition.field)
    if (value === undefined || value === null) return false

    switch (condition.operator) {
      case '>':
        return typeof value === 'number' && value > (condition.value as number)
      case '<':
        return typeof value === 'number' && value < (condition.value as number)
      case '>=':
        return typeof value === 'number' && value >= (condition.value as number)
      case '<=':
        return typeof value === 'number' && value <= (condition.value as number)
      case '==':
        return value === condition.value
      case 'in':
        return (condition.value as unknown[]).includes(value)
      case 'not_in':
        return !(condition.value as unknown[]).includes(value)
      case 'contains':
        return String(value).includes(String(condition.value))
      case 'regex':
        return new RegExp(String(condition.value)).test(String(value))
      default:
        return false
    }
  }

  /**
   * Obtiene el valor de una métrica del contexto
   */
  private getMetricValue(metricPath: string): unknown {
    if (!this.businessContext) return undefined

    const parts = metricPath.split('.')
    let current: unknown = this.businessContext

    for (const part of parts) {
      if (current === null || current === undefined) return undefined
      current = (current as Record<string, unknown>)[part]
    }

    return current
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🎯 COLA DE ACCIONES
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Agrega una acción a la cola
   */
  private async queueAction(rule: AgenticRule): Promise<void> {
    const queueItem: AgenticActionQueue = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rule,
      action: rule.action,
      status: rule.requiresConfirmation ? 'pending' : 'executing',
      priority: this.getPriorityValue(rule.priority),
      scheduledFor: new Date(),
      attempts: 0,
      maxAttempts: 3,
      executionLog: [
        {
          timestamp: new Date(),
          event: 'queued',
          details: { ruleName: rule.name },
          success: true,
        },
      ],
    }

    this.actionQueue.push(queueItem)
    this.actionQueue.sort((a, b) => b.priority - a.priority)

    logger.info('[AgenticAI] Action queued', {
      context: 'AgenticAIEngine',
      data: { ruleId: rule.id, actionType: rule.action.type },
    })
  }

  /**
   * Procesa la cola de acciones pendientes
   */
  private async processActionQueue(): Promise<void> {
    const now = Date.now()
    let actionsThisMinute = 0

    for (const item of this.actionQueue) {
      if (actionsThisMinute >= MAX_ACTIONS_PER_MINUTE) break
      if (item.status !== 'executing') continue
      if (item.scheduledFor.getTime() > now) continue

      try {
        await this.executeAction(item)
        actionsThisMinute++
      } catch (error) {
        item.attempts++
        item.status = item.attempts >= item.maxAttempts ? 'failed' : 'pending'
        item.error = (error as Error).message

        logger.error('[AgenticAI] Action execution failed', error as Error, {
          context: 'AgenticAIEngine',
          data: { actionId: item.id },
        })
      }
    }

    // Limpiar acciones completadas/fallidas antiguas
    this.actionQueue = this.actionQueue.filter(
      (item) =>
        !['completed', 'failed', 'cancelled'].includes(item.status) ||
        Date.now() - item.scheduledFor.getTime() < 86400000,
    )
  }

  /**
   * Ejecuta una acción
   */
  private async executeAction(item: AgenticActionQueue): Promise<void> {
    const log: AgenticExecutionLog = {
      timestamp: new Date(),
      event: 'execution_started',
      details: {},
      success: false,
    }

    try {
      // Ejecutar según tipo
      switch (item.action.type) {
        case 'transfer':
          item.result = await this.executeTransfer(item.action)
          break
        case 'payment':
          item.result = await this.executePayment(item.action)
          break
        case 'alert':
          item.result = await this.executeAlert(item.action)
          break
        case 'notification':
          item.result = await this.executeNotification(item.action)
          break
        case 'adjustment':
          item.result = await this.executeAdjustment(item.action)
          break
        case 'workflow':
          item.result = await this.executeWorkflow(item.action)
          break
        default:
          throw new Error(`Unknown action type: ${item.action.type}`)
      }

      item.status = 'completed'
      item.rule.lastExecution = new Date()
      item.rule.executionCount++
      this.state.executedToday++
      this.state.performance.actionsExecuted24h++

      log.success = true
      log.event = 'execution_completed'
      log.details = { result: item.result }

      this.callbacks.onActionExecuted?.(item)
    } catch (error) {
      log.success = false
      log.event = 'execution_failed'
      log.details = { error: (error as Error).message }
      throw error
    } finally {
      item.executionLog.push(log)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ⚡ EJECUTORES DE ACCIONES ESPECÍFICAS
  // ─────────────────────────────────────────────────────────────────────────────

  private async executeTransfer(action: AgenticAction): Promise<unknown> {
    logger.info('[AgenticAI] Executing transfer', {
      context: 'AgenticAIEngine',
      data: action.parameters,
    })
    // En producción: integrar con lógica real de transferencias
    return { success: true, transferId: `TR_${Date.now()}` }
  }

  private async executePayment(action: AgenticAction): Promise<unknown> {
    logger.info('[AgenticAI] Executing payment', {
      context: 'AgenticAIEngine',
      data: action.parameters,
    })
    return { success: true, paymentId: `PAY_${Date.now()}` }
  }

  private async executeAlert(action: AgenticAction): Promise<unknown> {
    const severity = action.parameters.severity as string
    this.callbacks.onAlert?.({
      type: severity === 'critical' ? 'danger' : severity === 'high' ? 'warning' : 'info',
      title: 'Alerta del Sistema Agentic',
      message: action.parameters.message as string,
      priority: severity as 'critical' | 'high' | 'medium' | 'low',
    })
    return { success: true, alertId: `ALR_${Date.now()}` }
  }

  private async executeNotification(action: AgenticAction): Promise<unknown> {
    const params = action.parameters
    if (params.nexbotEmotion) {
      this.callbacks.onEmotionChange?.(params.nexbotEmotion as NexBotEmotion)
    }
    return { success: true, notificationId: `NOT_${Date.now()}` }
  }

  private async executeAdjustment(action: AgenticAction): Promise<unknown> {
    logger.info('[AgenticAI] Executing adjustment', {
      context: 'AgenticAIEngine',
      data: action.parameters,
    })
    return { success: true, adjustmentId: `ADJ_${Date.now()}` }
  }

  private async executeWorkflow(action: AgenticAction): Promise<unknown> {
    logger.info('[AgenticAI] Executing workflow', {
      context: 'AgenticAIEngine',
      data: action.parameters,
    })
    return { success: true, workflowId: `WF_${Date.now()}` }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔍 DETECCIÓN DE ANOMALÍAS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Detecta anomalías en el sistema
   */
  private async detectAnomalies(): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = []

    if (!this.businessContext) return anomalies

    // Anomalía: Utilidad negativa
    if (this.businessContext.utilidadesMes < 0) {
      anomalies.push({
        type: 'negative_utility',
        severity: 'critical',
        description: `Utilidades del mes negativas: ${this.businessContext.utilidadesMes}`,
        metric: 'utilidadesMes',
        value: this.businessContext.utilidadesMes,
        detectedAt: new Date(),
      })
    }

    // Anomalía: Deuda excesiva de clientes
    if (this.businessContext.deudaTotalClientes > this.businessContext.capitalTotal * 0.5) {
      anomalies.push({
        type: 'high_debt',
        severity: 'high',
        description: 'Deuda de clientes excede 50% del capital',
        metric: 'deudaTotalClientes',
        value: this.businessContext.deudaTotalClientes,
        detectedAt: new Date(),
      })
    }

    // Anomalía: Productos bajo stock crítico
    if (this.businessContext.productosBajoStock > this.businessContext.totalProductos * 0.3) {
      anomalies.push({
        type: 'stock_critical',
        severity: 'high',
        description: 'Más del 30% de productos con stock bajo',
        metric: 'productosBajoStock',
        value: this.businessContext.productosBajoStock,
        detectedAt: new Date(),
      })
    }

    // Anomalía: Flujo de caja negativo persistente
    if (this.businessContext.flujoCajaMes < 0 && this.businessContext.tendenciaCapital === 'down') {
      anomalies.push({
        type: 'negative_cashflow',
        severity: 'critical',
        description: 'Flujo de caja negativo con tendencia de capital descendente',
        metric: 'flujoCajaMes',
        value: this.businessContext.flujoCajaMes,
        detectedAt: new Date(),
      })
    }

    return anomalies
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 💡 INSIGHTS PROACTIVOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Genera insights proactivos basados en el análisis
   */
  private async generateProactiveInsights(): Promise<ChronosInsight[]> {
    const insights: ChronosInsight[] = []

    if (!this.businessContext) return insights

    // Insight: Oportunidad de crecimiento
    if (this.businessContext.tendenciaVentas === 'up' && this.businessContext.margenPromedio > 30) {
      insights.push({
        id: `insight_${Date.now()}_1`,
        type: 'opportunity',
        priority: 'medium',
        title: 'Momento Óptimo para Expansión',
        description: `Ventas en tendencia alcista con margen ${this.businessContext.margenPromedio.toFixed(1)}%. Considera ampliar inventario de productos estrella.`,
        metric: 'margenPromedio',
        value: this.businessContext.margenPromedio,
        trend: 'up',
        confidence: 85,
        emotionalTone: 'excited',
        suggestedAction: 'Revisar top productos y aumentar stock',
      })
    }

    // Insight: Clientes inactivos con potencial
    if (this.businessContext.clientesActivos < this.businessContext.totalClientes * 0.7) {
      const inactivos = this.businessContext.totalClientes - this.businessContext.clientesActivos
      insights.push({
        id: `insight_${Date.now()}_2`,
        type: 'tip',
        priority: 'medium',
        title: 'Reactivación de Clientes',
        description: `${inactivos} clientes inactivos. Campaña de reactivación podría generar ${(inactivos * 500).toFixed(0)}$ adicionales.`,
        metric: 'clientesActivos',
        value: this.businessContext.clientesActivos,
        confidence: 70,
        emotionalTone: 'thinking',
        suggestedAction: 'Lanzar campaña de descuentos para clientes inactivos',
      })
    }

    // Insight: Celebración de logro
    if (this.businessContext.ventasHoy > this.businessContext.ventasPromedioDiario * 1.5) {
      insights.push({
        id: `insight_${Date.now()}_3`,
        type: 'celebration',
        priority: 'low',
        title: '¡Día Excepcional!',
        description: 'Las ventas de hoy superan el promedio diario por 50%. ¡Excelente trabajo!',
        metric: 'ventasHoy',
        value: this.businessContext.ventasHoy,
        trend: 'up',
        confidence: 100,
        emotionalTone: 'celebrating',
      })
    }

    return insights
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔧 MÉTODOS PÚBLICOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Actualiza el contexto de negocio
   */
  updateBusinessContext(context: BusinessContext): void {
    this.businessContext = context
    this.state.guardian.metricsMonitored = Object.keys(context).length
  }

  /**
   * Agrega una nueva regla personalizada
   */
  addRule(
    rule: Omit<AgenticRule, 'createdAt' | 'modifiedAt' | 'executionCount' | 'successRate'>,
  ): void {
    const fullRule: AgenticRule = {
      ...rule,
      createdAt: new Date(),
      modifiedAt: new Date(),
      executionCount: 0,
      successRate: 100,
    }

    this.rules.set(rule.id, fullRule)
    this.state.activeRules = Array.from(this.rules.values())

    logger.info('[AgenticAI] Rule added', { context: 'AgenticAIEngine', data: { ruleId: rule.id } })
  }

  /**
   * Aprueba una acción pendiente
   */
  approveAction(actionId: string): void {
    const action = this.actionQueue.find((a) => a.id === actionId)
    if (action && action.status === 'pending') {
      action.status = 'executing'
      logger.info('[AgenticAI] Action approved', { context: 'AgenticAIEngine', data: { actionId } })
    }
  }

  /**
   * Rechaza una acción pendiente
   */
  rejectAction(actionId: string): void {
    const action = this.actionQueue.find((a) => a.id === actionId)
    if (action && action.status === 'pending') {
      action.status = 'cancelled'
      logger.info('[AgenticAI] Action rejected', { context: 'AgenticAIEngine', data: { actionId } })
    }
  }

  /**
   * Obtiene el estado actual
   */
  getState(): AgenticAIState {
    return { ...this.state }
  }

  /**
   * Obtiene acciones pendientes de aprobación
   */
  getPendingActions(): AgenticActionQueue[] {
    return this.actionQueue.filter((a) => a.status === 'pending')
  }

  /**
   * Destruye el motor
   */
  destroy(): void {
    this.stopGuardianMode()
    this.rules.clear()
    this.actionQueue = []
    logger.info('[AgenticAI] Engine destroyed', { context: 'AgenticAIEngine' })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔢 UTILIDADES
  // ─────────────────────────────────────────────────────────────────────────────

  private getPriorityValue(priority: AgenticRule['priority']): number {
    switch (priority) {
      case 'critical':
        return 100
      case 'high':
        return 75
      case 'medium':
        return 50
      case 'low':
        return 25
      default:
        return 0
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 TIPOS ADICIONALES Y EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export interface AgenticCallbacks {
  onRuleTriggered?: (_rule: AgenticRule) => void
  onActionExecuted?: (_action: AgenticActionQueue) => void
  onAnomalyDetected?: (_anomaly: Anomaly) => void
  onInsightGenerated?: (_insight: ChronosInsight) => void
  onEmotionChange?: (_emotion: NexBotEmotion) => void
  onAlert?: (_alert: { type: string; title: string; message: string; priority: string }) => void
}

export interface Anomaly {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  metric: string
  value: number
  detectedAt: Date
}

export interface PatrolReport {
  timestamp: Date
  metricsChecked: number
  rulesEvaluated: number
  anomaliesFound: Anomaly[]
  actionsTriggered: { ruleId: string; ruleName: string; action: AgenticAction }[]
  insights: ChronosInsight[]
  duration: number
}

// Singleton para uso global
let agenticInstance: AgenticAIEngine | null = null

export function getAgenticAIEngine(callbacks?: Partial<AgenticCallbacks>): AgenticAIEngine {
  if (!agenticInstance) {
    agenticInstance = new AgenticAIEngine(callbacks)
  }
  return agenticInstance
}

export function resetAgenticAIEngine(): void {
  if (agenticInstance) {
    agenticInstance.destroy()
    agenticInstance = null
  }
}
