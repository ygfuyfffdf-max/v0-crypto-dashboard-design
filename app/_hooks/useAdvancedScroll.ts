/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌊 CHRONOS 2026 — ADVANCED SCROLL SYSTEM (iOS-INSPIRED)
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de scroll avanzado inspirado en iOS con:
 * - Rubber band effect (bounce elegante al final del scroll)
 * - Momentum scroll con física realista
 * - Pull-to-refresh integrado
 * - Snap points para navegación por secciones
 * - Overscroll indicators premium
 * - Scroll velocity tracking
 * - Auto-hide scrollbar con reveal on scroll
 * - Scroll direction detection
 * - Infinite scroll support
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useCallback, useEffect, useRef, useState, useMemo } from 'react'
import { useMotionValue, useSpring, useTransform, MotionValue, animate } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface AdvancedScrollConfig {
  /** Habilitar rubber band effect (bounce) */
  rubberBand?: boolean
  /** Resistencia del rubber band (0-1) - menor = más resistencia */
  rubberBandResistance?: number
  /** Máximo overscroll en pixels */
  maxOverscroll?: number
  /** Habilitar momentum scroll */
  momentum?: boolean
  /** Factor de deceleración del momentum (0-1) */
  momentumDecay?: number
  /** Habilitar pull-to-refresh */
  pullToRefresh?: boolean
  /** Umbral para activar refresh en pixels */
  refreshThreshold?: number
  /** Callback al activar refresh */
  onRefresh?: () => Promise<void>
  /** Habilitar snap points */
  snapEnabled?: boolean
  /** Puntos de snap (índices o offsets) */
  snapPoints?: number[]
  /** Duración del snap animation */
  snapDuration?: number
  /** Habilitar infinite scroll */
  infiniteScroll?: boolean
  /** Umbral para cargar más (pixels desde el final) */
  infiniteScrollThreshold?: number
  /** Callback para cargar más */
  onLoadMore?: () => Promise<void>
  /** Auto-hide scrollbar */
  autoHideScrollbar?: boolean
  /** Delay para ocultar scrollbar (ms) */
  scrollbarHideDelay?: number
  /** Dirección del scroll */
  direction?: 'vertical' | 'horizontal' | 'both'
  /** Habilitar scroll lock durante animaciones */
  lockDuringAnimation?: boolean
}

export interface ScrollState {
  /** Posición actual del scroll */
  position: { x: number; y: number }
  /** Velocidad actual del scroll */
  velocity: { x: number; y: number }
  /** Dirección del scroll */
  direction: 'up' | 'down' | 'left' | 'right' | 'none'
  /** Si está en overscroll */
  isOverscrolling: boolean
  /** Cantidad de overscroll */
  overscrollAmount: { top: number; bottom: number; left: number; right: number }
  /** Si se está haciendo pull-to-refresh */
  isPulling: boolean
  /** Progreso del pull (0-1) */
  pullProgress: number
  /** Si está cargando (refresh) */
  isRefreshing: boolean
  /** Si está cargando más (infinite) */
  isLoadingMore: boolean
  /** Si el scrollbar está visible */
  scrollbarVisible: boolean
  /** Si está en el inicio del scroll */
  isAtStart: boolean
  /** Si está al final del scroll */
  isAtEnd: boolean
  /** Porcentaje de scroll (0-100) */
  scrollPercentage: number
}

