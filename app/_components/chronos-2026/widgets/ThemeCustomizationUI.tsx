'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎨✨ THEME CUSTOMIZATION UI — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Panel de personalización premium con:
 * - Color picker para tema principal
 * - Selector de modo (light/dark/system)
 * - Control de tamaño de fuente
 * - Border radius customizable
 * - Toggle de animaciones
 * - Control de sonido
 * - Preview en tiempo real
 */

import { AuroraGlassCard } from '@/app/_components/ui/AuroraGlassSystem'
import { SoundControlPanel } from '@/app/lib/audio/sound-system'
import { Disc, Monitor, Moon, Palette, Sparkles, Sun, Type } from 'lucide-react'
import { motion } from 'motion/react'
import { useTheme, type ThemeColor, type ThemeMode } from '@/app/_components/providers/ThemeProvider'

const COLOR_OPTIONS: { value: ThemeColor; label: string; color: string }[] = [
  { value: 'violet', label: 'Violet', color: '#8B5CF6' },
  { value: 'cyan', label: 'Cyan', color: '#06B6D4' },
  { value: 'emerald', label: 'Emerald', color: '#10B981' },
  { value: 'rose', label: 'Rose', color: '#F43F5E' },
  { value: 'amber', label: 'Amber', color: '#F59E0B' },
  { value: 'blue', label: 'Blue', color: '#3B82F6' },
  { value: 'purple', label: 'Purple', color: '#A855F7' },
  { value: 'green', label: 'Green', color: '#22C55E' },
]

const MODE_OPTIONS: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: 'light', label: 'Light', icon: <Sun size={16} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={16} /> },
  { value: 'system', label: 'System', icon: <Monitor size={16} /> },
]

export function ThemeCustomizationUI() {
  const {
    theme,
    setThemeMode,
    setThemeColor,
    setFontSize,
    setBorderRadius,
    toggleAnimations,
    resetTheme,
  } = useTheme()

  return (
    <div className="space-y-6">
      {/* Color Palette */}
      <AuroraGlassCard className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Palette size={20} className="text-violet-400" />
          <h3 className="text-lg font-semibold text-white">Color Principal</h3>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {COLOR_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => setThemeColor(option.value)}
              className="group relative overflow-hidden rounded-xl p-4 transition-all"
              style={{
                background: theme.color === option.value ? `${option.color}20` : 'rgba(255,255,255,0.05)',
                border: `2px solid ${theme.color === option.value ? option.color : 'rgba(255,255,255,0.1)'}`,
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Animated glow */}
              {theme.color === option.value && (
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  animate={{
                    boxShadow: [
                      `0 0 20px ${option.color}40`,
                      `0 0 30px ${option.color}60`,
                      `0 0 20px ${option.color}40`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}

              {/* Color circle */}
              <div
                className="mx-auto h-8 w-8 rounded-full shadow-lg"
                style={{
                  background: option.color,
                  boxShadow: `0 4px 12px ${option.color}40`,
                }}
              />
              <p className="mt-2 text-xs font-medium text-white">{option.label}</p>
            </motion.button>
          ))}
        </div>
      </AuroraGlassCard>

      {/* Mode Selection */}
      <AuroraGlassCard className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Moon size={20} className="text-cyan-400" />
          <h3 className="text-lg font-semibold text-white">Modo de Apariencia</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {MODE_OPTIONS.map((option) => (
            <motion.button
              key={option.value}
              onClick={() => setThemeMode(option.value)}
              className="flex flex-col items-center gap-2 rounded-xl border p-4 transition-all"
              style={{
                background: theme.mode === option.value ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
                borderColor: theme.mode === option.value ? '#06B6D4' : 'rgba(255,255,255,0.1)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              {option.icon}
              <span className="text-xs font-medium text-white">{option.label}</span>
            </motion.button>
          ))}
        </div>
      </AuroraGlassCard>

      {/* Font Size */}
      <AuroraGlassCard className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Type size={20} className="text-emerald-400" />
          <h3 className="text-lg font-semibold text-white">Tamaño de Fuente</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <motion.button
              key={size}
              onClick={() => setFontSize(size)}
              className="rounded-xl border p-3 transition-all"
              style={{
                background: theme.fontSize === size ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)',
                borderColor: theme.fontSize === size ? '#10B981' : 'rgba(255,255,255,0.1)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <span
                className="font-medium text-white"
                style={{
                  fontSize: size === 'sm' ? '12px' : size === 'lg' ? '18px' : '14px',
                }}
              >
                {size === 'sm' ? 'A' : size === 'lg' ? 'A' : 'A'}
              </span>
              <p className="mt-1 text-xs text-white/50">{size.toUpperCase()}</p>
            </motion.button>
          ))}
        </div>
      </AuroraGlassCard>

      {/* Border Radius */}
      <AuroraGlassCard className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Disc size={20} className="text-pink-400" />
          <h3 className="text-lg font-semibold text-white">Estilo de Bordes</h3>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {(['none', 'sm', 'md', 'lg', 'full'] as const).map((radius) => (
            <motion.button
              key={radius}
              onClick={() => setBorderRadius(radius)}
              className="flex flex-col items-center gap-2 border p-3 transition-all"
              style={{
                background: theme.borderRadius === radius ? 'rgba(236, 72, 153, 0.2)' : 'rgba(255,255,255,0.05)',
                borderColor: theme.borderRadius === radius ? '#EC4899' : 'rgba(255,255,255,0.1)',
                borderRadius: radius === 'none' ? '0' : radius === 'sm' ? '4px' : radius === 'md' ? '8px' : radius === 'lg' ? '12px' : '9999px',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className="h-6 w-6 bg-pink-400"
                style={{
                  borderRadius: radius === 'none' ? '0' : radius === 'sm' ? '4px' : radius === 'md' ? '8px' : radius === 'lg' ? '12px' : '9999px',
                }}
              />
              <span className="text-[10px] uppercase text-white/50">{radius}</span>
            </motion.button>
          ))}
        </div>
      </AuroraGlassCard>

      {/* Animations Toggle */}
      <AuroraGlassCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-amber-400" />
            <div>
              <h3 className="font-semibold text-white">Animaciones</h3>
              <p className="text-xs text-white/50">Efectos y transiciones</p>
            </div>
          </div>

          <button
            onClick={toggleAnimations}
            className={`relative h-8 w-14 rounded-full transition-colors ${
              theme.animations ? 'bg-amber-500' : 'bg-white/20'
            }`}
          >
            <motion.div
              className="absolute top-1 left-1 h-6 w-6 rounded-full bg-white shadow-md"
              animate={{ x: theme.animations ? 28 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      </AuroraGlassCard>

      {/* Sound Control */}
      <SoundControlPanel />

      {/* Reset Button */}
      <motion.button
        onClick={resetTheme}
        className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Restablecer Tema por Defecto
      </motion.button>
    </div>
  )
}
