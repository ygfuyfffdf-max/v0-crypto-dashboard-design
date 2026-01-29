'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎬 GSAP ANIMATIONS - Sistema de Animaciones Premium con GSAP
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useCallback, useEffect, useRef } from 'react'

// Registrar plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 ANIMATION PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

export const AnimationPresets = {
  // Fade in suave
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1, duration: 0.6, ease: 'power2.out' },
  },

  // Fade in desde abajo
  fadeInUp: {
    from: { opacity: 0, y: 50 },
    to: { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
  },

  // Fade in desde arriba
  fadeInDown: {
    from: { opacity: 0, y: -50 },
    to: { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
  },

  // Fade in desde izquierda
  fadeInLeft: {
    from: { opacity: 0, x: -50 },
    to: { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
  },

  // Fade in desde derecha
  fadeInRight: {
    from: { opacity: 0, x: 50 },
    to: { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
  },

  // Scale in
  scaleIn: {
    from: { opacity: 0, scale: 0.8 },
    to: { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' },
  },

  // Scale in con bounce
  bounceIn: {
    from: { opacity: 0, scale: 0.3 },
    to: { opacity: 1, scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)' },
  },

  // Rotate in
  rotateIn: {
    from: { opacity: 0, rotation: -15 },
    to: { opacity: 1, rotation: 0, duration: 0.8, ease: 'power3.out' },
  },

  // Flip in
  flipIn: {
    from: { opacity: 0, rotationY: 90 },
    to: { opacity: 1, rotationY: 0, duration: 1, ease: 'power3.out' },
  },

  // Glitch
  glitch: {
    keyframes: [
      { x: -3, duration: 0.05 },
      { x: 3, duration: 0.05 },
      { x: -1, duration: 0.05 },
      { x: 1, duration: 0.05 },
      { x: 0, duration: 0.05 },
    ],
  },

  // Pulse
  pulse: {
    to: {
      scale: 1.05,
      duration: 0.5,
      ease: 'power1.inOut',
      yoyo: true,
      repeat: -1,
    },
  },

  // Float
  float: {
    to: {
      y: -10,
      duration: 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    },
  },

  // Shimmer (para loading)
  shimmer: {
    to: {
      backgroundPosition: '200% 0',
      duration: 1.5,
      ease: 'none',
      repeat: -1,
    },
  },

  // Typing
  typing: {
    from: { width: 0 },
    to: { width: '100%', duration: 2, ease: 'steps(20)' },
  },

  // Counter
  counter: (target: number, duration = 2) => ({
    from: { textContent: 0 },
    to: {
      textContent: target,
      duration,
      ease: 'power1.out',
      snap: { textContent: 1 },
    },
  }),
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎣 HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook para animación on mount
 */
export function useAnimateOnMount(
  preset: keyof typeof AnimationPresets | gsap.TweenVars,
  delay = 0,
) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!ref.current) return

    const animation = typeof preset === 'string' ? AnimationPresets[preset] : preset

    if ('from' in animation && 'to' in animation) {
      gsap.fromTo(ref.current, animation.from, { ...animation.to, delay })
    } else if ('to' in animation) {
      gsap.to(ref.current, { ...animation.to, delay })
    }
  }, [preset, delay])

  return ref
}

/**
 * Hook para animación en scroll
 */
export function useAnimateOnScroll(
  preset: keyof typeof AnimationPresets | gsap.TweenVars,
  options?: {
    start?: string
    end?: string
    scrub?: boolean | number
    markers?: boolean
    toggleActions?: string
  },
) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!ref.current) return

    const animation = typeof preset === 'string' ? AnimationPresets[preset] : preset

    const scrollTriggerConfig = {
      trigger: ref.current,
      start: options?.start ?? 'top 80%',
      end: options?.end ?? 'bottom 20%',
      scrub: options?.scrub ?? false,
      markers: options?.markers ?? false,
      toggleActions: options?.toggleActions ?? 'play none none reverse',
    }

    if ('from' in animation && 'to' in animation) {
      gsap.fromTo(ref.current, animation.from, {
        ...animation.to,
        scrollTrigger: scrollTriggerConfig,
      })
    } else if ('to' in animation) {
      gsap.to(ref.current, { ...animation.to, scrollTrigger: scrollTriggerConfig })
    }
  }, [preset, options])

  return ref
}

/**
 * Hook para stagger animation
 */
