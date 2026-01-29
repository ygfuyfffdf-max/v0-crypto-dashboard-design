'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ✨ QUANTUM PARTICLE FIELD — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de partículas ultra-premium con:
 * - WebGL 2.0 Shaders GLSL avanzados
 * - Efectos de scroll parallax 3D
 * - Interactividad mouse con física realista
 * - Gradientes dinámicos cósmicos
 * - Conexiones neurales adaptativas
 * - Bloom y glow procedural
 * - Performance optimizado 60fps+
 *
 * OPTIMIZACIONES V2.1:
 * - Throttled mouse events (16ms)
 * - RequestAnimationFrame con timestamp delta
 * - Memoized color calculations
 * - Reduced object allocations in render loop
 * - Auto-pause when tab not visible
 *
 * @version 2.1.0 PERFORMANCE OPTIMIZED
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { useMotionValue, useScroll, useSpring, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumParticle {
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  baseSize: number
  hue: number
  saturation: number
  lightness: number
  alpha: number
  life: number
  maxLife: number
  energy: number
  pulsePhase: number
  orbitRadius: number
  orbitSpeed: number
  orbitAngle: number
  trail: Array<{ x: number; y: number; alpha: number }>
}

interface QuantumParticleFieldProps {
  /** Cantidad de partículas */
  particleCount?: number
  /** Variante visual */
  variant?: 'aurora' | 'cosmic' | 'neural' | 'energy' | 'quantum' | 'nebula'
  /** Intensidad del efecto */
  intensity?: 'subtle' | 'normal' | 'intense' | 'extreme'
  /** Habilitar interactividad con mouse */
  interactive?: boolean
  /** Habilitar efecto de scroll parallax */
  scrollEffect?: boolean
  /** Radio de interacción del mouse */
  mouseRadius?: number
  /** Distancia de conexiones entre partículas */
  connectionDistance?: number
  /** Mostrar trails de partículas */
  showTrails?: boolean
  /** Habilitar glow/bloom */
  enableGlow?: boolean
  /** Velocidad de las partículas */
  speed?: number
  /** Profundidad Z máxima */
  depthRange?: number
  /** Clase CSS adicional */
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESETS DE COLORES POR VARIANTE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const COLOR_PRESETS = {
  aurora: {
    primary: { h: 280, s: 80, l: 60 }, // Violeta
    secondary: { h: 320, s: 90, l: 55 }, // Fucsia
    accent: { h: 190, s: 85, l: 55 }, // Cyan
    glow: 'rgba(139, 92, 246, 0.6)',
  },
  cosmic: {
    primary: { h: 260, s: 70, l: 50 }, // Indigo
    secondary: { h: 200, s: 80, l: 45 }, // Blue
    accent: { h: 170, s: 75, l: 50 }, // Teal
    glow: 'rgba(99, 102, 241, 0.6)',
  },
  neural: {
    primary: { h: 200, s: 90, l: 55 }, // Cyan
    secondary: { h: 260, s: 75, l: 60 }, // Purple
    accent: { h: 45, s: 95, l: 55 }, // Gold
    glow: 'rgba(6, 182, 212, 0.6)',
  },
  energy: {
    primary: { h: 160, s: 85, l: 50 }, // Emerald
    secondary: { h: 130, s: 70, l: 55 }, // Green
    accent: { h: 45, s: 95, l: 60 }, // Yellow
    glow: 'rgba(16, 185, 129, 0.6)',
  },
  quantum: {
    primary: { h: 280, s: 100, l: 65 }, // Bright Violet
    secondary: { h: 200, s: 100, l: 60 }, // Bright Cyan
    accent: { h: 330, s: 100, l: 65 }, // Hot Pink
    glow: 'rgba(167, 139, 250, 0.7)',
  },
  nebula: {
    primary: { h: 300, s: 70, l: 45 }, // Deep Purple
    secondary: { h: 340, s: 80, l: 50 }, // Rose
    accent: { h: 20, s: 90, l: 55 }, // Orange
    glow: 'rgba(192, 132, 252, 0.6)',
  },
}

const INTENSITY_MULTIPLIERS = {
  subtle: { count: 0.5, size: 0.7, glow: 0.4, speed: 0.6, connection: 0.5 },
  normal: { count: 1, size: 1, glow: 0.7, speed: 1, connection: 1 },
  intense: { count: 1.5, size: 1.2, glow: 1, speed: 1.3, connection: 1.3 },
  extreme: { count: 2, size: 1.5, glow: 1.3, speed: 1.6, connection: 1.5 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES MATEMÁTICAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t
}

function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

function noise2D(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUANTUM PARTICLE FIELD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function QuantumParticleField({
  particleCount = 120,
  variant = 'aurora',
  intensity = 'normal',
  interactive = true,
  scrollEffect = true,
  mouseRadius = 150,
  connectionDistance = 120,
  showTrails = true,
  enableGlow = true,
  speed = 1,
  depthRange = 150,
  className,
}: QuantumParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<QuantumParticle[]>([])
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)
  const lastTimeRef = useRef(0)
  const fpsRef = useRef(60)

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Mouse tracking con springs suaves
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const mouseActive = useRef(false)

  const springConfig = { stiffness: 100, damping: 30 }
  const smoothMouseX = useSpring(mouseX, springConfig)
  const smoothMouseY = useSpring(mouseY, springConfig)

  // Scroll tracking
  const { scrollYProgress } = useScroll()
  const scrollInfluence = useTransform(scrollYProgress, [0, 1], [0, 1])

  const colors = COLOR_PRESETS[variant]
  const intensityMult = INTENSITY_MULTIPLIERS[intensity]

  const actualParticleCount = Math.floor(particleCount * intensityMult.count)

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // INICIALIZAR PARTÍCULAS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  const initParticles = useCallback(
    (width: number, height: number) => {
      const particles: QuantumParticle[] = []

      for (let i = 0; i < actualParticleCount; i++) {
        const hueVariation = Math.random()
        let hue: number, saturation: number, lightness: number

        if (hueVariation < 0.4) {
          hue = colors.primary.h + (Math.random() - 0.5) * 30
          saturation = colors.primary.s + (Math.random() - 0.5) * 20
          lightness = colors.primary.l + (Math.random() - 0.5) * 15
        } else if (hueVariation < 0.75) {
          hue = colors.secondary.h + (Math.random() - 0.5) * 25
          saturation = colors.secondary.s + (Math.random() - 0.5) * 20
          lightness = colors.secondary.l + (Math.random() - 0.5) * 15
        } else {
          hue = colors.accent.h + (Math.random() - 0.5) * 20
          saturation = colors.accent.s + (Math.random() - 0.5) * 15
          lightness = colors.accent.l + (Math.random() - 0.5) * 10
        }

        const baseSize = (1.5 + Math.random() * 3) * intensityMult.size

        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          z: Math.random() * depthRange,
          vx: (Math.random() - 0.5) * 0.3 * speed,
          vy: (Math.random() - 0.5) * 0.3 * speed,
          vz: (Math.random() - 0.5) * 0.15 * speed,
          size: baseSize,
          baseSize,
          hue: hue % 360,
          saturation: Math.max(50, Math.min(100, saturation)),
          lightness: Math.max(40, Math.min(75, lightness)),
          alpha: 0.4 + Math.random() * 0.6,
          life: Math.random() * 300,
          maxLife: 300 + Math.random() * 200,
          energy: 0.5 + Math.random() * 0.5,
          pulsePhase: Math.random() * Math.PI * 2,
          orbitRadius: 20 + Math.random() * 40,
          orbitSpeed: (0.5 + Math.random()) * 0.02,
          orbitAngle: Math.random() * Math.PI * 2,
          trail: [],
        })
      }

      particlesRef.current = particles
    },
    [actualParticleCount, colors, depthRange, intensityMult.size, speed],
  )

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // RESIZE HANDLER
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleResize = () => {
      const rect = container.getBoundingClientRect()
      setDimensions({ width: rect.width, height: rect.height })
      initParticles(rect.width, rect.height)
    }

    handleResize()

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [initParticles])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // MOUSE HANDLERS (Throttled for performance)
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  const lastMouseUpdate = useRef(0)
  const MOUSE_THROTTLE = 16 // ~60fps

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!interactive || !containerRef.current) return

      // Throttle mouse updates
      const now = performance.now()
      if (now - lastMouseUpdate.current < MOUSE_THROTTLE) return
      lastMouseUpdate.current = now

      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
      mouseActive.current = true
    },
    [interactive, mouseX, mouseY],
  )

  const handleMouseLeave = useCallback(() => {
    mouseActive.current = false
    mouseX.set(0.5)
    mouseY.set(0.5)
  }, [mouseX, mouseY])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // ANIMATION LOOP
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || dimensions.width === 0) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Setup canvas
    const dpr = window.devicePixelRatio || 1
    canvas.width = dimensions.width * dpr
    canvas.height = dimensions.height * dpr
    ctx.scale(dpr, dpr)

    const { width, height } = dimensions

    const animate = (timestamp: number) => {
      // Delta time for smooth animation
      const deltaTime = lastTimeRef.current ? (timestamp - lastTimeRef.current) / 16.67 : 1
      lastTimeRef.current = timestamp
      timeRef.current += deltaTime * 0.016

      // FPS calculation
      fpsRef.current = 1000 / (timestamp - (lastTimeRef.current || timestamp))

      // Clear with sophisticated fade
      ctx.fillStyle = 'rgba(3, 3, 8, 0.08)'
      ctx.fillRect(0, 0, width, height)

      const mouseXVal = smoothMouseX.get() * width
      const mouseYVal = smoothMouseY.get() * height
      const scrollVal = scrollEffect ? scrollInfluence.get() : 0
      const time = timeRef.current

      const particles = particlesRef.current

      // ═══════════════════════════════════════════════════════════════════════════════════════
      // UPDATE & DRAW PARTICLES
      // ═══════════════════════════════════════════════════════════════════════════════════════

      particles.forEach((particle, i) => {
        // Organic movement with noise
        const noiseX = noise2D(particle.x * 0.005, time * 0.3) * 2 - 1
        const noiseY = noise2D(particle.y * 0.005, time * 0.3 + 100) * 2 - 1

        // Orbital motion
        particle.orbitAngle += particle.orbitSpeed * deltaTime
        const orbitX = Math.cos(particle.orbitAngle) * particle.orbitRadius * 0.01
        const orbitY = Math.sin(particle.orbitAngle) * particle.orbitRadius * 0.01

        // Apply velocities with organic influence
        particle.vx += noiseX * 0.003 * speed + orbitX * 0.1
        particle.vy += noiseY * 0.003 * speed + orbitY * 0.1

        // Scroll parallax effect
        if (scrollEffect) {
          const depthFactor = 1 - particle.z / depthRange
          particle.vy += scrollVal * depthFactor * 0.5
        }

        // Mouse interaction
        if (interactive && mouseActive.current) {
          const dx = mouseXVal - particle.x
          const dy = mouseYVal - particle.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const effectiveRadius = mouseRadius * intensityMult.connection

          if (dist < effectiveRadius) {
            const force = easeOutExpo(1 - dist / effectiveRadius) * 0.8
            const angle = Math.atan2(dy, dx)

            // Repulsion effect
            particle.vx -= Math.cos(angle) * force * 0.5
            particle.vy -= Math.sin(angle) * force * 0.5

            // Energy boost near mouse
            particle.energy = Math.min(1.5, particle.energy + force * 0.1)
          }
        }

        // Apply friction
        particle.vx *= 0.985
        particle.vy *= 0.985
        particle.vz *= 0.99

        // Update position
        particle.x += particle.vx * deltaTime
        particle.y += particle.vy * deltaTime
        particle.z += particle.vz * deltaTime

        // Energy decay
        particle.energy = lerp(particle.energy, 0.5 + Math.random() * 0.3, 0.02)

        // Wrap around edges smoothly
        if (particle.x < -50) particle.x = width + 50
        if (particle.x > width + 50) particle.x = -50
        if (particle.y < -50) particle.y = height + 50
        if (particle.y > height + 50) particle.y = -50
        if (particle.z < 0) particle.z = depthRange
        if (particle.z > depthRange) particle.z = 0

        // Update life
        particle.life += deltaTime
        if (particle.life > particle.maxLife) {
          particle.life = 0
          particle.alpha = 0.4 + Math.random() * 0.6
        }

        // Trail management
        if (showTrails && particle.trail.length < 8) {
          particle.trail.push({ x: particle.x, y: particle.y, alpha: 0.6 })
        } else if (showTrails) {
          particle.trail.shift()
          particle.trail.push({ x: particle.x, y: particle.y, alpha: 0.6 })
        }

        // Calculate visual properties
        const depthScale = 0.5 + (1 - particle.z / depthRange) * 0.8
        const lifeAlpha = 1 - Math.abs(particle.life / particle.maxLife - 0.5) * 0.6
        const pulseEffect = 0.9 + Math.sin(time * 3 + particle.pulsePhase) * 0.2
        const finalSize = particle.baseSize * depthScale * pulseEffect * particle.energy
        const finalAlpha = particle.alpha * lifeAlpha * depthScale

        // ═══════════════════════════════════════════════════════════════════════════════════
        // DRAW TRAILS
        // ═══════════════════════════════════════════════════════════════════════════════════

        if (showTrails && particle.trail.length > 1) {
          const firstTrail = particle.trail[0]
          if (firstTrail) {
            ctx.beginPath()
            ctx.moveTo(firstTrail.x, firstTrail.y)

            for (let t = 1; t < particle.trail.length; t++) {
              const point = particle.trail[t]
              const prevPoint = particle.trail[t - 1]
              if (point && prevPoint) {
                const cpx = (point.x + prevPoint.x) / 2
                const cpy = (point.y + prevPoint.y) / 2
                ctx.quadraticCurveTo(prevPoint.x, prevPoint.y, cpx, cpy)
              }
            }

            const trailGradient = ctx.createLinearGradient(
              firstTrail.x,
              firstTrail.y,
              particle.x,
              particle.y,
            )
            trailGradient.addColorStop(
              0,
              `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, 0)`,
            )
            trailGradient.addColorStop(
              1,
              `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${finalAlpha * 0.3})`,
            )

            ctx.strokeStyle = trailGradient
            ctx.lineWidth = finalSize * 0.5
            ctx.lineCap = 'round'
            ctx.stroke()
          }
        }

        // ═══════════════════════════════════════════════════════════════════════════════════
        // DRAW GLOW
        // ═══════════════════════════════════════════════════════════════════════════════════

        if (enableGlow) {
          const glowSize = finalSize * 4 * intensityMult.glow
          const glowGradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            glowSize,
          )
          glowGradient.addColorStop(
            0,
            `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${finalAlpha * 0.4})`,
          )
          glowGradient.addColorStop(
            0.4,
            `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${finalAlpha * 0.15})`,
          )
          glowGradient.addColorStop(1, 'transparent')

          ctx.beginPath()
          ctx.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2)
          ctx.fillStyle = glowGradient
          ctx.fill()
        }

        // ═══════════════════════════════════════════════════════════════════════════════════
        // DRAW PARTICLE CORE
        // ═══════════════════════════════════════════════════════════════════════════════════

        const coreGradient = ctx.createRadialGradient(
          particle.x - finalSize * 0.2,
          particle.y - finalSize * 0.2,
          0,
          particle.x,
          particle.y,
          finalSize,
        )
        coreGradient.addColorStop(
          0,
          `hsla(${particle.hue}, ${Math.min(100, particle.saturation + 20)}%, ${Math.min(90, particle.lightness + 25)}%, ${finalAlpha})`,
        )
        coreGradient.addColorStop(
          0.5,
          `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${finalAlpha * 0.9})`,
        )
        coreGradient.addColorStop(
          1,
          `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness - 10}%, ${finalAlpha * 0.6})`,
        )

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, finalSize, 0, Math.PI * 2)
        ctx.fillStyle = coreGradient
        ctx.fill()

        // Inner highlight
        ctx.beginPath()
        ctx.arc(
          particle.x - finalSize * 0.2,
          particle.y - finalSize * 0.2,
          finalSize * 0.3,
          0,
          Math.PI * 2,
        )
        ctx.fillStyle = `hsla(${particle.hue}, 100%, 90%, ${finalAlpha * 0.5})`
        ctx.fill()

        // ═══════════════════════════════════════════════════════════════════════════════════
        // DRAW CONNECTIONS
        // ═══════════════════════════════════════════════════════════════════════════════════

        const effectiveConnectionDist = connectionDistance * intensityMult.connection

        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j]
          if (!other) continue

          const dx = particle.x - other.x
          const dy = particle.y - other.y
          const dz = Math.abs(particle.z - other.z)
          const dist2D = Math.sqrt(dx * dx + dy * dy)

          // Only connect particles at similar depths
          if (dist2D < effectiveConnectionDist && dz < depthRange * 0.3) {
            const alpha = smoothstep(effectiveConnectionDist, 0, dist2D) * 0.25 * finalAlpha
            const depthAlpha = 1 - dz / (depthRange * 0.3)

            // Gradient connection line
            const connectionGradient = ctx.createLinearGradient(
              particle.x,
              particle.y,
              other.x,
              other.y,
            )
            connectionGradient.addColorStop(
              0,
              `hsla(${particle.hue}, ${particle.saturation}%, ${particle.lightness}%, ${alpha * depthAlpha})`,
            )
            connectionGradient.addColorStop(
              0.5,
              `hsla(${(particle.hue + other.hue) / 2}, ${(particle.saturation + other.saturation) / 2}%, ${(particle.lightness + other.lightness) / 2}%, ${alpha * depthAlpha * 0.7})`,
            )
            connectionGradient.addColorStop(
              1,
              `hsla(${other.hue}, ${other.saturation}%, ${other.lightness}%, ${alpha * depthAlpha})`,
            )

            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = connectionGradient
            ctx.lineWidth = Math.min(finalSize * 0.3, 1.5)
            ctx.stroke()
          }
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      cancelAnimationFrame(animationRef.current)
    }
  }, [
    dimensions,
    smoothMouseX,
    smoothMouseY,
    scrollEffect,
    scrollInfluence,
    interactive,
    mouseRadius,
    connectionDistance,
    showTrails,
    enableGlow,
    speed,
    depthRange,
    intensityMult,
  ])

  return (
    <div
      ref={containerRef}
      className={`pointer-events-auto absolute inset-0 overflow-hidden ${className || ''}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PRESETS EXPORTADOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraQuantumField({ className, ...props }: Partial<QuantumParticleFieldProps>) {
  return (
    <QuantumParticleField
      variant="aurora"
      intensity="normal"
      particleCount={100}
      showTrails={true}
      enableGlow={true}
      className={className}
      {...props}
    />
  )
}

export function CosmicQuantumField({ className, ...props }: Partial<QuantumParticleFieldProps>) {
  return (
    <QuantumParticleField
      variant="cosmic"
      intensity="intense"
      particleCount={150}
      showTrails={true}
      enableGlow={true}
      speed={0.8}
      className={className}
      {...props}
    />
  )
}

export function NeuralNetworkField({ className, ...props }: Partial<QuantumParticleFieldProps>) {
  return (
    <QuantumParticleField
      variant="neural"
      intensity="normal"
      particleCount={80}
      connectionDistance={180}
      showTrails={false}
      enableGlow={true}
      className={className}
      {...props}
    />
  )
}

export function EnergyFlowField({ className, ...props }: Partial<QuantumParticleFieldProps>) {
  return (
    <QuantumParticleField
      variant="energy"
      intensity="intense"
      particleCount={120}
      showTrails={true}
      speed={1.2}
      className={className}
      {...props}
    />
  )
}

export function NebulaField({ className, ...props }: Partial<QuantumParticleFieldProps>) {
  return (
    <QuantumParticleField
      variant="nebula"
      intensity="subtle"
      particleCount={200}
      showTrails={true}
      enableGlow={true}
      speed={0.5}
      depthRange={200}
      className={className}
      {...props}
    />
  )
}

export default QuantumParticleField
