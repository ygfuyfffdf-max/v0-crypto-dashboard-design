"use client"

import { GlassInput } from "@/app/_components/ui/GlassFormSystem"
import { cn } from "@/app/_lib/utils"
import { useAlmacenData as useAlmacen } from "@/app/hooks/useDataHooks"
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Check,
  Clock,
  DollarSign,
  Eye,
  Filter,
  Layers,
  Package,
  Plus,
  RefreshCw,
  TrendingUp,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import React, { useMemo, useState } from "react"
import { PremiumKPICard, PremiumTableWrapper } from "./PremiumPanelEnhancer"

// ═══════════════ TYPES ═══════════════

interface ProductoView {
  id: string
  nombre: string
  categoria: string
  stock: number
  stockMinimo: number
  valorizado: number
  entradas: number
  salidas: number
  rotacionDias: number
  lotes: LoteView[]
}
interface LoteView {
  id: string
  ocRef: string
  distribuidor: string
  cantidadOriginal: number
  restante: number
  costoUnitario: number
  fecha: string
}
interface AuroraAlmacenPanelUnifiedProps {
  onNavigate?: (path: string) => void
  className?: string
}

// ═══════════════ FORMATTERS & HELPERS ═══════════════

const fmtMXN = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" })
const fmtNum = new Intl.NumberFormat("es-MX")
type StockLabel = "Normal" | "Bajo" | "Crítico"

function getStockStatus(
  stock: number,
  minimo: number
): { label: StockLabel; color: string; bg: string } {
  const pct = stock / Math.max(minimo * 3, 1)
  if (pct > 0.6)
    return {
      label: "Normal",
      color: "#10B981",
      bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    }
  if (pct > 0.3)
    return {
      label: "Bajo",
      color: "#FBBF24",
      bg: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    }
  return { label: "Crítico", color: "#EF4444", bg: "bg-red-500/15 text-red-400 border-red-500/20" }
}

function GlassCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border border-white/6 bg-white/3 backdrop-blur-sm", className)}
      {...props}
    >
      {children}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-white/4" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-52 rounded-xl bg-white/4" />
        ))}
      </div>
    </div>
  )
}

// ═══════════════ PRODUCT CARD ═══════════════

