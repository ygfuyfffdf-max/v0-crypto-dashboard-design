/**
 * 🧭 CHRONOS HEADER 2026 - NAVEGACIÓN PREMIUM KOCMOC
 * ═══════════════════════════════════════════════════════════════════════════
 * Header con navegación organizada por Dropdowns, user menu, theme switcher y logo orbital animado
 * ✅ SUPREME INTEGRATION: Sound effects + SoundButton wrappers
 * ✅ DROPDOWN NAVIGATION: Estructura jerárquica para evitar sidebar
 * ═══════════════════════════════════════════════════════════════════════════
 */

"use client"

import { SoundButton } from "@/app/_components/chronos-2026/wrappers/SoundEnhancedComponents"
import { useSoundEffects } from "@/app/lib/audio/sound-system"
import {
  ArrowUpDown,
  Bell,
  ChevronDown,
  ClipboardList,
  CreditCard,
  Film,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  User,
  Users,
  Wallet,
  X,
  BarChart3,
  Layers,
  Database,
  Activity,
  Zap,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import React, { useEffect, useRef, useState } from "react"
import { ThemeToggle } from "../widgets/ThemeToggle"

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type PanelId =
  | "dashboard"
  | "bancos"
  | "ventas"
  | "ordenes"
  | "clientes"
  | "almacen"
  | "distribuidores"
  | "gastosAbonos"
  | "movimientos"
  | "reportes"
  | "configuracion"
  | "showcase"
  // Group IDs (not navigation targets necessarily, but used for keys)
  | "finanzas"
  | "comercial"
  | "inventario"
  | "sistema"

export type ThemeStyle = "modern" | "retro" | "genz" | "minimal"

export interface NavItem {
  id: PanelId
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
  children?: NavItem[]
}

export interface ChronosHeader2026Props {
  activePanel: PanelId
  onPanelChange: (panel: PanelId) => void
  theme?: ThemeStyle
  onThemeChange?: (theme: ThemeStyle) => void
  userName?: string
  userAvatar?: string
  notifications?: number
  className?: string
  /** Callback para abrir el panel MegaChronosNexusPanel */
  onOpenAIPanel?: () => void
  /** Callback para abrir el panel de notificaciones */
  onOpenNotifications?: () => void
  /** Callback para ir al perfil del usuario */
  onOpenProfile?: () => void
  /** Callback para abrir configuración */
  onOpenSettings?: () => void
  /** Callback para mostrar ayuda */
  onOpenHelp?: () => void
  /** Callback para cerrar sesión */
  onLogout?: () => void
  /** Slot opcional para reemplazar UserMenu (ej: Clerk UserButton) */
  userSlot?: React.ReactNode
}

// ═══════════════════════════════════════════════════════════════════════════
// NAV ITEMS STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════

const navItems: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    id: "finanzas",
    label: "Finanzas",
    icon: Wallet,
    children: [
      { id: "bancos", label: "Bancos", icon: Database, badge: 3 },
      { id: "gastosAbonos", label: "Gastos y Abonos", icon: CreditCard },
      { id: "movimientos", label: "Movimientos", icon: ArrowUpDown },
    ],
  },
  {
    id: "comercial",
    label: "Comercial",
    icon: ShoppingCart,
    children: [
      { id: "ventas", label: "Ventas", icon: ShoppingCart, badge: 3 },
      { id: "ordenes", label: "Órdenes", icon: ClipboardList },
      { id: "clientes", label: "Clientes", icon: Users },
      { id: "distribuidores", label: "Distribuidores", icon: Truck },
    ],
  },
  {
    id: "inventario",
    label: "Inventario",
    icon: Package,
    children: [
      { id: "almacen", label: "Almacén General", icon: Layers, badge: 2 },
    ],
  },
  {
    id: "sistema",
    label: "Sistema",
    icon: Settings,
    children: [
      { id: "reportes", label: "Analítica", icon: BarChart3 },
      { id: "configuracion", label: "Configuración", icon: Settings },
    ],
  },
]

// ═══════════════════════════════════════════════════════════════════════════
// KOCMOC COLORS
// ═══════════════════════════════════════════════════════════════════════════

const KOCMOC_COLORS = {
  violet: "#8B00FF",
  gold: "#FFD700",
  plasma: "#FF1493",
  white: "#FFFFFF",
  success: "#00FF88",
}

// ═══════════════════════════════════════════════════════════════════════════
// KOCMOC ORBITAL LOGO — Canvas animated logo
// ═══════════════════════════════════════════════════════════════════════════

