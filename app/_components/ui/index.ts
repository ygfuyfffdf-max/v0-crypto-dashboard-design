// ═══════════════════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2030 — UI COMPONENTS INDEX
// ═══════════════════════════════════════════════════════════════════════════════════════
// Exportaciones centralizadas de todos los componentes UI ultra-premium
// ═══════════════════════════════════════════════════════════════════════════════════════

// ✨ GLASS GEN-5 ULTRA SYSTEM (NEW - Latest Generation)
// ═══════════════════════════════════════════════════════════════════════════════════
// 🎨 AURORA GLASS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════
export * from './AuroraGlassSystem'

// 🚀 ENHANCED AURORA SYSTEM 2026 (Ultra Premium Wrappers)
export { EnhancedAuroraButton, EnhancedAuroraCard } from './EnhancedAuroraSystem'

// 💎 ULTRA PREMIUM COMPONENTS 2026 (Cinematographic)
export * from './premium'

// 🛒 COMPLETE FORMS (NEW - Ready-to-use Forms)
export { VentaFormGen5 } from '../forms/VentaFormGen5'

// 🌌 QUANTUM ELEVATED UI (Gen 4 - Legacy)
export {
    BUTTON_VARIANTS,
    GLASS_STYLES,
    QUANTUM_COLORS,
    QuantumButton,
    QuantumGlassCard,
    QuantumInput,
    QuantumMetricCard,
    QuantumSelect,
    type ButtonSize,
    type ButtonVariant,
    type GlassVariant,
} from './QuantumElevatedUI'

// Ultra Premium Components
export { GlassButton3D, GlassButtonGroup, GlassIconButton } from './GlassButton3D'
export { UltraMetricCard, type MetricVariant } from './UltraMetricCard'

// Premium UI Elements
export { CommandMenu } from './CommandMenu'
export { default as FloatingOrb } from './FloatingOrb'
export { LoadingCard, LoadingSkeleton, LoadingSpinner } from './LoadingSpinner'
export { HealthOrbWidget, MetricsBar } from './MetricsBar'
export { Button, Modal, ModalFooter } from './Modal'

// 🎬 MICRO ANIMATIONS SYSTEM
export {
    AnimatedCounter, fadeInDown,
    fadeInLeft,
    fadeInRight,
    // Animation Variants
    fadeInUp, FlipCard,
    // Animation Components
    LiquidText,
    Magnetic,
    MorphingBlob,
    OrbitLoader,
    ParallaxLayer,
    ParticleBurst,
    PulseGlow,
    RevealOnScroll, scaleIn, Shimmer,
    Skeleton,
    Spotlight, staggerContainer,
    staggerItem, Typewriter,
    Wave,
} from '../animations/MicroAnimations'

// ═══════════════════════════════════════════════════════════════════════════════════
// 🍎 iOS PREMIUM UI SYSTEM (NEW - 2026)
// Sistema de componentes inspirado en iOS 18+ sin efectos 3D problemáticos
// ═══════════════════════════════════════════════════════════════════════════════════
export * from './ios'

// 🆕 CLEAN SYSTEM DIRECT EXPORTS (Sin 3D problemático)
export {
  // Clean Cards
  CleanGlassCard,
  iOSCleanMetricCard,
  iOSCleanListCard,
  iOSCleanExpandableCard,
  iOSCleanActionCard,
  // Clean Modals
  CleanModal,
  CleanAlert,
  CleanConfirmationSheet,
  // Clean Navigation
  CleanTabBar,
  CleanHeader,
  CleanBreadcrumbs,
  CleanFAB,
  CleanQuickActions,
  defaultTabItems,
  // Enhanced Scroll
  EnhancedScrollContainer,
  FormScrollContainer,
  HorizontalScrollContainer,
  // Motion Settings
  MotionSettingsProvider,
  useMotionSettings,
  useShouldAnimate,
  use3DEffects,
} from './ios'

// Individual iOS exports for convenience
export {
  // Core
  iOSGlassCard,
  iOSNavBar,
  iOSSearchBar,
  iOSButton,
  iOSToggle,
  iOSPill,
  iOSProgress,
  iOSSkeleton,
  iOSListItem,
  iOSListGroup,
  iOSSegmentedControl,
  iOSActionSheet,
  // Modals
  iOSModal,
  iOSAlert,
  iOSConfirmationSheet,
  // Forms
  iOSInput,
  iOSTextArea,
  iOSSelect,
  iOSCheckbox,
  iOSRadioGroup,
  iOSNumberInput,
  iOSFormContainer,
  iOSFormSection,
  // Navigation
  iOSTabBar,
  iOSFAB,
  iOSBreadcrumbs,
  iOSPageIndicator,
  iOSNavigationStack,
  iOSNavigationPage,
  iOSQuickActions,
  iOSSwipeBack,
  // Scroll
  iOSScrollView,
  iOSPullToRefresh,
  iOSHorizontalScroll,
  iOSCarouselItem,
  iOSCollapsibleHeader,
  iOSInfiniteScroll,
  iOSSectionList,
  // Cards
  iOSMetricCard,
  iOSListCard,
  iOSExpandableCard,
  iOSFeatureCard,
  iOSTransactionCard,
  iOSStatsCard,
  // Config & Hooks
  iOSSystemConfig,
  useiOSTheme,
  useNavigationStack,
  useFormContext,
  createSpringConfig,
  createGlassClasses,
  isMobileDevice,
  prefersReducedMotion,
  // Mobile Layout
  MobileLayoutProvider,
  MobileScreen,
  MobileHeader,
  MobileSection,
  MobileCardContainer,
  MobileEmptyState,
  MobileLoadingState,
  useMobileLayout,
  // Motion Settings
  MotionSettingsModal,
  MotionSettingsCompact,
  // Toast System
  ToastProvider,
  useToast,
  // Dashboard Quick Actions
  iOSDashboardQuickActions,
  QuickActionGroup,
  FloatingQuickBar,
  // Financial Summary
  iOSFinancialSummary,
  iOSFinancialSummaryCompact,
} from './ios'
