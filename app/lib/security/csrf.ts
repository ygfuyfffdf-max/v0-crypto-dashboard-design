/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔒 CHRONOS INFINITY 2026 — CSRF Protection
 * ═══════════════════════════════════════════════════════════════════════════════
 * Sistema de protección contra Cross-Site Request Forgery
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// Almacén de tokens (en producción usar Redis con TTL)
const tokenStore = new Map<string, { token: string; expires: number }>()

// Tiempo de expiración por defecto: 1 hora
const DEFAULT_TOKEN_EXPIRY = 3600000

/**
 * Genera un token CSRF aleatorio de 64 caracteres hexadecimales
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(32)

  // Usar crypto si está disponible, sino fallback
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array)
  } else {
    // Fallback para Node.js
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256)
    }
  }

  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Crea y almacena un token CSRF para una sesión
 */
export function createCSRFToken(sessionId: string): string {
  const token = generateCSRFToken()
  const expires = Date.now() + DEFAULT_TOKEN_EXPIRY

  tokenStore.set(sessionId, { token, expires })

  logger.debug('Token CSRF creado', {
    context: 'CSRF',
    data: { sessionId, expires: new Date(expires).toISOString() },
  })

  return token
}

/**
 * Valida un token CSRF contra el almacenado para la sesión
 */
export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = tokenStore.get(sessionId)

  if (!stored) {
    logger.warn('Token CSRF no encontrado para sesión', {
      context: 'CSRF',
      data: { sessionId },
    })
    return false
  }

  // Verificar expiración
  if (Date.now() > stored.expires) {
    tokenStore.delete(sessionId)
    logger.warn('Token CSRF expirado', {
      context: 'CSRF',
      data: { sessionId },
    })
    return false
  }

  // Comparación segura de tiempo constante
  const isValid = timingSafeEqual(stored.token, token)

  if (!isValid) {
    logger.warn('Token CSRF inválido', {
      context: 'CSRF',
      data: { sessionId },
    })
  }

  return isValid
}

/**
 * Comparación de strings en tiempo constante para prevenir timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }

  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return result === 0
}

/**
 * Invalida un token CSRF (por ejemplo, después de logout)
 */
export function invalidateCSRFToken(sessionId: string): void {
  tokenStore.delete(sessionId)
  logger.debug('Token CSRF invalidado', {
    context: 'CSRF',
    data: { sessionId },
  })
}

/**
 * Renueva un token CSRF existente
 */
export function renewCSRFToken(sessionId: string): string {
  const newToken = generateCSRFToken()
  const expires = Date.now() + DEFAULT_TOKEN_EXPIRY

  tokenStore.set(sessionId, { token: newToken, expires })

  return newToken
}

/**
 * Limpia tokens expirados (llamar periódicamente)
 */
export function cleanupExpiredTokens(): number {
  const now = Date.now()
  let cleaned = 0

  for (const [sessionId, data] of tokenStore.entries()) {
    if (now > data.expires) {
      tokenStore.delete(sessionId)
      cleaned++
    }
  }

  if (cleaned > 0) {
    logger.info('Tokens CSRF expirados limpiados', {
      context: 'CSRF',
      data: { count: cleaned },
    })
  }

  return cleaned
}

/**
 * Middleware helper para validar CSRF en API routes
 */
export function csrfMiddleware(sessionId: string, token: string | null) {
  if (!token) {
    return {
      valid: false,
      error: 'Token CSRF requerido',
      status: 403,
    }
  }

  if (!validateCSRFToken(sessionId, token)) {
    return {
      valid: false,
      error: 'Token CSRF inválido o expirado',
      status: 403,
    }
  }

  return {
    valid: true,
    error: null,
    status: 200,
  }
}

/**
 * Limpia todos los tokens (para tests)
 */
export function clearAllCSRFTokens(): void {
  tokenStore.clear()
}
