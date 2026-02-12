/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎬 CHRONOS INFINITY OPENING — CINEMATOGRÁFICO SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Opening cinematográfico nivel PIXAR/MARVEL STUDIOS
 * Secuencia de animación profesional:
 * 1. Logo reveal con partículas 3D
 * 2. Texto cinematográfico con efectos
 * 3. Transición fluida a login
 *
 * Tecnologías: GSAP + Framer Motion + Canvas + Three.js
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { Zap } from 'lucide-react'
import { motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
  color: string
  alpha: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARTICLE SYSTEM CANVAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // High DPI con anti-aliasing mejorado
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Habilitar anti-aliasing de alta calidad
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    const colors = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899', '#A855F7', '#22D3EE']

    // Crear más partículas con variedad
    for (let i = 0; i < 150; i++) {
      particlesRef.current.push({
        x: Math.random() * rect.width,
        y: Math.random() * rect.height,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        life: 0,
        maxLife: Math.random() * 300 + 150,
        size: Math.random() * 4 + 1,
        color: colors[Math.floor(Math.random() * colors.length)] ?? '#8B5CF6',
        alpha: Math.random() * 0.8,
      })
    }

    const animate = () => {
      // Fade trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Actualizar y dibujar partículas con efectos premium
      particlesRef.current.forEach((p, index) => {
        p.x += p.vx
        p.y += p.vy
        p.life++

        // Efecto de atracción al centro
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        const dx = centerX - p.x
        const dy = centerY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 100) {
          p.vx += (dx / dist) * 0.01
          p.vy += (dy / dist) * 0.01
        }

        // Fade in/out mejorado con easing
        if (p.life < 30) {
          p.alpha = easeOutCubic(p.life / 30) * 0.8
        } else if (p.life > p.maxLife - 40) {
          p.alpha = easeOutCubic((p.maxLife - p.life) / 40) * 0.8
        }

        // Dibujar partícula con múltiples capas
        ctx.save()

        // Glow exterior grande
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6)
        gradient.addColorStop(0, p.color + Math.floor(p.alpha * 50).toString(16).padStart(2, '0'))
        gradient.addColorStop(0.5, p.color + '10')
        gradient.addColorStop(1, 'transparent')
        ctx.fillStyle = gradient
        ctx.fill()

        // Partícula principal
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        // Glow interno brillante
        ctx.shadowBlur = 25
        ctx.shadowColor = p.color
        ctx.globalAlpha = p.alpha * 0.5
        ctx.fill()

        ctx.restore()

        // Reciclar partícula con posición mejorada
        if (p.life >= p.maxLife) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * Math.min(rect.width, rect.height) * 0.4
          particlesRef.current[index] = {
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 0,
            maxLife: Math.random() * 300 + 150,
            size: Math.random() * 4 + 1,
            color: colors[Math.floor(Math.random() * colors.length)] ?? '#8B5CF6',
            alpha: 0,
          }
        }
      })

      ctx.globalAlpha = 1
      animationRef.current = requestAnimationFrame(animate)
    }

    // Easing function
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    animationRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationRef.current)
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CINEMATIC LOGO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function CinematicLogo() {
  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.3, rotateY: -180, z: -1000 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0, z: 0 }}
      transition={{
        duration: 2,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.3,
      }}
      style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
    >
      {/* Múltiples capas de glow */}
      <motion.div
        className="absolute inset-0 -z-30 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 opacity-40 blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.4, 0.7, 0.4],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute inset-0 -z-20 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 opacity-30 blur-2xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.6, 0.3],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Logo principal con efectos 3D */}
      <div className="flex items-center gap-6">
        <motion.div
          className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 shadow-2xl"
          animate={{
            boxShadow: [
              '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)',
              '0 0 60px rgba(139, 92, 246, 0.9), 0 0 100px rgba(139, 92, 246, 0.5)',
              '0 0 30px rgba(139, 92, 246, 0.6), 0 0 60px rgba(139, 92, 246, 0.3)',
            ],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          whileHover={{ scale: 1.02, rotate: 10 }}
        >
          {/* Efecto de escaneo */}
          <motion.div
            className="absolute inset-0 overflow-hidden rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          >
            <motion.div
              className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{ top: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          <Zap className="h-16 w-16 text-white drop-shadow-2xl" strokeWidth={3} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          <motion.h1
            className="bg-gradient-to-r from-white via-violet-200 to-fuchsia-300 bg-clip-text text-7xl font-bold tracking-tight text-transparent"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            style={{ backgroundSize: '200% auto' }}
          >
            CHRONOS
          </motion.h1>
          <motion.p
            className="mt-2 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-xl tracking-[0.4em] text-transparent"
            initial={{ opacity: 0, letterSpacing: '0em' }}
            animate={{ opacity: 1, letterSpacing: '0.4em' }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            INFINITY 2026
          </motion.p>
        </motion.div>
      </div>

      {/* Anillos orbitales */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-violet-500/20"
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-500/10"
        animate={{ rotate: -360, scale: [1, 1.15, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
      />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CINEMATIC TEXT SEQUENCE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function CinematicText() {
  const texts = [
    'Sistema Empresarial Avanzado',
    'Gestión Financiera Inteligente',
    'Powered by AI',
  ]

  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [texts.length])

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="text-center text-2xl font-light tracking-wide text-white/60"
    >
      {texts[currentIndex]}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function LoadingProgress({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const duration = 4000 // 4 segundos
    const interval = 30
    const increment = (interval / duration) * 100

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment
        if (next >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 800)
          return 100
        }
        return next
      })
    }, interval)

    return () => clearInterval(timer)
  }, [onComplete])

  return (
    <div className="w-full max-w-2xl px-8">
      <div className="relative h-2 overflow-hidden rounded-full bg-white/5 backdrop-blur-xl shadow-inner">
        {/* Barra de progreso principal */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500"
          style={{ width: `${progress}%` }}
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Glow animado */}
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-white via-violet-300 to-fuchsia-300 blur-md"
          style={{ width: `${progress}%` }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          style={{ width: '30%' }}
          animate={{
            left: ['-30%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Partículas en la barra */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white"
            style={{ left: `${(progress * (i + 1)) / 6}%` }}
            animate={{
              scale: [0, 1.5, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>

      {/* Texto de estado mejorado */}
      <div className="mt-6 flex items-center justify-between">
        <motion.p
          className="text-sm font-medium text-white/60"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          Inicializando sistema...
        </motion.p>
        <motion.span
          className="text-lg font-bold text-gradient-premium"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {Math.floor(progress)}%
        </motion.span>
      </div>

      {/* Indicadores de progreso */}
      <motion.div
        className="mt-4 flex gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        {['Database', 'UI', 'Assets', 'AI'].map((item, i) => (
          <motion.div
            key={item}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: progress > (i * 25) ? 1 : 0.3,
              scale: progress > (i * 25) ? 1 : 0.9,
            }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              animate={{
                scale: progress > (i * 25) ? [1, 1.5, 1] : 1,
                opacity: progress > (i * 25) ? [1, 0.5, 1] : 0.3,
              }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-xs text-white/60">{item}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN OPENING COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default function ChronosOpeningCinematic() {
  const router = useRouter()
  const [phase, setPhase] = useState<'opening' | 'loading' | 'complete'>('opening')

  const handleLoadingComplete = () => {
    setPhase('complete')
    setTimeout(() => {
      router.push('/login')
    }, 800)
  }

  useEffect(() => {
    // Cambiar a fase de loading después de 3 segundos
    const timer = setTimeout(() => {
      setPhase('loading')
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black">
      {/* Particle Background */}
      <ParticleCanvas />

      {/* Aurora Effect con más capas */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute left-1/4 top-0 h-[600px] w-[600px] rounded-full bg-violet-500/30 blur-[100px]"
          animate={{
            x: [0, 150, 0],
            y: [0, -80, 0],
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 h-[600px] w-[600px] rounded-full bg-fuchsia-500/25 blur-[100px]"
          animate={{
            x: [0, -120, 0],
            y: [0, 80, 0],
            scale: [1, 1.4, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/30 blur-[120px]"
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute right-1/3 top-1/3 h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-[80px]"
          animate={{
            x: [0, 100, 0],
            y: [0, -60, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.8 }}
      >
        {/* Logo */}
        <CinematicLogo />

        {/* Texto cinematográfico */}
        {phase === 'opening' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <CinematicText />
          </motion.div>
        )}

        {/* Progress bar */}
        {phase === 'loading' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full px-8"
          >
            <LoadingProgress onComplete={handleLoadingComplete} />
          </motion.div>
        )}

        {/* Decorative elements */}
        <motion.div
          className="absolute -bottom-20 left-1/2 flex -translate-x-1/2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 1 }}
        >
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="h-1 w-12 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 2 + i * 0.1, duration: 0.5 }}
            />
          ))}
        </motion.div>
      </motion.div>

      {/* Scan line effect */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent"
        animate={{
          top: ['0%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  )
}

