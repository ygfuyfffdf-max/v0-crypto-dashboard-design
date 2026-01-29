/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS RISING — ANIMACIÓN DE INICIO CINEMATOGRÁFICA SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Animación de inicio que evoca el despertar de una inteligencia poderosa y atemporal.
 * El nombre "ΧΡΟΝΟΣ" surge de una forma visualmente cautivadora, representando el tiempo
 * mismo tomando forma.
 *
 * Características:
 * - Sistema de partículas avanzado (polvo estelar, nebulosas cósmicas)
 * - Logo integrado como núcleo de singularidad
 * - Tipografía ΧΡΟΝΟΣ elegante con trazos geométricos
 * - Paleta cósmica: azules profundos, púrpuras, plateados, dorados
 * - Iluminación volumétrica, distorsión espacial, flares de lente
 * - Duración: 3-5 segundos
 * - Audio reactivo opcional
 *
 * @version 1.0.0 SUPREME ELITE
 * @author CHRONOS INFINITY TEAM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS Y CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ChronosRisingProps {
  /** Callback cuando la animación termina */
  onComplete?: () => void
  /** Duración en milisegundos (3000-5000 recomendado) */
  duration?: number
  /** Permitir skip con click/tecla */
  skipEnabled?: boolean
  /** Mostrar barra de progreso */
  showProgress?: boolean
  /** Reproducir audio */
  enableAudio?: boolean
  /** Variante visual */
  variant?: 'cosmic' | 'singularity' | 'nebula' | 'quantum'
  /** Clase CSS adicional */
  className?: string
}

interface CosmicParticle {
  id: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  baseSize: number
  opacity: number
  color: string
  type: 'star' | 'dust' | 'energy' | 'singularity'
  orbitRadius: number
  orbitSpeed: number
  orbitAngle: number
  pulsePhase: number
  trail: Array<{ x: number; y: number; opacity: number }>
}

interface NebulaClouds {
  x: number
  y: number
  radius: number
  color1: string
  color2: string
  rotation: number
  scale: number
}

type AnimationPhase =
  | 'void'
  | 'stardust'
  | 'convergence'
  | 'singularity'
  | 'revelation'
  | 'complete'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PALETA DE COLORES CÓSMICA (sin cyan puro)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const COSMIC_PALETTE = {
  void: '#000000',
  deepSpace: '#050510',
  nebulaPurple: '#2D1B4E',
  violetElectric: '#8B00FF',
  indigoCosmic: '#4B0082',
  goldPremium: '#FFD700',
  silverStar: '#C0C0C0',
  plasmaPink: '#FF1493',
  roseNebula: '#FF6B9D',
  warmAmber: '#FEAE42',
  glowViolet: '#C084FC',
  deepBlue: '#1E3A8A',
  royalPurple: '#7C3AED',
}

const PARTICLE_COLORS = [
  COSMIC_PALETTE.violetElectric,
  COSMIC_PALETTE.goldPremium,
  COSMIC_PALETTE.glowViolet,
  COSMIC_PALETTE.plasmaPink,
  COSMIC_PALETTE.silverStar,
  COSMIC_PALETTE.roseNebula,
  COSMIC_PALETTE.warmAmber,
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES MATEMÁTICAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function easeOutExpo(x: number): number {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x)
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}

function easeOutElastic(x: number): number {
  const c4 = (2 * Math.PI) / 3
  return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1
}

