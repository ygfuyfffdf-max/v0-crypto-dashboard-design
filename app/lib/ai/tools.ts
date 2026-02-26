// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🛠️ CHRONOS AI TOOLS — Herramientas de IA
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Tools para Vercel AI SDK que consultan datos reales de Turso/Drizzle
 *
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, clientes, ventas } from '@/database/schema'
import { and, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TIPOS PARA TOOLS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

type BancoIdType =
  | 'boveda_monte'
  | 'boveda_usa'
  | 'profit'
  | 'leftie'
  | 'azteca'
  | 'flete_sur'
  | 'utilidades'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// FUNCIONES DE CONSULTA (SIN tool wrapper - para uso directo)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Consulta ventas del sistema con filtros opcionales
 */
export async function queryVentas(params: {
  fechaInicio?: string
  fechaFin?: string
  clienteId?: string
  limite?: number
}) {
  const { fechaInicio, fechaFin, clienteId, limite = 10 } = params
  try {
    logger.info('[AI Tool] Consultando ventas', {
      context: 'AI-Tools',
      data: { fechaInicio, fechaFin, clienteId, limite },
    })

    const conditions = []

    if (fechaInicio) {
      const fechaInicioDate = new Date(fechaInicio)
      conditions.push(gte(ventas.fecha, fechaInicioDate))
    }

    if (fechaFin) {
      const fechaFinDate = new Date(fechaFin)
      conditions.push(lte(ventas.fecha, fechaFinDate))
    }

    if (clienteId) {
      conditions.push(eq(ventas.clienteId, clienteId))
    }

    const ventasData = await db.query.ventas.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(ventas.fecha)],
      limit: limite,
      with: {
        cliente: true,
      },
    })

    const totalVentas = ventasData.length
    const montoTotal = ventasData.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)
    const ticketPromedio = totalVentas > 0 ? montoTotal / totalVentas : 0

    return {
      success: true,
      totalVentas,
      montoTotal,
      ticketPromedio: Math.round(ticketPromedio),
      ventas: ventasData.map((v) => ({
        id: v.id,
        fecha: v.fecha,
        cliente: v.cliente?.nombre || 'Sin cliente',
        monto: v.precioTotalVenta,
        estado: v.estado,
      })),
    }
  } catch (error) {
    logger.error('[AI Tool] Error al consultar ventas', error as Error, {
      context: 'AI-Tools',
    })
    return {
      success: false,
      error: 'Error al consultar ventas del sistema',
    }
  }
}

/**
 * Consulta estado de bancos/bóvedas
 */
export async function queryBancos(params: { bancoId?: BancoIdType }) {
  const { bancoId } = params
  try {
    logger.info('[AI Tool] Consultando bancos', {
      context: 'AI-Tools',
      data: { bancoId },
    })

    let bancosData

    if (bancoId) {
      const banco = await db.query.bancos.findFirst({
        where: eq(bancos.id, bancoId),
      })
      bancosData = banco ? [banco] : []
    } else {
      bancosData = await db.query.bancos.findMany()
    }

    const capitalTotal = bancosData.reduce((sum, b) => sum + (b.capitalActual || 0), 0)

    return {
      success: true,
      bancos: bancosData.map((b) => ({
        id: b.id,
        nombre: b.nombre,
        capitalActual: b.capitalActual,
        tipo: b.tipo,
      })),
      capitalTotal,
    }
  } catch (error) {
    logger.error('[AI Tool] Error al consultar bancos', error as Error, {
      context: 'AI-Tools',
    })
    return {
      success: false,
      error: 'Error al consultar estado de bancos',
    }
  }
}

/**
 * Consulta información de clientes
 */
export async function queryClientes(params: { conDeuda?: boolean; limite?: number }) {
  const { conDeuda, limite = 10 } = params
  try {
    logger.info('[AI Tool] Consultando clientes', {
      context: 'AI-Tools',
      data: { conDeuda, limite },
    })

    const conditions = []

    if (conDeuda) {
      conditions.push(sql`${clientes.saldoPendiente} > 0`)
    }

    const clientesData = await db.query.clientes.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit: limite,
    })

    const totalClientes = clientesData.length
    const deudaTotal = clientesData.reduce((sum, c) => sum + (c.saldoPendiente || 0), 0)
    const clientesConDeuda = clientesData.filter((c) => (c.saldoPendiente || 0) > 0).length

    return {
      success: true,
      totalClientes,
      clientesConDeuda,
      deudaTotal,
      clientes: clientesData.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        saldoPendiente: c.saldoPendiente,
        totalCompras: c.totalCompras,
        estado: c.estado,
      })),
    }
  } catch (error) {
    logger.error('[AI Tool] Error al consultar clientes', error as Error, {
      context: 'AI-Tools',
    })
    return {
      success: false,
      error: 'Error al consultar clientes del sistema',
    }
  }
}

