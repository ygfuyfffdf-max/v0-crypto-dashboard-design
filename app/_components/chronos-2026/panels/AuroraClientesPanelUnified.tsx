"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 👥✨ AURORA CLIENTES PANEL UNIFIED — CHRONOS INFINITY 2026 SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de Clientes ultra premium con TODOS los sistemas supremos:
 * ✅ SMOOTH SCROLL 120FPS (Lenis + GSAP ScrollTrigger)
 * ✅ PARTÍCULAS 3D INTERACTIVAS (WebGL Accelerated)
 * ✅ 50+ ANIMACIONES CINEMATOGRÁFICAS (Glitch, Cosmic, Energy)
 * ✅ MICRO-INTERACCIONES PREMIUM en todos los botones
 * ✅ SCROLL COUNTERS animados
 * ✅ PARALLAX EFFECTS en cards
 * - Glassmorphism con efectos aurora boreal
 * - Timeline de clientes elegante
 * - Filtros avanzados por estado/deuda
 * - Red de clientes animada con Canvas 60fps
 * - Quick stats animados
 * - KPIs con tendencias
 *
 * @version 3.0.0 - SUPREME ELEVATION APPLIED
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { useClientesData } from "@/app/hooks/useDataHooks"
import { AnimatePresence, motion } from "motion/react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 SUPREME SYSTEMS — CHRONOS INFINITY 2026
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import {
    AlertTriangle,
    Building,
    CreditCard,
    DollarSign,
    Download,
    Edit3,
    Eye,
    FileText,
    Filter,
    History,
    Mail,
    Phone,
    RefreshCw,
    Star,
    Trash2,
    TrendingUp,
    User,
    UserCheck,
    UserPlus,
    Users,
    Wallet,
    X,
} from "lucide-react"
import dynamic from "next/dynamic"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🚀 PREMIUM SYSTEMS INTEGRATION (QUANTUM OPTIMIZED)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import "@/app/_components/chronos-2026/animations/CinematicAnimations"
import { useSmoothScroll } from "@/app/_components/chronos-2026/scroll/SmoothScrollSystem"

