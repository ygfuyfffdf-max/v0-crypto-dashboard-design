/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📱 CHRONOS 2026 — iOS MOBILE OPTIMIZED SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de navegación y layout optimizado para mobile estilo iOS 18+:
 * 
 * ✅ Tab Bar con animaciones fluidas
 * ✅ Navigation Stack con transiciones
 * ✅ Safe Area handling
 * ✅ Header sticky con blur
 * ✅ Bottom sheet navigation
 * ✅ Floating Action Button
 * ✅ Pull to refresh integrado
 * ✅ Optimizado para gestos touch
 * ✅ Diseño minimalista y limpio
 *
 * @version 3.0.0 - Mobile First Edition
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import {
    ChevronLeft,
    ChevronRight,
    LucideIcon,
    Plus,
    Search,
    X
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import {
    memo,
    ReactNode,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react'
import { CleanScrollContainer, useCleanDesign } from './iOSCleanDesignSystem'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧭 iOS TAB BAR — Barra de navegación inferior
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
  variant?: 'default' | 'floating' | 'minimal' | 'blur'
  showLabels?: boolean
  className?: string
  hideOnScroll?: boolean
}

export const iOSTabBarClean = memo(function iOSTabBarClean({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
  showLabels = true,
  className,
}: iOSTabBarProps) {
  const { reducedMotion } = useCleanDesign()
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
        'fixed bottom-0 inset-x-0 z-50',
        // Safe area padding
        'pb-safe',
        // Variants
        variant === 'default' && [
          'bg-black/90 backdrop-blur-xl',
          'border-t border-white/[0.06]',
        ],
        variant === 'floating' && [
          'mx-3 mb-3 rounded-2xl',
          'bg-[#1C1C1E]/95 backdrop-blur-xl',
          'border border-white/[0.1]',
          'shadow-[0_4px_24px_rgba(0,0,0,0.4)]',
        ],
        variant === 'minimal' && [
          'bg-transparent',
        ],
        variant === 'blur' && [
          'bg-black/60 backdrop-blur-2xl',
          'border-t border-white/[0.04]',
        ],
        className
      )}
    >
      {/* Active indicator line */}
      {variant !== 'minimal' && (
        <motion.div
          className="absolute top-0 h-0.5 bg-violet-500 rounded-full"
          animate={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          transition={reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 400, damping: 30 }}
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
                'relative flex flex-col items-center justify-center gap-1 px-4 py-2 min-w-[64px]',
                'rounded-xl',
                'transition-colors duration-150',
                isActive ? 'text-violet-400' : 'text-white/45',
                !tab.disabled && !isActive && 'active:bg-white/5',
                tab.disabled && 'opacity-40 cursor-not-allowed'
              )}
              whileTap={!reducedMotion && !tab.disabled ? { scale: 0.92 } : undefined}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    'h-6 w-6 transition-all duration-200',
                    isActive && 'drop-shadow-[0_0_6px_rgba(139,92,246,0.4)]'
                  )} 
                  strokeWidth={isActive ? 2.2 : 1.8}
                />

                {/* Badge */}
                {tab.badge !== undefined && (
                  <motion.span
                    initial={!reducedMotion ? { scale: 0 } : undefined}
                    animate={{ scale: 1 }}
                    className={cn(
                      'absolute -top-1 -right-1.5 min-w-[16px] h-[16px] px-1',
                      'flex items-center justify-center',
                      'text-[9px] font-bold text-white',
                      'bg-red-500 rounded-full',
                      'border border-black/30'
                    )}
                  >
                    {typeof tab.badge === 'number' && tab.badge > 99 ? '99+' : tab.badge}
                  </motion.span>
                )}
              </div>

              {showLabels && (
                <span className={cn(
                  'text-[10px] font-medium transition-opacity duration-200',
                  isActive ? 'opacity-100' : 'opacity-70'
                )}>
                  {tab.label}
                </span>
              )}

              {/* Active indicator dot for minimal */}
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
// 🔘 iOS FLOATING ACTION BUTTON — FAB estilo iOS
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
  hidden?: boolean
}

