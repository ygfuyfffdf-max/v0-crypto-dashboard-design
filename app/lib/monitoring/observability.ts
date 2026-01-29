/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📊 CHRONOS INFINITY 2026 — Monitoring & Observability
 * ═══════════════════════════════════════════════════════════════════════════════
 * Sistema completo de métricas, trazas y observabilidad
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'

// ============================================================================
// Tipos
// ============================================================================

export interface Metric {
  name: string
  value: number
  unit?: string
  tags?: Record<string, string>
  timestamp: number
}

export interface Span {
  traceId: string
  spanId: string
  parentSpanId?: string
  operationName: string
  serviceName: string
  startTime: number
  duration?: number
  status: 'ok' | 'error'
  tags?: Record<string, string>
  logs?: SpanLog[]
}

export interface SpanLog {
  timestamp: number
  message: string
  level: 'debug' | 'info' | 'warn' | 'error'
}

export interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency?: number
  message?: string
  lastCheck: number
}

// ============================================================================
// Metrics Collector
// ============================================================================

class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map()
  private readonly maxMetricsPerName = 1000

  /**
   * Registra una métrica
   */
  record(name: string, value: number, options?: { unit?: string; tags?: Record<string, string> }) {
    const metric: Metric = {
      name,
      value,
      unit: options?.unit,
      tags: options?.tags,
      timestamp: Date.now(),
    }

    const existing = this.metrics.get(name) || []
    existing.push(metric)

    // Mantener solo los últimos N
    if (existing.length > this.maxMetricsPerName) {
      existing.shift()
    }

    this.metrics.set(name, existing)

    logger.debug('Metric recorded', {
      context: 'Metrics',
      name,
      value,
      tags: options?.tags,
    })
  }

  /**
   * Incrementa un contador
   */
  increment(name: string, value = 1, tags?: Record<string, string>) {
    const existing = this.metrics.get(name)
    const lastValue = existing?.[existing.length - 1]?.value ?? 0
    this.record(name, lastValue + value, { tags })
  }

  /**
   * Registra un histograma
   */
  histogram(name: string, value: number, tags?: Record<string, string>) {
    this.record(`${name}.histogram`, value, { tags })
  }

  /**
   * Registra un gauge
   */
  gauge(name: string, value: number, tags?: Record<string, string>) {
    this.record(`${name}.gauge`, value, { tags })
  }

  /**
   * Obtiene las últimas métricas de un nombre
   */
  getMetrics(name: string, limit = 100): Metric[] {
    const metrics = this.metrics.get(name) || []
    return metrics.slice(-limit)
  }

  /**
   * Obtiene todas las métricas actuales
   */
  getAllMetrics(): Record<string, Metric[]> {
    const result: Record<string, Metric[]> = {}
    this.metrics.forEach((value, key) => {
      result[key] = value.slice(-100)
    })
    return result
  }

  /**
   * Calcula estadísticas para una métrica
   */
  getStats(name: string): {
    count: number
    min: number
    max: number
    avg: number
    p50: number
    p95: number
    p99: number
  } | null {
    const metrics = this.metrics.get(name)
    if (!metrics || metrics.length === 0) return null

    const values = metrics.map((m) => m.value).sort((a, b) => a - b)
    const count = values.length

    // Garantizar valores válidos con fallbacks
    const minVal = values[0] ?? 0
    const maxVal = values[count - 1] ?? 0
    const p50Val = values[Math.floor(count * 0.5)] ?? 0
    const p95Val = values[Math.floor(count * 0.95)] ?? 0
    const p99Val = values[Math.floor(count * 0.99)] ?? 0

    return {
      count,
      min: minVal,
      max: maxVal,
      avg: values.reduce((a, b) => a + b, 0) / count,
      p50: p50Val,
      p95: p95Val,
      p99: p99Val,
    }
  }

  /**
   * Limpia métricas antiguas
   */
  cleanup(maxAge = 3600000) {
    // 1 hora por defecto
    const now = Date.now()
    this.metrics.forEach((metrics, name) => {
      const filtered = metrics.filter((m) => now - m.timestamp < maxAge)
      if (filtered.length === 0) {
        this.metrics.delete(name)
      } else {
        this.metrics.set(name, filtered)
      }
    })
  }
}

// ============================================================================
// Tracer
// ============================================================================

