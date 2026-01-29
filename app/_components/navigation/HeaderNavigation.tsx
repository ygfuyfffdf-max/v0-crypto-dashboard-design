'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧭 CHRONOS INFINITY 2030 — HEADER NAVIGATION PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// Barra de navegación superior con:
// - Logo animado con glow
// - Navegación principal con indicadores activos
// - Menú de usuario y notificaciones
// - Search bar con Command Palette
// - Responsive: hamburger menu en mobile
// Paleta: #8B00FF / #FFD700 / #FF1493 (⛔ CYAN PROHIBIDO)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeftRight,
  Bell,
  Boxes,
  Building2,
  ChevronDown,
  ClipboardList,
  Command,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useState } from 'react'

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
  | 'ia'
  | 'settings'

interface NavItem {
  id: PanelId
  label: string
  icon: LucideIcon
  color: string
  badge?: number
  isNew?: boolean
}

interface HeaderNavigationProps {
  activePanel?: PanelId
  onPanelChange?: (panel: PanelId) => void
  userName?: string
  userAvatar?: string
  notificationCount?: number
  onOpenNotifications?: () => void
  onOpenSearch?: () => void
  onOpenSettings?: () => void
  onLogout?: () => void
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
  { id: 'ia', label: 'IA', icon: Zap, color: CHRONOS_COLORS.violet, isNew: true },
  { id: 'cfo', label: 'CFO', icon: Building2, color: CHRONOS_COLORS.gold, isNew: true },
]

