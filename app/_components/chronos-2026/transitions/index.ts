/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 CHRONOS 2026 — TRANSITIONS & MICROINTERACTIONS INDEX
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Original Transitions
export {
  ChronosLoadingSpinner,
  PageTransition as LegacyPageTransition,
  Skeleton as LegacySkeleton,
  LoadingTransition,
  Magnetic,
  Reveal,
  StaggerContainer,
  StaggerItem,
} from "./PageTransition"

// Cinematic Transitions System (NEW)
export {
  CINEMATIC_SPRINGS,
  PageTransition as CinematicPageTransition,
  PanelTransition as CinematicPanelTransition,
  StaggerContainer as CinematicStaggerContainer,
  StaggerItem as CinematicStaggerItem,
  LoadingSkeleton,
  expandFromCenter,
  fadeBlur,
  morphFluid,
  scaleRotate,
  slideRight3D,
  slideUp3D,
} from "./CinematicTransitions"

// Ultra Transitions System
export {
  HoverCard3D,
  LoadingState,
  MagneticButton,
  MorphingText,
  NumberCounter,
  // Components
  PageTransition,
  PanelTransition,
  RippleEffect,
  Skeleton,
  StaggerList,
  dissolveVariants,
  // Variants
  fadeVariants,
  flipVariants,
  glitchVariants,
  morpheusVariants,
  portalVariants,
  quantumVariants,
  rotateVariants,
  scaleVariants,
  slideVariants,
  staggerContainer,
  staggerItem,
  toastVariants,
  // Presets
  transitionPresets,
  type TransitionConfig,
  // Types
  type TransitionType,
} from "./UltraTransitions"

// Microinteractions System
export {
  Badge,
  CircularProgress,
  CursorFollower,
  NotificationDot,
  PremiumButton,
  PremiumInput,
  PremiumToggle,
  ProgressBar,
  SkeletonCard,
  SkeletonTable,
  Tooltip,
} from "./MicroInteractions"

// ═══════════════════════════════════════════════════════════════════════════════
// 🎬 PAGE TRANSITION WRAPPER — Quantum Navigation System
// ═══════════════════════════════════════════════════════════════════════════════
export {
  CountUp,
  PageTransitionWrapper,
  StaggerContainer as QuantumStaggerContainer,
  StaggerItem as QuantumStaggerItem,
  cardVariants as quantumCardVariants,
  childVariants as quantumChildVariants,
  statVariants as quantumStatVariants,
  tableRowVariants as quantumTableRowVariants,
} from "./PageTransitionWrapper"

// ═══════════════════════════════════════════════════════════════════════════════
// 🌊 LIQUID MORPH TRANSITION — Premium Cinematographic 2026
// ═══════════════════════════════════════════════════════════════════════════════
export { LiquidMorphTransition, ParallaxLayer, ParticlesTrail } from "./LiquidMorphTransition"
