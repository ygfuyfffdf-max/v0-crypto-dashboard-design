// @ts-nocheck
'use client'
/**
 * 🎵 AUDIO REACTIVE SYSTEM — Sistema de efectos reactivos al audio
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Análisis de frecuencias en tiempo real con Web Audio API
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { useEffect, useRef, useState } from 'react'

export interface AudioData {
  volume: number
  bass: number
  mid: number
  treble: number
  frequencies: Uint8Array
  waveform: Uint8Array
  isPlaying: boolean
}

export const useAudioReactive = (audioSource?: MediaStream | HTMLAudioElement) => {
  const [audioData, setAudioData] = useState<AudioData>({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    frequencies: new Uint8Array(128),
    waveform: new Uint8Array(128),
    isPlaying: false,
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationRef = useRef<number>(0)

  useEffect(() => {
    if (!audioSource) return

    const setupAudio = async () => {
      try {
        // Crear contexto de audio
        audioContextRef.current = new (
          window.AudioContext ||
          (window as typeof window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext
        )()

        const audioContext = audioContextRef.current
        if (!audioContext) return

        // Crear analizador
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8
        analyserRef.current = analyser

        // Conectar fuente
        let source: MediaStreamAudioSourceNode | MediaElementAudioSourceNode
        if (audioSource instanceof MediaStream) {
          source = audioContext.createMediaStreamSource(audioSource)
        } else {
          source = audioContext.createMediaElementSource(audioSource)
        }

        source.connect(analyser)
        analyser.connect(audioContext.destination)

        // Buffers para datos
        const bufferLength = analyser.frequencyBinCount
        const frequencyData = new Uint8Array(bufferLength)
        const waveformData = new Uint8Array(bufferLength)

        // Análisis en tiempo real
        const analyze = () => {
          if (!analyserRef.current) return

          analyserRef.current.getByteFrequencyData(frequencyData)
          analyserRef.current.getByteTimeDomainData(waveformData)

          // Calcular volumen promedio
          const volume =
            frequencyData.reduce((acc, val) => acc + val, 0) / frequencyData.length / 255

          // Dividir en bandas de frecuencia
          const third = Math.floor(bufferLength / 3)
          const bass =
            frequencyData.slice(0, third).reduce((acc, val) => acc + val, 0) / third / 255
          const mid =
            frequencyData.slice(third, third * 2).reduce((acc, val) => acc + val, 0) / third / 255
          const treble =
            frequencyData.slice(third * 2).reduce((acc, val) => acc + val, 0) / third / 255

          setAudioData({
            volume,
            bass,
            mid,
            treble,
            frequencies: frequencyData.slice(),
            waveform: waveformData.slice(),
            isPlaying: volume > 0.01,
          })

          animationRef.current = requestAnimationFrame(analyze)
        }

        analyze()
      } catch (error) {
        console.error('Error setting up audio:', error)
      }
    }

    setupAudio()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [audioSource])

  return audioData
}

/**
 * 🎶 AUDIO REACTIVE ORB — Orb que reacciona al audio
 */
import { motion } from 'motion/react'
import React from 'react'

interface AudioReactiveOrbProps {
  audioData: AudioData
  baseSize?: number
}

export const AudioReactiveOrb: React.FC<AudioReactiveOrbProps> = ({
  audioData,
  baseSize = 200,
}) => {
  const scale = 1 + audioData.volume * 0.5
  const bassIntensity = audioData.bass * 100
  const midIntensity = audioData.mid * 100
  const trebleIntensity = audioData.treble * 100

  return (
    <div className="relative" style={{ width: baseSize, height: baseSize }}>
      {/* Bass ring (rojo) */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(239, 68, 68, ${audioData.bass}) 0%, transparent 70%)`,
          boxShadow: `0 0 ${bassIntensity}px rgba(239, 68, 68, ${audioData.bass})`,
        }}
        animate={{
          scale: 0.8 + audioData.bass * 0.4,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Mid ring (verde) */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(34, 197, 94, ${audioData.mid}) 0%, transparent 60%)`,
          boxShadow: `0 0 ${midIntensity}px rgba(34, 197, 94, ${audioData.mid})`,
        }}
        animate={{
          scale: 0.9 + audioData.mid * 0.3,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Treble ring (azul) */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, rgba(59, 130, 246, ${audioData.treble}) 0%, transparent 50%)`,
          boxShadow: `0 0 ${trebleIntensity}px rgba(59, 130, 246, ${audioData.treble})`,
        }}
        animate={{
          scale: 1 + audioData.treble * 0.2,
        }}
        transition={{ duration: 0.1 }}
      />

      {/* Centro (volumen total) */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500"
        animate={{
          scale,
          opacity: 0.8 + audioData.volume * 0.2,
        }}
        transition={{ duration: 0.1 }}
        style={{
          boxShadow: `0 0 ${audioData.volume * 80}px rgba(139, 92, 246, ${audioData.volume})`,
        }}
      />

      {/* Frequency bars alrededor */}
      {Array.from({ length: 32 }).map((_, i) => {
        const angle = (i / 32) * Math.PI * 2
        const freqIndex = i * 4
        const freqValue = freqIndex < audioData.frequencies.length ? audioData.frequencies[freqIndex] : 0
        const freq = (freqValue ?? 0) / 255
        const length = baseSize / 2 + freq * 50

        return (
          <motion.div
            key={i}
            className="absolute top-1/2 left-1/2 origin-left"
            style={{
              width: length,
              height: 2,
              background: `linear-gradient(to right, rgba(139, 92, 246, ${freq}), transparent)`,
              transform: `rotate(${angle}rad)`,
            }}
            animate={{
              opacity: freq,
            }}
            transition={{ duration: 0.05 }}
          />
        )
      })}
    </div>
  )
}

/**
 * 📊 FREQUENCY BARS — Barras de frecuencia estilo visualizador
 */
export const FrequencyBars: React.FC<{
  frequencies: Uint8Array
  barCount?: number
  color?: string
}> = ({ frequencies, barCount = 64, color = 'violet' }) => {
  const step = Math.floor(frequencies.length / barCount)

  const colorMap: Record<string, string> = {
    violet: 'from-violet-500 to-fuchsia-500',
    cyan: 'from-cyan-500 to-blue-500',
    green: 'from-green-500 to-emerald-500',
    rainbow: 'from-red-500 via-yellow-500 to-green-500',
  }

  return (
    <div className="flex h-32 items-end justify-center gap-0.5">
      {Array.from({ length: barCount }).map((_, i) => {
        const freqIndex = i * step
        const freqValue = freqIndex < frequencies.length ? frequencies[freqIndex] : 0
        const value = (freqValue ?? 0) / 255
        return (
          <motion.div
            key={i}
            className={`w-1 rounded-t-full bg-gradient-to-t ${colorMap[color] || colorMap.violet}`}
            animate={{
              height: `${value * 100}%`,
              opacity: 0.3 + value * 0.7,
            }}
            transition={{ duration: 0.05 }}
            style={{
              filter: `drop-shadow(0 0 ${value * 10}px currentColor)`,
            }}
          />
        )
      })}
    </div>
  )
}
