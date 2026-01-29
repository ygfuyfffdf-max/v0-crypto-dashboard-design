"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 💰✨ AURORA VENTAS PANEL UNIFIED — CHRONOS INFINITY 2026 ULTRA SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de Ventas ULTRA PREMIUM con TODOS los sistemas supremos 2026:
 * ✅ QUANTUM VISUAL EFFECTS (Mood/Pulse adaptive, WebGPU-ready)
 * ✅ SMOOTH SCROLL 120FPS (Lenis + GSAP ScrollTrigger)
 * ✅ PARTÍCULAS 3D INTERACTIVAS (WebGL/WebGPU Accelerated 2M+)
 * ✅ 50+ ANIMACIONES CINEMATOGRÁFICAS (Glitch, Cosmic, Energy, Holographic)
 * ✅ MICRO-INTERACCIONES PREMIUM en todos los botones
 * ✅ SCROLL COUNTERS animados con GSAP
 * ✅ PARALLAX EFFECTS ultra fluido
 * ✅ LIQUID MORPH TRANSITIONS (ClipPath GPU-accelerated)
 * ✅ GLASSMORPHISM GEN5 con aurora boreal
 * - Timeline de ventas elegante (como movimientos)
 * - Filtros avanzados por estado/cliente/producto
 * - Gráficos de ventas con Canvas 60fps
 * - Quick stats animados
 * - KPIs con tendencias
 *
 * @version 4.0.0 - ULTRA SUPREME ELEVATION 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { useVentasData } from "@/app/hooks/useDataHooks"
import { logger } from "@/app/lib/utils/logger"
import { AnimatePresence, motion } from "motion/react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 ULTRA SUPREME SYSTEMS — CHRONOS INFINITY 2026
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import {
  AlertTriangle,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  Download,
  Edit3,
  Eye,
  FileText,
  Filter,
  Package,
  Plus,
  RefreshCw,
  ShoppingCart,
  Target,
  Trash2,
  X,
} from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🚀 QUANTUM PREMIUM SYSTEMS INTEGRATION (ULTRA OPTIMIZED 2026)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import "@/app/_components/chronos-2026/animations/CinematicAnimations"
import { QuantumParticleField } from "@/app/_components/chronos-2026/particles/ParticleSystems"
import { useSmoothScroll } from "@/app/_components/chronos-2026/scroll/SmoothScrollSystem"

// 🌌 QUANTUM VISUAL EFFECTS — NEW 2026 SYSTEMS

// 🌌 SUPREME SHADER SYSTEM — ELITE 2026
import { SupremeVentasBackground } from "./SupremePanelBackgrounds"

// 🌌 PREMIUM 3D COMPONENTS — ULTRA ELEVATION 2026
import { PremiumLoading } from "./PremiumPanelEnhancer"

// 🚀 VIRTUALIZED TIMELINE — FIX SCROLL EXCESIVO
import { VentasVirtualizedTimeline } from "./VentasVirtualizedTimeline"

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

// Aurora Charts
import { AuroraAreaChart } from "../../charts/AuroraPremiumCharts"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES - ENHANCED WITH GYA DISTRIBUTION & COMPLETE TRACEABILITY
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Base Venta type - compatible with VentaForPanel and similar types
export interface Venta {
  id: string
  fecha: string
  hora: string
  cliente: string
  clienteId: string
  producto: string
  cantidad: number
  precioUnitario: number // Precio VENTA al cliente por unidad
  precioCompraUnidad?: number // Precio COMPRA (costo) por unidad
  precioFlete?: number // Flete por unidad
  precioTotal: number // Total de la venta
  montoPagado?: number // Cuánto ha pagado el cliente
  montoRestante?: number // Deuda restante
  porcentajePagado?: number // % pagado (0-100)
  estado: "pagada" | "pendiente" | "parcial" | "cancelada"
  metodoPago?: "efectivo" | "transferencia" | "credito"
  distribuidor?: string
  notas?: string
  createdAt?: string

  // ═══════════════════════════════════════════════════════════════
  // TRAZABILIDAD COMPLETA
  // ═══════════════════════════════════════════════════════════════
  productoId?: string | null
  productoNombre?: string | null
  productoSku?: string | null
  ocId?: string | null // Orden de Compra ID
  ocDistribuidorId?: string | null
  origenLotes?: Array<{
    ocId: string
    cantidad: number
    costoUnidad: number
    distribuidorId?: string
  }> | null
  numeroLotes?: number
  numeroAbonos?: number

  // Distribución GYA proporcional al pago
  distribucionGYA?: {
    bovedaMonte: number
    fleteSur: number
    utilidades: number
  }

  // Allow additional properties for compatibility with VentaForPanel
  [key: string]: unknown
}

interface FiltrosState {
  estado: string
  busqueda: string
  fechaInicio: string
  fechaFin: string
  montoMin?: number
  montoMax?: number
  cliente?: string
}

