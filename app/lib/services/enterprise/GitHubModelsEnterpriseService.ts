/**
 * 🤖 GITHUB MODELS ENTERPRISE SERVICE - OMEGA LEVEL
 *
 * Servicio centralizado para acceso a GitHub Models (GRATIS con GitHub).
 * Acceso a los mejores modelos de IA sin costos:
 * - GPT-4, GPT-4o, GPT-5, o3 (OpenAI)
 * - Claude 3.5 Sonnet (Anthropic)
 * - Llama 4 (Meta)
 * - DeepSeek R1
 * - Phi-4 (Microsoft)
 * - Grok-3 (xAI)
 *
 * NO REQUIERE CUENTA AZURE - Solo GitHub token (que ya tienes).
 */

import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════

export type AIModel =
  | 'gpt-4'
  | 'gpt-4o'
  | 'gpt-5'
  | 'o3'
  | 'claude-3.5-sonnet'
  | 'llama-4'
  | 'deepseek-r1'
  | 'phi-4'
  | 'grok-3'

export type TaskType =
  | 'general' // Conversación, Q&A
  | 'code' // Generación/análisis de código
  | 'financial' // Análisis financiero
  | 'predictive' // Predicciones/forecasting
  | 'creative' // Contenido creativo
  | 'analytical' // Análisis de datos

export interface AIRequest {
  prompt: string
  model?: AIModel
  taskType?: TaskType
  systemPrompt?: string
  temperature?: number
  maxTokens?: number
  images?: string[] // Base64 para modelos multimodales
  stream?: boolean
}

export interface AIResponse {
  content: string
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  finishReason: string
  metadata: {
    processingTime: number
    model: string
    provider: string
  }
}

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE MODELOS
// ═══════════════════════════════════════════════════════════════════════

const MODEL_MAPPING: Record<AIModel, string> = {
  'gpt-4': 'gpt-4',
  'gpt-4o': 'gpt-4o',
  'gpt-5': 'gpt-5',
  o3: 'o3',
  'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
  'llama-4': 'meta/llama-4-maverick-17b-128e-instruct-fp8',
  'deepseek-r1': 'deepseek/deepseek-r1-0528',
  'phi-4': 'microsoft/phi-4-reasoning',
  'grok-3': 'xai/grok-3',
}

const TASK_MODEL_RECOMMENDATIONS: Record<TaskType, AIModel> = {
  general: 'gpt-4o',
  code: 'gpt-4o',
  financial: 'gpt-5',
  predictive: 'o3',
  creative: 'claude-3.5-sonnet',
  analytical: 'deepseek-r1',
}

// ═══════════════════════════════════════════════════════════════════════
// SERVICIO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

export class GitHubModelsEnterpriseService {
  private githubToken: string
  private apiEndpoint = 'https://models.inference.ai.azure.com/chat/completions'

  constructor() {
    this.githubToken = process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN || ''

    if (!this.githubToken) {
      logger.error('GitHub Token no configurado', new Error('Missing GITHUB_TOKEN'), {
        context: 'GitHubModelsEnterpriseService',
      })
      throw new Error('GitHub Token requerido. Configura GITHUB_TOKEN en .env.local')
    }
  }

