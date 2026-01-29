'use server'

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, movimientos } from '@/database/schema'
import { desc, eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════════
// SCHEMAS DE VALIDACIÓN ZOD
// ═══════════════════════════════════════════════════════════════

const TransferenciaSchema = z.object({
  bancoOrigenId: z.string().min(1, 'Banco origen requerido'),
  bancoDestinoId: z.string().min(1, 'Banco destino requerido'),
  monto: z.number().positive('Monto debe ser positivo'),
  concepto: z.string().min(1, 'Concepto requerido'),
})

const GastoSchema = z.object({
  bancoId: z.string().min(1, 'Banco requerido'),
  monto: z.number().positive('Monto debe ser positivo'),
  concepto: z.string().min(1, 'Concepto requerido'),
  observaciones: z.string().optional(),
})

// ═══════════════════════════════════════════════════════════════
// SERVER ACTIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Obtener todos los bancos con su capital actual
 */
export async function getBancos() {
  try {
    const result = await db.query.bancos.findMany({
      where: eq(bancos.activo, true),
      orderBy: (bancos, { asc }) => [asc(bancos.orden)],
    })
    return { success: true, data: result }
  } catch (error) {
    logger.error('Error obteniendo bancos:', error as Error, { context: 'bancos' })
    return { error: 'Error al obtener bancos' }
  }
}

/**
 * Obtener banco específico con movimientos recientes
 */
export async function getBancoById(id: string) {
  try {
    const [banco] = await db.select().from(bancos).where(eq(bancos.id, id)).limit(1)

    if (!banco) {
      return { error: 'Banco no encontrado' }
    }

    const recentMovimientos = await db.query.movimientos.findMany({
      where: eq(movimientos.bancoId, id),
      orderBy: [desc(movimientos.fecha)],
      limit: 50,
      with: {
        cliente: true,
        venta: true,
      },
    })

    return {
      success: true,
      data: {
        ...banco,
        movimientos: recentMovimientos,
      },
    }
  } catch (error) {
    logger.error('Error obteniendo banco:', error as Error, { context: 'bancos' })
    return { error: 'Error al obtener banco' }
  }
}

import { type TransferenciaBancosInput } from './types'

// ... schemas ...

/**
 * Realizar transferencia entre bancos
 */
export async function transferirEntreBancos(input: TransferenciaBancosInput) {
  logger.info('🔍 Input recibido en transferirEntreBancos', {
    context: 'BancosAction:transferir',
    data: {
      bancoOrigen: input.bancoOrigenId,
      bancoDestino: input.bancoDestinoId,
      monto: input.monto,
      concepto: input.concepto,
    },
  })

  const parsed = TransferenciaSchema.safeParse(input)

  if (!parsed.success) {
    logger.error('❌ Error de validación en transferencia', parsed.error, {
      context: 'BancosAction:transferir',
      data: { errors: parsed.error.flatten().fieldErrors },
    })
    return {
      error: 'Datos inválidos',
      details: parsed.error.flatten().fieldErrors,
    }
  }

  const { data } = parsed
  const now = new Date()

  if (data.bancoOrigenId === data.bancoDestinoId) {
    return { error: 'Los bancos de origen y destino deben ser diferentes' }
  }
  // ... rest of logic ...

  try {
    // Verificar que el banco origen tiene fondos suficientes
    const [bancoOrigen] = await db
      .select()
      .from(bancos)
      .where(eq(bancos.id, data.bancoOrigenId))
      .limit(1)

    if (!bancoOrigen) {
      return { error: 'Banco origen no encontrado' }
    }

    if (bancoOrigen.capitalActual < data.monto) {
      return { error: `Fondos insuficientes. Disponible: $${bancoOrigen.capitalActual.toFixed(2)}` }
    }

    const transferenciaId = nanoid()

    await db.transaction(async (tx) => {
      // 1. Restar del banco origen
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} - ${data.monto}`,
          historicoGastos: sql`${bancos.historicoGastos} + ${data.monto}`,
          updatedAt: now,
        })
        .where(eq(bancos.id, data.bancoOrigenId))

      // 2. Sumar al banco destino
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${data.monto}`,
          historicoIngresos: sql`${bancos.historicoIngresos} + ${data.monto}`,
          updatedAt: now,
        })
        .where(eq(bancos.id, data.bancoDestinoId))

      // 3. Crear movimiento de salida
      await tx.insert(movimientos).values({
        id: nanoid(),
        bancoId: data.bancoOrigenId,
        tipo: 'transferencia_salida',
        monto: data.monto,
        fecha: now,
        concepto: `Transferencia a ${data.bancoDestinoId}: ${data.concepto}`,
        referencia: transferenciaId,
        bancoOrigenId: data.bancoOrigenId,
        bancoDestinoId: data.bancoDestinoId,
      })

      // 4. Crear movimiento de entrada
      await tx.insert(movimientos).values({
        id: nanoid(),
        bancoId: data.bancoDestinoId,
        tipo: 'transferencia_entrada',
        monto: data.monto,
        fecha: now,
        concepto: `Transferencia desde ${data.bancoOrigenId}: ${data.concepto}`,
        referencia: transferenciaId,
        bancoOrigenId: data.bancoOrigenId,
        bancoDestinoId: data.bancoDestinoId,
      })
    })

    revalidatePath('/bancos')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error en transferencia:', error as Error, { context: 'bancos' })
    return { error: 'Error al realizar transferencia. Intenta de nuevo.' }
  }
}

