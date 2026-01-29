/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠✨ MEGACHRONOS NEXUS GEN Ω — TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de tipos para el AI Subsystem más avanzado del universo:
 * - NexBot Nexus Avatar (3D rigged, 50+ visemes, 30+ emotions)
 * - Bio-Feedback System (MediaPipe, pulse, mood detection)
 * - Voice Integration (Eleven Labs v3, Deepgram Nova-3)
 * - GitHub Models FinGPT Integration
 * - WebGPU Particle Systems (2M+ particles)
 * - Sentient Functions with predictive intention
 *
 * @version Ω.1.0.0
 * @author CHRONOS INFINITY TEAM
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎭 AVATAR & EMOTION TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/** Estados emocionales del sistema - 30+ variantes */
export type NexBotEmotion =
  | 'idle'
  | 'happy'
  | 'excited'
  | 'euphoric'
  | 'calm'
  | 'focused'
  | 'thinking'
  | 'confused'
  | 'curious'
  | 'surprised'
  | 'concerned'
  | 'worried'
  | 'sad'
  | 'tired'
  | 'stressed'
  | 'angry'
  | 'listening'
  | 'speaking'
  | 'processing'
  | 'quantum' // Zero Force specific
  | 'success'
  | 'celebrating'
  | 'proud'
  | 'determined'
  | 'playful'
  | 'mischievous'
  | 'shy'
  | 'confident'
  | 'loving'
  | 'grateful'
  | 'error'
  | 'warning'
  | 'neutral'
  | 'alert'

/** Estados del Avatar 3D */
export type NexBotState =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'processing'
  | 'success'
  | 'error'
  | 'celebrating'
  | 'working'
  | 'sleeping'
  | 'waking'

/** Visemas para lip-sync - 50+ variantes para español/inglés */
export type VisemeType =
  | 'sil' // Silencio
  | 'aa' // "a" como en "padre"
  | 'ae' // "e" abierta
  | 'ah' // "a" aspirada
  | 'ao' // "ao" diptongo
  | 'aw' // "au" como en "auto"
  | 'ay' // "ai" como en "aire"
  | 'b' // "b" bilabial
  | 'ch' // "ch" como en "chico"
  | 'd' // "d" dental
  | 'dh' // "d" suave
  | 'eh' // "e" como en "esto"
  | 'er' // "er" como en "verdad"
  | 'ey' // "ei" diptongo
  | 'f' // "f" labiodental
  | 'g' // "g" gutural
  | 'hh' // "h" aspirada
  | 'ih' // "i" corta
  | 'iy' // "i" larga
  | 'jh' // "y" como en "yo"
  | 'k' // "k/c" oclusiva
  | 'l' // "l" lateral
  | 'la' // "ll" española
  | 'm' // "m" bilabial nasal
  | 'n' // "n" nasal
  | 'ng' // "ng" nasal velar
  | 'ny' // "ñ" española
  | 'oh' // "o" como en "solo"
  | 'ow' // "ou" diptongo
  | 'oy' // "oi" diptongo
  | 'p' // "p" bilabial oclusiva
  | 'r' // "r" vibrante simple
  | 'rr' // "rr" vibrante múltiple
  | 's' // "s" sibilante
  | 'sh' // "sh" como en "show"
  | 't' // "t" dental
  | 'th' // "z" española (theta)
  | 'uh' // "u" corta
  | 'uw' // "u" larga
  | 'v' // "v" labiodental
  | 'w' // "w/u" semivocal
  | 'y' // "y/i" semivocal
  | 'z' // "z" sonora
  | 'zh' // "s" sonora
  | 'neutral' // Posición neutral
  | 'PP' // Pausa prolongada

/** Gestos del avatar - body IK */
export type GestureType =
  | 'idle'
  | 'wave_hello'
  | 'wave_goodbye'
  | 'nod_yes'
  | 'shake_no'
  | 'point_up'
  | 'point_down'
  | 'point_left'
  | 'point_right'
  | 'thumbs_up'
  | 'thumbs_down'
  | 'clap'
  | 'celebrate'
  | 'think'
  | 'shrug'
  | 'facepalm'
  | 'heart'
  | 'present_data'
  | 'show_chart'
  | 'type_keyboard'
  | 'swipe_left'
  | 'swipe_right'
  | 'zoom_in'
  | 'zoom_out'
  | 'idle_breathe'
  | 'idle_look_around'
  | 'idle_stretch'
  | 'dance_subtle'
  | 'dance_excited'
  | 'bow'
  | 'attention'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧬 BIO-FEEDBACK TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/** Estados de ánimo detectados */
export type MoodState =
  | 'calm'
  | 'flow'
  | 'focused'
  | 'stressed'
  | 'euphoric'
  | 'tired'
  | 'anxious'
  | 'relaxed'
  | 'neutral'

