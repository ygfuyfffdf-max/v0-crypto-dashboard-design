/**
 * 🎤👄 LIP SYNC CONTROLLER — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de sincronización labial para el avatar Nexbot con:
 * - Análisis de audio en tiempo real
 * - Mapeo de amplitud a apertura de boca
 * - Visemes básicos para diferentes sonidos
 * - Integración con ElevenLabs TTS
 * - Soporte para Web Speech API
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { logger } from '@/app/lib/utils/logger'
import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type Viseme =
  | 'neutral' // Boca cerrada
  | 'aah' // A abierta
  | 'eeh' // E media
  | 'ih' // I cerrada
  | 'oh' // O redondeada
  | 'ooh' // U redondeada
  | 'fv' // F/V labios juntos
  | 'th' // TH lengua
  | 'mbp' // M/B/P cerrada
  | 'wq' // W/Q redondeada

export interface LipSyncConfig {
  sampleRate?: number
  fftSize?: number
  smoothingTimeConstant?: number
  minDecibels?: number
  maxDecibels?: number
  amplitudeMultiplier?: number
}

export interface LipSyncState {
  isActive: boolean
  currentAmplitude: number
  currentViseme: Viseme
  averageAmplitude: number
  peakAmplitude: number
}

export interface UseLipSyncReturn {
  state: LipSyncState
  startAnalysis: (audioElement?: HTMLAudioElement) => Promise<void>
  stopAnalysis: () => void
  analyzeText: (text: string) => Viseme[]
  getMouthOpenValue: () => number
  getVisemeBlendShapes: () => Record<Viseme, number>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: Required<LipSyncConfig> = {
  sampleRate: 44100,
  fftSize: 256,
  smoothingTimeConstant: 0.8,
  minDecibels: -90,
  maxDecibels: -10,
  amplitudeMultiplier: 1.5,
}

// Phoneme to viseme mapping (simplified Spanish)
const PHONEME_TO_VISEME: Record<string, Viseme> = {
  // Vowels
  a: 'aah',
  á: 'aah',
  e: 'eeh',
  é: 'eeh',
  i: 'ih',
  í: 'ih',
  o: 'oh',
  ó: 'oh',
  u: 'ooh',
  ú: 'ooh',

  // Consonants
  m: 'mbp',
  b: 'mbp',
  p: 'mbp',
  f: 'fv',
  v: 'fv',
  t: 'th',
  d: 'th',
  s: 'th',
  z: 'th',
  c: 'th',
  n: 'th',
  l: 'th',
  r: 'th',
  w: 'wq',
  q: 'wq',
  j: 'ih',
  g: 'oh',
  k: 'oh',
  x: 'th',
  h: 'neutral',
  ñ: 'ih',
  y: 'ih',
  ch: 'th',
  rr: 'th',
  ll: 'ih',
}

// Viseme blend shapes for 3D avatar (0-1 values)
const VISEME_BLEND_SHAPES: Record<
  Viseme,
  {
    mouthOpen: number
    mouthWide: number
    mouthRound: number
    lipsClosed: number
  }
> = {
  neutral: { mouthOpen: 0, mouthWide: 0, mouthRound: 0, lipsClosed: 1 },
  aah: { mouthOpen: 1, mouthWide: 0.8, mouthRound: 0, lipsClosed: 0 },
  eeh: { mouthOpen: 0.5, mouthWide: 0.6, mouthRound: 0, lipsClosed: 0 },
  ih: { mouthOpen: 0.3, mouthWide: 0.4, mouthRound: 0, lipsClosed: 0 },
  oh: { mouthOpen: 0.7, mouthWide: 0, mouthRound: 0.8, lipsClosed: 0 },
  ooh: { mouthOpen: 0.4, mouthWide: 0, mouthRound: 1, lipsClosed: 0 },
  fv: { mouthOpen: 0.1, mouthWide: 0.3, mouthRound: 0, lipsClosed: 0.5 },
  th: { mouthOpen: 0.2, mouthWide: 0.5, mouthRound: 0, lipsClosed: 0 },
  mbp: { mouthOpen: 0, mouthWide: 0, mouthRound: 0, lipsClosed: 1 },
  wq: { mouthOpen: 0.3, mouthWide: 0, mouthRound: 0.9, lipsClosed: 0 },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LIP SYNC CONTROLLER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class LipSyncController {
  private config: Required<LipSyncConfig>
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private dataArray: Uint8Array<ArrayBuffer> | null = null
  private isRunning = false
  private animationFrameId: number | null = null

  private currentAmplitude = 0
  private averageAmplitude = 0
  private peakAmplitude = 0
  private currentViseme: Viseme = 'neutral'
  private amplitudeHistory: number[] = []

  private onUpdate?: (amplitude: number, viseme: Viseme) => void

  constructor(config: LipSyncConfig = {}, onUpdate?: (amplitude: number, viseme: Viseme) => void) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.onUpdate = onUpdate
  }

  /**
   * Initialize audio context and analyser
   */
  async init(): Promise<void> {
    if (typeof window === 'undefined') return

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    this.analyser = this.audioContext.createAnalyser()
    this.analyser.fftSize = this.config.fftSize
    this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant
    this.analyser.minDecibels = this.config.minDecibels
    this.analyser.maxDecibels = this.config.maxDecibels

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount)
  }

  /**
   * Connect to an audio element for lip sync
   */
  async connectToAudio(audioElement: HTMLAudioElement): Promise<void> {
    if (!this.audioContext || !this.analyser) {
      await this.init()
    }

    const source = this.audioContext!.createMediaElementSource(audioElement)
    source.connect(this.analyser!)
    this.analyser!.connect(this.audioContext!.destination)
  }

  /**
   * Connect to microphone for live lip sync
   */
  async connectToMicrophone(): Promise<void> {
    if (!this.audioContext || !this.analyser) {
      await this.init()
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const source = this.audioContext!.createMediaStreamSource(stream)
      source.connect(this.analyser!)
    } catch (error) {
      logger.error('Error accessing microphone', error as Error, { context: 'LipSync' })
      throw error
    }
  }

  /**
   * Start analyzing audio and updating lip sync
   */
  start(): void {
    if (this.isRunning || !this.analyser || !this.dataArray) return

    this.isRunning = true
    this.analyze()
  }

  /**
   * Stop analyzing
   */
  stop(): void {
    this.isRunning = false
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    this.currentAmplitude = 0
    this.currentViseme = 'neutral'
    this.onUpdate?.(0, 'neutral')
  }

  /**
   * Main analysis loop
   */
  private analyze(): void {
    if (!this.isRunning || !this.analyser || !this.dataArray) return

    this.analyser.getByteFrequencyData(this.dataArray)

    // Calculate average amplitude
    let sum = 0
    for (let i = 0; i < this.dataArray.length; i++) {
      const value = this.dataArray[i]
      if (value !== undefined) {
        sum += value
      }
    }
    const rawAmplitude = sum / this.dataArray.length / 255

    // Apply multiplier and clamp
    this.currentAmplitude = Math.min(1, rawAmplitude * this.config.amplitudeMultiplier)

    // Update history for average
    this.amplitudeHistory.push(this.currentAmplitude)
    if (this.amplitudeHistory.length > 30) {
      this.amplitudeHistory.shift()
    }

    this.averageAmplitude =
      this.amplitudeHistory.reduce((a, b) => a + b) / this.amplitudeHistory.length
    this.peakAmplitude = Math.max(this.peakAmplitude * 0.99, this.currentAmplitude)

    // Determine viseme based on amplitude
    this.currentViseme = this.amplitudeToViseme(this.currentAmplitude)

    // Callback
    this.onUpdate?.(this.currentAmplitude, this.currentViseme)

    // Continue loop
    this.animationFrameId = requestAnimationFrame(() => this.analyze())
  }

  /**
   * Map amplitude to a basic viseme
   */
  private amplitudeToViseme(amplitude: number): Viseme {
    if (amplitude < 0.1) return 'neutral'
    if (amplitude < 0.25) return 'mbp'
    if (amplitude < 0.4) return 'eeh'
    if (amplitude < 0.6) return 'ih'
    if (amplitude < 0.8) return 'oh'
    return 'aah'
  }

  /**
   * Get current state
   */
  getState(): LipSyncState {
    return {
      isActive: this.isRunning,
      currentAmplitude: this.currentAmplitude,
      currentViseme: this.currentViseme,
      averageAmplitude: this.averageAmplitude,
      peakAmplitude: this.peakAmplitude,
    }
  }

  /**
   * Get mouth open value (0-1) for simple lip sync
   */
  getMouthOpenValue(): number {
    return this.currentAmplitude
  }

  /**
   * Get blend shape values for current viseme
   */
  getVisemeBlendShapes(): Record<Viseme, number> {
    const result: Record<Viseme, number> = {} as Record<Viseme, number>

    // Set all to 0
    for (const viseme of Object.keys(VISEME_BLEND_SHAPES) as Viseme[]) {
      result[viseme] = 0
    }

    // Set current viseme weight
    result[this.currentViseme] = this.currentAmplitude

    return result
  }

  /**
   * Analyze text and return sequence of visemes
   */
  analyzeText(text: string): Viseme[] {
    const visemes: Viseme[] = []
    const normalizedText = text.toLowerCase().normalize('NFD')

    let i = 0
    while (i < normalizedText.length) {
      // Check for digraphs (ch, ll, rr)
      if (i < normalizedText.length - 1) {
        const digraph = normalizedText.substring(i, i + 2)
        if (PHONEME_TO_VISEME[digraph]) {
          visemes.push(PHONEME_TO_VISEME[digraph])
          i += 2
          continue
        }
      }

      const char = normalizedText[i]

      // Skip non-letters or undefined
      if (!char || !/[a-záéíóúñü]/.test(char)) {
        visemes.push('neutral')
        i++
        continue
      }

      const viseme = PHONEME_TO_VISEME[char] || 'neutral'
      visemes.push(viseme)
      i++
    }

    return visemes
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop()
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close()
    }
    this.audioContext = null
    this.analyser = null
    this.dataArray = null
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// REACT HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useLipSync(config: LipSyncConfig = {}): UseLipSyncReturn {
  const controllerRef = useRef<LipSyncController | null>(null)
  const [state, setState] = useState<LipSyncState>({
    isActive: false,
    currentAmplitude: 0,
    currentViseme: 'neutral',
    averageAmplitude: 0,
    peakAmplitude: 0,
  })

  // Initialize controller
  useEffect(() => {
    const handleUpdate = (amplitude: number, viseme: Viseme) => {
      setState((prev) => ({
        ...prev,
        isActive: true,
        currentAmplitude: amplitude,
        currentViseme: viseme,
      }))
    }

    controllerRef.current = new LipSyncController(config, handleUpdate)
    controllerRef.current.init()

    return () => {
      controllerRef.current?.dispose()
    }
  }, [])

  const startAnalysis = useCallback(async (audioElement?: HTMLAudioElement) => {
    if (!controllerRef.current) return

    if (audioElement) {
      await controllerRef.current.connectToAudio(audioElement)
    } else {
      await controllerRef.current.connectToMicrophone()
    }

    controllerRef.current.start()
  }, [])

  const stopAnalysis = useCallback(() => {
    controllerRef.current?.stop()
    setState((prev) => ({
      ...prev,
      isActive: false,
      currentAmplitude: 0,
      currentViseme: 'neutral',
    }))
  }, [])

  const analyzeText = useCallback((text: string): Viseme[] => {
    return controllerRef.current?.analyzeText(text) || []
  }, [])

  const getMouthOpenValue = useCallback((): number => {
    return controllerRef.current?.getMouthOpenValue() || 0
  }, [])

  const getVisemeBlendShapes = useCallback((): Record<Viseme, number> => {
    return controllerRef.current?.getVisemeBlendShapes() || ({} as Record<Viseme, number>)
  }, [])

  return {
    state,
    startAnalysis,
    stopAnalysis,
    analyzeText,
    getMouthOpenValue,
    getVisemeBlendShapes,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { PHONEME_TO_VISEME, VISEME_BLEND_SHAPES }
export default LipSyncController
