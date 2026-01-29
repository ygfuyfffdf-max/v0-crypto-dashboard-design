/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🚀 CHRONOS CACHE LAYER — Sistema de Cache Inteligente
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Capa de cache que soporta:
 * - In-memory cache (desarrollo)
 * - Redis/Upstash (producción)
 * - Stale-while-revalidate pattern
 * - TTL configurable por tipo de dato
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live en segundos
  staleWhileRevalidate?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES DE TTL (segundos)
// ═══════════════════════════════════════════════════════════════════════════════

export const CACHE_TTL = {
  SHORT: 30, // 30 segundos - datos muy dinámicos
  MEDIUM: 60 * 5, // 5 minutos - métricas del dashboard
  LONG: 60 * 30, // 30 minutos - listas de entidades
  VERY_LONG: 60 * 60, // 1 hora - configuración y catálogos
} as const

// ═══════════════════════════════════════════════════════════════════════════════
// IN-MEMORY CACHE (para desarrollo y fallback)
// ═══════════════════════════════════════════════════════════════════════════════

const memoryCache = new Map<string, CacheEntry<unknown>>()

/**
 * Limpia entradas expiradas del cache en memoria
 */
function cleanExpiredEntries(): void {
  const now = Date.now()
  for (const [key, entry] of memoryCache.entries()) {
    if (now - entry.timestamp > entry.ttl * 1000) {
      memoryCache.delete(key)
    }
  }
}

// Limpiar cache cada 5 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(cleanExpiredEntries, 5 * 60 * 1000)
}

// ═══════════════════════════════════════════════════════════════════════════════
// REDIS CLIENT (producción - lazy initialization)
// ═══════════════════════════════════════════════════════════════════════════════

const redisClient: {
  get: <T>(key: string) => Promise<T | null>
  set: <T>(key: string, value: T, options?: { ex?: number }) => Promise<void>
  del: (key: string) => Promise<void>
} | null = null

/**
 * Inicializa el cliente Redis si las credenciales están disponibles
 * Nota: Upstash Redis es opcional - si no está instalado, usa cache en memoria
 */
async function getRedisClient() {
  if (redisClient) return redisClient

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (url && token) {
    // Redis/Upstash configurado pero módulo no instalado actualmente
    // Usar cache en memoria como fallback
    logger.info('Redis configuration detected, using memory cache (Upstash not installed)')
  }

  // Siempre usar cache en memoria por ahora
  // TODO: Cuando se instale Upstash, implementar cliente Redis aquí
  return null
}

// ═══════════════════════════════════════════════════════════════════════════════
// CACHE API PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene datos del cache o ejecuta el fetcher si no hay cache válido
 *
 * @param key - Clave única del cache
 * @param fetcher - Función que obtiene los datos frescos
 * @param options - Opciones de cache (TTL, stale-while-revalidate)
 * @returns Datos del cache o frescos
 *
 * @example
 * ```typescript
 * const bancos = await getCached(
 *   'bancos:all',
 *   async () => await db.query.bancos.findMany(),
 *   { ttl: CACHE_TTL.MEDIUM }
 * )
 * ```
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {},
): Promise<T> {
  const { ttl = CACHE_TTL.MEDIUM, staleWhileRevalidate = false } = options
  const cacheKey = `chronos:${key}`
  const now = Date.now()

  // Intentar obtener de Redis primero
  const redis = await getRedisClient()
  if (redis) {
    const cached = await redis.get<T>(cacheKey)
    if (cached !== null) {
      logger.debug('Cache HIT (Redis)', { key: cacheKey })
      return cached
    }
  }

  // Fallback a memoria
  const memEntry = memoryCache.get(cacheKey) as CacheEntry<T> | undefined
  if (memEntry) {
    const isExpired = now - memEntry.timestamp > memEntry.ttl * 1000

    if (!isExpired) {
      logger.debug('Cache HIT (Memory)', { key: cacheKey })
      return memEntry.data
    }

    // Stale-while-revalidate: devolver stale y refrescar en background
    if (staleWhileRevalidate) {
      logger.debug('Cache STALE, returning and revalidating', { key: cacheKey })
      // Revalidar en background (no bloqueante)
      void refreshCache(cacheKey, fetcher, ttl)
      return memEntry.data
    }
  }

  // Cache MISS - obtener datos frescos
  logger.debug('Cache MISS', { key: cacheKey })
  const freshData = await fetcher()

  // Guardar en cache
  await setCache(cacheKey, freshData, ttl)

  return freshData
}

