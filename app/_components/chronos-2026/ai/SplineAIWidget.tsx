// @ts-nocheck
/**
 * 🤖✨ SPLINE AI WIDGET — CHRONOS INFINITY 2026 PREMIUM EDITION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * Widget de Asistente IA 3D Ultra-Premium con Orb Fullscreen
 * Features PREMIUM:
 * - Orb 3D COMPLETO como fondo interactivo
 * - Chat con glassmorphism GEN5 sobre el orb
 * - Hover & scroll effects cinematográficos
 * - Voice call mode con comando "ZERO"
 * - Animaciones de llamada activa
 * - Efectos de parallax y partículas
 * - Sistema de reconocimiento de voz
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { cn } from '@/app/lib/utils'
import { AnimatePresence, motion } from 'motion/react'
import { Bot, Mic, MicOff, Phone, PhoneOff, Send, Sparkles, Volume2, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import React, { memo, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { GLOW_EFFECTS, GRADIENTS, hexToRgba, SHADOWS } from './AdvancedColorSystem'
import { AudioReactiveOrb, useAudioReactive } from './AudioReactive'
import { AudioVisualizer, VoiceIndicator } from './AudioVisualizer'
import { scaleIn, shimmer, SPRING_CONFIGS } from './CinematicAnimations'
import { useDeviceOrientation, useGesture, useMouseParallax } from './GestureControls'
import {
    ChromaticAberration,
    CyberGrid,
    HologramOverlay,
    MatrixRain,
    NeonGlow,
    SpotlightEffect,
} from './HolographicEffects'
import { EnergyField, QuantumParticles } from './QuantumParticles'
import { WebGLOrb } from './WebGLOrb'

// Lazy load Spline para mejor performance - usando /next para compatibilidad con Next.js 16
const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
  loading: () => <SplineLoadingState />,
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

// Web Speech API types
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  lang: string
  interimResults: boolean
  onresult: (event: SpeechRecognitionEvent) => void
  onerror: (event: Event) => void
  start: () => void
  stop: () => void
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

// Tipos para Speech Recognition API (ignorar conflictos con tipos nativos)
type CustomSpeechRecognition = SpeechRecognition
type CustomWindow = Window & {
  SpeechRecognition?: new () => CustomSpeechRecognition
  webkitSpeechRecognition?: new () => CustomSpeechRecognition
}

export type AIStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error' | 'voice-call'

export type InteractionMode = 'chat' | 'voice-call'

export type PanelContext =
  | 'dashboard'
  | 'ventas'
  | 'clientes'
  | 'bancos'
  | 'distribuidores'
  | 'almacen'
  | 'movimientos'
  | 'gastos'
  | 'ordenes'
  | 'reportes'
  | 'ia'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface SplineAIWidgetProps {
  panelContext: PanelContext
  onQuery?: (_query: string) => Promise<string>
  onAction?: (_action: string, _params?: Record<string, unknown>) => void
  className?: string
  variant?: 'floating' | 'embedded' | 'minimal'
  defaultOpen?: boolean
  accentColor?: string
  showChat?: boolean
  enableVoiceCall?: boolean
  voiceActivationWord?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PANEL-SPECIFIC AI PERSONAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const AI_PERSONAS: Record<
  PanelContext,
  { name: string; greeting: string; color: string; glow: string }
> = {
  dashboard: {
    name: 'CHRONOS',
    greeting: '¡Hola! Soy CHRONOS, tu asistente del dashboard. ¿Qué métricas te gustaría analizar?',
    color: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.6)',
  },
  ventas: {
    name: 'VENUS',
    greeting:
      '¡Saludos! Soy VENUS, especialista en ventas. Puedo ayudarte a registrar ventas, analizar tendencias o gestionar pagos.',
    color: '#10B981',
    glow: 'rgba(16, 185, 129, 0.6)',
  },
  clientes: {
    name: 'ARTEMIS',
    greeting:
      '¡Bienvenido! Soy ARTEMIS, tu guía de clientes. ¿Necesitas buscar un cliente o ver su historial?',
    color: '#06B6D4',
    glow: 'rgba(6, 182, 212, 0.6)',
  },
  bancos: {
    name: 'MIDAS',
    greeting:
      '¡Hola! Soy MIDAS, guardián de las bóvedas. Puedo mostrarte el capital de cada banco o registrar movimientos.',
    color: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.6)',
  },
  distribuidores: {
    name: 'HERMES',
    greeting:
      '¡Saludos! Soy HERMES, conector de distribuidores. ¿Buscas información de algún proveedor?',
    color: '#EC4899',
    glow: 'rgba(236, 72, 153, 0.6)',
  },
  almacen: {
    name: 'ATLAS',
    greeting: '¡Bienvenido al almacén! Soy ATLAS, puedo ayudarte a gestionar inventario y stock.',
    color: '#14B8A6',
    glow: 'rgba(20, 184, 166, 0.6)',
  },
  movimientos: {
    name: 'KRONOS',
    greeting:
      '¡Hola! Soy KRONOS, registro del tiempo. Puedo mostrarte el historial de movimientos financieros.',
    color: '#F97316',
    glow: 'rgba(249, 115, 22, 0.6)',
  },
  gastos: {
    name: 'PLUTÓN',
    greeting:
      '¡Saludos! Soy PLUTÓN, controlador de gastos. ¿Necesitas registrar un gasto o ver el desglose?',
    color: '#EF4444',
    glow: 'rgba(239, 68, 68, 0.6)',
  },
  ordenes: {
    name: 'HERA',
    greeting: '¡Bienvenido! Soy HERA, gestora de órdenes. Puedo ayudarte con órdenes de compra.',
    color: '#A855F7',
    glow: 'rgba(168, 85, 247, 0.6)',
  },
  reportes: {
    name: 'ORACLE',
    greeting: '¡Hola! Soy ORACLE, generador de reportes. ¿Qué tipo de reporte necesitas?',
    color: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.6)',
  },
  ia: {
    name: 'NEXUS',
    greeting: '¡Saludos! Soy NEXUS, la IA central de CHRONOS. Tengo acceso a todos los sistemas.',
    color: '#8B5CF6',
    glow: 'rgba(139, 92, 246, 0.8)',
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PARTICLE EFFECTS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const ParticleField = memo(function ParticleField({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1,
            height: Math.random() * 4 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: color,
            opacity: 0.3,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VOICE CALL INDICATOR — ULTRA-PREMIUM con Audio Visualizer
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const VoiceCallIndicator = memo(function VoiceCallIndicator({
  isActive,
  persona,
  audioData,
}: {
  isActive: boolean
  persona: (typeof AI_PERSONAS)[PanelContext]
  audioData?: { volume: number; bass: number; mid: number; treble: number; frequencies: Uint8Array }
}) {
  if (!isActive) return null

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-8"
    >
      {/* Chromatic aberration effect en todo el indicador */}
      <ChromaticAberration intensity={audioData?.volume || 0.5} isActive={isActive}>
        <>
          {/* Pulse rings reactivos al audio */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2"
              style={{
                borderColor: persona.color,
                width: 120 + i * 80,
                height: 120 + i * 80,
                opacity: 0.4 - i * 0.08,
              }}
              animate={{
                scale: [1, 1.3 + (audioData?.volume || 0) * 0.5, 1],
                opacity: [0.4, 0, 0.4],
              }}
              transition={{
                duration: 2 + i * 0.3,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}

          {/* Voice Indicator central */}
          <div className="relative z-10">
            <VoiceIndicator isListening={isActive} />
          </div>

          {/* Centro con icono de llamada */}
          <motion.div
            className="absolute z-20 rounded-full p-8"
            style={{
              background: `linear-gradient(135deg, ${persona.color}60, ${persona.color}30)`,
              backdropFilter: 'blur(40px)',
              border: `3px solid ${persona.color}`,
              boxShadow: `
                0 0 80px ${persona.glow},
                0 0 40px ${persona.color},
                inset 0 0 20px ${persona.color}40
              `,
            }}
            animate={{
              scale: [1, 1.08 + (audioData?.volume || 0) * 0.2, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <Phone className="h-14 w-14" style={{ color: persona.color }} />
          </motion.div>

          {/* Audio visualizer inferior */}
          {audioData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-1/4 w-full max-w-md"
            >
              <AudioVisualizer
                isActive={isActive}
                color={persona.color.includes('8B5CF6') ? 'violet' : 'cyan'}
                bars={48}
              />
            </motion.div>
          )}

          {/* Frequency bars circulares alrededor */}
          {audioData?.frequencies && audioData.frequencies.length > 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              {Array.from({ length: 64 }).map((_, i) => {
                const angle = (i / 64) * Math.PI * 2
                const freqIndex = i * 2
                const freqValue = freqIndex < audioData.frequencies.length ? audioData.frequencies[freqIndex] : 0
                const freq = (freqValue ?? 0) / 255
                const radius = 200
                const x = Math.cos(angle) * radius
                const y = Math.sin(angle) * radius

                return (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      width: 4,
                      height: 8 + freq * 40,
                      background: `linear-gradient(to top, ${persona.color}, transparent)`,
                      transformOrigin: 'bottom center',
                      transform: `rotate(${angle}rad)`,
                      boxShadow: `0 0 ${freq * 20}px ${persona.color}`,
                    }}
                    animate={{
                      opacity: 0.5 + freq * 0.5,
                    }}
                    transition={{ duration: 0.05 }}
                  />
                )
              })}
            </div>
          )}
        </>
      </ChromaticAberration>

      {/* Call active text */}
      <motion.div
        className="absolute bottom-32 left-1/2 -translate-x-1/2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div
          className="rounded-full px-6 py-2 text-sm font-bold tracking-wider backdrop-blur-xl"
          style={{
            background: `${persona.color}20`,
            border: `1px solid ${persona.color}60`,
            color: persona.color,
            boxShadow: `0 0 20px ${persona.glow}`,
          }}
        >
          🎙️ LLAMADA ACTIVA
        </div>
      </motion.div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// LOADING STATE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function SplineLoadingState() {
  return (
    <motion.div
      className="relative flex h-full w-full items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Mesh gradient background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(at 40% 20%, hsla(280, 100%, 70%, 0.3) 0px, transparent 50%),
            radial-gradient(at 80% 0%, hsla(190, 100%, 70%, 0.3) 0px, transparent 50%),
            radial-gradient(at 0% 50%, hsla(340, 100%, 70%, 0.3) 0px, transparent 50%)
          `,
        }}
      />

      {/* Animated orb placeholder con efectos avanzados */}
      <div className="relative">
        {/* Cyber Grid */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`grid-${i}`}
              className="absolute h-full w-px bg-violet-500/30"
              style={{ left: `${i * 12.5}%` }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </div>

        {/* Outer glow rings con spring physics */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2"
            style={{
              width: 100 + i * 40,
              height: 100 + i * 40,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              borderColor: `rgba(139,92,246,${0.4 - i * 0.08})`,
              boxShadow: GLOW_EFFECTS.violet(0.5 - i * 0.1),
            }}
            animate={{
              scale: [1, 1.3, 1],
              rotate: i % 2 === 0 ? [0, 360] : [360, 0],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              ...SPRING_CONFIGS.gentle,
              duration: 3 + i,
              delay: i * 0.4,
              repeat: Infinity,
            }}
          />
        ))}

        {/* Particles around core */}
        {[...Array(12)].map((_, i) => {
          const angle = (i / 12) * Math.PI * 2
          const radius = 60
          return (
            <motion.div
              key={`particle-${i}`}
              className="absolute h-2 w-2 rounded-full bg-violet-500"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: -1,
                marginTop: -1,
              }}
              animate={{
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 3,
                delay: i * 0.1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          )
        })}

        {/* Core orb con breathing animation */}
        <motion.div
          className="relative h-20 w-20 rounded-full"
          style={{
            background: GRADIENTS.violetNight,
            boxShadow: GLOW_EFFECTS.violet(1.5),
          }}
          animate={{
            scale: [1, 1.15, 1],
            rotate: [0, 360],
          }}
          transition={{
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            },
            rotate: {
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            },
          }}
        >
          {/* Inner glow */}
          <motion.div
            className="absolute inset-2 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)',
            }}
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />

          <Bot className="absolute top-1/2 left-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-lg" />
        </motion.div>

        {/* Loading text */}
        <motion.div
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-sm font-semibold whitespace-nowrap text-violet-400"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Inicializando IA...
        </motion.div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// STATUS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const StatusIndicator = memo(function StatusIndicator({
  status,
  color,
}: {
  status: AIStatus
  color: string
}) {
  const statusConfig = {
    idle: { icon: Sparkles, label: 'Listo', pulse: false },
    listening: { icon: Mic, label: 'Escuchando...', pulse: true },
    thinking: { icon: Sparkles, label: 'Pensando...', pulse: true },
    speaking: { icon: Volume2, label: 'Hablando...', pulse: true },
    error: { icon: MicOff, label: 'Error', pulse: false },
    'voice-call': { icon: Phone, label: 'En llamada', pulse: true },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <motion.div
      className="group relative flex items-center gap-2 overflow-hidden rounded-full px-4 py-2 backdrop-blur-3xl"
      style={{
        background: hexToRgba(color, 0.08),
        border: `1.5px solid ${hexToRgba(color, 0.3)}`,
        boxShadow: config.pulse ? GLOW_EFFECTS.violet(0.8) : SHADOWS.sm,
      }}
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      whileHover={{
        scale: 1.05,
        boxShadow: GLOW_EFFECTS.violet(1.2),
        transition: SPRING_CONFIGS.snappy,
      }}
    >
      {/* Shimmer effect en pulse */}
      {config.pulse && (
        <motion.div
          className="absolute inset-0 opacity-40"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
            backgroundSize: '200% 100%',
          }}
          animate={shimmer}
        />
      )}

      {/* Icono animado */}
      <motion.div
        className="relative z-10"
        animate={config.pulse ? { rotate: [0, 360], scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        <Icon className="h-3.5 w-3.5" style={{ color }} />
      </motion.div>
      <span className="text-xs font-medium" style={{ color }}>
        {config.label}
      </span>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// RGB GLOW EFFECT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const RGBGlowRing = memo(function RGBGlowRing({
  size = 200,
  intensity = 1,
}: {
  size?: number
  intensity?: number
}) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {/* RGB rotating ring */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: size,
          height: size,
          background: `conic-gradient(
            from 0deg,
            rgba(255,0,0,${0.3 * intensity}),
            rgba(255,127,0,${0.3 * intensity}),
            rgba(255,255,0,${0.3 * intensity}),
            rgba(0,255,0,${0.3 * intensity}),
            rgba(0,255,255,${0.3 * intensity}),
            rgba(0,0,255,${0.3 * intensity}),
            rgba(139,0,255,${0.3 * intensity}),
            rgba(255,0,255,${0.3 * intensity}),
            rgba(255,0,0,${0.3 * intensity})
          )`,
          filter: 'blur(20px)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Inner dark mask */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.7,
          height: size * 0.7,
          background: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.9) 70%)',
        }}
      />
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ULTRA-PREMIUM CHAT INTERFACE WITH GLASSMORPHISM GEN5
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ChatInterfaceProps {
  messages: ChatMessage[]
  onSend: (_message: string) => void
  status: AIStatus
  persona: (typeof AI_PERSONAS)[PanelContext]
}

const ChatInterface = memo(function ChatInterface({
  messages,
  onSend,
  status,
  persona,
}: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  // Parallax scroll effect
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollY(container.scrollTop)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (input.trim() && status !== 'thinking') {
        onSend(input.trim())
        setInput('')
      }
    },
    [input, onSend, status],
  )

  return (
    <div className="relative flex h-full flex-col">
      {/* Messages area con parallax */}
      <div
        ref={containerRef}
        className="spline-ai-chat-scroll relative flex-1 space-y-4 overflow-y-auto p-6"
        style={{
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 5%, black 95%, transparent 100%)',
        }}
      >
        {messages.map((msg, index) => {
          const yOffset = scrollY * 0.1 * (index % 3)

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{
                transform: `translateY(${yOffset}px)`,
              }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 25,
              }}
              className={cn(
                'group relative max-w-[82%]',
                msg.role === 'user' ? 'ml-auto' : 'mr-auto',
              )}
            >
              {/* Mensaje con glassmorphism avanzado */}
              <div
                className={cn(
                  'relative overflow-hidden rounded-2xl px-5 py-3.5 text-sm leading-relaxed backdrop-blur-2xl transition-all duration-300',
                  msg.role === 'user'
                    ? 'bg-linear-to-br from-white/15 to-white/5 text-white shadow-xl group-hover:from-white/20 group-hover:to-white/10'
                    : 'text-white shadow-2xl',
                )}
                style={
                  msg.role === 'assistant'
                    ? {
                        background: `linear-gradient(135deg, ${persona.color}25 0%, ${persona.color}10 50%, transparent 100%)`,
                        border: `1px solid ${persona.color}30`,
                        boxShadow: `
                          0 8px 32px -8px ${persona.glow}40,
                          0 0 0 1px ${persona.color}20,
                          inset 0 1px 0 rgba(255,255,255,0.15),
                          inset 0 -1px 0 rgba(0,0,0,0.1)
                        `,
                      }
                    : {
                        border: '1px solid rgba(255,255,255,0.15)',
                        boxShadow: `
                          0 8px 32px -8px rgba(0,0,0,0.3),
                          0 0 0 1px rgba(255,255,255,0.1),
                          inset 0 1px 0 rgba(255,255,255,0.2)
                        `,
                      }
                }
              >
                {/* Glow interno */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    background:
                      msg.role === 'assistant'
                        ? `radial-gradient(circle at 50% 0%, ${persona.color}20, transparent 60%)`
                        : 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.1), transparent 60%)',
                  }}
                />

                {/* Contenido */}
                <div className="relative z-10">{msg.content}</div>

                {/* Timestamp */}
                <div className="relative z-10 mt-1.5 text-right text-[10px] opacity-50">
                  {msg.timestamp.toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>

              {/* Efecto de brillo al hover */}
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(circle at 50% 50%, ${persona.color}15, transparent 70%)`,
                  filter: 'blur(20px)',
                }}
              />
            </motion.div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area ultra-premium */}
      <div className="relative border-t border-white/10 bg-black/20 p-4 backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative flex gap-3">
            {/* Input con glassmorphism */}
            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Pregunta a ${persona.name}...`}
                disabled={status === 'thinking'}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-sm text-white backdrop-blur-xl transition-all duration-300 placeholder:text-white/40 focus:border-transparent focus:ring-2 focus:outline-none disabled:opacity-50"
                style={{
                  boxShadow: `
                    0 4px 16px -4px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.1)
                  `,
                }}
                onFocus={(e) => {
                  e.currentTarget.style.boxShadow = `
                    0 8px 24px -8px ${persona.glow}50,
                    0 0 0 2px ${persona.color}
                  `
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = `
                    0 4px 16px -4px rgba(0,0,0,0.3),
                    inset 0 1px 0 rgba(255,255,255,0.1)
                  `
                }}
              />
            </div>

            {/* Botón enviar con efectos premium */}
            <motion.button
              type="submit"
              disabled={!input.trim() || status === 'thinking'}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group relative overflow-hidden rounded-xl p-4 transition-all disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                background: input.trim()
                  ? `linear-gradient(135deg, ${persona.color}, ${persona.color}90)`
                  : 'rgba(255,255,255,0.05)',
                boxShadow: input.trim()
                  ? `0 8px 24px -8px ${persona.glow}, 0 0 0 1px ${persona.color}40`
                  : '0 4px 12px -4px rgba(0,0,0,0.3)',
              }}
            >
              {/* Efecto shimmer */}
              {input.trim() && (
                <motion.div
                  className="absolute inset-0 opacity-30"
                  animate={{
                    background: [
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                      'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                    ],
                    backgroundPosition: ['-200%', '200%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                />
              )}

              <Send className="relative z-10 h-5 w-5 text-white transition-transform group-hover:rotate-12" />
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: SplineAIWidget
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const SplineAIWidget = memo(function SplineAIWidget({
  panelContext,
  onQuery,
  onAction,
  className,
  variant = 'floating',
  defaultOpen = false,
  showChat = true,
  enableVoiceCall = true,
  voiceActivationWord = 'ZERO',
}: SplineAIWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [status, setStatus] = useState<AIStatus>('idle')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('chat')
  const [isListeningForActivation, setIsListeningForActivation] = useState(false)
  const recognitionRef = useRef<CustomSpeechRecognition | null>(null)
  const persona = AI_PERSONAS[panelContext]

  // 🎮 ADVANCED HOOKS — Hooks avanzados para interacciones premium
  const containerRef = useRef<HTMLDivElement>(null)
  const { mousePosition, parallaxOffset } = useMouseParallax(30)
  const { orientation, isSupported: gyroSupported } = useDeviceOrientation()
  const gestureState = useGesture(containerRef, {
    onPinch: (scale) => console.log('Pinch:', scale),
    onSwipe: (direction) => console.log('Swipe:', direction),
    onDoubleTap: () => setIsOpen(!isOpen),
  })

  // 🎵 AUDIO REACTIVE — Sistema de audio reactivo
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null)
  const audioData = useAudioReactive(audioStream || undefined)

  // Initialize with greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'greeting',
          role: 'assistant',
          content: persona.greeting,
          timestamp: new Date(),
        },
      ])
    }
  }, [persona.greeting, messages.length])

  // Voice Recognition Setup
  useEffect(() => {
    if (!enableVoiceCall || typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.lang = 'es-MX'
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1]?.[0]
      if (!result) return
      const transcript = result.transcript.trim().toUpperCase()

      if (transcript.includes(voiceActivationWord)) {
        setInteractionMode('voice-call')
        setStatus('voice-call')
        setIsListeningForActivation(false)

        // Agregar mensaje de activación
        setMessages((prev) => [
          ...prev,
          {
            id: `voice-${Date.now()}`,
            role: 'assistant',
            content: '🎙️ Llamada de voz activada. Dime, ¿en qué puedo ayudarte?',
            timestamp: new Date(),
          },
        ])
      }
    }

    recognitionRef.current = recognition as CustomSpeechRecognition
    return () => recognition.stop()
  }, [enableVoiceCall, voiceActivationWord])

  const toggleVoiceActivation = useCallback(() => {
    if (!recognitionRef.current) return

    if (isListeningForActivation) {
      recognitionRef.current.stop()
      setIsListeningForActivation(false)
    } else {
      recognitionRef.current.start()
      setIsListeningForActivation(true)
    }
  }, [isListeningForActivation])

  const endVoiceCall = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setInteractionMode('chat')
    setStatus('idle')
    setIsListeningForActivation(false)

    setMessages((prev) => [
      ...prev,
      {
        id: `voice-end-${Date.now()}`,
        role: 'assistant',
        content: '✅ Llamada finalizada. Vuelvo al modo chat.',
        timestamp: new Date(),
      },
    ])
  }, [])

  const handleSendMessage = useCallback(
    async (content: string) => {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setStatus('thinking')

      try {
        const response = onQuery
          ? await onQuery(content)
          : `Entendido. Has preguntado sobre "${content}" en el contexto de ${panelContext}. Esta funcionalidad de IA está en desarrollo.`

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: 'Lo siento, hubo un error al procesar tu consulta.',
            timestamp: new Date(),
          },
        ])
      } finally {
        setStatus('idle')
      }
    },
    [onQuery, panelContext],
  )

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // FLOATING VARIANT — ULTRA-PREMIUM WITH FULLSCREEN ORB BACKGROUND
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  if (variant === 'floating') {
    return (
      <>
        {/* Floating trigger button - ULTRA-PREMIUM */}
        <motion.button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed right-6 bottom-6 z-50 h-20 w-20 overflow-hidden rounded-full',
            isOpen && 'pointer-events-none opacity-0',
            className,
          )}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.95 }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          style={{
            background: `linear-gradient(135deg, ${persona.color}, ${persona.color}80)`,
            boxShadow: `0 0 50px ${persona.glow}, 0 0 100px ${persona.glow}50, 0 10px 40px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Animated pulse rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              animate={{
                scale: [1, 1.4 + i * 0.2, 1],
                opacity: [0.6, 0, 0.6],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              style={{ background: `${persona.color}40` }}
            />
          ))}
          <RGBGlowRing size={90} intensity={0.8} />
          <Bot className="absolute top-1/2 left-1/2 z-10 h-9 w-9 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-2xl" />
        </motion.button>

        {/* ULTRA-PREMIUM FLOATING PANEL - ORB COMO FONDO COMPLETO */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 40 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:inset-auto sm:right-6 sm:bottom-6 sm:h-[85vh] sm:max-h-225 sm:w-130"
            >
              {/* Main container */}
              <div
                className="relative h-full w-full overflow-hidden rounded-3xl"
                style={{
                  background: 'rgba(5, 5, 15, 0.6)',
                  backdropFilter: 'blur(80px) saturate(200%)',
                  border: `1px solid ${persona.color}50`,
                  boxShadow: `
                    0 40px 120px -30px ${persona.glow},
                    0 0 80px ${persona.glow}40,
                    0 0 2px ${persona.color},
                    inset 0 1px 0 rgba(255,255,255,0.15),
                    inset 0 -1px 0 rgba(0,0,0,0.3)
                  `,
                }}
              >
                {/* ORB 3D FULLSCREEN BACKGROUND - ABSOLUTO CON EFECTOS SUPREMOS */}
                <div
                  ref={containerRef}
                  className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
                  style={{
                    transform: `translate3d(${parallaxOffset.x}px, ${parallaxOffset.y}px, 0) rotateX(${orientation.beta * 0.1}deg) rotateY(${orientation.gamma * 0.1}deg)`,
                    transition: 'transform 0.3s ease-out',
                  }}
                >
                  {/* 🌐 WEBGL ORB SHADER — Orb con shaders personalizados */}
                  <WebGLOrb
                    isActive={isOpen}
                    intensity={audioData.volume * 2 + 1}
                    colorScheme={persona.color.includes('8B5CF6') ? 'violet' : 'cyan'}
                  />

                  {/* ✨ QUANTUM PARTICLES — Partículas cuánticas interactivas */}
                  <QuantumParticles
                    count={interactionMode === 'voice-call' ? 80 : 50}
                    colors={[persona.color, `${persona.color}80`, `${persona.color}40`]}
                    speed={audioData.volume * 2 + 1}
                    isActive={isOpen}
                  />

                  {/* ⚡ ENERGY FIELD — Campo de energía alrededor */}
                  <EnergyField
                    isActive={interactionMode === 'voice-call'}
                    intensity={audioData.volume + 0.5}
                  />

                  {/* 🌈 CYBER GRID — Grid cibernético de fondo */}
                  <CyberGrid opacity={0.08} />

                  {/* 💎 HOLOGRAM OVERLAY — Efecto holográfico */}
                  <HologramOverlay
                    isActive={status === 'thinking' || interactionMode === 'voice-call'}
                  />

                  {/* 🌟 MATRIX RAIN — Lluvia Matrix si está activa la llamada */}
                  {interactionMode === 'voice-call' && <MatrixRain speed={1.5} density={15} />}

                  {/* 💫 NEON GLOW — Resplandor de neón animado */}
                  <NeonGlow
                    color={persona.color.includes('8B5CF6') ? 'violet' : 'cyan'}
                    intensity={audioData.volume * 2 + 0.5}
                    pulse={true}
                  />

                  {/* 🌠 SPOTLIGHT EFFECT — Foco que sigue el mouse */}
                  <SpotlightEffect mousePosition={mousePosition} />

                  {/* 🎶 AUDIO REACTIVE ORB — Orb reactivo al audio (durante llamada) */}
                  {interactionMode === 'voice-call' && audioData.isPlaying && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <AudioReactiveOrb audioData={audioData} baseSize={300} />
                    </div>
                  )}

                  {/* SPLINE ORB 3D — El orb 3D original con escala y parallax */}
                  <motion.div
                    className="absolute inset-0"
                    animate={{
                      scale: [1.2, 1.25, 1.2],
                      rotate: interactionMode === 'voice-call' ? [0, 360] : 0,
                    }}
                    transition={{
                      scale: {
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      },
                      rotate: {
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                      },
                    }}
                    style={{
                      opacity: 0.6,
                      filter: `blur(${audioData.volume * 5}px) brightness(${1 + audioData.volume * 0.5})`,
                    }}
                  >
                    <Suspense fallback={<SplineLoadingState />}>
                      <Spline
                        scene="/spline/ai_voice_orb.splinecode"
                        style={{
                          width: '100%',
                          height: '100%',
                          pointerEvents: 'none',
                        }}
                      />
                    </Suspense>
                  </motion.div>

                  {/* RGB Glow rings múltiples */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <RGBGlowRing size={400} intensity={audioData.bass * 2 + 0.5} />
                    <RGBGlowRing size={600} intensity={audioData.mid * 2 + 0.3} />
                    <RGBGlowRing size={800} intensity={audioData.treble * 2 + 0.2} />
                  </div>

                  {/* Partículas ambientales adicionales */}
                  <ParticleField color={persona.color} />
                </div>

                {/* Voice Call Indicator Overlay con Audio Data */}
                <AnimatePresence>
                  {interactionMode === 'voice-call' && (
                    <VoiceCallIndicator isActive persona={persona} audioData={audioData} />
                  )}
                </AnimatePresence>

                {/* Header controls - SOBRE EL ORB */}
                <div className="relative z-20 flex items-start justify-between p-6">
                  <div className="flex items-center gap-3">
                    {/* AI Name badge ultra-premium */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="group relative overflow-hidden rounded-2xl px-6 py-3"
                      style={{
                        background: `linear-gradient(135deg, ${persona.color}80, ${persona.color}40)`,
                        backdropFilter: 'blur(30px)',
                        border: `1.5px solid ${persona.color}`,
                        boxShadow: `
                          0 8px 32px -8px ${persona.glow},
                          0 0 0 1px ${persona.color}50,
                          inset 0 1px 0 rgba(255,255,255,0.3)
                        `,
                      }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 opacity-40"
                        animate={{
                          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                          backgroundSize: '200% 100%',
                        }}
                      />

                      <span className="relative z-10 text-lg font-black tracking-wider text-white drop-shadow-lg">
                        {persona.name}
                      </span>
                    </motion.div>

                    {/* 🎙️ VOICE CALL BUTTON — Botón premium para activar llamada por voz */}
                    {enableVoiceCall && (
                      <motion.button
                        onClick={toggleVoiceActivation}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                        className="group relative overflow-hidden rounded-xl px-5 py-3 backdrop-blur-3xl"
                        style={{
                          background:
                            interactionMode === 'voice-call' || isListeningForActivation
                              ? `linear-gradient(135deg, ${persona.color}90, ${persona.color}60)`
                              : 'rgba(255,255,255,0.06)',
                          border: `1.5px solid ${interactionMode === 'voice-call' || isListeningForActivation ? persona.color : 'rgba(255,255,255,0.1)'}`,
                          boxShadow:
                            interactionMode === 'voice-call' || isListeningForActivation
                              ? `0 8px 32px -8px ${persona.glow}, 0 0 20px ${persona.color}40`
                              : '0 4px 16px rgba(0,0,0,0.2)',
                        }}
                      >
                        {/* Pulse animation cuando está escuchando */}
                        {(interactionMode === 'voice-call' || isListeningForActivation) && (
                          <>
                            {[...Array(3)].map((_, i) => (
                              <motion.div
                                key={i}
                                className="absolute inset-0 rounded-xl"
                                style={{
                                  border: `2px solid ${persona.color}`,
                                }}
                                animate={{
                                  scale: [1, 1.5, 1],
                                  opacity: [0.6, 0, 0.6],
                                }}
                                transition={{
                                  duration: 2,
                                  delay: i * 0.4,
                                  repeat: Infinity,
                                }}
                              />
                            ))}
                          </>
                        )}

                        <div className="relative z-10 flex items-center gap-2">
                          {interactionMode === 'voice-call' ? (
                            <>
                              <PhoneOff className="h-5 w-5 text-white" />
                              <span className="text-sm font-semibold text-white">Colgar</span>
                            </>
                          ) : isListeningForActivation ? (
                            <>
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              >
                                <Mic className="h-5 w-5 text-white" />
                              </motion.div>
                              <span className="text-sm font-semibold text-white">
                                Escuchando...
                              </span>
                            </>
                          ) : (
                            <>
                              <Phone className="h-5 w-5 text-white/80" />
                              <span className="text-sm font-semibold text-white/80">Llamar</span>
                            </>
                          )}
                        </div>

                        {/* Tooltip hint para voz */}
                        {!isListeningForActivation && interactionMode !== 'voice-call' && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            className="pointer-events-none absolute -bottom-12 left-1/2 z-50 -translate-x-1/2 rounded-lg px-3 py-1.5 text-xs whitespace-nowrap backdrop-blur-2xl"
                            style={{
                              background: 'rgba(0,0,0,0.8)',
                              border: '1px solid rgba(255,255,255,0.1)',
                            }}
                          >
                            Di "<strong className="text-violet-400">{voiceActivationWord}</strong>"
                            para activar
                          </motion.div>
                        )}
                      </motion.button>
                    )}
                  </div>

                  {/* Close button ultra-premium */}
                  <motion.button
                    onClick={() => {
                      setIsOpen(false)
                      if (interactionMode === 'voice-call') {
                        endVoiceCall()
                      }
                    }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="group relative overflow-hidden rounded-full p-3.5 backdrop-blur-2xl transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.08)',
                      border: '1.5px solid rgba(255,255,255,0.15)',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                    }}
                  >
                    <X className="relative z-10 h-6 w-6 text-white/90" />
                  </motion.button>
                </div>

                {/* Status bar - GLASSMORPHISM */}
                <div className="relative z-20 mx-6 mb-4">
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-2xl"
                    style={{
                      boxShadow: `
                        0 4px 16px rgba(0,0,0,0.2),
                        inset 0 1px 0 rgba(255,255,255,0.15)
                      `,
                    }}
                  >
                    <StatusIndicator status={status} color={persona.color} />

                    {/* Voice controls */}
                    {enableVoiceCall && (
                      <div className="flex gap-2">
                        {/* Voice activation toggle */}
                        <motion.button
                          onClick={toggleVoiceActivation}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={cn(
                            'group relative overflow-hidden rounded-xl p-2.5 transition-all',
                            isListeningForActivation && 'animate-pulse',
                          )}
                          style={{
                            background: isListeningForActivation
                              ? `linear-gradient(135deg, ${persona.color}80, ${persona.color}50)`
                              : 'rgba(255,255,255,0.05)',
                            border: isListeningForActivation
                              ? `1px solid ${persona.color}`
                              : '1px solid rgba(255,255,255,0.1)',
                            boxShadow: isListeningForActivation
                              ? `0 0 20px ${persona.glow}`
                              : 'none',
                          }}
                        >
                          <Mic className="h-4 w-4 text-white" />
                        </motion.button>

                        {/* End voice call button */}
                        {interactionMode === 'voice-call' && (
                          <motion.button
                            onClick={endVoiceCall}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="rounded-xl bg-red-500/80 p-2.5 backdrop-blur-xl transition-all hover:bg-red-500"
                            style={{
                              boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                            }}
                          >
                            <PhoneOff className="h-4 w-4 text-white" />
                          </motion.button>
                        )}
                      </div>
                    )}
                  </motion.div>

                  {/* Voice activation hint */}
                  {enableVoiceCall && isListeningForActivation && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-2 text-center text-xs text-white/60"
                    >
                      🎤 Di "{voiceActivationWord}" para activar llamada
                    </motion.div>
                  )}
                </div>

                {/* Chat area - GLASSMORPHISM SOBRE EL ORB */}
                {showChat && (
                  <div className="relative z-10 h-[calc(100%-180px)]">
                    <ChatInterface
                      messages={messages}
                      onSend={handleSendMessage}
                      status={status}
                      persona={persona}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // EMBEDDED VARIANT
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  if (variant === 'embedded') {
    return (
      <div
        className={cn('relative h-full overflow-hidden rounded-2xl', className)}
        style={{
          background: 'rgba(10, 10, 20, 0.8)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${persona.color}20`,
        }}
      >
        {/* Compact header with 3D */}
        <div className="relative h-32 overflow-hidden">
          <RGBGlowRing size={140} intensity={0.4} />
          <div className="absolute inset-0">
            <Suspense fallback={<SplineLoadingState />}>
              <Spline
                scene="/spline/ai_voice_orb.splinecode"
                style={{ width: '100%', height: '100%' }}
              />
            </Suspense>
          </div>

          <div className="absolute right-3 bottom-2 left-3 z-10 flex items-center justify-between">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold tracking-wider"
              style={{ background: `${persona.color}40`, color: persona.color }}
            >
              {persona.name}
            </span>
            <StatusIndicator status={status} color={persona.color} />
          </div>
        </div>

        {/* Chat */}
        {showChat && (
          <div className="h-[calc(100%-128px)]">
            <ChatInterface
              messages={messages}
              onSend={handleSendMessage}
              status={status}
              persona={persona}
            />
          </div>
        )}
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════
  // MINIMAL VARIANT (Just the orb)
  // ═══════════════════════════════════════════════════════════════════════════════════════════════

  return (
    <motion.div
      className={cn('relative cursor-pointer', className)}
      whileHover={{ scale: 1.05 }}
      onClick={() => onAction?.('toggle-ai')}
    >
      <RGBGlowRing size={100} intensity={0.5} />
      <div className="relative h-20 w-20">
        <Suspense fallback={<SplineLoadingState />}>
          <Spline
            scene="/spline/ai_voice_orb.splinecode"
            style={{ width: '100%', height: '100%' }}
          />
        </Suspense>
      </div>
      <StatusIndicator status={status} color={persona.color} />
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export default SplineAIWidget
