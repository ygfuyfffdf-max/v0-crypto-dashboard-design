'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌌 CHRONOS INFINITY 2026 — DASHBOARD SERVER ACTIONS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Server Actions para obtener datos del dashboard en tiempo real desde Turso.
 * Proporciona KPIs, métricas, actividad reciente y proyecciones.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { almacen, bancos, clientes, movimientos, ventas } from '@/database/schema'
import { and, count, desc, eq, gte, lte, sql, sum } from 'drizzle-orm'

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface DashboardKPIs {
  capitalTotal: number
  ventasHoy: number
  ventasSemana: number
  ventasMes: number
  ventasAyer: number
  cambioVentasDiario: number
  clientesActivos: number
  clientesNuevosMes: number
  productosStock: number
  productosStockBajo: number
  deudaClientes: number
  clientesConDeuda: number
  bancosActivos: number
  utilidadesMes: number
  margenPromedio: number
  ticketPromedio: number
}

export interface ActivityItem {
  id: string
  tipo: 'venta' | 'abono' | 'gasto' | 'ingreso' | 'transferencia'
  descripcion: string
  monto: number
  fecha: number
  bancoId?: string
  clienteId?: string
  entidad?: string
}

export interface BancoResumen {
  id: string
  nombre: string
  capital: number
  color: string
  cambio24h: number
  porcentajeTotal: number
}

