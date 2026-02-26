"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY — GLASS FORM SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Glass-styled form components for the Chronos design system.
 * Includes:
 * - GlassInput         — Text input with floating label
 * - GlassSelect        — Dropdown select
 * - GlassTextarea      — Multiline textarea
 * - GlassCurrencyInput — Money input with locale formatting
 * - GlassAutocomplete  — Searchable select with create option
 *
 * All components share a unified liquid glass aesthetic:
 * bg-white/[0.03], border-white/[0.08], violet accent glow on focus.
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { motion } from "motion/react"
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════
// SHARED STYLES
// ═══════════════════════════════════════════════════════════════════════════════════════

const glassBase = [
  "w-full rounded-xl",
  "bg-white/[0.03] backdrop-blur-sm",
  "border border-white/[0.08]",
  "text-white placeholder:text-white/25",
  "transition-all duration-200 ease-out",
  "outline-none",
].join(" ")

const glassFocus = [
  "focus:border-violet-500/40",
  "focus:ring-1 focus:ring-violet-500/20",
  "focus:shadow-[0_0_20px_-4px_rgba(139,92,246,0.25)]",
].join(" ")

const glassError = "border-red-500/40 focus:border-red-500/40 focus:ring-red-500/20"

const labelBase =
  "absolute left-4 pointer-events-none text-white/40 transition-all duration-200 ease-out origin-left"

