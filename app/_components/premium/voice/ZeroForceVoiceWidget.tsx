// 🎤 ZERO FORCE VOICE WIDGET - CHRONOS INFINITY
// Componente premium de voz con integración ElevenLabs y Deepgram

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Settings,
  Brain,
  Zap,
  Sparkles,
  Activity,
  Radio,
  Waves,
  Orbit,
  Cpu
} from 'lucide-react'
import { useVoiceAgent } from '@/app/_hooks/useVoiceAgent'
import { ElevenLabsVoiceService } from '@/app/_lib/services/voice/elevenlabs-service'
import { DeepgramSTTService } from '@/app/_lib/services/voice/deepgram-service'

interface ZeroForceVoiceWidgetProps {
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  theme?: 'light' | 'dark' | 'auto'
  size?: 'compact' | 'normal' | 'expanded'
  showVisualizer?: boolean
  showEmotion?: boolean
  autoStart?: boolean
}

interface VoiceMetrics {
  latency: number
  confidence: number
  emotion: string
  energy: number
  clarity: number
}

export default function ZeroForceVoiceWidget({
  className,
  position = 'bottom-right',
  theme = 'auto',
  size = 'normal',
  showVisualizer = true,
  showEmotion = true,
  autoStart = false
}: ZeroForceVoiceWidgetProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [metrics, setMetrics] = useState<VoiceMetrics>({
    latency: 0,
    confidence: 0,
    emotion: 'neutral',
    energy: 0,
    clarity: 0
  })
  const [transcript, setTranscript] = useState('')
  const [lastResponse, setLastResponse] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const widgetRef = useRef<HTMLDivElement>(null)
  const visualizerRef = useRef<HTMLCanvasElement>(null)

  // Servicios de voz
  const voiceAgent = useVoiceAgent()

  // Auto-detección de tema
  const currentTheme = theme === 'auto' 
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme

  // Inicialización y conexión
  useEffect(() => {
    const initializeVoice = async () => {
      try {
        await elevenLabs.initialize()
        await deepgram.initialize()
        setIsConnected(true)
        
        if (autoStart) {
          startListening()
        }
      } catch (error) {
        console.error('Error inicializando servicios de voz:', error)
      }
    }

    initializeVoice()

    return () => {
      stopListening()
      elevenLabs.disconnect()
      deepgram.disconnect()
    }
  }, [])

  // Escuchar cambios en el agente de voz
  useEffect(() => {
    if (voiceAgent.isListening !== isListening) {
      setIsListening(voiceAgent.isListening)
    }
    
    if (voiceAgent.transcript !== transcript) {
      setTranscript(voiceAgent.transcript)
    }
    
    if (voiceAgent.lastResponse !== lastResponse) {
      setLastResponse(voiceAgent.lastResponse)
    }
  }, [voiceAgent, isListening, transcript, lastResponse])

  // Funciones de control
  const startListening = useCallback(async () => {
    try {
      await voiceAgent.startListening()
      setIsListening(true)
    } catch (error) {
      console.error('Error iniciando escucha:', error)
    }
  }, [voiceAgent])

  const stopListening = useCallback(async () => {
    try {
      await voiceAgent.stopListening()
      setIsListening(false)
    } catch (error) {
      console.error('Error deteniendo escucha:', error)
    }
  }, [voiceAgent])

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Visualización de audio
  useEffect(() => {
    if (!showVisualizer || !visualizerRef.current) return

    const canvas = visualizerRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const animate = () => {
      if (!isListening && !isSpeaking) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Dibujar ondas sinusoidales
      const centerY = canvas.height / 2
      const amplitude = isListening ? 20 : 10
      const frequency = 0.02
      
      ctx.strokeStyle = currentTheme === 'dark' ? '#60a5fa' : '#3b82f6'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      for (let x = 0; x < canvas.width; x++) {
        const y = centerY + Math.sin(x * frequency + Date.now() * 0.01) * amplitude
        if (x === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      
      ctx.stroke()
      requestAnimationFrame(animate)
    }

    animate()
  }, [isListening, isSpeaking, showVisualizer, currentTheme])

  // Clases de posicionamiento
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4'
  }

  const sizeClasses = {
    compact: 'w-16 h-16',
    normal: 'w-20 h-20',
    expanded: 'w-80 h-96'
  }

  return (
    <div className={cn(
      'fixed z-50',
      positionClasses[position],
      sizeClasses[size],
      'transition-all duration-300',
      className
    )}>
      {/* Widget Principal */}
      <motion.div
        ref={widgetRef}
        className={cn(
          'relative w-full h-full rounded-full',
          'backdrop-blur-xl bg-white/10 dark:bg-black/20',
          'border border-white/20 dark:border-white/10',
          'shadow-2xl shadow-blue-500/20',
          'flex items-center justify-center',
          'cursor-pointer select-none',
          'transition-all duration-300',
          isConnected ? 'opacity-100' : 'opacity-50',
          isListening && 'shadow-blue-500/50 border-blue-400/50',
          isSpeaking && 'shadow-green-500/50 border-green-400/50'
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleListening}
      >
        {/* Icono Central */}
        <div className="relative z-10">
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="listening"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Waves className="w-8 h-8 text-blue-500" />
              </motion.div>
            ) : isSpeaking ? (
              <motion.div
                key="speaking"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Volume2 className="w-8 h-8 text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Mic className="w-8 h-8 text-gray-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Anillo de Estado */}
        <div className={cn(
          'absolute inset-0 rounded-full',
          'border-2 border-dashed',
          isListening ? 'border-blue-400 animate-spin' : 'border-gray-400',
          'transition-all duration-300'
        )} />

        {/* Partículas Animadas */}
        {isListening && (
          <div className="absolute inset-0">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: [0, Math.cos(i * 60 * Math.PI / 180) * 40],
                  y: [0, Math.sin(i * 60 * Math.PI / 180) * 40],
                  opacity: [1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}

        {/* Visualizador de Audio */}
        {showVisualizer && size === 'expanded' && (
          <canvas
            ref={visualizerRef}
            className="absolute inset-0 w-full h-full rounded-full opacity-30"
            width={320}
            height={384}
          />
        )}
      </motion.div>

      {/* Panel Expandido */}
      {size === 'expanded' && (
        <motion.div
          className={cn(
            'absolute bottom-24 left-0 w-80',
            'backdrop-blur-xl bg-white/10 dark:bg-black/20',
            'border border-white/20 dark:border-white/10',
            'rounded-2xl shadow-2xl',
            'p-6'
          )}
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Zero Force Voice</h3>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Métricas */}
          {showEmotion && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{metrics.latency}ms</div>
                <div className="text-xs text-gray-400">Latencia</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{Math.round(metrics.confidence * 100)}%</div>
                <div className="text-xs text-gray-400">Confianza</div>
              </div>
            </div>
          )}

          {/* Transcripción */}
          <div className="mb-4">
            <div className="text-sm text-gray-300 mb-2">Transcripción:</div>
            <div className="bg-black/20 rounded-lg p-3 min-h-[60px]">
              <p className="text-sm text-white">
                {transcript || 'Esperando entrada de voz...'}
              </p>
            </div>
          </div>

          {/* Última Respuesta */}
          <div className="mb-4">
            <div className="text-sm text-gray-300 mb-2">Respuesta:</div>
            <div className="bg-green-900/20 rounded-lg p-3 min-h-[60px]">
              <p className="text-sm text-green-300">
                {lastResponse || 'Esperando respuesta...'}
              </p>
            </div>
          </div>

          {/* Controles */}
          <div className="flex gap-2">
            <button
              onClick={toggleListening}
              className={cn(
                'flex-1 py-2 px-4 rounded-lg font-medium transition-all',
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              )}
            >
              {isListening ? 'Detener' : 'Escuchar'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}