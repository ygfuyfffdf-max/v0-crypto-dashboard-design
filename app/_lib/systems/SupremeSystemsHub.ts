/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 SUPREME SYSTEMS HUB — CHRONOS INFINITY 2026 OMEGA LEVEL
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 
 * Central hub que unifica TODOS los sistemas premium del proyecto:
 * 
 * ▸ 🔊 Sound System - Efectos de sonido sutiles y satisfactorios
 * ▸ 📳 Haptic System - Feedback táctil avanzado
 * ▸ 🎨 Theme System - Temas dinámicos con transiciones suaves
 * ▸ 🤌 Gesture System - Gestos táctiles avanzados
 * ▸ ✨ Particle System - Sistema de partículas WebGL/WebGPU
 * ▸ 🎭 Animation System - Coordinación de animaciones
 * ▸ 📊 Metrics System - Telemetría y performance
 * 
 * @version 1.0.0 — OMEGA SUPREME EDITION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔊 SOUND SYSTEM — Efectos de audio premium
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type SoundEffect = 
  | 'click'
  | 'hover'
  | 'success'
  | 'error'
  | 'warning'
  | 'notification'
  | 'swipe'
  | 'whoosh'
  | 'pop'
  | 'ding'
  | 'cash'
  | 'transfer'
  | 'modal-open'
  | 'modal-close'
  | 'tab-switch'
  | 'refresh'
  | 'delete'
  | 'create'
  | 'toggle'
  | 'expand'
  | 'collapse'

interface SoundConfig {
  volume: number
  playbackRate: number
  priority: 'high' | 'normal' | 'low'
}

const SOUND_CONFIGS: Record<SoundEffect, SoundConfig> = {
  click: { volume: 0.2, playbackRate: 1, priority: 'high' },
  hover: { volume: 0.1, playbackRate: 1.2, priority: 'low' },
  success: { volume: 0.3, playbackRate: 1, priority: 'high' },
  error: { volume: 0.25, playbackRate: 0.9, priority: 'high' },
  warning: { volume: 0.25, playbackRate: 1, priority: 'normal' },
  notification: { volume: 0.3, playbackRate: 1, priority: 'high' },
  swipe: { volume: 0.15, playbackRate: 1.1, priority: 'normal' },
  whoosh: { volume: 0.2, playbackRate: 1, priority: 'normal' },
  pop: { volume: 0.2, playbackRate: 1.3, priority: 'normal' },
  ding: { volume: 0.25, playbackRate: 1, priority: 'normal' },
  cash: { volume: 0.3, playbackRate: 1, priority: 'high' },
  transfer: { volume: 0.25, playbackRate: 1, priority: 'high' },
  'modal-open': { volume: 0.2, playbackRate: 1, priority: 'normal' },
  'modal-close': { volume: 0.15, playbackRate: 1.1, priority: 'low' },
  'tab-switch': { volume: 0.1, playbackRate: 1.2, priority: 'low' },
  refresh: { volume: 0.15, playbackRate: 1, priority: 'low' },
  delete: { volume: 0.2, playbackRate: 0.9, priority: 'normal' },
  create: { volume: 0.25, playbackRate: 1.1, priority: 'normal' },
  toggle: { volume: 0.1, playbackRate: 1.2, priority: 'low' },
  expand: { volume: 0.15, playbackRate: 1, priority: 'low' },
  collapse: { volume: 0.12, playbackRate: 1.1, priority: 'low' },
}

class SoundSystem {
  private audioContext: AudioContext | null = null
  private masterVolume = 0.3
  private enabled = true
  private sounds = new Map<string, AudioBuffer>()
  private lastPlayedTimes = new Map<string, number>()
  
