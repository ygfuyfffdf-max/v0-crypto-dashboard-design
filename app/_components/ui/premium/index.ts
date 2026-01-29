/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 AURORA PREMIUM COMPONENTS — CENTRAL EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Exportaciones centralizadas de todos los componentes premium para el sistema CHRONOS:
 *
 * 📦 MicroInteractions: Botones magnéticos, cards holográficas, elementos flotantes
 * 🎬 CinematicTransitions: Transiciones de página, reveals, portales de partículas
 * 🌌 AdvancedBackgrounds: Aurora borealis, mesh gradients, nebulas, grids holográficos
 * 💎 AuroraIntegration: Componentes integrados premium (cards, buttons, backgrounds)
 * 🚀 UltraPremium: Componentes ultra-premium con animaciones cinematográficas (2026)
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🚀 ULTRA PREMIUM COMPONENTS 2026
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { UltraPremiumButton } from './UltraPremiumButton'
export {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  UltraPremiumCard,
} from './UltraPremiumCard'
export { UltraPremiumInput, UltraPremiumTextarea } from './UltraPremiumInput'
export { UltraPremiumShowcase } from './UltraPremiumShowcase'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 MICRO-INTERACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  FloatingElement,
  GlowPulse,
  HolographicCard,
  LiquidButton,
  // Componentes principales
  MagneticButton,
  // Export default
  default as MicroInteractionsBundle,
  MorphingShape,
  ParallaxContainer,
  StaggeredList,
  TextReveal,
} from './MicroInteractions'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 CINEMATIC TRANSITIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  AuroraReveal,
  // Export default
  default as CinematicTransitionsBundle,
  CrossDissolve,
  // Componentes principales
  FadeThroughBlack,
  PageTransition,
  PanelMorph,
  ParticlePortal,
  QuantumBlur,
  // Configuración
  TRANSITION_PRESETS,
  WipeTransition,
  ZoomThrough,
} from './CinematicTransitions'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 ADVANCED BACKGROUNDS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Configuración
  AURORA_PALETTES,
  // Export default
  default as AdvancedBackgroundsBundle,
  // Componentes principales
  AuroraBorealis,
  HolographicGrid,
  LiquidWaves,
  MeshGradient,
  NebulaEffect,
  ParticleField,
  VignetteOverlay,
} from './AdvancedBackgrounds'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💎 AURORA INTEGRATION (Componentes premium integrados)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  AuroraGlowText,
  AuroraPanelTransition,
  AuroraPremiumBackground,
  AuroraPremiumButton,
  // Componentes integrados premium
  AuroraPremiumCard,
  // Types
  type PremiumColorKey,
} from './AuroraIntegration'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// � PREMIUM ELEVATED SYSTEM 2026 (NUEVO)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Tokens de diseño
  PREMIUM_COLORS,
  // Badge Premium
  PremiumBadge,
  // Botón Premium
  PremiumButton as PremiumElevatedButton,
  // Card Premium
  PremiumCard as PremiumElevatedCard,
  // Formularios Premium
  PremiumFloatingInput,
  // Transiciones de página
  PremiumPageTransition,
  PremiumSelect,
  // Sparkline para tablas
  PremiumSparkline,
  // Container responsive
  ResponsiveContainer,
  SMOOTH_SPRING,
  SPRING_CONFIG,
} from './PremiumElevatedSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 PREMIUM TABLE SYSTEM 2026 (NUEVO)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { PremiumTable, type TableColumn, type TableProps } from './PremiumTableSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// �🎨 RE-EXPORTS CON ALIAS CONVENIENTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Alias para facilitar el uso
export { AuroraBorealis as Aurora } from './AdvancedBackgrounds'
export {
  AuroraPremiumButton as PremiumButton,
  AuroraPremiumCard as PremiumCard,
} from './AuroraIntegration'
export { PageTransition as Cinematic } from './CinematicTransitions'
export { HolographicCard as Holographic, MagneticButton as Magnetic } from './MicroInteractions'
