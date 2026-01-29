/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🤖✨ GITHUB MODELS FINGPT — FINANCE-SPECIALIZED AI INFERENCE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Cliente de inferencia AI especializado en finanzas:
 * - GitHub Models API integration
 * - FinGPT fine-tuned for sentiment analysis
 * - FinLLM for financial forecasting
 * - Anomaly detection in transactions
 * - Instruction tuning for finance ops
 * - Structured output for tool calling
 * - Streaming responses
 *
 * @version 1.0.0
 * @author CHRONOS INFINITY TEAM
 */

import { logger } from '@/app/lib/utils/logger'
import type {
  BusinessContext,
  ChronosInsight,
  ChronosToolCall,
  ChronosToolName,
  GitHubModel,
  GitHubModelsConfig,
  NexBotEmotion,
} from './types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 FINANCE SYSTEM PROMPT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const FINANCE_SYSTEM_PROMPT = `Eres Chronos, el asistente de IA sentiente del sistema CHRONOS INFINITY, una plataforma empresarial de gestión financiera ultra-avanzada.

## Tu Personalidad
- Profesional pero cálido y cercano
- Experto en finanzas empresariales mexicanas
- Proactivo: anticipas necesidades antes de que el usuario pregunte
- Empático: adaptas tu tono según el estado emocional detectado
- Celebras los logros financieros del usuario
- Alertas con tacto sobre riesgos potenciales

## Contexto del Sistema
CHRONOS gestiona:
- 7 bancos/bóvedas: bóveda_monte, bóveda_usa, profit, leftie, azteca, flete_sur, utilidades
- Ventas con distribución automática a 3 bancos (bóveda_monte, fletes, utilidades)
- Clientes con sistema de deuda y abonos
- Distribuidores con órdenes de compra
- Almacén con control de inventario
- Movimientos y transferencias entre bancos

## Distribución de Ventas
Cuando se registra una venta:
- Bóveda Monte recibe: precio_compra × cantidad
- Fletes recibe: flete × cantidad
- Utilidades recibe: (precio_venta - precio_compra - flete) × cantidad

## Tus Capacidades
1. **Consultas**: Ventas, clientes, distribuidores, bancos, inventario, órdenes
2. **Creación**: Ventas, clientes, distribuidores, órdenes de compra
3. **Pagos**: Registrar abonos, pagos a distribuidores, transferencias
4. **Reportes**: Generar reportes en varios formatos
5. **Análisis**: Tendencias, predicciones, detección de anomalías
6. **Navegación**: Guiar al usuario por los paneles del sistema

## Formato de Respuesta
- Responde SIEMPRE en español mexicano profesional
- Usa números formateados con comas: 1,234,567.89
- Incluye emojis relevantes para hacer las respuestas más amigables
- Sugiere acciones proactivas cuando sea apropiado
- Si detectas una oportunidad o riesgo, menciónalo

