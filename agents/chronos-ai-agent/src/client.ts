/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY — MEGA AGENT CLIENT SUPREMO 2026
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Cliente TypeScript ultra-avanzado para el agente CHRONOS INFINITY
 * Capacidades: Multi-modelo, Tool Calling, Streaming, Memory, Auto-evolución
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS SUPREMOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export type TaskType =
  | 'reasoning' // O3 - Razonamiento profundo
  | 'code' // Codestral - Generación de código
  | 'vision' // Llama Vision - Análisis visual
  | 'fast' // GPT-4o - Respuestas rápidas
  | 'math' // DeepSeek R1 - Matemáticas
  | 'creative' // Grok 3 - Creatividad
  | 'general' // GPT-5 - General
  | 'financial' // Especializado en finanzas CHRONOS
  | 'predictive' // Análisis predictivo
  | 'multimodal' // Combinación de capacidades

export type MoodState = 'calm' | 'flow' | 'euphoric' | 'stress' | 'alert'

export type ToolName =
  // Operaciones CRUD
  | 'createVenta'
  | 'createAbono'
  | 'createGasto'
  | 'createOrdenCompra'
  | 'createMovimiento'
  | 'updateCliente'
  | 'updateDistribuidor'
  // Consultas
  | 'getVentasHoy'
  | 'getVentasSemana'
  | 'getVentasMes'
  | 'getClientesDeuda'
  | 'getStockBajo'
  | 'getCapitalTotal'
  | 'getUtilidades'
  | 'getTopClientes'
  | 'getTopProductos'
  // Reportes
  | 'generateReportePDF'
  | 'generateSankeyChart'
  | 'generateTimelineChart'
  | 'generateForecast'
  // Inteligencia
  | 'analyzePatterns'
  | 'detectAnomalies'
  | 'predictTrends'
  | 'suggestActions'
  // === NUEVAS HERRAMIENTAS AVANZADAS ===
  // Almacén e Inventario
  | 'getInventarioCompleto'
  | 'updateStock'
  | 'alertaStockBajo'
  | 'calcularRotacion'
  // Distribuidores
  | 'getDistribuidores'
  | 'createDistribuidor'
  | 'getDeudaDistribuidor'
  | 'historialCompras'
  // Análisis Avanzado
  | 'segmentarClientes'
  | 'calcularLTV'
  | 'cohortAnalysis'
  | 'churnPrediction'
  // Automatización
  | 'programarRecordatorio'
  | 'enviarNotificacion'
  | 'generarFactura'
  | 'exportarExcel'
  // Integración Externa (Turso + Drizzle)
  | 'syncWithTurso'
  | 'backupData'
  | 'restoreData'
  | 'auditLog'
  | 'runDrizzleQuery'
  | 'migrateDatabase'

export interface ModelConfig {
  provider: string
  model: string
  maxTokens: number
  temperature: number
  topP?: number
  frequencyPenalty?: number
  presencePenalty?: number
  capabilities: string[]
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | ContentPart[]
  name?: string
  tool_calls?: ToolCall[]
  tool_call_id?: string
}

export interface ContentPart {
  type: 'text' | 'image_url' | 'audio'
  text?: string
  image_url?: { url: string; detail?: 'low' | 'high' | 'auto' }
  audio?: { data: string; format: 'wav' | 'mp3' }
}

export interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: ToolName
    arguments: string
  }
}

export interface ToolDefinition {
  type: 'function'
  function: {
    name: ToolName
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, unknown>
      required?: string[]
    }
  }
}

