/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎯 CHRONOS 2026 — iOS INTEGRATION WRAPPER
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Wrapper que integra todos los sistemas iOS Premium:
 * - Toast Provider
 * - iOS Context Provider
 * - Motion Preferences
 * - Tab Bar Navigation (mobile)
 * - Safe area support
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { memo, ReactNode, useEffect, useState } from 'react'

// Import iOS Systems
import {
    BarChart3,
    DollarSign,
    Home,
    Landmark,
    Package,
    Receipt,
    Settings,
    Sparkles,
    Truck,
    Users,
} from 'lucide-react'
import { iOSMobileHeader, iOSTabBar, type NavItem } from './iOSMobileNavigation'
import { iOSToastProvider } from './iOSToastSystem'
import { iOSProvider as IOSProvider } from './iOSUltimatePremiumSystem'

const IOSToastProvider = iOSToastProvider
const IOSMobileHeader = iOSMobileHeader
const IOSTabBar = iOSTabBar

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NAVIGATION CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const defaultNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Inicio',
    icon: Home,
    href: '/dashboard',
  },
  {
    id: 'ventas',
    label: 'Ventas',
    icon: DollarSign,
    href: '/ventas',
  },
  {
    id: 'bancos',
    label: 'Bancos',
    icon: Landmark,
    href: '/bancos',
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: Users,
    href: '/clientes',
  },
  {
    id: 'almacen',
    label: 'Almacén',
    icon: Package,
    href: '/almacen',
  },
]

const extendedNavItems: NavItem[] = [
  ...defaultNavItems,
  {
    id: 'distribuidores',
    label: 'Distribuidores',
    icon: Truck,
    href: '/distribuidores',
  },
  {
    id: 'ordenes',
    label: 'Órdenes',
    icon: Receipt,
    href: '/ordenes',
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart3,
    href: '/reportes',
  },
  {
    id: 'ai',
    label: 'IA',
    icon: Sparkles,
    href: '/ia',
  },
  {
    id: 'configuracion',
    label: 'Config',
    icon: Settings,
    href: '/configuracion',
  },
]

import { KocmocUIWrapper } from '@/app/_components/cinematics/KocmocCommon'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS INTEGRATION WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSIntegrationWrapperProps {
  children: ReactNode
  className?: string
  // Options
  showTabBar?: boolean
  showHeader?: boolean
  headerTitle?: string
  headerSubtitle?: string
  headerShowBack?: boolean
  onHeaderBack?: () => void
  headerRightAction?: ReactNode
  // Tab bar
  tabBarVariant?: 'floating' | 'docked'
  navItems?: NavItem[]
  // Toast position
  toastPosition?: 'top' | 'bottom' | 'top-right' | 'bottom-right'
}

export const iOSIntegrationWrapper = memo(function iOSIntegrationWrapper({
  children,
  className,
  showTabBar = true,
  showHeader = false,
  headerTitle,
  headerSubtitle,
  headerShowBack = false,
  onHeaderBack,
  headerRightAction,
  tabBarVariant = 'floating',
  navItems = defaultNavItems,
  toastPosition = 'top',
}: iOSIntegrationWrapperProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <IOSProvider accentColor="#8B5CF6" blurIntensity="high">
      <IOSToastProvider position={toastPosition}>
        <KocmocUIWrapper className={className} transparent={true} showParticles={false}>
          {/* Mobile Header */}
          {showHeader && isMobile && headerTitle && (
            <IOSMobileHeader
              title={headerTitle}
              subtitle={headerSubtitle}
              showBackButton={headerShowBack}
              onBack={onHeaderBack}
              rightAction={headerRightAction}
            />
          )}

          {/* Main Content */}
          <main
            className={cn(
              'relative',
              isMobile && showTabBar && 'pb-24', // Space for tab bar
            )}
          >
            {children}
          </main>

          {/* Mobile Tab Bar */}
          {showTabBar && isMobile && (
            <IOSTabBar
              items={navItems}
              variant={tabBarVariant}
              showLabels
              showQuickActions
            />
          )}
        </KocmocUIWrapper>
      </IOSToastProvider>
    </IOSProvider>
  )
})

