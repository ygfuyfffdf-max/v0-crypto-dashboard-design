// @ts-nocheck
/**
 * 🔮 PREDICTIVE ANALYTICS SERVICE - OMEGA LEVEL
 *
 * Sistema de análisis predictivo y forecasting usando IA + ML.
 *
 * Capacidades:
 * - Predicción de ventas futuras
 * - Detección de anomalías en transacciones
 * - Forecast de capital bancario
 * - Análisis de tendencias
 * - Recomendaciones automáticas
 * - Alertas inteligentes
 *
 * Usa o3 model de OpenAI para razonamiento profundo (GRATIS vía GitHub).
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { almacen, ventas } from '@/database/schema'
import { desc, gte, sql, sum } from 'drizzle-orm'
import { githubModels } from './GitHubModelsEnterpriseService'

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

export interface PredictionRequest {
  metric: 'ventas' | 'capital' | 'inventario' | 'clientes'
  timeRange: 'week' | 'month' | 'quarter' | 'year'
  includeConfidenceInterval?: boolean
  factors?: string[] // Factores externos a considerar
}

export interface PredictionResult {
  metric: string
  predictions: Array<{
    date: Date
    predicted: number
    confidence: {
      low: number
      high: number
    }
    factors: string[]
  }>
  accuracy: number // 0-100%
  trend: 'increasing' | 'decreasing' | 'stable'
  insights: string[]
  recommendations: string[]
  methodology: string
}

export interface AnomalyDetectionResult {
  anomalies: Array<{
    id: string
    type: 'venta' | 'movimiento' | 'inventario'
    date: Date
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    expectedValue: number
    actualValue: number
    deviation: number
    possibleCauses: string[]
    recommendedActions: string[]
  }>
  summary: {
    total: number
    bySeverity: Record<string, number>
    byType: Record<string, number>
  }
}

export interface TrendAnalysis {
  metric: string
  period: string
  trend: 'increasing' | 'decreasing' | 'stable'
  changeRate: number // Porcentaje
  seasonality: {
    detected: boolean
    pattern?: string
    peaks?: string[]
    valleys?: string[]
  }
  forecast: {
    nextPeriod: number
    confidence: number
  }
  insights: string[]
}

// ═══════════════════════════════════════════════════════════════════════
// SERVICIO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

export class PredictiveAnalyticsService {
  /**
   * Genera predicciones usando IA + datos históricos
   */
  async predict(request: PredictionRequest): Promise<PredictionResult> {
    logger.info('🔮 Generando predicciones', {
      context: 'PredictiveAnalyticsService',
      metric: request.metric,
      timeRange: request.timeRange,
    })

    // 1. Recolectar datos históricos
    const historicalData = await this.getHistoricalData(request.metric, request.timeRange)

    // 2. Analizar con IA (o3 model para razonamiento profundo)
    const aiAnalysis = await githubModels.predictive(`
Analiza estos datos históricos y genera predicciones precisas:

Métrica: ${request.metric}
Rango de tiempo: ${request.timeRange}

Datos históricos (últimos períodos):
${JSON.stringify(historicalData, null, 2)}

Factores a considerar: ${request.factors?.join(', ') || 'estándar (estacionalidad, tendencias)'}

Responde con JSON en este formato exacto:
{
  "predictions": [
    {
      "period": "nombre del período (ej: 2025-12-24)",
      "value": número predicho,
      "confidence": { "low": mínimo, "high": máximo },
      "factors": ["factor1", "factor2"]
    }
  ],
  "trend": "increasing" | "decreasing" | "stable",
  "accuracy": porcentaje de 0-100,
  "insights": ["insight1", "insight2"],
  "recommendations": ["recomendación1", "recomendación2"],
  "methodology": "descripción del método usado"
}

IMPORTANTE: Sé preciso, conservador y explica tu razonamiento.
`)

    let parsed: {
      predictions: Array<{
        period: string
        value: number
        confidence: { low: number; high: number }
        factors: string[]
      }>
      trend: 'increasing' | 'decreasing' | 'stable'
      accuracy: number
      insights: string[]
      recommendations: string[]
      methodology: string
    }

    try {
      parsed = JSON.parse(aiAnalysis.content)
    } catch {
      // Fallback si el JSON no es válido
      parsed = this.generateFallbackPrediction(historicalData, request)
    }

    // 3. Convertir a resultado final
    const result: PredictionResult = {
      metric: request.metric,
      predictions: parsed.predictions.map((p) => ({
        date: new Date(p.period),
        predicted: p.value,
        confidence: p.confidence,
        factors: p.factors,
      })),
      accuracy: parsed.accuracy,
      trend: parsed.trend,
      insights: parsed.insights,
      recommendations: parsed.recommendations,
      methodology: parsed.methodology,
    }

    logger.info('✅ Predicciones generadas', {
      context: 'PredictiveAnalyticsService',
      predictionsCount: result.predictions.length,
      trend: result.trend,
      accuracy: result.accuracy,
    })

    return result
  }

  /**
   * Detecta anomalías en datos
   */
  async detectAnomalies(): Promise<AnomalyDetectionResult> {
    logger.info('🔍 Detectando anomalías', {
      context: 'PredictiveAnalyticsService',
    })

    const anomalies: AnomalyDetectionResult['anomalies'] = []

    // 1. Anomalías en ventas (ventas extremadamente altas o bajas)
    const ventasRecientes = await db
      .select({
        id: ventas.id,
        fecha: ventas.fecha,
        precioTotal: ventas.precioTotalVenta,
        cantidad: ventas.cantidad,
      })
      .from(ventas)
      .orderBy(desc(ventas.fecha))
      .limit(100)

    const avgVenta =
      ventasRecientes.reduce((acc, v) => acc + Number(v.precioTotal), 0) / ventasRecientes.length
    const stdDev = this.calculateStdDev(ventasRecientes.map((v) => Number(v.precioTotal)))

    ventasRecientes.forEach((venta) => {
      const deviation = Math.abs(Number(venta.precioTotal) - avgVenta) / stdDev

      if (deviation > 3) {
        // Más de 3 desviaciones estándar
        anomalies.push({
          id: venta.id,
          type: 'venta',
          date: new Date(venta.fecha),
          severity: deviation > 5 ? 'critical' : deviation > 4 ? 'high' : 'medium',
          description: `Venta anormal: $${venta.precioTotal} (promedio: $${avgVenta.toFixed(2)})`,
          expectedValue: avgVenta,
          actualValue: Number(venta.precioTotal),
          deviation: deviation,
          possibleCauses: ['Venta de alto valor legítima', 'Error de captura', 'Fraude potencial'],
          recommendedActions: [
            'Verificar con cliente',
            'Revisar autorización',
            'Confirmar pago recibido',
          ],
        })
      }
    })

    // 2. Anomalías en inventario (niveles críticos)
    const inventarioCritico = await db
      .select()
      .from(almacen)
      .where(sql`${almacen.cantidad} < 10 OR ${almacen.cantidad} < 0`)

    inventarioCritico.forEach((item) => {
      if (Number(item.cantidad) < 0) {
        anomalies.push({
          id: item.id,
          type: 'inventario',
          date: new Date(),
          severity: 'critical',
          description: `Inventario negativo: ${item.cantidad} unidades`,
          expectedValue: 0,
          actualValue: Number(item.cantidad),
          deviation: Math.abs(Number(item.cantidad)),
          possibleCauses: [
            'Ventas sin actualizar inventario',
            'Error en sistema',
            'Robo o pérdida no registrada',
          ],
          recommendedActions: [
            'Auditar movimientos recientes',
            'Ajustar inventario manualmente',
            'Investigar causa raíz',
          ],
        })
      }
    })

    // 3. Summary
    const summary = {
      total: anomalies.length,
      bySeverity: {
        critical: anomalies.filter((a) => a.severity === 'critical').length,
        high: anomalies.filter((a) => a.severity === 'high').length,
        medium: anomalies.filter((a) => a.severity === 'medium').length,
        low: anomalies.filter((a) => a.severity === 'low').length,
      },
      byType: {
        venta: anomalies.filter((a) => a.type === 'venta').length,
        movimiento: anomalies.filter((a) => a.type === 'movimiento').length,
        inventario: anomalies.filter((a) => a.type === 'inventario').length,
      },
    }

    logger.info('✅ Detección de anomalías completada', {
      context: 'PredictiveAnalyticsService',
      total: summary.total,
      critical: summary.bySeverity.critical,
    })

    return { anomalies, summary }
  }

  /**
   * Analiza tendencias en métricas clave
   */
  async analyzeTrends(metric: 'ventas' | 'capital' | 'clientes'): Promise<TrendAnalysis> {
    logger.info('📈 Analizando tendencias', {
      context: 'PredictiveAnalyticsService',
      metric,
    })

    // Obtener datos históricos
    const historicalData = await this.getHistoricalData(metric, 'month')

    // Calcular tendencia (regresión lineal simple)
    const trend = this.calculateTrend(historicalData)
    const changeRate = this.calculateChangeRate(historicalData)

    // Detectar estacionalidad con IA
    const seasonalityAnalysis = await githubModels.analytical(`
Analiza si existe un patrón estacional en estos datos:

${JSON.stringify(historicalData, null, 2)}

Responde con JSON:
{
  "hasSeasonality": true/false,
  "pattern": "descripción del patrón si existe",
  "peaks": ["períodos de picos"],
  "valleys": ["períodos de valles"]
}
`)

    let seasonality: TrendAnalysis['seasonality']
    try {
      const parsed = JSON.parse(seasonalityAnalysis.content) as {
        hasSeasonality: boolean
        pattern?: string
        peaks?: string[]
        valleys?: string[]
      }
      seasonality = {
        detected: parsed.hasSeasonality,
        pattern: parsed.pattern,
        peaks: parsed.peaks,
        valleys: parsed.valleys,
      }
    } catch {
      seasonality = { detected: false }
    }

    // Forecast simple
    const lastValue = historicalData[historicalData.length - 1]?.value || 0
    const forecastValue = lastValue * (1 + changeRate / 100)

    const result: TrendAnalysis = {
      metric,
      period: 'último mes',
      trend,
      changeRate,
      seasonality,
      forecast: {
        nextPeriod: forecastValue,
        confidence: 75,
      },
      insights: [
        `La métrica muestra una tendencia ${trend === 'increasing' ? 'al alza' : trend === 'decreasing' ? 'a la baja' : 'estable'}`,
        `Cambio del ${changeRate.toFixed(2)}% respecto al período anterior`,
        seasonality.detected
          ? `Patrón estacional detectado: ${seasonality.pattern}`
          : 'No se detectó estacionalidad clara',
      ],
    }

    return result
  }

  // ═══════════════════════════════════════════════════════════════════════
  // MÉTODOS AUXILIARES
  // ═══════════════════════════════════════════════════════════════════════

  private async getHistoricalData(
    metric: PredictionRequest['metric'],
    timeRange: PredictionRequest['timeRange'],
  ): Promise<Array<{ period: string; value: number }>> {
    const daysMap = { week: 7, month: 30, quarter: 90, year: 365 }
    const days = daysMap[timeRange]

    if (metric === 'ventas') {
      const results = await db
        .select({
          fecha: ventas.fecha,
          total: sum(ventas.precioTotalVenta),
        })
        .from(ventas)
        .where(gte(ventas.fecha, sql`datetime('now', '-${days} days')`))
        .groupBy(ventas.fecha)
        .orderBy(ventas.fecha)

      return results.map((r) => {
        const defaultDate = new Date().toISOString().split('T')[0] || ''
        let period: string = defaultDate
        if (r.fecha) {
          const dateStr = typeof r.fecha === 'string' ? r.fecha : r.fecha.toISOString()
          period = dateStr.split('T')[0] || defaultDate
        }
        return {
          period,
          value: Number(r.total) || 0,
        }
      })
    }

    // Otros metrics - implementar según necesidad
    return []
  }

  private calculateStdDev(values: number[]): number {
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map((v) => Math.pow(v - avg, 2))
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
    return Math.sqrt(variance)
  }

  private calculateTrend(data: Array<{ value: number }>): 'increasing' | 'decreasing' | 'stable' {
    if (data.length < 2) return 'stable'

    const first = data[0]?.value || 0
    const last = data[data.length - 1]?.value || 0
    const change = ((last - first) / first) * 100

    if (change > 5) return 'increasing'
    if (change < -5) return 'decreasing'
    return 'stable'
  }

  private calculateChangeRate(data: Array<{ value: number }>): number {
    if (data.length < 2) return 0

    const first = data[0]?.value || 0
    const last = data[data.length - 1]?.value || 0

    return first === 0 ? 0 : ((last - first) / first) * 100
  }

  private generateFallbackPrediction(
    data: Array<{ value: number }>,
    request: PredictionRequest,
  ): {
    predictions: Array<{
      period: string
      value: number
      confidence: { low: number; high: number }
      factors: string[]
    }>
    trend: 'increasing' | 'decreasing' | 'stable'
    accuracy: number
    insights: string[]
    recommendations: string[]
    methodology: string
  } {
    const avgValue = data.reduce((acc, d) => acc + d.value, 0) / data.length
    const trend = this.calculateTrend(data)

    return {
      predictions: [
        {
          period: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          value: avgValue,
          confidence: { low: avgValue * 0.8, high: avgValue * 1.2 },
          factors: ['promedio histórico'],
        },
      ],
      trend,
      accuracy: 60,
      insights: ['Análisis básico - datos insuficientes para predicción avanzada'],
      recommendations: ['Recolectar más datos históricos'],
      methodology: 'Promedio simple',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTAR SINGLETON
// ═══════════════════════════════════════════════════════════════════════

export const predictiveAnalytics = new PredictiveAnalyticsService()
