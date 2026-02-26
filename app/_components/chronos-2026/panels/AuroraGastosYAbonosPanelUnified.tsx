"use client"

import {
    LiquidGlassButton,
    LiquidGlassSearchField
} from "@/app/_components/chronos-2026/primitives/LiquidGlassSystem"
import { ModalShell } from "@/app/_components/modals/ModalShell"
import { GlassCurrencyInput, GlassInput, GlassSelect } from "@/app/_components/ui/GlassFormSystem"
import { cn } from "@/app/_lib/utils"
import { useMovimientosData } from "@/app/hooks/useDataHooks"
import {
    AlertTriangle,
    ArrowLeftRight,
    BarChart3,
    Calendar,
    Check,
    CreditCard,
    DollarSign,
    Landmark,
    PieChart,
    Plus,
    Receipt,
    RefreshCw,
    TrendingDown,
    TrendingUp,
    Wallet,
    X,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import React, { useCallback, useMemo, useState } from "react"
import { PremiumChartWrapper, PremiumKPICard, PremiumTableWrapper } from "./PremiumPanelEnhancer"

interface AuroraGastosYAbonosPanelUnifiedProps {
  onNavigate?: (path: string) => void
  className?: string
}
type TabId = "gastos" | "abonos" | "transferencias"

const fmtMXN = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" })
const fmtDate = (d: string) => {
  try {
    return new Date(d).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return d
  }
}
const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: "gastos", label: "Gastos", icon: <TrendingDown size={15} /> },
  { id: "abonos", label: "Abonos", icon: <TrendingUp size={15} /> },
  { id: "transferencias", label: "Transferencias", icon: <ArrowLeftRight size={15} /> },
]
const CATEGORIAS = [
  "Transporte",
  "Servicios",
  "Nómina",
  "Marketing",
  "Compras",
  "Impuestos",
  "Renta",
  "Otros",
] as const
const CAT_COLORS: Record<string, string> = {
  Transporte: "#06B6D4",
  Servicios: "#F59E0B",
  Nómina: "#8B5CF6",
  Marketing: "#EC4899",
  Compras: "#3B82F6",
  Impuestos: "#EF4444",
  Renta: "#F97316",
  Otros: "#6B7280",
}

