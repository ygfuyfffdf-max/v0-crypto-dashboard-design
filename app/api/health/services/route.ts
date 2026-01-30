/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🏥 CHRONOS INFINITY 2026 — HEALTH CHECK API
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Endpoint de health check para monitoreo de producción:
 * - Verifica estado de todos los servicios
 * - Compatible con Vercel, Kubernetes, etc.
 *
 * @version 3.0.0 PRODUCTION
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from 'next/server'
import { healthCheckAll, type SystemHealth } from '@/app/lib/services'

// Use nodejs runtime since services use Node.js modules (stream, etc.)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse<SystemHealth>> {
  const health = await healthCheckAll()
  
  // Set appropriate status code
  const statusCode = 
    health.overall === 'healthy' ? 200 :
    health.overall === 'degraded' ? 200 :
    503

  return NextResponse.json(health, { status: statusCode })
}