import { KocmocMiniLogo } from '@/app/_components/cinematics/KocmocCommon'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS PAGE LAYOUT - Layout para páginas individuales
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSPageLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  showHeader?: boolean
  showBackButton?: boolean
  headerRightAction?: ReactNode
  className?: string
  contentClassName?: string
  scrollable?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const maxWidthClasses = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}

const paddingClasses = {
  none: '',
  sm: 'px-4 py-4',
  md: 'px-4 py-6 md:px-6',
  lg: 'px-4 py-8 md:px-8',
}

export const iOSPageLayout = memo(function iOSPageLayout({
  children,
  title,
  subtitle,
  showHeader = true,
  showBackButton = false,
  headerRightAction,
  className,
  contentClassName,
  scrollable = true,
  maxWidth = 'xl',
  padding = 'md',
}: iOSPageLayoutProps) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className={cn('min-h-screen', className)}>
      {/* Mobile Header */}
      {showHeader && isMobile && title && (
        <IOSMobileHeader
          title={title}
          subtitle={subtitle}
          showBackButton={showBackButton}
          rightAction={headerRightAction}
          large={!showBackButton}
        />
      )}

      {/* Desktop Header */}
      {showHeader && !isMobile && title && (
        <div className="px-6 py-8 border-b border-white/[0.06] flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-4 mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
              <KocmocMiniLogo className="opacity-50 scale-75 origin-left" />
            </div>
            {subtitle && (
              <p className="text-white/50">{subtitle}</p>
            )}
          </motion.div>

          {headerRightAction && (
            <div className="flex items-center gap-3">
              {headerRightAction}
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          'mx-auto',
          maxWidthClasses[maxWidth],
          paddingClasses[padding],
          isMobile && 'pb-24', // Space for tab bar
          contentClassName
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={title}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS SECTION - Sección de contenido con título
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSSectionProps {
  children: ReactNode
  title?: string
  description?: string
  action?: ReactNode
  className?: string
  contentClassName?: string
}

export const iOSSection = memo(function iOSSection({
  children,
  title,
  description,
  action,
  className,
  contentClassName,
}: iOSSectionProps) {
  return (
    <section className={cn('mb-8', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-white/50 mt-0.5">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      <div className={contentClassName}>{children}</div>
    </section>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS GRID - Grid responsive
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSGridProps {
  children: ReactNode
  cols?: 1 | 2 | 3 | 4 | 5 | 6
  gap?: 'sm' | 'md' | 'lg'
  className?: string
}

export const iOSGrid = memo(function iOSGrid({
  children,
  cols = 3,
  gap = 'md',
  className,
}: iOSGridProps) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
  }

  const gapClasses = {
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
  }

  return (
    <div className={cn('grid', colClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS EMPTY STATE - Estado vacío
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSEmptyStateProps {
  icon?: React.ComponentType<{ size?: number; className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export const iOSEmptyState = memo(function iOSEmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: iOSEmptyStateProps) {
  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/[0.05] flex items-center justify-center mb-4">
          <Icon size={32} className="text-white/30" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-white/50 max-w-sm">{description}</p>
      )}
      {action && (
        <motion.button
          onClick={action.onClick}
          className={cn(
            'mt-6 px-6 py-2.5 rounded-xl',
            'bg-violet-500 text-white font-medium',
            'hover:bg-violet-400 transition-colors',
            'shadow-[0_4px_12px_rgba(139,92,246,0.3)]'
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS LOADING - Estado de carga
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSLoadingProps {
  text?: string
  variant?: 'spinner' | 'dots' | 'pulse'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const iOSLoading = memo(function iOSLoading({
  text,
  variant = 'spinner',
  size = 'md',
  className,
}: iOSLoadingProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      {variant === 'spinner' && (
        <motion.div
          className={cn(
            'border-2 border-white/20 border-t-violet-500 rounded-full',
            sizeClasses[size]
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      )}
      {variant === 'dots' && (
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-violet-500 rounded-full"
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      )}
      {variant === 'pulse' && (
        <motion.div
          className={cn('bg-violet-500/50 rounded-full', sizeClasses[size])}
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {text && (
        <p className="text-sm text-white/50">{text}</p>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    defaultNavItems,
    extendedNavItems
}

export type {
    iOSEmptyStateProps, iOSGridProps, iOSIntegrationWrapperProps, iOSLoadingProps, iOSPageLayoutProps,
    iOSSectionProps
}