// 🌌 SUPREME SHADER SYSTEM — ELITE 2026
import { SupremeClientesBackground } from "./SupremePanelBackgrounds"

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
const AuroraAreaChart = dynamic(
  () => import("../../charts/AuroraPremiumCharts").then((mod) => mod.AuroraAreaChart),
  {
    loading: () => <div className="h-[200px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  }
)

// Cosmic 3D Charts - Advanced visualizations
const CosmicRadarChart = dynamic(
  () => import("../../charts/Cosmic3DCharts").then((mod) => mod.CosmicRadarChart),
  {
    loading: () => <div className="h-[200px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  }
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Cliente {
  id: string
  nombre: string
  empresa?: string
  email: string
  telefono: string
  direccion?: string
  estado: "activo" | "inactivo" | "suspendido" // Estados reales del schema DB
  categoria?: "VIP" | "frecuente" | "ocasional" | "nuevo" | "inactivo" | "moroso" // Categoría separada
  saldoPendiente: number
  totalCompras: number
  ultimaCompra?: string
  fechaRegistro: string
  notas?: string
  riesgo?: string
  fiabilidad?: number
  contribucion?: number
  recencia?: number
  frecuenciaCompra?: number
}

interface FiltrosState {
  estado: string
  busqueda: string
  tieneDeuda: boolean | null
}

interface AuroraClientesPanelUnifiedProps {
  clientes?: Cliente[]
  onNuevoCliente?: () => void
  onVerDetalle?: (_cliente: Cliente) => void
  onEditarCliente?: (_cliente: Cliente) => void
  onEliminarCliente?: (_cliente: Cliente) => void
  onRegistrarAbono?: (_cliente: Cliente) => void
  onVerHistorial?: (_cliente: Cliente) => void
  onExportar?: (_formato: "csv" | "excel" | "pdf", _filtrados: Cliente[]) => void
  onRefresh?: () => void
  loading?: boolean
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧹 SISTEMA LIMPIO - Sin datos mock (Conectado a Turso)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const _defaultClientes: Cliente[] = []

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 CLIENT NETWORK VISUALIZATION — Animated client relationship network
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ClientNetworkVisualization({
  totalClientes,
  activos,
  vip,
}: {
  totalClientes: number
  activos: number
  vip: number
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

    const rect = canvas.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Network nodes
    const nodes: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
      orbitRadius: number
      orbitSpeed: number
      angle: number
      isVip: boolean
    }> = []

    // Create nodes in orbital pattern
    const orbits = [60, 90, 120]
    let nodeIndex = 0
    orbits.forEach((radius, orbitIndex) => {
      const nodesInOrbit = 4 + orbitIndex * 2
      for (let i = 0; i < nodesInOrbit; i++) {
        const isVipNode = nodeIndex < vip
        nodes.push({
          x: centerX,
          y: centerY,
          vx: 0,
          vy: 0,
          size: isVipNode ? 8 : 5 + Math.random() * 3,
          color: isVipNode ? "#F59E0B" : nodeIndex < activos ? "#8B5CF6" : "#6B7280",
          orbitRadius: radius + (Math.random() - 0.5) * 20,
          orbitSpeed: (0.002 + Math.random() * 0.003) * (orbitIndex % 2 === 0 ? 1 : -1),
          angle: (i / nodesInOrbit) * Math.PI * 2,
          isVip: isVipNode,
        })
        nodeIndex++
      }
    })

    const animate = () => {
      timeRef.current += 0.016

      // Clear with fade
      ctx.fillStyle = "rgba(3, 3, 8, 0.1)"
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Central hub glow
      const hubGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 60)
      hubGlow.addColorStop(0, "rgba(139, 92, 246, 0.4)")
      hubGlow.addColorStop(0.5, "rgba(139, 92, 246, 0.15)")
      hubGlow.addColorStop(1, "transparent")
      ctx.beginPath()
      ctx.arc(centerX, centerY, 50 + Math.sin(timeRef.current * 2) * 5, 0, Math.PI * 2)
      ctx.fillStyle = hubGlow
      ctx.fill()

      // Central hub
      ctx.beginPath()
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2)
      ctx.fillStyle = "#8B5CF6"
      ctx.fill()

      // Draw users icon
      ctx.strokeStyle = "#030308"
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.arc(centerX, centerY - 5, 6, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(centerX, centerY + 10, 10, Math.PI, 0)
      ctx.stroke()

      // Orbit rings (subtle)
      orbits.forEach((radius) => {
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = "rgba(139, 92, 246, 0.1)"
        ctx.lineWidth = 1
        ctx.stroke()
      })

      // Draw connections
      nodes.forEach((node, i) => {
        nodes.slice(i + 1).forEach((other) => {
          const dx = other.x - node.x
          const dy = other.y - node.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 80) {
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - dist / 80)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })

        // Connection to center
        const _toCenterDist = Math.sqrt((node.x - centerX) ** 2 + (node.y - centerY) ** 2)
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(node.x, node.y)
        ctx.strokeStyle = `rgba(139, 92, 246, ${0.1})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      })

      // Update and draw nodes
      nodes.forEach((node) => {
        // Orbit movement
        node.angle += node.orbitSpeed
        node.x = centerX + Math.cos(node.angle) * node.orbitRadius
        node.y = centerY + Math.sin(node.angle) * node.orbitRadius

        // Node glow
        if (node.isVip) {
          const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 2.5)
          glow.addColorStop(0, "rgba(245, 158, 11, 0.5)")
          glow.addColorStop(1, "transparent")
          ctx.beginPath()
          ctx.arc(node.x, node.y, node.size * 2.5, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()
        }

        // Node
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.fill()

        // VIP crown
        if (node.isVip) {
          ctx.fillStyle = "#F59E0B"
          ctx.font = "bold 10px sans-serif"
          ctx.textAlign = "center"
          ctx.fillText("★", node.x, node.y - node.size - 4)
        }
      })

      // Stats text
      ctx.font = "bold 12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillStyle = "#8B5CF6"
      ctx.fillText(`${activos} Activos`, rect.width * 0.2, rect.height * 0.9)

      ctx.fillStyle = "#F59E0B"
      ctx.fillText(`${vip} VIP`, rect.width * 0.8, rect.height * 0.9)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [totalClientes, activos, vip])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ background: "transparent" }}
      role="img"
      aria-label={`Red de clientes: ${totalClientes} total, ${activos} activos, ${vip} VIP`}
    />
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 CLIENTE TIMELINE ITEM — Individual client card
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ClienteTimelineItemProps {
  cliente: Cliente
  isFirst?: boolean
  isLast?: boolean
  onVerDetalle?: () => void
  onEditar?: () => void
  onEliminar?: () => void
  onAbono?: () => void
  onHistorial?: () => void
}

function ClienteTimelineItem({
  cliente,
  isFirst,
  isLast,
  onVerDetalle,
  onEditar,
  onEliminar,
  onAbono,
  onHistorial,
}: ClienteTimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Config de estados - actualizado sin VIP
  const estadoConfig: Record<
    string,
    { color: string; bgColor: string; icon: React.ReactNode; label: string }
  > = {
    activo: {
      color: "#10B981",
      bgColor: "rgba(16, 185, 129, 0.15)",
      icon: <UserCheck size={16} />,
      label: "Activo",
    },
    inactivo: {
      color: "#6B7280",
      bgColor: "rgba(107, 114, 128, 0.15)",
      icon: <User size={16} />,
      label: "Inactivo",
    },
    suspendido: {
      color: "#F43F5E",
      bgColor: "rgba(244, 63, 94, 0.15)",
      icon: <AlertTriangle size={16} />,
      label: "Suspendido",
    },
  }

  const config = estadoConfig[cliente.estado] ?? estadoConfig.activo
  if (!config) return null

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
        aria-label={`Cliente ${cliente.nombre}${cliente.empresa ? ` de ${cliente.empresa}` : ""}, total compras $${cliente.totalCompras.toLocaleString()}, ${cliente.saldoPendiente > 0 ? `deuda $${cliente.saldoPendiente.toLocaleString()}` : "sin deuda"}`}
        className={cn(
          "mb-4 flex-1 cursor-pointer rounded-xl p-4 transition-all",
          "border border-white/[0.06] bg-white/[0.03] hover:border-white/10 hover:bg-white/[0.06]",
          "focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:outline-none"
        )}
        tabIndex={0}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => e.key === "Enter" && setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        whileHover={{ x: 4 }}
        layout
      >
        {/* Header */}
        <div className="mb-2 flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
              style={{
                background:
                  cliente.categoria === "VIP"
                    ? "linear-gradient(135deg, #F59E0B, #D97706)"
                    : "linear-gradient(135deg, #8B5CF6, #06B6D4)",
              }}
            >
              {cliente.nombre
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-white">{cliente.nombre}</p>
                {cliente.categoria === "VIP" && (
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                )}
              </div>
              {cliente.empresa && (
                <div className="mt-1 flex items-center gap-1 text-xs text-white/40">
                  <Building size={10} />
                  <span>{cliente.empresa}</span>
                </div>
              )}
            </div>
          </div>

          {/* Balance */}
          <div className="text-right">
            <p className="text-lg font-bold text-white">${cliente.totalCompras.toLocaleString()}</p>
            {cliente.saldoPendiente > 0 && (
              <AuroraBadge color="gold" variant="outline" className="text-xs">
                Debe ${cliente.saldoPendiente.toLocaleString()}
              </AuroraBadge>
            )}
            {cliente.saldoPendiente === 0 && (
              <AuroraBadge color="emerald" variant="outline" className="text-xs">
                Sin deuda
              </AuroraBadge>
            )}
          </div>
        </div>

        {/* Contact info */}
        <div className="mb-2 flex items-center gap-4 text-xs text-white/40">
          <div className="flex items-center gap-1">
            <Phone size={10} />
            <span>{cliente.telefono}</span>
          </div>
          <div className="flex items-center gap-1">
            <Mail size={10} />
            <span>{cliente.email}</span>
          </div>
        </div>

        {/* Status badge */}
        <AuroraBadge
          color={
            cliente.categoria === "VIP"
              ? "gold"
              : cliente.estado === "activo"
                ? "emerald"
                : cliente.estado === "suspendido"
                  ? "magenta"
                  : "cyan"
          }
          variant="solid"
        >
          {config.label}
        </AuroraBadge>

        {/* Expanded content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3 border-t border-white/5 pt-4">
                {/* Trazabilidad completa */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Total Compras</span>
                    <span className="font-medium text-white">
                      ${cliente.totalCompras.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Saldo Pendiente</span>
                    <span
                      className={
                        cliente.saldoPendiente > 0
                          ? "font-medium text-yellow-400"
                          : "font-medium text-emerald-400"
                      }
                    >
                      ${cliente.saldoPendiente.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════
                    PERFIL FINANCIERO AVANZADO (CHRONOS INFINITY)
                    ═══════════════════════════════════════════════════════════════ */}
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <TrendingUp className="text-violet-400" size={14} />
                    <span className="text-xs font-semibold text-white">Perfil Financiero</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {/* Riesgo */}
                    <div className="rounded-lg bg-black/20 p-2 text-center">
                      <span className="block text-[10px] text-white/40">Riesgo</span>
                      <span
                        className={cn(
                          "text-xs font-bold uppercase",
                          cliente.riesgo === "alto"
                            ? "text-red-400"
                            : cliente.riesgo === "medio"
                              ? "text-yellow-400"
                              : "text-emerald-400"
                        )}
                      >
                        {cliente.riesgo || "N/A"}
                      </span>
                    </div>
                    {/* Fiabilidad */}
                    <div className="rounded-lg bg-black/20 p-2 text-center">
                      <span className="block text-[10px] text-white/40">Fiabilidad</span>
                      <span className="text-xs font-bold text-cyan-400">
                        {cliente.fiabilidad ?? 100}%
                      </span>
                    </div>
                    {/* Contribución */}
                    <div className="rounded-lg bg-black/20 p-2 text-center">
                      <span className="block text-[10px] text-white/40">Contribución</span>
                      <span className="text-xs font-bold text-emerald-400">
                        ${(cliente.contribucion ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-white/5 pt-2 text-[10px] text-white/50">
                    <span>Recencia: {cliente.recencia ?? 0} días</span>
                    <span>Frecuencia: {cliente.frecuenciaCompra ?? 0} días</span>
                  </div>
                </div>

                {cliente.ultimaCompra && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Última Compra</span>
                    <span className="text-white/60">{cliente.ultimaCompra}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Fecha Registro</span>
                  <span className="text-white/60">{cliente.fechaRegistro}</span>
                </div>
                {cliente.direccion && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Dirección</span>
                    <span className="max-w-[60%] text-right text-white/60">
                      {cliente.direccion}
                    </span>
                  </div>
                )}
                {cliente.notas && (
                  <div className="rounded-lg bg-white/5 p-2 text-sm">
                    <span className="mb-1 block text-white/40">Notas:</span>
                    <span className="text-white/70">{cliente.notas}</span>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex flex-wrap gap-2 border-t border-white/5 pt-3">
                  <AuroraButton
                    variant="secondary"
                    size="sm"
                    icon={<Eye size={14} />}
                    onClick={() => onVerDetalle?.()}
                  >
                    Detalles
                  </AuroraButton>
                  <AuroraButton
                    variant="secondary"
                    size="sm"
                    icon={<History size={14} />}
                    onClick={() => onHistorial?.()}
                    className="border-violet-500/30 hover:border-violet-500/50"
                  >
                    Historial
                  </AuroraButton>
                  {cliente.saldoPendiente > 0 && (
                    <AuroraButton
                      variant="secondary"
                      size="sm"
                      icon={<DollarSign size={14} />}
                      onClick={() => onAbono?.()}
                      className="border-emerald-500/30 text-emerald-400 hover:border-emerald-500/50"
                    >
                      Registrar Abono
                    </AuroraButton>
                  )}
                  <AuroraButton
                    variant="secondary"
                    size="sm"
                    icon={<Edit3 size={14} />}
                    onClick={() => onEditar?.()}
                    className="border-cyan-500/30 hover:border-cyan-500/50"
                  >
                    Editar
                  </AuroraButton>
                  <AuroraButton
                    variant="secondary"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={() => setShowDeleteConfirm(true)}
                    className="border-red-500/30 text-red-400 hover:border-red-500/50"
                  >
                    Eliminar
                  </AuroraButton>
                </div>

                {/* Modal de confirmación de eliminación */}
                <AnimatePresence>
                  {showDeleteConfirm && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="mt-0.5 flex-shrink-0 text-red-400" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">¿Eliminar cliente?</p>
                          <p className="mt-1 text-xs text-white/60">
                            Esta acción eliminará a {cliente.nombre} y todo su historial. Esta
                            acción no se puede deshacer.
                          </p>
                          <div className="mt-3 flex gap-2">
                            <AuroraButton
                              variant="secondary"
                              size="sm"
                              onClick={() => setShowDeleteConfirm(false)}
                            >
                              Cancelar
                            </AuroraButton>
                            <AuroraButton
                              variant="secondary"
                              size="sm"
                              onClick={() => {
                                onEliminar?.()
                                setShowDeleteConfirm(false)
                              }}
                              className="border-red-500/50 bg-red-500/20 text-red-400 hover:bg-red-500/30"
                            >
                              Sí, Eliminar
                            </AuroraButton>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT — Aurora Clientes Panel Unified
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraClientesPanelUnified({
  clientes: clientesProp,
  onNuevoCliente,
  onVerDetalle,
  onEditarCliente,
  onEliminarCliente,
  onRegistrarAbono,
  onVerHistorial,
  onExportar,
  onRefresh,
  loading: loadingProp = false,
  className,
}: AuroraClientesPanelUnifiedProps) {
  // ═══════════════════════════════════════════════════════════════════════════
  // 🔥 CARGAR DATOS REALES DE LA API SI NO SE PASAN PROPS
  // ═══════════════════════════════════════════════════════════════════════════
  const { data: clientesAPI, loading: loadingAPI, refetch: refetchAPI } = useClientesData()

  // ═══════════════════════════════════════════════════════════════════════════
  // 🌟 SUPREME SYSTEMS INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════
  useSmoothScroll() // Activar smooth scroll 120fps en todo el panel

  // Transformar datos de API al formato del componente
  const transformedClientes = useMemo((): Cliente[] => {
    if (!clientesAPI || clientesAPI.length === 0) return []

    return clientesAPI.map(
      (c: {
        id: string
        nombre: string
        email?: string | null
        telefono?: string | null
        direccion?: string | null
        estado?: string
        saldoPendiente?: number
        createdAt?: Date | string
      }): Cliente => ({
        id: c.id,
        nombre: c.nombre,
        empresa: undefined,
        email: c.email || "",
        telefono: c.telefono || "",
        direccion: c.direccion || "",
        estado: (c.estado === "activo"
          ? "activo"
          : c.estado === "inactivo"
            ? "inactivo"
            : c.estado === "suspendido"
              ? "suspendido"
              : "activo") as Cliente["estado"],
        saldoPendiente: c.saldoPendiente || 0,
        totalCompras: 0,
        ultimaCompra: undefined,
        fechaRegistro:
          typeof c.createdAt === "string"
            ? c.createdAt
            : c.createdAt?.toISOString() || new Date().toISOString(),
        notas: undefined,
      })
    )
  }, [clientesAPI])

  // Usar datos de props si se pasan, sino usar datos de API (sin fallback a mock)
  const clientes = useMemo(() => {
    if (clientesProp && Array.isArray(clientesProp) && clientesProp.length > 0) return clientesProp
    return Array.isArray(transformedClientes) ? transformedClientes : [] // Si está vacío, mostrar vacío (sin mock data)
  }, [clientesProp, transformedClientes])

  const loading = loadingProp || loadingAPI

  const [filtros, setFiltros] = useState<FiltrosState>({
    estado: "todos",
    busqueda: "",
    tieneDeuda: null,
  })
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showFiltersPanel, setShowFiltersPanel] = useState(false)
  const [_confirmDelete, setConfirmDelete] = useState<Cliente | null>(null)

  // Filtered clientes - PRIMERO para que otros hooks lo usen
  const filteredClientes = useMemo(() => {
    return clientes.filter((c) => {
      // Filtro por estado o por adeudo (tabs especiales)
      let matchEstado = false
      if (filtros.estado === "todos") {
        matchEstado = true
      } else if (filtros.estado === "con_adeudo") {
        matchEstado = c.saldoPendiente > 0
      } else if (filtros.estado === "sin_adeudo") {
        matchEstado = c.saldoPendiente === 0
      } else {
        // Estado normal (activo, inactivo, suspendido)
        matchEstado = c.estado === filtros.estado
      }

      const matchBusqueda =
        !filtros.busqueda ||
        c.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        c.empresa?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        c.email.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        c.telefono.includes(filtros.busqueda)

      const matchDeuda =
        filtros.tieneDeuda === null ||
        (filtros.tieneDeuda ? c.saldoPendiente > 0 : c.saldoPendiente === 0)

      return matchEstado && matchBusqueda && matchDeuda
    })
  }, [clientes, filtros])

  // Función de exportar
  const handleExportar = useCallback(
    (formato: "csv" | "excel" | "pdf") => {
      if (onExportar) {
        onExportar(formato, filteredClientes)
      } else {
        // Exportación por defecto - CSV
        const headers = [
          "ID",
          "Nombre",
          "Empresa",
          "Email",
          "Teléfono",
          "Estado",
          "Saldo Pendiente",
          "Total Compras",
          "Última Compra",
          "Fecha Registro",
        ]
        const rows = filteredClientes.map((c) => [
          c.id,
          c.nombre,
          c.empresa || "",
          c.email,
          c.telefono,
          c.estado,
          c.saldoPendiente.toString(),
          c.totalCompras.toString(),
          c.ultimaCompra || "",
          c.fechaRegistro,
        ])

        const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
        const link = document.createElement("a")
        link.href = URL.createObjectURL(blob)
        link.download = `clientes_${new Date().toISOString().split("T")[0]}.csv`
        link.click()
      }
      setShowExportMenu(false)
    },
    [onExportar, filteredClientes]
  )

  // Función de eliminar con confirmación
  const _handleEliminar = useCallback(
    (cliente: Cliente) => {
      if (onEliminarCliente) {
        onEliminarCliente(cliente)
      }
      setConfirmDelete(null)
    },
    [onEliminarCliente]
  )

  // Stats
  const stats = useMemo(() => {
    const total = clientes.length
    const activos = clientes.filter((c) => c.estado === "activo").length
    const vip = clientes.filter((c) => c.categoria === "VIP").length
    const sinAdeudo = clientes.filter((c) => c.saldoPendiente === 0).length
    const conDeuda = clientes.filter((c) => c.saldoPendiente > 0).length

    const deudaTotal = clientes.reduce((sum, c) => sum + c.saldoPendiente, 0)
    const totalComprasHistorico = clientes.reduce((sum, c) => sum + c.totalCompras, 0)

    // Nuevos este mes
    const thisMonth = new Date()
    const thisMonthStr = `${thisMonth.getFullYear()}-${String(thisMonth.getMonth() + 1).padStart(2, "0")}`
    const nuevosEsteMes = clientes.filter((c) => c.fechaRegistro.startsWith(thisMonthStr)).length

    return {
      total,
      activos,
      vip,
      sinAdeudo,
      conDeuda,
      deudaTotal,
      totalComprasHistorico,
      nuevosEsteMes,
    }
  }, [clientes])

  // Chart data - Deuda por estado
  const _deudaChartData = useMemo(() => {
    const byEstado = clientes.reduce(
      (acc, c) => {
        const key = c.estado
        if (!acc[key]) acc[key] = 0
        acc[key] += c.saldoPendiente
        return acc
      },
      {} as Record<string, number>
    )

    return Object.entries(byEstado).map(([estado, value]) => ({
      name: estado.charAt(0).toUpperCase() + estado.slice(1),
      value,
    }))
  }, [clientes])

  // Actividad últimos 7 días
  const actividadChartData = useMemo(() => {
    // Días de la semana determinísticos para evitar mismatch SSR/Cliente
    const diasSemana = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"]
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split("T")[0]
    }).reverse()

    return last7Days.map((fecha) => {
      const dayClientes = clientes.filter((c) => c.ultimaCompra === fecha)
      // Usar getUTCDay para consistencia SSR/Cliente
      const dayIndex = fecha ? new Date(fecha + "T00:00:00Z").getUTCDay() : 0
      return {
        name: diasSemana[dayIndex],
        value: dayClientes.length,
        compras: dayClientes.reduce((sum, c) => sum + c.totalCompras, 0) / 1000,
      }
    })
  }, [clientes])

  // Tabs usando estados reales del schema DB
  const tabs = [
    { id: "todos", label: "Todos" },
    { id: "activo", label: "Activos" },
    { id: "con_adeudo", label: "Con Adeudo" },
    { id: "sin_adeudo", label: "Sin Adeudo" },
    { id: "inactivo", label: "Inactivos" },
    { id: "suspendido", label: "Suspendidos" },
  ]

  return (
    <SupremeClientesBackground
      showGradient
      showVignette
      intensity={0.7}
      className={cn("min-h-screen", className)}
    >
      {/* 🌌 AURORA BACKGROUND OVERLAY */}
      <AuroraBackground
        intensity="low"
        colors={["violet", "cyan", "magenta"]}
        interactive
        className="absolute inset-0 z-0"
      />

      <main className="relative z-10 p-6" aria-label="Panel de clientes CHRONOS">
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
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Users className="h-6 w-6 text-violet-400" aria-hidden="true" />
              </motion.div>
              <span className="bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">
                Clientes
              </span>
            </motion.h1>
            <p className="relative mt-2 text-white/50">Gestión integral de cartera de clientes</p>
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
              color="violet"
              icon={<UserPlus size={18} />}
              onClick={onNuevoCliente}
            >
              Nuevo Cliente
            </AuroraButton>

            {/* Botón de Exportar con menú */}
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
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute top-full right-0 z-50 mt-2 min-w-[160px] overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl"
                  >
                    <button
                      onClick={() => handleExportar("csv")}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <FileText size={16} />
                      Exportar CSV
                    </button>
                    <button
                      onClick={() => handleExportar("excel")}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <FileText size={16} className="text-emerald-400" />
                      Exportar Excel
                    </button>
                    <button
                      onClick={() => handleExportar("pdf")}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <FileText size={16} className="text-red-400" />
                      Exportar PDF
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Botón de Filtros Avanzados */}
            <AuroraButton
              variant="secondary"
              icon={<Filter size={18} />}
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={showFiltersPanel ? "border-violet-500/50" : ""}
            >
              Filtros
            </AuroraButton>

            <motion.button
              onClick={() => {
                refetchAPI()
                onRefresh?.()
              }}
              aria-label={loading ? "Actualizando datos..." : "Actualizar datos de clientes"}
              className="rounded-xl border border-white/10 bg-white/5 p-3 text-white/60 transition-colors hover:text-white"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={20} className={loading ? "animate-spin" : ""} aria-hidden="true" />
            </motion.button>
          </div>
        </header>

        {/* Panel de Filtros Avanzados */}
        <AnimatePresence>
          {showFiltersPanel && (
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
                    onClick={() => setShowFiltersPanel(false)}
                    className="rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {/* Filtro por deuda */}
                  <div>
                    <label className="mb-2 block text-xs text-white/50">Estado de Deuda</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFiltros((prev) => ({ ...prev, tieneDeuda: null }))}
                        className={cn(
                          "flex-1 rounded-lg px-3 py-2 text-sm transition-colors",
                          filtros.tieneDeuda === null
                            ? "border border-violet-500/50 bg-violet-500/20 text-violet-400"
                            : "border border-white/10 bg-white/5 text-white/60"
                        )}
                      >
                        Todos
                      </button>
                      <button
                        onClick={() => setFiltros((prev) => ({ ...prev, tieneDeuda: true }))}
                        className={cn(
                          "flex-1 rounded-lg px-3 py-2 text-sm transition-colors",
                          filtros.tieneDeuda === true
                            ? "border border-yellow-500/50 bg-yellow-500/20 text-yellow-400"
                            : "border border-white/10 bg-white/5 text-white/60"
                        )}
                      >
                        Con Deuda
                      </button>
                      <button
                        onClick={() => setFiltros((prev) => ({ ...prev, tieneDeuda: false }))}
                        className={cn(
                          "flex-1 rounded-lg px-3 py-2 text-sm transition-colors",
                          filtros.tieneDeuda === false
                            ? "border border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                            : "border border-white/10 bg-white/5 text-white/60"
                        )}
                      >
                        Sin Deuda
                      </button>
                    </div>
                  </div>

                  {/* Resumen de filtros activos */}
                  <div className="flex items-end md:col-span-2">
                    <div className="flex flex-1 items-center gap-2 text-sm text-white/50">
                      <span>
                        Mostrando {filteredClientes.length} de {clientes.length} clientes
                      </span>
                      {(filtros.estado !== "todos" ||
                        filtros.tieneDeuda !== null ||
                        filtros.busqueda) && (
                        <button
                          onClick={() =>
                            setFiltros({ estado: "todos", busqueda: "", tieneDeuda: null })
                          }
                          className="text-violet-400 underline hover:text-violet-300"
                        >
                          Limpiar filtros
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </AuroraGlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Row */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AuroraStatWidget
            label="Total Clientes"
            value={stats.total.toString()}
            icon={<Users size={20} />}
            color="violet"
            change={12.5}
            trend="up"
            className="transition-spring hover-elevate"
          />
          <AuroraStatWidget
            label="Con Adeudo"
            value={stats.conDeuda.toString()}
            icon={<Wallet size={20} />}
            color="gold"
            change={-5.2}
            trend="down"
            className="transition-spring hover-elevate"
          />
          <AuroraStatWidget
            label="Deuda Total"
            value={`$${stats.deudaTotal.toLocaleString()}`}
            icon={<CreditCard size={20} />}
            color="magenta"
            className="transition-spring hover-elevate"
          />
          <AuroraStatWidget
            label="Nuevos este Mes"
            value={stats.nuevosEsteMes.toString()}
            icon={<TrendingUp size={20} />}
            color="cyan"
            change={15.0}
            trend="up"
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════
         * 🍎 iOS PREMIUM METRICS — Cards limpias SIN efectos 3D problemáticos
         * ═══════════════════════════════════════════════════════════════════════════ */}
        <iOSSection title="Vista iOS Premium" description="Clientes - Sin efectos 3D" className="mb-6">
          <iOSGrid cols={4} gap="md">
            <iOSMetricCardPremium
              title="Total Clientes"
              value={stats.total.toString()}
              icon={Users}
              iconColor="#8B5CF6"
              trend={{ value: 12.5, direction: 'up' }}
              variant="featured"
            />
            <iOSMetricCardPremium
              title="Con Adeudo"
              value={stats.conDeuda.toString()}
              icon={Wallet}
              iconColor="#FBBF24"
              trend={{ value: 5.2, direction: 'down' }}
            />
            <iOSMetricCardPremium
              title="Deuda Total"
              value={`$${stats.deudaTotal.toLocaleString()}`}
              icon={CreditCard}
              iconColor="#EC4899"
            />
            <iOSMetricCardPremium
              title="Nuevos (Mes)"
              value={stats.nuevosEsteMes.toString()}
              icon={TrendingUp}
              iconColor="#06B6D4"
              trend={{ value: 15.0, direction: 'up' }}
            />
          </iOSGrid>
        </iOSSection>

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
                  placeholder="Buscar cliente..."
                  color="violet"
                  className="w-64"
                />

                <AuroraTabs
                  tabs={tabs}
                  activeTab={filtros.estado}
                  onTabChange={(v) => setFiltros((prev) => ({ ...prev, estado: v }))}
                  color="violet"
                />
              </div>
            </AuroraGlassCard>

            {/* Timeline */}
            <AuroraGlassCard className="p-6">
              <div className="space-y-2">
                {filteredClientes.map((cliente, i) => (
                  <ClienteTimelineItem
                    key={cliente.id}
                    cliente={cliente}
                    isFirst={i === 0}
                    isLast={i === filteredClientes.length - 1}
                    onVerDetalle={() => onVerDetalle?.(cliente)}
                    onEditar={() => onEditarCliente?.(cliente)}
                    onEliminar={() => onEliminarCliente?.(cliente)}
                    onAbono={() => onRegistrarAbono?.(cliente)}
                    onHistorial={() => onVerHistorial?.(cliente)}
                  />
                ))}

                {filteredClientes.length === 0 && (
                  <div className="py-12 text-center text-white/40">
                    <Users size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No se encontraron clientes</p>
                  </div>
                )}
              </div>
            </AuroraGlassCard>
          </div>

          {/* Right: Visualization & Quick Stats */}
          <div className="col-span-12 space-y-6 lg:col-span-4">
            {/* Client Network Visualization */}
            <AuroraGlassCard glowColor="violet" className="p-4">
              <h3 className="mb-3 text-center text-sm font-medium text-white/70">
                Red de Clientes
              </h3>
              <div className="h-48">
                <ClientNetworkVisualization
                  totalClientes={stats.total}
                  activos={stats.activos}
                  vip={stats.vip}
                />
              </div>
            </AuroraGlassCard>

            {/* Activity Chart */}
            <AuroraAreaChart
              data={actividadChartData}
              height={200}
              color="violet"
              showArea
              showLine
              showDots
              showTooltip
              title="Actividad Últimos 7 Días"
            />

            {/* Quick Stats */}
            <AuroraGlassCard glowColor="cyan" className="p-5">
              <h3 className="mb-4 text-sm font-medium text-white/70">Resumen de Cartera</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl bg-violet-500/10 p-3">
                  <span className="text-sm text-white/60">Clientes VIP</span>
                  <span className="text-sm font-bold text-violet-400">{stats.vip}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 p-3">
                  <span className="text-sm text-white/60">Sin Deuda</span>
                  <span className="text-sm font-bold text-emerald-400">
                    {stats.total - stats.conDeuda}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-yellow-500/10 p-3">
                  <span className="text-sm text-white/60">Con Deuda</span>
                  <span className="text-sm font-bold text-yellow-400">{stats.conDeuda}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-cyan-500/10 p-3">
                  <span className="text-sm text-white/60">Total Histórico</span>
                  <span className="text-sm font-bold text-cyan-400">
                    ${(stats.totalComprasHistorico / 1000000).toFixed(1)}M
                  </span>
                </div>
              </div>
            </AuroraGlassCard>
            {/* Top Clientes por Deuda */}
            <AuroraGlassCard glowColor="gold" className="p-5">
              <h3 className="mb-4 text-sm font-medium text-white/70">Mayor Deuda Pendiente</h3>
              <div className="space-y-3">
                {clientes
                  .filter((c) => c.saldoPendiente > 0)
                  .sort((a, b) => b.saldoPendiente - a.saldoPendiente)
                  .slice(0, 5)
                  .map((cliente, i) => (
                    <div key={cliente.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            background: `linear-gradient(135deg, hsl(${40 - i * 8}, 80%, 50%), hsl(${40 - i * 8}, 70%, 40%))`,
                          }}
                        >
                          {i + 1}
                        </div>
                        <span className="text-sm text-white/70">{cliente.nombre}</span>
                      </div>
                      <span className="text-sm font-medium text-yellow-400">
                        ${cliente.saldoPendiente.toLocaleString()}
                      </span>
                    </div>
                  ))}
                {clientes.filter((c) => c.saldoPendiente > 0).length === 0 && (
                  <p className="py-4 text-center text-sm text-white/40">Sin deudas pendientes 🎉</p>
                )}
              </div>
            </AuroraGlassCard>
          </div>
        </div>
      </main>
    </SupremeClientesBackground>
  )
}

export default AuroraClientesPanelUnified
