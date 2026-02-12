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
  iOS,
  iOSProvider,
  useiOS,
  iOSCard,
  iOSScrollView,
  iOSSheet,
  iOSButton as iOSButtonUltimate,
  iOSInput as iOSInputUltimate,
  iOSBadge as iOSBadgeUltimate,
  iOSSearchBar as iOSSearchBarUltimate,
  iOSListItem as iOSListItemUltimate,
  iOSListGroup as iOSListGroupUltimate,
  iOSToastProvider,
  useToast as useToastUltimate,
} from './ui/ios'

// Advanced Scroll
export {
  iOSScrollContainer,
  FormScrollContainer as iOSFormScrollContainer,
  ModalScrollContainer as iOSModalScrollContainer,
  HorizontalScroll,
  ScrollSnapItem,
  useAdvancedScroll,
} from './ui/ios'

// Mobile Navigation
export {
  iOSTabBarMobile,
  iOSMobileHeader,
  iOSDrawerMenu,
  iOSFABMobile,
  iOSPageTransition,
  useMobileNav,
} from './ui/ios'

// Advanced Forms
export {
  iOSForm,
  iOSFormGroup,
  iOSTextInput,
  iOSTextAreaAdvanced,
  iOSSelectAdvanced,
  iOSToggleField,
  iOSCheckboxAdvanced,
  useFormAdvanced,
} from './ui/ios'

// Premium Cards
export {
  iOSMetricCardPremium,
  iOSInfoCard,
  iOSEntityCard,
  iOSActionCard,
} from './ui/ios'

// Toast & Alerts
export {
  iOSToastProviderAdvanced,
  useToastAdvanced,
  iOSAlertAdvanced,
  iOSConfirm,
} from './ui/ios'

// Integration Components
export {
  iOSIntegrationWrapper,
  iOSPageLayout,
  iOSSection,
  iOSGrid,
  iOSEmptyState,
  iOSLoading,
  defaultNavItems,
  extendedNavItems,
} from './ui/ios'

// Clean Components (Sin efectos 3D problemáticos)
export {
  CleanGlassCard,
  iOSCleanMetricCard,
  iOSCleanListCard,
  iOSCleanExpandableCard,
  iOSCleanActionCard,
  CleanModal,
  CleanAlert,
  CleanConfirmationSheet,
  CleanTabBar,
  CleanHeader,
  CleanBreadcrumbs,
  CleanFAB,
  CleanQuickActions,
  EnhancedScrollContainer,
  FormScrollContainer,
  HorizontalScrollContainer,
} from './ui/ios'

// Motion Settings
export {
  MotionSettingsProvider,
  useMotionSettings,
  useShouldAnimate,
  use3DEffects,
} from './ui/ios'

// Visual Effects
export {
  iOSShimmer,
  iOSMorphGradient,
  iOSGlow,
  iOSRainbowBorder,
  iOSParticles,
  iOSBlurTransition,
  iOSRipple,
  iOSReveal,
  iOSStaggerChildren,
  iOSStaggerItem,
  iOSGradientText,
  iOSCounter,
  iOSTypingEffect,
} from './ui/ios'

// Mobile Layout
export {
  MobileLayoutProvider,
  MobileScreen,
  MobileHeader,
  MobileSection,
  MobileCardContainer,
  MobileEmptyState,
  MobileLoadingState,
  useMobileLayout,
} from './ui/ios'

// Financial Summary
export {
  iOSFinancialSummary,
  iOSFinancialSummaryCompact,
} from './ui/ios'

// Dashboard Quick Actions
export {
  iOSDashboardQuickActions,
  QuickActionGroup,
  FloatingQuickBar,
} from './ui/ios'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 DASHBOARDS SUPREME
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  BancoDashboardSupreme,
  AdvancedMetricsDashboard,
  type BancoId,
  type PeriodoFiltro,
  type CategoriaTransaccion,
  type MetricaBanco,
  type FlujoTemporal,
  type DesglosePorCategoria,
  type MovimientoResumen,
  type BancoDashboardProps,
} from './dashboards'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 👑 ADMIN SUPREME
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  AuditDashboardSupreme,
  AdminDashboardSupreme,
  ApprovalsPanelSupreme,
  UserManagementPanel,
  RolePermissionsManager,
  AdminActivityDashboard,
  type EntradaAudit,
  type AlertaAudit,
  type EstadisticasAudit,
  type AccionAudit,
  type ModuloAudit,
  type SeveridadAudit,
} from './admin'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 TABLES SUPREME
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  // Ultra transactions table
  TablaTransaccionesUltra,
  type TransaccionCompleta,
  type TrazabilidadCompleta,
  type DispositivoInfo,
  type UsuarioAudit,
  type CambioHistorial,
  type FiltrosTabla,
  type ColumnaConfig,
  // Supreme data table
  SupremeDataTableUltra,
  // Domain tables
  TablaVentas,
  TablaMovimientos,
  TablaGastosAbonos,
  TablaOC,
  TablaStockHistorico,
  // Base table
  QuantumTable,
} from './tables'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 FILTROS AVANZADOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  FiltrosAvanzados,
  type FiltrosActivos,
  type FiltroGuardado,
  type ConfiguracionFiltro,
  type OpcionFiltro,
  type PeriodoPreset,
  type RangoFecha,
  type RangoMonto,
} from './filters'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📝 FORMS PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  OrdenCompraForm,
  VentaForm,
  TransferenciaForm,
  GastoForm,
  AbonoClienteForm,
  PagoDistribuidorForm,
  VentaFormGen5,
  WizardVentaPremium,
} from './forms'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔐 AUTH PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  KocmocLoginForm,
  KocmocRegisterForm,
  SilverInput,
  SilverButton,
  SILVER_COLORS,
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
export { LoadingSpinner, LoadingCard, LoadingSkeleton } from './ui/LoadingSpinner'

// Metrics Bar
export { MetricsBar, HealthOrbWidget } from './ui/MetricsBar'

// Aurora Glass System
export * from './ui/AuroraGlassSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 CHRONOS 2026 PANELS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  AuroraDashboardUnified,
  AuroraBancosPanelUnified,
  AuroraVentasPanelUnified,
  AuroraClientesPanelUnified,
  AuroraDistribuidoresPanelUnified,
  AuroraAlmacenPanelUnified,
  AuroraOrdenesPanelUnified,
  AuroraMovimientosPanelUnified,
  AuroraReportesPanelUnified,
  AuroraAIPanelUnified,
} from './chronos-2026/panels'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎬 ANIMATIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  AnimatedCounter,
  LiquidText,
  FlipCard,
  Magnetic,
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
  Wave,
} from './animations/MicroAnimations'
