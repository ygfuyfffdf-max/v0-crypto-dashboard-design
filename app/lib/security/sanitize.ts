/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ CHRONOS INFINITY 2026 — Input Sanitization Module
 * ═══════════════════════════════════════════════════════════════════════════════
 * Sanitización de inputs para prevenir XSS, SQL injection y otros ataques
 * Basado en OWASP Top 10:2025
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '../utils/logger'

/**
 * Caracteres peligrosos para HTML/JavaScript
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
}

/**
 * Patrones peligrosos de XSS
 */
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:\s*text\/html/gi,
  /vbscript:/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<form/gi,
  /expression\s*\(/gi,
  /url\s*\(/gi,
]

/**
 * Patrones de SQL Injection
 */
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)/gi,
  /(--)|(\/\*)|(\*\/)/g,
  /(;|\||&&)/g,
  /('|")\s*(OR|AND)\s*('|"|\d)/gi,
  /\b(1=1|1='1'|'1'='1')\b/gi,
]

/**
 * Patrones de Path Traversal
 */
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
  /%2e%2e%2f/gi,
  /%2e%2e\//gi,
  /\.\.%2f/gi,
  /%2e%2e%5c/gi,
]

/**
 * Resultado de sanitización
 */
export interface SanitizeResult {
  value: string
  wasModified: boolean
  threats: string[]
}

/**
 * Opciones de sanitización
 */
export interface SanitizeOptions {
  /** Escapar HTML entities */
  escapeHtml?: boolean
  /** Remover tags HTML completamente */
  stripTags?: boolean
  /** Detectar/bloquear XSS */
  preventXss?: boolean
  /** Detectar/bloquear SQL Injection */
  preventSqlInjection?: boolean
  /** Detectar/bloquear Path Traversal */
  preventPathTraversal?: boolean
  /** Trim whitespace */
  trim?: boolean
  /** Máxima longitud permitida */
  maxLength?: number
  /** Permitir solo caracteres alfanuméricos */
  alphanumericOnly?: boolean
  /** Caracteres adicionales permitidos */
  allowedChars?: string
  /** Loggear amenazas detectadas */
  logThreats?: boolean
}

const DEFAULT_OPTIONS: SanitizeOptions = {
  escapeHtml: true,
  stripTags: false,
  preventXss: true,
  preventSqlInjection: true,
  preventPathTraversal: true,
  trim: true,
  maxLength: 10000,
  alphanumericOnly: false,
  logThreats: true,
}

/**
 * Escapa caracteres HTML peligrosos
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ESCAPE_MAP[char] || char)
}

/**
 * Remueve todos los tags HTML
 */
export function stripHtmlTags(str: string): string {
  return str.replace(/<[^>]*>/g, '')
}

/**
 * Detecta patrones XSS en un string
 */
export function detectXss(str: string): string[] {
  const threats: string[] = []

  for (const pattern of XSS_PATTERNS) {
    const match = str.match(pattern)
    if (match) {
      threats.push(`XSS pattern detected: ${match[0].substring(0, 50)}`)
    }
  }

  return threats
}

/**
 * Detecta patrones de SQL Injection
 */
export function detectSqlInjection(str: string): string[] {
  const threats: string[] = []

  for (const pattern of SQL_INJECTION_PATTERNS) {
    const match = str.match(pattern)
    if (match) {
      threats.push(`SQL Injection pattern detected: ${match[0].substring(0, 30)}`)
    }
  }

  return threats
}

/**
 * Detecta patrones de Path Traversal
 */
export function detectPathTraversal(str: string): string[] {
  const threats: string[] = []

  for (const pattern of PATH_TRAVERSAL_PATTERNS) {
    const match = str.match(pattern)
    if (match) {
      threats.push(`Path Traversal pattern detected: ${match[0]}`)
    }
  }

  return threats
}

/**
 * Sanitiza un string con las opciones especificadas
 */
export function sanitizeString(input: string, options: SanitizeOptions = {}): SanitizeResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let value = input
  let wasModified = false
  const threats: string[] = []

  // Remove null bytes and other dangerous control characters
  // eslint-disable-next-line no-control-regex
  const cleanedNulls = value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
  if (cleanedNulls !== value) {
    value = cleanedNulls
    wasModified = true
    threats.push('Dangerous control characters removed')
  }

  // Trim whitespace
  if (opts.trim) {
    const trimmed = value.trim()
    if (trimmed !== value) {
      value = trimmed
      wasModified = true
    }
  }

  // Enforce max length
  if (opts.maxLength && value.length > opts.maxLength) {
    value = value.substring(0, opts.maxLength)
    wasModified = true
    threats.push(`Truncated to ${opts.maxLength} characters`)
  }

  // Detect and handle XSS
  if (opts.preventXss) {
    const xssThreats = detectXss(value)
    if (xssThreats.length > 0) {
      threats.push(...xssThreats)
      if (opts.stripTags) {
        value = stripHtmlTags(value)
        wasModified = true
      }
    }
  }

  // Detect SQL Injection
  if (opts.preventSqlInjection) {
    const sqlThreats = detectSqlInjection(value)
    threats.push(...sqlThreats)
  }

  // Detect Path Traversal
  if (opts.preventPathTraversal) {
    const pathThreats = detectPathTraversal(value)
    if (pathThreats.length > 0) {
      threats.push(...pathThreats)
      // Remove path traversal attempts
      value = value.replace(/\.\.[\/\\]/g, '')
      wasModified = true
    }
  }

  // Escape HTML if needed
  if (opts.escapeHtml && !opts.stripTags) {
    const escaped = escapeHtml(value)
    if (escaped !== value) {
      value = escaped
      wasModified = true
    }
  }

  // Alphanumeric only
  if (opts.alphanumericOnly) {
    const allowedPattern = opts.allowedChars
      ? new RegExp(
          `[^a-zA-Z0-9${opts.allowedChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`,
          'g',
        )
      : /[^a-zA-Z0-9]/g
    const cleaned = value.replace(allowedPattern, '')
    if (cleaned !== value) {
      value = cleaned
      wasModified = true
    }
  }

  // Log threats if detected
  if (opts.logThreats && threats.length > 0) {
    logger.warn('Security threats detected in input', {
      context: 'Sanitizer',
      data: {
        threats,
        inputLength: input.length,
        wasModified,
      },
    })
  }

  return { value, wasModified, threats }
}

