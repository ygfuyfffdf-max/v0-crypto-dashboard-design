import { db } from '@/database'
import { ordenesCompra } from '@/database/schema'
import { eq, isNull, or, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Actualizar stockActual donde es 0 o null usando Drizzle
    await db
      .update(ordenesCompra)
      .set({
        stockActual: sql`${ordenesCompra.cantidad}`,
        updatedAt: new Date(),
      })
      .where(or(eq(ordenesCompra.stockActual, 0), isNull(ordenesCompra.stockActual)))

    // Obtener resumen
    const ordenes = await db.select().from(ordenesCompra)

    return NextResponse.json({
      success: true,
      mensaje: 'Stock actualizado correctamente',
      ordenes: ordenes.map((oc) => ({
        numeroOrden: oc.numeroOrden,
        producto: oc.producto,
        cantidad: oc.cantidad,
        stockActual: oc.stockActual,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar stock', detalle: (error as Error).message },
      { status: 500 },
    )
  }
}
