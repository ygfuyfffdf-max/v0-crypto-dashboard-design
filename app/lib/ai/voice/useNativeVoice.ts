/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎤 USE NATIVE VOICE — Hook de Voz Nativo (Web Speech API)
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Hook optimizado que usa SOLO APIs nativas del navegador:
 * - SpeechRecognition (STT) - Chrome, Edge, Safari
 * - SpeechSynthesis (TTS) - Todos los navegadores modernos
 *
 * NO requiere APIs externas ni keys.
 *
 * @version 1.0.0
 * @author CHRONOS Team
 * ═══════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { logger } from '@/app/lib/utils/logger'
import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface UseNativeVoiceOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  voiceName?: string
  pitch?: number
  rate?: number
  volume?: number
  onTranscript?: (text: string, isFinal: boolean) => void
  onSpeakStart?: () => void
  onSpeakEnd?: () => void
  onError?: (error: Error) => void
}

export interface UseNativeVoiceReturn {
  // Estado
  isListening: boolean
  isSpeaking: boolean
  isSupported: boolean
  transcript: string
  interimTranscript: string
  error: Error | null
  availableVoices: SpeechSynthesisVoice[]

  // Acciones
  startListening: () => void
  stopListening: () => void
  speak: (text: string) => void
  stopSpeaking: () => void
  resetTranscript: () => void
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_LANG = 'es-MX'

// Voces preferidas para español (en orden de preferencia)
const PREFERRED_SPANISH_VOICES = [
  'Microsoft Sabina',
  'Google español',
  'Paulina',
  'Monica',
  'Jorge',
  'es-MX',
  'es-ES',
  'Spanish',
]

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function useNativeVoice(options: UseNativeVoiceOptions = {}): UseNativeVoiceReturn {
  const {
    lang = DEFAULT_LANG,
    continuous = false,
    interimResults = true,
    voiceName,
    pitch = 1,
    rate = 1,
    volume = 1,
    onTranscript,
    onSpeakStart,
    onSpeakEnd,
    onError,
  } = options

  // ─────────────────────────────────────────────────────────────────────
  // ESTADO
  // ─────────────────────────────────────────────────────────────────────

  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState<Error | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isSupported, setIsSupported] = useState(false)

