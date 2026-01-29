'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📱 RESPONSIVE UTILITIES HOOK — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hook para manejar responsive design:
 * ✅ Detección de breakpoints
 * ✅ Media queries dinámicas
 * ✅ Detección de dispositivo (móvil, tablet, desktop)
 * ✅ Orientación de pantalla
 * ✅ Touch capabilities
 * ✅ Reduced motion preferences
 *
 * @version 2.0.0 - SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 BREAKPOINT DEFINITIONS (Tailwind compatible)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

export type Breakpoint = keyof typeof BREAKPOINTS

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📱 USE MEDIA QUERY HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Check if window is defined (SSR safety)
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }

    // Legacy browsers
    mediaQuery.addListener(handler)
    return () => mediaQuery.removeListener(handler)
  }, [query])

  return matches
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📐 USE BREAKPOINT HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface BreakpointState {
  isXs: boolean
  isSm: boolean
  isMd: boolean
  isLg: boolean
  isXl: boolean
  is2xl: boolean
  current: Breakpoint
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
}

export function useBreakpoint(): BreakpointState {
  const [state, setState] = useState<BreakpointState>({
    isXs: true,
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
    is2xl: false,
    current: 'xs',
    isMobile: true,
    isTablet: false,
    isDesktop: false,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateBreakpoint = () => {
      const width = window.innerWidth

      const isXs = width < BREAKPOINTS.sm
      const isSm = width >= BREAKPOINTS.sm && width < BREAKPOINTS.md
      const isMd = width >= BREAKPOINTS.md && width < BREAKPOINTS.lg
      const isLg = width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl
      const isXl = width >= BREAKPOINTS.xl && width < BREAKPOINTS['2xl']
      const is2xl = width >= BREAKPOINTS['2xl']

      let current: Breakpoint = 'xs'
      if (is2xl) current = '2xl'
      else if (isXl) current = 'xl'
      else if (isLg) current = 'lg'
      else if (isMd) current = 'md'
      else if (isSm) current = 'sm'

      setState({
        isXs,
        isSm,
        isMd,
        isLg,
        isXl,
        is2xl,
        current,
        isMobile: isXs || isSm,
        isTablet: isMd,
        isDesktop: isLg || isXl || is2xl,
      })
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return state
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔄 USE ORIENTATION HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type Orientation = 'portrait' | 'landscape'

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>('portrait')

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateOrientation = () => {
      if (window.matchMedia('(orientation: portrait)').matches) {
        setOrientation('portrait')
      } else {
        setOrientation('landscape')
      }
    }

    updateOrientation()
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)

    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return orientation
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 👆 USE TOUCH DEVICE HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const checkTouch = () => {
      setIsTouch(
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - msMaxTouchPoints is a legacy property
        navigator.msMaxTouchPoints > 0,
      )
    }

    checkTouch()
  }, [])

  return isTouch
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 USE REDUCED MOTION HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌙 USE DARK MODE HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function usePrefersColorScheme(): 'light' | 'dark' {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  return prefersDark ? 'dark' : 'light'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📏 USE WINDOW SIZE HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface WindowSize {
  width: number
  height: number
}

export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>({ width: 0, height: 0 })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [])

  return size
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 USE RESPONSIVE VALUE HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type ResponsiveValues<T> = {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

export function useResponsiveValue<T>(
  values: ResponsiveValues<T>,
  defaultValue: T,
): T {
  const { current } = useBreakpoint()

  // Get the value for current breakpoint or fallback to smaller breakpoints
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  const currentIndex = breakpointOrder.indexOf(current)

  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i]
    if (values[bp] !== undefined) {
      return values[bp] as T
    }
  }

  return defaultValue
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔒 USE SCROLL LOCK HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useScrollLock(lock: boolean): void {
  useEffect(() => {
    if (typeof document === 'undefined') return

    if (lock) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [lock])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 RESPONSIVE CONTAINER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

import { cn } from '@/app/_lib/utils'
import { ReactNode } from 'react'

interface ResponsiveStackProps {
  children: ReactNode
  className?: string
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  mobileDirection?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const gapClasses = {
  none: 'gap-0',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
}

const directionClasses = {
  row: 'flex-row',
  col: 'flex-col',
  'row-reverse': 'flex-row-reverse',
  'col-reverse': 'flex-col-reverse',
}

export function ResponsiveStack({
  children,
  className,
  direction = 'row',
  mobileDirection = 'col',
  gap = 'md',
}: ResponsiveStackProps) {
  return (
    <div
      className={cn(
        'flex',
        gapClasses[gap],
        directionClasses[mobileDirection],
        `md:${directionClasses[direction]}`,
        className,
      )}
    >
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 👁️ SHOW/HIDE ON BREAKPOINT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ShowOnProps {
  children: ReactNode
  breakpoint: Breakpoint
  above?: boolean
  below?: boolean
}

export function ShowOn({ children, breakpoint, above = false, below = false }: ShowOnProps) {
  const { current } = useBreakpoint()
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
  const targetIndex = breakpointOrder.indexOf(breakpoint)
  const currentIndex = breakpointOrder.indexOf(current)

  let show = false

  if (above && currentIndex >= targetIndex) {
    show = true
  } else if (below && currentIndex < targetIndex) {
    show = true
  } else if (!above && !below && current === breakpoint) {
    show = true
  }

  if (!show) return null

  return <>{children}</>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  BREAKPOINTS as breakpoints,
}
