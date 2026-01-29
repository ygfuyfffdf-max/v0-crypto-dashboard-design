/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 📦🧠 AI-ENABLED INVENTORY MANAGEMENT — STOCK CUÁNTICO PREDICTIVO
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Sistema de gestión de inventario habilitado por IA:
 * - Predicción de demanda con ML
 * - Simulación de escenarios de stock
 * - Auto-generación de órdenes de compra
 * - Optimización de rotación
 * - Detección de obsolescencia
 * - Zero-dead-stock predictivo
 *
 * @version QUANTUM-INFINITY-2026
 * @author CHRONOS INFINITY TEAM
 */

import { logger } from '@/app/lib/utils/logger'
import type { BusinessContext, ChronosInsight } from '../nexus/types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📦 TIPOS LOCALES PARA INVENTORY AI
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

interface LocalSeasonalPattern {
  name: string
  months: number[]
  multiplier: number
  confidence: number
}

interface LocalDailyPrediction {
  date: Date
  predicted: number
  confidence: number
}

interface LocalDeadStockAlert {
  productId: string
  productName?: string
  daysSinceLastSale: number
  riskScore: number
  potentialLoss?: number
  suggestedAction?: string
  // Campos adicionales para compatibilidad con DeadStockAlert
  riskLevel?: 'critical' | 'high' | 'medium'
  currentStock?: number
  avgDailySales?: number
  projectedDaysToSell?: number
  recommendations?: string[]
  detectedAt?: Date
}

interface LocalInventoryRecommendation {
  productId: string
  type:
    | 'reorder'
    | 'reduce'
    | 'redistribute'
    | 'discontinue'
    | 'reduce_stock'
    | 'increase_stock'
    | 'liquidate'
    | 'promote'
  priority: 'low' | 'medium' | 'high' | number
  impact: number | string | 'high' | 'medium' | 'low'
  description?: string
  // Campos adicionales para compatibilidad con InventoryRecommendation
  productName?: string
  currentValue?: number
  suggestedValue?: number
  reasoning?: string
}

interface LocalInventoryPrediction {
  productId: string
  productName?: string
  currentStock?: number
  optimalStock?: number
  stockHealth?: 'excess' | 'optimal' | 'low' | 'critical' | 'out'
  generatedAt: Date
  horizon: number
  totalPredictedDemand: number
  avgDailyDemand: number
  confidence: number
  dailyPredictions: LocalDailyPrediction[]
  // Propiedades adicionales
  peakDemandDay?: LocalDailyPrediction
  trend?: 'increasing' | 'decreasing' | 'stable'
  trendMagnitude?: number
  seasonality?: 'detected' | 'none'
  factors?: DemandFactor[]
}

interface LocalLotSimulation {
  id?: string
  scenarioId: string
  productId: string
  orderQuantity?: number
  reorderQuantity?: number
  avgStockout?: number
  totalStockout?: number
  overstock?: number
  avgOverstock?: number
  score: number
  // Propiedades adicionales
  probability?: number
  expectedStockoutDays?: number
  expectedOverstockDays?: number
  expectedCost?: number
  riskLevel?: 'low' | 'medium' | 'high'
  recommendation?: string
}

interface LocalAutoPurchaseOrder {
  id: string
  supplierId: string
  supplierName?: string
  productId?: string
  productName?: string
  quantity?: number
  unitPrice?: number
  items?: Array<{ productId: string; quantity: number; unitCost: number }>
  totalCost: number
  urgency: 'low' | 'medium' | 'high' | 'critical' | 'suggested'
  score: number
  status: 'suggested' | 'approved' | 'submitted' | 'confirmed' | 'rejected' | 'pending_approval'
  confidence?: number
  estimatedDelivery?: Date
  reasoning?: string
  createdAt?: Date
}

interface LocalQuantumInventoryState {
  products: Map<string, ProductState>
  predictions: LocalInventoryPrediction[] // Changed from Map to Array
  stockLevels: Map<string, StockLevelData>
  alerts: InventoryAlert[]
  deadStockRisk: LocalDeadStockAlert[]
  optimizationScore: number
  lastOptimization: Date | null
  lastSync: Date
  pendingOrders: LocalAutoPurchaseOrder[]
  recommendations: LocalInventoryRecommendation[]
}

interface ProductState {
  productId: string
  currentStock: number
  minStock: number
  maxStock: number
  reorderPoint: number
  avgDailySales: number
  lastSale: Date | null
}

interface StockLevelData {
  current: number
  optimal: number
  min: number
  max: number
}

interface InventoryAlert {
  id: string
  productId: string
  type: 'low_stock' | 'overstock' | 'dead_stock' | 'reorder_needed'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  createdAt: Date
}

// Type aliases para compatibilidad con referencias externas
type InventoryPrediction = LocalInventoryPrediction
type LotSimulation = LocalLotSimulation
type AutoPurchaseOrder = LocalAutoPurchaseOrder
type QuantumInventoryState = LocalQuantumInventoryState

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 CONFIGURACIÓN DE INVENTORY AI
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

