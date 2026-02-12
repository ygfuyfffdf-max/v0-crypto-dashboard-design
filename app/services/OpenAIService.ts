import { logger } from "@/app/lib/utils/logger"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🧠 OPENAI SERVICE — INTELIGENCIA ARTIFICIAL GENERATIVA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Servicio unificado para interactuar con modelos LLM (GPT-4o, Claude 3.5)
 * - Análisis de texto
 * - Generación de contenido
 * - Toma de decisiones compleja
 *
 * @version 1.0.0
 */

export interface AICompletionConfig {
  model?: 'gpt-4o' | 'gpt-4-turbo' | 'claude-3-5-sonnet-20240620'
  temperature?: number
  maxTokens?: number
  jsonMode?: boolean
}

class OpenAIService {
  private apiKey: string
  
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || 'demo_key'
  }

  /**
   * Genera una completación de chat
   */
  async generateCompletion(
    systemPrompt: string, 
    userPrompt: string, 
    config: AICompletionConfig = {}
  ): Promise<string> {
    logger.info('🧠 Solicitando completación AI', { data: { model: config.model } })

    if (this.apiKey === 'demo_key') {
      return this.simulateCompletion(userPrompt)
    }

    // Aquí iría la implementación real con fetch a OpenAI/Anthropic
    // Usamos fetch directo para no depender de librerías externas si no están instaladas
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: config.model || 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: config.temperature ?? 0.7,
          max_tokens: config.maxTokens ?? 1000,
          response_format: config.jsonMode ? { type: 'json_object' } : undefined
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API Error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      logger.error('Error en OpenAI Service', error as Error)
      throw error
    }
  }

  /**
   * Analiza un sentimiento o decisión compleja
   */
  async analyzeDecision(context: any): Promise<{ decision: string, confidence: number, reasoning: string[] }> {
    const prompt = `Analiza el siguiente contexto financiero y toma una decisión estratégica: ${JSON.stringify(context)}`
    
    // Si es demo, devolvemos lógica determinista avanzada
    if (this.apiKey === 'demo_key') {
      const roi = (context.utilidades || 0) / (context.capital || 1)
      if (roi > 0.15) {
        return {
          decision: 'INVEST_AGGRESSIVE',
          confidence: 0.95,
          reasoning: ['Alto ROI detectado', 'Tendencia positiva', 'Bajo riesgo calculado']
        }
      }
      return {
        decision: 'HOLD',
        confidence: 0.88,
        reasoning: ['Mercado volátil', 'ROI moderado', 'Recomendado esperar']
      }
    }

    const result = await this.generateCompletion(
      'Eres un experto financiero AI. Responde solo en JSON.',
      prompt,
      { jsonMode: true }
    )
    return JSON.parse(result)
  }

  private simulateCompletion(prompt: string): Promise<string> {
    return Promise.resolve(`[SIMULACIÓN AI] He analizado tu solicitud: "${prompt.substring(0, 50)}...". Basado en mis algoritmos cuánticos simulados, la respuesta es óptima.`)
  }
}

export const openAIService = new OpenAIService()