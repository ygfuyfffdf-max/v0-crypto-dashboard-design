// ═══════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2030 — LÓGICA GYA AUTOMATIZADA
// Distribución INMUTABLE de ventas a 3 bancos
//
// FÓRMULA GYA (GRABADA EN PIEDRA — NUNCA SE MODIFICA):
// - Bóveda Monte = precioCompra × cantidad (COSTO)
// - Flete Sur    = precioFlete × cantidad  (TRANSPORTE)
// - Utilidades   = (precioVenta - precioCompra - precioFlete) × cantidad (GANANCIA NETA)
//
// Esta lógica es la base de todo el sistema financiero.
// ═══════════════════════════════════════════════════════════════

'use server'

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { bancos, clientes, movimientos, ventas } from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface VentaInput {
  clienteId: string
  cantidad: number
  precioVentaUnidad: number // Precio de venta al cliente
  precioCompraUnidad: number // Precio de compra (costo del distribuidor)
  precioFlete: number // Flete por unidad
  observaciones?: string
}

// DistribucionGYA se importa desde gya-calculo.ts (ver re-export abajo)

export interface VentaCompleta {
  id: string
  clienteId: string
  clienteNombre?: string
  fecha: number
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete: number
  precioTotalVenta: number
  montoPagado: number
  montoRestante: number
  montoBovedaMonte: number
  montoFletes: number
  montoUtilidades: number
  estadoPago: 'pendiente' | 'parcial' | 'completo'
  observaciones?: string
}

// ═══════════════════════════════════════════════════════════════
// NOTA: Las funciones puras de cálculo GYA están en:
// @/app/_lib/utils/gya-calculo.ts
//
// Importar directamente desde ese archivo:
// import { calcularDistribucionGYA, type DistribucionGYA } from '@/app/_lib/utils/gya-calculo'
//
// NO se pueden re-exportar aquí porque 'use server' solo permite async functions
// ═══════════════════════════════════════════════════════════════

// Importamos para uso interno en este archivo
import { calcularDistribucionGYA } from '@/app/_lib/utils/gya-calculo'

// ═══════════════════════════════════════════════════════════════
// CREAR VENTA CON DISTRIBUCIÓN AUTOMÁTICA
// ═══════════════════════════════════════════════════════════════