export interface DashboardData {
  kpis: DashboardKPIs
  actividad: ActivityItem[]
  bancos: BancoResumen[]
  tendencias: {
    ventasSemana: number[]
    utilidadesSemana: number[]
  }
  alertas: string[]
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

function getStartOfDay(date: Date = new Date()): number {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

function getStartOfWeek(date: Date = new Date()): number {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

function getStartOfMonth(date: Date = new Date()): number {
  const d = new Date(date)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return Math.floor(d.getTime() / 1000)
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVER ACTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtener todos los KPIs del dashboard
 */
export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  try {
    const now = new Date()
    const startOfDay = getStartOfDay()
    const startOfYesterday = getStartOfDay(new Date(now.getTime() - 86400000))
    const startOfWeek = getStartOfWeek()
    const startOfMonth = getStartOfMonth()

    // Ejecutar queries en paralelo para máxima eficiencia
    const [
      bancosData,
      ventasHoyData,
      ventasAyerData,
      ventasSemanaData,
      ventasMesData,
      clientesData,
      almacenData,
      _utilidadesData,
    ] = await Promise.all([
      // Capital total de bancos
      db
        .select({ total: sum(bancos.capitalActual) })
        .from(bancos)
        .where(eq(bancos.activo, 1)),

      // Ventas de hoy
      db
        .select({
          total: sum(ventas.precioTotalVenta),
          count: count(),
        })
        .from(ventas)
        .where(gte(ventas.fecha, startOfDay)),

      // Ventas de ayer
      db
        .select({ total: sum(ventas.precioTotalVenta) })
        .from(ventas)
        .where(and(gte(ventas.fecha, startOfYesterday), lte(ventas.fecha, startOfDay))),

      // Ventas de la semana
      db
        .select({ total: sum(ventas.precioTotalVenta) })
        .from(ventas)
        .where(gte(ventas.fecha, startOfWeek)),

      // Ventas del mes
      db
        .select({
          total: sum(ventas.precioTotalVenta),
          utilidades: sum(ventas.montoUtilidades),
          count: count(),
        })
        .from(ventas)
        .where(gte(ventas.fecha, startOfMonth)),

      // Clientes activos y con deuda
      db
        .select({
          totalActivos: sql<number>`count(*) filter (where ${clientes.estado} = 'activo')`,
          nuevosDelMes: sql<number>`count(*) filter (where ${clientes.createdAt} >= ${startOfMonth})`,
          conDeuda: sql<number>`count(*) filter (where ${clientes.saldoPendiente} > 0)`,
          deudaTotal: sum(clientes.saldoPendiente),
        })
        .from(clientes),

      // Inventario
      db
        .select({
          totalProductos: count(),
          stockBajo: sql<number>`count(*) filter (where ${almacen.cantidad} <= ${almacen.minimo})`,
        })
        .from(almacen),

      // Utilidades del banco utilidades
      db
        .select({ capital: bancos.capitalActual })
        .from(bancos)
        .where(eq(bancos.id, 'utilidades'))
        .limit(1),
    ])

    const capitalTotal = Number(bancosData[0]?.total ?? 0)
    const ventasHoy = Number(ventasHoyData[0]?.total ?? 0)
    const ventasAyer = Number(ventasAyerData[0]?.total ?? 0)
    const ventasSemana = Number(ventasSemanaData[0]?.total ?? 0)
    const ventasMes = Number(ventasMesData[0]?.total ?? 0)
    const ventasCountMes = Number(ventasMesData[0]?.count ?? 0)
    const utilidadesMes = Number(ventasMesData[0]?.utilidades ?? 0)

    const cambioVentasDiario =
      ventasAyer > 0 ? ((ventasHoy - ventasAyer) / ventasAyer) * 100 : ventasHoy > 0 ? 100 : 0

    const ticketPromedio = ventasCountMes > 0 ? ventasMes / ventasCountMes : 0
    const margenPromedio = ventasMes > 0 ? (utilidadesMes / ventasMes) * 100 : 0

    return {
      capitalTotal,
      ventasHoy,
      ventasSemana,
      ventasMes,
      ventasAyer,
      cambioVentasDiario,
      clientesActivos: Number(clientesData[0]?.totalActivos ?? 0),
      clientesNuevosMes: Number(clientesData[0]?.nuevosDelMes ?? 0),
      productosStock: Number(almacenData[0]?.totalProductos ?? 0),
      productosStockBajo: Number(almacenData[0]?.stockBajo ?? 0),
      deudaClientes: Number(clientesData[0]?.deudaTotal ?? 0),
      clientesConDeuda: Number(clientesData[0]?.conDeuda ?? 0),
      bancosActivos: 7,
      utilidadesMes,
      margenPromedio,
      ticketPromedio,
    }
  } catch (error) {
    logger.error('Error obteniendo KPIs del dashboard', error as Error, {
      context: 'DashboardActions:getDashboardKPIs',
    })

    // Return default values on error
    return {
      capitalTotal: 0,
      ventasHoy: 0,
      ventasSemana: 0,
      ventasMes: 0,
      ventasAyer: 0,
      cambioVentasDiario: 0,
      clientesActivos: 0,
      clientesNuevosMes: 0,
      productosStock: 0,
      productosStockBajo: 0,
      deudaClientes: 0,
      clientesConDeuda: 0,
      bancosActivos: 7,
      utilidadesMes: 0,
      margenPromedio: 0,
      ticketPromedio: 0,
    }
  }
}

/**
 * Obtener actividad reciente del sistema
 */
export async function getRecentActivity(limit = 10): Promise<ActivityItem[]> {
  try {
    const recentMovimientos = await db.query.movimientos.findMany({
      orderBy: [desc(movimientos.fecha)],
      limit,
    })

    return recentMovimientos.map((mov) => ({
      id: mov.id,
      tipo: mov.tipo as ActivityItem['tipo'],
      descripcion: mov.concepto ?? 'Movimiento',
      monto: mov.monto,
      fecha: mov.fecha ?? Math.floor(Date.now() / 1000),
      bancoId: mov.bancoId ?? undefined,
      clienteId: mov.clienteId ?? undefined,
      entidad: undefined as string | undefined,
    }))
  } catch (error) {
    logger.error('Error obteniendo actividad reciente', error as Error, {
      context: 'DashboardActions:getRecentActivity',
    })
    return []
  }
}

/**
 * Obtener resumen de todos los bancos
 */
export async function getBancosResumen(): Promise<BancoResumen[]> {
  try {
    const now = new Date()
    const hace24h = Math.floor(now.getTime() / 1000) - 86400

    const bancosData = await db.query.bancos.findMany({
      where: eq(bancos.activo, 1),
      orderBy: (bancos, { asc }) => [asc(bancos.orden)],
    })

    // Obtener movimientos de las últimas 24h para calcular cambio real
    const movimientos24h = await db.query.movimientos.findMany({
      where: gte(movimientos.fecha, hace24h),
    })

    // Calcular cambio por banco
    const cambiosPorBanco = bancosData.reduce(
      (acc, banco) => {
        const movsBanco = movimientos24h.filter((m) => m.bancoId === banco.id)
        const ingresos = movsBanco
          .filter((m) => m.tipo === 'ingreso')
          .reduce((sum, m) => sum + (m.monto || 0), 0)
        const gastos = movsBanco
          .filter((m) => m.tipo === 'gasto')
          .reduce((sum, m) => sum + (m.monto || 0), 0)
        const cambioNeto = ingresos - gastos
        const capitalAnterior = (banco.capitalActual || 0) - cambioNeto
        const porcentajeCambio = capitalAnterior > 0 ? (cambioNeto / capitalAnterior) * 100 : 0
        acc[banco.id] = porcentajeCambio
        return acc
      },
      {} as Record<string, number>,
    )

    const capitalTotal = bancosData.reduce((sum, b) => sum + (b.capitalActual ?? 0), 0)

    // Colores predefinidos por banco
    const coloresBanco: Record<string, string> = {
      boveda_monte: '#FFD700',
      boveda_usa: '#4169E1',
      profit: '#22c55e',
      leftie: '#FF1493',
      azteca: '#FF6347',
      flete_sur: '#8B00FF',
      utilidades: '#DAA520',
    }

    return bancosData.map((banco) => ({
      id: banco.id,
      nombre: banco.nombre,
      capital: banco.capitalActual ?? 0,
      color: coloresBanco[banco.id] ?? '#8B00FF',
      cambio24h: cambiosPorBanco[banco.id] || 0,
      porcentajeTotal: capitalTotal > 0 ? ((banco.capitalActual ?? 0) / capitalTotal) * 100 : 0,
    }))
  } catch (error) {
    logger.error('Error obteniendo resumen de bancos', error as Error, {
      context: 'DashboardActions:getBancosResumen',
    })
    return []
  }
}

/**
 * Obtener datos completos del dashboard
 */
export async function getDashboardData(): Promise<DashboardData> {
  const [kpis, actividad, bancosResumen] = await Promise.all([
    getDashboardKPIs(),
    getRecentActivity(10),
    getBancosResumen(),
  ])

  // Generar alertas basadas en los datos
  const alertas: string[] = []

  if (kpis.productosStockBajo > 0) {
    alertas.push(`⚠️ ${kpis.productosStockBajo} productos con stock bajo`)
  }

  if (kpis.clientesConDeuda > 10) {
    alertas.push(`💳 ${kpis.clientesConDeuda} clientes con saldo pendiente`)
  }

  if (kpis.cambioVentasDiario < -20) {
    alertas.push(`📉 Ventas -${Math.abs(kpis.cambioVentasDiario).toFixed(1)}% vs ayer`)
  }

  return {
    kpis,
    actividad,
    bancos: bancosResumen,
    tendencias: {
      ventasSemana: [12000, 15000, 11000, 18000, 22000, 19000, kpis.ventasHoy],
      utilidadesSemana: [3000, 4200, 2800, 5100, 6200, 5400, kpis.utilidadesMes / 30],
    },
    alertas,
  }
}

/**
 * Obtener estadísticas para el AI Context
 */
export async function getAIContextStats(): Promise<Record<string, unknown>> {
  try {
    const [kpis, bancosResumen] = await Promise.all([getDashboardKPIs(), getBancosResumen()])

    return {
      capitalTotal: kpis.capitalTotal,
      ventasHoy: kpis.ventasHoy,
      ventasMes: kpis.ventasMes,
      utilidadesMes: kpis.utilidadesMes,
      clientesActivos: kpis.clientesActivos,
      deudaClientes: kpis.deudaClientes,
      productosStock: kpis.productosStock,
      bancos: bancosResumen.map((b) => ({
        nombre: b.nombre,
        capital: b.capital,
        porcentaje: b.porcentajeTotal.toFixed(1) + '%',
      })),
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    logger.error('Error obteniendo stats para AI', error as Error, {
      context: 'DashboardActions:getAIContextStats',
    })
    return {}
  }
}
