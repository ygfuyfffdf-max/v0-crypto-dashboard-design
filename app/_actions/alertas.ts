// ═══════════════════════════════════════════════════════════════════════════════
// CHRONOS INFINITY 2026 — SERVER ACTIONS: ALERTAS
// ═══════════════════════════════════════════════════════════════════════════════
//
// Server Actions para gestión de alertas y configuración.
// Sistema proactivo de monitoreo y notificaciones.
// ADAPTADO AL SCHEMA ACTUAL DE database/schema.ts
//
// ═══════════════════════════════════════════════════════════════════════════════

'use server'

import { logger } from '@/app/lib/utils/logger'
import { db } from '@/database'
import { alertas, alertasConfig, almacen, clientes, ordenesCompra } from '@/database/schema'
import { and, desc, eq, lt, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

// ═══════════════════════════════════════════════════════════════
// TIPOS BASADOS EN EL SCHEMA ACTUAL
// ═══════════════════════════════════════════════════════════════

// Tipos de alerta válidos según el schema
export type TipoAlerta =
  | 'stock_bajo'
  | 'stock_critico'
  | 'stock_agotado'
  | 'deuda_alta_cliente'
  | 'cliente_moroso'
  | 'deuda_alta_distribuidor'
  | 'margen_bajo'
  | 'margen_negativo'
  | 'banco_bajo_capital'
  | 'banco_sin_liquidez'
  | 'venta_sin_cobrar'
  | 'orden_sin_pagar'
  | 'rotacion_lenta'
  | 'cliente_inactivo'
  | 'meta_no_alcanzada'
  | 'anomalia_detectada'
  | 'sistema'
  | 'personalizada'

export type SeveridadAlerta = 'info' | 'advertencia' | 'critica' | 'urgente'
export type EstadoAlerta = 'activa' | 'vista' | 'resuelta' | 'ignorada' | 'escalada'
export type EntidadTipo =
  | 'cliente'
  | 'distribuidor'
  | 'venta'
  | 'orden_compra'
  | 'banco'
  | 'almacen'
  | 'sistema'

export interface AlertaInput {
  tipo: TipoAlerta
  severidad?: SeveridadAlerta
  titulo: string
  descripcion: string
  entidadTipo?: EntidadTipo
  entidadId?: string
  entidadNombre?: string
  valorActual?: number
  valorUmbral?: number
  unidad?: string
  accionSugerida?: string
  urlAccion?: string
  metadata?: Record<string, unknown>
}

export interface AlertaConDetalles {
  id: string
  tipo: TipoAlerta
  severidad: SeveridadAlerta
  estado: EstadoAlerta
  titulo: string
  descripcion: string
  entidadTipo: EntidadTipo | null
  entidadId: string | null
  entidadNombre: string | null
  valorActual: number | null
  valorUmbral: number | null
  unidad: string | null
  accionSugerida: string | null
  metadata: string | null
  createdAt: number | null
  fechaResuelta: number | null
}

// ═══════════════════════════════════════════════════════════════
// CREAR ALERTA
// ═══════════════════════════════════════════════════════════════

export async function crearAlertaAction(
  input: AlertaInput,
): Promise<{ success: boolean; alertaId?: string; error?: string }> {
  try {
    const alertaId = `alert_${nanoid(12)}`

    await db.insert(alertas).values({
      id: alertaId,
      tipo: input.tipo,
      severidad: input.severidad ?? 'info',
      estado: 'activa',
      titulo: input.titulo,
      descripcion: input.descripcion,
      entidadTipo: input.entidadTipo ?? null,
      entidadId: input.entidadId ?? null,
      entidadNombre: input.entidadNombre ?? null,
      valorActual: input.valorActual ?? null,
      valorUmbral: input.valorUmbral ?? null,
      unidad: input.unidad ?? null,
      accionSugerida: input.accionSugerida ?? null,
      urlAccion: input.urlAccion ?? null,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    })

    logger.info('Alerta creada', {
      context: 'AlertasActions',
      data: { alertaId, tipo: input.tipo },
    })

    revalidatePath('/dashboard')
    revalidatePath('/alertas')

    return { success: true, alertaId }
  } catch (error) {
    logger.error('Error creando alerta', error as Error, { context: 'AlertasActions' })
    return { success: false, error: 'Error al crear alerta' }
  }
}

// ═══════════════════════════════════════════════════════════════
// MARCAR ALERTA COMO VISTA
// ═══════════════════════════════════════════════════════════════

export async function marcarAlertaVista(
  alertaId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(alertas)
      .set({
        estado: 'vista',
        fechaVista: Math.floor(Date.now() / 1000),
      })
      .where(eq(alertas.id, alertaId))

    logger.info('Alerta marcada como vista', {
      context: 'AlertasActions',
      data: { alertaId },
    })

    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error marcando alerta vista', error as Error, { context: 'AlertasActions' })
    return { success: false, error: 'Error al actualizar alerta' }
  }
}

