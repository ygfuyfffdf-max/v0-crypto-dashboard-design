'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎵 USE SOUND EFFECT HOOK
 * Hook para reproducir efectos de sonido en componentes
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { soundSystem, type SoundEffect } from '@/app/lib/audio/SoundSystem'
import { useAppStore } from '@/app/lib/store/useAppStore'
import { useCallback, useEffect } from 'react'

export function useSoundEffect() {
  const soundEnabled = useAppStore((state) => state.soundEnabled ?? true)

  // Pre-cargar sonidos al montar
  useEffect(() => {
    soundSystem.preloadAll().catch(() => {
      // Silently fail
    })
  }, [])

  const play = useCallback(
    (sound: SoundEffect, options?: { volume?: number; rate?: number }) => {
      if (soundEnabled) {
        soundSystem.play(sound, options)
      }
    },
    [soundEnabled],
  )

  const setVolume = useCallback((volume: number) => {
    soundSystem.setVolume(volume)
  }, [])

  const setEnabled = useCallback((enabled: boolean) => {
    soundSystem.setEnabled(enabled)
  }, [])

  const getState = useCallback(() => {
    return soundSystem.getState()
  }, [])

  return {
    play,
    setVolume,
    setEnabled,
    getState,
  }
}

/**
 * Hook para agregar sonidos a eventos de UI comunes
 */
export function useUISound() {
  const { play } = useSoundEffect()

  return {
    onClick: () => play('click'),
    onSuccess: () => play('success'),
    onError: () => play('error'),
    onModalOpen: () => play('modal-open'),
    onModalClose: () => play('modal-close'),
    onSwipe: () => play('swipe'),
    onToggle: () => play('toggle'),
    onHover: () => play('hover', { volume: 0.5 }),
  }
}
