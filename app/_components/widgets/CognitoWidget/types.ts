/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠 COGNITO TYPES — Sistema de Tipos para Widget de IA Premium
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// Estados del asistente IA
export type CognitoState =
  | 'idle' // Esperando interacción
  | 'listening' // Escuchando voz
  | 'thinking' // Procesando consulta
  | 'speaking' // Respondiendo con voz
  | 'success' // Operación exitosa
  | 'error' // Error en operación
  | 'proactive' // Ofreciendo sugerencia proactiva

// Modos de operación del asistente
export type CognitoMode =
  | 'chat' // Conversación general
  | 'analysis' // Análisis profundo de datos
  | 'predictions' // Proyecciones financieras
  | 'insights' // Descubrimiento de oportunidades
  | 'automation' // Automatización de tareas

// Configuración del avatar
export interface AvatarConfig {
  style: 'particle' | 'orb' | 'abstract' | 'geometric'
  primaryColor: string
  secondaryColor: string
  tertiaryColor: string
  glowIntensity: number
  particleCount: number
  reactToVoice: boolean
}

// Mensaje en la conversación
export interface CognitoMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  mode?: CognitoMode
  metadata?: {
    confidence?: number
    dataUsed?: string[]
    executionTime?: number
    action?: CognitoAction
    entities?: Record<string, unknown>
    suggestions?: string[]
    charts?: ChartData[]
    kpis?: KPIData[]
  }
}

// Acción ejecutable por la IA
export interface CognitoAction {
  type: 'create' | 'read' | 'update' | 'delete' | 'navigate' | 'analyze' | 'export' | 'none'
  entity?: string
  params?: Record<string, unknown>
  requiresConfirmation?: boolean
  executed?: boolean
  result?: unknown
}

// Datos para gráficos
export interface ChartData {
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut'
  title: string
  data: Array<{ label: string; value: number; color?: string }>
}

// Datos de KPI
export interface KPIData {
  label: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  change?: number
  icon?: string
}

// Sugerencia proactiva
export interface ProactiveSuggestion {
  id: string
  type: 'alert' | 'insight' | 'action' | 'reminder'
  priority: 'critical' | 'high' | 'medium' | 'low'
  title: string
  description: string
  action?: CognitoAction
  dismissable: boolean
  timestamp: Date
}

// Configuración de voz
export interface VoiceConfig {
  enabled: boolean
  language: string
  voice?: string
  speed: number
  pitch: number
  volume: number
  useElevenLabs?: boolean
  elevenLabsVoiceId?: string
}

// Métricas del asistente
export interface CognitoMetrics {
  queriesTotal: number
  queriesToday: number
  accuracyRate: number
  averageResponseTime: number
  insightsGenerated: number
  actionsExecuted: number
  satisfaction?: number
}

// Contexto de la sesión
export interface CognitoContext {
  sessionId: string
  userId?: string
  currentPanel?: string
  history: CognitoMessage[]
  preferences: CognitoPreferences
  lastActivity: Date
  proactiveSuggestions: ProactiveSuggestion[]
}

// Preferencias del usuario
export interface CognitoPreferences {
  theme: 'auto' | 'light' | 'dark'
  avatarStyle: AvatarConfig['style']
  voiceEnabled: boolean
  soundEffects: boolean
  proactiveMode: boolean
  language: string
  shortcuts: Record<string, string>
}

// Props del widget
export interface CognitoWidgetProps {
  className?: string
  initialMode?: CognitoMode
  showMetrics?: boolean
  enableVoice?: boolean
  enableProactive?: boolean
  enableSoundEffects?: boolean
  avatarConfig?: Partial<AvatarConfig>
  voiceConfig?: Partial<VoiceConfig>
  onMessage?: (message: CognitoMessage) => void
  onStateChange?: (state: CognitoState) => void
  onModeChange?: (mode: CognitoMode) => void
  onActionExecuted?: (action: CognitoAction) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

// Partículas para el avatar
export interface Particle {
  id: number
  x: number
  y: number
  z: number
  vx: number
  vy: number
  vz: number
  size: number
  color: string
  alpha: number
  angle: number
  orbitRadius: number
  orbitSpeed: number
  pulsePhase: number
}

// Ondas de audio
export interface AudioWave {
  frequency: number
  amplitude: number
  phase: number
  color: string
}

// Conexión entre partículas
export interface ParticleConnection {
  from: number
  to: number
  strength: number
  color: string
}

// Estado del audio
export interface AudioState {
  isPlaying: boolean
  isMuted: boolean
  volume: number
  level: number
  frequencies: number[]
}

// Animaciones del avatar
export interface AvatarAnimation {
  name: string
  duration: number
  easing: string
  keyframes: Record<string, unknown>[]
}

// Colores por estado
export const STATE_COLORS: Record<CognitoState, { primary: string; glow: string; accent: string }> =
  {
    idle: { primary: '#8B5CF6', glow: 'rgba(139, 92, 246, 0.4)', accent: '#A78BFA' },
    listening: { primary: '#06B6D4', glow: 'rgba(6, 182, 212, 0.5)', accent: '#22D3EE' },
    thinking: { primary: '#FBBF24', glow: 'rgba(251, 191, 36, 0.5)', accent: '#FCD34D' },
    speaking: { primary: '#10B981', glow: 'rgba(16, 185, 129, 0.5)', accent: '#34D399' },
    success: { primary: '#22C55E', glow: 'rgba(34, 197, 94, 0.5)', accent: '#4ADE80' },
    error: { primary: '#EF4444', glow: 'rgba(239, 68, 68, 0.5)', accent: '#F87171' },
    proactive: { primary: '#F59E0B', glow: 'rgba(245, 158, 11, 0.5)', accent: '#FBBF24' },
  }

// Colores por modo
export const MODE_COLORS: Record<CognitoMode, { primary: string; icon: string }> = {
  chat: { primary: '#8B5CF6', icon: 'MessageSquare' },
  analysis: { primary: '#06B6D4', icon: 'BarChart3' },
  predictions: { primary: '#F472B6', icon: 'TrendingUp' },
  insights: { primary: '#F59E0B', icon: 'Lightbulb' },
  automation: { primary: '#10B981', icon: 'Zap' },
}

// Labels por estado
export const STATE_LABELS: Record<CognitoState, string> = {
  idle: 'Listo para ayudar',
  listening: 'Escuchando...',
  thinking: 'Procesando...',
  speaking: 'Respondiendo...',
  success: '¡Operación exitosa!',
  error: 'Hubo un problema',
  proactive: 'Tengo una sugerencia',
}

// Labels por modo
export const MODE_LABELS: Record<CognitoMode, string> = {
  chat: 'Chat',
  analysis: 'Análisis',
  predictions: 'Predicciones',
  insights: 'Insights',
  automation: 'Automatización',
}
