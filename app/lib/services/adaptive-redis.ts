/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔴 CHRONOS INFINITY 2026 — ADAPTIVE REDIS SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Servicio de Cache y Rate Limiting adaptativo:
 * - Usa Upstash Redis si está configurado
 * - Fallback a in-memory cache si no está disponible
 * - Funciona en producción sin Upstash
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type RateLimitType = 'default' | 'api' | 'auth' | 'ai' | 'write' | 'read' | 'webhook' | 'search'

export interface CacheOptions {
  ttl?: number
  tags?: string[]
}

export interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════

const RATE_LIMIT_CONFIG: Record<RateLimitType, { requests: number; windowMs: number }> = {
  default: { requests: 100, windowMs: 60000 },
  api: { requests: 200, windowMs: 60000 },
  auth: { requests: 10, windowMs: 60000 },
  ai: { requests: 30, windowMs: 60000 },
  write: { requests: 50, windowMs: 60000 },
  read: { requests: 300, windowMs: 60000 },
  webhook: { requests: 500, windowMs: 60000 },
  search: { requests: 100, windowMs: 60000 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// IN-MEMORY FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════════════

interface MemoryCacheEntry {
  value: unknown
  expires: number
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

const memoryCache = new Map<string, MemoryCacheEntry>()
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of memoryCache) {
      if (entry.expires < now) memoryCache.delete(key)
    }
    for (const [key, entry] of rateLimitStore) {
      if (entry.resetTime < now) rateLimitStore.delete(key)
    }
  }, 300000)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UPSTASH CLIENT (LAZY LOADED)
// ═══════════════════════════════════════════════════════════════════════════════════════

let upstashRedis: any = null
let upstashRatelimit: any = null
let upstashConfigured = false

async function initUpstash() {
  if (upstashConfigured) return upstashRedis !== null
  upstashConfigured = true

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token || url.startsWith('YOUR_')) {
    console.log('⚠️ Upstash Redis not configured, using in-memory fallback')
    return false
  }

  try {
    const { Redis } = await import('@upstash/redis')
    const { Ratelimit } = await import('@upstash/ratelimit')

    upstashRedis = new Redis({ url, token })
    upstashRatelimit = Ratelimit
    console.log('✅ Upstash Redis connected')
    return true
  } catch (error) {
    console.warn('⚠️ Failed to initialize Upstash Redis:', error)
    return false
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ADAPTIVE RATE LIMITER
// ═══════════════════════════════════════════════════════════════════════════════════════

const rateLimiters = new Map<RateLimitType, any>()

export async function getRateLimiter(type: RateLimitType = 'default') {
  const hasUpstash = await initUpstash()

  if (hasUpstash && upstashRatelimit) {
    if (!rateLimiters.has(type)) {
      const config = RATE_LIMIT_CONFIG[type]
      rateLimiters.set(type, new upstashRatelimit({
        redis: upstashRedis,
        limiter: upstashRatelimit.slidingWindow(config.requests, `${config.windowMs}ms`),
        prefix: `chronos:ratelimit:${type}`,
      }))
    }
    return rateLimiters.get(type)
  }

  // In-memory fallback rate limiter
  return {
    async limit(identifier: string): Promise<RateLimitResult> {
      const config = RATE_LIMIT_CONFIG[type]
      const key = `${type}:${identifier}`
      const now = Date.now()

      let entry = rateLimitStore.get(key)

      if (!entry || entry.resetTime < now) {
        entry = { count: 0, resetTime: now + config.windowMs }
        rateLimitStore.set(key, entry)
      }

      entry.count++

      return {
        success: entry.count <= config.requests,
        limit: config.requests,
        remaining: Math.max(0, config.requests - entry.count),
        reset: entry.resetTime,
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ADAPTIVE CACHE
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function cacheGet<T>(key: string): Promise<T | null> {
  const hasUpstash = await initUpstash()

  if (hasUpstash && upstashRedis) {
    try {
      return await upstashRedis.get(`chronos:cache:${key}`)
    } catch {
      // Fallback to memory
    }
  }

  const entry = memoryCache.get(key)
  if (entry && entry.expires > Date.now()) {
    return entry.value as T
  }
  memoryCache.delete(key)
  return null
}

export async function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const ttl = options.ttl ?? 300 // 5 minutes default
  const hasUpstash = await initUpstash()

  if (hasUpstash && upstashRedis) {
    try {
      await upstashRedis.setex(`chronos:cache:${key}`, ttl, JSON.stringify(value))
      return
    } catch {
      // Fallback to memory
    }
  }

  memoryCache.set(key, {
    value,
    expires: Date.now() + (ttl * 1000),
  })
}

export async function cacheDelete(key: string): Promise<void> {
  const hasUpstash = await initUpstash()

  if (hasUpstash && upstashRedis) {
    try {
      await upstashRedis.del(`chronos:cache:${key}`)
    } catch {}
  }

  memoryCache.delete(key)
}

export async function cacheThrough<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached !== null) return cached

  const value = await fn()
  await cacheSet(key, value, options)
  return value
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'fallback'
  mode: 'upstash' | 'memory'
  latency?: number
}> {
  const start = Date.now()
  const hasUpstash = await initUpstash()

  if (hasUpstash && upstashRedis) {
    try {
      await upstashRedis.ping()
      return {
        status: 'healthy',
        mode: 'upstash',
        latency: Date.now() - start,
      }
    } catch {
      return { status: 'degraded', mode: 'memory' }
    }
  }

  return { status: 'fallback', mode: 'memory' }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const adaptiveRedis = {
  rateLimiter: getRateLimiter,
  cache: {
    get: cacheGet,
    set: cacheSet,
    delete: cacheDelete,
    through: cacheThrough,
  },
  health: healthCheck,
}

export default adaptiveRedis
