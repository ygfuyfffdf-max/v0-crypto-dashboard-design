/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔊 SOUND SYSTEM — CHRONOS INFINITY 2026
 * Sistema de efectos de sonido premium con preload y control de volumen
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from '../utils/logger'

export type SoundEffect =
  | 'click'
  | 'success'
  | 'error'
  | 'notification'
  | 'swipe'
  | 'whoosh'
  | 'pop'
  | 'ding'
  | 'chime'
  | 'toggle'
  | 'modal-open'
  | 'modal-close'
  | 'hover'
  | 'ripple'

interface SoundConfig {
  url: string
  volume?: number
  playbackRate?: number
}

export class SoundSystem {
  private sounds: Map<SoundEffect, HTMLAudioElement> = new Map()
  private enabled: boolean = true
  private globalVolume: number = 0.3
  private initialized: boolean = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  private initialize() {
    // Mapeo de sonidos con URLs de CDN gratuitas
    const soundConfigs: Record<SoundEffect, SoundConfig> = {
      click: {
        url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
        volume: 0.2,
      },
      success: {
        url: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
        volume: 0.4,
      },
      error: {
        url: 'https://assets.mixkit.co/active_storage/sfx/2001/2001-preview.mp3',
        volume: 0.35,
      },
      notification: {
        url: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
        volume: 0.3,
      },
      swipe: {
        url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
        volume: 0.15,
      },
      whoosh: {
        url: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',
        volume: 0.25,
      },
      pop: {
        url: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
        volume: 0.2,
      },
      ding: {
        url: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3',
        volume: 0.3,
      },
      chime: {
        url: 'https://assets.mixkit.co/active_storage/sfx/2356/2356-preview.mp3',
        volume: 0.25,
      },
      toggle: {
        url: 'https://assets.mixkit.co/active_storage/sfx/2570/2570-preview.mp3',
        volume: 0.2,
      },
      'modal-open': {
        url: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
        volume: 0.3,
      },
      'modal-close': {
        url: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
        volume: 0.25,
      },
      hover: {
        url: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
        volume: 0.1,
      },
      ripple: {
        url: 'https://assets.mixkit.co/active_storage/sfx/2569/2569-preview.mp3',
        volume: 0.15,
      },
    }

    Object.entries(soundConfigs).forEach(([key, config]) => {
      const audio = new Audio(config.url)
      audio.volume = (config.volume ?? 1) * this.globalVolume
      audio.preload = 'auto'
      this.sounds.set(key as SoundEffect, audio)
    })

    this.initialized = true
    logger.info('SoundSystem inicializado', {
      context: 'SoundSystem',
      data: { sounds: this.sounds.size },
    })
  }

  /**
   * Reproduce un efecto de sonido
   */
  play(sound: SoundEffect, options?: { volume?: number; rate?: number }) {
    if (!this.enabled || !this.initialized) return

    const audio = this.sounds.get(sound)
    if (!audio) {
      logger.warn(`Sonido no encontrado: ${sound}`, { context: 'SoundSystem' })
      return
    }

    try {
      // Clone para permitir múltiples reproducciones simultáneas
      const audioClone = audio.cloneNode() as HTMLAudioElement
      audioClone.volume = (options?.volume ?? 1) * this.globalVolume
      audioClone.playbackRate = options?.rate ?? 1

      audioClone.play().catch((err) => {
        // Ignore autoplay policy errors silently
        if (err.name !== 'NotAllowedError') {
          logger.error('Error reproduciendo sonido', err, {
            context: 'SoundSystem',
            data: { sound },
          })
        }
      })
    } catch (err) {
      logger.error('Error al reproducir sonido', err as Error, {
        context: 'SoundSystem',
      })
    }
  }

  /**
   * Establece el volumen global (0-1)
   */
  setVolume(volume: number) {
    this.globalVolume = Math.max(0, Math.min(1, volume))
    this.sounds.forEach((audio) => {
      audio.volume = this.globalVolume
    })
    logger.info('Volumen actualizado', {
      context: 'SoundSystem',
      data: { volume: this.globalVolume },
    })
  }

  /**
   * Activa/desactiva todos los sonidos
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled
    logger.info(`Sonidos ${enabled ? 'activados' : 'desactivados'}`, {
      context: 'SoundSystem',
    })
  }

  /**
   * Obtiene el estado actual
   */
  getState() {
    return {
      enabled: this.enabled,
      volume: this.globalVolume,
      initialized: this.initialized,
      soundsLoaded: this.sounds.size,
    }
  }

  /**
   * Pre-carga todos los sonidos
   */
  async preloadAll(): Promise<void> {
    if (!this.initialized) return

    const promises = Array.from(this.sounds.values()).map((audio) => {
      return new Promise<void>((resolve) => {
        if (audio.readyState >= 3) {
          resolve()
        } else {
          audio.addEventListener('canplaythrough', () => resolve(), { once: true })
          audio.load()
        }
      })
    })

    await Promise.all(promises)
    logger.info('Todos los sonidos pre-cargados', { context: 'SoundSystem' })
  }
}

// Instancia singleton
export const soundSystem = new SoundSystem()
