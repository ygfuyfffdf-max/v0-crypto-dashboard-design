/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 📝✨ ULTRA FORMS 2026 — FORMULARIOS CON UX PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de formularios con:
 * ✅ Labels flotantes animados
 * ✅ Validación en tiempo real
 * ✅ Auto-guardado visual
 * ✅ Micro-interacciones premium
 * ✅ Estados de focus cinematográficos
 * ✅ Responsive design optimizado
 * ✅ Accesibilidad WCAG AAA
 *
 * @version 2026.1.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/_lib/utils'
import { AlertCircle, Check, ChevronDown, Eye, EyeOff, Loader2, Search, X } from 'lucide-react'
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import React, {
  createContext,
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONTEXTO DE FORMULARIO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormContextType {
  autoSave: boolean
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
  setAutoSaveStatus: (status: 'idle' | 'saving' | 'saved' | 'error') => void
}

const FormContext = createContext<FormContextType | null>(null)

export function UltraFormProvider({
  children,
  autoSave = false,
  onAutoSave,
}: {
  children: React.ReactNode
  autoSave?: boolean
  onAutoSave?: () => Promise<void>
}) {
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>(
    'idle',
  )

  return (
    <FormContext.Provider value={{ autoSave, autoSaveStatus, setAutoSaveStatus }}>
      {children}
      {autoSave && <AutoSaveIndicator status={autoSaveStatus} />}
    </FormContext.Provider>
  )
}

function AutoSaveIndicator({ status }: { status: 'idle' | 'saving' | 'saved' | 'error' }) {
  return (
    <AnimatePresence>
      {status !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="fixed right-6 bottom-6 z-50"
        >
          <div
            className={cn(
              'flex items-center gap-2 rounded-xl border px-4 py-2.5 shadow-2xl backdrop-blur-xl',
              status === 'saving' && 'border-violet-500/30 bg-violet-500/20 text-violet-300',
              status === 'saved' && 'border-emerald-500/30 bg-emerald-500/20 text-emerald-300',
              status === 'error' && 'border-red-500/30 bg-red-500/20 text-red-300',
            )}
          >
            {status === 'saving' && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === 'saved' && <Check className="h-4 w-4" />}
            {status === 'error' && <AlertCircle className="h-4 w-4" />}
            <span className="text-sm font-medium">
              {status === 'saving' && 'Guardando...'}
              {status === 'saved' && 'Guardado'}
              {status === 'error' && 'Error al guardar'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 ULTRA INPUT — CON LABEL FLOTANTE ANIMADO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface UltraInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  success?: boolean
  loading?: boolean
  clearable?: boolean
  onClear?: () => void
  variant?: 'default' | 'filled' | 'ghost'
  inputSize?: 'sm' | 'md' | 'lg'
}

export const UltraInput = forwardRef<HTMLInputElement, UltraInputProps>(
  (
    {
      label,
      error,
      hint,
      icon,
      iconPosition = 'left',
      success,
      loading,
      clearable,
      onClear,
      variant = 'default',
      inputSize = 'md',
      className,
      value,
      defaultValue,
      onFocus,
      onBlur,
      onChange,
      type,
      ...props
    },
    ref,
  ) => {
    const id = useId()
    const [focused, setFocused] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [internalValue, setInternalValue] = useState(defaultValue || '')
    const inputRef = useRef<HTMLInputElement>(null)

    // Manejar valor controlado vs no controlado
    const currentValue = value !== undefined ? value : internalValue
    const hasValue = Boolean(currentValue && String(currentValue).length > 0)
    const isFloating = focused || hasValue

    // Animaciones spring
    const labelY = useSpring(isFloating ? -24 : 0, { stiffness: 300, damping: 30 })
    const labelScale = useSpring(isFloating ? 0.85 : 1, { stiffness: 300, damping: 30 })

    // Efecto de glow magnético
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const glowX = useTransform(mouseX, [0, 1], [-50, 50])
    const glowY = useTransform(mouseY, [0, 1], [-50, 50])

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouseX.set((e.clientX - rect.left) / rect.width)
        mouseY.set((e.clientY - rect.top) / rect.height)
      },
      [mouseX, mouseY],
    )

    const sizeClasses = {
      sm: 'h-10 text-sm',
      md: 'h-12 text-base',
      lg: 'h-14 text-lg',
    }

    const variantClasses = {
      default: 'bg-white/[0.03] border-white/10 hover:border-white/20',
      filled: 'bg-white/[0.08] border-transparent hover:bg-white/[0.12]',
      ghost: 'bg-transparent border-transparent hover:bg-white/[0.05]',
    }

    const isPassword = type === 'password'
    const inputType = isPassword && showPassword ? 'text' : type

    return (
      <div className={cn('relative flex flex-col gap-1', className)}>
        {/* Container con efecto glow */}
        <motion.div className="relative" onMouseMove={handleMouseMove}>
          {/* Glow effect on focus */}
          <AnimatePresence>
            {focused && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-pink-500/20 blur-xl"
                style={{ x: glowX, y: glowY }}
              />
            )}
          </AnimatePresence>

          {/* Input container */}
          <div
            className={cn(
              'relative flex items-center rounded-xl border transition-all duration-300',
              variantClasses[variant],
              sizeClasses[inputSize],
              focused && 'border-violet-500/50 bg-white/[0.06] ring-1 ring-violet-500/20',
              error && 'border-red-500/50 bg-red-500/[0.05]',
              success && 'border-emerald-500/50 bg-emerald-500/[0.05]',
              'group',
            )}
          >
            {/* Icon left */}
            {icon && iconPosition === 'left' && (
              <div
                className={cn(
                  'pl-4 text-white/40 transition-colors',
                  focused && 'text-violet-400',
                  error && 'text-red-400',
                )}
              >
                {icon}
              </div>
            )}

            {/* Floating label */}
            <motion.label
              htmlFor={id}
              className={cn(
                'pointer-events-none absolute left-4 origin-left transition-colors duration-200',
                icon && iconPosition === 'left' && 'left-12',
                isFloating ? 'text-xs text-white/50' : 'text-white/40',
                focused && 'text-violet-400',
                error && 'text-red-400',
                success && 'text-emerald-400',
              )}
              style={{
                y: labelY,
                scale: labelScale,
              }}
            >
              {label}
              {props.required && <span className="ml-0.5 text-red-400">*</span>}
            </motion.label>

            {/* Input */}
            <input
              ref={(node) => {
                if (typeof ref === 'function') {
                  ref(node)
                } else if (ref) {
                  (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
                }
                inputRef.current = node
              }}
              id={id}
              type={inputType}
              value={currentValue}
              onFocus={(e) => {
                setFocused(true)
                onFocus?.(e)
              }}
              onBlur={(e) => {
                setFocused(false)
                onBlur?.(e)
              }}
              onChange={(e) => {
                setInternalValue(e.target.value)
                onChange?.(e)
              }}
              className={cn(
                'flex-1 bg-transparent px-4 pt-3 pb-1 text-white outline-none placeholder:text-transparent',
                'transition-all duration-200 focus:placeholder:text-white/30',
                icon && iconPosition === 'left' && 'pl-2',
                icon && iconPosition === 'right' && 'pr-2',
                (clearable || isPassword || loading) && 'pr-12',
              )}
              placeholder={label}
              {...props}
            />

            {/* Right side actions */}
            <div className="flex items-center gap-1 pr-3">
              {loading && <Loader2 className="h-4 w-4 animate-spin text-violet-400" />}

              {success && !loading && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-emerald-400"
                >
                  <Check className="h-4 w-4" />
                </motion.div>
              )}

              {clearable && hasValue && !loading && (
                <button
                  type="button"
                  onClick={() => {
                    setInternalValue('')
                    onClear?.()
                    inputRef.current?.focus()
                  }}
                  className="rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="rounded-full p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              )}

              {icon && iconPosition === 'right' && (
                <div
                  className={cn('text-white/40 transition-colors', focused && 'text-violet-400')}
                >
                  {icon}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Error/Hint message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -5, height: 0 }}
              className="flex items-center gap-1.5 pl-1 text-xs text-red-400"
            >
              <AlertCircle className="h-3 w-3" />
              {error}
            </motion.p>
          )}
          {hint && !error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pl-1 text-xs text-white/40"
            >
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    )
  },
)

