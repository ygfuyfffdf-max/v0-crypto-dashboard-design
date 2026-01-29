'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — QUANTUM DASHBOARD
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Dashboard cinematográfico supremo basado en year-wrapped-template:
 * - Orb central 3D con capital total + pulso usuario
 * - Bento grid asimétrico con 6 KPI cards (3D tilt, volumetric glow)
 * - Activity feed con partículas doradas on-money
 * - Fondo quantum void shader + parallax scroll
 * - Widget IA flotante minimalista
 *
 * PALETA ESTRICTA: #000000, #8B00FF, #FFD700, #FF1493, #FFFFFF
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, useScroll } from 'motion/react'
import {
  QUANTUM_PALETTE,
  QUANTUM_SHADOWS,
  QUANTUM_GLASS,
  QUANTUM_SPRING,
  QUANTUM_GRADIENTS,
  type QuantumMood,
} from '@/app/lib/design-system/quantum-infinity-2026'
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  Package,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Zap,
  Bot,
  Activity,
  DollarSign,
  BarChart3,
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 QUANTUM VOID BACKGROUND SHADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumVoidBackgroundProps {
  mood: QuantumMood
}

const QuantumVoidBackground = ({ mood }: QuantumVoidBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const { scrollY } = useScroll()

  const moodConfig = useMemo(
    () => ({
      calm: { particleCount: 500, speed: 0.2, fogDensity: 0.3 },
      flow: { particleCount: 800, speed: 0.4, fogDensity: 0.5 },
      stress: { particleCount: 600, speed: 0.6, fogDensity: 0.4 },
      euphoric: { particleCount: 1500, speed: 0.8, fogDensity: 0.6 },
      neutral: { particleCount: 600, speed: 0.3, fogDensity: 0.4 },
      focus: { particleCount: 700, speed: 0.5, fogDensity: 0.55 },
      night: { particleCount: 300, speed: 0.15, fogDensity: 0.2 },
    }),
    [],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.scale(dpr, dpr)
    }
    handleResize()
    window.addEventListener('resize', handleResize)

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener('mousemove', handleMouseMove)

    const config = moodConfig[mood]

    interface Particle {
      x: number
      y: number
      z: number
      vx: number
      vy: number
      vz: number
      size: number
      color: string
      alpha: number
    }

    const particles: Particle[] = []
    const colors = [
      QUANTUM_PALETTE.violet.pure,
      QUANTUM_PALETTE.gold.pure,
      QUANTUM_PALETTE.violet.soft,
      QUANTUM_PALETTE.gold.soft,
    ]

    for (let i = 0; i < config.particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        vz: -Math.random() * 2 - 0.5,
        size: Math.random() * 2 + 0.5,
        color: colors[Math.floor(Math.random() * colors.length)] as string,
        alpha: Math.random() * 0.6 + 0.2,
      })
    }

    let time = 0
    const animate = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      time += config.speed * 0.016

      // Clear with fade for trail effect
      ctx.fillStyle = `rgba(0, 0, 0, ${0.1 + config.fogDensity * 0.1})`
      ctx.fillRect(0, 0, width, height)

      // Volumetric fog gradient
      const fogGradient = ctx.createRadialGradient(
        width * mouseRef.current.x,
        height * mouseRef.current.y,
        0,
        width * 0.5,
        height * 0.5,
        Math.max(width, height),
      )
      fogGradient.addColorStop(0, `${QUANTUM_PALETTE.violet.pure}08`)
      fogGradient.addColorStop(0.3, `${QUANTUM_PALETTE.gold.pure}04`)
      fogGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = fogGradient
      ctx.fillRect(0, 0, width, height)

      // Update and draw particles
      particles.forEach((p) => {
        // Parallax based on mouse
        const parallaxX = (mouseRef.current.x - 0.5) * (p.z / 500) * 20
        const parallaxY = (mouseRef.current.y - 0.5) * (p.z / 500) * 20

        p.x += p.vx * config.speed + parallaxX * 0.02
        p.y += p.vy * config.speed + parallaxY * 0.02
        p.z += p.vz * config.speed

        // Wrap around
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0
        if (p.z < 0) {
          p.z = 1000
          p.x = Math.random() * width
          p.y = Math.random() * height
        }

        // Size based on depth
        const scale = 1 - p.z / 1000
        const size = p.size * scale * 2

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha * scale
        ctx.fill()
        ctx.globalAlpha = 1
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationRef.current)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mood, moodConfig])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 h-full w-full"
      style={{ zIndex: 0 }}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔮 CAPITAL ORB CENTRAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CapitalOrbProps {
  capital: number
  pulso?: number // BPM del usuario via webcam
  trend?: number // % cambio
  mood: QuantumMood
}

