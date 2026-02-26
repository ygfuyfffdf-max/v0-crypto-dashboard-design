/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 KOCMOC PREMIUM SYSTEM — SILVER SPACE EDITION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema premium KOCMOC con:
 * - Logo orbital animado ultra fluido
 * - Partículas de alta calidad
 * - Colores: Plata espacial, Negro absoluto, Blanco puro
 * - Efectos de iluminación y lightning
 * - Micro-interacciones elegantes y suaves
 *
 * @version 2.0.0 SILVER SPACE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { useKocmocSound } from '@/app/hooks/useKocmocSound'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 PALETA DE COLORES - SILVER SPACE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const SILVER_SPACE_COLORS = {
  // Negros
  absoluteBlack: '#000000',
  deepVoid: '#030305',
  spaceBlack: '#0a0a0c',

  // Platas
  silverMirror: '#C0C0C0',
  silverLight: '#E8E8E8',
  silverDark: '#8A8A8A',
  silverGlow: 'rgba(192, 192, 192, 0.5)',

  // Blancos
  pureWhite: '#FFFFFF',
  softWhite: '#F5F5F7',

  // Acentos sutiles
  lightningBlue: 'rgba(180, 200, 255, 0.3)',
  glowSilver: 'rgba(192, 192, 192, 0.15)',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 PARTÍCULAS PREMIUM - SILVER DUST
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SilverParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  fadeSpeed: number
  type: 'dust' | 'spark' | 'glow'
}

interface SilverDustBackgroundProps {
  className?: string
  particleCount?: number
  interactive?: boolean
  intensity?: 'low' | 'medium' | 'high'
}