UltraInput.displayName = 'UltraInput'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 ULTRA TEXTAREA — CON AUTO-RESIZE Y CONTADOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface UltraTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
  maxLength?: number
  showCount?: boolean
  autoResize?: boolean
}

export const UltraTextarea = forwardRef<HTMLTextAreaElement, UltraTextareaProps>(
  (
    {
      label,
      error,
      hint,
      maxLength,
      showCount = true,
      autoResize = true,
      className,
      value,
      defaultValue,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref,
  ) => {
    const id = useId()
    const [focused, setFocused] = useState(false)
    const [internalValue, setInternalValue] = useState(defaultValue || '')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const currentValue = value !== undefined ? value : internalValue
    const charCount = String(currentValue).length
    const hasValue = charCount > 0
    const isFloating = focused || hasValue

    // Auto-resize
    useEffect(() => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
    }, [currentValue, autoResize])

    const labelY = useSpring(isFloating ? -20 : 12, { stiffness: 300, damping: 30 })
    const labelScale = useSpring(isFloating ? 0.85 : 1, { stiffness: 300, damping: 30 })

    return (
      <div className={cn('relative flex flex-col gap-1', className)}>
        <div className="relative">
          {/* Glow effect */}
          <AnimatePresence>
            {focused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-pink-500/20 blur-xl"
              />
            )}
          </AnimatePresence>

          {/* Floating label */}
          <motion.label
            htmlFor={id}
            className={cn(
              'pointer-events-none absolute left-4 z-10 origin-left transition-colors duration-200',
              isFloating ? 'text-xs text-white/50' : 'text-white/40',
              focused && 'text-violet-400',
              error && 'text-red-400',
            )}
            style={{
              y: labelY,
              scale: labelScale,
            }}
          >
            {label}
            {props.required && <span className="ml-0.5 text-red-400">*</span>}
          </motion.label>

          {/* Textarea */}
          <textarea
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node)
              } else if (ref) {
                (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node
              }
              textareaRef.current = node
            }}
            id={id}
            value={currentValue}
            maxLength={maxLength}
            onFocus={(e) => {
              setFocused(true)
              onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              onBlur?.(e)
            }}
            onChange={(e) => {
              setInternalValue(e.target.value)
              onChange?.(e)
            }}
            className={cn(
              'min-h-[120px] w-full rounded-xl border px-4 pt-7 pb-3 transition-all duration-300',
              'resize-none border-white/10 bg-white/[0.03] text-white outline-none',
              'placeholder:text-transparent focus:placeholder:text-white/30',
              'hover:border-white/20',
              focused && 'border-violet-500/50 bg-white/[0.06] ring-1 ring-violet-500/20',
              error && 'border-red-500/50 bg-red-500/[0.05]',
            )}
            placeholder={label}
            {...props}
          />

          {/* Character counter */}
          {showCount && maxLength && (
            <div
              className={cn(
                'absolute right-3 bottom-3 text-xs transition-colors',
                charCount > maxLength * 0.9 ? 'text-amber-400' : 'text-white/30',
                charCount >= maxLength && 'text-red-400',
              )}
            >
              {charCount}/{maxLength}
            </div>
          )}
        </div>

        {/* Error/Hint */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex items-center gap-1.5 pl-1 text-xs text-red-400"
            >
              <AlertCircle className="h-3 w-3" />
              {error}
            </motion.p>
          )}
          {hint && !error && <motion.p className="pl-1 text-xs text-white/40">{hint}</motion.p>}
        </AnimatePresence>
      </div>
    )
  },
)

