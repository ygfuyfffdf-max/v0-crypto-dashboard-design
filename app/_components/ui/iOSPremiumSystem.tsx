/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🍎 CHRONOS 2026 — iOS PREMIUM UI SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de componentes inspirado en iOS 18+ con:
 * - Glassmorphism avanzado con blur dinámico
 * - Micro-interacciones sutiles y elegantes
 * - Diseño minimalista y limpio
 * - Haptic feedback visual
 * - Navegación fluida
 * - SIN efectos 3D inmersivos problemáticos con cursor
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import {
  ArrowLeft,
  Check,
  ChevronRight,
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

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXTO DE TEMA iOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSTheme {
  variant: 'light' | 'dark'
  accentColor: string
  blurIntensity: 'low' | 'medium' | 'high'
  reducedMotion: boolean
}

const iOSThemeContext = createContext<iOSTheme>({
  variant: 'dark',
  accentColor: '#8B5CF6',
  blurIntensity: 'high',
  reducedMotion: false,
})

export const useiOSTheme = () => useContext(iOSThemeContext)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS GLASS CARD - Componente base sin efectos 3D problemáticos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSGlassCardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'elevated' | 'inset' | 'floating'
  interactive?: boolean
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const blurMap = {
  none: '',
  sm: 'backdrop-blur-sm',
  md: 'backdrop-blur-md',
  lg: 'backdrop-blur-lg',
  xl: 'backdrop-blur-xl',
}

const paddingMap = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

export const iOSGlassCard = memo(forwardRef<HTMLDivElement, iOSGlassCardProps>(
  function iOSGlassCard(
    {
      children,
      className,
      variant = 'default',
      interactive = false,
      onClick,
      padding = 'md',
      blur = 'lg',
    },
    ref
  ) {
    const [isPressed, setIsPressed] = useState(false)

    const baseStyles = cn(
      'relative rounded-2xl overflow-hidden transition-all duration-200',
      blurMap[blur],
      paddingMap[padding],
      // Variantes de estilo
      variant === 'default' && [
        'bg-white/[0.08]',
        'border border-white/[0.12]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
      ],
      variant === 'elevated' && [
        'bg-white/[0.12]',
        'border border-white/[0.15]',
        'shadow-[0_16px_48px_rgba(0,0,0,0.2),0_4px_16px_rgba(0,0,0,0.1)]',
      ],
      variant === 'inset' && [
        'bg-black/[0.2]',
        'border border-white/[0.05]',
        'shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]',
      ],
      variant === 'floating' && [
        'bg-white/[0.15]',
        'border border-white/[0.2]',
        'shadow-[0_24px_64px_rgba(0,0,0,0.25),0_8px_24px_rgba(0,0,0,0.15)]',
      ],
      // Interactividad SUTIL (sin 3D problemático)
      interactive && !isPressed && 'hover:bg-white/[0.12] hover:border-white/[0.18]',
      interactive && isPressed && 'bg-white/[0.06] scale-[0.98]',
      interactive && 'cursor-pointer active:scale-[0.98]',
      className
    )

    const handlePointerDown = useCallback(() => {
      if (interactive) setIsPressed(true)
    }, [interactive])

    const handlePointerUp = useCallback(() => {
      if (interactive) setIsPressed(false)
    }, [interactive])

    return (
      <motion.div
        ref={ref}
        className={baseStyles}
        onClick={onClick}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        // Animación de entrada SUTIL
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Shine line superior sutil */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* Contenido */}
        {children}
      </motion.div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS NAVIGATION BAR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSNavBarProps {
  title: string
  subtitle?: string
  showBackButton?: boolean
  onBack?: () => void
  rightAction?: ReactNode
  transparent?: boolean
  large?: boolean
  className?: string
}

export const iOSNavBar = memo(function iOSNavBar({
  title,
  subtitle,
  showBackButton = false,
  onBack,
  rightAction,
  transparent = false,
  large = false,
  className,
}: iOSNavBarProps) {
  return (
    <motion.nav
      className={cn(
        'sticky top-0 z-40 px-4 safe-area-inset-top',
        !transparent && 'backdrop-blur-xl bg-black/60 border-b border-white/10',
        large ? 'py-4' : 'py-3',
        className
      )}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center gap-3 min-w-[60px]">
          {showBackButton && (
            <motion.button
              onClick={onBack}
              className="flex items-center gap-1 text-violet-400 hover:text-violet-300 transition-colors"
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-[17px]">Atrás</span>
            </motion.button>
          )}
        </div>

        {/* Center - Title */}
        <div className="flex-1 text-center">
          <motion.h1
            className={cn(
              'font-semibold text-white truncate',
              large ? 'text-2xl' : 'text-[17px]'
            )}
            layoutId="nav-title"
          >
            {title}
          </motion.h1>
          {subtitle && (
            <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center justify-end min-w-[60px]">
          {rightAction}
        </div>
      </div>
    </motion.nav>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS SEARCH BAR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSSearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onFocus?: () => void
  onBlur?: () => void
  showCancel?: boolean
  onCancel?: () => void
  autoFocus?: boolean
  className?: string
}

export const iOSSearchBar = memo(function iOSSearchBar({
  value,
  onChange,
  placeholder = 'Buscar',
  onFocus,
  onBlur,
  showCancel = false,
  onCancel,
  autoFocus = false,
  className,
}: iOSSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFocus = useCallback(() => {
    setIsFocused(true)
    onFocus?.()
  }, [onFocus])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    onBlur?.()
  }, [onBlur])

  const handleCancel = useCallback(() => {
    onChange('')
    inputRef.current?.blur()
    onCancel?.()
  }, [onChange, onCancel])

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <motion.div
        className={cn(
          'flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl',
          'bg-white/[0.08] border border-white/[0.1]',
          'transition-all duration-200',
          isFocused && 'bg-white/[0.12] border-violet-500/50 ring-2 ring-violet-500/20'
        )}
        animate={{
          width: showCancel && isFocused ? 'calc(100% - 70px)' : '100%',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <Search className="h-4.5 w-4.5 text-white/40 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={cn(
            'flex-1 bg-transparent text-[15px] text-white placeholder-white/40',
            'outline-none'
          )}
        />
        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => onChange('')}
              className="p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="h-3 w-3 text-white/60" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Cancel button */}
      <AnimatePresence>
        {showCancel && isFocused && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onClick={handleCancel}
            className="text-violet-400 text-[15px] font-medium"
          >
            Cancelar
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS LIST ITEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSListItemProps {
  title: string
  subtitle?: string
  leading?: ReactNode
  trailing?: ReactNode
  showChevron?: boolean
  destructive?: boolean
  disabled?: boolean
  onClick?: () => void
  className?: string
}

export const iOSListItem = memo(function iOSListItem({
  title,
  subtitle,
  leading,
  trailing,
  showChevron = true,
  destructive = false,
  disabled = false,
  onClick,
  className,
}: iOSListItemProps) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 text-left',
        'transition-colors duration-150',
        !disabled && 'hover:bg-white/[0.06] active:bg-white/[0.1]',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileTap={!disabled ? { scale: 0.99 } : undefined}
    >
      {/* Leading */}
      {leading && (
        <div className={cn(
          'flex-shrink-0',
          destructive ? 'text-red-400' : 'text-violet-400'
        )}>
          {leading}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[15px] font-medium truncate',
          destructive ? 'text-red-400' : 'text-white'
        )}>
          {title}
        </p>
        {subtitle && (
          <p className="text-[13px] text-white/50 truncate mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      {/* Trailing */}
      {trailing && (
        <div className="flex-shrink-0 text-white/50">
          {trailing}
        </div>
      )}

      {/* Chevron */}
      {showChevron && onClick && !trailing && (
        <ChevronRight className="h-4.5 w-4.5 text-white/30 flex-shrink-0" />
      )}
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS LIST GROUP
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSListGroupProps {
  header?: string
  footer?: string
  children: ReactNode
  className?: string
}

export const iOSListGroup = memo(function iOSListGroup({
  header,
  footer,
  children,
  className,
}: iOSListGroupProps) {
  return (
    <div className={cn('mb-8', className)}>
      {header && (
        <h3 className="px-4 pb-2 text-[13px] font-medium text-white/40 uppercase tracking-wide">
          {header}
        </h3>
      )}

      <div className="bg-white/[0.06] rounded-xl overflow-hidden border border-white/[0.08] divide-y divide-white/[0.06]">
        {children}
      </div>

      {footer && (
        <p className="px-4 pt-2 text-[13px] text-white/40">
          {footer}
        </p>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS BUTTON
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSButtonProps {
  children: ReactNode
  variant?: 'filled' | 'tinted' | 'gray' | 'plain' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  disabled?: boolean
  loading?: boolean
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export const iOSButton = memo(forwardRef<HTMLButtonElement, iOSButtonProps>(
  function iOSButton(
    {
      children,
      variant = 'filled',
      size = 'md',
      fullWidth = false,
      disabled = false,
      loading = false,
      icon: Icon,
      iconPosition = 'left',
      onClick,
      className,
      type = 'button',
    },
    ref
  ) {
    const sizeClasses = {
      sm: 'h-8 px-3 text-[13px] rounded-lg gap-1.5',
      md: 'h-11 px-5 text-[15px] rounded-xl gap-2',
      lg: 'h-14 px-6 text-[17px] rounded-2xl gap-2.5',
    }

    const variantClasses = {
      filled: 'bg-violet-500 text-white hover:bg-violet-400 active:bg-violet-600',
      tinted: 'bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 active:bg-violet-500/40',
      gray: 'bg-white/[0.12] text-white hover:bg-white/[0.18] active:bg-white/[0.08]',
      plain: 'bg-transparent text-violet-400 hover:bg-violet-500/10 active:bg-violet-500/20',
      destructive: 'bg-red-500/20 text-red-400 hover:bg-red-500/30 active:bg-red-500/40',
    }

    const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center font-semibold',
          'transition-colors duration-150',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          (disabled || loading) && 'opacity-50 cursor-not-allowed',
          className
        )}
        whileTap={!disabled && !loading ? { scale: 0.97 } : undefined}
      >
        {loading && (
          <Loader2 className="animate-spin mr-2" style={{ width: iconSize, height: iconSize }} />
        )}
        {!loading && Icon && iconPosition === 'left' && (
          <Icon style={{ width: iconSize, height: iconSize }} />
        )}
        {children}
        {!loading && Icon && iconPosition === 'right' && (
          <Icon style={{ width: iconSize, height: iconSize }} />
        )}
      </motion.button>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS SEGMENTED CONTROL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSSegmentedControlProps<T extends string> {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  fullWidth?: boolean
  className?: string
}

export const iOSSegmentedControl = memo(function iOSSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  fullWidth = true,
  className,
}: iOSSegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        'inline-flex p-1 rounded-xl bg-white/[0.08]',
        fullWidth && 'w-full',
        className
      )}
    >
      {options.map((option) => (
        <motion.button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'relative flex-1 py-2 px-4 text-[13px] font-medium rounded-lg',
            'transition-colors duration-150',
            value === option.value
              ? 'text-white'
              : 'text-white/50 hover:text-white/70'
          )}
        >
          {value === option.value && (
            <motion.div
              layoutId="segment-indicator"
              className="absolute inset-0 bg-white/[0.15] rounded-lg"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{option.label}</span>
        </motion.button>
      ))}
    </div>
  )
}) as <T extends string>(props: iOSSegmentedControlProps<T>) => JSX.Element

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS TOGGLE (SWITCH)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export const iOSToggle = memo(function iOSToggle({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  className,
}: iOSToggleProps) {
  const dimensions = {
    sm: { width: 42, height: 26, knob: 22 },
    md: { width: 51, height: 31, knob: 27 },
  }

  const d = dimensions[size]

  return (
    <motion.button
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative rounded-full transition-colors duration-200',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      style={{
        width: d.width,
        height: d.height,
        backgroundColor: checked ? '#8B5CF6' : 'rgba(255, 255, 255, 0.15)',
      }}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
    >
      <motion.div
        className="absolute top-[2px] rounded-full bg-white shadow-lg"
        style={{ width: d.knob, height: d.knob }}
        animate={{
          x: checked ? d.width - d.knob - 2 : 2,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS ACTION SHEET
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ActionSheetOption {
  label: string
  icon?: LucideIcon
  destructive?: boolean
  onClick: () => void
}

interface iOSActionSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message?: string
  options: ActionSheetOption[]
  showCancel?: boolean
}

export const iOSActionSheet = memo(function iOSActionSheet({
  isOpen,
  onClose,
  title,
  message,
  options,
  showCancel = true,
}: iOSActionSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 p-4 safe-area-inset-bottom"
          >
            {/* Options group */}
            <div className="bg-[#2C2C2E]/95 backdrop-blur-xl rounded-2xl overflow-hidden mb-2">
              {(title || message) && (
                <div className="px-4 py-3 text-center border-b border-white/10">
                  {title && <p className="text-[13px] font-semibold text-white/60">{title}</p>}
                  {message && <p className="text-[13px] text-white/40 mt-0.5">{message}</p>}
                </div>
              )}

              {options.map((option, index) => (
                <motion.button
                  key={index}
                  onClick={() => {
                    option.onClick()
                    onClose()
                  }}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-4 text-[20px]',
                    'transition-colors hover:bg-white/[0.06] active:bg-white/[0.1]',
                    index !== 0 && 'border-t border-white/10',
                    option.destructive ? 'text-red-400' : 'text-violet-400'
                  )}
                  whileTap={{ scale: 0.98 }}
                >
                  {option.icon && <option.icon className="h-5 w-5" />}
                  {option.label}
                </motion.button>
              ))}
            </div>

            {/* Cancel button */}
            {showCancel && (
              <motion.button
                onClick={onClose}
                className="w-full py-4 bg-[#2C2C2E]/95 backdrop-blur-xl rounded-2xl text-[20px] font-semibold text-violet-400 hover:bg-[#3C3C3E]/95 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                Cancelar
              </motion.button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS PILL / CHIP
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSPillProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  icon?: LucideIcon
  dismissible?: boolean
  onDismiss?: () => void
  className?: string
}

const pillVariants = {
  default: 'bg-white/[0.12] text-white/70 border-white/[0.1]',
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  info: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
}

export const iOSPill = memo(function iOSPill({
  children,
  variant = 'default',
  size = 'md',
  icon: Icon,
  dismissible = false,
  onDismiss,
  className,
}: iOSPillProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'inline-flex items-center gap-1.5 border rounded-full',
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-[13px]',
        'font-medium',
        pillVariants[variant],
        className
      )}
    >
      {Icon && <Icon className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />}
      {children}
      {dismissible && (
        <button
          onClick={onDismiss}
          className="ml-0.5 p-0.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <X className={size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
        </button>
      )}
    </motion.span>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS PROGRESS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSProgressProps {
  value: number // 0-100
  variant?: 'linear' | 'circular'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  color?: string
  className?: string
}

export const iOSProgress = memo(function iOSProgress({
  value,
  variant = 'linear',
  size = 'md',
  showLabel = false,
  color = '#8B5CF6',
  className,
}: iOSProgressProps) {
  const clampedValue = Math.min(Math.max(value, 0), 100)

  if (variant === 'circular') {
    const sizes = { sm: 32, md: 44, lg: 64 }
    const strokeWidths = { sm: 3, md: 4, lg: 5 }
    const s = sizes[size]
    const sw = strokeWidths[size]
    const radius = (s - sw) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (clampedValue / 100) * circumference

    return (
      <div className={cn('relative inline-flex items-center justify-center', className)}>
        <svg width={s} height={s} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={s / 2}
            cy={s / 2}
            r={radius}
            strokeWidth={sw}
            stroke="rgba(255, 255, 255, 0.1)"
            fill="none"
          />
          {/* Progress circle */}
          <motion.circle
            cx={s / 2}
            cy={s / 2}
            r={radius}
            strokeWidth={sw}
            stroke={color}
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            style={{ strokeDasharray: circumference }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </svg>
        {showLabel && (
          <span className="absolute text-[11px] font-semibold text-white">
            {Math.round(clampedValue)}%
          </span>
        )}
      </div>
    )
  }

  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' }

  return (
    <div className={cn('w-full', className)}>
      <div className={cn('w-full rounded-full bg-white/[0.1] overflow-hidden', heights[size])}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <p className="mt-1.5 text-[13px] text-white/50 text-right">
          {Math.round(clampedValue)}%
        </p>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS SKELETON LOADER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSSkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: number | string
  height?: number | string
  className?: string
}

export const iOSSkeleton = memo(function iOSSkeleton({
  variant = 'text',
  width,
  height,
  className,
}: iOSSkeletonProps) {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  }

  return (
    <motion.div
      className={cn(
        'bg-white/[0.08]',
        variantClasses[variant],
        className
      )}
      style={{
        width: width || (variant === 'text' ? '100%' : undefined),
        height: height || (variant === 'circular' ? width : undefined),
        aspectRatio: variant === 'circular' ? '1/1' : undefined,
      }}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  iOSThemeContext,
}

export type {
  iOSGlassCardProps,
  iOSNavBarProps,
  iOSSearchBarProps,
  iOSListItemProps,
  iOSListGroupProps,
  iOSButtonProps,
  iOSSegmentedControlProps,
  iOSToggleProps,
  iOSActionSheetProps,
  ActionSheetOption,
  iOSPillProps,
  iOSProgressProps,
  iOSSkeletonProps,
}
