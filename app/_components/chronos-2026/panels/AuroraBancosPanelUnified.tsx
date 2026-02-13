"use client"

import { ModalShell } from "@/app/_components/modals/ModalShell"
import { GlassCurrencyInput, GlassInput, GlassSelect } from "@/app/_components/ui/GlassFormSystem"
import { cn } from "@/app/_lib/utils"
import {
  useBancosData as useBancos,
  useClientesData,
  useDistribuidoresData,
  useRegistrarGasto,
  useTransferencia,
} from "@/app/hooks/useDataHooks"
import {
  Activity,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowUpRight,
  BarChart3,
  ChevronRight,
  CreditCard,
  DollarSign,
  Eye,
  Landmark,
  PiggyBank,
  Plus,
  Receipt,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  Wallet,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import React, { useCallback, useEffect, useMemo, useState } from "react"
import { PremiumChartWrapper, PremiumKPICard, PremiumTableWrapper } from "./PremiumPanelEnhancer"

// ═══════════════════════════════════════════════════════
// CONFIGURATION & TYPES
// ═══════════════════════════════════════════════════════

const BANK_CONFIG = [
  {
    id: "boveda_monte",
    name: "Bóveda Monte",
    type: "operativo" as const,
    color: "#8B5CF6",
    icon: Wallet,
    description: "Capital de compras y costos",
  },
  {
    id: "boveda_usa",
    name: "Bóveda USA",
    type: "operativo" as const,
    color: "#3B82F6",
    icon: DollarSign,
    description: "Capital en dólares",
  },
  {
    id: "profit",
    name: "Profit",
    type: "inversion" as const,
    color: "#14B8A6",
    icon: TrendingUp,
    description: "Casa de Cambio",
  },
  {
    id: "leftie",
    name: "Leftie",
    type: "ahorro" as const,
    color: "#6366F1",
    icon: PiggyBank,
    description: "Fondo de reserva",
  },
  {
    id: "azteca",
    name: "Azteca",
    type: "operativo" as const,
    color: "#EC4899",
    icon: CreditCard,
    description: "Cuenta bancaria principal",
  },
  {
    id: "flete_sur",
    name: "Flete Sur",
    type: "operativo" as const,
    color: "#F59E0B",
    icon: Truck,
    description: "Fondos de logística",
  },
  {
    id: "utilidades",
    name: "Utilidades",
    type: "inversion" as const,
    color: "#10B981",
    icon: BarChart3,
    description: "Ganancias netas",
  },
]

type BankType = "operativo" | "inversion" | "ahorro"

const TYPE_BADGE: Record<BankType, string> = {
  operativo: "bg-blue-500/20 text-blue-300 border-blue-500/20",
  inversion: "bg-violet-500/20 text-violet-300 border-violet-500/20",
  ahorro: "bg-emerald-500/20 text-emerald-300 border-emerald-500/20",
}

interface MergedBank {
  id: string
  config: (typeof BANK_CONFIG)[number]
  capital: number
  historicoIngresos: number
  historicoGastos: number
}

interface AuroraBancosPanelUnifiedProps {
  onNavigate?: (path: string) => void
  className?: string
}

const fmtMXN = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" })
const fmtCompact = new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 })

// ═══════════════════════════════════════════════════════
// GLASS CARD BASE
// ═══════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════
// LOADING SKELETON
// ═══════════════════════════════════════════════════════

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-1">
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-36 w-44 shrink-0 rounded-xl bg-white/4" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-white/4" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-xl bg-white/4" />
        <div className="h-64 rounded-xl bg-white/4" />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// BANK CAPITAL CARD
// ═══════════════════════════════════════════════════════