/** Calidad de la señal de pulso */
export type PulseQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'none'

/** Nombres de temas de mood para el sistema */
export type MoodThemeName =
  | 'serene'
  | 'professional'
  | 'celebratory'
  | 'deep_focus'
  | 'alert'
  | 'calm'
  | 'energetic'

/** Métricas biométricas en tiempo real */
export interface BioMetrics {
  heartRate: number | null
  heartRateVariability: number | null
  pulseQuality: PulseQuality
  mood: MoodState
  stressLevel: number // 0-100
  energyLevel: number // 0-100
  focusLevel: number // 0-100
  emotionalValence: number // -1 a 1 (negativo a positivo)
  facialExpression: NexBotEmotion | null
  gestureDetected: GestureType | null
  eyeGaze: { x: number; y: number } | null
  blinkRate: number // blinks per minute
  lastUpdate: Date
  arousalLevel?: number // 0-1 nivel de activación
}

/** Configuración de temas por mood */
export interface MoodTheme {
  primaryGlow: string
  secondaryGlow: string
  particleSpeed: number
  particleCount: number
  blurIntensity: number
  animationSpeed: number
  hapticPattern: number[]
  voiceTone: 'warm' | 'energetic' | 'calm' | 'professional' | 'concerned'
  shaderIntensity: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎤 VOICE TYPES - ELEVEN LABS V3 & DEEPGRAM NOVA-3
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/** Voces premium de Eleven Labs v3 */
export type ElevenLabsVoice =
  // Premium Neural Cloning Voices
  | 'aria' // Multilingual female, warm
  | 'roger' // American male, professional
  | 'sarah' // British female, sophisticated
  | 'laura' // American female, friendly
  | 'charlie' // Australian male, casual
  | 'george' // British male, authoritative
  | 'callum' // Scottish male, warm
  | 'river' // American non-binary, calm
  | 'liam' // Irish male, storyteller
  | 'charlotte' // Nordic female, clear
  // Spanish Native Voices
  | 'carlos_mx' // Mexican male, professional
  | 'valentina_mx' // Mexican female, executive
  | 'mateo_mx' // Mexican male, casual
  | 'sofia_mx' // Mexican female, friendly
  | 'diego_es' // Spanish male, formal
  | 'lucia_es' // Spanish female, warm
  // Special Voices
  | 'zero_force' // CHRONOS Main Identity (Quantum/Robotized)

/** Configuración de voz Eleven Labs v3 */
export interface ElevenLabsV3Config {
  voiceId: ElevenLabsVoice | string
  modelId: 'eleven_turbo_v2_5' | 'eleven_multilingual_v2' | 'eleven_flash_v2_5' | 'eleven_v3_alpha'
  stability: number // 0-1
  similarityBoost: number // 0-1
  style: number // 0-1
  useSpeakerBoost: boolean
  // V3 Alpha features
  emotionModulation: boolean
  textToDialogue: boolean
  languageCode: string // ISO 639-1
  // Voice settings
  outputFormat: 'mp3_44100_128' | 'pcm_16000' | 'pcm_22050' | 'pcm_44100' | 'ulaw_8000'
  optimizeStreamingLatency: 0 | 1 | 2 | 3 | 4
}

/** Estado del Deepgram STT */
export type DeepgramState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'processing'
  | 'reconnecting'
  | 'error'
  | 'closed'

/** Configuración Deepgram Nova-3 */
export interface DeepgramNova3Config {
  apiKey?: string
  language: string
  model: 'nova-3' | 'nova-2' | 'nova'
  // Nova-3 features
  smartFormat: boolean
  punctuate: boolean
  diarize: boolean
  sentiment: boolean // Análisis de sentimiento
  topics: boolean // Detección de temas
  utterances: boolean // Detección de frases
  // Conversational Intelligence
  turnTaking: boolean // Detección de turnos de conversación
  intentRecognition: boolean // Reconocimiento de intención
  // Real-time settings
  interimResults: boolean
  endpointing: number // ms de silencio para fin de frase
  vadTurnoff: number // Voice Activity Detection
  // Wake word
  wakeWord: string
  wakeWordSensitivity: number // 0-1
}

/** Resultado de transcripción con sentimiento */
export interface TranscriptionResult {
  text: string
  isFinal: boolean
  confidence: number
  sentiment?: 'positive' | 'negative' | 'neutral'
  intent?: string
  topics?: string[]
  words?: Array<{
    word: string
    start: number
    end: number
    confidence: number
    sentiment?: 'positive' | 'negative' | 'neutral'
  }>
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🤖 GITHUB MODELS & FINGPT TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/** Modelos disponibles en GitHub Models */
export type GitHubModel =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'claude-3.5-sonnet'
  | 'claude-3-opus'
  | 'mistral-large'
  | 'llama-3.1-70b'
  | 'llama-3.1-8b'
  | 'phi-3-medium'
  | 'cohere-command-r-plus'
  // Finance-specific fine-tuned
  | 'fingpt-sentiment'
  | 'fingpt-forecaster'
  | 'finllm-analyst'

/** Configuración de GitHub Models */
export interface GitHubModelsConfig {
  model: GitHubModel
  temperature: number
  maxTokens: number
  topP: number
  frequencyPenalty: number
  presencePenalty: number
  // Finance fine-tuning
  financeContext: boolean
  sentimentAnalysis: boolean
  forecastingEnabled: boolean
  anomalyDetection: boolean
  // Streaming
  stream: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔮 SENTIENT FUNCTIONS & TOOL CALLING
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/** Nombres de herramientas MegaChronos */
export type ChronosToolName =
  // CRUD Operations
  | 'crear_venta'
  | 'crear_orden_compra'
  | 'crear_cliente'
  | 'crear_distribuidor'
  | 'registrar_abono'
  | 'registrar_pago_distribuidor'
  | 'transferir_banco'
  | 'registrar_gasto'
  | 'actualizar_stock'
  // Query Operations
  | 'consultar_ventas'
  | 'consultar_clientes'
  | 'consultar_distribuidores'
  | 'consultar_bancos'
  | 'consultar_stock'
  | 'consultar_ordenes'
  | 'consultar_movimientos'
  // Analytics & Reports
  | 'generar_reporte'
  | 'analizar_tendencias'
  | 'predecir_ventas'
  | 'optimizar_precios'
  | 'detectar_anomalias'
  | 'calcular_roi'
  | 'analizar_flujo_caja'
  // Navigation & UI
  | 'navegar_panel'
  | 'mostrar_grafico'
  | 'abrir_modal'
  | 'exportar_datos'
  // Sentient Actions
  | 'sugerir_accion'
  | 'anticipar_necesidad'
  | 'alertar_riesgo'
  | 'celebrar_logro'

/** Tool call con contexto emocional */
export interface ChronosToolCall {
  id: string
  name: ChronosToolName
  description: string
  parameters: Record<string, unknown>
  requiresConfirmation: boolean
  estimatedTime: number
  emotionalContext?: {
    urgency: 'low' | 'medium' | 'high' | 'critical'
    sentiment: 'positive' | 'neutral' | 'negative'
    suggestedEmotion: NexBotEmotion
  }
  traceability: {
    initiatedAt: Date
    completedAt?: Date
    status: 'pending' | 'executing' | 'completed' | 'failed'
    result?: unknown
    error?: string
  }
}

/** Insight generado por IA sentiente */
export interface ChronosInsight {
  id: string
  type:
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'prediction'
    | 'opportunity'
    | 'celebration'
    | 'tip'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  metric?: string
  value?: number | string
  trend?: 'up' | 'down' | 'stable' | 'volatile'
  action?: ChronosToolCall
  suggestedAction?: string
  confidence: number // 0-100
  expiresAt?: Date
  emotionalTone: NexBotEmotion
  visualizationType?: 'sankey' | 'bar' | 'line' | 'radar' | 'gauge' | 'treemap' | 'network' | '3d'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 💬 CHAT & MESSAGE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/** Mensaje del chat multimodal */
export interface ChronosMessage {
  id: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  timestamp: Date
  // Multimodal inputs
  audioUrl?: string
  imageUrl?: string
  gestureInput?: GestureType
  // AI response metadata
  emotion?: NexBotEmotion
  confidence?: number
  intent?: string
  entities?: Record<string, unknown>
  // Actions & visualizations
  toolCalls?: ChronosToolCall[]
  insights?: ChronosInsight[]
  visualizations?: ChronosVisualization[]
  suggestions?: string[]
  // Voice output
  speechUrl?: string
  visemes?: Array<{ viseme: VisemeType; timestamp: number; duration: number }>
}

/** Visualización generada por IA */
export interface ChronosVisualization {
  id: string
  type:
    | 'sankey'
    | 'bar'
    | 'line'
    | 'radar'
    | 'gauge'
    | 'treemap'
    | 'heatmap'
    | 'network'
    | '3d_scene'
    | 'timeline'
  title: string
  data: unknown
  config?: Record<string, unknown>
  emergentFrom?: 'mouth' | 'hands' | 'chest' | 'head' // Nexbot body part for organic emergence
  animationType?: 'fade' | 'grow' | 'morph' | 'explode' | 'flow'
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🌌 WEBGPU & SHADER TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/** Configuración del sistema de partículas WebGPU */
export interface WebGPUParticleConfig {
  maxParticles: number // Up to 2M+
  particleSize: number
  emissionRate: number
  lifetime: number
  // Physics
  gravity: [number, number, number]
  turbulence: number
  velocityDamping: number
  // Visual
  colorStart: string
  colorEnd: string
  blendMode: 'additive' | 'multiply' | 'normal'
  // Reactive
  reactToPulse: boolean
  reactToMood: boolean
  reactToGestures: boolean
  reactToVoice: boolean
  // LOD for sustainability
  lodEnabled: boolean
  lowPowerMode: boolean
}

/** Tipos de shaders disponibles */
export type ShaderType =
  | 'liquid_metal'
  | 'quantum_void'
  | 'volumetric_glow'
  | 'godrays'
  | 'fractal_mandelbulb'
  | 'voronoi_swarm'
  | 'holographic_glitch'
  | 'iridescent_glass'
  | 'plasma_flow'
  | 'neural_network'

/** Configuración de shader */
export interface ShaderConfig {
  type: ShaderType
  intensity: number
  speed: number
  colorPrimary: string
  colorSecondary: string
  // Mood-reactive
  moodAdaptive: boolean
  currentMood?: MoodState
  // Performance
  quality: 'low' | 'medium' | 'high' | 'ultra'
  sustainableMode: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧩 CONTEXT & STATE TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/** Contexto de negocio para IA */
export interface BusinessContext {
  // Capital
  capitalTotal: number
  utilidadesMes: number
  flujoCajaMes: number
  tendenciaCapital: 'up' | 'down' | 'stable'

