// 🎤 ELEVENLABS SERVICE HOOK - CHRONOS INFINITY
// Hook para gestionar el servicio de ElevenLabs

import { useState, useCallback, useRef, useEffect } from 'react'

interface ElevenLabsOptions {
  apiKey?: string
  voiceId?: string
  modelId?: string
  enableStreaming?: boolean
  optimizeForLatency?: boolean
}

interface SpeakOptions {
  voiceId?: string
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'excited' | 'calm'
  speed?: number
  pitch?: number
  stability?: number
  similarityBoost?: number
}

export function useElevenLabsService(options: ElevenLabsOptions = {}) {
  const {
    apiKey = 'f4030d942e6d44b0647fc7e6afaca77bca619196a6b802ce2a5bec114ad7d40c',
    voiceId = 'spPXlKT5a4JMfbhPRAzA',
    modelId = 'eleven_monolingual_v1',
    enableStreaming = true,
    optimizeForLatency = true
  } = options

  const [isInitialized, setIsInitialized] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentVoiceId, setCurrentVoiceId] = useState(voiceId)
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioQueueRef = useRef<AudioBuffer[]>([])
  const isPlayingRef = useRef(false)

  // Inicializar el contexto de audio
  const initialize = useCallback(async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume()
      }
      
      setIsInitialized(true)
      console.log('✅ ElevenLabs Service inicializado')
      
    } catch (error) {
      console.error('❌ Error inicializando ElevenLabs Service:', error)
      throw error
    }
  }, [])

  // Desconectar el servicio
  const disconnect = useCallback(() => {
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    setIsInitialized(false)
    setIsSpeaking(false)
    audioQueueRef.current = []
    isPlayingRef.current = false
  }, [])

  // Generar audio con ElevenLabs (simulado para desarrollo)
  const generateAudio = useCallback(async (text: string, options: SpeakOptions = {}) => {
    if (!isInitialized) {
      throw new Error('ElevenLabs Service no está inicializado')
    }

    try {
      // Simulación de generación de audio
      // En producción, aquí se haría la llamada real a la API de ElevenLabs
      console.log('🎤 Generando audio con ElevenLabs:', {
        text,
        voiceId: options.voiceId || currentVoiceId,
        emotion: options.emotion || 'neutral',
        speed: options.speed || 1.0,
        pitch: options.pitch || 1.0
      })

      // Simular latencia de red
      await new Promise(resolve => setTimeout(resolve, optimizeForLatency ? 100 : 500))

      // Crear un tono sinusoidal simulado para demostración
      return createSimulatedAudio(text, options)
      
    } catch (error) {
      console.error('❌ Error generando audio:', error)
      throw error
    }
  }, [isInitialized, currentVoiceId, optimizeForLatency])

  // Crear audio simulado para desarrollo
  const createSimulatedAudio = useCallback(async (text: string, options: SpeakOptions) => {
    if (!audioContextRef.current) return null

    const sampleRate = audioContextRef.current.sampleRate
    const duration = Math.max(1, text.length * 0.1) // Duración basada en longitud del texto
    const length = sampleRate * duration
    
    const audioBuffer = audioContextRef.current.createBuffer(1, length, sampleRate)
    const channelData = audioBuffer.getChannelData(0)
    
    // Generar onda sinusoidal con variaciones
    for (let i = 0; i < length; i++) {
      const t = i / sampleRate
      const frequency = 440 + Math.sin(t * 2) * 50 // Frecuencia variable
      const amplitude = 0.3 + Math.sin(t * 3) * 0.2 // Amplitud variable
      
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * amplitude
    }
    
    return audioBuffer
  }, [])

  // Reproducir audio
  const playAudio = useCallback(async (audioBuffer: AudioBuffer) => {
    if (!audioContextRef.current) return

    const source = audioContextRef.current.createBufferSource()
    source.buffer = audioBuffer
    source.connect(audioContextRef.current.destination)
    
    setIsSpeaking(true)
    
    source.start()
    
    source.onended = () => {
      setIsSpeaking(false)
      // Reproducir siguiente audio en cola si existe
      if (audioQueueRef.current.length > 0) {
        const nextAudio = audioQueueRef.current.shift()
        if (nextAudio) {
          playAudio(nextAudio)
        }
      } else {
        isPlayingRef.current = false
      }
    }
  }, [])

  // Hablar texto
  const speak = useCallback(async (text: string, options: SpeakOptions = {}) => {
    if (!isInitialized) {
      throw new Error('ElevenLabs Service no está inicializado')
    }

    if (isSpeaking) {
      // Si ya está hablando, agregar a la cola
      console.log('📝 Agregando a cola de reproducción:', text)
      const audioBuffer = await generateAudio(text, options)
      if (audioBuffer) {
        audioQueueRef.current.push(audioBuffer)
      }
      return
    }

    try {
      const audioBuffer = await generateAudio(text, options)
      if (audioBuffer) {
        await playAudio(audioBuffer)
      }
    } catch (error) {
      console.error('❌ Error hablando texto:', error)
      throw error
    }
  }, [isInitialized, isSpeaking, generateAudio, playAudio])

  // Detener reproducción
  const stop = useCallback(() => {
    audioQueueRef.current = []
    isPlayingRef.current = false
    setIsSpeaking(false)
  }, [])

  // Cambiar voz
  const setVoice = useCallback((newVoiceId: string) => {
    setCurrentVoiceId(newVoiceId)
  }, [])

  return {
    isInitialized,
    isSpeaking,
    currentVoiceId,
    initialize,
    disconnect,
    speak,
    stop,
    setVoice
  }
}