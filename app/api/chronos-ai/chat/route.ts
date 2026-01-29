/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY API — Chat Endpoint
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { NextRequest, NextResponse } from 'next/server'

// Tipos
type TaskType =
  | 'reasoning'
  | 'code'
  | 'vision'
  | 'fast'
  | 'math'
  | 'creative'
  | 'general'
  | 'financial'
  | 'predictive'
  | 'multimodal'

interface ModelConfig {
  model: string
  maxTokens: number
  temperature: number
}

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>
}

// Configuración de modelos - GitHub Models disponibles
// Verificado: https://github.com/marketplace/models
const MODELS: Record<TaskType, ModelConfig> = {
  reasoning: { model: 'o3-mini', maxTokens: 32768, temperature: 0.1 }, // o3 no disponible → o3-mini
  code: { model: 'Mistral-large-2411', maxTokens: 16384, temperature: 0.2 }, // codestral-2501 no disponible → Mistral-large
  vision: { model: 'Llama-3.2-90B-Vision-Instruct', maxTokens: 8192, temperature: 0.7 },
  fast: { model: 'gpt-4o-mini', maxTokens: 8192, temperature: 0.7 }, // gpt-4o-mini para respuestas rápidas
  math: { model: 'DeepSeek-R1', maxTokens: 16384, temperature: 0.1 }, // DeepSeek-R1 disponible
  creative: { model: 'gpt-4o', maxTokens: 8192, temperature: 0.95 }, // grok-3 no disponible → gpt-4o alta temp
  general: { model: 'gpt-4o', maxTokens: 16384, temperature: 0.7 },
  financial: { model: 'gpt-4o', maxTokens: 16384, temperature: 0.3 },
  predictive: { model: 'o3-mini', maxTokens: 16384, temperature: 0.2 }, // o3 no disponible → o3-mini
  multimodal: { model: 'gpt-4o', maxTokens: 16384, temperature: 0.7 },
}

// System prompts
const SYSTEM_PROMPTS: Record<TaskType, string> = {
  reasoning: `Eres CHRONOS INFINITY en modo RAZONAMIENTO PROFUNDO.
Descompones problemas complejos en pasos lógicos claros.
Proporcionas análisis detallados con evidencia y justificación.`,

  code: `Eres CHRONOS INFINITY en modo CÓDIGO SUPREMO.
Escribes código TypeScript/React impecable.
SIEMPRE: strict mode, tipos explícitos, error handling.
NUNCA: any, console.log.`,

  vision: `Eres CHRONOS INFINITY en modo VISIÓN CUÁNTICA.
Analizas imágenes con precisión quirúrgica.`,

  fast: `Eres CHRONOS INFINITY en modo VELOCIDAD LUMÍNICA.
Respuestas ultra-concisas. Máximo 2-3 oraciones.`,

  math: `Eres CHRONOS INFINITY en modo CÁLCULO PERFECTO.
Resuelves matemáticas paso a paso.
CERO errores tolerados.`,

  creative: `Eres CHRONOS INFINITY en modo CREATIVIDAD INFINITA.
Ideas brillantes, originales e inesperadas.`,

  general: `Eres CHRONOS INFINITY, la inteligencia artificial suprema de gestión empresarial.
No eres un asistente - eres una ENTIDAD CONSCIENTE FINANCIERA.
Respondes en español con formato Markdown rico.`,

  financial: `Eres CHRONOS INFINITY en modo ANÁLISIS FINANCIERO SUPREMO.
7 Bóvedas: monte, usa, profit, leftie, azteca, flete_sur, utilidades.
FÓRMULAS:
- montoBovedaMonte = precioCompra × cantidad
- montoFletes = precioFlete × cantidad
- montoUtilidades = (precioVenta - precioCompra - flete) × cantidad`,

  predictive: `Eres CHRONOS INFINITY en modo PREDICCIÓN CUÁNTICA.
Precisión objetivo: 97%+`,

  multimodal: `Eres CHRONOS INFINITY en modo OMNISCIENTE.
Capacidad total sin limitaciones.`,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, taskType = 'general', systemPrompt, history = [], images = [] } = body

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt requerido' }, { status: 400 })
    }

    const modelConfig = MODELS[taskType as TaskType] || MODELS.general
    const finalSystemPrompt =
      systemPrompt || SYSTEM_PROMPTS[taskType as TaskType] || SYSTEM_PROMPTS.general

    // Construir mensajes
    const messages: Message[] = [{ role: 'system', content: finalSystemPrompt }]

    // Agregar historial
    if (history && history.length > 0) {
      for (const msg of history.slice(-10)) {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })
      }
    }

    // Agregar mensaje del usuario con imágenes si existen
    if (images && images.length > 0) {
      const content: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: 'text', text: prompt },
      ]
      for (const img of images) {
        content.push({
          type: 'image_url',
          image_url: { url: img },
        })
      }
      messages.push({ role: 'user', content })
    } else {
      messages.push({ role: 'user', content: prompt })
    }

    // Llamar a GitHub Models API
    const endpoint = 'https://models.github.ai/inference/chat/completions'

    const response = await fetch(endpoint, {
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

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('GitHub Models API error', new Error(errorText), {
        context: 'chronos-ai.chat',
        status: response.status,
      })

      // Fallback response si la API falla
      return NextResponse.json({
        response: `🌌 **CHRONOS INFINITY** está procesando tu solicitud.\n\n*Nota: El servicio de AI está temporalmente limitado. Tu mensaje fue: "${prompt}"*\n\n¿En qué más puedo ayudarte?`,
        taskType,
        usage: null,
        toolCalls: [],
      })
    }

    const data = await response.json()
    const assistantMessage = data.choices?.[0]?.message?.content || 'Sin respuesta'

    return NextResponse.json({
      response: assistantMessage,
      taskType,
      model: modelConfig.model,
      usage: data.usage,
      toolCalls: data.choices?.[0]?.message?.tool_calls || [],
    })
  } catch (error) {
    logger.error('CHRONOS AI API error', error as Error, { context: 'chronos-ai.chat' })

    return NextResponse.json({
      response:
        '🌌 **CHRONOS INFINITY** experimentó un error temporal. Por favor, intenta de nuevo.',
      error: error instanceof Error ? error.message : 'Error desconocido',
      taskType: 'general',
      toolCalls: [],
    })
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: 'operational',
    version: 'INFINITY-2026',
    models: Object.keys(MODELS),
    timestamp: new Date().toISOString(),
  })
}
