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
  // Core components
  iOSGlassCard,
  iOSNavBar,
  iOSSearchBar,
  iOSListItem,
  iOSListGroup,
  iOSButton,
  iOSSegmentedControl,
  iOSToggle,
  iOSActionSheet,
  iOSPill,
  iOSProgress,
  iOSSkeleton,
  // Context
  iOSThemeContext,
  useiOSTheme,
  // Types
  type iOSGlassCardProps,
  type iOSNavBarProps,
  type iOSSearchBarProps,
  type iOSListItemProps,
  type iOSListGroupProps,
  type iOSButtonProps,
  type iOSSegmentedControlProps,
  type iOSToggleProps,
  type iOSActionSheetProps,
  type ActionSheetOption,
  type iOSPillProps,
  type iOSProgressProps,
  type iOSSkeletonProps,
} from '../iOSPremiumSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MODAL SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  iOSModal,
  iOSAlert,
  iOSConfirmationSheet,
  ModalScrollContainer,
  type iOSModalProps,
  type iOSAlertProps,
  type iOSConfirmationSheetProps,
} from '../iOSModalSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  iOSInput,
  iOSTextArea,
  iOSSelect,
  iOSCheckbox,
  iOSRadioGroup,
  iOSNumberInput,
  iOSFormContainer,
  iOSFormSection,
  useFormContext,
  type iOSInputProps,
  type iOSTextAreaProps,
  type iOSSelectProps,
  type SelectOption,
  type iOSCheckboxProps,
  type iOSRadioGroupProps,
  type RadioOption,
  type iOSNumberInputProps,
  type iOSFormContainerProps,
  type iOSFormSectionProps,
} from '../iOSFormSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NAVIGATION SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  iOSTabBar,
  iOSFAB,
  iOSBreadcrumbs,
  iOSPageIndicator,
  iOSNavigationStack,
  iOSNavigationPage,
  iOSQuickActions,
  iOSSwipeBack,
  useNavigationStack,
  type TabItem,
  type iOSTabBarProps,
  type FABAction,
  type iOSFABProps,
  type BreadcrumbItem,
  type iOSBreadcrumbsProps,
  type iOSPageIndicatorProps,
  type iOSNavigationStackProps,
  type iOSNavigationPageProps,
  type QuickAction,
  type iOSQuickActionsProps,
  type iOSSwipeBackProps,
} from '../iOSNavigationSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SCROLL CONTAINERS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  iOSScrollView,
  iOSPullToRefresh,
  iOSHorizontalScroll,
  iOSCarouselItem,
  iOSCollapsibleHeader,
  iOSInfiniteScroll,
  iOSSectionList,
  type iOSScrollViewProps,
  type iOSPullToRefreshProps,
  type iOSHorizontalScrollProps,
  type iOSCarouselItemProps,
  type iOSCollapsibleHeaderProps,
  type iOSInfiniteScrollProps,
  type iOSSectionListProps,
  type Section,
} from '../iOSScrollContainers'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CARDS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  iOSMetricCard,
  iOSListCard,
  iOSExpandableCard,
  iOSFeatureCard,
  iOSTransactionCard,
  iOSStatsCard,
  type iOSMetricCardProps,
  type iOSListCardProps,
  type iOSExpandableCardProps,
  type iOSFeatureCardProps,
  type iOSTransactionCardProps,
  type iOSStatsCardProps,
  type StatItem,
} from '../iOSCardsSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ADVANCED INTERACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  HapticProvider,
  useHaptic,
  iOSSwipeActions,
  iOSLongPressMenu,
  iOSPullDownMenu,
  iOSDraggableList,
  iOSPeekPreview,
  createDefaultSwipeActions,
  createDefaultLongPressItems,
  type SwipeAction,
  type LongPressMenuItem,
  type PullDownMenuItem,
  type PullDownMenuSection,
} from '../iOSAdvancedInteractions'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VISUAL EFFECTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

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
  type iOSShimmerProps,
  type iOSMorphGradientProps,
  type iOSGlowProps,
  type iOSRainbowBorderProps,
  type iOSParticlesProps,
  type iOSBlurTransitionProps,
  type iOSRippleProps,
  type iOSRevealProps,
  type iOSStaggerChildrenProps,
  type iOSGradientTextProps,
  type iOSCounterProps,
  type iOSTypingEffectProps,
} from '../iOSVisualEffects'
// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOBILE LAYOUT SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  MobileLayoutProvider,
  MobileScreen,
  MobileHeader,
  MobileSection,
  MobileCardContainer,
  MobileEmptyState,
  MobileLoadingState,
  useMobileLayout,
  type MobileLayoutContext,
  type MobileScreenProps,
  type MobileHeaderProps,
  type MobileSectionProps,
  type MobileCardContainerProps,
  type MobileEmptyStateProps,
  type MobileLoadingStateProps,
} from '../iOSMobileLayout'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOTION SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  MotionSettingsModal,
  MotionSettingsCompact,
  type MotionSettingsModalProps,
  type MotionSettingsCompactProps,
} from '../MotionSettings'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TOAST SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  ToastProvider,
  useToast,
  type Toast,
  type ToastType,
  type ToastPosition,
  type ToastContextValue,
  type ToastProviderProps,
} from '../iOSToastSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD QUICK ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  iOSDashboardQuickActions,
  QuickActionGroup,
  FloatingQuickBar,
  type QuickAction as DashboardQuickAction,
  type iOSDashboardQuickActionsProps,
  type QuickActionGroupProps,
  type FloatingQuickBarProps,
} from '../iOSDashboardQuickActions'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FINANCIAL SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  iOSFinancialSummary,
  iOSFinancialSummaryCompact,
  type FinancialMetric,
  type iOSFinancialSummaryProps,
  type iOSFinancialSummaryCompactProps,
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

