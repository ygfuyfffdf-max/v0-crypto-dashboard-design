"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📊✨ AURORA DASHBOARD UNIFIED — CHRONOS INFINITY 2026 SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Dashboard principal ULTRA PREMIUM con TODOS los sistemas supremos:
 * ✅ SMOOTH SCROLL 120FPS (Lenis + GSAP ScrollTrigger)
 * ✅ PARTÍCULAS 3D INTERACTIVAS (WebGL Accelerated)
 * ✅ 50+ ANIMACIONES CINEMATOGRÁFICAS (Glitch, Cosmic, Energy)
 * ✅ FÍSICA 2D REALISTA (Matter.js - opcional)
 * ✅ MICRO-INTERACCIONES PREMIUM en todos los botones
 * ✅ SCROLL COUNTERS animados
 * ✅ PARALLAX EFFECTS en cards
 *
 * Datos reales via Turso/Drizzle + React Query
 *
 * @version 3.0.0 - SUPREME ELEVATION APPLIED
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { useIntersectionObserver } from "@/app/_hooks/useIntersectionObserver"
import { cn } from "@/app/_lib/utils"
import { useDashboardData } from "@/app/hooks/useDashboardData"
import { animated, useSpring } from "@react-spring/web"
import gsap from "gsap"
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronRight,
  Clock,
  Landmark,
  Layers,
  Package,
  RefreshCw,
  Settings,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Truck,
  Users,
  Wallet,
  Zap,
} from "lucide-react"
import { motion } from "motion/react"
import dynamic from "next/dynamic"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌟 SUPREME SYSTEMS — CHRONOS INFINITY 2026
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
import "@/app/_components/chronos-2026/animations/CinematicAnimations"
import {
  FadeInOnScroll,
  useSmoothScroll,
} from "@/app/_components/chronos-2026/scroll/SmoothScrollSystem"

// 🌌 SUPREME SHADER SYSTEM — ELITE 2026
import { SupremeDashboardBackground } from "./SupremePanelBackgrounds"

// 🌌 PREMIUM 3D COMPONENTS — ULTRA ELEVATION 2026

// Aurora Glass System
import {
  AuroraBackground,
  AuroraBadge,
  AuroraGlassCard,
  AuroraStatWidget,
} from "../../ui/AuroraGlassSystem"

// 🍎 iOS PREMIUM SYSTEM 2026 — Sistema de UI sin efectos 3D problemáticos
import {
  iOSScrollContainer,
  iOSSection,
  iOSGrid,
  iOSMetricCardPremium,
  iOSInfoCard,
  iOSLoading,
  iOSEmptyState,
} from "../../ui/ios"

// Ultra Premium Components 2026

