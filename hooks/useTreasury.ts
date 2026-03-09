"use client"

import { useState, useCallback } from "react"
import type {
  TreasuryPosition,
  TreasuryAlert,
  TreasuryHealthMetrics,
} from "@/lib/profit-engine/types/profit-engine.types"

interface UseTreasuryResult {
  position: TreasuryPosition
  alerts: TreasuryAlert[]
  healthMetrics: TreasuryHealthMetrics
  loading: boolean
  acknowledgeAlert: (id: string) => void
}

/**
 * Hook para posición de tesorería y alertas
 * Actualmente retorna datos mock — conectar a store real cuando esté disponible
 */
export function useTreasury(_banxicoRate?: number): UseTreasuryResult {
  const [loading] = useState(false)
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState<Set<string>>(new Set())

  const acknowledgeAlert = useCallback((id: string) => {
    setAcknowledgedAlerts((prev) => new Set(prev).add(id))
  }, [])

  const position: TreasuryPosition = {
    usdCash: 25000,
    usdtBalance: 15000,
    mxnCash: 180000,
    totalValueUsd: 49729,
    totalValueMxn: 920000,
    lastUpdated: new Date().toISOString(),
  }

  const alerts: TreasuryAlert[] = [
    {
      id: "alert-1",
      type: "info",
      title: "Tipo de cambio estable",
      message: "El USD/MXN se mantiene en rango de 18.30-18.70",
      acknowledged: acknowledgedAlerts.has("alert-1"),
      timestamp: new Date().toISOString(),
    },
  ]

  const healthMetrics: TreasuryHealthMetrics = {
    health_score: 0.82,
    overall_status: "healthy",
    total_value_usd: 49729,
    cash_ratio: 0.60,
    diversification_score: 0.75,
  }

  return {
    position,
    alerts,
    healthMetrics,
    loading,
    acknowledgeAlert,
  }
}
