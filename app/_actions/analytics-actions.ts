/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — ELITE ANALYTICS SERVER ACTIONS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Server Actions simplificados para el dashboard Elite.
 * Retorna tipos simplificados optimizados para visualización.
 */

'use server'

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { distribuidores, ordenesCompra, ventas } from '@/database/schema'
import { desc, eq } from 'drizzle-orm'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS SIMPLIFICADOS PARA DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export interface DashboardKPIs {
  capitalTotal: number
  ventasMes: number
  gananciaMes: number
  deudaClientes: number
  deudaDistribuidores: number
  indiceSaludFinanciera: number
  riesgoLiquidez: 'bajo' | 'medio' | 'alto'
  riesgoCredito: 'bajo' | 'medio' | 'alto'
}

export interface DashboardOC {
  ocId: string
  numeroOrden: string | null
  distribuidorNombre: string
  stockInicial: number
  stockActual: number
  totalVentas: number
  montoPagado: number
  gananciaRealizada: number
  roi: number
  estadoStock: 'disponible' | 'bajo' | 'agotado'
  estadoRentabilidad: 'excelente' | 'buena' | 'regular' | 'perdida'
  alertas: string[]
}

export interface DashboardCliente {
  clienteId: string
  nombre: string
  categoria: 'VIP' | 'frecuente' | 'ocasional' | 'nuevo' | 'inactivo' | 'moroso'
  scoreCredito: number
  scoreTotal: number
  deudaActual: number
  totalCompras: number
  ultimaCompra: number | null
}

export interface DashboardDistribuidor {
  distribuidorId: string
  nombre: string
  categoria: 'estrategico' | 'preferido' | 'normal' | 'ocasional' | 'nuevo'
  deudaActual: number
  totalOrdenes: number
  ventasGeneradas: number
  gananciaGenerada: number
  scoreTotal: number
}

export interface DashboardBanco {
  bancoId: string
  nombre: string
  tipo: string
  capitalActual: number
  historicoIngresos: number
  historicoGastos: number
  tendenciaFlujo: 'subiendo' | 'estable' | 'bajando'
}

export interface DashboardAlerta {
  tipo: 'critica' | 'advertencia' | 'info'
  mensaje: string
  accion?: string
}