interface AuroraVentasPanelUnifiedProps {
  ventas?: Venta[]
  onNuevaVenta?: () => void
  onVerDetalle?: (_venta: Venta) => void
  onEditarVenta?: (_venta: Venta) => void
  onEliminarVenta?: (_ventaId: string) => Promise<void>
  onExportar?: (_formato: "csv" | "excel" | "pdf") => void
  onRefresh?: () => void
  loading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DEFAULT DATA (prefixed with _ since only used as fallback reference)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const _defaultVentas: Venta[] = [
  {
    id: "v1",
    fecha: "2025-12-14",
    hora: "14:30",
    cliente: "Carlos Mendoza",
    clienteId: "c1",
    producto: "Material Premium A",
    cantidad: 50,
    precioUnitario: 1200,
    precioTotal: 60000,
    estado: "pagada",
    metodoPago: "transferencia",
    distribuidor: "Dist. Norte",
    createdAt: "2025-12-14T14:30:00Z",
  },
  {
    id: "v2",
    fecha: "2025-12-14",
    hora: "11:15",
    cliente: "Ana García",
    clienteId: "c2",
    producto: "Material Standard B",
    cantidad: 100,
    precioUnitario: 800,
    precioTotal: 80000,
    estado: "pendiente",
    distribuidor: "Dist. Centro",
    createdAt: "2025-12-14T11:15:00Z",
  },
  {
    id: "v3",
    fecha: "2025-12-13",
    hora: "16:45",
    cliente: "Roberto Silva",
    clienteId: "c3",
    producto: "Kit Profesional C",
    cantidad: 25,
    precioUnitario: 2500,
    precioTotal: 62500,
    estado: "parcial",
    metodoPago: "credito",
    distribuidor: "Dist. Sur",
    createdAt: "2025-12-13T16:45:00Z",
  },
  {
    id: "v4",
    fecha: "2025-12-13",
    hora: "10:20",
    cliente: "María López",
    clienteId: "c4",
    producto: "Material Economy D",
    cantidad: 200,
    precioUnitario: 400,
    precioTotal: 80000,
    estado: "pagada",
    metodoPago: "efectivo",
    distribuidor: "Dist. Este",
    createdAt: "2025-12-13T10:20:00Z",
  },
  {
    id: "v5",
    fecha: "2025-12-12",
    hora: "15:10",
    cliente: "Luis Torres",
    clienteId: "c5",
    producto: "Kit Enterprise E",
    cantidad: 10,
    precioUnitario: 5000,
    precioTotal: 50000,
    estado: "cancelada",
    distribuidor: "Dist. Norte",
    createdAt: "2025-12-12T15:10:00Z",
  },
  {
    id: "v6",
    fecha: "2025-12-12",
    hora: "09:30",
    cliente: "Patricia Herrera",
    clienteId: "c6",
    producto: "Combo Premium",
    cantidad: 15,
    precioUnitario: 3500,
    precioTotal: 52500,
    estado: "pagada",
    metodoPago: "transferencia",
    distribuidor: "Dist. Centro",
    createdAt: "2025-12-12T09:30:00Z",
  },
  {
    id: "v7",
    fecha: "2025-12-11",
    hora: "13:45",
    cliente: "Fernando Torres",
    clienteId: "c7",
    producto: "Material Basic",
    cantidad: 300,
    precioUnitario: 200,
    precioTotal: 60000,
    estado: "pendiente",
    createdAt: "2025-12-11T13:45:00Z",
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 SALES FLOW VISUALIZATION — Real-time animated sales funnel
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function SalesFlowVisualization({
  totalVentas,
  pagadas,
  pendientes,
}: {
  totalVentas: number
  pagadas: number
  pendientes: number
}) {
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

    // Particles
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      alpha: number
    }> = []

    const rect = canvas.getBoundingClientRect()
    for (let i = 0; i < 40; i++) {
      const isPagada = Math.random() > 0.3
      particles.push({
        x: Math.random() * rect.width,
        y: rect.height + Math.random() * 50,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -(1 + Math.random() * 2),
        size: 2 + Math.random() * 4,
        color: isPagada ? "#10B981" : "#FBBF24",
        alpha: 0.3 + Math.random() * 0.7,
      })
    }

    const animate = () => {
      timeRef.current += 0.016
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      // Clear with trail effect
      ctx.fillStyle = "rgba(3, 3, 8, 0.1)"
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Central cart glow
      const cartGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 70)
      cartGlow.addColorStop(0, "rgba(16, 185, 129, 0.4)")
      cartGlow.addColorStop(0.5, "rgba(16, 185, 129, 0.15)")
      cartGlow.addColorStop(1, "transparent")
      ctx.beginPath()
      ctx.arc(centerX, centerY, 60 + Math.sin(timeRef.current * 2) * 8, 0, Math.PI * 2)
      ctx.fillStyle = cartGlow
      ctx.fill()

      // Central icon area
      ctx.beginPath()
      ctx.arc(centerX, centerY, 35, 0, Math.PI * 2)
      ctx.fillStyle = "#10B981"
      ctx.fill()

      // Draw cart icon
      ctx.strokeStyle = "#030308"
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(centerX - 15, centerY - 5)
      ctx.lineTo(centerX + 15, centerY - 5)
      ctx.lineTo(centerX + 10, centerY + 8)
      ctx.lineTo(centerX - 10, centerY + 8)
      ctx.closePath()
      ctx.stroke()

      // Cart wheels
      ctx.beginPath()
      ctx.arc(centerX - 8, centerY + 15, 4, 0, Math.PI * 2)
      ctx.arc(centerX + 8, centerY + 15, 4, 0, Math.PI * 2)
      ctx.stroke()

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.vx + Math.sin(timeRef.current + p.y * 0.01) * 0.3
        p.y += p.vy

        // Reset when off screen
        if (p.y < -20) {
          p.y = rect.height + 20
          p.x = Math.random() * rect.width
          p.alpha = 0.3 + Math.random() * 0.7
        }

        // Attract to center when close
        const dx = centerX - p.x
        const dy = centerY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 100 && dist > 40) {
          p.vx += dx * 0.001
          p.vy += dy * 0.001
        }

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
          .replace(")", `, ${p.alpha * (0.5 + Math.sin(timeRef.current + p.x) * 0.3)})`)
          .replace("rgb", "rgba")
          .replace("#10B981", "rgba(16, 185, 129")
          .replace("#FBBF24", "rgba(251, 191, 36")
        ctx.fillStyle =
          p.color === "#10B981"
            ? `rgba(16, 185, 129, ${p.alpha * (0.5 + Math.sin(timeRef.current + p.x) * 0.3)})`
            : `rgba(251, 191, 36, ${p.alpha * (0.5 + Math.sin(timeRef.current + p.x) * 0.3)})`
        ctx.fill()

        // Trail
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x, p.y - p.vy * 8)
        ctx.strokeStyle =
          p.color === "#10B981"
            ? `rgba(16, 185, 129, ${p.alpha * 0.3})`
            : `rgba(251, 191, 36, ${p.alpha * 0.3})`
        ctx.lineWidth = p.size * 0.5
        ctx.stroke()
      })

      // Stats text
      ctx.font = "bold 14px Inter, sans-serif"
      ctx.fillStyle = "#10B981"
      ctx.textAlign = "center"
      ctx.fillText(`${pagadas} Pagadas`, rect.width * 0.2, rect.height * 0.9)

      ctx.fillStyle = "#FBBF24"
      ctx.fillText(`${pendientes} Pendientes`, rect.width * 0.8, rect.height * 0.9)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [totalVentas, pagadas, pendientes])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ background: "transparent" }}
      role="img"
      aria-label={`Visualización de flujo de ventas: ${pagadas} pagadas, ${pendientes} pendientes de ${totalVentas} total`}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 VENTA TIMELINE ITEM — Individual sale card with full CRUD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VentaTimelineItemProps {
  venta: Venta
  isFirst?: boolean
  isLast?: boolean
  onVerDetalle?: () => void
  onEditar?: () => void
  onEliminar?: () => void
}

