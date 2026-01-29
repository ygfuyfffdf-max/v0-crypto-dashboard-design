import { NextRequest, NextResponse } from 'next/server'
import { getDashboardResumen } from '@/app/_actions/reportes'
import { logger } from '@/app/lib/utils/logger'
import { getCached, CACHE_KEYS, CACHE_TTL } from '@/app/lib/cache'
import { applyRateLimit } from '@/app/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Rate limit check
  const rateLimitResult = await applyRateLimit(request, 'read')
  if (rateLimitResult) return rateLimitResult

  try {
    // Usar cache con TTL de 1 minuto para el dashboard
    const result = await getCached(
      CACHE_KEYS.DASHBOARD_METRICS,
      async () => getDashboardResumen(),
      { ttl: CACHE_TTL.SHORT, staleWhileRevalidate: true },
    )

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error en API dashboard/resumen:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error al obtener resumen del dashboard' }, { status: 500 })
  }
}
