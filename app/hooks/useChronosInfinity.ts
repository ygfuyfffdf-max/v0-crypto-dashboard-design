/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 useChronosInfinity — Hook Supremo para CHRONOS INFINITY Agent
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hook de React para integrar CHRONOS INFINITY en componentes del frontend
 * Features: Chat, Tool Calling, Streaming, Memory, Mood Detection
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type MoodState = 'calm' | 'flow' | 'euphoric' | 'stress' | 'alert'

export type TaskType =
  | 'reasoning'
  | 'code'
  | 'vision'
  | 'fast'
  | 'math'
  | 'creative'
  | 'general'
  | 'financial'
  | 'predictive'
  | 'multimodal'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: Date
  taskType?: TaskType
  mood?: MoodState
  toolCalls?: ToolCallResult[]
  isStreaming?: boolean
}

export interface ToolCallResult {
  name: string
  arguments: Record<string, unknown>
  result: unknown
  duration: number
}

export interface AgentMetrics {
  totalMessages: number
  totalTokensUsed: number
  averageResponseTime: number
  toolCallsExecuted: number
  errorsHandled: number
  sessionDuration: number
}

export interface UseChronosInfinityOptions {
  enableHistory?: boolean
  enableTools?: boolean
  enableStreaming?: boolean
  maxHistoryLength?: number
  onMoodChange?: (mood: MoodState) => void
  onToolCall?: (tool: string, args: Record<string, unknown>) => void
  onError?: (error: Error) => void
}

export interface UseChronosInfinityReturn {
  // Estado
  messages: ChatMessage[]
  isLoading: boolean
  error: Error | null
  mood: MoodState
  metrics: AgentMetrics

  // Acciones
  sendMessage: (content: string, options?: SendMessageOptions) => Promise<string>
  sendWithImage: (content: string, imageUrl: string) => Promise<string>
  clearHistory: () => void
  setMood: (mood: MoodState) => void

  // Utilidades
  classifyTask: (prompt: string) => TaskType
  detectMood: (prompt: string) => MoodState
  getLastResponse: () => string | null
}

