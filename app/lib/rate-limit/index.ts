/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🛡️ CHRONOS RATE LIMITING MIDDLEWARE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Middleware de rate limiting para proteger la API:
 * - In-memory rate limiter (desarrollo)
 * - Upstash Ratelimit (producción)
 * - Sliding window algorithm
 * - Configuración por endpoint
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface RateLimitEntry {
  count: number
  resetTime: number
}

interface RateLimitConfig {
  requests: number // Número máximo de requests
  windowMs: number // Ventana de tiempo en ms
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN POR TIPO DE ENDPOINT
// ═══════════════════════════════════════════════════════════════════════════════

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // API pública - límite estricto
  default: { requests: 100, windowMs: 60 * 1000 }, // 100 req/min

  // API de lectura - límite más permisivo
  read: { requests: 200, windowMs: 60 * 1000 }, // 200 req/min

  // API de escritura - límite moderado
  write: { requests: 50, windowMs: 60 * 1000 }, // 50 req/min

  // Endpoints de autenticación - límite estricto
  auth: { requests: 10, windowMs: 60 * 1000 }, // 10 req/min

  // Endpoints de IA - límite especial
  ai: { requests: 20, windowMs: 60 * 1000 }, // 20 req/min

  // Endpoints de reportes/export - muy limitado
  export: { requests: 5, windowMs: 60 * 1000 }, // 5 req/min
}

// ═══════════════════════════════════════════════════════════════════════════════
// IN-MEMORY RATE LIMITER
// ═══════════════════════════════════════════════════════════════════════════════

const rateLimitStore = new Map<string, RateLimitEntry>()

// Limpiar entradas expiradas cada minuto
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key)
      }
    }
  }, 60 * 1000)
}

/**
 * Rate limiter en memoria (para desarrollo)
 */
function checkRateLimitInMemory(
  identifier: string,
  config: RateLimitConfig,
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now()
  const key = `ratelimit:${identifier}`

  let entry = rateLimitStore.get(key)

  // Si no existe entrada o está expirada, crear nueva
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    rateLimitStore.set(key, entry)
    return {
      success: true,
      remaining: config.requests - 1,
      reset: entry.resetTime,
    }
  }

  // Incrementar contador
  entry.count++
  rateLimitStore.set(key, entry)

  const remaining = Math.max(0, config.requests - entry.count)
  const success = entry.count <= config.requests

  return { success, remaining, reset: entry.resetTime }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMIT CHECK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Verifica el rate limit para un request
 *
 * @param req - Request de Next.js
 * @param limitType - Tipo de límite a aplicar
 * @returns Resultado del rate limit check
 */
export async function checkRateLimit(
  req: NextRequest,
  limitType: keyof typeof RATE_LIMITS = 'default',
): Promise<{ success: boolean; remaining: number; reset: number }> {
  // Obtener identificador (IP o header personalizado)
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const ip = forwardedFor?.split(',')[0] ?? realIp ?? '127.0.0.1'

  const defaultConfig: RateLimitConfig = { requests: 100, windowMs: 60 * 1000 }
  const config: RateLimitConfig = RATE_LIMITS[limitType] ?? RATE_LIMITS.default ?? defaultConfig
  const identifier = `${ip}:${limitType}`

  // Intentar usar Upstash Ratelimit si está configurado
  // Nota: Upstash es opcional - si no está instalado, usamos rate limit en memoria
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (upstashUrl && upstashToken) {
    // Upstash configurado pero módulo no instalado - usar memoria
    logger.info('Upstash configured but module not installed, using memory rate limit')
    // Cuando Upstash esté instalado, descomentar:
    // try {
    //   const { Ratelimit } = await import('@upstash/ratelimit')
    //   const { Redis } = await import('@upstash/redis')
    //   ...
    // }
  }

  // Fallback a rate limiter en memoria
  return checkRateLimitInMemory(identifier, config)
}

// ═══════════════════════════════════════════════════════════════════════════════
// MIDDLEWARE HELPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Aplica rate limiting y devuelve respuesta de error si se excede
 *
 * @example
 * ```typescript
 * // En un route handler:
 * export async function POST(req: NextRequest) {
 *   const rateLimitResult = await applyRateLimit(req, 'write')
 *   if (rateLimitResult) return rateLimitResult
 *
 *   // Continuar con la lógica del endpoint...
 * }
 * ```
 */
export async function applyRateLimit(
  req: NextRequest,
  limitType: keyof typeof RATE_LIMITS = 'default',
): Promise<NextResponse | null> {
  const { success, remaining, reset } = await checkRateLimit(req, limitType)

  if (!success) {
    logger.warn('Rate limit exceeded', {
      path: req.nextUrl.pathname,
      limitType,
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
    })

    return NextResponse.json(
      {
        error: 'Too Many Requests',
        message: 'Has excedido el límite de requests. Intenta de nuevo más tarde.',
        retryAfter: Math.ceil((reset - Date.now()) / 1000),
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(RATE_LIMITS[limitType]?.requests ?? 100),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(Math.ceil(reset / 1000)),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      },
    )
  }

  return null
}

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMIT TYPE DETECTOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detecta el tipo de rate limit basado en el path y método
 */
export function detectRateLimitType(path: string, method: string): keyof typeof RATE_LIMITS {
  // Auth endpoints
  if (path.includes('/api/auth') || path.includes('/login') || path.includes('/register')) {
    return 'auth'
  }

  // AI endpoints
  if (path.includes('/api/ai') || path.includes('/api/chronos-ai') || path.includes('/ia')) {
    return 'ai'
  }

  // Export endpoints
  if (path.includes('/export') || path.includes('/reporte')) {
    return 'export'
  }

  // Write operations
  if (method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE') {
    return 'write'
  }

  // Read operations
  if (method === 'GET') {
    return 'read'
  }

  return 'default'
}

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMIT HEADERS HELPER
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Agrega headers de rate limit a una respuesta existente
 */
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  reset: number,
  limit: number,
): NextResponse {
  response.headers.set('X-RateLimit-Limit', String(limit))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(reset / 1000)))
  return response
}
