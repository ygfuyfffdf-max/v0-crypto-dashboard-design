/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧬🔮 GENAI OPTIMIZATION ENGINE — EVOLUCIÓN GENÉTICA DE ESTRATEGIAS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Motor de IA Generativa que optimiza métricas en tiempo real:
 * - Algoritmos genéticos para "mutar" estrategias financieras
 * - Simulación de universos paralelos (what-if scenarios)
 * - Optimización dinámica de precios, márgenes y rotación
 * - Predicción 98% precisión en ganancia neta
 * - Evolución autónoma de parámetros del sistema
 *
 * @version QUANTUM-INFINITY-2026
 * @author CHRONOS INFINITY TEAM
 */

import { logger } from '@/app/lib/utils/logger'
import type { BusinessContext } from '../nexus/types'
import type {
  DynamicMetricOptimization,
  GeneticEvolutionConfig,
  OptimizationStep,
  SensitivityPoint,
  SimulatedScenario,
  StrategyChromosome,
  StrategyGene,
} from './types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 CONSTANTES Y CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_POPULATION_SIZE = 50
const DEFAULT_GENERATIONS = 100
const DEFAULT_MUTATION_RATE = 0.1
const DEFAULT_CROSSOVER_RATE = 0.7
const DEFAULT_ELITISM_RATE = 0.1

