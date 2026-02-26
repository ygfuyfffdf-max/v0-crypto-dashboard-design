// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🤖 CHRONOS INFINITY 2026 — OPENAI AI SERVICE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Servicio de AI con Vercel AI SDK:
 * - Chat completions
 * - Streaming responses
 * - Function calling
 * - Embeddings
 * - Multi-model support
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import {
  generateText,
  streamText,
  generateObject,
  embed,
  embedMany,
  LanguageModel,
  CoreMessage,
  Tool,
} from 'ai'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════

export type AIProvider = 'openai' | 'anthropic' | 'google'

export type ModelId =
  // OpenAI
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  // Anthropic
  | 'claude-3-5-sonnet-latest'
  | 'claude-3-haiku-20240307'
  // Google
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash'

export interface ChatOptions {
  model?: ModelId
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  tools?: Record<string, Tool>
  toolChoice?: 'auto' | 'none' | 'required' | { type: 'tool'; toolName: string }
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatResult {
  text: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason: string
  toolCalls?: Array<{
    toolName: string
    args: unknown
    result?: unknown
  }>
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// AI PROVIDERS
// ═══════════════════════════════════════════════════════════════════════════════════════

const providers: Record<AIProvider, () => ReturnType<typeof createOpenAI | typeof createAnthropic | typeof createGoogleGenerativeAI>> = {
  openai: () => createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    compatibility: 'strict',
  }),
  anthropic: () => createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  }),
  google: () => createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_AI_API_KEY,
  }),
}

const modelProviders: Record<ModelId, AIProvider> = {
  'gpt-4o': 'openai',
  'gpt-4o-mini': 'openai',
  'gpt-4-turbo': 'openai',
  'gpt-3.5-turbo': 'openai',
  'claude-3-5-sonnet-latest': 'anthropic',
  'claude-3-haiku-20240307': 'anthropic',
  'gemini-1.5-pro': 'google',
  'gemini-1.5-flash': 'google',
}

/**
 * Get model instance
 */
function getModel(modelId: ModelId): LanguageModel {
  const providerName = modelProviders[modelId]
  const provider = providers[providerName]()
  
  return provider(modelId) as unknown as LanguageModel
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// DEFAULT CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════════

const DEFAULT_MODEL: ModelId = (process.env.NEXT_PUBLIC_DEFAULT_AI_MODEL as ModelId) || 'gpt-4o'
const DEFAULT_TEMPERATURE = 0.7
const DEFAULT_MAX_TOKENS = 4096

// ═══════════════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPTS — CHRONOS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const SystemPrompts = {
  DEFAULT: `Eres CHRONOS AI, un asistente inteligente especializado en gestión empresarial.
Tu objetivo es ayudar a los usuarios con análisis de datos, reportes, y toma de decisiones.
Responde siempre en español, de forma clara y profesional.
Usa emojis cuando sea apropiado para mejorar la legibilidad.`,

  SALES_ANALYST: `Eres un analista de ventas experto. Analiza datos de ventas, identifica tendencias,
y proporciona insights accionables. Siempre incluye:
- Métricas clave
- Comparaciones relevantes
- Recomendaciones específicas`,

  INVENTORY_MANAGER: `Eres un gestor de inventario AI. Tu rol es:
- Optimizar niveles de stock
- Predecir demanda
- Identificar productos de bajo rendimiento
- Sugerir reordenamiento óptimo`,

  FINANCIAL_ADVISOR: `Eres un asesor financiero AI. Ayudas con:
- Análisis de flujo de caja
- Proyecciones financieras
- Optimización de costos
- Estrategias de precios`,

  CUSTOMER_ASSISTANT: `Eres un asistente de atención al cliente. Tu objetivo es:
- Resolver consultas rápidamente
- Proporcionar información precisa
- Escalar cuando sea necesario
- Mantener un tono amable y profesional`,
} as const

export type SystemPromptKey = keyof typeof SystemPrompts

// ═══════════════════════════════════════════════════════════════════════════════════════
// CHAT COMPLETIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Generate chat completion (non-streaming)
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {}
): Promise<ChatResult> {
  const model = getModel(options.model || DEFAULT_MODEL)
  
  const coreMessages: CoreMessage[] = []
  
  if (options.systemPrompt) {
    coreMessages.push({
      role: 'system',
      content: options.systemPrompt,
    })
  }

  coreMessages.push(...messages.map((m) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  })))

  const result = await generateText({
    model,
    messages: coreMessages,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    maxTokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    tools: options.tools,
    toolChoice: options.toolChoice,
  })

  return {
    text: result.text,
    usage: {
      promptTokens: result.usage.promptTokens,
      completionTokens: result.usage.completionTokens,
      totalTokens: result.usage.promptTokens + result.usage.completionTokens,
    },
    finishReason: result.finishReason,
    toolCalls: result.toolCalls?.map((tc) => ({
      toolName: tc.toolName,
      args: tc.args,
    })),
  }
}

/**
 * Generate streaming chat completion
 */
export async function chatStream(
  messages: ChatMessage[],
  options: ChatOptions = {}
) {
  const model = getModel(options.model || DEFAULT_MODEL)
  
  const coreMessages: CoreMessage[] = []
  
  if (options.systemPrompt) {
    coreMessages.push({
      role: 'system',
      content: options.systemPrompt,
    })
  }

  coreMessages.push(...messages.map((m) => ({
    role: m.role as 'user' | 'assistant' | 'system',
    content: m.content,
  })))

  return streamText({
    model,
    messages: coreMessages,
    temperature: options.temperature ?? DEFAULT_TEMPERATURE,
    maxTokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    tools: options.tools,
    toolChoice: options.toolChoice,
  })
}

