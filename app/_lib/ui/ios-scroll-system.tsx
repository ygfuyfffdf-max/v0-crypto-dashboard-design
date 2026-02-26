// @ts-nocheck
'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🍎 iOS-STYLE ADVANCED SCROLL SYSTEM — CHRONOS 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de scroll avanzado inspirado en iOS/visionOS:
 * - Scroll suave con rubber band effect
 * - Scroll individual por contenedor
 * - Indicadores de scroll estilo iOS
 * - Pull-to-refresh gesture
 * - Momentum scroll nativo
 * - Keyboard-aware scroll
 * - Hide-on-scroll headers/footers
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react'
import {
  useRef,
  useEffect,
  useState,
  useCallback,
  createContext,
  useContext,
  type ReactNode,
  type RefObject
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXT PARA SCROLL COORDINADO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ScrollContextValue {
  isScrolling: boolean
  scrollDirection: 'up' | 'down' | null
  scrollProgress: number
  registerScrollArea: (id: string, ref: RefObject<HTMLElement>) => void
  unregisterScrollArea: (id: string) => void
}

const ScrollContext = createContext<ScrollContextValue | null>(null)

export function useScrollContext() {
  return useContext(ScrollContext)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCROLL PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ScrollProviderProps {
  children: ReactNode
}

export function ScrollProvider({ children }: ScrollProviderProps) {
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const scrollAreasRef = useRef<Map<string, RefObject<HTMLElement>>>(new Map())
  const lastScrollY = useRef(0)
  const scrollTimeout = useRef<NodeJS.Timeout>()

  const registerScrollArea = useCallback((id: string, ref: RefObject<HTMLElement>) => {
    scrollAreasRef.current.set(id, ref)
  }, [])

  const unregisterScrollArea = useCallback((id: string) => {
    scrollAreasRef.current.delete(id)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      const direction = currentY > lastScrollY.current ? 'down' : 'up'
      setScrollDirection(direction)
      setIsScrolling(true)
      lastScrollY.current = currentY

      // Calculate progress
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(maxScroll > 0 ? currentY / maxScroll : 0)

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current)
      }

      // Set scrolling to false after scroll stops
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false)
        setScrollDirection(null)
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <ScrollContext.Provider value={{
      isScrolling,
      scrollDirection,
      scrollProgress,
      registerScrollArea,
      unregisterScrollArea,
    }}>
      {children}
    </ScrollContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS SCROLL CONTAINER — CON INDICADORES Y RUBBER BAND
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface IOSScrollContainerProps {
  children: ReactNode
  className?: string
  maxHeight?: string | number
  showIndicator?: boolean
  fadeEdges?: boolean
  onScrollEnd?: () => void
  onPullToRefresh?: () => Promise<void>
  id?: string
}

export function IOSScrollContainer({
  children,
  className,
  maxHeight = '100%',
  showIndicator = true,
  fadeEdges = true,
  onScrollEnd,
  onPullToRefresh,
  id,
}: IOSScrollContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [showTopFade, setShowTopFade] = useState(false)
  const [showBottomFade, setShowBottomFade] = useState(true)
  const [scrollPercentage, setScrollPercentage] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [canRefresh, setCanRefresh] = useState(false)

  // Pull to refresh
  const pullY = useMotionValue(0)
  const pullSpring = useSpring(pullY, { stiffness: 400, damping: 40 })
  const pullOpacity = useTransform(pullSpring, [0, 60], [0, 1])
  const pullScale = useTransform(pullSpring, [0, 60], [0.8, 1])
  const pullRotation = useTransform(pullSpring, [0, 60], [0, 360])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const { scrollTop, scrollHeight, clientHeight } = target
    const maxScroll = scrollHeight - clientHeight

    // Update fade states
    setShowTopFade(scrollTop > 10)
    setShowBottomFade(scrollTop < maxScroll - 10)

    // Update scroll percentage
    const percentage = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0
    setScrollPercentage(percentage)

    // Check if at top for pull-to-refresh
    setCanRefresh(scrollTop === 0 && !!onPullToRefresh)

    // End of scroll callback
    if (scrollTop >= maxScroll - 5 && onScrollEnd) {
      onScrollEnd()
    }
  }, [onScrollEnd, onPullToRefresh])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!canRefresh) return
    const touch = e.touches[0]
    pullY.set(0)
  }, [canRefresh, pullY])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!canRefresh || !containerRef.current) return
    const touch = e.touches[0]
    const container = containerRef.current

    if (container.scrollTop === 0) {
      const delta = touch.clientY - (container.getBoundingClientRect().top + 60)
      if (delta > 0 && delta < 100) {
        pullY.set(delta)
      }
    }
  }, [canRefresh, pullY])

  const handleTouchEnd = useCallback(async () => {
    if (!canRefresh || !onPullToRefresh) {
      pullY.set(0)
      return
    }

    if (pullY.get() > 50) {
      setIsRefreshing(true)
      try {
        await onPullToRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    pullY.set(0)
  }, [canRefresh, onPullToRefresh, pullY])

  return (
    <div className={cn('relative', className)} style={{ maxHeight }}>
      {/* Pull to refresh indicator */}
      {onPullToRefresh && (
        <motion.div
          className="absolute inset-x-0 top-0 z-10 flex items-center justify-center py-3 pointer-events-none"
          style={{ opacity: pullOpacity }}
        >
          <motion.div
            className="w-6 h-6 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center"
            style={{ scale: pullScale }}
          >
            <motion.div
              className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full"
              style={{ rotate: pullRotation }}
              animate={isRefreshing ? { rotate: 360 } : {}}
              transition={isRefreshing ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
            />
          </motion.div>
        </motion.div>
      )}

      {/* Top fade */}
      {fadeEdges && (
        <motion.div
          className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-10 rounded-t-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: showTopFade ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* Scroll container */}
      <motion.div
        ref={containerRef}
        className={cn(
          'overflow-y-auto overflow-x-hidden',
          'scroll-smooth overscroll-y-contain',
          // iOS-style scrollbar
          'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
          'hover:scrollbar-thumb-white/20',
          // Touch optimizations
          'touch-pan-y',
          // Webkit smooth scroll
          '[&::-webkit-scrollbar]:w-1.5',
          '[&::-webkit-scrollbar-track]:bg-transparent',
          '[&::-webkit-scrollbar-thumb]:bg-white/10',
          '[&::-webkit-scrollbar-thumb]:rounded-full',
          '[&::-webkit-scrollbar-thumb:hover]:bg-white/20',
        )}
        style={{
          maxHeight,
          WebkitOverflowScrolling: 'touch',
          paddingTop: pullSpring.get() > 0 ? pullSpring : 0,
        }}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={contentRef}>
          {children}
        </div>
      </motion.div>

      {/* Bottom fade */}
      {fadeEdges && (
        <motion.div
          className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10 rounded-b-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: showBottomFade ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      )}

      {/* iOS-style scroll indicator */}
      {showIndicator && (
        <motion.div
          className="absolute right-1 top-4 bottom-4 w-1 rounded-full bg-white/5 overflow-hidden"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <motion.div
            className="w-full bg-white/30 rounded-full"
            style={{
              height: '30%',
              top: `${scrollPercentage * 0.7}%`,
              position: 'absolute',
            }}
          />
        </motion.div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM SCROLL CONTAINER — OPTIMIZADO PARA FORMULARIOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormScrollContainerProps {
  children: ReactNode
  className?: string
  maxHeight?: string | number
  stickyHeader?: ReactNode
  stickyFooter?: ReactNode
}

export function FormScrollContainer({
  children,
  className,
  maxHeight = '60vh',
  stickyHeader,
  stickyFooter,
}: FormScrollContainerProps) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    // Detect keyboard visibility on mobile
    const handleResize = () => {
      const isKeyboard = window.innerHeight < window.screen.height * 0.75
      setIsKeyboardVisible(isKeyboard)
    }

    window.visualViewport?.addEventListener('resize', handleResize)
    return () => window.visualViewport?.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Sticky header */}
      {stickyHeader && (
        <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-xl border-b border-white/5">
          {stickyHeader}
        </div>
      )}

      {/* Scrollable form content */}
      <IOSScrollContainer
        maxHeight={isKeyboardVisible ? '40vh' : maxHeight}
        showIndicator={true}
        fadeEdges={true}
        className="flex-1"
      >
        <div className="p-4 space-y-4">
          {children}
        </div>
      </IOSScrollContainer>

      {/* Sticky footer */}
      {stickyFooter && !isKeyboardVisible && (
        <motion.div
          className="sticky bottom-0 z-20 bg-black/40 backdrop-blur-xl border-t border-white/5 p-4"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {stickyFooter}
        </motion.div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MODAL SCROLL CONTAINER — PARA MODALES CON CONTENIDO LARGO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ModalScrollContainerProps {
  children: ReactNode
  className?: string
  header?: ReactNode
  footer?: ReactNode
  maxHeight?: string
}

export function ModalScrollContainer({
  children,
  className,
  header,
  footer,
  maxHeight = '70vh',
}: ModalScrollContainerProps) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-2xl', className)}>
      {/* Modal header - sticky */}
      {header && (
        <div className="shrink-0 px-6 py-4 border-b border-white/5 bg-white/5 backdrop-blur-xl">
          {header}
        </div>
      )}

      {/* Modal content - scrollable */}
      <IOSScrollContainer
        maxHeight={maxHeight}
        showIndicator={true}
        fadeEdges={true}
        className="flex-1"
      >
        <div className="px-6 py-4">
          {children}
        </div>
      </IOSScrollContainer>

      {/* Modal footer - sticky */}
      {footer && (
        <div className="shrink-0 px-6 py-4 border-t border-white/5 bg-white/5 backdrop-blur-xl">
          {footer}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HORIZONTAL SCROLL — ESTILO iOS CARRUSEL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HorizontalScrollProps {
  children: ReactNode
  className?: string
  gap?: number
  showArrows?: boolean
  snapToItems?: boolean
}

export function HorizontalScroll({
  children,
  className,
  gap = 16,
  showArrows = true,
  snapToItems = true,
}: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScroll = useCallback(() => {
    if (!containerRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = containerRef.current
    setCanScrollLeft(scrollLeft > 5)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5)
  }, [])

  const scrollTo = useCallback((direction: 'left' | 'right') => {
    if (!containerRef.current) return
    const scrollAmount = containerRef.current.clientWidth * 0.8
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }, [])

  useEffect(() => {
    checkScroll()
    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', checkScroll, { passive: true })
      return () => container.removeEventListener('scroll', checkScroll)
    }
  }, [checkScroll])

  return (
    <div className={cn('relative group', className)}>
      {/* Left arrow */}
      {showArrows && (
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={() => scrollTo('left')}
              className={cn(
                'absolute left-0 top-1/2 -translate-y-1/2 z-10',
                'w-10 h-10 rounded-full',
                'bg-black/60 backdrop-blur-xl border border-white/10',
                'flex items-center justify-center',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                'hover:bg-white/10 hover:border-white/20',
              )}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Scroll container */}
      <div
        ref={containerRef}
        className={cn(
          'flex overflow-x-auto overflow-y-hidden',
          'scroll-smooth',
          snapToItems && 'snap-x snap-mandatory',
          // Hide scrollbar but keep functionality
          'scrollbar-none',
          '[&::-webkit-scrollbar]:hidden',
          '[-ms-overflow-style:none]',
          '[scrollbar-width:none]',
        )}
        style={{ gap }}
      >
        {children}
      </div>

      {/* Right arrow */}
      {showArrows && (
        <AnimatePresence>
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => scrollTo('right')}
              className={cn(
                'absolute right-0 top-1/2 -translate-y-1/2 z-10',
                'w-10 h-10 rounded-full',
                'bg-black/60 backdrop-blur-xl border border-white/10',
                'flex items-center justify-center',
                'opacity-0 group-hover:opacity-100 transition-opacity',
                'hover:bg-white/10 hover:border-white/20',
              )}
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      )}

      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-black/40 to-transparent pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-black/40 to-transparent pointer-events-none" />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SNAP SCROLL ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SnapScrollItemProps {
  children: ReactNode
  className?: string
}

export function SnapScrollItem({ children, className }: SnapScrollItemProps) {
  return (
    <div className={cn('snap-center shrink-0', className)}>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SECTION SCROLL — SCROLL POR SECCIONES CON INDICADORES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SectionScrollProps {
  children: ReactNode
  sections: { id: string; label: string }[]
  className?: string
}

export function SectionScroll({ children, sections, className }: SectionScrollProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '')
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(sectionId)
    }
  }, [])

  // Intersection observer for active section detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 }
    )

    sections.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [sections])

  return (
    <div className={cn('relative', className)}>
      {/* Section indicators - iOS style dots */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3 p-2 rounded-full bg-black/20 backdrop-blur-xl border border-white/5">
        {sections.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => scrollToSection(id)}
            className="group relative"
            title={label}
          >
            <div
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                activeSection === id
                  ? 'bg-white scale-125'
                  : 'bg-white/30 hover:bg-white/50',
              )}
            />
            {/* Tooltip */}
            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 text-xs text-white whitespace-nowrap bg-black/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div ref={containerRef}>
        {children}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  IOSScrollContainer as ScrollContainer,
  type IOSScrollContainerProps as ScrollContainerProps,
}
