// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧭 CHRONOS INFINITY 2030 — NAVIGATION INDEX
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// Exports centralizados para componentes de navegación
// Paleta: #8B00FF / #FFD700 / #FF1493 (⛔ CYAN PROHIBIDO)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HEADER NAVIGATION (PRINCIPAL)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  CHRONOS_COLORS,
  HeaderNavigation,
  Logo,
  NAV_ITEMS,
  NavItemButton,
  NotificationBell,
  SearchBar,
  UserMenu,
  type HeaderNavigationProps,
  type NavItem,
  type PanelId,
} from './HeaderNavigation'

// Header con Router conectado
export { HeaderNavigationClient } from './HeaderNavigationClient'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION (ALTERNATIVO)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  NavigationSidebar,
  CHRONOS_COLORS as SIDEBAR_COLORS,
  NAV_ITEMS as SIDEBAR_NAV_ITEMS,
  type NavigationSidebarProps,
  type NavItem as SidebarNavItem,
  type PanelId as SidebarPanelId,
} from './NavigationSidebar'