  // Ventas
  ventasHoy: number
  ventasMes: number
  ventasPromedioDiario: number
  margenPromedio: number
  tendenciaVentas: 'up' | 'down' | 'stable'

  // Clientes
  totalClientes: number
  clientesActivos: number
  clientesConDeuda: number
  deudaTotalClientes: number
  nuevosMesClientes: number

  // Distribuidores
  totalDistribuidores: number
  adeudoTotalDistribuidores: number
  ordenesEnTransito: number

  // Inventario
  totalProductos: number
  productosBajoStock: number
  valorInventario: number

  // Alertas activas
  alertasCriticas: number
  alertasWarning: number

  // Timestamp
  lastUpdate: Date
}

/** Estado global del sistema AI */
export interface NexusAIState {
  // Avatar
  avatarState: NexBotState
  avatarEmotion: NexBotEmotion
  currentGesture: GestureType | null
  currentViseme: VisemeType

  // Bio-feedback
  bioMetrics: BioMetrics
  moodTheme: MoodThemeName

  // Processing states
  isProcessing?: boolean
  isInitialized?: boolean

  // Tool calls activos
  activeToolCalls?: ChronosToolCall[]

  // Emotion tracking
  currentEmotion?: NexBotEmotion

  // Conversation history
  conversationHistory?: ChronosMessage[]

