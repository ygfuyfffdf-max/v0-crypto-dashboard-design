'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CHRONOS INFINITY 2026 - CORE SERVER ACTIONS
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Implementación completa de la lógica de negocio según documentación:
 * - Distribución GYA automática a 3 bancos (Bóveda Monte, Fletes, Utilidades)
 * - Transacciones atómicas con Drizzle
 * - Trazabilidad de lotes FIFO
 * - Histórico inmutable vs Capital proporcional
 *
 * REGLAS SAGRADAS:
 * 1. Histórico siempre es 100% (inmutable)
 * 2. Capital es proporcional al % pagado
 * 3. Las ventas distribuyen a SOLO 3 bancos: boveda_monte, flete_sur, utilidades
 * 4. Los otros 4 bancos (usa, azteca, leftie, profit) NO reciben de ventas
 */

import { calcularDistribucionParcial, calcularDistribucionVenta } from '@/app/lib/services/logic'
import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import {
  abonos,
  bancos,
  clientes,
  distribuidores,
  entradaAlmacen,
  movimientos,
  ordenesCompra,
  salidaAlmacen,
  ventas,
} from '@/database/schema'
import { eq, gt, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import {
  AbonoVentaCompletaSchema,
  CreateOrdenCompletaSchema,
  CreateVentaCompletaSchema,
  TransferenciaBancosSchema,
  type AbonoVentaCompletaInput,
  type CreateOrdenCompletaInput,
  type CreateVentaCompletaInput,
  type TransferenciaBancosInput,
} from './types'

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS DE RESULTADO
// ═══════════════════════════════════════════════════════════════════════════════

type ActionResult<T = unknown> =
  | { success: true; data: T }
  | { success: false; error: string; details?: Record<string, string[]> }

// ═══════════════════════════════════════════════════════════════════════════════
// ORDEN DE COMPRA - Flujo Completo
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Crear Orden de Compra con flujo completo:
 * 1. Si distribuidor no existe → crear nuevo
 * 2. Calcular costoTotal = (costoUnidad + fleteUnidad) × cantidad
 * 3. Crear OC con adeudoPendiente = costoTotal
 * 4. Actualizar Distribuidor.adeudoTotal += costoTotal
 * 5. Crear entrada en Almacén (stockActual += cantidad)
 */
export async function createOrdenCompraCompleta(
  input: CreateOrdenCompletaInput,
): Promise<ActionResult<{ id: string; numeroOrden: string }>> {
  try {
    const validated = CreateOrdenCompletaSchema.parse(input)
    const now = new Date()
    const ordenId = nanoid()
    const numeroOrden = `OC-${Date.now().toString(36).toUpperCase()}`

    // Calcular totales según lógica CHRONOS
    const _costoUnidad = validated.precioUnitario + validated.fleteUnitario
    const subtotal = validated.precioUnitario * validated.cantidad
    const fleteTotal = validated.fleteUnitario * validated.cantidad
    const ivaAmount = subtotal * (validated.iva / 100)
    const costoTotal = subtotal + fleteTotal + ivaAmount

    await db.transaction(async (tx) => {
      // 1. Obtener o crear distribuidor
      let distribuidorId = validated.distribuidorId

      if (!distribuidorId && validated.distribuidorNombre) {
        // Crear nuevo distribuidor
        distribuidorId = nanoid()
        await tx.insert(distribuidores).values({
          id: distribuidorId,
          nombre: validated.distribuidorNombre,
          saldoPendiente: 0,
          totalOrdenesCompra: 0,
          totalPagado: 0,
          estado: 'activo',
          createdAt: now,
          updatedAt: now,
        })
        logger.info('Nuevo distribuidor creado', {
          context: 'ChronosCore',
          data: { distribuidorId },
        })
      }

      if (!distribuidorId) {
        throw new Error('Distribuidor no especificado')
      }

      // 2. Crear la orden de compra
      await tx.insert(ordenesCompra).values({
        id: ordenId,
        distribuidorId,
        fecha: now,
        numeroOrden,
        cantidad: validated.cantidad,
        stockActual: validated.cantidad, // Stock inicial = cantidad
        precioUnitario: validated.precioUnitario,
        fleteUnitario: validated.fleteUnitario,
        subtotal,
        iva: ivaAmount,
        total: costoTotal,
        montoPagado: validated.montoPagoInicial,
        montoRestante: costoTotal - validated.montoPagoInicial,
        estado:
          validated.montoPagoInicial >= costoTotal
            ? 'completo'
            : validated.montoPagoInicial > 0
              ? 'parcial'
              : 'pendiente',
        bancoOrigenId: validated.bancoOrigenId,
        observaciones: validated.observaciones,
        createdAt: now,
        updatedAt: now,
      })

      // 3. Actualizar adeudo del distribuidor
      await tx
        .update(distribuidores)
        .set({
          saldoPendiente: sql`${distribuidores.saldoPendiente} + ${costoTotal - validated.montoPagoInicial}`,
          totalOrdenesCompra: sql`${distribuidores.totalOrdenesCompra} + ${costoTotal}`,
          totalPagado: sql`${distribuidores.totalPagado} + ${validated.montoPagoInicial}`,
          updatedAt: now,
        })
        .where(eq(distribuidores.id, distribuidorId))

      // 4. Registrar entrada en almacén (trazabilidad)
      await tx.insert(entradaAlmacen).values({
        id: nanoid(),
        ordenCompraId: ordenId,
        cantidad: validated.cantidad,
        costoTotal,
        fecha: now,
        observaciones: `Entrada de OC ${numeroOrden}`,
        createdAt: now,
      })

      // 5. Si hay pago inicial, registrar movimiento y actualizar banco
      if (validated.montoPagoInicial > 0 && validated.bancoOrigenId) {
        // Verificar capital del banco
        const [banco] = await tx
          .select()
          .from(bancos)
          .where(eq(bancos.id, validated.bancoOrigenId))
          .limit(1)

        if (!banco || (banco.capitalActual ?? 0) < validated.montoPagoInicial) {
          throw new Error('Capital insuficiente en el banco seleccionado')
        }

        // Crear movimiento de gasto
        await tx.insert(movimientos).values({
          id: nanoid(),
          bancoId: validated.bancoOrigenId,
          tipo: 'pago',
          monto: validated.montoPagoInicial,
          fecha: now,
          concepto: `Pago OC ${numeroOrden}`,
          referencia: ordenId,
          distribuidorId,
          ordenCompraId: ordenId,
          createdAt: now,
        })

        // Actualizar capital del banco
        await tx
          .update(bancos)
          .set({
            capitalActual: sql`${bancos.capitalActual} - ${validated.montoPagoInicial}`,
            historicoGastos: sql`${bancos.historicoGastos} + ${validated.montoPagoInicial}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, validated.bancoOrigenId))
      }
    })

    revalidatePath('/ordenes')
    revalidatePath('/distribuidores')
    revalidatePath('/almacen')
    revalidatePath('/bancos')
    revalidatePath('/dashboard')

    logger.info('OC creada exitosamente', {
      context: 'ChronosCore',
      data: { ordenId, numeroOrden },
    })
    return { success: true, data: { id: ordenId, numeroOrden } }
  } catch (error) {
    logger.error('Error creando OC', error as Error, {
      context: 'ChronosCore:createOrdenCompraCompleta',
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear orden de compra',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VENTA - Flujo Completo con Distribución GYA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Crear Venta con distribución sagrada GYA:
 * 1. Validar stock disponible
 * 2. Si cliente no existe → crear nuevo
 * 3. Calcular distribución: Monte (costo), Fletes, Utilidades (ganancia)
 * 4. Asignar origen de lotes (FIFO si no se especifica)
 * 5. Crear venta con estado según pago
 * 6. Actualizar cliente.deudaTotal
 * 7. Actualizar stock de OCs fuente
 * 8. Si hay pago, distribuir proporcionalmente a los 3 bancos
 */
export async function createVentaCompleta(input: CreateVentaCompletaInput): Promise<
  ActionResult<{
    id: string
    distribucion: { bovedaMonte: number; fletes: number; utilidades: number }
  }>
> {
  try {
    const validated = CreateVentaCompletaSchema.parse(input)
    const now = new Date()
    const ventaId = nanoid()

    // Calcular totales según lógica CHRONOS
    const precioTotalVenta = validated.precioVentaUnidad * validated.cantidad

    // Distribución GYA (histórico inmutable - siempre 100%)
    const distribucion = calcularDistribucionVenta(
      validated.precioVentaUnidad,
      validated.precioCompraUnidad,
      validated.precioFlete,
      validated.cantidad,
    )

    // Determinar estado de pago
    let estadoPago: 'pendiente' | 'parcial' | 'completo' = 'pendiente'
    if (validated.abonoInicial >= precioTotalVenta) {
      estadoPago = 'completo'
    } else if (validated.abonoInicial > 0) {
      estadoPago = 'parcial'
    }

    await db.transaction(async (tx) => {
      // 1. Verificar stock disponible (de OCs con stock > 0)
      const ocsConStock = await tx
        .select()
        .from(ordenesCompra)
        .where(gt(ordenesCompra.stockActual, 0))
        .orderBy(ordenesCompra.fecha) // FIFO: más antiguas primero

      const stockTotal = ocsConStock.reduce((acc, oc) => acc + (oc.stockActual ?? 0), 0)

      if (stockTotal < validated.cantidad) {
        throw new Error(
          `Stock insuficiente. Disponible: ${stockTotal}, Solicitado: ${validated.cantidad}`,
        )
      }

      // 2. Obtener o crear cliente
      let clienteId = validated.clienteId

      if (!clienteId && validated.clienteNombre) {
        clienteId = nanoid()
        await tx.insert(clientes).values({
          id: clienteId,
          nombre: validated.clienteNombre,
          saldoPendiente: 0,
          totalCompras: 0,
          totalAbonos: 0,
          estado: 'activo',
          createdAt: now,
          updatedAt: now,
        })
        logger.info('Nuevo cliente creado', { context: 'ChronosCore', data: { clienteId } })
      }

      if (!clienteId) {
        throw new Error('Cliente no especificado')
      }

      // 3. Asignar origen de lotes (FIFO automático si no se especifica)
      let origenLotes: { ocId: string; cantidad: number }[] = []

      if (validated.origenLotes && validated.origenLotes.length > 0) {
        origenLotes = validated.origenLotes
      } else {
        // FIFO: tomar de las OCs más antiguas primero
        let cantidadRestante = validated.cantidad
        for (const oc of ocsConStock) {
          if (cantidadRestante <= 0) break
          const cantidadDeEstaOC = Math.min(oc.stockActual ?? 0, cantidadRestante)
          if (cantidadDeEstaOC > 0) {
            origenLotes.push({ ocId: oc.id, cantidad: cantidadDeEstaOC })
            cantidadRestante -= cantidadDeEstaOC
          }
        }
      }

      // 4. Actualizar stock de las OCs fuente
      for (const lote of origenLotes) {
        await tx
          .update(ordenesCompra)
          .set({
            stockActual: sql`${ordenesCompra.stockActual} - ${lote.cantidad}`,
            updatedAt: now,
          })
          .where(eq(ordenesCompra.id, lote.ocId))
      }

      // 5. Crear la venta
      await tx.insert(ventas).values({
        id: ventaId,
        clienteId,
        fecha: now,
        cantidad: validated.cantidad,
        precioVentaUnidad: validated.precioVentaUnidad,
        precioCompraUnidad: validated.precioCompraUnidad,
        precioFlete: validated.precioFlete,
        precioTotalVenta,
        montoPagado: validated.abonoInicial,
        montoRestante: precioTotalVenta - validated.abonoInicial,
        estadoPago,
        // Distribución GYA histórica (inmutable, 100%)
        montoBovedaMonte: distribucion.bovedaMonte,
        montoFletes: distribucion.fletes,
        montoUtilidades: distribucion.utilidades,
        // Trazabilidad de lotes
        origenLotes: JSON.stringify(origenLotes),
        observaciones: validated.observaciones,
        createdAt: now,
        updatedAt: now,
      })

      // 6. Registrar salida en almacén
      await tx.insert(salidaAlmacen).values({
        id: nanoid(),
        ventaId,
        cantidad: validated.cantidad,
        origenLotes: JSON.stringify(origenLotes),
        fecha: now,
        observaciones: `Salida por venta ${ventaId}`,
        createdAt: now,
      })

      // 7. Actualizar deuda del cliente
      await tx
        .update(clientes)
        .set({
          saldoPendiente: sql`${clientes.saldoPendiente} + ${precioTotalVenta - validated.abonoInicial}`,
          totalCompras: sql`${clientes.totalCompras} + ${precioTotalVenta}`,
          totalAbonos: sql`${clientes.totalAbonos} + ${validated.abonoInicial}`,
          updatedAt: now,
        })
        .where(eq(clientes.id, clienteId))

      // 8. Si hay abono inicial, distribuir proporcionalmente a los 3 bancos
      if (validated.abonoInicial > 0) {
        const proporcion = validated.abonoInicial / precioTotalVenta
        const capitalDistribucion = calcularDistribucionParcial(
          distribucion,
          validated.abonoInicial,
          precioTotalVenta,
        )

        const bancosGYA = [
          {
            bancoId: 'boveda_monte',
            monto: capitalDistribucion.capitalBovedaMonte,
            concepto: 'Costo venta',
          },
          {
            bancoId: 'flete_sur',
            monto: capitalDistribucion.capitalFletes,
            concepto: 'Flete venta',
          },
          {
            bancoId: 'utilidades',
            monto: capitalDistribucion.capitalUtilidades,
            concepto: 'Utilidad venta',
          },
        ]

        for (const mov of bancosGYA) {
          if (mov.monto > 0) {
            // Crear movimiento
            await tx.insert(movimientos).values({
              id: nanoid(),
              bancoId: mov.bancoId,
              tipo: 'distribucion_gya',
              monto: mov.monto,
              fecha: now,
              concepto: `${mov.concepto} (${(proporcion * 100).toFixed(0)}%)`,
              referencia: ventaId,
              ventaId,
              clienteId,
              createdAt: now,
            })

            // Actualizar capital del banco
            await tx
              .update(bancos)
              .set({
                capitalActual: sql`${bancos.capitalActual} + ${mov.monto}`,
                historicoIngresos: sql`${bancos.historicoIngresos} + ${mov.monto}`,
                updatedAt: now,
              })
              .where(eq(bancos.id, mov.bancoId))
          }
        }

        // Registrar abono
        await tx.insert(abonos).values({
          id: nanoid(),
          ventaId,
          clienteId,
          monto: validated.abonoInicial,
          fecha: now,
          proporcion,
          montoBovedaMonte: capitalDistribucion.capitalBovedaMonte,
          montoFletes: capitalDistribucion.capitalFletes,
          montoUtilidades: capitalDistribucion.capitalUtilidades,
          montoPagadoAcumulado: validated.abonoInicial,
          montoRestantePostAbono: precioTotalVenta - validated.abonoInicial,
          estadoPagoResultante: estadoPago,
          concepto: 'Pago inicial',
          createdAt: now,
        })
      }
    })

    revalidatePath('/ventas')
    revalidatePath('/clientes')
    revalidatePath('/ordenes')
    revalidatePath('/almacen')
    revalidatePath('/bancos')
    revalidatePath('/dashboard')

    logger.info('Venta creada exitosamente', {
      context: 'ChronosCore',
      data: { ventaId, distribucion, estadoPago },
    })

    return {
      success: true,
      data: {
        id: ventaId,
        distribucion: {
          bovedaMonte: distribucion.bovedaMonte,
          fletes: distribucion.fletes,
          utilidades: distribucion.utilidades,
        },
      },
    }
  } catch (error) {
    logger.error('Error creando venta', error as Error, {
      context: 'ChronosCore:createVentaCompleta',
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al crear venta',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABONO A VENTA - Flujo con distribución proporcional
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Registrar abono a venta existente:
 * 1. Validar que el abono no exceda el monto restante
 * 2. Calcular nueva proporción total
 * 3. Recalcular capital proporcional para los 3 bancos
 * 4. Actualizar venta y cliente
 * 5. Registrar movimientos en bancos
 */
export async function abonarVentaCompleta(
  input: AbonoVentaCompletaInput,
): Promise<ActionResult<{ nuevoEstado: string; proporcionTotal: number }>> {
  try {
    const validated = AbonoVentaCompletaSchema.parse(input)
    const now = new Date()

    // Obtener venta actual
    const [venta] = await db.select().from(ventas).where(eq(ventas.id, validated.ventaId)).limit(1)

    if (!venta) {
      return { success: false, error: 'Venta no encontrada' }
    }

    if (venta.estadoPago === 'completo') {
      return { success: false, error: 'La venta ya está completamente pagada' }
    }

    if (validated.monto > (venta.montoRestante ?? 0)) {
      return {
        success: false,
        error: `El abono ($${validated.monto.toFixed(2)}) excede el monto restante ($${(venta.montoRestante ?? 0).toFixed(2)})`,
      }
    }

    const nuevoMontoPagado = (venta.montoPagado ?? 0) + validated.monto
    const nuevoMontoRestante = (venta.montoRestante ?? 0) - validated.monto
    const nuevoEstado = nuevoMontoRestante <= 0.01 ? 'completo' : 'parcial'
    const proporcionTotal = nuevoMontoPagado / venta.precioTotalVenta
    const proporcionAbono = validated.monto / venta.precioTotalVenta

    await db.transaction(async (tx) => {
      // 1. Actualizar venta
      await tx
        .update(ventas)
        .set({
          montoPagado: nuevoMontoPagado,
          montoRestante: nuevoMontoRestante,
          estadoPago: nuevoEstado,
          updatedAt: now,
        })
        .where(eq(ventas.id, validated.ventaId))

      // 2. Actualizar cliente
      await tx
        .update(clientes)
        .set({
          saldoPendiente: sql`${clientes.saldoPendiente} - ${validated.monto}`,
          totalAbonos: sql`${clientes.totalAbonos} + ${validated.monto}`,
          updatedAt: now,
        })
        .where(eq(clientes.id, venta.clienteId))

      // 3. Calcular distribución proporcional del abono
      const montoBovedaMonte = (venta.montoBovedaMonte ?? 0) * proporcionAbono
      const montoFletes = (venta.montoFletes ?? 0) * proporcionAbono
      const montoUtilidades = (venta.montoUtilidades ?? 0) * proporcionAbono

      // 4. Crear movimientos y actualizar bancos
      const bancosGYA = [
        { bancoId: 'boveda_monte', monto: montoBovedaMonte, concepto: 'Abono costo' },
        { bancoId: 'flete_sur', monto: montoFletes, concepto: 'Abono flete' },
        { bancoId: 'utilidades', monto: montoUtilidades, concepto: 'Abono utilidad' },
      ]

      for (const mov of bancosGYA) {
        if (mov.monto > 0) {
          await tx.insert(movimientos).values({
            id: nanoid(),
            bancoId: mov.bancoId,
            tipo: 'abono',
            monto: mov.monto,
            fecha: now,
            concepto: `${mov.concepto} - ${validated.concepto || 'Abono cliente'}`,
            referencia: validated.ventaId,
            ventaId: validated.ventaId,
            clienteId: venta.clienteId,
            createdAt: now,
          })

          await tx
            .update(bancos)
            .set({
              capitalActual: sql`${bancos.capitalActual} + ${mov.monto}`,
              historicoIngresos: sql`${bancos.historicoIngresos} + ${mov.monto}`,
              updatedAt: now,
            })
            .where(eq(bancos.id, mov.bancoId))
        }
      }

      // 5. Registrar abono
      await tx.insert(abonos).values({
        id: nanoid(),
        ventaId: validated.ventaId,
        clienteId: venta.clienteId,
        monto: validated.monto,
        fecha: now,
        proporcion: proporcionAbono,
        montoBovedaMonte,
        montoFletes,
        montoUtilidades,
        montoPagadoAcumulado: nuevoMontoPagado,
        montoRestantePostAbono: nuevoMontoRestante,
        estadoPagoResultante: nuevoEstado,
        concepto: validated.concepto || 'Abono cliente',
        createdAt: now,
      })
    })

    revalidatePath('/ventas')
    revalidatePath('/clientes')
    revalidatePath('/bancos')
    revalidatePath('/dashboard')

    logger.info('Abono registrado', {
      context: 'ChronosCore',
      data: { ventaId: validated.ventaId, monto: validated.monto, nuevoEstado, proporcionTotal },
    })

    return {
      success: true,
      data: { nuevoEstado, proporcionTotal },
    }
  } catch (error) {
    logger.error('Error en abono', error as Error, { context: 'ChronosCore:abonarVentaCompleta' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al procesar abono',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSFERENCIA ENTRE BANCOS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Transferencia entre bancos:
 * - Resta capital del banco origen
 * - Suma capital al banco destino
 * - Registra movimientos en ambos bancos
 */
export async function transferirEntreBancos(
  input: TransferenciaBancosInput,
): Promise<ActionResult<{ movimientoOrigenId: string; movimientoDestinoId: string }>> {
  try {
    const validated = TransferenciaBancosSchema.parse(input)
    const now = new Date()
    const movOrigenId = nanoid()
    const movDestinoId = nanoid()

    // Verificar banco origen
    const [bancoOrigen] = await db
      .select()
      .from(bancos)
      .where(eq(bancos.id, validated.bancoOrigenId))
      .limit(1)

    if (!bancoOrigen) {
      return { success: false, error: 'Banco origen no encontrado' }
    }

    if ((bancoOrigen.capitalActual ?? 0) < validated.monto) {
      return {
        success: false,
        error: `Capital insuficiente. Disponible: $${(bancoOrigen.capitalActual ?? 0).toFixed(2)}`,
      }
    }

    await db.transaction(async (tx) => {
      // 1. Restar del banco origen
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} - ${validated.monto}`,
          historicoGastos: sql`${bancos.historicoGastos} + ${validated.monto}`,
          updatedAt: now,
        })
        .where(eq(bancos.id, validated.bancoOrigenId))

      // 2. Sumar al banco destino
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${validated.monto}`,
          historicoIngresos: sql`${bancos.historicoIngresos} + ${validated.monto}`,
          updatedAt: now,
        })
        .where(eq(bancos.id, validated.bancoDestinoId))

      // 3. Crear movimiento salida
      await tx.insert(movimientos).values({
        id: movOrigenId,
        bancoId: validated.bancoOrigenId,
        tipo: 'transferencia_salida',
        monto: validated.monto,
        fecha: now,
        concepto: `${validated.concepto} → ${validated.bancoDestinoId}`,
        referencia: movDestinoId,
        bancoOrigenId: validated.bancoOrigenId,
        bancoDestinoId: validated.bancoDestinoId,
        createdAt: now,
      })

      // 4. Crear movimiento entrada
      await tx.insert(movimientos).values({
        id: movDestinoId,
        bancoId: validated.bancoDestinoId,
        tipo: 'transferencia_entrada',
        monto: validated.monto,
        fecha: now,
        concepto: `${validated.concepto} ← ${validated.bancoOrigenId}`,
        referencia: movOrigenId,
        bancoOrigenId: validated.bancoOrigenId,
        bancoDestinoId: validated.bancoDestinoId,
        createdAt: now,
      })
    })

    revalidatePath('/bancos')
    revalidatePath('/movimientos')
    revalidatePath('/dashboard')

    logger.info('Transferencia completada', {
      context: 'ChronosCore',
      data: {
        origen: validated.bancoOrigenId,
        destino: validated.bancoDestinoId,
        monto: validated.monto,
      },
    })

    return {
      success: true,
      data: { movimientoOrigenId: movOrigenId, movimientoDestinoId: movDestinoId },
    }
  } catch (error) {
    logger.error('Error en transferencia', error as Error, {
      context: 'ChronosCore:transferirEntreBancos',
    })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error en transferencia',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGO A DISTRIBUIDOR
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Pago a distribuidor:
 * - Resta capital del banco origen
 * - Reduce adeudo del distribuidor
 * - Actualiza estado de la OC
 */
export async function pagarDistribuidor(input: {
  ordenId: string
  monto: number
  bancoOrigenId: string
  referencia?: string
}): Promise<ActionResult<{ nuevoEstado: string }>> {
  try {
    const now = new Date()

    // Obtener la orden
    const [orden] = await db
      .select()
      .from(ordenesCompra)
      .where(eq(ordenesCompra.id, input.ordenId))
      .limit(1)

    if (!orden) {
      return { success: false, error: 'Orden no encontrada' }
    }

    if (orden.estado === 'completo') {
      return { success: false, error: 'La orden ya está pagada' }
    }

    if (input.monto > (orden.montoRestante ?? 0)) {
      return {
        success: false,
        error: `El pago excede el adeudo pendiente ($${(orden.montoRestante ?? 0).toFixed(2)})`,
      }
    }

    // Verificar banco
    const [banco] = await db
      .select()
      .from(bancos)
      .where(eq(bancos.id, input.bancoOrigenId))
      .limit(1)

    if (!banco || (banco.capitalActual ?? 0) < input.monto) {
      return { success: false, error: 'Capital insuficiente en el banco' }
    }

    const nuevoMontoPagado = (orden.montoPagado ?? 0) + input.monto
    const nuevoMontoRestante = (orden.montoRestante ?? 0) - input.monto
    const nuevoEstado = nuevoMontoRestante <= 0.01 ? 'completo' : 'parcial'

    await db.transaction(async (tx) => {
      // 1. Actualizar orden
      await tx
        .update(ordenesCompra)
        .set({
          montoPagado: nuevoMontoPagado,
          montoRestante: nuevoMontoRestante,
          estado: nuevoEstado,
          updatedAt: now,
        })
        .where(eq(ordenesCompra.id, input.ordenId))

      // 2. Reducir adeudo del distribuidor
      await tx
        .update(distribuidores)
        .set({
          saldoPendiente: sql`${distribuidores.saldoPendiente} - ${input.monto}`,
          totalPagado: sql`${distribuidores.totalPagado} + ${input.monto}`,
          updatedAt: now,
        })
        .where(eq(distribuidores.id, orden.distribuidorId))

      // 3. Reducir capital del banco
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} - ${input.monto}`,
          historicoGastos: sql`${bancos.historicoGastos} + ${input.monto}`,
          updatedAt: now,
        })
        .where(eq(bancos.id, input.bancoOrigenId))

      // 4. Registrar movimiento
      await tx.insert(movimientos).values({
        id: nanoid(),
        bancoId: input.bancoOrigenId,
        tipo: 'pago',
        monto: input.monto,
        fecha: now,
        concepto: `Pago OC ${orden.numeroOrden}`,
        referencia: input.referencia,
        distribuidorId: orden.distribuidorId,
        ordenCompraId: input.ordenId,
        createdAt: now,
      })
    })

    revalidatePath('/ordenes')
    revalidatePath('/distribuidores')
    revalidatePath('/bancos')
    revalidatePath('/movimientos')
    revalidatePath('/dashboard')

    logger.info('Pago a distribuidor completado', {
      context: 'ChronosCore',
      data: { ordenId: input.ordenId, monto: input.monto, nuevoEstado },
    })

    return { success: true, data: { nuevoEstado } }
  } catch (error) {
    logger.error('Error en pago', error as Error, { context: 'ChronosCore:pagarDistribuidor' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al procesar pago',
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GASTO GENERAL
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Registrar gasto general:
 * - Resta capital del banco origen
 * - Registra movimiento de gasto
 */
export async function registrarGasto(input: {
  bancoOrigenId: string
  monto: number
  concepto: string
  observaciones?: string
}): Promise<ActionResult<{ movimientoId: string }>> {
  try {
    const now = new Date()
    const movId = nanoid()

    // Verificar banco
    const [banco] = await db
      .select()
      .from(bancos)
      .where(eq(bancos.id, input.bancoOrigenId))
      .limit(1)

    if (!banco) {
      return { success: false, error: 'Banco no encontrado' }
    }

    if ((banco.capitalActual ?? 0) < input.monto) {
      return {
        success: false,
        error: `Capital insuficiente. Disponible: $${(banco.capitalActual ?? 0).toFixed(2)}`,
      }
    }

    await db.transaction(async (tx) => {
      // 1. Reducir capital del banco
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} - ${input.monto}`,
          historicoGastos: sql`${bancos.historicoGastos} + ${input.monto}`,
          updatedAt: now,
        })
        .where(eq(bancos.id, input.bancoOrigenId))

      // 2. Registrar movimiento
      await tx.insert(movimientos).values({
        id: movId,
        bancoId: input.bancoOrigenId,
        tipo: 'gasto',
        monto: input.monto,
        fecha: now,
        concepto: input.concepto,
        observaciones: input.observaciones,
        createdAt: now,
      })
    })

    revalidatePath('/bancos')
    revalidatePath('/movimientos')
    revalidatePath('/dashboard')

    logger.info('Gasto registrado', {
      context: 'ChronosCore',
      data: { bancoId: input.bancoOrigenId, monto: input.monto },
    })

    return { success: true, data: { movimientoId: movId } }
  } catch (error) {
    logger.error('Error en gasto', error as Error, { context: 'ChronosCore:registrarGasto' })
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al registrar gasto',
    }
  }
}
