// @ts-nocheck
import { triggerPostAbono, triggerPostVenta } from '@/app/_actions/triggers'
import { CACHE_KEYS, CACHE_TTL, getCached, invalidateCache } from '@/app/lib/cache'
import { calcularVentaCompleta, FLETE_DEFAULT } from '@/app/lib/formulas'
import { applyRateLimit } from '@/app/lib/rate-limit'
import { CrearVentaAPISchema } from '@/app/lib/schemas/ventas.schema'
import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import {
    almacen,
    bancos,
    clientes,
    movimientos,
    ordenesCompra,
    salidaAlmacen,
    ventas,
} from '@/database/schema'
import { eq, sql } from 'drizzle-orm'
import { NextResponse, type NextRequest } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

// Configuración de cache (revalidar cada 60 segundos)
export const dynamic = 'force-dynamic'
export const revalidate = 60

// ═══════════════════════════════════════════════════════════════════════════
// GET - Obtener todas las ventas CON TRAZABILIDAD COMPLETA
// ═══════════════════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = await applyRateLimit(request, 'read')
  if (rateLimitResult) return rateLimitResult

  try {
    // Intentar obtener desde cache
    const cacheKey = CACHE_KEYS.VENTAS_ALL

    const result = await getCached(
      cacheKey,
      async () => {
        // Usar select con leftJoin para incluir TRAZABILIDAD COMPLETA
        const result = await db
          .select({
            // IDs principales
            id: ventas.id,
            clienteId: ventas.clienteId,
            productoId: ventas.productoId, // ← TRAZABILIDAD: Producto
            ocId: ventas.ocId, // ← TRAZABILIDAD: Orden de Compra

            // Fechas
            fecha: ventas.fecha,
            createdAt: ventas.createdAt,

            // Cantidades y precios
            cantidad: ventas.cantidad,
            precioVentaUnidad: ventas.precioVentaUnidad,
            precioCompraUnidad: ventas.precioCompraUnidad,
            precioFlete: ventas.precioFlete,
            precioTotalVenta: ventas.precioTotalVenta,
            costoTotal: ventas.costoTotal,
            fleteTotal: ventas.fleteTotal,

            // Estado de pago
            montoPagado: ventas.montoPagado,
            montoRestante: ventas.montoRestante,
            porcentajePagado: ventas.porcentajePagado,
            estadoPago: ventas.estadoPago,
            numeroAbonos: ventas.numeroAbonos,

            // Distribución GYA
            montoBovedaMonte: ventas.montoBovedaMonte,
            montoFletes: ventas.montoFletes,
            montoUtilidades: ventas.montoUtilidades,
            capitalBovedaMonte: ventas.capitalBovedaMonte,
            capitalFletes: ventas.capitalFletes,
            capitalUtilidades: ventas.capitalUtilidades,

            // Rentabilidad
            gananciaTotal: ventas.gananciaTotal,
            margenBruto: ventas.margenBruto,
            gananciaPorUnidad: ventas.gananciaPorUnidad,

            // Trazabilidad de lotes
            origenLotes: ventas.origenLotes,
            numeroLotes: ventas.numeroLotes,

            // Auditoría
            metodoPago: ventas.metodoPago,
            observaciones: ventas.observaciones,

            // Datos del cliente
            clienteNombre: clientes.nombre,
            clienteEmail: clientes.email,
            clienteTelefono: clientes.telefono,

            // Datos del producto (si existe)
            productoNombre: almacen.nombre,
            productoSku: almacen.sku,

            // Datos de la OC (si existe)
            ocNumero: ordenesCompra.id,
            ocDistribuidorId: ordenesCompra.distribuidorId,
          })
          .from(ventas)
          .leftJoin(clientes, eq(ventas.clienteId, clientes.id))
          .leftJoin(almacen, eq(ventas.productoId, almacen.id))
          .leftJoin(ordenesCompra, eq(ventas.ocId, ordenesCompra.id))
          .orderBy(sql`${ventas.fecha} DESC`)

        // Transformar resultado con TRAZABILIDAD COMPLETA
        const transformedResult = result.map((row) => ({
          // IDs y Trazabilidad
          id: row.id,
          clienteId: row.clienteId,
          productoId: row.productoId,
          ocId: row.ocId,

          // Fechas
          fecha: row.fecha,
          createdAt: row.createdAt,

          // Cantidades y precios
          cantidad: row.cantidad,
          precioVentaUnidad: row.precioVentaUnidad,
          precioCompraUnidad: row.precioCompraUnidad,
          precioFlete: row.precioFlete,
          precioTotalVenta: row.precioTotalVenta,
          costoTotal: row.costoTotal,
          fleteTotal: row.fleteTotal,

          // Estado de pago
          montoPagado: row.montoPagado,
          montoRestante: row.montoRestante,
          porcentajePagado: row.porcentajePagado,
          estadoPago: row.estadoPago,
          numeroAbonos: row.numeroAbonos,

          // Distribución GYA
          distribucionGYA: {
            montoBovedaMonte: row.montoBovedaMonte,
            montoFletes: row.montoFletes,
            montoUtilidades: row.montoUtilidades,
            capitalBovedaMonte: row.capitalBovedaMonte,
            capitalFletes: row.capitalFletes,
            capitalUtilidades: row.capitalUtilidades,
          },

          // Rentabilidad
          rentabilidad: {
            gananciaTotal: row.gananciaTotal,
            margenBruto: row.margenBruto,
            gananciaPorUnidad: row.gananciaPorUnidad,
          },

          // Trazabilidad de lotes
          origenLotes: row.origenLotes ? JSON.parse(row.origenLotes) : null,
          numeroLotes: row.numeroLotes,

          // Método de pago
          metodoPago: row.metodoPago,
          observaciones: row.observaciones,

          // Objetos relacionados
          cliente: row.clienteNombre
            ? {
                id: row.clienteId,
                nombre: row.clienteNombre,
                email: row.clienteEmail,
                telefono: row.clienteTelefono,
              }
            : null,

          producto: row.productoId
            ? {
                id: row.productoId,
                nombre: row.productoNombre,
                sku: row.productoSku,
              }
            : null,

          ordenCompra: row.ocId
            ? {
                id: row.ocId,
                distribuidorId: row.ocDistribuidorId,
              }
            : null,
        }))

        return transformedResult
      },
      { ttl: CACHE_TTL.MEDIUM, staleWhileRevalidate: true },
    )

    return NextResponse.json(result)
  } catch (error) {
    logger.error('Error fetching ventas:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// POST - Crear nueva venta con distribución GYA automática
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  // Rate limiting para escritura
  const rateLimitResult = await applyRateLimit(request, 'write')
  if (rateLimitResult) return rateLimitResult

  try {
    const body = await request.json()

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDACIÓN ZOD DE ENTRADA
    // ═══════════════════════════════════════════════════════════════════════
    const validation = CrearVentaAPISchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos de venta inválidos',
          details: validation.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`),
        },
        { status: 400 },
      )
    }

    const {
      clienteId,
      productoId,
      cantidad,
      precioVentaUnidad,
      precioCompraUnidad,
      precioFlete = FLETE_DEFAULT,
      montoPagado = 0,
      observaciones,
      ocRelacionada,
    } = validation.data

    // ═══════════════════════════════════════════════════════════════════════
    // VALIDAR Y OBTENER DATOS DE LA OC (obligatoria para trazabilidad)
    // ═══════════════════════════════════════════════════════════════════════
    if (!ocRelacionada) {
      return NextResponse.json(
        { error: 'La orden de compra es requerida para trazabilidad' },
        { status: 400 },
      )
    }

    const [ordenCompra] = await db
      .select()
      .from(ordenesCompra)
      .where(eq(ordenesCompra.id, ocRelacionada))

    if (!ordenCompra) {
      return NextResponse.json({ error: 'Orden de compra no encontrada' }, { status: 404 })
    }

    // Verificar stock disponible en la OC
    // Si stockActual es 0/null pero cantidad > 0, usar cantidad como stock inicial
    let stockDisponible = ordenCompra.stockActual ?? 0

    // Si el stockActual no está inicializado, usar la cantidad original como stock
    if (stockDisponible === 0 && (ordenCompra.cantidad ?? 0) > 0) {
      // Inicializar el stockActual con la cantidad original
      await db
        .update(ordenesCompra)
        .set({
          stockActual: ordenCompra.cantidad,
          updatedAt: Math.floor(Date.now() / 1000),
        })
        .where(eq(ordenesCompra.id, ocRelacionada))

      stockDisponible = ordenCompra.cantidad ?? 0

      logger.info('Stock inicializado automáticamente', {
        context: 'API/ventas',
        ocId: ocRelacionada,
        stockInicial: stockDisponible,
      })
    }

    if (stockDisponible === 0) {
      return NextResponse.json(
        { error: 'La orden de compra no tiene stock disponible' },
        { status: 400 },
      )
    }
    if (cantidad > stockDisponible) {
      return NextResponse.json(
        { error: `Stock insuficiente. Disponible: ${stockDisponible}, solicitado: ${cantidad}` },
        { status: 400 },
      )
    }

    // Usar precio de compra de la OC si no se proporciona
    const precioCompraReal =
      precioCompraUnidad ?? ordenCompra.costoUnitarioTotal ?? ordenCompra.precioUnitario ?? 0

    // ═══════════════════════════════════════════════════════════════════════
    // CALCULAR DISTRIBUCIÓN GYA USANDO FÓRMULAS CENTRALIZADAS
    // ═══════════════════════════════════════════════════════════════════════

    const resultado = calcularVentaCompleta({
      cantidad,
      precioVenta: precioVentaUnidad,
      precioCompra: precioCompraReal,
      precioFlete,
      montoPagado,
    })

    const ventaId = uuidv4()
    const now = Math.floor(Date.now() / 1000)
    const nowUnix = Math.floor(now.getTime() / 1000) // Unix timestamp en segundos

    // ═══════════════════════════════════════════════════════════════════════
    // TRAZABILIDAD: Construir origenLotes desde la OC
    // ═══════════════════════════════════════════════════════════════════════
    const origenLotesJSON = JSON.stringify([
      {
        ocId: ocRelacionada,
        cantidad,
        costoUnidad: precioCompraReal,
        distribuidorId: ordenCompra.distribuidorId,
        fechaOC: ordenCompra.fecha,
        producto: ordenCompra.producto,
      },
    ])

    // Usar productoId de la OC si no se proporciona explícitamente
    const productoIdFinal = productoId || ordenCompra.productoId || null

    // Crear la venta - todos los campos calculados
    const costoTotal = precioCompraReal * cantidad
    const fleteTotal = precioFlete * cantidad
    const gananciaTotal = resultado.utilidades // ganancia neta

    await db.insert(ventas).values({
      id: ventaId,
      clienteId,
      productoId: productoIdFinal, // Producto vendido (de OC o explícito)
      ocId: ocRelacionada, // OC de origen (trazabilidad)
      fecha: now,
      cantidad,
      precioVentaUnidad,
      precioCompraUnidad: precioCompraReal,
      precioFlete,
      precioFleteUnidad: precioFlete,
      precioTotalVenta: resultado.totalVenta,
      costoTotal,
      fleteTotal,
      montoPagado: resultado.montoPagado,
      montoRestante: resultado.montoRestante,
      porcentajePagado: resultado.proporcionPagada * 100,
      // Distribución GYA (histórico)
      montoBovedaMonte: resultado.bovedaMonte,
      montoFletes: resultado.fletes,
      montoUtilidades: resultado.utilidades,
      // Capital efectivamente distribuido
      capitalBovedaMonte: resultado.distribucionReal.bovedaMonte,
      capitalFletes: resultado.distribucionReal.fletes,
      capitalUtilidades: resultado.distribucionReal.utilidades,
      // Rentabilidad
      gananciaTotal,
      gananciaNetaVenta: gananciaTotal,
      margenBruto: resultado.margenPorcentaje,
      margenNeto: resultado.margenPorcentaje,
      margenSobreCosto: costoTotal > 0 ? (gananciaTotal / costoTotal) * 100 : 0,
      gananciaPorUnidad: resultado.gananciaUnitaria,
      // Crédito
      diasDeCredito: 0,
      diasParaPago: 0,
      esMoroso: false,
      estadoPago: resultado.estadoPago,
      observaciones,
      // TRAZABILIDAD
      origenLotes: origenLotesJSON,
      numeroLotes: 1,
    })

    // ═══════════════════════════════════════════════════════════════════════
    // ACTUALIZAR STOCK EN LA ORDEN DE COMPRA
    // ═══════════════════════════════════════════════════════════════════════
    await db
      .update(ordenesCompra)
      .set({
        stockActual: sql`stock_actual - ${cantidad}`,
        stockVendido: sql`COALESCE(stock_vendido, 0) + ${cantidad}`,
        piezasVendidas: sql`COALESCE(piezas_vendidas, 0) + ${cantidad}`,
        numeroVentas: sql`COALESCE(numero_ventas, 0) + 1`,
        totalVentasGeneradas: sql`COALESCE(total_ventas_generadas, 0) + ${resultado.totalVenta}`,
        updatedAt: now,
      })
      .where(eq(ordenesCompra.id, ocRelacionada))

    // ═══════════════════════════════════════════════════════════════════════
    // ACTUALIZAR BANCOS SI HAY PAGO (distribución proporcional)
    // ═══════════════════════════════════════════════════════════════════════

    if (resultado.estadoPago !== 'pendiente' && montoPagado > 0) {
      const { distribucionReal } = resultado

      // Actualizar Bóveda Monte
      if (distribucionReal.bovedaMonte > 0) {
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual + ${distribucionReal.bovedaMonte}`,
            historicoIngresos: sql`historico_ingresos + ${distribucionReal.bovedaMonte}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, 'boveda_monte'))

        // Registrar movimiento
        await db.insert(movimientos).values({
          id: uuidv4(),
          bancoId: 'boveda_monte',
          tipo: 'ingreso',
          monto: distribucionReal.bovedaMonte,
          fecha: now,
          concepto: `Venta ${ventaId} - Costo producto`,
          referencia: ventaId,
          ventaId,
        })
      }

      // Actualizar Flete Sur
      if (distribucionReal.fletes > 0) {
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual + ${distribucionReal.fletes}`,
            historicoIngresos: sql`historico_ingresos + ${distribucionReal.fletes}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, 'flete_sur'))

        await db.insert(movimientos).values({
          id: uuidv4(),
          bancoId: 'flete_sur',
          tipo: 'ingreso',
          monto: distribucionReal.fletes,
          fecha: now,
          concepto: `Venta ${ventaId} - Flete`,
          referencia: ventaId,
          ventaId,
        })
      }

      // Actualizar Utilidades
      if (distribucionReal.utilidades > 0) {
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual + ${distribucionReal.utilidades}`,
            historicoIngresos: sql`historico_ingresos + ${distribucionReal.utilidades}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, 'utilidades'))

        await db.insert(movimientos).values({
          id: uuidv4(),
          bancoId: 'utilidades',
          tipo: 'ingreso',
          monto: distribucionReal.utilidades,
          fecha: now,
          concepto: `Venta ${ventaId} - Ganancia`,
          referencia: ventaId,
          ventaId,
        })
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ACTUALIZAR SALDO PENDIENTE DEL CLIENTE SI HAY DEUDA
    // ═══════════════════════════════════════════════════════════════════════

    if (resultado.montoRestante > 0) {
      await db
        .update(clientes)
        .set({
          saldoPendiente: sql`saldo_pendiente + ${resultado.montoRestante}`,
          updatedAt: now,
        })
        .where(eq(clientes.id, clienteId))
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ACTUALIZAR STOCK EN LA ORDEN DE COMPRA Y ALMACÉN SIMULTÁNEAMENTE
    // ═══════════════════════════════════════════════════════════════════════
    await db
      .update(ordenesCompra)
      .set({
        stockActual: sql`stock_actual - ${cantidad}`,
        stockVendido: sql`COALESCE(stock_vendido, 0) + ${cantidad}`,
        piezasVendidas: sql`COALESCE(piezas_vendidas, 0) + ${cantidad}`,
        numeroVentas: sql`COALESCE(numero_ventas, 0) + 1`,
        totalVentasGeneradas: sql`COALESCE(total_ventas_generadas, 0) + ${resultado.totalVenta}`,
        updatedAt: now,
      })
      .where(eq(ordenesCompra.id, ocRelacionada))

    logger.info('Stock de OC actualizado', {
      context: 'API/ventas',
      data: {
        ocId: ocRelacionada,
        vendido: cantidad,
      },
    })

    // ═══════════════════════════════════════════════════════════════════════
    // REGISTRAR SALIDA DE ALMACÉN Y ACTUALIZAR STOCK DE PRODUCTO
    // ═══════════════════════════════════════════════════════════════════════

    // Si hay productoIdFinal, decrementar stock del producto en almacén
    if (productoIdFinal) {
      const [producto] = await db.select().from(almacen).where(eq(almacen.id, productoIdFinal))

      if (producto) {
        const stockActual = producto.cantidad ?? 0

        if (stockActual >= cantidad) {
          await db
            .update(almacen)
            .set({
              cantidad: sql`cantidad - ${cantidad}`,
              totalSalidas: sql`COALESCE(total_salidas, 0) + ${cantidad}`,
              updatedAt: now,
            })
            .where(eq(almacen.id, productoIdFinal))

          logger.info('Stock de producto en almacén actualizado', {
            context: 'API/ventas',
            data: {
              productoId: productoIdFinal,
              stockAnterior: stockActual,
              stockNuevo: stockActual - cantidad,
            },
          })
        } else {
          logger.warn('Stock insuficiente en almacén para el producto', {
            context: 'API/ventas',
            data: {
              productoId: productoIdFinal,
              stockActual,
              cantidadSolicitada: cantidad,
            },
          })
        }
      }
    }

    // SIEMPRE registrar salida en historial (con o sin productoId)
    // Esto asegura trazabilidad completa de todas las ventas
    await db.insert(salidaAlmacen).values({
      id: uuidv4(),
      ventaId,
      productoId: productoIdFinal || null, // Puede ser null si no hay producto en almacén
      cantidad,
      origenLotes: origenLotesJSON, // Trazabilidad de lotes
      fecha: now,
      observaciones: `Venta ${ventaId} - ${cantidad} unidades vendidas desde OC ${ocRelacionada}`,
    })

    logger.info('Salida de almacén registrada en historial', {
      context: 'API/ventas',
      data: {
        ventaId,
        productoId: productoIdFinal || 'SIN_PRODUCTO_ALMACEN',
        ocId: ocRelacionada,
        cantidad,
      },
    })

    // ═══════════════════════════════════════════════════════════════════════
    // TRIGGER: Actualizar métricas derivadas (async, no bloquea respuesta)
    // ═══════════════════════════════════════════════════════════════════════
    triggerPostVenta({ ventaId, clienteId, ocRelacionada }).catch((err) => {
      logger.error('Error en trigger post-venta', err as Error, { context: 'API' })
    })

    // Invalidar caches relacionados
    await Promise.all([
      invalidateCache(CACHE_KEYS.VENTAS_ALL),
      invalidateCache(CACHE_KEYS.BANCOS_ALL),
      invalidateCache(CACHE_KEYS.DASHBOARD_METRICS),
    ])

    return NextResponse.json({
      success: true,
      ventaId,
      distribucion: {
        bovedaMonte: resultado.distribucionReal.bovedaMonte,
        fletes: resultado.distribucionReal.fletes,
        utilidades: resultado.distribucionReal.utilidades,
      },
      estadoPago: resultado.estadoPago,
      totalVenta: resultado.totalVenta,
    })
  } catch (error) {
    logger.error('Error creando venta:', error as Error, {
      context: 'API',
      datos: {
        mensaje: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
      },
    })
    return NextResponse.json(
      {
        error: 'Error interno al crear venta',
        detalle: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 500 },
    )
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PUT - Actualizar venta (principalmente para registrar pagos/abonos)
// ═══════════════════════════════════════════════════════════════════════════

export async function PUT(request: NextRequest) {
  // Rate limiting para escritura
  const rateLimitResult = await applyRateLimit(request, 'write')
  if (rateLimitResult) return rateLimitResult

  try {
    const body = await request.json()
    const {
      id,
      montoPagado: nuevoMontoPagado,
      // Campos para corregir distribución GYA si están nulos
      montoBovedaMonte: newMontoBovedaMonte,
      montoFletes: newMontoFletes,
      montoUtilidades: newMontoUtilidades,
      precioCompraUnidad: newPrecioCompra,
      precioFlete: newPrecioFlete,
    } = body

    if (!id) {
      return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 })
    }

    // Obtener venta actual
    const [ventaActual] = await db.select().from(ventas).where(eq(ventas.id, id))

    if (!ventaActual) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    const now = Math.floor(Date.now() / 1000)

    // ═══════════════════════════════════════════════════════════════════════
    // ACTUALIZAR DISTRIBUCIÓN GYA SI SE PROPORCIONAN VALORES (para correcciones)
    // ═══════════════════════════════════════════════════════════════════════
    if (
      newMontoBovedaMonte !== undefined ||
      newMontoFletes !== undefined ||
      newMontoUtilidades !== undefined
    ) {
      // Actualizar campos de distribución GYA
      await db
        .update(ventas)
        .set({
          montoBovedaMonte: newMontoBovedaMonte ?? ventaActual.montoBovedaMonte,
          montoFletes: newMontoFletes ?? ventaActual.montoFletes,
          montoUtilidades: newMontoUtilidades ?? ventaActual.montoUtilidades,
          precioCompraUnidad: newPrecioCompra ?? ventaActual.precioCompraUnidad,
          precioFlete: newPrecioFlete ?? ventaActual.precioFlete,
          costoTotal: newPrecioCompra
            ? newPrecioCompra * ventaActual.cantidad
            : ventaActual.costoTotal,
          fleteTotal: newPrecioFlete
            ? newPrecioFlete * ventaActual.cantidad
            : ventaActual.fleteTotal,
          gananciaTotal: newMontoUtilidades ?? ventaActual.gananciaTotal,
          updatedAt: now,
        })
        .where(eq(ventas.id, id))

      logger.info('Distribución GYA corregida', {
        context: 'API',
        ventaId: id,
        bovedaMonte: newMontoBovedaMonte,
        fletes: newMontoFletes,
        utilidades: newMontoUtilidades,
      })

      // Si no hay más actualizaciones, retornar
      if (nuevoMontoPagado === undefined) {
        return NextResponse.json({ success: true, message: 'Distribución GYA actualizada' })
      }

      // Recargar venta con valores actualizados
      const [ventaRecargada] = await db.select().from(ventas).where(eq(ventas.id, id))
      Object.assign(ventaActual, ventaRecargada)
    }

    // Si es un abono adicional
    if (nuevoMontoPagado !== undefined) {
      const diferenciaPago = nuevoMontoPagado - (ventaActual.montoPagado || 0)

      if (diferenciaPago > 0) {
        // Recalcular distribución para el abono
        const proporcionAbono = diferenciaPago / (ventaActual.precioTotalVenta || 1)

        const abonoBovedaMonte = (ventaActual.montoBovedaMonte || 0) * proporcionAbono
        const abonoFletes = (ventaActual.montoFletes || 0) * proporcionAbono
        const abonoUtilidades = (ventaActual.montoUtilidades || 0) * proporcionAbono

        const abonoId = uuidv4()

        // Actualizar bancos con el abono Y CREAR MOVIMIENTOS
        if (abonoBovedaMonte > 0) {
          await db
            .update(bancos)
            .set({
              capitalActual: sql`capital_actual + ${abonoBovedaMonte}`,
              historicoIngresos: sql`historico_ingresos + ${abonoBovedaMonte}`,
              updatedAt: now,
            })
            .where(eq(bancos.id, 'boveda_monte'))

          // Crear movimiento de trazabilidad
          await db.insert(movimientos).values({
            id: uuidv4(),
            bancoId: 'boveda_monte',
            tipo: 'ingreso',
            monto: abonoBovedaMonte,
            fecha: now,
            concepto: 'Abono venta - Costo producto',
            referencia: abonoId,
            categoria: 'Abonos',
            ventaId: id,
            clienteId: ventaActual.clienteId,
          })
        }

        if (abonoFletes > 0) {
          await db
            .update(bancos)
            .set({
              capitalActual: sql`capital_actual + ${abonoFletes}`,
              historicoIngresos: sql`historico_ingresos + ${abonoFletes}`,
              updatedAt: now,
            })
            .where(eq(bancos.id, 'flete_sur'))

          // Crear movimiento de trazabilidad
          await db.insert(movimientos).values({
            id: uuidv4(),
            bancoId: 'flete_sur',
            tipo: 'ingreso',
            monto: abonoFletes,
            fecha: now,
            concepto: 'Abono venta - Flete',
            referencia: abonoId,
            categoria: 'Abonos',
            ventaId: id,
            clienteId: ventaActual.clienteId,
          })
        }

        if (abonoUtilidades > 0) {
          await db
            .update(bancos)
            .set({
              capitalActual: sql`capital_actual + ${abonoUtilidades}`,
              historicoIngresos: sql`historico_ingresos + ${abonoUtilidades}`,
              updatedAt: now,
            })
            .where(eq(bancos.id, 'utilidades'))

          // Crear movimiento de trazabilidad
          await db.insert(movimientos).values({
            id: uuidv4(),
            bancoId: 'utilidades',
            tipo: 'ingreso',
            monto: abonoUtilidades,
            fecha: now,
            concepto: 'Abono venta - Ganancia',
            referencia: abonoId,
            categoria: 'Abonos',
            ventaId: id,
            clienteId: ventaActual.clienteId,
          })
        }

        logger.info('Abono registrado con distribución GYA', {
          context: 'API/ventas',
          ventaId: id,
          monto: diferenciaPago,
          distribucion: {
            bovedaMonte: abonoBovedaMonte,
            fletes: abonoFletes,
            utilidades: abonoUtilidades,
          },
        })

        // Actualizar deuda del cliente
        await db
          .update(clientes)
          .set({
            saldoPendiente: sql`saldo_pendiente - ${diferenciaPago}`,
            updatedAt: now,
          })
          .where(eq(clientes.id, ventaActual.clienteId))
      }

      // Determinar nuevo estado
      const nuevoMontoRestante = (ventaActual.precioTotalVenta || 0) - nuevoMontoPagado
      let nuevoEstado: 'completo' | 'parcial' | 'pendiente' = 'pendiente'

      if (nuevoMontoRestante <= 0) {
        nuevoEstado = 'completo'
      } else if (nuevoMontoPagado > 0) {
        nuevoEstado = 'parcial'
      }

      // Actualizar venta
      await db
        .update(ventas)
        .set({
          montoPagado: nuevoMontoPagado,
          montoRestante: Math.max(0, nuevoMontoRestante),
          estadoPago: nuevoEstado,
          updatedAt: now,
        })
        .where(eq(ventas.id, id))

      // TRIGGER: Actualizar métricas del cliente (async)
      triggerPostAbono({ ventaId: id, clienteId: ventaActual.clienteId }).catch((err) => {
        logger.error('Error en trigger post-abono', err as Error, { context: 'API' })
      })
    }

    // Invalidar caches relacionados
    await Promise.all([
      invalidateCache(CACHE_KEYS.VENTAS_ALL),
      invalidateCache(CACHE_KEYS.BANCOS_ALL),
      invalidateCache(CACHE_KEYS.DASHBOARD_METRICS),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error actualizando venta:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DELETE - Eliminar venta CON REVERSIÓN COMPLETA DE TRAZABILIDAD
// Revierte: bancos, cliente, stock de OC, producto en almacén, salida de almacén
// ═══════════════════════════════════════════════════════════════════════════

export async function DELETE(request: NextRequest) {
  // Rate limiting para escritura
  const rateLimitResult = await applyRateLimit(request, 'write')
  if (rateLimitResult) return rateLimitResult

  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID de venta requerido' }, { status: 400 })
    }

    // Obtener venta actual con todos los datos necesarios
    const [ventaActual] = await db.select().from(ventas).where(eq(ventas.id, id))

    if (!ventaActual) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 })
    }

    const now = Math.floor(Date.now() / 1000)
    const cantidad = ventaActual.cantidad || 0

    logger.info('🗑️ Iniciando eliminación completa de venta con reversión', {
      context: 'API/ventas/DELETE',
      data: {
        ventaId: id,
        ocId: ventaActual.ocId,
        productoId: ventaActual.productoId,
        cantidad,
        montoPagado: ventaActual.montoPagado,
      },
    })

    // ═══════════════════════════════════════════════════════════════════════
    // 1. REVERTIR DISTRIBUCIÓN DE BANCOS (si hubo pagos)
    // ═══════════════════════════════════════════════════════════════════════
    const montoPagado = ventaActual.montoPagado || 0

    if (montoPagado > 0) {
      const montoBovedaMonte = ventaActual.montoBovedaMonte || 0
      const montoFletes = ventaActual.montoFletes || 0
      const montoUtilidades = ventaActual.montoUtilidades || 0
      const proporcionPagada = montoPagado / (ventaActual.precioTotalVenta || 1)

      // Restar de cada banco
      if (montoBovedaMonte > 0) {
        const restar = montoBovedaMonte * proporcionPagada
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual - ${restar}`,
            historicoIngresos: sql`historico_ingresos - ${restar}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, 'boveda_monte'))
      }

      if (montoFletes > 0) {
        const restar = montoFletes * proporcionPagada
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual - ${restar}`,
            historicoIngresos: sql`historico_ingresos - ${restar}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, 'flete_sur'))
      }

      if (montoUtilidades > 0) {
        const restar = montoUtilidades * proporcionPagada
        await db
          .update(bancos)
          .set({
            capitalActual: sql`capital_actual - ${restar}`,
            historicoIngresos: sql`historico_ingresos - ${restar}`,
            updatedAt: now,
          })
          .where(eq(bancos.id, 'utilidades'))
      }

      logger.info('Distribución de bancos revertida', {
        context: 'API/ventas/DELETE',
        montoPagado,
        proporcionPagada,
      })
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 2. REVERTIR SALDO DEL CLIENTE
    // ═══════════════════════════════════════════════════════════════════════
    if (ventaActual.clienteId) {
      const montoRestante = ventaActual.montoRestante || 0
      const totalVenta = ventaActual.precioTotalVenta || 0

      await db
        .update(clientes)
        .set({
          saldoPendiente: sql`COALESCE(saldo_pendiente, 0) - ${montoRestante}`,
          totalCompras: sql`COALESCE(total_compras, 0) - ${totalVenta}`,
          totalPagado: sql`COALESCE(total_pagado, 0) - ${montoPagado}`,
          numeroVentas: sql`COALESCE(numero_ventas, 0) - 1`,
          updatedAt: now,
        })
        .where(eq(clientes.id, ventaActual.clienteId))

      logger.info('Saldo de cliente revertido', {
        context: 'API/ventas/DELETE',
        clienteId: ventaActual.clienteId,
      })
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 3. REVERTIR STOCK EN LA ORDEN DE COMPRA (incrementar stockActual)
    // ═══════════════════════════════════════════════════════════════════════
    if (ventaActual.ocId && cantidad > 0) {
      await db
        .update(ordenesCompra)
        .set({
          stockActual: sql`COALESCE(stock_actual, 0) + ${cantidad}`,
          stockVendido: sql`COALESCE(stock_vendido, 0) - ${cantidad}`,
          piezasVendidas: sql`COALESCE(piezas_vendidas, 0) - ${cantidad}`,
          numeroVentas: sql`COALESCE(numero_ventas, 0) - 1`,
          totalVentasGeneradas: sql`COALESCE(total_ventas_generadas, 0) - ${ventaActual.precioTotalVenta || 0}`,
          updatedAt: now,
        })
        .where(eq(ordenesCompra.id, ventaActual.ocId))

      logger.info('Stock de OC restaurado', {
        context: 'API/ventas/DELETE',
        ocId: ventaActual.ocId,
        cantidadRestaurada: cantidad,
      })
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 4. REVERTIR STOCK EN ALMACÉN (incrementar cantidad del producto)
    // ═══════════════════════════════════════════════════════════════════════
    if (ventaActual.productoId && cantidad > 0) {
      await db
        .update(almacen)
        .set({
          cantidad: sql`COALESCE(cantidad, 0) + ${cantidad}`,
          stockActual: sql`COALESCE(stock_actual, 0) + ${cantidad}`,
          totalSalidas: sql`COALESCE(total_salidas, 0) - ${cantidad}`,
          unidadesVendidas: sql`COALESCE(unidades_vendidas, 0) - ${cantidad}`,
          numeroVentas: sql`COALESCE(numero_ventas, 0) - 1`,
          ventasTotales: sql`COALESCE(ventas_totales, 0) - ${ventaActual.precioTotalVenta || 0}`,
          gananciaTotal: sql`COALESCE(ganancia_total, 0) - ${ventaActual.montoUtilidades || 0}`,
          updatedAt: now,
        })
        .where(eq(almacen.id, ventaActual.productoId))

      logger.info('Stock de almacén restaurado', {
        context: 'API/ventas/DELETE',
        productoId: ventaActual.productoId,
        cantidadRestaurada: cantidad,
      })
    }

    // ═══════════════════════════════════════════════════════════════════════
    // 5. ELIMINAR SALIDA DE ALMACÉN (historial)
    // ═══════════════════════════════════════════════════════════════════════
    await db.delete(salidaAlmacen).where(eq(salidaAlmacen.ventaId, id))

    logger.info('Salida de almacén eliminada', {
      context: 'API/ventas/DELETE',
      ventaId: id,
    })

    // ═══════════════════════════════════════════════════════════════════════
    // 6. ELIMINAR MOVIMIENTOS ASOCIADOS
    // ═══════════════════════════════════════════════════════════════════════
    await db.delete(movimientos).where(eq(movimientos.ventaId, id))

    // ═══════════════════════════════════════════════════════════════════════
    // 7. ELIMINAR LA VENTA
    // ═══════════════════════════════════════════════════════════════════════
    await db.delete(ventas).where(eq(ventas.id, id))

    // Invalidar caches relacionados
    await Promise.all([
      invalidateCache(CACHE_KEYS.VENTAS_ALL),
      invalidateCache(CACHE_KEYS.BANCOS_ALL),
      invalidateCache(CACHE_KEYS.DASHBOARD_METRICS),
      invalidateCache(CACHE_KEYS.ORDENES_ALL),
    ])

    logger.info('✅ Venta eliminada completamente con toda su trazabilidad', {
      context: 'API/ventas/DELETE',
      ventaId: id,
    })

    return NextResponse.json({
      success: true,
      message: 'Venta eliminada y toda su trazabilidad revertida',
      detalles: {
        bancosRevertidos: montoPagado > 0,
        clienteActualizado: !!ventaActual.clienteId,
        stockOCRestaurado: !!ventaActual.ocId,
        stockAlmacenRestaurado: !!ventaActual.productoId,
        cantidadRestaurada: cantidad,
      },
    })
  } catch (error) {
    logger.error('Error eliminando venta:', error as Error, { context: 'API' })
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
