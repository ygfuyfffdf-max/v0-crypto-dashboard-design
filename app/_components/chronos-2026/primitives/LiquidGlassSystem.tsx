"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌊 LIQUID GLASS SYSTEM — SUPREME ELITE 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Inspired by: Liquid Glass UI, Neo-Tactile, Hero Board
 * - Glassmorphism with frosted blur + iridescent reflections
 * - Glossy gradient buttons with 3D depth
 * - Glass chips/tags for filters and categories
 * - Hover elevation (Neo-Tactile)
 * - Loading glow animations
 * - Destructive actions unmistakable (danger styling)
 *
 * @version 1.0.0 SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { Check, Pencil, Search, X } from "lucide-react"
import { motion } from "motion/react"
import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LIQUID GLASS BUTTON — Glossy 3D gradient (orange/red, blue, purple)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type LiquidGlassButtonVariant =
  | "primary" // Orange-red glossy (Create workspace)
  | "secondary" // Blue glossy (Search projects)
  | "accent" // Purple-pink gradient (Upgrade plan)
  | "glass" // Frosted transparent (Icon button)
  | "destructive" // Red/orange unmistakable danger

interface LiquidGlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: LiquidGlassButtonVariant
  size?: "sm" | "md" | "lg"
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const BUTTON_VARIANTS = {
  primary: [
    "bg-gradient-to-r from-orange-500 via-red-500 to-rose-500",
    "shadow-[0_4px_14px_-2px_rgba(249,115,22,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]",
    "hover:shadow-[0_6px_20px_-2px_rgba(249,115,22,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]",
    "active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]",
    "text-white font-semibold",
  ],
  secondary: [
    "bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600",
    "shadow-[0_4px_14px_-2px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]",
    "hover:shadow-[0_6px_20px_-2px_rgba(59,130,246,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]",
    "active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]",
    "text-white font-semibold",
  ],
  accent: [
    "bg-gradient-to-r from-violet-500 via-purple-600 to-fuchsia-500",
    "shadow-[0_4px_14px_-2px_rgba(139,92,246,0.4),inset_0_1px_0_rgba(255,255,255,0.25)]",
    "hover:shadow-[0_6px_20px_-2px_rgba(139,92,246,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]",
    "active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]",
    "text-white font-semibold",
  ],
  glass: [
    "bg-white/[0.06] backdrop-blur-xl border border-white/[0.1]",
    "shadow-[0_2px_12px_-4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)]",
    "hover:bg-white/[0.1] hover:border-white/[0.15]",
    "text-white/80",
  ],
  destructive: [
    "bg-gradient-to-r from-red-600 via-rose-600 to-red-700",
    "shadow-[0_4px_14px_-2px_rgba(239,68,68,0.5),inset_0_1px_0_rgba(255,255,255,0.2)]",
    "ring-2 ring-red-500/50 ring-offset-2 ring-offset-black/50",
    "hover:ring-red-400/60 hover:shadow-[0_6px_20px_-2px_rgba(239,68,68,0.6)]",
    "text-white font-semibold",
    "border border-red-500/30",
  ],
} as const

const BUTTON_SIZES = {
  sm: "h-9 px-4 text-sm rounded-xl",
  md: "h-11 px-5 text-sm rounded-xl",
  lg: "h-12 px-6 text-base rounded-2xl",
} as const

export const LiquidGlassButton = forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon,
      iconPosition = "left",
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black/50",
          "disabled:pointer-events-none disabled:opacity-50",
          "neo-tactile-hover-elevate",
          BUTTON_VARIANTS[variant],
          BUTTON_SIZES[size],
          className
        )}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        disabled={disabled || loading}
        {...(props as any)}
      >
        {loading && (
          <motion.div
            className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          />
        )}
        {!loading && icon && iconPosition === "left" && (
          <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        )}
        {children}
        {!loading && icon && iconPosition === "right" && (
          <span className="shrink-0 [&>svg]:h-4 [&>svg]:w-4">{icon}</span>
        )}
      </motion.button>
    )
  }
)
LiquidGlassButton.displayName = "LiquidGlassButton"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LIQUID GLASS CHIP — Pill-shaped tag (glass, retro lights, motion, flare)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LiquidGlassChipProps {
  label: string
  onRemove?: () => void
  onEdit?: () => void
  active?: boolean
  className?: string
}

