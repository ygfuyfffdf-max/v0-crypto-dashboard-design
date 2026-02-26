// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌟 CHRONOS INFINITY 2026 — ULTRA PREMIUM EXPORTS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Archivo de exportación consolidada para acceso rápido a todos los componentes
 * premium del sistema CHRONOS 2026.
 *
 * Uso:
 * ```tsx
 * import {
 *   iOSCard,
 *   iOSSheet,
 *   BancoDashboardSupreme,
 *   TablaTransaccionesUltra,
 *   FiltrosAvanzados,
 * } from '@/app/_components/ultra-premium-exports'
 * ```
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🍎 iOS ULTIMATE PREMIUM SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Core System
export {
    iOS, iOSBadge as iOSBadgeUltimate, iOSButton as iOSButtonUltimate, iOSCard, iOSInput as iOSInputUltimate, iOSListGroup as iOSListGroupUltimate, iOSListItem as iOSListItemUltimate, iOSProvider, iOSScrollView, iOSSearchBar as iOSSearchBarUltimate, iOSSheet, iOSToastProvider,
    useToast as useToastUltimate, useiOS
} from './ui/ios'

// Advanced Scroll
export {
    HorizontalScroll,
    ScrollSnapItem, FormScrollContainer as iOSFormScrollContainer,
    ModalScrollContainer as iOSModalScrollContainer, iOSScrollContainer, useAdvancedScroll
} from './ui/ios'

// Mobile Navigation
export {
    iOSDrawerMenu,
    iOSFABMobile, iOSMobileHeader, iOSPageTransition, iOSTabBarMobile, useMobileNav
} from './ui/ios'

// Advanced Forms
export {
    iOSCheckboxAdvanced, iOSForm,
    iOSFormGroup, iOSSelectAdvanced, iOSTextAreaAdvanced, iOSTextInput, iOSToggleField, useFormAdvanced
} from './ui/ios'

// Premium Cards
export {
    iOSActionCard, iOSEntityCard, iOSInfoCard, iOSMetricCardPremium
} from './ui/ios'

// Toast & Alerts
export {
    iOSAlertAdvanced,
    iOSConfirm, iOSToastProviderAdvanced,
    useToastAdvanced
} from './ui/ios'

// Integration Components
export {
    defaultNavItems,
    extendedNavItems, iOSEmptyState, iOSGrid, iOSIntegrationWrapper, iOSLoading, iOSPageLayout,
    iOSSection
} from './ui/ios'

// Clean Components (Sin efectos 3D problemáticos)
export {
    CleanAlert, CleanBreadcrumbs, CleanConfirmationSheet, CleanFAB, CleanGlassCard, CleanHeader, CleanModal, CleanQuickActions, CleanTabBar, EnhancedScrollContainer,
    FormScrollContainer,
    HorizontalScrollContainer, iOSCleanActionCard, iOSCleanExpandableCard, iOSCleanListCard, iOSCleanMetricCard
} from './ui/ios'

// Motion Settings
export {
    MotionSettingsProvider, use3DEffects, useMotionSettings,
    useShouldAnimate
} from './ui/ios'

// Visual Effects
export {
    iOSBlurTransition, iOSCounter, iOSGlow, iOSGradientText, iOSMorphGradient, iOSParticles, iOSRainbowBorder, iOSReveal, iOSRipple, iOSShimmer, iOSStaggerChildren,
    iOSStaggerItem, iOSTypingEffect
} from './ui/ios'

// Mobile Layout
export {
    MobileCardContainer,
    MobileEmptyState, MobileHeader, MobileLayoutProvider, MobileLoadingState, MobileScreen, MobileSection, useMobileLayout
} from './ui/ios'

// Financial Summary
export {
    iOSFinancialSummary,
    iOSFinancialSummaryCompact
} from './ui/ios'

// Dashboard Quick Actions
export {
    FloatingQuickBar, QuickActionGroup, iOSDashboardQuickActions
} from './ui/ios'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 DASHBOARDS SUPREME
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    AdvancedMetricsDashboard, BancoDashboardSupreme, type BancoDashboardProps, type BancoId, type CategoriaTransaccion, type DesglosePorCategoria, type FlujoTemporal, type MetricaBanco, type MovimientoResumen, type PeriodoFiltro
} from './dashboards'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 👑 ADMIN SUPREME
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    AdminActivityDashboard, AdminDashboardSupreme,
    ApprovalsPanelSupreme, AuditDashboardSupreme, RolePermissionsManager, UserManagementPanel, type AccionAudit, type AlertaAudit, type EntradaAudit, type EstadisticasAudit, type ModuloAudit,
    type SeveridadAudit
} from './admin'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 TABLES SUPREME
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    // Base table
    QuantumTable,
    // Supreme data table
    SupremeDataTableUltra, TablaGastosAbonos, TablaMovimientos, TablaOC,
    TablaStockHistorico,
    // Ultra transactions table
    TablaTransaccionesUltra,
    // Domain tables
    TablaVentas, type CambioHistorial, type ColumnaConfig, type DispositivoInfo, type FiltrosTabla, type TransaccionCompleta,
    type TrazabilidadCompleta, type UsuarioAudit
} from './tables'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 FILTROS AVANZADOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    FiltrosAvanzados, type ConfiguracionFiltro, type FiltroGuardado, type FiltrosActivos, type OpcionFiltro,
    type PeriodoPreset,
    type RangoFecha,
    type RangoMonto
} from './filters'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📝 FORMS PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    AbonoClienteForm, GastoForm, OrdenCompraForm, PagoDistribuidorForm, TransferenciaForm, VentaForm, VentaFormGen5,
    WizardVentaPremium
} from './forms'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔐 AUTH PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    KocmocLoginForm,
    KocmocRegisterForm, SILVER_COLORS, SilverButton, SilverInput
} from './auth/KocmocAuthGateway'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 UI PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Glass Buttons
export { GlassButton3D, GlassButtonGroup, GlassIconButton } from './ui/GlassButton3D'

// Ultra Metric Card
export { UltraMetricCard } from './ui/UltraMetricCard'

// Command Menu
export { CommandMenu } from './ui/CommandMenu'

// Loading Components
export { LoadingCard, LoadingSkeleton, LoadingSpinner } from './ui/LoadingSpinner'

// Metrics Bar
export { HealthOrbWidget, MetricsBar } from './ui/MetricsBar'

// Aurora Glass System
export * from './ui/AuroraGlassSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 CHRONOS 2026 PANELS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    AuroraAIPanelUnified, AuroraAlmacenPanelUnified, AuroraBancosPanelUnified, AuroraClientesPanelUnified, AuroraDashboardUnified, AuroraDistribuidoresPanelUnified, AuroraMovimientosPanelUnified, AuroraOrdenesPanelUnified, AuroraReportesPanelUnified, AuroraVentasPanelUnified
} from './chronos-2026/panels'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    AnimatedCounter, FlipCard, LiquidText, Magnetic,
    MorphingBlob,
    OrbitLoader,
    ParallaxLayer,
    ParticleBurst,
    PulseGlow,
    RevealOnScroll,
    Shimmer,
    Skeleton,
    Spotlight,
    Typewriter,
    Wave
} from './animations/MicroAnimations'