function ProductCard({ producto, onSelect }: { producto: ProductoView; onSelect: () => void }) {
  const status = getStockStatus(producto.stock, producto.stockMinimo)
  const pct = Math.min((producto.stock / Math.max(producto.stockMinimo * 3, 1)) * 100, 100)
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className="cursor-pointer rounded-xl border border-white/6 bg-white/3 p-4 backdrop-blur-sm transition-all hover:border-white/12"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div className="rounded-lg p-1.5" style={{ backgroundColor: `${status.color}20` }}>
            <Package className="h-4 w-4" style={{ color: status.color }} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white/90">{producto.nombre}</p>
            {producto.categoria && (
              <span className="text-[10px] text-white/40">{producto.categoria}</span>
            )}
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
            status.bg
          )}
        >
          {status.label}
        </span>
      </div>
      {/* Stock Gauge */}
      <div className="mb-3">
        <div className="mb-1 flex justify-between text-[11px]">
          <span className="text-white/40">Stock</span>
          <span className="text-white/70 tabular-nums">{fmtNum.format(producto.stock)}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: status.color }}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>
      <p className="mb-2 text-2xl font-bold text-white/90 tabular-nums">
        {fmtNum.format(producto.stock)}
        <span className="ml-1 text-xs font-normal text-white/40">uds</span>
      </p>
      <div className="mb-2 flex justify-between text-xs">
        <span className="flex items-center gap-1 text-white/40">
          <DollarSign className="h-3 w-3" />
          Valor
        </span>
        <span className="font-semibold text-amber-400 tabular-nums">
          {fmtMXN.format(producto.valorizado)}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 border-t border-white/6 pt-2">
        {[
          {
            icon: ArrowDown,
            val: fmtNum.format(producto.entradas),
            label: "Entradas",
            cls: "text-emerald-400",
          },
          {
            icon: ArrowUp,
            val: fmtNum.format(producto.salidas),
            label: "Salidas",
            cls: "text-red-400",
          },
          {
            icon: Clock,
            val: `${producto.rotacionDias}d`,
            label: "Rotación",
            cls: "text-cyan-400",
          },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className={cn("mb-0.5 flex items-center justify-center gap-0.5", s.cls)}>
              <s.icon className="h-3 w-3" />
              <span className="text-[10px] font-medium">{s.val}</span>
            </div>
            <span className="text-[9px] text-white/30">{s.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// ═══════════════ LOT DRILL-DOWN MODAL ═══════════════

function LotModal({ producto, onClose }: { producto: ProductoView; onClose: () => void }) {
  const summaryItems = [
    { label: "Stock", value: fmtNum.format(producto.stock), color: "#8B5CF6" },
    { label: "Valorizado", value: fmtMXN.format(producto.valorizado), color: "#F59E0B" },
    { label: "Entradas", value: fmtNum.format(producto.entradas), color: "#10B981" },
    { label: "Salidas", value: fmtNum.format(producto.salidas), color: "#EF4444" },
  ]
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0d0d1a]/95 p-6 backdrop-blur-xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-500/20 p-2">
              <Layers className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white/90">{producto.nombre}</h3>
              <p className="text-xs text-white/40">Detalle de lotes y movimientos</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 transition-colors hover:bg-white/8">
            <X className="h-4 w-4 text-white/50" />
          </button>
        </div>
        <div className="mb-5 grid grid-cols-4 gap-3">
          {summaryItems.map((s) => (
            <div key={s.label} className="rounded-lg bg-white/4 p-3 text-center">
              <p className="mb-1 text-[10px] text-white/40">{s.label}</p>
              <p className="text-sm font-bold tabular-nums" style={{ color: s.color }}>
                {s.value}
              </p>
            </div>
          ))}
        </div>
        <div className="mb-3 flex items-center gap-2 text-xs text-white/50">
          <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
          Rotación estimada:{" "}
          <span className="font-semibold text-cyan-400">{producto.rotacionDias} días</span>
        </div>
        {producto.lotes.length > 0 ? (
          <GlassCard className="overflow-hidden">
            <div className="border-b border-white/6 px-4 py-2.5 text-xs font-medium text-white/50">
              Lotes (Órdenes de Compra)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-white/3">
                    <th className="px-3 py-2 text-left font-medium text-white/40">OC Ref</th>
                    <th className="px-3 py-2 text-left font-medium text-white/40">Distribuidor</th>
                    <th className="px-3 py-2 text-right font-medium text-white/40">Original</th>
                    <th className="px-3 py-2 text-right font-medium text-white/40">Restante</th>
                    <th className="px-3 py-2 text-right font-medium text-white/40">Costo Unit.</th>
                    <th className="px-3 py-2 text-left font-medium text-white/40">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {producto.lotes.map((l) => (
                    <tr
                      key={l.id}
                      className="border-t border-white/3 transition-colors hover:bg-white/3"
                    >
                      <td className="px-3 py-2 font-medium text-cyan-400">{l.ocRef}</td>
                      <td className="px-3 py-2 text-white/60">{l.distribuidor}</td>
                      <td className="px-3 py-2 text-right text-white/70 tabular-nums">
                        {fmtNum.format(l.cantidadOriginal)}
                      </td>
                      <td
                        className="px-3 py-2 text-right font-semibold tabular-nums"
                        style={{ color: l.restante > 0 ? "#10B981" : "#EF4444" }}
                      >
                        {fmtNum.format(l.restante)}
                      </td>
                      <td className="px-3 py-2 text-right text-amber-400 tabular-nums">
                        {fmtMXN.format(l.costoUnitario)}
                      </td>
                      <td className="px-3 py-2 text-white/40">{l.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassCard>
        ) : (
          <div className="py-8 text-center text-white/30">
            <Layers className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">Sin lotes registrados</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

// ═══════════════ MAIN COMPONENT ═══════════════

const STATUS_FILTERS = ["todos", "normal", "bajo", "critico"] as const
const FILTER_LABELS: Record<string, string> = {
  todos: "Todos",
  normal: "Normal",
  bajo: "Bajo",
  critico: "Crítico",
}

export function AuroraAlmacenPanelUnified({
  onNavigate,
  className,
}: AuroraAlmacenPanelUnifiedProps) {
  const { data, isLoading: loading, error, refetch } = useAlmacen()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("todos")
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const [selectedProducto, setSelectedProducto] = useState<ProductoView | null>(null)

  const productos = useMemo((): ProductoView[] => {
    const items = data?.productos ?? []
    const entradas = data?.entradas ?? []
    const salidas = data?.salidas ?? []
    return items.map((p) => {
      const stock = p.stock ?? p.cantidad ?? 0
      const stockMinimo = p.stockMinimo ?? p.minimo ?? 10
      const avgCost = p.precioCompra ?? 0
      const prodEnt = entradas.filter((e) => e.productoId === p.id)
      const prodSal = salidas.filter((s) => s.productoId === p.id)
      const totalEnt = prodEnt.reduce((s, e) => s + (e.cantidad ?? 0), 0)
      const totalSal = prodSal.reduce((s, e) => s + (e.cantidad ?? 0), 0)
      const daily = totalSal > 0 ? totalSal / 30 : 0
      const lotes: LoteView[] = prodEnt
        .filter((e) => e.ordenCompraId)
        .map((e) => ({
          id: e.id,
          ocRef: e.ordenCompraId ?? "",
          distribuidor: "Proveedor",
          cantidadOriginal: e.cantidad,
          restante: e.cantidad,
          costoUnitario: e.precioUnitario ?? 0,
          fecha: e.fecha ?? "",
        }))
      return {
        id: p.id,
        nombre: p.nombre,
        categoria: p.categoria ?? "General",
        stock,
        stockMinimo,
        valorizado: stock * avgCost,
        entradas: totalEnt,
        salidas: totalSal,
        rotacionDias: daily > 0 ? Math.round(stock / daily) : 0,
        lotes,
      }
    })
  }, [data])

  const stats = useMemo(() => {
    const total = productos.length
    const stockTotal = productos.reduce((s, p) => s + p.stock, 0)
    const valorizado = productos.reduce((s, p) => s + p.valorizado, 0)
    const criticos = productos.filter(
      (p) => getStockStatus(p.stock, p.stockMinimo).label === "Crítico"
    ).length
    return { total, stockTotal, valorizado, criticos }
  }, [productos])

  const filtered = useMemo(
    () =>
      productos.filter((p) => {
        if (search && !p.nombre.toLowerCase().includes(search.toLowerCase())) return false
        if (statusFilter === "todos") return true
        const label = getStockStatus(p.stock, p.stockMinimo).label
        return label === FILTER_LABELS[statusFilter]
      }),
    [productos, search, statusFilter]
  )

  const criticalProducts = useMemo(
    () => productos.filter((p) => getStockStatus(p.stock, p.stockMinimo).label === "Crítico"),
    [productos]
  )

  if (loading) return <LoadingSkeleton />
  if (error)
    return (
      <GlassCard className="p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-400" />
        <p className="mb-4 text-sm text-white/60">Error al cargar inventario</p>
        <button
          onClick={refetch}
          className="rounded-lg bg-white/6 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10"
        >
          Reintentar
        </button>
      </GlassCard>
    )

  return (
    <div className={cn("space-y-5", className)}>
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white/90">
            <Package className="h-5 w-5 text-amber-400" />
            Panel de Almacén
          </h2>
          <p className="mt-0.5 text-xs text-white/40">Inventario y productos</p>
        </div>
        <motion.button
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.4 }}
          onClick={refetch}
          className="rounded-lg border border-white/8 bg-white/4 p-2.5 transition-colors hover:bg-white/8"
          aria-label="Actualizar inventario"
        >
          <RefreshCw className="h-4 w-4 text-white/50" />
        </motion.button>
      </div>

      {/* STATS BAR — PremiumKPICard */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3 md:grid-cols-4"
      >
        {[
          {
            icon: Package,
            label: "Total Productos",
            value: fmtNum.format(stats.total),
            color: "violet" as const,
          },
          {
            icon: Layers,
            label: "Stock Total",
            value: `${fmtNum.format(stats.stockTotal)} uds`,
            color: "plasma" as const,
          },
          {
            icon: DollarSign,
            label: "Stock Valorizado",
            value: fmtMXN.format(stats.valorizado),
            color: "gold" as const,
          },
          {
            icon: AlertTriangle,
            label: "Productos Críticos",
            value: stats.criticos.toString(),
            color: (stats.criticos > 0 ? "plasma" : "emerald") as const,
          },
        ].map((s) => (
          <PremiumKPICard
            key={s.label}
            title={s.label}
            value={s.value}
            icon={<s.icon className="h-5 w-5" />}
            color={s.color}
          />
        ))}
      </motion.div>

      {/* STOCK ALERTS BANNER */}
      <AnimatePresence>
        {criticalProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
            <p className="flex-1 text-xs text-red-300">
              <span className="font-semibold">{criticalProducts.length} producto(s)</span> con stock
              crítico:{" "}
              {criticalProducts
                .slice(0, 3)
                .map((p) => p.nombre)
                .join(", ")}
              {criticalProducts.length > 3 && ` y ${criticalProducts.length - 3} más`}
            </p>
            <Check className="h-3.5 w-3.5 shrink-0 text-red-400/50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEARCH + FILTERS — GlassInput */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <GlassInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
          />
        </div>
        <div className="flex items-center gap-1.5 rounded-lg border border-white/6 bg-white/3 p-1">
          <Filter className="ml-1.5 h-3.5 w-3.5 text-white/30" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                statusFilter === f
                  ? "bg-white/10 text-white/90 shadow-sm"
                  : "text-white/40 hover:text-white/60"
              )}
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-white/6 bg-white/3 p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-md p-1.5 transition-all",
              viewMode === "grid" ? "bg-white/10" : "hover:bg-white/5"
            )}
            aria-label="Cuadrícula"
          >
            <BarChart3 className="h-4 w-4 text-white/60" />
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={cn(
              "rounded-md p-1.5 transition-all",
              viewMode === "table" ? "bg-white/10" : "hover:bg-white/5"
            )}
            aria-label="Tabla"
          >
            <Eye className="h-4 w-4 text-white/60" />
          </button>
        </div>
      </div>

      {/* PRODUCT GRID */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
              >
                <ProductCard producto={p} onSelect={() => setSelectedProducto(p)} />
              </motion.div>
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-white/30">
              <Package className="mx-auto mb-3 h-10 w-10 opacity-40" />
              <p className="text-sm">No se encontraron productos</p>
            </div>
          )}
        </div>
      )}

      {/* TABLE VIEW — PremiumTableWrapper */}
      {viewMode === "table" && (
        <PremiumTableWrapper
          title="Inventario"
          subtitle={`${filtered.length} productos`}
          maxHeight="420px"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-white/4">
                  <th className="px-4 py-2.5 text-left font-medium text-white/40">Producto</th>
                  <th className="px-4 py-2.5 text-right font-medium text-white/40">Stock</th>
                  <th className="px-4 py-2.5 text-right font-medium text-white/40">Valor</th>
                  <th className="px-4 py-2.5 text-right font-medium text-white/40">Entradas</th>
                  <th className="px-4 py-2.5 text-right font-medium text-white/40">Salidas</th>
                  <th className="px-4 py-2.5 text-right font-medium text-white/40">Rotación</th>
                  <th className="px-4 py-2.5 text-center font-medium text-white/40">Estado</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const st = getStockStatus(p.stock, p.stockMinimo)
                  return (
                    <tr
                      key={p.id}
                      className="cursor-pointer border-t border-white/3 transition-colors hover:bg-white/3"
                      onClick={() => setSelectedProducto(p)}
                    >
                      <td className="px-4 py-2.5">
                        <p className="font-medium text-white/80">{p.nombre}</p>
                        <span className="text-[10px] text-white/30">{p.categoria}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-white/80 tabular-nums">
                        {fmtNum.format(p.stock)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-amber-400 tabular-nums">
                        {fmtMXN.format(p.valorizado)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-emerald-400 tabular-nums">
                        {fmtNum.format(p.entradas)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-red-400 tabular-nums">
                        {fmtNum.format(p.salidas)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-cyan-400 tabular-nums">
                        {p.rotacionDias}d
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={cn(
                            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                            st.bg
                          )}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <Plus className="inline-block h-3.5 w-3.5 rotate-45 text-white/30" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-white/30">Sin resultados</div>
          )}
        </PremiumTableWrapper>
      )}

      {/* LOT DRILL-DOWN MODAL */}
      <AnimatePresence>
        {selectedProducto && (
          <LotModal producto={selectedProducto} onClose={() => setSelectedProducto(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

export default AuroraAlmacenPanelUnified
