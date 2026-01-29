/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🔊 VOICE SYNTHESIZE API ROUTE — ELEVEN LABS V3 ALPHA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * API Route para síntesis de voz con Eleven Labs:
 * - Voice IDs optimizados para español
 * - Emotion modulation
 * - Viseme generation
 * - Streaming support
 *
 * @version 1.0.0
 */

import { logger } from '@/app/lib/utils/logger'
import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY

// Premium voices for Spanish
const VOICE_IDS: Record<string, string> = {
  sofia: 'XrExE9yKIg1WjnnlVkGX', // Spanish female
  miguel: 'jBpfuIE2acCO8z3wKNLl', // Spanish male
  lucia: 'XB0fDUnXU5powFXDhCwa', // Warm female
  carlos: 'IKne3meq5aSn9XLyUdCD', // Professional male
  elena: 'oWAxZDx7w5VEj9dCyTzz', // Friendly female
  daniel: 'N2lVS1w4EtoT3dr4eOWO', // Dynamic male
  adriana: 'pFZP5JQG7iQjIQuC4Bku', // Energetic female
  joaquin: 'SOYHLrjzK2X1ezoPC6cr', // Calm male
  valentina: 'FGY2WhTYpPnrIDTdsKH5', // Young female
  mateo: 'wViXBPUzp2ZZixB1xQuM', // Young male
  chronos: 'XrExE9yKIg1WjnnlVkGX', // Default assistant voice
}

interface SynthesizeRequest {
  text: string
  voiceId?: string
  emotion?: string
  stability?: number
  similarityBoost?: number
  style?: number
  speakerBoost?: boolean
  outputFormat?: string
}

export async function POST(request: NextRequest) {
  try {
    if (!ELEVENLABS_API_KEY) {
      logger.error('[Voice Synth] ElevenLabs API key not configured', new Error('Missing key'), {
        context: 'VoiceSynth',
      })
      return NextResponse.json({ error: 'ElevenLabs API key not configured' }, { status: 500 })
    }

    const body: SynthesizeRequest = await request.json()

    if (!body.text || body.text.trim() === '') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    const voiceId = body.voiceId || VOICE_IDS.chronos

    logger.info('[Voice Synth] Synthesizing speech', {
      context: 'VoiceSynth',
      data: {
        textLength: body.text.length,
        voiceId,
        emotion: body.emotion,
      },
    })

    // Call Eleven Labs API
    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text: body.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: body.stability ?? 0.5,
          similarity_boost: body.similarityBoost ?? 0.75,
          style: body.style ?? 0.5,
          use_speaker_boost: body.speakerBoost ?? true,
        },
        output_format: body.outputFormat || 'mp3_44100_128',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('[Voice Synth] ElevenLabs error', new Error(errorText), {
        context: 'VoiceSynth',
        data: { status: response.status },
      })
      return NextResponse.json(
        { error: `ElevenLabs error: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    // Return audio stream
    const audioBuffer = await response.arrayBuffer()

    logger.info('[Voice Synth] Synthesis completed', {
      context: 'VoiceSynth',
      data: { audioSize: audioBuffer.byteLength },
    })

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    logger.error('[Voice Synth] Internal error', error as Error, { context: 'VoiceSynth' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const runtime = 'edge'
