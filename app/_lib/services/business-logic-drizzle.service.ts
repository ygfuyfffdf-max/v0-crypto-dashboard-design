// @ts-nocheck
// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — LÓGICA DE NEGOCIO CENTRAL (Drizzle/Turso)
// ═══════════════════════════════════════════════════════════════════════════════
//
// Servicio centralizado de lógica de negocio usando Drizzle ORM + Turso.
// Reemplaza el legacy business-logic.service.ts que usaba Firebase.
//
// RESPONSABILIDADES:
// 1. Cálculos de distribución GYA (usa funciones puras de gya-calculo.ts)
// 2. Operaciones transaccionales de ventas, abonos, pagos
// 3. Gestión de devoluciones con reversión GYA
// 4. Transferencias entre bancos
// 5. Registro de audit log
// 6. Verificación y creación de alertas
//
// ═══════════════════════════════════════════════════════════════════════════════

import {
    calcularDistribucionGYA,
    calcularDistribucionProporcional,
    FLETE_DEFAULT,
    type DistribucionGYA,
} from '@/app/_lib/gya-formulas'
import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import {
    abonos,
    alertas,
    alertasConfig,
    auditLog,
    bancos,
    clientes,
    devoluciones,
    distribuidores,
    movimientos,
    ordenesCompra,
    pagosDistribuidor,
    ventas,
    type InsertAlerta,
    type InsertAuditLogEntry,
    type InsertDevolucion,
    type InsertMovimiento,
} from '@/database/schema'
import { and, eq, gt, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

export const PRECIO_FLETE_DEFAULT = FLETE_DEFAULT
export const BANCOS_VENTAS = ['boveda_monte', 'flete_sur', 'utilidades'] as const
export const BANCOS_IDS = [
  'boveda_monte',
  'boveda_usa',
  'profit',
  'leftie',
  'azteca',
  'flete_sur',
  'utilidades',
] as const

export type BancoId = (typeof BANCOS_IDS)[number]

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/** Calcula el capital proporcional basado en el monto pagado */
function calcularCapitalProporcional(
  montoBase: number,
  montoPagado: number,
  total: number,
): number {
  if (montoPagado <= 0 || total <= 0) return 0
  return montoBase * (montoPagado / total)
}

// ═══════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════

export interface NuevaVentaInput {
  clienteId: string
  cantidad: number
  precioVentaUnidad: number
  precioCompraUnidad: number
  precioFlete?: number
  ocRelacionada?: string
  metodoPago?: 'efectivo' | 'transferencia' | 'crypto' | 'cheque' | 'credito'
  montoPagadoInicial?: number
  observaciones?: string
  userId?: string
}

export interface AbonoInput {
  ventaId: string
  clienteId: string
  monto: number
  metodoPago?: 'efectivo' | 'transferencia' | 'cheque'
  referencia?: string
  observaciones?: string
  userId?: string
}

export interface PagoDistribuidorInput {
  ordenCompraId: string
  distribuidorId: string
  monto: number
  bancoOrigenId: BancoId
  referencia?: string
  observaciones?: string
  userId?: string
}

export interface TransferenciaInput {
  bancoOrigenId: BancoId
  bancoDestinoId: BancoId
  monto: number
  concepto?: string
  userId?: string
}

export interface DevolucionInput {
  ventaId: string
  cantidadDevuelta: number
  motivo:
    | 'defectuoso'
    | 'error_cantidad'
    | 'error_precio'
    | 'cliente_cambio_opinion'
    | 'producto_incorrecto'
    | 'duplicado'
    | 'otro'
  devolverStock?: boolean
  ocDestinoId?: string
  observaciones?: string
  userId?: string
}

export interface AuditContext {
  userId?: string
  userEmail?: string
  userRole?: string
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  origen?: 'web' | 'api' | 'cron' | 'sistema' | 'importacion'
}

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE AUDIT LOG
// ═══════════════════════════════════════════════════════════════

export async function registrarAuditLog(
  accion: InsertAuditLogEntry['accion'],
  entidadTipo: InsertAuditLogEntry['entidadTipo'],
  entidadId: string | null,
  context: AuditContext,
  detalles: {
    entidadNombre?: string
    valorAnterior?: Record<string, unknown>
    valorNuevo?: Record<string, unknown>
    camposModificados?: string[]
    descripcion?: string
    montoInvolucrado?: number
    bancosAfectados?: string[]
    exito?: boolean
    errorMensaje?: string
  } = {},
): Promise<void> {
  try {
    const entry: InsertAuditLogEntry = {
      id: `audit_${nanoid(12)}`,
      userId: context.userId || null,
      userEmail: context.userEmail || null,
      userRole: context.userRole || null,
      ipAddress: context.ipAddress || null,
      userAgent: context.userAgent || null,
      sessionId: context.sessionId || null,
      accion,
      entidadTipo,
      entidadId,
      entidadNombre: detalles.entidadNombre || null,
      valorAnterior: detalles.valorAnterior ? JSON.stringify(detalles.valorAnterior) : null,
      valorNuevo: detalles.valorNuevo ? JSON.stringify(detalles.valorNuevo) : null,
      camposModificados: detalles.camposModificados
        ? JSON.stringify(detalles.camposModificados)
        : null,
      descripcion: detalles.descripcion || null,
      modulo: entidadTipo,
      origen: context.origen || 'web',
      montoInvolucrado: detalles.montoInvolucrado || null,
      bancosAfectados: detalles.bancosAfectados ? JSON.stringify(detalles.bancosAfectados) : null,
      exito: detalles.exito ?? true,
      errorMensaje: detalles.errorMensaje || null,
      timestamp: new Date(),
    }

    await db.insert(auditLog).values(entry)
  } catch (error) {
    // El audit log nunca debe fallar silenciosamente en producción
    logger.error('Error registrando audit log', error as Error, {
      context: 'BusinessLogicService',
      data: { accion, entidadTipo, entidadId },
    })
  }
}

// ═══════════════════════════════════════════════════════════════
// SERVICIO DE ALERTAS
// ═══════════════════════════════════════════════════════════════

export async function crearAlerta(
  alerta: Omit<InsertAlerta, 'id' | 'fechaCreacion' | 'createdAt'>,
): Promise<string> {
  const alertaId = `alerta_${nanoid(12)}`

  await db.insert(alertas).values({
    id: alertaId,
    ...alerta,
    fechaCreacion: new Date(),
    createdAt: new Date(),
  })

  logger.info('Alerta creada', {
    context: 'AlertasService',
    data: { alertaId, tipo: alerta.tipo, severidad: alerta.severidad },
  })

  return alertaId
}

export async function verificarAlertasStock(): Promise<void> {
  // Obtener configuración de alertas de stock
  const configs = await db
    .select()
    .from(alertasConfig)
    .where(
      and(
        eq(alertasConfig.activo, 1),
        sql`${alertasConfig.tipo} IN ('stock_bajo', 'stock_critico')`,
      ),
    )

  if (configs.length === 0) return

  // Verificar órdenes de compra con stock bajo
  const ordenes = await db
    .select({
      id: ordenesCompra.id,
      distribuidorId: ordenesCompra.distribuidorId,
      cantidad: ordenesCompra.cantidad,
      stockActual: ordenesCompra.stockActual,
      producto: ordenesCompra.producto,
    })
    .from(ordenesCompra)
    .where(eq(ordenesCompra.estado, 'pendiente'))

  for (const oc of ordenes) {
    const porcentajeStock = (oc.stockActual / oc.cantidad) * 100

    for (const config of configs) {
      if (porcentajeStock <= config.umbral) {
        // Verificar si ya existe alerta activa para esta OC
        const alertaExistente = await db
          .select()
          .from(alertas)
          .where(
            and(
              eq(alertas.entidadTipo, 'orden_compra'),
              eq(alertas.entidadId, oc.id),
              eq(alertas.estado, 'activa'),
            ),
          )
          .limit(1)

        if (alertaExistente.length === 0) {
          await crearAlerta({
            tipo: config.tipo as 'stock_bajo' | 'stock_critico',
            severidad: config.severidad,
            estado: 'activa',
            titulo: `Stock ${config.tipo === 'stock_critico' ? 'crítico' : 'bajo'} en OC`,
            descripcion: `La orden ${oc.id} tiene ${oc.stockActual}/${oc.cantidad} unidades (${porcentajeStock.toFixed(1)}%)`,
            entidadTipo: 'orden_compra',
            entidadId: oc.id,
            entidadNombre: oc.producto || oc.id,
            valorActual: porcentajeStock,
            valorUmbral: config.umbral,
            unidad: '%',
            accionSugerida: 'Crear nueva orden de compra',
          })
        }
      }
    }
  }
}

export async function verificarAlertasClientes(): Promise<void> {
  // Verificar clientes morosos (deuda > 30 días)
  const clientesMorosos = await db
    .select({
      id: clientes.id,
      nombre: clientes.nombre,
      saldoPendiente: clientes.saldoPendiente,
      diasSinComprar: clientes.diasSinComprar,
    })
    .from(clientes)
    .where(and(gt(clientes.saldoPendiente, 0), gt(clientes.diasSinComprar, 30)))

  for (const cliente of clientesMorosos) {
    const alertaExistente = await db
      .select()
      .from(alertas)
      .where(
        and(
          eq(alertas.entidadTipo, 'cliente'),
          eq(alertas.entidadId, cliente.id),
          eq(alertas.tipo, 'cliente_moroso'),
          eq(alertas.estado, 'activa'),
        ),
      )
      .limit(1)

    if (alertaExistente.length === 0) {
      const diasSinComprar = Number(cliente.diasSinComprar ?? 0)
      const severidadAlerta: 'critica' | 'advertencia' =
        diasSinComprar > 60 ? 'critica' : 'advertencia'
      await crearAlerta({
        tipo: 'cliente_moroso',
        severidad: severidadAlerta,
        estado: 'activa',
        titulo: `Cliente moroso: ${cliente.nombre}`,
        descripcion: `Deuda de $${cliente.saldoPendiente?.toLocaleString()} sin actividad`,
        entidadTipo: 'cliente',
        entidadId: cliente.id,
        entidadNombre: cliente.nombre,
        valorActual: cliente.saldoPendiente || 0,
        valorUmbral: 0,
        unidad: '$',
        accionSugerida: 'Contactar al cliente para gestionar cobranza',
      })
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// CREAR VENTA CON DISTRIBUCIÓN GYA
// ═══════════════════════════════════════════════════════════════

export async function crearVentaConDistribucion(
  input: NuevaVentaInput,
  auditContext: AuditContext = {},
): Promise<{ success: boolean; ventaId?: string; error?: string; distribucion?: DistribucionGYA }> {
  try {
    // 1. Validar cliente existe
    const clienteResult = await db
      .select({ id: clientes.id, nombre: clientes.nombre })
      .from(clientes)
      .where(eq(clientes.id, input.clienteId))
      .limit(1)

    const cliente = clienteResult[0]
    if (!cliente) {
      return { success: false, error: 'Cliente no encontrado' }
    }

    // 2. Calcular distribución GYA
    const precioFlete = input.precioFlete ?? PRECIO_FLETE_DEFAULT
    const distribucion = calcularDistribucionGYA(
      input.precioVentaUnidad,
      input.precioCompraUnidad,
      precioFlete,
      input.cantidad,
    )

    // 3. Validar margen positivo
    if (distribucion.montoUtilidades < 0) {
      return {
        success: false,
        error: `Venta con margen negativo: ${distribucion.margenNeto}%. El precio de venta debe ser mayor al costo + flete.`,
      }
    }

    const ventaId = `venta_${nanoid(12)}`
    const ahora = new Date()
    const montoPagadoInicial = input.montoPagadoInicial ?? 0
    const montoRestante = distribucion.precioTotalVenta - montoPagadoInicial
    const estadoPago =
      montoPagadoInicial >= distribucion.precioTotalVenta
        ? 'completo'
        : montoPagadoInicial > 0
          ? 'parcial'
          : 'pendiente'

    // 4. Transacción atómica
    await db.transaction(async (tx) => {
      // 4a. Crear venta
      await tx.insert(ventas).values({
        id: ventaId,
        clienteId: input.clienteId,
        ocId: input.ocRelacionada || null,
        fecha: ahora,
        estado: 'activa',
        cantidad: input.cantidad,
        precioVentaUnidad: input.precioVentaUnidad,
        precioCompraUnidad: input.precioCompraUnidad,
        precioFlete: precioFlete,
        precioTotalVenta: distribucion.precioTotalVenta,
        costoTotal: distribucion.montoBovedaMonte,
        fleteTotal: distribucion.montoFletes,
        montoPagado: montoPagadoInicial,
        montoRestante,
        porcentajePagado: (montoPagadoInicial / distribucion.precioTotalVenta) * 100,
        estadoPago,
        montoBovedaMonte: distribucion.montoBovedaMonte,
        montoFletes: distribucion.montoFletes,
        montoUtilidades: distribucion.montoUtilidades,
        capitalBovedaMonte: calcularCapitalProporcional(
          distribucion.montoBovedaMonte,
          montoPagadoInicial,
          distribucion.precioTotalVenta,
        ),
        capitalFletes: calcularCapitalProporcional(
          distribucion.montoFletes,
          montoPagadoInicial,
          distribucion.precioTotalVenta,
        ),
        capitalUtilidades: calcularCapitalProporcional(
          distribucion.montoUtilidades,
          montoPagadoInicial,
          distribucion.precioTotalVenta,
        ),
        gananciaTotal: distribucion.montoUtilidades,
        margenBruto: distribucion.margenNeto,
        metodoPago: input.metodoPago || null,
        observaciones: input.observaciones || null,
        createdBy: input.userId || null,
      })

      // 4b. Crear movimientos de distribución (siempre en histórico)
      const movimientosData: InsertMovimiento[] = [
        {
          id: `mov_${nanoid(12)}`,
          bancoId: 'boveda_monte',
          tipo: 'distribucion_gya',
          monto: distribucion.montoBovedaMonte,
          fecha: ahora,
          concepto: `GYA Costo - Venta #${ventaId.slice(-8)}`,
          referencia: ventaId,
          categoria: 'Ventas',
          ventaId,
          clienteId: input.clienteId,
        },
        {
          id: `mov_${nanoid(12)}`,
          bancoId: 'flete_sur',
          tipo: 'distribucion_gya',
          monto: distribucion.montoFletes,
          fecha: ahora,
          concepto: `GYA Flete - Venta #${ventaId.slice(-8)}`,
          referencia: ventaId,
          categoria: 'Ventas',
          ventaId,
          clienteId: input.clienteId,
        },
        {
          id: `mov_${nanoid(12)}`,
          bancoId: 'utilidades',
          tipo: 'distribucion_gya',
          monto: distribucion.montoUtilidades,
          fecha: ahora,
          concepto: `GYA Utilidad - Venta #${ventaId.slice(-8)} (${distribucion.margenNeto}%)`,
          referencia: ventaId,
          categoria: 'Ventas',
          ventaId,
          clienteId: input.clienteId,
        },
      ]

      for (const mov of movimientosData) {
        await tx.insert(movimientos).values(mov)
      }

      // 4c. Actualizar bancos (histórico siempre, capital solo si hay pago)
      // Siempre registrar en historicoIngresos
      await tx
        .update(bancos)
        .set({
          historicoIngresos: sql`${bancos.historicoIngresos} + ${distribucion.montoBovedaMonte}`,
          capitalActual:
            montoPagadoInicial > 0
              ? sql`${bancos.capitalActual} + ${distribucion.montoBovedaMonte * (montoPagadoInicial / distribucion.precioTotalVenta)}`
              : bancos.capitalActual,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'boveda_monte'))

      await tx
        .update(bancos)
        .set({
          historicoIngresos: sql`${bancos.historicoIngresos} + ${distribucion.montoFletes}`,
          capitalActual:
            montoPagadoInicial > 0
              ? sql`${bancos.capitalActual} + ${distribucion.montoFletes * (montoPagadoInicial / distribucion.precioTotalVenta)}`
              : bancos.capitalActual,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'flete_sur'))

      await tx
        .update(bancos)
        .set({
          historicoIngresos: sql`${bancos.historicoIngresos} + ${distribucion.montoUtilidades}`,
          capitalActual:
            montoPagadoInicial > 0
              ? sql`${bancos.capitalActual} + ${distribucion.montoUtilidades * (montoPagadoInicial / distribucion.precioTotalVenta)}`
              : bancos.capitalActual,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'utilidades'))

      // 4d. Actualizar saldo cliente
      await tx
        .update(clientes)
        .set({
          saldoPendiente: sql`${clientes.saldoPendiente} + ${montoRestante}`,
          totalCompras: sql`${clientes.totalCompras} + ${distribucion.precioTotalVenta}`,
          numeroVentas: sql`${clientes.numeroVentas} + 1`,
          ultimaCompra: ahora,
          diasSinComprar: 0,
          updatedAt: ahora,
        })
        .where(eq(clientes.id, input.clienteId))

      // 4e. Actualizar stock de OC si aplica
      if (input.ocRelacionada) {
        await tx
          .update(ordenesCompra)
          .set({
            stockActual: sql`${ordenesCompra.stockActual} - ${input.cantidad}`,
            stockVendido: sql`${ordenesCompra.stockVendido} + ${input.cantidad}`,
            piezasVendidas: sql`${ordenesCompra.piezasVendidas} + ${input.cantidad}`,
            totalVentasGeneradas: sql`${ordenesCompra.totalVentasGeneradas} + ${distribucion.precioTotalVenta}`,
            numeroVentas: sql`${ordenesCompra.numeroVentas} + 1`,
            updatedAt: ahora,
          })
          .where(eq(ordenesCompra.id, input.ocRelacionada))
      }
    })

    // 5. Registrar audit log
    await registrarAuditLog('crear', 'venta', ventaId, auditContext, {
      entidadNombre: `Venta a ${cliente.nombre}`,
      valorNuevo: {
        clienteId: input.clienteId,
        cantidad: input.cantidad,
        total: distribucion.precioTotalVenta,
        distribucion,
      },
      descripcion: `Nueva venta de ${input.cantidad} uds por $${distribucion.precioTotalVenta.toLocaleString()}`,
      montoInvolucrado: distribucion.precioTotalVenta,
      bancosAfectados: ['boveda_monte', 'flete_sur', 'utilidades'],
    })

    logger.info('Venta creada con distribución GYA', {
      context: 'BusinessLogicService',
      data: { ventaId, clienteId: input.clienteId, total: distribucion.precioTotalVenta },
    })

    return { success: true, ventaId, distribucion }
  } catch (error) {
    logger.error('Error creando venta', error as Error, { context: 'BusinessLogicService' })

    await registrarAuditLog('crear', 'venta', null, auditContext, {
      exito: false,
      errorMensaje: error instanceof Error ? error.message : 'Error desconocido',
    })

    return { success: false, error: 'Error al crear venta con distribución' }
  }
}

// ═══════════════════════════════════════════════════════════════
// REGISTRAR ABONO DE VENTA
// ═══════════════════════════════════════════════════════════════

export async function registrarAbono(
  input: AbonoInput,
  auditContext: AuditContext = {},
): Promise<{ success: boolean; abonoId?: string; error?: string }> {
  try {
    // 1. Obtener venta actual
    const ventaResult = await db.select().from(ventas).where(eq(ventas.id, input.ventaId)).limit(1)

    const venta = ventaResult[0]
    if (!venta) {
      return { success: false, error: 'Venta no encontrada' }
    }

    // 2. Validar monto
    if (input.monto > Number(venta.montoRestante)) {
      return {
        success: false,
        error: `El abono ($${input.monto}) excede el monto restante ($${venta.montoRestante})`,
      }
    }

    const abonoId = `abono_${nanoid(12)}`
    const ahora = new Date()
    const nuevoMontoPagado = Number(venta.montoPagado) + input.monto
    const nuevoMontoRestante = Number(venta.montoRestante) - input.monto
    const proporcion = input.monto / Number(venta.precioTotalVenta)
    const nuevoEstado =
      nuevoMontoRestante === 0 ? 'completo' : nuevoMontoPagado > 0 ? 'parcial' : 'pendiente'

    // Calcular distribución proporcional del abono
    const distribucionAbono = {
      bovedaMonte: Number(venta.montoBovedaMonte) * proporcion,
      fletes: Number(venta.montoFletes) * proporcion,
      utilidades: Number(venta.montoUtilidades) * proporcion,
    }

    await db.transaction(async (tx) => {
      // 3a. Crear registro de abono
      await tx.insert(abonos).values({
        id: abonoId,
        ventaId: input.ventaId,
        clienteId: input.clienteId,
        monto: input.monto,
        fecha: ahora,
        proporcion,
        montoBovedaMonte: distribucionAbono.bovedaMonte,
        montoFletes: distribucionAbono.fletes,
        montoUtilidades: distribucionAbono.utilidades,
        montoPagadoAcumulado: nuevoMontoPagado,
        montoRestantePostAbono: nuevoMontoRestante,
        estadoPagoResultante: nuevoEstado,
        concepto: input.observaciones || `Abono de ${input.metodoPago || 'efectivo'}`,
        createdBy: input.userId || null,
      })

      // 3b. Actualizar venta
      await tx
        .update(ventas)
        .set({
          montoPagado: nuevoMontoPagado,
          montoRestante: nuevoMontoRestante,
          porcentajePagado: (nuevoMontoPagado / Number(venta.precioTotalVenta)) * 100,
          estadoPago: nuevoEstado,
          numeroAbonos: sql`${ventas.numeroAbonos} + 1`,
          fechaUltimoAbono: ahora,
          capitalBovedaMonte: sql`${ventas.capitalBovedaMonte} + ${distribucionAbono.bovedaMonte}`,
          capitalFletes: sql`${ventas.capitalFletes} + ${distribucionAbono.fletes}`,
          capitalUtilidades: sql`${ventas.capitalUtilidades} + ${distribucionAbono.utilidades}`,
          fechaPagoCompleto: nuevoEstado === 'completo' ? ahora : null,
          updatedAt: ahora,
        })
        .where(eq(ventas.id, input.ventaId))

      // 3c. Crear movimientos de ingreso en bancos
      const movimientosAbono: InsertMovimiento[] = [
        {
          id: `mov_${nanoid(12)}`,
          bancoId: 'boveda_monte',
          tipo: 'abono',
          monto: distribucionAbono.bovedaMonte,
          fecha: ahora,
          concepto: `Abono venta #${input.ventaId.slice(-8)}`,
          referencia: abonoId,
          categoria: 'Cobranza',
          ventaId: input.ventaId,
          clienteId: input.clienteId,
        },
        {
          id: `mov_${nanoid(12)}`,
          bancoId: 'flete_sur',
          tipo: 'abono',
          monto: distribucionAbono.fletes,
          fecha: ahora,
          concepto: `Abono venta #${input.ventaId.slice(-8)}`,
          referencia: abonoId,
          categoria: 'Cobranza',
          ventaId: input.ventaId,
          clienteId: input.clienteId,
        },
        {
          id: `mov_${nanoid(12)}`,
          bancoId: 'utilidades',
          tipo: 'abono',
          monto: distribucionAbono.utilidades,
          fecha: ahora,
          concepto: `Abono venta #${input.ventaId.slice(-8)}`,
          referencia: abonoId,
          categoria: 'Cobranza',
          ventaId: input.ventaId,
          clienteId: input.clienteId,
        },
      ]

      for (const mov of movimientosAbono) {
        await tx.insert(movimientos).values(mov)
      }

      // 3d. Actualizar capital de bancos
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${distribucionAbono.bovedaMonte}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'boveda_monte'))

      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${distribucionAbono.fletes}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'flete_sur'))

      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${distribucionAbono.utilidades}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'utilidades'))

      // 3e. Actualizar saldo cliente
      await tx
        .update(clientes)
        .set({
          saldoPendiente: sql`${clientes.saldoPendiente} - ${input.monto}`,
          totalPagado: sql`${clientes.totalPagado} + ${input.monto}`,
          totalAbonos: sql`${clientes.totalAbonos} + ${input.monto}`,
          numeroAbonos: sql`${clientes.numeroAbonos} + 1`,
          updatedAt: ahora,
        })
        .where(eq(clientes.id, input.clienteId))
    })

    await registrarAuditLog('crear', 'abono', abonoId, auditContext, {
      valorNuevo: { ...input, distribucionAbono },
      descripcion: `Abono de $${input.monto.toLocaleString()} a venta ${input.ventaId}`,
      montoInvolucrado: input.monto,
      bancosAfectados: ['boveda_monte', 'flete_sur', 'utilidades'],
    })

    logger.info('Abono registrado', {
      context: 'BusinessLogicService',
      data: { abonoId, ventaId: input.ventaId, monto: input.monto },
    })

    return { success: true, abonoId }
  } catch (error) {
    logger.error('Error registrando abono', error as Error, { context: 'BusinessLogicService' })
    return { success: false, error: 'Error al registrar abono' }
  }
}