export function useStaggerAnimation(
  selector: string,
  preset: keyof typeof AnimationPresets | gsap.TweenVars,
  staggerAmount = 0.1,
  options?: { delay?: number; from?: 'start' | 'end' | 'center' | 'edges' },
) {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!containerRef.current) return

    const elements = containerRef.current.querySelectorAll(selector)
    if (elements.length === 0) return

    const animation = typeof preset === 'string' ? AnimationPresets[preset] : preset

    if ('from' in animation && 'to' in animation) {
      gsap.fromTo(elements, animation.from, {
        ...animation.to,
        stagger: {
          amount: staggerAmount,
          from: options?.from ?? 'start',
        },
        delay: options?.delay ?? 0,
      })
    }
  }, [selector, preset, staggerAmount, options])

  return containerRef
}

/**
 * Hook para timeline
 */
export function useTimeline(paused = true) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useGSAP(() => {
    timelineRef.current = gsap.timeline({ paused })
    return () => {
      timelineRef.current?.kill()
    }
  }, [paused])

  const play = useCallback(() => timelineRef.current?.play(), [])
  const pause = useCallback(() => timelineRef.current?.pause(), [])
  const reverse = useCallback(() => timelineRef.current?.reverse(), [])
  const restart = useCallback(() => timelineRef.current?.restart(), [])
  const seek = useCallback((time: number) => timelineRef.current?.seek(time), [])
  const progress = useCallback(
    (value?: number) =>
      value !== undefined ? timelineRef.current?.progress(value) : timelineRef.current?.progress(),
    [],
  )

  return {
    timeline: timelineRef.current,
    play,
    pause,
    reverse,
    restart,
    seek,
    progress,
  }
}

/**
 * Hook para parallax
 */
export function useParallax(speed = 0.5) {
  const ref = useRef<HTMLElement>(null)

  useGSAP(() => {
    if (!ref.current) return

    gsap.to(ref.current, {
      yPercent: -100 * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, [speed])

  return ref
}

/**
 * Hook para contador animado
 */
export function useCounter(targetValue: number, duration = 2, startOnMount = true) {
  const ref = useRef<HTMLElement>(null)
  const tweenRef = useRef<gsap.core.Tween | null>(null)

  const start = useCallback(() => {
    if (!ref.current) return

    tweenRef.current = gsap.to(ref.current, {
      textContent: targetValue,
      duration,
      ease: 'power1.out',
      snap: { textContent: 1 },
      onUpdate: () => {
        if (ref.current) {
          const value = parseFloat(ref.current.textContent || '0')
          ref.current.textContent = Math.floor(value).toLocaleString()
        }
      },
    })
  }, [targetValue, duration])

  useEffect(() => {
    if (startOnMount) {
      start()
    }
    return () => {
      tweenRef.current?.kill()
    }
  }, [start, startOnMount])

  return { ref, start }
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🎨 UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Crear animación de texto por caracteres
 */
export function animateText(
  element: HTMLElement,
  options?: {
    duration?: number
    stagger?: number
    ease?: string
    from?: gsap.TweenVars
  },
) {
  const text = element.textContent || ''
  element.innerHTML = ''

  // Wrap each character in a span
  const chars = text.split('').map((char) => {
    const span = document.createElement('span')
    span.style.display = 'inline-block'
    span.textContent = char === ' ' ? '\u00A0' : char
    element.appendChild(span)
    return span
  })

  return gsap.from(chars, {
    opacity: 0,
    y: 20,
    rotationX: -90,
    duration: options?.duration ?? 0.6,
    stagger: options?.stagger ?? 0.02,
    ease: options?.ease ?? 'back.out(1.7)',
    ...options?.from,
  })
}

/**
 * Crear animación de morphing entre paths SVG
 */
export function morphSVG(element: SVGPathElement, targetPath: string, options?: gsap.TweenVars) {
  return gsap.to(element, {
    attr: { d: targetPath },
    duration: 1,
    ease: 'power2.inOut',
    ...options,
  })
}

/**
 * Crear animación de scramble text
 */
export function scrambleText(
  element: HTMLElement,
  targetText: string,
  options?: {
    duration?: number
    chars?: string
    ease?: string
  },
) {
  const chars = options?.chars ?? '!<>-_\\/[]{}—=+*^?#________'
  const duration = options?.duration ?? 1
  const originalText = element.textContent || ''

  return gsap.to(element, {
    duration,
    ease: options?.ease ?? 'none',
    onUpdate: function () {
      const progress = this.progress()
      const currentLength = Math.floor(targetText.length * progress)
      let result = ''

      for (let i = 0; i < targetText.length; i++) {
        if (i < currentLength) {
          result += targetText[i]
        } else if (i < originalText.length) {
          result += chars[Math.floor(Math.random() * chars.length)]
        }
      }

      element.textContent = result
    },
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📤 EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { gsap, ScrollTrigger }
export default AnimationPresets