  // Debounce interval to prevent sound spam (ms)
  private readonly DEBOUNCE_MS = 50
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.initAudioContext()
    }
  }
  
  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      await this.preloadSounds()
    } catch (error) {
      console.warn('[SoundSystem] Could not initialize audio context:', error)
    }
  }
  
  private async preloadSounds() {
    // Generate tones programmatically for instant feedback
    const tones: Record<SoundEffect, { freq: number; duration: number; type: OscillatorType }> = {
      click: { freq: 800, duration: 0.05, type: 'sine' },
      hover: { freq: 600, duration: 0.03, type: 'sine' },
      success: { freq: 880, duration: 0.15, type: 'sine' },
      error: { freq: 200, duration: 0.2, type: 'sawtooth' },
      warning: { freq: 440, duration: 0.12, type: 'triangle' },
      notification: { freq: 660, duration: 0.1, type: 'sine' },
      swipe: { freq: 500, duration: 0.08, type: 'sine' },
      whoosh: { freq: 300, duration: 0.15, type: 'sine' },
      pop: { freq: 1000, duration: 0.04, type: 'sine' },
      ding: { freq: 1200, duration: 0.12, type: 'sine' },
      cash: { freq: 1000, duration: 0.1, type: 'sine' },
      transfer: { freq: 700, duration: 0.08, type: 'sine' },
      'modal-open': { freq: 600, duration: 0.1, type: 'sine' },
      'modal-close': { freq: 500, duration: 0.08, type: 'sine' },
      'tab-switch': { freq: 900, duration: 0.04, type: 'sine' },
      refresh: { freq: 550, duration: 0.1, type: 'triangle' },
      delete: { freq: 300, duration: 0.15, type: 'sawtooth' },
      create: { freq: 1000, duration: 0.08, type: 'sine' },
      toggle: { freq: 800, duration: 0.03, type: 'sine' },
      expand: { freq: 600, duration: 0.06, type: 'sine' },
      collapse: { freq: 500, duration: 0.05, type: 'sine' },
    }
    
    for (const [name, config] of Object.entries(tones)) {
      const buffer = this.generateTone(config.freq, config.duration, config.type)
      if (buffer) {
        this.sounds.set(name, buffer)
      }
    }
  }
  
  private generateTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer | null {
    if (!this.audioContext) return null
    
    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, length, sampleRate)
    const data = buffer.getChannelData(0)
    
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      let value: number
      
      switch (type) {
        case 'sine':
          value = Math.sin(2 * Math.PI * frequency * t)
          break
        case 'triangle':
          value = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1
          break
        case 'sawtooth':
          value = 2 * (t * frequency - Math.floor(0.5 + t * frequency))
          break
        case 'square':
          value = Math.sign(Math.sin(2 * Math.PI * frequency * t))
          break
        default:
          value = Math.sin(2 * Math.PI * frequency * t)
      }
      
      // Apply envelope (fade in/out)
      const envelope = Math.min(1, Math.min(i / (length * 0.1), (length - i) / (length * 0.3)))
      data[i] = value * envelope * 0.3
    }
    
    return buffer
  }
  
  play(effect: SoundEffect) {
    if (!this.enabled || !this.audioContext) return
    
    // Debounce to prevent sound spam
    const now = Date.now()
    const lastPlayed = this.lastPlayedTimes.get(effect) || 0
    if (now - lastPlayed < this.DEBOUNCE_MS) return
    this.lastPlayedTimes.set(effect, now)
    
    const buffer = this.sounds.get(effect)
    const config = SOUND_CONFIGS[effect]
    
    if (!buffer || !config) return
    
    try {
      // Resume audio context if suspended (browser autoplay policy)
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume()
      }
      
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()
      
      source.buffer = buffer
      source.playbackRate.value = config.playbackRate
      
      gainNode.gain.value = config.volume * this.masterVolume
      
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)
      
      source.start(0)
    } catch (error) {
      // Silently ignore audio errors
    }
  }
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }
  
  setMasterVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume))
  }
  
  isEnabled() {
    return this.enabled
  }
  
  getMasterVolume() {
    return this.masterVolume
  }
}

export const soundSystem = new SoundSystem()

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📳 HAPTIC SYSTEM — Feedback táctil avanzado
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type HapticPattern = 
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection'
  | 'impact'
  | 'notification'

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10, 100],
  warning: [25, 25, 25],
  error: [50, 100, 50],
  selection: 15,
  impact: [20, 10, 20],
  notification: [10, 50, 10, 50, 10],
}

class HapticSystem {
  private enabled = true
  
  trigger(pattern: HapticPattern) {
    if (!this.enabled) return
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return
    
    const vibrationPattern = HAPTIC_PATTERNS[pattern]
    
    try {
      navigator.vibrate(vibrationPattern)
    } catch {
      // Silently ignore vibration errors
    }
  }
  
  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }
  
  isEnabled() {
    return this.enabled
  }
}

