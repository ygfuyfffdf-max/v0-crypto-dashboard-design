"use client"

import { ModalShell } from "@/app/_components/modals/ModalShell"
import { GlassCurrencyInput, GlassInput, GlassSelect } from "@/app/_components/ui/GlassFormSystem"
import { cn } from "@/app/_lib/utils"
import { useOrdenesCompraData as useOrdenes } from "@/app/hooks/useDataHooks"
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Calendar,
  Check,
  ClipboardList,
  Clock,
  DollarSign,
  Edit3,
  Eye,
  Filter,
  Layers,
  Package,
  Plus,
  RefreshCw,
  Trash2,
  TrendingUp,
  Truck,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import React, { useCallback, useMemo, useState } from "react"
import { PremiumKPICard, PremiumTableWrapper } from "./PremiumPanelEnhancer"

// ═══════════════════════════════════════════════════════════

interface OrdenDisplay {
  id: string
  distribuidor: string
  producto: string
  cantidadOriginal: number
  cantidadVendida: number
  cantidadRestante: number
  costoTotal: number
  adeudoPendiente: number
  gananciaNeta: number
  margen: number
  rotacionDias: number
  valorStockRestante: number
  estado: "en_stock" | "parcial" | "agotado" | "pagado"
  fecha: string
}

interface AuroraComprasPanelUnifiedProps {
  onNavigate?: (path: string) => void
  className?: string
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

const statusMap = {
  en_stock: {
    label: "En Stock",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    Icon: Check,
  },
  parcial: {
    label: "Parcial",
    bg: "bg-amber-500/15",
    text: "text-amber-400",
    border: "border-amber-500/30",
    Icon: Clock,
  },
  agotado: {
    label: "Agotado",
    bg: "bg-white/6",
    text: "text-white/50",
    border: "border-white/10",
    Icon: Package,
  },
  pagado: {
    label: "Pagado",
    bg: "bg-emerald-500/15",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    Icon: DollarSign,
  },
} as const

const inputCN =
  "w-full rounded-xl bg-white/6 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-violet-500/50 transition-colors"

// ═══════════════════════════════════════════════════════════

function LotCard({ orden }: { orden: OrdenDisplay }) {
  const s = statusMap[orden.estado]
  const progress =
    orden.cantidadOriginal > 0 ? (orden.cantidadVendida / orden.cantidadOriginal) * 100 : 0

  return (
    <motion.div
      className={cn(glass, "group cursor-pointer p-5 transition-all hover:border-white/15")}
      whileHover={{ y: -4, scale: 1.01 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
            <Truck size={12} className="text-violet-400" />
            {orden.distribuidor}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-white/40">
            <Calendar size={10} /> {orden.fecha}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
            s.bg,
            s.text,
            s.border
          )}
        >
          {s.label}
        </span>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/15">
          <Package size={18} className="text-violet-400" />
        </div>
        <p className="truncate text-sm font-medium text-white/80">{orden.producto}</p>
      </div>

      {/* Progress bar with liquid fill */}
      <div className="mb-4">
        <div className="mb-1.5 flex justify-between text-[10px] text-white/40">
          <span>Vendido</span>
          <span>
            {orden.cantidadVendida} / {orden.cantidadOriginal}
          </span>
        </div>
        <div className="relative h-2.5 overflow-hidden rounded-full bg-white/6">
          <motion.div
            className="relative h-full overflow-hidden rounded-full"
            style={{ background: "linear-gradient(90deg, #8B5CF6, #06B6D4)" }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
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

      {/* Metrics grid 2x3 */}
      <div className="mb-3 grid grid-cols-2 gap-2">
        {(
          [
            ["Cant. Original", orden.cantidadOriginal.toString()],
            ["Vendidas", orden.cantidadVendida.toString()],
            ["Restantes", orden.cantidadRestante.toString()],
            ["Costo Total", fmt(orden.costoTotal)],
            ["Adeudo", fmt(orden.adeudoPendiente)],
            ["Ganancia", fmt(orden.gananciaNeta)],
          ] as const
        ).map(([label, value]) => (
          <div key={label} className="rounded-lg bg-white/3 px-3 py-2">
            <p className="text-[9px] tracking-wider text-white/35 uppercase">{label}</p>
            <p className="mt-0.5 text-xs font-semibold text-white/90">{value}</p>
          </div>
        ))}
      </div>

      {/* Bottom badges */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-cyan-500/20 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
          Margen {pct(orden.margen)}
        </span>
        <span className="rounded-full border border-violet-500/20 bg-violet-500/15 px-2 py-0.5 text-[10px] font-medium text-violet-400">
          {orden.rotacionDias}d rotación
        </span>
        <span className="ml-auto flex items-center gap-1 text-[10px] text-white/40">
          <Layers size={10} /> {fmt(orden.valorStockRestante)}
        </span>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════
// CREATE OC MODAL — ModalShell + GlassFormSystem
// ═══════════════════════════════════════════════════════════

function CreateOCModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated?: () => void
}) {
  const [step, setStep] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    distribuidor: "",
    producto: "",
    cantidad: 0,
    costoUnitario: 0,
    pagoInicial: 0,
    bancoOrigen: "",
  })
  const costoTotal = form.cantidad * form.costoUnitario
  const adeudo = Math.max(costoTotal - form.pagoInicial, 0)
  const steps = ["Distribuidor", "Productos", "Pago Inicial", "Confirmar"]
  const resetAndClose = useCallback(() => {
    setStep(0)
    setForm({
      distribuidor: "",
      producto: "",
      cantidad: 0,
      costoUnitario: 0,
      pagoInicial: 0,
      bancoOrigen: "",
    })
    onClose()
  }, [onClose])
  const handleSubmitOC = useCallback(async () => {
    setSubmitting(true)
    try {
      await fetch("/api/ordenes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distribuidorId: form.distribuidor,
          producto: form.producto,
          cantidad: form.cantidad,
          costoUnitario: form.costoUnitario,
          pagoInicial: form.pagoInicial,
          bancoOrigen: form.bancoOrigen,
        }),
      })
      onCreated?.()
    } catch (err) {
      console.error("Error al crear orden de compra", err)
    } finally {
      setSubmitting(false)
      resetAndClose()
    }
  }, [form, onCreated, resetAndClose])
  const canAdvance =
    step === 0
      ? !!form.distribuidor
      : step === 1
        ? !!form.producto && form.cantidad > 0 && form.costoUnitario > 0
        : true

  return (
    <ModalShell
      isOpen={open}
      onClose={resetAndClose}
      title="Nueva Orden de Compra"
      description={`Paso ${step + 1} de 4 — ${steps[step]}`}
      size="md"
    >
      <div className="space-y-5">
        <div className="flex items-center gap-1">
          {steps.map((label, i) => (
            <React.Fragment key={label}>
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  i <= step ? "bg-violet-500 text-white" : "bg-white/10 text-white/30"
                )}
              >
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    i < step ? "bg-violet-500" : "bg-white/10"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[140px] space-y-4"
          >
            {step === 0 && (
              <GlassInput
                label="Distribuidor"
                placeholder="Buscar o ingresar distribuidor..."
                value={form.distribuidor}
                onChange={(e) => setForm((f) => ({ ...f, distribuidor: e.target.value }))}
              />
            )}
            {step === 1 && (
              <>
                <GlassInput
                  label="Producto"
                  placeholder="Nombre del producto..."
                  value={form.producto}
                  onChange={(e) => setForm((f) => ({ ...f, producto: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-3">
                  <GlassInput
                    label="Cantidad"
                    type="number"
                    placeholder="1"
                    value={String(form.cantidad || "")}
                    onChange={(e) => setForm((f) => ({ ...f, cantidad: +e.target.value || 0 }))}
                  />
                  <GlassCurrencyInput
                    label="Costo unitario"
                    value={form.costoUnitario}
                    onChange={(v) => setForm((f) => ({ ...f, costoUnitario: v }))}
                    currency="MXN"
                    placeholder="0.00"
                  />
                </div>
                {costoTotal > 0 && (
                  <p className="text-xs text-white/50">
                    Costo total: <span className="font-medium text-white">{fmt(costoTotal)}</span>
                  </p>
                )}
              </>
            )}
            {step === 2 && (
              <>
                <GlassCurrencyInput
                  label="Monto pago inicial"
                  value={form.pagoInicial}
                  onChange={(v) => setForm((f) => ({ ...f, pagoInicial: Math.min(v, costoTotal) }))}
                  currency="MXN"
                  placeholder="0.00"
                />
                <GlassInput
                  label="Banco origen"
                  placeholder="BBVA, Banamex, Banorte..."
                  value={form.bancoOrigen}
                  onChange={(e) => setForm((f) => ({ ...f, bancoOrigen: e.target.value }))}
                />
              </>
            )}
            {step === 3 && (
              <div className="space-y-2 rounded-xl border border-white/6 bg-white/4 p-4">
                {[
                  ["Distribuidor", form.distribuidor],
                  ["Producto", `${form.producto} × ${form.cantidad}`],
                  ["Costo Total", fmt(costoTotal)],
                  ["Pago Inicial", form.pagoInicial > 0 ? fmt(form.pagoInicial) : "Sin pago"],
                  ["Adeudo Inicial", fmt(adeudo)],
                  ["Banco", form.bancoOrigen || "—"],
                ].map(([label, val]) => (
                  <div key={String(label)} className="flex justify-between text-sm">
                    <span className="text-white/40">{label}</span>
                    <span className="font-medium text-white">{val}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-between pt-2">
          <button
            onClick={() => (step > 0 ? setStep((s) => s - 1) : resetAndClose())}
            className="rounded-xl bg-white/5 px-4 py-2 text-sm text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            {step > 0 ? "Atrás" : "Cancelar"}
          </button>
          <motion.button
            onClick={() => (step < 3 ? setStep((s) => s + 1) : handleSubmitOC())}
            disabled={!canAdvance || submitting}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
            whileHover={canAdvance ? { scale: 1.02 } : undefined}
            whileTap={canAdvance ? { scale: 0.98 } : undefined}
          >
            {step < 3 ? (
              <>
                Siguiente <ArrowRight size={14} />
              </>
            ) : submitting ? (
              "Creando…"
            ) : (
              <>
                Crear OC <Check size={14} />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </ModalShell>
  )
}

// ═══════════════════════════════════════════════════════════

export function AuroraComprasPanelUnified({
  onNavigate,
  className,
}: AuroraComprasPanelUnifiedProps) {
  const { data: ordenesRaw, loading, error, refetch } = useOrdenes()
  const [viewMode, setViewMode] = useState<"tabla" | "lotes">("lotes")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [distribuidorFilter, setDistribuidorFilter] = useState("todos")
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleDeleteOrden = useCallback(
    async (id: string) => {
      if (!confirm("¿Estás seguro de eliminar esta orden de compra?")) return
      try {
        await fetch(`/api/ordenes/${id}`, { method: "DELETE" })
        refetch()
      } catch (err) {
        console.error("Error al eliminar orden", err)
      }
    },
    [refetch]
  )

  const ordenes = useMemo((): OrdenDisplay[] => {
    if (!Array.isArray(ordenesRaw) || ordenesRaw.length === 0) return []
    return ordenesRaw.map((o) => {
      const cantidadOriginal = o.cantidad ?? 0
      const cantidadVendida = Math.max(cantidadOriginal - (o.stockActual ?? cantidadOriginal), 0)
      const cantidadRestante = o.stockActual ?? cantidadOriginal
      const costoTotal = o.total ?? 0
      const adeudoPendiente = o.montoRestante ?? 0
      const precioUnitario = cantidadOriginal > 0 ? costoTotal / cantidadOriginal : 0
      const gananciaNeta = cantidadVendida * precioUnitario * 0.3
      const margen = costoTotal > 0 ? (gananciaNeta / costoTotal) * 100 : 0
      const rotacionDias =
        cantidadVendida > 0 ? Math.round((cantidadOriginal / cantidadVendida) * 7) : 0
      const valorStockRestante = cantidadRestante * precioUnitario

      let estado: OrdenDisplay["estado"] = "en_stock"
      if (cantidadRestante === 0) estado = "agotado"
      else if (cantidadVendida > 0) estado = "parcial"
      if (adeudoPendiente === 0 && costoTotal > 0) estado = "pagado"

      const fechaStr = o.fecha ? (new Date(o.fecha).toISOString().split("T")[0] ?? "") : ""

      return {
        id: o.id,
        distribuidor: o.distribuidorId ?? "Sin distribuidor",
        producto: "Producto",
        cantidadOriginal,
        cantidadVendida,
        cantidadRestante,
        costoTotal,
        adeudoPendiente,
        gananciaNeta,
        margen,
        rotacionDias,
        valorStockRestante,
        estado,
        fecha: fechaStr,
      }
    })
  }, [ordenesRaw])

  // Stats
  const stats = useMemo(
    () => ({
      totalOC: ordenes.length,
      inversionTotal: ordenes.reduce((s, o) => s + o.costoTotal, 0),
      adeudoPendiente: ordenes.reduce((s, o) => s + o.adeudoPendiente, 0),
      margenPromedio:
        ordenes.length > 0 ? ordenes.reduce((s, o) => s + o.margen, 0) / ordenes.length : 0,
    }),
    [ordenes]
  )

  // Unique distribuidores
  const distribuidores = useMemo(() => [...new Set(ordenes.map((o) => o.distribuidor))], [ordenes])

  // Filtered
  const filtered = useMemo(
    () =>
      ordenes.filter((o) => {
        if (statusFilter !== "todos" && o.estado !== statusFilter) return false
        if (distribuidorFilter !== "todos" && o.distribuidor !== distribuidorFilter) return false
        if (searchQuery) {
          const q = searchQuery.toLowerCase()
          return (
            o.distribuidor.toLowerCase().includes(q) ||
            o.producto.toLowerCase().includes(q) ||
            o.id.toLowerCase().includes(q)
          )
        }
        return true
      }),
    [ordenes, statusFilter, distribuidorFilter, searchQuery]
  )

  if (error) {
    return (
      <div
        className={cn("flex min-h-[400px] flex-col items-center justify-center gap-4", className)}
      >
        <AlertTriangle size={40} className="text-amber-400" />
        <p className="text-sm text-white/60">Error al cargar órdenes de compra</p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm text-white transition-colors hover:bg-violet-500"
        >
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    )
  }

  const kpiCards = [
    {
      label: "Total OC",
      value: stats.totalOC.toString(),
      icon: ClipboardList,
      color: "violet" as const,
    },
    {
      label: "Inversión Total",
      value: fmt(stats.inversionTotal),
      icon: DollarSign,
      color: "emerald" as const,
    },
    {
      label: "Adeudo Pendiente",
      value: fmt(stats.adeudoPendiente),
      icon: AlertTriangle,
      color: "amber" as const,
    },
    {
      label: "Margen Promedio",
      value: pct(stats.margenPromedio),
      icon: TrendingUp,
      color: "cyan" as const,
    },
  ]

  const colorTokens: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    violet: {
      bg: "bg-violet-500/15",
      text: "text-violet-400",
      border: "border-violet-500/20",
      glow: "shadow-violet-500/10",
    },
    emerald: {
      bg: "bg-emerald-500/15",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      glow: "shadow-emerald-500/10",
    },
    amber: {
      bg: "bg-amber-500/15",
      text: "text-amber-400",
      border: "border-amber-500/20",
      glow: "shadow-amber-500/10",
    },
    cyan: {
      bg: "bg-cyan-500/15",
      text: "text-cyan-400",
      border: "border-cyan-500/20",
      glow: "shadow-cyan-500/10",
    },
  }

  const tableHeaders = [
    "#",
    "Distribuidor",
    "Producto",
    "Cantidad",
    "Costo Total",
    "Vendido",
    "Restante",
    "Margen%",
    "Estado",
    "Acciones",
  ]

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/15">
              <ClipboardList size={20} className="text-violet-400" />
            </div>
            Órdenes de Compra
          </motion.h1>
          <p className="mt-1 pl-[52px] text-sm text-white/40">Gestión de lotes y proveedores</p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => refetch()}
            aria-label="Actualizar órdenes"
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
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-2xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-500"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} /> Nueva OC
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
            icon={<kpi.icon className="h-5 w-5" />}
            color={
              kpi.color === "violet"
                ? "violet"
                : kpi.color === "emerald"
                  ? "emerald"
                  : kpi.color === "amber"
                    ? "gold"
                    : "plasma"
            }
          />
        ))}
      </div>

      {/* ─── VIEW TOGGLE + FILTERS ─── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className={cn(glass, "inline-flex shrink-0 gap-0.5 p-1")}>
          {(["tabla", "lotes"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={cn(
                "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all",
                viewMode === mode
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                  : "text-white/40 hover:bg-white/5 hover:text-white/70"
              )}
            >
              {mode === "tabla" ? <BarChart3 size={14} /> : <Layers size={14} />}
              {mode === "tabla" ? "Tabla" : "Lotes"}
            </button>
          ))}
        </div>

        <div className="max-w-xs min-w-[180px] flex-1">
          <GlassInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar orden..."
          />
        </div>
        <div className="flex shrink-0 items-center gap-1 text-white/30">
          <Filter size={14} />
        </div>
        <GlassSelect
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { value: "todos", label: "Estado: Todos" },
            { value: "en_stock", label: "En Stock" },
            { value: "parcial", label: "Parcial" },
            { value: "agotado", label: "Agotado" },
            { value: "pagado", label: "Pagado" },
          ]}
          className="min-w-[130px]"
        />
        <GlassSelect
          value={distribuidorFilter}
          onChange={(val) => setDistribuidorFilter(val)}
          options={[
            { value: "todos", label: "Distribuidor: Todos" },
            ...distribuidores.map((d) => ({ value: d, label: d })),
          ]}
          className="min-w-[160px]"
        />
      </div>

      {loading && (
        <div
          className={cn(
            "grid gap-4",
            viewMode === "lotes" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={cn(glass, "animate-pulse p-5")}>
              <div className="mb-3 h-4 w-28 rounded bg-white/10" />
              <div className="mb-4 h-3 w-36 rounded bg-white/5" />
              <div className="mb-4 h-2.5 rounded-full bg-white/5" />
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, j) => (
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
          title="Órdenes de Compra"
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
                  {filtered.map((o, i) => {
                    const s = statusMap[o.estado]
                    return (
                      <motion.tr
                        key={o.id}
                        className="border-b border-white/4 transition-colors hover:bg-white/3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-white/30">{i + 1}</td>
                        <td className="px-4 py-3 font-medium whitespace-nowrap text-white/80">
                          {o.distribuidor}
                        </td>
                        <td className="px-4 py-3 text-white/60">{o.producto}</td>
                        <td className="px-4 py-3 font-mono text-white/70">{o.cantidadOriginal}</td>
                        <td className="px-4 py-3 font-semibold text-white">{fmt(o.costoTotal)}</td>
                        <td className="px-4 py-3 font-mono text-cyan-400">{o.cantidadVendida}</td>
                        <td className="px-4 py-3 font-mono text-white/60">{o.cantidadRestante}</td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "font-semibold",
                              o.margen >= 30
                                ? "text-emerald-400"
                                : o.margen >= 15
                                  ? "text-amber-400"
                                  : "text-white/50"
                            )}
                          >
                            {pct(o.margen)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-[10px] font-medium whitespace-nowrap",
                              s.bg,
                              s.text,
                              s.border
                            )}
                          >
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              aria-label="Ver detalle"
                              className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              aria-label="Editar"
                              className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteOrden(o.id)}
                              aria-label="Eliminar"
                              className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-red-500/20 hover:text-red-400"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && !loading && (
            <div className="py-16 text-center">
              <ClipboardList size={36} className="mx-auto mb-3 text-white/20" />
              <p className="text-sm text-white/40">Sin órdenes de compra</p>
            </div>
          )}
        </PremiumTableWrapper>
      )}

      {/* ─── LOT CARD VIEW ─── */}
      {!loading && viewMode === "lotes" && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filtered.map((o) => (
                <LotCard key={o.id} orden={o} />
              ))}
            </AnimatePresence>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <Layers size={36} className="mx-auto mb-3 text-white/20" />
              <p className="text-sm text-white/40">Sin lotes encontrados</p>
            </div>
          )}
        </>
      )}

      {/* ─── CREATE OC MODAL ─── */}
      <CreateOCModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => refetch()}
      />
    </div>
  )
}

export default AuroraComprasPanelUnified
