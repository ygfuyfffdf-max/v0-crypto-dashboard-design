/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📜 GSAP SCROLL TRIGGER PARALLAX — CHRONOS PREMIUM SCROLL ANIMATIONS 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de scroll parallax ultra premium con:
 * - GSAP ScrollTrigger integration
 * - Multi-layer parallax
 * - Scrub animations
 * - Pin sections
 * - MorphSVG transitions
 * - Performance optimizado
 *
 * @version 1.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

"use client"

import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import ScrollTrigger from "gsap/ScrollTrigger"
import { memo, useRef, type ReactNode } from "react"

// Registrar plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ParallaxSectionProps {
  children: ReactNode
  className?: string
  /** Velocidad de parallax (negativo = más lento que scroll, positivo = más rápido) */
  speed?: number
  /** Offset inicial en px o % */
  offset?: string
  /** Trigger start position */
  start?: string
  /** Trigger end position */
  end?: string
  /** ID único para el trigger */
  id?: string
}

interface PinnedSectionProps {
  children: ReactNode
  className?: string
  /** Duración del pin en vh o px */
  pinDuration?: string | number
  /** Scrub value (true, number, o objeto) */
  scrub?: boolean | number
  /** Anticipate scroll */
  anticipatePin?: number
}

interface RevealOnScrollProps {
  children: ReactNode
  className?: string
  /** Dirección de reveal */
  direction?: "up" | "down" | "left" | "right" | "fade"
  /** Delay en segundos */
  delay?: number
  /** Duration en segundos */
  duration?: number
  /** Distance en px */
  distance?: number
  /** Stagger children */
  stagger?: number
}

