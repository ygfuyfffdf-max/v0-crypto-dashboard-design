/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔒 CHRONOS INFINITY 2026 — Rate Limiter
 * ═══════════════════════════════════════════════════════════════════════════════
 * Sistema de limitación de requests para protección contra abusos
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  message: string
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  message?: string
}

// Almacén en memoria para rate limiting (en producción usar Redis)
const requestStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Configuraciones predefinidas de rate limiting
 */
export const RATE_LIMIT_CONFIGS = {
  public: {
    maxRequests: 30,
    windowMs: 60000, // 1 minuto
    message: 'Demasiadas solicitudes. Por favor, espera un momento.',
  },
  auth: {
    maxRequests: 5,
    windowMs: 900000, // 15 minutos
    message: 'Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.',
  },
  authenticated: {
    maxRequests: 200,
    windowMs: 60000, // 1 minuto
    message: 'Has excedido el límite de solicitudes. Por favor, espera.',
  },
  critical: {
    maxRequests: 3,
    windowMs: 3600000, // 1 hora
    message: 'Operación crítica limitada. Intenta más tarde.',
  },
  write: {
    maxRequests: 20,
    windowMs: 60000, // 1 minuto
    message: 'Demasiadas operaciones de escritura. Por favor, espera.',
  },
  search: {
    maxRequests: 60,
    windowMs: 60000, // 1 minuto
    message: 'Demasiadas búsquedas. Por favor, espera un momento.',
  },
} as const

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS

/**
 * Verifica si un cliente ha excedido su límite de requests
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const key = identifier
  const record = requestStore.get(key)

  // Limpiar registros expirados
  if (record && now > record.resetTime) {
    requestStore.delete(key)
  }

  const currentRecord = requestStore.get(key)

  if (!currentRecord) {
    // Primera solicitud
    requestStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }

  if (currentRecord.count >= config.maxRequests) {
    logger.warn('Rate limit excedido', {
      context: 'RateLimiter',
      data: { identifier, count: currentRecord.count, maxRequests: config.maxRequests },
    })
    return {
      success: false,
      remaining: 0,
      resetTime: currentRecord.resetTime,
      message: config.message,
    }
  }

  // Incrementar contador
  currentRecord.count++
  requestStore.set(key, currentRecord)

  return {
    success: true,
    remaining: config.maxRequests - currentRecord.count,
    resetTime: currentRecord.resetTime,
  }
}

/**
 * Aplica rate limiting usando una configuración predefinida
 */
export function rateLimit(identifier: string, type: RateLimitType = 'public'): RateLimitResult {
  const config = RATE_LIMIT_CONFIGS[type]
  return checkRateLimit(identifier, config)
}

/**
 * Resetea el rate limit para un identificador específico
 */
export function resetRateLimit(identifier: string): void {
  requestStore.delete(identifier)
}

/**
 * Obtiene el estado actual del rate limit para un identificador
 */
export function getRateLimitStatus(identifier: string): {
  count: number
  resetTime: number
} | null {
  return requestStore.get(identifier) || null
}

/**
 * Limpia todos los registros de rate limiting (para tests)
 */
export function clearAllRateLimits(): void {
  requestStore.clear()
}

/**
 * Middleware helper para Next.js API routes
 */
export function createRateLimitMiddleware(type: RateLimitType = 'public') {
  return (identifier: string) => {
    const result = rateLimit(identifier, type)

    if (!result.success) {
      return {
        error: true,
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(result.resetTime),
          'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000)),
        },
        body: { error: result.message },
      }
    }

    return {
      error: false,
      headers: {
        'X-RateLimit-Remaining': String(result.remaining),
        'X-RateLimit-Reset': String(result.resetTime),
      },
    }
  }
}
