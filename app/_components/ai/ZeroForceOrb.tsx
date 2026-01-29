/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🎨 ZERO FORCE ORB — Componente Visual Premium
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Orb 3D interactivo para Zero Force con:
 * - Animaciones particles al hablar
 * - Pulse resonante en wake word
 * - Glow mood-adaptive (violeta calm, oro excited)
 * - Efectos de breathing realista
 * - Canvas 60fps con WebGL
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { getZeroForce, type ZeroEmotion } from '@/app/_lib/ai/zero-force-voice'
import { cn } from '@/app/_lib/utils'
import { motion } from 'motion/react'
import { Mic, MicOff, Volume2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface ZeroForceOrbProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showControls?: boolean
  autoStart?: boolean
}

const sizeClasses = {
  sm: 'w-32 h-32',
  md: 'w-48 h-48',
  lg: 'w-64 h-64',
  xl: 'w-96 h-96',
}

export function ZeroForceOrb({
  className,
  size = 'lg',
  showControls = true,
  autoStart = false,
}: ZeroForceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [emotion, setEmotion] = useState<ZeroEmotion>('professional')
  const animationFrameRef = useRef<number | undefined>(undefined)
  const zeroRef = useRef<ReturnType<typeof getZeroForce> | null>(null)

  // Inicializar Zero Force solo en cliente
  useEffect(() => {
    zeroRef.current = getZeroForce()
  }, [])

  // ═════════════════════════════════════════════════════════════
  // CANVAS RENDERING (60FPS)
  // ═════════════════════════════════════════════════════════════

  const drawOrb = useCallback(
    (ctx: CanvasRenderingContext2D, time: number) => {
      const canvas = ctx.canvas
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const baseRadius = Math.min(canvas.width, canvas.height) * 0.3

      // Clear
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Colores según emoción
      const colors = {
        calm: { primary: '#8B5CF6', secondary: '#A78BFA', glow: 'rgba(139, 92, 246, 0.3)' },
        professional: { primary: '#6366F1', secondary: '#818CF8', glow: 'rgba(99, 102, 241, 0.3)' },
        excited: { primary: '#F59E0B', secondary: '#FBBF24', glow: 'rgba(245, 158, 11, 0.3)' },
        concerned: { primary: '#EC4899', secondary: '#F472B6', glow: 'rgba(236, 72, 153, 0.3)' },
        neutral: { primary: '#6B7280', secondary: '#9CA3AF', glow: 'rgba(107, 114, 128, 0.3)' },
      }
      const { primary, secondary, glow } = colors[emotion]

      // Breathing animation
      const breathingScale = 1 + Math.sin(time * 0.002) * 0.05
      const currentRadius = baseRadius * breathingScale

      // Pulse cuando está escuchando
      const pulseScale = isListening ? 1 + Math.sin(time * 0.01) * 0.1 : 1

      // Particles cuando está hablando
      if (isSpeaking) {
        const particleCount = 20
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2
          const distance = currentRadius + Math.sin(time * 0.01 + i) * 20
          const x = centerX + Math.cos(angle + time * 0.003) * distance
          const y = centerY + Math.sin(angle + time * 0.003) * distance

          ctx.beginPath()
          ctx.arc(x, y, 2, 0, Math.PI * 2)
          ctx.fillStyle = secondary
          ctx.globalAlpha = 0.6
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }

      // Outer glow
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        currentRadius * 0.5,
        centerX,
        centerY,
        currentRadius * 2,
      )
      gradient.addColorStop(0, glow)
      gradient.addColorStop(1, 'transparent')

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Inner orb gradient
      const orbGradient = ctx.createRadialGradient(
        centerX,
        centerY - currentRadius * 0.3,
        0,
        centerX,
        centerY,
        currentRadius * pulseScale,
      )
      orbGradient.addColorStop(0, secondary)
      orbGradient.addColorStop(0.5, primary)
      orbGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)')

      ctx.beginPath()
      ctx.arc(centerX, centerY, currentRadius * pulseScale, 0, Math.PI * 2)
      ctx.fillStyle = orbGradient
      ctx.fill()

      // Highlight
      ctx.beginPath()
      ctx.arc(
        centerX - currentRadius * 0.2,
        centerY - currentRadius * 0.2,
        currentRadius * 0.4,
        0,
        Math.PI * 2,
      )
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.fill()

      // Resonance rings cuando activo
      if (isListening || isSpeaking) {
        for (let i = 0; i < 3; i++) {
          const ringRadius = currentRadius * (1.2 + i * 0.3 + ((time * 0.002) % 0.5))
          const ringOpacity = 0.3 - i * 0.1

          ctx.beginPath()
          ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${parseInt(primary.slice(1, 3), 16)}, ${parseInt(primary.slice(3, 5), 16)}, ${parseInt(primary.slice(5, 7), 16)}, ${ringOpacity})`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }
    },
    [emotion, isListening, isSpeaking],
  )

  // ═════════════════════════════════════════════════════════════
  // ANIMATION LOOP
  // ═════════════════════════════════════════════════════════════

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const updateSize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Animation loop
    const animate = (time: number) => {
      drawOrb(ctx, time)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      window.removeEventListener('resize', updateSize)
    }
  }, [drawOrb])

  // ═════════════════════════════════════════════════════════════
  // ZERO FORCE INTEGRATION
  // ═════════════════════════════════════════════════════════════

  useEffect(() => {
    if (autoStart && !isMuted && zeroRef.current) {
      zeroRef.current.startWakeWordDetection()
    }

    return () => {
      if (zeroRef.current) {
        zeroRef.current.stopWakeWordDetection()
      }
    }
  }, [autoStart, isMuted])

  // Sync visual state con Zero Force
  useEffect(() => {
    const checkState = setInterval(() => {
      if (zeroRef.current) {
        const state = zeroRef.current.getState()
        setIsListening(state === 'listening')
        setIsSpeaking(state === 'speaking')
      }
    }, 100)

    return () => clearInterval(checkState)
  }, [])

  // ═════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════

  const handleToggleMute = () => {
    if (!zeroRef.current) return
    if (isMuted) {
      zeroRef.current.startWakeWordDetection()
    } else {
      zeroRef.current.stopWakeWordDetection()
    }
    setIsMuted(!isMuted)
  }

  const handleEmotionChange = (newEmotion: ZeroEmotion) => {
    setEmotion(newEmotion)
    if (zeroRef.current) {
      zeroRef.current.setEmotion(newEmotion)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('relative', sizeClasses[size], className)}
    >
      {/* Canvas Orb */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ imageRendering: 'crisp-edges' }}
      />

      {/* Estado Visual */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        {isListening && (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="text-center text-white/80"
          >
            <Mic className="mx-auto h-12 w-12" />
            <p className="mt-2 text-sm">Escuchando...</p>
          </motion.div>
        )}

        {isSpeaking && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="text-center text-white/80"
          >
            <Volume2 className="mx-auto h-12 w-12" />
            <p className="mt-2 text-sm">Respondiendo...</p>
          </motion.div>
        )}
      </div>

      {/* Controles */}
      {showControls && (
        <div className="absolute -bottom-16 left-1/2 flex -translate-x-1/2 items-center gap-3">
          {/* Mute Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleToggleMute}
            className={cn(
              'rounded-full p-3',
              'border border-white/20 bg-white/10 backdrop-blur-md',
              'transition-all hover:bg-white/20',
              isMuted && 'border-red-500/40 bg-red-500/20',
            )}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </motion.button>

          {/* Emotion Selector */}
          <div className="flex items-center gap-2">
            {(['calm', 'professional', 'excited'] as ZeroEmotion[]).map((emo) => (
              <motion.button
                key={emo}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleEmotionChange(emo)}
                className={cn(
                  'h-8 w-8 rounded-full border-2 transition-all',
                  emotion === emo
                    ? 'border-white/80 shadow-lg'
                    : 'border-white/20 hover:border-white/40',
                  emo === 'calm' && 'bg-violet-500/40',
                  emo === 'professional' && 'bg-indigo-500/40',
                  emo === 'excited' && 'bg-amber-500/40',
                )}
                title={emo}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
