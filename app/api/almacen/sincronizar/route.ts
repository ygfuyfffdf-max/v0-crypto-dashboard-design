import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { almacen, entradaAlmacen, ordenesCompra, salidaAlmacen } from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// POST - Sincronizar stock de almacén basado en entradas/salidas reales
// Corrige inconsistencias donde el stock no coincide con el historial
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { productoId, forzar = false } = body

    const ahora = Math.floor(Date.now() / 1000)
    const resultados: Array<{
      productoId: string
      nombre: string
      stockAnterior: number
      stockCalculado: number
      diferencia: number
      corregido: boolean
    }> = []

    // Si se especifica un producto, sincronizar solo ese
    // Si no, sincronizar todos los productos
    const productos = productoId
      ? await db.select().from(almacen).where(eq(almacen.id, productoId))
      : await db.select().from(almacen)

    for (const producto of productos) {
      // Calcular total de entradas desde la tabla entradaAlmacen (por productoId)
      const [entradasResult] = await db
        .select({
          total: sql<number>`COALESCE(SUM(${entradaAlmacen.cantidad}), 0)`,
        })
        .from(entradaAlmacen)
        .where(eq(entradaAlmacen.productoId, producto.id))

      // Calcular total de salidas desde la tabla salidaAlmacen (por productoId)
      const [salidasResult] = await db
        .select({
          total: sql<number>`COALESCE(SUM(${salidaAlmacen.cantidad}), 0)`,
        })
        .from(salidaAlmacen)
        .where(eq(salidaAlmacen.productoId, producto.id))

      // Calcular entradas desde órdenes de compra que apuntan a este producto
      const [entradasOCResult] = await db
        .select({
          total: sql<number>`COALESCE(SUM(${ordenesCompra.cantidad}), 0)`,
        })
        .from(ordenesCompra)
        .where(eq(ordenesCompra.productoId, producto.id))

      // También buscar entradas indirectas: entradas sin productoId pero con OC que sí tiene productoId
      // Usar subquery para evitar problemas con el JOIN complejo
      const [entradasIndirectas] = await db
        .select({
          total: sql<number>`COALESCE(
            (SELECT SUM(ea.cantidad) FROM entrada_almacen ea
             INNER JOIN ordenes_compra oc ON ea.orden_compra_id = oc.id
             WHERE ea.producto_id IS NULL AND oc.producto_id = ${producto.id}),
            0)`,
        })
        .from(sql`(SELECT 1) as dummy`)

      const totalEntradas = Number(entradasResult?.total || 0)
      const totalEntradasOC = Number(entradasOCResult?.total || 0)
      const totalEntradasIndirectas = Number(entradasIndirectas?.total || 0)
      const totalSalidas = Number(salidasResult?.total || 0)

      // Usar el mayor entre entradas registradas y entradas de OC + indirectas
      const entradasReales = Math.max(totalEntradas + totalEntradasIndirectas, totalEntradasOC)
      const stockCalculado = entradasReales - totalSalidas
      const stockActual = producto.cantidad ?? 0
      const diferencia = stockCalculado - stockActual

      resultados.push({
        productoId: producto.id,
        nombre: producto.nombre ?? 'Sin nombre',
        stockAnterior: stockActual,
        stockCalculado: Math.max(0, stockCalculado),
        diferencia,
        corregido: false,
      })

      // Corregir si hay diferencia y se permite (forzar o diferencia significativa)
      if (diferencia !== 0 && (forzar || Math.abs(diferencia) > 0)) {
        await db
          .update(almacen)
          .set({
            cantidad: Math.max(0, stockCalculado),
            stockActual: Math.max(0, stockCalculado),
            totalEntradas: entradasReales,
            totalSalidas: totalSalidas,
            updatedAt: ahora,
          })
          .where(eq(almacen.id, producto.id))

        resultados[resultados.length - 1]!.corregido = true

        logger.info('Stock sincronizado', {
          context: 'API/almacen/sincronizar',
          data: {
            productoId: producto.id,
            nombre: producto.nombre,
            stockAnterior: stockActual,
            stockNuevo: Math.max(0, stockCalculado),
            entradas: entradasReales,
            salidas: totalSalidas,
          },
        })
      }
    }

    const corregidos = resultados.filter((r) => r.corregido).length
    const conDiferencias = resultados.filter((r) => r.diferencia !== 0).length

    return NextResponse.json({
      success: true,
      mensaje: `Sincronización completada: ${corregidos} productos corregidos de ${conDiferencias} con diferencias`,
      totalProductos: productos.length,
      productosCorregidos: corregidos,
      productosConDiferencias: conDiferencias,
      detalles: resultados.filter((r) => r.diferencia !== 0),
    })
  } catch (error) {
    logger.error('Error sincronizando stock:', error as Error, {
      context: 'API/almacen/sincronizar',
    })
    return NextResponse.json(
      { error: 'Error al sincronizar stock', detalle: (error as Error).message },
      { status: 500 },
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener reporte de inconsistencias sin corregir
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
  try {
    const productos = await db.select().from(almacen)
    const inconsistencias: Array<{
      productoId: string
      nombre: string
      stockRegistrado: number
      entradasRegistradas: number
      salidasRegistradas: number
      stockCalculado: number
      diferencia: number
    }> = []

    for (const producto of productos) {
      const [entradas] = await db
        .select({ total: sql<number>`COALESCE(SUM(${entradaAlmacen.cantidad}), 0)` })
        .from(entradaAlmacen)
        .where(eq(entradaAlmacen.productoId, producto.id))

      const [salidas] = await db
        .select({ total: sql<number>`COALESCE(SUM(${salidaAlmacen.cantidad}), 0)` })
        .from(salidaAlmacen)
        .where(eq(salidaAlmacen.productoId, producto.id))

      const [entradasOC] = await db
        .select({ total: sql<number>`COALESCE(SUM(${ordenesCompra.cantidad}), 0)` })
        .from(ordenesCompra)
        .where(eq(ordenesCompra.productoId, producto.id))

      const totalEntradas = Math.max(
        Number(entradas?.total || 0),
        Number(entradasOC?.total || 0),
      )
      const totalSalidas = Number(salidas?.total || 0)
      const stockCalculado = totalEntradas - totalSalidas
      const stockRegistrado = producto.cantidad ?? 0
      const diferencia = stockCalculado - stockRegistrado

      if (diferencia !== 0) {
        inconsistencias.push({
          productoId: producto.id,
          nombre: producto.nombre ?? 'Sin nombre',
          stockRegistrado,
          entradasRegistradas: totalEntradas,
          salidasRegistradas: totalSalidas,
          stockCalculado: Math.max(0, stockCalculado),
          diferencia,
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalProductos: productos.length,
      inconsistenciasEncontradas: inconsistencias.length,
      inconsistencias,
    })
  } catch (error) {
    logger.error('Error obteniendo inconsistencias:', error as Error, {
      context: 'API/almacen/sincronizar',
    })
    return NextResponse.json(
      { error: 'Error al obtener inconsistencias' },
      { status: 500 },
    )
  }
}
