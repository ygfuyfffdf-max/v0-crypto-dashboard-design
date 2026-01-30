/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚡ PERFORMANCE OPTIMIZATION UTILITIES — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Utilidades avanzadas para optimización de performance:
 * 
 * ▸ 🔄 Virtual Lists - Para listas grandes (1000+ items)
 * ▸ 📦 Lazy Loading - Carga diferida de componentes
 * ▸ 🎯 Request Idle Callback - Tareas en segundo plano
 * ▸ 🧠 Memoization - Cache inteligente de cálculos
 * ▸ 📊 Intersection Observer - Detección de visibilidad
 * ▸ 🎬 RAF Scheduler - Animaciones a 60fps
 * 
 * @version 1.0.0 — OMEGA SUPREME EDITION
 */

'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔄 VIRTUAL LIST - Para renderizar listas enormes eficientemente
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VirtualListConfig<T> {
  items: T[]
  itemHeight: number | ((index: number) => number)
  overscan?: number // Items extra a renderizar arriba/abajo
  containerRef: RefObject<HTMLElement>
}

interface VirtualListResult<T> {
  virtualItems: Array<{ index: number; item: T; style: React.CSSProperties }>
  totalHeight: number
  scrollTo: (index: number) => void
}

export function useVirtualList<T>(config: VirtualListConfig<T>): VirtualListResult<T> {
  const { items, itemHeight, overscan = 5, containerRef } = config
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  
  // Calculate item heights
  const getItemHeight = useCallback((index: number) => {
    return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight
  }, [itemHeight])
  
  // Calculate total height
  const totalHeight = useMemo(() => {
    if (typeof itemHeight === 'number') {
      return items.length * itemHeight
    }
    return items.reduce((sum, _, index) => sum + getItemHeight(index), 0)
  }, [items, itemHeight, getItemHeight])
  
  // Calculate visible range
  const { startIndex, endIndex, offsetTop } = useMemo(() => {
    let start = 0
    let offset = 0
    let currentOffset = 0
    
    if (typeof itemHeight === 'number') {
      start = Math.floor(scrollTop / itemHeight)
      offset = start * itemHeight
    } else {
      for (let i = 0; i < items.length; i++) {
        const height = getItemHeight(i)
        if (currentOffset + height > scrollTop) {
          start = i
          offset = currentOffset
          break
        }
        currentOffset += height
      }
    }
    
    start = Math.max(0, start - overscan)
    
    let end = start
    let endOffset = offset
    
    if (typeof itemHeight === 'number') {
      end = Math.min(items.length - 1, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)
    } else {
      for (let i = start; i < items.length; i++) {
        const height = getItemHeight(i)
        endOffset += height
        end = i
        if (endOffset > scrollTop + containerHeight + overscan * (height || 50)) {
          break
        }
      }
    }
    
    return { startIndex: start, endIndex: end, offsetTop: offset }
  }, [scrollTop, containerHeight, items.length, itemHeight, getItemHeight, overscan])
  
  // Generate virtual items
  const virtualItems = useMemo(() => {
    const result: Array<{ index: number; item: T; style: React.CSSProperties }> = []
    let currentOffset = offsetTop
    
    for (let i = startIndex; i <= Math.min(endIndex, items.length - 1); i++) {
      const height = getItemHeight(i)
      
      // Recalculate offset for variable heights
      if (typeof itemHeight !== 'number') {
        currentOffset = 0
        for (let j = 0; j < i; j++) {
          currentOffset += getItemHeight(j)
        }
      }
      
      result.push({
        index: i,
        item: items[i],
        style: {
          position: 'absolute',
          top: currentOffset,
          left: 0,
          right: 0,
          height,
        },
      })
      
      currentOffset += height
    }
    
    return result
  }, [startIndex, endIndex, items, getItemHeight, itemHeight, offsetTop])
  
  // Scroll handler
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    const handleScroll = () => {
      setScrollTop(container.scrollTop)
    }
    
    const handleResize = () => {
      setContainerHeight(container.clientHeight)
    }
    
    // Initial
    handleResize()
    handleScroll()
    
    container.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
    }
  }, [containerRef])
  
  // Scroll to item
  const scrollTo = useCallback((index: number) => {
    const container = containerRef.current
    if (!container) return
    
    let offset = 0
    if (typeof itemHeight === 'number') {
      offset = index * itemHeight
    } else {
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i)
      }
    }
    
    container.scrollTo({ top: offset, behavior: 'smooth' })
  }, [containerRef, itemHeight, getItemHeight])
  
  return { virtualItems, totalHeight, scrollTo }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 useIntersectionObserver - Detección de visibilidad optimizada
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface IntersectionOptions {
  threshold?: number | number[]
  rootMargin?: string
  triggerOnce?: boolean
  enabled?: boolean
}

export function useIntersectionObserver<T extends Element>(
  options: IntersectionOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0, rootMargin = '0px', triggerOnce = false, enabled = true } = options
  const ref = useRef<T>(null)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const hasTriggered = useRef(false)
  
  useEffect(() => {
    if (!enabled || (triggerOnce && hasTriggered.current)) return
    
    const element = ref.current
    if (!element) return
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        const intersecting = entry.isIntersecting
        setIsIntersecting(intersecting)
        
        if (intersecting && triggerOnce) {
          hasTriggered.current = true
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )
    
    observer.observe(element)
    
    return () => observer.disconnect()
  }, [threshold, rootMargin, triggerOnce, enabled])
  
  return [ref, isIntersecting]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 useIdleCallback - Ejecutar tareas cuando el browser está ocioso
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface IdleCallbackOptions {
  timeout?: number
}

