// @ts-nocheck
/**
 * 🎵 AUDIO VISUALIZER COMPONENT — CHRONOS ULTRA
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * Visualizador de audio en tiempo real con efectos cinematográficos
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { motion } from 'motion/react'
import React, { useEffect, useRef, useState } from 'react'

interface AudioVisualizerProps {
  isActive: boolean
  color?: string
  bars?: number
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  isActive,
  color = 'violet',
  bars = 32,
}) => {
  const [audioData, setAudioData] = useState<number[]>(Array(bars).fill(0))
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)

  useEffect(() => {
    if (!isActive) {
      // Reset cuando se desactiva
      setAudioData(Array(bars).fill(0))
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      return
    }

    // Simulación de datos de audio (para demo sin micrófono real)
    const animate = () => {
      const newData = Array.from({ length: bars }, (_, i) => {
        const baseFreq = Math.sin(Date.now() / 200 + i * 0.5) * 0.3
        const randomNoise = Math.random() * 0.7
        return Math.max(0, Math.min(1, baseFreq + randomNoise))
      })
      setAudioData(newData)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isActive, bars])

  const colorMap: Record<string, string> = {
    violet: 'from-violet-500 via-fuchsia-500 to-pink-500',
    blue: 'from-blue-500 via-cyan-500 to-teal-500',
    green: 'from-green-500 via-emerald-500 to-teal-500',
    red: 'from-red-500 via-orange-500 to-yellow-500',
  }

  return (
    <div className="flex h-16 items-end justify-center gap-1 px-4">
      {audioData.map((value, index) => (
        <motion.div
          key={index}
          className={`w-1 rounded-full bg-gradient-to-t ${colorMap[color] || colorMap.violet}`}
          initial={{ height: '10%' }}
          animate={{
            height: `${10 + value * 90}%`,
            opacity: 0.4 + value * 0.6,
          }}
          transition={{
            duration: 0.1,
            ease: 'easeOut',
          }}
          style={{
            boxShadow: `0 0 ${value * 20}px ${colorMap[color]?.split(' ')[1]}`,
          }}
        />
      ))}
    </div>
  )
}

/**
 * 🎙️ VOICE INDICATOR — Indicador de nivel de voz
 */
export const VoiceIndicator: React.FC<{ isListening: boolean }> = ({ isListening }) => {
  const [level, setLevel] = useState(0)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (!isListening) {
      setLevel(0)
      return
    }

    const animate = () => {
      const newLevel = 0.3 + Math.random() * 0.7
      setLevel(newLevel)
      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isListening])

  return (
    <motion.div
      className="relative h-24 w-24"
      animate={{
        scale: isListening ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Ondas concéntricas */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border-2 border-violet-500/30"
          initial={{ scale: 0, opacity: 1 }}
          animate={{
            scale: isListening ? [1, 2, 2.5] : 1,
            opacity: isListening ? [1, 0.5, 0] : 0,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeOut',
          }}
        />
      ))}
      {/* Centro pulsante */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500"
        animate={{
          scale: 0.5 + level * 0.5,
          opacity: 0.6 + level * 0.4,
        }}
        transition={{
          duration: 0.1,
        }}
        style={{
          boxShadow: `0 0 ${level * 40}px rgba(139, 92, 246, ${level})`,
        }}
      />
    </motion.div>
  )
}
