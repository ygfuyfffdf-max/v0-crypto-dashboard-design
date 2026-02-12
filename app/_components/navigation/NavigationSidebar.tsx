'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧭 CHRONOS INFINITY 2030 — NAVIGATION SIDEBAR PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// Barra lateral de navegación con:
// - Animaciones 3D y glassmorphism
// - Indicadores activos con glow
// - Tooltips expandibles
// - Responsive: colapsable en mobile
// Paleta: #8B00FF / #FFD700 / #FF1493 (⛔ CYAN PROHIBIDO)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Boxes,
  Building2,
  ChevronLeft,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { useCallback, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type PanelId =
  | 'dashboard'
  | 'ventas'
  | 'clientes'
  | 'bancos'
  | 'almacen'
  | 'ordenes'
  | 'distribuidores'
  | 'movimientos'
  | 'fletes'
  | 'cfo'
  | 'settings'

interface NavItem {
  id: PanelId
  label: string
  icon: LucideIcon
  color: string
  badge?: number
  isNew?: boolean
}

interface NavigationSidebarProps {
  activePanel: PanelId
  onPanelChange: (panel: PanelId) => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  className?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const CHRONOS_COLORS = {
  void: '#000000',
  violet: '#8B00FF',
  gold: '#FFD700',
  magenta: '#FF1493',
  success: '#00FF88',
  warning: '#FFB020',
  error: '#FF4444',
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: CHRONOS_COLORS.violet },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart, color: CHRONOS_COLORS.gold, badge: 5 },
  { id: 'clientes', label: 'Clientes', icon: Users, color: CHRONOS_COLORS.magenta },
  { id: 'bancos', label: 'Bancos', icon: Wallet, color: CHRONOS_COLORS.gold },
  { id: 'almacen', label: 'Almacén', icon: Boxes, color: CHRONOS_COLORS.violet },
  { id: 'ordenes', label: 'Órdenes', icon: ClipboardList, color: CHRONOS_COLORS.warning },
  { id: 'distribuidores', label: 'Distribuidores', icon: Package, color: CHRONOS_COLORS.magenta },
  { id: 'movimientos', label: 'Movimientos', icon: ArrowLeftRight, color: CHRONOS_COLORS.success },
  { id: 'fletes', label: 'Fletes', icon: Truck, color: '#4169E1' },
  { id: 'cfo', label: 'CFO', icon: Building2, color: CHRONOS_COLORS.gold, isNew: true },
]

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: NAV ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NavItemButtonProps {
  item: NavItem
  isActive: boolean
  isCollapsed: boolean
  onClick: () => void
  delay?: number
}

