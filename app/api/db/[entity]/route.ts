import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import {
    almacen,
    bancos,
    clientes,
    distribuidores,
    movimientos,
    ordenesCompra,
    ventas,
} from '@/database/schema'
import { desc, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type EntityType =
  | 'bancos'
  | 'ventas'
  | 'clientes'
  | 'distribuidores'
  | 'ordenes'
  | 'movimientos'
  | 'almacen'

const entityMap = {
  bancos: { table: bancos, orderBy: bancos.orden },
  ventas: { table: ventas, orderBy: ventas.fecha },
  clientes: { table: clientes, orderBy: clientes.nombre },
  distribuidores: { table: distribuidores, orderBy: distribuidores.nombre },
  ordenes: { table: ordenesCompra, orderBy: ordenesCompra.fecha },
  movimientos: { table: movimientos, orderBy: movimientos.fecha },
  almacen: { table: almacen, orderBy: almacen.nombre },
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> },
) {
  try {
    const { entity } = await params

    if (!entity || !(entity in entityMap)) {
      return NextResponse.json({ error: 'Entidad inválida' }, { status: 400 })
    }

    const config = entityMap[entity as EntityType]

    let result

    switch (entity) {
      case 'bancos':
        result = await db.query.bancos.findMany({
          where: eq(bancos.activo, 1),
          orderBy: [bancos.orden],
        })
        break

      case 'ventas':
        result = await db.query.ventas.findMany({
          orderBy: [desc(ventas.fecha)],
          limit: 100,
        })
        break

      case 'clientes':
        result = await db.query.clientes.findMany({
          orderBy: [clientes.nombre],
        })
        break

      case 'distribuidores':
        result = await db.query.distribuidores.findMany({
          orderBy: [distribuidores.nombre],
        })
        break

      case 'ordenes':
        result = await db.query.ordenesCompra.findMany({
          orderBy: [desc(ordenesCompra.fecha)],
          limit: 100,
        })
        break

      case 'movimientos':
        result = await db.query.movimientos.findMany({
          orderBy: [desc(movimientos.fecha)],
          limit: 100,
        })
        break

      case 'almacen':
        result = await db.select().from(almacen).orderBy(almacen.nombre)
        break

      default:
        return NextResponse.json({ error: 'Entidad no soportada' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    logger.error('Error en API db:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
