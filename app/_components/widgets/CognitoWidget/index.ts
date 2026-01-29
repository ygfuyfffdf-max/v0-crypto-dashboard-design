/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠 COGNITO WIDGET — Exports
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// Main Widget
export { CognitoWidget, default } from './CognitoWidget'

// Floating Button
export { CognitoFloatingButton } from './CognitoFloatingButton'

// Avatar
export { CognitoAvatar } from './CognitoAvatar'

// Chat Components
export {
  ChatInput,
  MessageBubble,
  ModeSelector,
  QuickActions,
  TypingIndicator,
} from './CognitoChat'

// Voice Components
export { AudioBarsVisualizer, VoiceButton, VoiceWaveVisualizer, useVoice } from './CognitoVoice'

// Engine
export { processQuery } from './CognitoEngine'

// Store
export {
  useCognitoAudio,
  useCognitoMessages,
  useCognitoMetrics,
  useCognitoMode,
  useCognitoPreferences,
  useCognitoState,
  useCognitoStore,
  useCognitoSuggestions,
} from './useCognitoStore'

// Types
export type {
  AudioState,
  AudioWave,
  AvatarAnimation,
  AvatarConfig,
  ChartData,
  CognitoAction,
  CognitoContext,
  CognitoMessage,
  CognitoMetrics,
  CognitoMode,
  CognitoPreferences,
  CognitoState,
  CognitoWidgetProps,
  KPIData,
  Particle,
  ParticleConnection,
  ProactiveSuggestion,
  VoiceConfig,
} from './types'

export { MODE_COLORS, MODE_LABELS, STATE_COLORS, STATE_LABELS } from './types'
