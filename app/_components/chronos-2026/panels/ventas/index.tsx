"use client"

import { ModalShell } from "@/app/_components/modals/ModalShell"
import { GlassCurrencyInput, GlassInput, GlassSelect } from "@/app/_components/ui/GlassFormSystem"
import { cn } from "@/app/_lib/utils"
import {
  useAbonarVenta,
  useCreateVenta,
  useVentasData as useVentas,
} from "@/app/hooks/useDataHooks"
import {
  AlertTriangle,
  Banknote,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  DollarSign,
  Download,
  Edit3,
  Eye,
  Filter,
  Plus,
  Receipt,
  RefreshCw,
  ShoppingCart,
  Trash2,
  TrendingUp,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import React, { useCallback, useMemo, useState } from "react"
import { PremiumKPICard, PremiumTableWrapper } from "../PremiumPanelEnhancer"

// ── Types & Constants ───────────────────────────────────────────────────────
interface VentaRow {
  id: string
  cliente: string
  producto: string
  cantidad: number
  precioTotal: number
  abonado: number
  estado: string
  fecha: string
  origenLotes?: Array<{ ocId: string; cantidad: number; costoUnidad: number }> | null
}

const fmtMXN = (n: number) => n.toLocaleString("es-MX", { style: "currency", currency: "MXN" })
const fmtDate = (d: string) => {
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return d
  }
}
const PER_PAGE = 10
const STEPS = ["Cliente", "Productos", "Pago", "Confirmar"] as const
const BADGE: Record<string, { cls: string; label: string }> = {
  pagada: { cls: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Pagada" },
  parcial: { cls: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Parcial" },
  pendiente: { cls: "bg-red-500/20 text-red-400 border-red-500/30", label: "Pendiente" },
}
const G = "rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl"

// ════════════════════════════════════════════════════════════════════════════
export default function AuroraVentasPanelUnified({ className }: { className?: string }) {
  const { data: rawVentas, loading, error, refetch } = useVentas()
  const createVenta = useCreateVenta()
  const abonarVenta = useAbonarVenta()

  const ventas = useMemo<VentaRow[]>(() => {
    if (!rawVentas?.length) return []
    return rawVentas.map((v) => {
      const r = v as unknown as Record<string, unknown>
      const f = r.fecha
      return {
        id: String(r.id ?? ""),
        cliente: String(r.cliente ?? r.clienteId ?? ""),
        producto: String(r.producto ?? r.productoNombre ?? "Producto"),
        cantidad: Number(r.cantidad ?? 0),
        precioTotal: Number(r.precioTotal ?? r.precioTotalVenta ?? 0),
        abonado: Number(r.abonado ?? r.montoPagado ?? 0),
        estado: String(r.estado ?? r.estadoPago ?? "pendiente").toLowerCase(),
        fecha:
          f instanceof Date
            ? (f.toISOString().split("T")[0] ?? "")
            : typeof f === "string"
              ? f
              : "",
        origenLotes: Array.isArray(r.origenLotes)
          ? (r.origenLotes as VentaRow["origenLotes"])
          : null,
      }
    })
  }, [rawVentas])

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    cliente: "",
    producto: "",
    cantidad: 1,
    precioUnitario: 0,
    metodoPago: "efectivo",
    montoPago: 0,
  })

  const stats = useMemo(() => {
    const count = ventas.length
    const ingreso = ventas.reduce((s, v) => s + v.precioTotal, 0)
    const deuda = ventas.reduce((s, v) => s + Math.max(0, v.precioTotal - v.abonado), 0)
    const paid = ventas.reduce((s, v) => s + v.abonado, 0)
    return { count, ingreso, deuda, margin: ingreso > 0 ? (paid / ingreso) * 100 : 0 }
  }, [ventas])

  const kpis = useMemo(
    () => [
      {
        label: "Ventas Totales",
        value: String(stats.count),
        Icon: ShoppingCart,
        color: "violet",
        trend: "+12%",
      },
      {
        label: "Ingreso Total",
        value: fmtMXN(stats.ingreso),
        Icon: DollarSign,
        color: "emerald",
        trend: "+8.5%",
      },
      {
        label: "Deuda Pendiente",
        value: fmtMXN(stats.deuda),
        Icon: CreditCard,
        color: "amber",
        trend: "-3.2%",
      },
      {
        label: "Margen Promedio",
        value: `${stats.margin.toFixed(1)}%`,
        Icon: TrendingUp,
        color: "cyan",
        trend: "+2.1%",
      },
    ],
    [stats]
  )

  const filtered = useMemo(
    () =>
      ventas.filter((v) => {
        if (statusFilter !== "todos" && v.estado !== statusFilter) return false
        if (search) {
          const q = search.toLowerCase()
          if (
            !v.cliente.toLowerCase().includes(q) &&
            !v.producto.toLowerCase().includes(q) &&
            !v.id.toLowerCase().includes(q)
          )
            return false
        }
        if (dateFrom && v.fecha < dateFrom) return false
        if (dateTo && v.fecha > dateTo) return false
        return true
      }),
    [ventas, statusFilter, search, dateFrom, dateTo]
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const sp = Math.min(page, totalPages)
  const rows = filtered.slice((sp - 1) * PER_PAGE, sp * PER_PAGE)

  const openModal = useCallback(() => {
    setForm({
      cliente: "",
      producto: "",
      cantidad: 1,
      precioUnitario: 0,
      metodoPago: "efectivo",
      montoPago: 0,
    })
    setStep(0)
    setShowModal(true)
  }, [])
  const setF = useCallback((k: string, v: string) => {
    if (k === "search") setSearch(v)
    else if (k === "status") setStatusFilter(v)
    else if (k === "from") setDateFrom(v)
    else if (k === "to") setDateTo(v)
    setPage(1)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("¿Eliminar esta venta? Esta acción recalculará métricas.")) return
      try {
        const res = await fetch(`/api/ventas/${id}`, { method: "DELETE" })
        if (!res.ok) throw new Error("Error")
        refetch()
      } catch {
        alert("Error al eliminar")
      }
    },
    [refetch]
  )

  const handleCreateSubmit = useCallback(() => {
    createVenta.mutate(
      {
        clienteId: form.cliente || "",
        cantidad: Number(form.cantidad) || 0,
        precioVentaUnidad: Number(form.precioUnitario) || 0,
        precioCompraUnidad: 0,
        precioFlete: 0,
        observaciones: "",
      },
      {
        onSuccess: () => {
          setShowModal(false)
          setStep(0)
          setForm({
            cliente: "",
            producto: "",
            cantidad: 1,
            precioUnitario: 0,
            metodoPago: "efectivo",
            montoPago: 0,
          })
        },
        onError: (err) => alert("Error al crear venta: " + err.message),
      }
    )
  }, [createVenta, form])

  // ── Loading ──
  if (loading)
    return (
      <div className={cn("space-y-4 p-6", className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="h-20 rounded-2xl bg-white/[0.04]"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
          />
        ))}
      </div>
    )
  // ── Error ──
  if (error)
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4 p-16", className)}>
        <AlertTriangle className="h-14 w-14 text-red-400" />
        <p className="text-lg text-white/60">Error al cargar ventas</p>
        <p className="max-w-sm text-center text-sm text-white/30">{error.message}</p>
        <button
          onClick={refetch}
          className="mt-2 flex items-center gap-2 rounded-xl bg-white/10 px-5 py-2.5 text-sm text-white transition hover:bg-white/15"
        >
          <RefreshCw className="h-4 w-4" /> Reintentar
        </button>
      </div>
    )

  // ─────────────────────────────────────────────────────────────────── RENDER
  return (
    <div className={cn("relative w-full space-y-5 text-white", className)}>
      {/* HEADER */}
      <motion.header
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panel de Ventas</h1>
          <p className="mt-1 text-sm text-white/40">Gestión de ventas y facturación</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            onClick={refetch}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-2.5 text-white/50 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Actualizar datos"
          >
            <RefreshCw className="h-4 w-4" />
          </motion.button>
          <motion.button
            onClick={openModal}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-4 py-2.5 text-sm font-medium shadow-lg shadow-violet-500/25 transition hover:shadow-violet-500/40"
          >
            <Plus className="h-4 w-4" /> Nueva Venta
          </motion.button>
        </div>
      </motion.header>

      {/* STATS — PremiumKPICard */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k, i) => (
          <PremiumKPICard
            key={k.label}
            title={k.label}
            value={k.value}
            icon={<k.Icon className="h-5 w-5" />}
            color={
              k.color === "violet"
                ? "violet"
                : k.color === "emerald"
                  ? "emerald"
                  : k.color === "amber"
                    ? "gold"
                    : "plasma"
            }
            delta={parseFloat((k.trend ?? "").replace(/[+%-]/g, "") || "0")}
            trend={k.trend?.startsWith("+") ? "up" : k.trend?.startsWith("-") ? "down" : "neutral"}
            className="border-white/[0.06]"
          />
        ))}
      </div>

      {/* FILTERS */}
      <motion.div
        className={cn(G, "flex flex-wrap items-center gap-3 p-3")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Filter className="hidden h-4 w-4 text-white/25 sm:block" />
        <div className="relative min-w-[200px] flex-1">
          <GlassInput
            placeholder="Buscar venta..."
            value={search}
            onChange={(e) => setF("search", e.target.value)}
          />
        </div>
        <GlassSelect
          value={statusFilter}
          onChange={(val) => setF("status", val)}
          options={[
            { value: "todos", label: "Todos" },
            { value: "pagada", label: "Pagada" },
            { value: "parcial", label: "Parcial" },
            { value: "pendiente", label: "Pendiente" },
          ]}
          className="w-auto min-w-[140px]"
        />
        {(["from", "to"] as const).map((k) => (
          <GlassInput
            key={k}
            type="date"
            value={k === "from" ? dateFrom : dateTo}
            onChange={(e) => setF(k, e.target.value)}
            className="w-auto min-w-[140px]"
            title={k === "from" ? "Desde" : "Hasta"}
          />
        ))}
        <button className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-xs text-white/50 transition hover:bg-white/[0.08] hover:text-white">
          <Download className="h-3.5 w-3.5" /> Exportar
        </button>
      </motion.div>

      {/* TABLE or EMPTY */}
      {ventas.length === 0 ? (
        <motion.div
          className={cn(G, "flex flex-col items-center justify-center gap-3 py-20")}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <ShoppingCart className="h-14 w-14 text-white/20" />
          <p className="text-white/40">No hay ventas registradas</p>
        </motion.div>
      ) : (
        <PremiumTableWrapper
          title="Ventas"
          subtitle={`${filtered.length} registros`}
          maxHeight="420px"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="sticky top-0 bg-white/[0.04] text-left text-xs tracking-wider text-white/40 uppercase">
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 text-right">Cantidad</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Pagado</th>
                  <th className="px-4 py-3 text-center">Estado</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((v, idx) => {
                  const b = BADGE[v.estado] ?? BADGE.pendiente!
                  const open = expandedId === v.id
                  return (
                    <React.Fragment key={v.id}>
                      <tr
                        onClick={() => setExpandedId(open ? null : v.id)}
                        className="cursor-pointer border-t border-white/[0.04] bg-white/[0.01] transition-colors hover:bg-white/[0.03]"
                      >
                        <td className="px-4 py-3 text-white/30">
                          <span className="flex items-center gap-1">
                            {(sp - 1) * PER_PAGE + idx + 1}
                            {open ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3 opacity-40" />
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">{v.cliente}</td>
                        <td className="px-4 py-3 text-white/70">{v.producto}</td>
                        <td className="px-4 py-3 text-right text-white/60">{v.cantidad}</td>
                        <td className="px-4 py-3 text-right font-medium">
                          {fmtMXN(v.precioTotal)}
                        </td>
                        <td className="px-4 py-3 text-right text-white/60">{fmtMXN(v.abonado)}</td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={cn(
                              "inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium",
                              b.cls
                            )}
                          >
                            {b.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div
                            className="flex items-center justify-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              title="Ver"
                              onClick={() => setExpandedId(open ? null : v.id)}
                              className={cn(
                                "rounded-lg p-1.5 text-white/30 transition hover:bg-white/[0.06] hover:text-cyan-400"
                              )}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              title="Editar"
                              onClick={() => setEditingId(v.id)}
                              className={cn(
                                "rounded-lg p-1.5 text-white/30 transition hover:bg-white/[0.06] hover:text-amber-400"
                              )}
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              title="Eliminar"
                              onClick={() => handleDelete(v.id)}
                              className={cn(
                                "rounded-lg p-1.5 text-white/30 transition hover:bg-white/[0.06] hover:text-red-400"
                              )}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                      <AnimatePresence>
                        {open && (
                          <tr>
                            <td colSpan={8}>
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25 }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-2 border-t border-white/[0.04] bg-white/[0.02] px-6 py-4">
                                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-white/40">
                                    <span className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" /> {fmtDate(v.fecha)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Receipt className="h-3 w-3" /> ID: {v.id}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Banknote className="h-3 w-3" /> Deuda:{" "}
                                      {fmtMXN(Math.max(0, v.precioTotal - v.abonado))}
                                    </span>
                                  </div>
                                  {v.origenLotes && v.origenLotes.length > 0 && (
                                    <div className="mt-2">
                                      <p className="mb-1.5 text-xs font-medium text-white/50">
                                        Lotes de origen:
                                      </p>
                                      <div className="space-y-1">
                                        {v.origenLotes.map((l, li) => (
                                          <div
                                            key={li}
                                            className="flex items-center gap-4 rounded-lg bg-white/[0.03] px-3 py-2 text-xs"
                                          >
                                            <span className="text-white/40">OC: {l.ocId}</span>
                                            <span className="text-white/60">{l.cantidad} uds</span>
                                            <span className="text-white/60">
                                              {fmtMXN(l.costoUnidad)}/ud
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            </td>
                          </tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
          {/* PAGINATION */}
          <div className="flex items-center justify-between border-t border-white/[0.04] px-4 py-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={sp <= 1}
              className="rounded-lg px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/[0.06] disabled:opacity-30"
            >
              Anterior
            </button>
            <span className="text-xs text-white/40">
              Página {sp} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={sp >= totalPages}
              className="rounded-lg px-3 py-1.5 text-xs text-white/50 transition hover:bg-white/[0.06] disabled:opacity-30"
            >
              Siguiente
            </button>
          </div>
        </PremiumTableWrapper>
      )}

      {/* CREATE MODAL — ModalShell + GlassFormSystem */}
      <ModalShell
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nueva Venta"
        description={`Paso ${step + 1} de 4 — ${STEPS[step]}`}
        size="md"
      >
        <div className="space-y-6">
          {/* Step indicator */}
          <div className="flex items-center gap-1">
            {STEPS.map((s, i) => (
              <React.Fragment key={s}>
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors",
                    i < step
                      ? "bg-violet-500 text-white"
                      : i === step
                        ? "bg-violet-500/30 text-violet-300 ring-2 ring-violet-500/50"
                        : "bg-white/[0.06] text-white/30"
                  )}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 rounded-full",
                      i < step ? "bg-violet-500" : "bg-white/[0.06]"
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
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {step === 0 && (
                <>
                  <GlassInput
                    label="Cliente"
                    placeholder="Buscar cliente..."
                    value={form.cliente}
                    onChange={(e) => setForm((f) => ({ ...f, cliente: e.target.value }))}
                  />
                  <p className="text-xs text-white/30">
                    Escribe el nombre del cliente para buscarlo en el sistema.
                  </p>
                </>
              )}
              {step === 1 && (
                <>
                  <GlassInput
                    label="Producto"
                    placeholder="Nombre del producto"
                    value={form.producto}
                    onChange={(e) => setForm((f) => ({ ...f, producto: e.target.value }))}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <GlassInput
                      label="Cantidad"
                      type="number"
                      placeholder="1"
                      value={String(form.cantidad)}
                      onChange={(e) => setForm((f) => ({ ...f, cantidad: +e.target.value || 1 }))}
                    />
                    <GlassCurrencyInput
                      label="Precio unitario"
                      value={form.precioUnitario}
                      onChange={(v) => setForm((f) => ({ ...f, precioUnitario: v }))}
                      currency="MXN"
                    />
                  </div>
                  <p className="text-right text-sm text-white/50">
                    Subtotal:{" "}
                    <span className="font-medium text-white">
                      {fmtMXN(form.cantidad * form.precioUnitario)}
                    </span>
                  </p>
                </>
              )}
              {step === 2 && (
                <>
                  <GlassSelect
                    label="Método de pago"
                    value={form.metodoPago}
                    onChange={(val) => setForm((f) => ({ ...f, metodoPago: val }))}
                    options={[
                      { value: "efectivo", label: "Efectivo" },
                      { value: "transferencia", label: "Transferencia" },
                      { value: "credito", label: "Crédito" },
                    ]}
                  />
                  <GlassCurrencyInput
                    label="Monto a pagar"
                    value={form.montoPago}
                    onChange={(v) => setForm((f) => ({ ...f, montoPago: v }))}
                    currency="MXN"
                    placeholder="0.00"
                  />
                </>
              )}
              {step === 3 && (
                <div className="space-y-3 rounded-xl bg-white/[0.04] p-4">
                  <h3 className="text-sm font-medium text-white/70">Resumen de venta</h3>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Cliente", form.cliente || "—"],
                      ["Producto", form.producto || "—"],
                      ["Cantidad", String(form.cantidad)],
                      ["Precio unitario", fmtMXN(form.precioUnitario)],
                    ].map(([l, val]) => (
                      <div key={l} className="flex justify-between">
                        <span className="text-white/40">{l}</span>
                        <span>{val}</span>
                      </div>
                    ))}
                    <div className="flex justify-between border-t border-white/[0.06] pt-2">
                      <span className="font-medium text-white/60">Total</span>
                      <span className="font-bold text-violet-400">
                        {fmtMXN(form.cantidad * form.precioUnitario)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Método</span>
                      <span className="capitalize">{form.metodoPago}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Pago inicial</span>
                      <span className="text-emerald-400">{fmtMXN(form.montoPago)}</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setShowModal(false)}
              className="rounded-lg px-3 py-2 text-xs text-white/40 transition hover:text-white"
            >
              Cancelar
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm transition hover:bg-white/[0.08]"
                >
                  Anterior
                </button>
              )}
              <button
                onClick={() => {
                  if (step < 3) setStep((s) => s + 1)
                  else handleCreateSubmit()
                }}
                disabled={step === 3 && createVenta.isPending}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-2 text-sm font-medium shadow-lg shadow-violet-500/25 transition hover:shadow-violet-500/40 disabled:opacity-50"
              >
                {step < 3 ? "Siguiente" : createVenta.isPending ? "Creando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      </ModalShell>
    </div>
  )
}
