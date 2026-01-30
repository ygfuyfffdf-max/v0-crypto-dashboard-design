/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📝 CHRONOS 2026 — iOS PREMIUM FORM SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de formularios premium estilo iOS con:
 * - Inputs con diseño minimalista y limpio
 * - Validación visual elegante
 * - Animaciones sutiles
 * - Scroll interno optimizado
 * - Teclado virtual awareness
 * - Auto-save indicators
 * - Error handling visual
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  HelpCircle,
  Info,
  Loader2,
  LucideIcon,
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
  useId,
  useRef,
  useState,
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormContextValue {
  isSubmitting: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
  setFieldTouched: (field: string) => void
  setFieldError: (field: string, error: string | undefined) => void
}

const FormContext = createContext<FormContextValue | null>(null)

export const useFormContext = () => useContext(FormContext)

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS INPUT BASE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSInputProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  disabled?: boolean
  readOnly?: boolean
  error?: string
  hint?: string
  required?: boolean
  icon?: LucideIcon
  suffix?: ReactNode
  maxLength?: number
  showCharCount?: boolean
  autoFocus?: boolean
  onBlur?: () => void
  onFocus?: () => void
  inputMode?: 'text' | 'numeric' | 'decimal' | 'email' | 'tel' | 'url' | 'search'
  pattern?: string
  name?: string
  className?: string
}

