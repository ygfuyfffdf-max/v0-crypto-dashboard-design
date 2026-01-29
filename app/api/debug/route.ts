import { db } from '@/database'
import { ventas, ordenesCompra, clientes, bancos } from '@/database/schema'
import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    env: {
      hasDbUrl: !!process.env.DATABASE_URL,
      hasDbToken: !!process.env.DATABASE_AUTH_TOKEN,
      dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
    },
  }

  try {
    // Test 1: Simple count queries
    const [bancosCount] = await db.select({ count: sql<number>`count(*)` }).from(bancos)
    results.bancosCount = bancosCount?.count ?? 0

    const [clientesCount] = await db.select({ count: sql<number>`count(*)` }).from(clientes)
    results.clientesCount = clientesCount?.count ?? 0

    const [ventasCount] = await db.select({ count: sql<number>`count(*)` }).from(ventas)
    results.ventasCount = ventasCount?.count ?? 0

    const [ordenesCount] = await db.select({ count: sql<number>`count(*)` }).from(ordenesCompra)
    results.ordenesCount = ordenesCount?.count ?? 0

    // Test 2: Try simple ventas query without joins
    try {
      const ventasSimple = await db
        .select({ id: ventas.id, clienteId: ventas.clienteId })
        .from(ventas)
        .limit(3)
      results.ventasSimpleQuery = ventasSimple
    } catch (e) {
      results.ventasSimpleError = String(e)
    }

    // Test 3: Try ventas with cliente join
    try {
      const ventasWithCliente = await db
        .select({
          id: ventas.id,
          clienteNombre: clientes.nombre,
        })
        .from(ventas)
        .leftJoin(clientes, sql`${ventas.clienteId} = ${clientes.id}`)
        .limit(2)
      results.ventasWithClienteQuery = ventasWithCliente
    } catch (e) {
      results.ventasWithClienteError = String(e)
    }

    // Test 4: Try ordenes query
    try {
      const ordenesSimple = await db.select({ id: ordenesCompra.id }).from(ordenesCompra).limit(2)
      results.ordenesSimpleQuery = ordenesSimple
    } catch (e) {
      results.ordenesSimpleError = String(e)
    }

    results.status = 'success'
  } catch (error) {
    results.status = 'error'
    results.error = String(error)
    results.stack = error instanceof Error ? error.stack : undefined
  }

  return NextResponse.json(results, { status: 200 })
}