function Glass({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-white/6 bg-white/3 backdrop-blur-sm", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function DonutChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (!total)
    return <p className="py-10 text-center text-sm text-white/30">Sin datos de categorías</p>
  let pct = 0
  const stops = data
    .map((d) => {
      const s = pct
      pct += (d.value / total) * 100
      return `${d.color} ${s}% ${pct}%`
    })
    .join(", ")
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div
        className="relative h-36 w-36 shrink-0 rounded-full"
        style={{ background: `conic-gradient(${stops})` }}
      >
        <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-[#0a0a14]">
          <span className="text-[10px] text-white/40">Total</span>
          <span className="text-sm font-bold text-white">{fmtMXN.format(total)}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {data.slice(0, 6).map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
            <span className="text-white/50">{d.name}</span>
            <span className="ml-auto pl-3 font-medium text-white/80">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ComparisonBarChart({
  data,
}: {
  data: { month: string; gastos: number; abonos: number }[]
}) {
  const max = Math.max(...data.flatMap((d) => [d.gastos, d.abonos]), 1)
  if (!data.length)
    return <p className="py-10 text-center text-sm text-white/30">Sin datos mensuales</p>
  return (
    <div className="space-y-3">
      <div className="flex h-36 items-end gap-3">
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-28 w-full items-end gap-[2px]">
              <motion.div
                className="flex-1 rounded-t-sm bg-red-500/60"
                initial={{ height: 0 }}
                animate={{ height: `${(d.gastos / max) * 100}%` }}
                transition={{ delay: i * 0.04, duration: 0.5 }}
              />
              <motion.div
                className="flex-1 rounded-t-sm bg-emerald-500/60"
                initial={{ height: 0 }}
                animate={{ height: `${(d.abonos / max) * 100}%` }}
                transition={{ delay: i * 0.04 + 0.08, duration: 0.5 }}
              />
            </div>
            <span className="text-[10px] text-white/30">{d.month}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-5 text-xs text-white/50">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-red-500/60" /> Gastos
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-emerald-500/60" /> Abonos
        </span>
      </div>
    </div>
  )
}

// CreateModal — ModalShell + GlassFormSystem
function CreateModal({
  type,
  onClose,
  onTypeChange,
  onCreated,
}: {
  type: TabId
  onClose: () => void
  onTypeChange: (t: TabId) => void
  onCreated?: () => void
}) {
  const labels: Record<TabId, string> = {
    gastos: "Gasto",
    abonos: "Abono",
    transferencias: "Transferencia",
  }
  const [form, setForm] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const set = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = useCallback(async () => {
    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      const endpoints: Record<TabId, string> = {
        gastos: "/api/gastos",
        abonos: "/api/abonos",
        transferencias: "/api/transferencias",
      }
      await fetch(endpoints[type], { method: "POST", body: fd })
      onCreated?.()
      onClose()
    } catch (e) {
      console.error("Error creando registro:", e)
    } finally {
      setSubmitting(false)
    }
  }, [form, type, onCreated, onClose])

  return (
    <ModalShell
      isOpen={true}
      title={`Crear ${labels[type]}`}
      onClose={onClose}
      description="Completa los datos del registro"
      size="md"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onTypeChange(t.id)
                setForm({})
              }}
              className={cn(
                "flex-1 rounded-lg border py-2 text-xs font-medium transition-all",
                type === t.id
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/5 text-white/40 hover:text-white/60"
              )}
            >
              {labels[t.id]}
            </button>
          ))}
        </div>
        {type === "gastos" && (
          <>
            <GlassInput
              label="Concepto"
              placeholder="Descripción del gasto"
              value={form.concepto ?? ""}
              onChange={(e) => set("concepto", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <GlassCurrencyInput
                label="Monto"
                value={Number(form.monto) || 0}
                onChange={(v) => set("monto", String(v))}
                currency="MXN"
                placeholder="0.00"
              />
              <GlassInput
                label="Banco"
                placeholder="Banco origen"
                value={form.banco ?? ""}
                onChange={(e) => set("banco", e.target.value)}
              />
            </div>
            <GlassSelect
              label="Categoría"
              value={form.categoria ?? ""}
              onChange={(val) => set("categoria", val)}
              options={[
                { value: "", label: "Seleccionar categoría" },
                ...CATEGORIAS.map((c) => ({ value: c, label: c })),
              ]}
            />
          </>
        )}
        {type === "abonos" && (
          <>
            <GlassInput
              label="Cliente"
              placeholder="Nombre del cliente"
              value={form.cliente ?? ""}
              onChange={(e) => set("cliente", e.target.value)}
            />
            <div className="grid grid-cols-2 gap-3">
              <GlassCurrencyInput
                label="Monto"
                value={Number(form.monto) || 0}
                onChange={(v) => set("monto", String(v))}
                currency="MXN"
                placeholder="0.00"
              />
              <GlassInput
                label="Banco Destino"
                placeholder="Banco destino"
                value={form.bancoDestino ?? ""}
                onChange={(e) => set("bancoDestino", e.target.value)}
              />
            </div>
          </>
        )}
        {type === "transferencias" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <GlassInput
                label="Banco Origen"
                placeholder="Banco origen"
                value={form.bancoOrigen ?? ""}
                onChange={(e) => set("bancoOrigen", e.target.value)}
              />
              <GlassInput
                label="Banco Destino"
                placeholder="Banco destino"
                value={form.bancoDestino ?? ""}
                onChange={(e) => set("bancoDestino", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <GlassCurrencyInput
                label="Monto"
                value={Number(form.monto) || 0}
                onChange={(v) => set("monto", String(v))}
                currency="MXN"
                placeholder="0.00"
              />
              <GlassInput
                label="Concepto"
                placeholder="Concepto"
                value={form.concepto ?? ""}
                onChange={(e) => set("concepto", e.target.value)}
              />
            </div>
          </>
        )}
        <div className="flex gap-3 pt-2">
          <LiquidGlassButton variant="glass" size="md" className="flex-1" onClick={onClose}>
            Cancelar
          </LiquidGlassButton>
          <LiquidGlassButton
            variant="accent"
            size="md"
            loading={submitting}
            icon={<Check size={16} />}
            iconPosition="left"
            className="flex-1"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Guardando..." : "Guardar"}
          </LiquidGlassButton>
        </div>
      </div>
    </ModalShell>
  )
}

// ─── Row renderers per tab ───
function GastoRow({ item }: { item: any }) {
  return (
    <>
      <td className="px-4 py-3 text-white/60">{fmtDate(item.fecha)}</td>
      <td className="px-4 py-3 font-medium text-white">{item.concepto || "—"}</td>
      <td className="px-4 py-3 font-semibold text-red-400">
        -{fmtMXN.format(Number(item.monto) || 0)}
      </td>
      <td className="px-4 py-3 text-white/60">{item.banco || item.bancoOrigen || "—"}</td>
      <td className="px-4 py-3">
        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/60">
          {item.categoria || "—"}
        </span>
      </td>
      <td className="px-4 py-3">
        <button className="text-white/30 hover:text-white">
          <BarChart3 size={14} />
        </button>
      </td>
    </>
  )
}
function AbonoRow({ item }: { item: any }) {
  return (
    <>
      <td className="px-4 py-3 text-white/60">{fmtDate(item.fecha)}</td>
      <td className="px-4 py-3 font-medium text-white">{item.cliente || "—"}</td>
      <td className="px-4 py-3 font-semibold text-emerald-400">
        +{fmtMXN.format(Number(item.monto) || 0)}
      </td>
      <td className="px-4 py-3 text-white/60">{item.bancoDestino || "—"}</td>
      <td className="px-4 py-3 text-xs text-violet-400/70">
        {item.ventaRef || item.ventaId || "—"}
      </td>
      <td className="px-4 py-3">
        <button className="text-white/30 hover:text-white">
          <BarChart3 size={14} />
        </button>
      </td>
    </>
  )
}
function TransfRow({ item }: { item: any }) {
  return (
    <>
      <td className="px-4 py-3 text-white/60">{fmtDate(item.fecha)}</td>
      <td className="px-4 py-3 text-white">{item.bancoOrigen || "—"}</td>
      <td className="px-4 py-3 text-white">{item.bancoDestino || "—"}</td>
      <td className="px-4 py-3 font-semibold text-violet-400">
        {fmtMXN.format(Number(item.monto) || 0)}
      </td>
      <td className="px-4 py-3 text-white/60">{item.concepto || "—"}</td>
      <td className="px-4 py-3">
        <button className="text-white/30 hover:text-white">
          <BarChart3 size={14} />
        </button>
      </td>
    </>
  )
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export function AuroraGastosYAbonosPanelUnified({
  onNavigate,
  className,
}: AuroraGastosYAbonosPanelUnifiedProps) {
  // Use movimientos data as the unified source for gastos, abonos, and transfers
  const { data: movData, loading: gLoading, refetch: refetchMovimientos } = useMovimientosData()
  const aLoading = gLoading
  const allMovimientos = useMemo(() => (movData as any)?.movimientos || [], [movData])
  const gastos = useMemo(
    () => allMovimientos.filter((m: any) => m.tipo === "gasto" || m.tipo === "egreso"),
    [allMovimientos]
  )
  const abonos = useMemo(
    () => allMovimientos.filter((m: any) => m.tipo === "abono" || m.tipo === "ingreso"),
    [allMovimientos]
  )

  const [activeTab, setActiveTab] = useState<TabId>("gastos")
  const [search, setSearch] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [catFilter, setCatFilter] = useState("")
  const [bankFilter, setBankFilter] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<TabId>("gastos")
  const loading = gLoading || aLoading

  const transferencias = useMemo(
    () => (gastos as any[]).filter((g: any) => g.tipo === "transferencia" && g.bancoDestino),
    [gastos]
  )

  const activeData = useMemo(() => {
    const src = activeTab === "gastos" ? gastos : activeTab === "abonos" ? abonos : transferencias
    return (Array.isArray(src) ? src : []).filter((item: any) => {
      if (search && !JSON.stringify(item).toLowerCase().includes(search.toLowerCase())) return false
      if (dateFrom && item.fecha < dateFrom) return false
      if (dateTo && item.fecha > dateTo) return false
      if (catFilter && item.categoria !== catFilter) return false
      if (bankFilter && item.banco !== bankFilter && item.bancoOrigen !== bankFilter) return false
      return true
    })
  }, [activeTab, gastos, abonos, transferencias, search, dateFrom, dateTo, catFilter, bankFilter])

  const stats = useMemo(() => {
    const arr = activeData as any[]
    const total = arr.reduce((s: number, i: any) => s + (Number(i.monto) || 0), 0)
    const now = new Date()
    const mStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
    const mTotal = arr
      .filter((i: any) => i.fecha >= mStart)
      .reduce((s: number, i: any) => s + (Number(i.monto) || 0), 0)
    const freq = (key: string) => {
      const m = new Map<string, number>()
      arr.forEach(
        (i: any) => i[key] && m.set(i[key], (m.get(i[key]) || 0) + (Number(i.monto) || 0))
      )
      return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
    }
    const freqN = (key: string) => {
      const m = new Map<string, number>()
      arr.forEach((i: any) => i[key] && m.set(i[key], (m.get(i[key]) || 0) + 1))
      return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "—"
    }
    if (activeTab === "gastos")
      return [
        {
          label: "Total Gastos",
          value: fmtMXN.format(total),
          icon: <Receipt size={18} />,
          color: "#EF4444",
        },
        {
          label: "Gastos del Mes",
          value: fmtMXN.format(mTotal),
          icon: <Calendar size={18} />,
          color: "#F59E0B",
        },
        {
          label: "Categoría Principal",
          value: freq("categoria"),
          icon: <PieChart size={18} />,
          color: "#8B5CF6",
        },
        {
          label: "Banco con más gastos",
          value: freq("banco"),
          icon: <Landmark size={18} />,
          color: "#3B82F6",
        },
      ]
    if (activeTab === "abonos")
      return [
        {
          label: "Total Abonos",
          value: fmtMXN.format(total),
          icon: <DollarSign size={18} />,
          color: "#10B981",
        },
        {
          label: "Abonos del Mes",
          value: fmtMXN.format(mTotal),
          icon: <Calendar size={18} />,
          color: "#06B6D4",
        },
        {
          label: "Cliente Principal",
          value: freq("cliente"),
          icon: <Wallet size={18} />,
          color: "#8B5CF6",
        },
        {
          label: "Banco destino principal",
          value: freqN("bancoDestino"),
          icon: <Landmark size={18} />,
          color: "#3B82F6",
        },
      ]
    return [
      {
        label: "Total Transferencias",
        value: fmtMXN.format(total),
        icon: <ArrowLeftRight size={18} />,
        color: "#8B5CF6",
      },
      {
        label: "Monto del Mes",
        value: fmtMXN.format(mTotal),
        icon: <Calendar size={18} />,
        color: "#06B6D4",
      },
      {
        label: "Banco origen frecuente",
        value: freqN("bancoOrigen"),
        icon: <CreditCard size={18} />,
        color: "#F59E0B",
      },
      {
        label: "Banco destino frecuente",
        value: freqN("bancoDestino"),
        icon: <Landmark size={18} />,
        color: "#10B981",
      },
    ]
  }, [activeTab, activeData])

  const donutData = useMemo(() => {
    const m = new Map<string, number>()
    ;(Array.isArray(gastos) ? gastos : []).forEach((g: any) => {
      const c = g.categoria || "Otros"
      m.set(c, (m.get(c) || 0) + (Number(g.monto) || 0))
    })
    return [...m.entries()].map(([name, value]) => ({
      name,
      value,
      color: CAT_COLORS[name] || "#6B7280",
    }))
  }, [gastos])

  const barData = useMemo(() => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"]
    const ga = Array.isArray(gastos) ? gastos : [],
      ab = Array.isArray(abonos) ? abonos : []
    return months.map((month, idx) => {
      const mm = String(idx + 1).padStart(2, "0")
      return {
        month,
        gastos: ga
          .filter((g: any) => g.fecha?.includes?.(`-${mm}-`))
          .reduce((s: number, g: any) => s + (Number(g.monto) || 0), 0),
        abonos: ab
          .filter((a: any) => a.fecha?.includes?.(`-${mm}-`))
          .reduce((s: number, a: any) => s + (Number(a.monto) || 0), 0),
      }
    })
  }, [gastos, abonos])

  const columns =
    activeTab === "gastos"
      ? ["Fecha", "Concepto", "Monto", "Banco", "Categoría", "Acciones"]
      : activeTab === "abonos"
        ? ["Fecha", "Cliente", "Monto", "Banco Destino", "Venta Ref", "Acciones"]
        : ["Fecha", "Banco Origen", "Banco Destino", "Monto", "Concepto", "Acciones"]
  const hasFilters = !!(search || dateFrom || dateTo || catFilter || bankFilter)
  const clearFilters = () => {
    setSearch("")
    setDateFrom("")
    setDateTo("")
    setCatFilter("")
    setBankFilter("")
  }
  const RowComponent =
    activeTab === "gastos" ? GastoRow : activeTab === "abonos" ? AbonoRow : TransfRow

  return (
    <div className={cn("relative min-h-screen bg-[#030308] text-white", className)}>
      <div className="mx-auto max-w-[1800px] space-y-6 p-6">
        {/* 1. HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-pink-500/20 bg-linear-to-br from-pink-500/20 to-violet-500/20 shadow-lg shadow-pink-500/10">
                <Wallet size={20} className="text-pink-400" />
              </div>
              <span className="bg-linear-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
                Gastos y Abonos
              </span>
            </h1>
            <p className="mt-1 pl-[52px] text-sm text-white/40">Control de egresos e ingresos</p>
          </div>
          <div className="flex items-center gap-2">
            <LiquidGlassButton
              variant="accent"
              icon={<Plus size={16} />}
              onClick={() => {
                setModalType(activeTab)
                setShowModal(true)
              }}
            >
              Crear
            </LiquidGlassButton>
            <button
              onClick={() => onNavigate?.("/gastos")}
              className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/60 hover:bg-white/10 hover:text-white"
              aria-label="Actualizar"
            >
              <RefreshCw size={16} className={cn(loading && "animate-spin")} />
            </button>
          </div>
        </motion.header>

        {/* 2. TAB BAR */}
        <Glass className="p-1.5">
          <div className="relative flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative z-10 flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                  activeTab === tab.id ? "text-white" : "text-white/50 hover:text-white/70"
                )}
              >
                {tab.icon} {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="gya-tab-indicator"
                    className="absolute inset-0 rounded-lg border border-white/10 bg-white/10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </Glass>

        {/* 3. STATS BAR — PremiumKPICard */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={`${activeTab}-${i}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <PremiumKPICard
                title={stat.label}
                value={stat.value}
                icon={stat.icon}
                color="violet"
              />
            </motion.div>
          ))}
        </div>

        {/* 6. FILTERS (Liquid Glass) */}
        <Glass className="flex flex-wrap items-center gap-3 p-3">
          <div className="min-w-[200px] flex-1">
            <LiquidGlassSearchField
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-white/30" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:outline-none"
            />
            <span className="text-white/20">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:outline-none"
            />
          </div>
          {activeTab === "gastos" && (
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white focus:outline-none"
            >
              <option value="">Categoría</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
          <input
            value={bankFilter}
            onChange={(e) => setBankFilter(e.target.value)}
            placeholder="Banco..."
            className="w-28 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none"
          />
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-white/40 hover:text-white"
              aria-label="Limpiar filtros"
            >
              <X size={14} />
            </button>
          )}
        </Glass>

        {/* 4. TABLE — PremiumTableWrapper */}
        <PremiumTableWrapper
          title={
            activeTab === "gastos" ? "Gastos" : activeTab === "abonos" ? "Abonos" : "Transferencias"
          }
          subtitle={`${activeData.length} registros`}
          maxHeight="360px"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/6">
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left text-xs font-medium tracking-wider text-white/40 uppercase"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {activeData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-14 text-center text-white/30">
                        <AlertTriangle size={32} className="mx-auto mb-2 opacity-40" />
                        <p>No hay {activeTab} registrados</p>
                      </td>
                    </tr>
                  ) : (
                    activeData.slice(0, 25).map((item: any, idx: number) => (
                      <motion.tr
                        key={item.id || idx}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b border-white/3 transition-colors hover:bg-white/4"
                      >
                        <RowComponent item={item} />
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </PremiumTableWrapper>

        {/* 5. CHARTS — PremiumChartWrapper */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <PremiumChartWrapper
            title="Gastos por Categoría"
            subtitle="Distribución"
            glowColor="violet"
            className="p-5"
          >
            <DonutChart data={donutData} />
          </PremiumChartWrapper>
          <PremiumChartWrapper
            title="Comparativa Mensual"
            subtitle="Gastos vs Abonos"
            glowColor="emerald"
            className="p-5"
          >
            <ComparisonBarChart data={barData} />
          </PremiumChartWrapper>
        </div>
      </div>

      {/* 7. CREATE MODAL — ModalShell + GlassFormSystem */}
      {showModal && (
        <CreateModal
          type={modalType}
          onClose={() => setShowModal(false)}
          onTypeChange={setModalType}
          onCreated={() => refetchMovimientos()}
        />
      )}
    </div>
  )
}

export default AuroraGastosYAbonosPanelUnified
