// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔴 CHRONOS INFINITY 2026 — UPSTASH REDIS SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Servicio de Redis en Edge optimizado para:
 * - Cache distribuido global
 * - Rate limiting con sliding window
 * - Session storage
 * - Real-time pub/sub
 * - Queue management
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

// ═══════════════════════════════════════════════════════════════════════════════════════
// REDIS CLIENT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════════════

let redisInstance: Redis | null = null

export function getRedis(): Redis {
  if (redisInstance) return redisInstance

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    throw new Error('❌ Upstash Redis credentials not configured')
  }

  redisInstance = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    automaticDeserialization: true,
    retry: {
      retries: 3,
      backoff: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 10000),
    },
  })

  return redisInstance
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// RATE LIMITERS — CONFIGURACIÓN POR TIPO DE ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════════════════

const rateLimiters: Record<string, Ratelimit> = {}

export type RateLimitType = 'default' | 'api' | 'auth' | 'ai' | 'write' | 'read' | 'webhook' | 'search'

const RATE_LIMIT_CONFIG: Record<RateLimitType, { requests: number; window: string }> = {
  default: { requests: 100, window: '60s' },
  api: { requests: 200, window: '60s' },
  auth: { requests: 10, window: '60s' },
  ai: { requests: 30, window: '60s' },
  write: { requests: 50, window: '60s' },
  read: { requests: 300, window: '60s' },
  webhook: { requests: 500, window: '60s' },
  search: { requests: 100, window: '60s' },
}

export function getRateLimiter(type: RateLimitType = 'default'): Ratelimit {
  if (rateLimiters[type]) return rateLimiters[type]

  const config = RATE_LIMIT_CONFIG[type]
  const redis = getRedis()

  rateLimiters[type] = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(config.requests, config.window as `${number}${'s' | 'm' | 'h' | 'd'}`),
    analytics: true,
    prefix: `chronos:ratelimit:${type}`,
    ephemeralCache: new Map(),
  })

  return rateLimiters[type]
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CACHE UTILITIES — HIGH PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface CacheOptions {
  ttl?: number // seconds
  tags?: string[]
  staleWhileRevalidate?: number
}

const CACHE_PREFIX = 'chronos:cache:'
const TAGS_PREFIX = 'chronos:tags:'

/**
 * Set value in cache with optional TTL and tags
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const redis = getRedis()
  const { ttl = 300, tags = [] } = options

  const cacheKey = CACHE_PREFIX + key
  
  // Pipeline for atomic operations
  const pipeline = redis.pipeline()
  
  // Set the value with TTL
  pipeline.setex(cacheKey, ttl, JSON.stringify(value))
  
  // Add to tag sets for invalidation
  for (const tag of tags) {
    pipeline.sadd(TAGS_PREFIX + tag, cacheKey)
    pipeline.expire(TAGS_PREFIX + tag, ttl * 2)
  }

  await pipeline.exec()
}

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis()
  const result = await redis.get<string>(CACHE_PREFIX + key)
  
  if (!result) return null
  
  try {
    return JSON.parse(result) as T
  } catch {
    return result as T
  }
}

/**
 * Delete cache entry
 */
export async function cacheDelete(key: string): Promise<void> {
  const redis = getRedis()
  await redis.del(CACHE_PREFIX + key)
}

/**
 * Invalidate all cache entries with a specific tag
 */
export async function cacheInvalidateByTag(tag: string): Promise<number> {
  const redis = getRedis()
  const tagKey = TAGS_PREFIX + tag
  
  // Get all keys with this tag
  const keys = await redis.smembers(tagKey)
  
  if (keys.length === 0) return 0

  // Delete all keys and the tag set
  const pipeline = redis.pipeline()
  for (const key of keys) {
    pipeline.del(key)
  }
  pipeline.del(tagKey)
  
  await pipeline.exec()
  return keys.length
}

/**
 * Cache-through pattern - get from cache or compute
 */
