/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * ⚡ CHRONOS INFINITY 2030 — PERFORMANCE MONITOR AVANZADO
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Sistema de monitoreo de rendimiento en tiempo real con:
 * - Medición de FPS y frame drops
 * - Tracking de memoria
 * - Métricas de red
 * - Reportes de Web Vitals
 * - Detección automática de problemas de rendimiento
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface PerformanceMetrics {
  // Frame Metrics
  fps: number
  avgFps: number
  minFps: number
  maxFps: number
  frameDrops: number
  jank: number

  // Memory Metrics (si está disponible)
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
  memoryUsagePercent: number

  // Timing Metrics
  domContentLoaded: number
  windowLoaded: number
  firstPaint: number
  firstContentfulPaint: number
  largestContentfulPaint: number
  
  // Interaction Metrics
  firstInputDelay: number
  cumulativeLayoutShift: number
  timeToInteractive: number

  // Custom Metrics
  renderCount: number
  avgRenderTime: number
  slowRenders: number
}

interface PerformanceThresholds {
  minFps: number
  maxMemoryPercent: number
  maxRenderTime: number
  maxLayoutShift: number
  maxFirstInputDelay: number
}

interface PerformanceEvent {
  type: 'warning' | 'critical' | 'info'
  metric: string
  value: number
  threshold: number
  timestamp: number
  message: string
}

type PerformanceCallback = (metrics: PerformanceMetrics) => void
type EventCallback = (event: PerformanceEvent) => void

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_THRESHOLDS: PerformanceThresholds = {
  minFps: 30,
  maxMemoryPercent: 80,
  maxRenderTime: 16, // 60fps = 16.67ms per frame
  maxLayoutShift: 0.1,
  maxFirstInputDelay: 100,
}

const FPS_SAMPLE_SIZE = 60 // 1 segundo a 60fps
const REPORT_INTERVAL = 5000 // 5 segundos

// ═══════════════════════════════════════════════════════════════════════════════════════
// PERFORMANCE MONITOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

class PerformanceMonitor {
  private metrics: PerformanceMetrics = this.getInitialMetrics()
  private thresholds: PerformanceThresholds = { ...DEFAULT_THRESHOLDS }
  private frameTimestamps: number[] = []
  private renderTimes: number[] = []
  private callbacks: Set<PerformanceCallback> = new Set()
  private eventCallbacks: Set<EventCallback> = new Set()
  private events: PerformanceEvent[] = []
  private rafId: number | null = null
  private reportInterval: ReturnType<typeof setInterval> | null = null
  private isRunning = false
  private observer: PerformanceObserver | null = null

  private getInitialMetrics(): PerformanceMetrics {
    return {
      fps: 60,
      avgFps: 60,
      minFps: 60,
      maxFps: 60,
      frameDrops: 0,
      jank: 0,
      usedJSHeapSize: 0,
      totalJSHeapSize: 0,
      jsHeapSizeLimit: 0,
      memoryUsagePercent: 0,
      domContentLoaded: 0,
      windowLoaded: 0,
      firstPaint: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      timeToInteractive: 0,
      renderCount: 0,
      avgRenderTime: 0,
      slowRenders: 0,
    }
  }

  /**
   * Inicia el monitoreo de rendimiento
   */
  start(): void {
    if (this.isRunning || typeof window === 'undefined') return
    this.isRunning = true

    // Iniciar loop de FPS
    this.startFPSLoop()

    // Iniciar reporte periódico
    this.reportInterval = setInterval(() => this.report(), REPORT_INTERVAL)

    // Configurar Web Vitals observer
    this.setupWebVitalsObserver()

    // Capturar métricas de navegación
    this.captureNavigationTiming()
  }

  /**
   * Detiene el monitoreo
   */
  stop(): void {
    this.isRunning = false

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }

    if (this.reportInterval) {
      clearInterval(this.reportInterval)
      this.reportInterval = null
    }

