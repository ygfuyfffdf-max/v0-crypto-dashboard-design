'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 AURA AI WIDGET — Premium AI Assistant Inspired by Aura AI Concept
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Widget de IA ultra-premium con diseño inspirado en Aura AI:
 *
 * 🎙️ VOICE CHAT SCREEN (Pantalla Principal)
 * - Orbe 3D holográfico central con gradientes violeta/rosa/azul
 * - Texto poético/respuesta flotando alrededor del orbe
 * - Estado "Listening..." con animaciones fluidas
 * - Botón de micrófono prominente en la parte inferior
 * - Fondo oscuro con gradientes sutiles
 *
 * 💬 CHAT SCREEN (Pantalla Secundaria)
 * - Interfaz de mensajes estilo moderno
 * - Avatar del asistente con gradientes
 * - Links a conversaciones previas
 * - Campo de entrada elegante
 *
 * 🎨 CARACTERÍSTICAS VISUALES
 * - Diseño full-screen o expandido
 * - Transiciones cinematográficas entre modos
 * - Glassmorphism premium
 * - Animaciones de partículas y glows
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import {
    BarChart3,
    ChevronRight,
    Lightbulb,
    Menu,
    MessageCircle,
    Mic,
    MicOff,
    MoreVertical,
    Plus,
    Send,
    Settings,
    Sparkles,
    TrendingUp,
    Volume2,
    VolumeX,
    X,
    Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { processQuery } from '../CognitoWidget/CognitoEngine'
import { useVoice } from '../CognitoWidget/CognitoVoice'
import type { CognitoMessage, CognitoState } from '../CognitoWidget/types'
import { useCognitoStore } from '../CognitoWidget/useCognitoStore'
import { AuraOrb } from './AuraOrb'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📋 TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

type AuraScreen = 'voice' | 'chat'

interface AuraAIWidgetProps {
  className?: string
  onClose?: () => void
  initialScreen?: AuraScreen
  fullScreen?: boolean
}

interface ConversationThread {
  id: string
  title: string
  lastMessage: string
  date: string
  unread?: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎨 FLOATING TEXT — Texto poético flotante alrededor del orbe
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface FloatingTextProps {
  text: string
  isResponse?: boolean
}

function FloatingText({ text, isResponse }: FloatingTextProps) {
  const lines = text.split('\n').filter(Boolean)

  return (
    <motion.div
      className={cn(
        'pointer-events-none absolute inset-0 flex flex-col items-center justify-center',
        isResponse ? 'text-center' : 'text-center',
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {lines.map((line, i) => (
        <motion.p
          key={i}
          className={cn(
            'max-w-[320px] px-4 text-center leading-relaxed',
            i === 0 ? 'text-lg font-light text-white/90' : 'text-sm text-white/60',
          )}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: [0.4, 0.8, 0.4],
            y: 0,
          }}
          transition={{
            opacity: {
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.2,
            },
            y: { duration: 0.5, delay: i * 0.1 },
          }}
          style={{
            textShadow: '0 0 20px rgba(139, 92, 246, 0.3)',
          }}
        >
          {line}
        </motion.p>
      ))}
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎤 VOICE SCREEN — Pantalla principal con orbe y voz
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface VoiceScreenProps {
  state: CognitoState
  isListening: boolean
  isSpeaking: boolean
  audioLevel: number
  currentResponse: string
  onToggleListen: () => void
  onSwitchToChat: () => void
  onToggleMute: () => void
  onQuickAction: (query: string) => void
  isMuted: boolean
}

// Quick Actions para voz
const VOICE_QUICK_ACTIONS = [
  { id: 'ventas', label: 'Ventas de hoy', query: '¿Cuáles son las ventas de hoy?', icon: TrendingUp },
  { id: 'capital', label: 'Capital total', query: '¿Cuál es el capital total en bancos?', icon: BarChart3 },
  { id: 'clientes', label: 'Clientes con deuda', query: 'Muéstrame los clientes con deuda', icon: Lightbulb },
  { id: 'analisis', label: 'Análisis rápido', query: 'Dame un análisis financiero rápido', icon: Zap },
]

function VoiceScreen({
  state,
  isListening,
  isSpeaking,
  audioLevel,
  currentResponse,
  onToggleListen,
  onSwitchToChat,
  onToggleMute,
  onQuickAction,
  isMuted,
}: VoiceScreenProps) {
  const stateLabels: Record<CognitoState, string> = {
    idle: 'Toca para hablar',
    listening: 'Escuchando...',
    thinking: 'Procesando...',
    speaking: 'Respondiendo...',
    success: '¡Listo!',
    error: 'Error',
    proactive: 'Tengo algo para ti',
  }

  return (
    <motion.div
      className="relative flex h-full flex-col items-center justify-between py-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.4 }}
    >
      {/* Quick Actions en la parte superior */}
      {!currentResponse && state === 'idle' && (
        <motion.div
          className="w-full px-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="mb-3 text-center text-xs text-white/40">Acciones rápidas</p>
          <div className="grid grid-cols-2 gap-2">
            {VOICE_QUICK_ACTIONS.map((action) => (
              <motion.button
                key={action.id}
                onClick={() => onQuickAction(action.query)}
                className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2.5 text-left transition-all hover:border-violet-500/30 hover:bg-violet-500/5"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
                  <action.icon className="h-4 w-4 text-violet-400" />
                </div>
                <span className="text-xs text-white/70">{action.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Área central con orbe */}
      <div className="relative flex flex-1 flex-col items-center justify-center">
        {/* Texto de respuesta flotando arriba del orbe */}
        {currentResponse && (
          <motion.div
            className="absolute top-0 left-0 right-0 px-6 py-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 0.6, y: 0 }}
          >
            <p className="text-center text-xs leading-relaxed text-white/40 italic line-clamp-2">
              {currentResponse.substring(0, 80)}...
            </p>
          </motion.div>
        )}

        {/* ORB PRINCIPAL */}
        <div className="relative">
          <AuraOrb
            state={state}
            size={180}
            audioLevel={audioLevel}
            isListening={isListening}
            isSpeaking={isSpeaking}
            onClick={onToggleListen}
          />
        </div>

        {/* Texto de respuesta debajo del orbe */}
        {currentResponse && (
          <motion.div
            className="mt-6 max-w-[380px] px-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-sm leading-relaxed font-light text-white/90 line-clamp-4">
              {currentResponse.length > 180 ? `${currentResponse.substring(0, 180)}...` : currentResponse}
            </p>
            <motion.button
              onClick={onSwitchToChat}
              className="mt-3 text-xs text-violet-400 hover:text-violet-300"
              whileHover={{ scale: 1.02 }}
            >
              Ver respuesta completa →
            </motion.button>
          </motion.div>
        )}

        {/* Pregunta del usuario si está en idle y no hay respuesta */}
        {!currentResponse && state === 'idle' && (
          <motion.div
            className="mt-6 text-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-lg font-light text-white/80">
              ¿En qué puedo ayudarte?
            </p>
            <p className="mt-1 text-xs text-white/40">
              Habla o toca una acción rápida
            </p>
          </motion.div>
        )}
      </div>

      {/* Estado actual */}
      <motion.div
        className="mb-4 text-center"
        animate={{
          opacity: state === 'idle' ? 0.6 : 1,
        }}
      >
        <span className="text-sm text-violet-300/80">{stateLabels[state]}</span>
      </motion.div>

      {/* Controles inferiores */}
      <div className="flex items-center justify-center gap-6">
        {/* Botón de sonido */}
        <motion.button
          onClick={onToggleMute}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </motion.button>

        {/* Botón de micrófono principal */}
        <motion.button
          onClick={onToggleListen}
          className={cn(
            'relative flex h-16 w-16 items-center justify-center rounded-full transition-all',
            isListening
              ? 'bg-gradient-to-br from-cyan-500 via-blue-500 to-violet-600'
              : 'bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600',
          )}
          style={{
            boxShadow: isListening
              ? '0 0 50px rgba(34, 211, 238, 0.5), 0 0 80px rgba(139, 92, 246, 0.3)'
              : '0 0 35px rgba(139, 92, 246, 0.4), 0 0 60px rgba(236, 72, 153, 0.2)',
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            scale: isListening ? [1, 1.05, 1] : 1,
          }}
          transition={{
            scale: {
              duration: 1,
              repeat: isListening ? Infinity : 0,
              ease: 'easeInOut',
            },
          }}
        >
          {/* Pulso animado cuando escucha */}
          <AnimatePresence>
            {isListening && (
              <>
                <motion.div
                  className="absolute inset-0 rounded-full bg-cyan-400/30"
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ scale: 2, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-cyan-400/20"
                  initial={{ scale: 1, opacity: 0.3 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                />
              </>
            )}
          </AnimatePresence>

          {isListening ? (
            <MicOff className="h-7 w-7 text-white" />
          ) : (
            <Mic className="h-7 w-7 text-white" />
          )}
        </motion.button>

        {/* Botón para cambiar a chat */}
        <motion.button
          onClick={onSwitchToChat}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 text-white/60 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 💬 CHAT SCREEN — Pantalla de chat con mensajes
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface ChatScreenProps {
  messages: CognitoMessage[]
  isProcessing: boolean
  inputValue: string
  onInputChange: (value: string) => void
  onSubmit: () => void
  onSwitchToVoice: () => void
  threads?: ConversationThread[]
}

function ChatScreen({
  messages,
  isProcessing,
  inputValue,
  onInputChange,
  onSubmit,
  onSwitchToVoice,
  threads = [],
}: ChatScreenProps) {
  const chatRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [inputValue])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim()) onSubmit()
    }
  }

  return (
    <motion.div
      className="flex h-full flex-col"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ duration: 0.4 }}
    >
      {/* Área de mensajes */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <motion.div
              className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-sm"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.1 }}
            >
              <Sparkles className="h-12 w-12 text-violet-400" />
            </motion.div>
            <motion.h2
              className="mb-2 text-2xl font-semibold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Aura AI Assistant
            </motion.h2>
            <motion.p
              className="max-w-[300px] text-sm text-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Tu asistente inteligente para CHRONOS. Pregunta sobre ventas, clientes, análisis financiero y más.
            </motion.p>

            {/* Conversaciones recientes */}
            {threads.length > 0 && (
              <motion.div
                className="mt-8 w-full max-w-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p className="mb-3 text-xs text-white/40">Conversaciones recientes</p>
                <div className="space-y-2">
                  {threads.slice(0, 3).map((thread) => (
                    <button
                      key={thread.id}
                      className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-3 text-left transition-colors hover:bg-white/5"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm text-white/80">{thread.title}</p>
                        <p className="truncate text-xs text-white/40">{thread.lastMessage}</p>
                      </div>
                      <div className="ml-3 flex items-center gap-2">
                        <span className="text-xs text-white/30">{thread.date}</span>
                        <ChevronRight className="h-4 w-4 text-white/30" />
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <ChatBubble key={message.id} message={message} />
          ))
        )}

        {/* Indicador de procesamiento */}
        {isProcessing && (
          <motion.div
            className="flex items-start gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-3">
              <motion.span
                className="h-2 w-2 rounded-full bg-violet-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <motion.span
                className="h-2 w-2 rounded-full bg-violet-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                className="h-2 w-2 rounded-full bg-violet-400"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Área de input */}
      <div className="border-t border-white/5 bg-black/20 p-4">
        <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
          {/* Botón añadir */}
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/5 hover:text-white/70">
            <Plus className="h-5 w-5" />
          </button>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
            rows={1}
            className="max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent text-sm text-white placeholder:text-white/30 focus:outline-none"
          />

          {/* Botón de voz */}
          <button
            onClick={onSwitchToVoice}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-white/5 hover:text-white/70"
          >
            <Mic className="h-5 w-5" />
          </button>

          {/* Botón enviar */}
          {inputValue.trim() && (
            <motion.button
              onClick={onSubmit}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="h-5 w-5" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 💭 CHAT BUBBLE — Burbuja de mensaje
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

function ChatBubble({ message }: { message: CognitoMessage }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          isUser
            ? 'bg-white/10'
            : 'bg-gradient-to-br from-violet-500 to-fuchsia-500',
        )}
      >
        {isUser ? (
          <span className="text-sm font-medium text-white/70">Tú</span>
        ) : (
          <Sparkles className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Contenido */}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3',
          isUser
            ? 'rounded-tr-sm bg-gradient-to-br from-violet-600 to-indigo-600 text-white'
            : 'rounded-tl-sm border border-white/10 bg-white/5 text-white/90',
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {message.timestamp && (
          <p className={cn('mt-1 text-xs', isUser ? 'text-white/50' : 'text-white/30')}>
            {new Intl.DateTimeFormat('es-MX', {
              hour: '2-digit',
              minute: '2-digit',
            }).format(message.timestamp)}
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 MAIN COMPONENT — Componente Principal
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export function AuraAIWidget({
  className,
  onClose,
  initialScreen = 'voice',
  fullScreen = false,
}: AuraAIWidgetProps) {
  // State
  const [currentScreen, setCurrentScreen] = useState<AuraScreen>(initialScreen)
  const [inputValue, setInputValue] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentResponse, setCurrentResponse] = useState('')
  const [isPending, startTransition] = useTransition()

  // Store
  const {
    state,
    mode,
    context,
    setState,
    setMode,
    addMessage,
    incrementQueries,
    updateMetrics,
  } = useCognitoStore()

  // Voice hook
  const {
    isListening,
    isSpeaking,
    audioLevel,
    toggleListening,
    speak,
    stopSpeaking,
  } = useVoice({
    onTranscript: (text) => {
      setInputValue(text)
      handleSubmit(text)
    },
  })

  // Sincronizar estado con voz
  useEffect(() => {
    if (isListening) {
      setState('listening')
    } else if (isSpeaking) {
      setState('speaking')
    } else if (isProcessing) {
      setState('thinking')
    } else {
      setState('idle')
    }
  }, [isListening, isSpeaking, isProcessing, setState])

  // Handler de submit
  const handleSubmit = useCallback(
    async (text?: string) => {
      const query = text || inputValue.trim()
      if (!query || isProcessing) return

      setInputValue('')
      setIsProcessing(true)
      setState('thinking')
      setCurrentResponse('')

      // Añadir mensaje del usuario
      addMessage({ role: 'user', content: query, mode })
      incrementQueries()

      try {
        startTransition(async () => {
          const response = await processQuery(query, mode)

          addMessage(response.message)

          // Guardar respuesta actual para mostrar en voice screen
          const plainText = response.message.content
            .replace(/\*\*/g, '')
            .replace(/#{1,6}\s/g, '')
            .replace(/[•📊💰📈📋💳🏦📦💡⚠️✅❌🔍👥👋🤖]/g, '')

          setCurrentResponse(plainText)

          // Hablar respuesta si estamos en voice mode
          if (currentScreen === 'voice') {
            speak(plainText.substring(0, 500))
          }

          // Actualizar métricas
          if (response.message.metadata?.executionTime) {
            updateMetrics({
              averageResponseTime: response.message.metadata.executionTime,
            })
          }

          setIsProcessing(false)
          setState('idle')
        })
      } catch (error) {
        addMessage({
          role: 'assistant',
          content: 'Lo siento, hubo un error. ¿Puedes intentarlo de nuevo?',
          mode,
        })
        setCurrentResponse('Lo siento, hubo un error. ¿Puedes intentarlo de nuevo?')
        setIsProcessing(false)
        setState('error')
        setTimeout(() => setState('idle'), 2000)
      }
    },
    [
      inputValue,
      isProcessing,
      mode,
      addMessage,
      incrementQueries,
      speak,
      updateMetrics,
      setState,
      currentScreen,
    ],
  )

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    useCognitoStore.getState().updatePreferences({
      voiceEnabled: !context.preferences.voiceEnabled,
    })
    if (isSpeaking) stopSpeaking()
  }, [context.preferences.voiceEnabled, isSpeaking, stopSpeaking])

  // Threads de ejemplo
  const threads: ConversationThread[] = [
    {
      id: '1',
      title: 'Análisis de ventas',
      lastMessage: 'Las ventas del mes...',
      date: 'Hace 2d',
    },
    {
      id: '2',
      title: 'Estado de bancos',
      lastMessage: 'El capital total es...',
      date: 'Hace 5d',
    },
  ]

  return (
    <motion.div
      className={cn(
        'relative flex flex-col overflow-hidden rounded-3xl',
        'bg-gradient-to-b from-[#0a0612] via-[#0d0918] to-[#08050f]',
        'border border-white/[0.06] shadow-2xl',
        fullScreen ? 'fixed inset-0 z-50' : 'h-[700px] w-full max-w-lg',
        className,
      )}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 200, damping: 25 }}
    >
      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {/* BACKGROUND GRADIENTS */}
      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Gradient orb top-left */}
        <motion.div
          className="absolute -top-1/4 -left-1/4 h-[60%] w-[60%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Gradient orb bottom-right */}
        <motion.div
          className="absolute -right-1/4 -bottom-1/4 h-[50%] w-[50%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
          animate={{
            x: [0, -30, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Center glow when active */}
        {(isListening || isSpeaking) && (
          <motion.div
            className="absolute top-1/2 left-1/2 h-[40%] w-[40%] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: isListening
                ? 'radial-gradient(circle, rgba(34, 211, 238, 0.2) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          />
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {/* HEADER */}
      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Back/Menu button */}
          <motion.button
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">Aura</span>
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300">
              1.3 BETA
            </span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1">
          {/* Screen toggle indicator */}
          <div className="mr-2 flex rounded-full bg-white/5 p-1">
            <button
              onClick={() => setCurrentScreen('voice')}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full transition-all',
                currentScreen === 'voice'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70',
              )}
            >
              <Mic className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setCurrentScreen('chat')}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full transition-all',
                currentScreen === 'chat'
                  ? 'bg-white/10 text-white'
                  : 'text-white/40 hover:text-white/70',
              )}
            >
              <MessageCircle className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Settings */}
          <motion.button
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="h-4 w-4" />
          </motion.button>

          {/* More options */}
          <motion.button
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/5 hover:text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MoreVertical className="h-4 w-4" />
          </motion.button>

          {/* Close button */}
          {onClose && (
            <motion.button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/5 hover:text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      {/* CONTENT */}
      {/* ═══════════════════════════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentScreen === 'voice' ? (
            <VoiceScreen
              key="voice"
              state={state}
              isListening={isListening}
              isSpeaking={isSpeaking}
              audioLevel={audioLevel}
              currentResponse={currentResponse}
              onToggleListen={toggleListening}
              onSwitchToChat={() => setCurrentScreen('chat')}
              onToggleMute={handleToggleMute}
              onQuickAction={(query) => handleSubmit(query)}
              isMuted={context.preferences.voiceEnabled === false}
            />
          ) : (
            <ChatScreen
              key="chat"
              messages={context.history}
              isProcessing={isProcessing || isPending}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSubmit={() => handleSubmit()}
              onSwitchToVoice={() => setCurrentScreen('voice')}
              threads={threads}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Border glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          boxShadow: 'inset 0 0 60px rgba(139, 92, 246, 0.05)',
        }}
      />
    </motion.div>
  )
}

export default AuraAIWidget