export function LiquidGlassChip({
  label,
  onRemove,
  onEdit,
  active = false,
  className,
}: LiquidGlassChipProps) {
  return (
    <motion.div
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5",
        "bg-white/[0.06] backdrop-blur-xl border border-white/[0.1]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
        "text-sm text-white/80",
        active && "border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/20",
        className
      )}
      whileHover={{ scale: 1.03, y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span>{label}</span>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="rounded p-0.5 text-white/50 hover:bg-white/10 hover:text-white/80"
          aria-label="Editar"
        >
          <Pencil className="h-3 w-3" />
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="rounded p-0.5 text-white/50 hover:bg-red-500/20 hover:text-red-400"
          aria-label="Eliminar"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LIQUID GLASS SEARCH FIELD — Search icon + checkmark button integrated
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LiquidGlassSearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  onConfirm?: () => void
  showCheckmark?: boolean
}

export const LiquidGlassSearchField = forwardRef<HTMLInputElement, LiquidGlassSearchFieldProps>(
  ({ onConfirm, showCheckmark = false, className, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative flex items-center rounded-xl overflow-hidden",
          "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]",
          "shadow-[0_2px_12px_-4px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.04)]",
          "focus-within:border-violet-500/30 focus-within:shadow-[0_0_24px_-6px_rgba(139,92,246,0.2)]",
          "transition-all duration-200",
          className
        )}
      >
        <Search className="absolute left-4 h-5 w-5 text-white/40 pointer-events-none" />
        <input
          ref={ref}
          className={cn(
            "w-full h-12 pl-12 pr-14 bg-transparent",
            "text-white placeholder:text-white/30",
            "outline-none text-sm"
          )}
          {...props}
        />
        {showCheckmark && onConfirm && (
          <motion.button
            type="button"
            onClick={onConfirm}
            className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/80 text-white hover:bg-blue-500 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Check className="h-4 w-4" />
          </motion.button>
        )}
      </div>
    )
  }
)
LiquidGlassSearchField.displayName = "LiquidGlassSearchField"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LIQUID GLASS SEGMENTED CONTROL — Switch with icons (star, plus, equals)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LiquidGlassSegmentedOption<T> {
  value: T
  icon?: React.ReactNode
  label?: string
}

interface LiquidGlassSegmentedControlProps<T> {
  value: T
  options: LiquidGlassSegmentedOption<T>[]
  onChange: (value: T) => void
  className?: string
}

export function LiquidGlassSegmentedControl<T extends string>({
  value,
  options,
  onChange,
  className,
}: LiquidGlassSegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex rounded-xl p-1",
        "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className
      )}
    >
      {options.map((opt) => {
        const isActive = opt.value === value
        return (
          <motion.button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm",
              isActive ? "text-white" : "text-white/60 hover:text-white/80"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isActive && (
              <motion.div
                layoutId="liquid-glass-segment"
                className="absolute inset-0 rounded-lg bg-violet-500/20 border border-violet-500/30"
                style={{
                  boxShadow: "0 0 20px -4px rgba(139, 92, 246, 0.4)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {opt.icon}
              {opt.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LIQUID GLASS CARD — Floating glass panel with iridescent reflection
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface LiquidGlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
}

export function LiquidGlassCard({ children, className, hover = true }: LiquidGlassCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl overflow-hidden",
        "bg-white/[0.04] backdrop-blur-2xl border border-white/[0.06]",
        "shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.03),inset_0_1px_0_rgba(255,255,255,0.04)]",
        hover && "neo-tactile-hover-elevate",
        className
      )}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {children}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DESTRUCTIVE ACTION BUTTON — Unmistakable danger (Make destructive actions unmistakable)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const DestructiveButton = forwardRef<
  HTMLButtonElement,
  Omit<LiquidGlassButtonProps, "variant">
>((props, ref) => <LiquidGlassButton ref={ref} variant="destructive" {...props} />)
DestructiveButton.displayName = "DestructiveButton"
