/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📜 CHRONOS 2026 — iOS ADVANCED SCROLL SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de scroll ultra avanzado estilo iOS 18+:
 * - Scroll suave con momentum physics
 * - Rubber band effect en los bordes
 * - Pull to refresh con animación premium
 * - Infinite scroll con virtualización
 * - Scroll snap para carruseles
 * - Indicadores de scroll elegantes
 * - Fade edges automáticos
 * - Soporte para gestos touch
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, PanInfo } from 'motion/react'
import {
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  forwardRef,
  createContext,
  useContext,
  useMemo
} from 'react'
import { ArrowUp, ChevronDown, ChevronUp, Loader2, RefreshCw } from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ScrollState {
  isAtTop: boolean
  isAtBottom: boolean
  scrollProgress: number
  canScroll: boolean
  isScrolling: boolean
  scrollDirection: 'up' | 'down' | null
  scrollVelocity: number
}

interface AdvancedScrollContextType {
  scrollState: ScrollState
  scrollTo: (position: number | 'top' | 'bottom', smooth?: boolean) => void
  scrollBy: (delta: number, smooth?: boolean) => void
}

const AdvancedScrollContext = createContext<AdvancedScrollContextType | null>(null)

export const useAdvancedScroll = () => useContext(AdvancedScrollContext)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCROLL CONTAINER UNIVERSAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSScrollContainerProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  maxHeight?: string | number
  // Visual features
  showScrollBar?: boolean
  showFadeEdges?: boolean
  showScrollProgress?: boolean
  showScrollToTop?: boolean
  scrollToTopThreshold?: number
  // Pull to refresh
  enablePullToRefresh?: boolean
  onRefresh?: () => Promise<void>
  refreshThreshold?: number
  // Infinite scroll
  enableInfiniteScroll?: boolean
  onLoadMore?: () => Promise<void>
  loadMoreThreshold?: number
  hasMore?: boolean
  // Callbacks
  onScroll?: (state: ScrollState) => void
  onReachTop?: () => void
  onReachBottom?: () => void
  // Styling
  fadeColor?: string
  progressColor?: string
  scrollbarVariant?: 'hidden' | 'thin' | 'ios'
  // Snap
  snapType?: 'none' | 'mandatory' | 'proximity'
  snapAlign?: 'start' | 'center' | 'end'
}

