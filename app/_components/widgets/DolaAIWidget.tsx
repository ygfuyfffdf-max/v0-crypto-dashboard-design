'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🤖 DOLA AI WIDGET — CHRONOS INFINITY 2026 SUPREME PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Widget de IA estilo "Dola" - Amigable, Informativo, Proactivo:
 * ✅ ORB 3D ANIMADO con partículas reactivas (Canvas 2D optimizado)
 * ✅ GLASSMORPHISM GEN5 con efecto holográfico
 * ✅ INSIGHTS PROACTIVOS emergentes con prioridades
 * ✅ CHAT FLOTANTE minimalista con historial
 * ✅ VOICE ACTIVATION (Web Speech API ready)
 * ✅ ANIMACIONES ORGÁNICAS bio-feedback
 * ✅ TRANSICIONES FLUIDAS entre estados
 * ✅ QUICK ACTIONS flotantes
 * ✅ CONTEXT-AWARE suggestions
 * ✅ TYPING INDICATORS premium
 *
 * Estados del Widget:
 * - idle: Orb pulsando suavemente, esperando interacción
 * - listening: Orb expandido con ondas, escuchando (voz activa)
 * - thinking: Orb con partículas girando rápido, procesando
 * - speaking: Orb con ondas de salida, respondiendo
 * - insight: Badge proactivo con sugerencia emergente
 * - minimized: Solo orb pequeño con notificación count
 *
 * @version 4.0.0 - DOLA STYLE SUPREME
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { animated, useSpring } from '@react-spring/web'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  ChevronUp,
  DollarSign,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  Mic,
  MicOff,
  Package,
  Send,
  ShoppingCart,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type DolaState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'insight'

interface ProactiveInsight {
  id: string
  type: 'suggestion' | 'alert' | 'metric' | 'tip' | 'warning' | 'success'
  title: string
  message: string
  action?: {
    label: string
    onClick: () => void
  }
  priority: 'low' | 'medium' | 'high' | 'critical'
  icon?: 'money' | 'chart' | 'package' | 'cart' | 'alert' | 'trend-up' | 'trend-down'
  dismissable?: boolean
  expiresAt?: Date
}

interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'error'
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
}