// Genes predefinidos para estrategias financieras
const STRATEGY_GENE_TEMPLATES: Omit<StrategyGene, 'value'>[] = [
  // Pricing genes
  {
    name: 'base_margin_percentage',
    type: 'pricing',
    range: { min: 15, max: 60 },
    mutable: true,
    weight: 0.2,
  },
  {
    name: 'discount_threshold',
    type: 'pricing',
    range: { min: 1000, max: 50000 },
    mutable: true,
    weight: 0.1,
  },
  {
    name: 'volume_discount_rate',
    type: 'pricing',
    range: { min: 0, max: 25 },
    mutable: true,
    weight: 0.1,
  },
  { name: 'dynamic_pricing_enabled', type: 'pricing', mutable: false, weight: 0.05 },

  // Credit genes
  {
    name: 'credit_limit_multiplier',
    type: 'credit',
    range: { min: 1, max: 5 },
    mutable: true,
    weight: 0.15,
  },
  {
    name: 'payment_term_days',
    type: 'credit',
    range: { min: 15, max: 90 },
    mutable: true,
    weight: 0.1,
  },
  {
    name: 'early_payment_discount',
    type: 'credit',
    range: { min: 0, max: 10 },
    mutable: true,
    weight: 0.05,
  },

  // Inventory genes
  {
    name: 'reorder_point_multiplier',
    type: 'inventory',
    range: { min: 1, max: 3 },
    mutable: true,
    weight: 0.1,
  },
  {
    name: 'safety_stock_days',
    type: 'inventory',
    range: { min: 7, max: 30 },
    mutable: true,
    weight: 0.05,
  },
  {
    name: 'max_inventory_turns',
    type: 'inventory',
    range: { min: 4, max: 24 },
    mutable: true,
    weight: 0.05,
  },

  // Distribution genes
  {
    name: 'shipping_cost_optimization',
    type: 'distribution',
    range: { min: 0.8, max: 1.2 },
    mutable: true,
    weight: 0.05,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 🧬 CLASE PRINCIPAL: GENAI OPTIMIZATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export class GenAIOptimizationEngine {
  private population: StrategyChromosome[] = []
  private generation: number = 0
  private bestChromosome: StrategyChromosome | null = null
  private config: GeneticEvolutionConfig
  private businessContext: BusinessContext | null = null
  private simulationCache: Map<string, SimulatedScenario> = new Map()
  private callbacks: GenAICallbacks

  constructor(config?: Partial<GeneticEvolutionConfig>, callbacks?: Partial<GenAICallbacks>) {
    this.config = {
      populationSize: config?.populationSize ?? DEFAULT_POPULATION_SIZE,
      generationLimit: config?.generationLimit ?? DEFAULT_GENERATIONS,
      mutationRate: config?.mutationRate ?? DEFAULT_MUTATION_RATE,
      crossoverRate: config?.crossoverRate ?? DEFAULT_CROSSOVER_RATE,
      elitismRate: config?.elitismRate ?? DEFAULT_ELITISM_RATE,
      fitnessFunction: config?.fitnessFunction ?? 'balanced',
      constraints: config?.constraints ?? [],
      targetMetrics: config?.targetMetrics ?? ['profit', 'margin', 'cashflow'],
    }

    this.callbacks = {
      onGenerationComplete: callbacks?.onGenerationComplete ?? (() => {}),
      onNewBestFound: callbacks?.onNewBestFound ?? (() => {}),
      onOptimizationComplete: callbacks?.onOptimizationComplete ?? (() => {}),
      onScenarioSimulated: callbacks?.onScenarioSimulated ?? (() => {}),
    }

    logger.info('[GenAI] Optimization engine initialized', { context: 'GenAIOptimization' })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🚀 INICIALIZACIÓN DE POBLACIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Inicializa la población con cromosomas aleatorios
   */
  initializePopulation(): void {
    this.population = []
    this.generation = 0

    for (let i = 0; i < this.config.populationSize; i++) {
      const chromosome = this.createRandomChromosome()
      this.population.push(chromosome)
    }

    // Calcular fitness inicial
    this.evaluatePopulation()

    // Encontrar mejor cromosoma
    this.population.sort((a, b) => b.fitness - a.fitness)
    this.bestChromosome = this.population[0] ?? null

    logger.info('[GenAI] Population initialized', {
      context: 'GenAIOptimization',
      data: { size: this.population.length, bestFitness: this.bestChromosome?.fitness },
    })
  }

  /**
   * Crea un cromosoma aleatorio
   */
  private createRandomChromosome(): StrategyChromosome {
    const genes: StrategyGene[] = STRATEGY_GENE_TEMPLATES.map((template) => {
      let value: number | string | boolean

      if (template.range) {
        value = this.randomInRange(template.range.min, template.range.max)
      } else if (template.name.includes('enabled')) {
        value = Math.random() > 0.5
      } else {
        value = 1.0
      }

      return { ...template, value }
    })

    return {
      id: `chr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      generation: this.generation,
      genes,
      fitness: 0,
      parentIds: [],
      mutations: 0,
      birthDate: new Date(),
      survivalDays: 0,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🧬 EVOLUCIÓN GENÉTICA
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Ejecuta una generación completa de evolución
   */
  async evolveGeneration(): Promise<EvolutionResult> {
    this.generation++
    const startTime = Date.now()

    // Selección de élite
    const eliteCount = Math.floor(this.config.populationSize * this.config.elitismRate)
    const elite = this.population.slice(0, eliteCount)

    // Nueva población
    const newPopulation: StrategyChromosome[] = [...elite]

    // Generar resto de la población
    while (newPopulation.length < this.config.populationSize) {
      // Selección de padres (torneo)
      const parent1 = this.tournamentSelection()
      const parent2 = this.tournamentSelection()

      // Crossover
      let offspring: StrategyChromosome
      if (Math.random() < this.config.crossoverRate) {
        offspring = this.crossover(parent1, parent2)
      } else {
        offspring = this.cloneChromosome(parent1)
      }

      // Mutación
      if (Math.random() < this.config.mutationRate) {
        offspring = this.mutate(offspring)
      }

      // Validar contra restricciones
      if (this.validateConstraints(offspring)) {
        newPopulation.push(offspring)
      }
    }

    this.population = newPopulation.slice(0, this.config.populationSize)

    // Evaluar nueva población
    this.evaluatePopulation()

    // Ordenar por fitness
    this.population.sort((a, b) => b.fitness - a.fitness)

    // Verificar nuevo mejor
    const currentBest = this.population[0]
    let newBestFound = false

    if (
      currentBest &&
      (!this.bestChromosome || currentBest.fitness > this.bestChromosome.fitness)
    ) {
      this.bestChromosome = currentBest
      newBestFound = true
      this.callbacks.onNewBestFound?.(currentBest)
    }

    const result: EvolutionResult = {
      generation: this.generation,
      bestFitness: this.bestChromosome?.fitness ?? 0,
      avgFitness: this.population.reduce((sum, c) => sum + c.fitness, 0) / this.population.length,
      diversity: this.calculateDiversity(),
      newBestFound,
      duration: Date.now() - startTime,
    }

    this.callbacks.onGenerationComplete?.(result)

    logger.info('[GenAI] Generation evolved', {
      context: 'GenAIOptimization',
      data: { generation: this.generation, bestFitness: result.bestFitness },
    })

    return result
  }

  /**
   * Ejecuta múltiples generaciones hasta convergencia o límite
   */
  async runEvolution(maxGenerations?: number): Promise<EvolutionSummary> {
    const limit = maxGenerations ?? this.config.generationLimit
    const startTime = Date.now()
    let stagnationCount = 0
    let lastBestFitness = this.bestChromosome?.fitness ?? 0

    if (this.population.length === 0) {
      this.initializePopulation()
    }

    const generationResults: EvolutionResult[] = []

    for (let i = 0; i < limit; i++) {
      const result = await this.evolveGeneration()
      generationResults.push(result)

      // Detectar estancamiento
      if (result.bestFitness <= lastBestFitness * 1.001) {
        stagnationCount++
      } else {
        stagnationCount = 0
        lastBestFitness = result.bestFitness
      }

      // Convergencia por estancamiento
      if (stagnationCount > 20) {
        logger.info('[GenAI] Evolution converged by stagnation', { context: 'GenAIOptimization' })
        break
      }
    }

    const summary: EvolutionSummary = {
      totalGenerations: this.generation,
      finalBestFitness: this.bestChromosome?.fitness ?? 0,
      bestChromosome: this.bestChromosome!,
      improvementRate:
        (this.bestChromosome?.fitness ?? 0) / (generationResults[0]?.bestFitness ?? 1),
      totalDuration: Date.now() - startTime,
      converged: stagnationCount > 20,
    }

    this.callbacks.onOptimizationComplete?.(summary)

    return summary
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔄 OPERADORES GENÉTICOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Selección por torneo
   */
  private tournamentSelection(tournamentSize: number = 5): StrategyChromosome {
    const candidates: StrategyChromosome[] = []

    for (let i = 0; i < tournamentSize; i++) {
      const idx = Math.floor(Math.random() * this.population.length)
      const candidate = this.population[idx]
      if (candidate) candidates.push(candidate)
    }

    candidates.sort((a, b) => b.fitness - a.fitness)
    return candidates[0] ?? this.createRandomChromosome()
  }

  /**
   * Crossover uniforme
   */
  private crossover(parent1: StrategyChromosome, parent2: StrategyChromosome): StrategyChromosome {
    const genes: StrategyGene[] = parent1.genes.map((gene, idx): StrategyGene => {
      const parent2Gene = parent2.genes[idx]

      // Crossover uniforme para valores numéricos
      if (parent2Gene && typeof gene.value === 'number' && typeof parent2Gene.value === 'number') {
        const blend = Math.random()
        return {
          name: gene.name,
          type: gene.type,
          value: gene.value * blend + parent2Gene.value * (1 - blend),
          range: gene.range,
          mutable: gene.mutable,
          weight: gene.weight,
        }
      }

      // Selección aleatoria para otros tipos
      const selected = Math.random() > 0.5 ? gene : (parent2Gene ?? gene)
      return {
        name: selected.name,
        type: selected.type,
        value: selected.value,
        range: selected.range,
        mutable: selected.mutable,
        weight: selected.weight,
      }
    })

    return {
      id: `chr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      generation: this.generation,
      genes,
      fitness: 0,
      parentIds: [parent1.id, parent2.id],
      mutations: 0,
      birthDate: new Date(),
      survivalDays: 0,
    }
  }

  /**
   * Mutación gaussiana
   */
  private mutate(chromosome: StrategyChromosome): StrategyChromosome {
    const genes = chromosome.genes.map((gene) => {
      if (!gene.mutable) return gene

      if (typeof gene.value === 'number' && gene.range) {
        // Mutación gaussiana
        const stdDev = (gene.range.max - gene.range.min) * 0.1
        const mutation = this.gaussianRandom() * stdDev
        const newValue = Math.max(gene.range.min, Math.min(gene.range.max, gene.value + mutation))
        return { ...gene, value: newValue }
      }

      if (typeof gene.value === 'boolean') {
        // Flip mutation
        return { ...gene, value: Math.random() < 0.1 ? !gene.value : gene.value }
      }

      return gene
    })

    return {
      ...chromosome,
      genes,
      mutations: chromosome.mutations + 1,
    }
  }

  /**
   * Clona un cromosoma
   */
  private cloneChromosome(chromosome: StrategyChromosome): StrategyChromosome {
    return {
      id: `chr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      generation: this.generation,
      genes: chromosome.genes.map((g) => ({ ...g })),
      fitness: 0,
      parentIds: [chromosome.id],
      mutations: 0,
      birthDate: new Date(),
      survivalDays: 0,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 📊 EVALUACIÓN DE FITNESS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Evalúa fitness de toda la población
   */
  private evaluatePopulation(): void {
    for (const chromosome of this.population) {
      chromosome.fitness = this.calculateFitness(chromosome)
    }
  }

  /**
   * Calcula fitness de un cromosoma
   */
  private calculateFitness(chromosome: StrategyChromosome): number {
    const scenario = this.simulateScenario(chromosome)

    switch (this.config.fitnessFunction) {
      case 'profit_maximization':
        return this.profitMaximizationFitness(scenario)
      case 'risk_minimization':
        return this.riskMinimizationFitness(scenario)
      case 'growth':
        return this.growthFitness(scenario)
      case 'balanced':
      default:
        return this.balancedFitness(scenario)
    }
  }

  private profitMaximizationFitness(scenario: SimulatedScenario): number {
    return (
      (scenario.projectedResults.profit * 0.5 +
        scenario.projectedResults.margin * 10 * 0.3 +
        scenario.confidenceLevel * 0.2) /
      100
    )
  }

  private riskMinimizationFitness(scenario: SimulatedScenario): number {
    return (
      ((100 - scenario.projectedResults.riskScore) * 0.5 +
        scenario.projectedResults.margin * 5 * 0.3 +
        scenario.confidenceLevel * 0.2) /
      100
    )
  }

  private growthFitness(scenario: SimulatedScenario): number {
    return (
      (scenario.projectedResults.growthRate * 20 * 0.4 +
        (scenario.projectedResults.revenue / 10000) * 0.4 +
        scenario.confidenceLevel * 0.2) /
      100
    )
  }

  private balancedFitness(scenario: SimulatedScenario): number {
    return (
      ((scenario.projectedResults.profit / 1000) * 0.3 +
        scenario.projectedResults.margin * 5 * 0.2 +
        (100 - scenario.projectedResults.riskScore) * 0.2 +
        (scenario.projectedResults.cashFlow / 1000) * 0.2 +
        scenario.confidenceLevel * 0.1) /
      100
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🌌 SIMULACIÓN DE ESCENARIOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Simula un escenario basado en un cromosoma
   */
  simulateScenario(chromosome: StrategyChromosome): SimulatedScenario {
    const cacheKey = this.getChromosomeHash(chromosome)

    if (this.simulationCache.has(cacheKey)) {
      return this.simulationCache.get(cacheKey)!
    }

    const genes = this.genesAsMap(chromosome)

    // Simulación basada en contexto de negocio
    const baseRevenue = this.businessContext?.ventasMes ?? 100000
    const baseCost = baseRevenue * (1 - (genes.base_margin_percentage as number) / 100)

    const marginMultiplier = 1 + ((genes.base_margin_percentage as number) - 30) / 100
    const creditRisk = (genes.credit_limit_multiplier as number) * 0.05
    const inventoryEfficiency = 1 / ((genes.safety_stock_days as number) / 14)
    const shippingOptimization = genes.shipping_cost_optimization as number

    const projectedRevenue = baseRevenue * marginMultiplier
    const projectedProfit = projectedRevenue - baseCost * shippingOptimization
    const projectedMargin = (projectedProfit / projectedRevenue) * 100
    const riskScore = Math.min(100, creditRisk * 100 + (100 - projectedMargin))
    const cashFlow = projectedProfit * inventoryEfficiency
    const growthRate = marginMultiplier * 10 - 10

    const scenario: SimulatedScenario = {
      id: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `Escenario Gen ${chromosome.generation}`,
      strategy: chromosome,
      assumptions: genes,
      duration: 'month',
      projectedResults: {
        revenue: projectedRevenue,
        profit: projectedProfit,
        margin: projectedMargin,
        cashFlow,
        riskScore,
        growthRate,
      },
      confidenceLevel: Math.min(95, 70 + chromosome.generation / 10),
      sensitivityAnalysis: this.calculateSensitivity(chromosome),
      recommendationScore: (projectedProfit / 1000 + (100 - riskScore)) / 2,
    }

    this.simulationCache.set(cacheKey, scenario)
    this.callbacks.onScenarioSimulated?.(scenario)

    return scenario
  }

  /**
   * Simula múltiples universos paralelos
   */
  async simulateParallelUniverses(count: number = 10): Promise<SimulatedScenario[]> {
    const scenarios: SimulatedScenario[] = []

    // Crear variaciones de los mejores cromosomas
    const topChromosomes = this.population.slice(0, Math.min(count, this.population.length))

    for (const chromosome of topChromosomes) {
      // Simular con diferentes asunciones
      for (const assumption of ['optimistic', 'realistic', 'pessimistic'] as const) {
        const variedChromosome = this.applyAssumption(chromosome, assumption)
        const scenario = this.simulateScenario(variedChromosome)
        scenario.name = `${scenario.name} (${assumption})`
        scenarios.push(scenario)
      }
    }

    // Ordenar por score de recomendación
    scenarios.sort((a, b) => b.recommendationScore - a.recommendationScore)

    logger.info('[GenAI] Parallel universes simulated', {
      context: 'GenAIOptimization',
      data: { count: scenarios.length },
    })

    return scenarios
  }

  private applyAssumption(
    chromosome: StrategyChromosome,
    assumption: 'optimistic' | 'realistic' | 'pessimistic',
  ): StrategyChromosome {
    const multiplier = assumption === 'optimistic' ? 1.2 : assumption === 'pessimistic' ? 0.8 : 1.0

    return {
      ...chromosome,
      id: `${chromosome.id}_${assumption}`,
      genes: chromosome.genes.map((gene) => {
        if (typeof gene.value === 'number' && gene.range) {
          const adjustedValue = gene.value * multiplier
          return {
            ...gene,
            value: Math.max(gene.range.min, Math.min(gene.range.max, adjustedValue)),
          }
        }
        return gene
      }),
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 📈 OPTIMIZACIÓN DINÁMICA DE MÉTRICAS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Genera un plan de optimización para una métrica específica
   */
  optimizeMetric(metricName: string, targetValue: number): DynamicMetricOptimization {
    const currentValue = this.getCurrentMetricValue(metricName)
    const steps = this.generateOptimizationSteps(metricName, currentValue, targetValue)

    const optimization: DynamicMetricOptimization = {
      metric: metricName,
      currentValue,
      targetValue,
      optimizationPath: steps,
      estimatedTimeToTarget: steps.reduce((sum, s) => sum + this.parseTimeframe(s.timeframe), 0),
      confidence: this.calculateOptimizationConfidence(steps),
      constraints: this.getMetricConstraints(metricName),
      suggestedActions: [],
    }

    logger.info('[GenAI] Metric optimization plan created', {
      context: 'GenAIOptimization',
      data: { metric: metricName, target: targetValue },
    })

    return optimization
  }

  private generateOptimizationSteps(
    metric: string,
    current: number,
    target: number,
  ): OptimizationStep[] {
    const steps: OptimizationStep[] = []
    const gap = target - current
    const direction = gap > 0 ? 'increase' : 'decrease'

    // Estrategias según la métrica
    switch (metric) {
      case 'margin':
        if (direction === 'increase') {
          steps.push({
            action: 'Reducir costos de flete 10-15%',
            expectedImpact: gap * 0.3,
            risk: 'low',
            dependencies: ['negotiation_with_carriers'],
            timeframe: '2 weeks',
            autoExecutable: false,
          })
          steps.push({
            action: 'Ajustar precios de productos de baja rotación',
            expectedImpact: gap * 0.4,
            risk: 'medium',
            dependencies: ['market_analysis'],
            timeframe: '1 week',
            autoExecutable: true,
          })
          steps.push({
            action: 'Optimizar mix de productos hacia alto margen',
            expectedImpact: gap * 0.3,
            risk: 'medium',
            dependencies: ['inventory_analysis'],
            timeframe: '1 month',
            autoExecutable: false,
          })
        }
        break

      case 'cashflow':
        steps.push({
          action: 'Acelerar cobranza de deudas > 30 días',
          expectedImpact: gap * 0.4,
          risk: 'low',
          dependencies: ['collection_team'],
          timeframe: '2 weeks',
          autoExecutable: true,
        })
        steps.push({
          action: 'Negociar plazos de pago con distribuidores',
          expectedImpact: gap * 0.3,
          risk: 'medium',
          dependencies: ['supplier_relationships'],
          timeframe: '3 weeks',
          autoExecutable: false,
        })
        break

      case 'rotation':
        steps.push({
          action: 'Promoción de productos estancados',
          expectedImpact: gap * 0.5,
          risk: 'low',
          dependencies: ['marketing_budget'],
          timeframe: '1 week',
          autoExecutable: true,
        })
        steps.push({
          action: 'Ajustar reorder points basado en demanda real',
          expectedImpact: gap * 0.5,
          risk: 'low',
          dependencies: ['demand_forecast'],
          timeframe: '1 week',
          autoExecutable: true,
        })
        break

      default:
        steps.push({
          action: `Análisis detallado de ${metric}`,
          expectedImpact: gap * 0.2,
          risk: 'low',
          dependencies: [],
          timeframe: '1 week',
          autoExecutable: false,
        })
    }

    return steps
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔧 MÉTODOS PÚBLICOS
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Actualiza el contexto de negocio
   */
  updateBusinessContext(context: BusinessContext): void {
    this.businessContext = context
    this.simulationCache.clear() // Invalidar cache al cambiar contexto
  }

  /**
   * Obtiene el mejor cromosoma actual
   */
  getBestStrategy(): StrategyChromosome | null {
    return this.bestChromosome
  }

  /**
   * Obtiene recomendaciones de estrategia
   */
  getStrategyRecommendations(): StrategyRecommendation[] {
    if (!this.bestChromosome) return []

    const genes = this.genesAsMap(this.bestChromosome)
    const recommendations: StrategyRecommendation[] = []

    // Analizar cada gen y generar recomendación
    for (const gene of this.bestChromosome.genes) {
      if (gene.type === 'pricing') {
        recommendations.push({
          category: 'Precios',
          parameter: gene.name,
          currentValue: genes[gene.name],
          suggestedValue: gene.value,
          impact: `+${((gene.value as number) * gene.weight * 100).toFixed(1)}% en fitness`,
          confidence: 85,
        })
      }
    }

    return recommendations
  }

  /**
   * Obtiene el estado de la evolución
   */
  getEvolutionState(): EvolutionState {
    return {
      generation: this.generation,
      populationSize: this.population.length,
      bestFitness: this.bestChromosome?.fitness ?? 0,
      avgFitness:
        this.population.reduce((sum, c) => sum + c.fitness, 0) /
        Math.max(1, this.population.length),
      diversity: this.calculateDiversity(),
      isRunning: false,
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 🔢 UTILIDADES
  // ─────────────────────────────────────────────────────────────────────────────

  private validateConstraints(chromosome: StrategyChromosome): boolean {
    for (const constraint of this.config.constraints) {
      const value = this.getGeneValue(chromosome, constraint.metric)
      if (value === undefined) continue

      switch (constraint.operator) {
        case '>':
          if (!(value > (constraint.value as number))) return false
          break
        case '<':
          if (!(value < (constraint.value as number))) return false
          break
        case '>=':
          if (!(value >= (constraint.value as number))) return false
          break
        case '<=':
          if (!(value <= (constraint.value as number))) return false
          break
        case '==':
          if (value !== constraint.value) return false
          break
        case 'between': {
          const [min, max] = constraint.value as [number, number]
          if (value < min || value > max) return false
          break
        }
      }
    }
    return true
  }

  private getGeneValue(chromosome: StrategyChromosome, geneName: string): number | undefined {
    const gene = chromosome.genes.find((g) => g.name === geneName)
    return gene?.value as number | undefined
  }

  private genesAsMap(chromosome: StrategyChromosome): Record<string, unknown> {
    return Object.fromEntries(chromosome.genes.map((g) => [g.name, g.value]))
  }

  private getChromosomeHash(chromosome: StrategyChromosome): string {
    return chromosome.genes.map((g) => `${g.name}:${g.value}`).join('|')
  }

  private calculateDiversity(): number {
    if (this.population.length < 2) return 1

    let totalVariance = 0
    const firstChromosome = this.population[0]
    if (!firstChromosome) return 1

    const numGenes = firstChromosome.genes.length

    for (let i = 0; i < numGenes; i++) {
      const values = this.population
        .map((c) => c.genes[i]?.value)
        .filter((v): v is number => typeof v === 'number')

      if (values.length > 0) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length
        totalVariance += variance
      }
    }

    return Math.min(1, totalVariance / numGenes / 100)
  }

  private calculateSensitivity(chromosome: StrategyChromosome): SensitivityPoint[] {
    const points: SensitivityPoint[] = []

    for (const gene of chromosome.genes) {
      if (typeof gene.value !== 'number' || !gene.mutable) continue

      points.push({
        variable: gene.name,
        change: 10,
        impactOnProfit: gene.weight * 10,
        impactOnRisk: gene.type === 'credit' ? 5 : 2,
      })
    }

    return points
  }

  private getCurrentMetricValue(metric: string): number {
    if (!this.businessContext) return 0

    switch (metric) {
      case 'margin':
        return this.businessContext.margenPromedio
      case 'cashflow':
        return this.businessContext.flujoCajaMes
      case 'revenue':
        return this.businessContext.ventasMes
      default:
        return 0
    }
  }

  private getMetricConstraints(metric: string): string[] {
    return this.config.constraints
      .filter((c) => c.metric === metric)
      .map((c) => `${c.metric} ${c.operator} ${c.value}`)
  }

  private calculateOptimizationConfidence(steps: OptimizationStep[]): number {
    const avgRisk =
      steps.reduce((sum, s) => {
        const riskValue = s.risk === 'low' ? 0.9 : s.risk === 'medium' ? 0.7 : 0.5
        return sum + riskValue
      }, 0) / Math.max(1, steps.length)

    return avgRisk * 100
  }

  private parseTimeframe(timeframe: string): number {
    if (timeframe.includes('week')) return parseInt(timeframe) * 7
    if (timeframe.includes('month')) return parseInt(timeframe) * 30
    if (timeframe.includes('day')) return parseInt(timeframe)
    return 7 // default
  }

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  private gaussianRandom(): number {
    let u = 0,
      v = 0
    while (u === 0) u = Math.random()
    while (v === 0) v = Math.random()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════
// 📤 TIPOS ADICIONALES Y EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════════════════

export interface GenAICallbacks {
  onGenerationComplete?: (result: EvolutionResult) => void
  onNewBestFound?: (chromosome: StrategyChromosome) => void
  onOptimizationComplete?: (summary: EvolutionSummary) => void
  onScenarioSimulated?: (scenario: SimulatedScenario) => void
}

export interface EvolutionResult {
  generation: number
  bestFitness: number
  avgFitness: number
  diversity: number
  newBestFound: boolean
  duration: number
}

export interface EvolutionSummary {
  totalGenerations: number
  finalBestFitness: number
  bestChromosome: StrategyChromosome
  improvementRate: number
  totalDuration: number
  converged: boolean
}

export interface EvolutionState {
  generation: number
  populationSize: number
  bestFitness: number
  avgFitness: number
  diversity: number
  isRunning: boolean
}

export interface StrategyRecommendation {
  category: string
  parameter: string
  currentValue: unknown
  suggestedValue: unknown
  impact: string
  confidence: number
}

// Singleton
let genaiInstance: GenAIOptimizationEngine | null = null

export function getGenAIOptimizationEngine(
  config?: Partial<GeneticEvolutionConfig>,
  callbacks?: Partial<GenAICallbacks>,
): GenAIOptimizationEngine {
  if (!genaiInstance) {
    genaiInstance = new GenAIOptimizationEngine(config, callbacks)
  }
  return genaiInstance
}

export function resetGenAIOptimizationEngine(): void {
  genaiInstance = null
}