// ═══════════════════════════════════════════════════════════════
// RESOLVER ALERTA
// ═══════════════════════════════════════════════════════════════

export async function resolverAlerta(
  alertaId: string,
  notas?: string,
  resueltaPor?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(alertas)
      .set({
        estado: 'resuelta',
        fechaResuelta: Math.floor(Date.now() / 1000),
        resueltaPor: resueltaPor ?? null,
        notasResolucion: notas ?? null,
      })
      .where(eq(alertas.id, alertaId))

    logger.info('Alerta resuelta', {
      context: 'AlertasActions',
      data: { alertaId },
    })

    revalidatePath('/dashboard')
    revalidatePath('/alertas')

    return { success: true }
  } catch (error) {
    logger.error('Error resolviendo alerta', error as Error, { context: 'AlertasActions' })
    return { success: false, error: 'Error al resolver alerta' }
  }
}

// ═══════════════════════════════════════════════════════════════
// IGNORAR ALERTA
// ═══════════════════════════════════════════════════════════════

export async function ignorarAlerta(
  alertaId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(alertas)
      .set({
        estado: 'ignorada',
      })
      .where(eq(alertas.id, alertaId))

    logger.info('Alerta ignorada', {
      context: 'AlertasActions',
      data: { alertaId },
    })

    revalidatePath('/dashboard')

    return { success: true }
  } catch (error) {
    logger.error('Error ignorando alerta', error as Error, { context: 'AlertasActions' })
    return { success: false, error: 'Error al ignorar alerta' }
  }
}

// ═══════════════════════════════════════════════════════════════
// ESCALAR ALERTA
// ═══════════════════════════════════════════════════════════════

export async function escalarAlerta(
  alertaId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(alertas)
      .set({
        estado: 'escalada',
        severidad: 'urgente',
      })
      .where(eq(alertas.id, alertaId))

    logger.info('Alerta escalada', {
      context: 'AlertasActions',
      data: { alertaId },
    })

    revalidatePath('/dashboard')
    revalidatePath('/alertas')

    return { success: true }
  } catch (error) {
    logger.error('Error escalando alerta', error as Error, { context: 'AlertasActions' })
    return { success: false, error: 'Error al escalar alerta' }
  }
}

// ═══════════════════════════════════════════════════════════════
// VERIFICACIÓN AUTOMÁTICA DE ALERTAS
// ═══════════════════════════════════════════════════════════════

export async function ejecutarVerificacionAlertas(): Promise<{
  success: boolean
  alertasGeneradas: number
  error?: string
}> {
  try {
    let alertasGeneradas = 0

    // 1. Verificar stock bajo en almacén
    const alertasStock = await verificarAlertasStock()
    alertasGeneradas += alertasStock

    // 2. Verificar clientes morosos
    const alertasClientes = await verificarClientesMorosos()
    alertasGeneradas += alertasClientes

    // 3. Verificar órdenes de compra pendientes
    const alertasOC = await verificarOrdenesPendientes()
    alertasGeneradas += alertasOC

    logger.info('Verificación de alertas completada', {
      context: 'AlertasActions',
      data: { alertasGeneradas },
    })

    revalidatePath('/dashboard')
    revalidatePath('/alertas')

    return { success: true, alertasGeneradas }
  } catch (error) {
    logger.error('Error en verificación de alertas', error as Error, {
      context: 'AlertasActions',
    })
    return { success: false, alertasGeneradas: 0, error: 'Error ejecutando verificación' }
  }
}