export async function crearVentaConDistribucion(
  input: VentaInput,
): Promise<{ success: boolean; data?: VentaCompleta; error?: string }> {
  try {
    // 1. Validar cliente existe
    const clienteResult = await db
      .select({ id: clientes.id, nombre: clientes.nombre })
      .from(clientes)
      .where(eq(clientes.id, input.clienteId))
      .limit(1)

    const clienteExiste = clienteResult[0]
    if (!clienteExiste) {
      return { success: false, error: 'Cliente no encontrado' }
    }

    // 2. Calcular distribución GYA (INMUTABLE)
    const distribucion = calcularDistribucionGYA(
      input.precioVentaUnidad,
      input.precioCompraUnidad,
      input.precioFlete,
      input.cantidad,
    )

    // 3. Validar margen positivo
    if (distribucion.montoUtilidades < 0) {
      return {
        success: false,
        error: `Venta con margen negativo: ${distribucion.margenNeto}%. El precio de venta debe ser mayor a costo + flete.`,
      }
    }

    const ventaId = `venta_${nanoid(12)}`
    const ahora = Math.floor(Date.now() / 1000)

    // 4. Ejecutar transacción atómica
    await db.transaction(async (tx) => {
      // 4a. Crear registro de venta
      await tx.insert(ventas).values({
        id: ventaId,
        clienteId: input.clienteId,
        fecha: ahora,
        cantidad: input.cantidad,
        precioVentaUnidad: input.precioVentaUnidad,
        precioCompraUnidad: input.precioCompraUnidad,
        precioFlete: input.precioFlete,
        precioTotalVenta: distribucion.precioTotalVenta,
        montoPagado: 0,
        montoRestante: distribucion.precioTotalVenta,
        montoBovedaMonte: distribucion.montoBovedaMonte,
        montoFletes: distribucion.montoFletes,
        montoUtilidades: distribucion.montoUtilidades,
        estadoPago: 'pendiente',
        observaciones: input.observaciones,
      })

      // 4b. Crear movimientos de distribución a los 3 bancos
      const movimientosData = [
        {
          id: `mov_${nanoid(12)}`,
          bancoId: 'boveda_monte',
          ventaId,
          tipo: 'ingreso' as const,
          monto: distribucion.montoBovedaMonte,
          concepto: `Costo venta #${ventaId.slice(-8)} - ${input.cantidad} uds`,
          referencia: ventaId,
          fecha: ahora,
        },
        {
          id: `mov_${nanoid(12)}`,
          bancoId: 'flete_sur',
          ventaId,
          tipo: 'ingreso' as const,
          monto: distribucion.montoFletes,
          concepto: `Flete venta #${ventaId.slice(-8)} - ${input.cantidad} uds`,
          referencia: ventaId,
          fecha: ahora,
        },
        {
          id: `mov_${nanoid(12)}`,
          bancoId: 'utilidades',
          ventaId,
          tipo: 'ingreso' as const,
          monto: distribucion.montoUtilidades,
          concepto: `Utilidad venta #${ventaId.slice(-8)} - ${input.cantidad} uds (${distribucion.margenNeto}%)`,
          referencia: ventaId,
          fecha: ahora,
        },
      ]

      for (const mov of movimientosData) {
        await tx.insert(movimientos).values(mov)
      }

      // 4c. Actualizar capitalActual e historicoIngresos de cada banco
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${distribucion.montoBovedaMonte}`,
          historicoIngresos: sql`${bancos.historicoIngresos} + ${distribucion.montoBovedaMonte}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'boveda_monte'))

      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${distribucion.montoFletes}`,
          historicoIngresos: sql`${bancos.historicoIngresos} + ${distribucion.montoFletes}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'flete_sur'))

      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${distribucion.montoUtilidades}`,
          historicoIngresos: sql`${bancos.historicoIngresos} + ${distribucion.montoUtilidades}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'utilidades'))

      // 4d. Actualizar saldo pendiente del cliente
      await tx
        .update(clientes)
        .set({
          saldoPendiente: sql`${clientes.saldoPendiente} + ${distribucion.precioTotalVenta}`,
          updatedAt: ahora,
        })
        .where(eq(clientes.id, input.clienteId))
    })

    logger.info('Venta creada con distribución GYA', {
      context: 'AutomatizacionGYA',
      data: {
        ventaId,
        clienteId: input.clienteId,
        total: distribucion.precioTotalVenta,
        margen: distribucion.margenNeto,
      },
    })

    return {
      success: true,
      data: {
        id: ventaId,
        clienteId: input.clienteId,
        clienteNombre: clienteExiste.nombre,
        fecha: ahora,
        cantidad: input.cantidad,
        precioVentaUnidad: input.precioVentaUnidad,
        precioCompraUnidad: input.precioCompraUnidad,
        precioFlete: input.precioFlete,
        precioTotalVenta: distribucion.precioTotalVenta,
        montoPagado: 0,
        montoRestante: distribucion.precioTotalVenta,
        montoBovedaMonte: distribucion.montoBovedaMonte,
        montoFletes: distribucion.montoFletes,
        montoUtilidades: distribucion.montoUtilidades,
        estadoPago: 'pendiente',
        observaciones: input.observaciones,
      },
    }
  } catch (error) {
    logger.error('Error creando venta', error as Error, { context: 'AutomatizacionGYA' })
    return { success: false, error: 'Error al crear venta con distribución' }
  }
}

// ═══════════════════════════════════════════════════════════════
// REGISTRAR PAGO DE VENTA
// ═══════════════════════════════════════════════════════════════

