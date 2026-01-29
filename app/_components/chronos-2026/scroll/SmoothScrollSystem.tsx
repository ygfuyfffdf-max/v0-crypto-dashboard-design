'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎯 SMOOTH SCROLL SYSTEM — CHRONOS INFINITY 2026 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de scroll ultra-suave 120fps con:
 * - Lenis smooth scroll (mejor que Locomotive)
 * - GSAP ScrollTrigger para animaciones
 * - Parallax effects
 * - Scroll-driven animations
 * - Virtual scroll con momentum
 *
 * @version 1.0.0
 * @dependencies lenis@1.3.15, gsap@3.14.2
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect, useRef } from 'react'

// Registrar plugin ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SmoothScrollOptions {
  duration?: number
  easing?: (t: number) => number
  orientation?: 'vertical' | 'horizontal'
  gestureOrientation?: 'vertical' | 'horizontal' | 'both'
  smoothWheel?: boolean
  smoothTouch?: boolean
  wheelMultiplier?: number
  touchMultiplier?: number
  lerp?: number
  infinite?: boolean
  autoResize?: boolean
}

interface ScrollAnimationOptions {
  trigger: string
  start?: string
  end?: string
  scrub?: boolean | number
  markers?: boolean
  pin?: boolean
  onEnter?: () => void
  onLeave?: () => void
  onUpdate?: (progress: number) => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LENIS SMOOTH SCROLL HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useSmoothScroll(options: SmoothScrollOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const lenis = new Lenis({
      duration: options.duration ?? 1.2,
      easing: options.easing ?? ((t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))),
      orientation: options.orientation ?? 'vertical',
      gestureOrientation: options.gestureOrientation ?? 'vertical',
      smoothWheel: options.smoothWheel ?? true,
      wheelMultiplier: options.wheelMultiplier ?? 1,
      touchMultiplier: options.touchMultiplier ?? 2,
      lerp: options.lerp ?? 0.1,
      infinite: options.infinite ?? false,
      autoResize: options.autoResize ?? true,
    })

    lenisRef.current = lenis

    // Integrar con GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update)

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })

    gsap.ticker.lagSmoothing(0)

    // Cleanup
    return () => {
      lenis.destroy()
      gsap.ticker.remove((time) => {
        lenis.raf(time * 1000)
      })
    }
  }, [options])

  return lenisRef
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCROLL ANIMATION HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useScrollAnimation(
  target: string | HTMLElement,
  animation: gsap.TweenVars,
  options: ScrollAnimationOptions,
) {
  useEffect(() => {
    const trigger = ScrollTrigger.create({
      trigger: options.trigger,
      start: options.start ?? 'top 80%',
      end: options.end ?? 'bottom 20%',
      scrub: options.scrub ?? false,
      markers: options.markers ?? false,
      pin: options.pin ?? false,
      onEnter: options.onEnter,
      onLeave: options.onLeave,
      onUpdate: (self: gsap.plugins.ScrollTriggerInstance) => {
        options.onUpdate?.(self.progress)
      },
      animation: gsap.to(target, animation),
    })

    return () => {
      trigger.kill()
    }
  }, [target, animation, options])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARALLAX HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useParallax(element: HTMLElement | null, speed: number = 0.5) {
  useEffect(() => {
    if (!element) return

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self: gsap.plugins.ScrollTriggerInstance) => {
        const y = (self.progress - 0.5) * (speed * 200)
        gsap.to(element, {
          y,
          duration: 0,
          overwrite: true,
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [element, speed])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCROLL-DRIVEN COUNTER HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useScrollCounter(
  element: HTMLElement | null,
  endValue: number,
  options: { duration?: number; decimals?: number } = {},
) {
  useEffect(() => {
    if (!element) return

    const obj = { value: 0 }
    const duration = options.duration ?? 2
    const decimals = options.decimals ?? 0

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(obj, {
          value: endValue,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            element.textContent = obj.value.toFixed(decimals)
          },
        })
      },
    })

    return () => {
      trigger.kill()
    }
  }, [element, endValue, options])
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET: Fade In On Scroll
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function FadeInOnScroll({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    gsap.fromTo(
      ref.current,
      {
        opacity: 0,
        y: 50,
      },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        delay,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      },
    )
  }, [delay])

  return <div ref={ref}>{children}</div>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET: Parallax Container
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function ParallaxContainer({
  children,
  speed = 0.5,
  className,
}: {
  children: React.ReactNode
  speed?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useParallax(ref.current, speed)

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET: Scroll Counter
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function ScrollCounter({
  endValue,
  duration = 2,
  decimals = 0,
  prefix = '',
  suffix = '',
  className,
}: {
  endValue: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useScrollCounter(ref.current, endValue, { duration, decimals })

  return (
    <span ref={ref} className={className}>
      {prefix}0{suffix}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET: Pinned Section
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function PinnedSection({
  children,
  duration = '100%',
  className,
}: {
  children: React.ReactNode
  duration?: string
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: `+=${duration}`,
      pin: true,
      pinSpacing: true,
    })

    return () => {
      trigger.kill()
    }
  }, [duration])

  return (
    <div ref={ref} className={className}>
      {children}</div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESET: Horizontal Scroll Section
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function HorizontalScrollSection({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !containerRef.current) return

    const sections = gsap.utils.toArray<HTMLElement>('.horizontal-scroll-item', containerRef.current)
    const totalWidth = sections.reduce((acc, section) => acc + section.offsetWidth, 0)

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: () => `+=${totalWidth - window.innerWidth}`,
      pin: true,
      scrub: 1,
      animation: gsap.to(sections, {
        x: () => -(totalWidth - window.innerWidth),
        ease: 'none',
      }),
    })

    return () => {
      trigger.kill()
    }
  }, [])

  return (
    <div ref={ref} className={className}>
      <div ref={containerRef} className="flex">
        {children}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORT ALL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    gsap, Lenis, ScrollTrigger,
}