export { useAdvancedScroll, useSimpleScroll, useFormScroll, useInfiniteListScroll, usePullToRefreshScroll } from '@/app/_hooks/useAdvancedScroll'

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
  CleanGlassCard,
  iOSCleanMetricCard,
  iOSCleanListCard,
  iOSCleanExpandableCard,
  iOSCleanActionCard,
  type CleanGlassCardProps,
  type iOSCleanMetricCardProps,
  type iOSCleanListCardProps,
  type iOSCleanExpandableCardProps,
  type iOSCleanActionCardProps,
  type ListItem as CleanListItem,
} from '../iOSCleanCards'

// Clean Modals - Con scroll mejorado
export {
  CleanModal,
  CleanAlert,
  CleanConfirmationSheet,
  type CleanModalProps,
  type CleanAlertProps,
  type CleanConfirmationSheetProps,
  type ConfirmationAction,
} from '../iOSCleanModals'

// Clean Navigation - Navegación iOS style
export {
  CleanTabBar,
  CleanHeader,
  CleanBreadcrumbs,
  CleanFAB,
  CleanQuickActions,
  defaultTabItems,
  type TabItem as CleanTabItem,
  type CleanTabBarProps,
  type CleanHeaderProps,
  type BreadcrumbItem as CleanBreadcrumbItem,
  type CleanBreadcrumbsProps,
  type FABAction as CleanFABAction,
  type CleanFABProps,
  type QuickAction as CleanQuickAction,
  type CleanQuickActionsProps,
} from '../iOSCleanNavigation'

// Enhanced Scroll System - Sistema de scroll avanzado
export {
  EnhancedScrollContainer,
  FormScrollContainer,
  HorizontalScrollContainer,
  type EnhancedScrollContainerProps,
  type FormScrollContainerProps,
  type HorizontalScrollContainerProps,
} from '../EnhancedScrollSystem'

// Motion Settings Provider - Control global de efectos
export {
  MotionSettingsProvider,
  useMotionSettings,
  useShouldAnimate,
  use3DEffects,
  MotionSettingsContext,
  DEFAULT_SETTINGS,
  type MotionSettings,
} from '../../providers/MotionSettingsProvider'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🍎 iOS ULTIMATE PREMIUM 2026 - Sistema definitivo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Ultimate Premium System
export {
  iOS,
  iOSContext,
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
} from './iOSUltimatePremiumSystem'

// Advanced Scroll System
export {
  iOSScrollContainer,
  FormScrollContainer as iOSFormScrollContainer,
  ModalScrollContainer as iOSModalScrollContainer,
  HorizontalScroll,
  ScrollSnapItem,
  useAdvancedScroll,
  type ScrollState,
  type iOSScrollContainerProps as AdvancedScrollContainerProps,
  type HorizontalScrollProps,
  type ScrollSnapItemProps,
} from './iOSAdvancedScroll'

// Mobile Navigation System
export {
  iOSTabBar as iOSTabBarMobile,
  iOSMobileHeader,
  iOSDrawerMenu,
  iOSFAB as iOSFABMobile,
  iOSPageTransition,
  useMobileNav,
  type NavItem,
  type QuickAction as NavQuickAction,
  type iOSTabBarProps as MobileTabBarProps,
  type iOSMobileHeaderProps,
  type iOSDrawerMenuProps,
  type iOSFABProps as MobileFABProps,
  type iOSPageTransitionProps,
} from './iOSMobileNavigation'

// Advanced Forms System
export {
  iOSForm,
  iOSFormGroup,
  iOSTextInput,
  iOSTextArea as iOSTextAreaAdvanced,
  iOSSelect as iOSSelectAdvanced,
  iOSToggleField,
  iOSCheckbox as iOSCheckboxAdvanced,
  useForm as useFormAdvanced,
  type iOSFormProps,
  type iOSFormGroupProps,
  type iOSTextInputProps,
  type iOSTextAreaProps as AdvancedTextAreaProps,
  type SelectOption as AdvancedSelectOption,
  type iOSSelectProps as AdvancedSelectProps,
  type iOSToggleFieldProps,
  type iOSCheckboxProps as AdvancedCheckboxProps,
} from './iOSAdvancedForms'

// Premium Cards System
export {
  iOSMetricCard as iOSMetricCardPremium,
  iOSInfoCard,
  iOSEntityCard,
  iOSActionCard,
  type iOSMetricCardProps as PremiumMetricCardProps,
  type iOSInfoCardProps,
  type iOSEntityCardProps,
  type iOSActionCardProps,
} from './iOSPremiumCards'

// Toast & Notifications System
export {
  iOSToastProvider as iOSToastProviderAdvanced,
  useToast as useToastAdvanced,
  iOSAlert as iOSAlertAdvanced,
  iOSConfirm,
  type Toast,
  type ToastVariant,
  type ToastContextType,
  type iOSAlertProps as AdvancedAlertProps,
  type iOSConfirmProps,
  type iOSToastProviderProps,
} from './iOSToastSystem'

// Integration Wrapper & Layout Components
export {
  iOSIntegrationWrapper,
  iOSPageLayout,
  iOSSection,
  iOSGrid,
  iOSEmptyState,
  iOSLoading,
  defaultNavItems,
  extendedNavItems,
  type iOSIntegrationWrapperProps,
  type iOSPageLayoutProps,
  type iOSSectionProps,
  type iOSGridProps,
  type iOSEmptyStateProps,
  type iOSLoadingProps,
} from './iOSIntegrationWrapper'