interface DolaAIWidgetProps {
  className?: string
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center'
  initialExpanded?: boolean
  insights?: ProactiveInsight[]
  onMessage?: (message: string) => Promise<string>
  onVoiceCommand?: (command: string) => void
  greeting?: string
  name?: string
  quickActions?: QuickAction[]
  enableAutoInsights?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔮 ORB 3D COMPONENT — Corazón visual del widget
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface OrbProps {
  state: DolaState
  size?: number
  onClick?: () => void
}

function DolaOrb({ state, size = 60, onClick }: OrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(0)
  const timeRef = useRef(0)

  // State-based animations
  const stateConfig = {
    idle: { pulseSpeed: 0.5, particleCount: 20, color1: '#8B5CF6', color2: '#06B6D4' },
    listening: { pulseSpeed: 1.5, particleCount: 40, color1: '#06B6D4', color2: '#10B981' },
    thinking: { pulseSpeed: 2, particleCount: 60, color1: '#EC4899', color2: '#8B5CF6' },
    speaking: { pulseSpeed: 0.8, particleCount: 30, color1: '#10B981', color2: '#06B6D4' },
    insight: { pulseSpeed: 1.2, particleCount: 50, color1: '#FBBF24', color2: '#EC4899' },
  }

  const config = stateConfig[state]

  // Spring animation for size
  const springProps = useSpring({
    scale: state === 'listening' ? 1.3 : state === 'thinking' ? 1.1 : 1,
    glow: state === 'idle' ? 0.3 : 0.6,
    config: { tension: 200, friction: 20 },
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr
    canvas.height = size * dpr
    ctx.scale(dpr, dpr)

    // Particles
    interface Particle {
      x: number
      y: number
      angle: number
      radius: number
      speed: number
      size: number
      alpha: number
    }

    const particles: Particle[] = []
    const center = size / 2

    for (let i = 0; i < config.particleCount; i++) {
      particles.push({
        x: center,
        y: center,
        angle: (Math.PI * 2 * i) / config.particleCount,
        radius: 10 + Math.random() * 15,
        speed: 0.5 + Math.random() * 1.5,
        size: 1 + Math.random() * 2,
        alpha: 0.3 + Math.random() * 0.7,
      })
    }

    const animate = () => {
      timeRef.current += 0.016 * config.pulseSpeed
      const t = timeRef.current

      // Clear
      ctx.clearRect(0, 0, size, size)

      // Core glow
      const coreRadius = 15 + Math.sin(t * 2) * 3
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, coreRadius * 2)
      gradient.addColorStop(0, config.color1)
      gradient.addColorStop(0.5, config.color2 + '80')
      gradient.addColorStop(1, 'transparent')

      ctx.beginPath()
      ctx.arc(center, center, coreRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Outer ring
      ctx.beginPath()
      ctx.arc(center, center, coreRadius + 5 + Math.sin(t * 3) * 2, 0, Math.PI * 2)
      ctx.strokeStyle = config.color1 + '40'
      ctx.lineWidth = 2
      ctx.stroke()

      // Particles
      particles.forEach((p, i) => {
        // Update
        p.angle += p.speed * 0.02 * config.pulseSpeed
        const wobble = Math.sin(t * 2 + i) * 5
        const currentRadius = p.radius + wobble

        p.x = center + Math.cos(p.angle) * currentRadius
        p.y = center + Math.sin(p.angle) * currentRadius

        // Draw
        const particleAlpha = p.alpha * (0.5 + Math.sin(t * 3 + i) * 0.5)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle =
          i % 2 === 0
            ? config.color1 + Math.floor(particleAlpha * 255).toString(16).padStart(2, '0')
            : config.color2 + Math.floor(particleAlpha * 255).toString(16).padStart(2, '0')
        ctx.fill()

        // Trail
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        const trailLength = 8 * config.pulseSpeed
        ctx.lineTo(
          p.x - Math.cos(p.angle) * trailLength,
          p.y - Math.sin(p.angle) * trailLength,
        )
        ctx.strokeStyle =
          i % 2 === 0 ? config.color1 + '30' : config.color2 + '30'
        ctx.lineWidth = p.size * 0.5
        ctx.stroke()
      })

      // State-specific effects
      if (state === 'listening') {
        // Sound waves
        for (let i = 0; i < 3; i++) {
          const waveRadius = 20 + i * 10 + Math.sin(t * 4 - i * 0.5) * 5
          ctx.beginPath()
          ctx.arc(center, center, waveRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `${config.color1}${Math.floor((0.3 - i * 0.1) * 255).toString(16).padStart(2, '0')}`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      }

      if (state === 'thinking') {
        // Spinning ring
        ctx.save()
        ctx.translate(center, center)
        ctx.rotate(t * 2)
        ctx.beginPath()
        ctx.arc(0, 0, 25, 0, Math.PI * 1.5)
        ctx.strokeStyle = config.color1
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.restore()
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationRef.current)
  }, [state, size, config])

  return (
    <animated.div
      className="relative cursor-pointer"
      style={{
        transform: springProps.scale.to((s) => `scale(${s})`),
        filter: springProps.glow.to((g) => `drop-shadow(0 0 ${g * 30}px ${config.color1})`),
      }}
      onClick={onClick}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="transition-all duration-300"
        style={{ width: size, height: size }}
      />
    </animated.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💬 CHAT BUBBLE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function ChatBubble({ message, isUser }: { message: ChatMessage; isUser: boolean }) {
  return (
    <motion.div
      className={cn(
        'max-w-[80%] rounded-2xl px-4 py-2',
        isUser
          ? 'ml-auto bg-gradient-to-r from-violet-500/30 to-cyan-500/30 text-white'
          : 'mr-auto bg-white/5 text-white/90',
      )}
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <p className="text-sm">{message.content}</p>
      <p className="mt-1 text-right text-[10px] text-white/40">
        {message.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
      </p>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💡 INSIGHT CARD COMPONENT — Premium con más variantes
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function InsightCard({ insight, onDismiss }: { insight: ProactiveInsight; onDismiss: () => void }) {
  const iconMap = {
    suggestion: <Lightbulb size={16} />,
    alert: <Bell size={16} />,
    metric: <BarChart3 size={16} />,
    tip: <Sparkles size={16} />,
    warning: <AlertTriangle size={16} />,
    success: <Zap size={16} />,
  }

  const customIconMap = {
    money: <DollarSign size={16} />,
    chart: <BarChart3 size={16} />,
    package: <Package size={16} />,
    cart: <ShoppingCart size={16} />,
    alert: <AlertTriangle size={16} />,
    'trend-up': <TrendingUp size={16} />,
    'trend-down': <TrendingDown size={16} />,
  }

  const colorMap = {
    low: { bg: 'from-cyan-500/20 to-blue-500/20', border: 'border-cyan-500/30', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
    medium: { bg: 'from-violet-500/20 to-purple-500/20', border: 'border-violet-500/30', text: 'text-violet-400', glow: 'shadow-violet-500/20' },
    high: { bg: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/30', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
    critical: { bg: 'from-red-500/20 to-pink-500/20', border: 'border-red-500/30', text: 'text-red-400', glow: 'shadow-red-500/20' },
  }

  const colors = colorMap[insight.priority]
  const icon = insight.icon ? customIconMap[insight.icon] : iconMap[insight.type]

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl border p-4 backdrop-blur-xl',
        `bg-gradient-to-br ${colors.bg}`,
        colors.border,
        `shadow-lg ${colors.glow}`,
      )}
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />

      {/* Close button */}
      {insight.dismissable !== false && (
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={12} />
        </button>
      )}

      {/* Priority indicator */}
      {insight.priority === 'critical' && (
        <motion.div
          className="absolute top-2 left-2 h-2 w-2 rounded-full bg-red-500"
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}

      {/* Header */}
      <div className="mb-2 flex items-center gap-2">
        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg bg-white/10', colors.text)}>
          {icon}
        </div>
        <span className={cn('text-xs font-semibold', colors.text)}>{insight.title}</span>
      </div>

      {/* Message */}
      <p className="mb-3 text-sm text-white/80 leading-relaxed">{insight.message}</p>

      {/* Action */}
      {insight.action && (
        <motion.button
          onClick={insight.action.onClick}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white transition-all hover:bg-white/20',
          )}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {insight.action.label}
          <ArrowRight size={12} />
        </motion.button>
      )}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🤖 MAIN DOLA AI WIDGET — Premium Enhanced
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function DolaAIWidget({
  className,
  position = 'bottom-right',
  initialExpanded = false,
  insights = [],
  onMessage,
  onVoiceCommand,
  greeting = '¡Hola! Soy Dola, tu asistente de CHRONOS. ¿En qué puedo ayudarte hoy?',
  name = 'Dola',
  quickActions = [],
  enableAutoInsights = true,
}: DolaAIWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded)
  const [isMinimized, setIsMinimized] = useState(false)
  const [dolaState, setDolaState] = useState<DolaState>('idle')
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: greeting, timestamp: new Date(), status: 'sent' },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [activeInsights, setActiveInsights] = useState<ProactiveInsight[]>(insights)
  const [showQuickActions, setShowQuickActions] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  // Default quick actions if none provided
  const defaultQuickActions: QuickAction[] = useMemo(() => [
    {
      id: 'ventas',
      label: 'Resumen ventas',
      icon: <ShoppingCart size={16} />,
      action: () => handleQuickMessage('Dame un resumen de las ventas de hoy'),
    },
    {
      id: 'capital',
      label: 'Estado capital',
      icon: <DollarSign size={16} />,
      action: () => handleQuickMessage('¿Cuál es el capital actual en los bancos?'),
    },
    {
      id: 'alertas',
      label: 'Alertas activas',
      icon: <Bell size={16} />,
      action: () => handleQuickMessage('¿Hay alertas o problemas que deba atender?'),
    },
    {
      id: 'ayuda',
      label: 'Ayuda',
      icon: <HelpCircle size={16} />,
      action: () => handleQuickMessage('¿Qué puedes hacer por mí?'),
    },
  ], [])

  const finalQuickActions = quickActions.length > 0 ? quickActions : defaultQuickActions

  // Position classes
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
  }

  // Auto-scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // Update insights from props
  useEffect(() => {
    setActiveInsights(insights)
  }, [insights])

  // Auto-generate insights (demo)
  useEffect(() => {
    if (!enableAutoInsights) return

    const timer = setTimeout(() => {
      if (activeInsights.length === 0 && !isExpanded) {
        setActiveInsights([
          {
            id: 'auto-1',
            type: 'metric',
            title: 'Ventas del día',
            message: 'Las ventas de hoy superan el promedio semanal en un 15%',
            priority: 'medium',
            icon: 'trend-up',
            action: {
              label: 'Ver detalles',
              onClick: () => setIsExpanded(true),
            },
          },
        ])
      }
    }, 10000) // Show after 10 seconds

    return () => clearTimeout(timer)
  }, [enableAutoInsights, activeInsights.length, isExpanded])

  // Handle quick message
  const handleQuickMessage = useCallback((message: string) => {
    setInputValue(message)
    setShowQuickActions(false)
  }, [])

  // Handle sending message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
      status: 'sent',
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setDolaState('thinking')

    try {
      const response = onMessage
        ? await onMessage(inputValue)
        : generateDemoResponse(inputValue)

      setDolaState('speaking')

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        status: 'sent',
      }

      // Simulate typing delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      setMessages((prev) => [...prev, assistantMessage])

      // Return to idle after speaking
      setTimeout(() => setDolaState('idle'), 2000)
    } catch {
      setDolaState('idle')
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'system',
          content: 'Hubo un error al procesar tu mensaje. Intenta de nuevo.',
          timestamp: new Date(),
          status: 'error',
        },
      ])
    }
  }, [inputValue, onMessage])

