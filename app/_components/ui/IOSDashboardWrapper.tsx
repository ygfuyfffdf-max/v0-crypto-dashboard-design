/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📱 CHRONOS 2026 — iOS UNIFIED DASHBOARD WRAPPER
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Wrapper principal que integra:
 * - Sistema iOS completo
 * - Navegación premium
 * - Efectos visuales controlados (sin parallax problemático)
 * - Scroll avanzado
 * - Responsive design
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { ReactNode, memo, useCallback, useEffect, useState, createContext, useContext } from 'react'
import {
  Home,
  BarChart3,
  Wallet,
  Settings,
  Plus,
  Search,
  Bell,
  Menu,
  X,
  ArrowLeft,
  Filter,
  ChevronDown,
  LucideIcon
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface DashboardState {
  activeSection: string
  isSidebarOpen: boolean
  isSearchOpen: boolean
  isNotificationsOpen: boolean
  scrollY: number
  isMobile: boolean
}

interface DashboardContextType extends DashboardState {
  setActiveSection: (section: string) => void
  toggleSidebar: () => void
  toggleSearch: () => void
  toggleNotifications: () => void
  setScrollY: (y: number) => void
}

const DashboardContext = createContext<DashboardContextType | null>(null)

export const UseDashboard = () => {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface IOSDashboardProviderProps {
  children: ReactNode
  defaultSection?: string
}

export const IOSDashboardProvider = memo(function IOSDashboardProvider({
  children,
  defaultSection = 'home',
}: IOSDashboardProviderProps) {
  const [state, setState] = useState<DashboardState>({
    activeSection: defaultSection,
    isSidebarOpen: false,
    isSearchOpen: false,
    isNotificationsOpen: false,
    scrollY: 0,
    isMobile: false,
  })

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setState(prev => ({ ...prev, isMobile: window.innerWidth < 768 }))
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const setActiveSection = useCallback((section: string) => {
    setState(prev => ({ ...prev, activeSection: section }))
  }, [])

  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, isSidebarOpen: !prev.isSidebarOpen }))
  }, [])

  const toggleSearch = useCallback(() => {
    setState(prev => ({ ...prev, isSearchOpen: !prev.isSearchOpen }))
  }, [])

  const toggleNotifications = useCallback(() => {
    setState(prev => ({ ...prev, isNotificationsOpen: !prev.isNotificationsOpen }))
  }, [])

  const setScrollY = useCallback((y: number) => {
    setState(prev => ({ ...prev, scrollY: y }))
  }, [])

  return (
    <DashboardContext.Provider
      value={{
        ...state,
        setActiveSection,
        toggleSidebar,
        toggleSearch,
        toggleNotifications,
        setScrollY,
      }}
    >
      {children}
    </DashboardContext.Provider>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD HEADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface IOSDashboardHeaderProps {
  title?: string
  subtitle?: string
  showBack?: boolean
  onBack?: () => void
  actions?: ReactNode
  transparent?: boolean
  className?: string
}

export const IOSDashboardHeader = memo(function IOSDashboardHeader({
  title = 'Dashboard',
  subtitle,
  showBack = false,
  onBack,
  actions,
  transparent = false,
  className,
}: IOSDashboardHeaderProps) {
  const { scrollY, toggleSidebar, toggleSearch, toggleNotifications, isMobile } = UseDashboard()

  const isScrolled = scrollY > 20
  const showCompact = scrollY > 100

  return (
    <motion.header
      className={cn(
        'fixed top-0 inset-x-0 z-50',
        'safe-area-inset-top',
        'transition-all duration-300',
        !transparent && isScrolled && [
          'bg-black/80 backdrop-blur-xl',
          'border-b border-white/[0.08]',
        ],
        transparent && !isScrolled && 'bg-transparent',
        className
      )}
      initial={false}
      animate={{
        height: showCompact ? 56 : 80,
      }}
    >
      <div className="h-full flex items-center justify-between px-4 max-w-screen-2xl mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className={cn(
                'p-2 -ml-2 rounded-xl',
                'text-white/70 hover:text-white',
                'hover:bg-white/[0.08]',
                'transition-colors'
              )}
            >
              <ArrowLeft size={22} />
            </motion.button>
          ) : isMobile ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className={cn(
                'p-2 -ml-2 rounded-xl',
                'text-white/70 hover:text-white',
                'hover:bg-white/[0.08]',
                'transition-colors'
              )}
            >
              <Menu size={22} />
            </motion.button>
          ) : null}

          <div className="flex flex-col">
            <motion.h1
              className={cn(
                'font-semibold text-white transition-all',
                showCompact ? 'text-lg' : 'text-xl'
              )}
            >
              {title}
            </motion.h1>

            <AnimatePresence>
              {subtitle && !showCompact && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-white/50"
                >
                  {subtitle}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {actions}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleSearch}
            className={cn(
              'p-2.5 rounded-xl',
              'text-white/70 hover:text-white',
              'hover:bg-white/[0.08]',
              'transition-colors'
            )}
          >
            <Search size={20} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleNotifications}
            className={cn(
              'p-2.5 rounded-xl relative',
              'text-white/70 hover:text-white',
              'hover:bg-white/[0.08]',
              'transition-colors'
            )}
          >
            <Bell size={20} />
            {/* Notification badge */}
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SidebarItem {
  id: string
  icon: LucideIcon
  label: string
  badge?: number | string
}

