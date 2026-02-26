// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🐛 CHRONOS INFINITY 2026 — SENTRY ERROR MONITORING SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Servicio de monitoreo de errores y performance:
 * - Error tracking con contexto
 * - Performance monitoring
 * - Transaction tracing
 * - User feedback
 * - Release tracking
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import * as Sentry from '@sentry/nextjs'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug'

export interface ErrorContext {
  tags?: Record<string, string>
  extra?: Record<string, unknown>
  user?: {
    id?: string
    email?: string
    username?: string
    ip_address?: string
  }
  level?: SeverityLevel
  fingerprint?: string[]
}

export interface TransactionContext {
  name: string
  op: string
  tags?: Record<string, string>
  data?: Record<string, unknown>
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ERROR CAPTURING
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Capture exception with context
 */
export function captureException(
  error: Error | unknown,
  context?: ErrorContext
): string {
  return Sentry.captureException(error, {
    tags: context?.tags,
    extra: context?.extra,
    user: context?.user,
    level: context?.level || 'error',
    fingerprint: context?.fingerprint,
  })
}

/**
 * Capture message
 */
export function captureMessage(
  message: string,
  context?: ErrorContext
): string {
  return Sentry.captureMessage(message, {
    level: context?.level || 'info',
    tags: context?.tags,
    extra: context?.extra,
    user: context?.user,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CHRONOS ERROR TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export const ErrorTypes = {
  // API Errors
  API_ERROR: 'api_error',
  VALIDATION_ERROR: 'validation_error',
  AUTH_ERROR: 'auth_error',
  RATE_LIMIT_ERROR: 'rate_limit_error',
  
  // Database Errors
  DB_CONNECTION_ERROR: 'db_connection_error',
  DB_QUERY_ERROR: 'db_query_error',
  DB_TRANSACTION_ERROR: 'db_transaction_error',
  
  // External Service Errors
  EXTERNAL_API_ERROR: 'external_api_error',
  PAYMENT_ERROR: 'payment_error',
  EMAIL_ERROR: 'email_error',
  
  // Business Logic Errors
  BUSINESS_RULE_ERROR: 'business_rule_error',
  INSUFFICIENT_FUNDS: 'insufficient_funds',
  INVALID_OPERATION: 'invalid_operation',
  
  // AI Errors
  AI_API_ERROR: 'ai_api_error',
  AI_RATE_LIMIT: 'ai_rate_limit',
  AI_CONTEXT_ERROR: 'ai_context_error',
} as const

export type ErrorType = (typeof ErrorTypes)[keyof typeof ErrorTypes]

/**
 * Capture Chronos-specific error
 */
export function captureChronosError(
  error: Error | unknown,
  errorType: ErrorType,
  context?: Omit<ErrorContext, 'tags'>
): string {
  return captureException(error, {
    ...context,
    tags: {
      error_type: errorType,
      app: 'chronos',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '3.0.0',
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USER & SCOPE
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Set user context for error tracking
 */
export function setUser(user: {
  id: string
  email?: string
  username?: string
  [key: string]: unknown
} | null): void {
  if (user) {
    Sentry.setUser(user)
  } else {
    Sentry.setUser(null)
  }
}

/**
 * Set tag on current scope
 */
export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value)
}

/**
 * Set multiple tags
 */
export function setTags(tags: Record<string, string>): void {
  Sentry.setTags(tags)
}

/**
 * Set extra context data
 */
export function setExtra(key: string, value: unknown): void {
  Sentry.setExtra(key, value)
}

/**
 * Set multiple extras
 */
export function setExtras(extras: Record<string, unknown>): void {
  Sentry.setExtras(extras)
}

/**
 * Add breadcrumb
 */
export function addBreadcrumb(breadcrumb: {
  category?: string
  message?: string
  level?: SeverityLevel
  data?: Record<string, unknown>
}): void {
  Sentry.addBreadcrumb({
    ...breadcrumb,
    timestamp: Date.now() / 1000,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PERFORMANCE MONITORING
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Start a transaction
 */
export function startTransaction(context: TransactionContext) {
  return Sentry.startSpan({
    name: context.name,
    op: context.op,
    attributes: {
      ...context.tags,
      ...context.data,
    },
  }, (span) => span)
}

/**
 * Create a measurement
 */
export function setMeasurement(
  name: string,
  value: number,
  unit: 'second' | 'millisecond' | 'microsecond' | 'nanosecond' | 'byte' | 'kilobyte' | 'megabyte' | 'none' = 'millisecond'
): void {
  Sentry.setMeasurement(name, value, unit)
}

/**
 * Profile async function
 */
export async function profileAsync<T>(
  name: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op: operation,
    },
    async () => {
      const start = Date.now()
      try {
        return await fn()
      } finally {
        setMeasurement(`${name}.duration`, Date.now() - start, 'millisecond')
      }
    }
  )
}

/**
 * Profile sync function
 */
export function profileSync<T>(
  name: string,
  operation: string,
  fn: () => T
): T {
  return Sentry.startSpan(
    {
      name,
      op: operation,
    },
    () => {
      const start = Date.now()
      try {
        return fn()
      } finally {
        setMeasurement(`${name}.duration`, Date.now() - start, 'millisecond')
      }
    }
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// API ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Capture API error with request context
 */
export function captureApiError(
  error: Error | unknown,
  request: {
    method: string
    url: string
    headers?: Record<string, string>
    body?: unknown
  },
  response?: {
    status: number
    body?: unknown
  }
): string {
  return captureException(error, {
    tags: {
      error_type: ErrorTypes.API_ERROR,
      http_method: request.method,
      http_status: response?.status?.toString() || 'unknown',
    },
    extra: {
      request_url: request.url,
      request_body: request.body,
      response_body: response?.body,
    },
    level: response?.status && response.status >= 500 ? 'error' : 'warning',
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// WITHSCOPE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Execute with isolated scope
 */
export function withScope<T>(
  callback: (scope: Sentry.Scope) => T
): T {
  let result: T
  Sentry.withScope((scope) => {
    result = callback(scope)
  })
  return result!
}

/**
 * Execute async with isolated scope
 */
export async function withScopeAsync<T>(
  callback: (scope: Sentry.Scope) => Promise<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    Sentry.withScope(async (scope) => {
      try {
        const result = await callback(scope)
        resolve(result)
      } catch (error) {
        reject(error)
      }
    })
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Capture user feedback
 */
export function captureUserFeedback(feedback: {
  eventId: string
  name?: string
  email?: string
  comments: string
}): void {
  Sentry.captureFeedback({
    associatedEventId: feedback.eventId,
    name: feedback.name,
    email: feedback.email,
    message: feedback.comments,
  })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FLUSH & CLOSE
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Flush pending events
 */
export async function flush(timeout?: number): Promise<boolean> {
  return Sentry.flush(timeout)
}

/**
 * Close Sentry client
 */
export async function close(timeout?: number): Promise<boolean> {
  return Sentry.close(timeout)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const sentryMonitoring = {
  captureException,
  captureMessage,
  captureChronosError,
  captureApiError,
  captureUserFeedback,
  setUser,
  setTag,
  setTags,
  setExtra,
  setExtras,
  addBreadcrumb,
  startTransaction,
  setMeasurement,
  profileAsync,
  profileSync,
  withScope,
  withScopeAsync,
  flush,
  close,
  errorTypes: ErrorTypes,
}

export default sentryMonitoring
