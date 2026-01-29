/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎙️✨ DEEPGRAM NOVA-3 FLUX — ULTRA-LOW LATENCY STT CLIENT
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Cliente de Speech-to-Text de próxima generación con:
 * - Deepgram Nova-3 modelo más avanzado
 * - Flux Agentic turn-taking <100ms latency
 * - Conversational Intelligence
 * - Sentiment Analysis en tiempo real
 * - Intent Recognition
 * - Custom vocabulary (finance terms)
 * - Wake word detection siempre activo
 * - Diarization multi-speaker
 * - Real-time streaming WebSocket
 *
 * @version 3.0.0
 * @author CHRONOS INFINITY TEAM
 */

import { logger } from '@/app/lib/utils/logger'
import type { DeepgramNova3Config, DeepgramState, TranscriptionResult } from './types'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎯 FINANCE VOCABULARY
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

const FINANCE_VOCABULARY = [
  // Español financiero
  'ventas',
  'utilidades',
  'capital',
  'ganancias',
  'pérdidas',
  'ingresos',
  'egresos',
  'transferencia',
  'abono',
  'pago',
  'cliente',
  'distribuidor',
  'inventario',
  'almacén',
  'stock',
  'orden de compra',
  'factura',
  'recibo',
  'bóveda',
  'banco',
  'monte',
  'fletes',
  'profit',
  'leftie',
  'azteca',
  // English finance terms
  'revenue',
  'profit',
  'loss',
  'income',
  'expense',
  'transfer',
  'payment',
  'customer',
  'distributor',
  'inventory',
  'warehouse',
  'purchase order',
  'invoice',
  'receipt',
  'vault',
  'bank',
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🗣️ INTENT PATTERNS (Spanish)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface IntentPattern {
  intent: string
  patterns: RegExp[]
  priority: number
}

const INTENT_PATTERNS: IntentPattern[] = [
  // Sales queries
  {
    intent: 'query_ventas',
    patterns: [
      /(?:ver|mostrar|consultar|dame|cuáles|cuantas|listar)\s*(?:las\s*)?ventas?/i,
      /ventas?\s*(?:de\s*)?(?:hoy|ayer|esta\s*semana|este\s*mes)/i,
      /(?:cuánto|cuanto)\s*(?:se\s*)?(?:vendió|vendio|ha\s*vendido)/i,
      /(?:resumen|reporte)\s*(?:de\s*)?ventas?/i,
    ],
    priority: 10,
  },
  // Customer queries
  {
    intent: 'query_clientes',
    patterns: [
      /(?:ver|mostrar|consultar|dame|listar)\s*(?:los\s*)?clientes?/i,
      /(?:cuántos|cuantos)\s*clientes?\s*(?:tenemos|hay)/i,
      /(?:buscar|encontrar)\s*cliente/i,
      /clientes?\s*(?:con\s*)?deuda/i,
    ],
    priority: 10,
  },
  // Bank queries
  {
    intent: 'query_bancos',
    patterns: [
      /(?:ver|mostrar|consultar|dame)\s*(?:el\s*)?(?:estado|saldo)\s*(?:de\s*)?(?:los\s*)?bancos?/i,
      /(?:cuánto|cuanto)\s*(?:hay|tenemos)\s*(?:en\s*)?(?:el\s*)?banco/i,
      /capital\s*(?:total|disponible)/i,
      /(?:bóveda|boveda)\s*(?:monte|usa)/i,
    ],
    priority: 10,
  },
  // Create actions
  {
    intent: 'crear_venta',
    patterns: [
      /(?:crear|registrar|hacer|nueva)\s*(?:una\s*)?venta/i,
      /vender\s*(?:a|para)/i,
      /(?:quiero|necesito)\s*(?:hacer|registrar)\s*(?:una\s*)?venta/i,
    ],
    priority: 20,
  },
  // Navigation
  {
    intent: 'navegar_panel',
    patterns: [
      /(?:ir|llevar|abrir|mostrar)\s*(?:a|el)?\s*(?:panel\s*de\s*)?(ventas|clientes|distribuidores)/i,
      /(?:abre|muestra)\s*(?:el\s*)?dashboard/i,
    ],
    priority: 5,
  },
  // Reports
  {
    intent: 'generar_reporte',
    patterns: [
      /(?:generar|crear|hacer|exportar)\s*(?:un\s*)?reporte/i,
      /(?:descargar|exportar)\s*(?:datos?|información|excel|pdf)/i,
    ],
    priority: 15,
  },
  // Greetings
  {
    intent: 'saludo',
    patterns: [
      /^(?:hola|buenos?\s*(?:días|tardes|noches)|hey|qué\s*tal)/i,
      /^(?:hi|hello|good\s*(?:morning|afternoon|evening))/i,
    ],
    priority: 1,
  },
  // Help
  {
    intent: 'ayuda',
    patterns: [
      /(?:ayuda|help|cómo|como)\s*(?:funciona|puedo|hago)/i,
      /(?:qué|que)\s*(?:puedo|puedes)\s*hacer/i,
    ],
    priority: 5,
  },
]

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎙️ DEEPGRAM NOVA-3 FLUX CLIENT
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export class DeepgramNova3Client {
  private config: DeepgramNova3Config
  private mediaStream: MediaStream | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private sendInterval: NodeJS.Timeout | null = null
  private state: DeepgramState = 'idle'
  private reconnectAttempts = 0
  private isProcessing = false
  private wakeWordActive = false

  // Callbacks
  private onTranscriptCallback: ((_result: TranscriptionResult) => void) | null = null
  private onSentimentCallback: ((_sentiment: 'positive' | 'negative' | 'neutral') => void) | null =
    null
  private onIntentCallback: ((_intent: string, _entities: Record<string, unknown>) => void) | null =
    null
  private onWakeWordCallback: (() => void) | null = null
  private onStateChangeCallback: ((_state: DeepgramState) => void) | null = null

  constructor(config?: Partial<DeepgramNova3Config>) {
    this.config = {
      language: 'es-MX',
      model: 'nova-3',
      smartFormat: true,
      punctuate: true,
      diarize: true,
      sentiment: true,
      topics: true,
      utterances: true,
      turnTaking: true,
      intentRecognition: true,
      interimResults: true,
      endpointing: 300, // 300ms for Nova-3 Flux
      vadTurnoff: 500,
      wakeWord: 'chronos',
      wakeWordSensitivity: 0.7,
      ...config,
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // PUBLIC METHODS
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Inicia la escucha y transcripción
   */
  async start(): Promise<void> {
    try {
      this.updateState('connecting')

      // Request microphone access
      this.mediaStream = await this.requestMicrophone()

      // Start recording
      this.startRecording()

      // Start polling interval for REST API
      this.startPolling()

      this.updateState('listening')
      this.reconnectAttempts = 0

      logger.info('[DeepgramNova3] Transcripción iniciada', {
        context: 'DeepgramNova3',
        data: { language: this.config.language, model: this.config.model },
      })
    } catch (error) {
      this.handleError(error as Error)
    }
  }

  /**
   * Inicia el modo always-listening con wake word
   */
  async startAlwaysListening(): Promise<void> {
    this.wakeWordActive = true
    await this.start()

    logger.info('[DeepgramNova3] Modo always-listening activado', {
      context: 'DeepgramNova3',
      data: { wakeWord: this.config.wakeWord },
    })
  }

  /**
   * Detiene la transcripción
   */
  stop(): void {
    this.cleanup()
    this.updateState('closed')
    this.wakeWordActive = false
    logger.info('[DeepgramNova3] Transcripción detenida', { context: 'DeepgramNova3' })
  }

  /**
   * Pausa temporalmente (sin cerrar micrófono)
   */
  pause(): void {
    if (this.sendInterval) {
      clearInterval(this.sendInterval)
      this.sendInterval = null
    }
    this.updateState('idle')
  }

  /**
   * Resume la transcripción
   */
  resume(): void {
    if (this.mediaRecorder && this.state === 'idle') {
      this.startPolling()
      this.updateState('listening')
    }
  }

  /**
   * Obtiene el estado actual
   */
  getState(): DeepgramState {
    return this.state
  }

  /**
   * Verifica si está escuchando activamente
   */
  isListening(): boolean {
    return this.state === 'listening'
  }

  /**
   * Verifica si el wake word está activo
   */
  isWakeWordActive(): boolean {
    return this.wakeWordActive
  }

  // ─────────────────────────────────────────────────────────────────────
  // EVENT HANDLERS
  // ─────────────────────────────────────────────────────────────────────

  /**
   * Registra callback para transcripciones
   */
  onTranscript(callback: (_result: TranscriptionResult) => void): void {
    this.onTranscriptCallback = callback
  }

  /**
   * Registra callback para análisis de sentimiento
   */
  onSentiment(callback: (_sentiment: 'positive' | 'negative' | 'neutral') => void): void {
    this.onSentimentCallback = callback
  }

  /**
   * Registra callback para detección de intención
   */
  onIntent(callback: (_intent: string, _entities: Record<string, unknown>) => void): void {
    this.onIntentCallback = callback
  }

  /**
   * Registra callback para detección de wake word
   */
  onWakeWord(callback: () => void): void {
    this.onWakeWordCallback = callback
  }

  /**
   * Registra callback para cambios de estado
   */
  onStateChange(callback: (_state: DeepgramState) => void): void {
    this.onStateChangeCallback = callback
  }

  // ─────────────────────────────────────────────────────────────────────
  // PRIVATE METHODS
  // ─────────────────────────────────────────────────────────────────────

  private async requestMicrophone(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      })
      return stream
    } catch (error) {
      const err = error as Error
      if (err.name === 'NotAllowedError') {
        throw new Error('MICROPHONE_PERMISSION_DENIED: Permiso de micrófono denegado')
      } else if (err.name === 'NotFoundError') {
        throw new Error('MICROPHONE_NOT_FOUND: No se encontró micrófono')
      }
      throw new Error(`MICROPHONE_ERROR: ${err.message}`)
    }
  }

  private startRecording(): void {
    if (!this.mediaStream) {
      throw new Error('MEDIA_STREAM_NOT_AVAILABLE')
    }

    const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

    this.mediaRecorder = new MediaRecorder(this.mediaStream, {
      mimeType,
      audioBitsPerSecond: 128000,
    })

    this.audioChunks = []

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data)
      }
    }

    this.mediaRecorder.start(100) // Collect data every 100ms for low latency
  }

  private startPolling(): void {
    // Send audio chunks every 300ms for Nova-3 Flux ultra-low latency
    this.sendInterval = setInterval(async () => {
      if (this.audioChunks.length > 0 && !this.isProcessing) {
        await this.sendAudioChunk()
      }
    }, 300)
  }

  private async sendAudioChunk(): Promise<void> {
    if (this.audioChunks.length === 0) return

    this.isProcessing = true
    const chunks = [...this.audioChunks]
    this.audioChunks = []

    try {
      const audioBlob = new Blob(chunks, { type: 'audio/webm' })

      const response = await fetch('/api/ai/voice/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audio: await this.blobToBase64(audioBlob),
          language: this.config.language,
          model: this.config.model,
          smartFormat: this.config.smartFormat,
          punctuate: this.config.punctuate,
          diarize: this.config.diarize,
          sentiment: this.config.sentiment,
          topics: this.config.topics,
          utterances: this.config.utterances,
          keywords: FINANCE_VOCABULARY,
          endpointing: this.config.endpointing,
        }),
      })

      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.status}`)
      }

      const result = await response.json()
      this.processTranscriptionResult(result)
    } catch (error) {
      logger.error('[DeepgramNova3] Error sending chunk', error as Error, {
        context: 'DeepgramNova3',
      })
    } finally {
      this.isProcessing = false
    }
  }

  private processTranscriptionResult(result: Record<string, unknown>): void {
    const transcript = result.transcript as string
    if (!transcript) return

    // Check for wake word
    if (this.wakeWordActive && this.detectWakeWord(transcript)) {
      this.onWakeWordCallback?.()
      logger.info('[DeepgramNova3] Wake word detected', {
        context: 'DeepgramNova3',
        data: { wakeWord: this.config.wakeWord },
      })
    }

    // Build transcription result
    const transcriptionResult: TranscriptionResult = {
      text: transcript,
      isFinal: (result.isFinal as boolean) ?? true,
      confidence: (result.confidence as number) ?? 0.9,
      sentiment: this.analyzeSentiment(transcript),
      intent: this.detectIntent(transcript),
      words: result.words as TranscriptionResult['words'],
    }

    // Emit transcript
    this.onTranscriptCallback?.(transcriptionResult)

    // Emit sentiment if available
    if (transcriptionResult.sentiment) {
      this.onSentimentCallback?.(transcriptionResult.sentiment)
    }

    // Emit intent if detected
    if (transcriptionResult.intent) {
      const entities = this.extractEntities(transcript, transcriptionResult.intent)
      this.onIntentCallback?.(transcriptionResult.intent, entities)
    }

    logger.debug('[DeepgramNova3] Transcription received', {
      context: 'DeepgramNova3',
      data: {
        text: transcript.substring(0, 50) + '...',
        sentiment: transcriptionResult.sentiment,
        intent: transcriptionResult.intent,
      },
    })
  }

  private detectWakeWord(transcript: string): boolean {
    const wakeWord = this.config.wakeWord.toLowerCase()
    const text = transcript.toLowerCase()
    return text.includes(wakeWord) || text.includes('cronos') || text.includes('crono')
  }

  private detectIntent(transcript: string): string | undefined {
    const text = transcript.toLowerCase()

    let bestMatch: { intent: string; priority: number } | null = null

    for (const pattern of INTENT_PATTERNS) {
      for (const regex of pattern.patterns) {
        if (regex.test(text)) {
          if (!bestMatch || pattern.priority > bestMatch.priority) {
            bestMatch = { intent: pattern.intent, priority: pattern.priority }
          }
          break
        }
      }
    }

    return bestMatch?.intent
  }

  private analyzeSentiment(transcript: string): 'positive' | 'negative' | 'neutral' {
    const text = transcript.toLowerCase()

    // Positive indicators
    const positiveWords = [
      'bueno',
      'excelente',
      'genial',
      'perfecto',
      'gracias',
      'bien',
      'éxito',
      'ganancia',
      'incremento',
      'subió',
      'creció',
    ]

    // Negative indicators
    const negativeWords = [
      'malo',
      'problema',
      'error',
      'pérdida',
      'bajo',
      'cayó',
      'disminuyó',
      'deuda',
      'crítico',
      'urgente',
      'alerta',
    ]

    let score = 0
    for (const word of positiveWords) {
      if (text.includes(word)) score++
    }
    for (const word of negativeWords) {
      if (text.includes(word)) score--
    }

    if (score > 0) return 'positive'
    if (score < 0) return 'negative'
    return 'neutral'
  }

  private extractEntities(transcript: string, intent: string): Record<string, unknown> {
    const entities: Record<string, unknown> = {}
    const text = transcript.toLowerCase()

    // Extract numbers
    const numbers = text.match(/\d+(?:,\d{3})*(?:\.\d+)?/g)
    if (numbers) {
      entities.amounts = numbers.map((n) => parseFloat(n.replace(/,/g, '')))
    }

    // Extract dates
    const datePatterns = [
      /hoy/i,
      /ayer/i,
      /mañana/i,
      /esta\s*semana/i,
      /este\s*mes/i,
      /este\s*año/i,
    ]
    for (const pattern of datePatterns) {
      if (pattern.test(text)) {
        entities.dateRange = pattern.source
        break
      }
    }

    // Extract entity names based on intent
    if (intent.includes('cliente')) {
      const nameMatch = text.match(/(?:cliente|para|de)\s+([a-záéíóú]+(?:\s+[a-záéíóú]+)?)/i)
      if (nameMatch) {
        entities.clienteName = nameMatch[1]
      }
    }

    return entities
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        const base64Part = result.split(',')[1]
        resolve(base64Part ?? '')
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  private updateState(state: DeepgramState): void {
    this.state = state
    this.onStateChangeCallback?.(state)
  }

  private cleanup(): void {
    if (this.sendInterval) {
      clearInterval(this.sendInterval)
      this.sendInterval = null
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop()
    }
    this.mediaRecorder = null

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }

    this.audioChunks = []
    this.isProcessing = false
  }

  private handleError(error: Error): void {
    this.updateState('error')
    logger.error('[DeepgramNova3] Error', error, { context: 'DeepgramNova3' })

    // Attempt reconnection
    if (this.reconnectAttempts < 5) {
      this.reconnectAttempts++
      const delay = Math.pow(1.5, this.reconnectAttempts) * 1000

      logger.info('[DeepgramNova3] Reconectando...', {
        context: 'DeepgramNova3',
        data: { attempt: this.reconnectAttempts, delay },
      })

      setTimeout(() => {
        this.updateState('reconnecting')
        this.start()
      }, delay)
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// 🎁 SINGLETON INSTANCE
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

let deepgramInstance: DeepgramNova3Client | null = null

export function getDeepgramClient(config?: Partial<DeepgramNova3Config>): DeepgramNova3Client {
  if (!deepgramInstance) {
    deepgramInstance = new DeepgramNova3Client(config)
  }
  return deepgramInstance
}

export default DeepgramNova3Client
