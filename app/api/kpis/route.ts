import { NextResponse } from 'next/server'
import { db } from '@/database'
import {
  bancos,
  ventas,
  ordenesCompra,
  clientes,
  distribuidores,
  almacen,
  movimientos,
} from '@/database/schema'
import { sql, gte } from 'drizzle-orm'
import { logger } from '@/app/lib/utils/logger'

// ═══════════════════════════════════════════════════════════════════════════
// GET - Métricas globales del sistema (KPIs)
// ═══════════════════════════════════════════════════════════════════════════

export async function GET() {
  try {
    // Calcular fechas para diferentes períodos
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000)
    const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000)

    // ═══════════════════════════════════════════════════════════════════════
    // OBTENER DATOS BASE
    // ═══════════════════════════════════════════════════════════════════════

    const [
      bancosData,
      todasVentas,
      todasOrdenes,
      todosClientes,
      todosDistribuidores,
      todosProductos,
      todosMovimientos,
    ] = await Promise.all([
      db.select().from(bancos),
      db.select().from(ventas),
      db.select().from(ordenesCompra),
      db.select().from(clientes),
      db.select().from(distribuidores),
      db.select().from(almacen),
      db.select().from(movimientos),
    ])

    // Ventas del mes actual
    const ventasMes = todasVentas.filter((v) => v.fecha && new Date(v.fecha) >= inicioMes)
    const ventas30Dias = todasVentas.filter((v) => v.fecha && new Date(v.fecha) >= hace30Dias)
    const ventas7Dias = todasVentas.filter((v) => v.fecha && new Date(v.fecha) >= hace7Dias)

    // Órdenes del mes actual
    const ordenesMes = todasOrdenes.filter((o) => o.fecha && new Date(o.fecha) >= inicioMes)
    const ordenes30Dias = todasOrdenes.filter((o) => o.fecha && new Date(o.fecha) >= hace30Dias)

    // ═══════════════════════════════════════════════════════════════════════
    // KPIs FINANCIEROS
    // ═══════════════════════════════════════════════════════════════════════

    const capitalTotal = bancosData.reduce((sum, b) => sum + (b.capitalActual || 0), 0)
    const ingresosHistoricos = bancosData.reduce((sum, b) => sum + (b.historicoIngresos || 0), 0)
    const gastosHistoricos = bancosData.reduce((sum, b) => sum + (b.historicoGastos || 0), 0)
    const utilidadNeta = ingresosHistoricos - gastosHistoricos
    const margenUtilidad = ingresosHistoricos > 0 ? (utilidadNeta / ingresosHistoricos) * 100 : 0

    // KPIs del mes
    const ingresosDelMes = todosMovimientos
      .filter((m) => m.tipo === 'ingreso' && m.fecha && new Date(m.fecha) >= inicioMes)
      .reduce((sum, m) => sum + (m.monto || 0), 0)

    const gastosDelMes = todosMovimientos
      .filter((m) => m.tipo === 'gasto' && m.fecha && new Date(m.fecha) >= inicioMes)
      .reduce((sum, m) => sum + (m.monto || 0), 0)

    const utilidadMes = ingresosDelMes - gastosDelMes

    // ═══════════════════════════════════════════════════════════════════════
    // KPIs DE VENTAS
    // ═══════════════════════════════════════════════════════════════════════

    const ventasTotales = todasVentas.length
    const ventasCompletas = todasVentas.filter((v) => v.estadoPago === 'completo').length
    const tasaConversion = ventasTotales > 0 ? (ventasCompletas / ventasTotales) * 100 : 0

    const montoTotalVentas = todasVentas.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
    const montoCobrado = todasVentas.reduce((sum, v) => sum + (v.montoPagado || 0), 0)
    const montoPendienteVentas = todasVentas.reduce((sum, v) => sum + (v.montoRestante || 0), 0)
    const tasaCobranza = montoTotalVentas > 0 ? (montoCobrado / montoTotalVentas) * 100 : 0

    // Ticket promedio
    const ticketPromedio = ventasTotales > 0 ? montoTotalVentas / ventasTotales : 0

    // Ventas del mes
    const ventasMesTotales = ventasMes.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
    const ventasMesCobradas = ventasMes.reduce((sum, v) => sum + (v.montoPagado || 0), 0)

    // Crecimiento comparado con período anterior
    const ventas30DiasTotal = ventas30Dias.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
    const ventas7DiasTotal = ventas7Dias.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)

    // ═══════════════════════════════════════════════════════════════════════
    // KPIs DE COMPRAS
    // ═══════════════════════════════════════════════════════════════════════

    const comprasTotales = todasOrdenes.length
    const montoTotalCompras = todasOrdenes.reduce((sum, o) => sum + (o.total || 0), 0)
    const montoPagadoCompras = todasOrdenes.reduce((sum, o) => sum + (o.montoPagado || 0), 0)
    const montoPendienteCompras = todasOrdenes.reduce((sum, o) => sum + (o.montoRestante || 0), 0)

    const comprasMesTotales = ordenesMes.reduce((sum, o) => sum + (o.total || 0), 0)

    // ═══════════════════════════════════════════════════════════════════════
    // KPIs DE CLIENTES
    // ═══════════════════════════════════════════════════════════════════════

    const totalClientes = todosClientes.length
    const clientesActivos = todosClientes.filter((c) => c.estado === 'activo').length
    const clientesConDeuda = todosClientes.filter((c) => (c.saldoPendiente || 0) > 0).length
    const deudaTotalClientes = todosClientes.reduce((sum, c) => sum + (c.saldoPendiente || 0), 0)
    const deudaPromedioPorCliente = clientesConDeuda > 0 ? deudaTotalClientes / clientesConDeuda : 0

    // ═══════════════════════════════════════════════════════════════════════
    // KPIs DE DISTRIBUIDORES
    // ═══════════════════════════════════════════════════════════════════════

    const totalDistribuidores = todosDistribuidores.length
    const distribuidoresActivos = todosDistribuidores.filter((d) => d.estado === 'activo').length
    const deudaTotalDistribuidores = todosDistribuidores.reduce(
      (sum, d) => sum + (d.saldoPendiente || 0),
      0,
    )

    // ═══════════════════════════════════════════════════════════════════════
    // KPIs DE INVENTARIO
    // ═══════════════════════════════════════════════════════════════════════

    const totalProductos = todosProductos.length
    const productosActivos = todosProductos.filter((p) => (p.cantidad || 0) > 0).length
    const productosStockBajo = todosProductos.filter(
      (p) => (p.cantidad || 0) <= (p.minimo || 0) && (p.cantidad || 0) > 0,
    ).length
    const productosSinStock = todosProductos.filter((p) => !p.cantidad || p.cantidad === 0).length

    const valorInventario = todosProductos.reduce((sum, p) => {
      return sum + (p.cantidad || 0) * (p.precioCompra || 0)
    }, 0)

    const rotacionInventario = montoTotalCompras > 0 ? valorInventario / montoTotalCompras : 0

    // ═══════════════════════════════════════════════════════════════════════
    // KPIs DE LIQUIDEZ Y SOLVENCIA
    // ═══════════════════════════════════════════════════════════════════════

    const activosLiquidos = capitalTotal
    const pasivosCirculantes = montoPendienteCompras + deudaTotalDistribuidores
    const ratioLiquidez = pasivosCirculantes > 0 ? activosLiquidos / pasivosCirculantes : 0

    const patrimonioNeto = capitalTotal + valorInventario
    const ratioSolvencia = pasivosCirculantes > 0 ? patrimonioNeto / pasivosCirculantes : 0

    // ═══════════════════════════════════════════════════════════════════════
    // RESPUESTA CON TODOS LOS KPIs
    // ═══════════════════════════════════════════════════════════════════════

    const kpis = {
      financiero: {
        capitalTotal,
        utilidadNeta,
        margenUtilidad: Math.round(margenUtilidad * 100) / 100,
        ingresosHistoricos,
        gastosHistoricos,
        utilidadMes,
        ingresosDelMes,
        gastosDelMes,
        ratioLiquidez: Math.round(ratioLiquidez * 100) / 100,
        ratioSolvencia: Math.round(ratioSolvencia * 100) / 100,
      },
      ventas: {
        total: ventasTotales,
        montoTotal: montoTotalVentas,
        montoCobrado,
        montoPendiente: montoPendienteVentas,
        tasaCobranza: Math.round(tasaCobranza * 100) / 100,
        tasaConversion: Math.round(tasaConversion * 100) / 100,
        ticketPromedio: Math.round(ticketPromedio * 100) / 100,
        ventasMes: {
          cantidad: ventasMes.length,
          monto: ventasMesTotales,
          cobrado: ventasMesCobradas,
        },
        ventas30Dias: {
          cantidad: ventas30Dias.length,
          monto: ventas30DiasTotal,
        },
        ventas7Dias: {
          cantidad: ventas7Dias.length,
          monto: ventas7DiasTotal,
        },
      },
      compras: {
        total: comprasTotales,
        montoTotal: montoTotalCompras,
        montoPagado: montoPagadoCompras,
        montoPendiente: montoPendienteCompras,
        comprasMes: {
          cantidad: ordenesMes.length,
          monto: comprasMesTotales,
        },
        compras30Dias: {
          cantidad: ordenes30Dias.length,
        },
      },
      clientes: {
        total: totalClientes,
        activos: clientesActivos,
        conDeuda: clientesConDeuda,
        deudaTotal: deudaTotalClientes,
        deudaPromedio: Math.round(deudaPromedioPorCliente * 100) / 100,
      },
      distribuidores: {
        total: totalDistribuidores,
        activos: distribuidoresActivos,
        deudaTotal: deudaTotalDistribuidores,
      },
      inventario: {
        totalProductos,
        productosActivos,
        productosStockBajo,
        productosSinStock,
        valorInventario: Math.round(valorInventario * 100) / 100,
        rotacion: Math.round(rotacionInventario * 100) / 100,
      },
      generadoEn: new Date().toISOString(),
    }

    logger.info('KPIs generados exitosamente', {
      context: 'API/kpis',
      capitalTotal,
      utilidadNeta,
      totalVentas: ventasTotales,
    })

    return NextResponse.json(kpis)
  } catch (error) {
    logger.error('Error generando KPIs:', error as Error, {
      context: 'API/kpis',
    })
    return NextResponse.json(
      {
        error: 'Error interno al generar KPIs',
      },
      { status: 500 },
    )
  }
}
