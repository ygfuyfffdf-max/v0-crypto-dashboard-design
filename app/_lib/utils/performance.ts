// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚡ PERFORMANCE OPTIMIZATIONS — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Optimizaciones de rendimiento para el sistema:
 * - Virtualización de listas largas
 * - Memoización avanzada
 * - Debounce y throttle
 * - Query optimizations
 * - Lazy loading helpers
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DependencyList,
  type RefObject,
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DEBOUNCE HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Debounce hook para evitar llamadas excesivas
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Debounced callback hook
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay]
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// THROTTLE HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Throttle hook para limitar frecuencia de ejecución
 */
export function useThrottle<T>(value: T, interval: number = 300): T {
  const [throttledValue, setThrottledValue] = useState<T>(value)
  const lastExecuted = useRef<number>(Date.now())

  useEffect(() => {
    if (Date.now() >= lastExecuted.current + interval) {
      lastExecuted.current = Date.now()
      setThrottledValue(value)
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now()
        setThrottledValue(value)
      }, interval)

      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}

/**
 * Throttled callback hook
 */
export function useThrottledCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  interval: number = 300
): T {
  const lastExecuted = useRef<number>(0)
  const callbackRef = useRef(callback)
  const pendingArgsRef = useRef<Parameters<T> | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastExecuted.current >= interval) {
        lastExecuted.current = now
        callbackRef.current(...args)
      } else {
        pendingArgsRef.current = args

        if (!timeoutRef.current) {
          timeoutRef.current = setTimeout(() => {
            lastExecuted.current = Date.now()
            if (pendingArgsRef.current) {
              callbackRef.current(...pendingArgsRef.current)
              pendingArgsRef.current = null
            }
            timeoutRef.current = null
          }, interval - (now - lastExecuted.current))
        }
      }
    }) as T,
    [interval]
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VIRTUAL LIST HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VirtualListConfig<T> {
  items: T[]
  itemHeight: number
  containerRef: RefObject<HTMLElement>
  overscan?: number
}

interface VirtualListResult<T> {
  virtualItems: Array<{ index: number; item: T; style: React.CSSProperties }>
  totalHeight: number
  startIndex: number
  endIndex: number
}

/**
 * Hook para virtualización de listas largas
 */
export function useVirtualList<T>({
  items,
  itemHeight,
  containerRef,
  overscan = 3,
}: VirtualListConfig<T>): VirtualListResult<T> {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const updateMeasurements = () => {
      setContainerHeight(container.clientHeight)
    }

    const handleScroll = () => {
      setScrollTop(container.scrollTop)
    }

    // Initial measurement
    updateMeasurements()

    // Add event listeners
    container.addEventListener('scroll', handleScroll, { passive: true })
    const resizeObserver = new ResizeObserver(updateMeasurements)
    resizeObserver.observe(container)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      resizeObserver.disconnect()
    }
  }, [containerRef])

  return useMemo(() => {
    const totalHeight = items.length * itemHeight

    if (containerHeight === 0) {
      return {
        virtualItems: [],
        totalHeight,
        startIndex: 0,
        endIndex: 0,
      }
    }

    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2)

    const virtualItems = []
    for (let i = startIndex; i <= endIndex; i++) {
      virtualItems.push({
        index: i,
        item: items[i],
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          height: itemHeight,
          left: 0,
          right: 0,
        },
      })
    }

    return {
      virtualItems,
      totalHeight,
      startIndex,
      endIndex,
    }
  }, [items, itemHeight, scrollTop, containerHeight, overscan])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// INTERSECTION OBSERVER HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface IntersectionOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean
}

/**
 * Hook para lazy loading basado en visibilidad
 */
