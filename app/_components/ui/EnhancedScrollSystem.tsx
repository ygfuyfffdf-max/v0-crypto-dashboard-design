/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📜 CHRONOS 2026 — ENHANCED SCROLL SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de scroll mejorado para forms, modales y contenedores:
 * - Scroll suave tipo iOS con rubber band effect
 * - Indicadores de scroll elegantes
 * - Optimización táctil
 * - Fade edges para indicar contenido adicional
 * - Pull to refresh
 * - Scroll snapping
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { ArrowUp, Loader2, RefreshCw } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, memo, ReactNode, useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ENHANCED SCROLL CONTAINER - Para cualquier contenido scrollable
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface EnhancedScrollContainerProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  maxHeight?: string | number
  // Features
  showScrollIndicator?: boolean
  showFadeEdges?: boolean
  showScrollProgress?: boolean
  showScrollToTop?: boolean
  scrollToTopThreshold?: number
  // Pull to refresh
  enablePullToRefresh?: boolean
  onRefresh?: () => Promise<void>
  refreshThreshold?: number
  // Events
  onScroll?: (scrollTop: number, progress: number) => void
  onReachTop?: () => void
  onReachBottom?: () => void
  reachThreshold?: number
  // Styling
  fadeColor?: string
  progressColor?: string
  scrollbarVariant?: 'hidden' | 'thin' | 'default'
}