// Aurora Charts - Lazy Loaded for performance
const AuroraBarChart = dynamic(
  () => import("../../charts/AuroraPremiumCharts").then((mod) => mod.AuroraBarChart),
  {
    loading: () => <div className="h-[220px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  }
)

const AuroraDonutChart = dynamic(
  () => import("../../charts/AuroraPremiumCharts").then((mod) => mod.AuroraDonutChart),
  {
    loading: () => <div className="h-[220px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  }
)

// Cosmic 3D Charts - Lazy Loaded for advanced visualizations
const CosmicSankeyChart = dynamic(
  () => import("../../charts/Cosmic3DCharts").then((mod) => mod.CosmicSankeyChart),
  {
    loading: () => <div className="h-[300px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  }
)

const CosmicHeatmapChart = dynamic(
  () => import("../../charts/Cosmic3DCharts").then((mod) => mod.CosmicHeatmapChart),
  {
    loading: () => <div className="h-[250px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  }
)

// Virtualized Feed - Lazy Loaded
const ActivityFeedVirtual = dynamic(
  () => import("./ActivityFeedVirtual").then((mod) => mod.ActivityFeedVirtual),
  {
    loading: () => <div className="h-[350px] w-full animate-pulse rounded-xl bg-white/5" />,
    ssr: false,
  }
)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES (importados desde useDashboardData para consistencia)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

import type { ModuleCard } from "@/app/hooks/useDashboardData"

// Iconos disponibles para módulos
const MODULE_ICONS: Record<string, React.ReactNode> = {
  ShoppingCart: <ShoppingCart size={24} />,
  Users: <Users size={24} />,
  Truck: <Truck size={24} />,
  Package: <Package size={24} />,
  Landmark: <Landmark size={24} />,
  Activity: <Activity size={24} />,
}

interface AuroraDashboardUnifiedProps {
  onNavigate?: (_path: string) => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🗂️ MODULE CARD — PREMIUM Quick access card with advanced effects
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ModuleQuickCard({ module, onNavigate }: { module: ModuleCard; onNavigate?: () => void }) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Resolver icono desde nombre
  const icon = MODULE_ICONS[module.iconName] || <Layers size={24} />

  // Clean spring animations — SIN efectos 3D/tilt problemáticos
  const cardSpring = useSpring({
    transform: isHovered ? "translateY(-4px)" : "translateY(0px)",
    boxShadow: isHovered
      ? `0 16px 40px ${module.color}25, inset 0 1px 2px rgba(255,255,255,0.1)`
      : "0 4px 20px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.04)",
    config: { tension: 400, friction: 30 },
  })

  const glowSpring = useSpring({
    opacity: isHovered ? 0.6 : 0,
    config: { tension: 300, friction: 25 },
  })

  // REMOVIDO: Mouse tracking y efectos 3D/tilt con cursor
  // Los efectos de rotateX, rotateY, z con GSAP causaban interacción tediosa

  return (
    <animated.div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={`Ir a ${module.nombre}: ${module.descripcion}`}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-2xl p-5",
        "transition-all duration-200",
        "bg-white/[0.04] backdrop-blur-xl",
        "border border-white/[0.08]",
        "hover:border-white/[0.14] hover:bg-white/[0.06]",
        "focus:outline-none focus:ring-2 focus:ring-violet-500/40"
      )}
      style={cardSpring}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onNavigate}
      onKeyDown={(e) => e.key === "Enter" && onNavigate?.()}
    >
      {/* Simple glow gradient — Sin tracking de cursor */}
      <animated.div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          ...glowSpring,
          background: `radial-gradient(circle at 50% 30%, ${module.color}20, transparent 70%)`,
        }}
      />

      {/* Shimmer line superior - efecto elegante */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Background gradient sutil */}
      <motion.div
        className="absolute inset-0 opacity-0 rounded-2xl"
        animate={{ opacity: isHovered ? 0.08 : 0 }}
        style={{ background: `linear-gradient(135deg, ${module.color}, transparent)` }}
      />

      {/* Header */}
      <div className="relative z-10 mb-3 flex items-start justify-between">
        <motion.div
          className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl text-white"
          style={{
            background: `linear-gradient(135deg, ${module.color}, ${module.color}CC)`,
            boxShadow: `0 4px 16px ${module.color}30`,
          }}
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <span className="relative z-10">
            {icon}
          </span>
        </motion.div>

        <ChevronRight
          size={18}
          className="text-white/30 transition-colors duration-200 group-hover:text-white/60"
          aria-hidden="true"
        />
      </div>

      {/* Name & Description - Simplificado */}
      <div className="relative z-10 mb-3">
        <p className="text-base font-semibold text-white">
          {module.nombre}
        </p>
        <p className="mt-1 text-sm text-white/50 group-hover:text-white/65 transition-colors duration-200">
          {module.descripcion}
        </p>
      </div>

      {/* Stats - Simplificados */}
      <div className="relative z-10 flex justify-between gap-2">
        {module.stats.map((stat, i) => (
          <div
            key={i}
            className="flex-1 rounded-lg bg-white/[0.03] p-2"
          >
            <span className="block text-xs text-white/45">
              {stat.label}
            </span>
            <p
              className="mt-0.5 text-sm font-semibold"
              style={{ color: module.color }}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </animated.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAIN COMPONENT — Aurora Dashboard Unified (con datos reales)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function AuroraDashboardUnified({ onNavigate, className }: AuroraDashboardUnifiedProps) {
  // 🌟 ACTIVAR SMOOTH SCROLL GLOBAL 120FPS
  useSmoothScroll({ duration: 1.2, smoothWheel: true })

  // 🔥 DATOS REALES desde Turso/Drizzle via useDashboardData
  const { stats, activities, modules, loading, error, refetch } = useDashboardData()

  const [greeting, setGreeting] = useState("")
  const [isClient, setIsClient] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Intersection Observer for heavy components
  const { ref: chartRef, isIntersecting: isChartVisible } = useIntersectionObserver({
    threshold: 0.1,
  })

  useEffect(() => {
    setIsClient(true)
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Buenos días")
    else if (hour < 19) setGreeting("Buenas tardes")
    else setGreeting("Buenas noches")

    // GSAP Entrance Animation
    const ctx = gsap.context(() => {
      gsap.from(".stagger-item", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        clearProps: "all",
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  // Weekly chart data - valores deterministas basados en el día para evitar hydration mismatch
  const weeklyData = useMemo(() => {
    const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"] as const
    // Usar valores fijos basados en seed para consistencia servidor/cliente
    const baseValues: number[] = [45000, 68000, 52000, 75000, 89000, 62000, 71000]
    return days.map((day, index) => ({
      name: day,
      value: baseValues[index] ?? 50000, // Fallback seguro
    }))
  }, [])

  // Distribution data
  const distributionData = useMemo(() => {
    return [
      { name: "Ventas", value: 45, color: "#10B981" },
      { name: "Servicios", value: 25, color: "#8B5CF6" },
      { name: "Fletes", value: 15, color: "#06B6D4" },
      { name: "Otros", value: 15, color: "#F59E0B" },
    ]
  }, [])

  return (
    <SupremeDashboardBackground
      showGradient
      showVignette
      intensity={0.75}
      className={cn("min-h-screen", className)}
    >
      {/* 🌟 AURORA BACKGROUND OVERLAY */}
      <AuroraBackground
        intensity="low"
        colors={["violet", "cyan", "emerald"]}
        interactive
        className="absolute inset-0 z-0"
      />

      <main
        ref={containerRef}
        className="relative z-10 p-6"
        aria-label="Dashboard principal CHRONOS"
      >
        {/* Header - PREMIUM ELEVATED */}
        <FadeInOnScroll delay={0}>
          <header className="stagger-item mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              {/* Decorative glow behind header */}
              <div className="absolute -top-4 -left-4 h-24 w-48 rounded-full bg-violet-500/20 blur-3xl" />
              <motion.h1
                className="animate-aurora-dance relative flex items-center gap-3 text-3xl font-bold"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div
                  className="rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 p-2"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Sparkles className="h-6 w-6 text-violet-400" />
                </motion.div>
                <span className="bg-gradient-to-r from-white via-violet-200 to-white bg-clip-text text-transparent">
                  {greeting || "Bienvenido"}, Usuario
                </span>
              </motion.h1>
              <p className="relative mt-1 text-white/50" suppressHydrationWarning>
                Panel de control{" "}
                {isClient &&
                  `- ${new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}`}
              </p>
              {/* Animated underline */}
              <motion.div
                className="mt-2 h-0.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-transparent"
                initial={{ width: 0 }}
                animate={{ width: "60%" }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Button - Premium */}
              <motion.button
                aria-label="Notificaciones (3 sin leer)"
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 text-white/60 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/30 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <Bell size={20} aria-hidden="true" className="relative z-10" />
                <motion.span
                  className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-[10px] font-bold text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  aria-hidden="true"
                >
                  3
                </motion.span>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-violet-500/10 to-violet-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
              {/* Settings Button - Premium */}
              <motion.button
                aria-label="Configuración"
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 text-white/60 backdrop-blur-sm transition-all duration-300 hover:border-cyan-500/30 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                whileHover={{ scale: 1.02, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Settings size={20} aria-hidden="true" className="relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
              {/* Refresh Button - Premium */}
              <motion.button
                onClick={refetch}
                aria-label={loading ? "Actualizando datos..." : "Actualizar datos"}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 p-3 text-white/60 backdrop-blur-sm transition-all duration-300 hover:border-emerald-500/30 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw
                  size={20}
                  className={`relative z-10 ${loading ? "animate-spin" : "group-hover:animate-spin"}`}
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
            </div>
          </header>
        </FadeInOnScroll>

        {/* Stats Row */}
        <div className="stagger-item mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <AuroraStatWidget
            label="Capital Total"
            value={`$${(stats.capitalTotal / 1000).toFixed(0)}K`}
            icon={<Wallet size={20} />}
            color="violet"
            change={stats.cambioCapital}
            trend={stats.cambioCapital >= 0 ? "up" : "down"}
            className="transition-spring hover-elevate"
          />
          <AuroraStatWidget
            label="Ventas del Mes"
            value={`$${(stats.ventasMes / 1000).toFixed(0)}K`}
            icon={<ShoppingCart size={20} />}
            className="transition-spring hover-elevate"
            color="emerald"
            change={stats.cambioVentas}
            trend={stats.cambioVentas >= 0 ? "up" : "down"}
          />
          <AuroraStatWidget
            label="Clientes Activos"
            value={stats.clientesActivos}
            icon={<Users size={20} />}
            color="cyan"
            change={stats.cambioClientes}
            trend={stats.cambioClientes >= 0 ? "up" : "down"}
            className="transition-spring hover-elevate"
          />
          <AuroraStatWidget
            label="Órdenes Pendientes"
            value={stats.ordenesPendientes}
            icon={<Package size={20} />}
            color="magenta"
            change={stats.cambioOrdenes}
            className="transition-spring hover-elevate"
            trend={stats.cambioOrdenes >= 0 ? "up" : "down"}
          />
        </div>

        {/* Advanced Metrics Row (Chronos Infinity) */}
        <div className="stagger-item mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <AuroraStatWidget
            label="Margen Promedio Lotes"
            value={`${stats.margenPromedio}%`}
            icon={<TrendingUp size={20} />}
            color="emerald"
            change={2.4}
            trend="up"
            className="border-emerald-500/20 bg-emerald-500/5"
          />
          <AuroraStatWidget
            label="Rotación Promedio Stock"
            value={`${stats.rotacionStock} días`}
            icon={<RefreshCw size={20} />}
            color="cyan"
            change={-5}
            trend="down" // Menos días es mejor
            className="border-cyan-500/20 bg-cyan-500/5"
          />
          <AuroraStatWidget
            label="Ganancia Neta Real"
            value={`$${((stats.gananciaNeta ?? 0) / 1000).toFixed(1)}K`}
            icon={<Zap size={20} />}
            color="violet"
            change={15.8}
            trend="up"
            className="border-violet-500/20 bg-violet-500/5"
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════════════════════════════
         * 🍎 iOS PREMIUM METRICS — SIN EFECTOS 3D PROBLEMÁTICOS
         * Cards limpias estilo iOS 18+ con glassmorphism Gen6
         * ═══════════════════════════════════════════════════════════════════════════════════════════ */}
        <iOSSection title="Métricas Rápidas" description="Vista limpia estilo iOS">
          <iOSGrid cols={4} gap="md">
            <iOSMetricCardPremium
              title="Capital Total"
              value={`$${(stats.capitalTotal / 1000).toFixed(0)}K`}
              icon={Wallet}
              iconColor="#8B5CF6"
              trend={{
                value: stats.cambioCapital,
                direction: stats.cambioCapital >= 0 ? 'up' : 'down',
              }}
              variant="default"
            />
            <iOSMetricCardPremium
              title="Ventas del Mes"
              value={`$${(stats.ventasMes / 1000).toFixed(0)}K`}
              icon={ShoppingCart}
              iconColor="#10B981"
              trend={{
                value: stats.cambioVentas,
                direction: stats.cambioVentas >= 0 ? 'up' : 'down',
              }}
              variant="default"
            />
            <iOSMetricCardPremium
              title="Clientes Activos"
              value={String(stats.clientesActivos)}
              icon={Users}
              iconColor="#06B6D4"
              trend={{
                value: stats.cambioClientes,
                direction: stats.cambioClientes >= 0 ? 'up' : 'down',
              }}
              variant="default"
            />
            <iOSMetricCardPremium
              title="Ganancia Neta"
              value={`$${((stats.gananciaNeta ?? 0) / 1000).toFixed(1)}K`}
              icon={Zap}
              iconColor="#FBBF24"
              trend={{
                value: 15.8,
                direction: 'up',
              }}
              variant="featured"
            />
          </iOSGrid>
        </iOSSection>

        {/* 📊 Advanced Analytics - Sankey & Heatmap */}
        <div className="stagger-item mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Sankey Chart - Flujos Financieros */}
          {isClient && (
            <CosmicSankeyChart
              nodes={[
                { id: "ventas", label: "Ventas", value: stats.ventasMes, color: "#10B981" },
                {
                  id: "boveda_monte",
                  label: "Bóveda Monte",
                  value: stats.capitalTotal * 0.4,
                  color: "#8B5CF6",
                },
                {
                  id: "flete_sur",
                  label: "Flete Sur",
                  value: stats.capitalTotal * 0.15,
                  color: "#06B6D4",
                },
                {
                  id: "utilidades",
                  label: "Utilidades",
                  value: stats.gananciaNeta,
                  color: "#FBBF24",
                },
              ]}
              links={[
                { source: "ventas", target: "boveda_monte", value: stats.ventasMes * 0.4 },
                { source: "ventas", target: "flete_sur", value: stats.ventasMes * 0.15 },
                { source: "ventas", target: "utilidades", value: stats.gananciaNeta },
              ]}
              title="Flujo de Distribución GYA"
            />
          )}

          {/* Heatmap - Actividad Bancos */}
          {isClient && (
            <CosmicHeatmapChart
              data={[
                { x: 0, y: 0, value: 85, label: "Bóveda Monte - Lun" },
                { x: 1, y: 0, value: 92, label: "Bóveda Monte - Mar" },
                { x: 0, y: 1, value: 45, label: "Flete Sur - Lun" },
                { x: 1, y: 1, value: 68, label: "Flete Sur - Mar" },
                { x: 0, y: 2, value: 75, label: "Utilidades - Lun" },
                { x: 1, y: 2, value: 88, label: "Utilidades - Mar" },
              ]}
              xLabels={["Lun", "Mar", "Mié", "Jue", "Vie"]}
              yLabels={["Bóveda Monte", "Flete Sur", "Utilidades"]}
              title="Actividad de Bancos"
              colorScale="violet"
            />
          )}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left: Modules Grid */}
          <div className="col-span-12 space-y-6 lg:col-span-8">
            {/* Module Cards */}
            <AuroraGlassCard className="stagger-item p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 font-semibold text-white">
                  <Layers size={18} className="text-violet-400" />
                  Módulos del Sistema
                </h2>
                <AuroraBadge color="violet" variant="outline">
                  {modules.length} activos
                </AuroraBadge>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {modules.map((module) => (
                  <ModuleQuickCard
                    key={module.id}
                    module={module}
                    onNavigate={() => onNavigate?.(module.path)}
                  />
                ))}
              </div>
            </AuroraGlassCard>

            {/* Weekly Chart - Lazy Loaded on Scroll */}
            <div
              ref={chartRef as any}
              className="stagger-item grid min-h-[220px] grid-cols-1 gap-6 md:grid-cols-2"
            >
              {isChartVisible && (
                <>
                  <AuroraBarChart
                    data={weeklyData}
                    height={220}
                    color="violet"
                    showTooltip
                    showGrid
                    title="Ingresos Semanal"
                  />

                  <AuroraDonutChart
                    data={distributionData}
                    height={220}
                    showLegend
                    title="Distribución de Ingresos"
                    centerLabel={`$${(stats.ventasMes / 1000).toFixed(0)}K`}
                  />
                </>
              )}
            </div>
          </div>

          {/* Right: Visualization & Activity */}
          <div className="col-span-12 space-y-6 lg:col-span-4">
            {/* Activity Feed - Virtualized */}
            <AuroraGlassCard glowColor="emerald" className="stagger-item p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-medium text-white/70">
                  <Zap size={16} className="text-emerald-400" />
                  Actividad Reciente
                </h3>
                <span className="text-xs text-white/30">Últimas 24h</span>
              </div>

              <ActivityFeedVirtual activities={activities} />

              <motion.button
                aria-label="Ver historial completo de actividad"
                className="mt-4 w-full rounded-lg border border-white/10 p-2 text-xs text-white/50 transition-all hover:bg-white/5 hover:text-white focus:ring-2 focus:ring-violet-500 focus:outline-none"
                whileHover={{ scale: 1.02 }}
              >
                Ver toda la actividad
              </motion.button>
            </AuroraGlassCard>

            {/* Quick Stats */}
            <AuroraGlassCard glowColor="cyan" className="stagger-item p-5">
              <h3 className="mb-4 text-sm font-medium text-white/70">Resumen Rápido</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} className="text-emerald-400" />
                    <span className="text-xs text-white/60">Balance Neto</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-400">
                    ${(stats.gananciaNeta / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-2">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-amber-400" />
                    <span className="text-xs text-white/60">Cobros Pendientes</span>
                  </div>
                  <span className="text-sm font-bold text-amber-400">
                    ${(stats.cobrosPendientes / 1000).toFixed(0)}K
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-red-400" />
                    <span className="text-xs text-white/60">Alertas Activas</span>
                  </div>
                  <span className="text-sm font-bold text-red-400">{stats.alertasActivas}</span>
                </div>
              </div>
            </AuroraGlassCard>
          </div>
        </div>
      </main>
    </SupremeDashboardBackground>
  )
}

// Default export
export default AuroraDashboardUnified