  // Voice
  isListening: boolean
  isSpeaking: boolean
  voiceState: DeepgramState
  wakeWordDetected: boolean

  // Chat
  messages: ChronosMessage[]
  currentIntent: string | null
  pendingToolCalls: ChronosToolCall[]

  // Context
  businessContext: BusinessContext
  currentPanel: string

  // Auto-evolution
  lastEvolutionUpdate: Date
  evolutionVersion: string

  // Performance
  fps: number
  particleCount: number
  sustainableMode: boolean
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔧 CONFIGURATION TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/** Configuración completa del sistema Nexus */
export interface NexusConfig {
  // Voice
  elevenLabs: ElevenLabsV3Config
  deepgram: DeepgramNova3Config

  // Voice shortcuts (deprecated - use elevenLabs/deepgram)
  voice?: Partial<ElevenLabsV3Config>
  stt?: { model: string; language: string }
  llm?: Partial<GitHubModelsConfig>

  // AI Model
  githubModels: GitHubModelsConfig

  // Avatar
  avatarSize: number
  avatarPosition: 'bottom-right' | 'bottom-left' | 'center' | 'fullscreen'
  enableLipSync: boolean
  enableGestures: boolean
  enableBioFeedback: boolean

  // Particles
  particles: WebGPUParticleConfig

  // Shaders
  defaultShader: ShaderType
  shaderQuality: 'low' | 'medium' | 'high' | 'ultra'

  // Features
  alwaysListening: boolean | { enabled: boolean; wakeWords: string[]; sensitivity: number }
  predictiveIntention: boolean
  emotionalAdaptation: boolean
  autoEvolution: boolean

  // Bio feedback config
  bioFeedback?: {
    adaptPersonality?: boolean
    adaptVoice?: boolean
  }

  // Sustainability
  sustainableMode: boolean
  lowPowerThreshold: number // Battery percentage

  // Privacy
  onDeviceProcessing: boolean
  dataRetention: 'session' | '24h' | '7d' | '30d' | 'forever'
}
