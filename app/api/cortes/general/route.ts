import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { almacen, bancos, clientes, distribuidores, ordenesCompra, ventas } from '@/database/schema'
import { NextResponse } from 'next/server'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Corte consolidado general (sin filtro de fechas)
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
  try {
    // Obtener todos los bancos
    const bancosData = await db.select().from(bancos)

    // Obtener todas las ventas
    const ventasData = await db.select().from(ventas)

    // Obtener todas las órdenes de compra
    const ordenesData = await db.select().from(ordenesCompra)

    // Obtener clientes
    const clientesData = await db.select().from(clientes)

    // Obtener distribuidores
    const distribuidoresData = await db.select().from(distribuidores)

    // Obtener productos de almacén
    const almacenData = await db.select().from(almacen)

    // RESUMEN DE BANCOS
    const capitalTotal = bancosData.reduce((sum, b) => sum + (b.capitalActual || 0), 0)
    const historicoIngresosTotal = bancosData.reduce(
      (sum, b) => sum + (b.historicoIngresos || 0),
      0,
    )
    const historicoGastosTotal = bancosData.reduce((sum, b) => sum + (b.historicoGastos || 0), 0)

    // RESUMEN DE VENTAS
    const totalVentasHistorico = ventasData.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
    const totalCobradoHistorico = ventasData.reduce((sum, v) => sum + (v.montoPagado || 0), 0)
    const totalPendienteVentas = ventasData.reduce((sum, v) => sum + (v.montoRestante || 0), 0)
    const ventasCompletas = ventasData.filter((v) => v.estadoPago === 'completo').length
    const ventasParciales = ventasData.filter((v) => v.estadoPago === 'parcial').length
    const ventasPendientes = ventasData.filter((v) => v.estadoPago === 'pendiente').length

    // RESUMEN DE COMPRAS
    const totalComprasHistorico = ordenesData.reduce((sum, o) => sum + (o.total || 0), 0)
    const totalPagadoCompras = ordenesData.reduce((sum, o) => sum + (o.montoPagado || 0), 0)
    const totalPendienteCompras = ordenesData.reduce((sum, o) => sum + (o.montoRestante || 0), 0)
    const comprasCompletas = ordenesData.filter((o) => o.estado === 'completo').length
    const comprasParciales = ordenesData.filter((o) => o.estado === 'parcial').length
    const comprasPendientes = ordenesData.filter((o) => o.estado === 'pendiente').length

    // RESUMEN DE CLIENTES
    const clientesActivos = clientesData.filter((c) => c.estado === 'activo').length
    const totalDeudaClientes = clientesData.reduce((sum, c) => sum + (c.saldoPendiente || 0), 0)
    const clientesConDeuda = clientesData.filter((c) => (c.saldoPendiente || 0) > 0).length

    // RESUMEN DE DISTRIBUIDORES
    const distribuidoresActivos = distribuidoresData.filter((d) => d.estado === 'activo').length
    const totalDeudaDistribuidores = distribuidoresData.reduce(
      (sum, d) => sum + (d.saldoPendiente || 0),
      0,
    )

    // RESUMEN DE ALMACÉN
    const totalProductos = almacenData.length
    const valorTotalAlmacen = almacenData.reduce((sum, p) => {
      const valor = (p.cantidad || 0) * (p.precioCompra || 0)
      return sum + valor
    }, 0)
    const productosConStockBajo = almacenData.filter(
      (p) => (p.cantidad || 0) <= (p.minimo || 0),
    ).length

    // UTILIDAD NETA TOTAL
    const utilidadNetaTotal = historicoIngresosTotal - historicoGastosTotal

    // BALANCE GENERAL
    const porcentajeCobradoVentas =
      totalVentasHistorico > 0 ? (totalCobradoHistorico / totalVentasHistorico) * 100 : 0
    const porcentajePagadoCompras =
      totalComprasHistorico > 0 ? (totalPagadoCompras / totalComprasHistorico) * 100 : 0

    const corteGeneral = {
      resumen: {
        capitalTotal,
        utilidadNeta: utilidadNetaTotal,
        totalIngresos: historicoIngresosTotal,
        totalGastos: historicoGastosTotal,
        valorAlmacen: valorTotalAlmacen,
      },
      bancos: {
        cantidad: bancosData.length,
        capitalTotal,
        detalles: bancosData.map((b) => ({
          id: b.id,
          nombre: b.nombre,
          tipo: b.tipo,
          capital: b.capitalActual,
          ingresos: b.historicoIngresos,
          gastos: b.historicoGastos,
          activo: b.activo,
        })),
      },
      ventas: {
        total: ventasData.length,
        montoTotal: totalVentasHistorico,
        cobrado: totalCobradoHistorico,
        pendiente: totalPendienteVentas,
        porcentajeCobrado: porcentajeCobradoVentas,
        porEstado: {
          completas: ventasCompletas,
          parciales: ventasParciales,
          pendientes: ventasPendientes,
        },
      },
      compras: {
        total: ordenesData.length,
        montoTotal: totalComprasHistorico,
        pagado: totalPagadoCompras,
        pendiente: totalPendienteCompras,
        porcentajePagado: porcentajePagadoCompras,
        porEstado: {
          completas: comprasCompletas,
          parciales: comprasParciales,
          pendientes: comprasPendientes,
        },
      },
      clientes: {
        total: clientesData.length,
        activos: clientesActivos,
        conDeuda: clientesConDeuda,
        deudaTotal: totalDeudaClientes,
      },
      distribuidores: {
        total: distribuidoresData.length,
        activos: distribuidoresActivos,
        deudaTotal: totalDeudaDistribuidores,
      },
      almacen: {
        totalProductos,
        valorTotal: valorTotalAlmacen,
        conStockBajo: productosConStockBajo,
      },
      generadoEn: new Date().toISOString(),
    }

    logger.info('Corte general generado', {
      context: 'API/cortes/general',
      capitalTotal,
      utilidadNeta: utilidadNetaTotal,
    })

    return NextResponse.json(corteGeneral)
  } catch (error) {
    logger.error('Error generando corte general:', error as Error, {
      context: 'API/cortes/general',
    })
    return NextResponse.json(
      {
        error: 'Error interno al generar corte general',
      },
      { status: 500 },
    )
  }
}
