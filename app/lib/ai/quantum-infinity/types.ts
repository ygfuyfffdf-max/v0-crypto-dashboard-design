/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌🧬 CHRONOS QUANTUM INFINITY 2026 — REVOLUCIONARY AI TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de tipos para la IA más avanzada del universo financiero:
 * - Agentic AI Autónoma (Modo Guardián 24/7)
 * - GenAI Optimización Dinámica (Evolución Genética de Estrategias)
 * - Digital Employees (CFO Bot, Auditor Bot, Analyst Bot)
 * - AI-Enabled Inventory Management (Stock Cuántico Predictivo)
 * - Automated Red Teaming (Defensa Cuántica)
 * - AI Workforce Culture (Cultura Viva de Eficiencia)
 * - Deepfake Detection (Verificador Cuántico Bio-Auth)
 *
 * @version QUANTUM-INFINITY-2026
 * @author CHRONOS INFINITY TEAM
 * @classification OMEGA-LEVEL
 */

import type {
  BusinessContext,
  ChronosInsight,
  ChronosToolCall,
  NexBotEmotion,
} from '../nexus/types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🤖 AGENTIC AI AUTÓNOMA — GUARDIAN MODE 24/7
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Modos de operación del agente autónomo */
export type AgenticAIMode =
  | 'guardian' // Modo Guardián: Monitoreo 24/7 pasivo
  | 'executor' // Modo Ejecutor: Acciones automáticas
  | 'advisor' // Modo Consejero: Solo sugerencias
  | 'hibernation' // Modo Hibernación: Ahorro de recursos
  | 'emergency' // Modo Emergencia: Acciones críticas inmediatas
  | 'learning' // Modo Aprendizaje: Observa sin actuar
  | 'simulation' // Modo Simulación: Prueba acciones sin ejecutar

/** Regla de automatización agentic */
export interface AgenticRule {
  id: string
  name: string
  description: string
  priority: 'critical' | 'high' | 'medium' | 'low'

  // Condiciones de activación
  trigger: {
    type: 'threshold' | 'pattern' | 'schedule' | 'event' | 'compound'
    metric?: string
    operator?: '>' | '<' | '==' | '>=' | '<=' | 'contains' | 'matches'
    value?: number | string | boolean
    schedule?: string // Cron expression
    pattern?: string // Regex pattern
    compound?: AgenticRule[] // AND/OR rules
    compoundOperator?: 'AND' | 'OR'
  }

  // Condiciones adicionales
  conditions: AgenticCondition[]

  // Acción automática
  action: AgenticAction

  // Configuración
  enabled: boolean
  requiresConfirmation: boolean
  maxExecutionsPerDay: number
  cooldownMinutes: number
  lastExecution?: Date
  executionCount: number

  // Auditoría
  createdAt: Date
  createdBy: string
  modifiedAt: Date
  successRate: number // 0-100
}

/** Condición compuesta para reglas */
export interface AgenticCondition {
  field: string
  operator: '>' | '<' | '==' | '>=' | '<=' | 'in' | 'not_in' | 'contains' | 'regex'
  value: unknown
  entityType?: 'venta' | 'cliente' | 'distribuidor' | 'banco' | 'almacen' | 'oc'
}

/** Acción ejecutable por el agente */
export interface AgenticAction {
  type: 'transfer' | 'payment' | 'alert' | 'adjustment' | 'notification' | 'workflow' | 'custom'
  target: string
  parameters: Record<string, unknown>
  rollbackAction?: AgenticAction
  estimatedImpact: {
    financial: number
    risk: 'low' | 'medium' | 'high' | 'critical'
    affectedEntities: string[]
  }
}

/** Estado del sistema agentic */
export interface AgenticAIState {
  mode: AgenticAIMode
  isActive: boolean
  lastHeartbeat: Date
  activeRules: AgenticRule[]
  pendingActions: AgenticActionQueue[]
  executedToday: number
  anomaliesDetected: number
  healthScore: number // 0-100

  // Métricas de rendimiento
  performance: {
    avgResponseTime: number // ms
    actionsExecuted24h: number
    successRate: number
    falsePositiveRate: number
    savingsGenerated: number // $
    hoursAutomated: number
  }

  // Guardian metrics
  guardian: {
    metricsMonitored: number
    alertsRaised: number
    preventedIssues: number
    lastPatrol: Date
    coveragePercentage: number
  }
}