  // Refs
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // ─────────────────────────────────────────────────────────────────────
  // INICIALIZACIÓN
  // ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Verificar soporte de Speech Recognition
    const SpeechRecognitionAPI =
      window.SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition })
        .webkitSpeechRecognition

    const hasSpeechRecognition = Boolean(SpeechRecognitionAPI)
    const hasSpeechSynthesis = 'speechSynthesis' in window

    setIsSupported(hasSpeechRecognition && hasSpeechSynthesis)

    // Inicializar Speech Synthesis
    if (hasSpeechSynthesis) {
      synthRef.current = window.speechSynthesis

      // Cargar voces (puede tardar un momento)
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || []
        setAvailableVoices(voices)
        logger.info('[useNativeVoice] Voces cargadas', {
          context: 'useNativeVoice',
          data: { count: voices.length },
        })
      }

      // Las voces pueden no estar disponibles inmediatamente
      loadVoices()
      if (synthRef.current?.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices
      }
    }

    // Cleanup
    return () => {
      recognitionRef.current?.stop()
      synthRef.current?.cancel()
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────
  // SPEECH RECOGNITION (STT)
  // ─────────────────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (!isSupported) {
      const err = new Error('Speech Recognition no soportado en este navegador')
      setError(err)
      onError?.(err)
      return
    }

    // Detener cualquier reconocimiento previo
    recognitionRef.current?.stop()

    const SpeechRecognitionAPI =
      window.SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: typeof SpeechRecognition })
        .webkitSpeechRecognition

    const recognition = new SpeechRecognitionAPI()

    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      logger.info('[useNativeVoice] Escuchando...', { context: 'useNativeVoice' })
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ''
      let interim = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result || result.length === 0) continue
        const transcript = result[0]?.transcript ?? ''
        if (result.isFinal) {
          finalTranscript += transcript
        } else {
          interim += transcript
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => (prev ? `${prev} ${finalTranscript}` : finalTranscript))
        setInterimTranscript('')
        onTranscript?.(finalTranscript, true)
      } else {
        setInterimTranscript(interim)
        onTranscript?.(interim, false)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const err = new Error(`Error de reconocimiento: ${event.error}`)
      setError(err)
      setIsListening(false)
      onError?.(err)
      logger.error('[useNativeVoice] Error STT', err, { context: 'useNativeVoice' })
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript('')

      // Si es continuo y no hay error, reiniciar
      if (continuous && !error) {
        recognition.start()
      }
    }

    recognitionRef.current = recognition

    try {
      recognition.start()
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error al iniciar reconocimiento')
      setError(error)
      onError?.(error)
    }
  }, [isSupported, lang, continuous, interimResults, error, onTranscript, onError])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  // ─────────────────────────────────────────────────────────────────────
  // SPEECH SYNTHESIS (TTS)
  // ─────────────────────────────────────────────────────────────────────

  const findBestVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (!availableVoices.length) return null

    // Si se especificó un nombre de voz, buscarlo
    if (voiceName) {
      const exactMatch = availableVoices.find((v) =>
        v.name.toLowerCase().includes(voiceName.toLowerCase()),
      )
      if (exactMatch) return exactMatch
    }

    // Buscar voz en español preferida
    for (const preferred of PREFERRED_SPANISH_VOICES) {
      const match = availableVoices.find(
        (v) =>
          v.name.toLowerCase().includes(preferred.toLowerCase()) ||
          v.lang.toLowerCase().includes(preferred.toLowerCase()),
      )
      if (match) return match
    }

    // Fallback: cualquier voz en español
    const spanishVoice = availableVoices.find(
      (v) => v.lang.startsWith('es') || v.lang.includes('Spanish'),
    )
    if (spanishVoice) return spanishVoice

    // Último fallback: primera voz disponible
    return availableVoices[0] ?? null
  }, [availableVoices, voiceName])

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current) {
        const err = new Error('Speech Synthesis no disponible')
        setError(err)
        onError?.(err)
        return
      }

      // Cancelar cualquier síntesis previa
      synthRef.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)

      // Configurar voz
      const voice = findBestVoice()
      if (voice) {
        utterance.voice = voice
        utterance.lang = voice.lang
      } else {
        utterance.lang = lang
      }

      // Configurar parámetros
      utterance.pitch = pitch
      utterance.rate = rate
      utterance.volume = volume

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true)
        onSpeakStart?.()
        logger.info('[useNativeVoice] Hablando...', {
          context: 'useNativeVoice',
          data: { voice: voice?.name, text: text.substring(0, 50) },
        })
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        onSpeakEnd?.()
      }

      utterance.onerror = (event) => {
        const err = new Error(`Error de síntesis: ${event.error}`)
        setError(err)
        setIsSpeaking(false)
        onError?.(err)
        logger.error('[useNativeVoice] Error TTS', err, { context: 'useNativeVoice' })
      }

      utteranceRef.current = utterance
      synthRef.current.speak(utterance)
    },
    [findBestVoice, lang, pitch, rate, volume, onSpeakStart, onSpeakEnd, onError],
  )

  const stopSpeaking = useCallback(() => {
    synthRef.current?.cancel()
    setIsSpeaking(false)
  }, [])

  // ─────────────────────────────────────────────────────────────────────
  // UTILIDADES
  // ─────────────────────────────────────────────────────────────────────

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  // ─────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────

  return {
    // Estado
    isListening,
    isSpeaking,
    isSupported,
    transcript,
    interimTranscript,
    error,
    availableVoices,

    // Acciones
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    resetTranscript,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS GLOBALES PARA WEB SPEECH API
// ═══════════════════════════════════════════════════════════════════════════════

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

export default useNativeVoice
