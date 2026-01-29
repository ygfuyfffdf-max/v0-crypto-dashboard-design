'use client'

// ═══════════════════════════════════════════════════════════════════════════════════════
// 🔗 CHRONOS INFINITY 2030 — SPLINE REACTIVE VARIABLES HOOK
// ═══════════════════════════════════════════════════════════════════════════════════════
// Sistema de variables reactivas para sincronizar datos financieros con Spline
// Actualización en tiempo real | Animaciones suaves | TypeScript strict
// Paleta: #000000 / #8B00FF / #FFD700 / #FF1493 (CYAN PROHIBIDO)
// ═══════════════════════════════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback, useMemo } from 'react'
import type { Application } from '@splinetool/runtime'
import { useChronosStore } from '@/app/lib/store'
import type { BancoId } from '@/app/types'

// ─────────────────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────────────────

export interface SplineVariableConfig {
  name: string
  type: 'number' | 'string' | 'boolean' | 'color'
  source: 'computed' | 'store' | 'custom'
  getValue: () => number | string | boolean
  min?: number
  max?: number
  smoothing?: number // 0-1, default 0.1
}

export interface SplineEventConfig {
  name: string
  trigger: 'onCapitalChange' | 'onNewVenta' | 'onAlert' | 'custom'
  objectName?: string
  payload?: Record<string, unknown>
}

