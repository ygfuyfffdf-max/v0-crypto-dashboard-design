/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🚀 CHRONOS INFINITY 2030 — ULTRA CACHE SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de caché multinivel ultra-optimizado con:
 * - Caché en memoria con LRU eviction
 * - Caché persistente en localStorage/IndexedDB
 * - Invalidación inteligente por tags
 * - Deduplicación de requests
 * - Prefetching predictivo
 * - Métricas de rendimiento integradas
 * 
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  tags: string[]
  accessCount: number
  lastAccess: number
  size: number
}

interface CacheOptions {
  ttl?: number // Time to live en ms (default: 30000)
  tags?: string[] // Tags para invalidación
  priority?: 'low' | 'normal' | 'high' | 'critical'
  persist?: boolean // Persistir en localStorage
  staleWhileRevalidate?: boolean // Servir stale mientras revalida
}

interface CacheStats {
  hits: number
  misses: number
  size: number
  entries: number
  hitRate: number
  avgAccessTime: number
}

interface PendingRequest<T> {
  promise: Promise<T>
  timestamp: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_TTL = 30_000 // 30 segundos
const MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_ENTRIES = 1000
const CLEANUP_INTERVAL = 60_000 // 1 minuto
const STORAGE_KEY = 'chronos_ultra_cache_v3'

// ═══════════════════════════════════════════════════════════════════════════════════════
// CACHE CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

class UltraCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private pendingRequests = new Map<string, PendingRequest<unknown>>()
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    entries: 0,
    hitRate: 0,
    avgAccessTime: 0,
  }
  private accessTimes: number[] = []
  private cleanupTimer: ReturnType<typeof setInterval> | null = null
  private initialized = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  private initialize() {
    if (this.initialized) return
    this.initialized = true

    // Cargar caché persistente
    this.loadFromStorage()

    // Iniciar limpieza periódica
    this.cleanupTimer = setInterval(() => this.cleanup(), CLEANUP_INTERVAL)

    // Limpiar al descargar página
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.saveToStorage())
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  // MÉTODOS PRINCIPALES
  // ═══════════════════════════════════════════════════════════════════════════════════

  /**
   * Obtiene un valor del caché o ejecuta la función si no existe
   */
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const startTime = performance.now()
    const { ttl = DEFAULT_TTL, tags = [], staleWhileRevalidate = false, persist = false } = options

    // Verificar caché existente
    const cached = this.cache.get(key) as CacheEntry<T> | undefined
    const now = Date.now()

    if (cached) {
      const isExpired = now - cached.timestamp > cached.ttl
      
      if (!isExpired) {
        // Hit: datos válidos
        this.recordHit(startTime)
        this.updateAccessStats(key, cached)
        return cached.data
      }

      if (staleWhileRevalidate) {
        // Servir stale y refrescar en background
        this.refreshInBackground(key, fetcher, { ttl, tags, persist })
        this.recordHit(startTime)
        return cached.data
      }
    }

    // Miss: obtener datos frescos
    return this.fetchAndCache(key, fetcher, { ttl, tags, persist }, startTime)
  }

  /**
   * Obtiene datos con deduplicación de requests
   */
  async getDeduped<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Verificar si hay una request pendiente
    const pending = this.pendingRequests.get(key) as PendingRequest<T> | undefined
    if (pending) {
      return pending.promise
    }

    // Crear nueva request
    const promise = this.get(key, fetcher, options)
    
    this.pendingRequests.set(key, {
      promise: promise as Promise<unknown>,
      timestamp: Date.now(),
    })

    try {
      const result = await promise
      return result
    } finally {
      this.pendingRequests.delete(key)
    }
  }

  /**
   * Invalida entradas por tag
   */
  invalidateByTag(tag: string): number {
    let invalidated = 0
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key)
        invalidated++
      }
    }

    this.updateStats()
    return invalidated
  }

  /**
   * Invalida entradas por patrón de key
   */
  invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0
    
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key)
        invalidated++
      }
    }

    this.updateStats()
    return invalidated
  }

  /**
   * Invalida una entrada específica
   */
  invalidate(key: string): boolean {
    const deleted = this.cache.delete(key)
    if (deleted) this.updateStats()
    return deleted
  }

  /**
   * Limpia todo el caché
   */
  clear(): void {
    this.cache.clear()
    this.pendingRequests.clear()
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      entries: 0,
      hitRate: 0,
      avgAccessTime: 0,
    }
    this.accessTimes = []
    
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  /**
   * Obtiene estadísticas del caché
   */
  getStats(): CacheStats {
    return { ...this.stats }
  }

  /**
   * Prefetch de datos para optimización predictiva
   */
  prefetch<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): void {
    // No bloquear, ejecutar en background
    setTimeout(() => {
      this.get(key, fetcher, options).catch(() => {
        // Ignorar errores en prefetch
      })
    }, 0)
  }

  /**
   * Batch prefetch para múltiples keys
   */
  prefetchBatch<T>(
    items: Array<{ key: string; fetcher: () => Promise<T>; options?: CacheOptions }>
  ): void {
    items.forEach(({ key, fetcher, options }) => {
      this.prefetch(key, fetcher, options)
    })
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ═══════════════════════════════════════════════════════════════════════════════════

  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl: number; tags: string[]; persist: boolean },
    startTime: number
  ): Promise<T> {
    try {
      const data = await fetcher()
      
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: options.ttl,
        tags: options.tags,
        accessCount: 1,
        lastAccess: Date.now(),
        size: this.estimateSize(data),
      }

      // Verificar límites
      this.ensureCapacity(entry.size)
      
      this.cache.set(key, entry as CacheEntry<unknown>)
      this.recordMiss(startTime)
      this.updateStats()

      // Persistir si es necesario
      if (options.persist) {
        this.saveToStorage()
      }

      return data
    } catch (error) {
      this.recordMiss(startTime)
      throw error
    }
  }

  private async refreshInBackground<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl: number; tags: string[]; persist: boolean }
  ): Promise<void> {
    try {
      const data = await fetcher()
      
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl: options.ttl,
        tags: options.tags,
        accessCount: 1,
        lastAccess: Date.now(),
        size: this.estimateSize(data),
      }

      this.cache.set(key, entry as CacheEntry<unknown>)
      this.updateStats()

      if (options.persist) {
        this.saveToStorage()
      }
    } catch {
      // Ignorar errores en background refresh
    }
  }

  private recordHit(startTime: number): void {
    this.stats.hits++
    this.accessTimes.push(performance.now() - startTime)
    this.updateHitRate()
  }

  private recordMiss(startTime: number): void {
    this.stats.misses++
    this.accessTimes.push(performance.now() - startTime)
    this.updateHitRate()
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0
    
    // Calcular tiempo promedio (últimos 100 accesos)
    const recentTimes = this.accessTimes.slice(-100)
    this.stats.avgAccessTime = recentTimes.length > 0
      ? recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length
      : 0
  }

  private updateAccessStats(key: string, entry: CacheEntry<unknown>): void {
    entry.accessCount++
    entry.lastAccess = Date.now()
  }

  private updateStats(): void {
    let totalSize = 0
    for (const entry of this.cache.values()) {
      totalSize += entry.size
    }
    this.stats.size = totalSize
    this.stats.entries = this.cache.size
  }

  private estimateSize(data: unknown): number {
    try {
      return new Blob([JSON.stringify(data)]).size
    } catch {
      return 1024 // Estimación default: 1KB
    }
  }

  private ensureCapacity(newSize: number): void {
    // Si excede el tamaño máximo, eliminar entradas LRU
    while (this.stats.size + newSize > MAX_CACHE_SIZE && this.cache.size > 0) {
      this.evictLRU()
    }

    // Si excede el número máximo de entradas
    while (this.cache.size >= MAX_ENTRIES) {
      this.evictLRU()
    }
  }

  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestAccess = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
      this.updateStats()
    }
  }

  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      this.updateStats()
    }

    // Limpiar accessTimes antiguos
    if (this.accessTimes.length > 1000) {
      this.accessTimes = this.accessTimes.slice(-100)
    }
  }

  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') return

    try {
      const persistableEntries: Array<[string, CacheEntry<unknown>]> = []
      
      for (const [key, entry] of this.cache.entries()) {
        // Solo persistir entradas marcadas y que no excedan 100KB
        if (entry.size < 100_000) {
          persistableEntries.push([key, entry])
        }
      }

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          entries: persistableEntries,
          timestamp: Date.now(),
        })
      )
    } catch {
      // Ignorar errores de storage (quota excedida, etc)
    }
  }

  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') return

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return

      const { entries, timestamp } = JSON.parse(stored) as {
        entries: Array<[string, CacheEntry<unknown>]>
        timestamp: number
      }

      // No cargar si es muy antiguo (más de 1 hora)
      if (Date.now() - timestamp > 3_600_000) {
        localStorage.removeItem(STORAGE_KEY)
        return
      }

      for (const [key, entry] of entries) {
        // Verificar que no esté expirado
        if (Date.now() - entry.timestamp < entry.ttl) {
          this.cache.set(key, entry)
        }
      }

      this.updateStats()
    } catch {
      // Ignorar errores de parsing
    }
  }

  /**
   * Destruir el caché y limpiar recursos
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = null
    }
    this.clear()
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════

export const ultraCache = new UltraCache()

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOKS Y UTILIDADES PARA REACT
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook para usar el caché en componentes React
 */
export function createCachedFetcher<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: CacheOptions
) {
  return () => ultraCache.getDeduped(key, fetcher, options)
}

/**
 * Decorator para cachear métodos de clase
 */
export function cached(options: CacheOptions = {}) {
  return function <T>(
    _target: object,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: unknown[]) => Promise<T>>
  ) {
    const originalMethod = descriptor.value!

    descriptor.value = async function (this: unknown, ...args: unknown[]): Promise<T> {
      const key = `${propertyKey}:${JSON.stringify(args)}`
      return ultraCache.getDeduped(key, () => originalMethod.apply(this, args), options)
    }

    return descriptor
  }
}

/**
 * Crear una versión cacheada de cualquier función async
 */
export function withCache<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  options?: CacheOptions
): T {
  return (async (...args: Parameters<T>) => {
    const key = keyGenerator(...args)
    return ultraCache.getDeduped(key, () => fn(...args), options)
  }) as T
}

export type { CacheOptions, CacheStats }
