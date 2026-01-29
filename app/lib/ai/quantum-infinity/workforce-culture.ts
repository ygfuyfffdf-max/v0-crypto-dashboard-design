/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎓🌟 AI WORKFORCE CULTURE — CULTURA CUÁNTICA ADAPTATIVA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de cultura organizacional habilitado por IA:
 * - Perfiles de usuario adaptativos
 * - Tutoriales personalizados por nivel
 * - Métricas de productividad
 * - Gamificación con logros
 * - Onboarding inteligente
 * - Feedback loop continuo
 *
 * @version QUANTUM-INFINITY-2026
 * @author CHRONOS INFINITY TEAM
 */

import { logger } from '@/app/lib/utils/logger'
import type { ChronosInsight } from '../nexus/types'
import type {
  AchievementDefinition,
  AdaptiveTutorial,
  LearningPath,
  Milestone,
  ProductivityMetrics,
  SkillLevel,
  TutorialStep,
  UserCultureProfile,
} from './types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 CONFIGURACIÓN DE CULTURA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

const CULTURE_CONFIG = {
  // Niveles de habilidad
  skillThresholds: {
    novice: { min: 0, max: 20 },
    beginner: { min: 21, max: 40 },
    intermediate: { min: 41, max: 60 },
    advanced: { min: 61, max: 80 },
    expert: { min: 81, max: 100 },
  },

  // Multiplicadores de XP
  xpMultipliers: {
    task_completion: 10,
    first_time_feature: 50,
    streak_bonus: 1.5,
    perfect_execution: 2.0,
    helping_others: 25,
  },

  // Configuración de tutoriales
  tutorialSettings: {
    maxStepsPerSession: 5,
    pauseBetweenSteps: 500,
    skipAfterCompletions: 3,
  },

  // Productividad
  productivityTargets: {
    tasksPerDay: 10,
    efficiencyTarget: 80,
    accuracyTarget: 95,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🏆 DEFINICIÓN DE LOGROS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

const ACHIEVEMENTS: AchievementDefinition[] = [
  // Logros de Ventas
  {
    id: 'first_sale',
    name: 'Primera Venta',
    description: 'Registra tu primera venta en el sistema',
    icon: '🎉',
    category: 'ventas',
    xpReward: 100,
    condition: { type: 'count', metric: 'ventas_completadas', target: 1 },
    tier: 'bronze',
  },
  {
    id: 'sales_streak_7',
    name: 'Racha Ganadora',
    description: '7 días consecutivos con ventas',
    icon: '🔥',
    category: 'ventas',
    xpReward: 250,
    condition: { type: 'streak', metric: 'dias_con_venta', target: 7 },
    tier: 'silver',
  },
  {
    id: 'million_pesos',
    name: 'Club del Millón',
    description: 'Alcanza $1,000,000 en ventas acumuladas',
    icon: '💎',
    category: 'ventas',
    xpReward: 1000,
    condition: { type: 'total', metric: 'ventas_totales', target: 1000000 },
    tier: 'gold',
  },
  {
    id: 'perfect_month',
    name: 'Mes Perfecto',
    description: '30 días sin devoluciones ni cancelaciones',
    icon: '⭐',
    category: 'ventas',
    xpReward: 500,
    condition: { type: 'streak', metric: 'dias_sin_devoluciones', target: 30 },
    tier: 'gold',
  },

  // Logros de Cobranza
  {
    id: 'debt_collector',
    name: 'Cobrador Eficiente',
    description: 'Recupera 100% de cobranza pendiente en un mes',
    icon: '💰',
    category: 'cobranza',
    xpReward: 300,
    condition: { type: 'percentage', metric: 'cobranza_recuperada', target: 100 },
    tier: 'silver',
  },
  {
    id: 'zero_overdue',
    name: 'Cartera Limpia',
    description: 'Mantén cartera sin vencidos por 30 días',
    icon: '✨',
    category: 'cobranza',
    xpReward: 400,
    condition: { type: 'streak', metric: 'dias_sin_vencidos', target: 30 },
    tier: 'gold',
  },

  // Logros de Inventario
  {
    id: 'stock_master',
    name: 'Maestro del Stock',
    description: 'Mantén inventario óptimo por 14 días',
    icon: '📦',
    category: 'inventario',
    xpReward: 200,
    condition: { type: 'streak', metric: 'dias_stock_optimo', target: 14 },
    tier: 'silver',
  },
  {
    id: 'zero_stockout',
    name: 'Nunca Sin Stock',
    description: '60 días sin desabasto',
    icon: '🏆',
    category: 'inventario',
    xpReward: 600,
    condition: { type: 'streak', metric: 'dias_sin_stockout', target: 60 },
    tier: 'gold',
  },

  // Logros de Sistema
  {
    id: 'early_adopter',
    name: 'Pionero Digital',
    description: 'Usa todas las funciones del sistema',
    icon: '🚀',
    category: 'sistema',
    xpReward: 150,
    condition: { type: 'count', metric: 'funciones_usadas', target: 10 },
    tier: 'bronze',
  },
  {
    id: 'speed_demon',
    name: 'Velocidad Máxima',
    description: 'Completa 50 tareas en menos de 30 segundos cada una',
    icon: '⚡',
    category: 'sistema',
    xpReward: 300,
    condition: { type: 'count', metric: 'tareas_rapidas', target: 50 },
    tier: 'silver',
  },
  {
    id: 'ai_collaborator',
    name: 'Colaborador de IA',
    description: 'Usa asistente de IA 100 veces',
    icon: '🤖',
    category: 'sistema',
    xpReward: 200,
    condition: { type: 'count', metric: 'interacciones_ia', target: 100 },
    tier: 'silver',
  },

  // Logros Especiales
  {
    id: 'night_owl',
    name: 'Búho Nocturno',
    description: 'Trabaja después de las 10pm (10 veces)',
    icon: '🦉',
    category: 'especial',
    xpReward: 100,
    condition: { type: 'count', metric: 'sesiones_nocturnas', target: 10 },
    tier: 'bronze',
  },
  {
    id: 'early_bird',
    name: 'Madrugador',
    description: 'Empieza antes de las 7am (10 veces)',
    icon: '🌅',
    category: 'especial',
    xpReward: 100,
    condition: { type: 'count', metric: 'sesiones_temprano', target: 10 },
    tier: 'bronze',
  },
  {
    id: 'chronos_master',
    name: 'Maestro CHRONOS',
    description: 'Alcanza nivel Expert en todas las áreas',
    icon: '👑',
    category: 'especial',
    xpReward: 2000,
    condition: { type: 'level', metric: 'nivel_global', target: 'expert' },
    tier: 'platinum',
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📚 DEFINICIÓN DE TUTORIALES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

const TUTORIAL_TEMPLATES: Record<string, TutorialTemplate> = {
  onboarding: {
    id: 'onboarding',
    name: 'Bienvenida a CHRONOS',
    description: 'Introducción al sistema de gestión financiera',
    targetLevel: 'novice',
    estimatedTime: 15,
    steps: [
      {
        id: 'welcome',
        title: '¡Bienvenido a CHRONOS!',
        content:
          'CHRONOS es tu sistema de gestión financiera inteligente. Te guiaré en tus primeros pasos.',
        type: 'info',
        targetElement: undefined,
        action: 'acknowledge',
      },
      {
        id: 'dashboard_intro',
        title: 'Tu Dashboard',
        content: 'Este es tu centro de control. Aquí verás el estado de tu negocio en tiempo real.',
        type: 'highlight',
        targetElement: '#main-dashboard',
        action: 'acknowledge',
      },
      {
        id: 'banks_intro',
        title: 'Gestión de Bancos',
        content: 'CHRONOS maneja 7 bancos/bóvedas para organizar tu dinero. Explóralos aquí.',
        type: 'highlight',
        targetElement: '#banks-panel',
        action: 'click',
      },
      {
        id: 'first_action',
        title: 'Tu Primera Acción',
        content: 'Intenta registrar una venta para ver cómo funciona la distribución automática.',
        type: 'interactive',
        targetElement: '#btn-nueva-venta',
        action: 'click',
      },
      {
        id: 'ai_assistant',
        title: 'Tu Asistente de IA',
        content: 'Conoce a NexBot, tu asistente inteligente. Pregúntale lo que necesites.',
        type: 'highlight',
        targetElement: '#nexbot-avatar',
        action: 'acknowledge',
      },
    ],
  },

  ventas_basico: {
    id: 'ventas_basico',
    name: 'Registro de Ventas',
    description: 'Aprende a registrar ventas correctamente',
    targetLevel: 'beginner',
    estimatedTime: 10,
    steps: [
      {
        id: 'sales_intro',
        title: 'Módulo de Ventas',
        content:
          'Aquí registrarás todas tus ventas. El sistema distribuye automáticamente a los bancos.',
        type: 'info',
        targetElement: undefined,
        action: 'acknowledge',
      },
      {
        id: 'new_sale_btn',
        title: 'Nueva Venta',
        content: 'Haz clic aquí para iniciar el registro de una venta.',
        type: 'highlight',
        targetElement: '#btn-nueva-venta',
        action: 'click',
      },
      {
        id: 'select_client',
        title: 'Seleccionar Cliente',
        content: 'Primero selecciona o crea el cliente que realiza la compra.',
        type: 'interactive',
        targetElement: '#select-cliente',
        action: 'select',
      },
      {
        id: 'enter_amount',
        title: 'Ingresar Monto',
        content:
          'Ingresa el precio de venta. El sistema calculará automáticamente la distribución.',
        type: 'interactive',
        targetElement: '#input-precio-venta',
        action: 'input',
      },
      {
        id: 'distribution_preview',
        title: 'Vista Previa de Distribución',
        content: 'Observa cómo se distribuirá el dinero: Bóveda (costo), Flete y Utilidades.',
        type: 'highlight',
        targetElement: '#distribution-preview',
        action: 'acknowledge',
      },
    ],
  },

  cobranza_avanzado: {
    id: 'cobranza_avanzado',
    name: 'Gestión Avanzada de Cobranza',
    description: 'Técnicas avanzadas para recuperar cartera',
    targetLevel: 'advanced',
    estimatedTime: 20,
    steps: [
      {
        id: 'aging_analysis',
        title: 'Análisis de Antigüedad',
        content: 'Aprende a usar el análisis de aging para priorizar cobranza.',
        type: 'info',
        targetElement: undefined,
        action: 'acknowledge',
      },
      {
        id: 'risk_classification',
        title: 'Clasificación de Riesgo',
        content: 'El sistema clasifica clientes por riesgo. Usa esto para decidir estrategias.',
        type: 'highlight',
        targetElement: '#risk-classification-panel',
        action: 'acknowledge',
      },
      {
        id: 'automated_reminders',
        title: 'Recordatorios Automatizados',
        content: 'Configura el Collector Bot para enviar recordatorios automáticos.',
        type: 'interactive',
        targetElement: '#collector-bot-settings',
        action: 'click',
      },
      {
        id: 'payment_plans',
        title: 'Planes de Pago',
        content: 'Crea planes de pago personalizados para clientes con dificultades.',
        type: 'interactive',
        targetElement: '#btn-crear-plan-pago',
        action: 'click',
      },
    ],
  },

  ai_features: {
    id: 'ai_features',
    name: 'Funciones de IA',
    description: 'Domina las capacidades de inteligencia artificial',
    targetLevel: 'intermediate',
    estimatedTime: 15,
    steps: [
      {
        id: 'ai_intro',
        title: 'IA en CHRONOS',
        content: 'CHRONOS incluye múltiples sistemas de IA para potenciar tu negocio.',
        type: 'info',
        targetElement: undefined,
        action: 'acknowledge',
      },
      {
        id: 'nexbot_chat',
        title: 'Chat con NexBot',
        content: 'NexBot puede responder preguntas, ejecutar acciones y darte insights.',
        type: 'interactive',
        targetElement: '#nexbot-chat-input',
        action: 'input',
      },
      {
        id: 'digital_employees',
        title: 'Empleados Digitales',
        content: 'Conoce al CFO Bot, Auditor Bot y otros que trabajan 24/7 por ti.',
        type: 'highlight',
        targetElement: '#digital-employees-panel',
        action: 'acknowledge',
      },
      {
        id: 'predictions',
        title: 'Predicciones',
        content: 'El sistema predice demanda, riesgos y oportunidades usando ML.',
        type: 'highlight',
        targetElement: '#predictions-panel',
        action: 'acknowledge',
      },
    ],
  },
}

interface TutorialTemplate {
  id: string
  name: string
  description: string
  targetLevel: SkillLevel
  estimatedTime: number
  steps: TutorialStep[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🧠 CLASE PRINCIPAL: WORKFORCE CULTURE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export class WorkforceCultureEngine {
  private profiles: Map<string, UserCultureProfile> = new Map()
  private activeTutorials: Map<string, AdaptiveTutorial> = new Map()
  private callbacks: WorkforceCultureCallbacks

  constructor(callbacks?: Partial<WorkforceCultureCallbacks>) {
    this.callbacks = {
      onLevelUp: callbacks?.onLevelUp ?? (() => {}),
      onAchievementUnlocked: callbacks?.onAchievementUnlocked ?? (() => {}),
      onTutorialStarted: callbacks?.onTutorialStarted ?? (() => {}),
      onTutorialCompleted: callbacks?.onTutorialCompleted ?? (() => {}),
      onProductivityUpdate: callbacks?.onProductivityUpdate ?? (() => {}),
      onInsightGenerated: callbacks?.onInsightGenerated ?? (() => {}),
    }

    logger.info('[WorkforceCulture] Engine initialized', { context: 'WorkforceCulture' })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 👤 GESTIÓN DE PERFILES
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Crea o actualiza perfil de usuario
   */
  createOrUpdateProfile(userId: string, data: Partial<UserCultureProfile>): UserCultureProfile {
    const existing = this.profiles.get(userId)

    const profile: UserCultureProfile = existing ?? {
      userId,
      displayName: data.displayName ?? 'Usuario',
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      skillLevels: {
        ventas: 0,
        cobranza: 0,
        inventario: 0,
        finanzas: 0,
        sistema: 0,
      },
      achievements: [],
      completedTutorials: [],
      preferences: {
        tutorialSpeed: 'normal',
        notificationLevel: 'medium',
        theme: 'dark',
        language: 'es-MX',
      },
      stats: {
        totalTasks: 0,
        tasksToday: 0,
        streakDays: 0,
        lastActiveDate: new Date(),
        totalTimeSpent: 0,
        featuresUsed: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Merge con datos nuevos
    if (data.displayName) profile.displayName = data.displayName
    if (data.preferences) profile.preferences = { ...profile.preferences, ...data.preferences }
    profile.updatedAt = new Date()

    this.profiles.set(userId, profile)

    logger.info('[WorkforceCulture] Profile updated', {
      context: 'WorkforceCulture',
      data: { userId, level: profile.level },
    })

    return profile
  }

  /**
   * Obtiene perfil de usuario
   */
  getProfile(userId: string): UserCultureProfile | undefined {
    return this.profiles.get(userId)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ⭐ SISTEMA DE XP Y NIVELES
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Agrega XP al usuario
   */
  addXP(
    userId: string,
    amount: number,
    source: string,
    skillArea?: 'ventas' | 'cobranza' | 'inventario' | 'finanzas' | 'sistema' | string,
  ): XPResult {
    const profile = this.profiles.get(userId)
    if (!profile) {
      return { success: false, reason: 'Profile not found' }
    }

    // Ensure required fields have defaults
    profile.level = profile.level ?? 1
    profile.xp = profile.xp ?? 0
    profile.xpToNextLevel = profile.xpToNextLevel ?? 100
    profile.stats = profile.stats ?? {
      totalTasks: 0,
      tasksToday: 0,
      streakDays: 0,
      lastActiveDate: new Date(),
      totalTimeSpent: 0,
      featuresUsed: [],
    }
    profile.skillLevels = profile.skillLevels ?? {
      ventas: 0,
      cobranza: 0,
      inventario: 0,
      finanzas: 0,
      sistema: 0,
    }
    profile.achievements = profile.achievements ?? []

    const oldLevel = profile.level
    const oldXP = profile.xp

    // Aplicar multiplicadores
    let finalAmount = amount

    // Bonus por racha
    if (profile.stats.streakDays >= 7) {
      finalAmount *= CULTURE_CONFIG.xpMultipliers.streak_bonus
    }

    profile.xp += Math.round(finalAmount)

    // Verificar level up
    while (profile.xp >= profile.xpToNextLevel) {
      profile.xp -= profile.xpToNextLevel
      profile.level++
      profile.xpToNextLevel = this.calculateXPForLevel(profile.level + 1)

      this.callbacks.onLevelUp?.(userId, profile.level)

      logger.info('[WorkforceCulture] User leveled up', {
        context: 'WorkforceCulture',
        data: { userId, newLevel: profile.level },
      })
    }

    // Actualizar skill específico si aplica
    if (skillArea && profile.skillLevels) {
      profile.skillLevels[skillArea] = Math.min(
        100,
        (profile.skillLevels[skillArea] ?? 0) + Math.round(amount / 10),
      )
    }

    return {
      success: true,
      xpGained: Math.round(finalAmount),
      newTotal: profile.xp,
      oldLevel,
      newLevel: profile.level,
      leveledUp: profile.level > oldLevel,
    }
  }

  private calculateXPForLevel(level: number): number {
    // Fórmula exponencial suave
    return Math.round(100 * Math.pow(1.5, level - 1))
  }

  /**
   * Obtiene nivel de skill
   */
  getSkillLevel(score: number): SkillLevel {
    const thresholds = CULTURE_CONFIG.skillThresholds
    if (score <= thresholds.novice.max) return 'novice'
    if (score <= thresholds.beginner.max) return 'beginner'
    if (score <= thresholds.intermediate.max) return 'intermediate'
    if (score <= thresholds.advanced.max) return 'advanced'
    return 'expert'
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🏆 SISTEMA DE LOGROS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Verifica y otorga logros
   */
  checkAchievements(userId: string, metrics: UserMetrics): UnlockedAchievement[] {
    const profile = this.profiles.get(userId)
    if (!profile) return []

    // Initialize achievements array if undefined
    profile.achievements = profile.achievements ?? []

    const newlyUnlocked: UnlockedAchievement[] = []

    for (const achievement of ACHIEVEMENTS) {
      // Skip si ya tiene el logro
      if (profile.achievements.includes(achievement.id)) continue

      // Verificar condición
      const unlocked = this.checkAchievementCondition(achievement, metrics)

      if (unlocked) {
        profile.achievements.push(achievement.id)

        // Otorgar XP
        this.addXP(userId, achievement.xpReward ?? 0, `achievement_${achievement.id}`)

        const unlockedAch: UnlockedAchievement = {
          ...achievement,
          unlockedAt: new Date(),
        }

        newlyUnlocked.push(unlockedAch)
        this.callbacks.onAchievementUnlocked?.(userId, unlockedAch)

        logger.info('[WorkforceCulture] Achievement unlocked', {
          context: 'WorkforceCulture',
          data: { userId, achievement: achievement.id },
        })
      }
    }

    return newlyUnlocked
  }

  private checkAchievementCondition(
    achievement: AchievementDefinition,
    metrics: UserMetrics,
  ): boolean {
    const condition = achievement.condition

    // If condition is undefined or string, return false
    if (!condition || typeof condition === 'string') {
      return false
    }

    const rawValue = metrics[condition.metric] ?? 0
    const value = typeof rawValue === 'number' ? rawValue : 0
    const targetNum = typeof condition.target === 'number' ? condition.target : 0

    switch (condition.type) {
      case 'count':
      case 'total':
        return value >= targetNum
      case 'streak':
        return value >= targetNum
      case 'percentage':
        return value >= targetNum
      case 'level':
        return value === condition.target
      default:
        return false
    }
  }

  /**
   * Obtiene progreso de logros
   */
  getAchievementProgress(userId: string, metrics: UserMetrics): AchievementProgress[] {
    const profile = this.profiles.get(userId)
    if (!profile) return []

    // Ensure achievements array exists
    profile.achievements = profile.achievements ?? []

    return ACHIEVEMENTS.map((achievement) => {
      const condition = achievement.condition
      const unlocked = profile.achievements!.includes(achievement.id)

      // Handle condition being string or undefined
      if (!condition || typeof condition === 'string') {
        return {
          achievement,
          unlocked,
          currentValue: 0,
          targetValue: 0,
          progress: unlocked ? 100 : 0,
        }
      }

      const rawValue = metrics[condition.metric] ?? 0
      const currentValue = typeof rawValue === 'number' ? rawValue : 0
      const targetValue = typeof condition.target === 'number' ? condition.target : 0

      return {
        achievement,
        unlocked,
        currentValue,
        targetValue,
        progress: unlocked ? 100 : Math.min(100, (currentValue / (targetValue || 1)) * 100),
      }
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 📚 SISTEMA DE TUTORIALES
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Inicia un tutorial para el usuario
   */
  startTutorial(userId: string, tutorialId: string): AdaptiveTutorial | null {
    const profile = this.profiles.get(userId)
    if (!profile) return null

    const template = TUTORIAL_TEMPLATES[tutorialId]
    if (!template) {
      logger.warn('[WorkforceCulture] Tutorial not found', {
        context: 'WorkforceCulture',
        data: { tutorialId },
      })
      return null
    }

    // Initialize completedTutorials if undefined
    profile.completedTutorials = profile.completedTutorials ?? []

    // Verificar si ya lo completó
    if (profile.completedTutorials.includes(tutorialId)) {
      // Permitir repetir pero sin XP
      logger.info('[WorkforceCulture] Tutorial already completed, repeating', {
        context: 'WorkforceCulture',
        data: { userId, tutorialId },
      })
    }

    // Adaptar tutorial al nivel del usuario
    const adaptedSteps = this.adaptTutorialToUser(template.steps, profile)

    const tutorial: AdaptiveTutorial = {
      id: `tutorial_${tutorialId}_${Date.now()}`,
      templateId: tutorialId,
      userId,
      name: template.name,
      description: template.description,
      steps: adaptedSteps,
      currentStepIndex: 0,
      status: 'in_progress',
      startedAt: new Date(),
      adaptations: [],
    }

    this.activeTutorials.set(userId, tutorial)
    this.callbacks.onTutorialStarted?.(userId, tutorial)

    logger.info('[WorkforceCulture] Tutorial started', {
      context: 'WorkforceCulture',
      data: { userId, tutorialId, steps: adaptedSteps.length },
    })

    return tutorial
  }

  private adaptTutorialToUser(steps: TutorialStep[], profile: UserCultureProfile): TutorialStep[] {
    // Obtener nivel global del usuario
    const skillLevels = profile.skillLevels ?? {
      ventas: 0,
      cobranza: 0,
      inventario: 0,
      sistema: 0,
      ia: 0,
    }
    const skillValues = Object.values(skillLevels) as number[]
    const avgSkill =
      skillValues.length > 0 ? skillValues.reduce((a, b) => a + b, 0) / skillValues.length : 0
    const userLevel = this.getSkillLevel(avgSkill)

    return steps.map((step) => {
      const adaptedStep = { ...step }

      // Ajustar contenido según nivel
      if (userLevel === 'novice') {
        // Más detallado para novatos
        adaptedStep.content = `${step.content}\n\n💡 Tip: Tómate tu tiempo para explorar.`
      } else if (userLevel === 'expert') {
        // Más conciso para expertos
        adaptedStep.content = step.content.split('.')[0] + '.'
      }

      // Ajustar según preferencias de velocidad
      if (profile.preferences.tutorialSpeed === 'fast') {
        adaptedStep.autoAdvance = true
        adaptedStep.autoAdvanceDelay = 2000
      }

      return adaptedStep
    })
  }

  /**
   * Avanza al siguiente paso del tutorial
   */
  advanceTutorial(userId: string, stepCompleted?: boolean): TutorialStep | null {
    const tutorial = this.activeTutorials.get(userId)
    if (!tutorial || tutorial.status !== 'in_progress') return null

    // Initialize steps if undefined
    const steps = tutorial.steps ?? []
    const currentIndex = tutorial.currentStepIndex ?? 0

    if (stepCompleted) {
      tutorial.currentStepIndex = currentIndex + 1
    }

    // Verificar si terminó
    if ((tutorial.currentStepIndex ?? 0) >= steps.length) {
      return this.completeTutorial(userId)
    }

    return steps[tutorial.currentStepIndex ?? 0] ?? null
  }

  /**
   * Completa el tutorial
   */
  private completeTutorial(userId: string): null {
    const tutorial = this.activeTutorials.get(userId)
    const profile = this.profiles.get(userId)

    if (!tutorial || !profile) return null

    tutorial.status = 'completed'
    tutorial.completedAt = new Date()

    // Initialize completedTutorials if undefined
    profile.completedTutorials = profile.completedTutorials ?? []
    const templateId = tutorial.templateId ?? ''

    // Registrar completado si es primera vez
    if (templateId && !profile.completedTutorials.includes(templateId)) {
      profile.completedTutorials.push(templateId)

      // Otorgar XP por primer completado
      this.addXP(
        userId,
        CULTURE_CONFIG.xpMultipliers.first_time_feature,
        `tutorial_${templateId}`,
        'sistema',
      )
    }

    this.callbacks.onTutorialCompleted?.(userId, tutorial)
    this.activeTutorials.delete(userId)

    logger.info('[WorkforceCulture] Tutorial completed', {
      context: 'WorkforceCulture',
      data: { userId, tutorialId: tutorial.templateId },
    })

    return null
  }

  /**
   * Obtiene tutorial sugerido
   */
  getSuggestedTutorial(userId: string): string | null {
    const profile = this.profiles.get(userId)
    if (!profile) return null

    // Initialize arrays if undefined
    profile.completedTutorials = profile.completedTutorials ?? []
    profile.skillLevels = profile.skillLevels ?? {
      ventas: 0,
      cobranza: 0,
      inventario: 0,
      sistema: 0,
      ia: 0,
    }

    // Prioridad de tutoriales
    const tutorialPriority = ['onboarding', 'ventas_basico', 'ai_features', 'cobranza_avanzado']

    for (const tutorialId of tutorialPriority) {
      if (!profile.completedTutorials.includes(tutorialId)) {
        const template = TUTORIAL_TEMPLATES[tutorialId]
        if (template) {
          // Verificar nivel requerido
          const skillValues = Object.values(profile.skillLevels) as number[]
          const avgSkill =
            skillValues.length > 0 ? skillValues.reduce((a, b) => a + b, 0) / skillValues.length : 0
          const userLevel = this.getSkillLevel(avgSkill)

          // Solo sugerir si el nivel es apropiado
          const levelOrder: (string | SkillLevel)[] = [
            'novice',
            'beginner',
            'intermediate',
            'advanced',
            'expert',
          ]
          const userLevelStr = typeof userLevel === 'string' ? userLevel : 'beginner'
          const userLevelIndex = levelOrder.indexOf(userLevelStr)
          const requiredLevelIndex = levelOrder.indexOf(template.targetLevel)

          if (userLevelIndex >= requiredLevelIndex) {
            return tutorialId
          }
        }
      }
    }

    return null
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 📊 MÉTRICAS DE PRODUCTIVIDAD
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Actualiza métricas de productividad
   */
  updateProductivityMetrics(userId: string, action: ProductivityAction): ProductivityMetrics {
    const profile = this.profiles.get(userId)
    if (!profile) {
      throw new Error('Profile not found')
    }

    // Initialize stats if undefined
    profile.stats = profile.stats ?? {
      totalTasks: 0,
      tasksToday: 0,
      streakDays: 0,
      totalTimeSpent: 0,
      featuresUsed: [],
      lastActiveDate: new Date(),
    }

    // Actualizar estadísticas
    profile.stats.totalTasks++
    profile.stats.tasksToday++

    // Verificar si es nuevo día
    const today = new Date().toDateString()
    const lastActive = profile.stats.lastActiveDate.toDateString()

    if (today !== lastActive) {
      // Verificar racha
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      if (lastActive === yesterday.toDateString()) {
        profile.stats.streakDays++
      } else {
        profile.stats.streakDays = 1
      }

      profile.stats.tasksToday = 1
    }

    profile.stats.lastActiveDate = new Date()
    profile.stats.totalTimeSpent += action.duration

    // Registrar feature usado
    if (action.feature && !profile.stats.featuresUsed.includes(action.feature)) {
      profile.stats.featuresUsed.push(action.feature)

      // XP por primera vez usando feature
      this.addXP(userId, CULTURE_CONFIG.xpMultipliers.first_time_feature, action.feature)
    }

    // XP por completar tarea
    let xpAmount = CULTURE_CONFIG.xpMultipliers.task_completion
    if (action.duration < 30000) {
      // Menos de 30 segundos
      xpAmount *= CULTURE_CONFIG.xpMultipliers.perfect_execution
    }
    this.addXP(userId, xpAmount, action.type, action.skillArea)

    // Calcular métricas
    const metrics = this.calculateProductivityMetrics(profile)

    this.callbacks.onProductivityUpdate?.(userId, metrics)

    return metrics
  }

  private calculateProductivityMetrics(profile: UserCultureProfile): ProductivityMetrics {
    const targets = CULTURE_CONFIG.productivityTargets

    // Ensure stats is initialized
    const stats = profile.stats ?? {
      totalTasks: 0,
      tasksToday: 0,
      streakDays: 0,
      totalTimeSpent: 0,
      featuresUsed: [],
      lastActiveDate: new Date(),
    }

    const tasksEfficiency = Math.min(100, (stats.tasksToday / targets.tasksPerDay) * 100)

    // Calcular tendencia (simplificado)
    const trend = stats.streakDays > 3 ? 'improving' : stats.streakDays > 0 ? 'stable' : 'declining'

    return {
      userId: profile.userId,
      date: new Date(),
      tasksCompleted: stats.tasksToday,
      tasksTarget: targets.tasksPerDay,
      efficiency: tasksEfficiency,
      accuracyRate: 95, // Placeholder - calcular de datos reales
      streakDays: stats.streakDays,
      timeSpentToday: stats.totalTimeSpent,
      peakProductivityHour: this.estimatePeakHour(profile),
      trend,
      insights: this.generateProductivityInsights(profile, tasksEfficiency),
    }
  }

  private estimatePeakHour(profile: UserCultureProfile): number {
    // Simplificado - en producción analizar patrones reales
    return 10 // 10 AM default
  }

  private generateProductivityInsights(profile: UserCultureProfile, efficiency: number): string[] {
    const insights: string[] = []

    // Ensure stats is initialized
    const stats = profile.stats ?? {
      totalTasks: 0,
      tasksToday: 0,
      streakDays: 0,
      totalTimeSpent: 0,
      featuresUsed: [],
      lastActiveDate: new Date(),
    }

    if (efficiency >= 100) {
      insights.push('🎉 ¡Excelente! Superaste tu meta de tareas de hoy.')
    } else if (efficiency >= 80) {
      insights.push('👍 Buen progreso. Estás cerca de tu meta.')
    } else if (efficiency < 50) {
      insights.push('💪 Aún tienes tiempo para completar más tareas hoy.')
    }

    if (stats.streakDays >= 7) {
      insights.push(`🔥 ¡Increíble racha de ${stats.streakDays} días!`)
    }

    if (stats.featuresUsed.length < 5) {
      insights.push('💡 Tip: Explora más funciones para mejorar tu productividad.')
    }

    return insights
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🛤️ LEARNING PATHS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Genera path de aprendizaje personalizado
   */
  generateLearningPath(userId: string): LearningPath {
    const profile = this.profiles.get(userId)
    if (!profile) {
      throw new Error('Profile not found')
    }

    // Initialize skillLevels if undefined
    profile.skillLevels = profile.skillLevels ?? {
      ventas: 0,
      cobranza: 0,
      inventario: 0,
      sistema: 0,
      ia: 0,
    }
    profile.completedTutorials = profile.completedTutorials ?? []
    profile.achievements = profile.achievements ?? []

    // Identificar área más débil
    const skills = profile.skillLevels
    const skillEntries = Object.entries(skills) as [string, number][]
    const sortedSkills = skillEntries.sort(([, a], [, b]) => (a ?? 0) - (b ?? 0))
    const weakestArea = sortedSkills[0]?.[0] ?? 'ventas'

    // Generar recomendaciones
    const recommendations: LearningRecommendation[] = []

    // Tutorial para área débil
    const tutorialMap: Record<string, string> = {
      ventas: 'ventas_basico',
      cobranza: 'cobranza_avanzado',
      sistema: 'ai_features',
    }

    const suggestedTutorial = tutorialMap[weakestArea]
    if (suggestedTutorial && !profile.completedTutorials.includes(suggestedTutorial)) {
      recommendations.push({
        type: 'tutorial',
        id: suggestedTutorial,
        title: TUTORIAL_TEMPLATES[suggestedTutorial]?.name ?? 'Tutorial',
        reason: `Mejorar habilidades de ${weakestArea}`,
        priority: 1,
        estimatedTime: TUTORIAL_TEMPLATES[suggestedTutorial]?.estimatedTime ?? 10,
        xpReward: 50,
      })
    }

    // Logros cercanos
    const nearAchievements = ACHIEVEMENTS.filter((a) => {
      if (profile.achievements!.includes(a.id)) return false
      // Simplificado - en producción verificar progreso real
      return true
    }).slice(0, 3)

    for (const achievement of nearAchievements) {
      recommendations.push({
        type: 'achievement',
        id: achievement.id,
        title: achievement.name,
        reason: achievement.description,
        priority: 2,
        estimatedTime: 0,
        xpReward: achievement.xpReward ?? 0,
      })
    }

    const currentSkillValue = skills[weakestArea] ?? 0

    return {
      userId,
      generatedAt: new Date(),
      focusArea: weakestArea,
      currentLevel: this.getSkillLevel(currentSkillValue),
      targetLevel: 'intermediate',
      recommendations,
      estimatedTimeToTarget: this.estimateTimeToTarget(currentSkillValue, 60),
      milestones: this.generateMilestones(weakestArea, currentSkillValue),
    }
  }

  private estimateTimeToTarget(currentSkill: number, targetSkill: number): number {
    // Estimación simplificada: 1 hora por 5 puntos de skill
    const skillGap = targetSkill - currentSkill
    return Math.max(0, Math.ceil(skillGap / 5) * 60) // minutos
  }

  private generateMilestones(area: string, currentSkill: number): Milestone[] {
    const milestones: Milestone[] = []
    const levels: string[] = ['beginner', 'intermediate', 'advanced', 'expert']

    for (const level of levels) {
      const thresholdConfig =
        CULTURE_CONFIG.skillThresholds[level as keyof typeof CULTURE_CONFIG.skillThresholds]
      if (thresholdConfig && thresholdConfig.min > currentSkill) {
        milestones.push({
          level,
          skillRequired: thresholdConfig.min,
          reward: `Insignia ${level} de ${area}`,
          achieved: false,
        })
      }
    }

    return milestones
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔧 MÉTODOS PÚBLICOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Genera insight de cultura
   */
  generateInsight(userId: string): ChronosInsight | null {
    const profile = this.profiles.get(userId)
    if (!profile) return null

    // Initialize defaults
    const skillLevels = profile.skillLevels ?? {
      ventas: 0,
      cobranza: 0,
      inventario: 0,
      sistema: 0,
      ia: 0,
    }
    const skillValues = Object.values(skillLevels).filter((v): v is number => typeof v === 'number')
    const avgSkill =
      skillValues.length > 0 ? skillValues.reduce((a, b) => a + b, 0) / skillValues.length : 0
    const level = this.getSkillLevel(avgSkill)
    const achievements = profile.achievements ?? []
    const stats = profile.stats ?? { streakDays: 0 }

    return {
      id: `insight_culture_${Date.now()}`,
      type: 'info',
      priority: 'low',
      title: '📊 Tu Progreso en CHRONOS',
      description:
        `Nivel ${profile.level ?? 1} | ${achievements.length} logros | ` +
        `Racha de ${stats.streakDays} días | Skill: ${level}`,
      confidence: 100,
      emotionalTone: stats.streakDays > 5 ? 'happy' : 'neutral',
    }
  }

  /**
   * Obtiene leaderboard
   */
  getLeaderboard(limit: number = 10): LeaderboardEntry[] {
    const entries = Array.from(this.profiles.values())
      .map((p) => {
        const xp = p.xp ?? 0
        const xpToNextLevel = p.xpToNextLevel ?? 100
        const level = p.level ?? 1
        const achievements = p.achievements ?? []
        const stats = p.stats ?? { streakDays: 0 }
        return {
          userId: p.userId,
          displayName: p.displayName ?? 'Usuario',
          level,
          xp: xp + xpToNextLevel * (level - 1), // XP total aproximado
          achievementsCount: achievements.length,
          streakDays: stats.streakDays,
        }
      })
      .sort((a, b) => b.xp - a.xp)
      .slice(0, limit)

    return entries.map((e, index) => ({
      ...e,
      rank: index + 1,
    }))
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 TIPOS ADICIONALES Y EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export interface XPResult {
  success: boolean
  reason?: string
  xpGained?: number
  newTotal?: number
  oldLevel?: number
  newLevel?: number
  leveledUp?: boolean
}

export interface UserMetrics {
  [key: string]: number | string
}

export interface UnlockedAchievement extends AchievementDefinition {
  unlockedAt: Date
}

export interface AchievementProgress {
  achievement: AchievementDefinition
  unlocked: boolean
  currentValue: number
  targetValue: number
  progress: number
}

export interface ProductivityAction {
  type: string
  feature?: string
  duration: number // ms
  skillArea?: keyof UserCultureProfile['skillLevels']
}

export interface LearningRecommendation {
  type: 'tutorial' | 'achievement' | 'practice'
  id: string
  title: string
  reason: string
  priority: number
  estimatedTime: number
  xpReward: number
}

// Milestone is now imported from './types'

export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  level: number
  xp: number
  achievementsCount: number
  streakDays: number
}

export interface WorkforceCultureCallbacks {
  onLevelUp?: (userId: string, newLevel: number) => void
  onAchievementUnlocked?: (userId: string, achievement: UnlockedAchievement) => void
  onTutorialStarted?: (userId: string, tutorial: AdaptiveTutorial) => void
  onTutorialCompleted?: (userId: string, tutorial: AdaptiveTutorial) => void
  onProductivityUpdate?: (userId: string, metrics: ProductivityMetrics) => void
  onInsightGenerated?: (insight: ChronosInsight) => void
}

// Singleton
let workforceCultureInstance: WorkforceCultureEngine | null = null

export function getWorkforceCultureEngine(
  callbacks?: Partial<WorkforceCultureCallbacks>,
): WorkforceCultureEngine {
  if (!workforceCultureInstance) {
    workforceCultureInstance = new WorkforceCultureEngine(callbacks)
  }
  return workforceCultureInstance
}

export function resetWorkforceCultureEngine(): void {
  workforceCultureInstance = null
}
