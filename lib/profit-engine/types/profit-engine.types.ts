/**
 * Tipos del motor de rentabilidad (Profit Engine)
 */

export type StrategyMode = 'LONG_USD_DURATION' | 'HIGH_VELOCITY_SALES' | 'NEUTRAL'

export interface MarketLiveFeed {
  date: string
  banxico: number
  street: number
  binance: number
  volume?: number
}

export interface TreasuryPosition {
  usdCash: number
  usdtBalance: number
  mxnCash: number
  totalValueUsd: number
  totalValueMxn: number
  lastUpdated: string
}

export interface ArbitrageOpportunity {
  isProfitable: boolean
  bestChannel: 'physical' | 'crypto' | 'hold'
  physicalPremium: number
  cryptoPremium: number
  opportunity_level: 'low' | 'medium' | 'high'
  recommendation: string
}

export interface TreasuryAlert {
  id: string
  type: 'critical' | 'warning' | 'info'
  title: string
  message: string
  acknowledged: boolean
  timestamp: string
}

export interface TreasuryHealthMetrics {
  health_score: number
  overall_status: 'healthy' | 'warning' | 'critical'
  total_value_usd: number
  cash_ratio: number
  diversification_score: number
}

export interface MarketPrices {
  banxico: number
  streetAverage: number
  binanceUsdt: number
  lastUpdated: string
}
