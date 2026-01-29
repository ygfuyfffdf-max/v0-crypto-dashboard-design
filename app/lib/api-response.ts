/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🌐 CHRONOS INFINITY 2026 — UTILIDAD DE RESPUESTAS API ESTÁNDAR
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sistema unificado para todas las respuestas de API Routes.
 * Garantiza formato consistente en toda la aplicación.
 *
 * @version 1.0.0 - IY SUPREME EDITION
 */

import { logger } from '@/app/lib/utils/logger'
import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: ApiMeta
}

export interface ApiError {
  code: ErrorCode
  message: string
  details?: unknown
  stack?: string // Solo en desarrollo
}

export interface ApiMeta {
  timestamp: string
  total?: number
  page?: number
  limit?: number
  duration?: number
  version?: string
}

// ═══════════════════════════════════════════════════════════════════════════
// CÓDIGOS DE ERROR ESTÁNDAR
// ═══════════════════════════════════════════════════════════════════════════

export const ERROR_CODES = {
  // Database (1xxx)
  DATABASE_ERROR: 'DATABASE_ERROR',
  CONNECTION_FAILED: 'CONNECTION_FAILED',
  QUERY_FAILED: 'QUERY_FAILED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',

  // Validación (2xxx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Negocio (3xxx)
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  INSUFFICIENT_CAPITAL: 'INSUFFICIENT_CAPITAL',
  INVALID_BANK: 'INVALID_BANK',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',

  // Autenticación (4xxx)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Recursos (5xxx)
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Sistema (9xxx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

// ═══════════════════════════════════════════════════════════════════════════
// MAPEO DE CÓDIGOS A STATUS HTTP
// ═══════════════════════════════════════════════════════════════════════════

const ERROR_STATUS_MAP: Record<ErrorCode, number> = {
  // Database
  DATABASE_ERROR: 500,
  CONNECTION_FAILED: 503,
  QUERY_FAILED: 500,
  TRANSACTION_FAILED: 500,

  // Validación
  VALIDATION_ERROR: 400,
  INVALID_INPUT: 400,
  MISSING_REQUIRED_FIELD: 400,
  INVALID_FORMAT: 400,

  // Negocio
  INSUFFICIENT_STOCK: 400,
  INSUFFICIENT_CAPITAL: 400,
  INVALID_BANK: 400,
  CALCULATION_ERROR: 500,
  BUSINESS_RULE_VIOLATION: 400,

  // Autenticación
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  INVALID_TOKEN: 401,
  SESSION_EXPIRED: 401,

  // Recursos
  NOT_FOUND: 404,
  ALREADY_EXISTS: 409,
  CONFLICT: 409,

  // Sistema
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  TIMEOUT: 504,
  RATE_LIMIT_EXCEEDED: 429,
}

// ═══════════════════════════════════════════════════════════════════════════
// HEADERS DE SEGURIDAD ESTÁNDAR
// ═══════════════════════════════════════════════════════════════════════════

export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES DE RESPUESTA
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Respuesta exitosa estándar
 */
export function apiSuccess<T>(data: T, meta?: Partial<ApiMeta>): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ...meta,
    },
  }

  return NextResponse.json(response, {
    headers: {
      ...SECURITY_HEADERS,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Respuesta de error estándar
 */
export function apiError(
  code: ErrorCode,
  message: string,
  details?: unknown,
  context?: string,
): NextResponse<ApiResponse<never>> {
  const status = ERROR_STATUS_MAP[code] || 500
  const isDevelopment = process.env.NODE_ENV === 'development'

  // Log del error
  logger.error(`API Error [${code}]: ${message}`, new Error(message), {
    context: context || 'API',
    code,
    details,
  })

  const error: ApiError = {
    code,
    message,
    details: isDevelopment ? details : undefined,
  }

  const response: ApiResponse<never> = {
    success: false,
    error,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  }

  return NextResponse.json(response, {
    status,
    headers: {
      ...SECURITY_HEADERS,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Respuesta de error desde excepción
 */
export function apiErrorFromException(
  error: unknown,
  context: string,
  fallbackCode: ErrorCode = ERROR_CODES.INTERNAL_ERROR,
): NextResponse<ApiResponse<never>> {
  if (error instanceof Error) {
    return apiError(fallbackCode, error.message, error.stack, context)
  }

  return apiError(fallbackCode, String(error), undefined, context)
}

/**
 * Respuesta de validación fallida (Zod)
 */
export function apiValidationError(
  errors: Array<{ path: string; message: string }>,
): NextResponse<ApiResponse<never>> {
  return apiError(
    ERROR_CODES.VALIDATION_ERROR,
    'Error de validación de datos',
    { errors },
    'Validation',
  )
}

/**
 * Respuesta de recurso no encontrado
 */
export function apiNotFound(resource: string): NextResponse<ApiResponse<never>> {
  return apiError(ERROR_CODES.NOT_FOUND, `${resource} no encontrado`, undefined, 'API')
}

/**
 * Respuesta de no autorizado
 */
export function apiUnauthorized(message = 'No autorizado'): NextResponse<ApiResponse<never>> {
  return apiError(ERROR_CODES.UNAUTHORIZED, message, undefined, 'Auth')
}

/**
 * Respuesta de rate limit excedido
 */
export function apiRateLimitExceeded(): NextResponse<ApiResponse<never>> {
  return apiError(
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    'Demasiadas solicitudes. Intenta de nuevo más tarde.',
    undefined,
    'RateLimit',
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// WRAPPER PARA HANDLERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Wrapper para handlers de API que maneja errores automáticamente
 */
export function withErrorHandling<T>(
  handler: () => Promise<T>,
  context: string,
): Promise<NextResponse<ApiResponse<T>>> {
  return handler()
    .then((data) => apiSuccess(data))
    .catch((error) => apiErrorFromException(error, context))
}

/**
 * Wrapper con medición de tiempo
 */
export async function withTiming<T>(
  handler: () => Promise<T>,
  context: string,
): Promise<{ data: T; duration: number }> {
  const startTime = Date.now()

  try {
    const data = await handler()
    const duration = Date.now() - startTime

    logger.info(`${context} completado`, { context, duration })

    return { data, duration }
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(`${context} falló`, error as Error, { context, duration })
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS DE CACHE
// ═══════════════════════════════════════════════════════════════════════════

export interface CacheConfig {
  ttl?: number // Segundos
  staleWhileRevalidate?: number // Segundos
  public?: boolean
}

/**
 * Generar headers de cache
 */
export function getCacheHeaders(config?: CacheConfig): Record<string, string> {
  if (!config || config.ttl === 0) {
    return {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    }
  }

  const { ttl = 60, staleWhileRevalidate = 120, public: isPublic = true } = config

  return {
    'Cache-Control': `${isPublic ? 'public' : 'private'}, s-maxage=${ttl}, stale-while-revalidate=${staleWhileRevalidate}`,
  }
}

/**
 * Respuesta con cache
 */
export function apiSuccessWithCache<T>(
  data: T,
  cacheConfig: CacheConfig,
  meta?: Partial<ApiMeta>,
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      ...meta,
    },
  }

  return NextResponse.json(response, {
    headers: {
      ...SECURITY_HEADERS,
      ...getCacheHeaders(cacheConfig),
      'Content-Type': 'application/json',
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  apiError as error,
  apiErrorFromException as errorFromException,
  apiNotFound as notFound,
  apiRateLimitExceeded as rateLimitExceeded,
  apiSuccess as success,
  apiSuccessWithCache as successWithCache,
  apiUnauthorized as unauthorized,
  apiValidationError as validationError,
}
