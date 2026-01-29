/**
 * 🌊 LENIS PROVIDER — CHRONOS 2026
 * ═══════════════════════════════════════════════════════════════════════════
 * Provider para smooth scrolling cinematográfico con Lenis
 * Integración con Framer Motion para animaciones sincronizadas
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import Lenis from 'lenis'
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface LenisContextValue {
  /** Instancia de Lenis */
  lenis: Lenis | null
  /** Scroll a posición específica */
  scrollTo: (target: string | number | HTMLElement, options?: ScrollToOptions) => void
  /** Pausa el smooth scroll */
  pause: () => void
  /** Reanuda el smooth scroll */
  resume: () => void
  /** Estado de pausa */
  isPaused: boolean
}

interface ScrollToOptions {
  offset?: number
  duration?: number
  easing?: (t: number) => number
  immediate?: boolean
  lock?: boolean
  force?: boolean
  onComplete?: () => void
}

interface LenisProviderProps {
  children: ReactNode
  /** Duración base del scroll (default: 1.2) */
  duration?: number
  /** Multiplicador de rueda (default: 1) */
  wheelMultiplier?: number
  /** Multiplicador táctil (default: 2) */
  touchMultiplier?: number
  /** Scroll infinito (default: false) */
  infinite?: boolean
  /** Desactivar en reduced motion (default: true) */
  respectReducedMotion?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// EASING FUNCTIONS - Cinematográficas
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Easing exponencial - Ultra smooth
 */
export const easeOutExpo = (t: number): number => {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * Easing cubic - Suave y natural
 */
export const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * Easing spring - Con rebote sutil
 */
export const easeOutSpring = (t: number): number => {
  const c4 = (2 * Math.PI) / 3
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

const LenisContext = createContext<LenisContextValue>({
  lenis: null,
  scrollTo: () => {},
  pause: () => {},
  resume: () => {},
  isPaused: false,
})

export const useLenis = () => useContext(LenisContext)

// ═══════════════════════════════════════════════════════════════════════════
// PROVIDER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function LenisProvider({
  children,
  duration = 1.2,
  wheelMultiplier = 1,
  touchMultiplier = 2,
  infinite = false,
  respectReducedMotion = true,
}: LenisProviderProps) {
  const lenisRef = useRef<Lenis | null>(null)
  const [isPaused, setIsPaused] = useState(false)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    // Respetar preferencia de reduced motion
    if (respectReducedMotion) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) {
        return // No inicializar Lenis si prefiere reduced motion
      }
    }

    // Crear instancia de Lenis
    const lenis = new Lenis({
      duration,
      easing: easeOutExpo,
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier,
      touchMultiplier,
      infinite,
    })

    lenisRef.current = lenis

    // RAF loop
    function raf(time: number) {
      lenis.raf(time)
      rafRef.current = requestAnimationFrame(raf)
    }

    rafRef.current = requestAnimationFrame(raf)

    // Cleanup
    return () => {
      cancelAnimationFrame(rafRef.current)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [duration, wheelMultiplier, touchMultiplier, infinite, respectReducedMotion])

  // Scroll to target
  const scrollTo = (target: string | number | HTMLElement, options: ScrollToOptions = {}) => {
    lenisRef.current?.scrollTo(target, {
      offset: options.offset ?? 0,
      duration: options.duration ?? duration,
      easing: options.easing ?? easeOutExpo,
      immediate: options.immediate ?? false,
      lock: options.lock ?? false,
      force: options.force ?? false,
      onComplete: options.onComplete,
    })
  }

  // Pause smooth scroll
  const pause = () => {
    lenisRef.current?.stop()
    setIsPaused(true)
  }

  // Resume smooth scroll
  const resume = () => {
    lenisRef.current?.start()
    setIsPaused(false)
  }

  const value: LenisContextValue = {
    lenis: lenisRef.current,
    scrollTo,
    pause,
    resume,
    isPaused,
  }

  return <LenisContext.Provider value={value}>{children}</LenisContext.Provider>
}

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS HOOK
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Hook para obtener el progreso del scroll (0-1)
 */
export function useLenisProgress() {
  const { lenis } = useLenis()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!lenis) return

    const handleScroll = ({ progress }: { progress: number }) => {
      setProgress(progress)
    }

    lenis.on('scroll', handleScroll)
    return () => lenis.off('scroll', handleScroll)
  }, [lenis])

  return progress
}

// ═══════════════════════════════════════════════════════════════════════════
// SCROLL TO TOP BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface ScrollToTopButtonProps {
  /** Mostrar después de scrollear X pixels (default: 400) */
  showAfter?: number
  className?: string
}

export function ScrollToTopButton({ showAfter = 400, className = '' }: ScrollToTopButtonProps) {
  const { scrollTo, lenis } = useLenis()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!lenis) return

    const handleScroll = ({ scroll }: { scroll: number }) => {
      setIsVisible(scroll > showAfter)
    }

    lenis.on('scroll', handleScroll)
    return () => lenis.off('scroll', handleScroll)
  }, [lenis, showAfter])

  if (!isVisible) return null

  return (
    <button
      onClick={() => scrollTo(0, { duration: 1.5 })}
      className={`fixed right-8 bottom-8 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-purple-600/90 text-white shadow-lg shadow-purple-500/25 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-110 hover:bg-purple-500 active:scale-95 ${className} `}
      aria-label="Volver arriba"
    >
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    </button>
  )
}
