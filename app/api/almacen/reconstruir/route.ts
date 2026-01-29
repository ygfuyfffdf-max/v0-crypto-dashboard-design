import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import {
    almacen,
    entradaAlmacen,
    ordenesCompra,
    salidaAlmacen,
    ventas,
} from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// ═══════════════════════════════════════════════════════════════════════════
// POST - Reconstruir entradas y salidas desde OCs y Ventas existentes
// Esto corrige datos históricos que no tenían registro de entradas/salidas
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { limpiarPrimero = true, soloFaltantes = false } = body

    const ahora = new Date()
    const resultados = {
      entradasCreadas: 0,
      salidasCreadas: 0,
      entradasExistentes: 0,
      salidasExistentes: 0,
      productosActualizados: 0,
      errores: [] as string[],
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 1: Limpiar entradas y salidas existentes (opcional)
    // ═══════════════════════════════════════════════════════════════════════
    if (limpiarPrimero && !soloFaltantes) {
      await db.delete(entradaAlmacen)
      await db.delete(salidaAlmacen)
      logger.info('Entradas y salidas limpiadas', { context: 'API/almacen/reconstruir' })
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 2: Obtener todas las OCs y crear entradas
    // ═══════════════════════════════════════════════════════════════════════
    const todasOC = await db.select().from(ordenesCompra)

    for (const oc of todasOC) {
      // Verificar si ya existe entrada para esta OC (solo si soloFaltantes)
      if (soloFaltantes) {
        const [entradaExistente] = await db
          .select()
          .from(entradaAlmacen)
          .where(eq(entradaAlmacen.ordenCompraId, oc.id))
          .limit(1)

        if (entradaExistente) {
          resultados.entradasExistentes++
          continue
        }
      }

      try {
        // Crear entrada de almacén
        await db.insert(entradaAlmacen).values({
          id: `entrada_${uuidv4().slice(0, 12)}`,
          ordenCompraId: oc.id,
          productoId: oc.productoId || null,
          cantidad: oc.cantidad || 0,
          costoTotal: oc.total || 0,
          fecha: oc.fecha || ahora,
          observaciones: `Entrada reconstruida - OC ${oc.numeroOrden || oc.id} - ${oc.producto || 'Producto'}`,
        })

        resultados.entradasCreadas++

        logger.info('Entrada creada para OC', {
          context: 'API/almacen/reconstruir',
          data: { ocId: oc.id, numeroOrden: oc.numeroOrden, cantidad: oc.cantidad },
        })
      } catch (error) {
        resultados.errores.push(`Error creando entrada para OC ${oc.id}: ${error}`)
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 3: Obtener todas las Ventas y crear salidas
    // ═══════════════════════════════════════════════════════════════════════
    const todasVentas = await db.select().from(ventas)

    for (const venta of todasVentas) {
      // Verificar si ya existe salida para esta venta (solo si soloFaltantes)
      if (soloFaltantes) {
        const [salidaExistente] = await db
          .select()
          .from(salidaAlmacen)
          .where(eq(salidaAlmacen.ventaId, venta.id))
          .limit(1)

        if (salidaExistente) {
          resultados.salidasExistentes++
          continue
        }
      }

      try {
        // Validar que productoId sea un ID de producto válido (no distribuidor)
        let productoIdValido: string | null = null
        if (venta.productoId && venta.productoId.startsWith('prod_')) {
          productoIdValido = venta.productoId
        } else if (venta.productoId) {
          // Verificar si existe en almacen
          const [productoExiste] = await db
            .select({ id: almacen.id })
            .from(almacen)
            .where(eq(almacen.id, venta.productoId))
            .limit(1)
          if (productoExiste) {
            productoIdValido = venta.productoId
          }
        }

        // Crear salida de almacén
        await db.insert(salidaAlmacen).values({
          id: `salida_${uuidv4().slice(0, 12)}`,
          ventaId: venta.id,
          productoId: productoIdValido, // Solo usar si es válido
          cantidad: venta.cantidad || 0,
          origenLotes: venta.origenLotes || (venta.ocId ? JSON.stringify([{ ocId: venta.ocId }]) : null),
          fecha: venta.fecha || ahora,
          observaciones: `Salida reconstruida - Venta ${venta.id.slice(-8)} - ${venta.cantidad} unidades`,
        })

        resultados.salidasCreadas++

        logger.info('Salida creada para Venta', {
          context: 'API/almacen/reconstruir',
          data: { ventaId: venta.id, cantidad: venta.cantidad },
        })
      } catch (error) {
        resultados.errores.push(`Error creando salida para Venta ${venta.id}: ${error}`)
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PASO 4: Recalcular stock de cada producto basado en OCs
    // ═══════════════════════════════════════════════════════════════════════
    const productos = await db.select().from(almacen)

    for (const producto of productos) {
      try {
        // Calcular entradas desde OCs que tienen este productoId
        const [entradasSum] = await db
          .select({
            total: sql<number>`COALESCE(SUM(${ordenesCompra.cantidad}), 0)`,
          })
          .from(ordenesCompra)
          .where(eq(ordenesCompra.productoId, producto.id))

        // Calcular salidas desde ventas que tienen este productoId
        const [salidasSum] = await db
          .select({
            total: sql<number>`COALESCE(SUM(${ventas.cantidad}), 0)`,
          })
          .from(ventas)
          .where(eq(ventas.productoId, producto.id))

        const totalEntradas = Number(entradasSum?.total || 0)
        const totalSalidas = Number(salidasSum?.total || 0)
        const stockCalculado = Math.max(0, totalEntradas - totalSalidas)

        // Actualizar producto
        await db
          .update(almacen)
          .set({
            cantidad: stockCalculado,
            stockActual: stockCalculado,
            totalEntradas: totalEntradas,
            totalSalidas: totalSalidas,
            updatedAt: ahora,
          })
          .where(eq(almacen.id, producto.id))

        resultados.productosActualizados++

        logger.info('Producto actualizado', {
          context: 'API/almacen/reconstruir',
          data: {
            productoId: producto.id,
            nombre: producto.nombre,
            entradas: totalEntradas,
            salidas: totalSalidas,
            stockNuevo: stockCalculado,
          },
        })
      } catch (error) {
        resultados.errores.push(`Error actualizando producto ${producto.id}: ${error}`)
      }
    }

    return NextResponse.json({
      success: true,
      mensaje: 'Reconstrucción completada',
      resultados,
      resumen: {
        ordenesCompra: todasOC.length,
        ventas: todasVentas.length,
        productos: productos.length,
      },
    })
  } catch (error) {
    logger.error('Error reconstruyendo almacén:', error as Error, {
      context: 'API/almacen/reconstruir',
    })
    return NextResponse.json(
      { error: 'Error al reconstruir datos', detalle: (error as Error).message },
      { status: 500 },
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE - Limpiar todos los datos de almacén (para testing)
// ═══════════════════════════════════════════════════════════════════════════

export async function DELETE() {
  try {
    // Limpiar entradas y salidas
    await db.delete(entradaAlmacen)
    await db.delete(salidaAlmacen)

    // Resetear stock de productos a 0
    await db
      .update(almacen)
      .set({
        cantidad: 0,
        stockActual: 0,
        totalEntradas: 0,
        totalSalidas: 0,
        updatedAt: new Date(),
      })

    logger.info('Datos de almacén limpiados', { context: 'API/almacen/reconstruir' })

    return NextResponse.json({
      success: true,
      mensaje: 'Datos de almacén limpiados correctamente',
    })
  } catch (error) {
    logger.error('Error limpiando almacén:', error as Error, {
      context: 'API/almacen/reconstruir',
    })
    return NextResponse.json(
      { error: 'Error al limpiar datos' },
      { status: 500 },
    )
  }
}