    if (this.observer) {
      this.observer.disconnect()
      this.observer = null
    }
  }

  /**
   * Suscribe callback para recibir métricas
   */
  subscribe(callback: PerformanceCallback): () => void {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  /**
   * Suscribe callback para eventos de rendimiento
   */
  onEvent(callback: EventCallback): () => void {
    this.eventCallbacks.add(callback)
    return () => this.eventCallbacks.delete(callback)
  }

  /**
   * Configura umbrales personalizados
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
  }

  /**
   * Obtiene las métricas actuales
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }

  /**
   * Obtiene eventos recientes
   */
  getEvents(limit = 50): PerformanceEvent[] {
    return this.events.slice(-limit)
  }

  /**
   * Registra el tiempo de un render de componente
   */
  recordRenderTime(componentName: string, timeMs: number): void {
    this.renderTimes.push(timeMs)
    this.metrics.renderCount++

    // Mantener solo los últimos 100 renders
    if (this.renderTimes.length > 100) {
      this.renderTimes.shift()
    }

    // Actualizar promedio
    this.metrics.avgRenderTime = 
      this.renderTimes.reduce((a, b) => a + b, 0) / this.renderTimes.length

    // Detectar renders lentos
    if (timeMs > this.thresholds.maxRenderTime) {
      this.metrics.slowRenders++
      this.emitEvent({
        type: 'warning',
        metric: 'renderTime',
        value: timeMs,
        threshold: this.thresholds.maxRenderTime,
        timestamp: Date.now(),
        message: `Render lento en ${componentName}: ${timeMs.toFixed(2)}ms`,
      })
    }
  }

  /**
   * Mide el tiempo de ejecución de una función
   */
  measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
      return fn()
    } finally {
      const duration = performance.now() - start
      performance.measure(name, { start, duration })
      
      if (duration > 50) {
        this.emitEvent({
          type: 'info',
          metric: 'functionTime',
          value: duration,
          threshold: 50,
          timestamp: Date.now(),
          message: `Función ${name} tardó ${duration.toFixed(2)}ms`,
        })
      }
    }
  }

  /**
   * Mide una operación async
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      return await fn()
    } finally {
      const duration = performance.now() - start
      performance.measure(name, { start, duration })
      
      if (duration > 100) {
        this.emitEvent({
          type: 'info',
          metric: 'asyncFunctionTime',
          value: duration,
          threshold: 100,
          timestamp: Date.now(),
          message: `Operación async ${name} tardó ${duration.toFixed(2)}ms`,
        })
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════
  // MÉTODOS PRIVADOS
  // ═══════════════════════════════════════════════════════════════════════════════════

  private startFPSLoop(): void {
    let lastTime = performance.now()
    
    const loop = (currentTime: number) => {
      if (!this.isRunning) return

      // Calcular delta y FPS instantáneo
      const delta = currentTime - lastTime
      const instantFps = delta > 0 ? 1000 / delta : 60
      
      // Agregar timestamp
      this.frameTimestamps.push(currentTime)
      
      // Mantener solo los últimos N frames
      while (this.frameTimestamps.length > FPS_SAMPLE_SIZE) {
        this.frameTimestamps.shift()
      }

      // Calcular FPS promedio
      if (this.frameTimestamps.length >= 2) {
        const timeSpan = 
          this.frameTimestamps[this.frameTimestamps.length - 1] - 
          this.frameTimestamps[0]
        
        this.metrics.fps = Math.round(
          (this.frameTimestamps.length - 1) / (timeSpan / 1000)
        )
      }

      // Actualizar estadísticas de FPS
      this.updateFPSStats(instantFps)

      // Detectar frame drops
      if (delta > 33.33) { // Más de 2 frames perdidos
        this.metrics.frameDrops++
        this.metrics.jank++
      }

      // Actualizar memoria
      this.updateMemoryMetrics()

      lastTime = currentTime
      this.rafId = requestAnimationFrame(loop)
    }

    this.rafId = requestAnimationFrame(loop)
  }

  private updateFPSStats(instantFps: number): void {
    // Actualizar min/max
    this.metrics.minFps = Math.min(this.metrics.minFps, instantFps)
    this.metrics.maxFps = Math.max(this.metrics.maxFps, instantFps)
    
    // Promedio móvil
    this.metrics.avgFps = this.metrics.avgFps * 0.95 + instantFps * 0.05

    // Verificar umbral
    if (this.metrics.fps < this.thresholds.minFps) {
      this.emitEvent({
        type: 'warning',
        metric: 'fps',
        value: this.metrics.fps,
        threshold: this.thresholds.minFps,
        timestamp: Date.now(),
        message: `FPS bajo: ${this.metrics.fps} (mínimo: ${this.thresholds.minFps})`,
      })
    }
  }

  private updateMemoryMetrics(): void {
    // Solo disponible en Chrome con flag activada
    const memory = (performance as unknown as { memory?: {
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    } }).memory

    if (memory) {
      this.metrics.usedJSHeapSize = memory.usedJSHeapSize
      this.metrics.totalJSHeapSize = memory.totalJSHeapSize
      this.metrics.jsHeapSizeLimit = memory.jsHeapSizeLimit
      this.metrics.memoryUsagePercent = 
        (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100

      // Verificar umbral
      if (this.metrics.memoryUsagePercent > this.thresholds.maxMemoryPercent) {
        this.emitEvent({
          type: 'critical',
          metric: 'memory',
          value: this.metrics.memoryUsagePercent,
          threshold: this.thresholds.maxMemoryPercent,
          timestamp: Date.now(),
          message: `Uso de memoria alto: ${this.metrics.memoryUsagePercent.toFixed(1)}%`,
        })
      }
    }
  }

  private setupWebVitalsObserver(): void {
    if (typeof PerformanceObserver === 'undefined') return

    try {
      // Observer para paint metrics
      const paintObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-paint') {
            this.metrics.firstPaint = entry.startTime
          } else if (entry.name === 'first-contentful-paint') {
            this.metrics.firstContentfulPaint = entry.startTime
          }
        }
      })
      paintObserver.observe({ entryTypes: ['paint'] })

      // Observer para LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          this.metrics.largestContentfulPaint = lastEntry.startTime
        }
      })
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

      // Observer para FID
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as PerformanceEventTiming
          this.metrics.firstInputDelay = fidEntry.processingStart - fidEntry.startTime
          
          if (this.metrics.firstInputDelay > this.thresholds.maxFirstInputDelay) {
            this.emitEvent({
              type: 'warning',
              metric: 'firstInputDelay',
              value: this.metrics.firstInputDelay,
              threshold: this.thresholds.maxFirstInputDelay,
              timestamp: Date.now(),
              message: `First Input Delay alto: ${this.metrics.firstInputDelay.toFixed(2)}ms`,
            })
          }
        }
      })
      fidObserver.observe({ entryTypes: ['first-input'] })

      // Observer para CLS
      let clsValue = 0
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as PerformanceEntry & { 
            hadRecentInput: boolean
            value: number 
          }
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value
            this.metrics.cumulativeLayoutShift = clsValue
          }
        }

        if (clsValue > this.thresholds.maxLayoutShift) {
          this.emitEvent({
            type: 'warning',
            metric: 'cumulativeLayoutShift',
            value: clsValue,
            threshold: this.thresholds.maxLayoutShift,
            timestamp: Date.now(),
            message: `Cumulative Layout Shift alto: ${clsValue.toFixed(3)}`,
          })
        }
      })
      clsObserver.observe({ entryTypes: ['layout-shift'] })

      this.observer = paintObserver // Guardar referencia para cleanup

    } catch (e) {
      // Algunos navegadores no soportan todas las métricas
      console.warn('Some Web Vitals metrics unavailable:', e)
    }
  }

  private captureNavigationTiming(): void {
    if (typeof window === 'undefined') return

    // Esperar a que la página cargue completamente
    if (document.readyState === 'complete') {
      this.extractNavigationTiming()
    } else {
      window.addEventListener('load', () => this.extractNavigationTiming())
    }
  }

  private extractNavigationTiming(): void {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (timing) {
      this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.startTime
      this.metrics.windowLoaded = timing.loadEventEnd - timing.startTime
    }
  }

  private emitEvent(event: PerformanceEvent): void {
    this.events.push(event)
    
    // Mantener solo los últimos 100 eventos
    if (this.events.length > 100) {
      this.events.shift()
    }

    // Notificar callbacks
    this.eventCallbacks.forEach(cb => {
      try {
        cb(event)
      } catch (e) {
        console.error('Error in event callback:', e)
      }
    })
  }

  private report(): void {
    // Notificar callbacks
    this.callbacks.forEach(cb => {
      try {
        cb(this.getMetrics())
      } catch (e) {
        console.error('Error in metrics callback:', e)
      }
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════

export const performanceMonitor = new PerformanceMonitor()

// ═══════════════════════════════════════════════════════════════════════════════════════
// REACT HOOKS
// ═══════════════════════════════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback, useRef } from 'react'

/**
 * Hook para monitorear métricas de rendimiento
 */