/**
 * Registrar gasto en un banco
 */
export async function registrarGasto(formData: FormData) {
  const rawData = {
    bancoId: formData.get('bancoId'),
    monto: Number(formData.get('monto')),
    concepto: formData.get('concepto'),
    observaciones: formData.get('observaciones') || undefined,
  }

  const parsed = GastoSchema.safeParse(rawData)

  if (!parsed.success) {
    return {
      error: 'Datos inválidos',
      details: parsed.error.flatten().fieldErrors,
    }
  }

  const { data } = parsed
  const now = new Date()

  try {
    // Verificar fondos
    const [banco] = await db.select().from(bancos).where(eq(bancos.id, data.bancoId)).limit(1)

    if (!banco) {
      return { error: 'Banco no encontrado' }
    }

    if (banco.capitalActual < data.monto) {
      return { error: `Fondos insuficientes. Disponible: $${banco.capitalActual.toFixed(2)}` }
    }

    await db.transaction(async (tx) => {
      // 1. Restar del banco
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} - ${data.monto}`,
          historicoGastos: sql`${bancos.historicoGastos} + ${data.monto}`,
          updatedAt: now,
        })
        .where(eq(bancos.id, data.bancoId))

      // 2. Crear movimiento
      await tx.insert(movimientos).values({
        id: nanoid(),
        bancoId: data.bancoId,
        tipo: 'gasto',
        monto: data.monto,
        fecha: now,
        concepto: data.concepto,
        observaciones: data.observaciones,
      })
    })

    revalidatePath('/bancos')
    revalidatePath('/gastos')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error registrando gasto', error as Error, {
      context: 'BancosAction:registrarGasto',
    })
    return { error: 'Error al registrar gasto. Intenta de nuevo.' }
  }
}

/**
 * Obtener capital total de todos los bancos
 */
export async function getCapitalTotal() {
  try {
    const resultQuery = await db
      .select({
        capitalTotal: sql<number>`sum(${bancos.capitalActual})`,
        ingresosHistoricos: sql<number>`sum(${bancos.historicoIngresos})`,
        gastosHistoricos: sql<number>`sum(${bancos.historicoGastos})`,
      })
      .from(bancos)
      .where(eq(bancos.activo, true))

    const result = resultQuery[0]
    return {
      success: true,
      data: {
        capitalTotal: result?.capitalTotal ?? 0,
        ingresosHistoricos: result?.ingresosHistoricos ?? 0,
        gastosHistoricos: result?.gastosHistoricos ?? 0,
      },
    }
  } catch (error) {
    logger.error('Error obteniendo capital total', error as Error, {
      context: 'BancosAction:getCapitalTotal',
    })
    return { error: 'Error al obtener capital' }
  }
}

/**
 * Obtener movimientos de un banco específico
 */
export async function getMovimientosBanco(bancoId: string, limit = 100) {
  try {
    const result = await db.query.movimientos.findMany({
      where: eq(movimientos.bancoId, bancoId),
      orderBy: [desc(movimientos.fecha)],
      limit,
      with: {
        cliente: true,
        venta: true,
      },
    })

    return { success: true, data: result }
  } catch (error) {
    logger.error('Error obteniendo movimientos del banco', error as Error, {
      context: 'BancosAction:getMovimientosBanco',
    })
    return { error: 'Error al obtener movimientos' }
  }
}

// ═══════════════════════════════════════════════════════════════
// SCHEMAS ADICIONALES
// ═══════════════════════════════════════════════════════════════

const IngresoSchema = z.object({
  bancoId: z.string().min(1, 'Banco requerido'),
  monto: z.number().positive('Monto debe ser positivo'),
  concepto: z.string().min(1, 'Concepto requerido'),
  categoria: z.string().optional(),
  referencia: z.string().optional(),
})

const CorteSchema = z.object({
  bancoId: z.string().min(1, 'Banco requerido'),
  conteoFisico: z.number().min(0, 'Conteo debe ser positivo o cero'),
  observaciones: z.string().optional(),
})

type CorteInput = z.infer<typeof CorteSchema>

/**
 * Registrar ingreso en un banco
 */
export async function registrarIngreso(formData: FormData) {
  const rawData = {
    bancoId: formData.get('bancoId'),
    monto: Number(formData.get('monto')),
    concepto: formData.get('concepto'),
    categoria: formData.get('categoria') || undefined,
    referencia: formData.get('referencia') || undefined,
  }

  logger.info('🔍 Input recibido en registrarIngreso', {
    context: 'BancosAction:ingreso',
    data: rawData,
  })

  const parsed = IngresoSchema.safeParse(rawData)

  if (!parsed.success) {
    logger.error('❌ Error de validación en ingreso', parsed.error, {
      context: 'BancosAction:ingreso',
      data: { errors: parsed.error.flatten().fieldErrors },
    })
    return {
      error: 'Datos inválidos',
      details: parsed.error.flatten().fieldErrors,
    }
  }

  const { data } = parsed
  const now = new Date()

  try {
    await db.transaction(async (tx) => {
      // 1. Sumar al banco
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${data.monto}`,
          historicoIngresos: sql`${bancos.historicoIngresos} + ${data.monto}`,
          updatedAt: now,
        })
        .where(eq(bancos.id, data.bancoId))

      // 2. Crear movimiento
      await tx.insert(movimientos).values({
        id: nanoid(),
        bancoId: data.bancoId,
        tipo: 'ingreso',
        monto: data.monto,
        fecha: now,
        concepto: data.concepto,
        categoria: data.categoria ?? 'Operaciones',
        referencia: data.referencia,
      })
    })

    revalidatePath('/bancos')
    revalidatePath('/ingresos')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error registrando ingreso', error as Error, {
      context: 'BancosAction:registrarIngreso',
    })
    return { error: 'Error al registrar ingreso. Intenta de nuevo.' }
  }
}

