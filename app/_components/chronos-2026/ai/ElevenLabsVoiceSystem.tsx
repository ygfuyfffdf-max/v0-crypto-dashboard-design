"use client"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎙️✨ ELEVENLABS VOICE SYSTEM — CHRONOS SUPREME 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de voz premium con ElevenLabs para síntesis de voz ultra realista.
 *
 * Características:
 * - Síntesis de voz con ElevenLabs API
 * - Múltiples voces disponibles
 * - Control de estabilidad y similaridad
 * - Streaming de audio
 * - Fallback a Web Speech API
 * - Reconocimiento de voz nativo
 *
 * @version 1.0.0 SUPREME
 * @author IY Supreme Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { useCallback, useEffect, useRef, useState } from "react"

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ElevenLabsConfig {
  apiKey: string
  voiceId?: string
  modelId?: string
  stability?: number
  similarityBoost?: number
  style?: number
  useSpeakerBoost?: boolean
}

export interface VoiceConfig {
  voice_id: string
  name: string
  preview_url: string
  category: "premade" | "cloned" | "generated"
  labels?: Record<string, string>
}

export interface SpeechState {
  isListening: boolean
  isSpeaking: boolean
  isLoading: boolean
  error: string | null
  transcript: string
  interimTranscript: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONSTANTES: Voces recomendadas de ElevenLabs
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ELEVENLABS_VOICES = {
  // Voces en español
  RACHEL: { id: "EXAVITQu4vr4xnSDxMaL", name: "Rachel", lang: "multilingual" },
  MATILDA: { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", lang: "multilingual" },
  ANTONI: { id: "ErXwobaYiN019PkySvjV", name: "Antoni", lang: "multilingual" },
  THOMAS: { id: "GBv7mTt0atIp3Br8iCZE", name: "Thomas", lang: "multilingual" },
  CHARLIE: { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", lang: "multilingual" },
  EMILY: { id: "LcfcDJNUP1GQjkzn1xUU", name: "Emily", lang: "multilingual" },
  ELLI: { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", lang: "multilingual" },
  CALLUM: { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum", lang: "multilingual" },
  PATRICK: { id: "ODq5zmih8GrVes37Dizd", name: "Patrick", lang: "multilingual" },
  HARRY: { id: "SOYHLrjzK2X1ezoPC6cr", name: "Harry", lang: "multilingual" },
  LILY: { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", lang: "multilingual" },
  SARAH: { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", lang: "multilingual" },
} as const

export const DEFAULT_VOICE = ELEVENLABS_VOICES.RACHEL

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Verifica si el navegador soporta Web Speech API
 */
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === "undefined") return false
  return "SpeechRecognition" in window || "webkitSpeechRecognition" in window
}

/**
 * Verifica si el navegador soporta síntesis de voz
 */
export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === "undefined") return false
  return "speechSynthesis" in window
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CLASE: ElevenLabsService - Servicio de síntesis de voz
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class ElevenLabsService {
  private apiKey: string
  private voiceId: string
  private modelId: string
  private settings: {
    stability: number
    similarity_boost: number
    style: number
    use_speaker_boost: boolean
  }
  private audioContext: AudioContext | null = null
  private currentAudio: HTMLAudioElement | null = null

  constructor(config: ElevenLabsConfig) {
    this.apiKey = config.apiKey
    this.voiceId = config.voiceId ?? DEFAULT_VOICE.id
    this.modelId = config.modelId ?? "eleven_multilingual_v2"
    this.settings = {
      stability: config.stability ?? 0.5,
      similarity_boost: config.similarityBoost ?? 0.75,
      style: config.style ?? 0.5,
      use_speaker_boost: config.useSpeakerBoost ?? true,
    }
  }

  /**
   * Sintetiza texto a voz
   */
  async speak(text: string): Promise<void> {
    // Cancelar audio anterior si existe
    this.stop()

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: this.modelId,
          voice_settings: this.settings,
        }),
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`)
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      return new Promise((resolve, reject) => {
        this.currentAudio = new Audio(audioUrl)

        this.currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          resolve()
        }

        this.currentAudio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl)
          this.currentAudio = null
          reject(error)
        }

        this.currentAudio.play().catch(reject)
      })
    } catch (error) {
      console.error("ElevenLabs speak error:", error)
      throw error
    }
  }

  /**
   * Síntesis con streaming (más rápida para textos largos)
   */
  async speakStream(text: string): Promise<void> {
    this.stop()

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: this.modelId,
            voice_settings: this.settings,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(`ElevenLabs stream error: ${response.status}`)
      }

      // Crear contexto de audio si no existe
      if (!this.audioContext) {
        this.audioContext = new AudioContext()
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error("No stream reader available")

      const chunks: Uint8Array[] = []
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }

      const audioData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
      let offset = 0
      for (const chunk of chunks) {
        audioData.set(chunk, offset)
        offset += chunk.length
      }

      const audioBuffer = await this.audioContext.decodeAudioData(audioData.buffer)
      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(this.audioContext.destination)
      source.start()

      return new Promise((resolve) => {
        source.onended = () => resolve()
      })
    } catch (error) {
      console.error("ElevenLabs stream error:", error)
      throw error
    }
  }

  /**
   * Detiene la reproducción actual
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio = null
    }
  }

  /**
   * Cambia la voz
   */
  setVoice(voiceId: string): void {
    this.voiceId = voiceId
  }

  /**
   * Actualiza configuración
   */
  updateSettings(settings: Partial<ElevenLabsConfig>): void {
    if (settings.stability !== undefined) this.settings.stability = settings.stability
    if (settings.similarityBoost !== undefined) {
      this.settings.similarity_boost = settings.similarityBoost
    }
    if (settings.style !== undefined) this.settings.style = settings.style
    if (settings.useSpeakerBoost !== undefined) {
      this.settings.use_speaker_boost = settings.useSpeakerBoost
    }
    if (settings.voiceId) this.voiceId = settings.voiceId
    if (settings.modelId) this.modelId = settings.modelId
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useElevenLabsVoice - Hook para síntesis de voz con ElevenLabs
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useElevenLabsVoice(config?: ElevenLabsConfig) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const serviceRef = useRef<ElevenLabsService | null>(null)
  const fallbackSpeaking = useRef(false)

  // Inicializar servicio si hay API key
  useEffect(() => {
    if (config?.apiKey) {
      serviceRef.current = new ElevenLabsService(config)
    }
  }, [config])

  /**
   * Sintetiza texto a voz
   */
  const speak = useCallback(async (text: string): Promise<void> => {
    setError(null)
    setIsLoading(true)

    try {
      // Intentar con ElevenLabs primero
      if (serviceRef.current) {
        setIsSpeaking(true)
        await serviceRef.current.speak(text)
        setIsSpeaking(false)
        setIsLoading(false)
        return
      }

      // Fallback a Web Speech API
      if (isSpeechSynthesisSupported()) {
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = "es-MX"
        utterance.rate = 1
        utterance.pitch = 1

        // Buscar voz en español si está disponible
        const voices = window.speechSynthesis.getVoices()
        const spanishVoice = voices.find(
          (v) =>
            v.lang.startsWith("es") && (v.name.includes("Mexico") || v.name.includes("Spanish"))
        )
        if (spanishVoice) {
          utterance.voice = spanishVoice
        }

        return new Promise<void>((resolve, reject) => {
          utterance.onstart = () => {
            setIsSpeaking(true)
            setIsLoading(false)
            fallbackSpeaking.current = true
          }
          utterance.onend = () => {
            setIsSpeaking(false)
            fallbackSpeaking.current = false
            resolve()
          }
          utterance.onerror = (e) => {
            setIsSpeaking(false)
            fallbackSpeaking.current = false
            reject(new Error(e.error))
          }
          window.speechSynthesis.speak(utterance)
        })
      }

      throw new Error("No speech synthesis available")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      setIsSpeaking(false)
      setIsLoading(false)
      throw err
    }
  }, [])

  /**
   * Detiene la reproducción
   */
  const stop = useCallback(() => {
    if (serviceRef.current) {
      serviceRef.current.stop()
    }
    if (fallbackSpeaking.current && isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setIsLoading(false)
  }, [])

  /**
   * Cambia la voz
   */
  const setVoice = useCallback((voiceId: string) => {
    if (serviceRef.current) {
      serviceRef.current.setVoice(voiceId)
    }
  }, [])

  return {
    speak,
    stop,
    setVoice,
    isSpeaking,
    isLoading,
    error,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useSpeechRecognition - Hook para reconocimiento de voz
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SpeechRecognitionOptions {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}) {
  const { lang = "es-MX", continuous = false, interimResults = true, onResult, onError } = options

  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Inicializar reconocimiento de voz
  useEffect(() => {
    if (!isSpeechRecognitionSupported()) {
      setError("Speech recognition not supported")
      return
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof window.SpeechRecognition })
        .webkitSpeechRecognition
    if (!SpeechRecognitionAPI) return

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = interimResults

    recognition.onresult = (event) => {
      let finalTranscript = ""
      let interim = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result?.[0]) {
          const text = result[0].transcript
          if (result.isFinal) {
            finalTranscript += text
          } else {
            interim += text
          }
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript)
        onResult?.(finalTranscript, true)
      }
      setInterimTranscript(interim)
      if (interim) {
        onResult?.(interim, false)
      }
    }

    recognition.onerror = (event) => {
      const errorMsg = (event as { error?: string }).error ?? "Unknown error"
      setError(errorMsg)
      setIsListening(false)
      onError?.(errorMsg)
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimTranscript("")
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [lang, continuous, interimResults, onResult, onError])

  /**
   * Inicia la escucha
   */
  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setError(null)
    setTranscript("")
    setInterimTranscript("")

    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch (err) {
      // Ya está escuchando
      if ((err as Error).message?.includes("already started")) {
        setIsListening(true)
      }
    }
  }, [])

  /**
   * Detiene la escucha
   */
  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    recognitionRef.current.stop()
    setIsListening(false)
  }, [])

  /**
   * Toggle listening
   */
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  return {
    isListening,
    transcript,
    interimTranscript,
    error,
    startListening,
    stopListening,
    toggleListening,
    isSupported: isSpeechRecognitionSupported(),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK: useVoiceAssistant - Hook combinado para asistente de voz completo
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VoiceAssistantOptions {
  elevenLabsConfig?: ElevenLabsConfig
  lang?: string
  onTranscript?: (text: string) => void
  onSpeakStart?: () => void
  onSpeakEnd?: () => void
}

export function useVoiceAssistant(options: VoiceAssistantOptions = {}) {
  const { elevenLabsConfig, lang = "es-MX", onTranscript, onSpeakStart, onSpeakEnd } = options

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isLoading: isSpeakingLoading,
  } = useElevenLabsVoice(elevenLabsConfig)

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    isSupported: isRecognitionSupported,
  } = useSpeechRecognition({
    lang,
    onResult: (text, isFinal) => {
      if (isFinal) {
        onTranscript?.(text)
      }
    },
  })

  // Callbacks para speak
  const speakWithCallbacks = useCallback(
    async (text: string) => {
      onSpeakStart?.()
      await speak(text)
      onSpeakEnd?.()
    },
    [speak, onSpeakStart, onSpeakEnd]
  )

  return {
    // Síntesis
    speak: speakWithCallbacks,
    stopSpeaking,
    isSpeaking,
    isSpeakingLoading,

    // Reconocimiento
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    toggleListening,
    isRecognitionSupported,

    // Estado general
    isProcessing: isSpeaking || isSpeakingLoading || isListening,
  }
}

export default useVoiceAssistant
