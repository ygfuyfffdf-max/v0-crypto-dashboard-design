"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌓✨ THEME PROVIDER SUPREME — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de temas premium con:
 * - Dark/Light mode con transición cinematográfica
 * - 8 paletas de colores predefinidas
 * - Customización completa por usuario
 * - Persistencia en localStorage
 * - Sincronización entre tabs
 * - Detección automática de preferencia del sistema
 * - Animaciones suaves de transición
 */

import { AnimatePresence, motion } from "motion/react"
import React, { createContext, useCallback, useContext, useEffect, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type ThemeMode = "light" | "dark" | "system"
export type ThemeColor =
  | "violet"
  | "cyan"
  | "emerald"
  | "rose"
  | "amber"
  | "blue"
  | "purple"
  | "green"

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  border: string
  text: string
  textSecondary: string
  success: string
  warning: string
  error: string
  info: string
}

export interface Theme {
  mode: ThemeMode
  color: ThemeColor
  customColors?: Partial<ThemeColors>
  fontSize: "sm" | "md" | "lg"
  borderRadius: "none" | "sm" | "md" | "lg" | "full"
  animations: boolean
  sounds: boolean
}

interface ThemeContextType {
  theme: Theme
  setThemeMode: (mode: ThemeMode) => void
  setThemeColor: (color: ThemeColor) => void
  setFontSize: (size: "sm" | "md" | "lg") => void
  setBorderRadius: (radius: "none" | "sm" | "md" | "lg" | "full") => void
  toggleAnimations: () => void
  toggleSounds: () => void
  setCustomColors: (colors: Partial<ThemeColors>) => void
  resetTheme: () => void
  resolvedMode: "light" | "dark"
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// COLOR PALETTES
// ═══════════════════════════════════════════════════════════════════════════════════════

const COLOR_PALETTES: Record<ThemeColor, { light: ThemeColors; dark: ThemeColors }> = {
  violet: {
    dark: {
      primary: "#8B5CF6",
      secondary: "#A78BFA",
      accent: "#C4B5FD",
      background: "#0A0A0F",
      surface: "#151520",
      border: "rgba(139, 92, 246, 0.2)",
      text: "#FFFFFF",
      textSecondary: "#A1A1AA",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#06B6D4",
    },
    light: {
      primary: "#7C3AED",
      secondary: "#8B5CF6",
      accent: "#A78BFA",
      background: "#FFFFFF",
      surface: "#F9FAFB",
      border: "rgba(124, 58, 237, 0.2)",
      text: "#18181B",
      textSecondary: "#71717A",
      success: "#059669",
      warning: "#D97706",
      error: "#DC2626",
      info: "#0891B2",
    },
  },
  cyan: {
    dark: {
      primary: "#06B6D4",
      secondary: "#22D3EE",
      accent: "#67E8F9",
      background: "#0A0F1A",
      surface: "#15202B",
      border: "rgba(6, 182, 212, 0.2)",
      text: "#FFFFFF",
      textSecondary: "#A1A1AA",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#3B82F6",
    },
    light: {
      primary: "#0891B2",
      secondary: "#06B6D4",
      accent: "#22D3EE",
      background: "#FFFFFF",
      surface: "#F0F9FF",
      border: "rgba(8, 145, 178, 0.2)",
      text: "#18181B",
      textSecondary: "#71717A",
      success: "#059669",
      warning: "#D97706",
      error: "#DC2626",
      info: "#2563EB",
    },
  },
  emerald: {
    dark: {
      primary: "#10B981",
      secondary: "#34D399",
      accent: "#6EE7B7",
      background: "#0A1410",
      surface: "#152820",
      border: "rgba(16, 185, 129, 0.2)",
      text: "#FFFFFF",
      textSecondary: "#A1A1AA",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#06B6D4",
    },
    light: {
      primary: "#059669",
      secondary: "#10B981",
      accent: "#34D399",
      background: "#FFFFFF",
      surface: "#F0FDF4",
      border: "rgba(5, 150, 105, 0.2)",
      text: "#18181B",
      textSecondary: "#71717A",
      success: "#047857",
      warning: "#D97706",
      error: "#DC2626",
      info: "#0891B2",
    },
  },
  rose: {
    dark: {
      primary: "#F43F5E",
      secondary: "#FB7185",
      accent: "#FDA4AF",
      background: "#1A0A0F",
      surface: "#2B1520",
      border: "rgba(244, 63, 94, 0.2)",
      text: "#FFFFFF",
      textSecondary: "#A1A1AA",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#06B6D4",
    },
    light: {
      primary: "#E11D48",
      secondary: "#F43F5E",
      accent: "#FB7185",
      background: "#FFFFFF",
      surface: "#FFF1F2",
      border: "rgba(225, 29, 72, 0.2)",
      text: "#18181B",
      textSecondary: "#71717A",
      success: "#059669",
      warning: "#D97706",
      error: "#BE123C",
      info: "#0891B2",
    },
  },
  amber: {
    dark: {
      primary: "#F59E0B",
      secondary: "#FBBF24",
      accent: "#FCD34D",
      background: "#1A1410",
      surface: "#2B2520",
      border: "rgba(245, 158, 11, 0.2)",
      text: "#FFFFFF",
      textSecondary: "#A1A1AA",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#06B6D4",
    },
    light: {
      primary: "#D97706",
      secondary: "#F59E0B",
      accent: "#FBBF24",
      background: "#FFFFFF",
      surface: "#FFFBEB",
      border: "rgba(217, 119, 6, 0.2)",
      text: "#18181B",
      textSecondary: "#71717A",
      success: "#059669",
      warning: "#B45309",
      error: "#DC2626",
      info: "#0891B2",
    },
  },
  blue: {
    dark: {
      primary: "#3B82F6",
      secondary: "#60A5FA",
      accent: "#93C5FD",
      background: "#0A0F1A",
      surface: "#152030",
      border: "rgba(59, 130, 246, 0.2)",
      text: "#FFFFFF",
      textSecondary: "#A1A1AA",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#06B6D4",
    },
    light: {
      primary: "#2563EB",
      secondary: "#3B82F6",
      accent: "#60A5FA",
      background: "#FFFFFF",
      surface: "#EFF6FF",
      border: "rgba(37, 99, 235, 0.2)",
      text: "#18181B",
      textSecondary: "#71717A",
      success: "#059669",
      warning: "#D97706",
      error: "#DC2626",
      info: "#0891B2",
    },
  },
  purple: {
    dark: {
      primary: "#A855F7",
      secondary: "#C084FC",
      accent: "#D8B4FE",
      background: "#0F0A1A",
      surface: "#201530",
      border: "rgba(168, 85, 247, 0.2)",
      text: "#FFFFFF",
      textSecondary: "#A1A1AA",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#06B6D4",
    },
    light: {
      primary: "#9333EA",
      secondary: "#A855F7",
      accent: "#C084FC",
      background: "#FFFFFF",
      surface: "#FAF5FF",
      border: "rgba(147, 51, 234, 0.2)",
      text: "#18181B",
      textSecondary: "#71717A",
      success: "#059669",
      warning: "#D97706",
      error: "#DC2626",
      info: "#0891B2",
    },
  },
  green: {
    dark: {
      primary: "#22C55E",
      secondary: "#4ADE80",
      accent: "#86EFAC",
      background: "#0A140F",
      surface: "#152820",
      border: "rgba(34, 197, 94, 0.2)",
      text: "#FFFFFF",
      textSecondary: "#A1A1AA",
      success: "#10B981",
      warning: "#F59E0B",
      error: "#EF4444",
      info: "#06B6D4",
    },
    light: {
      primary: "#16A34A",
      secondary: "#22C55E",
      accent: "#4ADE80",
      background: "#FFFFFF",
      surface: "#F0FDF4",
      border: "rgba(22, 163, 74, 0.2)",
      text: "#18181B",
      textSecondary: "#71717A",
      success: "#15803D",
      warning: "#D97706",
      error: "#DC2626",
      info: "#0891B2",
    },
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DEFAULT THEME
// ═══════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_THEME: Theme = {
  mode: "dark",
  color: "violet",
  fontSize: "md",
  borderRadius: "lg",
  animations: true,
  sounds: false,
}

const STORAGE_KEY = "chronos-theme-v2"

// ═══════════════════════════════════════════════════════════════════════════════════════
// CONTEXT
// ═══════════════════════════════════════════════════════════════════════════════════════

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// ═══════════════════════════════════════════════════════════════════════════════════════
// PROVIDER
// ═══════════════════════════════════════════════════════════════════════════════════════

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME)
  const [resolvedMode, setResolvedMode] = useState<"light" | "dark">("dark")
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Resolver el mode (system -> light/dark real)
  const resolveSystemMode = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  }, [])

  // Load theme from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Theme
        setTheme(parsed)
      }
    } catch (error) {
      console.error("Error loading theme:", error)
    }
  }, [])

  // Save theme to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
    } catch (error) {
      console.error("Error saving theme:", error)
    }
  }, [theme])

  // Update resolved mode
  useEffect(() => {
    const newResolvedMode = theme.mode === "system" ? resolveSystemMode() : theme.mode
    if (newResolvedMode !== resolvedMode) {
      setIsTransitioning(true)
      setResolvedMode(newResolvedMode)
      setTimeout(() => setIsTransitioning(false), 500)
    }
  }, [theme.mode, resolveSystemMode, resolvedMode])

  // Listen to system theme changes
  useEffect(() => {
    if (theme.mode !== "system") return

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      setIsTransitioning(true)
      setResolvedMode(mediaQuery.matches ? "dark" : "light")
      setTimeout(() => setIsTransitioning(false), 500)
    }

    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [theme.mode])

  // Apply CSS variables and data-theme attribute
  useEffect(() => {
    const root = document.documentElement
    const colors = COLOR_PALETTES[theme.color][resolvedMode]
    const customColors = theme.customColors || {}

    // Apply colors
    Object.entries({ ...colors, ...customColors }).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value)
    })

    // Apply other theme properties
    root.style.setProperty(
      "--font-size",
      theme.fontSize === "sm" ? "14px" : theme.fontSize === "lg" ? "18px" : "16px"
    )
    root.style.setProperty(
      "--border-radius",
      theme.borderRadius === "none"
        ? "0"
        : theme.borderRadius === "sm"
          ? "0.25rem"
          : theme.borderRadius === "md"
            ? "0.5rem"
            : theme.borderRadius === "lg"
              ? "0.75rem"
              : "9999px"
    )

    // Apply mode class and data-theme attribute
    root.classList.remove("light", "dark")
    root.classList.add(resolvedMode)
    root.setAttribute("data-theme", resolvedMode)

    // Set meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute("content", colors.background)
    }
  }, [theme, resolvedMode])

  // Handlers
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setTheme((prev) => ({ ...prev, mode }))
  }, [])

  const setThemeColor = useCallback((color: ThemeColor) => {
    setTheme((prev) => ({ ...prev, color }))
  }, [])

  const setFontSize = useCallback((fontSize: "sm" | "md" | "lg") => {
    setTheme((prev) => ({ ...prev, fontSize }))
  }, [])

  const setBorderRadius = useCallback((borderRadius: "none" | "sm" | "md" | "lg" | "full") => {
    setTheme((prev) => ({ ...prev, borderRadius }))
  }, [])

  const toggleAnimations = useCallback(() => {
    setTheme((prev) => ({ ...prev, animations: !prev.animations }))
  }, [])

  const toggleSounds = useCallback(() => {
    setTheme((prev) => ({ ...prev, sounds: !prev.sounds }))
  }, [])

  const setCustomColors = useCallback((customColors: Partial<ThemeColors>) => {
    setTheme((prev) => ({ ...prev, customColors: { ...prev.customColors, ...customColors } }))
  }, [])

  const resetTheme = useCallback(() => {
    setTheme(DEFAULT_THEME)
  }, [])

  const value: ThemeContextType = {
    theme,
    setThemeMode,
    setThemeColor,
    setFontSize,
    setBorderRadius,
    toggleAnimations,
    toggleSounds,
    setCustomColors,
    resetTheme,
    resolvedMode,
  }

  return (
    <ThemeContext.Provider value={value}>
      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[99999]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              background: `linear-gradient(135deg, ${COLOR_PALETTES[theme.color][resolvedMode].primary}15, transparent)`,
            }}
          />
        )}
      </AnimatePresence>
      {children}
    </ThemeContext.Provider>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════════════

export function getThemeColors(color: ThemeColor, mode: "light" | "dark"): ThemeColors {
  return COLOR_PALETTES[color][mode]
}

export { COLOR_PALETTES, DEFAULT_THEME, STORAGE_KEY }
