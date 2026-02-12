/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🍎 CHRONOS 2026 — iOS ULTIMATE PREMIUM SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de UI definitivo inspirado en iOS 18+ con:
 * - Glassmorphism Gen6 ultra avanzado
 * - SIN efectos 3D inmersivos problemáticos (sin tilt con cursor)
 * - Scroll avanzado con momentum y rubber band
 * - Micro-interacciones sutiles y elegantes
 * - Diseño minimalista premium estilo Apple
 * - Optimizado para mobile y desktop
 * - Haptic feedback visual
 * - Navegación fluida y natural
 *
 * @version 3.0.0 - Ultimate Edition
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, PanInfo, useMotionValue, useSpring, useTransform } from 'motion/react'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Loader2,
  LucideIcon,
  MoreHorizontal,
  Search,
  X,
} from 'lucide-react'
import {
  createContext,
  forwardRef,
  memo,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 DESIGN TOKENS iOS 18+
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const iOS = {
  colors: {
    // Backgrounds
    bgPrimary: 'rgba(0, 0, 0, 0.85)',
    bgSecondary: 'rgba(28, 28, 30, 0.9)',
    bgTertiary: 'rgba(44, 44, 46, 0.85)',
    bgElevated: 'rgba(58, 58, 60, 0.8)',
    // Glass
    glassBg: 'rgba(255, 255, 255, 0.06)',
    glassHover: 'rgba(255, 255, 255, 0.1)',
    glassActive: 'rgba(255, 255, 255, 0.04)',
    glassBorder: 'rgba(255, 255, 255, 0.12)',
    glassBorderHover: 'rgba(255, 255, 255, 0.18)',
    // Text
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    textTertiary: 'rgba(255, 255, 255, 0.5)',
    textQuaternary: 'rgba(255, 255, 255, 0.3)',
    // Accents
    accent: '#8B5CF6',
    accentLight: 'rgba(139, 92, 246, 0.2)',
    success: '#34C759',
    warning: '#FF9F0A',
    danger: '#FF3B30',
    info: '#0A84FF',
  },
  blur: {
    sm: 'backdrop-blur-md',
    md: 'backdrop-blur-xl',
    lg: 'backdrop-blur-2xl',
    xl: 'backdrop-blur-3xl',
  },
  radius: {
    xs: 'rounded-lg',
    sm: 'rounded-xl',
    md: 'rounded-2xl',
    lg: 'rounded-3xl',
    full: 'rounded-full',
  },
  shadows: {
    sm: '0 2px 8px rgba(0,0,0,0.15)',
    md: '0 4px 16px rgba(0,0,0,0.2)',
    lg: '0 8px 32px rgba(0,0,0,0.25)',
    xl: '0 16px 48px rgba(0,0,0,0.3)',
    inner: 'inset 0 1px 2px rgba(0,0,0,0.2)',
  },
  transitions: {
    fast: { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] },
    normal: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
    slow: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
    spring: { type: 'spring', stiffness: 400, damping: 30 },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📱 iOS CONTEXT PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSContextType {
  isMobile: boolean
  reducedMotion: boolean
  hapticFeedback: boolean
  accentColor: string
  blurIntensity: 'low' | 'medium' | 'high'
}

const iOSContext = createContext<iOSContextType>({
  isMobile: false,
  reducedMotion: false,
  hapticFeedback: true,
  accentColor: iOS.colors.accent,
  blurIntensity: 'high',
})

export const useiOS = () => useContext(iOSContext)

export const iOSProvider = memo(function iOSProvider({ 
  children,
  accentColor = iOS.colors.accent,
  blurIntensity = 'high',
}: { 
  children: ReactNode
  accentColor?: string
  blurIntensity?: 'low' | 'medium' | 'high'
}) {
  const [isMobile, setIsMobile] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    const checkMotion = () => {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    }
    
    checkMobile()
    checkMotion()
    
    window.addEventListener('resize', checkMobile)
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    mediaQuery.addEventListener('change', checkMotion)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
      mediaQuery.removeEventListener('change', checkMotion)
    }
  }, [])

  return (
    <iOSContext.Provider value={{ isMobile, reducedMotion, hapticFeedback: true, accentColor, blurIntensity }}>
      {children}
    </iOSContext.Provider>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🪟 iOS GLASS CARD — Ultra limpio, sin efectos 3D problemáticos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSCardProps {
  children: ReactNode
  className?: string
  variant?: 'glass' | 'solid' | 'outlined' | 'elevated' | 'inset'
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
  onLongPress?: () => void
  glowColor?: string
  animate?: boolean
}

export const iOSCard = memo(forwardRef<HTMLDivElement, iOSCardProps>(
  function iOSCard(
    {
      children,
      className,
      variant = 'glass',
      size = 'md',
      interactive = false,
      selected = false,
      disabled = false,
      onClick,
      onLongPress,
      glowColor,
      animate = true,
    },
    ref
  ) {
    const { reducedMotion, accentColor } = useiOS()
    const [isPressed, setIsPressed] = useState(false)
    const longPressRef = useRef<NodeJS.Timeout | null>(null)

    const handlePointerDown = useCallback(() => {
      if (!interactive || disabled) return
      setIsPressed(true)
      
      if (onLongPress) {
        longPressRef.current = setTimeout(() => {
          onLongPress()
          setIsPressed(false)
        }, 500)
      }
    }, [interactive, disabled, onLongPress])

    const handlePointerUp = useCallback(() => {
      setIsPressed(false)
      if (longPressRef.current) {
        clearTimeout(longPressRef.current)
        longPressRef.current = null
      }
    }, [])

    const sizes = {
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    }

    const variants = {
      glass: cn(
        'bg-white/[0.06] backdrop-blur-2xl',
        'border border-white/[0.1]',
        'shadow-[0_4px_24px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.06)]'
      ),
      solid: cn(
        'bg-zinc-900/95 backdrop-blur-xl',
        'border border-white/[0.06]',
        'shadow-[0_4px_16px_rgba(0,0,0,0.2)]'
      ),
      outlined: cn(
        'bg-transparent backdrop-blur-sm',
        'border border-white/[0.15]'
      ),
      elevated: cn(
        'bg-white/[0.08] backdrop-blur-3xl',
        'border border-white/[0.12]',
        'shadow-[0_12px_40px_rgba(0,0,0,0.25),0_4px_16px_rgba(0,0,0,0.15)]'
      ),
      inset: cn(
        'bg-black/[0.2] backdrop-blur-xl',
        'border border-white/[0.04]',
        'shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]'
      ),
    }

    const selectedGlow = selected ? (glowColor || accentColor) : undefined

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative overflow-hidden rounded-2xl transition-colors',
          sizes[size],
          variants[variant],
          interactive && !disabled && 'cursor-pointer',
          disabled && 'opacity-50 pointer-events-none',
          className
        )}
        style={selectedGlow ? {
          borderColor: `${selectedGlow}60`,
          boxShadow: `0 0 20px ${selectedGlow}25, ${iOS.shadows.lg}`,
        } : undefined}
        onClick={disabled ? undefined : onClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        initial={animate && !reducedMotion ? { opacity: 0, y: 12 } : false}
        animate={animate && !reducedMotion ? { opacity: 1, y: 0 } : false}
        whileHover={interactive && !disabled && !reducedMotion ? {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderColor: 'rgba(255, 255, 255, 0.15)',
        } : undefined}
        whileTap={interactive && !disabled && !reducedMotion ? { 
          scale: 0.98,
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
        } : undefined}
        transition={iOS.transitions.normal}
      >
        {/* Top shine line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Content */}
        <div className="relative">{children}</div>
        
        {/* Selection indicator */}
        {selected && (
          <motion.div
            className="absolute top-3 right-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={iOS.transitions.spring}
          >
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: selectedGlow }}
            >
              <Check size={14} className="text-white" />
            </div>
          </motion.div>
        )}
      </motion.div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📜 iOS SCROLL VIEW — Scroll avanzado con momentum y rubber band
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSScrollViewProps {
  children: ReactNode
  className?: string
  contentClassName?: string
  maxHeight?: string | number
  showIndicators?: boolean
  showFadeEdges?: boolean
  showScrollProgress?: boolean
  enablePullToRefresh?: boolean
  onRefresh?: () => Promise<void>
  onScrollEnd?: () => void
  onReachBottom?: () => void
  bottomThreshold?: number
}

export const iOSScrollView = memo(forwardRef<HTMLDivElement, iOSScrollViewProps>(
  function iOSScrollView(
    {
      children,
      className,
      contentClassName,
      maxHeight = '100%',
      showIndicators = true,
      showFadeEdges = true,
      showScrollProgress = false,
      enablePullToRefresh = false,
      onRefresh,
      onScrollEnd,
      onReachBottom,
      bottomThreshold = 100,
    },
    ref
  ) {
    const internalRef = useRef<HTMLDivElement>(null)
    const scrollRef = (ref as React.RefObject<HTMLDivElement>) || internalRef
    
    const [scrollState, setScrollState] = useState({
      isAtTop: true,
      isAtBottom: false,
      progress: 0,
      canScroll: false,
    })
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)
    
    const touchStartY = useRef(0)
    const isPulling = useRef(false)
    const reachBottomTriggered = useRef(false)

    const handleScroll = useCallback(() => {
      const el = scrollRef.current
      if (!el) return

      const { scrollTop, scrollHeight, clientHeight } = el
      const maxScroll = Math.max(0, scrollHeight - clientHeight)
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0
      const isAtTop = scrollTop <= 2
      const isAtBottom = scrollTop >= maxScroll - 2

      setScrollState({
        isAtTop,
        isAtBottom,
        progress,
        canScroll: maxScroll > 0,
      })

      // Reach bottom detection
      if (onReachBottom && scrollTop >= maxScroll - bottomThreshold && !reachBottomTriggered.current) {
        reachBottomTriggered.current = true
        onReachBottom()
      } else if (scrollTop < maxScroll - bottomThreshold) {
        reachBottomTriggered.current = false
      }
    }, [scrollRef, onReachBottom, bottomThreshold])

    // Pull to refresh
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      if (!enablePullToRefresh || !scrollState.isAtTop) return
      touchStartY.current = e.touches[0].clientY
      isPulling.current = true
    }, [enablePullToRefresh, scrollState.isAtTop])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      if (!isPulling.current || isRefreshing) return
      const touchY = e.touches[0].clientY
      const distance = Math.max(0, (touchY - touchStartY.current) * 0.4)
      if (distance > 0 && scrollState.isAtTop) {
        setPullDistance(Math.min(distance, 120))
      }
    }, [isRefreshing, scrollState.isAtTop])

    const handleTouchEnd = useCallback(async () => {
      if (!isPulling.current) return
      isPulling.current = false
      
      if (pullDistance >= 80 && onRefresh) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }
      setPullDistance(0)
    }, [pullDistance, onRefresh])

    useEffect(() => {
      const el = scrollRef.current
      if (!el) return
      
      el.addEventListener('scroll', handleScroll, { passive: true })
      handleScroll()
      
      return () => el.removeEventListener('scroll', handleScroll)
    }, [handleScroll, scrollRef])

    return (
      <div className={cn('relative', className)}>
        {/* Pull to refresh indicator */}
        <AnimatePresence>
          {(pullDistance > 0 || isRefreshing) && (
            <motion.div
              className="absolute top-0 left-0 right-0 flex items-center justify-center z-10 pointer-events-none"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: Math.max(pullDistance, isRefreshing ? 48 : 0), opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : (pullDistance / 80) * 180 }}
                transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
              >
                <Loader2 
                  size={20} 
                  className={cn(
                    'transition-colors',
                    pullDistance >= 80 || isRefreshing ? 'text-violet-400' : 'text-white/40'
                  )} 
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scroll progress bar */}
        {showScrollProgress && scrollState.canScroll && (
          <motion.div
            className="absolute top-0 left-0 right-0 h-0.5 z-20 origin-left"
            style={{ backgroundColor: iOS.colors.accent }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: scrollState.progress }}
          />
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className={cn(
            'overflow-y-auto overflow-x-hidden overscroll-contain',
            'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
            'hover:scrollbar-thumb-white/20',
            contentClassName
          )}
          style={{ maxHeight }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onScrollEnd={onScrollEnd}
        >
          {/* Content with padding for pull-to-refresh */}
          <motion.div
            animate={{ y: pullDistance }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Fade edges */}
        {showFadeEdges && scrollState.canScroll && (
          <>
            <AnimatePresence>
              {!scrollState.isAtTop && (
                <motion.div
                  className="absolute top-0 left-0 right-0 h-12 pointer-events-none z-10"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!scrollState.isAtBottom && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none z-10"
                  style={{
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </AnimatePresence>
          </>
        )}

        {/* Scroll indicators */}
        {showIndicators && scrollState.canScroll && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
            <motion.button
              className={cn(
                'p-1 rounded-full',
                scrollState.isAtTop ? 'text-white/20' : 'text-white/60 hover:text-white'
              )}
              onClick={() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              disabled={scrollState.isAtTop}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronUp size={14} />
            </motion.button>
            <motion.button
              className={cn(
                'p-1 rounded-full',
                scrollState.isAtBottom ? 'text-white/20' : 'text-white/60 hover:text-white'
              )}
              onClick={() => {
                const el = scrollRef.current
                if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
              }}
              disabled={scrollState.isAtBottom}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronDown size={14} />
            </motion.button>
          </div>
        )}
      </div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🪟 iOS SHEET MODAL — Modal deslizable estilo iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  variant?: 'sheet' | 'dialog' | 'fullscreen'
  showDragIndicator?: boolean
  showCloseButton?: boolean
  closeOnSwipeDown?: boolean
  closeOnBackdrop?: boolean
  footer?: ReactNode
  headerAction?: ReactNode
  className?: string
  contentClassName?: string
  scrollable?: boolean
  maxContentHeight?: string
}

export const iOSSheet = memo(function iOSSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  variant = 'sheet',
  showDragIndicator = true,
  showCloseButton = true,
  closeOnSwipeDown = true,
  closeOnBackdrop = true,
  footer,
  headerAction,
  className,
  contentClassName,
  scrollable = true,
  maxContentHeight = '60vh',
}: iOSSheetProps) {
  const [mounted, setMounted] = useState(false)
  const { reducedMotion, isMobile } = useiOS()
  const dragY = useRef(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Lock body scroll
  useEffect(() => {
    if (!mounted) return
    
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [isOpen, mounted])

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (closeOnSwipeDown && info.offset.y > 100) {
      onClose()
    }
  }, [closeOnSwipeDown, onClose])

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
    full: 'max-w-[95vw] md:max-w-5xl w-full',
  }

  const getAnimation = () => {
    switch (variant) {
      case 'sheet':
        return {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
        }
      case 'fullscreen':
        return {
          initial: { y: '100%', opacity: 0.8 },
          animate: { y: 0, opacity: 1 },
          exit: { y: '100%', opacity: 0 },
        }
      default:
        return {
          initial: { opacity: 0, scale: 0.95, y: 20 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.95, y: 20 },
        }
    }
  }

  if (!mounted) return null

  const animation = getAnimation()

  const modalContent = (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeOnBackdrop ? onClose : undefined}
            className={cn(
              'fixed inset-0 z-50',
              'bg-black/60 backdrop-blur-sm',
              closeOnBackdrop && 'cursor-pointer'
            )}
          />

          {/* Modal */}
          <div className={cn(
            'fixed inset-0 z-50 flex items-end justify-center',
            variant === 'dialog' && 'items-center',
            variant === 'fullscreen' && 'items-stretch'
          )}>
            <motion.div
              className={cn(
                'relative w-full backdrop-blur-3xl overflow-hidden',
                variant !== 'fullscreen' && sizeClasses[size],
                variant === 'sheet' && 'rounded-t-3xl max-h-[90vh]',
                variant === 'dialog' && 'rounded-2xl mx-4 max-h-[85vh]',
                variant === 'fullscreen' && 'h-full',
                'bg-zinc-900/95 border border-white/[0.1]',
                'shadow-[0_-8px_32px_rgba(0,0,0,0.4)]',
                className
              )}
              drag={closeOnSwipeDown && variant === 'sheet' ? 'y' : false}
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={handleDragEnd}
              {...animation}
              transition={reducedMotion ? { duration: 0.1 } : iOS.transitions.slow}
            >
              {/* Drag indicator */}
              {showDragIndicator && variant === 'sheet' && (
                <div className="flex justify-center pt-3 pb-1">
                  <div className="w-10 h-1 bg-white/30 rounded-full" />
                </div>
              )}

              {/* Header */}
              {(title || showCloseButton || headerAction) && (
                <div className="sticky top-0 z-10 px-5 py-4 border-b border-white/[0.06] bg-zinc-900/80 backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {title && (
                        <h2 className="text-lg font-semibold text-white truncate">{title}</h2>
                      )}
                      {subtitle && (
                        <p className="text-sm text-white/50 mt-0.5 truncate">{subtitle}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {headerAction}
                      {showCloseButton && (
                        <motion.button
                          onClick={onClose}
                          className="p-2 rounded-full bg-white/[0.08] text-white/70 hover:bg-white/[0.12] hover:text-white transition-colors"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X size={18} />
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className={cn('relative', contentClassName)}>
                {scrollable ? (
                  <iOSScrollView maxHeight={maxContentHeight} showFadeEdges>
                    <div className="p-5">{children}</div>
                  </iOSScrollView>
                ) : (
                  <div className="p-5">{children}</div>
                )}
              </div>

              {/* Footer */}
              {footer && (
                <div className="sticky bottom-0 z-10 px-5 py-4 border-t border-white/[0.06] bg-zinc-900/80 backdrop-blur-xl">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔘 iOS BUTTON — Botón premium estilo iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSButtonProps {
  children: ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  fullWidth?: boolean
  onClick?: () => void
}

export const iOSButton = memo(function iOSButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  onClick,
}: iOSButtonProps) {
  const { reducedMotion, accentColor } = useiOS()

  const variants = {
    primary: cn(
      'bg-violet-500 text-white',
      'hover:bg-violet-400 active:bg-violet-600',
      'shadow-[0_4px_16px_rgba(139,92,246,0.4)]'
    ),
    secondary: cn(
      'bg-white/[0.1] text-white',
      'hover:bg-white/[0.15] active:bg-white/[0.08]',
      'border border-white/[0.1]'
    ),
    ghost: cn(
      'bg-transparent text-white/70',
      'hover:bg-white/[0.08] hover:text-white active:bg-white/[0.04]'
    ),
    danger: cn(
      'bg-red-500/20 text-red-400',
      'hover:bg-red-500/30 active:bg-red-500/15',
      'border border-red-500/30'
    ),
    success: cn(
      'bg-emerald-500/20 text-emerald-400',
      'hover:bg-emerald-500/30 active:bg-emerald-500/15',
      'border border-emerald-500/30'
    ),
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }

  const iconSizes = { sm: 14, md: 16, lg: 18 }

  return (
    <motion.button
      className={cn(
        'relative inline-flex items-center justify-center font-medium rounded-xl',
        'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        (disabled || loading) && 'opacity-50 pointer-events-none',
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!reducedMotion && !disabled ? { scale: 1.02 } : undefined}
      whileTap={!reducedMotion && !disabled ? { scale: 0.98 } : undefined}
      transition={iOS.transitions.fast}
    >
      {loading && (
        <Loader2 size={iconSizes[size]} className="animate-spin" />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon size={iconSizes[size]} />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon size={iconSizes[size]} />
      )}
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📝 iOS INPUT — Input premium estilo iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSInputProps {
  value?: string
  defaultValue?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  className?: string
  inputClassName?: string
  error?: string
  success?: boolean
  disabled?: boolean
  clearable?: boolean
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onClear?: () => void
}

export const iOSInput = memo(forwardRef<HTMLInputElement, iOSInputProps>(
  function iOSInput(
    {
      value,
      defaultValue,
      placeholder,
      type = 'text',
      icon: Icon,
      iconPosition = 'left',
      className,
      inputClassName,
      error,
      success,
      disabled,
      clearable,
      onChange,
      onFocus,
      onBlur,
      onClear,
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false)
    const [internalValue, setInternalValue] = useState(defaultValue || '')
    const displayValue = value !== undefined ? value : internalValue

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    }, [value, onChange])

    const handleClear = useCallback(() => {
      if (value === undefined) {
        setInternalValue('')
      }
      onChange?.('')
      onClear?.()
    }, [value, onChange, onClear])

    return (
      <div className={cn('relative', className)}>
        <div
          className={cn(
            'relative flex items-center rounded-xl transition-all duration-200',
            'bg-white/[0.06] border',
            isFocused ? 'border-violet-500/50 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]' : 'border-white/[0.1]',
            error && 'border-red-500/50',
            success && 'border-emerald-500/50',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          {Icon && iconPosition === 'left' && (
            <div className="pl-3 text-white/40">
              <Icon size={18} />
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            value={displayValue}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleChange}
            onFocus={() => { setIsFocused(true); onFocus?.() }}
            onBlur={() => { setIsFocused(false); onBlur?.() }}
            className={cn(
              'flex-1 bg-transparent px-3 py-3 text-white placeholder:text-white/30',
              'focus:outline-none',
              inputClassName
            )}
          />

          {clearable && displayValue && (
            <motion.button
              onClick={handleClear}
              className="pr-3 text-white/40 hover:text-white/70 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <X size={16} />
            </motion.button>
          )}

          {Icon && iconPosition === 'right' && (
            <div className="pr-3 text-white/40">
              <Icon size={18} />
            </div>
          )}
        </div>

        {/* Error message */}
        <AnimatePresence>
          {error && (
            <motion.p
              className="text-xs text-red-400 mt-1.5 px-1"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🍞 iOS TOAST — Notificaciones estilo iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}

export const iOSToastProvider = memo(function iOSToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts(prev => [...prev, newToast])

    // Auto remove
    const duration = toast.duration || 4000
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, duration)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <iOSToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
})

const iOSToastContainer = memo(function iOSToastContainer({ 
  toasts, 
  onRemove 
}: { 
  toasts: Toast[]
  onRemove: (id: string) => void 
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const variantStyles = {
    default: 'bg-zinc-800/95 border-white/[0.1]',
    success: 'bg-emerald-900/90 border-emerald-500/30',
    error: 'bg-red-900/90 border-red-500/30',
    warning: 'bg-amber-900/90 border-amber-500/30',
    info: 'bg-blue-900/90 border-blue-500/30',
  }

  const variantIcons = {
    default: null,
    success: <Check size={16} className="text-emerald-400" />,
    error: <X size={16} className="text-red-400" />,
    warning: <span className="text-amber-400">⚠</span>,
    info: <span className="text-blue-400">ℹ</span>,
  }

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            transition={iOS.transitions.normal}
            className={cn(
              'flex items-start gap-3 p-4 rounded-2xl backdrop-blur-xl border',
              'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
              variantStyles[toast.variant || 'default']
            )}
          >
            {variantIcons[toast.variant || 'default'] && (
              <div className="mt-0.5">{variantIcons[toast.variant || 'default']}</div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">{toast.title}</p>
              {toast.description && (
                <p className="text-xs text-white/60 mt-0.5">{toast.description}</p>
              )}
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className="text-xs text-violet-400 hover:text-violet-300 mt-2 font-medium"
                >
                  {toast.action.label}
                </button>
              )}
            </div>
            <motion.button
              onClick={() => onRemove(toast.id)}
              className="text-white/40 hover:text-white/70 transition-colors"
              whileTap={{ scale: 0.9 }}
            >
              <X size={14} />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 iOS LIST — Lista interactiva estilo iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSListItemProps {
  children: ReactNode
  className?: string
  icon?: LucideIcon
  rightIcon?: LucideIcon
  rightContent?: ReactNode
  description?: string
  destructive?: boolean
  disabled?: boolean
  onClick?: () => void
}

export const iOSListItem = memo(function iOSListItem({
  children,
  className,
  icon: Icon,
  rightIcon: RightIcon = ChevronRight,
  rightContent,
  description,
  destructive,
  disabled,
  onClick,
}: iOSListItemProps) {
  const { reducedMotion } = useiOS()

  return (
    <motion.button
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
        'hover:bg-white/[0.06] active:bg-white/[0.04]',
        destructive && 'text-red-400',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
      onClick={onClick}
      disabled={disabled}
      whileTap={!reducedMotion && !disabled ? { scale: 0.99 } : undefined}
    >
      {Icon && (
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          destructive ? 'bg-red-500/20 text-red-400' : 'bg-white/[0.08] text-white/70'
        )}>
          <Icon size={16} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', destructive ? 'text-red-400' : 'text-white')}>
          {children}
        </p>
        {description && (
          <p className="text-xs text-white/50 mt-0.5 truncate">{description}</p>
        )}
      </div>
      {rightContent}
      {onClick && !rightContent && RightIcon && (
        <RightIcon size={16} className="text-white/30" />
      )}
    </motion.button>
  )
})

interface iOSListGroupProps {
  children: ReactNode
  title?: string
  className?: string
}

export const iOSListGroup = memo(function iOSListGroup({
  children,
  title,
  className,
}: iOSListGroupProps) {
  return (
    <div className={className}>
      {title && (
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider px-4 mb-2">
          {title}
        </p>
      )}
      <div className="bg-white/[0.04] rounded-2xl overflow-hidden divide-y divide-white/[0.06]">
        {children}
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔍 iOS SEARCH BAR — Barra de búsqueda estilo iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSSearchBarProps {
  value?: string
  placeholder?: string
  className?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  onSubmit?: (value: string) => void
  showCancel?: boolean
  autoFocus?: boolean
}

export const iOSSearchBar = memo(function iOSSearchBar({
  value = '',
  placeholder = 'Buscar',
  className,
  onChange,
  onFocus,
  onBlur,
  onSubmit,
  showCancel = false,
  autoFocus = false,
}: iOSSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [internalValue, setInternalValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const { reducedMotion } = useiOS()

  const displayValue = value || internalValue

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInternalValue(newValue)
    onChange?.(newValue)
  }, [onChange])

  const handleClear = useCallback(() => {
    setInternalValue('')
    onChange?.('')
    inputRef.current?.focus()
  }, [onChange])

  const handleCancel = useCallback(() => {
    setInternalValue('')
    onChange?.('')
    inputRef.current?.blur()
    setIsFocused(false)
  }, [onChange])

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    onSubmit?.(displayValue)
  }, [displayValue, onSubmit])

  return (
    <form onSubmit={handleSubmit} className={cn('flex items-center gap-3', className)}>
      <motion.div
        className={cn(
          'flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl transition-colors',
          'bg-white/[0.06] border',
          isFocused ? 'border-white/[0.15]' : 'border-transparent'
        )}
        animate={{ 
          scale: isFocused && !reducedMotion ? 1.01 : 1,
        }}
        transition={iOS.transitions.fast}
      >
        <Search size={16} className="text-white/40 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={handleChange}
          onFocus={() => { setIsFocused(true); onFocus?.() }}
          onBlur={() => { setIsFocused(false); onBlur?.() }}
          className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
        />
        <AnimatePresence>
          {displayValue && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="text-white/40 hover:text-white/70 transition-colors"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {showCancel && (
        <AnimatePresence>
          {isFocused && (
            <motion.button
              type="button"
              onClick={handleCancel}
              className="text-sm text-violet-400 hover:text-violet-300 font-medium shrink-0"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              Cancelar
            </motion.button>
          )}
        </AnimatePresence>
      )}
    </form>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🏷️ iOS BADGE — Badge estilo iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSBadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'premium'
  size?: 'sm' | 'md' | 'lg'
  dot?: boolean
  pulse?: boolean
  className?: string
}

export const iOSBadge = memo(function iOSBadge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pulse = false,
  className,
}: iOSBadgeProps) {
  const variants = {
    default: 'bg-white/[0.1] text-white/70',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
    danger: 'bg-red-500/20 text-red-400',
    info: 'bg-blue-500/20 text-blue-400',
    premium: 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 text-violet-300',
  }

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-0.5',
    lg: 'text-sm px-2.5 py-1',
  }

  if (dot) {
    return (
      <span className={cn('relative inline-flex', className)}>
        <span
          className={cn(
            'w-2 h-2 rounded-full',
            variant === 'default' && 'bg-white/60',
            variant === 'success' && 'bg-emerald-500',
            variant === 'warning' && 'bg-amber-500',
            variant === 'danger' && 'bg-red-500',
            variant === 'info' && 'bg-blue-500',
            variant === 'premium' && 'bg-violet-500'
          )}
        />
        {pulse && (
          <span
            className={cn(
              'absolute inset-0 w-2 h-2 rounded-full animate-ping',
              variant === 'default' && 'bg-white/40',
              variant === 'success' && 'bg-emerald-500/60',
              variant === 'warning' && 'bg-amber-500/60',
              variant === 'danger' && 'bg-red-500/60',
              variant === 'info' && 'bg-blue-500/60',
              variant === 'premium' && 'bg-violet-500/60'
            )}
          />
        )}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  iOS,
  iOSContext,
}