export async function registrarPagoVenta(
  ventaId: string,
  montoPago: number,
): Promise<{ success: boolean; data?: VentaCompleta; error?: string }> {
  try {
    // Obtener venta actual
    const ventaActualResult = await db.select().from(ventas).where(eq(ventas.id, ventaId)).limit(1)

    const venta = ventaActualResult[0]
    if (!venta) {
      return { success: false, error: 'Venta no encontrada' }
    }

    // Validar monto de pago
    if (montoPago > Number(venta.montoRestante)) {
      return {
        success: false,
        error: `El pago ($${montoPago}) excede el monto restante ($${venta.montoRestante})`,
      }
    }

    const nuevoMontoPagado = Number(venta.montoPagado) + montoPago
    const nuevoMontoRestante = Number(venta.montoRestante) - montoPago
    const nuevoEstado: 'pendiente' | 'parcial' | 'completo' =
      nuevoMontoRestante === 0 ? 'completo' : nuevoMontoPagado > 0 ? 'parcial' : 'pendiente'

    const ahora = Math.floor(Date.now() / 1000)

    await db.transaction(async (tx) => {
      // Actualizar venta
      await tx
        .update(ventas)
        .set({
          montoPagado: nuevoMontoPagado,
          montoRestante: nuevoMontoRestante,
          estadoPago: nuevoEstado,
          updatedAt: ahora,
        })
        .where(eq(ventas.id, ventaId))

      // Registrar movimiento de pago
      await tx.insert(movimientos).values({
        id: `mov_${nanoid(12)}`,
        bancoId: 'boveda_monte', // Los pagos entran a Bóveda Monte
        ventaId,
        tipo: 'ingreso' as const,
        monto: montoPago,
        concepto: `Pago venta #${ventaId.slice(-8)}`,
        referencia: ventaId,
        fecha: ahora,
      })

      // Actualizar saldo del cliente
      await tx
        .update(clientes)
        .set({
          saldoPendiente: sql`${clientes.saldoPendiente} - ${montoPago}`,
          updatedAt: ahora,
        })
        .where(eq(clientes.id, venta.clienteId))
    })

    logger.info('Pago de venta registrado', {
      context: 'AutomatizacionGYA',
      data: {
        ventaId,
        montoPago,
        nuevoEstado,
        restante: nuevoMontoRestante,
      },
    })

    return {
      success: true,
      data: {
        ...venta,
        id: venta.id,
        clienteId: venta.clienteId,
        fecha: venta.fecha ?? 0,
        montoPagado: nuevoMontoPagado,
        montoRestante: nuevoMontoRestante,
        estadoPago: nuevoEstado,
      } as VentaCompleta,
    }
  } catch (error) {
    logger.error('Error registrando pago', error as Error, { context: 'AutomatizacionGYA' })
    return { success: false, error: 'Error al registrar pago' }
  }
}

// ═══════════════════════════════════════════════════════════════
// TRANSFERENCIA ENTRE BANCOS
// ═══════════════════════════════════════════════════════════════

