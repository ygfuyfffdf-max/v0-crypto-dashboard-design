/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌊 VOICE STREAM API ROUTE — WEBSOCKET BRIDGE
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * API Route para configuración de WebSocket streaming:
 * - Retorna endpoints y configuración
 * - Auth tokens para Deepgram real-time
 *
 * @version 1.0.0
 */

import { logger } from '@/app/lib/utils/logger'
import { NextRequest, NextResponse } from 'next/server'

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY

interface StreamConfigRequest {
  type: 'transcribe' | 'synthesize'
  language?: string
  model?: string
}

export async function POST(request: NextRequest) {
  try {
    if (!DEEPGRAM_API_KEY) {
      return NextResponse.json({ error: 'Deepgram API key not configured' }, { status: 500 })
    }

    const body: StreamConfigRequest = await request.json()

    logger.info('[Voice Stream] Generating stream config', {
      context: 'VoiceStream',
      data: { type: body.type, language: body.language },
    })

    // Build Deepgram WebSocket URL with auth
    const params = new URLSearchParams({
      model: body.model || 'nova-2',
      language: body.language || 'es-MX',
      punctuate: 'true',
      smart_format: 'true',
      utterances: 'true',
      utt_split: '0.8',
      interim_results: 'true',
      endpointing: '200',
      vad_events: 'true',
      filler_words: 'true',
      sentiment: 'true',
    })

    const wsUrl = `wss://api.deepgram.com/v1/listen?${params}`

    return NextResponse.json({
      wsUrl,
      apiKey: DEEPGRAM_API_KEY, // Client needs this for auth header
      config: {
        sampleRate: 16000,
        channels: 1,
        encoding: 'linear16',
        language: body.language || 'es-MX',
      },
    })
  } catch (error) {
    logger.error('[Voice Stream] Config error', error as Error, { context: 'VoiceStream' })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export const runtime = 'edge'
