/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔮 THE ORACLE WITHIN — WIDGET DE IA PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Widget de Asistente IA Premium inspirado en diseño futurista con:
 * - Avatar personalizable con estados animados
 * - Interfaz clara, concisa y elegante
 * - Animaciones de carga, escritura y respuesta
 * - Integración con modelo de lenguaje (preparado para GPT-4/Claude)
 * - Contexto de conversación persistente
 * - Personalización del comportamiento del asistente
 * - Accesible desde cualquier página
 * - Diseño coherente con CHRONOS
 *
 * Inspirado en: https://i.pinimg.com/1200x/8b/72/e7/8b72e7904f2d3f687bd6051cf36962d6.jpg
 *
 * @version 1.0.0 SUPREME ELITE
 * @author CHRONOS INFINITY TEAM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import {
  Copy,
  Loader2,
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  RefreshCw,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// PALETA DE COLORES PREMIUM
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const PALETTE = {
  // Primarios
  void: '#000000',
  deepSpace: '#0a0a14',
  violetElectric: '#8B00FF',
  violetGlow: 'rgba(139, 0, 255, 0.4)',
  indigoCosmic: '#4B0082',
  // Acentos
  goldPremium: '#FFD700',
  goldGlow: 'rgba(255, 215, 0, 0.4)',
  plasmaPink: '#FF1493',
  plasmaGlow: 'rgba(255, 20, 147, 0.4)',
  emeraldSuccess: '#00FF88',
  emeraldGlow: 'rgba(0, 255, 136, 0.4)',
  // Neutrales
  silverStar: '#E0E0E0',
  white: '#FFFFFF',
  error: '#FF4444',
  // Glass
  glassLight: 'rgba(255, 255, 255, 0.06)',
  glassMedium: 'rgba(255, 255, 255, 0.10)',
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassHover: 'rgba(255, 255, 255, 0.15)',
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type OracleState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error'
type OraclePersonality = 'professional' | 'friendly' | 'concise' | 'creative'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  isTyping?: boolean
}

interface OracleAvatarConfig {
  name: string
  personality: OraclePersonality
  voiceEnabled: boolean
  contextMemory: boolean
}

interface TheOracleWithinProps {
  className?: string
  initialOpen?: boolean
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  onMessage?: (message: string, response: string) => void
  customConfig?: Partial<OracleAvatarConfig>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE AVATAR ORB - NÚCLEO VISUAL DEL ORACLE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OracleOrbProps {
  state: OracleState
  size?: 'sm' | 'md' | 'lg'
  audioLevel?: number
  onClick?: () => void
}

const OracleOrb = memo(function OracleOrb({
  state,
  size = 'md',
  audioLevel = 0,
  onClick,
}: OracleOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  const sizes = {
    sm: 48,
    md: 64,
    lg: 96,
  }

  const orbSize = sizes[size]

  // Colores según estado
  const stateColors = {
    idle: { primary: PALETTE.violetElectric, glow: PALETTE.violetGlow },
    listening: { primary: PALETTE.emeraldSuccess, glow: PALETTE.emeraldGlow },
    thinking: { primary: PALETTE.goldPremium, glow: PALETTE.goldGlow },
    speaking: { primary: PALETTE.plasmaPink, glow: PALETTE.plasmaGlow },
    error: { primary: PALETTE.error, glow: 'rgba(255, 68, 68, 0.4)' },
  }

  const colors = stateColors[state]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = orbSize * dpr
    canvas.height = orbSize * dpr
    ctx.scale(dpr, dpr)

    const cx = orbSize / 2
    const cy = orbSize / 2
    const baseRadius = orbSize * 0.35

    const animate = () => {
      timeRef.current += 0.016
      ctx.clearRect(0, 0, orbSize, orbSize)

      // Animaciones según estado
      let pulseScale = 1
      let rotationSpeed = 0.3
      let waveAmplitude = 0

      if (state === 'listening') {
        pulseScale = 1 + Math.sin(timeRef.current * 6) * 0.1 + audioLevel * 0.2
        rotationSpeed = 0.6
      } else if (state === 'thinking') {
        pulseScale = 1 + Math.sin(timeRef.current * 4) * 0.05
        rotationSpeed = 1.2
      } else if (state === 'speaking') {
        waveAmplitude = 0.2 + audioLevel * 0.3
        pulseScale = 1 + Math.sin(timeRef.current * 8) * waveAmplitude
        rotationSpeed = 0.8
      } else if (state === 'error') {
        pulseScale = 1 + Math.sin(timeRef.current * 10) * 0.15
      }

      const currentRadius = baseRadius * pulseScale

      // Glow exterior
      const outerGlow = ctx.createRadialGradient(
        cx,
        cy,
        currentRadius * 0.5,
        cx,
        cy,
        currentRadius * 2,
      )
      outerGlow.addColorStop(0, colors.glow)
      outerGlow.addColorStop(0.5, `${colors.primary}20`)
      outerGlow.addColorStop(1, 'transparent')

      ctx.fillStyle = outerGlow
      ctx.beginPath()
      ctx.arc(cx, cy, currentRadius * 2, 0, Math.PI * 2)
      ctx.fill()

      // Anillos de energía
      if (state === 'thinking' || state === 'listening') {
        for (let i = 0; i < 3; i++) {
          const ringProgress = (timeRef.current * rotationSpeed + i * 0.3) % 1
          const ringRadius = currentRadius * (1 + ringProgress * 0.8)
          const ringOpacity = (1 - ringProgress) * 0.4

          ctx.strokeStyle = `${colors.primary}${Math.round(ringOpacity * 255)
            .toString(16)
            .padStart(2, '0')}`
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      // Órbitas
      const orbitCount = state === 'thinking' ? 3 : 2
      for (let i = 0; i < orbitCount; i++) {
        const angle =
          timeRef.current * rotationSpeed * (i % 2 === 0 ? 1 : -1) + (i * Math.PI * 2) / orbitCount
        const orbitRadius = currentRadius * 0.7
        const nodeX = cx + Math.cos(angle) * orbitRadius
        const nodeY = cy + Math.sin(angle) * orbitRadius
        const nodeSize = 3

        // Glow del nodo
        const nodeGlow = ctx.createRadialGradient(nodeX, nodeY, 0, nodeX, nodeY, nodeSize * 4)
        nodeGlow.addColorStop(0, colors.glow)
        nodeGlow.addColorStop(1, 'transparent')
        ctx.fillStyle = nodeGlow
        ctx.beginPath()
        ctx.arc(nodeX, nodeY, nodeSize * 4, 0, Math.PI * 2)
        ctx.fill()

        // Nodo
        ctx.fillStyle = PALETTE.white
        ctx.beginPath()
        ctx.arc(nodeX, nodeY, nodeSize, 0, Math.PI * 2)
        ctx.fill()
      }

      // Núcleo central
      const coreGradient = ctx.createRadialGradient(
        cx - currentRadius * 0.2,
        cy - currentRadius * 0.2,
        0,
        cx,
        cy,
        currentRadius,
      )
      coreGradient.addColorStop(0, PALETTE.white)
      coreGradient.addColorStop(0.4, colors.primary)
      coreGradient.addColorStop(1, `${colors.primary}80`)

      ctx.fillStyle = coreGradient
      ctx.beginPath()
      ctx.arc(cx, cy, currentRadius, 0, Math.PI * 2)
      ctx.fill()

      // Highlight superior
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      ctx.beginPath()
      ctx.arc(
        cx - currentRadius * 0.25,
        cy - currentRadius * 0.25,
        currentRadius * 0.35,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      // Ondas de audio cuando habla
      if (state === 'speaking' && audioLevel > 0.1) {
        const barCount = 12
        for (let i = 0; i < barCount; i++) {
          const barAngle = (i / barCount) * Math.PI * 2 - Math.PI / 2
          const barHeight = 5 + audioLevel * 15 * Math.sin(timeRef.current * 10 + i * 0.5)
          const barX = cx + Math.cos(barAngle) * (currentRadius + 5)
          const barY = cy + Math.sin(barAngle) * (currentRadius + 5)
          const barEndX = cx + Math.cos(barAngle) * (currentRadius + 5 + barHeight)
          const barEndY = cy + Math.sin(barAngle) * (currentRadius + 5 + barHeight)

          ctx.strokeStyle = `${colors.primary}80`
          ctx.lineWidth = 2
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(barX, barY)
          ctx.lineTo(barEndX, barEndY)
          ctx.stroke()
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [state, audioLevel, orbSize, colors])

  return (
    <motion.button
      onClick={onClick}
      className="relative cursor-pointer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
    >
      <canvas ref={canvasRef} style={{ width: orbSize, height: orbSize }} />
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE VISUALIZADOR DE ONDAS DE VOZ
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VoiceVisualizerProps {
  isActive: boolean
  color?: string
  bars?: number
}

const VoiceVisualizer = memo(function VoiceVisualizer({
  isActive,
  color = PALETTE.violetElectric,
  bars = 24,
}: VoiceVisualizerProps) {
  return (
    <div className="flex h-8 items-center justify-center gap-[2px]">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-0.5 rounded-full"
          style={{ backgroundColor: color }}
          animate={
            isActive
              ? {
                  height: [4 + Math.random() * 6, 10 + Math.random() * 18, 4 + Math.random() * 8],
                  opacity: [0.4, 1, 0.6],
                }
              : { height: 3, opacity: 0.2 }
          }
          transition={
            isActive
              ? {
                  duration: 0.4 + Math.random() * 0.2,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  delay: i * 0.02,
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE DE MENSAJE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface MessageBubbleProps {
  message: Message
  onCopy?: () => void
  onRegenerate?: () => void
  onFeedback?: (positive: boolean) => void
}

const MessageBubble = memo(function MessageBubble({
  message,
  onCopy,
  onRegenerate,
  onFeedback,
}: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const [showActions, setShowActions] = useState(false)

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`relative max-w-[85%] ${isUser ? 'order-1' : 'order-2'}`}>
        {/* Burbuja */}
        <div
          className={`relative overflow-hidden rounded-2xl px-4 py-3 ${
            isUser ? 'rounded-br-md' : 'rounded-bl-md'
          }`}
          style={{
            background: isUser
              ? `linear-gradient(135deg, ${PALETTE.violetElectric}90, ${PALETTE.indigoCosmic}90)`
              : PALETTE.glassMedium,
            backdropFilter: isUser ? 'none' : 'blur(20px)',
            border: `1px solid ${isUser ? 'transparent' : PALETTE.glassBorder}`,
          }}
        >
          {/* Contenido */}
          {message.isTyping ? (
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-white/60"
                  animate={{ y: [0, -6, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/90">
              {message.content}
            </p>
          )}

          {/* Timestamp */}
          <p className={`mt-1 text-[10px] ${isUser ? 'text-white/40' : 'text-white/30'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Acciones para mensajes del asistente */}
        {!isUser && !message.isTyping && (
          <AnimatePresence>
            {showActions && (
              <motion.div
                className="absolute -bottom-8 left-0 flex items-center gap-1"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <button
                  onClick={onCopy}
                  className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
                >
                  <Copy size={14} />
                </button>
                <button
                  onClick={onRegenerate}
                  className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-white/70"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  onClick={() => onFeedback?.(true)}
                  className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-emerald-400"
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  onClick={() => onFeedback?.(false)}
                  className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/10 hover:text-red-400"
                >
                  <ThumbsDown size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL - THE ORACLE WITHIN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function TheOracleWithin({
  className = '',
  initialOpen = false,
  position = 'bottom-right',
  onMessage,
  customConfig,
}: TheOracleWithinProps) {
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [isExpanded, setIsExpanded] = useState(false)
  const [state, setState] = useState<OracleState>('idle')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy Oracle, tu asistente de CHRONOS. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const config: OracleAvatarConfig = {
    name: 'Oracle',
    personality: 'professional',
    voiceEnabled: false,
    contextMemory: true,
    ...customConfig,
  }

  // Posicionamiento
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }

  // Auto-scroll al nuevo mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input cuando se abre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  // Simular respuesta de IA
  const generateResponse = useCallback(
    async (userMessage: string) => {
      setState('thinking')

      // Añadir mensaje "typing"
      const typingId = `typing-${Date.now()}`
      setMessages((prev) => [
        ...prev,
        {
          id: typingId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isTyping: true,
        },
      ])

      // Simular delay de procesamiento
      await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

      // Generar respuesta simulada
      const responses = [
        'He analizado tu consulta. Basándome en los datos del sistema CHRONOS, puedo ayudarte con eso. ¿Necesitas más detalles específicos?',
        'Entiendo lo que necesitas. Déjame revisar la información disponible y te proporciono una respuesta completa.',
        'Excelente pregunta. En el contexto de gestión financiera de CHRONOS, puedo ofrecerte varias perspectivas sobre este tema.',
        'He procesado tu solicitud. Aquí tienes la información relevante de acuerdo a los registros del sistema.',
      ]

      const response = responses[Math.floor(Math.random() * responses.length)] ?? responses[0] ?? ''

      // Reemplazar typing con respuesta real
      setMessages((prev) =>
        prev.map(
          (m): Message =>
            m.id === typingId
              ? {
                  ...m,
                  content: response,
                  isTyping: false,
                }
              : m,
        ),
      )

      setState('idle')
      onMessage?.(userMessage, response)
    },
    [onMessage],
  )

  // Enviar mensaje
  const handleSend = useCallback(async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    await generateResponse(userMessage.content)
  }, [input, generateResponse])

  // Copiar mensaje
  const handleCopy = useCallback((content: string) => {
    navigator.clipboard.writeText(content)
    // Aquí podrías añadir un toast de confirmación
  }, [])

  // Regenerar respuesta
  const handleRegenerate = useCallback(
    async (messageIndex: number) => {
      const userMessages = messages.filter((m) => m.role === 'user')
      const lastUserMessage = userMessages[userMessages.length - 1]
      if (lastUserMessage) {
        // Eliminar última respuesta del asistente
        setMessages((prev) => prev.slice(0, -1))
        await generateResponse(lastUserMessage.content)
      }
    },
    [messages, generateResponse],
  )

  return (
    <>
      {/* Botón flotante cuando está cerrado */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className={`fixed z-50 ${positionClasses[position]} ${className}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
          >
            <OracleOrb state={state} size="md" onClick={() => setIsOpen(true)} />

            {/* Tooltip */}
            <motion.div
              className="absolute -top-10 left-1/2 -translate-x-1/2 rounded-lg bg-black/80 px-3 py-1.5 text-xs whitespace-nowrap text-white/80"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Pregunta a Oracle
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel del chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed z-50 ${positionClasses[position]} ${className}`}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div
              className={`overflow-hidden rounded-3xl shadow-2xl transition-all duration-300 ${
                isExpanded ? 'h-[600px] w-[450px]' : 'h-[500px] w-[380px]'
              }`}
              style={{
                background: `linear-gradient(180deg, ${PALETTE.deepSpace}, ${PALETTE.void})`,
                border: `1px solid ${PALETTE.glassBorder}`,
                boxShadow: `
                  0 25px 50px -12px rgba(0, 0, 0, 0.5),
                  0 0 80px ${PALETTE.violetGlow},
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `,
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-4"
                style={{
                  background: PALETTE.glassLight,
                  borderBottom: `1px solid ${PALETTE.glassBorder}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <OracleOrb state={state} size="sm" audioLevel={audioLevel} />
                  <div>
                    <h3 className="flex items-center gap-1.5 text-sm font-medium text-white">
                      {config.name}
                      <Sparkles size={12} className="text-yellow-400" />
                    </h3>
                    <p className="text-xs text-white/40">
                      {state === 'idle'
                        ? 'En línea'
                        : state === 'listening'
                          ? 'Escuchando...'
                          : state === 'thinking'
                            ? 'Pensando...'
                            : state === 'speaking'
                              ? 'Hablando...'
                              : 'Error'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4" style={{ height: 'calc(100% - 140px)' }}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      onCopy={() => handleCopy(message.content)}
                      onRegenerate={() => handleRegenerate(index)}
                      onFeedback={(positive) => {
                        // Manejar feedback
                        console.log('Feedback:', positive ? 'positive' : 'negative')
                      }}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input area */}
              <div
                className="p-4"
                style={{
                  background: PALETTE.glassLight,
                  borderTop: `1px solid ${PALETTE.glassBorder}`,
                }}
              >
                {/* Voice visualizer cuando está escuchando */}
                {isVoiceEnabled && state === 'listening' && (
                  <div className="mb-3">
                    <VoiceVisualizer isActive color={PALETTE.emeraldSuccess} />
                  </div>
                )}

                <div className="flex items-center gap-2">
                  {/* Botón de voz */}
                  <motion.button
                    onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                    className={`rounded-xl p-3 transition-colors ${
                      isVoiceEnabled
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isVoiceEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                  </motion.button>

                  {/* Input de texto */}
                  <div
                    className="flex flex-1 items-center gap-2 rounded-2xl px-4 py-3"
                    style={{
                      background: PALETTE.glassMedium,
                      border: `1px solid ${PALETTE.glassBorder}`,
                    }}
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Escribe tu mensaje..."
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/40 outline-none"
                      disabled={state === 'thinking'}
                    />
                  </div>

                  {/* Botón de enviar */}
                  <motion.button
                    onClick={handleSend}
                    disabled={!input.trim() || state === 'thinking'}
                    className="rounded-xl p-3 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${PALETTE.violetElectric}, ${PALETTE.plasmaPink})`,
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {state === 'thinking' ? (
                      <Loader2 size={18} className="animate-spin text-white" />
                    ) : (
                      <Send size={18} className="text-white" />
                    )}
                  </motion.button>
                </div>

                {/* Sugerencias rápidas */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {['Resumen del día', 'Ventas pendientes', 'Alertas activas'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setInput(suggestion)}
                      className="rounded-full px-3 py-1 text-xs text-white/50 transition-colors hover:bg-white/10 hover:text-white/80"
                      style={{
                        background: PALETTE.glassLight,
                        border: `1px solid ${PALETTE.glassBorder}`,
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default TheOracleWithin
