'use client'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎙️ REAL-TIME VOICE AI ASSISTANT — CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Asistente de IA con conversación por voz en tiempo real:
 * - Reconocimiento de voz WebSpeech API
 * - Síntesis de voz natural
 * - Llenado automático de formularios
 * - Ejecución de operaciones del sistema
 * - Contexto conversacional completo
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { cn } from '@/app/_lib/utils'
import { formatCurrency } from '@/app/_lib/utils/formatters'
import { useChat } from '@ai-sdk/react'
import {
  AlertCircle,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  CircleDot,
  FileText,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Send,
  Settings,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  Zap,
  HelpCircle,
  ClipboardList,
} from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { toast } from 'sonner'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type AIState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'calling'
type FormField = {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'date'
  value: string | number | null
  required: boolean
  filled: boolean
  options?: Array<{ value: string; label: string }>
}

interface FormContext {
  formType: string
  formTitle: string
  fields: FormField[]
  missingFields: string[]
  canSubmit: boolean
}

interface ConversationMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  action?: {
    type: 'fill_field' | 'confirm' | 'submit' | 'navigate' | 'query'
    payload: Record<string, unknown>
  }
}

interface VoiceAIAssistantProps {
  className?: string
  onFormFill?: (fieldName: string, value: unknown) => void
  onFormSubmit?: () => void
  onNavigate?: (path: string) => void
  currentForm?: FormContext
  systemContext?: Record<string, unknown>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VOICE WAVE VISUALIZER
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VoiceWaveProps {
  isActive: boolean
  color?: string
  bars?: number
  intensity?: number
}

const VoiceWaveVisualizer = memo(function VoiceWaveVisualizer({
  isActive,
  color = '#8B5CF6',
  bars = 24,
  intensity = 1,
}: VoiceWaveProps) {
  return (
    <div className="flex h-12 items-center justify-center gap-[2px]">
      {Array.from({ length: bars }).map((_, i) => {
        const centerDistance = Math.abs(i - bars / 2) / (bars / 2)
        const heightMultiplier = 1 - centerDistance * 0.5

        return (
          <motion.div
            key={i}
            className="w-1 rounded-full"
            style={{ backgroundColor: color }}
            animate={
              isActive
                ? {
                    height: [
                      (4 + Math.random() * 8) * intensity * heightMultiplier,
                      (16 + Math.random() * 24) * intensity * heightMultiplier,
                      (8 + Math.random() * 12) * intensity * heightMultiplier,
                      (20 + Math.random() * 20) * intensity * heightMultiplier,
                      (4 + Math.random() * 8) * intensity * heightMultiplier,
                    ],
                    opacity: [0.4, 1, 0.6, 1, 0.4],
                  }
                : { height: 4, opacity: 0.2 }
            }
            transition={
              isActive
                ? {
                    duration: 0.4 + Math.random() * 0.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.015,
                  }
                : { duration: 0.3 }
            }
          />
        )
      })}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// ORB COMPONENT — Visual orb that reacts to voice state
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AIActionOrbProps {
  state: AIState
  onClick: () => void
}

const AIActionOrb = memo(function AIActionOrb({ state, onClick }: AIActionOrbProps) {
  const orbColors = {
    idle: 'from-violet-500/30 to-purple-600/20',
    listening: 'from-emerald-500/40 to-teal-600/30',
    thinking: 'from-amber-500/40 to-orange-600/30',
    speaking: 'from-blue-500/40 to-sky-600/30',
    calling: 'from-rose-500/40 to-pink-600/30',
  }

  const glowColors = {
    idle: 'shadow-violet-500/30',
    listening: 'shadow-emerald-500/50',
    thinking: 'shadow-amber-500/50',
    speaking: 'shadow-blue-500/50',
    calling: 'shadow-rose-500/50',
  }

  const iconSize = 'h-8 w-8'
  const icons = {
    idle: <Bot className={iconSize} />,
    listening: <Mic className={cn(iconSize, 'animate-pulse')} />,
    thinking: <Loader2 className={cn(iconSize, 'animate-spin')} />,
    speaking: <Volume2 className={iconSize} />,
    calling: <Phone className={cn(iconSize, 'animate-pulse')} />,
  }

  return (
    <motion.button
      className={cn(
        'relative flex items-center justify-center w-24 h-24 rounded-full',
        'bg-gradient-to-br',
        orbColors[state],
        'border border-white/20',
        'shadow-2xl',
        glowColors[state],
        'transition-all duration-300'
      )}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow:
          state !== 'idle'
            ? [
                '0 0 20px rgba(139, 92, 246, 0.3)',
                '0 0 40px rgba(139, 92, 246, 0.5)',
                '0 0 20px rgba(139, 92, 246, 0.3)',
              ]
            : '0 0 20px rgba(139, 92, 246, 0.2)',
      }}
      transition={{
        boxShadow: { duration: 1.5, repeat: Infinity },
      }}
    >
      {/* Inner glow */}
      <div className="absolute inset-2 rounded-full bg-gradient-to-br from-white/10 to-transparent" />

      {/* Icon */}
      <div className="relative text-white">{icons[state]}</div>

      {/* Pulse rings for active states */}
      {state !== 'idle' && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/20"
            animate={{ scale: [1, 1.3, 1.3], opacity: [0.5, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-white/20"
            animate={{ scale: [1, 1.5, 1.5], opacity: [0.3, 0, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          />
        </>
      )}
    </motion.button>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FORM PROGRESS INDICATOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface FormProgressProps {
  form?: FormContext
  onFieldClick?: (fieldName: string) => void
}

const FormProgressIndicator = memo(function FormProgressIndicator({
  form,
  onFieldClick,
}: FormProgressProps) {
  if (!form) return null

  const filledCount = form.fields.filter((f) => f.filled).length
  const progress = (filledCount / form.fields.length) * 100

  return (
    <motion.div
      className="rounded-xl border border-white/10 bg-white/5 p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-violet-400" />
          <span className="text-sm font-medium text-white">{form.formTitle}</span>
        </div>
        <span className="text-xs text-white/50">
          {filledCount}/{form.fields.length} campos
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Fields list */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {form.fields.map((field) => (
          <motion.div
            key={field.name}
            className={cn(
              'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors',
              field.filled
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-white/5 text-white/50 hover:bg-white/10'
            )}
            onClick={() => onFieldClick?.(field.name)}
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-2">
              {field.filled ? (
                <Check className="h-4 w-4 text-emerald-400" />
              ) : field.required ? (
                <CircleDot className="h-4 w-4 text-amber-400" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-white/20" />
              )}
              <span className="text-sm">{field.label}</span>
            </div>
            {field.filled && field.value !== null && (
              <span className="text-xs truncate max-w-[100px]">
                {typeof field.value === 'number'
                  ? formatCurrency(field.value)
                  : String(field.value)}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Submit button */}
      {form.canSubmit && (
        <motion.button
          className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Check className="h-4 w-4 inline mr-2" />
          Confirmar y Guardar
        </motion.button>
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CHAT MESSAGE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ChatMessageProps {
  message: ConversationMessage
}

const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center">
          <Bot className="h-4 w-4 text-violet-400" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2.5',
          isUser
            ? 'bg-violet-500/20 text-white'
            : 'bg-white/10 text-white/90'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p className="text-[10px] mt-1 opacity-50">
          {message.timestamp.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <MessageSquare className="h-4 w-4 text-emerald-400" />
        </div>
      )}
    </motion.div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SUGGESTION CHIPS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface SuggestionChipsProps {
  suggestions: string[]
  onSelect: (suggestion: string) => void
}

const SuggestionChips = memo(function SuggestionChips({
  suggestions,
  onSelect,
}: SuggestionChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {suggestions.map((suggestion, index) => (
        <motion.button
          key={index}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors"
          onClick={() => onSelect(suggestion)}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {suggestion}
        </motion.button>
      ))}
    </div>
  )
})

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function VoiceAIAssistant({
  className,
  onFormFill,
  onFormSubmit,
  onNavigate,
  currentForm,
  systemContext,
}: VoiceAIAssistantProps) {
  const [state, setState] = useState<AIState>('idle')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Default suggestions based on context
  const suggestions = useMemo(() => {
    if (currentForm) {
      return [
        `Llenar ${currentForm.formTitle}`,
        '¿Qué datos faltan?',
        'Confirmar y guardar',
        'Cancelar',
      ]
    }
    return [
      'Registrar una venta',
      'Ver resumen del día',
      'Registrar un gasto',
      'Hacer transferencia',
      '¿Cuál es mi balance?',
    ]
  }, [currentForm])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'es-MX'

      recognitionRef.current.onresult = (event) => {
        const last = event.results.length - 1
        const transcript = event.results[last][0].transcript

        if (event.results[last].isFinal) {
          handleUserInput(transcript)
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setState('idle')
        if (event.error !== 'no-speech') {
          toast.error('Error en reconocimiento de voz')
        }
      }

      recognitionRef.current.onend = () => {
        if (state === 'listening') {
          setState('idle')
        }
      }
    }

    return () => {
      recognitionRef.current?.stop()
    }
  }, [state])

  // Text-to-speech function
  const speak = useCallback(
    (text: string) => {
      if (isMuted || !isVoiceEnabled) return

      window.speechSynthesis.cancel()
      synthesisRef.current = new SpeechSynthesisUtterance(text)
      synthesisRef.current.lang = 'es-MX'
      synthesisRef.current.rate = 1.0
      synthesisRef.current.pitch = 1.0

      // Try to get a Spanish voice
      const voices = window.speechSynthesis.getVoices()
      const spanishVoice = voices.find(
        (voice) => voice.lang.includes('es') && voice.name.includes('Female')
      ) || voices.find((voice) => voice.lang.includes('es'))

      if (spanishVoice) {
        synthesisRef.current.voice = spanishVoice
      }

      synthesisRef.current.onstart = () => setState('speaking')
      synthesisRef.current.onend = () => setState('idle')

      window.speechSynthesis.speak(synthesisRef.current)
    },
    [isMuted, isVoiceEnabled]
  )

  // Handle user input (voice or text)
  const handleUserInput = useCallback(
    async (input: string) => {
      if (!input.trim()) return

      // Add user message
      const userMessage: ConversationMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: input,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      setInputText('')
      setState('thinking')

      try {
        // Send to AI endpoint
        const response = await fetch('/api/ai/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: input,
            context: {
              currentForm,
              systemContext,
              conversationHistory: messages.slice(-10),
            },
          }),
        })

        const data = await response.json()

        // Add assistant response
        const assistantMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.message,
          timestamp: new Date(),
          action: data.action,
        }
        setMessages((prev) => [...prev, assistantMessage])

        // Execute action if present
        if (data.action) {
          switch (data.action.type) {
            case 'fill_field':
              onFormFill?.(data.action.payload.fieldName as string, data.action.payload.value)
              break
            case 'submit':
              onFormSubmit?.()
              break
            case 'navigate':
              onNavigate?.(data.action.payload.path as string)
              break
          }
        }

        // Speak the response
        speak(data.message)
      } catch (error) {
        console.error('AI Error:', error)
        const errorMessage: ConversationMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Lo siento, hubo un error. ¿Puedes repetir eso?',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errorMessage])
        speak('Lo siento, hubo un error. ¿Puedes repetir eso?')
      }
    },
    [currentForm, systemContext, messages, speak, onFormFill, onFormSubmit, onNavigate]
  )

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (state === 'listening') {
      recognitionRef.current?.stop()
      setState('idle')
    } else if (state === 'idle') {
      setState('listening')
      recognitionRef.current?.start()
    }
  }, [state])

  // Handle send button
  const handleSend = useCallback(() => {
    if (inputText.trim()) {
      handleUserInput(inputText)
    }
  }, [inputText, handleUserInput])

  // Handle suggestion click
  const handleSuggestion = useCallback(
    (suggestion: string) => {
      handleUserInput(suggestion)
    },
    [handleUserInput]
  )

  return (
    <motion.div
      className={cn(
        'fixed bottom-4 right-4 z-50',
        'bg-gradient-to-br from-slate-900/95 to-slate-800/95',
        'backdrop-blur-xl border border-white/10 rounded-3xl',
        'shadow-2xl shadow-violet-500/10',
        isExpanded ? 'w-[420px] h-[600px]' : 'w-auto h-auto',
        className
      )}
      layout
      initial={{ opacity: 0, scale: 0.9, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
    >
      {/* Header (always visible) */}
      <div
        className={cn(
          'flex items-center gap-4 p-4 cursor-pointer',
          isExpanded && 'border-b border-white/10'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {!isExpanded && (
          <AIActionOrb state={state} onClick={toggleListening} />
        )}

        {isExpanded && (
          <>
            <div className="flex items-center gap-3 flex-1">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-violet-400" />
                </div>
                <div
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900',
                    state === 'idle'
                      ? 'bg-white/30'
                      : state === 'listening'
                      ? 'bg-emerald-400'
                      : state === 'thinking'
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-blue-400'
                  )}
                />
              </div>
              <div>
                <h3 className="text-white font-semibold">CHRONOS AI</h3>
                <p className="text-xs text-white/50">
                  {state === 'idle'
                    ? 'Listo para ayudarte'
                    : state === 'listening'
                    ? 'Escuchando...'
                    : state === 'thinking'
                    ? 'Pensando...'
                    : 'Hablando...'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsVoiceEnabled(!isVoiceEnabled)
                }}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  isVoiceEnabled
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'bg-white/5 text-white/30'
                )}
                whileTap={{ scale: 0.95 }}
              >
                {isVoiceEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </motion.button>

              <motion.button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(false)
                }}
                className="p-2 rounded-lg bg-white/5 text-white/50 hover:text-white transition-colors"
                whileTap={{ scale: 0.95 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.button>
            </div>
          </>
        )}

        {!isExpanded && (
          <div className="flex flex-col">
            <span className="text-white font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              CHRONOS AI
            </span>
            <span className="text-xs text-white/50">
              {state === 'listening' ? 'Escuchando...' : 'Toca para hablar'}
            </span>
          </div>
        )}
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="flex flex-col h-[calc(100%-80px)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Voice wave (when listening/speaking) */}
            {(state === 'listening' || state === 'speaking') && (
              <div className="px-4 py-2 border-b border-white/5">
                <VoiceWaveVisualizer
                  isActive={state === 'listening' || state === 'speaking'}
                  color={state === 'listening' ? '#10B981' : '#3B82F6'}
                  intensity={state === 'listening' ? 1.2 : 0.8}
                />
              </div>
            )}

            {/* Form progress (if form context exists) */}
            {currentForm && (
              <div className="px-4 py-3 border-b border-white/5">
                <FormProgressIndicator form={currentForm} />
              </div>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
                    <Bot className="h-10 w-10 text-violet-400" />
                  </div>
                  <h3 className="text-white font-semibold mb-2">
                    ¡Hola! Soy tu asistente
                  </h3>
                  <p className="text-sm text-white/50 mb-4 max-w-[280px]">
                    Puedo ayudarte a registrar ventas, gastos, transferencias y más.
                    Habla o escribe lo que necesites.
                  </p>
                  <SuggestionChips
                    suggestions={suggestions}
                    onSelect={handleSuggestion}
                  />
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Suggestions (when messages exist) */}
            {messages.length > 0 && (
              <div className="px-4 py-2 border-t border-white/5">
                <SuggestionChips
                  suggestions={suggestions.slice(0, 3)}
                  onSelect={handleSuggestion}
                />
              </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={toggleListening}
                  className={cn(
                    'p-3 rounded-xl transition-colors',
                    state === 'listening'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {state === 'listening' ? (
                    <MicOff className="h-5 w-5" />
                  ) : (
                    <Mic className="h-5 w-5" />
                  )}
                </motion.button>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Escribe o habla..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:outline-none"
                  />
                </div>

                <motion.button
                  onClick={handleSend}
                  disabled={!inputText.trim() || state !== 'idle'}
                  className={cn(
                    'p-3 rounded-xl transition-colors',
                    inputText.trim() && state === 'idle'
                      ? 'bg-violet-500 text-white'
                      : 'bg-white/10 text-white/30'
                  )}
                  whileHover={{ scale: inputText.trim() ? 1.05 : 1 }}
                  whileTap={{ scale: inputText.trim() ? 0.95 : 1 }}
                >
                  <Send className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default VoiceAIAssistant
