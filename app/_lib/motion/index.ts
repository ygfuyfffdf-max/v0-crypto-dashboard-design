/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 CHRONOS 2026 — MOTION SYSTEM INDEX
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Sistema unificado de animaciones:
 * - motion-2026: Sistema premium cinematográfico
 * - motion-variants: Sistema legacy compatible
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Premium 2026 motion system (primary)
export * from './motion-2026'
export { default as motion2026 } from './motion-2026'

// Legacy motion system - re-export non-conflicting items
export {
  springPresets,
  durationPresets,
  transitionPresets,
  cardVariants,
  buttonVariants,
  containerVariants,
  revealVariants,
  modalOverlayVariants,
  modalContentVariants,
} from './motion-variants'
export { default as chronosMotion } from './motion-variants'
