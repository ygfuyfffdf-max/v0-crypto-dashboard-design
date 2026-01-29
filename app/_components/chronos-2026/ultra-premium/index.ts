/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS 2026 ULTRA PREMIUM — EXPORTS INDEX
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Exportaciones centralizadas de los nuevos sistemas premium:
 * - UltraForms: Formularios con UX moderna
 * - UltraTable: Tablas avanzadas con sparklines
 * - MicroInteractions: Interacciones premium
 * - PageTransitions: Transiciones cinematográficas
 * - ResponsiveSystem: Diseño adaptativo
 *
 * @version 2026.1.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📝 ULTRA FORMS — FORMULARIOS CON UX MODERNA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Utilities
  AutoSaveIndicator,
  UltraButton,
  UltraCheckbox,
  // Provider
  UltraFormProvider,
  // Input components
  UltraInput,
  UltraSelect,
  UltraSwitch,
  UltraTextarea,
  type UltraButtonProps,
  type UltraCheckboxProps,
  // Types
  type UltraInputProps,
  type UltraSelectOption,
  type UltraSelectProps,
  type UltraSwitchProps,
  type UltraTextareaProps,
} from '../primitives/UltraForms'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 ULTRA TABLE — TABLAS AVANZADAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  ActionsCell,
  AvatarCell,
  BadgeCell,
  CurrencyCell,
  DateCell,
  ProgressCell,
  // Cell renderers
  Sparkline,
  // Main component
  UltraTable,
  type ActionItem,
  // Types
  type UltraColumn,
  type UltraTableProps,
} from '../primitives/UltraTable'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ⚡ MICRO INTERACTIONS — INTERACCIONES PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  AnimatedCounter,
  // Feedback
  AnimatedTooltip,
  ErrorAnimation,
  GlowHover,
  HoverLift,
  LoadingSpinner,
  // Core interactions
  Magnetic,
  RippleContainer,
  SpotlightCard,
  // Lists
  StaggerList,
  SuccessAnimation,
  TiltCard,
  type AnimatedCounterProps,
  type AnimatedTooltipProps,
  type ErrorAnimationProps,
  type GlowHoverProps,
  type HoverLiftProps,
  type LoadingSpinnerProps,
  // Types
  type MagneticProps,
  type RippleContainerProps,
  type SpotlightCardProps,
  type StaggerListProps,
  type SuccessAnimationProps,
  type TiltCardProps,
  type TooltipPosition,
} from '../interactions/MicroInteractions'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 PAGE TRANSITIONS — TRANSICIONES CINEMATOGRÁFICAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  AuroraReveal,
  CrossDissolve,
  FadeThroughBlack,
  // Main transitions
  PageTransition,
  PanelMorph,
  ParticlePortal,
  QuantumBlur,
  RevealOnScroll,
  // Utilities
  StaggeredChildren,
  // Provider
  TransitionProvider,
  WipeTransition,
  // Constants
  transitionVariants,
  usePageTransition,
  type AuroraRevealProps,
  type PageTransitionProps,
  type PanelMorphProps,
  type ParticlePortalProps,
  type QuantumBlurProps,
  type RevealOnScrollProps,
  type StaggeredChildrenProps,
  type TransitionConfig,
  // Types
  type TransitionType,
  type WipeDirection,
  type WipeTransitionProps,
} from '../transitions/PageTransitions'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📱 RESPONSIVE SYSTEM — DISEÑO ADAPTATIVO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  AspectRatio,
  BottomSheet,
  DesktopOnly,
  MobileOnly,
  ResponsiveContainer,
  // Layout components
  ResponsiveGrid,
  // Provider
  ResponsiveProvider,
  // Show/Hide
  ResponsiveShow,
  ResponsiveStack,
  ResponsiveText,
  TabletOnly,
  // Mobile components
  TouchTarget,
  // Constants
  breakpoints,
  // Hooks
  useBreakpoint,
  useMediaQuery,
  useResponsive,
  useSafeArea,
  useTouchDevice,
  // Types
  type Breakpoint,
} from '../responsive/ResponsiveSystem'