export async function transferirEntreBancos(
  bancoOrigenId: string,
  bancoDestinoId: string,
  monto: number,
  concepto?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validar bancos existen
    const bancosResult = await db
      .select({ id: bancos.id, capitalActual: bancos.capitalActual })
      .from(bancos)
      .where(sql`${bancos.id} IN (${bancoOrigenId}, ${bancoDestinoId})`)

    if (bancosResult.length !== 2) {
      return { success: false, error: 'Uno o ambos bancos no existen' }
    }

    const bancoOrigen = bancosResult.find((b) => b.id === bancoOrigenId)
    if (!bancoOrigen || Number(bancoOrigen.capitalActual) < monto) {
      return {
        success: false,
        error: `Fondos insuficientes en ${bancoOrigenId}. Disponible: $${Number(bancoOrigen?.capitalActual || 0).toLocaleString()}`,
      }
    }

    const ahora = Math.floor(Date.now() / 1000)
    const transferenciaId = `trans_${nanoid(12)}`

    await db.transaction(async (tx) => {
      // Restar del origen
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} - ${monto}`,
          historicoGastos: sql`${bancos.historicoGastos} + ${monto}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, bancoOrigenId))

      // Sumar al destino
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${monto}`,
          historicoIngresos: sql`${bancos.historicoIngresos} + ${monto}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, bancoDestinoId))

      // Registrar movimientos
      await tx.insert(movimientos).values([
        {
          id: `mov_${nanoid(12)}`,
          bancoId: bancoOrigenId,
          tipo: 'transferencia_salida' as const,
          monto: -monto,
          concepto: concepto || `Transferencia a ${bancoDestinoId}`,
          referencia: transferenciaId,
          fecha: ahora,
        },
        {
          id: `mov_${nanoid(12)}`,
          bancoId: bancoDestinoId,
          tipo: 'transferencia_entrada' as const,
          monto: monto,
          concepto: concepto || `Transferencia desde ${bancoOrigenId}`,
          referencia: transferenciaId,
          fecha: ahora,
        },
      ])
    })

    logger.info('Transferencia completada', {
      context: 'AutomatizacionGYA',
      data: {
        transferenciaId,
        origen: bancoOrigenId,
        destino: bancoDestinoId,
        monto,
      },
    })

    return { success: true }
  } catch (error) {
    logger.error('Error en transferencia', error as Error, { context: 'AutomatizacionGYA' })
    return { success: false, error: 'Error al realizar transferencia' }
  }
}

// ═══════════════════════════════════════════════════════════════
// RESUMEN DE DISTRIBUCIÓN GYA DEL DÍA
// ═══════════════════════════════════════════════════════════════

export async function getResumenGYADiario(): Promise<{
  success: boolean
  data?: {
    totalVentas: number
    totalBovedaMonte: number
    totalFletes: number
    totalUtilidades: number
    margenPromedio: number
    cantidadVentas: number
  }
  error?: string
}> {
  try {
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    const hoyTs = Math.floor(hoy.getTime() / 1000)
    const mañanaTs = hoyTs + 86400

    const resumenResult = await db
      .select({
        totalVentas: sql<number>`COALESCE(SUM(${ventas.precioTotalVenta}), 0)`,
        totalBovedaMonte: sql<number>`COALESCE(SUM(${ventas.montoBovedaMonte}), 0)`,
        totalFletes: sql<number>`COALESCE(SUM(${ventas.montoFletes}), 0)`,
        totalUtilidades: sql<number>`COALESCE(SUM(${ventas.montoUtilidades}), 0)`,
        cantidadVentas: sql<number>`COUNT(*)`,
      })
      .from(ventas)
      .where(sql`${ventas.fecha} >= ${hoyTs} AND ${ventas.fecha} < ${mañanaTs}`)

    const data = resumenResult[0]
    if (!data) {
      return {
        success: true,
        data: {
          totalVentas: 0,
          totalBovedaMonte: 0,
          totalFletes: 0,
          totalUtilidades: 0,
          margenPromedio: 0,
          cantidadVentas: 0,
        },
      }
    }

    const margenPromedio =
      Number(data.totalVentas) > 0
        ? (Number(data.totalUtilidades) / Number(data.totalVentas)) * 100
        : 0

    return {
      success: true,
      data: {
        totalVentas: Number(data.totalVentas),
        totalBovedaMonte: Number(data.totalBovedaMonte),
        totalFletes: Number(data.totalFletes),
        totalUtilidades: Number(data.totalUtilidades),
        margenPromedio: Number(margenPromedio.toFixed(2)),
        cantidadVentas: Number(data.cantidadVentas),
      },
    }
  } catch (error) {
    logger.error('Error obteniendo resumen GYA', error as Error, { context: 'AutomatizacionGYA' })
    return { success: false, error: 'Error al obtener resumen' }
  }
}
