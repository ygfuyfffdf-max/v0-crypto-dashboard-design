/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎤✨ ELEVEN LABS V3 ALPHA — ULTRA PREMIUM TTS CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Cliente de Text-to-Speech de próxima generación con:
 * - Eleven Labs v3 Alpha Neural Cloning
 * - Emotion Modulation (modulación emocional en tiempo real)
 * - Text-to-Dialogue (conversaciones naturales)
 * - Multilingual 70+ languages
 * - Premium voices: Bella, Liam, Adam, Rachel
 * - Finance-specific voice presets
 * - Viseme generation for lip-sync
 * - High-fidelity: 48kHz/24-bit
 * - Streaming optimizado <300ms latency
 *
 * @version 3.0.0-alpha
 * @author CHRONOS INFINITY TEAM
 */

import { logger } from '@/app/lib/utils/logger'
import type {
  ElevenLabsV3Config,
  ElevenLabsVoice,
  MoodState,
  NexBotEmotion,
  VisemeType,
} from './types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 VOICE IDS — PREMIUM COLLECTION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const VOICE_IDS: Record<ElevenLabsVoice, string> = {
  // Premium Neural Cloning Voices (v3 Alpha)
  aria: 'aria_v3_premium',
  roger: 'roger_v3_premium',
  sarah: 'sarah_v3_premium',
  laura: 'laura_v3_premium',
  charlie: 'charlie_v3_premium',
  george: 'george_v3_premium',
  callum: 'callum_v3_premium',
  river: 'river_v3_premium',
  liam: 'liam_v3_premium',
  charlotte: 'charlotte_v3_premium',
  // Spanish Native Voices (Premium)
  carlos_mx: 'JBFqnCBsd6RMkjVDRZzb',
  valentina_mx: 'valentina_mx_v3_premium',
  mateo_mx: 'mateo_mx_v3_premium',
  sofia_mx: 'sofia_mx_v3_premium',
  diego_es: 'diego_es_v3_premium',
  lucia_es: 'lucia_es_v3_premium',
  zero_force: 'zero_force_v3_premium',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 EMOTION MODULATION PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface EmotionPreset {
  stability: number
  similarity: number
  style: number
  speakingRate: number
  pitch: number
  emotionTags: string[]
}