export const iOSScrollContainer = memo(forwardRef<HTMLDivElement, iOSScrollContainerProps>(
  function iOSScrollContainer(
    {
      children,
      className,
      contentClassName,
      maxHeight = '100%',
      showScrollBar = true,
      showFadeEdges = true,
      showScrollProgress = false,
      showScrollToTop = true,
      scrollToTopThreshold = 300,
      enablePullToRefresh = false,
      onRefresh,
      refreshThreshold = 80,
      enableInfiniteScroll = false,
      onLoadMore,
      loadMoreThreshold = 200,
      hasMore = true,
      onScroll: onScrollProp,
      onReachTop,
      onReachBottom,
      fadeColor = 'rgba(0, 0, 0, 0.9)',
      progressColor = '#8B5CF6',
      scrollbarVariant = 'thin',
      snapType = 'none',
      snapAlign = 'start',
    },
    ref
  ) {
    const internalRef = useRef<HTMLDivElement>(null)
    const scrollRef = (ref as React.RefObject<HTMLDivElement>) || internalRef

    const [scrollState, setScrollState] = useState<ScrollState>({
      isAtTop: true,
      isAtBottom: false,
      scrollProgress: 0,
      canScroll: false,
      isScrolling: false,
      scrollDirection: null,
      scrollVelocity: 0,
    })

    const [isRefreshing, setIsRefreshing] = useState(false)
    const [isLoadingMore, setIsLoadingMore] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)

    const lastScrollTop = useRef(0)
    const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
    const touchStartY = useRef(0)
    const isPulling = useRef(false)
    const reachTopTriggered = useRef(false)
    const reachBottomTriggered = useRef(false)
    const loadMoreTriggered = useRef(false)

    // Scroll handler
    const handleScroll = useCallback(() => {
      const el = scrollRef.current
      if (!el) return

      const { scrollTop, scrollHeight, clientHeight } = el
      const maxScroll = Math.max(0, scrollHeight - clientHeight)
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0
      const isAtTop = scrollTop <= 2
      const isAtBottom = scrollTop >= maxScroll - 2
      const direction = scrollTop > lastScrollTop.current ? 'down' : scrollTop < lastScrollTop.current ? 'up' : null
      const velocity = Math.abs(scrollTop - lastScrollTop.current)

      lastScrollTop.current = scrollTop

      // Clear previous timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }

      const newState: ScrollState = {
        isAtTop,
        isAtBottom,
        scrollProgress: progress,
        canScroll: maxScroll > 0,
        isScrolling: true,
        scrollDirection: direction,
        scrollVelocity: velocity,
      }

      setScrollState(newState)
      onScrollProp?.(newState)

      // Set scrolling to false after scroll ends
      scrollTimeout.current = setTimeout(() => {
        setScrollState(prev => ({ ...prev, isScrolling: false, scrollDirection: null }))
      }, 150)

      // Reach top/bottom detection
      if (onReachTop && isAtTop && !reachTopTriggered.current) {
        reachTopTriggered.current = true
        onReachTop()
      } else if (!isAtTop) {
        reachTopTriggered.current = false
      }

      if (onReachBottom && isAtBottom && !reachBottomTriggered.current) {
        reachBottomTriggered.current = true
        onReachBottom()
      } else if (!isAtBottom) {
        reachBottomTriggered.current = false
      }

      // Infinite scroll
      if (enableInfiniteScroll && hasMore && onLoadMore && !isLoadingMore) {
        if (scrollTop >= maxScroll - loadMoreThreshold && !loadMoreTriggered.current) {
          loadMoreTriggered.current = true
          setIsLoadingMore(true)
          onLoadMore().finally(() => {
            setIsLoadingMore(false)
            loadMoreTriggered.current = false
          })
        }
      }
    }, [scrollRef, onScrollProp, onReachTop, onReachBottom, enableInfiniteScroll, hasMore, onLoadMore, loadMoreThreshold, isLoadingMore])

    // Pull to refresh handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      if (!enablePullToRefresh || !scrollState.isAtTop || isRefreshing) return
      touchStartY.current = e.touches[0].clientY
      isPulling.current = true
    }, [enablePullToRefresh, scrollState.isAtTop, isRefreshing])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!isPulling.current || isRefreshing) return

      const touchY = e.touches[0].clientY
      const distance = Math.max(0, (touchY - touchStartY.current) * 0.4) // Resistance factor

      if (distance > 0 && scrollState.isAtTop) {
        e.preventDefault()
        setPullDistance(Math.min(distance, refreshThreshold * 1.5))
      }
    }, [isRefreshing, scrollState.isAtTop, refreshThreshold])

    const handleTouchEnd = useCallback(async () => {
      if (!isPulling.current) return
      isPulling.current = false

      if (pullDistance >= refreshThreshold && onRefresh) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }
      setPullDistance(0)
    }, [pullDistance, refreshThreshold, onRefresh])

    // Scroll methods
    const scrollTo = useCallback((position: number | 'top' | 'bottom', smooth = true) => {
      const el = scrollRef.current
      if (!el) return

      let targetPosition: number
      if (position === 'top') {
        targetPosition = 0
      } else if (position === 'bottom') {
        targetPosition = el.scrollHeight - el.clientHeight
      } else {
        targetPosition = position
      }

      el.scrollTo({ top: targetPosition, behavior: smooth ? 'smooth' : 'auto' })
    }, [scrollRef])

    const scrollBy = useCallback((delta: number, smooth = true) => {
      const el = scrollRef.current
      if (!el) return
      el.scrollBy({ top: delta, behavior: smooth ? 'smooth' : 'auto' })
    }, [scrollRef])

    // Effect to attach scroll listener
    useEffect(() => {
      const el = scrollRef.current
      if (!el) return

      el.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll() // Initial check

      return () => {
        el.removeEventListener('scroll', handleScroll)
        if (scrollTimeout.current) {
          clearTimeout(scrollTimeout.current)
        }
      }
    }, [handleScroll, scrollRef])

    // Scrollbar classes
    const scrollbarClasses = {
      hidden: 'scrollbar-none',
      thin: 'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20',
      ios: 'scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30 scrollbar-thumb-rounded-full',
    }

    // Snap classes
    const snapClasses = {
      none: '',
      mandatory: 'snap-y snap-mandatory',
      proximity: 'snap-y snap-proximity',
    }

    const contextValue = useMemo(() => ({
      scrollState,
      scrollTo,
      scrollBy,
    }), [scrollState, scrollTo, scrollBy])

    return (
      <AdvancedScrollContext.Provider value={contextValue}>
        <div className={cn('relative', className)}>
          {/* Pull to refresh indicator */}
          <AnimatePresence>
            {(pullDistance > 0 || isRefreshing) && (
              <motion.div
                className="absolute top-0 left-0 right-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: Math.max(pullDistance, isRefreshing ? 56 : 0),
                  opacity: 1
                }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <motion.div
                  className="flex items-center gap-2"
                  animate={{
                    rotate: isRefreshing ? 360 : (pullDistance / refreshThreshold) * 180,
                    scale: pullDistance >= refreshThreshold || isRefreshing ? 1 : 0.8,
                  }}
                  transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
                >
                  {isRefreshing ? (
                    <Loader2 size={20} className="text-violet-400" />
                  ) : (
                    <RefreshCw
                      size={20}
                      className={cn(
                        'transition-colors',
                        pullDistance >= refreshThreshold ? 'text-violet-400' : 'text-white/40'
                      )}
                    />
                  )}
                </motion.div>
                {pullDistance >= refreshThreshold && !isRefreshing && (
                  <motion.span
                    className="text-xs text-violet-400 ml-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Suelta para actualizar
                  </motion.span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll progress bar */}
          {showScrollProgress && scrollState.canScroll && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-0.5 z-30 origin-left"
              style={{ backgroundColor: progressColor }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: scrollState.scrollProgress }}
              transition={{ duration: 0.1 }}
            />
          )}

          {/* Main scroll container */}
          <div
            ref={scrollRef}
            className={cn(
              'overflow-y-auto overflow-x-hidden overscroll-contain',
              'scroll-smooth',
              scrollbarClasses[scrollbarVariant],
              snapClasses[snapType],
              contentClassName
            )}
            style={{
              maxHeight,
              WebkitOverflowScrolling: 'touch', // iOS momentum scroll
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div
              animate={{ y: pullDistance }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {children}
            </motion.div>

            {/* Loading more indicator */}
            <AnimatePresence>
              {isLoadingMore && (
                <motion.div
                  className="flex items-center justify-center py-4"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Loader2 size={20} className="text-violet-400 animate-spin" />
                  <span className="text-xs text-white/50 ml-2">Cargando más...</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Fade edges */}
          {showFadeEdges && scrollState.canScroll && (
            <>
              <AnimatePresence>
                {!scrollState.isAtTop && (
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-16 pointer-events-none z-10"
                    style={{
                      background: `linear-gradient(to bottom, ${fadeColor}, transparent)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {!scrollState.isAtBottom && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
                    style={{
                      background: `linear-gradient(to top, ${fadeColor}, transparent)`,
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </AnimatePresence>
            </>
          )}

          {/* Scroll to top button */}
          <AnimatePresence>
            {showScrollToTop && scrollState.scrollProgress > 0.2 && (
              <motion.button
                className={cn(
                  'absolute bottom-4 right-4 z-20',
                  'w-10 h-10 rounded-full',
                  'bg-white/10 backdrop-blur-xl border border-white/20',
                  'flex items-center justify-center',
                  'text-white/70 hover:text-white hover:bg-white/15',
                  'shadow-lg transition-colors'
                )}
                onClick={() => scrollTo('top')}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowUp size={18} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </AdvancedScrollContext.Provider>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM SCROLL CONTAINER - Especializado para formularios
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormScrollContainerProps {
  children: ReactNode
  className?: string
  maxHeight?: string | number
  showFadeEdges?: boolean
  submitOnEnter?: boolean
  onSubmit?: () => void
}

export const FormScrollContainer = memo(forwardRef<HTMLDivElement, FormScrollContainerProps>(
  function FormScrollContainer(
    {
      children,
      className,
      maxHeight = '60vh',
      showFadeEdges = true,
      submitOnEnter = false,
      onSubmit,
    },
    ref
  ) {
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (submitOnEnter && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onSubmit?.()
      }
    }, [submitOnEnter, onSubmit])

    return (
      <div
        className={cn('relative', className)}
        onKeyDown={handleKeyDown}
      >
        <iOSScrollContainer
          ref={ref}
          maxHeight={maxHeight}
          showFadeEdges={showFadeEdges}
          showScrollToTop={false}
          showScrollProgress={false}
          scrollbarVariant="ios"
          contentClassName="space-y-4 p-1"
        >
          {children}
        </iOSScrollContainer>
      </div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MODAL SCROLL CONTAINER - Especializado para modales
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ModalScrollContainerProps {
  children: ReactNode
  className?: string
  maxHeight?: string | number
}

export const ModalScrollContainer = memo(function ModalScrollContainer({
  children,
  className,
  maxHeight = '65vh',
}: ModalScrollContainerProps) {
  return (
    <iOSScrollContainer
      maxHeight={maxHeight}
      showFadeEdges={true}
      showScrollToTop={false}
      showScrollProgress={false}
      scrollbarVariant="ios"
      fadeColor="rgba(24, 24, 27, 0.95)"
      className={className}
      contentClassName="p-1"
    >
      {children}
    </iOSScrollContainer>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HORIZONTAL SCROLL - Para carruseles y galerías
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HorizontalScrollProps {
  children: ReactNode
  className?: string
  gap?: number
  showArrows?: boolean
  snapEnabled?: boolean
  showIndicators?: boolean
}

export const HorizontalScroll = memo(function HorizontalScroll({
  children,
  className,
  gap = 16,
  showArrows = true,
  snapEnabled = true,
  showIndicators = false,
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    setCanScrollLeft(el.scrollLeft > 0)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    el.addEventListener('scroll', checkScroll, { passive: true })
    checkScroll()

    return () => el.removeEventListener('scroll', checkScroll)
  }, [checkScroll])

  const scroll = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return

    const scrollAmount = el.clientWidth * 0.8
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }, [])

  return (
    <div className={cn('relative group', className)}>
      {/* Left arrow */}
      <AnimatePresence>
        {showArrows && canScrollLeft && (
          <motion.button
            className={cn(
              'absolute left-2 top-1/2 -translate-y-1/2 z-10',
              'w-10 h-10 rounded-full',
              'bg-black/60 backdrop-blur-lg border border-white/10',
              'flex items-center justify-center',
              'text-white/80 hover:text-white hover:bg-black/80',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'shadow-xl'
            )}
            onClick={() => scroll('left')}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronUp size={20} className="rotate-[-90deg]" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className={cn(
          'flex overflow-x-auto overflow-y-hidden',
          'scrollbar-none',
          snapEnabled && 'snap-x snap-mandatory',
        )}
        style={{
          gap,
          scrollPaddingLeft: gap,
          scrollPaddingRight: gap,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>

      {/* Right arrow */}
      <AnimatePresence>
        {showArrows && canScrollRight && (
          <motion.button
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 z-10',
              'w-10 h-10 rounded-full',
              'bg-black/60 backdrop-blur-lg border border-white/10',
              'flex items-center justify-center',
              'text-white/80 hover:text-white hover:bg-black/80',
              'opacity-0 group-hover:opacity-100 transition-opacity',
              'shadow-xl'
            )}
            onClick={() => scroll('right')}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronUp size={20} className="rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Fade edges */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/80 to-transparent pointer-events-none z-5" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/80 to-transparent pointer-events-none z-5" />
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCROLL SNAP ITEM - Item para scroll con snap
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ScrollSnapItemProps {
  children: ReactNode
  className?: string
  snapAlign?: 'start' | 'center' | 'end'
}

export const ScrollSnapItem = memo(function ScrollSnapItem({
  children,
  className,
  snapAlign = 'start',
}: ScrollSnapItemProps) {
  const alignClasses = {
    start: 'snap-start',
    center: 'snap-center',
    end: 'snap-end',
  }

  return (
    <div className={cn('flex-shrink-0', alignClasses[snapAlign], className)}>
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  ScrollState,
  iOSScrollContainerProps,
  FormScrollContainerProps,
  ModalScrollContainerProps,
  HorizontalScrollProps,
  ScrollSnapItemProps,
}
