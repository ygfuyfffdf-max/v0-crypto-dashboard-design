/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 useQuantumSupreme — HOOK REACT PARA QUANTUM SUPREME ENGINE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Hook principal que expone todas las capacidades del Quantum Supreme Engine:
 *
 * 🎯 Zero UI Multimodal
 * - Comandos de voz con NLP
 * - Bio-feedback validation
 * - Gestos 3D (próximamente)
 *
 * 🤖 Automatización Inteligente
 * - Auto-fill predictivo
 * - Filtrado semántico
 * - ML predictions
 *
 * 📦 Trazabilidad
 * - Lotes y genealogía
 * - Métricas evolucionadas
 *
 * 📤 Exportación AI
 * - PDF con narración
 * - Excel con fórmulas
 * - 3D Spline
 */

'use client'

import type { BioMetrics, MoodState, NexBotEmotion } from '@/app/lib/ai/nexus/types'
import {
  QuantumSupremeEngine,
  getQuantumSupremeEngine,
  type AIExport,
  type AutoEvolvedMetric,
  type BioValidation,
  type FormAutomation,
  type LoteTraceability,
  type MLPrediction,
  type QueryFilter,
  type Report3D,
  type Report3DData,
  type RiskAssessment,
  type SemanticQuery,
  type VoiceCommand,
} from '@/app/lib/quantum-supreme'
import { logger } from '@/app/lib/utils/logger'
import { useCallback, useEffect, useRef, useState } from 'react'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export interface QuantumSupremeHookState {
  isInitialized: boolean
  isListening: boolean
  bioMetrics: BioMetrics | null
  currentMood: MoodState
  currentEmotion: NexBotEmotion
  lastCommand: VoiceCommand | null
  predictions: MLPrediction[]
  evolvedMetrics: AutoEvolvedMetric[]
  isProcessing: boolean
}

export interface UseQuantumSupremeReturn {
  // Estado
  state: QuantumSupremeHookState

  // Voice Commands
  startListening: () => void
  stopListening: () => void
  processCommand: (command: string) => Promise<VoiceCommand>

  // Bio-feedback
  validateWithBio: (operation: string) => BioValidation

  // Filtrado semántico
  parseSemanticQuery: (query: string) => SemanticQuery

  // Form automation
  predictFormFields: (
    formType: FormAutomation['formType'],
    context?: Record<string, unknown>
  ) => Promise<FormAutomation>

  // Exportación
  generateExport: (
    entity: string,
    format: AIExport['format'],
    filters?: QueryFilter[]
  ) => Promise<AIExport>

  // ML Predictions
  predict: (
    type: MLPrediction['type'],
    horizon: number,
    context?: Record<string, unknown>
  ) => Promise<MLPrediction>
  assessRisk: (
    entityType: RiskAssessment['entityType'],
    entityId: string
  ) => Promise<RiskAssessment>

  // Lotes
  registerLote: (ordenCompraId: string, data: Partial<LoteTraceability>) => LoteTraceability
  getLote: (loteId: string) => LoteTraceability | undefined
  getAllLotes: () => LoteTraceability[]

  // Métricas evolucionadas
  evolveMetric: (baseMetrics: string[], suggestion?: string) => AutoEvolvedMetric
  getEvolvedMetrics: () => AutoEvolvedMetric[]

  // Reportes 3D
  generate3DReport: (type: Report3D['type'], data: Report3DData) => Report3D

  // Engine access
  engine: QuantumSupremeEngine | null
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export function useQuantumSupreme(): UseQuantumSupremeReturn {
  const engineRef = useRef<QuantumSupremeEngine | null>(null)

  const [state, setState] = useState<QuantumSupremeHookState>({
    isInitialized: false,
    isListening: false,
    bioMetrics: null,
    currentMood: 'neutral',
    currentEmotion: 'idle',
    lastCommand: null,
    predictions: [],
    evolvedMetrics: [],
    isProcessing: false,
  })

  // ─────────────────────────────────────────────────────────────────────────────
  // INICIALIZACIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const initEngine = async () => {
      try {
        const engine = getQuantumSupremeEngine({
          onVoiceCommand: (command) => {
            setState((prev) => ({
              ...prev,
              lastCommand: command,
            }))
            logger.info('[useQuantumSupreme] Voice command received', {
              context: 'QuantumSupreme',
              data: { intent: command.intent },
            })
          },
          onBioUpdate: (metrics) => {
            setState((prev) => ({
              ...prev,
              bioMetrics: metrics,
              currentMood: metrics.mood,
            }))
          },
          onPrediction: (prediction) => {
            setState((prev) => ({
              ...prev,
              predictions: [...prev.predictions.slice(-9), prediction],
            }))
          },
          onMetricEvolved: (metric) => {
            setState((prev) => ({
              ...prev,
              evolvedMetrics: [...prev.evolvedMetrics, metric],
            }))
          },
        })

        engineRef.current = engine
        await engine.initialize()

        setState((prev) => ({
          ...prev,
          isInitialized: true,
          evolvedMetrics: engine.getEvolvedMetrics(),
        }))

        logger.info('[useQuantumSupreme] ✨ Engine initialized', {
          context: 'QuantumSupreme',
        })
      } catch (error) {
        logger.error('[useQuantumSupreme] Initialization failed', error as Error, {
          context: 'QuantumSupreme',
        })
      }
    }

