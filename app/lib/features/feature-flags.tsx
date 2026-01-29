/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚩 CHRONOS INFINITY 2026 — Feature Flags System
 * ═══════════════════════════════════════════════════════════════════════════════
 * Sistema de feature flags para rollouts graduales y A/B testing
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { createContext, useContext, useMemo, type ReactNode } from 'react'

// ============================================================================
// Tipos
// ============================================================================

export type FeatureFlagValue = boolean | string | number | object

export interface FeatureFlag {
  key: string
  defaultValue: FeatureFlagValue
  description?: string
  variants?: FeatureFlagValue[]
  rolloutPercentage?: number
  enabledFor?: {
    environments?: ('development' | 'staging' | 'production')[]
    userIds?: string[]
    userGroups?: string[]
  }
  expiresAt?: Date
}

export interface FeatureFlagContext {
  userId?: string
  userGroups?: string[]
  environment: 'development' | 'staging' | 'production'
  sessionId?: string
  customAttributes?: Record<string, unknown>
}

export interface FeatureFlagsConfig {
  flags: Record<string, FeatureFlag>
  context: FeatureFlagContext
  overrides?: Record<string, FeatureFlagValue>
}

// ============================================================================
// Feature Flags Registry
// ============================================================================

/**
 * Registro central de feature flags del sistema CHRONOS
 */
export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // ============================================
  // 🎨 UI/UX Features
  // ============================================
  'ui.dark_mode_v2': {
    key: 'ui.dark_mode_v2',
    defaultValue: false,
    description: 'Nuevo sistema de dark mode con más opciones',
    rolloutPercentage: 50,
  },
  'ui.animations_advanced': {
    key: 'ui.animations_advanced',
    defaultValue: true,
    description: 'Animaciones avanzadas (desactivar para rendimiento)',
    enabledFor: {
      environments: ['development', 'staging'],
    },
  },
  'ui.glassmorphism': {
    key: 'ui.glassmorphism',
    defaultValue: true,
    description: 'Efectos de glassmorphism en cards',
  },
  'ui.3d_dashboard': {
    key: 'ui.3d_dashboard',
    defaultValue: false,
    description: 'Dashboard con elementos 3D Spline',
    rolloutPercentage: 25,
  },

  // ============================================
  // 💰 Ventas Features
  // ============================================
  'ventas.quick_create': {
    key: 'ventas.quick_create',
    defaultValue: false,
    description: 'Modal de creación rápida de ventas',
    rolloutPercentage: 75,
  },
  'ventas.bulk_operations': {
    key: 'ventas.bulk_operations',
    defaultValue: false,
    description: 'Operaciones masivas en ventas',
    enabledFor: {
      userGroups: ['admin', 'manager'],
    },
  },
  'ventas.ai_suggestions': {
    key: 'ventas.ai_suggestions',
    defaultValue: false,
    description: 'Sugerencias de IA para precios',
    enabledFor: {
      environments: ['development'],
    },
  },

  // ============================================
  // 🏦 Bancos Features
  // ============================================
  'bancos.realtime_sync': {
    key: 'bancos.realtime_sync',
    defaultValue: true,
    description: 'Sincronización en tiempo real de balances',
  },
  'bancos.export_pdf': {
    key: 'bancos.export_pdf',
    defaultValue: false,
    description: 'Exportar estados de cuenta a PDF',
    rolloutPercentage: 50,
  },

  // ============================================
  // 📊 Analytics Features
  // ============================================
  'analytics.predictive': {
    key: 'analytics.predictive',
    defaultValue: false,
    description: 'Analytics predictivos con ML',
    enabledFor: {
      environments: ['development', 'staging'],
    },
  },
  'analytics.custom_reports': {
    key: 'analytics.custom_reports',
    defaultValue: false,
    description: 'Reportes personalizables',
    rolloutPercentage: 30,
  },

  // ============================================
  // 🔒 Security Features
  // ============================================
  'security.2fa': {
    key: 'security.2fa',
    defaultValue: false,
    description: 'Autenticación de dos factores',
  },
  'security.session_timeout': {
    key: 'security.session_timeout',
    defaultValue: 30, // minutos
    description: 'Tiempo de timeout de sesión',
  },

  // ============================================
  // 🤖 AI Features
  // ============================================
  'ai.chat_assistant': {
    key: 'ai.chat_assistant',
    defaultValue: false,
    description: 'Asistente de chat con IA',
    enabledFor: {
      environments: ['development'],
    },
  },
  'ai.auto_categorization': {
    key: 'ai.auto_categorization',
    defaultValue: false,
    description: 'Categorización automática de transacciones',
    rolloutPercentage: 20,
  },

  // ============================================
  // 🧪 Experimental Features
  // ============================================
  'experimental.new_dashboard': {
    key: 'experimental.new_dashboard',
    defaultValue: false,
    description: 'Nuevo diseño de dashboard (beta)',
    enabledFor: {
      userGroups: ['beta_testers'],
    },
  },
  'experimental.voice_commands': {
    key: 'experimental.voice_commands',
    defaultValue: false,
    description: 'Comandos de voz',
    enabledFor: {
      environments: ['development'],
    },
  },
}

