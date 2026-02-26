"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CHRONOS 2026 — APP SHELL (FULL-WIDTH)
 * ═══════════════════════════════════════════════════════════════════════════
 * Full-width dashboard shell — header-only navigation (sidebar removed).
 * ChronosHeader2026 provides complete dropdown navigation for all modules.
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { AnimatePresence, motion } from "motion/react"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"

import { GlobalAIOrb } from "../ai/GlobalAIOrb"
import { QuantumCursor } from "../interactive/QuantumCursor"
import { ChronosHeader2026Client } from "./ChronosHeader2026Client"

// ═══════════════════════════════════════════════════════════════════════════
// APP SHELL
// ═══════════════════════════════════════════════════════════════════════════

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="bg-c-void flex min-h-screen items-center justify-center">
        <motion.div
          className="h-8 w-8 rounded-full border-2 border-violet-500/30 border-t-violet-500"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    )
  }

  return (
    <div className="bg-c-void relative flex min-h-screen flex-col">
      {/* ─── Header — full dropdown navigation replaces sidebar ─────────── */}
      <ChronosHeader2026Client />

      {/* ─── Full-width content area ─────────────────────────────────────── */}
      <main className="relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-y-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            className="relative min-h-full w-full"
            initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(2px)" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── Global AI Orb — persistent on all panels ────────────────────── */}
      <GlobalAIOrb />

      {/* ─── Quantum Cursor — spring physics + magnetic (desktop only) ───── */}
      <QuantumCursor />
    </div>
  )
}

export default AppShell
