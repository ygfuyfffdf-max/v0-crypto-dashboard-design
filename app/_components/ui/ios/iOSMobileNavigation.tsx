/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📱 CHRONOS 2026 — iOS MOBILE NAVIGATION SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de navegación móvil estilo iOS 18+:
 * - Tab bar flotante con blur premium
 * - Navegación por gestos
 * - Transiciones fluidas entre vistas
 * - Safe area support
 * - Haptic feedback visual
 * - Quick actions con long press
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useMotionValue, useTransform, PanInfo } from 'motion/react'
import { 
  memo, 
  ReactNode, 
  useCallback, 
  useState, 
  createContext, 
  useContext,
  useEffect,
  useRef
} from 'react'
import { 
  Home, 
  DollarSign, 
  Users, 
  Landmark, 
  Package, 
  BarChart3,
  Settings,
  Menu,
  X,
  ChevronLeft,
  LucideIcon,
  Sparkles,
  ArrowUpRight,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// NAVIGATION CONFIG
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface NavItem {
  id: string
  label: string
  icon: LucideIcon
  href: string
  badge?: number | string
  quickActions?: QuickAction[]
}

interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  href?: string
  onClick?: () => void
}

const defaultNavItems: NavItem[] = [
  { 
    id: 'dashboard', 
    label: 'Inicio', 
    icon: Home, 
    href: '/dashboard',
    quickActions: [
      { id: 'refresh', label: 'Actualizar', icon: ArrowUpRight },
    ]
  },
  { 
    id: 'ventas', 
    label: 'Ventas', 
    icon: DollarSign, 
    href: '/ventas',
    quickActions: [
      { id: 'nueva-venta', label: 'Nueva Venta', icon: Plus, href: '/ventas?action=new' },
    ]
  },
  { 
    id: 'bancos', 
    label: 'Bancos', 
    icon: Landmark, 
    href: '/bancos',
    quickActions: [
      { id: 'nuevo-movimiento', label: 'Nuevo Mov.', icon: Plus },
    ]
  },
  { 
    id: 'clientes', 
    label: 'Clientes', 
    icon: Users, 
    href: '/clientes',
    quickActions: [
      { id: 'nuevo-cliente', label: 'Nuevo Cliente', icon: Plus, href: '/clientes?action=new' },
    ]
  },
  { 
    id: 'almacen', 
    label: 'Almacén', 
    icon: Package, 
    href: '/almacen' 
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MobileNavContextType {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  activeTab: string | null
  navItems: NavItem[]
}

const MobileNavContext = createContext<MobileNavContextType | null>(null)

export const useMobileNav = () => useContext(MobileNavContext)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TAB BAR - Barra de navegación inferior flotante
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSTabBarProps {
  items?: NavItem[]
  className?: string
  variant?: 'floating' | 'docked'
  showLabels?: boolean
  showQuickActions?: boolean
}

export const iOSTabBar = memo(function iOSTabBar({
  items = defaultNavItems,
  className,
  variant = 'floating',
  showLabels = true,
  showQuickActions = true,
}: iOSTabBarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [longPressItem, setLongPressItem] = useState<NavItem | null>(null)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)

  const activeItem = items.find(item => pathname?.startsWith(item.href)) || items[0]

  const handlePointerDown = useCallback((item: NavItem) => {
    if (showQuickActions && item.quickActions?.length) {
      longPressTimer.current = setTimeout(() => {
        setLongPressItem(item)
      }, 500)
    }
  }, [showQuickActions])

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  const handleQuickAction = useCallback((action: QuickAction) => {
    if (action.href) {
      router.push(action.href)
    } else if (action.onClick) {
      action.onClick()
    }
    setLongPressItem(null)
  }, [router])

  return (
    <>
      {/* Tab Bar */}
      <motion.nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'px-4 pb-safe pt-2',
          variant === 'floating' && 'pb-6',
          className
        )}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div
          className={cn(
            'relative mx-auto flex items-center justify-around',
            'backdrop-blur-2xl',
            variant === 'floating' && [
              'max-w-md rounded-2xl',
              'bg-zinc-900/80 border border-white/10',
              'shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]',
              'p-1.5',
            ],
            variant === 'docked' && [
              'bg-zinc-900/95 border-t border-white/10',
              'py-2 px-2',
            ]
          )}
        >
          {items.map((item) => {
            const isActive = item.id === activeItem?.id
            const Icon = item.icon
            
            return (
              <Link
                key={item.id}
                href={item.href}
                className="relative"
                onPointerDown={() => handlePointerDown(item)}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <motion.div
                  className={cn(
                    'relative flex flex-col items-center justify-center',
                    'px-4 py-2 rounded-xl',
                    'transition-colors',
                    isActive 
                      ? 'text-white' 
                      : 'text-white/50 hover:text-white/70'
                  )}
                  whileTap={{ scale: 0.9 }}
                >
                  {/* Active background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-xl"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  <div className="relative z-10">
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    
                    {/* Badge */}
                    {item.badge && (
                      <motion.span
                        className={cn(
                          'absolute -top-1 -right-1 min-w-[16px] h-4',
                          'flex items-center justify-center',
                          'text-[10px] font-bold text-white',
                          'bg-red-500 rounded-full px-1'
                        )}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </div>
                  
                  {showLabels && (
                    <span className={cn(
                      'relative z-10 text-[10px] font-medium mt-1',
                      isActive ? 'text-white' : 'text-white/50'
                    )}>
                      {item.label}
                    </span>
                  )}

                  {/* Quick actions indicator */}
                  {showQuickActions && item.quickActions?.length && (
                    <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-violet-500 rounded-full" />
                  )}
                </motion.div>
              </Link>
            )
          })}
        </div>
      </motion.nav>

      {/* Quick Actions Popup */}
      <AnimatePresence>
        {longPressItem && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLongPressItem(null)}
            />
            
            {/* Actions menu */}
            <motion.div
              className={cn(
                'fixed bottom-24 left-1/2 z-[60]',
                'bg-zinc-800/95 backdrop-blur-2xl rounded-2xl',
                'border border-white/10 shadow-2xl',
                'overflow-hidden min-w-[200px]'
              )}
              initial={{ opacity: 0, y: 20, x: '-50%', scale: 0.9 }}
              animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
              exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.9 }}
            >
              {/* Header */}
              <div className="px-4 py-3 border-b border-white/10">
                <p className="text-sm font-medium text-white">{longPressItem.label}</p>
                <p className="text-xs text-white/50">Acciones rápidas</p>
              </div>
              
              {/* Actions */}
              <div className="py-1">
                {longPressItem.quickActions?.map((action) => {
                  const ActionIcon = action.icon
                  return (
                    <motion.button
                      key={action.id}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3',
                        'text-left text-sm text-white',
                        'hover:bg-white/5 transition-colors'
                      )}
                      onClick={() => handleQuickAction(action)}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ActionIcon size={18} className="text-violet-400" />
                      <span>{action.label}</span>
                    </motion.button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOBILE HEADER - Cabecera para vistas móviles
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSMobileHeaderProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  onBack?: () => void
  rightAction?: ReactNode
  leftAction?: ReactNode
  transparent?: boolean
  large?: boolean
  className?: string
}

export const iOSMobileHeader = memo(function iOSMobileHeader({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  rightAction,
  leftAction,
  transparent = false,
  large = false,
  className,
}: iOSMobileHeaderProps) {
  const router = useRouter()

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }, [onBack, router])

  return (
    <motion.header
      className={cn(
        'sticky top-0 z-40 safe-pt',
        !transparent && 'backdrop-blur-2xl bg-zinc-900/80 border-b border-white/5',
        className
      )}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      {/* Standard header */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center gap-2 min-w-[80px]">
          {showBackButton && (
            <motion.button
              onClick={handleBack}
              className="flex items-center text-violet-400 -ml-1"
              whileTap={{ scale: 0.95 }}
            >
              <ChevronLeft size={24} />
              <span className="text-sm font-medium">Atrás</span>
            </motion.button>
          )}
          {leftAction}
        </div>

        {/* Title (center) */}
        {!large && (
          <div className="flex-1 text-center">
            <h1 className="text-base font-semibold text-white truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-white/50">{subtitle}</p>
            )}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-2 min-w-[80px] justify-end">
          {rightAction}
        </div>
      </div>

      {/* Large title */}
      {large && (
        <div className="px-4 pb-3">
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="text-sm text-white/50 mt-1">{subtitle}</p>
          )}
        </div>
      )}
    </motion.header>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DRAWER MENU - Menú lateral deslizable
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSDrawerMenuProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  position?: 'left' | 'right'
  className?: string
}

export const iOSDrawerMenu = memo(function iOSDrawerMenu({
  isOpen,
  onClose,
  children,
  position = 'left',
  className,
}: iOSDrawerMenuProps) {
  const x = useMotionValue(0)
  const opacity = useTransform(x, position === 'left' ? [-300, 0] : [0, 300], [0, 1])

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    const threshold = 100
    if (position === 'left' && info.offset.x < -threshold) {
      onClose()
    } else if (position === 'right' && info.offset.x > threshold) {
      onClose()
    }
  }, [position, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className={cn(
              'fixed top-0 bottom-0 z-50 w-80 max-w-[85vw]',
              'bg-zinc-900/95 backdrop-blur-2xl',
              'border-white/10 shadow-2xl',
              position === 'left' ? 'left-0 border-r' : 'right-0 border-l',
              className
            )}
            initial={{ x: position === 'left' ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: position === 'left' ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            drag="x"
            dragConstraints={{ left: position === 'left' ? -300 : 0, right: position === 'right' ? 300 : 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ x }}
          >
            {/* Close button */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <span className="text-lg font-semibold text-white">Menú</span>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
                whileTap={{ scale: 0.9 }}
              >
                <X size={18} />
              </motion.button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100%-65px)]">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FLOATING ACTION BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSFABProps {
  icon?: LucideIcon
  label?: string
  onClick?: () => void
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left'
  variant?: 'primary' | 'secondary'
  className?: string
}

export const iOSFAB = memo(function iOSFAB({
  icon: Icon = Plus,
  label,
  onClick,
  position = 'bottom-right',
  variant = 'primary',
  className,
}: iOSFABProps) {
  const positionClasses = {
    'bottom-right': 'right-4',
    'bottom-center': 'left-1/2 -translate-x-1/2',
    'bottom-left': 'left-4',
  }

  return (
    <motion.button
      className={cn(
        'fixed bottom-24 z-40',
        positionClasses[position],
        'flex items-center gap-2',
        'shadow-xl',
        variant === 'primary' && [
          'bg-violet-500 text-white',
          'hover:bg-violet-400',
          'shadow-violet-500/30',
        ],
        variant === 'secondary' && [
          'bg-zinc-800/90 backdrop-blur-xl text-white',
          'border border-white/10',
          'hover:bg-zinc-700/90',
        ],
        label ? 'px-5 py-3 rounded-full' : 'w-14 h-14 rounded-full justify-center',
        className
      )}
      onClick={onClick}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Icon size={label ? 18 : 24} />
      {label && <span className="font-medium">{label}</span>}
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PAGE TRANSITION WRAPPER - Para transiciones entre páginas
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSPageTransitionProps {
  children: ReactNode
  className?: string
}

export const iOSPageTransition = memo(function iOSPageTransition({
  children,
  className,
}: iOSPageTransitionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  NavItem,
  QuickAction,
  iOSTabBarProps,
  iOSMobileHeaderProps,
  iOSDrawerMenuProps,
  iOSFABProps,
  iOSPageTransitionProps,
}
