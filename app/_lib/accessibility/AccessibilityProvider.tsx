// ═══════════════════════════════════════════════════════════════════════════════════════
// CHRONOS FLOWDISTRIBUTOR INFINITY 2030 — ACCESSIBILITY UTILITIES
// WCAG 2.1 AA Compliance — 100/100 Accessibility Score Target
// ═══════════════════════════════════════════════════════════════════════════════════════

'use client'

import { useEffect, useCallback, createContext, useContext, ReactNode, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface AccessibilityContextValue {
  /** Anuncia mensaje al screen reader */
  announce: (message: string, priority?: 'polite' | 'assertive') => void
  /** Preferencia de reduced motion */
  prefersReducedMotion: boolean
  /** Preferencia de alto contraste */
  prefersHighContrast: boolean
  /** Preferencia de dark mode */
  prefersDarkMode: boolean
  /** Focus visible activo */
  focusVisible: boolean
}

interface AccessibilityProviderProps {
  children: ReactNode
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONTEXTO
// ═══════════════════════════════════════════════════════════════════════════════════════

const AccessibilityContext = createContext<AccessibilityContextValue>({
  announce: () => {},
  prefersReducedMotion: false,
  prefersHighContrast: false,
  prefersDarkMode: true,
  focusVisible: false,
})

export const useAccessibility = () => useContext(AccessibilityContext)

// ═══════════════════════════════════════════════════════════════════════════════════════
// SKIP LINK COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface SkipLinkProps {
  targetId: string
  label?: string
}

export function SkipLink({ targetId, label = 'Saltar al contenido principal' }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="skip-link focus:ring-gold-400 sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:rounded-lg focus:bg-purple-600 focus:px-4 focus:py-2 focus:text-white focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:outline-none"
      tabIndex={0}
    >
      {label}
    </a>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// VISUALLY HIDDEN (pero accesible a screen readers)
// ═══════════════════════════════════════════════════════════════════════════════════════

interface VisuallyHiddenProps {
  children: ReactNode
  as?: 'span' | 'div' | 'p'
}

export function VisuallyHidden({ children, as: Component = 'span' }: VisuallyHiddenProps) {
  return <Component className="sr-only">{children}</Component>
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ARIA LABELS PARA ICON BUTTONS (CRÍTICO PARA WCAG)
// ═══════════════════════════════════════════════════════════════════════════════════════

export const ARIA_LABELS = {
  // Navigation
  openMenu: 'Abrir menú de navegación',
  closeMenu: 'Cerrar menú de navegación',
  home: 'Ir a inicio',
  dashboard: 'Ir al panel de control',
  settings: 'Abrir configuración',

  // Actions
  search: 'Buscar',
  filter: 'Filtrar resultados',
  sort: 'Ordenar resultados',
  refresh: 'Actualizar datos',
  download: 'Descargar',
  upload: 'Subir archivo',
  delete: 'Eliminar',
  edit: 'Editar',
  save: 'Guardar cambios',
  cancel: 'Cancelar',
  confirm: 'Confirmar acción',

  // Theme
  toggleTheme: 'Cambiar tema oscuro/claro',
  toggleDarkMode: 'Activar modo oscuro',
  toggleLightMode: 'Activar modo claro',

  // Voice AI
  voiceStart: 'Iniciar comando de voz',
  voiceStop: 'Detener grabación de voz',
  voiceMute: 'Silenciar asistente de voz',
  voiceUnmute: 'Activar sonido del asistente',

  // Notifications
  notifications: 'Ver notificaciones',
  markAsRead: 'Marcar como leído',
  clearAll: 'Limpiar todas las notificaciones',

  // User
  userProfile: 'Abrir perfil de usuario',
  logout: 'Cerrar sesión',

  // Tables
  previousPage: 'Página anterior',
  nextPage: 'Página siguiente',
  firstPage: 'Primera página',
  lastPage: 'Última página',
  selectRow: 'Seleccionar fila',
  selectAll: 'Seleccionar todas las filas',

  // Charts/3D
  toggleFullscreen: 'Pantalla completa',
  zoomIn: 'Acercar',
  zoomOut: 'Alejar',
  resetView: 'Restablecer vista',

  // Finance specific
  viewDetails: 'Ver detalles',
  viewTransactions: 'Ver transacciones',
  addTransaction: 'Agregar transacción',
  exportReport: 'Exportar reporte',

  // Banks
  selectBank: (name: string) => `Seleccionar banco ${name}`,
  bankDetails: (name: string) => `Ver detalles de ${name}`,
  bankBalance: (name: string, amount: string) => `${name}: saldo ${amount}`,
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FOCUS TRAP HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active = true) {
  useEffect(() => {
    if (!active || !ref.current) return

    const element = ref.current
    const focusableSelectors = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',')

    const getFocusable = () => element.querySelectorAll<HTMLElement>(focusableSelectors)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      const focusable = getFocusable()
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && first && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && last && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }

    // Focus first element
    const focusable = getFocusable()
    if (focusable.length > 0) {
      focusable[0]?.focus()
    }

    element.addEventListener('keydown', handleKeyDown)
    return () => element.removeEventListener('keydown', handleKeyDown)
  }, [ref, active])
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// LIVE REGION ANNOUNCER
// ═══════════════════════════════════════════════════════════════════════════════════════

let announcerElement: HTMLDivElement | null = null

function getAnnouncer(): HTMLDivElement {
  if (typeof document === 'undefined') {
    return {} as HTMLDivElement
  }

  if (!announcerElement) {
    announcerElement = document.createElement('div')
    announcerElement.setAttribute('aria-live', 'polite')
    announcerElement.setAttribute('aria-atomic', 'true')
    announcerElement.setAttribute('role', 'status')
    announcerElement.className = 'sr-only'
    announcerElement.id = 'chronos-live-region'
    document.body.appendChild(announcerElement)
  }

  return announcerElement
}

export function announceToScreenReader(
  message: string,
  priority: 'polite' | 'assertive' = 'polite',
) {
  const announcer = getAnnouncer()

  // Cambiar prioridad si es necesario
  announcer.setAttribute('aria-live', priority)

  // Limpiar y anunciar
  announcer.textContent = ''

  // Timeout para que el screen reader detecte el cambio
  setTimeout(() => {
    announcer.textContent = message
  }, 100)
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)
  const [prefersDarkMode, setPrefersDarkMode] = useState(true)
  const [focusVisible, setFocusVisible] = useState(false)

  // Detectar preferencias del sistema
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Reduced motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(motionQuery.matches)
    const handleMotion = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    motionQuery.addEventListener('change', handleMotion)

    // High contrast
    const contrastQuery = window.matchMedia('(prefers-contrast: more)')
    setPrefersHighContrast(contrastQuery.matches)
    const handleContrast = (e: MediaQueryListEvent) => setPrefersHighContrast(e.matches)
    contrastQuery.addEventListener('change', handleContrast)

    // Dark mode
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setPrefersDarkMode(darkQuery.matches)
    const handleDark = (e: MediaQueryListEvent) => setPrefersDarkMode(e.matches)
    darkQuery.addEventListener('change', handleDark)

    return () => {
      motionQuery.removeEventListener('change', handleMotion)
      contrastQuery.removeEventListener('change', handleContrast)
      darkQuery.removeEventListener('change', handleDark)
    }
  }, [])

  // Detectar focus-visible
  useEffect(() => {
    if (typeof window === 'undefined') return

    let hadKeyboardEvent = false

    const handleKeydown = () => {
      hadKeyboardEvent = true
    }

    const handleMousedown = () => {
      hadKeyboardEvent = false
    }

    const handleFocusin = () => {
      setFocusVisible(hadKeyboardEvent)
    }

    document.addEventListener('keydown', handleKeydown)
    document.addEventListener('mousedown', handleMousedown)
    document.addEventListener('focusin', handleFocusin)

    return () => {
      document.removeEventListener('keydown', handleKeydown)
      document.removeEventListener('mousedown', handleMousedown)
      document.removeEventListener('focusin', handleFocusin)
    }
  }, [])

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    announceToScreenReader(message, priority)
  }, [])

  return (
    <AccessibilityContext.Provider
      value={{
        announce,
        prefersReducedMotion,
        prefersHighContrast,
        prefersDarkMode,
        focusVisible,
      }}
    >
      {/* Skip links globales */}
      <SkipLink targetId="main-content" label="Saltar al contenido principal" />
      <SkipLink targetId="main-navigation" label="Saltar a la navegación" />

      {children}
    </AccessibilityContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// KEYBOARD NAVIGATION HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useKeyboardNav(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si está en input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Construir key combo
      const parts: string[] = []
      if (e.ctrlKey || e.metaKey) parts.push('mod')
      if (e.altKey) parts.push('alt')
      if (e.shiftKey) parts.push('shift')
      parts.push(e.key.toLowerCase())

      const combo = parts.join('+')

      if (shortcuts[combo]) {
        e.preventDefault()
        shortcuts[combo]()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

export default AccessibilityProvider
