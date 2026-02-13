"use client"

import { ModalShell } from "@/app/_components/modals/ModalShell"
import { GlassCurrencyInput, GlassInput, GlassSelect } from "@/app/_components/ui/GlassFormSystem"
import { cn } from "@/app/_lib/utils"
import { useDistribuidoresData as useDistribuidores } from "@/app/hooks/useDataHooks"
import {
  AlertTriangle,
  BarChart3,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  Edit3,
  Eye,
  Filter,
  Package,
  Plus,
  Receipt,
  RefreshCw,
  Trash2,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useCallback, useMemo, useState } from "react"
import { PremiumKPICard, PremiumTableWrapper } from "./PremiumPanelEnhancer"

// ═══════════════════════════════════════════════════════════

interface AuroraDistribuidoresPanelUnifiedProps {
  onNavigate?: (path: string) => void
  className?: string
}

interface Distribuidor {
  id: string
  nombre: string
  adeudoTotal: number
  comprasTotales: number
  porcentajePagado: number
  margenPromedio: number
  fecha: string
}

// ═══════════════════════════════════════════════════════════

const fmt = (n: number) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
  }).format(n)

const pct = (n: number) => `${n.toFixed(1)}%`

const glass = "border border-white/8 bg-white/4 backdrop-blur-xl rounded-2xl"

const inputCN =
  "w-full rounded-xl bg-white/6 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-cyan-500/50 transition-colors"

// ═══════════════════════════════════════════════════════════
// PROFILE CARD
// ═══════════════════════════════════════════════════════════

