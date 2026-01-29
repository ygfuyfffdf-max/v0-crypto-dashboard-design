/**
 * 🔍 API Route: Entity Search
 * ═══════════════════════════════════════════════════════════════════════════
 * Búsqueda de entidades del sistema (ventas, clientes, órdenes, distribuidores)
 * Endpoint: GET /api/search/entities?q={query}&category={category}
 * ═══════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { clientes, distribuidores, ordenesCompra, ventas } from '@/database/schema'
import { desc, like, or } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════

type SearchCategory = 'all' | 'ventas' | 'clientes' | 'ordenes' | 'distribuidores'

interface SearchResponse {
  ventas?: Array<{
    id: string
    concepto: string | null
    clienteNombre: string | null
    precioVenta: number | null
    fecha: string | null
    estadoPago: string | null
  }>
  clientes?: Array<{
    id: string
    nombre: string
    telefono: string | null
    email: string | null
    categoria: string | null
  }>
  ordenes?: Array<{
    id: string
    concepto: string | null
    distribuidorNombre: string | null
    montoTotal: number | null
    fecha: string | null
    estado: string | null
  }>
  distribuidores?: Array<{
    id: string
    nombre: string
    empresa: string | null
    telefono: string | null
    saldoPendiente: number | null
  }>
}

// ═══════════════════════════════════════════════════════════════════════════
// GET - Búsqueda de entidades
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''
    const category = (searchParams.get('category') || 'all') as SearchCategory
    const limit = Math.min(Number(searchParams.get('limit') || 10), 50)

    if (!query || query.length < 2) {
      return NextResponse.json(
        {
          error: 'La búsqueda debe tener al menos 2 caracteres',
        },
        { status: 400 },
      )
    }

    const searchPattern = `%${query}%`
    const response: SearchResponse = {}

    // ═══════════════════════════════════════════════════════════════════════
    // BÚSQUEDA EN VENTAS
    // ═══════════════════════════════════════════════════════════════════════
    if (category === 'all' || category === 'ventas') {
      const ventasResult = await db
        .select({
          id: ventas.id,
          productoId: ventas.productoId,
          clienteId: ventas.clienteId,
          precioTotalVenta: ventas.precioTotalVenta,
          fecha: ventas.fecha,
          estadoPago: ventas.estadoPago,
          observaciones: ventas.observaciones,
        })
        .from(ventas)
        .where(or(like(ventas.id, searchPattern), like(ventas.observaciones, searchPattern)))
        .orderBy(desc(ventas.fecha))
        .limit(limit)

      // Obtener nombres de clientes
      const ventasConClientes = await Promise.all(
        ventasResult.map(async (v) => {
          let clienteNombre = 'Cliente desconocido'
          if (v.clienteId) {
            const cliente = await db.query.clientes.findFirst({
              where: (c, { eq }) => eq(c.id, v.clienteId!),
              columns: { nombre: true },
            })
            clienteNombre = cliente?.nombre || 'Cliente desconocido'
          }
          return {
            id: v.id,
            concepto: v.observaciones || `Venta ${v.id.slice(0, 8)}`,
            clienteNombre,
            precioVenta: v.precioTotalVenta,
            fecha: v.fecha ? new Date(v.fecha).toISOString() : null,
            estadoPago: v.estadoPago,
          }
        }),
      )

      response.ventas = ventasConClientes
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BÚSQUEDA EN CLIENTES
    // ═══════════════════════════════════════════════════════════════════════
    if (category === 'all' || category === 'clientes') {
      const clientesResult = await db
        .select({
          id: clientes.id,
          nombre: clientes.nombre,
          telefono: clientes.telefono,
          email: clientes.email,
          categoria: clientes.categoria,
        })
        .from(clientes)
        .where(
          or(
            like(clientes.nombre, searchPattern),
            like(clientes.telefono, searchPattern),
            like(clientes.email, searchPattern),
            like(clientes.rfc, searchPattern),
          ),
        )
        .limit(limit)

      response.clientes = clientesResult
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BÚSQUEDA EN ÓRDENES DE COMPRA
    // ═══════════════════════════════════════════════════════════════════════
    if (category === 'all' || category === 'ordenes') {
      const ordenesResult = await db
        .select({
          id: ordenesCompra.id,
          producto: ordenesCompra.producto,
          numeroOrden: ordenesCompra.numeroOrden,
          distribuidorId: ordenesCompra.distribuidorId,
          total: ordenesCompra.total,
          fecha: ordenesCompra.fecha,
          estado: ordenesCompra.estado,
        })
        .from(ordenesCompra)
        .where(
          or(
            like(ordenesCompra.producto, searchPattern),
            like(ordenesCompra.id, searchPattern),
            like(ordenesCompra.numeroOrden, searchPattern),
          ),
        )
        .orderBy(desc(ordenesCompra.fecha))
        .limit(limit)

      // Obtener nombres de distribuidores
      const ordenesConDistribuidores = await Promise.all(
        ordenesResult.map(async (o) => {
          let distribuidorNombre = 'Distribuidor desconocido'
          if (o.distribuidorId) {
            const dist = await db.query.distribuidores.findFirst({
              where: (d, { eq }) => eq(d.id, o.distribuidorId!),
              columns: { nombre: true },
            })
            distribuidorNombre = dist?.nombre || 'Distribuidor desconocido'
          }
          return {
            id: o.id,
            concepto: o.producto || o.numeroOrden || `OC ${o.id.slice(0, 8)}`,
            distribuidorNombre,
            montoTotal: o.total,
            fecha: o.fecha ? new Date(o.fecha).toISOString() : null,
            estado: o.estado,
          }
        }),
      )

      response.ordenes = ordenesConDistribuidores
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BÚSQUEDA EN DISTRIBUIDORES
    // ═══════════════════════════════════════════════════════════════════════
    if (category === 'all' || category === 'distribuidores') {
      const distribuidoresResult = await db
        .select({
          id: distribuidores.id,
          nombre: distribuidores.nombre,
          empresa: distribuidores.empresa,
          telefono: distribuidores.telefono,
          saldoPendiente: distribuidores.saldoPendiente,
        })
        .from(distribuidores)
        .where(
          or(
            like(distribuidores.nombre, searchPattern),
            like(distribuidores.empresa, searchPattern),
            like(distribuidores.telefono, searchPattern),
          ),
        )
        .limit(limit)

      response.distribuidores = distribuidoresResult
    }

    logger.info('Búsqueda de entidades completada', {
      context: 'SearchAPI',
      data: {
        query,
        category,
        resultCounts: {
          ventas: response.ventas?.length || 0,
          clientes: response.clientes?.length || 0,
          ordenes: response.ordenes?.length || 0,
          distribuidores: response.distribuidores?.length || 0,
        },
      },
    })

    return NextResponse.json(response)
  } catch (error) {
    logger.error('Error en búsqueda de entidades', error as Error, {
      context: 'SearchAPI',
    })
    return NextResponse.json({ error: 'Error interno en búsqueda' }, { status: 500 })
  }
}