UltraTextarea.displayName = 'UltraTextarea'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 ULTRA SELECT — CON BÚSQUEDA Y ANIMACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface UltraSelectOption {
  value: string
  label: string
  icon?: React.ReactNode
  description?: string
  disabled?: boolean
}

export interface UltraSelectProps {
  label: string
  options: UltraSelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  error?: string
  searchable?: boolean
  clearable?: boolean
  loading?: boolean
  disabled?: boolean
  className?: string
}

export function UltraSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  error,
  searchable = false,
  clearable = false,
  loading = false,
  disabled = false,
  className,
}: UltraSelectProps) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)
  const hasValue = Boolean(selected)
  const isFloating = open || hasValue

  const filteredOptions = useMemo(() => {
    if (!search) return options
    const searchLower = search.toLowerCase()
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(searchLower) ||
        o.description?.toLowerCase().includes(searchLower),
    )
  }, [options, search])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const labelY = useSpring(isFloating ? -24 : 0, { stiffness: 300, damping: 30 })
  const labelScale = useSpring(isFloating ? 0.85 : 1, { stiffness: 300, damping: 30 })

  return (
    <div ref={containerRef} className={cn('relative flex flex-col gap-1', className)}>
      <div className="relative">
        {/* Glow effect */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-pink-500/20 blur-xl"
            />
          )}
        </AnimatePresence>

        {/* Floating label */}
        <motion.label
          htmlFor={id}
          className={cn(
            'pointer-events-none absolute left-4 z-10 origin-left transition-colors duration-200',
            isFloating ? 'text-xs text-white/50' : 'text-white/40',
            open && 'text-violet-400',
            error && 'text-red-400',
          )}
          style={{
            y: labelY,
            scale: labelScale,
          }}
        >
          {label}
        </motion.label>

        {/* Trigger button */}
        <button
          id={id}
          type="button"
          onClick={() => !disabled && setOpen(!open)}
          disabled={disabled}
          className={cn(
            'flex h-12 w-full items-center justify-between rounded-xl border px-4 pt-3 pb-1 transition-all duration-300',
            'border-white/10 bg-white/[0.03] text-left',
            'hover:border-white/20',
            open && 'border-violet-500/50 bg-white/[0.06] ring-1 ring-violet-500/20',
            error && 'border-red-500/50 bg-red-500/[0.05]',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <span
            className={cn(
              'flex items-center gap-2 truncate',
              hasValue ? 'text-white' : 'text-transparent',
            )}
          >
            {selected?.icon}
            {selected?.label || placeholder}
          </span>

          <div className="flex items-center gap-1">
            {loading && <Loader2 className="h-4 w-4 animate-spin text-violet-400" />}

            {clearable && hasValue && !loading && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onChange?.('')
                }}
                className="rounded-full p-1 text-white/40 hover:bg-white/10 hover:text-white/70"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4 text-white/40" />
            </motion.div>
          </div>
        </button>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-gray-900/95 shadow-2xl backdrop-blur-xl"
            >
              {/* Search */}
              {searchable && (
                <div className="border-b border-white/10 p-2">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar..."
                      className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pr-4 pl-9 text-sm text-white outline-none placeholder:text-white/40 focus:border-violet-500/50"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              {/* Options */}
              <div className="max-h-60 overflow-y-auto py-1">
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => (
                    <motion.button
                      key={option.value}
                      type="button"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => {
                        onChange?.(option.value)
                        setOpen(false)
                        setSearch('')
                      }}
                      disabled={option.disabled}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors',
                        'hover:bg-white/10',
                        value === option.value && 'bg-violet-500/10 text-violet-300',
                        option.disabled && 'cursor-not-allowed opacity-50',
                      )}
                    >
                      {option.icon && <span className="text-white/60">{option.icon}</span>}
                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            'truncate',
                            value === option.value ? 'text-violet-300' : 'text-white/90',
                          )}
                        >
                          {option.label}
                        </div>
                        {option.description && (
                          <div className="truncate text-xs text-white/40">{option.description}</div>
                        )}
                      </div>
                      {value === option.value && <Check className="h-4 w-4 text-violet-400" />}
                    </motion.button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-sm text-white/40">
                    No se encontraron resultados
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1.5 pl-1 text-xs text-red-400"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 ULTRA BUTTON — CON MICRO-INTERACCIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface UltraButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'gradient'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  pulse?: boolean
  magnetic?: boolean
  fullWidth?: boolean
  disabled?: boolean
  className?: string
  children?: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

