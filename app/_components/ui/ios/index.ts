/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🍎 CHRONOS 2026 — iOS PREMIUM UI SYSTEM INDEX
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Barrel export de todos los componentes del sistema iOS Premium.
 * Importar desde aquí para acceso fácil a todos los componentes.
 *
 * @example
 * import { iOSGlassCard, iOSButton, iOSModal } from '@/app/_components/ui/ios'
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CORE SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    iOSActionSheet, iOSButton,
    // Core components
    iOSGlassCard, iOSListGroup, iOSListItem, iOSNavBar, iOSPill,
    iOSProgress, iOSSearchBar, iOSSegmentedControl, iOSSkeleton,
    // Context
    iOSThemeContext, iOSToggle, useiOSTheme, type ActionSheetOption, type iOSActionSheetProps, type iOSButtonProps,
    // Types
    type iOSGlassCardProps, type iOSListGroupProps, type iOSListItemProps, type iOSNavBarProps, type iOSPillProps,
    type iOSProgressProps, type iOSSearchBarProps, type iOSSegmentedControlProps, type iOSSkeletonProps, type iOSToggleProps
} from '../iOSPremiumSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MODAL SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    ModalScrollContainer, iOSAlert,
    iOSConfirmationSheet, iOSModal, type iOSAlertProps,
    type iOSConfirmationSheetProps, type iOSModalProps
} from '../iOSModalSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    iOSCheckbox, iOSFormContainer,
    iOSFormSection, iOSInput, iOSNumberInput, iOSRadioGroup, iOSSelect, iOSTextArea, useFormContext, type RadioOption, type SelectOption,
    type iOSCheckboxProps, type iOSFormContainerProps,
    type iOSFormSectionProps, type iOSInputProps, type iOSNumberInputProps, type iOSRadioGroupProps, type iOSSelectProps, type iOSTextAreaProps
} from '../iOSFormSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NAVIGATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    iOSBreadcrumbs, iOSFAB, iOSNavigationPage, iOSNavigationStack, iOSPageIndicator, iOSQuickActions,
    iOSSwipeBack, iOSTabBar, useNavigationStack, type BreadcrumbItem, type FABAction, type QuickAction, type TabItem, type iOSBreadcrumbsProps, type iOSFABProps, type iOSNavigationPageProps, type iOSNavigationStackProps, type iOSPageIndicatorProps, type iOSQuickActionsProps,
    type iOSSwipeBackProps, type iOSTabBarProps
} from '../iOSNavigationSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCROLL CONTAINERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    iOSCarouselItem,
    iOSCollapsibleHeader, iOSHorizontalScroll, iOSInfiniteScroll, iOSPullToRefresh, iOSScrollView, iOSSectionList, type Section, type iOSCarouselItemProps,
    type iOSCollapsibleHeaderProps, type iOSHorizontalScrollProps, type iOSInfiniteScrollProps, type iOSPullToRefreshProps, type iOSScrollViewProps, type iOSSectionListProps
} from '../iOSScrollContainers'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CARDS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    iOSExpandableCard,
    iOSFeatureCard, iOSListCard, iOSMetricCard, iOSStatsCard, iOSTransactionCard, type StatItem, type iOSExpandableCardProps,
    type iOSFeatureCardProps, type iOSListCardProps, type iOSMetricCardProps, type iOSStatsCardProps, type iOSTransactionCardProps
} from '../iOSCardsSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ADVANCED INTERACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    HapticProvider, createDefaultLongPressItems, createDefaultSwipeActions, iOSDraggableList, iOSLongPressMenu, iOSPeekPreview, iOSPullDownMenu, iOSSwipeActions, useHaptic, type LongPressMenuItem,
    type PullDownMenuItem,
    type PullDownMenuSection, type SwipeAction
} from '../iOSAdvancedInteractions'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VISUAL EFFECTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    iOSBlurTransition, iOSCounter, iOSGlow, iOSGradientText, iOSMorphGradient, iOSParticles, iOSRainbowBorder, iOSReveal, iOSRipple, iOSShimmer, iOSStaggerChildren,
    iOSStaggerItem, iOSTypingEffect, type iOSBlurTransitionProps, type iOSCounterProps, type iOSGlowProps, type iOSGradientTextProps, type iOSMorphGradientProps, type iOSParticlesProps, type iOSRainbowBorderProps, type iOSRevealProps, type iOSRippleProps, type iOSShimmerProps, type iOSStaggerChildrenProps, type iOSTypingEffectProps
} from '../iOSVisualEffects'
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOBILE LAYOUT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    MobileCardContainer,
    MobileEmptyState, MobileHeader, MobileLayoutProvider, MobileLoadingState, MobileScreen, MobileSection, useMobileLayout, type MobileCardContainerProps,
    type MobileEmptyStateProps, type MobileHeaderProps, type MobileLayoutContext, type MobileLoadingStateProps, type MobileScreenProps, type MobileSectionProps
} from '../iOSMobileLayout'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOTION SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    MotionSettingsCompact, MotionSettingsModal, type MotionSettingsCompactProps, type MotionSettingsModalProps
} from '../MotionSettings'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TOAST SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    ToastProvider,
    useToast,
    type Toast, type ToastContextValue, type ToastPosition, type ToastProviderProps, type ToastType
} from '../iOSToastSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD QUICK ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    FloatingQuickBar, QuickActionGroup, iOSDashboardQuickActions, type QuickAction as DashboardQuickAction, type FloatingQuickBarProps, type QuickActionGroupProps, type iOSDashboardQuickActionsProps
} from '../iOSDashboardQuickActions'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FINANCIAL SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    iOSFinancialSummary,
    iOSFinancialSummaryCompact,
    type FinancialMetric, type iOSFinancialSummaryCompactProps, type iOSFinancialSummaryProps
} from '../iOSFinancialSummary'
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN GLOBAL DEL SISTEMA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const iOSSystemConfig = {
  // Deshabilitar efectos 3D problemáticos
  disable3DEffects: true,
  disableParallax: true,
  disableTiltOnHover: true,

  // Configuración de animaciones
  animations: {
    reducedMotion: false,
    springStiffness: 400,
    springDamping: 30,
    duration: {
      fast: 150,
      normal: 250,
      slow: 400,
    },
  },

  // Configuración de scroll
  scroll: {
    rubberBand: true,
    momentum: true,
    autoHideScrollbar: true,
    scrollbarHideDelay: 1500,
  },

  // Configuración de blur
  blur: {
    low: 4,
    medium: 8,
    high: 16,
    xl: 24,
  },

  // Paleta de colores
  colors: {
    accent: '#8B5CF6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },

  // Breakpoints
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOKS ÚTILES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { useAdvancedScroll, useFormScroll, useInfiniteListScroll, usePullToRefreshScroll, useSimpleScroll } from '@/app/_hooks/useAdvancedScroll'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Helper para crear spring configs consistentes
 */
export const createSpringConfig = (preset: 'gentle' | 'bouncy' | 'stiff' | 'slow') => {
  const configs = {
    gentle: { stiffness: 200, damping: 25, mass: 1 },
    bouncy: { stiffness: 400, damping: 20, mass: 0.8 },
    stiff: { stiffness: 500, damping: 35, mass: 1 },
    slow: { stiffness: 100, damping: 20, mass: 1.5 },
  }
  return configs[preset]
}

/**
 * Helper para detectar si está en mobile
 */
export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Helper para detectar si prefiere reduced motion
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Helper para crear clases de glassmorphism
 */
export const createGlassClasses = (options: {
  opacity?: number
  blur?: 'sm' | 'md' | 'lg' | 'xl'
  border?: boolean
  shadow?: boolean
}) => {
  const { opacity = 0.08, blur = 'lg', border = true, shadow = true } = options

  return [
    `bg-white/[${opacity}]`,
    blur === 'sm' && 'backdrop-blur-sm',
    blur === 'md' && 'backdrop-blur-md',
    blur === 'lg' && 'backdrop-blur-lg',
    blur === 'xl' && 'backdrop-blur-xl',
    border && 'border border-white/[0.1]',
    shadow && 'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
  ].filter(Boolean).join(' ')
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🆕 CLEAN SYSTEM 2026 - Componentes limpios sin efectos 3D problemáticos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Clean Cards - Sin 3D tilt inmersivo
export {
    CleanGlassCard, iOSCleanActionCard, iOSCleanExpandableCard, iOSCleanListCard, iOSCleanMetricCard, type CleanGlassCardProps, type ListItem as CleanListItem, type iOSCleanActionCardProps, type iOSCleanExpandableCardProps, type iOSCleanListCardProps, type iOSCleanMetricCardProps
} from '../iOSCleanCards'

// Clean Modals - Con scroll mejorado
export {
    CleanAlert,
    CleanConfirmationSheet, CleanModal, type CleanAlertProps,
    type CleanConfirmationSheetProps, type CleanModalProps, type ConfirmationAction
} from '../iOSCleanModals'

// Clean Navigation - Navegación iOS style
export {
    CleanBreadcrumbs,
    CleanFAB, CleanHeader, CleanQuickActions, CleanTabBar, defaultTabItems, type BreadcrumbItem as CleanBreadcrumbItem,
    type CleanBreadcrumbsProps,
    type FABAction as CleanFABAction,
    type CleanFABProps, type CleanHeaderProps, type QuickAction as CleanQuickAction,
    type CleanQuickActionsProps, type CleanTabBarProps, type TabItem as CleanTabItem
} from '../iOSCleanNavigation'

// Enhanced Scroll System - Sistema de scroll avanzado
export {
    EnhancedScrollContainer,
    FormScrollContainer,
    HorizontalScrollContainer,
    type EnhancedScrollContainerProps,
    type FormScrollContainerProps,
    type HorizontalScrollContainerProps
} from '../EnhancedScrollSystem'

// Motion Settings Provider - Control global de efectos
export {
    DEFAULT_SETTINGS, MotionSettingsContext, MotionSettingsProvider, use3DEffects, useMotionSettings,
    useShouldAnimate, type MotionSettings
} from '../../providers/MotionSettingsProvider'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🍎 iOS ULTIMATE PREMIUM 2026 - Sistema definitivo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Ultimate Premium System
export {
    iOS, iOSBadge,
    iOSBadge as iOSBadgeUltimate, iOSButton as iOSButtonUltimate, iOSCard, iOSContext, iOSInput as iOSInputUltimate, iOSListGroup as iOSListGroupUltimate, iOSListItem as iOSListItemUltimate, iOSProvider, iOSScrollView as iOSScrollViewUltimate, iOSSearchBar as iOSSearchBarUltimate, iOSSheet, iOSToastProvider,
    useToast as useToastUltimate, useiOS
} from './iOSUltimatePremiumSystem'

// Advanced Scroll System
export {
    HorizontalScroll,
    ScrollSnapItem, FormScrollContainer as iOSFormScrollContainer,
    ModalScrollContainer as iOSModalScrollContainer, iOSScrollContainer, useAdvancedScroll as useAdvancedScrollFromSystem, type iOSScrollContainerProps as AdvancedScrollContainerProps,
    type HorizontalScrollProps,
    type ScrollSnapItemProps, type ScrollState
} from './iOSAdvancedScroll'

// Mobile Navigation System
export {
    iOSDrawerMenu,
    iOSFAB as iOSFABMobile, iOSMobileHeader, iOSPageTransition, iOSTabBar as iOSTabBarMobile, useMobileNav, type iOSFABProps as MobileFABProps, type iOSTabBarProps as MobileTabBarProps, type NavItem,
    type QuickAction as NavQuickAction, type iOSDrawerMenuProps, type iOSMobileHeaderProps, type iOSPageTransitionProps
} from './iOSMobileNavigation'

// Advanced Forms System
export {
    iOSCheckbox as iOSCheckboxAdvanced, iOSForm,
    iOSFormGroup, iOSSelect as iOSSelectAdvanced, iOSTextArea as iOSTextAreaAdvanced, iOSTextInput, iOSToggleField, useForm as useFormAdvanced, type iOSCheckboxProps as AdvancedCheckboxProps, type SelectOption as AdvancedSelectOption,
    type iOSSelectProps as AdvancedSelectProps, type iOSTextAreaProps as AdvancedTextAreaProps, type iOSFormGroupProps, type iOSFormProps, type iOSTextInputProps, type iOSToggleFieldProps
} from './iOSAdvancedForms'

// Premium Cards System
export {
    iOSActionCard, iOSEntityCard, iOSInfoCard, iOSMetricCard as iOSMetricCardPremium, type iOSMetricCardProps as PremiumMetricCardProps, type iOSActionCardProps, type iOSEntityCardProps, type iOSInfoCardProps
} from './iOSPremiumCards'

// Toast & Notifications System
export {
    iOSAlert as iOSAlertAdvanced,
    iOSConfirm, iOSToastProvider as iOSToastProviderAdvanced,
    useToast as useToastAdvanced, type iOSAlertProps as AdvancedAlertProps, type Toast as ToastAdvanced, type ToastContextType, type ToastVariant, type iOSConfirmProps,
    type iOSToastProviderProps
} from './iOSToastSystem'

// Integration Wrapper & Layout Components
export {
    defaultNavItems,
    extendedNavItems, iOSEmptyState, iOSGrid, iOSIntegrationWrapper, iOSLoading, iOSPageLayout,
    iOSSection, type iOSEmptyStateProps, type iOSGridProps, type iOSIntegrationWrapperProps, type iOSLoadingProps, type iOSPageLayoutProps,
    type iOSSectionProps
} from './iOSIntegrationWrapper'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CLEAN DESIGN SYSTEM — SIN efectos 3D problemáticos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    CleanButton, CleanDesignProvider, CleanDesignTokens, CleanInput, CleanMetricCard, CleanScrollContainer, useCleanDesign, type CleanButtonProps, type CleanInputProps, type CleanMetricCardProps, type CleanScrollContainerProps
} from './iOSCleanDesignSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ULTRA MODAL SYSTEM — Modales avanzados con scroll
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    UltraAlert,
    UltraConfirmationSheet, UltraDetailModal, UltraFormModal, UltraModal, useModalContext, type ConfirmationOption, type DrawerPosition, type ModalSize, type ModalVariant, type UltraAlertProps,
    type UltraConfirmationSheetProps, type UltraDetailModalProps, type UltraFormModalProps, type UltraModalProps
} from './iOSUltraModalSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOBILE OPTIMIZED SYSTEM — Layout y navegación mobile
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    iOSFABClean,
    iOSHeaderClean, iOSListItem as iOSListItemClean, iOSListSection, iOSPageLayout as iOSPageLayoutClean, iOSSearchBarClean, iOSTabBarClean, type iOSSearchBarProps as CleanSearchBarProps, type ListItemProps, type iOSListSectionProps
} from './iOSMobileOptimized'

