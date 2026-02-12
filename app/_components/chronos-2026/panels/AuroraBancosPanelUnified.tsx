"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🏦✨ AURORA BANCOS PANEL UNIFIED — CHRONOS INFINITY 2026 PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de Bancos/Bóvedas ultra premium con diseño unificado basado en AuroraMovimientosPanel:
 * - Glassmorphism con efectos aurora boreal
 * - Cards de bancos con capital en tiempo real
 * - Visualización de flujo de capital animada con Canvas 60fps
 * - Distribución automática de ventas visual
 * - Timeline de movimientos por banco
 * - KPIs con tendencias
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { useBancosData } from "@/app/hooks/useDataHooks"
import { logger } from "@/app/lib/utils/logger"
import { AnimatePresence, motion } from "framer-motion"
import {
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleDollarSign,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Globe,
  Landmark,
  Loader2,
  PiggyBank,
  RefreshCw,
  Scissors,
  Send,
  Shield,
  Sparkles,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  Truck,
  Wallet,
  X,
} from "lucide-react"
import dynamic from "next/dynamic"
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react"

// Server Actions
import {
  realizarCorte,
  registrarGasto,
  registrarIngreso,
  transferirEntreBancos,
} from "@/app/_actions/bancos"

// Modales de Movimientos
import {
  DetalleMovimientoModal,
  EditarMovimientoModal,
  EliminarMovimientoModal,
} from "@/app/_components/modals/MovimientoModals"

// Aurora Glass System
import {
  AuroraBackground,
  AuroraBadge,
  AuroraButton,
  AuroraGlassCard,
  AuroraSearch,
  AuroraStatWidget,
  AuroraTabs,
} from "../../ui/AuroraGlassSystem"

// 🍎 iOS PREMIUM SYSTEM 2026 — Sistema de UI definitivo
import {
  iOSScrollContainer,
  iOSSection,
  iOSGrid,
  iOSMetricCardPremium,
  iOSEntityCard,
  useToastAdvanced,
  iOSConfirm,
} from "../../ui/ios"

