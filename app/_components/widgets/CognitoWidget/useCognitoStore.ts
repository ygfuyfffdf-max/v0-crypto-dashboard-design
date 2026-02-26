/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠 COGNITO HOOK — Estado Global del Widget IA con Zustand
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
    AudioState,
    CognitoContext,
    CognitoMessage,
    CognitoMetrics,
    CognitoMode,
    CognitoPreferences,
    CognitoState,
    ProactiveSuggestion,
} from './types'

interface CognitoStore {
  // Estado principal
  state: CognitoState
  mode: CognitoMode
  isOpen: boolean
  isMinimized: boolean

  // Contexto de sesión
  context: CognitoContext

  // Métricas
  metrics: CognitoMetrics

  // Audio
  audio: AudioState

  // Acciones de estado
  setState: (state: CognitoState) => void
  setMode: (mode: CognitoMode) => void
  toggleOpen: () => void
  setOpen: (open: boolean) => void
  toggleMinimize: () => void

  // Acciones de mensajes
  addMessage: (message: Omit<CognitoMessage, 'id' | 'timestamp'>) => void
  clearHistory: () => void
  updateLastMessage: (updates: Partial<CognitoMessage>) => void

  // Acciones de sugerencias proactivas
  addProactiveSuggestion: (suggestion: Omit<ProactiveSuggestion, 'id' | 'timestamp'>) => void
  dismissSuggestion: (id: string) => void
  clearSuggestions: () => void

  // Acciones de preferencias
  updatePreferences: (prefs: Partial<CognitoPreferences>) => void

  // Acciones de audio
  setAudioLevel: (level: number) => void
  setAudioFrequencies: (frequencies: number[]) => void
  toggleMute: () => void

  // Acciones de métricas
  incrementQueries: () => void
  updateMetrics: (metrics: Partial<CognitoMetrics>) => void

  // Reset
  reset: () => void
}

const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

const initialPreferences: CognitoPreferences = {
  theme: 'auto',
  avatarStyle: 'particle',
  voiceEnabled: true,
  soundEffects: true,
  proactiveMode: true,
  language: 'es-MX',
  shortcuts: {},
}

const initialContext: CognitoContext = {
  sessionId: generateId(),
  history: [],
  preferences: initialPreferences,
  lastActivity: new Date(),
  proactiveSuggestions: [],
}

const initialMetrics: CognitoMetrics = {
  queriesTotal: 0,
  queriesToday: 0,
  accuracyRate: 95.5,
  averageResponseTime: 1.2,
  insightsGenerated: 0,
  actionsExecuted: 0,
}

const initialAudio: AudioState = {
  isPlaying: false,
  isMuted: false,
  volume: 0.8,
  level: 0,
  frequencies: [],
}

export const useCognitoStore = create<CognitoStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      state: 'idle',
      mode: 'chat',
      isOpen: false,
      isMinimized: false,
      context: initialContext,
      metrics: initialMetrics,
      audio: initialAudio,

      // Acciones de estado
      setState: (state) => set({ state }),

      setMode: (mode) => set({ mode }),

      toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),

      setOpen: (open) => set({ isOpen: open }),

      toggleMinimize: () => set((s) => ({ isMinimized: !s.isMinimized })),

      // Acciones de mensajes
      addMessage: (message) =>
        set((s) => ({
          context: {
            ...s.context,
            history: [
              ...s.context.history,
              {
                ...message,
                id: generateId(),
                timestamp: new Date(),
              } as CognitoMessage,
            ],
            lastActivity: new Date(),
          },
        })),

      clearHistory: () =>
        set((s) => ({
          context: {
            ...s.context,
            history: [],
            sessionId: generateId(),
          },
        })),

      updateLastMessage: (updates) =>
        set((s) => {
          const history = [...s.context.history]
          const lastIndex = history.length - 1
          if (lastIndex >= 0) {
            history[lastIndex] = { ...history[lastIndex]!, ...updates }
          }
          return {
            context: { ...s.context, history },
          }
        }),

      // Acciones de sugerencias
      addProactiveSuggestion: (suggestion) =>
        set((s) => ({
          context: {
            ...s.context,
            proactiveSuggestions: [
              ...s.context.proactiveSuggestions,
              {
                ...suggestion,
                id: generateId(),
                timestamp: new Date(),
              } as ProactiveSuggestion,
            ],
          },
        })),

      dismissSuggestion: (id) =>
        set((s) => ({
          context: {
            ...s.context,
            proactiveSuggestions: s.context.proactiveSuggestions.filter((sug) => sug.id !== id),
          },
        })),

      clearSuggestions: () =>
        set((s) => ({
          context: {
            ...s.context,
            proactiveSuggestions: [],
          },
        })),

      // Acciones de preferencias
      updatePreferences: (prefs) =>
        set((s) => ({
          context: {
            ...s.context,
            preferences: { ...s.context.preferences, ...prefs },
          },
        })),

      // Acciones de audio
      setAudioLevel: (level) =>
        set((s) => ({
          audio: { ...s.audio, level },
        })),

      setAudioFrequencies: (frequencies) =>
        set((s) => ({
          audio: { ...s.audio, frequencies },
        })),

      toggleMute: () =>
        set((s) => ({
          audio: { ...s.audio, isMuted: !s.audio.isMuted },
        })),

      // Acciones de métricas
      incrementQueries: () =>
        set((s) => ({
          metrics: {
            ...s.metrics,
            queriesTotal: s.metrics.queriesTotal + 1,
            queriesToday: s.metrics.queriesToday + 1,
          },
        })),

      updateMetrics: (metrics) =>
        set((s) => ({
          metrics: { ...s.metrics, ...metrics },
        })),

      // Reset
      reset: () =>
        set({
          state: 'idle',
          mode: 'chat',
          isOpen: false,
          isMinimized: false,
          context: { ...initialContext, sessionId: generateId() },
          metrics: initialMetrics,
          audio: initialAudio,
        }),
    }),
    {
      name: 'cognito-storage',
      partialize: (state) => ({
        context: {
          preferences: state.context.preferences,
        },
        metrics: state.metrics,
      }),
    },
  ),
)

// Selector hooks para performance
export const useCognitoState = () => useCognitoStore((s) => s.state)
export const useCognitoMode = () => useCognitoStore((s) => s.mode)
export const useCognitoMessages = () => useCognitoStore((s) => s.context.history)
export const useCognitoMetrics = () => useCognitoStore((s) => s.metrics)
export const useCognitoAudio = () => useCognitoStore((s) => s.audio)
export const useCognitoPreferences = () => useCognitoStore((s) => s.context.preferences)
export const useCognitoSuggestions = () => useCognitoStore((s) => s.context.proactiveSuggestions)