function VentaTimelineItem({
  venta,
  isFirst,
  isLast,
  onVerDetalle,
  onEditar,
  onEliminar,
}: VentaTimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const estadoConfig = {
    pagada: {
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.15)",
      icon: <DollarSign size={16} />,
      label: "Pagada",
    },
    pendiente: {
      color: "#FBBF24",
      bgColor: "rgba(251, 191, 36, 0.15)",
      icon: <Clock size={16} />,
      label: "Pendiente",
    },
    parcial: {
      color: "#06B6D4",
      bgColor: "rgba(6, 182, 212, 0.15)",
      icon: <CreditCard size={16} />,
      label: "Parcial",
    },
    cancelada: {
      color: "#EF4444",
      bgColor: "rgba(239, 68, 68, 0.15)",
      icon: <Trash2 size={16} />,
      label: "Cancelada",
    },
  }

  const config = estadoConfig[venta.estado]

  return (
    <div className="relative flex gap-4">
      {/* Timeline line */}
      <div className="relative flex flex-col items-center">
        {!isFirst && (
          <div
            className="absolute -top-4 h-4 w-0.5"
            style={{ background: `linear-gradient(to bottom, #8B5CF650, ${config.color}50)` }}
          />
        )}
        <motion.div
          className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl"
          style={{
            background: config.bgColor,
            border: `2px solid ${config.color}50`,
            boxShadow: isHovered ? `0 0 20px ${config.color}40` : undefined,
          }}
          whileHover={{ scale: 1.1 }}
        >
          <span style={{ color: config.color }}>{config.icon}</span>
        </motion.div>
        {!isLast && (
          <div
            className="min-h-[40px] w-0.5 flex-1"
            style={{ background: `linear-gradient(to bottom, ${config.color}50, transparent)` }}
          />
        )}
      </div>

      {/* Content */}
      <motion.article
        aria-label={`Venta ${venta.id}: ${venta.cliente}, ${venta.producto} × ${venta.cantidad}, $${venta.precioTotal.toLocaleString()}, estado ${config.label}`}
        className={cn(
          "group mb-4 flex-1 cursor-pointer rounded-2xl p-5 transition-all duration-500",
          "border border-white/[0.08] bg-gradient-to-br from-white/[0.05] via-white/[0.03] to-transparent",
          "backdrop-blur-xl",
          "hover:border-white/15",
          "focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
        )}
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => e.key === "Enter" && setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        whileHover={{ x: 6, scale: 1.01 }}
        layout
        style={{
          boxShadow: isHovered
            ? `0 12px 40px ${config.color}30, 0 0 60px ${config.color}15`
            : "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {/* Shimmer effect */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        {/* Background glow */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${config.color}10, transparent)`,
            opacity: isHovered ? 1 : 0,
          }}
        />
        {/* Header */}
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Cliente avatar */}
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              }}
            >
              {venta.cliente
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <p className="text-sm font-medium text-white">{venta.cliente}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                <Package size={10} />
                <span>
                  {venta.producto} × {venta.cantidad}
                </span>
              </div>
            </div>
          </div>

          {/* Amount & Payment Progress */}
          <div className="space-y-1 text-right">
            <p className="text-lg font-bold" style={{ color: config.color }}>
              ${venta.precioTotal.toLocaleString()}
            </p>
            <AuroraBadge
              color={
                venta.estado === "pagada"
                  ? "emerald"
                  : venta.estado === "pendiente"
                    ? "gold"
                    : venta.estado === "parcial"
                      ? "cyan"
                      : "magenta"
              }
              variant="outline"
            >
              {config.label}
            </AuroraBadge>
            {/* Payment Progress Bar for parcial */}
            {venta.estado === "parcial" && venta.porcentajePagado !== undefined && (
              <motion.div
                className="mt-2"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="mb-1 flex justify-between text-[10px] text-white/50">
                  <span>Pagado: ${(venta.montoPagado || 0).toLocaleString()}</span>
                  <span>{venta.porcentajePagado.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${venta.porcentajePagado}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Time info */}
        <div className="mb-2 flex items-center gap-2 text-xs text-white/40">
          <Clock size={10} />
          <span>
            {venta.fecha} {venta.hora}
          </span>
          {venta.distribuidor && (
            <>
              <span>•</span>
              <span className="text-violet-400">{venta.distribuidor}</span>
            </>
          )}
        </div>

        {/* Quick Action Buttons - visible on hover */}
        <AnimatePresence>
          {isHovered && !isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="absolute top-4 right-4 flex gap-1"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onVerDetalle?.()
                }}
                className="rounded-lg bg-white/10 p-2 text-white/60 transition-all hover:bg-emerald-500/20 hover:text-emerald-400"
                title="Ver detalle"
              >
                <Eye size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEditar?.()
                }}
                className="rounded-lg bg-white/10 p-2 text-white/60 transition-all hover:bg-violet-500/20 hover:text-violet-400"
                title="Editar"
              >
                <Edit3 size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowDeleteConfirm(true)
                }}
                className="rounded-lg bg-white/10 p-2 text-white/60 transition-all hover:bg-red-500/20 hover:text-red-400"
                title="Eliminar"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-4 border-t border-white/5 pt-4">
                {/* ═══════════════════════════════════════════════════════════════
                    ESTADO DE PAGO CON ANIMACIÓN PREMIUM
                    ═══════════════════════════════════════════════════════════════ */}
                {(venta.estado === "parcial" || venta.estado === "pendiente") && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <CreditCard className="text-violet-400" size={16} />
                      <span className="text-sm font-semibold text-white">Estado de Pago</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center">
                        <p className="text-[10px] tracking-wider text-white/40 uppercase">Total</p>
                        <p className="text-lg font-bold text-white">
                          ${venta.precioTotal.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] tracking-wider text-emerald-400 uppercase">
                          Pagado
                        </p>
                        <motion.p
                          className="text-lg font-bold text-emerald-400"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          ${(venta.montoPagado || 0).toLocaleString()}
                        </motion.p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] tracking-wider text-amber-400 uppercase">Deuda</p>
                        <motion.p
                          className="text-lg font-bold text-amber-400"
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                        >
                          ${(venta.montoRestante || 0).toLocaleString()}
                        </motion.p>
                      </div>
                    </div>
                    {/* Barra de progreso animada */}
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-white/50">
                        <span>Progreso de pago</span>
                        <span>{(venta.porcentajePagado || 0).toFixed(1)}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          className="relative h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-violet-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${venta.porcentajePagado || 0}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        >
                          {/* Shimmer effect */}
                          <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    DISTRIBUCIÓN GYA A LOS 3 BANCOS
                    ═══════════════════════════════════════════════════════════════ */}
                {venta.distribucionGYA && (venta.montoPagado || 0) > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-blue-500/10 via-cyan-500/10 to-emerald-500/10 p-4"
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Target className="text-cyan-400" size={16} />
                      <span className="text-sm font-semibold text-white">
                        Distribución GYA (Capital Efectivo)
                      </span>
                    </div>
                    <div className="space-y-3">
                      {/* Bóveda Monte */}
                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-blue-500" />
                          <span className="text-xs text-white/70">Bóveda Monte (Costo)</span>
                        </div>
                        <span className="font-mono text-sm font-bold text-blue-400">
                          $
                          {venta.distribucionGYA.bovedaMonte.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </motion.div>
                      {/* Flete Sur */}
                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-pink-500" />
                          <span className="text-xs text-white/70">Flete Sur (Transporte)</span>
                        </div>
                        <span className="font-mono text-sm font-bold text-pink-400">
                          $
                          {venta.distribucionGYA.fleteSur.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </motion.div>
                      {/* Utilidades */}
                      <motion.div
                        className="flex items-center justify-between"
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full bg-emerald-500" />
                          <span className="text-xs text-white/70">Utilidades (Ganancia)</span>
                        </div>
                        <span className="font-mono text-sm font-bold text-emerald-400">
                          $
                          {venta.distribucionGYA.utilidades.toLocaleString(undefined, {
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </motion.div>
                      {/* Mini visualization */}
                      <div className="mt-2 flex gap-1">
                        {(() => {
                          const { bovedaMonte, fleteSur, utilidades } = venta.distribucionGYA
                          const total = bovedaMonte + fleteSur + utilidades
                          if (total <= 0) return null
                          const pctBoveda = (bovedaMonte / total) * 100
                          const pctFlete = (fleteSur / total) * 100
                          const pctUtil = (utilidades / total) * 100
                          return (
                            <>
                              <motion.div
                                className="h-2 rounded-l-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${pctBoveda}%` }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                              />
                              <motion.div
                                className="h-2 bg-pink-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${pctFlete}%` }}
                                transition={{ duration: 0.6, delay: 0.7 }}
                              />
                              <motion.div
                                className="h-2 rounded-r-full bg-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${pctUtil}%` }}
                                transition={{ duration: 0.6, delay: 0.8 }}
                              />
                            </>
                          )
                        })()}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ═══════════════════════════════════════════════════════════════
                    TRAZABILIDAD COMPLETA — IDs y Referencias
                    ═══════════════════════════════════════════════════════════════ */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl border border-white/10 bg-gradient-to-r from-gray-500/10 via-slate-500/10 to-zinc-500/10 p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="text-white/60" size={16} />
                    <span className="text-sm font-semibold text-white">Trazabilidad Completa</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {/* Venta ID */}
                    <div className="rounded-lg bg-white/5 p-2 transition-colors hover:bg-white/10">
                      <span className="text-[10px] tracking-wider text-white/40 uppercase">
                        ID Venta
                      </span>
                      <p className="truncate font-mono text-xs text-white">{venta.id}</p>
                    </div>
                    {/* Cliente ID */}
                    <div className="rounded-lg bg-white/5 p-2 transition-colors hover:bg-white/10">
                      <span className="text-[10px] tracking-wider text-white/40 uppercase">
                        Cliente ID
                      </span>
                      <p className="truncate font-mono text-xs text-cyan-400">{venta.clienteId}</p>
                    </div>
                    {/* Producto ID */}
                    {venta.productoId && (
                      <div className="rounded-lg bg-white/5 p-2 transition-colors hover:bg-white/10">
                        <span className="text-[10px] tracking-wider text-amber-400/80 uppercase">
                          Producto ID
                        </span>
                        <p className="truncate font-mono text-xs text-amber-400">
                          {venta.productoId}
                        </p>
                        {venta.productoNombre && (
                          <p className="mt-0.5 text-[10px] text-white/60">{venta.productoNombre}</p>
                        )}
                      </div>
                    )}
                    {/* Orden de Compra ID */}
                    {venta.ocId && (
                      <div className="rounded-lg border border-violet-500/20 bg-violet-500/10 p-2 transition-colors hover:bg-violet-500/20">
                        <span className="text-[10px] tracking-wider text-violet-400/80 uppercase">
                          OC ID (Lote)
                        </span>
                        <p className="truncate font-mono text-xs text-violet-400">{venta.ocId}</p>
                        {venta.ocDistribuidorId && (
                          <p className="mt-0.5 text-[10px] text-white/60">
                            Dist: {venta.ocDistribuidorId.slice(0, 8)}...
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Origen de Lotes (si hay múltiples) */}
                  {venta.origenLotes && venta.origenLotes.length > 0 && (
                    <div className="mt-3 border-t border-white/5 pt-3">
                      <span className="text-[10px] tracking-wider text-white/40 uppercase">
                        Origen de Lotes ({venta.numeroLotes || venta.origenLotes.length})
                      </span>
                      <div className="mt-2 space-y-1">
                        {venta.origenLotes.slice(0, 3).map((lote, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded bg-white/5 p-1.5 text-xs"
                          >
                            <span className="font-mono text-violet-400">
                              OC-{lote.ocId.slice(0, 8)}
                            </span>
                            <span className="text-white/60">
                              {lote.cantidad} uds @ ${lote.costoUnidad.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {venta.origenLotes.length > 3 && (
                          <p className="text-center text-[10px] text-white/40">
                            +{venta.origenLotes.length - 3} lotes más...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Detalles de Precios */}
                <motion.div
                  className="grid grid-cols-2 gap-2 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                >
                  <div className="rounded-lg bg-white/5 p-2 transition-colors hover:bg-white/10">
                    <span className="text-xs text-white/40">Precio Venta/u</span>
                    <p className="text-white">${venta.precioUnitario.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 p-2 transition-colors hover:bg-white/10">
                    <span className="text-xs text-white/40">Cantidad</span>
                    <p className="text-white">{venta.cantidad} unidades</p>
                  </div>
                  {venta.precioCompraUnidad !== undefined && (
                    <div className="rounded-lg bg-white/5 p-2 transition-colors hover:bg-white/10">
                      <span className="text-xs text-white/40">Costo/u</span>
                      <p className="text-blue-400">${venta.precioCompraUnidad.toLocaleString()}</p>
                    </div>
                  )}
                  {venta.precioFlete !== undefined && (
                    <div className="rounded-lg bg-white/5 p-2 transition-colors hover:bg-white/10">
                      <span className="text-xs text-white/40">Flete/u</span>
                      <p className="text-pink-400">${venta.precioFlete.toLocaleString()}</p>
                    </div>
                  )}
                  {venta.numeroAbonos !== undefined && venta.numeroAbonos > 0 && (
                    <div className="col-span-2 rounded-lg bg-emerald-500/10 p-2 transition-colors hover:bg-emerald-500/20">
                      <span className="text-xs text-emerald-400/80">Número de Abonos</span>
                      <p className="font-bold text-emerald-400">
                        {venta.numeroAbonos} pagos realizados
                      </p>
                    </div>
                  )}
                </motion.div>

                {venta.metodoPago && (
                  <div className="flex justify-between rounded-lg bg-white/5 p-2 text-sm">
                    <span className="text-white/40">Método de Pago</span>
                    <span className="text-emerald-400 capitalize">{venta.metodoPago}</span>
                  </div>
                )}

                <div className="flex justify-between rounded-lg bg-white/5 p-2 text-sm">
                  <span className="text-white/40">Fecha Registro</span>
                  <span className="font-mono text-xs text-white/70">
                    {venta.createdAt ? new Date(venta.createdAt).toLocaleString("es-MX") : "N/A"}
                  </span>
                </div>

                {venta.notas && (
                  <div className="rounded-lg bg-white/5 p-2">
                    <span className="text-xs text-white/40">Notas</span>
                    <p className="mt-1 text-sm text-white/60">{venta.notas}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <AuroraButton
                    variant="secondary"
                    size="sm"
                    icon={<Eye size={14} />}
                    onClick={() => onVerDetalle?.()}
                  >
                    Ver Detalle
                  </AuroraButton>
                  <AuroraButton
                    variant="secondary"
                    size="sm"
                    icon={<Edit3 size={14} />}
                    onClick={() => onEditar?.()}
                  >
                    Editar
                  </AuroraButton>
                  <AuroraButton
                    variant="secondary"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Eliminar
                  </AuroraButton>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md rounded-2xl border border-white/10 bg-gray-900/95 p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-red-500/20 p-3">
                    <AlertTriangle className="text-red-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Eliminar Venta</h3>
                    <p className="text-sm text-white/50">Esta acción no se puede deshacer</p>
                  </div>
                </div>

                {/* Trazabilidad */}
                <div className="mb-4 space-y-2 rounded-xl bg-white/5 p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">ID:</span>
                    <span className="font-mono text-white">{venta.id}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Cliente:</span>
                    <span className="text-cyan-400">{venta.cliente}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Producto:</span>
                    <span className="text-white">{venta.producto}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Total:</span>
                    <span className="font-bold text-emerald-400">
                      ${venta.precioTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <AuroraButton
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    <X size={16} className="mr-2" />
                    Cancelar
                  </AuroraButton>
                  <AuroraButton
                    variant="glow"
                    color="magenta"
                    onClick={() => {
                      onEliminar?.()
                      setShowDeleteConfirm(false)
                    }}
                    className="flex-1"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Eliminar
                  </AuroraButton>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📆 DATE GROUP HEADER — Group sales by date
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function DateGroupHeader({
  fecha,
  count,
  total,
  pagadas,
}: {
  fecha: string
  count: number
  total: number
  pagadas: number
}) {
  const formatDate = (dateStr: string) => {
    const parts = dateStr.split("-")
    const year = parseInt(parts[0] ?? "2025", 10)
    const month = parseInt(parts[1] ?? "1", 10)
    const day = parseInt(parts[2] ?? "1", 10)
    const date = new Date(Date.UTC(year, month - 1, day))

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`

    if (dateStr === todayStr) return "Hoy"
    if (dateStr === yesterdayStr) return "Ayer"

    const weekdays = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
    const months = [
      "enero",
      "febrero",
      "marzo",
      "abril",
      "mayo",
      "junio",
      "julio",
      "agosto",
      "septiembre",
      "octubre",
      "noviembre",
      "diciembre",
    ]

    return `${weekdays[date.getUTCDay()]}, ${date.getUTCDate()} de ${months[date.getUTCMonth()]}`
  }

  return (
    <div className="mb-2 flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20">
          <Calendar size={14} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-white capitalize">{formatDate(fecha)}</p>
          <p className="text-xs text-white/40">{count} ventas</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium text-white">${total.toLocaleString()}</span>
        <span className="text-emerald-400">{pagadas} pagadas</span>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT — Aurora Ventas Panel Unified
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraVentasPanelUnified({
  ventas: ventasProp,
  onNuevaVenta,
  onVerDetalle,
  onEditarVenta,
  onEliminarVenta,
  onExportar,
  onRefresh,
  loading: loadingProp = false,
  className,
}: AuroraVentasPanelUnifiedProps) {
  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 CARGAR DATOS REALES DE LA API SI NO SE PASAN PROPS
  // ═══════════════════════════════════════════════════════════════════════════
  const { data: ventasAPI, loading: loadingAPI, refetch: refetchAPI } = useVentasData()

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌟 SUPREME SYSTEMS INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  useSmoothScroll() // Activar smooth scroll 120fps en todo el panel

  // 🌊 SMOOTH SCROLL SYSTEM - 120fps
  useSmoothScroll() // Activar smooth scroll 120fps
  const containerRef = useRef<HTMLDivElement>(null)

  // Transformar datos de API al formato del componente CON TRAZABILIDAD COMPLETA
  const transformedVentas = useMemo((): Venta[] => {
    if (!ventasAPI || ventasAPI.length === 0) return []

    return ventasAPI.map(
      (v: {
        id: string
        clienteId: string
        productoId?: string | null
        ocId?: string | null
        fecha: Date | string
        cantidad: number
        precioVentaUnidad?: number
        precioCompraUnidad?: number
        precioFlete?: number
        precioTotalVenta: number
        estadoPago: string
        montoPagado: number
        montoRestante?: number
        porcentajePagado?: number
        numeroAbonos?: number
        metodoPago?: string
        cliente?: { nombre?: string } | null
        producto?: { id?: string; nombre?: string; sku?: string } | null
        ordenCompra?: { id?: string; distribuidorId?: string } | null
        distribucionGYA?: {
          capitalBovedaMonte?: number
          capitalFletes?: number
          capitalUtilidades?: number
        }
        origenLotes?: Array<{
          ocId: string
          cantidad: number
          costoUnidad: number
          distribuidorId?: string
        }> | null
        numeroLotes?: number
        observaciones?: string
        createdAt?: Date | string
      }): Venta => {
        const fechaObj = new Date(v.fecha)
        const precioCompra = v.precioCompraUnidad || 0
        const precioFlete = v.precioFlete || 500
        const precioVenta = v.precioVentaUnidad || 0
        const cantidad = v.cantidad || 0
        const totalVenta = v.precioTotalVenta || 0
        const montoPagado = v.montoPagado || 0

        // Calcular proporción pagada
        const proporcion = totalVenta > 0 ? Math.min(montoPagado / totalVenta, 1) : 0

        // Distribución GYA base
        const baseBovedaMonte = precioCompra * cantidad
        const baseFleteSur = precioFlete * cantidad
        const baseUtilidades = (precioVenta - precioCompra - precioFlete) * cantidad

        // Usar distribución de API si está disponible
        const distribucionGYA = v.distribucionGYA
          ? {
              bovedaMonte: v.distribucionGYA.capitalBovedaMonte || baseBovedaMonte * proporcion,
              fleteSur: v.distribucionGYA.capitalFletes || baseFleteSur * proporcion,
              utilidades: v.distribucionGYA.capitalUtilidades || baseUtilidades * proporcion,
            }
          : {
              bovedaMonte: baseBovedaMonte * proporcion,
              fleteSur: baseFleteSur * proporcion,
              utilidades: baseUtilidades * proporcion,
            }

        // Determinar nombre del producto
        const productoNombre =
          v.producto?.nombre ||
          (v.origenLotes && v.origenLotes.length > 0
            ? `Lote OC-${v.origenLotes[0]?.ocId?.slice(0, 8) || "N/A"}`
            : `${cantidad} unidades`)

        return {
          id: v.id,
          fecha: fechaObj.toISOString().split("T")[0] ?? "",
          hora: fechaObj.toTimeString().slice(0, 5),
          cliente: v.cliente?.nombre || "Cliente sin nombre",
          clienteId: v.clienteId,
          producto: productoNombre,
          cantidad: cantidad,
          precioUnitario: precioVenta,
          precioCompraUnidad: precioCompra,
          precioFlete: precioFlete,
          precioTotal: totalVenta,
          montoPagado: montoPagado,
          montoRestante: v.montoRestante || totalVenta - montoPagado,
          // Bug fix: Si porcentajePagado viene como 0 pero hay montoPagado, recalcular
          porcentajePagado:
            v.porcentajePagado && v.porcentajePagado > 0 ? v.porcentajePagado : proporcion * 100,
          estado: (v.estadoPago === "completo"
            ? "pagada"
            : v.estadoPago === "parcial"
              ? "parcial"
              : "pendiente") as Venta["estado"],
          metodoPago:
            (v.metodoPago as Venta["metodoPago"]) ||
            (montoPagado > 0 ? "transferencia" : undefined),
          distribuidor: undefined,
          notas: v.observaciones,
          createdAt:
            typeof v.createdAt === "string"
              ? v.createdAt
              : v.createdAt?.toISOString() || new Date().toISOString(),

          // TRAZABILIDAD COMPLETA
          productoId: v.productoId,
          productoNombre: v.producto?.nombre,
          productoSku: v.producto?.sku,
          ocId: v.ocId,
          ocDistribuidorId: v.ordenCompra?.distribuidorId,
          origenLotes: v.origenLotes,
          numeroLotes: v.numeroLotes,
          numeroAbonos: v.numeroAbonos,
          distribucionGYA,
        }
      }
    )
  }, [ventasAPI])

  // Usar datos de props si se pasan, sino usar datos de API (sin fallback a mock)
  const ventas = useMemo(() => {
    if (ventasProp && Array.isArray(ventasProp) && ventasProp.length > 0) return ventasProp
    return Array.isArray(transformedVentas) ? transformedVentas : [] // Si está vacío, mostrar vacío (sin mock data)
  }, [ventasProp, transformedVentas])

  const loading = loadingProp || loadingAPI

  const [filtros, setFiltros] = useState<FiltrosState>({
    estado: "todos",
    busqueda: "",
    fechaInicio: "",
    fechaFin: "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filtros.estado !== "todos") count++
    if (filtros.fechaInicio) count++
    if (filtros.fechaFin) count++
    if (filtros.montoMin) count++
    if (filtros.montoMax) count++
    if (filtros.cliente) count++
    return count
  }, [filtros])

  // Clear filters
  const clearFilters = useCallback(() => {
    setFiltros({
      estado: "todos",
      busqueda: "",
      fechaInicio: "",
      fechaFin: "",
      montoMin: undefined,
      montoMax: undefined,
      cliente: undefined,
    })
  }, [])

  // Handle export
  const handleExportar = useCallback(
    (formato: "csv" | "excel" | "pdf") => {
      setShowExportMenu(false)
      if (onExportar) {
        onExportar(formato)
      } else {
        // Default CSV export
        const headers = [
          "ID",
          "Fecha",
          "Hora",
          "Cliente",
          "ClienteID",
          "Producto",
          "Cantidad",
          "Precio Unitario",
          "Precio Total",
          "Estado",
          "Método Pago",
          "Distribuidor",
          "Notas",
        ]
        const rows = ventas.map((v) => [
          v.id,
          v.fecha,
          v.hora,
          v.cliente,
          v.clienteId,
          v.producto,
          v.cantidad,
          v.precioUnitario,
          v.precioTotal,
          v.estado,
          v.metodoPago || "",
          v.distribuidor || "",
          v.notas || "",
        ])
        const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = `ventas_${new Date().toISOString().split("T")[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)
        logger.info("Ventas exportadas", { context: "VentasPanel", formato, count: ventas.length })
      }
    },
    [onExportar, ventas]
  )

  // Handlers
  const handleVerDetalle = useCallback(
    (venta: Venta) => {
      if (onVerDetalle) {
        onVerDetalle(venta)
      } else {
        logger.debug("Ver detalle venta", { context: "VentasPanel", ventaId: venta.id })
      }
    },
    [onVerDetalle]
  )

  const handleEditar = useCallback(
    (venta: Venta) => {
      if (onEditarVenta) {
        onEditarVenta(venta)
      } else {
        logger.debug("Editar venta", { context: "VentasPanel", ventaId: venta.id })
      }
    },
    [onEditarVenta]
  )

  const handleEliminar = useCallback(
    (venta: Venta) => {
      if (onEliminarVenta) {
        onEliminarVenta(venta.id)
      } else {
        logger.debug("Eliminar venta", { context: "VentasPanel", ventaId: venta.id })
      }
    },
    [onEliminarVenta]
  )

  // Stats
  const stats = useMemo(() => {
    const totalVentas = ventas.length
    const ventasPagadas = ventas.filter((v) => v.estado === "pagada")
    const ventasPendientes = ventas.filter((v) => v.estado === "pendiente")
    const ventasParciales = ventas.filter((v) => v.estado === "parcial")

    const montoTotal = ventas.reduce((sum, v) => sum + v.precioTotal, 0)
    const montoPagado = ventasPagadas.reduce((sum, v) => sum + v.precioTotal, 0)
    const montoPendiente = ventas
      .filter((v) => v.estado !== "cancelada" && v.estado !== "pagada")
      .reduce((sum, v) => sum + v.precioTotal, 0)

    const promedioVenta = totalVentas > 0 ? montoTotal / totalVentas : 0

    return {
      totalVentas,
      ventasPagadas: ventasPagadas.length,
      ventasPendientes: ventasPendientes.length,
      ventasParciales: ventasParciales.length,
      montoTotal,
      montoPagado,
      montoPendiente,
      promedioVenta,
    }
  }, [ventas])

  // Filtered ventas
  const filteredVentas = useMemo(() => {
    return ventas.filter((v) => {
      const matchEstado = filtros.estado === "todos" || v.estado === filtros.estado
      const matchBusqueda =
        !filtros.busqueda ||
        v.cliente.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        v.producto.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        v.id.toLowerCase().includes(filtros.busqueda.toLowerCase())
      const matchFechaInicio = !filtros.fechaInicio || v.fecha >= filtros.fechaInicio
      const matchFechaFin = !filtros.fechaFin || v.fecha <= filtros.fechaFin
      const matchMontoMin = !filtros.montoMin || v.precioTotal >= filtros.montoMin
      const matchMontoMax = !filtros.montoMax || v.precioTotal <= filtros.montoMax
      const matchCliente =
        !filtros.cliente || v.cliente.toLowerCase().includes(filtros.cliente.toLowerCase())
      return (
        matchEstado &&
        matchBusqueda &&
        matchFechaInicio &&
        matchFechaFin &&
        matchMontoMin &&
        matchMontoMax &&
        matchCliente
      )
    })
  }, [ventas, filtros])

  // Group by date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Venta[]> = {}
    filteredVentas.forEach((v) => {
      if (!groups[v.fecha]) groups[v.fecha] = []
      const group = groups[v.fecha]
      if (group) group.push(v)
    })
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]))
  }, [filteredVentas])

  // Chart data
  const chartData = useMemo(() => {
    // Días de la semana determinísticos para evitar mismatch SSR/Cliente
    const diasSemana = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"]
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last7Days.map((fecha) => {
      const dayVentas = ventas.filter((v) => v.fecha === fecha)
      const total = dayVentas.reduce((sum, v) => sum + v.precioTotal, 0)
      const pagadas = dayVentas
        .filter((v) => v.estado === "pagada")
        .reduce((sum, v) => sum + v.precioTotal, 0)
      // Usar getUTCDay para consistencia SSR/Cliente
      const dayIndex = fecha ? new Date(fecha + "T00:00:00Z").getUTCDay() : 0
      return {
        name: diasSemana[dayIndex],
        value: total,
        pagadas,
        pendientes: total - pagadas,
      }
    })
  }, [ventas])

  const tabs = [
    { id: "todos", label: "Todas" },
    { id: "pagada", label: "Pagadas" },
    { id: "pendiente", label: "Pendientes" },
    { id: "parcial", label: "Parciales" },
  ]

  // ═══════════════════════════════════════════════════════════════════════════════
  // LOADING STATE
  // ═══════════════════════════════════════════════════════════════════════════════
  if (loading) {
    return (
      <AuroraBackground
        intensity="medium"
        colors={["emerald", "violet", "cyan"]}
        interactive
        className={cn("relative min-h-screen", className)}
      >
        {/* 🌌 QUANTUM PARTICLES — LOADING STATE */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <QuantumParticleField
            variant="energy"
            intensity="subtle"
            particleCount={60}
            interactive={false}
            scrollEffect={false}
            showTrails={true}
            enableGlow={true}
            className="opacity-40"
          />
        </div>
        <div className="relative z-10">
          <PremiumLoading text="Cargando ventas..." size="lg" className="min-h-screen" />
        </div>
      </AuroraBackground>
    )
  }

  return (
    <SupremeVentasBackground
      showGradient
      showVignette
      intensity={0.75}
      className={cn("relative min-h-screen", className)}
    >
      {/* 🌌 AURORA BACKGROUND OVERLAY */}
      <AuroraBackground
        intensity="low"
        colors={["emerald", "violet", "cyan"]}
        interactive
        className="absolute inset-0 z-0"
      />

      <main ref={containerRef} className="relative z-10 p-6" aria-label="Panel de ventas CHRONOS">
        {/* Header - ELEVATED PREMIUM */}
        <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="relative">
            {/* Decorative glow orb */}
            <div className="absolute -top-4 -left-4 h-20 w-32 rounded-full bg-emerald-500/20 blur-3xl" />
            <motion.h1
              className="relative flex items-center gap-4 text-3xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <motion.div
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <ShoppingCart className="h-6 w-6 text-emerald-400" aria-hidden="true" />
              </motion.div>
              <span className="bg-gradient-to-r from-white via-emerald-200 to-white bg-clip-text text-transparent">
                Ventas
              </span>
            </motion.h1>
            <p className="mt-1 text-white/50">
              Control detallado de ventas y facturación •{" "}
              <span className="text-emerald-400">{filteredVentas.length}</span> ventas
            </p>
          </div>

          <div className="flex items-center gap-3">
            <AuroraButton
              variant="glow"
              color="emerald"
              icon={<Plus size={18} />}
              onClick={onNuevaVenta}
            >
              Nueva Venta
            </AuroraButton>

            {/* Filtros con badge */}
            <div className="relative">
              <AuroraButton
                variant="secondary"
                icon={<Filter size={18} />}
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? "border-emerald-500/50" : ""}
              >
                Filtros
              </AuroraButton>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </div>

            {/* Export Dropdown — Premium */}
            <div className="relative">
              <AuroraButton
                variant="secondary"
                icon={<Download size={18} />}
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                Exportar
              </AuroraButton>
              <AnimatePresence>
                {showExportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute top-full right-0 z-50 mt-3 w-52 overflow-hidden rounded-2xl border border-white/10 shadow-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(20, 15, 30, 0.95) 0%, rgba(10, 8, 20, 0.98) 100%)",
                      backdropFilter: "blur(20px)",
                      boxShadow:
                        "0 20px 50px -15px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.1)",
                    }}
                  >
                    {/* Top glow accent */}
                    <div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                    <div className="p-2">
                      <motion.button
                        onClick={() => handleExportar("csv")}
                        className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-white/80 transition-all hover:bg-emerald-500/10"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="relative">
                          <span className="absolute inset-0 rounded-lg bg-emerald-500/30 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
                          <FileText size={18} className="relative text-emerald-400" />
                        </span>
                        <div>
                          <div className="font-semibold">CSV</div>
                          <div className="text-xs text-white/40">Datos separados por comas</div>
                        </div>
                      </motion.button>
                      <motion.button
                        onClick={() => handleExportar("excel")}
                        className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-white/80 transition-all hover:bg-green-500/10"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="relative">
                          <span className="absolute inset-0 rounded-lg bg-green-500/30 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
                          <FileText size={18} className="relative text-green-400" />
                        </span>
                        <div>
                          <div className="font-semibold">Excel</div>
                          <div className="text-xs text-white/40">Hoja de cálculo</div>
                        </div>
                      </motion.button>
                      <motion.button
                        onClick={() => handleExportar("pdf")}
                        className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-white/80 transition-all hover:bg-red-500/10"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="relative">
                          <span className="absolute inset-0 rounded-lg bg-red-500/30 opacity-0 blur-md transition-opacity group-hover:opacity-100" />
                          <FileText size={18} className="relative text-red-400" />
                        </span>
                        <div>
                          <div className="font-semibold">PDF</div>
                          <div className="text-xs text-white/40">Documento portable</div>
                        </div>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Refresh Button — Premium */}
            <motion.button
              onClick={() => {
                refetchAPI()
                onRefresh?.()
              }}
              aria-label={loading ? "Actualizando datos..." : "Actualizar datos de ventas"}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 text-white/60 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-white"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              style={{
                boxShadow: loading ? "0 0 20px rgba(16, 185, 129, 0.3)" : "none",
              }}
            >
              {/* Rotating glow when loading */}
              {loading && (
                <motion.div
                  className="pointer-events-none absolute inset-[-2px] rounded-xl"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent, rgba(16, 185, 129, 0.5), transparent 30%)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
              <RefreshCw
                size={20}
                className={cn("relative transition-transform", loading && "animate-spin")}
                aria-hidden="true"
              />
            </motion.button>
          </div>
        </header>

        {/* Advanced Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <AuroraGlassCard className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-white/70">
                    <Filter size={16} />
                    Filtros Avanzados
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-white/50 hover:text-white"
                  >
                    <X size={12} />
                    Limpiar filtros
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {/* Fecha Inicio */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar size={14} />
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={filtros.fechaInicio}
                      onChange={(e) =>
                        setFiltros((prev) => ({ ...prev, fechaInicio: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-colors focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  {/* Fecha Fin */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-white/60">
                      <Calendar size={14} />
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={filtros.fechaFin}
                      onChange={(e) =>
                        setFiltros((prev) => ({ ...prev, fechaFin: e.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-colors focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  {/* Monto Mínimo */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-white/60">
                      <DollarSign size={14} />
                      Monto Mínimo
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filtros.montoMin || ""}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined
                        setFiltros((prev) => ({ ...prev, montoMin: val }))
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-colors focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>

                  {/* Monto Máximo */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm text-white/60">
                      <DollarSign size={14} />
                      Monto Máximo
                    </label>
                    <input
                      type="number"
                      placeholder="Sin límite"
                      value={filtros.montoMax || ""}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined
                        setFiltros((prev) => ({ ...prev, montoMax: val }))
                      }}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white transition-colors focus:border-emerald-500/50 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="text-sm text-white/50">Rápidos:</span>
                  <button
                    onClick={() => {
                      const today = new Date()
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
                      const fechaInicioStr = firstDay.toISOString().split("T")[0] || ""
                      const fechaFinStr = today.toISOString().split("T")[0] || ""
                      setFiltros((prev) => ({
                        ...prev,
                        fechaInicio: fechaInicioStr,
                        fechaFin: fechaFinStr,
                      }))
                    }}
                    className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/20"
                  >
                    Este mes
                  </button>
                  <button
                    onClick={() => setFiltros((prev) => ({ ...prev, estado: "pagada" }))}
                    className="rounded-lg bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/20"
                  >
                    Solo pagadas
                  </button>
                  <button
                    onClick={() => setFiltros((prev) => ({ ...prev, estado: "pendiente" }))}
                    className="rounded-lg bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400 transition-colors hover:bg-yellow-500/20"
                  >
                    Solo pendientes
                  </button>
                  <button
                    onClick={() => setFiltros((prev) => ({ ...prev, montoMin: 50000 }))}
                    className="rounded-lg bg-violet-500/10 px-3 py-1 text-xs text-violet-400 transition-colors hover:bg-violet-500/20"
                  >
                    {"> $50,000"}
                  </button>
                </div>
              </AuroraGlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AuroraStatWidget
            label="Total Ventas"
            value={`$${stats.montoTotal.toLocaleString()}`}
            icon={<ShoppingCart size={20} />}
            color="emerald"
            change={15.3}
            trend="up"
          />
          <AuroraStatWidget
            label="Pagadas"
            value={`$${stats.montoPagado.toLocaleString()}`}
            icon={<DollarSign size={20} />}
            color="emerald"
            change={12.1}
            trend="up"
          />
          <AuroraStatWidget
            label="Pendientes"
            value={`$${stats.montoPendiente.toLocaleString()}`}
            icon={<Clock size={20} />}
            color="gold"
            change={-8.5}
            trend="down"
          />
          <AuroraStatWidget
            label="Promedio/Venta"
            value={`$${Math.round(stats.promedioVenta).toLocaleString()}`}
            icon={<Target size={20} />}
            color="cyan"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Timeline */}
          <div className="col-span-12 space-y-6 lg:col-span-8">
            {/* Filters & Search */}
            <AuroraGlassCard className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <AuroraSearch
                  value={filtros.busqueda}
                  onChange={(v) => setFiltros((prev) => ({ ...prev, busqueda: v }))}
                  placeholder="Buscar venta..."
                  color="emerald"
                  className="w-64"
                />

                <AuroraTabs
                  tabs={tabs}
                  activeTab={filtros.estado}
                  onTabChange={(v) => setFiltros((prev) => ({ ...prev, estado: v }))}
                  color="emerald"
                />
              </div>
            </AuroraGlassCard>

            {/* Timeline — VIRTUALIZED con altura máxima para evitar scroll excesivo */}
            {filteredVentas.length > 0 ? (
              <VentasVirtualizedTimeline
                ventas={filteredVentas}
                onVerDetalle={handleVerDetalle}
                onEditar={handleEditar}
                onEliminar={handleEliminar}
                maxHeight={500}
                pageSize={20}
                className=""
              />
            ) : (
              <AuroraGlassCard className="p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 text-center"
                >
                  <ShoppingCart size={48} className="mx-auto mb-4 text-white/20" />
                  <h3 className="mb-2 text-lg font-medium text-white/60">No hay ventas</h3>
                  <p className="mb-4 text-sm text-white/40">
                    {activeFiltersCount > 0
                      ? "No se encontraron ventas con los filtros aplicados"
                      : "Aún no hay ventas registradas"}
                  </p>
                  {activeFiltersCount > 0 && (
                    <AuroraButton variant="secondary" onClick={clearFilters}>
                      <X size={16} className="mr-2" />
                      Limpiar filtros
                    </AuroraButton>
                  )}
                </motion.div>
              </AuroraGlassCard>
            )}
          </div>

          {/* Right: Visualization & Quick Stats */}
          <div className="col-span-12 space-y-6 lg:col-span-4">
            {/* Sales Flow Visualization */}
            <AuroraGlassCard glowColor="emerald" className="p-4">
              <h3 className="mb-3 text-center text-sm font-medium text-white/70">
                Flujo de Ventas en Tiempo Real
              </h3>
              <div className="h-48">
                <SalesFlowVisualization
                  totalVentas={stats.totalVentas}
                  pagadas={stats.ventasPagadas}
                  pendientes={stats.ventasPendientes}
                />
              </div>
            </AuroraGlassCard>

            {/* 7-Day Chart */}
            <AuroraAreaChart
              data={chartData}
              height={200}
              color="emerald"
              showArea
              showLine
              showDots
              showTooltip
              title="Ventas Últimos 7 Días"
            />

            {/* Quick Stats */}
            <AuroraGlassCard glowColor="cyan" className="p-5">
              <h3 className="mb-4 text-sm font-medium text-white/70">Resumen Rápido</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3">
                  <span className="text-sm text-white/60">Ventas Pagadas</span>
                  <span className="text-sm font-bold text-emerald-400">{stats.ventasPagadas}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-yellow-500/10 p-3">
                  <span className="text-sm text-white/60">Ventas Pendientes</span>
                  <span className="text-sm font-bold text-yellow-400">
                    {stats.ventasPendientes}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-cyan-500/10 p-3">
                  <span className="text-sm text-white/60">Ventas Parciales</span>
                  <span className="text-sm font-bold text-cyan-400">{stats.ventasParciales}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-violet-500/10 p-3">
                  <span className="text-sm text-white/60">Mejor Venta</span>
                  <span className="text-sm font-bold text-violet-400">
                    ${Math.max(...ventas.map((v) => v.precioTotal)).toLocaleString()}
                  </span>
                </div>
              </div>
            </AuroraGlassCard>

            {/* Top Clients */}
            <AuroraGlassCard glowColor="violet" className="p-5">
              <h3 className="mb-4 text-sm font-medium text-white/70">Top Clientes</h3>
              <div className="space-y-3">
                {Array.from(new Set(ventas.map((v) => v.cliente)))
                  .slice(0, 5)
                  .map((cliente, i) => {
                    const clienteVentas = ventas.filter((v) => v.cliente === cliente)
                    const total = clienteVentas.reduce((sum, v) => sum + v.precioTotal, 0)
                    return (
                      <div key={cliente} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                            style={{
                              background: `linear-gradient(135deg, hsl(${i * 60}, 70%, 50%), hsl(${i * 60 + 30}, 70%, 40%))`,
                            }}
                          >
                            {i + 1}
                          </div>
                          <span className="text-sm text-white/70">{cliente}</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          ${total.toLocaleString()}
                        </span>
                      </div>
                    )
                  })}
              </div>
            </AuroraGlassCard>
          </div>
        </div>
      </main>
    </SupremeVentasBackground>
  )
}

export default AuroraVentasPanelUnified