export interface UseSplineReactiveOptions {
  updateInterval?: number // ms, default 100
  enableSmoothing?: boolean
  customVariables?: SplineVariableConfig[]
  events?: SplineEventConfig[]
  onVariableUpdate?: (name: string, value: unknown) => void
  onEventEmit?: (eventName: string) => void
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────────────────

const DEFAULT_UPDATE_INTERVAL = 100
const DEFAULT_SMOOTHING = 0.1

const CHRONOS_COLORS = {
  positive: '#FFD700', // Oro
  neutral: '#8B00FF', // Violeta
  negative: '#FF1493', // Rosa
  critical: '#EF4444', // Rojo
} as const

// ─────────────────────────────────────────────────────────────────────────────────────────
// MAIN HOOK
// ─────────────────────────────────────────────────────────────────────────────────────────

export function useSplineReactiveVariables(
  app: Application | null,
  options: UseSplineReactiveOptions = {},
) {
  const {
    updateInterval = DEFAULT_UPDATE_INTERVAL,
    enableSmoothing = true,
    customVariables = [],
    events = [],
    onVariableUpdate,
    onEventEmit,
  } = options

  // Store data
  const {
    bancos,
    ventas,
    ordenesCompra,
    clientes,
    distribuidores,
    totalCapital,
    totalDeudaClientes,
    stockTotal,
  } = useChronosStore()

  // Refs for smoothing
  const smoothedValues = useRef<Record<string, number>>({})
  const lastCapital = useRef(totalCapital)
  const lastVentasCount = useRef(ventas.length)

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ─────────────────────────────────────────────────────────────────────────

  // Sentiment score (-1 a 1)
  const sentimentScore = useMemo(() => {
    const capitalRatio = totalCapital / Math.max(totalDeudaClientes + 1, 1)
    return Math.tanh((capitalRatio - 1) * 0.5)
  }, [totalCapital, totalDeudaClientes])

  // Capital flow (ventas de hoy normalizadas)
  const capitalFlow = useMemo(() => {
    const hoy = new Date()
    const ventasHoy = ventas.filter((v) => {
      const fecha =
        typeof v.fecha === 'string'
          ? new Date(v.fecha)
          : v.fecha && 'toDate' in v.fecha
            ? v.fecha.toDate()
            : new Date(v.fecha as Date)
      return fecha.toDateString() === hoy.toDateString()
    })
    const totalVentasHoy = ventasHoy.reduce((sum, v) => sum + (v.montoPagado ?? 0), 0)
    return Math.min(totalVentasHoy / 10000, 2)
  }, [ventas])

  // Neural activity (basado en actividad del sistema)
  const neuralActivity = useMemo(() => {
    const hace24h = new Date()
    hace24h.setHours(hace24h.getHours() - 24)
    const ventasRecientes = ventas.filter((v) => {
      const fecha =
        typeof v.fecha === 'string'
          ? new Date(v.fecha)
          : v.fecha && 'toDate' in v.fecha
            ? v.fecha.toDate()
            : new Date(v.fecha as Date)
      return fecha > hace24h
    })
    const actividadBase = 0.3
    const actividadVentas = Math.min(ventasRecientes.length / 10, 0.5)
    return actividadBase + actividadVentas
  }, [ventas])

  // Health score (0-1)
  const healthScore = useMemo(() => {
    let score = 0.5

    // Capital positivo
    if (totalCapital > 0) score += 0.2
    if (totalCapital > 100000) score += 0.1

    // Deuda controlada
    if (totalDeudaClientes < totalCapital * 0.3) score += 0.1

    // Stock saludable
    if (stockTotal > 10) score += 0.1

    return Math.min(score, 1)
  }, [totalCapital, totalDeudaClientes, stockTotal])

  // Mood color
  const moodColor = useMemo(() => {
    if (healthScore > 0.7) return CHRONOS_COLORS.positive
    if (healthScore > 0.5) return CHRONOS_COLORS.neutral
    if (healthScore > 0.3) return CHRONOS_COLORS.negative
    return CHRONOS_COLORS.critical
  }, [healthScore])

  // Bank capitals normalized
  const bankCapitalsNormalized = useMemo(() => {
    const result: Record<string, number> = {}
    const maxCapital = Math.max(...Object.values(bancos).map((b) => b.capitalActual), 1)

    Object.entries(bancos).forEach(([id, banco]) => {
      result[`banco_${id}`] = banco.capitalActual / maxCapital
    })

    return result
  }, [bancos])

  // ─────────────────────────────────────────────────────────────────────────
  // DEFAULT VARIABLES
  // ─────────────────────────────────────────────────────────────────────────

  const defaultVariables: SplineVariableConfig[] = useMemo(
    () => [
      // Core metrics
      {
        name: 'capitalTotal',
        type: 'number',
        source: 'store',
        getValue: () => totalCapital,
        min: 0,
        max: 1000000,
        smoothing: 0.05,
      },
      {
        name: 'capitalNormalized',
        type: 'number',
        source: 'computed',
        getValue: () => Math.min(totalCapital / 100000, 1),
        min: 0,
        max: 1,
      },
      {
        name: 'sentimentScore',
        type: 'number',
        source: 'computed',
        getValue: () => sentimentScore,
        min: -1,
        max: 1,
      },
      {
        name: 'capitalFlow',
        type: 'number',
        source: 'computed',
        getValue: () => capitalFlow,
        min: 0,
        max: 2,
      },
      {
        name: 'neuralActivity',
        type: 'number',
        source: 'computed',
        getValue: () => neuralActivity,
        min: 0,
        max: 1,
      },
      {
        name: 'healthScore',
        type: 'number',
        source: 'computed',
        getValue: () => healthScore,
        min: 0,
        max: 1,
      },
      // Colors
      {
        name: 'moodColor',
        type: 'color',
        source: 'computed',
        getValue: () => moodColor,
      },
      // Counts
      {
        name: 'ventasCount',
        type: 'number',
        source: 'store',
        getValue: () => ventas.length,
      },
      {
        name: 'clientesCount',
        type: 'number',
        source: 'store',
        getValue: () => clientes.length,
      },
      {
        name: 'stockTotal',
        type: 'number',
        source: 'store',
        getValue: () => stockTotal,
      },
      // Deuda
      {
        name: 'deudaClientes',
        type: 'number',
        source: 'store',
        getValue: () => totalDeudaClientes,
      },
      {
        name: 'deudaNormalized',
        type: 'number',
        source: 'computed',
        getValue: () => Math.min(totalDeudaClientes / 50000, 1),
        min: 0,
        max: 1,
      },
      // Bank-specific
      ...Object.keys(bancos).map((id) => ({
        name: `banco_${id}_capital`,
        type: 'number' as const,
        source: 'computed' as const,
        getValue: () => bankCapitalsNormalized[`banco_${id}`] || 0,
        min: 0,
        max: 1,
      })),
    ],
    [
      totalCapital,
      sentimentScore,
      capitalFlow,
      neuralActivity,
      healthScore,
      moodColor,
      ventas.length,
      clientes.length,
      stockTotal,
      totalDeudaClientes,
      bankCapitalsNormalized,
      bancos,
    ],
  )

  // Merge with custom variables
  const allVariables = useMemo(
    () => [...defaultVariables, ...customVariables],
    [defaultVariables, customVariables],
  )

  // ─────────────────────────────────────────────────────────────────────────
  // SMOOTHING HELPER
  // ─────────────────────────────────────────────────────────────────────────

  const smoothValue = useCallback(
    (name: string, targetValue: number, smoothing: number = DEFAULT_SMOOTHING): number => {
      if (!enableSmoothing) return targetValue

      const current = smoothedValues.current[name] ?? targetValue
      const smoothed = current + (targetValue - current) * smoothing
      smoothedValues.current[name] = smoothed
      return smoothed
    },
    [enableSmoothing],
  )

  // ─────────────────────────────────────────────────────────────────────────
  // UPDATE LOOP
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!app) return

