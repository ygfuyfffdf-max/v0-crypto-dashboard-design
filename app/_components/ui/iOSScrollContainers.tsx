/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📜 CHRONOS 2026 — iOS PREMIUM SCROLL CONTAINERS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Contenedores de scroll avanzados con:
 * - Scroll suave con physics iOS
 * - Pull-to-refresh integrado
 * - Infinite scroll
 * - Scroll indicators elegantes
 * - Snap scrolling para carousels
 * - Header collapsible
 * - Scroll position tracking
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { ArrowUp, Loader2, RefreshCw } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { forwardRef, memo, ReactNode, useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS SCROLL VIEW - Contenedor principal con scroll premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSScrollViewProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  showScrollIndicator?: boolean
  showScrollToTop?: boolean
  scrollToTopThreshold?: number
  onScroll?: (scrollTop: number, scrollProgress: number) => void
  onReachEnd?: () => void
  reachEndThreshold?: number
  stickyHeader?: ReactNode
  stickyFooter?: ReactNode
  maxHeight?: string | number
}

export const iOSScrollView = memo(forwardRef<HTMLDivElement, iOSScrollViewProps>(
  function iOSScrollView(
    {
      children,
      className,
      contentClassName,
      showScrollIndicator = true,
      showScrollToTop = true,
      scrollToTopThreshold = 300,
      onScroll,
      onReachEnd,
      reachEndThreshold = 100,
      stickyHeader,
      stickyFooter,
      maxHeight = '100%',
    },
    ref
  ) {
    const internalRef = useRef<HTMLDivElement>(null)
    const scrollRef = ref || internalRef

    const [showTopButton, setShowTopButton] = useState(false)
    const [scrollProgress, setScrollProgress] = useState(0)
    const lastScrollTop = useRef(0)
    const reachEndTriggered = useRef(false)

    const handleScroll = useCallback(() => {
      const container = (scrollRef as React.RefObject<HTMLDivElement>).current
      if (!container) return

      const { scrollTop, scrollHeight, clientHeight } = container
      const maxScroll = scrollHeight - clientHeight
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0

      setScrollProgress(progress)
      setShowTopButton(scrollTop > scrollToTopThreshold)

      // Callback
      onScroll?.(scrollTop, progress)

      // Reach end detection
      if (onReachEnd) {
        const distanceFromEnd = maxScroll - scrollTop
        if (distanceFromEnd < reachEndThreshold && !reachEndTriggered.current) {
          reachEndTriggered.current = true
          onReachEnd()
        } else if (distanceFromEnd >= reachEndThreshold) {
          reachEndTriggered.current = false
        }
      }

      lastScrollTop.current = scrollTop
    }, [scrollRef, scrollToTopThreshold, onScroll, onReachEnd, reachEndThreshold])

    const scrollToTop = useCallback(() => {
      const container = (scrollRef as React.RefObject<HTMLDivElement>).current
      container?.scrollTo({ top: 0, behavior: 'smooth' })
    }, [scrollRef])

    useEffect(() => {
      const container = (scrollRef as React.RefObject<HTMLDivElement>).current
      if (!container) return

      container.addEventListener('scroll', handleScroll, { passive: true })
      return () => container.removeEventListener('scroll', handleScroll)
    }, [handleScroll, scrollRef])

    return (
      <div className={cn('relative flex flex-col', className)} style={{ maxHeight }}>
        {/* Sticky Header */}
        {stickyHeader && (
          <div className="sticky top-0 z-20 flex-shrink-0">
            {stickyHeader}
          </div>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollRef as React.RefObject<HTMLDivElement>}
          className={cn(
            'flex-1 overflow-y-auto overscroll-contain',
            'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
            'hover:scrollbar-thumb-white/20',
            contentClassName
          )}
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {children}
        </div>

        {/* Sticky Footer */}
        {stickyFooter && (
          <div className="sticky bottom-0 z-20 flex-shrink-0">
            {stickyFooter}
          </div>
        )}

        {/* Scroll Progress Indicator */}
        {showScrollIndicator && scrollProgress > 0 && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-0.5 bg-violet-500/50 origin-left z-30"
            style={{ scaleX: scrollProgress }}
          />
        )}

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollToTop && showTopButton && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              onClick={scrollToTop}
              className={cn(
                'absolute bottom-6 right-6 z-30',
                'w-10 h-10 rounded-full',
                'bg-violet-500/90 backdrop-blur-sm',
                'flex items-center justify-center',
                'shadow-lg shadow-violet-500/30',
                'hover:bg-violet-400 active:scale-95',
                'transition-colors duration-150'
              )}
            >
              <ArrowUp className="h-5 w-5 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS PULL TO REFRESH CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSPullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  refreshThreshold?: number
  className?: string
  indicatorColor?: string
}

export const iOSPullToRefresh = memo(function iOSPullToRefresh({
  children,
  onRefresh,
  refreshThreshold = 80,
  className,
  indicatorColor = '#8B5CF6',
}: iOSPullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPulling, setIsPulling] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)

  const touchStartY = useRef(0)
  const isDragging = useRef(false)

  const pullProgress = Math.min(pullDistance / refreshThreshold, 1)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const container = containerRef.current
    if (!container || container.scrollTop > 0 || isRefreshing) return
    const touch = e.touches[0]
    if (!touch) return

    touchStartY.current = touch.clientY
    isDragging.current = true
  }, [isRefreshing])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current || isRefreshing) return
    const touch = e.touches[0]
    if (!touch) return

    const deltaY = touch.clientY - touchStartY.current
    if (deltaY > 0) {
      e.preventDefault()
      // Apply resistance
      const resistedDelta = deltaY * 0.5
      setPullDistance(Math.min(resistedDelta, refreshThreshold * 1.5))
      setIsPulling(true)
    }
  }, [isRefreshing, refreshThreshold])

  const handleTouchEnd = useCallback(async () => {
    isDragging.current = false

    if (pullDistance >= refreshThreshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }

    setPullDistance(0)
    setIsPulling(false)
  }, [pullDistance, refreshThreshold, isRefreshing, onRefresh])

  return (
    <div
      ref={containerRef}
      className={cn('relative overflow-hidden', className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull Indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center overflow-hidden z-10"
        style={{ height: isPulling || isRefreshing ? pullDistance : 0 }}
        animate={{
          height: isRefreshing ? refreshThreshold * 0.8 : isPulling ? pullDistance : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <motion.div
          animate={{
            rotate: isRefreshing ? 360 : pullProgress * 180,
          }}
          transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
          style={{ color: indicatorColor }}
        >
          {isRefreshing ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <RefreshCw
              className="h-6 w-6"
              style={{ opacity: pullProgress }}
            />
          )}
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        animate={{
          y: isRefreshing ? refreshThreshold * 0.8 : isPulling ? pullDistance : 0,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS HORIZONTAL SCROLL (CAROUSEL)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSHorizontalScrollProps {
  children: ReactNode
  className?: string
  gap?: number
  padding?: number
  snapType?: 'none' | 'mandatory' | 'proximity'
  showIndicators?: boolean
  itemCount?: number
  onIndexChange?: (index: number) => void
}

export const iOSHorizontalScroll = memo(function iOSHorizontalScroll({
  children,
  className,
  gap = 16,
  padding = 20,
  snapType = 'mandatory',
  showIndicators = false,
  itemCount = 0,
  onIndexChange,
}: iOSHorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container || itemCount === 0) return

    const itemWidth = (container.scrollWidth - padding * 2 + gap) / itemCount
    const newIndex = Math.round(container.scrollLeft / itemWidth)

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex)
      onIndexChange?.(newIndex)
    }
  }, [currentIndex, itemCount, gap, padding, onIndexChange])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={cn(
          'flex overflow-x-auto overscroll-x-contain',
          'scrollbar-none',
          snapType === 'mandatory' && 'snap-x snap-mandatory',
          snapType === 'proximity' && 'snap-x snap-proximity',
          className
        )}
        style={{
          gap,
          paddingLeft: padding,
          paddingRight: padding,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>

      {/* Indicators */}
      {showIndicators && itemCount > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-4">
          {Array.from({ length: itemCount }).map((_, index) => (
            <motion.div
              key={index}
              className={cn(
                'h-1.5 rounded-full',
                index === currentIndex ? 'bg-violet-400' : 'bg-white/20'
              )}
              animate={{
                width: index === currentIndex ? 20 : 6,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          ))}
        </div>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS CAROUSEL ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSCarouselItemProps {
  children: ReactNode
  className?: string
  width?: number | string
}

export const iOSCarouselItem = memo(function iOSCarouselItem({
  children,
  className,
  width = 280,
}: iOSCarouselItemProps) {
  return (
    <div
      className={cn('flex-shrink-0 snap-center', className)}
      style={{ width }}
    >
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS COLLAPSIBLE HEADER SCROLL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSCollapsibleHeaderProps {
  children: ReactNode
  header: (props: { collapsed: boolean; progress: number }) => ReactNode
  headerHeight: { expanded: number; collapsed: number }
  className?: string
  scrollClassName?: string
}

export const iOSCollapsibleHeader = memo(function iOSCollapsibleHeader({
  children,
  header,
  headerHeight,
  className,
  scrollClassName,
}: iOSCollapsibleHeaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  const collapseThreshold = headerHeight.expanded - headerHeight.collapsed
  const progress = Math.min(scrollY / collapseThreshold, 1)
  const collapsed = progress >= 1

  const currentHeaderHeight = headerHeight.expanded - (progress * collapseThreshold)

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (container) {
      setScrollY(container.scrollTop)
    }
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div className={cn('relative flex flex-col h-full', className)}>
      {/* Collapsible Header */}
      <motion.div
        className="sticky top-0 z-20 overflow-hidden"
        animate={{ height: currentHeaderHeight }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {header({ collapsed, progress })}
      </motion.div>

      {/* Scrollable Content */}
      <div
        ref={containerRef}
        className={cn(
          'flex-1 overflow-y-auto overscroll-contain',
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
          scrollClassName
        )}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS INFINITE SCROLL LIST
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSInfiniteScrollProps {
  children: ReactNode
  onLoadMore: () => Promise<void>
  hasMore: boolean
  isLoading?: boolean
  threshold?: number
  className?: string
  loader?: ReactNode
  endMessage?: ReactNode
}

export const iOSInfiniteScroll = memo(function iOSInfiniteScroll({
  children,
  onLoadMore,
  hasMore,
  isLoading = false,
  threshold = 200,
  className,
  loader,
  endMessage,
}: iOSInfiniteScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)

  const handleScroll = useCallback(async () => {
    const container = containerRef.current
    if (!container || loadingRef.current || !hasMore || isLoading) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const distanceFromEnd = scrollHeight - scrollTop - clientHeight

    if (distanceFromEnd < threshold) {
      loadingRef.current = true
      try {
        await onLoadMore()
      } finally {
        loadingRef.current = false
      }
    }
  }, [hasMore, isLoading, onLoadMore, threshold])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return (
    <div
      ref={containerRef}
      className={cn(
        'overflow-y-auto overscroll-contain',
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
        className
      )}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {children}

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center py-6">
          {loader || (
            <div className="flex items-center gap-3 text-white/50">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-[14px]">Cargando más...</span>
            </div>
          )}
        </div>
      )}

      {/* End message */}
      {!hasMore && !isLoading && endMessage && (
        <div className="flex items-center justify-center py-6 text-[14px] text-white/40">
          {endMessage}
        </div>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS SECTION LIST
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Section<T> {
  title: string
  data: T[]
}

interface iOSSectionListProps<T> {
  sections: Section<T>[]
  renderItem: (item: T, index: number) => ReactNode
  renderSectionHeader?: (section: Section<T>, index: number) => ReactNode
  keyExtractor: (item: T, index: number) => string
  className?: string
  sectionClassName?: string
  headerClassName?: string
  stickySectionHeaders?: boolean
}

export const iOSSectionList = memo(function iOSSectionList<T>({
  sections,
  renderItem,
  renderSectionHeader,
  keyExtractor,
  className,
  sectionClassName,
  headerClassName,
  stickySectionHeaders = true,
}: iOSSectionListProps<T>) {
  return (
    <div
      className={cn(
        'overflow-y-auto overscroll-contain',
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
        className
      )}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {sections.map((section, sectionIndex) => (
        <div key={section.title} className={sectionClassName}>
          {/* Section Header */}
          <div
            className={cn(
              stickySectionHeaders && 'sticky top-0 z-10',
              'px-4 py-2 bg-black/80 backdrop-blur-sm',
              headerClassName
            )}
          >
            {renderSectionHeader ? (
              renderSectionHeader(section, sectionIndex)
            ) : (
              <h3 className="text-[13px] font-semibold text-white/50 uppercase tracking-wide">
                {section.title}
              </h3>
            )}
          </div>

          {/* Section Items */}
          <div>
            {section.data.map((item, itemIndex) => (
              <div key={keyExtractor(item, itemIndex)}>
                {renderItem(item, itemIndex)}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}) as <T>(props: iOSSectionListProps<T>) => JSX.Element

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
    iOSCarouselItemProps,
    iOSCollapsibleHeaderProps, iOSHorizontalScrollProps, iOSInfiniteScrollProps, iOSPullToRefreshProps, iOSScrollViewProps, iOSSectionListProps,
    Section
}