export const hapticSystem = new HapticSystem()

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 THEME SYSTEM — Temas dinámicos con transiciones suaves
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type ThemeMode = 'light' | 'dark' | 'cyber' | 'aurora' | 'midnight'

export interface ThemeColors {
  // Backgrounds
  bgPrimary: string
  bgSecondary: string
  bgTertiary: string
  bgOverlay: string
  
  // Text
  textPrimary: string
  textSecondary: string
  textTertiary: string
  textInverse: string
  
  // Borders
  borderPrimary: string
  borderSecondary: string
  borderAccent: string
  
  // Accents
  accentPrimary: string
  accentSecondary: string
  accentTertiary: string
  accentSuccess: string
  accentWarning: string
  accentError: string
  accentInfo: string
  
  // Glass effects
  glassBg: string
  glassBorder: string
  glassShadow: string
  
  // Gradients
  gradientPrimary: string
  gradientSecondary: string
  gradientAurora: string
}

export const THEMES: Record<ThemeMode, ThemeColors> = {
  dark: {
    bgPrimary: '#0a0a0f',
    bgSecondary: '#1a1a2e',
    bgTertiary: '#16213e',
    bgOverlay: 'rgba(0, 0, 0, 0.8)',
    textPrimary: '#ffffff',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
    textInverse: '#0a0a0f',
    borderPrimary: 'rgba(255, 255, 255, 0.1)',
    borderSecondary: 'rgba(255, 255, 255, 0.05)',
    borderAccent: 'rgba(139, 92, 246, 0.5)',
    accentPrimary: '#8B5CF6',
    accentSecondary: '#06B6D4',
    accentTertiary: '#F59E0B',
    accentSuccess: '#10B981',
    accentWarning: '#F59E0B',
    accentError: '#EF4444',
    accentInfo: '#3B82F6',
    glassBg: 'rgba(255, 255, 255, 0.05)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    glassShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    gradientPrimary: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
    gradientSecondary: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    gradientAurora: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 50%, #10B981 100%)',
  },
  light: {
    bgPrimary: '#ffffff',
    bgSecondary: '#f9fafb',
    bgTertiary: '#f3f4f6',
    bgOverlay: 'rgba(255, 255, 255, 0.9)',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textInverse: '#ffffff',
    borderPrimary: 'rgba(0, 0, 0, 0.1)',
    borderSecondary: 'rgba(0, 0, 0, 0.05)',
    borderAccent: 'rgba(139, 92, 246, 0.5)',
    accentPrimary: '#8B5CF6',
    accentSecondary: '#0891B2',
    accentTertiary: '#D97706',
    accentSuccess: '#059669',
    accentWarning: '#D97706',
    accentError: '#DC2626',
    accentInfo: '#2563EB',
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(0, 0, 0, 0.08)',
    glassShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    gradientPrimary: 'linear-gradient(135deg, #6366F1 0%, #0891B2 100%)',
    gradientSecondary: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
    gradientAurora: 'linear-gradient(135deg, #6366F1 0%, #0891B2 50%, #059669 100%)',
  },
  cyber: {
    bgPrimary: '#000000',
    bgSecondary: '#0f0f23',
    bgTertiary: '#1a1a3e',
    bgOverlay: 'rgba(0, 0, 0, 0.95)',
    textPrimary: '#00ff88',
    textSecondary: '#00d9ff',
    textTertiary: '#ff00ff',
    textInverse: '#000000',
    borderPrimary: 'rgba(0, 255, 136, 0.2)',
    borderSecondary: 'rgba(0, 217, 255, 0.1)',
    borderAccent: 'rgba(255, 0, 255, 0.5)',
    accentPrimary: '#00ff88',
    accentSecondary: '#00d9ff',
    accentTertiary: '#ff00ff',
    accentSuccess: '#00ff88',
    accentWarning: '#ffff00',
    accentError: '#ff0055',
    accentInfo: '#00d9ff',
    glassBg: 'rgba(0, 255, 136, 0.05)',
    glassBorder: 'rgba(0, 255, 136, 0.2)',
    glassShadow: '0 0 50px rgba(0, 255, 136, 0.2)',
    gradientPrimary: 'linear-gradient(135deg, #00ff88 0%, #00d9ff 100%)',
    gradientSecondary: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
    gradientAurora: 'linear-gradient(135deg, #00ff88 0%, #00d9ff 50%, #ff00ff 100%)',
  },
  aurora: {
    bgPrimary: '#0c0a1d',
    bgSecondary: '#150f2e',
    bgTertiary: '#1d1540',
    bgOverlay: 'rgba(12, 10, 29, 0.95)',
    textPrimary: '#f0eaff',
    textSecondary: '#c4b8e0',
    textTertiary: '#9889c2',
    textInverse: '#0c0a1d',
    borderPrimary: 'rgba(168, 85, 247, 0.2)',
    borderSecondary: 'rgba(59, 130, 246, 0.1)',
    borderAccent: 'rgba(236, 72, 153, 0.5)',
    accentPrimary: '#a855f7',
    accentSecondary: '#3b82f6',
    accentTertiary: '#ec4899',
    accentSuccess: '#22c55e',
    accentWarning: '#eab308',
    accentError: '#ef4444',
    accentInfo: '#6366f1',
    glassBg: 'rgba(168, 85, 247, 0.08)',
    glassBorder: 'rgba(168, 85, 247, 0.2)',
    glassShadow: '0 8px 40px rgba(168, 85, 247, 0.2)',
    gradientPrimary: 'linear-gradient(135deg, #a855f7 0%, #3b82f6 50%, #ec4899 100%)',
    gradientSecondary: 'linear-gradient(135deg, #150f2e 0%, #1d1540 100%)',
    gradientAurora: 'linear-gradient(135deg, #22c55e 0%, #3b82f6 25%, #a855f7 50%, #ec4899 75%, #f97316 100%)',
  },
  midnight: {
    bgPrimary: '#020617',
    bgSecondary: '#0f172a',
    bgTertiary: '#1e293b',
    bgOverlay: 'rgba(2, 6, 23, 0.95)',
    textPrimary: '#f1f5f9',
    textSecondary: '#cbd5e1',
    textTertiary: '#94a3b8',
    textInverse: '#020617',
    borderPrimary: 'rgba(71, 85, 105, 0.4)',
    borderSecondary: 'rgba(71, 85, 105, 0.2)',
    borderAccent: 'rgba(59, 130, 246, 0.5)',
    accentPrimary: '#3b82f6',
    accentSecondary: '#8b5cf6',
    accentTertiary: '#06b6d4',
    accentSuccess: '#22c55e',
    accentWarning: '#f59e0b',
    accentError: '#ef4444',
    accentInfo: '#0ea5e9',
    glassBg: 'rgba(15, 23, 42, 0.8)',
    glassBorder: 'rgba(71, 85, 105, 0.3)',
    glassShadow: '0 8px 40px rgba(0, 0, 0, 0.5)',
    gradientPrimary: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    gradientSecondary: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    gradientAurora: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%)',
  },
}