function KocmocOrbitalLogo() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = 40 * dpr
    canvas.height = 40 * dpr
    ctx.scale(dpr, dpr)

    let time = 0
    const centerX = 20
    const centerY = 20

    const animate = () => {
      time += 0.02
      ctx.clearRect(0, 0, 40, 40)

      // Outer orbit ring
      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.15)"
      ctx.lineWidth = 0.5
      ctx.setLineDash([2, 3])
      ctx.arc(centerX, centerY, 14, 0, Math.PI * 2)
      ctx.stroke()
      ctx.setLineDash([])

      // Inner orbit ring
      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)"
      ctx.arc(centerX, centerY, 8, 0, Math.PI * 2)
      ctx.stroke()

      // Central core glow
      const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 6)
      coreGradient.addColorStop(0, KOCMOC_COLORS.white)
      coreGradient.addColorStop(0.5, "rgba(139, 0, 255, 0.5)")
      coreGradient.addColorStop(1, "transparent")
      ctx.beginPath()
      ctx.fillStyle = coreGradient
      ctx.arc(centerX, centerY, 6, 0, Math.PI * 2)
      ctx.fill()

      // Central dot
      ctx.beginPath()
      ctx.fillStyle = KOCMOC_COLORS.white
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2)
      ctx.fill()

      // Orbiting particles
      const orbitAngles = [time, time + Math.PI * 0.6, time + Math.PI * 1.3]
      orbitAngles.forEach((angle, i) => {
        const radius = 12 + i * 2
        const x = centerX + Math.cos(angle * (1 + i * 0.3)) * radius
        const y = centerY + Math.sin(angle * (1 + i * 0.3)) * radius * 0.5

        // Glow
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, 4)
        glowGradient.addColorStop(0, "rgba(255, 255, 255, 0.8)")
        glowGradient.addColorStop(1, "transparent")
        ctx.beginPath()
        ctx.fillStyle = glowGradient
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.fillStyle = KOCMOC_COLORS.white
        ctx.arc(x, y, 1.5 - i * 0.3, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [])

  return <canvas ref={canvasRef} width={40} height={40} className="h-10 w-10" aria-hidden="true" />
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME STYLES
// ═══════════════════════════════════════════════════════════════════════════

const themeStyles: { id: ThemeStyle; label: string; colors: string }[] = [
  { id: "modern", label: "Modern", colors: "bg-gradient-to-r from-purple-500 to-rose-500" },
  { id: "retro", label: "Retro", colors: "bg-gradient-to-r from-orange-500 to-pink-500" },
  { id: "genz", label: "Gen Z", colors: "bg-gradient-to-r from-lime-400 to-yellow-400" },
  { id: "minimal", label: "Minimal", colors: "bg-gradient-to-r from-gray-400 to-gray-600" },
]

// ═══════════════════════════════════════════════════════════════════════════
// NAV ITEM COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

function NavItemButton({
  item,
  isActive,
  onClick,
}: {
  item: NavItem
  isActive: boolean
  onClick: () => void
}) {
  const Icon = item.icon
  const { play, config } = useSoundEffects()

  const handleClick = () => {
    if (config.enabled) play("click")
    onClick()
  }

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Ir a ${item.label}`}
      aria-current={isActive ? "page" : undefined}
      className={`relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
        isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/5 hover:text-white"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="hidden xl:inline">{item.label}</span>
      <span className="sr-only xl:hidden">{item.label}</span>

      {/* Badge */}
      {item.badge && item.badge > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
          {item.badge}
        </span>
      )}

      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute inset-0 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/20 to-rose-500/20"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.button>
  )
}

