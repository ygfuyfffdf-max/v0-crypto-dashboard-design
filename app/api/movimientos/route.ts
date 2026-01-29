import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { clientes, distribuidores, movimientos, ordenesCompra, ventas } from '@/database/schema'
import { and, desc, eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener movimientos con filtros opcionales Y TRAZABILIDAD COMPLETA
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bancoId = searchParams.get('bancoId')
    const tipo = searchParams.get('tipo')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Query con TRAZABILIDAD COMPLETA
    const result = await db
      .select({
        // Datos del movimiento
        id: movimientos.id,
        bancoId: movimientos.bancoId,
        tipo: movimientos.tipo,
        monto: movimientos.monto,
        fecha: movimientos.fecha,
        concepto: movimientos.concepto,
        referencia: movimientos.referencia,
        observaciones: movimientos.observaciones,
        createdAt: movimientos.createdAt,
        // TRAZABILIDAD
        ventaId: movimientos.ventaId,
        ordenCompraId: movimientos.ordenCompraId,
        clienteId: movimientos.clienteId,
        distribuidorId: movimientos.distribuidorId,
        // Datos relacionados del cliente
        clienteNombre: clientes.nombre,
        // Datos relacionados del distribuidor
        distribuidorNombre: distribuidores.nombre,
      })
      .from(movimientos)
      .leftJoin(clientes, eq(movimientos.clienteId, clientes.id))
      .leftJoin(distribuidores, eq(movimientos.distribuidorId, distribuidores.id))
      .where(
        and(
          bancoId ? eq(movimientos.bancoId, bancoId) : undefined,
          tipo
            ? eq(
                movimientos.tipo,
                tipo as
                  | 'ingreso'
                  | 'gasto'
                  | 'transferencia_entrada'
                  | 'transferencia_salida'
                  | 'abono'
                  | 'pago',
              )
            : undefined,
        ),
      )
      .orderBy(desc(movimientos.fecha))
      .limit(limit)

    // Transformar para incluir objetos relacionados
    const transformedResult = result.map((row) => ({
      id: row.id,
      bancoId: row.bancoId,
      tipo: row.tipo,
      monto: row.monto,
      fecha: row.fecha,
      concepto: row.concepto,
      referencia: row.referencia,
      observaciones: row.observaciones,
      createdAt: row.createdAt,
      // TRAZABILIDAD COMPLETA
      ventaId: row.ventaId,
      ordenCompraId: row.ordenCompraId,
      clienteId: row.clienteId,
      distribuidorId: row.distribuidorId,
      // Objetos relacionados
      cliente: row.clienteNombre
        ? {
            id: row.clienteId,
            nombre: row.clienteNombre,
          }
        : null,
      distribuidor: row.distribuidorNombre
        ? {
            id: row.distribuidorId,
            nombre: row.distribuidorNombre,
          }
        : null,
    }))

    return NextResponse.json(transformedResult, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      },
    })
  } catch (error) {
    logger.error('Error fetching movimientos:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Crear nuevo movimiento
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      bancoId,
      tipo,
      monto,
      concepto,
      referencia,
      clienteId,
      distribuidorId,
      ventaId,
      ordenCompraId,
      observaciones,
    } = body

    // Validaciones
    if (!bancoId || !tipo || monto === undefined || !concepto) {
      return NextResponse.json(
        { error: 'Campos requeridos: bancoId, tipo, monto, concepto' },
        { status: 400 },
      )
    }

    const movimientoId = uuidv4()
    const now = new Date()

    await db.insert(movimientos).values({
      id: movimientoId,
      bancoId,
      tipo,
      monto,
      fecha: now,
      concepto,
      referencia,
      clienteId,
      distribuidorId,
      ventaId,
      ordenCompraId,
      observaciones,
    })

    // ═══════════════════════════════════════════════════════════════════
    // LÓGICA ESPECIAL: Pago a Distribuidor
    // Actualizar saldoPendiente del distribuidor y orden de compra
    // ═══════════════════════════════════════════════════════════════════
    if (distribuidorId && tipo === 'gasto') {
      // Actualizar saldo pendiente del distribuidor
      await db
        .update(distribuidores)
        .set({
          saldoPendiente: sql`${distribuidores.saldoPendiente} - ${monto}`,
          totalPagado: sql`${distribuidores.totalPagado} + ${monto}`,
          numeroPagos: sql`${distribuidores.numeroPagos} + 1`,
        })
        .where(eq(distribuidores.id, distribuidorId))

      // Si se especificó una orden de compra, actualizar esa orden
      if (ordenCompraId) {
        // Obtener la orden actual
        const [orden] = await db
          .select()
          .from(ordenesCompra)
          .where(eq(ordenesCompra.id, ordenCompraId))
          .limit(1)

        if (orden) {
          const nuevoMontoPagado = (orden.montoPagado ?? 0) + monto
          const nuevoMontoRestante = (orden.montoRestante ?? orden.total) - monto
          const nuevoPorcentaje = (nuevoMontoPagado / orden.total) * 100
          const nuevoEstado =
            nuevoMontoRestante <= 0 ? 'completo' : nuevoMontoPagado > 0 ? 'parcial' : 'pendiente'

          await db
            .update(ordenesCompra)
            .set({
              montoPagado: nuevoMontoPagado,
              montoRestante: Math.max(0, nuevoMontoRestante),
              porcentajePagado: nuevoPorcentaje,
              numeroPagos: sql`${ordenesCompra.numeroPagos} + 1`,
              fechaUltimoPago: now,
              estado: nuevoEstado as 'pendiente' | 'parcial' | 'completo' | 'cancelado',
            })
            .where(eq(ordenesCompra.id, ordenCompraId))
        }
      }

      logger.info('Pago a distribuidor registrado', {
        context: 'API',
        data: { distribuidorId, ordenCompraId, monto },
      })
    }

    // ═══════════════════════════════════════════════════════════════════
    // LÓGICA ESPECIAL: Abono de Cliente
    // Actualizar saldoPendiente del cliente y ventas relacionadas
    // ═══════════════════════════════════════════════════════════════════
    if (clienteId && tipo === 'ingreso') {
      // Actualizar saldo pendiente del cliente
      await db
        .update(clientes)
        .set({
          saldoPendiente: sql`COALESCE(${clientes.saldoPendiente}, 0) - ${monto}`,
          totalPagado: sql`COALESCE(${clientes.totalPagado}, 0) + ${monto}`,
          numeroAbonos: sql`COALESCE(${clientes.numeroAbonos}, 0) + 1`,
          updatedAt: now,
        })
        .where(eq(clientes.id, clienteId))

      // Si se especificó una venta, actualizar esa venta
      if (ventaId) {
        const [venta] = await db.select().from(ventas).where(eq(ventas.id, ventaId)).limit(1)

        if (venta) {
          const nuevoMontoPagado = (venta.montoPagado ?? 0) + monto
          const precioTotal = venta.precioTotalVenta ?? 0
          const nuevoMontoRestante = precioTotal - nuevoMontoPagado
          const nuevoEstadoPago =
            nuevoMontoRestante <= 0 ? 'completo' : nuevoMontoPagado > 0 ? 'parcial' : 'pendiente'

          await db
            .update(ventas)
            .set({
              montoPagado: nuevoMontoPagado,
              montoRestante: Math.max(0, nuevoMontoRestante),
              estadoPago: nuevoEstadoPago as 'pendiente' | 'parcial' | 'completo',
              updatedAt: now,
            })
            .where(eq(ventas.id, ventaId))
        }
      } else {
        // Si no hay venta específica, aplicar abono a ventas pendientes del cliente (FIFO)
        const ventasPendientes = await db
          .select()
          .from(ventas)
          .where(
            and(
              eq(ventas.clienteId, clienteId),
              sql`${ventas.estadoPago} IN ('pendiente', 'parcial')`,
            ),
          )
          .orderBy(ventas.fecha)

        let montoRestante = monto
        for (const venta of ventasPendientes) {
          if (montoRestante <= 0) break

          const deudaVenta = venta.montoRestante ?? venta.precioTotalVenta ?? 0
          const abonoAVenta = Math.min(montoRestante, deudaVenta)
          const nuevoMontoPagado = (venta.montoPagado ?? 0) + abonoAVenta
          const nuevoMontoRestante = deudaVenta - abonoAVenta
          const nuevoEstado = nuevoMontoRestante <= 0 ? 'completo' : 'parcial'

          await db
            .update(ventas)
            .set({
              montoPagado: nuevoMontoPagado,
              montoRestante: Math.max(0, nuevoMontoRestante),
              estadoPago: nuevoEstado as 'pendiente' | 'parcial' | 'completo',
              updatedAt: now,
            })
            .where(eq(ventas.id, venta.id))

          montoRestante -= abonoAVenta
        }
      }

      logger.info('Abono de cliente registrado', {
        context: 'API',
        data: { clienteId, ventaId, monto },
      })
    }

    return NextResponse.json({
      success: true,
      movimientoId,
    })
  } catch (error) {
    logger.error('Error creando movimiento:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
