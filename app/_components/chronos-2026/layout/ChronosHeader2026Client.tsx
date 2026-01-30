"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧭 CHRONOS HEADER 2026 CLIENT — CON ROUTER NEXT.JS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Wrapper que conecta ChronosHeader2026 con el router de Next.js
 * Incluye: Navegación, Notificaciones, User Menu, Tema
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import {
  ChronosHeader2026,
  type PanelId,
  type ThemeStyle,
} from "@/app/_components/chronos-2026/layout/ChronosHeader2026"
import { NotificationsPanel } from "@/app/_components/modals/NotificationsPanel"
import { usePathname, useRouter } from "next/navigation"
import { useCallback, useMemo, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAPEO DE RUTAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PANEL_ROUTES: Record<PanelId, string> = {
  dashboard: "/",
  bancos: "/bancos",
  ventas: "/ventas",
  ordenes: "/ordenes",
  clientes: "/clientes",
  almacen: "/almacen",
  distribuidores: "/distribuidores",
  movimientos: "/movimientos",
  gastosAbonos: "/gastos-abonos",
  reportes: "/reportes",
  configuracion: "/configuracion",
  showcase: "/showcase/visual",
}

const ROUTE_TO_PANEL: Record<string, PanelId> = {
  "/": "dashboard",
  "/bancos": "bancos",
  "/ventas": "ventas",
  "/ordenes": "ordenes",
  "/clientes": "clientes",
  "/almacen": "almacen",
  "/distribuidores": "distribuidores",
  "/movimientos": "movimientos",
  "/gastos-abonos": "gastosAbonos",
  "/reportes": "reportes",
  "/configuracion": "configuracion",
  "/showcase": "showcase",
  "/showcase/visual": "showcase",
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function ChronosHeader2026Client() {
  const router = useRouter()
  const pathname = usePathname()
  const [theme, setTheme] = useState<ThemeStyle>("modern")
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Determinar panel activo basado en la ruta actual
  const activePanel = useMemo((): PanelId => {
    // Coincidencia exacta
    if (ROUTE_TO_PANEL[pathname]) {
      return ROUTE_TO_PANEL[pathname]
    }

    // Coincidencia parcial (para rutas anidadas como /bancos/[id])
    for (const [route, panel] of Object.entries(ROUTE_TO_PANEL)) {
      if (route !== "/" && pathname.startsWith(route)) {
        return panel
      }
    }

    return "dashboard"
  }, [pathname])

  // Navegar al cambiar panel
  const handlePanelChange = useCallback(
    (panel: PanelId) => {
      const route = PANEL_ROUTES[panel]
      if (route) {
        router.push(route)
      }
    },
    [router]
  )

  // Cambiar tema visual (modern, retro, genz, minimal)
  const handleThemeChange = useCallback((newTheme: ThemeStyle) => {
    setTheme(newTheme)
  }, [])

  // Abrir panel de notificaciones
  const handleOpenNotifications = useCallback(() => {
    setNotificationsOpen(true)
  }, [])

  // Cerrar panel de notificaciones
  const handleCloseNotifications = useCallback(() => {
    setNotificationsOpen(false)
  }, [])

  // Ir al perfil del usuario
  const handleOpenProfile = useCallback(() => {
    router.push("/perfil")
  }, [router])

  // Ir a configuración
  const handleOpenSettings = useCallback(() => {
    router.push("/configuracion")
  }, [router])

  // Mostrar ayuda
  const handleOpenHelp = useCallback(() => {
    router.push("/ayuda")
  }, [router])

  // Cerrar sesión
  const handleLogout = useCallback(() => {
    // TODO: Integrar con sistema de autenticación real
    // Por ahora solo redirige al login
    router.push("/login")
  }, [router])

  return (
    <>
      <ChronosHeader2026
        activePanel={activePanel}
        onPanelChange={handlePanelChange}
        theme={theme}
        onThemeChange={handleThemeChange}
        userName="Admin"
        notifications={3}
        onOpenNotifications={handleOpenNotifications}
        onOpenProfile={handleOpenProfile}
        onOpenSettings={handleOpenSettings}
        onOpenHelp={handleOpenHelp}
        onLogout={handleLogout}
      />

      {/* Panel de Notificaciones */}
      <NotificationsPanel isOpen={notificationsOpen} onClose={handleCloseNotifications} />
    </>
  )
}

export default ChronosHeader2026Client