interface ScrollProgressProps {
  className?: string
  /** Color del indicador */
  color?: string
  /** Altura del indicador */
  height?: number
  /** Posición (top/bottom) */
  position?: "top" | "bottom"
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARALLAX SECTION — Efecto de profundidad
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ParallaxSection = memo(function ParallaxSection({
  children,
  className = "",
  speed = -0.3,
  offset = "0%",
  start = "top bottom",
  end = "bottom top",
  id,
}: ParallaxSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current || !contentRef.current) return

      // Calcular distancia de movimiento basada en velocidad
      const distance = speed * 100

      gsap.fromTo(
        contentRef.current,
        {
          y: `${-distance}%`,
        },
        {
          y: `${distance}%`,
          ease: "none",
          scrollTrigger: {
            id: id || `parallax-${Math.random().toString(36).slice(2)}`,
            trigger: sectionRef.current,
            start: start,
            end: end,
            scrub: true,
            // markers: process.env.NODE_ENV === 'development', // Debug
          },
        }
      )
    },
    { scope: sectionRef, dependencies: [speed, start, end] }
  )

  return (
    <div ref={sectionRef} className={`relative overflow-hidden ${className}`}>
      <div
        ref={contentRef}
        className="will-change-transform"
        style={{ transform: `translateY(${offset})` }}
      >
        {children}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PINNED SECTION — Sección fija durante scroll
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PinnedSection = memo(function PinnedSection({
  children,
  className = "",
  pinDuration = "100%",
  scrub = true,
  anticipatePin = 1,
}: PinnedSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current || !contentRef.current) return

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: `+=${pinDuration}`,
        pin: contentRef.current,
        pinSpacing: true,
        scrub: scrub,
        anticipatePin: anticipatePin,
      })
    },
    { scope: sectionRef, dependencies: [pinDuration, scrub] }
  )

  return (
    <div ref={sectionRef} className={`relative ${className}`}>
      <div ref={contentRef}>{children}</div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// REVEAL ON SCROLL — Animación de entrada
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const RevealOnScroll = memo(function RevealOnScroll({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 0.8,
  distance = 60,
  stagger = 0.1,
}: RevealOnScrollProps) {
  const elementRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!elementRef.current) return

      // Configurar valores iniciales según dirección
      const fromVars: gsap.TweenVars = {
        opacity: 0,
        duration: duration,
        delay: delay,
        ease: "power3.out",
      }

      const toVars: gsap.TweenVars = {
        opacity: 1,
        duration: duration,
        delay: delay,
        ease: "power3.out",
        stagger: stagger,
      }

      switch (direction) {
        case "up":
          fromVars.y = distance
          toVars.y = 0
          break
        case "down":
          fromVars.y = -distance
          toVars.y = 0
          break
        case "left":
          fromVars.x = distance
          toVars.x = 0
          break
        case "right":
          fromVars.x = -distance
          toVars.x = 0
          break
        case "fade":
          // Solo opacity
          break
      }

      // Seleccionar elementos hijos o el contenedor
      const targets =
        elementRef.current.children.length > 0 ? elementRef.current.children : elementRef.current

      gsap.set(targets, fromVars)

      ScrollTrigger.create({
        trigger: elementRef.current,
        start: "top 85%",
        onEnter: () => {
          gsap.to(targets, toVars)
        },
        once: true, // Solo animar una vez
      })
    },
    { scope: elementRef, dependencies: [direction, delay, duration, distance, stagger] }
  )

  return (
    <div ref={elementRef} className={className}>
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCROLL PROGRESS BAR — Indicador de progreso
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ScrollProgress = memo(function ScrollProgress({
  className = "",
  color = "linear-gradient(90deg, #8B00FF, #FFD700)",
  height = 3,
  position = "top",
}: ScrollProgressProps) {
  const progressRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!progressRef.current) return

    gsap.to(progressRef.current, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.3,
      },
    })
  }, [])

  return (
    <div
      ref={progressRef}
      className={`fixed right-0 left-0 z-[100] origin-left ${className}`}
      style={{
        [position]: 0,
        height: `${height}px`,
        background: color,
        transform: "scaleX(0)",
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HORIZONTAL SCROLL SECTION — Scroll horizontal
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface HorizontalScrollProps {
  children: ReactNode
  className?: string
  /** Ancho total del contenido horizontal */
  contentWidth?: string
}

const HorizontalScrollSection = memo(function HorizontalScrollSection({
  children,
  className = "",
  contentWidth = "300vw",
}: HorizontalScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!containerRef.current || !contentRef.current) return

      const content = contentRef.current
      const scrollWidth = content.scrollWidth
      const viewportWidth = window.innerWidth

      gsap.to(content, {
        x: -(scrollWidth - viewportWidth),
        ease: "none",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: () => `+=${scrollWidth}`,
          scrub: 1,
          pin: true,
          anticipatePin: 1,
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div ref={contentRef} className="flex will-change-transform" style={{ width: contentWidth }}>
        {children}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TEXT REVEAL — Revelado de texto
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TextRevealProps {
  text: string
  className?: string
  /** Tipo de split */
  splitBy?: "chars" | "words" | "lines"
  /** Stagger entre elementos */
  stagger?: number
  /** Duration */
  duration?: number
}

const TextReveal = memo(function TextReveal({
  text,
  className = "",
  splitBy = "chars",
  stagger = 0.02,
  duration = 0.5,
}: TextRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!containerRef.current) return

      const elements = containerRef.current.querySelectorAll(".split-element")

      gsap.set(elements, {
        opacity: 0,
        y: 20,
        rotateX: -90,
      })

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top 80%",
        onEnter: () => {
          gsap.to(elements, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: duration,
            stagger: stagger,
            ease: "back.out(1.7)",
          })
        },
        once: true,
      })
    },
    { scope: containerRef, dependencies: [stagger, duration] }
  )

  // Split text
  const splitText = () => {
    switch (splitBy) {
      case "chars":
        return text.split("").map((char, i) => (
          <span
            key={i}
            className="split-element inline-block"
            style={{ transformOrigin: "bottom center" }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))
      case "words":
        return text.split(" ").map((word, i) => (
          <span key={i} className="split-element mr-2 inline-block">
            {word}
          </span>
        ))
      case "lines":
        return text.split("\n").map((line, i) => (
          <span key={i} className="split-element block">
            {line}
          </span>
        ))
    }
  }

  return (
    <div ref={containerRef} className={className} style={{ perspective: "1000px" }}>
      {splitText()}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  HorizontalScrollSection,
  ParallaxSection,
  PinnedSection,
  RevealOnScroll,
  ScrollProgress,
  TextReveal,
}