/**
 * Quick completion (single message)
 */
export async function complete(
  prompt: string,
  options: ChatOptions = {}
): Promise<string> {
  const result = await chat(
    [{ role: 'user', content: prompt }],
    options
  )
  return result.text
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// STRUCTURED OUTPUT
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Generate structured object output
 */
export async function generateStructured<T>(
  prompt: string,
  schema: z.ZodSchema<T>,
  options: ChatOptions = {}
): Promise<T> {
  const model = getModel(options.model || DEFAULT_MODEL)

  const result = await generateObject({
    model,
    prompt,
    schema,
    temperature: options.temperature ?? 0.3, // Lower temp for structured output
  })

  return result.object
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// CHRONOS AI TOOLS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const ChronosTools = {
  getSalesData: {
    description: 'Obtiene datos de ventas para un período específico',
    parameters: z.object({
      startDate: z.string().describe('Fecha de inicio (YYYY-MM-DD)'),
      endDate: z.string().describe('Fecha de fin (YYYY-MM-DD)'),
      groupBy: z.enum(['day', 'week', 'month']).optional(),
    }),
  },
  getProductInfo: {
    description: 'Obtiene información de un producto',
    parameters: z.object({
      productId: z.string().optional(),
      sku: z.string().optional(),
      name: z.string().optional(),
    }),
  },
  getInventoryStatus: {
    description: 'Obtiene el estado del inventario',
    parameters: z.object({
      category: z.string().optional(),
      lowStockOnly: z.boolean().optional(),
    }),
  },
  createReport: {
    description: 'Genera un reporte personalizado',
    parameters: z.object({
      type: z.enum(['sales', 'inventory', 'financial', 'customers']),
      period: z.string(),
      format: z.enum(['summary', 'detailed']).optional(),
    }),
  },
  searchDatabase: {
    description: 'Busca en la base de datos',
    parameters: z.object({
      query: z.string(),
      tables: z.array(z.string()).optional(),
      limit: z.number().optional(),
    }),
  },
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EMBEDDINGS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Generate embedding for single text
 */
export async function createEmbedding(text: string): Promise<number[]> {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  })

  return embedding
}

/**
 * Generate embeddings for multiple texts
 */
export async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })
  
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: texts,
  })

  return embeddings
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Embeddings must have same length')
  
  let dotProduct = 0
  let normA = 0
  let normB = 0
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// SPECIALIZED FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Analyze sales data with AI
 */
export async function analyzeSales(
  salesData: unknown,
  question?: string
): Promise<string> {
  const prompt = `Analiza los siguientes datos de ventas y proporciona insights:

${JSON.stringify(salesData, null, 2)}

${question ? `Pregunta específica: ${question}` : 'Proporciona un análisis general con tendencias, patrones y recomendaciones.'}

Responde en formato estructurado con secciones claras.`

  return complete(prompt, {
    systemPrompt: SystemPrompts.SALES_ANALYST,
    temperature: 0.5,
  })
}

/**
 * Generate product description
 */
export async function generateProductDescription(
  productInfo: {
    name: string
    category: string
    features?: string[]
    price?: number
  }
): Promise<string> {
  const prompt = `Genera una descripción atractiva para el siguiente producto:

Nombre: ${productInfo.name}
Categoría: ${productInfo.category}
${productInfo.features ? `Características: ${productInfo.features.join(', ')}` : ''}
${productInfo.price ? `Precio: $${productInfo.price}` : ''}

La descripción debe ser concisa (2-3 oraciones), persuasiva y destacar los beneficios principales.`

  return complete(prompt, { temperature: 0.8 })
}

/**
 * Summarize text
 */
export async function summarize(
  text: string,
  maxLength?: number
): Promise<string> {
  const prompt = `Resume el siguiente texto${maxLength ? ` en máximo ${maxLength} palabras` : ''}:

${text}

El resumen debe capturar los puntos más importantes de forma concisa.`

  return complete(prompt, { temperature: 0.3 })
}

/**
 * Translate text
 */
export async function translate(
  text: string,
  targetLanguage: string
): Promise<string> {
  const prompt = `Traduce el siguiente texto al ${targetLanguage}:

${text}

Mantén el tono y significado original.`

  return complete(prompt, { temperature: 0.3 })
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════════════

export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  details?: string
}> {
  const start = Date.now()
  
  try {
    await complete('Di "OK"', {
      maxTokens: 10,
      temperature: 0,
    })
    const latency = Date.now() - start
    
    return {
      status: latency < 3000 ? 'healthy' : 'degraded',
      latency,
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      latency: Date.now() - start,
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════════════

export const openaiService = {
  chat,
  chatStream,
  complete,
  generateStructured,
  embeddings: {
    create: createEmbedding,
    createMany: createEmbeddings,
    similarity: cosineSimilarity,
  },
  analyze: {
    sales: analyzeSales,
  },
  generate: {
    productDescription: generateProductDescription,
  },
  utils: {
    summarize,
    translate,
  },
  health: healthCheck,
  prompts: SystemPrompts,
  tools: ChronosTools,
  models: Object.keys(modelProviders) as ModelId[],
}

export default openaiService
