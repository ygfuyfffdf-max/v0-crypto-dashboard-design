'use server'

/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 📋 CHRONOS INFINITY 2026 — FLUJOS COMPLETOS ATÓMICOS
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Este archivo contiene las acciones COMPLETAS que garantizan:
 * 1. Transacciones atómicas (todo o nada)
 * 2. Actualización de stock en almacén
 * 3. Creación automática de clientes/distribuidores nuevos
 * 4. Distribución GYA correcta
 * 5. Actualización de todos los componentes relacionados
 *
 * FLUJOS IMPLEMENTADOS:
 * - crearOrdenCompraCompleta: OC + Stock + Distribuidor + Entrada
 * - crearVentaCompleta: Venta + Stock + Cliente + 3 Bancos + Salida
 */

import { calcularDistribucionGYA } from '@/app/_lib/utils/gya-calculo'
import {
    OrdenCompraCompletaSchema,
    VentaCompletaSchema,
    type OrdenCompraCompletaInput,
    type VentaCompletaInput,
} from '@/app/lib/schemas/flujos-completos.schema'
import { logger } from '@/app/lib/utils/logger'
import { normalizeNombre } from '@/app/lib/utils/string-utils'
import { db } from '@/database'
import {
    almacen,
    bancos,
    clientes,
    distribuidores,
    entradaAlmacen,
    movimientos,
    ordenesCompra,
    salidaAlmacen,
    ventas,
} from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// NOTA: Los schemas y tipos deben importarse directamente desde:
// "@/app/lib/schemas/flujos-completos.schema"
// No se pueden re-exportar desde archivos "use server"

// ═══════════════════════════════════════════════════════════════════════════════════════
// RESPUESTAS TIPADAS
// ═══════════════════════════════════════════════════════════════════════════════════════

interface ActionResult<T = unknown> {
  success: boolean
  data?: T
  error?: string
}

interface OrdenCompletaResponse {
  ordenId: string
  numeroOrden: string
  distribuidorId: string
  productoId: string
  total: number
  distribuidorNuevo: boolean
  productoNuevo: boolean
  entradaAlmacenId: string
}

