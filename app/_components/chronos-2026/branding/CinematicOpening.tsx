/**
 * 🎬 CHRONOS CINEMATIC OPENING - APERTURA CINEMATOGRÁFICA PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════
 * Secuencia de apertura cinematográfica con animaciones de partículas,
 * revelación del logo CHRONOS y transiciones fluidas
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChronosLogo } from './ChronosLogo'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

export interface CinematicOpeningProps {
  onComplete?: () => void
  duration?: number
  skipEnabled?: boolean
  showProgress?: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  life: number
  maxLife: number
  color: string
}

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function CinematicOpening({
  onComplete,
  duration = 6000,
  skipEnabled = true,
  showProgress = true,
}: CinematicOpeningProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [phase, setPhase] = useState<'particles' | 'convergence' | 'logo' | 'text' | 'complete'>(
    'particles',
  )
  const [showSkip, setShowSkip] = useState(false)
  const [progress, setProgress] = useState(0)
  const particlesRef = useRef<Particle[]>([])
  const starsRef = useRef<Star[]>([])
  const animationRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number>(0)

  // Inicializar partículas y estrellas
  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    const stars: Star[] = []

    // Crear partículas que convergerán al centro
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2
      const distance = Math.random() * Math.max(width, height)
      particles.push({
        x: width / 2 + Math.cos(angle) * distance,
        y: height / 2 + Math.sin(angle) * distance,
        vx: 0,
        vy: 0,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.8 + 0.2,
        life: 1,
        maxLife: 1,
        color: Math.random() > 0.7 ? '#8B5CF6' : '#FFFFFF',
      })
    }

    // Crear estrellas de fondo
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }

    particlesRef.current = particles
    starsRef.current = stars
  }, [])

  // Animación Canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles(canvas.width, canvas.height)
    }

    resize()
    window.addEventListener('resize', resize)
    startTimeRef.current = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current
      const progressValue = Math.min(elapsed / duration, 1)
      setProgress(progressValue)

      // Actualizar fase basada en progreso
      if (progressValue < 0.2) {
        setPhase('particles')
      } else if (progressValue < 0.4) {
        setPhase('convergence')
      } else if (progressValue < 0.7) {
        setPhase('logo')
      } else if (progressValue < 0.9) {
        setPhase('text')
      } else {
        setPhase('complete')
      }

      // Limpiar canvas
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Dibujar estrellas de fondo
      starsRef.current.forEach((star) => {
        const twinkle = Math.sin(currentTime * star.twinkleSpeed + star.twinklePhase) * 0.3 + 0.7
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * twinkle})`
        ctx.fill()
      })

      // Dibujar y actualizar partículas
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      particlesRef.current.forEach((particle) => {
        // Calcular dirección hacia el centro
        const dx = centerX - particle.x
        const dy = centerY - particle.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Comportamiento según fase
        if (phase === 'convergence' || phase === 'logo') {
          // Converger hacia el centro
          const speed = 0.02 + (progressValue - 0.2) * 0.1
          particle.vx = (dx / distance) * speed * distance
          particle.vy = (dy / distance) * speed * distance
          particle.x += particle.vx * 0.1
          particle.y += particle.vy * 0.1

          // Reducir opacidad cerca del centro
          if (distance < 50) {
            particle.opacity *= 0.98
          }
        } else if (phase === 'particles') {
          // Movimiento orbital suave
          const angle = Math.atan2(dy, dx) + 0.01
          const orbitalSpeed = 0.5
          particle.x =
            centerX + Math.cos(angle) * distance + Math.cos(currentTime * 0.001) * orbitalSpeed
          particle.y =
            centerY + Math.sin(angle) * distance + Math.sin(currentTime * 0.001) * orbitalSpeed
        }

        // Dibujar partícula
        if (particle.opacity > 0.01) {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
          ctx.fillStyle =
            particle.color === '#8B5CF6'
              ? `rgba(139, 92, 246, ${particle.opacity})`
              : `rgba(255, 255, 255, ${particle.opacity})`
          ctx.fill()

          // Glow effect
          if (particle.size > 2) {
            ctx.beginPath()
            ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2)
            const gradient = ctx.createRadialGradient(
              particle.x,
              particle.y,
              0,
              particle.x,
              particle.y,
              particle.size * 2,
            )
            gradient.addColorStop(0, `rgba(139, 92, 246, ${particle.opacity * 0.3})`)
            gradient.addColorStop(1, 'transparent')
            ctx.fillStyle = gradient
            ctx.fill()
          }
        }
      })

      // Dibujar líneas de conexión entre partículas cercanas
      if (phase === 'particles' || phase === 'convergence') {
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
        ctx.lineWidth = 0.5

        for (let i = 0; i < particlesRef.current.length; i++) {
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const p1 = particlesRef.current[i]
            const p2 = particlesRef.current[j]
            if (!p1 || !p2) continue
            const dx = p1.x - p2.x
            const dy = p1.y - p2.y
            const dist = Math.sqrt(dx * dx + dy * dy)

            if (dist < 80) {
              ctx.beginPath()
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.globalAlpha = ((80 - dist) / 80) * 0.2
              ctx.stroke()
              ctx.globalAlpha = 1
            }
          }
        }
      }

      // Efecto de glow central cuando converge
      if (phase === 'convergence' || phase === 'logo') {
        const glowIntensity = (progressValue - 0.2) / 0.5
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150)
        gradient.addColorStop(0, `rgba(139, 92, 246, ${glowIntensity * 0.4})`)
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${glowIntensity * 0.1})`)
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      // Continuar animación hasta completar
      if (progressValue < 1) {
        animationRef.current = requestAnimationFrame(animate)
      } else {
        setTimeout(() => onComplete?.(), 500)
      }
    }

    animationRef.current = requestAnimationFrame(animate)

    // Mostrar botón skip después de 1.5s
    const skipTimer = setTimeout(() => setShowSkip(true), 1500)

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      clearTimeout(skipTimer)
    }
  }, [duration, initParticles, onComplete, phase])

  const handleSkip = useCallback(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    onComplete?.()
  }, [onComplete])

  return (
    <motion.div
      className="fixed inset-0 z-[9999] overflow-hidden bg-black"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Canvas de partículas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Logo central */}
      <AnimatePresence>
        {(phase === 'logo' || phase === 'text' || phase === 'complete') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 1.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
          >
            <ChronosLogo
              size={280}
              animated={true}
              showText={phase === 'text' || phase === 'complete'}
              variant="full"
              theme="dark"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtítulo */}
      <AnimatePresence>
        {(phase === 'text' || phase === 'complete') && (
          <motion.div
            className="absolute right-0 bottom-[15%] left-0 text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            <p className="text-sm font-light tracking-[0.4em] text-white/40 uppercase">
              Sistema de Gestión Financiera Empresarial
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra de progreso */}
      {showProgress && (
        <div className="absolute bottom-8 left-1/2 w-48 -translate-x-1/2">
          <div className="h-0.5 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-violet-600"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Botón Skip */}
      <AnimatePresence>
        {skipEnabled && showSkip && phase !== 'complete' && (
          <motion.button
            onClick={handleSkip}
            className="absolute right-8 bottom-8 flex items-center gap-2 text-xs tracking-widest text-white/40 uppercase transition-colors duration-300 hover:text-white/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileHover={{ x: 5 }}
          >
            <span>Saltar</span>
            <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1 }}>
              →
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Indicador de fase (debug) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-4 left-4 font-mono text-xs text-white/20">
          Phase: {phase} | Progress: {(progress * 100).toFixed(1)}%
        </div>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTE RÁPIDA (para loading entre páginas)
// ═══════════════════════════════════════════════════════════════════════════

export function ChronosLoader({
  message = 'Cargando...',
  size = 120,
}: {
  message?: string
  size?: number
}) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-6 bg-black/95 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <ChronosLogo size={size} animated={true} showText={false} variant="icon" theme="dark" />

      <motion.p
        className="text-sm tracking-widest text-white/50 uppercase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {message}
      </motion.p>

      <motion.div
        className="flex gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-purple-500"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

export default CinematicOpening