/**
 * Realizar corte de caja (reconciliación)
 */
export async function realizarCorte(input: CorteInput) {
  const parsed = CorteSchema.safeParse(input)
  // ... rest of logic ...

  if (!parsed.success) {
    return {
      error: 'Datos inválidos',
      details: parsed.error.flatten().fieldErrors,
    }
  }

  const { data } = parsed
  const now = new Date()

  try {
    // Obtener capital actual del banco
    const [banco] = await db.select().from(bancos).where(eq(bancos.id, data.bancoId)).limit(1)

    if (!banco) {
      return { error: 'Banco no encontrado' }
    }

    const capitalSistema = banco.capitalActual
    const diferencia = data.conteoFisico - capitalSistema

    // Si no hay diferencia, no hacer nada
    if (Math.abs(diferencia) < 0.01) {
      return { success: true, message: 'Sin diferencias', diferencia: 0 }
    }

    await db.transaction(async (tx) => {
      // Ajustar capital
      await tx
        .update(bancos)
        .set({
          capitalActual: data.conteoFisico,
          // Si sobrante: suma a ingresos, si faltante: suma a gastos
          ...(diferencia > 0
            ? { historicoIngresos: sql`${bancos.historicoIngresos} + ${diferencia}` }
            : { historicoGastos: sql`${bancos.historicoGastos} + ${Math.abs(diferencia)}` }),
          updatedAt: now,
        })
        .where(eq(bancos.id, data.bancoId))

      // Crear movimiento de corte
      const esSobrante = diferencia > 0
      await tx.insert(movimientos).values({
        id: nanoid(),
        bancoId: data.bancoId,
        tipo: esSobrante ? 'ingreso' : 'gasto',
        monto: Math.abs(diferencia),
        fecha: now,
        concepto: `Corte de caja: ${esSobrante ? 'Sobrante' : 'Faltante'} de $${Math.abs(diferencia).toFixed(2)}`,
        categoria: 'Corte',
        observaciones:
          data.observaciones ??
          `Capital sistema: $${capitalSistema.toFixed(2)}, Conteo físico: $${data.conteoFisico.toFixed(2)}`,
      })
    })

    revalidatePath('/bancos')
    revalidatePath('/cortes')
    revalidatePath('/dashboard')

    return {
      success: true,
      diferencia,
      tipo: diferencia > 0 ? 'sobrante' : 'faltante',
      message: `Corte realizado. ${diferencia > 0 ? 'Sobrante' : 'Faltante'}: $${Math.abs(diferencia).toFixed(2)}`,
    }
  } catch (error) {
    logger.error('Error realizando corte', error as Error, {
      context: 'BancosAction:realizarCorte',
    })
    return { error: 'Error al realizar corte. Intenta de nuevo.' }
  }
}

