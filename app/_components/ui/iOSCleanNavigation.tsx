/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧭 CHRONOS 2026 — iOS CLEAN NAVIGATION SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de navegación iOS-style limpio:
 * - Tab bar inferior optimizado para mobile
 * - Header con navegación fluida
 * - Navegación por gestos (swipe back)
 * - Breadcrumbs elegantes
 * - FAB (Floating Action Button)
 * - Quick actions
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import {
    ArrowLeft,
    ChevronRight,
    Home,
    LucideIcon,
    MoreHorizontal,
    Plus,
    ShoppingCart,
    Users,
    Wallet
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { usePathname, useRouter } from 'next/navigation'
import { memo, ReactNode, useCallback, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TAB BAR - Navegación inferior iOS-style
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TabItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  badge?: number
}

interface CleanTabBarProps {
  items: TabItem[]
  activeId?: string
  onTabChange?: (id: string) => void
  className?: string
  showLabels?: boolean
  variant?: 'default' | 'pill' | 'minimal'
  accentColor?: string
}

export const CleanTabBar = memo(function CleanTabBar({
  items,
  activeId,
  onTabChange,
  className,
  showLabels = true,
  variant = 'default',
  accentColor = '#8B5CF6',
}: CleanTabBarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const currentId = activeId || items.find(
    item => pathname === item.href || pathname.startsWith(item.href + '/')
  )?.id

  const handleTabClick = useCallback((item: TabItem) => {
    onTabChange?.(item.id)
    router.push(item.href)
  }, [onTabChange, router])

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-zinc-900/90 backdrop-blur-2xl',
        'border-t border-white/[0.06]',
        'safe-area-inset-bottom',
        className
      )}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(item => {
          const Icon = item.icon
          const isActive = item.id === currentId

          return (
            <motion.button
              key={item.id}
              onClick={() => handleTabClick(item)}
              className={cn(
                'relative flex flex-col items-center justify-center',
                'min-w-[64px] py-2 px-3 rounded-xl',
                'transition-colors duration-150',
                variant === 'pill' && isActive && 'bg-white/[0.08]'
              )}
              whileTap={{ scale: 0.95 }}
            >
              {/* Icon container */}
              <div className="relative">
                <motion.div
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    color: isActive ? accentColor : 'rgba(255,255,255,0.5)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>

                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1',
                      'min-w-[16px] h-4 px-1 rounded-full',
                      'bg-red-500 text-white text-[10px] font-bold',
                      'flex items-center justify-center'
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              {showLabels && (
                <motion.span
                  className="text-[10px] font-medium mt-1"
                  animate={{
                    color: isActive ? accentColor : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {item.label}
                </motion.span>
              )}

              {/* Active indicator for minimal variant */}
              {variant === 'minimal' && isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 w-4 h-1 rounded-full"
                  style={{ background: accentColor }}
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
// CLEAN HEADER - Header de navegación
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface CleanHeaderProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  leftAction?: ReactNode
  rightActions?: ReactNode
  transparent?: boolean
  className?: string
  blur?: boolean
}

export const CleanHeader = memo(function CleanHeader({
  title,
  subtitle,
  showBack = false,
  onBack,
  leftAction,
  rightActions,
  transparent = false,
  className,
  blur = true,
}: CleanHeaderProps) {
  const router = useRouter()

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }, [onBack, router])

  return (
    <header
      className={cn(
        'sticky top-0 z-40',
        !transparent && [
          'bg-zinc-900/80',
          blur && 'backdrop-blur-xl',
          'border-b border-white/[0.06]',
        ],
        'safe-area-inset-top',
        className
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left section */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {showBack ? (
            <motion.button
              onClick={handleBack}
              className="p-2 -ml-2 rounded-xl hover:bg-white/[0.06] transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="w-5 h-5 text-white/80" />
            </motion.button>
          ) : leftAction}

          <div className="min-w-0">
            {title && (
              <h1 className="text-base font-semibold text-white truncate">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs text-white/50 truncate">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Right section */}
        {rightActions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {rightActions}
          </div>
        )}
      </div>
    </header>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CLEAN BREADCRUMBS - Navegación por niveles
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface BreadcrumbItem {
  label: string
  href?: string
  icon?: LucideIcon
}

interface CleanBreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
  maxVisible?: number
}

export const CleanBreadcrumbs = memo(function CleanBreadcrumbs({
  items,
  className,
  maxVisible = 3,
}: CleanBreadcrumbsProps) {
  const router = useRouter()

  // If too many items, collapse middle ones
  const visibleItems = items.length > maxVisible
    ? [
        items[0]!,
        { label: '...', href: undefined },
        ...items.slice(-maxVisible + 1),
      ]
    : items

  return (
    <nav className={cn('flex items-center gap-1', className)}>
      {visibleItems.map((item, index) => {
        const Icon = item.icon
        const isLast = index === visibleItems.length - 1
        const isClickable = !isLast && item.href

        return (
          <div key={`${item.label}-${index}`} className="flex items-center">
            <motion.button
              onClick={() => isClickable && router.push(item.href!)}
              className={cn(
                'flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm',
                'transition-colors duration-150',
                isClickable && 'hover:bg-white/[0.06] cursor-pointer',
                isLast ? 'text-white font-medium' : 'text-white/50'
              )}
              whileTap={isClickable ? { scale: 0.98 } : undefined}
              disabled={!isClickable}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span className="truncate max-w-[100px]">{item.label}</span>
            </motion.button>

            {!isLast && (
              <ChevronRight className="w-3.5 h-3.5 text-white/30 mx-0.5" />
            )}
          </div>
        )
      })}
    </nav>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CLEAN FAB - Floating Action Button
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FABAction {
  id: string
  label: string
  icon: LucideIcon
  onClick: () => void
  color?: string
}

interface CleanFABProps {
  icon?: LucideIcon
  actions?: FABAction[]
  onClick?: () => void
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  color?: string
  className?: string
  offset?: { x?: number; y?: number }
}

export const CleanFAB = memo(function CleanFAB({
  icon: MainIcon = Plus,
  actions,
  onClick,
  position = 'bottom-right',
  color = '#8B5CF6',
  className,
  offset = { x: 16, y: 80 }, // 80 to account for tab bar
}: CleanFABProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleMainClick = useCallback(() => {
    if (actions && actions.length > 0) {
      setIsExpanded(!isExpanded)
    } else {
      onClick?.()
    }
  }, [actions, isExpanded, onClick])

  const handleActionClick = useCallback((action: FABAction) => {
    action.onClick()
    setIsExpanded(false)
  }, [])

  const positionClasses = {
    'bottom-right': 'right-4 bottom-4',
    'bottom-left': 'left-4 bottom-4',
    'bottom-center': 'left-1/2 -translate-x-1/2 bottom-4',
  }

  return (
    <>
      {/* Backdrop when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* FAB Container */}
      <div
        className={cn(
          'fixed z-50',
          positionClasses[position],
          className
        )}
        style={{
          right: position === 'bottom-right' ? offset.x : undefined,
          left: position === 'bottom-left' ? offset.x : undefined,
          bottom: offset.y,
        }}
      >
        {/* Action items */}
        <AnimatePresence>
          {isExpanded && actions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-16 right-0 space-y-3"
            >
              {actions.map((action, index) => {
                const ActionIcon = action.icon
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      transition: { delay: index * 0.05 },
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.8,
                      y: 10,
                      transition: { delay: (actions.length - index - 1) * 0.03 },
                    }}
                    className="flex items-center gap-3 justify-end"
                  >
                    {/* Label */}
                    <span className="px-3 py-1.5 bg-zinc-800/90 backdrop-blur rounded-lg text-sm font-medium text-white whitespace-nowrap shadow-lg">
                      {action.label}
                    </span>

                    {/* Icon button */}
                    <motion.button
                      onClick={() => handleActionClick(action)}
                      className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                      style={{
                        background: action.color || 'rgba(255,255,255,0.15)',
                        boxShadow: `0 4px 20px ${action.color || color}40`,
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <ActionIcon className="w-5 h-5 text-white" />
                    </motion.button>
                  </motion.div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main FAB button */}
        <motion.button
          onClick={handleMainClick}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
          style={{
            background: `linear-gradient(135deg, ${color}, ${color}cc)`,
            boxShadow: `0 8px 32px ${color}50`,
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: isExpanded ? 45 : 0 }}
        >
          <MainIcon className="w-6 h-6 text-white" />
        </motion.button>
      </div>
    </>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// QUICK ACTIONS BAR - Acciones rápidas horizontales
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  onClick: () => void
  color?: string
  badge?: number
}

interface CleanQuickActionsProps {
  actions: QuickAction[]
  className?: string
  variant?: 'default' | 'compact' | 'large'
}

export const CleanQuickActions = memo(function CleanQuickActions({
  actions,
  className,
  variant = 'default',
}: CleanQuickActionsProps) {
  const sizeConfig = {
    compact: {
      button: 'w-12 h-12',
      icon: 18,
      labelSize: 'text-[10px]',
      gap: 'gap-2',
    },
    default: {
      button: 'w-14 h-14',
      icon: 22,
      labelSize: 'text-xs',
      gap: 'gap-3',
    },
    large: {
      button: 'w-16 h-16',
      icon: 26,
      labelSize: 'text-xs',
      gap: 'gap-4',
    },
  }

  const config = sizeConfig[variant]

  return (
    <div className={cn('flex items-center justify-center', config.gap, className)}>
      {actions.map(action => {
        const Icon = action.icon
        return (
          <motion.button
            key={action.id}
            onClick={action.onClick}
            className="flex flex-col items-center"
            whileTap={{ scale: 0.95 }}
          >
            <div
              className={cn(
                config.button,
                'rounded-2xl relative',
                'flex items-center justify-center',
                'transition-transform duration-150',
                'hover:scale-105 active:scale-95'
              )}
              style={{
                background: `linear-gradient(135deg, ${action.color || '#8B5CF6'}30, ${action.color || '#8B5CF6'}10)`,
              }}
            >
              <Icon
                size={config.icon}
                style={{ color: action.color || '#8B5CF6' }}
              />

              {/* Badge */}
              {action.badge !== undefined && action.badge > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {action.badge > 99 ? '99+' : action.badge}
                </span>
              )}
            </div>
            <span className={cn(config.labelSize, 'text-white/60 font-medium mt-1.5')}>
              {action.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DEFAULT TAB ITEMS - Configuración predeterminada para CHRONOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const defaultTabItems: TabItem[] = [
  { id: 'dashboard', label: 'Inicio', icon: Home, href: '/dashboard' },
  { id: 'bancos', label: 'Bancos', icon: Wallet, href: '/bancos' },
  { id: 'ventas', label: 'Ventas', icon: ShoppingCart, href: '/ventas' },
  { id: 'clientes', label: 'Clientes', icon: Users, href: '/clientes' },
  { id: 'mas', label: 'Más', icon: MoreHorizontal, href: '/configuracion' },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
    BreadcrumbItem,
    CleanBreadcrumbsProps, CleanFABProps, CleanHeaderProps, CleanQuickActionsProps, CleanTabBarProps, FABAction, QuickAction, TabItem
}