/** Cola de acciones pendientes */
export interface AgenticActionQueue {
  id: string
  rule: AgenticRule
  action: AgenticAction
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled' | 'rolled_back'
  priority: number
  scheduledFor: Date
  attempts: number
  maxAttempts: number
  result?: unknown
  error?: string
  executionLog: AgenticExecutionLog[]
}

/** Log de ejecución */
export interface AgenticExecutionLog {
  timestamp: Date
  event: string
  details: Record<string, unknown>
  success: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🧬 GENAI OPTIMIZACIÓN DINÁMICA — EVOLUCIÓN GENÉTICA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Cromosoma de estrategia financiera (para algoritmos genéticos) */
export interface StrategyChromosome {
  id: string
  generation: number
  genes: StrategyGene[]
  fitness: number // 0-1
  parentIds: string[]
  mutations: number
  birthDate: Date
  survivalDays: number
}

/** Gen de estrategia */
export interface StrategyGene {
  name: string
  type: 'pricing' | 'credit' | 'inventory' | 'distribution' | 'payment' | 'marketing'
  value: number | string | boolean
  range?: { min: number; max: number }
  mutable: boolean
  weight: number // Importancia en fitness
}

/** Configuración de evolución genética */
export interface GeneticEvolutionConfig {
  populationSize: number
  generationLimit: number
  mutationRate: number // 0-1
  crossoverRate: number // 0-1
  elitismRate: number // Top % preserved
  fitnessFunction: 'profit_maximization' | 'risk_minimization' | 'balanced' | 'growth' | 'custom'
  constraints: GeneticConstraint[]
  targetMetrics: string[]
}

/** Restricción para evolución */
export interface GeneticConstraint {
  metric: string
  operator: '>' | '<' | '>=' | '<=' | '==' | 'between'
  value: number | [number, number]
  penalty: number // Factor de penalización si se viola
}

/** Escenario simulado (universo paralelo) */
export interface SimulatedScenario {
  id: string
  name: string
  strategy: StrategyChromosome
  assumptions: Record<string, unknown>
  duration: 'day' | 'week' | 'month' | 'quarter' | 'year'

  // Resultados proyectados
  projectedResults: {
    revenue: number
    profit: number
    margin: number
    cashFlow: number
    riskScore: number
    growthRate: number
  }

  // Análisis
  confidenceLevel: number // 0-100
  sensitivityAnalysis: SensitivityPoint[]
  breakEvenPoint?: Date
  recommendationScore: number
}

/** Punto de análisis de sensibilidad */
export interface SensitivityPoint {
  variable: string
  change: number // % change
  impactOnProfit: number // % impact
  impactOnRisk: number
}

/** Optimización dinámica de métricas */
export interface DynamicMetricOptimization {
  metric: string
  currentValue: number
  targetValue: number
  optimizationPath: OptimizationStep[]
  estimatedTimeToTarget: number // days
  confidence: number
  constraints: string[]
  suggestedActions: ChronosToolCall[]
}

/** Paso de optimización */
export interface OptimizationStep {
  action: string
  expectedImpact: number
  risk: 'low' | 'medium' | 'high'
  dependencies: string[]
  timeframe: string
  autoExecutable: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 👔 DIGITAL EMPLOYEES — EQUIPO CUÁNTICO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Tipo de empleado digital */
export type DigitalEmployeeRole =
  | 'cfo_bot' // Chief Financial Officer Bot
  | 'auditor_bot' // Auditor de anomalías
  | 'analyst_bot' // Analista de datos
  | 'collector_bot' // Cobranza automatizada
  | 'inventory_bot' // Gestión de inventario
  | 'sales_bot' // Asistente de ventas
  | 'risk_bot' // Evaluador de riesgo
  | 'compliance_bot' // Cumplimiento normativo
  | 'forecaster_bot' // Predicción y pronósticos
  | 'optimizer_bot' // Optimizador de operaciones

/** Personalidad del bot (adapta a mood del usuario) */
export type BotPersonality =
  | 'professional' // Formal y directo
  | 'friendly' // Amigable y cercano
  | 'empathetic' // Comprensivo en situaciones difíciles
  | 'motivational' // Celebra logros, motiva
  | 'urgent' // En situaciones críticas
  | 'calming' // Reduce estrés del usuario
  | 'analytical' // Enfocado en datos

/** Empleado digital */
export interface DigitalEmployee {
  id: string
  role: DigitalEmployeeRole
  name: string
  avatar: string // URL o emoji
  personality: BotPersonality