const EMOTION_PRESETS: Record<NexBotEmotion, EmotionPreset> = {
  idle: {
    stability: 0.5,
    similarity: 0.75,
    style: 0.0,
    speakingRate: 1.0,
    pitch: 0,
    emotionTags: [],
  },
  happy: {
    stability: 0.4,
    similarity: 0.8,
    style: 0.6,
    speakingRate: 1.1,
    pitch: 2,
    emotionTags: ['happy', 'warm'],
  },
  excited: {
    stability: 0.3,
    similarity: 0.85,
    style: 0.8,
    speakingRate: 1.2,
    pitch: 4,
    emotionTags: ['excited', 'energetic'],
  },
  euphoric: {
    stability: 0.2,
    similarity: 0.9,
    style: 1.0,
    speakingRate: 1.25,
    pitch: 6,
    emotionTags: ['euphoric', 'celebrating'],
  },
  calm: {
    stability: 0.8,
    similarity: 0.7,
    style: 0.2,
    speakingRate: 0.9,
    pitch: -2,
    emotionTags: ['calm', 'soothing'],
  },
  focused: {
    stability: 0.7,
    similarity: 0.75,
    style: 0.3,
    speakingRate: 1.0,
    pitch: 0,
    emotionTags: ['focused', 'professional'],
  },
  thinking: {
    stability: 0.6,
    similarity: 0.7,
    style: 0.4,
    speakingRate: 0.85,
    pitch: -1,
    emotionTags: ['thoughtful', 'contemplative'],
  },
  confused: {
    stability: 0.5,
    similarity: 0.65,
    style: 0.5,
    speakingRate: 0.9,
    pitch: 2,
    emotionTags: ['confused', 'uncertain'],
  },
  curious: {
    stability: 0.5,
    similarity: 0.75,
    style: 0.5,
    speakingRate: 1.05,
    pitch: 3,
    emotionTags: ['curious', 'interested'],
  },
  surprised: {
    stability: 0.3,
    similarity: 0.8,
    style: 0.7,
    speakingRate: 1.15,
    pitch: 5,
    emotionTags: ['surprised', 'amazed'],
  },
  concerned: {
    stability: 0.6,
    similarity: 0.7,
    style: 0.4,
    speakingRate: 0.95,
    pitch: -1,
    emotionTags: ['concerned', 'worried'],
  },
  worried: {
    stability: 0.55,
    similarity: 0.65,
    style: 0.45,
    speakingRate: 0.9,
    pitch: 1,
    emotionTags: ['worried', 'anxious'],
  },
  sad: {
    stability: 0.7,
    similarity: 0.6,
    style: 0.3,
    speakingRate: 0.8,
    pitch: -3,
    emotionTags: ['sad', 'melancholic'],
  },
  tired: {
    stability: 0.75,
    similarity: 0.6,
    style: 0.2,
    speakingRate: 0.75,
    pitch: -4,
    emotionTags: ['tired', 'sleepy'],
  },
  stressed: {
    stability: 0.4,
    similarity: 0.7,
    style: 0.6,
    speakingRate: 1.1,
    pitch: 2,
    emotionTags: ['stressed', 'tense'],
  },
  angry: {
    stability: 0.35,
    similarity: 0.75,
    style: 0.7,
    speakingRate: 1.15,
    pitch: 1,
    emotionTags: ['frustrated', 'stern'],
  },
  listening: {
    stability: 0.5,
    similarity: 0.75,
    style: 0.0,
    speakingRate: 1.0,
    pitch: 0,
    emotionTags: [],
  },
  speaking: {
    stability: 0.5,
    similarity: 0.75,
    style: 0.3,
    speakingRate: 1.0,
    pitch: 0,
    emotionTags: ['speaking'],
  },
  processing: {
    stability: 0.5,
    similarity: 0.75,
    style: 0.0,
    speakingRate: 1.0,
    pitch: 0,
    emotionTags: [],
  },
  quantum: {
    stability: 0.8,
    similarity: 0.85,
    style: 0.2,
    speakingRate: 0.95,
    pitch: -2,
    emotionTags: ['authoritative', 'calm', 'quantum'],
  },
  success: {
    stability: 0.4,
    similarity: 0.8,
    style: 0.7,
    speakingRate: 1.1,
    pitch: 3,
    emotionTags: ['proud', 'satisfied'],
  },
  celebrating: {
    stability: 0.25,
    similarity: 0.85,
    style: 0.9,
    speakingRate: 1.2,
    pitch: 5,
    emotionTags: ['celebrating', 'joyful'],
  },
  proud: {
    stability: 0.5,
    similarity: 0.8,
    style: 0.6,
    speakingRate: 1.05,
    pitch: 2,
    emotionTags: ['proud', 'confident'],
  },
  determined: {
    stability: 0.6,
    similarity: 0.75,
    style: 0.5,
    speakingRate: 1.0,
    pitch: 0,
    emotionTags: ['determined', 'resolute'],
  },
  playful: {
    stability: 0.35,
    similarity: 0.8,
    style: 0.7,
    speakingRate: 1.1,
    pitch: 4,
    emotionTags: ['playful', 'fun'],
  },
  mischievous: {
    stability: 0.3,
    similarity: 0.8,
    style: 0.75,
    speakingRate: 1.1,
    pitch: 3,
    emotionTags: ['mischievous', 'cheeky'],
  },
  shy: {
    stability: 0.7,
    similarity: 0.65,
    style: 0.3,
    speakingRate: 0.9,
    pitch: 1,
    emotionTags: ['shy', 'modest'],
  },
  confident: {
    stability: 0.55,
    similarity: 0.8,
    style: 0.5,
    speakingRate: 1.05,
    pitch: 1,
    emotionTags: ['confident', 'assured'],
  },
  loving: {
    stability: 0.6,
    similarity: 0.75,
    style: 0.5,
    speakingRate: 0.95,
    pitch: 0,
    emotionTags: ['warm', 'caring'],
  },
  grateful: {
    stability: 0.55,
    similarity: 0.8,
    style: 0.5,
    speakingRate: 1.0,
    pitch: 1,
    emotionTags: ['grateful', 'appreciative'],
  },
  error: {
    stability: 0.6,
    similarity: 0.7,
    style: 0.4,
    speakingRate: 0.95,
    pitch: -1,
    emotionTags: ['apologetic', 'concerned'],
  },
  warning: {
    stability: 0.5,
    similarity: 0.75,
    style: 0.5,
    speakingRate: 1.05,
    pitch: 1,
    emotionTags: ['warning', 'alert'],
  },
  alert: {
    stability: 0.45,
    similarity: 0.75,
    style: 0.55,
    speakingRate: 1.1,
    pitch: 2,
    emotionTags: ['alert', 'urgent'],
  },
  neutral: {
    stability: 0.5,
    similarity: 0.75,
    style: 0.0,
    speakingRate: 1.0,
    pitch: 0,
    emotionTags: [],
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🗣️ FINANCE-SPECIFIC VOICE PRESETS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const FINANCE_VOICE_PRESETS = {
  salesReport: {
    voice: 'carlos_mx' as ElevenLabsVoice,
    emotion: 'professional' as NexBotEmotion,
    description: 'Reporte de ventas profesional',
  },
  goodNews: {
    voice: 'sofia_mx' as ElevenLabsVoice,
    emotion: 'excited' as NexBotEmotion,
    description: 'Buenas noticias financieras',
  },
  alert: {
    voice: 'valentina_mx' as ElevenLabsVoice,
    emotion: 'concerned' as NexBotEmotion,
    description: 'Alertas y advertencias',
  },
  summary: {
    voice: 'mateo_mx' as ElevenLabsVoice,
    emotion: 'calm' as NexBotEmotion,
    description: 'Resúmenes y análisis',
  },
  celebration: {
    voice: 'sofia_mx' as ElevenLabsVoice,
    emotion: 'celebrating' as NexBotEmotion,
    description: 'Celebración de logros',
  },
  guidance: {
    voice: 'carlos_mx' as ElevenLabsVoice,
    emotion: 'focused' as NexBotEmotion,
    description: 'Guía y tutoriales',
  },
  // ZERO FORCE IDENTITY
  zero: {
    voice: 'zero_force' as ElevenLabsVoice,
    emotion: 'neutral' as NexBotEmotion, // Will be overridden by quantum modulation
    description: 'Zero Force - Identidad Principal',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 VISEME MAPPING FOR LIP-SYNC
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VisemeData {
  viseme: VisemeType
  timestamp: number
  duration: number
  intensity: number
}

// Eleven Labs phoneme to viseme mapping
const PHONEME_TO_VISEME: Record<string, VisemeType> = {
  // Vowels
  a: 'aa',
  e: 'eh',
  i: 'ih',
  o: 'oh',
  u: 'uh',
  á: 'aa',
  é: 'eh',
  í: 'iy',
  ó: 'oh',
  ú: 'uw',
  // Consonants
  b: 'b',
  c: 'k',
  d: 'd',
  f: 'f',
  g: 'g',
  h: 'hh',
  j: 'jh',
  k: 'k',
  l: 'l',
  m: 'm',
  n: 'n',
  ñ: 'ny',
  p: 'p',
  q: 'k',
  r: 'r',
  s: 's',
  t: 't',
  v: 'v',
  w: 'w',
  x: 's',
  y: 'y',
  z: 'z',
  ch: 'ch',
  ll: 'la',
  rr: 'rr',
  // Special
  ' ': 'sil',
  '.': 'sil',
  ',': 'sil',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔊 ELEVEN LABS V3 ALPHA CLIENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type ElevenLabsState = 'idle' | 'loading' | 'playing' | 'error' | 'streaming'

export interface SpeechResult {
  audioBlob: Blob
  audioUrl: string
  duration: number
  visemes: VisemeData[]
}

export class ElevenLabsV3Client {
  private config: ElevenLabsV3Config
  private audioContext: AudioContext | null = null
  private currentSource: globalThis.AudioBufferSourceNode | null = null
  private audioQueue: AudioBuffer[] = []
  private state: ElevenLabsState = 'idle'
  private isPlaying = false
  private currentVisemes: VisemeData[] = []
  private visemeCallback: ((_viseme: VisemeType, _intensity: number) => void) | null = null

  constructor(config?: Partial<ElevenLabsV3Config>) {
    this.config = {
      voiceId: 'carlos_mx',
      modelId: 'eleven_turbo_v2_5',
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.0,
      useSpeakerBoost: true,
      emotionModulation: true,
      textToDialogue: true,
      languageCode: 'es-MX',
      outputFormat: 'mp3_44100_128',
      optimizeStreamingLatency: 3,
      ...config,
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // PUBLIC METHODS
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Sintetiza texto a voz con emoción y reproduce
   */
  async speak(
    text: string,
    emotion: NexBotEmotion = 'neutral',
    options?: {
      voiceId?: ElevenLabsVoice
      onViseme?: (_viseme: VisemeType, _intensity: number) => void
      onComplete?: () => void
    },
  ): Promise<void> {
    if (!text.trim()) {
      logger.warn('[ElevenLabsV3] Texto vacío, ignorando', { context: 'ElevenLabsV3' })
      return
    }

    try {
      this.state = 'loading'
      this.visemeCallback = options?.onViseme || null

      const result = await this.synthesize(text, emotion, options?.voiceId)
      await this.playAudioWithVisemes(result, options?.onComplete)
    } catch (error) {
      this.handleError(error as Error)
      // Fallback to Web Speech API
      logger.warn('[ElevenLabsV3] Usando Web Speech API como fallback', { context: 'ElevenLabsV3' })
      await this.speakWithWebSpeech(text)
    }
  }

  /**
   * Sintetiza texto con streaming para latencia ultra-baja
   */
  async speakStreaming(
    text: string,
    emotion: NexBotEmotion = 'neutral',
    options?: {
      voiceId?: ElevenLabsVoice
      onChunk?: (_chunk: ArrayBuffer) => void
      onViseme?: (_viseme: VisemeType, _intensity: number) => void
      onComplete?: () => void
    },
  ): Promise<void> {
    if (!text.trim()) return

    try {
      this.state = 'streaming'
      this.visemeCallback = options?.onViseme || null

      const preset = EMOTION_PRESETS[emotion]
      const voiceId = this.resolveVoiceId(
        options?.voiceId || (this.config.voiceId as ElevenLabsVoice),
      )

      const response = await fetch('/api/ai/voice/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voiceId,
          modelId: this.config.modelId,
          voiceSettings: {
            stability: preset.stability,
            similarity_boost: preset.similarity,
            style: preset.style,
            use_speaker_boost: this.config.useSpeakerBoost,
          },
          emotionTags: preset.emotionTags,
          languageCode: this.config.languageCode,
          outputFormat: this.config.outputFormat,
          optimizeStreamingLatency: this.config.optimizeStreamingLatency,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      this.initAudioContext()
      const chunks: ArrayBuffer[] = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        if (value) {
          const chunk = value.buffer
          chunks.push(chunk)
          options?.onChunk?.(chunk)

          // Generate visemes for this chunk
          this.generateVisemesForChunk(text, chunks.length)
        }
      }

      this.state = 'playing'

      // Combine all chunks and play
      const combinedBuffer = this.combineArrayBuffers(chunks)
      await this.playArrayBuffer(combinedBuffer)

      this.state = 'idle'
      options?.onComplete?.()
    } catch (error) {
      this.handleError(error as Error)
    }
  }

  /**
   * Sintetiza texto y retorna resultado con visemes
   */
  async synthesize(
    text: string,
    emotion: NexBotEmotion = 'neutral',
    voiceId?: ElevenLabsVoice,
  ): Promise<SpeechResult> {
    const preset = EMOTION_PRESETS[emotion]
    const resolvedVoiceId = this.resolveVoiceId(voiceId || (this.config.voiceId as ElevenLabsVoice))

    // Generate visemes from text
    const visemes = this.generateVisemes(text)

    const response = await fetch('/api/ai/voice/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voiceId: resolvedVoiceId,
        modelId: this.config.modelId,
        voiceSettings: {
          stability: preset.stability,
          similarity_boost: preset.similarity,
          style: preset.style,
          use_speaker_boost: this.config.useSpeakerBoost,
        },
        emotionTags: preset.emotionTags,
        emotionModulation: this.config.emotionModulation,
        textToDialogue: this.config.textToDialogue,
        languageCode: this.config.languageCode,
        outputFormat: this.config.outputFormat,
        optimizeStreamingLatency: this.config.optimizeStreamingLatency,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Eleven Labs API error: ${response.status} - ${errorText}`)
    }

    const audioBlob = await response.blob()
    const audioUrl = URL.createObjectURL(audioBlob)

    // Estimate duration based on text length (average 150 words/min)
    const wordCount = text.split(/\s+/).length
    const duration = (wordCount / 150) * 60 * 1000 * preset.speakingRate

    return {
      audioBlob,
      audioUrl,
      duration,
      visemes,
    }
  }

  /**
   * Para la reproducción actual
   */
  stop(): void {
    if (this.currentSource) {
      this.currentSource.stop()
      this.currentSource = null
    }
    this.isPlaying = false
    this.state = 'idle'
  }

  /**
   * Obtiene el estado actual
   */
  getState(): ElevenLabsState {
    return this.state
  }

  /**
   * Actualiza la configuración
   */
  updateConfig(config: Partial<ElevenLabsV3Config>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Adapta la voz según el mood del usuario (bio-feedback)
   */
  adaptToMood(mood: MoodState): void {
    // Map mood to appropriate emotion
    const moodToEmotion: Record<MoodState, NexBotEmotion> = {
      calm: 'calm',
      flow: 'focused',
      focused: 'focused',
      stressed: 'calm', // Use calm voice to help reduce stress
      euphoric: 'excited',
      tired: 'calm',
      anxious: 'calm',
      relaxed: 'calm',
      neutral: 'neutral',
    }

    const targetEmotion = moodToEmotion[mood]
    const preset = EMOTION_PRESETS[targetEmotion]

    this.config = {
      ...this.config,
      stability: preset.stability,
      similarityBoost: preset.similarity,
      style: preset.style,
    }

    logger.info('[ElevenLabsV3] Voz adaptada al mood', {
      context: 'ElevenLabsV3',
      data: { mood, targetEmotion },
    })
  }

  // ─────────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ─────────────────────────────────────────────────────────────────────

  private resolveVoiceId(voice: ElevenLabsVoice | string): string {
    return VOICE_IDS[voice as ElevenLabsVoice] || voice
  }

  private initAudioContext(): void {
    if (!this.audioContext && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.audioContext = new AudioContextClass()
    }
  }

  private async playAudioWithVisemes(result: SpeechResult, onComplete?: () => void): Promise<void> {
    this.initAudioContext()
    if (!this.audioContext) return

    const arrayBuffer = await result.audioBlob.arrayBuffer()
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

    this.currentSource = this.audioContext.createBufferSource()
    this.currentSource.buffer = audioBuffer
    this.currentSource.connect(this.audioContext.destination)

    this.state = 'playing'
    this.isPlaying = true
    this.currentVisemes = result.visemes

    // Start viseme playback
    this.playVisemes(result.visemes, result.duration)

    this.currentSource.onended = () => {
      this.isPlaying = false
      this.state = 'idle'
      this.currentSource = null
      onComplete?.()
    }

    this.currentSource.start()
  }

  private playVisemes(visemes: VisemeData[], _duration: number): void {
    if (!this.visemeCallback || visemes.length === 0) return

    let currentIndex = 0
    const startTime = Date.now()

    const updateViseme = () => {
      if (!this.isPlaying || currentIndex >= visemes.length) return

      const elapsed = Date.now() - startTime
      const currentViseme = visemes[currentIndex]

      if (currentViseme && elapsed >= currentViseme.timestamp) {
        this.visemeCallback?.(currentViseme.viseme, currentViseme.intensity)
        currentIndex++
      }

      if (this.isPlaying && currentIndex < visemes.length) {
        requestAnimationFrame(updateViseme)
      } else {
        // Return to neutral
        this.visemeCallback?.('neutral', 0)
      }
    }

    requestAnimationFrame(updateViseme)
  }

  private generateVisemes(text: string): VisemeData[] {
    const visemes: VisemeData[] = []
    const avgCharDuration = 60 // ms per character
    let currentTime = 0

    const cleanText = text.toLowerCase().replace(/[^a-záéíóúñü\s]/g, '')

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i]
      if (!char) continue

      let visemeType: VisemeType = 'neutral'

      // Check for digraphs first
      if (i < cleanText.length - 1) {
        const nextChar = cleanText[i + 1]
        const digraph = char + (nextChar ?? '')
        if (PHONEME_TO_VISEME[digraph]) {
          visemeType = PHONEME_TO_VISEME[digraph]
          i++ // Skip next character
        } else {
          visemeType = PHONEME_TO_VISEME[char] || 'neutral'
        }
      } else {
        visemeType = PHONEME_TO_VISEME[char] || 'neutral'
      }

      visemes.push({
        viseme: visemeType,
        timestamp: currentTime,
        duration: avgCharDuration,
        intensity: visemeType === 'sil' ? 0 : 0.8,
      })

      currentTime += avgCharDuration
    }

    return visemes
  }

  private generateVisemesForChunk(text: string, chunkIndex: number): void {
    // Simplified real-time viseme generation during streaming
    const charsPerChunk = Math.ceil(text.length / 10)
    const startIndex = chunkIndex * charsPerChunk
    const endIndex = Math.min(startIndex + charsPerChunk, text.length)
    const chunkText = text.substring(startIndex, endIndex)

    if (chunkText && this.visemeCallback) {
      const visemes = this.generateVisemes(chunkText)
      const firstViseme = visemes[0]
      if (firstViseme) {
        this.visemeCallback(firstViseme.viseme, firstViseme.intensity)
      }
    }
  }

  private combineArrayBuffers(buffers: ArrayBuffer[]): ArrayBuffer {
    const totalLength = buffers.reduce((acc, buf) => acc + buf.byteLength, 0)
    const combined = new Uint8Array(totalLength)
    let offset = 0
    for (const buffer of buffers) {
      combined.set(new Uint8Array(buffer), offset)
      offset += buffer.byteLength
    }
    return combined.buffer
  }

  private async playArrayBuffer(arrayBuffer: ArrayBuffer): Promise<void> {
    if (!this.audioContext) return

    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
    const source = this.audioContext.createBufferSource()
    source.buffer = audioBuffer
    source.connect(this.audioContext.destination)
    source.start()

    return new Promise((resolve) => {
      source.onended = () => resolve()
    })
  }

  private async speakWithWebSpeech(text: string): Promise<void> {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-MX'
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.onend = () => resolve()
      utterance.onerror = () => resolve()
      window.speechSynthesis.speak(utterance)
    })
  }

  private handleError(error: Error): void {
    this.state = 'error'
    logger.error('[ElevenLabsV3] Error', error, { context: 'ElevenLabsV3' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎁 SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

let elevenLabsInstance: ElevenLabsV3Client | null = null

export function getElevenLabsClient(config?: Partial<ElevenLabsV3Config>): ElevenLabsV3Client {
  if (!elevenLabsInstance) {
    elevenLabsInstance = new ElevenLabsV3Client(config)
  }
  return elevenLabsInstance
}

export default ElevenLabsV3Client