export const iOSInput = memo(forwardRef<HTMLInputElement, iOSInputProps>(
  function iOSInput(
    {
      label,
      placeholder,
      value,
      onChange,
      type = 'text',
      disabled = false,
      readOnly = false,
      error,
      hint,
      required = false,
      icon: Icon,
      suffix,
      maxLength,
      showCharCount = false,
      autoFocus = false,
      onBlur,
      onFocus,
      inputMode,
      pattern,
      name,
      className,
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const inputId = useId()

    const handleFocus = useCallback(() => {
      setIsFocused(true)
      onFocus?.()
    }, [onFocus])

    const handleBlur = useCallback(() => {
      setIsFocused(false)
      onBlur?.()
    }, [onBlur])

    const hasError = Boolean(error)
    const hasValue = Boolean(value)

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block mb-2 text-[13px] font-medium',
              hasError ? 'text-red-400' : 'text-white/60'
            )}
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Icon */}
          {Icon && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2">
              <Icon
                className={cn(
                  'h-[18px] w-[18px] transition-colors duration-150',
                  isFocused
                    ? 'text-violet-400'
                    : hasError
                    ? 'text-red-400'
                    : 'text-white/40'
                )}
              />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type === 'password' && showPassword ? 'text' : type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            autoFocus={autoFocus}
            maxLength={maxLength}
            inputMode={inputMode}
            pattern={pattern}
            className={cn(
              'w-full h-12 px-4 rounded-xl text-[15px] text-white',
              'bg-white/[0.06] border outline-none',
              'transition-all duration-200',
              'placeholder:text-white/30',
              // States
              isFocused && !hasError && 'border-violet-500/60 bg-white/[0.08] ring-2 ring-violet-500/20',
              !isFocused && !hasError && 'border-white/[0.08] hover:border-white/[0.15]',
              hasError && 'border-red-500/60 bg-red-500/[0.05] ring-2 ring-red-500/10',
              disabled && 'opacity-50 cursor-not-allowed',
              readOnly && 'cursor-default',
              // Padding adjustments
              Icon && 'pl-11',
              (suffix || type === 'password') && 'pr-11'
            )}
          />

          {/* Password toggle or suffix */}
          {type === 'password' ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-white/40 hover:text-white/60 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-[18px] w-[18px]" />
              ) : (
                <Eye className="h-[18px] w-[18px]" />
              )}
            </button>
          ) : (
            suffix && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {suffix}
              </div>
            )
          )}

          {/* Clear button */}
          {hasValue && !disabled && !readOnly && isFocused && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              type="button"
              onClick={() => onChange('')}
              className={cn(
                'absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full',
                'bg-white/20 text-white/60 hover:bg-white/30',
                'transition-colors',
                type === 'password' ? 'right-12' : suffix ? 'right-12' : 'right-3'
              )}
            >
              <X className="h-3 w-3" />
            </motion.button>
          )}
        </div>

        {/* Error or hint */}
        <div className="mt-1.5 min-h-[18px]">
          <AnimatePresence mode="wait">
            {error ? (
              <motion.p
                key="error"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-1.5 text-[12px] text-red-400"
              >
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </motion.p>
            ) : hint ? (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[12px] text-white/40"
              >
                {hint}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        {/* Character count */}
        {showCharCount && maxLength && (
          <p
            className={cn(
              'text-right text-[11px] mt-1',
              value.length >= maxLength ? 'text-red-400' : 'text-white/30'
            )}
          >
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS TEXT AREA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSTextAreaProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  readOnly?: boolean
  error?: string
  hint?: string
  required?: boolean
  rows?: number
  maxLength?: number
  showCharCount?: boolean
  autoResize?: boolean
  onBlur?: () => void
  onFocus?: () => void
  name?: string
  className?: string
}

export const iOSTextArea = memo(forwardRef<HTMLTextAreaElement, iOSTextAreaProps>(
  function iOSTextArea(
    {
      label,
      placeholder,
      value,
      onChange,
      disabled = false,
      readOnly = false,
      error,
      hint,
      required = false,
      rows = 4,
      maxLength,
      showCharCount = false,
      autoResize = true,
      onBlur,
      onFocus,
      name,
      className,
    },
    ref
  ) {
    const [isFocused, setIsFocused] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const inputId = useId()

    const hasError = Boolean(error)

    // Auto-resize
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, [value, autoResize])

    const handleFocus = useCallback(() => {
      setIsFocused(true)
      onFocus?.()
    }, [onFocus])

    const handleBlur = useCallback(() => {
      setIsFocused(false)
      onBlur?.()
    }, [onBlur])

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block mb-2 text-[13px] font-medium',
              hasError ? 'text-red-400' : 'text-white/60'
            )}
          >
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          id={inputId}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className={cn(
            'w-full px-4 py-3 rounded-xl text-[15px] text-white resize-none',
            'bg-white/[0.06] border outline-none',
            'transition-all duration-200',
            'placeholder:text-white/30',
            // Scroll styles
            'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
            // States
            isFocused && !hasError && 'border-violet-500/60 bg-white/[0.08] ring-2 ring-violet-500/20',
            !isFocused && !hasError && 'border-white/[0.08] hover:border-white/[0.15]',
            hasError && 'border-red-500/60 bg-red-500/[0.05] ring-2 ring-red-500/10',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
          style={{
            minHeight: `${rows * 24 + 24}px`,
            maxHeight: '300px',
          }}
        />

        {/* Error, hint, and character count */}
        <div className="flex items-start justify-between mt-1.5 gap-4">
          <div className="flex-1 min-h-[18px]">
            <AnimatePresence mode="wait">
              {error ? (
                <motion.p
                  key="error"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center gap-1.5 text-[12px] text-red-400"
                >
                  <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                  {error}
                </motion.p>
              ) : hint ? (
                <motion.p
                  key="hint"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[12px] text-white/40"
                >
                  {hint}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>

          {showCharCount && maxLength && (
            <p
              className={cn(
                'text-[11px] flex-shrink-0',
                value.length >= maxLength ? 'text-red-400' : 'text-white/30'
              )}
            >
              {value.length}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
))

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS SELECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface iOSSelectProps {
  label?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  error?: string
  hint?: string
  required?: boolean
  searchable?: boolean
  icon?: LucideIcon
  className?: string
}

export const iOSSelect = memo(function iOSSelect({
  label,
  placeholder = 'Seleccionar...',
  value,
  onChange,
  options,
  disabled = false,
  error,
  hint,
  required = false,
  searchable = false,
  icon: Icon,
  className,
}: iOSSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputId = useId()

  const hasError = Boolean(error)
  const selectedOption = options.find((opt) => opt.value === value)

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue)
      setIsOpen(false)
      setSearchQuery('')
    },
    [onChange]
  )

  return (
    <div ref={containerRef} className={cn('w-full relative', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'block mb-2 text-[13px] font-medium',
            hasError ? 'text-red-400' : 'text-white/60'
          )}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Trigger */}
      <motion.button
        id={inputId}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full h-12 px-4 rounded-xl text-[15px] text-left',
          'bg-white/[0.06] border outline-none',
          'transition-all duration-200',
          'flex items-center gap-3',
          isOpen && !hasError && 'border-violet-500/60 bg-white/[0.08] ring-2 ring-violet-500/20',
          !isOpen && !hasError && 'border-white/[0.08] hover:border-white/[0.15]',
          hasError && 'border-red-500/60 bg-red-500/[0.05]',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        whileTap={!disabled ? { scale: 0.99 } : undefined}
      >
        {Icon && (
          <Icon
            className={cn(
              'h-[18px] w-[18px] flex-shrink-0',
              isOpen ? 'text-violet-400' : 'text-white/40'
            )}
          />
        )}
        <span
          className={cn(
            'flex-1 truncate',
            selectedOption ? 'text-white' : 'text-white/30'
          )}
        >
          {selectedOption?.label || placeholder}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-white/40 flex-shrink-0" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 w-full mt-2 rounded-xl overflow-hidden',
              'bg-[#2C2C2E]/98 backdrop-blur-xl',
              'border border-white/[0.12]',
              'shadow-[0_16px_48px_rgba(0,0,0,0.3)]'
            )}
          >
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b border-white/[0.08]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full h-9 pl-9 pr-4 rounded-lg text-[14px] text-white bg-white/[0.06] border border-white/[0.08] outline-none placeholder:text-white/30"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              {filteredOptions.length === 0 ? (
                <p className="px-4 py-3 text-[14px] text-white/40 text-center">
                  No se encontraron opciones
                </p>
              ) : (
                filteredOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleSelect(option.value)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full px-4 py-3 text-left flex items-center gap-3',
                      'transition-colors duration-100',
                      option.disabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-white/[0.06] active:bg-white/[0.1]',
                      option.value === value && 'bg-violet-500/10'
                    )}
                    whileTap={!option.disabled ? { scale: 0.99 } : undefined}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          'text-[15px] truncate',
                          option.value === value ? 'text-violet-400' : 'text-white'
                        )}
                      >
                        {option.label}
                      </p>
                      {option.description && (
                        <p className="text-[12px] text-white/40 truncate mt-0.5">
                          {option.description}
                        </p>
                      )}
                    </div>
                    {option.value === value && (
                      <Check className="h-4 w-4 text-violet-400 flex-shrink-0" />
                    )}
                  </motion.button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error or hint */}
      <div className="mt-1.5 min-h-[18px]">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5 text-[12px] text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </motion.p>
          ) : hint ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[12px] text-white/40"
            >
              {hint}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS CHECKBOX
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  description?: string
  disabled?: boolean
  error?: string
  className?: string
}

