/**
 * 🤖 AI CONVERSATIONAL WIDGET - WIDGET IA 3D CONVERSACIONAL PREMIUM
 * ═══════════════════════════════════════════════════════════════════════════
 * Widget flotante de IA con orbe 3D, chat conversacional y comandos de voz
 * Requisito del .md: Widget IA 3D Conversacional (voz + texto)
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client'

import { AnimatePresence, motion, useDragControls } from 'motion/react'
import {
    Activity,
    AlertTriangle,
    BarChart3,
    CheckCircle,
    ChevronDown,
    DollarSign,
    FileText,
    Maximize2,
    MessageCircle,
    Mic,
    MicOff,
    Minimize2,
    Package,
    Send,
    Sparkles,
    TrendingUp,
    Truck,
    Users,
    X,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import { AI3DOrb, AI3DOrbMini, type AIState } from './AI3DOrb'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  actions?: AIAction[]
  metadata?: {
    bankId?: string
    amount?: number
    type?: string
  }
}

interface AIAction {
  id: string
  type: 'navigate' | 'create' | 'report' | 'alert' | 'analyze'
  label: string
  icon: keyof typeof actionIcons
  payload?: Record<string, unknown>
}

interface QuickSuggestion {
  id: string
  label: string
  icon: React.ReactNode
  command: string
  color: string
}

export interface AIConversationalWidgetProps {
  onMessage?: (message: string) => Promise<string>
  onAction?: (action: AIAction) => void
  suggestions?: QuickSuggestion[]
  className?: string
  initialPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  enableVoice?: boolean
  enableDrag?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const actionIcons = {
  navigate: ChevronDown,
  create: Sparkles,
  report: FileText,
  alert: AlertTriangle,
  analyze: BarChart3,
  success: CheckCircle,
  trending: TrendingUp,
  money: DollarSign,
  users: Users,
  package: Package,
  truck: Truck,
}

const COLORS = {
  violet: '#8B5CF6',
  gold: '#FFD700',
  pink: '#F472B6',
  emerald: '#10B981',
  rose: '#F43F5E',
}

const DEFAULT_SUGGESTIONS: QuickSuggestion[] = [
  {
    id: 'ventas-hoy',
    label: 'Ventas de hoy',
    icon: <TrendingUp className="h-4 w-4" />,
    command: '¿Cuáles son las ventas de hoy?',
    color: COLORS.gold,
  },
  {
    id: 'capital-total',
    label: 'Capital total',
    icon: <DollarSign className="h-4 w-4" />,
    command: '¿Cuál es el capital total en todos los bancos?',
    color: COLORS.emerald,
  },
  {
    id: 'alertas',
    label: 'Ver alertas',
    icon: <AlertTriangle className="h-4 w-4" />,
    command: '¿Hay alertas o situaciones críticas?',
    color: COLORS.rose,
  },
  {
    id: 'reporte',
    label: 'Generar reporte',
    icon: <FileText className="h-4 w-4" />,
    command: 'Genera un reporte ejecutivo del día',
    color: COLORS.violet,
  },
]

// Respuestas simuladas inteligentes
const AI_RESPONSES: Record<string, string> = {
  ventas:
    '📊 Las ventas de hoy suman **$156,700 MXN** con 12 transacciones completadas. El producto más vendido es "Producto A" con 45 unidades. La tendencia es +15% vs ayer.',
  capital:
    '💰 El capital total distribuido en los 7 bancos es **$2,847,500 MXN**. Bóveda Monte lidera con $850,000 (29.8%), seguido de Profit con $620,000 (21.8%).',
  alerta:
    '⚠️ Hay 2 alertas activas:\n1. **Stock crítico**: Producto C tiene solo 5 unidades (mínimo: 30)\n2. **Cliente VIP inactivo**: Carmen Vega no ha comprado en 15 días',
  reporte:
    '📄 Generando reporte ejecutivo...\n\n**Resumen del día:**\n• Ventas: $156,700 (+15%)\n• Nuevos clientes: 3\n• Órdenes completadas: 8\n• Capital disponible: $2.8M\n\n¿Deseas exportar a PDF?',
  default:
    'Entiendo tu consulta. Basado en los datos actuales del sistema, puedo ayudarte a analizar tendencias, generar reportes o identificar oportunidades. ¿Qué aspecto específico te interesa?',
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export function AIConversationalWidget({
  onMessage,
  onAction,
  suggestions = DEFAULT_SUGGESTIONS,
  className = '',
  initialPosition = 'bottom-right',
  enableVoice = true,
  enableDrag = true,
}: AIConversationalWidgetProps) {
  // Estados
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [aiState, setAiState] = useState<AIState>('idle')
  const [inputValue, setInputValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        '¡Hola! Soy **CHRONOS AI**, tu asistente de análisis financiero. Puedo ayudarte con ventas, capital, alertas y reportes. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date(),
    },
  ])

  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragControls = useDragControls()

  // Posición inicial
  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  }

  // Auto scroll chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // Simular nivel de audio cuando está escuchando
  useEffect(() => {
    if (!isListening) {
      setAudioLevel(0)
      return
    }
    const interval = setInterval(() => {
      setAudioLevel(Math.random() * 0.8 + 0.2)
    }, 100)
    return () => clearInterval(interval)
  }, [isListening])

  // Determinar respuesta inteligente
  const getAIResponse = useCallback((query: string): string => {
    const lowerQuery = query.toLowerCase()
    const defaultResponse =
      AI_RESPONSES.default ?? 'Entiendo tu consulta. ¿En qué más puedo ayudarte?'

    if (lowerQuery.includes('venta')) return AI_RESPONSES.ventas ?? defaultResponse
    if (lowerQuery.includes('capital') || lowerQuery.includes('banco')) {
      return AI_RESPONSES.capital ?? defaultResponse
    }
    if (lowerQuery.includes('alerta') || lowerQuery.includes('crítico')) {
      return AI_RESPONSES.alerta ?? defaultResponse
    }
    if (lowerQuery.includes('reporte')) return AI_RESPONSES.reporte ?? defaultResponse

    return defaultResponse
  }, [])

  // Enviar mensaje
  const handleSend = useCallback(async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setAiState('thinking')

    // Simular respuesta
    setTimeout(async () => {
      setAiState('responding')

      let response: string
      if (onMessage) {
        try {
          response = await onMessage(inputValue)
        } catch {
          response = 'Lo siento, hubo un error procesando tu solicitud.'
          setAiState('error')
        }
      } else {
        response = getAIResponse(inputValue)
      }

      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        }

        setMessages((prev) => [...prev, aiMessage])
        setAiState('success')

        setTimeout(() => setAiState('idle'), 1500)
      }, 800)
    }, 1200)
  }, [inputValue, onMessage, getAIResponse])

  // Toggle escucha de voz
  const toggleListening = useCallback(() => {
    setIsListening((prev) => {
      const newValue = !prev
      setAiState(newValue ? 'listening' : 'idle')
      return newValue
    })
  }, [])

  // Manejar sugerencia
  const handleSuggestion = useCallback(
    (command: string) => {
      setInputValue(command)
      setTimeout(() => {
        handleSend()
      }, 100)
    },
    [handleSend],
  )

  // Renderizar mensaje
  const renderMessage = useCallback(
    (message: Message) => {
      const isAssistant = message.role === 'assistant'

      return (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
        >
          <div className={`max-w-[85%] ${isAssistant ? '' : 'order-2'}`}>
            {isAssistant && (
              <div className="mb-1 flex items-center gap-2">
                <AI3DOrbMini state={aiState} size={24} />
                <span className="text-xs text-white/50">CHRONOS AI</span>
              </div>
            )}
            <div
              className={`rounded-2xl p-3 ${
                isAssistant
                  ? 'rounded-tl-sm bg-white/10 text-white backdrop-blur-sm'
                  : 'rounded-tr-sm bg-gradient-to-r from-violet-500 to-purple-600 text-white'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content.split('**').map((part, i) =>
                  i % 2 === 1 ? (
                    <strong key={i} className="font-semibold">
                      {part}
                    </strong>
                  ) : (
                    part
                  ),
                )}
              </p>
            </div>
            <span className="mt-1 block text-right text-[10px] text-white/30">
              {message.timestamp.toLocaleTimeString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </motion.div>
      )
    },
    [aiState],
  )

  // ═══════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════

  return (
    <motion.div
      className={`fixed z-50 ${positionClasses[initialPosition]} ${className}`}
      drag={enableDrag && !isExpanded}
      dragControls={dragControls}
      dragMomentum={false}
      dragElastic={0.1}
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          // ═══════════════════════════════════════════════════════════════
          // COLLAPSED STATE - Solo Orbe
          // ═══════════════════════════════════════════════════════════════
          <motion.div
            key="collapsed"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="relative"
          >
            <AI3DOrb
              state={aiState}
              audioLevel={audioLevel}
              size={100}
              onClick={() => setIsExpanded(true)}
              pulseOnHover
            />

            {/* Badge de notificación */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-black bg-rose-500 text-xs font-bold text-white"
            >
              2
            </motion.div>

            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute top-1/2 right-full mr-3 -translate-y-1/2 rounded-lg bg-black/80 px-4 py-2 text-sm whitespace-nowrap text-white backdrop-blur-sm"
            >
              <MessageCircle className="mr-1.5 inline h-4 w-4" />
              CHRONOS AI Assistant
            </motion.div>
          </motion.div>
        ) : (
          // ═══════════════════════════════════════════════════════════════
          // EXPANDED STATE - Chat completo
          // ═══════════════════════════════════════════════════════════════
          <motion.div
            key="expanded"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className={`overflow-hidden rounded-3xl border border-white/10 bg-black/90 shadow-2xl backdrop-blur-xl ${
              isMinimized ? 'h-auto w-[500px]' : 'h-[700px] w-[500px]'
            }`}
          >
            {/* Header */}
            <div className="border-b border-white/10 bg-gradient-to-r from-violet-500/20 to-purple-500/20 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AI3DOrbMini state={aiState} size={50} />
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                      CHRONOS AI
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
                        PREMIUM
                      </span>
                    </h3>
                    <p className="flex items-center gap-1 text-sm text-white/50">
                      <Activity className="h-4 w-4 text-emerald-400" />
                      {aiState === 'idle'
                        ? 'En línea'
                        : aiState === 'thinking'
                          ? 'Analizando...'
                          : aiState === 'responding'
                            ? 'Respondiendo...'
                            : aiState === 'listening'
                              ? 'Escuchando...'
                              : 'Listo'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-5 w-5 text-white/60" />
                    ) : (
                      <Minimize2 className="h-5 w-5 text-white/60" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="rounded-lg p-2 transition-colors hover:bg-white/10"
                  >
                    <X className="h-5 w-5 text-white/60" />
                  </button>
                </div>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Quick Suggestions */}
                <div className="border-b border-white/5 px-4 py-3">
                  <div className="custom-scrollbar flex gap-2 overflow-x-auto pb-1">
                    {suggestions.map((suggestion) => (
                      <motion.button
                        key={suggestion.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSuggestion(suggestion.command)}
                        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs whitespace-nowrap text-white/80 transition-colors hover:bg-white/10"
                        style={{
                          borderColor: `${suggestion.color}30`,
                          boxShadow: `0 0 10px ${suggestion.color}20`,
                        }}
                      >
                        {suggestion.icon}
                        {suggestion.label}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={chatRef}
                  className="custom-scrollbar h-[440px] flex-1 space-y-4 overflow-y-auto p-5"
                >
                  {messages.map(renderMessage)}

                  {/* Typing indicator */}
                  {(aiState === 'thinking' || aiState === 'responding') && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 text-sm text-white/50"
                    >
                      <div className="flex gap-1">
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0 }}
                          className="h-2 w-2 rounded-full bg-violet-400"
                        />
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                          className="h-2 w-2 rounded-full bg-violet-400"
                        />
                        <motion.div
                          animate={{ y: [0, -4, 0] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                          className="h-2 w-2 rounded-full bg-violet-400"
                        />
                      </div>
                      {aiState === 'thinking' ? 'Analizando datos...' : 'Generando respuesta...'}
                    </motion.div>
                  )}
                </div>

                {/* Input */}
                <div className="border-t border-white/10 bg-black/50 p-5">
                  <div className="flex gap-3">
                    {enableVoice && (
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleListening}
                        className={`rounded-xl p-3.5 transition-all ${
                          isListening
                            ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                      </motion.button>
                    )}

                    <input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Pregunta algo..."
                      className="flex-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3.5 text-white placeholder-white/40 transition-all focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none"
                    />

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSend}
                      disabled={!inputValue.trim() || aiState === 'thinking'}
                      className="rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 p-3.5 text-white transition-all hover:shadow-lg hover:shadow-violet-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Send className="h-6 w-6" />
                    </motion.button>
                  </div>

                  <p className="mt-2 text-center text-xs text-white/30">
                    CHRONOS AI • Análisis financiero en tiempo real
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default AIConversationalWidget
