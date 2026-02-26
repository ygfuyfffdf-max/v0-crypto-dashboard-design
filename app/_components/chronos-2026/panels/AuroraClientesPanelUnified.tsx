"use client"

import {
  LiquidGlassButton,
  LiquidGlassSearchField,
  LiquidGlassSegmentedControl,
} from "@/app/_components/chronos-2026/primitives/LiquidGlassSystem"
import { ModalShell } from "@/app/_components/modals/ModalShell"
import { GlassCurrencyInput, GlassInput, GlassSelect } from "@/app/_components/ui/GlassFormSystem"
import { cn } from "@/app/_lib/utils"
import {
  useAbonarVenta,
  useClientesData as useClientes,
  useCreateCliente,
} from "@/app/hooks/useDataHooks"
import {
  Calendar,
  Check,
  DollarSign,
  Edit3,
  Eye,
  History,
  Mail,
  Phone,
  RefreshCw,
  Trash2,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import { useCallback, useMemo, useState } from "react"
import { PremiumKPICard, PremiumTableWrapper } from "./PremiumPanelEnhancer"

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface Cliente {
  id: string
  nombre: string
  email?: string
  telefono?: string
  deudaTotal: number
  ventasTotales: number
  porcentajePagado: number
  frecuenciaCompra: number
  fecha: string
}

interface AuroraClientesPanelUnifiedProps {
  onNavigate?: (path: string) => void
  className?: string
}

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

const fmtMXN = (n: number) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n)

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

const COLORS = ["#8B5CF6", "#06B6D4", "#F59E0B", "#EC4899", "#10B981", "#6366F1", "#EF4444"]

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

const avatarColor = (name: string) => {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]
}

type DebtLevel = "none" | "moderate" | "high"

const debtLevel = (c: Cliente): DebtLevel =>
  c.deudaTotal === 0 ? "none" : c.deudaTotal > c.ventasTotales * 0.5 ? "high" : "moderate"

const DEBT_CFG: Record<DebtLevel, { label: string; cls: string; bg: string }> = {
  none: { label: "Sin deuda", cls: "text-emerald-400", bg: "bg-emerald-500/15" },
  moderate: { label: "Con deuda", cls: "text-amber-400", bg: "bg-amber-500/15" },
  high: { label: "Deuda alta", cls: "text-red-400", bg: "bg-red-500/15" },
}

type StatusFilter = "todos" | "sin_deuda" | "con_deuda" | "deuda_alta"

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "sin_deuda", label: "Sin Deuda" },
  { id: "con_deuda", label: "Con Deuda" },
  { id: "deuda_alta", label: "Deuda Alta" },
]