/**
 * Obtener resumen para corte de banco
 */
export async function getResumenCorteBanco(input: {
  bancoId: string
  fechaDesde?: Date
  fechaHasta?: Date
}) {
  const { bancoId, fechaDesde, fechaHasta } = input

  try {
    const [banco] = await db.select().from(bancos).where(eq(bancos.id, bancoId)).limit(1)
    if (!banco) {
      return { success: false, error: 'Banco no encontrado' }
    }

    // Rango de fechas (por defecto hoy)
    const desde =
      fechaDesde ??
      (() => {
        const d = new Date()
        d.setHours(0, 0, 0, 0)
        return d
      })()
    const hasta = fechaHasta ?? new Date()

    const movimientosRango = await db.query.movimientos.findMany({
      where: (m, { and, gte, lte }) =>
        and(eq(m.bancoId, bancoId), gte(m.fecha, desde), lte(m.fecha, hasta)),
      orderBy: (m, { desc }) => [desc(m.fecha)],
    })

    const ingresos = movimientosRango
      .filter((m) => m.tipo === 'ingreso')
      .reduce((sum, m) => sum + m.monto, 0)
    const gastos = movimientosRango
      .filter((m) => m.tipo === 'gasto')
      .reduce((sum, m) => sum + m.monto, 0)
    const transferenciasEntrada = movimientosRango
      .filter((m) => m.tipo === 'transferencia_entrada')
      .reduce((sum, m) => sum + m.monto, 0)
    const transferenciasSalida = movimientosRango
      .filter((m) => m.tipo === 'transferencia_salida')
      .reduce((sum, m) => sum + m.monto, 0)

    const saldoInicial =
      banco.capitalActual - (ingresos - gastos + transferenciasEntrada - transferenciasSalida)

    return {
      success: true,
      data: {
        banco: {
          id: banco.id,
          nombre: banco.nombre,
          capitalActual: banco.capitalActual,
        },
        saldoInicial,
        saldoFinal: banco.capitalActual,
        ingresos,
        gastos,
        transferenciasEntrada,
        transferenciasSalida,
        balance: ingresos - gastos,
        diferencia: 0, // Se calcula después del conteo físico
        movimientos: movimientosRango.map((m) => ({
          id: m.id,
          tipo: m.tipo as 'ingreso' | 'gasto' | 'transferencia',
          monto: m.monto,
          concepto: m.concepto,
          fecha: m.fecha,
        })),
      },
    }
  } catch (error) {
    logger.error('Error obteniendo resumen de corte', error as Error, {
      context: 'BancosAction:getResumenCorteBanco',
    })
    return { success: false, error: 'Error al obtener resumen' }
  }
}

