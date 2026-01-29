/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 OMEGA DESIGN SYSTEM — MAIN EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de diseño ULTRA-PREMIUM para CHRONOS INFINITY 2030
 *
 * Uso:
 *   import {
 *     OMEGA,
 *     AuroraBackground,
 *     OmegaGlassCard,
 *     OmegaButton,
 *     OmegaStatCard,
 *     OmegaBadge,
 *     OmegaInput,
 *     OmegaSearchInput,
 *     OmegaSelect,
 *     OmegaTable,
 *     OmegaModal,
 *     OmegaAlertDialog,
 *     OmegaToastContainer,
 *   } from '@/app/_components/ui/omega'
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// Core design system & components
export {
  AnimatedValue,
  AuroraBackground,
  OMEGA,
  OmegaBadge,
  OmegaButton,
  OmegaGlassCard,
  OmegaStatCard,
  SparklineChart,
} from './OmegaDesignSystem'

// Input & table components
export { OmegaInput, OmegaSearchInput, OmegaSelect, OmegaTable } from './OmegaInputs'
export type { OmegaTableColumn } from './OmegaInputs'

// Modal & dialog components
export { OmegaAlertDialog, OmegaModal, OmegaToastContainer } from './OmegaModals'
export type { OmegaToast } from './OmegaModals'
