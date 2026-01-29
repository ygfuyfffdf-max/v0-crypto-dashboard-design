/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ CHRONOS INFINITY 2026 — Input Sanitization Module
 * ═══════════════════════════════════════════════════════════════════════════════
 * Protección completa contra XSS, SQL Injection y ataques de inyección
 * Basado en OWASP Top 10:2025 y mejores prácticas de seguridad
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

/**
 * Opciones de sanitización
 */
export interface SanitizeOptions {
  /** Permitir HTML básico (solo tags seguros) */
  allowBasicHtml?: boolean
  /** Longitud máxima del string */
  maxLength?: number
  /** Permitir newlines */
  allowNewlines?: boolean
  /** Contexto para logging */
  context?: string
}

/**
 * Patrones peligrosos a detectar y bloquear
 */
const DANGEROUS_PATTERNS = {
  // Protocoles de script
  scriptProtocols: /javascript:|vbscript:|data:|file:/gi,
  // Event handlers
  eventHandlers: /on\w+\s*=/gi,
  // Tags peligrosos
  dangerousTags:
    /<(script|iframe|object|embed|form|input|button|select|textarea|link|meta|style|base|applet)[^>]*>/gi,
  // Template injection
  templateInjection: /\{\{.*\}\}|\$\{.*\}/g,
  // SQL injection patterns (more comprehensive)
  sqlInjection:
    /('--|;--|--|\/\*|\*\/|xp_|sp_|exec\s|execute\s|insert\s+into|update\s+\w+\s+set|delete\s+from|drop\s+(table|database)|union\s+(all\s+)?select|select\s+.*\s+from|or\s+['"]?\d+['"]?\s*=\s*['"]?\d)/gi,
  // Path traversal (Unix and Windows)
  pathTraversal: /\.\.[\\/]/g,
  // Null bytes (necesario detectar caracteres nulos maliciosos)
  // eslint-disable-next-line no-control-regex
  nullBytes: /\x00/g,
} as const

/**
 * Tags HTML permitidos en modo básico
 */
const ALLOWED_TAGS = ['b', 'i', 'u', 'strong', 'em', 'br', 'p', 'span']

/**
 * Sanitiza una cadena de texto para prevenir XSS
 */
export function sanitizeString(input: string, options: SanitizeOptions = {}): string {
  const {
    allowBasicHtml = false,
    maxLength = 10000,
    allowNewlines = true,
    context = 'Sanitizer',
  } = options

  if (!input || typeof input !== 'string') {
    return ''
  }

  let sanitized = input

  // 1. Truncar si excede maxLength
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength)
    logger.warn('Input truncado por exceder longitud máxima', {
      context,
      data: { originalLength: input.length, maxLength },
    })
  }

  // 2. Remover null bytes
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.nullBytes, '')

  // 3. Escape de entidades HTML
  if (!allowBasicHtml) {
    sanitized = escapeHtml(sanitized)
  } else {
    // En modo HTML básico, solo permitir tags seguros
    sanitized = sanitizeBasicHtml(sanitized)
  }

  // 4. Bloquear protocolos peligrosos
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.scriptProtocols, 'blocked:')

  // 5. Bloquear event handlers
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.eventHandlers, 'blocked=')

  // 6. Bloquear template injection
  sanitized = sanitized.replace(DANGEROUS_PATTERNS.templateInjection, '[BLOCKED]')

  // 7. Normalizar newlines
  if (!allowNewlines) {
    sanitized = sanitized.replace(/[\r\n]/g, ' ')
  }

  return sanitized.trim()
}

/**
 * Escapa caracteres HTML especiales
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;')
}

/**
 * Sanitiza HTML permitiendo solo tags básicos seguros
 */
function sanitizeBasicHtml(html: string): string {
  // Primero escapar todo
  let result = escapeHtml(html)

  // Luego restaurar los tags permitidos
  for (const tag of ALLOWED_TAGS) {
    // Abrir tag
    result = result.replace(new RegExp(`&lt;(${tag})&gt;`, 'gi'), '<$1>')
    // Cerrar tag
    result = result.replace(new RegExp(`&lt;/(${tag})&gt;`, 'gi'), '</$1>')
    // Self-closing (como <br />)
    result = result.replace(new RegExp(`&lt;(${tag})\\s*/&gt;`, 'gi'), '<$1 />')
  }

  return result
}

