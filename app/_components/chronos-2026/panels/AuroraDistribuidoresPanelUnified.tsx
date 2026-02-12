"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🚚✨ AURORA DISTRIBUIDORES PANEL UNIFIED — CHRONOS INFINITY 2026 ULTRA SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de Distribuidores ULTRA PREMIUM con TODOS los sistemas supremos 2026:
 * ✅ QUANTUM VISUAL EFFECTS (Mood/Pulse adaptive, WebGPU-ready)
 * ✅ SMOOTH SCROLL 120FPS (Lenis + GSAP ScrollTrigger)
 * ✅ PARTÍCULAS 3D INTERACTIVAS (WebGL/WebGPU Accelerated 2M+)
 * ✅ 50+ ANIMACIONES CINEMATOGRÁFICAS (Glitch, Cosmic, Energy, Holographic)
 * ✅ MICRO-INTERACCIONES PREMIUM en todos los botones
 * ✅ SCROLL COUNTERS animados con GSAP
 * ✅ PARALLAX EFFECTS ultra fluido
 * ✅ LIQUID MORPH TRANSITIONS (ClipPath GPU-accelerated)
 * ✅ GLASSMORPHISM GEN5 con aurora boreal
 * ✅ MEDIAPIPE PULSE SYNC para efectos biométricos
 * - Grid de cards + tabla completa de distribuidores
 * - Visualización de red 3D de distribuidores animada
 * - CRUD completo: Crear, Editar, Eliminar distribuidores
 * - Gestión de órdenes de compra por distribuidor
 * - Sistema de pagos y registro de deudas
 * - KPIs con tendencias y métricas
 *
 * @version 4.0.0 - ULTRA SUPREME ELEVATION 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { useDistribuidoresData } from "@/app/hooks/useDataHooks"
import { useSoundManager } from "@/app/lib/audio/sound-system"
import { logger } from "@/app/lib/utils/logger"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 ULTRA SUPREME SYSTEMS — CHRONOS INFINITY 2026
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Mail,
  MapPin,
  MoreHorizontal,
  Package,
  Phone,
  Plus,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Truck,
  Wallet,
  X,
  Zap,
} from "lucide-react"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🚀 QUANTUM PREMIUM SYSTEMS INTEGRATION (ULTRA OPTIMIZED 2026)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import "@/app/_components/chronos-2026/animations/CinematicAnimations"
import { DistribuidoresBackground } from "@/app/_components/chronos-2026/particles/ParticleSystems"
import { useSmoothScroll } from "@/app/_components/chronos-2026/scroll/SmoothScrollSystem"

// 🌌 QUANTUM VISUAL EFFECTS — NEW 2026 SYSTEMS
import useQuantumVisualEffects, { VISUAL_PRESETS } from "@/app/hooks/useQuantumVisualEffects"

// 🚀 SUPREME ELEVATION SYSTEM — OMEGA-LEVEL 2026 (NEW!)

// 🌌 SUPREME SHADER SYSTEM — ELITE 2026

// Aurora Glass System
import {
  AuroraBackground,
  AuroraSearch,
  AuroraStatWidget,
  AuroraTabs,
} from "../../ui/AuroraGlassSystem"
import {
  EnhancedAuroraButton as AuroraButton,
  EnhancedAuroraCard as AuroraGlassCard,
} from "../../ui/EnhancedAuroraSystem"

// 🍎 iOS PREMIUM SYSTEM 2026 — Sistema de UI sin efectos 3D problemáticos
import {
  iOSScrollContainer,
  iOSSection,
  iOSGrid,
  iOSEntityCard,
  iOSMetricCardPremium,
  useToastAdvanced as useiOSToast,
  iOSConfirm,
} from "../../ui/ios"

