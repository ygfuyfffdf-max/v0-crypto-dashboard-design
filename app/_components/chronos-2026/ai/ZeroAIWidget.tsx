/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * ⭕ ZERO AI WIDGET — ALEXA-STYLE ASSISTANT
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Widget de IA estilo Amazon Alexa:
 * - Siempre escuchando por wake word "ZERO"
 * - Anillo animado que responde al audio
 * - Estados: idle, listening, thinking, speaking
 * - Diseño minimalista y elegante
 * - Sin 3D para mejor rendimiento
 *
 * @version 2.0.0
 * @author CHRONOS INFINITY TEAM
 */

'use client'

import { AnimatePresence, motion } from 'motion/react'
import {
  Maximize2,
  MessageSquare,
  Mic,
  MicOff,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 COLORS & STATES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type ZeroState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'

const STATE_COLORS: Record<ZeroState, { ring: string; glow: string; bg: string }> = {
  idle: { ring: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.3)', bg: '#1F1B2E' },
  listening: { ring: '#22D3EE', glow: 'rgba(34, 211, 238, 0.5)', bg: '#1B2E2E' },
  thinking: { ring: '#FBBF24', glow: 'rgba(251, 191, 36, 0.4)', bg: '#2E2B1B' },
  speaking: { ring: '#22C55E', glow: 'rgba(34, 197, 94, 0.4)', bg: '#1B2E1F' },
  error: { ring: '#EF4444', glow: 'rgba(239, 68, 68, 0.4)', bg: '#2E1B1B' },
}

const STATE_LABELS: Record<ZeroState, string> = {
  idle: 'Di "ZERO" para activar',
  listening: 'Escuchando...',
  thinking: 'Procesando...',
  speaking: 'Respondiendo...',
  error: 'Error de conexión',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎵 AUDIO RING — Animated ring that responds to audio
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AudioRingProps {
  state: ZeroState
  audioLevel: number
}

function AudioRing({ state, audioLevel }: AudioRingProps) {
  const colors = STATE_COLORS[state]
  const isActive = state === 'listening' || state === 'speaking'

  // Generate wave points based on audio level
  const wavePoints = useRef<number[]>([])

  useEffect(() => {
    if (isActive) {
      // Update wave points smoothly
      const newPoints: number[] = []
      for (let i = 0; i < 60; i++) {
        const baseLevel = 0.8 + Math.sin(i * 0.2) * 0.1
        const audioMod = audioLevel * 0.3 * Math.sin(i * 0.5 + Date.now() * 0.003)
        newPoints.push(baseLevel + audioMod)
      }
      wavePoints.current = newPoints
    }
  }, [isActive, audioLevel])

  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
      {/* Background circle */}
      <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />

      {/* Main ring */}
      <motion.circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke={colors.ring}
        strokeWidth={isActive ? 4 : 2}
        strokeLinecap="round"
        strokeDasharray={isActive ? '20 10' : '270'}
        strokeDashoffset={isActive ? 0 : 0}
        animate={{
          rotate: isActive ? [0, 360] : 0,
          strokeWidth: isActive ? [3, 5, 3] : 2,
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          rotate: { duration: 3, repeat: Infinity, ease: 'linear' },
          strokeWidth: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
        style={{ transformOrigin: 'center' }}
      />

      {/* Outer glow ring */}
      {isActive && (
        <motion.circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          stroke={colors.ring}
          strokeWidth="1"
          opacity={0.3}
          animate={{
            r: [46, 48, 46],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Audio visualizer bars (only when active) */}
      {isActive &&
        Array.from({ length: 12 }).map((_, i) => {
          const angle = (i / 12) * Math.PI * 2 - Math.PI / 2
          const x1 = 50 + Math.cos(angle) * 35
          const y1 = 50 + Math.sin(angle) * 35
          const barLength = 5 + audioLevel * 8 * Math.sin(i + Date.now() * 0.005)
          const x2 = 50 + Math.cos(angle) * (35 + barLength)
          const y2 = 50 + Math.sin(angle) * (35 + barLength)

          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={colors.ring}
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{
                duration: 0.5 + Math.random() * 0.3,
                repeat: Infinity,
                delay: i * 0.05,
              }}
            />
          )
        })}
    </svg>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🤖 ZERO ICON — Central animated icon
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ZeroIcon({ state }: { state: ZeroState }) {
  const colors = STATE_COLORS[state]

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center"
      animate={{
        scale: state === 'thinking' ? [1, 1.1, 1] : 1,
      }}
      transition={{
        duration: 1,
        repeat: state === 'thinking' ? Infinity : 0,
        ease: 'easeInOut',
      }}
    >
      <div className="relative">
        {/* ZERO text */}
        <motion.span
          className="text-lg font-black tracking-tighter"
          style={{ color: colors.ring }}
          animate={{
            textShadow: `0 0 20px ${colors.glow}`,
          }}
        >
          ZERO
        </motion.span>

        {/* Sparkle effect when active */}
        {(state === 'listening' || state === 'speaking') && (
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ rotate: [0, 180, 360], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="h-3 w-3" style={{ color: colors.ring }} />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 MAIN WIDGET COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface ZeroAIWidgetProps {
  onExpandToPanel: () => void
  onCommand?: (_command: string) => void
  position?: 'bottom-right' | 'bottom-left'
  size?: 'small' | 'medium' | 'large'
}

export function ZeroAIWidget({
  onExpandToPanel,
  onCommand: _onCommand,
  position = 'bottom-right',
  size = 'medium',
}: ZeroAIWidgetProps) {
  // State
  const [currentState, setCurrentState] = useState<ZeroState>('idle')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [isWakeWordEnabled, setIsWakeWordEnabled] = useState(true)

  // Logic
  const router = useRouter()
  const zeroBrain = useZeroBrain()
  const zeroForce = useRef(getZeroForce())
  const animationRef = useRef<number>(0)

  // Size mapping
  const sizeMap = {
    small: 'w-16 h-16',
    medium: 'w-20 h-20',
    large: 'w-24 h-24',
  }

  // Position mapping
  const positionMap = {
    'bottom-right': 'right-6 bottom-6',
    'bottom-left': 'left-6 bottom-6',
  }

  // Inicializar detección de wake word
  useEffect(() => {
    if (isWakeWordEnabled && !isMuted) {
      zeroForce.current.startWakeWordDetection()
    } else {
      zeroForce.current.stopWakeWordDetection()
    }

    return () => {
      zeroForce.current.stopWakeWordDetection()
    }
  }, [isWakeWordEnabled, isMuted])

  // Loop de visualización de audio (Real-time Audio Reactive)
  useEffect(() => {
    const updateAudioLevel = () => {
      const level = zeroForce.current.getAudioLevel()
      setAudioLevel(level)
      animationRef.current = requestAnimationFrame(updateAudioLevel)
    }

    if (currentState === 'listening' || currentState === 'speaking') {
      updateAudioLevel()
    } else {
      setAudioLevel(0)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [currentState])

  // Manejo del ciclo de escucha y respuesta
  const handleListeningCycle = useCallback(async () => {
    try {
      setCurrentState('listening')
      setTranscript('')

      // 1. Escuchar comando (STT)
      const text = await zeroForce.current.startListening()
      setTranscript(text)
      
      if (!text) {
        setCurrentState('idle')
        return
      }

      // 2. Procesar intención (Brain)
      setCurrentState('thinking')
      const result = await zeroBrain.processCommand(text)

      // 3. Ejecutar acción
      if (result.success && result.action === 'NAVIGATE' && result.data) {
        router.push(result.data)
      }

      // 4. Responder (TTS)
      setCurrentState('speaking')
      setTranscript(result.message)
      if (!isMuted) {
        await zeroForce.current.speak(result.message)
      } else {
        // Si está muteado, solo mostrar texto un momento
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

    } catch (error) {
      console.error('Error en ciclo Zero:', error)
      setCurrentState('error')
      setTimeout(() => setCurrentState('idle'), 2000)
    } finally {
      if (currentState !== 'error') {
        setCurrentState('idle')
        setTranscript('')
        // Reactivar wake word
        if (isWakeWordEnabled && !isMuted) {
          zeroForce.current.startWakeWordDetection()
        }
      }
    }
  }, [isMuted, isWakeWordEnabled, router, zeroBrain, currentState])

  // Handle click to toggle listening manually
  const handleClick = useCallback(() => {
    if (currentState === 'idle') {
      handleListeningCycle()
    } else {
      // Cancelar si se toca mientras está activo
      setCurrentState('idle')
      zeroForce.current.stopWakeWordDetection() // Reset
    }
  }, [currentState, handleListeningCycle])

  // Toggle expanded state
  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0, y: 50 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`fixed ${positionMap[position]} z-50`}
    >
      {/* Status label */}
      <AnimatePresence>
        {(currentState !== 'idle' || isExpanded) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap"
          >
            <div
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium backdrop-blur-xl"
              style={{
                backgroundColor: `${STATE_COLORS[currentState].bg}CC`,
                color: STATE_COLORS[currentState].ring,
              }}
            >
              {transcript || STATE_LABELS[currentState]}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick action buttons */}
      <AnimatePresence>
        {isExpanded && (
          <div className="absolute right-0 bottom-0 mr-24 flex flex-col gap-2">
            {/* Expand to full panel */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.1 }}
              onClick={onExpandToPanel}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-violet-500/30 bg-violet-600/20 transition-colors hover:bg-violet-600/40"
              title="Abrir panel completo"
            >
              <Maximize2 className="h-4 w-4 text-violet-400" />
            </motion.button>

            {/* Chat mode */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.15 }}
              onClick={onExpandToPanel}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/30 bg-cyan-600/20 transition-colors hover:bg-cyan-600/40"
              title="Chat con ZERO"
            >
              <MessageSquare className="h-4 w-4 text-cyan-400" />
            </motion.button>

            {/* Mute toggle */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.2 }}
              onClick={() => setIsMuted(!isMuted)}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                isMuted
                  ? 'border-red-500/30 bg-red-600/20 hover:bg-red-600/40'
                  : 'border-green-500/30 bg-green-600/20 hover:bg-green-600/40'
              }`}
              title={isMuted ? 'Activar audio' : 'Silenciar'}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-red-400" />
              ) : (
                <Volume2 className="h-4 w-4 text-green-400" />
              )}
            </motion.button>

            {/* Settings */}
            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.25 }}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors hover:bg-white/10"
              title="Configuración"
            >
              <Settings className="h-4 w-4 text-white/60" />
            </motion.button>
          </div>
        )}
      </AnimatePresence>

      {/* Main widget */}
      <motion.div
        className={`relative ${sizeMap[size]} cursor-pointer`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        onContextMenu={(e) => {
          e.preventDefault()
          toggleExpanded()
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full blur-xl"
          animate={{
            backgroundColor: STATE_COLORS[currentState].glow,
            scale: currentState === 'listening' ? [1, 1.3, 1] : 1,
          }}
          transition={{
            scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
          }}
        />

        {/* Widget container */}
        <div
          className="relative h-full w-full overflow-hidden rounded-full border-2 border-white/10 shadow-2xl"
          style={{ backgroundColor: STATE_COLORS[currentState].bg }}
        >
          {/* Audio ring */}
          <AudioRing state={currentState} audioLevel={audioLevel} />

          {/* Central icon */}
          <ZeroIcon state={currentState} />
        </div>

        {/* Mic indicator */}
        <motion.div
          className={`absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 ${
            currentState === 'listening'
              ? 'border-cyan-400 bg-cyan-500'
              : 'border-gray-600 bg-gray-700'
          }`}
          animate={{
            scale: currentState === 'listening' ? [1, 1.2, 1] : 1,
          }}
          transition={{
            duration: 1,
            repeat: currentState === 'listening' ? Infinity : 0,
          }}
        >
          {currentState === 'listening' ? (
            <Mic className="h-3 w-3 text-white" />
          ) : (
            <MicOff className="h-3 w-3 text-white/60" />
          )}
        </motion.div>

        {/* Wake word indicator */}
        {isWakeWordEnabled && currentState === 'idle' && (
          <motion.div
            className="absolute -top-1 -left-1 h-4 w-4 rounded-full border-2 border-green-400 bg-green-500"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            title='Wake word "ZERO" activo'
          />
        )}
      </motion.div>

      {/* Help text */}
      {currentState === 'idle' && !isExpanded && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-full left-1/2 mt-2 -translate-x-1/2 text-[10px] whitespace-nowrap text-white/40"
        >
          Click o &quot;ZERO&quot; • Derecho para opciones
        </motion.p>
      )}
    </motion.div>
  )
}

export default ZeroAIWidget