export function useIdleCallback(callback: () => void, options: IdleCallbackOptions = {}) {
  const { timeout = 2000 } = options
  const callbackRef = useRef(callback)
  
  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Fallback for browsers without requestIdleCallback
    const requestIdleCallback = 
      window.requestIdleCallback || 
      ((cb: IdleRequestCallback) => setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 } as IdleDeadline), 1))
    
    const cancelIdleCallback = 
      window.cancelIdleCallback || 
      clearTimeout
    
    const id = requestIdleCallback(() => {
      callbackRef.current()
    }, { timeout })
    
    return () => cancelIdleCallback(id)
  }, [timeout])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 useRAFLoop - Animaciones fluidas a 60fps
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface RAFLoopOptions {
  enabled?: boolean
  fps?: number // Target FPS (default: 60)
}

export function useRAFLoop(
  callback: (deltaTime: number, elapsedTime: number) => void,
  options: RAFLoopOptions = {}
) {
  const { enabled = true, fps = 60 } = options
  const callbackRef = useRef(callback)
  const frameRef = useRef<number>(0)
  const previousTimeRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  
  // Min time between frames (for FPS limiting)
  const minFrameTime = 1000 / fps
  
  // Keep callback ref updated
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])
  
  useEffect(() => {
    if (!enabled) return
    
    const animate = (time: number) => {
      if (startTimeRef.current === 0) {
        startTimeRef.current = time
        previousTimeRef.current = time
      }
      
      const deltaTime = time - previousTimeRef.current
      const elapsedTime = time - startTimeRef.current
      
      // FPS limiting
      if (deltaTime >= minFrameTime) {
        previousTimeRef.current = time
        callbackRef.current(deltaTime, elapsedTime)
      }
      
      frameRef.current = requestAnimationFrame(animate)
    }
    
    frameRef.current = requestAnimationFrame(animate)
    
    return () => {
      cancelAnimationFrame(frameRef.current)
    }
  }, [enabled, minFrameTime])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧠 useMemoizedCalculation - Cache inteligente de cálculos costosos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MemoCache<T> {
  key: string
  value: T
  timestamp: number
}

export function useMemoizedCalculation<T, D extends unknown[]>(
  calculate: (...deps: D) => T,
  deps: D,
  options: { maxAge?: number; cacheKey?: string } = {}
): T {
  const { maxAge = 5000, cacheKey } = options
  const cacheRef = useRef<MemoCache<T> | null>(null)
  
  const key = cacheKey || JSON.stringify(deps)
  const now = Date.now()
  
  return useMemo(() => {
    // Check cache
    if (cacheRef.current) {
      const { key: cachedKey, value, timestamp } = cacheRef.current
      
      // Cache hit and not expired
      if (cachedKey === key && now - timestamp < maxAge) {
        return value
      }
    }
    
    // Calculate new value
    const newValue = calculate(...deps)
    
    // Update cache
    cacheRef.current = { key, value: newValue, timestamp: now }
    
    return newValue
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, maxAge])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 useDeferredValue - Valor diferido para UI responsiva
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useSmartDeferredValue<T>(value: T, delay: number = 100): T {
  const [deferredValue, setDeferredValue] = useState(value)
  const timeoutRef = useRef<NodeJS.Timeout>()
  
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      setDeferredValue(value)
    }, delay)
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [value, delay])
  
  return deferredValue
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔋 useDebounce & useThrottle - Control de frecuencia
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  
  return debouncedValue
}

export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastExecuted = useRef<number>(Date.now())
  
  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastExecuted.current
    
    if (elapsed >= interval) {
      setThrottledValue(value)
      lastExecuted.current = now
    } else {
      const timerId = setTimeout(() => {
        setThrottledValue(value)
        lastExecuted.current = Date.now()
      }, interval - elapsed)
      
      return () => clearTimeout(timerId)
    }
  }, [value, interval])
  
  return throttledValue
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📐 useMeasure - Medir dimensiones de elementos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Dimensions {
  width: number
  height: number
  top: number
  left: number
  right: number
  bottom: number
}

export function useMeasure<T extends Element>(): [RefObject<T>, Dimensions] {
  const ref = useRef<T>(null)
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  })
  
  useEffect(() => {
    const element = ref.current
    if (!element) return
    
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const { width, height, top, left, right, bottom } = entry.contentRect
        setDimensions({ width, height, top, left, right, bottom })
      }
    })
    
    resizeObserver.observe(element)
    
    return () => resizeObserver.disconnect()
  }, [])
  
  return [ref, dimensions]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 useOnClickOutside - Detectar clicks fuera de elemento
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useOnClickOutside<T extends Element>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const element = ref.current
      if (!element || element.contains(event.target as Node)) {
        return
      }
      handler(event)
    }
    
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    
    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  useVirtualList,
  useIdleCallback,
  useRAFLoop,
  useMemoizedCalculation,
  useSmartDeferredValue,
  useMeasure,
  useOnClickOutside,
}
