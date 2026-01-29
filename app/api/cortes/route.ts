import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, movimientos, ordenesCompra, ventas } from '@/database/schema'
import { and, gte, lte } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener info básica de cortes (placeholder)
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
  return NextResponse.json({
    message: 'Use POST para generar un corte de caja con fechaInicio y fechaFin',
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Generar corte de caja (por rango de fechas)
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fechaInicio, fechaFin } = body

    if (!fechaInicio || !fechaFin) {
      return NextResponse.json({ error: 'Se requieren fechaInicio y fechaFin' }, { status: 400 })
    }

    const inicio = new Date(fechaInicio)
    const fin = new Date(fechaFin)

    if (inicio > fin) {
      return NextResponse.json(
        { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
        { status: 400 },
      )
    }

    // Obtener todos los bancos con su capital actual
    const bancosData = await db.select().from(bancos)

    // Obtener ventas en el rango de fechas (sin relaciones para compatibilidad)
    const ventasData = await db
      .select()
      .from(ventas)
      .where(and(gte(ventas.fecha, inicio), lte(ventas.fecha, fin)))

    // Obtener órdenes de compra en el rango (sin relaciones para compatibilidad)
    const ordenesData = await db
      .select()
      .from(ordenesCompra)
      .where(and(gte(ordenesCompra.fecha, inicio), lte(ordenesCompra.fecha, fin)))

    // Obtener movimientos en el rango
    const movimientosData = await db
      .select()
      .from(movimientos)
      .where(and(gte(movimientos.fecha, inicio), lte(movimientos.fecha, fin)))

    // Calcular totales de ventas
    const totalVentas = ventasData.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
    const totalCobrado = ventasData.reduce((sum, v) => sum + (v.montoPagado || 0), 0)
    const totalPendiente = ventasData.reduce((sum, v) => sum + (v.montoRestante || 0), 0)

    // Calcular totales de compras
    const totalCompras = ordenesData.reduce((sum, o) => sum + (o.total || 0), 0)
    const totalPagadoCompras = ordenesData.reduce((sum, o) => sum + (o.montoPagado || 0), 0)
    const totalPendienteCompras = ordenesData.reduce((sum, o) => sum + (o.montoRestante || 0), 0)

    // Calcular movimientos por tipo
    const ingresos = movimientosData.filter((m) => m.tipo === 'ingreso')
    const gastos = movimientosData.filter((m) => m.tipo === 'gasto')
    const transferencias = movimientosData.filter(
      (m) => m.tipo === 'transferencia_entrada' || m.tipo === 'transferencia_salida',
    )
    const pagos = movimientosData.filter((m) => m.tipo === 'pago')

    const totalIngresos = ingresos.reduce((sum, m) => sum + (m.monto || 0), 0)
    const totalGastos = gastos.reduce((sum, m) => sum + (m.monto || 0), 0)
    const totalTransferencias = transferencias.reduce((sum, m) => sum + Math.abs(m.monto || 0), 0)
    const totalPagos = pagos.reduce((sum, m) => sum + (m.monto || 0), 0)

    // Capital total del sistema
    const capitalTotal = bancosData.reduce((sum, b) => sum + (b.capitalActual || 0), 0)

    // Utilidad neta del período
    const utilidadNeta = totalCobrado - totalPagadoCompras - totalGastos

    const corte = {
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin,
      },
      ventas: {
        cantidad: ventasData.length,
        totalVentas,
        totalCobrado,
        totalPendiente,
        porcentajeCobrado: totalVentas > 0 ? (totalCobrado / totalVentas) * 100 : 0,
      },
      compras: {
        cantidad: ordenesData.length,
        totalCompras,
        totalPagado: totalPagadoCompras,
        totalPendiente: totalPendienteCompras,
        porcentajePagado: totalCompras > 0 ? (totalPagadoCompras / totalCompras) * 100 : 0,
      },
      movimientos: {
        total: movimientosData.length,
        ingresos: {
          cantidad: ingresos.length,
          monto: totalIngresos,
        },
        gastos: {
          cantidad: gastos.length,
          monto: totalGastos,
        },
        transferencias: {
          cantidad: transferencias.length,
          monto: totalTransferencias,
        },
        pagos: {
          cantidad: pagos.length,
          monto: totalPagos,
        },
      },
      financiero: {
        capitalTotal,
        utilidadNeta,
        flujoEfectivo: totalIngresos - totalGastos - totalPagos,
      },
      bancos: bancosData.map((b) => ({
        id: b.id,
        nombre: b.nombre,
        capitalActual: b.capitalActual,
        historicoIngresos: b.historicoIngresos,
        historicoGastos: b.historicoGastos,
      })),
      generadoEn: new Date().toISOString(),
    }

    logger.info('Corte de caja generado', {
      context: 'API/cortes',
      fechaInicio,
      fechaFin,
      capitalTotal,
      utilidadNeta,
    })

    return NextResponse.json(corte)
  } catch (error) {
    logger.error('Error generando corte de caja:', error as Error, {
      context: 'API/cortes',
    })
    return NextResponse.json(
      {
        error: 'Error interno al generar corte',
      },
      { status: 500 },
    )
  }
}