const SPRING_CONFIG = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: LOGO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function Logo() {
  return (
    <div className="flex items-center gap-3">
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
      <div className="hidden sm:block">
        <h1 className="text-lg font-bold whitespace-nowrap text-white">CHRONOS</h1>
        <p className="-mt-0.5 text-[10px] tracking-widest text-white/40 uppercase">Infinity 2030</p>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: NAV ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NavItemButtonProps {
  item: NavItem
  isActive: boolean
  onClick: () => void
}

function NavItemButton({ item, isActive, onClick }: NavItemButtonProps) {
  const Icon = item.icon

  return (
    <motion.button
      onClick={onClick}
      aria-label={`Ir a ${item.label}`}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-2 rounded-xl px-3 py-2 transition-all duration-300',
        'text-sm font-medium whitespace-nowrap',
        isActive ? 'text-white' : 'text-white/60 hover:bg-white/5 hover:text-white',
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Active background */}
      {isActive && (
        <motion.div
          layoutId="activeNavBg"
          className="absolute inset-0 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${item.color}20, ${item.color}10)`,
            border: `1px solid ${item.color}30`,
            boxShadow: `0 0 20px ${item.color}20`,
          }}
          transition={SPRING_CONFIG}
        />
      )}

      {/* Icon */}
      <Icon
        className="relative z-10 h-4 w-4"
        aria-hidden="true"
        style={{ color: isActive ? item.color : 'currentColor' }}
      />

      {/* Label - hidden on smaller screens */}
      <span className="relative z-10 hidden lg:inline">{item.label}</span>
      <span className="sr-only lg:hidden">{item.label}</span>

      {/* Badge */}
      {item.badge && (
        <span
          className="absolute -top-1 -right-1 z-20 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-black"
          style={{ backgroundColor: CHRONOS_COLORS.gold }}
        >
          {item.badge}
        </span>
      )}

      {/* New badge */}
      {item.isNew && (
        <span
          className="absolute -top-1 -right-1 z-20 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-black uppercase"
          style={{ backgroundColor: CHRONOS_COLORS.success }}
        >
          New
        </span>
      )}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: SEARCH BAR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SearchBarProps {
  onClick?: () => void
}

function SearchBar({ onClick }: SearchBarProps) {
  return (
    <motion.button
      onClick={onClick}
      aria-label="Abrir búsqueda (Ctrl+K)"
      className={cn(
        'flex items-center gap-3 rounded-xl px-4 py-2.5',
        'border border-white/10 bg-white/5',
        'transition-all hover:border-white/20 hover:bg-white/10',
        'text-white/50 hover:text-white/70',
        'w-48 lg:w-64',
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Search className="h-4 w-4" aria-hidden="true" />
      <span className="flex-1 text-left text-sm">Buscar...</span>
      <kbd
        className="hidden items-center gap-1 rounded bg-white/10 px-2 py-0.5 text-[10px] sm:flex"
        aria-hidden="true"
      >
        <Command className="h-3 w-3" />K
      </kbd>
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: USER MENU
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UserMenuProps {
  userName?: string
  userAvatar?: string
  onOpenSettings?: () => void
  onLogout?: () => void
}

function UserMenu({ userName = 'Admin', userAvatar, onOpenSettings, onLogout }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Menú de usuario: ${userName}`}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        className={cn(
          'flex items-center gap-2 rounded-xl px-3 py-2',
          'border border-white/10 bg-white/5',
          'transition-all hover:bg-white/10',
        )}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Avatar */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold"
          style={{
            background: `linear-gradient(135deg, ${CHRONOS_COLORS.violet}, ${CHRONOS_COLORS.magenta})`,
          }}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={`Avatar de ${userName}`}
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <span aria-hidden="true">{userName.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <span className="hidden text-sm font-medium text-white md:block">{userName}</span>
        <ChevronDown
          className={cn('h-4 w-4 text-white/50 transition-transform', isOpen && 'rotate-180')}
          aria-hidden="true"
        />
      </motion.button>

      {/* Dropdown */}
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
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={SPRING_CONFIG}
              className={cn(
                'absolute top-full right-0 z-50 mt-2 w-56',
                'rounded-xl bg-black/95 backdrop-blur-2xl',
                'overflow-hidden border border-white/10 shadow-2xl',
              )}
            >
              {/* User info */}
              <div className="border-b border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${CHRONOS_COLORS.violet}, ${CHRONOS_COLORS.magenta})`,
                    }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-white">{userName}</p>
                    <p className="text-xs text-white/50">Administrador</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2">
                <button
                  onClick={() => {
                    onOpenSettings?.()
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <Settings className="h-4 w-4" />
                  <span className="text-sm">Configuración</span>
                </button>

                <button
                  onClick={() => {
                    onLogout?.()
                    setIsOpen(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-400/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm">Cerrar sesión</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: NOTIFICATION BELL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NotificationBellProps {
  count?: number
  onClick?: () => void
}

function NotificationBell({ count = 0, onClick }: NotificationBellProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center rounded-xl',
        'border border-white/10 bg-white/5',
        'transition-all hover:bg-white/10',
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={
          count > 0
            ? {
                rotate: [0, -10, 10, -10, 10, 0],
              }
            : {}
        }
        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
      >
        <Bell className="h-5 w-5 text-white" />
      </motion.div>

      {/* Badge */}
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-black"
          style={{ backgroundColor: CHRONOS_COLORS.gold }}
        >
          {count > 99 ? '99+' : count}
        </motion.span>
      )}
    </motion.button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE: MOBILE MENU
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  activePanel: PanelId
  onPanelChange?: (panel: PanelId) => void
}

function MobileMenu({ isOpen, onClose, activePanel, onPanelChange }: MobileMenuProps) {
  const handleNavClick = (panel: PanelId) => {
    onPanelChange?.(panel)
    onClose()
  }

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

          {/* Menu Panel */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={SPRING_CONFIG}
            className={cn(
              'fixed top-20 right-4 left-4 z-50 lg:hidden',
              'rounded-2xl bg-black/95 backdrop-blur-2xl',
              'overflow-hidden border border-white/10 shadow-2xl',
            )}
          >
            {/* Nav Items */}
            <div className="grid grid-cols-2 gap-2 p-4">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                const isActive = activePanel === item.id

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      'relative flex items-center gap-3 rounded-xl p-4 transition-all',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white',
                    )}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Icon
                      className="h-5 w-5"
                      style={{ color: isActive ? item.color : 'currentColor' }}
                    />
                    <span className="text-sm font-medium">{item.label}</span>

                    {/* Badge */}
                    {item.badge && (
                      <span
                        className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-black"
                        style={{ backgroundColor: CHRONOS_COLORS.gold }}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.isNew && (
                      <span
                        className="absolute top-2 right-2 rounded-full px-1.5 py-0.5 text-[8px] font-bold text-black uppercase"
                        style={{ backgroundColor: CHRONOS_COLORS.success }}
                      >
                        New
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function HeaderNavigation({
  activePanel = 'dashboard',
  onPanelChange,
  userName = 'Admin',
  userAvatar,
  notificationCount = 0,
  onOpenNotifications,
  onOpenSearch,
  onOpenSettings,
  onLogout,
  className,
}: HeaderNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Close mobile menu on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMobileMenuOpen(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'fixed top-0 right-0 left-0 z-50',
          'border-b border-white/10 bg-black/80 backdrop-blur-2xl',
          className,
        )}
      >
        <div className="mx-auto max-w-[1920px] px-4 lg:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Left section: Logo + Mobile menu button */}
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl lg:hidden',
                  'border border-white/10 bg-white/5',
                  'transition-all hover:bg-white/10',
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5 text-white" />
                ) : (
                  <Menu className="h-5 w-5 text-white" />
                )}
              </motion.button>

              <Logo />
            </div>

            {/* Center section: Navigation (desktop) */}
            <nav className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-1.5 lg:flex">
              {NAV_ITEMS.map((item) => (
                <NavItemButton
                  key={item.id}
                  item={item}
                  isActive={activePanel === item.id}
                  onClick={() => onPanelChange?.(item.id)}
                />
              ))}
            </nav>

            {/* Right section: Search + Notifications + User */}
            <div className="flex items-center gap-3">
              <SearchBar onClick={onOpenSearch} />

              <NotificationBell count={notificationCount} onClick={onOpenNotifications} />

              <UserMenu
                userName={userName}
                userAvatar={userAvatar}
                onOpenSettings={onOpenSettings}
                onLogout={onLogout}
              />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activePanel={activePanel}
        onPanelChange={onPanelChange}
      />

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { CHRONOS_COLORS, Logo, NAV_ITEMS, NavItemButton, NotificationBell, SearchBar, UserMenu }
export type { HeaderNavigationProps, NavItem, PanelId }
export default HeaderNavigation