/**
 * Sanitiza un objeto recursivamente
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  obj: T,
  options: SanitizeOptions = {},
): { value: T; threats: string[] } {
  const threats: string[] = []

  function sanitizeValue(val: unknown): unknown {
    if (typeof val === 'string') {
      const result = sanitizeString(val, { ...options, logThreats: false })
      threats.push(...result.threats)
      return result.value
    }
    if (Array.isArray(val)) {
      return val.map(sanitizeValue)
    }
    if (val !== null && typeof val === 'object') {
      const sanitized: Record<string, unknown> = {}
      for (const [key, v] of Object.entries(val)) {
        sanitized[key] = sanitizeValue(v)
      }
      return sanitized
    }
    return val
  }

  const sanitizedObj = sanitizeValue(obj) as T

  if (options.logThreats !== false && threats.length > 0) {
    logger.warn('Security threats detected in object', {
      context: 'Sanitizer',
      data: { threatCount: threats.length },
    })
  }

  return { value: sanitizedObj, threats }
}

/**
 * Valida y sanitiza un email
 */
export function sanitizeEmail(email: string): SanitizeResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const sanitized = sanitizeString(email.toLowerCase(), {
    trim: true,
    maxLength: 254,
    preventXss: true,
    preventSqlInjection: true,
    escapeHtml: false,
  })

  if (!emailRegex.test(sanitized.value)) {
    sanitized.threats.push('Invalid email format')
  }

  return sanitized
}

/**
 * Valida y sanitiza un número de teléfono
 */
export function sanitizePhone(phone: string): SanitizeResult {
  const cleaned = phone.replace(/[^\d+\-\s()]/g, '')
  const threats: string[] = []

  if (cleaned !== phone) {
    threats.push('Invalid characters removed from phone number')
  }

  if (cleaned.length < 7 || cleaned.length > 20) {
    threats.push('Phone number length invalid')
  }

  return {
    value: cleaned,
    wasModified: cleaned !== phone,
    threats,
  }
}

/**
 * Sanitiza un ID numérico
 */
export function sanitizeNumericId(id: string | number): number | null {
  const numId = typeof id === 'string' ? parseInt(id, 10) : id

  if (isNaN(numId) || numId < 0 || !Number.isInteger(numId)) {
    logger.warn('Invalid numeric ID', {
      context: 'Sanitizer',
      data: { originalValue: id },
    })
    return null
  }

  return numId
}

/**
 * Sanitiza una fecha
 */
export function sanitizeDate(dateStr: string): Date | null {
  const sanitized = sanitizeString(dateStr, {
    trim: true,
    maxLength: 30,
    alphanumericOnly: false,
    allowedChars: '-:TZ.',
  })

  const date = new Date(sanitized.value)

  if (isNaN(date.getTime())) {
    logger.warn('Invalid date string', {
      context: 'Sanitizer',
      data: { originalValue: dateStr },
    })
    return null
  }

  return date
}

/**
 * Sanitiza monto monetario
 */
export function sanitizeMonetaryAmount(amount: string | number): number | null {
  let numAmount: number

  if (typeof amount === 'string') {
    // Remove currency symbols and formatting
    const cleaned = amount.replace(/[^\d.-]/g, '')
    numAmount = parseFloat(cleaned)
  } else {
    numAmount = amount
  }

  if (isNaN(numAmount) || !isFinite(numAmount)) {
    logger.warn('Invalid monetary amount', {
      context: 'Sanitizer',
      data: { originalValue: amount },
    })
    return null
  }

  // Round to 2 decimal places
  return Math.round(numAmount * 100) / 100
}

/**
 * Crea un sanitizer con opciones predefinidas
 */
export function createSanitizer(defaultOptions: SanitizeOptions) {
  return {
    string: (input: string, options?: SanitizeOptions) =>
      sanitizeString(input, { ...defaultOptions, ...options }),
    object: <T extends Record<string, unknown>>(obj: T, options?: SanitizeOptions) =>
      sanitizeObject(obj, { ...defaultOptions, ...options }),
    email: sanitizeEmail,
    phone: sanitizePhone,
    numericId: sanitizeNumericId,
    date: sanitizeDate,
    money: sanitizeMonetaryAmount,
  }
}

/**
 * Sanitizer por defecto para la aplicación
 */
export const sanitizer = createSanitizer(DEFAULT_OPTIONS)

export default sanitizer
