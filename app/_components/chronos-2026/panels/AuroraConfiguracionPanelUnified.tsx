"use client"

import { useTheme, type ThemeColor } from "@/app/_components/providers/ThemeProvider"
import { cn } from "@/app/_lib/utils"
import {
  Bell,
  Database,
  Download,
  Lock,
  Monitor,
  Moon,
  Palette,
  Settings,
  Sun,
  Trash2,
  User,
} from "lucide-react"
import { motion } from "motion/react"
import { useState } from "react"

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

const PALETTE_COLORS: { id: ThemeColor; hex: string; label: string }[] = [
  { id: "violet", hex: "#8B5CF6", label: "Violeta" },
  { id: "blue", hex: "#3B82F6", label: "Azul" },
  { id: "emerald", hex: "#10B981", label: "Esmeralda" },
  { id: "rose", hex: "#F43F5E", label: "Rosa" },
  { id: "amber", hex: "#F59E0B", label: "Ámbar" },
  { id: "cyan", hex: "#06B6D4", label: "Cyan" },
]

const THEME_MODES = [
  { id: "light" as const, label: "Claro", icon: Sun },
  { id: "dark" as const, label: "Oscuro", icon: Moon },
  { id: "system" as const, label: "Sistema", icon: Monitor },
]

const FONT_SIZES = [
  { id: "sm" as const, label: "S" },
  { id: "md" as const, label: "M" },
  { id: "lg" as const, label: "L" },
]

const RADIUS_OPTIONS = [
  { id: "sm" as const, label: "Cuadrado" },
  { id: "lg" as const, label: "Redondeado" },
  { id: "full" as const, label: "Píldora" },
]

// ═══════════════════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════════════════

function GlassToggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      aria-pressed={enabled}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
        enabled ? "bg-violet-500/80" : "bg-white/10"
      )}
    >
      <motion.div
        className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-lg"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

function SectionCard({
  icon,
  title,
  desc,
  children,
  delay = 0,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  children: React.ReactNode
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-2xl border border-white/6 bg-white/3 p-5 backdrop-blur-md neo-tactile-hover-elevate"
    >
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-xl bg-white/6 p-2">{icon}</div>
        <div>
          <h3 className="text-sm font-semibold text-white/90">{title}</h3>
          <p className="text-xs text-white/40">{desc}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  )
}

