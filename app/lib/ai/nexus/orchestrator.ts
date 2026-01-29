/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠✨ NEXUS AI ORCHESTRATOR — SENTIENT SYSTEM COORDINATOR
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Central orchestrator for the MegaChronos Nexus AI system:
 * - Coordinates all AI services (Voice, STT, TTS, Inference)
 * - Manages conversation state
 * - Handles bio-feedback integration
 * - Predictive intention detection
 * - Proactive insights generation
 * - Tool execution pipeline
 *
 * @version 1.0.0
 * @author CHRONOS INFINITY TEAM
 */

import { logger } from '@/app/lib/utils/logger'
import { DeepgramNova3Client } from './deepgram-nova3'
import { ElevenLabsV3Client } from './elevenlabs-v3'
import { GitHubModelsClient, getGitHubModelsClient } from './github-models'
import type {
  BioMetrics,
  BusinessContext,
  ChronosInsight,
  ChronosMessage,
  ChronosToolCall,
  ElevenLabsV3Config,
  GitHubModelsConfig,
  MoodState,
  MoodThemeName,
  NexBotEmotion,
  VisemeType,
} from './types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 INTERNAL TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/** Internal orchestrator configuration (simplified) */
export interface OrchestratorConfig {
  voice?: Partial<ElevenLabsV3Config>
  stt?: { model: 'nova-3' | 'nova-2' | 'nova'; language: string }
  llm?: Partial<GitHubModelsConfig>
  bioFeedback?: { adaptVoice?: boolean; adaptPersonality?: boolean }
  alwaysListening?: { enabled: boolean; wakeWords: string[]; sensitivity: number }
  proactiveInsights?: { enabled: boolean; frequency: number; minConfidence: number }
}