/**
 * Guarda datos en el cache
 */
async function setCache<T>(key: string, data: T, ttl: number): Promise<void> {
  // Guardar en memoria siempre
  memoryCache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  })

  // Guardar en Redis si está disponible
  const redis = await getRedisClient()
  if (redis) {
    await redis.set(key, data, { ex: ttl })
  }
}

/**
 * Refresca el cache en background
 */
async function refreshCache<T>(key: string, fetcher: () => Promise<T>, ttl: number): Promise<void> {
  try {
    const freshData = await fetcher()
    await setCache(key, freshData, ttl)
    logger.debug('Cache refreshed', { key })
  } catch (error) {
    logger.warn('Failed to refresh cache', { key, error })
  }
}

/**
 * Invalida una entrada del cache
 *
 * @param key - Clave del cache a invalidar
 *
 * @example
 * ```typescript
 * // Después de crear una venta
 * await invalidateCache('ventas:all')
 * await invalidateCache('dashboard:metrics')
 * ```
 */
export async function invalidateCache(key: string): Promise<void> {
  const cacheKey = `chronos:${key}`

  // Eliminar de memoria
  memoryCache.delete(cacheKey)

  // Eliminar de Redis
  const redis = await getRedisClient()
  if (redis) {
    await redis.del(cacheKey)
  }

  logger.debug('Cache invalidated', { key: cacheKey })
}

/**
 * Invalida múltiples entradas que coincidan con un patrón
 *
 * @param pattern - Patrón de prefijo (ej: 'ventas:' invalidará todas las claves que empiecen con 'chronos:ventas:')
 */
export async function invalidateCachePattern(pattern: string): Promise<void> {
  const prefix = `chronos:${pattern}`

  // Eliminar de memoria
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key)
    }
  }

  logger.debug('Cache pattern invalidated', { pattern: prefix })
}

/**
 * Limpia todo el cache
 */
export async function clearAllCache(): Promise<void> {
  memoryCache.clear()
  logger.info('All cache cleared')
}

// ═══════════════════════════════════════════════════════════════════════════════
// DECORADOR DE CACHE PARA SERVER ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Crea una versión cacheada de una función
 *
 * @example
 * ```typescript
 * const getCachedBancos = withCache(
 *   'bancos:all',
 *   async () => await db.query.bancos.findMany(),
 *   { ttl: CACHE_TTL.MEDIUM }
 * )
 * ```
 */
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {},
): () => Promise<T> {
  return () => getCached(key, fetcher, options)
}

// ═══════════════════════════════════════════════════════════════════════════════
// CACHE KEYS CENTRALIZADOS
// ═══════════════════════════════════════════════════════════════════════════════

export const CACHE_KEYS = {
  // Dashboard
  DASHBOARD_METRICS: 'dashboard:metrics',
  DASHBOARD_ACTIVITIES: 'dashboard:activities',

  // Bancos
  BANCOS_ALL: 'bancos:all',
  BANCOS_METRICS: 'bancos:metrics',
  bancoById: (id: string) => `bancos:${id}`,

  // Ventas
  VENTAS_ALL: 'ventas:all',
  VENTAS_MES: 'ventas:mes',
  ventaById: (id: string) => `ventas:${id}`,

  // Clientes
  CLIENTES_ALL: 'clientes:all',
  CLIENTES_ACTIVOS: 'clientes:activos',
  clienteById: (id: string) => `clientes:${id}`,

  // Distribuidores
  DISTRIBUIDORES_ALL: 'distribuidores:all',
  distribuidorById: (id: string) => `distribuidores:${id}`,

  // Órdenes
  ORDENES_ALL: 'ordenes:all',
  ORDENES_PENDIENTES: 'ordenes:pendientes',
  ordenById: (id: string) => `ordenes:${id}`,

  // Almacén
  ALMACEN_ALL: 'almacen:all',
  ALMACEN_STOCK: 'almacen:stock',
} as const