function ToggleRow({
  label,
  desc,
  enabled,
  onChange,
}: {
  label: string
  desc: string
  enabled: boolean
  onChange: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-white/80">{label}</p>
        <p className="text-xs text-white/35">{desc}</p>
      </div>
      <GlassToggle enabled={enabled} onChange={onChange} />
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function AuroraConfiguracionPanelUnified({ className }: { className?: string }) {
  const {
    theme,
    setThemeMode,
    setThemeColor,
    setFontSize,
    setBorderRadius,
    toggleAnimations,
    toggleSounds,
  } = useTheme()

  const [notifEmail, setNotifEmail] = useState(true)
  const [notifPush, setNotifPush] = useState(true)
  const [notifStock, setNotifStock] = useState(false)
  const [notifPayments, setNotifPayments] = useState(true)

  const glassBtn = (active: boolean) =>
    cn(
      "cursor-pointer rounded-xl border px-4 py-2 text-xs font-medium transition-all duration-200",
      active
        ? "border-violet-500/40 bg-white/10 text-white shadow-lg shadow-violet-500/10"
        : "border-white/6 bg-white/3 text-white/50 hover:bg-white/6 hover:text-white/70"
    )

  return (
    <div className={cn("space-y-6", className)}>
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <div className="rounded-2xl bg-linear-to-br from-violet-600/80 to-purple-600/80 p-3 shadow-lg shadow-violet-500/20">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configuración</h1>
          <p className="text-sm text-white/40">Personalización del sistema</p>
        </div>
      </div>

      {/* ── Apariencia ── */}
      <SectionCard
        icon={<Palette className="h-5 w-5 text-violet-400" />}
        title="Apariencia"
        desc="Tema, colores y tipografía"
        delay={0.05}
      >
        {/* Theme mode */}
        <div>
          <p className="mb-2 text-xs text-white/50">Tema</p>
          <div className="flex gap-2">
            {THEME_MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setThemeMode(m.id)}
                className={cn(
                  glassBtn(theme.mode === m.id),
                  "flex flex-1 items-center justify-center gap-2"
                )}
              >
                <m.icon className="h-3.5 w-3.5" /> {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Color palette */}
        <div>
          <p className="mb-2 text-xs text-white/50">Paleta de color</p>
          <div className="flex gap-3">
            {PALETTE_COLORS.map((c) => (
              <button
                key={c.id}
                onClick={() => setThemeColor(c.id)}
                title={c.label}
                className={cn(
                  "h-8 w-8 cursor-pointer rounded-full transition-all duration-200",
                  theme.color === c.id
                    ? "scale-110 ring-2 ring-white/60 ring-offset-2 ring-offset-black"
                    : "opacity-60 hover:scale-105 hover:opacity-100"
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>

        {/* Font size */}
        <div>
          <p className="mb-2 text-xs text-white/50">Tamaño de fuente</p>
          <div className="flex gap-2">
            {FONT_SIZES.map((f) => (
              <button
                key={f.id}
                onClick={() => setFontSize(f.id)}
                className={cn(glassBtn(theme.fontSize === f.id), "flex-1")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Border radius */}
        <div>
          <p className="mb-2 text-xs text-white/50">Bordes</p>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setBorderRadius(r.id)}
                className={cn(glassBtn(theme.borderRadius === r.id), "flex-1")}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <ToggleRow
          label="Animaciones"
          desc="Transiciones y efectos de movimiento"
          enabled={theme.animations}
          onChange={toggleAnimations}
        />
        <ToggleRow
          label="Sonidos"
          desc="Efectos sonoros de interfaz"
          enabled={theme.sounds}
          onChange={toggleSounds}
        />
      </SectionCard>

      {/* ── Cuenta ── */}
      <SectionCard
        icon={<User className="h-5 w-5 text-blue-400" />}
        title="Cuenta"
        desc="Información de usuario y sesión"
        delay={0.1}
      >
        {/* User info */}
        <div className="flex items-center gap-4 rounded-xl border border-white/6 bg-white/4 p-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-blue-500 text-sm font-bold text-white">
            A
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white/90">Administrador</p>
            <p className="truncate text-xs text-white/40">admin@chronos.app</p>
          </div>
          <span className="shrink-0 rounded-full border border-violet-500/20 bg-violet-500/15 px-2.5 py-1 text-[10px] font-medium text-violet-400">
            Admin
          </span>
        </div>

        {/* Change password */}
        <button
          disabled
          className={cn(
            glassBtn(false),
            "flex w-full cursor-not-allowed items-center justify-center gap-2 opacity-40"
          )}
        >
          <Lock className="h-3.5 w-3.5" /> Cambiar contraseña
        </button>

        {/* Session info */}
        <div className="space-y-2 rounded-xl border border-white/6 bg-white/4 p-3">
          <div className="flex justify-between">
            <span className="text-xs text-white/40">Último acceso</span>
            <span className="text-xs text-white/70">Hoy, 14:32</span>
          </div>
          <div className="flex justify-between">
            <span className="text-xs text-white/40">Dispositivo</span>
            <span className="text-xs text-white/70">Windows 11 — Chrome</span>
          </div>
        </div>
      </SectionCard>

      {/* ── Notificaciones ── */}
      <SectionCard
        icon={<Bell className="h-5 w-5 text-amber-400" />}
        title="Notificaciones"
        desc="Alertas y avisos del sistema"
        delay={0.15}
      >
        <ToggleRow
          label="Email"
          desc="Resúmenes diarios por correo"
          enabled={notifEmail}
          onChange={() => setNotifEmail((v) => !v)}
        />
        <ToggleRow
          label="Push"
          desc="Notificaciones en tiempo real"
          enabled={notifPush}
          onChange={() => setNotifPush((v) => !v)}
        />
        <ToggleRow
          label="Alertas de stock"
          desc="Aviso cuando el inventario es bajo"
          enabled={notifStock}
          onChange={() => setNotifStock((v) => !v)}
        />
        <ToggleRow
          label="Alertas de pagos"
          desc="Recordatorios de pagos pendientes"
          enabled={notifPayments}
          onChange={() => setNotifPayments((v) => !v)}
        />
      </SectionCard>

      {/* ── Datos ── */}
      <SectionCard
        icon={<Database className="h-5 w-5 text-emerald-400" />}
        title="Datos"
        desc="Exportar, limpiar y versión del sistema"
        delay={0.2}
      >
        <div className="flex gap-3">
          <button className={cn(glassBtn(false), "flex flex-1 items-center justify-center gap-2")}>
            <Download className="h-3.5 w-3.5" /> Exportar datos
          </button>
          <button
            className={cn(
              glassBtn(false),
              "flex flex-1 items-center justify-center gap-2 hover:border-red-500/30 hover:text-red-400"
            )}
          >
            <Trash2 className="h-3.5 w-3.5" /> Limpiar caché
          </button>
        </div>
        <div className="pt-2 text-center">
          <p className="text-[10px] font-medium tracking-[0.2em] text-white/20 uppercase">
            CHRONOS INFINITY v2.0.2026
          </p>
        </div>
      </SectionCard>
    </div>
  )
}
