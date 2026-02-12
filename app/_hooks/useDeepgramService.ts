// 🎤 DEEPGRAM SERVICE HOOK - CHRONOS INFINITY
// Hook para gestionar el servicio de Deepgram STT

import { useState, useCallback, useRef, useEffect } from 'react'

interface DeepgramOptions {
  apiKey?: string
  model?: string
  language?: string
  enableInterimResults?: boolean
  enableSmartFormatting?: boolean
  enableDiarization?: boolean
  optimizeForLatency?: boolean
}

interface ListeningOptions {
  language?: string
  continuous?: boolean
  interimResults?: boolean
  onTranscript?: (transcript: string, isFinal: boolean, confidence?: number) => void
  onError?: (error: Error) => void
  onStart?: () => void
  onEnd?: () => void
}

export function useDeepgramService(options: DeepgramOptions = {}) {
  const {
    apiKey = 'your_deepgram_api_key',
    model = 'nova-2',
    language = 'es-ES',
    enableInterimResults = true,
    enableSmartFormatting = true,
    enableDiarization = false,
    optimizeForLatency = true
  } = options

  const [isInitialized, setIsInitialized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const websocketRef = useRef<WebSocket | null>(null)
  const callbacksRef = useRef<ListeningOptions>({})

  // Inicializar el servicio
  const initialize = useCallback(async () => {
    try {
      // Verificar permisos de micrófono
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioStreamRef.current = stream
      
      // Detener el stream inmediatamente (solo para verificar permisos)
      stream.getTracks().forEach(track => track.stop())
      
      setIsInitialized(true)
      console.log('✅ Deepgram Service inicializado')
      
    } catch (error) {
      console.error('❌ Error inicializando Deepgram Service:', error)
      throw error
    }
  }, [])

  // Desconectar el servicio
  const disconnect = useCallback(() => {
    stopListening()
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }
    
    if (websocketRef.current) {
      websocketRef.current.close()
      websocketRef.current = null
    }
    
    setIsInitialized(false)
    setIsListening(false)
    setCurrentTranscript('')
  }, [])

  // Iniciar escucha
  const startListening = useCallback(async (options: ListeningOptions = {}) => {
    if (isListening) return

    try {
      callbacksRef.current = options
      
      // Obtener stream de audio
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      })
      
      audioStreamRef.current = stream
      
      // Crear MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 128000
      })
      
      mediaRecorderRef.current = mediaRecorder
      
      // Configurar WebSocket (simulado)
      await setupWebSocket()
      
      // Manejar datos de audio
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && websocketRef.current?.readyState === WebSocket.OPEN) {
          websocketRef.current.send(event.data)
        }
      }
      
      // Manejar errores
      mediaRecorder.onerror = (event) => {
        console.error('Error en MediaRecorder:', event)
        options.onError?.(new Error('Error en la grabación de audio'))
        stopListening()
      }
      
      // Iniciar grabación
      mediaRecorder.start(250) // Enviar datos cada 250ms
      setIsListening(true)
      
      options.onStart?.()
      
      console.log('🎤 Escucha iniciada')
      
    } catch (error) {
      console.error('❌ Error iniciando escucha:', error)
      options.onError?.(error as Error)
      stopListening()
    }
  }, [isListening])

  // Detener escucha
  const stopListening = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current = null
    }
    
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop())
      audioStreamRef.current = null
    }
    
    if (websocketRef.current) {
      websocketRef.current.close()
      websocketRef.current = null
    }
    
    setIsListening(false)
    callbacksRef.current.onEnd?.()
    
    console.log('🛑 Escucha detenida')
  }, [])

  // Configurar WebSocket (simulado)
  const setupWebSocket = useCallback(async () => {
    // Simulación de conexión WebSocket
    // En producción, aquí se conectaría al servicio real de Deepgram
    
    return new Promise<void>((resolve) => {
      // Simular conexión exitosa
      setTimeout(() => {
        console.log('🔗 WebSocket simulado conectado')
        
        // Simular transcripciones
        const simulateTranscription = () => {
          if (!isListening) return
          
          const sampleTexts = [
            'Hola, ¿cómo estás?',
            'Quiero registrar una venta',
            'Mostrar el dashboard de administración',
            'Procesar orden de compra',
            'Consultar el estado de los bancos',
            'Generar reporte de utilidades',
            'Actualizar el inventario',
            'Revisar las deudas pendientes'
          ]
          
          const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)]
          const confidence = Math.random() * 0.3 + 0.7 // Entre 0.7 y 1.0
          
          setCurrentTranscript(randomText)
          callbacksRef.current.onTranscript?.(randomText, true, confidence)
          
          // Programar próxima simulación
          setTimeout(simulateTranscription, Math.random() * 3000 + 2000)
        }
        
        // Iniciar simulación después de un breve retraso
        setTimeout(simulateTranscription, 1000)
        
        resolve()
      }, 500)
    })
  }, [])

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      disconnect()
    }
  }, [])

  return {
    isInitialized,
    isListening,
    currentTranscript,
    initialize,
    disconnect,
    startListening,
    stopListening
  }
}