// Aurora Charts - Lazy Loaded for performance
const AuroraAreaChart = dynamic(
  () => import("../../charts/AuroraPremiumCharts").then((mod) => mod.AuroraAreaChart),
  {
    loading: () => <div className="h-[200px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  }
)

// Cosmic 3D Charts - Advanced visualizations
const GaugeDualChart = dynamic(
  () => import("../../charts/Cosmic3DCharts").then((mod) => mod.GaugeDualChart),
  {
    loading: () => <div className="h-[200px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  }
)

// Toast notifications
import { toast } from "sonner"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 SUPREME SYSTEMS — CHRONOS INFINITY 2026 (QUANTUM OPTIMIZED)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import "@/app/_components/chronos-2026/animations/CinematicAnimations"
import { useSmoothScroll } from "@/app/_components/chronos-2026/scroll/SmoothScrollSystem"

// 🌌 SUPREME SHADER SYSTEM — ELITE 2026
import { SupremeBancosBackground } from "./SupremePanelBackgrounds"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type BancoId =
  | "boveda_monte"
  | "boveda_usa"
  | "profit"
  | "leftie"
  | "azteca"
  | "flete_sur"
  | "utilidades"

interface Banco {
  id: BancoId
  nombre: string
  descripcion: string
  capitalActual: number
  historicoIngresos: number
  historicoGastos: number
  ultimoMovimiento: string
  tendencia: "up" | "down" | "neutral"
  porcentajeCambio: number
}

type TipoMovimiento =
  | "ingreso"
  | "gasto"
  | "transferencia_entrada"
  | "transferencia_salida"
  | "corte"
type TabOperacional = "ingresos" | "gastos" | "transferencias" | "cortes"

interface MovimientoBanco {
  id: string
  fecha: string
  hora: string
  bancoId: BancoId
  bancoOrigenId?: BancoId
  bancoDestinoId?: BancoId
  tipo: TipoMovimiento
  monto: number
  concepto: string
  referencia?: string
  estado?: "completado" | "pendiente" | "cancelado"
  categoria?: string
  notas?: string
}

interface AuroraBancosPanelUnifiedProps {
  bancos?: Banco[]
  movimientos?: MovimientoBanco[]
  onNuevoMovimiento?: () => void
  onTransferencia?: () => void
  onVerBanco?: (_banco: Banco) => void
  onRefresh?: () => void
  loading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const BANCO_CONFIG: Record<
  BancoId,
  {
    icon: React.ReactNode
    color: string
    gradient: string
    bgGlow: string
  }
> = {
  boveda_monte: {
    icon: <Landmark size={20} />,
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    bgGlow: "rgba(139, 92, 246, 0.2)",
  },
  boveda_usa: {
    icon: <Globe size={20} />,
    color: "#06B6D4",
    gradient: "linear-gradient(135deg, #06B6D4, #0891B2)",
    bgGlow: "rgba(6, 182, 212, 0.2)",
  },
  profit: {
    icon: <TrendingUp size={20} />,
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981, #059669)",
    bgGlow: "rgba(16, 185, 129, 0.2)",
  },
  leftie: {
    icon: <PiggyBank size={20} />,
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
    bgGlow: "rgba(245, 158, 11, 0.2)",
  },
  azteca: {
    icon: <Shield size={20} />,
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899, #DB2777)",
    bgGlow: "rgba(236, 72, 153, 0.2)",
  },
  flete_sur: {
    icon: <Truck size={20} />,
    color: "#14B8A6",
    gradient: "linear-gradient(135deg, #14B8A6, #0D9488)",
    bgGlow: "rgba(20, 184, 166, 0.2)",
  },
  utilidades: {
    icon: <Sparkles size={20} />,
    color: "#A855F7",
    gradient: "linear-gradient(135deg, #A855F7, #9333EA)",
    bgGlow: "rgba(168, 85, 247, 0.2)",
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧹 SISTEMA LIMPIO - Sin datos mock (Conectado a Turso)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const _defaultBancos: Banco[] = []

const defaultMovimientos: MovimientoBanco[] = []

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 CAPITAL FLOW VISUALIZATION — Animated money flow between banks
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function CapitalFlowVisualization({ bancos }: { bancos: Banco[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)
  const particlesRef = useRef<MoneyParticle[]>([])

  // Tipos para el sistema de partículas
  interface MoneyParticle {
    id: number
    fromIndex: number
    toIndex: number
    progress: number
    speed: number
    size: number
    amount: number
    type: "ingreso" | "gasto" | "transferencia"
    color: string
    trail: { x: number; y: number; alpha: number }[]
  }

  interface _FlowAnimation {
    id: string
    fromBank: BancoId
    toBank: BancoId | "center"
    amount: number
    type: "ingreso" | "gasto" | "transferencia"
    startTime: number
    duration: number
  }

  interface BankNode {
    x: number
    y: number
    color: string
    capital: number
    name: string
    id: BancoId
    pulsePhase: number
    sparkles: { x: number; y: number; life: number; maxLife: number }[]
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // High DPI setup
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

    // Bank nodes in circular layout with enhanced data
    const nodes: BankNode[] = bancos.map((banco, i) => {
      const angle = (i / bancos.length) * Math.PI * 2 - Math.PI / 2
      const radius = Math.min(rect.width, rect.height) * 0.32
      const config = BANCO_CONFIG[banco.id as BancoId] ?? BANCO_CONFIG["boveda_monte"]
      return {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        color: config?.color ?? "#8B5CF6",
        capital: banco.capitalActual,
        name: banco.nombre.split(" ")[0] ?? "",
        id: banco.id,
        pulsePhase: Math.random() * Math.PI * 2,
        sparkles: [],
      }
    })

    // Initialize particles with rich data
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 20; i++) {
        const types: Array<"ingreso" | "gasto" | "transferencia"> = [
          "ingreso",
          "gasto",
          "transferencia",
        ]
        const type = types[Math.floor(Math.random() * types.length)] ?? "ingreso"
        particlesRef.current.push({
          id: i,
          fromIndex: Math.floor(Math.random() * nodes.length),
          toIndex: Math.floor(Math.random() * nodes.length),
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.004,
          size: 4 + Math.random() * 4,
          amount: Math.floor(Math.random() * 50000) + 1000,
          type,
          color: type === "ingreso" ? "#10B981" : type === "gasto" ? "#EF4444" : "#8B5CF6",
          trail: [],
        })
      }
    }

    // Draw functions
    const drawAuroraBackground = () => {
      // Subtle aurora waves
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        rect.width * 0.6
      )
      gradient.addColorStop(0, "rgba(139, 92, 246, 0.03)")
      gradient.addColorStop(0.3, "rgba(6, 182, 212, 0.02)")
      gradient.addColorStop(0.6, "rgba(16, 185, 129, 0.02)")
      gradient.addColorStop(1, "transparent")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Animated aurora waves
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(0, centerY + Math.sin(timeRef.current * 0.5 + i) * 30)
        for (let x = 0; x < rect.width; x += 20) {
          const y = centerY + Math.sin(timeRef.current * 0.5 + x * 0.01 + i * 2) * (20 + i * 10)
          ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.03 - i * 0.01})`
        ctx.lineWidth = 40 - i * 10
        ctx.stroke()
      }
    }

    const drawCentralHub = () => {
      // Outer rotating ring
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(timeRef.current * 0.3)

      // Segmented ring
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2
        const nextAngle = ((i + 1) / 12) * Math.PI * 2 - 0.1
        ctx.beginPath()
        ctx.arc(0, 0, 35, angle, nextAngle)
        ctx.strokeStyle = i % 2 === 0 ? "rgba(139, 92, 246, 0.4)" : "rgba(6, 182, 212, 0.3)"
        ctx.lineWidth = 3
        ctx.stroke()
      }
      ctx.restore()

      // Central pulsing glow layers
      for (let layer = 3; layer >= 0; layer--) {
        const pulse = Math.sin(timeRef.current * 2) * 5 + layer * 8
        const glow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 25 + pulse)
        const alpha = 0.4 - layer * 0.1
        glow.addColorStop(0, `rgba(139, 92, 246, ${alpha})`)
        glow.addColorStop(0.5, `rgba(139, 92, 246, ${alpha * 0.5})`)
        glow.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.arc(centerX, centerY, 25 + pulse, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
      }

      // Central hub solid
      const hubGradient = ctx.createRadialGradient(
        centerX - 5,
        centerY - 5,
        0,
        centerX,
        centerY,
        22
      )
      hubGradient.addColorStop(0, "#A78BFA")
      hubGradient.addColorStop(0.5, "#8B5CF6")
      hubGradient.addColorStop(1, "#6D28D9")
      ctx.beginPath()
      ctx.arc(centerX, centerY, 22, 0, Math.PI * 2)
      ctx.fillStyle = hubGradient
      ctx.fill()

      // Dollar sign with glow
      ctx.shadowColor = "#ffffff"
      ctx.shadowBlur = 10
      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 18px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("$", centerX, centerY)
      ctx.shadowBlur = 0
    }

    const drawConnections = () => {
      nodes.forEach((node, i) => {
        // Animated dashed line to center
        ctx.beginPath()
        ctx.setLineDash([5, 5])
        ctx.lineDashOffset = -timeRef.current * 20

        // Bezier curve for organic look
        const midX = (centerX + node.x) / 2
        const midY = (centerY + node.y) / 2 + Math.sin(timeRef.current + i) * 5

        ctx.moveTo(centerX, centerY)
        ctx.quadraticCurveTo(midX, midY, node.x, node.y)

        const gradient = ctx.createLinearGradient(centerX, centerY, node.x, node.y)
        gradient.addColorStop(0, "rgba(139, 92, 246, 0.3)")
        gradient.addColorStop(0.5, node.color + "40")
        gradient.addColorStop(1, node.color + "20")

        ctx.strokeStyle = gradient
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.setLineDash([])
      })
    }

    const drawBankNodes = () => {
      nodes.forEach((node) => {
        // Update sparkles
        if (Math.random() < 0.02) {
          node.sparkles.push({
            x: node.x + (Math.random() - 0.5) * 30,
            y: node.y + (Math.random() - 0.5) * 30,
            life: 1,
            maxLife: 1,
          })
        }
        node.sparkles = node.sparkles.filter((s) => {
          s.life -= 0.02
          return s.life > 0
        })

        // Draw sparkles
        node.sparkles.forEach((s) => {
          ctx.beginPath()
          ctx.arc(s.x, s.y, 2 * s.life, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 255, 255, ${s.life * 0.5})`
          ctx.fill()
        })

        // Pulsing outer glow based on capital
        const capitalRatio = Math.min(node.capital / 500000, 1)
        const pulseIntensity = 0.3 + capitalRatio * 0.4
        const pulse = Math.sin(timeRef.current * 2 + node.pulsePhase) * 4

        // Multi-layer glow
        for (let layer = 2; layer >= 0; layer--) {
          const radius = 18 + pulse + layer * 6
          const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius)
          glow.addColorStop(
            0,
            node.color +
              Math.floor((pulseIntensity - layer * 0.1) * 255)
                .toString(16)
                .padStart(2, "0")
          )
          glow.addColorStop(0.6, node.color + "20")
          glow.addColorStop(1, "transparent")
          ctx.beginPath()
          ctx.arc(node.x, node.y, radius, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()
        }

        // Bank node with gradient
        const nodeGradient = ctx.createRadialGradient(node.x - 3, node.y - 3, 0, node.x, node.y, 14)
        nodeGradient.addColorStop(0, node.color)
        nodeGradient.addColorStop(1, node.color + "CC")
        ctx.beginPath()
        ctx.arc(node.x, node.y, 14, 0, Math.PI * 2)
        ctx.fillStyle = nodeGradient
        ctx.fill()

        // Border
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
        ctx.lineWidth = 1
        ctx.stroke()

        // Capital indicator ring
        ctx.beginPath()
        ctx.arc(node.x, node.y, 17, -Math.PI / 2, -Math.PI / 2 + capitalRatio * Math.PI * 2)
        ctx.strokeStyle = node.color
        ctx.lineWidth = 2
        ctx.stroke()

        // Bank initial
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 10px Inter, sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(node.name.charAt(0), node.x, node.y)

        // Label with capital
        const labelY = node.y < centerY ? node.y - 28 : node.y + 28
        ctx.font = "10px Inter, sans-serif"
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
        ctx.fillText(node.name, node.x, labelY)

        // Capital amount
        ctx.font = "8px Inter, sans-serif"
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
        const capitalText = `$${(node.capital / 1000).toFixed(0)}K`
        ctx.fillText(capitalText, node.x, labelY + (node.y < centerY ? -10 : 10))
      })
    }

    const drawMoneyParticles = () => {
      particlesRef.current.forEach((p) => {
        p.progress += p.speed
        if (p.progress > 1) {
          p.progress = 0
          p.fromIndex = Math.floor(Math.random() * nodes.length)
          p.toIndex = Math.floor(Math.random() * nodes.length)
          p.amount = Math.floor(Math.random() * 50000) + 1000
          const types: Array<"ingreso" | "gasto" | "transferencia"> = [
            "ingreso",
            "gasto",
            "transferencia",
          ]
          p.type = types[Math.floor(Math.random() * types.length)] ?? "ingreso"
          p.color = p.type === "ingreso" ? "#10B981" : p.type === "gasto" ? "#EF4444" : "#8B5CF6"
          p.trail = []
        }

        const from = nodes[p.fromIndex]
        const to = nodes[p.toIndex]
        if (!from || !to || p.fromIndex === p.toIndex) return

        // Calculate position with smooth bezier through center
        let x: number, y: number
        const t = p.progress

        if (t < 0.5) {
          const localT = t * 2
          const easeT = localT * localT * (3 - 2 * localT) // smoothstep
          x = from.x + (centerX - from.x) * easeT
          y = from.y + (centerY - from.y) * easeT
        } else {
          const localT = (t - 0.5) * 2
          const easeT = localT * localT * (3 - 2 * localT)
          x = centerX + (to.x - centerX) * easeT
          y = centerY + (to.y - centerY) * easeT
        }

        // Add to trail
        p.trail.push({ x, y, alpha: 1 })
        if (p.trail.length > 12) p.trail.shift()

        // Draw trail with gradient
        if (p.trail.length > 1) {
          ctx.beginPath()
          ctx.moveTo(p.trail[0]?.x ?? x, p.trail[0]?.y ?? y)
          p.trail.forEach((point, idx) => {
            point.alpha = idx / p.trail.length
            ctx.lineTo(point.x, point.y)
          })
          const trailGradient = ctx.createLinearGradient(
            p.trail[0]?.x ?? x,
            p.trail[0]?.y ?? y,
            x,
            y
          )
          trailGradient.addColorStop(0, "transparent")
          trailGradient.addColorStop(1, p.color + "80")
          ctx.strokeStyle = trailGradient
          ctx.lineWidth = p.size * 0.8
          ctx.lineCap = "round"
          ctx.stroke()
        }

        // Main particle with glow
        const particleGlow = ctx.createRadialGradient(x, y, 0, x, y, p.size * 2)
        particleGlow.addColorStop(0, p.color)
        particleGlow.addColorStop(0.5, p.color + "60")
        particleGlow.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.arc(x, y, p.size * 2, 0, Math.PI * 2)
        ctx.fillStyle = particleGlow
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(x, y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()

        // Dollar sign on larger particles
        if (p.size > 5) {
          ctx.fillStyle = "#ffffff"
          ctx.font = `bold ${Math.floor(p.size)}px sans-serif`
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText("$", x, y)
        }
      })
    }

    const drawStats = () => {
      // Total capital display
      const totalCapital = bancos.reduce((sum, b) => sum + b.capitalActual, 0)

      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.font = "10px Inter, sans-serif"
      ctx.textAlign = "left"
      ctx.fillText("Capital Total", 10, 20)

      ctx.fillStyle = "#ffffff"
      ctx.font = "bold 14px Inter, sans-serif"
      ctx.fillText(`$${(totalCapital / 1000).toFixed(0)}K`, 10, 38)

      // Active flows indicator
      const activeParticles = particlesRef.current.filter(
        (p) => p.progress > 0 && p.progress < 1
      ).length
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"
      ctx.font = "10px Inter, sans-serif"
      ctx.textAlign = "right"
      ctx.fillText("Flujos Activos", rect.width - 10, 20)

      ctx.fillStyle = "#10B981"
      ctx.font = "bold 14px Inter, sans-serif"
      ctx.fillText(`${activeParticles}`, rect.width - 10, 38)
    }

    const animate = () => {
      timeRef.current += 0.016

      // Clear with fade effect
      ctx.fillStyle = "rgba(3, 3, 8, 0.15)"
      ctx.fillRect(0, 0, rect.width, rect.height)

      drawAuroraBackground()
      drawConnections()
      drawCentralHub()
      drawBankNodes()
      drawMoneyParticles()
      drawStats()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [bancos])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full rounded-xl"
      style={{
        background: "linear-gradient(135deg, rgba(3,3,8,0.95) 0%, rgba(15,10,30,0.95) 100%)",
      }}
      role="img"
      aria-label="Visualización interactiva de bancos y bóvedas del sistema CHRONOS con flujo de capital en tiempo real"
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🏦 BANCO CARD — Individual bank card with PREMIUM effects
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface BancoCardProps {
  banco: Banco
  onVerDetalle?: () => void
}

function BancoCard({ banco, onVerDetalle }: BancoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  // Validación defensiva: usar config por defecto si el banco no existe
  const config = BANCO_CONFIG[banco.id] ?? {
    icon: <Landmark size={20} />,
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
    bgGlow: "rgba(139, 92, 246, 0.2)",
  }

  return (
    <motion.div
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl p-5 transition-all duration-500",
        "border border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent",
        "backdrop-blur-xl",
        "hover:border-white/15"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onVerDetalle}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      style={{
        boxShadow: isHovered
          ? `0 20px 40px ${config.bgGlow}, 0 0 60px ${config.bgGlow}`
          : "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: config.gradient,
          opacity: isHovered ? 0.12 : 0,
        }}
      />

      {/* Header */}
      <div className="relative mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
            style={{ background: config.gradient }}
          >
            {config.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{banco.nombre}</p>
            <p className="text-xs text-white/40">{banco.descripcion}</p>
          </div>
        </div>

        {/* Trend badge */}
        <div
          className={cn(
            "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium",
            banco.tendencia === "up" && "bg-emerald-500/20 text-emerald-400",
            banco.tendencia === "down" && "bg-red-500/20 text-red-400",
            banco.tendencia === "neutral" && "bg-white/10 text-white/50"
          )}
        >
          {banco.tendencia === "up" && <TrendingUp size={12} />}
          {banco.tendencia === "down" && <TrendingDown size={12} />}
          {banco.porcentajeCambio !== 0 && (
            <span>
              {banco.porcentajeCambio > 0 ? "+" : ""}
              {banco.porcentajeCambio}%
            </span>
          )}
        </div>
      </div>

      {/* Capital */}
      <div className="relative mb-3">
        <p className="mb-1 text-xs text-white/40">Capital Actual</p>
        <motion.p
          className="text-2xl font-bold"
          style={{ color: config.color }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          ${banco.capitalActual.toLocaleString()}
        </motion.p>
      </div>

      {/* Stats */}
      <div className="relative flex justify-between text-xs">
        <div>
          <span className="text-white/40">Ingresos</span>
          <p className="font-medium text-emerald-400">
            ${(banco.historicoIngresos / 1000).toFixed(0)}K
          </p>
        </div>
        <div className="text-right">
          <span className="text-white/40">Gastos</span>
          <p className="font-medium text-red-400">${(banco.historicoGastos / 1000).toFixed(0)}K</p>
        </div>
      </div>

      {/* Last update */}
      <div className="relative mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-xs">
        <span className="text-white/30">Último mov: {banco.ultimoMovimiento}</span>
        <ChevronRight
          size={14}
          className="text-white/30 transition-transform group-hover:translate-x-1"
        />
      </div>

      {/* Premium shimmer effect on hover */}
      <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 MOVIMIENTO BANCO ITEM — Bank movement timeline item
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function MovimientoBancoItem({
  movimiento,
  isFirst,
  isLast,
}: {
  movimiento: MovimientoBanco
  isFirst?: boolean
  isLast?: boolean
}) {
  const bancoConfig = BANCO_CONFIG[movimiento.bancoId as BancoId] ?? BANCO_CONFIG["boveda_monte"]
  const tipoConfig: Record<
    TipoMovimiento,
    { color: string; icon: React.ReactNode; label: string }
  > = {
    ingreso: {
      color: "#10B981",
      icon: <ArrowDownRight size={14} />,
      label: "Ingreso",
    },
    gasto: {
      color: "#EF4444",
      icon: <ArrowUpRight size={14} />,
      label: "Gasto",
    },
    transferencia_entrada: {
      color: "#06B6D4",
      icon: <ArrowDownRight size={14} />,
      label: "Transferencia Entrada",
    },
    transferencia_salida: {
      color: "#8B5CF6",
      icon: <ArrowRight size={14} />,
      label: "Transferencia Salida",
    },
    corte: {
      color: "#F59E0B",
      icon: <Scissors size={14} />,
      label: "Corte",
    },
  }

  const tipo = tipoConfig[movimiento.tipo] || {
    color: "#9CA3AF",
    icon: <AlertCircle size={14} />,
    label: "Desconocido",
  }

  return (
    <div className="relative flex gap-3">
      {/* Timeline */}
      <div className="relative flex flex-col items-center">
        {!isFirst && (
          <div className="absolute -top-2 h-2 w-0.5" style={{ background: `${tipo.color}30` }} />
        )}
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            background: `${tipo.color}20`,
            border: `1px solid ${tipo.color}40`,
          }}
        >
          <span style={{ color: tipo.color }}>{tipo.icon}</span>
        </div>
        {!isLast && (
          <div className="min-h-[20px] w-0.5 flex-1" style={{ background: `${tipo.color}20` }} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 pb-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-medium text-white">{movimiento.concepto}</p>
              <span
                className="rounded px-1.5 py-0.5 text-xs"
                style={{
                  background: `${bancoConfig?.color ?? "#8B5CF6"}20`,
                  color: bancoConfig?.color ?? "#8B5CF6",
                }}
              >
                {movimiento.bancoId
                  .split("_")
                  .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                  .join(" ")}
              </span>
            </div>
            <p className="mt-1 text-xs text-white/30">
              {movimiento.fecha} {movimiento.hora}
            </p>
          </div>
          <span className="text-sm font-bold" style={{ color: tipo.color }}>
            {movimiento.tipo === "gasto" ? "-" : "+"}${movimiento.monto.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 TABLA OPERACIONAL — Tabla de movimientos por tipo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TablaOperacionalProps {
  movimientos: MovimientoBanco[]
  tipoFiltro: TabOperacional
  bancoFiltro: BancoId | "todos"
  onEditar?: (_mov: MovimientoBanco) => void
  onEliminar?: (_mov: MovimientoBanco) => void
  onVerDetalle?: (_mov: MovimientoBanco) => void
}

function TablaOperacional({
  movimientos,
  tipoFiltro,
  bancoFiltro,
  onEditar,
  onEliminar,
  onVerDetalle,
}: TablaOperacionalProps) {
  const [_menuAbierto, _setMenuAbierto] = useState<string | null>(null)

  // Filtrar movimientos por tipo
  const movimientosFiltrados = useMemo(() => {
    let filtered = movimientos

    // Filtrar por tipo de tab
    switch (tipoFiltro) {
      case "ingresos":
        filtered = filtered.filter(
          (m) => m.tipo === "ingreso" || m.tipo === "transferencia_entrada"
        )
        break
      case "gastos":
        filtered = filtered.filter((m) => m.tipo === "gasto" || m.tipo === "transferencia_salida")
        break
      case "transferencias":
        filtered = filtered.filter(
          (m) => m.tipo === "transferencia_entrada" || m.tipo === "transferencia_salida"
        )
        break
      case "cortes":
        filtered = filtered.filter((m) => m.tipo === "corte")
        break
    }

    // Filtrar por banco
    if (bancoFiltro !== "todos") {
      filtered = filtered.filter((m) => m.bancoId === bancoFiltro)
    }

    return filtered.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  }, [movimientos, tipoFiltro, bancoFiltro])

  const getEstadoBadge = (estado?: string) => {
    switch (estado) {
      case "completado":
        return (
          <AuroraBadge color="emerald" size="sm">
            Completado
          </AuroraBadge>
        )
      case "pendiente":
        return (
          <AuroraBadge color="gold" size="sm">
            Pendiente
          </AuroraBadge>
        )
      case "cancelado":
        return (
          <AuroraBadge color="magenta" size="sm">
            Cancelado
          </AuroraBadge>
        )
      default:
        return (
          <AuroraBadge color="cyan" size="sm">
            -
          </AuroraBadge>
        )
    }
  }

  const getTipoBadge = (tipo: TipoMovimiento) => {
    const config: Record<
      TipoMovimiento,
      { color: "emerald" | "magenta" | "violet" | "cyan" | "gold"; label: string }
    > = {
      ingreso: { color: "emerald", label: "Ingreso" },
      gasto: { color: "magenta", label: "Gasto" },
      transferencia_entrada: { color: "cyan", label: "T. Entrada" },
      transferencia_salida: { color: "violet", label: "T. Salida" },
      corte: { color: "gold", label: "Corte" },
    }
    const c = config[tipo] || { color: "cyan", label: tipo || "Desconocido" }
    return (
      <AuroraBadge color={c.color as any} size="sm">
        {c.label}
      </AuroraBadge>
    )
  }

  if (movimientosFiltrados.length === 0) {
    return (
      <div className="py-12 text-center">
        <FileText size={48} className="mx-auto mb-4 text-white/20" />
        <p className="text-white/40">No hay movimientos de este tipo</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Fecha</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Concepto</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Banco</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Tipo</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-white/50">Monto</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-white/50">Estado</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-white/50">Referencia</th>
            <th className="px-4 py-3 text-center text-xs font-medium text-white/50">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movimientosFiltrados.map((mov, idx) => {
            const bancoConfig = BANCO_CONFIG[mov.bancoId as BancoId] ?? BANCO_CONFIG["boveda_monte"]
            const isGasto = mov.tipo === "gasto" || mov.tipo === "transferencia_salida"

            return (
              <tr
                key={mov.id}
                className="border-b border-white/5 transition-colors hover:bg-white/[0.03]"
              >
                <td className="px-4 py-3">
                  <div className="text-sm text-white">{mov.fecha}</div>
                  <div className="text-xs text-white/40">{mov.hora}</div>
                </td>
                <td className="px-4 py-3">
                  <p className="line-clamp-1 text-sm text-white">{mov.concepto}</p>
                  {mov.categoria && <p className="mt-0.5 text-xs text-white/40">{mov.categoria}</p>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex h-6 w-6 items-center justify-center rounded-md text-white"
                      style={{ background: bancoConfig?.gradient }}
                    >
                      {bancoConfig?.icon}
                    </div>
                    <span className="text-sm text-white/70">
                      {mov.bancoId
                        .split("_")
                        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                        .join(" ")}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">{getTipoBadge(mov.tipo)}</td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      "text-sm font-semibold",
                      isGasto ? "text-red-400" : "text-emerald-400"
                    )}
                  >
                    {isGasto ? "-" : "+"}${mov.monto.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">{getEstadoBadge(mov.estado)}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs text-white/40">{mov.referencia || "-"}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onVerDetalle?.(mov)}
                      className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => onEditar?.(mov)}
                      className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-violet-500/20 hover:text-violet-400"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => onEliminar?.(mov)}
                      className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Resumen de tabla */}
      <div className="mt-4 flex items-center justify-between border-t border-white/10 px-4 pt-4">
        <span className="text-sm text-white/40">
          {movimientosFiltrados.length} movimiento{movimientosFiltrados.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-6">
          <div>
            <span className="text-xs text-white/40">Total Ingresos: </span>
            <span className="text-sm font-semibold text-emerald-400">
              $
              {movimientosFiltrados
                .filter((m) => m.tipo === "ingreso" || m.tipo === "transferencia_entrada")
                .reduce((sum, m) => sum + m.monto, 0)
                .toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-xs text-white/40">Total Egresos: </span>
            <span className="text-sm font-semibold text-red-400">
              $
              {movimientosFiltrados
                .filter((m) => m.tipo === "gasto" || m.tipo === "transferencia_salida")
                .reduce((sum, m) => sum + m.monto, 0)
                .toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💰 MODAL NUEVO INGRESO — Formulario para registrar ingreso
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ModalNuevoIngresoProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (_data: Omit<MovimientoBanco, "id">) => void
  bancos: Banco[]
}

const CATEGORIAS_INGRESO = [
  { id: "ventas", label: "Ventas", icon: "💰" },
  { id: "abonos", label: "Abonos", icon: "💳" },
  { id: "depositos", label: "Depósitos", icon: "🏦" },
  { id: "ganancias", label: "Ganancias", icon: "📈" },
  { id: "fletes", label: "Fletes", icon: "🚚" },
  { id: "otros", label: "Otros", icon: "📋" },
]

function ModalNuevoIngreso({ isOpen, onClose, onSubmit, bancos }: ModalNuevoIngresoProps) {
  const [formData, setFormData] = useState({
    bancoId: "boveda_monte" as BancoId,
    monto: "",
    concepto: "",
    referencia: "",
    categoria: "ventas",
    notas: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!formData.monto || parseFloat(formData.monto) <= 0) {
      newErrors.monto = "El monto debe ser mayor a 0"
    }
    if (!formData.concepto.trim()) {
      newErrors.concepto = "El concepto es requerido"
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setLoading(true)
    const now = new Date()
    const movimiento: Omit<MovimientoBanco, "id"> = {
      bancoId: formData.bancoId,
      tipo: "ingreso",
      monto: parseFloat(formData.monto),
      concepto: formData.concepto,
      referencia: formData.referencia || undefined,
      categoria: formData.categoria,
      notas: formData.notas || undefined,
      fecha: now.toISOString().split("T")[0] ?? "",
      hora: now.toTimeString().slice(0, 5),
      estado: "completado",
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
    onSubmit(movimiento)
    setLoading(false)
    setFormData({
      bancoId: "boveda_monte",
      monto: "",
      concepto: "",
      referencia: "",
      categoria: "ventas",
      notas: "",
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          className="relative z-[1] w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-emerald-500/10 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20">
                  <ArrowDownRight className="text-emerald-400" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nuevo Ingreso</h2>
                  <p className="text-sm text-white/50">Registrar entrada de capital</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <Landmark size={14} className="mr-2 inline" />
                Banco Destino
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bancos.slice(0, 8).map((banco) => {
                  const config = BANCO_CONFIG[banco.id as BancoId] ?? BANCO_CONFIG["boveda_monte"]
                  const isSelected = formData.bancoId === banco.id
                  return (
                    <motion.button
                      key={banco.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, bancoId: banco.id }))}
                      className={cn(
                        "rounded-xl border p-2 text-center transition-all",
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg text-white"
                        style={{ background: config?.gradient }}
                      >
                        {config?.icon}
                      </div>
                      <span className="line-clamp-1 text-xs text-white/70">
                        {banco.nombre.split(" ")[0]}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <DollarSign size={14} className="mr-2 inline" />
                Monto
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-emerald-400">
                  $
                </span>
                <input
                  type="number"
                  value={formData.monto}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, monto: e.target.value }))
                    setErrors((prev) => ({ ...prev, monto: "" }))
                  }}
                  className={cn(
                    "w-full rounded-xl border bg-white/5 py-3 pr-4 pl-10 text-lg font-semibold text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none",
                    errors.monto ? "border-red-500" : "border-white/10"
                  )}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.monto && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} /> {errors.monto}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <FileText size={14} className="mr-2 inline" />
                Concepto
              </label>
              <input
                type="text"
                value={formData.concepto}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, concepto: e.target.value }))
                  setErrors((prev) => ({ ...prev, concepto: "" }))
                }}
                className={cn(
                  "w-full rounded-xl border bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none",
                  errors.concepto ? "border-red-500" : "border-white/10"
                )}
                placeholder="Descripción del ingreso..."
              />
              {errors.concepto && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} /> {errors.concepto}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <Tag size={14} className="mr-2 inline" />
                Categoría
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIAS_INGRESO.map((cat) => (
                  <motion.button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, categoria: cat.id }))}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-2 text-sm transition-all",
                      formData.categoria === cat.id
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Referencia (opcional)
              </label>
              <input
                type="text"
                value={formData.referencia}
                onChange={(e) => setFormData((prev) => ({ ...prev, referencia: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                placeholder="Ej: V-001, DEP-123..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10"
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3 font-medium text-white disabled:opacity-50"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                {loading ? "Guardando..." : "Registrar Ingreso"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💸 MODAL NUEVO GASTO — Formulario para registrar gasto
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ModalNuevoGastoProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (_data: Omit<MovimientoBanco, "id">) => void
  bancos: Banco[]
}

const CATEGORIAS_GASTO = [
  { id: "pagos_distribuidor", label: "Pago Dist.", icon: "🚚" },
  { id: "operativos", label: "Operativos", icon: "⚙️" },
  { id: "nomina", label: "Nómina", icon: "👥" },
  { id: "servicios", label: "Servicios", icon: "💡" },
  { id: "compras", label: "Compras", icon: "🛒" },
  { id: "otros", label: "Otros", icon: "📋" },
]

function ModalNuevoGasto({ isOpen, onClose, onSubmit, bancos }: ModalNuevoGastoProps) {
  const [formData, setFormData] = useState({
    bancoId: "boveda_monte" as BancoId,
    monto: "",
    concepto: "",
    referencia: "",
    categoria: "pagos_distribuidor",
    notas: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const bancoSeleccionado = bancos.find((b) => b.id === formData.bancoId)
  const montoNumerico = parseFloat(formData.monto) || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!formData.monto || montoNumerico <= 0) {
      newErrors.monto = "El monto debe ser mayor a 0"
    }
    if (bancoSeleccionado && montoNumerico > bancoSeleccionado.capitalActual) {
      newErrors.monto = `Fondos insuficientes. Disponible: $${bancoSeleccionado.capitalActual.toLocaleString()}`
    }
    if (!formData.concepto.trim()) {
      newErrors.concepto = "El concepto es requerido"
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setLoading(true)
    const now = new Date()
    const movimiento: Omit<MovimientoBanco, "id"> = {
      bancoId: formData.bancoId,
      tipo: "gasto",
      monto: montoNumerico,
      concepto: formData.concepto,
      referencia: formData.referencia || undefined,
      categoria: formData.categoria,
      notas: formData.notas || undefined,
      fecha: now.toISOString().split("T")[0] ?? "",
      hora: now.toTimeString().slice(0, 5),
      estado: "completado",
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
    onSubmit(movimiento)
    setLoading(false)
    setFormData({
      bancoId: "boveda_monte",
      monto: "",
      concepto: "",
      referencia: "",
      categoria: "pagos_distribuidor",
      notas: "",
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
        <motion.div
          className="relative z-[1] w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-red-500/10 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/20">
                  <ArrowUpRight className="text-red-400" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nuevo Gasto</h2>
                  <p className="text-sm text-white/50">Registrar salida de capital</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <Landmark size={14} className="mr-2 inline" />
                Banco Origen
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bancos.slice(0, 8).map((banco) => {
                  const config = BANCO_CONFIG[banco.id as BancoId] ?? BANCO_CONFIG["boveda_monte"]
                  const isSelected = formData.bancoId === banco.id
                  return (
                    <motion.button
                      key={banco.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, bancoId: banco.id }))}
                      className={cn(
                        "rounded-xl border p-2 text-center transition-all",
                        isSelected
                          ? "border-red-500 bg-red-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-lg text-white"
                        style={{ background: config?.gradient }}
                      >
                        {config?.icon}
                      </div>
                      <span className="line-clamp-1 text-xs text-white/70">
                        {banco.nombre.split(" ")[0]}
                      </span>
                      <span className="text-xs font-medium text-emerald-400">
                        ${(banco.capitalActual / 1000).toFixed(0)}K
                      </span>
                    </motion.button>
                  )
                })}
              </div>
              {bancoSeleccionado && (
                <p className="mt-2 text-xs text-white/50">
                  Disponible:{" "}
                  <span className="font-medium text-emerald-400">
                    ${bancoSeleccionado.capitalActual.toLocaleString()}
                  </span>
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <DollarSign size={14} className="mr-2 inline" />
                Monto
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-red-400">
                  $
                </span>
                <input
                  type="number"
                  value={formData.monto}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, monto: e.target.value }))
                    setErrors((prev) => ({ ...prev, monto: "" }))
                  }}
                  className={cn(
                    "w-full rounded-xl border bg-white/5 py-3 pr-4 pl-10 text-lg font-semibold text-white focus:ring-2 focus:ring-red-500/50 focus:outline-none",
                    errors.monto ? "border-red-500" : "border-white/10"
                  )}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.monto && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} /> {errors.monto}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <FileText size={14} className="mr-2 inline" />
                Concepto
              </label>
              <input
                type="text"
                value={formData.concepto}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, concepto: e.target.value }))
                  setErrors((prev) => ({ ...prev, concepto: "" }))
                }}
                className={cn(
                  "w-full rounded-xl border bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-red-500/50 focus:outline-none",
                  errors.concepto ? "border-red-500" : "border-white/10"
                )}
                placeholder="Descripción del gasto..."
              />
              {errors.concepto && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} /> {errors.concepto}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <Tag size={14} className="mr-2 inline" />
                Categoría
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIAS_GASTO.map((cat) => (
                  <motion.button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, categoria: cat.id }))}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-2 text-sm transition-all",
                      formData.categoria === cat.id
                        ? "border-red-500 bg-red-500/20 text-red-400"
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    )}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{cat.icon}</span>
                    <span className="text-xs">{cat.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Referencia (opcional)
              </label>
              <input
                type="text"
                value={formData.referencia}
                onChange={(e) => setFormData((prev) => ({ ...prev, referencia: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-red-500/50 focus:outline-none"
                placeholder="Ej: OC-001, PAGO-123..."
              />
            </div>
            <div className="flex gap-3 pt-4">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10"
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-3 font-medium text-white disabled:opacity-50"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />}
                {loading ? "Guardando..." : "Registrar Gasto"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔄 MODAL TRANSFERENCIA — Transferir entre bancos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ModalTransferenciaProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (_salida: Omit<MovimientoBanco, "id">, _entrada: Omit<MovimientoBanco, "id">) => void
  bancos: Banco[]
}

function ModalTransferencia({ isOpen, onClose, onSubmit, bancos }: ModalTransferenciaProps) {
  const [formData, setFormData] = useState({
    bancoOrigenId: "boveda_monte" as BancoId,
    bancoDestinoId: "utilidades" as BancoId,
    monto: "",
    concepto: "",
    referencia: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const bancoOrigen = bancos.find((b) => b.id === formData.bancoOrigenId)
  const bancoDestino = bancos.find((b) => b.id === formData.bancoDestinoId)
  const montoNumerico = parseFloat(formData.monto) || 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!formData.monto || montoNumerico <= 0) newErrors.monto = "El monto debe ser mayor a 0"
    if (bancoOrigen && montoNumerico > bancoOrigen.capitalActual) {
      newErrors.monto = `Fondos insuficientes. Disponible: $${bancoOrigen.capitalActual.toLocaleString()}`
    }
    if (formData.bancoOrigenId === formData.bancoDestinoId) {
      newErrors.destino = "Selecciona un banco diferente"
    }
    if (!formData.concepto.trim()) newErrors.concepto = "El concepto es requerido"
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    const now = new Date()
    const fecha = now.toISOString().split("T")[0] ?? ""
    const hora = now.toTimeString().slice(0, 5)
    const ref = formData.referencia || `TRF-${Date.now().toString(36).toUpperCase()}`

    const salida: Omit<MovimientoBanco, "id"> = {
      bancoId: formData.bancoOrigenId,
      bancoOrigenId: formData.bancoOrigenId,
      bancoDestinoId: formData.bancoDestinoId,
      tipo: "transferencia_salida",
      monto: montoNumerico,
      concepto: `Transferencia a ${bancoDestino?.nombre || formData.bancoDestinoId}`,
      referencia: ref,
      fecha,
      hora,
      estado: "completado",
    }
    const entrada: Omit<MovimientoBanco, "id"> = {
      bancoId: formData.bancoDestinoId,
      bancoOrigenId: formData.bancoOrigenId,
      bancoDestinoId: formData.bancoDestinoId,
      tipo: "transferencia_entrada",
      monto: montoNumerico,
      concepto: `Transferencia desde ${bancoOrigen?.nombre || formData.bancoOrigenId}`,
      referencia: ref,
      fecha,
      hora,
      estado: "completado",
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
    onSubmit(salida, entrada)
    setLoading(false)
    setFormData({
      bancoOrigenId: "boveda_monte",
      bancoDestinoId: "utilidades",
      monto: "",
      concepto: "",
      referencia: "",
    })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative z-[1] w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/10 to-cyan-500/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/20">
                  <Send className="text-violet-400" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Nueva Transferencia</h2>
                  <p className="text-sm text-white/50">Mover capital entre bancos</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {/* Banco Origen */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <ArrowUpRight size={14} className="mr-2 inline text-red-400" />
                Banco Origen
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bancos.map((banco) => {
                  const config = BANCO_CONFIG[banco.id as BancoId] ?? BANCO_CONFIG["boveda_monte"]
                  const isSelected = formData.bancoOrigenId === banco.id
                  return (
                    <motion.button
                      key={banco.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, bancoOrigenId: banco.id }))}
                      className={cn(
                        "rounded-xl border p-2 text-center transition-all",
                        isSelected
                          ? "border-violet-500 bg-violet-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg text-white"
                        style={{ background: config?.gradient }}
                      >
                        {config?.icon}
                      </div>
                      <span className="line-clamp-1 text-[10px] text-white/70">
                        {banco.nombre.split(" ")[0]}
                      </span>
                      <span className="text-[10px] text-emerald-400">
                        ${(banco.capitalActual / 1000).toFixed(0)}K
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
            {/* Flecha visual */}
            <div className="flex items-center justify-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ArrowDownRight size={24} className="text-violet-400" />
              </motion.div>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
            </div>
            {/* Banco Destino */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <ArrowDownRight size={14} className="mr-2 inline text-emerald-400" />
                Banco Destino
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bancos.map((banco) => {
                  const config = BANCO_CONFIG[banco.id as BancoId] ?? BANCO_CONFIG["boveda_monte"]
                  const isSelected = formData.bancoDestinoId === banco.id
                  const isOrigen = formData.bancoOrigenId === banco.id
                  return (
                    <motion.button
                      key={banco.id}
                      type="button"
                      onClick={() =>
                        !isOrigen && setFormData((prev) => ({ ...prev, bancoDestinoId: banco.id }))
                      }
                      className={cn(
                        "rounded-xl border p-2 text-center transition-all",
                        isOrigen ? "cursor-not-allowed opacity-30" : "",
                        isSelected && !isOrigen
                          ? "border-cyan-500 bg-cyan-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                      whileTap={{ scale: isOrigen ? 1 : 0.98 }}
                      disabled={isOrigen}
                    >
                      <div
                        className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg text-white"
                        style={{ background: config?.gradient }}
                      >
                        {config?.icon}
                      </div>
                      <span className="line-clamp-1 text-[10px] text-white/70">
                        {banco.nombre.split(" ")[0]}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
              {errors.destino && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} /> {errors.destino}
                </p>
              )}
            </div>
            {/* Monto */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <DollarSign size={14} className="mr-2 inline" />
                Monto a Transferir
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-violet-400">
                  $
                </span>
                <input
                  type="number"
                  value={formData.monto}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, monto: e.target.value }))
                    setErrors((prev) => ({ ...prev, monto: "" }))
                  }}
                  className={cn(
                    "w-full rounded-xl border bg-white/5 py-3 pr-4 pl-10 text-lg font-semibold text-white focus:ring-2 focus:ring-violet-500/50 focus:outline-none",
                    errors.monto ? "border-red-500" : "border-white/10"
                  )}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.monto && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} /> {errors.monto}
                </p>
              )}
              {bancoOrigen && (
                <p className="mt-1 text-xs text-white/40">
                  Disponible en {bancoOrigen.nombre}:{" "}
                  <span className="text-emerald-400">
                    ${bancoOrigen.capitalActual.toLocaleString()}
                  </span>
                </p>
              )}
            </div>
            {/* Concepto */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">Concepto</label>
              <input
                type="text"
                value={formData.concepto}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, concepto: e.target.value }))
                  setErrors((prev) => ({ ...prev, concepto: "" }))
                }}
                className={cn(
                  "w-full rounded-xl border bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-violet-500/50 focus:outline-none",
                  errors.concepto ? "border-red-500" : "border-white/10"
                )}
                placeholder="Motivo de la transferencia..."
              />
              {errors.concepto && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} /> {errors.concepto}
                </p>
              )}
            </div>
            {/* Preview */}
            {montoNumerico > 0 && bancoOrigen && bancoDestino && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="mb-2 text-xs text-white/50">Vista previa de transferencia:</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-white">{bancoOrigen.nombre}</span>
                  <ArrowRight className="text-violet-400" size={16} />
                  <span className="text-white">{bancoDestino.nombre}</span>
                  <span className="ml-auto font-bold text-violet-400">
                    ${montoNumerico.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10"
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-3 font-medium text-white disabled:opacity-50"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                {loading ? "Procesando..." : "Transferir"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ✂️ MODAL CORTE — Registrar corte de caja
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ModalCorteProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (_data: Omit<MovimientoBanco, "id">) => void
  bancos: Banco[]
}

function ModalCorte({ isOpen, onClose, onSubmit, bancos }: ModalCorteProps) {
  const [formData, setFormData] = useState({
    bancoId: "boveda_monte" as BancoId,
    montoContado: "",
    notas: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const bancoSeleccionado = bancos.find((b) => b.id === formData.bancoId)
  const montoContado = parseFloat(formData.montoContado) || 0
  const diferencia = bancoSeleccionado ? montoContado - bancoSeleccionado.capitalActual : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!formData.montoContado || montoContado < 0) {
      newErrors.montoContado = "Ingresa el monto contado"
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    const now = new Date()
    const movimiento: Omit<MovimientoBanco, "id"> = {
      bancoId: formData.bancoId,
      tipo: "corte",
      monto: montoContado,
      concepto: `Corte de caja - ${diferencia === 0 ? "Sin diferencia" : diferencia > 0 ? `Sobrante $${diferencia.toLocaleString()}` : `Faltante $${Math.abs(diferencia).toLocaleString()}`}`,
      referencia: `CORTE-${now.toISOString().split("T")[0]?.replace(/-/g, "")}`,
      fecha: now.toISOString().split("T")[0] ?? "",
      hora: now.toTimeString().slice(0, 5),
      estado: "completado",
      notas: formData.notas || undefined,
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
    onSubmit(movimiento)
    setLoading(false)
    setFormData({ bancoId: "boveda_monte", montoContado: "", notas: "" })
    setErrors({})
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative z-[1] w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-gray-900/95 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-amber-500/10 to-transparent p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20">
                  <Scissors className="text-amber-400" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Corte de Caja</h2>
                  <p className="text-sm text-white/50">Arqueo y verificación de capital</p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 p-6">
            {/* Banco */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <Landmark size={14} className="mr-2 inline" />
                Banco a Cortar
              </label>
              <div className="grid grid-cols-4 gap-2">
                {bancos.map((banco) => {
                  const config = BANCO_CONFIG[banco.id as BancoId] ?? BANCO_CONFIG["boveda_monte"]
                  const isSelected = formData.bancoId === banco.id
                  return (
                    <motion.button
                      key={banco.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, bancoId: banco.id }))}
                      className={cn(
                        "rounded-xl border p-2 text-center transition-all",
                        isSelected
                          ? "border-amber-500 bg-amber-500/20"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div
                        className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-lg text-white"
                        style={{ background: config?.gradient }}
                      >
                        {config?.icon}
                      </div>
                      <span className="line-clamp-1 text-[10px] text-white/70">
                        {banco.nombre.split(" ")[0]}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
            </div>
            {/* Capital en sistema */}
            {bancoSeleccionado && (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/60">
                    Capital en sistema ({bancoSeleccionado.nombre}):
                  </span>
                  <span className="text-lg font-bold text-violet-400">
                    ${bancoSeleccionado.capitalActual.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            {/* Monto Contado */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                <DollarSign size={14} className="mr-2 inline" />
                Monto Contado (Físico)
              </label>
              <div className="relative">
                <span className="absolute top-1/2 left-4 -translate-y-1/2 font-bold text-amber-400">
                  $
                </span>
                <input
                  type="number"
                  value={formData.montoContado}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, montoContado: e.target.value }))
                    setErrors((prev) => ({ ...prev, montoContado: "" }))
                  }}
                  className={cn(
                    "w-full rounded-xl border bg-white/5 py-3 pr-4 pl-10 text-lg font-semibold text-white focus:ring-2 focus:ring-amber-500/50 focus:outline-none",
                    errors.montoContado ? "border-red-500" : "border-white/10"
                  )}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
              {errors.montoContado && (
                <p className="mt-1 flex items-center gap-1 text-xs text-red-400">
                  <AlertCircle size={12} /> {errors.montoContado}
                </p>
              )}
            </div>
            {/* Diferencia */}
            {montoContado > 0 && bancoSeleccionado && (
              <div
                className={cn(
                  "rounded-xl border p-4",
                  diferencia === 0
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : diferencia > 0
                      ? "border-cyan-500/30 bg-cyan-500/10"
                      : "border-red-500/30 bg-red-500/10"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/70">Diferencia:</span>
                  <div className="flex items-center gap-2">
                    {diferencia === 0 ? (
                      <>
                        <Check size={16} className="text-emerald-400" />
                        <span className="font-bold text-emerald-400">Sin diferencia ✓</span>
                      </>
                    ) : diferencia > 0 ? (
                      <>
                        <TrendingUp size={16} className="text-cyan-400" />
                        <span className="font-bold text-cyan-400">
                          Sobrante: +${diferencia.toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown size={16} className="text-red-400" />
                        <span className="font-bold text-red-400">
                          Faltante: -${Math.abs(diferencia).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Notas */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">
                Notas del Corte
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData((prev) => ({ ...prev, notas: e.target.value }))}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                placeholder="Observaciones del arqueo..."
                rows={2}
              />
            </div>
            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <motion.button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors hover:bg-white/10"
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
              <motion.button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 font-medium text-white disabled:opacity-50"
                whileTap={{ scale: 0.98 }}
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Scissors size={18} />}
                {loading ? "Procesando..." : "Registrar Corte"}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT — Aurora Bancos Panel Unified
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraBancosPanelUnified({
  bancos: bancosProp,
  movimientos = defaultMovimientos,
  onNuevoMovimiento: _onNuevoMovimiento,
  onTransferencia: _onTransferencia,
  onVerBanco,
  onRefresh,
  loading: loadingProp = false,
  className,
}: AuroraBancosPanelUnifiedProps) {
  // ═══════════════════════════════════════════════════════════════════════════
  // 🌊 SUPREME SYSTEMS — SMOOTH SCROLL 120fps
  // ═══════════════════════════════════════════════════════════════════════════
  useSmoothScroll()

  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 CARGAR DATOS REALES DE LA API SI NO SE PASAN PROPS
  // ═══════════════════════════════════════════════════════════════════════════
  const { data: bancosAPI, loading: loadingAPI, refetch: refetchAPI } = useBancosData()

  // Transformar datos de API al formato del componente
  const transformedBancos = useMemo((): Banco[] => {
    if (!bancosAPI || bancosAPI.length === 0) return []

    // Variables de configuración disponibles para extensión futura
    const _colores: Record<string, string> = {
      boveda_monte: "#8B5CF6",
      boveda_usa: "#14B8A6",
      profit: "#F59E0B",
      leftie: "#EC4899",
      azteca: "#3B82F6",
      flete_sur: "#10B981",
      utilidades: "#F97316",
    }

    const _iconos: Record<string, string> = {
      boveda_monte: "🏛️",
      boveda_usa: "🇺🇸",
      profit: "💰",
      leftie: "🎯",
      azteca: "🌮",
      flete_sur: "🚛",
      utilidades: "📈",
    }

    return bancosAPI.map(
      (b: {
        id: string
        nombre: string
        color?: string
        capitalActual: number
        historicoIngresos: number
        historicoGastos: number
      }): Banco => ({
        id: b.id as BancoId,
        nombre: b.nombre,
        descripcion: "",
        capitalActual: b.capitalActual,
        historicoIngresos: b.historicoIngresos,
        historicoGastos: b.historicoGastos,
        ultimoMovimiento: "",
        tendencia: (b.capitalActual >= 0 ? "up" : "down") as Banco["tendencia"],
        porcentajeCambio: 0,
      })
    )
  }, [bancosAPI])

  // Usar datos de props si se pasan, sino usar datos de API (sin fallback a mock data)
  const bancos = useMemo(() => {
    if (bancosProp && Array.isArray(bancosProp) && bancosProp.length > 0) return bancosProp
    return Array.isArray(transformedBancos) ? transformedBancos : []
  }, [bancosProp, transformedBancos])

  const loading = loadingProp || loadingAPI

  const [filtros, setFiltros] = useState({
    banco: "todos" as BancoId | "todos",
    busqueda: "",
  })
  const [tabOperacional, setTabOperacional] = useState<TabOperacional>("ingresos")
  const [vistaActual, setVistaActual] = useState<"bancos" | "operaciones">("bancos")

  // Estados de modales
  const [modalIngreso, setModalIngreso] = useState(false)
  const [modalGasto, setModalGasto] = useState(false)
  const [modalTransferencia, setModalTransferencia] = useState(false)
  const [modalCorte, setModalCorte] = useState(false)

  // Estados de modales de movimientos (CRUD)
  const [modalDetalleMovimiento, setModalDetalleMovimiento] = useState(false)
  const [modalEditarMovimiento, setModalEditarMovimiento] = useState(false)
  const [modalEliminarMovimiento, setModalEliminarMovimiento] = useState(false)
  const [movimientoSeleccionadoId, setMovimientoSeleccionadoId] = useState<string | null>(null)

  // Transition para server actions
  const [_isPending, startTransition] = useTransition()

  // Handlers para modales con Server Actions reales
  const handleNuevoIngreso = useCallback(
    async (data: Omit<MovimientoBanco, "id">) => {
      startTransition(async () => {
        const formData = new FormData()
        formData.append("bancoId", data.bancoId)
        formData.append("monto", data.monto.toString())
        formData.append("concepto", data.concepto)
        if (data.categoria) formData.append("categoria", data.categoria)
        if (data.referencia) formData.append("referencia", data.referencia)

        const result = await registrarIngreso(formData)

        if (result.error) {
          logger.error("Error al registrar ingreso", result.error, {
            context: "AuroraBancosPanel",
            bancoId: data.bancoId,
          })
          toast.error("Error al registrar ingreso", { description: result.error })
        } else {
          logger.info(`Ingreso registrado: $${data.monto.toLocaleString()} en ${data.bancoId}`, {
            context: "AuroraBancosPanel",
            bancoId: data.bancoId,
          })
          toast.success("Ingreso registrado", {
            description: `$${data.monto.toLocaleString()} agregado exitosamente`,
          })
          refetchAPI()
          onRefresh?.()
        }
      })
    },
    [onRefresh, refetchAPI]
  )

  const handleNuevoGasto = useCallback(
    async (data: Omit<MovimientoBanco, "id">) => {
      startTransition(async () => {
        const formData = new FormData()
        formData.append("bancoId", data.bancoId)
        formData.append("monto", data.monto.toString())
        formData.append("concepto", data.concepto)
        if (data.notas) formData.append("observaciones", data.notas)

        const result = await registrarGasto(formData)

        if (result.error) {
          logger.error("Error al registrar gasto", result.error, {
            context: "AuroraBancosPanel",
            bancoId: data.bancoId,
          })
          toast.error("Error al registrar gasto", { description: result.error })
        } else {
          logger.info(`Gasto registrado: $${data.monto.toLocaleString()} de ${data.bancoId}`, {
            context: "AuroraBancosPanel",
            bancoId: data.bancoId,
          })
          toast.success("Gasto registrado", {
            description: `$${data.monto.toLocaleString()} descontado exitosamente`,
          })
          refetchAPI()
          onRefresh?.()
        }
      })
    },
    [onRefresh, refetchAPI]
  )

  const handleTransferencia = useCallback(
    async (salida: Omit<MovimientoBanco, "id">, _entrada: Omit<MovimientoBanco, "id">) => {
      startTransition(async () => {
        const formData = new FormData()
        formData.append("bancoOrigenId", salida.bancoId)
        formData.append("bancoDestinoId", _entrada.bancoId)
        formData.append("monto", salida.monto.toString())
        formData.append(
          "concepto",
          salida.concepto.replace("Transferencia a ", "").replace(": ", " - ")
        )

        const result = await transferirEntreBancos({
          bancoOrigenId: salida.bancoId,
          bancoDestinoId: _entrada.bancoId,
          monto: salida.monto,
          concepto: salida.concepto.replace("Transferencia a ", "").replace(": ", " - "),
        })

        if (result.error) {
          logger.error("Error en transferencia", result.error, { context: "AuroraBancosPanel" })
          toast.error("Error en transferencia", { description: result.error })
        } else {
          logger.info(`Transferencia completada: $${salida.monto.toLocaleString()}`, {
            context: "AuroraBancosPanel",
          })
          toast.success("Transferencia completada", {
            description: `$${salida.monto.toLocaleString()} transferido exitosamente`,
          })
          refetchAPI()
          onRefresh?.()
        }
      })
    },
    [onRefresh, refetchAPI]
  )

  const handleCorte = useCallback(
    async (data: Omit<MovimientoBanco, "id">) => {
      startTransition(async () => {
        const result = await realizarCorte({
          bancoId: data.bancoId,
          conteoFisico: data.monto,
          observaciones: data.notas,
        })

        if (result.error) {
          logger.error("Error en corte", result.error, {
            context: "AuroraBancosPanel",
            bancoId: data.bancoId,
          })
          toast.error("Error en corte de caja", { description: result.error })
        } else {
          const msg =
            result.diferencia === 0
              ? "Sin diferencias"
              : `${result.tipo === "sobrante" ? "Sobrante" : "Faltante"}: $${Math.abs(result.diferencia ?? 0).toLocaleString()}`
          logger.info(`Corte registrado: ${msg}`, {
            context: "AuroraBancosPanel",
            bancoId: data.bancoId,
          })
          toast.success("Corte de caja registrado", {
            description: msg,
          })
          refetchAPI()
          onRefresh?.()
        }
      })
    },
    [onRefresh, refetchAPI]
  )

  // Handlers para modales de movimientos (CRUD)
  const handleVerDetalleMovimiento = useCallback((mov: MovimientoBanco) => {
    setMovimientoSeleccionadoId(mov.id)
    setModalDetalleMovimiento(true)
    logger.info("Ver detalle movimiento", { context: "AuroraBancosPanel", data: { id: mov.id } })
  }, [])

  const handleEditarMovimiento = useCallback((mov: MovimientoBanco) => {
    setMovimientoSeleccionadoId(mov.id)
    setModalEditarMovimiento(true)
    logger.info("Editar movimiento", { context: "AuroraBancosPanel", data: { id: mov.id } })
  }, [])

  const handleEliminarMovimiento = useCallback((mov: MovimientoBanco) => {
    setMovimientoSeleccionadoId(mov.id)
    setModalEliminarMovimiento(true)
    logger.info("Eliminar movimiento", { context: "AuroraBancosPanel", data: { id: mov.id } })
  }, [])

  const handleMovimientoSuccess = useCallback(() => {
    refetchAPI()
    onRefresh?.()
  }, [onRefresh, refetchAPI])

  // Stats
  const stats = useMemo(() => {
    const capitalTotal = bancos.reduce((sum, b) => sum + b.capitalActual, 0)
    const ingresosTotal = bancos.reduce((sum, b) => sum + b.historicoIngresos, 0)
    const gastosTotal = bancos.reduce((sum, b) => sum + b.historicoGastos, 0)

    // Find max and min - Guard against empty arrays
    const maxCapital = bancos.length > 0 ? Math.max(...bancos.map((b) => b.capitalActual)) : 0
    const bancoMax = bancos.find((b) => b.capitalActual === maxCapital)

    return {
      capitalTotal: capitalTotal || 1, // Prevent division by zero
      ingresosTotal,
      gastosTotal,
      bancoMax,
      balanceNeto: ingresosTotal - gastosTotal,
    }
  }, [bancos])

  // Filtered banks
  const filteredBancos = useMemo(() => {
    return bancos.filter((b) => {
      const matchBanco = filtros.banco === "todos" || b.id === filtros.banco
      const matchBusqueda =
        !filtros.busqueda || b.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase())
      return matchBanco && matchBusqueda
    })
  }, [bancos, filtros])

  // Chart data for distribution
  const _distributionData = useMemo(() => {
    return bancos.map((b) => ({
      name: b.nombre.split(" ")[0] ?? b.nombre,
      value: b.capitalActual,
      color: BANCO_CONFIG[b.id]?.color ?? "#8B5CF6",
    }))
  }, [bancos])

  // Chart data for 7-day trend
  const trendData = useMemo(() => {
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    return days.map((day, i) => ({
      name: day,
      value: stats.capitalTotal * (0.9 + Math.random() * 0.2) + i * 10000,
      ingresos: Math.random() * 50000 + 20000,
      gastos: Math.random() * 30000 + 10000,
    }))
  }, [stats.capitalTotal])

  const bancoTabs = [
    { id: "todos", label: "Todos" },
    ...bancos.map((b) => ({
      id: b.id,
      label: b.nombre.split(" ")[0] ?? b.nombre,
    })),
  ]

  const vistaTabs = [
    { id: "bancos", label: "🏦 Bancos" },
    { id: "operaciones", label: "📊 Operaciones" },
  ]

  const operacionTabs = [
    { id: "ingresos", label: "💰 Ingresos" },
    { id: "gastos", label: "💸 Gastos" },
    { id: "transferencias", label: "🔄 Transferencias" },
    { id: "cortes", label: "✂️ Cortes" },
  ]

  return (
    <SupremeBancosBackground
      showGradient
      showVignette
      intensity={0.8}
      className={cn("min-h-screen", className)}
    >
      {/* 🌌 AURORA BACKGROUND OVERLAY */}
      <AuroraBackground
        intensity="low"
        colors={["violet", "cyan", "emerald"]}
        interactive
        className="absolute inset-0 z-0"
      />

      <main className="relative z-10 p-6" aria-label="Panel de bancos y bóvedas CHRONOS">
        {/* Header - ELEVATED PREMIUM */}
        <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="relative">
            {/* Decorative glow orb */}
            <div className="absolute -top-4 -left-4 h-20 w-32 rounded-full bg-violet-500/20 blur-3xl" />
            <motion.h1
              className="relative flex items-center gap-4 text-3xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Landmark className="h-6 w-6 text-violet-400" aria-hidden="true" />
              </motion.div>
              <span className="bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">
                Bancos y Bóvedas
              </span>
            </motion.h1>
            <p className="relative mt-2 text-white/50">Control de capital y flujo de efectivo</p>
            {/* Animated underline */}
            <motion.div
              className="mt-2 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              initial={{ width: 0 }}
              animate={{ width: 80 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </div>

          <div className="flex items-center gap-3">
            <AuroraButton
              variant="glow"
              color="emerald"
              icon={<ArrowDownRight size={18} />}
              onClick={() => setModalIngreso(true)}
            >
              Nuevo Ingreso
            </AuroraButton>
            <AuroraButton
              variant="glow"
              color="magenta"
              icon={<ArrowUpRight size={18} />}
              onClick={() => setModalGasto(true)}
            >
              Nuevo Gasto
            </AuroraButton>
            <AuroraButton
              variant="secondary"
              icon={<Send size={18} />}
              onClick={() => setModalTransferencia(true)}
            >
              Transferencia
            </AuroraButton>
            <AuroraButton
              variant="ghost"
              icon={<Scissors size={18} />}
              onClick={() => setModalCorte(true)}
            >
              Corte
            </AuroraButton>
            <motion.button
              onClick={() => {
                refetchAPI()
                onRefresh?.()
              }}
              aria-label={loading ? "Actualizando datos..." : "Actualizar datos de bancos"}
              className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/60 transition-colors hover:text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} aria-hidden="true" />
            </motion.button>
          </div>
        </header>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AuroraStatWidget
            label="Capital Total"
            value={`$${(stats.capitalTotal / 1000).toFixed(0)}K`}
            icon={<Wallet size={20} />}
            color="violet"
            change={12.5}
            trend="up"
            className="transition-spring hover-elevate"
          />
          <AuroraStatWidget
            label="Ingresos Históricos"
            value={`$${(stats.ingresosTotal / 1000000).toFixed(1)}M`}
            icon={<TrendingUp size={20} />}
            color="emerald"
            change={18.3}
            trend="up"
            className="transition-spring hover-elevate"
          />
          <AuroraStatWidget
            label="Gastos Históricos"
            value={`$${(stats.gastosTotal / 1000000).toFixed(1)}M`}
            icon={<TrendingDown size={20} />}
            color="magenta"
            change={-5.2}
            trend="down"
            className="transition-spring hover-elevate"
          />
          <AuroraStatWidget
            label="Balance Neto"
            value={`$${(stats.balanceNeto / 1000).toFixed(0)}K`}
            icon={<CircleDollarSign size={20} />}
            color="cyan"
            change={15.0}
            trend="up"
            className="transition-spring hover-elevate"
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════════
         * 🍎 iOS PREMIUM METRICS — Cards limpias SIN efectos 3D problemáticos
         * Estilo iOS 18+ con glassmorphism Gen6, sin tilt con cursor
         * ═══════════════════════════════════════════════════════════════════════════════ */}
        <iOSSection title="Vista iOS Premium" description="Cards limpias sin efectos 3D" className="mb-6">
          <iOSGrid cols={4} gap="md">
            <iOSMetricCardPremium
              title="Capital Total"
              value={`$${(stats.capitalTotal / 1000).toFixed(0)}K`}
              icon={Wallet}
              iconColor="#8B5CF6"
              trend={{ value: 12.5, direction: 'up' }}
              variant="default"
            />
            <iOSMetricCardPremium
              title="Ingresos"
              value={`$${(stats.ingresosTotal / 1000000).toFixed(1)}M`}
              icon={TrendingUp}
              iconColor="#10B981"
              trend={{ value: 18.3, direction: 'up' }}
              variant="default"
            />
            <iOSMetricCardPremium
              title="Gastos"
              value={`$${(stats.gastosTotal / 1000000).toFixed(1)}M`}
              icon={TrendingDown}
              iconColor="#EC4899"
              trend={{ value: 5.2, direction: 'down' }}
              variant="default"
            />
            <iOSMetricCardPremium
              title="Balance Neto"
              value={`$${(stats.balanceNeto / 1000).toFixed(0)}K`}
              icon={CircleDollarSign}
              iconColor="#06B6D4"
              trend={{ value: 15.0, direction: 'up' }}
              variant="featured"
            />
          </iOSGrid>
        </iOSSection>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Banks Grid or Operations Table */}
          <div className="col-span-12 space-y-6 lg:col-span-8">
            {/* Vista Tabs */}
            <AuroraGlassCard className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <AuroraTabs
                  tabs={vistaTabs}
                  activeTab={vistaActual}
                  onTabChange={(v) => setVistaActual(v as "bancos" | "operaciones")}
                  color="violet"
                />

                <AuroraSearch
                  value={filtros.busqueda}
                  onChange={(v) => setFiltros((prev) => ({ ...prev, busqueda: v }))}
                  placeholder={
                    vistaActual === "bancos" ? "Buscar banco..." : "Buscar movimiento..."
                  }
                  color="violet"
                  className="w-64"
                />
              </div>

              {/* Filtro por banco (para ambas vistas) */}
              <div className="mt-4 border-t border-white/10 pt-4">
                <AuroraTabs
                  tabs={bancoTabs}
                  activeTab={filtros.banco}
                  onTabChange={(v) =>
                    setFiltros((prev) => ({ ...prev, banco: v as BancoId | "todos" }))
                  }
                  color="cyan"
                />
              </div>

              {/* Tabs operacionales (solo en vista operaciones) */}
              {vistaActual === "operaciones" && (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <AuroraTabs
                    tabs={operacionTabs}
                    activeTab={tabOperacional}
                    onTabChange={(v) => setTabOperacional(v as TabOperacional)}
                    color="emerald"
                  />
                </div>
              )}
            </AuroraGlassCard>

            {/* Vista Bancos: Banks Grid */}
            {vistaActual === "bancos" && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredBancos.map((banco) => (
                  <BancoCard
                    key={banco.id}
                    banco={banco}
                    onVerDetalle={() => onVerBanco?.(banco)}
                  />
                ))}

                {filteredBancos.length === 0 && (
                  <div className="col-span-3 py-12 text-center text-white/40">
                    <Landmark size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No se encontraron bancos</p>
                  </div>
                )}
              </div>
            )}

            {/* Vista Operaciones: Tabla Operacional */}
            {vistaActual === "operaciones" && (
              <AuroraGlassCard className="p-4">
                <TablaOperacional
                  movimientos={movimientos}
                  tipoFiltro={tabOperacional}
                  bancoFiltro={filtros.banco}
                  onEditar={handleEditarMovimiento}
                  onEliminar={handleEliminarMovimiento}
                  onVerDetalle={handleVerDetalleMovimiento}
                />
              </AuroraGlassCard>
            )}
          </div>

          {/* Right: Visualization & Timeline */}
          <div className="col-span-12 space-y-6 lg:col-span-4">
            {/* Capital Flow Visualization */}
            <AuroraGlassCard glowColor="violet" className="p-4">
              <h3 className="mb-3 text-center text-sm font-medium text-white/70">
                Flujo de Capital
              </h3>
              <div className="h-48">
                <CapitalFlowVisualization bancos={bancos} />
              </div>
            </AuroraGlassCard>

            {/* Trend Chart */}
            <AuroraAreaChart
              data={trendData}
              height={200}
              color="violet"
              showArea
              showLine
              showDots
              showTooltip
              title="Tendencia Capital 7 Días"
            />

            {/* Distribution */}
            <AuroraGlassCard glowColor="cyan" className="p-5">
              <h3 className="mb-4 text-sm font-medium text-white/70">Distribución de Capital</h3>
              <div className="space-y-3">
                {bancos.slice(0, 5).map((banco, i) => {
                  const percentage = (banco.capitalActual / stats.capitalTotal) * 100
                  const config = BANCO_CONFIG[banco.id as BancoId] ?? BANCO_CONFIG["boveda_monte"]
                  return (
                    <div key={banco.id}>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-white/60">{banco.nombre}</span>
                        <span style={{ color: config?.color }}>{percentage.toFixed(1)}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: config?.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: i * 0.1 }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </AuroraGlassCard>

            {/* Recent Movements */}
            <AuroraGlassCard glowColor="emerald" className="p-5">
              <h3 className="mb-4 text-sm font-medium text-white/70">Últimos Movimientos</h3>
              <div className="space-y-1">
                {movimientos.slice(0, 5).map((mov, i) => (
                  <MovimientoBancoItem
                    key={mov.id}
                    movimiento={mov}
                    isFirst={i === 0}
                    isLast={i === Math.min(4, movimientos.length - 1)}
                  />
                ))}
              </div>
            </AuroraGlassCard>
          </div>
        </div>
      </main>

      {/* Modales */}
      <ModalNuevoIngreso
        isOpen={modalIngreso}
        onClose={() => setModalIngreso(false)}
        onSubmit={handleNuevoIngreso}
        bancos={bancos}
      />
      <ModalNuevoGasto
        isOpen={modalGasto}
        onClose={() => setModalGasto(false)}
        onSubmit={handleNuevoGasto}
        bancos={bancos}
      />
      <ModalTransferencia
        isOpen={modalTransferencia}
        onClose={() => setModalTransferencia(false)}
        onSubmit={handleTransferencia}
        bancos={bancos}
      />
      <ModalCorte
        isOpen={modalCorte}
        onClose={() => setModalCorte(false)}
        onSubmit={handleCorte}
        bancos={bancos}
      />

      {/* Modales de Movimientos (CRUD) */}
      {movimientoSeleccionadoId && (
        <>
          <DetalleMovimientoModal
            open={modalDetalleMovimiento}
            onClose={() => {
              setModalDetalleMovimiento(false)
              setMovimientoSeleccionadoId(null)
            }}
            movimientoId={movimientoSeleccionadoId}
            onEdit={() => {
              setModalDetalleMovimiento(false)
              setModalEditarMovimiento(true)
            }}
            onDelete={() => {
              setModalDetalleMovimiento(false)
              setModalEliminarMovimiento(true)
            }}
          />
          <EditarMovimientoModal
            open={modalEditarMovimiento}
            onClose={() => {
              setModalEditarMovimiento(false)
              setMovimientoSeleccionadoId(null)
            }}
            movimientoId={movimientoSeleccionadoId}
            onSuccess={handleMovimientoSuccess}
          />
          <EliminarMovimientoModal
            open={modalEliminarMovimiento}
            onClose={() => {
              setModalEliminarMovimiento(false)
              setMovimientoSeleccionadoId(null)
            }}
            movimientoId={movimientoSeleccionadoId}
            onSuccess={handleMovimientoSuccess}
          />
        </>
      )}
    </SupremeBancosBackground>
  )
}

export default AuroraBancosPanelUnified
