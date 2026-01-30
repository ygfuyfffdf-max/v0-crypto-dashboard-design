/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🚀 CHRONOS INFINITY 2026 — UNIFIED SERVICES INDEX
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Punto de entrada unificado para todos los servicios de producción:
 * - Servicios adaptativos (funcionan con o sin credenciales)
 * - Cache (Upstash Redis / In-memory)
 * - Auth (Clerk / Bypass)
 * - Search (Algolia / Fuse.js)
 * - Analytics, Realtime, Monitoring, Email, AI (cuando configurados)
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// ADAPTIVE SERVICES (Work with or without credentials)
// ═══════════════════════════════════════════════════════════════════════════════════════

export { default as CONFIG, checkServiceConfig, logServiceStatus } from './config'
export { adaptiveAuth } from './adaptive-auth'
export { adaptiveCache } from './adaptive-cache'
export { adaptiveSearch } from './adaptive-search'

export type { ChronosUser, UserRole, SessionInfo } from './adaptive-auth'
export type { CacheOptions } from './adaptive-cache'
export type { SearchableItem, SearchResult } from './adaptive-search'

// ═══════════════════════════════════════════════════════════════════════════════════════
// OPTIONAL SERVICE EXPORTS (Only when configured)
// ═══════════════════════════════════════════════════════════════════════════════════════

export { posthogAnalytics } from './posthog-analytics'
export { sentryMonitoring } from './sentry-monitoring'
export { ablyRealtime } from './ably-realtime'
export { resendEmail } from './resend-email'
export { openaiService } from './openai-service'

// ═══════════════════════════════════════════════════════════════════════════════════════
// IMPORTS FOR UNIFIED OBJECT
// ═══════════════════════════════════════════════════════════════════════════════════════

import { adaptiveAuth } from './adaptive-auth'
import { adaptiveCache } from './adaptive-cache'
import { adaptiveSearch } from './adaptive-search'
import { posthogAnalytics } from './posthog-analytics'
import { ablyRealtime } from './ably-realtime'
import { sentryMonitoring } from './sentry-monitoring'
import { resendEmail } from './resend-email'
import { openaiService } from './openai-service'
import CONFIG from './config'

// ═══════════════════════════════════════════════════════════════════════════════════════
// UNIFIED SERVICES OBJECT
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Unified services object for convenience
 */
export const services = {
  // Adaptive services (always work)
  auth: adaptiveAuth,
  cache: adaptiveCache,
  search: adaptiveSearch,

  // Optional services (when configured)
  analytics: posthogAnalytics,
  realtime: ablyRealtime,
  monitoring: sentryMonitoring,
  email: resendEmail,
  ai: openaiService,

  // Config
  config: CONFIG,
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK ALL SERVICES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface ServiceHealth {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unconfigured' | 'fallback'
  mode?: string
  details?: string
}

export interface SystemHealth {
  overall: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  services: ServiceHealth[]
}

/**
 * Check health of all services
 */
export async function healthCheckAll(): Promise<SystemHealth> {
  const results: ServiceHealth[] = []

  // Adaptive Auth
  results.push({
    name: 'Auth',
    status: CONFIG.AUTH_MODE === 'clerk' ? 'healthy' : 'fallback',
    mode: CONFIG.AUTH_MODE,
    details: CONFIG.AUTH_MODE === 'clerk' ? 'Clerk production' : 'Bypass mode',
  })

  // Adaptive Cache
  results.push({
    name: 'Cache',
    status: CONFIG.CACHE_MODE === 'redis' ? 'healthy' : 'fallback',
    mode: CONFIG.CACHE_MODE,
    details: CONFIG.CACHE_MODE === 'redis' ? 'Upstash Redis' : 'In-memory',
  })

  // Adaptive Search
  results.push({
    name: 'Search',
    status: CONFIG.SEARCH_MODE === 'algolia' ? 'healthy' : 'fallback',
    mode: CONFIG.SEARCH_MODE,
    details: CONFIG.SEARCH_MODE === 'algolia' ? 'Algolia' : 'Fuse.js local',
  })

  // PostHog
  results.push({
    name: 'Analytics',
    status: CONFIG.FEATURES.analytics ? 'healthy' : 'unconfigured',
    details: CONFIG.FEATURES.analytics ? 'PostHog active' : 'Disabled',
  })

  // Ably
  results.push({
    name: 'Realtime',
    status: CONFIG.REALTIME_MODE === 'ably' ? 'healthy' : 'fallback',
    mode: CONFIG.REALTIME_MODE,
    details: CONFIG.REALTIME_MODE === 'ably' ? 'Ably' : 'SSE fallback',
  })

  // Sentry
  results.push({
    name: 'Monitoring',
    status: CONFIG.FEATURES.errorTracking ? 'healthy' : 'unconfigured',
    details: CONFIG.FEATURES.errorTracking ? 'Sentry active' : 'Disabled',
  })

  // Resend
  results.push({
    name: 'Email',
    status: CONFIG.FEATURES.email ? 'healthy' : 'unconfigured',
    details: CONFIG.FEATURES.email ? 'Resend active' : 'Disabled',
  })

  // OpenAI
  results.push({
    name: 'AI',
    status: CONFIG.FEATURES.ai ? 'healthy' : 'unconfigured',
    details: CONFIG.FEATURES.ai ? 'OpenAI active' : 'Disabled',
  })

  // Turso Database
  const tursoConfigured = !!process.env.TURSO_DATABASE_URL?.includes('turso.io')
  results.push({
    name: 'Database',
    status: tursoConfigured ? 'healthy' : 'unconfigured',
    details: tursoConfigured ? 'Turso SQLite' : 'Not configured',
  })

  // Calculate overall status
  const healthyCount = results.filter((r) => r.status === 'healthy').length
  const fallbackCount = results.filter((r) => r.status === 'fallback').length
  const unhealthyCount = results.filter((r) => r.status === 'unhealthy').length

  let overall: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
  if (unhealthyCount > 0) {
    overall = 'unhealthy'
  } else if (fallbackCount > 2 || healthyCount < 5) {
    overall = 'degraded'
  }

  return {
    overall,
    timestamp: new Date().toISOString(),
    services: results,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SERVICE INITIALIZATION (Safe - no throws)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Initialize all services (call on app startup)
 */
export async function initializeServices(): Promise<void> {
  // Log service status in development
  if (process.env.NODE_ENV !== 'production') {
    const { logServiceStatus } = await import('./config')
    logServiceStatus()
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Gracefully shutdown all services
 */
export async function shutdownServices(): Promise<void> {
  try {
    // Flush analytics if configured
    if (CONFIG.FEATURES.analytics) {
      await posthogAnalytics.flush()
      await posthogAnalytics.shutdown()
    }

    // Flush Sentry if configured
    if (CONFIG.FEATURES.errorTracking) {
      await sentryMonitoring.flush()
    }
  } catch {
    // Silent fail on shutdown
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════

export default services
