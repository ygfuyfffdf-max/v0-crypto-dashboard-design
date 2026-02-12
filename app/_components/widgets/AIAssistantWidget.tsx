'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🤖✨ AI ASSISTANT WIDGET — CHRONOS INFINITY 2026 PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Widget de Asistente IA Premium con:
 * - Orb 3D interactivo con Spline (o fallback Canvas)
 * - Visualizador de ondas de voz en tiempo real
 * - Animaciones de partículas reactivas
 * - Estados: idle, listening, thinking, speaking
 * - Glassmorphism con aurora boreal
 * - Interacciones hover y click
 * - Audio feedback
 *
 * Basado en el diseño de referencia del Product Sales Dashboard
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import dynamic from 'next/dynamic'
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Dynamic import de Spline para evitar SSR issues
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <OrbFallbackCanvas />,
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type AIState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface AIAssistantWidgetProps {
  className?: string
  title?: string
  subtitle?: string
  onActivate?: () => void
  onMessage?: (_message: string) => void
  isActive?: boolean
  state?: AIState
  splineUrl?: string
  showVoiceWaves?: boolean
  suggestions?: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 VOICE WAVE VISUALIZER — Audio waveform animation
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VoiceWaveProps {
  isActive: boolean
  color?: string
  bars?: number
}

function VoiceWaveVisualizer({ isActive, color = '#8B5CF6', bars = 20 }: VoiceWaveProps) {
  return (
    <div className="flex h-8 items-center justify-center gap-[2px]">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{ backgroundColor: color }}
          animate={
            isActive
              ? {
                  height: [
                    4 + Math.random() * 8,
                    12 + Math.random() * 20,
                    6 + Math.random() * 10,
                    16 + Math.random() * 16,
                    4 + Math.random() * 8,
                  ],
                  opacity: [0.5, 1, 0.7, 1, 0.5],
                }
              : { height: 4, opacity: 0.3 }
          }
          transition={
            isActive
              ? {
                  duration: 0.5 + Math.random() * 0.3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.02,
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔮 ORB FALLBACK CANVAS — Canvas-based orb when Spline unavailable
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function OrbFallbackCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      alpha: number
    }> = []

    // Create particles
    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 50 + Math.random() * 80
      particles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
        color:
          ['#8B5CF6', '#06B6D4', '#EC4899', '#10B981'][Math.floor(Math.random() * 4)] ?? '#8B5CF6',
        alpha: Math.random() * 0.8 + 0.2,
      })
    }

    const animate = () => {
      timeRef.current += 0.016
      const rect = canvas.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Clear with fade effect
      ctx.fillStyle = 'rgba(3, 3, 8, 0.15)'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Draw glowing orb center
      const gradient = ctx.createRadialGradient(
        centerX + (mouseRef.current.x - 0.5) * 30,
        centerY + (mouseRef.current.y - 0.5) * 30,
        0,
        centerX,
        centerY,
        120,
      )
      gradient.addColorStop(0, 'rgba(139, 92, 246, 0.8)')
      gradient.addColorStop(0.3, 'rgba(6, 182, 212, 0.4)')
      gradient.addColorStop(0.6, 'rgba(236, 72, 153, 0.2)')
      gradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(centerX, centerY, 80 + Math.sin(timeRef.current * 2) * 10, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Draw and update particles
      particles.forEach((p, i) => {
        // Rotate around center
        const angle = Math.atan2(p.y, p.x)
        const dist = Math.sqrt(p.x * p.x + p.y * p.y)
        const newAngle = angle + 0.01 + Math.sin(timeRef.current + i * 0.1) * 0.005

        p.x = Math.cos(newAngle) * dist + p.vx
        p.y = Math.sin(newAngle) * dist + p.vy

        // Keep in bounds
        const maxDist = 130
        if (Math.sqrt(p.x * p.x + p.y * p.y) > maxDist) {
          const currentAngle = Math.atan2(p.y, p.x)
          p.x = Math.cos(currentAngle) * maxDist
          p.y = Math.sin(currentAngle) * maxDist
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(
          centerX + p.x,
          centerY + p.y,
          p.size * (1 + Math.sin(timeRef.current * 3 + i) * 0.3),
          0,
          Math.PI * 2,
        )
        ctx.fillStyle = p.color
          .replace(')', `, ${p.alpha * (0.5 + Math.sin(timeRef.current + i) * 0.3)})`)
          .replace('rgb', 'rgba')
          .replace('#', '')

        // Convert hex to rgba
        const hex = p.color.replace('#', '')
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * (0.5 + Math.sin(timeRef.current + i) * 0.3)})`
        ctx.fill()

        // Glow effect
        ctx.beginPath()
        ctx.arc(centerX + p.x, centerY + p.y, p.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.alpha * 0.1})`
        ctx.fill()
      })

      // Draw connections between nearby particles
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)'
      ctx.lineWidth = 0.5
      particles.forEach((p1, i) => {
        particles.slice(i + 1, i + 5).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 40) {
            ctx.beginPath()
            ctx.moveTo(centerX + p1.x, centerY + p1.y)
            ctx.lineTo(centerX + p2.x, centerY + p2.y)
            ctx.stroke()
          }
        })
      })

      // Outer ring glow
      ctx.beginPath()
      ctx.arc(centerX, centerY, 90 + Math.sin(timeRef.current) * 5, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(139, 92, 246, ${0.3 + Math.sin(timeRef.current * 2) * 0.1})`
      ctx.lineWidth = 2
      ctx.stroke()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top) / rect.height,
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className="h-full w-full" style={{ background: 'transparent' }} />
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💫 PARTICLE RING — Decorative particle effect around orb
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ParticleRing({ isActive, size = 300 }: { isActive: boolean; size?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        angle: (i / 60) * Math.PI * 2,
        delay: i * 0.05,
        duration: 2 + Math.random() * 2,
        size: 2 + Math.random() * 3,
      })),
    [],
  )

  return (
    <div
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: `rgba(139, 92, 246, ${0.3 + Math.random() * 0.5})`,
            boxShadow: '0 0 6px rgba(139, 92, 246, 0.5)',
          }}
          animate={
            isActive
              ? {
                  x: [
                    Math.cos(p.angle) * (size / 2 - 20),
                    Math.cos(p.angle + 0.3) * (size / 2 - 10),
                    Math.cos(p.angle) * (size / 2 - 20),
                  ],
                  y: [
                    Math.sin(p.angle) * (size / 2 - 20),
                    Math.sin(p.angle + 0.3) * (size / 2 - 10),
                    Math.sin(p.angle) * (size / 2 - 20),
                  ],
                  opacity: [0.3, 0.8, 0.3],
                  scale: [1, 1.5, 1],
                }
              : {
                  x: Math.cos(p.angle) * (size / 2 - 30),
                  y: Math.sin(p.angle) * (size / 2 - 30),
                  opacity: 0.2,
                  scale: 0.8,
                }
          }
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT — AI Assistant Widget
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AIAssistantWidget({
  className,
  title = 'AI Assistant',
  subtitle = 'Analiza, predice y optimiza tu negocio con inteligencia artificial avanzada.',
  onActivate,
  onMessage,
  isActive: externalIsActive,
  state: externalState,
  splineUrl = '/scene.splinecode',
  showVoiceWaves = true,
  suggestions = [
    'Analizar ventas del mes',
    'Comparar rendimiento',
    'Predecir tendencias',
    'Optimizar inventario',
  ],
}: AIAssistantWidgetProps) {
  const [internalState, setInternalState] = useState<AIState>('idle')
  const [isHovered, setIsHovered] = useState(false)
  const [useSpline, setUseSpline] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const state = externalState ?? internalState
  const isActive = externalIsActive ?? state !== 'idle'

  // Mouse tracking for parallax
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const springConfig = { stiffness: 100, damping: 20 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  const orbX = useTransform(smoothX, [0, 1], [-15, 15])
  const orbY = useTransform(smoothY, [0, 1], [-15, 15])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    },
    [mouseX, mouseY],
  )

  const handleActivate = useCallback(() => {
    if (state === 'idle') {
      setInternalState('listening')
      // Simulate state transitions
      setTimeout(() => setInternalState('thinking'), 2000)
      setTimeout(() => setInternalState('speaking'), 4000)
      setTimeout(() => setInternalState('idle'), 7000)
    }
    onActivate?.()
  }, [state, onActivate])

  // State colors
  const stateColors = {
    idle: { primary: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.3)' },
    listening: { primary: '#06B6D4', glow: 'rgba(6, 182, 212, 0.4)' },
    thinking: { primary: '#FBBF24', glow: 'rgba(251, 191, 36, 0.4)' },
    speaking: { primary: '#10B981', glow: 'rgba(16, 185, 129, 0.4)' },
  }

  const currentColor = stateColors[state]

  // State labels
  const stateLabels = {
    idle: 'Listo para ayudar',
    listening: 'Escuchando...',
    thinking: 'Procesando...',
    speaking: 'Respondiendo...',
  }

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-3xl',
        'bg-gradient-to-br from-[#0a0a15]/90 via-[#0f0f20]/80 to-[#0a0a15]/90',
        'border border-white/[0.08] backdrop-blur-2xl',
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      {/* Aurora background effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full"
          style={{
            background: `radial-gradient(circle, ${currentColor.glow} 0%, transparent 70%)`,
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 20, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-1/2 -bottom-1/2 h-full w-full rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -20, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 p-8">
        {/* Header */}
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold text-white">{title}</h2>
          <motion.div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs"
            style={{
              background: currentColor.glow,
              color: currentColor.primary,
            }}
          >
            <motion.span
              className="h-2 w-2 rounded-full"
              style={{ background: currentColor.primary }}
              animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            {stateLabels[state]}
          </motion.div>
        </div>

        {/* Orb Container */}
        <div className="relative mx-auto" style={{ width: 280, height: 280 }}>
          {/* Glow rings */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle, ${currentColor.glow} 0%, transparent 70%)`,
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Outer ring */}
          <motion.div
            className="absolute inset-4 rounded-full border-2"
            style={{ borderColor: `${currentColor.primary}40` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />

          {/* Particle ring */}
          <ParticleRing isActive={isHovered || isActive} size={280} />

          {/* Orb */}
          <motion.div
            className="absolute inset-8 cursor-pointer overflow-hidden rounded-full"
            style={{
              x: orbX,
              y: orbY,
              background: `radial-gradient(circle at 30% 30%, ${currentColor.primary}40, transparent 70%)`,
              boxShadow: `
                0 0 60px ${currentColor.glow},
                inset 0 0 60px ${currentColor.glow}
              `,
              border: `2px solid ${currentColor.primary}30`,
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleActivate}
          >
            {/* Spline 3D or Canvas fallback */}
            {useSpline ? (
              <Suspense fallback={<OrbFallbackCanvas />}>
                <Spline
                  scene={splineUrl}
                  onError={() => setUseSpline(false)}
                  className="h-full w-full"
                />
              </Suspense>
            ) : (
              <OrbFallbackCanvas />
            )}

            {/* Shine overlay */}
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
              }}
              animate={{
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>
        </div>

        {/* CTA Button */}
        <motion.button
          onClick={handleActivate}
          className="relative mx-auto mt-6 block overflow-hidden rounded-2xl px-8 py-3"
          style={{
            background: `linear-gradient(135deg, ${currentColor.primary}, ${currentColor.primary}80)`,
            boxShadow: `0 10px 40px ${currentColor.glow}`,
          }}
          whileHover={{ scale: 1.02, boxShadow: `0 15px 50px ${currentColor.glow}` }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <span className="relative z-10 font-semibold text-white">
            {state === 'idle' ? 'Activar Asistente' : 'Procesando...'}
          </span>
        </motion.button>

        {/* Voice waves */}
        {showVoiceWaves && (
          <div className="mt-6">
            <VoiceWaveVisualizer
              isActive={state === 'listening' || state === 'speaking'}
              color={currentColor.primary}
            />
          </div>
        )}

        {/* Description */}
        <p className="mt-6 text-center text-sm leading-relaxed text-white/60">{subtitle}</p>

        {/* Quick suggestions */}
        <AnimatePresence>
          {state === 'idle' && suggestions.length > 0 && (
            <motion.div
              className="mt-6 flex flex-wrap justify-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {suggestions.map((suggestion, i) => (
                <motion.button
                  key={i}
                  onClick={() => onMessage?.(suggestion)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Border glow on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          boxShadow: `inset 0 0 30px ${currentColor.glow}`,
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export default AIAssistantWidget