interface IOSDashboardSidebarProps {
  items?: SidebarItem[]
  footer?: ReactNode
  className?: string
}

const defaultSidebarItems: SidebarItem[] = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics', badge: 'New' },
  { id: 'wallet', icon: Wallet, label: 'Cartera' },
  { id: 'settings', icon: Settings, label: 'Ajustes' },
]

export const IOSDashboardSidebar = memo(function IOSDashboardSidebar({
  items = defaultSidebarItems,
  footer,
  className,
}: IOSDashboardSidebarProps) {
  const { isSidebarOpen, toggleSidebar, activeSection, setActiveSection, isMobile } = UseDashboard()

  // For desktop, always show
  // For mobile, show overlay
  if (!isMobile) {
    return (
      <aside
        className={cn(
          'fixed left-0 top-0 bottom-0 z-40',
          'w-64 pt-20 pb-4',
          'bg-[#1C1C1E]/95 backdrop-blur-xl',
          'border-r border-white/[0.08]',
          className
        )}
      >
        <nav className="flex flex-col h-full px-3">
          <div className="flex-1 space-y-1">
            {items.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id

              return (
                <motion.button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                    'text-sm font-medium transition-all',
                    isActive
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                  )}
                >
                  <Icon size={20} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'px-2 py-0.5 text-[10px] font-semibold rounded-full',
                        typeof item.badge === 'number'
                          ? 'bg-red-500 text-white'
                          : 'bg-violet-500/30 text-violet-300'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </motion.button>
              )
            })}
          </div>

          {footer && <div className="pt-4 border-t border-white/[0.08]">{footer}</div>}
        </nav>
      </aside>
    )
  }

  // Mobile overlay sidebar
  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sidebar Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed left-0 top-0 bottom-0 z-50',
              'w-72 safe-area-inset-top safe-area-inset-bottom',
              'bg-[#1C1C1E]/98 backdrop-blur-xl',
              'border-r border-white/[0.1]',
              className
            )}
          >
            <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
              <h2 className="text-lg font-semibold text-white">Menú</h2>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/[0.08]"
              >
                <X size={20} />
              </motion.button>
            </div>

            <nav className="flex flex-col h-full p-3">
              <div className="flex-1 space-y-1">
                {items.map((item, index) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id

                  return (
                    <motion.button
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => {
                        setActiveSection(item.id)
                        toggleSidebar()
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3.5 rounded-xl',
                        'text-sm font-medium transition-all',
                        isActive
                          ? 'bg-violet-500/20 text-violet-400'
                          : 'text-white/70 hover:text-white hover:bg-white/[0.05]'
                      )}
                    >
                      <Icon size={20} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span
                          className={cn(
                            'px-2 py-0.5 text-[10px] font-semibold rounded-full',
                            typeof item.badge === 'number'
                              ? 'bg-red-500 text-white'
                              : 'bg-violet-500/30 text-violet-300'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                    </motion.button>
                  )
                })}
              </div>

              {footer && <div className="pt-4 border-t border-white/[0.08]">{footer}</div>}
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD CONTENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface IOSDashboardContentProps {
  children: ReactNode
  hasSidebar?: boolean
  hasTabBar?: boolean
  className?: string
}

