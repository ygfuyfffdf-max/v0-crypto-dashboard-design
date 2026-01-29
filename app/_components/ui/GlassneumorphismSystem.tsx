/**
 * Stub temporal - Redirigir a AuroraGlassSystem
 */

import type { ComponentProps } from 'react'
import { AuroraButton, AuroraGlassCard, AuroraSearch } from './AuroraGlassSystem'

// Re-exports
export { AuroraButton as GlassButton, AuroraGlassCard as GlassCard, AuroraSearch as GlassSearch }

// Tipos
export type GlassButtonProps = ComponentProps<typeof AuroraButton>

// Paleta
export const GLASS_PALETTE = {
  violet: '#8B5CF6',
  purple: '#A855F7',
  fuchsia: '#D946EF',
  rose: '#F43F5E',
  indigo: '#6366F1',
}

// Springs
export const GLASS_SPRINGS = {
  gentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
  bouncy: { type: 'spring' as const, stiffness: 300, damping: 15 },
  smooth: { type: 'spring' as const, stiffness: 100, damping: 20 },
}
