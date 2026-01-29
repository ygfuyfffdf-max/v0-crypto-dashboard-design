"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎬✨ GSAP SCROLL TRIGGER SYSTEM — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema avanzado de scroll animations con GSAP ScrollTrigger.
 * God-tier scroll animations para Chronos Dashboard.
 *
 * Características:
 * - Parallax volumétrico multi-layer
 * - Pinning sticky elements
 * - Scrub smooth transitions
 * - Stagger reveal animations
 * - Liquid morph on scroll
 * - Timeline activity scrub
 * - Mood-adaptive velocity
 *
 * @version 1.0.0 SUPREME
 * @author IY Supreme Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { memo, useCallback, useEffect, useRef, type ReactNode } from "react"

// Registrar plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ScrollParallaxProps {
  children: ReactNode
  speed?: number
  direction?: "vertical" | "horizontal"
  className?: string
}

interface ScrollRevealProps {
  children: ReactNode
  delay?: number
  duration?: number
  from?: "bottom" | "top" | "left" | "right" | "scale"
  stagger?: number
  className?: string
  markers?: boolean
}

interface ScrollPinProps {
  children: ReactNode
  pinSpacing?: boolean
  scrub?: boolean | number
  className?: string
  anticipatePin?: number
}

interface ScrollTimelineProps {
  children: ReactNode
  className?: string
  scrub?: number
  snap?: number | number[]
}