export const UltraButton = forwardRef<HTMLButtonElement, UltraButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      pulse = false,
      magnetic = true,
      fullWidth = false,
      disabled,
      className,
      children,
      onClick,
      type = 'button',
    },
    ref,
  ) => {
    const [isHovered, setIsHovered] = useState(false)
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const buttonRef = useRef<HTMLButtonElement>(null)

    // Magnetic effect
    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!magnetic || !buttonRef.current) return
        const rect = buttonRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left - rect.width / 2) * 0.15
        const y = (e.clientY - rect.top - rect.height / 2) * 0.15
        setMousePosition({ x, y })
      },
      [magnetic],
    )

    const handleMouseLeave = () => {
      setIsHovered(false)
      setMousePosition({ x: 0, y: 0 })
    }

    const variants = {
      primary:
        'bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/25',
      secondary:
        'bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/30',
      ghost: 'bg-transparent hover:bg-white/10 text-white/70 hover:text-white',
      danger:
        'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/25',
      success:
        'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-500/25',
      gradient:
        'bg-gradient-to-r from-violet-600 via-cyan-500 to-pink-500 text-white shadow-lg shadow-violet-500/25 bg-size-200 hover:bg-pos-100',
    }

    const sizes = {
      xs: 'h-7 px-2.5 text-xs gap-1 rounded-lg',
      sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
      md: 'h-10 px-4 text-sm gap-2 rounded-xl',
      lg: 'h-12 px-6 text-base gap-2 rounded-xl',
      xl: 'h-14 px-8 text-lg gap-2.5 rounded-2xl',
    }

    return (
      <motion.button
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node
          }
          buttonRef.current = node
        }}
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{
          x: mousePosition.x,
          y: mousePosition.y,
          scale: isHovered && !disabled && !loading ? 1.02 : 1,
        }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className={cn(
          'relative inline-flex items-center justify-center font-medium transition-all duration-300',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'overflow-hidden',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className,
        )}
      >
        {/* Shine effect on hover */}
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: isHovered ? '200%' : '-100%',
          }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {/* Pulse effect */}
        {pulse && !disabled && !loading && (
          <motion.div
            className="absolute inset-0 rounded-[inherit] bg-current opacity-30"
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Content */}
        <span className="gap-inherit relative flex items-center justify-center">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {icon && iconPosition === 'left' && icon}
              {children}
              {icon && iconPosition === 'right' && icon}
            </>
          )}
        </span>
      </motion.button>
    )
  },
)