/**
 * Sanitiza un objeto completo recursivamente
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: SanitizeOptions = {},
): T {
  if (!obj || typeof obj !== 'object') {
    return obj
  }

  const isArray = Array.isArray(obj)
  const sanitized = (isArray ? [] : {}) as Record<string, unknown>

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value, options)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>, options)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized as T
}

/**
 * Valida y sanitiza un email
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null
  }

  // Sanitizar primero
  const sanitized = sanitizeString(email.toLowerCase().trim(), { maxLength: 254 })

  // Validar formato
  const emailRegex = /^[a-z0-9][a-z0-9._%+-]*@[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/
  if (!emailRegex.test(sanitized)) {
    return null
  }

  return sanitized
}

/**
 * Valida y sanitiza un número telefónico
 */
export function sanitizePhone(phone: string): string | null {
  if (!phone || typeof phone !== 'string') {
    return null
  }

  // Remover todo excepto dígitos y +
  const cleaned = phone.replace(/[^\d+]/g, '')

  // Validar longitud razonable (7-15 dígitos)
  const digitsOnly = cleaned.replace(/\D/g, '')
  if (digitsOnly.length < 7 || digitsOnly.length > 15) {
    return null
  }

  return cleaned
}

/**
 * Sanitiza un identificador (ID)
 */
export function sanitizeId(id: string): string | null {
  if (!id || typeof id !== 'string') {
    return null
  }

  // Solo permitir caracteres seguros para IDs
  const sanitized = id.replace(/[^a-zA-Z0-9_-]/g, '')

  if (sanitized.length === 0 || sanitized.length > 100) {
    return null
  }

  return sanitized
}

/**
 * Sanitiza un valor numérico de string
 */
export function sanitizeNumber(value: string | number): number | null {
  if (value === null || value === undefined) {
    return null
  }

  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num) || !isFinite(num)) {
    return null
  }

  return num
}

/**
 * Sanitiza un monto monetario (2 decimales)
 */
export function sanitizeMonetaryAmount(value: string | number): number | null {
  const num = sanitizeNumber(value)

  if (num === null || num < 0) {
    return null
  }

  // Redondear a 2 decimales
  return Math.round(num * 100) / 100
}

/**
 * Detecta patrones de SQL injection
 */
export function detectSqlInjection(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false
  }

  // Reset lastIndex to handle global regex state
  DANGEROUS_PATTERNS.sqlInjection.lastIndex = 0
  const hasInjection = DANGEROUS_PATTERNS.sqlInjection.test(input)

  if (hasInjection) {
    logger.warn('Potencial SQL injection detectado', {
      context: 'SQLInjection',
      data: { inputPreview: input.slice(0, 50) },
      security: {
        action: 'sql_injection_attempt',
        riskLevel: 'high',
        blocked: true,
      },
    })
  }

  return hasInjection
}

/**
 * Detecta patrones de path traversal
 */
export function detectPathTraversal(input: string): boolean {
  if (!input || typeof input !== 'string') {
    return false
  }

  // Reset lastIndex to handle global regex state
  DANGEROUS_PATTERNS.pathTraversal.lastIndex = 0
  const hasTraversal = DANGEROUS_PATTERNS.pathTraversal.test(input)

  if (hasTraversal) {
    logger.warn('Potencial path traversal detectado', {
      context: 'PathTraversal',
      data: { inputPreview: input.slice(0, 50) },
      security: {
        action: 'path_traversal_attempt',
        riskLevel: 'high',
        blocked: true,
      },
    })
  }

  return hasTraversal
}

/**
 * Sanitizador completo para inputs de formulario
 */
export function sanitizeFormInput(
  input: unknown,
  fieldType: 'text' | 'email' | 'phone' | 'number' | 'money' | 'id' = 'text',
): unknown {
  if (input === null || input === undefined) {
    return null
  }

  switch (fieldType) {
    case 'email':
      return sanitizeEmail(String(input))
    case 'phone':
      return sanitizePhone(String(input))
    case 'number':
      return sanitizeNumber(input as string | number)
    case 'money':
      return sanitizeMonetaryAmount(input as string | number)
    case 'id':
      return sanitizeId(String(input))
    case 'text':
    default:
      return sanitizeString(String(input))
  }
}

export default {
  sanitizeString,
  sanitizeObject,
  sanitizeEmail,
  sanitizePhone,
  sanitizeId,
  sanitizeNumber,
  sanitizeMonetaryAmount,
  sanitizeFormInput,
  detectSqlInjection,
  detectPathTraversal,
  escapeHtml,
}