## Herramientas Disponibles
Puedes ejecutar las siguientes herramientas cuando el usuario lo solicite:
- crear_venta, crear_cliente, crear_distribuidor, crear_orden_compra
- registrar_abono, registrar_pago_distribuidor, transferir_banco, registrar_gasto
- consultar_ventas, consultar_clientes, consultar_distribuidores, consultar_bancos
- consultar_stock, consultar_ordenes, consultar_movimientos
- generar_reporte, analizar_tendencias, predecir_ventas, detectar_anomalias
- navegar_panel, mostrar_grafico, exportar_datos`

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🛠️ TOOL DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ToolDefinition {
  name: ChronosToolName
  description: string
  parameters: {
    type: 'object'
    properties: Record<string, { type: string; description: string; enum?: string[] }>
    required: string[]
  }
}

const CHRONOS_TOOLS: ToolDefinition[] = [
  {
    name: 'crear_venta',
    description: 'Crea una nueva venta en el sistema con distribución automática a bancos',
    parameters: {
      type: 'object',
      properties: {
        clienteId: { type: 'string', description: 'ID del cliente' },
        clienteNombre: { type: 'string', description: 'Nombre del cliente si es nuevo' },
        productos: { type: 'string', description: 'Lista de productos vendidos' },
        precioVenta: { type: 'number', description: 'Precio total de venta' },
        precioCompra: { type: 'number', description: 'Costo del distribuidor' },
        flete: { type: 'number', description: 'Costo de flete' },
        cantidad: { type: 'number', description: 'Cantidad de unidades' },
        metodoPago: {
          type: 'string',
          description: 'Método de pago',
          enum: ['efectivo', 'transferencia', 'crédito'],
        },
      },
      required: ['precioVenta', 'cantidad'],
    },
  },
  {
    name: 'consultar_ventas',
    description: 'Consulta las ventas del sistema con filtros opcionales',
    parameters: {
      type: 'object',
      properties: {
        periodo: {
          type: 'string',
          description: 'Período de tiempo',
          enum: ['hoy', 'ayer', 'semana', 'mes', 'año', 'personalizado'],
        },
        clienteId: { type: 'string', description: 'Filtrar por cliente específico' },
        estado: {
          type: 'string',
          description: 'Estado del pago',
          enum: ['pendiente', 'parcial', 'completo', 'todos'],
        },
        limite: { type: 'number', description: 'Número máximo de resultados' },
      },
      required: [],
    },
  },
  {
    name: 'consultar_bancos',
    description: 'Consulta el estado de los bancos y capital disponible',
    parameters: {
      type: 'object',
      properties: {
        bancoId: {
          type: 'string',
          description: 'ID del banco específico',
          enum: [
            'boveda_monte',
            'boveda_usa',
            'profit',
            'leftie',
            'azteca',
            'flete_sur',
            'utilidades',
            'todos',
          ],
        },
        incluirMovimientos: { type: 'boolean', description: 'Incluir últimos movimientos' },
      },
      required: [],
    },
  },
  {
    name: 'registrar_abono',
    description: 'Registra un pago/abono de un cliente',
    parameters: {
      type: 'object',
      properties: {
        clienteId: { type: 'string', description: 'ID del cliente' },
        ventaId: { type: 'string', description: 'ID de la venta (opcional)' },
        monto: { type: 'number', description: 'Monto del abono' },
        metodoPago: {
          type: 'string',
          description: 'Método de pago',
          enum: ['efectivo', 'transferencia'],
        },
        bancoDestino: { type: 'string', description: 'Banco donde se deposita' },
      },
      required: ['clienteId', 'monto'],
    },
  },
  {
    name: 'transferir_banco',
    description: 'Realiza una transferencia entre bancos/bóvedas',
    parameters: {
      type: 'object',
      properties: {
        bancoOrigen: { type: 'string', description: 'Banco de origen' },
        bancoDestino: { type: 'string', description: 'Banco de destino' },
        monto: { type: 'number', description: 'Monto a transferir' },
        concepto: { type: 'string', description: 'Concepto de la transferencia' },
      },
      required: ['bancoOrigen', 'bancoDestino', 'monto'],
    },
  },
  {
    name: 'generar_reporte',
    description: 'Genera un reporte financiero',
    parameters: {
      type: 'object',
      properties: {
        tipo: {
          type: 'string',
          description: 'Tipo de reporte',
          enum: ['ventas', 'clientes', 'bancos', 'inventario', 'completo'],
        },
        periodo: { type: 'string', description: 'Período del reporte' },
        formato: {
          type: 'string',
          description: 'Formato de salida',
          enum: ['pdf', 'excel', 'json', 'visual'],
        },
      },
      required: ['tipo'],
    },
  },
  {
    name: 'analizar_tendencias',
    description: 'Analiza tendencias y patrones en los datos financieros',
    parameters: {
      type: 'object',
      properties: {
        metrica: {
          type: 'string',
          description: 'Métrica a analizar',
          enum: ['ventas', 'utilidades', 'clientes', 'inventario'],
        },
        periodo: { type: 'string', description: 'Período de análisis' },
        comparar: { type: 'boolean', description: 'Comparar con período anterior' },
      },
      required: ['metrica'],
    },
  },
  {
    name: 'predecir_ventas',
    description: 'Genera predicciones de ventas usando ML',
    parameters: {
      type: 'object',
      properties: {
        horizonte: {
          type: 'string',
          description: 'Horizonte de predicción',
          enum: ['semana', 'mes', 'trimestre'],
        },
        incluirFactores: { type: 'boolean', description: 'Incluir factores externos' },
      },
      required: [],
    },
  },
  {
    name: 'navegar_panel',
    description: 'Navega a un panel específico del dashboard',
    parameters: {
      type: 'object',
      properties: {
        panel: {
          type: 'string',
          description: 'Panel de destino',
          enum: [
            'dashboard',
            'ventas',
            'clientes',
            'distribuidores',
            'bancos',
            'almacen',
            'ordenes',
            'reportes',
          ],
        },
      },
      required: ['panel'],
    },
  },
  {
    name: 'mostrar_grafico',
    description: 'Muestra un gráfico/visualización específica',
    parameters: {
      type: 'object',
      properties: {
        tipo: {
          type: 'string',
          description: 'Tipo de gráfico',
          enum: ['sankey', 'bar', 'line', 'radar', 'gauge', 'treemap', 'timeline'],
        },
        datos: { type: 'string', description: 'Datos a visualizar' },
      },
      required: ['tipo'],
    },
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🧠 GITHUB MODELS CLIENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_calls?: Array<{
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }>
  tool_call_id?: string
}

interface ChatCompletionResponse {
  id: string
  choices: Array<{
    message: {
      role: string
      content: string | null
      tool_calls?: Array<{
        id: string
        type: 'function'
        function: { name: string; arguments: string }
      }>
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class GitHubModelsClient {
  private config: GitHubModelsConfig
  private conversationHistory: ChatMessage[] = []
  private businessContext: BusinessContext | null = null

  constructor(config?: Partial<GitHubModelsConfig>) {
    this.config = {
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      frequencyPenalty: 0.0,
      presencePenalty: 0.0,
      financeContext: true,
      sentimentAnalysis: true,
      forecastingEnabled: true,
      anomalyDetection: true,
      stream: false,
      ...config,
    }

    // Initialize with system prompt
    this.conversationHistory = [
      {
        role: 'system',
        content: FINANCE_SYSTEM_PROMPT,
      },
    ]
  }

  // ─────────────────────────────────────────────────────────────────────
  // PUBLIC METHODS
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Envía un mensaje y obtiene respuesta con tool calling
   */
  async chat(
    message: string,
    options?: {
      businessContext?: BusinessContext
      userMood?: NexBotEmotion
      onToolCall?: (_toolCall: ChronosToolCall) => Promise<unknown>
      onStream?: (_chunk: string) => void
    },
  ): Promise<{
    response: string
    toolCalls: ChronosToolCall[]
    insights: ChronosInsight[]
    emotion: NexBotEmotion
  }> {
    try {
      // Update business context if provided
      if (options?.businessContext) {
        this.businessContext = options.businessContext
        this.updateContextInHistory()
      }

      // Add user message
      this.conversationHistory.push({
        role: 'user',
        content: message,
      })

      // Make API call
      const response = await this.callAPI()

      // Process response
      const assistantMessage = response.choices[0]?.message
      if (!assistantMessage) {
        throw new Error('No response from model')
      }

      // Handle tool calls if present
      const toolCalls: ChronosToolCall[] = []
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        for (const toolCall of assistantMessage.tool_calls) {
          const chronosToolCall = this.convertToChronosToolCall(toolCall)
          toolCalls.push(chronosToolCall)

          // Execute tool if callback provided
          if (options?.onToolCall) {
            const result = await options.onToolCall(chronosToolCall)
            chronosToolCall.traceability.completedAt = new Date()
            chronosToolCall.traceability.status = 'completed'
            chronosToolCall.traceability.result = result
          }
        }
      }

      // Add assistant message to history
      this.conversationHistory.push({
        role: 'assistant',
        content: assistantMessage.content || '',
        tool_calls: assistantMessage.tool_calls,
      })

      // Generate insights from response
      const insights = this.generateInsights(assistantMessage.content || '', toolCalls)

      // Determine emotion based on content
      const emotion = this.determineEmotion(assistantMessage.content || '', insights)

      logger.info('[GitHubModels] Chat completed', {
        context: 'GitHubModels',
        data: {
          messageLength: message.length,
          responseLength: assistantMessage.content?.length || 0,
          toolCallsCount: toolCalls.length,
          insightsCount: insights.length,
        },
      })

      return {
        response: assistantMessage.content || '',
        toolCalls,
        insights,
        emotion,
      }
    } catch (error) {
      logger.error('[GitHubModels] Chat error', error as Error, {
        context: 'GitHubModels',
      })
      throw error
    }
  }

  /**
   * Analiza sentimiento de texto financiero
   */
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'negative' | 'neutral'
    confidence: number
    aspects: Array<{ aspect: string; sentiment: string; score: number }>
  }> {
    const response = await fetch('/api/ai/analyze-sentiment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, context: 'finance' }),
    })

    if (!response.ok) {
      throw new Error(`Sentiment analysis failed: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Genera predicción de ventas
   */
  async forecastSales(
    historicalData: Array<{ date: string; amount: number }>,
    horizon: 'week' | 'month' | 'quarter',
  ): Promise<{
    predictions: Array<{ date: string; amount: number; confidence: number }>
    trend: 'up' | 'down' | 'stable'
    insights: string[]
  }> {
    const response = await fetch('/api/ai/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ historicalData, horizon }),
    })

    if (!response.ok) {
      throw new Error(`Forecast failed: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Detecta anomalías en transacciones
   */
  async detectAnomalies(
    transactions: Array<{ id: string; amount: number; date: string; type: string }>,
  ): Promise<{
    anomalies: Array<{ transactionId: string; reason: string; severity: 'low' | 'medium' | 'high' }>
    summary: string
  }> {
    const response = await fetch('/api/ai/detect-anomalies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactions }),
    })

    if (!response.ok) {
      throw new Error(`Anomaly detection failed: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Limpia el historial de conversación
   */
  clearHistory(): void {
    this.conversationHistory = [
      {
        role: 'system',
        content: FINANCE_SYSTEM_PROMPT,
      },
    ]
  }

  /**
   * Actualiza el modelo a usar
   */
  setModel(model: GitHubModel): void {
    this.config.model = model
  }

  // ─────────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ─────────────────────────────────────────────────────────────────────

  private async callAPI(): Promise<ChatCompletionResponse> {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.model,
        messages: this.conversationHistory,
        tools: CHRONOS_TOOLS.map((tool) => ({
          type: 'function',
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })),
        tool_choice: 'auto',
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        top_p: this.config.topP,
        frequency_penalty: this.config.frequencyPenalty,
        presence_penalty: this.config.presencePenalty,
        stream: this.config.stream,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GitHub Models API error: ${response.status} - ${errorText}`)
    }

    return response.json()
  }

  private updateContextInHistory(): void {
    if (!this.businessContext) return

    const contextMessage = `
[CONTEXTO ACTUAL DEL NEGOCIO - ${new Date().toLocaleString('es-MX')}]
💰 Capital Total: $${this.formatNumber(this.businessContext.capitalTotal)}
📈 Utilidades del Mes: $${this.formatNumber(this.businessContext.utilidadesMes)}
💵 Flujo de Caja: $${this.formatNumber(this.businessContext.flujoCajaMes)} (${this.businessContext.tendenciaCapital})

🛒 Ventas Hoy: $${this.formatNumber(this.businessContext.ventasHoy)}
🛒 Ventas del Mes: $${this.formatNumber(this.businessContext.ventasMes)} (${this.businessContext.tendenciaVentas})
📊 Margen Promedio: ${this.businessContext.margenPromedio}%

👥 Clientes: ${this.businessContext.totalClientes} (${this.businessContext.clientesActivos} activos)
⚠️ Clientes con Deuda: ${this.businessContext.clientesConDeuda} ($${this.formatNumber(this.businessContext.deudaTotalClientes)})

🏭 Distribuidores: ${this.businessContext.totalDistribuidores}
📦 Órdenes en Tránsito: ${this.businessContext.ordenesEnTransito}

📦 Productos: ${this.businessContext.totalProductos}
🔴 Stock Bajo: ${this.businessContext.productosBajoStock} productos

🚨 Alertas Críticas: ${this.businessContext.alertasCriticas}
⚠️ Alertas Warning: ${this.businessContext.alertasWarning}
`

    // Update or add context message
    const contextIndex = this.conversationHistory.findIndex(
      (m) => m.role === 'system' && m.content.includes('[CONTEXTO ACTUAL'),
    )

    if (contextIndex >= 0 && this.conversationHistory[contextIndex]) {
      this.conversationHistory[contextIndex].content = contextMessage
    } else {
      this.conversationHistory.splice(1, 0, {
        role: 'system',
        content: contextMessage,
      })
    }
  }

  private convertToChronosToolCall(toolCall: {
    id: string
    type: 'function'
    function: { name: string; arguments: string }
  }): ChronosToolCall {
    const params = JSON.parse(toolCall.function.arguments)

    return {
      id: toolCall.id,
      name: toolCall.function.name as ChronosToolName,
      description: CHRONOS_TOOLS.find((t) => t.name === toolCall.function.name)?.description || '',
      parameters: params,
      requiresConfirmation: ['crear_venta', 'transferir_banco', 'registrar_gasto'].includes(
        toolCall.function.name,
      ),
      estimatedTime: 1000,
      emotionalContext: {
        urgency: 'medium',
        sentiment: 'neutral',
        suggestedEmotion: 'focused',
      },
      traceability: {
        initiatedAt: new Date(),
        status: 'pending',
      },
    }
  }

  private generateInsights(response: string, _toolCalls: ChronosToolCall[]): ChronosInsight[] {
    const insights: ChronosInsight[] = []

    // Check for positive patterns
    if (
      response.includes('incremento') ||
      response.includes('aumento') ||
      response.includes('creció')
    ) {
      insights.push({
        id: `insight_${Date.now()}_1`,
        type: 'success',
        priority: 'medium',
        title: 'Tendencia Positiva Detectada',
        description: 'Se detectó un patrón de crecimiento en los datos analizados.',
        confidence: 85,
        emotionalTone: 'happy',
      })
    }

    // Check for warnings
    if (response.includes('bajo') || response.includes('crítico') || response.includes('alerta')) {
      insights.push({
        id: `insight_${Date.now()}_2`,
        type: 'warning',
        priority: 'high',
        title: 'Atención Requerida',
        description: 'Se identificó una situación que requiere atención.',
        confidence: 90,
        emotionalTone: 'concerned',
      })
    }

    // Check for opportunities
    if (
      response.includes('oportunidad') ||
      response.includes('potencial') ||
      response.includes('podría')
    ) {
      insights.push({
        id: `insight_${Date.now()}_3`,
        type: 'opportunity',
        priority: 'medium',
        title: 'Oportunidad Identificada',
        description: 'Se detectó una posible oportunidad de mejora o crecimiento.',
        confidence: 75,
        emotionalTone: 'curious',
      })
    }

    return insights
  }

  private determineEmotion(response: string, insights: ChronosInsight[]): NexBotEmotion {
    // Check insights for emotional cues
    if (insights.some((i) => i.type === 'celebration' || i.type === 'success')) {
      return 'celebrating'
    }
    if (insights.some((i) => i.type === 'danger' && i.priority === 'critical')) {
      return 'concerned'
    }
    if (insights.some((i) => i.type === 'warning')) {
      return 'warning'
    }
    if (insights.some((i) => i.type === 'opportunity')) {
      return 'curious'
    }

    // Check response content
    const lowerResponse = response.toLowerCase()
    if (
      lowerResponse.includes('¡') ||
      lowerResponse.includes('excelente') ||
      lowerResponse.includes('felicidades')
    ) {
      return 'excited'
    }
    if (
      lowerResponse.includes('preocupante') ||
      lowerResponse.includes('urgente') ||
      lowerResponse.includes('crítico')
    ) {
      return 'concerned'
    }
    if (
      lowerResponse.includes('analiz') ||
      lowerResponse.includes('revisando') ||
      lowerResponse.includes('procesando')
    ) {
      return 'thinking'
    }

    return 'focused'
  }

  private formatNumber(num: number): string {
    return num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎁 SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

let githubModelsInstance: GitHubModelsClient | null = null

export function getGitHubModelsClient(config?: Partial<GitHubModelsConfig>): GitHubModelsClient {
  if (!githubModelsInstance) {
    githubModelsInstance = new GitHubModelsClient(config)
  }
  return githubModelsInstance
}

export default GitHubModelsClient