  // Demo response generator
  const generateDemoResponse = (input: string): string => {
    const lower = input.toLowerCase()

    if (lower.includes('ventas') || lower.includes('venta')) {
      return 'Hoy se han registrado 12 ventas por un total de $45,000 MXN. El margen promedio es del 28%. ¿Te gustaría ver el detalle por cliente?'
    }
    if (lower.includes('capital') || lower.includes('banco')) {
      return 'El capital total disponible es de $156,000 MXN distribuido en 7 bancos. Utilidades tiene el mayor saldo con $45,000 MXN.'
    }
    if (lower.includes('alerta') || lower.includes('problema')) {
      return 'Hay 2 alertas activas: 1) Stock bajo en 3 productos, 2) Cliente "Juan Pérez" tiene deuda vencida de $5,000 MXN.'
    }
    if (lower.includes('ayuda') || lower.includes('puedes')) {
      return 'Puedo ayudarte con: 📊 Resúmenes de ventas, 💰 Estado de capital, 📦 Inventario, 👥 Clientes y distribuidores, 📈 Métricas y reportes. ¡Pregúntame lo que necesites!'
    }

    return `Entendido. He registrado tu consulta sobre "${input}". ¿Necesitas algo más?`
  }

  // Dismiss insight
  const dismissInsight = useCallback((id: string) => {
    setActiveInsights((prev) => prev.filter((i) => i.id !== id))
  }, [])

