// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎯 useSupremeSystems — Hook para integrar sistemas premium en componentes
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * @version 1.0.0 — OMEGA SUPREME EDITION
 */

'use client'

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'
import {
  supremeSystems,
  soundSystem,
  hapticSystem,
  themeSystem,
  metricsSystem,
  type SoundEffect,
  type HapticPattern,
  type ThemeMode,
  type ThemeColors,
} from '@/app/_lib/systems/SupremeSystemsHub'
import { useAppStore } from '@/app/lib/store/useAppStore'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔊 useSound — Hook simplificado para efectos de sonido
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useSound() {
  const soundEnabled = useAppStore(state => state.soundEnabled)
  const soundVolume = useAppStore(state => state.soundVolume)
  
  useEffect(() => {
    soundSystem.setEnabled(soundEnabled)
  }, [soundEnabled])
  
  useEffect(() => {
    soundSystem.setMasterVolume(soundVolume)
  }, [soundVolume])
  
  const play = useCallback((effect: SoundEffect) => {
    if (soundEnabled) {
      soundSystem.play(effect)
    }
  }, [soundEnabled])
  
  return {
    play,
    isEnabled: soundEnabled,
    volume: soundVolume,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📳 useHaptic — Hook para feedback táctil
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useHaptic() {
  const trigger = useCallback((pattern: HapticPattern) => {
    hapticSystem.trigger(pattern)
  }, [])
  
  return {
    trigger,
    isEnabled: hapticSystem.isEnabled(),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 useTheme — Hook para temas dinámicos
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useTheme() {
  const subscribe = useCallback((callback: () => void) => {
    return themeSystem.subscribe(callback)
  }, [])
  
  const getSnapshot = useCallback(() => {
    return themeSystem.getTheme()
  }, [])
  
  const getServerSnapshot = useCallback(() => {
    return 'dark' as ThemeMode
  }, [])
  
  const currentTheme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  
  const setTheme = useCallback((theme: ThemeMode) => {
    themeSystem.setTheme(theme)
    supremeSystems.feedback.tabSwitch()
  }, [])
  
  const getColors = useCallback((): ThemeColors => {
    return themeSystem.getColors()
  }, [])
  
  const toggleTheme = useCallback(() => {
    const themes: ThemeMode[] = ['dark', 'light', 'cyber', 'aurora', 'midnight']
    const currentIndex = themes.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themes.length
    setTheme(themes[nextIndex])
  }, [currentTheme, setTheme])
  
  return {
    theme: currentTheme,
    colors: getColors(),
    setTheme,
    toggleTheme,
    getColors,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 useFeedback — Hook combinado para feedback completo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useFeedback() {
  const { play: playSound, isEnabled: soundEnabled } = useSound()
  const { trigger: triggerHaptic } = useHaptic()
  
  const feedback = useMemo(() => ({
    click: () => {
      playSound('click')
      triggerHaptic('light')
    },
    
    success: () => {
      playSound('success')
      triggerHaptic('success')
    },
    
    error: () => {
      playSound('error')
      triggerHaptic('error')
    },
    
    warning: () => {
      playSound('warning')
      triggerHaptic('warning')
    },
    
    notification: () => {
      playSound('notification')
      triggerHaptic('notification')
    },
    
    modalOpen: () => {
      playSound('modal-open')
      triggerHaptic('light')
    },
    
    modalClose: () => {
      playSound('modal-close')
      triggerHaptic('light')
    },
    
    tabSwitch: () => {
      playSound('tab-switch')
      triggerHaptic('selection')
    },
    
    create: () => {
      playSound('create')
      triggerHaptic('medium')
    },
    
    delete: () => {
      playSound('delete')
      triggerHaptic('heavy')
    },
    
    transfer: () => {
      playSound('transfer')
      triggerHaptic('medium')
    },
    
    cash: () => {
      playSound('cash')
      triggerHaptic('success')
    },
    
    refresh: () => {
      playSound('refresh')
      triggerHaptic('light')
    },
    
    hover: () => {
      if (soundEnabled) {
        playSound('hover')
      }
    },
    
    swipe: () => {
      playSound('swipe')
      triggerHaptic('light')
    },
    
    expand: () => {
      playSound('expand')
      triggerHaptic('light')
    },
    
    collapse: () => {
      playSound('collapse')
      triggerHaptic('light')
    },
  }), [playSound, triggerHaptic, soundEnabled])
  
  return feedback
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 useMetrics — Hook para telemetría
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useMetrics() {
  const record = useCallback((name: string, value: number, tags?: Record<string, string>) => {
    metricsSystem.record(name, value, tags)
  }, [])
  
  const time = useCallback(<T>(name: string, fn: () => T, tags?: Record<string, string>): T => {
    return metricsSystem.time(name, fn, tags)
  }, [])
  
  const timeAsync = useCallback(async <T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> => {
    return metricsSystem.timeAsync(name, fn, tags)
  }, [])
  
  const getAverage = useCallback((name: string) => {
    return metricsSystem.getAverage(name)
  }, [])
  
  return {
    record,
    time,
    timeAsync,
    getAverage,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 useSupremeSystems — Hook principal que expone todo el sistema
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useSupremeSystems() {
  const sound = useSound()
  const haptic = useHaptic()
  const theme = useTheme()
  const feedback = useFeedback()
  const metrics = useMetrics()
  
  return {
    sound,
    haptic,
    theme,
    feedback,
    metrics,
    
    // Quick access
    playSound: sound.play,
    triggerHaptic: haptic.trigger,
    setTheme: theme.setTheme,
    getColors: theme.getColors,
  }
}

export default useSupremeSystems