class ThemeSystem {
  private currentTheme: ThemeMode = 'dark'
  private listeners = new Set<(theme: ThemeMode) => void>()
  
  constructor() {
    if (typeof window !== 'undefined') {
      this.loadSavedTheme()
    }
  }
  
  private loadSavedTheme() {
    try {
      const saved = localStorage.getItem('chronos-theme') as ThemeMode | null
      if (saved && saved in THEMES) {
        this.currentTheme = saved
        this.applyTheme(saved)
      }
    } catch {
      // Use default theme
    }
  }
  
  getTheme(): ThemeMode {
    return this.currentTheme
  }
  
  getColors(): ThemeColors {
    return THEMES[this.currentTheme]
  }
  
  setTheme(theme: ThemeMode) {
    if (!(theme in THEMES)) return
    
    this.currentTheme = theme
    this.applyTheme(theme)
    this.notifyListeners()
    
    try {
      localStorage.setItem('chronos-theme', theme)
    } catch {
      // Ignore storage errors
    }
  }
  
  private applyTheme(theme: ThemeMode) {
    if (typeof document === 'undefined') return
    
    const colors = THEMES[theme]
    const root = document.documentElement
    
    // Apply CSS variables
    root.style.setProperty('--bg-primary', colors.bgPrimary)
    root.style.setProperty('--bg-secondary', colors.bgSecondary)
    root.style.setProperty('--bg-tertiary', colors.bgTertiary)
    root.style.setProperty('--text-primary', colors.textPrimary)
    root.style.setProperty('--text-secondary', colors.textSecondary)
    root.style.setProperty('--text-tertiary', colors.textTertiary)
    root.style.setProperty('--accent-primary', colors.accentPrimary)
    root.style.setProperty('--accent-secondary', colors.accentSecondary)
    root.style.setProperty('--accent-success', colors.accentSuccess)
    root.style.setProperty('--accent-warning', colors.accentWarning)
    root.style.setProperty('--accent-error', colors.accentError)
    root.style.setProperty('--glass-bg', colors.glassBg)
    root.style.setProperty('--glass-border', colors.glassBorder)
    root.style.setProperty('--gradient-primary', colors.gradientPrimary)
    root.style.setProperty('--gradient-aurora', colors.gradientAurora)
    
    // Update data attribute for CSS selectors
    root.setAttribute('data-theme', theme)
  }
  
