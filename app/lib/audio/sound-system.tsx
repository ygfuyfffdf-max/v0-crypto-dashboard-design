'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎵✨ SOUND SYSTEM SUPREME — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de audio premium con:
 * - Sound effects sutiles para UI interactions
 * - Control de volumen global
 * - Mute/unmute por usuario
 * - Persistencia de preferencias
 * - Audio sprites para performance
 * - Feedback háptico opcional
 */

import { useCallback, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type SoundEffect =
  | 'click'
  | 'hover'
  | 'success'
  | 'error'
  | 'warning'
  | 'notification'
  | 'modal-open'
  | 'modal-close'
  | 'tab-switch'
  | 'swipe'
  | 'pop'
  | 'whoosh'
  | 'ping'
  | 'ding'
  | 'coin'

interface SoundConfig {
  volume: number
  enabled: boolean
  haptics: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// FRECUENCIAS PARA SÍNTESIS DE SONIDO
// ═══════════════════════════════════════════════════════════════════════════════════════

const SOUND_FREQUENCIES: Record<
  SoundEffect,
  { freq: number; duration: number; type: OscillatorType }
> = {
  click: { freq: 800, duration: 0.05, type: 'sine' },
  hover: { freq: 600, duration: 0.03, type: 'sine' },
  success: { freq: 880, duration: 0.15, type: 'sine' },
  error: { freq: 300, duration: 0.2, type: 'square' },
  warning: { freq: 500, duration: 0.15, type: 'triangle' },
  notification: { freq: 1000, duration: 0.1, type: 'sine' },
  'modal-open': { freq: 700, duration: 0.12, type: 'sine' },
  'modal-close': { freq: 500, duration: 0.1, type: 'sine' },
  'tab-switch': { freq: 650, duration: 0.05, type: 'sine' },
  swipe: { freq: 400, duration: 0.08, type: 'sine' },
  pop: { freq: 900, duration: 0.06, type: 'sine' },
  whoosh: { freq: 350, duration: 0.2, type: 'sawtooth' },
  ping: { freq: 1200, duration: 0.08, type: 'sine' },
  ding: { freq: 1500, duration: 0.12, type: 'sine' },
  coin: { freq: 1100, duration: 0.15, type: 'triangle' },
}

const STORAGE_KEY = 'chronos-sound-config'

// ═══════════════════════════════════════════════════════════════════════════════════════
// SOUND MANAGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════

class SoundManager {
  private audioContext: AudioContext | null = null
  private config: SoundConfig = { volume: 0.3, enabled: true, haptics: false }
  private lastPlayTime: Record<SoundEffect, number> = {} as Record<SoundEffect, number>
  private throttleMs = 50 // Evitar spam de sonidos

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadConfig()
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return this.audioContext
  }

  private loadConfig() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        this.config = { ...this.config, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.warn('Error loading sound config:', error)
    }
  }

  saveConfig(config: Partial<SoundConfig>) {
    this.config = { ...this.config, ...config }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.config))
    } catch (error) {
      console.warn('Error saving sound config:', error)
    }
  }

  getConfig(): SoundConfig {
    return { ...this.config }
  }

  play(effect: SoundEffect) {
    if (!this.config.enabled) return

    // Throttle para evitar spam
    const now = Date.now()
    const lastPlay = this.lastPlayTime[effect] || 0
    if (now - lastPlay < this.throttleMs) return
    this.lastPlayTime[effect] = now

    try {
      const ctx = this.getAudioContext()
      const config = SOUND_FREQUENCIES[effect]

      // Oscillator
      const oscillator = ctx.createOscillator()
      oscillator.type = config.type
      oscillator.frequency.setValueAtTime(config.freq, ctx.currentTime)

      // Envelope para suavizar el sonido
      const gainNode = ctx.createGain()
      gainNode.gain.setValueAtTime(0, ctx.currentTime)
      gainNode.gain.linearRampToValueAtTime(this.config.volume * 0.3, ctx.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration)

      // Connect
      oscillator.connect(gainNode)
      gainNode.connect(ctx.destination)

      // Play
      oscillator.start(ctx.currentTime)
      oscillator.stop(ctx.currentTime + config.duration)

      // Haptic feedback (si está habilitado)
      if (this.config.haptics && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }
    } catch (error) {
      console.warn('Error playing sound:', error)
    }
  }

  setVolume(volume: number) {
    this.config.volume = Math.max(0, Math.min(1, volume))
    this.saveConfig({ volume: this.config.volume })
  }

  setEnabled(enabled: boolean) {
    this.config.enabled = enabled
    this.saveConfig({ enabled })
  }

  setHaptics(haptics: boolean) {
    this.config.haptics = haptics
    this.saveConfig({ haptics })
  }
}