// ═══════════════════════════════════════════════════════════════════════════════════════
// 1. GLASS INPUT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface GlassInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string
  error?: string
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ label, error, className, value, defaultValue, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const [hasValue, setHasValue] = useState(
      () => !!(value ?? defaultValue ?? (props as Record<string, unknown>).defaultValue)
    )

    const isFloating = focused || hasValue

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(true)
        onFocus?.(e)
      },
      [onFocus]
    )

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLInputElement>) => {
        setFocused(false)
        setHasValue(!!e.target.value)
        onBlur?.(e)
      },
      [onBlur]
    )

    // Sync controlled value
    useEffect(() => {
      if (value !== undefined) setHasValue(!!value)
    }, [value])

    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            className={cn(
              glassBase,
              glassFocus,
              "h-12 px-4",
              label ? "pt-4 pb-1 text-sm" : "text-sm",
              error && glassError,
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {label && (
            <motion.label
              className={cn(labelBase, error && "text-red-400/60")}
              animate={{
                top: isFloating ? 6 : 14,
                fontSize: isFloating ? "11px" : "14px",
                color: isFloating
                  ? error
                    ? "rgba(248,113,113,0.6)"
                    : focused
                      ? "rgba(139,92,246,0.7)"
                      : "rgba(255,255,255,0.35)"
                  : "rgba(255,255,255,0.4)",
              }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              {label}
            </motion.label>
          )}
        </div>

        {error && (
          <motion.p
            className="mt-1.5 pl-1 text-xs text-red-400/80"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
GlassInput.displayName = "GlassInput"

// ═══════════════════════════════════════════════════════════════════════════════════════
// 2. GLASS SELECT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface GlassSelectOption {
  value: string
  label: string
}

interface GlassSelectProps {
  label?: string
  options: GlassSelectOption[]
  error?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function GlassSelect({
  label,
  options,
  error,
  value,
  onChange,
  className,
  placeholder,
  disabled,
}: GlassSelectProps) {
  const [focused, setFocused] = useState(false)
  const isFloating = focused || !!value

  return (
    <div className="relative w-full">
      <div className="relative">
        <select
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          className={cn(
            glassBase,
            glassFocus,
            "h-12 cursor-pointer appearance-none px-4 pr-10",
            label ? "pt-4 pb-1 text-sm" : "text-sm",
            !value && "text-white/40",
            error && glassError,
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
        >
          {placeholder && (
            <option value="" disabled className="bg-neutral-900 text-white/40">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-neutral-900 text-white">
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron icon */}
        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/30">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {label && (
          <motion.label
            className={cn(labelBase, "pointer-events-none", error && "text-red-400/60")}
            animate={{
              top: isFloating ? 6 : 14,
              fontSize: isFloating ? "11px" : "14px",
              color: isFloating
                ? error
                  ? "rgba(248,113,113,0.6)"
                  : focused
                    ? "rgba(139,92,246,0.7)"
                    : "rgba(255,255,255,0.35)"
                : "rgba(255,255,255,0.4)",
            }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {label}
          </motion.label>
        )}
      </div>

      {error && (
        <motion.p
          className="mt-1.5 pl-1 text-xs text-red-400/80"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 3. GLASS TEXTAREA
// ═══════════════════════════════════════════════════════════════════════════════════════

interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const GlassTextarea = forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ label, error, className, value, defaultValue, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const [hasValue, setHasValue] = useState(() => !!(value ?? defaultValue))

    const isFloating = focused || hasValue

    const handleFocus = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setFocused(true)
        onFocus?.(e)
      },
      [onFocus]
    )

    const handleBlur = useCallback(
      (e: React.FocusEvent<HTMLTextAreaElement>) => {
        setFocused(false)
        setHasValue(!!e.target.value)
        onBlur?.(e)
      },
      [onBlur]
    )

    useEffect(() => {
      if (value !== undefined) setHasValue(!!value)
    }, [value])

    return (
      <div className="relative w-full">
        <div className="relative">
          <textarea
            ref={ref}
            value={value}
            defaultValue={defaultValue}
            className={cn(
              glassBase,
              glassFocus,
              "min-h-[100px] resize-y px-4",
              label ? "pt-6 pb-3 text-sm" : "py-3 text-sm",
              error && glassError,
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />

          {label && (
            <motion.label
              className={cn(labelBase, error && "text-red-400/60")}
              animate={{
                top: isFloating ? 6 : 14,
                fontSize: isFloating ? "11px" : "14px",
                color: isFloating
                  ? error
                    ? "rgba(248,113,113,0.6)"
                    : focused
                      ? "rgba(139,92,246,0.7)"
                      : "rgba(255,255,255,0.35)"
                  : "rgba(255,255,255,0.4)",
              }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              {label}
            </motion.label>
          )}
        </div>

        {error && (
          <motion.p
            className="mt-1.5 pl-1 text-xs text-red-400/80"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {error}
          </motion.p>
        )}
      </div>
    )
  }
)
GlassTextarea.displayName = "GlassTextarea"

// ═══════════════════════════════════════════════════════════════════════════════════════
// 4. GLASS CURRENCY INPUT
// ═══════════════════════════════════════════════════════════════════════════════════════

interface GlassCurrencyInputProps {
  label?: string
  error?: string
  value: number
  onChange: (value: number) => void
  currency?: string
  className?: string
  disabled?: boolean
  placeholder?: string
}

export function GlassCurrencyInput({
  label,
  error,
  value,
  onChange,
  currency = "$",
  className,
  disabled,
  placeholder,
}: GlassCurrencyInputProps) {
  const [focused, setFocused] = useState(false)
  const [displayValue, setDisplayValue] = useState(() => formatCurrency(value))
  const inputRef = useRef<HTMLInputElement>(null)

  const isFloating = focused || value > 0 || !!displayValue

  // Format number with locale commas
  function formatCurrency(num: number): string {
    if (num === 0) return ""
    return num.toLocaleString("en-US", { maximumFractionDigits: 2 })
  }

  // Parse formatted string back to number
  function parseCurrency(str: string): number {
    const cleaned = str.replace(/[^0-9.]/g, "")
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : parsed
  }

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value
      // Allow only digits, dots, and commas while typing
      const sanitized = raw.replace(/[^0-9.,]/g, "")
      setDisplayValue(sanitized)
      const num = parseCurrency(sanitized)
      onChange(num)
    },
    [onChange]
  )

  const handleFocus = useCallback(() => {
    setFocused(true)
    // Show raw number on focus for easy editing
    if (value > 0) {
      setDisplayValue(value.toString())
    }
  }, [value])

  const handleBlur = useCallback(() => {
    setFocused(false)
    // Re-format on blur
    setDisplayValue(formatCurrency(value))
  }, [value])

  // Sync external value changes
  useEffect(() => {
    if (!focused) {
      setDisplayValue(formatCurrency(value))
    }
  }, [value, focused])

  return (
    <div className="relative w-full">
      <div className="relative">
        {/* Currency symbol prefix */}
        <div
          className={cn(
            "absolute top-1/2 left-4 -translate-y-1/2 text-sm font-medium transition-colors duration-200",
            focused ? "text-violet-400/70" : "text-white/30",
            error && "text-red-400/50"
          )}
        >
          {currency}
        </div>

        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            glassBase,
            glassFocus,
            "h-12 pr-4 pl-9 text-sm tabular-nums",
            label && "pt-4 pb-1",
            error && glassError,
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
        />

        {label && (
          <motion.label
            className={cn(labelBase, "left-9", error && "text-red-400/60")}
            animate={{
              top: isFloating ? 6 : 14,
              fontSize: isFloating ? "11px" : "14px",
              color: isFloating
                ? error
                  ? "rgba(248,113,113,0.6)"
                  : focused
                    ? "rgba(139,92,246,0.7)"
                    : "rgba(255,255,255,0.35)"
                : "rgba(255,255,255,0.4)",
            }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {label}
          </motion.label>
        )}
      </div>

      {error && (
        <motion.p
          className="mt-1.5 pl-1 text-xs text-red-400/80"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// 5. GLASS AUTOCOMPLETE
// ═══════════════════════════════════════════════════════════════════════════════════════

interface GlassAutocompleteOption {
  value: string
  label: string
}

interface GlassAutocompleteProps {
  label?: string
  options: GlassAutocompleteOption[]
  value?: string
  onChange?: (value: string) => void
  onCreateNew?: (term: string) => void
  error?: string
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function GlassAutocomplete({
  label,
  options,
  value,
  onChange,
  onCreateNew,
  error,
  className,
  placeholder,
  disabled,
}: GlassAutocompleteProps) {
  const [focused, setFocused] = useState(false)
  const [search, setSearch] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  // Resolve display label from value
  const selectedLabel = useMemo(
    () => options.find((o) => o.value === value)?.label ?? "",
    [options, value]
  )

  // Filtered options
  const filtered = useMemo(() => {
    if (!search) return options
    const term = search.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(term))
  }, [options, search])

  const isFloating = focused || !!value || !!search

  // Select an option
  const selectOption = useCallback(
    (opt: GlassAutocompleteOption) => {
      onChange?.(opt.value)
      setSearch("")
      setIsOpen(false)
      setHighlightIndex(-1)
      inputRef.current?.blur()
    },
    [onChange]
  )

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === "ArrowDown" || e.key === "Enter") {
          setIsOpen(true)
          e.preventDefault()
        }
        return
      }

      const totalItems = filtered.length + (onCreateNew && search ? 1 : 0)

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setHighlightIndex((prev) => (prev + 1) % totalItems)
          break
        case "ArrowUp":
          e.preventDefault()
          setHighlightIndex((prev) => (prev - 1 + totalItems) % totalItems)
          break
        case "Enter":
          e.preventDefault()
          if (highlightIndex >= 0 && highlightIndex < filtered.length) {
            selectOption(filtered[highlightIndex]!)
          } else if (highlightIndex === filtered.length && onCreateNew && search) {
            onCreateNew(search)
            setSearch("")
            setIsOpen(false)
          }
          break
        case "Escape":
          setIsOpen(false)
          setHighlightIndex(-1)
          break
      }
    },
    [isOpen, filtered, highlightIndex, onCreateNew, search, selectOption]
  )

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setHighlightIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll("[data-autocomplete-item]")
      items[highlightIndex]?.scrollIntoView({ block: "nearest" })
    }
  }, [highlightIndex])

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={search || (focused ? "" : selectedLabel)}
          onChange={(e) => {
            setSearch(e.target.value)
            setIsOpen(true)
            setHighlightIndex(-1)
          }}
          onFocus={() => {
            setFocused(true)
            setIsOpen(true)
            if (selectedLabel) setSearch("")
          }}
          onBlur={() => {
            setFocused(false)
            // Delay close to allow click on list items
            setTimeout(() => {
              if (!containerRef.current?.contains(document.activeElement)) {
                setSearch("")
              }
            }, 150)
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={!label ? placeholder : undefined}
          className={cn(
            glassBase,
            glassFocus,
            "h-12 px-4 pr-10 text-sm",
            label && "pt-4 pb-1",
            error && glassError,
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />

        {/* Search icon */}
        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/25">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path
              d="M10.5 10.5L14 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {label && (
          <motion.label
            className={cn(labelBase, error && "text-red-400/60")}
            animate={{
              top: isFloating ? 6 : 14,
              fontSize: isFloating ? "11px" : "14px",
              color: isFloating
                ? error
                  ? "rgba(248,113,113,0.6)"
                  : focused
                    ? "rgba(139,92,246,0.7)"
                    : "rgba(255,255,255,0.35)"
                : "rgba(255,255,255,0.4)",
            }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            {label}
          </motion.label>
        )}
      </div>

      {/* ── Dropdown list ────────────────────────────────────────────────────── */}
      {isOpen && (filtered.length > 0 || (onCreateNew && search)) && (
        <motion.div
          className={cn(
            "absolute z-50 mt-1.5 w-full overflow-hidden rounded-xl",
            "bg-black/90 backdrop-blur-2xl",
            "border border-white/[0.08]",
            "shadow-xl shadow-black/50"
          )}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        >
          <ul
            ref={listRef}
            role="listbox"
            className="scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 max-h-52 overflow-y-auto py-1"
          >
            {filtered.map((opt, idx) => (
              <li
                key={opt.value}
                data-autocomplete-item
                role="option"
                aria-selected={opt.value === value}
                className={cn(
                  "flex cursor-pointer items-center px-4 py-2.5 text-sm transition-colors duration-100",
                  opt.value === value
                    ? "bg-violet-500/10 text-violet-300"
                    : idx === highlightIndex
                      ? "bg-white/[0.06] text-white"
                      : "text-white/70 hover:bg-white/[0.04] hover:text-white"
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectOption(opt)
                }}
                onMouseEnter={() => setHighlightIndex(idx)}
              >
                {opt.value === value && (
                  <svg
                    className="mr-2 h-3.5 w-3.5 shrink-0 text-violet-400"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M3 8.5L6.5 12L13 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <span className={cn(opt.value !== value && "ml-5.5")}>{opt.label}</span>
              </li>
            ))}

            {/* Create new option */}
            {onCreateNew && search && (
              <li
                data-autocomplete-item
                role="option"
                aria-selected={false}
                className={cn(
                  "flex cursor-pointer items-center gap-2 border-t border-white/[0.06] px-4 py-2.5 text-sm transition-colors duration-100",
                  highlightIndex === filtered.length
                    ? "bg-violet-500/10 text-violet-300"
                    : "text-violet-400/70 hover:bg-violet-500/5 hover:text-violet-300"
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  onCreateNew(search)
                  setSearch("")
                  setIsOpen(false)
                }}
                onMouseEnter={() => setHighlightIndex(filtered.length)}
              >
                <svg className="h-3.5 w-3.5 shrink-0" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 3V13M3 8H13"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                <span>
                  Create &ldquo;<span className="font-medium">{search}</span>&rdquo;
                </span>
              </li>
            )}
          </ul>
        </motion.div>
      )}

      {error && (
        <motion.p
          className="mt-1.5 pl-1 text-xs text-red-400/80"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export default {
  GlassInput,
  GlassSelect,
  GlassTextarea,
  GlassCurrencyInput,
  GlassAutocomplete,
}
