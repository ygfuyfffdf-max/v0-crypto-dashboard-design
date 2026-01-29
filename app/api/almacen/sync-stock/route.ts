import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { almacen } from '@/database/schema'
import { sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// POST - Sincronizar stockActual con cantidad para todos los productos
// ═══════════════════════════════════════════════════════════════════════════
// Este endpoint corrige el problema donde "cantidad" tiene el valor correcto
// pero "stockActual" está en 0 (o desincronizado)
// ═══════════════════════════════════════════════════════════════════════════

export async function POST() {
  try {
    // Sincronizar stockActual = cantidad para todos los productos
    const result = await db.update(almacen).set({
      stockActual: sql`cantidad`,
      updatedAt: sql`(unixepoch())`,
    })

    logger.info('Stock sincronizado exitosamente', {
      context: 'API/almacen/sync-stock',
    })

    // Obtener el estado actual después de la sincronización
    const productos = await db.select().from(almacen)

    return NextResponse.json({
      success: true,
      mensaje: 'Stock sincronizado: stockActual ahora refleja el valor de cantidad',
      productosActualizados: productos.length,
      productos: productos.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        stockActual: p.stockActual,
      })),
    })
  } catch (error) {
    logger.error('Error sincronizando stock:', error as Error, {
      context: 'API/almacen/sync-stock',
    })
    return NextResponse.json(
      {
        error: 'Error interno al sincronizar stock',
      },
      { status: 500 },
    )
  }
}

// GET - Ver estado actual de sincronización
export async function GET() {
  try {
    const productos = await db.select().from(almacen)

    const desincronizados = productos.filter((p) => p.cantidad !== p.stockActual)

    return NextResponse.json({
      totalProductos: productos.length,
      sincronizados: productos.length - desincronizados.length,
      desincronizados: desincronizados.length,
      productosDesincronizados: desincronizados.map((p) => ({
        id: p.id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        stockActual: p.stockActual,
        diferencia: (p.cantidad || 0) - (p.stockActual || 0),
      })),
    })
  } catch (error) {
    logger.error('Error verificando sincronización:', error as Error, {
      context: 'API/almacen/sync-stock',
    })
    return NextResponse.json(
      {
        error: 'Error interno',
      },
      { status: 500 },
    )
  }
}
