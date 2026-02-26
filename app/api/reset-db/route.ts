// @ts-nocheck
// RESET-DB ENDPOINT - Development only (P0 security fix)
// BLOCKED in production to prevent catastrophic data loss
import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import {
  almacen,
  bancos,
  clientes,
  distribuidores,
  entradaAlmacen,
  movimientos,
  ordenesCompra,
  salidaAlmacen,
  ventas,
} from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY: Environment guard — this endpoint MUST NOT exist in production
// ═══════════════════════════════════════════════════════════════════════════
const isDev = process.env.NODE_ENV !== 'production'

function blockedResponse() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Resetear toda la base de datos a estado limpio
// DEVELOPMENT ONLY — Requires confirmar + resetToken secret
// ═══════════════════════════════════════════════════════════════════════════
export async function POST(request: NextRequest) {
  if (!isDev) {
    return blockedResponse()
  }

  try {
    const body = await request.json().catch(() => ({}))
    const { confirmar = false } = body

    if (!confirmar) {
      return NextResponse.json({
        error: 'Debe confirmar el reset enviando { confirmar: true }',
        advertencia: '⚠️ ESTO BORRARÁ TODOS LOS DATOS (solo disponible en desarrollo)',
      }, { status: 400 })
    }

    logger.warn('🚨 [DEV] INICIANDO RESET COMPLETO DE BASE DE DATOS', {
      context: 'API/reset-db',
      environment: process.env.NODE_ENV,
      timestamp: Math.floor(Date.now() / 1000).toISOString(),
    })

    // Orden de borrado (respetando foreign keys)
    // 1. Tablas dependientes primero
    await db.delete(movimientos)
    await db.delete(salidaAlmacen)
    await db.delete(entradaAlmacen)
    await db.delete(ventas)
    await db.delete(ordenesCompra)

    // 2. Tablas principales
    await db.delete(almacen)
    await db.delete(clientes)
    await db.delete(distribuidores)

    // 3. Resetear bancos a capital inicial (NO borrar, solo resetear)
    const bancosIniciales = [
      { id: 'boveda_monte', capitalInicial: 100000 },
      { id: 'boveda_usa', capitalInicial: 50000 },
      { id: 'profit', capitalInicial: 25000 },
      { id: 'leftie', capitalInicial: 15000 },
      { id: 'azteca', capitalInicial: 10000 },
      { id: 'flete_sur', capitalInicial: 5000 },
      { id: 'utilidades', capitalInicial: 0 },
    ]

    for (const banco of bancosIniciales) {
      await db
        .update(bancos)
        .set({
          capitalActual: banco.capitalInicial,
          historicoIngresos: 0,
          historicoGastos: 0,
          updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(bancos.id, banco.id))
    }

    logger.info('✅ [DEV] Base de datos reseteada correctamente', {
      context: 'API/reset-db',
    })

    return NextResponse.json({
      success: true,
      mensaje: 'Base de datos reseteada a estado limpio (desarrollo)',
      borrado: {
        movimientos: true,
        salidaAlmacen: true,
        entradaAlmacen: true,
        ventas: true,
        ordenesCompra: true,
        almacen: true,
        clientes: true,
        distribuidores: true,
      },
      bancosReseteados: bancosIniciales.map(b => b.id),
    })
  } catch (error) {
    logger.error('Error reseteando base de datos:', error as Error, {
      context: 'API/reset-db',
    })
    return NextResponse.json(
      { error: 'Error al resetear base de datos' },
      { status: 500 },
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GET - Ver estado actual de las tablas (conteos)
// DEVELOPMENT ONLY
// ═══════════════════════════════════════════════════════════════════════════
export async function GET() {
  if (!isDev) {
    return blockedResponse()
  }

  try {
    const [
      movimientosCount,
      ventasCount,
      ocCount,
      almacenCount,
      clientesCount,
      distribuidoresCount,
      entradasCount,
      salidasCount,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(movimientos),
      db.select({ count: sql<number>`count(*)` }).from(ventas),
      db.select({ count: sql<number>`count(*)` }).from(ordenesCompra),
      db.select({ count: sql<number>`count(*)` }).from(almacen),
      db.select({ count: sql<number>`count(*)` }).from(clientes),
      db.select({ count: sql<number>`count(*)` }).from(distribuidores),
      db.select({ count: sql<number>`count(*)` }).from(entradaAlmacen),
      db.select({ count: sql<number>`count(*)` }).from(salidaAlmacen),
    ])

    const bancosData = await db.select().from(bancos)

    return NextResponse.json({
      conteos: {
        movimientos: movimientosCount[0]?.count || 0,
        ventas: ventasCount[0]?.count || 0,
        ordenesCompra: ocCount[0]?.count || 0,
        productosAlmacen: almacenCount[0]?.count || 0,
        clientes: clientesCount[0]?.count || 0,
        distribuidores: distribuidoresCount[0]?.count || 0,
        entradasAlmacen: entradasCount[0]?.count || 0,
        salidasAlmacen: salidasCount[0]?.count || 0,
      },
      bancos: bancosData.map(b => ({
        id: b.id,
        nombre: b.nombre,
        capitalActual: b.capitalActual,
        historicoIngresos: b.historicoIngresos,
        historicoGastos: b.historicoGastos,
      })),
    })
  } catch (error) {
    logger.error('Error obteniendo estado de BD:', error as Error, {
      context: 'API/reset-db',
    })
    return NextResponse.json(
      { error: 'Error al obtener estado' },
      { status: 500 },
    )
  }
}
