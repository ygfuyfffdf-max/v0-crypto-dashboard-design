/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📱✨ RESPONSIVE DESIGN SYSTEM 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de diseño responsive ultra premium:
 * ✅ Breakpoint hooks
 * ✅ Container queries
 * ✅ Mobile-first components
 * ✅ Touch-optimized interactions
 * ✅ Adaptive layouts
 * ✅ Safe areas handling
 *
 * @version 2026.1.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// BREAKPOINTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const breakpoints = {
  xs: 0, // Extra small (phones portrait)
  sm: 640, // Small (phones landscape)
  md: 768, // Medium (tablets portrait)
  lg: 1024, // Large (tablets landscape, small laptops)
  xl: 1280, // Extra large (desktops)
  '2xl': 1536, // 2X Extra large (large desktops)
} as const

export type Breakpoint = keyof typeof breakpoints

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useBreakpoint
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useBreakpoint() {
  const [windowWidth, setWindowWidth] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    setWindowWidth(window.innerWidth)

    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const current = useMemo((): Breakpoint => {
    if (windowWidth >= breakpoints['2xl']) return '2xl'
    if (windowWidth >= breakpoints.xl) return 'xl'
    if (windowWidth >= breakpoints.lg) return 'lg'
    if (windowWidth >= breakpoints.md) return 'md'
    if (windowWidth >= breakpoints.sm) return 'sm'
    return 'xs'
  }, [windowWidth])

  const isAbove = useCallback((bp: Breakpoint) => windowWidth >= breakpoints[bp], [windowWidth])
  const isBelow = useCallback((bp: Breakpoint) => windowWidth < breakpoints[bp], [windowWidth])
  const isBetween = useCallback(
    (min: Breakpoint, max: Breakpoint) =>
      windowWidth >= breakpoints[min] && windowWidth < breakpoints[max],
    [windowWidth],
  )

  return {
    width: windowWidth,
    current,
    isAbove,
    isBelow,
    isBetween,
    isMobile: windowWidth < breakpoints.md,
    isTablet: windowWidth >= breakpoints.md && windowWidth < breakpoints.lg,
    isDesktop: windowWidth >= breakpoints.lg,
    isMounted,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useMediaQuery
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useTouchDevice
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
          navigator.maxTouchPoints > 0 ||
          // @ts-expect-error - legacy check
          navigator.msMaxTouchPoints > 0,
      )
    }
    checkTouch()
  }, [])

  return isTouch
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useSafeArea
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  })

  useEffect(() => {
    const updateSafeArea = () => {
      const style = getComputedStyle(document.documentElement)
      setSafeArea({
        top: parseInt(style.getPropertyValue('--sat') || '0', 10),
        right: parseInt(style.getPropertyValue('--sar') || '0', 10),
        bottom: parseInt(style.getPropertyValue('--sab') || '0', 10),
        left: parseInt(style.getPropertyValue('--sal') || '0', 10),
      })
    }

    // Set CSS variables for safe areas
    document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)')
    document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)')
    document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)')
    document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)')

    updateSafeArea()
    window.addEventListener('resize', updateSafeArea)
    return () => window.removeEventListener('resize', updateSafeArea)
  }, [])

  return safeArea
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXTO RESPONSIVE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ResponsiveContextType {
  breakpoint: ReturnType<typeof useBreakpoint>
  isTouch: boolean
  safeArea: ReturnType<typeof useSafeArea>
}

const ResponsiveContext = createContext<ResponsiveContextType | null>(null)

export function ResponsiveProvider({ children }: { children: React.ReactNode }) {
  const breakpoint = useBreakpoint()
  const isTouch = useTouchDevice()
  const safeArea = useSafeArea()

  return (
    <ResponsiveContext.Provider value={{ breakpoint, isTouch, safeArea }}>
      {children}
    </ResponsiveContext.Provider>
  )
}