export function usePerformanceMetrics(enabled = true): PerformanceMetrics | null {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)

  useEffect(() => {
    if (!enabled) return

    performanceMonitor.start()
    const unsubscribe = performanceMonitor.subscribe(setMetrics)

    return () => {
      unsubscribe()
    }
  }, [enabled])

  return metrics
}

/**
 * Hook para eventos de rendimiento
 */
export function usePerformanceEvents(
  onEvent?: EventCallback
): PerformanceEvent[] {
  const [events, setEvents] = useState<PerformanceEvent[]>([])

  useEffect(() => {
    const unsubscribe = performanceMonitor.onEvent((event) => {
      setEvents(prev => [...prev.slice(-49), event])
      onEvent?.(event)
    })

    return unsubscribe
  }, [onEvent])

  return events
}

/**
 * Hook para medir tiempo de render de un componente
 */
export function useRenderTime(componentName: string): void {
  const renderStartRef = useRef(performance.now())

  useEffect(() => {
    const renderTime = performance.now() - renderStartRef.current
    performanceMonitor.recordRenderTime(componentName, renderTime)
    renderStartRef.current = performance.now()
  })
}

/**
 * Hook para medir efectos
 */
export function useMeasuredEffect(
  name: string,
  effect: () => void | (() => void),
  deps: React.DependencyList
): void {
  useEffect(() => {
    const start = performance.now()
    const cleanup = effect()
    const duration = performance.now() - start

    if (duration > 10) {
      console.debug(`Effect [${name}] took ${duration.toFixed(2)}ms`)
    }

    return typeof cleanup === 'function' ? cleanup : undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Hook para callback con medición de tiempo
 */
export function useMeasuredCallback<T extends (...args: unknown[]) => unknown>(
  name: string,
  callback: T,
  deps: React.DependencyList
): T {
  return useCallback((...args: Parameters<T>) => {
    return performanceMonitor.measure(name, () => callback(...args))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps) as T
}

export type { PerformanceMetrics, PerformanceEvent, PerformanceThresholds }
