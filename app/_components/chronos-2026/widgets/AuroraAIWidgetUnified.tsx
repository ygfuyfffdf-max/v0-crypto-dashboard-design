/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🤖 AURORA AI WIDGET UNIFIED — CHRONOS 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Widget IA consolidado con conexión a datos reales de Turso/Drizzle.
 * Reemplaza todos los widgets IA duplicados del sistema.
 *
 * CARACTERÍSTICAS:
 * - Orb 3D Canvas con partículas dinámicas
 * - Conexión a datos reales (ventas, clientes, bancos, órdenes)
 * - Estados visuales: idle, listening, thinking, speaking
 * - Voice waves animados
 * - Sugerencias contextuales basadas en datos reales
 * - Micro-interacciones premium
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useBancos } from '@/app/_hooks/useBancos'
import { useClientes } from '@/app/_hooks/useClientes'
import { useOrdenes } from '@/app/_hooks/useOrdenes'
import { useVentas } from '@/app/_hooks/useVentas'
import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import {
    Activity,
    ArrowRight,
    Bot,
    ChevronRight,
    Loader2,
    MessageCircle,
    Mic,
    MicOff,
    Sparkles,
    TrendingUp,
    Volume2,
    VolumeX,
    Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type AIState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface AuroraAIWidgetUnifiedProps {
  className?: string
  size?: 'compact' | 'normal' | 'large'
  showMetrics?: boolean
  showSuggestions?: boolean
  onNavigateToPanel?: () => void
  onMessage?: (message: string) => void
}

interface BusinessInsight {
  type: 'alert' | 'tip' | 'trend'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  action?: string
}

const STATE_CONFIG = {
  idle: {
    primary: '#8B5CF6',
    secondary: '#A78BFA',
    glow: 'rgba(139, 92, 246, 0.3)',
    label: 'Listo para ayudar',
  },
  listening: {
    primary: '#06B6D4',
    secondary: '#22D3EE',
    glow: 'rgba(6, 182, 212, 0.4)',
    label: 'Escuchando...',
  },
  thinking: {
    primary: '#FBBF24',
    secondary: '#FCD34D',
    glow: 'rgba(251, 191, 36, 0.4)',
    label: 'Analizando datos...',
  },
  speaking: {
    primary: '#10B981',
    secondary: '#34D399',
    glow: 'rgba(16, 185, 129, 0.4)',
    label: 'Respondiendo...',
  },
}

const SIZE_CONFIG = {
  compact: { orb: 120, container: 'h-48', padding: 'p-4' },
  normal: { orb: 160, container: 'h-72', padding: 'p-6' },
  large: { orb: 200, container: 'h-96', padding: 'p-8' },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CANVAS ORB — Orb 3D con Canvas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function CanvasOrb({
  state,
  size,
  audioLevel = 0,
}: {
  state: AIState
  size: number
  audioLevel?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })

  const config = STATE_CONFIG[state]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    // Habilitar anti-aliasing de alta calidad
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Partículas mejoradas
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      hue: number
    }> = []

    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = 20 + Math.random() * (size / 3)
      particles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.9 + 0.3,
        hue: Math.random() * 60 - 30, // Variación de tono
      })
    }

    const animate = () => {
      timeRef.current += 0.016
      const centerX = size / 2
      const centerY = size / 2
      const audioPulse = 1 + audioLevel * 0.4

      // Trail effect mejorado
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
      ctx.fillRect(0, 0, size, size)

      // Orb central con múltiples capas de gradiente
      const coreRadius = (size / 4) * audioPulse + Math.sin(timeRef.current * 2) * 6

      // Glow exterior
      const outerGlow = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, coreRadius * 2,
      )
      outerGlow.addColorStop(0, config.primary + '60')
      outerGlow.addColorStop(0.3, config.primary + '30')
      outerGlow.addColorStop(0.6, config.glow)
      outerGlow.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(centerX, centerY, coreRadius * 1.8, 0, Math.PI * 2)
      ctx.fillStyle = outerGlow
      ctx.fill()

      // Gradiente principal
      const gradient = ctx.createRadialGradient(
        centerX + (mouseRef.current.x - 0.5) * 25,
        centerY + (mouseRef.current.y - 0.5) * 25,
        0,
        centerX,
        centerY,
        coreRadius * 1.5,
      )
      gradient.addColorStop(0, config.primary + 'FF')
      gradient.addColorStop(0.4, config.secondary + '90')
      gradient.addColorStop(0.7, config.glow)
      gradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Anillos pulsantes múltiples
      for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath()
        const ringRadius = (size / 3 + ring * 15) * audioPulse + Math.sin(timeRef.current + ring) * 4
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
        ctx.strokeStyle = config.primary + (40 - ring * 10).toString(16).padStart(2, '0')
        ctx.lineWidth = 2 - ring * 0.5
        ctx.stroke()
      }

      // Dibujar partículas con efectos premium
      particles.forEach((p, i) => {
        const angle = Math.atan2(p.y, p.x)
        const dist = Math.sqrt(p.x * p.x + p.y * p.y)

        // Rotar alrededor del centro con velocidad dinámica
        const rotationSpeed = state === 'thinking' ? 0.025 : state === 'speaking' ? 0.018 : 0.01
        const newAngle = angle + rotationSpeed + Math.sin(timeRef.current + i * 0.1) * 0.004

        p.x = Math.cos(newAngle) * dist + p.vx
        p.y = Math.sin(newAngle) * dist + p.vy

        // Mantener dentro de límites
        const maxDist = size / 2.5
        if (dist > maxDist) {
          p.x = Math.cos(newAngle) * maxDist
          p.y = Math.sin(newAngle) * maxDist
        }

        const particleSize = p.size * audioPulse * (1 + Math.sin(timeRef.current * 3 + i) * 0.3)
        const particleAlpha = p.alpha * (0.6 + Math.sin(timeRef.current + i) * 0.3)

        // Glow exterior grande
        ctx.save()
        ctx.beginPath()
        ctx.arc(centerX + p.x, centerY + p.y, particleSize * 5, 0, Math.PI * 2)
        const glowGradient = ctx.createRadialGradient(
          centerX + p.x, centerY + p.y, 0,
          centerX + p.x, centerY + p.y, particleSize * 5,
        )
        glowGradient.addColorStop(0, config.primary + Math.floor(particleAlpha * 80).toString(16).padStart(2, '0'))
        glowGradient.addColorStop(0.5, config.primary + '15')
        glowGradient.addColorStop(1, 'transparent')
        ctx.fillStyle = glowGradient
        ctx.fill()

        // Partícula principal
        ctx.beginPath()
        ctx.arc(centerX + p.x, centerY + p.y, particleSize, 0, Math.PI * 2)
        ctx.fillStyle = config.primary
        ctx.globalAlpha = particleAlpha
        ctx.fill()

        // Glow interno brillante
        ctx.shadowBlur = 20
        ctx.shadowColor = config.primary
        ctx.globalAlpha = particleAlpha * 0.6
        ctx.fill()

        ctx.restore()
      })

      // Conexiones entre partículas cercanas mejoradas
      ctx.strokeStyle = config.primary + '20'
      ctx.lineWidth = 1
      particles.forEach((p1, i) => {
        particles.slice(i + 1, i + 5).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 40) {
            ctx.globalAlpha = (1 - dist / 40) * 0.5
            ctx.beginPath()
            ctx.moveTo(centerX + p1.x, centerY + p1.y)
            ctx.lineTo(centerX + p2.x, centerY + p2.y)
            ctx.stroke()
          }
        })
      })
      ctx.globalAlpha = 1

      // Brillo especular mejorado
      const specularGradient = ctx.createRadialGradient(
        centerX - coreRadius * 0.4,
        centerY - coreRadius * 0.4,
        0,
        centerX,
        centerY,
        coreRadius * 0.7,
      )
      specularGradient.addColorStop(0, 'rgba(255, 255, 255, 0.6)')
      specularGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)')
      specularGradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(centerX, centerY, coreRadius * 0.7, 0, Math.PI * 2)
      ctx.fillStyle = specularGradient
      ctx.fill()

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
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [state, size, config, audioLevel])

  return <canvas ref={canvasRef} style={{ width: size, height: size }} className="cursor-pointer" />
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VOICE WAVES — Visualizador de ondas de voz
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function VoiceWaves({ isActive, color }: { isActive: boolean; color: string }) {
  const bars = 12

  return (
    <div className="flex h-8 items-center justify-center gap-1">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{
            width: 3,
            backgroundColor: color,
            boxShadow: `0 0 8px ${color}80`,
          }}
          animate={
            isActive
              ? {
                  height: [8, 20 + Math.random() * 12, 8],
                  opacity: [0.5, 1, 0.5],
                }
              : { height: 4, opacity: 0.3 }
          }
          transition={{
            duration: 0.3 + Math.random() * 0.3,
            repeat: isActive ? Infinity : 0,
            ease: 'easeInOut',
            delay: i * 0.05,
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// METRIC PILL — Pill de métrica mini
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function MetricPill({
  icon: Icon,
  value,
  label,
  color,
}: {
  icon: typeof Activity
  value: string | number
  label: string
  color: string
}) {
  return (
    <motion.div
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
    >
      <Icon className="h-3.5 w-3.5" style={{ color }} />
      <span className="text-xs font-semibold text-white">{value}</span>
      <span className="text-[10px] text-white/50">{label}</span>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Widget IA Unificado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraAIWidgetUnified({
  className,
  size = 'normal',
  showMetrics = true,
  showSuggestions = true,
  onNavigateToPanel,
  onMessage,
}: AuroraAIWidgetUnifiedProps) {
  const [state, setState] = useState<AIState>('idle')
  const [isHovered, setIsHovered] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [isMuted, setIsMuted] = useState(false)

  // Datos reales de Turso/Drizzle
  const { ventas, loading: loadingVentas } = useVentas()
  const { clientes, loading: loadingClientes } = useClientes()
  const { ordenes, loading: loadingOrdenes } = useOrdenes()
  const { bancos, loading: loadingBancos } = useBancos()

  const loading = loadingVentas || loadingClientes || loadingOrdenes || loadingBancos

  // Calcular métricas reales
  const metrics = useMemo(() => {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)

    const ventasHoy =
      ventas?.filter((v) => {
        const fecha = new Date(v.fecha)
        fecha.setHours(0, 0, 0, 0)
        return fecha.getTime() === hoy.getTime()
      }) || []

    const montoHoy = ventasHoy.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
    const clientesActivos = clientes?.filter((c) => c.estado === 'activo').length || 0
    const ordenesPendientes = ordenes?.filter((o) => o.estado === 'pendiente').length || 0

    const capitalTotal =
      bancos?.reduce((sum, b) => {
        const banco = b as unknown as { capitalActual?: number }
        return sum + (banco.capitalActual || 0)
      }, 0) || 0

    return {
      ventasHoy: montoHoy,
      clientesActivos,
      ordenesPendientes,
      capital: capitalTotal,
    }
  }, [ventas, clientes, ordenes, bancos])

  // Generar insights basados en datos reales
  const insights: BusinessInsight[] = useMemo(() => {
    const result: BusinessInsight[] = []

    if (metrics.ordenesPendientes > 5) {
      result.push({
        type: 'alert',
        title: 'Órdenes pendientes',
        description: `Tienes ${metrics.ordenesPendientes} órdenes sin procesar`,
        priority: 'high',
        action: 'Ver órdenes',
      })
    }

    if (metrics.ventasHoy > 50000) {
      result.push({
        type: 'trend',
        title: 'Buen día de ventas',
        description: `$${metrics.ventasHoy.toLocaleString()} vendidos hoy`,
        priority: 'medium',
      })
    }

    if (metrics.clientesActivos < 10) {
      result.push({
        type: 'tip',
        title: 'Expandir cartera',
        description: 'Considera captar más clientes activos',
        priority: 'low',
        action: 'Ver clientes',
      })
    }

    return result.slice(0, 2)
  }, [metrics])

  // Sugerencias contextuales
  const suggestions = useMemo(() => {
    const base = [
      'Analizar ventas del mes',
      'Revisar capital de bancos',
      'Ver clientes activos',
      'Proyección de ingresos',
    ]

    if (metrics.ordenesPendientes > 0) {
      base.unshift(`Procesar ${metrics.ordenesPendientes} órdenes`)
    }

    return base.slice(0, 4)
  }, [metrics])

  const sizeConfig = SIZE_CONFIG[size]
  const stateConfig = STATE_CONFIG[state]

  // Simular activación del asistente
  const handleActivate = useCallback(() => {
    if (state === 'idle') {
      setState('listening')
      setAudioLevel(0.5)

      // Simular transiciones de estado
      const timer1 = setTimeout(() => {
        setState('thinking')
        setAudioLevel(0.3)
      }, 2000)

      const timer2 = setTimeout(() => {
        setState('speaking')
        setAudioLevel(0.7)
      }, 4000)

      const timer3 = setTimeout(() => {
        setState('idle')
        setAudioLevel(0)
      }, 7000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
    return undefined
  }, [state])

  // Mouse tracking para parallax
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0.5)
  const mouseY = useMotionValue(0.5)
  const springConfig = { stiffness: 100, damping: 20 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)
  const orbX = useTransform(smoothX, [0, 1], [-10, 10])
  const orbY = useTransform(smoothY, [0, 1], [-10, 10])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width)
      mouseY.set((e.clientY - rect.top) / rect.height)
    },
    [mouseX, mouseY],
  )

  // Simular nivel de audio cuando está activo
  useEffect(() => {
    if (state === 'listening' || state === 'speaking') {
      const interval = setInterval(() => {
        setAudioLevel((prev) => {
          const delta = (Math.random() - 0.5) * 0.3
          return Math.max(0.2, Math.min(1, prev + delta))
        })
      }, 100)
      return () => clearInterval(interval)
    }
    return undefined
  }, [state])

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden rounded-3xl',
        'bg-gradient-to-br from-[#0a0a15]/95 via-[#0f0f20]/90 to-[#0a0a15]/95',
        'border border-white/[0.08] backdrop-blur-2xl',
        'transition-spring hover-elevate',
        sizeConfig.container,
        sizeConfig.padding,
        className,
      )}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{
        scale: 1.02,
        borderColor: 'rgba(139, 92, 246, 0.2)',
      }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Scan line effect premium */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-violet-400/40 to-transparent blur-sm"
        animate={{
          top: ['0%', '100%'],
          opacity: [0.3, 0.8, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Aurora background mejorado */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full"
          style={{
            background: `radial-gradient(circle, ${stateConfig.glow} 0%, transparent 70%)`,
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
            opacity: [0.6, 0.9, 0.6],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -right-1/2 -bottom-1/2 h-full w-full rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -30, 0],
            y: [0, 30, 0],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${stateConfig.primary}30, ${stateConfig.primary}10)`,
                boxShadow: `0 0 20px ${stateConfig.glow}`,
              }}
            >
              <Bot className="h-4 w-4" style={{ color: stateConfig.primary }} />
            </motion.div>
            <div>
              <h3 className="text-sm font-semibold text-white">CHRONOS AI</h3>
              <motion.div
                className="flex items-center gap-1.5"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: stateConfig.primary }}
                />
                <span className="text-[10px] text-white/50">{stateConfig.label}</span>
              </motion.div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setIsMuted(!isMuted)}
              className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </motion.button>
            <Link href="/ia">
              <motion.button
                onClick={onNavigateToPanel}
                className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* Métricas mini (solo si showMetrics) */}
        {showMetrics && !loading && (
          <motion.div
            className="mb-4 flex flex-wrap gap-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <MetricPill
              icon={TrendingUp}
              value={`$${(metrics.ventasHoy / 1000).toFixed(0)}k`}
              label="hoy"
              color={STATE_CONFIG.speaking.primary}
            />
            <MetricPill
              icon={Activity}
              value={metrics.clientesActivos}
              label="activos"
              color={STATE_CONFIG.idle.primary}
            />
            {metrics.ordenesPendientes > 0 && (
              <MetricPill
                icon={Zap}
                value={metrics.ordenesPendientes}
                label="pendientes"
                color={STATE_CONFIG.thinking.primary}
              />
            )}
          </motion.div>
        )}

        {/* Orb central */}
        <div className="relative flex flex-1 items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
              <span className="text-xs text-white/50">Cargando datos...</span>
            </div>
          ) : (
            <motion.div
              style={{ x: orbX, y: orbY }}
              onClick={handleActivate}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CanvasOrb state={state} size={sizeConfig.orb} audioLevel={audioLevel} />
            </motion.div>
          )}
        </div>

        {/* Voice waves */}
        {(state === 'listening' || state === 'speaking') && (
          <div className="my-3">
            <VoiceWaves isActive={true} color={stateConfig.primary} />
          </div>
        )}

        {/* Insights (si hay) */}
        <AnimatePresence>
          {insights.length > 0 && state === 'idle' && (
            <motion.div
              className="mb-3 space-y-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {insights.map((insight, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Sparkles
                    className="h-3.5 w-3.5 flex-shrink-0"
                    style={{
                      color:
                        insight.priority === 'high'
                          ? '#EF4444'
                          : insight.priority === 'medium'
                            ? '#FBBF24'
                            : '#8B5CF6',
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-white">{insight.title}</p>
                    <p className="truncate text-[10px] text-white/50">{insight.description}</p>
                  </div>
                  {insight.action && (
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-white/30" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sugerencias */}
        <AnimatePresence>
          {showSuggestions && state === 'idle' && (
            <motion.div
              className="mt-auto flex flex-wrap justify-center gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {suggestions.slice(0, size === 'compact' ? 2 : 4).map((suggestion, i) => (
                <motion.button
                  key={i}
                  onClick={() => {
                    onMessage?.(suggestion)
                    handleActivate()
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA Button */}
        <motion.button
          onClick={handleActivate}
          disabled={state !== 'idle'}
          className={cn(
            'mt-4 flex items-center justify-center gap-2 rounded-xl py-2.5',
            'font-medium text-white transition-all',
            state === 'idle'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500'
              : 'cursor-not-allowed bg-white/10',
          )}
          style={{
            boxShadow: state === 'idle' ? `0 0 30px ${stateConfig.glow}` : 'none',
          }}
          whileHover={state === 'idle' ? { scale: 1.02 } : {}}
          whileTap={state === 'idle' ? { scale: 0.98 } : {}}
        >
          {state === 'idle' ? (
            <>
              <Mic className="h-4 w-4" />
              <span className="text-sm">Hablar con IA</span>
            </>
          ) : state === 'listening' ? (
            <>
              <MicOff className="h-4 w-4 animate-pulse" />
              <span className="text-sm">Escuchando...</span>
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4 animate-pulse" />
              <span className="text-sm">{stateConfig.label}</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Border glow on hover */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          boxShadow: `inset 0 0 30px ${stateConfig.glow}`,
        }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}

export default AuroraAIWidgetUnified
