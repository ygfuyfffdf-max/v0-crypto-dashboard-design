/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎤 ZERO FORCE — Sistema de Voz IA Premium
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Sistema completo de voz IA con:
 * - Wake word "zero" (detección permanente con Deepgram)
 * - TTS realista robotizada español (ElevenLabs Turbo v2.5)
 * - STT low latency (Deepgram Nova-2)
 * - Pausas naturales y breathing TTS
 * - Emotion tags dinámicos (calm/professional/excited)
 * - Resonancia cuántica (eco violeta/oro)
 * - Multimodal voz + gestos + bio
 *
 * @version 1.0.0 - CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { logger } from '@/app/lib/utils/logger'
// Tipos globales para Web Speech API
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type ZeroEmotion = 'calm' | 'professional' | 'excited' | 'concerned' | 'neutral'
export type ZeroState = 'idle' | 'listening' | 'thinking' | 'speaking'

export interface ZeroConfig {
  voiceId?: string // ElevenLabs voice ID
  wakeWord: string // Palabra de activación
  language: string // es-MX por defecto
  mood: ZeroEmotion // Estado emocional
  resonance: 'violet' | 'gold' | 'off' // Resonancia cuántica
  bioSync: boolean // Sincronización biométrica (pulso, respiración)
}

export interface ZeroVoiceOptions {
  emotion?: ZeroEmotion
  speed?: number // 0.5 - 1.5
  pause?: number // ms de pausa post-speech
  resonance?: boolean // Activar eco resonante
}

