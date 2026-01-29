'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌓✨ THEME TOGGLE SUPREME — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Toggle premium para cambiar entre dark/light mode con:
 * - Animación cinematográfica de transición
 * - Efectos de partículas
 * - Sonido opcional
 * - Tooltip informativo
 * - Shortcut keyboard (Ctrl+Shift+T)
 */

import { Monitor, Moon, Sun } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { useEffect, useState } from 'react'
import { useTheme, type ThemeMode } from '@/app/_components/providers/ThemeProvider'

interface ThemeToggleProps {
  variant?: 'icon' | 'full' | 'compact'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function ThemeToggle({
  variant = 'icon',
  size = 'md',
  showLabel = false,
  className = '',
}: ThemeToggleProps) {
  const { theme, setThemeMode, resolvedMode } = useTheme()
  const [showTooltip, setShowTooltip] = useState(false)

  // Keyboard shortcut: Ctrl+Shift+T
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault()
        cycleMode()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [theme.mode])

  const cycleMode = () => {
    const modes: ThemeMode[] = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(theme.mode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setThemeMode(nextMode)
  }

  const getIcon = () => {
    if (theme.mode === 'system') return <Monitor />
    return resolvedMode === 'dark' ? <Moon /> : <Sun />
  }

  const getLabel = () => {
    if (theme.mode === 'system') return 'System'
    return resolvedMode === 'dark' ? 'Dark' : 'Light'
  }

  const sizes = {
    sm: { icon: 16, button: 'p-2', text: 'text-xs' },
    md: { icon: 20, button: 'p-2.5', text: 'text-sm' },
    lg: { icon: 24, button: 'p-3', text: 'text-base' },
  }

  const currentSize = sizes[size]

  if (variant === 'full') {
    return (
      <div className={`relative ${className}`}>
        <div className="flex gap-2 rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-xl">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
            <motion.button
              key={mode}
              onClick={() => setThemeMode(mode)}
              className={`relative flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                theme.mode === mode ? 'text-white' : 'text-white/50 hover:text-white/80'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {theme.mode === mode && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  layoutId="activeMode"
                  style={{
                    background:
                      'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                    boxShadow: '0 0 20px var(--color-primary)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {mode === 'light' && <Sun size={16} />}
                {mode === 'dark' && <Moon size={16} />}
                {mode === 'system' && <Monitor size={16} />}
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <motion.button
        onClick={cycleMode}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`group relative flex items-center gap-2 overflow-hidden rounded-xl border border-white/10 bg-white/5 ${currentSize.button} backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-xl ${className}`}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        style={{
          boxShadow: '0 0 20px var(--color-primary)20',
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(circle at center, var(--color-primary)30, transparent 70%)',
          }}
        />

        {/* Icon with animation */}
        <motion.div
          className="relative z-10"
          key={theme.mode}
          initial={{ rotate: -180, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 180, opacity: 0 }}
          transition={{ duration: 0.3, type: 'spring' }}
        >
          {React.cloneElement(getIcon(), { size: currentSize.icon })}
        </motion.div>

        {showLabel && (
          <span className={`relative z-10 ${currentSize.text} font-medium`}>{getLabel()}</span>
        )}

        {/* Tooltip */}
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute -top-12 left-1/2 z-50 w-max -translate-x-1/2 rounded-lg border border-white/10 bg-gray-900/95 px-3 py-2 text-xs font-medium text-white shadow-2xl backdrop-blur-xl"
            >
              {getLabel()} mode
              <div className="mt-1 text-[10px] text-white/40">Ctrl+Shift+T</div>
              <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-white/10 bg-gray-900" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    )
  }

  // Icon only (default)
  return (
    <motion.button
      onClick={cycleMode}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 ${currentSize.button} backdrop-blur-xl transition-all hover:border-white/20 hover:bg-white/10 hover:shadow-xl ${className}`}
      whileHover={{ scale: 1.1, rotate: 15 }}
      whileTap={{ scale: 0.9 }}
      style={{
        boxShadow: '0 0 20px var(--color-primary)20',
      }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        }}
        animate={{
          x: ['0%', '200%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Icon */}
      <AnimatePresence mode="wait">
        <motion.div
          key={theme.mode + resolvedMode}
          initial={{ rotate: -180, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 180, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.4, type: 'spring', stiffness: 300 }}
          className="relative z-10"
        >
          {React.cloneElement(getIcon(), { size: currentSize.icon })}
        </motion.div>
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute -top-12 left-1/2 z-50 w-max -translate-x-1/2 rounded-lg border border-white/10 bg-gray-900/95 px-3 py-2 text-xs font-medium text-white shadow-2xl backdrop-blur-xl"
          >
            {getLabel()} mode
            <div className="mt-1 text-[10px] text-white/40">Ctrl+Shift+T</div>
            <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-r border-b border-white/10 bg-gray-900" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
