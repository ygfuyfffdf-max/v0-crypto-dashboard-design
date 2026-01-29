/**
 * Performance Optimizations - Sistema de optimización para CHRONOS
 * Incluye memoización, virtualización, debounce, throttle
 */

import { useCallback, useEffect, useMemo, useRef, useState, memo, type ComponentType } from 'react'

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

/**
 * Hook de debounce para valores
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook de debounce para callbacks
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => callback(...args), delay)
  }, [callback, delay]) as T
}

/**
 * Hook de throttle para callbacks
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastRun.current >= delay) {
      lastRun.current = now
      callback(...args)
    } else if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {
        lastRun.current = Date.now()
        timeoutRef.current = null
        callback(...args)
      }, delay - (now - lastRun.current))
    }
  }, [callback, delay]) as T
}

// ============================================
// LAZY LOADING & INTERSECTION OBSERVER
// ============================================

/**
 * Hook para detectar visibilidad de elementos
 */
export function useInView(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1, ...options }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [options])

  return [ref, inView]
}

/**
 * Hook para carga lazy de componentes
 */
export function useLazyLoad<T>(
  loader: () => Promise<T>,
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, T | null, boolean] {
  const [ref, inView] = useInView(options)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (inView && !loadedRef.current) {
      loadedRef.current = true
      setLoading(true)
      loader()
        .then(setData)
        .finally(() => setLoading(false))
    }
  }, [inView, loader])

  return [ref, data, loading]
}

// ============================================
// ANIMATION FRAME
// ============================================

/**
 * Hook para animaciones con requestAnimationFrame
 */
export function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current
        callback(deltaTime)
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [callback])
}

// ============================================
// VIRTUAL LIST
// ============================================

interface VirtualListOptions {
  itemHeight: number
  overscan?: number
}

/**
 * Hook para virtualización de listas
 */
export function useVirtualList<T>(
  items: T[],
  containerHeight: number,
  options: VirtualListOptions
) {
  const { itemHeight, overscan = 3 } = options
  const [scrollTop, setScrollTop] = useState(0)

  const { startIndex, endIndex, virtualItems, totalHeight } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(items.length - 1, start + visibleCount + overscan * 2)

    const virtual = items.slice(start, end + 1).map((item, index) => ({
      item,
      index: start + index,
      style: {
        position: 'absolute' as const,
        top: (start + index) * itemHeight,
        height: itemHeight,
        left: 0,
        right: 0,
      },
    }))

    return {
      startIndex: start,
      endIndex: end,
      virtualItems: virtual,
      totalHeight: items.length * itemHeight,
    }
  }, [items, scrollTop, containerHeight, itemHeight, overscan])

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    handleScroll,
  }
}

// ============================================
// STABLE VALUES (evitar re-renders)
// ============================================

/**
 * Hook para mantener referencia estable de valores
 */
export function useStableValue<T>(value: T): T {
  const ref = useRef(value)

  if (JSON.stringify(ref.current) !== JSON.stringify(value)) {
    ref.current = value
  }

  return ref.current
}

/**
 * Hook para mantener callback estable
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(
  callback: T
): T {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  return useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args)
  }, []) as T
}

// ============================================
// MEMOIZATION HELPERS
// ============================================

/**
 * HOC para memoización profunda de componentes
 */
export function withMemo<P extends object>(
  Component: ComponentType<P>,
  propsAreEqual?: (prevProps: P, nextProps: P) => boolean
): ComponentType<P> {
  return memo(Component, propsAreEqual)
}

/**
 * Comparador de props por referencia superficial
 */
export function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (a[key] !== b[key]) return false
  }

  return true
}

// ============================================
// BATCH UPDATES
// ============================================

/**
 * Agrupar múltiples updates en un solo render
 */
export function batchUpdates(updates: Array<() => void>): void {
  // React 18+ hace batching automático, pero esto es útil para versiones anteriores
  Promise.resolve().then(() => {
    updates.forEach(update => update())
  })
}

// ============================================
// PERFORMANCE METRICS
// ============================================

/**
 * Hook para medir tiempo de render
 */
export function useRenderTime(componentName: string) {
  const startTime = useRef(performance.now())

  useEffect(() => {
    const endTime = performance.now()
    const duration = endTime - startTime.current

    if (duration > 16) { // Más de 1 frame a 60fps
      console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`)
    }
  })
}
