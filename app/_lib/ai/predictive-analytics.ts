// @ts-nocheck
// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠 CHRONOS AI PREDICTIVE ANALYTICS — SUPREME ELEVATION 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema avanzado de análisis predictivo y forecasting para CHRONOS FlowDistributor.
 * Incluye predicciones de ventas, detección de anomalías, recomendaciones inteligentes
 * y análisis de tendencias con machine learning.
 *
 * @version 4.0.0 - SUPREME ELEVATION
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { movimientos, ordenesCompra, ventas } from '@/database/schema'
import { desc, gte } from 'drizzle-orm'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS Y INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface SalesPrediction {
  next30Days: number
  confidence: number
  trend: 'upward' | 'downward' | 'stable'
  factors: string[]
  recommendations: string[]
  seasonalFactors: SeasonalFactor[]
  riskFactors: RiskFactor[]
}

export interface AnomalyDetection {
  anomalies: Anomaly[]
  totalAnomalies: number
  severityBreakdown: {
    low: number
    medium: number
    high: number
    critical: number
  }
  patterns: Pattern[]
}

export interface InventoryRecommendation {
  products: ProductRecommendation[]
  totalInvestment: number
  priorityScore: number
  expectedROI: number
  riskLevel: 'low' | 'medium' | 'high'
}

export interface TrendAnalysis {
  salesTrend: TrendData
  customerTrend: TrendData
  inventoryTrend: TrendData
  financialTrend: TrendData
  predictions: TrendPrediction[]
}

interface SeasonalFactor {
  period: string
  impact: number
  description: string
}

interface RiskFactor {
  type: string
  probability: number
  impact: string
  mitigation: string
}

interface Anomaly {
  id: string
  type: 'sales' | 'inventory' | 'financial' | 'customer'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  value: number
  expectedValue: number
  deviation: number
  timestamp: Date
  suggestedAction: string
}

interface Pattern {
  type: string
  description: string
  confidence: number
  frequency: number
  impact: string
}

interface ProductRecommendation {
  productId: string
  productName: string
  currentStock: number
  recommendedQuantity: number
  priority: 'low' | 'medium' | 'high'
  reason: string
  estimatedCost: number
  expectedDemand: number
  supplierLeadTime: number
}

interface TrendData {
  currentValue: number
  previousValue: number
  change: number
  changePercentage: number
  trend: 'increasing' | 'decreasing' | 'stable'
  period: string
}