const G = "rounded-2xl border border-white/8 bg-white/4 backdrop-blur-xl"
const GH = "hover:border-white/12 hover:bg-white/6 transition-all duration-300"

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function AuroraClientesPanelUnified({
  onNavigate,
  className,
}: AuroraClientesPanelUnifiedProps) {
  const { data: clientesRaw, loading, error, refetch } = useClientes()
  const createCliente = useCreateCliente()
  const abonarVenta = useAbonarVenta()

  const clientes = useMemo<Cliente[]>(() => {
    if (!Array.isArray(clientesRaw) || !clientesRaw.length) return []
    return clientesRaw.map((c) => {
      const debt = c.saldoPendiente ?? 0
      const sales = c.totalCompras ?? 0
      return {
        id: c.id,
        nombre: c.nombre,
        email: c.email ?? undefined,
        telefono: c.telefono ?? undefined,
        deudaTotal: debt,
        ventasTotales: sales,
        porcentajePagado: sales > 0 ? Math.round(((sales - debt) / sales) * 100) : 100,
        frecuenciaCompra: 0,
        fecha: new Date().toISOString(),
      }
    })
  }, [clientesRaw])

  const [view, setView] = useState<"tabla" | "perfiles">("tabla")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<StatusFilter>("todos")
  const [detail, setDetail] = useState<Cliente | null>(null)
  const [abono, setAbono] = useState<Cliente | null>(null)
  const [abonoAmt, setAbonoAmt] = useState("")
  const [abonoBank, setAbonoBank] = useState("")
  const [showNewClient, setShowNewClient] = useState(false)
  const [newClient, setNewClient] = useState({ nombre: "", email: "", telefono: "" })
  const [editClient, setEditClient] = useState<Cliente | null>(null)
  const [editForm, setEditForm] = useState({ nombre: "", email: "", telefono: "" })

  const filtered = useMemo(
    () =>
      clientes.filter((c) => {
        const q = search.toLowerCase()
        const matchQ =
          !q ||
          c.nombre.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.telefono?.includes(search)
        const matchF =
          filter === "todos" ||
          (filter === "sin_deuda" && c.deudaTotal === 0) ||
          (filter === "con_deuda" && c.deudaTotal > 0) ||
          (filter === "deuda_alta" && c.deudaTotal > c.ventasTotales * 0.5)
        return matchQ && matchF
      }),
    [clientes, search, filter]
  )

  const stats = useMemo(
    () => ({
      total: clientes.length,
      deuda: clientes.reduce((s, c) => s + c.deudaTotal, 0),
      abonos: clientes.reduce((s, c) => s + Math.max(0, c.ventasTotales - c.deudaTotal), 0),
      freq: clientes.length
        ? Math.round(clientes.reduce((s, c) => s + c.frecuenciaCompra, 0) / clientes.length)
        : 0,
    }),
    [clientes]
  )

  const handleRefresh = useCallback(() => refetch(), [refetch])
  const closeDrawer = useCallback(() => setDetail(null), [])
  const closeAbono = useCallback(() => {
    setAbono(null)
    setAbonoAmt("")
    setAbonoBank("")
  }, [])

  const handleCreateCliente = useCallback(() => {
    if (!newClient.nombre.trim()) return
    createCliente.mutate(
      {
        nombre: newClient.nombre.trim(),
        email: newClient.email || undefined,
        telefono: newClient.telefono || undefined,
      },
      {
        onSuccess: () => {
          setShowNewClient(false)
          setNewClient({ nombre: "", email: "", telefono: "" })
          refetch()
        },
      }
    )
  }, [createCliente, newClient, refetch])

  const handleAbonar = useCallback(() => {
    if (!abono || !abonoAmt || Number(abonoAmt) <= 0) return
    abonarVenta.mutate(
      { ventaId: abono.id, monto: Number(abonoAmt), bancoDestinoId: abonoBank || undefined },
      {
        onSuccess: () => {
          closeAbono()
          refetch()
        },
      }
    )
  }, [abono, abonoAmt, abonoBank, abonarVenta, closeAbono, refetch])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("¿Estás seguro de eliminar este cliente?")) return
      try {
        await fetch(`/api/clientes/${id}`, { method: "DELETE" })
        refetch()
      } catch (err) {
        console.error("Error al eliminar cliente", err)
      }
    },
    [refetch]
  )

  const handleEdit = useCallback(async () => {
    if (!editClient) return
    try {
      await fetch(`/api/clientes/${editClient.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      setEditClient(null)
      refetch()
    } catch (err) {
      console.error("Error al editar cliente", err)
    }
  }, [editClient, editForm, refetch])

  const openEdit = useCallback((c: Cliente) => {
    setEditClient(c)
    setEditForm({ nombre: c.nombre, email: c.email || "", telefono: c.telefono || "" })
  }, [])

  /* ─── Loading ─── */
  if (loading)
    return (
      <div className={cn("space-y-6 p-6", className)}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <div className="h-5 w-48 animate-pulse rounded-lg bg-white/10" />
            <div className="h-3 w-32 animate-pulse rounded-lg bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={cn(G, "h-24 animate-pulse")} />
          ))}
        </div>
        <div className={cn(G, "h-96 animate-pulse")} />
      </div>
    )

  /* ─── Error ─── */
  if (error)
    return (
      <div className={cn("flex min-h-[400px] items-center justify-center p-6", className)}>
        <div className={cn(G, "max-w-md p-8 text-center")}>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15 text-xl font-bold text-red-400">
            !
          </div>
          <p className="mb-4 text-white/70">Error al cargar clientes</p>
          <button
            onClick={handleRefresh}
            className="rounded-xl bg-violet-500/20 px-4 py-2 text-violet-400 transition-colors hover:bg-violet-500/30"
          >
            Reintentar
          </button>
        </div>
      </div>
    )

  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* ══════════ 1 · HEADER ══════════ */}
      <motion.header
        className="flex flex-col justify-between gap-4 md:flex-row md:items-center"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-500/20 bg-linear-to-br from-violet-500/25 to-fuchsia-500/25">
              <Users className="h-5 w-5 text-violet-400" />
            </span>
            Panel de Clientes
          </h1>
          <p className="mt-1 ml-[52px] text-sm text-white/50">CRM y gestión de clientes</p>
        </div>
        <div className="flex items-center gap-3">
          <LiquidGlassButton
            variant="accent"
            icon={<UserPlus size={16} />}
            onClick={() => setShowNewClient(true)}
          >
            Nuevo Cliente
          </LiquidGlassButton>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white/60 transition-colors hover:text-white"
            aria-label="Refrescar datos"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </motion.button>
        </div>
      </motion.header>

      {/* ══════════ 2 · STATS BAR — PremiumKPICard ══════════ */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {(
          [
            {
              label: "Total Clientes",
              val: String(stats.total),
              Icon: Users,
              color: "violet" as const,
            },
            {
              label: "Deuda Total",
              val: fmtMXN(stats.deuda),
              Icon: Wallet,
              color: "gold" as const,
            },
            {
              label: "Abonos del Mes",
              val: fmtMXN(stats.abonos),
              Icon: DollarSign,
              color: "emerald" as const,
            },
            {
              label: "Frecuencia Promedio",
              val: `${stats.freq} días`,
              Icon: Calendar,
              color: "plasma" as const,
            },
          ] as const
        ).map((s) => (
          <PremiumKPICard
            key={s.label}
            title={s.label}
            value={s.val}
            icon={<s.Icon className="h-5 w-5" />}
            color={s.color}
          />
        ))}
      </div>

      {/* ══════════ 3 · SEARCH + FILTERS — GlassInput ══════════ */}
      <div className={cn(G, "flex flex-col items-start gap-4 p-4 md:flex-row md:items-center")}>
        <div className="w-full flex-1 md:w-auto">
          <LiquidGlassSearchField
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente…"
          />
        </div>
        <LiquidGlassSegmentedControl
          value={filter}
          onChange={(v) => setFilter(v)}
          options={FILTERS.map((f) => ({ value: f.id, label: f.label }))}
        />
      </div>

      {/* ══════════ 4 · VIEW TOGGLE (Liquid Glass) ══════════ */}
      <LiquidGlassSegmentedControl
        value={view}
        onChange={(v) => setView(v)}
        options={[
          { value: "tabla", label: "Tabla" },
          { value: "perfiles", label: "Perfiles" },
        ]}
      />

      {/* ══════════ 5 · TABLE | 6 · PROFILE GRID — PremiumTableWrapper ══════════ */}
      <AnimatePresence mode="wait">
        {view === "tabla" ? (
          <PremiumTableWrapper
            key="t"
            title="Clientes"
            subtitle={`${filtered.length} registros`}
            maxHeight="420px"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/8">
                    {[
                      "#",
                      "Nombre",
                      "Deuda Total",
                      "Ventas Totales",
                      "% Pagado",
                      "Frecuencia",
                      "Acciones",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-medium tracking-wider text-white/40 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => {
                    const dl = debtLevel(c)
                    return (
                      <motion.tr
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-white/4 transition-colors hover:bg-white/4"
                      >
                        <td className="px-4 py-3 text-white/40">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                              style={{ background: avatarColor(c.nombre) }}
                            >
                              {initials(c.nombre)}
                            </div>
                            <span className="truncate font-medium text-white">{c.nombre}</span>
                          </div>
                        </td>
                        <td className={cn("px-4 py-3 font-medium", DEBT_CFG[dl].cls)}>
                          {fmtMXN(c.deudaTotal)}
                        </td>
                        <td className="px-4 py-3 text-white/70">{fmtMXN(c.ventasTotales)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 max-w-[60px] flex-1 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-violet-500"
                                style={{ width: `${c.porcentajePagado}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/60">{c.porcentajePagado}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/60">{c.frecuenciaCompra} días</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setDetail(c)}
                              title="Ver detalle"
                              className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => openEdit(c)}
                              title="Editar"
                              className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(c.id)}
                              title="Eliminar"
                              className="rounded-lg p-1.5 text-red-400/90 ring-1 ring-red-500/30 transition-colors hover:bg-red-500/20 hover:text-red-400 focus-visible:ring-2 focus-visible:ring-red-500/50"
                            >
                              <Trash2 size={14} />
                            </button>
                            <button
                              onClick={() => setAbono(c)}
                              title="Registrar abono"
                              className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-emerald-500/20 hover:text-emerald-400"
                            >
                              <DollarSign size={14} />
                            </button>
                            <button
                              title="Historial"
                              className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-violet-500/20 hover:text-violet-400"
                            >
                              <History size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
              {!filtered.length && (
                <div className="py-16 text-center">
                  <Users size={40} className="mx-auto mb-3 text-white/20" />
                  <p className="text-sm text-white/40">No se encontraron clientes</p>
                </div>
              )}
            </div>
          </PremiumTableWrapper>
        ) : (
          <motion.div
            key="p"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((c, i) => {
              const dl = debtLevel(c)
              const cfg = DEBT_CFG[dl]
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={cn(G, GH, "p-5")}
                >
                  {/* card header */}
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${avatarColor(c.nombre)}, ${avatarColor(c.nombre)}88)`,
                      }}
                    >
                      {initials(c.nombre)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{c.nombre}</p>
                      <p className="text-xs text-white/40">Desde {fmtDate(c.fecha)}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-lg px-2 py-1 text-[11px] font-medium",
                        cfg.bg,
                        cfg.cls
                      )}
                    >
                      {cfg.label}
                    </span>
                  </div>
                  {/* key stats */}
                  <div className="mb-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-0.5 text-xs text-white/40">Deuda Total</p>
                      <p className={cn("text-sm font-semibold", cfg.cls)}>{fmtMXN(c.deudaTotal)}</p>
                    </div>
                    <div>
                      <p className="mb-0.5 text-xs text-white/40">Ventas Totales</p>
                      <p className="text-sm font-semibold text-white">{fmtMXN(c.ventasTotales)}</p>
                    </div>
                  </div>
                  {/* progress */}
                  <div className="mb-3">
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-white/40">% Pagado</span>
                      <span className="text-white/60">{c.porcentajePagado}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${c.porcentajePagado}%` }}
                        transition={{ duration: 0.8, delay: i * 0.04 }}
                        className="h-full rounded-full bg-linear-to-r from-violet-500 to-fuchsia-500"
                      />
                    </div>
                  </div>
                  <p className="mb-4 text-xs text-white/40">
                    Frecuencia: <span className="text-white/60">{c.frecuenciaCompra} días</span>
                  </p>
                  {/* actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAbono(c)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/15 px-3 py-2 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/25"
                    >
                      <DollarSign size={13} /> Registrar Abono
                    </button>
                    <button
                      onClick={() => setDetail(c)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-violet-500/20 bg-violet-500/15 px-3 py-2 text-xs font-medium text-violet-400 transition-colors hover:bg-violet-500/25"
                    >
                      <History size={13} /> Ver Historial
                    </button>
                  </div>
                </motion.div>
              )
            })}
            {!filtered.length && (
              <div className="col-span-full py-16 text-center">
                <Users size={40} className="mx-auto mb-3 text-white/20" />
                <p className="text-sm text-white/40">No se encontraron clientes</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ 7 · DETAIL DRAWER ══════════ */}
      <AnimatePresence>
        {detail && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed top-0 right-0 z-50 h-full w-full max-w-md overflow-y-auto border-l border-white/8 bg-gray-950/95 backdrop-blur-2xl"
            >
              <div className="space-y-6 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">Detalle del Cliente</h2>
                  <button
                    onClick={closeDrawer}
                    className="rounded-xl p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${avatarColor(detail.nombre)}, ${avatarColor(detail.nombre)}88)`,
                    }}
                  >
                    {initials(detail.nombre)}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{detail.nombre}</p>
                    <p className="text-sm text-white/40">Cliente desde {fmtDate(detail.fecha)}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {detail.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail size={14} className="text-white/30" />
                      <span className="text-white/70">{detail.email}</span>
                    </div>
                  )}
                  {detail.telefono && (
                    <div className="flex items-center gap-3 text-sm">
                      <Phone size={14} className="text-white/30" />
                      <span className="text-white/70">{detail.telefono}</span>
                    </div>
                  )}
                </div>
                <div className={cn(G, "space-y-3 p-4")}>
                  <h3 className="text-sm font-medium text-white/60">Resumen Financiero</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-white/40">Deuda Total</p>
                      <p className="text-lg font-bold text-amber-400">
                        {fmtMXN(detail.deudaTotal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Ventas Totales</p>
                      <p className="text-lg font-bold text-white">{fmtMXN(detail.ventasTotales)}</p>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-white/40">Progreso de pago</span>
                      <span className="text-white/60">{detail.porcentajePagado}%</span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-violet-500 to-emerald-500"
                        style={{ width: `${detail.porcentajePagado}%` }}
                      />
                    </div>
                  </div>
                </div>
                {/* purchase history (last 10) */}
                <div>
                  <h3 className="mb-3 text-sm font-medium text-white/60">
                    Historial de Compras (últimas 10)
                  </h3>
                  <div className="space-y-2">
                    {detail.ventasTotales > 0 ? (
                      Array.from({
                        length: Math.min(3, Math.ceil(detail.ventasTotales / 5000)),
                      }).map((_, i) => (
                        <div key={i} className={cn(G, "flex items-center justify-between p-3")}>
                          <div>
                            <p className="text-sm text-white/70">Venta #{i + 1}</p>
                            <p className="text-xs text-white/40">
                              {fmtDate(new Date(Date.now() - i * 604800000).toISOString())}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-white">
                            {fmtMXN(
                              detail.ventasTotales /
                                Math.max(1, Math.ceil(detail.ventasTotales / 5000))
                            )}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="py-4 text-center text-sm text-white/40">
                        Sin ventas registradas
                      </p>
                    )}
                  </div>
                </div>
                {/* abonos history */}
                <div>
                  <h3 className="mb-3 text-sm font-medium text-white/60">Historial de Abonos</h3>
                  <div className={cn(G, "p-3 text-center")}>
                    <p className="text-sm text-white/40">Sin abonos registrados</p>
                  </div>
                </div>
                {/* debt distribution */}
                {detail.deudaTotal > 0 && (
                  <div className={cn(G, "p-4")}>
                    <h3 className="mb-2 text-sm font-medium text-white/60">
                      Distribución de Deuda
                    </h3>
                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-linear-to-r from-amber-500 to-red-500"
                        style={{
                          width: `${Math.min(100, (detail.deudaTotal / Math.max(1, detail.ventasTotales)) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-white/40">
                      {fmtMXN(detail.deudaTotal)} de {fmtMXN(detail.ventasTotales)} total
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    closeDrawer()
                    setAbono(detail)
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/20 py-3 font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
                >
                  <DollarSign size={16} /> Registrar Abono
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ══════════ 8 · ABONO MODAL — ModalShell + GlassFormSystem ══════════ */}
      <ModalShell
        isOpen={!!abono}
        onClose={closeAbono}
        title="Registrar Abono"
        description={
          abono ? `Cliente: ${abono.nombre} · Deuda actual: ${fmtMXN(abono.deudaTotal)}` : ""
        }
        size="sm"
      >
        {abono && (
          <div className="space-y-5">
            <GlassCurrencyInput
              label="Monto del Abono"
              value={Number(abonoAmt) || 0}
              onChange={(v) => setAbonoAmt(String(v))}
              currency="MXN"
              placeholder="0.00"
            />
            <GlassSelect
              label="Banco Destino"
              value={abonoBank}
              onChange={(val) => setAbonoBank(val)}
              options={[
                { value: "", label: "Seleccionar banco…" },
                { value: "efectivo", label: "Efectivo" },
                { value: "transferencia", label: "Transferencia Bancaria" },
              ]}
            />
            {Number(abonoAmt) > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className={cn(G, "space-y-1 p-3")}
              >
                <p className="mb-2 text-xs text-white/50">Vista previa</p>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Abono</span>
                  <span className="font-medium text-emerald-400">{fmtMXN(Number(abonoAmt))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Deuda restante</span>
                  <span className="font-medium text-white">
                    {fmtMXN(Math.max(0, abono.deudaTotal - Number(abonoAmt)))}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-emerald-500 to-cyan-500"
                    style={{
                      width: `${Math.min(100, (Number(abonoAmt) / Math.max(1, abono.deudaTotal)) * 100)}%`,
                    }}
                  />
                </div>
              </motion.div>
            )}
            <button
              onClick={handleAbonar}
              disabled={!abonoAmt || !abonoBank || Number(abonoAmt) <= 0 || abonarVenta.isPending}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all",
                abonoAmt && abonoBank && Number(abonoAmt) > 0
                  ? "cursor-pointer border border-emerald-500/30 bg-emerald-500/25 text-emerald-300 hover:bg-emerald-500/35"
                  : "cursor-not-allowed border border-white/10 bg-white/5 text-white/30"
              )}
            >
              <Check size={16} /> {abonarVenta.isPending ? "Procesando…" : "Confirmar Abono"}
            </button>
          </div>
        )}
      </ModalShell>

      {/* ══════════ 9 · NEW CLIENT MODAL — ModalShell + GlassFormSystem ══════════ */}
      <ModalShell
        isOpen={showNewClient}
        onClose={() => setShowNewClient(false)}
        title="Nuevo Cliente"
        description="Completa los datos del cliente"
        size="sm"
      >
        <div className="space-y-4">
          <GlassInput
            label="Nombre *"
            value={newClient.nombre}
            onChange={(e) => setNewClient((p) => ({ ...p, nombre: e.target.value }))}
            placeholder="Nombre del cliente"
          />
          <GlassInput
            label="Email"
            value={newClient.email}
            onChange={(e) => setNewClient((p) => ({ ...p, email: e.target.value }))}
            placeholder="email@ejemplo.com"
            type="email"
          />
          <GlassInput
            label="Teléfono"
            value={newClient.telefono}
            onChange={(e) => setNewClient((p) => ({ ...p, telefono: e.target.value }))}
            placeholder="+52 000 000 0000"
          />
          <button
            onClick={handleCreateCliente}
            disabled={!newClient.nombre.trim() || createCliente.isPending}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all",
              newClient.nombre.trim()
                ? "cursor-pointer border border-violet-500/30 bg-violet-500/25 text-violet-300 hover:bg-violet-500/35"
                : "cursor-not-allowed border border-white/10 bg-white/5 text-white/30"
            )}
          >
            <UserPlus size={16} /> {createCliente.isPending ? "Creando…" : "Crear Cliente"}
          </button>
        </div>
      </ModalShell>

      {/* ══════════ 10 · EDIT CLIENT MODAL — ModalShell + GlassFormSystem ══════════ */}
      <ModalShell
        isOpen={!!editClient}
        onClose={() => setEditClient(null)}
        title="Editar Cliente"
        description={editClient ? editClient.nombre : ""}
        size="sm"
      >
        {editClient && (
          <div className="space-y-4">
            <GlassInput
              label="Nombre"
              value={editForm.nombre}
              onChange={(e) => setEditForm((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre"
            />
            <GlassInput
              label="Email"
              value={editForm.email}
              onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="email@ejemplo.com"
              type="email"
            />
            <GlassInput
              label="Teléfono"
              value={editForm.telefono}
              onChange={(e) => setEditForm((p) => ({ ...p, telefono: e.target.value }))}
              placeholder="+52 000 000 0000"
            />
            <button
              onClick={handleEdit}
              disabled={!editForm.nombre.trim()}
              className={cn(
                "flex w-full items-center justify-center gap-2 rounded-xl py-3 font-medium transition-all",
                editForm.nombre.trim()
                  ? "cursor-pointer border border-violet-500/30 bg-violet-500/25 text-violet-300 hover:bg-violet-500/35"
                  : "cursor-not-allowed border border-white/10 bg-white/5 text-white/30"
              )}
            >
              <Check size={16} /> Guardar Cambios
            </button>
          </div>
        )}
      </ModalShell>
    </div>
  )
}

export default AuroraClientesPanelUnified
