// @ts-nocheck
import { ElevenLabsClient } from 'elevenlabs'

export interface VoiceConfig {
  voiceId: string
  apiKey: string
  modelId?: string
  stability?: number
  similarityBoost?: number
  style?: number
}

export interface EmotionSettings {
  calm: { stability: number; style: number; similarityBoost: number }
  professional: { stability: number; style: number; similarityBoost: number }
  excited: { stability: number; style: number; similarityBoost: number }
}

export class ElevenLabsVoiceService {
  private client: ElevenLabsClient
  private config: VoiceConfig
  private audioContext: AudioContext | null = null
  private currentSource: AudioBufferSourceNode | null = null
  private emotionSettings: EmotionSettings = {
    calm: { stability: 0.8, style: 0.3, similarityBoost: 0.9 },
    professional: { stability: 0.7, style: 0.5, similarityBoost: 0.9 },
    excited: { stability: 0.6, style: 0.8, similarityBoost: 0.95 }
  }

  constructor(config: VoiceConfig) {
    this.config = {
      modelId: 'eleven_turbo_v2_5',
      stability: 0.7,
      similarityBoost: 0.9,
      style: 0.5,
      ...config
    }
    
    this.client = new ElevenLabsClient({
      apiKey: this.config.apiKey
    })
  }

  async initializeAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      this.audioContext = new AudioContext()
    }
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume()
    }
    
    return this.audioContext
  }

  async speakWithEmotion(
    text: string, 
    emotion: 'calm' | 'professional' | 'excited' = 'professional',
    options?: {
      stream?: boolean
      onStart?: () => void
      onEnd?: () => void
      onError?: (error: Error) => void
    }
  ): Promise<void> {
    try {
      const emotionSettings = this.emotionSettings[emotion]
      
      const response = await this.client.textToSpeech.convert(this.config.voiceId, {
        text,
        model_id: this.config.modelId,
        voice_settings: {
          stability: emotionSettings.stability,
          similarity_boost: emotionSettings.similarityBoost,
          style: emotionSettings.style,
          use_speaker_boost: true
        },
        stream: options?.stream ?? true
      })

      if (options?.onStart) options.onStart()

      const audioContext = await this.initializeAudioContext()
      
      if (options?.stream) {
        await this.playStream(response, audioContext)
      } else {
        await this.playBuffer(response, audioContext)
      }

      if (options?.onEnd) options.onEnd()
      
    } catch (error) {
      console.error('ElevenLabs TTS Error:', error)
      if (options?.onError) {
        options.onError(error instanceof Error ? error : new Error('Unknown TTS error'))
      }
      throw error
    }
  }

  private async playStream(
    response: ReadableStream<Uint8Array>, 
    audioContext: AudioContext
  ): Promise<void> {
    const reader = response.getReader()
    const chunks: Uint8Array[] = []
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
      }
      
      const audioData = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0))
      let offset = 0
      chunks.forEach(chunk => {
        audioData.set(chunk, offset)
        offset += chunk.length
      })
      
      await this.playBuffer(audioData, audioContext)
    } finally {
      reader.releaseLock()
    }
  }

  private async playBuffer(
    audioData: Uint8Array | ArrayBuffer, 
    audioContext: AudioContext
  ): Promise<void> {
    try {
      const arrayBuffer = audioData instanceof ArrayBuffer ? audioData : audioData.buffer
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
      
      if (this.currentSource) {
        this.currentSource.stop()
      }
      
      this.currentSource = audioContext.createBufferSource()
      this.currentSource.buffer = audioBuffer
      this.currentSource.connect(audioContext.destination)
      
      return new Promise((resolve) => {
        this.currentSource!.onended = () => resolve()
        this.currentSource!.start(0)
      })
    } catch (error) {
      console.error('Audio playback error:', error)
      throw error
    }
  }

  stop(): void {
    if (this.currentSource) {
      this.currentSource.stop()
      this.currentSource = null
    }
  }

  dispose(): void {
    this.stop()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
  }

  getGreetingByTime(): { greeting: string; emotion: 'calm' | 'professional' | 'excited' } {
    const hour = new Date().getHours()
    
    if (hour >= 6 && hour < 12) {
      return { 
        greeting: "¡Buenos días! Bienvenido a Chronos Infinity. ¿Listo para conquistar el día?", 
        emotion: 'excited' 
      }
    } else if (hour >= 12 && hour < 20) {
      return { 
        greeting: "¡Buenas tardes! Chronos Infinity a tu servicio. ¿Qué aventura emprendemos?", 
        emotion: 'professional' 
      }
    } else {
      return { 
        greeting: "¡Buenas noches! Chronos Infinity te acompaña en esta velada. ¿Qué deseas lograr?", 
        emotion: 'calm' 
      }
    }
  }

  async playGreeting(): Promise<void> {
    const { greeting, emotion } = this.getGreetingByTime()
    await this.speakWithEmotion(greeting, emotion)
  }
}

export const createVoiceService = (config: VoiceConfig): ElevenLabsVoiceService => {
  return new ElevenLabsVoiceService(config)
}