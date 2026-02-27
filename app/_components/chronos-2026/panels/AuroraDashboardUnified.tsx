"use client"

import { cn } from "@/app/_lib/utils"
import type { ModuleCard } from "@/app/hooks/useDashboardData"
import { useDashboardData } from "@/app/hooks/useDashboardData"
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    CreditCard,
    DollarSign,
    Landmark,
    LineChart,
    Package,
    PieChart,
    Plus,
    Receipt,
    RefreshCw,
    ShoppingCart,
    TrendingDown,
    TrendingUp,
    Truck,
    Users
} from "lucide-react"
import { motion } from "motion/react"
import React, { memo, useMemo, useState } from "react"

interface AuroraDashboardUnifiedProps {
  onNavigate?: (path: string) => void
  className?: string
}

interface KpiDef {
  label: string
  value: number
  trend: number
  icon: React.ReactNode
  colorHex: string
  isCurrency?: boolean
  sparkline?: number[]
}

const fmtMXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
})

// ── MiniChart sparkline (SVG, reusable) ──────────────────────────────────────
const MiniChart = memo(function MiniChart({
  data,
  color = "#8B5CF6",
  height = 40,
}: {
  data: number[]
  color?: string
  height?: number
}) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const W = 100
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * W
      const y = height - ((v - min) / range) * (height - 8) - 4
      return `${x},${y}`
    })
    .join(" ")
  const area = `0,${height} ${pts} ${W},${height}`
  const gradId = `mg${color.replace("#", "")}`
  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      className="w-full"
      style={{ height }}
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${gradId})`} points={area} />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
    </svg>
  )
})

// ── deterministic weekly sparkline seeded from a value ──────────────────────
function weekSeed(base: number, variance = 0.18): number[] {
  const seed = Math.abs(base) || 1
  return Array.from({ length: 7 }, (_, i) => {
    const noise = Math.sin(seed * (i + 1) * 0.31) * variance
    return base * (1 + noise)
  })
}

const ICON_MAP: Record<string, React.ReactNode> = {
  ShoppingCart: <ShoppingCart size={20} />,
  Users: <Users size={20} />,
  Truck: <Truck size={20} />,
  Package: <Package size={20} />,
  Landmark: <Landmark size={20} />,
  Activity: <Activity size={20} />,
}

// KPI Card — with shimmer sweep + sparkline ─────────────────────────────────
const KpiCard = memo(function KpiCard({ kpi, index }: { kpi: KpiDef; index: number }) {
  const pos = kpi.trend >= 0
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 300, damping: 24 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm transition-all duration-300"
      style={{
        boxShadow: hovered ? `0 0 32px -8px ${kpi.colorHex}30` : undefined,
        borderColor: hovered ? `${kpi.colorHex}25` : undefined,
      }}
    >
      {/* gradient bg tint */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-2xl"
        style={{ background: `radial-gradient(circle at 30% 20%, ${kpi.colorHex}10, transparent 70%)` }}
      />
      {/* shimmer sweep */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
          backgroundSize: "200% 200%",
        }}
        animate={{ x: hovered ? ["0%", "100%"] : "0%" }}
        transition={{ duration: 0.9, ease: "easeInOut" }}
      />
      <div className="relative">
        <div className="mb-2 flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ color: kpi.colorHex, background: `${kpi.colorHex}18` }}
          >
            {kpi.icon}
          </div>
          <span className="truncate text-xs text-white/50">{kpi.label}</span>
        </div>
        <motion.p
          className="mb-1 text-xl font-bold text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.06 + 0.2 }}
        >
          {kpi.isCurrency ? fmtMXN.format(kpi.value) : kpi.value.toLocaleString("es-MX")}
        </motion.p>
        <div
          className={cn(
            "mb-3 flex items-center gap-1 text-xs font-medium",
            pos ? "text-emerald-400" : "text-rose-400"
          )}
        >
          {pos ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
          <span>{Math.abs(kpi.trend).toFixed(1)}%</span>
          <span className="text-white/30 ml-1">7d</span>
        </div>
        {kpi.sparkline && (
          <div className="mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <MiniChart data={kpi.sparkline} color={kpi.colorHex} height={36} />
          </div>
        )}
      </div>
    </motion.div>
  )
})

// Premium chart card ─────────────────────────────────────────────────────────
const ChartCard = memo(function ChartCard({
  title,
  icon,
  subtitle,
  children,
  accent = "#8B5CF6",
}: {
  title: string
  icon: React.ReactNode
  subtitle?: string
  children: React.ReactNode
  accent?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex h-64 flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm hover:border-white/[0.12] transition-all duration-300"
      style={{ background: `linear-gradient(135deg, ${accent}04 0%, transparent 60%)` }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color: accent }} className="opacity-70">{icon}</span>
          <h3 className="text-sm font-semibold text-white/80">{title}</h3>
        </div>
        {subtitle && <span className="text-[10px] text-white/30">{subtitle}</span>}
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </motion.div>
  )
})

// Revenue area chart (SVG)
function RevenueChart() {
  const ingP = "M 0 140 C 40 100, 80 120, 120 80 C 160 40, 200 90, 240 50 C 280 30, 320 60, 360 40"
  const egP =
    "M 0 160 C 40 150, 80 155, 120 130 C 160 120, 200 140, 240 125 C 280 110, 320 130, 360 120"
  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex gap-4 text-[10px]">
        <span className="flex items-center gap-1 text-emerald-400">
          <TrendingUp size={10} /> Ingresos
        </span>
        <span className="flex items-center gap-1 text-rose-400">
          <TrendingDown size={10} /> Egresos
        </span>
      </div>
      <svg viewBox="0 0 360 180" className="w-full flex-1" preserveAspectRatio="none">
        <defs>
          <linearGradient id="gIn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="gEg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#F43F5E" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[45, 90, 135].map((y) => (
          <line key={y} x1="0" y1={y} x2="360" y2={y} stroke="white" strokeOpacity="0.04" />
        ))}
        <motion.path
          d={`${egP} L 360 180 L 0 180 Z`}
          fill="url(#gEg)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
        <motion.path
          d={egP}
          fill="none"
          stroke="#F43F5E"
          strokeWidth="1.5"
          strokeOpacity="0.6"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, delay: 0.2 }}
        />
        <motion.path
          d={`${ingP} L 360 180 L 0 180 Z`}
          fill="url(#gIn)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
        <motion.path
          d={ingP}
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
          strokeOpacity="0.8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1 }}
        />
      </svg>
    </div>
  )
}

// Horizontal bar list (shared for banks & products)
function BarList({
  items,
  labelW = "w-20",
}: {
  items: { name: string; pct: number; color: string }[]
  labelW?: string
}) {
  return (
    <div className="flex h-full flex-col justify-center gap-2">
      {items.map((b, i) => (
        <div key={b.name} className="flex items-center gap-3">
          <span className={cn("truncate text-right text-[10px] text-white/40", labelW)}>
            {b.name}
          </span>
          <div className="h-4 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
            <motion.div
              className="h-full rounded-full"
              style={{ background: b.color }}
              initial={{ width: 0 }}
              animate={{ width: `${b.pct}%` }}
              transition={{ delay: i * 0.08, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
          <span className="w-8 text-[10px] text-white/50">{b.pct}%</span>
        </div>
      ))}
    </div>
  )
}

const BANKS = [
  { name: "Bóveda Monte", pct: 35, color: "#8B5CF6" },
  { name: "Bóveda USA", pct: 20, color: "#06B6D4" },
  { name: "Profit", pct: 15, color: "#10B981" },
  { name: "Leftie", pct: 10, color: "#F59E0B" },
  { name: "Azteca", pct: 8, color: "#EC4899" },
  { name: "Flete Sur", pct: 7, color: "#EF4444" },
  { name: "Utilidades", pct: 5, color: "#A855F7" },
]

const TOP_PRODUCTS = [
  { name: "Producto A", pct: 85, color: "#10B981" },
  { name: "Producto B", pct: 72, color: "#8B5CF6" },
  { name: "Producto C", pct: 60, color: "#06B6D4" },
  { name: "Producto D", pct: 45, color: "#F59E0B" },
  { name: "Producto E", pct: 30, color: "#EC4899" },
]

// Waterfall / cash-flow chart (SVG)
function CashFlowChart() {
  const steps = [
    { label: "Inicio", top: 100, h: 100, color: "#8B5CF6" },
    { label: "Ventas", top: 145, h: 45, color: "#10B981" },
    { label: "Gastos", top: 145, h: 25, color: "#F43F5E" },
    { label: "Compras", top: 120, h: 35, color: "#F43F5E" },
    { label: "Abonos", top: 105, h: 20, color: "#10B981" },
    { label: "Final", top: 105, h: 105, color: "#06B6D4" },
  ]
  const max = 160,
    bw = 36,
    gap = 16
  const tw = steps.length * (bw + gap) - gap
  return (
    <svg viewBox={`0 0 ${tw} 160`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      {steps.map((s, i) => {
        const x = i * (bw + gap),
          ht = (s.h / max) * 120,
          y = 140 - (s.top / max) * 120
        return (
          <g key={s.label}>
            <motion.rect
              x={x}
              width={bw}
              rx={4}
              fill={s.color}
              fillOpacity={0.7}
              initial={{ height: 0, y: 140 }}
              animate={{ height: ht, y }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
            <text
              x={x + bw / 2}
              y={155}
              textAnchor="middle"
              fill="white"
              fillOpacity={0.4}
              fontSize={8}
            >
              {s.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

// Module Quick Card
function ModuleQuickCard({ module, onNavigate }: { module: ModuleCard; onNavigate?: () => void }) {
  const icon = ICON_MAP[module.iconName] || <Package size={20} />
  return (
    <motion.button
      onClick={onNavigate}
      className={cn(
        "group relative w-full overflow-hidden rounded-xl p-4 text-left",
        "border border-white/[0.06] bg-white/[0.03] backdrop-blur-sm",
        "hover:border-white/[0.12] hover:bg-white/[0.06]",
        "transition-colors duration-200 focus:ring-2 focus:ring-violet-500/40 focus:outline-none"
      )}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${module.color}12, transparent 70%)`,
        }}
      />
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg"
        style={{ background: `${module.color}20`, color: module.color }}
      >
        {icon}
      </div>
      <p className="mb-0.5 text-sm font-semibold text-white">{module.nombre}</p>
      <p className="mb-3 line-clamp-1 text-xs text-white/40">{module.descripcion}</p>
      <div className="flex gap-2">
        {module.stats.map((s, i) => (
          <div key={i} className="flex-1 rounded-md bg-white/[0.04] px-2 py-1.5">
            <span className="block text-[10px] text-white/40">{s.label}</span>
            <span className="text-xs font-semibold" style={{ color: module.color }}>
              {s.value}
            </span>
          </div>
        ))}
      </div>
    </motion.button>
  )
}

