/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧭 CHRONOS 2026 — iOS PREMIUM NAVIGATION SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de navegación premium estilo iOS con:
 * - Tab Bar con animaciones fluidas
 * - Navigation Stack con transiciones
 * - Floating Action Button premium
 * - Bottom Sheet Navigation
 * - Page indicators
 * - Breadcrumbs elegantes
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { ChevronRight, LucideIcon, Plus } from 'lucide-react'
import { AnimatePresence, motion, PanInfo, useMotionValue, useSpring } from 'motion/react'
import { createContext, memo, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS TAB BAR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TabItem {
  id: string
  label: string
  icon: LucideIcon
  badge?: number | string
  disabled?: boolean
}

interface iOSTabBarProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'default' | 'floating' | 'minimal'
  showLabels?: boolean
  className?: string
}

export const iOSTabBar = memo(function iOSTabBar({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  showLabels = true,
  className,
}: iOSTabBarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  // Update indicator position
  useEffect(() => {
    if (!containerRef.current) return

    const activeIndex = tabs.findIndex(t => t.id === activeTab)
    const tabElements = containerRef.current.querySelectorAll('[data-tab]')
    const activeElement = tabElements[activeIndex] as HTMLElement

    if (activeElement) {
      setIndicatorStyle({
        left: activeElement.offsetLeft,
        width: activeElement.offsetWidth,
      })
    }
  }, [activeTab, tabs])

  return (
    <nav
      ref={containerRef}
      className={cn(
        'fixed bottom-0 inset-x-0 z-50 safe-area-inset-bottom',
        variant === 'default' && [
          'bg-black/80 backdrop-blur-xl',
          'border-t border-white/[0.08]',
        ],
        variant === 'floating' && [
          'mx-4 mb-4 rounded-2xl',
          'bg-[#1C1C1E]/95 backdrop-blur-xl',
          'border border-white/[0.12]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
        ],
        variant === 'minimal' && [
          'bg-transparent',
        ],
        className
      )}
    >
      {/* Indicator */}
      {variant !== 'minimal' && (
        <motion.div
          className="absolute top-0 h-0.5 bg-violet-500 rounded-full"
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          const Icon = tab.icon

          return (
            <motion.button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => !tab.disabled && onTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl',
                'transition-colors duration-150',
                isActive ? 'text-violet-400' : 'text-white/50',
                !tab.disabled && !isActive && 'hover:text-white/70 active:bg-white/5',
                tab.disabled && 'opacity-40 cursor-not-allowed'
              )}
              whileTap={!tab.disabled ? { scale: 0.95 } : undefined}
            >
              <div className="relative">
                <Icon className={cn('h-6 w-6', isActive && 'drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]')} />

                {/* Badge */}
                {tab.badge !== undefined && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      'absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1',
                      'flex items-center justify-center',
                      'text-[10px] font-bold text-white',
                      'bg-red-500 rounded-full',
                      'border-2 border-black/50'
                    )}
                  >
                    {typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
                  </motion.span>
                )}
              </div>

              {showLabels && (
                <span className="text-[10px] font-medium">{tab.label}</span>
              )}

              {/* Active indicator dot for minimal variant */}
              {variant === 'minimal' && isActive && (
                <motion.div
                  layoutId="tab-dot"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-violet-400"
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS FLOATING ACTION BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FABAction {
  id: string
  icon: LucideIcon
  label: string
  onClick: () => void
  color?: string
}

interface iOSFABProps {
  icon?: LucideIcon
  actions?: FABAction[]
  onClick?: () => void
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left'
  offset?: { bottom?: number; side?: number }
  variant?: 'default' | 'extended'
  label?: string
  className?: string
}

export const iOSFAB = memo(function iOSFAB({
  icon: MainIcon = Plus,
  actions,
  onClick,
  position = 'bottom-right',
  offset = { bottom: 100, side: 20 },
  variant = 'default',
  label,
  className,
}: iOSFABProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const positionClasses = {
    'bottom-right': 'right-5',
    'bottom-center': 'left-1/2 -translate-x-1/2',
    'bottom-left': 'left-5',
  }

  const handleMainClick = useCallback(() => {
    if (actions && actions.length > 0) {
      setIsExpanded(!isExpanded)
    } else {
      onClick?.()
    }
  }, [actions, isExpanded, onClick])

  return (
    <div
      className={cn(
        'fixed z-40',
        positionClasses[position],
        className
      )}
      style={{
        bottom: offset.bottom,
        ...(position !== 'bottom-center' && { [position === 'bottom-right' ? 'right' : 'left']: offset.side }),
      }}
    >
      {/* Action buttons */}
      <AnimatePresence>
        {isExpanded && actions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 right-0 flex flex-col-reverse items-end gap-3 mb-2"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick()
                  setIsExpanded(false)
                }}
                className="flex items-center gap-3 group"
              >
                {/* Label */}
                <span className="px-3 py-1.5 rounded-lg bg-[#2C2C2E]/95 backdrop-blur-xl text-[13px] text-white font-medium shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  {action.label}
                </span>

                {/* Icon button */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                  style={{ backgroundColor: action.color || '#8B5CF6' }}
                >
                  <action.icon className="h-5 w-5 text-white" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        onClick={handleMainClick}
        className={cn(
          'relative flex items-center justify-center shadow-[0_8px_24px_rgba(139,92,246,0.4)]',
          'bg-gradient-to-br from-violet-500 to-violet-600',
          'transition-all duration-200',
          variant === 'default' && 'w-14 h-14 rounded-full',
          variant === 'extended' && 'h-14 px-6 rounded-full gap-2'
        )}
        animate={{ rotate: isExpanded ? 45 : 0 }}
        whileTap={{ scale: 0.95 }}
      >
        <MainIcon className="h-6 w-6 text-white" />
        {variant === 'extended' && label && (
          <span className="text-[15px] font-semibold text-white">{label}</span>
        )}

        {/* Pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-violet-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.button>

      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm -z-10"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS BREADCRUMBS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface BreadcrumbItem {
  id: string
  label: string
  href?: string
  icon?: LucideIcon
  onClick?: () => void
}

interface iOSBreadcrumbsProps {
  items: BreadcrumbItem[]
  separator?: ReactNode
  maxItems?: number
  className?: string
}

export const iOSBreadcrumbs = memo(function iOSBreadcrumbs({
  items,
  separator,
  maxItems = 4,
  className,
}: iOSBreadcrumbsProps) {
  const displayItems = items.length > maxItems
    ? [items[0], { id: 'ellipsis', label: '...' }, ...items.slice(-2)]
    : items

  return (
    <nav className={cn('flex items-center gap-1.5 overflow-x-auto', className)}>
      {displayItems.map((item, index) => {
        if (!item) return null
        const isLast = index === displayItems.length - 1
        const Icon = item.icon

        return (
          <div key={item.id} className="flex items-center gap-1.5 flex-shrink-0">
            {item.id === 'ellipsis' ? (
              <span className="text-[13px] text-white/40">...</span>
            ) : (
              <motion.button
                onClick={item.onClick}
                disabled={isLast}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-lg text-[13px]',
                  'transition-colors duration-150',
                  isLast
                    ? 'text-white font-medium cursor-default'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
                whileTap={!isLast ? { scale: 0.97 } : undefined}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span className="truncate max-w-[120px]">{item.label}</span>
              </motion.button>
            )}

            {!isLast && (
              <span className="text-white/30">
                {separator || <ChevronRight className="h-3.5 w-3.5" />}
              </span>
            )}
          </div>
        )
      })}
    </nav>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS PAGE INDICATOR (DOTS)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSPageIndicatorProps {
  total: number
  current: number
  onPageChange?: (page: number) => void
  variant?: 'dots' | 'lines' | 'numbers'
  className?: string
}

export const iOSPageIndicator = memo(function iOSPageIndicator({
  total,
  current,
  onPageChange,
  variant = 'dots',
  className,
}: iOSPageIndicatorProps) {
  if (variant === 'numbers') {
    return (
      <div className={cn('flex items-center gap-2 text-[13px]', className)}>
        <span className="text-white font-medium">{current + 1}</span>
        <span className="text-white/40">/</span>
        <span className="text-white/40">{total}</span>
      </div>
    )
  }

  if (variant === 'lines') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {Array.from({ length: total }).map((_, index) => (
          <motion.button
            key={index}
            onClick={() => onPageChange?.(index)}
            className={cn(
              'h-1 rounded-full transition-colors duration-200',
              index === current ? 'bg-violet-400' : 'bg-white/20 hover:bg-white/30'
            )}
            animate={{
              width: index === current ? 24 : 12,
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Array.from({ length: total }).map((_, index) => (
        <motion.button
          key={index}
          onClick={() => onPageChange?.(index)}
          className={cn(
            'w-2 h-2 rounded-full transition-colors duration-200',
            index === current ? 'bg-violet-400' : 'bg-white/20 hover:bg-white/30'
          )}
          animate={{
            scale: index === current ? 1.2 : 1,
          }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS NAVIGATION STACK (PAGE TRANSITIONS)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NavigationStackContextValue {
  push: (id: string) => void
  pop: () => void
  replace: (id: string) => void
  currentPage: string
  canGoBack: boolean
}

const NavigationStackContext = createContext<NavigationStackContextValue | null>(null)

export const useNavigationStack = () => {
  const context = useContext(NavigationStackContext)
  if (!context) {
    throw new Error('useNavigationStack must be used within iOSNavigationStack')
  }
  return context
}

interface iOSNavigationStackProps {
  initialPage: string
  children: ReactNode
  className?: string
}

export const iOSNavigationStack = memo(function iOSNavigationStack({
  initialPage,
  children,
  className,
}: iOSNavigationStackProps) {
  const [stack, setStack] = useState<string[]>([initialPage])
  const currentPage = stack[stack.length - 1] ?? ''

  const push = useCallback((id: string) => {
    setStack(prev => [...prev, id])
  }, [])

  const pop = useCallback(() => {
    setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev)
  }, [])

  const replace = useCallback((id: string) => {
    setStack(prev => [...prev.slice(0, -1), id])
  }, [])

  return (
    <NavigationStackContext.Provider
      value={{
        push,
        pop,
        replace,
        currentPage,
        canGoBack: stack.length > 1,
      }}
    >
      <div className={cn('relative overflow-hidden', className)}>
        {children}
      </div>
    </NavigationStackContext.Provider>
  )
})

interface iOSNavigationPageProps {
  id: string
  children: ReactNode
  className?: string
}

export const iOSNavigationPage = memo(function iOSNavigationPage({
  id,
  children,
  className,
}: iOSNavigationPageProps) {
  const { currentPage } = useNavigationStack()
  const isActive = currentPage === id

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '-30%', opacity: 0 }}
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 30,
            mass: 0.8,
          }}
          className={cn('absolute inset-0', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS QUICK ACTIONS MENU
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  onClick: () => void
  destructive?: boolean
  disabled?: boolean
}

interface iOSQuickActionsProps {
  actions: QuickAction[]
  trigger: ReactNode
  className?: string
}

export const iOSQuickActions = memo(function iOSQuickActions({
  actions,
  trigger,
  className,
}: iOSQuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<'top' | 'bottom'>('bottom')
  const triggerRef = useRef<HTMLDivElement>(null)

  const handleOpen = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setPosition(spaceBelow < 200 ? 'top' : 'bottom')
    }
    setIsOpen(true)
  }, [])

  return (
    <div ref={triggerRef} className={cn('relative', className)}>
      <div onClick={handleOpen}>{trigger}</div>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: position === 'bottom' ? -10 : 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: position === 'bottom' ? -10 : 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={cn(
                'absolute z-50 min-w-[200px] rounded-xl overflow-hidden',
                'bg-[#2C2C2E]/98 backdrop-blur-xl',
                'border border-white/[0.12]',
                'shadow-[0_16px_48px_rgba(0,0,0,0.4)]',
                position === 'bottom' ? 'top-full mt-2' : 'bottom-full mb-2',
                'right-0'
              )}
            >
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  onClick={() => {
                    if (!action.disabled) {
                      action.onClick()
                      setIsOpen(false)
                    }
                  }}
                  disabled={action.disabled}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-left',
                    'transition-colors duration-100',
                    index !== 0 && 'border-t border-white/[0.08]',
                    action.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:bg-white/[0.06] active:bg-white/[0.1]',
                    action.destructive ? 'text-red-400' : 'text-white'
                  )}
                  whileTap={!action.disabled ? { scale: 0.98 } : undefined}
                >
                  <action.icon className="h-4.5 w-4.5 flex-shrink-0" />
                  <span className="text-[15px]">{action.label}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS SWIPE TO GO BACK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSSwipeBackProps {
  onBack: () => void
  children: ReactNode
  enabled?: boolean
  threshold?: number
  className?: string
}

export const iOSSwipeBack = memo(function iOSSwipeBack({
  onBack,
  children,
  enabled = true,
  threshold = 100,
  className,
}: iOSSwipeBackProps) {
  const x = useMotionValue(0)
  const opacity = useSpring(1, { stiffness: 300, damping: 30 })
  const [isDragging, setIsDragging] = useState(false)

  const handleDragStart = useCallback(() => {
    if (enabled) setIsDragging(true)
  }, [enabled])

  const handleDrag = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!enabled || info.offset.x < 0) return
    x.set(info.offset.x)
    opacity.set(1 - info.offset.x / 300)
  }, [enabled, x, opacity])

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false)

    if (info.offset.x > threshold && enabled) {
      onBack()
    }

    x.set(0)
    opacity.set(1)
  }, [threshold, enabled, onBack, x, opacity])

  return (
    <motion.div
      drag={enabled ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{ x, opacity }}
      className={cn('touch-pan-y', className)}
    >
      {/* Edge indicator */}
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-50 p-3 rounded-r-full bg-violet-500/80"
          >
            <ChevronRight className="h-5 w-5 text-white rotate-180" />
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
    BreadcrumbItem, FABAction, iOSBreadcrumbsProps, iOSFABProps, iOSNavigationPageProps, iOSNavigationStackProps, iOSPageIndicatorProps, iOSQuickActionsProps,
    iOSSwipeBackProps, iOSTabBarProps, QuickAction, TabItem
}