  // Capacidades
  capabilities: EmployeeCapability[]
  permissions: EmployeePermission[]

  // Estado
  status: 'active' | 'busy' | 'offline' | 'maintenance'
  currentTask?: string
  workload: number // 0-100

  // Rendimiento
  performance: {
    tasksCompleted: number
    accuracy: number
    avgResponseTime: number
    userSatisfaction: number // 0-5
    errorsLast30Days: number
    improvements: string[]
  }

  // Especialización
  expertise: {
    domains: string[]
    certifications: string[]
    trainingLevel: 'junior' | 'mid' | 'senior' | 'expert' | 'master'
    lastTraining: Date
  }

  // Comunicación
  communication: {
    preferredChannels: ('chat' | 'voice' | 'notification' | 'report')[]
    responseStyle: 'concise' | 'detailed' | 'adaptive'
    language: string
    emotionalIntelligence: number // 0-100
  }
}

/** Capacidad de empleado */
export interface EmployeeCapability {
  name: string
  type: 'analysis' | 'execution' | 'monitoring' | 'communication' | 'prediction'
  proficiency: number // 0-100
  lastUsed: Date
}

/** Permiso de empleado */
export interface EmployeePermission {
  action: string
  resource: string
  level: 'read' | 'write' | 'execute' | 'admin'
  conditions?: Record<string, unknown>
}

/** Interacción entre empleados digitales */
export interface EmployeeCollaboration {
  id: string
  participants: DigitalEmployee[]
  task: string
  status: 'planning' | 'executing' | 'reviewing' | 'completed'
  messages: CollaborationMessage[]
  outcome?: CollaborationOutcome
}

/** Mensaje de colaboración */
export interface CollaborationMessage {
  from: string // Employee ID
  to: string | 'all'
  content: string
  timestamp: Date
  type: 'info' | 'request' | 'response' | 'alert' | 'suggestion'
  attachments?: unknown[]
}

/** Resultado de colaboración */
export interface CollaborationOutcome {
  success: boolean
  summary: string
  actionsExecuted: ChronosToolCall[]
  insightsGenerated: ChronosInsight[]
  recommendationsForUser: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 AI-ENABLED INVENTORY MANAGEMENT — STOCK CUÁNTICO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Predicción de inventario */
export interface InventoryPrediction {
  productId: string
  productName: string

  // Estado actual
  currentStock: number
  optimalStock: number
  stockHealth: 'excess' | 'optimal' | 'low' | 'critical' | 'out'

  // Datos adicionales para predicciones
  generatedAt: Date
  horizon: number // días de predicción
  totalPredictedDemand: number
  avgDailyDemand: number
  confidence: number
  dailyPredictions: DailyPrediction[]

  // Predicciones legacy (para compatibilidad)
  predictions: {
    demandNext7Days: number
    demandNext30Days: number
    stockOutDate?: Date
    reorderPoint: number
    reorderQuantity: number
    confidence: number
  }

  // Análisis
  analysis: {
    velocityPerDay: number
    seasonality: 'none' | 'low' | 'moderate' | 'high'
    trendDirection: 'up' | 'down' | 'stable'
    volatility: number // 0-100
  }

  // Recomendaciones
  recommendation: {
    action: 'order_now' | 'order_soon' | 'hold' | 'reduce' | 'clearance'
    urgency: 'immediate' | 'this_week' | 'this_month' | 'optional'
    suggestedDistributor?: string
    suggestedQuantity: number
    estimatedCost: number
    projectedMargin: number
    roi: number
  }
}

/** Predicción diaria */
export interface DailyPrediction {
  date: Date
  expectedDemand: number
  confidence: number
  factors: string[]
}

/** Simulación de lote óptimo (universos paralelos) */
export interface LotSimulation {
  id: string
  scenario: string
  scenarioId: string

  // Parámetros de entrada
  input: {
    distributor: string
    products: { productId: string; quantity: number; unitCost: number }[]
    shippingCost: number
    paymentTerms: string
  }