// Quick Actions FAB
const QUICK_ACTIONS = [
  { label: "Nueva Venta", icon: <ShoppingCart size={16} />, x: 0, y: -70 },
  { label: "Nueva OC", icon: <Receipt size={16} />, x: -50, y: -50 },
  { label: "Nuevo Gasto", icon: <CreditCard size={16} />, x: -70, y: 0 },
  { label: "Nuevo Abono", icon: <DollarSign size={16} />, x: -50, y: 50 },
]

function QuickActionsFab() {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed right-6 bottom-6 z-50">
      {QUICK_ACTIONS.map((a, i) => (
        <motion.button
          key={a.label}
          className="absolute right-2 bottom-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.1] bg-white/[0.08] text-white/80 backdrop-blur-md transition-colors hover:bg-white/[0.15] hover:text-white"
          initial={false}
          animate={{
            x: open ? a.x : 0,
            y: open ? a.y : 0,
            opacity: open ? 1 : 0,
            scale: open ? 1 : 0.3,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 22, delay: open ? i * 0.05 : 0 }}
          aria-label={a.label}
          title={a.label}
          onClick={() => setOpen(false)}
        >
          {a.icon}
        </motion.button>
      ))}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30 transition-shadow hover:shadow-violet-500/50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        aria-label="Acciones rápidas"
      >
        <Plus size={24} />
      </motion.button>
    </div>
  )
}

