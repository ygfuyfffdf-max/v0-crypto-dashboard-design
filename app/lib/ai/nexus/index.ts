/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌✨ MEGACHRONOS NEXUS GEN Ω — PUBLIC EXPORTS INDEX
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Central export point for all Nexus AI system modules.
 *
 * @version 1.0.0
 * @author CHRONOS INFINITY TEAM
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type {
  // Bio-Feedback
  BioMetrics,
  BusinessContext,
  ChronosInsight,
  // Messages & Conversations
  ChronosMessage,
  ChronosToolCall,
  ChronosToolName,
  DeepgramNova3Config,
  // Voice Services
  ElevenLabsV3Config,
  GestureType,
  // AI Models
  GitHubModel,
  GitHubModelsConfig,
  MoodTheme,
  // Emotions & Expressions
  NexBotEmotion,
  // System State
  NexusAIState,
  NexusConfig,
  VisemeType,
  // WebGPU Particles
  WebGPUParticleConfig,
} from './types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🔊 VOICE SERVICES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export {
  ElevenLabsV3Client,
  FINANCE_VOICE_PRESETS,
  VOICE_IDS,
  getElevenLabsClient,
} from './elevenlabs-v3'

export { DeepgramNova3Client, getDeepgramClient } from './deepgram-nova3'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧠 AI INFERENCE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { GitHubModelsClient, getGitHubModelsClient } from './github-models'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 ORCHESTRATOR
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export { NexusAIOrchestrator, getNexusOrchestrator } from './orchestrator'

export type { OrchestratorConfig, OrchestratorState } from './orchestrator'