  // Proyección
  projection: {
    totalCost: number
    projectedRevenue: number
    projectedProfit: number
    breakEvenDays: number
    margin: number
    roi: number
    paybackPeriod: number
  }

  // Riesgos
  risks: {
    demandVolatility: number
    priceCompetition: number
    seasonalityRisk: number
    cashFlowImpact: number
    overallRisk: 'low' | 'medium' | 'high'
  }

  // Score compuesto
  score: number // 0-100
  rank: number
  recommendation: string

  // Métricas adicionales
  avgStockout: number
  totalStockout: number
  overstock: number
  avgOverstock: number
}

/** Auto-generación de orden de compra */
export interface AutoPurchaseOrder {
  id: string
  status: 'suggested' | 'approved' | 'submitted' | 'confirmed' | 'rejected' | 'pending_approval'

  distributor: {
    id: string
    name: string
    score: number
    reliability: number
  }

  items: {
    productId: string
    productName: string
    quantity: number
    unitCost: number
    totalCost: number
    reason: string
  }[]

  totals: {
    subtotal: number
    shipping: number
    taxes: number
    total: number
  }

  // Campos adicionales para priorización
  totalCost: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
  score: number
  confidence: number
  supplierId: string

  analysis: {
    inventoryHealthImprovement: number
    cashFlowImpact: number
    projectedROI: number
    alternativeDistributors: { id: string; name: string; savings: number }[]
  }

  approvalRequired: boolean
  autoApproveThreshold: number // $ amount
  expiresAt: Date
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🛡️ AUTOMATED RED TEAMING — DEFENSA CUÁNTICA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Tipo de ataque simulado */
export type RedTeamAttackType =
  | 'fake_transaction' // Transacción fraudulenta
  | 'duplicate_entry' // Entrada duplicada
  | 'negative_utility' // Utilidad negativa artificial
  | 'unauthorized_transfer' // Transferencia no autorizada
  | 'data_manipulation' // Manipulación de datos
  | 'privilege_escalation' // Escalación de privilegios
  | 'session_hijack' // Secuestro de sesión
  | 'injection_attack' // Inyección SQL/XSS
  | 'timing_attack' // Ataque de timing
  | 'logic_bomb' // Bomba lógica

/** Simulación de ataque */
export interface RedTeamSimulation {
  id: string
  type: RedTeamAttackType
  name: string
  description: string

  // Configuración
  config: {
    severity: 'low' | 'medium' | 'high' | 'critical'
    targetArea: string
    params: Record<string, unknown>
    sandboxed: boolean
  }

  // Ejecución
  execution: {
    startedAt: Date
    completedAt?: Date
    status: 'pending' | 'running' | 'completed' | 'aborted'
    detectedAt?: Date
    detectionTime?: number // ms
  }

  // Resultados
  results: {
    detected: boolean
    detectionMethod?: string
    falsePositives: number
    impactIfUndetected: string
    recommendations: string[]
  }

  // Defensa evolucionada
  defensesCreated: RedTeamDefense[]
}

/** Defensa generada por red teaming */
export interface RedTeamDefense {
  id: string
  name: string
  type: 'validation' | 'monitoring' | 'encryption' | 'access_control' | 'anomaly_detection'
  targetAttackTypes: RedTeamAttackType[]

  implementation: {
    status: 'proposed' | 'testing' | 'active' | 'deprecated'
    code?: string
    config: Record<string, unknown>
    activatedAt?: Date
  }

  effectiveness: {
    blockedAttacks: number
    falsePositiveRate: number
    performanceImpact: number // ms latency added
    lastTested: Date
    score: number // 0-100
  }
}

/** Estado del sistema de seguridad */
export interface SecurityState {
  overallScore: number // 0-100
  lastFullAudit: Date
  nextScheduledAudit: Date

  vulnerabilities: {
    critical: number
    high: number
    medium: number
    low: number
  }

  defenses: {
    active: number
    testing: number
    proposed: number
  }

  recentActivity: {
    attacksBlocked24h: number
    anomaliesDetected24h: number
    falsePosivites24h: number
  }

