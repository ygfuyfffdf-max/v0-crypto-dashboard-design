import { logger } from "@/app/lib/utils/logger"

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🤖 VAPI.AI SERVICE — INTEGRACIÓN DE TELEFONÍA AUTÓNOMA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Servicio para gestionar llamadas de voz autónomas mediante Vapi.ai
 * - Inicio de llamadas outbound
 * - Gestión de webhooks
 * - Análisis de sentimientos en tiempo real
 *
 * @version 1.0.0
 */

export interface VapiCallConfig {
  phoneNumberId: string
  customerNumber: string
  assistantId: string
  serverUrl?: string // Webhook URL
  metadata?: Record<string, any>
}

export interface CallStatus {
  id: string
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed'
  duration?: number
  recordingUrl?: string
  summary?: string
  sentiment?: 'positive' | 'neutral' | 'negative'
}

class VapiService {
  private apiKey: string
  private baseUrl = 'https://api.vapi.ai'

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || 'demo_key'
  }

  /**
   * Inicia una llamada saliente autónoma
   */
  async startOutboundCall(config: VapiCallConfig): Promise<CallStatus> {
    logger.info('📞 Iniciando llamada Vapi', { data: { customer: config.customerNumber } })

    // Si no hay key real, simulamos el éxito para mantener la funcionalidad de la UI
    if (this.apiKey === 'demo_key') {
      return this.simulateCall(config)
    }

    try {
      const response = await fetch(`${this.baseUrl}/call/phone`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumberId: config.phoneNumberId,
          customer: {
            number: config.customerNumber
          },
          assistantId: config.assistantId,
          serverUrl: config.serverUrl,
          metadata: config.metadata
        })
      })

      if (!response.ok) {
        throw new Error(`Vapi API Error: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        id: data.id,
        status: 'queued',
      }
    } catch (error) {
      logger.error('Error iniciando llamada Vapi', error as Error)
      throw error
    }
  }

  /**
   * Obtiene el estado de una llamada
   */
  async getCallStatus(callId: string): Promise<CallStatus> {
    if (this.apiKey === 'demo_key') {
      return {
        id: callId,
        status: 'completed',
        duration: 124,
        summary: 'Llamada simulada exitosa. Cliente acordó realizar el pago.',
        sentiment: 'positive'
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/call/${callId}`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` }
      })
      const data = await response.json()
      return {
        id: data.id,
        status: data.status,
        duration: data.duration,
        recordingUrl: data.recordingUrl,
        summary: data.analysis?.summary,
        sentiment: data.analysis?.sentiment
      }
    } catch (error) {
      logger.error('Error obteniendo estado llamada', error as Error)
      throw error
    }
  }

  // Simulación de alta fidelidad para demos
  private async simulateCall(config: VapiCallConfig): Promise<CallStatus> {
    await new Promise(resolve => setTimeout(resolve, 1500))
    return {
      id: `vapi_sim_${Date.now()}`,
      status: 'ringing'
    }
  }
}

export const vapiService = new VapiService()