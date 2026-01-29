import { AbonoClienteSchema } from '@/app/lib/schemas'
import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, clientes, movimientos, ventas } from '@/database/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener historial de abonos con filtros
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clienteId = searchParams.get('clienteId')
    const ventaId = searchParams.get('ventaId')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')
    const limite = parseInt(searchParams.get('limite') || '100')

    // Buscar en movimientos con tipo 'abono' o concepto que contenga abono
    const conditions = []

    if (clienteId) {
      // Buscar ventas del cliente y luego sus movimientos
      const ventasCliente = await db
        .select({ id: ventas.id })
        .from(ventas)
        .where(eq(ventas.clienteId, clienteId))

      if (ventasCliente.length > 0) {
        const ventaIds = ventasCliente.map((v) => v.id)
        // Filtrar por referencia que contenga IDs de ventas
      }
    }

    // Obtener abonos de la tabla de abonos si existe, o de movimientos
    const abonosData = await db
      .select({
        id: movimientos.id,
        bancoId: movimientos.bancoId,
        monto: movimientos.monto,
        concepto: movimientos.concepto,
        referencia: movimientos.referencia,
        fecha: movimientos.fecha,
      })
      .from(movimientos)
      .where(sql`${movimientos.concepto} LIKE '%abono%' OR ${movimientos.tipo} = 'ingreso'`)
      .orderBy(desc(movimientos.fecha))
      .limit(limite)

    return NextResponse.json({
      success: true,
      data: abonosData,
      count: abonosData.length,
    })
  } catch (error) {
    logger.error('Error obteniendo abonos', error as Error, { context: 'API/abonos' })
    return NextResponse.json({ error: 'Error al obtener abonos' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Registrar abono a una venta
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    logger.info('🔍 Input recibido en API/abonos POST', {
      context: 'API/abonos',
      data: {
        clienteId: body.clienteId,
        monto: body.monto,
        ventaId: body.ventaId,
      },
    })

    // Validación con Zod
    const validation = AbonoClienteSchema.safeParse(body)

    if (!validation.success) {
      logger.error('❌ Error de validación en abono', validation.error, {
        context: 'API/abonos',
        data: { errors: validation.error.errors },
      })
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 },
      )
    }

    const { clienteId, monto, fecha, notas } = validation.data
    const ventaId = body.ventaId // ID de venta específica (opcional)

    // Verificar que el cliente existe
    const [cliente] = await db.select().from(clientes).where(eq(clientes.id, clienteId))

    if (!cliente) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })
    }

    // Verificar que el cliente tiene deuda
    if ((cliente.saldoPendiente || 0) <= 0) {
      return NextResponse.json({ error: 'El cliente no tiene deuda pendiente' }, { status: 400 })
    }

    const now = new Date(fecha || Date.now())
    const abonoId = uuidv4()

    // Si se especifica una venta, aplicar el abono a esa venta
    if (ventaId) {
      const [venta] = await db.select().from(ventas).where(eq(ventas.id, ventaId))

      if (!venta) {
        return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
      }

      if (venta.clienteId !== clienteId) {
        return NextResponse.json({ error: 'La venta no pertenece al cliente' }, { status: 400 })
      }

      const montoRestante = venta.montoRestante || 0

      if (montoRestante <= 0) {
        return NextResponse.json({ error: 'La venta ya está pagada' }, { status: 400 })
      }

      // Calcular el abono efectivo (no puede exceder la deuda)
      const abonoEfectivo = Math.min(monto, montoRestante)
      const nuevoMontoPagado = (venta.montoPagado || 0) + abonoEfectivo
      const nuevoMontoRestante = (venta.precioTotalVenta || 0) - nuevoMontoPagado

      // Calcular distribución proporcional del abono a los 3 bancos
      const proporcionAbono = abonoEfectivo / (venta.precioTotalVenta || 1)

      const abonoBovedaMonte = (venta.montoBovedaMonte || 0) * proporcionAbono
      const abonoFletes = (venta.montoFletes || 0) * proporcionAbono
      const abonoUtilidades = (venta.montoUtilidades || 0) * proporcionAbono

      // Actualizar bancos con el abono
      if (abonoBovedaMonte > 0) {
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual + ${abonoBovedaMonte}`,
            historicoIngresos: sql`historico_ingresos + ${abonoBovedaMonte}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, 'boveda_monte'))

        await db.insert(movimientos).values({
          id: uuidv4(),
          bancoId: 'boveda_monte',
          tipo: 'ingreso',
          monto: abonoBovedaMonte,
          fecha: now,
          concepto: `Abono a venta ${ventaId} - Cliente ${cliente.nombre}`,
          referencia: abonoId,
          ventaId,
          clienteId,
        })
      }

      if (abonoFletes > 0) {
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual + ${abonoFletes}`,
            historicoIngresos: sql`historico_ingresos + ${abonoFletes}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, 'flete_sur'))

        await db.insert(movimientos).values({
          id: uuidv4(),
          bancoId: 'flete_sur',
          tipo: 'ingreso',
          monto: abonoFletes,
          fecha: now,
          concepto: `Abono a venta ${ventaId} - Flete`,
          referencia: abonoId,
          ventaId,
          clienteId,
        })
      }

      if (abonoUtilidades > 0) {
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual + ${abonoUtilidades}`,
            historicoIngresos: sql`historico_ingresos + ${abonoUtilidades}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, 'utilidades'))

        await db.insert(movimientos).values({
          id: uuidv4(),
          bancoId: 'utilidades',
          tipo: 'ingreso',
          monto: abonoUtilidades,
          fecha: now,
          concepto: `Abono a venta ${ventaId} - Ganancia`,
          referencia: abonoId,
          ventaId,
          clienteId,
        })
      }

      // Determinar nuevo estado
      let nuevoEstado: 'completo' | 'parcial' | 'pendiente' = 'pendiente'

      if (nuevoMontoRestante <= 0) {
        nuevoEstado = 'completo'
      } else if (nuevoMontoPagado > 0) {
        nuevoEstado = 'parcial'
      }

      // Actualizar venta
      await db
        .update(ventas)
        .set({
          montoPagado: nuevoMontoPagado,
          montoRestante: Math.max(0, nuevoMontoRestante),
          estadoPago: nuevoEstado,
          updatedAt: now,
        })
        .where(eq(ventas.id, ventaId))

      // Actualizar saldo del cliente
      await db
        .update(clientes)
        .set({
          saldoPendiente: sql`saldo_pendiente - ${abonoEfectivo}`,
          updatedAt: now,
        })
        .where(eq(clientes.id, clienteId))

      logger.info(`Abono registrado: $${abonoEfectivo} a venta ${ventaId}`, {
        context: 'API/abonos',
        clienteId,
        ventaId,
        monto: abonoEfectivo,
      })

      return NextResponse.json({
        success: true,
        abonoId,
        montoAplicado: abonoEfectivo,
        nuevoEstadoVenta: nuevoEstado,
        nuevoSaldoCliente: (cliente.saldoPendiente || 0) - abonoEfectivo,
        distribucion: {
          bovedaMonte: abonoBovedaMonte,
          fletes: abonoFletes,
          utilidades: abonoUtilidades,
        },
      })
    }

    // Si no se especifica venta, aplicar abono al saldo general del cliente
    // (esto requiere lógica adicional para distribuir entre ventas pendientes)
    // Por ahora, requerimos que se especifique la venta
    return NextResponse.json(
      { error: 'Debe especificar el ID de la venta (ventaId) para aplicar el abono' },
      { status: 400 },
    )
  } catch (error) {
    logger.error('Error registrando abono:', error as Error, { context: 'API/abonos' })
    return NextResponse.json({ error: 'Error interno al registrar abono' }, { status: 500 })
  }
}
