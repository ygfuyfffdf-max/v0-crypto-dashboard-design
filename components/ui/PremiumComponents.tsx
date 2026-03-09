"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

// Re-export AnimatedCounter from its existing file
export { AnimatedCounter } from "./AnimatedCounter"

// AnimatedBadge component
interface AnimatedBadgeProps {
  children: React.ReactNode
  variant?: "default" | "success" | "error" | "warning" | "info"
  pulse?: boolean
  className?: string
}

const variantStyles: Record<string, string> = {
  default: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30",
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  error: "bg-red-500/10 text-red-400 border-red-500/30",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
}

export function AnimatedBadge({
  children,
  variant = "default",
  pulse = false,
  className,
}: AnimatedBadgeProps) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles[variant],
        pulse && "animate-pulse",
        className
      )}
    >
      {children}
    </motion.span>
  )
}
