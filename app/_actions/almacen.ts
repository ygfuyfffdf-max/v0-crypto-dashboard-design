'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📋 CHRONOS INFINITY 2026 — SERVER ACTIONS: ALMACÉN
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { almacen } from '@/database/schema'
import { desc, eq, like, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

/**
 * Obtener todos los productos del almacén
 */
export async function getProductos(limit?: number) {
  try {
    const result = await db.query.almacen.findMany({
      orderBy: desc(almacen.createdAt),
      limit: limit ?? 100,
    })
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error al obtener productos', error, { context: 'getProductos' })
    return { success: false, error: 'Error al obtener productos' }
  }
}

/**
 * Obtener producto por ID
 */
export async function getProductoById(id: string) {
  try {
    const producto = await db.query.almacen.findFirst({
      where: eq(almacen.id, id),
    })
    if (!producto) {
      return { success: false, error: 'Producto no encontrado' }
    }
    return { success: true, data: producto }
  } catch (error) {
    logger.error('Error al obtener producto', error, { context: 'getProductoById', id })
    return { success: false, error: 'Error al obtener producto' }
  }
}

/**
 * Buscar productos
 */
export async function buscarProductos(query: string) {
  try {
    const result = await db.query.almacen.findMany({
      where: like(almacen.nombre, `%${query}%`),
      limit: 20,
    })
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error al buscar productos', error, { context: 'buscarProductos', query })
    return { success: false, error: 'Error en la búsqueda' }
  }
}

/**
 * Crear producto
 */
export async function createProducto(input: {
  nombre: string
  descripcion?: string
  cantidad: number
  precioCompra: number
  precioVenta: number
  minimo?: number
}) {
  try {
    const id = nanoid()

    await db.insert(almacen).values({
      id,
      nombre: input.nombre,
      descripcion: input.descripcion || null,
      cantidad: input.cantidad ?? 0,
      stockActual: input.cantidad ?? 0,
      minimo: input.minimo ?? 0,
      stockMinimo: input.minimo ?? 0,
      precioCompra: input.precioCompra,
      precioVenta: input.precioVenta,
    })

    revalidatePath('/almacen')
    revalidatePath('/dashboard')

    return { success: true, data: { id } }
  } catch (error) {
    logger.error('Error al crear producto', error, { context: 'createProducto', input })
    return { success: false, error: 'Error al crear producto' }
  }
}

/**
 * Actualizar producto
 */
export async function updateProducto(
  input: { id: string } & Partial<{
    nombre: string
    descripcion: string
    cantidad: number
    precioCompra: number
    precioVenta: number
    minimo: number
  }>,
) {
  try {
    const { id, ...datos } = input

    await db
      .update(almacen)
      .set({
        ...datos,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(almacen.id, id))

    revalidatePath('/almacen')
    revalidatePath('/dashboard')

    return { success: true, data: { id } }
  } catch (error) {
    logger.error('Error al actualizar producto', error, { context: 'updateProducto', input })
    return { success: false, error: 'Error al actualizar producto' }
  }
}

/**
 * Eliminar producto
 */
export async function deleteProducto(id: string) {
  try {
    await db.delete(almacen).where(eq(almacen.id, id))

    revalidatePath('/almacen')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error al eliminar producto', error, { context: 'deleteProducto', id })
    return { success: false, error: 'Error al eliminar producto' }
  }
}

/**
 * Ajustar inventario
 */
export async function ajustarInventario(input: {
  productoId: string
  cantidad: number
  tipo: 'entrada' | 'salida' | 'ajuste'
  motivo: string
}) {
  try {
    const producto = await db.query.almacen.findFirst({
      where: eq(almacen.id, input.productoId),
    })

    if (!producto) {
      return { success: false, error: 'Producto no encontrado' }
    }

    const stockActual = producto.cantidad ?? producto.stockActual ?? 0
    const nuevoStock =
      input.tipo === 'entrada' ? stockActual + input.cantidad : stockActual - input.cantidad

    if (nuevoStock < 0) {
      return { success: false, error: 'Stock insuficiente' }
    }

    await db
      .update(almacen)
      .set({
        cantidad: nuevoStock,
        stockActual: nuevoStock,
        updatedAt: sql`(unixepoch())`,
      })
      .where(eq(almacen.id, input.productoId))

    revalidatePath('/almacen')
    revalidatePath('/dashboard')

    return { success: true, data: { nuevoStock } }
  } catch (error) {
    logger.error('Error al ajustar inventario', error, { context: 'ajustarInventario', input })
    return { success: false, error: 'Error al ajustar inventario' }
  }
}

/**
 * Obtener productos con bajo stock
 */
export async function getProductosBajoStock() {
  try {
    const productos = await db.query.almacen.findMany()
    const bajoStock = productos.filter((p) => {
      const stock = p.cantidad ?? p.stockActual ?? 0
      const minimo = p.minimo ?? p.stockMinimo ?? 0
      return stock <= minimo
    })
    return { success: true, data: bajoStock }
  } catch (error) {
    logger.error('Error al obtener productos bajo stock', error, {
      context: 'getProductosBajoStock',
    })
    return { success: false, error: 'Error al obtener productos' }
  }
}

/**
 * Obtener estadísticas de almacén
 */
export async function getAlmacenStats() {
  try {
    const productos = await db.query.almacen.findMany()

    const total = productos.length
    const activos = productos.filter((p) => p.activo !== 0).length
    const bajoStock = productos.filter((p) => {
      const stock = p.cantidad ?? p.stockActual ?? 0
      const minimo = p.minimo ?? p.stockMinimo ?? 0
      return stock <= minimo && stock > 0
    }).length
    const sinStock = productos.filter((p) => (p.cantidad ?? p.stockActual ?? 0) === 0).length

    const valorInventario = productos.reduce(
      (sum, p) => sum + (p.cantidad ?? p.stockActual ?? 0) * (p.precioCompra ?? 0),
      0,
    )

    const valorVenta = productos.reduce(
      (sum, p) => sum + (p.cantidad ?? p.stockActual ?? 0) * (p.precioVenta ?? 0),
      0,
    )

    return {
      success: true,
      data: {
        total,
        activos,
        bajoStock,
        sinStock,
        valorInventario,
        valorVenta,
        gananciaPotencial: valorVenta - valorInventario,
      },
    }
  } catch (error) {
    logger.error('Error al obtener stats', error, { context: 'getAlmacenStats' })
    return { success: false, error: 'Error al obtener estadísticas' }
  }
}

/**
 * Obtener historial de entradas al almacén
 */
export async function getEntradasAlmacen(productoId?: string, limit?: number) {
  try {
    const { entradaAlmacen } = await import('@/database/schema')
    const result = await db.query.entradaAlmacen.findMany({
      with: {
        ordenCompra: {
          with: { distribuidor: true },
        },
        producto: true,
      },
      orderBy: desc(entradaAlmacen.createdAt),
      limit: limit ?? 100,
    })

    let filtered = result
    if (productoId) {
      filtered = result.filter(e => e.productoId === productoId)
    }

    return { success: true, data: filtered }
  } catch (error) {
    logger.error('Error al obtener entradas', error, { context: 'getEntradasAlmacen' })
    return { success: false, error: 'Error al obtener entradas' }
  }
}

/**
 * Obtener historial de salidas del almacén
 */
export async function getSalidasAlmacen(productoId?: string, limit?: number) {
  try {
    const { salidaAlmacen } = await import('@/database/schema')
    const result = await db.query.salidaAlmacen.findMany({
      with: {
        venta: {
          with: { cliente: true },
        },
        producto: true,
      },
      orderBy: desc(salidaAlmacen.createdAt),
      limit: limit ?? 100,
    })

    let filtered = result
    if (productoId) {
      filtered = result.filter(s => s.productoId === productoId)
    }

    return { success: true, data: filtered }
  } catch (error) {
    logger.error('Error al obtener salidas', error, { context: 'getSalidasAlmacen' })
    return { success: false, error: 'Error al obtener salidas' }
  }
}