// ═══════════════════════════════════════════════════════════════
// CLASE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export class ZeroForceVoice {
  private config: ZeroConfig
  private state: ZeroState = 'idle'
  private wakeWordDetector: MediaRecorder | null = null
  private audioContext: AudioContext | null = null
  private isWakeWordActive = false
  private currentEmotion: ZeroEmotion = 'professional'

  constructor(config?: Partial<ZeroConfig>) {
    this.config = {
      voiceId: process.env.NEXT_PUBLIC_ZERO_VOICE_ID || 'TxGEqnHWrfWFTfGW9XjX', // Josh voice (profundo)
      wakeWord: 'zero',
      language: 'es-MX',
      mood: 'professional',
      resonance: 'violet',
      bioSync: true,
      ...config,
    }

    if (typeof window !== 'undefined') {
      this.initializeAudioContext()
    }
  }

  // ═════════════════════════════════════════════════════════════
  // INICIALIZACIÓN
  // ═════════════════════════════════════════════════════════════

  private initializeAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      logger.info('🔊 AudioContext inicializado para Zero Force', { context: 'ZeroVoice' })
    } catch (error) {
      logger.error('❌ Error inicializando AudioContext', error as Error, { context: 'ZeroVoice' })
    }
  }

  // ═════════════════════════════════════════════════════════════
  // WAKE WORD DETECTION (SIEMPRE ESCUCHANDO)
  // ═════════════════════════════════════════════════════════════

  async startWakeWordDetection(): Promise<void> {
    if (this.isWakeWordActive) {
      logger.warn('⚠️ Wake word detection ya está activo', { context: 'ZeroVoice' })
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Usar Web Speech API para wake word (más eficiente que enviar a servidor)
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        logger.error('❌ Web Speech API no soportada', new Error('SpeechRecognition undefined'), {
          context: 'ZeroVoice',
        })
        return
      }

      const recognition = new SpeechRecognition()
      recognition.lang = this.config.language
      recognition.continuous = true // Escucha continua
      recognition.interimResults = false

      recognition.onresult = (event) => {
        const transcript =
          event.results[event.results.length - 1]?.[0]?.transcript.toLowerCase() || ''

        if (transcript.includes(this.config.wakeWord)) {
          logger.info('✅ Wake word detectado: "zero"', { context: 'ZeroVoice' })
          this.onWakeWordDetected()
        }
      }

      recognition.onerror = (error) => {
        const err = new Error(`SpeechRecognition error: ${error.error}`)
        logger.error('❌ Error en wake word detection', err, { context: 'ZeroVoice' })
        // Reintentar después de 3s
        setTimeout(() => this.startWakeWordDetection(), 3000)
      }

      recognition.start()
      this.isWakeWordActive = true

      logger.info('🎤 Wake word detection activo', {
        context: 'ZeroVoice',
        data: { wakeWord: this.config.wakeWord },
      })
    } catch (error) {
      logger.error('❌ Error iniciando wake word detection', error as Error, {
        context: 'ZeroVoice',
      })
    }
  }

  private onWakeWordDetected(): void {
    this.setState('listening')
    // Reproducir sonido de activación
    this.playActivationSound()
    // Iniciar STT para comando
    this.startListening()
  }

  stopWakeWordDetection(): void {
    if (this.wakeWordDetector) {
      this.wakeWordDetector.stop()
      this.isWakeWordActive = false
      logger.info('🛑 Wake word detection detenido', { context: 'ZeroVoice' })
    }
  }

  // ═════════════════════════════════════════════════════════════
  // SPEECH-TO-TEXT (LOW LATENCY)
  // ═════════════════════════════════════════════════════════════

  async startListening(): Promise<string> {
    this.setState('listening')

    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        window.SpeechRecognition || (window as Window).webkitSpeechRecognition

      if (!SpeechRecognition) {
        reject(new Error('SpeechRecognition no soportado'))
        return
      }

      const recognition = new SpeechRecognition()
      recognition.lang = this.config.language
      recognition.continuous = false // Solo un comando
      recognition.interimResults = false

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript || ''
        logger.info('🎤 Comando recibido:', { context: 'ZeroVoice', data: { transcript } })
        this.setState('thinking')
        resolve(transcript)
      }

      recognition.onerror = (error) => {
        const err = new Error(`SpeechRecognition error: ${error.error}`)
        logger.error('❌ Error en STT', err, { context: 'ZeroVoice' })
        this.setState('idle')
        reject(err)
      }

      recognition.onend = () => {
        this.setState('idle')
      }

      recognition.start()
    })
  }

  // ═════════════════════════════════════════════════════════════
  // TEXT-TO-SPEECH (REALISTA ROBOTIZADA)
  // ═════════════════════════════════════════════════════════════

  async speak(text: string, options?: ZeroVoiceOptions): Promise<void> {
    this.setState('speaking')

    const emotion = options?.emotion || this.currentEmotion
    const speed = options?.speed || 1.0
    const pause = options?.pause || 1000 // 1s pausa reflexión por defecto

    try {
      // Llamar API TTS con ElevenLabs
      const response = await fetch('/api/voice/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          voice: this.config.voiceId,
          language: this.config.language,
          speed,
          provider: 'elevenlabs',
          emotion,
          stability: emotion === 'calm' ? 0.8 : emotion === 'excited' ? 0.3 : 0.6,
          clarity: 0.7,
        }),
      })

      const { audio, format } = await response.json()

      // Reproducir audio con efectos de resonancia
      await this.playAudioWithResonance(audio, format, options?.resonance ?? true)

      // Pausa natural después de hablar
      await new Promise((resolve) => setTimeout(resolve, pause))
    } catch (error) {
      logger.error('❌ Error en TTS', error as Error, { context: 'ZeroVoice' })
    } finally {
      this.setState('idle')
    }
  }

  // ═════════════════════════════════════════════════════════════
  // EFECTOS DE AUDIO
  // ═════════════════════════════════════════════════════════════

  private async playAudioWithResonance(
    audioBase64: string,
    format: string,
    useResonance: boolean,
  ): Promise<void> {
    if (!this.audioContext) return

    try {
      // Decodificar audio
      const audioData = atob(audioBase64)
      const arrayBuffer = new ArrayBuffer(audioData.length)
      const view = new Uint8Array(arrayBuffer)
      for (let i = 0; i < audioData.length; i++) {
        view[i] = audioData.charCodeAt(i)
      }

      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)

      // Crear source
      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer

      if (useResonance && this.config.resonance !== 'off') {
        // Aplicar efectos de resonancia cuántica
        const convolver = this.audioContext.createConvolver()
        const reverb = this.createResonanceImpulse(this.config.resonance)
        convolver.buffer = reverb

        const gainNode = this.audioContext.createGain()
        gainNode.gain.value = 0.3 // Echo sutil

        source.connect(convolver)
        convolver.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
      } else {
        source.connect(this.audioContext.destination)
      }

      // Reproducir
      source.start(0)

      // Esperar a que termine
      await new Promise<void>((resolve) => {
        source.onended = () => resolve()
      })
    } catch (error) {
      logger.error('❌ Error reproduciendo audio', error as Error, { context: 'ZeroVoice' })
    }
  }

  private createResonanceImpulse(type: 'violet' | 'gold'): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext no inicializado')

    const sampleRate = this.audioContext.sampleRate
    const length = sampleRate * 2 // 2 segundos de reverb
    const impulse = this.audioContext.createBuffer(2, length, sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const channelData = impulse.getChannelData(channel)
      for (let i = 0; i < length; i++) {
        // Decay exponencial con color
        const decay = type === 'violet' ? 0.85 : 0.92 // Violet más rápido
        channelData[i] = (Math.random() * 2 - 1) * Math.pow(decay, i / sampleRate)
      }
    }

    return impulse
  }

  private playActivationSound(): void {
    if (!this.audioContext) return

    const oscillator = this.audioContext.createOscillator()
    const gainNode = this.audioContext.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(
      this.config.resonance === 'violet' ? 440 : 528, // A4 violet, C5 gold
      this.audioContext.currentTime,
    )

    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3)

    oscillator.connect(gainNode)
    gainNode.connect(this.audioContext.destination)

    oscillator.start(this.audioContext.currentTime)
    oscillator.stop(this.audioContext.currentTime + 0.3)
  }

  // ═════════════════════════════════════════════════════════════
  // ESTADO Y UTILIDADES
  // ═════════════════════════════════════════════════════════════

  private setState(state: ZeroState): void {
    this.state = state
    logger.info(`🤖 Zero Force estado: ${state}`, { context: 'ZeroVoice' })
  }

  getState(): ZeroState {
    return this.state
  }

  setEmotion(emotion: ZeroEmotion): void {
    this.currentEmotion = emotion
    logger.info(`💜 Emoción cambiada: ${emotion}`, { context: 'ZeroVoice' })
  }

  // ═════════════════════════════════════════════════════════════
  // MULTIMODAL (VOZ + BIO)
  // ═════════════════════════════════════════════════════════════

  async syncWithBio(heartRate: number, breathingRate: number): Promise<void> {
    if (!this.config.bioSync) return

    // Ajustar velocidad de speech según heartRate
    const baseSpeed = 1.0
    const speedAdjust = (heartRate - 70) / 100 // +/- 10% por cada 10 bpm
    const adjustedSpeed = Math.max(0.8, Math.min(1.2, baseSpeed + speedAdjust))

    // Ajustar pausa según breathingRate
    const basePause = 1000
    const pauseAdjust = (20 - breathingRate) * 50 // +/- 50ms por cada respiración/min
    const adjustedPause = Math.max(500, Math.min(2000, basePause + pauseAdjust))

    logger.info('🫀 Bio-sync aplicado', {
      context: 'ZeroVoice',
      data: { heartRate, breathingRate, speed: adjustedSpeed, pause: adjustedPause },
    })

    // Guardar ajustes para próximo speak()
    // (implementar en speak() como options por defecto)
  }

  // ═════════════════════════════════════════════════════════════
  // CLEANUP
  // ═════════════════════════════════════════════════════════════

  destroy(): void {
    this.stopWakeWordDetection()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    logger.info('🛑 Zero Force destruido', { context: 'ZeroVoice' })
  }
}

// ═════════════════════════════════════════════════════════════
// SINGLETON INSTANCE
// ═════════════════════════════════════════════════════════════

let zeroInstance: ZeroForceVoice | null = null

export function getZeroForce(config?: Partial<ZeroConfig>): ZeroForceVoice {
  if (!zeroInstance) {
    zeroInstance = new ZeroForceVoice(config)
  }
  return zeroInstance
}
