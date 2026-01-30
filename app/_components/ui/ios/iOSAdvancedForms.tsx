/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📝 CHRONOS 2026 — iOS ADVANCED FORMS SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de formularios avanzados estilo iOS 18+:
 * - Inputs con validación visual premium
 * - Scroll interno automático para forms largos
 * - Campos agrupados estilo iOS Settings
 * - Select/Picker nativos
 * - TextArea con auto-resize
 * - Date/Time pickers
 * - Toggle switches
 * - Checkboxes y radios premium
 *
 * @version 2.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import {
  memo,
  ReactNode,
  useCallback,
  useState,
  forwardRef,
  useRef,
  useEffect,
  createContext,
  useContext,
} from 'react'
import {
  LucideIcon,
  Check,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  Calendar,
  Clock,
  AlertCircle,
  Info,
} from 'lucide-react'
import { iOSScrollContainer, FormScrollContainer } from './iOSAdvancedScroll'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM CONTEXT - Para validación y estado del form
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormContextType {
  isSubmitting: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
  setFieldError: (field: string, error: string) => void
  setFieldTouched: (field: string) => void
  clearFieldError: (field: string) => void
}

const FormContext = createContext<FormContextType | null>(null)

export const useForm = () => useContext(FormContext)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS FORM - Contenedor de formulario con scroll
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSFormProps {
  children: ReactNode
  onSubmit?: () => void | Promise<void>
  className?: string
  maxHeight?: string | number
  showScrollIndicators?: boolean
}