export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options: IntersectionOptions = {}
): IntersectionObserverEntry | undefined {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false
  } = options

  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const frozen = entry?.isIntersecting && freezeOnceVisible

  useEffect(() => {
    const node = elementRef?.current

    if (frozen || !node) return

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [elementRef, threshold, root, rootMargin, frozen])

  return entry
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MEMOIZED SELECTOR HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook para selección memoizada de datos
 */
export function useMemoizedSelector<TData, TResult>(
  data: TData,
  selector: (data: TData) => TResult,
  deps: DependencyList = []
): TResult {
  const selectorRef = useRef(selector)
  selectorRef.current = selector

  return useMemo(
    () => selectorRef.current(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, ...deps]
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PREVIOUS VALUE HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook para obtener el valor anterior de una variable
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STABLE CALLBACK HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook para mantener callbacks estables entre renders
 */
export function useStableCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T
): T {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
    []
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUERY BATCHING UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface BatchedQueryConfig<TInput, TResult> {
  batchFn: (inputs: TInput[]) => Promise<Map<TInput, TResult>>
  delayMs?: number
  maxBatchSize?: number
}

class QueryBatcher<TInput, TResult> {
  private batchFn: (inputs: TInput[]) => Promise<Map<TInput, TResult>>
  private delayMs: number
  private maxBatchSize: number
  private pending: Map<TInput, {
    resolve: (value: TResult) => void
    reject: (error: Error) => void
  }[]> = new Map()
  private timer: NodeJS.Timeout | null = null

  constructor(config: BatchedQueryConfig<TInput, TResult>) {
    this.batchFn = config.batchFn
    this.delayMs = config.delayMs ?? 10
    this.maxBatchSize = config.maxBatchSize ?? 100
  }

  async query(input: TInput): Promise<TResult> {
    return new Promise((resolve, reject) => {
      const handlers = this.pending.get(input) || []
      handlers.push({ resolve, reject })
      this.pending.set(input, handlers)

      if (this.pending.size >= this.maxBatchSize) {
        this.flush()
      } else if (!this.timer) {
        this.timer = setTimeout(() => {
          this.flush()
        }, this.delayMs)
      }
    })
  }

  private async flush() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }

    const batch = this.pending
    this.pending = new Map()

    if (batch.size === 0) return

    try {
      const inputs = Array.from(batch.keys())
      const results = await this.batchFn(inputs)

      for (const [input, handlers] of batch) {
        const result = results.get(input)
        if (result !== undefined) {
          handlers.forEach((h) => h.resolve(result))
        } else {
          handlers.forEach((h) => h.reject(new Error(`No result for input: ${input}`)))
        }
      }
    } catch (error) {
      for (const handlers of batch.values()) {
        handlers.forEach((h) => h.reject(error instanceof Error ? error : new Error('Batch query failed')))
      }
    }
  }
}

/**
 * Hook para crear un query batcher
 */
export function useQueryBatcher<TInput, TResult>(
  config: BatchedQueryConfig<TInput, TResult>
): QueryBatcher<TInput, TResult> {
  return useMemo(() => new QueryBatcher(config), [config])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// RAF (REQUEST ANIMATION FRAME) UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook para ejecutar callbacks en RAF
 */
export function useAnimationFrame(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>()
  const previousTimeRef = useRef<number>()
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current
        callbackRef.current(deltaTime)
      }
      previousTimeRef.current = time
      requestRef.current = requestAnimationFrame(animate)
    }

    requestRef.current = requestAnimationFrame(animate)

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// OPTIMIZED STATE UPDATE UTILS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook para updates de estado inmutables y optimizados
 */
export function useImmerReducer<S, A>(
  reducer: (draft: S, action: A) => void | S,
  initialState: S
): [S, (action: A) => void] {
  const [state, setState] = useState(initialState)

  const dispatch = useCallback((action: A) => {
    setState((prevState) => {
      // Shallow clone for basic immutability
      const draft = structuredClone(prevState)
      const result = reducer(draft, action)
      return result !== undefined ? result : draft
    })
  }, [reducer])

  return [state, dispatch]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM PERFORMANCE HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormPerformanceConfig {
  debounceMs?: number
  validateOnChange?: boolean
}

/**
 * Hook para formularios de alto rendimiento con validación debounced
 */
export function usePerformantForm<T extends Record<string, unknown>>(
  initialValues: T,
  config: FormPerformanceConfig = {}
) {
  const { debounceMs = 300, validateOnChange = true } = config
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const valuesRef = useRef(values)

  useEffect(() => {
    valuesRef.current = values
  }, [values])

  const setFieldValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }))
  }, [])

  const setFieldTouched = useCallback(<K extends keyof T>(field: K, isTouched: boolean = true) => {
    setTouched((prev) => ({ ...prev, [field]: isTouched }))
  }, [])

  const setFieldError = useCallback(<K extends keyof T>(field: K, error: string | undefined) => {
    setErrors((prev) => {
      if (error === undefined) {
        const { [field]: _, ...rest } = prev
        return rest as Partial<Record<keyof T, string>>
      }
      return { ...prev, [field]: error }
    })
  }, [])

  // Debounced change handler
  const handleChange = useDebouncedCallback(
    useCallback(<K extends keyof T>(field: K, value: T[K]) => {
      setFieldValue(field, value)
      if (validateOnChange) {
        setFieldTouched(field)
      }
    }, [setFieldValue, setFieldTouched, validateOnChange]),
    debounceMs
  )

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
  }, [initialValues])

  return {
    values,
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    handleChange,
    reset,
    getFieldProps: <K extends keyof T>(field: K) => ({
      value: values[field],
      onChange: (value: T[K]) => handleChange(field, value),
      onBlur: () => setFieldTouched(field),
      error: errors[field],
      touched: touched[field],
    }),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MEMOIZED COMPONENT WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Helper para crear componentes memoizados con comparación profunda
 */
export function deepMemo<P extends object>(
  Component: React.ComponentType<P>,
  propsAreEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<React.ComponentType<P>> {
  const defaultPropsAreEqual = (prevProps: Readonly<P>, nextProps: Readonly<P>): boolean => {
    const prevKeys = Object.keys(prevProps) as Array<keyof P>
    const nextKeys = Object.keys(nextProps) as Array<keyof P>

    if (prevKeys.length !== nextKeys.length) return false

    return prevKeys.every((key) => {
      const prevValue = prevProps[key]
      const nextValue = nextProps[key]

      if (typeof prevValue === 'function' && typeof nextValue === 'function') {
        return true // Skip function comparison
      }

      if (prevValue === nextValue) return true

      if (
        typeof prevValue === 'object' &&
        typeof nextValue === 'object' &&
        prevValue !== null &&
        nextValue !== null
      ) {
        return JSON.stringify(prevValue) === JSON.stringify(nextValue)
      }

      return false
    })
  }

  return React.memo(Component, propsAreEqual ?? defaultPropsAreEqual)
}

export default {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useThrottledCallback,
  useVirtualList,
  useIntersectionObserver,
  useMemoizedSelector,
  usePrevious,
  useStableCallback,
  useQueryBatcher,
  useAnimationFrame,
  useImmerReducer,
  usePerformantForm,
  deepMemo,
}
