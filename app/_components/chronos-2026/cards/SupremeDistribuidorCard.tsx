"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🚚✨ SUPREME DISTRIBUIDOR CARD — CHRONOS INFINITY 2026 OMEGA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Tarjeta de distribuidor ULTRA PREMIUM con todos los efectos supreme:
 * ✅ 3D TILT EFFECTS con parallax
 * ✅ HOLOGRAPHIC SHINE dinámico
 * ✅ ENERGY BORDER pulsante
 * ✅ SCAN LINE cinematográfico
 * ✅ MICRO-INTERACTIONS premium
 * ✅ MOOD-ADAPTIVE COLORS
 *
 * @version OMEGA-2026.1.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import {
  ChevronRight,
  Edit,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  ShoppingCart,
  Star,
  Trash2,
  Wallet,
} from "lucide-react"
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react"
import React, { memo, useCallback, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type EstadoDistribuidor = "activo" | "inactivo" | "suspendido"
type CategoriaDistribuidor = "estrategico" | "preferido" | "normal" | "ocasional" | "nuevo"

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
  totalCompras: number
  deudaActual: number
  totalPagado: number
  saldoPendiente: number
  numeroOrdenes: number
  ordenesCompletadas: number
  ordenesPendientes: number
  ultimaOrden?: string
  diasSinOrdenar: number
  rating: number
  scoreTotal: number
  categoria: CategoriaDistribuidor
  confiabilidad: number
  tiempoPromedioEntrega: number
  estado: EstadoDistribuidor
  notas?: string
  createdAt: string
}

interface SupremeDistribuidorCardProps {
  distribuidor: Distribuidor
  onVerDetalle?: () => void
  onEditar?: () => void
  onNuevaOrden?: () => void
  onRegistrarPago?: () => void
  onEliminar?: () => void
  mood?: number
  pulse?: number
  moodColor?: string
  index?: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COLOR CONFIGS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ESTADO_CONFIG = {
  activo: {
    color: "#10B981",
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    label: "Activo",
  },
  inactivo: {
    color: "#64748b",
    bg: "bg-gray-500/20",
    text: "text-gray-400",
    label: "Inactivo",
  },
  suspendido: {
    color: "#EF4444",
    bg: "bg-red-500/20",
    text: "text-red-400",
    label: "Suspendido",
  },
} as const

const CATEGORIA_CONFIG = {
  estrategico: { color: "#A855F7", label: "⭐ Estratégico", glow: "rgba(168, 85, 247, 0.4)" },
  preferido: { color: "#06B6D4", label: "💎 Preferido", glow: "rgba(6, 182, 212, 0.4)" },
  normal: { color: "#10B981", label: "✓ Normal", glow: "rgba(16, 185, 129, 0.4)" },
  ocasional: { color: "#F59E0B", label: "○ Ocasional", glow: "rgba(245, 158, 11, 0.4)" },
  nuevo: { color: "#8B5CF6", label: "★ Nuevo", glow: "rgba(139, 92, 246, 0.4)" },
} as const

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SupremeDistribuidorCard = memo(function SupremeDistribuidorCard({
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
}: SupremeDistribuidorCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 })
  const cardRef = useRef<HTMLDivElement>(null)

