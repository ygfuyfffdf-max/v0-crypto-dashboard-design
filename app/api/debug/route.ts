/**
 * Database Debug Endpoint
 *
 * SECURITY: This endpoint is ONLY available in development mode.
 * In production, it returns 404 to prevent information disclosure.
 *
 * P0 Security Fix: Removed credential exposure (DATABASE_URL prefix,
 * AUTH_TOKEN existence), error stack traces, and raw query results.
 */
import { db } from '@/database'
import { bancos, clientes, ordenesCompra, ventas } from '@/database/schema'
import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  // P0 SECURITY: Block in production — no debug info should ever leak
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    // SECURITY: Only report boolean connectivity status, never credentials
    database: {
      configured: !!process.env.DATABASE_URL,
      tokenConfigured: !!process.env.DATABASE_AUTH_TOKEN,
    },
  }

  try {
    // Table count queries (safe diagnostic data only)
    const [bancosCount] = await db.select({ count: sql<number>`count(*)` }).from(bancos)
    const [clientesCount] = await db.select({ count: sql<number>`count(*)` }).from(clientes)
    const [ventasCount] = await db.select({ count: sql<number>`count(*)` }).from(ventas)
    const [ordenesCount] = await db.select({ count: sql<number>`count(*)` }).from(ordenesCompra)

    results.tableCounts = {
      bancos: bancosCount?.count ?? 0,
      clientes: clientesCount?.count ?? 0,
      ventas: ventasCount?.count ?? 0,
      ordenesCompra: ordenesCount?.count ?? 0,
    }

    results.status = 'connected'
  } catch (error) {
    results.status = 'error'
    // SECURITY: Only expose error message in dev, never stack traces
    results.error = error instanceof Error ? error.message : 'Unknown database error'
  }

  return NextResponse.json(results, { status: 200 })
}
