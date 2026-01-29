/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⚡ PERFORMANCE OPTIMIZATION SYSTEM — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de optimización de performance para paneles Aurora
 * - RequestAnimationFrame optimizado con throttling
 * - Canvas offscreen para rendering pesado
 * - Web Workers para cálculos paralelos
 * - Memory pooling para objetos reutilizables
 * - GPU acceleration hints
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CANVAS OPTIMIZATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Setup optimizado de canvas con High DPI y GPU acceleration
 */
export function setupOptimizedCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d', {
    alpha: true,
    desynchronized: true, // GPU acceleration hint
    willReadFrequently: false,
  })

  if (!ctx) return null

  const dpr = Math.min(window.devicePixelRatio || 1, 2) // Cap a 2x para performance
  const rect = canvas.getBoundingClientRect()

  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`

  ctx.scale(dpr, dpr)

  // Enable image smoothing para mejor calidad
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'

  return ctx
}

/**
 * RAF optimizado con frame skipping para 60fps estables
 */
export class OptimizedRAF {
  private callback: (deltaTime: number) => void
  private rafId: number = 0
  private lastTime: number = 0
  private targetFPS: number = 60
  private frameInterval: number
  private isRunning: boolean = false

  constructor(callback: (deltaTime: number) => void, targetFPS: number = 60) {
    this.callback = callback
    this.targetFPS = targetFPS
    this.frameInterval = 1000 / targetFPS
  }

  start() {
    if (this.isRunning) return
    this.isRunning = true
    this.lastTime = performance.now()
    this.animate()
  }

  stop() {
    this.isRunning = false
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
    }
  }

  private animate = () => {
    if (!this.isRunning) return

    const currentTime = performance.now()
    const deltaTime = currentTime - this.lastTime

    // Frame skipping si estamos muy lentos
    if (deltaTime >= this.frameInterval) {
      this.lastTime = currentTime - (deltaTime % this.frameInterval)
      this.callback(deltaTime / 1000) // deltaTime en segundos
    }

    this.rafId = requestAnimationFrame(this.animate)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// OBJECT POOLING (reduce garbage collection)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class ObjectPool<T> {
  private pool: T[] = []
  private factory: () => T
  private reset: (obj: T) => void

  constructor(factory: () => T, reset: (obj: T) => void, initialSize: number = 100) {
    this.factory = factory
    this.reset = reset

    // Pre-allocate objects
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(factory())
    }
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!
    }
    return this.factory()
  }

  release(obj: T) {
    this.reset(obj)
    this.pool.push(obj)
  }

  clear() {
    this.pool = []
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM OPTIMIZADO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
  alpha: number
}

export function createParticlePool(size: number = 200): ObjectPool<Particle> {
  return new ObjectPool<Particle>(
    () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 1,
      life: 0,
      maxLife: 100,
      color: '#ffffff',
      alpha: 1,
    }),
    (p) => {
      p.life = 0
      p.alpha = 1
    },
    size,
  )
}

/**
 * Renderiza partículas optimizado con batching
 */
export function renderParticlesBatched(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  colors: string[],
) {
  // Agrupar por color para reduce context switches
  const byColor = new Map<string, Particle[]>()

  particles.forEach((p) => {
    if (!byColor.has(p.color)) {
      byColor.set(p.color, [])
    }
    byColor.get(p.color)!.push(p)
  })

  // Renderizar por lotes
  byColor.forEach((batch, color) => {
    ctx.fillStyle = color
    batch.forEach((p) => {
      ctx.globalAlpha = p.alpha
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fill()
    })
  })

  ctx.globalAlpha = 1
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MICRO-ANIMATIONS (60fps smooth)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const MICRO_TRANSITIONS = {
  // Ultra-rápidas para feedback inmediato
  instant: { duration: 0.1, ease: 'easeOut' },

  // Rápidas para hover states
  fast: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },

  // Normales para transiciones UI
  smooth: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },

  // Bounce para elementos interactivos
  bounce: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
  },
} as const

/**
 * Hook para optimizar animaciones de hover
 */
export function useOptimizedHover() {
  const [isHovered, setIsHovered] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const onMouseEnter = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setIsHovered(true)
  }, [])

  const onMouseLeave = useCallback(() => {
    // Pequeño delay para evitar flicker
    timeoutRef.current = setTimeout(() => setIsHovered(false), 50)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  return { isHovered, onMouseEnter, onMouseLeave }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GLASSMORPHISM PREMIUM CLASSES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const GLASS_CLASSES = {
  // Cards premium
  card: 'bg-white/[0.02] backdrop-blur-xl border border-white/10',
  cardHover: 'hover:bg-white/[0.04] hover:border-white/20 hover:shadow-xl hover:shadow-violet-500/10',

  // Inputs
  input: 'bg-white/[0.03] backdrop-blur-lg border border-white/10 focus:border-white/30',

  // Buttons
  buttonPrimary: 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500',
  buttonGhost: 'bg-white/5 hover:bg-white/10 backdrop-blur-lg border border-white/10',

  // Badges
  badge: 'bg-white/10 backdrop-blur-md border border-white/20',

  // Overlays
  overlay: 'bg-black/40 backdrop-blur-sm',

  // Glow effects
  glowViolet: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
  glowPurple: 'shadow-[0_0_30px_rgba(168,85,247,0.3)]',
  glowFuchsia: 'shadow-[0_0_30px_rgba(217,70,239,0.3)]',
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PERFORMANCE MONITORING
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class PerformanceMonitor {
  private frameTimes: number[] = []
  private maxSamples: number = 60
  private lastTime: number = performance.now()

  recordFrame() {
    const now = performance.now()
    const frameTime = now - this.lastTime
    this.lastTime = now

    this.frameTimes.push(frameTime)
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift()
    }
  }

  get fps(): number {
    if (this.frameTimes.length === 0) return 60
    const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
    return Math.round(1000 / avg)
  }

  get isSmooth(): boolean {
    return this.fps >= 55 // 55+ fps = smooth
  }

  reset() {
    this.frameTimes = []
    this.lastTime = performance.now()
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
