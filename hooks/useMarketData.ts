"use client"

import { useState, useCallback } from "react"
import type {
  MarketPrices,
  ArbitrageOpportunity,
  StrategyMode,
  MarketLiveFeed,
} from "@/lib/profit-engine/types/profit-engine.types"

interface UseMarketDataResult {
  prices: MarketPrices | null
  arbitrage: ArbitrageOpportunity | null
  strategyMode: StrategyMode
  strategyReason: string
  loading: boolean
  error: Error | null
  refreshData: () => void
  historicalFeeds: MarketLiveFeed[]
}

/**
 * Hook para datos de mercado USD/MXN/USDT
 * Actualmente retorna datos mock — conectar a API real cuando esté disponible
 */
export function useMarketData(): UseMarketDataResult {
  const [loading] = useState(false)
  const [error] = useState<Error | null>(null)

  const refreshData = useCallback(() => {
    // TODO: integrar con API de mercado real
  }, [])

  const prices: MarketPrices = {
    banxico: 18.50,
    streetAverage: 18.35,
    binanceUsdt: 18.62,
    lastUpdated: new Date().toISOString(),
  }

  const arbitrage: ArbitrageOpportunity = {
    isProfitable: true,
    bestChannel: "crypto",
    physicalPremium: -0.15,
    cryptoPremium: 0.12,
    opportunity_level: "medium",
    recommendation: "Canal crypto ofrece mejor precio actual",
  }

  const historicalFeeds: MarketLiveFeed[] = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
    banxico: 18.50 + (Math.random() - 0.5) * 0.4,
    street: 18.35 + (Math.random() - 0.5) * 0.5,
    binance: 18.62 + (Math.random() - 0.5) * 0.3,
  }))

  return {
    prices,
    arbitrage,
    strategyMode: "HIGH_VELOCITY_SALES",
    strategyReason: "Spread crypto favorable > 0.10 MXN",
    loading,
    error,
    refreshData,
    historicalFeeds,
  }
}
