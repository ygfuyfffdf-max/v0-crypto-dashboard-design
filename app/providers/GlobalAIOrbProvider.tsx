/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🤖 GLOBAL AI ORB PROVIDER — Componente Global del Orbe IA Flotante
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * @deprecated Este componente está desactivado.
 * Usar SplineAIWidget en app/(dashboard)/layout.tsx en su lugar.
 *
 * @version 3.0.0
 * @author CHRONOS Team
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

interface GlobalAIOrbProviderProps {
  /** @deprecated - Ya no tiene efecto */
  enabled?: boolean
  /** @deprecated - Ya no tiene efecto */
  size?: number
  /** @deprecated - Ya no tiene efecto */
  showDelay?: number
  /** @deprecated - Ya no tiene efecto */
  enableChat?: boolean
  /** @deprecated - Ya no tiene efecto */
  expandUrl?: string
  /** @deprecated - Ya no tiene efecto */
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'bottom-center'
}

export function GlobalAIOrbProvider({
  enabled = false, // DESACTIVADO - Ahora usamos SplineAIWidget en dashboard layout
  size = 80,
  showDelay = 2000,
  enableChat = true,
  expandUrl = '/ai-assistant',
}: GlobalAIOrbProviderProps) {
  // Widget de IA desactivado - Se usa SplineAIWidget en app/(dashboard)/layout.tsx
  // Mantener el componente para retrocompatibilidad pero no renderiza nada
  return null
}

export default GlobalAIOrbProvider
