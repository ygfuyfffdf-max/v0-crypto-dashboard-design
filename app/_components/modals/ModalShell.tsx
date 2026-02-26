"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY — MODAL SHELL
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Universal modal wrapper with liquid glass design.
 * Features:
 * - Liquid glass card aesthetic (bg-black/80 + backdrop-blur-2xl)
 * - Inner violet glow radial gradient
 * - Spring-based enter/exit animations
 * - Escape key & backdrop click to close
 * - Configurable sizes from sm to full
 *
 * @version 1.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from "@/app/_lib/utils"
import { X } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"
import React, { useCallback, useEffect } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

type ModalSize = "sm" | "md" | "lg" | "xl" | "full"

interface ModalShellProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: ModalSize
  children: React.ReactNode
  className?: string
  showCloseButton?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SIZE MAP
// ═══════════════════════════════════════════════════════════════════════════════════════

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-6xl",
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════════════════════════════════════════════════

const backdropVariants: Record<string, any> = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const modalVariants: Record<string, any> = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 350,
      damping: 30,
      mass: 0.8,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// MODAL SHELL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════

export function ModalShell({
  isOpen,
  onClose,
  title,
  description,
  size = "md",
  children,
  className,
  showCloseButton = true,
}: ModalShellProps) {
  // ── Escape key handler ──────────────────────────────────────────────────────────
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener("keydown", handleEscape)
    // Prevent body scroll while modal is open
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleEscape)
      document.body.style.overflow = prev
    }
  }, [isOpen, handleEscape])

  // ── Backdrop click handler ──────────────────────────────────────────────────────
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={handleBackdropClick}
        >
          {/* ── Backdrop overlay ─────────────────────────────────────────────── */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* ── Modal card — Liquid Glass floating aesthetic ───────────────────── */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "relative z-10 w-full overflow-hidden rounded-2xl",
              "bg-[#0a0a0f]/95 backdrop-blur-2xl",
              "border border-white/[0.08]",
              "shadow-[0_24px_80px_-24px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04),inset_0_1px_0_rgba(255,255,255,0.04)]",
              SIZE_CLASSES[size],
              className
            )}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* ── Iridescent inner glow (Liquid Glass) ────────────────────────── */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-48"
              style={{
                background:
                  "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.06) 40%, transparent 70%)",
              }}
            />

            {/* ── Header ─────────────────────────────────────────────────────── */}
            {(title || showCloseButton) && (
              <div className="relative flex items-start justify-between gap-4 border-b border-white/[0.06] px-6 pt-6 pb-4">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h2 className="truncate text-lg font-semibold tracking-tight text-white">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="mt-1 text-sm leading-relaxed text-white/50">{description}</p>
                  )}
                </div>

                {showCloseButton && (
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      "bg-white/[0.04] text-white/40",
                      "transition-colors duration-150",
                      "hover:bg-white/[0.08] hover:text-white/70",
                      "focus-visible:ring-1 focus-visible:ring-violet-500/50 focus-visible:outline-none"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            )}

            {/* ── Content ────────────────────────────────────────────────────── */}
            <div className="relative px-6 py-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ModalShell