    const updateVariables = () => {
      allVariables.forEach((variable) => {
        try {
          let value = variable.getValue()

          // Apply smoothing for numbers
          if (variable.type === 'number' && typeof value === 'number') {
            value = smoothValue(variable.name, value, variable.smoothing)
          }

          // Set variable in Spline
          app.setVariable(variable.name, value)
          onVariableUpdate?.(variable.name, value)
        } catch {
          // Variable doesn't exist in scene - silent fail
        }
      })
    }

    // Initial update
    updateVariables()

    // Interval update
    const intervalId = setInterval(updateVariables, updateInterval)

    return () => clearInterval(intervalId)
  }, [app, allVariables, updateInterval, smoothValue, onVariableUpdate])

  // ─────────────────────────────────────────────────────────────────────────
  // EVENT DETECTION
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!app) return

    // Detect capital change
    if (totalCapital !== lastCapital.current) {
      const capitalEvent = events.find((e) => e.trigger === 'onCapitalChange')
      if (capitalEvent) {
        try {
          app.emitEvent(capitalEvent.name as never, capitalEvent.objectName || '')
          onEventEmit?.(capitalEvent.name)
        } catch {
          // Event not configured
        }
      }
      lastCapital.current = totalCapital
    }

    // Detect new venta
    if (ventas.length > lastVentasCount.current) {
      const ventaEvent = events.find((e) => e.trigger === 'onNewVenta')
      if (ventaEvent) {
        try {
          app.emitEvent(ventaEvent.name as never, ventaEvent.objectName || '')
          onEventEmit?.(ventaEvent.name)
        } catch {
          // Event not configured
        }
      }
      lastVentasCount.current = ventas.length
    }
  }, [app, totalCapital, ventas.length, events, onEventEmit])

  // ─────────────────────────────────────────────────────────────────────────
  // MANUAL CONTROLS
  // ─────────────────────────────────────────────────────────────────────────

  const setVariable = useCallback(
    (name: string, value: unknown) => {
      if (!app) return false
      try {
        app.setVariable(name, value as string | number | boolean)
        return true
      } catch {
        return false
      }
    },
    [app],
  )

  const emitEvent = useCallback(
    (eventName: string, objectName?: string) => {
      if (!app) return false
      try {
        app.emitEvent(eventName as never, objectName || '')
        return true
      } catch {
        return false
      }
    },
    [app],
  )

  const setState = useCallback(
    (objectName: string, _stateName: string) => {
      if (!app) return false
      try {
        const obj = app.findObjectByName(objectName)
        if (obj) {
          // Trigger state change via event
          app.emitEvent('setState' as never, objectName)
          return true
        }
        return false
      } catch {
        return false
      }
    },
    [app],
  )

  // ─────────────────────────────────────────────────────────────────────────
  // RETURN
  // ─────────────────────────────────────────────────────────────────────────

  return {
    // Computed values
    sentimentScore,
    capitalFlow,
    neuralActivity,
    healthScore,
    moodColor,
    bankCapitalsNormalized,

    // Manual controls
    setVariable,
    emitEvent,
    setState,

    // Current variable configs
    variables: allVariables,
  }
}

// ─────────────────────────────────────────────────────────────────────────────────────────
// PRESET CONFIGURATIONS
// ─────────────────────────────────────────────────────────────────────────────────────────

export const SPLINE_PRESETS = {
  // Preset para orbe de IA
  aiOrb: {
    updateInterval: 50,
    enableSmoothing: true,
    events: [
      { name: 'pulse', trigger: 'onNewVenta' as const },
      { name: 'glow', trigger: 'onCapitalChange' as const },
    ],
  },

  // Preset para dashboard
  dashboard: {
    updateInterval: 100,
    enableSmoothing: true,
    events: [{ name: 'celebration', trigger: 'onNewVenta' as const }],
  },

  // Preset para bancos
  bancos: {
    updateInterval: 150,
    enableSmoothing: true,
    events: [{ name: 'transfer', trigger: 'onCapitalChange' as const }],
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────────────────

export default useSplineReactiveVariables
