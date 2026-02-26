"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * CHRONOS 2026 — APP SHELL
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Main application shell wrapping all dashboard routes.
 * Glass-morphism sidebar + premium header + animated content area.
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Landmark,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  X,
} from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState, type ReactNode } from "react"

import { cn } from "@/app/_lib/utils"
import { KocmocLogoCompact } from "../branding/KocmocLogo"
import { GlobalAIOrb } from "../ai/GlobalAIOrb"
import { ChronosHeader2026Client } from "./ChronosHeader2026Client"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const SIDEBAR_COLLAPSED_KEY = "chronos-sidebar-collapsed"
const SIDEBAR_WIDTH_COLLAPSED = 64
const SIDEBAR_WIDTH_EXPANDED = 260

interface NavItem {
  label: string
  icon: typeof LayoutDashboard
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Ventas", icon: ShoppingCart, path: "/ventas" },
  { label: "Bancos", icon: Landmark, path: "/bancos" },
  { label: "Ordenes", icon: ClipboardList, path: "/ordenes" },
  { label: "Clientes", icon: Users, path: "/clientes" },
  { label: "Distribuidores", icon: Truck, path: "/distribuidores" },
  { label: "Almacen", icon: Package, path: "/almacen" },
  { label: "Gastos", icon: Receipt, path: "/gastos-abonos" },
  { label: "Configuracion", icon: Settings, path: "/configuracion" },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function isActive(pathname: string, itemPath: string): boolean {
  if (itemPath === "/dashboard") return pathname === "/dashboard" || pathname === "/"
  return pathname === itemPath || pathname.startsWith(itemPath + "/")
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SIDEBAR NAV ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function SidebarNavItem({
  item,
  active,
  collapsed,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
}) {
  const Icon = item.icon

  return (
    <Link href={item.path} className="block">
      <motion.div
        className={cn(
          "group relative flex items-center gap-3 rounded-lg transition-colors duration-200",
          collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5",
          active ? "bg-white/6 text-white" : "text-white/50 hover:bg-white/4 hover:text-white/80"
        )}
        whileHover={{ x: collapsed ? 0 : 2 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.15 }}
      >
        {/* Violet active glow bar */}
        <AnimatePresence>
          {active && (
            <motion.div
              className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r-full"
              style={{
                background: "linear-gradient(180deg, #a78bfa, #7c3aed, #6d28d9)",
                boxShadow:
                  "0 0 12px 2px rgba(139, 92, 246, 0.5), 0 0 24px 4px rgba(139, 92, 246, 0.2)",
              }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </AnimatePresence>

        {/* Icon */}
        <motion.div
          className={cn(
            "relative shrink-0",
            active && "drop-shadow-[0_0_6px_rgba(139,92,246,0.5)]"
          )}
          animate={{ scale: active ? 1.1 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
        </motion.div>

        {/* Label — only when expanded */}
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.span
              className="truncate text-sm font-medium"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>

        {/* Tooltip when collapsed */}
        {collapsed && (
          <div className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
            <div className="rounded-lg border border-white/10 bg-gray-950/95 px-3 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-2xl backdrop-blur-xl">
              {item.label}
              <div className="absolute top-1/2 -left-1 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-white/10 bg-gray-950" />
            </div>
          </div>
        )}
      </motion.div>
    </Link>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Sidebar({
  collapsed,
  onToggle,
  pathname,
}: {
  collapsed: boolean
  onToggle: () => void
  pathname: string
}) {
  return (
    <motion.aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/6 lg:flex",
        "bg-black/60 backdrop-blur-xl"
      )}
      animate={{ width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Logo area — KOCMOC branding */}
      <div className="flex h-14 items-center border-b border-white/6 px-4">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="logo-full"
              className="flex items-center gap-2.5 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                <KocmocLogoCompact size={36} animated className="drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
              </div>
              <div>
                <span className="block text-base font-bold tracking-wider text-white">KOCMOC</span>
                <span className="-mt-0.5 block text-[10px] font-medium tracking-widest text-white/50">
                  CHRONOS INFINITY
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="logo-compact"
              className="mx-auto flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <KocmocLogoCompact size={40} animated className="drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-2 py-4">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.path}
            item={item}
            active={isActive(pathname, item.path)}
            collapsed={collapsed}
          />
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-white/6 p-2">
        <motion.button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center justify-center rounded-lg py-2.5 text-white/40 transition-colors hover:bg-white/4 hover:text-white/70",
            !collapsed && "justify-end px-3"
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </motion.div>
        </motion.button>
      </div>
    </motion.aside>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOBILE SIDEBAR OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function MobileSidebar({
  open,
  onClose,
  pathname,
}: {
  open: boolean
  onClose: () => void
  pathname: string
}) {
  // Close on route change
  const currentPath = usePathname()
  useEffect(() => {
    onClose()
  }, [currentPath, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-white/6 bg-black/80 backdrop-blur-2xl lg:hidden"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
          >
            {/* Header */}
            <div className="flex h-14 items-center justify-between border-b border-white/6 px-4">
              <div className="flex items-center gap-2.5">
                <KocmocLogoCompact size={36} animated className="drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]" />
                <div>
                  <span className="block text-base font-bold tracking-wider text-white">KOCMOC</span>
                  <span className="-mt-0.5 block text-[10px] font-medium tracking-widest text-white/50">CHRONOS INFINITY</span>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/6 hover:text-white"
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
              {NAV_ITEMS.map((item) => (
                <SidebarNavItem
                  key={item.path}
                  item={item}
                  active={isActive(pathname, item.path)}
                  collapsed={false}
                />
              ))}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// APP SHELL — MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()

  // ── Sidebar collapsed state (persisted) ──────────────────────────────────
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Hydrate collapsed state from localStorage
  useEffect(() => {
    setMounted(true)
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY)
      if (stored !== null) {
        setSidebarCollapsed(stored === "true")
      }
    } catch {
      // SSR or localStorage unavailable
    }
  }, [])

  // Persist collapsed state
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next))
      } catch {
        // localStorage unavailable
      }
      return next
    })
  }, [])

  // Sidebar width for main content offset
  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED

  // Desktop breakpoint: only apply margin on lg+
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    if (!mounted) return
    const mq = window.matchMedia("(min-width: 1024px)")
    const handler = () => setIsDesktop(mq.matches)
    handler()
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [mounted])

  // Don't render layout until mounted (prevents hydration mismatch)
  if (!mounted) {
    return (
      <div className="bg-c-void flex min-h-screen items-center justify-center">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-violet-500/30 border-t-violet-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="bg-c-void relative flex min-h-screen">
      {/* ── Desktop Sidebar ──────────────────────────────────────────────────── */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} pathname={pathname} />

      {/* ── Mobile Sidebar Overlay (ChronosHeader2026 has its own mobile nav) ─── */}
      <MobileSidebar open={false} onClose={() => {}} pathname={pathname} />

      {/* ── Main Content Area ────────────────────────────────────────────────── */}
      <motion.div
        className="flex min-h-screen flex-1 flex-col"
        animate={{ marginLeft: isDesktop ? sidebarWidth : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Header — KOCMOC premium with logo, nav dropdowns, search, notifications */}
        <ChronosHeader2026Client />

        {/* Page Content — min-height ensures panels are always visible */}
        <main className="relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              className="relative min-h-full w-full"
              initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </motion.div>

      {/* Global AI Orb — available on every panel */}
      <GlobalAIOrb />
    </div>
  )
}

export default AppShell
