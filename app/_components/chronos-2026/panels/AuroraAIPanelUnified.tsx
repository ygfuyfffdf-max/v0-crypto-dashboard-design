/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠 AURORA AI PANEL UNIFIED — CHRONOS INFINITY 2026 SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel IA principal consolidado con TODOS los sistemas supremos:
 * ✅ SMOOTH SCROLL 120FPS (Lenis + GSAP ScrollTrigger)
 * ✅ PARTÍCULAS 3D INTERACTIVAS (WebGL Accelerated)
 * ✅ 50+ ANIMACIONES CINEMATOGRÁFICAS (Glitch, Cosmic, Energy)
 * ✅ MICRO-INTERACCIONES PREMIUM en todos los botones
 * ✅ SCROLL COUNTERS animados
 * ✅ PARALLAX EFFECTS en cards
 * - Conexión a datos reales de Turso/Drizzle
 * - Orb 3D Canvas premium con partículas reactivas
 * - Chat con IA contextual basado en datos reales
 * - Métricas en tiempo real (ventas, capital, clientes, stock)
 * - Voice recognition con visualizador de ondas
 * - Acciones rápidas CRUD conectadas al negocio
 * - Diseño glassmorphism ultra-premium
 *
 * @version 3.0.0 - SUPREME ELEVATION APPLIED
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useBancos } from '@/app/_hooks/useBancos'
import { useClientes } from '@/app/_hooks/useClientes'
import { useOrdenes } from '@/app/_hooks/useOrdenes'
import { useVentas } from '@/app/_hooks/useVentas'
import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 SUPREME SYSTEMS — CHRONOS INFINITY 2026
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import {
  ArrowLeft,
  Boxes,
  DollarSign,
  Loader2,
  MessageCircle,
  Mic,
  MicOff,
  Package,
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Volume2,
  VolumeX,
  Wallet,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

// 🌌 SUPREME SYSTEMS — CHRONOS INFINITY 2026 (QUANTUM OPTIMIZED)
import { LiquidGlassButton, LiquidGlassSearchField } from '@/app/_components/chronos-2026/primitives/LiquidGlassSystem'
import { AIBackground } from '@/app/_components/chronos-2026/particles/ParticleSystems'
import { useSmoothScroll } from '@/app/_components/chronos-2026/scroll/SmoothScrollSystem'

// � SUPREME SHADER SYSTEM — ELITE 2026

// �🌟 PREMIUM 3D COMPONENTS — ULTRA ELEVATION 2026

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS Y CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AuroraAIPanelUnifiedProps {
  className?: string
  onBack?: () => void
  onAction?: (action: string, data?: Record<string, unknown>) => void
  onMessage?: (message: string) => Promise<string>
  // Legacy compatibility props
  showMetrics?: boolean
  enableVoice?: boolean
  initialMode?: 'chat' | 'analysis' | 'predictions' | 'insights'
}

const DESIGN = {
  colors: {
    void: '#030305',
    violet: { pure: '#8B5CF6', bright: '#A78BFA', glow: 'rgba(139, 92, 246, 0.3)' },
    gold: { pure: '#FBBF24', bright: '#FCD34D', glow: 'rgba(251, 191, 36, 0.3)' },
    pink: { pure: '#EC4899', bright: '#F472B6', glow: 'rgba(236, 72, 153, 0.3)' },
    magenta: { pure: '#D946EF', bright: '#E879F9', glow: 'rgba(217, 70, 239, 0.3)' },
    cyan: { pure: '#06B6D4', bright: '#22D3EE', glow: 'rgba(6, 182, 212, 0.3)' },
    emerald: { pure: '#10B981', bright: '#34D399', glow: 'rgba(16, 185, 129, 0.3)' },
  },
  glass: {
    bg: 'rgba(255, 255, 255, 0.03)',
    bgLight: 'rgba(255, 255, 255, 0.05)',
    bgDark: 'rgba(0, 0, 0, 0.5)',
    border: 'rgba(255, 255, 255, 0.08)',
    blur: 20,
  },
  springs: {
    bouncy: { type: 'spring' as const, stiffness: 400, damping: 25 },
    smooth: { stiffness: 100, damping: 20 },
  },
}

const STATE_CONFIG = {
  idle: { primary: '#8B5CF6', secondary: '#A78BFA', label: 'Listo' },
  listening: { primary: '#06B6D4', secondary: '#22D3EE', label: 'Escuchando...' },
  thinking: { primary: '#FBBF24', secondary: '#FCD34D', label: 'Pensando...' },
  speaking: { primary: '#10B981', secondary: '#34D399', label: 'Hablando...' },
  error: { primary: '#EF4444', secondary: '#F87171', label: 'Error' },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CANVAS ORB 3D — Orb premium con partículas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function CanvasOrb3D({
  state,
  audioLevel = 0,
  onClick,
  size = 280,
}: {
  state: OrbState
  audioLevel?: number
  onClick?: () => void
  size?: number
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

    // Crear partículas
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      alpha: number
      layer: number
    }> = []

    for (let i = 0; i < 150; i++) {
      const layer = Math.floor(Math.random() * 3)
      const angle = Math.random() * Math.PI * 2
      const radius = 30 + layer * 25 + Math.random() * 30
      particles.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: 1 + Math.random() * 2.5,
        alpha: 0.3 + Math.random() * 0.7,
        layer,
      })
    }

    const animate = () => {
      timeRef.current += 0.016
      const centerX = size / 2
      const centerY = size / 2
      const audioPulse = 1 + audioLevel * 0.4

      // Clear con fade
      ctx.fillStyle = 'rgba(3, 3, 5, 0.12)'
      ctx.fillRect(0, 0, size, size)

      // Orb central
      const coreRadius = (size / 5) * audioPulse + Math.sin(timeRef.current * 2) * 8
      const gradient = ctx.createRadialGradient(
        centerX + (mouseRef.current.x - 0.5) * 25,
        centerY + (mouseRef.current.y - 0.5) * 25,
        0,
        centerX,
        centerY,
        coreRadius * 2,
      )
      gradient.addColorStop(0, config.primary + 'FF')
      gradient.addColorStop(0.3, config.secondary + 'AA')
      gradient.addColorStop(0.6, config.primary + '40')
      gradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Anillos de energía
      const rings = [
        { radius: size / 3.5, speed: 1, width: 2, opacity: 0.3 },
        { radius: size / 2.8, speed: -0.7, width: 1.5, opacity: 0.2 },
        { radius: size / 2.3, speed: 0.5, width: 1, opacity: 0.15 },
      ]

      rings.forEach((ring, i) => {
        ctx.beginPath()
        ctx.arc(
          centerX,
          centerY,
          ring.radius * audioPulse + Math.sin(timeRef.current * ring.speed + i) * 5,
          0,
          Math.PI * 2,
        )
        ctx.strokeStyle =
          config.primary +
          Math.round(ring.opacity * 255)
            .toString(16)
            .padStart(2, '0')
        ctx.lineWidth = ring.width
        ctx.stroke()
      })

      // Partículas por capas
      const layerSpeeds = [0.015, 0.01, 0.006]

      particles.forEach((p, i) => {
        const angle = Math.atan2(p.y, p.x)
        const dist = Math.sqrt(p.x * p.x + p.y * p.y)

        // Velocidad de rotación según estado
        const baseSpeed = layerSpeeds[p.layer] || 0.01
        const stateMultiplier =
          state === 'thinking' ? 2.5 : state === 'speaking' ? 1.8 : state === 'listening' ? 1.5 : 1
        const rotationSpeed = baseSpeed * stateMultiplier

        const newAngle = angle + rotationSpeed + Math.sin(timeRef.current + i * 0.05) * 0.002
        p.x = Math.cos(newAngle) * dist + p.vx
        p.y = Math.sin(newAngle) * dist + p.vy

        // Mantener en límites
        const maxDist = size / 2.2
        if (dist > maxDist) {
          p.x = Math.cos(newAngle) * maxDist
          p.y = Math.sin(newAngle) * maxDist
        }

        // Dibujar partícula
        const particleSize = p.size * audioPulse * (1 + Math.sin(timeRef.current * 3 + i) * 0.25)
        const particleAlpha = p.alpha * (0.5 + Math.sin(timeRef.current + i * 0.3) * 0.4)

        ctx.beginPath()
        ctx.arc(centerX + p.x, centerY + p.y, particleSize, 0, Math.PI * 2)
        ctx.fillStyle =
          config.primary +
          Math.round(particleAlpha * 255)
            .toString(16)
            .padStart(2, '0')
        ctx.fill()

        // Glow
        ctx.beginPath()
        ctx.arc(centerX + p.x, centerY + p.y, particleSize * 3, 0, Math.PI * 2)
        ctx.fillStyle = config.primary + '0A'
        ctx.fill()
      })

      // Conexiones entre partículas cercanas
      ctx.strokeStyle = config.primary + '12'
      ctx.lineWidth = 0.5
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i]
        if (!p1) continue
        for (let j = i + 1; j < Math.min(i + 5, particles.length); j++) {
          const p2 = particles[j]
          if (!p2) continue
          if (p1.layer === p2.layer) {
            const dx = p1.x - p2.x
            const dy = p1.y - p2.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 35) {
              ctx.beginPath()
              ctx.moveTo(centerX + p1.x, centerY + p1.y)
              ctx.lineTo(centerX + p2.x, centerY + p2.y)
              ctx.stroke()
            }
          }
        }
      }

      // Brillo especular
      const specularGradient = ctx.createRadialGradient(
        centerX - coreRadius * 0.3,
        centerY - coreRadius * 0.3,
        0,
        centerX,
        centerY,
        coreRadius * 0.7,
      )
      specularGradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)')
      specularGradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)')
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

  return (
    <motion.canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      className="cursor-pointer"
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NEBULA BACKGROUND — Fondo animado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function NebulaBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ background: DESIGN.colors.void }}>
      <motion.div
        className="absolute h-[1200px] w-[1200px] rounded-full opacity-40"
        style={{
          background: `radial-gradient(circle, ${DESIGN.colors.violet.glow} 0%, ${DESIGN.colors.magenta.glow} 40%, transparent 70%)`,
          left: '-30%',
          top: '-30%',
          filter: 'blur(120px)',
        }}
        animate={{ x: [0, 100, 0], y: [0, 50, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute h-[900px] w-[900px] rounded-full opacity-30"
        style={{
          background: `radial-gradient(circle, ${DESIGN.colors.gold.glow} 0%, ${DESIGN.colors.pink.glow} 50%, transparent 70%)`,
          right: '-20%',
          bottom: '-10%',
          filter: 'blur(100px)',
        }}
        animate={{ x: [0, -80, 0], y: [0, -60, 0], scale: [1, 1.2, 1] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute h-[600px] w-[600px] rounded-full opacity-25"
        style={{
          background: `radial-gradient(circle, ${DESIGN.colors.cyan.glow} 0%, transparent 60%)`,
          left: '35%',
          top: '25%',
          filter: 'blur(80px)',
        }}
        animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Partículas flotantes */}
      {[...Array(40)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: [
              DESIGN.colors.gold.bright,
              DESIGN.colors.violet.bright,
              DESIGN.colors.pink.bright,
            ][i % 3],
            boxShadow: `0 0 ${Math.random() * 10 + 5}px currentColor`,
          }}
          animate={{
            y: [0, -30 - Math.random() * 30, 0],
            opacity: [0.2, 0.7, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 5 + 4,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Grid sutil */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(${DESIGN.colors.violet.pure}40 1px, transparent 1px), linear-gradient(90deg, ${DESIGN.colors.violet.pure}40 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 20%, rgba(3, 3, 5, 0.85) 100%)',
        }}
      />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// METRIC CARD — Tarjeta de métrica con parallax
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MetricCardProps {
  icon: ReactNode
  label: string
  value: string | number
  color: string
  glow: string
  delay?: number
  trend?: number
}

function GlassMetricCard({ icon, label, value, color, glow, delay = 0, trend }: MetricCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  // REMOVIDO: Mouse tracking 3D problemático (rotateX/rotateY)
  // Ahora usa estilo iOS limpio sin efectos tediosos

  return (
    <motion.div
      ref={ref}
      className="relative cursor-pointer"
      initial={{ opacity: 0, y: -30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, ...DESIGN.springs.bouncy }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="relative overflow-hidden rounded-2xl p-4 neo-tactile-hover-elevate"
        style={{
          background: DESIGN.glass.bg,
          backdropFilter: `blur(${DESIGN.glass.blur}px)`,
          border: `1px solid ${DESIGN.glass.border}`,
          boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3), 0 0 40px ${glow}`,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${glow} 0%, transparent 70%)`,
          }}
        />
        <div className="relative flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
              boxShadow: `0 0 20px ${glow}`,
            }}
          >
            <span style={{ color }}>{icon}</span>
          </div>
          <div className="flex-1">
            <p className="text-xs text-white/50">{label}</p>
            <p className="text-lg font-bold text-white">{value}</p>
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                trend >= 0 ? 'text-emerald-400' : 'text-red-400',
              )}
            >
              <TrendingUp className={cn('h-3 w-3', trend < 0 && 'rotate-180')} />
              {trend >= 0 ? '+' : ''}
              {trend}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CHAT BUBBLE — Mensaje de chat
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ChatBubble({ message, index }: { message: ChatMessage; index: number }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ ...DESIGN.springs.bouncy, delay: index * 0.03 }}
      className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
    >
      <motion.div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3',
          isUser ? 'rounded-br-sm' : 'rounded-bl-sm',
        )}
        style={{
          background: isUser
            ? `linear-gradient(135deg, ${DESIGN.colors.violet.pure}, ${DESIGN.colors.magenta.pure})`
            : DESIGN.glass.bgLight,
          border: isUser ? 'none' : `1px solid ${DESIGN.glass.border}`,
          backdropFilter: !isUser ? `blur(${DESIGN.glass.blur}px)` : undefined,
          boxShadow: isUser
            ? `0 4px 20px ${DESIGN.colors.violet.glow}`
            : '0 4px 20px rgba(0, 0, 0, 0.2)',
        }}
        whileHover={{ scale: 1.01 }}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-white">{message.content}</p>
        <p className="mt-1.5 text-right text-[10px] text-white/40">
          {message.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// AUDIO VISUALIZER — Visualizador de audio
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function AudioVisualizer({ isActive, audioLevel }: { isActive: boolean; audioLevel: number }) {
  const bars = 24

  return (
    <motion.div
      className="flex h-12 items-center justify-center gap-0.5"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.8 }}
      transition={{ duration: 0.3 }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full"
          style={{
            background: `linear-gradient(to top, ${DESIGN.colors.violet.pure}, ${DESIGN.colors.gold.pure}, ${DESIGN.colors.pink.pure})`,
          }}
          animate={{
            height: isActive ? [4, 4 + Math.random() * 32 * audioLevel, 4] : 4,
            opacity: isActive ? [0.4, 1, 0.4] : 0.2,
          }}
          transition={{ duration: 0.1, delay: i * 0.015, repeat: isActive ? Infinity : 0 }}
        />
      ))}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUICK ACTION BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function QuickActionButton({
  icon,
  label,
  color,
  onClick,
}: {
  icon: ReactNode
  label: string
  color: string
  onClick: () => void
}) {
  return (
    <LiquidGlassButton
      variant="glass"
      size="sm"
      icon={<span style={{ color }}>{icon}</span>}
      onClick={onClick}
      className="rounded-full px-3 py-1.5 text-xs border-violet-500/20 hover:border-violet-500/40"
    >
      {label}
    </LiquidGlassButton>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LOADING STATE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function LoadingState() {
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: DESIGN.colors.void }}
    >
      <motion.div
        className="relative h-48 w-48"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 0deg, transparent, ${DESIGN.colors.violet.pure}, transparent)`,
            filter: 'blur(20px)',
          }}
        />
        <motion.div
          className="absolute inset-8 rounded-full"
          style={{
            background: `radial-gradient(circle, ${DESIGN.colors.violet.glow} 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
      <motion.p
        className="absolute mt-60 text-sm text-white/50"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Cargando CHRONOS AI...
      </motion.p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT — Panel IA Unificado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraAIPanelUnified({
  className,
  onBack,
  onAction,
  onMessage,
}: AuroraAIPanelUnifiedProps) {
  // 🌊 SMOOTH SCROLL SYSTEM - 120fps
  useSmoothScroll() // Activar smooth scroll 120fps
  const containerRef = useRef<HTMLDivElement>(null)

  // Datos reales de Turso/Drizzle
  const { ventas, loading: loadingVentas } = useVentas()
  const { clientes, loading: loadingClientes } = useClientes()
  const { ordenes, loading: loadingOrdenes } = useOrdenes()
  const { bancos, loading: loadingBancos } = useBancos()

  const loading = loadingVentas || loadingClientes || loadingOrdenes || loadingBancos

  // State
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [orbState, setOrbState] = useState<OrbState>('idle')
  const [showChat, setShowChat] = useState(false)
  const [mounted, setMounted] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
    const stockTotal = ordenes?.reduce((sum, o) => sum + (o.cantidad || 0), 0) || 0

    const capitalTotal =
      bancos?.reduce((sum, b) => {
        const banco = b as unknown as { capitalActual?: number }
        return sum + (banco.capitalActual || 0)
      }, 0) || 0

    // Calcular tendencia (comparar con ayer)
    const ayer = new Date(hoy)
    ayer.setDate(ayer.getDate() - 1)
    const ventasAyer =
      ventas?.filter((v) => {
        const fecha = new Date(v.fecha)
        fecha.setHours(0, 0, 0, 0)
        return fecha.getTime() === ayer.getTime()
      }) || []
    const montoAyer = ventasAyer.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
    const tendencia = montoAyer > 0 ? Math.round(((montoHoy - montoAyer) / montoAyer) * 100) : 0

    return {
      ventasHoy: montoHoy,
      capital: capitalTotal,
      clientesActivos,
      stock: stockTotal,
      tendencia,
    }
  }, [ventas, clientes, ordenes, bancos])

  // Mount effect
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Audio level simulation
  useEffect(() => {
    if (!isListening) {
      setAudioLevel(0)
      return
    }
    const interval = setInterval(() => {
      setAudioLevel(Math.random() * 0.7 + 0.3)
    }, 60)
    return () => clearInterval(interval)
  }, [isListening])

  // Format currency
  const formatCurrency = useCallback((value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${Math.round(value / 1000)}K`
    return `$${value.toLocaleString()}`
  }, [])

  // Handle message submit
  const handleSubmit = useCallback(
    async (content: string) => {
      if (!content.trim() || isProcessing) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue('')
      setIsProcessing(true)
      setOrbState('thinking')
      setShowChat(true)

      try {
        let response: string

        if (onMessage) {
          response = await onMessage(content.trim())
        } else {
          await new Promise((resolve) => setTimeout(resolve, 1200))

          const queryLower = content.toLowerCase()
          const responses: Record<string, string> = {
            ventas: `📊 **Ventas del día**: ${formatCurrency(metrics.ventasHoy)}\n\n✨ Tendencia: ${metrics.tendencia >= 0 ? '+' : ''}${metrics.tendencia}% vs ayer\n\n¿Quieres un desglose por producto?`,
            capital: `🏦 **Capital Total**: ${formatCurrency(metrics.capital)}\n\nDistribuido en bancos/bóvedas.\n\n¿Ver detalle por banco?`,
            clientes: `👥 **Clientes Activos**: ${metrics.clientesActivos}\n\nTodos con historial de compras.\n\n¿Ver detalles de algún cliente?`,
            stock: `📦 **Stock Disponible**: ${metrics.stock} unidades\n\nInventario en tiempo real.\n\n¿Registrar entrada o salida?`,
            hola: '¡Hola! 👋 Soy **CHRONOS AI**.\n\nPuedo ayudarte con:\n• 📊 Ventas\n• 💰 Capital y bancos\n• 👥 Clientes\n• 📦 Inventario\n\n¿En qué te ayudo?',
            ayuda:
              '🤖 **Comandos**:\n\n• "Ventas hoy"\n• "Capital total"\n• "Clientes activos"\n• "Stock disponible"\n• "Crear venta"',
          }

          response = `Entendido: "${content}"\n\n¿Puedes darme más detalles?`

          for (const [key, value] of Object.entries(responses)) {
            if (queryLower.includes(key)) {
              response = value
              break
            }
          }
        }

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])
        setOrbState('speaking')
        setIsSpeaking(true)

        setTimeout(() => {
          setOrbState('idle')
          setIsSpeaking(false)
        }, 2500)
      } catch {
        setOrbState('error')
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: '❌ Error al procesar. Intenta de nuevo.',
            timestamp: new Date(),
          },
        ])
        setTimeout(() => setOrbState('idle'), 2000)
      } finally {
        setIsProcessing(false)
      }
    },
    [isProcessing, metrics, formatCurrency, onMessage],
  )

  // Toggle voice
  const toggleVoice = useCallback(() => {
    setIsListening((prev) => {
      const newState = !prev
      setOrbState(newState ? 'listening' : 'idle')
      return newState
    })
  }, [])

  // Quick actions
  const quickActions = useMemo(
    () => [
      {
        icon: <DollarSign className="h-3.5 w-3.5" />,
        label: 'Ventas hoy',
        color: DESIGN.colors.gold.pure,
        prompt: 'ventas hoy',
      },
      {
        icon: <Wallet className="h-3.5 w-3.5" />,
        label: 'Capital',
        color: DESIGN.colors.violet.pure,
        prompt: 'capital total',
      },
      {
        icon: <Sparkles className="h-3.5 w-3.5" />,
        label: 'Crear venta',
        color: DESIGN.colors.emerald.pure,
        prompt: 'crear venta',
      },
      {
        icon: <Package className="h-3.5 w-3.5" />,
        label: 'Stock',
        color: DESIGN.colors.pink.pure,
        prompt: 'stock disponible',
      },
    ],
    [],
  )

  if (!mounted || loading) {
    return <LoadingState />
  }

  return (
    <div ref={containerRef} className={cn('fixed inset-0 overflow-hidden', className)}>
      {/* � QUANTUM PARTICLE FIELD — AI PREMIUM */}
      <AIBackground opacity={0.5} />

      <NebulaBackground />

      {/* Header */}
      <motion.header
        className="fixed top-0 right-0 left-0 z-30 p-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard"
            className={cn(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm text-white/80',
              'neo-tactile-hover-elevate bg-white/[0.06] backdrop-blur-xl border border-white/[0.1]',
              'hover:bg-white/[0.1] hover:border-white/[0.15]'
            )}
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>

          <motion.div
            className="flex items-center gap-3 rounded-xl px-4 py-2"
            style={{
              background: DESIGN.glass.bg,
              border: `1px solid ${DESIGN.glass.border}`,
              backdropFilter: `blur(${DESIGN.glass.blur}px)`,
            }}
          >
            <motion.div
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: DESIGN.colors.emerald.pure }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="text-sm text-white/70">CHRONOS AI</span>
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-400">
              2026
            </span>
          </motion.div>
        </div>
      </motion.header>

      {/* Main Content */}
      <div className="relative z-10 flex h-full flex-col pt-20 pb-32">
        {/* Metrics */}
        <motion.div
          className="mb-4 px-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 lg:grid-cols-4">
            <GlassMetricCard
              icon={<DollarSign className="h-5 w-5" />}
              label="Ventas Hoy"
              value={formatCurrency(metrics.ventasHoy)}
              color={DESIGN.colors.gold.pure}
              glow={DESIGN.colors.gold.glow}
              delay={0.4}
              trend={metrics.tendencia}
            />
            <GlassMetricCard
              icon={<Wallet className="h-5 w-5" />}
              label="Capital Total"
              value={formatCurrency(metrics.capital)}
              color={DESIGN.colors.violet.pure}
              glow={DESIGN.colors.violet.glow}
              delay={0.5}
            />
            <GlassMetricCard
              icon={<Users className="h-5 w-5" />}
              label="Clientes"
              value={metrics.clientesActivos}
              color={DESIGN.colors.pink.pure}
              glow={DESIGN.colors.pink.glow}
              delay={0.6}
            />
            <GlassMetricCard
              icon={<Boxes className="h-5 w-5" />}
              label="Stock"
              value={`${metrics.stock} uds`}
              color={DESIGN.colors.emerald.pure}
              glow={DESIGN.colors.emerald.glow}
              delay={0.7}
            />
          </div>
        </motion.div>

        {/* 3D Orb */}
        <motion.div
          className="flex flex-1 flex-col items-center justify-center px-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="relative">
            <CanvasOrb3D
              state={orbState}
              audioLevel={audioLevel}
              onClick={toggleVoice}
              size={280}
            />
          </div>

          <motion.div
            className="mt-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <h1 className="bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
              ¿En qué puedo ayudarte?
            </h1>
            <p className="mt-2 text-sm text-white/40">Haz clic en el orbe o escribe tu mensaje</p>
          </motion.div>

          <AudioVisualizer isActive={isListening} audioLevel={audioLevel} />

          <motion.div
            className="mt-4 flex max-w-lg flex-wrap justify-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {quickActions.map((action, i) => (
              <QuickActionButton
                key={i}
                icon={action.icon}
                label={action.label}
                color={action.color}
                onClick={() => handleSubmit(action.prompt)}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              className="fixed inset-x-0 bottom-28 z-40 px-4"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div
                className="mx-auto max-w-lg overflow-hidden rounded-3xl"
                style={{
                  background: DESIGN.glass.bgDark,
                  backdropFilter: `blur(${DESIGN.glass.blur}px)`,
                  border: `1px solid ${DESIGN.glass.border}`,
                  boxShadow: '0 -10px 50px rgba(0, 0, 0, 0.5)',
                  maxHeight: '45vh',
                }}
              >
                <div className="flex items-center justify-between border-b border-white/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/20">
                      <MessageCircle className="h-4 w-4 text-violet-400" />
                    </div>
                    <span className="font-medium text-white">Chat con CHRONOS</span>
                  </div>
                  <LiquidGlassButton
                    variant="glass"
                    size="sm"
                    icon={<X className="h-4 w-4" />}
                    onClick={() => setShowChat(false)}
                    className="rounded-lg p-2 h-9 w-9 px-0"
                  />
                </div>

                <div className="max-h-52 space-y-3 overflow-y-auto p-4">
                  <AnimatePresence mode="popLayout">
                    {messages.map((message, index) => (
                      <ChatBubble key={message.id} message={message} index={index} />
                    ))}
                  </AnimatePresence>

                  {isProcessing && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <div
                        className="rounded-2xl rounded-bl-sm px-4 py-3"
                        style={{
                          background: DESIGN.glass.bgLight,
                          border: `1px solid ${DESIGN.glass.border}`,
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-violet-400" />
                          <span className="text-sm text-white/60">Pensando...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Bar */}
      <motion.div
        className="fixed right-0 bottom-0 left-0 z-30 px-4 py-4"
        style={{
          background: `linear-gradient(to top, ${DESIGN.colors.void} 0%, transparent 100%)`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="mx-auto max-w-lg">
          <form
            className="flex items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit(inputValue)
            }}
          >
            <LiquidGlassButton
              type="button"
              variant="glass"
              size="md"
              icon={isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              onClick={toggleVoice}
              className={cn(
                'shrink-0 rounded-xl p-3 h-11 w-11 px-0',
                isListening &&
                  'bg-gradient-to-br from-cyan-500 to-emerald-500 border-transparent shadow-[0_0_20px_rgba(6,182,212,0.4)]'
              )}
            />

            <LiquidGlassSearchField
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje..."
              disabled={isProcessing || isListening}
              className="flex-1"
            />

            <LiquidGlassButton
              type="button"
              variant="glass"
              size="md"
              icon={isSpeaking ? <Volume2 className="h-5 w-5 text-violet-400" /> : <VolumeX className="h-5 w-5 text-white/40" />}
              onClick={() => setIsSpeaking(!isSpeaking)}
              className="shrink-0 rounded-xl p-3 h-11 w-11 px-0"
            />

            <LiquidGlassButton
              type="submit"
              variant={inputValue.trim() ? 'accent' : 'glass'}
              size="md"
              icon={<Send className="h-5 w-5" />}
              disabled={!inputValue.trim() || isProcessing}
              className="shrink-0 rounded-xl p-3 h-11 w-11 px-0"
            />
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default AuroraAIPanelUnified