// ═══════════════════════════════════════════════════════════════
// PROCESAR DEVOLUCIÓN CON REVERSIÓN GYA
// ═══════════════════════════════════════════════════════════════

export async function procesarDevolucion(
  input: DevolucionInput,
  auditContext: AuditContext = {},
): Promise<{ success: boolean; devolucionId?: string; error?: string }> {
  try {
    // 1. Obtener venta original
    const ventaResult = await db.select().from(ventas).where(eq(ventas.id, input.ventaId)).limit(1)

    const venta = ventaResult[0]
    if (!venta) {
      return { success: false, error: 'Venta no encontrada' }
    }

    // 2. Validar cantidad a devolver
    if (input.cantidadDevuelta > venta.cantidad) {
      return { success: false, error: 'La cantidad a devolver excede la cantidad vendida' }
    }

    const devolucionId = `dev_${nanoid(12)}`
    const ahora = new Date()
    const tipo = input.cantidadDevuelta === venta.cantidad ? 'total' : 'parcial'

    // 3. Calcular montos a revertir (proporcional)
    const proporcion = input.cantidadDevuelta / venta.cantidad
    const montoTotalDevolucion = Number(venta.precioTotalVenta) * proporcion
    const reversionBovedaMonte = Number(venta.montoBovedaMonte) * proporcion
    const reversionFletes = Number(venta.montoFletes) * proporcion
    const reversionUtilidades = Number(venta.montoUtilidades) * proporcion

    // Calcular monto a reembolsar (basado en lo ya pagado)
    const porcentajePagado = Number(venta.montoPagado) / Number(venta.precioTotalVenta)
    const montoReembolso = montoTotalDevolucion * porcentajePagado

    await db.transaction(async (tx) => {
      // 4a. Crear registro de devolución
      const devolucionData: InsertDevolucion = {
        id: devolucionId,
        ventaId: input.ventaId,
        clienteId: venta.clienteId,
        tipo,
        motivo: input.motivo,
        estado: 'procesada',
        cantidadOriginal: venta.cantidad,
        cantidadDevuelta: input.cantidadDevuelta,
        precioVentaUnidad: Number(venta.precioVentaUnidad),
        precioCompraUnidad: Number(venta.precioCompraUnidad),
        precioFleteUnidad: Number(venta.precioFlete),
        montoTotalDevolucion,
        reversionBovedaMonte,
        reversionFletes,
        reversionUtilidades,
        montoReembolso,
        estadoReembolso: montoReembolso > 0 ? 'pendiente' : 'no_aplica',
        devolverStock: input.devolverStock ?? true,
        ocDestinoId: input.ocDestinoId || venta.ocId,
        observaciones: input.observaciones || null,
        procesadoPor: input.userId || null,
        fechaProcesamiento: ahora,
        createdBy: input.userId || null,
      }

      await tx.insert(devoluciones).values(devolucionData)

      // 4b. Actualizar venta
      const nuevoEstadoVenta = tipo === 'total' ? 'devuelta' : 'activa'
      const nuevaCantidad = venta.cantidad - input.cantidadDevuelta

      await tx
        .update(ventas)
        .set({
          estado: nuevoEstadoVenta,
          cantidad: nuevaCantidad,
          precioTotalVenta: Number(venta.precioTotalVenta) - montoTotalDevolucion,
          montoBovedaMonte: Number(venta.montoBovedaMonte) - reversionBovedaMonte,
          montoFletes: Number(venta.montoFletes) - reversionFletes,
          montoUtilidades: Number(venta.montoUtilidades) - reversionUtilidades,
          montoRestante: Number(venta.montoRestante) - (montoTotalDevolucion - montoReembolso),
          updatedAt: ahora,
        })
        .where(eq(ventas.id, input.ventaId))

      // 4c. Restar de históricos de bancos (SOLO si ya estaba en histórico)
      await tx
        .update(bancos)
        .set({
          historicoIngresos: sql`${bancos.historicoIngresos} - ${reversionBovedaMonte}`,
          capitalActual: sql`${bancos.capitalActual} - ${reversionBovedaMonte * porcentajePagado}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'boveda_monte'))

      await tx
        .update(bancos)
        .set({
          historicoIngresos: sql`${bancos.historicoIngresos} - ${reversionFletes}`,
          capitalActual: sql`${bancos.capitalActual} - ${reversionFletes * porcentajePagado}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'flete_sur'))

      await tx
        .update(bancos)
        .set({
          historicoIngresos: sql`${bancos.historicoIngresos} - ${reversionUtilidades}`,
          capitalActual: sql`${bancos.capitalActual} - ${reversionUtilidades * porcentajePagado}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, 'utilidades'))

      // 4d. Crear movimientos de reversión
      const movimientosReversion: InsertMovimiento[] = [
        {
          id: `mov_${nanoid(12)}`,
          bancoId: 'boveda_monte',
          tipo: 'gasto',
          monto: reversionBovedaMonte,
          fecha: ahora,
          concepto: `Reversión GYA - Devolución #${devolucionId.slice(-8)}`,
          referencia: devolucionId,
          categoria: 'Devoluciones',
          ventaId: input.ventaId,
          clienteId: venta.clienteId,
        },
        {
          id: `mov_${nanoid(12)}`,
          bancoId: 'flete_sur',
          tipo: 'gasto',
          monto: reversionFletes,
          fecha: ahora,
          concepto: `Reversión GYA - Devolución #${devolucionId.slice(-8)}`,
          referencia: devolucionId,
          categoria: 'Devoluciones',
          ventaId: input.ventaId,
          clienteId: venta.clienteId,
        },
        {
          id: `mov_${nanoid(12)}`,
          bancoId: 'utilidades',
          tipo: 'gasto',
          monto: reversionUtilidades,
          fecha: ahora,
          concepto: `Reversión GYA - Devolución #${devolucionId.slice(-8)}`,
          referencia: devolucionId,
          categoria: 'Devoluciones',
          ventaId: input.ventaId,
          clienteId: venta.clienteId,
        },
      ]

      for (const mov of movimientosReversion) {
        await tx.insert(movimientos).values(mov)
      }

      // 4e. Actualizar saldo cliente
      await tx
        .update(clientes)
        .set({
          saldoPendiente: sql`${clientes.saldoPendiente} - ${montoTotalDevolucion - montoReembolso}`,
          totalCompras: sql`${clientes.totalCompras} - ${montoTotalDevolucion}`,
          updatedAt: ahora,
        })
        .where(eq(clientes.id, venta.clienteId))

      // 4f. Devolver stock si aplica
      if (input.devolverStock && (input.ocDestinoId || venta.ocId)) {
        const ocId = input.ocDestinoId ?? venta.ocId
        if (ocId) {
          await tx
            .update(ordenesCompra)
            .set({
              stockActual: sql`${ordenesCompra.stockActual} + ${input.cantidadDevuelta}`,
              stockVendido: sql`${ordenesCompra.stockVendido} - ${input.cantidadDevuelta}`,
              updatedAt: ahora,
            })
            .where(eq(ordenesCompra.id, ocId))
        }
      }
    })

    await registrarAuditLog('revertir', 'devolucion', devolucionId, auditContext, {
      valorAnterior: { ventaId: input.ventaId, cantidad: venta.cantidad },
      valorNuevo: {
        cantidadDevuelta: input.cantidadDevuelta,
        montoDevuelto: montoTotalDevolucion,
        reversionGYA: { reversionBovedaMonte, reversionFletes, reversionUtilidades },
      },
      descripcion: `Devolución ${tipo} de ${input.cantidadDevuelta} uds - Motivo: ${input.motivo}`,
      montoInvolucrado: montoTotalDevolucion,
      bancosAfectados: ['boveda_monte', 'flete_sur', 'utilidades'],
    })

    logger.info('Devolución procesada', {
      context: 'BusinessLogicService',
      data: { devolucionId, ventaId: input.ventaId, monto: montoTotalDevolucion },
    })

    return { success: true, devolucionId }
  } catch (error) {
    logger.error('Error procesando devolución', error as Error, { context: 'BusinessLogicService' })
    return { success: false, error: 'Error al procesar devolución' }
  }
}