/**
 * Genera un reporte del sistema
 */
export async function generateReporte(params: {
  tipo: 'ventas' | 'clientes' | 'bancos' | 'inventario'
  periodo?: 'hoy' | 'semana' | 'mes' | 'año'
}) {
  const { tipo, periodo = 'mes' } = params
  try {
    logger.info('[AI Tool] Generando reporte', {
      context: 'AI-Tools',
      data: { tipo, periodo },
    })

    // Calcular fecha de inicio según periodo
    const ahora = new Date()
    const fechaInicio = new Date()

    switch (periodo) {
      case 'hoy':
        fechaInicio.setHours(0, 0, 0, 0)
        break
      case 'semana':
        fechaInicio.setDate(ahora.getDate() - 7)
        break
      case 'mes':
        fechaInicio.setMonth(ahora.getMonth() - 1)
        break
      case 'año':
        fechaInicio.setFullYear(ahora.getFullYear() - 1)
        break
    }

    let reporteData: Record<string, unknown> = {}

    if (tipo === 'ventas') {
      const ventasData = await db.query.ventas.findMany({
        where: gte(ventas.fecha, fechaInicio),
      })

      const totalVentas = ventasData.length
      const montoTotal = ventasData.reduce((sum, v) => sum + (v.precioTotalVenta || 0), 0)

      reporteData = {
        tipo: 'ventas',
        periodo,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: ahora.toISOString(),
        totalVentas,
        montoTotal,
        ticketPromedio: totalVentas > 0 ? Math.round(montoTotal / totalVentas) : 0,
      }
    } else if (tipo === 'clientes') {
      const clientesData = await db.query.clientes.findMany()
      const totalClientes = clientesData.length
      const deudaTotal = clientesData.reduce((sum, c) => sum + (c.saldoPendiente || 0), 0)

      reporteData = {
        tipo: 'clientes',
        periodo,
        totalClientes,
        deudaTotal,
        clientesActivos: clientesData.filter((c) => c.estado === 'activo').length,
      }
    } else if (tipo === 'bancos') {
      const bancosData = await db.query.bancos.findMany()
      const capitalTotal = bancosData.reduce((sum, b) => sum + (b.capitalActual || 0), 0)

      reporteData = {
        tipo: 'bancos',
        periodo,
        totalBancos: bancosData.length,
        capitalTotal,
        bancos: bancosData.map((b) => ({ id: b.id, nombre: b.nombre, capital: b.capitalActual })),
      }
    }

    return {
      success: true,
      reporte: reporteData,
      generadoEn: ahora.toISOString(),
    }
  } catch (error) {
    logger.error('[AI Tool] Error al generar reporte', error as Error, {
      context: 'AI-Tools',
    })
    return {
      success: false,
      error: 'Error al generar reporte del sistema',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// DEFINICIÓN DE TOOLS PARA AI SDK (usando el formato correcto)
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

export const chronosAITools = {
  consultarVentas: {
    description:
      'Consulta información de ventas del sistema. Puede filtrar por fechas, cliente y limitar resultados.',
    parameters: z.object({
      fechaInicio: z.string().optional().describe('Fecha inicial en formato ISO (YYYY-MM-DD)'),
      fechaFin: z.string().optional().describe('Fecha final en formato ISO (YYYY-MM-DD)'),
      clienteId: z.string().optional().describe('ID del cliente para filtrar'),
      limite: z.number().optional().default(10).describe('Número máximo de resultados'),
    }),
    execute: queryVentas,
  },
  consultarBancos: {
    description: 'Obtiene el estado financiero de los bancos/bóvedas del sistema.',
    parameters: z.object({
      bancoId: z
        .enum([
          'boveda_monte',
          'boveda_usa',
          'profit',
          'leftie',
          'azteca',
          'flete_sur',
          'utilidades',
        ])
        .optional()
        .describe('ID específico del banco a consultar'),
    }),
    execute: queryBancos,
  },
  consultarClientes: {
    description:
      'Consulta información de clientes del sistema. Puede filtrar por clientes con deuda pendiente.',
    parameters: z.object({
      conDeuda: z.boolean().optional().describe('Filtrar solo clientes con deuda pendiente'),
      limite: z.number().optional().default(10).describe('Número máximo de resultados'),
    }),
    execute: queryClientes,
  },
  generarReporte: {
    description:
      'Genera un reporte analítico del sistema con métricas clave según el tipo y periodo especificado.',
    parameters: z.object({
      tipo: z
        .enum(['ventas', 'clientes', 'bancos', 'inventario'])
        .describe('Tipo de reporte a generar'),
      periodo: z
        .enum(['hoy', 'semana', 'mes', 'año'])
        .optional()
        .default('mes')
        .describe('Periodo de tiempo del reporte'),
    }),
    execute: generateReporte,
  },
}