  compliance: {
    pciDss: boolean
    gdpr: boolean
    soc2: boolean
    iso27001: boolean
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📚 AI WORKFORCE CULTURE — CULTURA CUÁNTICA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Perfil de usuario para adaptación */
export interface UserCultureProfile {
  userId: string
  displayName?: string
  level?: number
  xp?: number
  xpToNextLevel?: number

  // Skill levels por área
  skillLevels?: {
    ventas: number
    cobranza: number
    inventario: number
    finanzas?: number
    sistema: number
    ia?: number
    [key: string]: number | undefined
  }

  // Achievements y tutoriales completados
  achievements?: string[]
  completedTutorials?: string[]

  // Estadísticas de uso
  stats?: {
    totalTasks: number
    tasksToday: number
    streakDays: number
    lastActiveDate: Date
    totalTimeSpent: number
    featuresUsed: string[]
  }

  // Preferencias de trabajo
  preferences: {
    communicationStyle?: 'formal' | 'casual' | 'brief' | 'detailed'
    learningStyle?: 'visual' | 'auditory' | 'hands-on' | 'reading'
    workPace?: 'fast' | 'moderate' | 'careful'
    decisionStyle?: 'data_driven' | 'intuitive' | 'collaborative'
    tutorialSpeed?: 'slow' | 'normal' | 'fast'
    notificationLevel?: 'low' | 'medium' | 'high'
    theme?: 'light' | 'dark' | 'system'
    language?: string
  }

  // Habilidades (legacy structure)
  skills?: {
    technicalLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
    financialLiteracy: number // 0-100
    dataAnalysis: number
    systemProficiency: number
    automationComfort: number
  }

  // Comportamiento
  behavior?: {
    avgSessionDuration: number // minutes
    preferredWorkHours: { start: string; end: string }
    commonTasks: string[]
    painPoints: string[]
    frequentErrors: string[]
  }

  // Adaptación
  adaptation?: {
    tutorialsCompleted: string[]
    featuresUnlocked: string[]
    automationLevel: number // % of tasks automated
    aiAssistanceUsage: number // 0-100
    satisfactionScore: number
  }

  createdAt?: Date
  updatedAt?: Date
}

/** Tutorial adaptativo */
export interface AdaptiveTutorial {
  id: string
  templateId?: string
  userId?: string
  name?: string
  title?: string
  description?: string
  steps?: TutorialStep[]
  currentStepIndex?: number
  status?: 'pending' | 'in_progress' | 'completed' | 'skipped'
  startedAt?: Date
  completedAt?: Date
  adaptations?: string[]

  // Contenido (legacy structure)
  content?: {
    type: 'video' | 'interactive' | 'text' | 'voice' | 'gesture'
    steps: TutorialStep[]
    duration: number // minutes
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  }

  // Adaptación
  adaptation?: {
    paceAdjustment: boolean
    moodAware: boolean
    skillLevelAdjustment: boolean
    personalizedExamples: boolean
  }

  // Métricas
  metrics?: {
    completionRate: number
    avgTimeToComplete: number
    satisfactionScore: number
    retentionRate: number
  }
}

/** Nivel de habilidad para gamificación */
export type SkillLevel =
  | 'novice'
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert'
  | {
      level: number
      xp: number
      xpToNextLevel: number
      skillName: string
      milestones: string[]
    }

/** Definición de logro */
export interface AchievementDefinition {
  id: string
  name: string
  description: string
  icon: string
  category:
    | 'productivity'
    | 'collaboration'
    | 'learning'
    | 'efficiency'
    | 'mastery'
    | 'ventas'
    | 'cobranza'
    | 'inventario'
    | 'sistema'
    | 'especial'
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  xpReward?: number
  condition:
    | string
    | {
        type?: string
        metric: string
        operator?: '>' | '<' | '==' | '>=' | '<='
        target: number | string
      }
  reward?: {
    xp: number
    badge?: string
    title?: string
  }
  hidden?: boolean
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
}

/** Milestone de aprendizaje */
export interface Milestone {
  level: string | SkillLevel
  skillRequired: number
  reward: string
  achieved: boolean
}

/** Recomendación de aprendizaje */
export interface LearningRecommendation {
  type: 'tutorial' | 'achievement' | 'practice' | 'challenge'
  id: string
  title: string
  reason: string
  priority: number
  estimatedTime: number
  xpReward?: number
}

/** Ruta de aprendizaje personalizada */
export interface LearningPath {
  id?: string
  userId?: string
  name?: string
  description?: string
  generatedAt?: Date
  focusArea?: string
  currentLevel?: string | SkillLevel
  targetLevel?: string | SkillLevel
  recommendations?: LearningRecommendation[]
  estimatedTimeToTarget?: number
  milestones?: Milestone[]
  modules?: {
    id: string
    title: string
    duration: number
    completed: boolean
    skills: string[]
  }[]
  estimatedDuration?: number
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  prerequisites?: string[]
  targetSkills?: string[]
  progress?: number
}

/** Paso de tutorial */
export interface TutorialStep {
  id: string
  title: string
  content: string
  type?: 'highlight' | 'interactive' | 'info' | 'action'
  action?: string
  mediaUrl?: string
  targetElement?: string
  interactiveElement?: {
    type: 'click' | 'input' | 'drag' | 'voice' | 'gesture'
    target: string
    validation: string
  }
  hints?: string[]
  skipCondition?: string
  autoAdvance?: boolean
  autoAdvanceDelay?: number
}

/** Métricas de productividad */
export interface ProductivityMetrics {
  userId: string
  period?: 'day' | 'week' | 'month'
  date?: Date
  tasksCompleted?: number
  tasksTarget?: number
  accuracyRate?: number
  streakDays?: number
  timeSpentToday?: number
  peakProductivityHour?: number
  trend?: 'improving' | 'stable' | 'declining'
  insights?: string[]

  efficiency?:
    | number
    | {
        tasksCompleted: number
        avgTimePerTask: number
        automationSavings: number // hours
        errorRate: number
      }

  growth?: {
    skillsImproved: string[]
    featuresLearned: string[]
    productivityGain: number // %
    aiCollaborationScore: number
  }

  wellbeing?: {
    stressIndicators: number
    workLifeBalance: number
    satisfactionTrend: 'improving' | 'stable' | 'declining'
    recommendedBreaks: number
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 DEEPFAKE DETECTION — VERIFICADOR CUÁNTICO (LEGACY - Usar tipos de sección BIOMETRIC VERIFICATION TYPES)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Resultado de verificación (para VerificationResult legacy) */
export interface VerificationResult {
  id: string
  type: BiometricVerificationType
  timestamp: Date

  // Análisis
  analysis: {
    authentic: boolean
    confidence: number // 0-100
    riskScore: number // 0-100
    anomalies: string[]
  }

  // Deepfake detection específico
  deepfakeAnalysis?: {
    isDeepfake: boolean
    probability: number
    detectionMethod: 'spectral' | 'temporal' | 'artifact' | 'behavioral' | 'ensemble'
    artifacts: string[]
    recommendation: string
  }

  // Acciones
  actions: {
    allowed: boolean
    additionalVerificationRequired: boolean
    alertRaised: boolean
    sessionLocked: boolean
  }
}

/** Configuración de seguridad biométrica */
export interface BiometricSecurityConfig {
  enabled: boolean
  requiredForTransactions: boolean
  minConfidenceLevel: number // 0-100

  methods: {
    voicePrint: {
      enabled: boolean
      minSampleDuration: number // seconds
      antiSpoofing: boolean
    }
    faceRecognition: {
      enabled: boolean
      livenessCheck: boolean
      depthAnalysis: boolean
    }
    behaviorPattern: {
      enabled: boolean
      learningPeriod: number // days
      adaptiveThreshold: boolean
    }
  }

  thresholds: {
    transactionLock: number // confidence below this locks
    alertThreshold: number
    autoBlock: number
  }

  fallback: {
    method: 'otp' | 'security_question' | 'admin_approval' | 'manual_verification'
    maxAttempts: number
    lockoutDuration: number // minutes
  }
}

/** Estado de autenticación continua */
export interface ContinuousAuthState {
  userId: string
  sessionId: string

  // Estado actual
  currentConfidence: number
  lastVerification: Date
  verificationType: BiometricVerificationType

  // Histórico de sesión
  sessionHistory: {
    verifications: VerificationResult[]
    anomalies: string[]
    riskEvents: { timestamp: Date; type: string; severity: string }[]
  }

  // Comportamiento
  behaviorBaseline: {
    typingSpeed: number
    mouseMovementPattern: string // encoded
    interactionFrequency: number
    commonActions: string[]
  }

  // Estado de seguridad
  security: {
    threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical'
    activeProtections: string[]
    nextVerificationDue: Date
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 QUANTUM INFINITY ENGINE — SISTEMA UNIFICADO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Estado completo del sistema Quantum Infinity */
export interface QuantumInfinityState {
  version: string
  startedAt: Date

  // Subsistemas
  agentic: AgenticAIState
  genai: {
    activeStrategies: StrategyChromosome[]
    simulationsRunning: number
    optimizationsActive: DynamicMetricOptimization[]
    lastEvolution: Date
  }
  employees: {
    active: DigitalEmployee[]
    collaborations: EmployeeCollaboration[]
    taskQueue: number
  }
  inventory: {
    predictionsActive: number
    autoOrdersPending: AutoPurchaseOrder[]
    stockHealth: number // 0-100
  }
  security: SecurityState
  culture: {
    activeUsers: number
    avgProductivity: number
    aiAdoptionRate: number
    tutorialsActive: number
  }
  verification: {
    activeVerifications: number
    threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical'
    deepfakeAttempts24h: number
  }

  // Métricas globales
  globalMetrics: {
    automationRate: number // % of operations automated
    efficiencySavings: number // $ per month
    errorReduction: number // %
    userSatisfaction: number // 0-5
    systemHealth: number // 0-100
  }

  // Emotional state for UI
  emotionalContext: {
    systemMood: NexBotEmotion
    businessHealth: 'thriving' | 'healthy' | 'stable' | 'concerning' | 'critical'
    celebrationsPending: string[]
    warningsActive: string[]
  }
}

/** Configuración maestra */
export interface QuantumInfinityConfig {
  // Módulos habilitados
  modules: {
    agenticAI: boolean
    genaiOptimization: boolean
    digitalEmployees: boolean
    inventoryAI: boolean
    redTeaming: boolean
    workforceCulture: boolean
    deepfakeDetection: boolean
  }

  // Niveles de autonomía
  autonomy: {
    financialLimit: number // $ max for auto-actions
    requireApprovalAbove: number // $ threshold
    autoExecuteRules: boolean
    learningMode: boolean
  }

  // Rendimiento
  performance: {
    maxConcurrentTasks: number
    priorityWeights: Record<string, number>
    sustainableMode: boolean
    lowPowerThreshold: number
  }

  // Privacidad
  privacy: {
    dataRetention: 'session' | '24h' | '7d' | '30d' | 'forever'
    biometricStorage: 'local' | 'encrypted_cloud' | 'none'
    anonymizeAnalytics: boolean
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 TIPOS ADICIONALES PARA INVENTORY AI
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Estado del inventario cuántico */
export interface QuantumInventoryState {
  products: Map<string, ProductInventoryState>
  predictions: InventoryPrediction[]
  alerts: InventoryAlert[]
  stockLevels: Map<string, StockLevel>
  deadStockRisk: DeadStockRisk[]
  optimizationScore: number
  lastOptimization: Date | null
  lastSync: Date
  pendingOrders: AutoPurchaseOrder[]
  recommendations: InventoryRecommendation[]
}

export interface InventoryRecommendation {
  id: string
  type: 'reorder' | 'reduce' | 'redistribute' | 'discontinue'
  productId: string
  action: string
  impact: number
  priority: 'low' | 'medium' | 'high'
}

export interface DeadStockRisk {
  productId: string
  daysSinceLastSale: number
  riskScore: number
  suggestedAction: string
}

export interface ProductInventoryState {
  productId: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  leadTime: number
  lastSale: Date | null
  averageDailySales: number
}

export interface InventoryAlert {
  id: string
  productId: string
  type: 'low_stock' | 'overstock' | 'dead_stock' | 'reorder_needed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  createdAt: Date
}

/** Patrón estacional */
export interface SeasonalPattern {
  name: string
  months: number[]
  multiplier: number
  month: number
  dayOfWeek: number
  factor: number
  confidence: number
}

/** Nivel de stock */
export interface StockLevel {
  productId: string
  current: number
  optimal: number
  minimum: number
  maximum: number
  daysUntilStockout: number
  reorderSuggested: boolean
}
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🔐 BIOMETRIC VERIFICATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

/** Voice features for analysis */
export interface VoiceFeatures {
  fundamentalFrequency: number
  harmonicRatios: number[]
  formantFrequencies: number[]
  spectralEnvelope: number[]
  jitter: number
  shimmer: number
  hnr: number
  mfcc: number[]
}

/** Typing pattern - Usado por biometric-verification */
export interface TypingPattern {
  avgDwellTime: number
  avgFlightTime: number
  dwellTimeVariance: number
  flightTimeVariance: number
  digramTimings: Map<string, number>
  errorRate: number
  typingSpeed: number
  rhythmConsistency: number
}

/** Mouse dynamics */
export interface MouseDynamics {
  avgSpeed: number
  avgAcceleration: number
  clickPatterns: number[]
  movementStyle: 'linear' | 'curved' | 'erratic'
  pauseFrequency: number
}

/** Navigation pattern */
export interface NavigationPattern {
  path: string[]
  frequency: number
  avgDuration: number
}

/** Perfil de comportamiento del usuario */
export interface BehavioralProfile {
  userId: string
  enrolledAt: Date
  patterns: {
    typing: TypingDynamics
    mouse: MouseDynamics
    navigation: NavigationPattern[]
  }
  baseline: {
    avgSessionDuration: number
    typicalActiveHours: number[]
    commonActions: string[]
    deviceFingerprints: string[]
  }
  // Propiedades de nivel superior para acceso directo
  typicalActiveHours: number[]
  typicalActionsPerMinute: number
  commonPatterns: string[]
  deviceFingerprints: string[]
  typicalSessionDuration: number
  // Métricas
  adaptationRate: number
  confidenceScore: number
  lastUpdated: Date
  sampleCount: number
}

/** Dinámica de escritura - Usado por biometric-verification */
export interface TypingDynamics {
  userId?: string
  enrolledAt?: Date
  pattern?: TypingPattern
  samplesCount?: number
  quality?: number
  lastVerified?: Date | null
  // Campos adicionales para compatibilidad
  avgKeystrokeInterval?: number
  avgDwellTime?: number
  avgFlightTime?: number
  errorRate?: number
  wordsPerMinute?: number
  rhythmConsistency?: number
  pressurePattern?: number[]
  specialKeyUsage?: Record<string, number>
}

/** Huella de voz */
export interface VoicePrint {
  userId: string
  enrolledAt: Date
  template: VoiceFeatures
  samplesCount: number
  quality: number
  lastVerified: Date | null
  verificationCount: number
}

/** Resultado de verificación biométrica */
export interface BiometricVerificationResult {
  // Propiedades usadas en biometric-verification.ts
  userId?: string
  timestamp: Date
  isVerified?: boolean
  overallScore?: number
  componentResults?: Record<string, unknown>
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  recommendations?: string[]
  // Propiedades originales
  verified?: boolean
  confidence?: number
  method?: BiometricVerificationType
  factors?: {
    voice: { score: number; passed: boolean }
    behavior: { score: number; passed: boolean }
    typing: { score: number; passed: boolean }
    liveness: { score: number; passed: boolean }
    session: { score: number; passed: boolean }
  }
  fraudIndicators: FraudIndicator[]
  sessionId?: string
  recommendedAction?: 'allow' | 'challenge' | 'block' | 'escalate'
}

/** Tipo de verificación biométrica */
export type BiometricVerificationType =
  | 'voice'
  | 'behavioral'
  | 'typing'
  | 'facial'
  | 'fingerprint'
  | 'multi_factor'

/** Indicador de fraude */
export interface FraudIndicator {
  type:
    | 'deepfake'
    | 'replay_attack'
    | 'session_hijack'
    | 'behavior_anomaly'
    | 'device_change'
    | 'location_anomaly'
    | 'synthetic_voice'
    | 'voice_replay'
    | 'automated_typing'
  severity: 'low' | 'medium' | 'high' | 'critical'
  confidence: number
  description: string
  evidence: Record<string, unknown>
  detectedAt: Date
}

/** Continuidad de sesión */
export interface SessionContinuity {
  sessionId: string
  userId: string
  startTime: Date
  lastActivity: Date
  activityCount: number
  deviceFingerprint: string
  ipAddress: string
  geoLocation: {
    country: string
    city: string
    coordinates: [number, number]
  }
  riskScore: number
  anomalies: string[]
  isValid: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  BusinessContext,
  ChronosInsight,
  ChronosToolCall,
  // Re-export para conveniencia
  NexBotEmotion,
}