export const iOSForm = memo(function iOSForm({
  children,
  onSubmit,
  className,
  maxHeight = '70vh',
  showScrollIndicators = true,
}: iOSFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onSubmit || isSubmitting) return

    setIsSubmitting(true)
    try {
      await onSubmit()
    } finally {
      setIsSubmitting(false)
    }
  }, [onSubmit, isSubmitting])

  const setFieldError = useCallback((field: string, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }))
  }, [])

  const setFieldTouched = useCallback((field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }, [])

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }, [])

  return (
    <FormContext.Provider value={{ isSubmitting, errors, touched, setFieldError, setFieldTouched, clearFieldError }}>
      <form onSubmit={handleSubmit} className={cn('relative', className)}>
        <FormScrollContainer maxHeight={maxHeight} showFadeEdges={showScrollIndicators}>
          {children}
        </FormScrollContainer>
      </form>
    </FormContext.Provider>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS FORM GROUP - Grupo de campos estilo iOS Settings
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSFormGroupProps {
  children: ReactNode
  title?: string
  description?: string
  className?: string
  variant?: 'default' | 'inset'
}

export const iOSFormGroup = memo(function iOSFormGroup({
  children,
  title,
  description,
  className,
  variant = 'default',
}: iOSFormGroupProps) {
  return (
    <div className={cn('mb-6', className)}>
      {title && (
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider px-4 mb-2">
          {title}
        </p>
      )}
      <div
        className={cn(
          'overflow-hidden',
          variant === 'default' && 'bg-white/[0.04] rounded-2xl border border-white/[0.06]',
          variant === 'inset' && 'bg-black/20 rounded-2xl shadow-inner',
        )}
      >
        <div className="divide-y divide-white/[0.06]">{children}</div>
      </div>
      {description && (
        <p className="text-xs text-white/40 px-4 mt-2">{description}</p>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS TEXT INPUT - Input de texto premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSTextInputProps {
  name?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  label?: string
  helper?: string
  error?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  icon?: LucideIcon
  rightIcon?: LucideIcon
  clearable?: boolean
  disabled?: boolean
  required?: boolean
  autoFocus?: boolean
  maxLength?: number
  pattern?: string
  className?: string
  inputClassName?: string
  variant?: 'default' | 'inline' | 'floating'
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
}

export const iOSTextInput = memo(forwardRef<HTMLInputElement, iOSTextInputProps>(
  function iOSTextInput(
    {
      name,
      value,
      defaultValue,
      placeholder,
      label,
      helper,
      error,
      type = 'text',
      icon: Icon,
      rightIcon: RightIcon,
      clearable = false,
      disabled = false,
      required = false,
      autoFocus = false,
      maxLength,
      pattern,
      className,
      inputClassName,
      variant = 'default',
      onChange,
      onFocus,
      onBlur,
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
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
    }, [value, onChange])

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type

    // Inline variant (settings style)
    if (variant === 'inline') {
      return (
        <div className={cn('flex items-center justify-between px-4 py-3', className)}>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {Icon && <Icon size={18} className="text-white/50 shrink-0" />}
            <span className="text-sm text-white truncate">{label}</span>
          </div>
          <input
            ref={ref}
            name={name}
            type={inputType}
            value={displayValue}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            maxLength={maxLength}
            pattern={pattern}
            onChange={handleChange}
            className={cn(
              'text-right bg-transparent text-sm text-white/70 placeholder:text-white/30',
              'focus:outline-none focus:text-white',
              'min-w-[100px] max-w-[50%]',
              inputClassName
            )}
          />
        </div>
      )
    }

    // Default & floating variants
    return (
      <div className={cn('relative', className)}>
        {/* Label */}
        {label && variant === 'default' && (
          <label className="block text-sm font-medium text-white/70 mb-2 px-1">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {/* Input container */}
        <div
          className={cn(
            'relative flex items-center rounded-xl transition-all duration-200',
            'bg-white/[0.06]',
            isFocused
              ? 'border-2 border-violet-500/50 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]'
              : 'border border-white/[0.1]',
            error && 'border-red-500/50',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          {/* Left icon */}
          {Icon && (
            <div className="pl-3 text-white/40">
              <Icon size={18} />
            </div>
          )}

          {/* Floating label */}
          {variant === 'floating' && label && (
            <motion.label
              className={cn(
                'absolute left-3 pointer-events-none',
                'text-white/40 transition-all duration-200',
                (isFocused || displayValue) && 'text-xs -top-2 bg-zinc-900 px-1'
              )}
              animate={{
                y: isFocused || displayValue ? -20 : 0,
                scale: isFocused || displayValue ? 0.85 : 1,
              }}
            >
              {label}
              {required && <span className="text-red-400 ml-1">*</span>}
            </motion.label>
          )}

          {/* Input */}
          <input
            ref={ref}
            name={name}
            type={inputType}
            value={displayValue}
            placeholder={variant === 'floating' ? '' : placeholder}
            disabled={disabled}
            required={required}
            autoFocus={autoFocus}
            maxLength={maxLength}
            pattern={pattern}
            onChange={handleChange}
            onFocus={() => { setIsFocused(true); onFocus?.() }}
            onBlur={() => { setIsFocused(false); onBlur?.() }}
            className={cn(
              'flex-1 bg-transparent px-3 py-3 text-white placeholder:text-white/30',
              'focus:outline-none',
              inputClassName
            )}
          />

          {/* Clear button */}
          {clearable && displayValue && !disabled && (
            <motion.button
              type="button"
              onClick={handleClear}
              className="pr-2 text-white/40 hover:text-white/70"
              whileTap={{ scale: 0.9 }}
            >
              <X size={16} />
            </motion.button>
          )}

          {/* Password toggle */}
          {type === 'password' && (
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="pr-3 text-white/40 hover:text-white/70"
              whileTap={{ scale: 0.9 }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </motion.button>
          )}

          {/* Right icon */}
          {RightIcon && type !== 'password' && (
            <div className="pr-3 text-white/40">
              <RightIcon size={18} />
            </div>
          )}

          {/* Character count */}
          {maxLength && (
            <span className="absolute right-3 bottom-1 text-[10px] text-white/30">
              {displayValue.length}/{maxLength}
            </span>
          )}
        </div>

        {/* Helper/Error text */}
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              className="flex items-center gap-1 text-xs text-red-400 mt-1.5 px-1"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <AlertCircle size={12} />
              {error}
            </motion.p>
          ) : helper ? (
            <motion.p
              key="helper"
              className="text-xs text-white/40 mt-1.5 px-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {helper}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS TEXTAREA - Área de texto con auto-resize
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSTextAreaProps {
  name?: string
  value?: string
  defaultValue?: string
  placeholder?: string
  label?: string
  helper?: string
  error?: string
  rows?: number
  maxRows?: number
  maxLength?: number
  disabled?: boolean
  required?: boolean
  autoResize?: boolean
  className?: string
  onChange?: (value: string) => void
}

export const iOSTextArea = memo(forwardRef<HTMLTextAreaElement, iOSTextAreaProps>(
  function iOSTextArea(
    {
      name,
      value,
      defaultValue,
      placeholder,
      label,
      helper,
      error,
      rows = 3,
      maxRows = 8,
      maxLength,
      disabled = false,
      required = false,
      autoResize = true,
      className,
      onChange,
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false)
    const [internalValue, setInternalValue] = useState(defaultValue || '')
    const internalRef = useRef<HTMLTextAreaElement>(null)
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef
    const displayValue = value !== undefined ? value : internalValue

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    }, [value, onChange])

    // Auto-resize
    useEffect(() => {
      if (!autoResize || !textareaRef.current) return

      const textarea = textareaRef.current
      textarea.style.height = 'auto'
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight)
      const maxHeight = lineHeight * maxRows
      const scrollHeight = Math.min(textarea.scrollHeight, maxHeight)
      textarea.style.height = `${scrollHeight}px`
    }, [displayValue, autoResize, maxRows, textareaRef])

    return (
      <div className={cn('relative', className)}>
        {label && (
          <label className="block text-sm font-medium text-white/70 mb-2 px-1">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        <div
          className={cn(
            'relative rounded-xl transition-all duration-200',
            'bg-white/[0.06]',
            isFocused
              ? 'border-2 border-violet-500/50 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]'
              : 'border border-white/[0.1]',
            error && 'border-red-500/50',
            disabled && 'opacity-50 pointer-events-none'
          )}
        >
          <textarea
            ref={textareaRef}
            name={name}
            value={displayValue}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            required={required}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full bg-transparent px-3 py-3 text-white placeholder:text-white/30',
              'focus:outline-none resize-none',
              'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10'
            )}
            style={{ minHeight: `${rows * 1.5}rem` }}
          />

          {maxLength && (
            <div className="absolute right-3 bottom-2 text-[10px] text-white/30">
              {displayValue.length}/{maxLength}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              className="flex items-center gap-1 text-xs text-red-400 mt-1.5 px-1"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
            >
              <AlertCircle size={12} />
              {error}
            </motion.p>
          ) : helper ? (
            <motion.p
              key="helper"
              className="text-xs text-white/40 mt-1.5 px-1"
            >
              {helper}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS SELECT - Selector desplegable
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: LucideIcon
}

interface iOSSelectProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  label?: string
  helper?: string
  error?: string
  icon?: LucideIcon
  disabled?: boolean
  required?: boolean
  searchable?: boolean
  className?: string
  variant?: 'default' | 'inline'
  onChange?: (value: string) => void
}

export const iOSSelect = memo(function iOSSelect({
  options,
  value,
  defaultValue,
  placeholder = 'Seleccionar...',
  label,
  helper,
  error,
  icon: Icon,
  disabled = false,
  required = false,
  searchable = false,
  className,
  variant = 'default',
  onChange,
}: iOSSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [internalValue, setInternalValue] = useState(defaultValue || '')
  const containerRef = useRef<HTMLDivElement>(null)
  const displayValue = value !== undefined ? value : internalValue

  const selectedOption = options.find(opt => opt.value === displayValue)

  const filteredOptions = searchable
    ? options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()))
    : options

  const handleSelect = useCallback((optValue: string) => {
    if (value === undefined) {
      setInternalValue(optValue)
    }
    onChange?.(optValue)
    setIsOpen(false)
    setSearchTerm('')
  }, [value, onChange])

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [isOpen])

  // Inline variant
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center justify-between px-4 py-3', className)} ref={containerRef}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {Icon && <Icon size={18} className="text-white/50 shrink-0" />}
          <span className="text-sm text-white truncate">{label}</span>
        </div>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-1 text-sm',
            selectedOption ? 'text-white/70' : 'text-white/40'
          )}
        >
          {selectedOption?.label || placeholder}
          <ChevronDown size={16} className={cn('transition-transform', isOpen && 'rotate-180')} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className={cn(
                'absolute right-4 top-full mt-1 z-50',
                'min-w-[150px] max-h-48 overflow-y-auto',
                'bg-zinc-800/95 backdrop-blur-xl rounded-xl',
                'border border-white/10 shadow-xl'
              )}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {filteredOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm text-left',
                    'hover:bg-white/5 transition-colors',
                    opt.value === displayValue && 'text-violet-400',
                    opt.disabled && 'opacity-50 pointer-events-none'
                  )}
                >
                  {opt.label}
                  {opt.value === displayValue && <Check size={14} />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-white/70 mb-2 px-1">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center rounded-xl transition-all duration-200',
          'bg-white/[0.06] px-3 py-3',
          isOpen
            ? 'border-2 border-violet-500/50 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]'
            : 'border border-white/[0.1]',
          error && 'border-red-500/50',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        {Icon && <Icon size={18} className="text-white/40 mr-3" />}
        <span className={cn('flex-1 text-left text-sm', selectedOption ? 'text-white' : 'text-white/40')}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown size={18} className={cn('text-white/40 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={cn(
              'absolute left-0 right-0 top-full mt-2 z-50',
              'bg-zinc-800/95 backdrop-blur-xl rounded-xl',
              'border border-white/10 shadow-xl overflow-hidden'
            )}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
          >
            {/* Search (if searchable) */}
            {searchable && (
              <div className="p-2 border-b border-white/10">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="w-full px-3 py-2 text-sm bg-white/5 rounded-lg text-white placeholder:text-white/30 focus:outline-none"
                  autoFocus
                />
              </div>
            )}

            {/* Options */}
            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-4 text-sm text-white/40 text-center">Sin resultados</p>
              ) : (
                filteredOptions.map(opt => {
                  const OptionIcon = opt.icon
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt.value)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-3 text-sm text-left',
                        'hover:bg-white/5 transition-colors',
                        opt.value === displayValue && 'bg-violet-500/10 text-violet-400',
                        opt.disabled && 'opacity-50 pointer-events-none'
                      )}
                    >
                      {OptionIcon && <OptionIcon size={16} className="text-white/50" />}
                      <span className="flex-1">{opt.label}</span>
                      {opt.value === displayValue && <Check size={16} />}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            key="error"
            className="flex items-center gap-1 text-xs text-red-400 mt-1.5 px-1"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            <AlertCircle size={12} />
            {error}
          </motion.p>
        ) : helper ? (
          <motion.p key="helper" className="text-xs text-white/40 mt-1.5 px-1">
            {helper}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS TOGGLE - Switch on/off
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSToggleFieldProps {
  label: string
  description?: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  icon?: LucideIcon
  className?: string
  onChange?: (checked: boolean) => void
}

export const iOSToggleField = memo(function iOSToggleField({
  label,
  description,
  checked,
  defaultChecked = false,
  disabled = false,
  icon: Icon,
  className,
  onChange,
}: iOSToggleFieldProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isChecked = checked !== undefined ? checked : internalChecked

  const handleToggle = useCallback(() => {
    if (disabled) return
    const newValue = !isChecked
    if (checked === undefined) {
      setInternalChecked(newValue)
    }
    onChange?.(newValue)
  }, [disabled, isChecked, checked, onChange])

  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3',
        disabled && 'opacity-50',
        className
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
            <Icon size={16} className="text-white/70" />
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm text-white truncate">{label}</p>
          {description && (
            <p className="text-xs text-white/40 truncate">{description}</p>
          )}
        </div>
      </div>

      <motion.button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          'relative w-[51px] h-[31px] rounded-full transition-colors shrink-0 ml-3',
          isChecked ? 'bg-violet-500' : 'bg-white/20'
        )}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          className="absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-md"
          animate={{ left: isChecked ? '22px' : '2px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS CHECKBOX - Checkbox premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSCheckboxProps {
  label: string
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  className?: string
  onChange?: (checked: boolean) => void
}

export const iOSCheckbox = memo(function iOSCheckbox({
  label,
  checked,
  defaultChecked = false,
  disabled = false,
  className,
  onChange,
}: iOSCheckboxProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isChecked = checked !== undefined ? checked : internalChecked

  const handleToggle = useCallback(() => {
    if (disabled) return
    const newValue = !isChecked
    if (checked === undefined) {
      setInternalChecked(newValue)
    }
    onChange?.(newValue)
  }, [disabled, isChecked, checked, onChange])

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={disabled}
      className={cn(
        'flex items-center gap-3 text-left',
        disabled && 'opacity-50 pointer-events-none',
        className
      )}
    >
      <motion.div
        className={cn(
          'w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors',
          isChecked
            ? 'bg-violet-500 border-violet-500'
            : 'bg-transparent border-white/30'
        )}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence>
          {isChecked && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check size={14} className="text-white" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <span className="text-sm text-white">{label}</span>
    </button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  iOSFormProps,
  iOSFormGroupProps,
  iOSTextInputProps,
  iOSTextAreaProps,
  SelectOption,
  iOSSelectProps,
  iOSToggleFieldProps,
  iOSCheckboxProps,
}
