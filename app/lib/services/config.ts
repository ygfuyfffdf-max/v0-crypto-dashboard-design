/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔧 CHRONOS INFINITY 2026 — ADAPTIVE SERVICE CONFIGURATION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de configuración adaptativa que usa servicios reales cuando están disponibles
 * y fallbacks inteligentes en caso contrario.
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

export interface ServiceStatus {
  name: string
  available: boolean
  fallback: boolean
  details?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SERVICE AVAILABILITY CHECK
// ═══════════════════════════════════════════════════════════════════════════════════════

export function checkServiceConfig(): ServiceStatus[] {
  const services: ServiceStatus[] = []

  // Clerk Auth
  const clerkConfigured = !!(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
    process.env.CLERK_SECRET_KEY?.startsWith('sk_')
  )
  services.push({
    name: 'Clerk Auth',
    available: clerkConfigured,
    fallback: !clerkConfigured,
    details: clerkConfigured ? 'Production ready' : 'Using bypass mode for development',
  })

  // Upstash Redis
  const upstashConfigured = !!(
    process.env.UPSTASH_REDIS_REST_URL?.includes('upstash.io') &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  )
  services.push({
    name: 'Upstash Redis',
    available: upstashConfigured,
    fallback: !upstashConfigured,
    details: upstashConfigured ? 'Production ready' : 'Using in-memory cache',
  })

  // Algolia Search
  const algoliaConfigured = !!(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID &&
    !process.env.NEXT_PUBLIC_ALGOLIA_APP_ID.includes('YOUR_') &&
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY
  )
  services.push({
    name: 'Algolia Search',
    available: algoliaConfigured,
    fallback: !algoliaConfigured,
    details: algoliaConfigured ? 'Production ready' : 'Using Fuse.js local search',
  })

  // PostHog Analytics
  const posthogConfigured = !!process.env.NEXT_PUBLIC_POSTHOG_KEY?.startsWith('phc_')
  services.push({
    name: 'PostHog Analytics',
    available: posthogConfigured,
    fallback: false,
    details: posthogConfigured ? 'Production ready' : 'Analytics disabled',
  })

  // Ably Realtime
  const ablyConfigured = !!process.env.ABLY_API_KEY && process.env.ABLY_API_KEY.length > 50
  services.push({
    name: 'Ably Realtime',
    available: ablyConfigured,
    fallback: !ablyConfigured,
    details: ablyConfigured ? 'Production ready' : 'Using SSE fallback',
  })

  // Sentry
  const sentryConfigured = !!process.env.SENTRY_AUTH_TOKEN?.startsWith('sntryu_')
  services.push({
    name: 'Sentry Monitoring',
    available: sentryConfigured,
    fallback: false,
    details: sentryConfigured ? 'Production ready' : 'Error tracking disabled',
  })

  // Resend Email
  const resendConfigured = !!process.env.RESEND_API_KEY?.startsWith('re_')
  services.push({
    name: 'Resend Email',
    available: resendConfigured,
    fallback: !resendConfigured,
    details: resendConfigured ? 'Production ready' : 'Email disabled',
  })

  // OpenAI
  const openaiConfigured = !!process.env.OPENAI_API_KEY?.startsWith('sk-')
  services.push({
    name: 'OpenAI',
    available: openaiConfigured,
    fallback: false,
    details: openaiConfigured ? 'Production ready' : 'AI features disabled',
  })

  // Turso Database
  const tursoConfigured = !!process.env.TURSO_DATABASE_URL?.includes('turso.io')
  services.push({
    name: 'Turso Database',
    available: tursoConfigured,
    fallback: false,
    details: tursoConfigured ? 'Production ready' : 'Database not configured',
  })

  return services
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const CONFIG = {
  // Auth mode
  AUTH_MODE: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') 
    ? 'clerk' 
    : 'bypass',

  // Cache mode
  CACHE_MODE: process.env.UPSTASH_REDIS_REST_URL?.includes('upstash.io') 
    ? 'redis' 
    : 'memory',

  // Search mode  
  SEARCH_MODE: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID && 
    !process.env.NEXT_PUBLIC_ALGOLIA_APP_ID.includes('YOUR_')
    ? 'algolia' 
    : 'fuse',

  // Realtime mode
  REALTIME_MODE: process.env.ABLY_API_KEY && process.env.ABLY_API_KEY.length > 50
    ? 'ably' 
    : 'sse',

  // Feature flags based on available services
  FEATURES: {
    analytics: !!process.env.NEXT_PUBLIC_POSTHOG_KEY?.startsWith('phc_'),
    errorTracking: !!process.env.SENTRY_AUTH_TOKEN?.startsWith('sntryu_'),
    email: !!process.env.RESEND_API_KEY?.startsWith('re_'),
    ai: !!process.env.OPENAI_API_KEY?.startsWith('sk-'),
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════
// LOGGING
// ═══════════════════════════════════════════════════════════════════════════════════════

export function logServiceStatus(): void {
  if (process.env.NODE_ENV !== 'production') {
    const services = checkServiceConfig()
    
    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('🔧 CHRONOS INFINITY — SERVICE STATUS')
    console.log('═══════════════════════════════════════════════════════════════')
    
    services.forEach((s) => {
      const icon = s.available ? '✅' : s.fallback ? '⚠️' : '❌'
      console.log(`${icon} ${s.name}: ${s.details}`)
    })
    
    const availableCount = services.filter((s) => s.available).length
    const totalCount = services.length
    
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`📊 ${availableCount}/${totalCount} services ready for production`)
    console.log('═══════════════════════════════════════════════════════════════\n')
  }
}

export default CONFIG