export const IOSDashboardContent = memo(function IOSDashboardContent({
  children,
  hasSidebar = true,
  hasTabBar = true,
  className,
}: IOSDashboardContentProps) {
  const { setScrollY, isMobile } = UseDashboard()

  const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
    setScrollY(e.currentTarget.scrollTop)
  }, [setScrollY])

  return (
    <main
      onScroll={handleScroll}
      className={cn(
        'flex-1 overflow-y-auto overflow-x-hidden',
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
        // Padding for header
        'pt-20',
        // Padding for sidebar (desktop)
        !isMobile && hasSidebar && 'md:pl-64',
        // Padding for tab bar (mobile)
        hasTabBar && 'pb-20',
        className
      )}
      style={{
        // Enable momentum scroll
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {children}
    </main>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD TAB BAR (Mobile)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface TabItem {
  id: string
  icon: LucideIcon
  label: string
  badge?: number
}

interface IOSDashboardTabBarProps {
  items?: TabItem[]
  showLabels?: boolean
  className?: string
}

const defaultTabItems: TabItem[] = [
  { id: 'home', icon: Home, label: 'Inicio' },
  { id: 'analytics', icon: BarChart3, label: 'Stats' },
  { id: 'wallet', icon: Wallet, label: 'Cartera' },
  { id: 'settings', icon: Settings, label: 'Ajustes' },
]

export const IOSDashboardTabBar = memo(function IOSDashboardTabBar({
  items = defaultTabItems,
  showLabels = true,
  className,
}: IOSDashboardTabBarProps) {
  const { activeSection, setActiveSection, isMobile } = UseDashboard()

  if (!isMobile) return null

  return (
    <nav
      className={cn(
        'fixed bottom-0 inset-x-0 z-50',
        'safe-area-inset-bottom',
        'bg-black/90 backdrop-blur-xl',
        'border-t border-white/[0.08]',
        className
      )}
    >
      <div className="flex items-stretch justify-around h-16">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              whileTap={{ scale: 0.9 }}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5',
                'text-[10px] font-medium transition-colors',
                isActive ? 'text-violet-400' : 'text-white/50'
              )}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              {showLabels && <span>{item.label}</span>}
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FLOATING ACTION BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FABAction {
  id: string
  icon: LucideIcon
  label: string
  color?: string
  onClick: () => void
}

interface IOSFloatingActionButtonProps {
  actions?: FABAction[]
  mainIcon?: LucideIcon
  mainColor?: string
  position?: 'bottom-right' | 'bottom-center'
  className?: string
}

export const IOSFloatingActionButton = memo(function IOSFloatingActionButton({
  actions = [],
  mainIcon: MainIcon = Plus,
  mainColor = '#8B5CF6',
  position = 'bottom-right',
  className,
}: IOSFloatingActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { isMobile } = UseDashboard()

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      <div
        className={cn(
          'fixed z-50',
          position === 'bottom-right' && 'right-4 bottom-24',
          position === 'bottom-center' && 'left-1/2 -translate-x-1/2 bottom-24',
          isMobile && 'bottom-28',
          className
        )}
      >
        {/* Action Buttons */}
        <AnimatePresence>
          {isOpen && actions.map((action, index) => {
            const ActionIcon = action.icon
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  action.onClick()
                  setIsOpen(false)
                }}
                className={cn(
                  'absolute bottom-full mb-3 right-0',
                  'flex items-center gap-3 px-4 py-3 rounded-2xl',
                  'bg-[#2C2C2E] backdrop-blur-xl',
                  'border border-white/[0.1]',
                  'text-white text-sm font-medium',
                  'shadow-lg hover:bg-[#3C3C3E] transition-colors'
                )}
                style={{ bottom: `${(index + 1) * 56}px` }}
              >
                <span>{action.label}</span>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: action.color || mainColor }}
                >
                  <ActionIcon size={20} className="text-white" />
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>

        {/* Main FAB */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => actions.length > 0 ? setIsOpen(!isOpen) : null}
          animate={{ rotate: isOpen ? 45 : 0 }}
          className={cn(
            'w-14 h-14 rounded-2xl',
            'flex items-center justify-center',
            'shadow-lg shadow-violet-500/30',
            'transition-colors'
          )}
          style={{ backgroundColor: mainColor }}
        >
          <MainIcon size={24} className="text-white" />
        </motion.button>
      </div>
    </>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SEARCH OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface IOSSearchOverlayProps {
  placeholder?: string
  onSearch?: (query: string) => void
  recentSearches?: string[]
  suggestions?: string[]
  className?: string
}

export const IOSSearchOverlay = memo(function IOSSearchOverlay({
  placeholder = 'Buscar...',
  onSearch,
  recentSearches = [],
  suggestions = [],
  className,
}: IOSSearchOverlayProps) {
  const { isSearchOpen, toggleSearch } = UseDashboard()
  const [query, setQuery] = useState('')

  const handleSearch = useCallback((searchTerm: string) => {
    setQuery(searchTerm)
    onSearch?.(searchTerm)
  }, [onSearch])

  if (!isSearchOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        'fixed inset-0 z-[60]',
        'bg-black/95 backdrop-blur-xl',
        'safe-area-inset-top',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.1]">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder={placeholder}
            autoFocus
            className={cn(
              'w-full pl-10 pr-4 py-3 rounded-xl',
              'bg-white/[0.08] text-white',
              'placeholder:text-white/40',
              'focus:outline-none focus:ring-2 focus:ring-violet-500/50',
              'transition-all'
            )}
          />
        </div>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleSearch}
          className="text-violet-400 text-sm font-medium px-3 py-2"
        >
          Cancelar
        </motion.button>
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-80px)]">
        {/* Recent Searches */}
        {recentSearches.length > 0 && !query && (
          <div className="mb-6">
            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">
              Recientes
            </h3>
            <div className="space-y-2">
              {recentSearches.map((search, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => handleSearch(search)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl',
                    'text-white/70 hover:text-white hover:bg-white/[0.05]',
                    'transition-colors text-left'
                  )}
                >
                  <Search size={16} className="text-white/40" />
                  <span>{search}</span>
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-3">
              Sugerencias
            </h3>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  onClick={() => handleSearch(suggestion)}
                  className={cn(
                    'px-4 py-2 rounded-full',
                    'bg-white/[0.08] text-white/70',
                    'hover:bg-white/[0.12] hover:text-white',
                    'transition-colors text-sm'
                  )}
                >
                  {suggestion}
                </motion.button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DASHBOARD SECTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface IOSDashboardSectionProps {
  title?: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
  className?: string
  noPadding?: boolean
}

export const IOSDashboardSection = memo(function IOSDashboardSection({
  title,
  subtitle,
  action,
  children,
  className,
  noPadding = false,
}: IOSDashboardSectionProps) {
  return (
    <section className={cn('mb-8', className)}>
      {(title || action) && (
        <div className={cn(
          'flex items-center justify-between mb-4',
          !noPadding && 'px-4 md:px-6'
        )}>
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-white">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-white/50">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      )}

      <div className={cn(!noPadding && 'px-4 md:px-6')}>
        {children}
      </div>
    </section>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPLETE DASHBOARD LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface IOSDashboardLayoutProps {
  children: ReactNode
  headerProps?: Omit<IOSDashboardHeaderProps, 'children'>
  sidebarItems?: SidebarItem[]
  tabBarItems?: TabItem[]
  fabActions?: FABAction[]
  searchProps?: Omit<IOSSearchOverlayProps, 'children'>
  defaultSection?: string
  className?: string
}

export const IOSDashboardLayout = memo(function IOSDashboardLayout({
  children,
  headerProps,
  sidebarItems,
  tabBarItems,
  fabActions = [],
  searchProps,
  defaultSection,
  className,
}: IOSDashboardLayoutProps) {
  return (
    <IOSDashboardProvider defaultSection={defaultSection}>
      <div className={cn('min-h-screen bg-[#0A0A0F]', className)}>
        <IOSDashboardHeader {...headerProps} />
        <IOSDashboardSidebar items={sidebarItems} />
        <IOSDashboardContent>
          {children}
        </IOSDashboardContent>
        <IOSDashboardTabBar items={tabBarItems} />
        <IOSFloatingActionButton actions={fabActions} />
        <IOSSearchOverlay {...searchProps} />
      </div>
    </IOSDashboardProvider>
  )
})