export const iOSCheckbox = memo(function iOSCheckbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  error,
  className,
}: iOSCheckboxProps) {
  return (
    <div className={className}>
      <label
        className={cn(
          'flex items-start gap-3 cursor-pointer',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      >
        {/* Checkbox */}
        <motion.div
          className={cn(
            'w-5 h-5 rounded-md flex-shrink-0 mt-0.5',
            'border-2 transition-colors duration-150',
            'flex items-center justify-center',
            checked
              ? 'bg-violet-500 border-violet-500'
              : error
              ? 'border-red-500/60 bg-red-500/5'
              : 'border-white/30 bg-white/5'
          )}
          whileTap={!disabled ? { scale: 0.9 } : undefined}
          onClick={(e) => {
            e.preventDefault()
            if (!disabled) onChange(!checked)
          }}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Check className="h-3 w-3 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Label and description */}
        <div className="flex-1 min-w-0" onClick={() => !disabled && onChange(!checked)}>
          {label && (
            <p className="text-[15px] text-white leading-tight">{label}</p>
          )}
          {description && (
            <p className="text-[13px] text-white/50 mt-0.5">{description}</p>
          )}
        </div>
      </label>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-[12px] text-red-400 mt-1.5 ml-8"
        >
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS RADIO GROUP
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface iOSRadioGroupProps {
  value: string
  onChange: (value: string) => void
  options: RadioOption[]
  label?: string
  error?: string
  required?: boolean
  direction?: 'vertical' | 'horizontal'
  className?: string
}

export const iOSRadioGroup = memo(function iOSRadioGroup({
  value,
  onChange,
  options,
  label,
  error,
  required = false,
  direction = 'vertical',
  className,
}: iOSRadioGroupProps) {
  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <p
          className={cn(
            'mb-3 text-[13px] font-medium',
            error ? 'text-red-400' : 'text-white/60'
          )}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </p>
      )}

      {/* Options */}
      <div
        className={cn(
          'flex gap-3',
          direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-start gap-3 cursor-pointer',
              option.disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {/* Radio */}
            <motion.div
              className={cn(
                'w-5 h-5 rounded-full flex-shrink-0 mt-0.5',
                'border-2 transition-colors duration-150',
                'flex items-center justify-center',
                value === option.value
                  ? 'border-violet-500'
                  : error
                  ? 'border-red-500/60'
                  : 'border-white/30'
              )}
              whileTap={!option.disabled ? { scale: 0.9 } : undefined}
              onClick={(e) => {
                e.preventDefault()
                if (!option.disabled) onChange(option.value)
              }}
            >
              <AnimatePresence>
                {value === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-2.5 h-2.5 rounded-full bg-violet-500"
                  />
                )}
              </AnimatePresence>
            </motion.div>

            {/* Label */}
            <div
              className="flex-1 min-w-0"
              onClick={() => !option.disabled && onChange(option.value)}
            >
              <p className="text-[15px] text-white">{option.label}</p>
              {option.description && (
                <p className="text-[13px] text-white/50 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-[12px] text-red-400 mt-2"
        >
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS NUMBER INPUT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSNumberInputProps {
  label?: string
  value: number | ''
  onChange: (value: number | '') => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  error?: string
  hint?: string
  required?: boolean
  showStepper?: boolean
  prefix?: string
  suffix?: string
  className?: string
}

export const iOSNumberInput = memo(function iOSNumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  error,
  hint,
  required = false,
  showStepper = true,
  prefix,
  suffix,
  className,
}: iOSNumberInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputId = useId()
  const hasError = Boolean(error)

  const handleIncrement = useCallback(() => {
    const currentValue = value === '' ? 0 : value
    const newValue = currentValue + step
    if (max !== undefined && newValue > max) return
    onChange(newValue)
  }, [value, step, max, onChange])

  const handleDecrement = useCallback(() => {
    const currentValue = value === '' ? 0 : value
    const newValue = currentValue - step
    if (min !== undefined && newValue < min) return
    onChange(newValue)
  }, [value, step, min, onChange])

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={cn(
            'block mb-2 text-[13px] font-medium',
            hasError ? 'text-red-400' : 'text-white/60'
          )}
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      {/* Input container */}
      <div className="relative flex items-center">
        {/* Decrement button */}
        {showStepper && (
          <motion.button
            type="button"
            onClick={handleDecrement}
            disabled={disabled || (min !== undefined && (value === '' ? 0 : value) <= min)}
            className={cn(
              'h-12 w-12 rounded-l-xl flex items-center justify-center',
              'bg-white/[0.06] border border-white/[0.08] border-r-0',
              'text-white/60 hover:text-white hover:bg-white/[0.1]',
              'transition-colors duration-150',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.button>
        )}

        {/* Input */}
        <div className={cn('flex-1 relative', !showStepper && 'w-full')}>
          {prefix && (
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-white/40">
              {prefix}
            </span>
          )}

          <input
            id={inputId}
            type="number"
            value={value}
            onChange={(e) => {
              const val = e.target.value
              onChange(val === '' ? '' : Number(val))
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={cn(
              'w-full h-12 text-center text-[15px] text-white',
              'bg-white/[0.06] border outline-none',
              'transition-all duration-200',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              // Borders
              showStepper ? 'border-x-0 rounded-none' : 'rounded-xl',
              // States
              isFocused && !hasError && 'bg-white/[0.08] ring-2 ring-violet-500/20 border-violet-500/60',
              !isFocused && !hasError && 'border-white/[0.08]',
              hasError && 'border-red-500/60 bg-red-500/[0.05]',
              disabled && 'opacity-50 cursor-not-allowed',
              // Padding
              prefix && 'pl-10',
              suffix && 'pr-10'
            )}
          />

          {suffix && (
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[15px] text-white/40">
              {suffix}
            </span>
          )}
        </div>

        {/* Increment button */}
        {showStepper && (
          <motion.button
            type="button"
            onClick={handleIncrement}
            disabled={disabled || (max !== undefined && (value === '' ? 0 : value) >= max)}
            className={cn(
              'h-12 w-12 rounded-r-xl flex items-center justify-center',
              'bg-white/[0.06] border border-white/[0.08] border-l-0',
              'text-white/60 hover:text-white hover:bg-white/[0.1]',
              'transition-colors duration-150',
              'disabled:opacity-40 disabled:cursor-not-allowed'
            )}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronUp className="h-5 w-5" />
          </motion.button>
        )}
      </div>

      {/* Error or hint */}
      <div className="mt-1.5 min-h-[18px]">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center gap-1.5 text-[12px] text-red-400"
            >
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              {error}
            </motion.p>
          ) : hint ? (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[12px] text-white/40"
            >
              {hint}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS FORM CONTAINER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSFormContainerProps {
  children: ReactNode
  onSubmit?: (e: React.FormEvent) => void
  className?: string
  maxHeight?: string
}

export const iOSFormContainer = memo(function iOSFormContainer({
  children,
  onSubmit,
  className,
  maxHeight,
}: iOSFormContainerProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.(e)
      }}
      className={cn(
        'space-y-5 overflow-y-auto',
        'scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10',
        className
      )}
      style={{
        maxHeight: maxHeight || 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {children}
    </form>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// iOS FORM SECTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface iOSFormSectionProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export const iOSFormSection = memo(function iOSFormSection({
  title,
  description,
  children,
  className,
}: iOSFormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-[13px] font-semibold text-white/60 uppercase tracking-wide">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-[13px] text-white/40">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  iOSInputProps,
  iOSTextAreaProps,
  iOSSelectProps,
  SelectOption,
  iOSCheckboxProps,
  iOSRadioGroupProps,
  RadioOption,
  iOSNumberInputProps,
  iOSFormContainerProps,
  iOSFormSectionProps,
}