export async function cacheThrough<T>(
  key: string,
  computeFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try cache first
  const cached = await cacheGet<T>(key)
  if (cached !== null) return cached

  // Compute and cache
  const value = await computeFn()
  await cacheSet(key, value, options)
  
  return value
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SESSION MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════════════

const SESSION_PREFIX = 'chronos:session:'
const SESSION_TTL = 60 * 60 * 24 * 7 // 7 days

export interface SessionData {
  userId: string
  email?: string
  role?: string
  metadata?: Record<string, unknown>
  createdAt: number
  lastActivity: number
}

export async function sessionCreate(
  sessionId: string,
  data: Omit<SessionData, 'createdAt' | 'lastActivity'>
): Promise<void> {
  const redis = getRedis()
  const session: SessionData = {
    ...data,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  }
  
  await redis.setex(SESSION_PREFIX + sessionId, SESSION_TTL, JSON.stringify(session))
}

export async function sessionGet(sessionId: string): Promise<SessionData | null> {
  const redis = getRedis()
  const data = await redis.get<string>(SESSION_PREFIX + sessionId)
  
  if (!data) return null
  
  return JSON.parse(data) as SessionData
}

export async function sessionUpdate(
  sessionId: string,
  updates: Partial<SessionData>
): Promise<void> {
  const session = await sessionGet(sessionId)
  if (!session) return

  const updated: SessionData = {
    ...session,
    ...updates,
    lastActivity: Date.now(),
  }

  const redis = getRedis()
  await redis.setex(SESSION_PREFIX + sessionId, SESSION_TTL, JSON.stringify(updated))
}

export async function sessionDelete(sessionId: string): Promise<void> {
  const redis = getRedis()
  await redis.del(SESSION_PREFIX + sessionId)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// REAL-TIME COUNTERS & ANALYTICS
// ═══════════════════════════════════════════════════════════════════════════════════════

const COUNTER_PREFIX = 'chronos:counter:'

export async function counterIncrement(key: string, by: number = 1): Promise<number> {
  const redis = getRedis()
  return await redis.incrby(COUNTER_PREFIX + key, by)
}

export async function counterGet(key: string): Promise<number> {
  const redis = getRedis()
  const value = await redis.get<number>(COUNTER_PREFIX + key)
  return value ?? 0
}

export async function counterDecrement(key: string, by: number = 1): Promise<number> {
  const redis = getRedis()
  return await redis.decrby(COUNTER_PREFIX + key, by)
}

// Time-series counters (for analytics)
export async function timeSeriesIncrement(
  metricName: string,
  timestamp?: number
): Promise<void> {
  const redis = getRedis()
  const ts = timestamp ?? Date.now()
  const minute = Math.floor(ts / 60000) * 60000
  const hour = Math.floor(ts / 3600000) * 3600000
  const day = Math.floor(ts / 86400000) * 86400000

  const pipeline = redis.pipeline()
  
  // Per-minute (keep 1 hour)
  pipeline.incr(`chronos:ts:${metricName}:m:${minute}`)
  pipeline.expire(`chronos:ts:${metricName}:m:${minute}`, 3600)
  
  // Per-hour (keep 24 hours)
  pipeline.incr(`chronos:ts:${metricName}:h:${hour}`)
  pipeline.expire(`chronos:ts:${metricName}:h:${hour}`, 86400)
  
  // Per-day (keep 30 days)
  pipeline.incr(`chronos:ts:${metricName}:d:${day}`)
  pipeline.expire(`chronos:ts:${metricName}:d:${day}`, 2592000)

  await pipeline.exec()
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DISTRIBUTED LOCKS
// ═══════════════════════════════════════════════════════════════════════════════════════

const LOCK_PREFIX = 'chronos:lock:'

export async function acquireLock(
  resource: string,
  ttl: number = 30
): Promise<string | null> {
  const redis = getRedis()
  const lockKey = LOCK_PREFIX + resource
  const lockValue = crypto.randomUUID()

  const acquired = await redis.set(lockKey, lockValue, {
    nx: true,
    ex: ttl,
  })

  return acquired === 'OK' ? lockValue : null
}

export async function releaseLock(resource: string, lockValue: string): Promise<boolean> {
  const redis = getRedis()
  const lockKey = LOCK_PREFIX + resource
  
  // Only release if we own the lock
  const currentValue = await redis.get(lockKey)
  if (currentValue !== lockValue) return false
  
  await redis.del(lockKey)
  return true
}

export async function withLock<T>(
  resource: string,
  fn: () => Promise<T>,
  ttl: number = 30
): Promise<T | null> {
  const lockValue = await acquireLock(resource, ttl)
  if (!lockValue) return null

  try {
    return await fn()
  } finally {
    await releaseLock(resource, lockValue)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  details?: string
}> {
  const start = Date.now()
  
  try {
    const redis = getRedis()
    await redis.ping()
    const latency = Date.now() - start
    
    return {
      status: latency < 100 ? 'healthy' : 'degraded',
      latency,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const upstashRedis = {
  client: getRedis,
  rateLimiter: getRateLimiter,
  cache: {
    get: cacheGet,
    set: cacheSet,
    delete: cacheDelete,
    invalidateByTag: cacheInvalidateByTag,
    through: cacheThrough,
  },
  session: {
    create: sessionCreate,
    get: sessionGet,
    update: sessionUpdate,
    delete: sessionDelete,
  },
  counter: {
    increment: counterIncrement,
    decrement: counterDecrement,
    get: counterGet,
  },
  timeSeries: {
    increment: timeSeriesIncrement,
  },
  lock: {
    acquire: acquireLock,
    release: releaseLock,
    withLock,
  },
  health: healthCheck,
}

export default upstashRedis