async function verificarAlertasStock(): Promise<number> {
  try {
    // Obtener configuración de umbral de stock
    const configStock = await db
      .select()
      .from(alertasConfig)
      .where(eq(alertasConfig.tipo, 'stock_bajo'))
      .limit(1)

    const umbralBajo = configStock[0]?.umbral ?? 10

    // Buscar items con stock bajo
    const itemsBajos = await db
      .select({
        id: almacen.id,
        nombre: almacen.nombre,
        cantidad: almacen.cantidad,
      })
      .from(almacen)
      .where(lt(almacen.cantidad, umbralBajo))
      .limit(50)

    let alertasCreadas = 0

    for (const item of itemsBajos) {
      // Verificar si ya existe alerta activa para este item
      const alertaExistente = await db
        .select()
        .from(alertas)
        .where(
          and(
            eq(alertas.entidadTipo, 'almacen'),
            eq(alertas.entidadId, item.id),
            eq(alertas.tipo, 'stock_bajo'),
            eq(alertas.estado, 'activa'),
          ),
        )
        .limit(1)

      if (alertaExistente.length === 0) {
        const cantidadActual = Number(item.cantidad ?? 0)
        const severidad: SeveridadAlerta =
          cantidadActual <= 0 ? 'critica' : cantidadActual < 5 ? 'urgente' : 'advertencia'

        const tipoAlerta: TipoAlerta =
          cantidadActual <= 0
            ? 'stock_agotado'
            : cantidadActual < 5
              ? 'stock_critico'
              : 'stock_bajo'

        await crearAlertaAction({
          tipo: tipoAlerta,
          severidad,
          titulo: `Stock ${tipoAlerta === 'stock_agotado' ? 'AGOTADO' : 'bajo'}: ${item.nombre}`,
          descripcion: `El producto "${item.nombre}" tiene ${cantidadActual} unidades.`,
          entidadTipo: 'almacen',
          entidadId: item.id,
          entidadNombre: item.nombre ?? undefined,
          valorActual: cantidadActual,
          valorUmbral: umbralBajo,
          unidad: 'unidades',
          accionSugerida: 'Crear orden de compra',
          urlAccion: `/ordenes-compra/nueva?producto=${item.id}`,
        })
        alertasCreadas++
      }
    }

    return alertasCreadas
  } catch (error) {
    logger.error('Error verificando stock', error as Error, { context: 'AlertasActions' })
    return 0
  }
}

async function verificarClientesMorosos(): Promise<number> {
  try {
    // Obtener configuración
    const configMoroso = await db
      .select()
      .from(alertasConfig)
      .where(eq(alertasConfig.tipo, 'cliente_moroso'))
      .limit(1)

    const umbralDeuda = configMoroso[0]?.umbral ?? 10000

    // Buscar clientes con deuda alta
    const clientesDeudores = await db
      .select({
        id: clientes.id,
        nombre: clientes.nombre,
        saldoPendiente: clientes.saldoPendiente,
        ultimaCompra: clientes.ultimaCompra,
      })
      .from(clientes)
      .where(sql`${clientes.saldoPendiente} > ${umbralDeuda}`)
      .limit(50)

    let alertasCreadas = 0

    for (const cliente of clientesDeudores) {
      // Verificar si ya existe alerta activa
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
        const deuda = Number(cliente.saldoPendiente)
        const severidad: SeveridadAlerta =
          deuda > 50000 ? 'critica' : deuda > 20000 ? 'urgente' : 'advertencia'

        await crearAlertaAction({
          tipo: 'cliente_moroso',
          severidad,
          titulo: `Cliente con deuda alta: ${cliente.nombre}`,
          descripcion: `El cliente "${cliente.nombre}" tiene deuda de $${deuda.toLocaleString()}`,
          entidadTipo: 'cliente',
          entidadId: cliente.id,
          entidadNombre: cliente.nombre ?? undefined,
          valorActual: deuda,
          valorUmbral: umbralDeuda,
          unidad: '$',
          accionSugerida: 'Contactar cliente para cobro',
          urlAccion: `/clientes/${cliente.id}`,
        })
        alertasCreadas++
      }
    }

    return alertasCreadas
  } catch (error) {
    logger.error('Error verificando clientes morosos', error as Error, {
      context: 'AlertasActions',
    })
    return 0
  }
}

async function verificarOrdenesPendientes(): Promise<number> {
  try {
    // Buscar OC parcialmente pagadas (estado parcial)
    const ordenesPendientes = await db
      .select({
        id: ordenesCompra.id,
        distribuidorId: ordenesCompra.distribuidorId,
        total: ordenesCompra.total,
        estado: ordenesCompra.estado,
      })
      .from(ordenesCompra)
      .where(eq(ordenesCompra.estado, 'parcial'))
      .limit(50)

    let alertasCreadas = 0

    for (const oc of ordenesPendientes) {
      // Verificar si ya existe alerta activa
      const alertaExistente = await db
        .select()
        .from(alertas)
        .where(
          and(
            eq(alertas.entidadTipo, 'orden_compra'),
            eq(alertas.entidadId, oc.id),
            eq(alertas.tipo, 'orden_sin_pagar'),
            eq(alertas.estado, 'activa'),
          ),
        )
        .limit(1)

      if (alertaExistente.length === 0) {
        await crearAlertaAction({
          tipo: 'orden_sin_pagar',
          severidad: 'advertencia',
          titulo: 'OC con pago pendiente',
          descripcion: `La orden de compra ${oc.id} tiene pagos pendientes`,
          entidadTipo: 'orden_compra',
          entidadId: oc.id,
          valorActual: Number(oc.total),
          accionSugerida: 'Registrar pago',
          urlAccion: `/ordenes-compra/${oc.id}`,
        })
        alertasCreadas++
      }
    }

    return alertasCreadas
  } catch (error) {
    logger.error('Error verificando OC pendientes', error as Error, {
      context: 'AlertasActions',
    })
    return 0
  }
}

