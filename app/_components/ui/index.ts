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
// export { VentaFormGen5 } from '../forms/VentaFormGen5' // file not found

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
    type GlassVariant
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
    AnimatedCounter, FlipCard,
    // Animation Components
    LiquidText,
    Magnetic,
    MorphingBlob,
    OrbitLoader,
    ParallaxLayer,
    ParticleBurst,
    PulseGlow,
    RevealOnScroll, Shimmer,
    Skeleton,
    Spotlight, Typewriter,
    Wave, fadeInDown,
    fadeInLeft,
    fadeInRight,
    // Animation Variants
    fadeInUp, scaleIn, staggerContainer,
    staggerItem
} from '../animations/MicroAnimations'

// ═══════════════════════════════════════════════════════════════════════════════════
// 🍎 iOS PREMIUM UI SYSTEM (NEW - 2026)
// Sistema de componentes inspirado en iOS 18+ sin efectos 3D problemáticos
// ═══════════════════════════════════════════════════════════════════════════════════
export * from './ios'

// 🆕 CLEAN SYSTEM DIRECT EXPORTS (Sin 3D problemático)
export {
    CleanAlert, CleanBreadcrumbs, CleanConfirmationSheet, CleanFAB,
    // Clean Cards
    CleanGlassCard, CleanHeader,
    // Clean Modals
    CleanModal, CleanQuickActions,
    // Clean Navigation
    CleanTabBar,
    // Enhanced Scroll
    EnhancedScrollContainer,
    FormScrollContainer,
    HorizontalScrollContainer,
    // Motion Settings
    MotionSettingsProvider, defaultTabItems, iOSCleanActionCard, iOSCleanExpandableCard, iOSCleanListCard, iOSCleanMetricCard, use3DEffects, useMotionSettings,
    useShouldAnimate
} from './ios'

// Individual iOS exports for convenience
export {
    FloatingQuickBar, MobileCardContainer,
    MobileEmptyState, MobileHeader,
    // Mobile Layout
    MobileLayoutProvider, MobileLoadingState, MobileScreen, MobileSection, MotionSettingsCompact,
    // Motion Settings
    MotionSettingsModal, QuickActionGroup,
    // Toast System
    ToastProvider, createGlassClasses, createSpringConfig, iOSActionSheet, iOSAlert, iOSBreadcrumbs, iOSButton, iOSCarouselItem, iOSCheckbox, iOSCollapsibleHeader, iOSConfirmationSheet,
    // Dashboard Quick Actions
    iOSDashboardQuickActions, iOSExpandableCard, iOSFAB, iOSFeatureCard,
    // Financial Summary
    iOSFinancialSummary,
    iOSFinancialSummaryCompact, iOSFormContainer,
    iOSFormSection,
    // Core
    iOSGlassCard, iOSHorizontalScroll, iOSInfiniteScroll,
    // Forms
    iOSInput, iOSListCard, iOSListGroup, iOSListItem,
    // Cards
    iOSMetricCard,
    // Modals
    iOSModal, iOSNavBar, iOSNavigationPage, iOSNavigationStack, iOSNumberInput, iOSPageIndicator, iOSPill,
    iOSProgress, iOSPullToRefresh, iOSQuickActions, iOSRadioGroup,
    // Scroll
    iOSScrollView, iOSSearchBar, iOSSectionList, iOSSegmentedControl, iOSSelect, iOSSkeleton, iOSStatsCard, iOSSwipeBack,
    // Config & Hooks
    iOSSystemConfig,
    // Navigation
    iOSTabBar, iOSTextArea, iOSToggle, iOSTransactionCard, isMobileDevice,
    prefersReducedMotion, useFormContext, useMobileLayout, useNavigationStack, useToast, useiOSTheme
} from './ios'

