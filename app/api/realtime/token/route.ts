/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔌 CHRONOS INFINITY 2026 — ABLY TOKEN ENDPOINT
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Endpoint para generar tokens de autenticación Ably:
 * - Authenticated users get personalized tokens
 * - Token includes channel capabilities
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { ablyRealtime } from '@/app/lib/services'

// Use nodejs runtime since services use Node.js modules
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate token for user
    const { token, expires } = await ablyRealtime.auth.generateToken({
      clientId: userId,
    })

    return NextResponse.json({
      token,
      expires,
      clientId: userId,
    })
  } catch (error) {
    console.error('Error generating Ably token:', error)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