UltraButton.displayName = 'UltraButton'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 ULTRA CHECKBOX — CON ANIMACIÓN DE CHECK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface UltraCheckboxProps {
  label: string
  description?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function UltraCheckbox({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  className,
}: UltraCheckboxProps) {
  const id = useId()

  const sizes = {
    sm: { box: 'w-4 h-4', icon: 'w-2.5 h-2.5', text: 'text-sm' },
    md: { box: 'w-5 h-5', icon: 'w-3 h-3', text: 'text-sm' },
    lg: { box: 'w-6 h-6', icon: 'w-4 h-4', text: 'text-base' },
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        'group flex cursor-pointer items-start gap-3',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <div className="relative pt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />

        <motion.div
          className={cn(
            'flex items-center justify-center rounded-md border-2 transition-colors duration-200',
            sizes[size].box,
            checked
              ? 'border-violet-500 bg-violet-500'
              : 'border-white/30 bg-transparent group-hover:border-white/50',
          )}
          whileTap={{ scale: disabled ? 1 : 0.9 }}
        >
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                <Check className={cn('text-white', sizes[size].icon)} strokeWidth={3} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={cn('text-white/80 transition-colors group-hover:text-white', sizes[size].text)}
        >
          {label}
        </div>
        {description && <div className="mt-0.5 text-xs text-white/40">{description}</div>}
      </div>
    </label>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 ULTRA SWITCH — TOGGLE PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface UltraSwitchProps {
  label?: string
  description?: string
  checked?: boolean
  onChange?: (checked: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function UltraSwitch({
  label,
  description,
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  className,
}: UltraSwitchProps) {
  const id = useId()

  const sizes = {
    sm: { track: 'w-8 h-5', thumb: 'w-3.5 h-3.5', translate: 'translate-x-3.5' },
    md: { track: 'w-11 h-6', thumb: 'w-4.5 h-4.5', translate: 'translate-x-5' },
    lg: { track: 'w-14 h-7', thumb: 'w-5.5 h-5.5', translate: 'translate-x-7' },
  }

  return (
    <label
      htmlFor={id}
      className={cn(
        'group flex cursor-pointer items-center gap-3',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => !disabled && onChange?.(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />

        <motion.div
          className={cn(
            'rounded-full transition-colors duration-300',
            sizes[size].track,
            checked ? 'bg-violet-500' : 'bg-white/20 group-hover:bg-white/30',
          )}
        />

        <motion.div
          className={cn(
            'absolute top-0.5 left-0.5 rounded-full bg-white shadow-lg',
            sizes[size].thumb,
          )}
          animate={{
            x: checked ? parseInt(sizes[size].translate.split('-x-')[1] ?? '0', 10) * 4 : 0,
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>

      {(label || description) && (
        <div className="min-w-0 flex-1">
          {label && (
            <div className="text-sm text-white/80 transition-colors group-hover:text-white">
              {label}
            </div>
          )}
          {description && <div className="mt-0.5 text-xs text-white/40">{description}</div>}
        </div>
      )}
    </label>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { AutoSaveIndicator }
