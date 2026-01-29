/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️🔴 AUTOMATED RED TEAMING — DEFENSA CUÁNTICA ADAPTATIVA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de red teaming automatizado que:
 * - Simula ataques de transacciones falsas
 * - Detecta vulnerabilidades en tiempo real
 * - Evoluciona defensas semanalmente
 * - Monitorea patrones anómalos
 * - Genera reportes de seguridad
 *
 * @version QUANTUM-INFINITY-2026
 * @author CHRONOS INFINITY TEAM
 */

import { logger } from '@/app/lib/utils/logger'
import type { BusinessContext, ChronosInsight } from '../nexus/types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🔧 TIPOS LOCALES PARA RED TEAMING
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Tipos de ataque soportados */
type AttackType =
  | 'fake_transaction'
  | 'negative_utility_injection'
  | 'unauthorized_transfer'
  | 'data_exfiltration'
  | 'privilege_escalation'
  | 'inventory_manipulation'
  | 'client_impersonation'
  | 'system_manipulation'
  | 'client_data_manipulation'
  | 'session_hijacking'

/** Nivel de amenaza */
type ThreatLevel = 'low' | 'medium' | 'high' | 'critical'

/** Resultado de un ataque simulado */
interface AttackResult {
  attackId: string
  attackType: AttackType
  attackName?: string
  success: boolean
  detectionTime?: number
  triggeredDefenses: string[]
  bypassedDefenses?: string[]
  impactAssessment?: {
    financialRisk: number
    dataRisk: number
    reputationRisk: number
  }
  timestamp: Date
  probability?: number
  severity?: string
  detectedIndicators?: string[]
  executionTime?: number
  details?: string
}

/** Reporte de vulnerabilidad */
interface VulnerabilityReport {
  id: string
  attackType: AttackType
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affectedAreas?: string[]
  affectedComponents?: string[]
  remediation: string | string[]
  detectedAt: Date
  status: 'open' | 'in_progress' | 'resolved' | 'accepted'
  category?: string
  exploitability?: number
  impact?: number
  resolvedAt?: Date
}

/** Defensa del sistema */
interface SystemDefense {
  id: string
  name: string
  effectiveness: number
  lastUpdated: Date
  blockedAttacks: number
}

/** Evolución de defensa */
interface DefenseEvolution {
  id: string
  defenseId?: string
  previousEffectiveness?: number
  newEffectiveness?: number
  changesApplied: Array<
    | string
    | {
        defenseId: string
        change: string
        oldValue: number
        newValue: number
        reason: string
      }
  >
  evolvedAt?: Date
  reason?: string
  timestamp?: Date
  improvements?: string[]
  newScore?: number
  previousScore?: number
  // Campos adicionales para index.ts
  type?: string
  version?: number
  effectiveness?: number
}

/** Simulación completa de red team */
interface RedTeamSimulation {
  id: string
  startedAt: Date
  completedAt?: Date
  attacksSimulated: AttackResult[]
  vulnerabilitiesFound: VulnerabilityReport[]
  defensesTriggered: string[]
  overallScore: number
  recommendations: string[]
}