// Singleton instance
let soundManager: SoundManager | null = null

function getSoundManager(): SoundManager {
  if (!soundManager) {
    soundManager = new SoundManager()
  }
  return soundManager
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════

export function useSoundEffects() {
  const [config, setConfig] = useState<SoundConfig>(() => getSoundManager().getConfig())

  const play = useCallback((effect: SoundEffect) => {
    getSoundManager().play(effect)
  }, [])

  const setVolume = useCallback((volume: number) => {
    getSoundManager().setVolume(volume)
    setConfig(getSoundManager().getConfig())
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    getSoundManager().setEnabled(enabled)
    setConfig(getSoundManager().getConfig())
  }, [])

  const setHaptics = useCallback((haptics: boolean) => {
    getSoundManager().setHaptics(haptics)
    setConfig(getSoundManager().getConfig())
  }, [])

  return {
    play,
    config,
    setVolume,
    setEnabled,
    setHaptics,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SOUND BUTTON WRAPPER
// ═══════════════════════════════════════════════════════════════════════════════════════

interface SoundButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  sound?: SoundEffect
  hoverSound?: SoundEffect
  children: React.ReactNode
}

export function SoundButton({
  sound = 'click',
  hoverSound = 'hover',
  children,
  onClick,
  onMouseEnter,
  ...props
}: SoundButtonProps) {
  const { play, config } = useSoundEffects()

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (config.enabled) play(sound)
      onClick?.(e)
    },
    [onClick, play, sound, config.enabled],
  )

  const handleHover = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (config.enabled && hoverSound) play(hoverSound)
      onMouseEnter?.(e)
    },
    [onMouseEnter, play, hoverSound, config.enabled],
  )

  return (
    <button {...props} onClick={handleClick} onMouseEnter={handleHover}>
      {children}
    </button>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SOUND CONTROL PANEL
// ═══════════════════════════════════════════════════════════════════════════════════════

export function SoundControlPanel() {
  const { config, setVolume, setEnabled, setHaptics } = useSoundEffects()

  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
      <h3 className="text-sm font-semibold text-white">Sonido y Hápticos</h3>

      {/* Enable/Disable */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70">Efectos de sonido</span>
        <button
          onClick={() => setEnabled(!config.enabled)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            config.enabled ? 'bg-emerald-500' : 'bg-white/20'
          }`}
        >
          <motion.div
            className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-md"
            animate={{ x: config.enabled ? 20 : 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      </div>

      {/* Volume Slider */}
      {config.enabled && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <label className="mb-2 block text-sm text-white/70">
            Volumen: {Math.round(config.volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={config.volume * 100}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-full accent-violet-500"
          />
        </motion.div>
      )}

      {/* Haptics */}
      {'vibrate' in navigator && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/70">Feedback háptico</span>
          <button
            onClick={() => setHaptics(!config.haptics)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              config.haptics ? 'bg-violet-500' : 'bg-white/20'
            }`}
          >
            <motion.div
              className="absolute top-1 left-1 h-4 w-4 rounded-full bg-white shadow-md"
              animate={{ x: config.haptics ? 20 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

// Alias para mantener compatibilidad
export const useSoundManager = useSoundEffects

export { getSoundManager }
export type { SoundConfig, SoundEffect }