  /**
   * Ejecuta consulta a GitHub Models
   */
  async complete(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now()

    // Auto-seleccionar modelo según tipo de tarea
    const model = request.model || TASK_MODEL_RECOMMENDATIONS[request.taskType || 'general']
    const modelId = MODEL_MAPPING[model]

    logger.info('🤖 Ejecutando consulta IA', {
      context: 'GitHubModelsEnterpriseService',
      model,
      taskType: request.taskType,
    })

    // Construir mensajes
    const messages: Message[] = []

    if (request.systemPrompt) {
      messages.push({
        role: 'system',
        content: request.systemPrompt,
      })
    } else {
      messages.push({
        role: 'system',
        content: this.getDefaultSystemPrompt(request.taskType || 'general'),
      })
    }

    messages.push({
      role: 'user',
      content: request.prompt,
    })

    // Ejecutar request
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.githubToken}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages,
          temperature: request.temperature ?? 0.7,
          max_tokens: request.maxTokens ?? 4096,
          stream: request.stream ?? false,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`GitHub Models API error (${response.status}): ${errorText}`)
      }

      const data = (await response.json()) as {
        choices: Array<{
          message: { content: string }
          finish_reason: string
        }>
        usage: {
          prompt_tokens: number
          completion_tokens: number
          total_tokens: number
        }
        model: string
      }

      const processingTime = Date.now() - startTime

      logger.info('✅ Consulta IA completada', {
        context: 'GitHubModelsEnterpriseService',
        model,
        tokens: data.usage.total_tokens,
        time: processingTime,
      })

      return {
        content: data.choices[0]?.message?.content || '',
        model: data.model,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        },
        finishReason: data.choices[0]?.finish_reason || 'stop',
        metadata: {
          processingTime,
          model: modelId,
          provider: 'GitHub Models',
        },
      }
    } catch (error) {
      logger.error('Error en consulta IA', error as Error, {
        context: 'GitHubModelsEnterpriseService',
        model,
      })
      throw error
    }
  }

  /**
   * Análisis predictivo con o3
   */
  async predictive(prompt: string, options?: Partial<AIRequest>): Promise<AIResponse> {
    return this.complete({
      prompt,
      model: 'o3',
      taskType: 'predictive',
      temperature: 0.2,
      ...options,
    })
  }

  /**
   * Análisis financiero con GPT-5
   */
  async financial(prompt: string, options?: Partial<AIRequest>): Promise<AIResponse> {
    return this.complete({
      prompt,
      model: 'gpt-5',
      taskType: 'financial',
      temperature: 0.3,
      systemPrompt: `Eres un analista financiero experto en el sistema CHRONOS.
Analiza datos financieros con precisión, identifica tendencias, y proporciona insights accionables.
Siempre responde en español mexicano profesional.`,
      ...options,
    })
  }

  /**
   * Generación de código con GPT-4o
   */
  async code(prompt: string, options?: Partial<AIRequest>): Promise<AIResponse> {
    return this.complete({
      prompt,
      model: 'gpt-4o',
      taskType: 'code',
      temperature: 0.1,
      systemPrompt: `Eres un desarrollador experto en TypeScript, React, Next.js, Drizzle ORM y Turso.
Genera código limpio, tipado, y siguiendo las convenciones del proyecto CHRONOS.
Usa logger de @/app/lib/utils/logger en lugar de console.log.`,
      ...options,
    })
  }

  /**
   * Análisis de datos con DeepSeek
   */
  async analytical(prompt: string, options?: Partial<AIRequest>): Promise<AIResponse> {
    return this.complete({
      prompt,
      model: 'deepseek-r1',
      taskType: 'analytical',
      temperature: 0.4,
      ...options,
    })
  }

  /**
   * Conversación general con GPT-4o
   */
  async chat(prompt: string, options?: Partial<AIRequest>): Promise<AIResponse> {
    return this.complete({
      prompt,
      model: 'gpt-4o',
      taskType: 'general',
      ...options,
    })
  }

  /**
   * Obtiene prompt del sistema por defecto según tipo de tarea
   */
  private getDefaultSystemPrompt(taskType: TaskType): string {
    const basePrompt = 'Eres un asistente de IA empresarial para el sistema CHRONOS.'

    const taskPrompts: Record<TaskType, string> = {
      general: `${basePrompt} Ayuda a los usuarios con consultas generales, proporcionando respuestas claras y concisas en español.`,

      code: `${basePrompt} Eres un experto en desarrollo full-stack con TypeScript, React, Next.js 16, Drizzle ORM y Turso.
Genera código limpio, tipado estrictamente, y siguiendo las mejores prácticas.
Usa las convenciones del proyecto CHRONOS: logger, Zod schemas, componentes shadcn/ui.`,

      financial: `${basePrompt} Eres un analista financiero experto.
Analiza datos de ventas, bancos, capital, y proporciona insights accionables.
Identifica tendencias, anomalías y oportunidades de optimización.
SIEMPRE valida la lógica de distribución de 3 bancos: Bóveda Monte (costo), Fletes, Utilidades (ganancia neta).`,

      predictive: `${basePrompt} Eres un experto en análisis predictivo y forecasting.
Identifica patrones históricos, estacionalidades, y genera predicciones con intervalos de confianza.
Usa razonamiento paso a paso para justificar tus predicciones.`,

      creative: `${basePrompt} Eres un creador de contenido profesional.
Genera textos persuasivos, descripciones atractivas y contenido de marketing.
Mantén siempre un tono profesional y en español mexicano.`,

      analytical: `${basePrompt} Eres un científico de datos experto.
Analiza datasets complejos, identifica correlaciones, y extrae insights significativos.
Proporciona recomendaciones basadas en datos, no en suposiciones.`,
    }

    return taskPrompts[taskType]
  }

  /**
   * Obtiene lista de modelos disponibles
   */
  getAvailableModels(): Array<{
    id: AIModel
    name: string
    provider: string
    capabilities: string[]
  }> {
    return [
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        provider: 'OpenAI',
        capabilities: ['text', 'code', 'analysis', 'fast'],
      },
      {
        id: 'gpt-5',
        name: 'GPT-5',
        provider: 'OpenAI',
        capabilities: ['text', 'code', 'analysis', 'advanced-reasoning'],
      },
      {
        id: 'o3',
        name: 'o3',
        provider: 'OpenAI',
        capabilities: ['predictive', 'reasoning', 'analysis'],
      },
      {
        id: 'claude-3.5-sonnet',
        name: 'Claude 3.5 Sonnet',
        provider: 'Anthropic',
        capabilities: ['text', 'creative', 'analysis', 'long-context'],
      },
      {
        id: 'llama-4',
        name: 'Llama 4 Maverick',
        provider: 'Meta',
        capabilities: ['text', 'code', 'multilingual'],
      },
      {
        id: 'deepseek-r1',
        name: 'DeepSeek R1',
        provider: 'DeepSeek',
        capabilities: ['analytical', 'reasoning', 'code'],
      },
      {
        id: 'phi-4',
        name: 'Phi-4',
        provider: 'Microsoft',
        capabilities: ['reasoning', 'analysis', 'compact'],
      },
      {
        id: 'grok-3',
        name: 'Grok-3',
        provider: 'xAI',
        capabilities: ['text', 'reasoning', 'real-time'],
      },
    ]
  }
}

// ═══════════════════════════════════════════════════════════════════════
// EXPORTAR SINGLETON
// ═══════════════════════════════════════════════════════════════════════

export const githubModels = new GitHubModelsEnterpriseService()
