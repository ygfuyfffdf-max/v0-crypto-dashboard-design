'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📊 DASHBOARD DATA ACTIONS
 * ═══════════════════════════════════════════════════════════════════════════
 * Server actions para obtener datos del dashboard desde Turso/Drizzle
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, clientes, ordenesCompra, ventas } from '@/database/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'

/**
 * Obtener KPIs principales del dashboard
 */
export async function getDashboardKPIs() {
  try {
    // Capital total de todos los bancos
    const bancosData = await db.select().from(bancos).where(eq(bancos.activo, 1))
    const capitalTotal = bancosData.reduce((sum, banco) => sum + banco.capitalActual, 0)

    // Ventas del mes actual
    const now = new Date()
    const startOfMonth = Math.floor(new Date(now.getFullYear(), now.getMonth(), 1).getTime() / 1000)
    const endOfMonth = Math.floor(new Date(now.getFullYear(), now.getMonth() + 1, 0).getTime() / 1000)

    const ventasMes = await db
      .select()
      .from(ventas)
      .where(and(gte(ventas.fecha, startOfMonth), lte(ventas.fecha, endOfMonth)))

    const ventasMesTotal = ventasMes.reduce((sum, venta) => sum + venta.precioTotalVenta, 0)
    const cantidadVentasMes = ventasMes.length

    // Cuentas por cobrar (ventas con saldo pendiente)
    const ventasPendientes = await db
      .select()
      .from(ventas)
      .where(sql`${ventas.estadoPago} != 'completo'`)

    const cuentasPorCobrar = ventasPendientes.reduce((sum, venta) => sum + venta.montoRestante, 0)

    // Cuentas por pagar (órdenes de compra con deuda)
    const ocsPendientes = await db
      .select()
      .from(ordenesCompra)
      .where(sql`${ordenesCompra.estado} != 'completo'`)

    const cuentasPorPagar = ocsPendientes.reduce((sum, oc) => sum + (oc.montoRestante || 0), 0)

    // Margen promedio de ventas
    const todasVentas = await db.select().from(ventas)
    const margenPromedio =
      todasVentas.length > 0
        ? todasVentas.reduce((sum, venta) => sum + (venta.margenBruto || 0), 0) / todasVentas.length
        : 0

    // Clientes activos
    const clientesActivos = await db
      .select({ count: sql<number>`count(*)` })
      .from(clientes)
      .where(eq(clientes.estado, 'activo'))

    const numeroClientesActivos = clientesActivos[0]?.count || 0

    // Stock bajo mínimo (simplificado - podría mejorar con tabla de productos)
    const ocsConStockBajo = await db
      .select()
      .from(ordenesCompra)
      .where(sql`${ordenesCompra.stockActual} < 10 AND ${ordenesCompra.stockActual} > 0`)

    const stockBajoMinimo = ocsConStockBajo.length

    // OCs pendientes de pago
    const ocsPendientesConteo = ocsPendientes.length

    logger.info('KPIs del dashboard calculados correctamente', {
      context: 'getDashboardKPIs',
      data: { capitalTotal, ventasMesTotal, cuentasPorCobrar },
    })

    return {
      capitalTotal,
      ventasMes: ventasMesTotal,
      cantidadVentasMes,
      cuentasPorCobrar,
      cuentasPorPagar,
      margenPromedio,
      clientesActivos: numeroClientesActivos,
      stockBajoMinimo,
      ocsPendientes: ocsPendientesConteo,
    }
  } catch (error) {
    logger.error('Error al obtener KPIs del dashboard', error, { context: 'getDashboardKPIs' })
    throw error
  }
}

/**
 * Obtener ventas mensuales de los últimos 12 meses
 */
export async function getVentasMensuales() {
  try {
    const now = new Date()
    const hace12Meses = Math.floor(new Date(now.getFullYear(), now.getMonth() - 11, 1).getTime() / 1000)

    const ventasData = await db
      .select()
      .from(ventas)
      .where(gte(ventas.fecha, hace12Meses))
      .orderBy(ventas.fecha)

    // Agrupar por mes
    const ventasPorMes: Record<string, { total: number; cantidad: number }> = {}

    ventasData.forEach((venta) => {
      const fecha = new Date(venta.fecha)
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`

      if (!ventasPorMes[mesKey]) {
        ventasPorMes[mesKey] = { total: 0, cantidad: 0 }
      }

      ventasPorMes[mesKey].total += venta.precioTotalVenta
      ventasPorMes[mesKey].cantidad += 1
    })

    // Convertir a array con formato para Recharts
    const meses = []
    for (let i = 11; i >= 0; i--) {
      const fecha = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const mesKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`
      const mesNombre = fecha.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' })

      meses.push({
        mes: mesNombre,
        ventas: ventasPorMes[mesKey]?.total || 0,
        cantidad: ventasPorMes[mesKey]?.cantidad || 0,
      })
    }

    logger.info('Ventas mensuales obtenidas', {
      context: 'getVentasMensuales',
      data: { meses: meses.length },
    })

    return meses
  } catch (error) {
    logger.error('Error al obtener ventas mensuales', error, { context: 'getVentasMensuales' })
    throw error
  }
}

/**
 * Obtener distribución de capital por banco
 */
export async function getDistribucionBancos() {
  try {
    const bancosData = await db
      .select()
      .from(bancos)
      .where(eq(bancos.activo, 1))
      .orderBy(desc(bancos.capitalActual))

    const distribucion = bancosData.map((banco) => ({
      id: banco.id,
      nombre: banco.nombre,
      capital: banco.capitalActual,
      color: banco.color,
      tipo: banco.tipo,
    }))

    logger.info('Distribución de bancos obtenida', { context: 'getDistribucionBancos' })

    return distribucion
  } catch (error) {
    logger.error('Error al obtener distribución de bancos', error, {
      context: 'getDistribucionBancos',
    })
    throw error
  }
}

/**
 * Obtener top clientes por ventas y morosos
 */
export async function getTopClientes() {
  try {
    // Top 10 clientes por total de compras
    const topClientes = await db
      .select()
      .from(clientes)
      .orderBy(desc(clientes.totalCompras))
      .limit(10)

    // Top 10 morosos (mayor saldo pendiente)
    const topMorosos = await db
      .select()
      .from(clientes)
      .where(sql`${clientes.saldoPendiente} > 0`)
      .orderBy(desc(clientes.saldoPendiente))
      .limit(10)

    logger.info('Top clientes obtenidos', { context: 'getTopClientes' })

    return {
      topClientes: topClientes.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        totalCompras: c.totalCompras,
        numeroVentas: c.numeroVentas,
      })),
      topMorosos: topMorosos.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        saldoPendiente: c.saldoPendiente,
        diasSinComprar: c.diasSinComprar,
      })),
    }
  } catch (error) {
    logger.error('Error al obtener top clientes', error, { context: 'getTopClientes' })
    throw error
  }
}