const INVENTORY_CONFIG = {
  // Umbrales de stock
  criticalStockDays: 7,
  lowStockDays: 14,
  optimalStockDays: 30,
  overstockDays: 60,

  // Parámetros de predicción
  forecastHorizon: 90, // días
  confidenceThreshold: 0.75,
  seasonalityWeight: 0.3,
  trendWeight: 0.4,
  historicalWeight: 0.3,

  // Auto-compra
  autoOrderEnabled: true,
  maxAutoOrderValue: 50000,
  preferredSupplierWeight: 0.3,
  priceWeight: 0.4,
  deliveryTimeWeight: 0.3,

  // Simulación
  simulationIterations: 100,
  uncertaintyFactor: 0.15,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 MODELOS DE PREDICCIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

const SEASONAL_PATTERNS: LocalSeasonalPattern[] = [
  {
    name: 'Temporada Alta',
    months: [11, 12, 1], // Nov-Dic-Ene
    multiplier: 1.5,
    confidence: 0.9,
  },
  {
    name: 'Temporada Baja',
    months: [2, 3, 4], // Feb-Mar-Abr
    multiplier: 0.75,
    confidence: 0.85,
  },
  {
    name: 'Regreso a Clases',
    months: [8, 9], // Ago-Sep
    multiplier: 1.3,
    confidence: 0.8,
  },
  {
    name: 'Vacaciones Verano',
    months: [6, 7], // Jun-Jul
    multiplier: 0.9,
    confidence: 0.75,
  },
  {
    name: 'Temporada Normal',
    months: [5, 10], // May, Oct
    multiplier: 1.0,
    confidence: 0.95,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🧠 CLASE PRINCIPAL: INVENTORY AI ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export class InventoryAIEngine {
  private state: LocalQuantumInventoryState
  private businessContext: BusinessContext | null = null
  private callbacks: InventoryAICallbacks
  private predictionCache: Map<string, LocalInventoryPrediction> = new Map()
  private lastPredictionUpdate: Date = new Date(0)

  constructor(callbacks?: Partial<InventoryAICallbacks>) {
    this.callbacks = {
      onStockAlert: callbacks?.onStockAlert ?? ((_alert) => {}),
      onPredictionGenerated: callbacks?.onPredictionGenerated ?? ((_pred) => {}),
      onAutoOrderSuggested: callbacks?.onAutoOrderSuggested ?? ((_order) => {}),
      onDeadStockDetected: callbacks?.onDeadStockDetected ?? ((_product) => {}),
      onInsightGenerated: callbacks?.onInsightGenerated ?? ((_insight) => {}),
    }

    this.state = this.initializeState()
    logger.info('[InventoryAI] Engine initialized', { context: 'InventoryAI' })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🚀 INICIALIZACIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  private initializeState(): LocalQuantumInventoryState {
    return {
      products: new Map(),
      predictions: [], // Changed from Map to Array
      stockLevels: new Map(),
      alerts: [],
      pendingOrders: [],
      deadStockRisk: [],
      optimizationScore: 75,
      lastOptimization: new Date(),
      lastSync: new Date(),
      recommendations: [],
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 📈 PREDICCIÓN DE DEMANDA
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Genera predicción de demanda para un producto
   */
  async predictDemand(
    productId: string,
    historicalSales: DailySales[],
    horizon: number = INVENTORY_CONFIG.forecastHorizon,
  ): Promise<InventoryPrediction> {
    // Verificar cache
    const cacheKey = `${productId}_${horizon}`
    const cached = this.predictionCache.get(cacheKey)
    if (cached && Date.now() - cached.generatedAt.getTime() < 3600000) {
      return cached
    }

    const now = new Date()

    // Calcular estadísticas históricas
    const avgDailySales = this.calculateAverageDailySales(historicalSales)
    const trend = this.calculateTrend(historicalSales)
    const volatility = this.calculateVolatility(historicalSales)
    const seasonalMultiplier = this.getCurrentSeasonalMultiplier()

    // Generar predicción día por día
    const dailyPredictions: DailyPrediction[] = []
    let cumulativeDemand = 0

    for (let day = 1; day <= horizon; day++) {
      const date = new Date(now)
      date.setDate(date.getDate() + day)

      // Calcular demanda predicha
      const baselineDemand = avgDailySales
      const trendAdjustment = baselineDemand * trend * (day / horizon)
      const seasonalAdjustment = this.getSeasonalMultiplierForDate(date)
      const dayOfWeekFactor = this.getDayOfWeekFactor(date)

      const predictedDemand = Math.max(
        0,
        (baselineDemand + trendAdjustment) * seasonalAdjustment * dayOfWeekFactor,
      )

      // Calcular bandas de confianza
      const uncertainty = volatility * Math.sqrt(day / 30) * INVENTORY_CONFIG.uncertaintyFactor
      const lowerBound = Math.max(0, predictedDemand * (1 - uncertainty))
      const upperBound = predictedDemand * (1 + uncertainty)

      cumulativeDemand += predictedDemand

      dailyPredictions.push({
        date,
        predicted: Math.round(predictedDemand * 100) / 100,
        lowerBound: Math.round(lowerBound * 100) / 100,
        upperBound: Math.round(upperBound * 100) / 100,
        confidence: Math.max(0.5, 0.95 - (day / horizon) * 0.3),
      })
    }

    // Calcular métricas agregadas
    const prediction: InventoryPrediction = {
      productId,
      generatedAt: now,
      horizon,
      dailyPredictions,
      totalPredictedDemand: Math.round(cumulativeDemand),
      avgDailyDemand: Math.round((cumulativeDemand / horizon) * 100) / 100,
      peakDemandDay: this.findPeakDemandDay(dailyPredictions),
      trend: trend > 0.05 ? 'increasing' : trend < -0.05 ? 'decreasing' : 'stable',
      trendMagnitude: Math.abs(trend),
      seasonality: seasonalMultiplier !== 1 ? 'detected' : 'none',
      confidence: this.calculateOverallConfidence(dailyPredictions),
      factors: this.identifyDemandFactors(historicalSales, trend, seasonalMultiplier),
    }

    // Guardar en cache
    this.predictionCache.set(cacheKey, prediction)
    this.state.predictions = [
      ...this.state.predictions.filter((p) => p.productId !== productId),
      prediction,
    ]

    this.callbacks.onPredictionGenerated?.(prediction)

    logger.info('[InventoryAI] Demand prediction generated', {
      context: 'InventoryAI',
      data: {
        productId,
        totalDemand: prediction.totalPredictedDemand,
        confidence: prediction.confidence,
      },
    })

    return prediction
  }

  private calculateAverageDailySales(sales: DailySales[]): number {
    if (sales.length === 0) return 0
    return sales.reduce((sum, s) => sum + s.quantity, 0) / sales.length
  }

  private calculateTrend(sales: DailySales[]): number {
    if (sales.length < 14) return 0

    const recentAvg = this.calculateAverageDailySales(sales.slice(-7))
    const previousAvg = this.calculateAverageDailySales(sales.slice(-14, -7))

    if (previousAvg === 0) return 0
    return (recentAvg - previousAvg) / previousAvg
  }

  private calculateVolatility(sales: DailySales[]): number {
    if (sales.length < 2) return 0.2

    const avg = this.calculateAverageDailySales(sales)
    const variance = sales.reduce((sum, s) => sum + Math.pow(s.quantity - avg, 2), 0) / sales.length
    return Math.sqrt(variance) / (avg || 1)
  }

  private getCurrentSeasonalMultiplier(): number {
    const currentMonth = new Date().getMonth() + 1
    const pattern = SEASONAL_PATTERNS.find((p) => p.months.includes(currentMonth))
    return pattern?.multiplier ?? 1.0
  }

  private getSeasonalMultiplierForDate(date: Date): number {
    const month = date.getMonth() + 1
    const pattern = SEASONAL_PATTERNS.find((p) => p.months.includes(month))
    return pattern?.multiplier ?? 1.0
  }

  private getDayOfWeekFactor(date: Date): number {
    const dayOfWeek = date.getDay()
    // Lunes-Viernes: normal, Sábado: +20%, Domingo: -30%
    const factors = [0.7, 1.0, 1.0, 1.0, 1.0, 1.0, 1.2]
    return factors[dayOfWeek] ?? 1.0
  }

  private findPeakDemandDay(predictions: DailyPrediction[]): LocalDailyPrediction | undefined {
    if (predictions.length === 0) return undefined
    return predictions.reduce((peak, p) =>
      p.predicted > (peak?.predicted ?? 0) ? p : peak,
    ) as LocalDailyPrediction
  }

  private calculateOverallConfidence(predictions: DailyPrediction[]): number {
    if (predictions.length === 0) return 0
    return predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length
  }

  private identifyDemandFactors(
    sales: DailySales[],
    trend: number,
    seasonal: number,
  ): DemandFactor[] {
    const factors: DemandFactor[] = []

    if (Math.abs(trend) > 0.1) {
      factors.push({
        name: trend > 0 ? 'Tendencia Creciente' : 'Tendencia Decreciente',
        impact: Math.abs(trend),
        confidence: 0.8,
      })
    }

    if (seasonal !== 1) {
      factors.push({
        name: seasonal > 1 ? 'Temporada Alta' : 'Temporada Baja',
        impact: Math.abs(seasonal - 1),
        confidence: 0.85,
      })
    }

    return factors
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🎲 SIMULACIÓN DE ESCENARIOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Simula múltiples escenarios de inventario
   */
  async simulateScenarios(
    productId: string,
    currentStock: number,
    prediction: InventoryPrediction,
    options: SimulationOptions = {},
  ): Promise<LotSimulation[]> {
    const iterations = options.iterations ?? INVENTORY_CONFIG.simulationIterations
    const simulations: LotSimulation[] = []

    // Escenario 1: No reordenar
    simulations.push(await this.runSimulation('no_reorder', productId, currentStock, 0, prediction))

    // Escenario 2: Reordenar mínimo
    const minOrder = Math.ceil(prediction.avgDailyDemand * INVENTORY_CONFIG.criticalStockDays)
    simulations.push(
      await this.runSimulation('min_reorder', productId, currentStock, minOrder, prediction),
    )

    // Escenario 3: Reordenar óptimo
    const optimalOrder = Math.ceil(prediction.avgDailyDemand * INVENTORY_CONFIG.optimalStockDays)
    simulations.push(
      await this.runSimulation('optimal_reorder', productId, currentStock, optimalOrder, prediction),
    )

    // Escenario 4: Reordenar agresivo
    const aggressiveOrder = Math.ceil(prediction.avgDailyDemand * INVENTORY_CONFIG.overstockDays)
    simulations.push(
      await this.runSimulation(
        'aggressive_reorder',
        productId,
        currentStock,
        aggressiveOrder,
        prediction,
      ),
    )

    // Ordenar por score
    simulations.sort((a, b) => b.score - a.score)

    logger.info('[InventoryAI] Scenarios simulated', {
      context: 'InventoryAI',
      data: { productId, scenariosCount: simulations.length, bestScore: simulations[0]?.score },
    })

    return simulations
  }

  private async runSimulation(
    scenarioId: string,
    productId: string,
    currentStock: number,
    reorderQuantity: number,
    prediction: InventoryPrediction,
  ): Promise<LotSimulation> {
    const results: SimulationResult[] = []

    for (let i = 0; i < INVENTORY_CONFIG.simulationIterations; i++) {
      let stock = currentStock
      let stockoutDays = 0
      let overstockDays = 0
      let holdingCost = 0
      let stockoutCost = 0

      // Simular reorder en día 1 si aplica
      if (reorderQuantity > 0) {
        stock += reorderQuantity
      }

      // Simular cada día
      for (const day of prediction.dailyPredictions) {
        // Añadir variabilidad
        const variance = (Math.random() - 0.5) * 2 * INVENTORY_CONFIG.uncertaintyFactor
        const actualDemand = Math.max(0, Math.round(day.predicted * (1 + variance)))

        stock -= actualDemand

        if (stock < 0) {
          stockoutDays++
          stockoutCost += Math.abs(stock) * 50 // Costo por unidad perdida
          stock = 0
        }

        if (stock > prediction.avgDailyDemand * INVENTORY_CONFIG.overstockDays) {
          overstockDays++
        }

        holdingCost += stock * 0.1 // Costo de almacenamiento por unidad/día
      }

      results.push({
        finalStock: stock,
        stockoutDays,
        overstockDays,
        holdingCost,
        stockoutCost,
        totalCost: holdingCost + stockoutCost,
      })
    }

    // Calcular estadísticas
    const avgStockout = results.reduce((sum, r) => sum + r.stockoutDays, 0) / results.length
    const avgOverstock = results.reduce((sum, r) => sum + r.overstockDays, 0) / results.length
    const avgTotalCost = results.reduce((sum, r) => sum + r.totalCost, 0) / results.length

    // Calcular score (menor costo y stockout = mejor)
    const maxCost = Math.max(...results.map((r) => r.totalCost))
    const costScore = maxCost > 0 ? (1 - avgTotalCost / maxCost) * 50 : 50
    const stockoutScore = (1 - avgStockout / prediction.horizon) * 50
    const score = costScore + stockoutScore

    return {
      id: `sim_${scenarioId}_${Date.now()}`,
      scenarioId,
      productId,
      reorderQuantity,
      probability: this.calculateProbabilityOfSuccess(results),
      expectedStockoutDays: avgStockout,
      expectedOverstockDays: avgOverstock,
      expectedCost: avgTotalCost,
      riskLevel: avgStockout > 7 ? 'high' : avgStockout > 3 ? 'medium' : 'low',
      score,
      recommendation: this.generateScenarioRecommendation(scenarioId, avgStockout, avgOverstock),
    }
  }

  private calculateProbabilityOfSuccess(results: SimulationResult[]): number {
    const successfulRuns = results.filter((r) => r.stockoutDays < 3).length
    return successfulRuns / results.length
  }

  private generateScenarioRecommendation(
    scenarioId: string,
    avgStockout: number,
    avgOverstock: number,
  ): string {
    const recommendations: Record<string, string> = {
      no_reorder:
        avgStockout > 7
          ? '❌ Alto riesgo de stockout. Se recomienda reordenar.'
          : '⚠️ Stock actual puede cubrir demanda a corto plazo.',
      min_reorder:
        avgStockout > 3
          ? '⚠️ Orden mínima insuficiente. Considerar cantidad mayor.'
          : '✅ Orden mínima cubre demanda básica.',
      optimal_reorder: '✅ Cantidad óptima balancea costo y disponibilidad.',
      aggressive_reorder:
        avgOverstock > 20
          ? '⚠️ Riesgo de sobrestock. Puede generar costos de almacenamiento.'
          : '✅ Stock de seguridad amplio para alta demanda.',
    }

    return recommendations[scenarioId] ?? 'Escenario evaluado.'
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🛒 AUTO-GENERACIÓN DE ÓRDENES
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Genera órdenes de compra automáticas
   */
  async generateAutoOrders(
    inventory: ProductInventory[],
    suppliers: Supplier[],
  ): Promise<AutoPurchaseOrder[]> {
    if (!INVENTORY_CONFIG.autoOrderEnabled) {
      return []
    }

    const orders: AutoPurchaseOrder[] = []

    for (const product of inventory) {
      // Verificar si necesita reposición
      const daysOfStock = product.currentStock / (product.avgDailySales || 1)

      if (daysOfStock < INVENTORY_CONFIG.criticalStockDays) {
        // Stock crítico - generar orden
        const order = await this.createAutoOrder(product, suppliers, 'critical')
        if (order) orders.push(order)
      } else if (daysOfStock < INVENTORY_CONFIG.lowStockDays) {
        // Stock bajo - sugerir orden
        const order = await this.createAutoOrder(product, suppliers, 'suggested')
        if (order) orders.push(order)
      }
    }

    // Validar que no exceda límite de auto-orden
    const totalValue = orders.reduce((sum, o) => sum + o.totalCost, 0)
    if (totalValue > INVENTORY_CONFIG.maxAutoOrderValue) {
      // Priorizar órdenes críticas
      orders.sort((a, b) => {
        if (a.urgency === 'critical' && b.urgency !== 'critical') return -1
        if (b.urgency === 'critical' && a.urgency !== 'critical') return 1
        return b.score - a.score
      })

      // Filtrar hasta llegar al límite
      let runningTotal = 0
      const filteredOrders = orders.filter((o) => {
        if (runningTotal + o.totalCost <= INVENTORY_CONFIG.maxAutoOrderValue) {
          runningTotal += o.totalCost
          return true
        }
        return false
      })

      return filteredOrders
    }

    for (const order of orders) {
      this.callbacks.onAutoOrderSuggested?.(order)
    }

    logger.info('[InventoryAI] Auto orders generated', {
      context: 'InventoryAI',
      data: { ordersCount: orders.length, totalValue },
    })

    return orders
  }

  private async createAutoOrder(
    product: ProductInventory,
    suppliers: Supplier[],
    urgency: 'critical' | 'suggested',
  ): Promise<AutoPurchaseOrder | null> {
    // Encontrar mejor proveedor
    const eligibleSuppliers = suppliers.filter(
      (s) => s.products.includes(product.productId) && s.status === 'active',
    )

    if (eligibleSuppliers.length === 0) {
      return null
    }

    const bestSupplier = this.selectBestSupplier(eligibleSuppliers, product)

    // Calcular cantidad óptima
    const targetDays = INVENTORY_CONFIG.optimalStockDays
    const targetStock = product.avgDailySales * targetDays
    const orderQuantity = Math.ceil(targetStock - product.currentStock)

    if (orderQuantity <= 0) return null

    const unitPrice = bestSupplier.pricing[product.productId] ?? product.lastPurchasePrice
    const totalCost = orderQuantity * unitPrice

    return {
      id: `auto_po_${Date.now()}_${product.productId}`,
      productId: product.productId,
      productName: product.productName,
      supplierId: bestSupplier.id,
      supplierName: bestSupplier.name,
      quantity: orderQuantity,
      unitPrice,
      totalCost,
      urgency,
      estimatedDelivery: this.calculateEstimatedDelivery(bestSupplier),
      reasoning: this.generateOrderReasoning(product, orderQuantity, urgency),
      score: this.calculateOrderScore(product, bestSupplier, orderQuantity),
      status: 'pending_approval',
      createdAt: new Date(),
    }
  }

  private selectBestSupplier(suppliers: Supplier[], product: ProductInventory): Supplier {
    return suppliers.reduce((best, current) => {
      const currentScore = this.calculateSupplierScore(current, product)
      const bestScore = this.calculateSupplierScore(best, product)
      return currentScore > bestScore ? current : best
    })
  }

  private calculateSupplierScore(supplier: Supplier, product: ProductInventory): number {
    const price = supplier.pricing[product.productId] ?? Infinity
    const priceScore =
      (1 - price / (product.lastPurchasePrice * 1.5)) * INVENTORY_CONFIG.priceWeight
    const deliveryScore = (1 - supplier.avgDeliveryDays / 14) * INVENTORY_CONFIG.deliveryTimeWeight
    const preferredScore = supplier.isPreferred ? INVENTORY_CONFIG.preferredSupplierWeight : 0

    return (priceScore + deliveryScore + preferredScore) * 100
  }

  private calculateEstimatedDelivery(supplier: Supplier): Date {
    const delivery = new Date()
    delivery.setDate(delivery.getDate() + supplier.avgDeliveryDays)
    return delivery
  }

  private generateOrderReasoning(
    product: ProductInventory,
    quantity: number,
    urgency: 'critical' | 'suggested',
  ): string {
    const daysOfStock = product.currentStock / (product.avgDailySales || 1)

    if (urgency === 'critical') {
      return (
        `⚠️ STOCK CRÍTICO: ${product.productName} tiene solo ${Math.round(daysOfStock)} días de stock. ` +
        `Se requieren ${quantity} unidades para alcanzar nivel óptimo.`
      )
    }

    return (
      `📦 Stock bajo: ${product.productName} tiene ${Math.round(daysOfStock)} días de stock. ` +
      `Se sugiere ordenar ${quantity} unidades.`
    )
  }

  private calculateOrderScore(
    product: ProductInventory,
    supplier: Supplier,
    quantity: number,
  ): number {
    const urgencyScore = product.currentStock < product.avgDailySales * 7 ? 50 : 25
    const supplierScore = this.calculateSupplierScore(supplier, product)
    const quantityScore = Math.min(25, (quantity / 100) * 25)

    return urgencyScore + supplierScore * 0.25 + quantityScore
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ☠️ DETECCIÓN DE STOCK MUERTO
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Detecta productos con riesgo de obsolescencia
   */
  async detectDeadStock(inventory: ProductInventory[]): Promise<DeadStockAlert[]> {
    const alerts: DeadStockAlert[] = []

    for (const product of inventory) {
      const riskScore = this.calculateDeadStockRisk(product)

      if (riskScore > 50) {
        const alert: DeadStockAlert = {
          productId: product.productId,
          productName: product.productName,
          riskScore,
          riskLevel: riskScore > 80 ? 'critical' : riskScore > 65 ? 'high' : 'medium',
          currentStock: product.currentStock,
          daysSinceLastSale: product.daysSinceLastSale,
          avgDailySales: product.avgDailySales,
          projectedDaysToSell:
            product.avgDailySales > 0
              ? Math.ceil(product.currentStock / product.avgDailySales)
              : Infinity,
          recommendations: this.generateDeadStockRecommendations(product, riskScore),
          potentialLoss: product.currentStock * product.unitCost,
          detectedAt: new Date(),
        }

        alerts.push(alert)
        this.callbacks.onDeadStockDetected?.(alert)
      }
    }

    this.state.deadStockRisk = alerts

    logger.info('[InventoryAI] Dead stock detection completed', {
      context: 'InventoryAI',
      data: { alertsCount: alerts.length },
    })

    return alerts
  }

  private calculateDeadStockRisk(product: ProductInventory): number {
    let risk = 0

    // Factor 1: Días sin venta (40%)
    if (product.daysSinceLastSale > 90) risk += 40
    else if (product.daysSinceLastSale > 60) risk += 30
    else if (product.daysSinceLastSale > 30) risk += 20
    else if (product.daysSinceLastSale > 14) risk += 10

    // Factor 2: Ratio stock vs ventas (30%)
    if (product.avgDailySales === 0) {
      risk += 30
    } else {
      const daysToSell = product.currentStock / product.avgDailySales
      if (daysToSell > 180) risk += 30
      else if (daysToSell > 120) risk += 22
      else if (daysToSell > 90) risk += 15
      else if (daysToSell > 60) risk += 8
    }

    // Factor 3: Tendencia de ventas (20%)
    if (product.salesTrend === 'decreasing') {
      risk += 20
    } else if (product.salesTrend === 'stable' && product.avgDailySales < 1) {
      risk += 15
    }

    // Factor 4: Edad del inventario (10%)
    if (product.avgInventoryAge > 90) risk += 10
    else if (product.avgInventoryAge > 60) risk += 5

    return Math.min(100, risk)
  }

  private generateDeadStockRecommendations(product: ProductInventory, riskScore: number): string[] {
    const recommendations: string[] = []

    if (riskScore > 80) {
      recommendations.push('🚨 Liquidación inmediata recomendada (descuento 40-60%)')
      recommendations.push('📞 Contactar clientes frecuentes con oferta especial')
      recommendations.push('🔄 Evaluar devolución a proveedor si aplica')
    } else if (riskScore > 65) {
      recommendations.push('💰 Aplicar promoción agresiva (descuento 25-35%)')
      recommendations.push('📦 Incluir como regalo con compras mayores')
      recommendations.push('🎯 Campaña de marketing focalizada')
    } else {
      recommendations.push('📊 Monitorear ventas próximos 30 días')
      recommendations.push('💵 Considerar descuento moderado (10-15%)')
      recommendations.push('📱 Promocionar en redes sociales')
    }

    return recommendations
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 📊 ANÁLISIS DE OPTIMIZACIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Optimiza el inventario global
   */
  async optimizeInventory(inventory: ProductInventory[]): Promise<OptimizationResult> {
    const startTime = Date.now()

    // Analizar cada categoría
    const categoryAnalysis = this.analyzeByCategory(inventory)
    const turnoverAnalysis = this.analyzeTurnover(inventory)
    const abcAnalysis = this.performABCAnalysis(inventory)

    // Generar recomendaciones
    const recommendations: InventoryRecommendation[] = []

    // Recomendaciones por turnover
    for (const product of inventory) {
      if (product.turnoverRate < 4) {
        recommendations.push({
          type: 'reduce_stock',
          productId: product.productId,
          productName: product.productName,
          currentValue: product.currentStock,
          suggestedValue: Math.ceil(product.avgDailySales * 30),
          reasoning: `Rotación baja (${product.turnoverRate.toFixed(1)}x/año). Reducir stock.`,
          impact: 'medium',
          priority: 2,
        })
      }
    }

    // Recomendaciones por ABC
    for (const [category, products] of Object.entries(abcAnalysis)) {
      if (category === 'A') {
        for (const pid of products) {
          const product = inventory.find((p) => p.productId === pid)
          if (product && product.currentStock < product.avgDailySales * 14) {
            recommendations.push({
              type: 'increase_stock',
              productId: product.productId,
              productName: product.productName,
              currentValue: product.currentStock,
              suggestedValue: Math.ceil(product.avgDailySales * 30),
              reasoning: 'Producto A (alta rotación). Mantener stock de seguridad.',
              impact: 'high',
              priority: 1,
            })
          }
        }
      }
    }

    // Calcular score de optimización
    const optimizationScore = this.calculateOptimizationScore(inventory)

    this.state.optimizationScore = optimizationScore
    this.state.lastOptimization = new Date()
    this.state.recommendations = recommendations

    const result: OptimizationResult = {
      score: optimizationScore,
      categoryAnalysis,
      turnoverAnalysis,
      abcAnalysis,
      recommendations: recommendations.sort((a, b) => a.priority - b.priority),
      potentialSavings: this.calculatePotentialSavings(recommendations),
      executionTime: Date.now() - startTime,
      generatedAt: new Date(),
    }

    logger.info('[InventoryAI] Inventory optimization completed', {
      context: 'InventoryAI',
      data: { score: optimizationScore, recommendationsCount: recommendations.length },
    })

    return result
  }

  private analyzeByCategory(inventory: ProductInventory[]): Record<string, CategoryMetrics> {
    const categories: Record<string, ProductInventory[]> = {}

    for (const product of inventory) {
      const cat = product.category ?? 'Uncategorized'
      if (!categories[cat]) categories[cat] = []
      categories[cat].push(product)
    }

    const result: Record<string, CategoryMetrics> = {}

    for (const [category, products] of Object.entries(categories)) {
      result[category] = {
        productCount: products.length,
        totalValue: products.reduce((sum, p) => sum + p.currentStock * p.unitCost, 0),
        avgTurnover: products.reduce((sum, p) => sum + p.turnoverRate, 0) / products.length,
        lowStockCount: products.filter(
          (p) => p.currentStock < p.avgDailySales * INVENTORY_CONFIG.lowStockDays,
        ).length,
      }
    }

    return result
  }

  private analyzeTurnover(inventory: ProductInventory[]): TurnoverAnalysis {
    const turnoverRates = inventory.map((p) => p.turnoverRate)

    return {
      avgTurnover: turnoverRates.reduce((a, b) => a + b, 0) / turnoverRates.length,
      minTurnover: Math.min(...turnoverRates),
      maxTurnover: Math.max(...turnoverRates),
      slowMovers: inventory.filter((p) => p.turnoverRate < 4).length,
      fastMovers: inventory.filter((p) => p.turnoverRate > 12).length,
    }
  }

  private performABCAnalysis(inventory: ProductInventory[]): {
    A: string[]
    B: string[]
    C: string[]
  } {
    // Ordenar por valor de ventas
    const sorted = [...inventory].sort((a, b) => {
      const valueA = a.avgDailySales * a.unitPrice * 365
      const valueB = b.avgDailySales * b.unitPrice * 365
      return valueB - valueA
    })

    const totalValue = sorted.reduce((sum, p) => sum + p.avgDailySales * p.unitPrice * 365, 0)
    let cumulative = 0

    const result: { A: string[]; B: string[]; C: string[] } = { A: [], B: [], C: [] }

    for (const product of sorted) {
      cumulative += product.avgDailySales * product.unitPrice * 365
      const percentage = cumulative / totalValue

      if (percentage <= 0.8) {
        result.A.push(product.productId)
      } else if (percentage <= 0.95) {
        result.B.push(product.productId)
      } else {
        result.C.push(product.productId)
      }
    }

    return result
  }

  private calculateOptimizationScore(inventory: ProductInventory[]): number {
    let score = 100

    // Penalizar stockouts (-2 por producto)
    const stockouts = inventory.filter((p) => p.currentStock === 0).length
    score -= stockouts * 2

    // Penalizar overstock (-1 por producto)
    const overstocked = inventory.filter(
      (p) => p.currentStock > p.avgDailySales * INVENTORY_CONFIG.overstockDays,
    ).length
    score -= overstocked

    // Penalizar baja rotación (-0.5 por producto)
    const slowMovers = inventory.filter((p) => p.turnoverRate < 4).length
    score -= slowMovers * 0.5

    // Bonificar buena rotación (+0.5 por producto)
    const fastMovers = inventory.filter((p) => p.turnoverRate > 8).length
    score += fastMovers * 0.5

    return Math.max(0, Math.min(100, score))
  }

  private calculatePotentialSavings(recommendations: InventoryRecommendation[]): number {
    return recommendations.reduce((sum, r) => {
      if (r.type === 'reduce_stock') {
        return sum + (r.currentValue - r.suggestedValue) * 10 // Costo estimado por unidad
      }
      return sum
    }, 0)
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔧 MÉTODOS PÚBLICOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Actualiza contexto de negocio
   */
  updateBusinessContext(context: BusinessContext): void {
    this.businessContext = context
  }

  /**
   * Obtiene estado actual
   */
  getState(): QuantumInventoryState {
    return { ...this.state }
  }

  /**
   * Genera insight de inventario
   */
  generateInsight(topic: 'stock' | 'rotation' | 'orders' | 'deadstock'): ChronosInsight {
    const insights: Record<string, ChronosInsight> = {
      stock: {
        id: `insight_stock_${Date.now()}`,
        type: this.state.optimizationScore < 60 ? 'warning' : 'info',
        priority: this.state.optimizationScore < 60 ? 'high' : 'medium',
        title: '📦 Estado del Inventario',
        description: `Score de optimización: ${this.state.optimizationScore}%. ${
          this.state.recommendations.length > 0
            ? `${this.state.recommendations.length} acciones recomendadas.`
            : 'Inventario en buen estado.'
        }`,
        confidence: 90,
        emotionalTone: this.state.optimizationScore < 60 ? 'concerned' : 'neutral',
      },
      rotation: {
        id: `insight_rotation_${Date.now()}`,
        type: 'info',
        priority: 'medium',
        title: '🔄 Rotación de Inventario',
        description: `Análisis de rotación completado. ${
          this.state.deadStockRisk.length > 0
            ? `${this.state.deadStockRisk.length} productos con riesgo de obsolescencia.`
            : 'Sin alertas de rotación lenta.'
        }`,
        confidence: 85,
        emotionalTone: 'neutral',
      },
      orders: {
        id: `insight_orders_${Date.now()}`,
        type: this.state.pendingOrders.length > 0 ? 'warning' : 'info',
        priority: this.state.pendingOrders.length > 0 ? 'high' : 'low',
        title: '🛒 Órdenes Sugeridas',
        description: `${this.state.pendingOrders.length} órdenes de compra pendientes de aprobación.`,
        confidence: 95,
        emotionalTone: 'neutral',
      },
      deadstock: {
        id: `insight_deadstock_${Date.now()}`,
        type: this.state.deadStockRisk.length > 5 ? 'danger' : 'warning',
        priority: this.state.deadStockRisk.length > 5 ? 'critical' : 'medium',
        title: '☠️ Stock Muerto',
        description: `${this.state.deadStockRisk.length} productos en riesgo de obsolescencia. Valor potencial en riesgo: $${this.state.deadStockRisk
          .reduce((sum, a) => sum + (a.potentialLoss ?? 0), 0)
          .toLocaleString()}.`,
        confidence: 88,
        emotionalTone: this.state.deadStockRisk.length > 5 ? 'alert' : 'concerned',
      },
    }

    const insight = insights[topic]
    if (insight) {
      this.callbacks.onInsightGenerated?.(insight)
    }
    return (
      insight ?? {
        id: `insight_fallback_${Date.now()}`,
        type: 'info' as const,
        priority: 'low' as const,
        title: 'Sin datos',
        description: 'No hay información disponible para este tema.',
        confidence: 0,
        emotionalTone: 'neutral' as const,
      }
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 TIPOS ADICIONALES Y EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export interface DailySales {
  date: Date
  quantity: number
  revenue: number
}

export interface DailyPrediction {
  date: Date
  predicted: number
  lowerBound: number
  upperBound: number
  confidence: number
}

export interface DemandFactor {
  name: string
  impact: number
  confidence: number
}

export interface SimulationOptions {
  iterations?: number
  uncertaintyFactor?: number
}

interface SimulationResult {
  finalStock: number
  stockoutDays: number
  overstockDays: number
  holdingCost: number
  stockoutCost: number
  totalCost: number
}

export interface ProductInventory {
  productId: string
  productName: string
  category?: string
  currentStock: number
  avgDailySales: number
  daysSinceLastSale: number
  salesTrend: 'increasing' | 'stable' | 'decreasing'
  unitCost: number
  unitPrice: number
  lastPurchasePrice: number
  turnoverRate: number
  avgInventoryAge: number
}

export interface Supplier {
  id: string
  name: string
  products: string[]
  status: 'active' | 'inactive'
  isPreferred: boolean
  avgDeliveryDays: number
  pricing: Record<string, number>
}

export interface DeadStockAlert {
  productId: string
  productName: string
  riskScore: number
  riskLevel: 'critical' | 'high' | 'medium'
  currentStock: number
  daysSinceLastSale: number
  avgDailySales: number
  projectedDaysToSell: number
  recommendations: string[]
  potentialLoss: number
  detectedAt: Date
}

export interface InventoryRecommendation {
  type: 'increase_stock' | 'reduce_stock' | 'liquidate' | 'promote'
  productId: string
  productName: string
  currentValue: number
  suggestedValue: number
  reasoning: string
  impact: 'high' | 'medium' | 'low'
  priority: number
}

export interface CategoryMetrics {
  productCount: number
  totalValue: number
  avgTurnover: number
  lowStockCount: number
}

export interface TurnoverAnalysis {
  avgTurnover: number
  minTurnover: number
  maxTurnover: number
  slowMovers: number
  fastMovers: number
}

export interface OptimizationResult {
  score: number
  categoryAnalysis: Record<string, CategoryMetrics>
  turnoverAnalysis: TurnoverAnalysis
  abcAnalysis: Record<string, string[]>
  recommendations: InventoryRecommendation[]
  potentialSavings: number
  executionTime: number
  generatedAt: Date
}

export interface InventoryAICallbacks {
  onStockAlert?: (alert: StockAlert) => void
  onPredictionGenerated?: (prediction: InventoryPrediction) => void
  onAutoOrderSuggested?: (order: AutoPurchaseOrder) => void
  onDeadStockDetected?: (alert: DeadStockAlert) => void
  onInsightGenerated?: (insight: ChronosInsight) => void
}

export interface StockAlert {
  productId: string
  type: 'critical' | 'low' | 'optimal' | 'overstock'
  currentStock: number
  threshold: number
  message: string
}

// Singleton
let inventoryAIInstance: InventoryAIEngine | null = null

export function getInventoryAIEngine(callbacks?: Partial<InventoryAICallbacks>): InventoryAIEngine {
  if (!inventoryAIInstance) {
    inventoryAIInstance = new InventoryAIEngine(callbacks)
  }
  return inventoryAIInstance
}

export function resetInventoryAIEngine(): void {
  inventoryAIInstance = null
}