function BankCard({
  bank,
  selected,
  onSelect,
}: {
  bank: MergedBank
  selected: boolean
  onSelect: () => void
}) {
  const Icon = bank.config.icon
  const trend = bank.historicoIngresos - bank.historicoGastos
  const isPositive = trend >= 0

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-44 shrink-0 snap-start rounded-xl p-4 text-left transition-all duration-300",
        "border bg-white/3 backdrop-blur-sm",
        selected ? "border-2 shadow-lg" : "border-white/6 hover:border-white/12"
      )}
      style={
        selected
          ? { borderColor: `${bank.config.color}66`, boxShadow: `0 0 24px ${bank.config.color}20` }
          : undefined
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-lg p-2" style={{ backgroundColor: `${bank.config.color}20` }}>
          <Icon className="h-4 w-4" style={{ color: bank.config.color }} />
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[10px] font-medium",
            TYPE_BADGE[bank.config.type]
          )}
        >
          {bank.config.type}
        </span>
      </div>
      <p className="mb-1 truncate text-xs text-white/50">{bank.config.name}</p>
      <p className="text-lg font-bold text-white/90 tabular-nums">{fmtMXN.format(bank.capital)}</p>
      <div
        className={cn(
          "mt-2 flex items-center gap-1 text-[11px]",
          isPositive ? "text-emerald-400" : "text-red-400"
        )}
      >
        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
        <span>{fmtCompact.format(Math.abs(trend))}</span>
      </div>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════
// KPI CARD — Usa PremiumKPICard con iconos y formato
// ═══════════════════════════════════════════════════════

function KpiCardPremium({
  icon: Icon,
  label,
  value,
  color,
  trend,
}: {
  icon: React.ElementType
  label: string
  value: number
  color: "violet" | "gold" | "plasma" | "emerald"
  trend?: "up" | "down" | "neutral"
}) {
  return (
    <PremiumKPICard
      title={label}
      value={fmtMXN.format(value)}
      icon={<Icon className="h-5 w-5" />}
      color={color}
      trend={trend}
    />
  )
}

// ═══════════════════════════════════════════════════════
// SVG DONUT CHART
// ═══════════════════════════════════════════════════════

