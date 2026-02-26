/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 * 🎯 CHRONOS INFINITY 2026 — ACCIONES DE AUDITORÍA Y PERMISOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Server actions para:
 * - Registro de auditoría en BD
 * - Verificación de permisos
 * - Gestión de aprobaciones
 * - Validaciones de seguridad
 *
 * @version 3.0.0
 * ═══════════════════════════════════════════════════════════════════════════════════════════════════
 */

'use server'

import type { AccionAudit, ContextoDispositivo, ModuloAudit, SeveridadAudit } from '@/app/_lib/services/audit-supreme.service'
import { db } from '@/database'
import { aprobacionesPendientes, auditLog, notificaciones, rolePermisos, roles, usuarioRoles } from '@/database/schema-audit'
import { and, desc, eq, gte, like, lte, sql } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import { revalidatePath } from 'next/cache'

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface RegistrarAuditParams {
  usuarioId: string
  usuarioNombre: string
  usuarioEmail?: string
  rolId?: string
  accion: AccionAudit
  modulo: ModuloAudit
  descripcion: string
  severidad?: SeveridadAudit
  entidadTipo?: string
  entidadId?: string
  entidadNombre?: string
  datosAnteriores?: Record<string, unknown>
  datosNuevos?: Record<string, unknown>
  camposModificados?: string[]
  bancoId?: string
  bancoNombre?: string
  monto?: number
  dispositivo: ContextoDispositivo
  exitoso?: boolean
  mensajeError?: string
  duracionMs?: number
  metadata?: Record<string, unknown>
}

interface FiltrosAuditDB {
  usuarioId?: string
  modulo?: string
  accion?: string
  severidad?: string
  bancoId?: string
  desde?: Date
  hasta?: Date
  busqueda?: string
  limite?: number
  offset?: number
}