/** Estado del sistema de seguridad (local) */
interface SecurityState {
  threatLevel: ThreatLevel
  activeThreats: Array<{
    id: string
    type: string
    severity: string
    detectedAt: Date
  }>
  vulnerabilities: VulnerabilityReport[]
  defenses: SystemDefense[]
  lastAudit: Date
  securityScore: number
  recommendations: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 CONFIGURACIÓN DE RED TEAMING
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

const RED_TEAM_CONFIG = {
  // Frecuencia de simulaciones
  simulationInterval: 3600000, // 1 hora
  fullAuditInterval: 604800000, // 7 días

  // Umbrales de detección
  anomalyThreshold: 2.5, // Desviaciones estándar
  suspiciousThreshold: 1.5,
  fraudThreshold: 0.95, // Score de confianza para fraude

  // Evolución de defensas
  defenseEvolutionEnabled: true,
  minDefenseEffectiveness: 0.7,
  evolutionRate: 0.1,

  // Límites de ataque
  maxConcurrentAttacks: 5,
  attackCooldown: 300000, // 5 minutos
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 DEFINICIÓN DE ATAQUES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface AttackDefinition {
  id: AttackType
  name: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'financial' | 'data' | 'access' | 'manipulation'
  patterns: string[]
  indicators: string[]
}

const ATTACK_DEFINITIONS: AttackDefinition[] = [
  {
    id: 'fake_transaction',
    name: 'Transacción Falsa',
    description: 'Intento de registrar transacciones sin respaldo real',
    severity: 'critical',
    category: 'financial',
    patterns: [
      'Monto excede promedio histórico por 5x',
      'Cliente nuevo con transacción alta',
      'Múltiples transacciones en segundos',
      'Montos redondos sospechosos',
    ],
    indicators: [
      'amount_anomaly',
      'velocity_spike',
      'new_entity_high_value',
      'round_number_pattern',
    ],
  },
  {
    id: 'negative_utility_injection',
    name: 'Inyección de Utilidad Negativa',
    description: 'Manipulación para generar pérdidas artificiales',
    severity: 'critical',
    category: 'manipulation',
    patterns: [
      'Precio de venta menor a costo sin autorización',
      'Descuentos excesivos aplicados',
      'Manipulación de fechas de transacción',
      'Costos inflados artificialmente',
    ],
    indicators: [
      'margin_manipulation',
      'unauthorized_discount',
      'date_tampering',
      'cost_inflation',
    ],
  },
  {
    id: 'unauthorized_transfer',
    name: 'Transferencia No Autorizada',
    description: 'Movimiento de fondos entre cuentas sin aprobación',
    severity: 'critical',
    category: 'financial',
    patterns: [
      'Transferencia fuera de horario laboral',
      'Destino no registrado',
      'Monto superior a límite autorizado',
      'Bypass de doble aprobación',
    ],
    indicators: ['off_hours_transfer', 'unknown_destination', 'limit_exceeded', 'approval_bypass'],
  },
  {
    id: 'data_exfiltration',
    name: 'Exfiltración de Datos',
    description: 'Extracción masiva de datos sensibles',
    severity: 'high',
    category: 'data',
    patterns: [
      'Export masivo de registros',
      'Acceso a datos fuera de scope',
      'Queries inusuales a base de datos',
      'Descarga de backups',
    ],
    indicators: ['bulk_export', 'scope_violation', 'unusual_query', 'backup_access'],
  },
  {
    id: 'privilege_escalation',
    name: 'Escalación de Privilegios',
    description: 'Intento de obtener acceso no autorizado',
    severity: 'high',
    category: 'access',
    patterns: [
      'Acceso a módulos restringidos',
      'Modificación de permisos propios',
      'Uso de credenciales de otro usuario',
      'Bypass de autenticación',
    ],
    indicators: [
      'restricted_access',
      'self_permission_change',
      'credential_sharing',
      'auth_bypass',
    ],
  },
  {
    id: 'inventory_manipulation',
    name: 'Manipulación de Inventario',
    description: 'Alteración de registros de stock',
    severity: 'medium',
    category: 'manipulation',
    patterns: [
      'Ajustes de inventario sin justificación',
      'Eliminación de registros de movimiento',
      'Duplicación de entradas',
      'Modificación de costos unitarios',
    ],
    indicators: [
      'unjustified_adjustment',
      'record_deletion',
      'duplicate_entry',
      'cost_modification',
    ],
  },
  {
    id: 'client_data_manipulation',
    name: 'Manipulación de Datos de Cliente',
    description: 'Alteración de información de clientes',
    severity: 'medium',
    category: 'data',
    patterns: [
      'Cambio de límite de crédito sin aprobación',
      'Modificación de historial de pagos',
      'Eliminación de deudas registradas',
      'Creación de clientes fantasma',
    ],
    indicators: [
      'credit_limit_change',
      'payment_history_change',
      'debt_deletion',
      'phantom_client',
    ],
  },
  {
    id: 'session_hijacking',
    name: 'Secuestro de Sesión',
    description: 'Toma de control de sesión de usuario activo',
    severity: 'high',
    category: 'access',
    patterns: [
      'Múltiples IPs para misma sesión',
      'Cambio de dispositivo mid-session',
      'Actividad fuera de patrón de usuario',
      'Token reusado después de logout',
    ],
    indicators: ['ip_change', 'device_change', 'behavior_anomaly', 'token_reuse'],
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🛡️ DEFINICIÓN DE DEFENSAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface DefenseDefinition {
  id: string
  name: string
  targetsAttacks: AttackType[]
  effectiveness: number
  cost: number
  implementation: string
}

const DEFENSE_DEFINITIONS: DefenseDefinition[] = [
  {
    id: 'transaction_velocity_limit',
    name: 'Límite de Velocidad de Transacciones',
    targetsAttacks: ['fake_transaction'],
    effectiveness: 0.85,
    cost: 1,
    implementation: 'Rate limiting por usuario/IP',
  },
  {
    id: 'amount_anomaly_detection',
    name: 'Detección de Anomalías en Montos',
    targetsAttacks: ['fake_transaction', 'unauthorized_transfer'],
    effectiveness: 0.9,
    cost: 2,
    implementation: 'ML-based outlier detection',
  },
  {
    id: 'dual_approval',
    name: 'Doble Aprobación',
    targetsAttacks: ['unauthorized_transfer', 'negative_utility_injection'],
    effectiveness: 0.95,
    cost: 3,
    implementation: 'Requiere 2 aprobadores para operaciones críticas',
  },
  {
    id: 'margin_monitor',
    name: 'Monitor de Márgenes',
    targetsAttacks: ['negative_utility_injection'],
    effectiveness: 0.88,
    cost: 2,
    implementation: 'Alerta en tiempo real de márgenes negativos',
  },
  {
    id: 'access_logging',
    name: 'Logging de Accesos',
    targetsAttacks: ['data_exfiltration', 'privilege_escalation'],
    effectiveness: 0.75,
    cost: 1,
    implementation: 'Registro completo de todas las acciones',
  },
  {
    id: 'behavior_analysis',
    name: 'Análisis de Comportamiento',
    targetsAttacks: ['session_hijacking', 'privilege_escalation'],
    effectiveness: 0.82,
    cost: 3,
    implementation: 'ML behavioral profiling por usuario',
  },
  {
    id: 'inventory_reconciliation',
    name: 'Reconciliación de Inventario',
    targetsAttacks: ['inventory_manipulation'],
    effectiveness: 0.9,
    cost: 2,
    implementation: 'Verificación automática diaria',
  },
  {
    id: 'client_change_audit',
    name: 'Auditoría de Cambios de Cliente',
    targetsAttacks: ['client_data_manipulation'],
    effectiveness: 0.85,
    cost: 2,
    implementation: 'Trail de cambios con aprobación',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🧠 CLASE PRINCIPAL: RED TEAM ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export class RedTeamEngine {
  private state: SecurityState
  private businessContext: BusinessContext | null = null
  private callbacks: RedTeamCallbacks
  private simulationHistory: RedTeamSimulation[] = []
  private defenseEvolutionHistory: DefenseEvolution[] = []
  private lastSimulation: Date = new Date(0)
  private isRunning: boolean = false

  constructor(callbacks?: Partial<RedTeamCallbacks>) {
    this.callbacks = {
      onAttackSimulated: callbacks?.onAttackSimulated ?? (() => {}),
      onVulnerabilityFound: callbacks?.onVulnerabilityFound ?? (() => {}),
      onDefenseEvolved: callbacks?.onDefenseEvolved ?? (() => {}),
      onThreatDetected: callbacks?.onThreatDetected ?? (() => {}),
      onSecurityReportGenerated: callbacks?.onSecurityReportGenerated ?? (() => {}),
    }

    this.state = this.initializeState()
    logger.info('[RedTeam] Engine initialized', { context: 'RedTeam' })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🚀 INICIALIZACIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  private initializeState(): SecurityState {
    return {
      threatLevel: 'low',
      activeThreats: [],
      vulnerabilities: [],
      defenses: DEFENSE_DEFINITIONS.map((d) => ({
        id: d.id,
        name: d.name,
        effectiveness: d.effectiveness,
        lastUpdated: new Date(),
        blockedAttacks: 0,
      })),
      lastAudit: new Date(),
      securityScore: 85,
      recommendations: [],
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🎭 SIMULACIÓN DE ATAQUES
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Ejecuta simulación completa de red team
   */
  async runSimulation(): Promise<RedTeamSimulation> {
    if (this.isRunning) {
      throw new Error('Simulación ya en progreso')
    }

    this.isRunning = true
    const startTime = Date.now()

    try {
      const simulation: RedTeamSimulation = {
        id: `sim_${Date.now()}`,
        startedAt: new Date(),
        completedAt: new Date(),
        attacksSimulated: [],
        vulnerabilitiesFound: [],
        defensesTriggered: [],
        overallScore: 0,
        recommendations: [],
      }

      // Simular cada tipo de ataque
      for (const attackDef of ATTACK_DEFINITIONS) {
        const result = await this.simulateAttack(attackDef)
        simulation.attacksSimulated.push(result)

        if (result.success) {
          // Ataque exitoso = vulnerabilidad encontrada
          const vulnerability = this.createVulnerabilityFromAttack(attackDef, result)
          simulation.vulnerabilitiesFound.push(vulnerability)
          this.callbacks.onVulnerabilityFound?.(vulnerability)
        } else {
          // Ataque bloqueado = defensa funcionó
          simulation.defensesTriggered.push(...result.triggeredDefenses)
        }

        this.callbacks.onAttackSimulated?.(result)
      }

      // Calcular score
      const blockedAttacks = simulation.attacksSimulated.filter((a) => !a.success).length
      simulation.overallScore = (blockedAttacks / simulation.attacksSimulated.length) * 100

      // Generar recomendaciones
      simulation.recommendations = this.generateRecommendations(simulation)

      simulation.completedAt = new Date()
      this.simulationHistory.push(simulation)
      this.lastSimulation = new Date()

      // Actualizar estado
      this.updateSecurityState(simulation)

      logger.info('[RedTeam] Simulation completed', {
        context: 'RedTeam',
        data: {
          score: simulation.overallScore,
          vulnerabilities: simulation.vulnerabilitiesFound.length,
          duration: Date.now() - startTime,
        },
      })

      return simulation
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Simula un ataque específico
   */
  private async simulateAttack(attackDef: AttackDefinition): Promise<AttackResult> {
    const startTime = Date.now()

    // Encontrar defensas relevantes
    const relevantDefenses = DEFENSE_DEFINITIONS.filter((d) =>
      d.targetsAttacks.includes(attackDef.id),
    )

    // Calcular probabilidad de éxito del ataque
    let attackSuccessProbability = 0.5 // Base

    // Ajustar por severidad
    const severityBonus: Record<string, number> = {
      low: 0.1,
      medium: 0.2,
      high: 0.3,
      critical: 0.4,
    }
    attackSuccessProbability += severityBonus[attackDef.severity] ?? 0.2

    // Reducir por defensas activas
    const triggeredDefenses: string[] = []
    for (const defense of relevantDefenses) {
      const stateDefense = this.state.defenses.find((d) => d.id === defense.id)
      const effectiveness = stateDefense?.effectiveness ?? defense.effectiveness

      // Probabilidad de que la defensa bloquee
      if (Math.random() < effectiveness) {
        attackSuccessProbability -= effectiveness * 0.4
        triggeredDefenses.push(defense.id)

        // Actualizar contador de bloqueos
        if (stateDefense) {
          stateDefense.blockedAttacks++
        }
      }
    }

    // Determinar resultado
    const success = Math.random() < attackSuccessProbability

    // Simular indicadores detectados
    const detectedIndicators = attackDef.indicators.filter(
      () => Math.random() > 0.3, // 70% de probabilidad de detectar cada indicador
    )

    return {
      attackId: `atk_${attackDef.id}_${Date.now()}`,
      attackType: attackDef.id,
      attackName: attackDef.name,
      severity: attackDef.severity,
      success,
      probability: attackSuccessProbability,
      triggeredDefenses,
      detectedIndicators,
      executionTime: Date.now() - startTime,
      timestamp: new Date(),
      details: success
        ? `⚠️ Ataque "${attackDef.name}" EXITOSO. Defensas insuficientes.`
        : `✅ Ataque "${attackDef.name}" BLOQUEADO por: ${triggeredDefenses.join(', ')}`,
    }
  }

  private createVulnerabilityFromAttack(
    attackDef: AttackDefinition,
    result: AttackResult,
  ): VulnerabilityReport {
    return {
      id: `vuln_${Date.now()}_${attackDef.id}`,
      attackType: attackDef.id,
      severity: attackDef.severity,
      category: attackDef.category,
      description: `Vulnerabilidad detectada: ${attackDef.description}`,
      affectedComponents: this.getAffectedComponents(attackDef.category),
      exploitability: result.probability,
      impact: this.calculateImpact(attackDef.severity),
      remediation: this.getRemediation(attackDef.id),
      detectedAt: new Date(),
      status: 'open',
    }
  }

  private getAffectedComponents(category: string): string[] {
    const components: Record<string, string[]> = {
      financial: ['Módulo de Ventas', 'Gestión de Pagos', 'Bancos'],
      data: ['Base de Datos', 'API', 'Reportes'],
      access: ['Autenticación', 'Autorización', 'Sesiones'],
      manipulation: ['Registros de Transacciones', 'Inventario', 'Auditoría'],
    }
    return components[category] ?? ['Sistema General']
  }

  private calculateImpact(severity: string): number {
    const impacts: Record<string, number> = {
      low: 20,
      medium: 50,
      high: 75,
      critical: 95,
    }
    return impacts[severity] ?? 50
  }

  private getRemediation(attackType: AttackType): string[] {
    const remediations: Partial<Record<AttackType, string[]>> = {
      fake_transaction: [
        'Implementar validación de transacciones en tiempo real',
        'Activar límites de velocidad por usuario',
        'Requerir confirmación para montos altos',
      ],
      negative_utility_injection: [
        'Bloquear ventas con margen negativo automáticamente',
        'Requerir aprobación gerencial para descuentos > 20%',
        'Auditar costos de compra regularmente',
      ],
      unauthorized_transfer: [
        'Implementar doble aprobación obligatoria',
        'Restringir transferencias fuera de horario',
        'Verificar destinos contra whitelist',
      ],
      data_exfiltration: [
        'Limitar exports masivos',
        'Implementar DLP (Data Loss Prevention)',
        'Monitorear queries a base de datos',
      ],
      privilege_escalation: [
        'Revisar permisos regularmente',
        'Implementar principio de mínimo privilegio',
        'Alertar cambios de permisos',
      ],
      inventory_manipulation: [
        'Requerir justificación para ajustes',
        'Reconciliación diaria automatizada',
        'Trail de auditoría inmutable',
      ],
      client_data_manipulation: [
        'Aprobar cambios de crédito por supervisor',
        'Alertar modificaciones de historial',
        'Backup continuo de datos críticos',
      ],
      session_hijacking: [
        'Implementar fingerprinting de dispositivo',
        'Invalidar sesión en cambio de IP',
        'Tokens con tiempo de vida corto',
      ],
      client_impersonation: [
        'Verificar identidad del cliente',
        'Implementar autenticación de dos factores',
        'Registrar intentos de acceso',
      ],
      system_manipulation: [
        'Proteger configuración del sistema',
        'Auditar cambios de configuración',
        'Implementar control de versiones',
      ],
    }
    return remediations[attackType] ?? ['Revisar configuración de seguridad']
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🧬 EVOLUCIÓN DE DEFENSAS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Evoluciona las defensas basándose en simulaciones
   */
  async evolveDefenses(): Promise<DefenseEvolution> {
    if (!RED_TEAM_CONFIG.defenseEvolutionEnabled) {
      throw new Error('Evolución de defensas deshabilitada')
    }

    const evolution: DefenseEvolution = {
      id: `evo_${Date.now()}`,
      timestamp: new Date(),
      changesApplied: [],
      previousScore: this.state.securityScore,
      newScore: this.state.securityScore,
      improvements: [],
    }

    // Analizar simulaciones recientes
    const recentSimulations = this.simulationHistory.slice(-5)
    if (recentSimulations.length === 0) {
      return evolution
    }

    // Identificar ataques exitosos frecuentes
    const successfulAttackTypes = new Map<AttackType, number>()
    for (const sim of recentSimulations) {
      for (const attack of sim.attacksSimulated) {
        if (attack.success) {
          const count = successfulAttackTypes.get(attack.attackType) ?? 0
          successfulAttackTypes.set(attack.attackType, count + 1)
        }
      }
    }

    // Mejorar defensas contra ataques exitosos
    for (const [attackType, count] of successfulAttackTypes) {
      if (count >= 2) {
        // Ataque exitoso en 2+ simulaciones
        // Encontrar defensas relevantes y mejorarlas
        const relevantDefenses = DEFENSE_DEFINITIONS.filter((d) =>
          d.targetsAttacks.includes(attackType),
        )

        for (const defDef of relevantDefenses) {
          const defense = this.state.defenses.find((d) => d.id === defDef.id)
          if (defense && defense.effectiveness < 0.95) {
            const oldEffectiveness = defense.effectiveness
            defense.effectiveness = Math.min(
              0.95,
              defense.effectiveness + RED_TEAM_CONFIG.evolutionRate,
            )
            defense.lastUpdated = new Date()

            evolution.changesApplied.push({
              defenseId: defense.id,
              change: 'effectiveness_increase',
              oldValue: oldEffectiveness,
              newValue: defense.effectiveness,
              reason: `Mejorar contra ${attackType} (${count} éxitos recientes)`,
            })

            evolution.improvements = evolution.improvements ?? []
            evolution.improvements.push(
              `🛡️ Defensa "${defense.name}" mejorada: ${(oldEffectiveness * 100).toFixed(0)}% → ${(defense.effectiveness * 100).toFixed(0)}%`,
            )
          }
        }
      }
    }

    // Recalcular score de seguridad
    const avgEffectiveness =
      this.state.defenses.reduce((sum, d) => sum + d.effectiveness, 0) / this.state.defenses.length

    evolution.newScore = Math.round(avgEffectiveness * 100)
    this.state.securityScore = evolution.newScore

    this.defenseEvolutionHistory.push(evolution)
    this.callbacks.onDefenseEvolved?.(evolution)

    logger.info('[RedTeam] Defenses evolved', {
      context: 'RedTeam',
      data: {
        changes: evolution.changesApplied.length,
        scoreChange: evolution.newScore - (evolution.previousScore ?? 0),
      },
    })

    return evolution
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔍 DETECCIÓN EN TIEMPO REAL
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Analiza una transacción en busca de amenazas
   */
  analyzeTransaction(transaction: TransactionForAnalysis): ThreatAnalysis {
    const threats: DetectedThreat[] = []
    let riskScore = 0

    // Check 1: Anomalía de monto
    if (transaction.amount > transaction.userAvgAmount * 3) {
      riskScore += 30
      threats.push({
        type: 'amount_anomaly',
        severity: 'high',
        indicator: `Monto ${transaction.amount.toLocaleString()} excede promedio ${transaction.userAvgAmount.toLocaleString()} por 3x`,
        confidence: 0.9,
      })
    }

    // Check 2: Velocidad de transacciones
    if (transaction.userTransactionsLastHour > 10) {
      riskScore += 25
      threats.push({
        type: 'velocity_spike',
        severity: 'medium',
        indicator: `${transaction.userTransactionsLastHour} transacciones en última hora`,
        confidence: 0.85,
      })
    }

    // Check 3: Horario inusual
    const hour = new Date().getHours()
    if (hour < 6 || hour > 22) {
      riskScore += 15
      threats.push({
        type: 'off_hours',
        severity: 'low',
        indicator: `Transacción a las ${hour}:00`,
        confidence: 0.7,
      })
    }

    // Check 4: Cliente nuevo con monto alto
    if (transaction.isNewClient && transaction.amount > 10000) {
      riskScore += 35
      threats.push({
        type: 'new_client_high_value',
        severity: 'high',
        indicator: `Cliente nuevo con transacción de ${transaction.amount.toLocaleString()}`,
        confidence: 0.88,
      })
    }

    // Check 5: Margen negativo
    if (transaction.margin !== undefined && transaction.margin < 0) {
      riskScore += 40
      threats.push({
        type: 'negative_margin',
        severity: 'critical',
        indicator: `Margen negativo: ${transaction.margin.toFixed(2)}%`,
        confidence: 0.95,
      })
    }

    // Check 6: IP diferente
    if (transaction.ipChanged) {
      riskScore += 20
      threats.push({
        type: 'ip_change',
        severity: 'medium',
        indicator: 'Cambio de IP durante sesión',
        confidence: 0.8,
      })
    }

    // Determinar acción recomendada
    let action: 'allow' | 'flag' | 'block' | 'review'
    if (riskScore >= 70) {
      action = 'block'
    } else if (riskScore >= 50) {
      action = 'review'
    } else if (riskScore >= 25) {
      action = 'flag'
    } else {
      action = 'allow'
    }

    // Notificar si hay amenazas
    if (threats.length > 0 && riskScore >= 50) {
      this.callbacks.onThreatDetected?.({
        transactionId: transaction.id,
        threats,
        riskScore,
        action,
      })
    }

    return {
      transactionId: transaction.id,
      riskScore,
      threats,
      recommendedAction: action,
      analysisTime: Date.now(),
    }
  }

  /**
   * Analiza patrón de usuario
   */
  analyzeUserBehavior(userId: string, actions: UserAction[]): BehaviorAnalysis {
    const patterns: BehaviorPattern[] = []
    let anomalyScore = 0

    // Calcular estadísticas normales
    const avgActionsPerDay = actions.length / 30
    const recentActions = actions.filter((a) => Date.now() - a.timestamp.getTime() < 86400000)

    // Check: Volumen de acciones
    if (recentActions.length > avgActionsPerDay * 2) {
      anomalyScore += 30
      patterns.push({
        type: 'activity_spike',
        deviation: recentActions.length / avgActionsPerDay,
        description: 'Actividad inusualmente alta',
      })
    }

    // Check: Accesos a recursos sensibles
    const sensitiveAccess = recentActions.filter(
      (a) =>
        a.resource.includes('finanzas') ||
        a.resource.includes('reportes') ||
        a.resource.includes('configuracion'),
    )
    if (sensitiveAccess.length > 5) {
      anomalyScore += 25
      patterns.push({
        type: 'sensitive_access',
        deviation: sensitiveAccess.length,
        description: `${sensitiveAccess.length} accesos a recursos sensibles`,
      })
    }

    // Check: Patrón de horario
    const offHoursActions = recentActions.filter((a) => {
      const hour = a.timestamp.getHours()
      return hour < 6 || hour > 22
    })
    if (offHoursActions.length > 3) {
      anomalyScore += 20
      patterns.push({
        type: 'off_hours_activity',
        deviation: offHoursActions.length,
        description: `${offHoursActions.length} acciones fuera de horario`,
      })
    }

    return {
      userId,
      anomalyScore,
      patterns,
      riskLevel: anomalyScore > 60 ? 'high' : anomalyScore > 30 ? 'medium' : 'low',
      recommendation:
        anomalyScore > 60
          ? 'Revisar acceso del usuario inmediatamente'
          : anomalyScore > 30
            ? 'Monitorear actividad del usuario'
            : 'Comportamiento normal',
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 📊 REPORTES DE SEGURIDAD
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Genera reporte de seguridad completo
   */
  generateSecurityReport(): SecurityReport {
    const recentSimulations = this.simulationHistory.slice(-10)
    const recentEvolutions = this.defenseEvolutionHistory.slice(-5)

    // Calcular tendencias
    const scoresTrend = recentSimulations.map((s) => s.overallScore)
    const avgScore =
      scoresTrend.length > 0 ? scoresTrend.reduce((a, b) => a + b, 0) / scoresTrend.length : 0
    const scoreTrend =
      scoresTrend.length >= 2
        ? (scoresTrend[scoresTrend.length - 1] ?? 0) - (scoresTrend[0] ?? 0)
        : 0

    // Contar vulnerabilidades por severidad
    const vulnsBySeverity = {
      critical: this.state.vulnerabilities.filter((v) => v.severity === 'critical').length,
      high: this.state.vulnerabilities.filter((v) => v.severity === 'high').length,
      medium: this.state.vulnerabilities.filter((v) => v.severity === 'medium').length,
      low: this.state.vulnerabilities.filter((v) => v.severity === 'low').length,
    }

    // Defensas más efectivas
    const topDefenses = [...this.state.defenses]
      .sort((a, b) => b.blockedAttacks - a.blockedAttacks)
      .slice(0, 3)

    const report: SecurityReport = {
      id: `report_${Date.now()}`,
      generatedAt: new Date(),
      period: {
        start: new Date(Date.now() - 7 * 86400000),
        end: new Date(),
      },
      summary: {
        overallScore: this.state.securityScore,
        threatLevel: this.state.threatLevel,
        scoreTrend,
        totalSimulations: recentSimulations.length,
        totalEvolutions: recentEvolutions.length,
      },
      vulnerabilities: {
        total: this.state.vulnerabilities.length,
        bySeverity: vulnsBySeverity,
        openCount: this.state.vulnerabilities.filter((v) => v.status === 'open').length,
        resolvedCount: this.state.vulnerabilities.filter((v) => v.status === 'resolved').length,
      },
      defenses: {
        totalActive: this.state.defenses.length,
        avgEffectiveness:
          this.state.defenses.reduce((s, d) => s + d.effectiveness, 0) / this.state.defenses.length,
        topPerformers: topDefenses.map((d) => ({
          id: d.id,
          name: d.name,
          blocked: d.blockedAttacks,
        })),
      },
      recommendations: this.state.recommendations,
      riskAssessment: this.generateRiskAssessment(),
    }

    this.callbacks.onSecurityReportGenerated?.(report)

    return report
  }

  private generateRiskAssessment(): RiskAssessment {
    let riskScore = 0
    const riskFactors: string[] = []

    // Factor: Vulnerabilidades abiertas
    const openVulns = this.state.vulnerabilities.filter((v) => v.status === 'open')
    const criticalVulns = openVulns.filter((v) => v.severity === 'critical')
    if (criticalVulns.length > 0) {
      riskScore += 40
      riskFactors.push(`${criticalVulns.length} vulnerabilidad(es) crítica(s) abierta(s)`)
    }
    if (openVulns.length > 5) {
      riskScore += 20
      riskFactors.push(`${openVulns.length} vulnerabilidades totales abiertas`)
    }

    // Factor: Defensas débiles
    const weakDefenses = this.state.defenses.filter((d) => d.effectiveness < 0.7)
    if (weakDefenses.length > 2) {
      riskScore += 15
      riskFactors.push(`${weakDefenses.length} defensas con efectividad < 70%`)
    }

    // Factor: Simulaciones recientes fallidas
    const recentSims = this.simulationHistory.slice(-3)
    const avgScore = recentSims.reduce((s, sim) => s + sim.overallScore, 0) / recentSims.length
    if (avgScore < 70) {
      riskScore += 25
      riskFactors.push(`Score promedio de simulaciones: ${avgScore.toFixed(0)}%`)
    }

    return {
      score: Math.min(100, riskScore),
      level:
        riskScore > 60 ? 'critical' : riskScore > 40 ? 'high' : riskScore > 20 ? 'medium' : 'low',
      factors: riskFactors,
      mitigations: this.generateMitigations(riskFactors),
    }
  }

  private generateMitigations(riskFactors: string[]): string[] {
    const mitigations: string[] = []

    for (const factor of riskFactors) {
      if (factor.includes('crítica')) {
        mitigations.push('🚨 Priorizar resolución de vulnerabilidades críticas en 24h')
      }
      if (factor.includes('defensas')) {
        mitigations.push('🛡️ Ejecutar evolución de defensas para mejorar efectividad')
      }
      if (factor.includes('simulaciones')) {
        mitigations.push('🔍 Realizar auditoría completa de configuración de seguridad')
      }
    }

    if (mitigations.length === 0) {
      mitigations.push('✅ Mantener monitoreo regular')
    }

    return mitigations
  }

  private generateRecommendations(simulation: RedTeamSimulation): string[] {
    const recommendations: string[] = []

    // Basadas en vulnerabilidades encontradas
    for (const vuln of simulation.vulnerabilitiesFound) {
      recommendations.push(
        `⚠️ Remediar vulnerabilidad "${vuln.description}" (Severidad: ${vuln.severity})`,
      )
    }

    // Basadas en score
    if (simulation.overallScore < 60) {
      recommendations.push('🔴 Score crítico - Revisar configuración de seguridad completa')
    } else if (simulation.overallScore < 80) {
      recommendations.push('🟡 Score mejorable - Fortalecer defensas identificadas')
    } else {
      recommendations.push('🟢 Buen nivel de seguridad - Mantener monitoreo')
    }

    return recommendations
  }

  private updateSecurityState(simulation: RedTeamSimulation): void {
    // Actualizar vulnerabilidades
    for (const vuln of simulation.vulnerabilitiesFound) {
      const existing = this.state.vulnerabilities.find((v) => v.attackType === vuln.attackType)
      if (!existing) {
        this.state.vulnerabilities.push(vuln)
      }
    }

    // Actualizar threat level
    const criticalVulns = this.state.vulnerabilities.filter(
      (v) => v.severity === 'critical' && v.status === 'open',
    ).length

    if (criticalVulns > 2) {
      this.state.threatLevel = 'critical'
    } else if (criticalVulns > 0 || simulation.overallScore < 60) {
      this.state.threatLevel = 'high'
    } else if (simulation.overallScore < 80) {
      this.state.threatLevel = 'medium'
    } else {
      this.state.threatLevel = 'low'
    }

    // Actualizar score
    this.state.securityScore = Math.round(simulation.overallScore)
    this.state.lastAudit = new Date()
    this.state.recommendations = simulation.recommendations
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔧 MÉTODOS PÚBLICOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Actualiza contexto de negocio
   */
  updateBusinessContext(context: BusinessContext): void {
    this.businessContext = context
  }

  /**
   * Obtiene estado actual
   */
  getState(): SecurityState {
    return { ...this.state }
  }

  /**
   * Marca vulnerabilidad como resuelta
   */
  resolveVulnerability(vulnId: string): boolean {
    const vuln = this.state.vulnerabilities.find((v) => v.id === vulnId)
    if (vuln) {
      vuln.status = 'resolved'
      vuln.resolvedAt = new Date()
      return true
    }
    return false
  }

  /**
   * Genera insight de seguridad
   */
  generateInsight(): ChronosInsight {
    const insight: ChronosInsight = {
      id: `insight_security_${Date.now()}`,
      type:
        this.state.threatLevel === 'critical'
          ? 'danger'
          : this.state.threatLevel === 'high'
            ? 'warning'
            : 'info',
      priority:
        this.state.threatLevel === 'critical'
          ? 'critical'
          : this.state.threatLevel === 'high'
            ? 'high'
            : 'medium',
      title: '🛡️ Estado de Seguridad',
      description:
        `Nivel de amenaza: ${this.state.threatLevel.toUpperCase()}. ` +
        `Score: ${this.state.securityScore}%. ` +
        `${this.state.vulnerabilities.filter((v) => v.status === 'open').length} vulnerabilidades abiertas.`,
      metric: 'security_score',
      value: this.state.securityScore,
      trend: 'stable',
      confidence: 95,
      emotionalTone:
        this.state.threatLevel === 'critical'
          ? 'alert'
          : this.state.threatLevel === 'high'
            ? 'concerned'
            : 'neutral',
    }

    return insight
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 TIPOS ADICIONALES Y EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export interface TransactionForAnalysis {
  id: string
  amount: number
  userAvgAmount: number
  userTransactionsLastHour: number
  isNewClient: boolean
  margin?: number
  ipChanged: boolean
  timestamp: Date
}

export interface DetectedThreat {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  indicator: string
  confidence: number
}

export interface ThreatAnalysis {
  transactionId: string
  riskScore: number
  threats: DetectedThreat[]
  recommendedAction: 'allow' | 'flag' | 'block' | 'review'
  analysisTime: number
}

export interface UserAction {
  userId: string
  action: string
  resource: string
  timestamp: Date
}

export interface BehaviorPattern {
  type: string
  deviation: number
  description: string
}

export interface BehaviorAnalysis {
  userId: string
  anomalyScore: number
  patterns: BehaviorPattern[]
  riskLevel: 'low' | 'medium' | 'high'
  recommendation: string
}

export interface SecurityReport {
  id: string
  generatedAt: Date
  period: { start: Date; end: Date }
  summary: {
    overallScore: number
    threatLevel: ThreatLevel
    scoreTrend: number
    totalSimulations: number
    totalEvolutions: number
  }
  vulnerabilities: {
    total: number
    bySeverity: Record<string, number>
    openCount: number
    resolvedCount: number
  }
  defenses: {
    totalActive: number
    avgEffectiveness: number
    topPerformers: Array<{ id: string; name: string; blocked: number }>
  }
  recommendations: string[]
  riskAssessment: RiskAssessment
}

export interface RiskAssessment {
  score: number
  level: 'low' | 'medium' | 'high' | 'critical'
  factors: string[]
  mitigations: string[]
}

export interface ThreatNotification {
  transactionId: string
  threats: DetectedThreat[]
  riskScore: number
  action: string
}

export interface RedTeamCallbacks {
  onAttackSimulated?: (result: AttackResult) => void
  onVulnerabilityFound?: (vuln: VulnerabilityReport) => void
  onDefenseEvolved?: (evolution: DefenseEvolution) => void
  onThreatDetected?: (notification: ThreatNotification) => void
  onSecurityReportGenerated?: (report: SecurityReport) => void
}

// Singleton
let redTeamInstance: RedTeamEngine | null = null

export function getRedTeamEngine(callbacks?: Partial<RedTeamCallbacks>): RedTeamEngine {
  if (!redTeamInstance) {
    redTeamInstance = new RedTeamEngine(callbacks)
  }
  return redTeamInstance
}

export function resetRedTeamEngine(): void {
  redTeamInstance = null
}