export interface UseAdvancedScrollReturn {
  /** Ref para el contenedor con scroll */
  scrollRef: React.RefObject<HTMLDivElement>
  /** Estado del scroll */
  state: ScrollState
  /** Motion values para animaciones */
  motionValues: {
    scrollY: MotionValue<number>
    scrollX: MotionValue<number>
    smoothScrollY: MotionValue<number>
    smoothScrollX: MotionValue<number>
    velocityY: MotionValue<number>
    velocityX: MotionValue<number>
    overscrollY: MotionValue<number>
    overscrollX: MotionValue<number>
    pullProgress: MotionValue<number>
    scrollProgress: MotionValue<number>
  }
  /** Funciones de control */
  controls: {
    /** Scroll a una posición */
    scrollTo: (options: { x?: number; y?: number; animated?: boolean; duration?: number }) => void
    /** Scroll al inicio */
    scrollToStart: (animated?: boolean) => void
    /** Scroll al final */
    scrollToEnd: (animated?: boolean) => void
    /** Scroll a un elemento */
    scrollToElement: (element: HTMLElement, options?: { offset?: number; animated?: boolean }) => void
    /** Scroll a un snap point */
    snapTo: (index: number, animated?: boolean) => void
    /** Lock/unlock scroll */
    setLocked: (locked: boolean) => void
    /** Forzar refresh */
    triggerRefresh: () => Promise<void>
    /** Actualizar dimensiones */
    updateDimensions: () => void
  }
  /** Estilos CSS para aplicar al contenedor */
  containerStyles: React.CSSProperties
  /** Clases CSS para el contenedor */
  containerClassName: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN POR DEFECTO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: Required<AdvancedScrollConfig> = {
  rubberBand: true,
  rubberBandResistance: 0.55,
  maxOverscroll: 100,
  momentum: true,
  momentumDecay: 0.95,
  pullToRefresh: false,
  refreshThreshold: 80,
  onRefresh: async () => {},
  snapEnabled: false,
  snapPoints: [],
  snapDuration: 400,
  infiniteScroll: false,
  infiniteScrollThreshold: 200,
  onLoadMore: async () => {},
  autoHideScrollbar: true,
  scrollbarHideDelay: 1500,
  direction: 'vertical',
  lockDuringAnimation: false,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useAdvancedScroll(config: AdvancedScrollConfig = {}): UseAdvancedScrollReturn {
  const mergedConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config])