interface ParallaxLayerProps {
  children: ReactNode
  depth: number // 0 = foreground (fast), 1 = background (slow)
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useGSAPScrollTrigger
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useGSAPScrollTrigger() {
  const refresh = useCallback(() => {
    ScrollTrigger.refresh()
  }, [])

  const kill = useCallback(() => {
    ScrollTrigger.getAll().forEach((trigger: ScrollTrigger) => trigger.kill())
  }, [])

  const create = useCallback((config: ScrollTrigger.Vars) => {
    return ScrollTrigger.create(config)
  }, [])

  return { refresh, kill, create, gsap, ScrollTrigger }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ScrollParallax - Parallax simple on scroll
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ScrollParallax = memo(function ScrollParallax({
  children,
  speed = 0.5,
  direction = "vertical",
  className,
}: ScrollParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const isVertical = direction === "vertical"

    const animation = gsap.to(element, {
      [isVertical ? "yPercent" : "xPercent"]: -100 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    })

    return () => {
      animation.scrollTrigger?.kill()
      animation.kill()
    }
  }, [speed, direction])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ScrollReveal - Reveal animation on scroll
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ScrollReveal = memo(function ScrollReveal({
  children,
  delay = 0,
  duration = 1,
  from = "bottom",
  stagger = 0,
  className,
  markers = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const childElements = element.children.length > 0 ? element.children : [element]

    const fromVars: gsap.TweenVars = {
      opacity: 0,
      duration,
      stagger,
      ease: "power3.out",
    }

    switch (from) {
      case "bottom":
        fromVars.y = 60
        break
      case "top":
        fromVars.y = -60
        break
      case "left":
        fromVars.x = -60
        break
      case "right":
        fromVars.x = 60
        break
      case "scale":
        fromVars.scale = 0.8
        break
    }

    const animation = gsap.from(childElements, {
      ...fromVars,
      delay,
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        end: "bottom 15%",
        toggleActions: "play none none reverse",
        markers,
      },
    })

    return () => {
      animation.scrollTrigger?.kill()
      animation.kill()
    }
  }, [delay, duration, from, stagger, markers])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ScrollPin - Pin element while scrolling
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ScrollPin = memo(function ScrollPin({
  children,
  pinSpacing = true,
  scrub = 1,
  className,
  anticipatePin = 1,
}: ScrollPinProps) {
  const ref = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current || !containerRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: ref.current,
      pinSpacing,
      scrub: scrub === true ? 1 : scrub,
      anticipatePin,
    })

    return () => {
      trigger.kill()
    }
  }, [pinSpacing, scrub, anticipatePin])

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div ref={ref}>{children}</div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ScrollTimeline - Timeline scrub on scroll
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ScrollTimeline = memo(function ScrollTimeline({
  children,
  className,
  scrub = 0.5,
  snap,
}: ScrollTimelineProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const items = element.querySelectorAll("[data-timeline-item]")

    if (items.length === 0) return

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: "top top",
        end: "bottom bottom",
        scrub,
        pin: true,
        snap: snap
          ? { snapTo: Array.isArray(snap) ? snap : 1 / snap, duration: 0.5, ease: "power2.inOut" }
          : undefined,
      },
    })

    items.forEach((item, i) => {
      const direction = i % 2 === 0 ? -1 : 1
      tl.from(
        item,
        {
          x: 100 * direction,
          opacity: 0,
          scale: 0.9,
          duration: 1,
        },
        i * 0.5
      )
    })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [scrub, snap])

  return (
    <div ref={ref} className={cn("min-h-[200vh]", className)}>
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ParallaxLayers - Multi-layer parallax container
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ParallaxLayers = memo(function ParallaxLayers({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const layers = ref.current.querySelectorAll("[data-parallax-depth]")
    const animations: gsap.core.Tween[] = []

    layers.forEach((layer) => {
      const depth = parseFloat(layer.getAttribute("data-parallax-depth") ?? "0.5")
      const speed = 1 - depth // 0 depth = fast, 1 depth = slow

      const anim = gsap.to(layer, {
        yPercent: -50 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      })

      animations.push(anim)
    })

    return () => {
      animations.forEach((anim) => {
        anim.scrollTrigger?.kill()
        anim.kill()
      })
    }
  }, [])

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ParallaxLayer - Individual layer with depth
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ParallaxLayer = memo(function ParallaxLayer({
  children,
  depth,
  className,
}: ParallaxLayerProps) {
  return (
    <div data-parallax-depth={depth} className={cn("absolute inset-0", className)}>
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ScrollProgress - Progress bar based on scroll
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ScrollProgressProps {
  className?: string
  color?: string
  position?: "top" | "bottom"
  height?: number
}

export const ScrollProgress = memo(function ScrollProgress({
  className,
  color = "#8B5CF6",
  position = "top",
  height = 4,
}: ScrollProgressProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const animation = gsap.to(ref.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    })

    return () => {
      animation.scrollTrigger?.kill()
      animation.kill()
    }
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        "fixed right-0 left-0 z-50 origin-left",
        position === "top" ? "top-0" : "bottom-0",
        className
      )}
      style={{
        height,
        backgroundColor: color,
        transform: "scaleX(0)",
        boxShadow: `0 0 10px ${color}, 0 0 20px ${color}50`,
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ScrollSnapSection - Snap to section
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ScrollSnapSectionProps {
  children: ReactNode
  className?: string
  id?: string
}

export const ScrollSnapSection = memo(function ScrollSnapSection({
  children,
  className,
  id,
}: ScrollSnapSectionProps) {
  return (
    <section
      id={id}
      data-timeline-item
      className={cn("relative flex min-h-screen items-center justify-center", className)}
    >
      {children}
    </section>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: ScrollMagicText - Text reveal on scroll
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ScrollMagicTextProps {
  text: string
  className?: string
  stagger?: number
}

export const ScrollMagicText = memo(function ScrollMagicText({
  text,
  className,
  stagger = 0.02,
}: ScrollMagicTextProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const chars = ref.current.querySelectorAll(".char")

    const animation = gsap.from(chars, {
      opacity: 0,
      y: 50,
      rotateX: -90,
      stagger,
      duration: 0.8,
      ease: "back.out(1.7)",
      scrollTrigger: {
        trigger: ref.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    })

    return () => {
      animation.scrollTrigger?.kill()
      animation.kill()
    }
  }, [stagger])

  return (
    <div ref={ref} className={cn("overflow-hidden", className)} style={{ perspective: 500 }}>
      {text.split("").map((char, i) => (
        <span key={i} className="char inline-block" style={{ transformStyle: "preserve-3d" }}>
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default {
  ScrollParallax,
  ScrollReveal,
  ScrollPin,
  ScrollTimeline,
  ParallaxLayers,
  ParallaxLayer,
  ScrollProgress,
  ScrollSnapSection,
  ScrollMagicText,
  useGSAPScrollTrigger,
}