export const SilverDustBackground = memo(function SilverDustBackground({
  className,
  particleCount = 150,
  interactive = true,
  intensity = 'medium',
}: SilverDustBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<SilverParticle[]>([])
  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const animationRef = useRef<number>(0)

  const intensityConfig = {
    low: { speed: 0.15, glow: 0.3, sparkChance: 0.001 },
    medium: { speed: 0.25, glow: 0.5, sparkChance: 0.002 },
    high: { speed: 0.4, glow: 0.8, sparkChance: 0.004 },
  }

  const config = intensityConfig[intensity]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * config.speed,
      vy: (Math.random() - 0.5) * config.speed,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.2,
      fadeSpeed: Math.random() * 0.005 + 0.002,
      type: Math.random() > 0.9 ? 'spark' : Math.random() > 0.7 ? 'glow' : 'dust',
    }))

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

      particlesRef.current.forEach((p, i) => {
        // Update position
        p.x += p.vx
        p.y += p.vy

        // Mouse interaction
        if (interactive && mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x
          const dy = mouseRef.current.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            const force = (150 - dist) / 150 * 0.02
            p.vx -= dx * force * 0.1
            p.vy -= dy * force * 0.1
          }
        }

        // Damping
        p.vx *= 0.999
        p.vy *= 0.999

        // Wrap around
        if (p.x < -10) p.x = window.innerWidth + 10
        if (p.x > window.innerWidth + 10) p.x = -10
        if (p.y < -10) p.y = window.innerHeight + 10
        if (p.y > window.innerHeight + 10) p.y = -10

        // Sparkle effect
        if (Math.random() < config.sparkChance && p.type === 'spark') {
          p.opacity = Math.min(1, p.opacity + 0.3)
        }

        // Fade pulsation
        p.opacity += Math.sin(Date.now() * p.fadeSpeed) * 0.01

        // Draw particle
        ctx.save()

        if (p.type === 'glow') {
          // Glow particle
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3)
          gradient.addColorStop(0, `rgba(192, 192, 192, ${p.opacity * config.glow})`)
          gradient.addColorStop(0.5, `rgba(192, 192, 192, ${p.opacity * config.glow * 0.3})`)
          gradient.addColorStop(1, 'transparent')
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2)
          ctx.fill()
        } else if (p.type === 'spark') {
          // Spark particle with glow
          ctx.shadowBlur = 10
          ctx.shadowColor = SILVER_SPACE_COLORS.silverGlow
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, p.opacity * 1.5)})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2)
          ctx.fill()
        } else {
          // Dust particle
          ctx.fillStyle = `rgba(200, 200, 200, ${p.opacity * 0.5})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.restore()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationRef.current)
    }
  }, [particleCount, config, interactive])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!interactive) return
    mouseRef.current = { x: e.clientX, y: e.clientY, active: true }
  }, [interactive])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={cn('fixed inset-0 pointer-events-auto', className)}
      style={{ background: SILVER_SPACE_COLORS.absoluteBlack }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 KOCMOC LOGO PREMIUM - SILVER ORBITAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface KocmocLogoPremiumProps {
  size?: number
  animated?: boolean
  showText?: boolean
  className?: string
  animationPhase?: 'hidden' | 'forming' | 'complete'
  onAnimationComplete?: () => void
}

export const KocmocLogoPremium = memo(function KocmocLogoPremium({
  size = 300,
  animated = true,
  showText = true,
  className,
  animationPhase = 'complete',
  onAnimationComplete,
}: KocmocLogoPremiumProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)
  const formingProgressRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = size * dpr
    canvas.height = (size + (showText ? 60 : 0)) * dpr
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const scale = size / 300

    // Configuración de órbitas
    const orbits = [
      { rx: 95 * scale, ry: 38 * scale, rotation: -25, dotted: false, opacity: 0.5 },
      { rx: 82 * scale, ry: 32 * scale, rotation: 30, dotted: true, opacity: 0.35 },
      { rx: 70 * scale, ry: 28 * scale, rotation: -45, dotted: true, opacity: 0.3 },
      { rx: 58 * scale, ry: 24 * scale, rotation: 15, dotted: false, opacity: 0.25 },
    ]

    // Nodos en la línea horizontal
    const lineLength = 95 * scale
    const nodes = [
      { offset: -1.0, size: 3, filled: true },
      { offset: -0.62, size: 7, filled: false, innerSize: 3, hasRing: false },
      { offset: -0.32, size: 3, filled: true },
      { offset: 0, size: 20, filled: false, innerSize: 9, hasRing: true, isCore: true },
      { offset: 0.32, size: 3, filled: true },
      { offset: 0.62, size: 8, filled: false, innerSize: 4, hasRing: true },
      { offset: 1.0, size: 3, filled: true },
    ]

    const animate = () => {
      if (animated) {
        timeRef.current += 0.006
      }

      // Update forming progress
      if (animationPhase === 'forming') {
        formingProgressRef.current = Math.min(1, formingProgressRef.current + 0.012)
        if (formingProgressRef.current >= 1) {
          onAnimationComplete?.()
        }
      } else if (animationPhase === 'complete') {
        formingProgressRef.current = 1
      } else {
        formingProgressRef.current = 0
      }

      const progress = formingProgressRef.current
      ctx.clearRect(0, 0, size, size + (showText ? 60 : 0))

      if (progress === 0) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }

      // ═══ DIBUJAR ÓRBITAS ═══
      orbits.forEach((orbit, i) => {
        const orbitProgress = Math.max(0, Math.min(1, (progress - i * 0.1) / 0.3))
        if (orbitProgress <= 0) return

        ctx.save()
        ctx.translate(cx, cy)

        const rotationOffset = animated ? Math.sin(timeRef.current * 0.5 + i * 0.8) * 3 : 0
        ctx.rotate(((orbit.rotation + rotationOffset) * Math.PI) / 180)

        // Silver gradient for orbits
        ctx.strokeStyle = `rgba(192, 192, 192, ${orbit.opacity * orbitProgress})`
        ctx.lineWidth = orbit.dotted ? 0.8 : 1.2

        if (orbit.dotted) {
          ctx.setLineDash([3, 6])
        } else {
          ctx.setLineDash([])
        }

        ctx.beginPath()
        ctx.ellipse(0, 0, orbit.rx * orbitProgress, orbit.ry * orbitProgress, 0, 0, Math.PI * 2)
        ctx.stroke()

        ctx.restore()
      })

      // ═══ LÍNEA HORIZONTAL ═══
      const lineProgress = Math.max(0, Math.min(1, (progress - 0.2) / 0.4))
      if (lineProgress > 0) {
        const lineGradient = ctx.createLinearGradient(
          cx - lineLength * lineProgress, cy,
          cx + lineLength * lineProgress, cy
        )
        lineGradient.addColorStop(0, 'rgba(192, 192, 192, 0)')
        lineGradient.addColorStop(0.1, 'rgba(192, 192, 192, 0.7)')
        lineGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)')
        lineGradient.addColorStop(0.9, 'rgba(192, 192, 192, 0.7)')
        lineGradient.addColorStop(1, 'rgba(192, 192, 192, 0)')

        ctx.setLineDash([])
        ctx.strokeStyle = lineGradient
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(cx - lineLength * lineProgress, cy)
        ctx.lineTo(cx + lineLength * lineProgress, cy)
        ctx.stroke()
      }

      // ═══ NODOS ═══
      nodes.forEach((node, i) => {
        const nodeProgress = Math.max(0, Math.min(1, (progress - 0.3 - i * 0.05) / 0.3))
        if (nodeProgress <= 0) return

        const nx = cx + node.offset * lineLength
        const ny = cy
        const nodeSize = node.size * scale * nodeProgress

        if (node.isCore) {
          // Glow del núcleo
          const glowRadius = nodeSize * 2
          const coreGlow = ctx.createRadialGradient(nx, ny, 0, nx, ny, glowRadius)
          coreGlow.addColorStop(0, `rgba(255, 255, 255, ${0.15 * nodeProgress})`)
          coreGlow.addColorStop(0.5, `rgba(192, 192, 192, ${0.08 * nodeProgress})`)
          coreGlow.addColorStop(1, 'transparent')
          ctx.fillStyle = coreGlow
          ctx.beginPath()
          ctx.arc(nx, ny, glowRadius, 0, Math.PI * 2)
          ctx.fill()

          // Anillo exterior
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * nodeProgress})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2)
          ctx.stroke()

          // Punto central brillante con pulso
          const pulse = animated ? 0.85 + Math.sin(timeRef.current * 2.5) * 0.15 : 1
          ctx.fillStyle = `rgba(255, 255, 255, ${pulse * nodeProgress})`
          ctx.beginPath()
          ctx.arc(nx, ny, node.innerSize! * scale * nodeProgress, 0, Math.PI * 2)
          ctx.fill()

        } else if (node.filled) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * nodeProgress})`
          ctx.beginPath()
          ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2)
          ctx.fill()

        } else {
          // Anillo
          ctx.strokeStyle = `rgba(192, 192, 192, ${0.8 * nodeProgress})`
          ctx.lineWidth = 1.2
          ctx.beginPath()
          ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2)
          ctx.stroke()

          // Punto interior
          if (node.innerSize) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * nodeProgress})`
            ctx.beginPath()
            ctx.arc(nx, ny, node.innerSize * scale * nodeProgress, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      })

      // ═══ TEXTO KOCMOC ═══
      if (showText && progress > 0.7) {
        const textProgress = Math.min(1, (progress - 0.7) / 0.3)
        
        // Font settings
        ctx.font = `300 ${16 * scale}px "Inter", "SF Pro Display", -apple-system, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        
        // Letter spacing
        const letterSpacing = 8 * scale
        const text = 'KOCMOC'
        const totalWidth = ctx.measureText(text).width + (text.length - 1) * letterSpacing
        let startX = cx - totalWidth / 2

        // Draw each letter with fade-in
        for (let i = 0; i < text.length; i++) {
          const letter = text[i] ?? ''
          const letterProgress = Math.max(0, Math.min(1, (textProgress - i * 0.1) / 0.5))
          
          if (letterProgress > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * letterProgress})`
            ctx.fillText(letter, startX, size - 40 * scale)
            
            // Subtle glow per letter
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
            ctx.shadowBlur = 10 * letterProgress
            ctx.fillText(letter, startX, size - 40 * scale)
            ctx.shadowBlur = 0
          }
          
          startX += ctx.measureText(letter).width + letterSpacing
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [size, animated, showText, animationPhase, onAnimationComplete])

  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <canvas
        ref={canvasRef}
        style={{ width: size, height: size + (showText ? 60 : 0) }}
      />
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ LIGHTNING EFFECT - Efecto de relámpago sutil
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LightningEffectProps {
  active?: boolean
  intensity?: number
  className?: string
}

export const LightningEffect = memo(function LightningEffect({
  active = true,
  intensity = 0.3,
  className,
}: LightningEffectProps) {
  const [flash, setFlash] = useState(false)

  useEffect(() => {
    if (!active) return

    const triggerFlash = () => {
      if (Math.random() > 0.97) {
        setFlash(true)
        setTimeout(() => setFlash(false), 100 + Math.random() * 150)
      }
    }

    const interval = setInterval(triggerFlash, 2000)
    return () => clearInterval(interval)
  }, [active])

  return (
    <AnimatePresence>
      {flash && (
        <motion.div
          className={cn('fixed inset-0 pointer-events-none z-50', className)}
          initial={{ opacity: 0 }}
          animate={{ opacity: intensity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.05 }}
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, rgba(200, 220, 255, 0.15) 0%, transparent 70%)',
          }}
        />
      )}
    </AnimatePresence>
  )
})

import { SilverSpaceThreeBackground } from './SilverSpaceThreeBackground'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 CINEMATIC OPENING - SILVER SPACE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SilverSpaceCinematicProps {
  onComplete?: () => void
  duration?: number
  showChronos?: boolean
  useWebGL?: boolean
}

export const SilverSpaceCinematic = memo(function SilverSpaceCinematic({
  onComplete,
  duration = 6000,
  showChronos = true,
  useWebGL = true,
}: SilverSpaceCinematicProps) {
  const [phase, setPhase] = useState<'void' | 'particles' | 'logo' | 'text' | 'complete'>('void')
  const [visible, setVisible] = useState(true)
  const { playDrone, playLogoForming, playTextReveal, playComplete } = useKocmocSound()

  useEffect(() => {
    // Start drone ambience
    const stopDrone = playDrone()

    const timers = [
      setTimeout(() => {
        setPhase('particles')
      }, 300),
      setTimeout(() => {
        setPhase('logo')
        playLogoForming()
      }, 800),
      setTimeout(() => {
        setPhase('text')
        playTextReveal()
      }, 3500),
      setTimeout(() => {
        setPhase('complete')
        playComplete()
      }, 5000),
      setTimeout(() => {
        setVisible(false)
        stopDrone?.()
        onComplete?.()
      }, duration),
    ]

    return () => {
      timers.forEach(t => clearTimeout(t))
      stopDrone?.()
    }
  }, [duration, onComplete, playDrone, playLogoForming, playTextReveal, playComplete])

  if (!visible) return null

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: SILVER_SPACE_COLORS.absoluteBlack }}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Fondo: WebGL o Canvas */}
      {phase !== 'void' && (
        useWebGL ? (
          <SilverSpaceThreeBackground 
            className="z-0" 
            intensity="high" 
          />
        ) : (
          <SilverDustBackground
            particleCount={300}
            interactive={false}
            intensity="high"
            className="z-0"
          />
        )
      )}

      {/* Logo KOCMOC */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
        animate={{
          opacity: phase !== 'void' ? 1 : 0,
          scale: phase !== 'void' ? 1 : 0.8,
          filter: phase !== 'void' ? 'blur(0px)' : 'blur(10px)',
        }}
        transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <KocmocLogoPremium
          size={400}
          animated={true}
          showText={true}
          animationPhase={phase === 'logo' ? 'forming' : phase === 'text' || phase === 'complete' ? 'complete' : 'hidden'}
        />
      </motion.div>

      {/* Texto CHRONOS */}
      {showChronos && (
        <motion.div
          className="relative z-10 mt-12 overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={{
            opacity: phase === 'text' || phase === 'complete' ? 1 : 0,
            y: phase === 'text' || phase === 'complete' ? 0 : 40,
          }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="text-5xl md:text-7xl font-light tracking-[0.5em] relative"
            style={{
              color: SILVER_SPACE_COLORS.silverLight,
              textShadow: `0 0 80px ${SILVER_SPACE_COLORS.silverGlow}, 0 0 30px rgba(255,255,255,0.3)`,
              fontFamily: '"SF Pro Display", "Inter", sans-serif',
            }}
          >
            <span className="relative z-10">ΧΡΟΝΟΣ</span>
            
            {/* Shimmer effect over text */}
            <motion.div 
              className="absolute inset-0 z-20 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: 1 }}
            />
          </div>
          
          <motion.div 
            className="text-xs md:text-sm tracking-[0.8em] text-center mt-4 text-white/40 uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'complete' ? 1 : 0 }}
            transition={{ delay: 0.5, duration: 1.5 }}
          >
            Supreme Intelligence System
          </motion.div>
        </motion.div>
      )}

      {/* Efecto de lightning */}
      <LightningEffect active={phase !== 'void'} intensity={0.12} />

      {/* Progress bar minimalista */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 h-[1px] w-64 overflow-hidden"
        style={{ background: 'rgba(255, 255, 255, 0.05)' }}
      >
        <motion.div
          className="h-full w-full"
          style={{ 
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
            boxShadow: '0 0 20px rgba(255,255,255,0.5)'
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            duration: duration / 1000,
            ease: 'linear',
            repeat: 0
          }}
        />
      </motion.div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { SILVER_SPACE_COLORS }