interface ActionResult<T> {
  success: boolean
  data: T
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GET KPIS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export async function getDashboardKPIs(): Promise<ActionResult<DashboardKPIs>> {
  try {
    const bancosData = await db.query.bancos.findMany()
    const ventasData = await db.query.ventas.findMany()
    const clientesData = await db.query.clientes.findMany()
    const ocData = await db.query.ordenesCompra.findMany()

    const capitalTotal = bancosData.reduce((sum, b) => sum + (b.capitalActual || 0), 0)

    const mesActual = new Date()
    const inicioMesTs = Math.floor(new Date(mesActual.getFullYear(), mesActual.getMonth(), 1).getTime() / 1000)

    const ventasMes = ventasData
      .filter((v) => v.fecha && v.fecha >= inicioMesTs)
      .reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)

    const gananciaMes = ventasData
      .filter((v) => v.fecha && v.fecha >= inicioMesTs)
      .reduce((sum, v) => sum + (v.gananciaTotal || 0), 0)

    const deudaClientes = clientesData.reduce((sum, c) => sum + (c.saldoPendiente || 0), 0)

    const deudaDistribuidores = ocData.reduce((sum, oc) => {
      const total = oc.total ?? (oc.precioUnitario || 0) * (oc.cantidad || 0)
      return sum + Math.max(0, total - (oc.montoPagado || 0))
    }, 0)

    // Calcular índice de salud simplificado
    let indiceSaludFinanciera = 50
    if (capitalTotal > deudaDistribuidores * 2) indiceSaludFinanciera = 85
    else if (capitalTotal > deudaDistribuidores) indiceSaludFinanciera = 70
    else if (capitalTotal > deudaDistribuidores * 0.5) indiceSaludFinanciera = 50
    else indiceSaludFinanciera = 30

    // Evaluar riesgo de liquidez
    const ratioLiquidez = capitalTotal > 0 ? deudaDistribuidores / capitalTotal : 1
    const riesgoLiquidez: 'bajo' | 'medio' | 'alto' =
      ratioLiquidez < 0.5 ? 'bajo' : ratioLiquidez < 1 ? 'medio' : 'alto'

    // Evaluar riesgo de crédito
    const ratioCredito = ventasMes > 0 ? deudaClientes / ventasMes : 0
    const riesgoCredito: 'bajo' | 'medio' | 'alto' =
      ratioCredito < 1 ? 'bajo' : ratioCredito < 2 ? 'medio' : 'alto'

    return {
      success: true,
      data: {
        capitalTotal,
        ventasMes,
        gananciaMes,
        deudaClientes,
        deudaDistribuidores,
        indiceSaludFinanciera,
        riesgoLiquidez,
        riesgoCredito,
      },
    }
  } catch (error) {
    logger.error('Error obteniendo KPIs', error as Error, { context: 'analytics-actions' })
    return {
      success: false,
      data: {
        capitalTotal: 0,
        ventasMes: 0,
        gananciaMes: 0,
        deudaClientes: 0,
        deudaDistribuidores: 0,
        indiceSaludFinanciera: 0,
        riesgoLiquidez: 'alto',
        riesgoCredito: 'alto',
      },
      error: 'Error obteniendo KPIs',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GET OC METRICAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export async function getDashboardOrdenes(): Promise<ActionResult<DashboardOC[]>> {
  try {
    const ocData = await db.query.ordenesCompra.findMany({ orderBy: desc(ordenesCompra.fecha) })
    const todasVentas = await db.query.ventas.findMany()

    const metricas: DashboardOC[] = await Promise.all(
      ocData.map(async (oc) => {
        // Buscar distribuidor
        let distribuidorNombre = 'Sin asignar'
        if (oc.distribuidorId) {
          const dist = await db.query.distribuidores.findFirst({
            where: eq(distribuidores.id, oc.distribuidorId),
          })
          if (dist) distribuidorNombre = dist.nombre || 'Sin nombre'
        }

        // Buscar ventas de esta OC via origenLotes
        const ventasOC = todasVentas.filter((v) => {
          if (!v.origenLotes) return false
          try {
            const lotes = JSON.parse(v.origenLotes) as Array<{ ocId: string }>
            return lotes.some((l) => l.ocId === oc.id)
          } catch {
            return false
          }
        })

        const stockInicial = oc.cantidad || 0
        const stockActual = oc.stockActual ?? stockInicial
        const totalVentas = ventasOC.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
        const montoPagado = oc.montoPagado || 0
        const costoTotal = (oc.precioUnitario || 0) * (oc.cantidad || 0)
        const gananciaRealizada = ventasOC.reduce((sum, v) => sum + (v.gananciaTotal || 0), 0)
        const roi = costoTotal > 0 ? (gananciaRealizada / costoTotal) * 100 : 0

        // Estado de stock
        const porcentajeStock = stockInicial > 0 ? (stockActual / stockInicial) * 100 : 0
        const estadoStock: DashboardOC['estadoStock'] =
          porcentajeStock === 0 ? 'agotado' : porcentajeStock < 20 ? 'bajo' : 'disponible'

        // Estado de rentabilidad
        const estadoRentabilidad: DashboardOC['estadoRentabilidad'] =
          roi >= 50 ? 'excelente' : roi >= 25 ? 'buena' : roi >= 0 ? 'regular' : 'perdida'

        // Alertas
        const alertas: string[] = []
        if (estadoStock === 'bajo') alertas.push('Stock bajo')
        if (estadoStock === 'agotado') alertas.push('Stock agotado')
        if (estadoRentabilidad === 'perdida') alertas.push('ROI negativo')

        return {
          ocId: oc.id,
          numeroOrden: oc.numeroOrden,
          distribuidorNombre,
          stockInicial,
          stockActual,
          totalVentas,
          montoPagado,
          gananciaRealizada,
          roi,
          estadoStock,
          estadoRentabilidad,
          alertas,
        }
      }),
    )

    return { success: true, data: metricas }
  } catch (error) {
    logger.error('Error obteniendo órdenes', error as Error, { context: 'analytics-actions' })
    return { success: false, data: [], error: 'Error obteniendo órdenes' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GET CLIENTES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export async function getDashboardClientes(): Promise<ActionResult<DashboardCliente[]>> {
  try {
    const clientesData = await db.query.clientes.findMany()

    const metricas: DashboardCliente[] = await Promise.all(
      clientesData.map(async (cliente) => {
        const ventasCliente = await db.query.ventas.findMany({
          where: eq(ventas.clienteId, cliente.id),
        })

        const totalCompras = ventasCliente.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
        const totalPagado = ventasCliente.reduce((sum, v) => sum + (v.montoPagado || 0), 0)
        const deudaActual = totalCompras - totalPagado
        const numeroVentas = ventasCliente.length

        const ultimaCompra =
          ventasCliente.length > 0
            ? Math.max(...ventasCliente.map((v) => (v.fecha ?? 0) * 1000))
            : null

        const diasSinComprar = ultimaCompra
          ? Math.floor((Date.now() - ultimaCompra) / (1000 * 60 * 60 * 24))
          : 999

        const porcentajePagoPuntual =
          numeroVentas > 0
            ? (ventasCliente.filter((v) => v.estadoPago === 'completo').length / numeroVentas) * 100
            : 0

        // Score de crédito simplificado (0-100)
        let scoreCredito = 50
        if (deudaActual === 0) scoreCredito += 30
        else if (deudaActual < totalCompras * 0.1) scoreCredito += 20
        else if (deudaActual < totalCompras * 0.3) scoreCredito += 10
        else scoreCredito -= 20

        if (porcentajePagoPuntual >= 80) scoreCredito += 20
        else if (porcentajePagoPuntual >= 50) scoreCredito += 10
        else scoreCredito -= 10

        scoreCredito = Math.max(0, Math.min(100, scoreCredito))

        // Categorización
        let categoria: DashboardCliente['categoria'] = 'nuevo'
        if (deudaActual > 0 && diasSinComprar > 60) categoria = 'moroso'
        else if (diasSinComprar > 180) categoria = 'inactivo'
        else if (totalCompras > 500000 && numeroVentas > 10) categoria = 'VIP'
        else if (totalCompras > 100000 && numeroVentas > 5) categoria = 'frecuente'
        else if (numeroVentas > 2) categoria = 'ocasional'

        return {
          clienteId: cliente.id,
          nombre: cliente.nombre || 'Sin nombre',
          categoria,
          scoreCredito,
          scoreTotal: scoreCredito,
          deudaActual,
          totalCompras,
          ultimaCompra,
        }
      }),
    )

    return { success: true, data: metricas }
  } catch (error) {
    logger.error('Error obteniendo clientes', error as Error, { context: 'analytics-actions' })
    return { success: false, data: [], error: 'Error obteniendo clientes' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GET DISTRIBUIDORES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export async function getDashboardDistribuidores(): Promise<ActionResult<DashboardDistribuidor[]>> {
  try {
    const distribuidoresData = await db.query.distribuidores.findMany()
    const todasVentas = await db.query.ventas.findMany()

    const metricas: DashboardDistribuidor[] = await Promise.all(
      distribuidoresData.map(async (dist) => {
        const ocDist = await db.query.ordenesCompra.findMany({
          where: eq(ordenesCompra.distribuidorId, dist.id),
        })

        const totalOrdenes = ocDist.reduce(
          (sum, oc) => sum + (oc.total ?? (oc.precioUnitario || 0) * (oc.cantidad || 0)),
          0,
        )
        const totalPagado = ocDist.reduce((sum, oc) => sum + (oc.montoPagado || 0), 0)
        const deudaActual = totalOrdenes - totalPagado

        // Ventas de productos de este distribuidor
        const ocIds = new Set(ocDist.map((oc) => oc.id))
        const ventasDelDist = todasVentas.filter((v) => {
          if (!v.origenLotes) return false
          try {
            const lotes = JSON.parse(v.origenLotes) as Array<{ ocId: string }>
            return lotes.some((l) => ocIds.has(l.ocId))
          } catch {
            return false
          }
        })

        const ventasGeneradas = ventasDelDist.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
        const gananciaGenerada = ventasDelDist.reduce((sum, v) => sum + (v.gananciaTotal || 0), 0)

        // Categorización
        let categoria: DashboardDistribuidor['categoria'] = 'nuevo'
        if (totalOrdenes > 1000000 && ocDist.length > 20) categoria = 'estrategico'
        else if (totalOrdenes > 500000 && ocDist.length > 10) categoria = 'preferido'
        else if (totalOrdenes > 100000 && ocDist.length > 5) categoria = 'normal'
        else if (ocDist.length > 2) categoria = 'ocasional'

        // Score simplificado
        const scoreTotal = Math.min(
          100,
          Math.round((gananciaGenerada / 100000) * 50 + ocDist.length * 5),
        )

        return {
          distribuidorId: dist.id,
          nombre: dist.nombre || 'Sin nombre',
          categoria,
          deudaActual,
          totalOrdenes: ocDist.length,
          ventasGeneradas,
          gananciaGenerada,
          scoreTotal,
        }
      }),
    )

    return { success: true, data: metricas }
  } catch (error) {
    logger.error('Error obteniendo distribuidores', error as Error, {
      context: 'analytics-actions',
    })
    return { success: false, data: [], error: 'Error obteniendo distribuidores' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GET BANCOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export async function getDashboardBancos(): Promise<ActionResult<DashboardBanco[]>> {
  try {
    const bancosData = await db.query.bancos.findMany()

    const metricas: DashboardBanco[] = bancosData.map((banco) => {
      const tendencia =
        (banco.historicoIngresos || 0) > (banco.historicoGastos || 0)
          ? 'subiendo'
          : (banco.historicoIngresos || 0) < (banco.historicoGastos || 0)
            ? 'bajando'
            : 'estable'

      return {
        bancoId: banco.id,
        nombre: banco.nombre,
        tipo: banco.tipo,
        capitalActual: banco.capitalActual || 0,
        historicoIngresos: banco.historicoIngresos || 0,
        historicoGastos: banco.historicoGastos || 0,
        tendenciaFlujo: tendencia,
      }
    })

    return { success: true, data: metricas }
  } catch (error) {
    logger.error('Error obteniendo bancos', error as Error, { context: 'analytics-actions' })
    return { success: false, data: [], error: 'Error obteniendo bancos' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GET ALERTAS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export async function getDashboardAlertas(): Promise<ActionResult<DashboardAlerta[]>> {
  try {
    const alertas: DashboardAlerta[] = []

    // KPIs para alertas
    const kpisResult = await getDashboardKPIs()
    if (kpisResult.success) {
      const kpis = kpisResult.data

      if (kpis.riesgoLiquidez === 'alto') {
        alertas.push({
          tipo: 'critica',
          mensaje: 'LIQUIDEZ: Riesgo alto detectado',
          accion: 'Revisar flujo de caja',
        })
      }
      if (kpis.riesgoCredito === 'alto') {
        alertas.push({
          tipo: 'critica',
          mensaje: 'CRÉDITO: Riesgo alto de cartera vencida',
          accion: 'Revisar cobranza',
        })
      }
      if (kpis.indiceSaludFinanciera < 50) {
        alertas.push({
          tipo: 'advertencia',
          mensaje: 'SALUD: Índice financiero bajo',
          accion: 'Analizar finanzas',
        })
      }
      if (kpis.deudaClientes > kpis.capitalTotal * 0.3) {
        alertas.push({
          tipo: 'advertencia',
          mensaje: 'DEUDA: Cartera de clientes elevada',
          accion: 'Gestionar cobranza',
        })
      }
    }

    // OC para alertas
    const ocResult = await getDashboardOrdenes()
    if (ocResult.success) {
      const ocAgotadas = ocResult.data.filter((oc) => oc.estadoStock === 'agotado')
      if (ocAgotadas.length > 0) {
        alertas.push({
          tipo: 'info',
          mensaje: `STOCK: ${ocAgotadas.length} órdenes agotadas`,
          accion: 'Revisar inventario',
        })
      }

      const ocBajas = ocResult.data.filter((oc) => oc.estadoStock === 'bajo')
      if (ocBajas.length > 0) {
        alertas.push({
          tipo: 'advertencia',
          mensaje: `STOCK: ${ocBajas.length} órdenes con stock bajo`,
          accion: 'Planificar reabastecimiento',
        })
      }
    }

    // Clientes para alertas
    const clientesResult = await getDashboardClientes()
    if (clientesResult.success) {
      const morosos = clientesResult.data.filter((c) => c.categoria === 'moroso')
      if (morosos.length > 0) {
        alertas.push({
          tipo: 'critica',
          mensaje: `CLIENTES: ${morosos.length} clientes morosos`,
          accion: 'Gestionar cobranza urgente',
        })
      }
    }

    if (alertas.length === 0) {
      alertas.push({ tipo: 'info', mensaje: 'SISTEMA: Todo en orden', accion: undefined })
    }

    return { success: true, data: alertas }
  } catch (error) {
    logger.error('Error generando alertas', error as Error, { context: 'analytics-actions' })
    return { success: false, data: [], error: 'Error generando alertas' }
  }
}