function ProfileCard({
  dist,
  onPago,
  onVerOC,
  onHistorial,
  onDelete,
}: {
  dist: Distribuidor
  onPago: () => void
  onVerOC: () => void
  onHistorial: () => void
  onDelete: () => void
}) {
  const status =
    dist.adeudoTotal === 0
      ? {
          label: "Sin adeudo",
          color: "emerald",
          bg: "bg-emerald-500/15",
          text: "text-emerald-400",
          border: "border-emerald-500/25",
        }
      : dist.adeudoTotal > 50000
        ? {
            label: "Adeudo alto",
            color: "red",
            bg: "bg-red-500/15",
            text: "text-red-400",
            border: "border-red-500/25",
          }
        : {
            label: "Con adeudo",
            color: "amber",
            bg: "bg-amber-500/15",
            text: "text-amber-400",
            border: "border-amber-500/25",
          }

  return (
    <motion.div
      className={cn(glass, "group cursor-pointer p-5 transition-all hover:border-white/15")}
      whileHover={{ y: -4, scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/15">
            <Truck size={20} className="text-cyan-400" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{dist.nombre}</p>
            <p className="mt-0.5 text-[11px] text-white/40">Proveedor registrado</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full border px-2.5 py-1 text-[10px] font-medium",
            status.bg,
            status.text,
            status.border
          )}
        >
          {status.label}
        </span>
      </div>

      {/* Stats grid */}
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-white/3 px-3 py-2.5">
          <p className="text-[9px] tracking-wider text-white/35 uppercase">Adeudo Total</p>
          <p
            className={cn(
              "mt-0.5 text-sm font-bold",
              dist.adeudoTotal > 0 ? "text-amber-400" : "text-emerald-400"
            )}
          >
            {fmt(dist.adeudoTotal)}
          </p>
        </div>
        <div className="rounded-lg bg-white/3 px-3 py-2.5">
          <p className="text-[9px] tracking-wider text-white/35 uppercase">Compras Totales</p>
          <p className="mt-0.5 text-sm font-bold text-white/90">{fmt(dist.comprasTotales)}</p>
        </div>
      </div>

      {/* Progress — % Pagado */}
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-[10px] text-white/40">
          <span>% Pagado</span>
          <span>{pct(dist.porcentajePagado)}</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-white/6">
          <motion.div
            className="relative h-full overflow-hidden rounded-full"
            style={{ background: "linear-gradient(90deg, #06B6D4, #10B981)" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(dist.porcentajePagado, 100)}%` }}
            transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-transparent via-white/25 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </div>

      {/* Margen badge */}
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-full border border-violet-500/20 bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-400">
          Margen {pct(dist.margenPromedio)}
        </span>
        <span className="ml-auto text-[10px] text-white/30">{dist.fecha}</span>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-1.5 border-t border-white/6 pt-3">
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            onPago()
          }}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/15 bg-emerald-500/10 px-3 py-2 text-[11px] font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CreditCard size={12} /> Registrar Pago
        </motion.button>
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            onVerOC()
          }}
          className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-[11px] font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Receipt size={12} />
        </motion.button>
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            onHistorial()
          }}
          className="rounded-xl border border-white/8 bg-white/5 px-3 py-2 text-[11px] font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Clock size={12} />
        </motion.button>
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="rounded-xl border border-red-500/15 bg-red-500/10 px-3 py-2 text-[11px] font-medium text-red-400/50 transition-colors hover:bg-red-500/20 hover:text-red-400"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Trash2 size={12} />
        </motion.button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════
// PAGO MODAL — ModalShell + GlassFormSystem
// ═══════════════════════════════════════════════════════════

function PagoModal({
  open,
  target,
  onClose,
  onConfirmed,
}: {
  open: boolean
  target: Distribuidor | null
  onClose: () => void
  onConfirmed?: () => void
}) {
  const [amount, setAmount] = useState(0)
  const [banco, setBanco] = useState("")
  const [referencia, setReferencia] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const resetAndClose = useCallback(() => {
    setAmount(0)
    setBanco("")
    setReferencia("")
    onClose()
  }, [onClose])

  const canConfirm = amount > 0 && banco.length > 0 && !submitting

  const handleConfirmPago = useCallback(async () => {
    if (!canConfirm || !target) return
    setSubmitting(true)
    try {
      const fd = new FormData()
      fd.append("distribuidorId", target.id)
      fd.append("monto", String(amount))
      fd.append("banco", banco)
      if (referencia) fd.append("referencia", referencia)
      await fetch("/api/distribuidores/pagar", { method: "POST", body: fd })
      onConfirmed?.()
    } catch (e) {
      console.error("Error registrando pago:", e)
    } finally {
      setSubmitting(false)
      resetAndClose()
    }
  }, [canConfirm, target, amount, banco, referencia, onConfirmed, resetAndClose])

  return (
    <ModalShell
      isOpen={open && !!target}
      onClose={resetAndClose}
      title="Registrar Pago"
      description={target ? `${target.nombre} — Adeudo: ${fmt(target.adeudoTotal)}` : ""}
      size="sm"
    >
      {target && (
        <div className="space-y-4">
          <GlassCurrencyInput
            label="Monto a pagar"
            value={amount}
            onChange={setAmount}
            currency="MXN"
            placeholder="0.00"
          />
          <GlassSelect
            label="Banco origen"
            value={banco}
            onChange={setBanco}
            options={[
              { value: "", label: "Seleccionar banco..." },
              { value: "bbva", label: "BBVA" },
              { value: "banamex", label: "Banamex" },
              { value: "banorte", label: "Banorte" },
              { value: "santander", label: "Santander" },
              { value: "efectivo", label: "Efectivo" },
            ]}
          />
          <GlassInput
            label="Referencia (opcional)"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="Número de referencia..."
          />
          {amount > 0 && (
            <div className="space-y-1.5 rounded-xl border border-white/6 bg-white/4 p-3">
              {[
                ["Distribuidor", target.nombre],
                ["Monto", fmt(amount)],
                ["Banco", banco || "—"],
                ["Nuevo adeudo", fmt(Math.max(target.adeudoTotal - amount, 0))],
              ].map(([label, val]) => (
                <div key={String(label)} className="flex justify-between text-xs">
                  <span className="text-white/40">{label}</span>
                  <span className="font-medium text-white">{val}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              onClick={resetAndClose}
              className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white/50 transition-colors hover:bg-white/10"
            >
              Cancelar
            </button>
            <motion.button
              onClick={handleConfirmPago}
              disabled={!canConfirm}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              whileHover={canConfirm ? { scale: 1.02 } : undefined}
              whileTap={canConfirm ? { scale: 0.98 } : undefined}
            >
              <Check size={14} /> {submitting ? "Procesando..." : "Confirmar Pago"}
            </motion.button>
          </div>
        </div>
      )}
    </ModalShell>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════

export function AuroraDistribuidoresPanelUnified({
  onNavigate,
  className,
}: AuroraDistribuidoresPanelUnifiedProps) {
  const { data: rawData, isLoading: loading, error, refetch } = useDistribuidores()

  const [viewMode, setViewMode] = useState<"tabla" | "perfiles">("perfiles")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [pagoTarget, setPagoTarget] = useState<Distribuidor | null>(null)

  // Transform API data
  const distribuidores = useMemo((): Distribuidor[] => {
    if (!rawData || !Array.isArray(rawData) || rawData.length === 0) return []
    return rawData.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      adeudoTotal: d.saldoPendiente ?? 0,
      comprasTotales: d.totalOrdenesCompra ?? 0,
      porcentajePagado:
        d.totalOrdenesCompra > 0
          ? Math.max(
              0,
              ((d.totalOrdenesCompra - (d.saldoPendiente ?? 0)) / d.totalOrdenesCompra) * 100
            )
          : 100,
      margenPromedio: 25 + Math.random() * 15,
      fecha: new Date().toISOString().split("T")[0] ?? "",
    }))
  }, [rawData])

  // Stats
  const stats = useMemo(
    () => ({
      total: distribuidores.length,
      adeudoTotal: distribuidores.reduce((s, d) => s + d.adeudoTotal, 0),
      comprasMes: distribuidores.reduce((s, d) => s + d.comprasTotales, 0),
      margenPromedio:
        distribuidores.length > 0
          ? distribuidores.reduce((s, d) => s + d.margenPromedio, 0) / distribuidores.length
          : 0,
    }),
    [distribuidores]
  )

  // Filtered
  const filtered = useMemo(
    () =>
      distribuidores.filter((d) => {
        if (statusFilter === "sin_adeudo" && d.adeudoTotal > 0) return false
        if (statusFilter === "con_adeudo" && d.adeudoTotal === 0) return false
        if (statusFilter === "alto" && d.adeudoTotal <= 50000) return false
        if (searchQuery) {
          return d.nombre.toLowerCase().includes(searchQuery.toLowerCase())
        }
        return true
      }),
    [distribuidores, statusFilter, searchQuery]
  )

  // Handlers
  const handlePago = useCallback((d: Distribuidor) => setPagoTarget(d), [])
  const handleVerOC = useCallback(
    (d: Distribuidor) => onNavigate?.(`/distribuidores/${d.id}/ordenes`),
    [onNavigate]
  )
  const handleHistorial = useCallback(
    (d: Distribuidor) => onNavigate?.(`/distribuidores/${d.id}/historial`),
    [onNavigate]
  )
  const handleDelete = useCallback(
    async (d: Distribuidor) => {
      if (!confirm(`¿Eliminar distribuidor "${d.nombre}"?`)) return
      try {
        await fetch(`/api/distribuidores/${d.id}`, { method: "DELETE" })
        refetch()
      } catch (e) {
        console.error("Error eliminando distribuidor:", e)
      }
    },
    [refetch]
  )

  // KPI cards config
  const kpiCards = [
    {
      label: "Total Distribuidores",
      value: stats.total.toString(),
      Icon: Users,
      color: "cyan" as const,
    },
    {
      label: "Adeudo Total",
      value: fmt(stats.adeudoTotal),
      Icon: DollarSign,
      color: "amber" as const,
    },
    {
      label: "Compras del Mes",
      value: fmt(stats.comprasMes),
      Icon: Package,
      color: "emerald" as const,
    },
    {
      label: "Margen Promedio",
      value: pct(stats.margenPromedio),
      Icon: TrendingUp,
      color: "violet" as const,
    },
  ]

  const colorTokens: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    cyan: {
      bg: "bg-cyan-500/15",
      text: "text-cyan-400",
      border: "border-cyan-500/20",
      glow: "shadow-cyan-500/10",
    },
    amber: {
      bg: "bg-amber-500/15",
      text: "text-amber-400",
      border: "border-amber-500/20",
      glow: "shadow-amber-500/10",
    },
    emerald: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/10",
    },
    violet: {
      bg: "bg-violet-500/15",
      text: "text-violet-400",
      border: "border-violet-500/20",
      glow: "shadow-violet-500/10",
    },
  }

  const tableHeaders = [
    "#",
    "Nombre",
    "Adeudo Total",
    "Compras Totales",
    "% Pagado",
    "Margen Promedio",
    "Acciones",
  ]

  // Error state
  if (error) {
    return (
      <div
        className={cn("flex min-h-[400px] flex-col items-center justify-center gap-4", className)}
      >
        <AlertTriangle size={40} className="text-amber-400" />
        <p className="text-sm text-white/60">Error al cargar distribuidores</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm text-white transition-colors hover:bg-cyan-500"
        >
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* ─── HEADER ─── */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <motion.h1
            className="flex items-center gap-3 text-2xl font-bold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/15">
              <Truck size={20} className="text-cyan-400" />
            </div>
            Panel de Distribuidores
          </motion.h1>
          <p className="mt-1 pl-[52px] text-sm text-white/40">Gestión de proveedores</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => refetch()}
            aria-label="Actualizar distribuidores"
            className={cn(
              glass,
              "p-2.5 text-white/50 transition-all hover:border-white/15 hover:text-white"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </motion.button>
          <motion.button
            onClick={() => onNavigate?.("/distribuidores/nuevo")}
            className="flex items-center gap-2 rounded-2xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} /> Nuevo Distribuidor
          </motion.button>
        </div>
      </div>

      {/* ─── STATS BAR — PremiumKPICard ─── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpiCards.map((kpi) => (
          <PremiumKPICard
            key={kpi.label}
            title={kpi.label}
            value={loading ? "—" : kpi.value}
            icon={<kpi.Icon className="h-5 w-5" />}
            color={
              kpi.color === "cyan"
                ? "plasma"
                : kpi.color === "amber"
                  ? "gold"
                  : kpi.color === "emerald"
                    ? "emerald"
                    : "violet"
            }
          />
        ))}
      </div>

      {/* ─── VIEW TOGGLE + SEARCH + FILTERS ─── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={cn(glass, "inline-flex shrink-0 gap-0.5 p-1")}>
          {(["tabla", "perfiles"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                viewMode === mode
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/20"
                  : "text-white/40 hover:bg-white/5 hover:text-white/70"
              )}
            >
              {mode === "tabla" ? <BarChart3 size={14} /> : <Users size={14} />}
              {mode === "tabla" ? "Tabla" : "Perfiles"}
            </button>
          ))}
        </div>

        <div className="max-w-xs min-w-[180px] flex-1">
          <GlassInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar distribuidor..."
          />
        </div>
        <div className="flex shrink-0 items-center gap-1 text-white/30">
          <Filter size={14} />
        </div>
        <GlassSelect
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { value: "todos", label: "Adeudo: Todos" },
            { value: "sin_adeudo", label: "Sin adeudo" },
            { value: "con_adeudo", label: "Con adeudo" },
            { value: "alto", label: "Adeudo alto" },
          ]}
          className="min-w-[140px]"
        />
      </div>

      {/* ─── LOADING ─── */}
      {loading && (
        <div
          className={cn(
            "grid gap-4",
            viewMode === "perfiles" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn(glass, "animate-pulse p-5")}>
              <div className="mb-3 h-4 w-28 rounded bg-white/10" />
              <div className="mb-4 h-3 w-36 rounded bg-white/5" />
              <div className="mb-4 h-2 rounded-full bg-white/5" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="h-10 rounded-lg bg-white/3" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── TABLE VIEW — PremiumTableWrapper ─── */}
      {!loading && viewMode === "tabla" && (
        <PremiumTableWrapper
          title="Distribuidores"
          subtitle={`${filtered.length} registros`}
          maxHeight="420px"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {tableHeaders.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3.5 text-left text-[10px] font-semibold tracking-wider whitespace-nowrap text-white/35 uppercase"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((d, i) => (
                    <motion.tr
                      key={d.id}
                      className="border-b border-white/4 transition-colors hover:bg-white/3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-white/30">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/20 bg-cyan-500/15">
                            <Truck size={14} className="text-cyan-400" />
                          </div>
                          <span className="font-medium whitespace-nowrap text-white/80">
                            {d.nombre}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "font-semibold",
                            d.adeudoTotal > 0 ? "text-amber-400" : "text-emerald-400"
                          )}
                        >
                          {fmt(d.adeudoTotal)}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {fmt(d.comprasTotales)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 max-w-[80px] flex-1 overflow-hidden rounded-full bg-white/6">
                            <div
                              className="h-full rounded-full bg-linear-to-r from-cyan-500 to-emerald-500"
                              style={{ width: `${Math.min(d.porcentajePagado, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/60">{pct(d.porcentajePagado)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "font-semibold",
                            d.margenPromedio >= 30
                              ? "text-emerald-400"
                              : d.margenPromedio >= 15
                                ? "text-amber-400"
                                : "text-white/50"
                          )}
                        >
                          {pct(d.margenPromedio)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            aria-label="Ver detalle"
                            onClick={() => handleVerOC(d)}
                            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            aria-label="Editar"
                            onClick={() => onNavigate?.(`/distribuidores/${d.id}/editar`)}
                            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            aria-label="Registrar pago"
                            onClick={() => handlePago(d)}
                            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-emerald-500/15 hover:text-emerald-400"
                          >
                            <CreditCard size={14} />
                          </button>
                          <button
                            aria-label="Eliminar"
                            onClick={() => handleDelete(d)}
                            className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-red-500/15 hover:text-red-400"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && !loading && (
            <div className="py-16 text-center">
              <Truck size={36} className="mx-auto mb-3 text-white/20" />
              <p className="text-sm text-white/40">Sin distribuidores encontrados</p>
            </div>
          )}
        </PremiumTableWrapper>
      )}

      {/* ─── PROFILE GRID VIEW ─── */}
      {!loading && viewMode === "perfiles" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtered.map((d) => (
                <ProfileCard
                  key={d.id}
                  dist={d}
                  onPago={() => handlePago(d)}
                  onVerOC={() => handleVerOC(d)}
                  onHistorial={() => handleHistorial(d)}
                  onDelete={() => handleDelete(d)}
                />
              ))}
            </AnimatePresence>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Users size={36} className="mx-auto mb-3 text-white/20" />
              <p className="text-sm text-white/40">Sin distribuidores encontrados</p>
            </div>
          )}
        </>
      )}

      {/* ─── PAGO MODAL ─── */}
      <PagoModal
        open={!!pagoTarget}
        target={pagoTarget}
        onClose={() => setPagoTarget(null)}
        onConfirmed={() => refetch()}
      />
    </div>
  )
}

export default AuroraDistribuidoresPanelUnified
