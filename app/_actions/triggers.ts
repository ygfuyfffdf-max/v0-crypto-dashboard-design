'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🔄 TRIGGERS DE RECÁLCULO AUTOMÁTICO - CHRONOS INFINITY 2026
 * ═══════════════════════════════════════════════════════════════════════════
 * Funciones que se ejecutan después de operaciones CRUD para mantener
 * sincronizadas las métricas derivadas en todo el sistema.
 *
 * PRINCIPIO: Las métricas derivadas se recalculan automáticamente,
 * los históricos son INMUTABLES y siempre se SUMAN.
 *
 * ENTIDADES CON TRIGGERS:
 * - Clientes: scoring, categorización, frecuencia, deuda
 * - Distribuidores: rotación, rentabilidad, stock
 * - Órdenes de Compra: rotación, margen, estado
 * - Productos/Almacén: ventas, ganancia, rotación
 * - Bancos: flujo, tendencias, scoring
 * ═══════════════════════════════════════════════════════════════════════════
 */

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
import { eq, sql } from 'drizzle-orm'

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGER: Actualizar métricas de cliente después de una venta
// ═══════════════════════════════════════════════════════════════════════════

export async function actualizarMetricasCliente(clienteId: string): Promise<void> {
  try {
    const now = new Date()

    // Obtener todas las ventas del cliente
    const ventasCliente = await db.select().from(ventas).where(eq(ventas.clienteId, clienteId))

    if (ventasCliente.length === 0) {
      logger.info('Cliente sin ventas, no se actualizan métricas', {
        context: 'Triggers',
        data: { clienteId },
      })
      return
    }

    // Calcular métricas
    const totalCompras = ventasCliente.reduce((sum, v) => sum + (v.precioTotalVenta ?? 0), 0)
    const totalPagado = ventasCliente.reduce((sum, v) => sum + (v.montoPagado ?? 0), 0)
    const saldoPendiente = ventasCliente.reduce((sum, v) => sum + (v.montoRestante ?? 0), 0)
    const numeroVentas = ventasCliente.length
    const promedioCompra = numeroVentas > 0 ? totalCompras / numeroVentas : 0
    const gananciaGenerada = ventasCliente.reduce((sum, v) => sum + (v.montoUtilidades ?? 0), 0)

    // Encontrar última compra
    const ultimaVenta = ventasCliente.reduce((latest, v) => {
      const fechaV = v.fecha ? new Date(v.fecha) : new Date(0)
      const fechaLatest = latest?.fecha ? new Date(latest.fecha) : new Date(0)
      return fechaV > fechaLatest ? v : latest
    }, ventasCliente[0])

    const ultimaCompra = ultimaVenta?.fecha ? new Date(ultimaVenta.fecha) : null
    const diasSinComprar = ultimaCompra
      ? Math.floor((now.getTime() - ultimaCompra.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    // Calcular frecuencia de compra (ventas/mes en últimos 6 meses)
    const hace6Meses = new Date()
    hace6Meses.setMonth(hace6Meses.getMonth() - 6)
    const ventasRecientes = ventasCliente.filter((v) => {
      const fecha = v.fecha ? new Date(v.fecha) : new Date(0)
      return fecha >= hace6Meses
    })
    const frecuenciaCompra = ventasRecientes.length / 6

    // Calcular % de pago puntual (pagado completo en menos de 30 días)
    const ventasPagadas = ventasCliente.filter((v) => v.estadoPago === 'completo')
    const porcentajePagoPuntual = numeroVentas > 0 ? (ventasPagadas.length / numeroVentas) * 100 : 0

    // Calcular score de crédito (0-100)
    const scoreCredito = calcularScoreCredito({
      porcentajePagoPuntual,
      saldoPendiente,
      totalCompras,
      frecuenciaCompra,
    })

    // Determinar categoría
    const categoria = determinarCategoria({
      scoreCredito,
      frecuenciaCompra,
      gananciaGenerada,
      diasSinComprar,
      saldoPendiente,
    })

    // Actualizar cliente
    await db
      .update(clientes)
      .set({
        totalCompras,
        totalPagado,
        saldoPendiente,
        numeroVentas,
        promedioCompra,
        gananciaGenerada,
        ultimaCompra,
        diasSinComprar,
        frecuenciaCompra,
        porcentajePagoPuntual,
        scoreCredito,
        categoria,
        ticketPromedio: promedioCompra,
        valorVidaCliente: gananciaGenerada,
        updatedAt: now,
      })
      .where(eq(clientes.id, clienteId))

    logger.info('Métricas de cliente actualizadas', {
      context: 'Triggers',
      data: {
        clienteId,
        totalCompras,
        saldoPendiente,
        scoreCredito,
        categoria,
      },
    })
  } catch (error) {
    logger.error('Error actualizando métricas de cliente', error as Error, {
      context: 'Triggers',
      data: { clienteId },
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGER: Actualizar métricas de distribuidor después de OC/pago
// ═══════════════════════════════════════════════════════════════════════════

export async function actualizarMetricasDistribuidor(distribuidorId: string): Promise<void> {
  try {
    const now = new Date()

    // Obtener todas las OC del distribuidor
    const ocsDistribuidor = await db
      .select()
      .from(ordenesCompra)
      .where(eq(ordenesCompra.distribuidorId, distribuidorId))

    if (ocsDistribuidor.length === 0) {
      logger.info('Distribuidor sin OCs, no se actualizan métricas', {
        context: 'Triggers',
        data: { distribuidorId },
      })
      return
    }

    // Calcular métricas
    const totalOrdenes = ocsDistribuidor.length
    const totalComprado = ocsDistribuidor.reduce((sum, oc) => sum + (oc.total ?? 0), 0)
    const totalPagado = ocsDistribuidor.reduce((sum, oc) => sum + (oc.montoPagado ?? 0), 0)
    const saldoPendiente = totalComprado - totalPagado
    const stockTotal = ocsDistribuidor.reduce((sum, oc) => sum + (oc.stockActual ?? 0), 0)
    const stockVendido = ocsDistribuidor.reduce((sum, oc) => sum + (oc.stockVendido ?? 0), 0)

    // Calcular rentabilidad de las OCs (ganancias de ventas hechas con sus productos)
    const gananciasDeOCs = ocsDistribuidor.reduce((sum, oc) => sum + (oc.gananciaRealizada ?? 0), 0)

    // Promedio de margen por OC
    const margenPromedio =
      totalOrdenes > 0
        ? ocsDistribuidor.reduce((sum, oc) => sum + (oc.margenBruto ?? 0), 0) / totalOrdenes
        : 0

    // Actualizar distribuidor
    await db
      .update(distribuidores)
      .set({
        saldoPendiente,
        stockTotal,
        stockVendido,
        gananciaGenerada: gananciasDeOCs,
        margenPromedio,
        updatedAt: now,
      })
      .where(eq(distribuidores.id, distribuidorId))

    logger.info('Métricas de distribuidor actualizadas', {
      context: 'Triggers',
      data: {
        distribuidorId,
        saldoPendiente,
        stockTotal,
        totalOrdenes,
      },
    })
  } catch (error) {
    logger.error('Error actualizando métricas de distribuidor', error as Error, {
      context: 'Triggers',
      data: { distribuidorId },
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGER: Actualizar métricas de OC después de una venta
// ═══════════════════════════════════════════════════════════════════════════

export async function actualizarMetricasOC(ocId: string): Promise<void> {
  try {
    const now = new Date()

    // Obtener la OC
    const [oc] = await db.select().from(ordenesCompra).where(eq(ordenesCompra.id, ocId))

    if (!oc) {
      logger.warn('OC no encontrada para actualizar métricas', {
        context: 'Triggers',
        data: { ocId },
      })
      return
    }

    // Buscar ventas que usan esta OC (por origenLotes)
    const ventasConOC = await db
      .select()
      .from(ventas)
      .where(sql`json_extract(${ventas.origenLotes}, '$[0].ocId') = ${ocId}`)

    // Calcular métricas de venta
    const stockVendido = ventasConOC.reduce((sum, v) => sum + (v.cantidad ?? 0), 0)
    const stockActual = (oc.cantidad ?? 0) - stockVendido
    const ingresoVentas = ventasConOC.reduce((sum, v) => sum + (v.precioTotalVenta ?? 0), 0)
    const utilidadGenerada = ventasConOC.reduce((sum, v) => sum + (v.montoUtilidades ?? 0), 0)
    const _costoTotal = oc.total ?? 0
    const margenPromedio = ingresoVentas > 0 ? (utilidadGenerada / ingresoVentas) * 100 : 0

    // Calcular rotación en días
    const fechaOC = oc.fecha ? new Date(oc.fecha) : now
    const diasDesdeOC = Math.floor((now.getTime() - fechaOC.getTime()) / (1000 * 60 * 60 * 24))
    const _rotacionDias =
      stockVendido > 0 ? diasDesdeOC / (stockVendido / (oc.cantidad ?? 1)) : null

    // Actualizar OC
    await db
      .update(ordenesCompra)
      .set({
        stockActual,
        stockVendido,
        totalVentasGeneradas: ingresoVentas,
        gananciaRealizada: utilidadGenerada,
        margenBruto: margenPromedio,
        updatedAt: now,
      })
      .where(eq(ordenesCompra.id, ocId))

    logger.info('Métricas de OC actualizadas', {
      context: 'Triggers',
      data: {
        ocId,
        stockActual,
        stockVendido,
        utilidadGenerada,
        margenPromedio,
      },
    })

    // También actualizar métricas del distribuidor
    if (oc.distribuidorId) {
      await actualizarMetricasDistribuidor(oc.distribuidorId)
    }
  } catch (error) {
    logger.error('Error actualizando métricas de OC', error as Error, {
      context: 'Triggers',
      data: { ocId },
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function calcularScoreCredito(params: {
  porcentajePagoPuntual: number
  saldoPendiente: number
  totalCompras: number
  frecuenciaCompra: number
}): number {
  const { porcentajePagoPuntual, saldoPendiente, totalCompras, frecuenciaCompra } = params

  // Componentes del score (ponderados)
  const scorePago = porcentajePagoPuntual * 0.4 // 40% del score
  const scoreDeuda =
    totalCompras > 0
      ? Math.max(0, 1 - saldoPendiente / totalCompras) * 100 * 0.3 // 30% del score
      : 50 * 0.3
  const scoreFrecuencia = Math.min(frecuenciaCompra * 10, 100) * 0.3 // 30% del score

  return Math.round(scorePago + scoreDeuda + scoreFrecuencia)
}

function determinarCategoria(params: {
  scoreCredito: number
  frecuenciaCompra: number
  gananciaGenerada: number
  diasSinComprar: number
  saldoPendiente: number
}): 'VIP' | 'frecuente' | 'ocasional' | 'nuevo' | 'inactivo' | 'moroso' {
  const { scoreCredito, frecuenciaCompra, gananciaGenerada, diasSinComprar, saldoPendiente } =
    params

  // Moroso: tiene deuda y más de 30 días sin pagar
  if (saldoPendiente > 0 && diasSinComprar > 30) {
    return 'moroso'
  }

  // Inactivo: más de 90 días sin comprar
  if (diasSinComprar > 90) {
    return 'inactivo'
  }

  // VIP: alto score, alta frecuencia, alta ganancia
  if (scoreCredito >= 80 && frecuenciaCompra >= 2 && gananciaGenerada >= 50000) {
    return 'VIP'
  }

  // Frecuente: score decente, compra regularmente
  if (scoreCredito >= 60 && frecuenciaCompra >= 1) {
    return 'frecuente'
  }

  // Nuevo: pocas compras
  if (frecuenciaCompra < 0.5) {
    return 'nuevo'
  }

  return 'ocasional'
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGER MASTER: Ejecutar después de una venta
// ═══════════════════════════════════════════════════════════════════════════

export async function triggerPostVenta(params: {
  ventaId: string
  clienteId: string
  ocRelacionada?: string
}): Promise<void> {
  const { clienteId, ocRelacionada } = params

  try {
    // 1. Actualizar métricas del cliente
    await actualizarMetricasCliente(clienteId)

    // 2. Si hay OC relacionada, actualizar sus métricas
    if (ocRelacionada) {
      await actualizarMetricasOC(ocRelacionada)
    }

    logger.info('Triggers post-venta ejecutados', {
      context: 'Triggers',
      data: params,
    })
  } catch (error) {
    logger.error('Error en triggers post-venta', error as Error, {
      context: 'Triggers',
      data: params,
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGER MASTER: Ejecutar después de un pago/abono
// ═══════════════════════════════════════════════════════════════════════════

export async function triggerPostAbono(params: {
  ventaId: string
  clienteId: string
}): Promise<void> {
  const { clienteId } = params

  try {
    // Actualizar métricas del cliente
    await actualizarMetricasCliente(clienteId)

    logger.info('Triggers post-abono ejecutados', {
      context: 'Triggers',
      data: params,
    })
  } catch (error) {
    logger.error('Error en triggers post-abono', error as Error, {
      context: 'Triggers',
      data: params,
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRIGGER MASTER: Ejecutar después de crear/pagar OC
// ═══════════════════════════════════════════════════════════════════════════

export async function triggerPostOC(params: {
  ocId: string
  distribuidorId: string
}): Promise<void> {
  const { distribuidorId } = params

  try {
    // Actualizar métricas del distribuidor
    await actualizarMetricasDistribuidor(distribuidorId)

    logger.info('Triggers post-OC ejecutados', {
      context: 'Triggers',
      data: params,
    })
  } catch (error) {
    logger.error('Error en triggers post-OC', error as Error, {
      context: 'Triggers',
      data: params,
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📦 MÉTRICAS DE PRODUCTOS/ALMACÉN
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Actualiza todas las métricas derivadas de un producto en almacén
 * Se ejecuta después de: crear venta, abastecer stock, ajustar inventario
 */
export async function actualizarMetricasProducto(productoId: string): Promise<void> {
  try {
    const producto = await db.query.almacen.findFirst({
      where: eq(almacen.id, productoId),
    })

    if (!producto) {
      logger.warn('Producto no encontrado para actualizar métricas', {
        context: 'Triggers:Producto',
        data: { productoId },
      })
      return
    }

    // Obtener todas las ventas de este producto
    const ventasProducto = await db.query.ventas.findMany({
      where: eq(ventas.productoId, productoId),
    })

    // Calcular métricas de ventas
    const ahora = new Date()
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const inicioSemana = new Date(ahora)
    inicioSemana.setDate(ahora.getDate() - ahora.getDay())

    const ventasCompletas = ventasProducto.filter((v) => v.estado === 'pagada')
    const ventasMes = ventasProducto.filter((v) => new Date(v.fecha) >= inicioMes)
    const ventasSemana = ventasProducto.filter((v) => new Date(v.fecha) >= inicioSemana)

    // Totales de ventas
    const totalVentas = ventasCompletas.reduce((sum, v) => sum + v.precioTotalVenta, 0)
    const totalVentasMes = ventasMes.reduce((sum, v) => sum + v.precioTotalVenta, 0)
    const totalVentasSemana = ventasSemana.reduce((sum, v) => sum + v.precioTotalVenta, 0)
    const unidadesVendidas = ventasCompletas.reduce((sum, v) => sum + v.cantidad, 0)
    const unidadesVendidasMes = ventasMes.reduce((sum, v) => sum + v.cantidad, 0)

    // Calcular costo total vendido
    const costoTotalVendido = ventasCompletas.reduce((sum, v) => {
      return sum + v.precioCompraUnidad * v.cantidad
    }, 0)

    // Calcular ganancia total (usar gananciaTotal o gananciaNetaVenta con fallback)
    const gananciaTotal = ventasCompletas.reduce((sum, v) => {
      return sum + (v.gananciaNetaVenta ?? v.gananciaTotal ?? 0)
    }, 0)
    const gananciaMes = ventasMes.reduce(
      (sum, v) => sum + (v.gananciaNetaVenta ?? v.gananciaTotal ?? 0),
      0,
    )
    const gananciaSemana = ventasSemana.reduce(
      (sum, v) => sum + (v.gananciaNetaVenta ?? v.gananciaTotal ?? 0),
      0,
    )

    // Ticket promedio
    const ticketPromedio = ventasCompletas.length > 0 ? totalVentas / ventasCompletas.length : 0

    // Promedios de precios
    const precioCompraPromedio =
      ventasCompletas.length > 0
        ? ventasCompletas.reduce((sum, v) => sum + v.precioCompraUnidad, 0) / ventasCompletas.length
        : producto.precioCompra || 0

    const precioVentaPromedio =
      ventasCompletas.length > 0
        ? ventasCompletas.reduce((sum, v) => sum + v.precioVentaUnidad, 0) / ventasCompletas.length
        : producto.precioVenta || 0

    const fletePromedio =
      ventasCompletas.length > 0
        ? ventasCompletas.reduce((sum, v) => sum + (v.precioFleteUnidad ?? v.precioFlete ?? 0), 0) /
          ventasCompletas.length
        : 0

    // Márgenes
    const margenBruto =
      totalVentas > 0 ? ((totalVentas - costoTotalVendido) / totalVentas) * 100 : 0
    const margenNeto = totalVentas > 0 ? (gananciaTotal / totalVentas) * 100 : 0
    const margenSobreCosto = costoTotalVendido > 0 ? (gananciaTotal / costoTotalVendido) * 100 : 0

    // Rotación de inventario (anualizada)
    const costoPromedioInventario = (producto.precioCompra || 0) * (producto.stockActual || 0)
    const costoVentasMes = ventasMes.reduce((sum, v) => sum + v.precioCompraUnidad * v.cantidad, 0)
    const rotacionInventario =
      costoPromedioInventario > 0 ? (costoVentasMes * 12) / costoPromedioInventario : 0

    // Días de inventario
    const ventaPromedioDiaria = unidadesVendidasMes / 30
    const diasInventario =
      ventaPromedioDiaria > 0 ? Math.round((producto.stockActual || 0) / ventaPromedioDiaria) : 999
    const diasParaAgotarse = diasInventario

    // Velocidad de venta
    const velocidadVenta = ventaPromedioDiaria

    // Valor del stock
    const stockActual = producto.stockActual || 0
    const valorStockCosto = stockActual * (producto.precioCompra || 0)
    const valorStockVenta = stockActual * (producto.precioVenta || 0)
    const gananciaPotencial = valorStockVenta - valorStockCosto

    // Scoring (0-100)
    const scoreRentabilidad = Math.min(100, Math.round(margenNeto * 2))
    const scoreRotacion = Math.min(100, Math.round(rotacionInventario * 8.33)) // 12 rotaciones = 100
    const scoreDemanda = Math.min(100, Math.round((unidadesVendidasMes / 10) * 100)) // 10 unidades/mes = 100

    // Clasificación ABC basada en scores
    const scoreTotal = (scoreRentabilidad + scoreRotacion + scoreDemanda) / 3
    let clasificacionABC: 'A' | 'B' | 'C' = 'C'
    if (scoreTotal >= 70) clasificacionABC = 'A'
    else if (scoreTotal >= 40) clasificacionABC = 'B'

    // Actualizar en DB
    await db
      .update(almacen)
      .set({
        // Ventas
        ventasTotales: totalVentas,
        ventasMes: totalVentasMes,
        ventasSemana: totalVentasSemana,
        numeroVentas: ventasCompletas.length,
        numeroVentasMes: ventasMes.length,
        unidadesVendidas,
        unidadesVendidasMes,
        ticketPromedio: Math.round(ticketPromedio),

        // Promedios
        precioCompraPromedio: Math.round(precioCompraPromedio),
        precioVentaPromedio: Math.round(precioVentaPromedio),
        fletePromedio: Math.round(fletePromedio),

        // Rentabilidad
        costoTotalVendido,
        gananciaTotal,
        gananciaMes,
        gananciaSemana,
        margenBruto: Math.round(margenBruto * 100) / 100,
        margenNeto: Math.round(margenNeto * 100) / 100,
        margenSobreCosto: Math.round(margenSobreCosto * 100) / 100,

        // Rotación
        rotacionInventario: Math.round(rotacionInventario * 100) / 100,
        diasInventario,
        diasParaAgotarse,
        velocidadVenta: Math.round(velocidadVenta * 100) / 100,

        // Valor stock
        valorStockCosto,
        valorStockVenta,
        gananciaPotencial,

        // Scoring
        scoreRentabilidad,
        scoreRotacion,
        scoreDemanda,
        clasificacionABC,

        // Metadata
        ultimaActualizacionMetricas: new Date().toISOString(),
      })
      .where(eq(almacen.id, productoId))

    logger.info('Métricas de producto actualizadas', {
      context: 'Triggers:Producto',
      data: {
        productoId,
        clasificacionABC,
        scoreRentabilidad,
        rotacionInventario,
        gananciaTotal,
      },
    })
  } catch (error) {
    logger.error('Error actualizando métricas de producto', error as Error, {
      context: 'Triggers:Producto',
      data: { productoId },
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🏦 MÉTRICAS DE BANCOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Actualiza todas las métricas de flujo y proyección de un banco
 * Se ejecuta después de: movimientos, ventas, transferencias, distribución GYA
 */
export async function actualizarMetricasBanco(bancoId: string): Promise<void> {
  try {
    const banco = await db.query.bancos.findFirst({
      where: eq(bancos.id, bancoId),
    })

    if (!banco) {
      logger.warn('Banco no encontrado para actualizar métricas', {
        context: 'Triggers:Banco',
        data: { bancoId },
      })
      return
    }

    // Obtener movimientos del banco
    const movimientosBanco = await db.query.movimientos.findMany({
      where: eq(movimientos.bancoId, bancoId),
    })

    // Fechas de referencia
    const ahora = new Date()
    const inicioHoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate())
    const inicioSemana = new Date(ahora)
    inicioSemana.setDate(ahora.getDate() - ahora.getDay())
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1)
    const finMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth(), 0)

    // Filtrar por períodos
    const movHoy = movimientosBanco.filter((m) => new Date(m.fecha) >= inicioHoy)
    const movSemana = movimientosBanco.filter((m) => new Date(m.fecha) >= inicioSemana)
    const movMes = movimientosBanco.filter((m) => new Date(m.fecha) >= inicioMes)
    const movMesAnterior = movimientosBanco.filter(
      (m) => new Date(m.fecha) >= inicioMesAnterior && new Date(m.fecha) <= finMesAnterior,
    )

    // Calcular flujos por período
    const calcularFlujo = (movs: typeof movimientosBanco) => {
      const ingresos = movs.filter((m) => m.tipo === 'ingreso').reduce((sum, m) => sum + m.monto, 0)
      const gastos = movs
        .filter((m) => m.tipo === 'gasto')
        .reduce((sum, m) => sum + Math.abs(m.monto), 0)
      return { ingresos, gastos, flujoNeto: ingresos - gastos, cantidad: movs.length }
    }

    const flujoHoy = calcularFlujo(movHoy)
    const flujoSemana = calcularFlujo(movSemana)
    const flujoMes = calcularFlujo(movMes)
    const flujoMesAnterior = calcularFlujo(movMesAnterior)

    // Calcular origen de ingresos del mes
    const ingresosMes = movMes.filter((m) => m.tipo === 'ingreso')
    const totalIngresosMes = flujoMes.ingresos || 1 // Evitar división por 0

    const ingresosPorConcepto = {
      ventas: ingresosMes
        .filter((m) => m.concepto?.toLowerCase().includes('venta'))
        .reduce((s, m) => s + m.monto, 0),
      transferencias: ingresosMes
        .filter((m) => m.concepto?.toLowerCase().includes('transfer'))
        .reduce((s, m) => s + m.monto, 0),
      manual: ingresosMes
        .filter((m) => m.concepto?.toLowerCase().includes('manual'))
        .reduce((s, m) => s + m.monto, 0),
      distribucionGYA: ingresosMes
        .filter(
          (m) =>
            m.concepto?.toLowerCase().includes('gya') ||
            m.concepto?.toLowerCase().includes('distribu'),
        )
        .reduce((s, m) => s + m.monto, 0),
    }

    // Porcentajes de origen
    const porcentajeVentas = (ingresosPorConcepto.ventas / totalIngresosMes) * 100
    const porcentajeTransferencias = (ingresosPorConcepto.transferencias / totalIngresosMes) * 100
    const porcentajeManual = (ingresosPorConcepto.manual / totalIngresosMes) * 100
    const porcentajeDistribucionGYA = (ingresosPorConcepto.distribucionGYA / totalIngresosMes) * 100

    // Tendencias
    const variacionMesAnterior =
      flujoMesAnterior.flujoNeto !== 0
        ? ((flujoMes.flujoNeto - flujoMesAnterior.flujoNeto) /
            Math.abs(flujoMesAnterior.flujoNeto)) *
          100
        : flujoMes.flujoNeto > 0
          ? 100
          : 0

    // Determinar tendencia del capital (usar valores del schema)
    let tendenciaCapital: 'subiendo' | 'estable' | 'bajando' = 'estable'
    if (variacionMesAnterior > 10) tendenciaCapital = 'subiendo'
    else if (variacionMesAnterior < -10) tendenciaCapital = 'bajando'

    // Tendencia del flujo
    let tendenciaFlujo: 'positivo' | 'neutro' | 'negativo' = 'neutro'
    if (flujoMes.flujoNeto > 0) tendenciaFlujo = 'positivo'
    else if (flujoMes.flujoNeto < 0) tendenciaFlujo = 'negativo'

    // Proyecciones
    const capitalActual = banco.capitalActual || 0
    const promedioFlujoMensual = flujoMes.flujoNeto // Usamos el mes actual como referencia
    const proyeccionFinMes = capitalActual + promedioFlujoMensual * ((30 - ahora.getDate()) / 30)
    const proyeccionTresMeses = capitalActual + promedioFlujoMensual * 3

    // Días hasta agotamiento (si flujo negativo)
    const diasHastaAgotamiento =
      promedioFlujoMensual < 0
        ? Math.round(capitalActual / Math.abs(promedioFlujoMensual / 30))
        : 9999

    // Scoring de salud financiera (0-100)
    const scoreLiquidez = Math.min(100, Math.round((capitalActual / 100000) * 100)) // 100k = 100%
    const scoreFlujo = Math.min(100, Math.max(0, 50 + flujoMes.flujoNeto / 1000)) // Normalizado
    const scoreEstabilidad = Math.min(100, Math.max(0, 50 + 50 - Math.abs(variacionMesAnterior)))

    // Estado de salud
    const scorePromedio = (scoreLiquidez + scoreFlujo + scoreEstabilidad) / 3
    let estadoSalud: 'excelente' | 'bueno' | 'regular' | 'critico' = 'regular'
    if (scorePromedio >= 80) estadoSalud = 'excelente'
    else if (scorePromedio >= 60) estadoSalud = 'bueno'
    else if (scorePromedio < 40) estadoSalud = 'critico'

    // Actualizar en DB
    await db
      .update(bancos)
      .set({
        // Flujo diario
        ingresosHoy: flujoHoy.ingresos,
        gastosHoy: flujoHoy.gastos,
        flujoNetoHoy: flujoHoy.flujoNeto,
        movimientosHoy: flujoHoy.cantidad,

        // Flujo semanal
        ingresosSemana: flujoSemana.ingresos,
        gastosSemana: flujoSemana.gastos,
        flujoNetoSemana: flujoSemana.flujoNeto,
        movimientosSemana: flujoSemana.cantidad,

        // Flujo mensual
        ingresosMes: flujoMes.ingresos,
        gastosMes: flujoMes.gastos,
        flujoNetoMes: flujoMes.flujoNeto,
        movimientosMes: flujoMes.cantidad,

        // Origen de ingresos
        porcentajeVentas: Math.round(porcentajeVentas * 100) / 100,
        porcentajeTransferencias: Math.round(porcentajeTransferencias * 100) / 100,
        porcentajeManual: Math.round(porcentajeManual * 100) / 100,
        porcentajeDistribucionGYA: Math.round(porcentajeDistribucionGYA * 100) / 100,

        // Tendencias
        tendenciaCapital,
        tendenciaFlujo,
        variacionMesAnterior: Math.round(variacionMesAnterior * 100) / 100,

        // Proyecciones
        proyeccionFinMes: Math.round(proyeccionFinMes),
        diasHastaAgotamiento,
        proyeccionTresMeses: Math.round(proyeccionTresMeses),

        // Scoring
        scoreLiquidez,
        scoreFlujo,
        scoreEstabilidad,
        estadoSalud,

        // Metadata
        ultimaActualizacionMetricas: new Date().toISOString(),
      })
      .where(eq(bancos.id, bancoId))

    logger.info('Métricas de banco actualizadas', {
      context: 'Triggers:Banco',
      data: {
        bancoId,
        capitalActual,
        flujoNetoMes: flujoMes.flujoNeto,
        estadoSalud,
        tendenciaCapital,
      },
    })
  } catch (error) {
    logger.error('Error actualizando métricas de banco', error as Error, {
      context: 'Triggers:Banco',
      data: { bancoId },
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 📊 ACTUALIZACIÓN DE MÉTRICAS DE ORDEN DE COMPRA (ROTACIÓN)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Actualiza métricas de rotación de una Orden de Compra
 * Se ejecuta después de: crear venta que consume stock de la OC
 */
export async function actualizarMetricasRotacionOC(ocId: string): Promise<void> {
  try {
    const oc = await db.query.ordenesCompra.findFirst({
      where: eq(ordenesCompra.id, ocId),
    })

    if (!oc) return

    // Calcular días desde compra
    const fechaCompra = new Date(oc.fecha)
    const ahora = new Date()
    const diasDesdeCompra = Math.round(
      (ahora.getTime() - fechaCompra.getTime()) / (1000 * 60 * 60 * 24),
    )

    // Obtener ventas asociadas a esta OC
    const ventasOC = await db.query.ventas.findMany({
      where: eq(ventas.ocId, ocId),
    })

    // Calcular unidades vendidas
    const unidadesVendidas = ventasOC.reduce((sum, v) => sum + v.cantidad, 0)
    const cantidadOriginal = oc.cantidad || 1
    const porcentajeVendido = Math.round((unidadesVendidas / cantidadOriginal) * 100)

    // Tiempo promedio de venta por pieza
    const tiempoPromedioVentaPieza =
      unidadesVendidas > 0 ? Math.round(diasDesdeCompra / unidadesVendidas) : null

    // Rotación en días (si está 100% vendido)
    const rotacionDias = porcentajeVendido >= 100 ? diasDesdeCompra : null

    // Eficiencia de rotación (usar valores del schema)
    let eficienciaRotacion: 'excelente' | 'buena' | 'normal' | 'lenta' | 'muy_lenta' = 'normal'
    if (tiempoPromedioVentaPieza !== null) {
      if (tiempoPromedioVentaPieza <= 7) eficienciaRotacion = 'excelente'
      else if (tiempoPromedioVentaPieza <= 15) eficienciaRotacion = 'buena'
      else if (tiempoPromedioVentaPieza <= 30) eficienciaRotacion = 'normal'
      else if (tiempoPromedioVentaPieza <= 60) eficienciaRotacion = 'lenta'
      else eficienciaRotacion = 'muy_lenta'
    }

    await db
      .update(ordenesCompra)
      .set({
        diasDesdeCompra,
        porcentajeVendido,
        tiempoPromedioVentaPieza,
        rotacionDias,
        eficienciaRotacion,
      })
      .where(eq(ordenesCompra.id, ocId))

    logger.info('Métricas de rotación OC actualizadas', {
      context: 'Triggers:OC',
      data: { ocId, diasDesdeCompra, porcentajeVendido, eficienciaRotacion },
    })
  } catch (error) {
    logger.error('Error actualizando métricas de rotación OC', error as Error, {
      context: 'Triggers:OC',
      data: { ocId },
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 🔄 TRIGGERS MAESTROS EXTENDIDOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trigger maestro después de crear/actualizar una venta
 * Actualiza: cliente, distribuidor (si tiene OC), OC, producto, bancos
 */
export async function triggerPostVentaCompleto(params: {
  ventaId: string
  clienteId: string
  productoId?: string
  ocId?: string
  distribuidorId?: string
  bancosAfectados?: string[]
}): Promise<void> {
  const { clienteId, productoId, ocId, distribuidorId, bancosAfectados } = params

  try {
    // Actualizar métricas del cliente (siempre)
    await actualizarMetricasCliente(clienteId)

    // Actualizar métricas del producto (si existe)
    if (productoId) {
      await actualizarMetricasProducto(productoId)
    }

    // Actualizar métricas de la OC (si existe)
    if (ocId) {
      await actualizarMetricasOC(ocId)
      await actualizarMetricasRotacionOC(ocId)
    }

    // Actualizar métricas del distribuidor (si existe)
    if (distribuidorId) {
      await actualizarMetricasDistribuidor(distribuidorId)
    }

    // Actualizar métricas de bancos afectados
    if (bancosAfectados && bancosAfectados.length > 0) {
      await Promise.all(bancosAfectados.map((bancoId) => actualizarMetricasBanco(bancoId)))
    }

    logger.info('Triggers post-venta completo ejecutados', {
      context: 'Triggers:Master',
      data: params,
    })
  } catch (error) {
    logger.error('Error en triggers post-venta completo', error as Error, {
      context: 'Triggers:Master',
      data: params,
    })
  }
}

/**
 * Trigger maestro después de un movimiento bancario
 * Actualiza: banco afectado
 */
export async function triggerPostMovimiento(params: {
  bancoId: string
  tipo: 'ingreso' | 'gasto'
}): Promise<void> {
  const { bancoId } = params

  try {
    await actualizarMetricasBanco(bancoId)

    logger.info('Trigger post-movimiento ejecutado', {
      context: 'Triggers:Movimiento',
      data: params,
    })
  } catch (error) {
    logger.error('Error en trigger post-movimiento', error as Error, {
      context: 'Triggers:Movimiento',
      data: params,
    })
  }
}

/**
 * Trigger para recalcular TODAS las métricas del sistema
 * Útil para: inicialización, corrección de datos, auditorías
 */
export async function triggerRecalcularTodo(): Promise<{
  clientes: number
  distribuidores: number
  productos: number
  bancos: number
  ordenesCompra: number
}> {
  const stats = { clientes: 0, distribuidores: 0, productos: 0, bancos: 0, ordenesCompra: 0 }

  try {
    // Recalcular clientes
    const todosClientes = await db.query.clientes.findMany()
    for (const cliente of todosClientes) {
      await actualizarMetricasCliente(cliente.id)
      stats.clientes++
    }

    // Recalcular distribuidores
    const todosDistribuidores = await db.query.distribuidores.findMany()
    for (const dist of todosDistribuidores) {
      await actualizarMetricasDistribuidor(dist.id)
      stats.distribuidores++
    }

    // Recalcular productos
    const todosProductos = await db.query.almacen.findMany()
    for (const prod of todosProductos) {
      await actualizarMetricasProducto(prod.id)
      stats.productos++
    }

    // Recalcular bancos
    const todosBancos = await db.query.bancos.findMany()
    for (const banco of todosBancos) {
      await actualizarMetricasBanco(banco.id)
      stats.bancos++
    }

    // Recalcular OCs
    const todasOC = await db.query.ordenesCompra.findMany()
    for (const oc of todasOC) {
      await actualizarMetricasOC(oc.id)
      await actualizarMetricasRotacionOC(oc.id)
      stats.ordenesCompra++
    }

    logger.info('Recálculo total completado', {
      context: 'Triggers:RecalcularTodo',
      data: stats,
    })

    return stats
  } catch (error) {
    logger.error('Error en recálculo total', error as Error, {
      context: 'Triggers:RecalcularTodo',
    })
    return stats
  }
}