/**
 * Obtener productos más vendidos (basado en OCs)
 */
export async function getProductosMasVendidos() {
  try {
    // Obtener OCs ordenadas por cantidad vendida
    const ocsData = await db
      .select()
      .from(ordenesCompra)
      .orderBy(desc(ordenesCompra.stockVendido))
      .limit(10)

    const productosVendidos = ocsData
      .map((oc) => {
        const cantidadVendida = oc.stockVendido || 0
        const montoVendido = oc.totalVentasGeneradas || 0

        return {
          id: oc.id,
          nombre: oc.producto || 'Producto sin nombre',
          cantidadVendida,
          montoVendido,
          distribuidor: oc.distribuidorId,
        }
      })
      .filter((p) => p.cantidadVendida > 0)

    logger.info('Productos más vendidos obtenidos', { context: 'getProductosMasVendidos' })

    return productosVendidos
  } catch (error) {
    logger.error('Error al obtener productos más vendidos', error, {
      context: 'getProductosMasVendidos',
    })
    throw error
  }
}

/**
 * Obtener alertas del sistema
 */
export async function getAlertas() {
  try {
    const alertas: { tipo: string; severidad: string; mensaje: string; id: string }[] = []

    // Stock bajo mínimo
    const ocsStockBajo = await db
      .select()
      .from(ordenesCompra)
      .where(sql`${ordenesCompra.stockActual} < 10 AND ${ordenesCompra.stockActual} > 0`)
      .limit(5)

    ocsStockBajo.forEach((oc) => {
      alertas.push({
        tipo: 'stock',
        severidad: 'warning',
        mensaje: `Stock bajo: ${oc.producto || oc.id} (${oc.stockActual} unidades)`,
        id: oc.id,
      })
    })

    // Clientes con crédito excedido o morosos
    const clientesMorosos = await db
      .select()
      .from(clientes)
      .where(sql`${clientes.saldoPendiente} > ${clientes.limiteCredito} * 0.9`)
      .limit(5)

    clientesMorosos.forEach((cliente) => {
      alertas.push({
        tipo: 'credito',
        severidad: 'danger',
        mensaje: `Crédito excedido: ${cliente.nombre} ($${(cliente.saldoPendiente ?? 0).toFixed(2)})`,
        id: cliente.id,
      })
    })

    // OCs vencidas o con deuda
    const ocsVencidas = await db
      .select()
      .from(ordenesCompra)
      .where(sql`${ordenesCompra.montoRestante} > 0`)
      .limit(5)

    ocsVencidas.forEach((oc) => {
      alertas.push({
        tipo: 'oc_vencida',
        severidad: 'warning',
        mensaje: `OC pendiente: ${oc.id} - $${(oc.montoRestante || 0).toFixed(2)}`,
        id: oc.id,
      })
    })

    // Ventas sin abono > 30 días
    const hace30Dias = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60

    const ventasSinAbono = await db
      .select()
      .from(ventas)
      .where(and(eq(ventas.estadoPago, 'pendiente'), lte(ventas.fecha, hace30Dias)))
      .limit(5)

    ventasSinAbono.forEach((venta) => {
      alertas.push({
        tipo: 'venta_vencida',
        severidad: 'danger',
        mensaje: `Venta sin pago: ${venta.id} - $${venta.montoRestante.toFixed(2)}`,
        id: venta.id,
      })
    })

    logger.info('Alertas del sistema obtenidas', {
      context: 'getAlertas',
      data: { total: alertas.length },
    })

    return alertas
  } catch (error) {
    logger.error('Error al obtener alertas', error, { context: 'getAlertas' })
    throw error
  }
}

/**
 * Obtener actividad reciente (últimas 20 transacciones)
 */
export async function getActividadReciente() {
  try {
    // Últimas ventas
    const ultimasVentas = await db
      .select({
        id: ventas.id,
        fecha: ventas.fecha,
        tipo: sql<string>`'venta'`,
        monto: ventas.precioTotalVenta,
        descripcion: sql<string>`'Venta ID: ' || ${ventas.id}`,
        clienteId: ventas.clienteId,
      })
      .from(ventas)
      .orderBy(desc(ventas.fecha))
      .limit(20)

    logger.info('Actividad reciente obtenida', { context: 'getActividadReciente' })

    return ultimasVentas
  } catch (error) {
    logger.error('Error al obtener actividad reciente', error, { context: 'getActividadReciente' })
    throw error
  }
}