export function useResponsive() {
  const context = useContext(ResponsiveContext)
  if (!context) {
    throw new Error('useResponsive debe usarse dentro de ResponsiveProvider')
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ResponsiveShow — Mostrar contenido según breakpoint
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ResponsiveShowProps {
  children: React.ReactNode
  above?: Breakpoint
  below?: Breakpoint
  only?: Breakpoint | Breakpoint[]
  className?: string
}

export function ResponsiveShow({ children, above, below, only, className }: ResponsiveShowProps) {
  const { isAbove, isBelow, current, isMounted } = useBreakpoint()

  if (!isMounted) return null

  let shouldShow = true

  if (above && !isAbove(above)) shouldShow = false
  if (below && !isBelow(below)) shouldShow = false
  if (only) {
    const onlyArray = Array.isArray(only) ? only : [only]
    if (!onlyArray.includes(current)) shouldShow = false
  }

  if (!shouldShow) return null

  return <div className={className}>{children}</div>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: MobileOnly / DesktopOnly
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function MobileOnly({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ResponsiveShow below="lg" className={className}>
      {children}
    </ResponsiveShow>
  )
}

export function DesktopOnly({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ResponsiveShow above="lg" className={className}>
      {children}
    </ResponsiveShow>
  )
}

export function TabletOnly({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <ResponsiveShow only={['md', 'lg']} className={className}>
      {children}
    </ResponsiveShow>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ResponsiveGrid — Grid adaptativo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ResponsiveGridProps {
  children: React.ReactNode
  columns?: {
    xs?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: number | { x?: number; y?: number }
  className?: string
}

export function ResponsiveGrid({
  children,
  columns = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className,
}: ResponsiveGridProps) {
  const gapX = typeof gap === 'number' ? gap : (gap.x ?? 4)
  const gapY = typeof gap === 'number' ? gap : (gap.y ?? 4)

  // Generate responsive column classes
  const columnClasses = Object.entries(columns)
    .map(([bp, cols]) => {
      if (bp === 'xs') return `grid-cols-${cols}`
      return `${bp}:grid-cols-${cols}`
    })
    .join(' ')

  return (
    <div className={cn('grid', columnClasses, `gap-x-${gapX} gap-y-${gapY}`, className)}>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ResponsiveContainer — Container con max-width adaptativo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ResponsiveContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padding?: boolean
  centered?: boolean
  className?: string
}

export function ResponsiveContainer({
  children,
  size = 'xl',
  padding = true,
  centered = true,
  className,
}: ResponsiveContainerProps) {
  const maxWidths = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div
      className={cn(
        'w-full',
        maxWidths[size],
        centered && 'mx-auto',
        padding && 'px-4 sm:px-6 lg:px-8',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ResponsiveStack — Stack adaptativo vertical/horizontal
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ResponsiveStackProps {
  children: React.ReactNode
  direction?: 'row' | 'col' | 'responsive'
  gap?: number
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  wrap?: boolean
  className?: string
}

export function ResponsiveStack({
  children,
  direction = 'responsive',
  gap = 4,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className,
}: ResponsiveStackProps) {
  const directionClasses = {
    row: 'flex-row',
    col: 'flex-col',
    responsive: 'flex-col sm:flex-row',
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }

  return (
    <div
      className={cn(
        'flex',
        directionClasses[direction],
        alignClasses[align],
        justifyClasses[justify],
        `gap-${gap}`,
        wrap && 'flex-wrap',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ResponsiveText — Texto con tamaño adaptativo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ResponsiveTextProps {
  children: React.ReactNode
  as?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl'
  weight?: 'normal' | 'medium' | 'semibold' | 'bold'
  className?: string
}

export function ResponsiveText({
  children,
  as: Component = 'p',
  size = 'base',
  weight = 'normal',
  className,
}: ResponsiveTextProps) {
  // Fluid typography with clamp
  const sizeClasses = {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl lg:text-4xl',
    '3xl': 'text-3xl sm:text-4xl lg:text-5xl',
    '4xl': 'text-4xl sm:text-5xl lg:text-6xl',
    '5xl': 'text-5xl sm:text-6xl lg:text-7xl',
  }

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  }

  return (
    <Component className={cn(sizeClasses[size], weightClasses[weight], className)}>
      {children}
    </Component>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: TouchTarget — Área táctil mínima accesible
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TouchTargetProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function TouchTarget({ children, size = 'md', className }: TouchTargetProps) {
  // Minimum touch target sizes (WCAG 2.5.5)
  const sizeClasses = {
    sm: 'min-h-[36px] min-w-[36px]', // Small
    md: 'min-h-[44px] min-w-[44px]', // Recommended
    lg: 'min-h-[48px] min-w-[48px]', // Large
  }

  return (
    <div className={cn('inline-flex items-center justify-center', sizeClasses[size], className)}>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: AspectRatio — Mantener aspect ratio responsive
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AspectRatioProps {
  children: React.ReactNode
  ratio?: number | '16/9' | '4/3' | '1/1' | '3/2' | '21/9'
  className?: string
}

export function AspectRatio({ children, ratio = '16/9', className }: AspectRatioProps) {
  const ratioValue =
    typeof ratio === 'number'
      ? ratio
      : {
          '16/9': 16 / 9,
          '4/3': 4 / 3,
          '1/1': 1,
          '3/2': 3 / 2,
          '21/9': 21 / 9,
        }[ratio] || 16 / 9

  return (
    <div
      className={cn('relative w-full', className)}
      style={{ paddingBottom: `${(1 / ratioValue) * 100}%` }}
    >
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: BottomSheet — Drawer móvil desde abajo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

import { AnimatePresence, motion, PanInfo, useDragControls } from 'motion/react'

interface BottomSheetProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
  snapPoints?: number[]
  className?: string
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  snapPoints = [0.5, 0.9],
  className,
}: BottomSheetProps) {
  const dragControls = useDragControls()
  const safeArea = useSafeArea()

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.velocity.y > 500 || info.offset.y > 200) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className={cn(
              'fixed right-0 bottom-0 left-0 z-50 max-h-[90vh]',
              'rounded-t-3xl border-t border-white/10 bg-gray-900',
              'overflow-hidden',
              className,
            )}
            style={{ paddingBottom: safeArea.bottom }}
          >
            {/* Handle */}
            <div
              onPointerDown={(e) => dragControls.start(e)}
              className="flex cursor-grab justify-center py-4 active:cursor-grabbing"
            >
              <div className="h-1.5 w-12 rounded-full bg-white/20" />
            </div>

            {/* Title */}
            {title && (
              <div className="border-b border-white/10 px-6 pb-4">
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              </div>
            )}

            {/* Content */}
            <div className="max-h-[calc(90vh-80px)] overflow-y-auto px-6 py-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