const CapitalOrb = ({ capital, pulso = 72, trend = 0, mood }: CapitalOrbProps) => {
  const orbRef = useRef<HTMLDivElement>(null)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [ringRotation, setRingRotation] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setRingRotation((r) => r + (mood === 'euphoric' ? 2 : mood === 'calm' ? 0.3 : 0.8))
    }, 16)
    return () => clearInterval(interval)
  }, [mood])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!orbRef.current) return
    const rect = orbRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height
    setRotation({ x: y * 15, y: -x * 15 })
  }

  const pulseDuration = 60 / pulso // seconds per beat

  return (
    <motion.div
      ref={orbRef}
      className="relative h-80 w-80"
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotation({ x: 0, y: 0 })}
      animate={{
        rotateX: rotation.x,
        rotateY: rotation.y,
      }}
      transition={QUANTUM_SPRING.snappy}
    >
      {/* Anillos orbitales */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border"
          style={{
            borderColor:
              i === 0
                ? QUANTUM_PALETTE.violet.border40
                : i === 1
                  ? QUANTUM_PALETTE.gold.border
                  : QUANTUM_PALETTE.plasma.border,
            transform: `rotateX(${60 + i * 15}deg) rotateZ(${ringRotation + i * 30}deg)`,
            boxShadow: `0 0 20px ${i === 0 ? QUANTUM_PALETTE.violet.glow40 : i === 1 ? QUANTUM_PALETTE.gold.glow40 : QUANTUM_PALETTE.plasma.glow40}`,
          }}
        />
      ))}

      {/* Orb principal */}
      <motion.div
        className="absolute inset-8 flex flex-col items-center justify-center rounded-full"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${QUANTUM_PALETTE.violet.pure}99 0%, ${QUANTUM_PALETTE.void.deep} 70%, ${QUANTUM_PALETTE.void.pure} 100%)`,
          boxShadow: `
            inset 0 -20px 60px rgba(0,0,0,0.6),
            0 0 60px ${QUANTUM_PALETTE.violet.glow},
            0 0 120px ${QUANTUM_PALETTE.gold.glow40}
          `,
        }}
        animate={{
          scale: [1, 1.02, 1],
          boxShadow: [
            `inset 0 -20px 60px rgba(0,0,0,0.6), 0 0 60px ${QUANTUM_PALETTE.violet.glow}, 0 0 120px ${QUANTUM_PALETTE.gold.glow40}`,
            `inset 0 -20px 60px rgba(0,0,0,0.6), 0 0 80px ${QUANTUM_PALETTE.violet.glow}, 0 0 150px ${QUANTUM_PALETTE.gold.glow}`,
            `inset 0 -20px 60px rgba(0,0,0,0.6), 0 0 60px ${QUANTUM_PALETTE.violet.glow}, 0 0 120px ${QUANTUM_PALETTE.gold.glow40}`,
          ],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Capital */}
        <span className="text-sm" style={{ color: QUANTUM_PALETTE.white.text60 }}>
          Capital Total
        </span>
        <motion.span
          className="text-4xl font-bold"
          style={{
            background: QUANTUM_GRADIENTS.text.violetGold,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          key={capital}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={QUANTUM_SPRING.snappy}
        >
          ${capital.toLocaleString('es-MX')}
        </motion.span>

        {/* Trend */}
        <div
          className="mt-2 flex items-center gap-1"
          style={{ color: trend >= 0 ? '#00FF88' : QUANTUM_PALETTE.plasma.pure }}
        >
          {trend >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span className="text-sm font-medium">{Math.abs(trend)}%</span>
        </div>

        {/* Pulso */}
        <div className="mt-3 flex items-center gap-2">
          <Activity size={14} style={{ color: QUANTUM_PALETTE.plasma.pure }} />
          <span className="text-xs" style={{ color: QUANTUM_PALETTE.white.text40 }}>
            {pulso} BPM
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 KPI CARD 3D
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface KPICardProps {
  title: string
  value: string | number
  trend?: number
  icon: React.ReactNode
  color: string
  colorGlow: string
  size?: 'sm' | 'md' | 'lg'
}

const KPICard = ({ title, value, trend, icon, color, colorGlow, size = 'md' }: KPICardProps) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [8, -8])
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-8, 8])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
  }

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-5',
    lg: 'p-6',
  }

  return (
    <motion.div
      ref={cardRef}
      className={`rounded-2xl ${sizeClasses[size]}`}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
        background: QUANTUM_GLASS.elevated?.background,
        backdropFilter: 'blur(30px) saturate(180%)',
        border: `1px solid ${QUANTUM_PALETTE.white.border10}`,
        boxShadow: QUANTUM_SHADOWS.elevation[2],
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        mouseX.set(0)
        mouseY.set(0)
      }}
      whileHover={{
        boxShadow: `${QUANTUM_SHADOWS.elevation[3]}, 0 0 30px ${colorGlow}`,
      }}
      transition={QUANTUM_SPRING.snappy}
    >
      <div className="mb-3 flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{
            background: `${color}20`,
            boxShadow: `0 0 20px ${colorGlow}`,
          }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div
            className="flex items-center gap-1 rounded-full px-2 py-1 text-xs"
            style={{
              background: trend >= 0 ? 'rgba(0, 255, 136, 0.15)' : QUANTUM_PALETTE.plasma.glow15,
              color: trend >= 0 ? '#00FF88' : QUANTUM_PALETTE.plasma.pure,
            }}
          >
            {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <p className="mb-1 text-sm" style={{ color: QUANTUM_PALETTE.white.text40 }}>
        {title}
      </p>
      <p className="text-2xl font-bold" style={{ color }}>
        {typeof value === 'number' ? value.toLocaleString('es-MX') : value}
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📜 ACTIVITY FEED
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ActivityItem {
  id: string
  type: 'ingreso' | 'gasto' | 'venta' | 'abono'
  monto: number
  descripcion: string
  fecha: Date
  banco?: string
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const [showParticles, setShowParticles] = useState<string | null>(null)

  const getTypeConfig = (type: ActivityItem['type']) => {
    switch (type) {
      case 'ingreso':
      case 'abono':
        return {
          icon: <ArrowDownLeft size={16} />,
          color: QUANTUM_PALETTE.gold.pure,
          label: type === 'ingreso' ? 'Ingreso' : 'Abono',
        }
      case 'gasto':
        return {
          icon: <ArrowUpRight size={16} />,
          color: QUANTUM_PALETTE.plasma.pure,
          label: 'Gasto',
        }
      case 'venta':
        return {
          icon: <ShoppingCart size={16} />,
          color: QUANTUM_PALETTE.violet.neon,
          label: 'Venta',
        }
    }
  }

  return (
    <motion.div
      className="h-full rounded-2xl p-5"
      style={{
        background: QUANTUM_GLASS.elevated?.background,
        backdropFilter: 'blur(30px) saturate(180%)',
        border: `1px solid ${QUANTUM_PALETTE.white.border10}`,
        boxShadow: QUANTUM_SHADOWS.elevation[2],
      }}
    >
      <h3 className="mb-4 text-lg font-semibold" style={{ color: QUANTUM_PALETTE.white.pure }}>
        Actividad Reciente
      </h3>

      <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
        {activities.map((activity, index) => {
          const config = getTypeConfig(activity.type)
          const isPositive =
            activity.type === 'ingreso' || activity.type === 'abono' || activity.type === 'venta'

          return (
            <motion.div
              key={activity.id}
              className="relative flex items-center gap-3 rounded-xl p-3"
              style={{
                background: QUANTUM_PALETTE.white.subtle,
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...QUANTUM_SPRING.smooth, delay: index * 0.05 }}
              whileHover={{
                background: `${config.color}10`,
                boxShadow: `0 0 15px ${config.color}30`,
              }}
              onHoverStart={() => isPositive && setShowParticles(activity.id)}
              onHoverEnd={() => setShowParticles(null)}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{
                  background: `${config.color}20`,
                }}
              >
                {config.icon}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className="truncate text-sm font-medium"
                  style={{ color: QUANTUM_PALETTE.white.text }}
                >
                  {activity.descripcion}
                </p>
                <p className="text-xs" style={{ color: QUANTUM_PALETTE.white.text40 }}>
                  {config.label} •{' '}
                  {new Date(activity.fecha).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <span className="font-semibold" style={{ color: config.color }}>
                {isPositive ? '+' : '-'}${activity.monto.toLocaleString('es-MX')}
              </span>

              {/* Partículas doradas on hover for positive */}
              <AnimatePresence>
                {showParticles === activity.id && isPositive && (
                  <motion.div
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute h-1 w-1 rounded-full"
                        style={{
                          background: QUANTUM_PALETTE.gold.pure,
                          left: `${Math.random() * 100}%`,
                          top: `${Math.random() * 100}%`,
                          boxShadow: `0 0 6px ${QUANTUM_PALETTE.gold.pure}`,
                        }}
                        animate={{
                          y: [0, -30],
                          x: [(Math.random() - 0.5) * 20],
                          opacity: [1, 0],
                          scale: [1, 0],
                        }}
                        transition={{
                          duration: 0.8,
                          delay: i * 0.05,
                          ease: 'easeOut',
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🤖 WIDGET IA FLOTANTE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface IAWidgetProps {
  onClick: () => void
  isActive?: boolean
}

const IAWidget = ({ onClick, isActive }: IAWidgetProps) => {
  return (
    <motion.button
      className="fixed right-6 bottom-6 z-50 flex h-16 w-16 items-center justify-center rounded-full"
      style={{
        background: `radial-gradient(circle at 30% 30%, ${QUANTUM_PALETTE.violet.pure}99 0%, ${QUANTUM_PALETTE.void.deep} 100%)`,
        boxShadow: `0 0 30px ${QUANTUM_PALETTE.violet.glow}, 0 0 60px ${QUANTUM_PALETTE.violet.glow40}`,
        border: `2px solid ${QUANTUM_PALETTE.violet.border40}`,
      }}
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: isActive
          ? [
              `0 0 30px ${QUANTUM_PALETTE.violet.glow}, 0 0 60px ${QUANTUM_PALETTE.violet.glow40}`,
              `0 0 50px ${QUANTUM_PALETTE.gold.glow}, 0 0 80px ${QUANTUM_PALETTE.gold.glow40}`,
              `0 0 30px ${QUANTUM_PALETTE.violet.glow}, 0 0 60px ${QUANTUM_PALETTE.violet.glow40}`,
            ]
          : `0 0 30px ${QUANTUM_PALETTE.violet.glow}, 0 0 60px ${QUANTUM_PALETTE.violet.glow40}`,
      }}
      transition={{
        duration: 1.5,
        repeat: isActive ? Infinity : 0,
      }}
    >
      <Bot size={28} style={{ color: QUANTUM_PALETTE.white.pure }} />
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🚀 COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuantumDashboardProps {
  capitalTotal: number
  capitalTrend?: number
  pulsoUsuario?: number
  mood?: QuantumMood
  kpis: {
    clientes: number
    clientesTrend?: number
    ventas: number
    ventasTrend?: number
    productos: number
    productosTrend?: number
    ingresos: number
    ingresosTrend?: number
    gastos: number
    gastosTrend?: number
    pendientes: number
  }
  activities: ActivityItem[]
  onIAClick: () => void
  isIAActive?: boolean
}

export const QuantumDashboard = ({
  capitalTotal,
  capitalTrend = 0,
  pulsoUsuario = 72,
  mood = 'flow',
  kpis,
  activities,
  onIAClick,
  isIAActive,
}: QuantumDashboardProps) => {
  return (
    <div
      className="relative min-h-screen px-6 pt-24 pb-12"
      style={{ background: QUANTUM_PALETTE.void.pure }}
    >
      {/* Background Shader */}
      <QuantumVoidBackground mood={mood} />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1800px]">
        {/* Orb Central + KPIs Grid */}
        <div className="mb-8 grid grid-cols-12 gap-6">
          {/* Left KPIs */}
          <div className="col-span-12 space-y-4 md:col-span-3">
            <KPICard
              title="Clientes Activos"
              value={kpis.clientes}
              trend={kpis.clientesTrend}
              icon={<Users size={24} style={{ color: QUANTUM_PALETTE.violet.pure }} />}
              color={QUANTUM_PALETTE.violet.pure}
              colorGlow={QUANTUM_PALETTE.violet.glow40}
            />
            <KPICard
              title="Ventas del Mes"
              value={kpis.ventas}
              trend={kpis.ventasTrend}
              icon={<ShoppingCart size={24} style={{ color: QUANTUM_PALETTE.gold.pure }} />}
              color={QUANTUM_PALETTE.gold.pure}
              colorGlow={QUANTUM_PALETTE.gold.glow40}
            />
            <KPICard
              title="Productos"
              value={kpis.productos}
              trend={kpis.productosTrend}
              icon={<Package size={24} style={{ color: QUANTUM_PALETTE.violet.soft }} />}
              color={QUANTUM_PALETTE.violet.soft}
              colorGlow={QUANTUM_PALETTE.violet.glow}
            />
          </div>

          {/* Central Orb */}
          <div className="col-span-12 flex items-center justify-center py-8 md:col-span-6">
            <CapitalOrb
              capital={capitalTotal}
              pulso={pulsoUsuario}
              trend={capitalTrend}
              mood={mood}
            />
          </div>

          {/* Right KPIs */}
          <div className="col-span-12 space-y-4 md:col-span-3">
            <KPICard
              title="Ingresos del Mes"
              value={`$${(kpis.ingresos / 1000).toFixed(0)}K`}
              trend={kpis.ingresosTrend}
              icon={<ArrowDownLeft size={24} style={{ color: '#00FF88' }} />}
              color="#00FF88"
              colorGlow="rgba(0, 255, 136, 0.4)"
            />
            <KPICard
              title="Gastos del Mes"
              value={`$${(kpis.gastos / 1000).toFixed(0)}K`}
              trend={kpis.gastosTrend}
              icon={<ArrowUpRight size={24} style={{ color: QUANTUM_PALETTE.plasma.pure }} />}
              color={QUANTUM_PALETTE.plasma.pure}
              colorGlow={QUANTUM_PALETTE.plasma.glow40}
            />
            <KPICard
              title="Pendientes"
              value={kpis.pendientes}
              icon={<Clock size={24} style={{ color: QUANTUM_PALETTE.gold.pure }} />}
              color={QUANTUM_PALETTE.gold.pure}
              colorGlow={QUANTUM_PALETTE.gold.glow40}
            />
          </div>
        </div>

        {/* Activity Feed */}
        <div className="mx-auto max-w-2xl">
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* Widget IA Flotante */}
      <IAWidget onClick={onIAClick} isActive={isIAActive} />
    </div>
  )
}

export default QuantumDashboard
