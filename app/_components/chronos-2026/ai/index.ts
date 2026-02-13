/**
 * 🤖 CHRONOS AI COMPONENTS - EXPORTACIONES
 * ═══════════════════════════════════════════════════════════════════════════
 * Componentes de IA premium para CHRONOS 2026
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════
// 🌌 AURA SUPREME WIDGET — Widget de IA Ultra Premium
// ═══════════════════════════════════════════════════════════════════════════
export {
  AuraSupremeWidget,
  type AuraIntent,
  type AuraMessage,
  type AuraStatus,
  type FormField,
  type PendingAction,
} from "./AuraSupremeWidget"

// ═══════════════════════════════════════════════════════════════════════════
// 🎙️ ELEVENLABS VOICE SYSTEM — Síntesis y Reconocimiento de Voz Premium
// ═══════════════════════════════════════════════════════════════════════════
export {
  DEFAULT_VOICE,
  ELEVENLABS_VOICES,
  ElevenLabsService,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  useElevenLabsVoice,
  useSpeechRecognition,
  useVoiceAssistant,
  type ElevenLabsConfig,
  type SpeechState,
  type VoiceConfig,
} from "./ElevenLabsVoiceSystem"

// ═══════════════════════════════════════════════════════════════════════════
// 🧠 AI FORM AUTOMATION — Sistema de Automatización de Formularios
// ═══════════════════════════════════════════════════════════════════════════
export {
  FORM_CONFIGS,
  NLUProcessor,
  useFormAutomation,
  type Ambiguity,
  type DataContext,
  type EntityType,
  type ExtractedEntity,
  type FormAutomationConfig,
  type InferenceRule,
  type IntentResult,
} from "./AIFormAutomation"

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTES EXISTENTES
// ═══════════════════════════════════════════════════════════════════════════

// 🔮 The Oracle Within - Widget de IA premium con chat
export { TheOracleWithin } from "./TheOracleWithin"

// ⭕ Zero AI Widget - Asistente estilo Alexa
export { ZeroAIWidget } from "./ZeroAIWidget"

// 🌌 Quantum 3D AI Widget - Widget con partículas 3D
export { Quantum3DAIWidget } from "./Quantum3DAIWidget"

// 🎨 Spline AI Widget - Widget con integración Spline
export { SplineAIWidget } from "./SplineAIWidget"

// 🎵 Audio Reactive - Visualizador de audio
export { AudioReactiveOrb, FrequencyBars, useAudioReactive } from "./AudioReactive"

// 📊 Audio Visualizer - Visualizador de ondas
export { AudioVisualizer } from "./AudioVisualizer"

// ✨ WebGL Orb - Orb interactivo WebGL
export { WebGLOrb } from "./WebGLOrb"

// 🌈 Holographic Effects - Efectos holográficos
export {
  ChromaticAberration,
  CyberGrid,
  HologramOverlay,
  MatrixRain,
  NeonGlow,
  SpotlightEffect,
} from "./HolographicEffects"

// 🎬 Cinematic Animations - Animaciones cinematográficas
export * from "./CinematicAnimations"

// 👆 Gesture Controls - Controles gestuales
export { useDeviceOrientation, useGesture, useMouseParallax } from "./GestureControls"

// 🎨 Advanced Color System - Sistema de colores avanzado
export * from "./AdvancedColorSystem"

// ✨ Quantum Particles - Sistema de partículas cuánticas
export { QuantumParticles } from "./QuantumParticles"

// 🎯 Micro Interactions - Micro interacciones
export {
  PremiumButton,
  PremiumCard,
  PremiumProgress,
  PremiumSpinner,
  PremiumToggle,
  PremiumTooltip,
} from "./MicroInteractions"

// 🚀 Supreme AI Unified Widget - Widget Unificado Supremo
export { SupremeAIUnifiedWidget } from "./SupremeAIUnifiedWidget"

// 🔮 Global AI Orb - Asistente flotante global estilo Siri
export { GlobalAIOrb } from "./GlobalAIOrb"
