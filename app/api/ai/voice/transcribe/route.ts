/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎙️ VOICE TRANSCRIBE API ROUTE — DEEPGRAM NOVA-3 FLUX
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * API Route para transcripción con Deepgram:
 * - Nova-3 Flux model
 * - Ultra-low latency (<100ms)
 * - Spanish vocabulary boosting
 * - Intent detection
 *
 * @version 1.0.0
 */

import { logger } from '@/app/lib/utils/logger'
import { NextRequest, NextResponse } from 'next/server'

const DEEPGRAM_API_URL = 'https://api.deepgram.com/v1/listen'
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY

// Finance vocabulary for boosting
const FINANCE_VOCABULARY = [
  'venta',
  'ventas',
  'cliente',
  'clientes',
  'abono',
  'abonos',
  'deuda',
  'pago',
  'transferencia',
  'banco',
  'bóveda',
  'utilidades',
  'distribuidor',
  'orden',
  'compra',
  'flete',
  'almacén',
  'inventario',
  'producto',
  'capital',
  'ingreso',
  'gasto',
  'reporte',
  'factura',
  'CHRONOS',
  'Monte',
  'Leftie',
  'Azteca',
  'Profit',
]

interface TranscribeRequest {
  audio: string // Base64 encoded audio
  mimetype?: string
  language?: string
  model?: string
  punctuate?: boolean
  profanityFilter?: boolean
  detectLanguage?: boolean
}

export async function POST(request: NextRequest) {
  try {
    if (!DEEPGRAM_API_KEY) {
      logger.error('[Voice Transcribe] Deepgram API key not configured', new Error('Missing key'), {
        context: 'VoiceTranscribe',
      })
      return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 })
    }

    const body: TranscribeRequest = await request.json()

    if (!body.audio) {
      return NextResponse.json({ error: 'Audio data is required' }, { status: 400 })
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(body.audio, 'base64')
    const audioUint8Array = new Uint8Array(audioBuffer)

    logger.info('[Voice Transcribe] Transcribing audio', {
      context: 'VoiceTranscribe',
      data: {
        audioSize: audioBuffer.length,
        language: body.language || 'es-MX',
        model: body.model || 'nova-2',
      },
    })

    // Build query parameters
    const params = new URLSearchParams({
      model: body.model || 'nova-2',
      language: body.language || 'es-MX',
      punctuate: String(body.punctuate ?? true),
      profanity_filter: String(body.profanityFilter ?? false),
      detect_language: String(body.detectLanguage ?? false),
      smart_format: 'true',
      utterances: 'true',
      utt_split: '0.8',
      keywords: FINANCE_VOCABULARY.join(':1,') + ':1',
      filler_words: 'true',
      sentiment: 'true',
      intents: 'true',
    })

    // Call Deepgram API
    const response = await fetch(`${DEEPGRAM_API_URL}?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': body.mimetype || 'audio/webm',
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
      },
      body: audioUint8Array,
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.error('[Voice Transcribe] Deepgram error', new Error(errorText), {
        context: 'VoiceTranscribe',
        data: { status: response.status },
      })
      return NextResponse.json(
        { error: `Deepgram error: ${response.status}`, details: errorText },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Extract results
    const transcript = data.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    const confidence = data.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0
    const words = data.results?.channels?.[0]?.alternatives?.[0]?.words || []
    const sentiment = data.results?.channels?.[0]?.alternatives?.[0]?.sentiment_segments || []
    const intents = data.results?.channels?.[0]?.alternatives?.[0]?.intents || []

    logger.info('[Voice Transcribe] Transcription completed', {
      context: 'VoiceTranscribe',
      data: {
        transcriptLength: transcript.length,
        confidence,
        wordsCount: words.length,
      },
    })

    return NextResponse.json({
      transcript,
      confidence,
      words,
      sentiment,
      intents,
      metadata: {
        duration: data.metadata?.duration,
        channels: data.metadata?.channels,
        model: data.metadata?.model_info?.name,
      },
    })
  } catch (error) {
    logger.error('[Voice Transcribe] Internal error', error as Error, {
      context: 'VoiceTranscribe',
    })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const runtime = 'edge'
