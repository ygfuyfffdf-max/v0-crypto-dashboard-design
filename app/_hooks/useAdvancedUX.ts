/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🎯 CHRONOS INFINITY 2030 — HOOKS AVANZADOS DE EXPERIENCIA DE USUARIO
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 
 * Colección de hooks premium para mejorar la UX:
 * - Optimistic updates
 * - Debounce/Throttle
 * - Intersection observer
 * - Media queries
 * - Local storage sincronizado
 * - Keyboard shortcuts
 * - Clipboard
 * - Online status
 * - Scroll position
 * - Window size
 * 
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE DEBOUNCE — Debounce de valores
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook para debounce de valores
 * @param value Valor a debounce
 * @param delay Delay en ms
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
 * Hook para callback con debounce
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => callback(...args), delay)
    },
    [callback, delay]
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE THROTTLE — Throttle de callbacks
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastRan = useRef(Date.now())

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value)
        lastRan.current = Date.now()
      }
    }, limit - (Date.now() - lastRan.current))

    return () => clearTimeout(handler)
  }, [value, limit])

  return throttledValue
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE OPTIMISTIC — Updates optimistas con reconciliación
// ═══════════════════════════════════════════════════════════════════════════════════════

interface UseOptimisticOptions<T> {
  onError?: (error: Error) => void
  onSuccess?: (result: T) => void
  rollbackDelay?: number
}