// ═══════════════════════════════════════════════════════════════
// TRANSFERENCIA ENTRE BANCOS
// ═══════════════════════════════════════════════════════════════

export async function realizarTransferencia(
  input: TransferenciaInput,
  auditContext: AuditContext = {},
): Promise<{ success: boolean; error?: string }> {
  try {
    if (input.bancoOrigenId === input.bancoDestinoId) {
      return { success: false, error: 'El banco origen y destino no pueden ser iguales' }
    }

    // Verificar saldo suficiente
    const bancoOrigen = await db
      .select({ capitalActual: bancos.capitalActual, nombre: bancos.nombre })
      .from(bancos)
      .where(eq(bancos.id, input.bancoOrigenId))
      .limit(1)

    if (!bancoOrigen[0] || Number(bancoOrigen[0].capitalActual) < input.monto) {
      return { success: false, error: 'Saldo insuficiente en banco origen' }
    }

    const ahora = new Date()

    await db.transaction(async (tx) => {
      // Descontar de origen
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} - ${input.monto}`,
          historicoTransferenciasSalida: sql`${bancos.historicoTransferenciasSalida} + ${input.monto}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, input.bancoOrigenId))

      // Sumar a destino
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} + ${input.monto}`,
          historicoTransferenciasEntrada: sql`${bancos.historicoTransferenciasEntrada} + ${input.monto}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, input.bancoDestinoId))

      // Movimiento de salida
      await tx.insert(movimientos).values({
        id: `mov_${nanoid(12)}`,
        bancoId: input.bancoOrigenId,
        tipo: 'transferencia_salida',
        monto: input.monto,
        fecha: ahora,
        concepto: input.concepto || `Transferencia a ${input.bancoDestinoId}`,
        categoria: 'Transferencias',
        bancoDestinoId: input.bancoDestinoId,
        createdBy: input.userId || null,
      })

      // Movimiento de entrada
      await tx.insert(movimientos).values({
        id: `mov_${nanoid(12)}`,
        bancoId: input.bancoDestinoId,
        tipo: 'transferencia_entrada',
        monto: input.monto,
        fecha: ahora,
        concepto: input.concepto || `Transferencia desde ${input.bancoOrigenId}`,
        categoria: 'Transferencias',
        bancoOrigenId: input.bancoOrigenId,
        createdBy: input.userId || null,
      })
    })

    await registrarAuditLog('transferir', 'movimiento', null, auditContext, {
      valorNuevo: {
        monto: input.monto,
        bancoOrigen: input.bancoOrigenId,
        bancoDestino: input.bancoDestinoId,
        concepto: input.concepto,
      },
      descripcion: `Transferencia de $${input.monto.toLocaleString()} de ${input.bancoOrigenId} a ${input.bancoDestinoId}`,
      montoInvolucrado: input.monto,
      bancosAfectados: [input.bancoOrigenId, input.bancoDestinoId],
    })

    logger.info('Transferencia realizada', {
      context: 'BusinessLogicService',
      data: input,
    })

    return { success: true }
  } catch (error) {
    logger.error('Error en transferencia', error as Error, { context: 'BusinessLogicService' })
    return { success: false, error: 'Error al realizar transferencia' }
  }
}