// Loading Skeleton
function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-40 animate-pulse rounded-lg bg-white/[0.06]" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded-md bg-white/[0.04]" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-xl bg-white/[0.06]" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-white/[0.04]" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-white/[0.03]" />
        ))}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// MAIN COMPONENT
// ══════════════════════════════════════════

export function AuroraDashboardUnified({ onNavigate, className }: AuroraDashboardUnifiedProps) {
  const { stats, modules, loading, error, refetch } = useDashboardData()

  const kpiCards = useMemo<KpiDef[]>(
    () => [
      {
        label: "Capital Total",
        value: stats.capitalTotal,
        trend: stats.cambioCapital,
        icon: <DollarSign size={16} />,
        colorHex: "#10B981",
        isCurrency: true,
        sparkline: weekSeed(stats.capitalTotal),
      },
      {
        label: "Utilidades Netas",
        value: stats.gananciaNeta,
        trend: 15.8,
        icon: <TrendingUp size={16} />,
        colorHex: "#8B5CF6",
        isCurrency: true,
        sparkline: weekSeed(stats.gananciaNeta, 0.22),
      },
      {
        label: "Deuda Clientes",
        value: stats.cobrosPendientes,
        trend: -stats.cambioClientes,
        icon: <Users size={16} />,
        colorHex: "#F59E0B",
        isCurrency: true,
        sparkline: weekSeed(stats.cobrosPendientes, 0.15),
      },
      {
        label: "Adeudo Distribuidores",
        value: stats.ordenesPendientes * 18500,
        trend: stats.cambioOrdenes,
        icon: <Truck size={16} />,
        colorHex: "#F43F5E",
        isCurrency: true,
        sparkline: weekSeed(stats.ordenesPendientes * 18500, 0.2),
      },
      {
        label: "Stock Valorizado",
        value: stats.capitalTotal * 0.28,
        trend: 4.2,
        icon: <Package size={16} />,
        colorHex: "#06B6D4",
        isCurrency: true,
        sparkline: weekSeed(stats.capitalTotal * 0.28, 0.12),
      },
      {
        label: "Ventas del Mes",
        value: stats.ventasMes,
        trend: stats.cambioVentas,
        icon: <ShoppingCart size={16} />,
        colorHex: "#22C55E",
        isCurrency: true,
        sparkline: weekSeed(stats.ventasMes, 0.25),
      },
    ],
    [stats]
  )

  if (loading && modules.length === 0) return <DashboardSkeleton />

  if (error) {
    return (
      <div className={cn("flex min-h-[60vh] items-center justify-center p-6", className)}>
        <div className="max-w-sm rounded-2xl border border-rose-500/20 bg-white/[0.03] p-8 text-center backdrop-blur-sm">
          <AlertTriangle className="mx-auto mb-4 h-10 w-10 text-rose-400" />
          <h2 className="mb-2 text-lg font-semibold text-white">Error al cargar datos</h2>
          <p className="mb-5 text-sm text-white/50">
            {error instanceof Error ? error.message : "Error de conexión"}
          </p>
          <motion.button
            onClick={refetch}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <RefreshCw size={14} /> Reintentar
          </motion.button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* 1. HEADER */}
      <header className="flex items-center justify-between">
        <div>
          <motion.h1
            className="text-2xl font-bold"
            style={{ background: "linear-gradient(90deg,#fff 30%,#8B5CF6 80%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
          >
            Dashboard
          </motion.h1>
          <p className="mt-0.5 text-sm text-white/40">
            {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <motion.button
          onClick={refetch}
          aria-label={loading ? "Actualizando..." : "Actualizar datos"}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.05] text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        </motion.button>
      </header>

      {/* 2. KPI ROW */}
      <section
        aria-label="KPIs principales"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        {kpiCards.map((kpi, i) => (
          <KpiCard key={kpi.label} kpi={kpi} index={i} />
        ))}
      </section>

      {/* 3. TENDENCIA SEMANAL ─ sparkline + stats row */}
      <section aria-label="Tendencia semanal">
        <div className="mb-3 flex items-center gap-2">
          <LineChart size={14} className="text-violet-400" />
          <h2 className="text-sm font-medium text-white/50">Tendencia Semanal</h2>
          <span className="ml-auto text-[10px] text-white/25">últimos 7 días</span>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* Ventas sparkline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-white/50">Ventas</span>
              <span className="text-xs font-semibold text-emerald-400">
                {fmtMXN.format(stats.ventasMes)}
              </span>
            </div>
            <MiniChart data={weekSeed(stats.ventasMes, 0.25)} color="#22C55E" height={44} />
            <div className="mt-2 flex justify-between text-[9px] text-white/25">
              {["L","M","X","J","V","S","D"].map(d => <span key={d}>{d}</span>)}
            </div>
          </motion.div>
          {/* Utilidades sparkline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-white/50">Utilidades</span>
              <span className="text-xs font-semibold text-violet-400">
                {fmtMXN.format(stats.gananciaNeta)}
              </span>
            </div>
            <MiniChart data={weekSeed(stats.gananciaNeta, 0.22)} color="#8B5CF6" height={44} />
            <div className="mt-2 flex justify-between text-[9px] text-white/25">
              {["L","M","X","J","V","S","D"].map(d => <span key={d}>{d}</span>)}
            </div>
          </motion.div>
          {/* Capital sparkline */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 backdrop-blur-sm"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-white/50">Capital</span>
              <span className="text-xs font-semibold text-sky-400">
                {fmtMXN.format(stats.capitalTotal)}
              </span>
            </div>
            <MiniChart data={weekSeed(stats.capitalTotal, 0.1)} color="#06B6D4" height={44} />
            <div className="mt-2 flex justify-between text-[9px] text-white/25">
              {["L","M","X","J","V","S","D"].map(d => <span key={d}>{d}</span>)}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. CHARTS SECTION */}
      <section aria-label="Gráficas" className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Ingresos vs Egresos" icon={<BarChart3 size={16} />} accent="#10B981" subtitle="tendencia">
          <RevenueChart />
        </ChartCard>
        <ChartCard title="Distribución de Capital" icon={<PieChart size={16} />} accent="#8B5CF6">
          <BarList items={BANKS} />
        </ChartCard>
        <ChartCard title="Productos Top" icon={<TrendingUp size={16} />} accent="#06B6D4">
          <BarList items={TOP_PRODUCTS} labelW="w-16" />
        </ChartCard>
        <ChartCard title="Flujo de Caja" icon={<DollarSign size={16} />} accent="#F59E0B" subtitle="cashflow">
          <CashFlowChart />
        </ChartCard>
      </section>

      {/* 5. MODULE QUICK CARDS */}
      <section aria-label="Módulos">
        <h2 className="mb-3 text-sm font-medium text-white/50">Módulos del Sistema</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {modules.map((mod) => (
            <ModuleQuickCard key={mod.id} module={mod} onNavigate={() => onNavigate?.(mod.path)} />
          ))}
        </div>
      </section>

      {/* 6. QUICK ACTIONS FAB */}
      <QuickActionsFab />
    </div>
  )
}

export default AuroraDashboardUnified