class Tracer {
  private activeSpans: Map<string, Span> = new Map()
  private completedSpans: Span[] = []
  private readonly maxCompletedSpans = 1000

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`
  }

  /**
   * Inicia un nuevo span
   */
  startSpan(
    operationName: string,
    options?: {
      parentSpanId?: string
      serviceName?: string
      tags?: Record<string, string>
    },
  ): Span {
    const span: Span = {
      traceId: options?.parentSpanId
        ? (this.activeSpans.get(options.parentSpanId)?.traceId ?? this.generateId())
        : this.generateId(),
      spanId: this.generateId(),
      parentSpanId: options?.parentSpanId,
      operationName,
      serviceName: options?.serviceName || 'chronos',
      startTime: Date.now(),
      status: 'ok',
      tags: options?.tags,
      logs: [],
    }

    this.activeSpans.set(span.spanId, span)
    return span
  }

  /**
   * Finaliza un span
   */
  endSpan(spanId: string, status: 'ok' | 'error' = 'ok') {
    const span = this.activeSpans.get(spanId)
    if (!span) return

    span.duration = Date.now() - span.startTime
    span.status = status

    this.activeSpans.delete(spanId)
    this.completedSpans.push(span)

    // Mantener solo los últimos N
    if (this.completedSpans.length > this.maxCompletedSpans) {
      this.completedSpans.shift()
    }

    logger.debug('Span completed', {
      context: 'Tracer',
      operationName: span.operationName,
      duration: span.duration,
      status: span.status,
    })
  }

  /**
   * Agrega un log a un span
   */
  addLog(spanId: string, message: string, level: SpanLog['level'] = 'info') {
    const span = this.activeSpans.get(spanId)
    if (!span) return

    span.logs = span.logs || []
    span.logs.push({
      timestamp: Date.now(),
      message,
      level,
    })
  }

  /**
   * Agrega tags a un span
   */
  addTags(spanId: string, tags: Record<string, string>) {
    const span = this.activeSpans.get(spanId)
    if (!span) return

    span.tags = { ...span.tags, ...tags }
  }

  /**
   * Obtiene spans completados
   */
  getCompletedSpans(limit = 100): Span[] {
    return this.completedSpans.slice(-limit)
  }

  /**
   * Obtiene spans por trace ID
   */
  getSpansByTrace(traceId: string): Span[] {
    return this.completedSpans.filter((s) => s.traceId === traceId)
  }

  /**
   * Wrapper para trazar una función async
   */
  async trace<T>(
    operationName: string,
    fn: () => Promise<T>,
    options?: { tags?: Record<string, string> },
  ): Promise<T> {
    const span = this.startSpan(operationName, options)
    try {
      const result = await fn()
      this.endSpan(span.spanId, 'ok')
      return result
    } catch (error) {
      this.addLog(span.spanId, String(error), 'error')
      this.endSpan(span.spanId, 'error')
      throw error
    }
  }
}

// ============================================================================
// Health Checker
// ============================================================================

class HealthChecker {
  private checks: Map<string, () => Promise<HealthCheck>> = new Map()
  private lastResults: Map<string, HealthCheck> = new Map()

  /**
   * Registra un health check
   */
  register(name: string, check: () => Promise<HealthCheck>) {
    this.checks.set(name, check)
  }

  /**
   * Ejecuta todos los health checks
   */
  async runAll(): Promise<Map<string, HealthCheck>> {
    const promises: Promise<void>[] = []

    this.checks.forEach((check, name) => {
      promises.push(
        (async () => {
          try {
            const startTime = Date.now()
            const result = await check()
            result.latency = Date.now() - startTime
            result.lastCheck = Date.now()
            this.lastResults.set(name, result)
          } catch (error) {
            this.lastResults.set(name, {
              name,
              status: 'unhealthy',
              message: String(error),
              lastCheck: Date.now(),
            })
          }
        })(),
      )
    })

    await Promise.all(promises)
    return this.lastResults
  }

  /**
   * Obtiene el estado general de salud
   */
  async getOverallHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: HealthCheck[]
  }> {
    await this.runAll()

    const checks = Array.from(this.lastResults.values())

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'

    for (const check of checks) {
      if (check.status === 'unhealthy') {
        status = 'unhealthy'
        break
      }
      if (check.status === 'degraded') {
        status = 'degraded'
      }
    }

    return { status, checks }
  }

  /**
   * Obtiene resultados cacheados
   */
  getCachedResults(): Map<string, HealthCheck> {
    return this.lastResults
  }
}

// ============================================================================
// Web Vitals Collector
// ============================================================================

interface WebVitalsMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

class WebVitalsCollector {
  private metrics: WebVitalsMetric[] = []

  /**
   * Registra una métrica Web Vital
   */
  record(name: WebVitalsMetric['name'], value: number) {
    const rating = this.getRating(name, value)

    this.metrics.push({
      name,
      value,
      rating,
      timestamp: Date.now(),
    })

    logger.info('Web Vital recorded', {
      context: 'WebVitals',
      name,
      value: value.toFixed(2),
      rating,
    })
  }

  /**
   * Determina el rating de una métrica
   */
  private getRating(name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] {
    const thresholds: Record<string, [number, number]> = {
      CLS: [0.1, 0.25],
      FID: [100, 300],
      FCP: [1800, 3000],
      LCP: [2500, 4000],
      TTFB: [800, 1800],
      INP: [200, 500],
    }

    const [good, needsImprovement] = thresholds[name] || [0, 0]

    if (value <= good) return 'good'
    if (value <= needsImprovement) return 'needs-improvement'
    return 'poor'
  }

  /**
   * Obtiene todas las métricas
   */
  getMetrics(): WebVitalsMetric[] {
    return [...this.metrics]
  }

  /**
   * Obtiene resumen de Web Vitals
   */
  getSummary(): Record<
    WebVitalsMetric['name'],
    {
      latest: number
      rating: WebVitalsMetric['rating']
    } | null
  > {
    const summary: Record<string, { latest: number; rating: WebVitalsMetric['rating'] } | null> = {
      CLS: null,
      FID: null,
      FCP: null,
      LCP: null,
      TTFB: null,
      INP: null,
    }

    const latestByName = new Map<string, WebVitalsMetric>()

    for (const metric of this.metrics) {
      const existing = latestByName.get(metric.name)
      if (!existing || metric.timestamp > existing.timestamp) {
        latestByName.set(metric.name, metric)
      }
    }

    latestByName.forEach((metric, name) => {
      summary[name] = { latest: metric.value, rating: metric.rating }
    })

    return summary as Record<
      WebVitalsMetric['name'],
      { latest: number; rating: WebVitalsMetric['rating'] } | null
    >
  }
}

// ============================================================================
// Performance Monitor
// ============================================================================

class PerformanceMonitor {
  private marks: Map<string, number> = new Map()

  /**
   * Inicia una medición
   */
  start(name: string) {
    this.marks.set(name, performance.now())

    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`)
    }
  }

  /**
   * Finaliza una medición y retorna duración
   */
  end(name: string): number | null {
    const startTime = this.marks.get(name)
    if (startTime === undefined) return null

    const duration = performance.now() - startTime
    this.marks.delete(name)

    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-end`)
      performance.measure(name, `${name}-start`, `${name}-end`)
    }

    return duration
  }

  /**
   * Mide el tiempo de una función async
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    this.start(name)
    const result = await fn()
    const duration = this.end(name) ?? 0
    return { result, duration }
  }

  /**
   * Obtiene métricas de navegación
   */
  getNavigationTiming(): Record<string, number> | null {
    if (typeof window === 'undefined' || !('performance' in window)) return null

    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (!timing) return null

    return {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.requestStart,
      download: timing.responseEnd - timing.responseStart,
      domInteractive: timing.domInteractive - timing.fetchStart,
      domComplete: timing.domComplete - timing.fetchStart,
      loadComplete: timing.loadEventEnd - timing.fetchStart,
    }
  }

  /**
   * Obtiene uso de memoria
   */
  getMemoryUsage(): {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  } | null {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const perf = performance as any
    if (!perf.memory) return null

    return {
      usedJSHeapSize: perf.memory.usedJSHeapSize,
      totalJSHeapSize: perf.memory.totalJSHeapSize,
      jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
    }
  }
}

// ============================================================================
// Singleton Instances
// ============================================================================

export const metrics = new MetricsCollector()
export const tracer = new Tracer()
export const healthChecker = new HealthChecker()
export const webVitals = new WebVitalsCollector()
export const perfMonitor = new PerformanceMonitor()

// ============================================================================
// Default Health Checks
// ============================================================================

// Database health check
healthChecker.register('database', async () => {
  // Este sería reemplazado con un check real de Turso
  return {
    name: 'database',
    status: 'healthy',
    message: 'Database connection OK',
    lastCheck: Date.now(),
  }
})

// API health check
healthChecker.register('api', async () => {
  const start = Date.now()
  try {
    // Check de API endpoint
    const response = await fetch('/api/health', { method: 'HEAD' })
    return {
      name: 'api',
      status: response.ok ? 'healthy' : 'degraded',
      latency: Date.now() - start,
      message: response.ok ? 'API responding' : `API returned ${response.status}`,
      lastCheck: Date.now(),
    }
  } catch {
    return {
      name: 'api',
      status: 'unhealthy',
      latency: Date.now() - start,
      message: 'API unreachable',
      lastCheck: Date.now(),
    }
  }
})

// ============================================================================
// Exports
// ============================================================================

export { HealthChecker, MetricsCollector, PerformanceMonitor, Tracer, WebVitalsCollector }