/**
 * Obtener todos los movimientos recientes de todos los bancos
 */
export async function getAllMovimientosRecientes(limit = 50) {
  try {
    const result = await db.query.movimientos.findMany({
      orderBy: [desc(movimientos.fecha)],
      limit,
      with: {
        banco: true,
        cliente: true,
        venta: true,
      },
    })

    return { success: true, data: result }
  } catch (error) {
    logger.error('Error obteniendo movimientos recientes', error as Error, {
      context: 'BancosAction:getAllMovimientosRecientes',
    })
    return { error: 'Error al obtener movimientos' }
  }
}

/**
 * Eliminar movimiento y revertir saldo en banco
 */
export async function deleteMovimiento(id: string) {
  if (!id) return { error: 'ID requerido' }

  try {
    const [movimiento] = await db.select().from(movimientos).where(eq(movimientos.id, id)).limit(1)

    if (!movimiento) {
      return { error: 'Movimiento no encontrado' }
    }

    const now = new Date()

    await db.transaction(async (tx) => {
      // Revertir impacto en banco
      if (movimiento.tipo === 'ingreso' || movimiento.tipo === 'abono') {
        // Si fue ingreso, restamos del banco
        await tx
          .update(bancos)
          .set({
            capitalActual: sql`${bancos.capitalActual} - ${movimiento.monto}`,
            historicoIngresos: sql`${bancos.historicoIngresos} - ${movimiento.monto}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, movimiento.bancoId))
      } else if (movimiento.tipo === 'gasto' || movimiento.tipo === 'pago') {
        // Si fue gasto, sumamos al banco
        await tx
          .update(bancos)
          .set({
            capitalActual: sql`${bancos.capitalActual} + ${movimiento.monto}`,
            historicoGastos: sql`${bancos.historicoGastos} - ${movimiento.monto}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, movimiento.bancoId))
      }
      // Nota: Transferencias son más complejas, por ahora solo permitimos borrar simples o asumir riesgo
      // Idealmente bloquear borrado de transferencias si no es en par

      await tx.delete(movimientos).where(eq(movimientos.id, id))
    })

    revalidatePath('/bancos')
    revalidatePath('/gastos')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error eliminando movimiento', error as Error, {
      context: 'BancosAction:deleteMovimiento',
    })
    return { error: 'Error al eliminar movimiento' }
  }
}

/**
 * Obtener un movimiento por ID
 */
export async function getMovimientoById(id: string) {
  try {
    const [movimiento] = await db.select().from(movimientos).where(eq(movimientos.id, id)).limit(1)

    if (!movimiento) {
      return { error: 'Movimiento no encontrado' }
    }

    return { success: true, data: movimiento }
  } catch (error) {
    logger.error('Error obteniendo movimiento:', error as Error, { context: 'bancos' })
    return { error: 'Error al obtener movimiento' }
  }
}

/**
 * Actualizar un movimiento (solo campos informativos)
 */
export async function updateMovimiento(input: {
  id: string
  concepto: string
  referencia?: string
  observaciones?: string
}) {
  try {
    const { id, concepto, referencia, observaciones } = input

    await db
      .update(movimientos)
      .set({
        concepto,
        referencia,
        observaciones,
      })
      .where(eq(movimientos.id, id))

    revalidatePath('/bancos')
    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error actualizando movimiento:', error as Error, { context: 'bancos' })
    return { error: 'Error al actualizar movimiento' }
  }
}
