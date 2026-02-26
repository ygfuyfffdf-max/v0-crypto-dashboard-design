// @ts-nocheck
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💰 MOVIMIENTOS SERVICE - Colección Unificada
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Servicio para la colección UNIFICADA de movimientos financieros.
 * Reemplaza las colecciones fragmentadas: *_ingresos, *_gastos, *_transferencias
 *
 * @version 2.0 - Turso/Drizzle
 * @date 2025-12-15
 */

'use server'

import { db } from '@/database'
import type { InsertMovimiento, Movimiento } from '@/database/schema'
import { bancos, movimientos } from '@/database/schema'
import { and, desc, eq, gte, lte } from 'drizzle-orm'
import { logger } from '../utils/logger'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface MovimientosFilter {
  bancoId?: string
  tipo?:
    | 'abono'
    | 'pago'
    | 'ingreso'
    | 'gasto'
    | 'transferencia_entrada'
    | 'transferencia_salida'
    | 'distribucion_gya'
  fechaInicio?: Date
  fechaFin?: Date
  limit?: number
}

export interface TotalesBanco {
  totalIngresos: number
  totalGastos: number
  totalTransferenciasEntrada: number
  totalTransferenciasSalida: number
  balance: number
  numeroMovimientos: number
}

// ═══════════════════════════════════════════════════════════════════════════════
// FUNCIONES PRINCIPALES
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Obtener todos los movimientos con filtros opcionales
 */
export async function obtenerMovimientos(filtros: MovimientosFilter = {}): Promise<Movimiento[]> {
  try {
    const conditions = []

    if (filtros.bancoId) {
      conditions.push(eq(movimientos.bancoId, filtros.bancoId))
    }

    if (filtros.tipo) {
      conditions.push(eq(movimientos.tipo, filtros.tipo))
    }

    if (filtros.fechaInicio) {
      conditions.push(gte(movimientos.fecha, filtros.fechaInicio))
    }

    if (filtros.fechaFin) {
      conditions.push(lte(movimientos.fecha, filtros.fechaFin))
    }

    const query = db.query.movimientos.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: desc(movimientos.fecha),
      limit: filtros.limit || 100,
      with: {
        banco: true,
        cliente: true,
        venta: true,
        ordenCompra: true,
      },
    })

    const result = await query

    logger.info('Movimientos obtenidos', {
      context: 'MovimientosService',
      count: result.length,
      filtros,
    })

    return result
  } catch (error) {
    logger.error('Error obteniendo movimientos', error, {
      context: 'MovimientosService',
      filtros,
    })
    throw error
  }
}

/**
 * Crear nuevo movimiento (inmutable)
 */
export async function crearMovimiento(data: InsertMovimiento): Promise<string> {
  try {
    // Validar que el banco existe
    const banco = await db.query.bancos.findFirst({
      where: eq(bancos.id, data.bancoId),
    })

    if (!banco) {
      throw new Error(`Banco ${data.bancoId} no encontrado`)
    }

    // Insertar movimiento
    const [result] = await db.insert(movimientos).values(data).returning({ id: movimientos.id })

    if (!result) {
      throw new Error('Error insertando movimiento')
    }

    logger.info('Movimiento creado', {
      context: 'MovimientosService',
      id: result.id,
      bancoId: data.bancoId,
      tipo: data.tipo,
      monto: data.monto,
    })

    return result.id
  } catch (error) {
    logger.error('Error creando movimiento', error, {
      context: 'MovimientosService',
      data,
    })
    throw error
  }
}

/**
 * Calcular totales de un banco
 */
export async function calcularTotalesBanco(bancoId: string): Promise<TotalesBanco> {
  try {
    const movs = await db.query.movimientos.findMany({
      where: eq(movimientos.bancoId, bancoId),
    })

    const totales: TotalesBanco = {
      totalIngresos: 0,
      totalGastos: 0,
      totalTransferenciasEntrada: 0,
      totalTransferenciasSalida: 0,
      balance: 0,
      numeroMovimientos: movs.length,
    }

    for (const mov of movs) {
      switch (mov.tipo) {
        case 'ingreso':
        case 'abono':
          totales.totalIngresos += mov.monto
          break
        case 'gasto':
        case 'pago':
          totales.totalGastos += mov.monto
          break
        case 'transferencia_entrada':
          totales.totalTransferenciasEntrada += mov.monto
          break
        case 'transferencia_salida':
          totales.totalTransferenciasSalida += mov.monto
          break
      }
    }

    totales.balance =
      totales.totalIngresos +
      totales.totalTransferenciasEntrada -
      totales.totalGastos -
      totales.totalTransferenciasSalida

    return totales
  } catch (error) {
    logger.error('Error calculando totales', error, {
      context: 'MovimientosService',
      bancoId,
    })
    throw error
  }
}

/**
 * Obtener movimientos recientes (últimos N)
 */
export async function obtenerMovimientosRecientes(limit = 20): Promise<Movimiento[]> {
  try {
    const result = await db.query.movimientos.findMany({
      orderBy: desc(movimientos.fecha),
      limit,
      with: {
        banco: true,
        cliente: true,
      },
    })

    return result
  } catch (error) {
    logger.error('Error obteniendo movimientos recientes', error, {
      context: 'MovimientosService',
    })
    throw error
  }
}

/**
 * Verificar si existe movimiento por referencia
 */
export async function existeMovimientoPorReferencia(referencia: string): Promise<boolean> {
  try {
    const mov = await db.query.movimientos.findFirst({
      where: eq(movimientos.referencia, referencia),
    })

    return mov !== undefined
  } catch (error) {
    logger.error('Error verificando referencia', error, {
      context: 'MovimientosService',
    })
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTAR SERVICIO
// ═══════════════════════════════════════════════════════════════════════════════

export const movimientosService = {
  getAll: obtenerMovimientos,
  create: crearMovimiento,
  calcularTotales: calcularTotalesBanco,
  getRecientes: obtenerMovimientosRecientes,
  existeReferencia: existeMovimientoPorReferencia,
}

export default movimientosService