interface ResultadoAccion<T = void> {
  exito: boolean
  datos?: T
  error?: string
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// REGISTRO DE AUDITORÍA
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Registra una entrada de auditoría en la base de datos
 */
export async function registrarAudit(params: RegistrarAuditParams): Promise<ResultadoAccion<{ id: string }>> {
  try {
    const id = `audit_${nanoid()}`
    const timestamp = new Date()

    await db.insert(auditLog).values({
      id,
      usuarioId: params.usuarioId,
      usuarioNombre: params.usuarioNombre,
      usuarioEmail: params.usuarioEmail,
      rolId: params.rolId,
      accion: params.accion as 'crear' | 'editar' | 'eliminar' | 'ver' | 'exportar' | 'login' | 'logout' | 'aprobar' | 'rechazar' | 'transferir' | 'ingreso' | 'gasto',
      modulo: params.modulo as 'bancos' | 'ventas' | 'clientes' | 'distribuidores' | 'almacen' | 'ordenes' | 'reportes' | 'configuracion' | 'usuarios' | 'roles' | 'sistema',
      entidadTipo: params.entidadTipo,
      entidadId: params.entidadId,
      entidadNombre: params.entidadNombre,
      descripcion: params.descripcion,
      datosAnteriores: params.datosAnteriores ? JSON.stringify(params.datosAnteriores) : undefined,
      datosNuevos: params.datosNuevos ? JSON.stringify(params.datosNuevos) : undefined,
      camposModificados: params.camposModificados ? JSON.stringify(params.camposModificados) : undefined,
      bancoId: params.bancoId,
      bancoNombre: params.bancoNombre,
      monto: params.monto,
      ipAddress: params.dispositivo.ip,
      userAgent: params.dispositivo.userAgent,
      dispositivo: params.dispositivo.dispositivo,
      navegador: params.dispositivo.navegador,
      sistemaOperativo: params.dispositivo.sistemaOperativo,
      ubicacion: params.dispositivo.ubicacion,
      exitoso: params.exitoso ?? true,
      mensajeError: params.mensajeError,
      duracionMs: params.duracionMs,
      metadata: params.metadata ? JSON.stringify(params.metadata) : undefined,
      timestamp,
      fechaFormateada: timestamp.toLocaleString('es-MX', {
        dateStyle: 'full',
        timeStyle: 'medium'
      })
    })

    return { exito: true, datos: { id } }
  } catch (error) {
    console.error('Error registrando auditoría:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

/**
 * Obtiene logs de auditoría con filtros
 */
export async function obtenerLogsAudit(filtros: FiltrosAuditDB): Promise<ResultadoAccion<{ logs: typeof auditLog.$inferSelect[]; total: number }>> {
  try {
    const condiciones = []

    if (filtros.usuarioId) {
      condiciones.push(eq(auditLog.usuarioId, filtros.usuarioId))
    }
    if (filtros.modulo) {
      condiciones.push(eq(auditLog.modulo, filtros.modulo as typeof auditLog.$inferSelect['modulo']))
    }
    if (filtros.accion) {
      condiciones.push(eq(auditLog.accion, filtros.accion as typeof auditLog.$inferSelect['accion']))
    }
    if (filtros.bancoId) {
      condiciones.push(eq(auditLog.bancoId, filtros.bancoId))
    }
    if (filtros.desde) {
      condiciones.push(gte(auditLog.timestamp, filtros.desde))
    }
    if (filtros.hasta) {
      condiciones.push(lte(auditLog.timestamp, filtros.hasta))
    }
    if (filtros.busqueda) {
      condiciones.push(like(auditLog.descripcion, `%${filtros.busqueda}%`))
    }

    const whereClause = condiciones.length > 0 ? and(...condiciones) : undefined

    const logs = await db
      .select()
      .from(auditLog)
      .where(whereClause)
      .orderBy(desc(auditLog.timestamp))
      .limit(filtros.limite || 50)
      .offset(filtros.offset || 0)

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLog)
      .where(whereClause)

    const total = countResult[0]?.count ?? 0
    return { exito: true, datos: { logs, total } }
  } catch (error) {
    console.error('Error obteniendo logs:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

/**
 * Obtiene estadísticas de auditoría
 */
export async function obtenerEstadisticasAudit(dias: number = 7): Promise<ResultadoAccion<{
  total: number
  porModulo: Record<string, number>
  porAccion: Record<string, number>
  porUsuario: { usuarioId: string; nombre: string; total: number }[]
}>> {
  try {
    const desde = new Date()
    desde.setDate(desde.getDate() - dias)

    // Total
    const totalResult = await db
      .select({ total: sql<number>`count(*)` })
      .from(auditLog)
      .where(gte(auditLog.timestamp, desde))

    const totalCount = totalResult[0]?.total ?? 0

    // Por módulo
    const porModuloRaw = await db
      .select({
        modulo: auditLog.modulo,
        total: sql<number>`count(*)`
      })
      .from(auditLog)
      .where(gte(auditLog.timestamp, desde))
      .groupBy(auditLog.modulo)

    const porModulo: Record<string, number> = {}
    porModuloRaw.forEach(row => {
      porModulo[row.modulo] = row.total
    })

    // Por acción
    const porAccionRaw = await db
      .select({
        accion: auditLog.accion,
        total: sql<number>`count(*)`
      })
      .from(auditLog)
      .where(gte(auditLog.timestamp, desde))
      .groupBy(auditLog.accion)

    const porAccion: Record<string, number> = {}
    porAccionRaw.forEach(row => {
      porAccion[row.accion] = row.total
    })

    // Por usuario
    const porUsuario = await db
      .select({
        usuarioId: auditLog.usuarioId,
        nombre: auditLog.usuarioNombre,
        total: sql<number>`count(*)`
      })
      .from(auditLog)
      .where(gte(auditLog.timestamp, desde))
      .groupBy(auditLog.usuarioId, auditLog.usuarioNombre)
      .orderBy(desc(sql`count(*)`))
      .limit(10)

    return {
      exito: true,
      datos: {
        total: totalCount,
        porModulo,
        porAccion,
        porUsuario: porUsuario.map(u => ({
          usuarioId: u.usuarioId,
          nombre: u.nombre,
          total: u.total
        }))
      }
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GESTIÓN DE ROLES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene todos los roles
 */
export async function obtenerRoles(): Promise<ResultadoAccion<typeof roles.$inferSelect[]>> {
  try {
    const resultado = await db
      .select()
      .from(roles)
      .where(eq(roles.activo, true))
      .orderBy(desc(roles.prioridad))

    return { exito: true, datos: resultado }
  } catch (error) {
    console.error('Error obteniendo roles:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

/**
 * Crea un nuevo rol
 */
export async function crearRol(params: {
  codigo: string
  nombre: string
  descripcion?: string
  color?: string
  icono?: string
  esAdmin?: boolean
  creadoPor: string
}): Promise<ResultadoAccion<{ id: string }>> {
  try {
    const id = `rol_${nanoid()}`

    await db.insert(roles).values({
      id,
      codigo: params.codigo,
      nombre: params.nombre,
      descripcion: params.descripcion,
      color: params.color || '#8B5CF6',
      icono: params.icono || 'shield',
      esAdmin: params.esAdmin || false,
      esSistema: false,
      prioridad: 50,
      activo: true,
      creadoPor: params.creadoPor
    })

    revalidatePath('/configuracion/roles')
    return { exito: true, datos: { id } }
  } catch (error) {
    console.error('Error creando rol:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

/**
 * Actualiza un rol existente
 */
export async function actualizarRol(
  id: string,
  params: Partial<{
    nombre: string
    descripcion: string
    color: string
    icono: string
    activo: boolean
    modificadoPor: string
  }>
): Promise<ResultadoAccion> {
  try {
    await db
      .update(roles)
      .set({
        ...params,
        updatedAt: new Date()
      })
      .where(eq(roles.id, id))

    revalidatePath('/configuracion/roles')
    return { exito: true }
  } catch (error) {
    console.error('Error actualizando rol:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

/**
 * Elimina un rol (soft delete)
 */
export async function eliminarRol(id: string, eliminadoPor: string): Promise<ResultadoAccion> {
  try {
    // No eliminar roles del sistema
    const [rol] = await db.select().from(roles).where(eq(roles.id, id))
    if (rol?.esSistema) {
      return { exito: false, error: 'No se pueden eliminar roles del sistema' }
    }

    await db
      .update(roles)
      .set({ activo: false, modificadoPor: eliminadoPor })
      .where(eq(roles.id, id))

    revalidatePath('/configuracion/roles')
    return { exito: true }
  } catch (error) {
    console.error('Error eliminando rol:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// GESTIÓN DE PERMISOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Obtiene permisos de un rol
 */
export async function obtenerPermisosRol(rolId: string): Promise<ResultadoAccion<typeof rolePermisos.$inferSelect[]>> {
  try {
    const permisos = await db
      .select()
      .from(rolePermisos)
      .where(and(
        eq(rolePermisos.rolId, rolId),
        eq(rolePermisos.activo, true)
      ))

    return { exito: true, datos: permisos }
  } catch (error) {
    console.error('Error obteniendo permisos:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

/**
 * Asigna permiso a un rol
 */
export async function asignarPermisoRol(params: {
  rolId: string
  modulo: string
  accion: string
  bancosPermitidos?: string[]
  montoMaximo?: number
  limiteDiario?: number
  horaInicio?: string
  horaFin?: string
  diasPermitidos?: number[]
  requiereAprobacion?: boolean
}): Promise<ResultadoAccion<{ id: string }>> {
  try {
    const id = `perm_${nanoid()}`

    await db.insert(rolePermisos).values({
      id,
      rolId: params.rolId,
      modulo: params.modulo as typeof rolePermisos.$inferSelect['modulo'],
      accion: params.accion as typeof rolePermisos.$inferSelect['accion'],
      activo: true,
      bancosPermitidos: params.bancosPermitidos ? JSON.stringify(params.bancosPermitidos) : undefined,
      montoMaximo: params.montoMaximo,
      limiteDiario: params.limiteDiario,
      horaInicio: params.horaInicio,
      horaFin: params.horaFin,
      diasPermitidos: params.diasPermitidos ? JSON.stringify(params.diasPermitidos) : undefined,
      requiereAprobacion: params.requiereAprobacion
    })

    revalidatePath('/configuracion/roles')
    return { exito: true, datos: { id } }
  } catch (error) {
    console.error('Error asignando permiso:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

/**
 * Revoca permiso de un rol
 */
export async function revocarPermisoRol(permisoId: string): Promise<ResultadoAccion> {
  try {
    await db
      .update(rolePermisos)
      .set({ activo: false })
      .where(eq(rolePermisos.id, permisoId))

    revalidatePath('/configuracion/roles')
    return { exito: true }
  } catch (error) {
    console.error('Error revocando permiso:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// VERIFICACIÓN DE PERMISOS
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

interface VerificarPermisoParams {
  usuarioId: string
  modulo: string
  accion: string
  bancoId?: string
  monto?: number
}

interface ResultadoVerificacion {
  permitido: boolean
  requiereAprobacion: boolean
  motivo?: string
  restricciones?: {
    montoMaximo?: number
    limiteDiario?: number
    bancosPermitidos?: string[]
    horaInicio?: string
    horaFin?: string
  }
}

/**
 * Verifica si un usuario tiene permiso para realizar una acción
 */
export async function verificarPermiso(params: VerificarPermisoParams): Promise<ResultadoAccion<ResultadoVerificacion>> {
  try {
    // Obtener roles del usuario
    const rolesUsuario = await db
      .select({ rolId: usuarioRoles.rolId })
      .from(usuarioRoles)
      .where(and(
        eq(usuarioRoles.usuarioId, params.usuarioId),
        eq(usuarioRoles.activo, true)
      ))

    if (rolesUsuario.length === 0) {
      return {
        exito: true,
        datos: {
          permitido: false,
          requiereAprobacion: false,
          motivo: 'Usuario sin roles asignados'
        }
      }
    }

    // Verificar si algún rol tiene el permiso
    for (const { rolId } of rolesUsuario) {
      // Verificar si es admin
      const [rol] = await db.select().from(roles).where(eq(roles.id, rolId))
      if (rol?.esAdmin) {
        return {
          exito: true,
          datos: {
            permitido: true,
            requiereAprobacion: false
          }
        }
      }

      // Buscar permiso específico
      const [permiso] = await db
        .select()
        .from(rolePermisos)
        .where(and(
          eq(rolePermisos.rolId, rolId),
          eq(rolePermisos.modulo, params.modulo as typeof rolePermisos.$inferSelect['modulo']),
          eq(rolePermisos.accion, params.accion as typeof rolePermisos.$inferSelect['accion']),
          eq(rolePermisos.activo, true)
        ))

      if (permiso) {
        // Verificar restricciones de banco
        if (params.bancoId && permiso.bancosPermitidos) {
          const bancosPermitidos = JSON.parse(permiso.bancosPermitidos) as string[]
          if (bancosPermitidos.length > 0 && !bancosPermitidos.includes(params.bancoId)) {
            continue // Probar siguiente rol
          }
        }

        // Verificar restricciones de monto
        if (params.monto && permiso.montoMaximo && params.monto > permiso.montoMaximo) {
          return {
            exito: true,
            datos: {
              permitido: false,
              requiereAprobacion: true,
              motivo: `Monto excede el límite permitido ($${permiso.montoMaximo.toLocaleString()})`,
              restricciones: {
                montoMaximo: permiso.montoMaximo
              }
            }
          }
        }

        // Verificar horario
        if (permiso.horaInicio && permiso.horaFin) {
          const ahora = new Date()
          const horaActual = ahora.getHours() * 60 + ahora.getMinutes()
          const [hInicio, mInicio] = permiso.horaInicio.split(':').map(Number)
          const [hFin, mFin] = permiso.horaFin.split(':').map(Number)
          
          if (hInicio === undefined || mInicio === undefined || hFin === undefined || mFin === undefined) {
            return {
              exito: true,
              datos: {
                permitido: false,
                requiereAprobacion: false,
                motivo: 'Formato de hora inválido',
              },
            }
          }
          
          const inicioMin = hInicio * 60 + mInicio
          const finMin = hFin * 60 + mFin

          if (horaActual < inicioMin || horaActual > finMin) {
            return {
              exito: true,
              datos: {
                permitido: false,
                requiereAprobacion: false,
                motivo: `Operación fuera de horario permitido (${permiso.horaInicio} - ${permiso.horaFin})`,
                restricciones: {
                  horaInicio: permiso.horaInicio,
                  horaFin: permiso.horaFin
                }
              }
            }
          }
        }

        // Permiso concedido
        return {
          exito: true,
          datos: {
            permitido: true,
            requiereAprobacion: permiso.requiereAprobacion || false,
            restricciones: {
              montoMaximo: permiso.montoMaximo ?? undefined,
              limiteDiario: permiso.limiteDiario ?? undefined,
              bancosPermitidos: permiso.bancosPermitidos ? JSON.parse(permiso.bancosPermitidos) : undefined,
              horaInicio: permiso.horaInicio ?? undefined,
              horaFin: permiso.horaFin ?? undefined
            }
          }
        }
      }
    }

    // No se encontró permiso
    return {
      exito: true,
      datos: {
        permitido: false,
        requiereAprobacion: false,
        motivo: 'Permiso no asignado'
      }
    }
  } catch (error) {
    console.error('Error verificando permiso:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════════════════════════
// APROBACIONES
// ═══════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * Crea una solicitud de aprobación
 */
export async function crearSolicitudAprobacion(params: {
  solicitanteId: string
  solicitanteNombre: string
  aprobadorId: string
  operacion: string
  modulo: string
  entidadId?: string
  monto?: number
  bancoId?: string
  bancoNombre?: string
  detalles?: string
  datosOperacion?: Record<string, unknown>
}): Promise<ResultadoAccion<{ id: string }>> {
  try {
    const id = `aprob_${nanoid()}`

    await db.insert(aprobacionesPendientes).values({
      id,
      solicitanteId: params.solicitanteId,
      solicitanteNombre: params.solicitanteNombre,
      aprobadorRolId: params.aprobadorId || '',
      accion: params.operacion,
      entidadTipo: params.modulo,
      modulo: params.modulo,
      entidadId: params.entidadId || '',
      monto: params.monto || 0,
      bancoId: params.bancoId || '',
      bancoNombre: params.bancoNombre || '',
      motivo: params.detalles || '',
      datosOperacion: params.datosOperacion ? JSON.stringify(params.datosOperacion) : '{}',
      estado: 'pendiente'
    })

    // Crear notificación para el aprobador
    await db.insert(notificaciones).values({
      id: `notif_${nanoid()}`,
      usuarioId: params.aprobadorId || '',
      tipo: 'aprobacion',
      prioridad: params.monto && params.monto > 50000 ? 'urgente' : 'alta',
      titulo: '🔐 Aprobación Requerida',
      mensaje: `${params.solicitanteNombre} solicita aprobación para ${params.operacion}`,
      modulo: params.modulo,
      entidadId: params.entidadId,
    })

    revalidatePath('/aprobaciones')
    return { exito: true, datos: { id } }
  } catch (error) {
    console.error('Error creando solicitud:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

/**
 * Aprueba o rechaza una solicitud
 */
export async function procesarAprobacion(params: {
  aprobacionId: string
  aprobadorId: string
  aprobadorNombre: string
  decision: 'aprobada' | 'rechazada'
  comentarios?: string
}): Promise<ResultadoAccion> {
  try {
    await db
      .update(aprobacionesPendientes)
      .set({
        estado: params.decision,
        resueltoPor: params.aprobadorId,
        resueltoNombre: params.aprobadorNombre,
        motivoRechazo: params.comentarios,
        fechaResolucion: new Date()
      })
      .where(eq(aprobacionesPendientes.id, params.aprobacionId))

    // Obtener la solicitud para notificar al solicitante
    const [solicitud] = await db
      .select()
      .from(aprobacionesPendientes)
      .where(eq(aprobacionesPendientes.id, params.aprobacionId))

    if (solicitud) {
      await db.insert(notificaciones).values({
        id: `notif_${nanoid()}`,
        usuarioId: solicitud.solicitanteId,
        tipo: params.decision === 'aprobada' ? 'success' : 'error',
        prioridad: 'alta',
        titulo: params.decision === 'aprobada' ? '✅ Solicitud Aprobada' : '❌ Solicitud Rechazada',
        mensaje: `Tu solicitud de ${solicitud.accion} ha sido ${params.decision} por ${params.aprobadorNombre}`,
        modulo: solicitud.modulo,
        entidadId: solicitud.entidadId ?? undefined,
      })
    }

    revalidatePath('/aprobaciones')
    return { exito: true }
  } catch (error) {
    console.error('Error procesando aprobación:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}

/**
 * Obtiene aprobaciones pendientes de un usuario
 */
export async function obtenerAprobacionesPendientes(aprobadorId: string): Promise<ResultadoAccion<typeof aprobacionesPendientes.$inferSelect[]>> {
  try {
    const pendientes = await db
      .select()
      .from(aprobacionesPendientes)
      .where(and(
        eq(aprobacionesPendientes.aprobadorRolId, aprobadorId),
        eq(aprobacionesPendientes.estado, 'pendiente')
      ))
      .orderBy(desc(aprobacionesPendientes.createdAt))

    return { exito: true, datos: pendientes }
  } catch (error) {
    console.error('Error obteniendo aprobaciones:', error)
    return { exito: false, error: error instanceof Error ? error.message : 'Error desconocido' }
  }
}