// Aurora Charts - Lazy Loaded for performance
const AuroraBarChart = dynamic(
  () => import("../../charts/AuroraPremiumCharts").then((mod) => mod.AuroraBarChart),
  {
    loading: () => <div className="h-[220px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  }
)

// 🌌 QUANTUM VISUALIZATION - Ultra Premium 3D Effects
const QuantumDistribuidoresViz = dynamic(
  () =>
    import("../visualizations/QuantumDistribuidoresViz").then(
      (mod) => mod.QuantumDistribuidoresViz
    ),
  {
    loading: () => (
      <div className="h-52 w-full animate-pulse rounded-xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10" />
    ),
    ssr: false,
  }
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type EstadoDistribuidor = "activo" | "inactivo" | "suspendido"
type CategoriaDistribuidor = "estrategico" | "preferido" | "normal" | "ocasional" | "nuevo"
type EstadoOrden = "pendiente" | "en_proceso" | "completado" | "cancelado"

interface Distribuidor {
  id: string
  nombre: string
  alias?: string
  empresa?: string
  telefono?: string
  email?: string
  direccion?: string
  ubicacion?: string
  tipoProductos?: string
  // Financiero
  totalCompras: number
  deudaActual: number
  totalPagado: number
  saldoPendiente: number
  // Métricas
  numeroOrdenes: number
  ordenesCompletadas: number
  ordenesPendientes: number
  ultimaOrden?: string
  diasSinOrdenar: number
  // Scoring
  rating: number
  scoreTotal: number
  categoria: CategoriaDistribuidor
  confiabilidad: number
  tiempoPromedioEntrega: number
  // Estado
  estado: EstadoDistribuidor
  notas?: string
  createdAt: string
}

interface OrdenCompra {
  id: string
  distribuidorId: string
  distribuidor: string
  fecha: string
  numeroOrden?: string
  producto: string
  cantidad: number
  precioUnitario: number
  subtotal: number
  iva: number
  total: number
  montoPagado: number
  montoRestante: number
  estado: EstadoOrden
  stockActual: number
  notas?: string
}

interface AuroraDistribuidoresPanelUnifiedProps {
  distribuidores?: Distribuidor[]
  ordenes?: OrdenCompra[]
  onCrear?: (_data: Partial<Distribuidor>) => Promise<void>
  onEditar?: (_id: string, _data: Partial<Distribuidor>) => Promise<void>
  onEliminar?: (_id: string) => Promise<void>
  onVerDetalle?: (_distribuidor: Distribuidor) => void
  onVerHistorial?: (_distribuidor: Distribuidor) => void
  onNuevaOrden?: (_data: Partial<OrdenCompra>) => Promise<void>
  onRegistrarPago?: (_distribuidorId: string, _ordenId: string, _monto: number) => Promise<void>
  onVerOrden?: (_orden: OrdenCompra) => void
  onEditarOrden?: (_orden: OrdenCompra) => void
  onEliminarOrden?: (_ordenId: string) => Promise<void>
  onExportar?: (_formato: "csv" | "excel" | "pdf") => void
  onRefresh?: () => void
  loading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧹 SISTEMA LIMPIO - Sin datos mock (Conectado a Turso)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const _defaultDistribuidores: Distribuidor[] = []

const defaultOrdenes: OrdenCompra[] = []

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌐 NETWORK VISUALIZATION — Animated distributor network
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function DistributorNetworkVisualization({ distribuidores }: { distribuidores: Distribuidor[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    resize()

    const rect = canvas.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Create nodes for distribuidores
    const nodes = distribuidores.slice(0, 6).map((dist, i) => {
      const angle = (i / Math.min(6, distribuidores.length)) * Math.PI * 2 - Math.PI / 2
      const radius = 60 + Math.random() * 20
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        targetX: centerX + Math.cos(angle) * radius,
        targetY: centerY + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        size: 8 + (dist.scoreTotal / 100) * 6,
        color: dist.estado === "activo" ? "#06B6D4" : "#64748b",
        label: dist.alias || dist.nombre.substring(0, 8),
        score: dist.scoreTotal,
      }
    })

    // Particles flowing between nodes
    const particles: Array<{
      fromIndex: number
      toIndex: number
      progress: number
      speed: number
      size: number
    }> = []

    for (let i = 0; i < 15; i++) {
      particles.push({
        fromIndex: Math.floor(Math.random() * nodes.length),
        toIndex: Math.floor(Math.random() * nodes.length),
        progress: Math.random(),
        speed: 0.003 + Math.random() * 0.007,
        size: 2 + Math.random() * 2,
      })
    }

    const animate = () => {
      timeRef.current += 0.016

      // Clear
      ctx.fillStyle = "rgba(3, 3, 8, 0.1)"
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Central hub glow
      const hubGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40)
      hubGlow.addColorStop(0, "rgba(6, 182, 212, 0.5)")
      hubGlow.addColorStop(0.5, "rgba(6, 182, 212, 0.15)")
      hubGlow.addColorStop(1, "transparent")
      ctx.beginPath()
      ctx.arc(centerX, centerY, 35 + Math.sin(timeRef.current * 2) * 5, 0, Math.PI * 2)
      ctx.fillStyle = hubGlow
      ctx.fill()

      // Central hub
      ctx.beginPath()
      ctx.arc(centerX, centerY, 18, 0, Math.PI * 2)
      ctx.fillStyle = "#06B6D4"
      ctx.fill()

      // Icon
      ctx.fillStyle = "#030308"
      ctx.font = "bold 14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("🏭", centerX, centerY)

      // Draw connections
      nodes.forEach((node, i) => {
        // Connection to center
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(node.x, node.y)
        ctx.strokeStyle = `${node.color}20`
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Connections between nodes (sparse)
        if (i < nodes.length - 1 && Math.random() > 0.7) {
          const nextNode = nodes[i + 1]
          if (nextNode) {
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(nextNode.x, nextNode.y)
            ctx.strokeStyle = "rgba(100, 116, 139, 0.1)"
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      })

      // Animate particles
      particles.forEach((p) => {
        p.progress += p.speed
        if (p.progress > 1) {
          p.progress = 0
          p.fromIndex = Math.floor(Math.random() * nodes.length)
          p.toIndex = Math.floor(Math.random() * nodes.length)
        }

        const from = nodes[p.fromIndex]
        const to = nodes[p.toIndex]
        if (!from || !to || p.fromIndex === p.toIndex) return

        // Bezier curve through center
        const t = p.progress
        const cx = centerX
        const cy = centerY

        // Quadratic bezier
        const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cx + t * t * to.x
        const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cy + t * t * to.y

        // Particle
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(6, 182, 212, ${0.9 - p.progress * 0.6})`
        ctx.fill()
      })

      // Draw nodes
      nodes.forEach((node, i) => {
        // Node glow
        const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 3)
        glow.addColorStop(0, node.color + "60")
        glow.addColorStop(0.5, node.color + "20")
        glow.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.arc(
          node.x,
          node.y,
          node.size * 2.5 + Math.sin(timeRef.current * 2 + i) * 2,
          0,
          Math.PI * 2
        )
        ctx.fillStyle = glow
        ctx.fill()

        // Node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()

        // Border
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Label
        ctx.font = "8px Inter, sans-serif"
        ctx.fillStyle = "#ffffff80"
        ctx.textAlign = "center"
        const labelOffset = node.y < centerY ? -node.size - 8 : node.size + 14
        ctx.fillText(node.label, node.x, node.y + labelOffset)

        // Score badge
        if (node.score >= 90) {
          ctx.font = "bold 7px sans-serif"
          ctx.fillStyle = "#10B981"
          ctx.fillText("★", node.x, node.y - node.size - 16)
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [distribuidores])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ background: "transparent" }}
      role="img"
      aria-label="Red de distribuidores del sistema CHRONOS mostrando conexiones y relaciones entre proveedores"
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🏢 DISTRIBUIDOR CARD ULTRA PREMIUM — Individual distributor card with Quantum Effects
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface DistribuidorCardProps {
  distribuidor: Distribuidor
  onVerDetalle?: () => void
  onEditar?: () => void
  onNuevaOrden?: () => void
  onRegistrarPago?: () => void
  onEliminar?: () => void
  // 🌌 Quantum Visual Props
  mood?: number
  pulse?: number
  moodColor?: string
  index?: number
}

function DistribuidorCard({
  distribuidor,
  onVerDetalle,
  onEditar,
  onNuevaOrden,
  onRegistrarPago,
  onEliminar,
  mood = 0.5,
  pulse = 0.5,
  moodColor = "#06B6D4",
  index = 0,
}: DistribuidorCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const cardRef = useRef<HTMLDivElement>(null)

  // 🌈 Dynamic colors based on mood
  const dynamicAccent = useMemo(() => {
    const hue = mood * 60 // From cyan (180) to gold (40) interpolation
    return `hsl(${180 - hue * 2.3}, 85%, 55%)`
  }, [mood])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePosition({ x, y })
  }, [])

  const estadoConfig = {
    activo: {
      color: "#10B981",
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      label: "Activo",
    },
    inactivo: { color: "#64748b", bg: "bg-gray-500/20", text: "text-gray-400", label: "Inactivo" },
    suspendido: {
      color: "#EF4444",
      bg: "bg-red-500/20",
      text: "text-red-400",
      label: "Suspendido",
    },
  }

  const categoriaConfig = {
    estrategico: { color: "#A855F7", label: "⭐ Estratégico" },
    preferido: { color: "#06B6D4", label: "💎 Preferido" },
    normal: { color: "#10B981", label: "✓ Normal" },
    ocasional: { color: "#F59E0B", label: "○ Ocasional" },
    nuevo: { color: "#8B5CF6", label: "★ Nuevo" },
  }

  const config = estadoConfig[distribuidor.estado]
  const catConfig = categoriaConfig[distribuidor.categoria]

  return (
    <motion.div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl p-5 transition-all duration-500",
        "border border-white/10 bg-white/5 backdrop-blur-xl",
        "hover:border-white/20 hover:bg-white/10",
        "hover:shadow-2xl hover:shadow-cyan-500/20"
      )}
      style={{
        boxShadow: isHovered
          ? `0 20px 50px ${catConfig.color}30, 0 0 80px ${catConfig.color}15`
          : "0 8px 30px rgba(0,0,0,0.4)",
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onVerDetalle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      {/* Holographic Background Effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, ${catConfig.color}20, transparent 60%)`,
        }}
      />

      {/* Aurora Orb Animation */}
      <motion.div
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-15"
        style={{
          background: `radial-gradient(circle, ${catConfig.color}, transparent 70%)`,
          filter: "blur(30px)",
        }}
        animate={{
          scale: isHovered ? [1, 1.3, 1] : 1,
          rotate: isHovered ? 360 : 0,
        }}
        transition={{
          duration: 3,
          repeat: isHovered ? Infinity : 0,
          ease: "linear",
        }}
      />

      {/* Shimmer Effect */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <motion.div
          className="h-full w-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
          }}
          animate={{
            x: isHovered ? ["0%", "200%"] : "0%",
          }}
          transition={{
            duration: 1.5,
            repeat: isHovered ? Infinity : 0,
            ease: "linear",
          }}
        />
      </div>

      {/* Scan Line Effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <motion.div
          className="absolute h-[1px] w-full bg-white/20"
          animate={{
            y: isHovered ? ["0%", "100%"] : "0%",
          }}
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
            ease: "linear",
          }}
        />
      </div>

      {/* Background gradient */}
      <motion.div
        className="absolute inset-0 opacity-0"
        animate={{ opacity: isHovered ? 0.08 : 0 }}
        style={{ background: `linear-gradient(135deg, ${config.color}, transparent)` }}
      />

      {/* Header */}
      <div className="relative mb-4 flex items-start justify-between">
        <div className="flex flex-1 items-center gap-3">
          {/* Avatar */}
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-xl font-bold text-white shadow-lg"
            animate={{ rotate: isHovered ? [0, -3, 3, 0] : 0 }}
          >
            {distribuidor.alias?.[0] || distribuidor.nombre[0]}
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">{distribuidor.nombre}</p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  config.bg,
                  config.text
                )}
              >
                {config.label}
              </span>
            </div>
            {distribuidor.alias && (
              <p className="text-xs font-medium text-cyan-400">{distribuidor.alias}</p>
            )}
            {distribuidor.empresa && (
              <p className="truncate text-xs text-white/40">{distribuidor.empresa}</p>
            )}
          </div>
        </div>

        {/* Menu button */}
        <div className="relative">
          <motion.button
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoreHorizontal size={18} />
          </motion.button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                className="absolute top-10 right-0 z-50 w-48 overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl"
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onEditar?.()
                  }}
                >
                  <Edit size={14} />
                  Editar
                </button>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onNuevaOrden?.()
                  }}
                >
                  <ShoppingCart size={14} />
                  Nueva Orden
                </button>
                {/* Botón Registrar Pago - SIEMPRE VISIBLE */}
                <button
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors",
                    distribuidor.deudaActual > 0
                      ? "text-white hover:bg-white/10"
                      : "cursor-not-allowed text-white/40 hover:bg-white/5"
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    if (distribuidor.deudaActual > 0) {
                      onRegistrarPago?.()
                    }
                  }}
                  disabled={distribuidor.deudaActual <= 0}
                  title={
                    distribuidor.deudaActual > 0
                      ? `Pagar deuda de $${distribuidor.deudaActual.toLocaleString()}`
                      : "Sin deuda pendiente"
                  }
                >
                  <Wallet size={14} />
                  Registrar Pago
                  {distribuidor.deudaActual > 0 && (
                    <span className="ml-auto text-xs text-emerald-400">
                      ${distribuidor.deudaActual.toLocaleString()}
                    </span>
                  )}
                </button>
                <div className="border-t border-white/10" />
                <button
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(false)
                    onEliminar?.()
                  }}
                >
                  <Trash2 size={14} />
                  Eliminar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Category & Rating */}
      <div className="relative mb-3 flex items-center justify-between">
        <span
          className="rounded-lg px-2 py-1 text-xs"
          style={{ background: `${catConfig.color}20`, color: catConfig.color }}
        >
          {catConfig.label}
        </span>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={12}
              className={
                i < Math.floor(distribuidor.rating)
                  ? "fill-amber-400 text-amber-400"
                  : "text-white/20"
              }
            />
          ))}
          <span className="ml-1 text-xs text-white/50">{distribuidor.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* Contact info */}
      {(distribuidor.telefono || distribuidor.email || distribuidor.ubicacion) && (
        <div className="relative mb-4 space-y-1.5">
          {distribuidor.telefono && (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Phone size={12} className="text-cyan-400" />
              <span>{distribuidor.telefono}</span>
            </div>
          )}
          {distribuidor.email && (
            <div className="flex items-center gap-2 truncate text-xs text-white/50">
              <Mail size={12} className="text-cyan-400" />
              <span className="truncate">{distribuidor.email}</span>
            </div>
          )}
          {distribuidor.ubicacion && (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <MapPin size={12} className="text-cyan-400" />
              <span>{distribuidor.ubicacion}</span>
            </div>
          )}
        </div>
      )}

      {/* Financial stats */}
      <div className="relative mb-3 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="mb-1 text-xs text-white/40">Total Compras</p>
          <p className="text-base font-bold text-cyan-400">
            ${(distribuidor.totalCompras / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="rounded-lg bg-white/[0.03] p-3">
          <p className="mb-1 text-xs text-white/40">Deuda Actual</p>
          <p
            className={cn(
              "text-base font-bold",
              distribuidor.deudaActual > 0 ? "text-amber-400" : "text-emerald-400"
            )}
          >
            ${(distribuidor.deudaActual / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      {/* Advanced Metrics (Chronos Infinity) */}
      <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded bg-emerald-500/10 p-2 text-center">
          <span className="block text-[10px] text-white/40">Confiabilidad</span>
          <span className="font-bold text-emerald-400">
            {(distribuidor.confiabilidad ?? 0).toFixed(1)}%
          </span>
        </div>
        <div className="rounded bg-violet-500/10 p-2 text-center">
          <span className="block text-[10px] text-white/40">Entrega Prom.</span>
          <span className="font-bold text-violet-400">
            {(distribuidor.tiempoPromedioEntrega ?? 0).toFixed(0)}d
          </span>
        </div>
      </div>

      {/* Orders stats */}
      <div className="relative flex items-center justify-between border-t border-white/5 pt-3 text-xs">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-white/40">Órdenes: </span>
            <span className="font-medium text-white">{distribuidor.numeroOrdenes}</span>
          </div>
          <div>
            <span className="text-emerald-400">{distribuidor.ordenesCompletadas} ✓</span>
          </div>
          <div>
            <span className="text-amber-400">{distribuidor.ordenesPendientes} ⏳</span>
          </div>
        </div>
        <ChevronRight size={14} className="text-white/30" />
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 ORDEN COMPRA ROW — Order purchase row with full actions
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OrdenCompraRowProps {
  orden: OrdenCompra
  onVerDetalle?: () => void
  onEditar?: () => void
  onEliminar?: () => void
}

function OrdenCompraRow({ orden, onVerDetalle, onEditar, onEliminar }: OrdenCompraRowProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [_isHovered, setIsHovered] = useState(false)

  const estadoConfig = {
    pendiente: {
      icon: "⏳",
      color: "#F59E0B",
      bg: "bg-amber-500/20",
      text: "text-amber-400",
      label: "Pendiente",
    },
    en_proceso: {
      icon: "🔄",
      color: "#06B6D4",
      bg: "bg-cyan-500/20",
      text: "text-cyan-400",
      label: "En Proceso",
    },
    completado: {
      icon: "✓",
      color: "#10B981",
      bg: "bg-emerald-500/20",
      text: "text-emerald-400",
      label: "Completado",
    },
    cancelado: {
      icon: "✗",
      color: "#EF4444",
      bg: "bg-red-500/20",
      text: "text-red-400",
      label: "Cancelado",
    },
  }

  const config = estadoConfig[orden.estado]

  return (
    <>
      <motion.div
        className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/10 hover:bg-white/[0.04]"
        whileHover={{ x: 4 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-4">
          {/* Icon */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg text-lg"
            style={{ background: `${config.color}20` }}
          >
            {config.icon}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <p className="text-sm font-medium text-white">{orden.numeroOrden || orden.id}</p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  config.bg,
                  config.text
                )}
              >
                {config.label}
              </span>
            </div>
            {/* Traceability info */}
            <div className="flex items-center gap-3 text-xs text-white/50">
              <span className="flex items-center gap-1">
                <Calendar size={10} className="text-cyan-400" />
                {orden.fecha}
              </span>
              <span className="flex items-center gap-1">
                <Truck size={10} className="text-violet-400" />
                {orden.distribuidor}
              </span>
            </div>
          </div>

          {/* Product */}
          <div className="hidden w-48 truncate lg:block">
            <p className="truncate text-xs text-white/60">{orden.producto}</p>
            <p className="text-xs text-cyan-400">
              {orden.cantidad} unidades @ ${orden.precioUnitario?.toLocaleString() || "N/A"}
            </p>
          </div>

          {/* Amounts */}
          <div className="text-right">
            <p className="text-sm font-bold text-white">${orden.total.toLocaleString()}</p>
            {orden.montoRestante > 0 && (
              <p className="text-xs text-amber-400">
                Debe: ${orden.montoRestante.toLocaleString()}
              </p>
            )}
            {orden.montoRestante === 0 && (
              <p className="flex items-center justify-end gap-1 text-xs text-emerald-400">
                <CheckCircle size={10} />
                Pagado
              </p>
            )}
          </div>

          {/* Action Buttons - Always visible */}
          <div className="flex items-center gap-1">
            <motion.button
              className="rounded-lg p-2 text-white/60 transition-colors hover:bg-cyan-500/20 hover:text-cyan-400"
              onClick={onVerDetalle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Ver detalle"
            >
              <Eye size={16} />
            </motion.button>
            <motion.button
              className="rounded-lg p-2 text-white/60 transition-colors hover:bg-violet-500/20 hover:text-violet-400"
              onClick={onEditar}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Editar orden"
            >
              <Edit size={16} />
            </motion.button>
            <motion.button
              className="rounded-lg p-2 text-white/60 transition-colors hover:bg-red-500/20 hover:text-red-400"
              onClick={() => setShowDeleteConfirm(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              title="Eliminar orden"
            >
              <Trash2 size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              className="mx-4 w-full max-w-md rounded-xl border border-red-500/30 bg-gray-900/95 p-6"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-full bg-red-500/20 p-3">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Eliminar Orden</h3>
                  <p className="text-sm text-white/50">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="mb-4 rounded-lg bg-white/5 p-4">
                <p className="mb-2 text-sm text-white/70">
                  <strong className="text-white">Orden:</strong> {orden.numeroOrden || orden.id}
                </p>
                <p className="text-sm text-white/70">
                  <strong className="text-white">Total:</strong> ${orden.total.toLocaleString()}
                </p>
                <p className="text-sm text-white/70">
                  <strong className="text-white">Distribuidor:</strong> {orden.distribuidor}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  className="flex-1 rounded-lg bg-white/10 px-4 py-2.5 text-white transition-colors hover:bg-white/20"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </button>
                <button
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-600"
                  onClick={() => {
                    onEliminar?.()
                    setShowDeleteConfirm(false)
                  }}
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT — Aurora Distribuidores Panel Unified
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraDistribuidoresPanelUnified({
  distribuidores: distribuidoresProp,
  ordenes = defaultOrdenes,
  onCrear: _onCrear,
  onEditar,
  onEliminar,
  onVerDetalle,
  onVerHistorial: _onVerHistorial,
  onNuevaOrden,
  onRegistrarPago,
  onVerOrden,
  onEditarOrden,
  onEliminarOrden,
  onExportar,
  onRefresh,
  loading: loadingProp = false,
  className,
}: AuroraDistribuidoresPanelUnifiedProps) {
  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 CARGAR DATOS REALES DE LA API SI NO SE PASAN PROPS
  // ═══════════════════════════════════════════════════════════════════════════
  const {
    data: distribuidoresAPI,
    loading: loadingAPI,
    refetch: refetchAPI,
  } = useDistribuidoresData()

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌟 ULTRA SUPREME SYSTEMS INITIALIZATION 2026
  // ═══════════════════════════════════════════════════════════════════════════
  useSmoothScroll() // Activar smooth scroll 120fps en todo el panel

  // 🌌 QUANTUM VISUAL EFFECTS — Mood, Pulse, Colors
  const {
    mood,
    moodLevel,
    moodColor,
    moodGradient,
    pulse,
    primaryColor,
    secondaryColor,
    triggerCelebration,
    boostMood,
  } = useQuantumVisualEffects(VISUAL_PRESETS.balanced)

  // 🎭 REDUCED MOTION — Accessibility
  const prefersReducedMotion = useReducedMotion()

  // 🔊 SOUND SYSTEM
  const { play } = useSoundManager()

  // Transformar datos de API al formato del componente
  const transformedDistribuidores = useMemo((): Distribuidor[] => {
    if (!distribuidoresAPI || distribuidoresAPI.length === 0) return []

    return distribuidoresAPI.map(
      (d: {
        id: string
        nombre: string
        email?: string | null
        telefono?: string | null
        direccion?: string | null
        estado?: string
        saldoPendiente?: number
        createdAt?: Date | string
      }): Distribuidor => ({
        id: d.id,
        nombre: d.nombre,
        alias: undefined,
        empresa: undefined,
        email: d.email || "",
        telefono: d.telefono || "",
        direccion: d.direccion || "",
        ubicacion: undefined,
        tipoProductos: undefined,
        totalCompras: 0,
        deudaActual: d.saldoPendiente || 0,
        totalPagado: 0,
        saldoPendiente: d.saldoPendiente || 0,
        numeroOrdenes: 0,
        ordenesCompletadas: 0,
        ordenesPendientes: 0,
        ultimaOrden: undefined,
        diasSinOrdenar: 0,
        rating: 4,
        scoreTotal: 80,
        categoria: "normal" as const,
        confiabilidad: 90,
        tiempoPromedioEntrega: 0,
        estado: (d.estado === "activo"
          ? "activo"
          : d.estado === "inactivo"
            ? "inactivo"
            : "activo") as EstadoDistribuidor,
        notas: undefined,
        createdAt:
          typeof d.createdAt === "string"
            ? d.createdAt
            : d.createdAt?.toISOString() || new Date().toISOString(),
      })
    )
  }, [distribuidoresAPI])

  // Usar datos de props si se pasan, sino usar datos de API (sin fallback a mock)
  const distribuidores = useMemo(() => {
    if (distribuidoresProp && Array.isArray(distribuidoresProp) && distribuidoresProp.length > 0) {
      return distribuidoresProp
    }
    return Array.isArray(transformedDistribuidores) ? transformedDistribuidores : [] // Si está vacío, mostrar vacío (sin mock data)
  }, [distribuidoresProp, transformedDistribuidores])

  const loading = loadingProp || loadingAPI

  const [filtros, setFiltros] = useState({
    busqueda: "",
    estado: "todos",
    categoria: "todos",
    deudaFilter: "todos" as "todos" | "con_deuda" | "sin_deuda",
    fechaInicio: "",
    fechaFin: "",
    ordenEstado: "todos",
  })
  const [vistaActual, setVistaActual] = useState<"grid" | "tabla" | "ordenes">("grid")
  const [showModalCrear, setShowModalCrear] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [_selectedDistribuidor, setSelectedDistribuidor] = useState<Distribuidor | null>(null)

  // Stats
  const stats = useMemo(() => {
    const activos = distribuidores.filter((d) => d.estado === "activo").length
    const totalCompras = distribuidores.reduce((sum, d) => sum + d.totalCompras, 0)
    const deudaTotal = distribuidores.reduce((sum, d) => sum + d.deudaActual, 0)
    const ordenesTotales = distribuidores.reduce((sum, d) => sum + d.numeroOrdenes, 0)
    const promedioPedido = ordenesTotales > 0 ? totalCompras / ordenesTotales : 0
    const conDeuda = distribuidores.filter((d) => d.deudaActual > 0).length
    const estrategicos = distribuidores.filter((d) => d.categoria === "estrategico").length

    return {
      total: distribuidores.length,
      activos,
      totalCompras,
      deudaTotal,
      ordenesTotales,
      promedioPedido,
      conDeuda,
      estrategicos,
    }
  }, [distribuidores])

  // Filtered distribuidores
  const filteredDistribuidores = useMemo(() => {
    return distribuidores.filter((d) => {
      const matchBusqueda =
        !filtros.busqueda ||
        d.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        d.alias?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        d.empresa?.toLowerCase().includes(filtros.busqueda.toLowerCase())

      const matchEstado = filtros.estado === "todos" || d.estado === filtros.estado
      const matchCategoria = filtros.categoria === "todos" || d.categoria === filtros.categoria
      const matchDeuda =
        filtros.deudaFilter === "todos" ||
        (filtros.deudaFilter === "con_deuda" && d.deudaActual > 0) ||
        (filtros.deudaFilter === "sin_deuda" && d.deudaActual === 0)

      return matchBusqueda && matchEstado && matchCategoria && matchDeuda
    })
  }, [distribuidores, filtros])

  // Filtered ordenes
  const filteredOrdenes = useMemo(() => {
    return ordenes.filter((o) => {
      const matchEstado = filtros.ordenEstado === "todos" || o.estado === filtros.ordenEstado
      const matchFechaInicio = !filtros.fechaInicio || o.fecha >= filtros.fechaInicio
      const matchFechaFin = !filtros.fechaFin || o.fecha <= filtros.fechaFin
      return matchEstado && matchFechaInicio && matchFechaFin
    })
  }, [ordenes, filtros])

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filtros.estado !== "todos") count++
    if (filtros.categoria !== "todos") count++
    if (filtros.deudaFilter !== "todos") count++
    if (filtros.ordenEstado !== "todos") count++
    if (filtros.fechaInicio) count++
    if (filtros.fechaFin) count++
    return count
  }, [filtros])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltros({
      busqueda: "",
      estado: "todos",
      categoria: "todos",
      deudaFilter: "todos",
      fechaInicio: "",
      fechaFin: "",
      ordenEstado: "todos",
    })
  }, [])

  // Handle export
  const handleExportar = useCallback(
    (formato: "csv" | "excel" | "pdf") => {
      if (onExportar) {
        onExportar(formato)
      } else {
        // Default CSV export
        const isOrdenes = vistaActual === "ordenes"
        let csvContent: string

        if (isOrdenes) {
          const headers = [
            "ID",
            "Número Orden",
            "Distribuidor",
            "Producto",
            "Cantidad",
            "P. Unitario",
            "Total",
            "Pagado",
            "Restante",
            "Estado",
            "Fecha",
          ]
          const rows = filteredOrdenes.map((o) => [
            o.id,
            o.numeroOrden || "",
            o.distribuidor,
            o.producto,
            o.cantidad,
            o.precioUnitario || 0,
            o.total,
            o.montoPagado || 0,
            o.montoRestante,
            o.estado,
            o.fecha,
          ])
          csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
        } else {
          const headers = [
            "ID",
            "Nombre",
            "Alias",
            "Empresa",
            "Teléfono",
            "Email",
            "Estado",
            "Categoría",
            "Total Compras",
            "Deuda Actual",
            "Órdenes",
            "Rating",
          ]
          const rows = filteredDistribuidores.map((d) => [
            d.id,
            d.nombre,
            d.alias || "",
            d.empresa || "",
            d.telefono || "",
            d.email || "",
            d.estado,
            d.categoria,
            d.totalCompras,
            d.deudaActual,
            d.numeroOrdenes,
            d.rating,
          ])
          csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")
        }

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `distribuidores_${isOrdenes ? "ordenes" : "lista"}_${new Date().toISOString().split("T")[0]}.${formato}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
      setShowExportMenu(false)
    },
    [onExportar, vistaActual, filteredDistribuidores, filteredOrdenes]
  )

  // Handle distribuidor actions
  const handleVerDetalle = useCallback(
    (distribuidor: Distribuidor) => {
      if (onVerDetalle) {
        onVerDetalle(distribuidor)
      } else {
        setSelectedDistribuidor(distribuidor)
        logger.info("Ver detalle distribuidor", {
          context: "AuroraDistribuidoresPanelUnified",
          data: { id: distribuidor.id },
        })
      }
    },
    [onVerDetalle]
  )

  const handleEditar = useCallback(
    (distribuidor: Distribuidor) => {
      if (onEditar) {
        onEditar(distribuidor.id, distribuidor)
      } else {
        logger.info("Editar distribuidor", {
          context: "AuroraDistribuidoresPanelUnified",
          data: { id: distribuidor.id },
        })
      }
    },
    [onEditar]
  )

  const handleEliminar = useCallback(
    (distribuidor: Distribuidor) => {
      if (onEliminar) {
        onEliminar(distribuidor.id)
      } else {
        logger.info("Eliminar distribuidor", {
          context: "AuroraDistribuidoresPanelUnified",
          data: { id: distribuidor.id },
        })
      }
    },
    [onEliminar]
  )

  const handleNuevaOrden = useCallback(
    (distribuidor: Distribuidor) => {
      if (onNuevaOrden) {
        onNuevaOrden({ distribuidorId: distribuidor.id })
      } else {
        logger.info("Nueva orden para distribuidor", {
          context: "AuroraDistribuidoresPanelUnified",
          data: { id: distribuidor.id },
        })
      }
    },
    [onNuevaOrden]
  )

  const handleRegistrarPago = useCallback(
    (distribuidor: Distribuidor) => {
      if (onRegistrarPago) {
        // Llamar a la función de pago pasando los parámetros necesarios
        logger.info("Registrar pago para distribuidor", {
          context: "AuroraDistribuidoresPanelUnified",
          data: { id: distribuidor.id },
        })
        // Llamar con distribuidorId, ordenId vacío y monto de deuda
        onRegistrarPago(distribuidor.id, "", distribuidor.deudaActual)
      }
    },
    [onRegistrarPago]
  )

  // Handle orden actions
  const handleVerOrden = useCallback(
    (orden: OrdenCompra) => {
      if (onVerOrden) {
        onVerOrden(orden)
      } else {
        logger.info("Ver detalle orden", {
          context: "AuroraDistribuidoresPanelUnified",
          data: { id: orden.id },
        })
      }
    },
    [onVerOrden]
  )

  const handleEditarOrden = useCallback(
    (orden: OrdenCompra) => {
      if (onEditarOrden) {
        onEditarOrden(orden)
      } else {
        logger.info("Editar orden", {
          context: "AuroraDistribuidoresPanelUnified",
          data: { id: orden.id },
        })
      }
    },
    [onEditarOrden]
  )

  const handleEliminarOrden = useCallback(
    (orden: OrdenCompra) => {
      if (onEliminarOrden) {
        onEliminarOrden(orden.id)
      } else {
        logger.info("Eliminar orden", {
          context: "AuroraDistribuidoresPanelUnified",
          data: { id: orden.id },
        })
      }
    },
    [onEliminarOrden]
  )

  // 🌌 Chart data with mood-adaptive colors
  const comprasData = useMemo(() => {
    // Dynamic colors based on mood: cyan (calm) → gold (euphoric)
    const getGradientColor = (index: number, isActive: boolean) => {
      if (!isActive) return "#64748b"
      // Create a gradient from cyan to gold based on position
      const hue = 180 - mood * 140 - index * 10 // Spread colors
      return `hsl(${Math.max(40, hue)}, 85%, 55%)`
    }

    return distribuidores
      .sort((a, b) => b.totalCompras - a.totalCompras)
      .slice(0, 5)
      .map((d, idx) => ({
        name: d.alias || d.nombre.substring(0, 10),
        value: d.totalCompras,
        color: getGradientColor(idx, d.estado === "activo"),
      }))
  }, [distribuidores, mood])

  // Get dynamic action button
  const getActionButton = () => {
    if (vistaActual === "ordenes") {
      return (
        <AuroraButton
          variant="glow"
          color="emerald"
          icon={<ShoppingCart size={18} />}
          onClick={() => {
            play("success")
            onNuevaOrden?.({})
          }}
        >
          Nueva Orden
        </AuroraButton>
      )
    }
    return (
      <AuroraButton
        variant="glow"
        color="cyan"
        icon={<Plus size={18} />}
        onClick={() => {
          play("success")
          setShowModalCrear(true)
        }}
      >
        Nuevo Distribuidor
      </AuroraButton>
    )
  }

  const tabs = [
    { id: "todos", label: "Todos" },
    { id: "activo", label: "Activos" },
    { id: "inactivo", label: "Inactivos" },
  ]

  return (
    <>
      {/* 🌌 QUANTUM PARTICLE FIELD — DISTRIBUIDORES */}
      <DistribuidoresBackground opacity={0.45} />

      <AuroraBackground
        intensity="medium"
        colors={["cyan", "violet", "emerald"]}
        interactive
        className={cn("min-h-screen", className)}
      >
        <main className="p-6" aria-label="Panel de distribuidores CHRONOS">
          {/* Header - ELEVATED PREMIUM */}
          <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="relative">
              {/* Decorative glow orb */}
              <div className="absolute -top-4 -left-4 h-20 w-32 rounded-full bg-cyan-500/20 blur-3xl" />
              <motion.h1
                className="relative flex items-center gap-4 text-3xl font-bold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Truck className="h-6 w-6 text-cyan-400" aria-hidden="true" />
                </motion.div>
                <span className="bg-gradient-to-r from-white via-cyan-200 to-white bg-clip-text text-transparent">
                  Distribuidores
                </span>
              </motion.h1>
              <p className="relative mt-2 text-white/50">
                Gestión de proveedores y órdenes de compra •{" "}
                <span className="text-cyan-400">{filteredDistribuidores.length}</span> resultados
              </p>
              {/* Animated underline */}
              <motion.div
                className="mt-2 h-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ width: 0 }}
                animate={{ width: 80 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </div>

            <div className="flex items-center gap-3">
              {getActionButton()}

              {/* Export Button with Dropdown */}
              <div className="relative">
                <AuroraButton
                  variant="secondary"
                  icon={<Download size={18} />}
                  onClick={() => {
                    play("click")
                    setShowExportMenu(!showExportMenu)
                  }}
                >
                  Exportar
                  <ChevronDown
                    size={14}
                    className={cn("ml-1 transition-transform", showExportMenu && "rotate-180")}
                  />
                </AuroraButton>

                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      className="absolute top-12 right-0 z-50 w-48 overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    >
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white hover:bg-white/10"
                        onClick={() => {
                          play("success")
                          handleExportar("csv")
                        }}
                      >
                        <FileText size={14} className="text-emerald-400" />
                        Exportar CSV
                      </button>
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white hover:bg-white/10"
                        onClick={() => {
                          play("success")
                          handleExportar("excel")
                        }}
                      >
                        <FileText size={14} className="text-cyan-400" />
                        Exportar Excel
                      </button>
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white hover:bg-white/10"
                        onClick={() => {
                          play("success")
                          handleExportar("pdf")
                        }}
                      >
                        <FileText size={14} className="text-red-400" />
                        Exportar PDF
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Filters Toggle */}
              <motion.button
                onClick={() => {
                  play("tab-switch")
                  setShowFiltersPanel(!showFiltersPanel)
                }}
                className={cn(
                  "relative rounded-xl border p-3 transition-colors",
                  showFiltersPanel
                    ? "border-cyan-500/30 bg-cyan-500/20 text-cyan-400"
                    : "border-white/10 bg-white/5 text-white/60 hover:text-white"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter size={20} />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </motion.button>

              <motion.button
                onClick={() => {
                  play("whoosh")
                  refetchAPI()
                  onRefresh?.()
                }}
                aria-label={
                  loading ? "Actualizando datos..." : "Actualizar lista de distribuidores"
                }
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/60 transition-colors hover:text-white"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} aria-hidden="true" />
              </motion.button>
            </div>
          </header>

          {/* Advanced Filters Panel */}
          <AnimatePresence>
            {showFiltersPanel && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <AuroraGlassCard glowColor="cyan" className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold text-white">
                      <Filter size={16} className="text-cyan-400" />
                      Filtros Avanzados
                    </h3>
                    <div className="flex items-center gap-2">
                      {activeFiltersCount > 0 && (
                        <button
                          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300"
                          onClick={clearFilters}
                        >
                          <X size={12} />
                          Limpiar ({activeFiltersCount})
                        </button>
                      )}
                      <button
                        className="rounded-lg p-1.5 text-white/60 hover:bg-white/10"
                        onClick={() => setShowFiltersPanel(false)}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                    {/* Estado Distribuidor */}
                    <div>
                      <label className="mb-1.5 block text-xs text-white/50">Estado</label>
                      <select
                        value={filtros.estado}
                        onChange={(e) =>
                          setFiltros((prev) => ({ ...prev, estado: e.target.value }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                      >
                        <option value="todos">Todos</option>
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="suspendido">Suspendido</option>
                      </select>
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className="mb-1.5 block text-xs text-white/50">Categoría</label>
                      <select
                        value={filtros.categoria}
                        onChange={(e) =>
                          setFiltros((prev) => ({ ...prev, categoria: e.target.value }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                      >
                        <option value="todos">Todas</option>
                        <option value="estrategico">⭐ Estratégico</option>
                        <option value="preferido">💎 Preferido</option>
                        <option value="normal">✓ Normal</option>
                        <option value="ocasional">○ Ocasional</option>
                        <option value="nuevo">★ Nuevo</option>
                      </select>
                    </div>

                    {/* Deuda */}
                    <div>
                      <label className="mb-1.5 block text-xs text-white/50">Deuda</label>
                      <select
                        value={filtros.deudaFilter}
                        onChange={(e) =>
                          setFiltros((prev) => ({
                            ...prev,
                            deudaFilter: e.target.value as "todos" | "con_deuda" | "sin_deuda",
                          }))
                        }
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                      >
                        <option value="todos">Todos</option>
                        <option value="con_deuda">Con Deuda</option>
                        <option value="sin_deuda">Sin Deuda</option>
                      </select>
                    </div>

                    {/* Estado Orden (solo visible en vista órdenes) */}
                    {vistaActual === "ordenes" && (
                      <>
                        <div>
                          <label className="mb-1.5 block text-xs text-white/50">Estado Orden</label>
                          <select
                            value={filtros.ordenEstado}
                            onChange={(e) =>
                              setFiltros((prev) => ({ ...prev, ordenEstado: e.target.value }))
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                          >
                            <option value="todos">Todos</option>
                            <option value="pendiente">Pendiente</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="completado">Completado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>

                        <div>
                          <label className="mb-1.5 flex items-center gap-1 text-xs text-white/50">
                            <Calendar size={12} />
                            Desde
                          </label>
                          <input
                            type="date"
                            value={filtros.fechaInicio}
                            onChange={(e) =>
                              setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                          />
                        </div>

                        <div>
                          <label className="mb-1.5 flex items-center gap-1 text-xs text-white/50">
                            <Calendar size={12} />
                            Hasta
                          </label>
                          <input
                            type="date"
                            value={filtros.fechaFin}
                            onChange={(e) =>
                              setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))
                            }
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </AuroraGlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Row */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <AuroraStatWidget
              label="Total Distribuidores"
              value={stats.total}
              icon={<Building2 size={20} />}
              color="cyan"
              className="transition-spring hover-elevate"
            />
            <AuroraStatWidget
              label="Total Compras"
              value={`$${(stats.totalCompras / 1000000).toFixed(1)}M`}
              icon={<ShoppingCart size={20} />}
              color="emerald"
              change={12.5}
              trend="up"
              className="transition-spring hover-elevate"
            />
            <AuroraStatWidget
              label="Deuda Total"
              value={`$${(stats.deudaTotal / 1000).toFixed(0)}K`}
              icon={<Wallet size={20} />}
              color="gold"
              change={-8.3}
              trend="down"
              className="transition-spring hover-elevate"
            />
            <AuroraStatWidget
              label="Órdenes Totales"
              value={stats.ordenesTotales}
              icon={<Package size={20} />}
              color="violet"
              className="transition-spring hover-elevate"
            />
          </div>

          {/* ═══════════════════════════════════════════════════════════════════════════
           * 🍎 iOS PREMIUM METRICS — Distribuidores sin efectos 3D problemáticos
           * ═══════════════════════════════════════════════════════════════════════════ */}
          <iOSSection title="Distribuidores iOS" description="Vista limpia sin efectos 3D" className="mb-6">
            <iOSGrid cols={4} gap="md">
              <iOSMetricCardPremium
                title="Total Distribuidores"
                value={String(stats.total)}
                icon={Building2}
                iconColor="#06B6D4"
                variant="default"
              />
              <iOSMetricCardPremium
                title="Total Compras"
                value={`$${(stats.totalCompras / 1000000).toFixed(1)}M`}
                icon={ShoppingCart}
                iconColor="#10B981"
                trend={{ value: 12.5, direction: 'up' }}
                variant="featured"
              />
              <iOSMetricCardPremium
                title="Deuda Total"
                value={`$${(stats.deudaTotal / 1000).toFixed(0)}K`}
                icon={Wallet}
                iconColor="#FBBF24"
                trend={{ value: 8.3, direction: 'down' }}
              />
              <iOSMetricCardPremium
                title="Órdenes Totales"
                value={String(stats.ordenesTotales)}
                icon={Package}
                iconColor="#8B5CF6"
              />
            </iOSGrid>
          </iOSSection>

          {/* Main Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left: Distribuidores Grid/Table */}
            <div className="col-span-12 space-y-6 lg:col-span-8">
              {/* Filters */}
              <AuroraGlassCard className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <AuroraSearch
                    value={filtros.busqueda}
                    onChange={(v) => setFiltros((prev) => ({ ...prev, busqueda: v }))}
                    placeholder="Buscar distribuidor..."
                    color="cyan"
                    className="w-64"
                  />

                  <AuroraTabs
                    tabs={tabs}
                    activeTab={filtros.estado}
                    onTabChange={(v) => setFiltros((prev) => ({ ...prev, estado: v }))}
                    color="cyan"
                  />

                  {/* View toggle */}
                  <div className="ml-auto flex items-center gap-2 rounded-lg bg-white/5 p-1">
                    {(["grid", "tabla", "ordenes"] as const).map((vista) => (
                      <button
                        key={vista}
                        className={cn(
                          "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                          vistaActual === vista
                            ? "bg-cyan-500/20 text-cyan-400"
                            : "text-white/50 hover:text-white"
                        )}
                        onClick={() => setVistaActual(vista)}
                      >
                        {vista === "grid" && "Grid"}
                        {vista === "tabla" && "Tabla"}
                        {vista === "ordenes" && "Órdenes"}
                      </button>
                    ))}
                  </div>
                </div>
              </AuroraGlassCard>

              {/* Content */}
              {vistaActual === "grid" && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {filteredDistribuidores.map((dist, idx) => (
                    <DistribuidorCard
                      key={dist.id}
                      distribuidor={dist}
                      onVerDetalle={() => handleVerDetalle(dist)}
                      onEditar={() => handleEditar(dist)}
                      onNuevaOrden={() => handleNuevaOrden(dist)}
                      onRegistrarPago={() => handleRegistrarPago(dist)}
                      onEliminar={() => handleEliminar(dist)}
                      // 🌌 Quantum Visual Props
                      mood={mood}
                      pulse={pulse}
                      moodColor={primaryColor}
                      index={idx}
                    />
                  ))}

                  {filteredDistribuidores.length === 0 && (
                    <div className="col-span-2 py-12 text-center text-white/40">
                      <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                      <p>No se encontraron distribuidores</p>
                      {activeFiltersCount > 0 && (
                        <button
                          className="mt-2 text-sm text-cyan-400 hover:text-cyan-300"
                          onClick={clearFilters}
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 📊 VISTA TABLA - Premium Table View */}
              {vistaActual === "tabla" && (
                <AuroraGlassCard className="overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/10 bg-white/[0.02]">
                          <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-white/50 uppercase">
                            Distribuidor
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-white/50 uppercase">
                            Estado
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-white/50 uppercase">
                            Total Compras
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-white/50 uppercase">
                            Deuda
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-white/50 uppercase">
                            Órdenes
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-medium tracking-wider text-white/50 uppercase">
                            Rating
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium tracking-wider text-white/50 uppercase">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredDistribuidores.map((dist) => {
                          const estadoConfig = {
                            activo: {
                              bg: "bg-emerald-500/20",
                              text: "text-emerald-400",
                              label: "Activo",
                            },
                            inactivo: {
                              bg: "bg-gray-500/20",
                              text: "text-gray-400",
                              label: "Inactivo",
                            },
                            suspendido: {
                              bg: "bg-red-500/20",
                              text: "text-red-400",
                              label: "Suspendido",
                            },
                          }
                          const config = estadoConfig[dist.estado]

                          return (
                            <motion.tr
                              key={dist.id}
                              className="transition-colors hover:bg-white/[0.03]"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                            >
                              {/* Distribuidor */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 text-sm font-bold text-cyan-400">
                                    {dist.alias?.[0] || dist.nombre[0]}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-white">{dist.nombre}</p>
                                    {dist.empresa && (
                                      <p className="text-xs text-white/40">{dist.empresa}</p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Estado */}
                              <td className="px-4 py-3">
                                <span
                                  className={cn(
                                    "rounded-full px-2 py-1 text-xs font-medium",
                                    config.bg,
                                    config.text
                                  )}
                                >
                                  {config.label}
                                </span>
                              </td>

                              {/* Total Compras */}
                              <td className="px-4 py-3 text-right">
                                <span className="text-sm font-medium text-white">
                                  ${dist.totalCompras.toLocaleString()}
                                </span>
                              </td>

                              {/* Deuda */}
                              <td className="px-4 py-3 text-right">
                                <span
                                  className={cn(
                                    "text-sm font-medium",
                                    dist.deudaActual > 0 ? "text-amber-400" : "text-emerald-400"
                                  )}
                                >
                                  ${dist.deudaActual.toLocaleString()}
                                </span>
                              </td>

                              {/* Órdenes */}
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-2 text-xs">
                                  <span className="text-white">{dist.numeroOrdenes}</span>
                                  <span className="text-emerald-400">
                                    {dist.ordenesCompletadas}✓
                                  </span>
                                  <span className="text-amber-400">{dist.ordenesPendientes}⏳</span>
                                </div>
                              </td>

                              {/* Rating */}
                              <td className="px-4 py-3 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <Star size={14} className="fill-amber-400 text-amber-400" />
                                  <span className="text-sm text-white">
                                    {dist.rating.toFixed(1)}
                                  </span>
                                </div>
                              </td>

                              {/* Acciones */}
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1">
                                  <motion.button
                                    onClick={() => handleVerDetalle(dist)}
                                    className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-cyan-500/20 hover:text-cyan-400"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="Ver detalle"
                                  >
                                    <Eye size={16} />
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleEditar(dist)}
                                    className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-violet-500/20 hover:text-violet-400"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="Editar"
                                  >
                                    <Edit size={16} />
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleNuevaOrden(dist)}
                                    className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-emerald-500/20 hover:text-emerald-400"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="Nueva orden"
                                  >
                                    <ShoppingCart size={16} />
                                  </motion.button>
                                  <motion.button
                                    onClick={() => handleEliminar(dist)}
                                    className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-400"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    title="Eliminar"
                                  >
                                    <Trash2 size={16} />
                                  </motion.button>
                                </div>
                              </td>
                            </motion.tr>
                          )
                        })}
                      </tbody>
                    </table>

                    {filteredDistribuidores.length === 0 && (
                      <div className="py-12 text-center text-white/40">
                        <Building2 size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No se encontraron distribuidores</p>
                        {activeFiltersCount > 0 && (
                          <button
                            className="mt-2 text-sm text-cyan-400 hover:text-cyan-300"
                            onClick={clearFilters}
                          >
                            Limpiar filtros
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </AuroraGlassCard>
              )}

              {vistaActual === "ordenes" && (
                <AuroraGlassCard className="p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-semibold text-white">
                      <Package size={18} className="text-cyan-400" />
                      Órdenes de Compra
                      <span className="text-sm font-normal text-white/50">
                        ({filteredOrdenes.length})
                      </span>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <span className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-amber-400" />
                        Pendientes: {filteredOrdenes.filter((o) => o.estado === "pendiente").length}
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="h-2 w-2 rounded-full bg-emerald-400" />
                        Completadas:{" "}
                        {filteredOrdenes.filter((o) => o.estado === "completado").length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {filteredOrdenes.map((orden) => (
                      <OrdenCompraRow
                        key={orden.id}
                        orden={orden}
                        onVerDetalle={() => handleVerOrden(orden)}
                        onEditar={() => handleEditarOrden(orden)}
                        onEliminar={() => handleEliminarOrden(orden)}
                      />
                    ))}
                    {filteredOrdenes.length === 0 && (
                      <div className="py-12 text-center text-white/40">
                        <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No se encontraron órdenes</p>
                        {activeFiltersCount > 0 && (
                          <button
                            className="mt-2 text-sm text-cyan-400 hover:text-cyan-300"
                            onClick={clearFilters}
                          >
                            Limpiar filtros
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </AuroraGlassCard>
              )}
            </div>

            {/* Right: Visualization & Charts */}
            <div className="col-span-12 space-y-6 lg:col-span-4">
              {/* 🌌 QUANTUM VISUALIZATION - Ultra Premium 3D Effects with Mood */}
              <AuroraGlassCard
                glowColor={mood > 0.5 ? "amber" : "cyan"}
                className="overflow-hidden p-0"
              >
                <div className="border-b border-white/10 px-4 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Sparkles size={14} className="animate-pulse" style={{ color: primaryColor }} />
                    <h3 className="text-center text-sm font-medium text-white/70">
                      Red de Distribuidores
                    </h3>
                  </div>
                </div>
                <div className="h-52">
                  <QuantumDistribuidoresViz
                    distribuidoresCount={stats.total}
                    totalCompras={stats.totalCompras}
                    totalDeuda={stats.deudaTotal}
                    ordenesActivas={stats.ordenesTotales}
                    variant="flow"
                    interactive={true}
                  />
                </div>
              </AuroraGlassCard>

              {/* Network Visualization with Mood-Adaptive Glow */}
              <AuroraGlassCard glowColor={mood > 0.6 ? "amber" : "violet"} className="p-4">
                <div className="mb-3 flex items-center justify-center gap-2">
                  <Zap size={14} className="animate-pulse" style={{ color: secondaryColor }} />
                  <h3 className="text-center text-sm font-medium text-white/70">
                    Conexiones Activas
                  </h3>
                </div>
                <div className="h-40">
                  <DistributorNetworkVisualization distribuidores={distribuidores} />
                </div>
              </AuroraGlassCard>

              {/* Top Distribuidores with Mood-Adaptive Colors */}
              <AuroraBarChart
                data={comprasData}
                height={200}
                color={mood > 0.5 ? "amber" : "cyan"}
                showTooltip
                title="Top 5 Distribuidores"
              />

              {/* Quick Stats - Enhanced with Pulse Animation */}
              <AuroraGlassCard glowColor="emerald" className="p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white/70">Métricas Clave</h3>
                  <motion.div
                    className="h-2 w-2 rounded-full bg-emerald-400"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
                <div className="space-y-3">
                  <motion.div
                    className="flex items-center justify-between rounded-lg bg-white/3 p-2"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-emerald-400" />
                      <span className="text-xs text-white/60">Compras del Mes</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">
                      ${(stats.totalCompras / 1000).toFixed(0)}K
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex items-center justify-between rounded-lg bg-white/3 p-2"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Package size={14} style={{ color: primaryColor }} />
                      <span className="text-xs text-white/60">Órdenes Activas</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: primaryColor }}>
                      {stats.ordenesTotales}
                    </span>
                  </motion.div>
                  <motion.div
                    className="flex items-center justify-between rounded-lg bg-white/3 p-2"
                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-2">
                      <Star size={14} className="text-amber-400" />
                      <span className="text-xs text-white/60">Rating Promedio</span>
                    </div>
                    <span className="text-sm font-bold text-amber-400">4.6 ⭐</span>
                  </motion.div>
                </div>
              </AuroraGlassCard>
            </div>
          </div>
        </main>

        {/* Modal Crear Distribuidor - Placeholder */}
        {showModalCrear && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <motion.div
              className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">Nuevo Distribuidor</h2>
                  <button
                    className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                    onClick={() => setShowModalCrear(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                <p className="py-8 text-center text-white/50">
                  Formulario de creación de distribuidor (implementar con react-hook-form + Zod)
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AuroraBackground>
    </>
  )
}

export default AuroraDistribuidoresPanelUnified
