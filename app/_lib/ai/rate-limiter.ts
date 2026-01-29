/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ AI RATE LIMITER — Protección contra abuso
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

interface RateLimitEntry {
  count: number
  firstRequest: number
  lastRequest: number
}

// In-memory rate limit storage (en producción usar Redis)
const rateLimitMap = new Map<string, RateLimitEntry>()

// Configuración
const RATE_LIMIT_CONFIG = {
  maxRequests: 30, // Máximo de requests por ventana
  windowMs: 60 * 1000, // Ventana de 1 minuto
  blockDurationMs: 5 * 60 * 1000, // Bloqueo de 5 minutos si excede
}

/**
 * Verifica si un usuario puede realizar una request de IA
 */
export function checkAIRateLimit(userId: string): {
  allowed: boolean
  remaining: number
  resetIn: number
} {
  const now = Date.now()
  const entry = rateLimitMap.get(userId)

  // Si no hay entrada, crear una nueva
  if (!entry) {
    rateLimitMap.set(userId, {
      count: 1,
      firstRequest: now,
      lastRequest: now,
    })
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetIn: RATE_LIMIT_CONFIG.windowMs,
    }
  }

  // Si la ventana expiró, resetear
  if (now - entry.firstRequest > RATE_LIMIT_CONFIG.windowMs) {
    rateLimitMap.set(userId, {
      count: 1,
      firstRequest: now,
      lastRequest: now,
    })
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.maxRequests - 1,
      resetIn: RATE_LIMIT_CONFIG.windowMs,
    }
  }

  // Verificar si excede el límite
  if (entry.count >= RATE_LIMIT_CONFIG.maxRequests) {
    const resetIn = RATE_LIMIT_CONFIG.windowMs - (now - entry.firstRequest)
    logger.warn('🚫 Rate limit alcanzado', {
      context: 'AIRateLimiter',
      data: { userId, count: entry.count, resetIn },
    })
    return {
      allowed: false,
      remaining: 0,
      resetIn,
    }
  }

  // Incrementar contador
  entry.count++
  entry.lastRequest = now
  rateLimitMap.set(userId, entry)

  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.maxRequests - entry.count,
    resetIn: RATE_LIMIT_CONFIG.windowMs - (now - entry.firstRequest),
  }
}

/**
 * Limpiar entradas expiradas (llamar periódicamente)
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now()
  let cleaned = 0

  for (const [userId, entry] of rateLimitMap.entries()) {
    if (now - entry.lastRequest > RATE_LIMIT_CONFIG.blockDurationMs) {
      rateLimitMap.delete(userId)
      cleaned++
    }
  }

  if (cleaned > 0) {
    logger.info(`🧹 Rate limiter cleanup: ${cleaned} entradas eliminadas`, {
      context: 'AIRateLimiter',
    })
  }
}

// Limpiar cada 10 minutos
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 10 * 60 * 1000)
}