interface VentaCompletaResponse {
  ventaId: string
  clienteId: string
  productoId: string
  precioTotalVenta: number
  clienteNuevo: boolean
  distribucion: {
    montoBovedaMonte: number
    montoFletes: number
    montoUtilidades: number
    capitalDistribuido: number
    historicoRegistrado: number
  }
  salidaAlmacenId: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ACCIÓN: CREAR ORDEN DE COMPRA COMPLETA
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Crea una orden de compra completa con todos los efectos colaterales:
 * 1. Crea distribuidor si es nuevo
 * 2. Crea producto en almacén si es nuevo
 * 3. Registra la orden de compra
 * 4. Actualiza stock del almacén (entrada)
 * 5. Registra entrada en historial
 * 6. Actualiza deuda con distribuidor
 * 7. Si hay pago inicial, reduce capital del banco
 */
export async function crearOrdenCompraCompleta(
  input: OrdenCompraCompletaInput,
): Promise<ActionResult<OrdenCompletaResponse>> {
  try {
    logger.info('🔍 Input recibido en crearOrdenCompraCompleta', {
      context: 'FlujoOC',
      data: {
        distribuidorId: input.distribuidorId,
        distribuidorNombre: input.distribuidorNombre,
        productoId: input.productoId,
        productoNombre: input.productoNombre,
        cantidad: input.cantidad,
        precioUnitario: input.precioUnitario,
      },
    })

    // Validar input con logging detallado
    const validated = OrdenCompraCompletaSchema.parse(input)

    logger.info('✅ Input validado correctamente', { context: 'FlujoOC' })

    const ahora = new Date()
    let distribuidorId = validated.distribuidorId
    let productoId = validated.productoId
    let distribuidorNuevo = false
    let productoNuevo = false

    // Calcular totales
    const subtotal = validated.precioUnitario * validated.cantidad
    const fleteTotal = validated.fleteUnitario * validated.cantidad
    const ivaAmount = subtotal * (validated.iva / 100)
    const total = subtotal + fleteTotal + ivaAmount

    // Validar pago inicial
    if (validated.montoPagoInicial > 0 && validated.bancoOrigenId) {
      const [banco] = await db
        .select()
        .from(bancos)
        .where(eq(bancos.id, validated.bancoOrigenId))
        .limit(1)

      if (!banco) {
        return { success: false, error: 'Banco origen no encontrado' }
      }

      if ((banco.capitalActual ?? 0) < validated.montoPagoInicial) {
        return {
          success: false,
          error: `Capital insuficiente. Disponible: $${(banco.capitalActual ?? 0).toLocaleString()}`,
        }
      }
    }

    // Generar IDs
    const ordenId = `oc_${nanoid(12)}`
    const entradaId = `entrada_${nanoid(12)}`
    const numeroOrden = validated.numeroOrden || `OC-${Date.now().toString(36).toUpperCase()}`

    // Ejecutar transacción atómica
    await db.transaction(async (tx) => {
      // ═══════════════════════════════════════════════════════════════
      // PASO 1: Crear distribuidor si es nuevo
      // ═══════════════════════════════════════════════════════════════
      if (!distribuidorId && validated.distribuidorNombre) {
        // Buscar distribuidor existente con nombre normalizado
        const nombreNormalizado = normalizeNombre(validated.distribuidorNombre)

        logger.info('Buscando distribuidor existente', {
          context: 'FlujoOC',
          nombreOriginal: validated.distribuidorNombre,
          nombreNormalizado,
        })

        const distribuidorExistente = await tx
          .select()
          .from(distribuidores)
          .where(sql`LOWER(${distribuidores.nombre}) = ${nombreNormalizado}`)
          .limit(1)

        if (distribuidorExistente.length > 0) {
          distribuidorId = distribuidorExistente[0]!.id
          logger.info('Distribuidor existente encontrado', {
            context: 'FlujoOC',
            distribuidorId,
            nombre: distribuidorExistente[0]!.nombre,
          })
        } else {
          // Crear nuevo distribuidor
          const nuevoDistribuidorId = `dist_${nanoid(12)}`

          await tx.insert(distribuidores).values({
            id: nuevoDistribuidorId,
            nombre: validated.distribuidorNombre, // Usar nombre original, no normalizado
            telefono: validated.distribuidorTelefono ?? null,
            email: validated.distribuidorEmail ?? null,
            saldoPendiente: 0,
            totalOrdenesCompra: 0,
            totalPagado: 0,
            numeroOrdenes: 0,
            numeroPagos: 0,
            createdAt: ahora,
            updatedAt: ahora,
          })

          distribuidorId = nuevoDistribuidorId
          distribuidorNuevo = true

          logger.info('Distribuidor nuevo creado', {
            context: 'FlujoOC',
            data: { distribuidorId, nombre: validated.distribuidorNombre },
          })
        }
      }

      // ═══════════════════════════════════════════════════════════════
      // PASO 2: Crear producto si es nuevo
      // ═══════════════════════════════════════════════════════════════
      if (!productoId && validated.productoNombre) {
        const nuevoProductoId = `prod_${nanoid(12)}`

        await tx.insert(almacen).values({
          id: nuevoProductoId,
          nombre: validated.productoNombre,
          descripcion: validated.productoDescripcion ?? null,
          sku: validated.productoSku ?? null,
          cantidad: 0,
          stockActual: 0,
          totalEntradas: 0,
          totalSalidas: 0,
          precioCompra: validated.precioUnitario,
          precioVenta: validated.precioUnitario * 1.5, // Precio sugerido 50% margen
          distribuidorPrincipalId: distribuidorId ?? null,
          createdAt: ahora,
          updatedAt: ahora,
        })

        productoId = nuevoProductoId
        productoNuevo = true

        logger.info('Producto nuevo creado', {
          context: 'FlujoOC',
          data: { productoId, nombre: validated.productoNombre },
        })
      }

      // ═══════════════════════════════════════════════════════════════
      // PASO 3: Crear la orden de compra
      // ═══════════════════════════════════════════════════════════════
      const montoPagado = validated.montoPagoInicial
      const montoRestante = total - montoPagado
      const estado = montoRestante <= 0 ? 'completo' : montoPagado > 0 ? 'parcial' : 'pendiente'

      // Verificar que tenemos distribuidorId (garantizado por el schema refine)
      if (!distribuidorId) {
        throw new Error('distribuidorId no disponible después de creación')
      }

      // Obtener nombre del producto para guardar en la OC
      let productoNombreOC = validated.productoNombre
      if (!productoNombreOC && productoId) {
        const [productoExistente] = await tx
          .select({ nombre: almacen.nombre })
          .from(almacen)
          .where(eq(almacen.id, productoId))
          .limit(1)
        productoNombreOC = productoExistente?.nombre || 'Producto'
      }

      await tx.insert(ordenesCompra).values({
        id: ordenId,
        distribuidorId: distribuidorId,
        productoId: productoId ?? null,
        producto: productoNombreOC || 'Producto', // Guardar nombre del producto
        fecha: ahora,
        numeroOrden,
        cantidad: validated.cantidad,
        precioUnitario: validated.precioUnitario,
        fleteUnitario: validated.fleteUnitario,
        subtotal,
        iva: ivaAmount,
        total,
        montoPagado,
        montoRestante,
        stockActual: validated.cantidad,
        stockVendido: 0,
        estado,
        bancoOrigenId: validated.bancoOrigenId ?? null,
        observaciones: validated.observaciones ?? null,
      })

      // ═══════════════════════════════════════════════════════════════
      // PASO 4: Actualizar stock del producto en almacén (solo si existe productoId)
      // ═══════════════════════════════════════════════════════════════
      if (productoId) {
        await tx
          .update(almacen)
          .set({
            cantidad: sql`${almacen.cantidad} + ${validated.cantidad}`,
            stockActual: sql`${almacen.stockActual} + ${validated.cantidad}`,
            totalEntradas: sql`${almacen.totalEntradas} + ${validated.cantidad}`,
            precioCompra: validated.precioUnitario, // Actualizar precio de compra
            precioCompraPromedio: sql`(
              COALESCE(${almacen.precioCompraPromedio}, 0) * ${almacen.totalEntradas} +
              ${validated.precioUnitario} * ${validated.cantidad}
            ) / (${almacen.totalEntradas} + ${validated.cantidad})`,
            valorStockCosto: sql`(${almacen.cantidad} + ${validated.cantidad}) * ${validated.precioUnitario}`,
            ordenesCompraActivas: sql`${almacen.ordenesCompraActivas} + 1`,
            updatedAt: ahora,
          })
          .where(eq(almacen.id, productoId))
      }

      // ═══════════════════════════════════════════════════════════════
      // PASO 5: Registrar entrada en historial (siempre)
      // ═══════════════════════════════════════════════════════════════
      await tx.insert(entradaAlmacen).values({
        id: entradaId,
        ordenCompraId: ordenId,
        productoId: productoId ?? null, // Puede ser null si no hay producto en almacén
        cantidad: validated.cantidad,
        costoTotal: total,
        fecha: ahora,
        observaciones: `Entrada automática por OC ${numeroOrden}`,
      })

      // ═══════════════════════════════════════════════════════════════
      // PASO 6: Actualizar distribuidor (deuda + métricas)
      // ═══════════════════════════════════════════════════════════════
      await tx
        .update(distribuidores)
        .set({
          saldoPendiente: sql`${distribuidores.saldoPendiente} + ${montoRestante}`,
          totalOrdenesCompra: sql`${distribuidores.totalOrdenesCompra} + ${total}`,
          numeroOrdenes: sql`${distribuidores.numeroOrdenes} + 1`,
          updatedAt: ahora,
        })
        .where(eq(distribuidores.id, distribuidorId ?? ''))

      // ═══════════════════════════════════════════════════════════════
      // PASO 7: Si hay pago inicial, procesar
      // ═══════════════════════════════════════════════════════════════
      if (montoPagado > 0 && validated.bancoOrigenId) {
        // Reducir capital del banco
        await tx
          .update(bancos)
          .set({
            capitalActual: sql`${bancos.capitalActual} - ${montoPagado}`,
            historicoGastos: sql`${bancos.historicoGastos} + ${montoPagado}`,
            updatedAt: ahora,
          })
          .where(eq(bancos.id, validated.bancoOrigenId))

        // Actualizar total pagado del distribuidor
        await tx
          .update(distribuidores)
          .set({
            totalPagado: sql`${distribuidores.totalPagado} + ${montoPagado}`,
            numeroPagos: sql`${distribuidores.numeroPagos} + 1`,
          })
          .where(eq(distribuidores.id, distribuidorId ?? ''))

        // Registrar movimiento de pago
        await tx.insert(movimientos).values({
          id: `mov_${nanoid(12)}`,
          bancoId: validated.bancoOrigenId,
          ordenCompraId: ordenId,
          distribuidorId: distribuidorId ?? '',
          tipo: 'pago',
          monto: montoPagado,
          concepto: `Pago inicial OC ${numeroOrden}`,
          referencia: ordenId,
          fecha: ahora,
        })

        logger.info('Pago inicial procesado', {
          context: 'FlujoOC',
          data: { ordenId, monto: montoPagado, bancoId: validated.bancoOrigenId },
        })
      }
    })

    // Revalidar todas las rutas afectadas
    revalidatePath('/ordenes')
    revalidatePath('/distribuidores')
    revalidatePath('/almacen')
    revalidatePath('/bancos')
    revalidatePath('/dashboard')
    revalidatePath('/')

    logger.info('Orden de compra completa creada exitosamente', {
      context: 'FlujoOC',
      data: {
        ordenId,
        numeroOrden,
        total,
        distribuidorNuevo,
        productoNuevo,
      },
    })

    return {
      success: true,
      data: {
        ordenId,
        numeroOrden,
        distribuidorId: distribuidorId ?? '',
        productoId: productoId ?? '',
        total,
        distribuidorNuevo,
        productoNuevo,
        entradaAlmacenId: entradaId,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Error de validación Zod en crearOrdenCompraCompleta', error, {
        context: 'FlujoOC',
        data: {
          inputOriginal: input,
          errors: error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
            code: e.code,
            received: e.code === 'invalid_type' ? (e as any).received : undefined,
          })),
        },
      })
      // Construir mensaje de error más descriptivo
      const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')
      return { success: false, error: errorMessages || 'Error de validación' }
    }
    logger.error('❌ Error inesperado creando orden de compra completa', error as Error, {
      context: 'FlujoOC',
    })
    return { success: false, error: 'Error al crear orden de compra. Intenta de nuevo.' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ACCIÓN: CREAR VENTA COMPLETA
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Crea una venta completa con todos los efectos colaterales:
 * 1. Crea cliente si es nuevo
 * 2. Valida stock disponible
 * 3. Registra la venta
 * 4. Actualiza stock del almacén (salida)
 * 5. Registra salida en historial
 * 6. Ejecuta distribución GYA a 3 bancos
 * 7. Actualiza deuda del cliente
 * 8. Actualiza OC origen si hay trazabilidad
 */
export async function crearVentaCompleta(
  input: VentaCompletaInput,
): Promise<ActionResult<VentaCompletaResponse>> {
  try {
    // Validar input
    const validated = VentaCompletaSchema.parse(input)

    const ahora = new Date()
    let clienteId = validated.clienteId
    let clienteNuevo = false

    // Verificar stock disponible
    const [producto] = await db
      .select()
      .from(almacen)
      .where(eq(almacen.id, validated.productoId))
      .limit(1)

    if (!producto) {
      return { success: false, error: 'Producto no encontrado en almacén' }
    }

    const stockDisponible = producto.cantidad ?? 0
    if (stockDisponible < validated.cantidad) {
      return {
        success: false,
        error: `Stock insuficiente. Disponible: ${stockDisponible}, Solicitado: ${validated.cantidad}`,
      }
    }

    // Calcular distribución GYA
    const distribucion = calcularDistribucionGYA(
      validated.precioVentaUnidad,
      validated.precioCompraUnidad,
      validated.precioFlete,
      validated.cantidad,
    )

    // Calcular montos según estado de pago
    let montoPagado = 0
    if (validated.estadoPago === 'completo') {
      montoPagado = distribucion.precioTotalVenta
    } else if (validated.estadoPago === 'parcial') {
      montoPagado = validated.abonoInicial
    }

    const montoRestante = distribucion.precioTotalVenta - montoPagado
    const proporcion = montoPagado / distribucion.precioTotalVenta

    // Capital a distribuir (proporcional al pago)
    const capitalBovedaMonte = distribucion.montoBovedaMonte * proporcion
    const capitalFletes = distribucion.montoFletes * proporcion
    const capitalUtilidades = distribucion.montoUtilidades * proporcion
    const capitalTotal = capitalBovedaMonte + capitalFletes + capitalUtilidades

    // Generar IDs
    const ventaId = `venta_${nanoid(12)}`
    const salidaId = `salida_${nanoid(12)}`

    // Ejecutar transacción atómica
    await db.transaction(async (tx) => {
      // ═══════════════════════════════════════════════════════════════
      // PASO 1: Crear cliente si es nuevo
      // ═══════════════════════════════════════════════════════════════
      if (!clienteId && validated.clienteNombre) {
        const nuevoClienteId = `cli_${nanoid(12)}`

        await tx.insert(clientes).values({
          id: nuevoClienteId,
          nombre: validated.clienteNombre,
          telefono: validated.clienteTelefono ?? null,
          email: validated.clienteEmail ?? null,
          direccion: validated.clienteDireccion ?? null,
          saldoPendiente: 0,
          totalCompras: 0,
          totalPagado: 0,
          numeroVentas: 0,
          createdAt: ahora,
          updatedAt: ahora,
        })

        clienteId = nuevoClienteId
        clienteNuevo = true

        logger.info('Cliente nuevo creado', {
          context: 'FlujoVenta',
          data: { clienteId, nombre: validated.clienteNombre },
        })
      }

      // Verificar que tenemos clienteId (garantizado por el schema refine)
      if (!clienteId) {
        throw new Error('clienteId no disponible después de creación')
      }

      // ═══════════════════════════════════════════════════════════════
      // PASO 2: Crear la venta
      // ═══════════════════════════════════════════════════════════════
      await tx.insert(ventas).values({
        id: ventaId,
        clienteId: clienteId,
        productoId: validated.productoId,
        fecha: ahora,
        cantidad: validated.cantidad,
        precioVentaUnidad: validated.precioVentaUnidad,
        precioCompraUnidad: validated.precioCompraUnidad,
        precioFlete: validated.precioFlete,
        precioTotalVenta: distribucion.precioTotalVenta,
        montoPagado,
        montoRestante,
        montoBovedaMonte: distribucion.montoBovedaMonte,
        montoFletes: distribucion.montoFletes,
        montoUtilidades: distribucion.montoUtilidades,
        estadoPago: validated.estadoPago,
        ocId: validated.ocId ?? null,
        observaciones: validated.observaciones ?? null,
      })

      // ═══════════════════════════════════════════════════════════════
      // PASO 3: Actualizar stock del producto (reducir)
      // ═══════════════════════════════════════════════════════════════
      await tx
        .update(almacen)
        .set({
          cantidad: sql`${almacen.cantidad} - ${validated.cantidad}`,
          stockActual: sql`${almacen.stockActual} - ${validated.cantidad}`,
          totalSalidas: sql`${almacen.totalSalidas} + ${validated.cantidad}`,
          unidadesVendidas: sql`${almacen.unidadesVendidas} + ${validated.cantidad}`,
          numeroVentas: sql`${almacen.numeroVentas} + 1`,
          ventasTotales: sql`${almacen.ventasTotales} + ${distribucion.precioTotalVenta}`,
          costoTotalVendido: sql`${almacen.costoTotalVendido} + ${distribucion.montoBovedaMonte}`,
          gananciaTotal: sql`${almacen.gananciaTotal} + ${distribucion.montoUtilidades}`,
          ultimaVenta: ahora,
          diasSinVenta: 0,
          valorStockCosto: sql`(${almacen.cantidad} - ${validated.cantidad}) * ${almacen.precioCompra}`,
          valorStockVenta: sql`(${almacen.cantidad} - ${validated.cantidad}) * ${almacen.precioVenta}`,
          updatedAt: ahora,
        })
        .where(eq(almacen.id, validated.productoId))

      // ═══════════════════════════════════════════════════════════════
      // PASO 4: Registrar salida en historial
      // ═══════════════════════════════════════════════════════════════
      await tx.insert(salidaAlmacen).values({
        id: salidaId,
        ventaId,
        productoId: validated.productoId,
        cantidad: validated.cantidad,
        origenLotes: validated.ocId
          ? JSON.stringify([{ ocId: validated.ocId, cantidad: validated.cantidad }])
          : null,
        fecha: ahora,
        observaciones: `Salida automática por venta #${ventaId.slice(-8)}`,
      })

      // ═══════════════════════════════════════════════════════════════
      // PASO 5: Actualizar OC origen si hay trazabilidad
      // ═══════════════════════════════════════════════════════════════
      if (validated.ocId) {
        await tx
          .update(ordenesCompra)
          .set({
            stockVendido: sql`${ordenesCompra.stockVendido} + ${validated.cantidad}`,
            stockActual: sql`${ordenesCompra.stockActual} - ${validated.cantidad}`,
            updatedAt: ahora,
          })
          .where(eq(ordenesCompra.id, validated.ocId))
      }

      // ═══════════════════════════════════════════════════════════════
      // PASO 6: Distribución GYA - Actualizar 3 bancos
      // ═══════════════════════════════════════════════════════════════

      // 6a. Bóveda Monte (costo) - Histórico SIEMPRE al 100%, capital proporcional
      await tx
        .update(bancos)
        .set({
          historicoIngresos: sql`${bancos.historicoIngresos} + ${distribucion.montoBovedaMonte}`,
          capitalActual: sql`${bancos.capitalActual} + ${capitalBovedaMonte}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'boveda_monte'))

      await tx.insert(movimientos).values({
        id: `mov_${nanoid(12)}`,
        bancoId: 'boveda_monte',
        ventaId,
        tipo: 'ingreso',
        monto: distribucion.montoBovedaMonte,
        concepto: `Costo venta #${ventaId.slice(-8)} - ${validated.cantidad} uds`,
        referencia: ventaId,
        fecha: ahora,
        observaciones:
          capitalBovedaMonte < distribucion.montoBovedaMonte
            ? `Capital: $${capitalBovedaMonte.toLocaleString()} (${(proporcion * 100).toFixed(0)}% pagado)`
            : null,
      })

      // 6b. Flete Sur (transporte)
      await tx
        .update(bancos)
        .set({
          historicoIngresos: sql`${bancos.historicoIngresos} + ${distribucion.montoFletes}`,
          capitalActual: sql`${bancos.capitalActual} + ${capitalFletes}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'flete_sur'))

      await tx.insert(movimientos).values({
        id: `mov_${nanoid(12)}`,
        bancoId: 'flete_sur',
        ventaId,
        tipo: 'ingreso',
        monto: distribucion.montoFletes,
        concepto: `Flete venta #${ventaId.slice(-8)} - ${validated.cantidad} uds`,
        referencia: ventaId,
        fecha: ahora,
        observaciones:
          capitalFletes < distribucion.montoFletes
            ? `Capital: $${capitalFletes.toLocaleString()} (${(proporcion * 100).toFixed(0)}% pagado)`
            : null,
      })

      // 6c. Utilidades (ganancia)
      await tx
        .update(bancos)
        .set({
          historicoIngresos: sql`${bancos.historicoIngresos} + ${distribucion.montoUtilidades}`,
          capitalActual: sql`${bancos.capitalActual} + ${capitalUtilidades}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'utilidades'))

      await tx.insert(movimientos).values({
        id: `mov_${nanoid(12)}`,
        bancoId: 'utilidades',
        ventaId,
        tipo: 'ingreso',
        monto: distribucion.montoUtilidades,
        concepto: `Utilidad venta #${ventaId.slice(-8)} (${distribucion.margenNeto}%)`,
        referencia: ventaId,
        fecha: ahora,
        observaciones:
          capitalUtilidades < distribucion.montoUtilidades
            ? `Capital: $${capitalUtilidades.toLocaleString()} (${(proporcion * 100).toFixed(0)}% pagado)`
            : null,
      })

      // ═══════════════════════════════════════════════════════════════
      // PASO 7: Actualizar cliente (deuda + métricas)
      // ═══════════════════════════════════════════════════════════════
      await tx
        .update(clientes)
        .set({
          saldoPendiente: sql`${clientes.saldoPendiente} + ${montoRestante}`,
          totalCompras: sql`${clientes.totalCompras} + ${distribucion.precioTotalVenta}`,
          totalPagado: sql`${clientes.totalPagado} + ${montoPagado}`,
          numeroVentas: sql`${clientes.numeroVentas} + 1`,
          updatedAt: ahora,
        })
        .where(eq(clientes.id, clienteId ?? ''))
    })

    // Revalidar todas las rutas afectadas
    revalidatePath('/ventas')
    revalidatePath('/clientes')
    revalidatePath('/almacen')
    revalidatePath('/bancos')
    revalidatePath('/ordenes')
    revalidatePath('/dashboard')
    revalidatePath('/')

    logger.info('Venta completa creada exitosamente', {
      context: 'FlujoVenta',
      data: {
        ventaId,
        total: distribucion.precioTotalVenta,
        clienteNuevo,
        estadoPago: validated.estadoPago,
        margen: distribucion.margenNeto,
      },
    })

    return {
      success: true,
      data: {
        ventaId,
        clienteId: clienteId ?? '',
        productoId: validated.productoId,
        precioTotalVenta: distribucion.precioTotalVenta,
        clienteNuevo,
        distribucion: {
          montoBovedaMonte: distribucion.montoBovedaMonte,
          montoFletes: distribucion.montoFletes,
          montoUtilidades: distribucion.montoUtilidades,
          capitalDistribuido: capitalTotal,
          historicoRegistrado:
            distribucion.montoBovedaMonte + distribucion.montoFletes + distribucion.montoUtilidades,
        },
        salidaAlmacenId: salidaId,
      },
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message ?? 'Error de validación' }
    }
    logger.error('Error creando venta completa', error as Error, { context: 'FlujoVenta' })
    return { success: false, error: 'Error al crear venta. Intenta de nuevo.' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════
// ACCIÓN: REGISTRAR ABONO A VENTA (PROPORCIONAL)
// ═══════════════════════════════════════════════════════════════════════════════════════

/**
 * Registra un abono a una venta existente con distribución proporcional:
 * 1. Actualiza estado de la venta
 * 2. Distribuye capital proporcional a los 3 bancos
 * 3. Reduce deuda del cliente
 * 4. Registra movimientos de abono
 */
export async function registrarAbonoVenta(
  ventaId: string,
  monto: number,
  concepto?: string,
): Promise<
  ActionResult<{ nuevoMontoPagado: number; nuevoEstado: string; capitalDistribuido: number }>
> {
  try {
    if (monto <= 0) {
      return { success: false, error: 'El monto debe ser positivo' }
    }

    // Obtener venta actual
    const [venta] = await db.select().from(ventas).where(eq(ventas.id, ventaId)).limit(1)

    if (!venta) {
      return { success: false, error: 'Venta no encontrada' }
    }

    if (venta.estadoPago === 'completo') {
      return { success: false, error: 'La venta ya está completamente pagada' }
    }

    const montoRestante = venta.montoRestante ?? 0
    if (monto > montoRestante) {
      return {
        success: false,
        error: `El monto excede la deuda. Restante: $${montoRestante.toLocaleString()}`,
      }
    }

    const ahora = new Date()
    const nuevoMontoPagado = (venta.montoPagado ?? 0) + monto
    const nuevoMontoRestante = montoRestante - monto
    const nuevoEstado = nuevoMontoRestante <= 0 ? 'completo' : 'parcial'

    // Calcular proporción del abono
    const proporcionAbono = monto / (venta.precioTotalVenta ?? 1)

    // Calcular incremento de capital proporcional
    const incrementoBovedaMonte = (venta.montoBovedaMonte ?? 0) * proporcionAbono
    const incrementoFletes = (venta.montoFletes ?? 0) * proporcionAbono
    const incrementoUtilidades = (venta.montoUtilidades ?? 0) * proporcionAbono
    const capitalTotal = incrementoBovedaMonte + incrementoFletes + incrementoUtilidades

    // Ejecutar transacción atómica
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

      // Actualizar cliente
      await tx
        .update(clientes)
        .set({
          saldoPendiente: sql`${clientes.saldoPendiente} - ${monto}`,
          totalPagado: sql`${clientes.totalPagado} + ${monto}`,
          updatedAt: ahora,
        })
        .where(eq(clientes.id, venta.clienteId ?? ''))

      // Actualizar capital de 3 bancos (solo capital, histórico ya registrado)
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${incrementoBovedaMonte}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'boveda_monte'))

      await tx.insert(movimientos).values({
        id: `mov_${nanoid(12)}`,
        bancoId: 'boveda_monte',
        ventaId,
        tipo: 'abono',
        monto: incrementoBovedaMonte,
        concepto: concepto || `Abono venta #${ventaId.slice(-8)}`,
        referencia: ventaId,
        fecha: ahora,
      })

      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${incrementoFletes}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'flete_sur'))

      await tx.insert(movimientos).values({
        id: `mov_${nanoid(12)}`,
        bancoId: 'flete_sur',
        ventaId,
        tipo: 'abono',
        monto: incrementoFletes,
        concepto: concepto || `Abono venta #${ventaId.slice(-8)}`,
        referencia: ventaId,
        fecha: ahora,
      })

      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${incrementoUtilidades}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'utilidades'))

      await tx.insert(movimientos).values({
        id: `mov_${nanoid(12)}`,
        bancoId: 'utilidades',
        ventaId,
        tipo: 'abono',
        monto: incrementoUtilidades,
        concepto: concepto || `Abono venta #${ventaId.slice(-8)}`,
        referencia: ventaId,
        fecha: ahora,
      })
    })

    // Revalidar rutas
    revalidatePath('/ventas')
    revalidatePath('/clientes')
    revalidatePath('/bancos')
    revalidatePath('/dashboard')

    logger.info('Abono registrado exitosamente', {
      context: 'FlujoAbono',
      data: { ventaId, monto, nuevoEstado, capitalDistribuido: capitalTotal },
    })

    return {
      success: true,
      data: {
        nuevoMontoPagado,
        nuevoEstado,
        capitalDistribuido: capitalTotal,
      },
    }
  } catch (error) {
    logger.error('Error registrando abono', error as Error, { context: 'FlujoAbono' })
    return { success: false, error: 'Error al registrar abono. Intenta de nuevo.' }
  }
}
