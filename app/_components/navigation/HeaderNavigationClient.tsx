'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧭 CHRONOS INFINITY 2030 — HEADER NAVIGATION CLIENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// Wrapper cliente que conecta HeaderNavigation con Next.js Router
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { HeaderNavigation, type PanelId } from './HeaderNavigation'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAPEO DE RUTAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PANEL_ROUTES: Record<PanelId, string> = {
  dashboard: '/',
  ventas: '/ventas',
  clientes: '/clientes',
  bancos: '/bancos',
  almacen: '/almacen',
  ordenes: '/ordenes',
  distribuidores: '/distribuidores',
  movimientos: '/movimientos',
  fletes: '/fletes',
  cfo: '/cfo',
  ia: '/ia',
  settings: '/configuracion',
}

const ROUTE_TO_PANEL: Record<string, PanelId> = {
  '/': 'dashboard',
  '/ventas': 'ventas',
  '/clientes': 'clientes',
  '/bancos': 'bancos',
  '/almacen': 'almacen',
  '/ordenes': 'ordenes',
  '/distribuidores': 'distribuidores',
  '/movimientos': 'movimientos',
  '/fletes': 'fletes',
  '/cfo': 'cfo',
  '/ia': 'ia',
  '/configuracion': 'settings',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function HeaderNavigationClient() {
  const router = useRouter()
  const pathname = usePathname()

  // Determinar panel activo basado en la ruta actual
  const activePanel = useMemo((): PanelId => {
    // Coincidencia exacta
    if (ROUTE_TO_PANEL[pathname]) {
      return ROUTE_TO_PANEL[pathname]
    }

    // Coincidencia parcial (para rutas anidadas como /bancos/[id])
    for (const [route, panel] of Object.entries(ROUTE_TO_PANEL)) {
      if (route !== '/' && pathname.startsWith(route)) {
        return panel
      }
    }

    return 'dashboard'
  }, [pathname])

  // Navegar al cambiar panel
  const handlePanelChange = useCallback(
    (panel: PanelId) => {
      const route = PANEL_ROUTES[panel]
      if (route) {
        router.push(route)
      }
    },
    [router],
  )

  // Abrir búsqueda (Ctrl+K)
  const handleOpenSearch = useCallback(() => {
    // Disparar evento de búsqueda global
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }, [])

  // Abrir configuración
  const handleOpenSettings = useCallback(() => {
    router.push('/configuracion')
  }, [router])

  // Logout
  const handleLogout = useCallback(() => {
    // TODO: Implementar lógica de logout con auth provider
    router.push('/login')
  }, [router])

  return (
    <HeaderNavigation
      activePanel={activePanel}
      onPanelChange={handlePanelChange}
      onOpenSearch={handleOpenSearch}
      onOpenSettings={handleOpenSettings}
      onLogout={handleLogout}
      userName="Admin"
      notificationCount={3}
    />
  )
}

export default HeaderNavigationClient
