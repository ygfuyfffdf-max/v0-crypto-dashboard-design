/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🤖 useAIChat Hook — Chat con IA Personalizado
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hook personalizado para chat con IA usando fetch directo (compatible con streaming)
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use client'

import { logger } from '@/app/lib/utils/logger'
import { useCallback, useEffect, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt?: Date
}

interface UseAIChatOptions {
  api?: string
  persistHistory?: boolean
  storageKey?: string
  onError?: (error: Error) => void
  maxRetries?: number
}

export interface UseAIChatReturn {
  messages: Message[]
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  clearHistory: () => void
  hasHistory: boolean
  messageCount: number
  retry: () => void
  error: Error | null
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  setInput: React.Dispatch<React.SetStateAction<string>>
}

const DEFAULT_STORAGE_KEY = 'chronos-ai-chat-history'
const DEFAULT_API = '/api/ai/chat'

function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}

export function useAIChat(options: UseAIChatOptions = {}): UseAIChatReturn {
  const {
    api = DEFAULT_API,
    persistHistory = true,
    storageKey = DEFAULT_STORAGE_KEY,
    onError,
    maxRetries = 3,
  } = options

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Cargar historial desde localStorage al montar
  useEffect(() => {
    if (persistHistory && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored) as Message[]
          setMessages(parsed)
          logger.info('[useAIChat] Historial cargado desde localStorage', {
            context: 'useAIChat',
            data: { count: parsed.length },
          })
        }
      } catch (err) {
        logger.error('[useAIChat] Error al cargar historial', err as Error, {
          context: 'useAIChat',
        })
      }
    }
  }, [persistHistory, storageKey])

  // Guardar historial cuando cambian los mensajes
  useEffect(() => {
    if (persistHistory && messages.length > 0 && typeof window !== 'undefined') {
      try {
        const messagesToStore = messages.slice(-50)
        localStorage.setItem(storageKey, JSON.stringify(messagesToStore))
      } catch (err) {
        logger.error('[useAIChat] Error al guardar historial', err as Error, {
          context: 'useAIChat',
        })
      }
    }
  }, [messages, persistHistory, storageKey])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setInput(e.target.value)
    },
    [],
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (!input.trim() || isLoading) return

      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: input.trim(),
        createdAt: new Date(),
      }

      setMessages((prev) => [...prev, userMessage])
      setInput('')
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(api, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        // Leer stream de respuesta
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let assistantContent = ''

        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: '',
          createdAt: new Date(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            assistantContent += chunk

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id ? { ...m, content: assistantContent } : m,
              ),
            )
          }
        }

        setRetryCount(0)
        logger.info('[useAIChat] Respuesta recibida', {
          context: 'useAIChat',
          data: { length: assistantContent.length },
        })
      } catch (err) {
        const chatError = err instanceof Error ? err : new Error('Error desconocido')
        logger.error('[useAIChat] Error en chat', chatError, { context: 'useAIChat' })
        setError(chatError)

        if (retryCount < maxRetries) {
          setRetryCount((prev) => prev + 1)
        }

        if (onError) {
          onError(chatError)
        }
      } finally {
        setIsLoading(false)
      }
    },
    [api, input, isLoading, messages, maxRetries, onError, retryCount],
  )

  const clearHistory = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey)
        logger.info('[useAIChat] Historial limpiado', { context: 'useAIChat' })
      } catch (err) {
        logger.error('[useAIChat] Error al limpiar historial', err as Error, {
          context: 'useAIChat',
        })
      }
    }
    setMessages([])
  }, [storageKey])

  const retry = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMessage) {
      setInput(lastUserMessage.content)
      setMessages((prev) => prev.slice(0, -2)) // Remover último intercambio
    }
  }, [messages])

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    clearHistory,
    hasHistory: messages.length > 0,
    messageCount: messages.length,
    retry,
    error,
    setMessages,
    setInput,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK PARA ANÁLISIS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface AnalysisOptions {
  type:
    | 'ventas_prediccion'
    | 'anomalias'
    | 'recomendaciones_inventario'
    | 'tendencias'
    | 'clientes_riesgo'
    | 'optimizacion_capital'
  periodo?: 'semana' | 'mes' | 'trimestre' | 'año'
}

interface UseAIAnalysisReturn {
  analyze: (options: AnalysisOptions) => Promise<unknown>
  isAnalyzing: boolean
  result: unknown
  error: Error | null
}

export function useAIAnalysis(): UseAIAnalysisReturn {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [error, setError] = useState<Error | null>(null)

  const analyze = useCallback(async (options: AnalysisOptions) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      logger.info('[useAIAnalysis] Iniciando análisis', {
        context: 'useAIAnalysis',
        data: options,
      })

      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        throw new Error(`Error en análisis: ${response.statusText}`)
      }

      const data = await response.json()
      setResult(data)

      logger.info('[useAIAnalysis] Análisis completado', {
        context: 'useAIAnalysis',
        data: { type: options.type },
      })

      return data
    } catch (err) {
      const analysisError = err instanceof Error ? err : new Error('Error desconocido')
      logger.error('[useAIAnalysis] Error en análisis', analysisError, {
        context: 'useAIAnalysis',
      })
      setError(analysisError)
      throw analysisError
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  return {
    analyze,
    isAnalyzing,
    result,
    error,
  }
}
