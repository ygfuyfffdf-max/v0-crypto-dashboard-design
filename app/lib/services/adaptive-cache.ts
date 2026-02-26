// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔴 CHRONOS INFINITY 2026 — ADAPTIVE CACHE SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Cache adaptativo: Usa Upstash Redis cuando está disponible, en memoria como fallback.
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import CONFIG from './config'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export interface CacheOptions {
  ttl?: number // seconds
  tags?: string[]
}

interface MemoryCacheEntry<T> {
  data: T
  expiresAt: number
  tags: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// IN-MEMORY CACHE FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════════════

const memoryCache = new Map<string, MemoryCacheEntry<unknown>>()
const tagIndex = new Map<string, Set<string>>()

// Cleanup expired entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of memoryCache.entries()) {
      if (entry.expiresAt < now) {
        memoryCache.delete(key)
        entry.tags.forEach((tag) => {
          tagIndex.get(tag)?.delete(key)
        })
      }
    }
  }, 60000) // Every minute
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UPSTASH REDIS CLIENT (LAZY LOAD)
// ═══════════════════════════════════════════════════════════════════════════════════════

let redisClient: unknown = null

async function getRedisClient() {
  if (CONFIG.CACHE_MODE !== 'redis') return null
  
  if (!redisClient) {
    try {
      const { Redis } = await import('@upstash/redis')
      redisClient = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      })
    } catch {
      console.warn('⚠️ Upstash Redis not available, using in-memory cache')
      return null
    }
  }
  
  return redisClient
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CACHE OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

const CACHE_PREFIX = 'chronos:cache:'

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const fullKey = CACHE_PREFIX + key

  // Try Redis first
  if (CONFIG.CACHE_MODE === 'redis') {
    try {
      const redis = await getRedisClient()
      if (redis) {
        const value = await (redis as import('@upstash/redis').Redis).get<T>(fullKey)
        return value
      }
    } catch (error) {
      console.warn('⚠️ Redis get failed:', error)
    }
  }

  // Fallback to memory
  const entry = memoryCache.get(fullKey) as MemoryCacheEntry<T> | undefined
  if (entry) {
    if (entry.expiresAt > Date.now()) {
      return entry.data
    }
    memoryCache.delete(fullKey)
  }

  return null
}

/**
 * Set value in cache
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const { ttl = 300, tags = [] } = options
  const fullKey = CACHE_PREFIX + key

  // Try Redis first
  if (CONFIG.CACHE_MODE === 'redis') {
    try {
      const redis = await getRedisClient()
      if (redis) {
        await (redis as import('@upstash/redis').Redis).setex(fullKey, ttl, JSON.stringify(value))
        
        // Index by tags
        for (const tag of tags) {
          await (redis as import('@upstash/redis').Redis).sadd(`chronos:tags:${tag}`, fullKey)
          await (redis as import('@upstash/redis').Redis).expire(`chronos:tags:${tag}`, ttl * 2)
        }
        return
      }
    } catch (error) {
      console.warn('⚠️ Redis set failed:', error)
    }
  }

  // Fallback to memory
  memoryCache.set(fullKey, {
    data: value,
    expiresAt: Date.now() + ttl * 1000,
    tags,
  })

  // Index by tags
  for (const tag of tags) {
    if (!tagIndex.has(tag)) {
      tagIndex.set(tag, new Set())
    }
    tagIndex.get(tag)!.add(fullKey)
  }
}

/**
 * Delete from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  const fullKey = CACHE_PREFIX + key

  // Try Redis first
  if (CONFIG.CACHE_MODE === 'redis') {
    try {
      const redis = await getRedisClient()
      if (redis) {
        await (redis as import('@upstash/redis').Redis).del(fullKey)
        return
      }
    } catch (error) {
      console.warn('⚠️ Redis delete failed:', error)
    }
  }

  // Fallback to memory
  const entry = memoryCache.get(fullKey)
  if (entry) {
    ;(entry as MemoryCacheEntry<unknown>).tags.forEach((tag) => {
      tagIndex.get(tag)?.delete(fullKey)
    })
    memoryCache.delete(fullKey)
  }
}

/**
 * Invalidate by tag
 */
export async function cacheInvalidateTag(tag: string): Promise<number> {
  let count = 0

  // Try Redis first
  if (CONFIG.CACHE_MODE === 'redis') {
    try {
      const redis = await getRedisClient()
      if (redis) {
        const keys = await (redis as import('@upstash/redis').Redis).smembers(`chronos:tags:${tag}`)
        if (keys.length > 0) {
          await (redis as import('@upstash/redis').Redis).del(...keys)
          count = keys.length
        }
        await (redis as import('@upstash/redis').Redis).del(`chronos:tags:${tag}`)
        return count
      }
    } catch (error) {
      console.warn('⚠️ Redis invalidate failed:', error)
    }
  }

  // Fallback to memory
  const keys = tagIndex.get(tag)
  if (keys) {
    keys.forEach((key) => {
      memoryCache.delete(key)
      count++
    })
    tagIndex.delete(tag)
  }

  return count
}

/**
 * Cache-through pattern
 */
export async function cacheThrough<T>(
  key: string,
  computeFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached !== null) return cached

  const value = await computeFn()
  await cacheSet(key, value, options)
  
  return value
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// RATE LIMITING (Adaptive)
// ═══════════════════════════════════════════════════════════════════════════════════════

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export async function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): Promise<{ success: boolean; remaining: number; reset: number }> {
  // Try Upstash Ratelimit first
  if (CONFIG.CACHE_MODE === 'redis') {
    try {
      const { Ratelimit } = await import('@upstash/ratelimit')
      const redis = await getRedisClient()
      
      if (redis) {
        const ratelimit = new Ratelimit({
          redis: redis as import('@upstash/redis').Redis,
          limiter: Ratelimit.slidingWindow(limit, `${windowMs}ms`),
          analytics: true,
          prefix: 'chronos:ratelimit',
        })

        const result = await ratelimit.limit(identifier)
        return {
          success: result.success,
          remaining: result.remaining,
          reset: result.reset,
        }
      }
    } catch (error) {
      console.warn('⚠️ Upstash ratelimit failed:', error)
    }
  }

  // Fallback to in-memory rate limiting
  const now = Date.now()
  const key = `ratelimit:${identifier}`
  let entry = rateLimitMap.get(key)

  if (!entry || entry.resetAt < now) {
    entry = { count: 0, resetAt: now + windowMs }
    rateLimitMap.set(key, entry)
  }

  entry.count++
  const success = entry.count <= limit
  
  return {
    success,
    remaining: Math.max(0, limit - entry.count),
    reset: entry.resetAt,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const adaptiveCache = {
  get: cacheGet,
  set: cacheSet,
  delete: cacheDelete,
  invalidateTag: cacheInvalidateTag,
  through: cacheThrough,
  rateLimit: checkRateLimit,
  mode: CONFIG.CACHE_MODE,
}

export default adaptiveCache
