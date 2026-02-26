/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📱 CHRONOS 2026 — iOS MOBILE LAYOUT SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de layout optimizado para móviles con:
 * - Safe area insets automáticos
 * - Gesture navigation support
 * - Bottom sheet integration
 * - Status bar management
 * - Keyboard avoidance
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { ReactNode, createContext, memo, useContext, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXTO DE LAYOUT MÓVIL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MobileLayoutContext {
  isKeyboardVisible: boolean
  keyboardHeight: number
  safeAreaInsets: {
    top: number
    bottom: number
    left: number
    right: number
  }
  orientation: 'portrait' | 'landscape'
  isStandalone: boolean // PWA mode
}

const MobileLayoutContext = createContext<MobileLayoutContext>({
  isKeyboardVisible: false,
  keyboardHeight: 0,
  safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
  orientation: 'portrait',
  isStandalone: false,
})

export const useMobileLayout = () => useContext(MobileLayoutContext)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MobileLayoutProviderProps {
  children: ReactNode
}

export const MobileLayoutProvider = memo(function MobileLayoutProvider({
  children,
}: MobileLayoutProviderProps) {
  const [layoutState, setLayoutState] = useState<MobileLayoutContext>({
    isKeyboardVisible: false,
    keyboardHeight: 0,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
    orientation: 'portrait',
    isStandalone: false,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Detect PWA standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true

    // Get safe area insets from CSS env
    const computedStyle = getComputedStyle(document.documentElement)
    const safeAreaInsets = {
      top: parseInt(computedStyle.getPropertyValue('--sat') || '0') ||
           parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0') || 0,
      bottom: parseInt(computedStyle.getPropertyValue('--sab') || '0') ||
              parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0') || 0,
      left: parseInt(computedStyle.getPropertyValue('--sal') || '0') ||
            parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0') || 0,
      right: parseInt(computedStyle.getPropertyValue('--sar') || '0') ||
             parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0') || 0,
    }

    // Update orientation
    const updateOrientation = () => {
      setLayoutState(prev => ({
        ...prev,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      }))
    }

    // Visual viewport API for keyboard detection
    const visualViewport = window.visualViewport
    if (visualViewport) {
      const handleViewportResize = () => {
        const keyboardHeight = window.innerHeight - visualViewport.height
        setLayoutState(prev => ({
          ...prev,
          isKeyboardVisible: keyboardHeight > 150,
          keyboardHeight: Math.max(0, keyboardHeight),
        }))
      }

      visualViewport.addEventListener('resize', handleViewportResize)
      visualViewport.addEventListener('scroll', handleViewportResize)

      window.addEventListener('resize', updateOrientation)
      window.addEventListener('orientationchange', updateOrientation)

      // Initial values
      setLayoutState({
        isKeyboardVisible: false,
        keyboardHeight: 0,
        safeAreaInsets,
        orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
        isStandalone,
      })

      return () => {
        visualViewport.removeEventListener('resize', handleViewportResize)
        visualViewport.removeEventListener('scroll', handleViewportResize)
        window.removeEventListener('resize', updateOrientation)
        window.removeEventListener('orientationchange', updateOrientation)
      }
    }

    // Fallback when visualViewport API is not available
    window.addEventListener('resize', updateOrientation)
    window.addEventListener('orientationchange', updateOrientation)
    setLayoutState(prev => ({
      ...prev,
      safeAreaInsets,
      orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
      isStandalone,
    }))
    return () => {
      window.removeEventListener('resize', updateOrientation)
      window.removeEventListener('orientationchange', updateOrientation)
    }
  }, [])

  return (
    <MobileLayoutContext.Provider value={layoutState}>
      {children}
    </MobileLayoutContext.Provider>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOBILE SCREEN CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MobileScreenProps {
  children: ReactNode
  header?: ReactNode
  footer?: ReactNode
  tabBar?: ReactNode
  className?: string
  contentClassName?: string
  avoidKeyboard?: boolean
  safeAreaTop?: boolean
  safeAreaBottom?: boolean
}

export const MobileScreen = memo(function MobileScreen({
  children,
  header,
  footer,
  tabBar,
  className,
  contentClassName,
  avoidKeyboard = true,
  safeAreaTop = true,
  safeAreaBottom = true,
}: MobileScreenProps) {
  const { isKeyboardVisible, keyboardHeight, safeAreaInsets } = useMobileLayout()

  return (
    <div
      className={cn(
        'flex flex-col min-h-screen bg-black',
        'transition-all duration-200',
        className
      )}
      style={{
        paddingTop: safeAreaTop ? `max(${safeAreaInsets.top}px, env(safe-area-inset-top))` : 0,
        paddingBottom: avoidKeyboard && isKeyboardVisible
          ? keyboardHeight
          : safeAreaBottom
            ? `max(${safeAreaInsets.bottom}px, env(safe-area-inset-bottom))`
            : 0,
      }}
    >
      {/* Header */}
      {header && (
        <div className="flex-shrink-0 sticky top-0 z-30">
          {header}
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          'flex-1 overflow-y-auto overscroll-contain',
          'scrollbar-none',
          contentClassName
        )}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {children}
      </div>

      {/* Footer */}
      {footer && !isKeyboardVisible && (
        <motion.div
          className="flex-shrink-0 sticky bottom-0 z-30"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
        >
          {footer}
        </motion.div>
      )}

      {/* Tab Bar */}
      <AnimatePresence>
        {tabBar && !isKeyboardVisible && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex-shrink-0"
          >
            {tabBar}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOBILE HEADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MobileHeaderProps {
  title: string
  subtitle?: string
  leftAction?: ReactNode
  rightAction?: ReactNode
  transparent?: boolean
  large?: boolean
  blur?: boolean
  className?: string
}

export const MobileHeader = memo(function MobileHeader({
  title,
  subtitle,
  leftAction,
  rightAction,
  transparent = false,
  large = false,
  blur = true,
  className,
}: MobileHeaderProps) {
  return (
    <motion.header
      className={cn(
        'px-4',
        large ? 'py-4' : 'py-3',
        !transparent && 'border-b border-white/[0.08]',
        !transparent && blur && 'bg-black/80 backdrop-blur-xl',
        transparent && 'bg-transparent',
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3">
        {/* Left */}
        <div className="w-16 flex items-center">
          {leftAction}
        </div>

        {/* Center */}
        <div className="flex-1 text-center">
          <h1
            className={cn(
              'font-semibold text-white truncate',
              large ? 'text-xl' : 'text-[17px]'
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-[12px] text-white/50 truncate mt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right */}
        <div className="w-16 flex items-center justify-end">
          {rightAction}
        </div>
      </div>
    </motion.header>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOBILE SECTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MobileSectionProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  contentClassName?: string
}

export const MobileSection = memo(function MobileSection({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
}: MobileSectionProps) {
  return (
    <section className={cn('mb-6', className)}>
      {(title || action) && (
        <div className="flex items-center justify-between px-4 mb-3">
          <div>
            {title && (
              <h2 className="text-[13px] font-semibold text-white/50 uppercase tracking-wide">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[12px] text-white/40 mt-0.5">{subtitle}</p>
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
// MOBILE CARD CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MobileCardContainerProps {
  children: ReactNode
  className?: string
}

export const MobileCardContainer = memo(function MobileCardContainer({
  children,
  className,
}: MobileCardContainerProps) {
  return (
    <div className={cn('mx-4', className)}>
      <div className="bg-white/[0.04] rounded-2xl border border-white/[0.08] overflow-hidden divide-y divide-white/[0.06]">
        {children}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOBILE EMPTY STATE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MobileEmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export const MobileEmptyState = memo(function MobileEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: MobileEmptyStateProps) {
  return (
    <motion.div
      className={cn(
        'flex flex-col items-center justify-center text-center px-8 py-16',
        className
      )}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-4 text-white/30">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-[14px] text-white/50 max-w-xs mb-6">{description}</p>
      )}
      {action}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOBILE LOADING STATE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MobileLoadingStateProps {
  message?: string
  className?: string
}

export const MobileLoadingState = memo(function MobileLoadingState({
  message = 'Cargando...',
  className,
}: MobileLoadingStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16', className)}>
      <motion.div
        className="w-10 h-10 rounded-full border-2 border-violet-500/20 border-t-violet-500"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <p className="mt-4 text-[14px] text-white/50">{message}</p>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
    MobileCardContainerProps,
    MobileEmptyStateProps, MobileHeaderProps, MobileLayoutContext, MobileLoadingStateProps, MobileScreenProps, MobileSectionProps
}