  const scrollRef = useRef<HTMLDivElement>(null)
  const lastScrollY = useRef(0)
  const lastScrollX = useRef(0)
  const lastScrollTime = useRef(Date.now())
  const scrollbarTimeoutRef = useRef<NodeJS.Timeout>()
  const isLockedRef = useRef(false)
  const isTouchingRef = useRef(false)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)

  // Motion values
  const scrollY = useMotionValue(0)
  const scrollX = useMotionValue(0)
  const velocityY = useMotionValue(0)
  const velocityX = useMotionValue(0)
  const overscrollY = useMotionValue(0)
  const overscrollX = useMotionValue(0)
  const pullProgress = useMotionValue(0)

  // Smooth springs
  const smoothScrollY = useSpring(scrollY, { stiffness: 300, damping: 40 })
  const smoothScrollX = useSpring(scrollX, { stiffness: 300, damping: 40 })

  // Scroll progress (0-1)
  const scrollProgress = useMotionValue(0)

  // Estado
  const [state, setState] = useState<ScrollState>({
    position: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    direction: 'none',
    isOverscrolling: false,
    overscrollAmount: { top: 0, bottom: 0, left: 0, right: 0 },
    isPulling: false,
    pullProgress: 0,
    isRefreshing: false,
    isLoadingMore: false,
    scrollbarVisible: false,
    isAtStart: true,
    isAtEnd: false,
    scrollPercentage: 0,
  })

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  const updateScrollState = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const now = Date.now()
    const dt = Math.max(1, now - lastScrollTime.current)

    const currentY = container.scrollTop
    const currentX = container.scrollLeft

    const vY = (currentY - lastScrollY.current) / dt * 16.67
    const vX = (currentX - lastScrollX.current) / dt * 16.67

    // Actualizar motion values
    scrollY.set(currentY)
    scrollX.set(currentX)
    velocityY.set(vY)
    velocityX.set(vX)

    // Calcular progreso
    const maxScrollY = container.scrollHeight - container.clientHeight
    const progress = maxScrollY > 0 ? currentY / maxScrollY : 0
    scrollProgress.set(progress)

    // Determinar dirección
    let direction: ScrollState['direction'] = 'none'
    if (Math.abs(vY) > Math.abs(vX)) {
      direction = vY > 0 ? 'down' : vY < 0 ? 'up' : 'none'
    } else {
      direction = vX > 0 ? 'right' : vX < 0 ? 'left' : 'none'
    }

    // Detectar overscroll
    const maxScrollX = container.scrollWidth - container.clientWidth
    const isAtStart = currentY <= 0 && currentX <= 0
    const isAtEndY = currentY >= maxScrollY
    const isAtEndX = currentX >= maxScrollX

    // Actualizar estado
    setState(prev => ({
      ...prev,
      position: { x: currentX, y: currentY },
      velocity: { x: vX, y: vY },
      direction,
      isAtStart,
      isAtEnd: isAtEndY || isAtEndX,
      scrollPercentage: progress * 100,
      scrollbarVisible: true,
    }))

    // Auto-hide scrollbar
    if (mergedConfig.autoHideScrollbar) {
      if (scrollbarTimeoutRef.current) {
        clearTimeout(scrollbarTimeoutRef.current)
      }
      scrollbarTimeoutRef.current = setTimeout(() => {
        setState(prev => ({ ...prev, scrollbarVisible: false }))
      }, mergedConfig.scrollbarHideDelay)
    }

    // Infinite scroll check
    if (mergedConfig.infiniteScroll && isAtEndY && !state.isLoadingMore) {
      const distanceFromEnd = maxScrollY - currentY
      if (distanceFromEnd < mergedConfig.infiniteScrollThreshold) {
        handleLoadMore()
      }
    }

    lastScrollY.current = currentY
    lastScrollX.current = currentX
    lastScrollTime.current = now
  }, [mergedConfig, state.isLoadingMore])

  const handleLoadMore = useCallback(async () => {
    if (state.isLoadingMore) return

    setState(prev => ({ ...prev, isLoadingMore: true }))
    try {
      await mergedConfig.onLoadMore()
    } finally {
      setState(prev => ({ ...prev, isLoadingMore: false }))
    }
  }, [mergedConfig, state.isLoadingMore])

  const handleRefresh = useCallback(async () => {
    if (state.isRefreshing) return

    setState(prev => ({ ...prev, isRefreshing: true }))
    try {
      await mergedConfig.onRefresh()
    } finally {
      setState(prev => ({ ...prev, isRefreshing: false, isPulling: false }))
      pullProgress.set(0)
    }
  }, [mergedConfig, state.isRefreshing, pullProgress])

  // Touch handlers para rubber band y pull-to-refresh
  const handleTouchStart = useCallback((e: TouchEvent) => {
    isTouchingRef.current = true
    touchStartY.current = e.touches[0].clientY
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isTouchingRef.current || !scrollRef.current) return

    const currentY = e.touches[0].clientY
    const deltaY = currentY - touchStartY.current
    const container = scrollRef.current

    // Pull-to-refresh check
    if (mergedConfig.pullToRefresh && container.scrollTop <= 0 && deltaY > 0) {
      e.preventDefault()

      // Apply rubber band resistance
      const resistedDelta = deltaY * mergedConfig.rubberBandResistance
      const clampedDelta = Math.min(resistedDelta, mergedConfig.maxOverscroll)

      overscrollY.set(clampedDelta)
      pullProgress.set(Math.min(clampedDelta / mergedConfig.refreshThreshold, 1))

      setState(prev => ({
        ...prev,
        isPulling: true,
        pullProgress: Math.min(clampedDelta / mergedConfig.refreshThreshold, 1),
        overscrollAmount: { ...prev.overscrollAmount, top: clampedDelta },
      }))
    }
  }, [mergedConfig, overscrollY, pullProgress])

  const handleTouchEnd = useCallback(() => {
    isTouchingRef.current = false

    if (state.isPulling) {
      if (state.pullProgress >= 1) {
        handleRefresh()
      } else {
        // Animate back to 0
        animate(overscrollY, 0, { type: 'spring', stiffness: 400, damping: 30 })
        animate(pullProgress, 0, { type: 'spring', stiffness: 400, damping: 30 })
        setState(prev => ({
          ...prev,
          isPulling: false,
          pullProgress: 0,
          overscrollAmount: { ...prev.overscrollAmount, top: 0 },
        }))
      }
    }
  }, [state.isPulling, state.pullProgress, handleRefresh, overscrollY, pullProgress])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // CONTROLES
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  const controls = useMemo(() => ({
    scrollTo: ({ x, y, animated = true, duration = 400 }: { x?: number; y?: number; animated?: boolean; duration?: number }) => {
      const container = scrollRef.current
      if (!container) return

      if (animated) {
        container.scrollTo({
          top: y ?? container.scrollTop,
          left: x ?? container.scrollLeft,
          behavior: 'smooth',
        })
      } else {
        container.scrollTop = y ?? container.scrollTop
        container.scrollLeft = x ?? container.scrollLeft
      }
    },

    scrollToStart: (animated = true) => {
      controls.scrollTo({ x: 0, y: 0, animated })
    },

    scrollToEnd: (animated = true) => {
      const container = scrollRef.current
      if (!container) return

      const maxY = container.scrollHeight - container.clientHeight
      const maxX = container.scrollWidth - container.clientWidth
      controls.scrollTo({ x: maxX, y: maxY, animated })
    },

    scrollToElement: (element: HTMLElement, { offset = 0, animated = true } = {}) => {
      const container = scrollRef.current
      if (!container || !element) return

      const containerRect = container.getBoundingClientRect()
      const elementRect = element.getBoundingClientRect()

      const targetY = container.scrollTop + (elementRect.top - containerRect.top) - offset
      controls.scrollTo({ y: targetY, animated })
    },

    snapTo: (index: number, animated = true) => {
      if (!mergedConfig.snapEnabled || index >= mergedConfig.snapPoints.length) return

      const targetPosition = mergedConfig.snapPoints[index]
      controls.scrollTo({ y: targetPosition, animated })
    },

    setLocked: (locked: boolean) => {
      isLockedRef.current = locked
      if (scrollRef.current) {
        scrollRef.current.style.overflow = locked ? 'hidden' : 'auto'
      }
    },

    triggerRefresh: handleRefresh,

    updateDimensions: () => {
      updateScrollState()
    },
  }), [mergedConfig, handleRefresh, updateScrollState])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    container.addEventListener('scroll', updateScrollState, { passive: true })
    container.addEventListener('touchstart', handleTouchStart, { passive: true })
    container.addEventListener('touchmove', handleTouchMove, { passive: false })
    container.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Initial state
    updateScrollState()

    return () => {
      container.removeEventListener('scroll', updateScrollState)
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)

      if (scrollbarTimeoutRef.current) {
        clearTimeout(scrollbarTimeoutRef.current)
      }
    }
  }, [updateScrollState, handleTouchStart, handleTouchMove, handleTouchEnd])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ESTILOS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  const containerStyles: React.CSSProperties = useMemo(() => ({
    overflowY: mergedConfig.direction !== 'horizontal' ? 'auto' : 'hidden',
    overflowX: mergedConfig.direction !== 'vertical' ? 'auto' : 'hidden',
    WebkitOverflowScrolling: 'touch',
    scrollBehavior: 'smooth',
    scrollSnapType: mergedConfig.snapEnabled ? 'y mandatory' : 'none',
    overscrollBehavior: mergedConfig.rubberBand ? 'contain' : 'none',
  }), [mergedConfig])

  const containerClassName = useMemo(() => {
    const classes = [
      'scrollbar-thin',
      state.scrollbarVisible ? 'scrollbar-visible' : 'scrollbar-hidden',
      'scroll-smooth',
    ]
    return classes.join(' ')
  }, [state.scrollbarVisible])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // RETURN
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  return {
    scrollRef,
    state,
    motionValues: {
      scrollY,
      scrollX,
      smoothScrollY,
      smoothScrollX,
      velocityY,
      velocityX,
      overscrollY,
      overscrollX,
      pullProgress,
      scrollProgress,
    },
    controls,
    containerStyles,
    containerClassName,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK SIMPLIFICADO PARA CASOS COMUNES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useSimpleScroll() {
  return useAdvancedScroll({
    rubberBand: true,
    momentum: true,
    autoHideScrollbar: true,
  })
}

export function useFormScroll() {
  return useAdvancedScroll({
    rubberBand: true,
    momentum: true,
    autoHideScrollbar: true,
    direction: 'vertical',
    snapEnabled: false,
  })
}

export function useInfiniteListScroll(onLoadMore: () => Promise<void>) {
  return useAdvancedScroll({
    rubberBand: true,
    momentum: true,
    autoHideScrollbar: true,
    infiniteScroll: true,
    infiniteScrollThreshold: 200,
    onLoadMore,
  })
}

export function usePullToRefreshScroll(onRefresh: () => Promise<void>) {
  return useAdvancedScroll({
    rubberBand: true,
    momentum: true,
    pullToRefresh: true,
    refreshThreshold: 80,
    onRefresh,
    autoHideScrollbar: true,
  })
}

export default useAdvancedScroll