    initEngine()

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy()
        engineRef.current = null
      }
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // VOICE COMMANDS
  // ─────────────────────────────────────────────────────────────────────────────

  const startListening = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startListening()
      setState((prev) => ({ ...prev, isListening: true }))
    }
  }, [])

  const stopListening = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.stopListening()
      setState((prev) => ({ ...prev, isListening: false }))
    }
  }, [])

  const processCommand = useCallback(async (command: string): Promise<VoiceCommand> => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized')
    }

    setState((prev) => ({ ...prev, isProcessing: true }))

    try {
      // Llamar al método interno de procesamiento
      const parsed = engineRef.current['parseVoiceCommand'](command)

      setState((prev) => ({
        ...prev,
        lastCommand: parsed,
        isProcessing: false,
      }))

      return parsed
    } catch (error) {
      setState((prev) => ({ ...prev, isProcessing: false }))
      throw error
    }
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // BIO-FEEDBACK
  // ─────────────────────────────────────────────────────────────────────────────

  const validateWithBio = useCallback((operation: string): BioValidation => {
    if (!engineRef.current) {
      return {
        heartRateNormal: true,
        stressLevel: 0,
        confirmed: true,
        method: 'auto',
      }
    }
    return engineRef.current.validateWithBio(operation)
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // FILTRADO SEMÁNTICO
  // ─────────────────────────────────────────────────────────────────────────────

  const parseSemanticQuery = useCallback((query: string): SemanticQuery => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized')
    }
    return engineRef.current.parseSemanticQuery(query)
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // FORM AUTOMATION
  // ─────────────────────────────────────────────────────────────────────────────

  const predictFormFields = useCallback(
    async (
      formType: FormAutomation['formType'],
      context?: Record<string, unknown>,
    ): Promise<FormAutomation> => {
      if (!engineRef.current) {
        throw new Error('Engine not initialized')
      }

      setState((prev) => ({ ...prev, isProcessing: true }))

      try {
        const result = await engineRef.current.predictFormFields(formType, context)
        setState((prev) => ({ ...prev, isProcessing: false }))
        return result
      } catch (error) {
        setState((prev) => ({ ...prev, isProcessing: false }))
        throw error
      }
    },
    [],
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // EXPORTACIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  const generateExport = useCallback(
    async (
      entity: string,
      format: AIExport['format'],
      filters?: QueryFilter[],
    ): Promise<AIExport> => {
      if (!engineRef.current) {
        throw new Error('Engine not initialized')
      }

      setState((prev) => ({ ...prev, isProcessing: true }))

      try {
        const result = await engineRef.current.generateExport(entity, format, filters)
        setState((prev) => ({ ...prev, isProcessing: false }))
        return result
      } catch (error) {
        setState((prev) => ({ ...prev, isProcessing: false }))
        throw error
      }
    },
    [],
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // ML PREDICTIONS
  // ─────────────────────────────────────────────────────────────────────────────

  const predict = useCallback(
    async (
      type: MLPrediction['type'],
      horizon: number,
      context?: Record<string, unknown>,
    ): Promise<MLPrediction> => {
      if (!engineRef.current) {
        throw new Error('Engine not initialized')
      }

      setState((prev) => ({ ...prev, isProcessing: true }))

      try {
        const result = await engineRef.current.predict(type, horizon, context)
        setState((prev) => ({ ...prev, isProcessing: false }))
        return result
      } catch (error) {
        setState((prev) => ({ ...prev, isProcessing: false }))
        throw error
      }
    },
    [],
  )

  const assessRisk = useCallback(
    async (entityType: RiskAssessment['entityType'], entityId: string): Promise<RiskAssessment> => {
      if (!engineRef.current) {
        throw new Error('Engine not initialized')
      }

      setState((prev) => ({ ...prev, isProcessing: true }))

      try {
        const result = await engineRef.current.assessRisk(entityType, entityId)
        setState((prev) => ({ ...prev, isProcessing: false }))
        return result
      } catch (error) {
        setState((prev) => ({ ...prev, isProcessing: false }))
        throw error
      }
    },
    [],
  )

  // ─────────────────────────────────────────────────────────────────────────────
  // LOTES
  // ─────────────────────────────────────────────────────────────────────────────

  const registerLote = useCallback(
    (ordenCompraId: string, data: Partial<LoteTraceability>): LoteTraceability => {
      if (!engineRef.current) {
        throw new Error('Engine not initialized')
      }
      return engineRef.current.registerLote(ordenCompraId, data)
    },
    [],
  )

  const getLote = useCallback((loteId: string): LoteTraceability | undefined => {
    if (!engineRef.current) return undefined
    return engineRef.current.getLoteTracking().get(loteId)
  }, [])

  const getAllLotes = useCallback((): LoteTraceability[] => {
    if (!engineRef.current) return []
    return Array.from(engineRef.current.getLoteTracking().values())
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // MÉTRICAS EVOLUCIONADAS
  // ─────────────────────────────────────────────────────────────────────────────

  const evolveMetric = useCallback(
    (baseMetrics: string[], suggestion?: string): AutoEvolvedMetric => {
      if (!engineRef.current) {
        throw new Error('Engine not initialized')
      }
      return engineRef.current.evolveMetric(baseMetrics, suggestion)
    },
    [],
  )

  const getEvolvedMetrics = useCallback((): AutoEvolvedMetric[] => {
    if (!engineRef.current) return []
    return engineRef.current.getEvolvedMetrics()
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // REPORTES 3D
  // ─────────────────────────────────────────────────────────────────────────────

  const generate3DReport = useCallback((type: Report3D['type'], data: Report3DData): Report3D => {
    if (!engineRef.current) {
      throw new Error('Engine not initialized')
    }
    return engineRef.current.generate3DReport(type, data)
  }, [])

  // ─────────────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────────────

  return {
    state,
    startListening,
    stopListening,
    processCommand,
    validateWithBio,
    parseSemanticQuery,
    predictFormFields,
    generateExport,
    predict,
    assessRisk,
    registerLote,
    getLote,
    getAllLotes,
    evolveMetric,
    getEvolvedMetrics,
    generate3DReport,
    engine: engineRef.current,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// HOOKS ESPECIALIZADOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Hook especializado solo para comandos de voz
 */
export function useQuantumVoice() {
  const { state, startListening, stopListening, processCommand, validateWithBio } =
    useQuantumSupreme()

  return {
    isListening: state.isListening,
    lastCommand: state.lastCommand,
    bioMetrics: state.bioMetrics,
    isProcessing: state.isProcessing,
    startListening,
    stopListening,
    processCommand,
    validateWithBio,
  }
}

/**
 * Hook especializado solo para predicciones ML
 */
export function useQuantumML() {
  const { state, predict, assessRisk } = useQuantumSupreme()

  return {
    predictions: state.predictions,
    isProcessing: state.isProcessing,
    predict,
    assessRisk,
  }
}

/**
 * Hook especializado para filtrado semántico
 */
export function useQuantumSearch() {
  const { parseSemanticQuery, state } = useQuantumSupreme()

  return {
    parseQuery: parseSemanticQuery,
    isInitialized: state.isInitialized,
  }
}

/**
 * Hook especializado para automatización de formularios
 */
export function useQuantumForms() {
  const { predictFormFields, validateWithBio, state } = useQuantumSupreme()

  return {
    predictFields: predictFormFields,
    validateWithBio,
    isProcessing: state.isProcessing,
    bioMetrics: state.bioMetrics,
  }
}

/**
 * Hook especializado para trazabilidad de lotes
 */
export function useQuantumLotes() {
  const { registerLote, getLote, getAllLotes, state } = useQuantumSupreme()

  return {
    registerLote,
    getLote,
    getAllLotes,
    isInitialized: state.isInitialized,
  }
}

/**
 * Hook especializado para exportaciones AI
 */
export function useQuantumExport() {
  const { generateExport, state } = useQuantumSupreme()

  return {
    generateExport,
    isProcessing: state.isProcessing,
  }
}

/**
 * Hook especializado para reportes 3D
 */
export function useQuantum3D() {
  const { generate3DReport, state } = useQuantumSupreme()

  return {
    generate3DReport,
    isInitialized: state.isInitialized,
  }
}