  subscribe(listener: (theme: ThemeMode) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentTheme))
  }
}

export const themeSystem = new ThemeSystem()

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 METRICS SYSTEM — Telemetría y performance
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface PerformanceMetric {
  name: string
  value: number
  timestamp: number
  tags?: Record<string, string>
}

class MetricsSystem {
  private metrics: PerformanceMetric[] = []
  private maxMetrics = 1000
  
  record(name: string, value: number, tags?: Record<string, string>) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      tags,
    }
    
    this.metrics.push(metric)
    
    // Limit stored metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics / 2)
    }
  }
  
  time<T>(name: string, fn: () => T, tags?: Record<string, string>): T {
    const start = performance.now()
    const result = fn()
    const duration = performance.now() - start
    this.record(name, duration, tags)
    return result
  }
  
  async timeAsync<T>(name: string, fn: () => Promise<T>, tags?: Record<string, string>): Promise<T> {
    const start = performance.now()
    const result = await fn()
    const duration = performance.now() - start
    this.record(name, duration, tags)
    return result
  }
  
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name)
    }
    return [...this.metrics]
  }
  
  getAverage(name: string): number {
    const metrics = this.getMetrics(name)
    if (metrics.length === 0) return 0
    return metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
  }
  
  clear() {
    this.metrics = []
  }
}

export const metricsSystem = new MetricsSystem()

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌐 SUPREME SYSTEMS HUB — Unified API
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const supremeSystems = {
  sound: soundSystem,
  haptic: hapticSystem,
  theme: themeSystem,
  metrics: metricsSystem,
  
  // Quick access methods
  playSound: (effect: SoundEffect) => soundSystem.play(effect),
  triggerHaptic: (pattern: HapticPattern) => hapticSystem.trigger(pattern),
  setTheme: (theme: ThemeMode) => themeSystem.setTheme(theme),
  getThemeColors: () => themeSystem.getColors(),
  
  // Combined feedback for common actions
  feedback: {
    click: () => {
      soundSystem.play('click')
      hapticSystem.trigger('light')
    },
    success: () => {
      soundSystem.play('success')
      hapticSystem.trigger('success')
    },
    error: () => {
      soundSystem.play('error')
      hapticSystem.trigger('error')
    },
    warning: () => {
      soundSystem.play('warning')
      hapticSystem.trigger('warning')
    },
    notification: () => {
      soundSystem.play('notification')
      hapticSystem.trigger('notification')
    },
    modalOpen: () => {
      soundSystem.play('modal-open')
      hapticSystem.trigger('light')
    },
    modalClose: () => {
      soundSystem.play('modal-close')
      hapticSystem.trigger('light')
    },
    tabSwitch: () => {
      soundSystem.play('tab-switch')
      hapticSystem.trigger('selection')
    },
    create: () => {
      soundSystem.play('create')
      hapticSystem.trigger('medium')
    },
    delete: () => {
      soundSystem.play('delete')
      hapticSystem.trigger('heavy')
    },
    transfer: () => {
      soundSystem.play('transfer')
      hapticSystem.trigger('medium')
    },
    cash: () => {
      soundSystem.play('cash')
      hapticSystem.trigger('success')
    },
  },
}

export default supremeSystems