export const iOSFABClean = memo(function iOSFABClean({
  icon: MainIcon = Plus,
  actions,
  onClick,
  position = 'bottom-right',
  offset = { bottom: 100, side: 20 },
  variant = 'default',
  label,
  className,
  hidden = false,
}: iOSFABProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { reducedMotion } = useCleanDesign()

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

  const positionStyles = useMemo(() => {
    const base: React.CSSProperties = {
      bottom: offset.bottom,
    }
    
    if (position === 'bottom-right') {
      base.right = offset.side
    } else if (position === 'bottom-left') {
      base.left = offset.side
    } else {
      base.left = '50%'
      base.transform = 'translateX(-50%)'
    }
    
    return base
  }, [position, offset])

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className={cn('fixed z-40', className)}
          style={positionStyles}
        >
          {/* Action buttons */}
          <AnimatePresence>
            {isExpanded && actions && (
              <div className="absolute bottom-16 right-0 flex flex-col-reverse gap-3 items-end mb-3">
                {actions.map((action, index) => {
                  const ActionIcon = action.icon
                  return (
                    <motion.div
                      key={action.id}
                      initial={!reducedMotion ? { opacity: 0, y: 20, scale: 0.8 } : { opacity: 0 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-3"
                    >
                      {/* Label */}
                      <motion.span
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="px-3 py-1.5 bg-black/80 backdrop-blur-lg rounded-lg text-sm text-white font-medium whitespace-nowrap"
                      >
                        {action.label}
                      </motion.span>
                      
                      {/* Button */}
                      <motion.button
                        onClick={() => handleActionClick(action)}
                        className={cn(
                          'w-12 h-12 rounded-full',
                          'flex items-center justify-center',
                          'shadow-lg',
                          'transition-transform active:scale-95'
                        )}
                        style={{
                          backgroundColor: action.color || '#8B5CF6',
                          boxShadow: `0 4px 16px ${action.color || '#8B5CF6'}40`
                        }}
                        whileHover={!reducedMotion ? { scale: 1.02 } : undefined}
                        whileTap={!reducedMotion ? { scale: 0.95 } : undefined}
                      >
                        <ActionIcon className="w-5 h-5 text-white" />
                      </motion.button>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </AnimatePresence>

          {/* Backdrop when expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-[2px] -z-10"
                onClick={() => setIsExpanded(false)}
              />
            )}
          </AnimatePresence>

          {/* Main FAB */}
          <motion.button
            onClick={handleMainClick}
            className={cn(
              'relative flex items-center justify-center',
              'bg-violet-500 text-white',
              'shadow-lg shadow-violet-500/30',
              'transition-colors hover:bg-violet-600',
              variant === 'default' ? 'w-14 h-14 rounded-full' : 'h-14 px-6 rounded-full gap-2'
            )}
            animate={isExpanded ? { rotate: 45 } : { rotate: 0 }}
            whileHover={!reducedMotion ? { scale: 1.02 } : undefined}
            whileTap={!reducedMotion ? { scale: 0.95 } : undefined}
          >
            <MainIcon className="w-6 h-6" />
            {variant === 'extended' && label && (
              <span className="font-medium">{label}</span>
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📱 iOS HEADER — Header sticky con blur
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSHeaderProps {
  title?: string
  subtitle?: string
  showBackButton?: boolean
  onBack?: () => void
  leftContent?: ReactNode
  rightContent?: ReactNode
  centerContent?: ReactNode
  variant?: 'default' | 'large' | 'search' | 'transparent'
  className?: string
  scrollProgress?: number
}

export const iOSHeaderClean = memo(function iOSHeaderClean({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  leftContent,
  rightContent,
  centerContent,
  variant = 'default',
  className,
  scrollProgress = 0,
}: iOSHeaderProps) {
  const { reducedMotion } = useCleanDesign()

  // Calcular opacidad del blur basado en scroll
  const blurOpacity = Math.min(scrollProgress * 2, 1)

  return (
    <motion.header
      className={cn(
        'sticky top-0 z-40',
        'pt-safe',
        variant !== 'transparent' && 'border-b border-white/[0.06]',
        className
      )}
      style={{
        backgroundColor: variant === 'transparent' 
          ? `rgba(0, 0, 0, ${blurOpacity * 0.9})`
          : 'rgba(0, 0, 0, 0.85)',
        backdropFilter: `blur(${variant === 'transparent' ? blurOpacity * 24 : 24}px)`,
      }}
    >
      <div className={cn(
        'flex items-center justify-between gap-4 px-4',
        variant === 'large' ? 'py-3' : 'h-12'
      )}>
        {/* Left section */}
        <div className="flex items-center gap-2 min-w-0 shrink-0">
          {showBackButton && (
            <motion.button
              onClick={onBack}
              className={cn(
                'w-9 h-9 rounded-full',
                'flex items-center justify-center',
                'text-violet-400 hover:bg-white/5',
                'transition-colors'
              )}
              whileTap={!reducedMotion ? { scale: 0.9 } : undefined}
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
          )}
          {leftContent}
        </div>

        {/* Center section */}
        <div className="flex-1 min-w-0 text-center">
          {centerContent ? (
            centerContent
          ) : (
            <div className="min-w-0">
              {title && (
                <h1 className={cn(
                  'font-semibold text-white truncate',
                  variant === 'large' ? 'text-2xl' : 'text-base'
                )}>
                  {title}
                </h1>
              )}
              {subtitle && variant === 'large' && (
                <p className="text-sm text-white/50 truncate mt-0.5">{subtitle}</p>
              )}
            </div>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-1 shrink-0">
          {rightContent}
        </div>
      </div>

      {/* Large title for large variant */}
      {variant === 'large' && title && (
        <motion.div
          className="px-4 pb-3"
          animate={{
            opacity: scrollProgress > 0.1 ? 0 : 1,
            y: scrollProgress > 0.1 ? -10 : 0,
          }}
          transition={{ duration: 0.15 }}
        >
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          {subtitle && (
            <p className="text-base text-white/50 mt-1">{subtitle}</p>
          )}
        </motion.div>
      )}
    </motion.header>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📱 iOS PAGE LAYOUT — Layout completo para páginas mobile
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSPageLayoutProps {
  children: ReactNode
  
  // Header configuration  
  title?: string
  subtitle?: string
  showBackButton?: boolean
  onBack?: () => void
  headerLeftContent?: ReactNode
  headerRightContent?: ReactNode
  headerVariant?: 'default' | 'large' | 'search' | 'transparent'
  
  // Content configuration
  scrollable?: boolean
  enablePullToRefresh?: boolean
  onRefresh?: () => Promise<void>
  showScrollProgress?: boolean
  
  // Tab bar configuration
  showTabBar?: boolean
  tabs?: TabItem[]
  activeTab?: string
  onTabChange?: (tabId: string) => void
  tabBarVariant?: 'default' | 'floating' | 'minimal' | 'blur'
  
  // FAB configuration
  showFAB?: boolean
  fabIcon?: LucideIcon
  fabLabel?: string
  fabActions?: FABAction[]
  onFABClick?: () => void
  fabVariant?: 'default' | 'extended'
  
  // Styling
  className?: string
  contentClassName?: string
  backgroundColor?: string
}

// Uppercase aliases for JSX (TypeScript requires capitalized JSX components)
const IOSHeaderClean = iOSHeaderClean
const IOSFABClean = iOSFABClean
const IOSTabBarClean = iOSTabBarClean

export const iOSPageLayout = memo(function iOSPageLayout({
  children,
  title,
  subtitle,
  showBackButton = false,
  onBack,
  headerLeftContent,
  headerRightContent,
  headerVariant = 'default',
  scrollable = true,
  enablePullToRefresh = false,
  onRefresh,
  showScrollProgress = false,
  showTabBar = false,
  tabs,
  activeTab,
  onTabChange,
  tabBarVariant = 'default',
  showFAB = false,
  fabIcon,
  fabLabel,
  fabActions,
  onFABClick,
  fabVariant = 'default',
  className,
  contentClassName,
  backgroundColor = '#000000',
}: iOSPageLayoutProps) {
  const [scrollProgress, setScrollProgress] = useState(0)
  const { isMobile } = useCleanDesign()

  const handleScroll = useCallback((scrollTop: number, progress: number) => {
    setScrollProgress(progress)
  }, [])

  // Padding inferior según si hay tab bar
  const bottomPadding = useMemo(() => {
    if (showTabBar) {
      return tabBarVariant === 'floating' ? 'pb-[100px]' : 'pb-[80px]'
    }
    return 'pb-6'
  }, [showTabBar, tabBarVariant])

  return (
    <div 
      className={cn('min-h-screen flex flex-col', className)}
      style={{ backgroundColor }}
    >
      {/* Header */}
      <IOSHeaderClean
        title={title}
        subtitle={subtitle}
        showBackButton={showBackButton}
        onBack={onBack}
        leftContent={headerLeftContent}
        rightContent={headerRightContent}
        variant={headerVariant}
        scrollProgress={scrollProgress}
      />

      {/* Scroll progress indicator */}
      {showScrollProgress && (
        <div className="h-0.5 bg-white/5 overflow-hidden">
          <motion.div
            className="h-full bg-violet-500"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-h-0">
        {scrollable ? (
          <CleanScrollContainer
            className="h-full"
            contentClassName={cn(bottomPadding, contentClassName)}
            showFadeEdges
            showScrollbar={false}
            showScrollToTop={!isMobile}
            enablePullToRefresh={enablePullToRefresh}
            onRefresh={onRefresh}
            onScroll={handleScroll}
            fadeColor={backgroundColor}
          >
            {children}
          </CleanScrollContainer>
        ) : (
          <div className={cn('h-full overflow-auto', bottomPadding, contentClassName)}>
            {children}
          </div>
        )}
      </div>

      {/* FAB */}
      {showFAB && (
        <IOSFABClean
          icon={fabIcon}
          label={fabLabel}
          actions={fabActions}
          onClick={onFABClick}
          variant={fabVariant}
          offset={{ 
            bottom: showTabBar ? (tabBarVariant === 'floating' ? 110 : 90) : 24,
            side: 20 
          }}
        />
      )}

      {/* Tab Bar */}
      {showTabBar && tabs && activeTab && onTabChange && (
        <IOSTabBarClean
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={onTabChange}
          variant={tabBarVariant}
        />
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 iOS LIST SECTION — Sección de lista estilo iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ListItemProps {
  title: string
  subtitle?: string
  icon?: LucideIcon
  iconColor?: string
  value?: string | ReactNode
  onClick?: () => void
  destructive?: boolean
  disabled?: boolean
  showArrow?: boolean
  badge?: string | number
  className?: string
}

interface iOSListSectionProps {
  title?: string
  footer?: string
  children: ReactNode
  className?: string
}

export const iOSListSection = memo(function iOSListSection({
  title,
  footer,
  children,
  className,
}: iOSListSectionProps) {
  return (
    <div className={cn('mb-6', className)}>
      {title && (
        <p className="text-xs text-white/40 uppercase tracking-wider font-medium px-4 pb-2">
          {title}
        </p>
      )}
      
      <div className={cn(
        'rounded-2xl overflow-hidden',
        'bg-white/[0.04] backdrop-blur-lg',
        'border border-white/[0.06]'
      )}>
        {children}
      </div>

      {footer && (
        <p className="text-xs text-white/40 px-4 pt-2">{footer}</p>
      )}
    </div>
  )
})

export const iOSListItem = memo(function iOSListItem({
  title,
  subtitle,
  icon: Icon,
  iconColor = '#8B5CF6',
  value,
  onClick,
  destructive = false,
  disabled = false,
  showArrow = true,
  badge,
  className,
}: ListItemProps) {
  const { reducedMotion } = useCleanDesign()

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full px-4 py-3 flex items-center gap-3',
        'border-b border-white/[0.04] last:border-b-0',
        onClick && !disabled && 'hover:bg-white/[0.03] active:bg-white/[0.02]',
        disabled && 'opacity-40 cursor-not-allowed',
        'transition-colors duration-100',
        className
      )}
      whileTap={!reducedMotion && onClick && !disabled ? { scale: 0.99 } : undefined}
    >
      {Icon && (
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon 
            size={18} 
            style={{ color: destructive ? '#FF3B30' : iconColor }} 
          />
        </div>
      )}
      
      <div className="flex-1 min-w-0 text-left">
        <p className={cn(
          'text-base',
          destructive ? 'text-red-400' : 'text-white'
        )}>
          {title}
        </p>
        {subtitle && (
          <p className="text-sm text-white/40 truncate">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {value && (
          <span className="text-sm text-white/50">{value}</span>
        )}
        {badge !== undefined && (
          <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
            {badge}
          </span>
        )}
        {showArrow && onClick && (
          <ChevronRight size={18} className="text-white/25" />
        )}
      </div>
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔍 iOS SEARCH BAR — Barra de búsqueda estilo iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onFocus?: () => void
  onBlur?: () => void
  onClear?: () => void
  showCancel?: boolean
  cancelLabel?: string
  onCancel?: () => void
  autoFocus?: boolean
  className?: string
}

export const iOSSearchBarClean = memo(function iOSSearchBarClean({
  value,
  onChange,
  placeholder = 'Buscar',
  onFocus,
  onBlur,
  onClear,
  showCancel = false,
  cancelLabel = 'Cancelar',
  onCancel,
  autoFocus = false,
  className,
}: iOSSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { reducedMotion } = useCleanDesign()

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    onFocus?.()
  }, [onFocus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const handleClear = useCallback(() => {
    onChange('')
    onClear?.()
    inputRef.current?.focus()
  }, [onChange, onClear])

  const handleCancel = useCallback(() => {
    onChange('')
    setIsFocused(false)
    onCancel?.()
    inputRef.current?.blur()
  }, [onChange, onCancel])

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <motion.div
        className={cn(
          'flex-1 flex items-center gap-2 px-3 h-10 rounded-xl',
          'bg-white/[0.06] border transition-all duration-200',
          isFocused 
            ? 'border-violet-500/40 bg-white/[0.08]' 
            : 'border-transparent'
        )}
        animate={!reducedMotion ? {
          scale: isFocused ? 1.01 : 1,
        } : undefined}
      >
        <Search size={18} className="text-white/40 shrink-0" />
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          className={cn(
            'flex-1 bg-transparent outline-none',
            'text-white placeholder:text-white/30',
            'text-base'
          )}
        />

        {/* Clear button */}
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={handleClear}
              className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0"
            >
              <X size={12} className="text-white" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cancel button */}
      <AnimatePresence>
        {(showCancel || isFocused) && (
          <motion.button
            initial={{ opacity: 0, x: 10, width: 0 }}
            animate={{ opacity: 1, x: 0, width: 'auto' }}
            exit={{ opacity: 0, x: 10, width: 0 }}
            onClick={handleCancel}
            className="text-violet-400 font-medium text-base whitespace-nowrap"
          >
            {cancelLabel}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
    type FABAction,
    type iOSFABProps,
    type iOSHeaderProps, type iOSListSectionProps, type iOSPageLayoutProps, type iOSSearchBarProps, type iOSTabBarProps, type ListItemProps, type TabItem
}

