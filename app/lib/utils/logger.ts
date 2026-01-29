/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║                    CHRONOS INFINITY - LOGGER UTILITY                       ║
 * ║           Production-Ready Structured Logging with AI Tracing              ║
 * ║                        v2.0 - Transcendental Edition                       ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 */

import * as Sentry from '@sentry/nextjs'

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

type LogCategory =
  | 'general'
  | 'ai'
  | 'database'
  | 'security'
  | 'performance'
  | 'business'
  | 'ui'
  | 'api'

interface AITraceData {
  model?: string
  promptTokens?: number
  completionTokens?: number
  latencyMs?: number
  streamingChunks?: number
  toolCalls?: string[]
  agentStep?: string
}

interface PerformanceData {
  durationMs?: number
  memoryUsageMB?: number
  cpuPercent?: number
  queryCount?: number
  cacheHit?: boolean
}

interface SecurityEvent {
  action?: string
  ipAddress?: string
  userAgent?: string
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'
  blocked?: boolean
}

interface LogOptions {
  timestamp?: boolean
  context?: string
  category?: LogCategory
  data?: unknown
  // IDs de entidades para trazabilidad
  ventaId?: string
  clienteId?: string
  distribuidorId?: string
  ordenId?: string
  bancoId?: string
  productoId?: string
  movimientoId?: string
  // Metadatos adicionales
  periodo?: string
  userId?: string
  sessionId?: string
  requestId?: string
  traceId?: string
  spanId?: string
  // AI Tracing
  aiTrace?: AITraceData
  // Performance metrics
  performance?: PerformanceData
  // Security events
  security?: SecurityEvent
  // Tags for filtering
  tags?: Record<string, string>
  [key: string]: unknown
}

interface StructuredLog {
  timestamp: string
  level: LogLevel
  message: string
  context?: string
  category: LogCategory
  environment: string
  version: string
  data?: unknown
  metadata: Record<string, unknown>
  trace?: {
    traceId?: string
    spanId?: string
    parentSpanId?: string
  }
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'
  private enabledLevels: Set<LogLevel>
  private version = process.env.npm_package_version || '3.0.0'
  private buffer: StructuredLog[] = []
  private bufferSize = 100
  private flushInterval: ReturnType<typeof setInterval> | null = null

  constructor() {
    this.enabledLevels = new Set(['error', 'fatal', 'warn'])

    if (this.isDevelopment) {
      this.enabledLevels.add('info')
      this.enabledLevels.add('debug')
      this.enabledLevels.add('trace')
    }

    // Flush buffer periodically in production
    if (this.isProduction && typeof window !== 'undefined') {
      this.flushInterval = setInterval(() => this.flushBuffer(), 30000)
    }
  }

  private getLevelPriority(level: LogLevel): number {
    const priorities: Record<LogLevel, number> = {
      trace: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
      fatal: 5,
    }
    return priorities[level]
  }