// ============================================================================
// Feature Flag Evaluation
// ============================================================================

/**
 * Genera un hash determinístico para rollouts
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

/**
 * Evalúa si un flag está habilitado para el contexto dado
 */
export function evaluateFlag(
  flag: FeatureFlag,
  context: FeatureFlagContext,
  overrides?: Record<string, FeatureFlagValue>,
): FeatureFlagValue {
  // 1. Verificar overrides primero
  if (overrides && flag.key in overrides) {
    const overrideValue = overrides[flag.key]
    if (overrideValue !== undefined) {
      logger.debug('Feature flag override aplicado', {
        context: 'FeatureFlags',
        flag: flag.key,
        value: overrideValue,
      })
      return overrideValue
    }
  }

  // 2. Verificar expiración
  if (flag.expiresAt && new Date() > flag.expiresAt) {
    return flag.defaultValue
  }

  // 3. Verificar ambiente
  if (flag.enabledFor?.environments) {
    if (!flag.enabledFor.environments.includes(context.environment)) {
      return flag.defaultValue
    }
  }

  // 4. Verificar usuarios específicos
  if (flag.enabledFor?.userIds && context.userId) {
    if (flag.enabledFor.userIds.includes(context.userId)) {
      return typeof flag.defaultValue === 'boolean'
        ? true
        : (flag.variants?.[0] ?? flag.defaultValue)
    }
  }

  // 5. Verificar grupos de usuarios
  if (flag.enabledFor?.userGroups && context.userGroups) {
    const hasGroup = context.userGroups.some((g) => flag.enabledFor?.userGroups?.includes(g))
    if (hasGroup) {
      return typeof flag.defaultValue === 'boolean'
        ? true
        : (flag.variants?.[0] ?? flag.defaultValue)
    }
  }

  // 6. Evaluar rollout percentage
  if (typeof flag.rolloutPercentage === 'number') {
    const identifier = context.userId || context.sessionId || 'anonymous'
    const hash = hashString(`${flag.key}:${identifier}`)
    const percentage = hash % 100

    if (percentage < flag.rolloutPercentage) {
      // Si hay variantes, elegir una basada en el hash
      if (flag.variants && flag.variants.length > 0) {
        const variantIndex = hash % flag.variants.length
        const variant = flag.variants[variantIndex]
        return variant !== undefined ? variant : flag.defaultValue
      }
      return typeof flag.defaultValue === 'boolean' ? true : flag.defaultValue
    }
    return typeof flag.defaultValue === 'boolean' ? false : flag.defaultValue
  }

  return flag.defaultValue
}

// ============================================================================
// React Context
// ============================================================================

interface FeatureFlagsContextValue {
  isEnabled: (flagKey: string) => boolean
  getValue: <T extends FeatureFlagValue>(flagKey: string) => T
  getAllFlags: () => Record<string, FeatureFlagValue>
  context: FeatureFlagContext
}

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | null>(null)

