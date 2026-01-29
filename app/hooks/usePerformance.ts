/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 CHRONOS INFINITY 2026 — Performance Hooks
 * ═══════════════════════════════════════════════════════════════════════════════
 * Hooks optimizados para lazy loading y performance
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/* eslint-disable no-undef */
'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// Tipo para Network Information API (experimental)
interface NetworkInformation extends EventTarget {
  effectiveType?: string
  saveData?: boolean
  addEventListener(type: 'change', listener: () => void): void
  removeEventListener(type: 'change', listener: () => void): void
}

/**
 * Hook para detectar cuando un elemento entra en el viewport
 * Usa Intersection Observer API para lazy loading eficiente
 */
export function useIntersectionObserver(
  options: IntersectionObserverInit = {},
): [React.RefObject<HTMLDivElement | null>, boolean] {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        // Solo activar una vez (para lazy loading)
        if (entry && entry.isIntersecting) {
          setIsIntersecting(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Pre-cargar 100px antes de entrar
        ...options,
      },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [options])

  return [ref, isIntersecting]
}

/**
 * Hook para cargar componentes 3D de forma lazy
 * Gestiona estados de carga, error y cleanup
 */
export function useLazy3DComponent() {
  const [ref, isVisible] = useIntersectionObserver()
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const onLoad = useCallback(() => {
    if (mountedRef.current) {
      setIsLoaded(true)
    }
  }, [])

  const onError = useCallback((err: Error) => {
    if (mountedRef.current) {
      setError(err)
    }
  }, [])

  return {
    ref,
    isVisible,
    isLoaded,
    error,
    onLoad,
    onError,
    shouldRender: isVisible,
  }
}

/**
 * Hook para medir FPS y detectar degradación de performance
 */
export function usePerformanceMonitor(targetFps: number = 60) {
  const [fps, setFps] = useState(targetFps)
  const [isLowPerformance, setIsLowPerformance] = useState(false)
  const frameTimesRef = useRef<number[]>([])
  const lastFrameTimeRef = useRef(performance.now())
  const rafRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const measureFps = () => {
      const now = performance.now()
      const delta = now - lastFrameTimeRef.current
      lastFrameTimeRef.current = now

      // Mantener últimos 60 frames
      frameTimesRef.current.push(delta)
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift()
      }

      // Calcular FPS promedio cada 30 frames
      if (frameTimesRef.current.length % 30 === 0) {
        const avgFrameTime =
          frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
        const currentFps = Math.round(1000 / avgFrameTime)
        setFps(currentFps)
        setIsLowPerformance(currentFps < targetFps * 0.75) // < 75% del target
      }

      rafRef.current = requestAnimationFrame(measureFps)
    }

    rafRef.current = requestAnimationFrame(measureFps)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [targetFps])

  return { fps, isLowPerformance }
}

/**
 * Hook para debounce de resize events
 */
export function useResizeObserver<T extends Element>(): [
  React.RefObject<T | null>,
  { width: number; height: number; x: number; y: number } | null,
] {
  const ref = useRef<T | null>(null)
  const [dimensions, setDimensions] = useState<{
    width: number
    height: number
    x: number
    y: number
  } | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setDimensions(entries[0].contentRect)
      }
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return [ref, dimensions]
}

/**
 * Hook para detectar preferencias de motion reducido
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

/**
 * Hook para idle callback - ejecutar tareas no críticas
 */
export function useIdleCallback(callback: () => void, deps: unknown[] = []) {
  useEffect(() => {
    let cleanupId: number | ReturnType<typeof setTimeout>

    if ('requestIdleCallback' in window) {
      cleanupId = (
        window as Window & { requestIdleCallback: (cb: () => void) => number }
      ).requestIdleCallback(callback)
      return () =>
        (window as Window & { cancelIdleCallback: (id: number) => void }).cancelIdleCallback(
          cleanupId as number,
        )
    } else {
      // Fallback para Safari
      cleanupId = setTimeout(() => callback(), 1)
      return () => clearTimeout(cleanupId as ReturnType<typeof setTimeout>)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Hook para memory management - detectar memory pressure
 */
export function useMemoryStatus() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize?: number
    totalJSHeapSize?: number
    jsHeapSizeLimit?: number
  } | null>(null)

  useEffect(() => {
    // @ts-expect-error - memory API no está en todos los browsers
    if (!performance.memory) {
      return // No soportado
    }

    const updateMemory = () => {
      // @ts-expect-error - memory API
      const memory = performance.memory
      setMemoryInfo({
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      })
    }

    updateMemory()
    const interval = setInterval(updateMemory, 5000)
    return () => clearInterval(interval)
  }, [])

  return memoryInfo
}

/**
 * Hook para network-aware loading
 */
export function useNetworkStatus() {
  const [isSlowConnection, setIsSlowConnection] = useState(false)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const updateNetworkStatus = () => {
      setIsOffline(!navigator.onLine)

      const nav = navigator as Navigator & {
        connection?: NetworkInformation
        mozConnection?: NetworkInformation
        webkitConnection?: NetworkInformation
      }
      const connection = nav.connection || nav.mozConnection || nav.webkitConnection
      if (connection) {
        const slowTypes = ['slow-2g', '2g']
        setIsSlowConnection(
          slowTypes.includes(connection.effectiveType || '') || connection.saveData === true,
        )
      }
    }

    updateNetworkStatus()

    window.addEventListener('online', updateNetworkStatus)
    window.addEventListener('offline', updateNetworkStatus)

    const nav = navigator as Navigator & { connection?: NetworkInformation }
    const connection = nav.connection
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus)
    }

    return () => {
      window.removeEventListener('online', updateNetworkStatus)
      window.removeEventListener('offline', updateNetworkStatus)
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus)
      }
    }
  }, [])

  return { isSlowConnection, isOffline }
}
