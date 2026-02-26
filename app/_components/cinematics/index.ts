/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS CINEMATICS — Integration & Fixes
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de cinematográficas para CHRONOS INFINITY 2026
 */

export { KocmocCinematic3D } from './KocmocCinematic3D'

// 🆕 KOCMOC PREMIUM SYSTEM — Silver Space Edition
export {
    KocmocLogoPremium, LightningEffect,
    SILVER_SPACE_COLORS, SilverDustBackground, SilverSpaceCinematic
} from './KocmocPremiumSystem'

// KocmocShowcase — removed (module not found)

// Re-export legacy cinematics
export { default as CinematicTransition } from '../chronos-2026/transitions/CinematicTransitions'
export { PageTransition } from '../chronos-2026/transitions/PageTransition'