/** Internal orchestrator state */
export interface OrchestratorState {
  isInitialized: boolean
  isListening: boolean
  isSpeaking: boolean
  isProcessing: boolean
  currentEmotion: NexBotEmotion
  currentViseme: VisemeType
  currentGesture: string
  conversationHistory: ChronosMessage[]
  activeToolCalls: ChronosToolCall[]
  bioMetrics: BioMetrics
  moodTheme: MoodThemeName
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: OrchestratorConfig = {
  voice: {
    voiceId: 'zero_force', // Quantum Identity
    modelId: 'eleven_turbo_v2_5',
    stability: 0.8,
    similarityBoost: 0.85,
    style: 0.2,
    useSpeakerBoost: true,
    emotionModulation: true,
    textToDialogue: true,
    languageCode: 'es',
    outputFormat: 'mp3_44100_128',
    optimizeStreamingLatency: 3, // Ultra-low latency
  },
  stt: {
    model: 'nova-3', // Upgraded to Nova-3 for <100ms latency
    language: 'es-MX',
  },
  llm: {
    model: 'gpt-4o',
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    financeContext: true,
    sentimentAnalysis: true,
    forecastingEnabled: true,
    anomalyDetection: true,
    stream: true, // Enable streaming for faster response
  },
  bioFeedback: {
    adaptVoice: true,
    adaptPersonality: true,
  },
  alwaysListening: {
    enabled: true, // Always listening enabled
    wakeWords: ['zero', 'hey zero', 'chronos', 'zero force'],
    sensitivity: 0.8,
  },
  proactiveInsights: {
    enabled: true,
    frequency: 30000,
    minConfidence: 0.75,
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 TOOL EXECUTORS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type ToolExecutor = (_params: Record<string, unknown>) => Promise<unknown>

const defaultToolExecutors: Record<string, ToolExecutor> = {
  crear_venta: async (params) => {
    logger.info('[Nexus] Executing crear_venta', { context: 'NexusOrchestrator', data: params })
    // Would integrate with actual venta creation
    return { success: true, message: 'Venta creada (simulado)' }
  },
  consultar_ventas: async (params) => {
    logger.info('[Nexus] Executing consultar_ventas', {
      context: 'NexusOrchestrator',
      data: params,
    })
    // Would query actual ventas
    return { ventas: [], total: 0 }
  },
  consultar_bancos: async (params) => {
    logger.info('[Nexus] Executing consultar_bancos', {
      context: 'NexusOrchestrator',
      data: params,
    })
    // Would query actual bancos
    return { bancos: [], capitalTotal: 0 }
  },
  registrar_abono: async (params) => {
    logger.info('[Nexus] Executing registrar_abono', { context: 'NexusOrchestrator', data: params })
    return { success: true, message: 'Abono registrado (simulado)' }
  },
  transferir_banco: async (params) => {
    logger.info('[Nexus] Executing transferir_banco', {
      context: 'NexusOrchestrator',
      data: params,
    })
    return { success: true, message: 'Transferencia realizada (simulada)' }
  },
  generar_reporte: async (params) => {
    logger.info('[Nexus] Executing generar_reporte', { context: 'NexusOrchestrator', data: params })
    return { reportUrl: '/reports/generated.pdf' }
  },
  analizar_tendencias: async (params) => {
    logger.info('[Nexus] Executing analizar_tendencias', {
      context: 'NexusOrchestrator',
      data: params,
    })
    return { trend: 'up', insights: [] }
  },
  predecir_ventas: async (params) => {
    logger.info('[Nexus] Executing predecir_ventas', { context: 'NexusOrchestrator', data: params })
    return { predictions: [] }
  },
  navegar_panel: async (params) => {
    logger.info('[Nexus] Executing navegar_panel', { context: 'NexusOrchestrator', data: params })
    return { navigated: true, panel: params.panel }
  },
  mostrar_grafico: async (params) => {
    logger.info('[Nexus] Executing mostrar_grafico', { context: 'NexusOrchestrator', data: params })
    return { chartType: params.tipo }
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧠 NEXUS AI ORCHESTRATOR CLASS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class NexusAIOrchestrator {
  private config: OrchestratorConfig
  private state: OrchestratorState
  private ttsClient: ElevenLabsV3Client | null = null
  private sttClient: DeepgramNova3Client | null = null
  private llmClient: GitHubModelsClient
  private toolExecutors: Record<string, ToolExecutor>

  // Event callbacks
  private onStateChange?: (_state: OrchestratorState) => void
  private onEmotionChange?: (_emotion: NexBotEmotion) => void
  private onVisemeChange?: (_viseme: VisemeType) => void
  private onInsight?: (_insight: ChronosInsight) => void
  private onToolCall?: (_toolCall: ChronosToolCall) => void
  private onNavigate?: (_panel: string) => void

  constructor(config?: Partial<OrchestratorConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.state = {
      isInitialized: false,
      isListening: false,
      isSpeaking: false,
      isProcessing: false,
      currentEmotion: 'neutral',
      currentViseme: 'sil',
      currentGesture: 'idle',
      conversationHistory: [],
      activeToolCalls: [],
      bioMetrics: {
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
      },
      moodTheme: 'serene',
    }

    this.llmClient = getGitHubModelsClient(this.config.llm)
    this.toolExecutors = { ...defaultToolExecutors }

    logger.info('[Nexus] Orchestrator created', { context: 'NexusOrchestrator' })
  }

  // ─────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────

  async initialize(): Promise<void> {
    try {
      logger.info('[Nexus] Initializing orchestrator...', { context: 'NexusOrchestrator' })

      // Initialize TTS client
      this.ttsClient = new ElevenLabsV3Client(this.config.voice)

      // Initialize STT client
      this.sttClient = new DeepgramNova3Client({
        model: (this.config.stt?.model ?? 'nova-2') as 'nova-3' | 'nova-2' | 'nova',
        language: this.config.stt?.language ?? 'es-MX',
      })

      // Set up STT callbacks
      this.sttClient.onTranscript((result) => {
        if (result.isFinal && result.text.trim()) {
          void this.processUserInput(result.text)
        }
      })

      this.sttClient.onWakeWord(() => {
        logger.info('[Nexus] Wake word detected', { context: 'NexusOrchestrator' })
        this.updateState({ isListening: true })
        this.setEmotion('curious')
      })

      this.sttClient.onIntent((_intent, _confidence) => {
        // Intent detection logged but not used directly
      })

      this.state.isInitialized = true
      this.emitStateChange()

      logger.info('[Nexus] Orchestrator initialized successfully', { context: 'NexusOrchestrator' })
    } catch (error) {
      logger.error('[Nexus] Initialization failed', error as Error, {
        context: 'NexusOrchestrator',
      })
      throw error
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // CONVERSATION FLOW
  // ─────────────────────────────────────────────────────────────────────

  async processUserInput(text: string, businessContext?: BusinessContext): Promise<ChronosMessage> {
    try {
      this.updateState({ isProcessing: true })
      this.setEmotion('thinking')

      // Add user message
      const userMessage: ChronosMessage = {
        id: `msg_${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date(),
      }
      this.addMessage(userMessage)

      // Get AI response
      const result = await this.llmClient.chat(text, {
        businessContext,
        userMood: this.state.currentEmotion,
        onToolCall: async (toolCall) => {
          this.onToolCall?.(toolCall)
          return this.executeToolCall(toolCall)
        },
      })

      // Create assistant message
      const assistantMessage: ChronosMessage = {
        id: `msg_${Date.now()}_resp`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        emotion: result.emotion,
        toolCalls: result.toolCalls,
        insights: result.insights,
      }
      this.addMessage(assistantMessage)

      // Update emotion
      this.setEmotion(result.emotion)

      // Emit insights
      result.insights.forEach((insight) => this.onInsight?.(insight))

      // Speak response
      if (!this.config.voice) {
        await this.speak(result.response)
      }

      this.updateState({ isProcessing: false })

      return assistantMessage
    } catch (error) {
      logger.error('[Nexus] Processing failed', error as Error, { context: 'NexusOrchestrator' })
      this.updateState({ isProcessing: false })
      this.setEmotion('concerned')
      throw error
    }
  }

  async speak(text: string): Promise<void> {
    if (!this.ttsClient) return

    try {
      this.updateState({ isSpeaking: true })

      await this.ttsClient.speak(text, this.state.currentEmotion, {
        onViseme: (viseme) => {
          this.state.currentViseme = viseme
          this.onVisemeChange?.(viseme)
        },
        onComplete: () => {
          this.updateState({ isSpeaking: false })
          this.state.currentViseme = 'sil'
          this.onVisemeChange?.('sil')
        },
      })
    } catch (error) {
      logger.error('[Nexus] TTS failed', error as Error, { context: 'NexusOrchestrator' })
      this.updateState({ isSpeaking: false })
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // LISTENING CONTROL
  // ─────────────────────────────────────────────────────────────────────

  async startListening(): Promise<void> {
    if (!this.sttClient || this.state.isListening) return

    try {
      await this.sttClient.start()
      this.updateState({ isListening: true })
      this.setEmotion('curious')
      logger.info('[Nexus] Started listening', { context: 'NexusOrchestrator' })
    } catch (error) {
      logger.error('[Nexus] Failed to start listening', error as Error, {
        context: 'NexusOrchestrator',
      })
    }
  }

  stopListening(): void {
    if (!this.sttClient || !this.state.isListening) return

    this.sttClient.stop()
    this.updateState({ isListening: false })
    this.setEmotion('neutral')
    logger.info('[Nexus] Stopped listening', { context: 'NexusOrchestrator' })
  }

  async startAlwaysListening(): Promise<void> {
    if (!this.sttClient) return

    try {
      // Start always-listening mode without parameters
      await this.sttClient.startAlwaysListening()
      logger.info('[Nexus] Started always-listening mode', { context: 'NexusOrchestrator' })
    } catch (error) {
      logger.error('[Nexus] Failed to start always-listening', error as Error, {
        context: 'NexusOrchestrator',
      })
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // TOOL EXECUTION
  // ─────────────────────────────────────────────────────────────────────

  private async executeToolCall(toolCall: ChronosToolCall): Promise<unknown> {
    const executor = this.toolExecutors[toolCall.name]
    if (!executor) {
      logger.warn('[Nexus] No executor for tool', {
        context: 'NexusOrchestrator',
        data: { tool: toolCall.name },
      })
      return { error: `No executor for tool: ${toolCall.name}` }
    }

    try {
      toolCall.traceability.status = 'executing'
      this.state.activeToolCalls.push(toolCall)
      this.emitStateChange()

      const result = await executor(toolCall.parameters)

      toolCall.traceability.status = 'completed'
      toolCall.traceability.completedAt = new Date()
      toolCall.traceability.result = result

      // Handle navigation
      if (toolCall.name === 'navegar_panel' && toolCall.parameters.panel) {
        this.onNavigate?.(toolCall.parameters.panel as string)
      }

      this.emitStateChange()
      return result
    } catch (error) {
      toolCall.traceability.status = 'failed'
      toolCall.traceability.error = (error as Error).message
      this.emitStateChange()
      throw error
    }
  }

  registerToolExecutor(name: string, executor: ToolExecutor): void {
    this.toolExecutors[name] = executor
    logger.info('[Nexus] Tool executor registered', {
      context: 'NexusOrchestrator',
      data: { name },
    })
  }

  // ─────────────────────────────────────────────────────────────────────
  // BIO-FEEDBACK
  // ─────────────────────────────────────────────────────────────────────

  updateBioMetrics(metrics: Partial<BioMetrics>): void {
    this.state.bioMetrics = { ...this.state.bioMetrics, ...metrics }

    // Adapt mood based on bio-feedback
    if (this.config.bioFeedback?.adaptPersonality) {
      this.adaptToMood()
    }

    this.emitStateChange()
  }

  private adaptToMood(): void {
    const { stressLevel, emotionalValence, focusLevel } = this.state.bioMetrics

    // Determine mood theme and corresponding mood state
    let newMoodTheme: MoodThemeName = 'serene'
    let moodStateForVoice: MoodState = 'calm'

    if (stressLevel > 0.7) {
      newMoodTheme = 'serene' // Calming for stressed users
      moodStateForVoice = 'stressed'
    } else if (emotionalValence > 0.6 && focusLevel > 0.5) {
      newMoodTheme = 'professional'
      moodStateForVoice = 'focused'
    } else if (emotionalValence > 0.7) {
      newMoodTheme = 'celebratory'
      moodStateForVoice = 'euphoric'
    } else if (focusLevel > 0.8) {
      newMoodTheme = 'deep_focus'
      moodStateForVoice = 'flow'
    }

    this.state.moodTheme = newMoodTheme

    // Adapt TTS voice using mood state
    if (this.ttsClient && this.config.bioFeedback?.adaptVoice) {
      this.ttsClient.adaptToMood(moodStateForVoice)
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────

  private updateState(updates: Partial<OrchestratorState>): void {
    this.state = { ...this.state, ...updates }
    this.emitStateChange()
  }

  private addMessage(message: ChronosMessage): void {
    this.state.conversationHistory.push(message)
    this.emitStateChange()
  }

  private setEmotion(emotion: NexBotEmotion): void {
    this.state.currentEmotion = emotion
    this.onEmotionChange?.(emotion)
    this.emitStateChange()
  }

  private emitStateChange(): void {
    this.onStateChange?.({ ...this.state })
  }

  // ─────────────────────────────────────────────────────────────────────
  // EVENT HANDLERS
  // ─────────────────────────────────────────────────────────────────────

  setOnStateChange(callback: (_state: OrchestratorState) => void): void {
    this.onStateChange = callback
  }

  setOnEmotionChange(callback: (_emotion: NexBotEmotion) => void): void {
    this.onEmotionChange = callback
  }

  setOnVisemeChange(callback: (_viseme: VisemeType) => void): void {
    this.onVisemeChange = callback
  }

  setOnInsight(callback: (_insight: ChronosInsight) => void): void {
    this.onInsight = callback
  }

  setOnToolCall(callback: (_toolCall: ChronosToolCall) => void): void {
    this.onToolCall = callback
  }

  setOnNavigate(callback: (_panel: string) => void): void {
    this.onNavigate = callback
  }

  // ─────────────────────────────────────────────────────────────────────
  // PUBLIC GETTERS
  // ─────────────────────────────────────────────────────────────────────

  getState(): OrchestratorState {
    return { ...this.state }
  }

  getConversationHistory(): ChronosMessage[] {
    return [...this.state.conversationHistory]
  }

  clearConversation(): void {
    this.state.conversationHistory = []
    this.llmClient.clearHistory()
    this.emitStateChange()
    logger.info('[Nexus] Conversation cleared', { context: 'NexusOrchestrator' })
  }

  // ─────────────────────────────────────────────────────────────────────
  // CLEANUP
  // ─────────────────────────────────────────────────────────────────────

  destroy(): void {
    this.stopListening()
    this.ttsClient = null
    this.sttClient = null
    this.state.isInitialized = false
    logger.info('[Nexus] Orchestrator destroyed', { context: 'NexusOrchestrator' })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎁 SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

let nexusInstance: NexusAIOrchestrator | null = null

export function getNexusOrchestrator(config?: Partial<OrchestratorConfig>): NexusAIOrchestrator {
  if (!nexusInstance) {
    nexusInstance = new NexusAIOrchestrator(config)
  }
  return nexusInstance
}

export default NexusAIOrchestrator