export const EnhancedScrollContainer = memo(forwardRef<HTMLDivElement, EnhancedScrollContainerProps>(
  function EnhancedScrollContainer(
    {
      children,
      className,
      contentClassName,
      maxHeight = '100%',
      showScrollIndicator = true,
      showFadeEdges = true,
      showScrollProgress = false,
      showScrollToTop = true,
      scrollToTopThreshold = 200,
      enablePullToRefresh = false,
      onRefresh,
      refreshThreshold = 80,
      onScroll,
      onReachTop,
      onReachBottom,
      reachThreshold = 50,
      fadeColor = 'rgba(0,0,0,0.8)',
      progressColor = '#8B5CF6',
      scrollbarVariant = 'thin',
    },
    ref
  ) {
    const internalRef = useRef<HTMLDivElement>(null)
    const scrollRef = (ref as React.RefObject<HTMLDivElement>) || internalRef

    const [scrollState, setScrollState] = useState({
      isAtTop: true,
      isAtBottom: false,
      scrollProgress: 0,
      showTopButton: false,
    })
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)

    const reachTopTriggered = useRef(false)
    const reachBottomTriggered = useRef(false)
    const touchStartY = useRef(0)
    const isPulling = useRef(false)

    // Handle scroll
    const handleScroll = useCallback(() => {
      const container = scrollRef.current
      if (!container) return

      const { scrollTop, scrollHeight, clientHeight } = container
      const maxScroll = scrollHeight - clientHeight
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0

      const isAtTop = scrollTop <= 5
      const isAtBottom = scrollTop >= maxScroll - 5

      setScrollState({
        isAtTop,
        isAtBottom,
        scrollProgress: progress,
        showTopButton: scrollTop > scrollToTopThreshold,
      })

      onScroll?.(scrollTop, progress)

      // Reach top detection
      if (onReachTop && isAtTop && !reachTopTriggered.current) {
        reachTopTriggered.current = true
        onReachTop()
      } else if (!isAtTop) {
        reachTopTriggered.current = false
      }

      // Reach bottom detection
      if (onReachBottom && scrollTop >= maxScroll - reachThreshold && !reachBottomTriggered.current) {
        reachBottomTriggered.current = true
        onReachBottom()
      } else if (scrollTop < maxScroll - reachThreshold) {
        reachBottomTriggered.current = false
      }
    }, [scrollRef, scrollToTopThreshold, onScroll, onReachTop, onReachBottom, reachThreshold])

    // Pull to refresh handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      if (!enablePullToRefresh || !scrollState.isAtTop) return
      touchStartY.current = e.touches[0]!.clientY
      isPulling.current = true
    }, [enablePullToRefresh, scrollState.isAtTop])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!isPulling.current || isRefreshing) return

      const touchY = e.touches[0]!.clientY
      const distance = Math.max(0, (touchY - touchStartY.current) * 0.5) // 0.5 resistance

      if (distance > 0 && scrollState.isAtTop) {
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

    // Scroll to top
    const scrollToTop = useCallback(() => {
      scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }, [scrollRef])

    // Effect to attach scroll listener
    useEffect(() => {
      const container = scrollRef.current
      if (!container) return

      container.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll() // Initial check

      return () => container.removeEventListener('scroll', handleScroll)
    }, [handleScroll, scrollRef])

    const scrollbarClasses = {
      hidden: 'scrollbar-none',
      thin: 'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20',
      default: '',
    }

    return (
      <div className={cn('relative', className)}>
        {/* Pull to refresh indicator */}
        {enablePullToRefresh && (pullDistance > 0 || isRefreshing) && (
          <motion.div
            className="absolute top-0 left-0 right-0 flex items-center justify-center z-20 pointer-events-none"
            style={{ height: Math.max(pullDistance, isRefreshing ? 50 : 0) }}
          >
            <motion.div
              animate={{
                rotate: isRefreshing ? 360 : (pullDistance / refreshThreshold) * 180,
                scale: pullDistance >= refreshThreshold ? 1.1 : 1,
              }}
              transition={isRefreshing ? {
                rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
              } : undefined}
            >
              {isRefreshing ? (
                <Loader2 className="w-6 h-6 text-violet-400" />
              ) : (
                <RefreshCw
                  className={cn(
                    'w-6 h-6 transition-colors',
                    pullDistance >= refreshThreshold ? 'text-violet-400' : 'text-white/40'
                  )}
                />
              )}
            </motion.div>
          </motion.div>
        )}

        {/* Scroll progress bar */}
        {showScrollProgress && scrollState.scrollProgress > 0 && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-0.5 z-30 origin-left"
            style={{
              background: progressColor,
              scaleX: scrollState.scrollProgress,
            }}
          />
        )}

        {/* Top fade indicator */}
        {showFadeEdges && !scrollState.isAtTop && (
          <div
            className="absolute top-0 left-0 right-0 h-12 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to bottom, ${fadeColor}, transparent)`,
            }}
          />
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className={cn(
            'overflow-y-auto overscroll-contain',
            scrollbarClasses[scrollbarVariant],
            contentClassName
          )}
          style={{
            maxHeight,
            WebkitOverflowScrolling: 'touch',
            transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined,
            transition: isPulling.current ? 'none' : 'transform 0.3s ease',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {children}
        </div>

        {/* Bottom fade indicator */}
        {showFadeEdges && !scrollState.isAtBottom && (
          <div
            className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none z-10"
            style={{
              background: `linear-gradient(to top, ${fadeColor}, transparent)`,
            }}
          />
        )}

        {/* Scroll to top button */}
        <AnimatePresence>
          {showScrollToTop && scrollState.showTopButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={scrollToTop}
              className={cn(
                'absolute bottom-4 right-4 z-30',
                'w-10 h-10 rounded-full',
                'bg-white/10 backdrop-blur-lg border border-white/20',
                'flex items-center justify-center',
                'shadow-lg hover:bg-white/15 active:scale-95',
                'transition-colors duration-150'
              )}
            >
              <ArrowUp className="w-5 h-5 text-white/80" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Side scroll indicator */}
        {showScrollIndicator && scrollState.scrollProgress > 0 && scrollState.scrollProgress < 1 && (
          <motion.div
            className="absolute right-1 top-4 bottom-4 w-1 rounded-full overflow-hidden z-20"
            style={{ background: 'rgba(255,255,255,0.05)' }}
          >
            <motion.div
              className="w-full rounded-full"
              style={{
                background: 'rgba(255,255,255,0.3)',
                height: '20%',
                y: `${scrollState.scrollProgress * 80}%`,
              }}
            />
          </motion.div>
        )}
      </div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM SCROLL CONTAINER - Optimizado para formularios
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormScrollContainerProps {
  children: ReactNode
  className?: string
  maxHeight?: string | number
  showShadows?: boolean
  stickyFooter?: ReactNode
  stickyHeader?: ReactNode
}

export const FormScrollContainer = memo(forwardRef<HTMLDivElement, FormScrollContainerProps>(
  function FormScrollContainer(
    {
      children,
      className,
      maxHeight = '60vh',
      showShadows = true,
      stickyFooter,
      stickyHeader,
    },
    ref
  ) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const combinedRef = (ref as React.RefObject<HTMLDivElement>) || scrollRef

    const [showTopShadow, setShowTopShadow] = useState(false)
    const [showBottomShadow, setShowBottomShadow] = useState(false)

    const handleScroll = useCallback(() => {
      const container = combinedRef.current
      if (!container) return

      const { scrollTop, scrollHeight, clientHeight } = container
      setShowTopShadow(scrollTop > 10)
      setShowBottomShadow(scrollTop < scrollHeight - clientHeight - 10)
    }, [combinedRef])

    useEffect(() => {
      const container = combinedRef.current
      if (!container) return

      handleScroll()
      container.addEventListener('scroll', handleScroll, { passive: true })

      // Observe content changes
      const resizeObserver = new ResizeObserver(handleScroll)
      resizeObserver.observe(container)

      return () => {
        container.removeEventListener('scroll', handleScroll)
        resizeObserver.disconnect()
      }
    }, [handleScroll, combinedRef])

    return (
      <div className={cn('relative flex flex-col', className)}>
        {/* Sticky header */}
        {stickyHeader && (
          <div className="flex-shrink-0 sticky top-0 z-20 bg-inherit">
            {stickyHeader}
          </div>
        )}

        {/* Top shadow */}
        {showShadows && (
          <motion.div
            className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-black/30 to-transparent pointer-events-none z-10"
            animate={{ opacity: showTopShadow ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Scroll container */}
        <div
          ref={combinedRef}
          className={cn(
            'flex-1 overflow-y-auto overscroll-contain',
            'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
            'hover:scrollbar-thumb-white/20'
          )}
          style={{
            maxHeight,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>

        {/* Bottom shadow */}
        {showShadows && (
          <motion.div
            className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-10"
            animate={{ opacity: showBottomShadow ? 1 : 0 }}
            transition={{ duration: 0.2 }}
          />
        )}

        {/* Sticky footer */}
        {stickyFooter && (
          <div className="flex-shrink-0 sticky bottom-0 z-20 bg-inherit border-t border-white/[0.06]">
            {stickyFooter}
          </div>
        )}
      </div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HORIZONTAL SCROLL CONTAINER - Para carousels y listas horizontales
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HorizontalScrollContainerProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  showArrows?: boolean
  showDots?: boolean
  snapToItems?: boolean
  itemWidth?: number | 'auto'
  gap?: number
  paddingX?: number
}

export const HorizontalScrollContainer = memo(function HorizontalScrollContainer({
  children,
  className,
  contentClassName,
  showArrows = true,
  showDots = false,
  snapToItems = true,
  itemWidth = 'auto',
  gap = 16,
  paddingX = 16,
}: HorizontalScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  const checkScroll = useCallback(() => {
    const container = scrollRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)

    // Calculate current index for dots
    if (itemWidth !== 'auto') {
      const index = Math.round(scrollLeft / (itemWidth + gap))
      setCurrentIndex(index)
      setTotalItems(Math.ceil((scrollWidth - paddingX * 2) / (itemWidth + gap)))
    }
  }, [itemWidth, gap, paddingX])

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    checkScroll()
    container.addEventListener('scroll', checkScroll, { passive: true })

    return () => container.removeEventListener('scroll', checkScroll)
  }, [checkScroll])

  const scroll = useCallback((direction: 'left' | 'right') => {
    const container = scrollRef.current
    if (!container) return

    const scrollAmount = itemWidth === 'auto'
      ? container.clientWidth * 0.8
      : itemWidth + gap

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }, [itemWidth, gap])

  return (
    <div className={cn('relative group', className)}>
      {/* Left arrow */}
      {showArrows && canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className={cn(
            'absolute left-2 top-1/2 -translate-y-1/2 z-20',
            'w-10 h-10 rounded-full',
            'bg-black/60 backdrop-blur-sm border border-white/20',
            'flex items-center justify-center',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-black/80'
          )}
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className={cn(
          'flex overflow-x-auto overscroll-x-contain',
          'scrollbar-none',
          snapToItems && 'snap-x snap-mandatory',
          contentClassName
        )}
        style={{
          gap,
          paddingLeft: paddingX,
          paddingRight: paddingX,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>

      {/* Right arrow */}
      {showArrows && canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 z-20',
            'w-10 h-10 rounded-full',
            'bg-black/60 backdrop-blur-sm border border-white/20',
            'flex items-center justify-center',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-black/80'
          )}
        >
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Dots indicator */}
      {showDots && totalItems > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {Array.from({ length: totalItems }).map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const container = scrollRef.current
                if (!container || itemWidth === 'auto') return
                container.scrollTo({
                  left: index * (itemWidth + gap),
                  behavior: 'smooth',
                })
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/30 hover:bg-white/50'
              )}
            />
          ))}
        </div>
      )}

      {/* Fade edges */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-black/60 to-transparent pointer-events-none" />
      )}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-black/60 to-transparent pointer-events-none" />
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
    EnhancedScrollContainerProps,
    FormScrollContainerProps,
    HorizontalScrollContainerProps
}

