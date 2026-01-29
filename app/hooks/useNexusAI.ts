/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🪝✨ USE NEXUS AI — REACT HOOK FOR AI INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * React hook for integrating the Nexus AI system into components:
 * - Manages AI state
 * - Handles voice input/output
 * - Provides conversation interface
 * - Bio-feedback integration
 * - Proactive insights
 *
 * @version 1.0.0
 * @author CHRONOS INFINITY TEAM
 */

'use client'

import {
  getNexusOrchestrator,
  NexusAIOrchestrator,
  type OrchestratorConfig,
  type OrchestratorState,
} from '@/app/lib/ai/nexus'
import type {
  BioMetrics,
  BusinessContext,
  ChronosInsight,
  ChronosMessage,
  ChronosToolCall,
  NexBotEmotion,
  VisemeType,
} from '@/app/lib/ai/nexus/types'
import { logger } from '@/app/lib/utils/logger'
import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 HOOK RETURN TYPE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface UseNexusAIReturn {
  // State
  isInitialized: boolean
  isListening: boolean
  isSpeaking: boolean
  isProcessing: boolean
  currentEmotion: NexBotEmotion
  currentViseme: VisemeType
  messages: ChronosMessage[]
  activeToolCalls: ChronosToolCall[]
  insights: ChronosInsight[]
  bioMetrics: BioMetrics

  // Actions
  initialize: () => Promise<void>
  sendMessage: (_text: string, _context?: BusinessContext) => Promise<ChronosMessage | null>
  startListening: () => Promise<void>
  stopListening: () => void
  startAlwaysListening: () => Promise<void>
  speak: (_text: string) => Promise<void>
  clearConversation: () => void
  updateBioMetrics: (_metrics: Partial<BioMetrics>) => void
  dismissInsight: (_id: string) => void

  // Tool registration
  registerTool: (
    _name: string,
    _executor: (_params: Record<string, unknown>) => Promise<unknown>
  ) => void
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🪝 HOOK IMPLEMENTATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export function useNexusAI(config?: Partial<OrchestratorConfig>): UseNexusAIReturn {
  // State
  const [isInitialized, setIsInitialized] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentEmotion, setCurrentEmotion] = useState<NexBotEmotion>('neutral')
  const [currentViseme, setCurrentViseme] = useState<VisemeType>('sil')
  const [messages, setMessages] = useState<ChronosMessage[]>([])
  const [activeToolCalls, setActiveToolCalls] = useState<ChronosToolCall[]>([])
  const [insights, setInsights] = useState<ChronosInsight[]>([])
  const [bioMetrics, setBioMetrics] = useState<BioMetrics>({
    heartRate: 72,
    heartRateVariability: null,
    pulseQuality: 'good',
    mood: 'calm',
    stressLevel: 30,
    energyLevel: 70,
    focusLevel: 70,
    emotionalValence: 0.5,
    facialExpression: null,
    gestureDetected: null,
    eyeGaze: null,
    blinkRate: 15,
    lastUpdate: new Date(),
    arousalLevel: 0.5,
  })

  // Refs
  const orchestratorRef = useRef<NexusAIOrchestrator | null>(null)
  const onNavigateRef = useRef<((_panel: string) => void) | null>(null)

  // ─────────────────────────────────────────────────────────────────────
  // INITIALIZE
  // ─────────────────────────────────────────────────────────────────────

  const initialize = useCallback(async () => {
    if (orchestratorRef.current?.getState().isInitialized) {
      return
    }

    try {
      logger.info('[useNexusAI] Initializing...', { context: 'useNexusAI' })

      orchestratorRef.current = getNexusOrchestrator(config)

      // Set up event handlers
      orchestratorRef.current.setOnStateChange((state: OrchestratorState) => {
        setIsInitialized(state.isInitialized ?? false)
        setIsListening(state.isListening ?? false)
        setIsSpeaking(state.isSpeaking ?? false)
        setIsProcessing(state.isProcessing ?? false)
        setCurrentEmotion(state.currentEmotion ?? 'neutral')
        setCurrentViseme(state.currentViseme ?? 'sil')
        setMessages([...(state.conversationHistory ?? [])])
        setActiveToolCalls([...(state.activeToolCalls ?? [])])
        setBioMetrics({ ...state.bioMetrics })
      })

      orchestratorRef.current.setOnEmotionChange((emotion: NexBotEmotion) => {
        setCurrentEmotion(emotion)
      })

      orchestratorRef.current.setOnVisemeChange((viseme: VisemeType) => {
        setCurrentViseme(viseme)
      })

      orchestratorRef.current.setOnInsight((insight: ChronosInsight) => {
        setInsights((prev) => [insight, ...prev].slice(0, 10))
      })

      orchestratorRef.current.setOnNavigate((panel: string) => {
        onNavigateRef.current?.(panel)
      })

      await orchestratorRef.current.initialize()
      setIsInitialized(true)

      logger.info('[useNexusAI] Initialized successfully', { context: 'useNexusAI' })
    } catch (error) {
      logger.error('[useNexusAI] Initialization failed', error as Error, { context: 'useNexusAI' })
      throw error
    }
  }, [config])

  // ─────────────────────────────────────────────────────────────────────
  // SEND MESSAGE
  // ─────────────────────────────────────────────────────────────────────

  const sendMessage = useCallback(
    async (text: string, context?: BusinessContext): Promise<ChronosMessage | null> => {
      if (!orchestratorRef.current || !isInitialized) {
        logger.warn('[useNexusAI] Cannot send message - not initialized', { context: 'useNexusAI' })
        return null
      }

      try {
        const response = await orchestratorRef.current.processUserInput(text, context)
        return response
      } catch (error) {
        logger.error('[useNexusAI] Send message failed', error as Error, { context: 'useNexusAI' })
        return null
      }
    },
    [isInitialized],
  )

  // ─────────────────────────────────────────────────────────────────────
  // VOICE CONTROLS
  // ─────────────────────────────────────────────────────────────────────

  const startListening = useCallback(async () => {
    if (!orchestratorRef.current) return
    await orchestratorRef.current.startListening()
  }, [])

  const stopListening = useCallback(() => {
    orchestratorRef.current?.stopListening()
  }, [])

  const startAlwaysListening = useCallback(async () => {
    if (!orchestratorRef.current) return
    await orchestratorRef.current.startAlwaysListening()
  }, [])

  const speak = useCallback(async (text: string) => {
    if (!orchestratorRef.current) return
    await orchestratorRef.current.speak(text)
  }, [])

  // ─────────────────────────────────────────────────────────────────────
  // OTHER ACTIONS
  // ─────────────────────────────────────────────────────────────────────

  const clearConversation = useCallback(() => {
    orchestratorRef.current?.clearConversation()
    setMessages([])
    setActiveToolCalls([])
  }, [])

  const updateBioMetrics = useCallback((metrics: Partial<BioMetrics>) => {
    orchestratorRef.current?.updateBioMetrics(metrics)
  }, [])

  const dismissInsight = useCallback((id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const registerTool = useCallback(
    (name: string, executor: (_params: Record<string, unknown>) => Promise<unknown>) => {
      orchestratorRef.current?.registerToolExecutor(name, executor)
    },
    [],
  )

  // ─────────────────────────────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      orchestratorRef.current?.destroy()
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────

  return {
    // State
    isInitialized,
    isListening,
    isSpeaking,
    isProcessing,
    currentEmotion,
    currentViseme,
    messages,
    activeToolCalls,
    insights,
    bioMetrics,

    // Actions
    initialize,
    sendMessage,
    startListening,
    stopListening,
    startAlwaysListening,
    speak,
    clearConversation,
    updateBioMetrics,
    dismissInsight,
    registerTool,
  }
}

export default useNexusAI
