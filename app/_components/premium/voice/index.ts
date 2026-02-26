// Premium Voice Components - Zero Force Integration
import ZeroForceVoiceWidget from './ZeroForceVoiceWidget'
export { ZeroForceVoiceWidget }
export type { ZeroForceVoiceWidgetProps } from './ZeroForceVoiceWidget'

// Voice Services
export {
  ElevenLabsVoiceService,
  createVoiceService,
  type VoiceConfig,
  type EmotionSettings
} from '../../../_lib/services/voice/elevenlabs-service'

export {
  DeepgramSTTService,
  createSTTService,
  type STTConfig,
  type TranscriptionResult,
  type STTEvents
} from '../../../_lib/services/voice/deepgram-service'

// Voice Utilities
export const voicePresets = {
  chronos: {
    voiceId: 'spPXlKT5a4JMfbhPRAzA',
    emotionSettings: {
      calm: { stability: 0.8, style: 0.3, similarityBoost: 0.9 },
      professional: { stability: 0.7, style: 0.5, similarityBoost: 0.9 },
      excited: { stability: 0.6, style: 0.8, similarityBoost: 0.95 }
    },
    greetings: {
      morning: "¡Buenos días! Bienvenido a Chronos Infinity. ¿Listo para conquistar el día?",
      afternoon: "¡Buenas tardes! Chronos Infinity a tu servicio. ¿Qué aventura emprendemos?",
      evening: "¡Buenas noches! Chronos Infinity te acompaña en esta velada. ¿Qué deseas lograr?"
    }
  },
  
  business: {
    voiceId: 'pNInz6obpgDQGcFmaJgB', // Professional voice
    emotionSettings: {
      calm: { stability: 0.85, style: 0.2, similarityBoost: 0.9 },
      professional: { stability: 0.75, style: 0.4, similarityBoost: 0.95 },
      excited: { stability: 0.65, style: 0.6, similarityBoost: 0.9 }
    }
  },
  
  casual: {
    voiceId: 'ErXwobaYiN1PtoR5ZpC6', // Casual voice
    emotionSettings: {
      calm: { stability: 0.9, style: 0.1, similarityBoost: 0.85 },
      professional: { stability: 0.8, style: 0.3, similarityBoost: 0.9 },
      excited: { stability: 0.7, style: 0.7, similarityBoost: 0.95 }
    }
  }
}

export const voiceCommands = {
  chronos: {
    'hola': { response: '¡Hola! Soy Zero Force, tu asistente de voz premium.', emotion: 'excited' as const },
    'buenos días': { response: '¡Buenos días! ¿Listo para conquistar el día?', emotion: 'excited' as const },
    'buenas tardes': { response: '¡Buenas tardes! ¿Qué aventura emprendemos?', emotion: 'professional' as const },
    'buenas noches': { response: '¡Buenas noches! ¿Qué deseas lograr?', emotion: 'calm' as const },
    'venta': { response: '¡Excelente! Vamos a crear una venta. ¿Qué producto deseas vender?', emotion: 'excited' as const },
    'reporte': { response: '¡Increíble! Vamos a generar un reporte detallado.', emotion: 'excited' as const },
    'análisis': { response: 'Perfecto. Vamos a generar un análisis completo.', emotion: 'professional' as const },
    'ayuda': { response: '¡Claro que sí! Estoy aquí para ayudarte.', emotion: 'excited' as const },
    'tranquilo': { response: 'Tranquilo, estoy aquí para ayudarte.', emotion: 'calm' as const },
    'excelente': { response: '¡Excelente elección! Procedamos.', emotion: 'excited' as const },
    'perfecto': { response: '¡Perfecto! Continuemos.', emotion: 'excited' as const }
  }
}

export const getGreetingByTime = (): { greeting: string; emotion: 'calm' | 'professional' | 'excited' } => {
  const hour = new Date().getHours()
  
  if (hour >= 6 && hour < 12) {
    return { greeting: voicePresets.chronos.greetings.morning, emotion: 'excited' }
  } else if (hour >= 12 && hour < 20) {
    return { greeting: voicePresets.chronos.greetings.afternoon, emotion: 'professional' }
  } else {
    return { greeting: voicePresets.chronos.greetings.evening, emotion: 'calm' }
  }
}

export const detectEmotionFromText = (text: string): 'calm' | 'professional' | 'excited' => {
  const lowerText = text.toLowerCase()
  
  if (/(excelente|perfecto|increíble|fantástico|genial)/.test(lowerText)) {
    return 'excited'
  } else if (/(tranquilo|calma|relajado|paciente)/.test(lowerText)) {
    return 'calm'
  } else {
    return 'professional'
  }
}

export const voiceUtils = {
  getGreetingByTime,
  detectEmotionFromText,
  
  formatTranscriptionConfidence: (confidence: number): string => {
    return `${Math.round(confidence * 100)}%`
  },
  
  calculateLatency: (startTime: number, endTime: number): number => {
    return endTime - startTime
  },
  
  validateVoiceConfig: (config: any): boolean => {
    return !!(config?.apiKey && config?.voiceId)
  },
  
  createVoiceSessionId: (): string => {
    return `voice-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}

// Export CSS styles
import './ZeroForceVoiceWidget.css'

// Default export for convenience
export default {
  ZeroForceVoiceWidget,
  voicePresets,
  voiceCommands,
  voiceUtils
}