// ═══════════════════════════════════════════════════════════════
// CONSULTAS
// ═══════════════════════════════════════════════════════════════

export async function obtenerAlertas(filtros?: {
  estado?: EstadoAlerta
  severidad?: SeveridadAlerta
  tipo?: TipoAlerta
  entidadTipo?: EntidadTipo
  limit?: number
}): Promise<AlertaConDetalles[]> {
  try {
    const conditions = []

    if (filtros?.estado) {
      conditions.push(eq(alertas.estado, filtros.estado))
    }
    if (filtros?.severidad) {
      conditions.push(eq(alertas.severidad, filtros.severidad))
    }
    if (filtros?.tipo) {
      conditions.push(eq(alertas.tipo, filtros.tipo))
    }
    if (filtros?.entidadTipo) {
      conditions.push(eq(alertas.entidadTipo, filtros.entidadTipo))
    }

    const baseQuery = db
      .select()
      .from(alertas)
      .orderBy(
        desc(sql`CASE severidad
          WHEN 'urgente' THEN 1
          WHEN 'critica' THEN 2
          WHEN 'advertencia' THEN 3
          ELSE 4 END`),
        desc(alertas.createdAt),
      )
      .limit(filtros?.limit ?? 100)

    const results =
      conditions.length > 0 ? await baseQuery.where(and(...conditions)) : await baseQuery

    return results.map((a) => ({
      id: a.id,
      tipo: a.tipo as TipoAlerta,
      severidad: a.severidad as SeveridadAlerta,
      estado: a.estado as EstadoAlerta,
      titulo: a.titulo,
      descripcion: a.descripcion,
      entidadTipo: a.entidadTipo as EntidadTipo | null,
      entidadId: a.entidadId,
      entidadNombre: a.entidadNombre,
      valorActual: a.valorActual,
      valorUmbral: a.valorUmbral,
      unidad: a.unidad,
      accionSugerida: a.accionSugerida,
      metadata: a.metadata,
      createdAt: a.createdAt,
      fechaResuelta: a.fechaResuelta,
    }))
  } catch (error) {
    logger.error('Error obteniendo alertas', error as Error, { context: 'AlertasActions' })
    return []
  }
}

export async function obtenerAlertasActivas(): Promise<AlertaConDetalles[]> {
  return obtenerAlertas({ estado: 'activa' })
}

export async function contarAlertasPorSeveridad(): Promise<{
  urgente: number
  critica: number
  advertencia: number
  info: number
  total: number
}> {
  try {
    const result = await db
      .select({
        severidad: alertas.severidad,
        count: sql<number>`count(*)`,
      })
      .from(alertas)
      .where(eq(alertas.estado, 'activa'))
      .groupBy(alertas.severidad)

    const conteo = {
      urgente: 0,
      critica: 0,
      advertencia: 0,
      info: 0,
      total: 0,
    }

    for (const row of result) {
      const count = Number(row.count)
      const sev = row.severidad as SeveridadAlerta
      if (sev in conteo) {
        conteo[sev] = count
      }
      conteo.total += count
    }

    return conteo
  } catch (error) {
    logger.error('Error contando alertas', error as Error, { context: 'AlertasActions' })
    return { urgente: 0, critica: 0, advertencia: 0, info: 0, total: 0 }
  }
}

// ═══════════════════════════════════════════════════════════════
// CONFIGURACIÓN DE ALERTAS
// ═══════════════════════════════════════════════════════════════

export async function obtenerConfiguracionAlertas() {
  try {
    const configs = await db.select().from(alertasConfig).orderBy(alertasConfig.tipo)

    return configs
  } catch (error) {
    logger.error('Error obteniendo configuración', error as Error, { context: 'AlertasActions' })
    return []
  }
}

export async function actualizarConfiguracionAlerta(
  configId: string,
  updates: {
    activo?: boolean
    umbral?: number
    severidad?: SeveridadAlerta
    frecuenciaHoras?: number
  },
): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .update(alertasConfig)
      .set({
        activo: updates.activo !== undefined ? (updates.activo ? 1 : 0) : undefined,
        umbral: updates.umbral,
        severidad: updates.severidad,
        frecuenciaHoras: updates.frecuenciaHoras,
      })
      .where(eq(alertasConfig.id, configId))

    logger.info('Configuración de alerta actualizada', {
      context: 'AlertasActions',
      data: { configId, updates },
    })

    revalidatePath('/configuracion')
    revalidatePath('/alertas')

    return { success: true }
  } catch (error) {
    logger.error('Error actualizando configuración', error as Error, {
      context: 'AlertasActions',
    })
    return { success: false, error: 'Error al actualizar configuración' }
  }
}