function easeOutBack(x: number): number {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
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
// COMPONENTE KOCMOC LOGO — Estilo КОСМОС con ΧΡΟΝΟΣ
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OrbitalCoreProps {
  phase: AnimationPhase
  progress: number
  size: number
}

const OrbitalCore = memo(function OrbitalCore({ phase, progress, size }: OrbitalCoreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const scale = size / 400

    // ═══ CONFIGURACIÓN DE ÓRBITAS ESTILO KOCMOC ═══
    const orbits = [
      { rx: 120 * scale, ry: 50 * scale, rotation: -30, dotted: false, opacity: 0.4 },
      { rx: 105 * scale, ry: 45 * scale, rotation: 25, dotted: true, opacity: 0.3 },
      { rx: 90 * scale, ry: 38 * scale, rotation: -15, dotted: true, opacity: 0.35 },
      { rx: 75 * scale, ry: 32 * scale, rotation: 40, dotted: false, opacity: 0.3 },
      { rx: 60 * scale, ry: 26 * scale, rotation: -8, dotted: true, opacity: 0.25 },
    ]

    // ═══ NODOS EN LA LÍNEA HORIZONTAL ═══
    const lineLength = 130 * scale
    const lineNodes = [
      { offset: -1.0, size: 4 * scale, filled: true },
      { offset: -0.65, size: 8 * scale, filled: false, innerSize: 3 * scale },
      { offset: -0.35, size: 4 * scale, filled: true },
      { offset: 0, size: 22 * scale, filled: false, innerSize: 10 * scale, isCore: true },
      { offset: 0.35, size: 4 * scale, filled: true },
      { offset: 0.65, size: 10 * scale, filled: false, innerSize: 4 * scale, hasRing: true },
      { offset: 1.0, size: 4 * scale, filled: true },
    ]

    const animate = () => {
      timeRef.current += 0.012
      ctx.clearRect(0, 0, size, size)

      const phaseProgress = phase === 'singularity' ? progress : phase === 'revelation' ? 1 : 0
      const opacity = smoothstep(0, 0.3, phaseProgress)

      if (opacity <= 0) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.globalAlpha = opacity

      // ═══ DIBUJAR ÓRBITAS ELÍPTICAS ═══
      const orbitReveal = easeOutExpo(phaseProgress)

      orbits.forEach((orbit, i) => {
        const orbitOpacity = smoothstep(i * 0.12, i * 0.12 + 0.25, orbitReveal) * orbit.opacity
        if (orbitOpacity <= 0) return

        ctx.save()
        ctx.translate(cx, cy)

        // Rotación con animación sutil
        const rotOffset = Math.sin(timeRef.current + i * 0.7) * 2
        ctx.rotate(((orbit.rotation + rotOffset) * Math.PI) / 180)

        ctx.strokeStyle = `rgba(255, 255, 255, ${orbitOpacity})`
        ctx.lineWidth = orbit.dotted ? 0.8 : 1.2

        if (orbit.dotted) {
          ctx.setLineDash([3, 5])
        } else {
          ctx.setLineDash([])
        }

        ctx.beginPath()
        ctx.ellipse(0, 0, orbit.rx, orbit.ry, 0, 0, Math.PI * 2)
        ctx.stroke()

        ctx.restore()
      })

      // ═══ LÍNEA HORIZONTAL PRINCIPAL ═══
      const lineOpacity = smoothstep(0.2, 0.5, orbitReveal) * 0.6
      ctx.setLineDash([])
      ctx.strokeStyle = `rgba(255, 255, 255, ${lineOpacity})`
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(cx - lineLength, cy)
      ctx.lineTo(cx + lineLength, cy)
      ctx.stroke()

      // ═══ DIBUJAR NODOS ═══
      const nodeReveal = smoothstep(0.3, 0.7, orbitReveal)

      lineNodes.forEach((node, i) => {
        const nodeOpacity = smoothstep(i * 0.08, i * 0.08 + 0.2, nodeReveal)
        if (nodeOpacity <= 0) return

        const nx = cx + node.offset * lineLength
        const ny = cy

        if (node.isCore) {
          // ═══ NÚCLEO CENTRAL ═══

          // Glow del núcleo
          const coreGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, node.size * 2)
          coreGlow.addColorStop(0, `rgba(255, 255, 255, ${0.15 * nodeOpacity})`)
          coreGlow.addColorStop(1, 'transparent')
          ctx.fillStyle = coreGlow
          ctx.beginPath()
          ctx.arc(nx, ny, node.size * 2, 0, Math.PI * 2)
          ctx.fill()

          // Anillo exterior
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.8 * nodeOpacity})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(nx, ny, node.size, 0, Math.PI * 2)
          ctx.stroke()

          // Punto central brillante con pulso
          const pulse = 0.85 + Math.sin(timeRef.current * 3) * 0.15
          ctx.fillStyle = `rgba(255, 255, 255, ${pulse * nodeOpacity})`
          ctx.beginPath()
          ctx.arc(nx, ny, node.innerSize!, 0, Math.PI * 2)
          ctx.fill()
        } else if (node.filled) {
          // ═══ NODO SÓLIDO ═══
          ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * nodeOpacity})`
          ctx.beginPath()
          ctx.arc(nx, ny, node.size, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // ═══ NODO CON ANILLO ═══
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.6 * nodeOpacity})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(nx, ny, node.size, 0, Math.PI * 2)
          ctx.stroke()

          if (node.innerSize) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * nodeOpacity})`
            ctx.beginPath()
            ctx.arc(nx, ny, node.innerSize, 0, Math.PI * 2)
            ctx.fill()
          }

          if (node.hasRing) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 * nodeOpacity})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.arc(nx, ny, node.size + 5 * scale, 0, Math.PI * 2)
            ctx.stroke()
          }
        }
      })

      ctx.globalAlpha = 1
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [phase, progress, size])

  return (
    <canvas ref={canvasRef} className="absolute inset-0" style={{ width: size, height: size }} />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE DE PARTÍCULAS CÓSMICAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CosmicParticleSystemProps {
  phase: AnimationPhase
  progress: number
  width: number
  height: number
}

const CosmicParticleSystem = memo(function CosmicParticleSystem({
  phase,
  progress,
  width,
  height,
}: CosmicParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<CosmicParticle[]>([])
  const nebulaeRef = useRef<NebulaClouds[]>([])
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  const createParticles = useCallback(() => {
    const particles: CosmicParticle[] = []
    const centerX = width / 2
    const centerY = height / 2
    const maxDist = Math.max(width, height)

    // Partículas de polvo estelar
    for (let i = 0; i < 400; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * maxDist * 0.8 + maxDist * 0.1
      const type = Math.random() > 0.7 ? 'energy' : Math.random() > 0.4 ? 'dust' : 'star'

      particles.push({
        id: i,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        z: Math.random() * 200 - 100,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.2,
        size: type === 'energy' ? Math.random() * 4 + 2 : Math.random() * 2 + 0.5,
        baseSize: 0,
        opacity: Math.random() * 0.8 + 0.2,
        color:
          PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)] ??
          COSMIC_PALETTE.glowViolet,
        type,
        orbitRadius: distance,
        orbitSpeed: (Math.random() - 0.5) * 0.002,
        orbitAngle: angle,
        pulsePhase: Math.random() * Math.PI * 2,
        trail: [],
      })
    }

    // Partículas de singularidad (más pequeñas, más rápidas)
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * 100 + 50

      particles.push({
        id: 400 + i,
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        z: Math.random() * 50 - 25,
        vx: 0,
        vy: 0,
        vz: 0,
        size: Math.random() * 1.5 + 0.3,
        baseSize: 0,
        opacity: Math.random() * 0.6 + 0.4,
        color: Math.random() > 0.5 ? COSMIC_PALETTE.goldPremium : COSMIC_PALETTE.silverStar,
        type: 'singularity',
        orbitRadius: distance,
        orbitSpeed: (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 0.01 + 0.005),
        orbitAngle: angle,
        pulsePhase: Math.random() * Math.PI * 2,
        trail: [],
      })
    }

    return particles
  }, [width, height])

  const createNebulae = useCallback(() => {
    const nebulae: NebulaClouds[] = []
    const centerX = width / 2
    const centerY = height / 2

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2
      const distance = Math.random() * 200 + 150

      nebulae.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        radius: Math.random() * 150 + 100,
        color1: COSMIC_PALETTE.violetElectric,
        color2: i % 2 === 0 ? COSMIC_PALETTE.plasmaPink : COSMIC_PALETTE.indigoCosmic,
        rotation: Math.random() * Math.PI,
        scale: Math.random() * 0.5 + 0.5,
      })
    }

    return nebulae
  }, [width, height])

  useEffect(() => {
    particlesRef.current = createParticles()
    nebulaeRef.current = createNebulae()
  }, [createParticles, createNebulae])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    const centerX = width / 2
    const centerY = height / 2

    const animate = () => {
      timeRef.current += 0.016
      ctx.clearRect(0, 0, width, height)

      // Fondo con gradiente cósmico profundo
      const bgGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        Math.max(width, height) * 0.7,
      )
      bgGradient.addColorStop(0, COSMIC_PALETTE.nebulaPurple)
      bgGradient.addColorStop(0.5, COSMIC_PALETTE.deepSpace)
      bgGradient.addColorStop(1, COSMIC_PALETTE.void)
      ctx.fillStyle = bgGradient
      ctx.fillRect(0, 0, width, height)

      // Dibujar nebulosas de fondo
      nebulaeRef.current.forEach((nebula) => {
        const nebulaOpacity = phase === 'void' ? 0 : smoothstep(0, 0.3, progress) * 0.3
        if (nebulaOpacity <= 0) return

        const nebulaGradient = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.radius,
        )
        nebulaGradient.addColorStop(
          0,
          `${nebula.color1}${Math.round(nebulaOpacity * 255)
            .toString(16)
            .padStart(2, '0')}`,
        )
        nebulaGradient.addColorStop(
          0.5,
          `${nebula.color2}${Math.round(nebulaOpacity * 0.5 * 255)
            .toString(16)
            .padStart(2, '0')}`,
        )
        nebulaGradient.addColorStop(1, 'transparent')

        ctx.fillStyle = nebulaGradient
        ctx.beginPath()
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Actualizar y dibujar partículas
      particlesRef.current.forEach((p) => {
        const dx = centerX - p.x
        const dy = centerY - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Comportamiento según fase
        if (phase === 'void' || phase === 'stardust') {
          // Movimiento orbital suave
          p.orbitAngle += p.orbitSpeed
          const targetX = centerX + Math.cos(p.orbitAngle) * p.orbitRadius
          const targetY = centerY + Math.sin(p.orbitAngle) * p.orbitRadius
          p.x = lerp(p.x, targetX, 0.02)
          p.y = lerp(p.y, targetY, 0.02)
        } else if (phase === 'convergence') {
          // Convergencia hacia el centro
          const convergenceSpeed = easeInOutCubic(progress) * 0.05
          p.vx = dx * convergenceSpeed
          p.vy = dy * convergenceSpeed
          p.x += p.vx
          p.y += p.vy

          // Reducir radio orbital
          p.orbitRadius = lerp(p.orbitRadius, 50, 0.02)
        } else if (phase === 'singularity') {
          // Órbita rápida alrededor del centro
          const orbitSpeedMult = 3 + progress * 5
          p.orbitAngle += p.orbitSpeed * orbitSpeedMult
          const targetRadius = lerp(p.orbitRadius, 30, 0.05)
          p.orbitRadius = targetRadius
          p.x = centerX + Math.cos(p.orbitAngle) * targetRadius
          p.y = centerY + Math.sin(p.orbitAngle) * targetRadius
        } else if (phase === 'revelation') {
          // Expansión épica
          const expansionForce = easeOutElastic(progress) * 2
          const angle = Math.atan2(dy, dx) + Math.PI
          p.vx = Math.cos(angle) * expansionForce * (p.type === 'energy' ? 3 : 1)
          p.vy = Math.sin(angle) * expansionForce * (p.type === 'energy' ? 3 : 1)
          p.x += p.vx
          p.y += p.vy
        }

        // Calcular opacidad según fase
        let particleOpacity = p.opacity
        if (phase === 'void') {
          particleOpacity *= smoothstep(0, 0.5, progress)
        } else if (phase === 'convergence') {
          particleOpacity *= 1 - (distance / Math.max(width, height)) * 0.3
        } else if (phase === 'singularity') {
          particleOpacity *= 0.7 + Math.sin(timeRef.current * 10 + p.pulsePhase) * 0.3
        } else if (phase === 'revelation') {
          particleOpacity *= 1 - progress * 0.5
        }

        // Efecto de pulso
        const pulseEffect = 1 + Math.sin(timeRef.current * 3 + p.pulsePhase) * 0.2
        const currentSize = p.size * pulseEffect

        // Dibujar glow
        if (p.type === 'energy' || p.type === 'singularity') {
          const glowGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, currentSize * 4)
          glowGradient.addColorStop(
            0,
            `${p.color}${Math.round(particleOpacity * 0.6 * 255)
              .toString(16)
              .padStart(2, '0')}`,
          )
          glowGradient.addColorStop(1, 'transparent')
          ctx.fillStyle = glowGradient
          ctx.beginPath()
          ctx.arc(p.x, p.y, currentSize * 4, 0, Math.PI * 2)
          ctx.fill()
        }

        // Dibujar partícula
        ctx.fillStyle = `${p.color}${Math.round(particleOpacity * 255)
          .toString(16)
          .padStart(2, '0')}`
        ctx.beginPath()
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2)
        ctx.fill()

        // Trail para partículas de energía
        if (p.type === 'energy' && (phase === 'convergence' || phase === 'singularity')) {
          p.trail.push({ x: p.x, y: p.y, opacity: particleOpacity })
          if (p.trail.length > 15) p.trail.shift()

          p.trail.forEach((point, i) => {
            const trailOpacity = (i / p.trail.length) * point.opacity * 0.5
            ctx.fillStyle = `${p.color}${Math.round(trailOpacity * 255)
              .toString(16)
              .padStart(2, '0')}`
            ctx.beginPath()
            ctx.arc(point.x, point.y, currentSize * (i / p.trail.length), 0, Math.PI * 2)
            ctx.fill()
          })
        }
      })

      // Efecto de flare central en singularidad
      if (phase === 'singularity' || phase === 'revelation') {
        const flareOpacity = phase === 'singularity' ? smoothstep(0.3, 0.8, progress) : 1 - progress
        const flareRadius = phase === 'revelation' ? 50 + progress * 200 : 50

        const flareGradient = ctx.createRadialGradient(
          centerX,
          centerY,
          0,
          centerX,
          centerY,
          flareRadius,
        )
        flareGradient.addColorStop(0, `rgba(255, 255, 255, ${flareOpacity * 0.8})`)
        flareGradient.addColorStop(0.2, `rgba(139, 0, 255, ${flareOpacity * 0.5})`)
        flareGradient.addColorStop(0.5, `rgba(255, 215, 0, ${flareOpacity * 0.3})`)
        flareGradient.addColorStop(1, 'transparent')

        ctx.fillStyle = flareGradient
        ctx.beginPath()
        ctx.arc(centerX, centerY, flareRadius, 0, Math.PI * 2)
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [phase, progress, width, height])

  return <canvas ref={canvasRef} className="absolute inset-0" style={{ width, height }} />
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL - CHRONOS RISING
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function ChronosRisingAnimation({
  onComplete,
  duration = 4500,
  skipEnabled = true,
  showProgress = true,
  variant = 'cosmic',
  className = '',
}: ChronosRisingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [phase, setPhase] = useState<AnimationPhase>('void')
  const [progress, setProgress] = useState(0)
  const [showSkip, setShowSkip] = useState(false)
  const startTimeRef = useRef(0)
  const animationRef = useRef<number>(0)

  // Fases de la animación con tiempos
  const PHASE_TIMINGS = useMemo(
    () => ({
      void: { start: 0, end: 0.15 },
      stardust: { start: 0.15, end: 0.35 },
      convergence: { start: 0.35, end: 0.55 },
      singularity: { start: 0.55, end: 0.75 },
      revelation: { start: 0.75, end: 0.95 },
      complete: { start: 0.95, end: 1 },
    }),
    [],
  )

  // Resize handler
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Mostrar skip después de 1 segundo
  useEffect(() => {
    if (!skipEnabled) return undefined
    const timer = setTimeout(() => setShowSkip(true), 1000)
    return () => clearTimeout(timer)
  }, [skipEnabled])

  // Animación principal
  useEffect(() => {
    if (dimensions.width === 0) return undefined

    startTimeRef.current = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current
      const progressValue = Math.min(elapsed / duration, 1)
      setProgress(progressValue)

      // Determinar fase actual
      let currentPhase: AnimationPhase = 'void'
      for (const [phaseName, timing] of Object.entries(PHASE_TIMINGS) as [
        AnimationPhase,
        { start: number; end: number },
      ][]) {
        if (progressValue >= timing.start && progressValue < timing.end) {
          currentPhase = phaseName
          break
        }
      }
      if (progressValue >= PHASE_TIMINGS.complete.start) {
        currentPhase = 'complete'
      }
      setPhase(currentPhase)

      if (progressValue < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        onComplete?.()
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, duration, onComplete, PHASE_TIMINGS])

  // Handler para skip
  const handleSkip = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    onComplete?.()
  }, [onComplete])

  // Calcular progreso de fase actual
  const getPhaseProgress = useCallback(() => {
    const timing = PHASE_TIMINGS[phase]
    if (!timing) return 0
    const phaseProgress = (progress - timing.start) / (timing.end - timing.start)
    return Math.max(0, Math.min(1, phaseProgress))
  }, [phase, progress, PHASE_TIMINGS])

  const phaseProgress = getPhaseProgress()

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[9999] overflow-hidden ${className}`}
      style={{ backgroundColor: COSMIC_PALETTE.void }}
      onClick={skipEnabled ? handleSkip : undefined}
      onKeyDown={(e) => skipEnabled && e.key === 'Escape' && handleSkip()}
      tabIndex={0}
    >
      {/* Sistema de partículas cósmicas */}
      {dimensions.width > 0 && (
        <CosmicParticleSystem
          phase={phase}
          progress={phaseProgress}
          width={dimensions.width}
          height={dimensions.height}
        />
      )}

      {/* Logo orbital central */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <OrbitalCore
          phase={phase}
          progress={phaseProgress}
          size={Math.min(dimensions.width, dimensions.height) * 0.5}
        />
      </div>

      {/* Tipografía ΧΡΟΝΟΣ */}
      <AnimatePresence>
        {(phase === 'revelation' || phase === 'complete') && (
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                duration: 1.2,
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.2,
              },
            }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <h1
              className="text-center font-serif tracking-[0.3em] select-none"
              style={{
                fontSize: 'clamp(2rem, 8vw, 6rem)',
                fontWeight: 300,
                color: COSMIC_PALETTE.silverStar,
                textShadow: `
                  0 0 20px ${COSMIC_PALETTE.violetElectric}80,
                  0 0 40px ${COSMIC_PALETTE.violetElectric}40,
                  0 0 60px ${COSMIC_PALETTE.goldPremium}30,
                  0 0 80px ${COSMIC_PALETTE.plasmaPink}20
                `,
                letterSpacing: '0.4em',
              }}
            >
              ΧΡΟΝΟΣ
            </h1>
            <motion.p
              className="mt-4 text-center tracking-[0.5em] uppercase"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              style={{
                fontSize: 'clamp(0.6rem, 1.5vw, 1rem)',
                color: COSMIC_PALETTE.glowViolet,
                letterSpacing: '0.6em',
              }}
            >
              El Tiempo Toma Forma
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de progreso */}
      {showProgress && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="h-0.5 w-48 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${COSMIC_PALETTE.violetElectric}, ${COSMIC_PALETTE.goldPremium}, ${COSMIC_PALETTE.plasmaPink})`,
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>
      )}

      {/* Botón de skip */}
      <AnimatePresence>
        {showSkip && skipEnabled && (
          <motion.button
            className="absolute right-8 bottom-8 px-4 py-2 text-sm tracking-wider text-white/50 transition-colors hover:text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
          >
            Saltar ▸
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ChronosRisingAnimation