interface TrendPrediction {
  period: string
  predictedValue: number
  confidence: number
  factors: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// HERRAMIENTAS DE ANÁLISIS MATEMÁTICO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

class MathUtils {
  static calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2))
    const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length
    return Math.sqrt(avgSquaredDiff)
  }

  static calculateZScore(value: number, mean: number, stdDev: number): number {
    return (value - mean) / stdDev
  }

  static detectOutliers(values: number[]): number[] {
    const mean = values.reduce((a, b) => a + b, 0) / values.length
    const stdDev = this.calculateStandardDeviation(values)
    const threshold = 2.5
    
    return values.filter(value => Math.abs(this.calculateZScore(value, mean, stdDev)) > threshold)
  }

  static linearRegression(x: number[], y: number[]): { slope: number; intercept: number; r2: number } {
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i]!, 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumYY = y.reduce((sum, yi) => sum + yi * yi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    const r = (n * sumXY - sumX * sumY) / Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY))
    const r2 = r * r

    return { slope, intercept, r2 }
  }

  static calculateMovingAverage(values: number[], window: number): number[] {
    const result: number[] = []
    for (let i = window - 1; i < values.length; i++) {
      const sum = values.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0)
      result.push(sum / window)
    }
    return result
  }

  static seasonalDecomposition(values: number[], period: number) {
    const trend = this.calculateMovingAverage(values, period)
    const detrended = values.slice(period - 1).map((value, i) => value - (trend[i] || 0))
    
    const seasonal: number[] = []
    for (let i = 0; i < period; i++) {
      const seasonValues = detrended.filter((_, index) => index % period === i)
      seasonal.push(seasonValues.reduce((a, b) => a + b, 0) / seasonValues.length)
    }

    const residual = detrended.map((value, i) => value - (seasonal[i % period] || 0))

    return { trend, seasonal, residual }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SISTEMA DE PREDICCIÓN DE VENTAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class SalesPredictor {
  private static readonly CONFIDENCE_THRESHOLD = 0.7
  private static readonly MIN_DATA_POINTS = 30

  static async predictSales(days: number = 30): Promise<SalesPrediction> {
    try {
      logger.info('[SalesPredictor] Iniciando predicción de ventas', { days })

      // Obtener datos históricos
      const historicalData = await this.getHistoricalSalesData(days * 2)
      
      if (historicalData.length < this.MIN_DATA_POINTS) {
        return this.generateFallbackPrediction(days)
      }

      // Análisis de tendencias
      const trendAnalysis = this.analyzeTrends(historicalData)
      
      // Descomposición estacional
      const seasonalAnalysis = MathUtils.seasonalDecomposition(
        historicalData.map(d => d.amount),
        7 // Semanal
      )

      // Predicción basada en múltiples modelos
      const predictions = this.generatePredictions(historicalData, days, seasonalAnalysis)
      
      // Calcular confianza
      const confidence = this.calculateConfidence(historicalData, predictions)

      // Generar factores y recomendaciones
      const factors = this.generatePredictionFactors(historicalData, trendAnalysis)
      const recommendations = this.generateRecommendations(predictions, confidence, factors)

      const result: SalesPrediction = {
        next30Days: Math.round(predictions.weightedAverage),
        confidence,
        trend: trendAnalysis.direction as 'stable' | 'upward' | 'downward',
        factors,
        recommendations,
        seasonalFactors: this.analyzeSeasonalFactors(historicalData),
        riskFactors: this.identifyRiskFactors(historicalData, predictions)
      }

      logger.info('[SalesPredictor] Predicción completada', { 
        prediction: result.next30Days, 
        confidence: result.confidence 
      })

      return result

    } catch (error) {
      logger.error('[SalesPredictor] Error en predicción de ventas', error as Error)
      return this.generateFallbackPrediction(days)
    }
  }

  private static async getHistoricalSalesData(days: number) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const salesData = await db.query.ventas.findMany({
      where: gte(ventas.fecha, startDate),
      orderBy: [desc(ventas.fecha)],
      limit: 1000,
    })

    return salesData.map(sale => ({
      date: sale.fecha,
      amount: sale.precioTotalVenta || 0,
      quantity: sale.cantidad || 0,
      customerId: sale.clienteId,
      productId: sale.productoId
    }))
  }

  private static analyzeTrends(data: any[]) {
    const amounts = data.map(d => d.amount)
    const dates = data.map((_, i) => i)
    
    const regression = MathUtils.linearRegression(dates, amounts)
    const movingAverage = MathUtils.calculateMovingAverage(amounts, 7)
    
    const recentAverage = movingAverage.slice(-7).reduce((a, b) => a + b, 0) / 7
    const previousAverage = movingAverage.slice(-14, -7).reduce((a, b) => a + b, 0) / 7
    
    const change = recentAverage - previousAverage
    const changePercentage = (change / previousAverage) * 100

    return {
      slope: regression.slope,
      r2: regression.r2,
      direction: regression.slope > 0.1 ? 'upward' : regression.slope < -0.1 ? 'downward' : 'stable',
      changePercentage
    }
  }

  private static generatePredictions(historicalData: any[], days: number, seasonalAnalysis: any) {
    const amounts = historicalData.map(d => d.amount)
    const recentAverage = amounts.slice(-30).reduce((a, b) => a + b, 0) / 30
    const seasonalAdjustment = seasonalAnalysis.seasonal[0] || 0
    
    // Modelo de regresión lineal
    const dates = historicalData.map((_, i) => i)
    const regression = MathUtils.linearRegression(dates, amounts)
    const linearPrediction = regression.intercept + regression.slope * (dates.length + days)

    // Modelo de promedio móvil
    const movingAverage = MathUtils.calculateMovingAverage(amounts, 7)
    const maPrediction = movingAverage[movingAverage.length - 1] || recentAverage

    // Modelo estacional
    const seasonalPrediction = recentAverage + seasonalAdjustment

    // Predicción ponderada
    const weightedAverage = (linearPrediction * 0.3 + maPrediction * 0.4 + seasonalPrediction * 0.3)

    return {
      linear: linearPrediction,
      movingAverage: maPrediction,
      seasonal: seasonalPrediction,
      weightedAverage
    }
  }

  private static calculateConfidence(historicalData: any[], predictions: any): number {
    const amounts = historicalData.map(d => d.amount)
    const stdDev = MathUtils.calculateStandardDeviation(amounts)
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
    
    // Calcular coeficiente de variación
    const cv = stdDev / mean
    
    // Calcular R² de la regresión
    const dates = historicalData.map((_, i) => i)
    const regression = MathUtils.linearRegression(dates, amounts)
    
    // Factores de confianza
    const dataQuality = Math.min(historicalData.length / 100, 1) // Más datos = mejor confianza
    const trendConsistency = Math.abs(regression.r2) // R² como medida de consistencia
    const volatility = Math.max(0, 1 - cv) // Menos volatilidad = mejor confianza
    
    const confidence = (dataQuality * 0.3 + trendConsistency * 0.4 + volatility * 0.3)
    
    return Math.min(Math.max(confidence, 0.1), 0.95)
  }

  private static generatePredictionFactors(historicalData: any[], trendAnalysis: any): string[] {
    const factors: string[] = []
    
    if (trendAnalysis.slope > 0.1) {
      factors.push('Tendencia alcista sostenida en ventas')
    } else if (trendAnalysis.slope < -0.1) {
      factors.push('Tendencia bajista en ventas')
    } else {
      factors.push('Tendencia estable en ventas')
    }

    if (trendAnalysis.r2 > 0.7) {
      factors.push('Alta consistencia en patrones de venta')
    }

    if (Math.abs(trendAnalysis.changePercentage) > 20) {
      factors.push(`Cambio significativo del ${trendAnalysis.changePercentage.toFixed(1)}% detectado`)
    }

    // Análisis de días de la semana
    const dayOfWeekAnalysis = this.analyzeDayOfWeekPattern(historicalData)
    if (dayOfWeekAnalysis.bestDay) {
      factors.push(`Mayor actividad los ${dayOfWeekAnalysis.bestDay}`)
    }

    return factors
  }

  private static generateRecommendations(predictions: any, confidence: number, factors: string[]): string[] {
    const recommendations: string[] = []

    if (confidence > 0.8) {
      recommendations.push('La predicción tiene alta confianza - planificar con base en estos datos')
    } else if (confidence > 0.6) {
      recommendations.push('Predicción moderadamente confiable - considerar escenarios alternativos')
    } else {
      recommendations.push('Baja confianza en la predicción - monitorear de cerca y ajustar')
    }

    if (predictions.weightedAverage > predictions.linear) {
      recommendations.push('Considerar aumento en inventario para satisfacer demanda proyectada')
    }

    recommendations.push('Monitorear métricas diariamente para detectar desviaciones tempranas')
    recommendations.push('Preparar planes de contingencia para escenarios optimistas/pesimistas')

    return recommendations
  }

  private static analyzeSeasonalFactors(historicalData: any[]): SeasonalFactor[] {
    const factors: SeasonalFactor[] = []
    
    // Análisis simple por días de la semana
    const dayOfWeekTotals = Array(7).fill(0)
    const dayCounts = Array(7).fill(0)
    
    historicalData.forEach(sale => {
      const dayOfWeek = new Date(sale.date).getDay()
      dayOfWeekTotals[dayOfWeek] += sale.amount
      dayCounts[dayOfWeek]++
    })

    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    
    dayOfWeekTotals.forEach((total, index) => {
      if (dayCounts[index] > 0) {
        const average = total / dayCounts[index]
        factors.push({
          period: dayNames[index],
          impact: average,
          description: `Promedio de ventas los ${dayNames[index]}: $${average.toFixed(0)}`
        })
      }
    })

    return factors.sort((a, b) => b.impact - a.impact).slice(0, 3)
  }

  private static identifyRiskFactors(historicalData: any[], predictions: any): RiskFactor[] {
    const risks: RiskFactor[] = []
    
    const amounts = historicalData.map(d => d.amount)
    const stdDev = MathUtils.calculateStandardDeviation(amounts)
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
    
    // Riesgo de volatilidad
    const cv = stdDev / mean
    if (cv > 0.5) {
      risks.push({
        type: 'Alta volatilidad en ventas',
        probability: Math.min(cv, 0.9),
        impact: 'Predicciones menos confiables',
        mitigation: 'Implementar modelos de predicción más robustos'
      })
    }

    // Riesgo de datos insuficientes
    if (historicalData.length < 60) {
      risks.push({
        type: 'Datos históricos limitados',
        probability: 0.7,
        impact: 'Mayor incertidumbre en predicciones',
        mitigation: 'Recolectar más datos históricos antes de confiar plenamente'
      })
    }

    return risks
  }

  private static analyzeDayOfWeekPattern(historicalData: any[]) {
    const dayTotals = Array(7).fill(0)
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    
    historicalData.forEach(sale => {
      const dayOfWeek = new Date(sale.date).getDay()
      dayTotals[dayOfWeek] += sale.amount
    })

    const maxDay = dayTotals.indexOf(Math.max(...dayTotals))
    
    return {
      bestDay: dayNames[maxDay],
      dayTotals
    }
  }

  private static generateFallbackPrediction(days: number): SalesPrediction {
    return {
      next30Days: 50000, // Valor por defecto
      confidence: 0.3,
      trend: 'stable',
      factors: ['Datos insuficientes para predicción precisa'],
      recommendations: ['Recolectar más datos históricos'],
      seasonalFactors: [],
      riskFactors: [{
        type: 'Datos limitados',
        probability: 0.9,
        impact: 'Predicción basada en valores por defecto',
        mitigation: 'Implementar sistema de recolección de datos'
      }]
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SISTEMA DE DETECCIÓN DE ANOMALÍAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class AnomalyDetector {
  private static readonly SEVERITY_THRESHOLDS = {
    low: 2.0,
    medium: 2.5,
    high: 3.0,
    critical: 3.5
  }

  static async detectAnomalies(timeframe: number = 30): Promise<AnomalyDetection> {
    try {
      logger.info('[AnomalyDetector] Iniciando detección de anomalías', { timeframe })

      const [salesAnomalies, financialAnomalies, inventoryAnomalies] = await Promise.all([
        this.detectSalesAnomalies(timeframe),
        this.detectFinancialAnomalies(timeframe),
        this.detectInventoryAnomalies(timeframe)
      ])

      const allAnomalies = [...salesAnomalies, ...financialAnomalies, ...inventoryAnomalies]
      
      const severityBreakdown = {
        low: allAnomalies.filter(a => a.severity === 'low').length,
        medium: allAnomalies.filter(a => a.severity === 'medium').length,
        high: allAnomalies.filter(a => a.severity === 'high').length,
        critical: allAnomalies.filter(a => a.severity === 'critical').length
      }

      const patterns = this.identifyPatterns(allAnomalies)

      const result: AnomalyDetection = {
        anomalies: allAnomalies.sort((a, b) => {
          const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
          return severityOrder[b.severity] - severityOrder[a.severity]
        }),
        totalAnomalies: allAnomalies.length,
        severityBreakdown,
        patterns
      }

      logger.info('[AnomalyDetector] Detección completada', { 
        totalAnomalies: result.totalAnomalies,
        critical: result.severityBreakdown.critical 
      })

      return result

    } catch (error) {
      logger.error('[AnomalyDetector] Error en detección de anomalías', error as Error)
      return {
        anomalies: [],
        totalAnomalies: 0,
        severityBreakdown: { low: 0, medium: 0, high: 0, critical: 0 },
        patterns: []
      }
    }
  }

  private static async detectSalesAnomalies(timeframe: number): Promise<Anomaly[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeframe)

    const salesData = await db.query.ventas.findMany({
      where: gte(ventas.fecha, startDate),
      orderBy: [desc(ventas.fecha)],
      limit: 500,
    })

    const anomalies: Anomaly[] = []
    const dailySales = this.aggregateDailySales(salesData)
    
    // Detectar anomalías en ventas diarias
    const amounts = Object.values(dailySales)
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const stdDev = MathUtils.calculateStandardDeviation(amounts)

    Object.entries(dailySales).forEach(([date, amount]) => {
      const zScore = MathUtils.calculateZScore(amount, mean, stdDev)
      
      if (Math.abs(zScore) > this.SEVERITY_THRESHOLDS.low) {
        const severity = this.determineSeverity(Math.abs(zScore))
        
        anomalies.push({
          id: `sales-${date}`,
          type: 'sales',
          severity,
          description: `Venta inusual el ${new Date(date).toLocaleDateString('es-MX')}`,
          value: amount,
          expectedValue: mean,
          deviation: zScore,
          timestamp: new Date(date),
          suggestedAction: this.getSalesAnomalyAction(severity, zScore > 0)
        })
      }
    })

    return anomalies
  }

  private static async detectFinancialAnomalies(timeframe: number): Promise<Anomaly[]> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - timeframe)

    const [bancosData, movimientosData] = await Promise.all([
      db.query.bancos.findMany(),
      db.query.movimientos.findMany({
        where: gte(movimientos.fecha, startDate),
        orderBy: [desc(movimientos.fecha)],
        limit: 200,
      })
    ])

    const anomalies: Anomaly[] = []

    // Detectar anomalías en movimientos bancarios
    const dailyMovements = this.aggregateDailyMovements(movimientosData)
    const movementAmounts = Object.values(dailyMovements)
    
    if (movementAmounts.length > 0) {
      const mean = movementAmounts.reduce((a, b) => a + b, 0) / movementAmounts.length
      const stdDev = MathUtils.calculateStandardDeviation(movementAmounts)

      Object.entries(dailyMovements).forEach(([date, amount]) => {
        const zScore = MathUtils.calculateZScore(amount, mean, stdDev)
        
        if (Math.abs(zScore) > this.SEVERITY_THRESHOLDS.low) {
          const severity = this.determineSeverity(Math.abs(zScore))
          
          anomalies.push({
            id: `financial-${date}`,
            type: 'financial',
            severity,
            description: `Movimiento bancario inusual el ${new Date(date).toLocaleDateString('es-MX')}`,
            value: amount,
            expectedValue: mean,
            deviation: zScore,
            timestamp: new Date(date),
            suggestedAction: this.getFinancialAnomalyAction(severity)
          })
        }
      })
    }

    return anomalies
  }

  private static async detectInventoryAnomalies(timeframe: number): Promise<Anomaly[]> {
    const productosData = await db.query.productos.findMany()
    
    const anomalies: Anomaly[] = []

    productosData.forEach(producto => {
      const stock = producto.cantidad || 0
      const minStock = producto.minimo || 0
      
      // Detectar productos con stock crítico
      if (stock <= minStock * 0.5) {
        anomalies.push({
          id: `inventory-${producto.id}`,
          type: 'inventory',
          severity: stock === 0 ? 'critical' : 'high',
          description: `Stock crítico para ${producto.nombre}`,
          value: stock,
          expectedValue: minStock * 2,
          deviation: stock === 0 ? -10 : -5,
          timestamp: new Date(),
          suggestedAction: `Reabastecer urgentemente ${producto.nombre}`
        })
      }
    })

    return anomalies
  }

  private static aggregateDailySales(salesData: any[]): Record<string, number> {
    const dailySales: Record<string, number> = {}
    
    salesData.forEach(sale => {
      const date = sale.fecha.toISOString().split('T')[0]
      dailySales[date] = (dailySales[date] || 0) + (sale.precioTotalVenta || 0)
    })
    
    return dailySales
  }

  private static aggregateDailyMovements(movementsData: any[]): Record<string, number> {
    const dailyMovements: Record<string, number> = {}
    
    movementsData.forEach(movement => {
      const date = movement.fecha.toISOString().split('T')[0]
      const amount = movement.tipo === 'ingreso' ? movement.monto : -movement.monto
      dailyMovements[date] = (dailyMovements[date] || 0) + amount
    })
    
    return dailyMovements
  }

  private static determineSeverity(zScore: number): 'low' | 'medium' | 'high' | 'critical' {
    if (zScore >= this.SEVERITY_THRESHOLDS.critical) return 'critical'
    if (zScore >= this.SEVERITY_THRESHOLDS.high) return 'high'
    if (zScore >= this.SEVERITY_THRESHOLDS.medium) return 'medium'
    return 'low'
  }

  private static getSalesAnomalyAction(severity: string, isPositive: boolean): string {
    if (severity === 'critical') {
      return isPositive 
        ? 'Investigar causa de venta extraordinaria - verificar autenticidad'
        : 'Investigar caída severa - revisar factores externos'
    }
    
    if (severity === 'high') {
      return isPositive
        ? 'Analizar patrón de crecimiento - preparar inventario'
        : 'Identificar causas de bajas ventas - ajustar estrategia'
    }
    
    return 'Monitorear tendencia - tomar acción preventiva si continúa'
  }

  private static getFinancialAnomalyAction(severity: string): string {
    if (severity === 'critical') {
      return 'Verificar inmediatamente transacciones bancarias - posible fraude'
    }
    
    if (severity === 'high') {
      return 'Revisar movimientos financieros - asegurar autorización'
    }
    
    return 'Monitorear actividad financiera - documentar anomalía'
  }

  private static identifyPatterns(anomalies: Anomaly[]): Pattern[] {
    const patterns: Pattern[] = []
    
    if (anomalies.length === 0) return patterns

    // Patrón: Anomalías recurrentes por tipo
    const typeCounts = anomalies.reduce((acc, anomaly) => {
      acc[anomaly.type] = (acc[anomaly.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > 2) {
        patterns.push({
          type: 'recurrent_anomalies',
          description: `Múltiples anomalías de tipo ${type}`,
          confidence: Math.min(count * 0.2, 0.9),
          frequency: count,
          impact: 'Indica problema sistémico'
        })
      }
    })

    // Patrón: Concentración temporal
    const recentAnomalies = anomalies.filter(a => 
      new Date().getTime() - a.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000
    )

    if (recentAnomalies.length > anomalies.length * 0.6) {
      patterns.push({
        type: 'temporal_concentration',
        description: 'Mayoría de anomalías ocurrieron recientemente',
        confidence: 0.8,
        frequency: recentAnomalies.length,
        impact: 'Sugiere evento agudo'
      })
    }

    return patterns
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SISTEMA DE RECOMENDACIONES DE INVENTARIO
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class InventoryRecommender {
  static async generateRecommendations(): Promise<InventoryRecommendation> {
    try {
      logger.info('[InventoryRecommender] Generando recomendaciones de inventario')

      const [productosData, ventasData, ordenesData] = await Promise.all([
        db.query.productos.findMany(),
        db.query.ventas.findMany({
          orderBy: [desc(ventas.fecha)],
          limit: 200,
        }),
        db.query.ordenesCompra.findMany({
          orderBy: [desc(ordenesCompra.fecha)],
          limit: 50,
        })
      ])

      const recommendations = this.analyzeInventoryNeeds(productosData, ventasData, ordenesData)
      const totalInvestment = recommendations.reduce((sum, rec) => sum + rec.estimatedCost, 0)
      
      const priorityScore = this.calculatePriorityScore(recommendations)
      const expectedROI = this.calculateExpectedROI(recommendations)
      const riskLevel = this.assessRiskLevel(recommendations)

      const result: InventoryRecommendation = {
        products: recommendations,
        totalInvestment,
        priorityScore,
        expectedROI,
        riskLevel
      }

      logger.info('[InventoryRecommender] Recomendaciones generadas', { 
        totalProducts: recommendations.length,
        totalInvestment,
        priorityScore 
      })

      return result

    } catch (error) {
      logger.error('[InventoryRecommender] Error generando recomendaciones', error as Error)
      return {
        products: [],
        totalInvestment: 0,
        priorityScore: 0,
        expectedROI: 0,
        riskLevel: 'low'
      }
    }
  }

  private static analyzeInventoryNeeds(
    productos: any[], 
    ventas: any[], 
    ordenes: any[]
  ): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = []
    
    productos.forEach(producto => {
      const currentStock = producto.cantidad || 0
      const minStock = producto.minimo || 0
      const productSales = ventas.filter(v => v.productoId === producto.id)
      
      // Calcular demanda promedio
      const avgDailyDemand = this.calculateAverageDailyDemand(productSales, 30)
      const leadTime = 7 // Días de entrega por defecto
      
      // Punto de reorden
      const reorderPoint = avgDailyDemand * leadTime
      
      // Cantidad a reordenar
      const recommendedQuantity = Math.max(0, reorderPoint * 2 - currentStock)
      
      if (recommendedQuantity > 0) {
        const priority = this.determinePriority(currentStock, minStock, avgDailyDemand)
        const estimatedCost = recommendedQuantity * (producto.precioCompra || 0)
        
        recommendations.push({
          productId: producto.id,
          productName: producto.nombre,
          currentStock,
          recommendedQuantity,
          priority,
          reason: this.generateReason(currentStock, minStock, avgDailyDemand),
          estimatedCost,
          expectedDemand: avgDailyDemand * 30, // Demanda mensual esperada
          supplierLeadTime: leadTime
        })
      }
    })

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  private static calculateAverageDailyDemand(sales: any[], days: number): number {
    if (sales.length === 0) return 0
    
    const totalQuantity = sales.reduce((sum, sale) => sum + (sale.cantidad || 0), 0)
    return totalQuantity / days
  }

  private static determinePriority(currentStock: number, minStock: number, avgDailyDemand: number): 'low' | 'medium' | 'high' {
    const daysOfStock = currentStock / Math.max(avgDailyDemand, 1)
    
    if (daysOfStock <= 3 || currentStock <= minStock * 0.5) return 'high'
    if (daysOfStock <= 7 || currentStock <= minStock) return 'medium'
    return 'low'
  }

  private static generateReason(currentStock: number, minStock: number, avgDailyDemand: number): string {
    const daysOfStock = currentStock / Math.max(avgDailyDemand, 1)
    
    if (daysOfStock <= 3) return 'Stock crítico - reabastecimiento urgente'
    if (daysOfStock <= 7) return 'Niveles bajos - reabastecimiento recomendado'
    return 'Mantenimiento de inventario óptimo'
  }

  private static calculatePriorityScore(recommendations: ProductRecommendation[]): number {
    if (recommendations.length === 0) return 0
    
    const highPriorityCount = recommendations.filter(r => r.priority === 'high').length
    const totalInvestment = recommendations.reduce((sum, r) => sum + r.estimatedCost, 0)
    
    return Math.min((highPriorityCount * 30 + Math.min(totalInvestment / 10000, 40)), 100)
  }

  private static calculateExpectedROI(recommendations: ProductRecommendation[]): number {
    // ROI estimado simplificado (en producción usar modelos más sofisticados)
    return recommendations.length > 0 ? 15 + (recommendations.length * 2) : 0
  }

  private static assessRiskLevel(recommendations: ProductRecommendation[]): 'low' | 'medium' | 'high' {
    const highPriorityCount = recommendations.filter(r => r.priority === 'high').length
    const totalInvestment = recommendations.reduce((sum, r) => sum + r.estimatedCost, 0)
    
    if (highPriorityCount > 5 || totalInvestment > 50000) return 'high'
    if (highPriorityCount > 2 || totalInvestment > 20000) return 'medium'
    return 'low'
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SISTEMA DE ANÁLISIS DE TENDENCIAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class TrendAnalyzer {
  static async analyzeTrends(timeframe: number = 90): Promise<TrendAnalysis> {
    try {
      logger.info('[TrendAnalyzer] Iniciando análisis de tendencias', { timeframe })

      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - timeframe)

      const [salesTrend, customerTrend, inventoryTrend, financialTrend] = await Promise.all([
        this.analyzeSalesTrend(startDate, endDate),
        this.analyzeCustomerTrend(startDate, endDate),
        this.analyzeInventoryTrend(),
        this.analyzeFinancialTrend(startDate, endDate)
      ])

      const predictions = this.generateTrendPredictions({
        sales: salesTrend,
        customers: customerTrend,
        inventory: inventoryTrend,
        financial: financialTrend
      })

      const result: TrendAnalysis = {
        salesTrend,
        customerTrend,
        inventoryTrend,
        financialTrend,
        predictions
      }

      logger.info('[TrendAnalyzer] Análisis de tendencias completado')
      return result

    } catch (error) {
      logger.error('[TrendAnalyzer] Error en análisis de tendencias', error as Error)
      return this.getDefaultTrendAnalysis()
    }
  }

  private static async analyzeSalesTrend(startDate: Date, endDate: Date): Promise<TrendData> {
    const salesData = await db.query.ventas.findMany({
      where: gte(ventas.fecha, startDate),
      orderBy: [desc(ventas.fecha)],
    })

    const currentPeriodSales = salesData.filter(s => s.fecha >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    const previousPeriodSales = salesData.filter(s => 
      s.fecha >= new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) &&
      s.fecha < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )

    const currentValue = currentPeriodSales.reduce((sum, s) => sum + (s.precioTotalVenta || 0), 0)
    const previousValue = previousPeriodSales.reduce((sum, s) => sum + (s.precioTotalVenta || 0), 0)
    const change = currentValue - previousValue
    const changePercentage = previousValue > 0 ? (change / previousValue) * 100 : 0

    return {
      currentValue,
      previousValue,
      change,
      changePercentage,
      trend: changePercentage > 5 ? 'increasing' : changePercentage < -5 ? 'decreasing' : 'stable',
      period: '30 días'
    }
  }

  private static async analyzeCustomerTrend(startDate: Date, endDate: Date): Promise<TrendData> {
    const customersData = await db.query.clientes.findMany()
    
    const activeCustomers = customersData.filter(c => c.estado === 'activo').length
    const totalCustomers = customersData.length
    const previousActiveEstimate = Math.floor(activeCustomers * 0.9) // Estimación simplificada

    const change = activeCustomers - previousActiveEstimate
    const changePercentage = (change / Math.max(previousActiveEstimate, 1)) * 100

    return {
      currentValue: activeCustomers,
      previousValue: previousActiveEstimate,
      change,
      changePercentage,
      trend: changePercentage > 2 ? 'increasing' : changePercentage < -2 ? 'decreasing' : 'stable',
      period: 'actual'
    }
  }

  private static async analyzeInventoryTrend(): Promise<TrendData> {
    const productosData = await db.query.productos.findMany()
    
    const totalStock = productosData.reduce((sum, p) => sum + (p.cantidad || 0), 0)
    const totalMinStock = productosData.reduce((sum, p) => sum + (p.minimo || 0), 0)
    const previousStockEstimate = totalStock * 1.1 // Estimación simplificada

    const change = totalStock - previousStockEstimate
    const changePercentage = (change / Math.max(previousStockEstimate, 1)) * 100

    return {
      currentValue: totalStock,
      previousValue: previousStockEstimate,
      change,
      changePercentage,
      trend: changePercentage > 5 ? 'increasing' : changePercentage < -5 ? 'decreasing' : 'stable',
      period: 'actual'
    }
  }

  private static async analyzeFinancialTrend(startDate: Date, endDate: Date): Promise<TrendData> {
    const bancosData = await db.query.bancos.findMany()
    
    const currentCapital = bancosData.reduce((sum, b) => sum + (b.saldo || 0), 0)
    const previousCapitalEstimate = currentCapital * 0.95 // Estimación simplificada

    const change = currentCapital - previousCapitalEstimate
    const changePercentage = (change / Math.max(previousCapitalEstimate, 1)) * 100

    return {
      currentValue: currentCapital,
      previousValue: previousCapitalEstimate,
      change,
      changePercentage,
      trend: changePercentage > 3 ? 'increasing' : changePercentage < -3 ? 'decreasing' : 'stable',
      period: 'actual'
    }
  }

  private static generateTrendPredictions(trends: any): TrendPrediction[] {
    const predictions: TrendPrediction[] = []

    // Predicciones simples basadas en tendencias actuales
    if (trends.sales.trend === 'increasing') {
      predictions.push({
        period: 'Próximos 30 días',
        predictedValue: trends.sales.currentValue * 1.1,
        confidence: 0.7,
        factors: ['Tendencia alcista actual', 'Crecimiento sostenido']
      })
    }

    if (trends.customers.trend === 'increasing') {
      predictions.push({
        period: 'Próximos 60 días',
        predictedValue: trends.customers.currentValue * 1.15,
        confidence: 0.6,
        factors: ['Aumento en clientes activos', 'Expansión de base de clientes']
      })
    }

    return predictions
  }

  private static getDefaultTrendAnalysis(): TrendAnalysis {
    return {
      salesTrend: {
        currentValue: 0,
        previousValue: 0,
        change: 0,
        changePercentage: 0,
        trend: 'stable',
        period: 'default'
      },
      customerTrend: {
        currentValue: 0,
        previousValue: 0,
        change: 0,
        changePercentage: 0,
        trend: 'stable',
        period: 'default'
      },
      inventoryTrend: {
        currentValue: 0,
        previousValue: 0,
        change: 0,
        changePercentage: 0,
        trend: 'stable',
        period: 'default'
      },
      financialTrend: {
        currentValue: 0,
        previousValue: 0,
        change: 0,
        changePercentage: 0,
        trend: 'stable',
        period: 'default'
      },
      predictions: []
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SISTEMA DE NOTIFICACIONES INTELIGENTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class SmartNotifier {
  static async generateNotifications(): Promise<any[]> {
    const notifications = []

    try {
      // Obtener análisis recientes
      const [salesPrediction, anomalies, inventoryRecommendations] = await Promise.all([
        SalesPredictor.predictSales(30),
        AnomalyDetector.detectAnomalies(7),
        InventoryRecommender.generateRecommendations()
      ])

      // Notificaciones de predicciones
      if (salesPrediction.confidence > 0.8) {
        notifications.push({
          type: 'prediction',
          title: 'Predicción de Ventas Confiable',
          message: `Se proyectan $${salesPrediction.next30Days.toLocaleString()} en ventas para el próximo mes`,
          priority: 'medium',
          actions: ['Ver detalles', 'Ajustar inventario']
        })
      }

      // Notificaciones de anomalías críticas
      if (anomalies.severityBreakdown.critical > 0) {
        notifications.push({
          type: 'anomaly',
          title: 'Anomalías Críticas Detectadas',
          message: `${anomalies.severityBreakdown.critical} anomalías críticas requieren atención inmediata`,
          priority: 'critical',
          actions: ['Ver anomalías', 'Tomar acción']
        })
      }

      // Notificaciones de inventario
      const highPriorityInventory = inventoryRecommendations.products.filter(p => p.priority === 'high')
      if (highPriorityInventory.length > 0) {
        notifications.push({
          type: 'inventory',
          title: 'Productos con Stock Crítico',
          message: `${highPriorityInventory.length} productos necesitan reabastecimiento urgente`,
          priority: 'high',
          actions: ['Ver productos', 'Crear orden']
        })
      }

      return notifications

    } catch (error) {
      logger.error('[SmartNotifier] Error generando notificaciones', error as Error)
      return []
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// EXPORTACIÓN DE SISTEMAS AI
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const ChronosAI = {
  SalesPredictor,
  AnomalyDetector,
  InventoryRecommender,
  TrendAnalyzer,
  SmartNotifier,
  MathUtils
}