export interface SendMessageOptions {
  taskType?: TaskType
  systemPrompt?: string
  enableTools?: boolean
  images?: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KEYWORDS PARA CLASIFICACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const TASK_KEYWORDS: Record<TaskType, string[]> = {
  code: [
    'código',
    'code',
    'function',
    'bug',
    'error',
    'programar',
    'typescript',
    'react',
    'component',
  ],
  reasoning: ['analiza', 'razona', 'explica por qué', 'deduce', 'estrategia', 'evalúa'],
  vision: ['imagen', 'image', 'foto', 'visual', 'screenshot', 'ui', 'diseño'],
  math: ['matemática', 'calcular', 'fórmula', 'estadística', 'porcentaje', 'número'],
  creative: ['creativo', 'historia', 'poema', 'idea', 'brainstorm', 'inventa'],
  fast: ['rápido', 'quick', 'simple', 'breve', 'resumen'],
  financial: ['venta', 'capital', 'banco', 'cliente', 'deuda', 'utilidad', 'ganancia', 'flete'],
  predictive: ['predice', 'predicción', 'forecast', 'proyección', 'tendencia', 'futuro'],
  general: [],
  multimodal: [],
}

const MOOD_PATTERNS: Record<MoodState, RegExp> = {
  stress: /\b(urgente|problema|error|ayuda|mal|perdí|preocup)\b/i,
  alert: /\b(crítico|importante|alerta|cuidado|atención)\b/i,
  euphoric: /\b(genial|increíble|excelente|fantástico|éxito|ganamos)\b/i,
  flow: /\b(bien|perfecto|listo|continúa|siguiente)\b/i,
  calm: /./,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function classifyTaskFromPrompt(prompt: string): TaskType {
  const promptLower = prompt.toLowerCase()
  const scores: Record<TaskType, number> = {
    reasoning: 0,
    code: 0,
    vision: 0,
    fast: 0,
    math: 0,
    creative: 0,
    general: 0,
    financial: 0,
    predictive: 0,
    multimodal: 0,
  }

  for (const [taskType, keywords] of Object.entries(TASK_KEYWORDS)) {
    for (const keyword of keywords) {
      if (promptLower.includes(keyword)) {
        scores[taskType as TaskType] += keyword.length > 4 ? 2 : 1
      }
    }
  }

  // Boost financial for CHRONOS context
  if (promptLower.includes('chronos') || promptLower.includes('sistema')) {
    scores.financial += 3
  }

  const maxScore = Math.max(...Object.values(scores))
  if (maxScore > 0) {
    const entry = Object.entries(scores).find(([, score]) => score === maxScore)
    if (entry) return entry[0] as TaskType
  }

  return 'general'
}

function detectMoodFromPrompt(prompt: string): MoodState {
  for (const [mood, pattern] of Object.entries(MOOD_PATTERNS)) {
    if (mood !== 'calm' && pattern.test(prompt)) {
      return mood as MoodState
    }
  }
  return 'calm'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useChronosInfinity(
  options: UseChronosInfinityOptions = {},
): UseChronosInfinityReturn {
  const {
    enableHistory = true,
    enableTools = true,
    maxHistoryLength = 50,
    onMoodChange,
    onToolCall,
    onError,
  } = options

  // Estado
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [mood, setMoodState] = useState<MoodState>('calm')

  // Métricas
  const [metrics, setMetrics] = useState<AgentMetrics>({
    totalMessages: 0,
    totalTokensUsed: 0,
    averageResponseTime: 0,
    toolCallsExecuted: 0,
    errorsHandled: 0,
    sessionDuration: 0,
  })

  // Refs
  const sessionStartRef = useRef<Date>(new Date())
  const responseTimes = useRef<number[]>([])

  // Actualizar duración de sesión
  useEffect(() => {
    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000)
      setMetrics((prev) => ({ ...prev, sessionDuration: duration }))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Callback para cambio de mood
  const setMood = useCallback(
    (newMood: MoodState) => {
      setMoodState(newMood)
      onMoodChange?.(newMood)
    },
    [onMoodChange],
  )

  // Clasificar tarea
  const classifyTask = useCallback((prompt: string): TaskType => {
    return classifyTaskFromPrompt(prompt)
  }, [])

  // Detectar mood
  const detectMood = useCallback((prompt: string): MoodState => {
    return detectMoodFromPrompt(prompt)
  }, [])

  // Enviar mensaje principal
  const sendMessage = useCallback(
    async (content: string, sendOptions: SendMessageOptions = {}): Promise<string> => {
      const startTime = Date.now()

      try {
        setIsLoading(true)
        setError(null)

        // Detectar tipo de tarea y mood
        const taskType = sendOptions.taskType || classifyTask(content)
        const detectedMood = detectMood(content)
        setMood(detectedMood)

        // Crear mensaje de usuario
        const userMessage: ChatMessage = {
          id: generateId(),
          role: 'user',
          content,
          timestamp: new Date(),
          taskType,
          mood: detectedMood,
        }

        // Agregar mensaje de usuario
        setMessages((prev) => {
          const newMessages = [...prev, userMessage]
          return enableHistory ? newMessages.slice(-maxHistoryLength) : [userMessage]
        })

        // Preparar historial para API
        const historyForApi = enableHistory
          ? messages.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            }))
          : []

        // Llamar a API
        const response = await fetch('/api/chronos-ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: content,
            taskType,
            systemPrompt: sendOptions.systemPrompt,
            history: historyForApi,
            enableTools: sendOptions.enableTools ?? enableTools,
            images: sendOptions.images,
          }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()

        // Procesar tool calls si existen
        if (data.toolCalls && data.toolCalls.length > 0) {
          for (const toolCall of data.toolCalls) {
            onToolCall?.(toolCall.name, toolCall.arguments)
          }
          setMetrics((prev) => ({
            ...prev,
            toolCallsExecuted: prev.toolCallsExecuted + data.toolCalls.length,
          }))
        }

        // Crear mensaje de asistente
        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          taskType,
          mood: detectedMood,
          toolCalls: data.toolCalls,
        }

        // Agregar mensaje de asistente
        setMessages((prev) => {
          const newMessages = [...prev, assistantMessage]
          return enableHistory
            ? newMessages.slice(-maxHistoryLength)
            : [userMessage, assistantMessage]
        })

        // Actualizar métricas
        const responseTime = Date.now() - startTime
        responseTimes.current.push(responseTime)
        const avgTime =
          responseTimes.current.reduce((a, b) => a + b, 0) / responseTimes.current.length

        setMetrics((prev) => ({
          ...prev,
          totalMessages: prev.totalMessages + 2,
          totalTokensUsed: prev.totalTokensUsed + (data.usage?.total_tokens || 0),
          averageResponseTime: Math.round(avgTime),
        }))

        return data.response
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        onError?.(error)

        setMetrics((prev) => ({
          ...prev,
          errorsHandled: prev.errorsHandled + 1,
        }))

        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [
      messages,
      enableHistory,
      enableTools,
      maxHistoryLength,
      classifyTask,
      detectMood,
      setMood,
      onToolCall,
      onError,
    ],
  )

  // Enviar con imagen
  const sendWithImage = useCallback(
    async (content: string, imageUrl: string): Promise<string> => {
      return sendMessage(content, {
        taskType: 'vision',
        images: [imageUrl],
      })
    },
    [sendMessage],
  )

  // Limpiar historial
  const clearHistory = useCallback(() => {
    setMessages([])
    responseTimes.current = []
    setMetrics({
      totalMessages: 0,
      totalTokensUsed: 0,
      averageResponseTime: 0,
      toolCallsExecuted: 0,
      errorsHandled: 0,
      sessionDuration: metrics.sessionDuration,
    })
  }, [metrics.sessionDuration])

  // Obtener última respuesta
  const getLastResponse = useCallback((): string | null => {
    const lastAssistantMessage = [...messages].reverse().find((m) => m.role === 'assistant')
    return lastAssistantMessage?.content ?? null
  }, [messages])

  return {
    // Estado
    messages,
    isLoading,
    error,
    mood,
    metrics,

    // Acciones
    sendMessage,
    sendWithImage,
    clearHistory,
    setMood,

    // Utilidades
    classifyTask,
    detectMood,
    getLastResponse,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// MOOD COLORS - Para componentes UI
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const MOOD_COLORS: Record<
  MoodState,
  {
    primary: string
    secondary: string
    glow: string
    gradient: string
  }
> = {
  calm: {
    primary: 'violet-500',
    secondary: 'violet-600',
    glow: 'violet-500/50',
    gradient: 'from-violet-500 to-purple-600',
  },
  flow: {
    primary: 'indigo-500',
    secondary: 'indigo-600',
    glow: 'indigo-500/50',
    gradient: 'from-indigo-500 to-blue-600',
  },
  euphoric: {
    primary: 'amber-400',
    secondary: 'yellow-500',
    glow: 'amber-400/50',
    gradient: 'from-amber-400 to-yellow-500',
  },
  stress: {
    primary: 'rose-500',
    secondary: 'rose-600',
    glow: 'rose-500/50',
    gradient: 'from-rose-500 to-pink-600',
  },
  alert: {
    primary: 'red-500',
    secondary: 'red-600',
    glow: 'red-500/50',
    gradient: 'from-red-500 to-orange-600',
  },
}

export default useChronosInfinity