  // Toggle voice
  const toggleVoice = useCallback(() => {
    setIsVoiceEnabled((prev) => !prev)
    if (!isVoiceEnabled) {
      setDolaState('listening')
      // Simulate voice listening
      setTimeout(() => {
        setDolaState('idle')
        // Demo: simulate voice command
        onVoiceCommand?.('Mostrar ventas del día')
      }, 3000)
    }
  }, [isVoiceEnabled, onVoiceCommand])

  return (
    <div className={cn('fixed z-50', positionClasses[position], className)}>
      {/* Proactive Insights - Float above widget */}
      <AnimatePresence>
        {activeInsights.length > 0 && !isExpanded && (
          <div className="absolute bottom-20 right-0 w-72 space-y-2">
            {activeInsights.slice(0, 2).map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onDismiss={() => dismissInsight(insight.id)}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Widget */}
      <AnimatePresence mode="wait">
        {isExpanded ? (
          // Expanded Chat View
          <motion.div
            key="expanded"
            className={cn(
              'w-80 overflow-hidden rounded-3xl border border-white/10',
              'bg-gradient-to-br from-gray-900/95 via-gray-900/90 to-gray-800/95 backdrop-blur-2xl',
              'shadow-2xl shadow-black/50',
            )}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex items-center gap-3">
                <DolaOrb state={dolaState} size={40} />
                <div>
                  <h3 className="text-sm font-semibold text-white">{name}</h3>
                  <p className="text-[10px] text-white/50">
                    {dolaState === 'idle' && 'En línea'}
                    {dolaState === 'listening' && 'Escuchando...'}
                    {dolaState === 'thinking' && 'Pensando...'}
                    {dolaState === 'speaking' && 'Respondiendo...'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="rounded-lg p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                >
                  <ChevronUp size={16} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div
              ref={chatRef}
              className="h-72 space-y-3 overflow-auto p-4 scrollbar-thin scrollbar-track-white/5 scrollbar-thumb-white/20"
            >
              {messages.map((message) => (
                <ChatBubble key={message.id} message={message} isUser={message.role === 'user'} />
              ))}

              {/* Typing indicator */}
              {dolaState === 'thinking' && (
                <motion.div
                  className="mr-auto flex gap-1 rounded-2xl bg-white/5 px-4 py-3"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="h-2 w-2 rounded-full bg-violet-400"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </motion.div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleVoice}
                  className={cn(
                    'rounded-xl p-2.5 transition-all',
                    isVoiceEnabled
                      ? 'bg-violet-500/30 text-violet-400'
                      : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white',
                  )}
                >
                  {isVoiceEnabled ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 rounded-xl bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
                />
                <motion.button
                  onClick={handleSendMessage}
                  className={cn(
                    'rounded-xl p-2.5 transition-all',
                    inputValue.trim()
                      ? 'bg-gradient-to-r from-violet-500 to-cyan-500 text-white'
                      : 'bg-white/5 text-white/30',
                  )}
                  whileHover={inputValue.trim() ? { scale: 1.02 } : {}}
                  whileTap={inputValue.trim() ? { scale: 0.95 } : {}}
                  disabled={!inputValue.trim()}
                >
                  <Send size={18} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ) : (
          // Collapsed Orb View
          <motion.div
            key="collapsed"
            className="group relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            {/* Pulse ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-violet-500/20"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* Main orb button */}
            <motion.button
              className={cn(
                'relative flex h-16 w-16 items-center justify-center rounded-full',
                'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl',
                'border border-white/10 shadow-2xl shadow-black/50',
                'transition-all hover:border-white/20',
              )}
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <DolaOrb state={dolaState} size={50} />
            </motion.button>

            {/* Notification badge */}
            {activeInsights.length > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-bold text-white"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              >
                {activeInsights.length}
              </motion.div>
            )}

            {/* Quick action buttons on hover */}
            <div className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <motion.button
                className="rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-xl transition-colors hover:bg-white/20 hover:text-white"
                title="Chat rápido"
                onClick={() => setIsExpanded(true)}
                whileHover={{ scale: 1.1 }}
              >
                <MessageCircle size={16} />
              </motion.button>
              <motion.button
                className="rounded-full bg-white/10 p-2 text-white/70 backdrop-blur-xl transition-colors hover:bg-white/20 hover:text-white"
                title="Comando de voz"
                onClick={toggleVoice}
                whileHover={{ scale: 1.1 }}
              >
                <Mic size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default DolaAIWidget

