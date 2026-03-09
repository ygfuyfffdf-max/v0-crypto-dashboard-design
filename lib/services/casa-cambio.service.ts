/**
 * Servicio de Casa de Cambio
 * Provee datos de tipo de cambio e indicadores técnicos
 * Actualmente con datos mock — conectar a API real cuando esté disponible
 */

interface ExchangeRate {
  rate: number
  timestamp: string
  source: string
}

interface HistoricalRate {
  date: string
  value: number
}

interface TechnicalIndicators {
  rsi: number
  macd: {
    value: number
    signal: number
    histogram: number
  }
  bollingerBands: {
    upper: number
    middle: number
    lower: number
  }
}

interface SpreadResult {
  buy: number
  sell: number
  spread: number
}

interface VolatilityAlert {
  type: "high_volatility" | "trend_change" | "overbought" | "oversold"
  message: string
  severity: "low" | "medium" | "high"
}

class CasaCambioService {
  async getCurrentRate(): Promise<ExchangeRate> {
    return {
      rate: 18.50,
      timestamp: new Date().toISOString(),
      source: "mock",
    }
  }

  async getHistoricalRates(days: number): Promise<HistoricalRate[]> {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - 1 - i) * 86400000).toISOString().split("T")[0],
      value: 18.50 + (Math.random() - 0.5) * 0.4,
    }))
  }

  calculateOptimalSpread(historical: HistoricalRate[]): SpreadResult {
    const avg = historical.reduce((sum, h) => sum + h.value, 0) / (historical.length || 1)
    return {
      buy: avg - 0.15,
      sell: avg + 0.15,
      spread: 0.30,
    }
  }

  calculateTechnicalIndicators(historical: HistoricalRate[]): TechnicalIndicators {
    const lastValue = historical[historical.length - 1]?.value ?? 18.50
    return {
      rsi: 55,
      macd: {
        value: 0.02,
        signal: 0.015,
        histogram: 0.005,
      },
      bollingerBands: {
        upper: lastValue + 0.30,
        middle: lastValue,
        lower: lastValue - 0.30,
      },
    }
  }

  detectVolatilityAlerts(
    indicators: TechnicalIndicators,
    currentRate: number
  ): VolatilityAlert[] {
    const alerts: VolatilityAlert[] = []

    if (indicators.rsi > 70) {
      alerts.push({
        type: "overbought",
        message: "RSI indica sobrecompra",
        severity: "medium",
      })
    } else if (indicators.rsi < 30) {
      alerts.push({
        type: "oversold",
        message: "RSI indica sobreventa",
        severity: "medium",
      })
    }

    if (currentRate > indicators.bollingerBands.upper) {
      alerts.push({
        type: "high_volatility",
        message: "Precio por encima de Banda de Bollinger superior",
        severity: "high",
      })
    }

    return alerts
  }
}

export const casaCambioService = new CasaCambioService()