function NavDropdown({
  item,
  activePanel,
  onPanelChange,
}: {
  item: NavItem
  activePanel: PanelId
  onPanelChange: (panel: PanelId) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const { play, config } = useSoundEffects()
  const Icon = item.icon
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Check if any child is active to highlight the parent
  const isChildActive = item.children?.some((child) => child.id === activePanel)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => {
          if (config.enabled) play("click")
          setIsOpen(!isOpen)
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all ${
          isOpen || isChildActive
            ? "bg-white/10 text-white"
            : "text-white/60 hover:bg-white/5 hover:text-white"
        }`}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden xl:inline">{item.label}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />

        {/* Active indicator for parent */}
        {isChildActive && (
          <motion.div
            layoutId="activeNavGroup"
            className="absolute inset-0 rounded-xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-rose-500/10"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-full left-0 z-50 mt-2 w-56 min-w-max overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0f]/95 p-2 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex flex-col gap-1">
              {item.children?.map((child) => (
                <button
                  key={child.id}
                  onClick={() => {
                    if (config.enabled) play("click")
                    onPanelChange(child.id)
                    setIsOpen(false)
                  }}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
                    activePanel === child.id
                      ? "bg-violet-500/20 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <child.icon className="h-4 w-4 opacity-70" />
                  <span>{child.label}</span>
                  {child.badge && child.badge > 0 && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {child.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// MOBILE NAV — Accordion style
// ═══════════════════════════════════════════════════════════════════════════

function MobileNav({
  isOpen,
  onClose,
  activePanel,
  onPanelChange,
}: {
  isOpen: boolean
  onClose: () => void
  activePanel: PanelId
  onPanelChange: (panel: PanelId) => void
}) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Dropdown Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 400 }}
            className="fixed top-20 right-4 left-4 z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f]/95 shadow-2xl backdrop-blur-xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <KocmocOrbitalLogo />
                <div>
                  <span className="text-lg font-bold tracking-wider text-white">KOCMOC</span>
                  <span className="block text-xs text-white/40">CHRONOS INFINITY</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-white/60 hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto p-3">
              {navItems.map((item) => {
                if (item.children) {
                  const isExpanded = expandedGroup === item.id
                  const isChildActive = item.children.some((c) => c.id === activePanel)

                  return (
                    <div key={item.id} className="overflow-hidden rounded-xl bg-white/5">
                      <button
                        onClick={() => setExpandedGroup(isExpanded ? null : item.id)}
                        className={`flex w-full items-center justify-between p-3 text-left ${
                          isChildActive ? "text-white" : "text-white/80"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          <span className="text-sm font-medium">{item.label}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="flex flex-col gap-1 border-t border-white/5 p-2">
                              {item.children.map((child) => (
                                <button
                                  key={child.id}
                                  onClick={() => {
                                    onPanelChange(child.id)
                                    onClose()
                                  }}
                                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                                    activePanel === child.id
                                      ? "bg-violet-500/20 text-white"
                                      : "text-white/60 hover:bg-white/5 hover:text-white"
                                  }`}
                                >
                                  <child.icon className="h-4 w-4" />
                                  <span>{child.label}</span>
                                  {child.badge && child.badge > 0 && (
                                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                                      {child.badge}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onPanelChange(item.id)
                      onClose()
                    }}
                    className={`flex items-center gap-2 rounded-xl px-3 py-3 text-left transition-all ${
                      activePanel === item.id
                        ? "border border-violet-500/30 bg-violet-500/20 text-white"
                        : "border border-transparent text-white/60 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// USER MENU
// ═══════════════════════════════════════════════════════════════════════════

interface UserMenuProps {
  userName: string
  userAvatar?: string
  onOpenProfile?: () => void
  onOpenSettings?: () => void
  onOpenHelp?: () => void
  onLogout?: () => void
}

function UserMenu({
  userName,
  userAvatar,
  onOpenProfile,
  onOpenSettings,
  onOpenHelp,
  onLogout,
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { play, config } = useSoundEffects()

  const handleAction = (action?: () => void) => {
    if (config.enabled) play("click")
    setIsOpen(false)
    action?.()
  }

  return (
    <div className="relative">
      <button
        onClick={() => {
          if (config.enabled) play("click")
          setIsOpen(!isOpen)
        }}
        className="flex items-center gap-2 rounded-xl bg-white/5 p-1.5 transition-all hover:bg-white/10"
        aria-label={`Menú de usuario: ${userName}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-rose-500 text-sm font-bold text-white">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span className="hidden text-sm text-white/80 md:inline">{userName}</span>
        <ChevronDown
          className={`h-4 w-4 text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              role="menu"
              className="absolute top-full right-0 z-50 mt-2 w-48 rounded-xl border border-white/10 bg-[#0a0a0f] p-2 shadow-xl"
            >
              <button
                role="menuitem"
                onClick={() => handleAction(onOpenProfile)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-all hover:bg-white/5 hover:text-white"
              >
                <User className="h-4 w-4" />
                Mi Perfil
              </button>
              <button
                role="menuitem"
                onClick={() => handleAction(onOpenSettings)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-all hover:bg-white/5 hover:text-white"
              >
                <Settings className="h-4 w-4" />
                Configuración
              </button>
              <button
                role="menuitem"
                onClick={() => handleAction(onOpenHelp)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 transition-all hover:bg-white/5 hover:text-white"
              >
                <HelpCircle className="h-4 w-4" />
                Ayuda
              </button>
              <div className="my-2 border-t border-white/10" />
              <button
                role="menuitem"
                onClick={() => handleAction(onLogout)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition-all hover:bg-red-500/10 hover:text-red-300"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME SWITCHER
// ═══════════════════════════════════════════════════════════════════════════

function ThemeSwitcher({
  currentTheme,
  onThemeChange,
}: {
  currentTheme: ThemeStyle
  onThemeChange: (theme: ThemeStyle) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  const currentStyle = themeStyles.find((t) => t.id === currentTheme) ?? themeStyles[0]
  if (!currentStyle) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl bg-white/5 p-2 transition-all hover:bg-white/10"
      >
        <div className={`h-4 w-4 rounded-full ${currentStyle.colors}`} />
        <span className="hidden text-xs text-white/60 md:inline">{currentStyle.label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 z-50 mt-2 w-40 rounded-xl border border-white/10 bg-[#0a0a0f] p-2 shadow-xl"
            >
              {themeStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    onThemeChange(style.id)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all ${
                    currentTheme === style.id
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full ${style.colors}`} />
                  {style.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function ChronosHeader2026({
  activePanel,
  onPanelChange,
  theme = "modern",
  onThemeChange,
  userName = "Admin",
  userAvatar,
  notifications = 0,
  className = "",
  onOpenAIPanel,
  onOpenNotifications,
  onOpenProfile,
  onOpenSettings,
  onOpenHelp,
  onLogout,
  userSlot,
}: ChronosHeader2026Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { play, config } = useSoundEffects()

  return (
    <>
      <header
        className={`sticky top-0 z-30 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl ${className}`}
      >
        <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-4 px-4">
          {/* Mobile menu button */}
          <SoundButton
            clickSound="click"
            onClick={() => setMobileNavOpen(true)}
            className="p-2 text-white/60 hover:text-white lg:hidden"
            variant="ghost"
          >
            <Menu className="h-5 w-5" />
          </SoundButton>

          {/* KOCMOC Logo */}
          <div className="mr-6 flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
              <KocmocOrbitalLogo />
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold tracking-wider text-white">KOCMOC</span>
              <span className="-mt-1 block text-[10px] tracking-widest text-white/40">
                CHRONOS INFINITY
              </span>
            </div>
          </div>

          {/* Navigation - NOW WITH DROPDOWNS */}
          <nav className="hidden flex-1 items-center gap-1 lg:flex">
            {navItems.map((item) =>
              item.children ? (
                <NavDropdown
                  key={item.id}
                  item={item}
                  activePanel={activePanel}
                  onPanelChange={onPanelChange}
                />
              ) : (
                <NavItemButton
                  key={item.id}
                  item={item}
                  isActive={activePanel === item.id}
                  onClick={() => onPanelChange(item.id)}
                />
              )
            )}
          </nav>

          {/* Right section */}
          <div className="ml-auto flex items-center gap-2">
            {/* Search */}
            <SoundButton
              clickSound="click"
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-xl bg-white/5 p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
              aria-label="Abrir búsqueda"
              variant="ghost"
            >
              <Search className="h-5 w-5" />
            </SoundButton>

            {/* Theme Toggle - NUEVO */}
            <ThemeToggle variant="icon" size="md" />

            {/* Notifications */}
            <SoundButton
              clickSound="notification"
              onClick={onOpenNotifications}
              className="relative rounded-xl bg-white/5 p-2 text-white/60 transition-all hover:bg-white/10 hover:text-white"
              aria-label={`Notificaciones${notifications > 0 ? `, ${notifications} nuevas` : ""}`}
              variant="ghost"
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                  {notifications > 9 ? "9+" : notifications}
                </span>
              )}
            </SoundButton>

            {/* Theme Switcher */}
            {onThemeChange && <ThemeSwitcher currentTheme={theme} onThemeChange={onThemeChange} />}

            {/* User Menu or custom slot (e.g. Clerk UserButton) */}
            {userSlot ?? (
              <UserMenu
                userName={userName}
                userAvatar={userAvatar}
                onOpenProfile={onOpenProfile}
                onOpenSettings={onOpenSettings}
                onOpenHelp={onOpenHelp}
                onLogout={onLogout}
              />
            )}
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-white/10"
            >
              <div className="mx-auto max-w-[1800px] px-4 py-3">
                <div className="relative mx-auto max-w-2xl">
                  <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    placeholder="Buscar ventas, clientes, productos..."
                    autoFocus
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pr-4 pl-12 text-white placeholder-white/40 focus:border-purple-500/50 focus:outline-none"
                  />
                  <button
                    onClick={() => setSearchOpen(false)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Navigation */}
      <MobileNav
        isOpen={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        activePanel={activePanel}
        onPanelChange={onPanelChange}
      />
    </>
  )
}

export default ChronosHeader2026