export function useOptimistic<T, TInput>(
  initialValue: T,
  reducer: (currentValue: T, input: TInput) => T,
  options: UseOptimisticOptions<T> = {}
) {
  const [value, setValue] = useState(initialValue)
  const [optimisticValue, setOptimisticValue] = useState(initialValue)
  const [isPending, setIsPending] = useState(false)
  const rollbackValueRef = useRef(initialValue)

  const addOptimistic = useCallback(
    async (
      input: TInput,
      asyncAction: () => Promise<T>
    ) => {
      // Guardar valor actual para rollback
      rollbackValueRef.current = optimisticValue
      
      // Aplicar actualización optimista
      const newOptimisticValue = reducer(optimisticValue, input)
      setOptimisticValue(newOptimisticValue)
      setIsPending(true)

      try {
        const result = await asyncAction()
        setValue(result)
        setOptimisticValue(result)
        options.onSuccess?.(result)
        return result
      } catch (error) {
        // Rollback en caso de error
        setOptimisticValue(rollbackValueRef.current)
        options.onError?.(error as Error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [optimisticValue, reducer, options]
  )

  return {
    value: optimisticValue,
    confirmedValue: value,
    isPending,
    addOptimistic,
    reset: () => {
      setValue(initialValue)
      setOptimisticValue(initialValue)
    },
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE INTERSECTION OBSERVER — Observador de intersección
// ═══════════════════════════════════════════════════════════════════════════════════════

interface UseIntersectionObserverOptions {
  threshold?: number | number[]
  root?: Element | null
  rootMargin?: string
  freezeOnceVisible?: boolean
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {}
): [React.RefCallback<Element>, boolean, IntersectionObserverEntry | undefined] {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options

  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [isIntersecting, setIsIntersecting] = useState(false)
  const frozen = useRef(false)

  const updateEntry = ([entry]: IntersectionObserverEntry[]) => {
    if (frozen.current) return
    setEntry(entry)
    setIsIntersecting(entry.isIntersecting)
    
    if (freezeOnceVisible && entry.isIntersecting) {
      frozen.current = true
    }
  }

  const ref = useCallback(
    (node: Element | null) => {
      if (!node) return

      const observer = new IntersectionObserver(updateEntry, {
        threshold,
        root,
        rootMargin,
      })

      observer.observe(node)

      return () => observer.disconnect()
    },
    [threshold, root, rootMargin]
  )

  return [ref, isIntersecting, entry]
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE MEDIA QUERY — Queries de medios reactivas
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      const matchMedia = window.matchMedia(query)
      matchMedia.addEventListener('change', callback)
      return () => matchMedia.removeEventListener('change', callback)
    },
    [query]
  )

  const getSnapshot = useCallback(() => {
    return window.matchMedia(query).matches
  }, [query])

  const getServerSnapshot = useCallback(() => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

// Breakpoints predefinidos
export const useIsMobile = () => useMediaQuery('(max-width: 639px)')
export const useIsTablet = () => useMediaQuery('(min-width: 640px) and (max-width: 1023px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')
export const useIsLargeDesktop = () => useMediaQuery('(min-width: 1280px)')
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)')

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE LOCAL STORAGE — Storage sincronizado
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Estado inicial desde localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Setter que persiste en localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
          
          // Disparar evento para sincronizar otras pestañas
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
          }))
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Remover del storage
  const remove = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  // Sincronizar con otras pestañas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue))
        } catch {
          // Ignorar errores de parsing
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [storedValue, setValue, remove]
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE KEYBOARD SHORTCUT — Atajos de teclado
// ═══════════════════════════════════════════════════════════════════════════════════════

type KeyboardModifier = 'ctrl' | 'alt' | 'shift' | 'meta'

interface KeyboardShortcut {
  key: string
  modifiers?: KeyboardModifier[]
  callback: (event: KeyboardEvent) => void
  preventDefault?: boolean
}

export function useKeyboardShortcut(shortcuts: KeyboardShortcut | KeyboardShortcut[]) {
  useEffect(() => {
    const shortcutArray = Array.isArray(shortcuts) ? shortcuts : [shortcuts]

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcutArray) {
        const { key, modifiers = [], callback, preventDefault = true } = shortcut

        // Verificar key
        if (event.key.toLowerCase() !== key.toLowerCase()) continue

        // Verificar modificadores
        const ctrlMatch = modifiers.includes('ctrl') === (event.ctrlKey || event.metaKey)
        const altMatch = modifiers.includes('alt') === event.altKey
        const shiftMatch = modifiers.includes('shift') === event.shiftKey

        if (ctrlMatch && altMatch && shiftMatch) {
          if (preventDefault) event.preventDefault()
          callback(event)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE CLIPBOARD — Portapapeles
// ═══════════════════════════════════════════════════════════════════════════════════════

interface UseClipboardOptions {
  timeout?: number
  onCopy?: (text: string) => void
  onError?: (error: Error) => void
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const { timeout = 2000, onCopy, onError } = options
  const [hasCopied, setHasCopied] = useState(false)
  const [copiedText, setCopiedText] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

  const copy = useCallback(
    async (text: string) => {
      if (!navigator?.clipboard) {
        const error = new Error('Clipboard API not available')
        onError?.(error)
        return false
      }

      try {
        await navigator.clipboard.writeText(text)
        setCopiedText(text)
        setHasCopied(true)
        onCopy?.(text)

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          setHasCopied(false)
        }, timeout)

        return true
      } catch (error) {
        onError?.(error as Error)
        return false
      }
    },
    [timeout, onCopy, onError]
  )

  const reset = useCallback(() => {
    setHasCopied(false)
    setCopiedText(null)
  }, [])

  return { copy, hasCopied, copiedText, reset }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE ONLINE STATUS — Estado de conexión
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useOnlineStatus(): boolean {
  const subscribe = useCallback((callback: () => void) => {
    window.addEventListener('online', callback)
    window.addEventListener('offline', callback)
    return () => {
      window.removeEventListener('online', callback)
      window.removeEventListener('offline', callback)
    }
  }, [])

  const getSnapshot = useCallback(() => navigator.onLine, [])
  const getServerSnapshot = useCallback(() => true, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE SCROLL POSITION — Posición de scroll
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ScrollPosition {
  x: number
  y: number
  direction: 'up' | 'down' | 'none'
  isAtTop: boolean
  isAtBottom: boolean
  progress: number // 0-1
}

export function useScrollPosition(): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: 'none',
    isAtTop: true,
    isAtBottom: false,
    progress: 0,
  })
  
  const lastY = useRef(0)

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY
      const x = window.scrollX
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      
      setPosition({
        x,
        y,
        direction: y > lastY.current ? 'down' : y < lastY.current ? 'up' : 'none',
        isAtTop: y <= 0,
        isAtBottom: y >= maxScroll - 10,
        progress: maxScroll > 0 ? y / maxScroll : 0,
      })
      
      lastY.current = y
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return position
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE WINDOW SIZE — Tamaño de ventana
// ═══════════════════════════════════════════════════════════════════════════════════════

interface WindowSize {
  width: number
  height: number
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE PREVIOUS — Valor anterior
// ═══════════════════════════════════════════════════════════════════════════════════════

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>()
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE TOGGLE — Toggle booleano
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useToggle(
  initialValue = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue)
  
  const toggle = useCallback(() => setValue((v) => !v), [])
  const set = useCallback((v: boolean) => setValue(v), [])
  
  return [value, toggle, set]
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE INTERVAL — Intervalo con cleanup automático
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE TIMEOUT — Timeout con cleanup automático
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback)

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    if (delay === null) return

    const id = setTimeout(() => savedCallback.current(), delay)
    return () => clearTimeout(id)
  }, [delay])
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// USE ASYNC — Manejo de operaciones async
// ═══════════════════════════════════════════════════════════════════════════════════════

interface AsyncState<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
): AsyncState<T> & { execute: () => Promise<void>; reset: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: immediate,
    isSuccess: false,
    isError: false,
  })

  const execute = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, isError: false }))
    
    try {
      const data = await asyncFunction()
      setState({
        data,
        error: null,
        isLoading: false,
        isSuccess: true,
        isError: false,
      })
    } catch (error) {
      setState({
        data: null,
        error: error as Error,
        isLoading: false,
        isSuccess: false,
        isError: true,
      })
    }
  }, [asyncFunction])

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    })
  }, [])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { ...state, execute, reset }
}