  // 3D Tilt effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springConfig = { stiffness: 150, damping: 15 }
  const rotateX = useSpring(useTransform(mouseY, [0, 0], [0, 0]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [0, 0], [0, 0]), springConfig)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return
      const rect = cardRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setMousePosition({ x, y })

      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      mouseX.set((e.clientX - centerX) / rect.width)
      mouseY.set((e.clientY - centerY) / rect.height)
    },
    [mouseX, mouseY]
  )

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }, [mouseX, mouseY])

  const estadoConfig = ESTADO_CONFIG[distribuidor.estado]
  const catConfig = CATEGORIA_CONFIG[distribuidor.categoria]

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl p-5 transition-all duration-500",
        "border border-white/10 bg-white/5 backdrop-blur-xl",
        "hover:border-white/20 hover:bg-white/10"
      )}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 1200,
        transformStyle: "preserve-3d",
        boxShadow: isHovered
          ? `0 30px 80px ${catConfig.glow}, 0 0 100px ${catConfig.glow}`
          : "0 10px 40px rgba(0,0,0,0.4)",
      }}
      whileHover={{ scale: 1.02, y: -8 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onVerDetalle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {/* ═══════════════════ HOLOGRAPHIC SPOTLIGHT ═══════════════════ */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}% ${mousePosition.y}%, ${catConfig.glow}, transparent 50%)`,
        }}
      />

      {/* ═══════════════════ AURORA ORB ANIMATION ═══════════════════ */}
      <motion.div
        className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-20"
        style={{
          background: `radial-gradient(circle, ${catConfig.color}, transparent 70%)`,
          filter: "blur(40px)",
        }}
        animate={{
          scale: isHovered ? [1, 1.4, 1] : 1,
          rotate: isHovered ? 360 : 0,
        }}
        transition={{
          duration: 4,
          repeat: isHovered ? Infinity : 0,
          ease: "linear",
        }}
      />

      {/* ═══════════════════ SCAN LINE EFFECT ═══════════════════ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <motion.div
          className="absolute h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
          animate={{
            y: isHovered ? ["0%", "2000%"] : "0%",
          }}
          transition={{
            duration: 3,
            repeat: isHovered ? Infinity : 0,
            ease: "linear",
          }}
        />
      </div>

      {/* ═══════════════════ SHIMMER EFFECT ═══════════════════ */}
      {isHovered && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 55%, transparent 60%)",
            backgroundSize: "200% 200%",
          }}
          initial={{ backgroundPosition: "200% 0%" }}
          animate={{ backgroundPosition: "-200% 0%" }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      )}

      {/* ═══════════════════ ENERGY BORDER ═══════════════════ */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? [0.2, 0.5, 0.2] : 0 }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          boxShadow: `inset 0 0 25px ${catConfig.glow}, 0 0 40px ${catConfig.glow}`,
        }}
      />

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div
        className="relative mb-4 flex items-start justify-between"
        style={{ transform: "translateZ(30px)" }}
      >
        <div className="flex flex-1 items-center gap-3">
          {/* Avatar con 3D Depth */}
          <motion.div
            className="flex h-14 w-14 items-center justify-center rounded-xl text-xl font-bold text-white shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${catConfig.color}90, ${catConfig.color}50)`,
              boxShadow: `0 8px 32px ${catConfig.glow}`,
            }}
            animate={{ rotate: isHovered ? [0, -3, 3, 0] : 0 }}
            whileHover={{ scale: 1.1 }}
          >
            {distribuidor.alias?.[0] || distribuidor.nombre[0]}
          </motion.div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-white">{distribuidor.nombre}</p>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  estadoConfig.bg,
                  estadoConfig.text
                )}
              >
                {estadoConfig.label}
              </span>
            </div>
            {distribuidor.alias && (
              <p className="text-xs font-medium" style={{ color: catConfig.color }}>
                {distribuidor.alias}
              </p>
            )}
            {distribuidor.empresa && (
              <p className="truncate text-xs text-white/40">{distribuidor.empresa}</p>
            )}
          </div>
        </div>

        {/* Menu Button */}
        <div className="relative">
          <motion.button
            className="rounded-lg p-2 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(!showMenu)
            }}
            whileHover={{ scale: 1.02, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <MoreHorizontal size={18} />
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                className="absolute top-10 right-0 z-50 w-48 overflow-hidden rounded-xl border border-white/10 bg-gray-900/98 shadow-2xl shadow-black/50 backdrop-blur-2xl"
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                onClick={(e) => e.stopPropagation()}
              >
                <motion.button
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10"
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setShowMenu(false)
                    onEditar?.()
                  }}
                >
                  <Edit size={14} className="text-violet-400" />
                  Editar
                </motion.button>
                <motion.button
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10"
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setShowMenu(false)
                    onNuevaOrden?.()
                  }}
                >
                  <ShoppingCart size={14} className="text-cyan-400" />
                  Nueva Orden
                </motion.button>
                <motion.button
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors",
                    distribuidor.deudaActual > 0
                      ? "text-white hover:bg-white/10"
                      : "cursor-not-allowed text-white/30"
                  )}
                  whileHover={distribuidor.deudaActual > 0 ? { x: 4 } : {}}
                  onClick={() => {
                    if (distribuidor.deudaActual > 0) {
                      setShowMenu(false)
                      onRegistrarPago?.()
                    }
                  }}
                  disabled={distribuidor.deudaActual <= 0}
                >
                  <Wallet size={14} className="text-emerald-400" />
                  Registrar Pago
                  {distribuidor.deudaActual > 0 && (
                    <span className="ml-auto text-xs text-emerald-400">
                      ${(distribuidor.deudaActual / 1000).toFixed(0)}K
                    </span>
                  )}
                </motion.button>
                <div className="border-t border-white/10" />
                <motion.button
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                  whileHover={{ x: 4 }}
                  onClick={() => {
                    setShowMenu(false)
                    onEliminar?.()
                  }}
                >
                  <Trash2 size={14} />
                  Eliminar
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══════════════════ CATEGORY & RATING ═══════════════════ */}
      <div
        className="relative mb-3 flex items-center justify-between"
        style={{ transform: "translateZ(20px)" }}
      >
        <motion.span
          className="rounded-lg px-2.5 py-1 text-xs font-medium"
          style={{ background: `${catConfig.color}20`, color: catConfig.color }}
          whileHover={{ scale: 1.02 }}
        >
          {catConfig.label}
        </motion.span>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * i }}
            >
              <Star
                size={12}
                className={
                  i < Math.floor(distribuidor.rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-white/20"
                }
              />
            </motion.span>
          ))}
          <span className="ml-1 text-xs text-white/50">{distribuidor.rating.toFixed(1)}</span>
        </div>
      </div>

      {/* ═══════════════════ CONTACT INFO ═══════════════════ */}
      {(distribuidor.telefono || distribuidor.email || distribuidor.ubicacion) && (
        <div className="relative mb-4 space-y-2" style={{ transform: "translateZ(15px)" }}>
          {distribuidor.telefono && (
            <motion.div
              className="flex items-center gap-2 text-xs text-white/50"
              whileHover={{ x: 4, color: "rgba(255,255,255,0.8)" }}
            >
              <Phone size={12} className="text-cyan-400" />
              <span>{distribuidor.telefono}</span>
            </motion.div>
          )}
          {distribuidor.email && (
            <motion.div
              className="flex items-center gap-2 truncate text-xs text-white/50"
              whileHover={{ x: 4, color: "rgba(255,255,255,0.8)" }}
            >
              <Mail size={12} className="text-cyan-400" />
              <span className="truncate">{distribuidor.email}</span>
            </motion.div>
          )}
          {distribuidor.ubicacion && (
            <motion.div
              className="flex items-center gap-2 text-xs text-white/50"
              whileHover={{ x: 4, color: "rgba(255,255,255,0.8)" }}
            >
              <MapPin size={12} className="text-cyan-400" />
              <span>{distribuidor.ubicacion}</span>
            </motion.div>
          )}
        </div>
      )}

      {/* ═══════════════════ FINANCIAL STATS ═══════════════════ */}
      <div
        className="relative mb-3 grid grid-cols-2 gap-3"
        style={{ transform: "translateZ(10px)" }}
      >
        <motion.div
          className="rounded-xl border border-white/5 bg-white/5 p-3"
          whileHover={{ scale: 1.02, borderColor: "rgba(6, 182, 212, 0.3)" }}
        >
          <p className="mb-1 text-[10px] tracking-wider text-white/40 uppercase">Total Compras</p>
          <p className="text-lg font-bold text-cyan-400">
            ${(distribuidor.totalCompras / 1000).toFixed(0)}K
          </p>
        </motion.div>
        <motion.div
          className="rounded-xl border border-white/5 bg-white/5 p-3"
          whileHover={{
            scale: 1.02,
            borderColor:
              distribuidor.deudaActual > 0 ? "rgba(245, 158, 11, 0.3)" : "rgba(16, 185, 129, 0.3)",
          }}
        >
          <p className="mb-1 text-[10px] tracking-wider text-white/40 uppercase">Deuda Actual</p>
          <p
            className={cn(
              "text-lg font-bold",
              distribuidor.deudaActual > 0 ? "text-amber-400" : "text-emerald-400"
            )}
          >
            ${(distribuidor.deudaActual / 1000).toFixed(0)}K
          </p>
        </motion.div>
      </div>

      {/* ═══════════════════ METRICS ═══════════════════ */}
      <div
        className="relative mb-3 grid grid-cols-2 gap-2 text-xs"
        style={{ transform: "translateZ(5px)" }}
      >
        <motion.div
          className="rounded-lg border border-emerald-500/10 bg-emerald-500/10 p-2 text-center"
          whileHover={{ scale: 1.03 }}
        >
          <span className="block text-[10px] text-white/40">Confiabilidad</span>
          <span className="font-bold text-emerald-400">
            {(distribuidor.confiabilidad ?? 0).toFixed(1)}%
          </span>
        </motion.div>
        <motion.div
          className="rounded-lg border border-violet-500/10 bg-violet-500/10 p-2 text-center"
          whileHover={{ scale: 1.03 }}
        >
          <span className="block text-[10px] text-white/40">Entrega Prom.</span>
          <span className="font-bold text-violet-400">
            {(distribuidor.tiempoPromedioEntrega ?? 0).toFixed(0)}d
          </span>
        </motion.div>
      </div>

      {/* ═══════════════════ FOOTER ═══════════════════ */}
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
        <motion.div
          animate={{ x: isHovered ? 4 : 0 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <ChevronRight size={14} className="text-white/30" />
        </motion.div>
      </div>
    </motion.div>
  )
})

export default SupremeDistribuidorCard