function NavItemButton({ item, isActive, isCollapsed, onClick, delay = 0 }: NavItemButtonProps) {
  const Icon = item.icon
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      aria-label={`Ir a ${item.label}`}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl p-3 transition-all duration-300',
        'group focus:ring-2 focus:ring-violet-500/50 focus:outline-none',
        isCollapsed ? 'justify-center' : 'justify-start',
        isActive ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white',
      )}
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${item.color}20, transparent)`,
            boxShadow: `0 0 30px ${item.color}30, inset 0 0 20px ${item.color}10`,
          }}
          transition={SPRING_CONFIG}
        />
      )}

      {/* Left glow bar */}
      {isActive && (
        <motion.div
          layoutId="glowBar"
          className="absolute top-1/2 left-0 h-8 w-1 -translate-y-1/2 rounded-r-full"
          style={{
            backgroundColor: item.color,
            boxShadow: `0 0 15px ${item.color}`,
          }}
          transition={SPRING_CONFIG}
        />
      )}

      {/* Icon */}
      <div className="relative z-10 flex items-center justify-center">
        <motion.div
          animate={{
            scale: isActive || isHovered ? 1.1 : 1,
            rotate: isHovered ? [0, -5, 5, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <Icon
            className="h-5 w-5"
            style={{
              color: isActive ? item.color : 'currentColor',
              filter: isActive ? `drop-shadow(0 0 6px ${item.color})` : 'none',
            }}
          />
        </motion.div>

        {/* Badge */}
        {item.badge && (
          <span
            className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-black"
            style={{ backgroundColor: CHRONOS_COLORS.gold }}
          >
            {item.badge}
          </span>
        )}

        {/* New badge */}
        {item.isNew && (
          <span
            className="absolute -top-1.5 -right-2 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-black uppercase"
            style={{ backgroundColor: CHRONOS_COLORS.success }}
          >
            New
          </span>
        )}
      </div>

      {/* Label */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 overflow-hidden text-sm font-medium whitespace-nowrap"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip for collapsed state */}
      <AnimatePresence>
        {isCollapsed && isHovered && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            className="absolute left-full z-50 ml-3 rounded-lg border border-white/20 bg-white/10 px-3 py-2 whitespace-nowrap backdrop-blur-xl"
          >
            <span className="text-sm font-medium text-white">{item.label}</span>
            <div
              className="absolute top-1/2 left-0 h-2 w-2 -translate-x-1 -translate-y-1/2 rotate-45"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: LOGO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Logo({ isCollapsed }: { isCollapsed: boolean }) {
  return (
    <div
      className={cn(
        'mb-4 flex items-center gap-3 px-3 py-4',
        isCollapsed ? 'justify-center' : 'justify-start',
      )}
    >
      {/* Logo orb */}
      <motion.div
        className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl"
        style={{
          background: `linear-gradient(135deg, ${CHRONOS_COLORS.violet}, ${CHRONOS_COLORS.magenta})`,
          boxShadow: `0 0 20px ${CHRONOS_COLORS.violet}50`,
        }}
        animate={{
          boxShadow: [
            `0 0 20px ${CHRONOS_COLORS.violet}50`,
            `0 0 30px ${CHRONOS_COLORS.magenta}50`,
            `0 0 20px ${CHRONOS_COLORS.violet}50`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Zap className="h-5 w-5 text-white" />
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
          }}
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Logo text */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <h1 className="text-lg font-bold whitespace-nowrap text-white">CHRONOS</h1>
            <p className="text-[10px] tracking-widest text-white/40 uppercase">Infinity 2030</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function NavigationSidebar({
  activePanel,
  onPanelChange,
  isCollapsed = false,
  onToggleCollapse,
  className,
}: NavigationSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleNavClick = useCallback(
    (panel: PanelId) => {
      onPanelChange(panel)
      setIsMobileOpen(false)
    },
    [onPanelChange],
  )

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <Logo isCollapsed={isCollapsed} />

      {/* Divider */}
      <div className="mx-3 mb-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Navigation Items */}
      <nav className="scrollbar-thin scrollbar-thumb-white/10 flex-1 space-y-1 overflow-y-auto px-3">
        {NAV_ITEMS.map((item, index) => (
          <NavItemButton
            key={item.id}
            item={item}
            isActive={activePanel === item.id}
            isCollapsed={isCollapsed}
            onClick={() => handleNavClick(item.id)}
            delay={index * 0.03}
          />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-2 p-3">
        {/* Divider */}
        <div className="mb-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Settings */}
        <NavItemButton
          item={{
            id: 'settings',
            label: 'Configuración',
            icon: Settings,
            color: CHRONOS_COLORS.violet,
          }}
          isActive={activePanel === 'settings'}
          isCollapsed={isCollapsed}
          onClick={() => handleNavClick('settings')}
        />

        {/* Collapse button */}
        {onToggleCollapse && (
          <motion.button
            onClick={onToggleCollapse}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl p-3',
              'text-white/50 transition-colors hover:bg-white/5 hover:text-white',
              isCollapsed ? 'justify-center' : 'justify-start',
            )}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div animate={{ rotate: isCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronLeft className="h-5 w-5" />
            </motion.div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm"
                >
                  Colapsar
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 260 }}
        transition={SPRING_CONFIG}
        className={cn(
          'hidden h-screen flex-col lg:flex',
          'bg-gradient-to-b from-black/80 via-black/60 to-black/80',
          'border-r border-white/10 backdrop-blur-2xl',
          'fixed top-0 left-0 z-40',
          className,
        )}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Menu Button */}
      <motion.button
        onClick={() => setIsMobileOpen(true)}
        aria-label="Abrir menú de navegación"
        aria-expanded={isMobileOpen}
        className={cn(
          'fixed top-4 left-4 z-50 lg:hidden',
          'flex h-12 w-12 items-center justify-center rounded-xl',
          'border border-white/10 bg-black/80 backdrop-blur-xl',
          'text-white transition-colors hover:bg-white/10',
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </motion.button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* Mobile Sidebar */}
            <motion.aside
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={SPRING_CONFIG}
              className={cn(
                'fixed top-0 bottom-0 left-0 z-50 w-72 lg:hidden',
                'bg-gradient-to-b from-black/95 via-black/90 to-black/95',
                'border-r border-white/10 backdrop-blur-2xl',
                'flex flex-col',
              )}
            >
              {/* Close button */}
              <button
                onClick={() => setIsMobileOpen(false)}
                aria-label="Cerrar menú de navegación"
                className="absolute top-3 right-3 rounded-lg p-2 transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5 text-white/50" aria-hidden="true" />
              </button>

              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { CHRONOS_COLORS, NAV_ITEMS }
export type { NavigationSidebarProps, NavItem, PanelId }
export default NavigationSidebar