export function FeatureFlagsProvider({
  children,
  context,
  overrides,
  customFlags,
}: {
  children: ReactNode
  context: FeatureFlagContext
  overrides?: Record<string, FeatureFlagValue>
  customFlags?: Record<string, FeatureFlag>
}) {
  const allFlags = useMemo(
    () => ({
      ...FEATURE_FLAGS,
      ...customFlags,
    }),
    [customFlags],
  )

  const evaluatedFlags = useMemo(() => {
    const result: Record<string, FeatureFlagValue> = {}
    for (const [key, flag] of Object.entries(allFlags)) {
      result[key] = evaluateFlag(flag, context, overrides)
    }
    return result
  }, [allFlags, context, overrides])

  const value = useMemo<FeatureFlagsContextValue>(
    () => ({
      isEnabled: (flagKey: string) => {
        const val = evaluatedFlags[flagKey]
        if (typeof val === 'boolean') return val
        return Boolean(val)
      },
      getValue: <T extends FeatureFlagValue>(flagKey: string) => {
        const flagValue = evaluatedFlags[flagKey]
        const defaultVal = allFlags[flagKey]?.defaultValue
        return (flagValue !== undefined ? flagValue : (defaultVal ?? false)) as T
      },
      getAllFlags: () => evaluatedFlags,
      context,
    }),
    [evaluatedFlags, allFlags, context],
  )

  return <FeatureFlagsContext.Provider value={value}>{children}</FeatureFlagsContext.Provider>
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook para acceder al contexto de feature flags
 */
export function useFeatureFlags() {
  const ctx = useContext(FeatureFlagsContext)
  if (!ctx) {
    throw new Error('useFeatureFlags debe usarse dentro de FeatureFlagsProvider')
  }
  return ctx
}

/**
 * Hook para verificar si un feature flag está habilitado
 */
export function useFeatureFlag(flagKey: string): boolean {
  const { isEnabled } = useFeatureFlags()
  return isEnabled(flagKey)
}

/**
 * Hook para obtener el valor de un feature flag
 */
export function useFeatureFlagValue<T extends FeatureFlagValue>(flagKey: string): T {
  const { getValue } = useFeatureFlags()
  return getValue<T>(flagKey)
}

// ============================================================================
// Server-side utilities
// ============================================================================

/**
 * Evalúa flags para server-side rendering
 */
export function getServerSideFlags(
  context: FeatureFlagContext,
  overrides?: Record<string, FeatureFlagValue>,
): Record<string, FeatureFlagValue> {
  const result: Record<string, FeatureFlagValue> = {}
  for (const [key, flag] of Object.entries(FEATURE_FLAGS)) {
    const evaluated = evaluateFlag(flag, context, overrides)
    result[key] = evaluated !== undefined ? evaluated : flag.defaultValue
  }
  return result
}

/**
 * Middleware helper para feature flags
 */
export function createFeatureFlagMiddleware(defaultContext: Partial<FeatureFlagContext>) {
  return function middleware(
    request: Request,
    context?: Partial<FeatureFlagContext>,
  ): Record<string, FeatureFlagValue> {
    const mergedContext: FeatureFlagContext = {
      environment: 'production',
      ...defaultContext,
      ...context,
    }
    return getServerSideFlags(mergedContext)
  }
}

// ============================================================================
// A/B Testing Utilities
// ============================================================================

export interface ABTestVariant<T> {
  name: string
  value: T
  weight: number
}

/**
 * Selecciona una variante para un A/B test
 */
export function selectABVariant<T>(
  testId: string,
  variants: ABTestVariant<T>[],
  userId: string,
): ABTestVariant<T> {
  // Si no hay variants, lanzar error (no debería pasar en uso normal)
  if (variants.length === 0) {
    throw new Error('selectABVariant requires at least one variant')
  }

  const hash = hashString(`${testId}:${userId}`)
  const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0)
  const threshold = hash % totalWeight

  let cumulative = 0
  for (const variant of variants) {
    cumulative += variant.weight
    if (threshold < cumulative) {
      return variant
    }
  }

  // Siempre retornar el último como fallback
  return variants[variants.length - 1] as ABTestVariant<T>
}

/**
 * Hook para A/B testing
 */
export function useABTest<T>(
  testId: string,
  variants: ABTestVariant<T>[],
): { variant: ABTestVariant<T>; value: T } {
  const { context } = useFeatureFlags()
  const userId = context.userId || context.sessionId || 'anonymous'

  const variant = useMemo(
    () => selectABVariant(testId, variants, userId),
    [testId, variants, userId],
  )

  return { variant, value: variant.value }
}

// ============================================================================
// Development Tools
// ============================================================================

/**
 * Panel de debug para feature flags (solo desarrollo)
 */
export function FeatureFlagsDebugPanel() {
  if (process.env.NODE_ENV === 'production') return null

  const { getAllFlags, context } = useFeatureFlags()
  const flags = getAllFlags()

  return (
    <div className="fixed right-4 bottom-4 z-50 max-h-96 max-w-md overflow-auto rounded-xl border border-white/10 bg-gray-900/95 p-4 font-mono text-xs backdrop-blur-xl">
      <h3 className="mb-2 font-bold text-violet-400">🚩 Feature Flags</h3>
      <div className="mb-3 text-gray-400">
        Env: {context.environment} | User: {context.userId || 'anon'}
      </div>
      <div className="space-y-1">
        {Object.entries(flags).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-300">{key}:</span>
            <span
              className={
                typeof value === 'boolean'
                  ? value
                    ? 'text-green-400'
                    : 'text-red-400'
                  : 'text-yellow-400'
              }
            >
              {String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
