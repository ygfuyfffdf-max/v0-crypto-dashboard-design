'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔊 SOUND SETTINGS WIDGET — Control de audio y feedback háptico
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Panel de configuración de audio con:
 * ▸ Control de volumen maestro
 * ▸ Toggle de efectos de sonido
 * ▸ Toggle de feedback háptico
 * ▸ Preview de sonidos
 * 
 * @version 1.0.0 — OMEGA SUPREME EDITION
 */

import { motion } from 'framer-motion'
import { cn } from '@/app/_lib/utils'
import { useSound, useHaptic, useFeedback } from '@/app/hooks/useSupremeSystems'
import { useAppStore } from '@/app/lib/store/useAppStore'
import { Volume2, VolumeX, Vibrate, Play, Bell, MousePointer, Sparkles } from 'lucide-react'
import type { SoundEffect } from '@/app/_lib/systems/SupremeSystemsHub'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔊 VOLUME SLIDER — Control deslizante de volumen
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VolumeSliderProps {
  value: number
  onChange: (value: number) => void
  className?: string
}

function VolumeSlider({ value, onChange, className }: VolumeSliderProps) {
  const percentage = Math.round(value * 100)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">Volumen</span>
        <span className="text-white font-medium">{percentage}%</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min="0"
          max="100"
          value={percentage}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
          className="w-full h-2 rounded-full bg-white/10 appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-violet-500
                     [&::-webkit-slider-thumb]:shadow-lg
                     [&::-webkit-slider-thumb]:shadow-violet-500/50
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-transform
                     [&::-webkit-slider-thumb]:hover:scale-110"
        />
        <div 
          className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 pointer-events-none"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔘 TOGGLE SWITCH — Switch animado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ToggleSwitchProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  color?: 'violet' | 'emerald' | 'cyan'
}

function ToggleSwitch({ enabled, onChange, color = 'violet' }: ToggleSwitchProps) {
  const colors = {
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    cyan: 'bg-cyan-500',
  }

  return (
    <button
      onClick={() => onChange(!enabled)}
      className={cn(
        'relative w-11 h-6 rounded-full transition-colors duration-200',
        enabled ? colors[color] : 'bg-white/20'
      )}
    >
      <motion.div
        className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-md"
        animate={{ x: enabled ? 20 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎵 SOUND PREVIEW — Botones de preview de sonidos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SoundPreviewProps {
  className?: string
}

function SoundPreview({ className }: SoundPreviewProps) {
  const { play, isEnabled } = useSound()
  const feedback = useFeedback()

  const sounds: { id: SoundEffect; label: string; icon: React.ReactNode }[] = [
    { id: 'click', label: 'Click', icon: <MousePointer className="w-3 h-3" /> },
    { id: 'success', label: 'Éxito', icon: <Sparkles className="w-3 h-3" /> },
    { id: 'notification', label: 'Notificación', icon: <Bell className="w-3 h-3" /> },
  ]

  if (!isEnabled) return null

  return (
    <div className={cn('space-y-2', className)}>
      <span className="text-sm text-gray-400">Probar sonidos</span>
      <div className="flex flex-wrap gap-2">
        {sounds.map((sound) => (
          <motion.button
            key={sound.id}
            onClick={() => play(sound.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs transition-colors"
          >
            {sound.icon}
            {sound.label}
            <Play className="w-2.5 h-2.5" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔊 SOUND SETTINGS — Panel principal de configuración
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SoundSettingsProps {
  className?: string
}

export function SoundSettings({ className }: SoundSettingsProps) {
  const { isEnabled, volume } = useSound()
  const { isEnabled: hapticEnabled } = useHaptic()
  
  const soundEnabled = useAppStore(state => state.soundEnabled)
  const soundVolume = useAppStore(state => state.soundVolume)
  const setSoundEnabled = useAppStore(state => state.setSoundEnabled)
  const setSoundVolume = useAppStore(state => state.setSoundVolume)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-violet-500/20 text-violet-400">
          <Volume2 className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Audio y Feedback</h3>
          <p className="text-sm text-gray-400">Configura sonidos y vibraciones</p>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/10">
        {/* Sound effects toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-violet-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-500" />
            )}
            <div>
              <span className="text-white font-medium">Efectos de sonido</span>
              <p className="text-xs text-gray-400">Sonidos de interacción con la UI</p>
            </div>
          </div>
          <ToggleSwitch
            enabled={soundEnabled}
            onChange={setSoundEnabled}
            color="violet"
          />
        </div>

        {/* Volume slider */}
        {soundEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 border-t border-white/10"
          >
            <VolumeSlider
              value={soundVolume}
              onChange={setSoundVolume}
            />
          </motion.div>
        )}

        {/* Sound preview */}
        {soundEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-2 border-t border-white/10"
          >
            <SoundPreview />
          </motion.div>
        )}

        {/* Haptic feedback toggle */}
        {'vibrate' in navigator && (
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center gap-3">
              <Vibrate className="w-5 h-5 text-cyan-400" />
              <div>
                <span className="text-white font-medium">Feedback háptico</span>
                <p className="text-xs text-gray-400">Vibraciones táctiles (móvil)</p>
              </div>
            </div>
            <ToggleSwitch
              enabled={hapticEnabled}
              onChange={() => {/* TODO: Add haptic toggle to store */}}
              color="cyan"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { VolumeSlider, ToggleSwitch, SoundPreview }
export type { SoundSettingsProps }
