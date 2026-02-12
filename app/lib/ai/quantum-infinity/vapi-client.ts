
import { logger } from '@/app/lib/utils/logger'

const VAPI_BASE_URL = 'https://api.vapi.ai'

export interface OutboundCallConfig {
  phoneNumberId: string
  customerNumber: string
  assistantId?: string
  customerName?: string
  reason?: string
}

export interface CallStatus {
  id: string
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'failed'
  transcript?: string
  summary?: string
  cost?: number
}

/**
 * 📞 VAPI CLIENT (QUANTUM TIER)
 * Cliente para gestión de llamadas autónomas via Vapi.ai
 */
export class VapiClient {
  private apiKey: string

  constructor() {
    this.apiKey = process.env.VAPI_API_KEY || ''
    if (!this.apiKey) {
      logger.warn('VAPI_API_KEY not found. Voice capabilities disabled.', { context: 'VapiClient' })
    }
  }

  /**
   * Inicia una llamada saliente autónoma
   */
  async startOutboundCall(config: OutboundCallConfig): Promise<string | null> {
    if (!this.apiKey) return null

    try {
      logger.info('Initiating Quantum Voice Call...', { context: 'VapiClient', data: config })

      const response = await fetch(`${VAPI_BASE_URL}/call`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumberId: config.phoneNumberId,
          customer: {
            number: config.customerNumber,
            name: config.customerName
          },
          assistantId: config.assistantId,
          metadata: {
            reason: config.reason
          }
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`Vapi API Error: ${error.message || response.statusText}`)
      }

      const data = await response.json()
      return data.id
    } catch (error) {
      logger.error('Failed to start Vapi call', { context: 'VapiClient', error })
      return null
    }
  }

  /**
   * Obtiene el estado y transcripción de una llamada
   */
  async getCallStatus(callId: string): Promise<CallStatus | null> {
    if (!this.apiKey) return null

    try {
      const response = await fetch(`${VAPI_BASE_URL}/call/${callId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch call status')

      const data = await response.json()
      
      return {
        id: data.id,
        status: data.status,
        transcript: data.transcript,
        summary: data.analysis?.summary,
        cost: data.cost
      }
    } catch (error) {
      logger.error('Failed to get call status', { context: 'VapiClient', error })
      return null
    }
  }
}

export const vapiClient = new VapiClient()
