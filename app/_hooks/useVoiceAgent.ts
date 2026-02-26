// @ts-nocheck
// 🎤 VOICE AGENT HOOK - CHRONOS INFINITY
// Hook para gestionar el agente de voz con IA

import { DeepgramSTTService } from '@/app/_lib/services/voice/deepgram-service'
import { ElevenLabsVoiceService } from '@/app/_lib/services/voice/elevenlabs-service'
import { useCallback, useEffect, useRef, useState } from 'react'

interface VoiceAgentState {
  isListening: boolean
  isSpeaking: boolean
  transcript: string
  lastResponse: string
  confidence: number
  emotion: string
  latency: number
}

interface VoiceAgentOptions {
  autoStart?: boolean
  continuous?: boolean
  language?: string
  enableEmotionDetection?: boolean
  maxSpeechDuration?: number
  silenceThreshold?: number
}

export function useVoiceAgent(options: VoiceAgentOptions = {}) {
  const {
    autoStart = false,
    continuous = true,
    language = 'es-ES',
    enableEmotionDetection = true,
    maxSpeechDuration = 30000,
    silenceThreshold = 1000
  } = options

  const [state, setState] = useState<VoiceAgentState>({
    isListening: false,
    isSpeaking: false,
    transcript: '',
    lastResponse: '',
    confidence: 0,
    emotion: 'neutral',
    latency: 0
  })

  // Crear instancias de los servicios
  const elevenLabs = useRef<ElevenLabsVoiceService | null>(null)
  const deepgram = useRef<DeepgramSTTService | null>(null)
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Inicializar servicios
  const initialize = useCallback(async () => {
    try {
      // Crear instancias de los servicios
      elevenLabs.current = new ElevenLabsVoiceService()
      deepgram.current = new DeepgramSTTService()
      
      await elevenLabs.current.initialize()
      await deepgram.current.initialize()
      
      if (autoStart) {
        startListening()
      }
    } catch (error) {
      console.error('Error inicializando servicios de voz:', error)
      throw error
    }
  }, [autoStart])

  // Iniciar escucha
  const startListening = useCallback(async () => {
    if (state.isListening) return

    try {
      setState(prev => ({ ...prev, isListening: true }))
      
      // Iniciar reconocimiento de voz
      if (deepgram.current) {
        await deepgram.current.startListening({
          language,
          continuous,
          interimResults: true,
          onTranscript: (transcript, isFinal, confidence) => {
            setState(prev => ({
              ...prev,
              transcript,
              confidence: confidence || prev.confidence
            }))

            // Si es el resultado final, procesar con IA
            if (isFinal) {
              processWithAI(transcript)
            }
          },
          onError: (error) => {
            console.error('Error en reconocimiento de voz:', error)
            stopListening()
          }
        })
      }

      // Configurar timeout de silencio
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      
      silenceTimeoutRef.current = setTimeout(() => {
        if (state.isListening) {
          stopListening()
        }
      }, maxSpeechDuration)

    } catch (error) {
      console.error('Error iniciando escucha:', error)
      setState(prev => ({ ...prev, isListening: false }))
    }
  }, [state.isListening, language, continuous, maxSpeechDuration])

  // Detener escucha
  const stopListening = useCallback(async () => {
    if (!state.isListening) return

    try {
      if (deepgram.current) {
        await deepgram.current.stopListening()
      }
      setState(prev => ({ ...prev, isListening: false }))

      // Limpiar timeouts
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current)
        speechTimeoutRef.current = null
      }
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
        silenceTimeoutRef.current = null
      }

    } catch (error) {
      console.error('Error deteniendo escucha:', error)
    }
  }, [state.isListening])

  // Procesar con IA
  const processWithAI = useCallback(async (transcript: string) => {
    if (!transcript.trim()) return

    const startTime = Date.now()
    
    try {
      // Simular procesamiento de IA (en producción esto sería una llamada real a la API)
      const responses = [
        'Entendido. Procesando su solicitud...',
        'Comando recibido. Ejecutando acción...',
        'Confirmado. Operación completada exitosamente.',
        'Analizando datos. Espere un momento...',
        'Instrucción procesada. Resultado optimizado.'
      ]
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]
      
      // Detectar emoción (simulado)
      const emotion = detectEmotion(transcript)
      
      const latency = Date.now() - startTime
      
      setState(prev => ({
        ...prev,
        lastResponse: randomResponse,
        emotion,
        latency
      }))

      // Hablar la respuesta
      if (elevenLabs.current && elevenLabs.current.isInitialized) {
        setState(prev => ({ ...prev, isSpeaking: true }))
        
        await elevenLabs.current.speak(randomResponse, {
          voiceId: 'spPXlKT5a4JMfbhPRAzA', // Voice ID del usuario
          emotion: emotion as any,
          speed: 1.0,
          pitch: 1.0
        })
        
        setState(prev => ({ ...prev, isSpeaking: false }))
      }

    } catch (error) {
      console.error('Error procesando con IA:', error)
      setState(prev => ({
        ...prev,
        lastResponse: 'Lo siento, ocurrió un error al procesar su solicitud.'
      }))
    }
  }, [])

  // Detectar emoción (simplificado)
  const detectEmotion = (text: string): string => {
    const emotions = {
      happy: ['feliz', 'contento', 'excelente', 'genial', 'maravilloso'],
      sad: ['triste', 'deprimido', 'mal', 'terrible'],
      angry: ['enojado', 'molesto', 'frustrado', 'irritado'],
      excited: ['emocionado', 'emocionante', 'increíble', 'fantástico'],
      neutral: ['ok', 'bien', 'normal', 'regular']
    }

    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
        return emotion
      }
    }

    return 'neutral'
  }

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current)
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }
      stopListening()
    }
  }, [])

  return {
    ...state,
    initialize,
    startListening,
    stopListening,
    isInitialized: elevenLabs.current?.isInitialized && deepgram.current?.isInitialized
  }
}