import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk'

export interface STTConfig {
  apiKey: string
  language?: string
  model?: string
  interimResults?: boolean
  endpointing?: number
  vadEvents?: boolean
}

export interface TranscriptionResult {
  transcript: string
  isFinal: boolean
  confidence: number
  words?: Array<{
    word: string
    start: number
    end: number
    confidence: number
  }>
}

export interface STTEvents {
  onTranscript: (result: TranscriptionResult) => void
  onError: (error: Error) => void
  onOpen: () => void
  onClose: () => void
  onMetadata: (metadata: any) => void
}

export class DeepgramSTTService {
  private client: any
  private connection: any = null
  private config: STTConfig
  private events: STTEvents
  private isConnected: boolean = false
  private reconnectAttempts: number = 0
  private maxReconnectAttempts: number = 5
  private reconnectDelay: number = 1000

  constructor(config: STTConfig, events: STTEvents) {
    this.config = {
      language: 'es',
      model: 'nova-2',
      interimResults: true,
      endpointing: 500,
      vadEvents: true,
      ...config
    }
    
    this.events = events
    this.client = createClient(this.config.apiKey)
  }

  async connect(): Promise<void> {
    try {
      this.connection = this.client.listen.live({
        language: this.config.language,
        model: this.config.model,
        interim_results: this.config.interimResults,
        endpointing: this.config.endpointing,
        vad_events: this.config.vadEvents,
        smart_format: true,
        punctuate: true,
        diarize: true,
        filler_words: false,
        profanity_filter: true,
        redact: ['pci', 'ssn', 'numbers']
      })

      this.setupEventListeners()
      this.isConnected = true
      this.reconnectAttempts = 0
      
    } catch (error) {
      console.error('Deepgram connection error:', error)
      this.events.onError(error instanceof Error ? error : new Error('Connection failed'))
      await this.handleReconnection()
    }
  }

  private setupEventListeners(): void {
    if (!this.connection) return

    this.connection.on(LiveTranscriptionEvents.Open, () => {
      this.isConnected = true
      this.events.onOpen()
      console.log('Deepgram STT connection opened')
    })

    this.connection.on(LiveTranscriptionEvents.Close, () => {
      this.isConnected = false
      this.events.onClose()
      console.log('Deepgram STT connection closed')
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        setTimeout(() => this.handleReconnection(), this.reconnectDelay)
      }
    })

    this.connection.on(LiveTranscriptionEvents.Error, (error: Error) => {
      console.error('Deepgram STT error:', error)
      this.events.onError(error)
      
      if (this.isConnected) {
        this.handleReconnection()
      }
    })

    this.connection.on(LiveTranscriptionEvents.Transcript, (data: any) => {
      if (data.type === 'Results') {
        const transcript = data.channel.alternatives[0]
        
        if (transcript && transcript.transcript) {
          const result: TranscriptionResult = {
            transcript: transcript.transcript.trim(),
            isFinal: data.is_final,
            confidence: transcript.confidence || 0,
            words: transcript.words?.map((word: any) => ({
              word: word.word,
              start: word.start,
              end: word.end,
              confidence: word.confidence || 0
            }))
          }
          
          if (result.transcript) {
            this.events.onTranscript(result)
          }
        }
      }
    })

    this.connection.on(LiveTranscriptionEvents.Metadata, (metadata: any) => {
      this.events.onMetadata(metadata)
    })

    this.connection.on(LiveTranscriptionEvents.SpeechStarted, () => {
      console.log('Speech started detected')
    })

    this.connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
      console.log('Utterance end detected')
    })
  }

  private async handleReconnection(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    console.log(`Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
    
    await new Promise(resolve => setTimeout(resolve, this.reconnectDelay * this.reconnectAttempts))
    
    try {
      await this.connect()
    } catch (error) {
      console.error('Reconnection failed:', error)
    }
  }

  sendAudioData(audioData: ArrayBuffer | Int16Array | Float32Array): void {
    if (!this.connection || !this.isConnected) {
      console.warn('STT service not connected, cannot send audio data')
      return
    }

    try {
      this.connection.send(audioData)
    } catch (error) {
      console.error('Error sending audio data:', error)
      this.events.onError(error instanceof Error ? error : new Error('Failed to send audio data'))
    }
  }

  disconnect(): void {
    if (this.connection) {
      this.connection.finish()
      this.connection = null
    }
    this.isConnected = false
  }

  isServiceConnected(): boolean {
    return this.isConnected
  }

  getConnectionStatus(): {
    isConnected: boolean
    reconnectAttempts: number
    config: STTConfig
  } {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      config: this.config
    }
  }
}

export const createSTTService = (
  config: STTConfig, 
  events: STTEvents
): DeepgramSTTService => {
  return new DeepgramSTTService(config, events)
}