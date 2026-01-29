/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎤 USE ZERO VOICE — Hook de Reconocimiento de Voz con Wake Word
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hook para:
 * - Wake word detection ("Zero", "Chronos")
 * - Speech-to-Text en español
 * - Text-to-Speech con voz neural
 * - Visualización de audio reactivo
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { logger } from '@/app/lib/utils/logger'
import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface VoiceState {
  isListening: boolean
  isWakeWordActive: boolean
  isSpeaking: boolean
  isProcessing: boolean
  transcript: string
  confidence: number
  error: string | null
  audioLevel: number
}

export interface UseZeroVoiceOptions {
  wakeWords?: string[]
  language?: string
  continuous?: boolean
  onWakeWord?: () => void
  onTranscript?: (_transcript: string, _isFinal: boolean) => void
  onError?: (_error: string) => void
  autoRestart?: boolean
}

export interface UseZeroVoiceReturn {
  state: VoiceState
  startListening: () => void
  stopListening: () => void
  speak: (_text: string, _options?: SpeakOptions) => Promise<void>
  stopSpeaking: () => void
  toggleWakeWord: () => void
  audioAnalyser: AnalyserNode | null
}

export interface SpeakOptions {
  rate?: number
  pitch?: number
  volume?: number
  voice?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_WAKE_WORDS = ['zero', 'chronos', 'cero', 'oye zero', 'hey zero']
const DEFAULT_LANGUAGE = 'es-MX'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useZeroVoice(options: UseZeroVoiceOptions = {}): UseZeroVoiceReturn {
  const {
    wakeWords = DEFAULT_WAKE_WORDS,
    language = DEFAULT_LANGUAGE,
    continuous = true,
    onWakeWord,
    onTranscript,
    onError,
    autoRestart = true,
  } = options

  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isWakeWordActive: false,
    isSpeaking: false,
    isProcessing: false,
    transcript: '',
    confidence: 0,
    error: null,
    audioLevel: 0,
  })

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // AUDIO ANALYSIS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  const setupAudioAnalysis = useCallback(async () => {
    try {
      if (typeof window === 'undefined') return

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256

      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)

      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)

      const updateLevel = () => {
        if (!analyserRef.current) return

        analyserRef.current.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        const normalizedLevel = Math.min(average / 128, 1)

        setState((prev) => ({ ...prev, audioLevel: normalizedLevel }))
        animationFrameRef.current = requestAnimationFrame(updateLevel)
      }

      updateLevel()
    } catch (error) {
      logger.error('Error setting up audio analysis', error, { context: 'useZeroVoice' })
    }
  }, [])

  const cleanupAudioAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // SPEECH RECOGNITION
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return null

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      logger.warn('Speech recognition not supported', { context: 'useZeroVoice' })
      return null
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = language
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setState((prev) => ({ ...prev, isListening: true, error: null }))
      logger.info('Speech recognition started', { context: 'useZeroVoice' })
    }

    recognition.onend = () => {
      setState((prev) => ({ ...prev, isListening: false }))

      // Auto-restart si está habilitado y wake word está activo
      if (autoRestart && state.isWakeWordActive && recognitionRef.current) {
        setTimeout(() => {
          try {
            recognitionRef.current?.start()
          } catch {
            // Ignorar si ya está corriendo
          }
        }, 100)
      }
    }

    recognition.onerror = (event) => {
      const errorMsg =
        event.error === 'no-speech'
          ? 'No se detectó voz'
          : `Error de reconocimiento: ${event.error}`

      setState((prev) => ({ ...prev, error: errorMsg }))
      onError?.(errorMsg)

      if (event.error !== 'no-speech') {
        logger.error('Speech recognition error', new Error(event.error), {
          context: 'useZeroVoice',
        })
      }
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''
      let confidence = 0

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result || !result[0]) continue

        const transcript = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcript
          confidence = result[0].confidence ?? 0
        } else {
          interimTranscript += transcript
        }
      }

      const fullTranscript = finalTranscript || interimTranscript
      const lowerTranscript = fullTranscript.toLowerCase().trim()

      setState((prev) => ({
        ...prev,
        transcript: fullTranscript,
        confidence,
        isProcessing: !finalTranscript,
      }))

      // Detectar wake word
      if (state.isWakeWordActive) {
        for (const wakeWord of wakeWords) {
          if (lowerTranscript.includes(wakeWord)) {
            logger.info('Wake word detected', { context: 'useZeroVoice', data: { wakeWord } })
            onWakeWord?.()

            // Remover wake word del transcript
            const cleanTranscript = lowerTranscript
              .replace(new RegExp(wakeWord + '\\s*,?\\s*', 'gi'), '')
              .trim()
            if (cleanTranscript) {
              onTranscript?.(cleanTranscript, !!finalTranscript)
            }
            return
          }
        }
      }

      // Sin wake word activo, enviar todo
      if (!state.isWakeWordActive && fullTranscript) {
        onTranscript?.(fullTranscript, !!finalTranscript)
      }
    }

    return recognition
  }, [
    continuous,
    language,
    wakeWords,
    state.isWakeWordActive,
    autoRestart,
    onWakeWord,
    onTranscript,
    onError,
  ])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // SPEECH SYNTHESIS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  const speak = useCallback(
    async (text: string, options: SpeakOptions = {}) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        logger.warn('Speech synthesis not supported', { context: 'useZeroVoice' })
        return
      }

      return new Promise<void>((resolve) => {
        // Cancelar cualquier utterance anterior
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = language
        utterance.rate = options.rate ?? 1.0
        utterance.pitch = options.pitch ?? 1.0
        utterance.volume = options.volume ?? 1.0

        // Buscar voz en español
        const voices = window.speechSynthesis.getVoices()
        const spanishVoice = voices.find((v) => v.lang.startsWith('es'))
        if (spanishVoice) {
          utterance.voice = spanishVoice
        }

        utterance.onstart = () => {
          setState((prev) => ({ ...prev, isSpeaking: true }))
        }

        utterance.onend = () => {
          setState((prev) => ({ ...prev, isSpeaking: false }))
          resolve()
        }

        utterance.onerror = () => {
          setState((prev) => ({ ...prev, isSpeaking: false }))
          resolve()
        }

        window.speechSynthesis.speak(utterance)
      })
    },
    [language],
  )

  const stopSpeaking = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setState((prev) => ({ ...prev, isSpeaking: false }))
    }
  }, [])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // CONTROLS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = initRecognition()
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
        setupAudioAnalysis()
      } catch {
        // Ya está corriendo
      }
    }
  }, [initRecognition, setupAudioAnalysis])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    cleanupAudioAnalysis()
    setState((prev) => ({ ...prev, isListening: false, audioLevel: 0 }))
  }, [cleanupAudioAnalysis])

  const toggleWakeWord = useCallback(() => {
    setState((prev) => {
      const newWakeWordState = !prev.isWakeWordActive

      if (newWakeWordState) {
        // Activar wake word - iniciar escucha continua
        startListening()
      }

      return { ...prev, isWakeWordActive: newWakeWordState }
    })
  }, [startListening])

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // EFFECTS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis

      // Cargar voces
      const loadVoices = () => {
        window.speechSynthesis.getVoices()
      }
      loadVoices()
      window.speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      stopListening()
      stopSpeaking()
    }
  }, [stopListening, stopSpeaking])

  return {
    state,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    toggleWakeWord,
    audioAnalyser: analyserRef.current,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES DECLARATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}