function DonutChart({ banks, total }: { banks: MergedBank[]; total: number }) {
  const R = 70
  const C = 2 * Math.PI * R

  const segments = useMemo(() => {
    let offset = 0
    return banks.map((bank) => {
      const pct = total > 0 ? bank.capital / total : 1 / banks.length
      const len = Math.max(pct * C, 2)
      const seg = {
        id: bank.id,
        color: bank.config.color,
        name: bank.config.name,
        offset,
        len,
        pct,
      }
      offset += len
      return seg
    })
  }, [banks, total, C])

  return (
    <div className="flex h-full items-center gap-4">
      <svg viewBox="0 0 200 200" className="h-40 w-40 shrink-0">
        {segments.map((seg) => (
          <circle
            key={seg.id}
            cx="100"
            cy="100"
            r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth="18"
            strokeDasharray={`${seg.len} ${C - seg.len}`}
            strokeDashoffset={-seg.offset}
            transform="rotate(-90 100 100)"
            className="transition-all duration-700 ease-out"
            opacity={0.85}
          />
        ))}
        <text
          x="100"
          y="96"
          textAnchor="middle"
          fill="rgba(255,255,255,0.9)"
          fontSize="13"
          fontWeight="700"
        >
          {fmtCompact.format(total)}
        </text>
        <text x="100" y="114" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="9">
          Capital Total
        </text>
      </svg>
      <div className="flex min-w-0 flex-col gap-1.5">
        {segments.map((seg) => (
          <div key={seg.id} className="flex items-center gap-2">
            <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="truncate text-[10px] text-white/50">{seg.name}</span>
            <span className="ml-auto shrink-0 text-[10px] text-white/40 tabular-nums">
              {Math.round(seg.pct * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// CASH FLOW AREA CHART (PLACEHOLDER)
// ═══════════════════════════════════════════════════════

function CashFlowChart() {
  const data = [30, 45, 35, 60, 50, 70, 55, 80, 65, 75, 90, 85]
  const months = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ]
  const W = 320
  const H = 140
  const P = 16
  const max = Math.max(...data)
  const step = (W - 2 * P) / (data.length - 1)

  const pts = data.map((v, i) => ({
    x: P + i * step,
    y: H - P - (v / max) * (H - 2 * P),
  }))

  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")
  const area = `${line} L${pts[pts.length - 1].x},${H - P} L${pts[0].x},${H - P} Z`

  return (
    <div className="flex h-full w-full flex-col">
      <svg viewBox={`0 0 ${W} ${H}`} className="flex-1" preserveAspectRatio="none">
        <defs>
          <linearGradient id="cf-area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#cf-area-grad)" />
        <path d={line} fill="none" stroke="#8B5CF6" strokeWidth="2" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="2.5"
            fill="#8B5CF6"
            stroke="#0d0d1a"
            strokeWidth="1.5"
          />
        ))}
      </svg>
      <div className="mt-1 flex justify-between px-1 text-[9px] text-white/30">
        {months.map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════
// PROGRESS ARC (Bank Detail stats)
// ═══════════════════════════════════════════════════════

function ProgressArc({
  value,
  max,
  color,
  label,
  amount,
}: {
  value: number
  max: number
  color: string
  label: string
  amount: number
}) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0
  const R = 36
  const C = 2 * Math.PI * R

  return (
    <GlassCard className="flex items-center gap-4 p-4">
      <svg viewBox="0 0 80 80" className="h-16 w-16 shrink-0">
        <circle cx="40" cy="40" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
        <motion.circle
          cx="40"
          cy="40"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
          initial={{ strokeDasharray: `0 ${C}` }}
          animate={{ strokeDasharray: `${pct * C} ${C - pct * C}` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <text
          x="40"
          y="43"
          textAnchor="middle"
          fill="rgba(255,255,255,0.8)"
          fontSize="11"
          fontWeight="600"
        >
          {Math.round(pct * 100)}%
        </text>
      </svg>
      <div className="min-w-0">
        <p className="text-[11px] text-white/40">{label}</p>
        <p className="text-base font-bold text-white/90 tabular-nums">{fmtMXN.format(amount)}</p>
      </div>
    </GlassCard>
  )
}

// ═══════════════════════════════════════════════════════
// PLACEHOLDER MOVEMENTS GENERATOR
// ═══════════════════════════════════════════════════════

const MOVEMENT_CONCEPTS = [
  "Venta de producto",
  "Pago a proveedor",
  "Transferencia interna",
  "Comisión bancaria",
  "Abono de cliente",
  "Compra de mercancía",
  "Pago de flete",
  "Retiro efectivo",
  "Depósito en cuenta",
  "Pago de nómina",
]

function generateMovements(bankId: string) {
  const types = ["ingreso", "gasto", "transferencia"] as const
  return Array.from({ length: 10 }, (_, i) => ({
    id: `${bankId}-mov-${i}`,
    fecha: new Date(2026, 1, 13 - i).toLocaleDateString("es-MX"),
    tipo: types[i % 3],
    monto: Math.round((Math.random() * 50000 + 1000) * 100) / 100,
    descripcion: MOVEMENT_CONCEPTS[i],
  }))
}

// ═══════════════════════════════════════════════════════
// SELECTED BANK DETAIL PANEL
// ═══════════════════════════════════════════════════════

function BankDetail({
  bank,
  onIngreso,
  onGasto,
  onTransferencia,
}: {
  bank: MergedBank
  onIngreso: (bancoId: string) => void
  onGasto: (bancoId: string) => void
  onTransferencia: (bancoOrigenId: string) => void
}) {
  const movements = useMemo(() => generateMovements(bank.id), [bank.id])
  const Icon = bank.config.icon
  const refMax = Math.max(bank.historicoIngresos, bank.capital, 1)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Bank Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl p-2.5" style={{ backgroundColor: `${bank.config.color}20` }}>
          <Icon className="h-5 w-5" style={{ color: bank.config.color }} />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white/90">{bank.config.name}</h3>
          <p className="text-xs text-white/40">{bank.config.description}</p>
        </div>
        <ChevronRight className="ml-auto h-4 w-4 text-white/20" />
      </div>

      {/* Progress Arcs: Histórico vs Actual */}
      <div className="grid grid-cols-2 gap-3">
        <ProgressArc
          value={bank.historicoIngresos}
          max={refMax}
          color={bank.config.color}
          label="Capital Histórico"
          amount={bank.historicoIngresos}
        />
        <ProgressArc
          value={bank.capital}
          max={refMax}
          color="#10B981"
          label="Capital Actual"
          amount={bank.capital}
        />
      </div>

      {/* Movements Table — Premium Table Wrapper */}
      <PremiumTableWrapper
        title="Últimos Movimientos"
        subtitle="Historial del banco"
        maxHeight="280px"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/4">
                <th className="px-4 py-2 text-left font-medium text-white/40">Fecha</th>
                <th className="px-4 py-2 text-left font-medium text-white/40">Tipo</th>
                <th className="px-4 py-2 text-right font-medium text-white/40">Monto</th>
                <th className="px-4 py-2 text-left font-medium text-white/40">Descripción</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((mov) => (
                <tr
                  key={mov.id}
                  className="border-t border-white/3 transition-colors hover:bg-white/3"
                >
                  <td className="px-4 py-2.5 text-white/60">{mov.fecha}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-medium",
                        mov.tipo === "ingreso" && "bg-emerald-500/20 text-emerald-400",
                        mov.tipo === "gasto" && "bg-red-500/20 text-red-400",
                        mov.tipo === "transferencia" && "bg-blue-500/20 text-blue-400"
                      )}
                    >
                      {mov.tipo}
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right font-medium tabular-nums",
                      mov.tipo === "ingreso"
                        ? "text-emerald-400"
                        : mov.tipo === "gasto"
                          ? "text-red-400"
                          : "text-blue-400"
                    )}
                  >
                    {mov.tipo === "gasto" ? "-" : "+"}
                    {fmtMXN.format(mov.monto)}
                  </td>
                  <td className="px-4 py-2.5 text-white/50">{mov.descripcion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PremiumTableWrapper>

      {/* Bank-specific Quick Actions */}
      <div className="flex gap-2">
        {[
          { label: "Ingreso", icon: Plus, color: "#10B981", handler: () => onIngreso(bank.id) },
          { label: "Gasto", icon: Receipt, color: "#EF4444", handler: () => onGasto(bank.id) },
          {
            label: "Transferencia",
            icon: ArrowLeftRight,
            color: "#3B82F6",
            handler: () => onTransferencia(bank.id),
          },
        ].map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={action.handler}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-2.5 text-xs font-medium text-white/70 transition-colors hover:border-white/15"
          >
            <action.icon className="h-3.5 w-3.5" style={{ color: action.color }} />
            {action.label}
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════
// BANCOS MODALS — Glass Form System
// ═══════════════════════════════════════════════════════

function BancosModals({
  modalTipo,
  modalBancoId,
  banks,
  onClose,
  onSubmitIngreso,
  onSubmitGasto,
  onSubmitTransferencia,
}: {
  modalTipo: "ingreso" | "gasto" | "transferencia" | null
  modalBancoId: string | null
  banks: MergedBank[]
  onClose: () => void
  onSubmitIngreso: (monto: number, concepto: string) => void
  onSubmitGasto: (monto: number, concepto: string) => void
  onSubmitTransferencia: (bancoDestinoId: string, monto: number, concepto: string) => void
}) {
  const [monto, setMonto] = useState(0)
  const [concepto, setConcepto] = useState("")
  const [bancoDestinoId, setBancoDestinoId] = useState("")

  const resetForm = useCallback(() => {
    setMonto(0)
    setConcepto("")
    setBancoDestinoId("")
  }, [])

  useEffect(() => {
    if (modalTipo) resetForm()
  }, [modalTipo, resetForm])

  const handleClose = useCallback(() => {
    resetForm()
    onClose()
  }, [resetForm, onClose])

  const destinos = banks
    .filter((b) => b.id !== modalBancoId)
    .map((b) => ({ value: b.id, label: b.config.name }))
  const bancoNombre = banks.find((b) => b.id === modalBancoId)?.config.name ?? ""

  return (
    <>
      <ModalShell
        isOpen={modalTipo === "ingreso"}
        onClose={handleClose}
        title="Registrar Ingreso"
        description={`Banco: ${bancoNombre}`}
        size="md"
      >
        <div className="space-y-4 py-2">
          <GlassCurrencyInput label="Monto (MXN)" value={monto} onChange={setMonto} />
          <GlassInput
            label="Concepto"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Ej: Venta, Abono, Depósito..."
          />
          <div className="flex gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (monto > 0) onSubmitIngreso(monto, concepto || "Ingreso manual")
                handleClose()
              }}
              className="flex-1 rounded-xl border border-emerald-500/30 bg-emerald-500/20 py-2.5 font-medium text-emerald-400"
            >
              Confirmar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="flex-1 rounded-xl bg-white/5 py-2.5 font-medium text-white/70"
            >
              Cancelar
            </motion.button>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        isOpen={modalTipo === "gasto"}
        onClose={handleClose}
        title="Registrar Gasto"
        description={`Banco: ${bancoNombre}`}
        size="md"
      >
        <div className="space-y-4 py-2">
          <GlassCurrencyInput label="Monto (MXN)" value={monto} onChange={setMonto} />
          <GlassInput
            label="Concepto"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Ej: Pago proveedor, Comisión..."
          />
          <div className="flex gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (monto > 0) onSubmitGasto(monto, concepto || "Gasto manual")
                handleClose()
              }}
              className="flex-1 rounded-xl border border-red-500/30 bg-red-500/20 py-2.5 font-medium text-red-400"
            >
              Confirmar
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="flex-1 rounded-xl bg-white/5 py-2.5 font-medium text-white/70"
            >
              Cancelar
            </motion.button>
          </div>
        </div>
      </ModalShell>

      <ModalShell
        isOpen={modalTipo === "transferencia"}
        onClose={handleClose}
        title="Transferir Fondos"
        description={`Origen: ${bancoNombre}`}
        size="md"
      >
        <div className="space-y-4 py-2">
          <GlassSelect
            label="Banco destino"
            options={destinos}
            value={bancoDestinoId}
            onChange={(v) => setBancoDestinoId(v)}
            placeholder="Seleccionar banco"
          />
          <GlassCurrencyInput label="Monto (MXN)" value={monto} onChange={setMonto} />
          <GlassInput
            label="Concepto"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Ej: Transferencia interna"
          />
          <div className="flex gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (monto > 0 && bancoDestinoId)
                  onSubmitTransferencia(bancoDestinoId, monto, concepto || "Transferencia")
                handleClose()
              }}
              className="flex-1 rounded-xl border border-blue-500/30 bg-blue-500/20 py-2.5 font-medium text-blue-400"
            >
              Transferir
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="flex-1 rounded-xl bg-white/5 py-2.5 font-medium text-white/70"
            >
              Cancelar
            </motion.button>
          </div>
        </div>
      </ModalShell>
    </>
  )
}

// ═══════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════

export function AuroraBancosPanelUnified({ onNavigate, className }: AuroraBancosPanelUnifiedProps) {
  const { data: bancosRaw, loading, error, refetch } = useBancos()
  const { data: clientesRaw } = useClientesData()
  const { data: distribuidoresRaw } = useDistribuidoresData()
  const bancos = useMemo(() => (Array.isArray(bancosRaw) ? bancosRaw : []), [bancosRaw])
  const transferencia = useTransferencia()
  const registrarGasto = useRegistrarGasto()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [modalTipo, setModalTipo] = useState<"ingreso" | "gasto" | "transferencia" | null>(null)
  const [modalBancoId, setModalBancoId] = useState<string | null>(null)

  // Merge API data with static bank config
  const banks = useMemo<MergedBank[]>(
    () =>
      BANK_CONFIG.map((config) => {
        const api = bancos?.find((b) => b.id === config.id)
        return {
          id: config.id,
          config,
          capital: api?.capitalActual ?? 0,
          historicoIngresos: api?.historicoIngresos ?? 0,
          historicoGastos: api?.historicoGastos ?? 0,
        }
      }),
    [bancos]
  )

  const selectedBank = useMemo(
    () => banks.find((b) => b.id === selectedId) ?? null,
    [banks, selectedId]
  )

  const totals = useMemo(() => {
    const capitalTotal = banks.reduce((s, b) => s + b.capital, 0)
    const ingresosTotal = banks.reduce((s, b) => s + b.historicoIngresos, 0)
    const gastosTotal = banks.reduce((s, b) => s + b.historicoGastos, 0)
    const clientes = Array.isArray(clientesRaw) ? clientesRaw : []
    const distribuidores = Array.isArray(distribuidoresRaw) ? distribuidoresRaw : []
    const deudaClientes = clientes.reduce(
      (s, c) => s + (Number((c as Record<string, unknown>).saldoPendiente) || 0),
      0
    )
    const adeudoDistribuidores = distribuidores.reduce(
      (s, d) => s + (Number((d as Record<string, unknown>).saldoPendiente) || 0),
      0
    )
    return { capitalTotal, ingresosTotal, gastosTotal, deudaClientes, adeudoDistribuidores }
  }, [banks, clientesRaw, distribuidoresRaw])

  const handleSelect = useCallback((id: string) => {
    setSelectedId((prev) => (prev === id ? null : id))
  }, [])

  const handleRefresh = useCallback(() => refetch(), [refetch])

  const openModal = useCallback((tipo: "ingreso" | "gasto" | "transferencia", bancoId: string) => {
    setModalTipo(tipo)
    setModalBancoId(bancoId)
  }, [])

  const closeModal = useCallback(() => {
    setModalTipo(null)
    setModalBancoId(null)
  }, [])

  const handleIngreso = useCallback((bancoId: string) => openModal("ingreso", bancoId), [openModal])
  const handleGasto = useCallback((bancoId: string) => openModal("gasto", bancoId), [openModal])
  const handleTransferencia = useCallback(
    (bancoId: string) => openModal("transferencia", bancoId),
    [openModal]
  )

  const submitIngreso = useCallback(
    async (monto: number, concepto: string) => {
      if (!modalBancoId || monto <= 0) return
      try {
        const formData = new FormData()
        formData.append("bancoId", modalBancoId)
        formData.append("monto", String(monto))
        formData.append("concepto", concepto)
        formData.append("tipo", "ingreso")
        await fetch("/api/movimientos", { method: "POST", body: formData })
        refetch()
        closeModal()
      } catch {
        alert("Error al registrar ingreso")
      }
    },
    [modalBancoId, refetch, closeModal]
  )

  const submitGasto = useCallback(
    (monto: number, concepto: string) => {
      if (!modalBancoId || monto <= 0) return
      registrarGasto.mutate(
        { bancoId: modalBancoId, monto, concepto },
        {
          onSuccess: () => {
            refetch()
            closeModal()
          },
          onError: () => alert("Error al registrar gasto"),
        }
      )
    },
    [modalBancoId, registrarGasto, refetch, closeModal]
  )

  const submitTransferencia = useCallback(
    (bancoDestinoId: string, monto: number, concepto: string) => {
      if (!modalBancoId || monto <= 0) return
      transferencia.mutate(
        { bancoOrigenId: modalBancoId, bancoDestinoId, monto, concepto },
        {
          onSuccess: () => {
            refetch()
            closeModal()
          },
          onError: () => alert("Error en transferencia"),
        }
      )
    },
    [modalBancoId, transferencia, refetch, closeModal]
  )

  const handleDeleteMovimiento = async (id: string) => {
    if (!confirm("¿Eliminar este movimiento?")) return
    try {
      await fetch(`/api/movimientos/${id}`, { method: "DELETE" })
      refetch()
    } catch {
      alert("Error al eliminar movimiento")
    }
  }

  // ── Loading State ──
  if (loading) return <LoadingSkeleton />

  // ── Error State ──
  if (error) {
    return (
      <GlassCard className="p-8 text-center">
        <Activity className="mx-auto mb-3 h-8 w-8 text-red-400" />
        <p className="mb-4 text-sm text-white/60">Error al cargar datos de bancos</p>
        <button
          onClick={handleRefresh}
          className="rounded-lg bg-white/6 px-4 py-2 text-sm text-white/70 transition-colors hover:bg-white/10"
        >
          Reintentar
        </button>
      </GlassCard>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* ─── HEADER ─── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-white/90">
            <Landmark className="h-5 w-5 text-violet-400" />
            Panel de Bancos
          </h2>
          <p className="mt-0.5 text-xs text-white/40">Centro Financiero</p>
        </div>
        <motion.button
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.4 }}
          onClick={handleRefresh}
          className="rounded-lg border border-white/8 bg-white/4 p-2.5 transition-colors hover:bg-white/8"
        >
          <RefreshCw className="h-4 w-4 text-white/50" />
        </motion.button>
      </div>

      {/* ─── BANK CAPITAL CARDS ROW ─── */}
      <div className="scrollbar-thin scrollbar-thumb-white/10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
        {banks.map((bank, i) => (
          <motion.div
            key={bank.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
          >
            <BankCard
              bank={bank}
              selected={selectedId === bank.id}
              onSelect={() => handleSelect(bank.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* ─── AGGREGATE KPIs — Premium KPI Cards ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 gap-3 md:grid-cols-5"
      >
        <KpiCardPremium
          icon={Wallet}
          label="Capital Total"
          value={totals.capitalTotal}
          color="violet"
        />
        <KpiCardPremium
          icon={Users}
          label="Deuda Clientes"
          value={totals.deudaClientes}
          color="gold"
        />
        <KpiCardPremium
          icon={Truck}
          label="Adeudo Distrib."
          value={totals.adeudoDistribuidores}
          color="plasma"
        />
        <KpiCardPremium
          icon={ShoppingCart}
          label="Ventas del Mes"
          value={totals.ingresosTotal}
          color="emerald"
        />
        <KpiCardPremium
          icon={Receipt}
          label="Gastos del Mes"
          value={totals.gastosTotal}
          color="plasma"
        />
      </motion.div>

      {/* ─── CHARTS SECTION — Premium Chart Wrappers ─── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PremiumChartWrapper
          title="Distribución de Capital"
          subtitle="Por bóveda"
          glowColor="violet"
          className="h-64"
        >
          <DonutChart banks={banks} total={totals.capitalTotal} />
        </PremiumChartWrapper>
        <PremiumChartWrapper
          title="Flujo de Efectivo"
          subtitle="Últimos 12 meses"
          glowColor="emerald"
          className="h-64"
        >
          <CashFlowChart />
        </PremiumChartWrapper>
      </div>

      {/* ─── SELECTED BANK DETAIL ─── */}
      <AnimatePresence mode="wait">
        {selectedBank && (
          <BankDetail
            key={selectedBank.id}
            bank={selectedBank}
            onIngreso={handleIngreso}
            onGasto={handleGasto}
            onTransferencia={handleTransferencia}
          />
        )}
      </AnimatePresence>

      {/* ─── GLOBAL QUICK ACTIONS ─── */}
      <div className="flex gap-2">
        {[
          { label: "Ingreso", icon: Plus, color: "#10B981" },
          { label: "Gasto", icon: Receipt, color: "#EF4444" },
          { label: "Transferencia", icon: ArrowLeftRight, color: "#3B82F6" },
          { label: "Corte", icon: Eye, color: "#F59E0B" },
        ].map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate?.(`/bancos/${action.label.toLowerCase()}`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/4 px-3 py-3 text-xs font-medium text-white/70 transition-all hover:border-white/15 hover:text-white/90"
          >
            <action.icon className="h-4 w-4" style={{ color: action.color }} />
            {action.label}
          </motion.button>
        ))}
      </div>

      {/* ─── MODALES Ingreso / Gasto / Transferencia — Glass Form System ─── */}
      <BancosModals
        modalTipo={modalTipo}
        modalBancoId={modalBancoId}
        banks={banks}
        onClose={closeModal}
        onSubmitIngreso={submitIngreso}
        onSubmitGasto={submitGasto}
        onSubmitTransferencia={submitTransferencia}
      />
    </div>
  )
}

export default AuroraBancosPanelUnified