  private createStructuredLog(
    level: LogLevel,
    message: string,
    options?: LogOptions,
  ): StructuredLog {
    const metadata: Record<string, unknown> = {}

    // Extract entity IDs
    const entityFields = [
      'ventaId',
      'clienteId',
      'distribuidorId',
      'ordenId',
      'bancoId',
      'productoId',
      'movimientoId',
      'userId',
      'sessionId',
      'requestId',
    ]

    for (const field of entityFields) {
      if (options?.[field]) {
        metadata[field] = options[field]
      }
    }

    // Add AI trace data
    if (options?.aiTrace) {
      metadata.aiTrace = options.aiTrace
    }

    // Add performance data
    if (options?.performance) {
      metadata.performance = options.performance
    }

    // Add security event
    if (options?.security) {
      metadata.security = options.security
    }

    // Add tags
    if (options?.tags) {
      metadata.tags = options.tags
    }

    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: options?.context,
      category: options?.category || 'general',
      environment: process.env.NODE_ENV || 'development',
      version: this.version,
      data: options?.data,
      metadata,
      trace: options?.traceId
        ? {
            traceId: options.traceId as string,
            spanId: options.spanId as string,
          }
        : undefined,
    }
  }

  private formatForConsole(log: StructuredLog): string {
    const parts: string[] = []

    parts.push(`[${log.timestamp}]`)
    parts.push(`[${log.level.toUpperCase()}]`)
    parts.push(`[${log.category}]`)

    if (log.context) {
      parts.push(`[${log.context}]`)
    }

    parts.push(log.message)

    return parts.join(' ')
  }

  private sendToSentry(log: StructuredLog): void {
    if (!this.isProduction) return

    try {
      if (log.level === 'error' || log.level === 'fatal') {
        Sentry.captureMessage(log.message, {
          level: log.level === 'fatal' ? 'fatal' : 'error',
          tags: {
            category: log.category,
            context: log.context || 'unknown',
            ...(log.metadata.tags as Record<string, string> | undefined),
          },
          extra: {
            ...log.metadata,
            data: log.data,
          },
        })
      } else if (log.level === 'warn') {
        Sentry.addBreadcrumb({
          message: log.message,
          category: log.category,
          level: 'warning',
          data: log.metadata,
        })
      }
    } catch {
      // Silently fail if Sentry is not configured
    }
  }

  private addToBuffer(log: StructuredLog): void {
    this.buffer.push(log)
    if (this.buffer.length >= this.bufferSize) {
      this.flushBuffer()
    }
  }

  private flushBuffer(): void {
    if (this.buffer.length === 0) return

    // In production, this could send to an external service
    // For now, we just clear the buffer
    const logs = [...this.buffer]
    this.buffer = []

    // Could send to external logging service here
    if (this.isProduction && typeof window !== 'undefined') {
      // Example: navigator.sendBeacon('/api/logs', JSON.stringify(logs))
      void logs // Use logs to avoid unused variable warning
    }
  }

  private log(level: LogLevel, message: string, options?: LogOptions): void {
    if (!this.enabledLevels.has(level)) return

    const structuredLog = this.createStructuredLog(level, message, options)
    const formattedMessage = this.formatForConsole(structuredLog)

    // Console output (development only for debug/trace)
    if (this.isDevelopment || this.getLevelPriority(level) >= 3) {
      switch (level) {
        case 'trace':
        case 'debug':
          // eslint-disable-next-line no-console
          console.debug(formattedMessage, options?.data || '')
          break
        case 'info':
          // eslint-disable-next-line no-console
          console.info(formattedMessage, options?.data || '')
          break
        case 'warn':
          console.warn(formattedMessage, options?.data || '')
          break
        case 'error':
        case 'fatal':
          console.error(formattedMessage, options?.data || '')
          break
      }
    }

    // Production handling
    if (this.isProduction) {
      this.addToBuffer(structuredLog)
      this.sendToSentry(structuredLog)
    }
  }

  // Core logging methods
  trace(message: string, options?: LogOptions): void {
    this.log('trace', message, options)
  }

  debug(message: string, options?: LogOptions): void {
    this.log('debug', message, options)
  }

  info(message: string, options?: LogOptions): void {
    this.log('info', message, options)
  }

  warn(message: string, options?: LogOptions): void {
    this.log('warn', message, options)
  }

  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    const errorData =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error

    this.log('error', message, {
      ...options,
      data: errorData,
    })

    // Capture exception in Sentry
    if (this.isProduction && error instanceof Error) {
      Sentry.captureException(error, {
        tags: { context: options?.context },
        extra: options,
      })
    }
  }

  fatal(message: string, error?: Error | unknown, options?: LogOptions): void {
    const errorData =
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error

    this.log('fatal', message, {
      ...options,
      data: errorData,
    })

    if (this.isProduction && error instanceof Error) {
      Sentry.captureException(error, {
        level: 'fatal',
        tags: { context: options?.context },
        extra: options,
      })
    }
  }

  // Specialized logging methods

  /** Log AI/LLM operations with tracing */
  ai(
    message: string,
    trace: AITraceData,
    options?: Omit<LogOptions, 'aiTrace' | 'category'>,
  ): void {
    this.info(message, {
      ...options,
      category: 'ai',
      aiTrace: trace,
    })
  }

  /** Log database operations */
  db(message: string, options?: Omit<LogOptions, 'category'>): void {
    this.debug(message, {
      ...options,
      category: 'database',
    })
  }

  /** Log security events */
  security(
    message: string,
    event: SecurityEvent,
    options?: Omit<LogOptions, 'security' | 'category'>,
  ): void {
    const level = event.riskLevel === 'critical' || event.riskLevel === 'high' ? 'warn' : 'info'
    this.log(level, message, {
      ...options,
      category: 'security',
      security: event,
    })
  }

  /** Log performance metrics */
  perf(
    message: string,
    metrics: PerformanceData,
    options?: Omit<LogOptions, 'performance' | 'category'>,
  ): void {
    this.info(message, {
      ...options,
      category: 'performance',
      performance: metrics,
    })
  }

  /** Log business logic events */
  business(message: string, options?: Omit<LogOptions, 'category'>): void {
    this.info(message, {
      ...options,
      category: 'business',
    })
  }

  /** Log API requests/responses */
  api(message: string, options?: Omit<LogOptions, 'category'>): void {
    this.debug(message, {
      ...options,
      category: 'api',
    })
  }

  /** Create a child logger with preset context */
  child(context: string, defaultOptions?: Partial<LogOptions>): ChildLogger {
    return new ChildLogger(this, context, defaultOptions)
  }

  /** Measure execution time of a function */
  async measure<T>(name: string, fn: () => Promise<T>, options?: LogOptions): Promise<T> {
    const start = performance.now()
    try {
      const result = await fn()
      const durationMs = performance.now() - start
      this.perf(`${name} completed`, { durationMs }, options)
      return result
    } catch (error) {
      const durationMs = performance.now() - start
      this.error(`${name} failed after ${durationMs.toFixed(2)}ms`, error, options)
      throw error
    }
  }

  /** Cleanup resources */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
    }
    this.flushBuffer()
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private context: string,
    private defaultOptions?: Partial<LogOptions>,
  ) {}

  private mergeOptions(options?: LogOptions): LogOptions {
    return {
      ...this.defaultOptions,
      ...options,
      context: options?.context ? `${this.context}:${options.context}` : this.context,
    }
  }

  trace(message: string, options?: LogOptions): void {
    this.parent.trace(message, this.mergeOptions(options))
  }

  debug(message: string, options?: LogOptions): void {
    this.parent.debug(message, this.mergeOptions(options))
  }

  info(message: string, options?: LogOptions): void {
    this.parent.info(message, this.mergeOptions(options))
  }

  warn(message: string, options?: LogOptions): void {
    this.parent.warn(message, this.mergeOptions(options))
  }

  error(message: string, error?: Error | unknown, options?: LogOptions): void {
    this.parent.error(message, error, this.mergeOptions(options))
  }

  fatal(message: string, error?: Error | unknown, options?: LogOptions): void {
    this.parent.fatal(message, error, this.mergeOptions(options))
  }

  ai(
    message: string,
    trace: AITraceData,
    options?: Omit<LogOptions, 'aiTrace' | 'category'>,
  ): void {
    this.parent.ai(message, trace, this.mergeOptions(options))
  }

  db(message: string, options?: Omit<LogOptions, 'category'>): void {
    this.parent.db(message, this.mergeOptions(options))
  }

  security(
    message: string,
    event: SecurityEvent,
    options?: Omit<LogOptions, 'security' | 'category'>,
  ): void {
    this.parent.security(message, event, this.mergeOptions(options))
  }

  perf(
    message: string,
    metrics: PerformanceData,
    options?: Omit<LogOptions, 'performance' | 'category'>,
  ): void {
    this.parent.perf(message, metrics, this.mergeOptions(options))
  }

  business(message: string, options?: Omit<LogOptions, 'category'>): void {
    this.parent.business(message, this.mergeOptions(options))
  }

  api(message: string, options?: Omit<LogOptions, 'category'>): void {
    this.parent.api(message, this.mergeOptions(options))
  }

  measure<T>(name: string, fn: () => Promise<T>, options?: LogOptions): Promise<T> {
    return this.parent.measure(name, fn, this.mergeOptions(options))
  }
}

// Export singleton instance
export const logger = new Logger()

// Export types for external use
export { ChildLogger }
export type {
  AITraceData,
  LogCategory,
  LogLevel,
  LogOptions,
  PerformanceData,
  SecurityEvent,
  StructuredLog,
}