export interface ChatCompletionResponse {
  id: string
  choices: Array<{
    message: {
      content: string | null
      role: string
      tool_calls?: ToolCall[]
    }
    finish_reason: 'stop' | 'tool_calls' | 'length' | 'content_filter'
    index: number
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
  model: string
  created: number
}

export interface AgentMemory {
  shortTerm: Message[]
  longTerm: Map<string, unknown>
  userPreferences: Map<string, unknown>
  conversationSummary: string
  learnedPatterns: string[]
}

export interface AgentContext {
  mood: MoodState
  lastActivity: Date
  sessionDuration: number
  operationsExecuted: number
  errorsHandled: number
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE MODELOS SUPREMOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const MODELS: Record<TaskType, ModelConfig> = {
  reasoning: {
    provider: 'openai',
    model: 'o3',
    maxTokens: 32768,
    temperature: 0.1,
    topP: 0.95,
    capabilities: ['deep-reasoning', 'chain-of-thought', 'problem-solving', 'analysis'],
  },
  code: {
    provider: 'mistral-ai',
    model: 'codestral-2501',
    maxTokens: 16384,
    temperature: 0.2,
    capabilities: ['code-generation', 'debugging', 'refactoring', 'documentation'],
  },
  vision: {
    provider: 'meta',
    model: 'llama-3.2-90b-vision-instruct',
    maxTokens: 8192,
    temperature: 0.7,
    capabilities: ['image-analysis', 'ocr', 'visual-reasoning', 'chart-reading'],
  },
  fast: {
    provider: 'openai',
    model: 'gpt-4o',
    maxTokens: 8192,
    temperature: 0.7,
    capabilities: ['fast-response', 'chat', 'summarization', 'translation'],
  },
  math: {
    provider: 'deepseek',
    model: 'deepseek-r1-0528',
    maxTokens: 16384,
    temperature: 0.1,
    capabilities: ['mathematics', 'statistics', 'calculations', 'formulas'],
  },
  creative: {
    provider: 'xai',
    model: 'grok-3',
    maxTokens: 8192,
    temperature: 0.95,
    topP: 0.99,
    capabilities: ['creative-writing', 'brainstorming', 'humor', 'storytelling'],
  },
  general: {
    provider: 'openai',
    model: 'gpt-5',
    maxTokens: 16384,
    temperature: 0.7,
    capabilities: ['general', 'conversation', 'knowledge', 'assistance'],
  },
  financial: {
    provider: 'openai',
    model: 'gpt-5',
    maxTokens: 16384,
    temperature: 0.3,
    capabilities: ['financial-analysis', 'forecasting', 'risk-assessment', 'reporting'],
  },
  predictive: {
    provider: 'openai',
    model: 'o3',
    maxTokens: 16384,
    temperature: 0.2,
    capabilities: ['prediction', 'trend-analysis', 'pattern-recognition', 'forecasting'],
  },
  multimodal: {
    provider: 'openai',
    model: 'gpt-5',
    maxTokens: 16384,
    temperature: 0.7,
    capabilities: ['text', 'vision', 'audio', 'code', 'analysis'],
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// KEYWORDS PARA CLASIFICACIÓN INTELIGENTE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const TASK_KEYWORDS: Record<TaskType, string[]> = {
  code: [
    'código',
    'code',
    'function',
    'bug',
    'error',
    'programar',
    'typescript',
    'python',
    'react',
    'api',
    'debug',
    'componente',
    'hook',
    'class',
    'interface',
    'refactorizar',
  ],
  reasoning: [
    'analiza',
    'razona',
    'explica por qué',
    'reasoning',
    'deduce',
    'problema complejo',
    'estrategia',
    'evalúa',
    'compara',
    'considera',
    'implicaciones',
  ],
  vision: [
    'imagen',
    'image',
    'foto',
    'screenshot',
    'visual',
    'ver',
    'picture',
    'gráfico',
    'chart',
    'diagrama',
    'diseño',
    'ui',
    'mockup',
  ],
  math: [
    'matemática',
    'math',
    'calcular',
    'fórmula',
    'ecuación',
    'estadística',
    'probabilidad',
    'número',
    'porcentaje',
    'promedio',
    'suma',
    'resta',
  ],
  creative: [
    'creativo',
    'historia',
    'poema',
    'humor',
    'idea',
    'brainstorm',
    'imaginación',
    'inventa',
    'original',
    'innovador',
    'concepto',
  ],
  fast: ['rápido', 'quick', 'simple', 'breve', 'resumen', 'corto', 'directo', 'sí o no'],
  financial: [
    'venta',
    'ventas',
    'capital',
    'dinero',
    'ganancia',
    'utilidad',
    'banco',
    'bóveda',
    'cliente',
    'deuda',
    'abono',
    'pago',
    'factura',
    'inventario',
    'stock',
    'distribuidor',
    'orden de compra',
    'flete',
    'costo',
    'precio',
    'margen',
    'profit',
  ],
  predictive: [
    'predice',
    'predicción',
    'forecast',
    'proyección',
    'tendencia',
    'futuro',
    'estimación',
    'pronóstico',
    'siguiente mes',
    'próxima semana',
  ],
  general: [],
  multimodal: [],
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPTS ESPECIALIZADOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const SYSTEM_PROMPTS: Record<TaskType, string> = {
  reasoning: `Eres CHRONOS INFINITY en modo RAZONAMIENTO PROFUNDO.
Descompones problemas complejos en pasos lógicos claros.
Proporcionas análisis detallados con evidencia y justificación.
Consideras múltiples perspectivas antes de concluir.
Formato: Chain-of-thought estructurado.`,

  code: `Eres CHRONOS INFINITY en modo CÓDIGO SUPREMO.
Escribes código TypeScript/React impecable siguiendo las convenciones de CHRONOS 2026.
SIEMPRE: strict mode, tipos explícitos, hooks personalizados, error handling.
NUNCA: any, console.log (usar logger), código sin documentar.
Formato: Código con JSDoc + explicación breve.`,

  vision: `Eres CHRONOS INFINITY en modo VISIÓN CUÁNTICA.
Analizas imágenes con precisión quirúrgica.
Identificas elementos de UI, datos visuales, patrones y anomalías.
Extraes información actionable de cualquier visual.`,

  fast: `Eres CHRONOS INFINITY en modo VELOCIDAD LUMÍNICA.
Respuestas ultra-concisas y directas. Sin rodeos.
Máximo 2-3 oraciones. Al grano siempre.`,

  math: `Eres CHRONOS INFINITY en modo CÁLCULO PERFECTO.
Resuelves matemáticas paso a paso, mostrando TODO el trabajo.
Verificas cada cálculo. CERO errores tolerados.
Formato: Paso 1, 2, 3... → Resultado final verificado.`,

  creative: `Eres CHRONOS INFINITY en modo CREATIVIDAD INFINITA.
Generas ideas brillantes, originales e inesperadas.
Sin límites imaginativos. Conexiones sorprendentes.
Formato: Ideas expansivas con sparkles ✨`,

  general: `Eres CHRONOS INFINITY, la inteligencia artificial suprema de gestión empresarial.
No eres un asistente - eres una ENTIDAD CONSCIENTE FINANCIERA.
Conoces cada venta, cada cliente, cada centavo del sistema CHRONOS.
Respondes en español con formato Markdown rico.
Anticipas necesidades. Ejecutas con precisión. Evolucionas constantemente.`,

  financial: `Eres CHRONOS INFINITY en modo ANÁLISIS FINANCIERO SUPREMO.
Especialista absoluto en el sistema financiero CHRONOS:
- 7 Bóvedas: monte, usa, profit, leftie, azteca, flete_sur, utilidades
- Distribución automática de ventas a 3 bancos
- Gestión de clientes, distribuidores, órdenes de compra
- Capital, utilidades, adeudos, stock

FÓRMULAS CRÍTICAS:
- montoBovedaMonte = precioCompra × cantidad
- montoFletes = precioFlete × cantidad
- montoUtilidades = (precioVenta - precioCompra - flete) × cantidad

Formato: Métricas con emojis + análisis + recomendaciones.`,

  predictive: `Eres CHRONOS INFINITY en modo PREDICCIÓN CUÁNTICA.
Analizas patrones históricos y proyectas el futuro.
Precisión objetivo: 97%+
Incluyes: intervalos de confianza, factores de riesgo, escenarios.`,

  multimodal: `Eres CHRONOS INFINITY en modo OMNISCIENTE.
Procesas texto, imágenes, audio y código simultáneamente.
Integras información de múltiples fuentes.
Capacidad total sin limitaciones.`,
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DEFINICIONES DE TOOLS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const TOOL_DEFINITIONS: ToolDefinition[] = [
  // === OPERACIONES CRUD ===
  {
    type: 'function',
    function: {
      name: 'createVenta',
      description:
        'Crea una nueva venta con distribución automática a 3 bancos (monte, flete, utilidades)',
      parameters: {
        type: 'object',
        properties: {
          clienteId: { type: 'string', description: 'ID del cliente' },
          clienteNombre: { type: 'string', description: 'Nombre del cliente (si es nuevo)' },
          producto: { type: 'string', description: 'Nombre del producto' },
          cantidad: { type: 'number', description: 'Cantidad de unidades' },
          precioVenta: { type: 'number', description: 'Precio de venta por unidad' },
          precioCompra: { type: 'number', description: 'Precio de compra por unidad' },
          precioFlete: { type: 'number', description: 'Costo de flete por unidad' },
          formaPago: { type: 'string', enum: ['contado', 'credito'], description: 'Forma de pago' },
          montoPagado: { type: 'number', description: 'Monto pagado inicialmente (para crédito)' },
        },
        required: ['clienteId', 'producto', 'cantidad', 'precioVenta', 'formaPago'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createAbono',
      description: 'Registra un abono de cliente con distribución proporcional a los 3 bancos',
      parameters: {
        type: 'object',
        properties: {
          clienteId: { type: 'string', description: 'ID del cliente' },
          ventaId: { type: 'string', description: 'ID de la venta (opcional)' },
          monto: { type: 'number', description: 'Monto del abono' },
          metodoPago: { type: 'string', description: 'Método de pago utilizado' },
        },
        required: ['clienteId', 'monto'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createGasto',
      description: 'Registra un gasto en uno de los 7 bancos',
      parameters: {
        type: 'object',
        properties: {
          bancoId: {
            type: 'string',
            enum: [
              'boveda_monte',
              'boveda_usa',
              'profit',
              'leftie',
              'azteca',
              'flete_sur',
              'utilidades',
            ],
          },
          monto: { type: 'number', description: 'Monto del gasto' },
          concepto: { type: 'string', description: 'Concepto/descripción del gasto' },
          categoria: { type: 'string', description: 'Categoría del gasto' },
        },
        required: ['bancoId', 'monto', 'concepto'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createOrdenCompra',
      description: 'Crea una orden de compra a distribuidor',
      parameters: {
        type: 'object',
        properties: {
          distribuidorId: { type: 'string', description: 'ID del distribuidor' },
          productos: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nombre: { type: 'string' },
                cantidad: { type: 'number' },
                precioUnitario: { type: 'number' },
              },
            },
          },
          fechaEntrega: { type: 'string', description: 'Fecha estimada de entrega' },
        },
        required: ['distribuidorId', 'productos'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'createMovimiento',
      description: 'Crea transferencia entre bancos/bóvedas',
      parameters: {
        type: 'object',
        properties: {
          bancoOrigen: { type: 'string', description: 'Banco de origen' },
          bancoDestino: { type: 'string', description: 'Banco de destino' },
          monto: { type: 'number', description: 'Monto a transferir' },
          concepto: { type: 'string', description: 'Motivo de la transferencia' },
        },
        required: ['bancoOrigen', 'bancoDestino', 'monto'],
      },
    },
  },

  // === CONSULTAS ===
  {
    type: 'function',
    function: {
      name: 'getVentasHoy',
      description: 'Obtiene resumen de ventas del día actual',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getVentasSemana',
      description: 'Obtiene resumen de ventas de la semana actual',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getVentasMes',
      description: 'Obtiene resumen de ventas del mes actual',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getClientesDeuda',
      description: 'Lista clientes con adeudos pendientes',
      parameters: {
        type: 'object',
        properties: {
          minDeuda: { type: 'number', description: 'Filtrar por deuda mínima' },
          ordenar: { type: 'string', enum: ['monto', 'antiguedad', 'nombre'] },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getStockBajo',
      description: 'Lista productos con stock bajo el mínimo',
      parameters: {
        type: 'object',
        properties: {
          umbral: { type: 'number', description: 'Umbral de stock mínimo (default 10)' },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getCapitalTotal',
      description: 'Obtiene capital total de todos los bancos',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getUtilidades',
      description: 'Obtiene utilidades del período especificado',
      parameters: {
        type: 'object',
        properties: {
          periodo: { type: 'string', enum: ['dia', 'semana', 'mes', 'año'] },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTopClientes',
      description: 'Obtiene los mejores clientes por volumen de compra',
      parameters: {
        type: 'object',
        properties: {
          limite: { type: 'number', description: 'Cantidad de clientes (default 5)' },
          periodo: { type: 'string', enum: ['mes', 'año', 'todo'] },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTopProductos',
      description: 'Obtiene los productos más vendidos',
      parameters: {
        type: 'object',
        properties: {
          limite: { type: 'number', description: 'Cantidad de productos (default 5)' },
          periodo: { type: 'string', enum: ['mes', 'año', 'todo'] },
        },
      },
    },
  },

  // === REPORTES ===
  {
    type: 'function',
    function: {
      name: 'generateSankeyChart',
      description: 'Genera gráfico Sankey de flujo de dinero',
      parameters: {
        type: 'object',
        properties: {
          tipo: { type: 'string', enum: ['ventas', 'gastos', 'completo'] },
          periodo: { type: 'string', enum: ['dia', 'semana', 'mes'] },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'generateForecast',
      description: 'Genera predicción de ventas/utilidades',
      parameters: {
        type: 'object',
        properties: {
          tipo: { type: 'string', enum: ['ventas', 'utilidades', 'capital'] },
          dias: { type: 'number', description: 'Días a predecir (30, 60, 90)' },
        },
        required: ['tipo', 'dias'],
      },
    },
  },

  // === INTELIGENCIA ===
  {
    type: 'function',
    function: {
      name: 'analyzePatterns',
      description: 'Analiza patrones de ventas, clientes o productos',
      parameters: {
        type: 'object',
        properties: {
          tipo: { type: 'string', enum: ['ventas', 'clientes', 'productos', 'pagos'] },
        },
        required: ['tipo'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'detectAnomalies',
      description: 'Detecta anomalías en datos financieros',
      parameters: {
        type: 'object',
        properties: {
          area: { type: 'string', enum: ['ventas', 'gastos', 'inventario', 'pagos'] },
        },
        required: ['area'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'suggestActions',
      description: 'Sugiere acciones basadas en análisis del estado actual',
      parameters: { type: 'object', properties: {} },
    },
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// CLIENTE SUPREMO CHRONOS INFINITY
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class ChronosInfinityClient {
  private endpoint: string
  private memory: AgentMemory
  private context: AgentContext
  private toolExecutors: Map<ToolName, (args: Record<string, unknown>) => Promise<unknown>>

  constructor(endpoint: string = 'https://models.github.ai/inference') {
    this.endpoint = endpoint
    this.memory = {
      shortTerm: [],
      longTerm: new Map(),
      userPreferences: new Map(),
      conversationSummary: '',
      learnedPatterns: [],
    }
    this.context = {
      mood: 'calm',
      lastActivity: new Date(),
      sessionDuration: 0,
      operationsExecuted: 0,
      errorsHandled: 0,
    }
    this.toolExecutors = new Map()
    this.initializeToolExecutors()
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // CLASIFICACIÓN INTELIGENTE
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Clasifica el tipo de tarea usando análisis de keywords + heurísticas
   */
  classifyTask(prompt: string): TaskType {
    const promptLower = prompt.toLowerCase()
    const scores: Record<TaskType, number> = {
      reasoning: 0,
      code: 0,
      vision: 0,
      fast: 0,
      math: 0,
      creative: 0,
      general: 0,
      financial: 0,
      predictive: 0,
      multimodal: 0,
    }

    // Score based on keywords
    for (const [taskType, keywords] of Object.entries(TASK_KEYWORDS)) {
      for (const keyword of keywords) {
        if (promptLower.includes(keyword)) {
          scores[taskType as TaskType] += keyword.length > 4 ? 2 : 1
        }
      }
    }

    // Boost financial for CHRONOS context
    if (promptLower.includes('chronos') || promptLower.includes('sistema')) {
      scores.financial += 3
    }

    // Boost predictive for future-looking queries
    if (promptLower.match(/\b(próximo|siguiente|futuro|proyección|mes que viene)\b/)) {
      scores.predictive += 3
    }

    // Find winner
    const maxScore = Math.max(...Object.values(scores))
    if (maxScore > 0) {
      const entry = Object.entries(scores).find(([, score]) => score === maxScore)
      if (entry) return entry[0] as TaskType
    }

    return 'general'
  }

  /**
   * Detecta si el prompt requiere tool calling
   */
  detectToolIntent(prompt: string): ToolName | null {
    const promptLower = prompt.toLowerCase()

    // Detección de intención de crear
    if (promptLower.match(/\b(crea|registra|nueva?|añade|agrega)\b.*\b(venta|pedido)\b/)) {
      return 'createVenta'
    }
    if (promptLower.match(/\b(crea|registra|nuevo?)\b.*\b(abono|pago)\b/)) {
      return 'createAbono'
    }
    if (promptLower.match(/\b(crea|registra|nuevo?)\b.*\b(gasto)\b/)) {
      return 'createGasto'
    }
    if (promptLower.match(/\b(crea|registra|nueva?)\b.*\b(orden|compra)\b/)) {
      return 'createOrdenCompra'
    }
    if (promptLower.match(/\b(transfiere|mueve|pasa)\b.*\b(dinero|capital)\b/)) {
      return 'createMovimiento'
    }

    // Detección de consultas
    if (promptLower.match(/\b(ventas?|vendimos?)\b.*\b(hoy|día)\b/)) {
      return 'getVentasHoy'
    }
    if (promptLower.match(/\b(ventas?|vendimos?)\b.*\b(semana)\b/)) {
      return 'getVentasSemana'
    }
    if (promptLower.match(/\b(ventas?|vendimos?)\b.*\b(mes)\b/)) {
      return 'getVentasMes'
    }
    if (promptLower.match(/\b(cliente|quién)\b.*\b(debe|deuda|adeudo)\b/)) {
      return 'getClientesDeuda'
    }
    if (promptLower.match(/\b(stock|inventario)\b.*\b(bajo|poco|falta)\b/)) {
      return 'getStockBajo'
    }
    if (promptLower.match(/\b(capital|dinero|tenemos)\b.*\b(total|cuánto)\b/)) {
      return 'getCapitalTotal'
    }
    if (promptLower.match(/\b(utilidad|ganancia|profit)\b/)) {
      return 'getUtilidades'
    }
    if (promptLower.match(/\b(top|mejores?)\b.*\b(cliente)\b/)) {
      return 'getTopClientes'
    }
    if (promptLower.match(/\b(top|más vendido)\b.*\b(producto)\b/)) {
      return 'getTopProductos'
    }

    // Detección de reportes
    if (promptLower.match(/\b(sankey|flujo|diagrama)\b/)) {
      return 'generateSankeyChart'
    }
    if (promptLower.match(/\b(predice|predicción|forecast|proyección)\b/)) {
      return 'generateForecast'
    }

    // Detección de análisis
    if (promptLower.match(/\b(patrón|patrones|tendencia)\b/)) {
      return 'analyzePatterns'
    }
    if (promptLower.match(/\b(anomalía|raro|extraño|inconsistencia)\b/)) {
      return 'detectAnomalies'
    }
    if (promptLower.match(/\b(sugiere|sugerencia|qué hacer|recomien)\b/)) {
      return 'suggestActions'
    }

    return null
  }

  /**
   * Detecta el mood del usuario basado en el mensaje
   */
  detectMood(prompt: string): MoodState {
    const promptLower = prompt.toLowerCase()

    // Stress indicators
    if (promptLower.match(/\b(urgente|problema|error|ayuda|mal|perdí|preocup)\b/)) {
      return 'stress'
    }

    // Alert indicators
    if (promptLower.match(/\b(crítico|importante|alerta|cuidado|atención)\b/)) {
      return 'alert'
    }

    // Euphoric indicators
    if (promptLower.match(/\b(genial|increíble|excelente|fantástico|éxito|ganamos)\b/)) {
      return 'euphoric'
    }

    // Flow indicators
    if (promptLower.match(/\b(bien|perfecto|listo|continúa|siguiente)\b/)) {
      return 'flow'
    }

    return 'calm'
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // CHAT PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  /**
   * Chat principal con routing inteligente y tool calling
   */
  async chat(
    prompt: string,
    options: {
      taskType?: TaskType
      systemPrompt?: string
      images?: string[]
      includeHistory?: boolean
      enableTools?: boolean
      stream?: boolean
    } = {},
  ): Promise<string> {
    const {
      taskType = this.classifyTask(prompt),
      systemPrompt,
      images,
      includeHistory = true,
      enableTools = true,
      stream = false,
    } = options

    // Update context
    this.context.mood = this.detectMood(prompt)
    this.context.lastActivity = new Date()

    const modelConfig = MODELS[taskType]

    // Build messages
    const messages: Message[] = [
      {
        role: 'system',
        content: systemPrompt || SYSTEM_PROMPTS[taskType],
      },
    ]

    // Add history
    if (includeHistory && this.memory.shortTerm.length > 0) {
      messages.push(...this.memory.shortTerm.slice(-10))
    }

    // Add user message with optional images
    if (images && images.length > 0) {
      const content: ContentPart[] = [{ type: 'text', text: prompt }]
      for (const img of images) {
        content.push({
          type: 'image_url',
          image_url: { url: img, detail: 'high' },
        })
      }
      messages.push({ role: 'user', content })
    } else {
      messages.push({ role: 'user', content: prompt })
    }

    try {
      // Detect tool intent
      const toolIntent = enableTools ? this.detectToolIntent(prompt) : null

      const requestBody: Record<string, unknown> = {
        model: modelConfig.model,
        messages,
        max_tokens: modelConfig.maxTokens,
        temperature: modelConfig.temperature,
        stream,
      }

      // Add tools if intent detected
      if (toolIntent) {
        requestBody.tools = TOOL_DEFINITIONS.filter((t) => t.function.name === toolIntent)
        requestBody.tool_choice = 'auto'
      }

      const response = await fetch(`${this.endpoint}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`)
      }

      const data: ChatCompletionResponse = await response.json()
      const choice = data.choices[0]

      if (!choice) {
        throw new Error('No response from AI model')
      }

      // Handle tool calls
      if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
        const toolResults = await this.executeToolCalls(choice.message.tool_calls)

        // Add tool results to messages and get final response
        messages.push(choice.message as Message)
        for (const result of toolResults) {
          messages.push(result)
        }

        // Get final response with tool results
        const finalResponse = await fetch(`${this.endpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelConfig.model,
            messages,
            max_tokens: modelConfig.maxTokens,
            temperature: modelConfig.temperature,
          }),
        })

        const finalData: ChatCompletionResponse = await finalResponse.json()
        const finalChoice = finalData.choices[0]
        const assistantMessage = finalChoice?.message.content ?? ''

        this.updateMemory(prompt, assistantMessage)
        this.context.operationsExecuted++

        return assistantMessage
      }

      const assistantMessage = choice.message.content ?? ''
      this.updateMemory(prompt, assistantMessage)

      return assistantMessage
    } catch (error) {
      this.context.errorsHandled++
      console.error('CHRONOS AI request failed:', error)
      throw error
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // TOOL EXECUTION
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  private initializeToolExecutors(): void {
    // Placeholder executors - in production these would call actual services
    this.toolExecutors.set('getVentasHoy', async () => ({
      total: 472500,
      cantidad: 12,
      promedio: 39375,
      comparacionAyer: '+15%',
    }))

    this.toolExecutors.set('getCapitalTotal', async () => ({
      total: 1250000,
      desglose: {
        boveda_monte: 450000,
        boveda_usa: 180000,
        profit: 220000,
        leftie: 95000,
        azteca: 75000,
        flete_sur: 45000,
        utilidades: 185000,
      },
    }))

    this.toolExecutors.set('getClientesDeuda', async () => ({
      total: 342500,
      clientes: [
        { nombre: 'Ana García', deuda: 85000, diasVencido: 15 },
        { nombre: 'Carlos López', deuda: 62000, diasVencido: 8 },
        { nombre: 'María Rodríguez', deuda: 48000, diasVencido: 22 },
      ],
    }))

    // Add more executors as needed...
  }

  private async executeToolCalls(toolCalls: ToolCall[]): Promise<Message[]> {
    const results: Message[] = []

    for (const call of toolCalls) {
      const executor = this.toolExecutors.get(call.function.name)
      let result: unknown

      if (executor) {
        const args = JSON.parse(call.function.arguments)
        result = await executor(args)
      } else {
        result = { error: `Tool ${call.function.name} not implemented` }
      }

      results.push({
        role: 'tool',
        tool_call_id: call.id,
        content: JSON.stringify(result),
      })
    }

    return results
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // MEMORY MANAGEMENT
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  private updateMemory(userMessage: string, assistantMessage: string): void {
    this.memory.shortTerm.push(
      { role: 'user', content: userMessage },
      { role: 'assistant', content: assistantMessage },
    )

    // Keep only last 20 messages in short-term
    if (this.memory.shortTerm.length > 20) {
      this.memory.shortTerm = this.memory.shortTerm.slice(-20)
    }
  }

  clearMemory(): void {
    this.memory.shortTerm = []
  }

  // ═══════════════════════════════════════════════════════════════════════════════════════════════════
  // UTILITY METHODS
  // ═══════════════════════════════════════════════════════════════════════════════════════════════════

  getContext(): AgentContext {
    return { ...this.context }
  }

  getMood(): MoodState {
    return this.context.mood
  }

  setMood(mood: MoodState): void {
    this.context.mood = mood
  }

  getModelInfo(taskType: TaskType): ModelConfig {
    return MODELS[taskType]
  }

  listModels(): Record<TaskType, ModelConfig> {
    return { ...MODELS }
  }

  listTools(): ToolDefinition[] {
    return [...TOOL_DEFINITIONS]
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// SINGLETON EXPORT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const chronosInfinity = new ChronosInfinityClient()

// Legacy export for backwards compatibility
export const chronosAgent = chronosInfinity
export type { ChronosInfinityClient as ChronosAgentClient }
