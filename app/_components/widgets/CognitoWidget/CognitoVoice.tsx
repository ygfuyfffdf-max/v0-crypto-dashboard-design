'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎙️ COGNITO VOICE — Sistema de Voz Bidireccional
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Componentes de voz:
 * - VoiceWaveVisualizer: Visualizador de ondas de audio
 * - AudioBarsVisualizer: Barras de frecuencia animadas
 * - VoiceButton: Botón de activación de voz
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { CognitoState, VoiceConfig } from './types'
import { STATE_COLORS } from './types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌊 VOICE WAVE VISUALIZER — Ondas de audio elegantes
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VoiceWaveProps {
  isActive: boolean
  color?: string
  bars?: number
  className?: string
}

export function VoiceWaveVisualizer({
  isActive,
  color = '#8B5CF6',
  bars = 24,
  className,
}: VoiceWaveProps) {
  return (
    <div className={cn('flex h-10 items-center justify-center gap-[3px]', className)}>
      {Array.from({ length: bars }).map((_, i) => {
        const delay = i * 0.03
        const baseHeight = 4 + Math.sin((i / bars) * Math.PI) * 8

        return (
          <motion.div
            key={i}
            className="rounded-full"
            style={{
              width: 3,
              backgroundColor: color,
              boxShadow: isActive ? `0 0 8px ${color}40` : 'none',
            }}
            animate={
              isActive
                ? {
                    height: [
                      baseHeight,
                      baseHeight + 16 + Math.random() * 12,
                      baseHeight + 8,
                      baseHeight + 20 + Math.random() * 8,
                      baseHeight,
                    ],
                    opacity: [0.6, 1, 0.8, 1, 0.6],
                  }
                : {
                    height: 4,
                    opacity: 0.3,
                  }
            }
            transition={
              isActive
                ? {
                    duration: 0.6 + Math.random() * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay,
                  }
                : { duration: 0.3 }
            }
          />
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 AUDIO BARS VISUALIZER — Barras de frecuencia
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AudioBarsProps {
  frequencies: number[]
  isActive: boolean
  color?: string
  className?: string
}

export function AudioBarsVisualizer({
  frequencies,
  isActive,
  color = '#8B5CF6',
  className,
}: AudioBarsProps) {
  const bars = frequencies.length > 0 ? frequencies : Array(16).fill(0)

  return (
    <div className={cn('flex h-16 items-end justify-center gap-1', className)}>
      {bars.map((freq, i) => {
        const height = isActive ? Math.max(4, freq * 60) : 4

        return (
          <motion.div
            key={i}
            className="w-2 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: isActive && freq > 0.3 ? `0 0 10px ${color}60` : 'none',
            }}
            animate={{ height }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
          />
        )
      })}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎤 VOICE BUTTON — Botón de control de voz
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VoiceButtonProps {
  state: CognitoState
  isListening: boolean
  isMuted: boolean
  onToggleListen: () => void
  onToggleMute: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function VoiceButton({
  state,
  isListening,
  isMuted,
  onToggleListen,
  onToggleMute,
  size = 'md',
  className,
}: VoiceButtonProps) {
  const colors = STATE_COLORS[state]

  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-12 w-12',
    lg: 'h-14 w-14',
  }

  const iconSize = {
    sm: 18,
    md: 22,
    lg: 26,
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {/* Botón de micrófono */}
      <motion.button
        onClick={onToggleListen}
        className={cn(
          'relative flex items-center justify-center rounded-full transition-all',
          sizeClasses[size],
          isListening
            ? 'bg-gradient-to-br from-cyan-500 to-cyan-600'
            : 'bg-white/10 hover:bg-white/20',
        )}
        style={{
          boxShadow: isListening ? `0 0 30px ${STATE_COLORS.listening.glow}` : 'none',
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Pulso cuando está escuchando */}
        <AnimatePresence>
          {isListening && (
            <motion.div
              className="absolute inset-0 rounded-full bg-cyan-400"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </AnimatePresence>

        {isListening ? (
          <Mic className="text-white" size={iconSize[size]} />
        ) : (
          <MicOff className="text-white/70" size={iconSize[size]} />
        )}
      </motion.button>

      {/* Botón de silenciar speaker */}
      <motion.button
        onClick={onToggleMute}
        className={cn(
          'flex items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20',
          sizeClasses[size],
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMuted ? (
          <VolumeX className="text-white/50" size={iconSize[size]} />
        ) : (
          <Volume2 className="text-white/70" size={iconSize[size]} />
        )}
      </motion.button>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎧 USE VOICE — Hook para manejo de voz
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UseVoiceOptions {
  config?: Partial<VoiceConfig>
  onTranscript?: (text: string) => void
  onError?: (error: string) => void
}

export function useVoice(options: UseVoiceOptions = {}) {
  const { config, onTranscript, onError } = options
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [audioLevel, setAudioLevel] = useState(0)
  const [frequencies, setFrequencies] = useState<number[]>([])

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Inicializar Speech Recognition
  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      window.SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition })
        .webkitSpeechRecognition

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition()
      recognition.lang = config?.language || 'es-MX'
      recognition.continuous = false
      recognition.interimResults = true

      recognition.onresult = (event) => {
        const current = event.resultIndex
        const result = event.results[current]
        const text = result[0].transcript

        setTranscript(text)

        if (result.isFinal) {
          onTranscript?.(text)
          setIsListening(false)
        }
      }

      recognition.onerror = (event) => {
        onError?.(event.error)
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognitionRef.current = recognition
    }

    synthRef.current = window.speechSynthesis
  }, [config?.language, onTranscript, onError])

  // Iniciar escucha
  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      setTranscript('')
      setIsListening(true)

      try {
        recognitionRef.current.start()

        // Iniciar análisis de audio
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext()
        }

        navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
          const source = audioContextRef.current!.createMediaStreamSource(stream)
          const analyser = audioContextRef.current!.createAnalyser()
          analyser.fftSize = 64
          source.connect(analyser)
          analyserRef.current = analyser

          const dataArray = new Uint8Array(analyser.frequencyBinCount)

          const updateLevel = () => {
            if (!isListening) return

            analyser.getByteFrequencyData(dataArray)
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
            setAudioLevel(average / 255)

            // Normalizar frecuencias para visualización
            const normalized = Array.from(dataArray.slice(0, 16)).map((v) => v / 255)
            setFrequencies(normalized)

            requestAnimationFrame(updateLevel)
          }

          updateLevel()
        })
      } catch (error) {
        onError?.('No se pudo iniciar el reconocimiento de voz')
        setIsListening(false)
      }
    }
  }, [isListening, onError])

  // Detener escucha
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      setAudioLevel(0)
      setFrequencies([])
    }
  }, [isListening])

  // Toggle escucha
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Hablar texto
  const speak = useCallback(
    (text: string) => {
      if (synthRef.current) {
        // Cancelar cualquier habla anterior
        synthRef.current.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = config?.language || 'es-MX'
        utterance.rate = config?.speed || 1
        utterance.pitch = config?.pitch || 1
        utterance.volume = config?.volume || 0.8

        // Seleccionar voz si está especificada
        if (config?.voice) {
          const voices = synthRef.current.getVoices()
          const selectedVoice = voices.find((v) => v.name.includes(config.voice!))
          if (selectedVoice) {
            utterance.voice = selectedVoice
          }
        }

        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        utterance.onerror = () => setIsSpeaking(false)

        synthRef.current.speak(utterance)
      }
    },
    [config],
  )

  // Detener habla
  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }, [])

  return {
    isListening,
    isSpeaking,
    transcript,
    audioLevel,
    frequencies,
    startListening,
    stopListening,
    toggleListening,
    speak,
    stopSpeaking,
  }
}

export default VoiceWaveVisualizer