// ═══════════════════════════════════════════════════════════════
// PAGO A DISTRIBUIDOR
// ═══════════════════════════════════════════════════════════════

export async function registrarPagoDistribuidor(
  input: PagoDistribuidorInput,
  auditContext: AuditContext = {},
): Promise<{ success: boolean; pagoId?: string; error?: string }> {
  try {
    // Verificar OC existe
    const ocResult = await db
      .select()
      .from(ordenesCompra)
      .where(eq(ordenesCompra.id, input.ordenCompraId))
      .limit(1)

    const oc = ocResult[0]
    if (!oc) {
      return { success: false, error: 'Orden de compra no encontrada' }
    }

    // Validar monto
    if (input.monto > Number(oc.montoRestante)) {
      return {
        success: false,
        error: `El pago ($${input.monto}) excede el monto restante ($${oc.montoRestante})`,
      }
    }

    // Verificar saldo en banco
    const bancoOrigen = await db
      .select({ capitalActual: bancos.capitalActual })
      .from(bancos)
      .where(eq(bancos.id, input.bancoOrigenId))
      .limit(1)

    if (!bancoOrigen[0] || Number(bancoOrigen[0].capitalActual) < input.monto) {
      return { success: false, error: 'Saldo insuficiente en banco origen' }
    }

    const pagoId = `pago_${nanoid(12)}`
    const ahora = new Date()
    const nuevoMontoPagado = Number(oc.montoPagado) + input.monto
    const nuevoMontoRestante = Number(oc.montoRestante) - input.monto
    const nuevoEstado =
      nuevoMontoRestante === 0 ? 'completo' : nuevoMontoPagado > 0 ? 'parcial' : 'pendiente'

    await db.transaction(async (tx) => {
      // Crear registro de pago
      await tx.insert(pagosDistribuidor).values({
        id: pagoId,
        ordenCompraId: input.ordenCompraId,
        distribuidorId: input.distribuidorId,
        bancoOrigenId: input.bancoOrigenId,
        monto: input.monto,
        fecha: ahora,
        montoPagadoAcumulado: nuevoMontoPagado,
        montoRestantePostPago: nuevoMontoRestante,
        estadoPagoResultante: nuevoEstado,
        concepto: input.observaciones || 'Pago a distribuidor',
        referencia: input.referencia || null,
        createdBy: input.userId || null,
      })

      // Actualizar OC
      await tx
        .update(ordenesCompra)
        .set({
          montoPagado: nuevoMontoPagado,
          montoRestante: nuevoMontoRestante,
          porcentajePagado: (nuevoMontoPagado / Number(oc.total)) * 100,
          estado: nuevoEstado,
          numeroPagos: sql`${ordenesCompra.numeroPagos} + 1`,
          fechaUltimoPago: ahora,
          updatedAt: ahora,
        })
        .where(eq(ordenesCompra.id, input.ordenCompraId))

      // Descontar de banco
      await tx
        .update(bancos)
        .set({
          capitalActual: sql`${bancos.capitalActual} - ${input.monto}`,
          historicoGastos: sql`${bancos.historicoGastos} + ${input.monto}`,
          updatedAt: ahora,
        })
        .where(eq(bancos.id, input.bancoOrigenId))

      // Crear movimiento
      await tx.insert(movimientos).values({
        id: `mov_${nanoid(12)}`,
        bancoId: input.bancoOrigenId,
        tipo: 'pago',
        monto: input.monto,
        fecha: ahora,
        concepto: `Pago OC #${input.ordenCompraId.slice(-8)}`,
        referencia: pagoId,
        categoria: 'Pagos Distribuidores',
        distribuidorId: input.distribuidorId,
        ordenCompraId: input.ordenCompraId,
        createdBy: input.userId || null,
      })

      // Actualizar distribuidor
      await tx
        .update(distribuidores)
        .set({
          saldoPendiente: sql`${distribuidores.saldoPendiente} - ${input.monto}`,
          totalPagado: sql`${distribuidores.totalPagado} + ${input.monto}`,
          numeroPagos: sql`${distribuidores.numeroPagos} + 1`,
          updatedAt: ahora,
        })
        .where(eq(distribuidores.id, input.distribuidorId))
    })

    await registrarAuditLog('crear', 'pago_distribuidor', pagoId, auditContext, {
      valorNuevo: {
        monto: input.monto,
        ordenCompraId: input.ordenCompraId,
        distribuidorId: input.distribuidorId,
        bancoOrigen: input.bancoOrigenId,
      },
      descripcion: `Pago de $${input.monto.toLocaleString()} a OC ${input.ordenCompraId}`,
      montoInvolucrado: input.monto,
      bancosAfectados: [input.bancoOrigenId],
    })

    logger.info('Pago a distribuidor registrado', {
      context: 'BusinessLogicService',
      data: { pagoId, ordenCompraId: input.ordenCompraId, monto: input.monto },
    })

    return { success: true, pagoId }
  } catch (error) {
    logger.error('Error registrando pago a distribuidor', error as Error, {
      context: 'BusinessLogicService',
    })
    return { success: false, error: 'Error al registrar pago a distribuidor' }
  }
}

// Re-exportar funciones de cálculo puro
export { calcularDistribucionGYA, calcularDistribucionProporcional, type DistribucionGYA }
